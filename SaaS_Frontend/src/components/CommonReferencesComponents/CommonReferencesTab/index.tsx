//react,recoil
import React, { useEffect, useState, useContext, useRef } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { referencesData } from "recoil/atom";
import getAppUrl from "../../../utils/getAppUrl";
import { FaSearch } from "react-icons/fa";
//material-ui
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormLabel,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { MdLibraryAddCheck, MdSend, MdDelete, MdHelp } from "react-icons/md";
//logo,icons
import CloseIconImageSvg from "assets/documentControl/Close.svg";
//antd
import { Modal, Table, Form, Input, Popconfirm, Popover } from "antd";
import type { FormInstance } from "antd/es/form";

//components
import ReferencesResultPage from "pages/ReferencesResultPage";

//styles
import useStyles from "./style";

//css
import "./temp.css";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import { useSnackbar } from "notistack";
// import { matches } from "lodash";

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

type Props = {
  drawer?: any;
  drawerDataState?: any;
  clauseSearch?: boolean;
  activeTabKey?: any;
  disableFormFields?: boolean;
  refForcipForm24?: any;
  capaForAi?: any;
  tableData?: any;
  setTableData?: any;
  auditScheduleData?: any;
  setAuditScheduleData?: any;
  onlyClauseRef?: any;
  clause_refs?: any;
  onlySopRef?: boolean;
  sop_refs?: any;
  onlyHiraRef?: boolean;
  hira_refs?: any;
  onlyCapaRef?: boolean;
  capa_refs?: any;
  systems?: any;
};

function arrayToQueryString(key: any, array: any) {
  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}

