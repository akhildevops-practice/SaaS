import React, { useEffect, useRef } from "react";

import { Chart as ChartJS } from "chart.js";
import { useMediaQuery } from "@material-ui/core";

type props = {
  chartData?: any;
  handleClickCipCost?: any;
};

const TopCipsChart = ({ chartData, handleClickCipCost }: props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const chartRef1 = useRef<any>(null);
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
        "#5E35B1",
        "#00796B",
        "#C0392B",
        "#4A6FA5",
        "#FF9E80",
        "#8BC34A",
        "#1A237E",
        "#FFD700",
      ];

      const names = chartData?.highCostWiseData?.map(
        (item: any) => item?.title
      );
      const datas = chartData?.highCostWiseData?.map((item: any) => item?.cost);

      chart = new ChartJS(ctx, {
        type: "bar",

        data: {
          labels: names,
          datasets: [
            {
              label: "set1",
              data: datas,
              backgroundColor: BackgroundColor,
              // borderColor: BorderColor,
              borderWidth: 1,
              maxBarThickness: 60,
            },
          ],
        },

        options: {
          indexAxis: matches ? "y" : "x",
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
              text: "Top 5 Cips with Status in terms of Value(Open)",
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
          onClick: (e, index) => {
            handleClickCipCost(e, index);

            // getCipCostTableData();
          },
          scales: {
            y: {
              grid: {
                drawOnChartArea: false, // removes horizontal grid lines
                drawBorder: true, // keeps the Y-axis line
                drawTicks: true, // optional: keeps Y-axis ticks
              },
              //   stacked: true,
              ticks: {
                color: "black",
                stepSize: 1,
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
                font: {
                  size: 10,
                  family: "'Poppins', sans-serif",
                },
              },
            },

            x: {
              grid: {
                drawOnChartArea: false, // removes horizontal grid lines
                drawBorder: true, // keeps the Y-axis line
                drawTicks: true, // optional: keeps Y-axis ticks
              },
              //   stacked: true,
              ticks: matches
                ? {
                    callback: function (value) {
                      return Number.isInteger(value) ? value : "";
                    },
                    color: "black",
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    font: {
                      size: 10,
                      family: "'Poppins', sans-serif",
                    },
                  }
                : {},
            },
          },

          // onClick: handleClick,
        },
      });
    }

    return () => {
      chart?.destroy();
    };
  }, [chartData, matches]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {" "}
      <canvas ref={chartRef1} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default TopCipsChart;
