import React, { useEffect, useState } from "react";

import {
  Button,
  TableCell,
  Tooltip,
  makeStyles,
  Grid,
} from "@material-ui/core";
import { MdCheckBox } from 'react-icons/md';

import {
  createAgenda,
  deleteAgenda,
  getAgendaByMeetingType,
  updateAgenda,
} from "apis/mrmagendapi";
import { useRecoilValue } from "recoil";
import { orgFormData } from "recoil/atom";
import useStyles from "../MRMKeyAgenda.style";
import { Col, Form, Input, Row, Table, Drawer, Select } from "antd";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { useSnackbar } from "notistack";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { isValid, validateTitle } from "utils/validateInput";
import axios from "apis/axios.global";

type Props = {
  open: boolean;
  onClose: () => void;
  meetingType: any;
  selectedData: any;
};
const drawerWidth = 800;

const useStylesClass = makeStyles((theme) => ({
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(14),
    color: "#003566",
  },
  asterisk: {
    color: "red",
    verticalAlign: "end",
  },
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
    },
  },

  label: {
    verticalAlign: "middle",
  },
  drawerPaper: {
    width: drawerWidth,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      boxSizing: "border-box",
    },
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  tableContainer: {
    paddingLeft: "10px",
    paddingRight: "10px",
    marginTop: "1%",
    maxHeight: "calc(60vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    // overflowX: "hidden",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      // color: ({ iconColor }) => iconColor,
    },
    "& span.ant-tag": {
      display: "flex",
      width: "89px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      borderBottom: "black",
      padding: "4px 8px !important",
    },
    // '& .ant-table-wrapper .ant-table-container': {
    //     maxHeight: '420px', // Adjust the max-height value as needed
    //     overflowY: 'auto',
    //     overflowX: 'hidden',
    // },
    "& .ant-table-body": {
      // maxHeight: '150px', // Adjust the max-height value as needed
      // overflowY: 'auto',
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& tr.ant-table-row": {
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
  },
}));

