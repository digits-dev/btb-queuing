import { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import { ToastContainer, toast } from 'react-toastify';
import ApplicationHeader from "@/Components/ApplicationHeader";
import CardDisplay from "@/Components/CardDisplay";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ServiceOptionCard from "@/Components/ServiceOptionCard";
import PrimaryButton from "@/Components/PrimaryButton";

export default function CounterPicker() {
    const { branch_counters } = usePage().props;
    const [submittingId, setSubmittingId] = useState(null);

    const handleSubmit = (id) => {
        setSubmittingId(id); 

        router.post(
        route("queue.counter.save-pick"),
            { counter_id: id },
            {
                onSuccess: () => {
                toast.success("Counter assigned successfully.");
                },
                onError: (errors) => {
                if (errors.counter_id) {
                    toast.error(errors.counter_id);
                } else {
                    toast.error("Oops! Something went wrong.");
                }
                },
                onFinish: () => {
                    setSubmittingId(null);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
        header={
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Counter Picker
                </h2>
            }
            >
            <ToastContainer/>
            <Head title="Registration" />

            <ApplicationHeader
                title="Counter Picker"
                subtitle={
                    <span className="text-lg text-gray-700">
                        Please choose your counter to start Queuing.
                    </span>
                }
            />
            <div className="mx-5 lg:mx-[200px] mb-10">
                <CardDisplay className="mt-5">
                    <div className="p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
                            {branch_counters.map((counter) => {
                                const assignedUser = counter.current_assignment?.user?.name ?? "Available";
                                const isDisabled = assignedUser !== "Available" || submittingId === counter.id;

                                return (
                                    <ServiceOptionCard
                                        key={counter.id}
                                        id={counter.id}
                                        title={counter.name}
                                        image="https://cdn-icons-png.flaticon.com/128/5325/5325638.png"
                                        asignments={assignedUser}
                                    >
                                        <PrimaryButton
                                            disabled={isDisabled}
                                            onClick={() => handleSubmit(counter.id)}
                                        >
                                            {submittingId === counter.id ? "Submitting..." : "Select"}
                                            <i className="bi bi-send-check-fill ms-1"></i>
                                        </PrimaryButton>
                                    </ServiceOptionCard>
                                );
                            })}
                        </div>
                    </div>
                </CardDisplay>
            </div>
        </AuthenticatedLayout>
    );
}
