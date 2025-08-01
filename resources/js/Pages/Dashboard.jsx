import { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import ApplicationHeader from "@/Components/ApplicationHeader";
import CardDisplay from "@/Components/CardDisplay";
import LaneSelectionCard from "@/Components/LaneSelectionCard";
import ServiceOptionCard from "@/Components/ServiceOptionCard";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Select2Field from "@/Components/Select2Field";
import RegistrationSuccessCard from "@/Components/RegistrationSuccessCard";
import PrimaryButton from "@/Components/PrimaryButton";
import PricingTable from "@/Components/PricingTable";
import TextInput from "@/Components/TextInput";
import { Player } from "@lottiefiles/react-lottie-player";
import { toast } from "react-toastify";

export default function Dashboard() {
    const { flash = {} } = usePage().props;
    const [showSuccess, setShowSuccess] = useState(!!flash.queue_info);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [service3Step, setService3Step] = useState("menu");
    const [input, setInput] = useState("");

    const {
        QueueLaneType,
        QueueServiceType,
        QueueModelList,
        QueueIssueDescriptions,
        auth,
    } = usePage().props;

    const [selectedLane, setSelectedLane] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [form, setForm] = useState({
        model_ids: [],
        issue_ids: [],
        qualification: "",
    });

    const isLane2Selected = selectedLane;

    const handleFormChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            lane_id: selectedLane,
        };

        if (selectedLane === 1) {
            payload.qualification = form.qualification;
        } else {
            payload.service_id = selectedService;
            payload.model_ids = (form.model_ids ?? []).map((opt) => opt.value);
            payload.issue_ids = (form.issue_ids ?? []).map((opt) => opt.value);
        }

        router.post(route("queue.store"), payload, {
            onSuccess: () => {
                setShowSuccess(true);
                setSelectedLane(null);
                setSelectedService(null);
                setForm({
                    model_ids: [],
                    issue_ids: [],
                    qualification: "",
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const modelOptions = QueueModelList.map((model) => ({
        value: model.id,
        label: model.name,
    }));

    const issueOptions = QueueIssueDescriptions.map((issue) => ({
        value: issue.id,
        label: issue.name,
    }));

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
                    Registration
                </h2>
            }
        >
            <Head title="Registration" />

            <ApplicationHeader
                title="Queue Registration"
                subtitle={
                    <span className="text-lg text-gray-700">
                        Please choose your lane and complete the following
                        requirements.
                    </span>
                }
            />

            <div className="mx-5 lg:mx-[200px] mb-10">
                {showSuccess ? (
                    <RegistrationSuccessCard
                        number={flash?.queue_info?.number ?? ""}
                        name={flash?.queue_info?.lane ?? ""}
                        service={flash?.queue_info?.service ?? ""}
                        onBack={() => {
                            setSelectedLane(null);
                            setSelectedService(null);
                            setForm({ model_ids: [], issue_ids: [] });
                            setShowSuccess(false);
                        }}
                    />
                ) : (
                    <>
                        {!isLane2Selected && !selectedLane && (
                            <CardDisplay className="mt-5">
                                <div className="flex gap-6 justify-center items-start p-8 flex-wrap">
                                    {QueueLaneType.map((lane) => (
                                        <LaneSelectionCard
                                            key={lane.id}
                                            type={lane.name}
                                            onSelect={() =>
                                                setSelectedLane(lane.id)
                                            }
                                        />
                                    ))}
                                </div>
                            </CardDisplay>
                        )}

                        {isLane2Selected == 2 && selectedService !== 1 && selectedService !== 2 && selectedService !== 3 && selectedService !== 4 && (
                            <CardDisplay className="mt-5">
                                <div className="p-8">
                                    <button
                                        onClick={() => setSelectedLane(null)}
                                        className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i>{" "}
                                        Back to Lane Selection
                                    </button>
                                    <h3 className="text-2xl font-black text-gray-700 mb-5">
                                        Choose Your Service
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-5">
                                        {QueueServiceType.map((service) => (
                                            <ServiceOptionCard
                                                key={service.id}
                                                id={service.id}
                                                title={service.name}
                                                image={service.imgurl}
                                                selected={
                                                    selectedService ===
                                                    service.id
                                                }
                                                onChange={setSelectedService}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </CardDisplay>
                        )}

                        {((selectedService === 1) || (selectedService === 3 && service3Step === "form")) && (
                            <CardDisplay className="mt-5">
                                <div className="p-8">
                                    <button
                                        onClick={() => {
                                            setSelectedService(null);
                                            setService3Step("menu");
                                        }}
                                        className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i>{" "}
                                        Back to Service Selection
                                    </button>

                                    <h3 className="text-2xl font-black text-gray-700">
                                        Fill Out Information
                                    </h3>
                                    <Player
                                        autoplay
                                        loop
                                        src="/img/writing.json"
                                        style={{ height: "150px", width: "400px" }}
                                    />
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            <Select2Field
                                                name="model_ids"
                                                label="Model List"
                                                placeholder="Choose a model"
                                                value={form.model_ids}
                                                onChange={(val) =>
                                                    handleFormChange(
                                                        "model_ids",
                                                        val
                                                    )
                                                }
                                                options={modelOptions}
                                                isMulti={true}
                                            />
                                            <Select2Field
                                                name="issue_ids"
                                                label="Issue Description"
                                                placeholder="Choose an issue"
                                                value={form.issue_ids}
                                                onChange={(val) =>
                                                    handleFormChange(
                                                        "issue_ids",
                                                        val
                                                    )
                                                }
                                                options={issueOptions}
                                                isMulti={true}
                                            />
                                        </div>
                                        <div className="mt-6 flex items-center justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`bg-gray-700 text-white text-[13px] uppercase font-medium border border-gray-300 shadow px-4 py-2 rounded-md transition ${
                                                    isSubmitting ? "bg-gray-300 cursor-not-allowed" : "border-gray-400 hover:bg-gray-500"
                                                }`}
                                            >
                                                {isSubmitting ? "Submitting..." : "Submit Info"}
                                                <i className="fa-solid fa-file-arrow-up ms-2"></i>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </CardDisplay>
                        )}

                        {selectedService === 2 && (
                            <CardDisplay className="mt-5">
                                <div className="p-8">
                                    <button
                                        onClick={() => setSelectedService(null)}
                                        className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i>{" "}
                                        Back to Service Selection
                                    </button>
                                    <h3 className="text-2xl font-black text-gray-700 mb-5">
                                        Scan Here to track your Repair
                                    </h3>
                                    <div className="flex items-center justify-center mb-2">
                                        <img
                                            src="/img/qr-repair-tracker.png"
                                            className="w-44 h-44 object-contain"
                                            alt=""
                                        />
                                    </div>
                                    <small className="text-md font-semibold">
                                        or visit <a className="text-blue-500" href="https://tickets.beyondthebox.ph/customer-jo-tracker" target="_blank"><i>https://tickets.beyondthebox.ph/customer-jo-tracker</i></a>
                                    </small>
                                    <div className="mt-3">
                                        <p className="mb-3">
                                            For more concerns, generate a Queue number then <br></br> please wait for your number to be called
                                        </p>
                                        <form onSubmit={handleSubmit}>
                                            <PrimaryButton>
                                                Generate
                                                <i className="bi bi-arrow-clockwise ms-2"></i>
                                            </PrimaryButton>
                                        </form>
                                    </div>
                                </div>
                            </CardDisplay>
                        )}
                        {selectedService === 3 && service3Step === "menu" && (
                            <CardDisplay className="mt-5">
                                <div className="p-8">
                                    <button
                                        onClick={() => setSelectedService(null)}
                                        className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i>{" "}
                                        Back to Service Selection
                                    </button>
                                    <h3 className="text-2xl font-black text-gray-700 mb-5">
                                        Service Fee Menu
                                    </h3>
                                    <PricingTable />
                                    <div className="mt-3">
                                        <p className="mb-3">
                                            For more concerns, generate a Queue number then <br />
                                            please wait for your number to be called
                                        </p>
                                        <PrimaryButton onClick={() => setService3Step("form")}>
                                            Proceed to fill out required info
                                            <i className="bi bi-pencil-square ms-2"></i>
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </CardDisplay>
                        )}

                        {selectedService === 4 && (
                            <CardDisplay className="mt-5">
                                <div className="p-8">
                                    <button
                                        onClick={() => setSelectedService(null)}
                                        className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i>{" "}
                                        Back to Service Selection
                                    </button>
                                    <h3 className="text-2xl font-black text-gray-700">
                                        Pick up Repair
                                    </h3>
                                    <Player
                                        autoplay
                                        loop
                                        src="/img/scanning_jo.json"
                                        style={{ height: "150px", width: "400px" }}
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
                                        <div className="mt-3">
                                            <p className="my-5">
                                                To claim your reapir or For more concerns, generate a Queue number <br/> then please wait for your number to be called
                                            </p>
                                            <form onSubmit={handleSubmit}>
                                                <PrimaryButton>
                                                    Generate
                                                    <i className="bi bi-arrow-clockwise ms-2"></i>
                                                </PrimaryButton>
                                            </form>
                                        </div> 
                                    </div>
                                </div>
                            </CardDisplay>
                        )}

                        {selectedLane === 1 && (
                            <CardDisplay className="mt-5">
                                <div className="p-8">
                                    <button
                                        onClick={() => setSelectedLane(null)}
                                        className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i> Back to Lane Selection
                                    </button>
                                    <h3 className="text-2xl font-black text-gray-700">
                                        Welcome to Priority Lane
                                    </h3>
                                    <Player
                                        autoplay
                                        loop
                                        src="/img/priority_qualification.json"
                                        style={{ height: "150px", width: "400px" }}
                                    />
                                    <p className="text-gray-600 mt-2">
                                        Please select you qualification in the list as priority.
                                    </p>
                                    <select
                                        name="qualification"
                                        value={form.qualification}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                qualification: e.target.value,
                                            }))
                                        }
                                        className="w-[450px] mt-3 border text-center border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0"
                                    >
                                        <option value="" disabled defaultValue>
                                            Select your Qualification
                                        </option>
                                        <option value="Persons With Disabilities (PWD) - ID">
                                            Persons With Disabilities (PWD) - ID
                                        </option>
                                        <option value="Senior Citizen - ID">Senior Citizen - ID</option>
                                        <option value="Pregnant Women - Ultrasound">
                                            Pregnant Women - Ultrasound
                                        </option>
                                    </select>

                                    <p className="my-5">
                                        To claim your reapir or For more concerns, generate a Queue number <br/> then please wait for your number to be called
                                    </p>
                                    <form onSubmit={handleSubmit}>
                                        <PrimaryButton disabled={!form.qualification || isSubmitting}>
                                            {isSubmitting ? "Generating..." : "Generate"}
                                            <i className="bi bi-arrow-clockwise ms-2"></i>
                                        </PrimaryButton>
                                    </form>
                                </div>
                            </CardDisplay>
                        )}

                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
