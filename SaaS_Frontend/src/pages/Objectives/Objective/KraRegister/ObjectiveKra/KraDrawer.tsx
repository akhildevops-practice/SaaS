import { Tabs, Drawer, Space, Button } from "antd";
import useStyles from "./KraDrawerStyles";
import axios from "../../../../../apis/axios.global";
import { useMediaQuery } from "@material-ui/core";
import { useState } from "react";
import { useSnackbar } from "notistack";
import KraModalForm from "./KraModalForm";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import { referencesData } from "recoil/atom";
import { useRecoilState } from "recoil";
import getSessionStorage from "utils/getSessionStorage";
import CloseIconImageSvg from "assets/documentControl/Close.svg";

type Props = {
  kraModal?: any;
  setKraModal?: any;
  fetchObjectives?: any;
  tableData?: any;
  setTableData?: any;
  kraDrawer?: any;
  setKraDrawer?: any;
  url?: any;
};
const KraDrawer = ({
  kraModal,
  setKraModal,
  fetchObjectives,
  tableData,
  setTableData,
  kraDrawer,
  setKraDrawer,
  url,
}: Props) => {
  const [statusNew, setStatusNew] = useState<boolean>(true);
  const [targetDateNew, setTargetDateNew] = useState<any>();
  const [commentsNew, setCommentsNew] = useState<string>("");
  const [formData, setFormData] = useState<any>();
  const [referencesNew, setReferencesNew] = useState<any>([]);
  const [kraForm, setKraForm] = useState<any>([]);
  const [refsData] = useRecoilState(referencesData);
  const { enqueueSnackbar } = useSnackbar();
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const classes = useStyles();
  const orgId = sessionStorage.getItem("orgId");
  const userInfo = getSessionStorage();
  const [selectedKPIs, setSelectedKPIs] = useState<any>([]);

  const handleKraFormCreated = (form: any) => {
    setKraForm(form);
  };

  const tabs = [
    {
      label: "Goal",
      key: 1,
      children: (
        <KraModalForm
          kraModal={kraModal}
          setKraModal={setKraModal}
          setStatusNew={setStatusNew}
          setTargetDateNew={setTargetDateNew}
          commentsNew={commentsNew}
          setCommentsNew={setCommentsNew}
          formData={formData}
          setFormData={setFormData}
          setReferencesNew={setReferencesNew}
          handleKraFormCreated={handleKraFormCreated}
          selectedKPIs={selectedKPIs}
          setSelectedKPIs={setSelectedKPIs}
        />
      ),
    },
    {
      label: "References",
      key: 2,
      children: <CommonReferencesTab drawer={kraDrawer} />,
    },
  ];

  const handleCloseModal = () => {
    const updatedData = tableData.map((item: any) => ({
      ...item,
      highlight: false,
    }));
    setTableData(updatedData);
    setKraModal({
      ...kraModal,
      data: {},
      open: !kraModal.open,
    });
    setKraDrawer({ ...kraDrawer, open: !kraDrawer.open });
  };

  const onStatusChange = (checked: boolean) => {
    setStatusNew(checked);
  };
  console.log("formdata in kradrawer", formData);

  const handleSubmitKra = async () => {
    console.log("formdata", formData);
    const kraData = {
      KraName: formData?.KraName || kraModal.data?.KraName,
      objective: formData?.objective || kraModal.data?.ObjectiveName,
      Target: formData?.Target || kraModal.data?.Target,
      TargetType: formData?.TargetType || kraModal.data?.TargetType,
      UnitOfMeasure: formData?.UnitOfMeasure || kraModal.data?.UnitOfMeasure,
      StartDate: formData?.StartDate || "",
      EndDate: formData?.EndDate || "",
      Status: formData?.Status || "",
      Comments: formData?.Comments || "",
      UserName: formData?.UserName || "",
      KpiReportId: formData?.KpiReportId || "",
      ObjectiveId: kraModal?.data?.ObjectiveId,
      objectiveCategories:
        formData?.objectiveCategories || kraModal.data?.objectiveCategories,
      description: formData?.description || "",
      associatedKpis: selectedKPIs || "",
    };
    console.log("kra data", kraData);
    if (kraData.KraName && kraData.objectiveCategories && kraData?.TargetType) {
      if (kraDrawer.mode === "create") {
        postKra(kraData);
      } else {
        putKra(kraData, kraModal);
      }
    } else {
      enqueueSnackbar(
        `Please enter mandatory fields(Goal Title,Objective Category and Goal Type)`,
        { variant: "error" }
      );
    }
  };

  const postKra = async (data: any) => {
    try {
      const res = await axios.post("/api/kra/create", data);
      if (res.status === 200 || res.status === 201) {
        let formattedReferences: any = [];

        if (refsData && refsData.length > 0) {
          formattedReferences = refsData.map((ref: any) => ({
            refId: ref.refId,
            organizationId: orgId,
            type: ref.type,
            name: ref.name,
            comments: ref.comments,
            createdBy: userInfo.firstName + " " + userInfo.lastName,
            updatedBy: null,
            link: ref.link,
            refTo: res.data._id,
          }));
        }
        const refs = await axios.post(
          "/api/refs/bulk-insert",
          formattedReferences
        );

        setKraModal({
          ...kraModal,
          data: {},
          open: !kraModal.open,
        });
        setKraDrawer({ ...kraDrawer, open: !kraDrawer.open });
        enqueueSnackbar("Objective KRA Added Successfully", {
          variant: "success",
        });
        fetchObjectives(url);
      }
    } catch (error) {
      console.log("error in post KRA", error);
    }
  };

  const putKra = async (data: any, kraModal: any) => {
    try {
      const res = await axios.put(
        `/api/kra/updateKraById/${kraModal.data._id}`,
        data
      );
      if (res.status === 200 || res.status === 201) {
        // let formattedReferences: any = [];

        // if (refsData && refsData.length > 0) {
        //   formattedReferences = refsData.map((ref: any) => ({
        //     refId: ref.refId,
        //     organizationId: orgId,
        //     type: ref.type,
        //     name: ref.name,
        //     comments: ref.comments,
        //     createdBy: userInfo.firstName + " " + userInfo.lastName,
        //     updatedBy: null,
        //     link: ref.link,
        //     refTo: res.data._id,
        //   }));
        // }
        // const refs = await axios.post(
        //   "/api/refs/bulk-insert",
        //   formattedReferences
        // );
        setKraModal({
          ...kraModal,
          data: {},
          open: !kraModal.open,
        });
        setKraDrawer({ ...kraDrawer, open: !kraDrawer.open });
        enqueueSnackbar("Objective KRA Updated Successfully", {
          variant: "success",
        });
        fetchObjectives(url);
      }
    } catch (error) {
      console.log("error in post kra", error);
    }
  };
  return (
    <>
      <Drawer
        title={[
          <span
            key="title"
            style={isSmallScreen ? { fontSize: "13px" } : { fontSize: "16px" }}
          >
            {kraDrawer?.mode === "create" ? "Add Goal" : "Edit Goal"}
          </span>,
        ]}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        maskClosable={false}
        placement="right"
        // open={kraModal.open}
        open={kraDrawer.open}
        closable={true}
        onClose={handleCloseModal}
        className={classes.drawer}
        width={isSmallScreen ? "85%" : "50%"}
        extra={
          <>
            <Space>
              <Button
                style={isSmallScreen ? { padding: "3px 5px" } : {}}
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                // style={isSmallScreen ? { padding: "3px 5px" } : {} }
                style={{ background: "#003566", color: "white" }}
                onClick={handleSubmitKra}
              >
                Submit
              </Button>
            </Space>
          </>
        }
      >
        <div className={classes.tabsWrapper}>
          <Tabs
            // onChange={onChange}
            type="card"
            items={tabs as any}
            animated={{ inkBar: true, tabPane: true }}
          />
        </div>
      </Drawer>
    </>
  );
};

export default KraDrawer;
