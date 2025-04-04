import React, { useState, useContext } from "react";
import DOMPurify from "dompurify";
import { PopupContext } from "../PopupContext";

const CellRenderer = ({ value }) => {
    const [isHovered, setIsHovered] = useState(false);
    const popupContext = useContext(PopupContext);

    if (!popupContext) {
        console.warn("PopupContext not found in CellRenderer");
        return value;
    }

    // Check if the value contains HTML or onclick attributes
    const isHTML =
        typeof value === "string" &&
        (value.includes("<") ||
            value.includes("&") ||
            value.includes("%7E") ||
            value.includes("~") ||
            value.includes("onclick"));

    if (!isHTML) {
        return value;
    }

    // Replace URL-encoded characters before sanitization
    let decodedValue = value.replace(/%7E/g, "~");

    // Configure DOMPurify to allow necessary attributes and tags
    const config = {
        ADD_TAGS: ["span", "a"],
        ADD_ATTR: ["onclick", "class", "style", "href"],
        ALLOW_DATA_ATTR: true,
        // This ensures onclick attributes are preserved
        FORBID_ATTR: [],
    };

    // Sanitize the HTML while preserving onclick attributes
    const sanitizedHTML = DOMPurify.sanitize(decodedValue, config);

    return (
        <div
            className={`relative ${isHovered ? "z-50" : "z-0"}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="inline-flex gap-1 items-center"
                dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
            />
        </div>
    );
};

export default CellRenderer;
