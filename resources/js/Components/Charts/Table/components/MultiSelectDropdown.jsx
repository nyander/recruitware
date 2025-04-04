import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";

const MultiSelectDropdown = ({
    options = [],
    value = [],
    onChange,
    placeholder = "Select options",
    maxHeight = "250px",
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

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
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((option) =>
        option.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayValue = value.length
        ? `${value.length} selected`
        : placeholder;

    const toggleOption = (option) => {
        const newValue = value.includes(option)
            ? value.filter((v) => v !== option)
            : [...value, option];
        onChange(newValue);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full border rounded-md p-2 cursor-pointer flex justify-between items-center bg-white
                    ${
                        disabled
                            ? "bg-gray-100 cursor-not-allowed"
                            : "hover:border-gray-400"
                    }
                    ${
                        isOpen
                            ? "border-indigo-500 ring-1 ring-indigo-500"
                            : "border-gray-300"
                    }`}
            >
                <span className="text-sm truncate">{displayValue}</span>
                <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
                    {/* Search input */}
                    <div className="p-2 border-b">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-full px-8 py-1 border rounded-md text-sm focus:outline-none focus:border-indigo-500"
                            />
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options list */}
                    <div style={{ maxHeight }} className="overflow-y-auto">
                        {/* "Select All" option */}
                        <label className="flex items-center p-2 hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={value.length === options.length}
                                onChange={() => {
                                    onChange(
                                        value.length === options.length
                                            ? []
                                            : options
                                    );
                                }}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm">Select All</span>
                        </label>

                        {/* Individual options */}
                        {filteredOptions.map((option, index) => (
                            <label
                                key={index}
                                className="flex items-center p-2 hover:bg-gray-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={value.includes(option)}
                                    onChange={() => toggleOption(option)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm">{option}</span>
                            </label>
                        ))}

                        {filteredOptions.length === 0 && (
                            <div className="p-2 text-sm text-gray-500 text-center">
                                No options found
                            </div>
                        )}
                    </div>

                    {/* Selected count */}
                    {value.length > 0 && (
                        <div className="p-2 border-t text-xs text-gray-500">
                            {value.length} of {options.length} selected
                        </div>
                    )}
                </div>
            )}

            {/* Selected values tags */}
            {value.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {value.map((selectedValue, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                            {selectedValue}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOption(selectedValue);
                                }}
                                className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-blue-200 focus:outline-none"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
