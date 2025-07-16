import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@material-ui/core";
import { MdExpandMore } from 'react-icons/md';
import ProjectAdminsTable from "./ProjectAdminsTable";
import Types from "./Types";
import ProjectTracking from "./ProjectTracking";
import Numbering from "./Numbering";
import Risk from "./Risk";
import useStyles from "./style"; // Adjust the import path as needed
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import axios from "apis/axios.global";
import { notification } from "antd";

type NotificationType = "success" | "error" | "info" | "warning";

const NPDSettingsTab2 = () => {
  const classes = useStyles(); // Use the hook
  const navigate = useNavigate();

  useEffect(() => {
    userData();
  }, []);

  const [projectAdminsUsers, setProjectAdminsUsers] = useState([]);

  const userData = async () => {
    try {
      const result = await axios.get("/api/configuration/getAllUserForConfig");
      console.log("result1111", result);
      setProjectAdminsUsers(result.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Combined state
  const [configData, setConfigData] = useState({
    pm: [],
    projectTypes: [],
    productTypes: [],
    rankType: [],
    milestoneTypes: [],
    numbering: [],
    ProjectTracking: [],
    riskConfig: [],
    impactArea: [],
  });

  console.log("configData", configData);

  // Handlers for updating the state
  const handleProjectAdminsIdChange = (ids: any) => {
    setConfigData((prevData) => ({
      ...prevData,
      pm: ids,
    }));
  };

  const handleProjectTypesChange = (types: any) => {
    setConfigData((prevData) => ({
      ...prevData,
      projectTypes: types,
    }));
  };

  const handleProductTypesChange = (types: any) => {
    setConfigData((prevData) => ({
      ...prevData,
      productTypes: types,
    }));
  };

  const handleRankTypesChange = (types: any) => {
    setConfigData((prevData) => ({
      ...prevData,
      rankType: types,
    }));
  };

  const handleRankMilestoneChange = (types: any) => {
    setConfigData((prevData) => ({
      ...prevData,
      milestoneTypes: types,
    }));
  };

  const [numberingData, setNumberingData] = useState({
    numberingType: "",
    pre: "",
    suf: "",
  });

  useEffect(() => {
    handleNumbering(numberingData);
  }, [numberingData]);

  const handleNumbering = (data: any) => {
    setConfigData((prevData: any) => ({
      ...prevData,
      numbering: [data], // Wrap the data in an array
    }));
  };

  const [projectTrackingData, setProjectTrackingData] = useState<any>({
    projectTracking: [
      {
        key: "1",
        projectType: "",
        reviewMeeting: "",
        meetingOccurrence: "",
        activityUpdateFrequency: "",
        updateReminder: "",
      },
    ],
  });

  useEffect(() => {
    handleProjectTracking(projectTrackingData);
  }, [projectTrackingData]);

  const handleProjectTracking = (data: any) => {
    setConfigData((prevData: any) => ({
      ...prevData,
      ProjectTracking: [data], // Wrap the data in an array
    }));
  };

  const [riskConfigurationData, setRiskConfigurationData] = useState<any>([
    {
      key: "1",
      riskScoring: "",
      riskLevel: "",
      indications: "#FFFFFF",
    },
  ]);

  useEffect(() => {
    handleRiskConfigurationData(riskConfigurationData);
  }, [riskConfigurationData]);

  const handleRiskConfigurationData = (data: any) => {
    setConfigData((prevData: any) => ({
      ...prevData,
      riskConfig: [data], // Wrap the data in an array
    }));
  };

  const [impactArea, setImpactArea] = useState<any>([]);

  useEffect(() => {
    handleImpactArea(impactArea);
  }, [impactArea]);

  const handleImpactArea = (data: any) => {
    setConfigData((prevData: any) => ({
      ...prevData,
      impactArea: [data], // Wrap the data in an array
    }));
  };

  // Function to display notifications
  const openNotification = (
    type: NotificationType,
    message: string,
    description: string
  ) => {
    notification[type]({
      message: message,
      description: description,
      placement: "top",
    });
  };

  const submitConfigData = async () => {
    if (configId) {
      try {
        await axios.patch(`/api/configuration/${configId}`, configData);
        openNotification(
          "success",
          "Success",
          "Configuration data updated successfully"
        );
      } catch (error) {
        console.error("Error updating configuration data:", error);
        openNotification(
          "error",
          "Error",
          "Error in updating configuration data"
        );
      }
    } else {
      try {
        await axios.post("/api/configuration", configData);
        openNotification(
          "success",
          "Success",
          "Configuration data submitted successfully"
        );
      } catch (error) {
        console.error("Error submitting configuration data:", error);
        openNotification(
          "error",
          "Error",
          "Error in submitting configuration data"
        );
      }
    }
  };

  const [configurationData, setConfigurationData] = useState();
  console.log("configurationData", configurationData);

  const [configId, setConfigId] = useState();
  console.log("id", configId);

  useEffect(() => {
    getConfigData();
  }, []);

  const getConfigData = async () => {
    const result = await axios.get("/api/configuration");
    console.log("11111111111111", result);
    setConfigurationData(result?.data);
    setConfigId(result?.data[0]?._id);
  };

  const updateConfigData = async () => {};
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div></div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: "18px",
            padding: "10px",
            fontWeight: "bold",
            color: "#0A4663",
          }}
        >
          Configuration
        </div>
        <div style={{ padding: "10px 25px 0px 0px" }}>
          <Button
            onClick={submitConfigData}
            style={{
              margin: "0px 20px",
              backgroundColor: "#0D5E87",
              color: "white",
              fontWeight: "bold",
            }}
          >
            Submit
          </Button>
          <Button
            onClick={() => {
              navigate("/NPDSettingsHomePage");
            }}
            style={{
              border: "2px solid #2874A6",
              fontWeight: 600,
            }}
          >
            Exit
          </Button>
        </div>
      </div>
      <Accordion style={{ marginTop: "20px", padding: "0px 10px" }}>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography className={classes.heading}>Project Admins</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.container}>
          <ProjectAdminsTable
            projectAdminsUsers={projectAdminsUsers}
            pm={configData.pm}
            setSelectedProjectAdminsId={handleProjectAdminsIdChange}
            configurationData={configurationData}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion style={{ padding: "0px 10px" }}>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography className={classes.heading}>Types</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.container}>
          <Types
            projectTypes={configData.projectTypes}
            setProjectTypes={handleProjectTypesChange}
            productTypes={configData.productTypes}
            setProductTypes={handleProductTypesChange}
            rankType={configData.rankType}
            setRankTypes={handleRankTypesChange}
            milestoneTypes={configData.milestoneTypes}
            setMilestoneTypes={handleRankMilestoneChange}
            configurationData={configurationData}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion style={{ padding: "0px 10px" }}>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <Typography className={classes.heading}>
            NPD Numbering Format
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.container}>
          <Numbering
            numberingData={numberingData}
            setNumberingData={setNumberingData}
            configurationData={configurationData}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion style={{ padding: "0px 10px" }}>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel4-content"
          id="panel4-header"
        >
          <Typography className={classes.heading}>Project Tracking</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.container}>
          <ProjectTracking
            projectTrackingData={projectTrackingData}
            setProjectTrackingData={setProjectTrackingData}
            configurationData={configurationData}
            projectTypes={configData.projectTypes}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion style={{ padding: "0px 10px" }}>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel5-content"
          id="panel5-header"
        >
          <Typography className={classes.heading}>
            Risk Configuration
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ marginBottom: "40px" }}>
          <Risk
            riskConfigurationData={riskConfigurationData}
            setRiskConfigurationData={setRiskConfigurationData}
            impactArea={impactArea}
            setImpactArea={setImpactArea}
            configurationData={configurationData}
          />
        </AccordionDetails>
      </Accordion>

      <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
        <Button
          onClick={submitConfigData}
          style={{
            margin: "20px 20px",
            backgroundColor: "#0D5E87",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default NPDSettingsTab2;
