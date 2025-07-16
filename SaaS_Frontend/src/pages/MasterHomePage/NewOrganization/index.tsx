import React, { useState } from "react";
import FormStepper from "../../../components/FormStepper";
import CreateOrgForm from "../../../components/CreateOrgForm";
import OrgAdminFormContainer from "../../../containers/OrgAdminFormContainer";
import ConnectedApps from "../../ConnectedApps";
import ActiveModulesForm from "../../../components/ActiveModulesForm";
import { useRecoilState, useRecoilValue } from "recoil";
import { orgFormData, orgAdminCount } from "../../../recoil/atom";
import axios from "../../../apis/axios.global";
import { useSnackbar } from "notistack";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../../components/BackButton";
import checkRoles from "../../../utils/checkRoles";
import { orgForm } from "../../../schemas/orgForm";
import BusinessAndFunctions from "../../../components/BusinessAndFunctions";
import getAppUrl from "utils/getAppUrl";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import AppField from "../../../components/AppField";
import AIConfigComoponent from "components/AiConfigComponent";
import License from "components/License";

type Props = {};

const steps = [
  "Organization",
  "Organization Admin",
  // 'Technical Configuration',
  // "MCOE Admin",
  "Business Configuration",
  "AI Configuration",
  // "Functions",
  // "System Configuration",

  "Modules",
  "App Fields",
  "Connected Apps",
  "Licenses",
];

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
    paddingTop: theme.typography.pxToRem(20),
  },
  paper: {
    backgroundColor: "#F7F7FF",
    marginLeft: theme.typography.pxToRem(2),
    padding: theme.typography.pxToRem(20),
    marginTop: theme.typography.pxToRem(2),
    borderRadius: theme.typography.pxToRem(10),
    height: "100%",
  },
}));

/**
 *
 * The new organization page is required to create a new organization and edit it.
 */

