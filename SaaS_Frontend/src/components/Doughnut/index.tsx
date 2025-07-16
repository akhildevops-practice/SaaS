import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: ["Red", "Yellow", "green"],
  datasets: [
    {
      label: "# of Votes",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        // "rgba(255, 99, 132, 0.2)",
        // "rgba(54, 162, 235, 0.2)",
        // "rgba(255, 206, 86, 0.2)",
        // "rgba(75, 192, 192, 0.2)",
        // "rgba(153, 102, 255, 0.2)",
        // "rgba(255, 159, 64, 0.2)",
        "red",
        "yellow",
        "green",
      ],
      borderColor: [
        // "rgba(255, 99, 132, 1)",
        // "rgba(54, 162, 235, 1)",
        // "rgba(255, 206, 86, 1)",
        // "rgba(75, 192, 192, 1)",
        // "rgba(153, 102, 255, 1)",
        // "rgba(255, 159, 64, 1)",
        "red",
        "yellow",
        "green",
      ],
      borderWidth: 1,
      circumference: 180,
      rotation: 270,
      // cutout: "95%",
    },
  ],
};

function DoughnutChart() {
  return (
    <div>
      <Doughnut data={data} />
    </div>
  );
}

export default DoughnutChart;
