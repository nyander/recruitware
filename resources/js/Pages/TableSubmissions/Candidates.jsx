import React, { useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateFormModal from "../Components/CandidateFormModal";
import Table from "@/Components/Charts/Table/Index.jsx";

const Candidates = ({ auth, candidates, status, columns }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [formSettings, setFormSettings] = useState(null);
    const { url } = usePage().props;

    // Fetch form settings for the selected candidate when a row is clicked
    const handleRowClick = useCallback((candidate) => {
        console.log(
            "Row clicked, fetching form settings for candidate:",
            candidate
        );
        setSelectedCandidate(candidate); // Set the selected candidate
        // Fetch form settings dynamically based on the row click
        fetch(`/candidate/form-settings`)
            .then((response) => response.json()) // Parse JSON response
            .then((data) => {
                console.log("Form Settings:", data);
                setFormSettings(data); // Store the form settings in state
                setIsModalOpen(true); // Open the modal after form settings are loaded
            })
            .catch((error) =>
                console.error("Error fetching form settings:", error)
            );
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            auth={auth}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {status} Candidates
                </h2>
            }
        >
            <Head title={`${status} Candidate`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto lg:px-2">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="h-[calc(100vh-300px)]">
                                <Table
                                    columns={columns}
                                    data={Object.values(candidates)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CandidateFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                candidate={selectedCandidate}
                formSettings={formSettings}
            />
        </AuthenticatedLayout>
    );
};

export default Candidates;
