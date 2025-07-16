import React, { useState } from "react";
import DisplayAdded from "../../components/DisplayAdded";
import LocAdminForm from "../../components/LocAdminForm";
import useStyles from "./styles";
import { useRecoilValue } from "recoil";
import axios from "../../apis/axios.global";
import { useSnackbar } from "notistack";
import { CircularProgress } from "@material-ui/core";
import checkActionsAllowed from "../../utils/checkActionsAllowed";
import { locFormData } from "../../recoil/atom";
import getAppUrl from "../../utils/getAppUrl";

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

function OrgAdminFormContainer({}: Props) {
  const classes = useStyles();
  const [rerender, setRerender] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const locData = useRecoilValue(locFormData);
  const [locAdmins, setLocAdmins] = React.useState<any>();
  const [isEdit, setIsEdit] = React.useState(false);
  const [initData, setInitData] = React.useState(initVal);
  const realm = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();

  const setEdit = (data: any) => {
    setInitData(data);
    setIsEdit(true);
  };

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    if (isEdit) {
      try {
        const { username, id, kc_id, isAction, ...editData } = values;
        const res = await axios.patch(
          `/api/user/${realm}/${initData.id}`,
          editData
        );
        setIsLoading(false);
        setInitData(initVal);
        setIsEdit(false);
        setRerender(!rerender);
        enqueueSnackbar(`${editData.email} successfully Saved`, {
          variant: "success",
        });
      } catch (err: any) {
        enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
          variant: "error",
        });
      }
    } else {
      try {
        const res = await axios.post(`api/user`, {
          ...values,
          userRole: "LOCATION-ADMIN",
          locationId: locData.id,
          realm: realm,
        });
        setIsLoading(false);
        setRerender(!rerender);
        enqueueSnackbar(`${values.email} successfully Saved`, {
          variant: "success",
        });
      } catch (err: any) {
        setIsLoading(false);
        if (err.response.status === 409) {
          enqueueSnackbar(`User Already Exists`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
            variant: "error",
          });
        }
      }
    }
  };

  /**
   * @method handleDiscard
   * @description Function to handle discard a form
   * @returns nothing
   */
  const handleDiscard = () => {
    setIsEdit(false);
    setInitData(initVal);
    setRerender(!rerender);
  };

  /**
   * @method getLocAdmin
   * @description Function to fetch location administrator
   * @returns nothing
   */
  const getLocAdmin = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`api/location/locationadmin/${locData.id}`);

      if (res?.data) {
        const values = res?.data.map((item: any) => ({
          firstName: item.firstname,
          lastName: item.lastname,
          username: item.username,
          email: item.email,
          id: item.id,
          kc_id: item.kcId,
          isAction: checkActionsAllowed(item.username, ["Delete"]),
        }));
        setLocAdmins(values);
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
    }
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
      const res = await axios.delete(`api/user/${data.id}/${realm}`);
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

  React.useEffect(() => {
    getLocAdmin();
  }, [rerender]);

  return (
    <>
      <LocAdminForm
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
            addedUsers={locAdmins}
            title="Location Admins"
            handleDelete={handleUserDelete}
            setEdit={setEdit}
            parent="Location"
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

export default OrgAdminFormContainer;
