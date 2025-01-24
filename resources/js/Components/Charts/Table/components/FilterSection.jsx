import React from "react";
import { ChevronDown } from "lucide-react";
import CheckboxDropdown from "./CheckboxDropdown";

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
    const checkboxButtons = parsedButtons.filter(
        (button) => button.type?.toLowerCase() === "checkbox"
    );
    const calendarButtons = parsedButtons.filter(
        (button) => button.type?.toLowerCase() === "calendar"
    );

    return (
        <div className="flex items-center gap-4 p-2">
            {/* Checkbox Buttons */}
            {checkboxButtons.length > 0 &&
                checkboxButtons.map((button) => {
                    const options = resolveLookupOptions(
                        parsedPopups[button.popupId]?.fields?.[0],
                        structuredFormFields[
                            parsedPopups[button.popupId]?.fields?.[0]
                        ],
                        structuredFormFields
                    ).map((option) => ({
                        value: option.value || option.label,
                        label: option.label,
                    }));

                    return (
                        <div key={button.name} className="flex-none w-64">
                            <CheckboxDropdown
                                title={button.name}
                                options={options}
                                selectedValues={filterValues[button.name] || []}
                                onChange={(values) =>
                                    handleDropdownChange(button, values)
                                }
                                isDisabled={isSubmitting}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    );
                })}

            {/* Regular Dropdown Buttons */}
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
        </div>
    );
};

export default FilterSection;
