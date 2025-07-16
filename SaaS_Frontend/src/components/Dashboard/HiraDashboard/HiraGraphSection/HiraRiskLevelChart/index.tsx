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

type RiskLevelData = {
  green: number;
  yellow: number;
  orange: number;
  red: number;
};

type Props = {
  riskLevels: any;
  tags?: any;
};

const HiraRiskLevelChart = ({ riskLevels, tags }: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const chartContext = chartRef.current.getContext("2d");
    if (chartRef.current) {
      const labels = ["green", "yellow", "orange", "red"];
      const colors = ["#4caf50", "#ffeb3b", "#ff9800", "#f44336"];
      const hoverColors = ["#47a03e", "#CCCC0D", "#FF9000", "#CF3533"];
      const riskLabels = [
        "Low Risks (1-3)",
        "Medium Risks (4-6)",
        "High Risks (8-12)",
        "Extreme Risks (15-25)"
      ];

      // // Static test data
      // const testData = {
      //   green: 90211,
      //   yellow: 108791,
      //   orange: 23111,
      //   red: 1834
      // };
      

      const riskData = {
        green: riskLevels?.green || 0,
        yellow: riskLevels?.yellow || 0,
        orange: riskLevels?.orange || 0,
        red: riskLevels?.red || 0,
      };

      const filteredData = labels
        .map((label, index) => ({
          label,
          value: riskData[label as keyof RiskLevelData],
          color: colors[index],
          hoverColor: hoverColors[index],
          riskLabel: riskLabels[index]
        }))
        .filter((item: any) => item.value > 0);

      const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
      };

      const chart = new ChartJS(chartContext, {
        type: "bar",
        data: {
          labels: filteredData?.map((item) => item?.riskLabel),
          datasets: [
            {
              data: filteredData?.map((item) => item?.value),
              backgroundColor: filteredData?.map((item) => item?.color),
              borderColor: "white",
              borderWidth: 1,
            },
          ],
        },
        options: {
          indexAxis: 'x',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "HIRA Steps by Score",
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
                label: function (tooltipItem) {
                  return `Count: ${formatNumber(tooltipItem.raw as number)}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Count",
                font: {
                  size: 14,
                  family: "'Poppins', sans-serif",
                },
                color: "black",
              },
              ticks: {
                stepSize: 1,
                callback: function(value) {
                  return formatNumber(Math.floor(value as number));
                },
                font: {
                  size: 11,
                  family: "'Poppins', sans-serif",
                }
              },
              grid: {
                display: false
              }
            },
            x: {
              title: {
                display: true,
                text: "Risk Level",
                font: {
                  size: 14,
                  family: "'Poppins', sans-serif",
                },
                color: "black",
              },
              grid: {
                display: false,
                drawBorder: false
              },
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
                font: {
                  size: 11,
                  family: "'Poppins', sans-serif",
                }
              }
            },
          },
        },
      });

      return () => {
        chart.destroy();
      };
    }
  }, [riskLevels]);

  return (
    <div style={{ width: "100%" }}>
      {matches ? (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          {tags?.length ? (
            <>
              {tags?.map((tag: any, index: any) => (
                <Tag color={tag.color} key={index}>
                  {tag.tagName}
                </Tag>
              ))}
            </>
          ) : null}
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

export default HiraRiskLevelChart;
