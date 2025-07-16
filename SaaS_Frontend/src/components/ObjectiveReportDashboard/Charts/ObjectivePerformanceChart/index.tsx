import React, { useEffect, useRef } from "react";
import {
  Chart,
  ArcElement,
  ChartConfiguration,
  ChartData,
  ChartOptions,
  ChartDataset,
  Plugin,
} from "chart.js";

Chart.register(ArcElement); // only ArcElement registered globally

function isArcElementWithRadius(
  el: unknown
): el is ArcElement & { outerRadius: number } {
  return typeof el === "object" && el !== null && "outerRadius" in el;
}

const gaugeLabels: Plugin<"doughnut"> = {
  id: "gaugeLabels",
  afterDraw(chart) {
    const { ctx, chartArea } = chart;
    const element = chart.getDatasetMeta(0).data[0] as unknown;

    if (!isArcElementWithRadius(element)) return;

    const radius = element.outerRadius;
    const centerX = chartArea.left + chartArea.width / 2;
    const centerY = chartArea.top + chartArea.height;

    ctx.save();
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("0%", centerX - radius + 35, centerY - 10);
    ctx.fillText("100%", centerX, chartArea.top + 10);
    ctx.fillText("200%", centerX + radius - 25, centerY - 5);
    ctx.restore();
  },
};

interface Props {
  value: any; // value from 0 to 200
}

const ObjectivePerformanceChart = ({ value }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<"doughnut"> | null>(null);

  useEffect(() => {
    const max = 200;
    const clampedValue = Math.min(Math.max(value, 0), max);

    const dataset: ChartDataset<"doughnut"> = {
      data: [clampedValue, max - clampedValue],
      backgroundColor: [
        clampedValue < 100
          ? "#EF4444"
          : clampedValue < 150
          ? "#FACC15"
          : "#22C55E",
        "#E5E7EB",
      ],
      borderWidth: 0,
    };

    const data: ChartData<"doughnut"> = {
      datasets: [dataset],
    };

    const options: ChartOptions<"doughnut"> = {
      cutout: "70%", // ✅ correct place
      circumference: 180,
      rotation: -90,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    };

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const config: ChartConfiguration<"doughnut"> = {
        type: "doughnut",
        data,
        options,
        plugins: [gaugeLabels], // apply plugin only for this chart instance
      };
      chartRef.current = new Chart<"doughnut">(ctx, config);
    }
  }, [value]);

  return (
    <div style={{ position: "relative", width: "420px", height: "250px" }}>
      <canvas ref={canvasRef} />
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "28px", fontWeight: "bold" }}>{value}%</div>
        <div style={{ fontSize: "14px" }}>All Objectives</div>
      </div>
    </div>
  );
};

export default ObjectivePerformanceChart;
