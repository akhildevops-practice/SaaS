import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
} from "chart.js";

type Props = {
  allChartData?: any;
  handleClickSystem?: any;
};

// Extend ChartOptions to include onClick property with the correct type

const AuditBySystemChart = ({ allChartData, handleClickSystem }: Props) => {
  const chartRef2 = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef2.current?.getContext("2d");
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    if (ctx) {
      const BackgroundColor = [
        "#21618C",
        "#DC5F00",
        "#686D76",
        "#C73659",
        "#373A40",
        "#f0cb28",
        "#699eb0",
        "#b4a97e",
        "#CCC5A8",
        "#DBDB46",
        "#6b85fa",
      ];
      const counts = allChartData?.system.map((item: any) => item.count) || [];
      const names = allChartData?.system.map((item: any) => item.name) || [];
      // Destroy the previous chart instance if it exists

      // Create a new chart instance
      chartInstance.current = new ChartJS(ctx, {
        type: "pie",
        data: {
          labels: names,
          datasets: [
            {
              label: "set1",
              data: counts,
              backgroundColor: BackgroundColor,
              // borderColor: BorderColor,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true, // This line is added to make the graph non-responsive
          maintainAspectRatio: false,

          plugins: {
            datalabels: {
              color: "white", // Change the color of data labels
              font: {
                size: 14, // Increase the size of data labels
                family: "Poppins !important",
              },
            },
            legend: {
              display: true,
              position: "right",
              labels: {
                color: "#4d4d4d", // Change font color of legend labels
                font: {
                  size: 12, // Increase font size of legend labels
                  weight: "normal", // Font weight of legend labels
                },
              },
            },
            title: {
              display: true,
              text: "By System",
              font: {
                size: 16,
                weight: "1",
                family: "'Poppins', sans-serif", // Change the font family here
              },
              color: "Black",
            },
            tooltip: {
              enabled: true,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderColor: "#fff",
              borderWidth: 1,
              titleFont: {
                size: 16, // Increase font size
                weight: "bold",
                family: "Poppins !important",
              },
              bodyFont: {
                size: 14, // Increase font size
                weight: "normal",
              },
              padding: 10, // Add more padding
            },
          },
          onClick: (e, index) => {
            handleClickSystem(e, index);
            //   showModalCharts();
          },

          // onClick: handleClick,
        },
      });
    }
    // }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [allChartData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef2} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default AuditBySystemChart;
