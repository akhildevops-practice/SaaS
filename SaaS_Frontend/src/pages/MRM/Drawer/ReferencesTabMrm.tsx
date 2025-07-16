//react,recoil
import React, { useEffect, useState, useContext, useRef } from "react";
import { useRecoilState } from "recoil";
import { referencesData } from "recoil/atom";

//material-ui
import {
  FormLabel,
  InputAdornment,
  TextField,
  Tooltip,
} from "@material-ui/core";
import { MdSearch } from "react-icons/md";
import { MdSend } from "react-icons/md";
import { MdDelete } from "react-icons/md";

//logo,icons
import getAppUrl from "utils/getAppUrl";
import CloseIconImageSvg from "assets/documentControl/Close.svg";

//antd
import { Modal, Table, Form, Input, Popconfirm } from "antd";
import type { FormInstance } from "antd/es/form";

//components
import ReferencesResultPage from "pages/ReferencesResultPage";

//styles
import useStyles from "./style";

//css
import "./temp.css";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

function arrayToQueryString(key: any, array: any) {
  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: any;
  handleSave: (record: any) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<any>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef?.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    // console.log("inside is the editable if");

    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
          // placeholder="Enter Your Comments Here..."
          style={{ border: "2px solid #e8f3f9" }}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type Props = {
  drawer?: any;
  readMode: any;
};

const ReferencesTab = ({ drawer, readMode }: Props) => {
  const [searchValue, setSearchValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState<any>([]);
  const [selectedData, setSelectedData] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [refData, setRefData] = useRecoilState(referencesData);
  const classes = useStyles();
  const userDetails = getSessionStorage();
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };

  useEffect(() => {
    // console.log("check selectedData", selectedData);
    setRefData(selectedData);
  }, [selectedData]);

  useEffect(() => {
    getLogo();
    // console.log("in common ref tab useEffect[drawer?.mode]", drawer);
    getLocationList();
    getAllDepartmentsByOrgAndUnitFilter([userDetails?.location?.id]);
    if (drawer?.mode === "edit") {
      getRefsForDocument();
    }
  }, [drawer]);

  useEffect(() => {
    if (selected && selected.length > 0) {
      // console.log("check selected in useEffect ", selected);
      const filteredData = selected.reduce((unique: any, item: any) => {
        return unique.findIndex(
          (uniqueItem: any) =>
            uniqueItem.refId === item.refId && uniqueItem.type === item.type
        ) < 0
          ? [...unique, item]
          : unique;
      }, []);
      // console.log("check filteredData", filteredData);

      setSelectedData(filteredData);
    }
  }, [selected]);

  const getRefsForDocument = async () => {
    try {
      const response = await axios.get(`api/refs/${drawer?.data?.id}`);
      // console.log("in getRefsForDocument", response);
      if (response.status === 200 || response.status === 201) {
        if (response?.data || response?.data?.length > 0) {
          setSelectedData(response.data);
          setSelectedData(response.data);
        } else {
          setSelectedData([]);
        }
      }
    } catch (error) {}
  };

  const getLocationList = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        // console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setLocationOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            }))
          );
        } else {
          setLocationOptions([]);
          // enqueueSnackbar("No Departments Found", {
          //   variant: "warning",
          // });
        }
      } else {
        // setJobTitleOptions([]);
        // enqueueSnackbar("Error in fetching getAllDepartments", {
        //   variant: "error",
        // });
      }
    } catch (error) {}
  };

  const getAllDepartmentsByOrgAndUnitFilter = async (
    locationIdArray: any = []
  ) => {
    try {
      let locationIdQueryString = "",
        queryStringParts = [];
      if (locationIdArray?.length) {
        locationIdQueryString = arrayToQueryString("location", locationIdArray);
      }
      queryStringParts = [locationIdQueryString].filter(
        (part) => part.length > 0
      );
      queryStringParts.join("&");
      const res = await axios.get(
        `/api/entity/all/org/${userDetails?.organizationId}?${queryStringParts}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && !!res.data.data.length) {
          setDepartmentOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.entityName,
            }))
          );
        } else {
          setDepartmentOptions([]);
          // enqueueSnackbar("No Departments Found", {
          //   variant: "warning",
          // });
        }
      } else {
        // setJobTitleOptions([]);
        // enqueueSnackbar("Error in fetching getAllDepartments", {
        //   variant: "error",
        // });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const handlePressEnter = (event: any) => {
    if (event.key === "Enter") {
      // console.log("press enter", searchValue);
      redirectToGlobalSearch();
    }
  };

  const handleDelete = (refId: any) => {
    const newData = selectedData.filter((item: any) => item.refId !== refId);
    setSelectedData(newData);
  };

  const handleSave = (row: any) => {
    const newData = [...selectedData];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });

    // console.log("check newData", newData);
    setSelectedData(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const referencesColumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (_: any, record: any) => record.type,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => {
        if (!!record?.link && record?.link !== "") {
          return (
            <a
              href={record?.link}
              target="_blank"
              style={{ color: "black", textDecoration: "underline" }}
              rel="noreferrer"
            >
              {record?.name}
            </a>
          );
        } else {
          return record?.name;
        }
      },
    },
    {
      title: "Comments",
      dataIndex: "comments",
      key: "comments",
      editable: true,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) =>
        selectedData.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record?.refId)}
            disabled={readMode}
          >
            <Tooltip title="Delete">
              <MdDelete style={{ fill: "#003566" }} />
            </Tooltip>
          </Popconfirm>
        ) : null,
    },
  ];

  const columns = referencesColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });

  const handleClickSearch = () => {
    // console.log("click search", searchValue);
    redirectToGlobalSearch();
  };

  const redirectToGlobalSearch = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className={classes.modalWrapper}>
      <FormLabel component="legend">
        Search For Documents, Nc, Audit, Clauses..
      </FormLabel>
      <br />
      <TextField
        style={{ width: "245px" }}
        id="standard-basic"
        placeholder="Global Search"
        // className={classes.searchWrapper}
        value={searchValue}
        onChange={(e) => setSearchValue(e.currentTarget.value)}
        onKeyDown={handlePressEnter}
        disabled={readMode}
        // label="Standard"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MdSearch style={{ fill: "black" }} />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <MdSend
                style={{ fill: "black", cursor: "pointer" }}
                onClick={() => handleClickSearch()}
              />
            </InputAdornment>
          ),
          inputProps: {
            style: { color: "black" },
          },
        }}
      />
      <br /> <br />
      {selectedData && selectedData.length > 0 && (
        <div
          data-testid="custom-table"
          className={classes.tableContainer}
          style={{ width: "530px" }}
        >
          <Table
            columns={columns as any}
            dataSource={selectedData}
            pagination={false}
            rowKey="id"
            components={components}
            rowClassName={() => "editable-row"}
          />
        </div>
      )}
      <Modal
        title={
          <div className={classes.header}>
            {logo && (
              <img
                src={logo}
                height={"50px"}
                width={"70px"}
                style={{ marginRight: "15px" }}
              />
            )}

            <span className={classes.moduleHeader}>Search Results</span>
          </div>
        }
        width={1000}
        style={{ top: 6, right: 250 }}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        footer={false}
        bodyStyle={{ overflow: "hidden" }}
        className={classes.modalWrapper}
      >
        <ReferencesResultPage
          searchValue={searchValue}
          selected={selectedData}
          setSelected={setSelected}
          isModalVisible={isModalVisible}
          locationOptions={locationOptions}
          departmentOptions={departmentOptions}
          getAllDepartmentsByOrgAndUnitFilter={
            getAllDepartmentsByOrgAndUnitFilter
          }
        />
      </Modal>
    </div>
  );
};

export default ReferencesTab;
