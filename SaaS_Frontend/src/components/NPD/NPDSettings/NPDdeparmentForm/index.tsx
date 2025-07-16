import { Button, Descriptions, Form, Select, message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "apis/axios.global";
import ActivityTable from "../ActivityTable";
import useStyles from "./style";

const NPDdepartmentForm = () => {
  const { id } = useParams();
  const classes = useStyles();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [departmentList, setDepartmentList] = useState([]);
  const [departmentListId, setDepartmentListId] = useState<string | null>(null);
  const [usersByDepartment, setUsersByDepartment] = useState([]);
  const [formattedData, setFormattedData] = useState<any>([]);
  const [editFormData, setEditFormData] = useState<any>();

  const [formData, setFormData] = useState({
    deptId: "",
    pic: [],
    reviewers: [],
    approvers: [],
    notification: [],
    escalationList: [],
    activity: [], // This will hold the data from formattedData
  });

  useEffect(() => {
    if (id !== undefined && id !== "undefined") {
      editData();
    }
  }, [id]);

  const editData = async () => {
    try {
      const result = await axios.get(
        `/api/configuration/getNpdConfigById/${id}`
      );
      if (result?.data) {
        setEditFormData(result?.data?.activity);

        const data = result.data;
        setDepartmentListId(data.deptId);
        setFormData({
          deptId: data.deptId,
          pic: data.pic || [],
          reviewers: data.reviewers || [],
          approvers: data.approvers || [],
          notification: data.notification || [],
          escalationList: data.escalationList || [],
          activity: data.activity || [],
        });

        form.setFieldsValue({
          department: data.deptId,
          PIC: data.pic || [],
          reviewers: data.reviewers || [],
          approvers: data.approvers || [],
          notification: data.notification || [],
          escalation: data.escalationList || [],
        });

        setFormattedData(data.activity || []);
      }
    } catch (error) {
      console.error("Error fetching data for editing:", error);
    }
  };
  useEffect(() => {
    DepartmentName();
    departmentduplicatecheck();
  }, []);

  const [existedDepartmentList, setExistedDepartmentList] = useState<any[]>([]);
  // console.log("existedDepartmentList", existedDepartmentList);
  const departmentduplicatecheck = async () => {
    try {
      const result = await axios.get("/api/configuration/getAllNpdConfig");

      // Assuming result.data is an array of department names (strings)
      const list = result.data.map((item: any) => {
        return { entityName: item?.dptData };
      });

      setExistedDepartmentList(list);
    } catch (error) {
      console.error("Error fetching department list:", error);
    }
  };

  const DepartmentName = async () => {
    try {
      const result = await axios.get("/api/configuration/getAllDept");
      setDepartmentList(result?.data || []);
    } catch (error) {
      console.error("Error fetching department list:", error);
    }
  };

  useEffect(() => {
    if (departmentListId) {
      allUsersList();
    } else {
      setUsersByDepartment([]);
    }
  }, [departmentListId]);

  const allUsersList = async () => {
    try {
      const result = await axios.get(
        `/api/configuration/getAllUserByDept/${departmentListId}`
      );
      setUsersByDepartment(result.data);
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentListId(value);
    setFormData((prevState) => ({
      ...prevState,
      deptId: value,
    }));
    form.resetFields([
      "PIC",
      "reviewers",
      "approvers",
      "notification",
      "escalation",
    ]);
    setFormData({
      deptId: value,
      pic: [],
      reviewers: [],
      approvers: [],
      notification: [],
      escalationList: [],
      activity: [],
    });
  };

  const handleSelectChange = (value: string[], field: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      activity: formattedData,
    }));
  }, [formattedData]);

  const onFinish = async () => {
    try {
      if (id) {
        // Update existing record
        await axios.put(`/api/configuration/updateNpdConfig/${id}`, formData);
        message.success("Data updated successfully!");
      } else {
        // Submit new record
        await axios.post("/api/configuration/createNpdConfig", formData);
        message.success("Form submitted successfully!");
      }
      navigate("/NPDSettingsHomePage");
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to submit the form. Please try again.");
    }
  };
  const onSearch = (value: string) => {
    console.log("search:", value);
  };

  const filterOption: any = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <div>
      <Form
        form={form}
        style={{ margin: "20px 0px 0px 20px" }}
        onFinish={onFinish}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => navigate("/NPDSettingsHomePage")}
            style={{ border: "2px solid #2874A6", fontWeight: "bold" }}
          >
            Exit
          </Button>

          <Button
            style={{
              marginRight: "10px",
              backgroundColor: "#2874A6",
              border: "2px solid #2874A6",
              fontWeight: "bold",
              color: "white",
            }}
            htmlType="submit"
          >
            {id ? "Update" : "Submit"}
          </Button>
        </div>
        <div style={{ display: "flex", marginTop: "20px" }}>
          <div
            style={{ width: "100%" }}
            className={classes.descriptionLabelStyle}
          >
            <Descriptions
              bordered
              size="small"
              column={{
                xxl: 2,
                xl: 2,
                lg: 2,
                md: 1,
                sm: 2,
                xs: 2,
              }}
            >
              <Descriptions.Item label="Activity Responsible Department: ">
                <Form.Item
                  name="department"
                  className={classes.formItem}
                  rules={[
                    { required: true, message: "Please select a department" },
                  ]}
                >
                  <Select
                    showSearch
                    style={{ width: "23vw" }}
                    placeholder="Select Department"
                    optionFilterProp="children"
                    onSearch={onSearch}
                    filterOption={filterOption}
                    options={departmentList
                      .filter(
                        (dept: any) =>
                          !existedDepartmentList.some(
                            (existedDept: any) =>
                              existedDept.entityName === dept.entityName
                          )
                      )
                      .map((dept: any) => ({
                        value: dept.id,
                        label: dept.entityName,
                      }))}
                    onChange={handleDepartmentChange}
                    value={departmentListId} // controlled component
                  />
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Select PIC: ">
                <Form.Item name="PIC" className={classes.formItem}>
                  <Select
                    showSearch
                    mode="multiple"
                    allowClear
                    style={{ width: "23vw" }}
                    placeholder="Select PIC"
                    optionFilterProp="children"
                    onSearch={onSearch}
                    filterOption={filterOption}
                    options={usersByDepartment.map((user: any) => ({
                      value: user.id,
                      label: user.firstname,
                    }))}
                    onChange={(value) => handleSelectChange(value, "pic")}
                    value={formData.pic}
                  />
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Reviewers: ">
                <Form.Item name="reviewers" className={classes.formItem}>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "23vw" }}
                    placeholder="Select Reviewers"
                    showSearch
                    optionFilterProp="children"
                    onSearch={onSearch}
                    filterOption={filterOption}
                    options={usersByDepartment.map((user: any) => ({
                      value: user.id,
                      label: user.firstname,
                    }))}
                    onChange={(value) => handleSelectChange(value, "reviewers")}
                    value={formData.reviewers}
                  />
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Approvers: ">
                <Form.Item name="approvers" className={classes.formItem}>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "23vw" }}
                    placeholder="Select Approvers"
                    showSearch
                    optionFilterProp="children"
                    onSearch={onSearch}
                    filterOption={filterOption}
                    options={usersByDepartment.map((user: any) => ({
                      value: user.id,
                      label: user.firstname,
                    }))}
                    onChange={(value) => handleSelectChange(value, "approvers")}
                    value={formData.approvers}
                  />
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Notification List: ">
                <Form.Item name="notification" className={classes.formItem}>
                  <Select
                    showSearch
                    optionFilterProp="children"
                    onSearch={onSearch}
                    filterOption={filterOption}
                    mode="multiple"
                    allowClear
                    style={{ width: "23vw" }}
                    placeholder="Select Notification"
                    options={usersByDepartment.map((user: any) => ({
                      value: user.id,
                      label: user.firstname,
                    }))}
                    onChange={(value) =>
                      handleSelectChange(value, "notification")
                    }
                    value={formData.notification}
                  />
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Escalation List: ">
                <Form.Item name="escalation" className={classes.formItem}>
                  <Select
                    showSearch
                    optionFilterProp="children"
                    onSearch={onSearch}
                    filterOption={filterOption}
                    mode="multiple"
                    allowClear
                    style={{ width: "23vw" }}
                    placeholder="Select Escalation"
                    options={usersByDepartment.map((user: any) => ({
                      value: user.id,
                      label: user.firstname,
                    }))}
                    onChange={(value) =>
                      handleSelectChange(value, "escalationList")
                    }
                    value={formData.escalationList}
                  />
                </Form.Item>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Form>
      <ActivityTable
        formattedData={formattedData}
        setFormattedData={setFormattedData}
        editFormData={editFormData}
      />
    </div>
  );
};

export default NPDdepartmentForm;
