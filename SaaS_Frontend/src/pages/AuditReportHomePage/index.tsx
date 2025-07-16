import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  FormControl,
  makeStyles,
  TextField,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { message, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import YearComponent from "components/Yearcomponent";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import getYearFormat from "utils/getYearFormat";
import SingleFormWrapper from "containers/SingleFormWrapper";

const useStyles = makeStyles((theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  taskTag: {
    display: "inline-block",
    backgroundColor: "#E0F7FA", // Light cyan background
    color: "#000", // Black text
    padding: "5px 10px",
    borderRadius: "15px", // Rounded corners for tag-like appearance
    fontSize: "15px",
    fontWeight: 600,
    margin: "5px",
    cursor: "pointer",
    textDecoration: "none", // Ensures no underline
    "&:hover": {
      backgroundColor: "#B2EBF2", // Slightly darker cyan on hover
    },
  },
  newContainer: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  createButton: {
    backgroundColor: "#001f4d", // deep navy blue
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 40,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#001f4d",
    },
  },
  createIcon: {
    fontSize: 20,
    backgroundColor: "#fff",
    color: "#002f6c",
    borderRadius: "50%",
    padding: 2,
  },
  createText: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "Poppins",
  },
  buttonBase: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "4px 16px",
    borderRadius: 6,
    backgroundColor: "white",
    fontFamily: "Poppins",
    fontSize: 14,
    cursor: "pointer",
    lineHeight: "normal",
    border: "2px solid #003059",
    color: "#003059",
  },
  adhocButton: {
    color: "#003059",
    border: "2px solid #003059",
  },
  auditButton: {
    color: "#003059",
    border: "2px solid #003059",
    padding: "4px 16px",
    borderRadius: 6,
  },
  auditButtonActive: {
    color: "#fff",
    backgroundColor: "#3476ba",
    border: "2px solid #3476ba",
    padding: "4px 16px",
    borderRadius: 6,
  },
  deleteButton: {
    color: "#e60000",
    border: "1px solid #e60000",
  },
  icon: {
    fontSize: 18,
  },
  text: {
    fontSize: 14,
    fontWeight: 600,
  },

  segmentBox: {
    width: "416px",
    height: "36px",
    flexGrow: 0,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "36px",
    padding: "0",
  },
  taskTitle: {
    fontSize: "15px",
    fontWeight: 600,
    margin: "5px",
    cursor: "pointer",
  },
  segmentedItem: {
    border: "2px solid #ededed",
    backgroundColor: "#ffffff",

    "&.ant-segmented .ant-segmented-item-selected": {
      backgroundColor: "#3576ba !important", // Selected color
      color: "white !important", // Change text color when selected
    },
  },
  rollingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E0F7FA", // Light cyan background for the entire row
    padding: "10px 15px",
    borderRadius: "10px",
    margin: "10px 0",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
    fontSize: "14px",
  },

  rightEnd: {
    marginLeft: "auto", // Ensures the div is pushed to the right
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },

  closeButton: {
    marginTop: 20,
    padding: "10px 20px",
    fontSize: 16,
    backgroundColor: "red",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  searchContainer: {
    maxWidth: "100vw",
    height: "30px",
    // marginBottom: "25px",
  },
  docNavInnerFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "6px 4px",
    "& .ant-input": {
      background: "#E8F3F9 !important",
    },
  },
  divderRightSide: {
    top: "0.1em",
    height: "1.5em",
    background: "gainsboro",
  },
  docNavIconStyle: {
    width: "21.88px",
    height: "21px",
    paddingRight: "6px",
    cursor: "pointer",
  },
  tableContainer: {
    // Table Header Styles
    // "& .ant-table-thead > tr > th": {
    //   backgroundColor: "#E8F3F9", // Set the table header background color to yellow
    // },
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      padding: "4px 12px",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    // Table Body Styles
    "& .ant-table-tbody > tr > td": {
      // border: "0.5px solid #E6E8EA", // Add a border around each table body cell
      padding: "2px 12px", // Adjust the padding as needed
      height: "35px", // Set the height of the table cells
    },
    // "& tr.ant-table-row:nth-child(odd)": {
    //   backgroundColor: "#F5F5F5", // Odd row color
    // },
    // "& tr.ant-table-row:nth-child(even)": {
    //   backgroundColor: "#FFFFFF", // Even row color
    // },
  },
  root: (props: any) => {
    return {
      width: props === 2 ? "100%" : "97%",
      padding: "40px 16px 16px 16px",
      overflowX: "auto",
      whiteSpace: "nowrap",
    };
  },
  iconGroup: {
    // marginLeft: "auto",
    display: "flex",
    justifyContent: "center",
    width: "fit-content",
    height: "fit-content",
    // alignItems: "center",
  },
  datePickersContainer: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px",
  },
  boardContainer: {
    // padding: theme.spacing(2), // Add padding around the Kanban board
    display: "flex",
    // overflowX: "auto",
    backgroundColor: "#ffffff",
    width: "95%",
    justifyContent: "center",
  },
  // #ffffff
  // #F9F6F7
  column: {
    // padding: theme.spacing(1),
    minWidth: "20px",
    // width:"70px",
    backgroundColor: "#fafafa",
    borderRadius: "6px",
    marginRight: theme.spacing(1),
    paddingBottom: "4px",
  },
  columnName: {
    // marginBottom: theme.spacing(1),
    fontSize: "20px",
    // textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "bold",
    padding: "0px",
    margin: "0px",
  },
  auditorNew: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#3F51B5",
    // whiteSpace: "nowrap", // Prevent text from wrapping
    overflow: "hidden",
    // textOverflow: "ellipsis", // Show ellipsis if text overflows
    // maxWidth: "120px", // Set a max width to handle varying text length
  },
  auditeeNew: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#FF5722",
    // whiteSpace: "nowrap", // Prevent text from wrapping
    overflow: "hidden",
    // textOverflow: "ellipsis", // Show ellipsis if text overflows
    // maxWidth: "120px", // Set a max width to handle varying text length
  },

  taskContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
    margin: "8px 16px 16px 16px",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    // marginBottom: theme.spacing(1),
  },
  title: {
    marginRight: theme.spacing(1),
    // fontWeight: "bold",
    fontSize: "15px",
    paddingLeft: "4px",
    display: "inline-block",
    // textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
    flexGrow: 0,
  },
  description: {
    marginBottom: theme.spacing(1),
  },
  info: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatar: {
    marginRight: theme.spacing(1),
  },
  tableContainerScrollable: {
    marginBottom: "20px", // Adjust the value as needed
    maxHeight: "calc(76vh - 20vh)", // Adjust the max-height value as needed
    overflowY: "auto",
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
  locSearchBox: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "4px",
    },
    padding: "4px",
  },

  locSearchBoxNew: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
    // "& .MuiOutlinedInput-root": {
    //   borderRadius: "16px",
    // },
  },
  addButton: {
    border: "none",
    // position: "absolute",
    // top: theme.spacing(1),
    // right: theme.spacing(1),
  },
  // Add this to override the styles
  inputRootOverride: {
    border: "1px solid black",
    borderRadius: "5px",
    '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]':
      {
        // padding: "3px 0px 1px 3px !important",
      },
  },
  textField: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "white",

      // borderRadius: "20px",
      // color: "black",
      fontSize: "14px",
      // fontWeight: 600,
      // border: "1px solid black",
    },
    // "& .MuiOutlinedInput-notchedOutline": {
    //   borderRadius: "20px",
    // },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  textField2: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "white",
      // borderRadius: "20px",
      // color: "black",
      // border: "1px solid  black",
      fontSize: "14px",
      // fontWeight: 600,
    },
    // "& .MuiOutlinedInput-notchedOutline": {
    //   borderRadius: "20px",
    // },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  tag: {
    display: "inline-block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100px", // Adjust the max-width as needed
  },
  tagContainer: {
    display: "flex",
    flexDirection: "row",
  },
  hiddenTags: {
    display: "none",
  },
  disabledRangePicker: {
    "& .ant-picker-input > input[disabled]": {
      color: "black", // Set text color to black
      fontSize: "12px",
    },
    "& .ant-picker-suffix": {
      color: "black !important", // Ensure icon color is black
    },
    "& .ant-picker-disabled": {
      // borderColor: "black", // Set border color to black
      // borderWidth: "1px",
      // borderStyle: "solid",
      border: "1px solid black",
    },
    "& .ant-picker-disabled .ant-picker-input input": {
      color: "black", // Ensure input text color is black when disabled
    },
    "& .ant-picker-disabled .ant-picker-suffix": {
      color: "black !important", // Ensure icon color is black when disabled
    },
  },
  name: {
    color: "#000",
    fontWeight: 500,
    marginRight: "20px",
  },
  auditor: {
    color: "#000",
    fontWeight: 400,
    marginRight: "20px",
  },
  auditee: {
    color: "#000",
    fontWeight: 400,
    marginRight: "20px",
  },
  time: {
    color: "#000",
    fontWeight: 400,
    marginRight: "20px",
  },
  addIcon: {
    color: "#9C27B0", // Purple color for the add icon
  },
}));

