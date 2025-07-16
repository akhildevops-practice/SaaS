import { Button, Checkbox, Select } from "antd";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";

import { useEffect, useState } from "react";
const WorkFlow = () => {
  const [checked, setChecked] = useState<boolean>(false);
  const [userOptions, setUserOptions] = useState([]);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [formData, setFormData] = useState<any>({});
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    getUserOptions();
    getWorkflowConfig();
  }, []);

  const getUserOptions = async () => {
    await axios
      .get(`/api/riskregister/users/${userDetail?.organizationId}`)
      .then((res) => {
        //  console.log("res from users", res);
        if (res.data && res?.data?.length > 0) {
          const ops = res?.data?.map((obj: any) => ({
            id: obj.id,
            name: obj.username,
            avatar: obj.avatar,
            email: obj.email,
            username: obj.username,
            value: obj.id,
            label: obj.email,
            fullname: obj.firstname + " " + obj.lastname,
          }));
          setUserOptions(ops);
        } else {
          setUserOptions([]);
        }
      })
      .catch((err: any) => console.error(err));
  };
  const getWorkflowConfig = async () => {
    try {
      const result = await axios.get(
        `/api/cara/getWorkflowConfig/${userDetail.organizationId}`
      );
      //   console.log("getworkflowconfig", result?.data);
      if (result?.data) {
        setFormData({
          _id: result?.data?._id,
          organizationId: result?.data?.organizationId,
          executive: result?.data?.executive,
          executiveApprovalRequired: result?.data?.executiveApprovalRequired,
        });
        setChecked(result?.data?.executiveApprovalRequired);
      }
    } catch (error) {
      setFormData({
        executive: {},
        executiveApprovalRequired: false,
      });
    }
  };
  const handleSubmit = async () => {
    // console.log("handle submit called", formData);
    if (formData?._id) {
      try {
        const payload = {
          executive: formData?.executive,
          executiveApprovalRequired: checked,
          updatedBy: userDetail?.id,
          organizationId: userDetail?.organizationId,
        };

        const result = await axios.put(
          `/api/cara/updateWorkflowConfig/${formData?._id}`,
          payload
        );
        if (result?.status === 200) {
          enqueueSnackbar("Workflow settings submitted successfully", {
            variant: "success",
          });
          setFormData({
            executive: {},
            executiveApprovalRequired: false,
          });
        }
      } catch (error) {}
    } else {
      try {
        const payload = {
          executive: formData?.executive,
          executiveApprovalRequired: checked,
          createdBy: userDetail?.id,
          organizationId: userDetail?.organizationId,
        };

        const result = await axios.post(
          `/api/cara/createWorkflowConfig`,
          payload
        );
        if (result?.status === 200 || result?.status === 201) {
          enqueueSnackbar("Workflow settings submitted successfully", {
            variant: "success",
          });
          setFormData({
            executive: {},
            executiveApprovalRequired: false,
          });
        }
      } catch (err) {}
    }
  };
  //   console.log("checked", checked);
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Checkbox
          checked={formData?.executiveApprovalRequired}
          onChange={() => setChecked(!checked)}
          style={{ marginRight: "20px" }}
        >
          Executive Approval Needed
        </Checkbox>

        {checked && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <label
              style={{
                marginRight: "10px",
                fontSize: "14px",
                fontWeight: "bolder",
              }}
            >
              Select User For Approval
            </label>
            <Select
              showSearch
              placeholder="Select"
              value={formData?.executive}
              style={{
                width: "400px",
                fontSize: "12px",
              }}
              options={userOptions || []}
              onChange={(selected: any) => {
                const selectedUser = userOptions?.find(
                  (user: any) => user.value === selected
                );
                setFormData({ ...formData, executive: selectedUser });
              }}
              size="large"
              filterOption={(input: any, option: any) =>
                option?.label?.toLowerCase().indexOf(input?.toLowerCase()) >= 0
              }
              listHeight={200}
            />
          </div>
        )}

        <Button
          style={{
            backgroundColor: "#1677ff",
            color: "white",

            paddingLeft: "20px",
            marginLeft: "auto",
          }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </>
  );
};
export default WorkFlow;
