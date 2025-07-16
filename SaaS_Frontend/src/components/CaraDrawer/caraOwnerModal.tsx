import { makeStyles } from "@material-ui/core";
import { Form, Modal, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { capaOwnerChangeFormSchemaState } from "recoil/atom";
import { validateTitle } from "utils/validateInput";

type Props = {
  formData?: any;
  capaOwnerData?: any;
  setformdata?: any;
  openModalForOwner?: any;
  setOpenModalForOwner?: any;
  readMode?: any;
  setOwnerFormSubmit?: any;
  handleSubmit?: any;
  setOwnerChange?: any;
};
const useStyles = makeStyles((theme) => ({
  disabledInput: {
    "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
      backgroundColor: "#F5F5F5",
      color: "black",

      // border: "none",
    },
  },
  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "160px",
    cursor: "pointer",
    "&:hover": {
      cursor: "pointer", // Change cursor to pointer on hover
    },
    whiteSpace: "nowrap",
  },

  disabledSelect: {
    "& .ant-select-disabled .ant-select-selector": {
      backgroundColor: "#F5F5F5",
      background: "#F5F5F5!important",
      color: "black",

      // border: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item": {
      color: "black",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },

  disabledMultiSelect: {
    "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
      backgroundColor: "#F5F5F5 !important",
      // border: "none",
    },
    "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
      color: "black",
      background: "#F5F5F5 !important",

      // border: "none",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
  root: {
    width: "100%",
    "& .MuiAccordionDetails-root": {
      display: "block",
    },
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  previewFont: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    textDecoration: "none",
    fontWeight: 600,
    marginLeft: theme.typography.pxToRem(20),
  },
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the <label> element
    },
  },
}));
const CaraOwnerModal = ({
  formData,
  capaOwnerData,
  setformdata,
  openModalForOwner,
  setOpenModalForOwner,
  readMode,
  setOwnerFormSubmit,
  handleSubmit,
  setOwnerChange,
}: Props) => {
  const [users, setUsers] = useState([]);
  const classes = useStyles();
  const [capaFormData, setCapaFormData] = useRecoilState(
    capaOwnerChangeFormSchemaState
  );
  const [ownersData, setOwnersData] = useState([]);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const { Option } = Select;
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (openModalForOwner === true) {
      getAllUserByEntities();
      setCapaFormData({
        previousOwnerId: formData?.caraOwner,
        caraId: formData?._id,
        organizationId: userDetail?.organization?.id,
        updatedBy: userDetail?.id,
      });
      getAllEntry();
    }
  }, [openModalForOwner]);

  //   console.log("formData in modal", formData);
  const getAllUserByEntities = async () => {
    try {
      // console.log("get all users called inside modal");
      //let entityId = JSON.parse(window.sessionStorage.getItem("userDetails")!);
      const data = await axios.get(
        `/api/cara/getAllUsersOfEntity/${formData?.entityId?.id}`
      );

      if (data?.data) {
        // console.log(data?.data?.otherUsers, "users");

        // Combine both arrays with unique users while preserving order
        const userMap = new Map();
        (data?.data?.deptHead || []).forEach((user: any) =>
          userMap.set(user.id, user)
        );
        (data?.data?.otherUsers || []).forEach((user: any) =>
          userMap.set(user.id, user)
        );

        const combinedUsers: any = Array.from(userMap.values());
        setUsers(combinedUsers);
      }
    } catch (error) {}
  };
  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const sendMail = async (result: any) => {
    try {
      // console.log("sending mail");
      const response = await axios.post(`/api/cara/sendMailToNewOwner`, result);
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(`Mail sent to new Capa Owner`, { variant: "success" });
      }
    } catch (error) {
      console.log("error");
    }
  };
  const addEntry = async () => {
    try {
      if (capaFormData.currentOwnerId !== formData?.caraOwner?.id) {
        setOwnerChange(true);

        const payload = {
          ...capaFormData,
        };
        const result = await axios.post(
          `/api/cara/createCapaOwnerEntry`,
          payload
        );
        if (result.status === 200 || result.status === 201) {
          setOwnerFormSubmit(true);
          handleSubmit();
          sendMail(result?.data);
          setCapaFormData({
            previousOwnerId: undefined,
            caraId: undefined,
            organizationId: undefined,
            updatedBy: undefined,
            reason: "",
          });
          getAllEntry();
        }
      } else {
        // console.log("owner not change");
        enqueueSnackbar(`no owner change`, { variant: "info" });
        return;
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  // console.log("formdata in modal", formData);
  const getAllEntry = async () => {
    try {
      const res = await axios.get(
        `/api/cara/getCapaOwnerEntry/${formData?._id}`
      );
      // console.log("response in getall", res?.data);
      if (res?.status === 200 && res.data?.length > 0) {
        setOwnersData(res?.data);
      } else {
        setOwnersData([]);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  // const validateTitle = (
  //   rule: any,
  //   value: string,
  //   callback: (error?: string) => void
  // ) => {
  //   // Define regex pattern for allowed characters
  //   const TITLE_REGEX =
  //     /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,\?&%!#@€£`'"\~]+$/; // Allows letters, numbers, and specific symbols, but does not include < and >

  //   // Check for disallowed characters
  //   const DISALLOWED_CHARS = /[<>]/;

  //   // Check for more than two consecutive special characters
  //   const MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS =
  //     /[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]{3,}/;

  //   // Check if the title starts with a special character
  //   const STARTS_WITH_SPECIAL_CHAR =
  //     /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]/;

  //   if (!value || value.trim().length === 0) {
  //     callback("Text value is required.");
  //   } else if (DISALLOWED_CHARS.test(value)) {
  //     callback("Invalid text. Disallowed characters are < and >.");
  //   } else if (MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS.test(value)) {
  //     callback(
  //       "Invalid text. No more than two consecutive special characters are allowed."
  //     );
  //   } else if (STARTS_WITH_SPECIAL_CHAR.test(value)) {
  //     callback("Invalid text. Text should not start with a special character.");
  //   } else if (!TITLE_REGEX.test(value)) {
  //     callback(
  //       "Invalid text. Allowed characters include letters, numbers, commas, /, /, dots, and currency symbols."
  //     );
  //   } else {
  //     callback();
  //   }
  // };
  const handleSubmitOwner = () => {
    setOpenModalForOwner(false);
    addEntry();
  };
  const handleCancel = () => {
    setCapaFormData({
      previousOwnerId: undefined,
      caraId: undefined,
      organizationId: undefined,
      currentOwnerId: undefined,
      updatedBy: undefined,
      reason: "",
    });
    setOpenModalForOwner(false);
    setOwnerFormSubmit(false);
  };
  // console.log("users", users);
  return (
    <Modal
      title="Change Capa Owner"
      open={openModalForOwner}
      onCancel={handleCancel}
      onOk={handleSubmitOwner}
      style={{
        marginLeft: "auto",
        marginRight: "25px",
      }}
      centered={false}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
    >
      <Form
        layout="vertical"
        initialValues={{
          previousOwnerId: formData?.caraOwner,
          caraId: formData?._id,
        }}
      >
        <Form.Item
          label="CAPA Owner"
          name="caraOwner"
          rules={[
            {
              required: true,
            },
          ]}
          className={classes.disabledSelect}
        >
          <Select
            placeholder="CAPA Owner"
            onSelect={(value) => {
              const ownerId = typeof value === "object" ? value?.key : value;

              // console.log("value in capa owner", value);
              setformdata((prevData: any) => ({
                ...prevData,
                caraOwner: ownerId,
              }));
              setCapaFormData((prevData: any) => ({
                ...prevData,
                currentOwnerId: ownerId,
              }));
            }}
            size="large"
            value={formData?.caraOwner ? formData?.caraOwner : users[0]}
            disabled={readMode || formData?.status === "Closed"}
          >
            {users &&
              users.length > 0 &&
              users?.map((user: any) => (
                <Option value={user.id} key={user.id}>
                  {formData?.deptHead &&
                  formData.deptHead?.some(
                    (deptHeadUser: any) => deptHeadUser.id === user.id
                  ) ? (
                    <span>
                      <span role="img" aria-label="star">
                        ⭐
                      </span>{" "}
                      {user?.username}
                    </span>
                  ) : (
                    user.username
                  )}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Reason"
          name="reason"
          rules={[
            {
              required: true,
            },
            { validator: validateTitle },
          ]}
          style={{
            marginTop: "6%",
          }}
          className={classes.disabledInput}
        >
          <TextArea
            rows={6} // Increase the number of rows to adjust the height
            autoSize={{ minRows: 3, maxRows: 6 }} // You can adjust minRows and maxRows as per your preference
            placeholder="Enter Reason For Change"
            size="large"
            name="reason"
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              // You can also add additional logic here if needed
              setCapaFormData({
                ...capaFormData,
                reason: e.target.value,
              });
            }}
            value={capaFormData?.reason}
            //defaultValue={formData?.comments}
            required={true}
            disabled={readMode || formData?.status === "Closed"}
          />
        </Form.Item>
        {ownersData?.length > 0 && (
          <div>
            <h4>CAPA Owner Change History:</h4>
            <ul>
              {ownersData?.map((data: any, index) => (
                <li key={index}>
                  <p>
                    {data?.updatedBy?.username} changed owner from{" "}
                    {data?.previousOwner?.name} to {data.currentOwner?.username}{" "}
                    on {formatDate(data.updatedAt)} / reason:{data?.reason}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default CaraOwnerModal;
