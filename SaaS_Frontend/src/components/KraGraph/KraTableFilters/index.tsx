import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "apis/axios.global";
import styles from "./style";
import { useMediaQuery } from "@material-ui/core";

type props = {
  selectedObjectiveIds?: any;
  setSelectedObjectiveId?: any;
  getQuaterData?: any;
  getDayData?: any;
  getMonthlyData?: any;
  getMonthWiseData?: any;
  getQuartarWiseData?: any;
  getDayWiseData?: any;
  selectedOptionForObjective?: any;
  setSelectedOptionForObjective?: any;
};

const KraTableFilters = ({
  selectedObjectiveIds,
  setSelectedObjectiveId,
  selectedOptionForObjective,
  setSelectedOptionForObjective,
  getQuaterData,
  getDayData,
  getMonthlyData,
  getMonthWiseData,
  getQuartarWiseData,
  getDayWiseData,
}: props) => {
  const matches = useMediaQuery("(min-width:600px)");
  const classes = styles();
  const [selectedObjective, setSelectedObjective] = useState<any>([]);

  console.log("selectedOptionForObjective", selectedOptionForObjective);

  useEffect(() => {
    if (selectedObjectiveIds && selectedObjectiveIds.length > 0) {
      setSelectedObjective([]); // Clear previous objectives
      setSelectedOptionForObjective(null); // Reset selected option
      getData();
    } else {
      setSelectedObjective([]); // Clear if no selectedObjectiveIds
      setSelectedOptionForObjective(null); // Reset selected option
    }
  }, [selectedObjectiveIds]);

  const getData = async () => {
    try {
      const res = await axios.get(
        `/api/kpi-definition/getObjectiveByIds?ids=${selectedObjectiveIds.join(
          ","
        )}`
      );
      setSelectedObjective(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching objectives:", error);
      setSelectedObjective([]);
    }
  };

  const handleChange = (value: any) => {
    setSelectedOptionForObjective(value); // Update selected option state
    setSelectedObjectiveId(value);

    // Do something with the selected value
  };

  const options = selectedObjective?.map((obj: any) => ({
    label: obj?.ObjectiveName, // Display the name
    value: obj?._id, // Use the ID as the value
  }));

  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <Select
        // mode="multiple"
        allowClear
        style={{
          width: "100%",
          border: "1px solid black",
          borderRadius: "5px",
        }}
        placeholder="Please select Objective"
        value={selectedOptionForObjective}
        onChange={handleChange}
        options={options}
        className={classes.Select}
      />
    </div>
  );
};

export default KraTableFilters;
