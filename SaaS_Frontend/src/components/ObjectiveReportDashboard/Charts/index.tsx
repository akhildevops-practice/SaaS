import React, { useEffect, useState } from "react";
import useStyles from "./style";
import ObjectivePerformanceChart from "./ObjectivePerformanceChart";
import { Paper, useMediaQuery } from "@material-ui/core";
import { AiOutlineArrowsAlt } from "react-icons/ai";
import TimeSeriesChart from "./TimeSeriesChart";
import PerformanceTimeSeriesChart from "./PerformanceTimeSeriesChart";
import PerformanceSummaryChart from "./PerformanceSummaryChart";

type props = {
  selected?: any;
  monthlyTableData?: any;
  quaterTableData?: any;
  dayTableData?: any;
  yearlyTableData?: any;
  selectedOptionForObjective?: any;
  selectedCategoryId?: any;
  startDate?: any;
  endDate?: any;
  entity?: any;
  unit?: any;
};

const Charts = ({
  selected,
  monthlyTableData,
  quaterTableData,
  dayTableData,
  yearlyTableData,
  selectedOptionForObjective,
  selectedCategoryId,
  endDate,
  startDate,
  entity,
  unit,
}: props) => {
  const classes = useStyles();
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");

  const [averagePercentage, setAveragePercentage] = useState(0);
  useEffect(() => {
    calculateAveragePercentage();
  }, [
    selected,
    dayTableData,
    monthlyTableData,
    quaterTableData,
    yearlyTableData,
  ]);

  // function to calculate for Objective Performance percentage
  const calculateAveragePercentage = () => {
    let totalPercentage = 0;
    let numberOfKpis = 0;

    if (selected === "Day") {
      const dayData = dayTableData || [];
      totalPercentage = dayData.reduce(
        (acc: any, obj: any) => acc + (obj.kpidata[0]?.percentage || 0),
        0
      );
      numberOfKpis = dayData.length;
    } else if (selected === "Month") {
      const monthData = monthlyTableData || [];
      totalPercentage = monthData.reduce(
        (acc: any, obj: any) =>
          acc + (obj.kpidatamonthwise[0]?.percentage || 0),
        0
      );
      numberOfKpis = monthData.length;
    } else if (selected === "Quarter") {
      const quatterData = quaterTableData || [];
      totalPercentage = quatterData.reduce(
        (acc: any, obj: any) => acc + (obj.kpidata[0]?.avgEfficiency || 0),
        0
      );
      numberOfKpis = quatterData.length;
    } else if (selected === "Year") {
      const yearlyData = yearlyTableData || [];
      totalPercentage = yearlyData.reduce(
        (acc: any, obj: any) => acc + (obj.sum[0]?.avgEfficiency || 0),
        0
      );
      numberOfKpis = yearlyData.length;
    }

    const average = numberOfKpis > 0 ? totalPercentage / numberOfKpis : 0;
    setAveragePercentage(average);
  };

  const value = parseFloat(averagePercentage.toFixed(2));

  return (
    <>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          padding: "0px 16px",
        }}
      >
        <Paper
          elevation={0}
          style={{
            marginTop: "0px",
            padding: matches ? "5px 15px" : "3px",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: matches ? "35%" : "100%",
            height: "320px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            justifyContent: "center",
            //   alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: "600",
                fontFamily: "'Poppins', sans-serif",
                margin: "0px",
              }}
            >
              {" "}
              Objective Performance
            </p>
          </div>

          <div>
            <ObjectivePerformanceChart value={value} />
          </div>
        </Paper>

        <Paper
          elevation={0}
          style={{
            marginTop: "0px",
            padding: matches ? "5px 15px" : "3px",
            display: "flex",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: matches ? "63%" : "100%",
            height: "320px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            justifyContent: "center",
            //   alignItems: "center",
          }}
        >
          <TimeSeriesChart
            selected={selected}
            monthlyTableData={monthlyTableData}
            quaterTableData={quaterTableData}
            dayTableData={dayTableData}
            yearlyTableData={yearlyTableData}
          />

          {matches ? (
            <AiOutlineArrowsAlt
              //   onClick={showModalForOwnerGraph}
              style={{ cursor: "pointer" }}
            />
          ) : null}
        </Paper>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          padding: "0px 16px",
          marginTop: "20px",
        }}
      >
        <Paper
          elevation={0}
          style={{
            marginTop: "0px",
            padding: matches ? "5px 15px" : "3px",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: matches ? "100%" : "100%",
            height: "380px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
          }}
        >
          <PerformanceSummaryChart
            selected={selected}
            monthlyTableData={monthlyTableData}
            quaterTableData={quaterTableData}
            dayTableData={dayTableData}
            yearlyTableData={yearlyTableData}
          />
        </Paper>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          padding: "0px 16px",
          marginTop: "20px",
          height: "380px",
        }}
      >
        <Paper
          elevation={0}
          style={{
            marginTop: "0px",
            padding: matches ? "5px 15px" : "3px",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: matches ? "100%" : "100%",
            height: "100%",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
          }}
        >
          <PerformanceTimeSeriesChart
            entity={entity}
            unit={unit}
            selectedOptionForObjective={selectedOptionForObjective}
            selectedCategoryId={selectedCategoryId}
            startDate={startDate}
            endDate={endDate}
          />
        </Paper>
      </div>
    </>
  );
};

export default Charts;
