import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  BubbleController,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import { useMediaQuery } from "@material-ui/core";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  BubbleController,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ChartDataLabels
);

type DefectTypeChartDatum = {
  count: number;
  ids: string[];
  defectType: string;
};

type Props = {
  defectTypeChartData?: DefectTypeChartDatum[];
  showModalCharts?: any;
  setSelectedCapaIds?: any;
};

const CapaDefectTypeChart = ({
  defectTypeChartData = [],
  showModalCharts,
  setSelectedCapaIds,
}: Props) => {
  const smallScreen = useMediaQuery("(min-width:450px)");
  const chartRef1 = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef1.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const maxLength = 6;

    const labels = defectTypeChartData.map((value) =>
      value.defectType.length > maxLength
        ? value.defectType.substring(0, maxLength) + "..."
        : value.defectType
    );

    const counts = defectTypeChartData.map((d) => d.count);
    const maxCount = getPercentile(counts, 90);
    const maxRadius = 50;
    const minRadius = 5;

    const backgroundColors = generateColors(defectTypeChartData.length);

    chartInstance.current = new ChartJS(ctx, {
      type: "bubble",
      data: {
        datasets: defectTypeChartData.map((value, index) => {
          const scaledR = (value.count / maxCount) * maxRadius;
          const r = Math.max(minRadius, Math.min(scaledR, maxRadius));
          return {
            label: value.defectType,
            data: [
              {
                x: index + 1,
                y: value.count,
                r,
                ids: value.ids,
              },
            ],
            backgroundColor: backgroundColors[index],
            borderColor: "rgba(0,0,0,0.1)",
            borderWidth: 1,
          };
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;

            const pointData =
              chartInstance.current.data.datasets[datasetIndex].data[index];

            if (pointData && pointData.ids && setSelectedCapaIds) {
              setSelectedCapaIds(pointData.ids);
            }
            showModalCharts();
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const datasetLabel = context.dataset.label;
                const count = context.raw.y;
                return `${datasetLabel}: ${count}`;
              },
            },
          },
          datalabels: {
            anchor: "center",
            align: "center",
            color: "white",
            font: { weight: "bold", size: 12 },
            formatter: (value, context: any) => {
              const label = context.dataset.label;
              const count = context.dataset.data[0].y;
              return count;
            },
          },
          title: {
            display: true,
            align: "start",
            text: "By Defect Type",
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
            grid: { display: false, drawBorder: false },
            ticks: { display: false },
          },
          y: {
            display: false,
            grid: { display: false, drawBorder: false },
            ticks: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [defectTypeChartData]);

  const getPercentile = (arr: number[], percentile: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  };

  const generateColors = (count: number) => {
    const baseColors = [
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

    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(
        baseColors[i] ||
          `#${Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")}`
      );
    }
    return result;
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ width: "100%", height: "100%" }}>
        <canvas ref={chartRef1} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

export default CapaDefectTypeChart;
