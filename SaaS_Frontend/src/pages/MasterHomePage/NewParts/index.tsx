import React from "react";
// import LocationForm from "components/Master/LocationForm";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { partsFormData } from "recoil/atom";
import checkRoles from "utils/checkRoles";
import axios from "apis/axios.global";
import { CircularProgress } from "@material-ui/core";
import SingleFormWrapper from "containers/SingleFormWrapper";
import { roles } from "utils/enums";
import getAppUrl from "utils/getAppUrl";
import formatQuery from "utils/formatQuery";
import PartsForm from "components/PartsForm";

type Props = {};

function NewParts({}: Props) {
  const [formData, setFormData] = useRecoilState(partsFormData);
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = React.useState(false);
  const [buData, setBuData] = React.useState<any>();
  const [functionData, setFunctionData] = React.useState<any>();
  const [models, setModels] = React.useState<any>([]);
  const [entities, setEntities] = React.useState<any>([]);
  const orgName = getAppUrl();
  const organizationId = sessionStorage.getItem("orgId") || "";

  const isAdmin = checkRoles("admin");
  const isAuditor = checkRoles(roles.AUDITOR);
  const isOrgAdmin = true;
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isMR = checkRoles("MR");
  const isEntityHead = checkRoles("ENTITY-HEAD");
  const isGeneralUser = false;

  const params = useParams();
  const paramArg = params.id;
  const edit = paramArg ? true : false;

  const navigate = useNavigate();

  React.useEffect(() => {
    if (edit) {
      setIsLoading(true);

      axios
        .get(`/api/parts/getPart/byId/${paramArg}`)
        .then((data) => {
          setFormData({
            ...data.data,
            entity: data.data.entityId,
            models: data.data.models.map((modelDetails: any) => {
              return modelDetails.id;
            }),
          });
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          console.error(err);
        });
    } else {
      setFormData(partsFormData);
    }
  }, []);
  const handleDiscard = () => {
    setFormData({
      id: formData.id ?? "",
      partNo: "",
      partName: "",
      description: "",
      models: [],
      entity: "",
    });

    console.log(formData, "data.........");
  };

  const handleSubmit = async () => {
    if (
      formData.partNo &&
      formData.partName &&
      formData.models &&
      formData.entity
    ) {
      setIsLoading(true);
      if (edit) {
        try {
          const modelsData = models.filter((item: any) => {
            if (formData.models.includes(item.id)) {
              return item;
            }
          });

          const res = await axios.put(`/api/parts/${formData.id}`, {
            id: formData.id,
            partName: formData.partName,
            partNo: formData.partNo,
            models: modelsData,
            description: formData.description,
            entity: formData.entity,
          });

          setFormData({
            id: res.data.id,
            partName: formData.partName,
            partNo: formData.partNo,
            models: formData.models,
            description: formData.description,
            entity: formData.entity,
          });

          setIsLoading(false);
          enqueueSnackbar(`Part Saved Succesfully`, {
            variant: "success",
          });
          // navigate("/module-settings", { state: { redirectToTab: "PARTS" } });
          navigate("/master", {
            state: {
              redirectToTab: "PARTS",
            },
          });
        } catch (err: any) {
          enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
            variant: "error",
          });
          setIsLoading(false);
        }
      } else {
        try {
          const modelsData = models.filter((item: any) => {
            if (formData.models.includes(item.id)) {
              return item;
            }
          });
          const res = await axios.post(`/api/parts`, {
            ...formData,
            models: modelsData,
          });
          setFormData({
            ...formData,
            id: res.data.id,
            partName: formData.partName,
            partNo: formData.partNo,
            models: modelsData,
            description: formData.description,
            entity: formData.entity,
          });
          setFormData({
            id: "",
            partName: "",
            partNo: "",
            models: [],
            description: "",
            entity: "",
          });
          setIsLoading(false);
          enqueueSnackbar(`Part Created Succesfully`, {
            variant: "success",
          });

          //navigate("/module-settings", { state: { redirectToTab: "PARTS" } });
          navigate("/master", {
            state: {
              redirectToTab: "PARTS",
            },
          });
        } catch (err: any) {
          if (err.response.status === 409) {
            enqueueSnackbar(`Part Already Exists`, {
              variant: "error",
            });
          } else {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
          }
          setIsLoading(false);
        }
      }
    } else {
      enqueueSnackbar(`Please Fill all the required fields`, {
        variant: "warning",
      });
    }
  };

  const getEntities = async () => {
    setIsLoading(true);
    try {
      const url = formatQuery(
        `/api/entity/all/${orgName}`,
        { page: 1, limit: 100 },
        [
          "entityName",
          "locationName",
          "businessType",
          "entityType",
          "page",
          "limit",
        ]
      );
      const res = await axios.get(url!);
      if (res?.data?.data) {
        const values = res?.data?.data.map((item: any) => ({
          entityType: item.entityType ? item.entityType.name : "-",
          entityName: item?.entityName ?? "-",
          id: item?.id ?? "-",
        }));
        setEntities(values);
        setIsLoading(false);
      }
    } catch (err) {
      enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const getModels = async () => {
    setIsLoading(true);
    try {
      const url = formatQuery(`/api/model`, { page: 1, limit: 100 }, [
        "modelName",
        "modelNo",
        "page",
        "limit",
      ]);
      const res = await axios.get(url!);
      if (res?.data?.data) {
        const val = res?.data?.data?.map((item: any) => {
          return {
            id: item.id,
            modelName: item.modelName,
            modelNo: item.modelNo,
            description: item.description,
            organizationId: item.organizationId,
          };
        });
        setModels(val);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    getModels();
    getEntities();
  }, []);

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
            backBtn={isMR || isEntityHead || isGeneralUser}
            disableFormFunction={false}
            handleDiscard={handleDiscard}
            redirectToTab="PARTS"
            label="Parts Master"
          >
            <PartsForm
              isEdit={edit}
              disableFormFields={false}
              formData={formData}
              setFormData={setFormData}
              entities={entities}
              models={models}
              isLoading={isLoading}
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
          parentPageLink="/master/unit"
          handleSubmit={handleSubmit}
          handleDiscard={handleDiscard}
          backBtn={isMR || isEntityHead || isGeneralUser}
          disableFormFunction={false}
        >
          <PartsForm
            isEdit={edit}
            disableFormFields={false}
            formData={formData}
            setFormData={setFormData}
            entities={entities}
            models={models}
            isLoading={isLoading}
          />
        </SingleFormWrapper>
      )}
    </>
  );
}

export default NewParts;
