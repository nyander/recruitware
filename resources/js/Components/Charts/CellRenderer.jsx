import { useState } from "react";
import DOMPurify from "dompurify";

const CellRenderer = ({ value }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Check if the value is HTML content
    const isHTML =
        typeof value === "string" &&
        (value.includes("<span") || value.includes("<div"));

    if (!isHTML) {
        return value; // Return plain text if not HTML
    }

    // For HTML content, render it safely
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
                        ADD_ATTR: ["onclick", "title"], // Allow specific attributes
                        ADD_TAGS: ["span"], // Allow specific tags
                    }),
                }}
                onClick={(e) => {
                    // Extract and handle onclick events
                    const target = e.target;
                    if (target.hasAttribute("onclick")) {
                        const onClickValue = target.getAttribute("onclick");
                        if (onClickValue.includes("runPopButton")) {
                            try {
                                // Parse the runPopButton parameters
                                const matches = onClickValue.match(
                                    /runPopButton\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/
                                );
                                if (matches) {
                                    const [_, popupId, fields, values] =
                                        matches;
                                    e.preventDefault();
                                    // You can handle the popup trigger here
                                    console.log("Popup triggered:", {
                                        popupId,
                                        fields,
                                        values,
                                    });
                                    // TODO: Implement your popup handling logic
                                }
                            } catch (error) {
                                console.error(
                                    "Error parsing onclick event:",
                                    error
                                );
                            }
                        }
                    }
                }}
            />
        </div>
    );
};

export default CellRenderer;
