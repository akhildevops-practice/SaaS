import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useMediaQuery } from "@material-ui/core";

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type props = {
  
};

const ResponsibleEntityChart = ({  }: props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const chartRef1 = useRef<any>(null);

  const chartData = {
    highCostWiseData: [
      { title: "Logistics", materials: 10, labor: 10 },
      { title: "Manufacturing", materials: 12, labor: 12, transport: 7 },
      { title: "Packaging", materials: 22, labor:6, },
      { title: "Supply Chain", materials: 8, labor: 10, transport: 4 },
    ],
  };

  useEffect(() => {
    const ctx = chartRef1.current.getContext("2d");
    let chart = null as any;

    if (ctx) {
      const BackgroundColor = [
        "#3C42C8",
        "#29DBD5",
        "#ED3B3E",
        "#F38943",
        "#9930DF",
        "#00A3FF",
        "#00C170",
        "#FFB400",
        "#FF61D8",
      ];

      const names = chartData?.highCostWiseData?.map((item: any) => item?.title);
      const datasetLabels = ["Materials", "Labor", "Transport"];
      const datasets = datasetLabels.map((label, idx) => ({
        label,
        data: chartData?.highCostWiseData?.map((item: any) => item[label.toLowerCase()]),
        backgroundColor: BackgroundColor[idx],
        borderWidth: 1,
        maxBarThickness: 60,
      }));

      chart = new ChartJS(ctx, {
        type: "bar",
        data: {
          labels: names,
          datasets,
        },
        options: {
          indexAxis: "x",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: "white",
              font: {
                size: 14,
              },
            },
            legend: {
              display: true,
              position: "bottom",
            },
            title: {
              display: true,
              text: "By Responsible Enitity",
              font: {
                size: 14,
                weight: "600",
                family: "'Poppins', sans-serif",
              },
              align:"start",
              color: "black",
              padding: {
                top: 10,
                bottom: 30,
              },
            },
            tooltip: {
              enabled: true,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderColor: "#fff",
              borderWidth: 1,
              titleFont: {
                size: 16,
                weight: "bold",
              },
              bodyFont: {
                size: 14,
              },
              padding: 10,
            },
          },
        //   onClick: (e, index) => {
        //     handleClickCipCost(e, index);
        //   },
          scales: {
            x: {
              stacked: true,
              grid: {
                drawOnChartArea: false, // removes vertical grid lines
                drawBorder: true, // keeps the X-axis line
                drawTicks: true, // optional: keeps X-axis ticks
              },
              ticks: {
                color: "#4d4d4d",
                font: {
                  size: 12,
                  weight: "bold",
                  family: "Poppins",
                },
              },
            },
            y: {
              stacked: true,
              grid: {
                drawOnChartArea: false, // removes vertical grid lines
                drawBorder: true, // keeps the X-axis line
                drawTicks: true, // optional: keeps X-axis ticks
              },
              ticks: {
                stepSize: 5, // Adjust step size to control tick interval
                maxTicksLimit: 6,
                callback: function (value) {
                    // Round the value to remove decimals and return the integer value
                    return Number(value).toFixed(0); // Removes decimals by rounding the number
                  },
              },
            },
          },
        },
      });
    }

    return () => {
      chart?.destroy();
    };
  }, [chartData, matches]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef1} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default ResponsibleEntityChart;
