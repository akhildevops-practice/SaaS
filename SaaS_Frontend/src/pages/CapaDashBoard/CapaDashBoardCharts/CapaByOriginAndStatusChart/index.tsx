import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
} from "chart.js";

type Props = {
  capaChartData?: any;
  setSelectedCapaIds?: any;
  showModalCharts?: any;
  matchedLocationName?: any;
  allDepartmentOption?: string;
};

const CapaByOriginAndStatusChart = ({
  capaChartData,
  setSelectedCapaIds,
  showModalCharts,
  matchedLocationName,
  allDepartmentOption,
}: Props) => {
  const chartRef2 = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef2.current.getContext("2d");

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const BackgroundColor = [
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

    // Select data source based on `allDepartmentOption`
    const chartDataSource =
      allDepartmentOption === "All" || allDepartmentOption === undefined
        ? capaChartData?.myloc
        : capaChartData?.myDept;

    const transformedData = chartDataSource?.reduce((acc: any, curr: any) => {
      const existing =
        acc.find((item: any) => item.Origin === curr.Origin) || {};
      existing[curr.status] = (existing[curr.status] || 0) + curr.count;
      existing.Origin = curr.Origin;
      if (!acc.includes(existing)) {
        acc.push(existing);
      }
      return acc;
    }, []);

    const statusKeys = transformedData?.reduce((keys: any, item: any) => {
      Object.keys(item).forEach((key) => {
        if (key !== "Origin" && !keys.includes(key)) {
          keys.push(key);
        }
      });
      return keys;
    }, []);

    const datasets = statusKeys?.map((status: any, index: any) => ({
      label: status,
      data: transformedData.map((item: any) =>
        item[status] ? item[status] : null
      ),
      backgroundColor: BackgroundColor[index % BackgroundColor.length],
      borderWidth: 1,
    }));

    chartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: transformedData?.map((item: any) => item.Origin),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: (value) => (Number.isInteger(value) ? value : null),
            },
          },
          x: {
            stacked: true,
          },
        },
        plugins: {
          datalabels: {
            color: "white",
            font: {
              size: 14,
            },
          },
          legend: {
            display: true,
            position: "bottom",
          },
          title: {
            display: true,
            text: `By Origin & Status`,
            font: {
              size: 16,
              weight: "1",
              family: "'Poppins', sans-serif",
            },
            align: "center",
            color: "black",
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": " + context.parsed.y;
                }
                return label;
              },
            },
          },
        },
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const { index, datasetIndex } = elements[0];
            const status = datasets[datasetIndex].label;
            const origin = transformedData[index].Origin;
            const clickedIDs = chartDataSource
              .filter(
                (item: any) => item.Origin === origin && item.status === status
              )
              .flatMap((item: any) => item.ids);
            setSelectedCapaIds(clickedIDs);
            showModalCharts();
          }
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [capaChartData, allDepartmentOption]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas
        ref={chartRef2}
        style={{ width: "100%", height: "100%" }}
        width={700}
        height={350}
      />
    </div>
  );
};

export default CapaByOriginAndStatusChart;
