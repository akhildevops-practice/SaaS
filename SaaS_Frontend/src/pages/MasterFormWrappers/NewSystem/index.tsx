import React, { useEffect, useState } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { CircularProgress, Paper, Typography } from "@material-ui/core";
import SingleFormWrapper from "containers/SingleFormWrapper";
import { useStyles } from "./styles";
import SystemDetailForm from "components/MasterAddOrEditForm/SystemDetailForm";
import { systemDetailFormData } from "recoil/atom";
import { clauseData } from "recoil/atom";
import EditableTable from "components/EditableTable";
import {
  findClause,
  findSystem,
  postClauses,
  postSystem,
  updateClause,
  updateSystem,
} from "apis/systemApi";
import { useLocation, useNavigate } from "react-router-dom";
import { getSystemTypes } from "apis/systemApi";
import checkRoles from "utils/checkRoles";
import getAppUrl from "utils/getAppUrl";
import { useSnackbar } from "notistack";
import axios from "apis/axios.global";
import { isValidMasterName } from "utils/validateInput";

type Props = {
  data?: any;
  deletedId?: any;
};

const NewSystem = ({ data, deletedId }: Props) => {
  const classes = useStyles();
  const [formData, setFormData] = useRecoilState(systemDetailFormData);
  const [systemTypes, setSystemTypes] = useState<any>([]);
  const [systemNames, setSystemNames] = useState<any>([]);
  const [clauses, setClauses] = useRecoilState(clauseData);
  const [isLoading, setIsLoading] = useState<any>(false);
  const resetSystemDetails = useResetRecoilState(systemDetailFormData);
  const resetClauses = useResetRecoilState(clauseData);
  const [isAutoCompleteEnabled, setAutoCompleteEnabled] = useState(false);
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isAdmin = checkRoles("admin");
  const isMR = checkRoles("MR");
  const orgId = sessionStorage.getItem("orgId");
  const location: any = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const userdetails: any = sessionStorage.getItem("userDetails");
  const userid: any = JSON.parse(userdetails).id;
  const actionData: any = {
    isAction: true,
    actions: [
      {
        label: "Edit",
        icon: "icon",
        handler: () => console.log("handler"),
      },
    ],
  };

  const dummyHeadersData = [
    "Requirement /Clauses",
    "Requirement",
    "Description",
  ];
  const dummyFieldsData = ["number", "name", "description"];

  /**
   * @method handleDiscard
   * @description Function to remove all the details from the system master form
   * @returns nothing
   */
  const handleDiscard = () => {
    resetSystemDetails();
    resetClauses();
  };

  /**
   * @method handleSubmit
   * @description Function to submit system master form data
   * @returns nothing
   */
  const handleSubmit = async (option: string) => {
    const validatefunctionId = await isValidMasterName(formData.systemName);

    if (validatefunctionId.isValid === false) {
      enqueueSnackbar(`System Name ${validatefunctionId?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
    if (option === "Submit") {
      const payload: any = {
        type: formData.systemType,
        name: formData.systemName.trim(),
        description: formData.description,
        // clauses: clauses,
        applicable_locations: formData.location,
        status: formData.status,
        integratedSystems: formData.integratedSystems,
      };

      if (location?.state?.edit) {
        if (isOrgAdmin) {
          updateSystem(location?.state?.id, payload)
            .then(async (response: any) => {
              try {
                await axios.post(
                  `${process.env.REACT_APP_PY_URL}/pyapi/systemDtlsToVB`,
                  response.data
                );
              } catch (error) {}
              if (response?.response?.data?.error) {
                enqueueSnackbar(`${response?.response?.data?.message}`, {
                  variant: "error",
                });
                // const res = await axios.post(
                //   `/api/audit-trial/createAuditTrial`,
                //   {
                //     moduleType: "SYSTEM",
                //     actionType: "UPDATE",
                //     transactionId: response.response.data._id,
                //     actionBy: userid,
                //   }
                // );
                return;
              } else {
                navigate("/master", {
                  state: {
                    redirectToTab: "SYSTEM",
                  },
                });
                resetSystemDetails();
              }
            })
            .catch((response: any) => {
              enqueueSnackbar("Something went wrong!", { variant: "error" });
            });
          updateClause(location?.state?.id, clauses)
            .then(async (response: any) => {
              try {
                await axios.post(
                  `${process.env.REACT_APP_PY_URL}/pyapi/clauseDtlsToVB`,
                  response.data
                );
              } catch (error) {}
              if (response?.response?.data?.error) {
                enqueueSnackbar(`${response?.response?.data?.message}`, {
                  variant: "error",
                });
                return;
              } else {
                navigate("/master", {
                  state: {
                    redirectToTab: "SYSTEM",
                  },
                });
                resetSystemDetails();
              }
            })
            .catch((response: any) => {
              enqueueSnackbar("Something went wrong!", { variant: "error" });
            });
        } else {
          enqueueSnackbar("Only MCOE Can Update System Clause Master");
        }
      } else {
        if (
          formData?.systemName !== "" &&
          formData?.systemType !== "" &&
          formData?.location?.length !== 0
          // &&
          // ((formData?.status === true &&
          //   formData?.integratedSystems.length >= 2) ||
          //   formData?.status === false)
        ) {
          postSystem(payload)
            .then(async (response: any) => {
              //console.log("response in post sytem", response?.status);
              const systemId = response?.data?._id;
              const commonProperties = {
                systemId: systemId,
                organizationId: orgId,
              };

              const clausePayLoad = clauses.map((clause: any) => ({
                ...clause,
                ...commonProperties,
                name: clause.name.trim(),
                number: clause.number.trim(),
              }));
              postClauses(clausePayLoad).then(async (response: any) => {
                try {
                  await axios.post(
                    `${process.env.REACT_APP_PY_URL}/pyapi/clauseDtlsToVB`,
                    response.data
                  );
                } catch (error) {} 
              });
              if (response?.status === 409) {
                const response = await axios.get(
                  `api/globalsearch/getRecycleBinList`
                );
                const data = response?.data;
                //console.log("data", data);
                const entityDocuments = data.find(
                  (item: any) => item.type === "systems"
                );

                // If there are entity documents
                if (entityDocuments) {
                  // Check if the name already exists
                  const existingEntity = entityDocuments.documents.find(
                    (doc: any) => doc.name === formData?.systemName
                  );

                  // Return true if the name exists, otherwise false
                  if (existingEntity) {
                    enqueueSnackbar(
                      `System with the same name already exists, please check in Recycle bin and Restore if required`,
                      {
                        variant: "error",
                      }
                    );
                    // navigate("/master", {
                    //   state: { redirectToTab: "Recycle Bin" },
                    // });
                  } else {
                    //console.log("inside else");
                    enqueueSnackbar(
                      `System with the same name already exists,
                  Please choose other name`,
                      {
                        variant: "error",
                      }
                    );
                  }
                }
              } else {
                // const res = await axios.post(
                //   `/api/audit-trial/createAuditTrial`,
                //   {
                //     moduleType: "SYSTEM",
                //     actionType: "CREATE",
                //     transactionId: response?.response?.data?._id,
                //     actionBy: userid,
                //   }
                // );
                if (response?.response?.data?.error) {
                  enqueueSnackbar(`${response?.response?.data?.message}`, {
                    variant: "error",
                  });
                  return;
                }
                navigate("/master", {
                  state: {
                    redirectToTab: "SYSTEM",
                  },
                });
                resetSystemDetails();
                resetClauses();
              }
            })
            .catch((error: any) => {
              console.log("error response", { error });
              enqueueSnackbar("Something went wrong!", { variant: "error" });
            });
        } else {
          enqueueSnackbar("Enter the required fields!", { variant: "error" });
        }
      }
    }

    if (option === "Duplicate") {
      setFormData({
        ...formData,
        systemName: "",
      });
      if (clauses) {
        const updatedClauses = clauses.map((clause: any) => ({
          description: clause.description,
          name: clause.name.trim(),
          number: clause.number.trim(),
          organizationId: orgId,
          systemId: location?.state?.id,
        }));
        setClauses(updatedClauses);
      }

      const { edit, ...rest } = location.state;
      location.state = rest;
    }
  };

  /**
   * @method parseSystemTypes
   * @description Function to print system types
   * @param data {any}
   * @returns an array of system types
   */
  const parseSystemTypes = (data: any) => {
    const systemTypes: any = [];
    data.map((item: any) => {
      systemTypes.push({
        name: item.name,
        id: item.id,
      });
    });
    return systemTypes;
  };

  /**
   * @method fetchSystemTypes
   * @description Function to fetch system types
   * @returns nothing
   */
  const fetchSystemTypes = () => {
    try {
      getSystemTypes(getAppUrl())
        .then(async (response: any) => {
          setSystemTypes(parseSystemTypes(response?.data));
        })
        .catch((error: any) => {
          enqueueSnackbar("Something went wrong while fetching system types!", {
            variant: "error",
          });
        });
    } catch (error) {
      // Handle any errors that occur in the try block here
      console.error("An error occurred in the try block:", error);
    }
  };

  /**
   * @method fetchSystemNames
   * @description Function to fetch system Names
   * @returns nothing
   */

  /**
   * @method fetchSystemData
   * @description Function to fetch system data based on the provided id when edit state is true
   * @param id {string}
   * @returns nothing
   */
  const fetchSystemData = (id: string) => {
    findSystem(id).then((response: any) => {
      setFormData({
        systemType: response?.data?.type?.id,
        systemName: response?.data?.name,
        description: response?.data?.description,
        location: response?.data?.applicable_locations,
        integratedSystems: response?.data.integratedSystems,
        status: response?.data.status,
      });
      findClause(id).then((response: any) => {
        setClauses(response?.data);
      });
    });
  };

  useEffect(() => {
    fetchSystemTypes();
    (deletedId || location?.state?.edit || location?.state?.read) &&
      fetchSystemData(deletedId ? deletedId : location?.state?.id);
  }, []);

  return (
    // <>
    <div className={classes.scroll}>
      <SingleFormWrapper
        parentPageLink="/master"
        handleSubmit={handleSubmit}
        handleDiscard={handleDiscard}
        backBtn={false}
        redirectToTab="SYSTEM"
        splitButton={true}
        label="System Clause Master"
        onSubmit={handleSubmit}
        options={location?.state?.edit ? ["Submit", "Duplicate"] : ["Submit"]}
        customButtonStyle={{
          width: location?.state?.edit ? "120px" : "87px",
          height: "37px",
          marginRight: "20px",
          backgroundColor: "#E8F3F9",
          color: "#fff",
        }}
        disableOption={
          !(isOrgAdmin || isMR || isLocAdmin) ? ["Submit", "Duplicate"] : []
        }
      >
        <form>
          <SystemDetailForm
            isEdit={
              location?.state?.read && !(isOrgAdmin || isMR || isLocAdmin)
                ? true
                : false
            }
            initVal={formData}
            handleDiscard={handleDiscard}
            handleSubmit={handleSubmit}
            isLoading={false}
            rerender={false}
            systemTypes={systemTypes}
            isAutoCompleteEnabled={isAutoCompleteEnabled}
            setAutoCompleteEnabled={setAutoCompleteEnabled}
            disabledForDeletedModal={deletedId ? true : false}
          />

          {!formData.status && (
            <div className={classes.displaySection}>
              {!isLoading ? (
                <Paper elevation={0} className={classes.root}>
                  <Typography align="center" className={classes.title}>
                    Applicable Clauses
                  </Typography>
                  <div className={classes.tableSection}>
                    <div className={classes.table}>
                      <EditableTable
                        header={dummyHeadersData}
                        fields={dummyFieldsData}
                        data={clauses}
                        setData={setClauses}
                        isAction={actionData.isAction}
                        actions={actionData.actions}
                        isEdit={location?.state?.edit}
                        systemId={location?.state?.id}
                        orgId={orgId}
                        disabled={!isOrgAdmin}
                        addFields={true}
                        disabledForDeletedModal={deletedId ? true : false}
                        label={"Add Clause"}
                      />
                    </div>
                  </div>
                </Paper>
              ) : (
                <div className={classes.loader}>
                  <CircularProgress />
                </div>
              )}
            </div>
          )}
        </form>
      </SingleFormWrapper>
    </div>
    // </>
  );
};

export default NewSystem;
