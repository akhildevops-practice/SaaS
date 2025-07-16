import React, { useEffect, useState } from "react";
import useStyles from "./style";

type Props = {
  kpiReportData?: any;
  targetValue?: any;
  avgTargetValue?: any;
  actualValue?: any;
  variance?: any;
  averageValue?: any;
  percentageValue?: any;
};

const KpiLeaderBoard = ({
  kpiReportData,
  targetValue,
  avgTargetValue,
  actualValue,
  variance,
  averageValue,
  percentageValue,
}: Props) => {
  const classes = useStyles();

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1% 16px 18px 16px",
      }}
    >
      <div className={classes.mainContainer}>
        <p className={classes.text}>Target</p>
        <p className={classes.number}>
          {" "}
          {kpiReportData.displayType === "SUM"
            ? targetValue
            : avgTargetValue || 0}
        </p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>Value</p>
        <p className={classes.number}> {actualValue}</p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>Variance</p>
        <p className={classes.number}>{variance}</p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>
          {" "}
          {kpiReportData.displayType === "SUM" ? "Total" : "Average"}
        </p>
        <p className={classes.number}>
          {" "}
          {kpiReportData.displayType === "SUM" ? actualValue : averageValue}
        </p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>Efficiency</p>
        <p className={classes.number}> {percentageValue}%</p>
      </div>
    </div>
  );
};

export default KpiLeaderBoard;
