import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CandidateForm from '@/Components/CandidateForm';

const Edit = ({ auth, candidate, formSettings }) => {
    const { data, setData, put, processing, errors } = useForm(candidate);

    const handleBack = () => {
        window.history.back(); // This will navigate to the previous page
    };

    const handleSave = (updatedData) => {
        put(route('candidates.update', candidate.id), updatedData);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Candidate</h2>}
        >
            <Head title="Edit Candidate" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <CandidateForm 
                        candidate={data} 
                        formSettings={formSettings} 
                        onBack={handleBack}
                        onSave={handleSave}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Edit;