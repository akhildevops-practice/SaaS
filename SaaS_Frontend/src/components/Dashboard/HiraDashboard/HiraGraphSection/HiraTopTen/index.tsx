import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip as ChartTooltip,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Tag } from "antd";
import { useMediaQuery } from "@material-ui/core";

// Register the components
ChartJS.register(
  Title,
  ChartTooltip,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale
);

const docStatusColor = {
  DRAFT: "#0075A4",
  IN_REVIEW: "#F2BB00",
  IN_APPROVAL: "#FB8500",
  PUBLISHED: "#7CBF3F",
  AMEND: "#D62DB1",
  OBSOLETE: "#003566",
} as any;

type Props = {
  topTenRiskTableData: any;
  tags?: any;
  top10Risks?: boolean; // Change type to boolean
  tableFilters?: any;
  setTableFilters?: any;
};

const HiraTopTen = ({
  topTenRiskTableData,
  tags,
  top10Risks,
  tableFilters,
  setTableFilters,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const chartRef = useRef<any>(null);
  const handleClick = (event: any, elements: any, chart: any) => {
    console.log("checkfilter elements", elements);
    console.log("checkfilter hiraIds", chart.hiraIds);

    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      console.log("checkfilter elementIndex", elementIndex);

      const hiraClicked = chart.hiraIds[elementIndex];
      console.log("checkfilter hiraClicked", hiraClicked);
      if (setTableFilters) {
        setTableFilters({ hira: hiraClicked });
      }
    }
  };

  useEffect(() => {
    console.log("checkfilter topntenriskdata", topTenRiskTableData);

    const chartContext = chartRef.current.getContext("2d");
    const labels = topTenRiskTableData.map((data: any) => data.jobTitle);
    const scores = topTenRiskTableData.map((data: any) => data.maxScore);
    const hiraIds = topTenRiskTableData.map((data: any) => data._id);
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
    ];

    // Set max length based on top10Risks flag
    const maxLength = top10Risks ? 15 : 8;

    console.log("top10Risks", top10Risks);

    // Shorten labels based on maxLength
    const shortenedLabels = labels.map((label: any) =>
      label.length > maxLength ? label.substring(0, maxLength) + "..." : label
    );

    const chartInstance: any = new ChartJS(chartContext, {
      type: "bar",
      data: {
        labels: shortenedLabels,
        datasets: [
          {
            data: scores,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderColor: "white",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "x", // This will make the bar chart horizontal
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            color: "white", // Change the color of data labels
            font: {
              size: 14, // Increase the size of data labels
            },
          },
          title: {
            display: true,
            text: "Top 10 Risks",
            font: {
              size: 18,
              weight: "1",
              family: "'Poppins', sans-serif",
            },
            color: "black",
          },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            borderColor: "#fff",
            borderWidth: 1,
            titleFont: {
              size: 16,
              weight: "bold",
            },
            bodyFont: {
              size: 14,
              weight: "normal",
            },
            padding: 10,
            callbacks: {
              title: function (tooltipItem) {
                const index = tooltipItem[0].dataIndex;
                return labels[index]; // Show full label in tooltip
              },
              label: function (tooltipItem) {
                return `Score: ${scores[tooltipItem.dataIndex]}`;
              },
            },
          },
        },
        onClick: (event, elements) =>
          handleClick(event, elements, chartInstance),
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Job Title",
              font: {
                size: 14,
                family: "'Poppins', sans-serif",
              },
              color: "black",
            },
            ticks: {
              autoSkip: false,

              maxRotation: 0,
              minRotation: 0,
            },
          },
          y: {
            title: {
              display: true,
              text: "Score",
              font: {
                size: 14,
                family: "'Poppins', sans-serif",
              },
              color: "black",
            },
            ticks: {
              autoSkip: false,
              stepSize: 1, // Force the scale to increment by 1
              maxRotation: 0,
              minRotation: 0,
            },
          },
        },
      },
    });
    chartInstance.hiraIds = hiraIds;
    return () => chartInstance.destroy();
  }, [topTenRiskTableData, top10Risks]);

  return (
    <div style={{ width: "100%" }}>
      {matches ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {tags?.length ? (
            <>
              {tags?.map((tag: any, index: any) => (
                <Tag color={tag.color} key={index}>
                  {tag.tagName}
                </Tag>
              ))}
            </>
          ) : (
            <></>
          )}
        </div>
      ) : null}
     <div style={{ display: "flex", height: "100%" }}>
        <div style={{ position: "relative", width: "100%", height: "310px" }}>
          <canvas
            ref={chartRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "90%",
              height: "310px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HiraTopTen;
