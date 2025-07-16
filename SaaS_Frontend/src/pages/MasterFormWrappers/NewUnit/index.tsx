import { useState, useEffect } from "react";
import SingleFormWrapper from "containers/SingleFormWrapper";
import UnitForm from "components/MasterAddOrEditForm/UnitForm";
import { unitFormSchema } from "schemas/unitForm";
import axios from "apis/axios.global";
import { CircularProgress } from "@material-ui/core";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { isValidMasterName } from "utils/validateInput";

type Props = {};

function NewUnit({}: Props) {
  const [unitForm, setUnitForm] = useState(unitFormSchema);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const isEdit = id ? true : false;

  useEffect(() => {
    if (isEdit) getUnitData();
  }, [isEdit]);

  const getUnitData = async () => {
    await axios(`/api/kpi-definition/getSelectedUom/${id}`)
      .then((res) =>
        setUnitForm({
          id: res.data.id,
          unitType: res.data.unitType,
          units: res.data.unitOfMeasurement,
        })
      )
      .catch((err) => console.error(err));
  };

  const handleDiscard = () => {
    setUnitForm(unitFormSchema);
  };

  const handleCreate = async () => {
    const validateunitType = await isValidMasterName(unitForm.unitType);

    if (validateunitType.isValid === false) {
      enqueueSnackbar(`Unit Type ${validateunitType?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
    if (unitForm.unitType && unitForm.units.length) {
      setIsLoading(true);
      await axios(`/api/kpi-definition/checkUnitType/${unitForm.unitType}`)
        .then(async (res) => {
          if (res.data) {
            const response = await axios.get(
              `api/globalsearch/getRecycleBinList`
            );
            const data = response?.data;
            const entityDocuments = data.find(
              (item: any) => item.type === "unitType"
            );

            // If there are entity documents
            if (entityDocuments) {
              // Check if the name already exists
              const existingEntity = entityDocuments.documents.find(
                (doc: any) => doc.unitType === unitForm?.unitType
              );

              // Return true if the name exists,erwise false
              if (existingEntity) {
                enqueueSnackbar(
                  `Unit with the same name already exists, please check in Recycle bin and Restore if required`,
                  {
                    variant: "error",
                  }
                );
                // navigate("/master", {
                //   state: { redirectToTab: "Recycle Bin" },
                // });
              } else {
                console.log("inside else");
                enqueueSnackbar(
                  `Unit with the same name already exists,
              Please choose other name`,
                  {
                    variant: "error",
                  }
                );
              }
            }
          } else {
            const temp = {
              unitOfMeasurement: unitForm.units,
              unitType: unitForm.unitType,
            };
            await axios
              .post(`/api/kpi-definition/createUom`, temp)
              .then((res) => {
                setUnitForm(unitForm);
                navigate("/master", {
                  state: {
                    redirectToTab: "UOM",
                  },
                });
                enqueueSnackbar(`Unit added`, { variant: "success" });
              })
              .catch((err) => {
                enqueueSnackbar(`An error occured`, {
                  variant: "error",
                });
                console.error(err);
              });
          }
        })
        .catch((err) => console.error(err));
      setIsLoading(false);
    } else {
      enqueueSnackbar(`Please fill all fields`, {
        variant: "error",
      });
    }
  };

  const handleUpdate = async () => {
    if (unitForm.unitType && unitForm.units.length) {
      setIsLoading(true);
      await axios(`/api/kpi-definition/checkUnitType/${unitForm.unitType}`)
        .then(async (res) => {
          if (res.data && res.data[0].id !== id) {
            enqueueSnackbar(`Unit type already exists`, { variant: "error" });
          } else {
            const temp = {
              unitOfMeasurement: unitForm.units,
              unitType: unitForm.unitType,
            };
            await axios
              .put(`/api/kpi-definition/updateUom/${id}`, temp)
              .then((res) => {
                setUnitForm(unitForm);
                navigate("/master", {
                  state: {
                    redirectToTab: "UOM",
                  },
                });
                enqueueSnackbar(`Unit updated`, { variant: "success" });
              })
              .catch((err) => {
                enqueueSnackbar(`An error occured`, {
                  variant: "error",
                });
                console.error(err);
              });
          }
        })
        .catch((err) => console.error(err));

      setIsLoading(false);
    } else {
      enqueueSnackbar(`Please fill all fields`, {
        variant: "error",
      });
    }
  };

  return (
    <>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <SingleFormWrapper
          parentPageLink="/master"
          handleSubmit={isEdit ? handleUpdate : handleCreate}
          handleDiscard={handleDiscard}
          backBtn={false}
          redirectToTab="UOM"
          label="UOM Master"
        >
          <UnitForm unitForm={unitForm} setUnitForm={setUnitForm} />
        </SingleFormWrapper>
      )}
    </>
  );
}

export default NewUnit;
