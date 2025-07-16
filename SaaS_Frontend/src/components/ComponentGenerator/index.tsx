import { ComponentType } from "../../utils/enums";
import CheckBoxComponent from "../CheckBoxComponent";
import RadioComponent from "../RadioComponent";
import TextComponent from "../TextComponent";
import NumericComponent from "../NumericComponent";
import { InputHandlerType } from "../../utils/enums";

type Props = {
  type: ComponentType;
  inputHandlerType?: InputHandlerType;
  handler: any;
  numericData?: any;
  radioData?: any;
  disabled?: boolean;
  textValue?: any;
  min?:number;
  max?:number;
};

/**
 * @method ComponentGenerator
 * @description Function to generate a component type (Numeric, Text, CheckBox, Radio)
 * @param type {ComponentType}
 * @param inputHandlerType {InputHandlerType}
 * @param handler {function}
 * @param numericData {any}
 * @param radioData {any}
 * @param disabled {boolean}
 * @returns a react node
 */
const ComponentGenerator = ({
  type,
  inputHandlerType,
  handler,
  numericData,
  radioData,
  disabled,
  textValue = "",
  min,
  max
}: Props) => {
  const formComponent = {
    radio: (
      <RadioComponent
        handler={handler}
        data={radioData}
        initialValue={textValue}
        disabled={disabled}
      />
    ),
    numeric: (
      <NumericComponent
        handler={handler}
        inputHandlerType={inputHandlerType!}
        data={numericData}
        disabled={disabled}
        value={textValue}
        min={min}
        max={max}
      />
    ),
    text: (
      <TextComponent handler={handler} disabled={disabled} value={textValue} />
    ),
    checkbox: (
      <CheckBoxComponent
        data={radioData}
        handler={handler}
        disabled={disabled}
      />
    ),
  };

  return formComponent[type];
};

export default ComponentGenerator;
