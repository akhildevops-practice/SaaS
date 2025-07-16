import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip as ChartTooltip,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import getSessionStorage from "utils/getSessionStorage";
import { subDays, format } from "date-fns";

// Register the required chart components
ChartJS.register(
  Title,
  ChartTooltip,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  LineElement,
  PointElement
);

type KPIData = {
  kpiPeriod: number;
  kpiYear: number;
  totalQuarterSum: number;
  averageQuarterAverage: number;
  totalQuarterVariance: number;
  avgEfficiency: number;
  totalQuarterTarget: number;
};

type KPI = {
  kpi: string;
  uom: string;
  objectiveName: string[];
  kpitype: string;
  kpidata: KPIData[];
};

type KPIDataMonthwise = {
  id: string;
  kpiId: string;
  kraId: string;
  objectiveId: string;
  kpiEntity: string;
  kpibusiness: string;
  kpiLocation: string;
  kpiOrganization: string;
  kpiMonthYear: number;
  monthlySum: number;
  monthlyAverage: number;
  monthlyVariance: number;
  monthlyTarget: number;
  monthlyOperationalTarget: number;
  monthlyWeightedScore: number | null;
  percentage: number;
  count: number;
  kpiYear: number;
  kpiPeriod: number;
};

type KPIWithMonthwise = {
  kpi: string;
  uom: string;
  kpitype: string;
  kpidatamonthwise: KPIDataMonthwise[];
  objectiveName: string[];
  sum: {
    kpiYear: number;
    totalMonthlySum: number;
    averageMonthlyAverage: number;
    totalMonthlyVariance: number;
    avgEfficiency: number;
    totalTarget: number;
  }[];
};
type KPIWithYearwise = {
  kpi: string;
  uom: string;
  kpitype: string;

  objectiveName: string[];
  sum: {
    kpiYear: number;
    totalMonthlySum: number;
    averageMonthlyAverage: number;
    totalMonthlyVariance: number;
    avgEfficiency: number;
    totalTarget: number;
  }[];
};
type KPIDataDaywise = {
  id: string;
  kpiTemplateId: string;
  kpiCategoryId: string;
  kpiId: string;
  kraId: string;
  kpiLocation: string;
  kpiOrganization: string;
  kpiEntity: string;
  kpibusiness: string;
  kpiValue: number;
  kpiComments: string;
  kpiTargetType: string;
  minimumTarget: number | null;
  target: number;
  operationalTarget: number;
  kpiWeightage: number | null;
  kpiScore: number | null;
  kpiVariance: number;
  percentage: number;
  kpiStatus: string;
  reportDate: string;
  reportFor: string;
  reportYear: string;
  objectiveId: string[];
};

type KPIWithDaywise = {
  kpi: string;
  uom: string;
  kpitype: string;
  objectiveName: string[];
  kpidata: KPIDataDaywise[];
  aggregate: {
    totalMonthlySum: number;
    monthlyAverage: number;
    totalMonthlyVariance: number;
    averagepercentage: number;
    totalTarget: number;
  }[];
};

type Props = {
  selected?: string;
  monthlyTableData?: KPIWithMonthwise[];
  quaterTableData?: KPI[];
  dayTableData?: KPIWithDaywise[];
  yearlyTableData?: KPIWithYearwise[];
  modalState?: boolean;
};