function MrmAgendaCreate({ open, onClose, meetingType, selectedData }: Props) {
  const [formDataAgendaData, setFormDataAgendaData] = useState<any>([]);

  const [formDataAgenda, setFormDataAgenda] = useState<any>([
    {
      meetingType: "",
      name: "",
      owner: [],
      organizationId: "",
    },
  ]);
  const [textValue, setTextValue] = useState<any | null>("");
  const [owners, setOwners] = useState<any>([]);

  const [textValueEdit, setTextValueEdit] = useState<any>();
  const [ownersEdit, setOwnersEdit] = useState<any>();

  const [isEditStatus, setEditStatus] = useState(false);
  const [isEditId, setIsEditId] = useState<any>();
  const [isAddAgenda, setIsAddAgenda] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [userOptions, setUserOptions] = useState<any>([]);

  const classes = useStyles();
  const classStylse = useStylesClass();
  const { Option } = Select;

  const orgData = useRecoilValue(orgFormData);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  useEffect(() => {
    getAgendaDataMeetingById(selectedData);
    getUserOptions();
  }, [selectedData]);
  // console.log("user", userOptions);
  const getAgendaDataMeetingById = (meetingType: any) => {
    getAgendaByMeetingType(meetingType?._id).then((response: any) => {
      setFormDataAgendaData(response?.data?.result);
    });
  };
  // console.log("selectedData", selectedData);
  const getUserOptions = async () => {
    try {
      if (
        selectedData.location.length > 0 &&
        !selectedData.location.includes("All")
      ) {
        let res;
        // console.log("addkeyagenda", addKeyAgenda, buttonStatus);
        const ids: string[] =
          selectedData.location.length > 0
            ? selectedData.location
            : userDetail?.location?.id;
        // console.log("ids", ids);
        res = await axios.get(
          `/api/mrm/getUsersForLocations?orgId=${userDetail.organizationId}&location=${ids}`
        );

        // console.log("Response from users", res);

        const users = res.data;

        if (users && users.length > 0) {
          const ops = users.map((obj: any) => ({
            id: obj.id,
            name: obj.username,
            avatar: obj.avatar,
            email: obj.email,
            username: obj?.username,
            value: obj.id,
            label: obj.email,
            fullname: `${obj.firstname} ${obj.lastname}`,
          }));
          setUserOptions(ops);
        } else {
          setUserOptions([]);
        }
      } else {
        const res = await axios.get(
          `/api/riskregister/users/${userDetail?.organizationId}`
        );
        const users = res.data;

        if (users && users.length > 0) {
          const ops = users.map((obj: any) => ({
            id: obj.id,
            name: obj.username,
            avatar: obj.avatar,
            email: obj.email,
            username: obj.username,
            value: obj.id,
            label: obj.email,
            fullname: `${obj.firstname} ${obj.lastname}`,
          }));
          setUserOptions(ops);
        } else {
          setUserOptions([]);
        }
      }
    } catch (err) {
      console.error("Error fetching user options:", err);
      // Optionally handle the error (e.g., set an error state, show a message, etc.)
    }
  };

  const addAgenda = () => {
    if (formDataAgendaData?.length === 0) {
      const FormValues = {
        name: textValue,
        owner: owners,
        organizationId: organizationId,
        meetingType: selectedData._id,
      };

      if (FormValues?.name) {
        setFormDataAgendaData([...formDataAgendaData, FormValues]);
        if (FormValues?.name) {
          const isValidTitle = isValid(textValue);
          if (!isValidTitle.isValid) {
            enqueueSnackbar(
              `enter valid agenda name,${isValidTitle.errorMessage} `,
              { variant: "error" }
            );
            return;
          }
          createAgenda(FormValues).then((response: any) => {
            setTextValue("");
            setIsAddAgenda(false);
            setOwners([]);
            if (response.status === 200 || response.status === 201) {
              enqueueSnackbar(`Agenda Added successfully!`, {
                variant: "success",
              });
            }
          });
        }
      } else {
        enqueueSnackbar(`Enter Agenda name`, { variant: "error" });
      }
    } else {
      const FormValuesTy = {
        name: textValue,
        owner: owners,
        organizationId: organizationId,
        meetingType: selectedData._id,
      };
      if (FormValuesTy?.name) {
        const isValidTitle = isValid(FormValuesTy?.name);
        if (!isValidTitle.isValid) {
          enqueueSnackbar(
            `enter valid agenda name,${isValidTitle.errorMessage} `,
            { variant: "error" }
          );
          return;
        }
        setFormDataAgendaData([...formDataAgendaData, FormValuesTy]);

        createAgenda(FormValuesTy).then((response: any) => {
          setTextValue("");
          setOwners([]);
          setIsAddAgenda(false);
          if (response.status === 200 || response.status === 201) {
            enqueueSnackbar(`Agenda Added successfully!`, {
              variant: "success",
            });
          }
        });
      } else {
        enqueueSnackbar(`Enter Agenda name`, { variant: "error" });
      }
    }
  };

  const handleValuesEdit = (rowIndex: any) => {
    setEditStatus(true);
    setIsEditId(rowIndex);
    setTextValueEdit(formDataAgendaData[rowIndex].name);
    setOwnersEdit(formDataAgendaData[rowIndex].owner);
  };
  const handleUpdateValues = (row: any, rowIndex: any) => {
    // console.log("ownerEdit in update", ownersEdit);
    const FormValues = {
      name: textValueEdit,
      owner: ownersEdit,
    };

    const objectIndexToUpdate = rowIndex;
    if (
      objectIndexToUpdate >= 0 &&
      objectIndexToUpdate < formDataAgendaData.length
    ) {
      const updatedObject = {
        ...formDataAgendaData[objectIndexToUpdate],
        name: textValueEdit,
        owner: ownersEdit,
      };
      setFormDataAgendaData([
        ...formDataAgendaData.slice(0, objectIndexToUpdate),
        updatedObject,
        ...formDataAgendaData.slice(objectIndexToUpdate + 1),
      ]);
    }
    if (FormValues.name) {
      const isValidTitle = isValid(FormValues?.name);
      if (!isValidTitle.isValid) {
        enqueueSnackbar(
          `enter valid agenda name,${isValidTitle.errorMessage} `,
          { variant: "error" }
        );
        return;
      }
      updateAgenda(row._id, FormValues).then((response: any) => {
        setEditStatus(false);
        setTextValueEdit("");
        setOwnersEdit([]);
        if (response.status === 200 || response.status === 201) {
          enqueueSnackbar(`Data Added successfully!`, {
            variant: "success",
          });
        }
      });
    } else {
      enqueueSnackbar(`Add Agenda Name`, { variant: "error" });
    }
  };
  const handleDeleteRows = (row: any, rowIndex: any) => {
    deleteAgenda(row._id).then((response: any) => {
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(`Deleted Agenda Successfully!`, {
          variant: "success",
        });
      } else {
        enqueueSnackbar(`errrr!`, {
          variant: "error",
        });
      }
    });
    const deleteAgendData = formDataAgendaData.filter(
      (ele: any, index: any) => index !== rowIndex
    );
    setFormDataAgendaData(deleteAgendData);
  };

  const TableRowData = [
    {
      title: "Agenda",
      dataIndex: "Agenda",
      width: 250,
      render: (_: any, data: any, index: any) => {
        return (
          <div>
            {isEditStatus && isEditId === index ? (
              <Input
                className={classes.editField}
                style={{ height: "30px", width: "100%" }}
                placeholder="Enter Agenda"
                value={textValueEdit}
                onChange={(e: any) => {
                  setTextValueEdit(e.target.value);
                }}
              />
            ) : (
              <div className={classes.inputButton}>{data.name}</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Agenda Owner(s)",
      dataIndex: "owner",
      width: 250,
      render: (_: any, data: any, index: any) => {
        // setOwnersEdit(data?.owner);
        // console.log("owners edit", ownersEdit);
        return (
          <div>
            {isEditStatus && isEditId === index ? (
              <Select
                mode="multiple"
                placeholder="Select Owners"
                style={{ width: "100%", fontSize: "12px" }}
                options={userOptions}
                value={ownersEdit}
                onChange={(selectedValues: any) => {
                  const selectedUsers = selectedValues
                    .map((userId: any) =>
                      userOptions.find((user: any) => user.value === userId)
                    )
                    .filter(Boolean);
                  const newOwners = [
                    ...selectedUsers.filter(
                      (user: any) =>
                        !ownersEdit?.some(
                          (existingUser: any) =>
                            existingUser.value === user.value
                        ) // Add users that are selected but not already in the list
                    ),
                    ...ownersEdit.filter((existingUser: any) =>
                      selectedValues.includes(existingUser.value)
                    ),
                  ];

                  setOwnersEdit(newOwners);
                }}
                filterOption={(input: any, option: any) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                // disabled={readStatus}
                size="large"
                dropdownStyle={{ maxHeight: 200 }}
              />
            ) : (
              <Select
                mode="multiple"
                placeholder="Select Owners"
                style={{ width: "100%", fontSize: "12px" }}
                options={userOptions}
                value={data?.owner}
                disabled={true}
                onChange={(selectedValues: any) => {
                  const selectedUsers = selectedValues
                    .map((userId: any) =>
                      userOptions.find((user: any) => user.value === userId)
                    )
                    .filter(Boolean);

                  // setOwners([...data.owner, selectedUsers]);
                  // setOwnersEdit([...data.owner, selectedUsers]);
                  // handlechangeOwner(selectedUsers, i);
                }}
                filterOption={(input: any, option: any) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                // disabled={readStatus}
                size="large"
                dropdownStyle={{ maxHeight: 200 }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "AgendaAction",
      width: 40,
      render: (_: any, data: any, index: any) => {
        return (
          <div
            style={{
              padding: "0px !important",
              display: "flex",
              flexDirection: "row",
              gap: "15px",
            }}
          >
            <div style={{ padding: "0px !important" }}>
              {isEditStatus && isEditId === index ? (
                <MdCheckBox
                  style={{ fontSize: "18px" }}
                  onClick={(e) => {
                    handleUpdateValues(data, index);
                  }}
                />
              ) : (
                <CustomEditIcon
                  style={{ fontSize: "15px !important", height: "17px" }}
                  onClick={() => {
                    handleValuesEdit(index);
                  }}
                />
              )}
            </div>
            <div style={{ padding: "0px !important" }}>
              {isEditStatus && isEditId === index ? (
                ""
              ) : (
                <CustomDeleteICon
                  style={{ fontSize: "15px !important", height: "17px" }}
                  onClick={() => {
                    handleDeleteRows(data, index);
                  }}
                />
              )}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={800}
      title="Add Agenda"
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      headerStyle={{ backgroundColor: "#E8F3F9", color: "black" }}
      maskClosable={false}
      //anchor="right"
      // classes={{
      //   paper: classStylse.drawerPaper,
      // }}
    >
      <div>
        {/* <div
          style={{
            height: "50px",
            backgroundColor: "#e8f3f9",
            display: "flex",
            justifyContent: "flex-start",
            gap: "10px",
            paddingLeft: "10px",
            alignItems: "center",
          }}
        >
          <div style={{ border: "none" }}>
            <CloseIcon onClick={onClose} style={{ cursor: "pointer" }} />
          </div>
          <div style={{ fontSize: "20px", border: "none" }}>Add Agenda</div>
        </div> */}
        <div>
          <div>
            <div className={classes.ulContainer}>
              <TableCell
                style={{
                  border: "none",
                  fontSize: "18px",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <span> Meeting Type:</span>
                <span style={{ color: "#1677ff" }}>{selectedData?.name}</span>
              </TableCell>
            </div>
            <div
              style={{ borderBottom: "1px solid #F4F6F6", paddingTop: "10px" }}
            >
              {formDataAgenda &&
                formDataAgenda?.map((row: any, rowIndex: any) => (
                  <div>
                    <Row
                      gutter={[18, 18]}
                      style={{
                        display: "flex",
                        alignItems: "center", // Ensures vertical alignment
                      }}
                    >
                      <Col span={10}>
                        <Grid
                          item
                          sm={12}
                          md={5}
                          className={classStylse.formTextPadding}
                          style={{ display: "flex", alignItems: "center" }} // Align label vertically
                        >
                          <strong>
                            <span className={classStylse.asterisk}>*</span>{" "}
                            <span className={classStylse.label}>
                              Enter Agenda:{" "}
                            </span>
                          </strong>
                        </Grid>
                        <Form.Item
                          rules={[{ validator: validateTitle }]}
                          style={{ marginBottom: 0 }} // Remove extra margin below Form.Item
                        >
                          <Input
                            style={{
                              height: "37px", // Ensure consistent height
                            }}
                            value={textValue}
                            placeholder="Enter Agenda"
                            onChange={(e) => {
                              setTextValue(e.target.value);
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Grid
                          item
                          sm={12}
                          md={5}
                          style={{ display: "flex", alignItems: "center" }} // Align label vertically
                        >
                          <strong>
                            <span
                              className={classStylse.label}
                              style={{ color: "#003536" }}
                            >
                              Agenda Owner:{" "}
                            </span>
                          </strong>
                        </Grid>
                        <Select
                          mode="multiple"
                          showSearch
                          placeholder="Select Owners"
                          style={{
                            width: "100%",
                            fontSize: "12px",
                            height: "37px", // Ensure consistent height
                          }}
                          value={owners}
                          options={userOptions || []}
                          onChange={(selectedValues) => {
                            const selectedUsers = selectedValues
                              .map((userId: any) =>
                                userOptions.find(
                                  (user: any) => user.value === userId
                                )
                              )
                              .filter(Boolean);
                            setOwners(selectedUsers);
                          }}
                          filterOption={(input: any, option: any) =>
                            option.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          size="large"
                          dropdownStyle={{
                            maxHeight: "300px",
                            zIndex: 1050,
                            overflow: "auto",
                          }}
                        />
                      </Col>
                      <Col span={3} style={{ paddingTop: "25px" }}>
                        <Tooltip title="Click to add agenda">
                          <Button
                            style={{
                              backgroundColor: "#1677ff",
                              color: "white",
                              height: "37px", // Ensure button height matches input/select height
                            }}
                            onClick={() => {
                              addAgenda();
                            }}
                          >
                            Add
                          </Button>
                        </Tooltip>
                      </Col>
                    </Row>
                  </div>
                ))}
            </div>

            <div
              className={classStylse.tableContainer}
              style={{ position: "relative", zIndex: 1 }}
            >
              <Table
                className={classes.documentTable}
                rowClassName={() => "editable-row"}
                bordered
                dataSource={formDataAgendaData}
                columns={TableRowData}
                pagination={false}
              />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

MrmAgendaCreate.propTypes = {};

export default MrmAgendaCreate;
