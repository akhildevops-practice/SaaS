import React, { useEffect, useState } from "react";
import { Table, Select, Button, Space, SelectProps, Popconfirm } from "antd";
import { AiOutlinePlusCircle, AiOutlineDelete } from "react-icons/ai";
import styles from "./style";
import { npdFormData } from "recoil/atom";
import { useRecoilState } from "recoil";
import axios from "apis/axios.global";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import getAppUrl from "utils/getAppUrl";
import { getAllUsersApi } from "apis/npdApi";
import { useSnackbar } from "notistack";
import {
  IconButton,
  Paper,
  TableCell,
  TableRow,
} from "@material-ui/core";
import DeleteIcon from "../../../../assets/documentControl/Delete.svg";
import { getAllEntities } from "apis/entityApi";

const { Option } = Select;
type Props = { read?: any };
const DepartmentIndex = ({ read }: Props) => {
  const classes = styles();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useRecoilState(npdFormData);
  const [data, setData] = useState([{ key: 1, department: [], pic: [] }]);
  const [deptData, setDeptData] = useState<any>([]);
  const [userData, setUserData] = useState<any>([]);
  const [picOptions, setPicOptins] = useState<any>([]);
  const [custOptins, setCustOptions] = useState<any>([]);
  const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
  const [allDepartment, setAllDepartment] = useState<any[]>([]);
  const [allDataList, setAllDataList] = useState<any[]>([]);
  const [entityData, setEntityData] = useState<any>([]);
  const [entityListData, setEntityListData] = useState<any>([]);
  const [getAllUserData, setGetAllUserData] = useState<any>([]);
  const uniqueId = generateUniqueId(22);
  const orgName = getAppUrl();
  const [entityForm, setEntityForm] = useState<any>({
    id: "",
    entityType: "",
    entityTypeData: {},
    entityList: [],
    entityListData: [],
  });
  const [buttonId, setButtonId] = useState<any>("66cc61a60d82c135b28021996");
  const [deptTableData, setDeptTableData] = useState<any[]>(
    formData?.departmentData
  );
  const [filterDeptData, setFilterDeptData] = useState<any>([]);
  const [filterUserData, setFilterUserData] = useState<any>([]);
  // const [filterUserDNKIData, setFilterUserDNKIData]= useState<any>([]);

  useEffect(() => {
    if (buttonId === 0) {
      setFilterDeptData(deptData);
      // setFilterUserData(filterUserDNKIData);
    } else {
      const updateUsers =
        !!getAllUserData &&
        getAllUserData?.map((ele: any) => ({
          value: ele?.id,
          label: ele.username,
        }));
      setFilterUserData(updateUsers);
      setFilterDeptData(allDepartment);
    }
  }, [buttonId]);

  useEffect(() => {
    setFormData((prevForm: any) => ({
      ...prevForm,
      departmentData: deptTableData,
    }));
  }, [deptTableData]);

  const onSearch = (value: string) => {
    console.log("search:", value);
  };

  const filterOption: any = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  useEffect(() => {
    getListDataEntity();
    getCustomerOptions();
    getAllSuppliers();
    getAllDepartment();
    getAllUsersInformation("", "");
  }, []);

  const getAllUsersInformation = (value: string, type: string) => {
    try {
      getAllUsersApi().then((response: any) => {
        console.log("response", response);
        setGetAllUserData(response?.data);
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  const getCustomerOptions = async () => {
    const result = await axios.get(`/api/configuration/getAllCustomer`);
    const finalResult = result?.data?.map((value: any) => ({
      value: value?.id,
      label: value?.entityName,
    }));
    setCustOptions(finalResult);
  };

  const getAllSuppliers = () => {
    try {
      getAllEntities().then((response: any) => {
        const updateValue = response?.data?.map((ele: any) => ({
          value: ele?.id,
          label: ele?.entityName,
        }));
        setAllSuppliers(updateValue);
        console.log("response?.data", response?.data);
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  const getAllDepartment = () => {
    try {
      getAllEntities().then((response: any) => {
        const updateValue = response?.data?.map((ele: any) => ({
          value: ele?.id,
          label: ele?.entityName,
        }));
        setAllDepartment(updateValue);
      });
    } catch (e) {
      console.log("error", e);
      enqueueSnackbar(`${e}`, {
        variant: "error",
      });
    }
  };

  const getListDataEntity = async () => {
    const result = await axios.get(
      `api/entity/getEntityTypes/byOrg/${orgName}`
    );
    const updateList = result?.data
      ?.filter((itd: any) => itd?.name !== "Department")
      ?.filter((itd: any) => itd?.name !== "Dealer")
      ?.map((ele: any) => {
        const data = {
          value: ele?.id,
          label: ele?.name,
        };
        return data;
      });
    setEntityListData(updateList);
  };

  const addMoreEntityType = () => {
    const data = {
      ...entityForm,
    };
    setEntityData([...entityData, data]);
    const updateData = entityForm?.entityListData?.map((ele: any) => {
      const payload = {
        id: ele?.value,
        category: entityForm?.entityTypeData?.label,
        stakeHolderName: ele?.label,
        stakeHolderId: ele?.value,
        departments: [],
        isSelected: false,
      };
      return payload;
    });
    const updateDataDept = [...deptTableData, ...updateData];
    setDeptTableData(updateDataDept);
    setEntityForm({
      id: "",
      entityType: "",
      entityTypeData: {},
      entityList: [],
      entityListData: [],
    });
    setFormData((prevForm: any) => ({
      ...prevForm,
      departmentData: updateDataDept,
    }));
  };

  const addValuesInEntityType = (
    item: any,
    type: any,
    value: any,
    data: any
  ) => {
    if (type === "entityType") {
      if (data?.label === "Supplier") {
        setAllDataList(allSuppliers);
      } else if (data?.label === "Customer") {
        setAllDataList(custOptins);
      } else if (data?.label === "Department") {
        setAllDataList(allDepartment);
      }
      const update = entityData?.map((ele: any) => {
        if (ele.id === item.id) {
          return {
            ...ele,
            [type]: value,
          };
        }
        return ele;
      });
      setEntityData(update);
    } else {
      const update = entityData?.map((ele: any) => {
        if (ele.id === item.id) {
          return {
            ...ele,
            [type]: value,
          };
        }
        return ele;
      });
      setEntityData(update);
    }
  };

  const fetchUserData = async () => {
    const result = await axios.get(`api/configuration/getAllUserForConfig`);
    setUserData(result?.data || []);
  };
  const options: SelectProps["options"] = [];
  for (let i = 10; i < 36; i++) {
    options.push({
      label: i.toString(36) + i,
      value: i.toString(36) + i,
    });
  }

  useEffect(() => {
    departmentData();
    fetchUserData();
  }, []);

  const departmentData = async () => {
    const result = await axios.get(`api/configuration/getAllDeptFromConfig`);
    setDeptData(result?.data || []);
  };

  const handleSelectChange = (value: any, data: any, item: any, field: any) => {
    const finData = deptData.find((item: any) => item?.entityId === value);
    // const newData = formData.departmentData.map((item: any) => {
    //   if (item.key === key) {
    //     return {
    //       ...item,
    //       [field]: value,
    //       pic: [...finData.pic],
    //       npdConfigId: finData?.npdConfigId,
    //     };
    //   }
    //   return item;
    // });
    const updateData = deptTableData?.map((ele: any) => {
      if (ele.id === data?.id) {
        const updateDepts = ele?.departments?.map((itd: any) => {
          if (itd?.id === item?.id) {
            if (finData === undefined) {
              return {
                ...itd,
                [field]: value,
              };
            } else {
              return {
                ...itd,
                [field]: value,
                pic: [...finData?.pic],
                npdConfigId: finData?.npdConfigId,
              };
            }
          }
          return itd;
        });
        return {
          ...ele,
          departments: updateDepts,
        };
      }
      return ele;
    });
    setDeptTableData(updateData);
    setFormData((prevForm: any) => ({
      ...prevForm,
      departmentData: updateData,
    }));
  };

  const handleDeleteRow = (data: any, item: any) => {
    // const newData = formData.departmentData.filter(
    //   (item: any) => item.key !== key
    // );

    // setFormData((prevForm: any) => ({
    //   ...prevForm,
    //   departmentData: newData,
    // }));
    const updateDept = deptTableData?.map((ele: any) => {
      if (ele?.id === data?.id) {
        const updateRow = ele?.departments?.filter(
          (itd: any) => itd?.id !== item?.id
        );
        return {
          ...ele,
          departments: updateRow,
        };
      }
      return ele;
    });
    setDeptTableData(updateDept);
  };

  const handleAddRow = (data: any, item: any) => {
    // const newRow = {
    //   key: Date.now(),
    //   department: null,
    //   pic: [],
    // };

    // setFormData((prevForm: any) => ({
    //   ...prevForm,
    //   departmentData: [...prevForm.departmentData, newRow],
    // }));

    const updateDept = deptTableData?.map((ele: any) => {
      if (ele?.id === data?.id) {
        const payload = {
          id: uniqueId,
          department: "",
          pic: [],
          npdConfigId: "",
        };
        const updateRow = [...ele?.departments, payload];
        return {
          ...ele,
          departments: updateRow,
        };
      }
      return ele;
    });
    setDeptTableData(updateDept);
    setFormData((prevForm: any) => ({
      ...prevForm,
      departmentData: updateDept,
    }));
  };

  const findById = deptTableData?.find((ele: any) => ele?.id === buttonId);

  // Define table columns
  const columns = [
    {
      title: "Department",
      dataIndex: "department",
      render: (text: any, record: any) => (
        <Select
          showSearch
          // optionFilterProp="children"
          onSearch={onSearch}
          // filterOption={filterOption}
          value={record.department}
          disabled={read}
          onChange={(value) => {
            handleSelectChange(value, findById, record, "department");
          }}
          style={{ width: "300px" }}
          filterOption={(input: any, option: any) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {/* {deptData
            .filter(
              (item: any) =>
                !formData.departmentData
                  .map((dataItem: any) => dataItem.department)
                  .includes(item.entityId) ||
                item.entityId === record.department 
            )
            .map((item: any) => (
              <Option key={item.entityId} value={item.entityId}>
                {item.entityName} 
              </Option>
            ))} */}
          {/* const isSelected = deptTableData
              ?.flatMap((act: any) =>
                act?.departments?.map((itd: any) => itd?.department)
              )
              ?.includes(ele?.value); */}
          {allDepartment?.map((ele: any) => {
            const isSelected = deptTableData
              ?.find((item: any) => item?.id === buttonId)
              ?.departments?.map((itd: any) => itd?.department)
              ?.includes(ele?.value);
            return (
              <Option key={ele?.value} value={ele?.value} disabled={isSelected}>
                {ele?.label}
              </Option>
            );
          })}
        </Select>
      ),
    },
    {
      title: `PIC`,
      dataIndex: "pic",
      render: (text: any, record: any) => {
        return (
          <Select
            showSearch
            // optionFilterProp="children"
            onSearch={onSearch}
            mode="multiple"
            allowClear
            disabled={read}
            placeholder="Please select"
            onChange={(value) =>
              handleSelectChange(value, findById, record, "pic")
            }
            value={record.pic}
            style={{ width: "300px" }}
            filterOption={(input: any, option: any) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {/* {filteredUsers.map((user: any) => (
              <Option key={user.id} value={user.id}>
                {user.username}
              </Option>
            ))} */}
            {getAllUserData
              ?.filter((fil: any) => fil?.entityId === record?.department)
              ?.map((ele: any) => (
                <Option key={ele?.id} value={ele?.id}>
                  {ele?.username}
                </Option>
              ))}
          </Select>
        );
      },
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text: any, record: any, index: any) => (
        <Space size="middle">
          {/* <Button icon={<EditOutlined />} onClick={() => {}} /> */}
          <Button
            icon={<AiOutlineDelete />}
            disabled={read}
            onClick={() => handleDeleteRow(findById, record)}
          />
          {index === 0 && (
            <Button
              type="primary"
              disabled={read}
              icon={<AiOutlinePlusCircle />}
              onClick={() => {
                handleAddRow(findById, record);
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  const addValuesButtonTypes = (data: any) => {
    // let payload = {id:uniqueId, department:"", pic:[], npdConfigId:""}
    const updateDept = deptTableData?.map((ele: any) => {
      if (ele?.id === data?.id) {
        const updateRow =
          ele?.departments?.length === 0
            ? [{ id: uniqueId, department: "", pic: [], npdConfigId: "" }]
            : ele?.departments;
        return {
          ...ele,
          departments: updateRow,
        };
      }
      return ele;
    });
    setDeptTableData(updateDept);
    setFormData((prevForm: any) => ({
      ...prevForm,
      departmentData: updateDept,
    }));
  };

  const deleteStakeHolderData = (id: any) => {
    const updateData = deptTableData?.filter((ele: any) => ele?.id !== id);
    setDeptTableData(updateData);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ paddingTop: "10px" }}>
        <div
          style={{
            // display: "flex",
            // alignItems: "center",
            // justifyContent: "center",
            paddingBottom: "10px",
          }}
        >
          <Paper style={{ width: "600px" }}>
            <TableRow style={{ width: "600px" }}>
              <TableCell style={{ padding: "5px" }}>
                <Select
                  value={
                    entityForm?.entityType ? entityForm.entityType : undefined
                  }
                  style={{ width: "170px", color: "black" }}
                  onChange={(e: any, data: any) => {
                    setEntityForm({
                      ...entityForm,
                      entityType: e,
                      entityTypeData: data,
                      id: uniqueId,
                    });
                    if (data?.label === "Supplier") {
                      setAllDataList(allSuppliers);
                    } else if (data?.label === "Customer") {
                      setAllDataList(custOptins);
                    } else if (data?.label === "Department") {
                      setAllDataList(allDepartment);
                    }
                  }}
                  showSearch
                  placeholder="Select Entity Type"
                  optionFilterProp="children"
                  onSearch={onSearch}
                  filterOption={filterOption}
                  options={entityListData}
                  disabled={read}
                />
              </TableCell>
              <TableCell style={{ padding: "5px" }}>
                <Select
                  disabled={read}
                  mode="multiple"
                  value={entityForm?.entityList}
                  style={{ width: "320px", color: "black" }}
                  onChange={(e: any, data: any) => {
                    setEntityForm({
                      ...entityForm,
                      entityList: e,
                      entityListData: data,
                    });
                  }}
                  showSearch
                  placeholder="Select Entity"
                  optionFilterProp="children"
                  onSearch={onSearch}
                  filterOption={filterOption}
                  options={allDataList?.filter(
                    (ele: any) =>
                      !deptTableData
                        ?.map((item: any) => item?.id)
                        ?.includes(ele?.value)
                  )}
                />
              </TableCell>
              <TableCell style={{ padding: "5px" }}>
                <IconButton style={{ padding: "0px", margin: "0px" }}>
                  <Button
                    type="primary"
                    disabled={read}
                    icon={<AiOutlinePlusCircle />}
                    onClick={addMoreEntityType}
                  >
                    Add
                  </Button>
                </IconButton>
              </TableCell>
            </TableRow>
          </Paper>
        </div>
        <Paper>
          <div style={{ display: "flex", gap: "90px" }}>
            <div>
              <div
                style={{
                  display: "grid",
                  width: "170px",
                  height: "auto",
                  padding: "5px",
                  paddingTop: "15px",
                  gap: "3px",
                }}
              >
                {deptTableData?.map((itd: any, index: any) => {
                  return (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "30px",
                      }}
                    >
                      <Button
                        className={
                          itd?.id === buttonId
                            ? classes?.activeButton
                            : classes.buttonNpd
                        }
                        onClick={() => {
                          setButtonId(itd?.id);
                          addValuesButtonTypes(itd);
                        }}
                      >
                        {itd?.stakeHolderName}-({itd?.category})
                      </Button>
                      <Popconfirm
                        placement="top"
                        title={"Are you sure  to Delete"}
                        onConfirm={() => deleteStakeHolderData(itd?.id)}
                        okText="Yes"
                        cancelText="No"
                        disabled={read}
                      >
                        <IconButton style={{ margin: "0px", padding: "0px" }}>
                          <img
                            src={DeleteIcon}
                            style={{ width: "17px", height: "17px" }}
                          />
                        </IconButton>
                      </Popconfirm>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ borderLeft: "1px solid grey" }}>
              <div className={classes.tableContainer}>
                <Table
                  columns={columns}
                  dataSource={
                    deptTableData?.find((ele: any) => ele.id === buttonId)
                      ?.departments || []
                  }
                  pagination={false}
                  rowKey="key"
                  className={classes.documentTable}
                  style={{ width: "730px" }}
                />
              </div>
            </div>
          </div>
        </Paper>
        {/* <div style={{ margin: "50px 0px 0px 60px" }}>
        <h3>Attachments</h3>
        {formData?.attachFiles?.map((attachment: any, index: any) => (
          <Space
            key={attachment.key}
            style={{ display: "flex", marginBottom: "8px" }}
            align="start"
          >
            <Input
              placeholder="Attachment Description"
              disabled={read}
              value={attachment.name}
              onChange={(e) => handleNameChange(e.target.value, attachment.key)}
              style={{ width: "400px" }}
            />
            <Upload
              // fileList={attachment.files}
              // onChange={(info) => handleFileChange(info, attachment.key)}
              multiple
              fileList={attachment.files} // Display uploaded files
              onChange={(info) => handleFileChange(info, attachment.key)}
              disabled={read}
              // multiple={false} // Set to false for single file upload
              // listType="picture" // Displays as a picture card
              onPreview={(file) => window.open(file.url)} // Open the file in a new tab on click
            >
              <Button icon={<UploadOutlined />}>Upload Files</Button>
            </Upload>
            {formData?.attachFiles?.length !== 1 && (
              <Button
                icon={<AiOutlineDelete />}
                disabled={read}
                onClick={() => handleDeleteAttachment(attachment.key)}
              />
            )}

            {index === formData?.attachFiles?.length - 1 && (
              <Button
                type="primary"
                icon={<AiOutlinePlusCircle />}
                disabled={read}
                onClick={handleAddAttachment}
              />
            )}
          </Space>
        ))}
      </div> */}
      </div>
    </div>
  );
};

export default DepartmentIndex;
