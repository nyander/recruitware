import React from "react";
import AttachmentField from "./AttachmentField";
import { Table } from "lucide-react";
import TableField from "./TableField";
const MAX_SCROLL_HEIGHT = "250px"; // Adjustable max height

export const FormFields = {
    select: ({ field, fieldInfo, value, onChange, isDisabled, formFields }) => {
        const options = getSelectOptions(field, fieldInfo, formFields);
        const isLongList = options.length > 4;

        return (
            <select
                id={field}
                name={field}
                value={value || ""}
                onChange={(e) => onChange(field, e.target.value)}
                disabled={isDisabled}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    isDisabled ? "bg-gray-50 cursor-not-allowed opacity-75" : ""
                }`}
            >
                <option value="">Select {fieldInfo.label}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    },

    checkbox: ({
        field,
        fieldInfo,
        value,
        onChange,
        isDisabled,
        formFields,
    }) => {
        const options = getSelectOptions(field, fieldInfo, formFields);
        const selectedValues = value?.split(";").filter(Boolean) || [];

        return (
            <div
                className="space-y-2"
                style={{
                    maxHeight: options.length > 4 ? MAX_SCROLL_HEIGHT : "auto",
                    overflowY: options.length > 4 ? "auto" : "visible",
                    border: options.length > 4 ? "1px solid #ccc" : "none",
                    padding: options.length > 4 ? "8px" : "0",
                    borderRadius: "4px",
                }}
            >
                {options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={selectedValues.includes(option.value)}
                            onChange={(e) => {
                                const newValues = e.target.checked
                                    ? [...selectedValues, option.value]
                                    : selectedValues.filter(
                                          (v) => v !== option.value
                                      );
                                onChange(
                                    field,
                                    newValues.filter(Boolean).join(";")
                                );
                            }}
                            disabled={isDisabled}
                            className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${
                                isDisabled
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
    },

    html: ({ field, value, isDisabled }) => {
        return (
            <div
                id={field}
                className={`p-3 rounded-md bg-gray-50 border border-gray-200 ${
                    isDisabled ? "opacity-75" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: value }}
            />
        );
    },

    readonly: ({ field, value }) => {
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
    },

    attach: ({ field, value, isEditMode, isSubmitting, handleInputChange }) => {
        // Ensure the iframe renders correctly using AttachmentField
        return (
            <AttachmentField
                field={field}
                value={value}
                isEditMode={isEditMode}
                isSubmitting={isSubmitting}
                handleInputChange={handleInputChange}
            />
        );
    },

    table: (props) => {
        return <TableField {...props} />;
    },

    default: ({
        field,
        fieldInfo,
        value,
        onChange,
        isDisabled,
        formFields,
    }) => {
        return (
            <input
                type={fieldInfo.type?.toLowerCase() || "text"}
                id={field}
                name={field}
                value={value || ""}
                onChange={(e) => onChange(field, e.target.value)}
                disabled={isDisabled}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    isDisabled ? "bg-gray-50 cursor-not-allowed opacity-75" : ""
                }`}
            />
        );
    },
};

export const getSelectOptions = (field, fieldInfo, formFields) => {
    if (fieldInfo?.options?.length) {
        const firstOption = fieldInfo.options[0]?.value;

        if (
            typeof firstOption === "string" &&
            firstOption.startsWith("[LOOKUP-")
        ) {
            const lookupName = firstOption.slice(8, -1);
            const lookupField = formFields[lookupName];

            if (lookupField?.type === "Lookup") {
                return lookupField.options || [];
            }
        }
    }

    return fieldInfo.options || [];
};
