import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  plugins: {
    title: {
      display: false,
      text: "Chart.js Bar Chart - Stacked",
    },
  },
  responsive: true,
  maintainAspectRatio: false, // disable aspect ratio
  width: 400, // set chart width
  height: 200, // set chart height
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
  elements: {
    point: {
      radius: 10,
      hoverRadius: 12,
      hitRadius: 15,
      backgroundColor: "rgba(255,99,132,1)",
      hoverBackgroundColor: "rgba(255,99,132,0.6)",
    },
  },
  legend: {
    position: "bottom",
  },
};

const labels = ["TestKPI", "AverageKPI", "BangTestKPI"];

const data = {
  labels,
  datasets: [
    {
      label: "Target",
      data: [40, 120, 200],
      backgroundColor: "#DF5353",
      count: 3,
    },
    {
      label: "Average",
      data: [50, 63, 55],
      backgroundColor: "#F8B33E",
    },
    {
      label: "Actual",
      data: [25, 31.5, 27.5],
      backgroundColor: "#0E0A42",
    },
  ],
};

export function StackBarChart() {
  return <Bar options={options} data={data} />;
}
