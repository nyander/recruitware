import React, { useState, useContext } from "react";
import DOMPurify from "dompurify";
import { PopupContext } from "../PopupContext";

const extractPopupParams = (onClickAttr) => {
    if (!onClickAttr) return null;

    // Match the runPopButton pattern
    const match = onClickAttr.match(
        /runPopButton\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/
    );
    if (!match) return null;

    // Extract components
    const [_, popupId, fieldsString, valuesString] = match;
    const fields = fieldsString.split("~");
    const values = valuesString.split("~");

    // Create initial data object mapping fields to values
    const initialData = {};
    fields.forEach((field, index) => {
        initialData[field] = values[index] || "";
    });

    return {
        popupId,
        initialData,
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

    const { setActivePopup, formFields, formSettings } = popupContext;

    const handleClick = (e) => {
        const target = e.target;
        if (target.hasAttribute("onclick")) {
            const onClickValue = target.getAttribute("onclick");
            const popupParams = extractPopupParams(onClickValue);

            if (popupParams) {
                e.preventDefault();
                e.stopPropagation();

                // Get popup configuration from formSettings
                const popupConfig = formSettings[popupParams.popupId];
                if (!popupConfig) {
                    console.error(
                        `Popup configuration not found for ID: ${popupParams.popupId}`
                    );
                    return;
                }

                // Create popup data with initial values
                const popupData = {
                    ...popupConfig,
                    initialData: popupParams.initialData,
                };

                // Set active popup with initial data
                setActivePopup(popupData);
            }
        }
    };

    const isHTML =
        typeof value === "string" &&
        (value.includes("<") || value.includes("&") || value.includes("~")); // Include tilde since your data uses it as a separator

    if (!isHTML) {
        return value;
    }

    // Split the value by tildes and process each part
    const parts = value.split("~").map((part, index) => {
        // Decode HTML entities in each part
        const decodedPart = decodeHTMLEntities(part);

        // If it's a monetary value (contains £), wrap it in a span for styling
        if (part.includes("&pound;")) {
            return `<span class="font-medium">${decodedPart}</span>`;
        }

        return decodedPart;
    });

    // Join the parts back with spaces or any desired separator
    const processedValue = parts.join(" "); // or join with " • " for better visual separation

    return (
        <div
            className={`relative ${isHovered ? "z-50" : "z-0"}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="inline-flex gap-1 items-center"
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(processedValue, {
                        ADD_ATTR: ["onclick", "title"],
                        ADD_TAGS: ["span"],
                    }),
                }}
                onClick={handleClick}
            />
        </div>
    );
};

export default CellRenderer;
