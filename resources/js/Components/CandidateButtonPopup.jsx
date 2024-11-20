import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FormFields } from "./FormFields";

const CandidateButtonPopup = ({
    isOpen = false,
    onClose = () => {},
    popup = null,
    formFields = {},
    formSettings = {},
    handleSubmit = () => {},
    isSubmitting = false,
}) => {
    const [formData, setFormData] = useState({});
    const [changedFields, setChangedFields] = useState({});
    const [initialFormValues, setInitialFormValues] = useState({});

    useEffect(() => {
        if (!popup?.fields || !formFields) return;

        const initialValues = {};
        popup.fields.forEach((field) => {
            const fieldInfo = formFields[field];
            if (!fieldInfo) {
                console.log(`No field info found for: ${field}`);
                return;
            }

            if (formSettings?.data) {
                const matchingKey = Object.keys(formSettings.data).find(
                    (key) => key.toLowerCase() === field.toLowerCase()
                );
                initialValues[field] = matchingKey
                    ? formSettings.data[matchingKey]
                    : "";
            }
        });

        console.log("Initialized values:", initialValues);
        setFormData(initialValues);
        setInitialFormValues(initialValues);
        setChangedFields({});
    }, [popup, formFields, formSettings]);

    const handleFieldChange = (field, value) => {
        if (isSubmitting) return;

        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (value !== initialFormValues[field]) {
            setChangedFields((prev) => ({
                ...prev,
                [field]: value,
            }));
        } else {
            const { [field]: removed, ...rest } = changedFields;
            setChangedFields(rest);
        }
    };

    const renderField = (field) => {
        const fieldInfo = formFields[field];
        if (!fieldInfo) {
            console.log(`No field info found for: ${field}`);
            return null;
        }

        const commonProps = {
            field,
            fieldInfo,
            value: formData[field] || "",
            onChange: handleFieldChange,
            isDisabled: isSubmitting,
            formFields,
            isEditMode: true,
        };

        const fieldType = fieldInfo.type?.toLowerCase() || "default";
        const FieldComponent = FormFields[fieldType] || FormFields.default;

        return <FieldComponent {...commonProps} />;
    };

    const getGridTemplateColumns = (columns) => {
        if (!columns || columns <= 0) return "grid-cols-1";
        if (columns === 2) return "grid-cols-1 sm:grid-cols-2";
        if (columns === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
        if (columns >= 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
        return `grid-cols-${columns}`;
    };

    if (!isOpen || !popup) return null;

    return (
        <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                    &#8203;
                </span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                {popup.title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div
                            className={`grid ${getGridTemplateColumns(
                                popup.columns
                            )} gap-4`}
                        >
                            {popup.fields.map((field) => (
                                <div key={field} className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {formFields[field]?.label || field}
                                    </label>
                                    <div className="mt-1">
                                        {renderField(field)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        {popup.buttons?.map((button, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    if (button.action === "closePopup") {
                                        onClose();
                                        return;
                                    }
                                    handleSubmit({
                                        ...changedFields,
                                        ...button.updates,
                                    });
                                }}
                                disabled={isSubmitting}
                                className={`${
                                    button.action === "closePopup"
                                        ? "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                        : "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                } ${
                                    isSubmitting
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {button.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateButtonPopup;
