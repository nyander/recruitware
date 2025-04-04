import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateForm from "@/Components/CandidateForm";
import CandidateButtonPopup from "@/Components/CandidateButtonPopup";

const Edit = ({ auth, formSettings, formFields = {}, errors, menu }) => {
    const [activeTab, setActiveTab] = useState("");
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

    const [activePopup, setActivePopup] = useState(null);
    const [parsedButtons, setParsedButtons] = useState([]);
    const [parsedPopups, setParsedPopups] = useState({});

    useEffect(() => {
        if (formSettings && formSettings.tabs_Sections) {
            setActiveTab(formSettings.tabs_Sections[0]?.label || "");

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

    useEffect(() => {
        if (formSettings?.buttons && formSettings?.popups) {
            parseButtonsAndPopups(formSettings.buttons, formSettings.popups);
        }
    }, [formSettings]);

    const evaluateCondition = (condition, data) => {
        if (!condition) {
            console.log("No condition specified, defaulting to false");
            return false;
        }

        const cleanCondition = condition.replace(/[()]/g, "").trim();

        // Handle AND conditions
        if (cleanCondition.includes("AND")) {
            const conditions = cleanCondition.split("AND");
            return conditions.every((cond) =>
                evaluateCondition(cond.trim(), data)
            );
        }

        // Handle OR conditions
        if (cleanCondition.includes("OR")) {
            const conditions = cleanCondition.split("OR");
            return conditions.some((cond) =>
                evaluateCondition(cond.trim(), data)
            );
        }

        // Handle != comparison
        if (cleanCondition.includes("!=")) {
            const [field, expectedValue] = cleanCondition
                .split("!=")
                .map((s) => s.trim());
            const actualValue = data[field.toLowerCase()];
            return actualValue !== expectedValue; // Returns true if the values are different
        }

        // Handle = comparison
        if (cleanCondition.includes("=")) {
            const [field, expectedValue] = cleanCondition
                .split("=")
                .map((s) => s.trim());
            const actualValue = data[field.toLowerCase()];
            return actualValue === expectedValue; // Returns true if the values are equal
        }

        return false;
    };

    const parseButtonsAndPopups = (buttonString, popupString) => {
        const buttons = buttonString.split("@@").map((buttonStr, index) => {
            const [
                name,
                icon,
                popupId,
                fieldString,
                valueString,
                saveUrl,
                saveData,
                type = "button", // Added type parameter
                style = "", // Added style parameter
            ] = buttonStr.split(";");

            // Evaluate condition if present (backward compatibility)
            const condition =
                fieldString?.includes("=") || fieldString?.includes("!=")
                    ? fieldString
                    : null;

            // Only evaluate condition if it exists
            const isVisible = condition
                ? !evaluateCondition(condition, formSettings.data)
                : true;

            return {
                name,
                icon,
                popupId: popupId?.replace("loadPop_", ""),
                fields: !condition && fieldString ? fieldString.split("~") : [],
                values: valueString ? valueString.split("~") : [],
                saveUrl: saveUrl || "",
                saveData: saveData || "",
                type: type || "button",
                style: style || "",
                visible: isVisible,
            };
        });

        // Parse popups
        const popups = {};
        popupString.split("@@").forEach((popupStr) => {
            const [id, title, columns, fields, buttonStr] = popupStr.split("~");
            const popupButtons = buttonStr.split("$$").map((btn) => {
                const [name, ...actions] = btn.split(";");

                if (actions.length === 1 && actions[0] === "closePopup()") {
                    return { name, action: "closePopup" };
                }

                const updates = {};
                actions.forEach((update) => {
                    const [key, value] = update.split("=");
                    if (key && value) {
                        updates[key] = value.startsWith("$")
                            ? value
                            : value.trim();
                    }
                });

                return { name, updates };
            });

            popups[id] = {
                id,
                title,
                columns: parseInt(columns),
                fields: fields.split(";"),
                buttons: popupButtons,
            };
        });

        setParsedButtons(buttons);
        setParsedPopups(popups);
    };

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
            setButtonStates((prev) => ({ ...prev, edit: true }));
            setIsEditMode(true);
        } finally {
            setTimeout(() => {
                setButtonStates((prev) => ({ ...prev, edit: false }));
            }, 500);
        }
    };

    const handleCancel = async () => {
        try {
            setButtonStates((prev) => ({ ...prev, cancel: true }));
            setCurrentFormValues(initialFormValues);
            setChangedFields({});
            setIsEditMode(false);
        } finally {
            setTimeout(() => {
                setButtonStates((prev) => ({ ...prev, cancel: false }));
            }, 500);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!Object.keys(changedFields).length) return;

        try {
            setButtonStates((prev) => ({ ...prev, save: true }));
            setIsSubmitting(true);

            await router.post(route("candidates.store"), {
                id: formSettings.data.id,
                changes: changedFields,
                saveUrl: formSettings.saveURL,
                saveData: formSettings.saveData,
            });

            setIsEditMode(false);
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setIsSubmitting(false);
            setTimeout(() => {
                setButtonStates((prev) => ({ ...prev, save: false }));
            }, 500);
        }
    };

    const handlePopupSubmit = async (updates) => {
        try {
            setIsSubmitting(true);

            // Debug logging to see popup submission data
            console.log("Submitting popup data:", {
                rawData: updates,
                attachments: Object.entries(updates)
                    .filter(
                        ([key, value]) =>
                            formFields[key]?.type?.toLowerCase() === "attach"
                    )
                    .reduce(
                        (acc, [key, value]) => ({ ...acc, [key]: value }),
                        {}
                    ),
            });

            const processedUpdates = Object.entries(updates).reduce(
                (acc, [key, value]) => {
                    // Handle special values
                    if (value === "$Author" || value === "$Author$") {
                        value = auth.user.name;
                    }
                    if (value === "$AuthorID" || value === "$AuthorID$") {
                        value = auth.user.id;
                    }

                    acc[key] = value;
                    return acc;
                },
                {}
            );

            await router.post(route("candidates.store"), {
                id: formSettings.data.id,
                changes: processedUpdates,
                saveUrl: updates.saveUrl || formSettings.saveURL,
                saveData: updates.saveData || formSettings.saveData,
            });

            setActivePopup(null);
        } catch (error) {
            console.error("Popup submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasUnsavedChanges = Object.keys(changedFields).length > 0;

    const renderButton = (button) => {
        if (button.type?.toLowerCase() === "dropdown") {
            const popupConfig = parsedPopups[button.popupId];
            const fields = button.fields || popupConfig?.fields || [];
            const values = button.values || popupConfig?.values || [];

            const options = fields.map((field, index) => ({
                label: field,
                value: values[index] || field,
            }));

            return (
                <div className="relative inline-block w-64">
                    <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        onChange={(e) =>
                            handleDropdownChange(button, e.target.value)
                        }
                        disabled={isSubmitting}
                        defaultValue=""
                    >
                        <option value="">{`Select ${button.name}`}</option>
                        {options.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <button
                type="button"
                onClick={() => setActivePopup(parsedPopups[button.popupId])}
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    button.style || ""
                }`}
            >
                {button.name}
            </button>
        );
    };

    const handleDropdownChange = async (button, value) => {
        try {
            setIsSubmitting(true);
            console.log("Dropdown change:", {
                button,
                value,
                popupConfig: parsedPopups[button.popupId],
            });

            // Create the update data using the first field
            const updates = {
                [button.fields[0]]: value,
            };

            // Log the updates being sent
            console.log("Submitting updates:", updates);

            await handlePopupSubmit({
                changes: updates,
                saveUrl: button.saveUrl,
                saveData: button.saveData,
            });
        } catch (error) {
            console.error("Dropdown change error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderButtons = () => {
        if (!parsedButtons.length) return null;

        return (
            <div className="px-4 py-3  border-t border-gray-200">
                <div className="flex gap-2 justify-end">
                    {parsedButtons
                        .filter((button) => button.visible)
                        .map((button, index) => (
                            <div key={index}>{renderButton(button)}</div>
                        ))}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            auth={auth}
            menu={menu}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit
                </h2>
            }
        >
            <Head
                title={
                    formSettings.data.id ? "Edit Candidate" : "Create Candidate"
                }
            />

            <div className="py-4">
                <div className="mx-auto sm:px-6 lg:px-8">
                    <form
                        method="POST"
                        onSubmit={handleSubmit}
                        action={route("candidates.store")}
                    >
                        <input
                            type="hidden"
                            name="_token"
                            value={document
                                .querySelector('meta[name="csrf-token"]')
                                .getAttribute("content")}
                        />
                        <input
                            type="hidden"
                            name="saveUrl"
                            value={formSettings.saveURL}
                        />
                        <input
                            type="hidden"
                            name="saveData"
                            value={formSettings.saveData}
                        />

                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    disabled={
                                        isSubmitting ||
                                        Object.values(buttonStates).some(
                                            (state) => state
                                        )
                                    }
                                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity duration-150 ${
                                        isSubmitting ||
                                        Object.values(buttonStates).some(
                                            (state) => state
                                        )
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    ← Back
                                </button>
                                <div className="flex gap-2">
                                    {!isEditMode ? (
                                        <button
                                            type="button"
                                            onClick={handleEdit}
                                            disabled={
                                                buttonStates.edit ||
                                                isSubmitting
                                            }
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity duration-150 ${
                                                buttonStates.edit ||
                                                isSubmitting
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {buttonStates.edit
                                                ? "Enabling Edit..."
                                                : "Edit"}
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                disabled={
                                                    buttonStates.cancel ||
                                                    isSubmitting
                                                }
                                                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity duration-150 ${
                                                    buttonStates.cancel ||
                                                    isSubmitting
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                }`}
                                            >
                                                {buttonStates.cancel
                                                    ? "Canceling..."
                                                    : "Cancel"}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={
                                                    !hasUnsavedChanges ||
                                                    buttonStates.save ||
                                                    isSubmitting
                                                }
                                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-opacity duration-150 ${
                                                    !hasUnsavedChanges ||
                                                    buttonStates.save ||
                                                    isSubmitting
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                }`}
                                            >
                                                {buttonStates.save
                                                    ? "Saving..."
                                                    : "Save"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {renderButtons()}

                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex h-full">
                                    <div className="w-1/4 pr-4 overflow-y-auto border-r border-gray-200">
                                        <nav
                                            className="space-y-1"
                                            aria-label="Sidebar"
                                        >
                                            {formSettings.tabs_Sections.map(
                                                (tab) => (
                                                    <button
                                                        key={tab.label}
                                                        type="button"
                                                        onClick={() =>
                                                            setActiveTab(
                                                                tab.label
                                                            )
                                                        }
                                                        disabled={
                                                            isSubmitting ||
                                                            Object.values(
                                                                buttonStates
                                                            ).some(
                                                                (state) => state
                                                            )
                                                        }
                                                        className={`${
                                                            activeTab ===
                                                            tab.label
                                                                ? "bg-gray-100 text-gray-900"
                                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                        } group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-opacity duration-150 ${
                                                            isSubmitting ||
                                                            Object.values(
                                                                buttonStates
                                                            ).some(
                                                                (state) => state
                                                            )
                                                                ? "opacity-50 cursor-not-allowed"
                                                                : ""
                                                        }`}
                                                    >
                                                        {tab.label}
                                                    </button>
                                                )
                                            )}
                                        </nav>
                                    </div>

                                    <div className="w-3/4 pl-4 overflow-y-auto">
                                        <CandidateForm
                                            activeTab={activeTab}
                                            formSettings={formSettings}
                                            formFields={formFields}
                                            handleFieldChange={
                                                handleFieldChange
                                            }
                                            isEditMode={isEditMode}
                                            formData={currentFormValues}
                                            isSubmitting={
                                                isSubmitting ||
                                                Object.values(
                                                    buttonStates
                                                ).some((state) => state)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {Object.keys(errors).length > 0 && (
                        <div className="mt-4 p-4 bg-red-100 rounded-md">
                            <h3 className="text-red-800 font-semibold">
                                Errors:
                            </h3>
                            <ul className="list-disc list-inside">
                                {Object.entries(errors).map(([key, value]) => (
                                    <li key={key} className="text-red-700">
                                        {value}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <CandidateButtonPopup
                isOpen={!!activePopup}
                onClose={() => setActivePopup(null)}
                popup={{
                    ...activePopup,
                    initialData: {
                        ...currentFormValues,
                        ...(activePopup?.initialData || {}),
                    },
                }}
                formFields={formFields}
                formSettings={{
                    ...formSettings,
                    saveURL: activePopup?.saveUrl || formSettings.saveURL,
                    saveData: activePopup?.saveData || formSettings.saveData,
                }}
                formData={currentFormValues} // Add this line to pass formData
                handleSubmit={handlePopupSubmit}
                isSubmitting={isSubmitting}
            />
        </AuthenticatedLayout>
    );
};

export default Edit;
