import React, { useRef, useEffect } from "react";
import { Chart as ChartJS } from "chart.js";
import { useRecoilState } from "recoil";
import { graphData } from "recoil/atom";
import "../graph.css";

function transformSystemWiseChartData(chartData:any) {
  const transformedLabels = chartData.labels.map((labelObj:any) => {
    const systemNames = labelObj.systemName.split(",");
    return systemNames; // Change here to return the array of system names
  });

  // console.log("check here");
  

  // console.log("check transformedLabels in system wise graph", transformedLabels);
  
  return {
    labels: transformedLabels,
    datasets: chartData.datasets
  };
}


type Props = {
  handleChartDataClick: any;
  resetChartDataAndDocumentTableData : any;
}
const DocumentSystemWiseGraph = (
  {
    handleChartDataClick,
    resetChartDataAndDocumentTableData
  } : Props
) => {
  const chartRef = useRef<any>(null);
  const [graphDataValues] = useRecoilState(graphData);

  const handleClick = (...args : any) => {
    // console.log("check in handle click  in system wise graph--> args", args);
    
    if (args[1].length > 0) {
      const segmentIndex = args[1][0].index;
      const clickedLabel = graphDataValues?.system?.labels[segmentIndex];

      // console.log("check in handle click in system wise graph--> clickedLabel", clickedLabel);
      // console.log("check in handle click in system wise graph--> segmentIndex", segmentIndex);
      handleChartDataClick({
        chartType: "system",
        label: clickedLabel.id,
      })
    }
  };

  useEffect(() => {
    // console.log(
    //   "in document sysyem pie graph--->",
    //   graphDataValues?.docType?.labels
    // );

    const ctx = chartRef.current.getContext("2d");
    let chart = null as any;
    if (graphDataValues?.docType?.labels as any) {
      // console.log("check graphDataValues in system wise graph", graphDataValues);
      
      const transgormedData = transformSystemWiseChartData(graphDataValues?.system);
      // console.log("check transgormedData in system wise graph", transgormedData);
      
      if (ctx) {
        chart = new ChartJS(ctx, {
          type: "pie",
          data: {
            labels: transgormedData.labels,
            datasets: [
              {
                // label: "Document Status",
                data: transgormedData.datasets, // Dummy data for document counts per status
                backgroundColor: [
                  "#0585FC", //lightblue for draft
                  "#F2BB00", //yellow for review complete
                  "#7cbf3f", // green for approval
                  "#003566", // darkblue for published
                  "#FF5492", //pink for oboslete
                  "#FB8500", //organge for in review
                  "#94c031", //turquoise for inapproval,
                  "#0075A4", //light blue for amend
                ],
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
                display: false,
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
    JSON.stringify(graphDataValues?.system?.labels),
    JSON.stringify(graphDataValues?.system?.datasets),
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
        {/* <div style={{ flex: "1", textAlign: "center" }}>System Wise</div> */}
        {/* <div style={{ cursor: "pointer" }} onClick={resetChartDataAndDocumentTableData}>
          <MdReplay  />
        </div> */}
      </div>
      <canvas ref={chartRef} className="systemgraph" width="400" height="220" />
    </div>
  );
};

export default DocumentSystemWiseGraph;
