import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Table from "@/Components/Charts/Table";

const Index = ({ auth, candidates, status, columns, menu, viewForm }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    return (
        <AuthenticatedLayout
            user={auth.user}
            auth={auth}
            menu={menu}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {status}
                </h2>
            }
        >
            <Head title={`${status} Candidates`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto lg:px-2">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="h-[calc(100vh-300px)]">
                                {" "}
                                {/* Adjust the height as needed */}
                                <Table
                                    columns={columns}
                                    data={Object.values(candidates)}
                                    viewForm={viewForm}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
