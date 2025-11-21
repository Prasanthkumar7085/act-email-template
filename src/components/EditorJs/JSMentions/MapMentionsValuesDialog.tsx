import { useLocation, useParams } from "@tanstack/react-router";
import * as Comlink from "comlink";
import { m } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DocumentContext } from "~/context/documentContext";
import apiConfig from "~/lib/config/apiConfig";
import authToken from "~/lib/config/cookie";
import { extractAllMentions, getMentionsByUserId } from "~/utils/helpers/extractMentionsArray";
import DropdownConfigDialog from "./DropdownConfigDialog";
import DropdownFieldInput from "./DropdownFieldInput";
import MapMentionsValuesSheet from "./MapMentionValuesDrawer";
import MentionInputField from "./MentionInputField";
import returnSlugFromLabel from "~/utils/helpers/returnSlugFromLabel";

interface DropdownOption {
  id: string;
  label: string;
  value: string;
}

interface MentionData {
  mention_id: string;
  user_id: string;
  mention_value: string;
  pageindex: number;
  field_key: string;
  contact_mapped_key: string;
  field_label: string;
  custom_value: string;
  block_id: string;
  required?: boolean;
  date_format?: string;
  date_time_format?: string;
  time_format?: string;
  currency_symbol?: string;
  display_value?: string;
  "data-time-format"?: string;
  "data-dropdown-multiselect"?: any;
  "data-dropdown-options"?: string;
  "data-has-value"?: boolean;
  "data-placeholder-text"?: string;
  placeholder_text?: string;
}

interface EditMentionDialogProps {
  isOpen: boolean;
  onClose: (value?: string | boolean, updatedPageWiseBlocks?: any[]) => void;
  users: any[];
  pageWiseEditorBlocks: { [key: number]: any };
  setPageWiseEditorBlocks: any;
  setUpdateInlineUser: any;
  builderType?: string;
  showSkipForMentions: "" | "show_send_button" | "no_send_button" | "hide_skip";
  documentIdNum?: string;
  responseIdNum?: string;
}

const userFields = [
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "company_name", label: "Company" },
  { key: "full_name", label: "Full Name" },
  { key: "title", label: "Title" },
  { key: "text_value", label: "Single Line Text" },
  { key: "number", label: "Number" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "date_time", label: "Date & Time" },
  { key: "url", label: "URL" },
  { key: "currency", label: "Currency" },
  { key: "dropdown", label: "Dropdown" },
];

const primaryFields = [
  "first_name",
  "last_name",
  "phone",
  "email",
  "address",
  "company_name",
  "full_name",
  "title",
];

const dateFormatOptions = [
  { value: "MM-dd-yyyy", label: "MM-DD-YYYY" },
  { value: "dd-MM-yyyy", label: "DD-MM-YYYY" },
  { value: "MMM dd yyyy", label: "MMM DD YYYY" },
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY" },
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY" },
];

const dateTimeFormatOptions = [
  { value: "MM-dd-yyyy HH:mm", label: "MM-DD-YYYY HH:MM" },
  { value: "dd-MM-yyyy HH:mm", label: "DD-MM-YYYY HH:MM" },
  { value: "MMM dd yyyy HH:mm", label: "MMM DD YYYY HH:MM" },
  { value: "MM/dd/yyyy hh:mm TT", label: "MM/DD/YYYY HH:MM AM/PM" },
  { value: "dd/MM/yyyy HH:mm", label: "DD/MM/YYYY HH:MM" },
];

const timeFormatOptions = [
  { value: "HH:mm", label: "HH:MM (24-hour)" },
  { value: "hh:mm TT", label: "HH:MM AM/PM (12-hour)" },
];

const currencyOptions = [
  { symbol: "$", name: "USD" },
  { symbol: "€", name: "EUR" },
  { symbol: "£", name: "GBP" },
  { symbol: "¥", name: "JPY" },
  { symbol: "₹", name: "INR" },
  { symbol: "₽", name: "RUB" },
  { symbol: "₩", name: "KRW" },
  { symbol: "₺", name: "TRY" },
  { symbol: "₴", name: "UAH" },
];

interface FilterState {
  search: string;
  fieldType: string;
  user: string;
  required: string;
}

const generateDefaultPlaceholderText = (fieldLabel: string, user?: any): string => {
  if (!user) {
    return `Enter your ${fieldLabel}`;
  }
  const userName =
    user.name?.trim()?.length > 1
      ? user.name
      : user.contact_type_name ||
      user.first_name ||
      user.last_name ||
      user.full_name ||
      "User";

  const template = "Enter your {label}";

  return (
    template
      .replace(/{label}/gi, fieldLabel)
      .replace(/{field}/gi, fieldLabel)
      .replace(/{user}/gi, user.name || user.contact_type_name || "")
      .replace(/{firstName}/gi, user.first_name || "")
      .replace(/{lastName}/gi, user.last_name || "")
      .replace(/{fullName}/gi, user.name || user.contact_type_name || "") ||
    `${userName}@${fieldLabel}`
  );
};

