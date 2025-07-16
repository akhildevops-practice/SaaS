import React, { useState, useEffect } from "react";
import { Button, Layout, Space, Tabs } from "antd";
import { ReactComponent as ShrinkIcon } from "../../assets/icons/shrink-new.svg";
import { useNavigate } from "react-router-dom";
import { Theme, Tooltip, makeStyles } from "@material-ui/core";
import { useLocation } from "react-router";
import { useSnackbar } from "notistack";
import { useMediaQuery } from "@material-ui/core";
import axios from "../../apis/axios.global";
import { useParams } from "react-router-dom";
import checkRoles from "../../utils/checkRoles";
import MeetingEditingTab from "./Drawer/MeetingEditingTab";
import MeetingEditingTabTwo from "./Drawer/MeetingEditingTabTwo";
import { updateMeeting } from "apis/mrmmeetingsApi";
import { useRecoilState, useResetRecoilState } from "recoil";
import { expandMeetingAgendaData, expandMeetingData } from "recoil/atom";

const { Content, Header } = Layout;

const useStyles = makeStyles((theme: Theme) => ({
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#ADD8E6 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#020758  !important",
      color: "#fff",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
  scrollBars: {
    "&.hide-scrollbar::-webkit-scrollbar": {
      display: "none",
    },
  },
}));
const MrmMeetingDetailsEditDoc = (props: any) => {
  const location: any = useLocation();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const [upload, setUpload] = useState(false);
  // const [open, setOpen] = useState<any>(true);
  const showData = isOrgAdmin || isMR;
  const params = useParams();

  const [formData, setFormData] = useRecoilState(expandMeetingData);
  const [addAgendaValues, setAddAgendaValues] = useRecoilState(
    expandMeetingAgendaData
  );
  const navigate = useNavigate();
  const resetExpandData = useResetRecoilState(expandMeetingData);
  const resetExpanAgendaData = useResetRecoilState(expandMeetingAgendaData);
  const orgId = sessionStorage.getItem("orgId");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const tabs = [
    {
      label: "Meeting",
      key: 1,
      children: (
        <MeetingEditingTab
          formData={formData}
          setFormData={setFormData}
          data={location?.state?.state?.data}
          editDataMeeting={location?.state?.state?.editDataMeeting}
          readMode={location?.state?.state?.readMode}
          index={undefined}
          setUpload={setUpload}
        />
      ),
    },
    {
      label: "Decision",
      key: 4,
      children: (
        <MeetingEditingTabTwo
          formData={formData}
          setFormData={setFormData}
          data={location?.state?.state?.data}
          ownerSourceFilter={location?.state?.state?.ownerSourceFilter}
          valueById={location?.state?.state?.valueById}
          readMode={location?.state?.state?.readMode}
        />
      ),
    },
    {
      label: "Pending Actions",
      key: 3,
      // children: (
      //   <MeetingCreatingTabThree
      //     data={location?.state?.data}
      //     valueById={location?.state?.valueById}
      //     ownerSourceFilter={location?.state?.state?.ownerSourceFilter}
      //     option={"Edit"}
      //     // open={undefined}
      //   />
      // ),
    },
  ];

  useEffect(() => {
    if (params && params.id && params.id.length) {
      getMRMValues();
    }
  }, []);

  const getMRMValues = async () => {
    const res = await axios(`/api/mrm/getMrmMeetingDetails/${params?.id}`);
    if (res.status === 200 || res.status === 201) {
      const data = res.data && res.data[0];
      //   setFormData({
      //     organizer: data?.userName,
      //     unit: data?.value?.unitId,
      //     system: data?.value?.systemId,
      //     meetingTitle: data?.value?.meetingName,
      //     period: data?.value?.period,
      //     meetingDescription: data?.value?.description,
      //     dataValue: data?.value?.keyAgendaId,
      //     attendees: data?.value?.attendees,
      //     allData: data,
      //     date: data?.value?.meetingdate,
      //     _id: data?.value?._id,
      //     meetingMOM: data?.value?.notes,
      //   });
    }
  };

  const goBack = () => {
    // if (location?.state?.meeting) {
    //   navigate("/mrm/mrm", {{ state: { drawerOpen: true }
    //     state: { drawerOpen: true, dataValues: formData },
    //   });
    // }
    navigate("/mrm/mrm", {
      state: {
        data: location?.state?.state?.data,
        index: undefined,
        action: "Edit",
        values: true,
        valueId: 1,
      },
    });
  };

  const createMeetingsMrm = () => {
    updateMeeting(location?.state?.state?.editDataMeeting._id, formData).then(
      (response: any) => {
        // console.log("response====>update api", response);
        resetExpandData();
        if (response.status === 200 || response.status === 201) {
          enqueueSnackbar(`Data Added successfully!`, {
            variant: "success",
          });
          goBack();
        }
      }
    );
  };

  return (
    <Layout style={{ background: "aliceblue" }}>
      <Header style={{ backgroundColor: "#fff", padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <Tooltip title="Shrink Form">
              <Button
                // type="primary"
                onClick={goBack}
                // style={{ marginRight: "16px" }}
              >
                <ShrinkIcon
                  style={{
                    width: "1em",
                    height: "1em",
                    fill: "black",
                    verticalAlign: "middle",
                    overflow: "hidden",
                  }}
                />
                {/* <ArrowBackIcon /> */}
              </Button>
            </Tooltip>
          </div>
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                goBack();
              }}
            >
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#020758", color: "#fff" }}
              onClick={() => {
                createMeetingsMrm();
              }}
            >
              Update
            </Button>
          </Space>
        </div>
      </Header>
      <Content style={{ margin: "24px 16px 0" }}>
        <div
          style={{
            padding: 24,
            minHeight: 280,
            backgroundColor: "#fff",
          }}
        >
          <div className={classes.tabsWrapper}>
            <Tabs
              type="card"
              items={tabs as any}
              style={{
                width: "95%",
                height: "400px",
                overflowY: "auto",
                overflowX: "hidden",
              }}
              animated={{ inkBar: true, tabPane: true }}
              className={classes.scrollBars}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default MrmMeetingDetailsEditDoc;
