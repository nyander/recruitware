import _ from "lodash";

// Parse buttons and popups configuration
export const parseButtonsAndPopups = (
    buttonString,
    popupString,
    formSettings
) => {
    // Parse buttons
    const buttons = buttonString.split("@@").map((buttonStr) => {
        const [
            name,
            icon,
            popupId,
            fieldString,
            valueString,
            saveUrl,
            saveData,
            type = "button",
            style = "",
        ] = buttonStr.split(";");

        const condition =
            fieldString?.includes("=") || fieldString?.includes("!=")
                ? fieldString
                : null;

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
            type: type?.toLowerCase() || "button",
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
                    updates[key] = value.startsWith("$") ? value : value.trim();
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

    return { buttons, popups };
};

// Evaluate conditions for button visibility
export const evaluateCondition = (condition, data) => {
    if (!condition) {
        return false;
    }

    const cleanCondition = condition.replace(/[()]/g, "").trim();

    // Handle AND conditions
    if (cleanCondition.includes("AND")) {
        const conditions = cleanCondition.split("AND");
        return conditions.every((cond) => evaluateCondition(cond.trim(), data));
    }

    // Handle OR conditions
    if (cleanCondition.includes("OR")) {
        const conditions = cleanCondition.split("OR");
        return conditions.some((cond) => evaluateCondition(cond.trim(), data));
    }

    // Handle != comparison
    if (cleanCondition.includes("!=")) {
        const [field, expectedValue] = cleanCondition
            .split("!=")
            .map((s) => s.trim());
        const actualValue = data[field.toLowerCase()];
        return actualValue !== expectedValue;
    }

    // Handle = comparison
    if (cleanCondition.includes("=")) {
        const [field, expectedValue] = cleanCondition
            .split("=")
            .map((s) => s.trim());
        const actualValue = data[field.toLowerCase()];
        return actualValue === expectedValue;
    }

    return false;
};

// Get sort direction indicators
export const getSortDirectionIndicator = (column) => {
    if (!column.isSorted) return "";
    return column.isSortedDesc ? " ▼" : " ▲";
};

// Format cell value for display
export const formatCellValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value instanceof Date) return value.toLocaleDateString();
    return String(value);
};

// Resolve lookup options for dropdowns
export const resolveLookupOptions = (
    field,
    fieldInfo,
    structuredFormFields
) => {
    if (!fieldInfo?.options?.length) {
        return [];
    }

    const firstOption = fieldInfo.options[0]?.value;
    if (typeof firstOption === "string" && firstOption.startsWith("[LOOKUP-")) {
        const lookupName = firstOption.slice(8, -1);
        const lookupField = structuredFormFields[lookupName];

        if (lookupField?.type === "Lookup") {
            return lookupField.options || [];
        }
    }

    return fieldInfo.options;
};

// Process unique column values for filters
export const getUniqueColumnValues = (data, columns) => {
    return columns.reduce((acc, column) => {
        const columnId = typeof column === "string" ? column : column.Header;
        const values = new Set();

        data.forEach((row) => {
            const value = row[columnId] || row[columnId?.toLowerCase()];
            if (value !== null && value !== undefined && value !== "") {
                values.add(formatCellValue(value));
            }
        });

        acc[columnId] = Array.from(values).sort();
        return acc;
    }, {});
};

// Process available column values based on current filters
export const getAvailableColumnValues = (data, filters, crucialFilters) => {
    // First apply current filters
    const filteredData = data.filter((row) => {
        return Object.entries(filters).every(([columnId, selectedValues]) => {
            if (!selectedValues || selectedValues.length === 0) return true;
            const value = row[columnId] || row[columnId?.toLowerCase()];
            return selectedValues.includes(formatCellValue(value));
        });
    });

    // Then get available values for crucial filters
    return crucialFilters.reduce((acc, columnId) => {
        const values = new Set();
        filteredData.forEach((row) => {
            const value = row[columnId] || row[columnId?.toLowerCase()];
            if (value !== null && value !== undefined && value !== "") {
                values.add(formatCellValue(value));
            }
        });
        acc[columnId] = Array.from(values).sort();
        return acc;
    }, {});
};

// Handle special field values
export const processSpecialFieldValue = (value, auth) => {
    if (value === "$Author" || value === "$Author$") {
        return auth?.user?.name || "";
    }
    if (value === "$AuthorID" || value === "$AuthorID$") {
        return auth?.user?.id || "";
    }
    return value;
};

export const debounce = _.debounce;
export const throttle = _.throttle;
