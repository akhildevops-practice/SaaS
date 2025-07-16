import React, { useRef, useEffect, useContext } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip as ChartTooltip,
  PieController,
  ArcElement,
} from "chart.js";
import { useRecoilState, useSetRecoilState } from "recoil";
import { graphData } from "recoil/atom";
import { Tag } from "antd";
import { useMediaQuery } from "@material-ui/core";
// import "../graph.css";

// Register the components
ChartJS.register(Title, ChartTooltip, PieController, ArcElement);

const docStatusColor = {
  DRAFT: "#0075A4",
  IN_REVIEW: "#F2BB00",
  IN_APPROVAL: "#FB8500",
  PUBLISHED: "#7CBF3F",
  AMEND: "#D62DB1",
  OBSOLETE: "#003566",
} as any;

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
  "#6b85fa",
  "#BDE0FE",
  "#FFD6A5",
  "#FFADAD",
  "#9BF6FF",
  "#CAFFBF",
  "#A0C4FF",
];

type Props = {
  hazardGraphData?: any;
  tableFilters?: any;
  setTableFilters?: any;
  tags?: any;
  isModalView?: boolean;
};

const HiraHazardTypeChart = ({
  hazardGraphData,
  tableFilters,
  setTableFilters,
  tags,
  isModalView = false,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const chartRef = useRef<any>(null);
  const orgId = sessionStorage.getItem("orgId");
  const [graphDataValues, setGraphDataValues] = useRecoilState(graphData);

  const handleClick = (event: any, elements: any, chart: any) => {
    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      const hazardTypeId = chart.hazardIds[elementIndex];
      const hiraClicked = chart.hiras[elementIndex];
      console.log("checkdashboardnew Hazard Type ID Clicked:", hazardTypeId);
      console.log("checkdashboardnew HIRA Clicked:", hiraClicked);
      if (setTableFilters) {
        setTableFilters({
          hazard: {
            hazardTypeId: hazardTypeId,
            hira: hiraClicked,
          },
        });
      }
    }
  };

  useEffect(() => {
    console.log(
      "checkdashboardnew hazardGraphData in pie graph--->",
      hazardGraphData
    );

    const chartContext = chartRef.current.getContext("2d");
    const labels = hazardGraphData?.map((data: any) => data?.hazardName);
    const counts = hazardGraphData?.map((data: any) => data?.count);
    const hazardIds = hazardGraphData?.map((data: any) => data?.hazardTypeId);
    const hiras = hazardGraphData?.map((data: any) => data?.hira);

    const chartInstance: any = new ChartJS(chartContext, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 10,
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            color: "white",
            display: true,
            font: {
              weight: "bold",
            },
          },
          title: {
            display: true,
            text: "HIRA Steps by Hazard Type",
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
              weight: "bold",
            },
            bodyFont: {
              size: 12,
            },
            padding: 8,
            callbacks: {
              label: function (tooltipItem) {
                return `${labels[tooltipItem.dataIndex]}: ${
                  counts[tooltipItem.dataIndex]
                }`;
              },
            },
          },
        },
        // onClick: (event, elements) =>
        //   handleClick(event, elements, chartInstance),
      },
    });

    chartInstance.hazardIds = hazardIds;
    chartInstance.hiras = hiras;

    return () => chartInstance.destroy();
  }, [hazardGraphData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {matches && tags?.length ? (
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}
        >
          {tags.map((tag: any, index: any) => (
            <Tag color={tag.color} key={index}>
              {tag.tagName}
            </Tag>
          ))}
        </div>
      ) : null}

      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ position: "relative", width: "100%", height: isModalView ? "400px" : "280px" }}>
          <canvas
            ref={chartRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "90%",
              height: isModalView ? "400px" : "280px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HiraHazardTypeChart;
