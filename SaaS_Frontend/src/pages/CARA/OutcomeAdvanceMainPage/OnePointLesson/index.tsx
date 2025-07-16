import TextArea from "antd/es/input/TextArea";
import styles from "./style";
import React, { useState } from "react";

type props = {
  formdata?: any;
  setformdata?: any;
  readMode?: any;
  setOnepointData?:any;
  onepointData?:any;
};

const OnePointLesson = ({ formdata, setformdata, readMode ,setOnepointData,onepointData}: props) => {
  const classes = styles();
 
  // console.log("onepointData", onepointData);
  const handleChange = (e: any) => {
    // setformdata((prev: any) => ({
    //   ...prev,
    //   onePointLesson: e, // ✅ Correctly updating comments
    // }));
    setOnepointData(e)
  };
  return (
    <>
      <div className={classes.IsNotContainer}>
        <div className={classes.textContainer}>
          <p className={classes.IsNotText}>One Point Lesson</p>
          {/* <p className={classes.text}>
            {" "}
            Perform Why-Why for the Causes Selected
          </p> */}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <TextArea
          autoSize={{ minRows: 4 }}
          value={onepointData}
          onChange={(e) => handleChange(e.target.value)}
          style={{ width: "77%" }}
          className={classes.textArea}
          disabled={
            readMode ||
            formdata?.status === "Open" ||
            formdata?.status === "Analysis_In_Progress" ||
            formdata?.status === "Draft" ||
            formdata?.status === "Closed" ||
            formdata?.status === "Accepted" ||
            formdata?.status === "Rejected" ||
            formdata?.status === ""
          }
        />
      </div>
    </>
  );
};

export default OnePointLesson;
