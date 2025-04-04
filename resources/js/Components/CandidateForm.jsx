import React, { useState, useEffect } from "react";
import { FormFields } from "./FormFields";

const CandidateForm = ({
    formSettings = {},
    formFields = {},
    activeTab = "",
    handleFieldChange = () => {},
    isEditMode = false,
    formData = {},
    isSubmitting = false,
}) => {
    const [localFormData, setLocalFormData] = useState({});

    useEffect(() => {
        if (formData) {
            setLocalFormData(formData);
        }
    }, [formData, isEditMode]);

    const handleInputChange = (field, value) => {
        if (!isEditMode || isSubmitting) return;

        const fieldLower = field.toLowerCase();

        setLocalFormData((prev) => ({
            ...prev,
            [field]: value,
            [fieldLower]: value,
        }));

        handleFieldChange(field, value);
    };

    const getValueFromData = (field) => {
        if (!field) return "";

        if (localFormData[field] !== undefined) {
            return localFormData[field];
        }

        const fieldLower = field.toLowerCase();
        if (localFormData[fieldLower] !== undefined) {
            return localFormData[fieldLower];
        }

        if (formData[field] !== undefined) {
            return formData[field];
        }

        return "";
    };

    const renderField = (field) => {
        if (!field || !formFields) return null;

        const fieldInfo = formFields[field];
        if (!fieldInfo) return null;

        const commonProps = {
            field,
            fieldInfo,
            value: getValueFromData(field),
            onChange: handleInputChange,
            isDisabled: !isEditMode || isSubmitting,
            formFields,
            isEditMode,
            isSubmitting,
            handleInputChange,
        };

        const fieldType = fieldInfo.type?.toLowerCase() || "default";
        const FieldComponent = FormFields[fieldType] || FormFields.default;
        return <FieldComponent {...commonProps} />;
    };

    const renderTabContent = () => {
        if (!formSettings?.tabs_Sections) return null;

        const currentTab = formSettings.tabs_Sections.find(
            (tab) => tab.label === activeTab
        );
        if (!currentTab) return <p>No content available for this tab.</p>;

        const sections = Array.isArray(currentTab.sections)
            ? currentTab.sections
            : Object.values(currentTab.sections || {});

        return (
            <div className="space-y-8">
                {sections.map((section) => (
                    <div key={section.label || "section"} className="section">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            {section.label || ""}
                        </h3>
                        <div
                            className={`grid grid-cols-1 md:grid-cols-${
                                section.columns || 1
                            } gap-4`}
                        >
                            {(section.fields || []).map((field) => (
                                <div key={field} className="mb-4">
                                    <label
                                        htmlFor={field}
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        {formFields[field]?.label || field}
                                    </label>
                                    <div className="mt-1">
                                        {renderField(field)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Only check formFields if it exists
    if (formFields && Object.keys(formFields).length === 1) {
        const field = Object.keys(formFields)[0];
        return renderField(field);
    }

    return (
        <div
            className={`w-full ${
                isSubmitting ? "pointer-events-none opacity-75" : ""
            }`}
        >
            {renderTabContent()}
        </div>
    );
};

export default CandidateForm;
