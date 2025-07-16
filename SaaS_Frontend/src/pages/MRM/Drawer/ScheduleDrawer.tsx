import { Tabs, Drawer, Space, Button } from "antd";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Tooltip,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import useStyles from "../commonDrawerStyles";
import { IconButton, useMediaQuery } from "@material-ui/core";
import axios from "../../../apis/axios.global";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { referencesData } from "recoil/atom";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
//notistack
import { useSnackbar } from "notistack";
import MeetingAgenda from "./MeetingAgenda";
import MeetingAgendaNotes from "./MeetingAgendaNotes";
import ReferencesTab from "./ReferencesTab";
import getYearFormat from "utils/getYearFormat";
import Select from "@material-ui/core/Select";
import { MdMailOutline, MdOutlineExpandMore } from "react-icons/md";
import getAppUrl from "utils/getAppUrl";
import { API_LINK } from "config";
import { isValid } from "utils/validateInput";
type Props = {
  openScheduleDrawer: boolean;
  setOpenScheduleDrawer: any;
  handleDrawer: any;
  expandDataValues: any;
  mrm: boolean;
  mode: any;
  scheduleData: any;
  unitSystemData: any;
  mrmEditOptions: any;
  status: any;
  setStatusMode: any;
  setValue?: any;
  setLoadSchedule?: any;
};

