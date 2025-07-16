import React, { useEffect, useState } from "react";
import { Form, Input, Row, Col, DatePicker, Select, Upload } from "antd";

import getAppUrl from "../../../utils/getAppUrl";
import axios from "../../../apis/axios.global";
import { useSnackbar } from "notistack";
import MyEditor from "../Editor";

import {
  makeStyles,
  Typography,
  IconButton,
  Grid,
  useMediaQuery,
} from "@material-ui/core";
import { API_LINK } from "../../../config";
import type { UploadProps } from "antd";

import CrossIcon from "../../../assets/icons/BluecrossIcon.svg";
import checkRoles from "../../../utils/checkRoles";

import getYearFormat from "utils/getYearFormat";

import { getAgendaByMeetingType } from "apis/mrmagendapi";
import DateTimeRangeSelector from "../Components/DateTimeRangeSelector";
import { useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { validateTitle } from "utils/validateInput";

const { Option } = Select;
const { Dragger } = Upload;

type Props = {
  formData?: any;
  setFormData?: any;
  mode?: any;
  scheduleData: any;
  unitSystemData: any;
  mrmEditOptions: any;
  setUpload?: any;
  setValue?: any;
};

const useStyles = (matches: any) =>
  makeStyles((theme) => ({
    submitBtn: {
      backgroundColor: "#003566 !important",
      height: "36px",
    },
    disabledInput: {
      "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
        // border: "none",
        backgroundColor: "white !important",
        color: "black",
      },
    },
    customSelect: {
      "&.custom-select .ant-select-selection-item": {
        fontSize: theme.typography.pxToRem(12),
      },
    },

    disabledSelect: {
      "& .ant-select-disabled .ant-select-selector": {
        backgroundColor: "white !important",
        background: "white !important",
        color: "black",

        // border: "none",
      },
      "& .ant-select-disabled .ant-select-selection-item": {
        color: "black",
        backgroundColor: "white !important",
      },
      "& .ant-select-disabled .ant-select-arrow": {
        display: "none",
      },
    },

    disabledMultiSelect: {
      "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
        backgroundColor: "white !important",
        // border: "none",
      },
      "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
        color: "black",
        backgroundColor: "white !important",
      },
      "& .ant-select-disabled .ant-select-arrow": {
        display: "none",
      },
    },

    formTextPadding: {
      paddingBottom: theme.typography.pxToRem(5),
      fontSize: theme.typography.pxToRem(14),
      color: "#003566",
    },
    asterisk: {
      color: "red",
      verticalAlign: "end",
    },
    labelStyle: {
      "& .ant-input-lg": {
        border: "1px solid #dadada",
      },
      "& .ant-form-item .ant-form-item-label > label": {
        color: "#003566",
        fontWeight: "bold",
        letterSpacing: "0.8px",
      },
    },
    label: {
      verticalAlign: "middle",
    },
    root: {
      width: "100%",
      "& .MuiAccordionDetails-root": {
        display: "block",
      },
    },
    uploadSection: {
      width: matches ? "500px" : "100%", // Adjust the width as needed
      height: "100px", // Adjust the height as needed

      padding: "20px", // Adjust the padding as needed
      display: "flex",
      // flexDirection: "column",
      alignItems: "center",
      // justifyContent: "center",
      "& .ant-upload-list-item-name": {
        color: "blue !important",
      },
    },
    filename: {
      fontSize: theme.typography.pxToRem(12),
      color: theme.palette.primary.light,
      textOverflow: "ellipsis",
      overflow: "hidden",
      width: "160px",
      whiteSpace: "nowrap",
      cursor: "pointer",
      "&:hover": {
        cursor: "pointer", // Change cursor to pointer on hover
      },
    },
    dateField: {
      marginTop: "-8px",
    },
  }));

