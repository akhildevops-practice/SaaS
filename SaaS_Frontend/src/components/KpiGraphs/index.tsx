import React, { useEffect, useRef, useState } from "react";
import { format, parse } from "date-fns";
import {
  MdArrowDownward,
  MdArrowRightAlt,
  MdArrowUpward,
  MdRotateLeft,
} from "react-icons/md";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale, // x-axis
  LinearScale, // y-axis
  PointElement,
  Legend,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Alignment, ChartType, Position } from "../../utils/enums";
import {
  Button,
  FormControl,
  Grid,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  useMediaQuery,
  Tooltip,
  Paper,
} from "@material-ui/core";
import { useStyles } from "./styles";
import { Autocomplete } from "@material-ui/lab";
import ReportGraphComponent from "../ReportGraphComponent";
import KpiGraphsTable from "../KpiGraphsTable";
import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsReact from "highcharts-react-official";
import SolidGauge from "highcharts/modules/solid-gauge";
import axios from "../../apis/axios.global";
import { useRecoilState } from "recoil";
import { kpiChart } from "../../recoil/atom";
import { MdOutlineImportExport } from "react-icons/md";
import getAppUrl from "utils/getAppUrl";
import { MdSettingsEthernet } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { AiOutlineArrowsAlt, AiOutlineCloseCircle } from "react-icons/ai";
import { Breadcrumb, DatePicker, Modal } from "antd";
import { MdArrowDropDown } from "react-icons/md";
import SummaryChartKPI from "./SummaryChartKPI";
import { ReactComponent as FilterIcon } from "../../assets/documentControl/Filter.svg";
import KpiLeaderBoard from "./KpiLeaderBoard";
import { useSnackbar } from "notistack";
import { Button as AntButton } from "antd";
import { Select as AntSelect } from "antd";
import dayjs from "dayjs";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
import { BiReset } from "react-icons/bi";

HighchartsMore(Highcharts);
SolidGauge(Highcharts);

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  ChartTooltip
);

