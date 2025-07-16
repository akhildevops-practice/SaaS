import { useEffect, useState } from "react";
import {
  IKpiReportSchema,
  IKpiReportCategorySchema,
} from "../../../schemas/kpiReportSchema";
import { makeStyles } from "@material-ui/core";
import axios from "apis/axios.global";
const useStyles = makeStyles({
  tableContainer: {
    // border: "1px solid #000",
    marginBottom: "20px",
    maxWidth: "100%",
    overflowX: "auto",
  },
  styledTable: {
    width: "100%",
    borderCollapse: "collapse",
    borderSpacing: 0,
  },
  tableHeaderCell: {
    backgroundColor: "#E8F3F9",
    // border: "1px solid #000",
    padding: "8px",
    textAlign: "left",
  },
  tableCell: {
    // border: "1px solid #000",
    padding: "8px",
    textAlign: "left",
    width: "200px",
  },
});
type Props = {
  reportValues: IKpiReportSchema;
  setReportValues: React.Dispatch<React.SetStateAction<IKpiReportSchema>>;
  catId: string;
  cols: any[];
  reportStatus: string;
  read: any;
};

function KpiReportDesignContainer({
  reportValues,
  setReportValues,
  catId,
  cols,
  reportStatus,
  read,
}: Props) {
  const [categoryData, setCategoryData] = useState<IKpiReportCategorySchema[]>(
    reportValues.categories.filter((cat) => cat.catId === catId)[0].catData
  );
  const [visibility, setVisibility] = useState<any>();
  const classes = useStyles();
  console.log("categoryData in report", categoryData);
  useEffect(() => {
    setReportValues((prev) => ({
      ...prev,
      categories: prev.categories.map((prevCat) => {
        if (prevCat.catId === catId) {
          return { ...prevCat, catData: categoryData };
        }
        return prevCat;
      }),
    }));
  }, [JSON.stringify(categoryData)]);

  const handleBlur = (row: any) => {};
  const handleEdit = (rowIndex: number, key: string, value: string) => {
    setReportValues((prev: any) => ({
      ...prev,
      categories: prev.categories.map((prevCat: any) => {
        if (prevCat.catId === catId) {
          return {
            ...prevCat,
            catData: prevCat.catData.map((rowData: any, idx: number) => {
              if (idx === rowIndex) {
                return { ...rowData, [key]: value };
              }
              return rowData;
            }),
          };
        }
        return prevCat;
      }),
    }));
  };
  const filteredCategory = reportValues.categories.find(
    (cat) => cat.catId === catId
  );
  const getKpiInfo = async (id: any) => {
    const response = await axios.get(
      `api/kpi-definition/getSelectedKpibyId/${id}`
    );
    console.log("kpiInfo", response?.data);
    return response?.data;
  };
  return (
    // <KpiReportDesignTable
    //   columns={cols}
    //   data={categoryData}
    //   setData={setCategoryData}
    //   handleBlur={handleBlur}
    //   columnVisibility={visibility}
    //   setColumnVisibility={setVisibility}
    //   reportStatus={reportStatus}
    // />
    <div className={classes.tableContainer}>
      {categoryData && (
        <table className={classes.styledTable}>
          <thead>
            <tr>
              <th className={classes.tableHeaderCell}>KPI Name</th>
              <th className={classes.tableHeaderCell}>UOM</th>
              {/* <th className={classes.tableHeaderCell}>Description</th> */}
              <th className={classes.tableHeaderCell}>KPI Target</th>
              {/* <th className={classes.tableHeaderCell}>Minimum Target</th> */}
              <th className={classes.tableHeaderCell}>KPI Value</th>
              {/* <th className={classes.tableHeaderCell}>KPI Target Type</th> */}

              <th className={classes.tableHeaderCell}>Comments</th>
            </tr>
          </thead>
          <tbody>
            {categoryData?.map((rowData, index) => (
              <tr key={index}>
                <td className={classes.tableCell}>
                  {rowData?.kpi?.label ? rowData?.kpi?.label : rowData?.kpiName}
                </td>
                <td className={classes.tableCell}>
                  {rowData?.uom ? rowData?.uom : rowData?.kpiUOM}
                </td>
                {/* <td className={classes.tableCell}>
                  {rowData?.description
                    ? rowData?.description
                    : rowData?.kpiDescription}
                </td> */}
                <td
                  // className={classes.tableCell}
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    padding: "8px",
                  }}
                >
                  {rowData?.kpiTarget}
                </td>
                {/* <td className={classes.tableCell}>{rowData.kpiTargetType}</td> */}

                {/* <td className={classes.tableCell}>{rowData.minimumTarget}</td> */}

                <td className={classes.tableCell}>
                  <input
                    type="text"
                    value={rowData.kpiValue}
                    disabled={read}
                    onChange={(e) =>
                      handleEdit(index, "kpiValue", e.target.value)
                    }
                  />
                </td>
                <td className={classes.tableCell}>
                  <input
                    type="text"
                    value={rowData.kpiComments}
                    disabled={read}
                    onChange={(e) =>
                      handleEdit(index, "kpiComments", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default KpiReportDesignContainer;
