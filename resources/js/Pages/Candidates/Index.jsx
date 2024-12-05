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
    vsetts,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const formSettings = {
        saveURL: vsetts?.SaveUrl || "",
        saveData: vsetts?.SaveData || "",
    };

    console.log({
        columns: columns,
        data: Object.values(candidates),
        viewForm: viewForm,
        buttons: buttons,
        popups: popups,
        structuredFormFields: structuredFormFields,
        formSettings: formSettings,
        disableRowClick: disableRowClick,
        vsetts: vsetts,
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            auth={auth}
            menu={menu}
            header={
                <div className="font-semibold text-xl text-gray-800 leading-tight">
                    {status}
                </div>
            }
        >
            <Head title={`${status} ${viewForm}`} />

            <div className="flex-grow">
                <div className="mx-auto max-w-screen-xl h-full">
                    {/* Adjusted max-width and ensured full height */}
                    <div className="bg-white h-full overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 h-full">
                            <div
                                className="h-full max-h-full overflow-y-auto"
                                style={{
                                    margin: "0 auto",
                                }}
                            >
                                <Table
                                    columns={columns}
                                    data={Object.values(candidates)}
                                    viewForm={viewForm}
                                    buttons={buttons}
                                    popups={popups}
                                    structuredFormFields={structuredFormFields}
                                    formSettings={formSettings}
                                    disableRowClick={disableRowClick}
                                    vsetts={vsetts}
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
