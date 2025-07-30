import { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import ApplicationHeader from "@/Components/ApplicationHeader";
import CardDisplay from "@/Components/CardDisplay";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import QueueCardList from "@/Components/QueueCardList";
import { toast, ToastContainer } from 'react-toastify';
import Modal from "@/Components/Modal";

export default function ServiceCounter() {
    const { QueueNumbers } = usePage().props;
    const { OnCallQueueNumbers } = usePage().props;
    const { branch_id: currentBranchId } = usePage().props;
    const [queueNumbers, setQueueNumbers] = useState(QueueNumbers || []);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const handleCallNext = () => {
        if (queueNumbers.length === 0) return;
        const nextQueue = queueNumbers[0];

        router.post(
            route('queue.service-counter.call'),
            {
                id: nextQueue.id,
                status: 'serving',
            },
            {
                onSuccess: () => {
                    toast.success(`Customer ${nextQueue.queue_number} called successfully.`);

                    const audio = new Audio('/audio/serving.wav');
                    audio.play();

                    audio.onended = () => {
                        const counterName = nextQueue.counter?.name || 'the counter';
                        const message = `Customer number ${nextQueue.queue_number}, you are now being served. Please proceed to ${counterName}. Thank you.`;

                        const speakWithVoice = () => {
                            const utterance = new SpeechSynthesisUtterance(message);
                            utterance.lang = 'en-US';
                            utterance.pitch = 0.9;  // Slightly deeper
                            utterance.rate = 0.95;  // A bit slower and clearer
                            utterance.volume = 1.0; // Full volume

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

                            window.speechSynthesis.speak(utterance);
                        };

                        if (window.speechSynthesis.getVoices().length === 0) {
                            window.speechSynthesis.onvoiceschanged = speakWithVoice;
                        } else {
                            speakWithVoice();
                        }
                    };
                },
                onError: (errors) => {
                    if (errors && typeof errors === "object") {
                        Object.values(errors).forEach((errMsg) => {
                            toast.error(errMsg);
                        });
                    } else {
                        toast.error("Failed to call the customer.");
                    }
                }
            }
        );
    };

    const handleCompleteService = (response, reason = '') => {
        const currentQueue = OnCallQueueNumbers[0];
        if (!currentQueue) return;

        router.post(
            route('queue.service-counter.complete'),
            {
                id: currentQueue.id,
                decision: response,
                reason: reason, 
            },
            {
                onSuccess: () => {
                    const action = response === 'yes' ? 'completed' : 'cancelled';
                    toast.success(`Customer ${currentQueue.queue_number} marked as ${action}.`);
                    setShowReasonInput(false);
                    setCancelReason('');
                },
                onError: (errors) => {
                    if (errors && typeof errors === "object") {
                        Object.values(errors).forEach((errMsg) => {
                            toast.error(errMsg);
                        });
                    } else {
                        toast.error("Failed to update the service.");
                    }
                }
            }
        );
    };

    const handleCallAgain = (currentQueue) => {
        const audio = new Audio('/audio/serving.wav');
        audio.play();

        audio.onended = () => {
            const counterName = currentQueue.counter?.name || 'the counter';
            const message = `Again, Customer number ${currentQueue.queue_number}, please proceed to ${counterName}. This is a repeat call.`;

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
                    "Karen",
                ];

                const femaleVoice = voices.find(voice =>
                    preferredVoiceNames.includes(voice.name)
                );

                const fallbackVoice = voices.find(v => v.lang === 'en-US');
                utterance.voice = femaleVoice || fallbackVoice;
                window.speechSynthesis.speak(utterance);
            };

            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = speakWithVoice;
            } else {
                speakWithVoice();
            }
        };

        toast.info(`Called again: Customer ${currentQueue.queue_number}`);
    };

    //update queue list when regestered
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

    // update Queue list when call 
    useEffect(() => {
        const channel = window.Echo.channel("queue-call-serving");

        const listener = (event) => {
            if (event.branch_id !== currentBranchId) return;

            // REMOVE the called queue from the waiting list
            setQueueNumbers((prev) => {
                return prev.filter((q) => q.id !== event.id);
            });
        };

        channel.listen(".QueueCallServing", listener);

        return () => {
            window.Echo.leave("queue-call-serving");
        };
    }, [currentBranchId]);

    return (
        <AuthenticatedLayout
        header={
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Service Counter
                </h2>
            }
            >
            <ToastContainer position="top-right" autoClose={3000} />
            <Head title="Service Counter" />

            <ApplicationHeader
                title=""
                subtitle={
                    <span className="text-lg text-gray-700">
                        Queue Management Service Counter Control.
                    </span>
                }
            />
            <div className="mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CardDisplay className="mt-5">
                        <div className="flex items-center justify-start">
                            <img src="https://cdn-icons-gif.flaticon.com/15700/15700479.gif" className="w-12 me-2" alt="" />
                            <h1 className="text-gray-800 text-xl font-extrabold">
                                Current Customer Serving
                            </h1>
                        </div>

                        {/* Serving Content */}
                        {OnCallQueueNumbers.length > 0 ? (
                            <div className="flex items-start justify-between animate-pulse bg-gray-50 rounded-md my-2">
                                {OnCallQueueNumbers.map((call, index) => (
                                    <div key={index} className="flex justify-between w-full">
                                        <div className="p-4 text-start">
                                            <h1 className="text-blue-500 font-extrabold text-3xl">
                                                {call.queue_number}
                                            </h1>
                                            <p className="text-md font-bold uppercase text-gray-700">
                                                {call.lane_type?.name}
                                            </p>
                                            <p className="text-gray-400">
                                                {call.service_type?.name}
                                            </p>
                                        </div>

                                        <div className="p-4">
                                            <span className="bg-gray-200 rounded-xl px-3 py-1 text-sm font-bold">
                                                {call.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center bg-gray-100 rounded-md my-4 py-8">
                                <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" className="w-16 h-16 mb-3 opacity-40" alt="No customer" />
                                <p className="text-gray-400 font-semibold">No customer is currently being served</p>
                            </div>
                        )}

                        {/* Buttons only if there's someone being served */}
                        {OnCallQueueNumbers.length > 0 && (
                            <div className="flex items-center justify-between mt-4 gap-2">
                                <div className="flex-grow">
                                    <PrimaryButton
                                        className="w-full flex justify-center items-center"
                                        onClick={() => setShowConfirmModal(true)}
                                    >
                                        <i className="bi bi-check2-circle me-1"></i>
                                        Complete Service
                                    </PrimaryButton>
                                </div>
                                <div>
                                    <SecondaryButton>
                                        <i className="bi bi-x-circle me-1"></i>
                                        Cancel
                                    </SecondaryButton>
                                </div>
                            </div>
                        )}
                    </CardDisplay>

                    <CardDisplay className="mt-5">
                        <div className="flex items-center justify-start">
                            <img src="https://cdn-icons-gif.flaticon.com/15747/15747228.gif" className="w-10 me-2" alt="" />
                            <h1 className="text-gray-800 text-xl font-extrabold">
                                Queue Call Control
                            </h1>
                        </div>
                        <div className="flex items-center justify-between mt-3 gap-2">
                            <div className="flex-grow">
                                {/* Call Next Customer */}
                                <PrimaryButton
                                    className="w-full flex justify-center items-center"
                                    onClick={handleCallNext}
                                    disabled={OnCallQueueNumbers.length > 0}
                                >
                                    <i className="bi bi-telephone-inbound-fill me-1"></i>
                                    Call Next Customer
                                </PrimaryButton>

                                {OnCallQueueNumbers.length > 0 && (
                                <PrimaryButton
                                    className="w-full mt-3 flex justify-center items-center"
                                    onClick={() => handleCallAgain(OnCallQueueNumbers[0])}
                                >
                                    <i className="bi bi-arrow-repeat me-1"></i>
                                    Call Again
                                </PrimaryButton>
                                )}

                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 gap-2">
                            <div className="flex-grow">
                                <SecondaryButton className="w-full flex justify-center items-center">
                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                    Reset
                                </SecondaryButton>
                            </div>
                        </div>

                        <div className="mt-7">
                            <h1 className="text-start mb-2 font-extrabold">Queue List ({QueueNumbers.length})</h1>
                            {queueNumbers.map((q, idx) => (
                                <QueueCardList
                                    key={idx}
                                    number={q.queue_number }
                                    // service={q.service_type?.name}
                                    lane={q.lane_name ?? q.lane_type?.name ?? ""}
                                    isActive={idx === 0}
                                    onRemove={() => alert(`Removed #${q.queue_number}`)}
                                />
                            ))}
                        </div>
                    </CardDisplay>
                </div>
            </div>
            <Modal
                show={showConfirmModal || showReasonInput}
                maxWidth="md"
                onClose={() => {
                    setShowConfirmModal(false);
                    setShowReasonInput(false);
                    setCancelReason('');
                }}
            >
                <div className="p-6">
                    {!showReasonInput ? (
                        <>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Do you want to proceed to repair?
                            </h2>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setShowReasonInput(true);
                                    }}
                                >
                                    No
                                </button>

                                <button
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        handleCompleteService('yes');
                                    }}
                                >
                                    Yes, Proceed
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-lg font-semibold text-red-600 mb-2">Cancel Service</h2>
                            <p className="text-gray-600 mb-4">Please select a reason for not proceeding to repair:</p>

                            <select
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            >
                                <option value="" disabled>Select a reason</option>
                                <option value="Inquiry Only">Inquiry Only</option>
                                <option value="Leadtime Concern">Leadtime Concern</option>
                            </select>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                    onClick={() => {
                                        setShowReasonInput(false);
                                        setCancelReason('');
                                    }}
                                >
                                    Back
                                </button>

                                <button
                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                    onClick={() => {
                                        if (!cancelReason.trim()) {
                                            toast.error("Please enter a reason.");
                                            return;
                                        }

                                        setShowReasonInput(false);
                                        handleCompleteService('no', cancelReason);
                                    }}
                                >
                                    Submit Reason
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
