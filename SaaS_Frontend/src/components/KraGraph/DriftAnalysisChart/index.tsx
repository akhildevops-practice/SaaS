import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  BoxPlotController,
  BoxAndWiskers,
} from "@sgratzl/chartjs-chart-boxplot";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BoxPlotController,
  BoxAndWiskers,
  Title,
  Tooltip,
  Legend
);

type Props = {
  selected?: string;
  monthlyTableData?: any[];
  quaterTableData?: any[];
  dayTableData?: any[];
  yearlyTableData?: any[];
};

const DriftAnalysisChart = ({
  selected,
  monthlyTableData,
  quaterTableData,
  dayTableData,
  yearlyTableData,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | undefined>(undefined);

  const processData = (data: any[]) => {
    const kpiMap: { [key: string]: number[] } = {};

    data.forEach((item) => {
      if (selected === "Days") {
        item.kpidata.forEach((kpiData: any) => {
          const kpiName = item.kpi;
          if (!kpiMap[kpiName]) {
            kpiMap[kpiName] = [];
          }
          kpiMap[kpiName].push(kpiData.percentage);
        });
      } else if (selected === "Month") {
        item.kpidatamonthwise.forEach((kpiData: any) => {
          const kpiName = item.kpi;
          if (!kpiMap[kpiName]) {
            kpiMap[kpiName] = [];
          }
          kpiMap[kpiName].push(kpiData.percentage);
        });
      } else if (selected === "Quarter") {
        item.kpidata.forEach((kpiData: any) => {
          const kpiName = item.kpi;
          if (!kpiMap[kpiName]) {
            kpiMap[kpiName] = [];
          }
          kpiMap[kpiName].push(kpiData.avgEfficiency); // Using avgEfficiency for Quarter data
        });
      } else if (selected === "Year") {
        item.sum?.forEach((kpiData: any) => {
          const kpiName = item.kpi;
          if (!kpiMap[kpiName]) {
            kpiMap[kpiName] = [];
          }
          kpiMap[kpiName].push(kpiData.avgEfficiency); // Using avgEfficiency for Quarter data
        });
      }
    });

    const processedData: number[] = Object.values(kpiMap).map(
      (percentages) =>
        percentages.reduce((sum, percentage) => sum + percentage, 0) /
        percentages.length
    );

    return processedData;
  };

  useEffect(() => {
    if (canvasRef.current) {
      let dataForChart: any[][] = [];
      let labels: string[] = [];

      if (selected === "Days") {
        labels = Object.keys(dayTableData || {});
        dataForChart =
          dayTableData?.map((item) =>
            item?.kpidata?.map((kpiData: any) => kpiData?.percentage)
          ) || [];
      } else if (selected === "Month") {
        if (monthlyTableData && monthlyTableData.length > 0) {
          labels = Object.keys(monthlyTableData || {});
          dataForChart =
            monthlyTableData.map((item) =>
              item?.kpidatamonthwise?.map((kpiData: any) => kpiData?.percentage)
            ) || [];
        }
      } else if (selected === "Quarter") {
        labels = Object.keys(quaterTableData || {});
        dataForChart =
          quaterTableData?.map((item) =>
            item?.kpidata?.map((kpiData: any) => kpiData?.avgEfficiency)
          ) || [];
      } else if (selected === "Year") {
        labels = Object.keys(yearlyTableData || {});
        dataForChart =
          yearlyTableData?.map((item) =>
            item?.sum?.map((kpiData: any) => kpiData?.avgEfficiency)
          ) || [];
      }

      const processedData = processData(
        selected === "Year"
          ? yearlyTableData || []
          : selected === "Days"
          ? dayTableData || []
          : selected === "Month"
          ? monthlyTableData || []
          : quaterTableData || []
      );

      // console.log("Labels:", labels);
      // console.log("Data for Chart:", dataForChart);
      // console.log("Processed Data:", processedData);

      chartRef.current = new ChartJS(canvasRef.current, {
        type: "boxplot",
        data: {
          labels: ["category"],
          datasets: [
            {
              label: "category",
              data: processedData.map((value) => [
                Math.min(...processedData),
                value,
                processedData.reduce((a, b) => a + b, 0) / processedData.length,
                value,
                Math.max(...processedData),
              ]),
              borderColor: "#003059",
              backgroundColor: "#E9A700",
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              display: false,
            },
            title: {
              display: true,
              text: "Drift Analysis",
              font: {
                size: 13,
                weight: "600",
              },
              color: "#666666",
            },
            legend: {
              display: true,
              position: "bottom",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [selected, dayTableData, monthlyTableData, quaterTableData]);

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "400px" }} />
    </div>
  );
};

export default DriftAnalysisChart;
