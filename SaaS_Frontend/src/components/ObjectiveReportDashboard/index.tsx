import React, { useEffect, useState } from "react";
import useStyles from "./style";
import { Breadcrumb, Button, Select } from "antd";
import { useSnackbar } from "notistack";
import axios from "apis/axios.global";
import { MdRotateLeft } from "react-icons/md";
import YearComponent from "components/Yearcomponent";
import getYearFormat from "utils/getYearFormat";
import ObjectiveLeaderBoard from "./ObjectiveLeaderBoard";
import Charts from "./Charts";
import ObjectiveReportTable from "./ObjectiveReportTable";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
import { BiReset } from "react-icons/bi";

type props = {};

const ObjectiveReportDashboard = ({}: props) => {
  const classes = useStyles();
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const { enqueueSnackbar } = useSnackbar();

  //-----------Unit and department  filters states ---------
  const [selectedLocation, setSelectedLocation] = useState<any>(
    userInfo?.locationId
  );
  const [selectedEntity, setSelectedEntity] = useState<any>(
    userInfo?.entity?.id
  );
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [disableDept, setDisableDept] = useState<any>(false);
  const [allOption, setAllOption] = useState("");
  const [allDepartmentOption, setAllDepartmentOption] = useState("");
  const [matchedLocationName, setMatchedLocationName] = useState(
    userInfo?.location?.locationName
  );

  const [unit, setUnit] = useState<any>(userInfo?.locationId);
  const [entity, setEntity] = useState<any>(userInfo?.entity?.id);

  //-----------Category and Objective filters states ---------

  const [categoryOption, setCategoryOption] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedObjective, setSelectedObjective] = useState<any[]>([]);
  const [selectedOptionForObjective, setSelectedOptionForObjective] = useState<
    string | null
  >(null);

  //-----------Date and year month filters------------------
  const [selected, setSelected] = useState("Month");
  const labels = [
    { short: "Y", full: "Year" },
    { short: "Q", full: "Quarter" },
    { short: "M", full: "Month" },
    { short: "D", full: "Day" },
  ];
  const [currentYear, setCurrentYear] = useState<any>();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  //---------------- api data states----------------
  const [dayTableData, setDayTableData] = useState<any>([]);
  const [monthlyTableData, setMonthlyTableData] = useState<any>([]);
  const [yearlyTableData, setYearlyTableData] = useState<any>([]);
  const [quaterTableData, setQuaterTableData] = useState<any>();
  const [totalCounts, setTotalCounts] = useState({
    kpiTotalCount: 0,
    objectiveTotalCount: 0,
  });

  // console.log("userInfo", userInfo);
  // console.log("date", startDate, endDate);
  // console.log("unit", unit);
  // console.log("entity", entity);
  // console.log("selectedObjective", selectedObjective);
  // console.log("selectedOptionForObjective", selectedOptionForObjective);
  // console.log("monthlyTableData", monthlyTableData);
  // console.log("quaterTableData", quaterTableData);
  // console.log("dayTableData", dayTableData);
  // console.log("yearlyTableData", yearlyTableData);
  //  console.log("totalCounts", totalCounts);

  useEffect(() => {
    getLocationOptions();
    getDepartmentOptions(userInfo?.location?.id);
    getyear();
  }, []);

  useEffect(() => {
    getCategoryData();
  }, [unit, entity]);

  useEffect(() => {
    if (currentYear !== null) {
      setFiscalYearDates(
        currentYear,
        userInfo.organization.fiscalYearFormat,
        userInfo.organization.fiscalYearQuarters
      );
    }
  }, [currentYear]);

  useEffect(() => {
    if (selectedCategoryId) {
      if (selected === "Month") {
        getMonthlyData();
      } else if (selected === "Day") {
        getDayData();
      } else if (selected === "Quarter") {
        getQuaterData();
      } else if (selected === "Year") {
        getYearlyData();
      }
    }
  }, [
    selectedCategoryId,
    selected,
    selectedOptionForObjective,
    unit,
    entity,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    if (selectedCategoryId) {
      getLeaderBoardData();
    }
  }, [unit, entity, selectedCategoryId]);

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
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
    if (selectedLocation === "All") {
      setAllOption(selectedLocation);
    } else {
      setAllOption("");
    }
    if (selectedEntity === "All" || selectedEntity == undefined) {
      setAllDepartmentOption(selectedEntity);
    } else {
      setAllDepartmentOption("");
    }

    if (!selectedEntity) {
      setSelectedEntity("All");
      setAllDepartmentOption("All");
    }

    setUnit(selectedLocation);
    setEntity(selectedEntity);
  };

  const handleResetFilters = () => {
    getyear();
    setSelectedEntity(userInfo?.entity?.id);
    setSelectedLocation(userInfo?.locationId);
    // setMatchedDepartmentName(userInfo?.entity?.entityName);
    setMatchedLocationName(userInfo?.location?.locationName);
    getDepartmentOptions(userInfo?.location?.id);
    setDisableDept(false);

    setAllOption("");
    setAllDepartmentOption("");

    setUnit(userInfo?.locationId);
    setEntity(userInfo?.entity?.id);
  };

  //-----------Category and Objective filters functions ---------

  const getCategoryData = async () => {
    try {
      const entityParam = entity === undefined ? "All" : entity;
      const res = await axios.get(
        `/api/kpi-definition/kpiObjCountForCategory?locationId=${unit}&entityId=${entityParam}&organizationId=${userInfo?.organizationId}&categoryId=All`
      );

      if (res.status === 200 || res.status === 201) {
        const categories = res.data;
        setCategoryOption(categories);
        if (categories.length > 0) {
          const firstCategory = categories[0];
          setSelectedCategoryId(firstCategory.categoryId);
          getObjectiveOption(firstCategory.objectiveIds);
        } else {
          setSelectedCategoryId(null);
          getObjectiveOption(null);
        }
      }
    } catch (error) {
      console.error("Error fetching Objective data:", error);
    }
  };

  const getObjectiveOption = async (objIds: any) => {
    try {
      const res = await axios.get(
        `/api/kpi-definition/getObjectiveByIds?ids=${objIds.join(",")}`
      );
      if (res.status === 200 || res.status === 201) {
        setSelectedObjective(res.data); // res.data should be array of objectives
        setSelectedOptionForObjective(null); // reset selected objective
      }
    } catch (error) {
      console.error("Error fetching objectives:", error);
    }
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);

    if (!categoryId) {
      setSelectedObjective([]); // Clear objectives
      setSelectedOptionForObjective(null);
      return;
    }

    const selectedCategory = categoryOption.find(
      (cat) => cat.categoryId === categoryId
    );
    if (selectedCategory) {
      getObjectiveOption(selectedCategory.objectiveIds);
    }
  };

  //---------------date filter function------------------

  const setFiscalYearDates = (
    currentYear: any,
    fiscalYearFormat: string,
    fiscalYearQuarters: string
  ) => {
    if (!currentYear) {
      // console.error("currentYear is required.");
      return;
    }

    let fiscalYear: number;
    let nextYear: number;

    if (fiscalYearFormat === "YYYY+1") {
      fiscalYear = parseInt(currentYear, 10) + 1;
      nextYear = fiscalYear + 1;
    } else if (fiscalYearFormat === "YYYY") {
      fiscalYear = parseInt(currentYear, 10);
      nextYear = fiscalYear + 1;
    } else if (fiscalYearFormat === "YY-YY+1") {
      if (typeof currentYear !== "string" || !currentYear.includes("-")) {
        // console.error("Invalid currentYear format for YY-YY+1:", currentYear);
        return;
      }

      const [startYY, endYY] = currentYear
        .split("-")
        .map((y: string) => parseInt(y, 10));

      if (isNaN(startYY) || isNaN(endYY)) {
        // console.error("Invalid year values in currentYear:", currentYear);
        return;
      }

      fiscalYear = 2000 + startYY;
      nextYear = 2000 + endYY;
    } else {
      // console.error("Unsupported fiscal year format:", fiscalYearFormat);
      return;
    }

    let start = "";
    let end = "";

    if (fiscalYearQuarters === "Jan - Dec") {
      start = `${fiscalYear}-01-01`;
      end = `${fiscalYear}-12-31`;
    } else if (fiscalYearQuarters === "April - Mar") {
      start = `${fiscalYear}-04-01`;
      end = `${nextYear}-03-31`;
    } else {
      // console.error("Unsupported fiscal year quarter:", fiscalYearQuarters);
      return;
    }

    setStartDate(start);
    setEndDate(end);
  };

  //---------------------------- //----------------------

  const getDayData = async () => {
    const entityParam = entity === undefined ? "All" : entity;
    let apiUrl = `/api/kpi-report/getComputationForCategoryDaywise/${selectedCategoryId}?gte=${startDate}&lte=${endDate}&location[]=${unit}&entity[]=${entityParam}`;

    if (selectedOptionForObjective && selectedOptionForObjective !== null) {
      apiUrl += `&objectiveId=${selectedOptionForObjective}`;
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

  const getMonthlyData = async () => {
    const entityParam = entity === undefined ? "All" : entity;
    let apiUrl = `/api/kpi-report/getComputationForCategoryMonthwise/${selectedCategoryId}?startDate=${startDate}&endDate=${endDate}&location[]=${unit}&entity[]=${entityParam}`;

    if (selectedOptionForObjective && selectedOptionForObjective !== null) {
      apiUrl += `&objectiveId=${selectedOptionForObjective}`;
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

  const getQuaterData = async () => {
    const entityParam = entity === undefined ? "All" : entity;

    let apiUrl = "";
    if (selectedOptionForObjective && selectedOptionForObjective !== null) {
      apiUrl = `/api/kpi-report/getComputationForCategoryQuarterwise/${selectedCategoryId}?startDate=${startDate}&endDate=${endDate}&location[]=${unit}&entity[]=${entityParam}&objectiveId=${selectedOptionForObjective}`;
    } else {
      apiUrl = `/api/kpi-report/getComputationForCategoryQuarterwise/${selectedCategoryId}?startDate=${startDate}&endDate=${endDate}&location[]=${unit}&entity[]=${entityParam}`;
    }

    try {
      const res = await axios.get(apiUrl);
      if (res?.data) {
        setQuaterTableData(res.data);
      } else {
        setQuaterTableData([]);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const getYearlyData = async () => {
    const entityParam = entity === undefined ? "All" : entity;
    let apiUrl = `/api/kpi-report/getComputationForCategoryYearwise/${selectedCategoryId}?startDate=${startDate}&endDate=${endDate}&location[]=${unit}&entity[]=${entityParam}`;

    if (selectedOptionForObjective && selectedOptionForObjective !== null) {
      apiUrl += `&objectiveId=${selectedOptionForObjective}`;
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

  //--------LeaderBoard Data --------------

  const getLeaderBoardData = async () => {
    const entityParam = entity === undefined ? "All" : entity;
    const result = await axios.get(
      `/api/kpi-definition/kpiObjCountForCategory?categoryId=${selectedCategoryId}&location[]=${unit}&entity[]=${entityParam}`
    );

    if (
      result?.data?.length &&
      (result.status === 200 || result.status === 201)
    ) {
      const totalCounts = result.data.reduce(
        (acc: any, curr: any) => {
          acc.kpiTotalCount += curr.countKpis || 0;
          acc.objectiveTotalCount += curr.countObjectives || 0;
          return acc;
        },
        { kpiTotalCount: 0, objectiveTotalCount: 0 }
      );

      setTotalCounts(totalCounts); // assume you're using useState to store it
    }
  };

  return (
    <div>
      {/* ---------Top - Department and Unit filters-------- */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          marginTop: "10px",
        }}
      >
        <div
          style={{ display: "flex", marginRight: "16px", alignItems: "center" }}
        >
          <Breadcrumb separator="  ">
            <Breadcrumb.Item>
              <span style={{ color: "black", fontWeight: "bold" }}>Unit:</span>
              <Select
                showSearch
                allowClear
                placeholder="Select Unit"
                onClear={() => setSelectedLocation(undefined)}
                value={selectedLocation}
                style={{
                  width: 280,
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
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span style={{ color: "black", fontWeight: "bold" }}>
                Department:
              </span>
              <Select
                showSearch
                allowClear
                onClear={() => setSelectedEntity(undefined)}
                disabled={disableDept}
                placeholder="Select Department"
                value={selectedEntity}
                style={{
                  width: 320,
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
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ margin: "0px 12px 0px 14px" }}>
            <SecondaryButton
              type="primary"
              onClick={handleClickFetch}
              buttonText="Apply"
            />
          </div>
          <Button
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
            <BiReset style={{ fontSize: "24px" }} />
            Reset
          </Button>
        </div>
      </div>

      {/* ---------Objective and Category filters-------- */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          marginTop: "15px",
          paddingRight: "16px",
        }}
      >
        <Breadcrumb separator="  ">
          {/* Objective Category Select */}
          <Breadcrumb.Item>
            <span style={{ color: "black", fontWeight: "bold" }}>
              Objective Category:
            </span>
            <Select
              showSearch
              allowClear
              placeholder="Select Objective Category"
              onClear={() => handleCategoryChange(null)}
              value={selectedCategoryId}
              style={{
                width: "370px",
                marginLeft: 8,
                border: "1px solid black",
                borderRadius: "5px",
              }}
              onChange={handleCategoryChange}
              optionFilterProp="children"
              filterOption={(input: any, option: any) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {categoryOption.map((option: any) => (
                <Select.Option
                  key={option.categoryId}
                  value={option.categoryId}
                >
                  {option.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Breadcrumb.Item>

          {/* Objective Select */}
          <Breadcrumb.Item>
            <span style={{ color: "black", fontWeight: "bold" }}>
              Objective:
            </span>
            <Select
              showSearch
              allowClear
              placeholder="Select Objective"
              onClear={() => setSelectedOptionForObjective(null)}
              disabled={!selectedObjective.length}
              value={selectedOptionForObjective}
              style={{
                width: "370px",
                marginLeft: 8,
                border: "1px solid black",
                borderRadius: "5px",
              }}
              onChange={(value) => setSelectedOptionForObjective(value)}
              optionFilterProp="children"
              filterOption={(input: any, option: any) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {selectedObjective.map((option: any) => (
                <Select.Option key={option._id} value={option._id}>
                  {option.ObjectiveName}
                </Select.Option>
              ))}
            </Select>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* ----------Date and Year,Month filters--------- */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          gap: "20px",
          marginTop: "10px",
          paddingRight: "16px",
        }}
      >
        <YearComponent
          currentYear={currentYear}
          setCurrentYear={setCurrentYear}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          {labels.map((label) => (
            <Button
              key={label.full}
              shape="circle"
              style={{
                backgroundColor: selected === label.full ? "#b3cce5" : "#fff",
                borderColor: "#ccc",
                color: "black",
                fontWeight: "bold",
              }}
              onClick={() => setSelected(label.full)}
            >
              {label.short}
            </Button>
          ))}
        </div>
      </div>

      {/* --------------Leader Board------------------ */}
      <ObjectiveLeaderBoard
        totalCounts={totalCounts}
        selected={selected}
        monthlyTableData={monthlyTableData}
        quaterTableData={quaterTableData}
        dayTableData={dayTableData}
        yearlyTableData={yearlyTableData}
      />

      {/* --------------Charts---------------------- */}

      <Charts
        selected={selected}
        monthlyTableData={monthlyTableData}
        quaterTableData={quaterTableData}
        dayTableData={dayTableData}
        yearlyTableData={yearlyTableData}
        selectedOptionForObjective={selectedOptionForObjective}
        selectedCategoryId={selectedCategoryId}
        startDate={startDate}
        endDate={endDate}
        unit={unit}
        entity={entity}
      />

      <div
        style={{
          padding: "0px 16px",
          marginTop: "20px",
        }}
      >
        <ObjectiveReportTable
          selected={selected}
          monthlyTableData={monthlyTableData}
          quaterTableData={quaterTableData}
          dayTableData={dayTableData}
          yearlyTableData={yearlyTableData}
        />
      </div>
    </div>
  );
};

export default ObjectiveReportDashboard;
