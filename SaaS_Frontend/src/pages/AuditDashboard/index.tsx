import React, { useEffect, useState } from "react";
import AuditDFilters from "./AuditDFilters";
import AuditDButtons from "./AuditDButtons";
import AuditDCharts from "./AuditDCharts";
import AuditDTable from "./AuditDTable";
import { AiTwotoneFilter, AiFillFilter } from "react-icons/ai";
import { Breadcrumb, Modal, Select, Button } from "antd";
import axios from "apis/axios.global";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { MdRotateLeft } from "react-icons/md";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import { IconButton, useMediaQuery } from "@material-ui/core";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
import { BiReset } from "react-icons/bi";

const AuditDashboard = () => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [allChartData, setAllChartData] = useState();
  const [selectedUnits, setSelectedUnits] = useState({
    id: userInfo.locationId,
    value: userInfo.location?.locationName,
  });
  const [selectedEntity, setSelectedEntity] = useState<any>({
    id: userInfo?.entityId,
    value: userInfo.entity?.entityName,
  });
  const [selectedAuditType, setSelectedAuditType] = useState({
    id: "All",
    value: "All",
  });
  const [auditTableData, setAuditTableData] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenCharts, setIsModalOpenCharts] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [formData, setFormData] = useState<any>({});
  const [auditType, setAuditType] = useState<any>([]);
  const [units, setUnits] = useState<any>([]);
  const [entity, setEntity] = useState<any>([]);

  const [selectedFunction, setSelectedFunction] = useState(["All"]);
  const [selectedBusiness, setSelectedBusiness] = useState(["All"]);
  const [selectedBusinessType, setSelectedBusinessType] = useState(["All"]);

  useEffect(() => {
    getChartData();
    getUnits();
    getAuditType();
  }, []);

  useEffect(() => {
    getEntity();
  }, [selectedUnits]);

  // useEffect(() => {
  //   getChartData();
  // }, [selectedEntity, selectedUnits]);

  const all = { id: "All", value: "All" };

  const getEntity = async () => {
    if (
      userInfo?.locationId !== selectedUnits?.id &&
      selectedUnits?.id !== "All"
    ) {
      setSelectedEntity({});
    }
    if (selectedUnits !== undefined) {
      const response = await axios.get(
        `/api/audits/getAllEntityForLocation?location[]=${selectedUnits?.id}`
      );

      setEntity([{ id: "All", entityName: "All" }, ...response?.data]);
    }
  };
  const getUnits = async () => {
    const response = await axios.get(
      `/api/audits/getAllLocationForSeletedFunction?functionData[]=${selectedFunction.join(
        "&selectedFunction[]="
      )}&business[]=${selectedBusiness.join(
        "&business[]="
      )}&businessType[]=${selectedBusinessType.join(
        "&selectedBusinessType[]="
      )}`
    );

    const data = response?.data?.map((item: any) => {
      return { id: item.id, value: item?.locationName };
    });
    setUnits([{ id: "All", value: "All" }, ...data]);
  };
  const getAuditType = async () => {
    const response: any = await axios.get("/api/audits/getAllAuditType");
    const data: any = response?.data?.map((item: any) => {
      return { id: item?._id, value: item?.auditType };
    });
    setAuditType([...data, all]);
  };

  const getChartData = async () => {
    const response = await axios.get(
      `/api/audits/chartData?location[]=${selectedUnits?.id}&auditType[]=${selectedAuditType.id}&dateRange[0]=${selectedDateRange[0]}&dateRange[1]=${selectedDateRange[1]}&department[]=${selectedEntity?.id}`
    );
    setAllChartData(response?.data);
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

  const showModalCharts = () => {
    setIsModalOpenCharts(true);
  };

  const handleOkCharts = () => {
    setIsModalOpenCharts(false);
  };

  const handleCancelCharts = () => {
    setIsModalOpenCharts(false);
  };

  const [iconComponent, setIconComponent] = useState<JSX.Element | null>(null);

  useEffect(() => {
    // Check if any formData property has non-empty values
    const hasValues = Object.values(formData).some((value) =>
      Array.isArray(value) ? value.length > 0 : !!value
    );
    // Set the icon component based on whether formData has any non-empty values
    setIconComponent(hasValues ? <AiFillFilter /> : <AiTwotoneFilter />);
  }, [formData]);

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
            paddingRight: "16px",
            marginTop: "25px",
          }}
        >
          {/* <AiTwotoneFilter width={25} height={21} style={{ marginRight: "5px" }} /> */}
          <Breadcrumb separator="  ">
            <Breadcrumb.Item>
              <span style={{ color: "black", fontWeight: "bold" }}>
                Audit Type:
              </span>

              <Select
                // mode="multiple"
                allowClear
                placeholder="Audit Type"
                style={{
                  width: 200,
                  marginLeft: 8,
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                value={selectedAuditType}
                // className={classes.container}
                onChange={(selectedValues, value: any) => {
                  setSelectedAuditType(value);
                  // handleChangeAuditType(selectedValues);
                }}
                showSearch
                optionFilterProp="children"
                options={auditType.map((option: any) => ({
                  label: option.value,
                  value: option.value,
                }))}
                filterOption={(input, option: any) => {
                  return (
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0 ||
                    option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  );
                }}
              />
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span style={{ color: "black", fontWeight: "bold" }}>Unit:</span>

              <Select
                showSearch
                allowClear
                placeholder="Select Unit"
                // onClear={() => setSelectedLocation(undefined)}
                value={selectedUnits}
                style={{
                  width: 200,
                  marginLeft: 8,
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                onChange={(_, value: any) => {
                  if (value?.id === "All") {
                    setSelectedEntity({ value: "All", id: "All" });
                  }
                  setSelectedUnits(value);
                }}
                optionFilterProp="children"
                options={units.map((option: any) => ({
                  value: option.value,
                  id: option.id,
                }))}
                filterOption={(input, option: any) => {
                  return (
                    option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  );
                }}
              />
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span style={{ color: "black", fontWeight: "bold" }}>
                Department:
              </span>

              <Select
                showSearch
                allowClear
                // onClear={() => setSelectedEntity(undefined)}
                placeholder="Select Department"
                disabled={selectedUnits?.id === "All"}
                value={selectedEntity}
                style={{
                  width: 200,
                  marginLeft: 8,
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                onChange={(_, value) => {
                  setSelectedEntity(value);
                  // setFilterField({ ...filterField, entity: value });
                }}
                optionFilterProp="children"
                filterOption={(input, option: any) => {
                  return (
                    option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  );
                }}
                options={entity.map((option: any) => ({
                  value: option.entityName,
                  id: option.id,
                }))}
              />
            </Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ margin: "0px 12px 0px 14px" }}>
            <SecondaryButton
              type="primary"
              onClick={() => {
                getChartData();
              }}
              buttonText="Apply"
            />
          </div>

          <IconButton
            style={{
              display: "flex",
              justifyContent: "center",
              height: "32px",
              fontSize: "14px",
              fontFamily: "Roboto",
              alignItems: "center",
              gap: "6px",
              padding: "5px 0px",
              color: "black",
            }}
            onClick={async () => {
              setSelectedEntity({
                id: userInfo.entityId,
                value: userInfo.entity.entityName,
              });
              setSelectedUnits({
                id: userInfo.locationId,
                value: userInfo?.location?.locationName,
              });
              setSelectedAuditType(all);
              const response = await axios.get(
                `/api/audits/chartData?location[]=${
                  userInfo.locationId
                }&auditType[]=${`All`}&dateRange[0]=${
                  selectedDateRange[0]
                }&dateRange[1]=${selectedDateRange[1]}&department[]=${
                  userInfo.entityId
                }`
              );
              setAllChartData(response?.data);
            }}
          >
            <BiReset style={{ fontSize: "24px" }} />
            Reset
          </IconButton>
        </div>
      ) : null}

      <div style={{ marginTop: "0px", width: "100%" }}>
        <AuditDButtons allChartData={allChartData} />
        {/* <div style={{ display: "flex", gap: "20px", backgroundColor: "#F8F9F9" }}> */}
        <AuditDCharts
          allChartData={allChartData}
          selectedUnits={selectedUnits}
          setSelectedUnits={setSelectedUnits}
          selectedAuditType={selectedAuditType}
          setSelectedAuditType={setSelectedAuditType}
          setAuditTableData={setAuditTableData}
          showModalCharts={showModalCharts}
          setSelectedDateRange={setSelectedDateRange}
          getChartData={getChartData}
        />
        <Modal
          open={isModalOpenCharts}
          onOk={handleOkCharts}
          onCancel={handleCancelCharts}
          okText="Ok"
          width="90vw"
          zIndex={2000}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "calc(100vh - 200px)", // Adjust the value as needed
          }}
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
          <AuditDTable auditTableData={auditTableData} />
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
            <span style={{ color: "black" }}>Audit Type:</span>

            <Select
              // mode="multiple"
              allowClear
              placeholder="Audit Type"
              style={{
                width: "100%",
                marginLeft: 8,
                border: "1px solid black",
                borderRadius: "5px",
              }}
              value={selectedAuditType}
              // className={classes.container}
              onChange={(selectedValues, value: any) => {
                setSelectedAuditType(value);
                // handleChangeAuditType(selectedValues);
              }}
              showSearch
              optionFilterProp="children"
              options={auditType.map((option: any) => ({
                label: option.value,
                value: option.value,
              }))}
              filterOption={(input, option: any) => {
                return (
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                    0 ||
                  option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
            />
          </div>
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
              // onClear={() => setSelectedLocation(undefined)}
              value={selectedUnits}
              style={{
                width: "100%",
                marginLeft: 8,
                border: "1px solid black",
                borderRadius: "5px",
              }}
              onChange={(_, value: any) => {
                setSelectedUnits(value);
              }}
              optionFilterProp="children"
              options={units.map((option: any) => ({
                value: option.value,
                id: option.id,
              }))}
              filterOption={(input, option: any) => {
                return (
                  option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
            />
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
              // onClear={() => setSelectedEntity(undefined)}
              placeholder="Select Department"
              value={selectedEntity}
              style={{
                width: "100%",
                marginLeft: 8,
                border: "1px solid black",
                borderRadius: "5px",
              }}
              onChange={(_, value) => {
                setSelectedEntity(value);
                // setFilterField({ ...filterField, entity: value });
              }}
              optionFilterProp="children"
              filterOption={(input, option: any) => {
                return (
                  option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
              options={entity.map((option: any) => ({
                value: option.entityName,
                id: option.id,
              }))}
            />
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
              onClick={() => {
                getChartData();
              }}
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
              onClick={async () => {
                // setFilterField({
                //   location: userDetail.locationId,
                //   entity: userDetail.entityId,
                // });
                // setOpen(false);
                setSelectedEntity({
                  id: userInfo.entityId,
                  value: userInfo.entity.entityName,
                });
                setSelectedUnits({
                  id: userInfo.locationId,
                  value: userInfo?.location?.locationName,
                });
                setSelectedAuditType(all);
                const response = await axios.get(
                  `/api/audits/chartData?location[]=${
                    userInfo.locationId
                  }&auditType[]=${`All`}&dateRange[0]=${
                    selectedDateRange[0]
                  }&dateRange[1]=${selectedDateRange[1]}&department[]=${
                    userInfo.entityId
                  }`
                );
                setAllChartData(response?.data);
              }}
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
        <AuditDFilters
          setAllChartData={setAllChartData}
          selectedUnits={selectedUnits}
          setSelectedUnits={setSelectedUnits}
          selectedAuditType={selectedAuditType}
          setSelectedAuditType={setSelectedAuditType}
          getChartData={getChartData}
          setSelectedDateRange={setSelectedDateRange}
          setFormData={setFormData}
          formData={formData}
        />
      </Modal>
    </>
  );
};

export default AuditDashboard;
