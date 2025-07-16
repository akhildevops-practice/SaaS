import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  ChartDataset,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import styles from "./styles";
import { useMediaQuery } from "@material-ui/core";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Custom type for mixed datasets
type MixedChartDataset = ChartDataset<"bar" | "line", (any | null)[]>;

// Utility function to convert month numbers to month names
const convertMonthNumberToName = (
  monthNumber: number,
  yearFormat: string
): string => {
  if (yearFormat === "Jan - Dec") {
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
    return months[monthNumber] || "Unknown";
  } else {
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
    return months[monthNumber] || "Unknown";
  }
};

type Props = {
  newKPIChartData?: any;
};

const CustomLegend = ({ chart }: any) => {
  return (
    <ul
      style={{
        listStyle: "none",
        display: "flex",
        justifyContent: "center",
        width: "90%",
        // overflowX: "auto",
        flexWrap: "wrap",
      }}
    >
      {chart.datasets.map((dataset: any, index: number) => (
        <li
          key={index}
          style={{ margin: "0 10px", display: "flex", alignItems: "center" }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: dataset.backgroundColor,
              borderRadius: index < 3 ? "0%" : "50%", // Square for first 3, round for the rest
              marginRight: "5px",
            }}
          ></div>
          <span>{dataset.label}</span>
        </li>
      ))}
    </ul>
  );
};

