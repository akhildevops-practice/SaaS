import { CircularProgress, useMediaQuery } from "@material-ui/core";
import useStyles from "./style";
import { useEffect, useState } from "react";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import { useSnackbar } from "notistack";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import { MdRotateLeft } from "react-icons/md";
import { Form, Select, Button, Breadcrumb, Modal } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import type { PaginationProps } from "antd";
import HiraGraphSection from "./HiraGraphSection";
import HiraCountSectionForFilters from "./HiraCountSectionForFilters";
import HiraCountSection from "./HiraCountSection";

const showTotalForAll: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

function isEmptyObj(obj: any) {
  return Object.keys(obj).length === 0;
}

function arrayToQueryString(key: any, array: any) {
  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}

function groupByLocation(data: any) {
  const locationMap = new Map();
  data.forEach((item: any) => {
    const locationId = item.locationId;
    const entityData = {
      total: item.total,
      inWorkflow: item.inWorkflow,
      DRAFT: item.DRAFT,
      APPROVED: item.APPROVED,
      entityId: item.entityId,
      entityName: item.entityName,
    };

    if (!locationMap.has(locationId)) {
      locationMap.set(locationId, {
        _id: locationId,
        locationName: item.locationName,
        entityGroupedCount: [entityData],
      });
    } else {
      locationMap.get(locationId).entityGroupedCount.push(entityData);
    }
  });

  // Sort entities within each location group alphabetically by entityName
  locationMap.forEach((value) => {
    value?.entityGroupedCount.sort((a: any, b: any) =>
      a?.entityName?.localeCompare(b?.entityName)
    );
  });

  return Array.from(locationMap.values());
}

const generateQueryString = (
  isPrimaryFilterParam: any = true,
  defaultFilter: any = false,
  selectedEntity: string,
  selectedLocation: string,
  selectedCategory: string,
  formData: any,
  selectedDateRange: any,
  activeTab: number,
  userDetails: any
) => {
  let entityQueryString = "",
    unitQueryString = "",
    categoryQueryString = "";

  if (!defaultFilter) {
    if (selectedEntity && selectedEntity !== "All") {
      entityQueryString = arrayToQueryString("entity", [selectedEntity]);
    }
    if (selectedLocation && selectedLocation !== "All") {
      unitQueryString = arrayToQueryString("unit", [selectedLocation]);
    }
    if (selectedCategory && selectedCategory !== "All") {
      categoryQueryString = arrayToQueryString("category", [selectedCategory]);
    }
  } else {
    entityQueryString = arrayToQueryString("entity", [userDetails?.entity?.id]);
    unitQueryString = arrayToQueryString("unit", [userDetails?.location?.id]);
  }

  let queryStringParts = [];

  if (isPrimaryFilterParam) {
    queryStringParts = [
      entityQueryString,
      unitQueryString,
      categoryQueryString,
    ].filter((part) => part.length > 0);
    queryStringParts.push(`isPrimaryFilter=true`);
    if (selectedDateRange?.fromDate && selectedDateRange?.toDate) {
      queryStringParts.push(
        `fromDate=${selectedDateRange?.fromDate}&toDate=${selectedDateRange?.toDate}`
      );
    }
  } else {
    if (
      activeTab === 0 ||
      activeTab === 2 ||
      activeTab === 4 ||
      activeTab === 6
    ) {
      queryStringParts.push(
        `entityId=${encodeURIComponent(userDetails?.entity?.id)}`
      );
    }
    if (
      activeTab === 1 ||
      activeTab === 3 ||
      activeTab === 5 ||
      activeTab === 7
    ) {
      queryStringParts.push(
        `locationId=${encodeURIComponent(userDetails?.location?.id)}`
      );
    }

    if (activeTab === 0 || activeTab === 1) {
      queryStringParts.push(`total=${encodeURIComponent("true")}`);
    }

    if (activeTab === 2 || activeTab === 3) {
      queryStringParts.push(`new=${encodeURIComponent("true")}`);
    }
    if (activeTab === 4 || activeTab === 5) {
      queryStringParts.push(`inWorkflow=${encodeURIComponent("true")}`);
    }
    if (activeTab === 6 || activeTab === 7) {
      queryStringParts.push(`significant=${encodeURIComponent("true")}`);
    }
  }

  queryStringParts.push(`organizationId=${userDetails?.organizationId}`);

  return queryStringParts.join("&");
};

