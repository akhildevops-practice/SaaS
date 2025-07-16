import { Chart as ChartJS } from "chart.js";
import { useEffect, useRef, useState } from "react";
import InWorkFlowTable from "./InWorkFlowTabel";
import { Button, Modal, Table } from "antd";
import { Paper, makeStyles, useMediaQuery } from "@material-ui/core";
import ByDepartmentChart from "./ByDepatmentChart";
import { AiOutlineFileExcel, AiOutlineArrowsAlt } from "react-icons/ai";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import ByStatusChart from "./ByStatusChart";
import ByTypeChart from "./ByTypeChart";
import BySystemChart from "./BySystemChart";
import * as XLSX from "xlsx";
import saveAs from "file-saver";
import ByUnitChart from "./ByUnitChart";
type props = {
  setActiveTab?: any;
  activeTab?: any;
  statusData?: any;
  typeData?: any;
  systemData?: any;
  departmentTableData: any;
  documentdata?: any;
  deptData?: any;
  locationData?: any;
  setSecTableData?: any;
  setSecondModal?: any;
  secTableData?: any;
  // newData?: any;
  monthData?: any;
  documentTypeData?: any;
  docTypeData?: any;
  filterQuery?: any;
  setFilterQuery?: any;
  entity?: any;
  location?: any;
  entityId?: any;
  locationId?: any;
  unitOption?: any;
};

interface DocType {
  name: string;
  published: number;
  inWorkflow: number;
  draft: number;
}

interface DocumentTableProps {
  docTypes: DocType[];
}

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: "100%",
  },
  tableContainer: {
    width: "100%", // Adjust the width as needed
    overflowX: "auto",
    // fontFamily: "Poppins !important",

    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        // borderInlineEnd: "none",
      },

    "&.ant-table-wrapper .ant-table .ant-table-header": {
      borderRadius: "none !important",
    },

    "& .ant-table-thead .ant-table-cell": {
      boxSizing: "border-box", // Add this line
      backgroundColor: "#E8F3F9",
      border: "2px solid #CECECE",
      color: "#00224E",
      borderRadius: "none",
      textAlign: "center",
      padding: "5px 8px",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      textAlign: "center",
    },
    "& span.ant-tag": {
      display: "flex",
      width: "89px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",

      color: "white",
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      // position: "sticky", // Add these two properties
      // top: 0, // Add these two properties

      fontWeight: 600,
      fontSize: "13px",
      padding: "6px 8px !important",
      textAlign: "center",
    },
    "& .ant-table-tbody >tr >td": {
      fontSize: "13px",
      // padding: "4px 8px !important",
      border: "1px solid #CECECE",
      textAlign: "center",
    },

    "& .ant-table-body": {
      // padding: "0px 8px", // Add padding to the right side
      border: "1px solid #CECECE",
      // maxHeight: "150px", // Adjust the max-height value as needed
      // overflowY: "auto",
      // "&::-webkit-scrollbar": {
      //   width: "8px",
      //   height: "10px",
      //   backgroundColor: "#e5e4e2",
      // },
      // "&::-webkit-scrollbar-thumb": {
      //   borderRadius: "0px",
      //   backgroundColor: "grey",
      // },
    },
    "& tr.ant-table-row": {
      borderRadius: 0,
      //   cursor: "pointer",
      transition: "all 0.1s linear",
    },
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#a6a6a6",
    },
    evenRow: {
      backgroundColor: "#a6a6a6", // Example color for even row
    },
    oddRow: {
      backgroundColor: "black", // Example color for odd row
    },
    width: "100%", // Adjust the width as needed
    overflowX: "auto", // Add horizontal scroll if needed
    "& .ant-table": {
      minWidth: "100%", // Ensure table fills container width
    },
    "& .ant-table-body": {
      maxWidth: "100%", // Ensure table body fills container width
    },
    "& .ant-table-pagination": {
      display: "none", // Hide default pagination
    },
  },
  centerAlignedCell: {
    textAlign: "center",
    "&.ant-table-body ": {
      padding: "0px",
    },
    "&.ant-table-wrapper .ant-table-tbody>tr>td": {
      padding: "5px 8px",
    },

    "&.custom-pagination .ant-pagination": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },

    /* Reduce the size of the pagination number */
    " &.custom-pagination .ant-pagination-item ": {
      fontSize: "12px",
    },

    /* Reduce the size of the pagination arrows */
    "& .custom-pagination .ant-pagination-item-link": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },

    /* Reduce the size of the pagination size changer */
    "&.custom-pagination .ant-pagination-options ": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },
  },
}));

