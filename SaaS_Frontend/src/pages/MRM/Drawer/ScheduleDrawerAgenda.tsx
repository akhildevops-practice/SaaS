import { Tabs, Drawer, Space, Button, Tooltip } from "antd";
import { useEffect, useState } from "react";
import useStyles from "../commonDrawerStyles";
import { useMediaQuery } from "@material-ui/core";
import axios from "../../../apis/axios.global";
import { ReactComponent as ExpandIcon } from "../../../assets/icons/row-expand.svg";
import { useNavigate } from "react-router-dom";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
//notistack
import { useSnackbar } from "notistack";

import moment from "moment";
import MeetingAgenda from "./MeetingAgenda";
import MeetingAgendaNotes from "./MeetingAgendaNotes";
import ReferencesTab from "./ReferencesTab";
import DecisionPointsAndMinutes from "./DecisionPointsAndMinutes";
import checkRoles from "../../../utils/checkRoles";
import getYearFormat from "utils/getYearFormat";

type Props = {
  openScheduleDrawer: boolean;
  handleDrawer: any;
  expandDataValues: any;
  mrm: boolean;
  scheduleData: any;
};

const ScheduleDrawer = ({
  openScheduleDrawer,
  handleDrawer,
  expandDataValues,
  mrm,
  scheduleData,
}: Props) => {
  const [formData, setFormData] = useState<any>(expandDataValues || {});
  const [referencesNew, setReferencesNew] = useState<any>([]);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const showData = isOrgAdmin || isMR;
  const navigate = useNavigate();

  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });

  const orgId = sessionStorage.getItem("orgId");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [currentYear, setCurrentYear] = useState<any>();

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const tabs = [
    {
      label: "Meeting Info",
      key: 1,
      children: (
        <MeetingAgenda
          formData={formData}
          setFormData={setFormData}
          scheduleData={scheduleData}
          unitSystemData={undefined}
          mrmEditOptions={undefined}
        />
      ),
    },
    {
      label: "Agenda",
      key: 2,
      children: (
        <MeetingAgendaNotes
          formData={formData}
          setFormData={setFormData}
          scheduleData={scheduleData}
          mrmEditOptions={undefined}
        />
      ),
    },
    {
      label: "References",
      key: 3,
      children: <ReferencesTab drawer={drawer} mrmEditOptions={undefined} />,
    },
    {
      label: "Decision & Minutes",
      key: 4,
      children: (
        <DecisionPointsAndMinutes
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
  ];

  useEffect(() => {
    getyear();
  }, []);
  useEffect(() => {}, [formData.period]);

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  const handleSubmit = async () => {
    const agendaValues: any = [];
    console.log("inside handlesubmit");
    console.log("formdat in submit", formData);
    if (showData) {
      const decisionValue =
        formData?.decisionPoints && formData?.decisionPoints.length
          ? formData?.decisionPoints
          : [];

      if (formData?.dataValue && formData?.dataValue.length) {
        for (let i = 0; i < formData?.dataValue.length; i++) {
          const newValue = formData?.dataValue[i];

          agendaValues.push({
            agenda: newValue?.agenda,
            keyagendaId: newValue?.keyagendaId,
            owner: newValue?.owner,
            decisionPoints: decisionValue,
          });
        }
      }

      if (formData && formData?._id) {
        const newPayload = {
          organizationId: orgId,
          momPlanYear: currentYear,
          unitId: formData?.unit,
          systemId: formData?.system
            ? formData?.system
            : formData?.allValues?.system
            ? formData?.allValues?.system
            : [],
          period: formData?.period,
          meetingName: formData?.meetingTitle,
          meetingdate:
            formData?.changedValues && formData?.changedValues?.date
              ? moment(formData?.changedValues?.date)
              : moment(formData?.date),
          keyAgendaId: agendaValues,
          attendees: formData?.attendees,
          // organizer: userDetail && userDetail?.id,
          description: formData?.meetingDescription,
          decision: decisionValue,
          notes: formData?.meetingMOM,
          updatedBy: userDetail && userDetail?.id,
          files: formData?.file || [],
          // createdBy: userDetail && userDetail?.id
        };
        // update api
        const res = await axios.patch(`/api/mrm/${formData?._id}`, newPayload);

        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(`Data updated Successfully!`, {
            variant: "success",
          });
        }
      } else {
        const newPayload = {
          organizationId: orgId,
          momPlanYear: currentYear,
          unitId: formData?.unit,
          systemId: formData?.system,
          period: formData?.period,
          meetingName: formData?.meetingTitle,
          meetingdate:
            formData?.changedValues && formData?.changedValues?.date
              ? moment(formData?.changedValues?.date)
              : moment(formData?.date),
          keyAgendaId: agendaValues,
          attendees: formData?.attendees,
          organizer: userDetail && userDetail?.id,
          description: formData?.meetingDescription,
          decision: decisionValue,
          notes: formData?.meetingMOM,
          updatedBy: userDetail && userDetail?.id,
          createdBy: userDetail && userDetail?.id,
          files: formData?.file || [],
          currentYear: currentYear,
        };
        console.log("payload in create", newPayload);
        const res = await axios.post("/api/mrm/schedule", newPayload);
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(`Data Added successfully!`, {
            variant: "success",
          });
        }
      }
    }

    setFormData({});
    handleDrawer();
  };
  console.log("formdata in schedule drawer", formData);
  return (
    <Drawer
      title={[
        <span
          key="title"
          style={isSmallScreen ? { fontSize: "13px" } : { fontSize: "16px" }}
        >
          {"Schedule MRM"}
        </span>,
      ]}
      placement="right"
      open={openScheduleDrawer}
      closable={true}
      onClose={handleDrawer}
      className={classes.drawer}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      width={isSmallScreen ? "85%" : "45%"}
      extra={
        <>
          <Space>
            <Button onClick={handleDrawer} className={classes.cancelBtn}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              type="primary"
              className={classes.submitBtn}
            >
              Submit
            </Button>
          </Space>
          <Tooltip title="Expand Form">
            <Button
              // style={{ marginLeft: "8px" }}
              className={classes.expandIcon}
              onClick={() =>
                navigate("/mrm/fullformview", {
                  state: { formData: formData, mrm: mrm },
                })
              }
            >
              <ExpandIcon />
            </Button>
          </Tooltip>
        </>
      }
    >
      <div className={classes.tabsWrapper}>
        <Tabs
          type="card"
          items={tabs as any}
          animated={{ inkBar: true, tabPane: true }}
          // tabBarStyle={{backgroundColor : "green"}}
        />
      </div>
    </Drawer>
  );
};

export default ScheduleDrawer;
