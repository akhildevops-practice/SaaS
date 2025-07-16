import React, { useEffect, useRef } from "react";
import { Chart as ChartJS } from "chart.js";
import { Tag } from "antd";
import { useMediaQuery } from "@material-ui/core";

type props = {
  selected?: any;
  monthlyTableData?: any;
  quaterTableData?: any;
  dayTableData?: any;
  yearlyTableData?: any;
};

const PerformanceSummaryChart = ({
  selected,
  monthlyTableData,
  quaterTableData,
  dayTableData,
  yearlyTableData,
}: props) => {
  const smallScreen = useMediaQuery("(min-width:450px)");
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

  const chartRef2 = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef2?.current?.getContext("2d");

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels: any = [];
    const datas: any = [];

    if (selected === "Year" && yearlyTableData) {
      yearlyTableData.forEach((item: any) => {
        if (item.sum && item.sum.length > 0) {
          const totalEfficiency = item.sum.reduce(
            (acc: number, curr: any) => acc + (curr.avgEfficiency || 0),
            0
          );
          const avgEfficiency = totalEfficiency / item.sum.length;

          labels.push(item.kpi);
          datas.push(Number(avgEfficiency.toFixed(2)));
        }
      });
    }

    if (selected === "Month" && monthlyTableData?.length) {
      monthlyTableData.forEach((item: any) => {
        const monthData = item.kpidatamonthwise;
        if (monthData && monthData.length > 0) {
          const total = monthData.reduce(
            (acc: number, curr: any) => acc + (curr.percentage || 0),
            0
          );
          const average = total / monthData.length;
          labels.push(item.kpi);
          datas.push(Number(average.toFixed(2)));
        }
      });
    }

    if (selected === "Day" && dayTableData?.length) {
      dayTableData.forEach((item: any) => {
        const dayData = item.kpidata;
        if (dayData && dayData.length > 0) {
          const total = dayData.reduce(
            (acc: number, curr: any) => acc + (curr.percentage || 0),
            0
          );
          const average = total / dayData.length;
          labels.push(item.kpi);
          datas.push(Number(average.toFixed(2)));
        }
      });
    }

    if (selected === "Quarter" && quaterTableData?.length) {
      quaterTableData.forEach((item: any) => {
        const quarterData = item.kpidata;
        if (quarterData && quarterData.length > 0) {
          const totalEfficiency = quarterData.reduce(
            (acc: number, curr: any) => acc + (curr.avgEfficiency || 0),
            0
          );
          const avgEfficiency = totalEfficiency / quarterData.length;
          labels.push(item.kpi);
          datas.push(Number(avgEfficiency.toFixed(2)));
        }
      });
    }

    chartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "",
            data: datas,
            backgroundColor: BackgroundColor,
            borderWidth: 1,
            maxBarThickness: 60,
          },
        ],
      },
      options: {
        responsive: true,
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
            text: `KPI Performance Summary`,
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
        scales: {
          y: {
            grid: {
              drawOnChartArea: false, // removes horizontal grid lines
              drawBorder: true, // keeps the Y-axis line
              drawTicks: true, // optional: keeps Y-axis ticks
            },
            ticks: {
              stepSize: 5, // Adjust step size to control tick interval
              maxTicksLimit: 6,
              callback: function (value) {
                // Round the value to remove decimals and return the integer value
                return Number(value).toFixed(0); // Removes decimals by rounding the number
              },
            },
            title: {
              display: true,
              text: "Percentage",
            },
          },
          x: {
            grid: {
              drawOnChartArea: false, // removes vertical grid lines
              drawBorder: true, // keeps the X-axis line
              drawTicks: true, // optional: keeps X-axis ticks
            },
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0,
              font: {
                size: 10,
                family: "'Poppins', sans-serif",
              },
            },
          },
        },
        // onClick: (event, elements) => {
        //   if (elements.length > 0) {
        //     const index = elements[0].index;
        //     const selectedCapaIds = causeChartData?.[index]?.capaIds || [];
        //     setSelectedCapaIds(selectedCapaIds);
        //     showModalCharts(); // optionally show modal if needed
        //   }
        // },
      },
    });

    // Cleanup function to destroy chart instance
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [
    selected,
    monthlyTableData,
    quaterTableData,
    dayTableData,
    yearlyTableData,
  ]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef2} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default PerformanceSummaryChart;
