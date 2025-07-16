import React, { useEffect, useRef, useState } from "react";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale, // x-axis
  LinearScale, // y-axis
  PointElement,
  Legend,
  BarController,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Alignment, ChartType, Position } from "../../utils/enums";
import {
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  useMediaQuery,
  Tooltip,
} from "@material-ui/core";
import { useStyles } from "./styles";
import ReportGraphComponent from "../ReportGraphComponent";

import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import SolidGauge from "highcharts/modules/solid-gauge";
import axios from "../../apis/axios.global";
import { useRecoilState } from "recoil";
import { kraChart } from "../../recoil/atom";
import * as XLSX from "xlsx";
import { DatePicker, Modal } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { AiOutlineArrowsAlt, AiOutlineFileExcel, AiOutlineCalendar } from "react-icons/ai";
import { MdArrowDropDown } from 'react-icons/md';
import AliceCarousel from "react-alice-carousel";
import { MdChevronRight } from 'react-icons/md';
import { MdChevronLeft } from 'react-icons/md';
import getSessionStorage from "utils/getSessionStorage";
import KraTableFilters from "./KraTableFilters";
import getYearFormat from "utils/getYearFormat";
import KraDashboardTable from "./KraDashboardTable";
import ObjectivePerformanceChart from "./ObjectivePerformaceChart";
import ObjectiveTimeSeriesChart from "./ObjectiveTimeSeriesChart";
import DriftAnalysisChart from "./DriftAnalysisChart";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";

HighchartsMore(Highcharts);
SolidGauge(Highcharts);

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  ChartTooltip,
  BarController
);
interface KPIDatamonthwise {
  kpiMonthYear: number;
  monthlySum: number;
  monthlyTarget: number;
  monthlyVariance: number;
}

interface KPIDataItem {
  categoryName: string;
  kpi: string;
  kpidatamonthwise: KPIDatamonthwise[];
}

