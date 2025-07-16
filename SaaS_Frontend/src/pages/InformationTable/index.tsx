import { useState, useEffect } from "react";
import {
  InputNumber,
  Button,
  DatePicker,
  Input,
  Select,
  SelectProps,
} from "antd";
import axios from "apis/axios.global";
import styles from "./style";
import { MdOutlineCheckCircle, MdOutlineSync } from "react-icons/md";
import { MdOutlineEdit } from "react-icons/md";
import ConsolidatedTable from "./ConsolidatedTable";
import { IconButton, Tooltip } from "@material-ui/core";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AiOutlineFileExcel } from "react-icons/ai";
import getSessionStorage from "utils/getSessionStorage";
import checkRole from "utils/checkRoles";

interface DataType {
  key: number;
  slno: number;
  locationId: string;
  locationName: string;
  imsc: string;
  totalUsers: number;
  docs: number;
  total: number;
  uploads: number;
  hira_estimatedTotal: number;
  hira_currentTotal: number;
  hira_totalUploaded: number;
  aspImp_estimatedTotal: number;
  aspImp_currentTotal: number;
  aspImp_totalUploaded: number;
  objAndKpi_totalDepartments: number;
  objAndKpi_noOfDeptWithObjective: number;
  objAndKpi_totalObjectives: number;
  objAndKpi_totalKpis: number;
  audit_totalAuditPlans: number;
  audit_totalAuditSchedules: number;
  audit_totalAuditReports: number;
  audit_totalAuditFindings: number;
  cip_totalCip: number;
  capa_totalCapa: number;
  mrm_totalMrmPlans: number;
  mrm_totalMrmSchedule: number;
  mrm_totalMom: number;
  [key: string]: any;
}

