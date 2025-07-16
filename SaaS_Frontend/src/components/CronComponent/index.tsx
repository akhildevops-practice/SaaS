import { useState, useReducer } from "react";
import { Cron, CronError } from "react-js-cron";
import "react-js-cron/dist/styles.css";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Input as AntdInput } from "antd";
//import { useState } from 'react';
function useCronReducer(state: any, action: any) {
  switch (action.type) {
    case "set_input_value":
      return { ...state, inputValue: action.value };
    case "set_cron_value":
      return { ...state, cronValue: action.value };
    case "set_values":
      return { ...state, cronValue: action.value, inputValue: action.value };
    default:
      return state;
  }
}

//handlechage
//props
//recoil

function reducer(state: any, action: any) {
  switch (action.type) {
    case "set_input_value":
      return { ...state, inputValue: action.value };
    case "set_cron_value":
      return { ...state, cronValue: action.value };
    case "set_values":
      return { ...state, cronValue: action.value, inputValue: action.value };
    default:
      throw new Error();
  }
}

export function Demo() {
  const defaultValue = "30 5 * * 1,6";
  //   const [values, dispatchValues] = useCronReducer(defaultValue);
  const [error, onError] = useState<CronError>();
  const [values, dispatchValues] = useReducer(useCronReducer, {
    inputValue: defaultValue,
    cronValue: defaultValue,
  });
  console.log("cron value", values.inputValue);
  return (
    <div>
      <AntdInput
        value={values.inputValue}
        onChange={(event: any) => {
          console.log("onchange called", event.target.value);
          dispatchValues({
            type: "set_input_value",
            value: event.target.value,
          });
        }}
        onBlur={(e) => {
          //console.log("onblur called", e.target);
          dispatchValues({
            type: "set_cron_value",
            value: values.inputValue,
          });
        }}
        onPressEnter={(e) => {
          // console.log("onpressentercalled", e.target);
          dispatchValues({
            type: "set_cron_value",
            value: values.inputValue,
          });
        }}
      />

      {/* <Divider>OR</Divider> */}

      <Cron
        value={values.cronValue}
        setValue={(newValue: string) => {
          dispatchValues({
            type: "set_values",
            value: newValue,
          });
        }}
        onError={onError}
      />

      <div>
        <AiOutlineInfoCircle style={{ marginRight: 5 }} />
        <span style={{ fontSize: 12 }}>
          Double click on a dropdown option to automatically select / unselect a
          periodicity
        </span>
      </div>

      <p style={{ marginTop: 20 }}>
        Error: {error ? error.description : "undefined"}
      </p>
    </div>
  );
}
