import React, { useRef, useEffect } from "react";
import { Chart as ChartJS } from "chart.js";
import { useRecoilState } from "recoil";
import { graphData } from "recoil/atom";
import { MdReplay } from 'react-icons/md';
import "../graph.css";

const docStatusColor = {
  DRAFT: "#0075A4",
  IN_REVIEW: "#F2BB00",
  IN_APPROVAL: "#FB8500",
  PUBLISHED: "#7CBF3F",
  AMEND: "#D62DB1",
  OBSOLETE: "#003566",
} as any;

type Props = {
  handleChartDataClick: any;
  resetChartDataAndDocumentTableData: any;
};

const DocumentStatusGraph = ({
  handleChartDataClick,
  resetChartDataAndDocumentTableData,
}: Props) => {
  const chartRef = useRef<any>(null);
  const orgId = sessionStorage.getItem("orgId");
  const [graphDataValues, setGraphDataValues] = useRecoilState(graphData);
  const handleClick = (...args: any) => {
    // console.log("check in handle click--> args", args);

    if (args[1].length > 0) {
      const segmentIndex = args[1][0].index;
      const clickedLabel = graphDataValues?.docStatus?.labels[segmentIndex];

      // console.log("check in handle click--> clickedLabel", clickedLabel);
      // console.log("check in handle click--> segmentIndex", segmentIndex);
      handleChartDataClick({
        chartType: "docStatus",
        label: clickedLabel,
      });
    }
  };
  useEffect(() => {
    console.log("in document staus pie graph--->", graphDataValues?.docStatus);

    const ctx = chartRef.current.getContext("2d");

    let chart = null as any;
    if (graphDataValues?.docStatus?.labels as any) {
      if (ctx) {
        // Create the backgroundColor array based on the labels
        const backgroundColor = graphDataValues?.docStatus?.labels.map(
          (label: string) => docStatusColor[label]
        );

        chart = new ChartJS(ctx, {
          type: "pie",
          data: {
            labels: graphDataValues?.docStatus?.labels, // Status labels
            datasets: [
              {
                // label: "Document Status",
                data: graphDataValues?.docStatus?.datasets, // Dummy data for document counts per status
                // backgroundColor: [
                //   "#0075A4", //lightblue for `draft`
                //   "#F2BB00", //organge `for review`
                //   "#FB8500", //yellow for `review complete`
                //   "#7CBF3F", //turquoise `for approval`,
                //   "#D62DB1", // green for `approved`
                //   "#003566 ", //light blue for `amend`
                //   // "#003566", // darkblue for `published`
                //   // "#FF5492", //pink for `obsolete`
                // ],
                backgroundColor: backgroundColor,
                // borderColor: [
                //   "white", // New colors
                //   "white",
                //   "white",
                //   "white",
                //   "white",
                // ],
                borderColor: "transparent",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: false, // This line is added to make the graph non-responsive
            maintainAspectRatio: false, // This ensures the custom width and height are respected
            plugins: {
              legend: {
                display: false, // Add this line
              },
              title: {
                display: true,
                // text: "Document Status", // Chart title
              },
              tooltip: {
                enabled: true,
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
                    const value = context.parsed;
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
      }
    }

    return () => {
      chart?.destroy();
    };
  }, [
    JSON.stringify(graphDataValues?.docStatus?.labels),
    JSON.stringify(graphDataValues?.docStatus?.datasets),
  ]);

  return (
    <div>
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
        <div style={{ flex: "1", textAlign: "center" }}>Document Status</div>
        <div
          style={{ cursor: "pointer" }}
          onClick={resetChartDataAndDocumentTableData}
        >
          <MdReplay />
        </div>
      </div>
      <canvas
        ref={chartRef}
        className="piegraph"
        // style={{ width: '200px', height: '200px' }}
      />
    </div>
  );
};

export default DocumentStatusGraph;
