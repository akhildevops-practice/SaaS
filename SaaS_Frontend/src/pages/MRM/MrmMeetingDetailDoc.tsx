import React, { useEffect } from "react";
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
import MeetingCreatingTab from "./Drawer/MeetingCreatingTab";
import MeetingCreatingTabTwo from "./Drawer/MeetingCreatingTabTwo";
import { createMeeting } from "apis/mrmmeetingsApi";
import {
  expandCreateMeeting,
  expandMeetingData,
} from "recoil/atom";
import { useRecoilState, useResetRecoilState } from "recoil";
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
const MrmMeetingDetailsDoc = (props: any) => {
  const location: any = useLocation();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const showData = isOrgAdmin || isMR;
  const params = useParams();

  const [formData, setFormData] = useRecoilState(expandMeetingData);
  const navigate = useNavigate();
  const resetExpandData = useResetRecoilState(expandMeetingData);
  // const resetExpanAgendaData = useResetRecoilState(expandMeetingAgendaData)
  const orgId = sessionStorage.getItem("orgId");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [dataForm, setDataForm] = useRecoilState(expandCreateMeeting);
  const resetExpandValues = useResetRecoilState(expandCreateMeeting);

  // useEffect(() => {
  //   setFormData({
  //     ...formData,
  //     period: dataForm[0]?.data?.allData?.value?.period ,
  //     createdBy: userInfo?.id,
  //     organizationId: dataForm[0]?.data?.allData?.value?.organizationId,
  //     meetingSchedule: dataForm[0]?.valueById,
  //     locationId: dataForm[0]?.data?.allData?.value?.unitId,
  //   });
  // }, [dataForm]);

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const tabs = [
    {
      label: "Meeting",
      key: 1,
      children: (
        <MeetingCreatingTab
          formData={formData}
          setFormData={setFormData}
          data={dataForm[0]?.data}
          index={undefined}
          valueById={dataForm[0]?.valueById}
          year={dataForm[0]?.year}
        />
      ),
    },
    {
      label: "Decision",
      key: 2,
      children: (
        <MeetingCreatingTabTwo
          formData={formData}
          setFormData={setFormData}
          data={dataForm[0]?.data}
          valueById={dataForm[0]?.valueById}
        />
      ),
    },
    {
      label: "Pending Actions",
      key: 3,
      // children: (
      //   <MeetingCreatingTabThree
      //     data={dataForm[0]?.data}
      //     valueById={dataForm[0]?.valueById}
      //     ownerSourceFilter={undefined}
      //     option={"Create"}
      //     open={open}
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
    // if (location?.state?.setDrawerOpen) {
    //   navigate("/mrm/mrm", {
    //     state: { drawerOpen: true, dataValues: formData },
    //   });
    // }
    resetExpandValues();
    navigate("/mrm/mrm", {
      state: {
        data: dataForm[0]?.data,
        index: undefined,
        action: "Create",
        values: true,
        id: dataForm[0]?.valueById,
        formData: formData,
        valueId: 0,
      },
    });
  };

  // console.log("formData",formData)
  const createMeetingsMrm = () => {
    if (
      formData.meetingName &&
      formData.meetingdate &&
      formData.venue &&
      formData.participants &&
      formData.minutesofMeeting
    ) {
      const payload = {
        ...formData,
        agenda: formData.agenda,
        period: dataForm[0]?.data?.allData?.value?.period,
        createdBy: userInfo?.id,
        organizationId: dataForm[0]?.data?.allData?.value?.organizationId,
        meetingSchedule: dataForm[0]?.valueById,
        locationId: dataForm[0]?.data?.allData?.value?.unitId,
      };
      createMeeting(payload).then((response: any) => {
        if (response.status === 200 || response.status === 201) {
          enqueueSnackbar(`Data Added successfully!`, {
            variant: "success",
          });
          resetExpandData();
          // resetExpanAgendaData();
          goBack();
          resetExpandValues();
        }
      });
    } else {
      enqueueSnackbar(`Please fill required fields!`, {
        variant: "error",
      });
    }
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
                resetExpandValues();
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
              Submit
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

export default MrmMeetingDetailsDoc;
