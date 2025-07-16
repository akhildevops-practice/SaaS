import React, { useEffect, useState } from "react";
import {
  IconButton,
  makeStyles,
  MenuItem,
  Menu,
  useMediaQuery,
  FormControl,
  Select,
  InputLabel,
} from "@material-ui/core";
import { Tabs, Space, Button, Drawer, Modal } from "antd";
import useStyles from "../commonDrawerStyles";
import { TableCell, TableRow } from "@material-ui/core";
import useStylesMrm from "./MrmAddMeetingsStyles";
import MeetingEditingTab from "./MeetingEditingTab";
import MeetingEditingTabTwo from "./MeetingEditingTabTwo";
import { updateMeeting } from "apis/mrmmeetingsApi";

import { useSnackbar } from "notistack";
import MeetingCreatingTabThree from "./MeetingCreatingTabThree";
import { API_LINK } from "config";
import { useRecoilState, useResetRecoilState } from "recoil";
import {
  expandMeetingAgendaData,
  expandMeetingEditData,
} from "recoil/atom";
import  { MdInfo, MdOutlineExpandMore } from "react-icons/md";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import { isValid } from "utils/validateInput";

type Props = {
  open: boolean;
  onClose: () => void;
  dataSourceFilter: any;
  editDataMeeting: any;
  ownerSourceFilter: any;
  valueById: any;
  year: any;
  readMode: any;
  meeting: any;
  setLoadMeeting: any;
  handleDrawer?: any;
  setOpenScheduleDrawer?: any;
  setMode?: any;
  setStatusMode?: any;
  route?: any;
};
const drawerWidth = 600;
const nestedWidth = 600;
const nestedHeight = 200;
const useStylesClass = makeStyles({
  drawerPaper: {
    width: drawerWidth,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      boxSizing: "border-box",
    },
  },
  submitBtn: {
    backgroundColor: "#003566 !important",
    height: "36px",
    color: "#fff",
  },
  drawerPaperSub: {
    width: nestedWidth,
    height: nestedHeight,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: nestedWidth,
      height: nestedHeight,
      boxSizing: "border-box",
    },
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  tableContainer: {
    marginTop: "1%",
    maxHeight: "calc(60vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "hidden",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      // color: ({ iconColor }) => iconColor,
    },
    "& span.ant-tag": {
      display: "flex",
      width: "89px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      borderBottom: "black",
      padding: "4px 8px !important",
    },
    // '& .ant-table-wrapper .ant-table-container': {
    //     maxHeight: '420px', // Adjust the max-height value as needed
    //     overflowY: 'auto',
    //     overflowX: 'hidden',
    // },
    "& .ant-table-body": {
      // maxHeight: '150px', // Adjust the max-height value as needed
      // overflowY: 'auto',
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& tr.ant-table-row": {
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
  },
});