const SummaryChartKPI = ({ newKPIChartData }: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = styles();

  if (
    !newKPIChartData ||
    !newKPIChartData.yearWiseData ||
    !newKPIChartData.kpidatamonthwise
  ) {
    return <div>Please Select KPI.</div>;
  }

  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  console.log("userDetail", userDetail);
  const yearFormat = userDetail.organization?.fiscalYearFormat || "Jan - Dec";

  const yearWiseData = newKPIChartData.yearWiseData;
  const monthWiseData = newKPIChartData.kpidatamonthwise;
  const displayType = newKPIChartData.displayType;
  const kpitype = newKPIChartData.kpitype;

  const dataForRange = yearWiseData
    .map((item: any) => {
      if (kpitype === "Range") {
        if (displayType === "AVERAGE") {
          return item.targetAverage !== null &&
            item.averageMinimumTarget !== null
            ? [
                // parseFloat(item.averageMinimumTarget), // No need for .toFixed
                // parseFloat(item.targetAverage), // No need for .toFixed
                parseFloat(item.averageMinimumTarget?.toFixed(2)),
                parseFloat(item.targetAverage?.toFixed(2)),
              ]
            : null;
        } else if (displayType === "SUM") {
          return item.totalQuarterTarget !== null &&
            item.totalMinimumTarget !== null
            ? [
                parseFloat(item.totalMinimumTarget?.toFixed(2)), // No need for .toFixed
                parseFloat(item.totalQuarterTarget?.toFixed(2)), // No need for .toFixed
              ]
            : null;
        }
      } else {
        return item.totalQuarterTarget !== null
          ? parseFloat(
              displayType === "SUM"
                ? item.totalQuarterTarget
                : item.targetAverage
            )
          : null;
      }
      return null;
    })
    .filter((item: any) => item !== null);

  const initialRangeData = Array(yearWiseData.length).fill(null);

  const dataForRange2 = [
    ...initialRangeData,
    ...monthWiseData.map((item: any) => {
      if (kpitype === "Range") {
        return item.monthlyMinimumTarget !== null && item.monthlyTarget !== null
          ? [
              parseFloat(item.monthlyMinimumTarget.toFixed(2)), // No need for .toFixed
              parseFloat(item.monthlyTarget.toFixed(2)), // No need for .toFixed
            ]
          : null;
      }
    }),
    // .filter((item: any) => item !== null),
  ];

  const datasets: MixedChartDataset[] = [
    {
      type: "bar",
      label: displayType === "SUM" ? "P & B(Sum)" : "P & B(Average)",
      data:
        displayType === "Range"
          ? dataForRange.map((d: any) => (d && d.y) || null)
          : [...dataForRange, ...Array(monthWiseData.length).fill(null)],
      backgroundColor: "#40bf80",
      borderColor: "#40bf80",
      borderWidth: 1,
      datalabels: {
        color: "black",
        rotation: -90,
        font: {
          size: 14,
        },
        anchor: "end",
        align: "end",
        offset: 0,
        formatter: (value: any) => (isNaN(value) ? "" : value),
      },
    },
    {
      type: "bar",
      label: "OP",
      // data: [
      //   ...yearWiseData
      //     .map((item: any) => item.totalOperationalTarget)
      //     .toFixed(2),
      //   ...Array(monthWiseData.length).fill(null),
      // ],
      data: [
        ...yearWiseData.map((item: any) =>
          item.totalOperationalTarget !== null
            ? parseFloat(item.totalOperationalTarget).toFixed(2)
            : null
        ),
        ...Array(monthWiseData.length).fill(null),
      ],
      backgroundColor: "#006bb3",
      borderColor: "#006bb3",
      borderWidth: 1,
      datalabels: {
        color: "black",
        rotation: -90,
        font: {
          size: 14,
        },
        anchor: "end",
        align: "end",
        offset: 0,
        formatter: (value: any) => (isNaN(value) ? "" : value),
      },
    },
    {
      type: "bar",
      label: displayType === "SUM" ? "Actual(Sum)" : "Actual(Average)",
      data: [
        ...yearWiseData.map((item: any) =>
          item.totalQuarterSum !== null
            ? parseFloat(
                displayType === "SUM"
                  ? item.totalQuarterSum
                  : item.averageQuarterAverage
              ).toFixed(2)
            : null
        ),
        ...Array(monthWiseData.length).fill(null),
      ],
      backgroundColor: "#ff003c",
      borderColor: "#ff003c",
      borderWidth: 1,
      datalabels: {
        color: "black",
        rotation: -90,
        font: {
          size: 14,
        },
        anchor: "end",
        align: "end",
        offset: 0,
        formatter: (value: any) => (isNaN(value) ? "" : value),
      },
    },
    {
      type: kpitype === "Range" ? "bar" : "line",
      label: "P & B",

      data:
        kpitype === "Range"
          ? dataForRange2
          : [
              ...Array(yearWiseData.length).fill(null),
              ...monthWiseData.map((item: any) =>
                item.monthlyTarget !== null
                  ? parseFloat(item.monthlyTarget).toFixed(2)
                  : null
              ),
            ],
      backgroundColor: "#40bf80",
      borderColor: "#40bf80",
      fill: false,
      datalabels: {
        color: "green",
        font: {
          size: 14,
        },
        anchor: "end",
        align: "end",
        offset: 0,
      },
    },
    {
      type: "line",
      label: "OP",

      data: [
        ...Array(yearWiseData.length).fill(null),
        ...monthWiseData.map((item: any) =>
          item.monthlyOperationalTarget !== null
            ? parseFloat(item.monthlyOperationalTarget).toFixed(2)
            : null
        ),
      ],
      backgroundColor: "#006bb3",
      borderColor: "#006bb3",
      fill: false,
      datalabels: {
        color: "blue",
        font: {
          size: 14,
        },
        anchor: "end",
        align: "end",
        offset: 0,
      },
    },
    {
      type: "line",
      label: "Actual",

      data: [
        ...Array(yearWiseData.length).fill(null),
        ...monthWiseData.map((item: any) =>
          item.monthlySum !== null
            ? parseFloat(item.monthlySum).toFixed(2)
            : null
        ),
      ],
      backgroundColor: "#ff003c",
      borderColor: "#ff003c",
      fill: false,
      datalabels: {
        color: "red",
        font: {
          size: 14,
        },
        anchor: "end",
        align: "end",
        offset: -40,
      },
    },
  ];

  const labels = [
    ...yearWiseData.map((item: any) => item.kpiYear),
    ...monthWiseData.map((item: any) =>
      convertMonthNumberToName(item.kpiMonthYear, yearFormat)
    ),
  ];

  const data: ChartData<"bar" | "line"> = {
    labels,
    datasets,
  };

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 50, // Increase padding at the top to ensure visibility of top labels
      },
    },
    plugins: {
      legend: {
        // position: "bottom",
        display: false,
      },

      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        width: matches ? "100%" : "98%",
        height: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "88%",
        }}
      >
        <Chart
          type="bar"
          data={data}
          options={options}
          // style={{ marginTop: matches ? "50px" : "20px" }}
        />
      </div>

      <CustomLegend chart={data} />
      {/* <div
        style={{
          width: "100%",
          marginTop: "30px",
          overflowX: matches ? "hidden" : "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #e6e6e6",
          }}
        >
          <thead
            style={{
              textAlign: "center",
              backgroundColor: "#E8F3F9",
              border: "2px solid #e6e6e6",
              color: "#003059",
            }}
          >
            <tr>
              <th>Dataset</th>
              {labels.map((label, index) => (
                <th key={index} style={{ padding: "8px" }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ textAlign: "center", border: "2px solid #e6e6e6" }}>
            {datasets.map((dataset, index) => (
              <tr
                key={index}
                style={{ border: "2px solid #e6e6e6", padding: "5px" }}
              >
                <td style={{ border: "2px solid #e6e6e6", padding: "5px" }}>
                  {dataset.label}
                </td>
                {labels.map((label, labelIndex) => (
                  <td
                    key={labelIndex}
                    style={{ border: "2px solid #e6e6e6", padding: "5px" }}
                  >
                  

                    {Array.isArray(dataset.data[labelIndex])
                      ? dataset.data[labelIndex]
                          .map((value: any) => (isNaN(value) ? "-" : value))
                          .join("-")
                      : isNaN(dataset.data[labelIndex])
                      ? "-"
                      : dataset.data[labelIndex]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default SummaryChartKPI;
