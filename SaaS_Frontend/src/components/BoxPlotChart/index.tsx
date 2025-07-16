import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  BoxPlotController,
  BoxAndWiskers,
} from "@sgratzl/chartjs-chart-boxplot";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BoxPlotController,
  BoxAndWiskers,
  Title,
  Tooltip,
  Legend
);

interface BoxPlotData {
  label: string;
  data: Array<[number, number, number]>;
  borderColor: string;
  backgroundColor: string;
}

interface ChartData {
  labels: string[];
  datasets: BoxPlotData[];
}

interface BoxPlotChartProps {
  data: ChartData;
  title: string;
}

export function BoxPlotChart({ data, title }: BoxPlotChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | undefined>(undefined);

  useEffect(() => {
    if (canvasRef.current) {
      chartRef.current = new ChartJS(canvasRef.current, {
        type: "boxplot",
        data: data,
        options: {
          // responsive: false,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              display: false,
            },
            title: {
              display: true,
              text: title,
              font: {
                size: 13,
                weight: "600",
                // family: "-apple-system",
              },

              color: "#666666",
            },

            // tooltip: {
            //   callbacks: {
            //     label: (item: any, data: any) => {
            //       const datasetIndex = item.datasetIndex;
            //       const index = item.dataIndex;
            //       const value = data.datasets[datasetIndex].data[index];

            //       return `${data.datasets[datasetIndex].label}:
            //               Min: ${value.min}, Q1: ${value.q1}, Median: ${value.median},
            //               Q3: ${value.q3}, Max: ${value.max}`;
            //     },
            //   },
            // },
            // legend: {
            //   align: "start",
            //   labels: {
            //     usePointStyle: true,
            //     pointStyle: "circle",
            //     boxWidth: 6,
            //     padding: 10,
            //     font: {
            //       weight: "400",
            //     },
            //   },
            //   position: "bottom",
            // },

            legend: {
              display: false, // Disable the legend
            },
          },

          // scales: {
          //   x: {
          //     title: {
          //       display: true,
          //       text: "Categories",
          //     },
          //   },
          //   y: {
          //     title: {
          //       display: true,
          //       text: "Values",
          //     },
          //   },
          // },
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, title]);

  return <canvas ref={canvasRef} style={{ width: "10%", height: "80%" }} />;
}
