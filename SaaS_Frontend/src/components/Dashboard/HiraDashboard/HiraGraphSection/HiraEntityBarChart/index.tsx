import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip as ChartTooltip,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { useMediaQuery } from "@material-ui/core";

// Register components
ChartJS.register(
  Title,
  ChartTooltip,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale
);

type Props = {
  entityData: any;
  setTableFilters?: (filters: any) => void;
  isModalView?: boolean;
};

const HiraEntityBarChart = ({
  entityData,
  setTableFilters,
  isModalView = false,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const chartContext = chartRef.current?.getContext("2d");
    if (!chartContext || !entityData?.length) return;

    const labels = entityData.map(
      (d: any) =>
        `${d.entityName || d.entityId} (${d.locationId || 'N/A'})`
    );
    
    const values = entityData.map((d: any) => d.count);
    const entityIds = entityData.map((d: any) => d.entityId);

    const barColors = [
      "#A0C4FF", "#BDB2FF", "#FFC6FF", "#FDFFB6", "#CAFFBF",
      "#9BF6FF", "#B9FBC0", "#FFADAD", "#FFD6A5", "#E7C6FF",
      "#FDCB9E", "#C1FBA4", "#D0F4DE", "#A9DEF9", "#E4C1F9",
      "#D8E2DC", "#FFDAC1", "#FF9AA2", "#E2F0CB", "#B5EAD7"
    ];
    const colors = labels.map((_: any, i: any) => barColors[i % barColors.length]);


    const chartInstance: any = new ChartJS(chartContext, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: "#fff",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "x",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Approved HIRA Count by Department",
            font: {
              size: 18,
              family: "'Poppins', sans-serif",
            },
            color: "black",
          },
          tooltip: {
            callbacks: {
              label: (context) => `Count: ${context.raw}`,
            },
          },
        },
        onClick: (event: any, elements: any) => {
          if (elements.length > 0 && setTableFilters) {
            const index = elements[0].index;
            const clickedEntityId = chartInstance.entityIds[index];
            // console.log("Clicked Entity ID:", clickedEntityId);
            setTableFilters({ entity: clickedEntityId });
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "HIRA Count",
            },
            ticks: { stepSize: 1 },
            grid: { display: false },
          },
          x: {
            title: {
              display: true,
              text: "Departments",
            },
            ticks: {
              autoSkip: false,
              maxRotation: 60,
              minRotation: 30,
            },
            grid: { display: false },
          },
        },
      },
    });

    // Attach entity IDs to the chart instance
    chartInstance.entityIds = entityIds;

    return () => chartInstance.destroy();
  }, [entityData, setTableFilters]);

  return (
    <div style={{ width: "100%" }}>
      {matches && (
        <div
          style={{ marginBottom: "10px", textAlign: "center", fontWeight: 500 }}
        >
          <span>Dept-wise HIRA</span>
        </div>
      )}
      <div style={{ height: "310px", position: "relative", width: "100%" }}>
        <canvas
          ref={chartRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "90%",
            height: "310px",
          }}
        />
      </div>
    </div>
  );
};

export default HiraEntityBarChart;
