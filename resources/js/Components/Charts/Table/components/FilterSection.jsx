import React from "react";
import { ChevronDown } from "lucide-react";

// Calendar Filter Subcomponent
const CalendarFilter = ({
    title,
    onDateSelect,
    selectedDate,
    isSubmitting,
}) => {
    const handleDateChange = async (event) => {
        const date = event.target.value;
        if (date) {
            await onDateSelect(date);
        }
    };

    const handleKeyPress = async (event) => {
        if (event.key === "Enter") {
            const date = event.target.value;
            if (date) {
                await onDateSelect(date);
            }
        }
    };

    return (
        <div className="relative inline-block">
            <input
                type="date"
                className="p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                onChange={handleDateChange}
                onKeyPress={handleKeyPress}
                value={selectedDate || ""}
                disabled={isSubmitting}
            />
        </div>
    );
};

// MultiSelect Dropdown Subcomponent
const MultiSelectDropdown = ({
    options,
    value = [],
    onChange,
    placeholder,
    unavailableSelections = [],
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const displayValue = value.length
        ? `${value.length} selected${
              unavailableSelections.length
                  ? ` (${unavailableSelections.length} filtered)`
                  : ""
          }`
        : placeholder;

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border rounded-md p-2 cursor-pointer flex justify-between items-center bg-white
                    ${
                        unavailableSelections.length > 0
                            ? "border-yellow-300"
                            : ""
                    }`}
            >
                <span className="text-sm truncate">{displayValue}</span>
                <ChevronDown
                    className={`w-4 h-4 transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    <label className="flex items-center p-2 hover:bg-gray-50">
                        <input
                            type="checkbox"
                            checked={value.length === 0}
                            onChange={() => onChange([])}
                            className="mr-2"
                        />
                        <span className="text-sm">No Filter</span>
                    </label>
                    {options.map((option, index) => (
                        <label
                            key={index}
                            className="flex items-center p-2 hover:bg-gray-50"
                        >
                            <input
                                type="checkbox"
                                checked={value.includes(option)}
                                onChange={(e) => {
                                    const newValue = e.target.checked
                                        ? [...value, option]
                                        : value.filter((v) => v !== option);
                                    onChange(newValue);
                                }}
                                className="mr-2"
                            />
                            <span className="text-sm">{option}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const FilterSection = ({
    crucialFilters,
    parsedButtons,
    filterValues,
    handleFilterChange,
    handleDropdownChange,
    handleCalendarChange,
    dependentColumnValues,
    isSubmitting,
    structuredFormFields,
    parsedPopups,
    resolveLookupOptions,
    selectedDates,
}) => {
    // Separate buttons by type
    const dropdownButtons = parsedButtons.filter(
        (button) => button.type?.toLowerCase() === "dropdown"
    );
    const calendarButtons = parsedButtons.filter(
        (button) => button.type?.toLowerCase() === "calendar"
    );

    // Render crucial filters section
    const renderCrucialFilters = () => {
        if (!crucialFilters?.length) return null;

        return (
            <div className="flex flex-wrap gap-4 mt-4">
                {crucialFilters.map((filterName) => {
                    const availableOptions =
                        dependentColumnValues[filterName] || [];
                    const selectedValues = filterValues[filterName] || [];
                    const unavailableSelections = selectedValues.filter(
                        (value) => !availableOptions.includes(value)
                    );

                    return (
                        <div key={filterName} className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {filterName}
                                <span className="text-xs text-gray-500 ml-2">
                                    ({availableOptions.length} available)
                                </span>
                            </label>
                            <MultiSelectDropdown
                                options={availableOptions}
                                value={selectedValues}
                                onChange={(values) =>
                                    handleFilterChange(filterName, values)
                                }
                                placeholder={`Select ${filterName}`}
                                unavailableSelections={unavailableSelections}
                            />

                            {/* Selected values tags */}
                            {selectedValues.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {selectedValues.map((value) => (
                                        <span
                                            key={value}
                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                                ${
                                                    unavailableSelections.includes(
                                                        value
                                                    )
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                        >
                                            {value}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newValues =
                                                        selectedValues.filter(
                                                            (v) => v !== value
                                                        );
                                                    handleFilterChange(
                                                        filterName,
                                                        newValues
                                                    );
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
                })}
            </div>
        );
    };

    return (
        <div className="flex items-center gap-4">
            {/* Dropdown Buttons */}
            {dropdownButtons.length > 0 &&
                dropdownButtons.map((button) => (
                    <div key={button.name} className="flex-none">
                        <select
                            className="w-64 border rounded-md p-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            onChange={(e) =>
                                handleDropdownChange(button, e.target.value)
                            }
                            disabled={isSubmitting}
                            defaultValue=""
                        >
                            <option value="">{`Select ${button.name}`}</option>
                            {resolveLookupOptions(
                                parsedPopups[button.popupId]?.fields?.[0],
                                structuredFormFields[
                                    parsedPopups[button.popupId]?.fields?.[0]
                                ],
                                structuredFormFields
                            ).map((option, index) => (
                                <option
                                    key={index}
                                    value={option.value || option.label}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}

            {/* Calendar Buttons */}
            {calendarButtons.length > 0 &&
                calendarButtons.map((button) => (
                    <div key={button.name} className="flex-none">
                        <CalendarFilter
                            title={button.name}
                            onDateSelect={(date) =>
                                handleCalendarChange(button, date)
                            }
                            selectedDate={selectedDates[button.name]}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                ))}

            {/* Render crucial filters */}
            {renderCrucialFilters()}
        </div>
    );
};

export default FilterSection;
