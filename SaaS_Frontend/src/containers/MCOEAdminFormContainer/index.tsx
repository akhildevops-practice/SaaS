import React, { useState } from "react";
import DisplayAdded from "../../components/DisplayAdded";
import OrgAdminForm from "../../components/OrgAdminForm";
import useStyles from "./styles";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { orgFormData, orgAdminCount } from "../../recoil/atom";
import axios from "../../apis/axios.global";
import { useSnackbar } from "notistack";
import { CircularProgress } from "@material-ui/core";
import checkActionsAllowed from "../../utils/checkActionsAllowed";

type Props = {};

const initVal: any = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
};

/**
 * This component wraps the OrgAdmin form and the Display Added Component.
 * All operations required in the orgAdmin creation, edit and delete are present in this component
 */

function MCOEAdminFormContainer({}: Props) {
  const classes = useStyles();
  const orgData = useRecoilValue(orgFormData);
  const [orgAdminData, setOrgAdminData] = React.useState<any>();
  const [rerender, setRerender] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [initData, setInitData] = React.useState(initVal);
  const setOrgAdminCount = useSetRecoilState(orgAdminCount);
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const setEdit = (data: any) => {
    setInitData(data);
    setIsEdit(true);
  };

  /**
   * @method handleDiscard
   * @description Function to remove any field data and reset it to a default initial state
   * @returns nothing
   */
  const handleDiscard = () => {
    setIsEdit(false);
    setInitData(initVal);
    setRerender(!rerender);
  };

  /**
   * @method handleUserDelete
   * @description Function to delete a user
   * @param data {any}
   * @returns nothing
   */
  const handleUserDelete = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await axios.delete(`api/user/${data.id}/${orgData.realmName}`);
      setRerender(!rerender);
      setIsLoading(false);
      enqueueSnackbar(`User Deleted`, {
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  /**
   * @method handleSubmit
   * @description Function to submit all the data
   * @param values {any}
   * @returns nothing
   */
  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    const finalData = {
      ...values,
      realm: orgData.realmName,
      userRole: "ORG-ADMIN",
    };
    if (isEdit) {
      try {
        const { username, realm, id, kc_id, ...editData } = finalData;
        const res = await axios.patch(
          `/api/user/${finalData.realm}/${initData.id}`,
          editData
        );
        setIsLoading(false);
        setInitData(initVal);
        setIsEdit(false);
        setRerender(!rerender);
        enqueueSnackbar(`${finalData.email} successfully Saved`, {
          variant: "success",
        });
      } catch (err: any) {
        enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
          variant: "error",
        });
      }
    } else {
      try {
        const res = await axios.post(`/api/user?`, finalData);
        setIsLoading(false);
        handleDiscard();
        enqueueSnackbar(`${finalData.email} successfully created`, {
          variant: "success",
        });
        setRerender(!rerender);
      } catch (err: any) {
        setIsLoading(false);
        if (err.response.status === 409) {
          const response = await axios.get(
            `api/globalsearch/getRecycleBinList`
          );
          const data = response?.data;
          console.log("data", data);
          const entityDocuments = data.find(
            (item: any) => item.type === "User"
          );

          // If there are entity documents
          if (entityDocuments) {
            // Check if the name already exists
            const existingEntity = entityDocuments.documents.find(
              (doc: any) => doc.username === finalData?.username
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
        } else {
          enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
            variant: "error",
          });
        }
      }
    }
  };

  /**
   * @method getData
   * @description Function to fetch data related to organization admin
   * @param url {string}
   * @returns nothing
   */
  const getData = async (url: string) => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${url}${orgData.organizationName.replace(/\s+/g, "").toLowerCase()}`
      );
      if (res.data) {
        const val = res.data.map((item: any) => ({
          firstName: item.firstname,
          lastName: item.lastname,
          username: item.username,
          email: item.email,
          id: item.id,
          kc_id: item.kcId,
          isAction: checkActionsAllowed(item.username, ["Delete"]),
        }));
        setOrgAdminData(val);
        setOrgAdminCount(val.length);
      }
      setIsLoading(false);
    } catch (err) {
      console.log("Error Fetching Data");
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    getData("/api/user/");
  }, [rerender]);

  return (
    <>
      <OrgAdminForm
        isEdit={isEdit}
        initVal={initData}
        handleDiscard={handleDiscard}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        rerender={rerender}
      />
      <div className={classes.displaySection}>
        {!isLoading ? (
          <DisplayAdded
            addedUsers={orgAdminData}
            title="MCOE Admins"
            handleDelete={handleUserDelete}
            setEdit={setEdit}
            parent="Organization"
          />
        ) : (
          <div className={classes.loader}>
            <CircularProgress />
          </div>
        )}
      </div>
    </>
  );
}

export default MCOEAdminFormContainer;
