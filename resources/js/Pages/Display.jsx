import { useEffect, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ApplicationHeader from "@/Components/ApplicationHeader";
import RealTimeClock from "@/Components/RealTimeClock";
import CardNextQueueDisplay from "@/Components/CardNextQueueDisplay";
import CounterCard from "@/Components/CounterCard";
import QueueCard from "@/Components/QueueCard";
import { Player } from "@lottiefiles/react-lottie-player";

export default function Display() {
    const {
        QueueNumbers = [],
        OnCallQueueNumbers = [],
        online_users = [],
        branch_id: currentBranchId,
    } = usePage().props;

    const [onlineUsers, setOnlineUsers] = useState(online_users);
    const [queueNumbers, setQueueNumbers] = useState(QueueNumbers);
    const [onCallQueues, setOnCallQueues] = useState(OnCallQueueNumbers);

    useEffect(() => {
        const channel = window.Echo.channel("login-status-updates");

        const listener = (event) => {
            if (event.branch_id === currentBranchId && event.counter_name) {
                speechSynthesis.cancel();

                const audio = new Audio("/audio/serving.wav");
                audio.volume = 1.0;

                audio
                    .play()
                    .catch((err) =>
                        console.warn("[AUDIO] Could not play bell sound:", err)
                    );

                audio.onended = () => {
                    const message = `${event.counter_name} is ready to serve.`;

                    const speakWithVoice = () => {
                        const utterance = new SpeechSynthesisUtterance(message);
                        utterance.lang = "en-US";
                        utterance.pitch = 0.9;
                        utterance.rate = 0.95;
                        utterance.volume = 1.0;

                        const voices = speechSynthesis.getVoices();
                        const preferredVoiceNames = [
                            "Google UK English Female",
                            "Google US English",
                            "Microsoft Zira Desktop - English (United States)",
                            "Samantha",
                            "Karen",
                        ];

                        utterance.voice =
                            voices.find((v) =>
                                preferredVoiceNames.includes(v.name)
                            ) || voices.find((v) => v.lang === "en-US");

                        speechSynthesis.speak(utterance);
                    };

                    if (speechSynthesis.getVoices().length === 0) {
                        speechSynthesis.onvoiceschanged = speakWithVoice;
                    } else {
                        speakWithVoice();
                    }
                };
            }

            // Update online users
            setOnlineUsers((prev) => {
                const others = prev.filter((u) => u.id !== event.id);
                return event.login_status === "Online"
                    ? [
                          ...others,
                          {
                              id: event.id,
                              name: event.name,
                              counter_name: event.counter_name,
                              counter_id: event.counter_id,
                              branch_id: event.branch_id,
                          },
                      ]
                    : others;
            });

            location.reload();
        };

        channel.listen(".UserOnlineStatusUpdated", listener);
        return () => window.Echo.leave("login-status-updates");
    }, [currentBranchId]);

    useEffect(() => {
        const channel = window.Echo.channel("queue-registration");

        const listener = (event) => {
            if (event.branch_id !== currentBranchId) return;

            setQueueNumbers((prev) => {
                if (prev.some((q) => q.id === event.id)) return prev;

                return [
                    ...prev,
                    {
                        id: event.id,
                        queue_number: event.queue_number,
                        lane_name: event.lane_name,
                        lane_type_id: event.lane_type_id,
                        status: event.status,
                        branch_id: event.branch_id,
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
        const completeChannel = window.Echo.channel(
            "queue-complete-call-serving"
        );

        servingChannel.listen(".QueueCallServing", (event) => {
            if (event.branch_id !== currentBranchId) return;

            setOnCallQueues((prev) => [
                ...prev.filter((q) => q.counter_id !== event.counter_id),
                event,
            ]);

            setQueueNumbers((prev) => prev.filter((q) => q.id !== event.id));
        });

        completeChannel.listen(".QueueCompleteCallServing", (event) => {
            if (event.branch_id !== currentBranchId) return;

            setOnCallQueues((prev) => prev.filter((q) => q.id !== event.id));
        });

        return () => {
            window.Echo.leave("queue-call-serving");
            window.Echo.leave("queue-complete-call-serving");
        };
    }, [currentBranchId]);

    const renderQueueSection = (label, color, typeId) => {
        const filteredQueues = queueNumbers.filter(
            (q) => q.lane_type_id === typeId
        );
        return (
            <CardNextQueueDisplay>
                <div>
                    <h1 className="text-[20px] text-gray-500 font-extrabold mb-3">
                        NEXT IN QUEUE
                    </h1>
                    <p className={`text-md mb-4 text-${color}-500`}>{label}</p>
                    <div className="flex items-center justify-center">
                        {filteredQueues.length === 0 ? (
                            <Player
                                autoplay
                                loop
                                src="/img/waiting.json"
                                style={{ height: "90px", width: "300px" }}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {filteredQueues.map((queu, index) => (
                                    <QueueCard
                                        key={queu.id}
                                        number={queu.queue_number}
                                        service={
                                            queu.lane_name ??
                                            queu.lane_type?.name ??
                                            ""
                                        }
                                        isActive={index === 0}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardNextQueueDisplay>
        );
    };

    const onlineBranchUsers = onlineUsers.filter(
        (user) => user.branch_id === currentBranchId
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">Display</h2>
            }
        >
            <Head title="Display" />
            <ApplicationHeader
                title=""
                subtitle={
                    <span className="text-lg inline-flex items-center gap-1 text-gray-700">
                        <i className="bi bi-clock" />
                        <RealTimeClock /> &nbsp;&nbsp;
                        <i className="bi bi-people" />
                        {queueNumbers.length} waiting
                    </span>
                }
            />

            {onlineBranchUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 mb-3">
                    {onlineBranchUsers.map((user) => {
                        const queue = onCallQueues.find(
                            (q) => q.counter_id === user.counter_id
                        );

                        return (
                            <CounterCard
                                key={user.id}
                                counterName={user.counter_name}
                                status={queue ? "serving" : "waiting"}
                                servingNumber={queue?.queue_number || null}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="mt-4 mb-14 flex justify-center">
                    <Player
                        autoplay
                        loop
                        src="/img/queue-timer.json"
                        className="w-auto h-[200px] md:h-[300px]"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2">
                {renderQueueSection("REGULAR LANE", "gray", 2)}
                {renderQueueSection("PRIORITY LANE", "gray", 1)}
            </div>

            <div className="text-center mb-8">
                <h1 className="text-xl text-gray-500">
                    Thank you for your patience • Please wait for your number to
                    be called
                </h1>
            </div>
        </AuthenticatedLayout>
    );
}
