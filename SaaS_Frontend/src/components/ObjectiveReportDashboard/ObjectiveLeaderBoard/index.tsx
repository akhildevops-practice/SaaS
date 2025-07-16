import React, { useEffect, useState } from "react";
import useStyles from "./style";

type Props = {
  totalCounts?: any;
  selected?: string;
  monthlyTableData?: any[];
  quaterTableData?: any[];
  dayTableData?: any[];
  yearlyTableData?: any[];
};

const ObjectiveLeaderBoard = ({
  totalCounts,
  selected,
  monthlyTableData,
  quaterTableData,
  dayTableData,
  yearlyTableData,
}: Props) => {
  const classes = useStyles();

  const [peakPerformingKPI, setPeakPerformingKPI] = useState<string>("00");
  const [lowPerformingKPI, setLowPerformingKPI] = useState<string>("00");

  useEffect(() => {
    let result = null;

    if (selected === "Month" && monthlyTableData) {
      result = calculatePeakAndLowKPI_Month(monthlyTableData);
    } else if (selected === "Quarter" && quaterTableData) {
      result = calculatePeakAndLowKPI_Quarter(quaterTableData);
    } else if (selected === "Day" && dayTableData) {
      result = calculatePeakAndLowKPI_Day(dayTableData);
    } else if (selected === "Year" && yearlyTableData) {
      result = calculatePeakAndLowKPI_Year(yearlyTableData);
    }

    if (result) {
      setPeakPerformingKPI(result.peakPerformingKPI);
      setLowPerformingKPI(result.lowPerformingKPI);
    }
  }, [
    selected,
    monthlyTableData,
    quaterTableData,
    dayTableData,
    yearlyTableData,
  ]);

  const calculatePeakAndLowKPI_Month = (data: any[]) => {
    const kpiPercentages: number[] = data
      .filter((kpi) => kpi.kpidatamonthwise.length > 0)
      .map((kpi) => {
        const total = kpi.kpidatamonthwise.reduce(
          (sum: number, entry: any) => sum + entry.percentage,
          0
        );
        return total / kpi.kpidatamonthwise.length;
      });

    if (kpiPercentages.length === 0) return null;

    const peak = Math.max(...kpiPercentages).toFixed(2);
    const low = Math.min(...kpiPercentages).toFixed(2);

    return {
      peakPerformingKPI: peak,
      lowPerformingKPI: low,
    };
  };

  const calculatePeakAndLowKPI_Quarter = (data: any[]) => {
    const avgEfficiencies: number[] = data
      .filter((kpi) => kpi.kpidata && kpi.kpidata.length > 0)
      .map((kpi) => {
        const totalEfficiency = kpi.kpidata.reduce(
          (sum: number, item: any) => sum + item.avgEfficiency,
          0
        );
        return totalEfficiency / kpi.kpidata.length;
      });

    if (avgEfficiencies.length === 0) return null;

    const peak = Math.max(...avgEfficiencies).toFixed(2);
    const low = Math.min(...avgEfficiencies).toFixed(2);

    return {
      peakPerformingKPI: peak,
      lowPerformingKPI: low,
    };
  };

  const calculatePeakAndLowKPI_Day = (data: any[]) => {
    const percentages = data
      .filter((kpi) => Array.isArray(kpi.kpidata) && kpi.kpidata.length > 0)
      .map((kpi) => {
        const total = kpi.kpidata.reduce(
          (sum: number, item: any) => sum + (item.percentage ?? 0),
          0
        );
        return total / kpi.kpidata.length;
      });

    if (percentages.length === 0) return null;

    const peak = Math.max(...percentages).toFixed(2);
    const low = Math.min(...percentages).toFixed(2);

    return {
      peakPerformingKPI: peak,
      lowPerformingKPI: low,
    };
  };

  const calculatePeakAndLowKPI_Year = (data: any[]) => {
    const avgEfficiencies = data
      .filter((kpi) => Array.isArray(kpi.sum) && kpi.sum.length > 0)
      .map((kpi) => {
        const totalEfficiency = kpi.sum.reduce(
          (sum: number, item: any) => sum + (item.avgEfficiency ?? 0),
          0
        );
        return totalEfficiency / kpi.sum.length;
      });

    if (avgEfficiencies.length === 0) return null;

    const peak = Math.max(...avgEfficiencies).toFixed(2);
    const low = Math.min(...avgEfficiencies).toFixed(2);

    return {
      peakPerformingKPI: peak,
      lowPerformingKPI: low,
    };
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 16px 22px 16px",
      }}
    >
      <div className={classes.mainContainer}>
        <p className={classes.text}>Number of Objectives</p>
        <p className={classes.number}>{totalCounts?.objectiveTotalCount}</p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>Number of KPI</p>
        <p className={classes.number}>{totalCounts?.kpiTotalCount}</p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>Peak Performing KPI</p>
        <p className={classes.number}>{peakPerformingKPI}</p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>Low Performing KPI</p>
        <p className={classes.number}>{lowPerformingKPI}</p>
      </div>
    </div>
  );
};

export default ObjectiveLeaderBoard;
