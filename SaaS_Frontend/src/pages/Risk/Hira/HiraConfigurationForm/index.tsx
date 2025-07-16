//react
import { useState, useEffect } from "react";

//mui
import {
  Typography,
  Grid,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import { MdInfo } from 'react-icons/md';

//assets
import riskGuideline from "assets/images/riskGuideline.png";

//utils
// import { HiraConfigSchema, RiskConfigSchema } from "schemas/riskConfigSchema";
import checkRoles from "utils/checkRoles";
import useStyles from "./styles";
import { useSnackbar } from "notistack";
import { MdChevronLeft } from 'react-icons/md';
//components
import RiskLevelIndicatorTable from "components/RiskRegister/RiskConfiguration/RiskConfifurationFormStepper/RiskConfigurationStepperForm2/RiskLevelIndicatorTable";
//components
import DynamicFormFields from "components/DynamicFormFields";
import HiraMatrixTable from "components/Risk/Hira/HiraConfiguration/HiraConfigurationTab/HiraMatrixTable";
import { Button, Popover } from "antd";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import { validateTitle } from "utils/validateInput";

import {
  hiraConfig,
  HiraConfigSchema,
} from "schemas/riskConfigSchema";
import { useLocation, useNavigate } from "react-router-dom";
const HiraConfigurationForm = (
//   {
//   hiraConfigData,
//   setHiraConfigData,
//   edit,
//   id,
// }
) => {
  const location = useLocation()
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<any>([]);
  const [tableDataS, setTableDataS] = useState<any>([]);
  const [headerValues, setHeaderValues] = useState<any>([
    "Criteria Type",
    "1",
    "2",
    "3",
    "4",
    "5",
  ]);
  const [hiraConfigData, setHiraConfigData] =
  useState<HiraConfigSchema>(hiraConfig);

  const userDetails = getSessionStorage();
  // const isMR = checkRoles(roles.MR);
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
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
    // riskColor : "",
    riskLevel: "",
    description: "",
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
    },
  ];

  //below text and content for info icon popover in config tab

  const text = <span>Risk Guideline</span>;

  const content = (
    <div>
      <img src={riskGuideline} alt="risk-guideline" />
    </div>
  );

  // useEffect(() => {
  //   console.log("checkhira id edit", id, edit);
  // }, [id, edit]);

  const significanceCols = [
    {
      header: "Risk Indicator*",
      accessorKey: "riskIndicator",
    },
    {
      header: "Description*",
      accessorKey: "description",
    },
    {
      header: "Risk Level*",
      accessorKey: "riskLevel",
    },
  ];
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const canEdit = isOrgAdmin || isMR;
  const [isDataLoading, setIsDataLoading] = useState<any>(false);

  const getRiskConfigById = async () => {
    try {
      const res = await axios.get(`/api/riskconfig/getconfigbyid/${location?.state?.id}`);
      // console.log("checkhira config data", res);
      if (res.status === 200) {
        if (res?.data?.data) {
          const data = res?.data?.data;
          setHiraConfigData({
            id: data._id,
            riskCategory: data?.riskCategory,
            riskType: data?.riskType,
            condition: data?.condition,
            hiraMatrixHeader: data?.hiraMatrixHeader
              ? data?.hiraMatrixHeader?.map((item: any) => {
                  if (!item) return "";
                  else return item;
                })
              : ["Cirteria Type", "1", "2", "3", "4", "5"],
            hiraMatrixData: data?.hiraMatrixData,
            riskLevelData: data?.riskLevelData,
            titleLabel : data?.titleLabel,
            basicStepLabel : data?.basicStepLabel,
          });
          setHeaderValues(
            data?.hiraMatrixHeader?.length
              ? data?.hiraMatrixHeader?.map((item: any) => {
                  if (!item) return "";
                  else return item;
                })
              : ["Criteria Type", "1", "2", "3", "4", "5"]
          );
          const hiraMatrixData = data?.hiraMatrixData as any[];
          if (hiraMatrixData.length > 0 && canEdit) {
            if (!hasEmptyObjectInArray(hiraMatrixData)) {
              //push EMPTY_ROW if there is no empty row
              hiraMatrixData.push(EMPTY_ROW);
            }
          } else {
            //push empty row if the array is empty
            if (canEdit) hiraMatrixData.push(EMPTY_ROW);
          }

          const riskLevelData = data?.riskLevelData as any[];
          // console.log("risk significance data", riskSignificanceData);

          if (riskLevelData?.length > 0 && canEdit) {
            if (!hasEmptyObjectInArrayS(riskLevelData)) {
              riskLevelData.push(EMPTY_ROW_S);
            }
          } else {
            if (canEdit) riskLevelData.push(EMPTY_ROW_S);
          }

          setTableData([...hiraMatrixData]);

          setTableDataS([...riskLevelData]);
          setIsDataLoading(false);
        }
      }
    } catch (error) {
      setIsDataLoading(false);
      console.log(error);
    }
  };

  const createInitialRiskConfig = () => {
    setHiraConfigData({
      riskCategory: "",
      riskType: [
        { name: "Routine" },
        { name: "Non-Routine" }
      ],
      condition: [
        { name: "Normal" },
        { name: "Abnormal" },
        { name: "Emergency" }
      ],
      titleLabel : "Job Title",
      basicStepLabel : "Basic Step of Job",
      hiraMatrixHeader: ["Criteria Type", "1", "2", "3", "4", "5"],
      hiraMatrixData: [
        {
          criteriaType: "Minor",
          score1Text: "First Aid Case (FAC)",
          score2Text: "Community concern and complaint raised with unit management",
          score3Text: "Chemical spill / Waste discharge within statutory limits. Largely contained within. No off-site impact.",
          score4Text: "Minor fire attended to by site fire brigade or onsite responders, Loss of production < 1 hr.",
          score5Text: "Loss of production < 1 hr. Equipment damage with loss up to 3.75 lacs INR"
        },
        {
          criteriaType: "Moderate",
          score1Text: "MTC or Health effects requiring medical treatment at a hospital or by an offsite medical Practitioner",
          score2Text: "Community concern and few local media publicity",
          score3Text: "Chemical spill / Waste discharge / Gas release. Volume 1-10 m3 or equivalent vol. of gas.",
          score4Text: "Minor Fire/explosion Extinguished by onsite brigade or responders.",
          score5Text: "Loss of production < 4 hrs shutdown, equipment damage, Loss of > 3.75 lacs but < 11.25 lacs INR"
        },
        {
          criteriaType: "Severe",
          score1Text: "RWC or health effects including temporary partial disability / occupational illness.",
          score2Text: "Community concern and Prominent Local media publicity.",
          score3Text: "Chemical spill / Waste discharge / Gas release. Volume 10-100 m3 or equivalent vol. of gas.",
          score4Text: "Fire or explosion Response required from local fire service.",
          score5Text: "Loss of production < 24 hrs. shutdown and/or financial loss, equipment / facility damage."
        },
        {
          criteriaType: "Major",
          score1Text: "LTA / Multiple RWC from an accident or occupational illness with irreversible health damage.",
          score2Text: "Community complaint and Regional to National media publicity.",
          score3Text: "Extended breach of statutory limits or prescribed internal standards.",
          score4Text: "Fire or explosion with Significant damage to equipment and/or buildings.",
          score5Text: "Loss of production / business interruption > 24 hrs shutdown, Facility damage to tune of 37.5 lacs to 3.75 Cr. INR"
        },
        {
          criteriaType: "Catastrophic",
          score1Text: "1 Fatality or more or Total Permanent Disability case.",
          score2Text: "Major Community complaint & Major national and International media publicity / coverage.",
          score3Text: "Spillage or Release Chemical / hazardous waste of volume more than 1000 m3.",
          score4Text: "Fire or explosion Response required from outside agencies; possible offsite consequences.",
          score5Text: "> 3 days’ shutdown with business interruption, Catastrophic Facility damage > 3.75 Cr. INR"
        }
      ],
      riskLevelData: [
        {
          riskIndicator: "Low Risk-#52c41a",
          riskLevel: "<=-3",
          description: "teste"
        },
        {
          riskIndicator: "Medium Risk-#ffec3d",
          riskLevel: "<=-9",
          description: "teasdf"
        },
        {
          riskIndicator: "High  Risk-#FF8C00",
          riskLevel: "<=-12",
          description: "asdasd"
        },
        {
          riskIndicator: "Extreme Risk-#f5222d",
          riskLevel: "<=-25",
          description: "updated"
        }
      ]
    });
    setIsDataLoading(false);
  };
  
  useEffect(() => {
    setIsDataLoading(true);
    if (location?.state?.edit) {
      getRiskConfigById();
    } else {
      createInitialRiskConfig();
    }
  }, [location?.state?.id]);

  useEffect(() => {
    if (!isDataLoading) {
      const hiraMatrixData = hiraConfigData?.hiraMatrixData as any[];
      if (hiraMatrixData.length > 0 && canEdit) {
        if (!hasEmptyObjectInArray(hiraMatrixData)) {
          //push EMPTY_ROW if there is no empty row
          hiraMatrixData.push(EMPTY_ROW);
        }
      } else {
        //push empty row if the array is empty
        if (canEdit) hiraMatrixData.push(EMPTY_ROW);
      }

      const riskLevelData = hiraConfigData?.riskLevelData as any[];
      // console.log("risk significance data", riskSignificanceData);

      if (riskLevelData?.length > 0 && canEdit) {
        if (!hasEmptyObjectInArrayS(riskLevelData)) {
          riskLevelData.push(EMPTY_ROW_S);
        }
      } else {
        if (canEdit) riskLevelData.push(EMPTY_ROW_S);
      }

      setTableData([...hiraMatrixData]);

      setTableDataS([...riskLevelData]);
    }
  }, [hiraConfigData]);
  // useEffect(() => {
  //   console.log("checkrisk useEffect[hiraConfigData]", hiraConfigData);
  // }, [hiraConfigData]);

  //util function used to check riskFactorial and hiraMatrixData arrays for empty objects
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

  //util function used to check riskLevelData array for empty objects
  const hasEmptyObjectInArrayS = (array: any[]) => {
    return array.some((item) => {
      return item.riskIndicator === "" && item.riskLevel === "";
    });
  };

  //util function used to filter out empty objects from riskFactorial and hiraMatrixData arrays
  const filterEmptyObjects = (arr: any[]) => {
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

  //util function used to filter out empty objects from riskLevelData array

  const filterEmptyObjectsS = (arr: any[]) => {
    return arr.filter((item: any) => {
      const isEmptyObject = item.riskIndicator === "" && item.riskLevel === "";
      return !isEmptyObject;
    });
  };

  //handleBlur, handleCreate, handleUpdate and handleDelete used for hiraMatrixData table
  const handleBlur = (row: any) => {
    // console.log("checkhira in handleBlur row", row);

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
        // console.log("invalid row in cumulative");
        enqueueSnackbar(`Criteria type and Atleast One Scoring is Required`, {
          variant: "error",
        });
        handleDelete(row);
      } else {
        // console.log("check handleupdate called in else");

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
      // console.log("checkhira handlecreate called in else");

      handleCreate(row);
    }
  };

  const handleCreate = (row: any) => {
    let cumulativeData = [...tableData] as any[];
    // console.log("checkrisk in handleCreate, ", cumulativeData);
    // console.log("checkrisk in handleCreate row, ", row);

    cumulativeData = filterEmptyObjects(cumulativeData);

    // console.log("checkrisk cumuluativedata after filter, ", cumulativeData);

    const newRiskConfigData = {
      ...hiraConfigData,
      hiraMatrixData: cumulativeData,
      // riskCumulativeHeader: headerValues,
    };
    // console.log("check in handleCreate hiraConfigData", newRiskConfigData);

    setHiraConfigData(newRiskConfigData);
  };

  const handleUpdate = (row: any) => {
    const cumulativeData = hiraConfigData?.hiraMatrixData as any[];
    let newCumulativeData = cumulativeData.map((item) => {
      if (item._id === row._id) {
        return row;
      }
      return item;
    });

    newCumulativeData = filterEmptyObjects(newCumulativeData);
    const newRiskConfigData = {
      ...hiraConfigData,
      hiraMatrixData: newCumulativeData,
      // riskCumulativeHeader: headerValues,
    };
    // console.log("check in handleUpdate hiraConfigData", newRiskConfigData);

    setHiraConfigData(newRiskConfigData);
  };

  const handleDelete = (row: any) => {
    const rowIndex = row.index;
    const newCumulativeData = tableData.filter((item: any, index: any) => {
      // Check if the specified properties of the object are all empty strings
      const isEmptyObject =
        item.criteriaType === "" &&
        item.score1Text === "" &&
        item.score2Text === "" &&
        item.score3Text === "" &&
        item.score4Text === "" &&
        item.score5Text === "";
      // Filter out the object with matching _id and the empty object
      return index !== rowIndex && !isEmptyObject;
    });

    const newRiskConfigData = {
      ...hiraConfigData,
      hiraMatrixData: newCumulativeData,
      // riskCumulativeHeader: headerValues,
    };

    setHiraConfigData(newRiskConfigData);
  };

  //handleBlur and handleUpdate for risks significance grid
  const handleBlurS = (row: any) => {
    console.log("checkrisk in handleBlurS, ", row);

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
      // console.log("check row in handleBlurS, ", row);

      handleCreateS(row);
    }
  };

  const handleCreateS = (row: any) => {
    let significanceData = [...tableDataS] as any[];
    significanceData = filterEmptyObjectsS(significanceData);
    // console.log("significanceData", significanceData);

    const newRiskConfigData = {
      ...hiraConfigData,
      riskLevelData: significanceData,
    };
    setHiraConfigData(newRiskConfigData);
  };

  // const handleCreateS = (row: any) => {
  //   let significanceData = [...tableDataS];
  //   const [indicator, color] = row.riskIndicator.split("-");
  //   significanceData.push({
  //     ...row,
  //     riskIndicator: indicator,
  //     riskIndicatorColor: color,
  //   });

  //   significanceData = filterEmptyObjectsS(significanceData);

  //   const newRiskConfigData = {
  //     ...hiraConfigData,
  //     riskLevelData: significanceData,
  //   };
  //   setHiraConfigData(newRiskConfigData);
  // };
  const handleUpdateS = (row: any) => {
    const significanceData = hiraConfigData?.riskLevelData as any[];
    let newSignificanceData = significanceData.map((item) => {
      if (item._id === row._id) {
        return row;
      }
      return item;
    });
    newSignificanceData = filterEmptyObjectsS(newSignificanceData);
    const newRiskConfigData = {
      ...hiraConfigData,
      riskLevelData: newSignificanceData,
    };
    setHiraConfigData(newRiskConfigData);
  };

  const handleDeleteS = (row: any) => {
    // console.log("checkrisk in handleDeleteS check row, ", row);
    const rowIndex = row.index;
    const newSignificanceData = tableDataS.filter(
      (item: any, index: any) => index !== rowIndex
    );
    // console.log(
    //   "checkrisk in handleDeleteS check newSignificanceData, ",
    //   newSignificanceData
    // );
    const newRiskConfigData = {
      ...hiraConfigData,
      riskLevelData: newSignificanceData,
    };
    setTableDataS(newSignificanceData);
    setHiraConfigData(newRiskConfigData);
  };

  const handleSubmitHiraConfigOld = async () => {
    try {
      // console.log("checkhira hiraConfigData", hiraConfigData);

      const filteredHiraMatrixData = filterEmptyObjects(
        hiraConfigData.hiraMatrixData
      );

      const filteredRiskLevelData = filterEmptyObjectsS(
        hiraConfigData.riskLevelData
      );
      const hiraConfigDataToBeUpdated = {
        hiraMatrixData: filteredHiraMatrixData,
        riskLevelData: filteredRiskLevelData,
        riskType: hiraConfigData.riskType,
        hiraMatrixHeader: hiraConfigData?.hiraMatrixHeader?.length
          ? hiraConfigData.hiraMatrixHeader?.map((item: any) => {
              if (!item) return "";
              else return item;
            })
          : ["Criteria Type", "1", "2", "3", "4", "5"],
      };

      let hasValidationError = false;
      const errorMessages: any = [];

      // Validate hiraMatrixData
      hiraConfigDataToBeUpdated?.hiraMatrixData?.forEach(
        (item: any, index: any) => {
          const fieldsToValidate = [
            { name: "criteriaType", value: item.criteriaType },
            { name: "score1Text", value: item.score1Text },
            { name: "score2Text", value: item.score2Text },
            { name: "score3Text", value: item.score3Text },
            { name: "score4Text", value: item.score4Text },
            { name: "score5Text", value: item.score5Text },
          ];

          fieldsToValidate?.forEach(({ name, value }) => {
            validateTitle(name, value, (error) => {
              if (error) {
                const errorMessage = `Row ${
                  index + 1
                }, field ${name}: ${error}`;
                errorMessages.push(errorMessage);
                hasValidationError = true;
              }
            });
          });
        }
      );

      // Validate hiraMatrixHeader
      hiraConfigDataToBeUpdated?.hiraMatrixHeader?.forEach(
        (header: any, index: any) => {
          validateTitle("header", header, (error) => {
            if (error) {
              const errorMessage = `Header ${index + 1}: ${error}`;
              errorMessages.push(errorMessage);
              hasValidationError = true;
            }
          });
        }
      );

      // Validate riskLevelData fields (riskIndicator, description)
      hiraConfigDataToBeUpdated?.riskLevelData?.forEach(
        (item: any, index: any) => {
          const fieldsToValidate = [
            { name: "riskIndicator", value: item.riskIndicator },
            // { name: 'description', value: item.description },
          ];

          fieldsToValidate?.forEach(({ name, value }) => {
            validateTitle(name, value, (error) => {
              if (error) {
                const errorMessage = `Risk Level ${
                  index + 1
                }, field ${name}: ${error}`;
                errorMessages.push(errorMessage);
                hasValidationError = true;
              }
            });
          });
        }
      );

      hiraConfigData?.condition?.forEach((item: any, index: any) => {
        const fieldsToValidate = [{ name: "name", value: item.name }];
        fieldsToValidate?.forEach(({ name, value }) => {
          validateTitle(name, value, (error) => {
            if (error) {
              const errorMessage = `Condition ${
                index + 1
              }, field ${name}: ${error}`;
              errorMessages.push(errorMessage);
              hasValidationError = true;
            }
          });
        });
      });

      hiraConfigDataToBeUpdated?.riskType?.forEach((item: any, index: any) => {
        const fieldsToValidate = [{ name: "name", value: item.name }];
        fieldsToValidate?.forEach(({ name, value }) => {
          validateTitle(name, value, (error) => {
            if (error) {
              const errorMessage = `Hira Type ${
                index + 1
              }, field ${name}: ${error}`;
              errorMessages.push(errorMessage);
              hasValidationError = true;
            }
          });
        });
      });

      if (hasValidationError) {
        // Show all error messages in one snackbar
        enqueueSnackbar(errorMessages?.join("\n"), {
          variant: "warning",
          autoHideDuration: 5000, // Increase duration for longer messages
          style: { whiteSpace: "pre-line" }, // To display each message on a new line
        });
        return;
      }

      // console.log(
      //   "checkhira hiraConfigDataToBeUpdated",
      //   hiraConfigDataToBeUpdated
      // );
      const res = await axios.patch(
        `/api/riskconfig/updateHiraConfig/${hiraConfigData.id}`,
        hiraConfigDataToBeUpdated
      );
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(`Hira Configuration Updated Successfully`, {
          variant: "success",
        });
      } else {
        enqueueSnackbar(
          `Something went wrong while updating Hira Configuration`,
          {
            variant: "error",
          }
        );
      }
    } catch (error) {
      // console.log("error in handleSubmitHiraConfig", error);
    }
  };

  const handleSubmitHiraConfig = async () => {
    try {
      // console.log("checkhira hiraConfigData", hiraConfigData);

      // Filter out empty objects
      const filteredHiraMatrixData = filterEmptyObjects(
        hiraConfigData.hiraMatrixData
      );
      const filteredRiskLevelData = filterEmptyObjectsS(
        hiraConfigData.riskLevelData
      );

      // Prepare data to be sent in API request
      const hiraConfigDataToBeSubmitted = {
        hiraMatrixData: filteredHiraMatrixData,
        riskLevelData: filteredRiskLevelData,
        riskType: hiraConfigData.riskType,
        condition: hiraConfigData.condition,
        riskCategory: hiraConfigData.riskCategory || "HIRA",
        hiraMatrixHeader: hiraConfigData?.hiraMatrixHeader?.length
          ? hiraConfigData.hiraMatrixHeader.map((item: any) =>
              item ? item : ""
            )
          : ["Criteria Type", "1", "2", "3", "4", "5"],
        organizationId: userDetails?.organizationId,
        createdBy: userDetails?.id,
        titleLabel : hiraConfigData?.titleLabel,
        basicStepLabel : hiraConfigData?.basicStepLabel,
      };

      let hasValidationError = false;
      const errorMessages: any = [];

      // Validate hiraMatrixData
      hiraConfigDataToBeSubmitted?.hiraMatrixData?.forEach(
        (item: any, index: any) => {
          const fieldsToValidate = [
            { name: "criteriaType", value: item.criteriaType },
            { name: "score1Text", value: item.score1Text },
            { name: "score2Text", value: item.score2Text },
            { name: "score3Text", value: item.score3Text },
            { name: "score4Text", value: item.score4Text },
            { name: "score5Text", value: item.score5Text },
          ];

          fieldsToValidate.forEach(({ name, value }) => {
            validateTitle(name, value, (error) => {
              if (error) {
                const errorMessage = `Row ${
                  index + 1
                }, field ${name}: ${error}`;
                errorMessages.push(errorMessage);
                hasValidationError = true;
              }
            });
          });
        }
      );

      // Validate hiraMatrixHeader
      hiraConfigDataToBeSubmitted?.hiraMatrixHeader?.forEach(
        (header: any, index: any) => {
          validateTitle("header", header, (error) => {
            if (error) {
              const errorMessage = `Header ${index + 1}: ${error}`;
              errorMessages.push(errorMessage);
              hasValidationError = true;
            }
          });
        }
      );

      // Validate riskLevelData fields (riskIndicator, description)
      hiraConfigDataToBeSubmitted?.riskLevelData?.forEach(
        (item: any, index: any) => {
          const fieldsToValidate = [
            { name: "riskIndicator", value: item.riskIndicator },
            { name: "description", value: item.description },
          ];

          fieldsToValidate.forEach(({ name, value }) => {
            validateTitle(name, value, (error) => {
              if (error) {
                const errorMessage = `Risk Level ${
                  index + 1
                }, field ${name}: ${error}`;
                errorMessages.push(errorMessage);
                hasValidationError = true;
              }
            });
          });
        }
      );

      // Validate Condition field
      hiraConfigDataToBeSubmitted?.condition?.forEach(
        (item: any, index: any) => {
          validateTitle("name", item.name, (error) => {
            if (error) {
              const errorMessage = `Condition ${
                index + 1
              }, field name: ${error}`;
              errorMessages.push(errorMessage);
              hasValidationError = true;
            }
          });
        }
      );

      // Validate Risk Type
      hiraConfigDataToBeSubmitted?.riskType?.forEach(
        (item: any, index: any) => {
          validateTitle("name", item.name, (error) => {
            if (error) {
              const errorMessage = `Hira Type ${
                index + 1
              }, field name: ${error}`;
              errorMessages.push(errorMessage);
              hasValidationError = true;
            }
          });
        }
      );

      if (hasValidationError) {
        enqueueSnackbar(errorMessages?.join("\n"), {
          variant: "warning",
          autoHideDuration: 5000,
          style: { whiteSpace: "pre-line" },
        });
        return;
      }

      // console.log(
      //   "checkhira hiraConfigDataToBeSubmitted",
      //   hiraConfigDataToBeSubmitted
      // );

      let res;
      if (location?.state?.edit) {
        // Update API (PATCH)
        res = await axios.patch(
          `/api/riskconfig/updateHiraConfig/${hiraConfigData.id}`,
          hiraConfigDataToBeSubmitted
        );
      } else {
        // Create API (POST)
        res = await axios.post(
          `/api/riskconfig/createHiraConfig`,
          hiraConfigDataToBeSubmitted
        );
      }

      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(
          `Hira Configuration ${location?.state?.edit ? "Updated" : "Created"} Successfully`,
          {
            variant: "success",
          }
        );

        // If it's a new creation, set the returned ID and data
        if (!location?.state?.edit) {
          const data = res.data;
          setHiraConfigData({
            id: data?._id,
            riskCategory: data?.riskCategory,
            riskType: data?.riskType,
            condition: data?.condition,
            hiraMatrixHeader: data?.hiraMatrixHeader,
            hiraMatrixData: data?.hiraMatrixData,
            riskLevelData: data?.riskLevelData,
            titleLabel : data?.titleLabel,
            basicStepLabel : data?.basicStepLabel,
          });
        }
        navigate(`/risk/riskconfiguration/HIRA`);
      } else {
        enqueueSnackbar(
          `Something went wrong while ${
            location?.state?.edit ? "updating" : "creating"
          } Hira Configuration`,
          { variant: "error" }
        );
      }
    } catch (error) {
      enqueueSnackbar("API request failed!", { variant: "error" });
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    // console.log("checkhira handleChange", name, value);

    setHiraConfigData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      {isDataLoading ? (
        <Grid
          container
          style={{ height: "100vh" }} // Makes the loader take full height of viewport
          alignItems="center" // Centers vertically
          justifyContent="center" // Centers horizontally
        >
          <CircularProgress />
        </Grid>
      ) : (
        <>
          <div className={classes.root}>
          <Button
                data-testid="single-form-wrapper-button"
                onClick={() => navigate(`/risk/riskconfiguration/HIRA`)}
                style={{
                  marginLeft: "15px",
                  display:"flex"
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button>
            <Grid container>
              <Grid item xs={12} md={6}>
                <Grid container>
                  <Grid
                    item
                    sm={12}
                    md={4}
                    className={classes.formTextPadding}
                    style={{ marginBottom: "48px" }}
                  >
                    <strong>Category*</strong>
                  </Grid>
                  <Grid item sm={12} md={6} className={classes.formBox}>
                    <TextField
                      fullWidth
                      minRows={1}
                      multiline
                      style={{ width: "89%" }}
                      name="riskCategory"
                      value={hiraConfigData.riskCategory || ""}
                      variant="outlined"
                      onChange={handleChange}
                      size="small"
                      // disabled={true}
                    />
                  </Grid>
                </Grid>
              </Grid>
              {/* Title Label field */}
              <Grid item xs={12} md={6}>
                <Grid container>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Title Label:</strong>
                  </Grid>
                  <Grid item sm={12} md={6} className={classes.formBox}>
                    <TextField
                      fullWidth
                      minRows={1}
                      multiline
                      style={{ width: "89%" }}
                      name="titleLabel"
                      value={hiraConfigData.titleLabel || ""}
                      variant="outlined"
                      onChange={handleChange}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Basic Step Label field */}
              <Grid item xs={12} md={6}>
                <Grid container>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Basic Step Label:</strong>
                  </Grid>
                  <Grid item sm={12} md={6} className={classes.formBox}>
                    <TextField
                      fullWidth
                      minRows={1}
                      multiline
                      style={{ width: "89%" }}
                      name="basicStepLabel"
                      value={hiraConfigData.basicStepLabel || ""}
                      variant="outlined"
                      onChange={handleChange}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* New Condition field */}
              <Grid item xs={12} md={6}>
                <Grid container>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Condition*</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <DynamicFormFields
                      data={hiraConfigData}
                      setData={setHiraConfigData}
                      name="condition"
                      keyName="name"
                      canEdit={!!isMCOE}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sm={12} md={6}>
                <Grid container>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Risk Types*</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <DynamicFormFields
                      data={hiraConfigData}
                      setData={setHiraConfigData}
                      name="riskType"
                      keyName="name"
                      canEdit={!!isMCOE}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <div
              style={{ backgroundColor: "white" }}
              className={classes.tableContainer}
            >
              <Typography variant="h6" className={classes.tableHeader}>
                Risk Matrix Setup
                <Popover
                  placement="right"
                  title={text}
                  content={content}
                  trigger="click"
                >
                  <MdInfo />
                </Popover>
              </Typography>

              <HiraMatrixTable
                columns={cols}
                data={tableData}
                setData={setTableData}
                handleBlur={handleBlur}
                canEdit={!!isMCOE}
                isAction={true}
                handleDelete={handleDelete}
                headerValues={headerValues}
                setHeaderValues={setHeaderValues}
                hiraConfigData={hiraConfigData}
                setHiraConfigData={setHiraConfigData}
              />
              <br />
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
                    canEdit={!!isMCOE}
                  />
                </div>
              </>
            </div>
            {!!isMCOE && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "10px",
                }}
              >
                <Button
                  style={{
                    float: "right",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#003566",
                    color: "white",
                  }}
                  // type="primary"
                  // disabled={!isMCOE}
                  onClick={() => handleSubmitHiraConfig()}
                >
                  Submit
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default HiraConfigurationForm;