function MrmAddMeetings({
  open,
  onClose,
  dataSourceFilter,
  editDataMeeting,
  ownerSourceFilter,
  valueById,
  year,
  readMode,
  meeting,
  setLoadMeeting,
  handleDrawer,
  setOpenScheduleDrawer,
  setMode,
  setStatusMode,
  route,
}: Props) {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles();
  const mrmStyles = useStylesMrm();
  const [formData, setFormData] = useRecoilState(expandMeetingEditData);
  const [addAgendaValues, setAddAgendaValues] = useRecoilState(
    expandMeetingAgendaData
  );
  // const [addAgendaValues, setAddAgendaValues] = useState<any[]>([]);
  const resetExpandData = useResetRecoilState(expandMeetingEditData);
  const resetExpanAgendaData = useResetRecoilState(expandMeetingAgendaData);
  const [data, setData] = useState<any>();
  const [index, setIndex] = useState<any>();
  const [nestedOpen, setNestedOpen] = useState(false);
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [upload, setUpload] = useState(false);
  const [items, setItems] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");
  const realmName = getAppUrl();
  const [schedule, setSchedule] = useState({});
  const [imgUrl, setImgUrl] = useState<any>("");
  const dateString = editDataMeeting && editDataMeeting?.meetingdate;
  const finaldateTime = dateString?.substring(
    0,
    dateString && dateString?.length - 5
  );
  // console.log("edidatameeting ", editDataMeeting);
  const { enqueueSnackbar } = useSnackbar();
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const onMenuClick = (e: any) => {
    createMeetingsMrm(e);
  };

  useEffect(() => {
    setAddAgendaValues(dataSourceFilter?.agenda);
    if (!!dataSourceFilter.meetingSchedule) {
      getScheduleData();
    }
    if (!!editDataMeeting.createdBy) {
      getAvatarImage(editDataMeeting?.createdBy);
    }
  }, [dataSourceFilter]);
  useEffect(() => {
    const defaultButtonOptions = ["Save As Draft", "Submit"];
    const newItems = defaultButtonOptions?.map((item: any, index: any) => ({
      key: (index + 1).toString(),
      label: item,
    }));
    setItems([...defaultButtonOptions]);
  }, [anchorEl]);
  const getScheduleData = async () => {
    try {
      let id;
      if (!!dataSourceFilter) {
        const result = await axios.get(
          API_LINK +
            `/api/mrm/getScheduleById/${dataSourceFilter?.meetingSchedule?._id}`
        );
        // console.log("scheduledata", result?.data);
        if (result.status === 200) {
          setSchedule(result?.data);
        }
      }
    } catch (error) {
      console.log("schedule id not found");
    }
  };
  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };
  const getAvatarImage = async (userInfo: any) => {
    let imageName: any;
    // getUserInfo().then((response: any) => {
    //   imageName = response?.data?.avatar;
    //   setImgUrl(imageName);
    // });

    imageName = userInfo?.avatar || "";
    const url =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? `${API_LINK}/${userInfo?.avatar}`
        : await viewObjectStorageDoc(userInfo?.avatar);

    setImgUrl(url);
    // setImgUrl(imageName);
  };

  const uploadAuditReportAttachments = async (files: any) => {
    const locationName = userInfo?.location?.locationName;
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
          `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${locationName}`,
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

      if (oldData?.length > 0 && res?.data?.length > 0) {
        comdinedData = [...res.data, ...oldData];
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Custom alert message for 404 error
        alert(
          "Your Organization has exceeded the licensed attachments - Please reach ProcessRidge to activate additional licenses. Meeting will be saved without attachment"
        );
      } else {
        console.error("Error uploading data:", error);
        alert("An error occurred while uploading files. Please try again.");
      }
      return null;
    }
    return comdinedData;
  };
  // const OBJECTIVE_NAME_REGEX = /^[a-zA-Z0-9,\/\-\.\$\€\£\s\(\) ]+$/;
  // const isValid = (
  //   value: string | undefined | null,
  //   regex: RegExp
  // ): boolean => {
  //   if (!value || typeof value !== "string" || value.trim().length === 0) {
  //     return false; // Empty or invalid input
  //   }

  //   const sanitizedValue = value.trim();

  //   // Define regex pattern for allowed characters
  //   const TITLE_REGEX =
  //     /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,\?&%!#@€£`'"\~]+$/;

  //   // Check for disallowed characters
  //   const DISALLOWED_CHARS = /[<>]/;

  //   // Check for more than two consecutive special characters
  //   const MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS =
  //     /[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]{3,}/;

  //   // Check if the title starts with a special character
  //   const STARTS_WITH_SPECIAL_CHAR =
  //     /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]/;

  //   if (DISALLOWED_CHARS.test(sanitizedValue)) {
  //     return false; // Invalid characters found
  //   }

  //   if (MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS.test(sanitizedValue)) {
  //     return false; // Too many consecutive special characters
  //   }

  //   if (STARTS_WITH_SPECIAL_CHAR.test(sanitizedValue)) {
  //     return false; // Starts with a special character
  //   }

  //   return TITLE_REGEX.test(sanitizedValue); // Check against allowed characters
  // };
  // console.log("formdata in meeting edit", formData);
  const createMeetingsMrm = async (option: string) => {
    let uploadAttachement =
      formData?.attachments?.length > 0
        ? await uploadAuditReportAttachments(formData?.attachments)
        : [];
    // console.log("edit upload", upload);
    const updateForm = {
      ...formData,
      agenda: addAgendaValues,
      status: option,
      attachments: uploadAttachement,
    };
    const isValidTitle = isValid(formData?.meetingName);
    if (!isValidTitle.isValid) {
      enqueueSnackbar(`Please enter valid title!${isValidTitle.errorMessage}`, {
        variant: "error",
      });
      return;
    }
    if (updateForm?.agenda?.length === 0) {
      enqueueSnackbar(`Please add at least one agenda and decision `, {
        variant: "error",
      });
      return;
    }
    const isValidVenue = isValid(formData?.venue);
    if (!isValidVenue.isValid) {
      enqueueSnackbar("Please enter valid venue", {
        variant: "error",
      });
      return;
    }

    if (
      formData?.meetingName &&
      formData?.meetingdate &&
      formData?.participants.length > 0
    ) {
      updateMeeting(editDataMeeting._id, updateForm).then((response: any) => {
        // console.log("response====>update api", response);
        resetExpandData();
        if (response?.data?.status === 409) {
          enqueueSnackbar(
            "MoM already exists for the schedule with the same date"
          );
        } else {
          if (option === "Submit") {
            enqueueSnackbar("MoM created and Mail sent successfully", {
              variant: "success",
            });
          } else {
            enqueueSnackbar(`MoM created successfully!`, {
              variant: "success",
            });
          }
          onClose();
          setLoadMeeting(true);
          handleClose();
        }
      });
    } else if (
      formData.meetingdate === "" ||
      formData.meetingdate === undefined
    ) {
      enqueueSnackbar(`Please enter meeting date!`, { variant: "error" });
    } else if (
      formData.meetingName === "" ||
      formData.meetingName === undefined
    ) {
      enqueueSnackbar(`Please enter meeting title!`, { variant: "error" });
    } else if (formData.venue === "" || formData.venue === undefined) {
      enqueueSnackbar(`Please enter venue!`, { variant: "error" });
    } else if (
      formData.participants.length === 0 ||
      formData.participants === undefined
    ) {
      enqueueSnackbar(`Please enter participants!`, { variant: "error" });
    } else if (
      formData.minutesofMeeting === "" ||
      formData.minutesofMeeting === undefined
    ) {
      enqueueSnackbar(`Please enter minutes of meeting!`, { variant: "error" });
    }
  };

  const tabs = [
    {
      label: "Meeting",
      key: 1,
      children: (
        <MeetingEditingTab
          formData={formData}
          setFormData={setFormData}
          data={dataSourceFilter}
          index={index}
          editDataMeeting={editDataMeeting}
          readMode={readMode}
          setUpload={setUpload}
        />
      ),
    },
    {
      label: "Decision",
      key: 2,
      children: (
        <MeetingEditingTabTwo
          formData={formData}
          setFormData={setFormData}
          data={dataSourceFilter}
          ownerSourceFilter={ownerSourceFilter}
          valueById={valueById}
          readMode={readMode}
        />
      ),
    },
    {
      label: "Pending Actions",
      key: 3,
      children: (
        <MeetingCreatingTabThree
          data={dataSourceFilter}
          valueById={valueById}
          ownerSourceFilter={ownerSourceFilter}
          option={"Edit"}
          open={open}
        />
      ),
    },
  ];
  // console.log("edidatameeting", editDataMeeting, dataSourceFilter);
  const unitName =
    dataSourceFilter &&
    dataSourceFilter?.allData?.systemData?.map((item: any) => item.name);
  // const avatarUrl = editDataMeeting.createdBy?.avatar
  //   ? `${API_LINK}/${userInfo.avatar}`
  //   : "https://cdn-icons-png.flaticon.com/512/219/219986.png";

  const info = () => {
    Modal.info({
      title: "Meeting Information",
      mask: false,
      style: {
        top: 0,
        right: -250,
      },
      content: (
        <div>
          <TableRow style={{ padding: "0px" }}>
            <span>Unit :</span>
            <span>{dataSourceFilter?.locationId?.locationName}</span>
          </TableRow>
          <TableRow style={{ padding: "0px" }}>
            <span>Meeting Schedule Title : </span>
            <span>
              {" "}
              {editDataMeeting?.meetingSchedule?.meetingName
                ? editDataMeeting?.meetingSchedule?.meetingName
                : dataSourceFilter?.meetingSchedule?.meetingName}
            </span>
          </TableRow>
          <TableRow style={{ padding: "0px" }}>
            <div>Meeting Scheduled Dates :</div>

            {(
              editDataMeeting?.meetingSchedule?.date ||
              dataSourceFilter?.meetingSchedule?.date
            )?.map((dateTimeObj: any, index: any) => (
              <div key={index}>
                <span>{dateTimeObj.date}</span> {/* Displaying the date */}
                <span>{dateTimeObj.from}</span> {/* Displaying the time from */}
                <span> - </span> {/* Separator between time from and time to */}
                <span>{dateTimeObj.to}</span> {/* Displaying the time to */}
              </div>
            ))}
          </TableRow>
          <TableRow style={{ padding: "0px" }}>
            <span>Meeting Type :</span>
            <span>{dataSourceFilter?.meetingType?.name}</span>
          </TableRow>
        </div>
      ),
      onOk() {
        ("");
      },
    });
  };

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Meeting");
  // console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  return (
    <Drawer
      title={
        matches ? (readMode === true ? "Minutes Of Meeting" : "Edit MoM") : ""
      }
      open={open}
      onClose={() => {
        onClose();
        resetExpandData();
        resetExpanAgendaData();
      }}
      placement="right"
      width={matches ? "60%" : "90%"}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      headerStyle={{ backgroundColor: "#E8F3F9", color: "black" }}
      extra={
        <TableCell>
          <Space>
            <div style={{ display: "flex-end" }}>
              {/* <Button
                type="link"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "black",
                  textDecoration: "underline",
                  fontFamily: "bold",
                  fontSize: "14px",
                  padding: 0,
                }}
                onClick={() => {
                  setMode("Edit");
                  setStatusMode("edit");
                  // handleDrawer(schedule, "ReadOnly");
                  let url;
                  if (
                    process.env.REACT_APP_REDIRECT_URL?.includes(
                      "adityabirla.com"
                    )
                  ) {
                    url = `${process.env.REACT_APP_REDIRECT_URL}/mrm/scheduleView`;
                  } else {
                    url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/mrm/scheduleView`;
                  }
                  const stateData = {
                    data: schedule,
                    mode: "ReadOnly",
                    openScheduleDrawer: "true",

                    drawer: {
                      mode: "Edit",
                      data: schedule,
                      open: true,
                      toggele: true,
                    },
                  };

                  sessionStorage.setItem(
                    "newTabState",
                    JSON.stringify(stateData)
                  );
                  setTimeout(() => {
                    window.open("/mrm/scheduleView", "_blank");
                  }, 1000); // Adjust the delay as needed
                }}
              >
                Click to view Schedule
              </Button> */}
              <a
                href="#"
                style={{
                  textDecoration: "underline",
                  color: "black",
                  fontFamily: "bold",
                  fontSize: "14px",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  handleDrawer(schedule, "ReadOnly");
                }}
              >
                Click to view Schedule
              </a>
            </div>
            <IconButton onClick={info}>
              <MdInfo />
            </IconButton>
            {readMode === false ? (
              <>
                <Button
                  className={classes.cancelBtn}
                  onClick={() => {
                    onClose();
                    resetExpandData();
                    resetExpanAgendaData();
                  }}
                >
                  Cancel
                </Button>
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
                        onClick={() => onMenuClick(item)}
                      >
                        {item}
                      </MenuItem>
                    ))}
                </Menu>
              </>
            ) : (
              <></>
            )}
            {/* <Tooltip title="Expand Form">
              <Button
               
                onClick={() => {
                  navigate("/mrm/mrmmeetingdetailseditdoc", {
                    state: {
                      state: {
                        data: dataSourceFilter,
                        valueById: valueById,
                        year: year,
                        editDataMeeting: editDataMeeting,
                        ownerSourceFilter: ownerSourceFilter,
                        readMode: readMode,
                        mrm: meeting,
                      },
                    },
                  });
                  setLoadMeeting(true);
                }}
              >
                <ExpandIcon style={{ height: "23px" }} />
               
              </Button>
            </Tooltip> */}
          </Space>
        </TableCell>
      }
    >
      {/* <div style={{ width: "50%" }}> */}
      {/* <div style={{ display: "grid", gap: "5px", width: "100%" }}> */}
      <div
        className={classes.tabsWrapper}
        style={{
          position: "relative",
        }}
      >
        {matches ? (
          <Tabs
            type="card"
            items={tabs as any}
            animated={{ inkBar: true, tabPane: true }}
            // tabBarStyle={{backgroundColor : "green"}}
          />
        ) : (
          <div style={{ width: "100%" }}>
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
                <MenuItem value={"Meeting"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "Meeting" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "Meeting" ? "white" : "black",
                    }}
                  >
                    {" "}
                    Meeting
                  </div>
                </MenuItem>
                <MenuItem value={"Decision"}>
                  {" "}
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "Decision" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "Decision" ? "white" : "black",
                    }}
                  >
                    Decision
                  </div>
                </MenuItem>
                <MenuItem value={"Actions"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "Actions" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "Actions" ? "white" : "black",
                    }}
                  >
                    Pending Actions
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
            {selectedValue === "Meeting" ? (
              <div style={{ marginTop: "15px" }}>
                <MeetingEditingTab
                  formData={formData}
                  setFormData={setFormData}
                  data={dataSourceFilter}
                  index={index}
                  editDataMeeting={editDataMeeting}
                  readMode={readMode}
                  setUpload={setUpload}
                />
              </div>
            ) : (
              ""
            )}

            {selectedValue === "Decision" ? (
              <div style={{ marginTop: "15px" }}>
                <MeetingEditingTabTwo
                  formData={formData}
                  setFormData={setFormData}
                  data={dataSourceFilter}
                  ownerSourceFilter={ownerSourceFilter}
                  valueById={valueById}
                  readMode={readMode}
                />
              </div>
            ) : (
              ""
            )}

            {selectedValue === "Actions" ? (
              <div>
                <MeetingCreatingTabThree
                  data={dataSourceFilter}
                  valueById={valueById}
                  ownerSourceFilter={ownerSourceFilter}
                  option={"Edit"}
                  open={open}
                />
              </div>
            ) : (
              ""
            )}
          </div>
        )}

        {matches ? (
          <div style={{ position: "absolute", top: "2px", right: "10px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                height: "40px",
                width: "150px",
                gap: "8px",
              }}
            >
              <div style={{ marginTop: "4px" }}>
                <img
                  src={imgUrl}
                  alt="hello"
                  width="35px"
                  height="35px"
                  style={{ borderRadius: "20px" }}
                />
              </div>
              <div style={{ fontSize: "12px" }}>
                <p style={{ margin: "0" }}>
                  {editDataMeeting?.createdBy?.username}
                </p>
                <p style={{ margin: "0" }}> Meeting Owner</p>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
      {/* </div> */}
      {/* </div> */}
    </Drawer>
  );
}

MrmAddMeetings.propTypes = {};

export default MrmAddMeetings;