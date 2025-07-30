import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import CardNextQueueDisplay from "@/Components/CardNextQueueDisplay";
import ApplicationHeader from "@/Components/ApplicationHeader";
import CounterCard from "@/Components/CounterCard";
import QueueCard from "@/Components/QueueCard";
import RealTimeClock from "@/Components/RealTimeClock";

export default function Display() {
    const { QueueNumbers } = usePage().props;
    const { OnCallQueueNumbers } = usePage().props;
    const { online_users: initialOnlineUsers } = usePage().props;
    const { branch_id: currentBranchId } = usePage().props;

    const [onlineUsers, setOnlineUsers] = useState(initialOnlineUsers || []);
    const [queueNumbers, setQueueNumbers] = useState(QueueNumbers || []);
    const [onCallQueues, setOnCallQueues] = useState(OnCallQueueNumbers || []);

    useEffect(() => {
        const channel = window.Echo.channel("login-status-updates");

        const listener = (event) => {
            if (
                event.login_status === "Online" &&
                event.counter_name &&
                event.branch_id === currentBranchId
            ) {
                speechSynthesis.cancel();

                const audio = new Audio("/audio/serving.wav");
                audio.volume = 1.0;

                audio.play().catch((err) => {
                    console.warn("[AUDIO] Could not play bell sound:", err);
                });

                audio.onended = () => {
                    const message = `${event.counter_name} is ready to serve.`;

                    const speakWithVoice = () => {
                        const utterance = new SpeechSynthesisUtterance(message);
                        utterance.lang = 'en-US';
                        utterance.pitch = 0.9;
                        utterance.rate = 0.95;
                        utterance.volume = 1.0;

                        const voices = window.speechSynthesis.getVoices();

                        const preferredVoiceNames = [
                            "Google UK English Female",
                            "Google US English",
                            "Microsoft Zira Desktop - English (United States)",
                            "Samantha",
                            "Karen"
                        ];

                        const femaleVoice = voices.find(voice =>
                            preferredVoiceNames.includes(voice.name)
                        );

                        const fallbackVoice = voices.find(v => v.lang === 'en-US');
                        utterance.voice = femaleVoice || fallbackVoice;

                        speechSynthesis.speak(utterance);
                    };

                    if (speechSynthesis.getVoices().length === 0) {
                        speechSynthesis.onvoiceschanged = speakWithVoice;
                    } else {
                        speakWithVoice();
                    }
                };
            }

            // Update online counters
            setOnlineUsers((prevUsers) => {
                const others = prevUsers.filter((u) => u.id !== event.id);

                if (event.login_status === "Online") {
                    return [
                        ...others,
                        {
                            id: event.id,
                            name: event.name,
                            counter_name: event.counter_name,
                            branch_id: event.branch_id,
                        },
                    ];
                }

                return others;
            });

            location.reload();
        };

        channel.listen(".UserOnlineStatusUpdated", listener);

        return () => {
            window.Echo.leave("login-status-updates");
        };
    }, [currentBranchId]);

    // Queue registration updates
    useEffect(() => {
        const channel = window.Echo.channel("queue-registration");

        const listener = (event) => {

            // Only accept if it's for this branch
            if (event.branch_id !== currentBranchId) return;

            if (event.queue_number.startsWith('P')) {
                location.reload();
            }

            setQueueNumbers((prev) => {
                const alreadyExists = prev.some((q) => q.id === event.id);
                if (alreadyExists) return prev;

                return [
                    ...prev,
                    {
                        id: event.id,
                        queue_number: event.queue_number,
                        lane_name: event.lane_name,
                        branch_id: event.branch_id,
                        status: event.status,
                    },
                ];
            });
        };

        channel.listen(".QueueRegistration", listener);

        return () => {
            window.Echo.leave("queue-registration");
        };
    }, [currentBranchId]);

    useEffect(() => {
        const servingChannel = window.Echo.channel("queue-call-serving");
        const completeChannel = window.Echo.channel("queue-complete-call-serving");

        const handleServing = (event) => {
            if (event.branch_id !== currentBranchId) return;

            // Update on-call queues
            setOnCallQueues((prev) => {
                const filtered = prev.filter((q) => q.counter_id !== event.counter_id);
                return [...filtered, event];
            });

            // Remove from waiting list
            setQueueNumbers((prev) => {
                return prev.filter((q) => q.id !== event.id);
            });
        };

        const handleComplete = (event) => {
            if (event.branch_id !== currentBranchId) return;

            // Remove from onCallQueues
            setOnCallQueues((prev) => {
                return prev.filter((q) => q.id !== event.id);
            });
        };

        servingChannel.listen(".QueueCallServing", handleServing);
        completeChannel.listen(".QueueCompleteCallServing", handleComplete);

        return () => {
            window.Echo.leave("queue-call-serving");
            window.Echo.leave("queue-complete-call-serving");
        };
    }, [currentBranchId]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Display
                </h2>
            }
        >
            <Head title="Display" />

            <ApplicationHeader
                title=""
                subtitle={
                    <>
                        <span className="text-lg inline-flex items-center gap-1 text-gray-700">
                            <i className="bi bi-clock"></i>
                            <RealTimeClock /> &nbsp;&nbsp;
                            <i className="bi bi-people"></i>
                            {queueNumbers.length} waiting
                        </span>
                    </>
                }
            />

            {/* Online counters */}
            <div className="grid grid-cols-1 md:grid-cols-3">
                {onlineUsers
                    .filter((user) => user.branch_id === currentBranchId)
                    .map((user) => {
                        const queue = onCallQueues.find(
                            (q) => q.counter_id === user.counter_id
                        );

                        return (
                            <CounterCard
                                key={user.id}
                                counterName={user.counter_name}
                                status={queue ? "serving" : "waiting"}
                                servingNumber={queue ? queue.queue_number : null}
                            />
                        );
                })}
            </div>

            {/* Next in queue */}
            <CardNextQueueDisplay>
                <div> 
                    <h1 className="text-2xl text-gray-500 font-extrabold mb-4">
                        NEXT IN QUEUE
                    </h1>
                    <div className="flex items-center justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-y-8 gap-x-8 pt-2">
                            {/* {queueNumbers.map((queu, index) => (
                                <QueueCard
                                    key={queu.id}
                                    number={queu.queue_number}
                                    service={queu.lane_name ?? queu.lane_type?.name ?? ""}
                                    isActive={index === 0}
                                />
                            ))} */}
                            {queueNumbers.map((queu, index) => (
                                <QueueCard
                                    key={queu.id}
                                    number={queu.queue_number}
                                    service={queu.lane_name ?? queu.lane_type?.name ?? ""}
                                    isActive={index === 0}
                                />
                            ))}

                        </div>
                    </div>
                </div>
            </CardNextQueueDisplay>

            <div className="text-center mb-8">
                <h1 className="text-xl text-gray-500">
                    Thank you for your patience • Please wait for your number to
                    be called
                </h1>
            </div>
        </AuthenticatedLayout>
    );
}
