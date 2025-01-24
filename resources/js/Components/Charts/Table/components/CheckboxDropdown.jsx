import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, X, Check } from "lucide-react";

const CheckboxDropdown = ({
    options = [],
    selectedValues = [],
    onChange,
    title = "Select Options",
    isDisabled = false,
    isSubmitting = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
    });
    const dropdownRef = useRef(null);

    // Filter options based on search term
    useEffect(() => {
        if (searchTerm) {
            const filtered = options.filter(
                (option) =>
                    option.label
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    option.value
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
            setFilteredOptions(filtered);
        } else {
            setFilteredOptions(options);
        }
    }, [searchTerm, options]);

    // Handle dropdown positioning
    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY + 4,
                    left: rect.left,
                });
            }
        };

        if (isOpen) {
            updatePosition();
            window.addEventListener("scroll", updatePosition);
            window.addEventListener("resize", updatePosition);

            return () => {
                window.removeEventListener("scroll", updatePosition);
                window.removeEventListener("resize", updatePosition);
            };
        }
    }, [isOpen]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleToggle = () => {
        if (!isDisabled && !isSubmitting) {
            setIsOpen(!isOpen);
        }
    };

    const handleSelect = (option) => {
        if (isDisabled || isSubmitting) return;

        const value = option.value;
        let newSelected;
        if (selectedValues.includes(value)) {
            newSelected = selectedValues.filter((v) => v !== value);
            console.log(
                "Deselected:",
                option.label,
                "Current selections:",
                newSelected
            );
        } else {
            newSelected = [...selectedValues, value];
            console.log(
                "Selected:",
                option.label,
                "Current selections:",
                newSelected
            );
        }

        console.log("All selected values:", {
            optionValue: value,
            optionLabel: option.label,
            currentSelections: newSelected,
            totalSelected: newSelected.length,
        });

        onChange(newSelected);
    };

    const handleSelectAll = () => {
        if (isDisabled || isSubmitting) return;

        const newValues =
            selectedValues.length === options.length
                ? []
                : options.map((opt) => opt.value);

        console.log("Select All action:", {
            action:
                selectedValues.length === options.length
                    ? "Deselected All"
                    : "Selected All",
            previousCount: selectedValues.length,
            newCount: newValues.length,
            allValues: newValues,
        });

        onChange(newValues);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        if (isDisabled || isSubmitting) return;

        console.log("Cleared all selections");
        onChange([]);
        setSearchTerm("");
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Dropdown Button */}
            <button
                onClick={handleToggle}
                disabled={isDisabled || isSubmitting}
                className={`w-full px-4 py-2 text-left bg-white border rounded-lg shadow-sm flex items-center justify-between
                    ${
                        isDisabled || isSubmitting
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50"
                    }
                    ${
                        isOpen
                            ? "ring-2 ring-indigo-500"
                            : "focus:ring-2 focus:ring-indigo-500"
                    }`}
            >
                <span className="flex items-center gap-2">
                    <span className="font-medium">{title}</span>
                    {selectedValues.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                            {selectedValues.length} selected
                        </span>
                    )}
                </span>
                <div className="flex items-center gap-2">
                    {selectedValues.length > 0 && (
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-200 rounded-full"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                    <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                            isOpen ? "transform rotate-180" : ""
                        }`}
                    />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="fixed z-50 min-w-[256px] bg-white border rounded-lg shadow-lg"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownRef.current
                            ? dropdownRef.current.offsetWidth
                            : "auto",
                    }}
                >
                    {/* Search Input */}
                    <div className="p-2 border-b">
                        <input
                            type="text"
                            placeholder="Search options..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Select All Option */}
                    <div className="p-2 border-b">
                        <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <div className="relative flex items-center justify-center w-4 h-4">
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedValues.length === options.length
                                    }
                                    onChange={handleSelectAll}
                                    className="absolute w-4 h-4 opacity-0"
                                />
                                <div
                                    className={`absolute w-4 h-4 border rounded ${
                                        selectedValues.length === options.length
                                            ? "border-indigo-600 bg-indigo-600"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {selectedValues.length ===
                                        options.length && (
                                        <Check className="w-3 h-3 text-white" />
                                    )}
                                </div>
                            </div>
                            <span className="ml-3 text-sm font-medium">
                                Select All
                                {selectedValues.length > 0 &&
                                    selectedValues.length < options.length &&
                                    ` (${selectedValues.length}/${options.length})`}
                            </span>
                        </label>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-auto">
                        {filteredOptions.map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                            >
                                <div className="relative flex items-center justify-center w-4 h-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(
                                            option.value
                                        )}
                                        onChange={() => handleSelect(option)}
                                        className="absolute w-4 h-4 opacity-0"
                                    />
                                    <div
                                        className={`absolute w-4 h-4 border rounded ${
                                            selectedValues.includes(
                                                option.value
                                            )
                                                ? "border-indigo-600 bg-indigo-600"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        {selectedValues.includes(
                                            option.value
                                        ) && (
                                            <Check className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                </div>
                                <span className="ml-3 text-sm">
                                    {option.label}
                                </span>
                            </label>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className="p-4 text-center text-gray-500">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckboxDropdown;
