import React, { useEffect, useState } from "react";
import FormStepper from "components/FormStepper";
import EntityForm from "components/MasterAddOrEditForm/EntityForm";
import SingleFormWrapper from "containers/SingleFormWrapper";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import { useRecoilState } from "recoil";
import { deptFormData } from "recoil/atom";
import { CircularProgress } from "@material-ui/core";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import useStyles from "./styles";
import { isValidMasterName } from "utils/validateInput";
import { getEntityByLocationId } from "apis/entityApi";
interface Section {
  id: number;
  name: string;
  organizationId?: string;
  isSubmitted?: boolean;
  isEdit?: boolean;
  createdBy?: string;
  isFirstSubmit?: boolean;
}
type Props = {
  deletedId?: boolean;
};
const steps = ["Department", "Department Head"];

function NewDepartment({ deletedId }: Props) {
  const [selectFieldData, setSelectFieldData] = React.useState<any>({
    location: [],
    // functionId: [],
    // sections: [],
    entityTypes: [],
  });
  const [bu, setBu] = React.useState<any>([]);
  const [formData, setFormData] = useRecoilState(deptFormData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [buttonLoading, setButtonLoading] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [functions, setFunctions] = React.useState<any>([]);
  const [departmentHeadList, setDepartmentHeadList] = React.useState<any>([]);
  const [departmentUsersList, setDepartmentUsersList] = React.useState<any>([]);
  const [isCreated, setIsCreated] = React.useState(false);
  const [sections, setSections] = React.useState<Section[]>([]);
  const [entityOptions, setEntityOptions] = React.useState<any>([]);
  let typeAheadValue: string;
  const orgName = getAppUrl();
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isMR = checkRoles("MR");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isAuditor = checkRoles(roles.AUDITOR);
  const isAdmin = checkRoles("ADMIN");
  const isEntityHead = checkRoles("ENTITY-HEAD");
  const isGeneralUser = checkRoles("GENERAL-USER");
  const params = useParams();
  const paramArg = params.id;
  const edit = paramArg ? true : false;
  const userdetails: any = sessionStorage.getItem("userDetails");
  const userid: any = JSON.parse(userdetails).id;
  const [entityType, setEntityType] = useState<any>({});
  const [redirectToTab, setRedirectToTab] = useState("DEPARTMENTS");
  const locationstate = useLocation();
  useEffect(() => {
    // console.log("navigation state parameters", locationstate.state);
    if (edit) {
      setEntityType({
        id: formData.entityType?.id,
        name: formData?.entityType?.name,
      });
      setRedirectToTab(formData?.entityType?.id);
    } else if (!!locationstate.state) {
      setEntityType({
        id: locationstate.state?.id,
        name: locationstate.state?.name,
      });
      setRedirectToTab(locationstate.state.key);
    }
  }, [locationstate.state, edit]);
  console.log("entity tyoe", edit, entityType, formData.entityType);
  React.useEffect(() => {
    const fetchData = async () => {
      if (isEntityHead || isGeneralUser) {
        setIsLoading(true);

        try {
          const entityResponse = await axios.get(
            `api/entity/getEntityForActiveUser`
          );
          const finalData = {
            ...entityResponse.data,
            // sections: entityResponse.data?.section?.map((item: any) => item.sectionId),
          };
          setFormData(finalData);
          setIsLoading(false);

          getLocationSectionEntityTypes();
          getAllFunctions(finalData.locationId);
          getAllUsersByLocation(finalData.locationId);
          // getBusinessTypes(finalData.locationId);
        } catch (err) {
          setIsLoading(false);
          // console.error(err);
        }
      } else if (edit || deletedId) {
        setIsLoading(true);
        getFullChain();
        try {
          const sectionsResponse = await axios.get(
            `api/business/getAllSectionsForEntity/${
              deletedId ? deletedId : paramArg
            }`
          );
          // console.log("sectionresponse", sectionsResponse);
          const entityResponse = await axios.get(
            `api/entity/getEntity/byId/${deletedId ? deletedId : paramArg}`
          );

          const locationId = entityResponse.data.location.locationId;
          const index =
            entityResponse.data.entityId.indexOf(locationId) +
            locationId.length;
          const result = entityResponse.data.entityId.substring(index);

          const finalData = {
            ...entityResponse.data,
            entityUserId: result,

            sectiondetails: sectionsResponse.data,
            // entityType: entityResponse.data?.entityType?.id,
            // sections: entityResponse.data?.section?.map((item: any) => item.sectionId),
          };
          setFormData(finalData);
          setIsLoading(false);

          getLocationSectionEntityTypes();
          getAllFunctions(finalData.locationId);
          getAllUsersByLocation(finalData.locationId);
          getAllUsersByDepartment(finalData.id);
        } catch (err) {
          setIsLoading(false);
          // console.error(err);
        }
      } else {
        getLocationSectionEntityTypes();
        setFormData(deptFormData);
      }
    };

    fetchData(); // Call the async function
  }, []);

  // console.log("entitytype name in new dept", entityOptions, entityType);

  React.useEffect(() => {
    if (formData.location) {
      getAllFunctions(formData.location.id);
      getAllUsersByLocation(formData.location.id);
      getEntitiesByLocation(formData.location.id);
    }
    if (formData.locationId) {
      getAllFunctions(formData.locationId);
      getAllUsersByLocation(formData.locationId);
    }
    // if (formData?.entityType) {
    //   setEntityType({
    //     id: formData.entityType?.id,
    //     name: formData?.entityType?.name,
    //   });
    //   setRedirectToTab(formData.entityType?.id);
    // }
  }, [formData.locationId, formData.location]);

  // useEffect(() => {
  //   console.log("navigation state parameters", locationstate.state);
  //   if (locationstate.state) {
  //     setEntityType({
  //       id: locationstate.state.id,
  //       name: locationstate.state.name,
  //     });
  //     setRedirectToTab(locationstate.state.key);
  //   } else if (edit) {
  //     setEntityType({
  //       id: formData.entityType?.id,
  //       name: formData?.entityType?.name,
  //     });
  //   }
  // }, [locationstate.state, edit]);
  // useEffect(() => {
  //   console.log("checkdept entityOptions useEffect", entityOptions);
  // }, [entityOptions]);

  const getFullChain = async () => {
    try {
      const res = await axios.get(`/api/entity/getFullEntityChain/${formData.id}`);
      console.log("res in getFullChain", res);
    } catch (error) {
      console.log("error in getFullChain", error);
      
    }
  }


  const handleFinalSubmit = () => {
    navigate("/master", {
      state: {
        redirectToTab: "DEPARTMENTS",
        retain: false,
      },
    });
    enqueueSnackbar(`Entity Saved`, {
      variant: "success",
    });
    setFormData(deptFormData);
  };

  const handleSubmit = async () => {
    const validateEntityName = await isValidMasterName(formData.entityName);
    if (validateEntityName.isValid === false) {
      enqueueSnackbar(`Department name: ${validateEntityName?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
  
    const validateEntityId = await isValidMasterName(formData.entityId);
    if (validateEntityId.isValid === false) {
      enqueueSnackbar(`Dept Id: ${validateEntityId?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
  
    if (edit) {
      const {
        id,
        location,
        locationId,
        functionId,
        sections,
        createdAt,
        ...finalValues
      } = formData;
    
      if (formData.entityName) {
        setButtonLoading(true);
        try {
          const res = await axios.put(`/api/entity/${id}`, {
            ...finalValues,
            entityName: formData.entityName.trim(),
            entityId: formData.entityId.trim(),
            parentId: formData?.department?.id,
            realm: orgName,
            location: locationId,
            functionId: functionId,
            entityTypeId: formData.entityType,
            sections: formData.sections,
            additionalAuditee: formData?.additionalAuditee || [],
            notification: formData?.notification || [],
          });
          if(formData?.department?.id) {
            await axios.post('/api/entity/updateEntityChain', {
              entityId: res.data.id,
              newParentId: formData?.department?.id,
              organizationId: userdetails?.organizationId,
              updatedBy: userid,
            });
          }
          
    
          setButtonLoading(false);
          enqueueSnackbar(`Department Saved Successfully`, {
            variant: "success",
          });
    
          setFormData({
            ...formData,
            id: res.data.id,
          });
    
          setIsCreated(true);
          navigate("/master", {
            state: {
              redirectToTab: redirectToTab,
              retain: false,
            },
          });
        } catch (err: any) {
          setButtonLoading(false);
          enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
            variant: "error",
          });
        }
      } else {
        enqueueSnackbar(`Please fill all required fields`, {
          variant: "warning",
        });
      }
    } else {
      const {
        id,
        locationId,
        functionId,
        createdAt,
        sections,
        ...finalValues
      } = formData;
      if (
        // formData.location &&
        // formData.functionId &&
        // // formData.businessType &&
        formData.entityName &&
        formData.entityId &&
        formData.location
        // &&
        // formData.functions
      ) {
        setButtonLoading(true);
        try {
          try {
            const res = await axios.get(
              `/api/entity/getDeptEntityType/${orgName}`
            );
          } catch (err) {
            // console.error(err);
          }
  
          const res = await axios.post(`/api/entity`, {
            ...finalValues,
            parentId: formData?.department?.id,
            entityName: formData.entityName.trim(),
            entityId: formData.entityId.trim(),
            functionId: formData.functionId ? formData.functionId : null,
            entityTypeId: formData.entityType,
            realm: orgName,
            sections: formData.sections ? formData.sections : null,
            additionalAuditee: formData?.additionalAuditee || [],
            notification: formData?.notification || [],
          });
          if(formData?.department?.id) {
            await axios.post('/api/entity/createEntityChain', {
              newEntityId: res.data.id, // returned ID of the new entity
              parentId: formData?.department?.id, // selected parent
              organizationId: userdetails?.organizationId,
              createdBy: userid,
            });
          }
          
          // const result = await axios.post(`/api/audit-trial/createAuditTrial`, {
          //   moduleType: "DEPARTMENT",
          //   actionType: "CREATE",
          //   transactionId: res.data.id,
          //   actionBy: userid,
          // });
  
          setButtonLoading(false);
          enqueueSnackbar(`Department Created Successfully`, {
            variant: "success",
          });
          setFormData({
            ...formData,
            id: res.data.id,
          });
          setIsCreated(true);
          navigate("/master", {
            state: {
              redirectToTab: redirectToTab,
              // redirectToTab: redirectToTab,
              retain: false,
            },
          });
        } catch (err: any) {
          if (err.response.status === 409) {
            const response = await axios.get(
              `api/globalsearch/getRecycleBinList`
            );
            const data = response?.data;
            // console.log("data", data);
            const entityDocuments = data.find(
              (item: any) => item.type === "Entity"
            );
  
            // If there are entity documents
            if (entityDocuments) {
              // Check if the name already exists
              const existingEntity = entityDocuments.documents.find(
                (doc: any) => doc.entityName === formData?.entityName
              );
  
              // Return true if the name exists, otherwise false
              if (existingEntity) {
                enqueueSnackbar(
                  `Department with the same name already exists, please check in Recycle bin and Restore if required`,
                  {
                    variant: "error",
                  }
                );
                // navigate("/master", {
                //   state: { redirectToTab: "Recycle Bin" },
                // });
              } else {
                // console.log("inside else");
                enqueueSnackbar(
                  `Department with the same name already exists,
                  Please choose other name`,
                  {
                    variant: "error",
                  }
                );
              }
            }
          } else {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
          }
          setButtonLoading(false);
        }
      } else {
        enqueueSnackbar(`Please fill all required fields`, {
          variant: "warning",
        });
      }
    }
  };

  const handleDiscard = () => {
    // edit
    //   ?
    setFormData({
      realm: "",
      entityName: "",
      description: "",
      location: "",
      functionId: "",
      businessType: "",
      users: [],
      // sections: [],
      entityId: "",
      locationId: "",
      businessTypeId: "",
      id: "",
      createdAt: "",
    });
    // : setFormData(deptFormData);
  };

  const getLocationSectionEntityTypes = async () => {
    setIsLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        axios.get(`api/location/getLocationsForOrg/${orgName}`),
        // axios.get(`api/location/getSectionsForOrg/${orgName}`),
        // axios.get(`api/business/getAllFunctionsInALoc/${organizationId}`),
        axios.get(`api/entity/getEntityTypes/byOrg/${orgName}`),
      ]);

      if (res1 && res2) {
        setSelectFieldData({
          ...selectFieldData,
          location: res1.data,
          // sections: res2.data,
          // function: res2.data,
          entityTypes: res2.data,
        });
        if (!edit && isLocAdmin) {
          setFormData({
            ...formData,
            location: res1?.data[0]?.id,
            entityType: res2?.data[0]?.id,
          });
        }
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      enqueueSnackbar(`Error ${err}`, { variant: "error" });
    }
  };
  const getAllFunctions = async (id: any) => {
    try {
      const response = await axios.get(
        `/api/business/getAllFunctionsInALoc/${id}`
      );
      const functionsResult = response.data;
      setFunctions(functionsResult);
    } catch (error) {
      // console.error("Error:", error);
    }
  };
  // console.log("entitytype in dept", entityType);

  const getAllUsersByLocation = async (id: any) => {
    try {
      const response = await axios.get(
        `/api/auditPlan/getAllUsersOfLocation/${id}`
      );
      const data = response.data;

      if (data) {
        const departmentHeadList = data.map((obj: any) => ({
          id: obj.id,
          name: obj.username,
          avatar: obj.avatar,
          email: obj.email,
        }));
        setDepartmentHeadList(departmentHeadList);
      }
    } catch (error) {
      // console.error(error);
      // Handle the error as needed, such as setting an error state or displaying a message.
    }
  };

  // const getEntitiesByLocation = async (locationId: any) => {
  //   try {
  //     // console.log("location", selectedLocation);
  //     const data: any = await getEntityByLocationId(locationId);
  //     console.log("checkdept res data", data);
  //     setEntityOptions([...data?.data]);
  //     // setEntityOptions([
  //     //   ...data?.data?.map((item: any) => ({
  //     //     ...item,
  //     //     name: item.entityName,
  //     //     id: item.id,
  //     //   }))]
  //     // );
  //   } catch (error) {}
  // };

  const getAllUsersByDepartment = async (id: any) => {
    try {
      const response = await axios.get(
        `/api/auditPlan/getAllUsersOfDepartment/${id}`
      );
      const data = response.data;

      if (data) {
        const departmentUsersList = data.map((obj: any) => ({
          id: obj.id,
          name: obj.username,
          avatar: obj.avatar,
          email: obj.email,
        }));
        setDepartmentUsersList(departmentUsersList);
      }
    } catch (error) {
      // console.error(error);
      // Handle the error as needed, such as setting an error state or displaying a message.
    }
  };

  const getEntitiesByLocation = async (locationId: any) => {
    try {
      // console.log("location", selectedLocation);
      const data: any = await getEntityByLocationId(locationId);
      // console.log("checkdept res data", data);
      setEntityOptions([...data?.data]);
      // setEntityOptions([
      //   ...data?.data?.map((item: any) => ({
      //     ...item,
      //     name: item.entityName,
      //     id: item.id,
      //   }))]
      // );
    } catch (error) {}
  };

  // const getAllUsersByDepartment = async (id: any) => {
  //   try {
  //     const response = await axios.get(
  //       `/api/auditPlan/getAllUsersOfDepartment/${id}`
  //     );
  //     const data = response.data;

  //     if (data) {
  //       const departmentUsersList = data.map((obj: any) => ({
  //         id: obj.id,
  //         name: obj.username,
  //         avatar: obj.avatar,
  //         email: obj.email,
  //       }));
  //       setDepartmentUsersList(departmentUsersList);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     // Handle the error as needed, such as setting an error state or displaying a message.
  //   }
  // };

  // console.log("redirect tab", redirectToTab);
  if (!(isLocAdmin || isOrgAdmin || isAdmin)) {
    return (
      <>
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
          <SingleFormWrapper
            parentPageLink="/master"
            backBtn={isEntityHead || isGeneralUser}
            handleSubmit={handleSubmit}
            disableFormFunction={isEntityHead || isGeneralUser || deletedId}
            label={`${
              edit ? formData?.entityType?.name : entityType?.name
            } master`}
            handleDiscard={handleDiscard}
            redirectToTab={redirectToTab}
          >
            <EntityForm
              selectFieldData={selectFieldData}
              edit={edit || isEntityHead}
              bu={bu}
              functions={functions}
              handleSubmit={handleSubmit}
              disableFormFields={isEntityHead || isGeneralUser || deletedId}
              deletedId={deletedId}
              entityType={entityType}
              entityOptions={entityOptions}
            />
          </SingleFormWrapper>
        )}
      </>
    );
  }
  return (
    <>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <SingleFormWrapper
          parentPageLink="/master"
          // redirectToTab="DEPARTMENTS"
          backBtn={isEntityHead || isGeneralUser}
          disableFormFunction={isEntityHead || isGeneralUser || deletedId}
          handleSubmit={handleSubmit}
          handleDiscard={handleDiscard}
          label={`${edit ? formData.entityType?.name : entityType.name} master`}
          redirectToTab={redirectToTab}
        >
          <EntityForm
            selectFieldData={selectFieldData}
            edit={edit || isEntityHead}
            bu={bu}
            functions={functions}
            departmentHeadList={departmentHeadList}
            handleSubmit={handleSubmit}
            disableFormFields={isEntityHead || deletedId}
            deletedId={deletedId}
            entityType={entityType}
            entityOptions={entityOptions}
          />
        </SingleFormWrapper>
      )}
    </>
  );
}

export default NewDepartment;