const ObjectiveTimeSeriesChart = ({
  selected,
  monthlyTableData,
  quaterTableData,
  dayTableData,
  yearlyTableData,
  modalState,
}: Props) => {
  const userDetails = getSessionStorage();
  const yearFormat = userDetails.organization.fiscalYearQuarters
    ? userDetails.organization?.fiscalYearQuarters
    : "April - Mar";
  const chartRef3 = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS<"line", number[], string> | null>(
    null
  );
  console.log("userDetails", userDetails);

  useEffect(() => {
    const ctx = chartRef3.current?.getContext("2d");
    console.log("ctx", ctx, selected);
    if (ctx) {
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

      let labels: string[] = [];
      let counts: number[] = [];

      if (selected === "Quarter") {
        // Determine x-axis labels based on yearFormat
        labels =
          yearFormat === "Jan - Dec"
            ? ["Jan-Mar", "Apr-Jun", "Jul-Sep", "Oct-Dec"]
            : ["Apr-Jun", "Jul-Sep", "Oct-Dec", "Jan-Mar"];

        // Calculate y-axis data (average of avgEfficiency for each period)
        const periodCounts = [0, 0, 0, 0];
        const periodSums = [0, 0, 0, 0];

        quaterTableData?.forEach((kpi) => {
          kpi.kpidata.forEach((data) => {
            const periodIndex = data.kpiPeriod - 1; // Adjusting period index for 1-based kpiPeriod
            if (periodIndex >= 0 && periodIndex < 4) {
              periodSums[periodIndex] += data.avgEfficiency;
              periodCounts[periodIndex] += 1;
            }
          });
        });

        counts = periodSums.map((sum, index) =>
          periodCounts[index] > 0 ? sum / periodCounts[index] : 0
        );
      } else if (selected === "Month") {
        // X-axis labels for months
        labels = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        // Calculate y-axis data (average of avgEfficiency for each month)
        const monthCounts = Array(12).fill(0);
        const monthSums = Array(12).fill(0);
        if (monthlyTableData && monthlyTableData.length > 0) {
          monthlyTableData?.forEach((kpi) => {
            kpi?.kpidatamonthwise?.forEach((data) => {
              const monthIndex = data?.kpiMonthYear - 1; // monthIndex directly corresponds to kpiMonthYear (1-based)
              if (monthIndex >= 0 && monthIndex < 12) {
                monthSums[monthIndex] += data?.percentage;
                monthCounts[monthIndex] += 1;
              }
            });
          });
        }

        counts = monthSums.map((sum, index) =>
          monthCounts[index] > 0 ? sum / monthCounts[index] : 0
        );
      } else if (selected === "Days") {
        // Get current date
        const currentDate = new Date();
        const daysToShow = modalState ? 30 : 10; // Adjusting daysToShow based on modalState
        const startDate = subDays(currentDate, daysToShow);

        // Generate labels for the past 10 or 30 days
        labels = Array.from({ length: daysToShow + 1 }, (_, i) =>
          format(subDays(currentDate, daysToShow - i), "dd-MM")
        );

        // Calculate y-axis data (average of percentage for each day)
        const dayCounts = Array(daysToShow + 1).fill(0);
        const daySums = Array(daysToShow + 1).fill(0);

        dayTableData?.forEach((kpi) => {
          kpi.kpidata.forEach((data) => {
            const reportDate = new Date(data.reportDate);
            if (reportDate >= startDate && reportDate <= currentDate) {
              const dayIndex = Math.floor(
                (reportDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              if (dayIndex >= 0 && dayIndex < daysToShow + 1) {
                daySums[dayIndex] += data.percentage;
                dayCounts[dayIndex] += 1;
              }
            }
          });
        });

        counts = daySums.map((sum, index) =>
          dayCounts[index] > 0 ? sum / dayCounts[index] : 0
        );
      } else if (selected === "Year") {
        // Initialize labels and counts arrays
        const yearData: { [key: number]: { sum: number; count: number } } = {}; // Object to hold sum and count totals for each year

        // Collect all the years from the `sum` arrays across all KPIs
        yearlyTableData?.forEach((item) => {
          item.sum.forEach((data: any) => {
            const { kpiYear, avgEfficiency } = data;

            // Ensure year is added to the labels if not already
            if (!labels.includes(kpiYear.toString())) {
              labels.push(kpiYear.toString());
            }

            // Sum the avgEfficiency and count the occurrences for that year
            if (kpiYear in yearData) {
              yearData[kpiYear].sum += avgEfficiency; // Add to the existing sum for that year
              yearData[kpiYear].count += 1; // Increment the count for that year
            } else {
              yearData[kpiYear] = { sum: avgEfficiency, count: 1 }; // Initialize sum and count for the year
            }
          });
        });

        console.log("Year Data with Sum and Count:", yearData);

        // Sort labels to ensure the years appear in chronological order
        labels.sort((a, b) => Number(a) - Number(b));

        // Now, create the counts array by averaging the sum for each year
        counts = labels.map((year) => {
          const { sum, count } = yearData[Number(year)];
          return count > 0 ? sum / count : 0; // Calculate the average for the year
        });

        console.log("Year-wise labels:", labels);
        console.log("Year-wise counts (averaged):", counts);
      }

      // Destroy the previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create a new chart instance
      chartInstanceRef.current = new ChartJS(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Avg Efficiency",
              data: counts,
              backgroundColor: BackgroundColor,
              borderColor: "#ff4d4d", // Change the color of the line
              borderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true, // Make the chart responsive
          maintainAspectRatio: false, // Ensure the chart fills the container
          plugins: {
            datalabels: {
              color: "white", // Change the color of data labels
              font: {
                size: 14, // Increase the size of data labels
              },
            },
            legend: {
              display: false,
              position: "right",
            },
            title: {
              display: true,
              text: "Objective Time Series",
              font: {
                size: 16,
                weight: "1",
                family: "'Poppins', sans-serif",
              },
              color: "Black",
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
            },
          },
          scales: {
            y: {
              grid: {
                borderWidth: 3,
                lineWidth: 1,
              },
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
                callback: function (value) {
                  if (Number.isInteger(value)) {
                    return value;
                  } else {
                    return "";
                  }
                },
              },
            },
            x: {
              grid: {
                borderWidth: 3,
                lineWidth: 1,
              },
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
                font: {
                  size: 10,
                  family: "'Poppins', sans-serif",
                },
              },
            },
          },
        },
      });
    }

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [
    selected,
    yearlyTableData,
    quaterTableData,
    monthlyTableData,
    dayTableData,

    yearFormat,
    modalState,
  ]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef3} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default ObjectiveTimeSeriesChart;

// Usage example:
// <ObjectiveTimeSeriesChart selected="Quarter" quaterTableData={quaterTableData} />
// <ObjectiveTimeSeriesChart selected="Month" monthlyTableData={monthlyTableData} />
// <ObjectiveTimeSeriesChart selected="Days" dayTableData={dayTableData} modalState={true} />
// <ObjectiveTimeSeriesChart selected="Days" dayTableData={dayTableData} modalState={false} />
