import React, { useState, useEffect } from "react";
import AttachmentField from "./AttachmentField";

const CandidateForm = ({
    formSettings,
    formFields,
    activeTab,
    handleFieldChange,
    isEditMode,
    formData,
    isSubmitting,
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
        const fieldInfo = formFields[field];
        if (!fieldInfo) return null;

        const { label, type, options } = fieldInfo;
        const value = getValueFromData(field);

        const commonProps = {
            disabled: !isEditMode || isSubmitting,
            className: `shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                !isEditMode || isSubmitting
                    ? "bg-gray-50 cursor-not-allowed opacity-75"
                    : ""
            }`,
        };

        switch (type?.toLowerCase()) {
            case "attach":
                return (
                    <AttachmentField
                        field={field}
                        value={value}
                        isEditMode={isEditMode}
                        isSubmitting={isSubmitting}
                        handleInputChange={handleInputChange}
                    />
                );
            case "select":
                return (
                    <select
                        id={field}
                        name={field}
                        value={value || ""}
                        onChange={(e) =>
                            handleInputChange(field, e.target.value)
                        }
                        {...commonProps}
                    >
                        <option value="">Select {label}</option>
                        {Array.isArray(options) &&
                            options.map((option, index) => {
                                const optionValue =
                                    typeof option === "object"
                                        ? option.value
                                        : option;
                                const optionLabel =
                                    typeof option === "object"
                                        ? option.label
                                        : option;

                                return (
                                    <option
                                        key={index}
                                        value={optionValue || ""}
                                    >
                                        {optionLabel || optionValue || ""}
                                    </option>
                                );
                            })}
                    </select>
                );
            case "checkbox":
                return (
                    <input
                        type="checkbox"
                        id={field}
                        name={field}
                        checked={
                            value === true || value === "1" || value === "Yes"
                        }
                        onChange={(e) =>
                            handleInputChange(field, e.target.checked)
                        }
                        disabled={!isEditMode || isSubmitting}
                        className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${
                            !isEditMode || isSubmitting
                                ? "cursor-not-allowed opacity-75"
                                : ""
                        }`}
                    />
                );
            default:
                return (
                    <input
                        type={type?.toLowerCase() || "text"}
                        id={field}
                        name={field}
                        value={value || ""}
                        onChange={(e) =>
                            handleInputChange(field, e.target.value)
                        }
                        {...commonProps}
                    />
                );
        }
    };

    const renderTabContent = () => {
        if (!formSettings?.tabs_Sections) return null;

        const currentTab = formSettings.tabs_Sections.find(
            (tab) => tab.label === activeTab
        );
        if (!currentTab) return <p>No content available for this tab.</p>;

        const sections = Array.isArray(currentTab.sections)
            ? currentTab.sections
            : Object.values(currentTab.sections);

        return (
            <div className="space-y-8">
                {sections.map((section) => (
                    <div key={section.label} className="section">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            {section.label}
                        </h3>
                        <div
                            className={`grid grid-cols-${
                                section.columns || 1
                            } gap-4`}
                        >
                            {section.fields.map((field) => (
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

    if (Object.keys(formFields).length === 1) {
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
