import React, { useRef, useEffect } from "react";
import { Chart as ChartJS } from "chart.js";
import "components/NcGraphs/ncGraphStyles.css";

type Props = {
  data: any;
  handleChartDataClick: any;
};

const NcPieChart = ({ data, handleChartDataClick }: Props) => {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    console.log("check in nc pie chart", data);
  }, [data]);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    let chart = null as any;
    if (!!data && !!data.labels.length) {
      if (ctx) {
        chart = new ChartJS(ctx, {
          type: "pie",
          data: {
            labels: data.labels,
            datasets: [
              {
                data: data.datasets,
                backgroundColor: ["#0585FC", "#F2BB00", "#7cbf3f"],
                borderColor: "transparent",
                borderWidth: 1,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
                align: "end",
                labels: {
                  usePointStyle: true,
                  pointStyle: "circle",
                  boxWidth: 6,
                  padding: 10,
                  font: {
                    weight: "400",
                  },
                },
                position: "right",
                onClick: (e: any, legendItem) => {
                  const chart = e.chart;
                  const index: any = legendItem.index;
                  const meta = chart.getDatasetMeta(0);
                  const item = meta.data[index];
                  item.hidden = !item.hidden;
                  chart.update();
                },
              },
              title: {
                display: true,
                text: "Total Count - NC / OFI / OBS",
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || "";
                    const value = context.parsed;
                    if (value) {
                      return `${label}: ${value}`;
                    }
                    return "";
                  },
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            onClick: (e, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                const label = data.labels[index];
                console.log("check label", label);
                handleChartDataClick({
                  value: label,
                  chartType: "pie",
                });
              }
            },
          },
        });
      }
    }

    return () => {
      chart?.destroy();
    };
  }, [JSON.stringify(data.labels), JSON.stringify(data.datasets)]);

  return (
    <div>
      <canvas ref={chartRef} className="ncpiegraph" />
    </div>
  );
};

export default NcPieChart;
