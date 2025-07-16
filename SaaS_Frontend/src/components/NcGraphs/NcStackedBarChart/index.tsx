import React, { useRef, useEffect } from "react";
import { Chart as ChartJS } from "chart.js";
import "components/NcGraphs/ncGraphStyles.css";

type Props = {
  data: any;
};

const NcStackedBarChart = ({ data }: Props) => {
  const chartRef = useRef<any>(null);


  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    let chart = null as any;

    if (data && data.labels.length > 0) {
      chart = new ChartJS(ctx, {
        type: "bar",
        data: data,
        options: {
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: false,
              },
              ticks: {
                precision: 0,
              },
              stacked: true,
            },
            x: {
              display: true,
              grid: {
                display: false,
              },
              stacked: true, // Set stacked to true on the x-axis
            },
          },
          plugins: {
            legend: {
              display: false,
              position: "bottom", // Move the legend to the bottom
              labels: {
                usePointStyle: true, // Use point style for legend symbols
                pointStyle: "circle", // Set the point style to circle
                boxWidth: 6, // Further reduce the width of the box (circle diameter)
                font: {
                  size: 10, // Reduce the font size for legend label
                },
              },
            },
            title: {
              display: true,
              text: "System Wise NC / OFI",
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || "";
                  const value = context.parsed.y;
                  return `${label}: ${value}`;
                },
              },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }

    return () => {
      chart?.destroy();
    };
  }, [data]);

  return (
    <div>
      <canvas ref={chartRef} className="ncstackbargraph" />
    </div>
  );
};

export default NcStackedBarChart;