interface RowData {
  entityName: string;
  sectionName: string;
  [key: string]: any; // Index signature to allow dynamic keys
}
const DocumentDashBoardCharts = ({
  setActiveTab,
  activeTab,
  statusData,
  typeData,
  systemData,
  departmentTableData,
  documentdata,
  deptData,
  locationData,
  setSecTableData,
  setSecondModal,
  secTableData,
  // newData,
  monthData,
  docTypeData,
  documentTypeData,
  entity,
  location,
  locationId,
  entityId,
  filterQuery,
  setFilterQuery,
  unitOption,
}: props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [name, setName] = useState("");
  const [backgroundColors, setBackgroundColors] = useState([]);
  const classes = useStyles();
  useEffect(() => {
    let name, type;
    if (activeTab === 0) {
      setName("Total Published");
    } else if (activeTab === 1) {
      setName("Total Published");
    } else if (activeTab === 2) {
      setName("Published (current year)");
    } else if (activeTab === 3) {
      setName("Published (current year)");
    } else if (activeTab === 4) {
      setName("Revised (current year)");
    } else if (activeTab === 5) {
      setName("Revised (current year)");
    } else if (activeTab === 6) {
      setName("Revision Due < 60 Days");
    } else if (activeTab === 7) {
      setName("Revision Due < 60 Days");
    } else if (activeTab === 8) {
      setName("In Workflow");
    } else if (activeTab === 9) {
      setName("In Workflow");
    } else if (activeTab === 10) {
      setName("totalPublished");
    } else if (activeTab === 11) {
      setName("Published (current year)");
    } else if (activeTab === 12) {
      setName("Revised (current year)");
    } else if (activeTab === 13) {
      setName("Revision Due < 60 Days");
    } else if (activeTab === 14) {
      setName("In Workflow");
    } else if (activeTab === 15) {
      setName("All Documents");
    } else if (activeTab === 16) {
      setName("All Documents");
    } else if (activeTab === 17) {
      setName("All Documents");
    }
  }, [activeTab]);

  console.log("activeTab", activeTab);
  const predefinedColors = [
    "#22a2dd",
    "#a5d02f",
    "#f79f08",
    "#1aa7ff",
    "#c86ab4",
    "#f0cb28",
    "#699eb0",
    "#b4a97e",
    "#CCC5A8",
    "#DBDB46",
    "#6b85fa",
  ];

  const generateBackgroundColors = (length: any) => {
    const colors = [...predefinedColors];
    const remainingColorsCount = length - colors.length;
    if (remainingColorsCount <= 0) {
      return colors;
    } else {
      // Generate additional random colors
      for (let i = 0; i < remainingColorsCount; i++) {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(
          16
        )}`;
        colors.push(randomColor);
      }
      return colors;
    }
  };

  const BackgroundColor = [
    "#21618C",
    "#DC5F00",
    "#686D76",
    "#C73659",
    "#373A40",
    "#f0cb28",
    "#699eb0",
    "#b4a97e",
    "#CCC5A8",
    "#DBDB46",
    "#6b85fa",
  ];

  // const chartRef1 = useRef<any>(null);
  // useEffect(() => {
  //   const ctx = chartRef1.current.getContext("2d");
  //   let chart = null as any;

  //   if (ctx) {
  //     const labels: any = deptData?.map((value: any) => value?.entityName);

  //     const datas: any = deptData?.map((value: any) => value.count);

  //     const BackgroundColor = [
  //       "#21618C",
  //       "#DC5F00",
  //       "#686D76",
  //       "#C73659",
  //       "#373A40",
  //       "#f0cb28",
  //       "#699eb0",
  //       "#b4a97e",
  //       "#CCC5A8",
  //       "#DBDB46",
  //       "#6b85fa",
  //     ];

  //     let backgroundColors = [...BackgroundColor]; // Using predefined colors initially

  //     // If the number of data points exceeds the number of predefined colors,
  //     // generate additional random colors
  //     if (datas?.length > BackgroundColor?.length) {
  //       const remainingColorsCount = datas?.length - BackgroundColor?.length;
  //       for (let i = 0; i < remainingColorsCount; i++) {
  //         const randomColor = `#${Math.floor(Math.random() * 16777215).toString(
  //           16
  //         )}`;
  //         backgroundColors.push(randomColor);
  //       }
  //     }

  //     chart = new ChartJS(ctx, {
  //       type: "bar",
  //       data: {
  //         labels: labels,
  //         datasets: [
  //           {
  //             label: "set1",
  //             data: datas,
  //             backgroundColor: backgroundColors,
  //             // borderColor: BorderColor,
  //             borderWidth: 1,
  //           },
  //         ],
  //       },
  //       // data: staticData,
  //       options: {
  //         responsive: false, // This line is added to make the graph non-responsive
  //         maintainAspectRatio: false,

  //         plugins: {
  //           datalabels: {
  //             color: "white", // Change the color of data labels
  //             font: {
  //               size: 14, // Increase the size of data labels
  //             },
  //           },
  //           legend: {
  //             display: false,
  //             position: "right",
  //           },
  //           title: {
  //             display: true,
  //             text: "By Dept/Vertical",
  //             font: {
  //               size: 16,
  //               weight: "1",
  //               family: "'Poppins', sans-serif", // Change the font family here
  //             },
  //             color: "Black",
  //           },
  //           tooltip: {
  //             enabled: true,
  //             backgroundColor: "rgba(0, 0, 0, 0.7)",
  //             borderColor: "#fff",
  //             borderWidth: 1,
  //             titleFont: {
  //               size: 16, // Increase font size
  //               weight: "bold",
  //             },
  //             bodyFont: {
  //               size: 14, // Increase font size
  //               weight: "normal",
  //             },
  //             padding: 10, // Add more padding
  //           },
  //         },
  //         scales: {
  //           y: {
  //             grid: {
  //               borderWidth: 3,
  //               lineWidth: 1,
  //             },
  //             ticks: {
  //               // color: "black",
  //               // font: {
  //               //   size: 12, // Increase font size
  //               //   weight: "bold", // Set font weight to bold
  //               //   // family: "Poppins ",
  //               // },
  //               callback: function (value, index, values) {
  //                 if (Number.isInteger(value)) {
  //                   return value;
  //                 } else {
  //                   return "";
  //                 }
  //               },
  //             },
  //           },

  //           x: {
  //             grid: {
  //               borderWidth: 3,
  //               lineWidth: 1,
  //             },
  //             ticks: {
  //               // color: "black",
  //               // font: {
  //               //   size: 12, // Increase font size
  //               //   weight: "bold", // Set font weight to bold
  //               //   // family: "Poppins ",
  //               // },
  //             },
  //           },
  //         },

  //         onClick: (e, index: any) => {
  //           setFilterQuery({ entityId: deptData[index[0]?.index]?.entityId });
  //           // newData(deptData[index[0]?.index].documentIds);
  //         },
  //       },
  //     });
  //   }

  //   return () => {
  //     chart?.destroy();
  //   };
  // });
  // const chartRef2 = useRef<any>(null);
  // useEffect(() => {
  //   const ctx = chartRef2?.current?.getContext("2d");
  //   let chart = null as any;

  //   if (ctx) {
  //     const labels: any = statusData?.map((value: any) => value?.status);
  //     const datas: any = statusData?.map((value: any) => value?.count);
  //     chart = new ChartJS(ctx, {
  //       type: "bar",
  //       data: {
  //         labels: labels,
  //         datasets: [
  //           {
  //             label: "",
  //             data: datas,
  //             backgroundColor: BackgroundColor,
  //             // borderColor: BorderColor,
  //             borderWidth: 1,
  //             // borderRadius: 10,
  //           },
  //         ],
  //       },
  //       options: {
  //         responsive: false, // This line is added to make the graph non-responsive
  //         maintainAspectRatio: false,

  //         plugins: {
  //           datalabels: {
  //             color: "white", // Change the color of data labels
  //             font: {
  //               size: 14, // Increase the size of data labels
  //             },
  //           },
  //           legend: {
  //             display: false,
  //             position: "right",
  //           },
  //           title: {
  //             display: true,
  //             text: "By Status",
  //             font: {
  //               size: 16,
  //               weight: "1",
  //               family: "'Poppins', sans-serif", // Change the font family here
  //             },
  //             color: "Black",
  //           },
  //           tooltip: {
  //             enabled: true,
  //             backgroundColor: "rgba(0, 0, 0, 0.7)",
  //             borderColor: "#fff",
  //             borderWidth: 1,
  //             titleFont: {
  //               size: 16, // Increase font size
  //               weight: "bold",
  //             },
  //             bodyFont: {
  //               size: 14, // Increase font size
  //               weight: "normal",
  //             },
  //             padding: 10, // Add more padding
  //           },
  //         },
  //         scales: {
  //           y: {
  //             grid: {
  //               borderWidth: 3,
  //               lineWidth: 1,
  //             },
  //             ticks: {
  //               // font: {
  //               //   size: 12, // Increase font size
  //               //   weight: "bold", // Set font weight to bold
  //               //   // family: "Poppins ",
  //               // },
  //               color: "black",
  //               callback: function (value, index, values) {
  //                 if (Number.isInteger(value)) {
  //                   return value;
  //                 } else {
  //                   return "";
  //                 }
  //               },
  //             },
  //           },
  //           x: {
  //             grid: {
  //               borderWidth: 3,
  //               lineWidth: 1,
  //             },
  //             ticks: {
  //               // font: {
  //               //   size: 12, // Increase font size
  //               //   weight: "bold", // Set font weight to bold
  //               //   // family: "Poppins ",
  //               // },
  //               // color: "black",
  //             },
  //           },
  //         },
  //         onClick: (e, index) => {
  //           // newData(statusData[index[0]?.index].documentIds);
  //           setFilterQuery({
  //             ...filterQuery,
  //             status: statusData[index[0]?.index]?.status,
  //           });
  //         },
  //       },
  //     });
  //   }
  //   // }

  //   return () => {
  //     chart?.destroy();
  //   };
  // });

  // const chartRef3 = useRef<any>(null);
  // useEffect(() => {
  //   const ctx = chartRef3.current.getContext("2d");
  //   let chart = null as any;
  //   if (ctx) {
  //     const labels: any = typeData?.map((value: any) => value?.docTypeName);

  //     const datas: any = typeData?.map((value: any) => value?.count);

  //     chart = new ChartJS(ctx, {
  //       type: "bar",
  //       data: {
  //         labels: labels,
  //         datasets: [
  //           {
  //             label: "",
  //             data: datas,
  //             backgroundColor: BackgroundColor,
  //             // borderColor: BorderColor,
  //             borderWidth: 1,
  //           },
  //         ],
  //       },
  //       options: {
  //         responsive: false, // This line is added to make the graph non-responsive
  //         maintainAspectRatio: false,

  //         plugins: {
  //           datalabels: {
  //             color: "white", // Change the color of data labels
  //             font: {
  //               size: 14, // Increase the size of data labels
  //             },
  //           },
  //           legend: {
  //             display: false,
  //             position: "right",
  //           },
  //           title: {
  //             display: true,
  //             text: "By Type",
  //             font: {
  //               size: 16,
  //               weight: "1",
  //               family: "'Poppins', sans-serif", // Change the font family here
  //             },
  //             color: "Black",
  //           },
  //           tooltip: {
  //             enabled: true,
  //             backgroundColor: "rgba(0, 0, 0, 0.7)",
  //             borderColor: "#fff",
  //             borderWidth: 1,
  //             titleFont: {
  //               size: 16, // Increase font size
  //               weight: "bold",
  //             },
  //             bodyFont: {
  //               size: 14, // Increase font size
  //               weight: "normal",
  //             },
  //             padding: 10, // Add more padding
  //           },
  //         },

  //         scales: {
  //           y: {
  //             grid: {
  //               borderWidth: 3,
  //               lineWidth: 1,
  //             },

  //             ticks: {
  //               // font: {
  //               //   size: 12, // Increase font size
  //               //   weight: "bold", // Set font weight to bold
  //               //   // family: "Poppins ",
  //               // },
  //               // color: "black",
  //               callback: function (value, index, values) {
  //                 if (Number.isInteger(value)) {
  //                   return value;
  //                 } else {
  //                   return "";
  //                 }
  //               },
  //             },
  //           },
  //           x: {
  //             grid: {
  //               borderWidth: 3,
  //               lineWidth: 1,
  //             },
  //             ticks: {
  //               // color: "black",
  //               // font: {
  //               //   size: 12, // Increase font size
  //               //   weight: "bold", // Set font weight to bold
  //               //   // family: "Poppins ",
  //               // },
  //             },
  //           },
  //         },
  //         onClick: (e, index) => {
  //           setFilterQuery({ type: typeData[index[0]?.index]?.doctypeId });
  //           // newData(typeData[index[0]?.index].documentIds);
  //         },
  //       },
  //     });
  //   }
  //   // }

  //   return () => {
  //     chart?.destroy();
  //   };
  // });

  // const chartRef4 = useRef<any>(null);
  // useEffect(() => {
  //   const ctx = chartRef4.current.getContext("2d");
  //   let chart = null as any;

  //   if (ctx) {
  //     const labelss: any = systemData?.map((value: any) => value?.systemName);

  //     const datass: any = systemData?.map((value: any) => value?.count);

  //     const BackgroundColor = [
  //       "#21618C",
  //       "#DC5F00",
  //       "#686D76",
  //       "#C73659",
  //       "#373A40",
  //       "#f0cb28",
  //       "#699eb0",
  //       "#b4a97e",
  //       "#CCC5A8",
  //       "#DBDB46",
  //       "#6b85fa",
  //     ];

  //     let backgroundColors = [...BackgroundColor]; // Using predefined colors initially

  //     // If the number of data points exceeds the number of predefined colors,
  //     // generate additional random colors

  //     chart = new ChartJS(ctx, {
  //       type: "pie",
  //       data: {
  //         labels: labelss,
  //         datasets: [
  //           {
  //             label: "11111",
  //             data: datass,
  //             backgroundColor: backgroundColors,
  //             // borderColor: BorderColor,
  //             borderWidth: 1,
  //           },
  //         ],
  //       },
  //       options: {
  //         responsive: false, // This line is added to make the graph non-responsive
  //         maintainAspectRatio: false,

  //         plugins: {
  //           datalabels: {
  //             color: "white", // Change the color of data labels
  //             font: {
  //               size: 14, // Increase the size of data labels
  //               family: "Poppins !important",
  //             },
  //           },
  //           legend: {
  //             display: true,
  //             position: "right",
  //             labels: {
  //               color: "black", // Change font color of legend labels
  //               font: {
  //                 size: 12, // Increase font size of legend labels
  //                 weight: "normal", // Font weight of legend labels
  //               },
  //             },
  //           },
  //           title: {
  //             display: true,
  //             text: "By System",
  //             font: {
  //               size: 16,
  //               weight: "1",
  //               family: "'Poppins', sans-serif", // Change the font family here
  //             },
  //             color: "Black",
  //           },
  //           tooltip: {
  //             enabled: true,
  //             backgroundColor: "rgba(0, 0, 0, 0.7)",
  //             borderColor: "#fff",
  //             borderWidth: 1,
  //             titleFont: {
  //               size: 16, // Increase font size
  //               weight: "bold",
  //               family: "Poppins !important",
  //             },
  //             bodyFont: {
  //               size: 14, // Increase font size
  //               weight: "normal",
  //             },
  //             padding: 10, // Add more padding
  //           },
  //         },

  //         onClick: (e, index) => {
  //           setFilterQuery({ system: systemData[index[0]?.index]?.systemIds });
  //           // newData(systemData[index[0]?.index].documentIds);
  //         },
  //       },
  //     });
  //   }
  //   // }

  //   return () => {
  //     chart?.destroy();
  //   };
  // });

  const chartRef5 = useRef<any>(null);
  useEffect(() => {
    const ctx = chartRef5?.current?.getContext("2d");
    let chart = null as any;

    if (ctx) {
      const labels: any = docTypeData?.map((value: any) => value?.docTypeName);
      const datas: any = docTypeData?.map((value: any) => value?.count);
      chart = new ChartJS(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "",
              data: datas,
              backgroundColor: BackgroundColor,
              // borderColor: BorderColor,
              borderWidth: 1,
              // borderRadius: 10,
            },
          ],
        },
        options: {
          responsive: false, // This line is added to make the graph non-responsive
          maintainAspectRatio: false,

          plugins: {
            datalabels: {
              color: "white", // Change the color of data labels
              font: {
                size: 14, // Increase the size of data labels
              },
            },
            legend: {
              display: false,
              position: "right",
            },
            title: {
              display: true,
              text: "By DocType",
              font: {
                size: 16,
                weight: "1",
                family: "'Poppins', sans-serif", // Change the font family here
              },
              color: "Black",
            },
            tooltip: {
              enabled: true,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderColor: "#fff",
              borderWidth: 1,
              titleFont: {
                size: 16, // Increase font size
                weight: "bold",
              },
              bodyFont: {
                size: 14, // Increase font size
                weight: "normal",
              },
              padding: 10, // Add more padding
            },
          },
          scales: {
            y: {
              grid: {
                borderWidth: 3,
                lineWidth: 1,
              },
              ticks: {
                // font: {
                //   size: 12, // Increase font size
                //   weight: "bold", // Set font weight to bold
                //   // family: "Poppins ",
                // },
                color: "black",
                callback: function (value, index, values) {
                  if (Number.isInteger(value)) {
                    return value;
                  } else {
                    return "";
                  }
                },
              },
            },
            x: {
              grid: {
                borderWidth: 3,
                lineWidth: 1,
              },
              ticks: {
                // font: {
                //   size: 12, // Increase font size
                //   weight: "bold", // Set font weight to bold
                //   // family: "Poppins ",
                // },
                // color: "black",
              },
            },
          },
          onClick: (e, index) => {
            setFilterQuery({ type: docTypeData[index[0]?.index].id });
            // newData(statusData[index[0]?.index].documentIds);
          },
        },
      });
    }
    // }

    return () => {
      chart?.destroy();
    };
  });
  const monthColumns = Array.from({ length: 12 }, (_, index) => {
    const monthName = new Date(2024, index).toLocaleString("en-US", {
      month: "long",
    });
    return {
      title: monthName,
      dataIndex: `month${index + 1}`, // month1, month2, ..., month12
      key: `month${index + 1}`,
    };
  });

  const columns = [
    {
      title: `Unit`,
      dataIndex: "locationName",
      key: "name",
    },
    {
      title: "Dept/vertical",
      dataIndex: "entityName",
      key: "name",

      render: (_: any, dataNew: any) => dataNew?.entityName || "",
    },
    // Dynamically generate columns for each month
    ...Array.from({ length: 12 }, (_, i) => {
      const months = [
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
      const fiscalMonths = [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
      ];
      const monthAbbr =
        userDetails?.organization?.fiscalYearQuarters === "April - Mar"
          ? fiscalMonths[i]
          : months[i];
      return {
        title: monthAbbr, // Get month abbreviation (e.g., Jan, Feb, etc.)
        dataIndex: monthAbbr, // Convert month abbreviation to lowercase
        key: monthAbbr,
        render: (_: any, record: any) => {
          const monthData = record.data.find(
            (item: any) => item.month === monthAbbr
          );
          return monthData ? monthData.count : null;
        },
        onCell: (record: any) => ({
          onClick: () => {
            const monthData = record.data.find(
              (item: any) => item.month === monthAbbr
            );
            if (monthData) {
              setFilterQuery({
                month: monthData?.month,
                sectionId: record.section,
              });
              // newData(monthData?.ids || []);
              // Here you can fetch the ids or perform any other action
            }
          },
        }),
      };
    }),
  ];

  const transformedData = documentTypeData.flatMap((item: any) =>
    item.docTypes.map((doc: any) => ({
      locationName: item.locationName,
      entityName: item.entityName,
      doctype: doc.name,
      Pushlished: doc.Pushlished,
      WorkFlow: doc.WorkFlow,
      Draft: doc.Draft,
    }))
  );
  const columnsData = [
    {
      title: "Location Name",
      dataIndex: "locationName",
      key: "locationName",
    },
    {
      title: "Entity Name",
      dataIndex: "entityName",
      key: "entityName",
    },
    {
      title: "DocType",
      dataIndex: "doctype",
      key: "doctype",
    },
    {
      title: "Pushlished",
      dataIndex: "Pushlished",
      key: "Pushlished",
    },
    {
      title: "WorkFlow",
      dataIndex: "WorkFlow",
      key: "WorkFlow",
    },
    {
      title: "Draft",
      dataIndex: "Draft",
      key: "Draft",
    },
  ];

  // graph models

  //model for dept/vert graph

  const [isModalOpenForDept, setIsModalOpenForDept] = useState(false);
  const [isModalOpenForUnit, setIsModalOpenForUnit] = useState(false);

  const showModalForDept = () => {
    setIsModalOpenForDept(true);
  };

  const handleOkForDept = () => {
    setIsModalOpenForDept(false);
  };

  const handleCancelForDept = () => {
    setIsModalOpenForDept(false);
  };

  const showModalForUnit = () => {
    setIsModalOpenForUnit(true);
  };

  const handleOkForUnit = () => {
    setIsModalOpenForUnit(false);
  };

  const handleCancelForUnit = () => {
    setIsModalOpenForUnit(false);
  };

  //model for status graph

  const [isModalOpenForStatus, setIsModalOpenForStatus] = useState(false);

  const showModalForStatus = () => {
    setIsModalOpenForStatus(true);
  };
  const handleOkForStatus = () => {
    setIsModalOpenForStatus(false);
  };

  const handleCancelForStatus = () => {
    setIsModalOpenForStatus(false);
  };

  //model for type graph

  const [isModalOpenForType, setIsModalOpenForType] = useState(false);
  const [isModalOpenForTypeChart, setIsModalOpenForTypeChart] = useState(false);
  console.log("isModalOpenForTypeChart", isModalOpenForTypeChart);

  const showModalForType = () => {
    setIsModalOpenForType(true);
    setIsModalOpenForTypeChart(true);
  };
  const handleOkForType = () => {
    setIsModalOpenForType(false);
    setIsModalOpenForTypeChart(false);
  };

  const handleCancelForType = () => {
    setIsModalOpenForType(false);
    setIsModalOpenForTypeChart(false);
  };

  //model for system  graph

  const [isModalOpenForSystem, setIsModalOpenForSystem] = useState(false);

  const showModalForSystem = () => {
    setIsModalOpenForSystem(true);
  };
  const handleOkForSystem = () => {
    setIsModalOpenForSystem(false);
  };

  const handleCancelForSystem = () => {
    setIsModalOpenForSystem(false);
  };

  //model for InWorkFlowTable Table
  const [inWorkFlowTable, setInWorkFlowTable] = useState(false);
  const [isModalOpenForInWorkFlowTable, setIsModalOpenForInWorkFlowTable] =
    useState(false);

  const showModalForInWorkFlowTable = () => {
    setIsModalOpenForInWorkFlowTable(true);
    setInWorkFlowTable(true);
  };
  const handleOkForInWorkFlowTable = () => {
    setIsModalOpenForInWorkFlowTable(false);
    setInWorkFlowTable(false);
  };

  const handleCancelForInWorkFlowTable = () => {
    setIsModalOpenForInWorkFlowTable(false);
    setInWorkFlowTable(false);
  };

  //model for  Table

  const [isModalOpenForTable, setIsModalOpenForTable] = useState(false);

  const showModalForTable = () => {
    setIsModalOpenForTable(true);
  };
  const handleOkForTable = () => {
    setIsModalOpenForTable(false);
  };

  const handleCancelForTable = () => {
    setIsModalOpenForTable(false);
  };
  const handleExport = () => {
    // Convert table data to a worksheet
    const wsData: RowData[] = monthData.map((row: any) => {
      const rowData: RowData = {
        entityName: row.entityName,
        sectionName: row.sectionName,
      };
      row.data.forEach((item: any) => {
        rowData[item.month.toLowerCase()] = item.count;
      });
      return rowData;
    });
    const months = [
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
    const fiscalMonths = [
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const monthAbbr =
      userDetails?.organization?.fiscalYearQuarters === "April - Mar"
        ? fiscalMonths
        : months;
    // Add column headers
    const headers = [
      [
        "Dept/Vertical",
        "Section",
        ...Array.from({ length: 12 }, (_, i) => monthAbbr[i]),
      ],
    ];

    const worksheetData = [
      ...headers,
      ...wsData.map((row) => [
        row.entityName,
        row.sectionName,
        ...Array.from(
          { length: 12 },
          (_, i) => row[monthAbbr[i].toLowerCase()] || ""
        ),
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate a blob and trigger a download
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    saveAs(blob, "table_data.xlsx");
  };

  // Convert string to ArrayBuffer
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  const transformDataForExcel = (data: any) => {
    return data.map((record: any) => {
      return {
        UnitName: record.locationName,
        "Dept/Vertical": record.entityName,
        sectionName: record.sectionName || "",
        "Doctype Name": record?.docTypeName,
        DRAFT: record.DRAFT || 0,
        IN_REVIEW: record.IN_REVIEW || 0,
        IN_APPROVAL: record.IN_APPROVAL || 0,
        SEND_FOR_EDIT: record.SEND_FOR_EDIT || 0,
        PUBLISHED: record.PUBLISHED || 0,
        total:
          Number(record.SEND_FOR_EDIT || 0) +
          Number(record.IN_APPROVAL || 0) +
          Number(record.IN_REVIEW || 0) +
          Number(record.DRAFT || 0) +
          Number(record.PUBLISHED || 0),
      };
    });
  };
  const exportToExcel = () => {
    const transformedData = transformDataForExcel(departmentTableData);
    const ws = XLSX.utils.json_to_sheet(transformedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DeptStatusData");

    // Generate Excel file and use saveAs to save it
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const blob = new Blob([s3ab(excelBuffer)], {
      type: "application/octet-stream",
    });
    saveAs(blob, "DepartmentStatus.xlsx");
  };

  const s3ab = (s: any) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  console.log("entity", entity);
  console.log("unit", unitOption);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        padding: "15px 16px",
        marginTop: "3px",
        marginLeft: matches ? "0px" : "10px",
        marginRight: matches ? "0px" : "10px",
      }}
    >
      <Paper
        elevation={0}
        style={{
          marginTop: "15px",
          width: matches ? "49%" : "100%",
          height: "370px",
          borderRadius: "8px",
          boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
        }}
      >
        {" "}
        <div
          style={{
            display: "flex",
            margin: "10px 0px",
            backgroundColor: "white",
            padding: "0px 20px",
            width: matches ? "100%" : "86%",
            height: "340px",
          }}
        >
          <BySystemChart
            systemData={systemData}
            setFilterQuery={setFilterQuery}
            entity={entity}
            location={location}
            locationId={locationId}
            entityId={entityId}
            name={name}
            activeTab={activeTab}
          />
          {matches ? (
            <AiOutlineArrowsAlt
              onClick={showModalForSystem}
              style={{ marginTop: "10px", cursor: "pointer" }}
            />
          ) : null}

          {/* <canvas ref={chartRef4} width="600" height="250" /> */}
        </div>
      </Paper>

      <Paper
        elevation={0}
        style={{
          marginTop: "15px",
          width: matches ? "49%" : "100%",
          height: "370px",
          borderRadius: "8px",
          boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "5px",
            margin: "10px 0px",
            backgroundColor: "white",
            padding: "0px 20px",
            width: matches ? "100%" : "86%",
            height: "340px",
          }}
        >
          <ByStatusChart
            statusData={statusData}
            setFilterQuery={setFilterQuery}
            filterQuery={filterQuery}
            entity={entity}
            location={location}
            locationId={locationId}
            entityId={entityId}
            name={name}
            activeTab={activeTab}
          />
          {matches ? (
            <AiOutlineArrowsAlt
              onClick={showModalForStatus}
              style={{ marginTop: "10px", cursor: "pointer" }}
            />
          ) : null}

          {/* <canvas ref={chartRef2} width="600" height="250" /> */}
        </div>
      </Paper>

      <Paper
        elevation={0}
        style={{
          marginTop: "25px",
          width: matches
            ? unitOption === "All" || unitOption === undefined
              ? "49%"
              : "100%"
            : "96%",
          height: "400px",
          borderRadius: "8px",
          boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "5px",
            margin: "10px 0px",
            backgroundColor: "white",
            padding: "0px 20px",
            width: matches ? "100%" : "86%",
            height: "370px",
          }}
        >
          <ByTypeChart
            typeData={typeData}
            setFilterQuery={setFilterQuery}
            entity={entity}
            location={location}
            locationId={locationId}
            entityId={entityId}
            name={name}
            activeTab={activeTab}
          />
          {matches && (unitOption === "All" || unitOption === undefined) ? (
            <AiOutlineArrowsAlt
              onClick={showModalForType}
              style={{ marginTop: "10px", cursor: "pointer" }}
            />
          ) : null}

          {/* <canvas ref={chartRef3} width="600" height="250" /> */}
        </div>
      </Paper>

      {locationId === "All" ? (
        <Paper
          elevation={0}
          style={{
            marginTop: "25px",
            width: matches ? "49%" : "100%",
            height: "400px",
            borderRadius: "8px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "5px",
              margin: "10px 0px",
              backgroundColor: "white",
              padding: "0px 20px",
              width: matches ? "100%" : "86%",
              height: "370px",
            }}
          >
            <ByUnitChart
              locationData={locationData}
              setFilterQuery={setFilterQuery}
            />
            {matches ? (
              <AiOutlineArrowsAlt
                onClick={showModalForUnit}
                style={{ marginTop: "10px", cursor: "pointer" }}
              />
            ) : null}
          </div>
        </Paper>
      ) : null}

      {entityId?.includes("All") ? (
        <Paper
          elevation={0}
          style={{
            marginTop: "25px",
            width: matches ? "49%" : "100%",
            height: "400px",
            borderRadius: "8px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "5px",
              margin: "10px 0px",
              backgroundColor: "white",
              padding: "0px 20px",
              width: matches ? "100%" : "86%",
              height: "370px",
            }}
          >
            <ByDepartmentChart
              deptData={deptData}
              setFilterQuery={setFilterQuery}
            />
            {matches ? (
              <AiOutlineArrowsAlt
                onClick={showModalForDept}
                style={{ marginTop: "10px", cursor: "pointer" }}
              />
            ) : null}
          </div>
        </Paper>
      ) : null}

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForDept}
        onOk={handleOkForDept}
        onCancel={handleCancelForDept}
        width="60vw"
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
        <div style={{ width: "60vw", height: "63vh", paddingBottom: "30px" }}>
          <ByDepartmentChart
            deptData={deptData}
            setFilterQuery={setFilterQuery}
          />
        </div>
      </Modal>

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForUnit}
        onOk={handleOkForUnit}
        onCancel={handleCancelForUnit}
        width="60vw"
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
        <div style={{ width: "60vw", height: "63vh", paddingBottom: "30px" }}>
          <ByUnitChart
            locationData={locationData}
            setFilterQuery={setFilterQuery}
          />
        </div>
      </Modal>

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForStatus}
        onOk={handleOkForStatus}
        onCancel={handleCancelForStatus}
        width="60vw"
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
        <div style={{ width: "60vw", height: "63vh", paddingBottom: "30px" }}>
          <ByStatusChart
            statusData={statusData}
            setFilterQuery={setFilterQuery}
            filterQuery={filterQuery}
            entity={entity}
            location={location}
            locationId={locationId}
            entityId={entityId}
            name={name}
            activeTab={activeTab}
          />
        </div>
      </Modal>

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForType}
        onOk={handleOkForType}
        onCancel={handleCancelForType}
        width="60vw"
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
        <div style={{ width: "60vw", height: "63vh", paddingBottom: "30px" }}>
          <ByTypeChart
            typeData={typeData}
            setFilterQuery={setFilterQuery}
            entity={entity}
            location={location}
            locationId={locationId}
            entityId={entityId}
            name={name}
            activeTab={activeTab}
            isModalOpenForTypeChart={isModalOpenForTypeChart}
          />
        </div>
      </Modal>

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForSystem}
        onOk={handleOkForSystem}
        onCancel={handleCancelForSystem}
        width="60vw"
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
        <div style={{ width: "60vw", height: "63vh", paddingBottom: "30px" }}>
          <BySystemChart
            systemData={systemData}
            setFilterQuery={setFilterQuery}
            entity={entity}
            location={location}
            locationId={locationId}
            entityId={entityId}
            name={name}
            activeTab={activeTab}
          />
        </div>
      </Modal>

      {activeTab > 1 && activeTab <= 7 && (
        <Paper
          elevation={0}
          style={{
            // display: "flex",
            // justifyContent: "center",
            marginTop: "15px",
            width: "100%",
            height: "330px",
            // border: "1px solid #d7cdc1",
            borderRadius: "5px",
            // padding: "5px 0px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              marginRight: "20px",
            }}
          >
            <Button
              type="primary"
              onClick={handleExport}
              icon={<AiOutlineFileExcel />}
            >
              Download Excel
            </Button>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              // flexDirection: "column",
              // alignItems: "center",
              margin: "10px 0px",
              backgroundColor: "white",
              // padding: "5px 5px",
            }}
            className={classes.tableContainer}
          >
            <Table
              columns={columns}
              dataSource={monthData}
              className={`${classes.documentTable} ${classes.centerAlignedCell}`}
              // scroll={{ x: "max-content", y: 160 }}
              // Any additional props or event handlers here
            />
            {/* <div style={{ marginLeft: "15px" }}>
              <Tooltip title="Click to Download Excel">
                <AiOutlineFileExcel
                  onClick={handleExport}
                  style={{ fontSize: "20px", marginTop: "5px" }}
                />
              </Tooltip>
            </div> */}
          </div>
        </Paper>
      )}

      {/* // chart modals */}

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForTable}
        onOk={handleOkForTable}
        onCancel={handleCancelForTable}
        width="90vw"
        style={{ display: "flex", justifyContent: "center" }}
        footer={null}
        zIndex={2000}
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
          style={{ width: "85vw", height: "60vh", marginTop: "30px" }}
          className={classes.tableContainer}
        >
          <Table
            columns={columns}
            dataSource={monthData}
            className={`${classes.documentTable} ${classes.centerAlignedCell}`}
            // Any additional props or event handlers here
          />
        </div>
      </Modal>

      {activeTab > 14 && (
        <Paper
          elevation={0}
          style={{
            // display: "flex",
            // justifyContent: "center",
            marginTop: "15px",
            width: "100%",
            height: "330px",
            // border: "1px solid #d7cdc1",
            borderRadius: "5px",
          }}
        >
          <div
            style={{
              margin: "10px 0px",
              // border: "1px solid black",
              backgroundColor: "white",
              padding: "0px 0px",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                marginRight: "20px",
              }}
            >
              <Button
                type="primary"
                onClick={exportToExcel}
                icon={<AiOutlineFileExcel />}
              >
                Download Excel
              </Button>
            </div>
            {/* <div> */}
            <InWorkFlowTable
              deptData={departmentTableData || []}
              activeTab={activeTab}
              deptStatusData={departmentTableData}
              filterQuery={filterQuery}
              setFilterQuery={setFilterQuery}
              inWorkFlowTable={inWorkFlowTable}
              // newData={newData}
            />
            {/* </div> */}

            {/* <div style={{ marginLeft: "15px" }}>
              <Tooltip title="Click to Download Excel">
                <AiOutlineFileExcel
                  onClick={exportToExcel}
                  style={{ fontSize: "20px", marginTop: "12px" }}
                />
              </Tooltip>
            </div> */}
          </div>
        </Paper>
      )}

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForInWorkFlowTable}
        onOk={handleOkForInWorkFlowTable}
        onCancel={handleCancelForInWorkFlowTable}
        width="90vw"
        style={{ display: "flex", justifyContent: "center" }}
        footer={null}
        zIndex={2000}
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
        <div style={{ width: "85vw", height: "60vh", marginTop: "30px" }}>
          <InWorkFlowTable
            deptData={departmentTableData || []}
            activeTab={activeTab}
            deptStatusData={departmentTableData}
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            inWorkFlowTable={inWorkFlowTable}
            // locationId={locationId}
            locationId={locationId}
            locationIdNew={locationId}
            // newData={newData}
          />
        </div>
      </Modal>

      {/* <Paper
        elevation={0}
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "15px",
          width: "675px ",
          border: "1px solid #d7cdc1",
          borderRadius: "5px",
          padding: "5px 10px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "10px 0px",
            backgroundColor: "white",
            padding: "5px 10px",
          }}
          className={classes.tableContainer}
        >
          <Table
            dataSource={transformedData}
            columns={columnsData}
            pagination={false}
          />
        </div>
      </Paper> */}
    </div>
  );
};

export default DocumentDashBoardCharts;