const useStyles2 = makeStyles(() => ({
  dropdownLabel: {
    fontSize: "14px",
    color: "#000",
    minWidth: "40px",
    fontFamily: "Poppins",
  },
  compactAutocomplete: {
    width: "18vw",
    "& .MuiOutlinedInput-root": {
      // height: "30px",
      fontSize: "14px",
      fontFamily: "Poppins",
    },
    "& input": {
      padding: "4px 8px !important",
    },
  },
  filledInput: {
    "& .MuiOutlinedInput-input": {
      color: "#000",
    },
  },
  placeholderInput: {
    "& .MuiOutlinedInput-input": {
      color: "black",
    },
  },
}));

const AuditReportHomePage = ({ collapseLevel }: any) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const classes = useStyles(collapseLevel);
  const newClasses = useStyles2();
  const yearRef = useRef(null);
  const realmName = getAppUrl();
  const [selectTableAuditType, setSelectTableAuditType] = useState<any>(null);
  const [selected, setSelected] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [auditTypeOptions, setAuditTypeOptions] = useState<any>([]);
  const [locationNames, setLocationNames] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    // setCurrentYear(currentyear);

    getLocationNames();
    fetchAuditType();
    getyear();

    // fetchSystem();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectTableAuditType, selectedLocation, currentYear]);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `/api/auditSchedule/getMonthByPlannedData?type=${selectTableAuditType?.id}&location=${selectedLocation?.id}&year=${currentYear}`
      );
      setData(res?.data);
    } catch (err: any) {
      message.error(err);
    }
  };

  const handleChangeList = (e: any, value: any) => {
    setSelectedUnit(!!value);
    setSelectedLocation(value);
  };

  const getLocationNames = async () => {
    try {
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );

      setLocationNames(res.data);
    } catch (error) {}
  };

  const fetchAuditType = async () => {
    const res: any = await axios.get(`/api/auditPlan/getAllAuditType`);
    const data: any = res?.data?.map((value: any) => {
      return {
        id: value?._id,
        value: value?.auditType,
        scope: JSON.parse(value?.scope),
        planType: value?.planType,
        responsibility: value?.responsibility,
        system: value?.system,
      };
    });
    setSelectTableAuditType({ ...data[0] });
    setAuditTypeOptions([...data]);
  };

  // const data = [
  //   {
  //     entityName: "Rolling",
  //     totalPlanned: 6,
  //     totalScheduled: 0,
  //     totalCompleted: 0,
  //     findings: 0,
  //     months: [
  //       { month: "June", scheduled: "-", complete: "-" },
  //       { month: "July", scheduled: "-", complete: "-" },
  //       { month: "August", scheduled: "-", complete: "-" },
  //       { month: "September", scheduled: "-", complete: "-" },
  //       { month: "October", scheduled: "-", complete: "-" },
  //       { month: "November", scheduled: "-", complete: "-" },
  //     ],
  //   },
  //   {
  //     entityName: "sde",
  //     totalPlanned: 6,
  //     totalScheduled: 0,
  //     totalCompleted: 0,
  //     findings: 0,
  //     months: [
  //       { month: "June", scheduled: "-", complete: "-" },
  //       { month: "July", scheduled: "-", complete: "-" },
  //       { month: "August", scheduled: "-", complete: "-" },
  //       { month: "September", scheduled: "-", complete: "-" },
  //       { month: "October", scheduled: "-", complete: "-" },
  //       { month: "November", scheduled: "-", complete: "-" },
  //     ],
  //   },
  // ];
  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
    // setAuditPlanYear(currentyear);
  };
  const columns: ColumnsType<any> = [
    { title: "Entity Name", dataIndex: "entityName", key: "entityName" },
    { title: "Planned", dataIndex: "totalPlanned", key: "totalPlanned" },
    { title: "Scheduled", dataIndex: "totalScheduled", key: "totalScheduled" },
    { title: "Completed", dataIndex: "totalCompleted", key: "totalCompleted" },
    { title: "Findings", dataIndex: "findings", key: "findings" },
  ];

  const expandedRowRender = (record: any) => {
    const monthColumns: ColumnsType<any> = [
      { title: "Month", dataIndex: "month", key: "month" },
      { title: "Scheduled", dataIndex: "scheduled", key: "scheduled" },
      { title: "Complete", dataIndex: "complete", key: "complete" },
    ];

    return (
      <Table
        columns={monthColumns}
        dataSource={record.months}
        pagination={false}
        rowKey="month"
      />
    );
  };

  return (
    <div className={classes.root}>
      <SingleFormWrapper
        parentPageLink="/audit"
        backBtn={false}
        disableFormFunction={true}
        label={"Audit Report"}
      >
        <Box
          className={classes.searchContainer}
          style={{ marginTop: matches ? "10px" : "20px" }}
        >
          <div
            style={{
              display: matches ? "flex" : "grid",
              justifyContent: "space-between",
              alignItems: "center",
              gap: matches ? "10px" : "10px",
              paddingTop: "5px",
              paddingLeft: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <div className={newClasses.dropdownLabel}>Type : </div>
                <FormControl variant="outlined" size="small" fullWidth>
                  <div style={{}}>
                    <Autocomplete
                      id="type-autocomplete"
                      className={newClasses.compactAutocomplete}
                      options={auditTypeOptions}
                      getOptionLabel={(option: any) => option.value || ""}
                      getOptionSelected={(option: any, value) =>
                        option.id === value.id
                      }
                      value={selectTableAuditType}
                      onChange={(e: any, value: any) => {
                        setSelectTableAuditType(value);
                        setSelected(!!value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          placeholder="Select type"
                          fullWidth
                          className={
                            selected
                              ? newClasses.filledInput
                              : newClasses.placeholderInput
                          }
                        />
                      )}
                    />
                  </div>
                </FormControl>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: "10px",
                }}
              >
                <div className={newClasses.dropdownLabel}>Unit : </div>
                <FormControl variant="outlined" size="small" fullWidth>
                  <div style={{}}>
                    <Autocomplete
                      id="unit-autocomplete"
                      className={newClasses.compactAutocomplete}
                      options={locationNames}
                      getOptionLabel={(option) => option.locationName || ""}
                      getOptionSelected={(option, value) =>
                        option.id === value.id
                      }
                      value={selectedLocation}
                      onChange={handleChangeList}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          placeholder="Select unit"
                          fullWidth
                          className={
                            selectedUnit
                              ? newClasses.filledInput
                              : newClasses.placeholderInput
                          }
                        />
                      )}
                    />
                  </div>
                </FormControl>
              </div>
              <div>
                <YearComponent
                  currentYear={currentYear}
                  setCurrentYear={setCurrentYear}
                />
              </div>
            </div>
          </div>
        </Box>

        {/* Ant Design Table */}
        <Table
          columns={columns}
          dataSource={data}
          expandable={{ expandedRowRender }}
          pagination={false}
          rowKey="entityName"
          style={{ marginTop: 24 }}
        />
      </SingleFormWrapper>
    </div>
  );
};

export default AuditReportHomePage;