const InformationTable = () => {
  const classes = styles();
  const userDetails = getSessionStorage();
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const isMr = checkRole("MR");
  const [tableData, setTableData] = useState<DataType[]>([]);
  const [documentColumns, setDocumentColumns] = useState<any[]>([]);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const orgId = sessionStorage.getItem("orgId");
  const [api, setApi] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [businessTypeOptions, setBusinessTypeOptions] = useState<any[]>([
    {
      id: "All",
      name: "All",
    },
  ]);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<any[]>([
    {
      id: "All",
      name: "All",
    },
  ]);
  const [locationOptions, setLocationOptions] = useState<any[]>([
    {
      id: "All",
      locationName: "All",
    },
  ]);
  const [selectedUnits, setSelectedUnits] = useState<any[]>([
    {
      id: "All",
      locationName: "All",
    },
  ]);
  const [selectedDate, setSelectedDate] = useState<any>("Today");

  useEffect(() => {
    alltableData("Today", selectedBusinessTypes, selectedUnits);
    getAllBusinessTypes();
    getAllLocations();
  }, []);

  const getAllBusinessTypes = async () => {
    try {
      const res = await axios.get(
        "api/moduleAdoptionReport/getAllBusinessTypes"
      );
      setBusinessTypeOptions(businessTypeOptions.concat(res.data));
    } catch (error) {
      setBusinessTypeOptions([
        {
          id: "All",
          name: "All",
        },
      ]);
    }
  };

  const getAllLocations = async () => {
    try {
      const res = await axios.get("api/moduleAdoptionReport/getAllLocations");
      setLocationOptions(locationOptions.concat(res.data));
    } catch (error) {
      setLocationOptions([
        {
          id: "All",
          locationName: "All",
        },
      ]);
    }
  };

  const alltableData = async (date: any, business: any, units: any) => {
    try {
      const res = await axios.get(
        `api/moduleAdoptionReport/getModuleAdoptionReport?date=${date}&business=${business.map(
          (item: any) => item.id
        )}&units=${units.map((item: any) => item.id)}`
      );
      const apiData = res?.data;
      setApi(apiData);

      const flattenedData: DataType[] = apiData?.map(
        (item: any, index: number) => {
          const documents = item?.documents?.currentTotal.reduce(
            (acc: any, doc: any) => {
              acc[doc?.docTypeName] = doc?.count;
              return acc;
            },
            {}
          );

          return {
            key: index,
            locationId: item?.locationId,
            slno: index + 1,
            locationName: item?.locationName,
            spoc: item?.spoc,
            imsc: item?.imsc,
            totalUsers: item?.totalUsers,
            docs: item?.documents?.currentTotal.reduce(
              (sum: number, doc: any) => sum + doc?.count,
              0
            ),
            ...documents,
            doc_estimatedTotal: item?.documents?.estimatedTotal,
            total: item?.documents?.currentTotalUploaded,
            uploads: item?.documents?.totalUploaded,
            hira_estimatedTotal: item?.hira?.estimatedTotal,
            hira_currentTotal: item?.hira?.currentTotal,
            hira_totalUploaded: item?.hira?.totalUploaded,
            aspImp_estimatedTotal: item?.aspImp?.estimatedTotal,
            aspImp_currentTotal: item?.aspImp?.currentTotal,
            aspImp_totalUploaded: item?.aspImp?.totalUploaded,
            objAndKpi_totalDepartments: item?.objAndKpi?.totalDepartments,
            objAndKpi_noOfDeptWithObjective:
              item?.objAndKpi?.noOfDeptWithObjective,
            objAndKpi_totalObjectives: item?.objAndKpi?.totalObjectives,
            objAndKpi_totalUploaded: item?.objAndKpi?.totalUploaded,
            objAndKpi_totalKpis: item?.objAndKpi?.totalKpis,
            audit_totalAuditPlans: item?.audit?.totalAuditPlans,
            audit_totalAuditSchedules: item?.audit?.totalAuditSchedules,
            audit_totalAuditReports: item?.audit?.totalAuditReports,
            audit_totalAuditFindings: item?.audit?.totalAuditFindings,
            cip_totalCip: item?.cip?.totalCip,
            capa_totalCapa: item?.capa?.totalCapa,
            mrm_totalMrmPlans: item?.mrm?.totalMrmPlans,
            mrm_totalMrmSchedule: item?.mrm?.totalMrmSchedule,
            mrm_totalMom: item?.mrm?.totalMom,
          };
        }
      );

      const uniqueDocTypes = Array.from(
        new Set(
          apiData?.flatMap((item: any) =>
            item?.documents?.currentTotal?.map((doc: any) => doc?.docTypeName)
          )
        )
      );

      setDocumentColumns(uniqueDocTypes);
      setTableData(flattenedData);
    } catch (error) {
      setDocumentColumns([]);
      setTableData([]);
    }
  };

  const tableDataforFirstTime = async () => {
    try {
      const res = await axios.post(
        "api/moduleAdoptionReport/createAllModuleAdoptionReport"
      );
      window.location.reload();
    } catch (error) {}
  };

  const submitData = async (dataToSubmit: any) => {
    try {
      const res = await axios.post(
        "api/moduleAdoptionReport/createModuleAdoptionReport",
        dataToSubmit
      );
    } catch (error) {}
  };

  const onChange = (date: any, dateString: string) => {
    setSelectedDate(dateString ? dateString : "Today");
    alltableData(
      dateString ? dateString : "Today",
      selectedBusinessTypes,
      selectedUnits
    );
  };

  const isEditing = (record: DataType) =>
    (record?.key === editingKey &&
      record?.locationId === userDetails.locationId &&
      isMr) ||
    (record?.key === editingKey && isOrgAdmin);

  const edit = (record: DataType) => {
    setEditingKey(record?.key);
    setEditingData(record);

    setSelectedLocationId(record?.locationId);
  };

  const save = async () => {
    try {
      const dataToSubmit = {
        organizationId: orgId,
        locationId: editingData?.locationId,
        spoc: editingData?.spoc,
        documents: {
          estimatedTotal: editingData?.doc_estimatedTotal,

          currentTotal: api.flatMap((item: any) => {
            if (item?.locationId === selectedLocationId) {
              return item?.documents?.currentTotal?.map((doc: any) => ({
                docTypeId: doc?.docTypeId,
                count: doc?.count,
              }));
            }

            return [];
          }),
        },
        hira: {
          estimatedTotal: editingData?.hira_estimatedTotal,
          currentTotal: editingData?.hira_currentTotal,
        },
        aspImp: {
          estimatedTotal: editingData?.aspImp_estimatedTotal,
          currentTotal: editingData?.aspImp_currentTotal,
        },
        objAndKpi: {
          totalDepartments: editingData?.objAndKpi_totalDepartments,
          noOfDeptWithObjective: editingData?.objAndKpi_noOfDeptWithObjective,
          totalObjectives: editingData?.objAndKpi_totalObjectives,
          totalKpis: editingData?.objAndKpi_totalKpis,
        },
      };

      await submitData(dataToSubmit);
      setEditingKey(null);
      alltableData("Today", selectedBusinessTypes, selectedUnits);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleInputChange = (value: number | string | null, column: string) => {
    setEditingData((prev: any) => ({
      ...prev,
      [column]: value,
    }));
  };

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const day = yesterday.getDate();
  const month = yesterday.getMonth() + 1; // January is 0, so we need to add 1
  const year = yesterday.getFullYear();

  // Formatting date as MM/DD/YYYY
  const formattedDate = `${day}-${month}-${year}`;

  // filters
  const [businessTyepe, setBusinessType] = useState("");
  const handleChangeBusinessType = (value: string) => {
    setBusinessType(value);
  };

  const [unit, setUnit] = useState([]);
  const handleChangeUnit = (value: any) => {
    setUnit(value);
  };

  const options: SelectProps["options"] = [];

  for (let i = 10; i < 36; i++) {
    options.push({
      label: i.toString(36) + i,
      value: i.toString(36) + i,
    });
  }

  const handleBusinessTypeChange = (value: any, details: any) => {
    if (value.includes("All") && value.at(-1) !== "All" && value.length > 1) {
      setSelectedBusinessTypes(
        details
          .filter((item: any) => item.id !== "All")
          .map((item: any) => ({
            id: item.id,
            name: item.value,
          }))
      );
    } else if (value.length === 0 || value.includes("All")) {
      setSelectedBusinessTypes([
        {
          id: "All",
          name: "All",
        },
      ]);
    } else {
      setSelectedBusinessTypes(
        details.map((item: any) => ({
          id: item.id,
          name: item.value,
        }))
      );
    }
  };

  const handleUnitsChange = (value: any, details: any) => {
    if (value.includes("All") && value.at(-1) !== "All" && value.length > 1) {
      setSelectedUnits(
        details
          .filter((item: any) => item.id !== "All")
          .map((item: any) => ({
            id: item.id,
            locationName: item.value,
          }))
      );
    } else if (value.length === 0 || value.includes("All")) {
      setSelectedUnits([
        {
          id: "All",
          locationName: "All",
        },
      ]);
    } else {
      setSelectedUnits(
        details.map((item: any) => ({
          id: item.id,
          locationName: item.value,
        }))
      );
    }
  };

  useEffect(() => {
    try {
      const res = axios
        .get(
          `api/moduleAdoptionReport/getLocationsByBusinessType?businessType=${selectedBusinessTypes.map(
            (item: any) => item.id
          )}`
        )
        .then((res) => {
          const defaultLocation = [{ id: "All", locationName: "All" }];
          setLocationOptions(defaultLocation.concat(res.data));
          setSelectedUnits([{ id: "All", locationName: "All" }]);
        });
    } catch (error) {
      setLocationOptions([
        {
          id: "All",
          locationName: "All",
        },
      ]);
      setSelectedUnits([{ id: "All", locationName: "All" }]);
    }
  }, [selectedBusinessTypes]);

  const exportReport = (tableId: any) => {
    const table = document.getElementById(tableId);
    const worksheet = XLSX.utils.table_to_sheet(table);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBinaryString = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });
    const blob = new Blob([s2ab(excelBinaryString)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "Report.xlsx");
  };

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  return (
    <div style={{ width: "99%" }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          // justifyContent: "space-between",
          padding: "0px 20px",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* <Select
          style={{ width: 200 }}
          onChange={handleChangeBusinessType}
          placeholder="Select Business Type"
          options={[
            { value: "upstream", label: "Upstream" },
            { value: "downstream", label: "Downstream" },
          ]}
          className={classes.Select}
        /> */}
        {/* <Select
          mode="multiple"
          allowClear
          style={{ width: "200px" }}
          placeholder="Select Unit"
          onChange={handleChangeUnit}
          options={options}
          className={classes.Select}
        /> */}
        <DatePicker
          format="DD-MM-YYYY"
          onChange={onChange}
          placeholder={formattedDate}
          className={classes.datePicker}
        />
        <Button
          onClick={tableDataforFirstTime}
          icon={<MdOutlineSync />}
        ></Button>
        <span>Business Type: </span>
        <Select
          mode="multiple"
          allowClear
          style={{ width: "200px" }}
          placeholder="Please select Business Type"
          //defaultValue={["All"]}
          value={selectedBusinessTypes.map((item: any) => item.name)}
          onChange={handleBusinessTypeChange}
          options={businessTypeOptions.map((item: any) => ({
            id: item.id,
            value: item.name,
          }))}
        />
        <span>Units: </span>
        <Select
          mode="multiple"
          allowClear
          style={{ width: "200px" }}
          placeholder="Please select Units"
          //defaultValue={["All"]}
          value={selectedUnits.map((item: any) => item.locationName)}
          onChange={handleUnitsChange}
          options={locationOptions.map((item: any) => ({
            id: item.id,
            value: item.locationName,
          }))}
        />
        <Button
          type="primary"
          onClick={() => {
            alltableData(
              selectedDate ? selectedDate : "Today",
              selectedBusinessTypes,
              selectedUnits
            );
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
        <Tooltip title="Export Report">
          <IconButton
            onClick={() => exportReport("report")}
            style={{ padding: "10px", color: "green" }}
          >
            <AiOutlineFileExcel width={20} height={20} />
          </IconButton>
        </Tooltip>
      </div>

      <div
        style={{
          width: "100%",
          maxHeight: "60vh",
          overflow: "auto",
          paddingRight: "5px",
          margin: "10px 0px 0px 5px",
          // marginRight: "10px",
        }}
      >
        <table id="report">
          <thead style={{ position: "sticky", top: "0px", zIndex: 1 }}>
            <th
              colSpan={5}
              style={{
                position: "sticky",
                left: -6.5,
                zIndex: 1,
                backgroundColor: "#D9EAD3",
              }}
            ></th>
            <th
              colSpan={documentColumns.length + 3}
              className={classes.headerSetForDocs}
            >
              Document
            </th>
            <th colSpan={3} className={classes.headerSetForHira}>
              HIRA
            </th>
            <th colSpan={3} className={classes.headerSetForAspct}>
              Aspect Impact
            </th>
            <th colSpan={5} className={classes.headerSetForKpi}>
              Objective & KPI
            </th>
            <th colSpan={4} className={classes.headerSetForAudit}>
              Audit Management
            </th>
            <th colSpan={1} className={classes.headerSetForCip}>
              CIP
            </th>
            <th colSpan={1} className={classes.headerSetForCapa}>
              CAPA
            </th>
            <th colSpan={3} className={classes.headerSetForMrm}>
              MRM
            </th>
            <th colSpan={1} className={classes.headerSet1}></th>
          </thead>
          <thead
            style={{
              position: "sticky",
              top: "25px",
              zIndex: 1,
            }}
          >
            <tr>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetFixed1}
              >
                Sl no
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetFixed2}
              >
                Unit
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetFixed3}
              >
                SPOC
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetFixed4}
              >
                IMS Coordinator
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetFixed5}
              >
                No of Users
              </th>
              {documentColumns.map((docType) => (
                <th
                  key={docType}
                  style={{ padding: "5px 5px" }}
                  className={classes.headerSetForDocs}
                >
                  {docType}
                </th>
              ))}
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForDocs}
              >
                Total docs in HIIMS
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForDocs}
              >
                Approx Num of Total Docs
              </th>

              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForDocs}
              >
                % Uploads
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForHira}
              >
                Approx Num of HIRA's
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForHira}
              >
                No of HIRA's uploaded
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForHira}
              >
                % Upload
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForAspct}
              >
                Approx Num of Aspect Impact
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForAspct}
              >
                No of ASP-IMP uploaded
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForAspct}
              >
                % Upload
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForKpi}
              >
                No of depts
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForKpi}
              >
                No of depts who have uploaded Objectives
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForKpi}
              >
                Total number of objectives entered
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForKpi}
              >
                % Upload
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForKpi}
              >
                No of KPI Entry
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForAudit}
              >
                No of Audits Planned
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForAudit}
              >
                No of Audits Scheduled
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForAudit}
              >
                No of Audit Reports
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForAudit}
              >
                No of Findings
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForCip}
              >
                No of CIP's Registered
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForCapa}
              >
                No of CAPA
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForMrm}
              >
                No of MRM Plans
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForMrm}
              >
                No of MRM Schedules
              </th>
              <th
                style={{ padding: "5px 5px" }}
                className={classes.headerSetForMrm}
              >
                No of MOM
              </th>
              <th style={{ padding: "5px 5px" }} className={classes.headerSet1}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            style={{
              textAlign: "center",
            }}
          >
            {tableData?.map((record) => {
              const editable = isEditing(record);
              return (
                <tr
                  key={record?.key}
                  style={{
                    border: "1px solid black",
                  }}
                >
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "white",
                      borderBottom: "1px solid #cccccc",
                    }}
                  >
                    {record?.slno}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      paddingLeft: "5px",
                      position: "sticky",
                      left: 30,
                      backgroundColor: "white",
                      borderBottom: "1px solid #cccccc",
                    }}
                  >
                    {record?.locationName}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      paddingLeft: "5px",
                      position: "sticky",
                      left: 180,
                      backgroundColor: "white",
                      borderBottom: "1px solid #cccccc",
                    }}
                  >
                    {editable ? (
                      <Input
                        style={{ width: "100%" }}
                        value={editingData?.spoc}
                        onChange={(value: any) => {
                          handleInputChange(value.target.value, "spoc");
                        }}
                      />
                    ) : (
                      record?.spoc
                    )}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      paddingLeft: "5px",
                      position: "sticky",
                      left: 280,

                      backgroundColor: "white",
                      borderBottom: "1px solid #cccccc",
                    }}
                  >
                    {record?.imsc}
                  </td>
                  <td
                    style={{
                      position: "sticky",
                      left: 380,

                      backgroundColor: "white",
                      borderBottom: "1px solid #cccccc",
                    }}
                  >
                    {record?.totalUsers}
                  </td>
                  {documentColumns?.map((docType) => (
                    <td key={docType} className={classes.td}>
                      {record[docType]}{" "}
                    </td>
                  ))}
                  <td className={classes.td}>{record?.total}</td>
                  <td className={classes.td}>
                    {editable ? (
                      <InputNumber
                        style={{ width: "100%" }}
                        value={editingData?.doc_estimatedTotal}
                        onChange={(value) => {
                          handleInputChange(value, "doc_estimatedTotal");
                        }}
                      />
                    ) : (
                      record?.doc_estimatedTotal
                    )}
                  </td>

                  <td className={classes.td}>{record?.uploads}</td>
                  <td className={classes.td}>
                    {editable ? (
                      <InputNumber
                        style={{ width: "100%" }}
                        value={editingData?.hira_estimatedTotal}
                        onChange={(value) =>
                          handleInputChange(
                            value,

                            "hira_estimatedTotal"
                          )
                        }
                      />
                    ) : (
                      record?.hira_estimatedTotal
                    )}
                  </td>
                  <td className={classes.td}>{record?.hira_currentTotal}</td>
                  <td className={classes.td}>{record?.hira_totalUploaded}</td>
                  <td className={classes.td}>
                    {editable ? (
                      <InputNumber
                        style={{ width: "100%" }}
                        value={editingData?.aspImp_estimatedTotal}
                        onChange={(value) =>
                          handleInputChange(
                            value,

                            "aspImp_estimatedTotal"
                          )
                        }
                      />
                    ) : (
                      record?.aspImp_estimatedTotal
                    )}
                  </td>
                  <td className={classes.td}> {record?.aspImp_currentTotal}</td>
                  <td className={classes.td}>{record?.aspImp_totalUploaded}</td>
                  <td className={classes.td}>
                    {record?.objAndKpi_totalDepartments}
                  </td>
                  <td className={classes.td}>
                    {record?.objAndKpi_noOfDeptWithObjective}
                  </td>
                  <td className={classes.td}>
                    {record?.objAndKpi_totalObjectives}
                  </td>
                  <td className={classes.td}>
                    {record?.objAndKpi_totalUploaded}
                  </td>
                  <td className={classes.td}>{record?.objAndKpi_totalKpis}</td>
                  <td className={classes.td}>
                    {record?.audit_totalAuditPlans || 0}
                  </td>
                  <td className={classes.td}>
                    {record?.audit_totalAuditSchedules || 0}
                  </td>
                  <td className={classes.td}>
                    {record?.audit_totalAuditReports || 0}
                  </td>
                  <td className={classes.td}>
                    {record?.audit_totalAuditFindings || 0}
                  </td>
                  <td className={classes.td}>{record?.cip_totalCip || 0}</td>
                  <td className={classes.td}>{record?.capa_totalCapa || 0}</td>
                  <td className={classes.td}>
                    {record?.mrm_totalMrmPlans || 0}
                  </td>
                  <td className={classes.td}>
                    {record?.mrm_totalMrmSchedule || 0}
                  </td>
                  <td className={classes.td}>{record?.mrm_totalMom || 0}</td>
                  <td className={classes.td}>
                    {editable ? (
                      <Button
                        disabled={
                          !(
                            (record?.locationId === userDetails.locationId &&
                              isMr) ||
                            isOrgAdmin
                          )
                        }
                        onClick={save}
                        icon={<MdOutlineCheckCircle />}
                      ></Button>
                    ) : (
                      <Button
                        disabled={
                          !(
                            (record?.locationId === userDetails.locationId &&
                              isMr) ||
                            isOrgAdmin
                          )
                        }
                        onClick={() => edit(record)}
                        icon={<MdOutlineEdit />}
                      ></Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "15px" }}>
        <ConsolidatedTable api={api} />
      </div>
    </div>
  );
};

export default InformationTable;
