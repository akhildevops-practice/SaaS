import React, { useRef, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { useRecoilState } from "recoil";
import { graphData } from "recoil/atom";
import "../graph.css";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  ChartTooltip,
  Legend
);

type Props = {
  handleChartDataClick: (data: any) => void;
  resetChartDataAndDocumentTableData: () => void;
};

const DocumentTypeGraph = ({
  handleChartDataClick,
  resetChartDataAndDocumentTableData,
}: Props) => {
  const chartRef = useRef<any>(null);
  const [graphDataValues] = useRecoilState(graphData);
  const [chart, setChart] = useState<any>();

  const handleClick = (...args: any) => {
    // console.log("check in handle click in doc type graph--> args", args);
    // Handle chart click logic here
    if (args[1].length > 0) {
      const segmentIndex = args[1][0].index;
      const clickedLabel = graphDataValues?.docType?.labels[segmentIndex];

      // console.log("check in handle click in doc type graph--> clickedLabel", clickedLabel);
      // console.log("check in handle click in doc type graph--> segmentIndex", segmentIndex);

      handleChartDataClick({
        chartType: "docType",
        label: clickedLabel,
      });
    }
  };

  useEffect(() => {
    // console.log("in document type bar graph--->", graphDataValues);

    const ctx = chartRef.current?.getContext("2d");

    let chart = null as any;
    if (graphDataValues?.docType?.labels as any) {
      if (ctx) {
        chart = new ChartJS(ctx, {
          type: "bar",
          data: {
            labels: graphDataValues?.docType?.labels,
            datasets: [
              {
                label: "Number of Documents",
                data: graphDataValues?.docType?.datasets,
                backgroundColor: [
                  "#0585FC",
                  "#F2BB00",
                  "#7cbf3f",
                  "#003566",
                  "#FF5492",
                ],
               
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                ],
                barPercentage: 0.4,
                barThickness: 30,
              },
            ],
          },
          options: {
            responsive: false, // This line is added to make the graph non-responsive
            maintainAspectRatio: false, // This ensures the custom width and height are respected
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: false,
                  color: "rgba(0, 0, 0, 1)",
                },
                ticks: {
                  precision: 0,
                },
              },
              x: {
                display: true,
                grid: {
                  display: false,
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                enabled: true,
                // mode: "index",
                // intersect: true, // <-- Change this to true
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                borderColor: "#fff",
                borderWidth: 1,
                titleFont: {
                  size: 16, // Increase font size
                  weight: "bold",
                },
                bodyFont: {
                  size: 14, // Increase font size
                  weight: "normal",
                },
                padding: 10, // Add more padding
                callbacks: {
                  label: (context) => {
                    const label = context.label || "";
                    const value = context.parsed.y;
                    if (label && value !== undefined) {
                      return `${label}: ${value}`;
                    }
                    return "";
                  },
                },
              },
            },
            onClick: handleClick,
          },
        });

        setChart(chart);
      }
    }

    return () => {
      chart?.destroy();
    };
  }, [
    JSON.stringify(graphDataValues?.docType?.labels),
    JSON.stringify(graphDataValues?.docType?.datasets),
  ]);

  return (
    <div >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
          fontWeight: 700,
          letterSpacing: "0.5px",
          marginTop: "4px",
        }}
      >
        {/* <div style={{ flex: "1", textAlign: "center" }}>Document Type</div> */}
        {/* <div
          style={{ cursor: "pointer" }}
          onClick={resetChartDataAndDocumentTableData}
        >
          <MdReplay />
        </div> */}
      </div>
      <canvas ref={chartRef} className="bargraph"   width="400" height="220" />
    </div>
  );
};

export default DocumentTypeGraph;
