import { Button, Input, Select } from "antd";
import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import axios from "apis/axios.global";
import { isArray } from "lodash";
import { v4 as uuidv4 } from "uuid";

type Props = {
  index: number;
  setSelectedValues: any;
  selectedValues: any;
};

const ChecklistInformationModal: React.FC<Props> = ({
  index,
  setSelectedValues,
  selectedValues,
}) => {
  const [selectedField, setSelectedField] = useState("");
  const [selectedFormula, setSelectedFormula] = useState("");
  const [appFields, setAppFields] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (selectedValues[index]) {
      setSelectedField(selectedValues[index].datatype);
      setSelectedFormula(selectedValues[index].dataOptions);
    }
  }, [index, selectedValues]);

  const getData = async () => {
    const res = await axios.get("/api/auditchecksheet/checksheetAppField");
    const data = res?.data;

    const appFieldsData = data
      .filter((item: any) => item.type === "appFields")
      .map((item: any) => ({ value: item.id, label: item.name }));

    const entityTypesData = data
      .filter((item: any) => item.type === "entityType")
      .map((item: any) => ({ value: item.id, label: item.name }));

    setAppFields(appFieldsData);
    setEntityTypes(entityTypesData);
  };

  const [optionsForUoM, setOptionsForUoM] = useState([
    { value: "Kg", label: "Kg" },
    { value: "Meter", label: "Meter" },
    { value: "Nm", label: "Nm" },
    { value: "Hrs", label: "Hrs" },
    { value: "cm", label: "cm" },
    { value: "mm", label: "mm" },
  ]);

  const handleChange = (value: any) => {
    setSelectedField(value);
    setSelectedFormula("");
    updateSelectedValues(index, value, "");
  };

  const handleChangeFormula = (value: any) => {
    setSelectedFormula(value);
    updateSelectedValues(index, "formula", value);
  };

  const updateSelectedValues = (
    index: number,
    datatype: any,
    dataOptions: any
  ) => {
    setSelectedValues((prev: any) => {
      const updatedValues = [...prev];
      updatedValues[index] = {
        id: selectedValues[index]?.id ? selectedValues[index]?.id : uuidv4(),
        datatype,
        dataOptions,
      };
      return updatedValues;
    });
  };

  const addMultiValueInput = (fieldIndex: number) => {
    setSelectedValues((prev: any) => {
      const updatedValues = [...prev];
      const existingOptions = updatedValues[fieldIndex]?.dataOptions || [];
      updatedValues[fieldIndex] = {
        ...updatedValues[fieldIndex],
        dataOptions: [...existingOptions, ""],
      };
      return updatedValues;
    });
  };

  const handleMultiValueInputChange = (
    fieldIndex: number,
    inputIndex: number,
    value: string
  ) => {
    setSelectedValues((prev: any) => {
      const updatedValues = [...prev];
      const existingOptions = updatedValues[fieldIndex]?.dataOptions || [];
      existingOptions[inputIndex] = value;
      updatedValues[fieldIndex] = {
        ...updatedValues[fieldIndex],
        dataOptions: existingOptions,
      };
      return updatedValues;
    });
  };

  return (
    <div style={{ backgroundColor: "#e6e6e6", padding: " 0px 10px 10px 10px" }}>
      <p style={{ fontWeight: "bold", color: "#003059" }}>Data Type :</p>
      <Select
        showSearch
        placeholder="Please Select"
        style={{ width: 200 }}
        onChange={handleChange}
        value={selectedField}
        options={[
          { value: "entityType", label: "Entity Type" },
          { value: "appFields", label: "App Fields" },
          { value: "text", label: "Text" },
          { value: "number", label: "Number" },
          { value: "multiValue", label: "MultiValue" },
          { value: "currentDate", label: "Current Date" },
          { value: "dateSelection", label: "Date Selection" },
          { value: "formula", label: "Formula" },
          { value: "yesNo", label: "Yes / No" },
          { value: "@user", label: "@User" },
          { value: "email", label: "Email" },
        ]}
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
      />

      {selectedField === "entityType" && (
        <div>
          <p style={{ fontWeight: "bold", color: "#003059" }}>Options :</p>
          <Select
            placeholder="Please Select"
            style={{ width: 200 }}
            onChange={(value) =>
              updateSelectedValues(index, "entityType", value)
            }
            value={selectedFormula}
            options={entityTypes}
          />
        </div>
      )}

      {selectedField === "appFields" && (
        <div>
          <p style={{ fontWeight: "bold", color: "#003059" }}>Options :</p>
          <Select
            placeholder="Please Select"
            style={{ width: 200 }}
            onChange={(value) =>
              updateSelectedValues(index, "appFields", value)
            }
            value={selectedFormula}
            options={appFields}
          />
        </div>
      )}

      {selectedField === "number" && (
        <div>
          <p style={{ fontWeight: "bold", color: "#003059" }}>Options :</p>
          <Select
            showSearch
            placeholder="Please Select"
            style={{ width: 200 }}
            onChange={(value) => updateSelectedValues(index, "number", value)}
            value={selectedFormula}
            options={optionsForUoM}
          />
        </div>
      )}

      {selectedField === "multiValue" && (
        <div>
          <p style={{ fontWeight: "bold", color: "#003059" }}>Options :</p>
          {isArray(selectedValues[index]?.dataOptions) &&
            selectedValues[index]?.dataOptions?.map(
              (field: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Input
                    placeholder={`Option ${idx + 1}`}
                    value={field}
                    onChange={(e) =>
                      handleMultiValueInputChange(index, idx, e.target.value)
                    }
                    style={{ marginRight: 10, width: 200 }}
                  />
                  {idx === selectedValues[index].dataOptions.length - 1 && (
                    <Button
                      icon={<AiOutlinePlusCircle />}
                      onClick={() => addMultiValueInput(index)}
                    />
                  )}
                </div>
              )
            )}
          {!selectedValues[index]?.dataOptions && (
            <Button
              icon={<AiOutlinePlusCircle />}
              onClick={() => addMultiValueInput(index)}
            >
              Add Option
            </Button>
          )}
        </div>
      )}

      {selectedField === "formula" && (
        <div>
          <p style={{ fontWeight: "bold", color: "#003059" }}>Options :</p>
          <Select
            showSearch
            placeholder="Please Select"
            style={{ width: 200 }}
            onChange={handleChangeFormula}
            value={selectedFormula}
            options={[
              { value: "sum", label: "Sum()" },
              { value: "product", label: "Product()" },
              { value: "percentage", label: "Percentage()" },
              { value: "ratio", label: "Ratio()" },
            ]}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>
      )}
    </div>
  );
};

export default ChecklistInformationModal;