function KpiGraphs() {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const { enqueueSnackbar } = useSnackbar();
  const locationstate = useLocation();
  const classes = useStyles(matches)();

  //------required states -----

  //----------chart data states-------
  const [kpiReportData, setKpiReportData] = useRecoilState(kpiChart);
  const [dayData, setDayData] = useState<any[]>([]);
  const [yearData, setYearData] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [quarterData, setQuarterData] = useState<any[]>([]);
  const [kpiNameList, setKpiNameList] = useState<any[]>([]);
  const [TableData, setTableData] = useState<any[]>([]);
  const [newKPIChartData, setNewKPIChartData] = useState();
  // ------------ leader board states---------
  const [targetValue, setTargetValue] = useState<any>();
  const [avgTargetValue, setAvgTargetValue] = useState<any>();
  const [actualValue, setActualValue] = useState<any>();
  const [percentageValue, setPercentageValue] = useState<any>();

  //-----------Unit and department  filters states ---------|

  const [selectedLocation, setSelectedLocation] = useState<any>(
    userInfo?.locationId
  );
  const [selectedEntity, setSelectedEntity] = useState<any>(
    userInfo?.entity?.id
  );
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [disableDept, setDisableDept] = useState<any>(false);

  const [unit, setUnit] = useState<any>(userInfo?.locationId);
  const [entity2, setEntity2] = useState<any>(userInfo?.entity?.id);

  //--------KPi, date,buttons filter--------------
  const [kpiId, setKpiId] = useState<string>();

  const startDate = getStartDate(userDetail.organization.fiscalYearQuarters);
  const dateDisplayFormat = "DD-MM-YYYY";
  const dateStorageFormat = "YYYY-MM-DD";
  const [minDate, setMinDate] = useState<string | undefined>(
    dayjs(startDate).format(dateStorageFormat)
  );
  const [maxDate, setMaxDate] = useState<string | undefined>(
    dayjs().endOf("month").format(dateStorageFormat)
  );
  const [selectedButton, setSelectedButton] = useState("year");

  //------check these states reqired or not ------------
  const [frequencyType, setFrequencyType] = useState();
  const [clicked, setClicked] = useState<boolean>(false);
  const [isNewRowAdding, setIsNewRowAdding] = useState(false);
  const [newRowData, setNewRowData] = useState<any>({});

  const [locationId, setLocationId] = useState<string>(userDetail.locationId);
  const [currentTab, setCurrentTab] = useState("Summary");

  //-------requied useeffects ----------

  useEffect(() => {
    getLocationOptions();
    getDepartmentOptions(userInfo?.location?.id);
  }, []);

  useEffect(() => {
    getKpiName();
  }, [selectedLocation, selectedEntity]);

  useEffect(() => {
    if (selectedLocation) {
      setKpiReportData((prev: any) => ({
        ...prev,
        location: selectedLocation,
      }));
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedEntity) {
      setKpiReportData((prev: any) => ({
        ...prev,
        entity: selectedEntity,
      }));
    }
  }, [selectedEntity]);

  useEffect(() => {
    if (selectedLocation && selectedEntity && kpiId && minDate && minDate) {
      if (selectedButton === "quarter") {
        getQuarterWiseData();
      } else if (selectedButton === "year") {
        getYearWiseData();
      } else if (selectedButton === "month") {
        getMonthWiseData();
      } else if (selectedButton === "day") {
        getDayWiseData();
      }
    } else {
      setDayData([]);
      setYearData([]);
      setMonthData([]);
      setQuarterData([]);
    }
  }, [
    selectedLocation,
    selectedEntity,
    selectedButton,
    kpiId,
    minDate,
    minDate,
  ]);

  useEffect(() => {
    newChartData();
  }, [kpiId]);

  useEffect(() => {
    if (selectedButton === "year") {
      setTableData(yearData);
      setLabelData(allYear);
    } else if (selectedButton === "month") {
      setTableData(monthData);
      setLabelData(allLabels);
    } else if (selectedButton === "quarter") {
      setTableData(quarterData);
      setLabelData(allQuarters);
    } else if (selectedButton === "day") {
      setTableData(dayData);
      setLabelData(allDays);
    }
    setClicked(false);
  }, [yearData, monthData, quarterData, dayData]);

  //------check these useeffects required or not ------------

  useEffect(() => {
    setFrequencyType(kpiReportData.frequency);
  }, [kpiReportData]);

  useEffect(() => {
    getFiscalMonth();
    if (chartRef && chartRef.current) {
      (chartRef.current as any).chart.reflow();
    }

    setTableData(dayData);
    setLabelData(allDays);
    setKpiReportData(kpiChart);
    const currentDate = new Date();

    // Calculate the last day of the current month
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    let location: any;
    if (userDetail?.userType === "globalRoles") {
      location = userDetail?.additionalUnits[0]?.id;
    } else {
      location = userDetail?.location?.id;
    }
    setKpiReportData((prevState: any) => ({
      ...prevState,
      minDate: startDate,
      maxDate: lastDayOfMonth,
      // location: location,
      // entity: userDetail?.entity?.id ? userDetail?.entity?.id : entity[0]?.id,
    }));
    setLocationId(userDetail?.location?.id);

    setKpiReportData((prev: any) => ({
      ...prev,
      displayBy: "Year",
    }));
  }, []);

  useEffect(() => {
    if (!!locationstate?.state?.locationId && locationstate?.state?.kpiId) {
      setKpiReportData((prev: any) => ({
        ...prev,
        location: locationstate?.state?.locationId,
        entity: locationstate?.state?.entityId,
        kpiName: locationstate?.state?.kpiName,
        minDate: locationstate?.state?.minDate,
        maxDate: locationstate?.state?.maxDate,
      }));
    }
    setLocationId(locationstate?.state?.locationId);
    setKpiId(locationstate?.state?.kpiId);
    if (locationstate.pathname.includes("/dashboard/objective")) {
      const stateData = JSON.parse(
        sessionStorage.getItem("newTabState") || "{}"
      );
      const currentDate = new Date();

      // Calculate the last day of the current month
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      setKpiReportData((prev: any) => ({
        ...prev,
        location: stateData?.locationId,
        entity: stateData?.entityId,
        kpiName: stateData?.kpiName,
        minDate: startDate,
        maxDate: lastDayOfMonth,
      }));
      setLocationId(stateData.locationId);
      setKpiId(stateData.kpiId);
    }
  }, [locationstate]);

  //---------functions --------------

  const handleMinDateChange = (date: dayjs.Dayjs | null) => {
    setMinDate(date ? date.format(dateStorageFormat) : undefined);
  };

  const handleMaxDateChange = (date: dayjs.Dayjs | null) => {
    setMaxDate(date ? date.format(dateStorageFormat) : undefined);
  };

  const getLocationOptions = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userInfo?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && !!res?.data?.data?.length) {
          setLocationOptions([
            ...[{ value: "All", label: "All" }],
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            })),
          ]);
        } else {
          setLocationOptions([]);
          enqueueSnackbar("No Locations Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllLocation", {
          variant: "error",
        });
      }
    } catch (error) {}
  };

  const getDepartmentOptions = async (locationId: any = "") => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllDepartmentsByLocation/${locationId}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && !!res?.data?.data?.length) {
          setDepartmentOptions([
            ...[{ value: "All", label: "All" }],
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.entityName,
            })),
          ]);
        } else {
          setDepartmentOptions([]);
          enqueueSnackbar("No Departments Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartmentsByLocation", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const handleLocationChange = (value: any) => {
    if (value !== "All") {
      setSelectedLocation(value);
      setSelectedEntity(undefined);
      getDepartmentOptions(value);
      setDisableDept(false);
    } else {
      setSelectedLocation("All");
      setSelectedEntity(undefined);
      setDisableDept(true);
    }
  };

  const handleDepartmentChange = (value: any) => {
    setSelectedEntity(value);
  };

  const handleClickFetch = () => {
    setUnit(selectedLocation);
    setEntity2(selectedEntity);
  };

  const handleResetFilters = () => {
    setSelectedEntity(userInfo?.entity?.id);
    setSelectedLocation(userInfo?.locationId);
    getDepartmentOptions(userInfo?.location?.id);
    setDisableDept(false);
    setUnit(userInfo?.locationId);
    setEntity2(userInfo?.entity?.id);
  };

  const getKpiName = async () => {
    try {
      const res = await axios(
        `/api/kpi-report/getKpiForLocation?kpiLocation=${selectedLocation}&kpiEntity=${selectedEntity}&kpibusinessunit=${kpiReportData?.businessUnit}`
      );

      if (res.data && res.data.length > 0) {
        const mappedData = res.data
          .map((obj: any) => ({
            id: obj.kpiId,
            value: obj.kpiname,
            kpiuom: obj.kpiuom,
            targettype: obj.targettype,
            displayType: obj.displayType,
            deleted: obj?.deleted,
            frequency: obj?.frequency,
          }))
          .sort((a: any, b: any) => a.value.localeCompare(b.value));

        setKpiNameList(mappedData);

        const firstKpi = mappedData[0]; // ✅ Use the mapped/sorted object

        if (firstKpi && firstKpi.value) {
          setKpiReportData((prev: any) => ({
            ...prev,
            kpiName: firstKpi.value,
            uom: firstKpi.kpiuom,
            targetType: firstKpi.targettype,
            displayType: firstKpi.displayType,
            deleted: firstKpi.deleted,
            frequency: firstKpi.frequency,
          }));

          setKpiId(firstKpi.id); // Optional if you use this elsewhere
          setSelected(true); // Optional if it controls visual behavior
        }
      } else {
        setKpiNameList([]);
        setKpiReportData((prev: any) => ({
          ...prev,
          kpiName: "",
          uom: "",
          targetType: "",
          displayType: "",
          deleted: "",
          frequency: "",
        }));

        setKpiId(""); // Optional if you use this elsewhere
        setSelected(false); // Optional if it controls visual behavior
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      setKpiNameList([]);
    }
  };

  const handleButtonClick = (buttonName: any) => {
    setSelectedButton(buttonName);
  };

  const getQuarterWiseData = async () => {
    await axios(
      `/api/kpi-report/calculationFromSummary/${kpiId}/${selectedLocation}?entity=${selectedEntity}&startDate=${minDate}&endDate=${maxDate}`
      // `/api/kpi-report/calculationFromSummary/28ac1f0b-7590-408a-8568-ec0da75e7222?startDate=${minDateValue}&endDate=${maxDateValue}`
    )
      .then((res) => {
        setQuarterData(
          res.data?.quarter?.map((obj: any) => {
            const operationalTarget: any = obj.totalQuarterOperationalTarget;
            const target: any =
              kpiReportData?.displayType === "SUM"
                ? obj.totalQuarterTarget
                : obj.avgTarget;
            const minTarget: any =
              kpiReportData?.displayType === "SUM"
                ? obj.totalMinimumTarget
                : obj.avgMinimumTarget;
            const formattedOperationalTarget =
              kpiReportData?.targetType === "Range"
                ? `${minTarget}-${target}` +
                  (operationalTarget != null ? ` (${operationalTarget})` : "")
                : `${target}` +
                  (operationalTarget != null ? ` (${operationalTarget})` : "");

            return {
              year: obj.kpiYear,
              qtrmonth: getQuarterName(obj.kpiPeriod),
              value: obj.totalQuarterSum
                ? parseFloat(obj.totalQuarterSum?.toFixed(2))
                : "",
              total: obj.totalQuarterSum
                ? parseFloat(obj.totalQuarterSum?.toFixed(2))
                : 0,
              target: obj.totalQuarterTarget
                ? parseFloat(obj.totalQuarterTarget?.toFixed(2))
                : 0,
              operationalTarget: formattedOperationalTarget,
              averageValue: obj.averageQuarterAverage
                ? parseFloat(obj.averageQuarterAverage?.toFixed(2))
                : 0,
              variance: obj.totalQuarterVariance
                ? parseFloat(obj.totalQuarterVariance?.toFixed(2))
                : 0,
              percentage: (() => {
                const percentage =
                  kpiReportData.targetType === "Increase" ||
                  kpiReportData.targetType === "Maintain"
                    ? (obj.totalQuarterSum / obj.totalQuarterTarget) * 100
                    : 100 -
                      (Math.abs(obj.totalQuarterTarget - obj.totalQuarterSum) /
                        obj.totalQuarterTarget) *
                        100;
                if (percentage % 1 === 0) {
                  return Number.isFinite(percentage) ? percentage : 0;
                } else {
                  return Number.isFinite(percentage)
                    ? percentage.toFixed(2)
                    : 0;
                }
              })(),
            };
          })
        );
      })
      .catch((err) => {
        // console.log(err);
      });
  };

  const getMonthWiseData = async () => {
    await axios(
      `/api/kpi-report/calculationFromSummary/${kpiId}/${selectedLocation}?entity=${selectedEntity}&startDate=${minDate}&endDate=${maxDate}`
      // `/api/kpi-report/calculationFromSummary/28ac1f0b-7590-408a-8568-ec0da75e7222?startDate=${minDateValue}&endDate=${maxDateValue}`
    )
      .then((res) => {
        setMonthData(
          res.data.monthwiseresult?.map((obj: any) => {
            const operationalTarget = obj.monthlyOperationalTarget;
            const target = obj.monthlyTarget;
            const minTarget = obj.monthlyMinimumTarget;

            const formattedOperationalTarget =
              kpiReportData?.targetType === "Range"
                ? `${minTarget}-${target}` +
                  (operationalTarget != null ? ` (${operationalTarget})` : "")
                : `${target}` +
                  (operationalTarget != null ? ` (${operationalTarget})` : "");
            return {
              year: obj.kpiYear,
              month: getMonthName(obj.kpiMonthYear),
              value: obj.monthlySum,
              target: obj.monthlyTarget,
              operationalTarget: formattedOperationalTarget,
              averageValue: obj.monthlyAverage
                ? parseFloat(obj.monthlyAverage.toFixed(2))
                : 0,
              score: obj.monthlyScore,
              weightedScore: obj.monthlyWeightedScore,
              variance: obj.monthlyVariance?.toFixed(2),
              percentage: obj.percentage
                ? parseFloat(obj.percentage?.toFixed(2))
                : 0,
              kpiComments: obj?.kpiComments,
            };
          })
        );
      })
      .catch((err) => {
        // console.log(err);
      });
  };

  const getYearWiseData = async () => {
    const result = await axios(
      `/api/kpi-report/calculationFromSummary/${kpiId}/${selectedLocation}?entity=${selectedEntity}&startDate=${minDate}&endDate=${maxDate}`
    );

    if (result.status === 200 || result.status === 200) {
      setYearData(
        result.data.sum.map((obj: any) => {
          const operationalTarget = obj.totalOperationalTarget;
          const target =
            kpiReportData?.displayType === "SUM"
              ? obj.totalTarget
              : obj.avgTarget;
          const minTarget: any =
            kpiReportData?.displayType === "SUM"
              ? obj.totalMinimumTarget
              : obj.avgMinimumTarget;
          const formattedOperationalTarget =
            kpiReportData?.targetType === "Range"
              ? `${minTarget}-${target}` +
                (operationalTarget != null ? ` (${operationalTarget})` : "")
              : `${target}` +
                (operationalTarget != null ? ` (${operationalTarget})` : "");
          return {
            year: obj.kpiYear,
            value: obj.totalMonthlySum
              ? parseFloat(obj.totalMonthlySum?.toFixed(2))
              : "",
            target: obj.totalTarget
              ? parseFloat(obj.totalTarget?.toFixed(2))
              : "",
            operationalTarget: formattedOperationalTarget,
            averageValue: obj.averageMonthlyAverage
              ? parseFloat(obj.averageMonthlyAverage.toFixed(2))
              : "",
            score: obj.averageMonthlyScore,
            weightedScore: obj.totalMonthlyWeightedScore,
            variance: obj.totalMonthlyVariance
              ? parseFloat(obj.totalMonthlyVariance.toFixed(2))
              : "",
            percentage: (() => {
              //100 - (Math.abs(targetValue - actualValue) / targetValue) * 100;
              const percentage =
                kpiReportData.targetType === "Increase" ||
                kpiReportData.targetType === "Maintain"
                  ? (obj.totalMonthlySum / obj.totalTarget) * 100
                  : 100 -
                    (Math.abs(obj.totalTarget - obj.totalMonthlySum) /
                      obj.totalTarget) *
                      100;
              if (percentage % 1 === 0) {
                return Number.isFinite(percentage) ? percentage : 0;
              } else {
                return Number.isFinite(percentage) ? percentage.toFixed(2) : 0;
              }
            })(),
          };
        })
      );
    }
  };

  const getDayWiseData = async () => {
    if ((!!locationId || location) && !!kpiId) {
      await axios(
        `/api/kpi-report/computationForKpi/${kpiId}/${selectedLocation}/${selectedEntity}/${maxDate}/${minDate}`
      )
        .then((res) => {
          setDayData(
            res.data?.allkpidata?.map((obj: any) => {
              const operationalTarget = obj.operationalTarget;
              const target = obj.target;
              const formattedOperationalTarget = `${target} (${operationalTarget})`;

              return {
                days: new Date(obj.reportFor)
                  .toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })
                  .split(" ")
                  .join("-"),
                value: obj.kpiValue ? parseFloat(obj.kpiValue.toFixed(2)) : 0,
                target: target,
                operationalTarget: formattedOperationalTarget,
                averageValue: obj.kpiValue
                  ? parseFloat(obj.kpiValue.toFixed(2))
                  : "",
                score: obj.kpiScore,
                weightedScore: obj.kpiWeightage,
                variance: obj.kpiVariance
                  ? parseFloat(obj.kpiVariance.toFixed(2))
                  : 0,
                percentage: obj.percentage
                  ? parseFloat(obj.percentage.toFixed(2))
                  : 0,
                kpiComments: obj.kpiComments,
              };
            })
          );
        })
        .catch((err) => {
          // console.log(err);
        });
    }
  };

  const newChartData = async () => {
    if (!kpiId) {
      console.warn("kpiId is undefined or null, skipping API call");
      return;
    }

    try {
      const result = await axios.get(
        `/api/kpi-report/getAllKpiDataForGraph?kpiId=${kpiId}`
      );
      setNewKPIChartData(result.data);
    } catch (error) {
      console.error("Error fetching KPI data", error);
    }
  };

  function getStartDate(fiscalYearQuarters: any) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    if (fiscalYearQuarters === "April - Mar") {
      let startYear = currentYear;
      if (currentMonth < 3) {
        startYear = currentYear - 1;
      }

      return new Date(startYear, 3, 1);
    } else {
      return new Date(currentYear, 0, 1);
    }
  }

  //--------table Data function -------------

  const getTableDataProp = (propName: string) => {
    return TableData?.map((ele) => {
      if (ele.hasOwnProperty(propName)) {
        return ele[propName];
      }
      return null;
    });
  };

  //---------chart fuctions

  interface Data {
    [key: string]: any;
  }

  const findObjectlabel = (
    data: Data[],
    value: string | number | any[],
    location: string
  ) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i][location] === value) {
        return data[i];
      } else if (Array.isArray(value)) {
        for (let j = 0; j < value.length; j++) {
          const labelresult = findObject(data, value[j], location);
          if (labelresult) {
            return labelresult;
          }
        }
      }
    }
    return null;
  };

  const allLabels = getTableDataProp("month");
  const allQuarters = getTableDataProp("qtrmonth");
  const allYear = getTableDataProp("year");
  const allDays = getTableDataProp("days");
  const allTarget = getTableDataProp("target");
  const allValues = getTableDataProp("value");
  const allPercentage = getTableDataProp("percentage");
  const [labelData, setLabelData] = useState<any[]>(allDays);
  const realmName = getAppUrl();
  const [fiscalMonth, setFiscalMonth] = useState<any>();

  const speedometeroptions: Highcharts.Options = {
    chart: {
      type: "gauge",
      plotBorderWidth: 0,
      plotShadow: false,
      height: "70%",
    },
    title: {
      text: "Target vs Actual Cumulative",
      align: "center",
      verticalAlign: "top",
      style: {
        // fontFamily: "-apple-system",
        fontSize: "13px",
        fontWeight: "600",
        color: "#666666",
      },
      y: 0,
    },
    pane: {
      startAngle: -100,
      endAngle: 100,
      center: ["50%", "70%"],
      size: "110%",
    },
    yAxis: {
      min: 0,
      max: targetValue >= 100 ? targetValue : 100,
      tickPixelInterval: Math.ceil(
        (targetValue >= 100 ? targetValue : 100) / 3
      ),
      tickPosition: "inside",
      tickLength: 20,
      tickWidth: 2,
      minorTickInterval: null,
      labels: {
        distance: 20,
        style: {
          fontSize: "12px",
        },
      },
      plotBands: [
        {
          from: 0,
          to: 65,
          color: "#C73659", // red
          thickness: 30,
        },
        {
          from: 65,
          to: 130,
          color: "#DC5F00", // yellow
          thickness: 20,
        },
        {
          from: 130,
          to: targetValue >= 100 ? targetValue : 100,
          color: "#21618C", // green
          thickness: 20,
        },
      ],
    },
    series: [
      {
        type: "gauge",
        name: "Actual Value",
        data: [actualValue],
        tooltip: {
          // valueSuffix: " %",
        },
        dataLabels: {
          format: actualValue ? `${[percentageValue]} %` : "0",
          borderWidth: 0,
          color:
            (Highcharts.defaultOptions.title &&
              Highcharts.defaultOptions.title.style &&
              Highcharts.defaultOptions.title.style.color) ||
            "#333333",
          style: {
            fontSize: "16px",
          },
        },
        dial: {
          radius: "80%",
          backgroundColor: "gray",
          baseWidth: 12,
          baseLength: "0%",
          rearLength: "0%",
        },
        pivot: {
          backgroundColor: "gray",
          radius: 6,
          borderWidth: 2,
        },
      },
    ],
    credits: {
      enabled: false,
    },
  };

  const PercentageVsTrendLinegraphData = {
    labels:
      kpiReportData.displayBy === "Year"
        ? allYear
        : kpiReportData.displayBy === "Month"
        ? allLabels
        : kpiReportData.displayBy === "Quarter"
        ? allQuarters
        : allDays,
    datasets: [
      // {
      //   label: "Trend",
      //   data: Array(allPercentage.length).fill(100),
      //   backgroundColor: "#003059",
      //   borderColor: "#003059",
      //   pointBorderColor: "black",
      //   fill: "true",
      //   tension: 0.4,
      // },
      {
        label: "Percentage",
        data: allPercentage,
        backgroundColor: "#3C42C8",
        borderColor: "#3C42C8",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
      },
    ],
  };

  const ActualVsTargetLinegraphData = {
    labels:
      kpiReportData.displayBy === "Year"
        ? allYear
        : kpiReportData.displayBy === "Month"
        ? allLabels
        : kpiReportData.displayBy === "Quarter"
        ? allQuarters
        : allDays,
    datasets: [
      {
        label: "Target",
        data: allTarget,
        backgroundColor: "#003059",
        borderColor: "#003059",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
      },
      {
        label: "Actual",
        data: allValues,
        backgroundColor: "#DF5353",
        borderColor: "#DF5353",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
      },
    ],
  };

  const ActualVsTargetBargraphData = {
    labels:
      kpiReportData.displayBy === "Year"
        ? allYear
        : kpiReportData.displayBy === "Month"
        ? allLabels
        : kpiReportData.displayBy === "Quarter"
        ? allQuarters
        : allDays,
    datasets: [
      {
        label: "Target",
        data: allTarget,
        backgroundColor: "#3C42C8",
        borderColor: "#3C42C8",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
        borderWidth: 1,
        maxBarThickness: 60,
      },
      {
        label: "Actual",
        data: allValues,
        backgroundColor: "#29DBD5",
        borderColor: "#29DBD5",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
        borderWidth: 1,
        maxBarThickness: 60,
      },
    ],
  };

  //----check these functions requied or not -------------

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

  function getMonthName(month: number): string {
    return monthNames[month];
  }

  const quarterNames1 = ["Jan-Mar", "Apr-Jun", "Jul-Sep", "Oct-Dec"];
  const quarterNames2 = ["Apr-Jun", "Jul-Sep", "Oct-Dec", "Jan-Mar"];

  function getQuarterName(quarter: number): any {
    if (fiscalMonth === "Jan - Dec") {
      return quarterNames1[quarter - 1];
    } else {
      return quarterNames2[quarter - 1];
    }
  }

  interface FooterProps {
    table: any;
    column: any;
  }
  const [averageValue, setAverageValue] = useState<string | number>("0");

  const [variance, setVariance] = useState("0");
  function calculateFooter(props: FooterProps, accessorKey: string) {
    const initialValue = 0;

    // Calculate sum
    const sumWithInitial = props.table
      .getRowModel()
      .rows.reduce((previousValue: number, currentValue: any) => {
        const value = Number(currentValue.original[accessorKey]);
        // Check if value is a valid number
        if (isNaN(value)) {
          // console.error(
          //   `Invalid number for ${accessorKey}:`,
          //   currentValue.original[accessorKey]
          // );
          return previousValue; // Skip invalid values
        }
        return previousValue + value;
      }, initialValue);

    const sumAsNumber = parseFloat(Number(sumWithInitial).toFixed(2));
    // Check if sumAsNumber is a valid number
    if (isNaN(sumAsNumber)) {
      console.error(`Sum is NaN for ${accessorKey}`);
      return ""; // Return a fallback value
    }

    const isInteger = Number.isInteger(sumAsNumber);
    const sumString = isInteger ? String(sumAsNumber) : sumAsNumber.toFixed(2);

    // Handle specific accessorKey cases
    if (accessorKey === "target") {
      setTargetValue(sumAsNumber);
      const count = props.table.getRowModel().rows.length;
      if (count === 0) {
        console.error(`Row count is zero for ${accessorKey}`);
        return ""; // Return a fallback value
      }
      const avg = count > 1 ? sumAsNumber / count : sumAsNumber;
      const avgValue = Number.isInteger(avg) ? avg.toString() : avg.toFixed(2);
      setAvgTargetValue(avgValue);
      if (Number.isNaN(avg)) {
        console.error(`Average is NaN for ${accessorKey}`);
        return ""; // Return a fallback value
      }
    } else if (accessorKey === "value") {
      setActualValue(sumAsNumber);
    } else if (accessorKey === "averageValue") {
      const count = props.table.getRowModel().rows.length;
      if (count === 0) {
        console.error(`Row count is zero for ${accessorKey}`);
        return ""; // Return a fallback value
      }
      const avg = count > 1 ? actualValue / count : sumAsNumber;
      const avgValue = Number.isInteger(avg) ? avg.toString() : avg.toFixed(2);
      setAverageValue(avgValue);
      if (Number.isNaN(avg)) {
        console.error(`Average is NaN for ${accessorKey}`);
        return ""; // Return a fallback value
      }
      return Number.isInteger(avg) ? avg.toString() : avg.toFixed(2);
    } else if (accessorKey === "variance") {
      // Assuming variance should be calculated in a specific way
      const count = props.table.getRowModel().rows.length;
      if (count === 0) {
        console.error(`Row count is zero for ${accessorKey}`);
        return ""; // Return a fallback value
      }

      const mean = sumAsNumber / count;
      const varianceSum = props.table
        .getRowModel()
        .rows.reduce((acc: any, currentValue: any) => {
          const value = Number(currentValue.original[accessorKey]);
          if (isNaN(value)) {
            console.error(
              `Invalid number for variance calculation:`,
              currentValue.original[accessorKey]
            );
            return acc; // Skip invalid values
          }
          return acc + Math.pow(value - mean, 2);
        }, 0);

      // const variance = sumAsNumber / count;
      const variance = targetValue - actualValue;
      if (Number.isNaN(variance)) {
        console.error(`Calculated variance is NaN for ${accessorKey}`);
        return ""; // Return a fallback value
      }
      const varianceString = Number.isInteger(variance)
        ? variance.toString()
        : variance.toFixed(2);

      setVariance(varianceString);

      return Number.isInteger(variance)
        ? variance.toString()
        : variance.toFixed(2);
    }

    return sumString;
  }

  const yearColumns = [
    {
      header: "Year",
      accessorKey: "year",
    },
    {
      header: "PnB (OP)",
      accessorKey: "operationalTarget",
      footer: (props: FooterProps) => calculateFooter(props, "target"),
    },
    {
      header: `Value(${kpiReportData.uom ? kpiReportData?.uom : ""})`,
      accessorKey: "value",
      footer: (props: FooterProps) => calculateFooter(props, "value"),
    },
    {
      header: "Variance",
      accessorKey: "variance",
      footer: (props: FooterProps) => {
        // calculateFooter(props, "variance")
        const variance: any =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? -(targetValue - actualValue)
            : targetValue - actualValue;
        if (variance % 1 === 0) {
          setVariance(variance);
          return `${variance}`;
        } else {
          setPercentageValue(variance.toFixed(2));
          return `${variance.toFixed(2)}`;
        }
      },
    },
    {
      header: "Efficiency",
      accessorKey: "percentage",
      footer: () => {
        const percentage =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain" ||
          kpiReportData.targetType === "Range"
            ? (actualValue / targetValue) * 100
            : ((targetValue - actualValue) / targetValue) * 100;

        if (percentage % 1 === 0) {
          setPercentageValue(Number.isFinite(percentage) ? percentage : 0);
          return `${Number.isFinite(percentage) ? percentage : 0}%`;
        } else {
          setPercentageValue(
            Number.isFinite(percentage) ? percentage.toFixed(2) : 0
          );
          return `${Number.isFinite(percentage) ? percentage.toFixed(2) : 0}%`;
        }
      },
    },
    {
      header: "Avg Value",
      accessorKey: "averageValue",
      footer: (props: FooterProps) => calculateFooter(props, "averageValue"),
    },
  ];
  const monthColumns = [
    {
      header: "Year",
      accessorKey: "year",
    },
    {
      header: "Month",
      accessorKey: "month",
    },
    {
      header: "PnB (OP)",
      accessorKey: "operationalTarget",
      footer: (props: FooterProps) => calculateFooter(props, "target"),
    },
    {
      header: `Value(${kpiReportData.uom ? kpiReportData.uom : ""})`,
      accessorKey: "value",
      footer: (props: FooterProps) => calculateFooter(props, "value"),
    },
    {
      header: "Variance",
      accessorKey: "variance",
      footer: (props: FooterProps) => {
        // calculateFooter(props, "variance")
        const variance: any =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? -(targetValue - actualValue)
            : targetValue - actualValue;
        if (variance % 1 === 0) {
          setVariance(variance);
          return `${variance}`;
        } else {
          setPercentageValue(variance.toFixed(2));
          return `${variance.toFixed(2)}`;
        }
      },
    },
    {
      header: "Efficiency",
      accessorKey: "percentage",
      footer: () => {
        const percentage =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? (actualValue / targetValue) * 100
            : ((targetValue - actualValue) / targetValue) * 100;
        if (percentage % 1 === 0) {
          setPercentageValue(Number.isFinite(percentage) ? percentage : 0);
          return `${Number.isFinite(percentage) ? percentage : 0}%`;
        } else {
          setPercentageValue(
            Number.isFinite(percentage) ? percentage.toFixed(2) : 0
          );
          return `${Number.isFinite(percentage) ? percentage.toFixed(2) : 0}%`;
        }
      },
    },
    {
      header: "Avg Value",
      accessorKey: "averageValue",
      footer: (props: FooterProps) => calculateFooter(props, "averageValue"),
    },
    {
      header: "Remarks",
      accessorKey: "kpiComments",
    },
  ];
  const quaterColumns = [
    {
      header: "Year",
      accessorKey: "year",
    },
    {
      header: "Period",
      accessorKey: "qtrmonth",
    },
    {
      header: "PnB (OP)",
      accessorKey: "operationalTarget",
      footer: (props: FooterProps) => calculateFooter(props, "target"),
    },
    {
      header: `Value(${kpiReportData.uom ? kpiReportData.uom : ""})`,
      accessorKey: "value",
      footer: (props: FooterProps) => calculateFooter(props, "value"),
    },
    // {
    //   header: "Total",
    //   accessorKey: "total",
    //   footer: (props: FooterProps) => calculateFooter(props, "total"),
    // },

    {
      header: "Variance",
      accessorKey: "variance",
      footer: (props: FooterProps) => {
        // calculateFooter(props, "variance")
        const variance: any =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? -(targetValue - actualValue)
            : targetValue - actualValue;
        if (variance % 1 === 0) {
          setVariance(variance);
          return `${variance}`;
        } else {
          setPercentageValue(variance.toFixed(2));
          return `${variance.toFixed(2)}`;
        }
      },
    },
    {
      header: "Efficiency",
      accessorKey: "percentage",
      footer: () => {
        const percentage =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? (actualValue / targetValue) * 100
            : ((targetValue - actualValue) / targetValue) * 100;
        if (percentage % 1 === 0) {
          setPercentageValue(Number.isFinite(percentage) ? percentage : 0);
          return `${Number.isFinite(percentage) ? percentage : 0}%`;
        } else {
          setPercentageValue(
            Number.isFinite(percentage) ? percentage.toFixed(2) : 0
          );
          return `${Number.isFinite(percentage) ? percentage.toFixed(2) : 0}%`;
        }
      },
    },
    {
      header: "Avg Value",
      accessorKey: "averageValue",
      footer: (props: FooterProps) => calculateFooter(props, "averageValue"),
    },
  ];
  const dayscolumns = [
    {
      header: "Day",
      accessorKey: "days",
    },
    {
      header: "PnB (OP)",
      accessorKey: "operationalTarget",
      footer: (props: FooterProps) => calculateFooter(props, "target"),
    },
    {
      header: `Value(${kpiReportData.uom ? kpiReportData.uom : ""})`,
      accessorKey: "value",
      footer: (props: FooterProps) => calculateFooter(props, "value"),
    },
    {
      header: "Variance",
      accessorKey: "variance",
      footer: (props: FooterProps) => {
        // calculateFooter(props, "variance")
        const variance: any =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? -(targetValue - actualValue)
            : targetValue - actualValue;
        if (variance % 1 === 0) {
          setVariance(variance);
          return `${variance}`;
        } else {
          setPercentageValue(variance.toFixed(2));
          return `${variance.toFixed(2)}`;
        }
      },
    },
    {
      header: "Efficiency",
      accessorKey: "percentage",
      footer: () => {
        const percentage =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? (actualValue / targetValue) * 100
            : ((targetValue - actualValue) / targetValue) * 100;
        if (percentage % 1 === 0) {
          setPercentageValue(Number.isFinite(percentage) ? percentage : 0);
          return `${Number.isFinite(percentage) ? percentage : 0}%`;
        } else {
          setPercentageValue(
            Number.isFinite(percentage) ? percentage.toFixed(2) : 0
          );
          return `${Number.isFinite(percentage) ? percentage.toFixed(2) : 0}%`;
        }
      },
    },
    {
      header: "Avg Value",
      // accessorKey: "averageValue",
      footer: (props: FooterProps) => calculateFooter(props, "averageValue"),
    },
    {
      header: "Remarks",
      accessorKey: "kpiComments",
    },
  ];

  const QuarterTabledata = [
    {
      year: "2023",
      qtrmonth: "Jan-Mar",
      value: 8,
      total: 8,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2023",
      qtrmonth: "Apr-Jun",
      value: 6,
      total: 9,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2023",
      qtrmonth: "Jul-Sep",
      value: 9,
      total: 3,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2023",
      qtrmonth: "Oct-Dec",
      value: 10,
      total: 1,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2024",
      qtrmonth: "Jan-Mar",
      value: 5,
      total: 6,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2024",
      qtrmonth: "Apr-Jun",
      value: 6,
      total: 5,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2024",
      qtrmonth: "Jul-Sep",
      value: 9,
      total: 3,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2024",
      qtrmonth: "Oct-Dec",
      value: 14,
      total: 9,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2025",
      qtrmonth: "Jan-Mar",
      value: 11,
      total: 4,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2025",
      qtrmonth: "Apr-Jun",
      value: 4,
      total: 2,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2025",
      qtrmonth: "July-Aug",
      value: 3,
      total: 7,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2025",
      qtrmonth: "Sep-Dec",
      value: 7,
      total: 4,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
  ];

  const chartRef = useRef(null);

  const convertDate = (date: Date) => {
    const dd = String(date?.getDate()).padStart(2, "0");
    const mm = String(date?.getMonth() + 1).padStart(2, "0");
    const yyyy = date?.getFullYear();

    return yyyy + "-" + mm + "-" + dd;
  };

  function convertDate2(date: Date | null): string {
    if (date === null) {
      return "";
    }
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  const convertDatetoSystem = (newRowData: any) => {
    if (kpiReportData.displayBy === "Month") {
      const { Month, Year } = newRowData;

      const systemDate = new Date(`${Year}-${Month}-01T00:00:00`);

      const formattedDate = format(systemDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      return formattedDate;
    } else if (kpiReportData.displayBy === "Quarter") {
      const quarterString = newRowData.Month;

      const startingMonth = quarterString.split("-")[0];

      // Determine the month index (0-based) for the starting month
      const monthIndex = getMonthIndex(startingMonth);

      // Assuming the year is available in newRowData as well
      const { Year } = newRowData;

      const systemDate = new Date(`${Year}-${monthIndex + 1}-01T00:00:00`);

      const formattedDate = format(systemDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      return formattedDate;
    } else {
      const parsedDate = parse(newRowData.Day, "MMMM-dd", new Date());

      // Format the parsed date to the desired format
      const formattedDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      return formattedDate;
    }
  };
  const getMonthIndex = (monthName: string) => {
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
    return months.findIndex(
      (month) => month.toLowerCase() === monthName.toLowerCase()
    );
  };

  const getFiscalMonth = async () => {
    const result = await axios.get(`api/organization/${realmName}`);

    setFiscalMonth(result?.data?.fiscalYearQuarters);
  };

  const findObject = (array: any[], key: string | number, value: any) => {
    return array.filter((object) => object[key] === value);
  };

  const handleChartDataClick = (data: any) => {
    const result = findObject(
      TableData,
      kpiReportData.displayBy === "Year"
        ? "year"
        : kpiReportData.displayBy === "Month"
        ? "month"
        : kpiReportData.displayBy === "Quarter"
        ? "qtrmonth"
        : "days",
      data.location
    );
    setTableData(result);
    const chartlabel = findObjectlabel(
      labelData,
      kpiReportData.displayBy === "Year"
        ? allYear
        : kpiReportData.displayBy === "Month"
        ? allLabels
        : kpiReportData.displayBy === "Quarter"
        ? allQuarters
        : allDays,
      data.location
    );

    if (chartlabel) {
      setLabelData(Object.values(chartlabel));
    }
    return;
  };

  const addnewRow = async () => {
    let kpiReportDate;
    kpiReportDate = convertDatetoSystem(newRowData);
    if (newRowData.Value) {
      const payload: any = {
        kpiId: kpiId,
        kpiLocation: kpiReportData?.location,
        kpiEntity: kpiReportData?.entity,
        kpiOrganization: userDetail.organizationId,
        kpiValue: newRowData?.Value,
        target: newRowData?.Target,
        kpiVariance: newRowData?.Variance,
        percentahe: newRowData?.Efficiency,
        kpiReportDate: kpiReportDate,
      };
      const result = await axios.post(
        `/api/kpi-report/writeIndividualKpiData`,
        payload
      );
      if (result.status === 201) {
        setNewRowData({});
        setIsNewRowAdding(false);
        reload();
      }
    }
  };

  const reload = () => {
    if (kpiReportData.displayBy === "Year") {
      setTableData(yearData);
    } else if (kpiReportData.displayBy === "Month") {
      setTableData(monthData);
    } else if (kpiReportData.displayBy === "Quarter") {
      setTableData(QuarterTabledata);
    } else {
      setTableData(dayData);
    }
  };

  const inputLabel = React.useRef(null);

  const isMobile = useMediaQuery("(max-width: 960px)");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [isModalOpenTwo, setIsModalOpenTwo] = useState(false);

  const showModalTwo = () => {
    setIsModalOpenTwo(true);
  };

  const handleOkTwo = () => {
    setIsModalOpenTwo(false);
  };

  const handleCancelTwo = () => {
    setIsModalOpenTwo(false);
  };

  //Efficiency trend line modal

  const [isModalOpenEfficiency, setIsModalOpenEfficiency] = useState(false);

  const showModalEfficiency = () => {
    setIsModalOpenEfficiency(true);
  };

  const handleOkEfficiency = () => {
    setIsModalOpenEfficiency(false);
  };

  const handleCancelEfficiency = () => {
    setIsModalOpenEfficiency(false);
  };

  const [selected, setSelected] = useState(false);

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

  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (index < 1) {
      setIndex(index + 1);
    }
    setCurrentTab("Analytics");
  };

  const handleBack = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
    setCurrentTab("Summary");
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
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          marginTop: "12px",
        }}
      >
        <div
          style={{ display: "flex", marginRight: "16px", alignItems: "center" }}
        >
          <Breadcrumb separator="  ">
            <Breadcrumb.Item>
              <span style={{ color: "black", fontWeight: "bold" }}>Unit:</span>
              <AntSelect
                showSearch
                allowClear
                placeholder="Select Unit"
                onClear={() => setSelectedLocation(undefined)}
                value={selectedLocation}
                style={{
                  width: 250,
                  marginLeft: 8,
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                onChange={handleLocationChange}
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {locationOptions.map((option: any) => (
                  <AntSelect.Option key={option.value} value={option.value}>
                    {option.label}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span style={{ color: "black", fontWeight: "bold" }}>
                Department:
              </span>
              <AntSelect
                showSearch
                allowClear
                onClear={() => setSelectedEntity(undefined)}
                disabled={disableDept}
                placeholder="Select Department"
                value={selectedEntity}
                style={{
                  width: 250,
                  marginLeft: 8,
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                onChange={handleDepartmentChange}
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {departmentOptions.map((option: any) => (
                  <AntSelect.Option key={option.value} value={option.value}>
                    {option.label}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </Breadcrumb.Item>
          </Breadcrumb>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginLeft: "15px",
            }}
          >
            <span style={{ color: "black", fontWeight: "bold" }}>KPI :</span>

            <AntSelect
              showSearch
              allowClear
              placeholder="Select KPI Name"
              value={kpiId}
              style={{
                width: 250,
                marginLeft: 8,
                border: "1px solid black",
                borderRadius: "5px",
              }}
              optionFilterProp="children"
              onChange={(value, option) => {
                // const selected = kpiNameList.find((op) => op.value === value);
                // setKpiReportData((prev: any) => ({
                //   ...prev,
                //   kpiName: selected?.value,
                //   uom: selected?.kpiuom,
                //   targetType: selected?.targettype,
                //   displayType: selected?.displayType,
                //   deleted: selected?.deleted,
                //   frequency: selected?.frequency,
                // }));
                setKpiId(value);
              }}
              filterOption={(input: any, option: any) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {kpiNameList.map((item) => (
                <AntSelect.Option key={item.id} value={item.id}>
                  {item.value}
                </AntSelect.Option>
              ))}
            </AntSelect>

            {kpiReportData.deleted ? (
              <Tooltip title={"Inactive"} style={{ padding: "1px" }}>
                <AiOutlineCloseCircle
                  style={{
                    color: "red",
                    fontWeight: "bolder",
                    fontSize: "20px",
                    stroke: "red",
                    strokeWidth: 1,
                    transform: "rotate(-90deg)",
                    paddingTop: "20px",
                  }}
                ></AiOutlineCloseCircle>
              </Tooltip>
            ) : (
              <>
                {kpiReportData.targetType === "Increase" ? (
                  <Tooltip
                    title={"Increase type"}
                    style={{ padding: "1px", marginBottom: "1px" }}
                  >
                    <MdArrowUpward
                      style={{
                        color: "green",
                        fontWeight: "bolder",
                        fontSize: "40px",
                        stroke: "green",
                      }}
                      className={classes.arrowStyle}
                    />
                  </Tooltip>
                ) : kpiReportData.targetType === "Decrease" ? (
                  <Tooltip title={"Decrease type"} style={{ padding: "1px" }}>
                    <MdArrowDownward
                      style={{
                        color: "#DF5353",
                        fontWeight: "bolder",
                        fontSize: "40px",
                        stroke: "#DF5353",
                        strokeWidth: 1,
                        // zIndex: 1,
                        // transform: "rotate(-270deg)",
                      }}
                      className={classes.arrowStyle}
                    />
                  </Tooltip>
                ) : kpiReportData.targetType === "Range" ? (
                  <Tooltip title={"Range type"} style={{ padding: "1px" }}>
                    <MdSettingsEthernet
                      style={{
                        color: "blue",
                        fontWeight: "bolder",
                        fontSize: "30px",
                        paddingLeft: "5px",
                        // stroke: "blue",
                        // strokeWidth: 1,
                        zIndex: 1,
                      }}
                      className={classes.arrowStyle}
                    />
                  </Tooltip>
                ) : (
                  <MdOutlineImportExport className={classes.arrowStyle} />
                )}
              </>
            )}
          </div>

          {/* <div style={{ margin: "0px 12px 0px 14px" }}>
            <SecondaryButton
              type="primary"
              onClick={handleClickFetch}
              buttonText="Apply"
            />
          </div> */}
          <AntButton
            type="text"
            onClick={handleResetFilters}
            style={{
              display: "flex",
              justifyContent: "center",
              height: "32px",
              fontSize: "14px",
              fontFamily: "Roboto",
              alignItems: "center",
              gap: "6px",
              padding: "5px 0px",
            }}
          >
            {" "}
            <BiReset style={{ fontSize: "24px" }} />
            Reset
          </AntButton>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          paddingRight: "16px",
          gap: "10px",
          marginTop: "15px",
        }}
      >
        <DatePicker
          format={dateDisplayFormat}
          name="minDate"
          onChange={handleMinDateChange}
          value={minDate ? dayjs(minDate, dateStorageFormat) : null}
          style={{
            width: "200px",
            fontWeight: 600,
            border: "1px solid black",
            borderRadius: "5px",
          }}
        />

        <DatePicker
          format={dateDisplayFormat}
          name="maxDate"
          onChange={handleMaxDateChange}
          value={maxDate ? dayjs(maxDate, dateStorageFormat) : null}
          style={{
            width: "200px",
            fontWeight: 600,
            border: "1px solid black",
            borderRadius: "5px",
          }}
        />

        <div style={{ display: "flex" }}>
          <Tooltip title={"Yearly"}>
            <Button
              style={{
                backgroundColor:
                  selectedButton === "year" ? "#B3CCE5" : "white",
                color: "black",
                fontWeight: "bold",
              }}
              className={classes.displayButton}
              variant="outlined"
              onClick={() => {
                handleButtonClick("year");
                setKpiReportData((prev: any) => ({
                  ...prev,
                  displayBy: "Year",
                }));
                setClicked(true);
              }}
            >
              Y
            </Button>
          </Tooltip>
          {kpiReportData.frequency === "HALF-YEARLY" ||
          kpiReportData.frequency === "YEARLY" ? (
            <></>
          ) : (
            <Tooltip title={"Quarterly"}>
              <Button
                style={{
                  backgroundColor:
                    selectedButton === "quarter" ? "#B3CCE5" : "white",
                  color: "black",
                  fontWeight: "bold",
                }}
                className={classes.displayButton}
                variant="outlined"
                onClick={() => {
                  handleButtonClick("quarter");
                  setKpiReportData((prev: any) => ({
                    ...prev,
                    displayBy: "Quarter",
                  }));
                  setClicked(true);
                }}
              >
                Q
              </Button>
            </Tooltip>
          )}
          {kpiReportData.frequency === "HALF-YEARLY" ||
          kpiReportData.frequency === "QUARTERLY" ? (
            <></>
          ) : (
            <Tooltip title={"Monthly"}>
              <Button
                style={{
                  backgroundColor:
                    selectedButton === "month" ? "#B3CCE5" : "white",
                  color: "black",
                  fontWeight: "bold",
                }}
                className={classes.displayButton}
                variant="outlined"
                onClick={() => {
                  handleButtonClick("month");
                  setKpiReportData((prev: any) => ({
                    ...prev,
                    displayBy: "Month",
                  }));
                  setClicked(true);
                }}
              >
                M
              </Button>
            </Tooltip>
          )}
          {kpiReportData.frequency === "MONTHLY" ||
          kpiReportData.frequency === "HALF-YEARLY" ||
          kpiReportData.frequency === "QUARTERLY" ? (
            <></>
          ) : (
            <Tooltip title={"Daily"}>
              <Button
                style={{
                  backgroundColor:
                    selectedButton === "day" ? "#B3CCE5" : "white",
                  color: "black",
                  fontWeight: "bold",
                }}
                className={classes.displayButton}
                variant="outlined"
                onClick={() => {
                  handleButtonClick("day");
                  setKpiReportData((prev: any) => ({
                    ...prev,
                    displayBy: "Days",
                  }));
                  setClicked(true);
                }}
              >
                D
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      <div>
        <KpiLeaderBoard
          kpiReportData={kpiReportData}
          targetValue={targetValue}
          avgTargetValue={avgTargetValue}
          actualValue={actualValue}
          variance={variance}
          averageValue={averageValue}
          percentageValue={percentageValue}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          padding: "0% 16px",
        }}
      >
        <Paper
          elevation={0}
          style={{
            padding: matches ? "5px 15px" : "3px",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: matches ? "49%" : "100%",
            height: "368px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            justifyContent: "center",
            //   alignItems: "center",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              fontFamily: "'Poppins', sans-serif",
              padding: "10px 0px 0px 10px",
              margin: "0px 0px",
            }}
          >
            Efficiency Trend Line
          </p>
          <ReportGraphComponent
            chartType={ChartType.LINE}
            displayTitle={true}
            title="Efficiency Trend Line"
            legendsAlignment={Alignment.START}
            legendsPosition={Position.BOTTOM}
            isStacked={false}
            chartData={PercentageVsTrendLinegraphData}
            handleChartDataClick={handleChartDataClick}
            searchTitle="PercentageVsTrend"
          />
          {matches ? (
            <AiOutlineArrowsAlt onClick={showModalEfficiency} />
          ) : null}
        </Paper>

        <Paper
          elevation={0}
          style={{
            padding: matches ? "5px 15px" : "3px",
            display: "flex",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: matches ? "49%" : "100%",
            height: "368px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            justifyContent: "center",
            //   alignItems: "center",
          }}
        >
          <ReportGraphComponent
            chartType={ChartType.BAR}
            displayTitle={true}
            title="Target vs Actual By Time Series"
            legendsAlignment={Alignment.START}
            legendsPosition={Position.BOTTOM}
            isStacked={false}
            chartData={ActualVsTargetBargraphData}
            handleChartDataClick={handleChartDataClick}
            searchTitle="TargetvsActual"
          />
          {matches ? <AiOutlineArrowsAlt onClick={showModal} /> : null}
        </Paper>
      </div>

      <div style={{ width: "100%", padding: "20px 16px" }}>
        <Paper
          elevation={0}
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: "100%",
            height: "420px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            justifyContent: "center",
            padding: "15px 16px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              fontFamily: "'Poppins', sans-serif",
              padding: "10px 0px 0px 10px",
              margin: "0px 0px",
            }}
          >
            KPI Summary - Monthly Rejected
          </p>
          <SummaryChartKPI newKPIChartData={newKPIChartData} />
        </Paper>
      </div>

      <div
        style={{
          width: "100%",
          padding: "20px 16px",
        }}
      >
        <KpiGraphsTable
          columns={
            kpiReportData.displayBy === "Year"
              ? yearColumns
              : kpiReportData.displayBy === "Month"
              ? monthColumns
              : kpiReportData.displayBy === "Quarter"
              ? quaterColumns
              : dayscolumns
          }
          data={TableData}
          showToolbar
          isNewRowAdding={isNewRowAdding}
          setIsNewRowAdding={setIsNewRowAdding}
          newRowData={newRowData}
          setNewRowData={setNewRowData}
          addnewRow={addnewRow}
        />
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

      {/* //----------------- */}
      {/* <HighchartsReact
                      highcharts={Highcharts}
                      options={speedometeroptions}
                      ref={chartRef}
                    />

                       <ReportGraphComponent
                      chartType={ChartType.LINE}
                      displayTitle={true}
                      title="Target vs Actual By Time Series"
                      legendsAlignment={Alignment.START}
                      legendsPosition={Position.BOTTOM}
                      isStacked={false}
                      chartData={ActualVsTargetLinegraphData}
                      handleChartDataClick={handleChartDataClick}
                      searchTitle="TargetvsActual"
                    /> */}
    </>
  );
}

export default KpiGraphs;
