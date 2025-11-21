import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const DropdownFieldInput = (
    {
        mention,
        parseDropdownOptions,
        getSelectedValues,
        handleDropdownChange
    }: any
) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownOptions = parseDropdownOptions(mention["data-dropdown-options"]);
    const selectedValues = getSelectedValues(mention);
    const isMultiselect = mention["data-dropdown-multiselect"];
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = dropdownOptions.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleOption = (optionValue: string) => {
        let newSelectedValues: string[];

        if (isMultiselect) {
            if (selectedValues.includes(optionValue)) {
                newSelectedValues = selectedValues.filter(v => v !== optionValue);
            } else {
                newSelectedValues = [...selectedValues, optionValue];
            }
        } else {
            newSelectedValues = [optionValue];
            setIsOpen(false);
        }

        handleDropdownChange(mention.mention_id, newSelectedValues);
    };

    const clearSelection = () => {
        handleDropdownChange(mention.mention_id, []);
        setSearchTerm("");
    };

    const displayValue = selectedValues.length > 0
        ? selectedValues.join(", ")
        : "Select options...";


    return (
        <div ref={containerRef} className="relative w-full dropdown-container">
            <Input
                value={displayValue}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                readOnly
                className="w-full cursor-pointer"
                placeholder="Select options..."
            />

            <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            >
                <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-[9999] w-[300px] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto top-full">
                    <div className="p-2 border-b">
                        <Input
                            placeholder="Search options..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedValues.includes(option.value) ? "bg-blue-50" : ""
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(option.value);
                                    }}
                                >
                                    {isMultiselect ? (
                                        <input
                                            type="checkbox"
                                            checked={selectedValues.includes(option.value)}
                                            onChange={() => toggleOption(option.value)}
                                            className="mr-2 h-4 w-4"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <input
                                            type="radio"
                                            checked={selectedValues.includes(option.value)}
                                            onChange={() => toggleOption(option.value)}
                                            className="mr-2 h-4 w-4"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    )}
                                    <span className="flex-1">{option.value}</span>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedValues.length > 0 && (
                        <div className="p-2 border-t sticky bottom-0 bg-white">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearSelection}
                                className="w-full"
                            >
                                Clear
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default DropdownFieldInput;