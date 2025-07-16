import { Button, Input, Radio, Select } from "antd";
import React, { useState, useEffect } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import axios from "apis/axios.global";

type Props = {
  clickedCell?: any;
  selectedCellDatatypes?: any;
  setSelectedCellDatatypes?: any;
  modalClose?: boolean;
  selectedField?: any;
  setSelectedField?: any;
  selectedFormula?: any;
  showCustomMultiValueInput?: any;
  setShowCustomMultiValueInput?: any;
  newOption?: any;
  setNewOption?: any;
  setSelectedFormula?: any;
  selectedFieldToleranceType?: any;
  setSelectedFieldToleranceType?: any;
  selectedFieldToleranceValue?: any;
  setSelectedFieldToleranceValue?: any;
};

const DataTypeforTableCells = ({
  clickedCell,
  selectedCellDatatypes,
  setSelectedCellDatatypes,
  modalClose,
  selectedField,
  setSelectedField,
  selectedFormula,
  showCustomMultiValueInput,
  setShowCustomMultiValueInput,
  newOption,
  setNewOption,
  setSelectedFormula,
  selectedFieldToleranceType,
  setSelectedFieldToleranceType,
  selectedFieldToleranceValue,
  setSelectedFieldToleranceValue,
}: Props) => {
  const [appFields, setAppFields] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);

  const [optionsForUoM, setOptionsForUoM] = useState([
    { value: "", label: "None" },
    { value: "Kg", label: "Kg" },
    { value: "Meter", label: "Meter" },
    { value: "Nm", label: "Nm" },
    { value: "Hrs", label: "Hrs" },
    { value: "cm", label: "cm" },
    { value: "mm", label: "mm" },
  ]);

  useEffect(() => {
    getData();
  }, []);

  const handleChange = (value: any) => {
    setSelectedField(value);
    setSelectedFormula(null);
    setSelectedFieldToleranceType("none");
    setSelectedFieldToleranceValue(0);
    if (
      value !== "entityType" &&
      value !== "appFields" &&
      value !== "number" &&
      value !== "numberRange" &&
      value !== "multiValue" &&
      value !== "formula"
    ) {
      updateSelectedValues(value, ""); // Call with empty object
    }
  };

  const handleChangeFormula = (value: any) => {
    // setSelectedFormula(value);
    updateSelectedValues("formula", value);
  };

  const updateSelectedValues = (dataType: any, dataOptions: any) => {
    setSelectedCellDatatypes({ ...clickedCell, dataType, dataOptions });
    setSelectedFormula(dataOptions);
  };

  const updateSelectedValuesTolerance = (
    dataType: any,
    dataOptions: any,
    toleranceType: any,
    toleranceField: any,
    value: any
  ) => {
    if (toleranceField === "max") {
      setSelectedCellDatatypes({
        ...clickedCell,
        dataType,
        dataOptions,
        toleranceType,
        toleranceValue: {
          ...selectedCellDatatypes.toleranceValue,
          max: value,
        },
      });
      setSelectedFieldToleranceValue({
        ...selectedCellDatatypes.toleranceValue,
        max: value,
      });
    }
    if (toleranceField === "min") {
      setSelectedCellDatatypes({
        ...clickedCell,
        dataType,
        dataOptions,
        toleranceType,
        toleranceValue: {
          ...selectedCellDatatypes.toleranceValue,
          min: value,
        },
      });
      setSelectedFieldToleranceValue({
        ...selectedCellDatatypes.toleranceValue,
        min: value,
      });
    }
    setSelectedFormula(dataOptions);
    setSelectedFieldToleranceType(toleranceType);
  };

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

  const addMultiValueInput = () => {
    setSelectedCellDatatypes((prev: any) => {
      const existingOptions = prev?.dataOptions || []; // Ensure dataOptions is an array
      return {
        ...prev, // Spread the existing object
        dataType: "multiValue",
        dataOptions: [...existingOptions, ""], // Add a new empty string to dataOptions
      };
    });
  };

  const handleMultiValueInputChange = (inputIndex: number, value: string) => {
    setSelectedCellDatatypes((prev: any) => {
      const existingOptions = prev?.dataOptions || []; // Ensure dataOptions is an array
      const updatedOptions = [...existingOptions]; // Clone the existing array
      updatedOptions[inputIndex] = value; // Update the specific index with the new value

      return {
        ...prev, // Spread the existing object
        dataType: "multiValue",
        dataOptions: updatedOptions, // Replace dataOptions with the updated array
      };
    });
  };

  const toleranceTypeChange = (
    dataType: any,
    dataOptions: any,
    value: any,
    toleranceValue: any
  ) => {
    setSelectedCellDatatypes({
      ...clickedCell,
      dataType,
      dataOptions,
      toleranceType: value.target.value,
      toleranceValue,
    });
    setSelectedFieldToleranceType(value.target.value);
  };

  return (
    <div style={{ padding: "0px 0px" }}>
      <p style={{ fontWeight: "bold", color: "#003059" }}>Data Type :</p>
      <Select
        showSearch
        placeholder="Please Select"
        style={{ width: 250 }}
        onChange={handleChange}
        value={selectedField}
        options={
          selectedCellDatatypes.columnType === "remarks"
            ? [
                { value: "text", label: "Text" },
                { value: "yesNo", label: "Yes / No" },
              ]
            : [
                { value: "entityType", label: "Entity Type" },
                { value: "appFields", label: "App Fields" },
                { value: "text", label: "Text" },
                { value: "number", label: "Number" },
                { value: "multiValue", label: "MultiValue" },
                { value: "currentDate", label: "Current Date" },
                { value: "dateSelection", label: "Date Selection" },
                { value: "formula", label: "Formula" },
                { value: "yesNo", label: "Yes / No" },
                { value: "numberRange", label: "Range" },
                { value: "email", label: "Email" },
                { value: "image", label: "Image" },
              ]
        }
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
      />

      {selectedField === "entityType" && (
        <div>
          <p style={{ fontWeight: "bold", color: "#003059" }}>Options : </p>
          <Select
            placeholder="Please Select"
            style={{ width: 250 }}
            onChange={(value) => updateSelectedValues("entityType", value)}
            options={entityTypes}
            value={selectedFormula}
          />
        </div>
      )}

      {selectedField === "appFields" && (
        <div>
          <p style={{ fontWeight: "bold", color: "#003059" }}>Options :</p>
          <Select
            placeholder="Please Select"
            style={{ width: 250 }}
            onChange={(value) => updateSelectedValues("appFields", value)}
            options={appFields}
            value={selectedFormula}
          />
        </div>
      )}

      {selectedField === "multiValue" && (
        <div>
          <p style={{ fontWeight: "bold", color: "#003059" }}>Options :</p>
          {(selectedCellDatatypes?.dataOptions || []).map(
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
                    handleMultiValueInputChange(idx, e.target.value)
                  }
                  style={{ marginRight: 10, width: 200 }}
                />
                {idx === selectedCellDatatypes?.dataOptions.length - 1 && (
                  <Button
                    icon={<AiOutlinePlusCircle />}
                    onClick={() => addMultiValueInput()}
                  />
                )}
              </div>
            )
          )}
          {!selectedCellDatatypes?.dataOptions && (
            <Button
              icon={<AiOutlinePlusCircle />}
              onClick={() => addMultiValueInput()}
            >
              Add Option
            </Button>
          )}
        </div>
      )}

      {selectedField === "number" && (
        <>
          <div style={{ display: "inline", paddingLeft: "20px" }}>
            <Radio.Group
              onChange={(value) =>
                toleranceTypeChange(
                  "number",
                  selectedCellDatatypes?.dataOptions,
                  value,
                  selectedCellDatatypes?.toleranceValue
                )
              }
              value={selectedFieldToleranceType}
              options={[
                { value: "none", label: "None" },
                { value: "tolerance", label: "Tolerance" },
              ]}
            />
          </div>
          <div style={{ display: "flex" }}>
            <div>
              <p style={{ fontWeight: "bold", color: "#003059" }}>Options :</p>
              <Select
                placeholder="Please Select UoM"
                style={{ width: 250 }}
                options={optionsForUoM}
                onChange={(value) => updateSelectedValues("number", value)}
                value={selectedFormula}
              />
            </div>
            {selectedCellDatatypes.toleranceType === "tolerance" && (
              <div style={{ paddingLeft: "20px" }}>
                <p style={{ fontWeight: "bold", color: "#003059" }}>
                  Tolrence Value :
                </p>
                <div>
                  <div>
                    <span style={{ paddingRight: 10 }}>{"(+)"}</span>
                    <Input
                      type={"number"}
                      value={selectedFieldToleranceValue?.max}
                      onChange={(value) =>
                        updateSelectedValuesTolerance(
                          "number",
                          selectedCellDatatypes?.dataOptions,
                          selectedCellDatatypes?.toleranceType,
                          "max",
                          value.target.value
                        )
                      }
                      style={{ width: 100 }}
                    />
                  </div>
                  <div style={{ paddingTop: 10 }}>
                    <span style={{ paddingRight: 10 }}>{"(-)"}</span>
                    <Input
                      type={"number"}
                      value={selectedFieldToleranceValue?.min}
                      onChange={(value) =>
                        updateSelectedValuesTolerance(
                          "number",
                          selectedCellDatatypes?.dataOptions,
                          selectedCellDatatypes?.toleranceType,
                          "min",
                          value.target.value
                        )
                      }
                      style={{ width: 100 }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {selectedField === "numberRange" && (
        <div>
          <p style={{ fontWeight: "bold", color: "#003059" }}>Options :</p>
          <Select
            placeholder="Please Select UoM"
            style={{ width: 250 }}
            options={optionsForUoM}
            onChange={(value) => updateSelectedValues(selectedField, value)}
            value={selectedFormula}
          />
        </div>
      )}

      {selectedField === "formula" && (
        <div>
          <p style={{ fontWeight: "bold", color: "#003059" }}>Options :</p>
          <Select
            placeholder="Please Select UoM"
            style={{ width: 250 }}
            onChange={handleChangeFormula}
            options={[
              { value: "Sum", label: "Sum()" },
              { value: "Product", label: "Product()" },
              { value: "Ratio", label: "Ratio()" },
              { value: "Percentage", label: "Percentage()" },
            ]}
            value={selectedFormula}
          />
          <div style={{ marginTop: "20px" }}>
            {selectedFormula === "Sum" && <div>Sum Function</div>}
            {selectedFormula === "Product" && <div>Product Function</div>}
            {selectedFormula === "Ratio" && <div>Ratio Function</div>}
            {selectedFormula === "Percentage" && <div>Percentage Function</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTypeforTableCells;
