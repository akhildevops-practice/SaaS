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

type Props = {
  setSelectedCapaIds?: any;
  showModalCharts?: any;
  alllocationData: any;
};

const CapaAllLocationGraph = ({
  setSelectedCapaIds,
  showModalCharts,
  alllocationData,
}: Props) => {
  const chartRef = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!alllocationData?.length) return;

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

    const labels = alllocationData?.map((data: any) => data.locationName);

    const datasets = [
      {
        label: "Pending",
        data: alllocationData?.map((data: any) => data.pendingCount),
        backgroundColor: backgroundColors[0],
        borderWidth: 1,
        maxBarThickness: 60,
      },
      {
        label: "WIP",
        data: alllocationData?.map((data: any) => data.wipCount),
        backgroundColor: backgroundColors[1],
        borderWidth: 1,
        maxBarThickness: 60,
      },
      {
        label: "Completed",
        data: alllocationData?.map((data: any) => data.completedCount),
        backgroundColor: backgroundColors[2],
        borderWidth: 1,
        maxBarThickness: 60,
      },
      {
        label: "Rejected",
        data: alllocationData?.map((data: any) => data.rejectedCount),
        backgroundColor: backgroundColors[3],
        borderWidth: 1,
        maxBarThickness: 60,
      },
    ];

    chartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels,
        datasets,
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
            beginAtZero: true,
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

        plugins: {
          datalabels: {
            color: "white", // Change the color of data labels
            font: {
              size: 14, // Increase the size of data labels
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
            callbacks: {
              label: (context: any) => {
                const value = context.raw;
                return value > 0 ? `${context.dataset.label}: ${value}` : "";
              },
            },
          },
        },
        onClick: (event: any) => {
          const points = chartInstance.current.getElementsAtEventForMode(
            event,
            "nearest",
            { intersect: true },
            false
          );

          if (points.length) {
            const { datasetIndex, index } = points[0];
            const selectedDatasetLabel =
              chartInstance.current.data.datasets[datasetIndex].label;

            // Find corresponding IDs based on the dataset label and location index
            const locationData = alllocationData[index];
            let selectedIds: string[] = [];

            switch (selectedDatasetLabel) {
              case "Pending":
                selectedIds = locationData.pendingIds;
                break;
              case "WIP":
                selectedIds = locationData.wipIds;
                break;
              case "Completed":
                selectedIds = locationData.completedIds;
                break;
              case "Rejected":
                selectedIds = locationData.rejectedIds;
                break;
              default:
                break;
            }

            // Update the state if IDs are found
            setSelectedCapaIds && setSelectedCapaIds(selectedIds);
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
  }, [alllocationData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default CapaAllLocationGraph;
