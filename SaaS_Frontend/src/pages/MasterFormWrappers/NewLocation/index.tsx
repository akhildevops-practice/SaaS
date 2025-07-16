import React, { useState } from "react";
import LocationForm from "components/MasterAddOrEditForm/LocationForm";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { locFormData } from "../../../recoil/atom";
import checkRoles from "../../../utils/checkRoles";
import axios from "../../../apis/axios.global";
import { CircularProgress, makeStyles } from "@material-ui/core";
import SingleFormWrapper from "../../../containers/SingleFormWrapper";
import { roles } from "../../../utils/enums";
import getAppUrl from "../../../utils/getAppUrl";
import { locForm } from "../../../schemas/locForm";
import { isValid, isValidMasterName } from "utils/validateInput";
import toFormData from "utils/toFormData";

type Props = {
  deletedId?: boolean;
};

function NewLocation({ deletedId }: Props) {
  const [formData, setFormData] = useRecoilState(locFormData);
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = React.useState(false);
  const [buData, setBuData] = React.useState<any>();
  const [functionData, setFunctionData] = React.useState<any>();
  const [selectFieldData, setSelectFieldData] = React.useState<any>({
    businessTypes: [],
  });
  const useStyles = makeStyles((theme) => ({
    snackbarError: {
      backgroundColor: theme.palette.error.main,
    },
  }));
  const orgName = getAppUrl();
  const organizationId = sessionStorage.getItem("orgId") || "";
  const userdetails: any = sessionStorage.getItem("userDetails");
  const userid: any = JSON.parse(userdetails).id;
  const isAdmin = checkRoles("admin");
  const isAuditor = checkRoles(roles.AUDITOR);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isMR = checkRoles("MR");
  const isEntityHead = checkRoles("ENTITY-HEAD");
  const isGeneralUser = checkRoles("GENERAL-USER");

  const params = useParams();
  const paramArg = params?.id;
  const edit = paramArg ? true : false;

  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<any>();

  React.useEffect(() => {
    if (edit || deletedId) {
      console.log("edit is true");
      setIsLoading(true);
      if (isLocAdmin || isEntityHead || isGeneralUser || isAuditor) {
        axios
          .get(
            `/api/location/getLocation/byId/${deletedId ? deletedId : paramArg}`
          )
          .then(async (data) => {
            const finalData = {
              ...data.data,
              business: data.data.business?.map((item: any) => item.businessId),
            };
            // try {
            //   console.log("inside try edit audit trial");
            //   let result = await axios.post(
            //     `/api/audit-trial/createAuditTrial`,
            //     {
            //       moduleType: "UNIT",
            //       actionType: "UPDATE",
            //       transactionId: `${formData.id}`,
            //       actionBy: userid,
            //     }
            //   );
            // } catch (err: any) {
            //   enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
            //     variant: "error",
            //   });
            // }
            setFormData(finalData);
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
            console.error(err);
          });
      } else {
        axios
          .get(
            `/api/location/getLocation/byId/${deletedId ? deletedId : paramArg}`
          )
          .then(async (data) => {
            const finalData = {
              ...data.data,
              business: data.data.business?.map((item: any) => item.businessId),
            };
            console.log("checklocation finalData", finalData);

            try {
              console.log("inside try edit audit trial");
            } catch (err: any) {
              enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
                variant: "error",
              });
            }
            setFormData(finalData);
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
            console.error(err);
          });
      }
    } else {
      setFormData(locForm);
    }
  }, []);
  const handleSubmit = async () => {
    const validatelocationName = await isValidMasterName(
      formData?.locationName
    );
    const validateLocationId = await isValidMasterName(formData.locationId);
    if (validatelocationName.isValid === false) {
      enqueueSnackbar(`Unit Name ${validatelocationName?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
    if (validateLocationId.isValid === false) {
      enqueueSnackbar(`Unit ID ${validateLocationId?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
    if (
      formData.business.length > 0 &&
      // formData.functionId.length > 0 &&
      formData.locationName &&
      // formData.locationType &&
      formData.locationId
    ) {
      setIsLoading(true);
      if (edit) {
        try {
          const form = toFormData({
            ...formData,
            locationName: formData.locationName.trim(),
            locationId: formData.locationId.trim(),
            businessTypeId: formData.businessTypeId,
            business: formData.business,
            functionId: formData.functionId,
            organization: orgName,
            file: uploadedImage,
          });
          let res = await axios.put(`/api/location/${formData.id}`, form);
          // let result = await axios.post(`/api/audit-trial/createAuditTrial`, {
          //   moduleType: "UNIT",
          //   actionType: "UPDATE",
          //   transactionId: formData.id,
          //   actionBy: userid,
          // });
          setFormData({
            ...formData,
            id: res.data.id,
            locationName: formData.locationName,
            locationId: formData.locationId,
            locationType: formData.locationType,
            description: formData.description,
            business: formData.business,
            functionId: formData.functionId,
            users: formData.users,
          });
          setIsLoading(false);
          enqueueSnackbar(`Unit Saved Succesfully`, {
            variant: "success",
          });
          navigate("/master", { state: { redirectToTab: "UNITS" } });
        } catch (err: any) {
          enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
            variant: "error",
          });
          setIsLoading(false);
        }
      } else {
        const form = toFormData({
          ...formData,
          locationName: formData.locationName.trim(),
          locationId: formData.locationId.trim(),
          businessTypeId: formData.businessTypeId,
          business: formData.business,
          functionId: formData.functionId,
          organization: orgName,
          file: uploadedImage,
        });
        try {
          let res = await axios.post(`/api/location`, form);
          // let result = await axios.post(`/api/audit-trial/createAuditTrial`, {
          //   moduleType: "UNIT",
          //   actionType: "CREATE",
          //   transactionId: res.data.id,
          //   actionBy: userid,
          // });
          setFormData({
            ...formData,
            id: res.data.id,
            locationName: formData.locationName,
            locationId: formData.locationId,
            locationType: formData.locationType,
            description: formData.description,
            business: formData.business,
            functionId: formData.functionId,
          });
          setIsLoading(false);
          enqueueSnackbar(`Unit Created Succesfully`, {
            variant: "success",
          });

          navigate("/master", { state: { redirectToTab: "UNITS" } });
          setFormData(locFormData);
        } catch (err: any) {
          if (err.response.status === 409) {
            const response = await axios.get(
              `api/globalsearch/getRecycleBinList`
            );
            const data = response?.data;
            console.log("data", data);
            const entityDocuments = data.find(
              (item: any) => item.type === "Location"
            );

            // If there are entity documents
            if (entityDocuments) {
              // Check if the name already exists
              const existingEntity = entityDocuments.documents.find(
                (doc: any) => doc.locationName === formData?.locationName
              );

              // Return true if the name exists, otherwise false
              if (existingEntity) {
                enqueueSnackbar(
                  `Location with the same name already exists, please check in Recycle bin and Restore if required`,
                  {
                    variant: "warning",
                    anchorOrigin: {
                      vertical: "top",
                      horizontal: "right",
                    },
                  }
                );
                // navigate("/master", {
                //   state: { redirectToTab: "Recycle Bin" },
                // });
              } else {
                //console.log("inside else");
                enqueueSnackbar(
                  `Location with the same name already exists,
                  Please choose other name`,
                  {
                    variant: "warning",
                    anchorOrigin: {
                      vertical: "top",
                      horizontal: "right",
                    },
                  }
                );
              }
            }
            //
          } else {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
          }
          setIsLoading(false);
        }
      }
    } else {
      if (
        // formData.business &&
        !formData.locationName
        // formData.locationId &&
        // formData.functionId.length > 0
      ) {
        enqueueSnackbar(`Please Fill Unit Name`, {
          variant: "warning",
        });
      } else if (formData.business.length === 0) {
        enqueueSnackbar(`select 'Businesses'`, {
          variant: "warning",
        });
      } else if (!formData.locationId) {
        enqueueSnackbar(`Please Fill Unit ID`, {
          variant: "warning",
        });
      } 
      
      // else {
      //   enqueueSnackbar(`Select 'Function'`, {
      //     variant: "warning",
      //   });
      // }
    }
  };

  const getBusinesses = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/business/getAllBusinesssByOrgId/${organizationId}`
      );
      if (res?.data) {
        setBuData(res.data);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const getFunctions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/business/getAllFunctionsByOrgId/${organizationId}`
      );

      if (res?.data) {
        setFunctionData(res.data);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    getBusinesses();
    getFunctions();
  }, []);

  const handleDiscard = () => {
    setFormData(locForm);
  };

  if (!(isLocAdmin || isOrgAdmin || isAdmin || isMR)) {
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
            backBtn={false}
            redirectToTab="UNIT"
            disableFormFunction={
              deletedId || isEntityHead || isGeneralUser || isAuditor
            }
            handleDiscard={handleDiscard}
            label="Unit Master"
          >
            <LocationForm
              isEdit={edit}
              disableFormFields={
                isOrgAdmin
                  ? false
                  : deletedId || isEntityHead || isGeneralUser || isAuditor
              }
              formData={formData}
              setFormData={setFormData}
              buData={buData}
              functionData={functionData}
              isLoading={isLoading}
              selectFieldData={selectFieldData}
              setSelectFieldData={setSelectFieldData}
            />
          </SingleFormWrapper>
        )}
      </>
    );
  }

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
          redirectToTab="UNIT"
          handleSubmit={handleSubmit}
          handleDiscard={handleDiscard}
          backBtn={false}
          disableFormFunction={
            isOrgAdmin
              ? false
              : deletedId || isEntityHead || isGeneralUser || isAuditor
          }
          label="Unit Master"
        >
          <LocationForm
            isEdit={edit}
            disableFormFields={
              isOrgAdmin
                ? false
                : deletedId || isEntityHead || isGeneralUser || isAuditor
            }
            formData={formData}
            setFormData={setFormData}
            buData={buData}
            functionData={functionData}
            isLoading={isLoading}
            selectFieldData={selectFieldData}
            setSelectFieldData={setSelectFieldData}
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
          />
        </SingleFormWrapper>
      )}
    </>
  );
}

export default NewLocation;
