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

    // HTML field renderer component
    const HTMLContent = ({ content }) => {
        return (
            <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    };

    const parseLookups = () => {
        if (!formSettings?.lookups) return {};

        const lookupData = {};
        const lookupGroups = formSettings.lookups.split("@@");

        lookupGroups.forEach((group) => {
            const [name, options] = group.split("^");
            if (!options) return;

            lookupData[name] = options.split(";").map((option) => {
                const [text, value] = option.split("|");
                return {
                    label: text.trim(),
                    value: value || text.trim(),
                };
            });
        });

        return lookupData;
    };

    const getSelectOptions = (field, fieldInfo) => {
        const lookups = parseLookups();
        const options = fieldInfo.options;

        if (options && options[0]?.value?.startsWith("[LOOKUP-")) {
            const lookupName = options[0].value
                .replace("[LOOKUP-", "")
                .replace("]", "");
            return lookups[lookupName] || [];
        }

        return options || [];
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
            case "html":
                return (
                    <div
                        className={`p-3 rounded-md bg-gray-50 border border-gray-200 ${
                            !isEditMode || isSubmitting ? "opacity-75" : ""
                        }`}
                    >
                        <HTMLContent content={value} />
                    </div>
                );
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
            case "readonly":
                return (
                    <input
                        type="text"
                        id={field}
                        name={field}
                        value={value || ""}
                        readOnly
                        disabled
                        className="shadow-sm block w-full sm:text-sm border-gray-200 rounded-md bg-gray-50 cursor-not-allowed"
                        aria-readonly="true"
                    />
                );
            case "select":
                const selectOptions = getSelectOptions(field, fieldInfo);
                const selectedValues = value ? value.split(";") : [];
                return (
                    <select
                        id={field}
                        name={field}
                        value={value || ""}
                        onChange={(e) =>
                            handleFieldChange(field, e.target.value)
                        }
                        {...commonProps}
                    >
                        <option value="">Select {label}</option>
                        {selectOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case "checkbox":
                const checkboxOptions = getSelectOptions(field, fieldInfo);
                // Remove '1;' if present at start of value string
                const cleanValue = value?.startsWith("1;")
                    ? value.substring(2)
                    : value;
                const checkboxValues = cleanValue ? cleanValue.split(";") : [];

                return (
                    <div className="space-y-2">
                        {checkboxOptions.map((option, index) => (
                            <label
                                key={index}
                                className="flex items-center space-x-3"
                            >
                                <input
                                    type="checkbox"
                                    checked={checkboxValues.includes(
                                        option.value
                                    )}
                                    onChange={(e) => {
                                        const newValues = e.target.checked
                                            ? [...checkboxValues, option.value]
                                            : checkboxValues.filter(
                                                  (v) => v !== option.value
                                              );
                                        // Submit raw selected values without prepending '1;'
                                        handleFieldChange(
                                            field,
                                            newValues.join(";")
                                        );
                                    }}
                                    disabled={!isEditMode || isSubmitting}
                                    className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${
                                        !isEditMode || isSubmitting
                                            ? "cursor-not-allowed opacity-75"
                                            : ""
                                    }`}
                                />
                                <span className="text-sm text-gray-700">
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
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
