import React, { useEffect, useState } from "react";
import axios from "apis/axios.global";
import { makeStyles, Tooltip, useMediaQuery } from "@material-ui/core";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { MdCached } from 'react-icons/md';
import { MdArrowUpward } from 'react-icons/md';
import { MdArrowDownward } from 'react-icons/md';
import { MdSettingsEthernet } from 'react-icons/md';
import { MdOutlineInfo } from 'react-icons/md';
import { useSnackbar } from "notistack";
import { Modal } from "antd";

const useStyles = makeStyles({
  tooltip: {
    position: "absolute",

    backgroundColor: "#555",
    color: "#fff",
    textAlign: "center",
    borderRadius: "6px",
    padding: "1px",
    minWidth: "100px",
    maxWidth: "300px", // Adjust max width as needed
    pointerEvents: "none", // Ensure tooltip does not block mouse events
    transform: "translate(-50%, 10px)", // Offset from cursor
    visibility: "hidden",
    opacity: "0",
    transition: "opacity 0.3s",
    whiteSpace: "pre-wrap", // Allow multiline content
  },
  tooltipActive: {
    visibility: "visible",
    opacity: "1",
  },
  // Styles for the container
  tableContainer: {
    marginBottom: "20px",
    maxWidth: "100%",
    overflowX: "auto",
    display: "flex",
    alignItems: "flex-start", // Align items at the start of the cross axis
  },
  // Styles for the category table
  categoryTableWrapper: {
    overflowY: "auto", // Add vertical scrolling if needed
  },
  categoryTable: {
    borderCollapse: "collapse",
    width: "100%",
    border: "1px solid #E8f3f9",
    borderSpacing: 0,
    // boxShadow: "grey",
  },
  categoryTableHeaderCell: {
    backgroundColor: "#E8f3f9 ",
    padding: "12px",
    textAlign: "left",
    border: "1px solid #E8f3f9",
    width: "30px",
    color: "#00224e",
  },
  categoryTableCell: {
    padding: "8px",
    textAlign: "left",
    border: "1px solid #E8f3f9",
    // border:"none",
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    backgroundColor: "white ",
    whiteSpace: "nowrap",
    "&:hover": {
      overflow: "visible",

      zIndex: 1,
    },
  },
  inputValueCell: {
    padding: "5px",
    textAlign: "center",
    backgroundColor: "white ",
    border: "1px solid #E8f3f9",
    // border:"none",
    width: "30px",
  },
  categoryInputTableHeaderCell: {
    backgroundColor: "#E8f3f9 ",
    padding: "8px",
    textAlign: "left",
    border: "1px solid #ddd",
    color: "#00224e",
    // border:"none",
    width: "30px",
  },
  // Styles for the historical data table
  historyTableWrapper: {
    flex: "1",
    overflowX: "auto", // Add horizontal scrolling
  },
  historyTable: {
    borderCollapse: "collapse",
    width: "auto", // Remove maxWidth
    tableLayout: "auto", // Allow table to adjust column widths
    // maxWidth: "100%",
    border: "1px solid #E8f3f9",
    borderSpacing: 0,
    overflowX: "auto",
  },
  historyTableHeaderCell: {
    backgroundColor: "#E8f3f9 ",
    minWidth: "50px",
    maxWidth: "200px",
    paddingRight: "8px",
    textAlign: "left",
    border: "1px solid #E8f3f9",
    color: "#00224e",
  },
  historyTableHeaderCellSticky: {
    position: "sticky",
    zIndex: 2,
    backgroundColor: "#E8f3f9 ",
    border: "1px solid #E8f3f9", // Ensure background color is set for sticky cells
  },
  stickyColumn1: {
    left: 0,
  },
  stickyColumn2: {
    left: "50px", // Adjust based on actual width of first column
  },
  stickyColumn3: {
    left: "100px", // Adjust based on actual width of first and second columns
  },
  historyTableCell: {
    padding: "20px",
    paddingLeft: "5px",

    textAlign: "left",
    backgroundColor: "white ",
    paddingRight: "5px",
    // wordBreak: "break-all",
    border: "1px solid #E8f3f9",
    paddingBottom: "5px",
  },
});

type Props = {
  reportValues: any;
  setReportValues: any;
  catId: string;
  cols: any[];
  reportStatus: string;
  read: any;
  selectedOption?: any;
};

