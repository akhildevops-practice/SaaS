import React, { useEffect, useState } from "react";
import { Table, Switch, Input, Button } from "antd";
import {
  MdDelete,
  MdEdit,
  MdOutlineInfo,
  MdSearch,
  MdOutlineContactSupport,
  MdSend,
} from "react-icons/md";
import { useSnackbar } from "notistack";
import axios from "apis/axios.global";
import { makeStyles, Theme } from "@material-ui/core";
import checkRoles from "utils/checkRoles";
import { ColumnsType } from "antd/es/table";
const useStyles = makeStyles<Theme>((theme: Theme) => ({
  tableContainer: {
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
      height: "50px", // Set the height of the table cells
    },
    // "& tr.ant-table-row:nth-child(odd)": {
    //   backgroundColor: "#F5F5F5", // Odd row color
    // },
    // "& tr.ant-table-row:nth-child(even)": {
    //   backgroundColor: "#FFFFFF", // Even row color
    // },
  },
  root: {
    width: "100%",
  },
  tableContainerScrollable: {
    marginBottom: "20px", // Adjust the value as needed
    maxHeight: "calc(85vh - 20vh)", // Adjust the max-height value as needed
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
  documentTable: {
    // overflowX: "auto",
    // "&::-webkit-scrollbar": {
    //   width: "5px",
    //   height: "10px", // Adjust the height value as needed
    //   backgroundColor: "white",
    // },
    height: "100%",
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  textIconContainer: {},

  docNavIconStyle: {
    width: "21px",
    height: "22px",
    // fill : "white",
    // paddingRight: "6px",
    cursor: "pointer",
  },
  docNavDivider: {
    top: "0.54em",
    height: "1.5em",
    background: "black",
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
  docNavText: {
    fontSize: "16px",
    letterSpacing: "0.3px",
    lineHeight: "24px",
    textTransform: "capitalize",
    marginLeft: "5px",
    fontWeight: 600,
  },
  docNavRightFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "left",
    marginLeft: "auto",
  },
  selectedTab: {
    color: "#334D6E",
  },
  header: {
    display: "flex",
    alignItems: "left",
  },
  moduleHeader: {
    color: "#000",
    fontSize: "24px",
    // fontFamily: "Poppins, sans-serif",
    lineHeight: "24px",
    paddingLeft: "6px",
  },
  modal: {
    "&.ant-modal .ant-modal-content": {
      padding: "0px 0px 10px 0px",
    },
  },
  summaryRoot: {
    display: "flex",
    padding: "0px 16px",
    minHeight: 30,

    fontSize: "17px",
    "& .MuiAccordionSummary-content": {
      margin: 0,
    },
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "5px 0px",
      minHeight: "10px",
    },
    "&.MuiButtonBase-root .MuiAccordionSummary-root .Mui-expanded": {
      minHeight: "10px",
    },
    "&.MuiAccordionSummary-root": {
      minHeight: "30px",
    },
  },
  headingRoot: {
    minHeight: 30,
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "10px 0px",
      minHeight: "30px",
    },
    "&.MuiAccordionSummary-root.Mui-expanded": {
      minHeight: "30px",
      margin: "10px 0px",
    },
  },
}));
const RCA: React.FC = () => {
  // Table Data
  const [data, setData] = useState([
    { key: "", unit: "", analysisType: "Basic" },
  ]);
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const [search, setSearch] = useState<any>("");
  const [searchText, setSearchText] = useState<any>("");
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [myUnit, setMyUnit] = useState<boolean>(false);
  const isMCOE = checkRoles("ORG-ADMIN") && userDetails?.location?.id;
  const isMR = checkRoles("MR");
  useEffect(() => {
    if (!!userDetails) {
      getAllLocations();
    }
  }, []);
  useEffect(() => {
    if (!!userDetails) {
      getAllLocations();
    }
  }, [searchText, myUnit]);
  useEffect(() => {
    if (!!userDetails) {
      getAllLocations();
    }
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);

    if (value === "") {
      handleClearSearch();
    }
  };

  const getAllLocations = async () => {
    try {
      const [locationsRes, settingsRes] = await Promise.all([
        axios.get(
          `/api/mrm/getLocationsForOrg/${userDetails?.organization?.realmName}`
        ),
        axios.get(`/api/cara/getCaraRcaSettings`),
      ]);

      if (locationsRes?.status === 200 && settingsRes?.status === 200) {
        let locations = locationsRes.data || [];
        const settings = settingsRes.data || [];

        if (myUnit) {
          locations = locations.filter(
            (location: any) => location.id === userDetails.locationId
          );
        }

        if (searchText?.trim()) {
          locations = locations.filter((location: any) =>
            location.locationName
              ?.toLowerCase()
              .includes(searchText.toLowerCase())
          );
        }

        const settingsMap = new Map(
          settings.map((item: any) => [
            String(item["locationId"]),
            { analysisType: item?.analysisType, _id: item?._id },
          ])
        );

        const formattedData = locations.map((location: any, index: any) => {
          const setting: any = settingsMap.get(String(location.id));
          return {
            key: String(index + 1),
            unit: location?.locationName || `Unit ${index + 1}`,
            analysisType: setting ? setting.analysisType : "Basic",
            locationId: location?.id,
            organizationId: userDetails?.organizationId,
            _id: setting ? setting?._id : null,
          };
        });

        setData(formattedData);
      } else {
        enqueueSnackbar("Error in fetching locations or settings", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch data", { variant: "error" });
    }
  };

  const handleClearSearch = () => {
    setSearchText(""); // Clear search input
    // setSearchTextResetState(true);
  };

  // Toggle handler
  const handleToggle = async (key: string, checked: boolean) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.key === key
          ? { ...item, analysisType: checked ? "Advanced" : "Basic" }
          : item
      )
    );

    const updatedItem: any = data?.find((item) => item.key === key);
    if (!updatedItem) return;
    // console.log("updatedItem", updatedItem);
    const payload = {
      locationId: updatedItem.locationId,
      analysisType: checked ? "Advanced" : "Basic",
      organizationId: userDetails?.organizationId,
    };
    if (isMCOE) {
      try {
        if (updatedItem._id) {
          await axios.put(
            `/api/cara/updateCaraRcaSettings/${updatedItem._id}`,
            payload
          );
        } else {
          const res = await axios.post(
            `/api/cara/createCaraRcaSettings`,
            payload
          );

          if (res.status === 200 || res.status === 201) {
            setData((prevData) =>
              prevData.map((item) =>
                item.key === key ? { ...item, _id: res.data._id } : item
              )
            );
          }
        }
      } catch (error) {
        console.error("Error updating analysis type:", error);
        enqueueSnackbar("Failed to update analysis type", { variant: "error" });
      }
    } else {
      enqueueSnackbar("You are not authorized to Change RCA Settings", {
        variant: "error",
      });
    }
  };

  const handleSearch = () => {
    setSearchText(search);
    // setPage(1);
    // setSearchTextResetState(true);
  };

  const handleMyUnit = () => {
    setMyUnit(!myUnit);
  };

  // Table Columns
  const columns: ColumnsType<any> = [
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Analysis Type",
      dataIndex: "analysisType",
      key: "analysisType",
      align:"center",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px",justifyContent:"center" }}>
          <span>Basic</span>
          <Switch
            checked={record.analysisType === "Advanced"}
            onChange={(checked) => handleToggle(record.key, checked)}
            disabled={!isMCOE}
          />
          <span>Advanced</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
          }}
        >
          <Input
            size="small"
            style={{ marginRight: "20px", width: "20vw" }}
            allowClear
            placeholder="Search Here"
            // onChange={(event) => {
            //   setSearch(event.target.value);

            // }}
            onChange={handleInputChange}
            // value={searchText}
            prefix={<MdSearch />}
            suffix={
              <Button
                type="text"
                // className={classes.searchIcon}
                icon={<MdSend />}
                onClick={handleSearch}
              />
            }
          />

          <Button
            onClick={handleMyUnit}
            style={{
              backgroundColor: myUnit ? "rgb(14, 73, 122)" : "white",
              color: myUnit ? "white" : "black",
            }}
          >
            My Unit
          </Button>
        </div>
      </div>
      <div
        className={classes.tableContainerScrollable}
        style={{ marginTop: "20px",width:"50%" }}
      >
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          className={classes?.tableContainer}
        />
      </div>
    </>
  );
};

export default RCA;
