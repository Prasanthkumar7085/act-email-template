import { useState, useMemo, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

const DropdownConfigDialog = ({
    configDialogOpen,
    setConfigDialogOpen,
    currentMention,
    dropdownOptions,
    addDropdownOption,
    updateDropdownOption,
    removeDropdownOption,
    saveDropdownConfig,
}: any) => {
    const [isMultiselect, setIsMultiselect] = useState(false);

    const duplicateValues = useMemo(() => {
        const values = dropdownOptions.map((opt: any) => opt.value.trim().toLowerCase());
        return values.filter((val: string, idx: number) => values.indexOf(val) !== idx && val !== "");
    }, [dropdownOptions]);

    const hasDuplicates = duplicateValues.length > 0;

    const canSave =
        dropdownOptions.length > 0 &&
        !hasDuplicates &&
        dropdownOptions.every(
            (opt: any) => opt.value.trim() !== ""
        );

    useEffect(() => {
        setIsMultiselect(currentMention?.["data-dropdown-multiselect"] == "true" || currentMention?.["data-dropdown-multiselect"] ? true : false);
    }, [currentMention, configDialogOpen]);

    return (
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
            <DialogContent className="sm:max-w-[600px] bg-white">
                <DialogHeader>
                    <DialogTitle>Configure Dropdown Options</DialogTitle>
                    <DialogDescription>
                        Add, edit, or remove options for this dropdown field.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="multiselect"
                            checked={isMultiselect}
                            onChange={(e) => setIsMultiselect(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="multiselect" className="text-sm font-medium">
                            Allow Multiple Selection
                        </label>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Dropdown Options</label>
                            <Button
                                type="button"
                                onClick={addDropdownOption}
                                size="sm"
                                variant="outline"
                            >
                                Add Option
                            </Button>
                        </div>

                        <div className="max-h-60 overflow-y-auto border rounded-md">
                            {dropdownOptions.map((option: any, index: number) => {
                                const isDuplicate =
                                    duplicateValues.includes(option.value.trim().toLowerCase());

                                return (
                                    <div
                                        key={option.id}
                                        className="flex items-center space-x-2 p-3 border-b last:border-b-0"
                                    >
                                        <Input
                                            value={option.value}
                                            onChange={(e) =>
                                                updateDropdownOption(index, "value", e.target.value)
                                            }
                                            placeholder="Option value"
                                            className={`flex-1 ${isDuplicate ? "border-red-500" : ""}`}
                                        />

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeDropdownOption(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                );
                            })}

                            {dropdownOptions.length === 0 && (
                                <div className="p-4 text-center text-gray-500">
                                    No options added yet
                                </div>
                            )}
                        </div>
                    </div>

                    {hasDuplicates && (
                        <p className="text-sm text-red-600">
                            Duplicate options are not allowed.
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setConfigDialogOpen(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={!canSave}
                        className={!canSave ? "opacity-50 cursor-not-allowed" : ""}
                        onClick={() => saveDropdownConfig(dropdownOptions, isMultiselect)}
                    >
                        Save Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DropdownConfigDialog;
