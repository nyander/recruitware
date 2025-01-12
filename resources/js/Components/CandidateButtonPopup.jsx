import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FormFields } from "./FormFields";
import { useContext } from "react";
import { PopupContext } from "./PopupContext";

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
    const [attachmentValues, setAttachmentValues] = useState({}); // Add this state

    // In CandidateButtonPopup.jsx
    const handleButtonClick = (button) => {
        if (button.action === "closePopup") {
            onClose();
            return;
        }

        // Get the selectedToggleValues from context
        const { selectedToggleValues } = useContext(PopupContext);

        // Create submission data including attachments and selected values
        const updatedData = {
            ...formData,
            ...changedFields,
            ...button.updates,
            selectedToggleValues, // Using selectedToggleValues from context
            AttachFile:
                attachmentValues["AttachFile"] ||
                formData["AttachFile"] ||
                null,
        };

        console.log("Final submission data:", updatedData);
        handleSubmit(updatedData);
    };

    const handleInputChange = (field, value) => {
        setAttachmentValues((prev) => ({
            ...prev,
            [field]: value, // Update attachment-specific fields
        }));
        setFormData((prev) => ({
            ...prev,
            [field]: value, // Update general form data
        }));
    };

    useEffect(() => {
        if (!popup?.fields || !formFields) return;

        console.log("Setting up form with popup:", popup);
        console.log("Initial popup.initialData:", popup.initialData);

        const initialValues = {};
        const initialAttachments = {};

        if (popup.initialData) {
            popup.fields.forEach((field) => {
                const cleanField = field.trim();
                const fieldInfo = formFields[cleanField];
                const isAttachment =
                    fieldInfo?.type?.toLowerCase() === "attach";

                if (isAttachment) {
                    initialAttachments[cleanField] =
                        popup.initialData[cleanField] || "";
                }
                initialValues[cleanField] = popup.initialData[cleanField] || "";
            });
        }

        console.log("Final form values set:", initialValues);
        console.log("Initial attachments:", initialAttachments);

        setFormData(initialValues);
        setInitialFormValues(initialValues);
        setAttachmentValues(initialAttachments);
        setChangedFields({});

        // Cleanup function
        return () => {
            setFormData({});
            setInitialFormValues({});
            setAttachmentValues({});
            setChangedFields({});
        };
    }, [popup?.id, popup?.initialData, formFields]);

    const handleFieldChange = (field, value) => {
        // console.log("Field Change Event:", { field, value });

        const fieldInfo = formFields[field];
        const isAttachment = fieldInfo?.type?.toLowerCase() === "attach";

        if (isAttachment) {
            // Store raw file path
            const filePath = value.split("?")[0]; // Remove any query parameters
            setAttachmentValues((prev) => ({
                ...prev,
                [field]: filePath,
            }));

            // Also update changed fields for attachments
            setChangedFields((prev) => ({
                ...prev,
                [field]: filePath,
            }));
        }

        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // useEffect(() => {
    //     console.log("Popup Open:", isOpen);
    //     console.log("Popup Config:", popup);
    //     console.log("Form Data on Open:", formData);
    // }, [isOpen, popup, formData]);

    const renderField = (field) => {
        const fieldInfo = formFields[field];
        if (!fieldInfo) {
            console.warn(`No field info found for: ${field}`);
            return null;
        }

        const value = formData[field] || "";
        // console.log("Rendering field with value:", { field, value });

        const commonProps = {
            field,
            fieldInfo,
            value,
            onChange: handleFieldChange,
            isDisabled: isSubmitting,
            formFields,
            isEditMode: true,
        };

        // Pass handleInputChange for attachment fields
        if (fieldInfo.type?.toLowerCase() === "attach") {
            commonProps.handleInputChange = handleInputChange;
        }

        const FieldComponent =
            FormFields[fieldInfo.type?.toLowerCase()] || FormFields.default;

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
                                onClick={() => handleButtonClick(button)}
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