function AdhocReportDesignContainer({
  reportValues,
  setReportValues,
  catId,
  cols,
  reportStatus,
  read,
  selectedOption,
}: Props) {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [categoryData, setCategoryData] = useState<any>([]);
  const [showHistoricData, setShowHistoricData] = useState(true);
  const [historicData, setHistoricData] = useState<any[]>([]);
  const [shownTargets, setShownTargets] = useState<Set<string>>(new Set());
  const years: any = historicData
    ? historicData?.flatMap((item: any) =>
        item?.previous?.map((pd: any) => pd.kpiYear)
      )
    : [];
  const uniqueYears = [...new Set(years)].sort();
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [emptyTargetsKPIs, setEmptyTargetsKPIs] = useState([]); // Store the KPIs with empty targets
  const [openModal, setOpenModal] = useState(false);
  // console.log("selected option in edit", reportValues);
  const [hoveredCell, setHoveredCell] = useState<{
    rowIndex: number | null;
    monthIndex: number | null;
  } | null>(null);

  // Handle mouse enter event
  const handleMouseEnter = (rowIndex: number, monthIndex: number) => {
    setHoveredCell({ rowIndex, monthIndex });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };
  useEffect(() => {
    const filteredCategory = reportValues?.categories.find(
      (cat: any) => cat.catInfo?._id === catId
    );

    if (filteredCategory) {
      const newCategoryData = filteredCategory?.kpiInfo
        ? filteredCategory?.kpiInfo
        : filteredCategory.catData;

      // Set the new category data
      setCategoryData(newCategoryData);

      setShownTargets(new Set());
      const emptyTargets: any = [];

      newCategoryData.forEach((rowData: any) => {
        if (!rowData?.kpiTarget && !shownTargets.has(rowData._id)) {
          // Add KPI name to the emptyTargets array
          emptyTargets.push(rowData?.kpiName);
          setShownTargets((prev) => new Set(prev).add(rowData._id)); // Mark this row as shown
        }
      });

      if (emptyTargets.length > 0) {
        setEmptyTargetsKPIs(emptyTargets);
        setOpenModal(true);
      }
    }
  }, [reportValues, catId]);
  const handleCloseModal = () => {
    setEmptyTargetsKPIs([]);
    setOpenModal(false);
  };
  //before modal for empty target kpis
  // useEffect(() => {
  //   const filteredCategory = reportValues?.categories.find(
  //     (cat: any) => cat.catInfo?._id === catId
  //   );
  //   if (filteredCategory) {
  //     setCategoryData(
  //       filteredCategory?.kpiInfo
  //         ? filteredCategory?.kpiInfo
  //         : filteredCategory.catData
  //     );
  //   }

  // }, [reportValues, catId]);
  // console.log("reportvalues useeffect", reportValues);
  useEffect(() => {
    if (
      showHistoricData &&
      (!!selectedOption || reportValues.reportFrequency)
    ) {
      // console.log("selected options", selectedOption, showHistoricData, catId);
      getHistoryData();
    }
  }, [catId, showHistoricData]);
  // console.log("reportvalues", reportValues);

  const getHistoryData = async () => {
    // console.log("getHistory called");
    try {
      let res: any;
      if (
        selectedOption === "Monthly" ||
        reportValues?.reportFrequency === "Monthly"
      ) {
        res = await axios.get(
          `/api/kpi-report/getHistoricDataForMonth/${catId}/${reportValues.entity}`
        );
      } else if (
        selectedOption === "Quarterly" ||
        reportValues?.reportFrequency === "Quarterly"
      ) {
        res = await axios.get(
          `/api/kpi-report/getHistoricDataForQuarter/${catId}/${reportValues.entity}`
        );
      } else if (
        selectedOption === "Daily" ||
        reportValues?.reportFrequency === "Daily"
      ) {
        res = await axios.get(
          `/api/kpi-report/getHistoricDataForDaily/${catId}/${reportValues.entity}`
        );
      } else if (
        selectedOption === "Half-Yearly" ||
        reportValues?.reportFrequency === "Half-Yearly"
      ) {
        res = await axios.get(
          `/api/kpi-report/getHistoricDataForHalfYear/${catId}/${reportValues.entity}`
        );
      }
      if (res?.data) {
        // console.log("hisoric data", res?.data);
        setHistoricData(res?.data);
      } else {
        setHistoricData([]);
      }
    } catch (error) {
      console.error("Error fetching historic data:", error);
    }
  };
  // console.log("categoryData", categoryData);
  // const handleEdit = (index: number, key: string, value: string) => {
  //   console.log("index", index, key, value);
  //   setReportValues((prev: any) => {
  //     const updatedCategories = prev.categories?.map((prevCat: any) => {
  //       console.log("prevCat", prevCat);
  //       if (prevCat.catInfo?._id === catId) {
  //         console.log("inside if");
  //         const updatedKpiInfo = prevCat.kpiInfo?.map(
  //           (rowData: any, idx: any) => {
  //             console.log("idx in updatedkpiinfo", idx, rowData, index);
  //             if (idx === index) {
  //               return { ...rowData, [key]: value };
  //             }
  //             return rowData;
  //           }
  //         );
  //         return { ...prevCat, kpiInfo: updatedKpiInfo };
  //       }
  //       return prevCat;
  //     });
  //     return { ...prev, categories: updatedCategories };
  //   });
  // };
  const handleEdit = (index: number, key: string, value: string) => {
    setReportValues((prev: any) => {
      const updatedCategories = prev.categories?.map((prevCat: any) => {
        if (prevCat.catInfo?._id === catId) {
          // Clone the kpiInfo array to avoid mutating original state
          const updatedKpiInfo = [...prevCat.kpiInfo];

          // Update the specific kpiInfo object at the given index
          updatedKpiInfo[index] = {
            ...updatedKpiInfo[index],
            [key]: value,
          };

          return { ...prevCat, kpiInfo: updatedKpiInfo };
        }
        return prevCat;
      });

      return { ...prev, categories: updatedCategories };
    });
  };

  const renderIcon = (rowData: any) => {
    switch (rowData?.kpiTargetType) {
      case "Increase":
        return (
          <Tooltip title="Target Type = Increase" placement="bottom">
            <MdArrowUpward
              style={{
                verticalAlign: "middle",
                color: "#00224e",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            />
          </Tooltip>
        );
      case "Decrease":
        return (
          <Tooltip title="Target Type = Decrease" placement="bottom">
            <MdArrowDownward
              style={{
                verticalAlign: "middle",
                marginLeft: "4px",
                color: "#00224e",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            />
          </Tooltip>
        );
      case "Maintain":
        return (
          <Tooltip title="Target Type = Maintain" placement="bottom">
            <MdCached
              style={{
                verticalAlign: "middle",
                marginLeft: "4px",
                color: "#00224e",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            />
          </Tooltip>
        );
      case "Range":
        return (
          <Tooltip title="Target Type = Range" placement="bottom">
            <MdSettingsEthernet
              style={{
                verticalAlign: "middle",
                marginLeft: "4px",
                color: "#00224e",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            />
          </Tooltip>
        );
      default:
        return null;
    }
  };
  const formatDate = (dateString: any) => {
    const options: any = { day: "2-digit", month: "2-digit" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", options).replace(/\//g, "-");
  };

  const months = [
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
  const shouldShowOpColumn = categoryData?.some((row: any) => row?.op === true);
  return (
    <div className={classes.tableContainer}>
      <div className={classes.categoryTableWrapper}>
        {categoryData && (
          <table className={classes.categoryTable}>
            <thead>
              <tr>
                <th className={classes.categoryTableHeaderCell}>KPI</th>
                <th className={classes.categoryTableHeaderCell}>UOM</th>
                <th className={classes.categoryTableHeaderCell}>PnB</th>
                {shouldShowOpColumn && (
                  <th className={classes.categoryTableHeaderCell}>OP</th>
                )}
                <th className={classes.categoryTableHeaderCell}>Value</th>
                <th className={classes.categoryTableHeaderCell}>Comments</th>
                {/* <th className={classes.categoryTableHeaderCell}>
               <Tooltip title="Click to view history">
                 <MdHistory
                   onClick={() => setShowHistoricData(!showHistoricData)}
                   style={{ cursor: "pointer" }}
                 />
               </Tooltip>
             </th> */}
              </tr>
            </thead>
            <tbody>
              {categoryData?.map((rowData: any, index: any) => {
                const matchingHistoricData = historicData.find(
                  (historic) => historic.id === rowData._id
                );
                const isUserOwner = rowData.owner
                  ? rowData?.owner?.some(
                      (owner: any) => owner.id === userDetails.id
                    )
                  : true;

                return (
                  <tr key={index}>
                    <td
                      className={classes.categoryTableCell}
                      style={{
                        width: "100px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={rowData?.kpi?.label || rowData?.kpiName}
                    >
                      {rowData?.kpi?.label || rowData?.kpiName}
                    </td>
                    <td className={classes.categoryTableCell}>
                      {rowData?.uom || rowData?.kpiUOM}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: "8px",
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rowData?.kpiMinimumTarget
                        ? rowData?.kpiMinimumTarget + "-" + rowData?.kpiTarget
                        : rowData?.kpiTarget}
                      {renderIcon(rowData)}
                    </td>
                    {shouldShowOpColumn ? (
                      <td className={classes.inputValueCell}>
                        {rowData?.op === true ? (
                          <input
                            type="text"
                            value={
                              rowData.kpiOperationalTarget
                                ? rowData.kpiOperationalTarget
                                : rowData.kpiTarget
                            }
                            maxLength={10}
                            disabled={read || !isUserOwner}
                            style={{
                              width: "60px",
                              height: "25px",
                              textAlign: "center",
                            }}
                            onChange={(e) =>
                              handleEdit(
                                index,
                                "kpiOperationalTarget",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span style={{ visibility: "hidden" }}>N/A</span> // Optionally hide or show some placeholder
                        )}
                      </td>
                    ) : null}
                    <td className={classes.inputValueCell}>
                      <input
                        type="text"
                        value={rowData.kpiValue ? rowData.kpiValue : ""}
                        maxLength={10}
                        disabled={read || !isUserOwner}
                        style={{
                          width: "60px",
                          height: "25px",
                          textAlign: "center",
                        }}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          handleEdit(index, "kpiValue", e.target.value);
                        }}
                      />
                    </td>
                    <td className={classes.categoryTableCell}>
                      <textarea
                        style={{ height: "25px", width: "150px" }}
                        value={rowData.kpiComments ? rowData.kpiComments : ""}
                        disabled={read || !isUserOwner}
                        onChange={(e) => {
                          handleEdit(index, "kpiComments", e.target.value);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showHistoricData && selectedOption === "Monthly" && (
        <div className={classes.historyTableWrapper}>
          <table className={classes.historyTable}>
            <thead>
              <tr>
                {/* Header for years, merging cells for PnB and Actual */}
                <th
                  className={classes.historyTableHeaderCell}
                  colSpan={2}
                  style={{ position: "sticky" }}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${
                      historicData[0]?.previousYear2?.kpiYear
                        ? historicData[0]?.previousYear2?.kpiYear
                        : ""
                    }`}</div>
                  </div>
                </th>
                <th
                  className={classes.historyTableHeaderCell}
                  colSpan={2}
                  style={{ position: "sticky" }}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${
                      historicData[0]?.previousYear1?.kpiYear
                        ? historicData[0]?.previousYear1?.kpiYear
                        : ""
                    }`}</div>
                  </div>
                </th>
                {historicData[0]?.currentYearData && (
                  <th
                    className={classes.historyTableHeaderCell}
                    colSpan={2}
                    style={{ position: "sticky" }}
                  >
                    <div style={{ fontSize: "90%", textAlign: "center" }}>
                      <div>
                        {`${historicData[0]?.currentYearData?.kpiYear}`}(YTD)
                      </div>
                    </div>
                  </th>
                )}
                {historicData[0]?.kpidatamonthwise
                  .sort((a: any, b: any) => a.kpiMonthYear - b.kpiMonthYear)
                  .map((monthData: any, monthIndex: any) => (
                    <th
                      className={classes.historyTableHeaderCell}
                      colSpan={2}
                      key={monthIndex}
                    >
                      <div style={{ fontSize: "90%", textAlign: "center" }}>
                        <div>{`${months[monthData.kpiMonthYear]}
                        `}</div>
                      </div>
                    </th>
                  ))}
              </tr>
              <tr>
                {/* Header for PnB and Actual */}
                {Array.from({
                  length:
                    (historicData[0]?.kpidatamonthwise.length || 0) +
                    2 +
                    (historicData[0]?.currentYearData ? 1 : 0),
                }).map((_, index) => (
                  <React.Fragment key={index}>
                    <th
                      className={classes.historyTableHeaderCell}
                      style={{ textAlign: "center" }}
                    >
                      PnB
                    </th>
                    <th
                      className={classes.historyTableHeaderCell}
                      style={{ textAlign: "center" }}
                    >
                      Actual
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {historicData.map((data, index) => (
                <tr key={index}>
                  <td className={classes.historyTableCell}>
                    {data.displayType === "AVERAGE"
                      ? data.previousYear2?.targetAverage !== undefined &&
                        data.previousYear2?.targetAverage !== null
                        ? data.previousYear2?.targetAverage === 0
                          ? "0.00"
                          : data.previousYear2?.targetAverage?.toFixed(2)
                        : ""
                      : data.previousYear2?.totalQuarterTarget !== undefined &&
                        data.previousYear2?.totalQuarterTarget !== null
                      ? data.previousYear2?.totalQuarterTarget === 0
                        ? "0.00"
                        : data.previousYear2?.totalQuarterTarget.toFixed(2)
                      : ""}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data.displayType === "AVERAGE"
                      ? data.previousYear2?.averageQuarterAverage !==
                          undefined &&
                        data.previousYear2?.averageQuarterAverage !== null
                        ? data.previousYear2?.averageQuarterAverage === 0
                          ? "0.00"
                          : data.previousYear2?.averageQuarterAverage?.toFixed(
                              2
                            )
                        : ""
                      : data.previousYear2?.totalQuarterSum !== undefined &&
                        data.previousYear2?.totalQuarterSum !== null
                      ? data.previousYear2?.totalQuarterSum === 0
                        ? "0.00"
                        : data.previousYear2?.totalQuarterSum.toFixed(2)
                      : ""}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data.displayType === "AVERAGE"
                      ? data.previousYear1?.targetAverage !== undefined &&
                        data.previousYear1?.targetAverage !== null
                        ? data.previousYear1?.targetAverage === 0
                          ? "0.00"
                          : data.previousYear1?.targetAverage?.toFixed(2)
                        : ""
                      : data.previousYear1?.totalQuarterTarget !== undefined &&
                        data.previousYear1?.totalQuarterTarget !== null
                      ? data.previousYear1?.totalQuarterTarget === 0
                        ? "0.00"
                        : data.previousYear1?.totalQuarterTarget?.toFixed(2)
                      : ""}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data.displayType === "AVERAGE"
                      ? data.previousYear1?.averageQuarterAverage !==
                          undefined &&
                        data.previousYear1?.averageQuarterAverage !== null
                        ? data.previousYear1?.averageQuarterAverage === 0
                          ? "0.00"
                          : data.previousYear1?.averageQuarterAverage?.toFixed(
                              2
                            )
                        : ""
                      : data.previousYear1?.totalQuarterSum !== undefined &&
                        data.previousYear1?.totalQuarterSum !== null
                      ? data.previousYear1?.totalQuarterSum === 0
                        ? "0.00"
                        : data.previousYear1?.totalQuarterSum?.toFixed(2)
                      : ""}
                  </td>
                  {data.currentYearData && (
                    <>
                      <td className={classes.historyTableCell}>
                        {data.displayType === "AVERAGE"
                          ? data.currentYearData?.targetAverage != null // Checks for both `undefined` and `null`
                            ? data.currentYearData.targetAverage === 0
                              ? "0.00"
                              : data.currentYearData.targetAverage.toFixed(2)
                            : ""
                          : data.currentYearData?.totalQuarterTarget != null // Checks for both `undefined` and `null`
                          ? data.currentYearData.totalQuarterTarget === 0
                            ? "0.00"
                            : data.currentYearData.totalQuarterTarget.toFixed(2)
                          : ""}
                      </td>
                      <td className={classes.historyTableCell}>
                        {data.displayType === "AVERAGE"
                          ? data.currentYearData?.averageQuarterAverage != null // Checks for both `undefined` and `null`
                            ? data.currentYearData.averageQuarterAverage === 0
                              ? "0.00"
                              : data.currentYearData.averageQuarterAverage.toFixed(
                                  2
                                )
                            : "0.00"
                          : data.currentYearData?.totalQuarterSum != null // Checks for both `undefined` and `null`
                          ? data.currentYearData.totalQuarterSum === 0
                            ? "0.00"
                            : data.currentYearData.totalQuarterSum.toFixed(2)
                          : ""}
                      </td>
                    </>
                  )}

                  {/* {data.kpidatamonthwise
                    .sort((a: any, b: any) => a.kpiMonthYear - b.kpiMonthYear)
                    .map((monthData: any, monthIndex: any) => (
                      <React.Fragment key={monthIndex}>
                        <td className={classes.historyTableCell}>
                          {monthData.monthlyTarget
                            ? monthData.monthlyTarget?.toFixed(2)
                            : ""}
                        </td>
                        <td className={classes.historyTableCell}>
                          {monthData.monthlySum
                            ? monthData.monthlySum.toFixed(2)
                            : ""}
                        </td>
                      </React.Fragment>
                    ))} */}

                  {data.kpidatamonthwise
                    .sort((a: any, b: any) => a.kpiMonthYear - b.kpiMonthYear)
                    .map((monthData: any, monthIndex: any) => (
                      <React.Fragment key={monthIndex}>
                        <td className={classes.historyTableCell}>
                          {/* {monthData.monthlyTarget !== undefined &&
                          monthData.monthlyTarget !== null
                            ? monthData.monthlyTarget === 0
                              ? "0.00"
                              : monthData.monthlyTarget.toFixed(2)
                            : ""} */}
                          {data?.kpiType === "Range"
                            ? `${
                                monthData?.monthlyMinimumTarget !== undefined &&
                                monthData?.monthlyMinimumTarget !== null
                                  ? monthData?.monthlyMinimumTarget === 0
                                    ? "0.00"
                                    : monthData?.monthlyMinimumTarget?.toFixed(
                                        2
                                      )
                                  : ""
                              } - ${
                                monthData.monthlyTarget !== undefined &&
                                monthData.monthlyTarget !== null
                                  ? monthData.monthlyTarget === 0
                                    ? "0.00"
                                    : monthData.monthlyTarget.toFixed(2)
                                  : ""
                              }`
                            : monthData.monthlyTarget !== undefined &&
                              monthData.monthlyTarget !== null
                            ? monthData.monthlyTarget === 0
                              ? "0.00"
                              : monthData.monthlyTarget.toFixed(2)
                            : ""}
                        </td>
                        <td
                          className={classes.historyTableCell}
                          onMouseEnter={() =>
                            handleMouseEnter(index, monthIndex)
                          }
                          onMouseLeave={handleMouseLeave}
                        >
                          {monthData.monthlySum !== undefined &&
                          monthData.monthlySum !== null
                            ? monthData.monthlySum === 0
                              ? "0.00"
                              : monthData.monthlySum.toFixed(2)
                            : ""}
                          {monthData.kpiComments !== "" &&
                            monthData.kpiComments !== null && (
                              <Tooltip
                                title={monthData.kpiComments}
                                placement="bottom"
                                arrow
                                open={
                                  hoveredCell?.rowIndex === index &&
                                  hoveredCell?.monthIndex === monthIndex
                                }
                              >
                                <MdOutlineInfo
                                  style={{
                                    fontSize: "10px",
                                    color: "#00224e",
                                    // position: "absolute",
                                    verticalAlign: "super", // Ensures the icon is rendered as a superscript
                                    cursor: "pointer", // Optional: add cursor style for interaction
                                  }}
                                />
                              </Tooltip>
                            )}
                        </td>
                      </React.Fragment>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* {showHistoricData && selectedOption === "Quarterly" && (
        <div className={classes.historyTableWrapper}>
          <table className={classes.historyTable}>
            <thead>
              <tr>
              
                <th
                  className={classes.historyTableHeaderCell}
                  colSpan={2}
                  style={{ position: "sticky" }}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${historicData[0]?.previousYear2.kpiYear}
                     `}</div>
                    <div>
                      <span style={{ fontWeight: "bold" }}>PnB</span>{" "}
                      <span
                        style={{ margin: "0 5px", color: "rgb(0, 48, 89)" }}
                      >
                        |
                      </span>
                      <span style={{ fontWeight: "bold" }}>Actual</span>
                    </div>
                  </div>
                </th>

                <th
                  className={classes.historyTableHeaderCell}
                  colSpan={2}
                  style={{ position: "sticky" }}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${historicData[0]?.previousYear1.kpiYear}
                     `}</div>
                    <div>
                      <span style={{ fontWeight: "bold" }}>PnB</span>{" "}
                      <span
                        style={{ margin: "0 5px", color: "rgb(0, 48, 89)" }}
                      >
                        |
                      </span>
                      <span style={{ fontWeight: "bold" }}>Actual</span>
                    </div>
                  </div>
                </th>

                {historicData[0]?.currentYearData && (
                  <th
                    className={classes.historyTableHeaderCell}
                    colSpan={2}
                    style={{ position: "sticky" }}
                  >
                    <div style={{ fontSize: "90%", textAlign: "center" }}>
                      <div>{`${historicData[0]?.currentYearData?.kpiYear}
                     `}</div>
                      <div>
                        <span style={{ fontWeight: "bold" }}>PnB</span>
                        <span
                          style={{ margin: "0 5px", color: "rgb(0, 48, 89)" }}
                        >
                          |
                        </span>
                        <span style={{ fontWeight: "bold" }}>YTD</span>
                      </div>
                    </div>
                  </th>
                )}

                {historicData[0]?.kpidata?.map(
                  (quarterData: any, quarterIndex: number) => (
                   
                    <th
                      className={classes.historyTableHeaderCell}
                      colSpan={2}
                      key={quarterIndex}
                    >
                      <div style={{ fontSize: "90%", textAlign: "center" }}>
                        <div>{`Q${quarterData.kpiPeriod}-${quarterData.kpiYear}`}</div>
                        <div>
                          <span style={{ fontWeight: "bold" }}>PnB</span>{" "}
                          <span
                            style={{ margin: "0 5px", color: "rgb(0, 48, 89)" }}
                          >
                            |
                          </span>
                          <span style={{ fontWeight: "bold" }}>Actual</span>
                        </div>
                      </div>
                    </th>
                  )
                )}
              </tr>
            </thead>
           
            <tbody>{renderQuarterTableData(historicData, uniqueYears)}</tbody>
          </table>
        </div>
      )} */}
      {showHistoricData && selectedOption === "Quarterly" && (
        <div className={classes.historyTableWrapper}>
          <table className={classes.historyTable}>
            <thead>
              <tr>
                {/* Header for years, merging cells for PnB and Actual */}
                <th
                  className={classes.historyTableHeaderCell}
                  colSpan={2}
                  style={{ position: "sticky" }}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${
                      historicData[0]?.previousYear2?.kpiYear
                        ? historicData[0]?.previousYear2?.kpiYear
                        : ""
                    }`}</div>
                  </div>
                </th>
                <th
                  className={classes.historyTableHeaderCell}
                  colSpan={2}
                  style={{ position: "sticky" }}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${
                      historicData[0]?.previousYear1?.kpiYear
                        ? historicData[0]?.previousYear1?.kpiYear
                        : ""
                    }`}</div>
                  </div>
                </th>
                {historicData[0]?.currentYearData && (
                  <th
                    className={classes.historyTableHeaderCell}
                    colSpan={2}
                    style={{ position: "sticky" }}
                  >
                    <div style={{ fontSize: "90%", textAlign: "center" }}>
                      <div>
                        {`${historicData[0]?.currentYearData?.kpiYear}`}(YTD)
                      </div>
                    </div>
                  </th>
                )}
                {historicData[0]?.kpidata
                  .sort((a: any, b: any) => a.kpiMonthYear - b.kpiMonthYear)
                  .map((monthData: any, monthIndex: any) => (
                    <th
                      className={classes.historyTableHeaderCell}
                      colSpan={2}
                      key={monthIndex}
                    >
                      <div style={{ fontSize: "90%", textAlign: "center" }}>
                        <div>{`Q${monthData.kpiPeriod}-${monthData.kpiYear}`}</div>
                      </div>
                    </th>
                  ))}
              </tr>
              <tr>
                {/* Header for PnB and Actual */}
                {Array.from({
                  length:
                    (historicData[0]?.kpidata?.length || 0) +
                    2 +
                    (historicData[0]?.currentYearData ? 1 : 0),
                }).map((_, index) => (
                  <React.Fragment key={index}>
                    <th
                      className={classes.historyTableHeaderCell}
                      style={{ textAlign: "center" }}
                    >
                      PnB
                    </th>
                    <th
                      className={classes.historyTableHeaderCell}
                      style={{ textAlign: "center" }}
                    >
                      Actual
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {historicData.map((data, index) => (
                <tr key={index}>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear2?.targetAverage !== undefined &&
                        data.previousYear2?.targetAverage !== null
                        ? data.previousYear2?.targetAverage === 0
                          ? "0.00"
                          : data.previousYear2?.targetAverage?.toFixed(2)
                        : ""
                      : data.previousYear2?.totalQuarterTarget !== undefined &&
                        data.previousYear2?.totalQuarterTarget !== null
                      ? data.previousYear2?.totalQuarterTarget === 0
                        ? "0.00"
                        : data.previousYear2?.totalQuarterTarget
                      : ""}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear2?.averageQuarterAverage !==
                          undefined &&
                        data.previousYear2?.averageQuarterAverage !== null
                        ? data.previousYear2?.averageQuarterAverage === 0
                          ? "0.00"
                          : data.previousYear2?.averageQuarterAverage?.toFixed(
                              2
                            )
                        : ""
                      : data.previousYear2?.totalQuarterSum !== undefined &&
                        data.previousYear2?.totalQuarterSum !== null
                      ? data.previousYear2?.totalQuarterSum === 0
                        ? "0.00"
                        : data.previousYear2?.totalQuarterSum.toFixed(2)
                      : ""}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear1?.targetAverage !== undefined &&
                        data.previousYear1?.targetAverage !== null
                        ? data.previousYear1?.targetAverage === 0
                          ? "0.00"
                          : data.previousYear1?.targetAverage?.toFixed(2)
                        : ""
                      : data.previousYear1?.totalQuarterTarget !== undefined &&
                        data.previousYear1?.totalQuarterTarget !== null
                      ? data.previousYear1?.totalQuarterTarget === 0
                        ? "0.00"
                        : data.previousYear1?.totalQuarterTarget?.toFixed(2)
                      : ""}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear1?.averageQuarterAverage !==
                          undefined &&
                        data.previousYear1?.averageQuarterAverage !== null
                        ? data.previousYear1?.averageQuarterAverage === 0
                          ? "0.00"
                          : data.previousYear1?.averageQuarterAverage?.toFixed(
                              2
                            )
                        : ""
                      : data.previousYear1?.totalQuarterSum !== undefined &&
                        data.previousYear1?.totalQuarterSum !== null
                      ? data.previousYear1?.totalQuarterSum === 0
                        ? "0.00"
                        : data.previousYear1?.totalQuarterSum?.toFixed(2)
                      : ""}
                  </td>
                  {data.currentYearData && (
                    <>
                      <td className={classes.historyTableCell}>
                        {data?.displayType === "AVERAGE"
                          ? data.currentYearData?.targetAverage !== undefined &&
                            data.currentYearData?.targetAverage !== null
                            ? data.currentYearData?.targetAverage === 0
                              ? "0.00"
                              : data.currentYearData?.targetAverage?.toFixed(2)
                            : ""
                          : data.currentYearData?.totalQuarterTarget !==
                              undefined &&
                            data.currentYearData?.totalQuarterTarget !== null
                          ? data.currentYearData?.totalQuarterTarget === 0
                            ? "0.00"
                            : data.currentYearData?.totalQuarterTarget?.toFixed(
                                2
                              )
                          : ""}
                      </td>
                      <td className={classes.historyTableCell}>
                        {data?.displayType === "AVERAGE"
                          ? data.currentYearData?.averageQuarterAverage !==
                              undefined &&
                            data.currentYearData?.averageQuarterAverage !== null
                            ? data.currentYearData?.averageQuarterAverage === 0
                              ? "0.00"
                              : data.currentYearData?.averageQuarterAverage?.toFixed(
                                  2
                                )
                            : ""
                          : data.currentYearData?.totalQuarterSum !==
                              undefined &&
                            data.currentYearData?.totalQuarterSum !== null
                          ? data.currentYearData?.totalQuarterSum === 0
                            ? "0.00"
                            : data.currentYearData?.totalQuarterSum?.toFixed(2)
                          : ""}
                      </td>
                    </>
                  )}
                  {data.kpidata
                    .sort((a: any, b: any) => a.kpiMonthYear - b.kpiMonthYear)
                    .map((monthData: any, monthIndex: any) => (
                      <React.Fragment key={monthIndex}>
                        <td className={classes.historyTableCell}>
                          {monthData?.totalQuarterTarget !== undefined &&
                          monthData?.totalQuarterTarget !== null
                            ? monthData?.totalQuarterTarget === 0
                              ? "0.00"
                              : monthData?.totalQuarterTarget.toFixed(2)
                            : ""}
                        </td>
                        <td
                          className={classes.historyTableCell}
                          onMouseEnter={() =>
                            handleMouseEnter(index, monthIndex)
                          }
                          onMouseLeave={handleMouseLeave}
                        >
                          {monthData?.totalQuarterSum
                            ? monthData?.totalQuarterSum?.toFixed(2)
                            : ""}
                          {monthData.kpiComments !== "" &&
                            monthData.kpiComments !== null && (
                              <Tooltip
                                title={monthData.kpiComments}
                                placement="bottom"
                                arrow
                                open={
                                  hoveredCell?.rowIndex === index &&
                                  hoveredCell?.monthIndex === monthIndex
                                }
                              >
                                <MdOutlineInfo
                                  style={{
                                    fontSize: "10px",
                                    color: "#00224e",
                                    // position: "absolute",
                                    verticalAlign: "super", // Ensures the icon is rendered as a superscript
                                    cursor: "pointer", // Optional: add cursor style for interaction
                                  }}
                                />
                              </Tooltip>
                            )}
                        </td>
                      </React.Fragment>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showHistoricData && selectedOption === "Daily" && (
        <div className={classes.historyTableWrapper}>
          <table className={classes.historyTable}>
            <thead>
              <tr>
                <th
                  className={classes.historyTableHeaderCell}
                  colSpan={2}
                  style={{ position: "sticky" }}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${
                      historicData[0]?.previousYear2?.kpiYear
                        ? historicData[0]?.previousYear2?.kpiYear
                        : ""
                    }`}</div>
                  </div>
                </th>
                <th
                  className={classes.historyTableHeaderCell}
                  colSpan={2}
                  style={{ position: "sticky" }}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${
                      historicData[0]?.previousYear1?.kpiYear
                        ? historicData[0]?.previousYear1?.kpiYear
                        : ""
                    }`}</div>
                  </div>
                </th>
                {historicData[0]?.currentYearData && (
                  <th
                    className={classes.historyTableHeaderCell}
                    colSpan={2}
                    style={{ position: "sticky" }}
                  >
                    <div style={{ fontSize: "90%", textAlign: "center" }}>
                      <div>
                        {`${historicData[0]?.currentYearData?.kpiYear}`}(YTD)
                      </div>
                    </div>
                  </th>
                )}
                {historicData[0]?.kpidatadaywise
                  .sort((a: any, b: any) => a.kpiMonthYear - b.kpiMonthYear)
                  .map((monthData: any, monthIndex: any) => (
                    <th
                      className={classes.historyTableHeaderCell}
                      colSpan={2}
                      key={monthIndex}
                    >
                      <div style={{ fontSize: "90%", textAlign: "center" }}>
                        <div>{formatDate(monthData.reportFor)}</div>
                      </div>
                    </th>
                  ))}
              </tr>
              <tr>
                {/* Header for PnB and Actual */}
                {Array.from({
                  length:
                    (historicData[0]?.kpidatadaywise?.length || 0) +
                    2 +
                    (historicData[0]?.currentYearData ? 1 : 0),
                }).map((_, index) => (
                  <React.Fragment key={index}>
                    <th
                      className={classes.historyTableHeaderCell}
                      style={{ textAlign: "center" }}
                    >
                      PnB
                    </th>
                    <th
                      className={classes.historyTableHeaderCell}
                      style={{ textAlign: "center" }}
                    >
                      Actual
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {historicData.map((data, index) => (
                <tr key={index}>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear2?.targetAverage !== undefined &&
                        data.previousYear2?.targetAverage !== null
                        ? data.previousYear2?.targetAverage === 0
                          ? "0.00"
                          : data.previousYear2?.targetAverage?.toFixed(2)
                        : ""
                      : data.previousYear2?.totalQuarterTarget !== undefined &&
                        data.previousYear2?.totalQuarterTarget !== null
                      ? data.previousYear2?.totalQuarterTarget === 0
                        ? "0.00"
                        : data.previousYear2?.totalQuarterTarget
                      : ""}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear2?.averageQuarterAverage !==
                          undefined &&
                        data.previousYear2?.averageQuarterAverage !== null
                        ? data.previousYear2?.averageQuarterAverage === 0
                          ? "0.00"
                          : data.previousYear2?.averageQuarterAverage?.toFixed(
                              2
                            )
                        : ""
                      : data.previousYear2?.totalQuarterSum !== undefined &&
                        data.previousYear2?.totalQuarterSum !== null
                      ? data.previousYear2?.totalQuarterSum === 0
                        ? "0.00"
                        : data.previousYear2?.totalQuarterSum.toFixed(2)
                      : ""}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear1?.targetAverage !== undefined &&
                        data.previousYear1?.targetAverage !== null
                        ? data.previousYear1?.targetAverage === 0
                          ? "0.00"
                          : data.previousYear1?.targetAverage?.toFixed(2)
                        : ""
                      : data.previousYear1?.totalQuarterTarget !== undefined &&
                        data.previousYear1?.totalQuarterTarget !== null
                      ? data.previousYear1?.totalQuarterTarget === 0
                        ? "0.00"
                        : data.previousYear1?.totalQuarterTarget?.toFixed(2)
                      : ""}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear1?.averageQuarterAverage !==
                          undefined &&
                        data.previousYear1?.averageQuarterAverage !== null
                        ? data.previousYear1?.averageQuarterAverage === 0
                          ? "0.00"
                          : data.previousYear1?.averageQuarterAverage?.toFixed(
                              2
                            )
                        : ""
                      : data.previousYear1?.totalQuarterSum !== undefined &&
                        data.previousYear1?.totalQuarterSum !== null
                      ? data.previousYear1?.totalQuarterSum === 0
                        ? "0.00"
                        : data.previousYear1?.totalQuarterSum?.toFixed(2)
                      : ""}
                  </td>
                  {data.currentYearData && (
                    <>
                      <td className={classes.historyTableCell}>
                        {data?.displayType === "AVERAGE"
                          ? data.currentYearData?.targetAverage !== undefined &&
                            data.currentYearData?.targetAverage !== null
                            ? data.currentYearData?.targetAverage === 0
                              ? "0.00"
                              : data.currentYearData?.targetAverage?.toFixed(2)
                            : ""
                          : data.currentYearData?.totalQuarterTarget !==
                              undefined &&
                            data.currentYearData?.totalQuarterTarget !== null
                          ? data.currentYearData?.totalQuarterTarget === 0
                            ? "0.00"
                            : data.currentYearData?.totalQuarterTarget?.toFixed(
                                2
                              )
                          : ""}
                      </td>
                      <td className={classes.historyTableCell}>
                        {data?.displayType === "AVERAGE"
                          ? data.currentYearData?.averageQuarterAverage !==
                              undefined &&
                            data.currentYearData?.averageQuarterAverage !== null
                            ? data.currentYearData?.averageQuarterAverage === 0
                              ? "0.00"
                              : data.currentYearData?.averageQuarterAverage?.toFixed(
                                  2
                                )
                            : ""
                          : data.currentYearData?.totalQuarterSum !==
                              undefined &&
                            data.currentYearData?.totalQuarterSum !== null
                          ? data.currentYearData?.totalQuarterSum === 0
                            ? "0.00"
                            : data.currentYearData?.totalQuarterSum?.toFixed(2)
                          : ""}
                      </td>
                    </>
                  )}
                  {data.kpidatadaywise
                    ?.sort((a: any, b: any) => a.kpiMonthYear - b.kpiMonthYear)
                    .map((monthData: any, monthIndex: any) => (
                      <React.Fragment key={monthIndex}>
                        <td className={classes.historyTableCell}>
                          {monthData.target !== undefined &&
                          monthData.target !== null
                            ? monthData.target === 0
                              ? "0.00"
                              : monthData.target.toFixed(2)
                            : ""}
                        </td>
                        <td
                          className={classes.historyTableCell}
                          onMouseEnter={() =>
                            handleMouseEnter(index, monthIndex)
                          }
                          onMouseLeave={handleMouseLeave}
                        >
                          {monthData.kpiValue !== undefined &&
                          monthData.kpiValue !== null
                            ? monthData.kpiValue === 0
                              ? "0.00"
                              : monthData.kpiValue?.toFixed(2)
                            : ""}
                          {!!monthData.kpiComments &&
                            monthData.kpiComments !== "" &&
                            monthData.kpiComments !== null && (
                              <Tooltip
                                title={monthData.kpiComments}
                                placement="bottom"
                                arrow
                                open={
                                  hoveredCell?.rowIndex === index &&
                                  hoveredCell?.monthIndex === monthIndex
                                }
                              >
                                <MdOutlineInfo
                                  style={{
                                    fontSize: "10px",
                                    color: "#00224e",
                                    // position: "absolute",
                                    verticalAlign: "super", // Ensures the icon is rendered as a superscript
                                    cursor: "pointer", // Optional: add cursor style for interaction
                                  }}
                                />
                              </Tooltip>
                            )}
                        </td>
                      </React.Fragment>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showHistoricData && selectedOption === "Half-Yearly" && (
        <div className={classes.historyTableWrapper}>
          <table className={classes.historyTable}>
            <thead>
              <tr>
                {/* Header for years, merging cells for PnB and Actual */}
                <th
                  className={classes.historyTableHeaderCell}
                  colSpan={2}
                  style={{ position: "sticky" }}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${
                      historicData[0]?.previousYear2?.kpiYear
                        ? historicData[0]?.previousYear2?.kpiYear
                        : ""
                    }`}</div>
                  </div>
                </th>
                <th
                  className={classes.historyTableHeaderCell}
                  colSpan={2}
                  style={{ position: "sticky" }}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${
                      historicData[0]?.previousYear1?.kpiYear
                        ? historicData[0]?.previousYear1?.kpiYear
                        : ""
                    }`}</div>
                  </div>
                </th>
                {historicData[0]?.currentYearData && (
                  <th
                    className={classes.historyTableHeaderCell}
                    colSpan={2}
                    style={{ position: "sticky" }}
                  >
                    <div style={{ fontSize: "90%", textAlign: "center" }}>
                      <div>
                        {`${historicData[0]?.currentYearData?.kpiYear}`}(YTD)
                      </div>
                    </div>
                  </th>
                )}
                {historicData[0]?.halfYearData
                  .sort((a: any, b: any) => a.kpiMonthYear - b.kpiMonthYear)
                  .map((monthData: any, monthIndex: any) => (
                    <th
                      className={classes.historyTableHeaderCell}
                      colSpan={2}
                      key={monthIndex}
                    >
                      <div style={{ fontSize: "90%", textAlign: "center" }}>
                        <div>{`H${monthData.kpiSemiAnnual}-${monthData.kpiYear}`}</div>
                      </div>
                    </th>
                  ))}
              </tr>
              <tr>
                {/* Header for PnB and Actual */}
                {Array.from({
                  length:
                    (historicData[0]?.kpidata?.length || 0) +
                    2 +
                    (historicData[0]?.currentYearData ? 1 : 0),
                }).map((_, index) => (
                  <React.Fragment key={index}>
                    <th
                      className={classes.historyTableHeaderCell}
                      style={{ textAlign: "center" }}
                    >
                      PnB
                    </th>
                    <th
                      className={classes.historyTableHeaderCell}
                      style={{ textAlign: "center" }}
                    >
                      Actual
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {historicData.map((data, index) => (
                <tr key={index}>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear2?.targetAverage?.toFixed(2)
                      : data.previousYear2?.totalQuarterTarget
                      ? data.previousYear2?.totalQuarterTarget
                      : ""}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear2?.averageQuarterAverage?.toFixed(2)
                      : data.previousYear2?.totalQuarterSum}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear1?.targetAverage?.toFixed(2)
                      : data.previousYear1?.totalQuarterTarget
                      ? data.previousYear1?.totalQuarterTarget?.toFixed(2)
                      : ""}
                  </td>
                  <td className={classes.historyTableCell}>
                    {data?.displayType === "AVERAGE"
                      ? data.previousYear1?.averageQuarterAverage?.toFixed(2)
                      : data.previousYear1?.totalQuarterSum
                      ? data.previousYear1?.totalQuarterSum?.toFixed(2)
                      : ""}
                  </td>
                  {data.currentYearData && (
                    <>
                      <td className={classes.historyTableCell}>
                        {data?.displayType === "AVERAGE"
                          ? data.currentYearData?.targetAverage?.toFixed(2)
                          : data.currentYearData?.totalQuarterTarget
                          ? data.currentYearData?.totalQuarterTarget?.toFixed(2)
                          : ""}
                      </td>
                      <td className={classes.historyTableCell}>
                        {data?.displayType === "AVERAGE"
                          ? data.currentYearData?.averageQuarterAverage?.toFixed(
                              2
                            )
                          : data.currentYearData?.totalQuarterSum
                          ? data.currentYearData?.totalQuarterSum?.toFixed(2)
                          : ""}
                      </td>
                    </>
                  )}
                  {data.halfYearData
                    .sort((a: any, b: any) => a.kpiMonthYear - b.kpiMonthYear)
                    .map((monthData: any, monthIndex: any) => (
                      <React.Fragment key={monthIndex}>
                        <td className={classes.historyTableCell}>
                          {monthData?.totalQuarterTarget
                            ? monthData?.totalQuarterTarget.toFixed(2)
                            : ""}
                        </td>
                        <td
                          className={classes.historyTableCell}
                          onMouseEnter={() =>
                            handleMouseEnter(index, monthIndex)
                          }
                          onMouseLeave={handleMouseLeave}
                        >
                          {monthData?.totalQuarterSum
                            ? monthData?.totalQuarterSum?.toFixed(2)
                            : ""}
                          {monthData.kpiComments !== "" &&
                            monthData.kpiComments !== null && (
                              <Tooltip
                                title={monthData.kpiComments}
                                placement="bottom"
                                arrow
                                open={
                                  hoveredCell?.rowIndex === index &&
                                  hoveredCell?.monthIndex === monthIndex
                                }
                              >
                                <MdOutlineInfo
                                  style={{
                                    fontSize: "10px",
                                    color: "#00224e",
                                    // position: "absolute",
                                    verticalAlign: "super", // Ensures the icon is rendered as a superscript
                                    cursor: "pointer", // Optional: add cursor style for interaction
                                  }}
                                />
                              </Tooltip>
                            )}
                        </td>
                      </React.Fragment>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* {showHistoricData && selectedOption === "Daily" && (
        <div className={classes.historyTableWrapper}>
          <table className={classes.historyTable}>
            <thead>
              <tr>
              

                <th
                  className={`${classes.historyTableHeaderCell} ${classes.historyTableHeaderCellSticky} ${classes.stickyColumn1}`}
                  colSpan={2}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${historicData[0]?.previousYear2.kpiYear}
                     `}</div>
                    <div>
                      <span style={{ fontWeight: "bold" }}>PnB</span>{" "}
                      <span
                        style={{ margin: "0 5px", color: "rgb(0, 48, 89)" }}
                      >
                        |
                      </span>
                      <span style={{ fontWeight: "bold" }}>Actual</span>
                    </div>
                  </div>
                </th>

                <th
                  className={`${classes.historyTableHeaderCell} ${classes.historyTableHeaderCellSticky} ${classes.stickyColumn2}`}
                  colSpan={2}
                >
                  <div style={{ fontSize: "90%", textAlign: "center" }}>
                    <div>{`${historicData[0]?.previousYear1.kpiYear}
                     `}</div>
                    <div>
                      <span style={{ fontWeight: "bold" }}>PnB</span>{" "}
                      <span
                        style={{ margin: "0 5px", color: "rgb(0, 48, 89)" }}
                      >
                        |
                      </span>
                      <span style={{ fontWeight: "bold" }}>Actual</span>
                    </div>
                  </div>
                </th>

                {historicData[0]?.currentYearData && (
                  <th
                    className={`${classes.historyTableHeaderCell} ${classes.historyTableHeaderCellSticky} ${classes.stickyColumn3}`}
                    colSpan={2}
                  >
                    <div style={{ fontSize: "90%", textAlign: "center" }}>
                      <div>{`${historicData[0]?.currentYearData?.kpiYear}
                     `}</div>
                      <div>
                        <span style={{ fontWeight: "bold" }}>PnB</span>
                        <span
                          style={{ margin: "0 5px", color: "rgb(0, 48, 89)" }}
                        >
                          |
                        </span>
                        <span style={{ fontWeight: "bold" }}>YTD</span>
                      </div>
                    </div>
                  </th>
                )}

                {historicData[0]?.kpidatadaywise.map(
                  (quarterData: any, quarterIndex: number) => (
                    
                    <th
                      className={classes.historyTableHeaderCell}
                      colSpan={2}
                      key={quarterIndex}
                    >
                      <div style={{ fontSize: "80%", textAlign: "center" }}>
                        <div>{formatDate(quarterData.reportFor)}</div>
                        <div>
                          <span style={{ fontWeight: "bold" }}>PnB</span>{" "}
                          <span
                            style={{ margin: "0 5px", color: "rgb(0, 48, 89)" }}
                          >
                            |
                          </span>
                          <span style={{ fontWeight: "bold" }}>Actual</span>
                        </div>
                      </div>
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>{renderDailyTableData(historicData, uniqueYears)}</tbody>
          </table>
        </div>
      )} */}
      <Modal
        title="KPIs with Empty Targets"
        visible={openModal}
        onCancel={handleCloseModal}
        footer={null}
        maskClosable={true}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        <div
          style={{
            padding: "10px",
            backgroundColor: "white",
            maxWidth: "400px",
            margin: "auto",
          }}
        >
          <ul>
            {emptyTargetsKPIs.map((kpiName, index) => (
              <li key={index}>{kpiName}</li>
            ))}
          </ul>
          <span style={{ color: "red" }}>
            Please set targets for these Kpis in master to proceed
          </span>
        </div>
      </Modal>
    </div>
  );
}

export default AdhocReportDesignContainer;
