import { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import ApplicationHeader from "@/Components/ApplicationHeader";
import CardDisplay from "@/Components/CardDisplay";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import QueueCardList from "@/Components/QueueCardList";
import { toast, ToastContainer } from "react-toastify";
import Modal from "@/Components/Modal";
import ServiceOptionCard from "@/Components/ServiceOptionCard";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import Select2Field from "@/Components/Select2Field";
import PricingTable from "@/Components/PricingTable";
import { Player } from "@lottiefiles/react-lottie-player";

export default function ServiceCounter() {
    const {flash = {} } = usePage().props;
    const {QueueTodaysLogs} = usePage().props;
    const {QueueTodaysUnserved} = usePage().props;
    const {QueueNumbers} = usePage().props;
    const {OnCallQueueNumbers} = usePage().props;
    const {QueueServiceType} = usePage().props;
    const { branch_id: currentBranchId } = usePage().props;
    const [queueNumbers, setQueueNumbers] = useState(QueueNumbers || []);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAssitCustomerModal, setshowAssitCustomerModal] = useState(false);
    const [showCancelModal, setshowCancelModal] = useState(false);
    const [showUnserveCancelModal, setshowUnserveCancelModal] = useState(false);
    const [showCompleteConfirmationModal, setshowCompleteConfirmationModal] = useState(false);
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFormAfterScan, setShowFormAfterScan] = useState(false);
    const [showServiceFeeForm, setShowServiceFeeForm] = useState(false);
    const [showPickUpRepair, setshowPickUpRepair] = useState(false);
    const [input, setInput] = useState("");

    const handleCallNext = () => {
        if (queueNumbers.length === 0) return;
        const nextQueue = queueNumbers[0];

        router.post(
            route("queue.service-counter.call"),
            {
                id: nextQueue.id,
                status: "serving",
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Customer ${nextQueue.queue_number} called successfully.`
                    );

                    const audio = new Audio("/audio/serving.wav");
                    audio.play();

                    audio.onended = () => {
                        const counterName =
                            nextQueue.counter?.name || "the counter";
                        const message = `Customer number ${nextQueue.queue_number}, you are now being served. Please proceed to ${counterName}. Thank you.`;

                        const speakWithVoice = () => {
                            const utterance = new SpeechSynthesisUtterance(
                                message
                            );
                            utterance.lang = "en-US";
                            utterance.pitch = 0.9; // Slightly deeper
                            utterance.rate = 0.95; // A bit slower and clearer
                            utterance.volume = 1.0; // Full volume

                            const voices = window.speechSynthesis.getVoices();

                            const preferredVoiceNames = [
                                "Google UK English Female",
                                "Google US English",
                                "Microsoft Zira Desktop - English (United States)",
                                "Samantha",
                                "Karen",
                            ];

                            const femaleVoice = voices.find((voice) =>
                                preferredVoiceNames.includes(voice.name)
                            );

                            const fallbackVoice = voices.find(
                                (v) => v.lang === "en-US"
                            );
                            utterance.voice = femaleVoice || fallbackVoice;

                            window.speechSynthesis.speak(utterance);
                        };

                        if (window.speechSynthesis.getVoices().length === 0) {
                            window.speechSynthesis.onvoiceschanged =
                                speakWithVoice;
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
                },
            }
        );
    };

    const handleCompleteService = (response, reason = "") => {
        const currentQueue = OnCallQueueNumbers[0];
        if (!currentQueue) return;

        router.post(
            route("queue.service-counter.complete"),
            {
                id: currentQueue.id,
                decision: response,
                reason: reason,
            },
            {
                onSuccess: () => {
                    const action =
                        response === "yes" ? "For Repair" : "cancelled";
                    toast.success(
                        `Customer ${currentQueue.queue_number} marked as ${action}.`
                    );
                    setShowReasonInput(false);
                    setshowCancelModal(false);
                    setshowAssitCustomerModal(false);
                    setCancelReason("");
                },
                onError: (errors) => {
                    if (errors && typeof errors === "object") {
                        Object.values(errors).forEach((errMsg) => {
                            toast.error(errMsg);
                        });
                    } else {
                        toast.error("Failed to update the service.");
                    }
                },
            }
        );
    };

    const handlemarkQueueUnserve = (id) => {
        if (!id) return;

        router.post(
            route("queue.service-counter.unserved"),
            {
                id: id,
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Queue Number hass been marked as Unserved.`
                    );
                    setshowUnserveCancelModal(false);
                },
                onError: (errors) => {
                    if (errors && typeof errors === "object") {
                        Object.values(errors).forEach((errMsg) => {
                            toast.error(errMsg);
                        });
                    } else {
                        toast.error("Failed to update the service.");
                    }
                },
            }
        );
    };

    const handleCompleteServingQueu = (id) => {
        if (!id) return;

        router.post(
            route("queue.service-counter.completeServingPlane"),
            {
                id: id,
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Queue Number hass been marked as Completed.`
                    );
                    setshowCompleteConfirmationModal(false);
                },
                onError: (errors) => {
                    if (errors && typeof errors === "object") {
                        Object.values(errors).forEach((errMsg) => {
                            toast.error(errMsg);
                        });
                    } else {
                        toast.error("Failed to update the service.");
                    }
                },
            }
        );
    };

    const handleCallAgain = (currentQueue) => {
        const audio = new Audio("/audio/serving.wav");
        audio.play();

        audio.onended = () => {
            const counterName = currentQueue.counter?.name || "the counter";
            const message = `Again, Customer number ${currentQueue.queue_number}, please proceed to ${counterName}. Thank You.`;

            const speakWithVoice = () => {
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.lang = "en-US";
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

                const femaleVoice = voices.find((voice) =>
                    preferredVoiceNames.includes(voice.name)
                );

                const fallbackVoice = voices.find((v) => v.lang === "en-US");
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

            if (event.queue_number.startsWith("P")) {
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

    const { QueueModelList, QueueIssueDescriptions } = usePage().props;
    const modelOptions = QueueModelList.map((item) => ({
        value: item.id,
        label: item.name,
    }));

    const issueOptions = QueueIssueDescriptions.map((item) => ({
        value: item.id,
        label: item.name,
    }));

    const [form, setForm] = useState({
        queue_num_id: "",
        first_name: "",
        last_name: "",
        birth_date: "",
        contact: "",
        service_type_id: "",
        model_ids: [],
        issue_ids: [],
    });

    const handleServiceClick = (id) => {
        setForm((prev) => ({
            ...prev,
            service_type_id: id,
        }));
        setSelectedServiceId(id)
    };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true); 
        const queue_id = OnCallQueueNumbers?.[0]?.id || "";

        router.post(route("queue.service-counter.update.priority"), {
            ...form,
            queue_num_id: queue_id,
        }, {
            onSuccess: () => {
                toast.success("Form submitted successfully!");
                setIsSubmitting(false);
                setshowAssitCustomerModal(false);
            },
            onError: (errors) => {
                toast.error("Please check the form and try again.");
                setIsSubmitting(false);
            },
        });
    };

     useEffect(() => {
        if (input.length === 10) {
            router.post(route('queue.check.pickup'), { code: input }, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
        }
    }, [input]);

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
                    <div className="grid grid-cols-1 gap-4">
                        <CardDisplay className="mt-5">
                            <div className="flex items-center justify-start">
                                <img
                                    src="https://cdn-icons-gif.flaticon.com/15700/15700479.gif"
                                    className="w-12 me-2"
                                    alt=""
                                />
                                <h1 className="text-gray-800 text-xl font-extrabold">
                                    Current Customer Serving
                                </h1>
                            </div>

                            {/* Serving Content */}
                            {OnCallQueueNumbers.length > 0 ? (
                                <div className="flex items-start justify-between animate-pulse bg-gray-50 rounded-md my-2">
                                    {OnCallQueueNumbers.map((call, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between w-full"
                                        >
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
                                                <span className={`${call.status === "serving" ? "bg-gray-200" : "bg-green-400 text-white"} rounded-xl px-3 py-1 text-sm font-bold`}>
                                                    {call.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center bg-gray-100 rounded-md my-4 py-8">
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                                        className="w-16 h-16 mb-3 opacity-40"
                                        alt="No customer"
                                    />
                                    <p className="text-gray-400 font-semibold">
                                        No customer is currently being served
                                    </p>
                                </div>
                            )}

                            {/* Buttons only if there's someone being served */}
                            {OnCallQueueNumbers.length > 0 && (
                                <div className="flex items-center justify-between mt-4 gap-2">
                                    <div className="flex-grow">
                                        {OnCallQueueNumbers[0].lane_type_id == 2 && OnCallQueueNumbers[0].status == "serving" && (
                                            <PrimaryButton
                                                className="w-full flex justify-center items-center"
                                                onClick={() =>
                                                    setShowConfirmModal(true)
                                                }
                                            >
                                                <i className="bi bi-check2-circle me-1"></i>
                                                Complete Service
                                            </PrimaryButton>
                                        )}

                                        {OnCallQueueNumbers[0].lane_type_id == 1 && OnCallQueueNumbers[0].service_type_id == null && OnCallQueueNumbers[0].status == "serving" && (
                                            <PrimaryButton
                                                className="w-full flex justify-center items-center"
                                                onClick={() =>
                                                    setshowAssitCustomerModal(true)
                                                }
                                            >
                                                <i className="bi bi-pencil-square me-1"></i>
                                                Assist Priority Customer
                                            </PrimaryButton>
                                        )}

                                        {OnCallQueueNumbers[0].status === "For Repair" && (
                                            <a
                                                className="w-full justify-center inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900"
                                                href={`/redirect-to-site2/${OnCallQueueNumbers[0].id}`}
                                                target="_blank"
                                            >
                                                Start Receiving Form
                                                <i className="fas fa-long-arrow-right ms-2"></i>
                                            </a>
                                        )}

                                    </div>
                                    <div>
                                        {OnCallQueueNumbers[0].status !== "For Repair" && (
                                            <SecondaryButton
                                                onClick={() => setshowUnserveCancelModal(true)}
                                            >
                                                <i className="bi bi-x-circle me-1"></i>
                                                Cancel
                                            </SecondaryButton>
                                        )}

                                        {OnCallQueueNumbers[0].status === "For Repair" && (
                                            <PrimaryButton
                                                className="w-full flex justify-center items-center"
                                                onClick={() =>
                                                    setshowCompleteConfirmationModal(true)
                                                }
                                            >
                                                <i className="bi bi-check2-circle me-1"></i>
                                                Complete Queue
                                            </PrimaryButton>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardDisplay>

                        <CardDisplay className="mt-5">
                            <div className="flex items-center justify-start">
                                <img
                                    src="https://cdn-icons-gif.flaticon.com/14673/14673993.gif"
                                    className="w-10 me-2"
                                    alt=""
                                />
                                <h1 className="text-gray-800 text-xl font-extrabold">
                                    Other Controls
                                </h1>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <div className="mt-5 text-start">
                                    <h4 className="text-gray-800 mb-2">
                                        Today's Serving Logs
                                    </h4>
                                   {QueueTodaysLogs.length > 0 ? (
                                        QueueTodaysLogs.map((logs, index) => {
                                            const currentCompletedAt = new Date(logs.completed_at);
                                            let timeSinceLast = null;

                                            if (index < QueueTodaysLogs.length - 1) {
                                            const nextCompletedAt = new Date(QueueTodaysLogs[index + 1].completed_at);
                                            const diffMs = currentCompletedAt - nextCompletedAt;
                                            const diffMins = Math.floor(diffMs / 60000); // convert ms to minutes
                                            const diffSecs = Math.floor((diffMs % 60000) / 1000);

                                            timeSinceLast = `${diffMins}m ${diffSecs}s after previous queue`;
                                            }

                                            return (
                                            <div key={logs.id ?? index} className="bg-green-100 p-3 rounded-md shadow-md mb-4">
                                                <div className="flex items-center justify-between">
                                                <h1 className="font-bold">{logs.queue_number}</h1>
                                                <span
                                                    className={`${
                                                    logs.status === "completed" ? "bg-green-500" : "bg-red-500"
                                                    } py-1 px-2 rounded-lg text-[10px] font-semibold text-white uppercase`}
                                                >
                                                    {logs.status}
                                                </span>
                                                </div>
                                                <h4 className="text-sm text-gray-500 capitalize">
                                                {logs.lane_type?.name + " Lane" ?? "Lane"} -{" "}
                                                {logs.service_type?.name ?? "Service"}
                                                </h4>
                                                <small>
                                                Completed At: {currentCompletedAt.toLocaleString()}
                                                </small>
                                                {timeSinceLast && (
                                                <div className="text-xs text-gray-600 mt-1 italic">
                                                    ⏱ {timeSinceLast}
                                                </div>
                                                )}
                                            </div>
                                            );
                                        })
                                        ) : (
                                        <div className="bg-gray-100 text-gray-500 text-center p-6 rounded-md shadow-inner">
                                            <img
                                            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                                            alt="No data"
                                            className="w-16 mx-auto mb-3 opacity-60"
                                            />
                                            <p className="text-sm">There are no logs to display for today.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-5 text-start">
                                    <h4 className="text-gray-800 mb-2">
                                        Unserved Queue Numbers
                                    </h4>
                                    {QueueTodaysUnserved.length > 0 ? (
                                        QueueTodaysUnserved.map((unserved, index) => {
                                            return (
                                                <div key={unserved.id ?? index} className="bg-yellow-100 p-3 rounded-md shadow-md mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <h1 className="font-bold">{unserved.queue_number}</h1>
                                                        <span
                                                            className={`bg-orange-500 py-1 px-2 rounded-lg text-[10px] font-semibold text-white uppercase`}
                                                        >
                                                            {unserved.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm text-gray-500 capitalize">
                                                        {unserved.lane_type?.name + " Lane" ?? "Lane"} -{" "}
                                                        {unserved.service_type?.name ?? "Service"}
                                                    </h4>
                                                    <small>Called At: {unserved.called_at} </small>
                                                    <div className="text-xs text-gray-600 mt-1 italic">
                                                        Call Count: 3 times
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="bg-gray-100 text-gray-500 text-center p-6 rounded-md shadow-inner">
                                            <img
                                                src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                                                alt="No data"
                                                className="w-16 mx-auto mb-3 opacity-60"
                                            />
                                            <p className="text-sm">No Unserved Queue to display for today.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardDisplay>
                    </div>

                    <CardDisplay className="mt-5">
                        <div className="flex items-center justify-start">
                            <img
                                src="https://cdn-icons-gif.flaticon.com/15747/15747228.gif"
                                className="w-10 me-2"
                                alt=""
                            />
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
                                        onClick={() =>
                                            handleCallAgain(
                                                OnCallQueueNumbers[0]
                                            )
                                        }
                                    >
                                        <i className="bi bi-arrow-repeat me-1"></i>
                                        Call Again
                                    </PrimaryButton>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 gap-2">
                            <div className="flex-grow">
                                <SecondaryButton 
                                    className="w-full flex justify-center items-center"
                                    onClick={() => location.reload()}
                                >
                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                    Refresh
                                </SecondaryButton>
                            </div>
                        </div>

                        <div className="mt-7">
                            <h1 className="text-start mb-2 font-extrabold">
                                Queue List ({QueueNumbers.length})
                            </h1>
                            <div className="grid col-span-1 md:grid-cols-2 gap-2">
                                {queueNumbers.map((q, idx) => (
                                    <QueueCardList
                                        key={idx}
                                        number={q.queue_number}
                                        // service={q.service_type?.name}
                                        lane={
                                            q.lane_name ??
                                            q.lane_type?.name ??
                                            ""
                                        }
                                        isActive={idx === 0}
                                    />
                                ))}
                            </div>
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
                    setCancelReason("");
                    setOtherReason("");
                }}
            >
                <div className="p-6">
                    {!showReasonInput ? (
                        <>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                Do you want to proceed to repair?
                            </h2>
                            <p className="text-center mb-4 text-sm">
                                If Yes, pleaset click the "Yes, Proceed" button. Otherwise just click the No, Sorry button and chose a reason. Thank You!
                            </p>
                            <div className="flex items-center justify-center">
                                <img src="https://cdn-icons-png.flaticon.com/128/8598/8598993.png" className="w-24" alt="" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setShowReasonInput(true);
                                    }}
                                >
                                    <i className="bi bi-hand-thumbs-down me-1"></i>
                                    No, Sorry
                                </button>

                                <button
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        handleCompleteService("yes");
                                    }}
                                >
                                    <i className="bi bi-hand-thumbs-up me-1"></i>
                                    Yes, Proceed
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-lg font-semibold text-red-600 mb-2">
                                Not Proceeding Service
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Please select a reason for not proceeding to
                                repair:
                            </p>

                            <select
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring"
                                value={cancelReason}
                                onChange={(e) =>
                                    setCancelReason(e.target.value)
                                }
                            >
                                <option value="" disabled>
                                    Select a reason
                                </option>
                                <option value="Inquiry Only">
                                    Inquiry Only
                                </option>
                                <option value="Leadtime Concern">
                                    Leadtime Concern
                                </option>
                                <option value="Others">Others</option>
                            </select>

                            {cancelReason === "Others" && (
                                <input
                                    type="text"
                                    className="w-full mt-3 border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring"
                                    placeholder="Please specify other reason"
                                    value={otherReason}
                                    onChange={(e) =>
                                        setOtherReason(e.target.value)
                                    }
                                />
                            )}

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                    onClick={() => {
                                        setShowReasonInput(false);
                                        setCancelReason("");
                                        setOtherReason("");
                                    }}
                                >
                                    Back
                                </button>

                                <button
                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                    onClick={() => {
                                        if (!cancelReason.trim()) {
                                            toast.error(
                                                "Please select a reason."
                                            );
                                            return;
                                        }

                                        if (
                                            cancelReason === "Others" &&
                                            !otherReason.trim()
                                        ) {
                                            toast.error(
                                                "Please specify the other reason."
                                            );
                                            return;
                                        }

                                        setShowReasonInput(false);
                                        handleCompleteService(
                                            "no",
                                            cancelReason === "Others"
                                                ? otherReason
                                                : cancelReason
                                        );
                                    }}
                                >
                                    Submit Reason
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <Modal
                show={showAssitCustomerModal}
                maxWidth="2xl"
                onClose={() => setshowAssitCustomerModal(false)}
            >
                <div className="p-8">
                    {/* Service Selection */}
                    {selectedServiceId === null && (
                        <div>
                            <div className="flex items-start justify-start">
                                <img src="https://cdn-icons-png.flaticon.com/128/9684/9684929.png" className="w-5 mt-1" alt="" />
                                <h2 className="text-lg ms-2 font-semibold text-gray-800 mb-4 text-start uppercase">
                                    Choose Services
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                                {QueueServiceType.map((service) => (
                                    <ServiceOptionCard
                                        key={service.id}
                                        id={service.id}
                                        title={service.name}
                                        image={service.imgurl}
                                        onChange={() => handleServiceClick(service.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* QR SCANNER FOR FOLLOW UP REPAIR STATUS */}
                    {selectedServiceId === 2 && !showFormAfterScan && (
                        <div className="text-center">
                            <button
                                className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                                onClick={() => setSelectedServiceId(null)}
                            >
                                <i className="fas fa-arrow-left mr-2"></i> Back to Service Selection
                            </button>
                            <h3 className="text-xl font-black text-gray-700 mb-5">
                                Track Your Repair? Scan Here.
                            </h3>
                            <div className="flex items-center justify-center mb-2">
                                <img
                                    src="/img/qr-repair-tracker.png"
                                    className="w-44 h-44 object-contain"
                                    alt=""
                                />
                            </div>
                            <small className="text-md font-semibold">
                                or visit{" "}
                                <a
                                    className="text-blue-500"
                                    href="https://tickets.beyondthebox.ph/customer-jo-tracker"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i>https://tickets.beyondthebox.ph/customer-jo-tracker</i>
                                </a>
                            </small>
                            <div className="mt-3">
                                <p className="mb-3">
                                    Poceed with repair? Tap the proceed button and fill out the form. 
                                </p>
                                <SecondaryButton onClick={() => setshowCancelModal(true)} className="me-4">
                                    <i className="bi bi-x-circle me-2"></i>
                                    No, cancel
                                </SecondaryButton>
                                <PrimaryButton onClick={() => setShowFormAfterScan(true)}>
                                    proceed
                                    <i className="fas fa-arrow-right ms-2"></i>
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {selectedServiceId === 3 && !showServiceFeeForm && (
                        <div className="text-center">
                            <button
                                className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                                onClick={() => setSelectedServiceId(null)}
                            >
                                <i className="fas fa-arrow-left mr-2"></i> Back to Service Selection
                            </button>
                            <h3 className="text-xl font-black text-gray-700 mb-5">
                                Service Fee Menu
                            </h3>
                            <PricingTable />
                            <div className="mt-3">
                                <p className="mb-3">
                                    Want to proceed for repair? please click the proceed button and <br /> fill out all the requirements. 
                                </p>
                                <SecondaryButton onClick={() => setshowCancelModal(true)} className="me-4">
                                    <i className="bi bi-x-circle me-2"></i>
                                    No, cancel
                                </SecondaryButton>
                                <PrimaryButton onClick={() => setShowServiceFeeForm(true)}>
                                    Proceed
                                    <i className="fas fa-arrow-right ms-2"></i>
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {selectedServiceId === 4 && !showPickUpRepair && (
                        <div className="text-center">
                            <button
                                className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                                onClick={() => setSelectedServiceId(null)}
                            >
                                <i className="fas fa-arrow-left mr-2"></i> Back to Service Selection
                            </button>
                            <h3 className="text-xl font-black text-gray-700 mb-5">
                                Pick Up Repair
                            </h3>
                            <Player
                                autoplay
                                loop
                                src="/img/scanning_jo.json"
                                style={{ height: "100px", width: "400px" }}
                            />
                            <div>
                                <TextInput
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Enter 10-digits reference code"
                                    maxLength={10}
                                    className="w-[350px] text-center"
                                />
                                {flash.success && (
                                    <div className="mt-2 text-green-600 text-lg">
                                        <i className="bi bi-check2-circle mr-2 text-lg font-semibold"></i>
                                        {flash.success}
                                    </div>
                                )}
                                {flash.error && (
                                    <div className="mt-2 text-red-600 text-lg">
                                        <i className="bi bi-emoji-frown mr-2 text-lg font-semibold"></i>
                                        {flash.error}
                                    </div>
                                )}
                            </div>
                            <div className="mt-3">
                                <p className="mb-3">
                                    Ready to pick up repair? please click the proceed button and <br /> fill out all the requirements. 
                                </p>
                                <SecondaryButton onClick={() => setshowCancelModal(true)} className="me-4">
                                    <i className="bi bi-x-circle me-2"></i>
                                    No, cancel
                                </SecondaryButton>
                                <PrimaryButton onClick={() => setshowPickUpRepair(true)}>
                                    Proceed
                                    <i className="fas fa-arrow-right ms-2"></i>
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* Form (after clicking Generate or service ID is 1) */}
                    {(
                        selectedServiceId === 1 ||
                        (selectedServiceId === 2 && showFormAfterScan) ||
                        (selectedServiceId === 3 && showServiceFeeForm) ||
                        (selectedServiceId === 4 && showPickUpRepair)
                    ) && (
                        <div>
                            <button
                                className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                                onClick={() => {
                                    setShowFormAfterScan(false);
                                    setShowServiceFeeForm(false);
                                    setshowPickUpRepair(false);
                                    setSelectedServiceId(null);
                                }}
                            >
                                <i className="fas fa-arrow-left mr-2"></i> Back to Service Selection
                            </button>

                            <h3 className="text-xl text-center font-semibold text-gray-700 mb-2">
                                Fill out Customer Information
                            </h3>

                            <form onSubmit={handleSubmit} className="text-start bg-gray-100 rounded-lg p-8">
                                <input
                                    type="hidden"
                                    name="queue_num_id"
                                    value={OnCallQueueNumbers?.[0]?.id || ""}
                                />

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="FirstName" value="First Name" />
                                        <TextInput
                                            id="first_name"
                                            type="text"
                                            name="first_name"
                                            className="mt-1 block w-full"
                                            value={form.first_name}
                                            onChange={(e) => handleFormChange("first_name", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="LastName" value="Last Name" />
                                        <TextInput
                                            id="last_name"
                                            type="text"
                                            name="last_name"
                                            className="mt-1 block w-full"
                                            value={form.last_name}
                                            onChange={(e) => handleFormChange("last_name", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="birthdate" value="Birth Date" />
                                        <TextInput
                                            id="birth_date"
                                            type="date"
                                            name="birth_date"
                                            className="mt-1 block w-full"
                                            value={form.birth_date}
                                            onChange={(e) => handleFormChange("birth_date", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="contact" value="Contact No." />
                                        <TextInput
                                            id="contact"
                                            type="text"
                                            name="contact"
                                            className="mt-1 block w-full"
                                            value={form.contact}
                                            onChange={(e) => handleFormChange("contact", e.target.value)}
                                        />
                                    </div>

                                    {/* Only show model/issue for service ID 1 */}
                                    {(selectedServiceId === 1 || (selectedServiceId === 3 && showServiceFeeForm)) && (
                                        <>
                                            <Select2Field
                                                name="model_ids"
                                                label="Model List"
                                                placeholder="Choose a model"
                                                value={form.model_ids}
                                                onChange={(val) => handleFormChange("model_ids", val)}
                                                options={modelOptions}
                                                isMulti={true}
                                            />

                                            <Select2Field
                                                name="issue_ids"
                                                label="Issue Description"
                                                placeholder="Choose an issue"
                                                value={form.issue_ids}
                                                onChange={(val) => handleFormChange("issue_ids", val)}
                                                options={issueOptions}
                                                isMulti={true}
                                            />
                                        </>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center justify-end">
                                    {selectedServiceId === 1 && (
                                        <SecondaryButton onClick={() => setshowCancelModal(true)} className="me-4">
                                            <i className="bi bi-x-circle me-2"></i>
                                            No, cancel
                                        </SecondaryButton>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`bg-gray-700 text-white text-[13px] uppercase font-medium border border-gray-300 shadow px-4 py-2 rounded-md transition ${
                                            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        {isSubmitting ? "Saving..." : "Save Info"}
                                        <i className="fa-solid fa-file-arrow-up ms-2"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal 
                show={showCancelModal}
                maxWidth="xl"
                onClose={() => setshowCancelModal(false)}
            >
                <div className="p-8">
                    <>
                        <h2 className="text-lg font-semibold text-red-600 mb-2">
                            Not Proceeding Service
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Please select a reason for not proceeding to
                            repair:
                        </p>

                        <select
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring"
                            value={cancelReason}
                            onChange={(e) =>
                                setCancelReason(e.target.value)
                            }
                        >
                            <option value="" disabled>
                                Select a reason
                            </option>
                            <option value="Inquiry Only">
                                Inquiry Only
                            </option>
                            <option value="Leadtime Concern">
                                Leadtime Concern
                            </option>
                            <option value="Others">Others</option>
                        </select>

                        {cancelReason === "Others" && (
                            <input
                                type="text"
                                className="w-full mt-3 border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring"
                                placeholder="Please specify other reason"
                                value={otherReason}
                                onChange={(e) =>
                                    setOtherReason(e.target.value)
                                }
                            />
                        )}

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => {
                                    setshowCancelModal(false);
                                    setCancelReason("");
                                    setOtherReason("");
                                }}
                            >
                                Close
                            </button>

                            <button
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={() => {
                                    if (!cancelReason.trim()) {
                                        toast.error(
                                            "Please select a reason."
                                        );
                                        return;
                                    }

                                    if (
                                        cancelReason === "Others" &&
                                        !otherReason.trim()
                                    ) {
                                        toast.error(
                                            "Please specify the other reason."
                                        );
                                        return;
                                    }

                                    setShowReasonInput(false);
                                    handleCompleteService(
                                        "no",
                                        cancelReason === "Others"
                                            ? otherReason
                                            : cancelReason
                                    );
                                }}
                            >
                                Submit Reason
                            </button>
                        </div>
                    </>
                </div>
            </Modal>

            <Modal
                show={showUnserveCancelModal}
                maxWidth="lg"
                onClose={() => {
                    setshowUnserveCancelModal(false);
                }}            
            >
                <div className="p-8 text-center">
                    <div className="flex items-center justify-center mb-3">
                        <img src="https://cdn-icons-gif.flaticon.com/6844/6844353.gif" className="w-20" alt="" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-800 mb-3 text-center">Cancel Queue Confirmation</h1>
                    <p>Are you sure you want to cancel this Queue Number? <br/> This will mark as <strong className="text-orange-500">UNSERVED</strong> Queue.</p>

                    <div className="mt-4">
                        <SecondaryButton 
                        className="me-4" 
                            onClick={ () => {setshowUnserveCancelModal(false);}}
                        >
                            <i className="bi bi-x-circle me-1"></i>
                            Close
                        </SecondaryButton>

                        <PrimaryButton 
                            onClick={() => {handlemarkQueueUnserve(OnCallQueueNumbers[0].id);}}
                        >
                            <i className="bi bi-check2-circle me-1"></i>
                            Confirm
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <Modal
                show={showCompleteConfirmationModal}
                maxWidth="lg"
                onClose={() => {
                    setshowCompleteConfirmationModal(false);
                }}            
            >
                <div className="p-8 text-center">
                    <div className="flex items-center justify-center mb-3">
                        <img src="https://cdn-icons-gif.flaticon.com/6844/6844353.gif" className="w-20" alt="" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-800 mb-3 text-center">Complete Queue Confirmation</h1>
                    <p>
                        Are you sure you want to <strong className="text-green-500 uppercase">complete</strong> this <br/> 
                        serving Queue Number? 
                    </p>

                    <div className="mt-4">
                        <SecondaryButton 
                        className="me-4" 
                            onClick={ () => {setshowCompleteConfirmationModal(false);}}
                        >
                            <i className="bi bi-x-circle me-1"></i>
                            Cancel
                        </SecondaryButton>

                        <PrimaryButton 
                            onClick={() => {handleCompleteServingQueu(OnCallQueueNumbers[0].id);}}
                        >
                            <i className="bi bi-check2-circle me-1"></i>
                            Confirm
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
