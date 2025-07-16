import React, { useEffect, useState } from "react";
import { MdDelete } from 'react-icons/md';
import axios from "apis/axios.global";
import { makeStyles } from "@material-ui/core";
import { IKpiReportTemplateSchema } from "schemas/kpiReportTemplateSchema";

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
  },
});

type Props = {
  templateValues: IKpiReportTemplateSchema;
  setTemplateValues: React.Dispatch<
    React.SetStateAction<IKpiReportTemplateSchema>
  >;
  catId: string;
  cols: any[];
  kpiOptions: { value: string; label: string }[];
  kpiData: any[];
  krakpiOptions: { value: string; label: string }[];
  krakpiData: any[];
  selectedKpi?: any;
  setSelectedKPI?: any;
  selectedKraId?: any;
  isEdit?: any;
  readMode?: any;
};

const KpiReportTemplateDesignContainer: React.FC<Props> = ({
  templateValues,
  setTemplateValues,
  catId,
  cols,
  kpiOptions,
  kpiData,
  krakpiOptions,
  krakpiData,
  selectedKpi,
  setSelectedKPI,
  selectedKraId,
  isEdit,
  readMode,
}) => {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const classes = useStyles();

  // useEffect(() => {
  //   setTemplateValues((prev: any) => ({
  //     ...prev,
  //     categories: prev.categories.map((prevCat: any) => {
  //       if (prevCat.catId === catId) {
  //         return { ...prevCat, catData: categoryData };
  //       }
  //       return prevCat;
  //     }),
  //   }));
  // }, [setTemplateValues, catId]);
  // useEffect(() => {
  //   console.log("template values", templateValues);
  // }, [templateValues]);

  // Effect to add KPI row when selectedKpi changes
  useEffect(() => {
    if (selectedKpi && catId) {
      addKpiRow(selectedKpi);
    }
  }, [selectedKpi, catId]);

  useEffect(() => {
    if (krakpiOptions.length > 0 && catId) {
      krakpiOptions.forEach((option) => {
        // if (catId === option.value) {
        // console.log("check catID inside useffect", catId);
        addKraKpiRow(option.value);
        // }
      });
    }
  }, [krakpiOptions, catId]);
  // console.log("selectedKpi", selectedKpi);
  // Function to add a KPI row to the correct category

  const addKpiRow = async (selectedKpi: any) => {
    try {
      const response = await axios.get(
        `api/kpi-definition/getSelectedKpi/${selectedKpi}`
      );
      const kpiDetails = response.data;
      // console.log("kpi details after selecting kpi", kpiDetails);

      // setCategoryData((prevData: any) => [
      //   ...prevData,
      //   {
      //     id: selectedKpi,
      //     kpiId: selectedKpi,
      //     kpiName: kpiDetails.kpiName,
      //     kpiTargetType: kpiDetails.kpiTargetType,
      //     description: kpiDetails.kpiDescription,
      //     kpiTarget: kpiDetails.kpiTarget,
      //     minimumTarget: kpiDetails.minimumTarget,
      //     uom: kpiDetails.uom,
      //     kpi: { value: selectedKpi, label: kpiDetails.kpiName },
      //   },
      // ]);
      // console.log("check catId", catId);
      setTemplateValues((prev: any) => ({
        ...prev,
        categories: prev.categories.map((prevCat: any) => {
          // console.log("check prevCat", prevCat);
          if (prevCat.catId === catId) {
            // console.log("check prevCatid", prevCat.catId, catId);
            return {
              ...prevCat,
              catData: [
                ...prevCat.catData,
                {
                  id: selectedKpi,
                  kpiId: selectedKpi,
                  kpiName: kpiDetails.kpiName,
                  kpiTargetType: kpiDetails.kpiTargetType,
                  description: kpiDetails.kpiDescription,
                  kpiTarget: kpiDetails.kpiTarget,
                  minimumTarget: kpiDetails.minimumTarget,
                  uom: kpiDetails.uom,
                  kpi: { value: selectedKpi, label: kpiDetails.kpiName },
                },
              ],
            };
          } else {
            console.log("check inside else");
            return prevCat;
          }
        }),
      }));
    } catch (error) {
      console.error("Error fetching KPI details: ", error);
    }
  };
  const addKraKpiRow = async (selectedKpi: any) => {
    try {
      const response = await axios.get(
        `api/kpi-definition/getSelectedKpi/${selectedKpi}`
      );
      const kpiDetails = response.data;

      console.log("check catId", catId);
      setTemplateValues((prev: any) => ({
        ...prev,
        categories: prev.categories.map((prevCat: any) => {
          // console.log("check prevCat", prevCat);
          if (prevCat.catId === catId && prevCat.kraId === selectedKraId) {
            // console.log("check prevCatid", prevCat.catId, catId);
            return {
              ...prevCat,
              catData: [
                ...prevCat.catData,
                {
                  id: selectedKpi,
                  kpiId: selectedKpi,
                  kpiName: kpiDetails.kpiName,
                  kpiTargetType: kpiDetails.kpiTargetType,
                  description: kpiDetails.kpiDescription,
                  kpiTarget: kpiDetails.kpiTarget,
                  minimumTarget: kpiDetails.minimumTarget,
                  uom: kpiDetails.uom,
                  kpi: { value: selectedKpi, label: kpiDetails.kpiName },
                },
              ],
            };
          } else {
            // console.log("check inside else");
            return prevCat;
          }
        }),
      }));
    } catch (error) {
      console.error("Error fetching KPI details: ", error);
    }
  };

  // Function to handle deletion of a KPI row
  const handleDeleteKpi = (catId: string, rowIndex: number) => {
    setTemplateValues((prev: any) => ({
      ...prev,
      categories: prev.categories.map((prevCat: any) => {
        if (prevCat.catId === catId) {
          return {
            ...prevCat,
            catData: prevCat.catData.filter(
              (_: any, index: number) => index !== rowIndex
            ),
          };
        }
        return prevCat;
      }),
    }));
  };

  // Function to handle editing of KPI row
  const handleEdit = (
    catId: string,
    rowIndex: number,
    key: string,
    value: string
  ) => {
    setTemplateValues((prev: any) => ({
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

  // console.log("categorydata", categoryData);
  const filteredCategory = templateValues.categories.find(
    (cat) => cat.catId === catId
  );
  // console.log("filteredCategory in edit", filteredCategory);

  return (
    <div className={classes.tableContainer}>
      {filteredCategory &&
        filteredCategory.catData &&
        filteredCategory.catData.length > 0 && (
          <table className={classes.styledTable}>
            <thead>
              <tr>
                <th className={classes.tableHeaderCell}>KPI Name</th>
                <th className={classes.tableHeaderCell}>KPI Target</th>
                <th className={classes.tableHeaderCell}>KPI Target Type</th>
                <th className={classes.tableHeaderCell}>Description</th>
                {/* <th className={classes.tableHeaderCell}>Minimum Target</th> */}
                <th className={classes.tableHeaderCell}>UOM</th>
                <th className={classes.tableHeaderCell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategory.catData.map((rowData, index) => (
                <tr key={index}>
                  <td className={classes.tableCell}>{rowData.kpiName}</td>
                  <td className={classes.tableCell}>
                    <input
                      type="text"
                      value={rowData.kpiTarget}
                      disabled={readMode}
                      onChange={(e) =>
                        handleEdit(
                          filteredCategory.catId,
                          index,
                          "kpiTarget",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className={classes.tableCell}>{rowData.kpiTargetType}</td>
                  <td className={classes.tableCell}>{rowData.description}</td>
                  {/* <td className={classes.tableCell}>
                    <input
                      type="text"
                      value={rowData.minimumTarget}
                      disabled={readMode}
                      onChange={(e) =>
                        handleEdit(
                          filteredCategory.catId,
                          index,
                          "minimumTarget",
                          e.target.value
                        )
                      }
                    />
                  </td> */}
                  <td className={classes.tableCell}>{rowData.uom}</td>
                  <td className={classes.tableCell}>
                    <button
                      disabled={readMode}
                      onClick={() =>
                        handleDeleteKpi(filteredCategory.catId, index)
                      }
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
};

export default KpiReportTemplateDesignContainer;
