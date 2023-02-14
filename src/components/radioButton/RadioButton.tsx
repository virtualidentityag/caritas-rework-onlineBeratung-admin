/* eslint-disable  @typescript-eslint/ban-types */
export interface RadioButtonItem {
    checked: boolean;
    handleRadioButton: Function;
    inputId: string;
    label: string;
    name: string;
    type: 'default' | 'box' | 'smaller';
    value: string;
}

export const RadioButton = (props: RadioButtonItem) => {
    return (
        <div className={`radioButton radioButton--${props.type}`}>
            <div className="radioButton__contentWrapper">
                <input
                    onClick={(e) => props.handleRadioButton(e)}
                    id={props.inputId}
                    className="radioButton__input"
                    type="radio"
                    name={props.name}
                    value={props.value}
                    defaultChecked={props.checked}
                />
                <label className="radioButton__label" htmlFor={props.inputId}>
                    {props.label}
                </label>
            </div>
        </div>
    );
};
