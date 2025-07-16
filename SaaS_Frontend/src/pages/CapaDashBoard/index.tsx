import { useEffect, useState } from "react";
import CapaDashBoardCharts from "./CapaDashBoardCharts";
import CapaDashBoardTable from "./CapaDashBoardTable";
import axios from "apis/axios.global";
import { Breadcrumb, Button, Modal, Select } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { AiOutlineFilter, AiFillFilter } from "react-icons/ai";
import { useSnackbar } from "notistack";
import { useMediaQuery } from "@material-ui/core";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import { MdRotateLeft } from "react-icons/md";
import LeaderBoard from "./LeaderBoard";
import YearComponent from "components/Yearcomponent";
import getYearFormat from "utils/getYearFormat";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
import { BiReset } from "react-icons/bi";

const CapaDashBoard = () => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const [capaChartData, setCapaChartData] = useState<any>();
  const [selectedCapaIds, setSelectedCapaIds] = useState<any[]>([]);
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [capaModelTableData, setCapaModelTableData] = useState<any[]>([]);
  const [isModalOpenCharts, setIsModalOpenCharts] = useState<any>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iconComponent, setIconComponent] = useState<JSX.Element | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [newChartData, setNewChartData] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [disableDept, setDisableDept] = useState<any>(false);
  const [allOption, setAllOption] = useState("");
  const [allDepartmentOption, setAllDepartmentOption] = useState("");
  const [alllocationData, setAllLocationData] = useState<any[]>([]);
  const [alllocationTableData, setAllLocationTableData] = useState<any[]>([]);
  const [isModalOpenMobileFilter, setIsModalOpenMobileFilter] = useState(false);
  const [tags, setTags] = useState<any>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(
    userInfo?.locationId
  );
  const [selectedEntity, setSelectedEntity] = useState<any>(
    userInfo?.entity?.id
  );
  const [matchedDepartmentName, setMatchedDepartmentName] = useState(
    userInfo?.entity?.entityName
  );
  const [matchedLocationName, setMatchedLocationName] = useState(
    userInfo?.location?.locationName
  );
  const [resetState, setResetState] = useState(false);
  const [currentYear, setCurrentYear] = useState<any>();
  const [basicOrAdvance, setBasicOrAdvance] = useState<any>("");

  const [trendChartData, setTrendChartData] = useState<any[]>([]);
  const [sourceChartData, setSourceChartData] = useState<any[]>([]);
  const [causeChartData, setCauseChartData] = useState<any[]>([]);
  const [defectTypeChartData, setDefectTypeChartData] = useState<any[]>([]);
  const [ownerChartData, setOwnerChartData] = useState<any[]>([]);
  const [productTypeChartData, setProductTypeChartData] = useState<any[]>([]);
  const [leaderBoardData, setLeaderBoardData] = useState<any>();

  // console.log("currentYear", currentYear);
  // console.log("trendChartData", trendChartData);
  // console.log("sourceChartData", sourceChartData);
  // console.log("causeChartData", causeChartData);
  // console.log("defectTypeChartData", defectTypeChartData);
  // console.log("ownerChartData", ownerChartData);
  // console.log("productTypeChartData", productTypeChartData);
  // console.log("matchedLocationName", matchedLocationName);
  // console.log("basicOrAdvance", basicOrAdvance);

  useEffect(() => {
    getyear();
  }, []);

  useEffect(() => {
    if (currentYear !== undefined && currentYear !== null) {
      getStatuswiseChart(selectedLocation, selectedEntity);
      getTrendChartData(selectedLocation, selectedEntity);
      getSourceChartData(selectedLocation, selectedEntity);
      getDefectTypeChartData(selectedLocation, selectedEntity);
      getByCauseChartData(selectedLocation, selectedEntity);
      getByOwnerChartData(selectedLocation, selectedEntity);
      getByProductChartData(selectedLocation, selectedEntity);
      getDepartmentwiseDataForChart();
      getCapaChartData(selectedLocation, selectedEntity);
    }
  }, [currentYear]); // ✅ depend on currentYear

  useEffect(() => {
    if (resetState === true) {
      getCapaChartData(selectedLocation, selectedEntity);
      getDepartmentwiseDataForChart();
      getStatuswiseChart(selectedLocation, selectedEntity);
      getTrendChartData(selectedLocation, selectedEntity);
      getSourceChartData(selectedLocation, selectedEntity);
      getDefectTypeChartData(selectedLocation, selectedEntity);
      getByCauseChartData(selectedLocation, selectedEntity);
      getByOwnerChartData(selectedLocation, selectedEntity);
      getByProductChartData(selectedLocation, selectedEntity);
      getBasicOrAdvanceCapa();
    }
  }, [resetState]);

  useEffect(() => {
    getCapaChartData(selectedLocation, selectedEntity);
    getBasicOrAdvanceCapa();
    forChangeingCharts();
  }, []);

  useEffect(() => {
    setTags([
      {
        tagName: `Unit : ${userInfo?.location?.locationName}`,
        color: "blue",
      },
      {
        tagName: `Department : ${userInfo?.entity?.entityName}`,
        color: "orange",
      },
    ]);
  }, []);

  useEffect(() => {
    if (!!selectedCapaIds && selectedCapaIds.length > 0) {
      getCapaTableData();
    }
  }, [selectedCapaIds]);

  useEffect(() => {
    const hasValues = Object.values(formData).some((value) =>
      Array.isArray(value) ? value.length > 0 : !!value
    );
    setIconComponent(hasValues ? <AiFillFilter /> : <AiOutlineFilter />);
  }, [formData]);

  useEffect(() => {
    getLocationOptions();
    getDepartmentOptions(userInfo?.location?.id);
  }, []);

  useEffect(() => {
    if (selectedLocation === "All") {
      getDataForAllUnit();
    }
  }, [selectedLocation]);

  const getBasicOrAdvanceCapa = async () => {
    const result = await axios.get(
      `/api/cara/getRcaSettingsForLocationInDashboard/${selectedLocation}`
    );
    if (result.status === 200 || result.status === 201) {
      setBasicOrAdvance(result?.data);
    }
  };

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  const getStatuswiseChart = async (
    selectedLocation: any,
    selectedEntity: any
  ) => {
    if (currentYear !== undefined) {
      const entityParam = selectedEntity === undefined ? "All" : selectedEntity;
      const result = await axios.get(
        `/api/cara/getStatusWiseCapaCount?locationId[]=${selectedLocation}&entityId[]=${entityParam}&organizationId=${userInfo.organizationId}&year=${currentYear}`
      );
      if (result.status === 200 || result.status === 201) {
        setLeaderBoardData(result?.data);
      }
    }
  };

  const getTrendChartData = async (
    selectedLocation: any,
    selectedEntity: any
  ) => {
    if (currentYear !== undefined) {
      const entityParam = selectedEntity === undefined ? "All" : selectedEntity;
      const result = await axios.get(
        `/api/cara/getMonthWiseCapaCount?locationId[]=${selectedLocation}&entityId[]=${entityParam}&organizationId=${userInfo.organizationId}&year=${currentYear}`
      );

      if (result.status === 200 || result.status === 201) {
        setTrendChartData(result?.data);
      }
    }
  };

  const getSourceChartData = async (
    selectedLocation: any,
    selectedEntity: any
  ) => {
    if (currentYear !== undefined) {
      const entityParam = selectedEntity === undefined ? "All" : selectedEntity;
      const result = await axios.get(
        `/api/cara/getOriginWiseCapaCount?locationId[]=${selectedLocation}&entityId[]=${entityParam}&organizationId=${userInfo.organizationId}&year=${currentYear}`
      );
      if (result.status === 200 || result.status === 201) {
        setSourceChartData(result?.data);
      }
    }
  };

  const getDefectTypeChartData = async (
    selectedLocation: any,
    selectedEntity: any
  ) => {
    if (currentYear !== undefined) {
      const entityParam = selectedEntity === undefined ? "All" : selectedEntity;
      const result = await axios.get(
        `/api/cara/getDefectTypeWiseCapaCount?locationId[]=${selectedLocation}&entityId[]=${entityParam}&organizationId=${userInfo.organizationId}&year=${currentYear}`
      );
      if (result.status === 200 || result.status === 201) {
        setDefectTypeChartData(result?.data);
      }
    }
  };

  const getByCauseChartData = async (
    selectedLocation: any,
    selectedEntity: any
  ) => {
    if (currentYear !== undefined) {
      const entityParam = selectedEntity === undefined ? "All" : selectedEntity;
      const result = await axios.get(
        `/api/cara/getCauseWiseCapaCount?locationId[]=${selectedLocation}&entityId[]=${entityParam}&organizationId=${userInfo.organizationId}&year=${currentYear}`
      );
      if (result.status === 200 || result.status === 201) {
        setCauseChartData(result?.data);
      }
    }
  };

  const getByOwnerChartData = async (
    selectedLocation: any,
    selectedEntity: any
  ) => {
    if (currentYear !== undefined) {
      const entityParam = selectedEntity === undefined ? "All" : selectedEntity;
      const result = await axios.get(
        `/api/cara/getOwnerWiseCapaCount?locationId[]=${selectedLocation}&entityId[]=${entityParam}&organizationId=${userInfo.organizationId}&year=${currentYear}`
      );
      if (result.status === 200 || result.status === 201) {
        setOwnerChartData(result?.data);
      } else {
        setOwnerChartData([]);
      }
    }
  };

  const getByProductChartData = async (
    selectedLocation: any,
    selectedEntity: any
  ) => {
    if (currentYear !== undefined) {
      const entityParam = selectedEntity === undefined ? "All" : selectedEntity;
      const result = await axios.get(
        `/api/cara/getProductWiseCapaCount?locationId[]=${selectedLocation}&entityId[]=${entityParam}&organizationId=${userInfo.organizationId}&year=${currentYear}`
      );
      if (result.status === 200 || result.status === 201) {
        setProductTypeChartData(result?.data);
      }
    }
  };

  const getCapaChartData = async (
    selectedLocation: any,
    selectedEntity: any
  ) => {
    const entityParam = selectedEntity === undefined ? "All" : selectedEntity;

    const response = await axios.get(
      `/api/cara/getChartData?locationId[]=${[selectedLocation]}&entityId[]=${[
        entityParam,
      ]}`
    );
    if (response.status === 200 || response.status === 201) {
      setCapaChartData(response?.data);
      setResetState(false);
    }
  };

  const handleClickFetch = () => {
    getCapaChartData(selectedLocation, selectedEntity);
    getDepartmentwiseDataForChart();
    forChangeingCharts();

    getStatuswiseChart(selectedLocation, selectedEntity);
    getTrendChartData(selectedLocation, selectedEntity);
    getSourceChartData(selectedLocation, selectedEntity);
    getDefectTypeChartData(selectedLocation, selectedEntity);
    getByCauseChartData(selectedLocation, selectedEntity);
    getByOwnerChartData(selectedLocation, selectedEntity);
    getByProductChartData(selectedLocation, selectedEntity);

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

      appliedFilters = appliedFilters + 1;
    }
    if (selectedEntity) {
      const entityName = departmentOptions.find(
        (option: any) => option.value === selectedEntity
      )?.label;
      usedTags = [
        ...usedTags,
        { tagName: `Department : ${entityName}`, color: "blue" },
      ];

      appliedFilters = appliedFilters + 1;
    }
    if (!selectedEntity) {
      setSelectedEntity("All");
      usedTags = [...usedTags, { tagName: `Department : All`, color: "blue" }];
      setAllDepartmentOption("All");
    }

    if (!selectedLocation) {
      usedTags = [
        { tagName: `Unit : All`, color: "orange" },
        { tagName: `Department : All`, color: "blue" },
      ];
      setAllOption("All");
      getDataForAllUnit();
    }

    setTags(usedTags);
    getBasicOrAdvanceCapa();
  };

  const handleResetFilters = () => {
    getyear();
    setSelectedEntity(userInfo?.entity?.id);
    setSelectedLocation(userInfo?.locationId);
    // setMatchedDepartmentName(userInfo?.entity?.entityName);
    setMatchedLocationName(userInfo?.location?.locationName);
    getDepartmentOptions(userInfo?.location?.id);
    setDisableDept(false);
    setTags([
      {
        tagName: `Unit : ${userInfo?.location?.locationName}`,
        color: "blue",
      },
      {
        tagName: `Department : ${userInfo?.entity?.entityName}`,
        color: "orange",
      },
    ]);
    setAllOption("");
    setAllDepartmentOption("");
    setResetState(true);

    // getBasicOrAdvanceCapa();
  };

  const getCapaTableData = async () => {
    const response = await axios.get(
      `/api/cara/getCapaDataforIds?ids[]=${selectedCapaIds.join("&ids[]=")}`
    );
    setCapaModelTableData(response.data);
  };

  const getDepartmentwiseDataForChart = async () => {
    if (currentYear !== undefined) {
      const entityParam = selectedEntity === undefined ? "All" : selectedEntity;
      let result;
      const url =
        selectedEntity === "All" || selectedEntity === undefined
          ? `/api/cara/getDeptwiseChartData?locationId[]=${selectedLocation}&year=${currentYear}`
          : `/api/cara/getDeptwiseChartData?locationId[]=${selectedLocation}&entityId[]=${entityParam}&year=${currentYear}`;

      result = await axios.get(url);

      if (result.status === 200 || result.status === 201) {
        setNewChartData(result?.data?.deptwiseData);
        setResetState(false);
      }
    }
  };

  const getDataForAllUnit = async () => {
    if (currentYear !== undefined) {
      const result = await axios.get(
        `/api/cara/getLocationwiseChartData?locationId[]=All&year=${currentYear}`
      );
      setAllLocationData(result?.data?.chart);
      setAllLocationTableData(result?.data?.table);
    }
  };

  const forChangeingCharts = () => {
    const matchedOption = departmentOptions?.find(
      (option: any) => option?.value === selectedEntity
    );
    if (matchedOption) {
      setMatchedDepartmentName(matchedOption?.label);
    } else {
      setMatchedDepartmentName(userInfo?.entity?.entityName); // Clear the label if no match is found
    }

    const matchedOptionForUnit = locationOptions?.find(
      (option: any) => option?.value === selectedLocation
    );
    if (matchedOption) {
      setMatchedLocationName(matchedOptionForUnit?.label);
    } else {
      setMatchedLocationName(userInfo?.location?.locationName); // Clear the label if no match is found
    }
  };

  //-----------------filters

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

  const showModalCharts = () => {
    setIsModalOpenCharts(true);
  };

  const handleOkCharts = () => {
    setIsModalOpenCharts(false);
  };

  const handleCancelCharts = () => {
    setIsModalOpenCharts(false);
    setSelectedCapaIds([]);
    setCapaModelTableData([]);
  };

  const showModal = () => {
    setIsModalOpen(true);
    // handleFilterClick();
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // mobile view filter moda.

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
      <div>
        {matches ? (
          <div
            style={{
              width: "100%",
              fontSize: "20px",
              color: "black !important",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginLeft: "16px",
              }}
            >
              <p style={{ fontSize: "14px", fontWeight: 600 }}>
                Total # of CAPAs :
              </p>
              <p
                style={{
                  fontSize: "42px",
                  fontWeight: 600,
                  color: "#003059",
                  margin: "0px 0px",
                  padding: "0px 0px",
                }}
              >
                {leaderBoardData?.total ?? 0}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                marginRight: "16px",
                justifyContent: "end",
                alignItems: "center",
              }}
            >
              <div style={{ marginTop: "-5px" }}>
                <YearComponent
                  currentYear={currentYear}
                  setCurrentYear={setCurrentYear}
                />
              </div>
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
                  <span>Department:</span>
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
                {" "}
                <BiReset style={{ fontSize: "24px" }} />
                Reset
              </Button>
            </div>
          </div>
        ) : null}

        <div>
          <LeaderBoard leaderBoardData={leaderBoardData} />
        </div>

        <div>
          <CapaDashBoardCharts
            capaChartData={capaChartData}
            setSelectedCapaIds={setSelectedCapaIds}
            showModalCharts={showModalCharts}
            newChartData={newChartData}
            matchedDepartmentName={matchedDepartmentName}
            matchedLocationName={matchedLocationName}
            alllocationData={alllocationData}
            alllocationTableData={alllocationTableData}
            allOption={allOption}
            allDepartmentOption={allDepartmentOption}
            tags={tags}
            trendChartData={trendChartData}
            sourceChartData={sourceChartData}
            causeChartData={causeChartData}
            defectTypeChartData={defectTypeChartData}
            ownerChartData={ownerChartData}
            productTypeChartData={productTypeChartData}
            basicOrAdvance={basicOrAdvance}
          />
        </div>
        <Modal
          open={isModalOpenCharts}
          onOk={handleOkCharts}
          onCancel={handleCancelCharts}
          okText="Ok"
          width="90%"
          zIndex={2000}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{
                width: "30px",
                height: "38px",
                cursor: "pointer",
                // marginTop: "-5px",
              }}
            />
          }
        >
          <CapaDashBoardTable capaModelTableData={capaModelTableData} />
        </Modal>

        <Modal
          title={"Filter By"}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          // okText="Ok"
          okText="" // Set to empty string to hide "Ok" button
          cancelText=""
          width="40vw"
          // style={{
          //   marginTop: "20px ",
          //   left: "450px",
          // }}
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
          {/* <CapaDashBoardFilter
            setFormData={setFormData}
            setSelectedUnits={setSelectedUnits}
            selectedUnits={selectedUnits}
            setSelectedEntity={setSelectedEntity}
            getCapaChartData={getCapaChartData}
            selectedEntity={selectedEntity}
          /> */}
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
              showSearch
              allowClear
              placeholder="Select Unit"
              onClear={() => setSelectedLocation(undefined)}
              value={selectedLocation}
              style={{
                width: "100%",

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
                width: "100%",

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
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CapaDashBoard;
