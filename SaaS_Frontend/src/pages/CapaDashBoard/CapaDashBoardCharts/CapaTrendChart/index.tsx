import React, { useEffect, useRef } from "react";

import { useMediaQuery } from "@material-ui/core";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

// Register necessary components
ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Filler, // ✅ Important for filling the area under the line
  Legend
);

type props = {
  trendChartData?: any;
  setSelectedCapaIds?: any;
  showModalCharts?: any;
};

const CapaTrendChart = ({
  trendChartData,
  setSelectedCapaIds,
  showModalCharts,
}: props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const chartRef1 = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef1.current.getContext("2d");
    let chart = null as any;

    if (ctx) {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        ctx.canvas.clientHeight || 400
      );
      gradient.addColorStop(0, "#6981D6"); // Top
      gradient.addColorStop(1, "#E7F0F9"); // Bottom

      const names = Array.isArray(trendChartData)
        ? trendChartData.map((item: any) => item?.monthName)
        : [];

      const datas = Array.isArray(trendChartData)
        ? trendChartData.map((item: any) => item?.count)
        : [];
      console.log("111", names, datas);
      chart = new ChartJS(ctx, {
        type: "line",

        data: {
          labels: names,
          datasets: [
            {
              label: "CAPA",
              data: datas,
              fill: true,
              backgroundColor: gradient, // Use the gradient here
              borderColor: "#3C42C8",
              borderWidth: 1,
              tension: 0, // Straight lines
              pointBackgroundColor: "#80b3ff",
              pointRadius: 2,
              datalabels: {
                display: false, // Hide the labels (number) at the points
              },
            },
          ],
        },

        options: {
          indexAxis: "x",
          responsive: true, // This line is added to make the graph non-responsive
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
              align: "start",
              text: "CAPA Trend",
              font: {
                size: 14,
                weight: "600",
                family: "'Poppins', sans-serif", // Change the font family here
              },
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
          onClick: (event, elements) => {
            if (!chart) return;

            const points = chart.getElementsAtEventForMode(
              event,
              "nearest",
              { intersect: true },
              false
            );

            if (points.length) {
              const firstPointIndex = points[0].index;
              const clickedData = trendChartData[firstPointIndex];

              if (clickedData?.ids && setSelectedCapaIds) {
                setSelectedCapaIds(clickedData.ids);
              }

              showModalCharts(); // open modal if needed
            }
          },
          scales: {
            y: {
              grid: {
                drawOnChartArea: false, // removes vertical grid lines
                drawBorder: true, // keeps the X-axis line
                drawTicks: true, // optional: keeps X-axis ticks
              },
              //   stacked: true,
              ticks: {
                stepSize: 5, // Adjust step size to control tick interval
                maxTicksLimit: 6,
                callback: function (value) {
                  // Round the value to remove decimals and return the integer value
                  return Number(value).toFixed(0); // Removes decimals by rounding the number
                },
              },
            },

            x: {
              grid: {
                drawOnChartArea: false,
                drawBorder: true,
                drawTicks: true,
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
          },

          // onClick: handleClick,
        },
      });
    }

    return () => {
      chart?.destroy();
    };
  }, [trendChartData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {" "}
      <canvas ref={chartRef1} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default CapaTrendChart;
