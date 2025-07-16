import React, { useEffect, useState } from "react";
import { Button, Col, Form, Input, Table } from "antd";
import { useSnackbar } from "notistack";
import { Select, MenuItem } from "@material-ui/core";
import {
  TableRow,
  makeStyles,
  Grid,
} from "@material-ui/core";
import { MdCheckBox } from 'react-icons/md';

import { getAgendaForOwner } from "apis/mrmmeetingsApi";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import { expandMeetingAgendaData } from "recoil/atom";
import { useRecoilState } from "recoil";
import { validateTitle } from "utils/validateInput";

const useStyles = makeStyles((theme) => ({
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
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  tableContainer: {
    marginTop: "1%",
    maxHeight: "calc(60vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "scroll",
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
  disabledMultiSelect: {
    "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
      backgroundColor: "white !important",
      // border: "none",
    },
    "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
      color: "black",
      background: "white !important",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
}));
type Props = {
  formData?: any;
  setFormData?: any;
  data: any;
  ownerSourceFilter: any;
  valueById: any;
  readMode: any;
};
function MeetingEditingTabTwo({
  formData,
  setFormData,
  data,
  ownerSourceFilter,
  readMode,
}: Props) {
  const classes = useStyles();
  const [firstForm] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  const [text, setText] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [selectedOwner, setSelectedOwner] = useState([]);
  const [agendaValuesFind, setagendaValuesFind] = useState<any[]>([]);
  const [textEdit, setTextEdit] = useState("");
  const [selectedAgendaOwner, setSelectedAgendaOwner] = useState([]);
  const [selectedValueEdit, setSelectedValueEdit] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditIndex, setIsEditIndex] = useState<any | null>();
  const [form] = Form.useForm();
  const [access, setAccess] = useState<boolean>(false);
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [agendaInsert, setAgendaInsert] = useState([
    {
      agenda: "",
      decision: "",
      owner: [],
    },
  ]);
  const [addAgendaValues, setAddAgendaValues] = useRecoilState(
    expandMeetingAgendaData
  );
  // const [addAgendaValues, setAddAgendaValues] = useState<any[]>([]);
  useEffect(() => {
    setAddAgendaValues(data?.agenda);
    data.meetingSchedule?.organizer === userInfo.id
      ? setAccess(true)
      : setAccess(false);
  }, [data]);

  useEffect(() => {
    setFormData({ ...formData, agenda: addAgendaValues });
    getAgendaValues();
  }, [addAgendaValues, isEditIndex]);

  useEffect(() => {
    getAgendaValues();
  }, [ownerSourceFilter]);

  const uniqueId = generateUniqueId(22);
  const getAgendaValues = () => {
    try {
      getAgendaForOwner(data.meetingSchedule._id).then((response: any) => {
        setagendaValuesFind(response.data);
      });
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const addHandlerAgenda = () => {
    if (selectedValue === "") {
      enqueueSnackbar(`Please Select Agenda Values!`, {
        variant: "error",
      });
    } else if (text === "") {
      enqueueSnackbar(`Please Enter Agenda Decision!`, {
        variant: "error",
      });
    } else {
      const FormValues = {
        agenda: selectedValue,
        decision: text,
        owner: selectedOwner,
        id: uniqueId,
      };
      setAddAgendaValues([...addAgendaValues, FormValues]);
      form.setFieldsValue({ meetingAgenda: "", meetingDecision: "" });
      setSelectedValue("");
      setText("");
      setSelectedValueEdit("");
      setTextEdit("");
      setSelectedValue("");
      setText("");
      firstForm.setFieldsValue({});
      firstForm.resetFields();
    }
  };

  const deleteHandlerAgenda = (data: any) => {
    const deleteDatafromRow = addAgendaValues.filter(
      (item: any) => item.id !== data.id
    );
    setAddAgendaValues(deleteDatafromRow);
  };

  const editHandlerAgenda = (data: any) => {
    // console.log("edithandleragenda", data);
    setIsEditing(true);
    setIsEditIndex((prevIndex: any) => {
      const newIndex = data.id;
      // console.log("Setting new isEditIndex:", newIndex);
      return newIndex;
    });
    setSelectedAgendaOwner(data.owner);
    setSelectedValueEdit(data.agenda);
    setTextEdit(data.decision);
  };
  // console.log("isEditing", isEditing);
  const upDateHandlerAgenda = (data: any) => {
    // console.log("update", data);
    setIsEditing(false);
    const updateIndex = data.id;
    const updateArray = addAgendaValues.map((item: any) => {
      if (item.id === updateIndex) {
        return {
          ...item,
          agenda: selectedValueEdit,
          decision: textEdit,
        };
      }
      return item;
    });
    setAddAgendaValues(updateArray);
    setIsEditIndex("");
    setSelectedValueEdit("");
    setTextEdit("");
    setSelectedValue("");
    setText("");
    setSelectedAgendaOwner([]);
  };
  // console.log("setIsediting", isEditIndex);

  const tableRowData = [
    {
      title: "Agenda",
      dataIndex: "Agenda",
      width: 40,
      render: (_: any, data: any, index: number) => {
        return (
          <div style={{ width: "100px" }}>
            {isEditing && isEditIndex === data.id ? (
              <div>
                <Select
                  value={selectedValueEdit}
                  onChange={(e: any) => {
                    const selectedAgenda = e.target.value;
                    setSelectedValueEdit(selectedAgenda);

                    // Find the selected agenda details to get the owners
                    const selectedAgendaDetails = agendaValuesFind.find(
                      (agenda: any) => agenda.agenda === selectedAgenda
                    );

                    // Update the agenda and owner in addAgendaValues
                    const updatedData = addAgendaValues.map((item: any) => {
                      if (item.id === data.id) {
                        return {
                          ...item,
                          agenda: selectedAgenda,
                          owner: selectedAgendaDetails?.owner || [], // update the owner field
                        };
                      }
                      return item;
                    });

                    // Set the updated data to immediately reflect the changes
                    setAddAgendaValues(updatedData);
                  }}
                  style={{
                    width: "90px",
                    height: "40px",
                    fontSize: "13px",
                    padding: 0,
                    paddingRight: "0 !important",
                    paddingLeft: "0 !important",
                  }}
                >
                  {agendaValuesFind &&
                    agendaValuesFind.map((item: any) => (
                      <MenuItem
                        key={item.agenda}
                        value={item.agenda}
                        style={{
                          width: "90px",
                          fontSize: "13px",
                          padding: "3px",
                          paddingRight: "0 !important",
                          paddingLeft: "0 !important",
                        }}
                      >
                        {item.agenda}
                      </MenuItem>
                    ))}
                </Select>
              </div>
            ) : (
              <span>{data?.agenda}</span>
            )}
          </div>
        );
      },
    },

    {
      title: "Decision for which actions need to be taken",
      dataIndex: "Decision",
      width: 180,
      render: (_: any, data: any, index: number) => {
        return (
          <div style={{ width: "330px" }}>
            {isEditing && isEditIndex === data.id ? (
              <Input.TextArea
                value={textEdit}
                onChange={(e) => {
                  setTextEdit(e.target.value);
                }}
                style={{ width: "330px" }}
                placeholder="Type here..."
              />
            ) : (
              <span>{data?.decision}</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Owner",
      dataIndex: "owner",
      width: 60,
      render: (_: any, data: any, index: any) => {
        return (
          <>
            {isEditing && isEditIndex === data.id ? (
              <span>
                {selectedAgendaOwner
                  ?.map((owner: any) => owner.fullname)
                  .join(", ")}
              </span>
            ) : (
              <span>
                {data.owner?.map((owner: any) => owner.fullname).join(", ")}
              </span>
            )}
          </>
        );
      },
    },

    {
      title: "Actions",
      dataIndex: "actions",
      width: 20,
      render: (_: any, data: any, index: number) => {
        return (
          <div
            style={{
              width: "30px",
              display: "flex",
              gap: "14px",
              alignItems: "center",
            }}
          >
            <div>
              {isEditing && isEditIndex === data.id ? (
                <MdCheckBox
                  style={{ fontSize: "18px" }}
                  onClick={() => {
                    upDateHandlerAgenda(data);
                  }}
                />
              ) : (
                <CustomEditIcon
                  style={{ fontSize: "18px", height: "16px", padding: "0px" }}
                  onClick={() => {
                    editHandlerAgenda(data);
                  }}
                />
              )}
            </div>
            <div
              onClick={() => {
                deleteHandlerAgenda(data);
              }}
            >
              <CustomDeleteICon
                style={{ fontSize: "18px", height: "16px", padding: "0px" }}
              />
            </div>
          </div>
        );
      },
    },
  ];
  // console.log("readMode", readMode);

  return (
    <>
      <div>
        {agendaInsert?.map((item: any, index: any) => {
          return (
            <Form form={firstForm}>
              <Col key={index}>
                <Grid item sm={12} md={5} className={classes.formTextPadding}>
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                    <span className={classes.label}>Agenda: </span>
                  </strong>
                </Grid>
                <Form.Item
                  name="meetingAgenda"
                  className={classes.disabledMultiSelect}
                >
                  <Select
                    value={selectedValue}
                    disabled={readMode}
                    onChange={(e: any) => {
                      const selectedItem = agendaValuesFind.find(
                        (item: any) => item.agenda === e?.target?.value
                      );
                      // console.log("selected item", selectedItem);
                      // Store the selected agenda and its owner
                      setSelectedValue(selectedItem?.agenda);
                      setSelectedOwner(selectedItem?.owner); // Store both agenda and owner here
                    }}
                    style={{
                      width: "100%",
                      height: "40px",
                      paddingLeft: "10px",
                      paddingRight: "10px",
                      border: "1px solid grey",
                      backgroundColor: readMode === true ? "white" : "#F7F6F6",
                    }}
                  >
                    {agendaValuesFind &&
                      agendaValuesFind?.map((item: any, index: any) => {
                        return (
                          <MenuItem key={index} value={item?.agenda}>
                            {item?.agenda}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Grid item sm={12} md={5} className={classes.formTextPadding}>
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                    <span className={classes.label}>Decision: </span>
                  </strong>
                </Grid>
                <Form.Item
                  name="meetingDecision"
                  rules={[{ validator: validateTitle }]}
                >
                  <Input.TextArea
                    value={text}
                    disabled={readMode}
                    onChange={(e) => {
                      setText(e.target.value);
                    }}
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    placeholder="Type here..."
                    style={{
                      backgroundColor: readMode === true ? "white" : "#F7F6F6",
                    }}
                  />
                </Form.Item>
              </Col>
            </Form>
          );
        })}
        <TableRow
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <Button
            onClick={addHandlerAgenda}
            style={{ color: "#003566" }}
            disabled={!access || readMode}
          >
            Add
          </Button>
        </TableRow>

        <div className={classes.tableContainer} style={{ paddingTop: "30px" }}>
          <Table
            className={classes.documentTable}
            rowClassName={() => "editable-row"}
            bordered
            dataSource={addAgendaValues}
            columns={tableRowData}
            pagination={false}
          />
        </div>
      </div>
    </>
  );
}

MeetingEditingTabTwo.propTypes = {};

export default MeetingEditingTabTwo;
