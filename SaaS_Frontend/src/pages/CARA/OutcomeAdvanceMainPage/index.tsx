import { Button, Tabs } from "antd";
import type { TabsProps } from "antd";
import styles from "./style";
import OnePointLesson from "./OnePointLesson";
import CorrectiveAction from "./CorrectiveAction";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";

type props = {
  formdata?: any;
  setformdata?: any;
  readMode?: any;
};

const OutcomeAdvanceMainPage = ({ formdata, setformdata, readMode }: props) => {
  const classes = styles();
    const { id } = useParams();
     const { enqueueSnackbar } = useSnackbar();
    const userInfo = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [activeKey, setActiveKey] = useState("1");
  const [onepointData, setOnepointData] = useState("");
 



  useEffect(()=>{
    if(formdata.onePointLesson){
      setOnepointData(formdata.onePointLesson)
    }
   
  },[formdata])

    const submitData = () => {
      const payload = {
        onePointLesson:onepointData,
      };
  
   
      // if (editMode === true) {
        submitAnalysisEditedData(payload);
      // } else {
      //   submitAnalysisData(payload);
      // }
    };
  
    const submitAnalysisData = async (payload: any) => {
      const result = await axios.post("/api/cara/createAnalysis", payload);
      
      if (result.status === 200 || result.status === 201) {
        // getAnalysisData();
        enqueueSnackbar("Data Saved", {
          variant: "success",
        });
      }
    };
  
    const submitAnalysisEditedData = async (payload: any) => {
      const result = await axios.patch(`/api/cara/updateCaraForOutcome/${id}`, payload);
  
      if (result.status === 200 || result.status === 201) {
        setformdata((prev:any) => ({
     ...prev,
      onePointLesson:result.data.onePointLesson
        }));

        
        enqueueSnackbar("Data Saved", {
          variant: "success",
        });
      }
    };


      // const getAnalysisData = async () => {
      //   const result = await axios.get(`/api/cara/getAnalysisForCapa/${id}`);
      //   console.log("getAnalysisData", result);
      //   if (result.status === 200 || result.status === 201) {
        
      //   }
      //   // if (result.data === "") {
      //   //   setEditmode(false);
      //   // } else {
      //   //   setEditmode(true);
      //   // }
      // };


  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Corrective Action",
      children: (
        <CorrectiveAction
          formdata={formdata}
          setformdata={setformdata}
          readMode={readMode}
        />
      ),
    },
    {
      key: "2",
      label: "One Point Lesson",
      children: (
        <OnePointLesson
          formdata={formdata}
          setformdata={setformdata}
          readMode={readMode}
          setOnepointData={setOnepointData}
          onepointData={onepointData}
        />
      ),
    },
  ];

  return (
    <div className={classes.mainPageContainer}>
      <div className={classes.tabContainer}>
        <Tabs
       activeKey={activeKey}
          type="card"
          items={items}
          className={classes.tabsWrapper}
          tabBarStyle={{ display: "flex", justifyContent: "center" }}
          onChange={setActiveKey}
        />
      </div>
      {activeKey === "2" && (
        <Button
          style={{
            backgroundColor: "#003059",
            fontSize: "14px",
            width: "90px",
            textAlign: "center",
            color: "white",
            position: "absolute",
            top: "77px",
            right: "66px",
            zIndex: 1100,
          }}
          onClick={submitData}
          disabled={readMode}
        >
          Save
        </Button>
      )}
    </div>
  );
};

export default OutcomeAdvanceMainPage;