const periodArray = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MeetingAgenda = ({
  formData,
  setFormData,
  mode,
  scheduleData,
  unitSystemData,
  mrmEditOptions,
  setUpload,
  setValue,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const [firstForm] = Form.useForm();
  const previousData = { ...formData };
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const { RangePicker } = DatePicker;
  const showData = isOrgAdmin || isMR;
  const classes = useStyles(matches)();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>(
    previousData?.unit || ""
  );
  const [units, setUnits] = useState<any[]>(previousData?.units || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [systemData, setSystemData] = useState<any[]>([]);
  const [systemDataPlan, setSystemDataPlan] = useState<any[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<any[]>(
    previousData?.system || []
  );
  const [meetingTypeData, setMeetingTypeData] = useState<any[]>([]);
  const [selectedMeetingType, setSelectedMeetingType] = useState<any>("");
  const [selectedMeetingId, setSelectedMeetingId] = useState<any>("");
  const [allPeriods, setPeriods] = useState<any[]>([]);
  const [uploadFileError, setUploadFileError] = useState<any>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [dateTime, setDateTime] = useState<any>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  const [settings, setSettings] = useState<string>("");
  const [currentYear, setCurrentYear] = useState<any>();
  const [readStatus, setReadStatus] = useState(false);

  const [initialFileList, setInitialFileList] = useState([]);
  const [click, setClick] = useState<boolean>(false);

  const navigate = useNavigate();

  // console.log("mrmEditOptions", mrmEditOptions);
  // console.log("unitSystemData", unitSystemData);
  useEffect(() => {
    getUserOptions();
    if (mrmEditOptions === "ReadOnly") {
      setReadStatus(true);
    }
  }, [mrmEditOptions]);
  useEffect(() => {
    getUserOptions();
  }, []);

  const orgId = sessionStorage.getItem("orgId");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);

  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };
  // console.log("scheduledata in meetingagenda", unitFilterBy);

  // useEffect(() => {
  //   if (mrmEditOptions !== "Edit" || "") {
  //     getAgendaByMeetingType(scheduleData?._id).then((response: any) => {
  //       if (response.data) {
  //         setFormData({
  //           ...formData,
  //           agendaformeetingType: response && response?.data,
  //           unit:
  //             mrmEditOptions === "MrmPlan"
  //               ? scheduleData?.unitId[0]?.id
  //               : formData?.unit,
  //           meetingType: scheduleData?._id,
  //         });
  //       }
  //     });
  //     // setFormData({
  //     //   ...formData,
  //     //   unit:
  //     //     mrmEditOptions === "MrmPlan"
  //     //       ? scheduleData?.unitId[0]?.id
  //     //       : formData?.unit,
  //     // });
  //     getPeriodsDataAll();
  //     getApplicationSystems(scheduleData?.unitId[0]?.id);
  //     getApplicationSystemsPlan();
  //   }
  // }, [scheduleData]);
  // useEffect(() => {
  //   console.log("formdata", formData);
  // }, [formData]);
  // console.log("formdata edit option", formdata, mrmEditOptions);

  useEffect(() => {
    getUserOptions();
    orgdata();
    // console.log("set orgdata", scheduleData);
    getyear();
    //\\ console.log("set year", scheduleData);
    getUnits();

    if (mrmEditOptions !== "Edit" && mrmEditOptions !== "ReadOnly") {
      // console.log("inside if");
      setSelectedMeetingType(scheduleData?._id);
      getAgendaByMeetingType(scheduleData?._id).then((response: any) => {
        if (response.data) {
          setFormData({
            ...formData,
            agendaformeetingType: response && response?.data,
            unit:
              mrmEditOptions === "MrmPlan"
                ? unitSystemData?.unit
                : formData?.unit,
            meetingType: scheduleData?._id,
            attendees: scheduleData?.participants
              ?.map((userId: any) =>
                userOptions?.find((user: any) => user.value === userId)
              )
              .filter(Boolean),
          });
        }
      });
      // setFormData({
      //   ...formData,
      //   unit:
      //     mrmEditOptions === "MrmPlan"
      //       ? scheduleData?.unitId[0]?.id
      //       : formData?.unit,
      // });
      getPeriodsDataAll();
      getApplicationSystems(unitSystemData?.unit);
      getApplicationSystemsPlan();
    }
    firstForm.setFieldsValue({
      organizer: userInfo?.userName,
      unit: previousData?.unit || userInfo?.locationId,
      system: previousData?.system || [],
      meetingTitle: previousData?.meetingTitle || null,
      meetingType: previousData?.meetingType || null,
      period: previousData?.period || null,
      meetingDesc: previousData?.meetingDescription || "",
      date: previousData?.date || null,
      attendees: previousData?.attendees || [],
      externalattendees: previousData?.externalattendees || [],
      venue: previousData?.venue || null,
    });
    // console.log("first first", formData);
    // }
    if (previousData?.files && previousData?.files?.length > 0) {
      firstForm.setFieldsValue({ files: previousData?.files });
      setFileList([...previousData?.files]);
      setFormData({ ...formData, files: previousData?.files });
      setInitialFileList(formData.files);
    }
    if (previousData?.attendees) {
      setFormData({ ...formData, attendees: previousData?.attendees });
    }
    // console.log("first second", formData);
    if (previousData?.date) {
      // const [start, end] = previousData?.date; // Destructure values to get the start and end moments
      // const startDate = start.format("DD-MM-YYYY");
      // const endDate = end.format("DD-MM-YYYY");

      // firstForm.setFieldsValue({ date: [startDate, endDate] });
      setFormData({ ...formData, date: previousData?.date });
    }

    setFormData({
      ...formData,
      organizer: userInfo?.userName || "",
      unit: userInfo?.locationId,
    });

    getKeyAgendaByLocation(formData?.unit, currentYear);
    if (previousData?.unit) {
      getApplicationSystems(previousData?.unit);
    }
    if (previousData?.system && previousData?.system?.length) {
      getKeyAgendaValues(previousData?.system);
    }
    if (previousData?.meetingType) {
      getAgendaDataMeetingById(previousData?.meetingType);
      setFormData({ ...formData, date: previousData?.date });
    }
  }, []);
  // console.log("formdata3 in agneda", formData);

  useEffect(() => {
    getyear();
    setSelectedUnit(userInfo.locationId);
    setFormData({ ...formData, unit: userInfo.locationId });
    if (!!previousData?.unit && currentYear !== undefined) {
      getKeyAgendaByLocation(previousData?.unit, currentYear);
    }
  }, [formData?.unit, currentYear]);
  useEffect(() => {
    //getAgendaByMeetingType(formData.meetingType);

    if (selectedMeetingType) {
      getAgendaDataMeetingById(selectedMeetingType);
      getPeriodsData();
    }
  }, [selectedMeetingType]);

  const orgdata = async () => {
    const response = await axios.get(`/api/organization/${realmName}`);

    if (response.status === 200 || response.status === 201) {
      setSettings(response?.data?.fiscalYearQuarters);
    }
  };
  const getUnits = async () => {
    setLoading(true);
    await axios(`/api/location/getAllLocationList`)
      .then((res) => {
        setUnits(res?.data);
        setLoading(false);
        setFormData({ ...formData, units: res?.data });
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };
  // useEffect(() => {
  //   getPeriodsDataAll();
  //   getApplicationSystems(unitFilterBy[0]?.id);
  //   getApplicationSystemsPlan();
  // }, [scheduleData]);

  useEffect(() => {
    handleFileChange(fileList);
  }, [fileList]);

  const getApplicationSystemsPlan = async () => {
    // let encodedSystems = scheduleData?.mrmData?.unitId
    //   ? encodeURIComponent(JSON.stringify(scheduleData?.mrmData?.unitId))
    //   : null;
    // const { data } = await axios.get(
    //   `api/systems/displaySystems/${encodedSystems}`
    // );
    setSystemDataPlan(scheduleData?.applicableSystem);
  };

  // console.log("systemDataplan", firstForm);
  const getPeriodsDataAll = async () => {
    try {
      const response = await axios.get(
        `/api/mrm/getPeriodForMeetingType/${scheduleData._id}`
      );
      const allPeriods = response?.data;

      // Define period arrays for sorting
      const janToDec = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const aprilToMar = [
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
        "January",
        "February",
        "March",
      ];

      let sortedPeriods = [];

      // Choose sorting array based on settings
      if (settings === "April - Mar" && allPeriods?.length) {
        sortedPeriods = allPeriods.sort((a: any, b: any) => {
          return aprilToMar.indexOf(a) - aprilToMar.indexOf(b);
        });
      } else if (settings === "Jan - Dec" && allPeriods?.length) {
        sortedPeriods = allPeriods.sort((a: any, b: any) => {
          return janToDec.indexOf(a) - janToDec.indexOf(b);
        });
      } else {
        // Default sorting if no specific settings
        sortedPeriods = allPeriods;
      }

      // Update state with sorted periods
      setPeriods(sortedPeriods);
    } catch (error) {
      console.error("Error fetching periods data:", error);
    }
  };

  const getPeriodsData = async () => {
    try {
      const response = await axios.get(
        `/api/mrm/getPeriodForMeetingType/${selectedMeetingType}`
      );
      const allPeriods = response.data;

      // Define period arrays for sorting
      const janToDec = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const aprilToMar = [
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
        "January",
        "February",
        "March",
      ];

      // Choose the appropriate sorting array based on settings
      let sortedPeriods = [];
      if (settings === "April - Mar" && allPeriods?.length) {
        sortedPeriods = allPeriods.sort((a: any, b: any) => {
          return aprilToMar.indexOf(a) - aprilToMar.indexOf(b);
        });
      } else if (settings === "Jan - Dec" && allPeriods?.length) {
        sortedPeriods = allPeriods.sort((a: any, b: any) => {
          return janToDec.indexOf(a) - janToDec.indexOf(b);
        });
      } else {
        // If no settings or periods, just use the original order
        sortedPeriods = allPeriods;
      }

      // Update the state with sorted periods
      setPeriods(sortedPeriods);
    } catch (error) {
      console.error("Error fetching periods data:", error);
    }
  };

  const [userOptions, setUserOptions] = useState<any>([]);

  const getUserOptions = async () => {
    await axios
      .get(`/api/riskregister/users/${userInfo?.organizationId}`)
      .then((res) => {
        // console.log("res from users", res);
        if (res.data && res.data.length > 0) {
          const ops = res?.data?.map((obj: any) => ({
            id: obj.id,
            name: obj.username,
            avatar: obj.avatar,
            email: obj.email,
            username: obj.username,
            value: obj.id,
            label: obj.email,
            fullname: obj.firstname + " " + obj.lastname,
          }));
          setUserOptions(ops);
        } else {
          setUserOptions([]);
        }
      })
      .catch((err) => console.error(err));
  };
  // console.log("useroptions", userOptions);

  const getApplicationSystems = async (locationId: any) => {
    const encodedSystems = locationId
      ? encodeURIComponent(JSON.stringify(locationId))
      : null;

    if (encodedSystems && encodedSystems?.length) {
      const { data } = await axios.get(
        `api/systems/displaySystemsForGivenLocation/${encodedSystems}`
      );
      if (data && data?.length) {
        setSystemData([...data]);
      } else {
        setSystemData([]);
      }
    }
  };
  // console.log("mrm edit options", mrmEditOptions);
  const handleChangeSystem = (value: string[]) => {
    setSelectedSystem(value);

    setFormData({
      ...formData,
      system: value,
    });
    if (mrmEditOptions === "MrmPlan") {
      setFormData({
        ...formData,
        system: value,
        meetingType: scheduleData?._id,
        attendees: scheduleData?.participants,
        // unit: scheduleData?.mrmData?.unitId,
      });
    }
    // getKeyAgendaValues(value);
  };
  // console.log("schedule data", scheduleData, formData);
  const handleChangeMeetingType = (value: string) => {
    // console.log("inside on change");
    setSelectedMeetingType(value);
    // getPeriodsData();
    setFormData({ ...formData, meetingType: value });

    // getAgendaByMeetingType(value);
  };

  const getKeyAgendaByLocation = async (data: any, currentYear: any) => {
    try {
      let res: any;
      // console.log("inside get meeting tpes", data);
      const location = [
        !!data && data !== undefined ? data : userInfo.locationId,
      ];

      if (location?.includes("All") || location?.length === 0) {
        const payload = {
          orgId: orgId,
          currentYear: currentYear,
        };

        res = await axios.get("/api/keyagenda/getkeyAgendaByOrgId", {
          params: payload,
        });
      } else {
        //const locationValues = [...location].map((option: any) => option.id);

        const payloadData = {
          orgId: orgId,
          locationId: location,
          currentYear: currentYear,
        };

        res = await axios.get("/api/keyagenda/getkeyAgendaByUnit", {
          params: payloadData,
        });
      }
      if (res.status === 200 || res.status === 201) {
        const data = res.data;
        // console.log("data in meetingagenda", data);
        setMeetingTypeData(data);
        if (mrmEditOptions === "Direct" && res.data.length === 0) {
          enqueueSnackbar(
            `You are not a owner in any meeting types cannot create schedule`,
            { variant: "error" }
          );
          setValue(0);
          navigate("/mrm");
        }
        //setFormData({ ...formData, agendaformeetingType: data });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAgendaDataMeetingById = async (meetingType: any) => {
    // console.log("inside get agenda", meetingType);
    const result = await axios.get(
      `${API_LINK}/api/mrm/getAgendaByMeetingType/${meetingType}`
    );
    // console.log("inside response.data", result?.data);
    if (result.data) {
      if (mrmEditOptions !== "Edit" && mrmEditOptions !== "ReadOnly") {
        firstForm.setFieldsValue({ attendees: result?.data?.participants });
        setFormData({
          ...formData,
          attendees: result?.data?.participants,
          agendaformeetingType: result?.data?.result,
        });
      }
    }
  };
  // const validateTitle = (
  //   rule: any,
  //   value: string,
  //   callback: (error?: string) => void
  // ) => {
  //   if (!value || typeof value !== "string") {
  //     callback("Text value is required and must be a string.");
  //     return;
  //   }
  //   // Define regex pattern for allowed characters
  //   const TITLE_REGEX =
  //     /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,\?&%!#@€£`'"\~]+$/; // Allows letters, numbers, and specific symbols, but does not include < and >

  //   // Check for disallowed characters
  //   const DISALLOWED_CHARS = /[<>{}]/;

  //   // Check for more than two consecutive special characters
  //   const MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS =
  //     /[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s:;=}{]{3,}/;

  //   // Check if the title starts with a special character
  //   const STARTS_WITH_SPECIAL_CHAR =
  //     /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]/;

  //   if (!value || value.trim().length === 0) {
  //     callback("Text value is required.");
  //   } else if (DISALLOWED_CHARS.test(value)) {
  //     callback("Invalid text. Disallowed characters are < and >.");
  //   } else if (MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS.test(value)) {
  //     callback(
  //       "Invalid text. No more than two consecutive special characters are allowed."
  //     );
  //   } else if (STARTS_WITH_SPECIAL_CHAR.test(value)) {
  //     callback("Invalid text. Text should not start with a special character.");
  //   } else if (!TITLE_REGEX.test(value)) {
  //     callback(
  //       "Invalid text. Allowed characters include letters, numbers, commas, slashes, hyphens, dots, and currency symbols."
  //     );
  //   } else {
  //     callback();
  //   }
  // };
  // console.log("formdata in schedule", formData);
  const getKeyAgendaValues = async (data: any) => {
    try {
      setLoading(true);
      //get api

      if (data && data?.length && selectedUnit) {
        const payload = {
          orgId: orgId,
          unitId: [selectedUnit],
          applicationSystemID: data && data?.length ? [...data] : [],
        };
        const res = await axios.get("api/keyagenda/getSchedulePeriodUnit", {
          params: payload,
        });
        if (res.status === 200 || res.status === 201) {
          const data = res.data;
          const allPeriods = res?.data?.period;

          if (settings === "Jan - Dec" && allPeriods?.length) {
            allPeriods?.sort(function (a: any, b: any) {
              return periodArray?.indexOf(a) - periodArray?.indexOf(b);
            });
          }

          //setPeriods(allPeriods || []);
          setDataSource(data?.data || []);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      // enqueueSnackbar(`!`, {
      //   variant: "error",
      // });
    }
  };

  const handleChange = (value: string) => {
    setSelectedUnit(value);
    setFormData({ ...formData, unit: value });
    getApplicationSystems(value);
  };
  // const handleChangeVenue = (e: any) => {
  //   // console.log("e in handle change", e);
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };

  const handleKeyAgenda = (data: any) => {
    getKeyAgendaValues(selectedSystem);
  };
  const handleDateRange = (values: any[]) => {
    if (!values || !Array.isArray(values)) {
      enqueueSnackbar("Select a valid date range", { variant: "error" });
      return;
    }

    const formattedRanges = values.map(([start, end]) => ({
      startDate: start?.format("DD-MM-YYYY HH:mm") || null,
      endDate: end?.format("DD-MM-YYYY HH:mm") || null,
    }));

    setFormData({
      ...formData,
      date: formattedRanges,
    });
  };

  // console.log("formdata", formData);
  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onRemove: (file) => {
      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== file.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: fileList,
      }));
    },
  };

  const arraysAreEqual = (array1: any, array2: any) => {
    if (array1.length !== array2.length) {
      return false;
    }

    for (let i = 0; i < array1.length; i++) {
      // Deep comparison of array elements
      if (JSON.stringify(array1[i]) !== JSON.stringify(array2[i])) {
        return false;
      }
    }

    return true;
  };
  const handleFileChange = async (fileList: any) => {
    const fileschanged = !arraysAreEqual(fileList, initialFileList);
    // console.log("filechanges value", fileschanged);
    if (fileschanged && !click) {
      // console.log("inside if if handlefilechange");
      setUpload(false);
      // setAnalysis(true);
      // setOutcomeUpload(true);
    } else {
      setUpload(true);
      // setAnalysis(true);
      // setOutcomeUpload(true);
    }
  };

  const unit = units.find((unit) => unit.id === unitSystemData.unit);
  const locationName = unit ? unit.locationName : "";
  const clearFile = async (data: any) => {
    try {
      //console.log("data in clearfile", data);

      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== data.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: updatedFileList,
      }));
    } catch (error) {
      console.error("Error in clearFile:", error);
      return error;
    }
  };

  const handleChangePeriod = (data: any) => {
    // console.log("datasource", data);
    const newDataSource: any[] = [...dataSource];
    // console.log("new dat source value", newDataSource);
    // console.log("data", data);
    const DataSource = newDataSource.filter(
      (item: any) => item?.mrmData?.period && item.mrmData.period.includes(data)
    );

    setFormData({
      ...formData,
      keyadendaDataValues: DataSource,
      period: data,
      // unit:
      //   mrmEditOptions === "MrmPlan"
      //     ? scheduleData?.unitId[0]?.id
      //     : formData?.unit,
      // dataValue: DataSource,
    });
  };

  const handleChangeDateTime = (event: any) => {
    setFormData({ ...formData, date: event.target.value || null });
    setDateTime(event.target.value || null);
  };

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const handleLinkClick = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.url
        : await viewObjectStorageDoc(item?.url);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };

  return (
    <>
      <Form
        form={firstForm}
        layout="vertical"
        onValuesChange={(changedValues, allValues) =>
          setFormData({ ...formData, allValues, changedValues })
        }
        initialValues={formData}
      >
        {mrmEditOptions === "MrmPlan" ? (
          <div style={{ display: "flex", gap: "20px" }}>
            <div
              style={{ display: "flex", flexDirection: "column", flex: "1" }}
            >
              <div
                className={classes.formTextPadding}
                style={{ width: "200px" }}
              >
                <strong>
                  <span className={classes.label}>Unit: </span>
                </strong>
              </div>
              <Form.Item
                rules={[{ required: true, message: "Please Select Unit!" }]}
                className={classes.disabledInput}
                style={{
                  marginBottom: 0,
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  width: "250px",
                }}
              >
                <Input
                  value={locationName || ""}
                  disabled={true}
                  placeholder={locationName || ""}
                />
              </Form.Item>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", flex: "1" }}
            >
              <div
                className={classes.formTextPadding}
                style={{ width: "250px" }}
              >
                <strong>
                  <span className={classes.label}>Meeting Type:</span>
                </strong>
              </div>
              <Form.Item
                rules={[
                  { required: true, message: "Please Select Meeting Type!" },
                ]}
                className={classes.disabledInput}
                style={{
                  marginBottom: 0,
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  width: "250px",
                }}
              >
                <Input
                  value={scheduleData?.name}
                  disabled={true}
                  placeholder={scheduleData?.name}
                />
              </Form.Item>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", flex: "1" }}
            >
              <div
                className={classes.formTextPadding}
                style={{ width: "180px" }}
              >
                <strong>
                  <span className={classes.label}>Organizer:</span>
                </strong>
              </div>
              <Form.Item
                name="organizer"
                className={classes.disabledInput}
                style={{
                  marginBottom: 0,
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  width: "250px",
                }}
              >
                <Input
                  value={userInfo?.userName || ""}
                  disabled={true}
                  placeholder={userInfo?.userName || ""}
                />
              </Form.Item>
            </div>
          </div>
        ) : (
          ""
        )}

        <Row
          gutter={[16, 16]}
          style={{ display: "flex", flexDirection: matches ? "row" : "column" }}
        >
          <Col span={matches ? 10 : 24}>
            {mrmEditOptions === "MrmPlan" ? (
              <>
                {/* <Grid item sm={12} md={5} className={classes.formTextPadding}>
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                    <span className={classes.label}>Select Unit: </span>
                  </strong>
                </Grid>
                <Form.Item
                  label="Select Unit: "
                  name="unit"
                  tooltip="This is a required field"
                  rules={[{ required: true, message: "Please Select Unit!" }]}
                  className={classes.disabledInput}
                  style={{ marginBottom: 0, paddingTop: "10px" }}
                >
                  <Input
                    value={unitFilterBy[0]?.locationName || ""}
                    disabled={true}
                    placeholder={unitFilterBy[0]?.locationName || ""}
                  />
                </Form.Item> */}
                <Grid item sm={12} md={5} className={classes.formTextPadding}>
                  <strong>
                    {mrmEditOptions === "MrmPlan" ? (
                      <span className={classes.asterisk}>*</span>
                    ) : (
                      ""
                    )}
                    <span className={classes.label}>Period:</span>
                  </strong>
                </Grid>
                <Form.Item
                  // label="Period"
                  name="period"
                  // tooltip="This is a required field"
                  rules={[
                    { required: false, message: "Please Select period!" },
                  ]}
                  className={classes.disabledSelect}
                  style={{ marginBottom: 0, paddingBottom: "10px" }}
                >
                  <Select
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Please select period"
                    onChange={handleChangePeriod}
                    // disabled={showData ? false : true}
                    disabled={
                      readStatus || mrmEditOptions === "Edit" ? true : false
                    }
                  >
                    {Array.isArray(allPeriods) &&
                      allPeriods?.length > 0 &&
                      allPeriods?.map((data) => {
                        return (
                          <Option value={data} key={data}>
                            {data}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </>
            ) : (
              <>
                <Grid item sm={12} md={5} className={classes.formTextPadding}>
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                    <span className={classes.label}>Unit: </span>
                  </strong>
                </Grid>
                <Form.Item
                  // label="Select Unit: "
                  name="unit"
                  // tooltip="This is a required field"
                  rules={[{ required: true, message: "Please Select Unit!" }]}
                  className={classes.disabledSelect}
                  style={{ marginBottom: 0, paddingBottom: "10px" }}
                >
                  <Select
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Please select unit"
                    onChange={handleChange}
                    disabled={true}
                    //readStatus || mrmEditOptions === "Edit" ? true : false
                  >
                    {units?.length &&
                      units?.map((data) => {
                        return (
                          <Option value={data?.id} key={data?.id}>
                            {data?.locationName}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </>
            )}
          </Col>
          <Col span={matches ? 14 : 24}>
            {mrmEditOptions === "MrmPlan" ? (
              <>
                <Grid item sm={12} md={5} className={classes.formTextPadding}>
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                    <span className={classes.label}>Select System: </span>
                  </strong>
                </Grid>
                <Form.Item
                  // label="Select System: "
                  name="system"
                  // tooltip="This is a required field"
                  rules={[{ required: true, message: "Please Select System!" }]}
                  className={classes.disabledMultiSelect}
                  style={{ marginBottom: 0, paddingBottom: "10px" }}
                >
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Please select system"
                    onChange={handleChangeSystem}
                    // disabled={showData ? false : true}
                    onBlur={handleKeyAgenda}
                  >
                    {systemDataPlan?.map((data: any) => {
                      // console.log("data in select", data);
                      return (
                        <Option value={data?._id} key={data?._id}>
                          {data?.name}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </>
            ) : (
              <>
                {systemData && systemData.length > 0 && (
                  <>
                    <Grid
                      item
                      sm={12}
                      md={5}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.asterisk}>*</span>{" "}
                        <span className={classes.label}>Select System: </span>
                      </strong>
                    </Grid>
                    <Form.Item
                      // label="Select System: "
                      name="system"
                      // tooltip="This is a required field"
                      rules={[
                        { required: true, message: "Please Select System!" },
                      ]}
                      className={classes.disabledSelect}
                      style={{ marginBottom: 0, paddingBottom: "10px" }}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        style={{ width: "100%" }}
                        placeholder="Please select system"
                        onChange={handleChangeSystem}
                        // disabled={showData ? false : true}
                        onBlur={handleKeyAgenda}
                        disabled={
                          readStatus || mrmEditOptions === "Edit" ? true : false
                        }
                      >
                        {systemData.map((data) => {
                          return (
                            <Option value={data?.id} key={data?.id}>
                              {data?.name}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </>
                )}
              </>
            )}
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>{" "}
                <span className={classes.label}>Schedule Title </span>
              </strong>
            </Grid>
            <Form.Item
              // label="Meeting Title"
              name="meetingTitle"
              // tooltip="This is a required field"
              rules={[
                // { required: true, message: "Please Select Schedule Title!" },
                { validator: validateTitle },
              ]}
              className={classes.disabledInput}
              style={{ marginBottom: 0, paddingBottom: "10px" }}
            >
              <Input
                placeholder="Enter Schedule name"
                //disabled={showData ? false : true}
                onBlur={(e) =>
                  setFormData({ ...formData, meetingTitle: e.target.value })
                }
                disabled={readStatus}
              />
            </Form.Item>
          </Col>

          {/* <Col span={8}>
          <Form.Item
            label="Meeting Date: "
            name="date"
            // tooltip="This is a required field"
            rules={[{ required: true, message: "Please Select Date!" }]}
          >
            <TextField
              fullWidth
              className={classes.dateField}
              type="datetime-local"
              name="time"
              disabled={showData ? false : true}
              value={dateTime}
              defaultValue={dateTime}
              variant="outlined"
              onChange={(e) => handleChangeDateTime(e)}
              size="small"
              required
            />
          </Form.Item>
        </Col> */}
        </Row>

        <Row
          gutter={[16, 16]}
          style={{ display: "flex", flexDirection: matches ? "row" : "column" }}
        >
          <Col span={matches ? 14 : 24}>
            {mrmEditOptions === "MrmPlan" ? (
              <>
                {/* <Grid item sm={12} md={5} className={classes.formTextPadding}>
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                    <span className={classes.label}> Meeting Type:</span>
                  </strong>
                </Grid>
                <Form.Item
                  label="Select Meeting Type: "
                  name="meetingType"
                  tooltip="This is a required field"
                  rules={[
                    { required: true, message: "Please Select Meeting Type!" },
                  ]}
                  className={classes.disabledInput}
                  style={{ marginBottom: 0, paddingBottom: "10px" }}
                >
                  <Input
                    value={scheduleData?.name}
                    disabled={true}
                    placeholder={scheduleData?.name}
                  />
                </Form.Item> */}
              </>
            ) : (
              <>
                <Grid item sm={12} md={5} className={classes.formTextPadding}>
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                    <span className={classes.label}> Meeting Type:</span>
                  </strong>
                </Grid>
                <Form.Item
                  // label="Select Meeting Type: "
                  // name="meetingType"
                  // tooltip="This is a required field"
                  rules={[
                    { required: true, message: "Please Select Meeting Type!" },
                  ]}
                  className={classes.disabledSelect}
                  style={{ marginBottom: 0, paddingBottom: "10px" }}
                >
                  {mrmEditOptions === "Edit" ||
                  mrmEditOptions === "ReadOnly" ? (
                    <Input
                      value={scheduleData?.meetingType?.name}
                      disabled={
                        readStatus || mrmEditOptions === "Edit" ? true : false
                      }
                    />
                  ) : (
                    <Select
                      // mode="single"
                      allowClear
                      style={{ width: "100%" }}
                      placeholder="Select Meeting Type"
                      //value={formData?.meetingType}
                      onChange={handleChangeMeetingType}
                      //disabled={showData ? false : true}
                      onBlur={handleKeyAgenda}
                      disabled={
                        readStatus || mrmEditOptions === "Edit" ? true : false
                      }
                    >
                      {/* {console.log("meetingTypeData", meetingTypeData)} */}
                      {meetingTypeData?.length &&
                        meetingTypeData?.map((data: any) => {
                          return (
                            <Option value={data?._id} key={data?._id}>
                              {data?.name}
                            </Option>
                          );
                        })}
                    </Select>
                  )}
                </Form.Item>
              </>
            )}
          </Col>
          {mrmEditOptions === "MrmPlan" ? (
            ""
          ) : (
            <Col span={matches ? 10 : 24}>
              <Grid item sm={12} md={5} className={classes.formTextPadding}>
                <strong>
                  {mrmEditOptions === "MrmPlan" ? (
                    <span className={classes.asterisk}>*</span>
                  ) : (
                    ""
                  )}
                  <span className={classes.label}>Period:</span>
                </strong>
              </Grid>
              <Form.Item
                // label="Period"
                name="period"
                // tooltip="This is a required field"
                rules={[{ required: false, message: "Please Select period!" }]}
                className={classes.disabledSelect}
                style={{ marginBottom: 0, paddingBottom: "10px" }}
              >
                <Select
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Please select period"
                  onChange={handleChangePeriod}
                  // disabled={showData ? false : true}
                  disabled={
                    readStatus || mrmEditOptions === "Edit" ? true : false
                  }
                >
                  {Array.isArray(allPeriods) &&
                    allPeriods?.length > 0 &&
                    allPeriods?.map((data) => {
                      return (
                        <Option value={data} key={data}>
                          {data}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>{" "}
                <span className={classes.label}>Meeting Dates:</span>
              </strong>
            </Grid>
            <Form.Item
              // label="Meeting Date: "
              // name="date"
              // tooltip="This is a required field"

              rules={[{ required: true, message: "Please Select Date!" }]}
            >
              <div>
                <DateTimeRangeSelector
                  formData={formData}
                  setFormData={setFormData}
                  handleDateRange={handleDateRange}
                  readStatus={readStatus}
                />
              </div>
            </Form.Item>
          </Col>
        </Row>
        {mrmEditOptions === "MrmPlan" ? (
          ""
        ) : (
          <Row
            gutter={[16, 16]}
            style={{
              display: "flex",
              flexDirection: matches ? "row" : "column",
            }}
          >
            <Col span={matches ? 10 : 24}>
              <Grid item sm={12} md={5} className={classes.formTextPadding}>
                <strong>
                  {/* <span className={classes.asterisk}>*</span>{" "} */}
                  <span className={classes.label}>Organizer:</span>
                </strong>
              </Grid>
              <Form.Item
                name="organizer"
                className={classes.disabledInput}
                style={{ marginBottom: 0, paddingBottom: "10px" }}
              >
                <Input
                  value={userInfo?.userName || ""}
                  disabled={true}
                  placeholder={userInfo?.userName || ""}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                {/* <span className={classes.asterisk}>*</span>{" "} */}
                <span className={classes.label}>
                  List of Internal Participants:{" "}
                </span>
              </strong>
            </Grid>
            <Form.Item
              // label="List of Participants "
              name="attendees"
              className={classes.disabledMultiSelect}
              // tooltip="This is a required field"

              rules={[{ required: true, message: "Please Select attendees!" }]}
            >
              <Select
                showSearch
                placeholder="Select Participants"
                style={{
                  width: "100%",
                  fontSize: "12px", // Reduce font size for selected items
                }}
                value={formData?.attendees}
                mode="multiple"
                options={userOptions || []}
                onChange={(selectedAttendees) => {
                  const selectedUsers = selectedAttendees
                    ?.map((userId: any) =>
                      userOptions.find((user: any) => user.value === userId)
                    )
                    .filter(Boolean);

                  setFormData({
                    ...formData,
                    attendees: selectedUsers || [], // Ensure that an empty array is set if no attendees are selected
                  });
                }}
                size="large"
                // defaultValue={formData?.attendees || []} // Set default value to an empty array if no attendees are selected
                filterOption={(input, option: any) =>
                  option?.label?.toLowerCase().indexOf(input?.toLowerCase()) >=
                  0
                }
                disabled={readStatus}
                listHeight={200}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                {/* <span className={classes.asterisk}>*</span>{" "} */}
                <span className={classes.label}>
                  List of External Participants:{" "}
                </span>
              </strong>
            </Grid>
            <TextArea
              rows={1}
              autoSize={{ minRows: 1, maxRows: 6 }}
              placeholder="External Participants"
              size="large"
              disabled={readStatus}
              name="externalattendees"
              style={{
                fontSize: "14px",
                marginBottom: "10px",
                padding: "10px",
                backgroundColor: readStatus === true ? "white" : "#FAFAFA",
              }}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const input = e.target.value;

                // Split by commas and trim whitespace
                const namesArray = input.split(",").map((name) => name.trim());

                // Regex to allow alphabets, @ symbol, and spaces within valid names
                const validNamesArray = namesArray.filter(
                  (name) => name === "" || /^[a-zA-Z@\-, \s]+$/.test(name) // Allow letters, @, and spaces
                );

                setFormData({
                  ...formData,
                  ["externalattendees"]: validNamesArray,
                });
              }}
              value={formData?.externalattendees?.join(", ") || ""} // Join array elements with commas for display
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={matches ? 16 : 24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>{" "}
                <span className={classes.label}> Meeting Venue: </span>
              </strong>
            </Grid>
            <Form.Item
              name="venue"
              className={classes.disabledInput}
              style={{ marginBottom: 0, paddingBottom: "10px" }}
              rules={[{ validator: validateTitle }]}
            >
              <Input
                placeholder="Meeting Venue"
                name="venue"
                defaultValue={formData?.venue}
                value={formData?.venue}
                onChange={(e) => {
                  setFormData({ ...formData, [e.target.name]: e.target.value });
                }}
                disabled={readStatus}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                {/* <span className={classes.asterisk}>*</span>{" "} */}
                <span className={classes.label}>Meeting Description/Notes</span>
              </strong>
            </Grid>
            <Form.Item
              name="meetingDesc"
              rules={[{ validator: validateTitle }]}
            >
              <MyEditor
                readStatus={readStatus}
                formData={formData}
                setFormData={setFormData}
                title="description"
                readMode={undefined}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={matches ? 12 : 24}>
            <Form.Item
              // name="fileList"
              help={uploadFileError ? "Please upload a file!" : ""}
              validateStatus={uploadFileError ? "error" : ""}
              style={{ marginBottom: "-10px" }}
            >
              <Dragger
                accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
                name="fileList"
                {...uploadFileprops}
                className={`${classes.uploadSection} ant-upload-drag-container`}
                showUploadList={false}
                fileList={formData?.files}
                multiple
                disabled={readStatus}
                // disabled={formData.status === "CA PENDING"}
              >
                {/* <p className="ant-upload-drag-icon">
                <InboxIcon />
              </p> */}
                <p className="ant-upload-text">Upload Files</p>
              </Dragger>
            </Form.Item>
          </Col>
          {/* <Col span={24}>
            <Tooltip title="Upload files">
              <Button
                type="primary"
                href="#"
                onClick={() => {
                  setClick(true);
                  addSelectedFiles(fileList);
                }}
                className={classes.submitBtn}
                style={{
                  display: "flex",
                  textAlign: "center",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                disabled={
                  readStatus || mrmEditOptions === "Edit" ? true : false
                }
              >
                Upload Files
              </Button>
            </Tooltip>
          </Col> */}
          {/* <Col span={24}>
          <strong>
            <span
              style={{
                color: "red",
                fontSize: "10px",
              }}
            >
              {!!fileList.length
                ? "!!Click on Upload files button to upload"
                : ""}
            </span>
          </strong>
        </Col> */}
        </Row>
        <Row>
          {uploadLoading ? (
            <div>Please wait while documents get uploaded</div>
          ) : (
            formData?.files &&
            formData?.files?.length > 0 &&
            formData?.files?.map((item: any) => (
              <div
                style={{
                  display: "flex",
                  marginLeft: "10px",
                  alignItems: "center",
                }}
                key={item.uid}
              >
                <Typography
                  className={classes.filename}
                  onClick={() => handleLinkClick(item)}
                >
                  {item?.name}
                </Typography>

                <IconButton
                  onClick={() => {
                    // console.log("item click");
                    clearFile(item);
                  }}
                >
                  <img src={CrossIcon} alt="" />
                </IconButton>
              </div>
            ))
          )}
        </Row>
      </Form>
    </>
  );
};

export default MeetingAgenda;
