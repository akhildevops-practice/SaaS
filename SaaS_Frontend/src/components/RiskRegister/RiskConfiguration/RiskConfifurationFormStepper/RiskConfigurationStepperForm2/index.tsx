//react
import { useState, useEffect } from "react";

//mui
import { Typography } from "@material-ui/core";


//antd
import type { CheckboxChangeEvent } from "antd/es/checkbox";

//utils
import { RiskConfigSchema } from "schemas/riskConfigSchema";
import checkRoles from "utils/checkRoles";
import useStyles from "./styles";
import { useSnackbar } from "notistack";

//components
import RiskMatrixTable from "components/RiskRegister/RiskConfiguration/RiskConfifurationFormStepper/RiskConfigurationStepperForm2/RiskMatrixTable";
import RiskLevelIndicatorTable from "components/RiskRegister/RiskConfiguration/RiskConfifurationFormStepper/RiskConfigurationStepperForm2/RiskLevelIndicatorTable";


interface Props {
  riskConfigData: RiskConfigSchema;
  setRiskConfigData: (data: RiskConfigSchema) => void;
  edit?: boolean;
  id?: string;
}



const RiskConfigurationStepperForm2 = ({
  riskConfigData,
  setRiskConfigData,
  edit,
  id,
}: Props) => {
  const [tableData, setTableData] = useState<any>([]);
  const [tableDataF, setTableDataF] = useState<any>([]);
  const [tableDataS, setTableDataS] = useState<any>([]);
  const [displayChecked, setDisplayChecked] = useState<boolean>(false);
  const [headerValues, setHeaderValues] = useState(["Criteria Type","1", "2", "3", "4", "5"]);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const EMPTY_ROW = {
    criteriaType: "",
    score1Text: "",
    score2Text: "",
    score3Text: "",
    score4Text: "",
    score5Text: "",
  };

  const EMPTY_ROW_S = {
    riskIndicator: "",
    riskLevel: "",
  };

  const cols = [
    {
      header: " ",
      accessorKey: "criteriaType",
    },
    {
      header: "1",
      accessorKey: "score1Text",
    },
    {
      header: "2",
      accessorKey: "score2Text",
    },
    {
      header: "3",
      accessorKey: "score3Text",
    },
    {
      header: "4",
      accessorKey: "score4Text",
    },
    {
      header: "5",
      accessorKey: "score5Text",
    }
  ];

  useEffect(()=>{
    console.log("checkrisk   useEffect[riskConfigData]", riskConfigData);
    
  },[riskConfigData])

  const significanceCols = [
    {
      header: "Risk Indicator*",
      accessorKey: "riskIndicator",
    },
    {
      header: "Risk Level*",
      accessorKey: "riskLevel",
    },
  ];
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const canEdit = isOrgAdmin || isMR;

  useEffect(() => {
    console.log("checkrisk edit value", edit);
    
    //if edit is true, then populate the table with data for riskCumulative and riskFactorial table
    if (edit) {
      setHeaderValues(riskConfigData?.riskCumulativeHeader || ["1", "2", "3", "4", "5"]);
      const cumulativeData = riskConfigData?.riskCumulative as any[];
      if (cumulativeData.length > 0 && canEdit) {
        if (!hasEmptyObjectInArray(cumulativeData)) {
          //push EMPTY_ROW if there is no empty row
          cumulativeData.push(EMPTY_ROW);
        }
      } else {
        //push empty row if the array is empty
        if (canEdit) cumulativeData.push(EMPTY_ROW);
      }
      const factorialData = riskConfigData?.riskFactorial as any[];
      if (factorialData.length > 0 && canEdit) {
        if (!hasEmptyObjectInArray(factorialData)) {
          factorialData.push(EMPTY_ROW);
        }
      } else {
        if (canEdit) factorialData.push(EMPTY_ROW);
      }

      const riskSignificanceData = riskConfigData?.riskSignificance as any[];
      // console.log("risk significance data", riskSignificanceData);

      if (riskSignificanceData?.length > 0 && canEdit) {
        if (!hasEmptyObjectInArrayS(riskSignificanceData)) {
          riskSignificanceData.push(EMPTY_ROW_S);
        }
      } else {
        if (canEdit) riskSignificanceData.push(EMPTY_ROW_S);
      }

      setTableData([...cumulativeData]);
      setTableDataF([...factorialData]);
      // console.log("checkconfig riskSignificanceData", riskSignificanceData);
      
      setTableDataS([...riskSignificanceData]);
    }
    //if edit is false, then populate the table with empty row
    else {
     
      
      const cumulativeData = [...riskConfigData?.riskCumulative] ,
      
        riskSignificanceArr = [];
      cumulativeData.push(EMPTY_ROW);
     
      riskSignificanceArr.push(EMPTY_ROW_S);
      console.log("checkrisk in useEffect else", cumulativeData);
      setTableData([...cumulativeData]);


      setTableDataS([...riskSignificanceArr]);
    }


  }, [riskConfigData?.riskCumulative]);



  //util function used to check riskFactorial and riskCumulative arrays for empty objects
  const hasEmptyObjectInArray = (array: any[]) => {
    return array.some((item) => {
      return (
        item.criteriaType === "" &&
        item.score1Text === "" &&
        item.score2Text === "" &&
        item.score3Text === "" &&
        item.score4Text === "" &&
        item.score5Text === ""
      );
    });
  };

  //util function used to check riskSignificance array for empty objects
  const hasEmptyObjectInArrayS = (array: any[]) => {
    return array.some((item) => {
      return item.riskIndicator === "" && item.riskLevel === "";
    });
  };

  //util function used to filter out empty objects from riskFactorial and riskCumulative arrays
  const filterEmptyObjects = (arr: any[]) => {
    console.log("checkrisk arr in filterEmptyObjects", arr);
    
    return arr.filter((item: any) => {
      const isEmptyObject =
        item.criteriaType === "" &&
        item.score1Text === "" &&
        item.score2Text === "" &&
        item.score3Text === "" &&
        item.score4Text === "" &&
        item.score5Text === "";
      return !isEmptyObject;
    });
  };

  //util function used to filter out empty objects from riskSignificance array

  const filterEmptyObjectsS = (arr: any[]) => {
    return arr.filter((item: any) => {
      const isEmptyObject = item.riskIndicator === "" && item.riskLevel === "";
      return !isEmptyObject;
    });
  };

  //checkbox onChange
  const onChange = (e: CheckboxChangeEvent) => {
    // console.log(`checked = ${e.target.checked}`);
    setDisplayChecked(e.target.checked);
  };
  const handleSelectChange = (value: string) => {
    // console.log(`selected ${value}`);
    setRiskConfigData({
      ...riskConfigData,
      computationType: value,
    });
  };

  //handleBlur, handleCreate, handleUpdate and handleDelete used for riskCumulative table
  const handleBlur = (row: any) => {
    console.log("checkrisk row in handleBlur", row);
    
    if (row._id) {
      if (
        !(
          !!row.criteriaType &&
          !!(
            !!row.score1Text ||
            !!row.score2Text ||
            !!row.score3Text ||
            !!row.score4Text ||
            !!row.score5Text
          )
        )
      ) {
        console.log("checkrisk invalid row in cumulative");
        enqueueSnackbar(`Criteria type and Atleast One Scoring is Required`, {
          variant: "error",
        });
        handleDelete(row);
      } else {
        console.log("checkrisk handleupdate called in else");
        
        handleUpdate(row);
      }
    } else if (
      !!row.criteriaType &&
      !!(
        !!row.score1Text ||
        !!row.score2Text ||
        !!row.score3Text ||
        !!row.score4Text ||
        !!row.score5Text
      )
    ) {
      console.log("checkrisk row in handleBlur else if", row);
      
      handleCreate(row);
    }
  };

  const handleCreate = (row: any) => {
    // const cumulativeData = [...tableData] as any[];
    const cumulativeData = filterEmptyObjects([...tableData] as any);
    const newRiskConfigData = {
      ...riskConfigData,
      riskCumulative: cumulativeData,
      // riskCumulativeHeader: headerValues,
    };
    setRiskConfigData(newRiskConfigData);
  };

  const handleUpdate = (row: any) => {
    const cumulativeData = riskConfigData?.riskCumulative as any[];
    let newCumulativeData = cumulativeData.map((item) => {
      if (item._id === row._id) {
        return row;
      }
      return item;
    });

    newCumulativeData = filterEmptyObjects(newCumulativeData);
    const newRiskConfigData = {
      ...riskConfigData,
      riskCumulative: newCumulativeData,
      // riskCumulativeHeader: headerValues,

    };
    console.log("check in handleUpdate riskConfigData", newRiskConfigData);
    
    setRiskConfigData(newRiskConfigData);
  };

  const handleDelete = (row: any) => {
    const newCumulativeData = tableData.filter((item: any) => {
      // Check if the specified properties of the object are all empty strings
      const isEmptyObject =
        item.criteriaType === "" &&
        item.score1Text === "" &&
        item.score2Text === "" &&
        item.score3Text === "" &&
        item.score4Text === "" &&
        item.score5Text === "";
      // Filter out the object with matching _id and the empty object
      return item._id !== row._id && !isEmptyObject;
    });
    const newRiskConfigData = {
      ...riskConfigData,
      riskCumulative: newCumulativeData,
      // riskCumulativeHeader: headerValues,

    };

    setRiskConfigData(newRiskConfigData);
  };


  //handleBlur and handleUpdate for risks significance grid
  const handleBlurS = (row: any) => {
    console.log("check outside in handleBlurS, ", row);
    
    if (row._id) {
      if (row.riskIndicator === "" || row.riskLevel === "") {
        enqueueSnackbar(`Both the fields are required`, {
          variant: "error",
        });
        handleDeleteS(row);
      } else {
        handleUpdateS(row);
      }
    } else if (!!row.riskIndicator && !!row.riskLevel) {
      console.log("check row in handleBlurS, ", row);
      
      handleCreateS(row);
    }
  };

  const handleCreateS = (row: any) => {
    let significanceData = [...tableDataS] as any[];
    significanceData = filterEmptyObjectsS(significanceData);
    // console.log("significanceData", significanceData);

    const newRiskConfigData = {
      ...riskConfigData,
      riskSignificance: significanceData,
    };
    setRiskConfigData(newRiskConfigData);
  };

  const handleUpdateS = (row: any) => {
    const significanceData = riskConfigData?.riskSignificance as any[];
    let newSignificanceData = significanceData.map((item) => {
      if (item._id === row._id) {
        return row;
      }
      return item;
    });
    newSignificanceData = filterEmptyObjectsS(newSignificanceData);
    const newRiskConfigData = {
      ...riskConfigData,
      riskSignificance: newSignificanceData,
    };
    setRiskConfigData(newRiskConfigData);
  };

  const handleDeleteS = (row: any) => {
    // console.log("in handleDeleteS, ", tableDataS);

    const newSignificanceData = tableDataS.filter((item: any) => {
      // Check if the specified properties of the object are all empty strings
      const isEmptyObject = item.riskIndicator === "" && item.riskLevel === "";
      // Filter out the object with matching _id and the empty object
      return item._id !== row._id && !isEmptyObject;
    });
    // console.log("newSignificanceData", newSignificanceData);

    const newRiskConfigData = {
      ...riskConfigData,
      riskSignificance: newSignificanceData,
    };
    setTableDataS(newSignificanceData);
    setRiskConfigData(newRiskConfigData);
  };

  return (
    <>
      <div className={classes.root}>
        <div
          style={{ backgroundColor: "white" }}
          className={classes.tableContainer}
        >
          <Typography variant="h6" className={classes.tableHeader}>
            Risk Matrix Setup
          </Typography>
          <RiskMatrixTable
            columns={cols}
            data={tableData}
            setData={setTableData}
            handleBlur={handleBlur}
            canEdit={canEdit}
            isAction={true}
            handleDelete={handleDelete}
            headerValues={headerValues}
            setHeaderValues={setHeaderValues}
            riskConfigData={riskConfigData}
            setRiskConfigData={setRiskConfigData}
          />
          {/* <Typography
          variant="h6"
          className={classes.tableHeader}
          style={{ marginTop: "20px" }}
        >
          Factorial Risk Parameters
        </Typography>

        <RiskFactorialTable
          columns={cols}
          data={tableDataF}
          setData={setTableDataF}
          handleBlur={handleBlurF}
          canEdit={canEdit}
          isAction={true}
          handleDelete={handleDeleteF}
        /> */}
          <br />
          {/* <Row style={{ display: "flex", alignItems: "center" }}>
          <Col span={8}>
            {" "}
            <Checkbox checked={displayChecked} onChange={onChange}>
              Display Significance Grid
            </Checkbox>
          </Col>
          <Col span={16}>
            {" "}
            <Select
              aria-label="Select Computation Type"
              defaultValue={"Select Computation Type"}
              style={{ width: "25%" }}
              onChange={handleSelectChange}
              value={
                riskConfigData.computationType
                  ? riskConfigData.computationType
                  : "Select Computation Type"
              }
              options={[
                { value: "type1", label: "Average" },
                { value: "type2", label: "Cumulative*Factorial" },
                { value: "type3", label: "None" },
              ]}
              disabled={!canEdit}
            />
          </Col>
        </Row> */}
          {/* {displayChecked && ( */}
          <>
            <Typography variant="h6" className={classes.tableHeader}>
              Risk Level Indicator
            </Typography>
            <div style={{ marginTop: "10px" }}>
              <RiskLevelIndicatorTable
                columns={significanceCols}
                data={tableDataS}
                setData={setTableDataS}
                handleBlur={handleBlurS}
                isAction={true}
                handleDelete={handleDeleteS}
                canEdit={canEdit}
              />
            </div>
          </>
          {/* )} */}
        </div>
      </div>
    </>
  );
};

export default RiskConfigurationStepperForm2;
