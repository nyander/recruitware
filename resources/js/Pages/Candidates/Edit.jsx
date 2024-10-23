import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CandidateForm from '@/Components/CandidateForm';

const Edit = ({ auth, formSettings, formFields = {}, errors }) => {
    const [activeTab, setActiveTab] = useState('');
    const [initialFormValues, setInitialFormValues] = useState({});
    const [currentFormValues, setCurrentFormValues] = useState({});
    const [changedFields, setChangedFields] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [buttonStates, setButtonStates] = useState({
        edit: false,
        cancel: false,
        save: false,
    });

    useEffect(() => {
        if (formSettings && formSettings.tabs_Sections) {
            setActiveTab(formSettings.tabs_Sections[0]?.label || '');
            
            const initialValues = { ...formSettings.data };
            Object.keys(formFields).forEach((key) => {
                if (formFields[key].value !== undefined) {
                    initialValues[key] = formFields[key].value;
                }
            });
            
            setInitialFormValues(initialValues);
            setCurrentFormValues(initialValues);
        }
    }, [formSettings, formFields]);

    const handleFieldChange = (fieldName, value) => {
        const updatedValues = { ...currentFormValues, [fieldName]: value };
        setCurrentFormValues(updatedValues);

        if (value !== initialFormValues[fieldName]) {
            setChangedFields((prev) => ({ ...prev, [fieldName]: value }));
        } else {
            const { [fieldName]: _, ...rest } = changedFields;
            setChangedFields(rest);
        }
    };

    const handleEdit = async () => {
        try {
            setButtonStates(prev => ({ ...prev, edit: true }));
            setIsEditMode(true);
        } finally {
            // Reset button state after a short delay
            setTimeout(() => {
                setButtonStates(prev => ({ ...prev, edit: false }));
            }, 500);
        }
    };

    const handleCancel = async () => {
        try {
            setButtonStates(prev => ({ ...prev, cancel: true }));
            setCurrentFormValues(initialFormValues);
            setChangedFields({});
            setIsEditMode(false);
        } finally {
            // Reset button state after a short delay
            setTimeout(() => {
                setButtonStates(prev => ({ ...prev, cancel: false }));
            }, 500);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!Object.keys(changedFields).length) return;

        try {
            setButtonStates(prev => ({ ...prev, save: true }));
            setIsSubmitting(true);

            await Inertia.post(route('candidates.store'), {
                id: formSettings.data.id,
                changes: changedFields,
                saveUrl: formSettings.saveURL,
                saveData: formSettings.saveData
            });

            setIsEditMode(false);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
            // Reset button state after a short delay
            setTimeout(() => {
                setButtonStates(prev => ({ ...prev, save: false }));
            }, 500);
        }
    };

    const hasUnsavedChanges = Object.keys(changedFields).length > 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">
                {formSettings.data.id ? 'Edit Candidate' : 'Create Candidate'}
            </h2>}
        >
            <Head title={formSettings.data.id ? 'Edit Candidate' : 'Create Candidate'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form method="POST" onSubmit={handleSubmit} action={route('candidates.store')}>
                        <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]').getAttribute('content')} />
                        <input type="hidden" name="saveUrl" value={formSettings.saveUrl} />
                        <input type="hidden" name="saveData" value={formSettings.saveData} />
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    disabled={isSubmitting || Object.values(buttonStates).some(state => state)}
                                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity duration-150 ${
                                        (isSubmitting || Object.values(buttonStates).some(state => state)) ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    ← Back
                                </button>
                                <div className="flex gap-2">
                                    {!isEditMode ? (
                                        <button
                                            type="button"
                                            onClick={handleEdit}
                                            disabled={buttonStates.edit || isSubmitting}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity duration-150 ${
                                                (buttonStates.edit || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {buttonStates.edit ? 'Enabling Edit...' : 'Edit'}
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                disabled={buttonStates.cancel || isSubmitting}
                                                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity duration-150 ${
                                                    (buttonStates.cancel || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                {buttonStates.cancel ? 'Canceling...' : 'Cancel'}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!hasUnsavedChanges || buttonStates.save || isSubmitting}
                                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-opacity duration-150 ${
                                                    (!hasUnsavedChanges || buttonStates.save || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                {buttonStates.save ? 'Saving...' : 'Save'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex h-full">
                                    <div className="w-1/4 pr-4 overflow-y-auto border-r border-gray-200">
                                        <nav className="space-y-1" aria-label="Sidebar">
                                            {formSettings.tabs_Sections.map((tab) => (
                                                <button
                                                    key={tab.label}
                                                    type="button"
                                                    onClick={() => setActiveTab(tab.label)}
                                                    disabled={isSubmitting || Object.values(buttonStates).some(state => state)}
                                                    className={`${
                                                        activeTab === tab.label ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    } group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-opacity duration-150 ${
                                                        (isSubmitting || Object.values(buttonStates).some(state => state)) ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>

                                    <div className="w-3/4 pl-4 overflow-y-auto">
                                        <CandidateForm
                                            activeTab={activeTab}
                                            formSettings={formSettings}
                                            formFields={formFields}
                                            handleFieldChange={handleFieldChange}
                                            isEditMode={isEditMode}
                                            formData={currentFormValues}
                                            isSubmitting={isSubmitting || Object.values(buttonStates).some(state => state)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {Object.keys(errors).length > 0 && (
                        <div className="mt-4 p-4 bg-red-100 rounded-md">
                            <h3 className="text-red-800 font-semibold">Errors:</h3>
                            <ul className="list-disc list-inside">
                                {Object.entries(errors).map(([key, value]) => (
                                    <li key={key} className="text-red-700">{value}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Edit;