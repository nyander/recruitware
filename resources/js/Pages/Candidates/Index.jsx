import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Table from "@/Components/Charts/Table";

const Index = ({
    auth,
    candidates,
    status,
    columns,
    menu,
    viewForm,
    buttons,
    popups,
    structuredFormFields,
    disableRowClick,
    vsetts, // Add this prop if you're getting form settings from backend
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    // Create formSettings object from vsetts or other backend data
    const formSettings = {
        saveURL: vsetts?.SaveUrl || "", // Adjust property names based on your backend data
        saveData: vsetts?.SaveData || "",
        // Add any other form settings you need
    };

    // Log the props to help with debugging
    console.log("Index Component Props:", {
        buttons,
        popups,
        structuredFormFields,
        vsetts,
        formSettings,
    });

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
            <Head title={`${status} ${viewForm}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto lg:px-2">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="h-[calc(100vh-300px)]">
                                <Table
                                    columns={columns}
                                    data={Object.values(candidates)}
                                    viewForm={viewForm}
                                    buttons={buttons}
                                    popups={popups}
                                    structuredFormFields={structuredFormFields}
                                    formSettings={formSettings} // Add this prop
                                    disableRowClick={disableRowClick}
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
