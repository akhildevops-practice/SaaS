import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
} from "chart.js";

interface Props {
  capaChartData?: any;
  setSelectedCapaIds?: any;
  showModalCharts?: any;
  matchedDepartmentName?: any;
}

const CapaOriginWiseChart: React.FC<Props> = ({
  capaChartData,
  setSelectedCapaIds,
  showModalCharts,
  matchedDepartmentName,
}) => {
  const chartRef = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");

    if (!ctx) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    if (ctx) {
      const backgroundColors = [
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

      // Transform data for Pie chart
      const labels = capaChartData?.orginiData?.map((item: any) => item.Origin);
      const dataValues = capaChartData?.orginiData?.map(
        (item: any) => item.count
      );

      // Chart dataset
      const datasets = [
        {
          data: dataValues,
          backgroundColor: backgroundColors,
        },
      ];

      chartInstance.current = new ChartJS(ctx, {
        type: "pie",
        data: {
          labels,
          datasets,
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
              text: "By Origin",
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
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const { index } = elements[0];
              const selectedData = capaChartData?.orginiData[index];
              const clickedIDs = selectedData?.ids || [];
              setSelectedCapaIds(clickedIDs);
              showModalCharts();
            }
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [
    capaChartData,
    // setSelectedCapaIds,
    // showModalCharts,
    // matchedDepartmentName,
  ]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default CapaOriginWiseChart;
