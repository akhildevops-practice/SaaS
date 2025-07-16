import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Checkbox,
  Space,
  Modal,
  Select,
  Form,
  Radio,
  RadioChangeEvent,
  message,
} from "antd";
import {
  AiOutlinePlusSquare,
  AiOutlineDelete,
  AiOutlineUser,
} from "react-icons/ai";
import styles from "./style";
import axios from "apis/axios.global";
import { API_LINK } from "config";
import { useSnackbar } from "notistack";
import OwnersTable from "./OwnersModel/Index";

type Props = {
  selectedWorkflow?: any;
  setSelectedWorkflow?: any;
  actionType?: any;
  setActionType?: any;
  setIsWorkflowModalOpen?: any;
};

const Workflow = ({
  selectedWorkflow,
  setSelectedWorkflow,
  actionType,
  setActionType,
  setIsWorkflowModalOpen,
}: Props) => {
  const initialRow = {
    stageNumber: 1,
    stage: "",
    sendForEdit: false,
    edit: false,
    needsAllApprovals: false,
    ownerSettings: [],
  };

  //states
  // workFlow states
  const { enqueueSnackbar } = useSnackbar();
  const classes = styles();
  const [title, setTitle] = useState("");
  const [dataSource, setDataSource] = useState<any[]>([initialRow]);
  const [currentOwnersRowId, setCurrentOwnersRowId] = useState<any>(""); // State to track the current row being edited

  //owner states
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allEntityTypes, setAllEntityTypes] = useState<any[]>([]);
  const [allGlobalRoles, setAllGlobalRoles] = useState<any[]>([]);
  // const [allDepartment, setAllDepartment] = useState<any[]>([]);
  // const [allSuppliers, setAllSupplierst] = useState<any[]>([]);
  // const [radioButtonsValue, setRadioButtonsValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [form] = Form.useForm();
  // const [formData, setFormData] = useState({
  //   type: "",
  //   selectedUsers: [],
  //   selectedDepartment: "",
  //   selectedSupplier: "",
  // });
  const [ownerSettings, setOwnerSettings] = useState<any[][]>([]);

  //consoles
  // console.log("dataSourceworkflow", dataSource);
  // console.log("ownerSettings", ownerSettings);
  // console.log("currentOwnersRowId", currentOwnersRowId);
  // console.log("selectedDocumentId", selectedWorkflow);
  // console.log("radioButtonsValue", radioButtonsValue);
  // console.log("allDepartment", allDepartment);
  // console.log("ACTION TYPE", actionType);

  // useEffects
  useEffect(() => {
    getAllUsers();
    //getAllDepartment();
    getAllEntityTypes();
    getGlobalRoles();
  }, []);

  useEffect(() => {
    if (actionType === "View" || actionType === "Edit") {
      getWorkflowDataById();
    }
    if (actionType === "Create") {
      setTitle("");
      setDataSource([initialRow]);
      // setFormData({
      //   type: "",
      //   selectedUsers: [],
      //   selectedDepartment: "",
      //   selectedSupplier: "",
      // });
    }
  }, [selectedWorkflow, actionType]);

  // to get all users list
  const getAllUsers = async () => {
    const result = await axios.get("/api/business/getAllUser");
    if (result?.data?.length > 0) {
      const users = result?.data?.map((item: any) => ({
        value: item?.id,
        label: item?.username,
      }));
      setAllUsers(users);
    } else {
      setAllUsers([]);
    }
  };

  const getGlobalRoles = async () => {
    const result = await axios.get("/api/user/getAllGlobalRoles");
    if (result?.data?.length > 0) {
      const globalRoles = result?.data?.map((item: any) => ({
        value: item?._id,
        label: item?.roleName,
      }));
      setAllGlobalRoles(globalRoles);
    } else {
      setAllGlobalRoles([]);
    }
  };

  const getAllEntityTypes = async () => {
    const result = await axios.get("/api/entity/allEntityTypes");
    if (result?.data?.length > 0) {
      const entityTypes = result?.data?.map((item: any) => ({
        value: item?.id,
        label: item?.name,
      }));
      setAllEntityTypes(entityTypes);
    } else {
      setAllEntityTypes([]);
    }
  };

  // to get all Department list
  // const getAllDepartment = async () => {
  //   const result = await axios.get("/api/entity");
  //   if (result?.data?.length > 0) {
  //     const users = result?.data?.map((item: any) => ({
  //       value: item?.id,
  //       label: item?.entityName,
  //     }));
  //     users.unshift({
  //       value: "From Creator's Organization",
  //       label: "From Creator's Organization",
  //     });
  //     setAllDepartment(users);
  //   } else {
  //     setAllDepartment([]);
  //   }
  // };

  // to get all Suppliers list
  // const getAllSuppliers = async () => {
  //   const result = await axios.get(
  //     API_LINK + `/api/inspection/getAllSuppliers`
  //   );
  //   if (result?.data?.length > 0) {
  //     const users = result?.data?.map((item: any) => ({
  //       value: item?.id,
  //       label: item?.entityName,
  //     }));
  //     setAllSupplierst(users);
  //   } else {
  //     setAllSupplierst([]);
  //   }
  // };

  //workflow functions

  //function stage name input field
  const handleInputChange = (value: any, key: any, index: any) => {
    const newDataSource = [...dataSource];
    newDataSource[index][key] = value;
    setDataSource(newDataSource);
  };

  //function stage number input field
  const handlestageNumber = (value: any, key: any, index: any) => {
    const newDataSource = [...dataSource];
    newDataSource[index][key] = value;
    setDataSource(newDataSource);
  };

  // function for all checkbox fields in workflow table
  const handleCheckboxChange = (checked: any, key: any, index: any) => {
    const newDataSource = [...dataSource];
    newDataSource[index][key] = checked;
    setDataSource(newDataSource);
  };

  // to add a new row in workflow table
  const addRow = (index: number) => {
    const newStageNumber = dataSource[index].stageNumber + 1;

    // Insert new row after the clicked index
    const newRow = { ...initialRow, stageNumber: newStageNumber };

    // Split the array
    const before = dataSource.slice(0, index + 1);
    const after = dataSource.slice(index + 1);

    // Increment stageNumbers of all rows in "after"
    const updatedAfter = after.map((row) => ({
      ...row,
      stageNumber: row.stageNumber + 1,
    }));

    // Combine and re-sort by stageNumber
    const updatedData = [...before, newRow, ...updatedAfter];

    // Reassign stageNumbers to maintain order
    const reOrdered = updatedData.map((row, i) => ({
      ...row,
      stageNumber: i + 1,
    }));

    setDataSource(reOrdered);
  };

  const deleteRow = (index: number) => {
    // Remove the row at the given index
    const updatedData = dataSource.filter((_, i) => i !== index);

    // Reassign stageNumbers to remaining rows
    const reOrdered = updatedData.map((row, i) => ({
      ...row,
      stageNumber: i + 1,
    }));

    setDataSource(reOrdered);
  };

  // to give a edditing option to perticular data based on index
  const editRow = (index: any) => {
    const newDataSource = [...dataSource];
    newDataSource[index].isEditing = true;
    setDataSource(newDataSource);
  };

  // to save a row data in workflow table
  const saveRow = async (index: any, record: any) => {
    const newDataSource = [...dataSource];
    newDataSource[index].isEditing = false;
    setDataSource(newDataSource);
  };

  // to submit a data for a common workflow data
  const submitWorkFlow = async (payload: any) => {
    const result = await axios.post(
      "/api/global-workflow/createGlobalWorkflow",
      payload
    );
    getWorkflowDataById();
  };

  // to submit a data for a common workflow data
  const handleWorkflowSubmit = async () => {
    try {
      if (!title.trim()) {
        enqueueSnackbar("Title Field is Empty", {
          variant: "error",
        });
        return;
      }
      if (title.trim().toLowerCase() === "default") {
        enqueueSnackbar("Title cannot be named as 'Default'", {
          variant: "error",
        });
        return;
      }
      const allOptionsSelected = dataSource.every((stage: any) => {
        const ownerSettings = stage?.ownerSettings;

        // If ownerSettings is missing or empty, consider it invalid
        if (!Array.isArray(ownerSettings) || ownerSettings.length === 0) {
          return false;
        }

        return ownerSettings.every((owner: any) =>
          owner.every((user: any) => {
            if (user.type === "Named Users") {
              return user.selectedUsers?.length > 0;
            }
            if (
              user.type === "PIC Of" ||
              user.type === "Head Of" ||
              user.type === "Manager Of" ||
              user.type === "User Of"
            ) {
              return !!user.selectedDepartment;
            }
            if (user.type === "Global Role Of") {
              return !!user.selectedGlobalRole;
            }
            return false;
          })
        );
      });
      if (!allOptionsSelected) {
        message.error("Some Stages Owners are not selected");
        return;
      }
      const payload = {
        title: title,
        workflow: dataSource,
      };
      if (actionType === "Create") {
        const result = await axios.post(
          "/api/global-workflow/createGlobalWorkflow",
          payload
        );
        enqueueSnackbar(result.data.responseMessage, {
          variant: "success",
        });
      }
      if (actionType === "Edit") {
        const result = await axios.patch(
          `/api/global-workflow/updateGlobalWorkflow/${selectedWorkflow}`,
          payload
        );
        enqueueSnackbar(result.data.responseMessage, {
          variant: "success",
        });
      }
      setSelectedWorkflow("");
      setActionType(null);
      setIsWorkflowModalOpen(false);
    } catch (error: any) {
      if (!error.response) {
        message.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        message.error(data.message);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  // to submit a data for a perticular Document workflow data
  const submitDocumnetWorkflowData = async (payload: any) => {
    const result = await axios.put(
      `/api/docType/createWorkFlowByDocId?documentId=${selectedWorkflow}`,
      payload
    );
    getWorkflowDataById();
  };

  // to submit a edited row data for a common workflow table
  const submitEditedWorkFlowData = async (payload: any, id: any) => {
    const result = await axios.put(
      `/api/docType/updateWorkflow/${id}`,
      payload
    );
    getWorkflowDataById();
  };

  // to get a workflow table data
  const getWorkflowDataById = async () => {
    try {
      if (selectedWorkflow) {
        const result = await axios.get(
          `/api/global-workflow/getGlobalWorkflowById/${selectedWorkflow}`
        );

        if (result && result?.data) {
          setTitle(result?.data.title);
          setDataSource(
            result?.data.workflow ? result?.data.workflow : [initialRow]
          );
        } else {
          console.log("No data received from API");
        }
      } else {
        setDataSource([initialRow]);
      }
    } catch (error) {
      console.error("Error fetching workflow data:", error);
    }
  };

  // owners functions

  // to open owner selection modal while opening all the data get loadded if it is already existed
  const showModal = (index: any, record: any) => {
    setCurrentOwnersRowId(index); // Set the current row being edited
    setIsModalOpen(true);

    if (record?.ownerSettings) {
      // const ownerSettings = {
      //   type: record?.ownerSettings?.type || "",
      //   selectedUsers: record?.ownerSettings?.selectedUsers || [],
      //   selectedDepartment: record?.ownerSettings?.selectedDepartment || null,
      //   selectedSupplier: record?.ownerSettings?.selectedSupplier || null,
      // };
      // form.setFieldsValue(ownerSettings);
      // setRadioButtonsValue(record?.ownerSettings?.type || "");
      setOwnerSettings(record?.ownerSettings);
    }
  };

  // ok button function in the ownner modal
  const handleOk = () => {
    setIsModalOpen(false);
    // form.resetFields(); // Reset the form fields
    // setFormData({
    //   type: "",
    //   selectedUsers: [],
    //   selectedDepartment: "",
    //   selectedSupplier: "",
    // }); // Clear the form data state
  };

  // Cancel button function in the ownner modal
  const handleCancel = () => {
    // form.resetFields(); // Reset the form fields
    // setFormData({
    //   type: "",
    //   selectedUsers: [],
    //   selectedDepartment: "",
    //   selectedSupplier: "",
    // }); // Clear the form data state
    setIsModalOpen(false);
  };

  // radio button function for storing the values to the state
  // const radioButtononchange = (e: RadioChangeEvent) => {
  //   setRadioButtonsValue(e.target.value);
  // };

  // store all intered data in the form in owner modal to the formdata state
  // const handleFormChange = (changedValues: any, allValues: any) => {
  //   setFormData(allValues);
  // };

  // owner modal data submit function
  // const handleSubmit = () => {
  //   form
  //     .validateFields()
  //     .then((values) => {
  //       const newDataSource = [...dataSource];
  //       newDataSource[currentOwnersRowId].ownerSettings = values;
  //       setDataSource(newDataSource);
  //       form.resetFields();
  //       setIsModalOpen(false);
  //       // submitOwner(values, currentOwnersRowId).then(() => {
  //       //   form.resetFields(); // Reset the form fields
  //       //   setFormData({
  //       //     radioGroup: "",
  //       //     selectedUsers: [],
  //       //     selectedDepartment: "",
  //       //     selectedSupplier: "",
  //       //   }); // Clear the form data state
  //       //   setIsModalOpen(false);
  //       //   getWorkflowDataById();
  //       // });
  //     })
  //     .catch((info) => {
  //       console.log("Validate Failed:", info);
  //     });
  // };

  // to submit owner modal  data to the backend api
  const submitOwner = async (values: any, currentOwnersRowId: any) => {
    const result = await axios.put(
      `/api/docType/updateOwnersByWorkflowId/${currentOwnersRowId}`,
      values
    );
  };

  const columns: any = [
    {
      title: "Stage Number",
      dataIndex: "stageNumber",
      key: "stageText",
      render: (text: any, record: any, index: any) =>
        actionType === "Create" || actionType === "Edit" ? (
          <Input
            type="number"
            value={record.stageNumber}
            onChange={(e) =>
              handlestageNumber(e.target.value, "stageNumber", index)
            }
            disabled={true}
          />
        ) : (
          text
        ),
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      render: (text: any, record: any, index: any) =>
        actionType === "Create" || actionType === "Edit" ? (
          <Input
            value={record.stage}
            onChange={(e) => handleInputChange(e.target.value, "stage", index)}
          />
        ) : (
          text
        ),
    },

    {
      title: "Send For Edit",
      dataIndex: "sendForEdit",
      key: "sendForEdit",
      render: (text: any, record: any, index: any) => (
        <Checkbox
          checked={text}
          disabled={!(actionType === "Create" || actionType === "Edit")}
          onChange={(e) =>
            handleCheckboxChange(e.target.checked, "sendForEdit", index)
          }
        />
      ),
    },
    // {
    //   title: "Reject",
    //   dataIndex: "reject",
    //   key: "reject",
    //   render: (text: any, record: any, index: any) => (
    //     <Checkbox
    //       checked={text}
    //       disabled={!record.isEditing}
    //       onChange={(e) =>
    //         handleCheckboxChange(e.target.checked, "reject", index)
    //       }
    //     />
    //   ),
    // },
    {
      title: "Edit",
      dataIndex: "edit",
      key: "edit",
      render: (text: any, record: any, index: any) => (
        <Checkbox
          checked={text}
          disabled={!(actionType === "Create" || actionType === "Edit")}
          onChange={(e) =>
            handleCheckboxChange(e.target.checked, "edit", index)
          }
        />
      ),
    },
    {
      title: "Needs All Approvals",
      dataIndex: "needsAllApprovals",
      key: "needsAllApprovals",
      render: (text: any, record: any, index: any) => (
        <Checkbox
          checked={text}
          disabled={!(actionType === "Create" || actionType === "Edit")}
          onChange={(e) =>
            handleCheckboxChange(e.target.checked, "needsAllApprovals", index)
          }
        />
      ),
    },
    // {
    //   title: "eSign",
    //   dataIndex: "eSign",
    //   key: "eSign",
    //   render: (text: any, record: any, index: any) => (
    //     <Checkbox
    //       checked={text}
    //       disabled={!record.isEditing}
    //       onChange={(e) =>
    //         handleCheckboxChange(e.target.checked, "eSign", index)
    //       }
    //     />
    //   ),
    // },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_: any, record: any, index: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Space
            style={{
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            {/* {dataSource[index].isEditing ? (
              <Button
                type="dashed"
                icon={<CheckCircleOutlined />}
                onClick={() => saveRow(index, record)}
              ></Button>
            ) : (
              <>
                <Button
                  type="dashed"
                  icon={<EditOutlined />}
                  onClick={() => editRow(index)}
                ></Button>
                <Button
                  type="dashed"
                  icon={<UserOutlined />}
                  onClick={() => showModal(record)} // Pass the row data to the showModal function
                ></Button>
              </>
            )} */}
            <Button
              type="dashed"
              icon={<AiOutlineUser />}
              onClick={() => showModal(index, record)} // Pass the row data to the showModal function
            ></Button>
            {(actionType === "Create" || actionType === "Edit") && (
              <>
                <Button
                  type="dashed"
                  icon={<AiOutlinePlusSquare />}
                  onClick={() => addRow(index)}
                ></Button>
                <Button
                  type="dashed"
                  icon={<AiOutlineDelete />}
                  onClick={() => deleteRow(index)}
                ></Button>
              </>
            )}
          </Space>
        </div>
      ),
    },
  ];

  const handleOwnerSettings = () => {
    const newDataSource = [...dataSource];
    newDataSource[currentOwnersRowId].ownerSettings = ownerSettings;
    const allOptionsSelected =
      newDataSource[currentOwnersRowId].ownerSettings?.length > 0 &&
      newDataSource[currentOwnersRowId].ownerSettings?.every((owner: any) =>
        owner.every((user: any) => {
          if (user.type === "Named Users") {
            return user.selectedUsers.length > 0;
          }
          if (
            user.type === "PIC Of" ||
            user.type === "Head Of" ||
            user.type === "Manager Of" ||
            user.type === "User Of"
          ) {
            return user.selectedDepartment !== "";
          }
          if (user.type === "Global Role Of") {
            return user.selectedGlobalRole !== "";
          }
        })
      );
    if (!allOptionsSelected) {
      message.error("Please Fill all the fields");
      return;
    }
    setDataSource(newDataSource);
    setOwnerSettings([]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <strong>Title: </strong>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "400px", color: "black" }}
        disabled={!(actionType === "Create" || actionType === "Edit")}
      />
      <div className={classes.tableContainer}>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey={(record: any, index: any) => index}
          pagination={false}
          className={classes.documentTable}
        />
      </div>
      <div>
        {(actionType === "Create" || actionType === "Edit") && (
          <Button
            type="primary"
            htmlType="submit"
            onClick={handleWorkflowSubmit}
            style={{ marginTop: "16px" }}
          >
            {actionType === "Create"
              ? "Submit"
              : actionType === "Edit"
              ? "Update"
              : ""}
          </Button>
        )}
      </div>

      <Modal
        title="Owners"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1200}
        footer={null}
      >
        <div
          style={{
            height: "70vh",
            overflowY: "auto",
          }}
        >
          {/* <Form
            form={form}
            layout="vertical"
            onValuesChange={handleFormChange}
            initialValues={formData}
            disabled={!(actionType === "Create" || actionType === "Edit")}
          >
            <Form.Item name="type" label="Radio Group">
              <Radio.Group
                onChange={radioButtononchange}
                value={radioButtonsValue}
              >
                <Radio value={"Named Users"}>Named Users</Radio>
                <Radio value={"Dept PIC"}>Dept PIC</Radio>
                <Radio value={"Dept Manager"}>Dept Manager</Radio>
                <Radio value={"Dept User"}>Dept User</Radio>
                <Radio value={"From Workflow"}>From Workflow</Radio>
              </Radio.Group>
            </Form.Item>

            {radioButtonsValue === "Named Users" && (
              <Form.Item name="selectedUsers" label="Select Users">
                <Select
                  mode="multiple"
                  placeholder="Select users"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as any)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  style={{ color: "black" }}
                >
                  {allUsers.map((user) => (
                    <Select.Option key={user.value} value={user.value}>
                      {user.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {(radioButtonsValue === "Dept PIC" ||
              radioButtonsValue === "Dept User" ||
              radioButtonsValue === "Dept Manager") && (
              <Form.Item name="selectedDepartment" label="Select Department">
                <Select
                  placeholder="Select Department"
                  style={{ color: "black" }}
                >
                  {allDepartment?.map((user) => (
                    <Select.Option key={user.value} value={user.value}>
                      {user.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {/* {radioButtonsValue === "From Workflow" && (
              <Form.Item name="selectedSupplier" label="Select Field">
                <Select placeholder="Select supplier">
                  <Select.Option key={"Supplier"} value={"Supplier"}>
                    Supplier
                  </Select.Option>
                </Select>
              </Form.Item>
            )} */}

          {/* <Button
              type="primary"
              htmlType="submit"
              onClick={handleSubmit}
              style={{ marginTop: "16px" }}
            >
              Submit
            </Button>
          </Form> */}
          <OwnersTable
            allUsers={allUsers}
            allEntityTypes={allEntityTypes}
            allGlobalRoles={allGlobalRoles}
            ownerSettings={ownerSettings}
            setOwnerSettings={setOwnerSettings}
            handleOwnerSettings={handleOwnerSettings}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Workflow;
