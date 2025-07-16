import {
  Button,
  Input,
  Select,
  Table,
  Tooltip,
  DatePicker,
  Modal,
  Dropdown,
  Menu,
  Checkbox,
  Divider,
  Switch,
} from "antd";
import axios from "apis/axios.global";
import React, { useEffect, useState } from "react";
import styles from "../style";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import printJS from "print-js";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Typography,
} from "@material-ui/core";
import { MdCached } from "react-icons/md";
import { MdFilterList } from "react-icons/md";
import { MdExpandMore } from "react-icons/md";

import { FaRegChartBar, FaRegFilePdf } from "react-icons/fa";
import { AiOutlineFileDone } from "react-icons/ai";

import { MdClose } from "react-icons/md";
import "../Dashboard.css";
// type props = {
//   filterIds?: any;
//   selectedId?: any;
//   numericFunction?: any;
//   sheetValue: any;
// };

const { RangePicker } = DatePicker;

const DashboardFilters = () =>
  //   {}:
  //   filterIds,
  // selectedId,
  // numericFunction,
  // sheetValue,
  // props
  {
    const classes = styles();
    const { Option } = Select;
    const [filterOptions, setFilterOptions] = useState<any[]>([]);
    const [filterPdf, setFilterPdf] = useState<any[]>([]);
    const [selectedOptionIds, setSelectedOptionIds] = useState<any[]>([]);
    const [tableHeader, setTableHeader] = useState<any[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<{
      [key: string]: string;
    }>({});
    const [newDataSource, setNewDataSource] = useState<any[]>([]);
    const [tempColumn, setTempColumn] = useState<any>(null);
    const [formHeaderIds, setFormHeaderIds] = useState<any[]>([]);
    const [tableHeaderIds, setTableHeaderIds] = useState<any[]>([]);
    const [formHeaderOptions, setFormHeaderOptions] = useState<any[]>([]);
    const [tableHeaderOptions, setTableHeaderOptions] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<any>([]);
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);
    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [stackedBarChartData, setStackedBarChartData] = useState<any[]>([]);
    const [speedometerChartData, setSpeedometerChartData] = useState<any[]>([]);
    const [pdfData, setPdfData] = useState<any[]>([]);
    const [formLayout, setFormLayout] = useState<any>("");
    const [chartWidth, setChartWidth] = useState<number>(
      window.innerWidth * 0.45
    ); // Adjust for padding
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [sheetValue, setSheetValue] = useState<any>();
    const [templateList, setTemplateList] = useState<any[]>([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [filterIds, setFilterIds] = useState<string[]>([]);
    const [columnIds, setColumnIds] = useState<string[]>([]);
    const [numericFunction, setNumericFunction] = useState<any>([]);
    const [buttonValue, setButtonValue] = useState("formHeader");
    const [dataSource, setDataSource] = useState<any[]>([]);
    const [activeActionButton, setActiveActionButton] = useState<any>("");
    const [chartsData, setChartsData] = useState<
      Record<
        string,
        {
          line: any[];
          bar: any[];
          speedometer: any[];
        }
      >
    >({});

    const speedometerOptions = (
      title: string,
      specification: number,
      actual: number
    ) => ({
      chart: {
        type: "gauge",
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false,
      },
      title: {
        text: title,
      },
      pane: {
        startAngle: -150,
        endAngle: 150,
        background: [
          {
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, "#FFF"],
                [1, "#333"],
              ],
            },
            borderWidth: 0,
            outerRadius: "109%",
          },
          {
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, "#333"],
                [1, "#FFF"],
              ],
            },
            borderWidth: 1,
            outerRadius: "107%",
          },
          {},
          {
            backgroundColor: "#DDD",
            borderWidth: 0,
            outerRadius: "105%",
            innerRadius: "103%",
          },
        ],
      },
      yAxis: {
        min: 0,
        max: 100,
        minorTickInterval: "auto",
        minorTickWidth: 1,
        minorTickLength: 10,
        minorTickPosition: "inside",
        minorTickColor: "#666",
        tickPixelInterval: 30,
        tickWidth: 2,
        tickPosition: "inside",
        tickLength: 10,
        tickColor: "#666",
        labels: {
          step: 2,
          rotation: "auto",
        },
        title: {
          text: "Percentage",
        },
        plotBands: [
          {
            from: 0,
            to: 60,
            color: "#DF5353", // red
          },
          {
            from: 60,
            to: 80,
            color: "#DDDF0D", // yellow
          },
          {
            from: 80,
            to: 100,
            color: "#55BF3B", // green
          },
        ],
      },
      series: [
        {
          name: "Actual",
          data: [Math.min((actual / specification) * 100, 100)], // Calculate percentage
          tooltip: {
            valueSuffix: "%",
          },
        },
      ],
    });

    // console.log("filterOptions ", filterOptions);
    // console.log("tempColumn ", tempColumn);
    // console.log("formHeaderIds ", formHeaderIds);
    // console.log("tableHeaderIds ", tableHeaderIds);
    // console.log("formHeaderOptions ", formHeaderOptions);
    // console.log("tableHeaderOptions ", tableHeaderOptions);
    console.log("newDataSource ", chartsData);
    // console.log("speedometerChartData ", speedometerChartData);
    // to store only the ids to the api

    useEffect(() => {
      setSelectedOptionIds(Object.values(selectedOptions));
    }, [selectedOptions]);

    useEffect(() => {
      setFormHeaderIds(Object.values(formHeaderOptions));
    }, [formHeaderOptions]);

    useEffect(() => {
      setTableHeaderIds(Object.values(tableHeaderOptions));
    }, [tableHeaderOptions]);

    useEffect(() => {
      const handleResize = () => setChartWidth(window.innerWidth * 0.45);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
      getTemplates();
    }, []);

    useEffect(() => {
      if (selectedId) {
        getTableData();
      }
    }, [selectedId]);

    const getTableData = async () => {
      const result = await axios.get(
        `/api/auditchecksheet/getAuditChecksheetTemplateDetails/${selectedId}`
      );
      const tableFields = result.data.tableFields?.flatMap((ele: any) =>
        ele.tableHeader.map((item: any) => ({
          ...item,
          type: "tableHeader",
        }))
      );
      const formHeader = result.data.formHeader?.map((ele: any) => ({
        ...ele,
        type: "formHeader",
      }));
      const FilterListData = result.data.formHeader?.map((ele: any) => ele?.id);
      setFilterIds(FilterListData);
      // Combine tableHeader and formHeader into a single data source
      const combinedData = [
        ...tableFields.filter((item: any) => item.rowFieldType !== "value"),
        ...formHeader,
      ];
      setDataSource(combinedData);
    };

    const numericCalculations = (e: any, type: any) => {
      if (e.target.checked) {
        setNumericFunction((item: any) => {
          if (item) {
            return [...item, type];
          } else {
            return [type];
          }
        });
      } else {
        setNumericFunction(
          numericFunction.filter((item: any) => item !== type)
        );
      }
    };

    const getTemplates = async () => {
      try {
        const res = await axios.get(
          "api/auditchecksheet/getAuditChecksheetTemplates"
        );
        const data = res?.data?.map((ele: any) => ({
          label: ele?.title,
          value: ele?._id,
        }));
        setTemplateList(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    const handleFilterSwitchChange = (checked: boolean, id: string) => {
      setFilterIds((prev) =>
        checked ? [...prev, id] : prev.filter((item) => item !== id)
      );
    };
    console.log("FilterIds", filterIds);

    const handleColumnSwitchChange = (checked: boolean, id: string) => {
      setColumnIds((prev) =>
        checked ? [...prev, id] : prev.filter((item) => item !== id)
      );
    };

    //to call api for filterd data or for a table
    useEffect(() => {
      if (filterIds.length > 0 && selectedId) {
        getFilterData();
      }
      if (filterIds.length === 0 && numericFunction.length === 0) {
        setFilterOptions([]);
        setFormHeaderIds([]);
        setTableHeaderIds([]);
        setFormHeaderOptions([]);
        setTableHeaderOptions([]);
        setNewDataSource([]);
      }
    }, [filterIds, numericFunction]);

    //to get the data for the filters
    const getFilterData = async () => {
      const result = await axios.get(
        `api/auditchecksheet/getAuditChecksheetReportFilterOptions?templateId=${selectedId}&headerIds=${filterIds}&numericFunction=${numericFunction}`
      );
      setFilterOptions(result.data);
      const data = result.data?.map((ele: any) => ({
        id: ele?.id,
        headerType: ele?.headerType,
        colName: ele?.colName,
        SelectedValues: {},
      }));
      // setFilterPdf(data);
    };

    // const onSearch = (value: string) => {
    //   console.log("search:", value);
    // };

    // storeing seleced ids from the filters in the form of object
    const handleSelectChange = (
      filterId: string,
      value: string,
      headerType: string,
      values: any
    ) => {
      if (headerType === "formHeader") {
        setFormHeaderOptions((prevSelectedOptions: any) => ({
          ...prevSelectedOptions,
          [filterId]: value,
        }));
      }
      if (headerType === "tableHeader") {
        setTableHeaderOptions((prevSelectedOptions: any) => ({
          ...prevSelectedOptions,
          [filterId]: value,
        }));
      }
      const updateId = filterPdf?.map((ele: any) => {
        if (ele?.id === filterId) {
          return {
            ...ele,
            SelectedValues: values,
          };
        }
        return ele;
      });
      // setFilterPdf(updateId);
    };

    console.log("filterPdf", filterPdf);
    // to get the data for the table or list from the filters
    const updateFiltersData = async () => {
      setActiveActionButton("Run");
      const result = await axios.get(
        `api/auditchecksheet/getDashboardReport?dateRange=${selectedDate}&templateId=${selectedId}&formHeaderIds=${formHeaderIds}&tableHeaderIds=${tableHeaderIds}&numericFunction=${numericFunction}`
      );
      setTableHeader(result?.data?.tableHeader);
      setNewDataSource(result?.data?.tableContentValues);
      const dataPfd = result?.data?.tableContentValues?.map((ele: any) => {
        const data = ele?.cells?.map((cell: any) => ({
          columnName: cell?.columnName,
          value: cell?.value,
          toleranceType: cell?.toleranceType,
          toleranceValue: cell?.toleranceValue,
        }));
        return data;
      });
      setPdfData(dataPfd);
      setFormLayout(result?.data?.formHeaderTitle);
      setFilterPdf(result?.data?.formHeader);
    };

    let isLastColumn: any;

    // const columns = tableHeader?.map((attr: any, index: any) => ({
    //   title: () => (
    //     <>
    //       <div
    //         style={{
    //           display: "flex",
    //           alignItems: "center",
    //           justifyContent: "space-between",
    //         }}
    //       >
    //         <Input
    //           type="text"
    //           value={
    //             tempColumn && tempColumn.id === attr.id
    //               ? tempColumn.attributeName
    //               : attr.attributeName
    //           }
    //           onChange={(e) => {
    //             e.preventDefault();
    //             if (tempColumn && tempColumn.id === attr.id) {
    //               setTempColumn({
    //                 ...tempColumn,
    //                 attributeName: e.target.value,
    //               });
    //             } else {
    //               setTempColumn({ id: attr.id, attributeName: e.target.value });
    //             }
    //           }}
    //           placeholder="Enter column name"
    //           style={{
    //             marginRight: "8px",
    //             width:
    //               (numericFunction &&
    //                 numericFunction?.includes("Deviation") &&
    //                 index === tableHeader?.length - 1) ||
    //               (numericFunction &&
    //                 numericFunction?.includes("Yield") &&
    //                 index === tableHeader?.length - 1)
    //                 ? "80%"
    //                 : "100%",
    //             color: "black",
    //           }}
    //           disabled={true}
    //         />
    //         {numericFunction &&
    //           numericFunction?.includes("Deviation") &&
    //           index === tableHeader?.length - 1 && (
    //             <Input
    //               value={"Deviation"}
    //               style={{ color: "black", width: "100px" }}
    //               disabled
    //             />
    //           )}
    //         {numericFunction &&
    //           numericFunction?.includes("Yield") &&
    //           index === tableHeader?.length - 1 && (
    //             <Input
    //               value={"Yield"}
    //               style={{ color: "black", width: "100px" }}
    //               disabled
    //             />
    //           )}
    //         {/* <div
    //         style={{
    //           display: "flex",
    //           alignItems: "center",
    //           gap: "10px",
    //         }}
    //       >
    //         {attr.rowFieldType !== "None" ? (
    //           <div
    //             style={{
    //               width: "25px",
    //               height: "25px",
    //               border: "2px solid black",
    //               borderRadius: "50%",
    //               display: "flex",
    //               justifyContent: "center",
    //               alignItems: "center",
    //               fontSize: "12px",
    //               backgroundColor: "#a7f1a7",
    //               fontWeight: "bold",
    //             }}
    //           >
    //             {attr.rowFieldType?.charAt(0).toUpperCase()}
    //           </div>
    //         ) : (
    //           ""
    //         )}
    //       </div> */}
    //       </div>
    //     </>
    //   ),
    //   dataIndex: attr.attributeName.toLowerCase().replace(/\s+/g, "_"),
    //   render: (text: any, record: any, rowIndex: any) => {
    //     const columnName = attr.attributeName;
    //     const cell = record?.cells?.find(
    //       (c: any) => c.columnName === columnName
    //     );
    //     const specificationCell = record.cells.find(
    //       (c: any) => c.columnType === "specification"
    //     );
    //     const dataType = specificationCell ? specificationCell.datatype : "";

    //     // Calculate deviation if applicable
    //     let deviation: any;
    //     if (dataType === "numberRange") {
    //       if (cell && cell.columnType === "value" && specificationCell) {
    //         if (
    //           cell.value >= specificationCell.minValue &&
    //           cell.value <= specificationCell.maxValue
    //         ) {
    //           deviation = "In Range";
    //         } else if (cell.value < specificationCell.minValue) {
    //           deviation =
    //             "-" +
    //             (
    //               Number(cell.value) - Number(specificationCell.minValue)
    //             ).toFixed(2);
    //         } else if (cell.value > specificationCell.maxValue) {
    //           deviation =
    //             "+" +
    //             (
    //               Number(cell.value) - Number(specificationCell.maxValue)
    //             ).toFixed(2);
    //         }
    //       }
    //     } else {
    //       deviation =
    //         cell && cell.columnType === "value" && specificationCell
    //           ? (Number(cell.value) - Number(specificationCell.value)).toFixed(
    //               2
    //             )
    //           : null;
    //     }

    //     // Calculate Yield if applicable
    //     const yieldValue: any =
    //       cell && cell.columnType === "value" && specificationCell
    //         ? (
    //             (Number(cell.value) / Number(specificationCell.value)) *
    //             100
    //           ).toFixed(2)
    //         : null;

    //     return (
    //       <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    //         {cell && cell.columnType === "value" ? (
    //           (() => {
    //             // if (dataType === "numberRange") {
    //             //   return (
    //             //     <div style={{ display: "flex", gap: "10px" }}>
    //             //       <Input
    //             //         value={cell.min}
    //             //         type="number"
    //             //         style={{ width: 90, color: "black" }}
    //             //         placeholder="Min"
    //             //         disabled={true}
    //             //       />
    //             //       <span>-</span>
    //             //       <Input
    //             //         value={cell.max}
    //             //         type="number"
    //             //         style={{ width: 90, color: "black" }}
    //             //         placeholder="Max"
    //             //         disabled={true}
    //             //       />
    //             //     </div>
    //             //   );
    //             // } else
    //             if (dataType === "currentDate") {
    //               return (
    //                 <Input
    //                   value={dayjs(new Date()).format("DD/MM/YYYY")}
    //                   style={{ width: 200, color: "black" }}
    //                   placeholder="Enter text"
    //                   disabled={true}
    //                 />
    //               );
    //             } else {
    //               return (
    //                 <div
    //                   style={{
    //                     display: "flex",
    //                     alignItems: "center",
    //                     gap: "10px",
    //                     width: "100%",
    //                   }}
    //                 >
    //                   <Input
    //                     value={cell.value}
    //                     style={{
    //                       color: "black",
    //                       width:
    //                         (numericFunction &&
    //                           numericFunction?.includes("Deviation") &&
    //                           index === tableHeader?.length - 1) ||
    //                         (numericFunction &&
    //                           numericFunction?.includes("Yield") &&
    //                           index === tableHeader?.length - 1)
    //                           ? "80%"
    //                           : "100%",
    //                     }}
    //                     placeholder="Enter text"
    //                     disabled={true}
    //                   />
    //                   {numericFunction &&
    //                     numericFunction?.includes("Deviation") && (
    //                       <Input
    //                         value={deviation}
    //                         readOnly
    //                         style={{
    //                           width: "10%",
    //                           background: "#f5f5f5",
    //                           borderColor: "#ccc",
    //                           textAlign: "center",
    //                         }}
    //                         placeholder="Deviation"
    //                       />
    //                     )}
    //                   {numericFunction &&
    //                     numericFunction?.includes("Yield") && (
    //                       <Input
    //                         value={yieldValue}
    //                         readOnly
    //                         style={{
    //                           width: "10%",
    //                           background: "#f5f5f5",
    //                           borderColor: "#ccc",
    //                           textAlign: "center",
    //                         }}
    //                         placeholder="Yield"
    //                       />
    //                     )}
    //                 </div>
    //               );
    //             }
    //           })()
    //         ) : cell &&
    //           cell?.columnType === "specification" &&
    //           cell?.datatype === "numberRange" ? (
    //           <>
    //             <Input
    //               type="number"
    //               value={cell?.minValue || ""}
    //               disabled={cell && cell.columnType !== "value"}
    //               style={{
    //                 color: "black",
    //               }}
    //             />
    //             -
    //             <Input
    //               type="number"
    //               value={cell?.maxValue || ""}
    //               disabled={cell && cell.columnType !== "value"}
    //               style={{
    //                 color: "black",
    //               }}
    //             />
    //           </>
    //         ) : (
    //           <Input
    //             value={cell ? cell.value : ""}
    //             disabled={cell && cell?.columnType !== "value"}
    //             style={{
    //               color: "black",
    //             }}
    //             suffix={
    //               specificationCell &&
    //               (specificationCell.datatype === "number" ||
    //                 specificationCell.datatype === "numberRange") &&
    //               cell?.columnType !== "None" &&
    //               cell?.columnType !== "label" && (
    //                 <span style={{ fontSize: "14px" }}>
    //                   {specificationCell.dataOptions}{" "}
    //                   {specificationCell.toleranceType === "tolerance" &&
    //                     `(-${specificationCell?.toleranceValue?.min}/+${specificationCell?.toleranceValue?.max})`}
    //                 </span>
    //               )
    //             }
    //           />
    //         )}
    //       </div>
    //     );
    //   },
    // }));

    const generateColumns: any = (tableGroup: any[]) => {
      return tableGroup.map((attr: any, index: number) => ({
        title: () => (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Input
                type="text"
                value={attr.attributeName}
                placeholder="Enter column name"
                style={{
                  marginRight: "8px",
                  width:
                    (numericFunction &&
                      numericFunction?.includes("Deviation") &&
                      index === tableHeader?.length - 1) ||
                    (numericFunction &&
                      numericFunction?.includes("Yield") &&
                      index === tableHeader?.length - 1)
                      ? "80%"
                      : "100%",
                  color: "black",
                }}
                disabled={true}
              />
              {numericFunction &&
                numericFunction?.includes("Deviation") &&
                index === tableHeader?.length - 1 && (
                  <Input
                    value={"Deviation"}
                    style={{ color: "black", width: "100px" }}
                    disabled
                  />
                )}
              {numericFunction &&
                numericFunction?.includes("Yield") &&
                index === tableHeader?.length - 1 && (
                  <Input
                    value={"Yield"}
                    style={{ color: "black", width: "100px" }}
                    disabled
                  />
                )}
              {/* <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {attr.rowFieldType !== "None" ? (
              <div
                style={{
                  width: "25px",
                  height: "25px",
                  border: "2px solid black",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "12px",
                  backgroundColor: "#a7f1a7",
                  fontWeight: "bold",
                }}
              >
                {attr.rowFieldType?.charAt(0).toUpperCase()}
              </div>
            ) : (
              ""
            )}
          </div> */}
            </div>
          </>
        ),
        dataIndex: attr.attributeName.toLowerCase().replace(/\s+/g, "_"),
        render: (text: any, record: any, rowIndex: any) => {
          const columnName = attr.attributeName;
          const cell = record?.cells?.find(
            (c: any) => c.columnName === columnName
          );
          const specificationCell = record.cells.find(
            (c: any) => c.columnType === "specification"
          );
          const dataType = specificationCell ? specificationCell.datatype : "";

          // Calculate deviation if applicable
          let deviation: any;
          if (dataType === "numberRange") {
            if (cell && cell.columnType === "value" && specificationCell) {
              if (
                cell.value >= specificationCell.minValue &&
                cell.value <= specificationCell.maxValue
              ) {
                deviation = "In Range";
              } else if (cell.value < specificationCell.minValue) {
                deviation =
                  "-" +
                  (
                    Number(cell.value) - Number(specificationCell.minValue)
                  ).toFixed(2);
              } else if (cell.value > specificationCell.maxValue) {
                deviation =
                  "+" +
                  (
                    Number(cell.value) - Number(specificationCell.maxValue)
                  ).toFixed(2);
              }
            }
          } else {
            deviation =
              cell && cell.columnType === "value" && specificationCell
                ? (
                    Number(cell.value) - Number(specificationCell.value)
                  ).toFixed(2)
                : null;
          }

          // Calculate Yield if applicable
          const yieldValue: any =
            cell && cell.columnType === "value" && specificationCell
              ? (
                  (Number(cell.value) / Number(specificationCell.value)) *
                  100
                ).toFixed(2)
              : null;

          if (cell && cell.value)
            return (
              <div style={{ display: "flex", alignItems: "center" }}>
                {cell && cell.columnType === "value" ? (
                  (() => {
                    // if (dataType === "numberRange") {
                    //   return (
                    //     <div style={{ display: "flex", gap: "10px" }}>
                    //       <Input
                    //         value={cell.min}
                    //         type="number"
                    //         style={{ width: 90, color: "black" }}
                    //         placeholder="Min"
                    //         disabled={true}
                    //       />
                    //       <span>-</span>
                    //       <Input
                    //         value={cell.max}
                    //         type="number"
                    //         style={{ width: 90, color: "black" }}
                    //         placeholder="Max"
                    //         disabled={true}
                    //       />
                    //     </div>
                    //   );
                    // } else
                    if (dataType === "currentDate") {
                      return (
                        <Input
                          value={dayjs(new Date()).format("DD/MM/YYYY")}
                          style={{ width: 200, color: "black" }}
                          placeholder="Enter text"
                          disabled={true}
                        />
                      );
                    } else {
                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            width: "100%",
                          }}
                        >
                          <Input
                            value={cell.value}
                            style={{
                              color: "black",
                              width:
                                (numericFunction &&
                                  numericFunction?.includes("Deviation") &&
                                  index === tableHeader?.length - 1) ||
                                (numericFunction &&
                                  numericFunction?.includes("Yield") &&
                                  index === tableHeader?.length - 1)
                                  ? "80%"
                                  : "100%",
                            }}
                            placeholder="Enter text"
                            disabled={true}
                          />
                          {numericFunction &&
                            numericFunction?.includes("Deviation") && (
                              <Input
                                value={deviation}
                                readOnly
                                style={{
                                  width: "10%",
                                  background: "#f5f5f5",
                                  borderColor: "#ccc",
                                  textAlign: "center",
                                }}
                                placeholder="Deviation"
                              />
                            )}
                          {numericFunction &&
                            numericFunction?.includes("Yield") && (
                              <Input
                                value={yieldValue}
                                readOnly
                                style={{
                                  width: "10%",
                                  background: "#f5f5f5",
                                  borderColor: "#ccc",
                                  textAlign: "center",
                                }}
                                placeholder="Yield"
                              />
                            )}
                        </div>
                      );
                    }
                  })()
                ) : cell &&
                  cell?.columnType === "specification" &&
                  cell?.datatype === "numberRange" ? (
                  <>
                    <Input
                      type="number"
                      value={cell?.minValue || ""}
                      disabled={cell && cell.columnType !== "value"}
                      style={{
                        color: "black",
                      }}
                    />
                    -
                    <Input
                      type="number"
                      value={cell?.maxValue || ""}
                      disabled={cell && cell.columnType !== "value"}
                      style={{
                        color: "black",
                      }}
                    />
                  </>
                ) : (
                  cell && (
                    <Input
                      value={cell ? cell.value : ""}
                      disabled={cell && cell?.columnType !== "value"}
                      style={{
                        color: "black",
                      }}
                      suffix={
                        specificationCell &&
                        (specificationCell.datatype === "number" ||
                          specificationCell.datatype === "numberRange") &&
                        cell?.columnType !== "None" &&
                        cell?.columnType !== "label" && (
                          <span style={{ fontSize: "14px" }}>
                            {specificationCell.dataOptions}{" "}
                            {specificationCell.toleranceType === "tolerance" &&
                              `(-${specificationCell?.toleranceValue?.min}/+${specificationCell?.toleranceValue?.max})`}
                          </span>
                        )
                      }
                    />
                  )
                )}
              </div>
            );
        },
      }));
    };

    const columnsFilters = [
      {
        title: "Attribute Name",
        dataIndex: "attributeName",
        key: "attributeName",
        render: (text: any, record: any) => <span>{record.attributeName}</span>,
      },
      {
        title: "Show as filter",
        dataIndex: "showAsFilter",
        key: "showAsFilter",
        width: 100,
        render: (text: any, record: any) => (
          <Switch
            checked={filterIds.includes(record.id)}
            onChange={(checked) => handleFilterSwitchChange(checked, record.id)}
          />
        ),
      },
      {
        title: "Show as Column",
        dataIndex: "showAsColumn",
        key: "showAsColumn",
        width: 100,
        render: (text: any, record: any) => (
          <Switch
            checked={columnIds.includes(record.id)}
            onChange={(checked) => handleColumnSwitchChange(checked, record.id)}
          />
        ),
      },
    ];
    const processChartData = (data: any) => {
      const tablesData: Record<string, any> = {};

      // Group data by tableId
      data.forEach((entry: any) => {
        entry.cells.forEach((cell: any) => {
          const tableId = cell.tableId;
          if (!tablesData[tableId]) {
            tablesData[tableId] = {
              allValueColumns: new Set<string>(),
              chartData: [],
              stackedBarData: [],
              speedometerAggregates: {},
            };
          }

          // Collect value columns
          if (cell.columnType === "value") {
            tablesData[tableId].allValueColumns.add(cell.columnName);
          }
        });
      });

      // Process each table separately
      Object.keys(tablesData).forEach((tableId) => {
        const tableEntries = data.filter((entry: any) =>
          entry.cells.some((cell: any) => cell.tableId === tableId)
        );

        tableEntries.forEach((entry: any) => {
          const date = new Date(entry.date).toLocaleString();
          const lineRowData: any = { date };
          const stackedBarRowData: any = { date };
          const specifications: Record<string, number> = {};

          // Process specifications
          entry.cells.forEach((cell: any) => {
            if (
              cell.columnType === "specification" &&
              cell.tableId === tableId
            ) {
              specifications[cell.columnName] = Number(cell.value);
            }
          });

          // Process values
          entry.cells.forEach((cell: any) => {
            if (cell.tableId === tableId && cell.columnType === "value") {
              const numericValue = Number(cell.value);

              // Line chart data
              lineRowData[cell.columnName] = numericValue;

              // Stacked bar chart data
              stackedBarRowData[cell.columnName] = numericValue;

              // Speedometer calculations
              const specColumn = entry.cells.find(
                (c: any) =>
                  c.columnType === "specification" &&
                  c.tableHeaderId === cell.tableHeaderId
              );

              if (specColumn) {
                const specValue = Number(specColumn.value);
                if (
                  !tablesData[tableId].speedometerAggregates[cell.columnName]
                ) {
                  tablesData[tableId].speedometerAggregates[cell.columnName] = {
                    specification: specValue,
                    totalActual: 0,
                    count: 0,
                  };
                }
                tablesData[tableId].speedometerAggregates[
                  cell.columnName
                ].totalActual += numericValue;
                tablesData[tableId].speedometerAggregates[
                  cell.columnName
                ].count += 1;
              }
            }
          });

          // Add targets for stacked bar chart
          Object.entries(specifications).forEach(([colName, value]) => {
            stackedBarRowData[`${colName} (Target)`] = value;
          });

          // Initialize missing columns
          Array.from(tablesData[tableId].allValueColumns).forEach(
            (col: any) => {
              if (!(col in lineRowData)) lineRowData[col] = null;
              if (!(col in stackedBarRowData)) stackedBarRowData[col] = null;
            }
          );

          tablesData[tableId].chartData.push(lineRowData);
          tablesData[tableId].stackedBarData.push(stackedBarRowData);
        });
      });

      // Format final data structure
      const formattedData: Record<string, any> = {};
      Object.entries(tablesData).forEach(([tableId, tableData]) => {
        formattedData[tableId] = {
          line: tableData.chartData.map((item: any) => ({
            ...item,
            date: new Date(item.date).toLocaleDateString("en-GB"),
          })),
          bar: tableData.stackedBarData.map((item: any) => ({
            ...item,
            date: new Date(item.date).toLocaleDateString("en-GB"),
          })),
          speedometer: Object.entries(tableData.speedometerAggregates).map(
            ([title, data]: any) => ({
              title,
              specification: data.specification,
              actual: data.totalActual / data.count,
            })
          ),
        };
      });

      setChartsData(formattedData);
    };

    const handleGetReports = async () => {
      try {
        const logo =
          "https://processridge.in/wp-content/uploads/2024/07/header-logo.png";
        const tableHeaderStyle = "color: #003566;";
        const captionstyle = "font-weight:bold;text-align:left";
        const tableBg = "background-color: #D5F5E3;";
        const tableTitles =
          "color: #003566; font-size: 15px !important; font-weight: 900;";
        const tableTitlesName =
          "color: red; font-size: 15px !important; font-weight: 900;";
        const headers =
          "text-align: center; margin: auto; font-size: 22px; font-weight: 600; letter-spacing: 0.6px; color: #003566;";

        const tableRows = filterPdf
          .flat()
          ?.reduce((acc: string[], ele: any, index: number) => {
            const colIndex = index % 2;
            if (colIndex === 0) acc.push("<tr>");
            acc.push(`
            <td style="${tableTitles}">
              <b style="font-size: 15px !important;">${ele?.attributeName}</b>
            </td>
            <td>${ele?.value || ""}</td>
          `);
            if (index === filterPdf.length - 1 && filterPdf.length % 2 !== 0) {
              acc.push('<td colspan="2"></td>');
            }
            if (colIndex === 2 - 1 || index === filterPdf.length - 1) {
              acc.push("</tr>");
            }
            return acc;
          }, [])
          .join("");

        const consolidated = `<html>
        <head>
          <title>Check Sheet</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap" rel="stylesheet">
          <style>
            * {
              font-family: 'Poppins', sans-serif;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 20px;
            }
            td, th {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
              font-size: 15px !important;
            }
          </style>
        </head>
        <body>
          <div>
            <table>
              <tr>
                <td style="width: 100px;">
                  ${
                    logo
                      ? `<img src="${logo}" alt="ProcessRidge" width="100px" height="100px" />`
                      : ""
                  }
                </td>
                <td colspan="3" style="${headers}">
                  ProcessRidge Solutions Pvt. Ltd.<br />
                </td>
              </tr>
              <tr>
                <td colspan="1" style="${tableTitles}">
                  <b style="font-size: 15px !important;"> Check Sheet </b> 
                </td>
                <td style="${tableTitlesName}" colspan="3">${
          sheetValue?.label
        }</td>
              </tr>
                ${tableRows}
            </table>
  
            <table>
              <thead>
              <tr style="${tableBg}">
    ${tableHeader
      ?.map(
        (ele: any) => `
      <th style="${tableHeaderStyle}">
        ${
          tempColumn && tempColumn.id === ele.id
            ? tempColumn.attributeName
            : ele.attributeName
        }
      </th>
    `
      )
      .join("")}
  </tr>
              </thead>
            <tbody>
            ${pdfData
              .map((row: any[]) => {
                return `<tr>
                  ${tableHeader
                    .map((ele: any) => {
                      const cell = row.find(
                        (item: any) => item.columnName === ele.attributeName
                      );
                      const value = cell?.value || "-";
                      return `<td>${value}   ${
                        cell?.toleranceValue
                          ? `(-${cell?.toleranceValue?.min}/+${cell?.toleranceValue?.max})`
                          : ""
                      }</td>`;
                    })
                    .join("")}
                </tr>`;
              })
              .join("")}
            
</tbody>


            </table>
          </div>
        </body>
      </html>`;
        printJS({
          type: "raw-html",
          printable: consolidated,
        });
      } catch (err) {
        console.log(err);
      }
    };

    const handleTemplateChange = (e: any, value: any) => {
      setSelectedId(e);
      setSheetValue(value);
    };

    const filterOption: any = (
      input: string,
      option?: { label: string; value: string }
    ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

    const menu = (
      <Menu
        style={{ padding: "10px", backgroundColor: "#F7F7FF", width: "450px" }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {/* <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <label
              style={{
                fontSize: "16px",
                color: "#003059",
                fontWeight: "bold",
              }}
            >
              CS Template:
            </label>
            <Select
              style={{ width: 250 }}
              onChange={(e: any, value: any) => {
                handleTemplateChange(e, value);
              }}
              placeholder="Select Form"
              showSearch
              optionFilterProp="children"
              // onSearch={onSearch}
              filterOption={filterOption}
              options={templateList}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
            />
          </div>
          <Tooltip title="Reset Button">
            <Button
              type="text"
              style={{
                border: "1px solid red",
                height: "25px",
                width: "25px",
                display: "flex",
                alignItems: "center",
              }}
              icon={<MdCached style={{ color: "red" }} />}
              onClick={() => {
                setFilterIds([]);
                setColumnIds([]);
                setNumericFunction([]);
              }}
            />
          </Tooltip>
        </div> */}

          <div style={{ paddingTop: "5px" }}>
            <Checkbox
              checked={numericFunction.includes("Summation")}
              onChange={(e) => numericCalculations(e, "Summation")}
            >
              Summation
            </Checkbox>
            <Checkbox
              checked={numericFunction.includes("Mean")}
              onChange={(e) => numericCalculations(e, "Mean")}
            >
              Mean
            </Checkbox>
            <Checkbox
              checked={numericFunction.includes("Deviation")}
              onChange={(e) => numericCalculations(e, "Deviation")}
            >
              Deviation
            </Checkbox>
            <Checkbox
              checked={numericFunction.includes("Yield")}
              onChange={(e) => numericCalculations(e, "Yield")}
            >
              Yield
            </Checkbox>
          </div>
          <div style={{ display: "flex", gap: "15px", paddingTop: "15px" }}>
            <Button
              // icon={<SnippetsOutlined />}
              onClick={() => {
                setButtonValue("formHeader");
              }}
              className={
                buttonValue === "formHeader"
                  ? classes.buttonContainerActive
                  : classes.buttonContainer
              }
            >
              FormHeaders
            </Button>
            <Button
              // icon={<SnippetsOutlined />}
              onClick={() => {
                setButtonValue("tableHeader");
              }}
              className={
                buttonValue === "tableHeader"
                  ? classes.buttonContainerActive
                  : classes.buttonContainer
              }
            >
              TableHeaders
            </Button>
          </div>
          <Divider style={{ margin: "0px 0px", color: "#00224E" }} />
          <div className={classes.tableContainer}>
            <Table
              dataSource={
                selectedId
                  ? dataSource?.filter((ele: any) => ele?.type === buttonValue)
                  : []
              }
              columns={columnsFilters}
              rowKey="attributeName"
              pagination={false}
              scroll={
                dataSource && dataSource.length > 0
                  ? { x: "max-content", y: 250 }
                  : undefined
              }
            />
          </div>
        </div>
      </Menu>
    );

    const filterByUnselect = (item: any) => {
      const updated = filterIds?.filter((ele: any) => ele !== item.id);
      setFilterIds(updated);
    };

    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            // gap: "20px",
            paddingBottom: "8px",
            paddingTop: "10px",
            borderBottom: "1px dashed grey",
          }}
        >
          <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <label
                style={{
                  fontSize: "16px",
                  color: "#003059",
                  fontWeight: "bold",
                }}
              >
                CheckSheet Template:
              </label>
              <Select
                style={{ width: 250 }}
                onChange={(e: any, value: any) => {
                  handleTemplateChange(e, value);
                }}
                placeholder="Select Form"
                showSearch
                optionFilterProp="children"
                // onSearch={onSearch}
                filterOption={filterOption}
                options={templateList}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              />
            </div>
            <Tooltip title="Reset Button">
              <Button
                type="text"
                style={{
                  border: "1px solid red",
                  height: "25px",
                  width: "25px",
                  display: "flex",
                  alignItems: "center",
                }}
                icon={<MdCached style={{ color: "red" }} />}
                onClick={() => {
                  setFilterIds([]);
                  setColumnIds([]);
                  setNumericFunction([]);
                }}
              />
            </Tooltip>
          </div>
          <Tooltip title="Filters">
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              visible={menuVisible} // Control visibility
              onVisibleChange={(visible) => setMenuVisible(visible)}
            >
              <Button
                icon={<MdFilterList />}
                style={{ backgroundColor: "#2874A6", color: "#fff" }}
              ></Button>
            </Dropdown>
          </Tooltip>
        </div>
        <div
          style={{
            // display: "flex",
            // justifyContent: "space-between",
            paddingTop: "10px",
          }}
        >
          <div
            style={{
              // flex: 3,
              display: "flex",
              flexWrap: "wrap",
              width: "100%",
              gap: "20px",
              // padding: "20px 30px 0px 10px",
            }}
          >
            {/* {filterOptions.map((filter) => (
              <div
                key={filter.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  height: "30px",
                  padding: "10px 0px",
                }}
              >
                <label
                  style={{
                    fontSize: "14px",
                    color: "#003059",
                    fontWeight: "bold",
                    backgroundColor:"#e8f3f9"
                  }}
                >
                  {filter.colName} :
                </label>
                <Select
                  style={{
                    width: 230,
                    height: "30px",
                  }}
                  onChange={(e: any, value: any) =>
                    handleSelectChange(filter.id, e, filter.headerType, value)
                  }
                  showSearch
                  // onSearch={onSearch}
                  filterOption={(input: any, option: any) =>
                    option?.children
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  // onChange={(value) => handleSelectChange(value)}
                >
                  {filter.options.map((option: any) => (
                    <Option
                      key={option.id}
                      value={option.id}
                      label={option.name}
                    >
                      {option.name}
                    </Option>
                  ))}
                </Select>
              </div>
            ))} */}
            {filterOptions.map((filter) => (
              <div
                key={filter.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  // gap: "10px",
                  height: "30px",
                  padding: "10px 0px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#f8f9f9",
                    padding: "4px 4px",
                    height: "30px",
                    borderTopLeftRadius: "3px",
                    borderBottomLeftRadius: "3px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      color: "#003059",
                      fontWeight: "bold",
                    }}
                  >
                    {filter?.colName.charAt(0).toUpperCase() +
                      filter?.colName.slice(1).toLowerCase()}{" "}
                    :
                  </label>
                </div>
                <Select
                  style={{
                    width: 230,
                    height: "30px",
                  }}
                  dropdownStyle={{ borderRadius: "0px" }}
                  onChange={(e: any, value: any) =>
                    handleSelectChange(filter.id, e, filter.headerType, value)
                  }
                  className="filterSelector"
                  showSearch
                  // onSearch={onSearch}
                  filterOption={(input: any, option: any) =>
                    option?.children
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  // onChange={(value) => handleSelectChange(value)}
                >
                  {filter.options.map((option: any) => (
                    <Option
                      key={option.id}
                      value={option.id}
                      label={option.name}
                    >
                      {option.name}
                    </Option>
                  ))}
                </Select>
                <div
                  style={{
                    backgroundColor: "#f8f9f9",
                    height: "30px",
                    width: "25px",
                    display: "flex",
                    alignItems: "center",
                    borderTopRightRadius: "3px",
                    borderBottomRightRadius: "3px",
                  }}
                >
                  <IconButton
                    style={{ padding: "0px", margin: "0px" }}
                    onClick={() => {
                      filterByUnselect(filter);
                    }}
                  >
                    <MdClose style={{ color: "#fe7f7b" }} />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 20, width: "44%" }}>
          <div style={{ display: "flex", gap: "40px" }}>
            <RangePicker
              style={{ width: "100%" }}
              format="DD-MM-YYYY"
              onChange={(e: any, dateStrings: any) => {
                setSelectedDate(dateStrings);
              }}
            />
            <div
              style={
                {
                  // marginTop: "30px",
                  // width: "100%",
                  // paddingRight: "10px",
                  // display: "flex",
                  // justifyContent: "end",
                }
              }
            >
              <Button
                onClick={updateFiltersData}
                style={{
                  backgroundColor:
                    activeActionButton === "Run" ? "#003059" : "#fff",
                  color: activeActionButton === "Run" ? "white" : "#000",
                }}
                icon={<AiOutlineFileDone />}
              >
                Run Report
              </Button>
            </div>
            <Button
              onClick={() => {
                setIsChartModalOpen(true);
                processChartData(newDataSource);
                setActiveActionButton("Chart");
              }}
              style={{
                backgroundColor:
                  activeActionButton === "Chart" ? "#003059" : "#fff",
                color: activeActionButton === "Chart" ? "#fff" : "#000",
              }}
              icon={<FaRegChartBar />}
            >
              Chart
            </Button>
            <Button
              icon={<FaRegFilePdf color="red" />}
              onClick={() => {
                handleGetReports();
                setActiveActionButton("Pdf");
              }}
              style={{
                backgroundColor:
                  activeActionButton === "Pdf" ? "#003059" : "#fff",
                color: activeActionButton === "Pdf" ? "#fff" : "#000",
              }}
            >
              Export
            </Button>
            {/* <IconButton
            style={{ margin: "0px", padding: "0px" }}
            onClick={() => {
              handleGetReports();
            }}
          >
            <Tooltip title="Download CheckSheet">
              <MdPictureAsPdf style={{ color: "red" }} />
            </Tooltip>
          </IconButton> */}
          </div>
        </div>
        <div>
          <Modal
            title="Charts"
            open={isChartModalOpen}
            onCancel={() => setIsChartModalOpen(false)}
            footer={null}
            width={"100%"}
          >
            {Object.entries(chartsData).map(([tableId, tableCharts]: any) => (
              <div key={tableId} style={{ marginBottom: 40 }}>
                <h2 style={{ marginBottom: 20 }}>Table: {tableId}</h2>

                <div style={{ display: "flex", gap: "3px" }}>
                  {/* Line Chart */}
                  <div>
                    <h3 style={{ textAlign: "center" }}>Line Chart</h3>
                    <LineChart
                      width={chartWidth}
                      height={400}
                      data={tableCharts.line}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Array.from(
                        new Set(tableCharts.line.flatMap(Object.keys))
                      )
                        .filter((key) => key !== "date")
                        .map((key: any, index) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={`hsl(${(index * 360) / 10}, 70%, 50%)`}
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                          />
                        ))}
                    </LineChart>
                  </div>

                  {/* Stacked Bar Chart */}
                  <div>
                    <h3 style={{ textAlign: "center" }}>Grouped Bar Graph</h3>
                    <BarChart
                      width={chartWidth}
                      height={400}
                      data={tableCharts?.bar}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Array.from(
                        new Set(tableCharts?.bar.flatMap(Object.keys))
                      )
                        .filter(
                          (key: any) =>
                            key !== "date" && !key.includes("(Target)")
                        )
                        .map((key: any, index) => (
                          <Bar
                            key={key}
                            dataKey={key}
                            fill={`hsl(${(index * 360) / 10}, 70%, 50%)`}
                            name={key}
                          />
                        ))}
                      {Array.from(new Set(tableCharts.bar.flatMap(Object.keys)))
                        .filter((key: any) => key.includes("(Target)"))
                        .map((key: any, index) => (
                          <Bar
                            key={key}
                            dataKey={key}
                            fill={`hsl(${(index * 360) / 10}, 70%, 30%)`}
                            name={key}
                          />
                        ))}
                    </BarChart>
                  </div>
                </div>

                {/* Speedometer Charts */}
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  {tableCharts.speedometer.map((chart: any, index: number) => {
                    const options = speedometerOptions(
                      chart.title,
                      chart.specification,
                      chart.actual
                    );
                    return (
                      <div key={index} style={{ width: "400px" }}>
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={options}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </Modal>
          {/* <Modal
            title="Charts"
            open={isChartModalOpen}
            onCancel={() => setIsChartModalOpen(false)}
            footer={null}
            width={"100%"}
          >
            <div style={{ display: "flex", gap: "3px" }}>
              {/* Line Chart */}
          {/*<div>
                <h3 style={{ textAlign: "center" }}>Line Chart</h3>
                <LineChart
                  width={chartWidth}
                  height={400}
                  data={lineChartData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Array.from(new Set(lineChartData.flatMap(Object.keys)))
                    .filter((key) => key !== "date")
                    .map((key, index) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={`hsl(${(index * 360) / 10}, 70%, 50%)`}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                </LineChart>
              </div>

              {/* Stacked Bar Chart */}
          {/*<div>
                <h3 style={{ textAlign: "center" }}>Grouped Bar Graph</h3>
                <BarChart
                  width={chartWidth}
                  height={400}
                  data={stackedBarChartData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Array.from(new Set(stackedBarChartData.flatMap(Object.keys)))
                    .filter(
                      (key) => key !== "date" && !key.includes("(Target)")
                    )
                    .map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={`hsl(${(index * 360) / 10}, 70%, 50%)`}
                        name={key}
                      />
                    ))}
                  {Array.from(new Set(stackedBarChartData.flatMap(Object.keys)))
                    .filter((key) => key.includes("(Target)"))
                    .map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={`hsl(${(index * 360) / 10}, 70%, 30%)`}
                        name={key}
                      />
                    ))}
                </BarChart>
              </div>
            </div>

            {/* Speedometer Charts */}
          {/*<div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {speedometerChartData.map((chart, index) => {
                const options = speedometerOptions(
                  chart.title,
                  chart.specification,
                  chart.actual
                );
                return (
                  <div key={index} style={{ width: "400px" }}>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={options}
                    />
                  </div>
                );
              })}
            </div>
          </Modal> */}
        </div>
        {/* <div
          className={classes.tableContainer}
          style={{ width: "100% !important", paddingTop: "20px" }}
        > */}
        {/* <Table
            dataSource={newDataSource}
            columns={columns}
            pagination={false}
            bordered
            style={{ width: "100% !important" }}
            // footer={() => {
            //   if (!numericFunction || numericFunction.length === 0) return null;
            //   return (
            //     <div style={{ display: "flex", justifyContent: "space-between" }}>
            //       {columns?.map((col: any, index:any) => {
            //         if (col.dataIndex && col.render) {
            //           // Filter rows for columnType === 'value'
            //           const values = newDataSource
            //             .map((row: any) => {
            //               const cell = row.cells.find(
            //                 (c: any) =>
            //                   c.columnName.toLowerCase().replace(/\s+/g, "_") ===
            //                     col.dataIndex && c.columnType === "value"
            //               );
            //               return cell ? Number(cell.value) || 0 : null;
            //             })
            //             .filter((val) => val !== null); // Remove null values
            //           return (
            //             <div
            //               key={col.dataIndex}
            //               style={{ width: col.width || "auto" }}
            //             >
            //               {numericFunction.includes("Summation") && (
            //                 <div style={{display:"flex", gap:"4px"}}>
            //                   {index === 0 && <strong>Summation</strong> }
            //                   <span style={{ fontWeight: "bold", color: "#000" }}>
            //                     {values.reduce(
            //                       (acc: any, curr: any) => acc + curr,
            //                      0
            //                     ) || "_"}
            //                   </span>
            //                 </div>
            //               )}
            //               {numericFunction.includes("Mean") &&
            //                 values.length > 0 && (
            //                   <div style={{display:"flex", gap:"4px"}}>
            //                     {index === 0 &&  <strong>Mean</strong> }
            //                     <span
            //                       style={{ fontWeight: "bold", color: "#000" }}
            //                     >
            //                       {(
            //                         values.reduce(
            //                           (acc: any, curr: any) => acc + curr,
            //                           0
            //                         ) / values.length
            //                       ).toFixed(2) || "_"}
            //                     </span>
            //                   </div>
            //                 )}
            //             </div>
            //           );
            //         }
            //         return null;
            //       })}
            //     </div>
            //   );
            // }}
            footer={() => {
              if (!numericFunction || numericFunction.length === 0) return null;

              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "bold",
                  }}
                >
                  {columns?.map((col: any, index: any) => {
                    if (col.dataIndex && col.render) {
                      // Extract values from rows where columnType === 'value'
                      const values = newDataSource
                        .map((row: any) => {
                          const cell = row.cells.find(
                            (c: any) =>
                              c.columnName
                                .toLowerCase()
                                .replace(/\s+/g, "_") === col.dataIndex &&
                              c.columnType === "value"
                          );
                          return cell ? Number(cell.value) || 0 : null;
                        })
                        .filter((val) => val !== null); // Remove null values

                      const summation = values.reduce(
                        (acc: any, curr: any) => acc + curr,
                        0
                      );
                      const mean =
                        values.length > 0
                          ? (summation / values.length).toFixed(2)
                          : "";

                      return (
                        <div
                          key={col.dataIndex}
                          style={{ width: col.width || "auto" }}
                        >
                          {/* Show Summation */}
        {/*{numericFunction.includes("Summation") && (
                            <div style={{ display: "flex", gap: "4px" }}>
                              {index === 0 && <strong>Summation</strong>}
                              <span style={{ color: "#000" }}>
                                {summation || ""}
                              </span>
                            </div>
                          )}

                          {/* Show Mean */}
        {/*{numericFunction.includes("Mean") && (
                            <div style={{ display: "flex", gap: "4px" }}>
                              {index === 0 && <strong>Mean</strong>}
                              <span style={{ color: "#000" }}>
                                {mean || ""}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            }}
            onRow={() => ({
              onMouseEnter: (e) => {
                const icon = e.currentTarget.querySelector(".info-icon");
                if (icon) icon.style.visibility = "visible";
              },
              onMouseLeave: (e) => {
                const icon = e.currentTarget.querySelector(".info-icon");
                if (icon) icon.style.visibility = "hidden";
              },
            })}
          />
        </div> */}
        <div
          className={classes.tableContainer}
          style={{ width: "100% !important", paddingTop: "20px" }}
        >
          {tableHeader.map((tableGroup, index) => {
            // Get unique table IDs for this group
            const tableColumnIds = tableGroup.map((col: any) => col.id);

            // Filter data for this specific table
            const filteredData = newDataSource.filter((row) =>
              row.cells.some((cell: any) =>
                tableColumnIds.includes(cell.tableHeaderId)
              )
            );

            return (
              <Accordion
                key={index}
                defaultExpanded
                className={classes.headingRoot}
              >
                <AccordionSummary
                  expandIcon={<MdExpandMore />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-header`}
                  className={classes.summaryRoot}
                >
                  <Typography variant="subtitle1" className={classes.heading}>
                    Table {index + 1}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.headingRoot}>
                  <Table
                    dataSource={filteredData}
                    columns={generateColumns(tableGroup)}
                    pagination={false}
                    bordered
                    style={{ width: "100% !important" }}
                    footer={() => {
                      if (!numericFunction || numericFunction.length === 0)
                        return null;

                      return (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontWeight: "bold",
                          }}
                        >
                          {generateColumns(tableGroup)?.map(
                            (col: any, index: any) => {
                              if (col.dataIndex && col.render) {
                                // Extract values from rows where columnType === 'value'
                                const values = filteredData
                                  .map((row: any) => {
                                    const cell = row.cells.find(
                                      (c: any) =>
                                        c.columnName
                                          .toLowerCase()
                                          .replace(/\s+/g, "_") ===
                                          col.dataIndex &&
                                        c.columnType === "value"
                                    );
                                    return cell
                                      ? Number(cell.value) || 0
                                      : null;
                                  })
                                  .filter((val) => val !== null); // Remove null values

                                const summation = values.reduce(
                                  (acc: any, curr: any) => acc + curr,
                                  0
                                );
                                const mean =
                                  values.length > 0
                                    ? (summation / values.length).toFixed(2)
                                    : "";

                                return (
                                  <div
                                    key={col.dataIndex}
                                    style={{ width: col.width || "auto" }}
                                  >
                                    {/* Show Summation */}
                                    {numericFunction.includes("Summation") && (
                                      <div
                                        style={{ display: "flex", gap: "4px" }}
                                      >
                                        {index === 0 && (
                                          <strong>Summation</strong>
                                        )}
                                        <span style={{ color: "#000" }}>
                                          {summation || ""}
                                        </span>
                                      </div>
                                    )}

                                    {/* Show Mean */}
                                    {numericFunction.includes("Mean") && (
                                      <div
                                        style={{ display: "flex", gap: "4px" }}
                                      >
                                        {index === 0 && <strong>Mean</strong>}
                                        <span style={{ color: "#000" }}>
                                          {mean || ""}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }
                          )}
                        </div>
                      );
                    }}
                    onRow={() => ({
                      onMouseEnter: (e) => {
                        const icon =
                          e.currentTarget.querySelector(".info-icon");
                        if (icon) icon.style.visibility = "visible";
                      },
                      onMouseLeave: (e) => {
                        const icon =
                          e.currentTarget.querySelector(".info-icon");
                        if (icon) icon.style.visibility = "hidden";
                      },
                    })}
                  />
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>
      </div>
    );
  };

export default DashboardFilters;
