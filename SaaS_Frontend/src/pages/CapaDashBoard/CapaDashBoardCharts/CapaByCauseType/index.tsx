import React, { useEffect, useRef } from "react";
import { Chart as ChartJS } from "chart.js";
import { Tag } from "antd";
import { useMediaQuery } from "@material-ui/core";

type props = {
  causeChartData?: any;
  showModalCharts?: any;
  setSelectedCapaIds?: any;
};

const CapaByCauseType = ({
  causeChartData,
  showModalCharts,
  setSelectedCapaIds,
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

    const labels: any = causeChartData?.map((value: any) => value?.category);
    const datas: any = causeChartData?.map((value: any) => value?.count);

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
            text: `  By Cause Type`,
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
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const selectedCapaIds = causeChartData?.[index]?.capaIds || [];
            setSelectedCapaIds(selectedCapaIds);
            showModalCharts(); // optionally show modal if needed
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
  }, [causeChartData]);

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
        ref={chartRef2}
        style={{ width: "100%", height: "100%" }}
        width={620} // Set these to match your container
        height={350} // Set these to match your container
      />
    </div>
  );
};

export default CapaByCauseType;