const CommonReferencesTab = ({
  drawer,
  drawerDataState,
  clauseSearch,
  activeTabKey,
  disableFormFields,
  refForcipForm24,
  capaForAi,
  tableData,
  auditScheduleData,
  setAuditScheduleData,
  setTableData,
  onlyClauseRef,
  clause_refs,
  onlySopRef,
  sop_refs,
  onlyHiraRef,
  hira_refs,
  onlyCapaRef,
  capa_refs,
  systems,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const [searchValue, setSearchValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState<any>([]);
  const [selectedData, setSelectedData] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);

  const userDetails = getSessionStorage();
  const { enqueueSnackbar } = useSnackbar();
  const [refData, setRefData] = useRecoilState(referencesData);
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };
  useEffect(() => {
    if (onlyClauseRef) {
      setSelectedData(auditScheduleData?.clause_refs);
    }
    if (onlySopRef) {
      setSelectedData(auditScheduleData?.sop_refs);
    }
    if (onlyHiraRef) {
      setSelectedData(auditScheduleData?.hira_refs);
    }
    if (onlyCapaRef) {
      setSelectedData(auditScheduleData?.capa_refs);
    }
  }, []);

  useEffect(() => {
    if (auditScheduleData) {
      if (onlyClauseRef) {
        setAuditScheduleData({
          ...auditScheduleData,
          clause_refs: selectedData,
        });
      }
      if (onlySopRef) {
        setAuditScheduleData({
          ...auditScheduleData,
          sop_refs: selectedData,
        });
      }
      if (onlyHiraRef) {
        setAuditScheduleData({
          ...auditScheduleData,
          hira_refs: selectedData,
        });
      }
      if (onlyCapaRef) {
        setAuditScheduleData({
          ...auditScheduleData,
          capa_refs: selectedData,
        });
      }
      if (capaForAi) {
        setRefData(tableData);
      } else {
        setRefData(selectedData);
      }
    }
  }, [selectedData, tableData]);

  useEffect(() => {
    getLogo();
    getLocationList();
    getAllDepartmentsByOrgAndUnitFilter();

    // console.log("in common ref tab useEffect[drawer?.mode]", drawer);
    if (!!drawer && drawer?.mode === "edit") {
      getRefsForDocument();
    }
    if (!!drawerDataState && !drawer && drawerDataState?.formMode === "edit") {
      getRefsForDocument();
    }
  }, [drawer?.mode]);
  // console.log("inside commonreferences tab", drawer);

  useEffect(() => {
    if (selected && selected.length > 0) {
      // console.log("check selected in useEffect ", selected);
      let filteredData = selected.reduce((unique: any, item: any) => {
        return unique.findIndex(
          (uniqueItem: any) =>
            uniqueItem.refId === item.refId && uniqueItem.type === item.type
        ) < 0
          ? [...unique, item]
          : unique;
      }, []);
      // console.log("check filteredData", filteredData);
      if (capaForAi) {
        setTableData(filteredData);
      } else {
        setSelectedData(filteredData);
      }
    }
  }, [selected]);

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
      if (!!locationIdArray?.length) {
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
  const getRefsForDocument = async () => {
    try {
      if (onlyClauseRef) {
        if (clause_refs && clause_refs.length > 0) {
          if (capaForAi) {
            setTableData(clause_refs);
          } else {
            setSelectedData(clause_refs);
          }
        } else {
          setSelectedData([]);
          setTableData([]);
        }
      } else if (onlySopRef) {
        if (sop_refs && sop_refs.length > 0) {
          if (capaForAi) {
            setTableData(sop_refs);
          } else {
            setSelectedData(sop_refs);
          }
        } else {
          setSelectedData([]);
          setTableData([]);
        }
      } else if (onlyHiraRef) {
        if (hira_refs && hira_refs.length > 0) {
          if (capaForAi) {
            setTableData(hira_refs);
          } else {
            setSelectedData(hira_refs);
          }
        } else {
          setSelectedData([]);
          setTableData([]);
        }
      } else if (onlyCapaRef) {
        if (capa_refs && capa_refs.length > 0) {
          if (capaForAi) {
            setTableData(capa_refs);
          } else {
            setSelectedData(capa_refs);
          }
        } else {
          setSelectedData([]);
          setTableData([]);
        }
      } else {
        const docId = drawer?.data?.id || drawerDataState?.id;
        const response = await axios.get(`api/refs/${docId}`);
        if (response.status === 200 || response.status === 201) {
          if (response?.data || response?.data?.length > 0) {
            if (capaForAi) {
              setTableData(response.data);
            } else {
              setSelectedData(response.data);
            }
          } else {
            setSelectedData([]);
            setTableData([]);
          }
        }
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
    if (capaForAi) {
      const newData = tableData.filter((item: any) => item.refId !== refId);
      setTableData(newData);
    } else {
      const newData = selectedData.filter((item: any) => item.refId !== refId);
      setSelectedData(newData);
    }
  };

  const handleSave = (row: any) => {
    if (capaForAi) {
      const newData = [...tableData];
      const index = newData.findIndex((item) => row.id === item.id);
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
      setTableData(newData);
    } else {
      const newData = [...selectedData];
      const index = newData.findIndex((item) => row.id === item.id);
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
      setSelectedData(newData);
    }
  };

  const handleFlag = async (refId: any) => {
    try {
      const capaId = drawer?.data?.id || drawerDataState?.id;
      let refsToFlag = tableData.filter((item: any) => item.refId === refId);
      refsToFlag = refsToFlag.map((item: any) => ({
        ...item,
        refToModule: "CAPA",
        refTo: capaId,
        isFlagged: true,
      }));
      console.log("CHECKCAPA refsToFlag", refsToFlag);
      const selectedRef = refsToFlag[0];
      const res = await axios.put(`api/refs/flag`, selectedRef);
      if (res.status === 200 || res.status === 201) {
        getRefsForDocument();
        enqueueSnackbar("Flagged Successfully", { variant: "success" });
      } else {
        enqueueSnackbar("Flagging Failed", { variant: "error" });
      }
    } catch (error) {
      console.log("error in flagging", error);
    }
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
      render: (_: any, record: any) => {
        if (capaForAi && tableData.length >= 1) {
          return (
            <>
              <Popconfirm
                title="Sure to delete?"
                onConfirm={() => handleDelete(record?.refId)}
              >
                <Tooltip title="Delete">
                  <MdDelete style={{ fill: "#003566" }} />
                </Tooltip>
              </Popconfirm>
              {drawer?.mode === "edit" && !record?.isFlagged && (
                <Popconfirm
                  title="Add to `Due For Revision`?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => handleFlag(record?.refId)}
                >
                  <Tooltip title="Due For Revision">
                    <MdLibraryAddCheck style={{ fill: "#003566" }} />
                  </Tooltip>
                </Popconfirm>
              )}
            </>
          );
        } else if (selectedData.length >= 1) {
          return (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record?.refId)}
            >
              <Tooltip title="Delete">
                <MdDelete style={{ fill: "#003566" }} />
              </Tooltip>
            </Popconfirm>
          );
        } else {
          return null;
        }
      },
    },
  ];

  const clausereferencesColumns = [
    {
      title: "Clause Number",
      dataIndex: "number",
      key: "number",
      render: (_: any, record: any) => record.number,
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
      title: "systemName",
      dataIndex: "systemName",
      key: "systemName",
      editable: true,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) => {
        if (capaForAi && tableData.length >= 1) {
          return (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record?.refId)}
            >
              <Tooltip title="Delete">
                <MdDelete style={{ fill: "#003566" }} />
              </Tooltip>
            </Popconfirm>
          );
        } else if (selectedData.length >= 1) {
          return (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record?.refId)}
            >
              <Tooltip title="Delete">
                <MdDelete style={{ fill: "#003566" }} />
              </Tooltip>
            </Popconfirm>
          );
        } else {
          return null;
        }
      },
    },
  ];

  const sopreferencesColumns = [
    {
      title: "Document Number",
      dataIndex: "number",
      key: "number",
      render: (_: any, record: any) => record.documentNumbering,
    },
    {
      title: "Document Title",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => record?.documentName,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) => {
        if (capaForAi && tableData.length >= 1) {
          return (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record?.refId)}
            >
              <Tooltip title="Delete">
                <MdDelete style={{ fill: "#003566" }} />
              </Tooltip>
            </Popconfirm>
          );
        } else if (selectedData.length >= 1) {
          return (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record?.refId)}
            >
              <Tooltip title="Delete">
                <MdDelete style={{ fill: "#003566" }} />
              </Tooltip>
            </Popconfirm>
          );
        } else {
          return null;
        }
      },
    },
  ];

  const hirareferencesColumns = [
    {
      title: "HIRA",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => record.jobTitle,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) => {
        if (capaForAi && tableData.length >= 1) {
          return (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record?.refId)}
            >
              <Tooltip title="Delete">
                <MdDelete style={{ fill: "#003566" }} />
              </Tooltip>
            </Popconfirm>
          );
        } else if (selectedData.length >= 1) {
          return (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record?.refId)}
            >
              <Tooltip title="Delete">
                <MdDelete style={{ fill: "#003566" }} />
              </Tooltip>
            </Popconfirm>
          );
        } else {
          return null;
        }
      },
    },
  ];

  const capareferencesColumns = [
    {
      title: "CAPA",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => record.title,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) => {
        if (capaForAi && tableData.length >= 1) {
          return (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record?.refId)}
            >
              <Tooltip title="Delete">
                <MdDelete style={{ fill: "#003566" }} />
              </Tooltip>
            </Popconfirm>
          );
        } else if (selectedData.length >= 1) {
          return (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record?.refId)}
            >
              <Tooltip title="Delete">
                <MdDelete style={{ fill: "#003566" }} />
              </Tooltip>
            </Popconfirm>
          );
        } else {
          return null;
        }
      },
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
      {clauseSearch ? (
        <>
          <ul style={{ margin: 0, paddingLeft: "20px", width: "400px" }}>
            <li>
              <b>Clauses </b>(By Number, Name, and Description)
            </li>
          </ul>
          <br />
          <li>
            <b>By Default User's Unit Filter is Applied</b>
          </li>
        </>
      ) : onlyClauseRef ? (
        <>
          <ul style={{ margin: 0, paddingLeft: "20px", width: "400px" }}>
            <li>
              <b>Clauses </b>(By Number, Name, and Description)
            </li>
          </ul>
          <br />
          <li>
            <b>By Default User's Unit Filter is Applied</b>
          </li>
        </>
      ) : onlySopRef ? (
        <>
          <ul style={{ margin: 0, paddingLeft: "20px", width: "400px" }}>
            <li>
              <b>Documents</b> (By Doc Name, Doc Number, Tags, Doc Type,
              Department, State )
            </li>
          </ul>
          <br />
          <li>
            <b>By Default User's Unit Filter is Applied</b>
          </li>
        </>
      ) : onlyHiraRef ? (
        <>
          <ul style={{ margin: 0, paddingLeft: "20px", width: "400px" }}>
            <li>
              <b>HIRA</b> (By Job Title)
            </li>
          </ul>
          <br />
          <li>
            <b>By Default User's Unit Filter is Applied</b>
          </li>
        </>
      ) : onlyCapaRef ? (
        <>
          <ul style={{ margin: 0, paddingLeft: "20px", width: "400px" }}>
            <li>
              <b>CAPA</b> (By Title and Description)
            </li>
          </ul>
          <br />
          <li>
            <b>By Default User's Unit Filter is Applied</b>
          </li>
        </>
      ) : (
        <>
          <ul style={{ margin: 0, paddingLeft: "20px", width: "400px" }}>
            <li>
              <b>Documents</b> (By Doc Name, Doc Number, Tags, Doc Type,
              Department, State )
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
        </>
      )}
    </div>
  );
  return (
    <div className={classes.modalWrapper}>
      <br />
      {matches ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <TextField
            style={{ width: "245px" }}
            id="standard-basic"
            placeholder={
              onlyClauseRef
                ? "Clause Search"
                : onlySopRef
                ? "Document Search"
                : onlyHiraRef
                ? "HIRA Search"
                : onlyCapaRef
                ? "CAPA Search"
                : "Global Search"
            }
            value={searchValue}
            onChange={(e) => setSearchValue(e.currentTarget.value)}
            onKeyDown={handlePressEnter}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch style={{ fill: "black" }} />
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
                  <InputAdornment position="end">
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
            placement="bottomRight"
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
      ) : (
        <div className={classes.searchContainer}>
          <TextField
            placeholder={
              onlyClauseRef
                ? "Clause Search"
                : onlySopRef
                ? "Document Search"
                : onlyHiraRef
                ? "HIRA Search"
                : onlyCapaRef
                ? "CAPA Search"
                : "Global Search"
            }
            variant="outlined"
            size="small"
            className={classes.input}
            value={searchValue}
            onChange={(e) => setSearchValue(e.currentTarget.value)}
            onKeyDown={handlePressEnter}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton className={classes.iconButton}>
                    <MdSend
                      style={{ fill: "black", cursor: "pointer" }}
                      onClick={() => handleClickSearch()}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
      )}
      <br /> <br />
      {((selectedData && selectedData.length > 0) ||
        (tableData && tableData?.length > 0)) && (
        <div data-testid="custom-table" className={classes.tableContainer}>
          {clauseSearch ? (
            <>
              {(selectedData || tableData) && (
                <>
                  {matches ? (
                    <Table
                      columns={clausereferencesColumns}
                      dataSource={
                        capaForAi
                          ? tableData.filter(
                              (item: any) => item.type === "Clause"
                            )
                          : selectedData.filter(
                              (item: any) => item.type === "Clause"
                            )
                      }
                      pagination={false}
                      rowKey="id"
                      components={components}
                      rowClassName={() => "editable-row"}
                    />
                  ) : (
                    <div style={{ display: "grid", gap: "10px" }}>
                      {capaForAi
                        ? tableData.filter(
                            (item: any) => item.type === "Clause"
                          )
                        : selectedData
                            .filter((item: any) => item.type === "Clause")
                            ?.map((data: any) => {
                              return (
                                <Card className={classes.card}>
                                  <Box className={classes.cardHeader}>
                                    <Typography className={classes.title}>
                                      {data?.name}
                                    </Typography>
                                    <Popconfirm
                                      title="Sure to delete?"
                                      onConfirm={() =>
                                        handleDelete(data?.refId)
                                      }
                                    >
                                      <IconButton
                                        className={classes.deleteIcon}
                                        size="small"
                                      >
                                        <MdDelete />
                                      </IconButton>
                                    </Popconfirm>
                                  </Box>

                                  {/* Content */}
                                  <CardContent className={classes.content}>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        Clause Number:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.number}
                                      </Typography>
                                    </div>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        Description:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.description}
                                      </Typography>
                                    </div>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        System:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.systemName}
                                      </Typography>
                                    </div>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        Units Applicable:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.applicable_locations
                                          ?.map((item: any) => item.id)
                                          .join(", ")}
                                      </Typography>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                    </div>
                  )}
                </>
              )}
            </>
          ) : onlyClauseRef ? (
            <>
              {(selectedData || tableData) && (
                <>
                  {matches ? (
                    <Table
                      columns={clausereferencesColumns}
                      dataSource={
                        capaForAi
                          ? tableData.filter(
                              (item: any) => item.type === "Clause"
                            )
                          : selectedData.filter(
                              (item: any) => item.type === "Clause"
                            )
                      }
                      pagination={false}
                      rowKey="id"
                      components={components}
                      rowClassName={() => "editable-row"}
                    />
                  ) : (
                    <div style={{ display: "grid", gap: "10px" }}>
                      {capaForAi
                        ? tableData.filter(
                            (item: any) => item.type === "Clause"
                          )
                        : selectedData
                            .filter((item: any) => item.type === "Clause")
                            ?.map((data: any) => {
                              return (
                                <Card className={classes.card}>
                                  <Box className={classes.cardHeader}>
                                    <Typography className={classes.title}>
                                      {data?.name}
                                    </Typography>
                                    <Popconfirm
                                      title="Sure to delete?"
                                      onConfirm={() =>
                                        handleDelete(data?.refId)
                                      }
                                    >
                                      <IconButton
                                        className={classes.deleteIcon}
                                        size="small"
                                      >
                                        <MdDelete />
                                      </IconButton>
                                    </Popconfirm>
                                  </Box>
                                  {/* Content */}
                                  <CardContent className={classes.content}>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        Clause Number:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.number}
                                      </Typography>
                                    </div>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        Description:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.description}
                                      </Typography>
                                    </div>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        System:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.systemName}
                                      </Typography>
                                    </div>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        Units Applicable:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.applicable_locations
                                          ?.map((item: any) => item.id)
                                          .join(", ")}
                                      </Typography>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                    </div>
                  )}
                </>
              )}
            </>
          ) : onlySopRef ? (
            <>
              {(selectedData || tableData) && (
                <>
                  {matches ? (
                    <Table
                      columns={sopreferencesColumns}
                      dataSource={
                        capaForAi
                          ? tableData.filter(
                              (item: any) => item.type === "Document"
                            )
                          : selectedData.filter(
                              (item: any) => item.type === "Document"
                            )
                      }
                      pagination={false}
                      rowKey="id"
                      components={components}
                      rowClassName={() => "editable-row"}
                    />
                  ) : (
                    <div style={{ display: "grid", gap: "10px" }}>
                      {capaForAi
                        ? tableData.filter(
                            (item: any) => item.type === "Document"
                          )
                        : selectedData
                            .filter((item: any) => item.type === "Document")
                            ?.map((data: any) => {
                              return (
                                <Card className={classes.card}>
                                  <Box className={classes.cardHeader}>
                                    <Typography className={classes.title}>
                                      {data?.name}
                                    </Typography>
                                    <Popconfirm
                                      title="Sure to delete?"
                                      onConfirm={() =>
                                        handleDelete(data?.refId)
                                      }
                                    >
                                      <IconButton
                                        className={classes.deleteIcon}
                                        size="small"
                                      >
                                        <MdDelete />
                                      </IconButton>
                                    </Popconfirm>
                                  </Box>
                                  {/* Content */}
                                  <CardContent className={classes.content}>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        Document Number:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.documentNumbering}
                                      </Typography>
                                    </div>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        Document Type:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.documentType}
                                      </Typography>
                                    </div>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        Issue - Version :
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data.issueNumber} - {data.version}
                                      </Typography>
                                    </div>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        Unit:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.location}
                                      </Typography>
                                    </div>
                                    <div className={classes.row}>
                                      <Typography className={classes.label}>
                                        Department:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data?.department}
                                      </Typography>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                    </div>
                  )}
                </>
              )}
            </>
          ) : onlyHiraRef ? (
            <>
              {(selectedData || tableData) && (
                <>
                  {matches ? (
                    <Table
                      columns={hirareferencesColumns}
                      dataSource={
                        capaForAi
                          ? tableData.filter(
                              (item: any) => item.type === "HIRA"
                            )
                          : selectedData.filter(
                              (item: any) => item.type === "HIRA"
                            )
                      }
                      pagination={false}
                      rowKey="id"
                      components={components}
                      rowClassName={() => "editable-row"}
                    />
                  ) : (
                    <>
                      <div style={{ display: "grid", gap: "10px" }}>
                        {capaForAi
                          ? tableData.filter(
                              (item: any) => item.type === "HIRA"
                            )
                          : selectedData
                              .filter((item: any) => item.type === "HIRA")
                              ?.map((data: any) => {
                                return (
                                  <Card className={classes.card}>
                                    <Box className={classes.cardHeader}>
                                      <Typography className={classes.title}>
                                        {data?.jobTitle}
                                      </Typography>
                                      <Popconfirm
                                        title="Sure to delete?"
                                        onConfirm={() =>
                                          handleDelete(data?.refId)
                                        }
                                      >
                                        <IconButton
                                          className={classes.deleteIcon}
                                          size="small"
                                        >
                                          <MdDelete />
                                        </IconButton>
                                      </Popconfirm>
                                    </Box>
                                    {/* Content */}
                                    <CardContent className={classes.content}>
                                      <div className={classes.row}>
                                        <Typography className={classes.label}>
                                          Unit:
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          style={{ fontSize: "14px" }}
                                        >
                                          {data?.locationDetails?.locationName}
                                        </Typography>
                                      </div>
                                      <div className={classes.row}>
                                        <Typography className={classes.label}>
                                          Department:
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          style={{ fontSize: "14px" }}
                                        >
                                          {data?.entityDetails?.entityName}
                                        </Typography>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          ) : onlyCapaRef ? (
            <>
              {(selectedData || tableData) && (
                <>
                  {matches ? (
                    <Table
                      columns={capareferencesColumns}
                      dataSource={
                        capaForAi
                          ? tableData.filter(
                              (item: any) => item.type === "CAPA"
                            )
                          : selectedData.filter(
                              (item: any) => item.type === "CAPA"
                            )
                      }
                      pagination={false}
                      rowKey="id"
                      components={components}
                      rowClassName={() => "editable-row"}
                    />
                  ) : (
                    <>
                      <div style={{ display: "grid", gap: "10px" }}>
                        {capaForAi
                          ? tableData.filter(
                              (item: any) => item.type === "CAPA"
                            )
                          : selectedData
                              .filter((item: any) => item.type === "CAPA")
                              ?.map((data: any) => {
                                return (
                                  <Card className={classes.card}>
                                    <Box className={classes.cardHeader}>
                                      <Typography className={classes.title}>
                                        {data?.title}
                                      </Typography>
                                      <Popconfirm
                                        title="Sure to delete?"
                                        onConfirm={() =>
                                          handleDelete(data?.refId)
                                        }
                                      >
                                        <IconButton
                                          className={classes.deleteIcon}
                                          size="small"
                                        >
                                          <MdDelete />
                                        </IconButton>
                                      </Popconfirm>
                                    </Box>
                                    {/* Content */}
                                    <CardContent className={classes.content}>
                                      <div className={classes.row}>
                                        <Typography className={classes.label}>
                                          Unit:
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          style={{ fontSize: "14px" }}
                                        >
                                          {data?.locationDetails?.locationName}
                                        </Typography>
                                      </div>
                                      <div className={classes.row}>
                                        <Typography className={classes.label}>
                                          Department:
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          style={{ fontSize: "14px" }}
                                        >
                                          {data?.entityDetails?.entityName}
                                        </Typography>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <Table
              columns={columns as any}
              dataSource={capaForAi ? tableData : selectedData}
              pagination={false}
              rowKey="id"
              components={components}
              rowClassName={() => "editable-row"}
            />
          )}
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
        style={{ top: 6, left: matches ? 10 : 0 }}
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
          selected={capaForAi ? tableData : selectedData}
          setSelected={setSelected}
          isModalVisible={isModalVisible}
          clauseSearch={clauseSearch}
          onlyClauseRef={onlyClauseRef}
          onlySopRef={onlySopRef}
          onlyHiraRef={onlyHiraRef}
          onlyCapaRef={onlyCapaRef}
          activeTabKey={activeTabKey}
          locationOptions={locationOptions}
          departmentOptions={departmentOptions}
          getAllDepartmentsByOrgAndUnitFilter={
            getAllDepartmentsByOrgAndUnitFilter
          }
          systems={systems}
        />
      </Modal>
    </div>
  );
};

export default CommonReferencesTab;
