import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip as ChartTooltip,
  PieController,
  ArcElement,
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useRecoilState } from "recoil";
import { graphData } from "recoil/atom";
import { Tag } from "antd";
import { useMediaQuery } from "@material-ui/core";

// Register the necessary components including datalabels
ChartJS.register(Title, ChartTooltip, PieController, ArcElement, ChartDataLabels);

type Props = {
  conditionGraphData?: any;
  tableFilters?: any;
  setTableFilters?: any;
  tags?: any;
  isModalView?: boolean;
};

const HiraConditionChart = ({
  conditionGraphData,
  tableFilters,
  setTableFilters,
  tags,
  isModalView = false,
}: Props) => {
  console.log("isModalView", isModalView);
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const chartRef = useRef<any>(null);
  const [graphDataValues, setGraphDataValues] = useRecoilState(graphData);

  const handleClick = (event: any, elements: any, chart: any) => {
    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      const conditionId = chart.conditionIds[elementIndex];
      console.log("checkdashboard Condition ID Clicked:", conditionId);
      setTableFilters({
        condition: conditionId,
      });
    }
  };

  useEffect(() => {
    const chartContext = chartRef.current.getContext("2d");
    const labels = conditionGraphData?.map((data: any) => data.conditionName);
    const counts = conditionGraphData?.map((data: any) => data.count);
    const conditionIds = conditionGraphData?.map(
      (data: any) => data.conditionId
    );

    // Dynamically assign colors or use a predefined set
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

    const chartInstance: any = new ChartJS(chartContext, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: backgroundColors.slice(0, labels.length), // Ensure there are enough colors
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 10
        },
        plugins: {
          datalabels: {
            display: true,
            color: "white",
            font: {
              weight: 'bold'
            },
          },
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Risk Steps by Condition",
            font: {
              size: 16,
              weight: "500",
              family: "'Poppins', sans-serif",
            },
            align: "center",
            color: "black",
            padding: {
              top: 0,
              bottom: 10,
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            borderColor: "#fff",
            borderWidth: 1,
            titleFont: {
              size: 14,
            },
            bodyFont: {
              size: 12,
            },
            padding: 8,
          },
        },
        onClick: (event: any, elements: any) =>
          handleClick(event, elements, chartInstance),
      },
    });

    chartInstance.conditionIds = conditionIds;
    return () => chartInstance.destroy();
  }, [conditionGraphData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ position: "relative", width: "100%", height: isModalView ? "400px" : "280px" }}>
          <canvas
            ref={chartRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "90%",
              height: isModalView ? "380px" : "280px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HiraConditionChart;
