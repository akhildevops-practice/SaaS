//react, react-router
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

//antd
import { Tabs, Drawer, Space, Button } from "antd";

//material-ui
import { useMediaQuery } from "@material-ui/core";

//utils
import axios from "apis/axios.global";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
//components
import ControlMeasureDetailsTab from "components/RiskRegister/ControlMeasureDrawer/ControlMeasureDetailsTab";
import PostMitigationScoreModal from "components/RiskRegister/RiskDrawer/PostMitigationScoreModal";

//styles
import useStyles from "./styles";

//thirdparty libs
import { useSnackbar } from "notistack";
import moment from "moment";

type Props = {
  mitigationModal?: any;
  setMitigationModal?: any;
  existingRiskConfig?: any;
  fetchRisks?: any;
  fetchAspImps?: any;
  tableData?: any;
  setTableData?: any;
  postMitigation?: any;
  setPostMitigation?: any;
  postScore?: any;
  setPostScore?: any;
};
const ControlMeasureDrawer = ({
  mitigationModal,
  setMitigationModal,
  existingRiskConfig,
  fetchRisks,
  tableData,
  setTableData,
  fetchAspImps,
  postMitigation,
  setPostMitigation,
  postScore,
  setPostScore,
}: Props) => {
  const params = useParams();
  const [statusNew, setStatusNew] = useState<boolean>(true);
  const [targetDateNew, setTargetDateNew] = useState<any>();
  const [commentsNew, setCommentsNew] = useState<string>("");
  const [formData, setFormData] = useState<any>();
  const [referencesNew, setReferencesNew] = useState<any>([]);
  const [mitigationForm, setMitigationForm] = useState<any>([]);
  const [levelColor, setLevelColor] = useState<any>("yellow");

  const [postMitigationScoreModal, setPostMitigationScoreModal] = useState<any>(
    {
      open: false,
      mode: mitigationModal.mode,
      data: {},
    }
  );

  const { enqueueSnackbar } = useSnackbar();
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const classes = useStyles();

  const url =
    params.riskcategory === "HIRA" ? "/api/riskregister" : "/api/aspect-impact";

  useEffect(() => {
    console.log("form data in mitigation drawer", referencesNew);
  }, [referencesNew]);

  const handleMitigationFormCreated = (form: any) => {
    setMitigationForm(form);
  };

  const loadDatainRiskMatrix = () => {
    // console.log("checkrisk postmitigation not exist", postMitigation);
    const cumulativeData = existingRiskConfig?.riskCumulative;

    if (!!cumulativeData && !!cumulativeData.length) {
      const newPostMitigation = [...cumulativeData];
      setPostMitigation(newPostMitigation);
      setPostScore(0);
    }
  };

  useEffect(() => {
    if (params.riskcategory === "HIRA") {
      // console.log("checkrisk in hira", mitigationModal );

      if (mitigationModal?.mode === "edit") {
        if (
          !!mitigationModal?.data?.parentRecord?.postMitigation &&
          !!mitigationModal?.data?.parentRecord?.postMitigation.length
        ) {
          // console.log("checkrisk postmitigation exists", postMitigation);

          setPostMitigation(mitigationModal?.data?.parentRecord.postMitigation);

          setPostScore(mitigationModal?.data?.parentRecord.postMitigationScore);
        } else {
          loadDatainRiskMatrix();
        }
      } else {
        loadDatainRiskMatrix();
      }
    }

    if (params.riskcategory === "AspImp") {
      // console.log("checkrisk in asp imp", mitigationModal);

      if (mitigationModal?.mode === "edit") {
        if (
          !!mitigationModal?.data?.parentRecord?.postMitigation &&
          !!mitigationModal?.data?.parentRecord?.postMitigation.length
        ) {
          // console.log("checkrisk postmitigation exists asp imp score", postScore);

          setPostMitigation(mitigationModal?.data?.parentRecord.postMitigation);

          setPostScore(mitigationModal?.data?.parentRecord.postMitigationScore);
        } else {
          loadDatainRiskMatrix();
        }
      } else {
        loadDatainRiskMatrix();
      }
    }
  }, [mitigationModal]);

  const tabs = [
    {
      label: "Mitigation",
      key: 1,
      children: (
        <ControlMeasureDetailsTab
          mitigationModal={mitigationModal}
          setMitigationModal={setMitigationModal}
          fetchRisks={fetchRisks}
          fetchAspImps={fetchAspImps}
          setStatusNew={setStatusNew}
          setTargetDateNew={setTargetDateNew}
          commentsNew={commentsNew}
          setCommentsNew={setCommentsNew}
          formData={formData}
          setFormData={setFormData}
          setReferencesNew={setReferencesNew}
          handleMitigationFormCreated={handleMitigationFormCreated}
          existingRiskConfig={existingRiskConfig}
          postMitigation={postMitigation}
          setPostMitigation={setPostMitigation}
          postScore={postScore}
          setPostScore={setPostScore}
          levelColor={levelColor}
          setLevelColor={setLevelColor}
        />
      ),
    },
    {
      label: "References",
      key: 2,
      children: (
        <></>
        // <CommonReferencesTab
        //   drawer={drawer}
        // />
      ),
    },
  ];

  const onChange = (key: string) => {
    console.log(key);
  };

  const handleCloseModal = () => {
    const updatedData = tableData.map((item: any) => ({
      ...item,
      highlight: false,
    }));
    setTableData(updatedData);
    setMitigationModal({
      ...mitigationModal,
      data: {},
      open: !mitigationModal.open,
    });
  };

  const onStatusChange = (checked: boolean) => {
    setStatusNew(checked);
  };

  const handleSubmit = async () => {
    try {
      await mitigationForm.validateFields();
      const isValidDate = (date: any) => {
        return !isNaN(Date.parse(date));
      };
      let mitigationData: any = {
        title: formData.title || "",
        stage: formData.stage || "",
        status: statusNew || "",
        targetDate: isValidDate(targetDateNew) ? targetDateNew : "",
        comments: commentsNew || "",
        references: referencesNew || "",
      };
      const data = {
        riskId: mitigationModal?.data?.riskId,
        mitigationData,
      };

      // console.log(mitigationModal, mitigationData);

      if (!!postMitigation && postScore > 0) {
        const timestamp = moment().toISOString();
        mitigationData = {
          ...mitigationData,
          lastScoreUpdatedAt: timestamp,
          lastScore: postScore,
        };
        await handleSubmitPostMitigation({
          postMitigation: postMitigation,
          postMitigationScore: postScore,
        });
      }

      // console.log("checkrisk postMitigation data", postMitigation, postScore);

      if (mitigationModal.mode === "create") {
        postMitigationData(data);
      } else {
        console.log("mitigationData in updated", mitigationData);

        putMitigation(mitigationData, mitigationModal);
      }
    } catch (error) {
      //log form errror if needed
      console.log("in mitigation handleSubmit", error);
    }
  };

  const postMitigationData = async (data: any) => {
    try {
      const res = await axios.post(`${url}/addmitigation`, data);
      console.log("res", res);
      if (res.status === 200 || res.status === 201) {
        setMitigationModal({
          ...mitigationModal,
          data: {},
          open: !mitigationModal.open,
        });
        enqueueSnackbar("Risk Mitigation Added Successfully", {
          variant: "success",
        });
        if (params.riskcategory === "HIRA") {
          fetchRisks();
        } else {
          fetchAspImps();
        }
      }
    } catch (error) {
      console.log("error in post mitigation", error);
    }
  };

  const putMitigation = async (data: any, mitigationModal: any) => {
    try {
      const res = await axios.put(
        `${url}/updatemitigation/${mitigationModal.data.id}`,
        data
      );
      console.log("res", res);
      if (res.status === 200 || res.status === 201) {
        setMitigationModal({
          ...mitigationModal,
          data: {},
          open: !mitigationModal.open,
        });
        enqueueSnackbar("Risk Mitigation Updated Successfully", {
          variant: "success",
        });
        if (params.riskcategory === "HIRA") {
          fetchRisks();
        } else {
          fetchAspImps();
        }
      }
    } catch (error) {
      console.log("error in post mitigation", error);
    }
  };

  const handleSubmitPostMitigation = async (data: any) => {
    try {
      const res = await axios.put(
        `${url}/${mitigationModal?.data?.riskId}`,
        data
      );
      console.log("res", res);
      if (res.status === 200 || res.status === 201) {
        return;
      }
    } catch (error) {}
  };

  const toggleScoreModal = () => {
    setPostMitigationScoreModal({
      ...postMitigationScoreModal,
      open: !postMitigationScoreModal.open,
    });
  };

  return (
    <>
      <Drawer
        title={[
          <span
            key="title"
            style={isSmallScreen ? { fontSize: "13px" } : { fontSize: "16px" }}
          >
            {mitigationModal.mode === "create"
              ? "Add Control Measure"
              : "Edit Control Measure"}
          </span>,
        ]}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        placement="right"
        open={mitigationModal.open}
        closable={true}
        onClose={handleCloseModal}
        className={classes.drawerHeader}
        width={isSmallScreen ? "85%" : "40%"}
        maskClosable={false}
        extra={
          <>
            <Space>
              {/* <Switch
                style={
                  isSmallScreen
                    ? { minWidth: "32px" }
                    : { paddingRight: "5px", marginRight: "15px" }
                }
                checked={statusNew}
                onChange={onStatusChange}
              /> */}
              <Button
                style={isSmallScreen ? { padding: "3px 5px" } : {}}
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                style={isSmallScreen ? { padding: "3px 5px" } : {}}
                onClick={handleSubmit}
                type="primary"
              >
                Submit
              </Button>
            </Space>
          </>
        }
      >
        <div className={classes.tabsWrapper}>
          <div
            onClick={toggleScoreModal}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                backgroundColor: "efefef",
                display: "flex",
              }}
            >
              <div
                style={{
                  fontWeight: "bolder",
                  fontSize: "18px",
                  marginRight: "10px",
                }}
              >
                Score : {!!postScore && postScore > 0 && postScore}
              </div>
              {!!postScore && postScore > 0 && (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: "yellow",
                  }}
                ></div>
              )}
            </div>
          </div>
          {!!postMitigationScoreModal.open && (
            <PostMitigationScoreModal
              postMitigationScoreModal={postMitigationScoreModal}
              toggleScoreModal={toggleScoreModal}
              existingRiskConfig={existingRiskConfig}
              // setConfigData={setConfigData}
              postMitigation={postMitigation}
              setPostMitigation={setPostMitigation}
              postScore={postScore}
              setPostScore={setPostScore}
              levelColor={levelColor}
              setLevelColor={setLevelColor}
            />
          )}
          <Tabs
            onChange={onChange}
            type="card"
            items={tabs as any}
            animated={{ inkBar: true, tabPane: true }}
            // tabBarStyle={{backgroundColor : "green"}}
          />
        </div>
      </Drawer>
    </>
  );
};

export default ControlMeasureDrawer;
