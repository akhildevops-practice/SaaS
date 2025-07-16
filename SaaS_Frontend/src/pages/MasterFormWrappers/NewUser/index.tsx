import React from "react";
import UserForm from "components/MasterAddOrEditForm/UserForm";
import SingleFormWrapper from "containers/SingleFormWrapper";
import { useRecoilState } from "recoil";
import { userFormData } from "recoil/atom";
import getAppUrl from "utils/getAppUrl";
import axios from "apis/axios.global";
import { CircularProgress } from "@material-ui/core";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { userForm } from "schemas/userForm";
import checkedRolesCheck from "lib/UserMaster/checkedRolesCheck";
import { useRecoilValue } from "recoil";
import { orgFormData } from "recoil/atom";
import { isValid, isValidMasterName } from "utils/validateInput";

type Props = {
  deletedId?: boolean;
};

function NewUser({ deletedId }: Props) {
  const [formData, setFormData] = useRecoilState(userFormData);
  const [selectFieldData, setSelectFieldData] = React.useState<any>({
    locations: [],
    sections: [],
  });
  const [departments, setDepartments] = React.useState<any>([]);
  const [businessTypes, setBusinessTypes] = React.useState<any>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [checkState, setCheckState] = React.useState<{ [key: string]: any }>({
    MR: false,
    AUDITOR: false,
  });
  const userdetails: any = sessionStorage.getItem("userDetails");
  const userid: any = JSON.parse(userdetails).id;

  const navigate = useNavigate();
  const orgName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const params = useParams();
  const paramArg = params.id;
  const edit = paramArg ? true : false;
  const orgData = useRecoilValue(orgFormData);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  const handleDiscard = () => {
    setFormData(userForm);
  };

  const checkedValues = (event: any) => {
    setCheckState({ ...checkState, [event.target.name]: event.target.checked });
  };

  const validateEmail = (email: string): boolean => {
    // Updated regex: disallows spaces anywhere and prevents consecutive periods
    const regex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    // Additional check: ensures no spaces in the email
    if (/\s/.test(email)) {
      return false; // Invalid if any space is found
    }

    return regex.test(email);
  };
  // console.log("formData", formData);
  const handleSubmit = async () => {
    const roles: any = [];
    Object.keys(checkState).forEach((item: string) => {
      if (checkState[item] === true) {
        roles.push(item);
      }
    });

    const validateusername = await isValidMasterName(formData.username);
    if (validateusername.isValid === false) {
      enqueueSnackbar(`UserName ${validateusername?.errorMessage}`, {
        variant: "error",
      });
      return;
    }

    const validatelastName = await isValid(formData.lastName);
    if (validatelastName.isValid === false) {
      enqueueSnackbar(`Last Name ${validatelastName?.errorMessage}`, {
        variant: "error",
      });
      return;
    }

    const validatefirstName = await isValid(formData.firstName);
    if (validatefirstName.isValid === false) {
      enqueueSnackbar(`First Name ${validatefirstName?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
    if (!validateEmail(formData.email)) {
      return enqueueSnackbar("enter valid email", {
        variant: "error",
      });
    }

    if (
      !formData?.entity?.hasOwnProperty("id") &&
      formData?.userType === "department"
    ) {
      return enqueueSnackbar("Select Department", {
        variant: "error",
      });
    }

    if (
      !formData?.functionId?.hasOwnProperty("id") &&
      formData?.userType === "function"
    ) {
      return enqueueSnackbar("Select Function", {
        variant: "error",
      });
    }

    const fullName = formData.firstName.trim() + " " + formData.lastName.trim();
    if (fullName.length > 32) {
      return enqueueSnackbar(
        "Full Name which is First Name + Last Name can not exceed 32 characters",
        {
          variant: "error",
        }
      );
    }
    const validateRoleName = await isValid(formData?.roleName);

    if (
      validateRoleName.isValid === false &&
      formData?.userType === "globalRoles"
    ) {
      return enqueueSnackbar(`Role Name ${validatefirstName?.errorMessage}`, {
        variant: "error",
      });
    }
    if (
      formData?.userType === "globalRoles" &&
      formData?.additionalUnits?.length <= 0
    ) {
      return enqueueSnackbar("Atleast one unit is required for global roles", {
        variant: "error",
      });
    }
    if (edit) {
      if (formData?.userType !== "globalRoles") {
        // console.log("inside if");
        if (
          formData.userType &&
          formData.roles &&
          formData.email &&
          formData.locationId &&
          formData.firstName &&
          formData.lastName
          // &&
          // formData.businessTypeId &&
          // formData.entityId
          // formData.sectionId
        ) {
          setIsLoading(true);
          const {
            businessTypeId,
            entityId,
            locationId,
            sectionId,
            // businessType,
            entity,
            location,
            section,
            isAction,
            ...finalValues
          } = formData;
          try {
            const res = await axios.post(
              `api/user/usermaster/update/${formData.id}`,
              {
                ...finalValues,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                username: formData.username.trim(),
                realm: orgName,
                location: locationId,
                businessType: businessTypeId,
                section: sectionId,
                entity: entityId,
                roles: roles,
              }
            );
            // const result = await axios.post(
            //   `/api/audit-trial/createAuditTrial`,
            //   {
            //     moduleType: "USER",
            //     actionType: "UPDATE",
            //     transactionId: res.data.id,
            //     actionBy: userid,
            //   }
            // );
            navigate("/master", {
              state: { redirectToTab: "USERS", retain: false },
            });

            setIsLoading(false);
            enqueueSnackbar(`User Saved Successfully`, { variant: "success" });
            setFormData(userForm);
          } catch (err: any) {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
            setIsLoading(false);
          }
        } else {
          enqueueSnackbar(`Please fill all required fields`, {
            variant: "warning",
          });
        }
      } else {
        if (
          formData.userType &&
          formData.roles &&
          formData.email &&
          formData.firstName &&
          formData.lastName
          // &&
          // formData.businessTypeId &&
          // formData.entityId
          // formData.sectionId
        ) {
          setIsLoading(true);
          const {
            businessTypeId,
            entityId,
            locationId,
            sectionId,
            // businessType,
            entity,
            location,
            section,
            isAction,
            ...finalValues
          } = formData;
          try {
            const res = await axios.post(
              `api/user/usermaster/update/${formData.id}`,
              {
                ...finalValues,
                realm: orgName,
                location: locationId,
                businessType: businessTypeId,
                section: sectionId,
                entity: entityId,
                roles: roles,
              }
            );
            // const result = await axios.post(
            //   `/api/audit-trial/createAuditTrial`,
            //   {
            //     moduleType: "USER",
            //     actionType: "UPDATE",
            //     transactionId: res.data.id,
            //     actionBy: userid,
            //   }
            // );
            navigate("/master", {
              state: { redirectToTab: "USERS", retain: false },
            });

            setIsLoading(false);
            enqueueSnackbar(`User Saved Successfully`, { variant: "success" });
            setFormData(userForm);
          } catch (err: any) {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
            setIsLoading(false);
          }
        } else {
          enqueueSnackbar(`Please fill all required fields`, {
            variant: "warning",
          });
        }
      }
    } else {
      if (
        // formData.userType &&
        formData.roles &&
        formData.email &&
        formData.location &&
        formData.username &&
        formData.firstName &&
        formData.lastName &&
        formData?.entity
        // formData.businessType &&

        // formData.section
      ) {
        const {
          businessTypeId,
          entityId,
          locationId,
          sectionId,
          isAction,

          ...finalValues
        } = formData;

        setIsLoading(true);
        try {
          const res = await axios.post(`api/user/usermaster`, {
            ...finalValues,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            username: formData.username.trim(),
            email: formData.email.trim(),
            realm: orgName,
            roles: roles,
            // userType: "Local",
          });
          // const result = await axios.post(`/api/audit-trial/createAuditTrial`, {
          //   moduleType: "USER",
          //   actionType: "CREATE",
          //   transactionId: res.data.id,
          //   actionBy: userid,
          // });

          navigate("/master", { state: { redirectToTab: "USERS" } });
          setIsLoading(false);
          enqueueSnackbar(`User Created Successfully`, { variant: "success" });
          setFormData(userForm);
        } catch (err: any) {
          // console.log("error in newuser", err);
          if (err?.response?.status === 409) {
            const response = await axios.get(
              `api/globalsearch/getRecycleBinList`
            );
            const data = response?.data;
            //console.log("data", data);
            const entityDocuments = data.find(
              (item: any) => item.type === "User"
            );

            // If there are entity documents
            if (entityDocuments) {
              // Check if the name already exists
              const existingEntity = entityDocuments.documents.find(
                (doc: any) => doc.username === formData?.username
              );

              // Return true if the name exists, otherwise false
              if (existingEntity) {
                enqueueSnackbar(
                  `USer with the same name already exists, please check in Recycle bin and Restore if required`,
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
                  `User with the same name already exists,
                  Please choose other name`,
                  {
                    variant: "error",
                  }
                );
              }
            }
          } else if (err.response?.status === 404) {
            alert(
              `Your Organization has reached the licensed user limit!! Please reach Processridge to activate more users”
`
              // {
              //   variant: "error",
              // }
            );
          } else {
            enqueueSnackbar(`User Already Exists`, {
              variant: "error",
            });
          }
          setIsLoading(false);
        }
      } else {
        enqueueSnackbar(`Please fill all required fields`, {
          variant: "warning",
        });
      }
    }
  };
  // console.log("formdata in user form", formData);
  const getLocationSection = async () => {
    setIsLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        axios.get(`api/location/getLocationsForOrg/${orgName}`),
        axios.get(`api/location/getSectionsForOrg/${orgName}`),
      ]);

      if (res1.data && res2.data) {
        setSelectFieldData({
          ...selectFieldData,
          locations: res1.data,
          sections: res2.data,
        });
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      enqueueSnackbar(`Error ${err}`, { variant: "error" });
    }
  };

  const getDept = async () => {
    if (formData.locationId && formData.location) {
      setIsLoading(true);
      try {
        const res =
          // edit
          //   ?
          await axios.get(
            `api/location/getDeptForLocation/${orgName}/${formData.locationId}`
          );
        // : await axios.get(
        //     `api/location/getDeptForLocation/${orgName}/${formData.location?.id}`
        //   );
        if (res.data) {
          setDepartments(res.data);
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        enqueueSnackbar(`Error ${err}`, { variant: "error" });
      }
    }
  };

  const getBusinessTypes = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/business/getAllBusinesssByOrgId/${organizationId}`
      );
      if (res.data) setBusinessTypes(res.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      enqueueSnackbar(`Error ${err}`, { variant: "error" });
    }
  };

  const setCheckedData = (finalData: any) => {
    setCheckState({
      MR: checkedRolesCheck(finalData.assignedRole, "MR"),
      AUDITOR: checkedRolesCheck(finalData.assignedRole, "AUDITOR"),
    });
  };

  React.useEffect(() => {
    if (edit || deletedId) {
      setIsLoading(true);
      axios
        .get(`api/user/getUser/byId/${deletedId ? deletedId : paramArg}`)
        .then((data) => {
          const finalData = {
            ...data.data,
            locationId: data.data?.location?.id,
            sectionId: data.data?.section?.id,
            entityId: data.data.entity?.id ? data.data.entity?.id : "All",
            businessTypeId: data.data?.businessType?.id,
            status: data.data?.status ? data.data.status : false,
            userType: data.data?.userType,
            id: data.data.id,
            username: data.data.username,
            firstName: data.data.firstname,
            lastName: data.data.lastname,
            functinId: data.data.functionId,
            email: data.data.email,
            roleName: data.data.assignedRole[0].roleName,
            signature: data.data?.signature,
            roles: data.data.assignedRole
              ? data.data?.assignedRole?.map((item: any) => item.role)
              : [],
          };
          setFormData(finalData);
          setCheckedData(finalData);
          setIsLoading(false);
          getLocationSection();
        })
        .catch((err) => {
          setIsLoading(false);
          console.error(err);
        });
    } else {
      getLocationSection();
      setFormData(userForm);
    }
  }, []);

  React.useEffect(() => {
    if (formData.location) {
      getDept();
    }
  }, [formData.location, formData.locationId]);

  React.useEffect(() => {
    if (formData.entity) {
      getBusinessTypes();
    }
  }, [formData.entity, formData.entityId]);

  return (
    <>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <SingleFormWrapper
          parentPageLink="/master"
          handleSubmit={handleSubmit}
          handleDiscard={handleDiscard}
          backBtn={false}
          redirectToTab="USERS"
          label="User Master"
        >
          <UserForm
            locations={selectFieldData?.locations}
            sections={selectFieldData?.sections}
            departments={departments}
            businessTypes={businessTypes}
            edit={edit}
            setCheckState={setCheckState}
            checkState={checkState}
            checkedValues={checkedValues}
            disabledForDeletedModal={deletedId ? true : false}
          />
        </SingleFormWrapper>
      )}
    </>
  );
}

export default NewUser;
