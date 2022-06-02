import { useState } from "react";
import { Text } from "../text/Text";
import { ReactComponent as ShowPasswordIcon } from "../../resources/img/svg/eye.svg";
import { ReactComponent as HidePasswordIcon } from "../../resources/img/svg/eye-closed.svg";

export type InputFieldLabelState = "valid" | "invalid";

// TODO: clean up interface
export interface InputFieldItem {
  id: string;
  type: string;
  name: string;
  label: string;
  content: string;
  class?: string;
  icon?: JSX.Element;
  infoText?: string;
  maxLength?: number;
  pattern?: string;
  disabled?: boolean;
  postcodeFallbackLink?: string;
  warningLabel?: string;
  warningActive?: boolean;
  labelState?: InputFieldLabelState;
}

export interface InputFieldProps {
  item: InputFieldItem;
  inputHandle: Function;
  keyUpHandle?: Function;
}

export interface GeneratedInputs {
  addictiveDrugs?: string[];
  relation?: string;
  age?: string;
  gender?: string;
  state?: string;
}

export function InputField(props: InputFieldProps) {
  const inputItem = props.item;
  const [showPassword, setShowPassword] = useState(false);

  const handleInputValidation = (e: any) => {
    const postcode = e.target.value;
    let postcodeValid = true;
    if (inputItem.maxLength) {
      postcodeValid = postcode.length <= inputItem.maxLength;
    }
    if (postcodeValid && postcode.length > 0 && inputItem.pattern) {
      postcodeValid = RegExp(inputItem.pattern).test(postcode);
    }
    if (postcodeValid) {
      props.inputHandle(e);
    }
  };

  const handleKeyUp = (e: any) => {
    if (props.keyUpHandle) {
      props.keyUpHandle(e);
    }
  };

  return (
    <div
      className={`inputField ${inputItem.icon ? `inputField--withIcon` : ``}`}
    >
      {inputItem.icon && (
        <span className="inputField__icon">{inputItem.icon}</span>
      )}
      <input
        onChange={handleInputValidation}
        id={inputItem.id}
        type={showPassword ? "text" : inputItem.type}
        className={`inputField__input
					${inputItem.class ? ` ${inputItem.class}` : ""}
					${inputItem.labelState === "valid" ? " inputField__input--valid" : ""}
					${inputItem.labelState === "invalid" ? " inputField__input--invalid" : ""}
				`}
        value={inputItem.content ? inputItem.content : ``}
        name={inputItem.name}
        placeholder={inputItem.label}
        disabled={inputItem.disabled}
        autoComplete="off"
        onKeyUp={handleKeyUp}
      />
      <label className="inputField__label" htmlFor={inputItem.id}>
        {inputItem.label}
      </label>
      {inputItem.type === "password" && (
        <span
          aria-hidden="true"
          onClick={() => setShowPassword(!showPassword)}
          className="inputField__passwordToggle"
        >
          {showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
        </span>
      )}
      {inputItem.infoText && (
        <Text
          className="inputField__infoText"
          text={inputItem.infoText}
          type="infoSmall"
        />
      )}
    </div>
  );
}
