import React, { useEffect, useState } from "react";
import { Button, Checkbox, Input } from "antd";
import styles from "./style";
import TextArea from "antd/es/input/TextArea";
import { RxCross2 } from "react-icons/rx";
import { FiPlusCircle } from "react-icons/fi";
type Props = {
  setFinshboneData?: any;
  finshbonedata?: any;
  categories?: any;
  formData?: any;
  setformdata?: any;
  readMode?: any;
  submitData?:any;
  setActiveTab?:any
  read?:any
};

const FishBoneAnalysis = ({
  setFinshboneData,
  finshbonedata,
  categories,
  formData,
  readMode,
  setformdata,
  submitData,
  setActiveTab,
  read,
}: Props) => {
  const classes = styles();

  

  const handleAddRow = (category: string) => {
    setFinshboneData((prev: any) => ({
      ...prev,
      [category.toLowerCase()]: [
        ...prev[category.toLowerCase()],
        { textArea: "", checked: false },
      ],
    }));
  };

  const handleDeleteRow = (category: string, index: number) => {
    setFinshboneData((prev: any) => ({
      ...prev,
      [category.toLowerCase()]: prev[category.toLowerCase()].filter(
        (_: any, i: any) => i !== index
      ),
    }));
  };

  const handleChange = (
    category: string,
    index: number,
    key: "textArea" | "checked",
    value: any
  ) => {
    setFinshboneData((prev: any) => ({
      ...prev,
      [category.toLowerCase()]: prev[category.toLowerCase()].map(
        (row: any, i: any) => (i === index ? { ...row, [key]: value } : row)
      ),
    }));
  };

  const moveAnalysisDataToRootCause = () =>{
    submitData()
    setActiveTab("3")
  }

  return (
    <>
      <div className={classes.IsNotContainer}>
        <div className={classes.textContainer}>
          <p className={classes.IsNotText}>Fish-bone Analysis</p>
          <p className={classes.text}>
            Select Causes from different Categories
          </p>
        </div>
      </div>

      {!read && (  <div style={{width:"100%",display:"flex",justifyContent:"end",alignItems:"center",marginTop:"-50px"}}>
        <p style={{border:"1px solid #F1F8FD",borderRadius:"5px",fontWeight:"bold",padding:"5px 10px",backgroundColor:"#F1F8FD"}}>Click on Save Button to Save & Move to Root Cause</p>
      </div>)}

      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {categories.map((category: any) => (
          <div
            key={category}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "5px",
              width: "27%",
            }}
          >
            <p
              style={{
                borderBottom: "solid 4px #003059",
                padding: "8px 10px",
                margin: "0px 0px",
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              {category}
            </p>

            {finshbonedata[category.toLowerCase()].map(
              (row: any, index: any) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    margin: "20px 8px",
                  }}
                >
                  <Checkbox
                    checked={row.checked}
                    onChange={(e) =>
                      handleChange(category, index, "checked", e.target.checked)
                    }
                    className={classes.checkbox}
                    disabled={
                      readMode ||
                      formData?.status === "Open" ||
                      formData?.status === "Outcome_In_Progress" ||
                      formData?.status === "Draft" ||
                      formData?.status === "Closed" ||
                      formData?.status === "Rejected" ||
                      formData?.status === ""
                    }
                  />
                  <TextArea
                    autoSize={{ minRows: 1, maxRows: 5 }}
                    value={row.textArea}
                    className={classes.disabledInput}
                    onChange={(e) =>
                      handleChange(category, index, "textArea", e.target.value)
                    }
                    style={{ width: "70%", height: "35px" }}
                    disabled={
                      readMode ||
                      formData?.status === "Open" ||
                      formData?.status === "Outcome_In_Progress" ||
                      formData?.status === "Draft" ||
                      formData?.status === "Closed" ||
                      formData?.status === "Rejected" ||
                      formData?.status === ""
                    }
                  />
                  {index !== 0 && (
                    <Button
                      onClick={() => handleDeleteRow(category, index)}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected" ||
                        formData?.status === ""
                      }
                      style={{
                        color: "#003059",
                        fontSize: "17px",
                        padding: "0px 5px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <RxCross2 style={{}} />
                    </Button>
                  )}
                </div>
              )
            )}
            <Button
              type="dashed"
              onClick={() => handleAddRow(category)}
              style={{
                fontSize: "14px",
                color: "#003059",
                padding: "5px 12px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
              }}
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Draft" ||
                formData?.status === "Closed" ||
                formData?.status === "Rejected" ||
                formData?.status === ""
              }
            >
              {" "}
              <FiPlusCircle
                style={{
                  color: "#003059",
                }}
              />
              Add Cause
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default FishBoneAnalysis;
