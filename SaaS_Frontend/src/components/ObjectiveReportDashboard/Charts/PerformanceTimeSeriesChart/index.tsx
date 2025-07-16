import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  LineElement,
  CategoryScale,
  LinearScale,
  Legend,
  PointElement,
} from "chart.js";
import axios from "apis/axios.global";

ChartJS.register(
  Title,
  Tooltip,
  LineElement,
  CategoryScale,
  LinearScale,
  Legend,
  PointElement
);

type props = {
  entity?: any;
  unit?: any;
  selectedOptionForObjective?: any;
  selectedCategoryId?: any;
  startDate?: any;
  endDate?: any;
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const PerformanceTimeSeriesChart = ({
  unit,
  entity,
  selectedOptionForObjective,
  selectedCategoryId,
  endDate,
  startDate,
}: props) => {
  const [monthwiseData, setMonthwiseData] = useState<any[]>([]);

  useEffect(() => {
    getMonthwiseChartData();
  }, [selectedCategoryId, selectedOptionForObjective, entity, unit]);

  const getMonthwiseChartData = async () => {
    const entityParam = entity === undefined ? "All" : entity;
    let apiUrl = `/api/kpi-report/getComputationForCategoryMonthwise/${selectedCategoryId}?startDate=${startDate}&endDate=${endDate}&location[]=${unit}&entity[]=${entityParam}`;

    if (selectedOptionForObjective && selectedOptionForObjective !== null) {
      apiUrl += `&objectiveId=${selectedOptionForObjective}`;
    }

    try {
      const res = await axios.get(apiUrl);
      setMonthwiseData(res?.data || []);
    } catch (error) {
      console.error("getMonthwiseData API is failing", error);
      setMonthwiseData([]);
    }
  };

  const predefinedColors = [
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

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef?.current?.getContext("2d");

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    if (!ctx) return;

    const datasets = monthwiseData
      .filter((item) => item.kpidatamonthwise.length > 0)
      .map((item, index) => {
        const monthData: Record<number, number> = {};
        item.kpidatamonthwise.forEach((d: any) => {
          monthData[d.kpiMonthYear] = d.percentage;
        });

        // Ensure data for all 12 months (default to null)
        const data = Array.from(
          { length: 12 },
          (_, index) => monthData[index] ?? null
        );

        return {
          label: item.kpi,
          data,
          borderColor: predefinedColors[index % predefinedColors.length],
          fill: false,
          tension: 0.3,
        };
      });

    chartInstance.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: monthNames,
        datasets,
      },
      options: {
        responsive: true,
        plugins: {
          datalabels: {
            color: "#595959", // Change the color of data labels
            font: {
              size: 14, // Increase the size of data labels
            },
            formatter: function (value) {
              return value.toFixed(2) + "%"; // ✅ Format with 2 decimals and %
            },
          },
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
            usePointStyle: true,
            callbacks: {
              labelPointStyle: () => ({
                pointStyle: "rect", // Use "circle" or "rectRounded" for different shapes
                rotation: 0,
              }),
            },
          },

          title: {
            display: true,
            align: "start",
            text: "KPI Performance By Time Series",
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
        },

        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
        scales: {
          y: {
            ticks: {
              stepSize: 5, // Adjust step size to control tick interval
              maxTicksLimit: 6,
              callback: function (value) {
                // Round the value to remove decimals and return the integer value
                return Number(value).toFixed(0); // Removes decimals by rounding the number
              },
            },
            beginAtZero: true,
            title: {
              display: true,
              text: "Percentage",
            },
          },
          x: {
            title: {
              display: true,
              //   text: "Months",
            },
          },
        },
      },
    });
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [monthwiseData]);

  return (
    <div style={{ width: "100%", height: "380px" }}>
      <canvas
        ref={chartRef}
        style={{ width: "100%", height: "380px", maxHeight: "380px" }}
      />
    </div>
  );
};

export default PerformanceTimeSeriesChart;
