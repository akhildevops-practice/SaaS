import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip as ChartTooltip,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
} from "chart.js";

ChartJS.register(
  Title,
  ChartTooltip,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend
);

type props = {
  setSelectedCapaIds?: any;
  showModalCharts?: any;
  newChartData?: any;
};

const CapaforAllDepatmentFilterChart = ({
  setSelectedCapaIds,
  showModalCharts,
  newChartData,
}: props) => {
  const chartRef = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (newChartData.length === 0) {
      return;
    }

    const backgroundColors = [
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

    const labels = newChartData.map((data: any) => data.deptName);
    const datasets = [
      // {
      //   label: "Grand Total",
      //   data: newChartData.map((data: any) => data.totalCount),
      //   backgroundColor: backgroundColors[0],
      //   yAxisID: "y",
      // },
      {
        label: "Completed",
        data: newChartData.map((data: any) => data.completedCount),
        backgroundColor: backgroundColors[0],
        yAxisID: "y",
        borderWidth: 1,
        maxBarThickness: 60,
      },

      {
        label: "Pending",
        data: newChartData.map((data: any) => data.pendingCount),
        backgroundColor: backgroundColors[1],
        yAxisID: "y",
        borderWidth: 1,
        maxBarThickness: 60,
      },
      {
        label: "Sum of WIP",
        data: newChartData.map((data: any) => data.wipCount),
        backgroundColor: backgroundColors[2],
        yAxisID: "y",
        borderWidth: 1,
        maxBarThickness: 60,
      },
      {
        label: "Rejected",
        data: newChartData.map((data: any) => data.rejectedCount),
        backgroundColor: backgroundColors[4],
        yAxisID: "y",
        borderWidth: 1,
        maxBarThickness: 60,
      },
    ];

    chartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels, // deptName as x-axis labels
        datasets, // datasets remain the same
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
              drawOnChartArea: false,
              drawBorder: true,
              drawTicks: true,
            },
            ticks: {
              stepSize: 5,
              maxTicksLimit: 6,
              callback: function (value) {
                return Number(value).toFixed(0);
              },
            },
          },
        },
        plugins: {
          datalabels: {
            color: "white",
            font: {
              size: 14,
            },
            display: (context) => {
              // Show labels only for non-zero values
              const value = context.dataset.data[context.dataIndex];
              return value !== 0;
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
            align: "start",
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
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": " + context.parsed.y;
                }
                return label;
              },
            },
          },
        },
        onClick: (e, activeElements) => {
          if (activeElements.length > 0) {
            const datasetIndex = activeElements[0].datasetIndex;
            const index = activeElements[0].index;
            let ids = [];
            switch (datasets[datasetIndex].label) {
              case "Completed":
                ids = newChartData[index].completedIds;
                break;
              case "Pending":
                ids = newChartData[index].pendingIds;
                break;
              case "Sum of WIP":
                ids = newChartData[index].wipIds;
                break;
              case "Rejected":
                ids = newChartData[index].rejectedIds;
                break;
              default:
                ids = [];
            }
            setSelectedCapaIds(ids);
            showModalCharts();
          }
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [newChartData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default CapaforAllDepatmentFilterChart;
