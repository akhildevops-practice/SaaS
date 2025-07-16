import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Alignment, Position, Axis, ChartType } from "../../utils/enums";
import { useStyles } from "./styles";
import { useMediaQuery } from "@material-ui/core";

/**
 * @description Chart js register option
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type Props = {
  chartType: ChartType;
  chartData: any;
  axis?: Axis;
  displayTitle?: boolean;
  title?: string;
  legendsAlignment?: Alignment;
  legendsPosition?: Position;
  isStacked?: boolean;
  isOverlap?: boolean;
  handleChartDataClick: any;
  searchTitle?: string;
  removeDataLabels?: any;
  performanceByTimeSeries?: any;
};

/**
 * @description A functional component which generates a pie or bar chart
 * @param chartType {ChartType}
 * @param ChartData {any}
 * @param axis {Axis}
 * @param displayTitle {boolean}
 * @param title {string}
 * @param legendsAlignment {Alignment}
 * @param legendsPosition {Position}
 * @param isStacked {boolean}
 * @returns a react node which consists of a chart generated via chart js (Bar chart or Pie chart)
 */
const ReportGraphComponent = ({
  chartType,
  chartData,
  axis = Axis.VERTICAL,
  displayTitle = false,
  title,
  legendsAlignment = Alignment.CENTER,
  legendsPosition = Position.BOTTOM,
  isStacked = false,
  isOverlap = false,
  handleChartDataClick,
  searchTitle,
  removeDataLabels = false,
  performanceByTimeSeries,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles();

  /**
   * @method handleClick
   * @description Function which is invoked when a graph section is clicked
   * @param args {any}
   * @returns nothing
   */
  const handleClick = (...args: any) => {
    // console.log("Args:", args);
    if (chartType === ChartType.BAR) {
      handleChartDataClick({
        value: chartData.datasets[args[1][0].datasetIndex].label,
        location: chartData.labels[args[1][0].index],
        searchTitle: searchTitle,
        chartType: ChartType.BAR,
      });
    } else if (chartType === ChartType.LINE) {
      handleChartDataClick({
        value: chartData.datasets[args[1][0].datasetIndex].label,
        location: chartData.labels[args[1][0].index],
        searchTitle: searchTitle,
        chartType: ChartType.LINE,
      });
    } else {
      handleChartDataClick({
        value: chartData.labels[args[1][0].index],
        searchTitle: searchTitle,
        chartType: ChartType.PIE,
      });
    }
  };
  // console.log("ChartData:", chartData.datasets);
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        left: matches ? 30 : 5,
        right: matches ? 30 : 5,
        bottom: 20,
      },
    },
    plugins: {
      legend: {
        align: "start" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
          padding: 10,
          font: {
            weight: "400",
          },
        },
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 13,
          weight: "600",
        },
      },
    },
    onClick: handleClick,
  };

  const barOptionsX = {
    responsive: true,
    indexAxis: `${axis}` as const,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 5,
        left: 5,
        right: 5,
        bottom: 5,
      },
    },
    plugins: {
      datalabels: {
        // display: removeDataLabels ? false : true,
        display: false,
        color: "white", // Change the color of data labels
        font: {
          size: 14, // Increase the size of data labels
        },
      },
      legend: {
        align: `${legendsAlignment}` as const,

        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
          padding: 10,
          font: {
            weight: "600",
            // color: "dark blue",
          },
        },
        position: `${legendsPosition}` as const,
      },
      title: {
        display: displayTitle,
        align: "start",
        text: title,
        font: {
          size: 14,
          weight: "600",
          family: "'Poppins', sans-serif", // Change the font family here
        },
        color: "Black",
        padding: {
          top: 10,
          bottom: 30,
        },
      },
    },
    scales: {
      x: {
        stacked:
          title === "Target Vs Actual VS Average Stack bar chart"
            ? true
            : isStacked,
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        stacked: isOverlap ? false : isStacked,
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: (value: any) => value.toString(), // Remove comma from y-axis ticks
        },
      },
    },
    // onClick: handleClick,
    animation: {
      onComplete: () => {
        delayed = true;
      },
      delay: (context: any) => {
        let delay = 0;
        if (context.type === "data" && context.mode === "default" && !delayed) {
          delay = context.dataIndex * 300 + context.datasetIndex * 100;
        }
        return delay;
      },
    },
  };

  const barOptionsY = {
    responsive: true,
    indexAxis: `${axis}` as const,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        left: matches ? 30 : 5,
        right: matches ? 30 : 5,
        bottom: 20,
      },
    },
    plugins: {
      datalabels: {
        // display: removeDataLabels ? false : true,
        display: false,
        color: "white", // Change the color of data labels
        font: {
          size: 14, // Increase the size of data labels
        },
      },
      legend: {
        align: `${legendsAlignment}` as const,

        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
          padding: 10,
          font: {
            weight: "400",
          },
        },
        position: `${legendsPosition}` as const,
      },
      title: {
        display: displayTitle,
        text: title,
        font: {
          size: 13,
          weight: "600",
        },
      },
    },
    scales: {
      x: {
        stacked: isStacked,
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        stacked: isStacked,

        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: (value: any) => value.toString(),
          // maxRotation: 35,
          // minRotation: 35,
        },
      },
    },
    // onClick: handleClick,
  };

  const lineOptionsX = {
    responsive: true,
    indexAxis: `${axis}` as const,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 5,
        left: 5,
        right: 5,
        bottom: 5,
      },
    },
    plugins: {
      datalabels: {
        // display: removeDataLabels ? false : true,
        display: false,
        color: "white", // Change the color of data labels
        font: {
          size: 14, // Increase the size of data labels
        },
      },
      legend: {
        display: performanceByTimeSeries === false ? false : true,
        align: `${legendsAlignment}` as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
          padding: 10,
          font: {
            weight: "400",
          },
        },
        position: `${legendsPosition}` as const,
      },
      // title: {
      //   display: displayTitle,
      //   align: "start",
      //   text: title,
      //   font: {
      //     size: 14,
      //     weight: "600",
      //     family: "'Poppins', sans-serif", // Change the font family here
      //   },
      //   color: "Black",
      //   padding: {
      //     top: 10,
      //     bottom: 30,
      //   },
      // },
    },

    scales: {
      x: {
        stacked: isStacked,
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        stacked: isStacked,
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: function (value: any) {
            return Number(value).toFixed(0); // Convert value to integer
          },
        },
      },
    },
    // onClick: handleClick,
    animation: {
      onComplete: () => {
        delayed = true;
      },
      delay: (context: any) => {
        let delay = 0;
        if (context.type === "data" && context.mode === "default" && !delayed) {
          delay = context.dataIndex * 300 + context.datasetIndex * 100;
        }
        return delay;
      },
    },
  };

  const lineOptionsY = {
    responsive: true,
    indexAxis: `${axis}` as const,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        left: matches ? 30 : 5,
        right: matches ? 30 : 5,
        bottom: 20,
      },
    },
    plugins: {
      datalabels: {
        // display: removeDataLabels ? false : true,
        display: false,
        color: "white", // Change the color of data labels
        font: {
          size: 14, // Increase the size of data labels
        },
      },
      legend: {
        display: performanceByTimeSeries === false ? false : true,
        align: `${legendsAlignment}` as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
          padding: 10,
          font: {
            weight: "400",
          },
        },
        position: `${legendsPosition}` as const,
      },
      // title: {
      //   display: displayTitle,
      //   text: title,
      //   //  align: "start",
      //   font: {
      //     size: 14,
      //     weight: "600",
      //     family: "'Poppins', sans-serif", // Change the font family here
      //   },
      //   padding: {
      //     top: 10,
      //     bottom: 30,
      //   },
      // },
      //  title: {
      //   display: displayTitle,
      //   align: "start",
      //   text: title,
      //   font: {
      //     size: 14,
      //     weight: "600",
      //     family: "'Poppins', sans-serif", // Change the font family here
      //   },
      //   color: "Black",
      //   padding: {
      //     top: 10,
      //     bottom: 30,
      //   },
      // },
    },
    scales: {
      x: {
        stacked: isStacked,
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        stacked: isStacked,
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: function (value: any) {
            return Number(value).toFixed(0); // Convert value to integer
          },
        },
      },
    },
    // onClick: handleClick,
    animation: {
      onComplete: () => {
        delayed = true;
      },
      delay: (context: any) => {
        let delay = 0;
        if (context.type === "data" && context.mode === "default" && !delayed) {
          delay = context.dataIndex * 300 + context.datasetIndex * 100;
        }
        return delay;
      },
    },
  };
  let delayed: any;

  return (
    <div className={classes.graphContainer}>
      {chartType === ChartType.BAR ? (
        <Bar
          options={{
            ...(axis === Axis.VERTICAL ? barOptionsX : barOptionsY),
          }}
          data={chartData!}
        />
      ) : chartType === ChartType.PIE ? (
        <Pie options={pieOptions} data={chartData!} />
      ) : chartType === ChartType.LINE ? (
        <Line
          options={{
            ...(axis === Axis.HORIZONTAL ? lineOptionsX : lineOptionsY),
          }}
          data={chartData!}
        />
      ) : (
        "Designated chart type is not available."
      )}
    </div>
  );
};

export default ReportGraphComponent;