const ScheduleDrawer = ({
  openScheduleDrawer,
  setOpenScheduleDrawer,
  handleDrawer,
  expandDataValues,
  mode,
  mrm,
  scheduleData,
  unitSystemData,
  mrmEditOptions,
  status,
  setValue,
  setLoadSchedule,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const [formData, setFormData] = useState<any>(expandDataValues || {});
  // const [referencesNew, setReferencesNew] = useState<any>([]);

  const [statusRef, setStatusRef] = useState<any>();
  // const [refStatus, setRefStatus] = useState(false);
  // const showData = isOrgAdmin || isMR;
  const [upload, setUpload] = useState<boolean>(false);
  const navigate = useNavigate();
  const [items, setItems] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const realmName = getAppUrl();
  const [selectedOption, setSelectedOption] = useState<any>();
  const [licenseDetails, setLicenseDetails] = useState<any>({});
  // console.log("expandDataValues", expandDataValues);
  useEffect(() => {
    if (mrmEditOptions === "ReadOnly") {
      setStatusRef("edit");
    } else if (mrmEditOptions === "Edit") {
      setFormData({ ...formData, attendees: expandDataValues?.attendees });
      setStatusRef("edit");
    } else {
      setStatusRef("create");
    }
  }, [mrmEditOptions]);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const onMenuClick = (e: any) => {
    handleSubmit(e);
  };

  const [drawer, setDrawer] = useState<any>({
    mode: status,
    open: false,
    clearFields: true,
    toggle: false,
    data: { id: scheduleData?.value?._id },
  });

  const orgId = sessionStorage.getItem("orgId");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [currentYear, setCurrentYear] = useState<any>();
  const [refsData] = useRecoilState(referencesData);
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const [selectedItem, setSelectedItem] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [missingOwners, setMissingOwners] = useState([]);
  const tabs = [
    {
      label: "Meeting Info",
      key: 1,
      children: (
        <MeetingAgenda
          formData={formData}
          setFormData={setFormData}
          mode={mode}
          scheduleData={scheduleData}
          unitSystemData={unitSystemData}
          mrmEditOptions={mrmEditOptions}
          setUpload={setUpload}
          setValue={setValue}
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
          mode={mode}
          mrmEditOptions={mrmEditOptions}
        />
      ),
    },
    {
      label: "References",
      key: 3,
      children: (
        <ReferencesTab drawer={drawer} mrmEditOptions={mrmEditOptions} />
      ),
    },
    // {
    //   label: "Decision & Minutes",
    //   key: 4,
    //   children: (
    //     <DecisionPointsAndMinutes
    //       formData={formData}
    //       setFormData={setFormData}
    //     />
    //   ),
    // },
  ];

  useEffect(() => {
    getyear();
    const defaultButtonOptions = [
      "Save As Draft",
      "Submit",
      "Schedule and Inform",
    ];
    const newItems = defaultButtonOptions?.map((item: any, index: any) => ({
      key: (index + 1).toString(),
      label: item,
    }));
    setItems([...defaultButtonOptions]);
  }, []);

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  const handleMail = async (data: any) => {
    try {
      //console.log("data id", data);
      // const mail = await axios.post(`/api/mrm/sendAgendOwnerMail/${data}`);
      const mailToParticipants = await axios.post(
        `/api/mrm/sendParticipantMail/${data}`
      );
      // console.log("mailtoparticpants", mailToParticipants);
      if (mailToParticipants.status == 201) {
        enqueueSnackbar("Email sent successfuly", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("Error sending email", { variant: "error" });
    }
  };
  // console.log("current year", currentYear);
  const uploadData = async (files: any) => {
    let formDataFiles = new FormData();
    let oldData = [];
    let newData = [];

    for (let file of files) {
      if (file?.url) {
        oldData.push(file);
      } else {
        newData.push(file);
      }
    }
    newData.forEach((file: any) => {
      const fileToAdd = file.originFileObj || file;
      // console.log("fileToAdd content:", fileToAdd);
      formDataFiles.append("files", fileToAdd);
    });

    const id = "MRM";
    let res: any;
    let comdinedData;
    try {
      if (newData.length > 0) {
        res = await axios.post(
          `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${loggedInUser?.location?.locationName}`,
          formDataFiles,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              id: id,
            },
          }
        );
      }
      if (res?.data?.length > 0) {
        comdinedData = res?.data;
      }

      if (oldData.length > 0) {
        comdinedData = oldData;
      }

      if (oldData.length > 0) {
        comdinedData = oldData;
      }

      if (oldData?.length > 0 && res?.data?.length > 0) {
        comdinedData = [...res.data, ...oldData];
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Custom alert message for 404 error
        alert(
          "Your Organization has exceeded the licensed attachments - Please reach ProcessRidge to activate additional licenses. Schedule will be saved without attachment"
        );
      } else {
        console.error("Error uploading data:", error);
        alert("An error occurred while uploading files. Please try again.");
      }
      return null;
    }
    return comdinedData;
  };
  // console.log("formdata b4 submit", formData);
  const handleSubmit = async (option: string) => {
    // console.log("formdaata", formData);
    const attendees = formData?.attendees || [];

    const keyAgendaOwners =
      formData?.dataValue?.flatMap((item: any) => item?.owner) || [];

    const attendeeIds = attendees.map((attendee: any) => attendee.id);

    // Check if agenda owners are in attendees list or not
    const missing = keyAgendaOwners.filter((owner: any) => {
      // Check if owner's id exists in attendeeIds
      return !attendeeIds.includes(owner?.id);
    });
    // console.log("missing", selectedOption);
    if (missing?.length > 0) {
      //if missing open dialog prompt
      setMissingOwners(missing.map((item: any) => item.name));
      setOpenDialog(true);
      return;
    } else {
      handleActualSubmit(option);
    }
  };
  const getRealmLicenseCount = async () => {
    try {
      const res = await axios.get(
        `/api/license/getRealmLicenseDetails/${userDetail?.organizationId}`
      );
      if (res.data) {
        setLicenseDetails(res?.data);
      } else {
        setLicenseDetails({});
      }
    } catch (error) {}
  };
  // console.log("licensedetails", licenseDetails);
  const handleActualSubmit = async (option: string) => {
    // console.log("option", option);
    let uploadedData: any;
    let agendaValues: any = [];

    uploadedData =
      formData?.files?.length > 0 ? await uploadData(formData?.files) : [];

    let decisionValue =
      formData?.decisionPoints && formData?.decisionPoints?.length
        ? formData?.decisionPoints
        : [];

    if (formData?.dataValue && formData?.dataValue.length) {
      for (let i = 0; i < formData?.dataValue.length; i++) {
        let newValue = formData?.dataValue[i];

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
        period: formData?.period ? formData?.period : "N/A",
        meetingType: formData?.meetingType,
        meetingName: formData?.meetingTitle,
        // meetingdate:
        //   formData?.changedValues && formData?.changedValues?.date
        //     ? moment(formData?.changedValues?.date)
        //     : moment(formData?.date),
        keyAgendaId: formData?.dataValue,
        // attendees: formData?.attendees,
        // organizer: userDetail && userDetail?.id,
        description: formData?.meetingDescription,
        decision: decisionValue,
        notes: formData?.meetingMOM,
        updatedBy: userDetail && userDetail?.id,
        files: uploadedData,
        date: formData?.date || scheduleData?.value?.date,
        attendees: formData?.attendees,
        externalattendees: formData?.externalattendees,
        venue: formData?.venue,
        status: option,
        // createdBy: userDetail && userDetail?.id
      };

      // console.log("objective data in drawer", objectiveData);
      const isValidTitle = isValid(newPayload?.meetingName);
      if (!isValidTitle.isValid) {
        enqueueSnackbar(
          `Please enter valid title!!${isValidTitle.errorMessage} `,
          {
            variant: "error",
          }
        );
        return;
      }

      const isValidVenue = isValid(newPayload.venue);
      if (!isValidVenue.isValid) {
        enqueueSnackbar(
          `Please enter valid venue!!${isValidVenue.errorMessage}`,
          {
            variant: "error",
          }
        );
        return;
      }
      if (newPayload.unitId === undefined) {
        enqueueSnackbar("Please Select Schedule Unit", { variant: "error" });
      } else if (newPayload?.systemId?.length === 0) {
        enqueueSnackbar("Please Select System field", { variant: "error" });
      } else if (newPayload.meetingName === "") {
        enqueueSnackbar("Please Enter Schedule Title", { variant: "error" });
      } else if (newPayload.meetingType === undefined) {
        enqueueSnackbar("Please Select Meeting Type", { variant: "error" });
      } else if (newPayload.date === undefined) {
        enqueueSnackbar("Please Select Schedule Date", { variant: "error" });
      } else if (newPayload.period === undefined) {
        enqueueSnackbar("Please Select  Period", { variant: "error" });
      } else if (upload === false) {
        enqueueSnackbar("Please Click on Upload files to Submit", {
          variant: "error",
        });
      } else {
        try {
          const res = await axios.patch(
            `/api/mrm/${formData?._id}`,
            newPayload
          );
          if (res.status === 200 || res.status === 201) {
            try {
              let formattedReferences: any = [];
              if (refsData && refsData.length > 0) {
                formattedReferences = refsData.map((ref: any) => ({
                  refId: ref.refId,
                  organizationId: orgId,
                  type: ref.type,
                  name: ref.name,
                  comments: ref.comments,
                  createdBy: userDetail.firstName + " " + userDetail.lastName,
                  updatedBy: null,
                  link: ref.link,
                  refTo: res.data._id,
                }));
              }
              //console.log("refs befor");
              const refs = await axios.put("/api/refs/bulk-update", {
                refs: formattedReferences,
                id: formData?._id,
              });

              if (option === "Schedule and Inform") {
                handleMail(formData?._id);
                // localStorage.setItem("mrmId",formData._id)
                // const protocol = process.env.REACT_APP_API_URL?.split(":")[0]
                // const redirectUri = protocol + "://" + process.env.REACT_APP_REDIRECT_URL + "/calRedirect"
                // const msCalDtls = await axios.get(`/api/connected-apps/getConnectedAppByName?name=${process.env.REACT_APP_MS_CALENDAR}`)
                // const url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?"+
                //                   `scope=${msCalDtls.data.description}` +
                //                   "&response_type=code" +
                //                   "&response_mode=query" +
                //                   "&state=calendarTest" +
                //                   `&redirect_uri=${redirectUri}`+
                //                   `&client_id=${msCalDtls.data.clientId}`
                // window.location.href = url;
              }
              // setOpenScheduleDrawer(false);
              //console.log("refs", refs);
            } catch (error) {
              enqueueSnackbar("Error creating References", {
                variant: "error",
              });
            }
            setOpenScheduleDrawer(false);
            setSelectedOption(null);
            enqueueSnackbar(`Schedule Updated successfully!`, {
              variant: "success",
            });
            setLoadSchedule(true);
            setFormData({});

            // handleDrawer();
            handleClose();
          }
        } catch (error) {
          // enqueueSnackbar(`Error creating Schedule`, { variant: "error" });
        }
      }
    } else {
      const newPayload = {
        organizationId: orgId,
        momPlanYear: currentYear,
        unitId: formData?.unit,
        systemId: formData?.system,
        period: formData?.period ? formData?.period : "N/A",
        meetingName: formData?.meetingTitle,
        meetingType: formData?.meetingType,
        owners: formData?.owner,
        agendaowner: formData?.agendaowner,
        // meetingdate:
        //   formData?.changedValues && formData?.changedValues?.date
        //     ? moment(formData?.changedValues?.date)
        //     : moment(formData?.date),
        keyAgendaId: agendaValues,
        //  attendees: formData?.attendees,
        organizer: userDetail && userDetail?.id,
        description: formData?.meetingDescription,
        decision: decisionValue,
        notes: formData?.meetingMOM,
        updatedBy: userDetail && userDetail?.id,
        createdBy: userDetail && userDetail?.id,
        files: uploadedData,
        currentYear: currentYear,
        date: formData.date,
        attendees: formData?.attendees,
        externalattendees: formData?.externalattendees,
        venue: formData?.venue,
        status: option,
      };
      const isValidTitle = isValid(newPayload?.meetingName);
      if (!isValidTitle.isValid) {
        enqueueSnackbar(
          `Please enter valid title!!${isValidTitle.errorMessage} `,
          {
            variant: "error",
          }
        );
        return;
      }

      const isValidVenue = isValid(newPayload.venue);
      if (!isValidVenue.isValid) {
        enqueueSnackbar("Please enter valid venue!", {
          variant: "error",
        });
        return;
      }
      if (mrmEditOptions === "MrmPlan") {
        if (
          newPayload.systemId === undefined ||
          newPayload.systemId.length === 0
        ) {
          enqueueSnackbar("Please Select System field", { variant: "error" });
        } else if (
          newPayload.meetingName === undefined ||
          newPayload.meetingName === ""
        ) {
          enqueueSnackbar("Please Enter Schedule Title", { variant: "error" });
        } else if (newPayload.period === "N/A") {
          enqueueSnackbar("Please Select  Period", { variant: "error" });
        } else if (newPayload.date === undefined) {
          enqueueSnackbar("Please Select Meeting Date", { variant: "error" });
        } else if (upload === false) {
          enqueueSnackbar("Please click on Upload files to Submit", {
            variant: "error",
          });
        } else {
          try {
            const res = await axios.post("/api/mrm/schedule", newPayload);
            //console.log("res", res);
            if (res?.data?.status === 409) {
              enqueueSnackbar("Error creating Schedule, duplicate exists", {
                variant: "error",
              });
            } else {
              try {
                let formattedReferences: any = [];

                if (refsData && refsData.length > 0) {
                  formattedReferences = refsData.map((ref: any) => ({
                    refId: ref.refId,
                    organizationId: orgId,
                    type: ref.type,
                    name: ref.name,
                    comments: ref.comments,
                    createdBy: userDetail.firstName + " " + userDetail.lastName,
                    updatedBy: null,
                    link: ref.link,
                    refTo: res.data._id,
                  }));
                }
                const refs = await axios.post(
                  "/api/refs/bulk-insert",
                  formattedReferences
                );

                if (option === "Schedule and Inform") {
                  handleMail(res?.data?._id);
                  // setOpenScheduleDrawer(false);
                  // localStorage.setItem("mrmId",res?.data?._id)
                  // const protocol = process.env.REACT_APP_API_URL?.split(":")[0]
                  // const redirectUri = protocol + "://" + process.env.REACT_APP_REDIRECT_URL + "/calRedirect"
                  // const msCalDtls = await axios.get(`/api/connected-apps/getConnectedAppByName?name=${process.env.REACT_APP_MS_CALENDAR}`)
                  // const url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?"+
                  //                   `scope=${msCalDtls.data.description}` +
                  //                   "&response_type=code" +
                  //                   "&response_mode=query" +
                  //                   "&state=calendarTest" +
                  //                   `&redirect_uri=${redirectUri}`+
                  //                   `&client_id=${msCalDtls.data.clientId}`
                  // window.location.href = url;
                }
              } catch (error) {
                enqueueSnackbar("Error creating References", {
                  variant: "error",
                });
              }
              setSelectedOption(null);
              setOpenScheduleDrawer(false);
              enqueueSnackbar(`Schedule Added successfully!`, {
                variant: "success",
              });
              setLoadSchedule(true);
              setFormData({});

              // handleDrawer();
              handleClose();
            }
          } catch (error) {
            // console.log("inside catch");
            // enqueueSnackbar("Error creating Schedule", { variant: "error" });
          }
        }
      } else if (mrmEditOptions === "Direct") {
        if (newPayload.unitId === undefined) {
          enqueueSnackbar("Please Select Schedule Unit", { variant: "error" });
        } else if (newPayload.systemId === undefined) {
          enqueueSnackbar("Please Select System field", { variant: "error" });
        } else if (newPayload.meetingName === undefined) {
          enqueueSnackbar("Please Enter Schedule Title", { variant: "error" });
        } else if (newPayload.meetingType === undefined) {
          enqueueSnackbar("Please Select Meeting Type", { variant: "error" });
        } else if (newPayload.date === undefined) {
          enqueueSnackbar("Please Select Schedule Date", { variant: "error" });
        } else if (upload === false) {
          enqueueSnackbar("Please click on Upload Files to Submit", {
            variant: "error",
          });
        } else {
          try {
            const res = await axios.post("/api/mrm/schedule", newPayload);
            if (res?.data?.status === 409) {
              enqueueSnackbar("Error creating Schedule, duplicate exists", {
                variant: "error",
              });
            } else {
              try {
                let formattedReferences: any = [];
                if (refsData && refsData.length > 0) {
                  formattedReferences = refsData.map((ref: any) => ({
                    refId: ref.refId,
                    organizationId: orgId,
                    type: ref.type,
                    name: ref.name,
                    comments: ref.comments,
                    createdBy: userDetail.firstName + " " + userDetail.lastName,
                    updatedBy: null,
                    link: ref.link,
                    refTo: res.data._id,
                  }));
                }
                const refs = await axios.post(
                  "/api/refs/bulk-insert",
                  formattedReferences
                );

                if (option === "Schedule and Inform") {
                  handleMail(res?.data?._id);
                  // localStorage.setItem("mrmId",res?.data?._id)
                  // const protocol = process.env.REACT_APP_API_URL?.split(":")[0]
                  // const redirectUri = protocol + "://" + process.env.REACT_APP_REDIRECT_URL + "/calRedirect"
                  // const msCalDtls = await axios.get(`/api/connected-apps/getConnectedAppByName?name=${process.env.REACT_APP_MS_CALENDAR}`)
                  // const url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?"+
                  //                   `scope=${msCalDtls.data.description}` +
                  //                   "&response_type=code" +
                  //                   "&response_mode=query" +
                  //                   "&state=calendarTest" +
                  //                   `&redirect_uri=${redirectUri}`+
                  //                   `&client_id=${msCalDtls.data.clientId}`
                  // window.location.href = url;
                }
              } catch (error) {
                enqueueSnackbar("Error creating References", {
                  variant: "error",
                });
              }
              enqueueSnackbar(`Schedule Added successfully!`, {
                variant: "success",
              });

              setFormData({});
              setOpenScheduleDrawer(false);
              setLoadSchedule(true);
              setSelectedOption(null);
              // handleDrawer();
              handleClose();
            }
          } catch (error) {
            // enqueueSnackbar("Error creating Schedule", { variant: "error" });
          }
        }
      }
    }
  };
  const handleDialogConfirm = (confirm: boolean, option: any) => {
    if (confirm) {
      handleActualSubmit(selectedOption);
    } else {
      setOpenDialog(false);
    }
  };
  const DialogPrompt = ({ open, message, onClose, onConfirm }: any) => {
    return (
      <Dialog open={open} onClose={() => onClose(false)}>
        <DialogTitle>Reminder</DialogTitle>
        <DialogContent>
          <p>{message}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onConfirm(false)} color="primary">
            No
          </Button>
          <Button onClick={() => onConfirm(true)} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("MeetingInfo");
  // console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

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
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      maskClosable={false}
      width={isSmallScreen ? "85%" : "60%"}
      extra={
        <>
          {mrmEditOptions === "ReadOnly" ? (
            <></>
          ) : (
            <>
              <Space>
                {/* <Button
                  onClick={() => {
                    handleDrawer();
                    setFormData({});
                  }}
                  className={classes.cancelBtn}
                >
                  Cancel
                </Button> */}
                <Button
                  onClick={handleClick}
                  style={{ display: "flex", alignItems: "center" }}
                  disabled={items?.length === 0}
                >
                  <span style={{ fontWeight: "bold" }}>
                    {selectedItem || "Actions"}
                  </span>
                  <MdOutlineExpandMore
                    style={{
                      fill: `${items?.length === 0 ? "gray" : "#0e497a"}`,
                    }}
                  />
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {items &&
                    items.length > 0 &&
                    items?.map((item: any, index: any) => (
                      <MenuItem
                        key={index + 1}
                        onClick={() => {
                          onMenuClick(item);
                          setSelectedOption(item);
                        }}
                      >
                        {item}
                      </MenuItem>
                    ))}
                </Menu>
              </Space>
            </>
          )}
          {/* <Tooltip title="Expand Form">
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
          </Tooltip> */}
        </>
      }
    >
      <div className={classes.tabsWrapper} style={{ position: "relative" }}>
        {matches ? (
          <Tabs
            type="card"
            items={tabs as any}
            animated={{ inkBar: true, tabPane: true }}
            // tabBarStyle={{backgroundColor : "green"}}
          />
        ) : (
          <div>
            <FormControl
              variant="outlined"
              size="small"
              fullWidth
              //  className={classes.formControl}
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <InputLabel>Menu List</InputLabel>
              <Select
                label="Menu List"
                value={selectedValue}
                onChange={handleDataChange}
              >
                <MenuItem value={"MeetingInfo"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "MeetingInfo" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color:
                        selectedValue === "MeetingInfo" ? "white" : "black",
                    }}
                  >
                    {" "}
                    Meeting Info
                  </div>
                </MenuItem>
                <MenuItem value={"Agenda"}>
                  {" "}
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "Agenda" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "Agenda" ? "white" : "black",
                    }}
                  >
                    Agenda
                  </div>
                </MenuItem>
                <MenuItem value={"Reference"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "Reference" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "Reference" ? "white" : "black",
                    }}
                  >
                    References
                  </div>
                </MenuItem>
              </Select>
            </FormControl>
          </div>
        )}

        {matches ? (
          ""
        ) : (
          <div>
            {selectedValue === "MeetingInfo" ? (
              <div style={{ marginTop: "15px" }}>
                <MeetingAgenda
                  formData={formData}
                  setFormData={setFormData}
                  mode={mode}
                  scheduleData={scheduleData}
                  unitSystemData={unitSystemData}
                  mrmEditOptions={mrmEditOptions}
                  setUpload={setUpload}
                  setValue={setValue}
                />
              </div>
            ) : (
              ""
            )}

            {selectedValue === "Agenda" ? (
              <div>
                <MeetingAgendaNotes
                  formData={formData}
                  setFormData={setFormData}
                  scheduleData={scheduleData}
                  mode={mode}
                  mrmEditOptions={mrmEditOptions}
                />
              </div>
            ) : (
              ""
            )}

            {selectedValue === "Reference" ? (
              <div style={{ marginTop: "15px" }}>
                <ReferencesTab
                  drawer={drawer}
                  mrmEditOptions={mrmEditOptions}
                />
              </div>
            ) : (
              ""
            )}
          </div>
        )}

        {tabs.length > 2 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              fontSize: "10px",
              color: "grey",
            }}
          >
            {mrmEditOptions === "Edit" && (
              <Tooltip title="Send Mail" placement="bottom">
                <IconButton onClick={() => handleMail(formData?._id)}>
                  <MdMailOutline style={{ height: "30px" }} />
                </IconButton>
              </Tooltip>
            )}
          </div>
        )}
      </div>
      <DialogPrompt
        open={openDialog}
        message={
          <>
            <p>
              The following agenda owners are missing from the participants
              list:
            </p>
            <ul>
              {missingOwners.map((owner, index) => (
                <li key={index}>{owner}</li>
              ))}
            </ul>
            <p>Do you want to proceed without adding them?</p>
          </>
        }
        onClose={() => setOpenDialog(false)}
        onConfirm={handleDialogConfirm}
      />
    </Drawer>
  );
};

export default ScheduleDrawer;