function NewOrganization({}: Props) {
  const [formValues, setFormValues] = useRecoilState(orgFormData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const realmName = getAppUrl();
  const orgAdmins = useRecoilValue(orgAdminCount);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const classes = useStyles();

  let isOrgAdmin = checkRoles("ORG-ADMIN");

  let params = useParams();
  let paramArg = params.name;
  let edit = paramArg ? true : false;

  //Ai Config States
  const [apiKeys, setApiKeys] = useState<any>({
    OpenAI: "",
    Together: "",
    Anthropic: "",
  });
  const [formData, setFormData] = useState<any>({
    Summary: { model: undefined, prompt: "", client: "OpenAI" },
    MCQ: { model: undefined, prompt: "", client: "OpenAI" },
    Chat: { model: undefined, prompt: "", client: "OpenAI" },
    Template: { model: undefined, prompt: "", client: "OpenAI" },
    Extractions: { model: undefined, prompt: "", client: "OpenAI" },
    DrawingMetadata: { model: undefined, prompt: "", client: "Anthropic" },
    DrawingSummary: { model: undefined, prompt: "", client: "Anthropic" },
    HiraChat: { model: undefined, prompt: "", client: "OpenAI" },
  });

  if (realmName !== "master") {
    edit = true;
  } else {
    edit = paramArg ? true : false;
  }

  const forms = [
    { form: <CreateOrgForm isEdit={edit} /> },
    { form: <OrgAdminFormContainer /> },
    // { form: <TechnicalConfigForm /> },
    // { form: <MCOEAdminFormContainer /> },
    { form: <BusinessAndFunctions isEdit={edit} /> },

    // { form : <AIConfigComoponent /> },

    // { form: <FunctionsSetting /> },
    // { form: <BusinessConfigForm isEdit={edit} /> },
    {
      ...(activeModules?.includes("AI_FEATURES") && {
        form: (
          <AIConfigComoponent
            formValues={formData}
            setFormValues={setFormData}
            apiKeys={apiKeys}
            setApiKeys={setApiKeys}
          />
        ),
      }),
    },
    {
      form: (
        <ActiveModulesForm
          activeModules={activeModules}
          setActiveModules={setActiveModules}
        />
      ),
    },
    { form: <AppField /> },
    { form: <ConnectedApps /> },
    { form: <License isEdit={edit} formValues={formValues} /> },
  ];

  const getActiveModules = async (realm: string) => {
    await axios(`/api/organization/getAllActiveModules/${realm}`)
      .then((res) => {
        setActiveModules([...res.data.activeModules]);
        if (
          res?.data?.activeModules?.includes("AI_FEATURES") &&
          !steps.includes("AI Configuration")
        ) {
          // Insert a new string at the 3rd index
          steps.splice(3, 0, "AI Configuration");
          // forms.splice(3, 0, { form: <AIConfigComoponent /> });
        }
      })
      .catch((err) => console.error(err));
  };

  const handleSubmit = async () => {
    if (edit) {
      if (
        Boolean(formValues.entityType[0].name === "") ||
        Boolean(formValues.systemType[0].name === "") ||
        !Boolean(formValues.fiscalYearQuarters) ||
        !Boolean(formValues.auditYear)
      ) {
        enqueueSnackbar(
          `Add at least one Entity Type, Section, Fiscal Year Quarter and Audit Year`,
          { variant: "warning" }
        );
      } else {

        if(!formValues.entityType.some((item:any)=>item.default === true)){
          enqueueSnackbar(
            `In Entity Type, only one can be checked as default`,
            { variant: "warning" }
          );
          return 
        }
        setIsLoading(true);
        let finalVal = {
          businessUnit: formValues.businessUnit,
          entityType: formValues.entityType,
          section: formValues.section,
          systemType: formValues.systemType,
          fiscalYearQuarters: formValues.fiscalYearQuarters,
          auditYear: formValues.auditYear,
          fiscalYearFormat: formValues.fiscalYearFormat,
          aiConfig: {
            apiKeys: apiKeys,
            featureConfigs: formData,
          },
        };
        await axios
          .put(`/api/organization/${formValues.id}`, finalVal)
          .then(async () => {
            const encodedModules = activeModules.map((module) =>
              encodeURIComponent(module)
            );
            console.log("activeModules", activeModules);
            console.log("encodedmodules", encodedModules);
            await axios
              .post(
                `/api/organization/addActiveModules/${
                  formValues.realmName
                }?data=${JSON.stringify(encodedModules)}`
              )
              .then(() => {
                setFormValues(orgForm);
                setIsLoading(false);
                navigate("/settings");
                enqueueSnackbar(`Organization Successfully Saved`, {
                  variant: "success",
                });
              });
          })
          .catch((err) => {
            setIsLoading(false);
            enqueueSnackbar(`${err?.response?.data?.message}`, {
              variant: "error",
            });
          });
      }
    } else if (!edit) {
      if (formValues.organizationName === "") {
        enqueueSnackbar(`Add Organization to Continue`, {
          variant: "error",
        });
      }
      if (orgAdmins === 0) {
        enqueueSnackbar(`Add at least one Org Admin`, {
          variant: "error",
        });
      }
      if (
        Boolean(formValues.entityType[0].name === "") ||
        Boolean(formValues.systemType[0].name === "") ||
        !Boolean(formValues.fiscalYearQuarters) ||
        !Boolean(formValues.auditYear)
      ) {
        enqueueSnackbar(
          `Add at least one Entity Type, Section and Fiscal Year Quarter`,
          { variant: "warning" }
        );
      }
      if (activeModules.length === 0) {
        enqueueSnackbar(`Select at least one module`, { variant: "warning" });
      } else {
        if(!formValues.entityType.some((item:any)=>item.default === true)){
          enqueueSnackbar(
            `In Entity Type, only one can be checked as default`,
            { variant: "warning" }
          );
          return 
        }
        setIsLoading(true);
        let businessConfig = {
          businessUnit: formValues.businessUnit?.filter(
            (item: any) => item.name !== ""
          ),
          entityType: formValues.entityType.filter(
            (item: any) =>
              item.name !== "" &&
              item.name !== "Department" &&
              item.name !== "department"
          ),
          section: formValues.section.filter((item: any) => item.name !== ""),
          systemType: formValues.systemType.filter(
            (item: any) => item.name !== ""
          ),
          fiscalYearQuarters: formValues.fiscalYearQuarters,
          fiscalYearFormat: formValues.fiscalYearFormat,
          auditYear: formValues.auditYear,
        };
        await axios
          .post(
            `/api/organization/business/createBusinessConfig/${formValues.id}`,
            businessConfig
          )
          .then(async () => {
            console.log(
              "active modules",
              activeModules,
              JSON.stringify(activeModules)
            );
            const encodedModules = activeModules.map((module) =>
              encodeURIComponent(module)
            );
            await axios
              .post(
                `/api/organization/addActiveModules/${
                  formValues.realmName
                }?data=${JSON.stringify(encodedModules)}`
              )
              .then(() => {
                setIsLoading(false);
                navigate("/settings");
                enqueueSnackbar(`Organization Successfully created`, {
                  variant: "success",
                });
              });
          })
          .catch((err) => {
            setIsLoading(false);
            enqueueSnackbar(`${err.response.data.message}`, {
              variant: "error",
            });
          });
      }
    }
  };

  React.useEffect(() => {
    if (edit) {
      try {
        setIsLoading(true);

        axios
          .get(`/api/organization/${paramArg ? paramArg : realmName}`)
          .then((data) => {
            let finalData = {
              ...data.data,
              businessUnit: data?.data?.businessUnit?.length
                ? data.data.businessUnit
                : [""],
              entityType: data?.data?.entityType?.length
                ? data.data.entityType
                : [""],
              systemType: data?.data?.systemType?.length
                ? data?.data?.systemType
                : [""],
              section: data?.data?.section?.length ? data?.data?.section : [""],
            };
            // if (!finalData?.aiConfig?.featureConfigs?.DrawingMetadata) {
            //   setFormData({
            //     ...finalData?.aiConfig?.featureConfigs,
            //     DrawingMetadata: {
            //       model: undefined,
            //       prompt: "",
            //       client: "Anthropic",
            //     },
            //     DrawingSummary: {
            //       model: undefined,
            //       prompt: "",
            //       client: "Anthropic",
            //     },
            //   });
            // } else {
            //   setFormData(finalData.aiConfig?.featureConfigs || formData);
            // }
            // if (!finalData?.aiConfig?.featureConfigs?.HiraChat) {
            //   setFormData({
            //     ...finalData?.aiConfig?.featureConfigs,
            //     HiraChat: { model: undefined, prompt: "", client: "OpenAI" },
            //   });
            // }
            const updatedFeatureConfigs = {
              ...formData, // Start with defaults
              ...(finalData.aiConfig?.featureConfigs || {}), // Override with API values if present
            };
  
            setFormData(updatedFeatureConfigs);
            setApiKeys(finalData.aiConfig?.apiKeys || apiKeys);
            setFormValues(finalData);
            setIsLoading(false);
            getActiveModules(finalData.realmName);
          });
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }
  }, []);

  // useEffect(() => {
  //   console.log("checksettings active modules", activeModules);
  //   console.log("checksettings steps", steps);
  //   console.log("checksettings forms", forms);
  // }, [activeModules]);

  return (
    <div className={classes.root}>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10%",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <Paper elevation={0} className={classes.paper}>
          <FormStepper
            steps={steps}
            forms={forms}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            handleNext={() => {
              setActiveStep((prevActiveStep) => prevActiveStep + 1);
            }}
            handleBack={() => {
              if (activeStep === 0) {
                return;
              } else {
                setActiveStep((prevActiveStep) => prevActiveStep - 1);
              }
            }}
            handleFinalSubmit={handleSubmit}
            backBtn={
              !isOrgAdmin ? <BackButton parentPageLink="/master" /> : null
            }
          />
        </Paper>
      )}
    </div>
  );
}

export default NewOrganization;