const HiraDashboard = () => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles(matches)();
  const userDetails = getSessionStorage();
  const [filterForm] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();

  //for hira count section
  const [hiraCountObject, setHiraCountObject] = useState<any>({});
  const [isLoadingHiraCount, setIsLoadingHiraCount] = useState<any>(false);

  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [selectedEntity, setSelectedEntity] = useState<any>(undefined);

  const [selectedLocation, setSelectedLocation] = useState<any>(undefined);
  const [locationOptions, setLocationOptions] = useState<any>([]);

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryOptions, setCategoryOptions] = useState<any>([]);

  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const [hazardGraphData, setHazardGraphData] = useState<any>([]);
  const [conditionGraphData, setConditionGraphData] = useState<any>([]);
  const [hiraAverageRiskScore, setHiraAverageRiskScore] = useState<any>(0);
  const [topTenRiskTableData, setTopTenRiskTableData] = useState<any>([]);
  const [hiraRiskLevelData, setHiraRiskLevelData] = useState<any>({});

  const [tableFilters, setTableFilters] = useState<any>({});
  const [allHiraTableData, setAllHiraTableData] = useState<any>([]);
  const [allHiraTableDataLoading, setAllHiraTableDataLoading] =
    useState<any>(false);

  const [graphLoaders, setGraphLoaders] = useState<any>({
    hazardGraph: false,
    conditionGraph: false,
  });
  const [activeTab, setActiveTab] = useState<any>(0);
  const [isPrimaryFilter, setIsPrimaryFilter] = useState<any>(true);

  const [significanHiraGraphData, setSignificanHiraGraphData] = useState<any>(
    []
  );
  const [paginationForAll, setPaginationForAll] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [badgeCount, setBadgeCount] = useState<any>(0);

  const [isDefaultFilter, setIsDefaultFilter] = useState<any>(true);

  const [filterModal, setFilterModal] = useState<any>({
    open: false,
  });
  const [tags, setTags] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [consolidatedCountTableData, setConsolidatedCountTableData] =
    useState<any>([]);
  const [disableDept, setDisableDept] = useState<any>(false);
  const [showTableModal, setShowTableModal] = useState<any>({
    hazard: false,
    condition: false,
    topTen: false,
  });

  useEffect(() => {
    const newRowElement = document?.querySelector(".new-row");
    if (newRowElement && allHiraTableData?.length > 0) {
      newRowElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [allHiraTableData]);

  useEffect(() => {
    // setIsLoading(true); // Start the loader
    setIsDefaultFilter(true);
    setBadgeCount(2);
    setTags([
      {
        tagName: `Unit : ${userDetails?.location?.locationName}`,
        color: "blue",
      },
      {
        tagName: `Department : ${userDetails?.entity?.entityName}`,
        color: "orange",
      },
      {
        tagName: `Category : All`,
        color: "green",
      },
    ]);

    filterForm?.setFieldsValue({
      unit: userDetails?.location?.id,
      entity: userDetails?.entity?.id,
    });

    setFormData({
      unit: userDetails?.location?.id,
      entity: userDetails?.entity?.id,
    });

    setSelectedEntity(userDetails?.entity?.id);
    setSelectedLocation(userDetails?.location?.id);
    //console.log("checkfilter Start");

    // const fetchAllData = async () => {
    // await Promise.all([
    getLocationOptions();
    getCategoryOptions();
    getDepartmentOptions(userDetails?.location?.id);
    getHiraCountByCondition(false, true);
    getStepsCountByScore(false, true);
    getTopTenRiskScores(false, true);
    fetchStatusCountsByEntity(isPrimaryFilter, 1, 10);
    fetchHiraDashboardBoardCounts(false, true);
    getStepsCountByHazardType(false, true);
    // ]);
    // console.log("checkfilter End");
    // setIsLoading(false); // Stop the loader
    // };

    // fetchAllData();
  }, []);

  useEffect(() => {
    // console.log("checkdashboard activeTab in dashboard page", activeTab);
    if (!!activeTab || activeTab === 0) {
      handleClearForm();

      setSelectedDateRange(null);
      setPaginationForAll({
        current: 1,
        pageSize: 10,
        total: 0,
      });
      setIsPrimaryFilter(false);
      setAllHiraTableData([]);
      setHazardGraphData([]);
      setConditionGraphData([]);
      setHiraRiskLevelData({});
      setTopTenRiskTableData([]);
      setHiraAverageRiskScore(0);
      setIsDefaultFilter(false);
      getStepsCountByHazardType(false, false);
      getHiraCountByCondition(false, false);
      getStepsCountByScore(false, false);
      getTopTenRiskScores(false, false);
      fetchStatusCountsByEntity(isPrimaryFilter, 1, 10);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!isEmptyObj(tableFilters)) {
      if (tableFilters?.hira) {
        const url = `/risk/riskregister/HIRA/${tableFilters.hira}`;
        window.open(url, "_blank");
      } else {
        setPaginationForAll({
          current: 1,
          pageSize: 10,
          total: 0,
        });

        getHiraWithStepsWithFilters(isPrimaryFilter, 1, 10);
      }
    }
  }, [tableFilters]);

  const handleClearForm = () => {
    filterForm?.setFieldsValue({
      // jobTitle: undefined,
      entity: undefined,
      unit: undefined,
      // businessTypes: undefined,
      // business: undefined,
      // function: undefined,
    });
  };

  const getStepsCountByHazardType = async (
    isPrimaryFilterParam: any = true,
    defaultFilter: any = false
  ) => {
    try {
      setGraphLoaders({
        ...graphLoaders,
        hazardGraph: true,
      });
      const queryString = generateQueryString(
        isPrimaryFilterParam,
        defaultFilter,
        selectedEntity,
        selectedLocation,
        selectedCategory,
        formData,
        selectedDateRange,
        activeTab,
        userDetails
      );
      const res = await axios.get(
        `/api/riskregister/hira/getStepsCountByHazardType/${userDetails?.organizationId}?${queryString}`
      );
      //console.log("checkdashboardnew getStepsCountByHazardType", res);
      if (res?.status === 200) {
        setHazardGraphData(res.data);
        setGraphLoaders({
          ...graphLoaders,
          hazardGraph: false,
        });
      } else {
        setHazardGraphData([]);
        //console.log("error in getStepsCountByHazardType", res);
        setGraphLoaders({
          ...graphLoaders,
          hazardGraph: false,
        });
      }
    } catch (error) {
      setHazardGraphData([]);
      setGraphLoaders({
        ...graphLoaders,
        hazardGraph: false,
      });
      //console.log("error in getStepsCountByHazardType", error);
    }
  };

  const getHiraWithStepsWithFilters = async (
    isPrimaryFilterParam: any = true,
    page: any = 1,
    pageSize: any = 10,
    pagination: any = true
  ) => {
    try {
      let entityQueryString = "",
        unitQueryString = "";
      setAllHiraTableDataLoading(true);
      if (selectedEntity && selectedEntity !== "All") {
        entityQueryString = arrayToQueryString("entity", [selectedEntity]);
      }
      if (selectedLocation && selectedLocation !== "All") {
        unitQueryString = arrayToQueryString("unit", [selectedLocation]);
      }
      let queryStringParts = [];
      if (isPrimaryFilterParam) {
        queryStringParts = [entityQueryString, unitQueryString].filter(
          (part) => part.length > 0
        );
        queryStringParts.push(`isPrimaryFilter=true`);
      } else {
        if (
          activeTab === 0 ||
          activeTab === 2 ||
          activeTab === 4 ||
          activeTab === 6
        ) {
          queryStringParts.push(
            `entityId=${encodeURIComponent(userDetails?.entity?.id)}`
          );
        }
        if (
          activeTab === 1 ||
          activeTab === 3 ||
          activeTab === 5 ||
          activeTab === 7
        ) {
          queryStringParts.push(
            `locationId=${encodeURIComponent(userDetails?.location?.id)}`
          );
        }

        if (activeTab === 0 || activeTab === 1) {
          queryStringParts.push(`total=${encodeURIComponent("true")}`);
        }

        if (activeTab === 2 || activeTab === 3) {
          queryStringParts.push(`new=${encodeURIComponent("true")}`);
        }
        if (activeTab === 4 || activeTab === 5) {
          queryStringParts.push(`inWorkflow=${encodeURIComponent("true")}`);
        }
        if (activeTab === 6 || activeTab === 7) {
          queryStringParts.push(`significant=${encodeURIComponent("true")}`);
        }
      }
      queryStringParts.push(`organizationId=${userDetails?.organizationId}`);

      // Handle tableFilters
      if (!isEmptyObj(tableFilters)) {
        if (tableFilters.hazard) {
          queryStringParts.push(
            `hazard=${encodeURIComponent(tableFilters.hazard?.hazardTypeId)}`
          );
          const hiraIds = tableFilters?.hazard?.hira?.map(
            (hira: any) => hira.id
          );
          if (hiraIds && hiraIds.length > 0) {
            const hiraIdQuery = arrayToQueryString("hiraIds", hiraIds);
            queryStringParts.push(hiraIdQuery); // Push hiraIdQuery directly
          }
        }
        if (tableFilters.condition) {
          queryStringParts.push(
            `condition=${encodeURIComponent(tableFilters.condition)}`
          );
        }
        if (tableFilters.hira) {
          queryStringParts.push(
            `hira=${encodeURIComponent(tableFilters.hira)}`
          );
        }
        if (tableFilters.entity) {
          queryStringParts.push(
            `entityFilter=${encodeURIComponent(tableFilters.entity)}`
          );
        }
      }

      let queryString = queryStringParts.join("&");

      if (!pagination) {
        queryString += `&pagination=${false}`;
      }

      const res = await axios.get(
        `/api/riskregister/hira/getHiraWithStepsWithFilters/${userDetails?.organizationId}?${queryString}&page=${page}&pageSize=${pageSize}`
      );
      //console.log("checkdashboardnew query string", queryString);
      if (res?.status === 200) {
        if (!!res?.data?.list && !!res?.data?.list?.length) {
          setAllHiraTableData(res.data.list);
          setPaginationForAll((prev) => ({
            ...prev,
            total: res.data.total,
          }));
          setAllHiraTableDataLoading(false);
          setShowTableModal({
            hazard: tableFilters.hazard ? true : false,
            condition: tableFilters.condition ? true : false,
            topTen: tableFilters.hira ? true : false,
          });
        } else {
          setAllHiraTableData([]);
          setPaginationForAll((prev) => ({ ...prev, total: 0 }));
          setAllHiraTableDataLoading(false);
          setShowTableModal({
            hazard: false,
            condition: false,
            topTen: false,
          });
        }
      } else {
        setAllHiraTableData([]);
        setPaginationForAll((prev) => ({ ...prev, total: 0 }));

        setAllHiraTableDataLoading(false);
        setShowTableModal({
          hazard: false,
          condition: false,
          topTen: false,
        });

        //console.log("Error in getAllHiraTableDataBasedOnFilter", res.data);
      }
    } catch (error) {
      setShowTableModal({
        hazard: false,
        condition: false,
        topTen: false,
      });
      //console.log("Error in getHiraWithStepsWithFilters", error);
    }
  };

  const getHiraWithStepsWithFiltersForExcel = async (
    isPrimaryFilterParam: any = true,
    pagination: any = false
  ) => {
    try {
      let entityQueryString = "",
        unitQueryString = "";
      setAllHiraTableDataLoading(true);
      if (selectedEntity && selectedEntity !== "All") {
        entityQueryString = arrayToQueryString("entity", [selectedEntity]);
      }
      if (selectedLocation && selectedLocation !== "All") {
        unitQueryString = arrayToQueryString("unit", [selectedLocation]);
      }
      let queryStringParts = [];
      if (isPrimaryFilterParam) {
        queryStringParts = [entityQueryString, unitQueryString].filter(
          (part) => part.length > 0
        );
        queryStringParts.push(`isPrimaryFilter=true`);
      } else {
        if (
          activeTab === 0 ||
          activeTab === 2 ||
          activeTab === 4 ||
          activeTab === 6
        ) {
          queryStringParts.push(
            `entityId=${encodeURIComponent(userDetails?.entity?.id)}`
          );
        }
        if (
          activeTab === 1 ||
          activeTab === 3 ||
          activeTab === 5 ||
          activeTab === 7
        ) {
          queryStringParts.push(
            `locationId=${encodeURIComponent(userDetails?.location?.id)}`
          );
        }

        if (activeTab === 0 || activeTab === 1) {
          queryStringParts.push(`total=${encodeURIComponent("true")}`);
        }

        if (activeTab === 2 || activeTab === 3) {
          queryStringParts.push(`new=${encodeURIComponent("true")}`);
        }
        if (activeTab === 4 || activeTab === 5) {
          queryStringParts.push(`inWorkflow=${encodeURIComponent("true")}`);
        }
        if (activeTab === 6 || activeTab === 7) {
          queryStringParts.push(`significant=${encodeURIComponent("true")}`);
        }
      }
      queryStringParts.push(`organizationId=${userDetails?.organizationId}`);

      // Handle tableFilters
      if (!isEmptyObj(tableFilters)) {
        if (tableFilters.hazard) {
          queryStringParts.push(
            `hazard=${encodeURIComponent(tableFilters.hazard?.hazardTypeId)}`
          );
          const hiraIds = tableFilters?.hazard?.hira?.map(
            (hira: any) => hira.id
          );
          if (hiraIds && hiraIds.length > 0) {
            const hiraIdQuery = arrayToQueryString("hiraIds", hiraIds);
            queryStringParts.push(hiraIdQuery); // Push hiraIdQuery directly
          }
        }
        if (tableFilters.condition) {
          queryStringParts.push(
            `condition=${encodeURIComponent(tableFilters.condition)}`
          );
        }
        if (tableFilters.hira) {
          queryStringParts.push(
            `hira=${encodeURIComponent(tableFilters.hira)}`
          );
        }
      }

      let queryString = queryStringParts.join("&");
      if (!pagination) {
        queryString += `&pagination=${false}`;
      }

      const res = await axios.get(
        `/api/riskregister/hira/getHiraWithStepsWithFilters/${userDetails?.organizationId}?${queryString}`
      );
      //console.log("checkdashboardnew query string", queryString);
      if (res?.status === 200) {
        if (!!res?.data?.list && !!res?.data?.list?.length) {
          // setAllHiraTableData(res.data.list);
          setAllHiraTableDataLoading(false);
          return {
            list: res?.data?.list,
            total: res?.data?.total,
          };
        } else {
          setAllHiraTableDataLoading(false);
          return {
            list: [],
            total: 0,
          };
        }
      } else {
        setAllHiraTableDataLoading(false);
        return {
          list: [],
          total: 0,
        };
      }
    } catch (error) {
      setAllHiraTableDataLoading(false);
    }
  };

  const fetchStatusCountsByEntity = async (
    isPrimaryFilterParam: any = true,
    page: any = 1,
    pageSize: any = 10
  ) => {
    try {
      const res = await axios.get(
        `/api/riskregister/hira/fetchHiraCountsByEntityAndSection/${userDetails?.organizationId}`
      );
      // console.log(
      //   "checkdashboardnew fetchHiraCountsByEntityAndSection",
      //   res.data
      // );
      if (res?.status === 200) {
        if (!!res?.data && !!res?.data?.mainTableResult?.length) {
          const groupedData = groupByLocation(res.data?.mainTableResult);
          // console.log("checkdashboardne/w", groupedData);
          // const newSectionData = mergeSectionDataWithEntities(res.data?.mainTableResult, res.data?.sectionResults);
          // console.log(
          //   "checkdashboardnew groupedData in fetchHiraCountsByEntityAndSection",
          //   groupedData
          // );

          setConsolidatedCountTableData(groupedData);
        } else {
          setConsolidatedCountTableData([]);
        }
      } else {
        setConsolidatedCountTableData([]);

        //console.log("Error in getAllHiraTableDataBasedOnFilter", res.data);
      }
    } catch (error) {
      setConsolidatedCountTableData([]);

      //console.log("Error in getAllHiraTableDataBasedOnFilter", error);
    }
  };

  const fetchHiraDashboardBoardCounts = async (
    isPrimaryFilterParam: any = true,
    defaultFilter: any = false
  ) => {
    try {
      let entityQueryString = "",
        unitQueryString = "",
        jobTitleQueryString = "",
        queryStringParts: any = [];
      if (defaultFilter) {
        entityQueryString = arrayToQueryString("entity", [
          userDetails?.entity?.id,
        ]);
        unitQueryString = arrayToQueryString("unit", [
          userDetails?.location?.id,
        ]);
        queryStringParts = [entityQueryString, unitQueryString].filter(
          (part) => part.length > 0
        );
      } else {
        if (selectedEntity && selectedEntity !== "All") {
          entityQueryString = arrayToQueryString("entity", [selectedEntity]);
        }
        if (selectedLocation && selectedLocation !== "All") {
          unitQueryString = arrayToQueryString("unit", [selectedLocation]);
        }
        // console.log("checkdashboard formDATA in hazardgraph", formData);
        if (isPrimaryFilterParam) {
          queryStringParts = [
            jobTitleQueryString,
            entityQueryString,
            unitQueryString,
          ].filter((part) => part.length > 0);
          queryStringParts.push(`isPrimaryFilter=true`);
          if (selectedDateRange?.fromDate && selectedDateRange?.toDate) {
            queryStringParts.push(
              `fromDate=${selectedDateRange?.fromDate}&toDate=${selectedDateRange?.toDate}`
            );
          }
        } else {
          if (
            activeTab === 0 ||
            activeTab === 2 ||
            activeTab === 4 ||
            activeTab === 6 ||
            activeTab === 8 ||
            activeTab === 10
          ) {
            queryStringParts.push(
              `entityId=${encodeURIComponent(userDetails?.entity?.id)}`
            );
          }
          if (
            activeTab === 1 ||
            activeTab === 3 ||
            activeTab === 5 ||
            activeTab === 7 ||
            activeTab === 9 ||
            activeTab === 11
          ) {
            queryStringParts.push(
              `locationId=${encodeURIComponent(userDetails?.location?.id)}`
            );
          }
        }
      }
      //console.log("query string parts--.", queryStringParts);

      const queryString = queryStringParts.join("&");
      const res = await axios.get(
        `/api/riskregister/hira/fetchHiraDashboardBoardCounts/${userDetails?.organizationId}?${queryString}`
      );
      if (res?.status === 200) {
        setHiraCountObject(res.data);
      } else {
        //console.log("Error in fetchOverallStatusCounts");
      }
    } catch (error) {
      //console.log("Error in fetchOverallStatusCounts", error);
    }
  };

  const getLocationOptions = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        //console.log("checkrisk res in getAllLocation", res);
        if (res?.data?.data && !!res.data.data.length) {
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
    } catch (error) {
      // //console.log("checkrisk error in fetching all job title", error);
    }
  };

  const getDepartmentOptions = async (locationId: any = "") => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllDepartmentsByLocation/${locationId}`
      );

      if (res.status === 200 || res.status === 201) {
        //console.log("checkrisk res in getAllDepartmentsByLocation", res);
        if (res?.data?.data && !!res.data.data.length) {
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
      // //console.log("checkrisk error in fetching all job title", error);
    }
  };

  const getCategoryOptions = async () => {
    try {
      const res = await axios.get(
        `/api/riskconfig/getallcategorynames/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        // console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setCategoryOptions([
            ...[{ value: "All", label: "All" }],
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item._id,
              label: item.riskCategory,
            })),
          ]);
          setSelectedCategory("All");
        } else {
          setCategoryOptions([]);
          enqueueSnackbar("No Categories Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getallcategorynames", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const getHiraCountByCondition = async (
    isPrimaryFilterParam: any = true,
    defaultFilter: any = false
  ) => {
    try {
      setGraphLoaders({
        ...graphLoaders,
        conditionGraph: true,
      });
      const queryString = generateQueryString(
        isPrimaryFilterParam,
        defaultFilter,
        selectedEntity,
        selectedLocation,
        selectedCategory,
        formData,
        selectedDateRange,
        activeTab,
        userDetails
      );

      const res = await axios.get(
        `/api/riskregister/hira/getHiraCountByCondition/${userDetails?.organizationId}?${queryString}`
      );
      // console.log(
      //   "checkdashboardnew data in getHiraCountByCondition",
      //   res.data
      // );
      if (res?.status === 200) {
        setConditionGraphData(res.data);
        setGraphLoaders({
          ...graphLoaders,
          conditionGraph: false,
        });
      } else {
        // console.log("Error in getHiraCount", res);
        setConditionGraphData([]);
        setGraphLoaders({
          ...graphLoaders,
          conditionGraph: false,
        });
      }
    } catch (error) {
      setConditionGraphData([]);
      setGraphLoaders({
        ...graphLoaders,
        conditionGraph: false,
      });
      //console.log("Error in getHiraCount", error);
    }
  };

  const getTopTenRiskScores = async (
    isPrimaryFilterParam: any = true,
    defaultFilter: any = false
  ) => {
    try {
      setGraphLoaders({
        ...graphLoaders,
        topTenGraph: true,
      });
      const queryString = generateQueryString(
        isPrimaryFilterParam,
        defaultFilter,
        selectedEntity,
        selectedLocation,
        selectedCategory,
        formData,
        selectedDateRange,
        activeTab,
        userDetails
      );
      const res = await axios.get(
        `/api/riskregister/hira/getTopTenHiraByScore/${userDetails?.organizationId}?${queryString}`
      );
      //console.log("checkdashboardnew res in TOP ten graph", res);

      if (res?.status === 200) {
        setTopTenRiskTableData(res.data);
        setGraphLoaders({
          ...graphLoaders,
          topTenGraph: false,
        });
      } else {
        //console.log("Error in getHiraCount", res.data);
        setGraphLoaders({
          ...graphLoaders,
          topTenGraph: false,
        });
      }
    } catch (error) {
      setGraphLoaders({
        ...graphLoaders,
        topTenGraph: false,
      });
      //console.log("Error in getHiraCount", error);
    }
  };

  const getStepsCountByScore = async (
    isPrimaryFilterParam: any = true,
    defaultFilter: any = false
  ) => {
    try {
      setGraphLoaders({
        ...graphLoaders,
        riskLevelGraph: true,
      });
      const queryString = generateQueryString(
        isPrimaryFilterParam,
        defaultFilter,
        selectedEntity,
        selectedLocation,
        selectedCategory,
        formData,
        selectedDateRange,
        activeTab,
        userDetails
      );
      const res = await axios.get(
        `/api/riskregister/hira/getStepsCountByScore/${userDetails?.organizationId}?${queryString}`
      );
      //console.log("checkdashboardnew data in hira level graph", res);
      if (res?.status === 200) {
        setHiraRiskLevelData(res?.data[0]);
        setGraphLoaders({
          ...graphLoaders,
          riskLevelGraph: false,
        });
      } else {
        //console.log("Error in getHiraCount", res.data);
        setGraphLoaders({
          ...graphLoaders,
          riskLevelGraph: false,
        });
      }
    } catch (error) {
      setGraphLoaders({
        ...graphLoaders,
        riskLevelGraph: false,
      });
      //console.log("Error in getHiraCount", error);
    }
  };

  const handleLocationChange = (value: any) => {
    // //console.log("checkdashboard handleLocationChange", value);
    if (value !== "All") {
      setSelectedLocation(value);
      setSelectedEntity(undefined);
      getDepartmentOptions(value);
      setDisableDept(false);
    } else {
      setSelectedLocation("All");
      setSelectedEntity("All");
      setDisableDept(true);
    }
  };
  const handleDepartmentChange = (value: any) => {
    setSelectedEntity(value);
  };

  const handleCategoryChange = (value: any) => {
    setSelectedCategory(value);
  };

  const handleChangePageNewForAll = (page: number, pageSize: number) => {
    // //console.log("checkrisk page", page, pageSize);
    setPaginationForAll((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
    // getTableDataBasedOnFilters(isPrimaryFilter, page, pageSize);
    getHiraWithStepsWithFilters(isPrimaryFilter, page, pageSize);
  };

  const handleClickFetch = (values: any) => {
    // console.log("checkdashboard values", values);
    // console.log("checkdashboard selectedDateRange", selectedDateRange);
    // // console.log("checkdashboard formData", formData);
    // console.log("checkdashboard entity", selectedEntity);
    // console.log("checkdashboard location", selectedLocation);
    let appliedFilters: any = 0,
      usedTags: any = [];
    if (selectedLocation) {
      const locationName = locationOptions.find(
        (option: any) => option.value === selectedLocation
      )?.label;
      usedTags = [
        ...usedTags,
        { tagName: `Unit : ${locationName}`, color: "orange" },
      ];
      // console.log("inside location and tags", locationName, usedTags);

      appliedFilters = appliedFilters + 1;
    }

    // console.log("checkgraph selectedEntity", selectedEntity);

    if (selectedEntity) {
      const entityName = departmentOptions.find(
        (option: any) => option.value === selectedEntity
      )?.label;
      usedTags = [
        ...usedTags,
        { tagName: `Department : ${entityName}`, color: "blue" },
      ];
      // console.log("inside entity and tags", selectedEntity, usedTags);

      appliedFilters = appliedFilters + 1;
    }

    if (selectedCategory) {
      const categoryName = categoryOptions.find(
        (option: any) => option.value === selectedCategory
      )?.label;
      usedTags = [
        ...usedTags,
        { tagName: `Category : ${categoryName}`, color: "green" },
      ];
      // console.log("inside entity and tags", selectedEntity, usedTags);

      appliedFilters = appliedFilters + 1;
    }
    if (!selectedEntity) {
      setSelectedEntity("All");
      usedTags = [...usedTags, { tagName: `Department : All`, color: "blue" }];
    }
    if (!selectedLocation) {
      setSelectedLocation("All");
      setSelectedEntity("All");
      usedTags = [
        ...usedTags,
        { tagName: `Unit : All`, color: "orange" },
        { tagName: `Department : All`, color: "blue" },
      ];
    }
    if (!selectedCategory) {
      setSelectedLocation("All");
      setSelectedEntity("All");
      setSelectedCategory("All");
      usedTags = [
        ...usedTags,
        { tagName: `Unit : All`, color: "orange" },
        { tagName: `Department : All`, color: "blue" },
        { tagName: `Category : All`, color: "green" },
      ];
    }
    setBadgeCount(appliedFilters);
    setTags(usedTags);
    setFilterModal({
      ...filterModal,
      open: false,
    });
    setIsPrimaryFilter(true);
    setActiveTab(null);
    setPaginationForAll({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    setAllHiraTableData([]);
    //console.log("checkdashboard formData", formData);

    if (
      !!formData?.unit?.length ||
      !!formData?.entity?.length ||
      !!formData?.jobTitle?.length
    ) {
      //console.log("checkdashboard inside if");

      setIsDefaultFilter(false);
      getStepsCountByHazardType(true, false);
      getHiraCountByCondition(true, false);
      getTopTenRiskScores(true, false);
      getStepsCountByScore(true, false);
      fetchStatusCountsByEntity(isPrimaryFilter, 1, 10);
      fetchHiraDashboardBoardCounts(true, false);
      // fetchOverallStatusCounts(true, false);
    }
  };

  const handleResetFilters = (values: any) => {
    // console.log("checkdashboard values", values);
    // console.log("checkdashboard selectedDateRange", selectedDateRange);
    // console.log("checkdashboard formData", formData);
    setFilterModal({
      ...filterModal,
      open: false,
    });
    setDisableDept(false);
    setBadgeCount(0);
    setTags([
      {
        tagName: `Unit : ${userDetails?.location?.locationName}`,
        color: "blue",
      },
      {
        tagName: `Department : ${userDetails?.entity?.entityName}`,
        color: "orange",
      },
      {
        tagName: `Category : All`,
        color: "green",
      },
    ]);
    setIsPrimaryFilter(false);
    setActiveTab(null);
    setPaginationForAll({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    setAllHiraTableData([]);
    filterForm?.setFieldsValue({
      // jobTitle: undefined,
      entity: undefined,
      unit: undefined,
      // businessTypes: undefined,
      // business: undefined,
      // function: undefined,
    });
    setSelectedEntity(userDetails?.entity?.id);
    setSelectedLocation(userDetails?.location?.id);
    setSelectedDateRange(null);
    setIsDefaultFilter(true);
    getStepsCountByHazardType(false, true);
    getHiraCountByCondition(false, true);
    getStepsCountByScore(false, true);
    fetchStatusCountsByEntity(isPrimaryFilter, 1, 10);
    getTopTenRiskScores(false, true);
    fetchHiraDashboardBoardCounts(false, true);
    // fetchOverallStatusCounts(false, true);
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
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <>
          {matches ? (
            <div
              style={{
                // cursor: "pointer",
                // position: "absolute",
                // top: "10px",
                // right: "35px",
                fontSize: "20px",
                color: "black !important",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: "30px",
              }}
            >
              {/* <FilterTwoTone
              width={25}
              height={21}
              style={{ marginRight: "5px" }}
            /> */}
              <Breadcrumb separator="  ">
                <Breadcrumb.Item>
                  <span style={{ color: "black" }}>Unit:</span>
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
                  <span style={{ color: "black" }}>Department:</span>
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
                <Breadcrumb.Item>
                  <span style={{ color: "black" }}>Category:</span>
                  <Select
                    showSearch
                    allowClear
                    onClear={() => setSelectedCategory(undefined)}
                    disabled={disableDept}
                    placeholder="Select Category"
                    value={selectedCategory}
                    style={{
                      width: 320,
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
                    {categoryOptions.map((option: any) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Breadcrumb.Item>
              </Breadcrumb>
              <Button
                type="primary"
                onClick={handleClickFetch}
                style={{
                  width: "70px",
                  backgroundColor: "rgb(0, 48, 89)",
                  marginLeft: "5px",
                  height: "28px",
                  lineHeight: "16px",
                }}
              >
                Apply
              </Button>
              <Button
                type="text"
                onClick={handleResetFilters}
                style={{
                  width: "40px",
                  display: "flex",
                  justifyContent: "center",
                  height: "32px",
                }}
                icon={<MdRotateLeft />}
              />
            </div>
          ) : null}
          {isDefaultFilter || !!activeTab || activeTab === 0 ? (
            <HiraCountSection
              hiraCountObject={hiraCountObject}
              isLoadingHiraCount={isLoadingHiraCount}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ) : (
            <HiraCountSectionForFilters
              hiraCountObject={hiraCountObject}
              isLoadingHiraCount={isLoadingHiraCount}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          <HiraGraphSection
            formData={formData}
            hazardGraphData={hazardGraphData}
            conditionGraphData={conditionGraphData}
            hiraAverageRiskScore={hiraAverageRiskScore}
            topTenRiskTableData={topTenRiskTableData}
            hiraRiskLevelData={hiraRiskLevelData}
            tableFilters={tableFilters}
            setTableFilters={setTableFilters}
            significanHiraGraphData={significanHiraGraphData}
            consolidatedCountTableData={consolidatedCountTableData}
            tags={tags}
            graphLoaders={{ ...graphLoaders }}
            showTableModal={showTableModal}
            setShowTableModal={setShowTableModal}
            allHiraTableData={allHiraTableData}
            handleChangePageNewForAll={handleChangePageNewForAll}
            paginationForAll={paginationForAll}
            showTotalForAll={showTotalForAll}
            allHiraTableDataLoading={allHiraTableDataLoading}
            getHiraWithStepsWithFiltersForExcel={
              getHiraWithStepsWithFiltersForExcel
            }
            isPrimaryFilter={isPrimaryFilter}
          />
          <br />
        </>
      )}

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
              showSearch
              allowClear
              placeholder="Select Unit"
              onClear={() => setSelectedLocation(undefined)}
              value={selectedLocation}
              style={{
                width: matches ? 280 : "100%",
                marginLeft: matches ? 8 : 0,
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
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <span>Department:</span>

            <Select
              showSearch
              allowClear
              onClear={() => setSelectedEntity(undefined)}
              disabled={disableDept}
              placeholder="Select Department"
              value={selectedEntity}
              style={{
                width: matches ? 320 : "100%",
                marginLeft: matches ? 8 : 0,
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
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <Button
              type="primary"
              onClick={handleClickFetch}
              style={{
                width: "70px",
                backgroundColor: "rgb(0, 48, 89)",
                marginLeft: "5px",
                height: "28px",
                lineHeight: "16px",
              }}
            >
              Apply
            </Button>
            <Button
              type="text"
              onClick={handleResetFilters}
              style={{
                width: "40px",
                display: "flex",
                justifyContent: "center",
                height: "32px",
              }}
              icon={<MdRotateLeft />}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default HiraDashboard;

{
  /* <FilterTwoTone
        style={{
          cursor: "pointer",
          position: "absolute",
          top: "10px",
          right: "70px",
          fontSize: "20px",
        }}
        onClick={() =>
          setFilterModal({
            ...filterModal,
            open: !filterModal.open,
          })
        }
      /> */
}
