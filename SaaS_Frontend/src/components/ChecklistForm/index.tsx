import React from "react";
import Checklist from "../Checklist";

/**
 * @method checklistForm
 * @description A wrapper which contains the actual checklist form that will be used in the audit creation page
 * @param disabled {any}
 * @returns a react functional component
 */
const ChecklistForm = ({ disabled,}: any) => {
  return (
    <>
      <Checklist disabled={disabled}
       
        />
    </>
  );
};

export default ChecklistForm;
