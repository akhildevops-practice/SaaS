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
  chartDataForAlllocation?: any;
  setSelectedCostCipId?: any;
  showModalCharts?: any;
  setSelectedCostCipIdForAllLocation?: any;
  setSelectedCipStatus?: any;
};

const CipAllLocationGraph = ({
  chartDataForAlllocation,
  setSelectedCostCipId,
  showModalCharts,
  setSelectedCostCipIdForAllLocation,
  setSelectedCipStatus,
}: Props) => {
  const chartRef = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!chartDataForAlllocation.length) return;

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
      "#5E35B1",
      "#00796B",
      "#C0392B",
      "#4A6FA5",
      "#FF9E80",
      "#8BC34A",
      "#1A237E",
      "#FFD700",
    ];

    const labels = chartDataForAlllocation.map(
      (data: any) => data.locationName
    );

    const datasets = [
      {
        label: "Draft",
        data: chartDataForAlllocation.map((data: any) => data.draftCount),
        backgroundColor: backgroundColors[0],
        maxBarThickness: 60,
      },
      {
        label: "InReview",
        data: chartDataForAlllocation.map((data: any) => data.inReviewCount),
        backgroundColor: backgroundColors[1],
        maxBarThickness: 60,
      },
      {
        label: "InApproval",
        data: chartDataForAlllocation.map((data: any) => data.inApprovalCount),
        backgroundColor: backgroundColors[2],
        maxBarThickness: 60,
      },
      {
        label: "Approved",
        data: chartDataForAlllocation.map((data: any) => data.approvedCount),
        backgroundColor: backgroundColors[3],
        maxBarThickness: 60,
      },
      {
        label: "InProgress",
        data: chartDataForAlllocation.map((data: any) => data.inProgressCount),
        backgroundColor: backgroundColors[4],
        maxBarThickness: 60,
      },
      {
        label: "Complete",
        data: chartDataForAlllocation.map((data: any) => data.completeCount),
        backgroundColor: backgroundColors[5],
        maxBarThickness: 60,
      },
      {
        label: "InVerification",
        data: chartDataForAlllocation.map(
          (data: any) => data.inVerificationCount
        ),
        backgroundColor: backgroundColors[6],
        maxBarThickness: 60,
      },
      {
        label: "Closed",
        data: chartDataForAlllocation.map((data: any) => data.closedCount),
        backgroundColor: backgroundColors[7],
        maxBarThickness: 60,
      },
      {
        label: "Cancelled",
        data: chartDataForAlllocation.map((data: any) => data.cancelledCount),
        backgroundColor: backgroundColors[8],
        maxBarThickness: 60,
      },
      {
        label: "Dropped",
        data: chartDataForAlllocation.map((data: any) => data.droppedCount),
        backgroundColor: backgroundColors[9],
        maxBarThickness: 60,
      },
      {
        label: "Edit",
        data: chartDataForAlllocation.map((data: any) => data.editCount),
        backgroundColor: backgroundColors[10],
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
            const locationData = chartDataForAlllocation[index];
            let selectedIds: string[] = [];

            switch (selectedDatasetLabel) {
              case "Draft":
                selectedIds = locationData.draftIds;
                break;
              case "InReview":
                selectedIds = locationData.inReviewIds;
                break;
              case "InApproval":
                selectedIds = locationData.inApprovalIds;
                break;
              case "Approved":
                selectedIds = locationData.approvedIds;
                break;
              case "InProgress":
                selectedIds = locationData.inProgressIds;
                break;
              case "Complete":
                selectedIds = locationData.completeIds;
                break;
              case "InVerification":
                selectedIds = locationData.inVerificationIds;
                break;
              case "Closed":
                selectedIds = locationData.closedIds;
                break;
              case "Cancelled":
                selectedIds = locationData.cancelledIds;
                break;
              case "Dropped":
                selectedIds = locationData.droppedIds;
                break;
              case "Edit":
                selectedIds = locationData.editIds;
                break;
              default:
                break;
            }

            // Update the state if IDs are found
            setSelectedCipStatus("");
            setSelectedCostCipIdForAllLocation(selectedIds);
            showModalCharts();
            // showModalCharts();
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              drawOnChartArea: false, // removes horizontal grid lines
              drawBorder: true, // keeps the Y-axis line
              drawTicks: true, // optional: keeps Y-axis ticks
            },
            ticks: {
              color: "black",
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: {
              drawOnChartArea: false, // removes horizontal grid lines
              drawBorder: true, // keeps the Y-axis line
              drawTicks: true, // optional: keeps Y-axis ticks
            },
            ticks: {
              color: "black",
              // Adjust step size to control tick interval
              maxTicksLimit: 6,
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
            align: "start",
            text: "Unit-wise Status Count",
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
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartDataForAlllocation]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default CipAllLocationGraph;
