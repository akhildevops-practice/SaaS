import { useEffect, useState } from "react";
import { IconButton, makeStyles, Menu, MenuItem } from "@material-ui/core";

import { Tabs, Space, Button, Modal, Drawer } from "antd";
import useStyles from "../commonDrawerStyles";
import { TableCell, TableRow } from "@material-ui/core";
import useStylesMrm from "./MrmAddMeetingsStyles";

import MeetingCreatingTab from "./MeetingCreatingTab";
import MeetingCreatingTabTwo from "./MeetingCreatingTabTwo";
import { createMeeting } from "apis/mrmmeetingsApi";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

import MeetingCreatingTabThree from "./MeetingCreatingTabThree";

import CloseIconImageSvg from "assets/documentControl/Close.svg";
import getAppUrl from "utils/getAppUrl";
import { API_LINK } from "config";
import { MdOutlineExpandMore, MdInfo } from "react-icons/md";
import { expandCreateMeeting, expandMeetingData } from "recoil/atom";
import { useRecoilState, useResetRecoilState } from "recoil";

import axios from "apis/axios.global";
import { isValid } from "utils/validateInput";

type Props = {
  open: boolean;
  onClose: () => void;
  dataSourceFilter: any;
  valueById: any;
  year: any;
  meeting: any;
  setDrawerOpen: any;
  setLoadMeeting: any;
  openScheduleDrawer: boolean;
  setOpenScheduleDrawer: any;
  handleDrawer: any;
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
  valueById,
  year,
  meeting,
  setDrawerOpen,
  setLoadMeeting,
  openScheduleDrawer,
  setOpenScheduleDrawer,
  handleDrawer,
}: Props) {
  const classes = useStyles();
  const [licenseDetails, setLicenseDetails] = useState<any>({});
  const mrmStyles = useStylesMrm();
  const [formData, setFormData] = useRecoilState(expandMeetingData);
  const [dataForm, setDataForm] = useRecoilState(expandCreateMeeting);
  const resetExpandValues = useResetRecoilState(expandMeetingData);

  const [index, setIndex] = useState<any>();

  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  // const imgUrl = getAppUrl();
  const [upload, setUpload] = useState(false);
  const [items, setItems] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");
  const realmName = getAppUrl();
  const [imgUrl, setImgUrl] = useState<any>();
  // const [addAgendaValues, setAddAgendaValues] = useRecoilState(
  //   expandMeetingAgendaData
  // );
  const resetExpandData = useResetRecoilState(expandMeetingData);

  // const resetExpanAgendaData = useResetRecoilState(expandMeetingAgendaData);
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
    getRealmLicenseCount();
    const defaultButtonOptions = ["Save As Draft", "Submit"];
    const newItems = defaultButtonOptions?.map((item: any, index: any) => ({
      key: (index + 1).toString(),
      label: item,
    }));
    setItems([...defaultButtonOptions]);

    if (!!dataSourceFilter) {
      let dateStr =
        !!dataSourceFilter && dataSourceFilter?.allData?.value?.date[0].date;
      let timeStr =
        !!dataSourceFilter && dataSourceFilter?.allData?.value?.date[0].from;

      // Validate dateStr and timeStr before proceeding
      if (dateStr && !isNaN(new Date(dateStr).getTime())) {
        let [hours, minutes] = !!timeStr
          ? timeStr?.split(":")?.map(Number)
          : [0, 0];
        let date = new Date(dateStr);

        // Set time if valid timeStr exists, otherwise default to midnight
        date?.setHours(hours);
        date?.setMinutes(minutes);

        let timestamp = date ? date?.toISOString() : new Date().toISOString();

        // Set form data with the valid timestamp
        setFormData({
          ...formData,
          period: dataSourceFilter?.allData?.value?.period,
          createdBy: userInfo?.id,
          organizationId: dataSourceFilter?.allData?.value?.organizationId,
          meetingSchedule: valueById,
          locationId: dataSourceFilter?.allData?.value?.unitId,
          meetingName: dataSourceFilter?.allData?.value?.meetingName,
          venue: dataSourceFilter?.allData?.value?.venue,
          participants: dataSourceFilter?.allData?.value?.attendees,

          meetingdate: formatMeetingDate(timestamp),
          meetingType: dataSourceFilter?.allData?.value?.meetingType,
        });
      } else {
        console.error("Invalid date or time value", { dateStr, timeStr });
        // Handle the case where the date or time is invalid
        setFormData({
          ...formData,
          period: dataSourceFilter?.allData?.value?.period,
          createdBy: userInfo?.id,
          organizationId: dataSourceFilter?.allData?.value?.organizationId,
          meetingSchedule: valueById,
          locationId: dataSourceFilter?.allData?.value?.unitId,
          meetingName: dataSourceFilter?.allData?.value?.meetingName,
          venue: dataSourceFilter?.allData?.value?.venue,
          participants: dataSourceFilter?.allData?.value?.attendees,
          meetingType: dataSourceFilter?.allData?.value?.meetingType,
          meetingdate: new Date().toISOString(), // Fallback to current date if invalid
        });
      }
    }
  }, [dataSourceFilter]);

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  // console.log("formData in create meeting", formData);
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
  // console.log("meeting name", formData.meetingName);
  const formatMeetingDate = (meetingDate: any) => {
    const date = new Date(meetingDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading 0 if needed
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const getRealmLicenseCount = async () => {
    try {
      const res = await axios.get(
        `/api/license/getRealmLicenseDetails/${userInfo?.organizationId}`
      );
      if (res.data) {
        setLicenseDetails(res?.data);
      } else {
        setLicenseDetails({});
      }
    } catch (error) {}
  };
  const createMeetingsMrm = async (option: string) => {
    let uploadAttachement =
      formData?.attachments?.length > 0
        ? await uploadAuditReportAttachments(formData?.attachments)
        : [];

    if (formData.meetingName === "" || formData.meetingName === undefined) {
      setFormData({
        ...formData,
        meetingName: dataSourceFilter?.allData?.value?.meetingName,
      });
      const isValidTitle = isValid(
        dataSourceFilter?.allData?.value?.meetingName
      );
      if (!isValidTitle.isValid === false) {
        enqueueSnackbar(
          `Please enter valid title!!${isValidTitle.errorMessage}`,
          {
            variant: "error",
          }
        );
        return;
      }
    } else if (formData.meetingName !== "" || formData.meetingName) {
      // console.log("inside else", formData.meetingName);
      const isValidTitle = isValid(formData?.meetingName);
      if (!isValidTitle.isValid) {
        enqueueSnackbar(
          `Please enter valid title!!${isValidTitle.errorMessage}`,
          {
            variant: "error",
          }
        );
        return;
      }
    }
    const isValidVenue = isValid(formData?.venue);
    if (!isValidVenue.isValid) {
      enqueueSnackbar(
        `Please enter valid venue!!${isValidVenue.errorMessage} `,
        {
          variant: "error",
        }
      );
      return;
    }
    if (formData?.agenda?.length === 0) {
      enqueueSnackbar(`Please add at least one agenda and decision `, {
        variant: "error",
      });
      return;
    }

    // console.log("formdata in submit", formData);
    if (
      formData.meetingName &&
      formData.meetingdate &&
      formData.venue &&
      formData.participants.length > 0 &&
      formData.minutesofMeeting &&
      formData?.agenda?.length > 0
    ) {
      const payload = {
        ...formData,
        period: dataSourceFilter?.allData?.value?.period,
        createdBy: userInfo?.id,
        organizationId: dataSourceFilter?.allData?.value?.organizationId,
        meetingSchedule: valueById,
        locationId: dataSourceFilter?.allData?.value?.unitId,
        agenda: formData?.agenda,
        year: year,
        status: option,
        attachments: uploadAttachement,
      };
      // console.log("payload in create", payload);
      createMeeting(payload)
        .then((response: any) => {
          //console.log("response====> api", response);
          resetExpandValues();
          onClose();
          handleClose();
          //  console.log("response in create", response);
          if (response?.data?.status === 409) {
            enqueueSnackbar(
              "MoM already exists for the schedule with the same date",
              { variant: "error" }
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
            resetExpandValues();
            resetExpandData();
            // resetExpanAgendaData();
            setLoadMeeting(true);
          }
        })
        .catch((error) => {
          enqueueSnackbar(`Error creating meeting`, { variant: "error" });
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
        <MeetingCreatingTab
          formData={formData}
          setFormData={setFormData}
          data={dataSourceFilter}
          index={index}
          valueById={valueById}
          year={year}
          setUpload={setUpload}
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
          data={dataSourceFilter}
          valueById={valueById}
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
          ownerSourceFilter={undefined}
          option={"Create"}
          open={open}
        />
      ),
    },
  ];

  useEffect(() => {
    const fetchImgUrl = async () => {
      try {
        if (process.env.REACT_APP_IS_OBJECT_STORAGE === "false") {
          // Use the direct URL when object storage is disabled
          setImgUrl(`${process.env.REACT_APP_API_URL}/${userInfo.avatar}`);
        } else {
          // Fetch the URL from object storage when enabled
          const url = await viewObjectStorageDoc(userInfo?.avatar);
          setImgUrl(url);
        }
      } catch (error) {
        console.error("Error fetching image URL:", error);
        // Handle error as needed (e.g., set a default URL or show an error message)
        setImgUrl(""); // Or set a fallback URL
      }
    };

    fetchImgUrl();
  }, [userInfo.avatar]);
  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  // const getAvatarImage = async (userInfo: any) => {
  //   let imageName: any;
  //   // getUserInfo().then((response: any) => {
  //   //   imageName = response?.data?.avatar;
  //   //   setImgUrl(imageName);
  //   // });

  //   imageName = userInfo?.avatar || "";
  //   const url =
  //     process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
  //       ? `${API_LINK}/${userInfo?.avatar}`
  //       : await viewObjectStorageDoc(userInfo?.avatar);
  //   setImgUrl(url);
  //   // setImgUrl(imageName);
  // };

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
            <span>
              {dataSourceFilter &&
                dataSourceFilter?.allData?.unit?.locationName}
            </span>
          </TableRow>
          <TableRow style={{ padding: "0px" }}>
            <span>Meeting Schedule Title :</span>
            <span>{dataSourceFilter && dataSourceFilter?.title}</span>
          </TableRow>
          <TableRow style={{ padding: "0px" }}>
            <div>Meeting Scheduled Dates :</div>

            {dataSourceFilter?.allData?.value?.date.map(
              (dateTimeObj: any, index: any) => (
                <div key={index}>
                  <span>{dateTimeObj.date}</span> {/* Displaying the date */}
                  <span>{dateTimeObj.from}</span>{" "}
                  {/* Displaying the time from */}
                  <span> - </span>{" "}
                  {/* Separator between time from and time to */}
                  <span>{dateTimeObj.to}</span> {/* Displaying the time to */}
                </div>
              )
            )}
          </TableRow>
          <TableRow style={{ padding: "0px" }}>
            <span>Meeting Type :</span>
            <span>
              {dataSourceFilter && dataSourceFilter?.allData?.meetingType?.name}
            </span>
          </TableRow>
        </div>
      ),
      onOk() {
        ("");
      },
    });
  };

  const expandNavigation = () => {
    setLoadMeeting(true);
    let data = {
      data: dataSourceFilter,
      valueById: valueById,
      year: year,
    };
    setDataForm([...dataForm, data]);
    navigate("/mrm/mrmmeetingdetailsdoc", {
      state: {
        data: dataSourceFilter,
        valueById: valueById,
        year: year,
        mrm: meeting,
      },
    });
  };
  return (
    <Drawer
      open={open}
      onClose={() => {
        onClose();
        resetExpandData();
      }}
      title="Create MoM"
      placement="right"
      width={800}
      headerStyle={{ backgroundColor: "#E8F3F9", color: "black" }}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      maskClosable={false}
      extra={
        <div style={{ display: "grid", gap: "5px" }}>
          <div>
            <TableRow className={mrmStyles.TabHeaderPageButtons}>
              <TableCell>
                <Space>
                  <IconButton onClick={info}>
                    <MdInfo />
                  </IconButton>
                  <Button
                    className={classes.cancelBtn}
                    onClick={() => {
                      onClose();
                      resetExpandValues();
                      resetExpandData();
                      // resetExpanAgendaData();
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
                  {/* <Tooltip title="Expand Form">
                    <Button
                      onClick={() => {
                        expandNavigation();
                      }}
                    >
                      <ExpandIcon style={{ height: "23px" }} />
                    </Button>
                  </Tooltip> */}
                </Space>
              </TableCell>
            </TableRow>
          </div>
          <div>
            <Modal></Modal>
          </div>
        </div>
      }
    >
      <div className={classes.tabsWrapper} style={{ position: "relative" }}>
        <Tabs
          type="card"
          items={tabs as any}
          animated={{ inkBar: true, tabPane: true }}
          // tabBarStyle={{backgroundColor : "green"}}
        />
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
              <p style={{ margin: "0" }}>{userInfo.username}</p>
              <p style={{ margin: "0" }}> Meeting Owner</p>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

MrmAddMeetings.propTypes = {};

export default MrmAddMeetings;