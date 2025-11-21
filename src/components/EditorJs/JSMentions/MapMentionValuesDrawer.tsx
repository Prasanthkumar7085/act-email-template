import { AlertCircle, Calendar, CheckCircle2, Clock, Search, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import DropdownFieldInput from "./DropdownFieldInput";
import MentionInputField from "./MentionInputField";

const MapMentionsValuesSheet = ({
    isOpen,
    onClose,
    filters,
    handleFilterChange,
    isDocumentPreview,
    users,
    userFields,
    clearFilters,
    activeFiltersCount,
    filteredMentions,
    validationErrors,
    validationLabelErrors,
    isFieldEditable,
    handleTableEdit,
    handleDropdownChange,
    handleClearField,
    showClearButton,
    getInputProps,
    parseDropdownOptions,
    getSelectedValues,
    handleNativeInputChange,
    formatTimeForDisplay,
    dateFormatOptions,
    showSkipForMentions,
    builderType,
    handleMapMentions,
    handleSave,
}: any) => {

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className={`overflow-auto fixed inset-x-0 bottom-2 left-0 p-0! h-[43dvh] w-1/3 `}
                style={{
                    transform: `scale(${3.0})`,
                    transformOrigin: "left",
                }}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <SheetHeader className="sticky top-0 z-20 bg-white border-b p-4 space-y-1">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg font-semibold">Edit Mentions</SheetTitle>
                        <Badge variant="outline" className="px-2 py-0 text-xs font-bold text-yellow-600">
                            {filteredMentions.length}
                        </Badge>
                    </div>
                    <SheetDescription className="text-xs">
                        {isDocumentPreview ? "Manage mention fields" : "Edit mention values"}
                    </SheetDescription>
                </SheetHeader>
                <div className="h-[calc(33dvh-155px)] overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-white border-b p-3 space-y-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <Input
                                placeholder="Search labels…"
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                className="pl-7 h-8 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-1">
                            <Select
                                value={filters.fieldType}
                                onValueChange={(v) => handleFilterChange("fieldType", v)}
                            >
                                <SelectTrigger className="flex-1 h-8 text-sm">
                                    <SelectValue placeholder="All Fields" />
                                </SelectTrigger>
                                <SelectContent className="bg-white w-1/3 " style={{
                                    transform: `scale(${2.0})`,
                                    transformOrigin: "left",
                                }}>
                                    <SelectItem value="all">All Fields</SelectItem>
                                    {userFields.map((f) => (
                                        <SelectItem key={f.key} value={f.key}>
                                            {f.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {isDocumentPreview && (
                                <Select
                                    value={filters.user}
                                    onValueChange={(v) => handleFilterChange("user", v)}
                                >
                                    <SelectTrigger className="flex-1 h-8 text-sm">
                                        <SelectValue placeholder="All Users" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white" style={{
                                        transform: `scale(${3.0})`,
                                        transformOrigin: "left",
                                    }}>
                                        <SelectItem value="all">All Users</SelectItem>
                                        {users?.map((u) => (
                                            <SelectItem key={u._id} value={u._id}>
                                                {u.name?.trim() || u.contact_type_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                        </div>

                        {activeFiltersCount > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">
                                    {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
                                </span>
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                                    <X className="h-3 w-3 mr-1" />
                                    Clear
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="overflow-y-auto p-3 space-y-2">
                        {filteredMentions.map((mention, idx) => {
                            const hasError =
                                !!validationErrors[mention.mention_id] ||
                                !!validationLabelErrors[mention.mention_id];
                            const isRequiredEmpty =
                                mention.required && !mention.custom_value?.trim();

                            return (
                                <div
                                    key={mention.mention_id}
                                    data-mention-scroll-id={mention.mention_id}
                                    className={`rounded-lg border p-3 transition-colors ${hasError || isRequiredEmpty
                                        ? "border-red-200 bg-red-50"
                                        : "border-gray-200 bg-white"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 line-clamp-1">
                                                {mention.field_label || "Untitled Field"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {hasError || isRequiredEmpty ? (
                                                <AlertCircle className="h-3 w-3 text-red-500" />
                                            ) : (
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            )}
                                            {mention.required && (
                                                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 px-1 py-0">
                                                    Required
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-2">
                                        <label className="text-xs font-medium text-gray-700">Label</label>
                                        <Input
                                            placeholder="Field label"
                                            value={mention.field_label}
                                            onChange={(e) =>
                                                isFieldEditable("field_label") &&
                                                handleTableEdit(
                                                    mention.mention_id,
                                                    "field_label",
                                                    e.target.value
                                                )
                                            }
                                            readOnly={!isFieldEditable("field_label")}
                                            className={validationLabelErrors[mention.mention_id] ? "border-red-300 h-8" : "h-8"}
                                            disabled={true}
                                        />
                                        {validationLabelErrors[mention.mention_id] && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-2 w-2" />
                                                {validationLabelErrors[mention.mention_id]}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-700">Value</label>
                                        <div className="flex gap-1">
                                            <div className="flex-1">
                                                {mention.field_key === "dropdown" ? (
                                                    <DropdownFieldInput
                                                        mention={mention}
                                                        parseDropdownOptions={parseDropdownOptions}
                                                        getSelectedValues={getSelectedValues}
                                                        handleDropdownChange={handleDropdownChange}
                                                    />
                                                ) : mention.field_key === "date" || mention.field_key === "date_time" ? (
                                                    <div className="relative">
                                                        <Input
                                                            {...getInputProps(mention)}
                                                            value={mention.custom_value || ""}
                                                            onChange={(e) =>
                                                                handleTableEdit(
                                                                    mention.mention_id,
                                                                    "custom_value",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="pr-8 h-8"
                                                        />
                                                        <input
                                                            type={mention.field_key === "date" ? "date" : "datetime-local"}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e) =>
                                                                handleNativeInputChange(
                                                                    e,
                                                                    mention[
                                                                    mention.field_key === "date"
                                                                        ? "date_format"
                                                                        : "date_time_format"
                                                                    ] || "MM-dd-yyyy",
                                                                    mention
                                                                )
                                                            }
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            onClick={(e) => {
                                                                (e.currentTarget.previousSibling as HTMLInputElement).showPicker?.();
                                                            }}
                                                        >
                                                            <Calendar className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ) : mention.field_key === "time" ? (
                                                    <div className="relative">
                                                        <Input
                                                            {...getInputProps(mention)}
                                                            value={mention.custom_value || ""}
                                                            onChange={(e) =>
                                                                handleTableEdit(
                                                                    mention.mention_id,
                                                                    "custom_value",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="pr-8 h-8"
                                                        />
                                                        <input
                                                            type="time"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                if (v) {
                                                                    const formatted = formatTimeForDisplay(
                                                                        v,
                                                                        mention.time_format || "HH:mm"
                                                                    );
                                                                    handleTableEdit(
                                                                        mention.mention_id,
                                                                        "custom_value",
                                                                        formatted
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            onClick={(e) => {
                                                                (e.currentTarget.previousSibling as HTMLInputElement).showPicker?.();
                                                            }}
                                                        >
                                                            <Clock className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <MentionInputField
                                                        mentionId={mention.mention_id}
                                                        fieldKey={"custom_value"}
                                                        value={mention.custom_value || ""}
                                                        handleTableEdit={handleTableEdit}
                                                        isEditable={mention.field_key === "email" ? false : true}
                                                        placeholder={mention.placeholder_text || ""}
                                                        className="h-8"
                                                        getInputProps={getInputProps}
                                                        mention={mention}
                                                    />
                                                )}
                                                {validationErrors[mention.mention_id] && (
                                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                        <AlertCircle className="h-2 w-2" />
                                                        {validationErrors[mention.mention_id]}
                                                    </p>
                                                )}
                                            </div>

                                            {showClearButton.includes(mention.field_key) && mention.custom_value && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleClearField(mention.mention_id, mention.field_key)}
                                                    className="h-8 px-2 border-gray-300"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredMentions.length === 0 && (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-1 text-sm">No mentions found</div>
                                <div className="text-xs text-gray-500">Try adjusting your filters</div>
                            </div>
                        )}
                    </div>

                    <div className="sticky bottom-0 bg-white border-t p-3">
                        <div className="flex gap-2">
                            {showSkipForMentions === "show_send_button" ||
                                (builderType === "preview" &&
                                    showSkipForMentions !== "hide_skip" &&
                                    showSkipForMentions !== "no_send_button") ? (
                                <Button
                                    variant="outline"
                                    onClick={() => onClose("skip")}
                                    className="flex-1 border-gray-300 h-9 text-sm"
                                >
                                    Skip & Continue
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => onClose()}
                                    className="flex-1 border-gray-300 h-9 text-sm"
                                >
                                    Cancel
                                </Button>
                            )}

                            {builderType === "builder" && (
                                <Button
                                    onClick={handleMapMentions}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 text-sm"
                                >
                                    Map Mentions
                                </Button>
                            )}
                            {builderType === "preview" && (
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 bg-green-600 hover:bg-green-700 h-9 text-sm"
                                >
                                    Save Changes
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default MapMentionsValuesSheet;