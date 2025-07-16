import React, { useEffect, useRef } from "react";
import { ChartConfiguration, Chart as ChartJS } from "chart.js";

type props = {
  allChartData?: any;
};

const AuditByProcessChart = ({ allChartData }: props) => {
  const chartInstanceRef: any = useRef<Chart | null>(null);
  const chartRef3 = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ctx = chartRef3.current?.getContext("2d");

    if (ctx) {
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

      const data =
        allChartData?.auditCoverage?.usedDocuments?.map(
          (item: any) => item.count
        ) || [];

      const labels =
        allChartData?.auditCoverage?.usedDocuments?.map(
          (item: any) => item.name
        ) || [];

      // Destroy old chart instance before creating a new one
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new ChartJS(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              label: "",
              data,
              backgroundColor: backgroundColors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "60%",
          plugins: {
            datalabels: {
              color: "white",
              font: {
                size: 14,
                family: "'Poppins', sans-serif",
                weight: "bold",
              },
              formatter: (value) => (value < 10 ? `0${value}` : value),
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
                pointStyle: "circle",
              },
            },
            title: {
              display: true,
              align: "start",
              text: "Open findings by Auditee",
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
                family: "'Poppins', sans-serif",
              },
              bodyFont: {
                size: 14,
                weight: "normal",
              },
              padding: 10,
            },
          },
          // 🔧 Custom onClick handler
          onClick: (value: any) => {
            if (Number.isInteger(value)) {
              return value;
            } else {
              return "";
            }
          },
        },
      });
    }

    // Cleanup chart on component unmount
    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [allChartData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* <canvas ref={chartRef3} style={{ width: "100%", height: "100%" }} /> */}
      <canvas
        ref={chartRef3}
        style={{ width: "100%", height: "100%" }}
        // width={620}
        // height={350}
      />
    </div>
  );
};

export default AuditByProcessChart;
