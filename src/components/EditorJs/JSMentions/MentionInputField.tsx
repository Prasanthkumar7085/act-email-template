import { useEffect, useState, memo } from "react";
import { Input } from "~/components/ui/input";

interface MentionInputProps {
    mentionId: string;
    fieldKey: string;
    value: string;
    handleTableEdit: (mentionId: string, field: string, value: string) => void;
    isEditable: boolean;
    className?: string;
    placeholder?: string;
    getInputProps?: (mention: any) => any;
    mention?: any;
}

const MentionInputField = (
    ({
        mentionId,
        fieldKey,
        value,
        handleTableEdit,
        isEditable,
        className = "",
        placeholder = "",
        getInputProps,
        mention,
    }: MentionInputProps) => {
        const [localValue, setLocalValue] = useState(value || "");

        useEffect(() => {
            setLocalValue(value || "");
        }, [value, mention?.mention_id]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (
                mention?.field_key === "number" &&
                fieldKey === "custom_value"
            ) {
                const numericRegex = /^-?\d*\.?\d*$/;
                if (!numericRegex.test(val)) return;
            }
            setLocalValue(val);
            if (isEditable) {
                handleTableEdit(mentionId, fieldKey, val);
            }
        };

        return (
            <div key={mentionId}>

                <Input
                    key={mentionId}
                    {...(getInputProps ? getInputProps(mention) : {})}
                    value={`${localValue}` || localValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                        } ${className}`}
                    disabled={!isEditable}
                    readOnly={!isEditable}
                />
            </div>
        );
    }
);


export default MentionInputField;
