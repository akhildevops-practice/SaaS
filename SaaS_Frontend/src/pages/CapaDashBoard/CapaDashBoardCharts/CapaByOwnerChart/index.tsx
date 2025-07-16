import React, { useEffect, useRef } from "react";
import { Chart as ChartJS } from "chart.js";
import { Tag } from "antd";
import { useMediaQuery } from "@material-ui/core";

type props = {
  ownerChartData?: any;
  showModalCharts?: any;
  setSelectedCapaIds?: any;
};

const CapaByOwnerChart = ({
  ownerChartData,
  showModalCharts,
  setSelectedCapaIds,
}: props) => {
  const smallScreen = useMediaQuery("(min-width:450px)");
  const chartRef4 = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef4.current.getContext("2d");

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = Array.isArray(ownerChartData)
      ? ownerChartData.map((value: any) => value?.coordinatorName)
      : [];

    const data = Array.isArray(ownerChartData)
      ? ownerChartData.map((value: any) => value?.count)
      : [];

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

    const backgroundColors = [...BackgroundColor]; // Using predefined colors initially

    // If the number of data points exceeds the number of predefined colors,
    // generate additional random colors
    if (data.length > BackgroundColor.length) {
      const remainingColorsCount = data.length - BackgroundColor.length;
      for (let i = 0; i < remainingColorsCount; i++) {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(
          16
        )}`;
        backgroundColors.push(randomColor);
      }
    }

    chartInstance.current = new ChartJS(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            label: "",
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: "white",
            font: {
              size: 14,
              family: "Poppins",
            },
          },
          legend: {
            display: true,
            position: "right",
            labels: {
              color: "black",
              font: {
                size: 12,
                weight: "normal",
              },
              usePointStyle: true,
              pointStyle: "circle", // 👈 This makes the legend symbol a circle
            },
          },
          title: {
            display: true,
            align: "start",
            text: `By Owner`,
            font: {
              size: 14,
              weight: "600",
              family: "'Poppins', sans-serif",
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
              size: 16,
              weight: "bold",
              family: "Poppins",
            },
            bodyFont: {
              size: 14,
              weight: "normal",
            },
            padding: 10,
          },
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const selectedIds = ownerChartData[index]?.ids || [];
            setSelectedCapaIds(selectedIds);

            showModalCharts(); // Optional: trigger modal if required
          }
        },
      },
    });

    // Cleanup function to destroy chart instance
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [ownerChartData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* {smallScreen ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Tag color="cyan">{`Unit: ${
            location.find((value: any) => value?.id === locationId)
              ?.locationName || ""
          }`}</Tag>
          {[1, 3, 5, 7, 9, 16].includes(activeTab) ? (
            <Tag color="gold">Dept: All</Tag>
          ) : (
            !locationId?.includes("All") && (
              <Tag color="gold">{`Dept: ${
                // entity.find((value: any) => entityId.includes(value?.id))
                //   ?.entityName || ""
                entityId
                  .map((value: any) => {
                    const entityData = entity.find(
                      (item: any) => item.id === value
                    );
                    return entityData?.entityName;
                  })
                  .join(" , ")
              }`}</Tag>
            )
          )}
        </div>
      ) : null} */}
      <canvas
        ref={chartRef4}
        style={{ width: "100%", height: "100%" }}
        // width={620}
        // height={350}
      />
    </div>
  );
};

export default CapaByOwnerChart;
