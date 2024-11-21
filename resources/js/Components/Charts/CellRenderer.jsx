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
        (value.includes("<span") || value.includes("<div"));

    if (!isHTML) {
        return value;
    }

    return (
        <div
            className={`relative ${isHovered ? "z-50" : "z-0"}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="inline-flex gap-1 items-center"
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(value, {
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
