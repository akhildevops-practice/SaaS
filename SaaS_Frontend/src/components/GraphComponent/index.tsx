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
import { Bar, Pie } from "react-chartjs-2";
import { Alignment, Position, Axis, ChartType } from "../../utils/enums";
import { useStyles } from "./styles";

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
  handleChartDataClick: any;
  searchTitle?: string;
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
const GraphComponent = ({
  chartType,
  chartData,
  axis = Axis.VERTICAL,
  displayTitle = false,
  title,
  legendsAlignment = Alignment.CENTER,
  legendsPosition = Position.BOTTOM,
  isStacked = false,
  handleChartDataClick,
  searchTitle,
}: Props) => {
  const classes = useStyles();

  /**
   * @method handleClick
   * @description Function which is invoked when a graph section is clicked
   * @param args {any}
   * @returns nothing
   */
  const handleClick = (...args: any) => {
    if (chartType === ChartType.BAR) {
      handleChartDataClick({
        value: chartData.datasets[args[1][0].datasetIndex].label,
        location: chartData.labels[args[1][0].index],
        searchTitle: searchTitle,
        chartType: ChartType.BAR,
      });
    } else {
      handleChartDataClick({
        value: chartData.labels[args[1][0].index],
        searchTitle: searchTitle,
        chartType: ChartType.PIE,
      });
    }
  };

  // console.log("ChartData:", chartData);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        left: 30,
        right: 30,
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
          maxRotation: 35,
          minRotation: 35,
        },
      },
      y: {
        stacked: isStacked,
      },
    },
    onClick: handleClick,
  };

  const barOptionsY = {
    responsive: true,
    indexAxis: `${axis}` as const,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        left: 30,
        right: 30,
        bottom: 20,
      },
    },
    plugins: {
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
      },
      y: {
        stacked: isStacked,
        ticks: {
          autoSkip: false,
          maxRotation: 35,
          minRotation: 35,
        },
      },
    },
    onClick: handleClick,
  };

  return (
    <div className={classes.graphContainer}>
      {chartType === ChartType.BAR ? (
        <Bar
          options={axis === Axis.VERTICAL ? barOptionsX : barOptionsY}
          data={chartData!}
        />
      ) : chartType === ChartType.PIE ? (
        // <Pie options={pieOptions} data={chartData!} />
        <Pie options={pieOptions} data={chartData!} />
      ) : (
        "Designated chart type is not available."
      )}
    </div>
  );
};

export default GraphComponent;
