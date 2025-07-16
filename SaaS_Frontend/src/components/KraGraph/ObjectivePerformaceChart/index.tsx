import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMediaQuery } from "@material-ui/core";

type Props = {
  selected?: string;
  monthlyTableData?: any[];
  quaterTableData?: any[];
  dayTableData?: any[];
  yearlyTableData?: any[];
};

const ObjectivePerformanceChart = ({
  selected,
  monthlyTableData,
  quaterTableData,
  dayTableData,
  yearlyTableData,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const [averagePercentage, setAveragePercentage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const dayData = dayTableData || [];

      const totalPercentage = dayData?.reduce((acc, obj) => {
        return acc + (obj.kpidata[0]?.percentage || 0);
      }, 0);
      //   console.log("data", data);
      const numberOfKpis = dayData?.length;
      const average = numberOfKpis > 0 ? totalPercentage / numberOfKpis : 0;

      setAveragePercentage(average);
    };

    fetchData();
  }, [selected, dayTableData]);

  const [averagePercentageMonth, setAveragePercentageMonth] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      const monthData = monthlyTableData || [];
      const quatterData = quaterTableData || [];

      const totalPercentage = monthData?.reduce((acc, obj) => {
        return acc + (obj.kpidatamonthwise[0]?.percentage || 0);
      }, 0);

      const numberOfKpis = monthData?.length;
      const average = numberOfKpis > 0 ? totalPercentage / numberOfKpis : 0;

      setAveragePercentageMonth(average);
    };

    fetchData();
  }, [selected, monthlyTableData, quaterTableData]);

  const [averagePercentageQuater, setAveragePercentageQuater] = useState(0);
  const [averagePercentageYear, setAveragePercentageYear] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      const quatterData = quaterTableData || [];

      const totalPercentage = quatterData?.reduce((acc, obj) => {
        return acc + (obj.kpidata[0]?.avgEfficiency || 0);
      }, 0);

      const numberOfKpis = quatterData?.length;
      const average = numberOfKpis > 0 ? totalPercentage / numberOfKpis : 0;

      setAveragePercentageQuater(average);
    };

    fetchData();
  }, [selected, quaterTableData]);
  useEffect(() => {
    const fetchData = async () => {
      const yearlyData = yearlyTableData || [];

      const totalPercentage = yearlyData?.reduce((acc, obj) => {
        return acc + (obj.sum[0]?.avgEfficiency || 0);
      }, 0);

      const numberOfKpis = yearlyData?.length;
      const average = numberOfKpis > 0 ? totalPercentage / numberOfKpis : 0;

      setAveragePercentageYear(average);
    };

    fetchData();
  }, [selected, yearlyTableData]);
  const targetValue = 100;
  const actualValue =
    selected === "Year"
      ? averagePercentageYear
      : selected === "Days"
      ? averagePercentage
      : selected === "Month"
      ? averagePercentageMonth
      : selected === "Quarter"
      ? averagePercentageQuater
      : 0;

  const options = {
    chart: {
      type: "gauge",
      plotBorderWidth: 0,
      plotShadow: false,
      height: "70%",
    },
    title: {
      text: "Objective Performance",
      align: "center",
      verticalAlign: "top",
      style: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#666666",
      },
      y: 0,
    },
    pane: {
      startAngle: -100,
      endAngle: 100,
      center: ["50%", "70%"],
      size: "110%",
    },
    yAxis: {
      min: 0,
      max: targetValue,
      tickPixelInterval: Math.ceil(targetValue / 3),
      tickPosition: "inside",
      tickLength: 20,
      tickWidth: 2,
      minorTickInterval: null,
      labels: {
        distance: 20,
        style: {
          fontSize: "12px",
        },
      },
      plotBands: [
        {
          from: 0,
          to: 33,
          color: "#C73659", // red
          thickness: 30,
        },
        {
          from: 33,
          to: 66,
          color: "#DC5F00", // yellow
          thickness: 20,
        },
        {
          from: 66,
          to: 100,
          color: "#21618C", // green
          thickness: 20,
        },
      ],
    },
    series: [
      {
        type: "gauge",
        name: "Actual Value",
        data: [actualValue],
        tooltip: {
          valueSuffix: " %",
        },
        dataLabels: {
          format: actualValue ? `${actualValue.toFixed(2)} %` : "0",
          borderWidth: 0,
          color:
            (Highcharts.defaultOptions.title &&
              Highcharts.defaultOptions.title.style &&
              Highcharts.defaultOptions.title.style.color) ||
            "#333333",
          style: {
            fontSize: "16px",
          },
        },
        dial: {
          radius: "80%",
          backgroundColor: "gray",
          baseWidth: 12,
          baseLength: "0%",
          rearLength: "0%",
        },
        pivot: {
          backgroundColor: "gray",
          radius: 6,
          borderWidth: 2,
        },
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <div
      style={{
        width: matches ? "350px" : "100%",
        height: matches ? "350px" : "300px",
      }}
    >
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default ObjectivePerformanceChart;
