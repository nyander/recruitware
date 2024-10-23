import React, { useState, useEffect } from 'react';

const CandidateForm = ({ 
    formSettings, 
    formFields, 
    activeTab, 
    handleFieldChange, 
    isEditMode, 
    formData,
    isSubmitting 
}) => {
    const [localFormData, setLocalFormData] = useState({});

    useEffect(() => {
        if (formSettings && formSettings.data) {
            const initialData = { ...formSettings.data };
            setLocalFormData(initialData);
        }
    }, [formSettings]);

    useEffect(() => {
        if (formData) {
            setLocalFormData(formData);
        }
    }, [formData]);

    const handleInputChange = (field, value) => {
        if (isSubmitting) return;
        
        setLocalFormData((prevData) => ({
            ...prevData,
            [field.toLowerCase()]: value,
        }));
        handleFieldChange(field, value);
    };

    const getValueFromData = (field) => {
        const value = localFormData[field.toLowerCase()];
        return value !== undefined ? value : formFields[field]?.value || '';
    };

    const renderField = (field) => {
        const fieldInfo = formFields[field];
        if (!fieldInfo) return null;

        const { label, type, options } = fieldInfo;
        const value = getValueFromData(field);

        const commonProps = {
            disabled: !isEditMode || isSubmitting,
            className: `shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                (!isEditMode || isSubmitting) ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''
            }`,
        };

        switch (type) {
            case 'Text':
            case 'Date':
            case 'Number':
            case 'Email':
            case 'Tel':
                return (
                    <input
                        type={type.toLowerCase()}
                        id={field}
                        name={field}
                        defaultValue={value}
                        onChange={(e) => isEditMode && !isSubmitting && handleInputChange(field, e.target.value)}
                        {...commonProps}
                    />
                );
            case 'Select':
                return (
                    <select
                        id={field}
                        name={field}
                        defaultValue={value}
                        onChange={(e) => isEditMode && !isSubmitting && handleInputChange(field, e.target.value)}
                        {...commonProps}
                    >
                        <option value="">Select {label}</option>
                        {options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case 'Checkbox':
                return (
                    <input
                        type="checkbox"
                        id={field}
                        name={field}
                        defaultChecked={value === true || value === "1" || value === "Yes"}
                        onChange={(e) => isEditMode && !isSubmitting && handleInputChange(field, e.target.checked)}
                        disabled={!isEditMode || isSubmitting}
                        className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${
                            (!isEditMode || isSubmitting) ? 'cursor-not-allowed opacity-75' : ''
                        }`}
                    />
                );
            case 'Attach':
                return (
                    <div className="mt-1">
                        {value ? (
                            <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                View File
                            </a>
                        ) : (
                            <div className="text-sm text-gray-500">No file attached</div>
                        )}
                        {isEditMode && !isSubmitting && (
                            <input
                                type="file"
                                id={field}
                                name={field}
                                onChange={(e) => handleInputChange(field, e.target.files[0])}
                                {...commonProps}
                            />
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const renderTabContent = () => {
        const currentTab = formSettings.tabs_Sections.find((tab) => tab.label === activeTab);
        if (!currentTab) return <p>No content available for this tab.</p>;

        const sections = Array.isArray(currentTab.sections) ? currentTab.sections : Object.values(currentTab.sections);

        return (
            <div className="space-y-8">
                {sections.map((section) => (
                    <div key={section.label} className="section">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{section.label}</h3>
                        <div className={`grid grid-cols-${section.columns || 1} gap-4`}>
                            {section.fields.map((field) => (
                                <div key={field} className="mb-4">
                                    <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                                        {formFields[field]?.label || field}
                                    </label>
                                    <div className="mt-1">{renderField(field)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={`w-full ${isSubmitting ? 'pointer-events-none opacity-75' : ''}`}>
            {renderTabContent()}
        </div>
    );
};

export default CandidateForm;