const MapMentionsValuesDialog = ({
  isOpen,
  onClose,
  users,
  pageWiseEditorBlocks,
  setPageWiseEditorBlocks,
  setUpdateInlineUser,
  builderType,
  showSkipForMentions,
  documentIdNum,
  responseIdNum,
}: EditMentionDialogProps) => {
  const params: any = useParams({ strict: false });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const documentId = params.documentId || searchParams.get("document_id") || documentIdNum || "";
  const responseId = params.responseId || searchParams.get("response_id") || responseIdNum || "";

  const { emailForPublicDocumentView } = useContext(DocumentContext);

  const isDocumentPreview = location.pathname.includes("document-preview") || location.pathname.includes("template-preview");

  const [mentions, setMentions] = useState<MentionData[]>([]);
  const [filteredMentions, setFilteredMentions] = useState<MentionData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    fieldType: "all",
    user: "all",
    required: "all",
  });
  const [shouldScrollToError, setShouldScrollToError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [validationLabelErrors, setValidationLabelErrors] = useState<{
    [key: string]: string;
  }>({});
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [currentMention, setCurrentMention] = useState<MentionData | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);

  const showClearButton = [
    "date",
    "date_time",
    "time",
    "url",
    "number",
    "currency",
    "text_value",
  ];

  const isValidEmail = (email: string): boolean => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFieldEditable = (field: string) => {
    return isDocumentPreview || field === "custom_value"
  };

  const parseDropdownOptions = (dropdownOptionsString?: string): DropdownOption[] => {
    if (!dropdownOptionsString) {
      return [{ id: "1", label: "Option 1", value: "Option 1" }];
    }

    try {
      const options = JSON.parse(dropdownOptionsString);
      return Array.isArray(options) ? options : [{ id: "1", label: "Option 1", value: "Option 1" }];
    } catch (error) {
      console.error("Error parsing dropdown options:", error);
      return [{ id: "1", label: "Option 1", value: "Option 1" }];
    }
  };

  const getSelectedValues = (mention: MentionData): string[] => {
    if (!mention.custom_value) return [];
    return mention.custom_value
      .split(",")
      .map(v => v.trim())
      .filter(v => v);
  };

  const handleDropdownChange = (mentionId: string, selectedValues: string[]) => {
    const finalValue = selectedValues.filter(v => v).join(", ");
    handleTableEdit(mentionId, "custom_value", finalValue);
  };

  const openConfigDialog = (mention: MentionData) => {
    const options = parseDropdownOptions(mention["data-dropdown-options"]);
    setDropdownOptions(options);
    setCurrentMention(mention);
    setConfigDialogOpen(true);
  };

  const saveDropdownConfig = (options: DropdownOption[], isMultiselect: boolean) => {
    if (!currentMention) return;

    const oldOptions = parseDropdownOptions(currentMention["data-dropdown-options"]);
    const newOptions = options;

    const currentSelected = getSelectedValues(currentMention);

    const preservedValues = currentSelected.filter(selectedValue =>
      newOptions.some(opt => opt.value === selectedValue)
    );

    const newCustomValue = preservedValues.join(", ");

    const updatedMentions = mentions.map((mention) => {
      if (mention.mention_id === currentMention.mention_id) {
        return {
          ...mention,
          "data-dropdown-options": JSON.stringify(newOptions),
          "data-dropdown-multiselect": isMultiselect,
          custom_value: newCustomValue,
        };
      }
      return mention;
    });
    let updatedMention = updatedMentions.find((mention) => mention.mention_id === currentMention.mention_id);

    updateSimilarMentions(updatedMentions, {
      fieldLabel: updatedMention.field_label,
      fieldKey: updatedMention.field_key,
      userId: updatedMention.user_id,
      value: updatedMention.custom_value,
      sourceMentionId: updatedMention.mention_id,
      sourceMention: updatedMention,
    });
    setMentions(updatedMentions);
    setFilteredMentions(updatedMentions);
    setConfigDialogOpen(false);
    setCurrentMention(null);
    setDropdownOptions([]);
  };

  const addDropdownOption = () => {
    const newOption: DropdownOption = {
      id: Date.now().toString(),
      label: `Option ${dropdownOptions.length + 1}`,
      value: `Option ${dropdownOptions.length + 1}`,
    };
    setDropdownOptions([...dropdownOptions, newOption]);
  };

  const updateDropdownOption = (index: number, field: keyof DropdownOption, value: string) => {
    const updatedOptions = [...dropdownOptions];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setDropdownOptions(updatedOptions);
  };

  const removeDropdownOption = (index: number) => {
    const updatedOptions = dropdownOptions.filter((_, i) => i !== index);
    setDropdownOptions(updatedOptions);
  };

  useEffect(() => {
    if (shouldScrollToError) {
      scrollToFirstError();
      setShouldScrollToError(false);
    }
  }, [validationErrors, validationLabelErrors, shouldScrollToError]);

  useEffect(() => {
    let currentUser = users?.find(
      (u) => u.email === emailForPublicDocumentView
    )?._id;

    const allMentions = extractAllMentions(pageWiseEditorBlocks);
    const updatedMentions = allMentions.map((m: MentionData) => {
      const fieldKey = userFields.some((f) => f.key === m.field_key)
        ? m.field_key
        : "text_value";
      const fieldLabel =
        m.field_label ||
        userFields.find((f) => f.key === fieldKey)?.label ||
        "Single Line Text";

      const hasValue = m["data-has-value"] == "true" || !!m.custom_value;
      const user = users?.find(u => u._id === m.user_id);
      const defaultPlaceholderText = generateDefaultPlaceholderText(fieldLabel, user);
      const placeholderText = m["data-placeholder-text"] || defaultPlaceholderText;

      return {
        ...m,
        field_key: fieldKey,
        field_label: fieldLabel,
        required: m.required !== undefined ? m.required : true,
        date_format: m.date_format || "MM-dd-yyyy",
        date_time_format: m.date_time_format || "MM-dd-yyyy HH:mm",
        time_format: m.time_format || "HH:mm",
        currency_symbol: m.custom_value[0] || "$",
        "data-time-format": m["data-time-format"] || "HH:mm",
        "data-dropdown-multiselect": m["data-dropdown-multiselect"] == "true" ? true : false || false,
        "data-dropdown-options": m["data-dropdown-options"] || JSON.stringify([{ id: "1", label: "Option 1", value: "Option 1" }]),
        "data-has-value": hasValue,
        "data-placeholder-text": placeholderText,
        placeholder_text: placeholderText,
      };
    });

    let finalMentions: any = updatedMentions;

    if (emailForPublicDocumentView && currentUser) {
      finalMentions = getMentionsByUserId(updatedMentions, currentUser);
    }
    setMentions(finalMentions);
    setFilteredMentions(finalMentions);
    setValidationErrors({});
    setValidationLabelErrors({});
  }, [pageWiseEditorBlocks, emailForPublicDocumentView, users, userFields, isOpen]);

  useEffect(() => {
    let filtered = [...mentions];

    if (filters.search) {
      filtered = filtered.filter(
        (mention) =>
          mention.field_label
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          mention.field_key.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.fieldType !== "all") {
      filtered = filtered.filter(
        (mention) => mention.field_key === filters.fieldType
      );
    }

    if (filters.user !== "all") {
      filtered = filtered.filter((mention) => mention.user_id === filters.user);
    }

    if (filters.required !== "all") {
      const isRequired = filters.required === "required";
      filtered = filtered.filter((mention) => mention.required === isRequired);
    }

    setFilteredMentions(filtered);
  }, [filters, mentions]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      fieldType: "all",
      user: "all",
      required: "all",
    });
  };

  const validateTimeFormat = (timeValue: string, format: string): boolean => {
    if (!timeValue) return true;

    if (format === "HH:mm") {
      const time24Regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return time24Regex.test(timeValue);
    } else if (format === "hh:mm TT") {
      const time12Regex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM)$/i;
      return time12Regex.test(timeValue);
    }

    return false;
  };

  const validateLabelFields = (): boolean => {
    const errors: { [key: string]: string } = {};

    mentions.forEach((mention) => {
      if (!mention.field_label?.trim()) {
        errors[mention.mention_id] = "Field label cannot be empty";
      }
    });
    setValidationLabelErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const validateRequiredFields = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isBuilderScreen = location.pathname.includes("template-preview") || location.pathname.includes("document-preview");
    let currentUser = users?.find((u) => u.email === emailForPublicDocumentView)?._id;
    let senderUser = users?.find((u) => u.value == "SENDER")?._id;
    const usersMentions = currentUser && !isBuilderScreen
      ? getMentionsByUserId(mentions, currentUser)
      : (getMentionsByUserId(mentions, senderUser) || mentions);

    usersMentions.forEach((mention: any) => {
      if (mention.required && !mention.custom_value?.trim()) {
        errors[mention.mention_id] = "Required but empty";
      }
    });

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const validateInvalidFields = (): boolean => {
    const errors: { [key: string]: string } = {};

    mentions.forEach((mention) => {
      if (validationErrors[mention.mention_id]) return;

      if (mention.field_key === "email" && mention.custom_value && !isValidEmail(mention.custom_value)) {
        errors[mention.mention_id] = "Invalid email format";
      }

      if (mention.field_key === "date" && mention.custom_value) {
        const parsed = parseDate(mention.custom_value, mention.date_format || "MM-dd-yyyy");
        if (!parsed || isNaN(parsed.getTime())) {
          errors[mention.mention_id] = "Invalid date format";
        }
      }

      if (mention.field_key === "date_time" && mention.custom_value) {
        const parsed = parseDateTime(mention.custom_value, mention.date_time_format || "MM-dd-yyyy HH:mm");
        if (!parsed || isNaN(parsed.getTime())) {
          errors[mention.mention_id] = "Invalid date-time format";
        }
      }

      if (mention.field_key === "time" && mention.custom_value) {
        const isValid = validateTimeFormat(mention.custom_value, mention["data-time-format"] || "HH:mm");
        if (!isValid) {
          errors[mention.mention_id] = "Invalid time format";
        }
      }

      if (mention.field_key === "url" && mention.custom_value?.trim()) {
        try {
          const isValidUrl = (url: string): boolean => {
            if (!url) return true;

            try {
              new URL(url);
              return true;
            } catch (e) {
              return false;
            }
          };
          if (!isValidUrl(mention.custom_value)) {
            errors[mention.mention_id] = "Please enter a valid URL";
          }
        }
        catch (e) {
          errors[mention.mention_id] = "Please enter a valid URL";
        }
      }
    });

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const formatDate = (date: Date, format: string): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    switch (format) {
      case "MM-dd-yyyy":
        return `${month}-${day}-${year}`;
      case "dd-MM-yyyy":
        return `${day}-${month}-${year}`;
      case "MMM dd yyyy":
        return `${monthNames[date.getMonth()]} ${day} ${year}`;
      case "MM/dd/yyyy":
        return `${month}/${day}/${year}`;
      case "dd/MM/yyyy":
        return `${day}/${month}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  };

  const parseDate = (dateString: string, format: string): Date | null => {
    if (!dateString) return null;
    try {
      let day, month, year;
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      switch (format) {
        case "MM-dd-yyyy":
          [month, day, year] = dateString.split("-").map(Number);
          break;
        case "dd-MM-yyyy":
          [day, month, year] = dateString.split("-").map(Number);
          break;
        case "MMM dd yyyy":
          const parts = dateString.split(" ");
          const monthName = parts[0];
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
          month = monthNames.indexOf(monthName) + 1;
          break;
        case "MM/dd/yyyy":
          [month, day, year] = dateString.split("/").map(Number);
          break;
        case "dd/MM/yyyy":
          [day, month, year] = dateString.split("/").map(Number);
          break;
        default:
          return null;
      }
      const date = new Date(year, month - 1, day);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      return null;
    }
  };

  const formatDateTime = (date: Date, format: string): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const twelveHour = (date.getHours() % 12 || 12).toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    switch (format) {
      case "MM-dd-yyyy HH:mm":
        return `${month}-${day}-${year} ${hours}:${minutes}`;
      case "dd-MM-yyyy HH:mm":
        return `${day}-${month}-${year} ${hours}:${minutes}`;
      case "MMM dd yyyy HH:mm":
        return `${monthNames[date.getMonth()]} ${day} ${year} ${hours}:${minutes}`;
      case "MM/dd/yyyy hh:mm TT":
        return `${month}/${day}/${year} ${twelveHour}:${minutes} ${ampm}`;
      case "dd/MM/yyyy HH:mm":
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      default:
        return date.toISOString().substring(0, 16).replace("T", " ");
    }
  };

  const parseDateTime = (dateString: string, format: string): Date | null => {
    if (!dateString) return null;
    try {
      let day,
        month,
        year,
        hours = 0,
        minutes = 0;
      const parts = dateString.split(" ");
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const datePart = parts[0];
      const timePart = parts[1] ? parts[1] : "00:00";
      let ampm = parts[2] || "";
      const [h, m] = timePart.split(":").map(Number);
      hours = h;
      minutes = m;
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      switch (format) {
        case "MM-dd-yyyy HH:mm":
          [month, day, year] = datePart.split("-").map(Number);
          break;
        case "dd-MM-yyyy HH:mm":
          [day, month, year] = datePart.split("-").map(Number);
          break;
        case "MMM dd yyyy HH:mm":
          const dateParts = datePart.split(" ");
          const monthName = dateParts[0];
          day = parseInt(dateParts[1]);
          year = parseInt(dateParts[2]);
          month = monthNames.indexOf(monthName) + 1;
          break;
        case "MM/dd/yyyy hh:mm TT":
          [month, day, year] = datePart.split("/").map(Number);
          break;
        case "dd/MM/yyyy HH:mm":
          [day, month, year] = datePart.split("/").map(Number);
          break;
        default:
          return null;
      }
      const date = new Date(year, month - 1, day, hours, minutes);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      return null;
    }
  };

  const formatTime = (time: string, format: string): string => {
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) return time;
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    if (format === "hh:mm TT") {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const parseTime = (timeString: string, format: string): string => {
    if (!timeString) return "";
    try {
      let hours, minutes;
      if (format === "hh:mm TT") {
        const parts = timeString.split(" ");
        const timePart = parts[0];
        const ampm = parts[1] || "";
        const [h, m] = timePart.split(":").map(Number);
        hours = h;
        minutes = m;
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      } else {
        const [h, m] = timeString.split(":").map(Number);
        hours = h;
        minutes = m;
      }
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    } catch (error) {
      return timeString;
    }
  };

  const formatCurrency = (value: string, symbol: string): string => {
    const numericValue = value.replace(/[^\d.]/g, "");
    if (!numericValue || isNaN(Number(numericValue))) return "";
    const parts = numericValue.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formattedValue = parts.join(".");
    return `${symbol}${formattedValue}`;
  };

  const parseCurrency = (value: string): string => {
    return value.replace(/[^\d.,]/g, "");
  };

  const handleTableEdit = (
    mentionId: string,
    field: any,
    value: string | boolean
  ) => {
    if (!isFieldEditable(field)) return;

    setMentions((prevMentions) => {
      const updatedMentions = prevMentions.map((mention) => {
        if (mention.mention_id !== mentionId) return mention;

        const newMention: any = { ...mention, [field]: value };
        const selectedUser = users.find((u) => u._id === newMention.user_id);

        if (field === "field_key" && isDocumentPreview) {
          const fieldKey = value as string;
          const fieldConfig = userFields.find((f) => f.key === fieldKey);

          newMention.field_label = fieldConfig?.label || newMention.field_label;

          if (primaryFields.includes(fieldKey) && selectedUser) {
            newMention.custom_value = selectedUser[fieldKey] || "";
          } else {
            newMention.custom_value = "";
          }
          newMention.date_format = "MM-dd-yyyy";
          newMention.date_time_format = "MM-dd-yyyy HH:mm";
          newMention.time_format = "HH:mm";
          newMention.currency_symbol = "$";
          newMention["data-time-format"] = "HH:mm";

          if (fieldKey !== "dropdown") {
            newMention["data-dropdown-multiselect"] = false;
            newMention["data-dropdown-options"] = JSON.stringify([
              { id: "1", label: "Option 1", value: "Option 1" },
            ]);
          }
        }
        else if (field === "user_id" && isDocumentPreview) {
          newMention.user_id = value as string;
          const user = users.find((u) => u._id === value);
          if (primaryFields.includes(mention.field_key) && user) {
            newMention.custom_value = user[mention.field_key] || "";
          } else {
            newMention.custom_value = "";
          }
        }
        else if (field === "date_format" && newMention.field_key === "date" && newMention.custom_value && isDocumentPreview) {
          const parsed = parseDate(newMention.custom_value, mention.date_format || "MM-dd-yyyy");
          newMention.custom_value = parsed ? formatDate(parsed, value as string) : "";
          newMention.date_format = value as string;
        }
        else if (field === "date_time_format" && newMention.field_key === "date_time" && newMention.custom_value && isDocumentPreview) {
          const parsed = parseDateTime(newMention.custom_value, mention.date_time_format || "MM-dd-yyyy HH:mm");
          newMention.custom_value = parsed ? formatDateTime(parsed, value as string) : "";
          newMention.date_time_format = value as string;
        }
        else if (field === "data-time-format" && newMention.field_key === "time" && newMention.custom_value && isDocumentPreview) {
          if (mention["data-time-format"] === "HH:mm" && value === "hh:mm TT") {
            newMention.custom_value = convert24To12(newMention.custom_value);
          } else if (mention["data-time-format"] === "hh:mm TT" && value === "HH:mm") {
            newMention.custom_value = convert12To24(newMention.custom_value);
          }
          newMention["data-time-format"] = value as string;
        }
        else if (field === "currency_symbol" && newMention.field_key === "currency" && newMention.custom_value && isDocumentPreview) {
          const numericValue = parseCurrency(newMention.custom_value);
          newMention.custom_value = formatCurrency(numericValue, value as string);
          newMention.currency_symbol = value as string;
        }
        else if (field === "custom_value") {
          if (newMention.field_key === "currency") {
            const numericValue = parseCurrency(value as string);
            newMention.custom_value = formatCurrency(numericValue, newMention.currency_symbol || "$");
          } else if (newMention.field_key === "date" && value) {
            const parsed = parseDate(value as string, newMention.date_format || "MM-dd-yyyy");
            newMention.custom_value = parsed
              ? formatDate(parsed, newMention.date_format || "MM-dd-yyyy")
              : value;
          } else if (newMention.field_key === "date_time" && value) {
            const parsed = parseDateTime(value as string, newMention.date_time_format || "MM-dd-yyyy HH:mm");
            newMention.custom_value = parsed
              ? formatDateTime(parsed, newMention.date_time_format || "MM-dd-yyyy HH:mm")
              : value;
          } else if (newMention.field_key === "time" && value) {
            const formatted = formatTime(value as string, newMention["data-time-format"] || "HH:mm");
            const isValid = validateTimeFormat(formatted, newMention["data-time-format"] || "HH:mm");
            newMention.custom_value = isValid ? formatted : (mention.custom_value || "");
          } else {
            newMention.custom_value = value as string;
          }
        }

        return newMention;
      });

      const editedMention = updatedMentions.find((m) => m.mention_id === mentionId);
      if ((field === "custom_value" || field === "currency_symbol" || field === "date_format" || field === "date_time_format" || field === "data-time-format") && editedMention) {
        return updateSimilarMentions(updatedMentions, {
          fieldLabel: editedMention.field_label,
          fieldKey: editedMention.field_key,
          userId: editedMention.user_id,
          value: editedMention.custom_value,
          sourceMentionId: mentionId,
          sourceMention: editedMention,
        });
      }

      return updatedMentions;
    });
    if (field === "field_label") {
      setValidationLabelErrors((prev) => {
        const updated = { ...prev };
        delete updated[mentionId];
        return updated;
      });
    } else {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[mentionId];
        return updated;
      });
    }
  };

  const updateSimilarMentions = (
    mentions: any[],
    {
      fieldLabel,
      fieldKey,
      userId,
      value,
      sourceMentionId,
      sourceMention
    }: {
      fieldLabel: string;
      fieldKey: string;
      userId: string;
      value: string;
      sourceMentionId: string;
      sourceMention: any
    }
  ): any[] => {
    if (!fieldLabel || !fieldKey || !userId) return mentions;

    return mentions.map((mention) => {
      if (mention.mention_id === sourceMentionId) return mention;

      if (
        mention.field_label === fieldLabel &&
        mention.field_key === fieldKey &&
        mention.user_id === userId
      ) {
        let finalValue = value;
        let displayValue = value;

        if (value) {
          switch (fieldKey) {
            case "time":
              const timeFormat =
                sourceMention["data-time-format"] ||
                sourceMention.dataset?.timeFormat ||
                "HH:mm";
              displayValue = value;
              mention["data-time-format"] = timeFormat;
              break;

            case "date":
              const dateFormat =
                sourceMention.date_format ||
                sourceMention.dataset?.dateFormat ||
                "MM-dd-yyyy";
              finalValue = value;
              mention.date_format = dateFormat;
              break;

            case "date_time":
              const dateTimeFormat =
                sourceMention.date_time_format ||
                sourceMention.dataset?.dateTimeFormat ||
                "MM-dd-yyyy HH:mm";
              finalValue = value;
              mention.date_time_format = dateTimeFormat;
              break;
            case "dropdown":
              const isMultiselect =
                sourceMention["data-dropdown-multiselect"] ==
                  "true"
                  ? true
                  : false;
              const dropdownOptions =
                sourceMention["data-dropdown-options"] ||
                sourceMention.dataset.dropdownOptions;

              mention["data-dropdown-multiselect"] = isMultiselect.toString();
              if (dropdownOptions?.length > 0) {
                mention["data-dropdown-options"] = dropdownOptions;
              }
              break;
            case "currency":
              finalValue = `${value}`;
              mention.currency_symbol = sourceMention.currency_symbol;
              break;
            default:
              displayValue = value;
              break;
          }

          mention.custom_value = finalValue;
          mention["data-has-value"] = "true";
        } else {
          mention.custom_value = "";
          mention["data-has-value"] = "false";
          if (fieldKey === "dropdown") {
            const isMultiselect =
              sourceMention["data-dropdown-multiselect"] == "true"
                ? true
                : false;
            const dropdownOptions =
              sourceMention["data-dropdown-options"] ||
              sourceMention.dataset.dropdownOptions;

            mention["data-dropdown-multiselect"] = isMultiselect.toString();
            if (dropdownOptions?.length > 0) {
              mention["data-dropdown-options"] = dropdownOptions;
            }
          }
        }

        return mention;
      }

      return mention;
    });
  };

  const handleClearField = (mentionId: string, fieldKey: string) => {
    handleTableEdit(mentionId, "custom_value", "");
  };

  const savePageWiseBlocks = async (blocks: any, page: any) => {
    try {
      const url = location.pathname.includes('/template-preview') ? apiConfig.app.BASE_URL + `/company-documents-v2/${documentId}/blocks/${page}` :
        apiConfig.app.BASE_URL +
        `/company-documents-v2/${documentId}/response/${responseId}/blocks/${page}`;
      const detailsForUpdate = {
        body: {
          blocks: blocks[page],
        },
        authToken,
        url
      };
      const worker = new SharedWorker("/workers/update-page-blocks.js");
      const workerPageBlocksUpdateAPI = Comlink.wrap<any>(worker.port);
      const response =
        await workerPageBlocksUpdateAPI.updatePageBlocks(detailsForUpdate);
      return response;
    } catch (err) {
      console.error(err);
    }
  };
  const scrollToFirstError = () => {
    const firstErrorId = Object.keys(validationErrors)[0] || Object.keys(validationLabelErrors)[0];
    if (firstErrorId) {
      const row = document.querySelector(`[data-mention-scroll-id="${firstErrorId}"]`);
      row?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  const handleSave = () => {
    setValidationErrors({});
    setValidationLabelErrors({});

    const isLabelValid = validateLabelFields();
    const isRequiredValid = validateRequiredFields();
    const isFormatValid = validateInvalidFields();

    if (!isLabelValid || !isRequiredValid || !isFormatValid) {
      setShouldScrollToError(true);
      return;
    }

    const updatedPageWiseBlocks = JSON.parse(
      JSON.stringify(pageWiseEditorBlocks)
    );
    const mentionMap = new Map(mentions.map((m) => [m.mention_id, m]));

    const updateMentionsInText = (text: string): string => {
      if (!text || typeof text !== "string") return text;

      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${text}</div>`, "text/html");
      const spanElements = doc.querySelectorAll("span[data-mention-id]");

      spanElements.forEach((span: any) => {
        const mentionId = span.getAttribute("data-mention-id");
        if (mentionId && mentionMap.has(mentionId)) {
          const updatedMention = mentionMap.get(mentionId);
          const selectedUser = users.find(
            (u) => u._id === updatedMention!.user_id
          );

          span.setAttribute("data-user-id", updatedMention!.user_id);
          span.setAttribute("data-field", updatedMention!.field_key);
          span.setAttribute("data-field-label", updatedMention!.field_label);
          span.setAttribute(
            "data-custom-value",
            updatedMention!.custom_value || ""
          );
          span.setAttribute(
            "data-required",
            updatedMention!.required?.toString() || "false"
          );

          const hasValue = !!updatedMention!.custom_value;
          span.setAttribute("data-has-value", hasValue.toString());

          const placeholderText = updatedMention!.placeholder_text ||
            generateDefaultPlaceholderText(updatedMention!.field_label, selectedUser);
          span.setAttribute("data-placeholder-text", placeholderText);

          if (updatedMention!.field_key === "dropdown") {
            span.setAttribute(
              "data-dropdown-multiselect",
              updatedMention!["data-dropdown-multiselect"]?.toString() || "false"
            );
            span.setAttribute(
              "data-dropdown-options",
              updatedMention!["data-dropdown-options"] || JSON.stringify([{ id: 1, label: "Option 1", value: "Option 1" }]) || []
            );
          }

          if (updatedMention!.date_format)
            span.setAttribute("data-date-format", updatedMention!.date_format);
          if (updatedMention!.date_time_format)
            span.setAttribute(
              "data-date-time-format",
              updatedMention!.date_time_format
            );
          if (updatedMention!["data-time-format"])
            span.setAttribute("data-time-format", updatedMention!["data-time-format"]);
          if (updatedMention!.currency_symbol)
            span.setAttribute(
              "data-currency-symbol",
              updatedMention!.currency_symbol
            );

          Object.assign(span.style, {
            backgroundColor: selectedUser?.color
              ? selectedUser.color + "35"
              : "#91d5ff",
            border: `1px solid ${selectedUser?.color ? selectedUser.color + "35" : "#91d5ff"}`,
          });

          if (!hasValue) {
            span.classList.add('placeholder');
            Object.assign(span.style, {
              fontStyle: 'italic',
              color: '#6b7280',
            });
          } else {
            span.classList.remove('placeholder');
            Object.assign(span.style, {
              fontStyle: 'normal',
              color: 'black',
            })
          }

          let displayText = "";
          if (hasValue) {
            displayText = updatedMention!.custom_value;
            if (updatedMention!.field_key === "time") {
              displayText = formatTimeForDisplay(
                updatedMention!.custom_value,
                updatedMention!.time_format || "HH:mm"
              );
            } else if (updatedMention!.field_key === "currency") {
              displayText = formatCurrency(
                updatedMention!.custom_value,
                updatedMention!.currency_symbol || "$"
              );
            }
          } else {
            displayText = placeholderText;
          }
          span.textContent = displayText;
        }
      });

      return doc.body.firstElementChild?.innerHTML || text;
    };

    Object.values(updatedPageWiseBlocks).forEach((pageData: any) => {
      if (pageData.blocks) {
        pageData.blocks.forEach((block: any) => {
          if (block.data?.text) {
            block.data.text = updateMentionsInText(block.data.text);
          }

          if (block.type === "list" && block.data?.items) {
            const updateListItems = (items: any[]) => {
              return items.map((item) => ({
                ...item,
                content: item.content
                  ? updateMentionsInText(item.content)
                  : item.content,
                items: item.items ? updateListItems(item.items) : item.items,
              }));
            };
            block.data.items = updateListItems(block.data.items);
          }

          if (block.type === "table" && block.data?.content) {
            block.data.content = block.data.content.map((row: string[]) =>
              row.map((cell) => updateMentionsInText(cell))
            );
          }
        });
      }
    });

    savePageWiseBlocks(updatedPageWiseBlocks, 0);
    setPageWiseEditorBlocks(updatedPageWiseBlocks);
    setUpdateInlineUser((prev: boolean) => !prev);
    setValidationErrors({});
    const onCloseProp = builderType == "preview" ? "skip" : "";
    onClose(onCloseProp, updatedPageWiseBlocks);
  };

  const handleMapMentions = () => {

    setValidationErrors({});
    setValidationLabelErrors({});

    const isLabelValid = validateLabelFields();
    const isFormatValid = validateInvalidFields();

    if (!isLabelValid || !isFormatValid) {
      scrollToFirstError();
      return;
    }

    const updatedPageWiseBlocks = JSON.parse(
      JSON.stringify(pageWiseEditorBlocks)
    );
    const mentionMap = new Map(mentions.map((m) => [m.mention_id, m]));

    const updateMentionsInText = (text: string): string => {
      if (!text || typeof text !== "string") return text;

      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${text}</div>`, "text/html");
      const spanElements = doc.querySelectorAll("span[data-mention-id]");

      spanElements.forEach((span: any) => {
        const mentionId = span.getAttribute("data-mention-id");
        if (mentionId && mentionMap.has(mentionId)) {
          const updatedMention = mentionMap.get(mentionId);
          const selectedUser = users.find(
            (u) => u._id === updatedMention!.user_id
          );

          span.setAttribute("data-user-id", updatedMention!.user_id);
          span.setAttribute("data-field", updatedMention!.field_key);
          span.setAttribute("data-field-label", updatedMention!.field_label);
          span.setAttribute(
            "data-custom-value",
            updatedMention!.custom_value || ""
          );
          span.setAttribute(
            "data-contact_mapped_key",
            returnSlugFromLabel(updatedMention!.field_label)
          );
          span.setAttribute(
            "data-required",
            updatedMention!.required?.toString() || "false"
          );

          const hasValue = !!updatedMention!.custom_value;
          span.setAttribute("data-has-value", hasValue.toString());

          const placeholderText = updatedMention!.placeholder_text ||
            generateDefaultPlaceholderText(updatedMention!.field_label, selectedUser);
          span.setAttribute("data-placeholder-text", placeholderText);

          if (updatedMention!.field_key === "dropdown") {
            span.setAttribute(
              "data-dropdown-multiselect",
              updatedMention!["data-dropdown-multiselect"]?.toString() || "false"
            );
            span.setAttribute(
              "data-dropdown-options",
              updatedMention!["data-dropdown-options"] || "[]"
            );
          }

          if (updatedMention!.date_format)
            span.setAttribute("data-date-format", updatedMention!.date_format);
          if (updatedMention!.date_time_format)
            span.setAttribute(
              "data-date-time-format",
              updatedMention!.date_time_format
            );
          if (updatedMention!["data-time-format"])
            span.setAttribute("data-time-format", updatedMention!["data-time-format"]);
          if (updatedMention!.currency_symbol)
            span.setAttribute(
              "data-currency-symbol",
              updatedMention!.currency_symbol
            );

          Object.assign(span.style, {
            backgroundColor: selectedUser?.color
              ? selectedUser.color + "35"
              : "#91d5ff",
            border: `1px solid ${selectedUser?.color ? selectedUser.color + "35" : "#91d5ff"}`,
          });

          if (!hasValue) {
            span.classList.add('placeholder');
            Object.assign(span.style, {
              fontStyle: 'italic',
              color: '#6b7280',
            });
          } else {
            span.classList.remove('placeholder');
            Object.assign(span.style, {
              fontStyle: 'normal',
              color: 'black',
            })
          }

          let displayText = "";
          if (hasValue) {
            displayText = updatedMention!.custom_value;
            if (updatedMention!.field_key === "time") {
              displayText = formatTime(
                updatedMention!.custom_value,
                updatedMention!.time_format || "HH:mm"
              );
            } else if (updatedMention!.field_key === "currency") {
              displayText = formatCurrency(
                updatedMention!.custom_value,
                updatedMention!.currency_symbol || "$"
              );
            }
          } else {
            displayText = placeholderText;
          }
          span.textContent = displayText;
        }
      });

      return doc.body.firstElementChild?.innerHTML || text;
    };

    Object.values(updatedPageWiseBlocks).forEach((pageData: any) => {
      if (pageData.blocks) {
        pageData.blocks.forEach((block: any) => {
          if (block.data?.text) {
            block.data.text = updateMentionsInText(block.data.text);
          }

          if (block.type === "list" && block.data?.items) {
            const updateListItems = (items: any[]) => {
              return items.map((item) => ({
                ...item,
                content: item.content
                  ? updateMentionsInText(item.content)
                  : item.content,
                items: item.items ? updateListItems(item.items) : item.items,
              }));
            };
            block.data.items = updateListItems(block.data.items);
          }

          if (block.type === "table" && block.data?.content) {
            block.data.content = block.data.content.map((row: string[]) =>
              row.map((cell) => updateMentionsInText(cell))
            );
          }
        });
      }
    });

    savePageWiseBlocks(updatedPageWiseBlocks, 0);
    setPageWiseEditorBlocks(updatedPageWiseBlocks);
    setUpdateInlineUser((prev: boolean) => !prev);
    setValidationErrors({});
    onClose();
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "" && value !== "all"
  ).length;

  const getInputProps = (mention: MentionData) => {
    switch (mention.field_key) {
      case "date":
        return {
          type: "text",
          placeholder: `${mention["data-placeholder-text"]}` || `Select date (${mention.date_format || "MM-dd-yyyy"})...`,
          readOnly: false,
        };
      case "date_time":
        return {
          type: "text",
          placeholder: `${mention["data-placeholder-text"]}` || `Select date and time (${mention.date_time_format || "MM-dd-yyyy HH:mm"})...`,
          readOnly: false,
        };
      case "time":
        return {
          type: "text",
          placeholder: `${mention["data-placeholder-text"]}` || `Select time (${mention.time_format || "HH:mm"})...`,
          readOnly: false,
        };
      case "currency":
        return {
          type: "text",
          placeholder: `${mention["data-placeholder-text"]}` || `Enter amount (${mention.currency_symbol || "$"})...`,
        };
      case "dropdown":
        return {
          type: "text",
          placeholder: `${mention["data-placeholder-text"]}` || "Select from dropdown...",
          readOnly: true,
        };
      default:
        return { type: "text", placeholder: `${mention["data-placeholder-text"]}` || "Enter value..." };
    }
  };

  const convert24To12 = (time24: string): string => {
    if (!time24) return "";

    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const convert12To24 = (time12: string): string => {
    if (!time12) return "";

    const timeMatch = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) return time12;

    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const period = timeMatch[3].toUpperCase();

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const formatTimeForDisplay = (timeValue: string, format: string): string => {
    if (!timeValue) return "";

    if (format === "hh:mm TT") {
      return convert24To12(timeValue);
    }
    return timeValue;
  };

  const parseTimeForInput = (timeValue: string, format: string): string => {
    if (!timeValue) return "";

    if (format === "hh:mm TT") {
      return convert12To24(timeValue);
    }
    return timeValue;
  };

  const getFormatDisplay = (mention: MentionData) => {
    if (mention.field_key === "date") return mention.date_format;
    if (mention.field_key === "date_time") return mention.date_time_format;
    if (mention.field_key === "time") return mention["data-time-format"] || mention.time_format
    if (mention.field_key === "currency") return mention.currency_symbol;
    if (mention.field_key === "dropdown") {
      const isMultiselect = mention["data-dropdown-multiselect"];
      return isMultiselect ? "Multiple Select" : "Single Select";
    }
    return "";
  };

  const handleNativeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    format: string,
    mention: MentionData
  ) => {
    const value = e.target.value;
    if (mention.field_key === "date") {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const formatted = formatDate(date, format);
        handleTableEdit(
          mention.mention_id,
          "custom_value",
          formatted
        );
      }
    } else if (mention.field_key === "date_time") {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const formatted = formatDateTime(date, format);
        handleTableEdit(
          mention.mention_id,
          "custom_value",
          formatted
        );
      }
    }
  };

  let isMobile = window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return (
    <>
      {isMobile ?
        <MapMentionsValuesSheet {...{
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
        }} />
        :
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[1500px] bg-white border shadow-xl rounded-xl max-h-[90vh]">
            <DialogHeader className="flex flex-row items-center justify-between border-b">
              <div className="flex flex-col space-x-2">
                <DialogTitle>Edit Mentions</DialogTitle>
                <DialogDescription>
                  {isDocumentPreview
                    ? "Manage and update all mention fields"
                    : "Edit mention values for the document"}
                </DialogDescription>
              </div>
              <div className="space-y-4 p-4 border-b">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search Labels</label>
                    <Input
                      placeholder="Search by label or field type... "
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Field Type</label>
                    <Select
                      value={filters.fieldType}
                      onValueChange={(value) =>
                        handleFilterChange("fieldType", value)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All field types" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Field Types</SelectItem>
                        {userFields.map((field) => (
                          <SelectItem key={field.key} value={field.key}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {isDocumentPreview && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">User</label>
                      <Select
                        value={filters.user}
                        onValueChange={(value) => handleFilterChange("user", value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="All users" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">All Users</SelectItem>
                          {users?.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="min-w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: user.color || "#000000",
                                  }}
                                />

                                <p>
                                  {" "}
                                  {user.name?.trim()?.length > 1
                                    ? user.name
                                    : user.contact_type_name}{" "}
                                  ({user.type}) {user.is_cc ? "[CC]" : ""}
                                </p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Required</label>
                    <Select
                      value={filters.required}
                      onValueChange={(value) =>
                        handleFilterChange("required", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="ml-2"
                    >
                      Clear Filters ({activeFiltersCount})
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>
            <div className="relative overflow-auto max-h-[60vh] rounded-md border">
              <table className="w-full min-w-[1100px] text-sm text-left">
                <thead className="text-xs uppercase sticky py-4 top-0 z-20 bg-gray-200 text-secondary-foreground shadow-[0_1px_0_0_var(--color-border)]">
                  <tr>
                    <th className="px-4 py-2">S.No</th>
                    <th className="px-4 py-2">Edit Mention Labels</th>
                    <th className="px-4 py-2">Placeholder Text</th>

                    <th className="px-4 py-2">Field Type</th>
                    <th className="px-4 py-2">Select Filled By</th>
                    <th className="px-4 py-2">Fill Field Value</th>
                    <th className="px-4 py-2">Format</th>
                    <th className="px-4 py-2">Required</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMentions?.map((mention, index) => {
                    const isRequiredAndEmpty =
                      mention.required && !mention.custom_value?.trim();
                    const hasValidationError =
                      !!validationErrors[mention.mention_id];
                    const hasValidationLabelError =
                      !!validationLabelErrors[mention.mention_id];
                    const isEmailField = mention.field_key === "email";
                    const isEmailInvalid = isEmailField && mention.custom_value && !isValidEmail(mention.custom_value);


                    return (
                      <tr
                        key={index}
                        data-mention-scroll-id={mention.mention_id}
                        className={`border-b last:border-0 transition-colors odd:bg-background even:bg-muted/50 hover:bg-accent/40 ${isRequiredAndEmpty || hasValidationError || isEmailInvalid
                          ? "bg-red-50 hover:bg-red-100"
                          : ""
                          }`}
                      >
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span>{index + 1}</span>
                            {(isRequiredAndEmpty || hasValidationError || isEmailInvalid) && (
                              <span
                                className="text-red-500"
                                title={
                                  validationErrors[mention.mention_id] ||
                                  (isEmailInvalid ? "Invalid email format" : "Required field is empty")
                                }
                              >
                                ●
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2">

                          <MentionInputField
                            mentionId={mention.mention_id}
                            fieldKey={"field_label"}
                            value={mention["field_label"] || ""}
                            handleTableEdit={handleTableEdit}
                            isEditable={isFieldEditable("field_label")}
                            placeholder="Enter label text..."
                            className={`w-full ${!isFieldEditable("field_label")
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                              }`}
                            getInputProps={getInputProps}
                            mention={mention}
                          />
                          {/* <Input
                            value={mention.field_label}
                            onChange={(e) =>
                              isFieldEditable("field_label") &&
                              handleTableEdit(
                                mention.mention_id,
                                "field_label",
                                e.target.value
                              )
                            }
                            className={`w-full ${!isFieldEditable("field_label")
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                              }`}
                            readOnly={!isFieldEditable("field_label")}
                          /> */}
                          {hasValidationLabelError && (
                            <p className="text-xs text-red-500 mt-1">
                              {validationLabelErrors[mention.mention_id]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2">

                          <MentionInputField
                            mentionId={mention.mention_id}
                            fieldKey={"placeholder_text"}
                            value={mention.placeholder_text || ""}
                            handleTableEdit={handleTableEdit}
                            isEditable={isFieldEditable("placeholder_text")}
                            placeholder="Enter placeholder text..."
                            className={`w-full ${!isFieldEditable("placeholder_text")
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                              }`}
                            getInputProps={getInputProps}
                            mention={mention}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Select
                            value={mention.field_key}
                            onValueChange={(value) =>
                              isFieldEditable("field_key") &&
                              handleTableEdit(
                                mention.mention_id,
                                "field_key",
                                value
                              )
                            }
                            disabled={!isFieldEditable("field_key")}
                          >
                            <SelectTrigger
                              className={`w-full ${!isFieldEditable("field_key")
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                                }`}
                            >
                              <SelectValue placeholder="Select field..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {userFields?.map((field) => (
                                <SelectItem key={field.key} value={field.key}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2">
                          <Select
                            value={mention.user_id}
                            onValueChange={(value) =>
                              isFieldEditable("user_id") &&
                              handleTableEdit(mention.mention_id, "user_id", value)
                            }
                            disabled={!isFieldEditable("user_id")}
                          >
                            <SelectTrigger
                              className={`w-full ${!isFieldEditable("user_id")
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                                }`}
                            >
                              <SelectValue placeholder="Select user..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {users?.map((user) => {
                                return (
                                  <SelectItem
                                    key={user._id}
                                    value={user._id}
                                    disabled={user.is_cc}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div
                                        className="min-w-2 h-2 rounded-full"
                                        style={{
                                          backgroundColor: user.color || "#000000",
                                        }}
                                      />
                                      <span>
                                        {user.name?.trim()?.length > 1
                                          ? user.name
                                          : user.contact_type_name +
                                          " (" +
                                          user.type +
                                          ")" +
                                          (user.is_cc ? " [CC]" : "")}
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              {mention.field_key === "dropdown" ? (
                                <div>
                                  <DropdownFieldInput mention={mention} parseDropdownOptions={parseDropdownOptions} getSelectedValues={getSelectedValues} handleDropdownChange={handleDropdownChange} />
                                  {hasValidationError && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {validationErrors[mention.mention_id]}
                                    </p>
                                  )}
                                </div>
                              ) : mention.field_key === "date" ||
                                mention.field_key === "date_time" ? (
                                <div className="flex flex-col">
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
                                      className={`w-full pr-10 ${hasValidationError
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                        } ${isEmailInvalid ? "border-red-500 focus:ring-red-500" : ""}`}
                                    />
                                    <input
                                      type={
                                        mention.field_key === "date"
                                          ? "date"
                                          : "datetime-local"
                                      }
                                      className="absolute top-0 left-0 w-full h-full opacity-0"
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
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:bg-gray-100 p-1 rounded"
                                      onClick={(e) => {
                                        const nativeInput = e.currentTarget
                                          .previousSibling as HTMLInputElement;
                                        nativeInput.showPicker();
                                      }}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16" fill="currentColor"
                                      >
                                        <path d="M14 2h-1V1a1 1 0 0 0-2 0v1H5V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM2 3h12a1 1 0 0 1 1 1v1H1V4a1 1 0 0 1 1-1zm12 12H2a1 1 0 0 1-1-1V7h14v7a1 1 0 0 1-1 1z" />
                                      </svg>
                                    </button>
                                  </div>
                                  {(hasValidationError || isEmailInvalid) && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {isEmailInvalid ? "Please enter a valid email address" : validationErrors[mention.mention_id]}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <>
                                  {mention.field_key === "time" ? (
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
                                        className={`w-full pr-10 ${hasValidationError
                                          ? "border-red-500 focus:ring-red-500"
                                          : ""
                                          } ${isEmailInvalid ? "border-red-500 focus:ring-red-500" : ""}`}
                                      />
                                      <input
                                        type="time"
                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                          const selectedTime = e.target.value;
                                          if (selectedTime) {
                                            const formattedTime = formatTimeForDisplay(
                                              selectedTime,
                                              mention.time_format || "HH:mm"
                                            );
                                            handleTableEdit(
                                              mention.mention_id,
                                              "custom_value",
                                              formattedTime
                                            );
                                          }
                                        }}
                                      />
                                      <button
                                        type="button"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:bg-gray-100 p-1 rounded"
                                        onClick={(e) => {
                                          const nativeInput = e.currentTarget
                                            .previousSibling as HTMLInputElement;
                                          nativeInput.showPicker();
                                        }}
                                      >
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 16 16"
                                          fill="currentColor"
                                        >
                                          <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.5A6.5 6.5 0 1 1 14.5 8 6.51 6.51 0 0 1 8 14.5zM8.5 4H7v5l3.5 2.1.7-1.1-3-1.8V4z" />
                                        </svg>
                                      </button>

                                    </div>
                                  ) : (
                                    <MentionInputField
                                      mentionId={mention.mention_id}
                                      fieldKey={"custom_value"}
                                      value={mention.custom_value || ""}
                                      handleTableEdit={handleTableEdit}
                                      isEditable={isEmailField ? false : true}
                                      placeholder={mention.placeholder_text || ""}
                                      className={`w-full ${hasValidationError
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                        } ${isEmailInvalid ? "border-red-500 focus:ring-red-500" : ""}`}
                                      getInputProps={getInputProps}
                                      mention={mention}
                                    />

                                  )}
                                  {(hasValidationError || isEmailInvalid) && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {isEmailInvalid ? "Please enter a valid email address" : validationErrors[mention.mention_id]}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                            {showClearButton?.includes(mention.field_key) && mention.custom_value &&
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleClearField(mention.mention_id, mention.field_key)}
                                className="whitespace-nowrap bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                                title="Clear field value"
                              >
                                Clear
                              </Button>
                            }
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          {isDocumentPreview ? (
                            <>
                              {mention.field_key === "date" && (
                                <Select
                                  value={mention.date_format}
                                  onValueChange={(value) =>
                                    handleTableEdit(
                                      mention.mention_id,
                                      "date_format",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select format..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    {dateFormatOptions.map((format) => (
                                      <SelectItem
                                        key={format.value}
                                        value={format.value}
                                      >
                                        {format.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {mention.field_key === "date_time" && (
                                <Select
                                  value={mention.date_time_format}
                                  onValueChange={(value) =>
                                    handleTableEdit(
                                      mention.mention_id,
                                      "date_time_format",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select format..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    {dateTimeFormatOptions.map((format) => (
                                      <SelectItem
                                        key={format.value}
                                        value={format.value}
                                      >
                                        {format.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {mention.field_key === "time" && (
                                <Select
                                  value={mention["data-time-format"]}
                                  onValueChange={(value) =>
                                    handleTableEdit(
                                      mention.mention_id,
                                      "data-time-format",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select format..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    {timeFormatOptions.map((format) => (
                                      <SelectItem
                                        key={format.value}
                                        value={format.value}
                                      >
                                        {format.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {mention.field_key === "currency" && (
                                <Select
                                  value={mention.custom_value[0]}
                                  onValueChange={(value) =>
                                    handleTableEdit(
                                      mention.mention_id,
                                      "currency_symbol",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select currency..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    {currencyOptions.map((currency) => (
                                      <SelectItem
                                        key={currency.symbol}
                                        value={currency.symbol}
                                      >
                                        {`${currency.symbol} - ${currency.name}`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {mention.field_key === "dropdown" && (
                                <div className="space-y-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openConfigDialog(mention)}
                                    className="w-full"
                                  >
                                    Configure Options
                                  </Button>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-gray-500 py-2">
                              {getFormatDisplay(mention)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={mention.required || false}
                            onChange={(e) =>
                              isFieldEditable("required") &&
                              handleTableEdit(
                                mention.mention_id,
                                "required",
                                e.target.checked
                              )
                            }
                            disabled={!isFieldEditable("required")}
                            className="h-4 w-4 rounded border-input text-primary"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <DialogFooter className="bottom-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 py-4 border-t gap-2 sm:gap-0">
              {showSkipForMentions == "show_send_button" ||
                (builderType == "preview" &&
                  showSkipForMentions !== "hide_skip" &&
                  showSkipForMentions != "no_send_button") ? (
                <Button variant="outline" onClick={() => onClose("skip")}>
                  Skip and Continue
                </Button>
              ) : (
                <Button variant="outline" onClick={() => onClose()}>
                  Cancel
                </Button>
              )}
              {builderType == "builder" && (
                <Button onClick={handleMapMentions}>Map Mentions</Button>
              )}
              {builderType == "preview" && (
                <Button onClick={handleSave}>Save Changes</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>}

      <DropdownConfigDialog
        configDialogOpen={configDialogOpen}
        setConfigDialogOpen={setConfigDialogOpen}
        currentMention={currentMention}
        dropdownOptions={dropdownOptions}
        addDropdownOption={addDropdownOption}
        updateDropdownOption={updateDropdownOption}
        removeDropdownOption={removeDropdownOption}
        saveDropdownConfig={saveDropdownConfig}
      />
    </>
  );
}

export default MapMentionsValuesDialog;