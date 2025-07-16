import React, { useEffect, useRef } from "react";
import { Chart as ChartJS } from "chart.js";

type props = {
  allChartData?: any;
};

const AuditByClauseChart = ({ allChartData }: props) => {
  const chartRef4 = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    const ctx = chartRef4.current?.getContext("2d");
    if (ctx) {
      const counts =
        allChartData?.findingsConducted?.clauseData.map(
          (item: any) => item.count
        ) || [];
      const names =
        allChartData?.findingsConducted?.clauseData.map(
          (item: any) => item.name
        ) || [];

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

      // Destroy the previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const maxCount = Math.max(...counts); // Get the maximum count for scaling bubble size
      const maxRadius = 50; // Max bubble radius
      const minRadius = 5; // Min bubble radius

      // Create a new chart instance
      chartInstanceRef.current = new ChartJS(ctx, {
        type: "bubble",
        data: {
          datasets: counts.map((count: any, index: any) => {
            const radius = Math.max(
              minRadius,
              Math.min((count / maxCount) * maxRadius, maxRadius)
            );
            return {
              label: names[index],
              // label :"",
              data: [
                {
                  x: index + 1, // Adjust X position for each item
                  y: count, // Y position will be the count
                  r: radius, // Size of the bubble
                },
              ],
              backgroundColor: BackgroundColor[index % BackgroundColor.length],
              borderColor: "rgba(0,0,0,0.1)",
              borderWidth: 1,
            };
          }),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: "white",
              font: {
                size: 14,
              },
              align: "center",
              formatter: (value, context: any) => {
                const label = context.dataset.label;
                const count =
                  context.chart.data.datasets[context.datasetIndex].data[0].y;
                return count;
              },
            },
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  const datasetLabel = context.dataset.label;
                  const count = context.raw.y;
                  return `${datasetLabel}: ${count}`;
                },
              },
            },
            title: {
              display: true,
              align: "start",
              text: "By Clause",
              font: {
                size: 14,
                weight: "600",
                family: "'Poppins', sans-serif",
              },
              color: "black",
              padding: { top: 10, bottom: 60 },
            },
          },
          scales: {
            x: {
              display: false,
              grid: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
            y: {
              display: false,
              grid: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          },
          onClick: (e, index: any) => {
            const datasetIndex = index[0]?.datasetIndex;
            if (typeof datasetIndex === "number") {
              // setFilterQuery({
              //   entityId: allChartData.findingsConducted.clauseData[datasetIndex]?.entityId,
              // });
            }
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [allChartData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef4} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default AuditByClauseChart;
