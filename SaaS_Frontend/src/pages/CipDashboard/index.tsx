import { useEffect, useState } from "react";
import CipCharts from "./CipCharts";
import CipDashboardTable from "./CipDashBoardTable";
import { Breadcrumb, Button, Modal, Select } from "antd";
import CipCostChartTable from "./CipDashBoardTable/CipCostChartTable";
import axios from "apis/axios.global";
import CipDashboardFilter from "./CipDashboardFilter";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { AiOutlineFilter, AiFillFilter } from "react-icons/ai";
import { useSnackbar } from "notistack";
import { useMediaQuery } from "@material-ui/core";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import { MdRotateLeft } from "react-icons/md";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
import { BiReset } from "react-icons/bi";

const CipDashboard = () => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [selectedCipStatus, setSelectedCipStatus] = useState<any>("");
  const [selectedCostCipId, setSelectedCostCipId] = useState<any[]>([]);
  const [isModalOpenCharts, setIsModalOpenCharts] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState([userInfo.locationId]);
  const [selectedBusinessType, setSelectedBusinessType] = useState(["All"]);
  const [selectedBusiness, setSelectedBusiness] = useState(["All"]);
  const [selectedFunction, setSelectedFunction] = useState(["All"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenTable, setIsModalOpenTable] = useState(false);
  const [allOption, setAllOption] = useState("");
  const [iconComponent, setIconComponent] = useState<JSX.Element | null>(null);
  const [formData, setFormData] = useState<any>({});
  const { enqueueSnackbar } = useSnackbar();
  const [disableDept, setDisableDept] = useState<any>(false);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
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
  const [selectedCostCipIdForAllLocation, setSelectedCostCipIdForAllLocation] =
    useState<any[]>([]);
  const [selectedCipIdForAllDepartment, setSelectedCipIdForAllDepartment] =
    useState<any[]>([]);
  const [cipTableDataForAllLocation, setCipTableDataForAllLocation] = useState<
    any[]
  >([]);
  const [cipCostTableData, setCipCostTableData] = useState<any>();
  const [chartData, setChartData] = useState<any>();
  const [chartDataForAlllocation, setChartDataForAlllocation] = useState<any[]>(
    []
  );
  const [allDepartment, setAllDepartment] = useState("");
  const [cipAllDepartmentData, setCipAllDepartmentData] = useState<any[]>([]);
  const [tags, setTags] = useState<any>([]);

  useEffect(() => {
    getCipChartData();
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
    if (selectedCostCipId) {
      getCipCostTableData();
    }
  }, [selectedCostCipId]);

  const [cipIds, setCipIds] = useState<any[]>([]);

  useEffect(() => {
    setCipIds(selectedCipIdForAllDepartment);
  }, [selectedCipIdForAllDepartment]);

  useEffect(() => {
    setCipIds(selectedCostCipIdForAllLocation);
  }, [selectedCostCipIdForAllLocation]);
  useEffect(() => {
    if (cipIds.length > 0) {
      getCipCostTableDataForAllLocation(cipIds);
    }
  }, [cipIds]);

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

  const getCipCostTableData = async () => {
    try {
      if (selectedCostCipId.length > 0) {
        const response = await axios.get(
          `/api/cip/getCIPById/${selectedCostCipId}`
        );
        setCipCostTableData(response);
      }
    } catch (error) {
      console.error("Error fetching CIP data:", error);
    }
  };

  const getCipCostTableDataForAllLocation = async (ids: any) => {
    const response = await axios.get(
      `/api/cip/getCipDataForIds?ids[]=${ids.join("&ids[]=")}`
    );
    setCipTableDataForAllLocation(response?.data);
  };

  const getCipChartData = async () => {
    const entityParam = selectedEntity === undefined ? "All" : selectedEntity;
    const locationParam =
      selectedLocation === undefined ? "All" : selectedLocation;
    const response = await axios.get(
      `/api/cip/chartData?location[]=${locationParam}&entity=${entityParam}`
    );

    if (response.status === 200 || response.status === 201) {
      if (selectedLocation === "All" || selectedLocation === undefined) {
        setChartDataForAlllocation(response.data.statusWiseData);
      } else {
        setChartData(response.data);
      }
      setResetState(false);
    }
  };

  const getAllDepartmentChartData = async () => {
    const result = await axios.get(
      `api/cip/getDeptwiseChartData?locationId[]=${selectedLocation}`
    );

    setCipAllDepartmentData(result.data.deptwiseData);
  };

  const showModalCharts = () => {
    setIsModalOpenCharts(true);
  };

  const handleOkCharts = () => {
    setIsModalOpenCharts(false);
  };

  const handleCancelCharts = () => {
    setIsModalOpenCharts(false);
  };

  const showModalChartss = () => {
    setIsModalOpenTable(true);
  };

  const handleOkChartss = () => {
    setIsModalOpenTable(false);
  };

  const handleCancelChartss = () => {
    setIsModalOpenTable(false);
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

  // -filters functions

  const getLocationOptions = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userInfo?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
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
    } catch (error) {}
  };

  const getDepartmentOptions = async (locationId: any = "") => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllDepartmentsByLocation/${locationId}`
      );

      if (res.status === 200 || res.status === 201) {
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
      setAllDepartment(selectedEntity);
      getAllDepartmentChartData();
    } else {
      setAllDepartment("");
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
    }
    if (!selectedLocation) {
      // setSelectedLocation("All");
      // setSelectedEntity("All");
      usedTags = [
        { tagName: `Unit : All`, color: "orange" },
        { tagName: `Department : All`, color: "blue" },
      ];
      setAllOption("All");
    }

    setTags(usedTags);
    getCipChartData();
  };

  const [resetState, setResetState] = useState(false);

  useEffect(() => {
    if (resetState === true) {
      getCipChartData();
    }
  }, [resetState]);

  const handleResetFilters = () => {
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
    setAllDepartment("");
    setResetState(true);
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
      <div style={{ marginTop: "20px" }}>
        {matches ? (
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0px 20px",
                height: "40px",
                marginTop: "10px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "22px",
                    marginLeft: "30px",
                    fontWeight: "bold",
                    padding: "0px",
                  }}
                ></p>
              </div>
              {/* <div
            style={{
              cursor: "pointer",
              // position: "absolute",
              // top: "10px",
              // right: "70px",
              fontSize: "20px",
              color: "#3576BA",
              marginRight: "30px",
            }}
            onClick={showModal}
          >
            <Tooltip title="CAPA Filter">{iconComponent}</Tooltip>
          </div> */}

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
                }}
              >
                {/* <AiOutlineFilter
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
                  <BiReset style={{ fontSize: "24px" }} />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <CipCharts
          showModalCharts={showModalCharts}
          setSelectedCipStatus={setSelectedCipStatus}
          setSelectedCostCipId={setSelectedCostCipId}
          getCipCostTableData={getCipCostTableData}
          showModalChartss={showModalChartss}
          chartData={chartData}
          chartDataForAlllocation={chartDataForAlllocation}
          allOption={allOption}
          setSelectedCostCipIdForAllLocation={
            setSelectedCostCipIdForAllLocation
          }
          cipAllDepartmentData={cipAllDepartmentData}
          setSelectedCipIdForAllDepartment={setSelectedCipIdForAllDepartment}
          allDepartment={allDepartment}
          tags={tags}
        />
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
              }}
            />
          }
        >
          <CipDashboardTable
            selectedCipStatus={selectedCipStatus}
            cipTableDataForAllLocation={cipTableDataForAllLocation}
            allOption={allOption}
            handleCancelCharts={handleCancelCharts}
          />
        </Modal>
        <Modal
          open={isModalOpenTable}
          onOk={handleOkChartss}
          onCancel={handleCancelChartss}
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
              }}
            />
          }
        >
          <CipCostChartTable
            selectedCostCipId={selectedCostCipId}
            cipCostTableData={cipCostTableData}
          />
        </Modal>
      </div>
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
        <CipDashboardFilter
          setFormData={setFormData}
          setSelectedUnits={setSelectedUnits}
          selectedUnits={selectedUnits}
          setSelectedBusinessType={setSelectedBusinessType}
          selectedBusinessType={selectedBusinessType}
          setSelectedBusiness={setSelectedBusiness}
          selectedBusiness={selectedBusiness}
          setSelectedFunction={setSelectedFunction}
          selectedFunction={selectedFunction}
          getCipChartData={getCipChartData}
        />
      </Modal>

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

export default CipDashboard;
