import React from "react";
import * as Icons from "lucide-react"; // Import all icons from lucide-react

const TableActions = ({
    parsedButtons,
    setActivePopup,
    parsedPopups,
    selectedCellData,
    isSubmitting,
}) => {
    // Filter out non-dropdown buttons
    const regularButtons = parsedButtons.filter(
        (button) => button.type?.toLowerCase() !== "dropdown"
    );

    if (regularButtons.length === 0) return null;

    // Helper function to get icon component
    const getIconComponent = (iconName) => {
        // Convert snake_case or kebab-case to PascalCase
        const pascalCase = iconName
            .split(/[-_]/)
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join("");

        // Return the icon component if it exists in lucide-react
        return Icons[pascalCase];
    };

    return (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-2 justify-end">
                {regularButtons.map((button, index) => {
                    // Get the icon component if one is specified
                    const IconComponent = button.icon
                        ? getIconComponent(button.icon)
                        : null;

                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => {
                                const popupConfig =
                                    parsedPopups[button.popupId];
                                if (popupConfig) {
                                    const mergedPopup = {
                                        ...popupConfig,
                                        initialData:
                                            selectedCellData[0]?.popupParams
                                                ?.initialData || {},
                                        saveUrl:
                                            button.saveUrl ||
                                            popupConfig.saveUrl ||
                                            "",
                                        saveData:
                                            button.saveData ||
                                            popupConfig.saveData ||
                                            "",
                                    };
                                    setActivePopup(mergedPopup);
                                }
                            }}
                            disabled={isSubmitting}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                button.style || ""
                            } ${
                                isSubmitting
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            {IconComponent && (
                                <span className="mr-2">
                                    <IconComponent size={18} />
                                </span>
                            )}
                            {button.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TableActions;