// Define type for the rows
interface DataRow {
  "Category Name": string;
  "KPI Name": string;
  [key: string]: string | number; // Index signature for dynamic properties
}
function KraGraph() {
  const matches = useMediaQuery("(min-width:820px)");
  const userDetails = getSessionStorage();

  const [kraReportData, setKraReportData] = useRecoilState(kraChart);

  // console.log("kraReportData", kraReportData);

  const [dayData, setDayData] = useState<any[]>([]);
  const [reportDateSet, setReportDateSet] = useState(new Set());

  const [reportMonthSet, setReportMonthSet] = useState(new Set());
  const [reportQuarterSet, setReportQuarterSet] = useState(new Set());
  const [reportDates, setReportDates] = useState<any[]>([]);
  const [reportMonths, setReportMonths] = useState<any[]>([]);
  const [reportQuarters, setReportQuarters] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [yearData, setYearData] = useState<any[]>([]);
  const [quartarData, setQuartarData] = useState<any[]>([]);
  const [location, setLocation] = useState<any[]>([]);

  const [businessUnit, setBusinessUnit] = useState<any[]>([]);
  const [businessUnitId, setBusinessUnitId] = useState<string>();
  const [entity, setEntity] = useState<any[]>([]);
  const [modalEntityOptions, setModalEntityOptions] = useState<any[]>([]);
  const [kraId, setKraId] = useState<string>();

  const [kraNameList, setKraNameList] = useState<any[]>([]);

  const [categoryName, setCategoryName] = useState<string>();

  const [clicked, setClicked] = useState<boolean>(false);
  const [actualSum, setActualSum] = useState<any[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const [dayTableData, setDayTableData] = useState<any>([]);
  const [monthlyTableData, setMonthlyTableData] = useState<any>([]);
  const [yearlyTableData, setYearlyTableData] = useState<any>([]);
  const [quaterTableData, setQuaterTableData] = useState<any>();
  interface FooterProps {
    table: any;
    column: any;
  }

  const [selected, setSelected] = useState<string>("Month");

  //export modal states
  const [modalLocation, setModalLocation] = useState<any>(
    userDetails?.locationId
  );
  const [modalEntity, setModalEntity] = useState<string[]>([]);
  const [modalCategory, setModalCategory] = useState<any>([]);
  const [modalObjectiveOptions, setModalObjectiveOptions] = useState<any>([]);
  const [modalObjectives, setModalObjectives] = useState<any>([]);
  const [modalExportData, setModalExportData] = useState<any>([]);

  // console.log("selected", modalLocation, modalEntity);
  const getEntititesForLocation = async () => {
    try {
      const response = await axios.get(
        "/api/kpi-report/getEntitiesByLocations",
        {
          params: {
            locationId: modalLocation,
            organizationId: userDetail?.organizationId,
          },
        }
      );
      // console.log("get entitites", response.data);
      if (response.data?.length > 0) {
        const allOption = {
          id: "All",
          name: "All",
        };

        // Map the response data to create the entities list
        const entities = response.data.map((obj: any) => ({
          id: obj.id,
          name: obj.entityName,
        }));

        // Add the "All" option at the beginning of the list
        const options = [allOption, ...entities];

        // Set the options with "All" first
        setModalEntityOptions(options);
      }
    } catch (error) {
      setModalObjectiveOptions([]);
      console.error("Error fetching objectives:", error);
    }
  };
  useEffect(() => {
    getEntititesForLocation();
  }, [modalLocation]);

  const dayscolumns = [
    {
      header: "Category Name",
      accessorKey: "categoryname",
      size: 500,
    },
    {
      header: "KPI Name",
      accessorKey: "kpi",
    },
    {
      header: "UOM",
      accessorKey: "uom",
    },
    ...reportDates.map((dateString: string, index: any) => ({
      header: dateString,
    })),
  ];

  const monthColumns = [
    {
      header: "Category Name",
      accessorKey: "categoryname",
      size: 500,
    },
    {
      header: "KPI Name",
      accessorKey: "kpi",
    },
    {
      header: "UOM",
      accessorKey: "uom",
    },
    ...reportMonths.map((monthString: string) => ({
      header: monthString,
      // accessorKey: "cellValue",
    })),
  ];

  const quartarColumns = [
    {
      header: "Category Name",
      accessorKey: "categoryname",
      size: 500,
    },
    {
      header: "KPI Name",
      accessorKey: "kpi",
    },
    {
      header: "UOM",
      accessorKey: "uom",
    },
    ...reportQuarters.map((quarterString: string) => ({
      header: quarterString,
      // accessorKey: "cellValue",
    })),
  ];

  const [TableData, setTableData] = useState<any[]>(dayData);
  const [TableColumn, setTableColumn] = useState<any[]>(dayscolumns);

  const getTableDataProp = (propName: string) => {
    return TableData?.map((ele) => {
      if (ele.hasOwnProperty(propName)) {
        return ele[propName];
      }
      return null;
    });
  };

  interface Data {
    [key: string]: any;
  }

  const allLabels = reportMonths;
  const allQuarters = reportQuarters;
  const allYear = getTableDataProp("year");

  const allDays = reportDates;
  const totalaverage = getTableDataProp("totalaverage");
  const totalvalue = getTableDataProp("totalvalue");
  const totalTarget = getTableDataProp("totalTarget");
  const allCategoryName = getTableDataProp("categoryname");
  const uniqueCategories = Array.from(new Set(allCategoryName));
  const kpiName = getTableDataProp("kpi");
  const uniquekpiName = Array.from(new Set(kpiName));
  const allPercentage = getTableDataProp("totalpercentage");
  const sortedPercentage = allPercentage.map(parseFloat).sort((a, b) => a - b); // convert strings to numbers and sort ascending
  const min = sortedPercentage[0];
  const max = sortedPercentage[sortedPercentage.length - 1];
  const median = sortedPercentage[Math.floor(sortedPercentage.length / 2)];
  const [labelData, setLabelData] = useState<any[]>(allDays);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [locationId, setLocationId] = useState<string>(
    userDetail?.location?.id
  );
  const [entityId, setEntityId] = useState<string>(userDetail?.entity?.id);
  const startDate = getStartDate(userDetail?.organization?.fiscalYearQuarters);
  const [categoryId, setCategoryId] = useState<any>(null);
  const [selectedOptionForObjective, setSelectedOptionForObjective] =
    useState<any>(null);

  // console.log("categoryId", categoryId);

  function getStartDate(fiscalYearQuarters: any) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    if (fiscalYearQuarters === "April - Mar") {
      // Set the start date to April 1st of the current year
      // console.log("inside if");
      return new Date(currentYear, 3, 1); // Month is 0-indexed, so April is 3
    } else {
      // Handle other cases if needed
      return new Date(currentYear, 0, 1); // Or throw an error
    }
  }

  const chartRef = useRef(null);

  const convertDate = (date: Date) => {
    const dd = String(date?.getDate()).padStart(2, "0");
    const mm = String(date?.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return yyyy + "-" + mm + "-" + dd;
  };

  function convertDate2(date: Date | null): string {
    if (date === null) {
      return "";
    }
    const year = date.getFullYear();
    const month = ("0" + (date?.getMonth() + 1)).slice(-2);
    const day = ("0" + date?.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  const getDayWiseData = () => {
    if (categoryId !== null && dayTableData) {
      const groupedData = dayTableData
        ?.flatMap((item: any) =>
          item.kpidata?.map((kpiData: any) => {
            const dateObj = new Date(kpiData.reportDate);
            const formattedDate = `${(dateObj.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${dateObj
              .getDate()
              .toString()
              .padStart(2, "0")}/${dateObj.getFullYear().toString().slice(2)}`;
            const formattedTime = `${dateObj
              .getHours()
              .toString()
              .padStart(2, "0")}:${dateObj
              .getMinutes()
              .toString()
              .padStart(2, "0")}`;
            const dateNtime = `${formattedDate}  ${formattedTime}`;

            // Add report date to set
            setReportDateSet((prevSet) => prevSet.add(dateNtime));

            return {
              id: kpiData.kpiId,
              reportDate: dateNtime,
              target: kpiData.target,
              value: kpiData.kpiValue,
              percentage: kpiData.percentage
                ? parseFloat(kpiData.percentage?.toFixed(2))
                : "",
              kpi: item.kpi,
              categoryname: categoryName,
              uom: item.uom,
              totalvalue: item.aggregate[0]?.totalMonthlySum,
              totalaverage: item.aggregate[0]?.monthlyAverage,
              totalTarget: item.aggregate[0]?.totalTarget,
              totalpercentage: item.aggregate[0]?.averagepercentage,
              cellValue: [
                {
                  columnName: dateNtime,
                  values: [
                    {
                      id: "0",
                      value: kpiData.kpiValue,
                      target: kpiData.target,
                      percentage: kpiData.percentage,
                    },
                  ],
                },
              ],
            };
          })
        )
        .reduce((acc: any, cur: any) => {
          const key = cur.kpi + cur.uom;
          if (acc[key]) {
            acc[key].cellValue = [
              ...acc[key].cellValue,
              {
                columnName: cur.reportDate,
                values: [
                  {
                    id: "0",
                    value: cur.value,
                    target: cur.target,
                    percentage: cur.percentage,
                  },
                ],
              },
            ];
            acc[key].values.push(cur.percentage);
          } else {
            acc[key] = {
              id: cur.id,
              reportDate: cur.reportDate,
              target: cur.target,
              value: cur.value,
              percentage: cur.percentage,
              kpi: cur.kpi,
              categoryname: cur.categoryname,
              uom: cur.uom,
              totalTarget: cur.totalTarget,
              totalvalue: cur.totalvalue,
              totalaverage: cur.totalaverage,
              totalpercentage: cur.totalpercentage,
              cellValue: [
                {
                  columnName: cur.reportDate,
                  values: [
                    {
                      id: "0",
                      value: cur.value,
                      target: cur.target,
                      percentage: cur.percentage,
                    },
                  ],
                },
              ],
              values: [cur.percentage],
            };
          }
          return acc;
        }, {});

      // Convert set to array
      setReportDates(Array.from(reportDateSet));

      const dayData = Object.values(groupedData);
      setDayData(dayData);
    }
  };

  const getYearWiseData = () => {
    if (!yearlyTableData) return;

    const groupedData = yearlyTableData
      ?.flatMap((item: any) =>
        item?.sum?.map((sumData: any) => {
          // Now, use kpiYear as the reportDate
          // console.log("item.kpiId", item.kpiId);
          const reportDate = `${sumData.kpiYear}`;

          // Add kpiYear to the set for year-based reporting
          setReportMonthSet((prevSet) => new Set(prevSet).add(reportDate));

          const categoryName = kraNameList.find(
            (kra: any) => kra.categoryid === item.kraId
          )?.categoryname;

          return {
            id: item.kpiId,
            target: sumData.totalTarget,
            value: sumData.totalMonthlySum,
            average: sumData.averageMonthlyAverage,
            reportDate: reportDate, // Now grouping by year
            kpiYear: sumData.kpiYear,
            kpi: item.kpi,
            kpitype: item.kpitype,
            percentage: sumData.avgEfficiency
              ? Number(sumData.avgEfficiency)?.toFixed(2)
              : "",
            totalTarget: sumData.totalTarget,
            totalaverage: sumData.averageMonthlyAverage
              ? Number(sumData.averageMonthlyAverage)?.toFixed(2)
              : "",
            totalvalue: sumData.totalMonthlySum,
            totalpercentage: sumData.avgEfficiency,
            categoryname: categoryName,
            uom: item.uom,
            cellValue: [
              {
                columnName: reportDate, // year-based column name
                values: [
                  {
                    id: "0",
                    value: sumData.totalMonthlySum,
                    target: sumData.totalTarget,
                    totalaverage: sumData.averageMonthlyAverage
                      ? Number(sumData.averageMonthlyAverage)?.toFixed(2)
                      : "",
                    percentage: Number(sumData.avgEfficiency),
                  },
                ],
              },
            ],
          };
        })
      )
      .reduce((acc: any, cur: any) => {
        const key = cur.kpi + cur.uom;
        if (acc[key]) {
          acc[key].cellValue = [
            ...acc[key].cellValue,
            {
              columnName: cur.reportDate,
              values: [
                {
                  id: "0",
                  value: cur.value,
                  target: cur.target,
                  average: cur.average,
                  percentage: cur.percentage,
                },
              ],
            },
          ];
          acc[key].totalTarget += cur.target;
          acc[key].totalvalue += cur.value;
          acc[key].totalaverage = Number(
            (Number(acc[key].totalaverage) + Number(cur.average))?.toFixed(2)
          );
          acc[key].totalpercentage += cur.percentage;
          acc[key].values.push(cur.percentage);
          acc[key].totalpercentage =
            acc[key].values.reduce(
              (total: number, currentValue: number) => total + currentValue,
              0
            ) / acc[key].values.length;
        } else {
          acc[key] = {
            id: cur.id,
            target: cur.target,
            value: cur.value,
            average: cur.average,
            reportDate: cur.reportDate,
            kpiYear: cur.kpiYear,
            kpitype: cur.kpitype,
            kpi: cur.kpi,
            percentage: cur.percentage,
            totalTarget: cur.target,
            totalaverage: cur.average,
            totalvalue: cur.value,
            totalpercentage: cur.totalpercentage,
            categoryname: cur.categoryname,
            uom: cur.uom,
            cellValue: [
              {
                columnName: cur.reportDate,
                values: [
                  {
                    id: "0",
                    value: cur.value,
                    target: cur.target,
                    average: cur.average,
                    percentage: cur.percentage,
                  },
                ],
              },
            ],
            values: [cur.percentage],
          };
        }
        return acc;
      }, {});

    // Set the report years
    setReportMonths(Array.from(reportMonthSet));

    const yearData = Object.values(groupedData); // Grouped by kpiYear
    setYearData(yearData); // Map the final result to year-wise data
  };
  // console.log("yearData", yearData, monthData);
  const getMonthWiseData = () => {
    if (!monthlyTableData) return;

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const groupedData = monthlyTableData
      ?.flatMap((item: any) =>
        item.kpidatamonthwise.map((kpiData: any) => {
          const date = new Date(
            `${kpiData.kpiYear}-${kpiData.kpiMonthYear + 1}-01`
          );
          const monthYear = `${
            monthNames[date.getMonth()]
          }/${date.getFullYear()}`;

          // Add report month to set
          setReportMonthSet((prevSet) => new Set(prevSet).add(monthYear));
          const categoryName = kraNameList.find(
            (kra: any) => kra.categoryid === kpiData.kraId
          )?.categoryname;

          return {
            id: kpiData.kpiId,
            target: kpiData.monthlyTarget,
            value: kpiData.monthlySum,
            average: kpiData.monthlyAverage,
            reportDate: monthYear,
            kpiYear: kpiData.kpiYear,
            kpi: item.kpi,
            kpitype: item.kpitype,
            percentage: kpiData.percentage
              ? Number(kpiData.percentage)?.toFixed(2)
              : "",
            totalTarget: kpiData.monthlyTarget,
            totalaverage: kpiData.monthlyAverage
              ? Number(kpiData.monthlyAverage)?.toFixed(2)
              : "",
            totalvalue: kpiData.monthlySum,
            totalpercentage: kpiData.percentage,
            categoryname: categoryName,
            uom: item.uom,
            cellValue: [
              {
                columnName: monthYear,
                values: [
                  {
                    id: "0",
                    value: kpiData.monthlySum,
                    target: kpiData.monthlyTarget,
                    totalaverage: kpiData.monthlyAverage
                      ? Number(kpiData.monthlyAverage)?.toFixed(2)
                      : "",
                    percentage: Number(kpiData.percentage),
                  },
                ],
              },
            ],
          };
        })
      )
      .reduce((acc: any, cur: any) => {
        const key = cur.kpi + cur.uom;
        if (acc[key]) {
          acc[key].cellValue = [
            ...acc[key].cellValue,
            {
              columnName: cur.reportDate,
              values: [
                {
                  id: "0",
                  value: cur.value,
                  target: cur.target,
                  average: cur.average,
                  percentage: cur.percentage,
                },
              ],
            },
          ];
          acc[key].totalTarget += cur.target;
          acc[key].totalvalue += cur.value;
          acc[key].totalaverage = Number(
            (Number(acc[key].totalaverage) + Number(cur.average))?.toFixed(2)
          );
          acc[key].totalpercentage += cur.percentage;
          acc[key].values.push(cur.percentage);
          acc[key].totalpercentage =
            acc[key].values.reduce(
              (total: number, currentValue: number) => total + currentValue,
              0
            ) / acc[key].values.length;
        } else {
          acc[key] = {
            id: cur.id,
            target: cur.target,
            value: cur.value,
            average: cur.average,
            reportDate: cur.reportDate,
            kpiYear: cur.kpiYear,
            kpitype: cur.kpitype,
            kpi: cur.kpi,
            percentage: cur.percentage,
            totalTarget: cur.target,
            totalaverage: cur.average,
            totalvalue: cur.value,
            totalpercentage: cur.totalpercentage,
            categoryname: cur.categoryname,
            uom: cur.uom,
            cellValue: [
              {
                columnName: cur.reportDate,
                values: [
                  {
                    id: "0",
                    value: cur.value,
                    target: cur.target,
                    average: cur.average,
                    percentage: cur.percentage,
                  },
                ],
              },
            ],
            values: [cur.percentage],
          };
        }
        return acc;
      }, {});

    setReportMonths(Array.from(reportMonthSet));

    const monthData = Object.values(groupedData);
    setMonthData(monthData);
  };

  const getQuartarWiseData = () => {
    if (!quaterTableData) return;

    const quarterNames = ["Jan-Mar", "Apr-Jun", "Jul-Sep", "Oct-Dec"];
    const groupedData = quaterTableData
      .flatMap((item: any) =>
        item.kpidata.map((kpiData: any) => {
          const quarterIndex = Math.floor((kpiData.kpiPeriod + 1) / 3);
          const quarterYear = `${quarterNames[quarterIndex]}/${kpiData.kpiYear}`;

          // Add report month to set
          setReportQuarterSet((prevSet) => new Set(prevSet).add(quarterYear));

          const categoryName = kraNameList.find(
            (kra: any) => kra.categoryid === kraId
          )?.categoryname;

          let percentage;
          if (item.kpitype) {
            percentage = Number(
              (
                (kpiData.totalQuarterSum / kpiData.totalQuarterTarget) *
                100
              )?.toFixed(2)
            );
          } else {
            percentage = Number(
              (
                ((kpiData.totalQuarterTarget - kpiData.totalQuarterSum) /
                  kpiData.totalQuarterTarget) *
                100
              )?.toFixed(2)
            );
          }

          return {
            cellValue: [
              {
                columnName: quarterYear,
                values: [
                  {
                    id: "0",
                    value: kpiData.totalQuarterSum,
                    target: kpiData.totalQuarterTarget,
                    average: kpiData.averageQuarterAverage
                      ? kpiData.averageQuarterAverage.toFixed(2)
                      : "",
                    percentage: percentage,
                  },
                ],
              },
            ],
            id: kpiData.kpiPeriod + item.kpi,
            kpiPeriod: kpiData.kpiPeriod,
            kpiYear: kpiData.kpiYear,
            kpi: item.kpi,
            target: kpiData.totalQuarterTarget,
            value: kpiData.totalQuarterSum,
            kpitype: item.kpitype,
            average: kpiData.averageQuarterAverage,
            totalTarget: kpiData.totalQuarterTarget,
            totalvalue: kpiData.totalQuarterSum,
            totalaverage: kpiData.averageQuarterAverage,
            categoryname: categoryName,
            percentage: percentage,
            uom: item.uom,
            totalpercentage: kpiData.percentage,
            reportDate: quarterYear,
          };
        })
      )
      .reduce((acc: any, cur: any) => {
        const key = cur.kpi + cur.uom;
        if (acc[key]) {
          acc[key].cellValue = [
            ...acc[key].cellValue,
            {
              columnName: cur.reportDate,
              values: [
                {
                  id: "0",
                  value: cur.value,
                  target: cur.target,
                  average: cur.average,
                  percentage: cur.percentage,
                },
              ],
            },
          ];
          acc[key].totalTarget += cur.target;
          acc[key].totalvalue += cur.value;
          acc[key].totalaverage += cur.average;
          acc[key].totalpercentage += cur.percentage;
          acc[key].values.push(cur.percentage);
          acc[key].totalpercentage =
            acc[key].values.reduce(
              (total: number, currentValue: number) => total + currentValue,
              0
            ) / acc[key].values.length;
        } else {
          acc[key] = {
            cellValue: [
              {
                columnName: cur.reportDate,
                values: [
                  {
                    id: "0",
                    value: cur.value,
                    target: cur.target,
                    average: cur.average,
                    percentage: cur.percentage,
                  },
                ],
              },
            ],
            values: [cur.percentage],
            id: cur.kpiPeriod + cur.kpi,
            kpiPeriod: cur.kpiPeriod,
            kpiYear: cur.kpiYear,
            kpi: cur.kpi,
            target: cur.target,
            value: cur.value,
            average: cur.average,
            categoryname: cur.categoryname,
            totalTarget: cur.target,
            totalvalue: cur.value,
            totalaverage: cur.average,
            percentage: cur.percentage,
            totalpercentage: cur.percentage,
            kpitype: cur.kpitype,
            uom: cur.uom,
            reportDate: cur.reportDate,
          };
        }
        return acc;
      }, {});

    // Convert set to array
    setReportQuarters(Array.from(reportQuarterSet));

    const quarterData = Object.values(groupedData);
    setQuartarData(quarterData);
  };
  // Function to get month names from kpiMonthYear
  const getMonthName = (monthIndex: number): string => {
    const months = [
      "January",
      "Febrauary",
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
    return `${months[monthIndex - 1]}`;
  };
  // Function to transform data
  // const transformData = (data: any[]): { headers: string[]; rows: any[] } => {
  //   // Function to get month name from month number (you may need to adjust this)
  //   const getMonthName = (monthNumber: number): string => {
  //     const months = [
  //       "Jan",
  //       "Feb",
  //       "Mar",
  //       "Apr",
  //       "May",
  //       "Jun",
  //       "Jul",
  //       "Aug",
  //       "Sep",
  //       "Oct",
  //       "Nov",
  //       "Dec",
  //     ];
  //     return months[monthNumber - 1] || "";
  //   };

  //   // Extract unique months from the data
  //   const monthSet = new Set<string>();
  //   data.forEach((item) => {
  //     item.kpis.forEach((kpi: any) => {
  //       kpi.kpidatamonthwise.forEach((monthData: any) => {
  //         monthSet.add(getMonthName(monthData.kpiMonthYear));
  //       });
  //     });
  //   });

  //   const months = Array.from(monthSet).sort((a, b) => {
  //     const aIndex = new Date(Date.parse(a + " 1, 2024")).getMonth();
  //     const bIndex = new Date(Date.parse(b + " 1, 2024")).getMonth();
  //     return aIndex - bIndex;
  //   });

  //   // Create the headers
  //   const headers = ["Category", "KPI Name"];
  //   months.forEach((month) => {
  //     headers.push(`${month} Target`);
  //     headers.push(`${month} Actual`);
  //     headers.push(`${month} Variance`);
  //   });

  //   // Create the rows
  //   const rows: any[] = [];
  //   data.forEach((categoryData) => {
  //     categoryData.kpis.forEach((kpi: any) => {
  //       const row: any = {
  //         Category: categoryData.categoryName,
  //         "KPI Name": kpi.kpi,
  //       };

  //       // Initialize columns for each month with empty values
  //       months.forEach((month) => {
  //         row[`${month} Target`] = "";
  //         row[`${month} Actual`] = "";
  //         row[`${month} Variance`] = "";
  //       });

  //       // Fill in the data
  //       kpi.kpidatamonthwise.forEach((monthData: any) => {
  //         const month = getMonthName(monthData.kpiMonthYear);
  //         row[`${month} Target`] = monthData.monthlyTarget || "";
  //         row[`${month} Actual`] = monthData.monthlySum || "";
  //         row[`${month} Variance`] = monthData.monthlyVariance || "";
  //       });

  //       rows.push(row);
  //     });
  //   });

  //   return { headers, rows };
  // };
  // Function to extract unique months from the data
  const getUniqueMonths = (data: any[]) => {
    const months = new Set<number>();
    data.forEach((category) => {
      category.kpis.forEach((kpi: any) => {
        kpi.kpidatamonthwise.forEach((monthData: any) => {
          months.add(monthData.kpiMonthYear);
        });
      });
    });
    return Array.from(months).sort((a, b) => a - b); // Sort months numerically
  };
  const getDynamicHeaders = (data: any[]) => {
    const years = new Set<string>();

    data.forEach((category) => {
      category.kpis.forEach((kpi: any) => {
        if (kpi.currentYearData) years.add(kpi.currentYearData.kpiYear);
        if (kpi.previousYear1) years.add(kpi.previousYear1.kpiYear);
        if (kpi.previousYear2) years.add(kpi.previousYear2.kpiYear);
      });
    });

    const sortedYears = Array.from(years).sort();

    // Extract unique months from the data
    const months = getUniqueMonths(data);

    const headers = ["KPI Name"];

    // Add year-based headers first
    sortedYears.forEach((year) => {
      headers.push(`${year} Target`, `${year} Sum`, `${year} Average`);
    });

    // Add month-based headers
    months.forEach((month) => {
      const monthName = getMonthName(month);
      headers.push(`${monthName} Target`, `${monthName} Actual`);
    });

    return headers;
  };

  // const transformDataForExcel = (data: any[]) => {
  //   const wsData: any[] = [];
  //   const wsMerge: XLSX.Range[] = [];

  //   const years = new Set<string>();
  //   const months = new Set<number>();

  //   // Extract years and months from data
  //   data.forEach((category) => {
  //     category.kpis.forEach((kpi: any) => {
  //       if (kpi.currentYearData) years.add(kpi.currentYearData.kpiYear);
  //       if (kpi.previousYear1) years.add(kpi.previousYear1.kpiYear);
  //       if (kpi.previousYear2) years.add(kpi.previousYear2.kpiYear);
  //       kpi.kpidatamonthwise.forEach((monthData: any) => {
  //         months.add(monthData.kpiMonthYear);
  //       });
  //     });
  //   });

  //   const sortedYears = Array.from(years).sort();
  //   const sortedMonths = Array.from(months).sort();

  //   const categories = [...new Set(data.map((item) => item.categoryName))];
  //   categories.forEach((category) => {
  //     wsData.push([category]);

  //     // Add category header

  //     // Create headers
  //     const headers: string[] = [""];
  //     const subHeaders: string[] = [];
  //     const yearHeadersMap: Record<
  //       string,
  //       { targetIndex: number; actualIndex: number }
  //     > = {};
  //     const monthHeadersMap: Record<
  //       number,
  //       { targetIndex: number; actualIndex: number }
  //     > = {};

  //     // Add year-based headers
  //     sortedYears.forEach((year, index) => {
  //       const targetIndex = headers.length;
  //       headers.push(`${year}`, ``);
  //       yearHeadersMap[year] = { targetIndex, actualIndex: targetIndex + 1 };
  //     });

  //     // Add month-based headers for the current year only
  //     sortedMonths.forEach((month) => {
  //       const monthName = new Date(0, month - 1).toLocaleString("en", {
  //         month: "short",
  //       });
  //       const targetIndex = headers.length;
  //       headers.push(`${monthName}`, ``);
  //       monthHeadersMap[month] = { targetIndex, actualIndex: targetIndex + 1 };
  //     });

  //     // Add combined headers
  //     wsData.push(headers);

  //     // Create subheaders
  //     const subHeadersArray: string[] = ["KPI Name"]; // No subheader for KPI Name
  //     headers.forEach((header, index) => {
  //       if (index > 0) {
  //         subHeadersArray.push(index % 2 === 1 ? "Target" : "Actual");
  //       }
  //     });
  //     wsData.push(subHeadersArray);

  //     // Add KPI data
  //     const categoryData = data.find((d) => d.categoryName === category);
  //     if (categoryData) {
  //       categoryData.kpis.forEach((kpi: any) => {
  //         const row: any[] = [kpi.kpi];

  //         sortedYears.forEach((year) => {
  //           const yearData = {
  //             previousYear2:
  //               kpi.previousYear2 && kpi.previousYear2.kpiYear === year
  //                 ? kpi.previousYear2
  //                 : null,
  //             previousYear1:
  //               kpi.previousYear1 && kpi.previousYear1.kpiYear === year
  //                 ? kpi.previousYear1
  //                 : null,
  //             currentYear:
  //               kpi.currentYearData && kpi.currentYearData.kpiYear === year
  //                 ? kpi.currentYearData
  //                 : null,
  //           };

  //           const yearMap = yearHeadersMap[year];

  //           if (yearData.previousYear2) {
  //             row[yearMap.targetIndex] =
  //               yearData.previousYear2.totalQuarterTarget || "";
  //             row[yearMap.actualIndex] =
  //               yearData.previousYear2.totalQuarterSum || "";
  //           }

  //           if (yearData.previousYear1) {
  //             row[yearMap.targetIndex] =
  //               yearData.previousYear1.totalQuarterTarget || "";
  //             row[yearMap.actualIndex] =
  //               yearData.previousYear1.totalQuarterSum || "";
  //           }

  //           if (yearData.currentYear) {
  //             row[yearMap.targetIndex] =
  //               yearData.currentYear.totalQuarterTarget || "";
  //             row[yearMap.actualIndex] =
  //               yearData.currentYear.totalQuarterSum || "";
  //           }
  //         });

  //         // Add month-wise data for the current year
  //         sortedMonths.forEach((month) => {
  //           const monthData = kpi.kpidatamonthwise.find(
  //             (m: any) => m.kpiMonthYear === month
  //           );
  //           const monthMap = monthHeadersMap[month];
  //           row[monthMap.targetIndex] = monthData
  //             ? monthData.monthlyTarget || ""
  //             : "";
  //           row[monthMap.actualIndex] = monthData
  //             ? monthData.monthlySum || ""
  //             : "";
  //         });

  //         wsData.push(row);
  //       });
  //     }

  //     wsData.push([]); // Add an empty row for separation
  //   });

  //   return { wsData, wsMerge };
  // };

  // const handleExportButtonClick = async () => {
  //   try {
  //     const locationParam = modalLocation;
  //     const entityParam = modalEntity?.length > 0 ? modalEntity.join(",") : "";
  //     const categoryParam =
  //       modalCategory.length > 0 ? modalCategory.join(",") : "";
  //     const objParam =
  //       modalObjectives.length > 0 ? modalObjectives.join(",") : "";

  //     const apiurl = `/api/kpi-report/exportKpis?locationId=${encodeURIComponent(
  //       locationParam
  //     )}&entityId=${encodeURIComponent(
  //       entityParam
  //     )}&categoryId=${encodeURIComponent(
  //       categoryParam
  //     )}&objectiveId=${encodeURIComponent(objParam)}`;

  //     const result = await axios.get(apiurl);
  //     console.log("Result:", result.data);

  //     const workbook = new ExcelJS.Workbook();

  //     Object.keys(result.data).forEach((departmentKey) => {
  //       const departmentData = result.data[departmentKey];
  //       const { wsData, wsMerge } = transformDataForExcel(departmentData);

  //       const worksheet = workbook.addWorksheet(departmentKey); // Use departmentKey as sheet name

  //       // Add data
  //       wsData.forEach((row, rowIndex) => {
  //         row.forEach((cell: any, cellIndex: any) => {
  //           worksheet.getCell(rowIndex + 1, cellIndex + 1).value = cell;
  //         });
  //       });

  //       // Add cell styling for the first row (header row)
  //       worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
  //         cell.fill = {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "FFFF00" }, // Yellow background color
  //         };
  //         cell.font = {
  //           bold: true,
  //         };
  //         cell.alignment = {
  //           horizontal: "center",
  //         };
  //       });

  //       // Add merges
  //       wsMerge.forEach((merge) => {
  //         try {
  //           worksheet.mergeCells(
  //             merge.s.r + 1,
  //             merge.s.c + 1,
  //             merge.e.r + 1,
  //             merge.e.c + 1
  //           );
  //         } catch (err) {
  //           console.error("Error merging cells:", err);
  //         }
  //       });
  //     });

  //     // Write workbook to buffer
  //     const buffer = await workbook.xlsx.writeBuffer();

  //     // Create a blob and trigger download
  //     const blob = new Blob([buffer], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     const locationname = getLocationNameById(modalLocation);
  //     a.download = `${locationname}KPI_Data.xlsx`;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Error exporting data:", error);
  //   }
  // };

  const transformDataForExcel = (data: any[]) => {
    const wsData: any[] = [];
    const wsMerge: XLSX.Range[] = [];

    const years = new Set<string>();
    const months = new Set<number>();

    // Extract years and months from data
    data.forEach((category) => {
      category.kpis.forEach((kpi: any) => {
        if (kpi.currentYearData) years.add(kpi.currentYearData.kpiYear);
        if (kpi.previousYear1) years.add(kpi.previousYear1.kpiYear);
        if (kpi.previousYear2) years.add(kpi.previousYear2.kpiYear);
        kpi.kpidatamonthwise.forEach((monthData: any) => {
          months.add(monthData.kpiMonthYear);
        });
      });
    });

    const sortedYears = Array.from(years).sort();
    const sortedMonths = Array.from(months).sort();

    const categories = [...new Set(data.map((item) => item.categoryName))];
    categories.forEach((category) => {
      wsData.push([category]); // Add category header

      // Create headers
      const headers: string[] = [""];
      const subHeaders: string[] = [];
      const yearHeadersMap: Record<
        string,
        { targetIndex: number; actualIndex: number }
      > = {};
      const monthHeadersMap: Record<
        number,
        { targetIndex: number; actualIndex: number }
      > = {};

      // Add year-based headers
      sortedYears.forEach((year, index) => {
        const targetIndex = headers.length;
        headers.push(`${year}`, ``);
        yearHeadersMap[year] = { targetIndex, actualIndex: targetIndex + 1 };
      });

      // Add month-based headers for the current year only
      sortedMonths.forEach((month) => {
        const monthName = new Date(0, month - 1).toLocaleString("en", {
          month: "short",
        });
        const targetIndex = headers.length;
        headers.push(`${monthName}`, ``);
        monthHeadersMap[month] = { targetIndex, actualIndex: targetIndex + 1 };
      });

      // Add combined headers
      wsData.push(headers);

      // Create subheaders
      const subHeadersArray: string[] = ["KPI Name"]; // No subheader for KPI Name
      headers.forEach((header, index) => {
        if (index > 0) {
          subHeadersArray.push(index % 2 === 1 ? "Target" : "Actual");
        }
      });
      wsData.push(subHeadersArray);

      // Add KPI data
      const categoryData = data.find((d) => d.categoryName === category);
      if (categoryData) {
        categoryData.kpis.forEach((kpi: any) => {
          const row: any[] = [kpi.kpi];

          sortedYears.forEach((year) => {
            const yearData = {
              previousYear2:
                kpi.previousYear2 && kpi.previousYear2.kpiYear === year
                  ? kpi.previousYear2
                  : null,
              previousYear1:
                kpi.previousYear1 && kpi.previousYear1.kpiYear === year
                  ? kpi.previousYear1
                  : null,
              currentYear:
                kpi.currentYearData && kpi.currentYearData.kpiYear === year
                  ? kpi.currentYearData
                  : null,
            };

            const yearMap = yearHeadersMap[year];

            if (yearData.previousYear2) {
              row[yearMap.targetIndex] =
                yearData.previousYear2.totalQuarterTarget || "";
              row[yearMap.actualIndex] =
                yearData.previousYear2.totalQuarterSum || "";
            }

            if (yearData.previousYear1) {
              row[yearMap.targetIndex] =
                yearData.previousYear1.totalQuarterTarget || "";
              row[yearMap.actualIndex] =
                yearData.previousYear1.totalQuarterSum || "";
            }

            if (yearData.currentYear) {
              row[yearMap.targetIndex] =
                yearData.currentYear.totalQuarterTarget || "";
              row[yearMap.actualIndex] =
                yearData.currentYear.totalQuarterSum || "";
            }
          });

          // Add month-wise data for the current year
          sortedMonths.forEach((month) => {
            const monthData = kpi.kpidatamonthwise.find(
              (m: any) => m.kpiMonthYear === month
            );
            const monthMap = monthHeadersMap[month];
            row[monthMap.targetIndex] = monthData
              ? monthData.monthlyTarget || ""
              : "";
            row[monthMap.actualIndex] = monthData
              ? monthData.monthlySum || ""
              : "";
          });

          wsData.push(row);
        });
      }

      wsData.push([]); // Add an empty row for separation
    });

    return { wsData, wsMerge };
  };

  const handleExportButtonClick = async () => {
    try {
      // Construct the URL with encoded parameters
      const locationParam = modalLocation;
      const entityParam = modalEntity?.length > 0 ? modalEntity.join(",") : "";
      const categoryParam =
        modalCategory.length > 0 ? modalCategory.join(",") : "";
      const objParam =
        modalObjectives.length > 0 ? modalObjectives.join(",") : "";

      const apiurl = `/api/kpi-report/exportKpis?locationId=${encodeURIComponent(
        locationParam
      )}&entityId=${encodeURIComponent(
        entityParam
      )}&categoryId=${encodeURIComponent(
        categoryParam
      )}&objectiveId=${encodeURIComponent(objParam)}`;

      // Fetch data
      const result = await axios.get(apiurl);
      // console.log("Result:", result.data);

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Process each department separately
      Object.keys(result.data).forEach((departmentKey) => {
        const departmentData = result.data[departmentKey];
        // console.log(`Processing department: ${departmentKey}`, departmentData);

        // Transform data for the current department
        const { wsData, wsMerge } = transformDataForExcel(departmentData);

        // Create a worksheet from the data
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        if (wsMerge.length > 0) {
          ws["!merges"] = wsMerge;
        }

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, departmentKey); // Use departmentKey as sheet name
      });

      // Write the workbook to a binary string
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

      // Convert binary string to Blob
      const s2ab = (s: any) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
      };

      const blob = new Blob([s2ab(wbout)], {
        type: "application/octet-stream",
      });

      // Create a link element and trigger a download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const locationname = getLocationNameById(modalLocation);
      a.download = `${locationname}KPI_Data.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  // const handleExportButtonClick = async () => {
  //   try {
  //     // Prepare parameters for API request
  //     const locationParam = modalLocation;
  //     const entityParam = modalEntity?.length > 0 ? modalEntity.join(",") : "";
  //     const categoryParam =
  //       modalCategory.length > 0 ? modalCategory.join(",") : "";
  //     const objParam =
  //       modalObjectives.length > 0 ? modalObjectives.join(",") : "";

  //     // Construct API URL
  //     const apiurl = `/api/kpi-report/exportKpis?locationId=${encodeURIComponent(
  //       locationParam
  //     )}&entityId=${encodeURIComponent(
  //       entityParam
  //     )}&categoryId=${encodeURIComponent(
  //       categoryParam
  //     )}&objectiveId=${encodeURIComponent(objParam)}`;

  //     // Fetch data from API
  //     const result = await axios.get(apiurl);
  //     // console.log("Result:", result.data);

  //     // Create a new Excel workbook
  //     const workbook = new ExcelJS.Workbook();

  //     // Process each department's data
  //     Object.keys(result.data).forEach((departmentKey) => {
  //       const departmentData = result.data[departmentKey];
  //       const { wsData, wsMerge } = transformDataForExcel(departmentData);

  //       // Add a new worksheet for each department
  //       const worksheet = workbook.addWorksheet(departmentKey); // Use departmentKey as sheet name

  //       // Add data to the worksheet
  //       wsData.forEach((row, rowIndex) => {
  //         row.forEach((cell: any, cellIndex: any) => {
  //           const cellRef = worksheet.getCell(rowIndex + 1, cellIndex + 1);
  //           cellRef.value = cell;
  //         });
  //       });

  //       // const kpisLengths = result?.map((category:any) => category.kpis.length);

  //       // Convert the lengths array to a comma-separated string
  //       // const lengthsString = kpisLengths.join(",");

  //       // console.log(lengthsString);

  //       // Array of header row indices
  //       const headerRowIndices = [1, 7, 12]; // Example header rows

  //       // Style each header row
  //       headerRowIndices.forEach((headerRowIndex) => {
  //         worksheet
  //           .getRow(headerRowIndex)
  //           .eachCell({ includeEmpty: true }, (cell) => {
  //             cell.fill = {
  //               type: "pattern",
  //               pattern: "solid",
  //               fgColor: { argb: "FFFF00" }, // Yellow background color
  //             };
  //             cell.font = {
  //               bold: true,
  //             };
  //             cell.alignment = {
  //               horizontal: "center",
  //             };
  //           });
  //       });

  //       // Add merged cells
  //       wsMerge.forEach((merge) => {
  //         try {
  //           worksheet.mergeCells(
  //             merge.s.r + 1, // start row
  //             merge.s.c + 1, // start column
  //             merge.e.r + 1, // end row
  //             merge.e.c + 1 // end column
  //           );
  //         } catch (err) {
  //           console.error("Error merging cells:", err);
  //         }
  //       });
  //     });

  //     // Write workbook to buffer
  //     const buffer = await workbook.xlsx.writeBuffer();

  //     // Create a blob and trigger download
  //     const blob = new Blob([buffer], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     const locationname = getLocationNameById(modalLocation); // Modify if needed
  //     a.download = `${locationname}KPI_Data.xlsx`;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Error exporting data:", error);
  //   }
  // };

  const getLocationNameById = (id: any) => {
    const locname = location.find((loc: any) => loc.id === id);
    return locname ? locname.name : "Location not found";
  };

  useEffect(() => {
    getDayWiseData();
    setClicked(true);
  }, [dayTableData, categoryId]);

  useEffect(() => {
    getMonthWiseData();
    setClicked(true);
  }, [monthlyTableData, categoryId]);

  useEffect(() => {
    getQuartarWiseData();
    setClicked(true);
  }, [quaterTableData, categoryId]);

  const getLocationEntityBU = async () => {
    if (userDetail?.userType === "globalRoles") {
      // console.log("userDetail.additionalUnits", userDetail.additionalUnits);
      if (
        userDetail?.additionalUnits?.some(
          (unit: any) => unit.id === "All" || unit.locationName === "All"
        )
      ) {
        const res = await axios.get(`api/location/getAllLocationList`);
        if (res?.data) {
          setLocation(
            res?.data?.map((obj: any) => ({
              name: obj.locationName,
              id: obj.id,
            }))
          );
        }
      } else {
        setLocation(
          userDetail?.additionalUnits?.map((obj: any) => ({
            name: obj.locationName,
            id: obj.id,
          }))
        );
      }
    } else {
      await axios(`/api/kpi-report/getLocationEntityBU`).then((res) => {
        if (res?.data) {
          setLocation(
            res?.data?.map((obj: any) => ({
              name: obj.location.locationName,
              id: obj.location.id,
            }))
          );
          setBusinessUnit(
            res?.data
              ?.map((obj: any) => {
                const businessUnit = obj?.businessunit?.[0];
                if (businessUnit) {
                  const businessType = businessUnit.businessType;
                  if (businessType) {
                    return {
                      name: businessType.name,
                      id: businessType.id,
                    };
                  }
                }
                return null;
              })
              .filter(Boolean)
          );
        } else {
          setLocation([]);
        }

        // setEntity(
        //   res.data.flatMap((obj: any) =>
        //     obj.entityname.map((entity: any) => ({
        //       name: entity.entityName,
        //       id: entity.id,
        //     }))
        //   )
        // );
      });
    }
  };
  const getEntityByLocations = async () => {
    try {
      // console.log("kraReportData", kraReportData);
      const locationId =
        kraReportData.location !== ""
          ? kraReportData.location
          : userDetail?.locationId;

      const res = await axios.get(
        `/api/cara/getEntitiesForLocation/${locationId}`
      );

      if (res?.data) {
        setEntity([...res.data, { id: "All", entityName: "All" }]);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const getKraName = async () => {
    try {
      await axios(
        `/api/kpi-report/getCategoryForLocation?kpiLocation=${locationId}&kpiEntity=${entityId}&kpibusinessunit=${businessUnitId}`
      ).then((res) => {
        const uniqueKraNameList = res.data?.filter(
          (item: any, index: any, self: any) => {
            return (
              index ===
              self.findIndex((t: any) => t.categoryname === item?.categoryname)
            );
          }
        );

        setKraNameList(
          uniqueKraNameList
            .map((obj: any) => ({
              categoryid: obj.categoryid,
              categoryname: obj.categoryname,
            }))
            .sort((a: any, b: any) =>
              a.categoryname.localeCompare(b.categoryname)
            )
        );
      });
    } catch (error) {}
  };

  useEffect(() => {
    getyear();
    if (chartRef && chartRef.current) {
      (chartRef.current as any).chart.reflow();
    }
    getLocationEntityBU();
    setKraReportData(kraChart);
    carouselData();

    setKraReportData((prevState: any) => ({
      ...prevState,

      minDate: startDate,
      maxDate: new Date(),
      location: userDetail?.location?.id,
      entity: userDetail?.entity?.id,
      displayBy: "Month",
    }));
  }, []);
  // console.log("kraReportData", kraReportData);
  useEffect(() => {
    if (kraReportData?.minDate && kraReportData?.maxDate) {
      getDayWiseData();
      getMonthWiseData();
      getQuartarWiseData();
    }
    if (kraReportData?.location) {
      getEntityByLocations();
    }
    if (
      !!kraReportData.location &&
      // kraReportData.businessUnit &&
      !!kraReportData.entity
    ) {
      getKraName();
    }
  }, [kraReportData]);

  const findObject = (array: any[], key: string | number, value: any) => {
    return array.filter((object) => object[key] === value);
  };

  const handleChartDataClick = (data: any) => {};

  useEffect(() => {
    // getAllUOMs();
    if (selected === "Month") {
      setTableData(monthData);
      setTableColumn(monthColumns);
      setLabelData(allLabels);
    } else if (selected === "Quarter") {
      setTableData(quartarData);
      setTableColumn(quartarColumns);
      setLabelData(allQuarters);
    } else if (selected === "Year") {
      setTableData(yearData);
      setTableColumn(monthColumns);
      setLabelData(allLabels);
    } else {
      setTableData(dayData);
      setTableColumn(dayscolumns);
      setLabelData(allDays);
    }

    setClicked(false);
  }, [clicked, categoryId]);

  const colors = ["#003059", "#FF5733", "#F6D55C", "#3CAEA3", "#955196"];

  const KpiPercentageLinegraphData = {
    labels:
      kraReportData.displayBy === "Month"
        ? allLabels
        : kraReportData.displayBy === "Quarter"
        ? allQuarters
        : allDays.map((label: any) => label.split(" ")),
    datasets:
      kraReportData.displayBy === "Month"
        ? monthData.map((obj: any, index: number) => ({
            label: obj.kpi,
            data: obj.values,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            pointBorderColor: "black",
            fill: false,
            tension: 0.4,
          }))
        : kraReportData.displayBy === "Quarter"
        ? quartarData.map((obj: any, index: number) => ({
            label: obj.kpi,
            data: obj.values,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            pointBorderColor: "black",
            fill: false,
            tension: 0.4,
          }))
        : dayData.map((obj: any, index: number) => ({
            label: obj.kpi,
            data: obj.values,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            pointBorderColor: "black",
            fill: false,
            tension: 0.4,
          })),
  };

  const ActualVsTargetBargraphData = {
    // labels: kraReportData.uom ? kraNameWithUOM : uniquekpiName,
    labels: uniquekpiName,
    datasets: [
      {
        label: "Target",
        // data: kraReportData.uom ? totalTargetWithUOM : totalTarget,
        data: totalTarget,
        backgroundColor: "#185F8F",
        borderColor: "#185F8F",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
      },
      {
        label: "Actual",
        // data: kraReportData.uom ? totalActualWithUOM : totalvalue,
        data: totalvalue,
        backgroundColor: "#C65600",
        borderColor: "#C65600",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
      },
    ],
  };

  const ActualVsTargetVsAverageBargraphData = {
    // labels: kraReportData.uom ? kraNameWithUOM : uniquekpiName,
    labels: uniquekpiName,
    datasets: [
      {
        label: "Average",
        // data: kraReportData.uom ? totalAverageWithUOM : totalaverage,
        data: totalaverage,
        backgroundColor: "#C73659",
        borderColor: "#C73659",
        pointBorderColor: "black",
        fill: true,
        tension: 0.4,
        order: 0,
      },
      {
        label: "Actual",
        // data: kraReportData.uom ? totalActualWithUOM : totalvalue,
        data: totalvalue,
        backgroundColor: "#C65600",
        borderColor: "#C65600",
        pointBorderColor: "black",
        fill: true,
        tension: 0.4,
        order: 1,
      },
      {
        label: "Target",
        // data: kraReportData.uom ? totalTargetWithUOM : totalTarget,
        data: totalTarget,
        backgroundColor: "#185F8F",
        borderColor: "#185F8F",
        pointBorderColor: "black",
        fill: true,
        tension: 0.4,
        order: 2,
      },
    ],
  };
  const [selected1, setSelected1] = useState(false);

  const handleChange = (e: any) => {
    if (e.target.name === "minDate" || e.target.name === "maxDate") {
      setKraReportData((prev: any) => ({
        ...prev,
        [e.target.name]: e.target.valueAsDate,
      }));
      return;
    }
    setKraReportData({
      ...kraReportData,
      [e.target.name]: e.target.value,
    });
  };

  const handleModalChange = (e: any) => {};
  const reload = () => {
    if (selected === "Year") {
      setTableData(yearData);
    } else if (selected === "Month") {
      setTableData(monthData);
    } else if (selected === "Quarter") {
      setTableData(quartarData);
    } else {
      setTableData(dayData);
    }
    setKraReportData((prev: any) => ({
      ...prev,
      uom: "",
    }));
  };

  const inputLabel = React.useRef(null);

  const isMobile = useMediaQuery("(max-width: 960px)");

  const [selectedButton, setSelectedButton] = useState("month");

  const handleButtonClick = (buttonName: any) => {
    if (selectedButton === buttonName) {
      setSelectedButton("");
    } else {
      setSelectedButton(buttonName);
    }
  };

  const options = {
    plugins: {
      title: {
        display: false,
        text: "Chart.js Bar Chart - Stacked",
      },
    },
    responsive: true,
    maintainAspectRatio: false, // disable aspect ratio
    width: 400, // set chart width
    height: 200, // set chart height
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    elements: {
      point: {
        radius: 10,
        hoverRadius: 12,
        hitRadius: 15,
        backgroundColor: "rgba(255,99,132,1)",
        hoverBackgroundColor: "rgba(255,99,132,0.6)",
      },
    },
    legend: {
      position: "bottom",
    },
  };

  const labels = ["TestKPI", "AverageKPI", "BangTestKPI"];

  const data = {
    labels,
    datasets: [
      {
        label: "Target",
        data: [40, 120, 200],
        backgroundColor: "#DF5353",
        count: 3,
      },
      {
        label: "Average",
        data: [50, 63, 55],
        backgroundColor: "#F8B33E",
      },
      {
        label: "Actual",
        data: [25, 31.5, 27.5],
        backgroundColor: "#004480",
      },
    ],
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [performanceByTimeSeries, setPerformanceByTimeSeries] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setModalCategory([]);
    setModalEntity([]);
    setModalLocation("");
    setModalObjectives([]);
    setOpenModal(false);
  };
  const showModal = () => {
    setIsModalOpen(true);
    setPerformanceByTimeSeries(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setPerformanceByTimeSeries(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setPerformanceByTimeSeries(false);
  };

  // KPI Performance Summery

  const [isModalOpenSummary, setIsModalOpenSummary] = useState(false);

  const showModalSummary = () => {
    setIsModalOpenSummary(true);
  };

  const handleOkSummary = () => {
    setIsModalOpenSummary(false);
  };

  const handleCancelSummary = () => {
    setIsModalOpenSummary(false);
  };

  // KPI Target vs Actual

  const [isModalOpenKPItarget, setIsModalOpenKPItarget] = useState(false);

  const showModalKPItarget = () => {
    setIsModalOpenKPItarget(true);
  };

  const handleOkKPItarget = () => {
    setIsModalOpenKPItarget(false);
  };

  const handleCancelKPItarget = () => {
    setIsModalOpenKPItarget(false);
  };

  const CustomArrowDropDownIcon = (props: any) => (
    <MdArrowDropDown
      {...props}
      // style={{ color: selected1 ? "white" : "black" }}
      style={{ color: "black" }}
    /> // Inline style for color
  );

  const CustomArrowDropDownIcon2 = (props: any) => (
    <MdArrowDropDown {...props} style={{ color: "black" }} /> // Inline style for color
  );

  const [isModalOpenForObjective, setIsModalOpenForObjective] = useState(false);
  const [modalState, setModalState] = useState(false);
  // console.log("modalState", modalState);

  const showModalForObjective = () => {
    setIsModalOpenForObjective(true);
    setModalState(true);
  };

  const handleOkForObjective = () => {
    setIsModalOpenForObjective(false);
    setModalState(false);
  };

  const handleCancelForObjective = () => {
    setIsModalOpenForObjective(false);
    setModalState(false);
  };

  // carousel

  const carouselRef = useRef<any>(null);
  const [carousel, setCarousel] = useState<any>();
  const [categoryOptions, setCategoryOptions] = useState<any>();

  // console.log("carousel", carousel);

  const responsive = {
    0: { items: 1 },
    600: { items: 2 },
    1024: { items: 4 },
    1440: { items: 6 }, // Adjust for larger screens
  };

  const [tableLocationId, setTableLocationId] = useState([
    userDetails?.locationId,
  ]);
  const [tableEntityId, setTableEntityId] = useState([userDetails?.entityId]);

  // console.log("tableEntityId:", tableEntityId);
  const [selectedObjectiveIds, setSelectedObjectiveIds] = useState([]);
  // console.log("selectedObjectiveIds", selectedObjectiveIds);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<any>("");
  // console.log("selectedObjectiveId", selectedObjectiveId);

  const carouselData = async () => {
    try {
      const entityIds = Array.isArray(tableEntityId)
        ? tableEntityId?.join(",")
        : "";
      const locationIds = Array.isArray(tableLocationId)
        ? tableLocationId?.join(",")
        : "";

      const res = await axios.get(
        `/api/kpi-definition/kpiObjCountForCategory?locationId=${tableLocationId}&entityId=${tableEntityId}&organizationId=${userDetail?.organizationId}`
      );
      // console.log("res111", res);
      if (res.data && res.data.length > 0) {
        setCarousel(res);
        // setCategoryOptions(res?.data);
        setCategoryId(res.data[0]?.categoryId);
        setSelectedObjectiveIds(res.data[0]?.objectiveIds);

        const options = res.data?.map((category: any) => ({
          id: category.categoryId,
          name: category.categoryName,
        }));

        setCategoryOptions(options);
      } else {
        setCarousel([]);
        setCategoryOptions([]);
      }
    } catch (error) {
      console.error("Error fetching carousel data:", error);
    }
  };
  // const objData = async () => {
  //   try {
  //     const res = await axios.get(
  //       `/api/kpi-definition/kpiObjCountForCategory?locationId=${modalLocation}&entityId=${tableEntityId}&organizationId=${userDetail.organizationId}`
  //     );
  //     // console.log("res111", res);
  //     if (res.data && res.data.length > 0) {
  //     }
  //   } catch (error) {}
  // };
  useEffect(() => {
    carouselData();
    getMonthlyData(categoryId);
    getQuaterData(categoryId);
    getDayData(categoryId);
    getQuartarWiseData();
    getDayWiseData();
    getMonthWiseData();
  }, [tableEntityId, tableLocationId]);

  useEffect(() => {
    // setTableStartDate(getFiscalStartDate());
    // carouselData();
    if (categoryId !== null && tableStartDate !== null) {
      getMonthlyData(categoryId);
      getQuaterData(categoryId);
      getDayData(categoryId);
      getQuartarWiseData();
      getDayWiseData();
      getMonthWiseData();
    }
  }, [categoryId, selectedObjectiveId, selectedObjectiveIds]);

  const handleItemClick = (objectiveIds: any, categoryId: any, index: any) => {
    setSelectedObjectiveIds(objectiveIds);
    setCategoryId(categoryId);
    setSelectedIndex(index);
    setClicked(true);
    setSelectedObjectiveId(undefined);
    setSelectedOptionForObjective(null);

    if (selected === "Quarter") {
      getQuaterData(categoryId);
      getQuartarWiseData();
    } else if (selected === "Month") {
      getMonthlyData(categoryId);
      getMonthWiseData();
    } else if (selected === "Days") {
      getDayData(categoryId);
      getDayWiseData();
    } else if (selected === "Year") {
      getYearlyData(categoryId);
      getYearWiseData();
    }
  };
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = carousel?.data?.map((item: any, index: any) => (
    <div
      key={index}
      style={{
        padding: "10px",
        background: selectedIndex === index ? "#E8F3F9" : "white",
        borderRadius: "4px",
        textAlign: "center",
        border: "1px solid black",
        margin: "0px 10px",
      }}
      onClick={() => handleItemClick(item.objectiveIds, item.categoryId, index)}
    >
      <h3 style={{ margin: "0px" }}>{item?.categoryName}</h3>
      <p style={{ margin: "0px" }}>KPI: {item?.countKpis}</p>
      <p style={{ margin: "0px" }}>Objectives: {item?.countObjectives}</p>
    </div>
  ));

  // useEffect(() => {
  //   getyear();
  // }, []);

  const [currentYear, setCurrentYear] = useState<any>();
  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);

    return currentyear;
  };

  //calender popover

  const [open, setOpen] = useState(false);
  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  const { RangePicker } = DatePicker;

  const dateFormat = "YYYY/MM/DD";

  const handleDivClick = () => {
    setOpen(true);
  };

  // table data

  // console.log("selectedObjectiveId", selectedObjectiveId);

  const organization = userDetails.organization;
  const currentYears = new Date().getFullYear();
  const getFiscalStartDate = () => {
    if (organization.fiscalYearQuarters === "Jan - Dec") {
      return `${currentYears}-01-01`;
    } else if (organization.fiscalYearQuarters === "Apr - Mar") {
      return `${currentYears}-04-01`;
    }
    return `${currentYears}-04-01`; // default case if fiscalYearQuarters does not match expected values
  };

  const today = new Date();
  const getLastDateOfCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, "0")}-${String(
      lastDay
    ).padStart(2, "0")}`;
  };

  const [tableStartDate, setTableStartDate] = useState(getFiscalStartDate());
  const [tableEndDate, setTableEndDate] = useState(getLastDateOfCurrentMonth());
  // console.log("tableEndDate", tableEndDate);

  const handleRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setTableStartDate(dates[0].format(dateFormat));
      setTableEndDate(dates[1].format(dateFormat));
    }
  };

  // console.log("quaterTableData", quaterTableData);
  const getQuaterData = async (categoryIdValue: any) => {
    // console.log("categoryIdValue", categoryIdValue);

    let apiUrl = "";
    if (selectedObjectiveId) {
      apiUrl = `/api/kpi-report/getComputationForCategoryQuarterwise/${categoryIdValue}?startDate=${tableStartDate}&endDate=${tableEndDate}&location[]=${tableLocationId}&entity[]=${tableEntityId}&objectiveId=${selectedObjectiveId}`;
    } else {
      apiUrl = `/api/kpi-report/getComputationForCategoryQuarterwise/${categoryIdValue}?startDate=${tableStartDate}&endDate=${tableEndDate}&location[]=${tableLocationId}&entity[]=${tableEntityId}`;
    }

    try {
      const res = await axios.get(apiUrl);
      // setQuaterTableData([]);
      if (res.data) {
        setQuaterTableData(res.data);
      } else {
        setQuaterTableData([]);
      } // console.log("getQuaterData", res);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  // console.log("dayTableData", dayTableData);
  const getDayData = async (categoryIdValue: any) => {
    let apiUrl = `/api/kpi-report/getComputationForCategoryDaywise/${categoryIdValue}?gte=${tableStartDate}&lte=${tableEndDate}&location[]=${tableLocationId}&entity[]=${tableEntityId}`;

    if (selectedObjectiveId) {
      apiUrl += `&objectiveId=${selectedObjectiveId}`;
    }

    try {
      const res = await axios.get(apiUrl);
      // setDayTableData([]);
      if (res.data) {
        setDayTableData(res.data);
      }
      // console.log(" ", res);
      else {
        setDayTableData([]);
      }
    } catch (error) {
      console.error("Error fetching data", error);
      setDayTableData([]);
    }
  };

  // console.log("monthlyTableData", monthlyTableData);
  const getMonthlyData = async (categoryIdValue: any) => {
    let apiUrl = `/api/kpi-report/getComputationForCategoryMonthwise/${categoryIdValue}?startDate=${tableStartDate}&endDate=${tableEndDate}&location[]=${tableLocationId}&entity[]=${tableEntityId}`;

    if (selectedObjectiveId) {
      apiUrl += `&objectiveId=${selectedObjectiveId}`;
    }

    axios
      .get(apiUrl)
      .then((res) => {
        setMonthlyTableData(res?.data);
        // setYearlyTableData(res?.data);
      })
      .catch((error) => {
        setMonthlyTableData([]);
        console.error("Error fetching data", error);
      });
  };
  const getYearlyData = async (categoryIdValue: any) => {
    // console.log("tableStartDate", tableEndDate, tableStartDate);
    let apiUrl = `/api/kpi-report/getComputationForCategoryYearwise/${categoryIdValue}?startDate=${tableStartDate}&endDate=${tableEndDate}&location[]=${tableLocationId}&entity[]=${tableEntityId}`;

    if (selectedObjectiveId) {
      apiUrl += `&objectiveId=${selectedObjectiveId}`;
    }

    axios
      .get(apiUrl)
      .then((res) => {
        // setMonthlyTableData(res?.data);
        setYearlyTableData(res?.data);
      })
      .catch((error) => {
        setYearlyTableData([]);
        console.error("Error fetching data", error);
      });
  };

  const handleSelectEntityChange = (e: any) => {
    const { value } = e.target;
    setEntityId(value);
    setTableEntityId(value);
    handleChange(e);
  };

  // For handling changes in a select dropdown that allows multiple selections
  const handleSelectModalEntityChange = (event: any) => {
    const { value } = event.target;
    if (value.includes("All")) {
      setModalEntity(["All"]);
    } else {
      const filteredValue = value.filter((v: any) => v !== "All");
      setModalEntity(filteredValue);
    }
  };

  const handleSelectModalLocationChange = async (
    e: React.ChangeEvent<{ value: unknown }>
  ) => {
    const selectedOption: any = e.target.value as string;
    setModalLocation(selectedOption);

    // console.log("selectedOptions", selectedOption);

    // setModalEntity([]);
  };

  const handleSelectModalCategoryChange = async (
    e: React.ChangeEvent<{ value: unknown }>
  ) => {
    const selectedOptions = e.target.value as string[];

    // Update state with the selected options
    setModalCategory(selectedOptions);
    setModalObjectives([]);
    // console.log("selectedOptions", selectedOptions);
    try {
      const response = await axios.get(
        "/api/objective/getObjectivesForCategory",
        {
          params: {
            categoryId: selectedOptions,
          },
        }
      );

      if (response.data.length > 0) {
        const objectives = response?.data?.map((obj: any) => ({
          id: obj._id,
          name: obj.ObjectiveName,
        }));
        setModalObjectiveOptions(objectives);
      } else {
        setModalObjectiveOptions([]);
      }
    } catch (error) {
      setModalObjectiveOptions([]);
      console.error("Error fetching objectives:", error);
    }
  };

  const handleSelectModalObjectiveChange = (
    e: React.ChangeEvent<{ value: unknown }>
  ) => {
    const selectedOptions = e.target.value as string[];
    // console.log("selected options", typeof selectedOptions);
    setModalObjectives(selectedOptions);
  };

  // mobile view filter moda.

  const [isModalOpenMobileFilter, setIsModalOpenMobileFilter] = useState(false);

  const showModalMobileFilter = () => {
    setIsModalOpenMobileFilter(true);
  };

  const handleOkMobileFilter = () => {
    setIsModalOpenMobileFilter(false);
  };

  const handleCancelMobileFilter = () => {
    setIsModalOpenMobileFilter(false);
  };

  return (
    <>
      <div className={classes.root}>
        {/* <Grid item style={{ padding: "10px 0" }}>
          <Typography color="primary" variant="h6">
            {kraReportData?.kraName ? (
              <>
                {" "}
                for <strong> {kraReportData?.kraName}</strong>
              </>
            ) : (
              ""
            )}
          </Typography>
        </Grid> */}

        {matches ? (
          <Grid container style={{ paddingTop: "20px" }}>
            <Grid item sm={12} md={12}>
              <Grid
                container
                spacing={isMobile ? 3 : 0}
                // justifyContent={isMobile ? undefined : "space-between"}
                style={{ display: "flex", justifyContent: "space-evenly" }}
              >
                <Grid item style={{ width: "20%" }}>
                  {/* <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                >
                  <Autocomplete
                    options={kraNameList}
                    disabled={true}
                    getOptionLabel={(op) => op?.categoryname}
                    value={
                      kraNameList.filter(
                        (op) => op?.categoryname === kraReportData?.kraName
                      )[0]
                        ? kraNameList.filter(
                            (op) => op?.categoryname === kraReportData?.kraName
                          )[0]
                        : null
                    }
                    // onChange={(e, newValue) => {
                    //   setKraReportData((prev: any) => ({
                    //     ...prev,
                    //     kraName: newValue?.categoryname,
                    //   }));
                    //   setCategoryName(newValue?.categoryname);
                    //   setKraId(newValue?.categoryid);
                    //   setReportDateSet(new Set());
                    //   setReportMonthSet(new Set());
                    //   setReportQuarterSet(new Set());
                    //   setSelected1(!!newValue);
                    // }}
                    renderInput={(params) => {
                      return (
                        <TextField
                          {...params}
                          variant="outlined"
                          // label="Category"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          placeholder="Business Type"
                          className={
                            selected1 ? classes.textField : classes.textField2
                          }
                          // required
                        />
                      );
                    }}
                  />
                </FormControl> */}
                </Grid>

                <Grid item style={{ width: "20%" }}>
                  {/* <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                >
                  <Autocomplete
                    options={kraNameList}
                    disabled={true}
                    getOptionLabel={(op) => op?.categoryname}
                    value={
                      kraNameList.filter(
                        (op) => op?.categoryname === kraReportData?.kraName
                      )[0]
                        ? kraNameList.filter(
                            (op) => op?.categoryname === kraReportData?.kraName
                          )[0]
                        : null
                    }
                    // onChange={(e, newValue) => {
                    //   setKraReportData((prev: any) => ({
                    //     ...prev,
                    //     kraName: newValue?.categoryname,
                    //   }));
                    //   setCategoryName(newValue?.categoryname);
                    //   setKraId(newValue?.categoryid);
                    //   setReportDateSet(new Set());
                    //   setReportMonthSet(new Set());
                    //   setReportQuarterSet(new Set());
                    //   setSelected1(!!newValue);
                    // }}
                    renderInput={(params) => {
                      return (
                        <TextField
                          {...params}
                          variant="outlined"
                          // label="Category"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          placeholder="Business"
                          className={
                            selected1 ? classes.textField : classes.textField2
                          }
                          // required
                        />
                      );
                    }}
                  />
                </FormControl> */}
                </Grid>

                <Grid item style={{ width: "20%" }}>
                  {/* <div style={{ display: "flex", flexDirection: "row" }}> */}
                  {/* <Grid xs={12} md={11}> */}
                  {/* <Tooltip title={kraReportData.kraName}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <Autocomplete
                      options={kraNameList}
                      disabled={true}
                      getOptionLabel={(op) => op?.categoryname}
                      value={
                        kraNameList.filter(
                          (op) => op?.categoryname === kraReportData?.kraName
                        )[0]
                          ? kraNameList.filter(
                              (op) =>
                                op?.categoryname === kraReportData?.kraName
                            )[0]
                          : null
                      }
                      // onChange={(e, newValue) => {
                      //   setKraReportData((prev: any) => ({
                      //     ...prev,
                      //     kraName: newValue?.categoryname,
                      //   }));
                      //   setCategoryName(newValue?.categoryname);
                      //   setKraId(newValue?.categoryid);
                      //   setReportDateSet(new Set());
                      //   setReportMonthSet(new Set());
                      //   setReportQuarterSet(new Set());
                      //   setSelected1(!!newValue);
                      // }}
                      renderInput={(params) => {
                        return (
                          <TextField
                            {...params}
                            variant="outlined"
                            // label="Category"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            placeholder="Functions"
                            className={
                              selected1 ? classes.textField : classes.textField2
                            }
                            // required
                          />
                        );
                      }}
                    />
                  </FormControl>
                </Tooltip> */}
                  {/* </Grid> */}
                  {/* </div> */}
                </Grid>

                <Grid item style={{ width: "20%" }}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <InputLabel shrink ref={inputLabel}>
                      Unit
                    </InputLabel>
                    <Select
                      label="Location"
                      name="location"
                      value={kraReportData.location}
                      input={<OutlinedInput notched labelWidth={80} />}
                      onChange={(e: any) => {
                        handleChange(e);
                        setLocationId(e.target.value);
                        setTableLocationId(e.target.value);
                      }}
                      data-testid="location"
                      required
                      IconComponent={CustomArrowDropDownIcon}
                      // className={classes.select}
                    >
                      {location.map((obj) => (
                        <MenuItem key={obj.id} value={obj.id}>
                          {obj.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item style={{ width: "20%" }}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <InputLabel shrink ref={inputLabel}>
                      Dept/Vertical
                    </InputLabel>
                    <Select
                      // multiple
                      label="Entity"
                      name="entity"
                      value={kraReportData.entity || []} // Ensure this is an array
                      input={<OutlinedInput notched labelWidth={80} />}
                      onChange={handleSelectEntityChange}
                      data-testid="entity"
                      required
                      // className={classes.select}
                      IconComponent={CustomArrowDropDownIcon2}
                    >
                      {entity.map((obj) => {
                        if (obj && obj.id) {
                          return (
                            <MenuItem key={obj.id} value={obj.id}>
                              {obj.entityName}
                            </MenuItem>
                          );
                        }
                        // Don't render anything if the object is undefined or doesn't have an "id" property
                        return null;
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                {/* <Grid
                item
                xs={12}
                md={1}
                style={{
                  display: "flex",
                  justifyContent: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "left",
                    marginLeft: "-20px",
                  }}
                >
                  <YearComponent
                    currentYear={currentYear}
                    setCurrentYear={setCurrentYear}
                  />
                </div>
              </Grid> */}
              </Grid>
            </Grid>
          </Grid>
        ) : null}

        <div
          style={{
            position: "relative",
            margin: matches ? "10px 50px" : "10px 10px",
            // display: "flex",
            // alignItems: "center",
          }}
          // className={classes.carousel}
        >
          <AliceCarousel
            mouseTracking
            items={items}
            responsive={responsive}
            controlsStrategy="alternate"
            autoPlay={false}
            infinite={false}
            disableButtonsControls={true} // Disable default buttons
            ref={carouselRef} // Reference to the carousel instance
            renderDotsItem={() => null} // Disable default dots
          />
          {carousel?.data?.length > 0 ? (
            <>
              <IconButton
                style={{
                  position: "absolute",
                  top: "30%",
                  left: -40,
                  transform: "translateY(-50%)",
                }}
                onClick={() => carouselRef.current.slidePrev()} // Navigate to the previous item
              >
                <MdChevronLeft />
              </IconButton>
              <IconButton
                style={{
                  position: "absolute",
                  top: "30%",
                  right: -40,
                  transform: "translateY(-50%)",
                }}
                onClick={() => carouselRef.current.slideNext()} // Navigate to the next item
              >
                <MdChevronRight />
              </IconButton>
            </>
          ) : (
            <></>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: matches ? "row" : "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {matches ? (
            <div
              style={{
                width: matches ? "20%" : "100%",
                display: "flex",
                justifyContent: matches ? "center" : "start",
              }}
            >
              <Button
                variant="contained"
                startIcon={<AiOutlineFileExcel />}
                onClick={handleOpenModal}
                style={{}}
              >
                Export To Excel
              </Button>
            </div>
          ) : null}
          <div style={{ width: matches ? "30vw" : "100%" }}>
            <KraTableFilters
              selectedObjectiveIds={selectedObjectiveIds}
              setSelectedObjectiveId={setSelectedObjectiveId}
              selectedOptionForObjective={selectedOptionForObjective}
              setSelectedOptionForObjective={setSelectedOptionForObjective}
              getQuaterData={getQuaterData}
              getDayData={getDayData}
              getMonthlyData={getMonthlyData}
              getMonthWiseData={getMonthWiseData}
              getQuartarWiseData={getQuartarWiseData}
              getDayWiseData={getDayWiseData}
            />
          </div>
          <div
            style={{
              marginRight: matches ? "20px" : "0px",
              width: matches ? "20vw" : "100%",
            }}
          >
            <RangePicker
              format="YYYY/MM/DD"
              onChange={handleRangeChange}
              defaultValue={[
                dayjs(tableStartDate, "YYYY-MM-DD"),
                dayjs(tableEndDate, "YYYY-MM-DD"),
              ]}
              style={{ borderColor: "black", width: "100%" }}
              suffixIcon={<AiOutlineCalendar style={{ color: "black" }} />}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: matches ? "end" : "space-between",
              width: matches ? "20vw" : "100%",
              marginRight: matches ? "30px" : "0px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "start",
              }}
            >
              <Tooltip title={"Yearly"}>
                <Button
                  style={{
                    backgroundColor: selectedButton === "year" ? "#b3cce6" : "",
                    color: "black",
                  }}
                  className={classes.displayButton}
                  variant="outlined"
                  color={selectedButton === "year" ? "secondary" : "primary"}
                  onClick={() => {
                    handleButtonClick("year");
                    setKraReportData((prev: any) => ({
                      ...prev,
                      displayBy: "Year",
                    }));
                    setSelected("Year");
                    setClicked(true);
                    getYearlyData(categoryId);
                    getYearWiseData();
                  }}
                >
                  Y
                </Button>
              </Tooltip>
              <Tooltip title={"Quarterly"}>
                <Button
                  style={{
                    backgroundColor:
                      selectedButton === "quarter" ? "#b3cce6" : "",
                    color: "black",
                  }}
                  className={classes.displayButton}
                  variant="outlined"
                  color={selectedButton === "quarter" ? "secondary" : "primary"}
                  onClick={() => {
                    handleButtonClick("quarter");
                    setKraReportData((prev: any) => ({
                      ...prev,
                      displayBy: "Quarter",
                    }));
                    setSelected("Quarter");
                    setClicked(true);
                    getQuaterData(categoryId);
                    getQuartarWiseData();
                  }}
                >
                  Q
                </Button>
              </Tooltip>
              <Tooltip title={"Monthly"}>
                <Button
                  style={{
                    backgroundColor:
                      selectedButton === "month" ? "#b3cce6" : "",
                    color: "black",
                  }}
                  className={classes.displayButton}
                  variant="outlined"
                  color={selectedButton === "month" ? "secondary" : "primary"}
                  onClick={() => {
                    handleButtonClick("month");
                    setKraReportData((prev: any) => ({
                      ...prev,
                      displayBy: "Month",
                    }));
                    setSelected("Month");
                    setClicked(true);
                    getMonthlyData(categoryId);
                    getMonthWiseData();
                  }}
                >
                  M
                </Button>
              </Tooltip>

              <Tooltip title={"Daily"}>
                <Button
                  style={{
                    backgroundColor: selectedButton === "day" ? "#b3cce6" : "",
                    color: "black",
                  }}
                  className={classes.displayButton}
                  variant="outlined"
                  color={selectedButton === "day" ? "secondary" : "primary"}
                  onClick={() => {
                    handleButtonClick("day");
                    setKraReportData((prev: any) => ({
                      ...prev,
                      displayBy: "Days",
                    }));
                    setSelected("Days");
                    setClicked(true);
                    getDayData(categoryId);
                    getDayWiseData();
                  }}
                >
                  D
                </Button>
              </Tooltip>
            </div>

            {matches ? null : (
              <Button
                startIcon={<AiOutlineFileExcel />}
                onClick={handleOpenModal}
                style={{}}
              ></Button>
            )}
          </div>
        </div>

        <Divider orientation="horizontal" style={{ marginTop: "8px" }} />
        <Grid
          container
          style={{
            display: "flex",
            flexDirection: "row",
            paddingTop: "20px",
          }}
        >
          <Grid container justifyContent="space-between">
            <Grid item xs={12} md={3}>
              <div
                className={classes.container}
                style={{ border: "1px solid #EFEFEF" }}
              >
                <div
                  style={{
                    width: matches ? "360px" : "98%",
                    height: matches ? "330px" : "300px",
                    border: "1px solid #D7CDC1",
                    padding: "10px",
                    marginRight: "3px",
                    display: "flex",
                  }}
                >
                  <ObjectivePerformanceChart
                    selected={selected}
                    monthlyTableData={monthlyTableData}
                    quaterTableData={quaterTableData}
                    dayTableData={dayTableData}
                    yearlyTableData={yearlyTableData}
                  />
                  {/* <AiOutlineArrowsAlt onClick={showModalKPItarget} /> */}
                </div>
              </div>

              <div
                className={classes.container}
                style={{ border: "1px solid #EFEFEF" }}
              >
                <div
                  style={{
                    width: matches ? "360px" : "98%",
                    height: "330px",
                    border: "1px solid #D7CDC1",
                    padding: "10px",
                    marginRight: "3px",
                    display: "flex",
                  }}
                >
                  <DriftAnalysisChart
                    selected={selected}
                    monthlyTableData={monthlyTableData}
                    quaterTableData={quaterTableData}
                    dayTableData={dayTableData}
                    yearlyTableData={yearlyTableData}
                  />
                  {/* <AiOutlineArrowsAlt onClick={showModalKPItarget} /> */}
                </div>
              </div>

              <div
                className={classes.container}
                style={{ border: "1px solid #EFEFEF" }}
              >
                <div
                  style={{
                    // width:
                    //   ActualVsTargetBargraphData.labels.length > 5
                    //     ? "800px"
                    //     : "",
                    width: matches ? "360px" : "98%",
                    height: matches ? "330px" : "350px",
                    border: "1px solid #D7CDC1",
                    padding: "10px",
                    marginRight: "3px",
                    display: "flex",
                  }}
                >
                  <ReportGraphComponent
                    chartType={ChartType.BAR}
                    displayTitle={true}
                    title="KPI Target vs Actual"
                    legendsAlignment={Alignment.START}
                    legendsPosition={Position.BOTTOM}
                    isStacked={false}
                    chartData={ActualVsTargetBargraphData}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="TargetvsActual"
                  />
                  {matches ? (
                    <AiOutlineArrowsAlt onClick={showModalKPItarget} />
                  ) : null}
                </div>
              </div>
            </Grid>

            <Modal
              // title="Basic Modal"
              open={isModalOpenKPItarget}
              onOk={handleOkKPItarget}
              onCancel={handleCancelKPItarget}
              // width="90vw"
              style={{ display: "flex", justifyContent: "center" }}
              footer={null}
              closeIcon={
                <img
                  src={CloseIconImageSvg}
                  alt="close-drawer"
                  style={{
                    width: "30px",
                    height: "38px",
                    cursor: "pointer",
                    marginTop: "-5px",
                  }}
                />
              }
            >
              <div
                style={{
                  // width: "80vw",
                  width: "85vw",
                  height: "450px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ReportGraphComponent
                  chartType={ChartType.BAR}
                  displayTitle={true}
                  title="KPI Target vs Actual"
                  legendsAlignment={Alignment.START}
                  legendsPosition={Position.BOTTOM}
                  isStacked={false}
                  chartData={ActualVsTargetBargraphData}
                  handleChartDataClick={handleChartDataClick}
                  searchTitle="TargetvsActual"
                />
              </div>
            </Modal>

            <Grid item xs={12} md={3}>
              <div
                className={classes.container}
                style={{ border: "1px solid #EFEFEF" }}
              >
                <div
                  style={{
                    width: matches ? "360px" : "98%",
                    height: "330px",
                    border: "1px solid #D7CDC1",
                    padding: "10px",
                    marginRight: "3px",
                    display: "flex",
                  }}
                >
                  <ObjectiveTimeSeriesChart
                    selected={selected}
                    monthlyTableData={monthlyTableData}
                    quaterTableData={quaterTableData}
                    dayTableData={dayTableData}
                    yearlyTableData={yearlyTableData}
                    modalState={modalState}
                  />
                  {matches ? (
                    <AiOutlineArrowsAlt onClick={showModalForObjective} />
                  ) : null}
                </div>
              </div>

              <Modal
                // title="Basic Modal"
                open={isModalOpenForObjective}
                onOk={handleOkForObjective}
                onCancel={handleCancelForObjective}
                // width="90vw"
                style={{ display: "flex", justifyContent: "center" }}
                footer={null}
                closeIcon={
                  <img
                    src={CloseIconImageSvg}
                    alt="close-drawer"
                    style={{
                      width: "30px",
                      height: "38px",
                      cursor: "pointer",
                      marginTop: "-5px",
                    }}
                  />
                }
              >
                <div
                  style={{
                    width: "85vw",
                    height: "450px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ObjectiveTimeSeriesChart
                    selected={selected}
                    monthlyTableData={monthlyTableData}
                    quaterTableData={quaterTableData}
                    dayTableData={dayTableData}
                    yearlyTableData={yearlyTableData}
                    modalState={modalState}
                  />
                </div>
              </Modal>

              <div
                className={classes.container}
                style={{ border: "0.2px solid #EFEFEF" }}
              >
                <div
                  style={{
                    width: matches ? "360px" : "98%",
                    height: "330px",
                    border: "1px solid #D7CDC1",
                    padding: "10px",
                    marginLeft: "3px",
                    display: "flex",
                  }}
                >
                  <ReportGraphComponent
                    chartType={ChartType.LINE}
                    displayTitle={true}
                    title=" Performance By Time Series"
                    legendsAlignment={Alignment.START}
                    legendsPosition={Position.BOTTOM}
                    isStacked={false}
                    chartData={KpiPercentageLinegraphData}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="TargetvsActual"
                    performanceByTimeSeries={performanceByTimeSeries}
                  />
                  {matches ? <AiOutlineArrowsAlt onClick={showModal} /> : null}
                </div>
              </div>
              <Modal
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                style={{ display: "flex", justifyContent: "center" }}
                footer={null}
                closeIcon={
                  <img
                    src={CloseIconImageSvg}
                    alt="close-drawer"
                    style={{
                      width: "30px",
                      height: "38px",
                      cursor: "pointer",
                      marginTop: "-5px",
                    }}
                  />
                }
              >
                <div
                  style={{
                    // width: "80vw",
                    width: "85vw",
                    height: "450px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ReportGraphComponent
                    chartType={ChartType.LINE}
                    displayTitle={true}
                    title=" Performance By Time Series"
                    legendsAlignment={Alignment.START}
                    legendsPosition={Position.BOTTOM}
                    isStacked={false}
                    chartData={KpiPercentageLinegraphData}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="TargetvsActual"
                    performanceByTimeSeries={performanceByTimeSeries}
                  />
                </div>
              </Modal>
              <div
                className={classes.container}
                style={{ border: "0.2px solid #EFEFEF" }}
              >
                <div
                  style={{
                    // width:
                    //   ActualVsTargetVsAverageBargraphData.labels.length > 5
                    //     ? "800px"
                    //     : "",
                    width: matches ? "360px" : "98%",
                    height: matches ? "330px" : "350px",
                    // paddingTop: "50px",
                    border: "1px solid #D7CDC1",
                    padding: "10px",
                    marginLeft: "3px",
                    display: "flex",
                  }}
                >
                  {/* <Bar options={options} data={data} /> */}
                  {/* <StackBarChart /> */}
                  <ReportGraphComponent
                    chartType={ChartType.BAR}
                    displayTitle={true}
                    title="KPI Performance Summary"
                    legendsAlignment={Alignment.START}
                    legendsPosition={Position.BOTTOM}
                    isOverlap={true}
                    isStacked={true}
                    chartData={ActualVsTargetVsAverageBargraphData}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="TargetvsActualvsAverage"
                    removeDataLabels={true}
                    // datalabels={{display: false}}
                  />
                  {matches ? (
                    <AiOutlineArrowsAlt onClick={showModalSummary} />
                  ) : null}
                </div>
              </div>
            </Grid>

            <Modal
              // title="Basic Modal"
              open={isModalOpenSummary}
              onOk={handleOkSummary}
              onCancel={handleCancelSummary}
              // width="90vw"
              style={{ display: "flex", justifyContent: "center" }}
              footer={null}
              closeIcon={
                <img
                  src={CloseIconImageSvg}
                  alt="close-drawer"
                  style={{
                    width: "30px",
                    height: "38px",
                    cursor: "pointer",
                    marginTop: "-5px",
                  }}
                />
              }
            >
              <div
                style={{
                  // width: "80vw",
                  width: "85vw",
                  height: "450px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ReportGraphComponent
                  chartType={ChartType.BAR}
                  displayTitle={true}
                  title="KPI Performance Summary"
                  legendsAlignment={Alignment.START}
                  legendsPosition={Position.BOTTOM}
                  isOverlap={true}
                  isStacked={true}
                  chartData={ActualVsTargetVsAverageBargraphData}
                  handleChartDataClick={handleChartDataClick}
                  searchTitle="TargetvsActualvsAverage"
                  removeDataLabels={true}
                  // datalabels={{display: false}}
                />
              </div>
            </Modal>

            <Grid item xs={12} md={6} style={{ paddingLeft: "1%" }}>
              <div style={{ marginBottom: matches ? "" : "200px" }}>
                <KraDashboardTable
                  selected={selected}
                  monthlyTableData={monthlyTableData}
                  quaterTableData={quaterTableData}
                  dayTableData={dayTableData}
                  yearlyTableData={yearlyTableData}
                />
              </div>

              {/* <KraGraphTable
                columns={
                  TableColumn
                  // selected === "Month"
                  //   ? monthColumns
                  //   : selected === "Quarter"
                  //   ? quartarColumns
                  //   : dayscolumns
                }
                data={TableData}
                rowGrouping={["categoryname"]}
                showToolbar
                reportDates={reportDates}
              /> */}
            </Grid>
          </Grid>
        </Grid>
        <Modal
          title="Export Filters"
          visible={openModal}
          onCancel={handleCloseModal}
          width={800}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              onClick={handleCloseModal}
              style={{ width: "36px", height: "38px", cursor: "pointer" }}
            />
          }
          footer={[
            <Button
              variant="contained"
              style={{ marginLeft: "10px", marginTop: "15px" }}
              color="primary"
              onClick={() => {
                handleExportButtonClick();
              }}
            >
              Export
            </Button>,
          ]}
        >
          <Grid
            container
            spacing={isMobile ? 3 : 0}
            // justifyContent={isMobile ? undefined : "space-between"}
            style={{ display: "flex", justifyContent: "space-evenly" }}
          >
            <Grid item style={{ width: "50%", marginTop: "10px" }}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <InputLabel shrink ref={inputLabel}>
                  Unit
                </InputLabel>
                <Select
                  label="Location"
                  name="location"
                  value={modalLocation}
                  input={<OutlinedInput notched labelWidth={80} />}
                  onChange={handleSelectModalLocationChange}
                  data-testid="location"
                  required
                  IconComponent={CustomArrowDropDownIcon}
                  // className={classes.select}
                >
                  {location.map((obj) => (
                    <MenuItem key={obj.id} value={obj.id}>
                      {obj.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item style={{ width: "50%", marginTop: "10px" }}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <InputLabel shrink ref={inputLabel}>
                  Dept/Vertical
                </InputLabel>
                <Select
                  multiple
                  label="Entity"
                  name="entity"
                  value={modalEntity} // Ensure this is an array
                  input={<OutlinedInput notched labelWidth={100} />}
                  onChange={handleSelectModalEntityChange}
                  data-testid="entity"
                  required
                  // className={classes.select}
                  IconComponent={CustomArrowDropDownIcon2}
                >
                  {modalEntityOptions.map((obj) => {
                    if (obj && obj.id) {
                      return (
                        <MenuItem key={obj.id} value={obj.id}>
                          {obj.name}
                        </MenuItem>
                      );
                    }

                    return null;
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={isMobile ? 3 : 0}
            // justifyContent={isMobile ? undefined : "space-between"}
            style={{ display: "flex", justifyContent: "space-evenly" }}
          >
            <Grid item style={{ width: "50%", marginTop: "15px" }}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <InputLabel shrink ref={inputLabel}>
                  Category
                </InputLabel>
                <Select
                  label="Category"
                  name="category"
                  multiple
                  value={modalCategory}
                  input={<OutlinedInput notched labelWidth={80} />}
                  onChange={handleSelectModalCategoryChange}
                  data-testid="category"
                  required
                  IconComponent={CustomArrowDropDownIcon}
                  // className={classes.select} // Uncomment if you have custom styles
                >
                  {categoryOptions?.length > 0
                    ? categoryOptions.map((obj: any) => (
                        <MenuItem key={obj.id} value={obj.id}>
                          {obj.name}
                        </MenuItem>
                      ))
                    : []}
                </Select>
              </FormControl>
            </Grid>

            <Grid item style={{ width: "50%", marginTop: "15px" }}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <InputLabel shrink ref={inputLabel}>
                  Objectives
                </InputLabel>
                <Select
                  multiple
                  label="Objective"
                  name="objective"
                  value={modalObjectives}
                  input={<OutlinedInput notched labelWidth={80} />}
                  onChange={handleSelectModalObjectiveChange}
                  data-testid="objective"
                  required
                  // className={classes.select}
                  IconComponent={CustomArrowDropDownIcon2}
                >
                  {modalObjectiveOptions?.length > 0
                    ? modalObjectiveOptions?.map((obj: any) => (
                        <MenuItem key={obj.id} value={obj.id}>
                          {obj.name}
                        </MenuItem>
                      ))
                    : []}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Modal>
      </div>

      {matches ? (
        ""
      ) : (
        <div
          style={{
            paddingTop: "3px",
            position: "absolute",
            top: 82,
            right: 30,
          }}
        >
          <FilterIcon
            style={{ width: "24px", height: "24px" }}
            onClick={showModalMobileFilter}
          />
        </div>
      )}

      <Modal
        title={
          <div
            style={{
              backgroundColor: "#E8F3F9",
              padding: "8px",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            }}
          >
            Filter By
          </div>
        }
        open={isModalOpenMobileFilter}
        onOk={handleOkMobileFilter}
        onCancel={handleCancelMobileFilter}
        // className={classes.modal}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "30px",
              cursor: "pointer",
              padding: "0px",
              margin: "7px 15px 0px 0px",
            }}
          />
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            // marginTop: "20px",
            // border: "1px solid rgba(19, 171, 155, 0.5)",
            // borderRadius: "12px",
            // padding: "20px",
            // margin: "20px 20px 10px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <span style={{ color: "black" }}>Unit:</span>

            <Select
              label="Location"
              name="location"
              value={kraReportData.location}
              input={<OutlinedInput notched labelWidth={80} />}
              onChange={(e: any) => {
                handleChange(e);
                setLocationId(e.target.value);
                setTableLocationId(e.target.value);
              }}
              data-testid="location"
              required
              IconComponent={CustomArrowDropDownIcon}
              // className={classes.select}
            >
              {location.map((obj) => (
                <MenuItem key={obj.id} value={obj.id}>
                  {obj.name}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <span>Dept/Vertical:</span>

            <Select
              // multiple
              label="Entity"
              name="entity"
              value={kraReportData.entity || []} // Ensure this is an array
              input={<OutlinedInput notched labelWidth={80} />}
              onChange={handleSelectEntityChange}
              data-testid="entity"
              required
              // className={classes.select}
              IconComponent={CustomArrowDropDownIcon2}
            >
              {entity.map((obj) => {
                if (obj && obj.id) {
                  return (
                    <MenuItem key={obj.id} value={obj.id}>
                      {obj.entityName}
                    </MenuItem>
                  );
                }
                // Don't render anything if the object is undefined or doesn't have an "id" property
                return null;
              })}
            </Select>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default KraGraph;
