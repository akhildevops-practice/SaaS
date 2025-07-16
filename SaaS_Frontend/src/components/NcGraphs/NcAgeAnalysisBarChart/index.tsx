import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  ChartTooltip,
  Legend
);

type Props = {
  data: any;
};

const NcAgeAnalysisBarChart = ({ data }: Props) => {
  const chartRef = useRef<any>(null);

  console.log("data111", data);

  //   const dummyData = {
  //     "labels": [">60", "<60", "<30", "<15"],
  //     "datasets": [
  //         {
  //             "label": "Open",
  //             "data": [23, 15, 32, 30],
  //             "backgroundColor": '#0585FC'
  //         },
  //         {
  //             "label": "Closed",
  //             "data": [12, 28, 45, 15],
  //             "backgroundColor": '#A3A0FB'
  //         }
  //     ]
  // };

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    let chart = null as any;
    if (data) {
      const updatedData = {
        ...data,
        datasets: data.datasets.map((dataset: any, index: number) => ({
          ...dataset,
          backgroundColor: index === 0 ? "#0585FC" : "#A3A0FB",
        })),
      };
      console.log("updatedData22", updatedData);
      chart = new ChartJS(ctx, {
        type: "bar",
        data: updatedData,
        options: {
          indexAxis: "y", // This makes the chart horizontal
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                display: false,
              },
              ticks: {
                precision: 0,
              },
              stacked: true,
            },
            y: {
              display: true,
              grid: {
                display: false,
              },
              stacked: true,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: "right",
              labels: {
                usePointStyle: true, // Use point style for legend symbols
                pointStyle: "square", // Set the point style to circle
                boxWidth: 6, // Further reduce the width of the box (circle diameter)
                font: {
                  size: 10, // Reduce the font size for legend label
                },
              },
            },
            title: {
              display: true,
              text: "NC Age Analysis (Days)",
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || "";
                  const value = context.parsed.x;
                  return `${label}: ${value}`;
                },
              },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
          onClick: (e: any, legendItem) => {
            console.log("check chart clicked");
          },
        },
      });
    }

    return () => {
      chart?.destroy();
    };
  }, [data]);

  return (
    <div>
      <canvas ref={chartRef} className="ncageanalysisgraph" />
    </div>
  );
};

export default NcAgeAnalysisBarChart;
