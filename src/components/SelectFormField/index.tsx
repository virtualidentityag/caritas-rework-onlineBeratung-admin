import { useTranslation } from "react-i18next";
import { Form, Select } from "antd";

export interface Option {
  label: string;
  value: string;
}

export interface SelectFormFieldProps {
  label: string;
  name: string | string[];
  placeholder?: string;
  help?: string;
  loading?: boolean;
  required?: boolean;
  isMulti?: boolean;
  options: Option[];
  allowClear?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  defaultValues?: string | string[];
}

export function SelectFormField({
  label,
  options,
  name,
  isMulti,
  help,
  allowClear,
  required,
  loading,
  placeholder,
  disabled,
  errorMessage,
  defaultValues,
}: SelectFormFieldProps) {
  const [t] = useTranslation();
  const message = errorMessage || t("form.errors.required");
  return (
    <Form.Item
      name={name}
      label={t(label)}
      rules={required ? [{ required: true, message }] : undefined}
      help={help ? t(help) : undefined}
      initialValue={defaultValues}
    >
      <Select
        disabled={disabled}
        showSearch
        loading={loading}
        allowClear={allowClear}
        getPopupContainer={(element: HTMLElement) => element.parentElement}
        mode={isMulti ? "multiple" : undefined}
        placeholder={placeholder ? t(placeholder) : undefined}
        optionFilterProp="children"
        filterOption={(input, option: { children: string }) =>
          option.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        filterSort={(optionA, optionB) =>
          optionA.children
            ?.toLowerCase()
            .localeCompare(optionB.children?.toLowerCase())
        }
      >
        {options.map((option) => (
          <Select.Option value={option.value} key={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
