import React, { useState, useContext } from "react";
import { PopupContext } from "../PopupContext";

// Decode encoded fields and values (e.g., %7E to ~)
const decodeFieldsAndValues = (string) => string.replace(/%7E/g, "~");

// Extract parameters from the onclick attribute
const extractPopupParams = (onClickAttr) => {
    if (!onClickAttr) return null;

    const match = onClickAttr.match(
        /runPopButton\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\)/
    );

    if (!match) {
        console.error("No match found for onclick pattern");
        return null;
    }

    const [_, popupId, fieldsString, valuesString, saveUrl, saveData] = match;

    // Decode and split fields and values
    const fields = decodeFieldsAndValues(fieldsString).split("~");
    const values = decodeFieldsAndValues(valuesString).split("~");

    if (!fields || !values || fields.length !== values.length) {
        console.error(
            "Malformed fields or values. Ensure `~` separates fields and values."
        );
        return null;
    }

    // Map fields to values
    const initialData = {};
    fields.forEach((field, index) => {
        initialData[field.trim()] = values[index]?.trim() || "";
    });

    console.log("Extracted popup data:", {
        popupId,
        fields,
        values,
        initialData,
        saveUrl,
        saveData,
    });

    return {
        popupId,
        fields,
        initialData,
        saveUrl,
        saveData: saveData.replace(/\$/g, "|"), // Replace $ with |
    };
};

const decodeHTMLEntities = (text) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
};

const CellRenderer = ({ value }) => {
    const [isHovered, setIsHovered] = useState(false);
    const popupContext = useContext(PopupContext);

    if (!popupContext) {
        console.warn("PopupContext not found in CellRenderer");
        return value;
    }

    const handleClick = (e) => {
        console.log(
            "OnClick Attribute Before Parsing:",
            e.target.getAttribute("onclick")
        );

        if (e.target.hasAttribute("onclick")) {
            e.preventDefault();
            e.stopPropagation();

            const onClickValue = e.target.getAttribute("onclick");
            console.log("OnClick Value:", onClickValue);

            const popupParams = extractPopupParams(onClickValue);
            if (!popupParams) {
                console.error("No popup params extracted");
                return;
            }

            // Retrieve popup configuration from PopupContext
            const popupConfig =
                popupContext.formSettings.popups?.[popupParams.popupId];
            if (!popupConfig) {
                console.error(
                    `Popup configuration not found for ID: ${popupParams.popupId}`
                );
                console.log(
                    "Available Popups in Context:",
                    popupContext.formSettings.popups
                );
                return;
            }

            // Merge extracted data with popup configuration
            const mergedPopup = {
                ...popupConfig,
                initialData: popupParams.initialData,
                saveUrl: popupParams.saveUrl,
                saveData: popupParams.saveData,
            };

            console.log("Triggering Popup with data:", mergedPopup);
            popupContext.setActivePopup(mergedPopup);
        }
    };

    if (!value) return null;

    return (
        <div
            className={`relative ${isHovered ? "z-50" : "z-0"}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="inline-flex gap-1 items-center cursor-pointer"
                dangerouslySetInnerHTML={{ __html: value }}
                onClick={handleClick}
            />
        </div>
    );
};

export default CellRenderer;
