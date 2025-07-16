import { Tabs, Drawer, Space, Button } from "antd";
import { useEffect, useState } from "react";
import useStyles from "../commonDrawerStyles";
import { useMediaQuery } from "@material-ui/core";
import axios from "../../../apis/axios.global";

import { useNavigate } from "react-router-dom";
import { Switch } from "antd";

//notistack
import { useSnackbar } from "notistack";
import moment from "moment";
import getAppUrl from "../../../utils/getAppUrl";

import ReferencesTab from "./ReferencesTab";
import AddActionPoint from "./AddActionPoint";
import checkRoles from "../../../utils/checkRoles";
import getYearFormat from "utils/getYearFormat";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
type Props = {
  openActionPointDrawer: any;
  setOpenActionPointDrawer: any;
  handleCloseActionPoint: any;
};

const ActionPoint = ({
  openActionPointDrawer,
  setOpenActionPointDrawer,
  handleCloseActionPoint,
}: Props) => {
  const modalData = openActionPointDrawer?.data;

  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const showData = isOrgAdmin || isMR;

  const [agendaData, setAgendaData] = useState<any>({
    agenda: "",
    owner: [],
  });

  const [status, setStatus] = useState<boolean>(true);
  const [addNew, setAddNew] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({});
  const [referencesNew, setReferencesNew] = useState<any>([]);
  const [currentYear, setCurrentYear] = useState<any>();
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });

  const realmName = getAppUrl();

  const navigate = useNavigate();

  const orgId = sessionStorage.getItem("orgId");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  const { enqueueSnackbar } = useSnackbar();
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    getyear();
  }, []);

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  const handleDrawer = () => {
    handleCloseActionPoint();
  };

  const onStatusChange = (checked: boolean) => {
    setStatus(checked);
  };

  const handleAddNew = async () => {
    const keyAgendaValues =
      modalData?.value?.keyAgendaId &&
      modalData?.value?.keyAgendaId[formData?.keyagenda];

    if (showData) {
      const newPayload = {
        organizationId: orgId,
        agenda: keyAgendaValues?.agenda,
        actionPoint: formData?.actionpoints,
        decisionPoint: formData?.decisionpoints || "",
        description: formData?.description || "",
        dueDate: moment(formData?.date),
        owner: formData?.owner ? formData?.owner : keyAgendaValues?.owner,
        mrmId: modalData?.value?._id,
        updatedBy: userDetail && userDetail?.id,
        createdBy: userDetail && userDetail?.id,
        status: status,
        files: formData?.file || [],
        currentYear: currentYear,
      };

      if (formData?.date && formData?.actionpoints) {
        const res = await axios.post("/api/mrm/addActionPoint", newPayload);

        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(`Data Added successfully!`, {
            variant: "success",
          });
          setAgendaData({
            agenda: "",
            owner: [],
          });
          setAddNew(!addNew);
        } else {
          enqueueSnackbar(`Please add all the required field!`, {
            variant: "error",
          });
        }
      }
    }
  };

  const tabs = [
    {
      label: "Action Item",
      key: 1,
      children: (
        <AddActionPoint
          formData={formData}
          setFormData={setFormData}
          agendaData={agendaData}
          setAgendaData={setAgendaData}
          openActionPointDrawer={openActionPointDrawer}
          setOpenActionPointDrawer={setOpenActionPointDrawer}
          addNew={addNew}
        />
      ),
    },
    {
      label: "References",
      key: 2,
      children: <ReferencesTab drawer={drawer} mrmEditOptions={undefined} />,
    },
  ];

  const handleSubmitAndClose = async () => {
    const keyAgendaValues =
      modalData?.value?.keyAgendaId &&
      modalData?.value?.keyAgendaId[formData?.keyagenda];

    if (showData) {
      const newPayload = {
        organizationId: orgId,
        agenda: keyAgendaValues?.agenda,
        actionPoint: formData?.actionpoints,
        decisionPoint: formData?.decisionpoints || "",
        description: formData?.description || "",
        dueDate: moment(formData?.date),
        owner: formData?.owner ? formData?.owner : keyAgendaValues?.owner,
        mrmId: modalData?.value?._id,
        updatedBy: userDetail && userDetail?.id,
        createdBy: userDetail && userDetail?.id,
        status: status,
        files: formData?.file || [],
        currentYear: currentYear,
      };

      if (formData?.date && formData?.actionpoints) {
        const res = await axios.post("/api/mrm/addActionPoint", newPayload);

        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(`Data Added successfully!`, {
            variant: "success",
          });
          handleCloseActionPoint();
        }
      } else {
        enqueueSnackbar(`Please add all the required field!`, {
          variant: "error",
        });
      }
    }
  };

  return (
    <Drawer
      title={[
        <span
          key="title"
          style={isSmallScreen ? { fontSize: "13px" } : { fontSize: "16px" }}
        >
          {"Action Point"}
        </span>,
      ]}
      placement="right"
      open={openActionPointDrawer?.open}
      onClose={handleDrawer}
      className={classes.drawer}
      width={isSmallScreen ? "85%" : "45%"}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      extra={
        <div className={classes.header}>
          <Space>
            {/* <Button onClick={handleDrawer}>Cancel</Button> */}
            <Button
              type="primary"
              onClick={handleSubmitAndClose}
              className={classes.submitBtn}
            >
              Submit & Close
            </Button>
            <Button
              type="primary"
              onClick={handleAddNew}
              className={classes.submitBtn}
            >
              Submit & Add New
            </Button>

            <div className={classes.status}>
              <div className={classes.text}>Status : </div>
              <Switch
                checked={status}
                style={{ backgroundColor: status ? "#003566" : "" }}
                className={classes.switch}
                onChange={onStatusChange}
              />
            </div>
          </Space>
        </div>
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

export default ActionPoint;
