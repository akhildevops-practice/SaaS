//react,recoil
import React, { useEffect, useState, useContext, useRef } from "react";
import { useRecoilState } from "recoil";
import { referencesData } from "recoil/atom";
//material-ui
import { InputAdornment, TextField, Tooltip } from "@material-ui/core";
import { MdSearch } from "react-icons/md";
import { MdSend } from "react-icons/md";
import { MdDelete } from "react-icons/md";
//logo,icons
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import getAppUrl from "utils/getAppUrl";
import { MdHelp } from "react-icons/md";
//antd
import { Modal, Table, Form, Input, Popconfirm, Popover } from "antd";
import type { FormInstance } from "antd/es/form";
//styles
import useStyles from "./style";

//css
import "./temp.css";
import axios from "apis/axios.global";
import { MdCheckCircle } from "react-icons/md";
import getSessionStorage from "utils/getSessionStorage";
import { useSnackbar } from "notistack";
import HiraReferenceResultPage from "./HiraReferenceResultPage";
const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
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

function arrayToQueryString(key: any, array: any) {
  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}

type Props = {
  drawer?: any;
  workflowStatus?: any;
  checkIfUserCanAddReference?: any;
  hiraId?: any;
};

const HiraReferences = ({
  drawer,
  workflowStatus = null,
  checkIfUserCanAddReference,
  hiraId = "",
}: Props) => {
  const [searchValue, setSearchValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState<any>([]);
  const [selectedData, setSelectedData] = useState<any>([]);
  const userDetails = getSessionStorage();
  const [refData, setRefData] = useRecoilState(referencesData);
  const [disableSearch, setDisableSearch] = useState<any>(false);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };
  useEffect(() => {
    // console.log("checkrisklatest drawer hiraInWorkflow", hiraInWorkflow);
    setRefData(selectedData);
  }, [selectedData]);
  useEffect(() => {
    // console.log("checkrisk2 inside workflowStatus", checkIfUserCanAddReference && checkIfUserCanAddReference());
    // getEntityList();
    getLogo();
    getLocationList();
    getAllDepartmentsByOrgAndUnitFilter([userDetails?.location?.id]);
    if (
      !!workflowStatus &&
      workflowStatus !== "open" &&
      workflowStatus !== "REJECTED" &&
      workflowStatus !== "APPROVED"
    ) {
      // console.log("checkrisk2 inside workflowStatus", workflowStatus);

      if (!checkIfUserCanAddReference()) {
        setDisableSearch(true);
      } else {
        setDisableSearch(false);
      }
    }
    // console.log("in common ref tab useEffect[drawer?.mode]", drawer);
    if (!!drawer && drawer?.mode === "edit") {
      getRefsForDocument();
    }
  }, [drawer?.mode]);

  useEffect(() => {
    if (selected && selected.length > 0) {
      const filteredData = selected.reduce((unique: any, item: any) => {
        const existingIndex = unique.findIndex(
          (uniqueItem: any) =>
            uniqueItem.refId === item.refId && uniqueItem.type === item.type
        );

        if (existingIndex < 0) {
          // If the item is new, add it with isNew: true
          return [...unique, { ...item, isNew: true }];
        } else {
          // If the item already exists, keep its original isNew value
          return unique.map((uniqueItem: any, index: number) =>
            index === existingIndex ? { ...uniqueItem, ...item } : uniqueItem
          );
        }
      }, selectedData); // Initialize with existing selectedData

      setSelectedData(filteredData);
    }
  }, [selected]);

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

  const getLocationList = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        console.log("checkrisk res in getAllDepartments", res);
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
          enqueueSnackbar("No Departments Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartments", {
          variant: "error",
        });
      }
    } catch (error) {}
  };

  const getRefsForDocument = async () => {
    try {
      // const docId = drawer?.data?.id || drawerDataState?.id;
      if (hiraId) {
        const response = await axios.get(`api/refs/${hiraId}`);
        // console.log("in getRefsForDocument", response);
        if (response.status === 200 || response.status === 201) {
          if (response?.data || response?.data?.length > 0) {
            setSelectedData(
              response.data?.map((item: any) => ({ ...item, isNew: false }))
            );
          } else {
            setSelectedData([]);
          }
        }
      } else {
        // enqueueSnackbar("Please Select Hira to load references!", {
        //   variant: "error",
        // });
        return;
      }
    } catch (error) {}
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
    // console.log("checkrisk row --- in handleSave", row);

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

  const handleSaveRefForHira = async (row: any) => {
    console.log("checkrisk on save--->", row);
    console.log("checkrisk hiraId", hiraId);

    try {
      const formattedReference = {
        refId: row.refId,
        organizationId: userDetails?.organizationId,
        type: row.type,
        name: row.name,
        comments: row.comments,
        createdBy: userDetails.firstName + " " + userDetails.lastName,
        updatedBy: null,
        link: row.link,
        refTo: hiraId,
      };

      console.log("check formattedReference", formattedReference);
      const refArray = [formattedReference];
      if (hiraId) {
        const response = await axios.post("/api/refs/bulk-insert", refArray);
        console.log("check response", response);
        if (response.status === 200 || response.status === 201) {
          console.log("check response", response);

          // Update the local state to reflect the saved changes
          const updatedData = selectedData.map((item: any) => {
            if (item.refId === row.refId) {
              return { ...item, ...row, isNew: false }; // Set isNew to false to indicate that it has been saved
            }
            return item;
          });
          setSelectedData(updatedData);
        }
      }
    } catch (error) {
      console.log("error in handleSaveRefForHira", error);
    }
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
      render: (_: any, record: any) => (
        <>
          {selectedData.length >= 1 && (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record?.refId)}
            >
              <Tooltip title="Delete">
                <MdDelete style={{ fill: "#003566" }} />
              </Tooltip>
            </Popconfirm>
          )}
          {record.isNew && (
            <Tooltip title="Save">
              <MdCheckCircle
                style={{ fill: "#003566", cursor: "pointer", marginLeft: 10 }}
                onClick={() => handleSaveRefForHira(record)}
              />
            </Tooltip>
          )}
        </>
      ),
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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const content = (
    <div style={{ padding: "10px", fontSize: "14px" }}>
      <ul style={{ margin: 0, paddingLeft: "20px", width: "400px" }}>
        <li>
          <b>Documents</b> (By Doc Name, Doc Number, Tags, Doc Type, Department,
          State )
        </li>
        <li>
          <b>CAPA</b> (By Title and Description)
        </li>
        <li>
          <b>CIP</b> (By Title)
        </li>
        <li>
          <b>HIRA</b> (By Job Title)
        </li>
        <li>
          <b>Aspect</b> impact (by Stage)
        </li>
        <li>
          <b>Ref Doc</b> (By Title)
        </li>
        <li>
          <b>NC </b>(By Numbrt, Status, Severity)
        </li>
        <li>
          <b>Clauses </b>(By Number, Name, and Description)
        </li>
      </ul>
      <br />
      <li>
        <b>By Default User's Unit Filter is Applied</b>
      </li>
    </div>
  );
  return (
    <div className={classes.modalWrapper}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <TextField
          style={{ width: "245px" }}
          id="standard-basic"
          placeholder={"Global Search"}
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
          onKeyDown={handlePressEnter}
          disabled={disableSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MdSearch style={{ fill: "black" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <Tooltip
                title={
                  searchValue
                    ? "Click to search for entered value"
                    : "Click to search in all clauses"
                }
              >
                <InputAdornment
                  position="end"
                  disablePointerEvents={disableSearch}
                >
                  <MdSend
                    style={{ fill: "black", cursor: "pointer" }}
                    onClick={() => handleClickSearch()}
                  />
                </InputAdornment>
              </Tooltip>
            ),
            inputProps: {
              style: { color: "black" },
            },
          }}
        />
        <Popover
          placement="right"
          title={"Search"}
          content={content}
          trigger={["hover", "click"]}
        >
          <MdHelp
            style={{
              fontSize: "24px",
              cursor: "pointer",
              // color: "blue",
            }}
          />
        </Popover>
      </div>
      <br />
      {selectedData && selectedData.length > 0 && (
        <div data-testid="custom-table" className={classes.tableContainer}>
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
        style={{ top: 40 }}
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
        <HiraReferenceResultPage
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

export default HiraReferences;
