import { Table } from "antd";
import getSessionStorage from "utils/getSessionStorage";
import styles from "./style";

type props = {
  selected?: any;
  monthlyTableData?: any;
  quaterTableData?: any;
  dayTableData?: any;
  yearlyTableData?: any;
};

const KraDashboardTable = ({
  selected,
  monthlyTableData,
  quaterTableData,
  dayTableData,
  yearlyTableData,
}: props) => {
  const userDetails = getSessionStorage();
  const classes = styles();

  const getMonthName = (monthIndex: any) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[monthIndex] || "N/A";
  };

  const getQuarterMonths = (period: any, fiscalYearQuarters: any) => {
    const quartersJanDec = ["Jan - Mar", "Apr - Jun", "Jul - Sep", "Oct - Dec"];
    const quartersAprMar = ["Apr - Jun", "Jul - Sep", "Oct - Dec", "Jan - Mar"];

    // Adjust the period index to match the new logic
    const adjustedPeriod = period - 1;

    if (fiscalYearQuarters === "Jan - Dec") {
      return quartersJanDec[adjustedPeriod] || "N/A";
    } else if (fiscalYearQuarters === "April - Mar") {
      return quartersAprMar[adjustedPeriod] || "N/A";
    }
    return "N/A";
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getColumns = (selected: any) => {
    const baseColumns = [
      {
        title: "KPI",
        dataIndex: "kpi",
        key: "kpi",
      },
      {
        title: "Period",
        dataIndex: "period",
        key: "period",
      },
      {
        title: "PNB",
        key: "pnb",
        dataIndex: "pnb",
      },
      {
        title: "Actual",
        key: "actual",
        dataIndex: "actual",
      },
    ];

    if (selected === "Quarter" || selected === "Month") {
      baseColumns.push({
        title: "Average",
        key: "average",
        dataIndex: "average",
      });
    }

    return baseColumns;
  };

  const calculateAverages = (dataSource: any) => {
    let pnbSum: any = 0;
    let actualSum: any = 0;
    let pnbCount = 0;
    let actualCount = 0;

    dataSource.forEach((data: any) => {
      if (data.pnb) {
        pnbSum += parseFloat(data.pnb);
        pnbCount++;
      }
      if (data.actual) {
        actualSum += parseFloat(data.actual);
        actualCount++;
      }
    });

    const pnbAverage = pnbCount ? (pnbSum / pnbCount).toFixed(2) : "N/A";
    const actualAverage = actualCount
      ? (actualSum / actualCount).toFixed(2)
      : "N/A";

    const sum = pnbSum.toFixed(2);
    const actual = actualSum.toFixed(2);
    return { sum, actual };
  };

  const dataSourceForQuater = quaterTableData
    ? quaterTableData.flatMap((item: any, index: any) =>
        item?.kpidata?.length > 0
          ? item?.kpidata?.map((data: any) => ({
              key: `${index}-${data.kpiPeriod}`,
              period: getQuarterMonths(
                data.kpiPeriod,
                userDetails.organization.fiscalYearQuarters
              ),
              objective: item.objectiveName,
              kpi: item.kpi,
              pnb: data.totalQuarterTarget
                ? data.totalQuarterTarget?.toFixed(2)
                : 0,
              actual: data.totalQuarterSum.toFixed(2),
              average: data.averageQuarterAverage
                ? data.averageQuarterAverage?.toFixed(2)
                : 0,
            }))
          : [
              {
                key: `${index}-empty`,
                period: "",
                objective: item.objectiveName,
                kpi: item.kpi,
                pnb: "",
                actual: "",
                average: "",
              },
            ]
      )
    : [];

  const dataSourceForMonthly = monthlyTableData
    ? monthlyTableData.flatMap((item: any, index: any) =>
        item?.kpidatamonthwise?.length > 0
          ? item.kpidatamonthwise?.map((data: any) => ({
              key: `${index}-${data.id}`,
              period: getMonthName(data.kpiMonthYear),
              objective: item.objectiveName,
              kpi: item.kpi,
              pnb: data.monthlyTarget ? data.monthlyTarget?.toFixed(2) : 0,
              actual: data.monthlySum ? data.monthlySum.toFixed(2) : 0,
              average: data.monthlyAverage
                ? data.monthlyAverage?.toFixed(2)
                : 0,
            }))
          : [
              {
                key: `${index}-empty`,
                period: "",
                objective: item.objectiveName,
                kpi: item.kpi,
                pnb: "",
                actual: "",
                average: "",
              },
            ]
      )
    : [];
  const dataSourceForYearly = yearlyTableData
    ? yearlyTableData.flatMap((item: any, index: any) =>
        item?.sum?.length > 0
          ? item.sum?.map((data: any) => ({
              key: `${index}-${data.id}`,
              period: data?.kpiYear,
              objective: item.objectiveName,
              kpi: item.kpi,
              pnb: data.totalTarget ? data.totalTarget?.toFixed(2) : 0,
              actual: data.totalMonthlySum
                ? data.totalMonthlySum.toFixed(2)
                : 0,
              average: data.totalMonthlyAverage
                ? data.totalMonthlyAverage?.toFixed(2)
                : 0,
            }))
          : [
              {
                key: `${index}-empty`,
                period: "",
                objective: item.objectiveName,
                kpi: item.kpi,
                pnb: "",
                actual: "",
                average: "",
              },
            ]
      )
    : [];

  const dataSourceForDay = dayTableData
    ? dayTableData.flatMap((item: any, index: any) =>
        item?.kpidata?.length > 0
          ? item.kpidata.map((data: any) => ({
              key: `${index}-${data.id}`,
              period: formatDate(data.reportDate),
              objective: item.objectiveName,
              kpi: item.kpi,
              pnb: data.target.toFixed(2),
              actual: data.kpiValue.toFixed(2),
            }))
          : [
              {
                key: `${index}-empty`,
                period: "",
                objective: item.objectiveName,
                kpi: item.kpi,
                pnb: "",
                actual: "",
              },
            ]
      )
    : [];

  const dataSource =
    selected === "Quarter"
      ? dataSourceForQuater
      : selected === "Month"
      ? dataSourceForMonthly
      : selected === "Days"
      ? dataSourceForDay
      : selected === "Year"
      ? dataSourceForYearly
      : [];

  const { sum, actual } = calculateAverages(dataSource);

  return (
    <div className={classes.tableContainer}>
      <Table
        columns={getColumns(selected)}
        dataSource={dataSource}
        className={classes.documentTable}
        pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}>
              <p style={{ fontWeight: "bold" }}>Total</p>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <div
                style={{
                  fontWeight: "bold",
                  // borderTop: "1px solid black",
                  // borderBottom: "1px solid black",
                }}
              >
                {sum}
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2}>
              <div
                style={{
                  fontWeight: "bold",
                  // borderTop: "1px solid black",
                  // borderBottom: "1px solid black",
                }}
              >
                {actual}
              </div>
            </Table.Summary.Cell>
            {selected === "Quarter" || selected === "Month" ? (
              <Table.Summary.Cell index={3}></Table.Summary.Cell>
            ) : null}
          </Table.Summary.Row>
        )}
      />
    </div>
  );
};

export default KraDashboardTable;
