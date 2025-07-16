//react
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

//material-ui
import { CircularProgress, Grid } from "@material-ui/core";

//utils
import { riskConfig, RiskConfigSchema } from "schemas/riskConfigSchema";
import axios from "apis/axios.global";
import checkRoles from "utils/checkRoles";

//styles
import { makeStyles } from "@material-ui/core/styles";

//thirdparty libs
import { useSnackbar } from "notistack";

//components
import RiskConfigurationStepperForm1 from "components/RiskRegister/RiskConfiguration/RiskConfifurationFormStepper/RiskConfigurationStepperForm1";
import RiskConfigurationStepperForm2 from "components/RiskRegister/RiskConfiguration/RiskConfifurationFormStepper/RiskConfigurationStepperForm2";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxHeight: "calc(76vh - 12vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px", // Adjust the height value as needed
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
}));

const RiskConfigurationFormStepper = () => {
  const [riskConfigData, setRiskConfigData] =
    useState<RiskConfigSchema>(riskConfig);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const params = useParams<any>();
  const id = params.id;
  const edit = id ? true : false;
  const steps = ["Risk Configuration", "Risk Significance Settings"];
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const haveAccess = isOrgAdmin || isMR;
  const classes = useStyles();
  const forms = [
    {
      form: (
        <>
          <RiskConfigurationStepperForm1
            riskConfigData={riskConfigData}
            setRiskConfigData={setRiskConfigData}
            edit={edit}
          />
        </>
      ),
    },
    {
      form: (
        <>
          <RiskConfigurationStepperForm1
            riskConfigData={riskConfigData}
            setRiskConfigData={setRiskConfigData}
            edit={edit}
          />
          <RiskConfigurationStepperForm2
            riskConfigData={riskConfigData}
            setRiskConfigData={setRiskConfigData}
            edit={edit}
            id={id}
          />
        </>
      ),
    },
  ];

  useEffect(() => {
    if (edit) {
      getRiskConfigById();
    }
  }, []);

  useEffect(() => {
    console.log("check risk config data-->", riskConfigData);
  }, [riskConfigData]);

  //util function used to filter empty objects from riskCumulative and riskFactorial arrays
  const filterEmptyObjects = (arr: any[]) => {
    return arr.filter((item: any) => {
      const isEmptyObject =
        item.criteriaType === "" &&
        item.score1Text === "" &&
        item.score2Text === "" &&
        item.score3Text === "" &&
        item.score4Text === "";
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

  const getRiskConfigById = async () => {
    try {
      const res = await axios.get(`/api/riskconfig/${id}`);
      setRiskConfigData({
        id: res.data._id,
        category: res.data.riskCategory,
        condition: res.data.condition,
        riskType: res.data.riskType,
        impactType: res.data?.impactType?.length
          ? res.data?.impactType
          : [{ name: "" }],
        riskCumulativeHeader: res.data.riskCumulativeHeader,
        riskCumulative: res.data.riskCumulative,
        riskFactorial: res.data.riskFactorial,
        riskSignificance: res.data.riskSignificance,
        computationType: res.data.computationType,
      });

      // console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  //util function to validate risk config details of form stepper 1
  function isRiskConfigValid(data: RiskConfigSchema): boolean {
    const isCategoryValid = data.category.trim() !== "";
    const isConditionValid = data.condition.some(
      (o: any) => o.name.trim() !== ""
    );
    const isTypeValid = data.riskType.some((t: any) => t.name.trim() !== "");
    return isCategoryValid && isConditionValid && isTypeValid;
  }

  const validateConfigForm = () => {
    const isValid = isRiskConfigValid(riskConfigData);
    return isValid;
  };

  //if stepper is in edit mode, make a patch request to update risk config details
  const patchRiskConfig = async () => {
    if (haveAccess) {
      const riskConfig = {
        riskCategory: riskConfigData.category,
        condition: riskConfigData.condition,
        riskType: riskConfigData.riskType,
        impactType: riskConfigData.impactType,
      };

      try {
        const res = await axios.patch(`/api/riskconfig/${id}`, riskConfig);
        // if (res.status === 200 || res.status === 201) {
        navigate(
          `/risk/riskconfiguration/stepper/${params.riskcategory}/${res.data._id}`
        );
        // enqueueSnackbar(`Risk Config Updated Successfully!`, {
        //   variant: "success",
        // });
        getRiskConfigById();
        setActiveStep(1);
        // }
      } catch (error: any) {
        console.log(error);
        // if (error.statusCode === 409) {
        //   enqueueSnackbar(`Risk Config Already Exists!`, {
        //     variant: "error",
        //   });
        // }
      }
    }
    return;
  };

  //patch request to update riskCumulative and riskFactorial arrays
  const patchRiskSignificance = async () => {
    if (haveAccess) {
      const filteredRiskCumulative = filterEmptyObjects(
        riskConfigData.riskCumulative
      );
      const filteredRiskFactorial = filterEmptyObjects(
        riskConfigData.riskFactorial
      );
      const filteredRiskSignificance = filterEmptyObjectsS(
        riskConfigData.riskSignificance
      );
      const patchObject = {
        riskCumulative: filteredRiskCumulative,
        riskFactorial: filteredRiskFactorial,
        riskSignificance: filteredRiskSignificance,
        riskCumulativeHeader: riskConfigData.riskCumulativeHeader,
        computationType: riskConfigData.computationType,
      };
      try {
        const res = await axios.patch(`/api/riskconfig/${id}`, patchObject);
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(`Risk Config updated successfully`, {
            variant: "success",
          });
          // console.log("checkconfig in final submit", params);

          navigate(`/risk/riskconfiguration/${params.riskcategory}`);
        } else {
          enqueueSnackbar(`Error in Updating Risk Impact`, {
            variant: "error",
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
    return;
  };

  //create a new risk config with details from stepper 1 and navigate to stepper 2
  const createRiskConfig = async () => {
    //filter empty name stringrs from impactType array
    const filteredImpactType = riskConfigData.impactType.filter(
      (item: any) => item.name.trim() !== ""
    );

    console.log("filtered impact type: ", filteredImpactType);

    if (haveAccess) {
      const riskConfig = {
        riskCategory: riskConfigData.category,
        condition: riskConfigData.condition,
        riskType: riskConfigData.riskType,
        riskCumulativeHeader: riskConfigData.riskCumulativeHeader,
        impactType: filteredImpactType,
      };
      try {
        const res = await axios.post("/api/riskconfig", riskConfig);
        if (res.status === 200 || res.status === 201) {
          navigate(
            `/risk/riskconfiguration/stepper/${params.riskcategory}/${res.data._id}`
          );
          enqueueSnackbar(`Risk Config Created Successfully!`, {
            variant: "success",
          });
          setActiveStep(1);
        }
      } catch (error) {
        console.log(error);
        enqueueSnackbar(`Risk Config Already Exists!`, {
          variant: "error",
        });
      }
    }
    return;
  };

  const handleNext = () => {
    if (activeStep === 0 && validateConfigForm()) {
      // console.log("checkconfig params in iskfa", params);

      if (edit) {
        patchRiskConfig();
      } else {
        createRiskConfig();
      }
    } else if (activeStep === 1) {
      patchRiskSignificance();
      setActiveStep(2);
    } else {
      enqueueSnackbar(`Please fill all required fields`, {
        variant: "error",
      });
    }
  };

  return (
    <>
      <div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </div>
        ) : (
          <Grid container alignItems="center" justifyContent="space-between">
            {/* <Typography color="primary" variant="h6">
            Risk Configuration
          </Typography> */}
            <RiskConfigurationStepperForm2
              riskConfigData={riskConfigData}
              setRiskConfigData={setRiskConfigData}
              edit={edit}
              id={id}
            />
            {/* <FormStepper
            steps={steps}
            forms={forms}
            label="Risk Configuration"
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            handleNext={handleNext}
            handleFinalSubmit={patchRiskSignificance}
            handleBack={() =>
              setActiveStep((prevActiveStep) => prevActiveStep - 1)
            }
            backBtn={<BackButton parentPageLink="/risk/riskconfiguration" />}
          /> */}
          </Grid>
        )}
      </div>
    </>
  );
};

export default RiskConfigurationFormStepper;
