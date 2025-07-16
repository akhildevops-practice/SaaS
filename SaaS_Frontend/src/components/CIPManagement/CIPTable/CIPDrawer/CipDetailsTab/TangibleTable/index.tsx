import { useState, useEffect } from "react";
import { useStyles } from "./styles";
import { MdEdit, MdDelete, MdOutlineInfo } from 'react-icons/md';
import { debounce } from "lodash";
import {
  IconButton,
  Tooltip,
} from "@material-ui/core";
import _ from "lodash";
import { useSnackbar } from "notistack";
import axios from "apis/axios.global";
import {
  Table as BenefitsTable,
  Button,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
} from "antd";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import { useRecoilState, useResetRecoilState } from "recoil";
import { cipTableDataState, cipTableFormSchemaState } from "recoil/atom";
import { Select as TableSelect } from "antd";
import getAppUrl from "utils/getAppUrl";
import TextArea from "antd/es/input/TextArea";
import { MdCheckCircleOutline } from 'react-icons/md';
import { MdVerifiedUser } from 'react-icons/md';
/**
 * This is a table component which has a feature for editing rows inside the table itself
 *
 */
let typeAheadValue: string;
let typeAheadType: string;
const { Option } = TableSelect;

function TangibleTable(props: any) {
  const classes = useStyles();
  const uniqueId = generateUniqueId(22);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [addValue, setAddValue] = useState<any>({
    benefitArea: "",
    metric: "",
    uom: "",
    verifier: "",
    comment: "",
  });
  const [editIndex, setEditIndex] = useState<any>(null);
  const { isAction = [], actions = [] } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [uomList, setUOMList] = useState<any>([]);
  const [editId, setEditId] = useState<any>();
  const [buttonHide, setButtonHide] = useState(false);
  const [buttonAdd, setButtonAdd] = useState(false);
  const [tableForm, setTableForm] = useRecoilState(cipTableFormSchemaState);
  const [tableData, setTableData] = useRecoilState(cipTableDataState);
  const [buttonAddCheck, setButtonAddCheck] = useState(false);
  const ResetFormData = useResetRecoilState(cipTableFormSchemaState);
  const realmName = getAppUrl();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [benefitModal, setBenefitModal] = useState(false);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  // We need to keep and update the state of the cell normally

  useEffect(() => {
    getUnitOptions();
  }, []);
  /**
   * @method hydrateActions
   * @description Function to list helper actions inside the last table column
   * @param actions
   * @param value
   * @param isAction
   * @returns
   */

  useEffect(() => {
    props.setData((prev: any) => {
      return tableData;
    });
  }, [tableData]);

  useEffect(() => {
    if (props.formData.tangibleBenefits.length !== 0) {
      setTableData(props.formData.tangibleBenefits);
    }
  }, [props.formData]);

  const hydrateActions = (actions: any, value: any, isAction: any) => {
    if (isAction?.length > 0) {
      const newAction = actions.filter((val: any) => {
        const filtered = isAction.findIndex((item: any) => {
          return item === val?.label;
        });
        return filtered === -1 ? true : false;
      });
      return newAction.map((item: any) => ({
        ...item, //label, icon of the action
        handler: () => item.handler(value), //handler of the action (edit/delete)
      }));
    }
    return actions.map((item: any) => ({
      ...item,
      handler: () => item.handler(value),
    }));
  };

  const getUnitOptions = async () => {
    await axios(`/api/kpi-definition/getAllUom`)
      .then((res) => {
        res.data.result?.forEach((ut: any) => {
          ut.unitOfMeasurement.forEach((u: string) => {
            setUOMList((prev: any) => [
              ...prev,
              {
                name: u,
                type: ut.unitType,
                id: ut.id,
              },
            ]);
          });
        });
      })
      .catch((err) => console.error(err));
  };

  /**
   * @method handleEditChange
   * @description Function to handle editing inside the cip table
   * @param e {any}
   * @param i {number}
   * @returns nothing
   */
  const handleEditChange = async (e: any, i: number) => {
    // Checking for empty values in the newly created cip object

    const cipData = JSON.parse(JSON.stringify(props.data));
    const noDup = JSON.parse(JSON.stringify(props.data));

    props.setData((prev: any) => {
      cipData.splice(i, 1, {
        ...cipData[i],
        [e.target.name]: e.target.value,
      });
      const noDuplicates = _.uniqBy(cipData, "benefitArea");

      if (cipData.length !== noDuplicates.length) {
        enqueueSnackbar("You cannot have a duplicate cip number!", {
          variant: "error",
        });
        return noDup;
      }
      return cipData;
    });
  };

  /**
   * @method deletecip
   * @description Function to delete cip of a system
   * @param id {string}
   * @returns deleted cip
   */
  const handleDelete = async (id: any) => {
    const cipData = JSON.parse(JSON.stringify(props.data));
    props.setData((prev: any) => {
      cipData.splice(id, 1);
      return cipData;
    });
  };

  /**
   * @method handleAddChange
   * @description Function to handle changes in the input fields which are associated with adding an entry to the table
   * @param e {any}
   * @returns nothing
   */
  const handleAddChange = (e: any) => {
    setAddValue({
      ...addValue,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * @method addcip
   * @description Function to add a cip
   * @returns nothing
   */
  const addBenefits = () => {
    // Checking for empty values in the newly created cip object
    if (
      !addValue.uom.trim() ||
      !addValue.metric.trim() ||
      !addValue.benefitArea.trim()
    ) {
      enqueueSnackbar("You must enter all fields!");
      return;
    }

    const cipData = JSON.parse(JSON.stringify(props.data));
    cipData.push(addValue);
    // Creating a duplicate check tag
    const noDuplicates = _.uniqBy(cipData, "benefitArea");
    if (cipData.length !== noDuplicates.length) {
      enqueueSnackbar("You cannot have a duplicate benefit benefitArea!", {
        variant: "error",
      });
      return;
    }

    props.setData((prev: any) => {
      return noDuplicates;
    });

    // Reset add value
    setAddValue({
      benefitArea: "",
      metric: "",
      uom: "",
    });
  };

  const handleTextChange = (value: any) => {
    if (value) {
      getSuggestionList(value, "normal");
    }
  };

  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };

  const debouncedSearch = debounce(() => {
    getData(typeAheadValue, typeAheadType);
  }, 400);

  const getData = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `api/user/doctype/filterusers/${realmName}/${"allusers"}?email=${value}`
      );
      setSuggestions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handlerOptionsDataCheck = (name: any, e: any) => {
    setTableForm({
      ...tableForm,
      [name]: e,
    });
  };

  const minValue = "1";
  const maxValue = "100000";
  const defaultValue = "0";

  const handlerChangeData = (name: any, e: any) => {
    setTableForm({
      ...tableForm,
      [name]: e.target.value,
    });
  };

  const selectReviewReviewHandler = (field: any, values: any) => {
    if (values?.value) {
      const parsedObject = JSON.parse(values.value);
      setTableForm({
        ...tableForm,
        [field]: parsedObject,
      });
    }
  };

  const TableDataAddHandler = (data: any) => {
    if (tableForm.mode === "create") {
      if (tableForm.uom && tableForm.metric && tableForm.benefitArea === "") {
        enqueueSnackbar("You must enter all fields!");
        return;
      }

      if (
        tableData
          .map((item: any) => item.benefitArea)
          .includes(tableForm.benefitArea)
      ) {
        enqueueSnackbar("You cannot have a duplicate benefit benefitArea!", {
          variant: "error",
        });
        return;
      }

      const payload = {
        ...tableForm,
        buttonStatus: false,
      };
      setTableData([...tableData, payload]);
      props.setData((prev: any) => {
        return tableData;
      });
      setButtonAddCheck(false);
      setBenefitModal(false);
      ResetFormData();
      enqueueSnackbar(`Data Added successfully!`, {
        variant: "success",
      });
    }
    if (tableForm.mode === "edit") {
      const payload = {
        ...tableForm,
        buttonStatus: true,
      };

      const updateData = tableData.map((item: any) => {
        if (item.id === editId) {
          console.log("item", item);
          return {
            ...item,
            ...payload,
          };
        }
        return item;
      });
      setTableData(updateData);
      setButtonHide(false);
      setBenefitModal(false);
      ResetFormData();
      enqueueSnackbar(`Data Updated successfully!`, {
        variant: "success",
      });
    }
  };

  const tableEditHandler = (data: any) => {
    setButtonHide(true);
    setEditId(data.id);
    setTableForm({
      benefitArea: data.benefitArea,
      benefitType: data.benefitType,
      metric: data.metric,
      uom: data.uom,
      verifier: data.verifier,
      comments: data.comments,
      id: data.id,
      buttonStatus: false,
      mode: "edit",
      verifierStatus: false,
    });
    const editData = tableData.map((item: any) => {
      if (item.id === data.id) {
        return { ...item, buttonStatus: false };
      }
      return item;
    });
    setTableData(editData);
    setBenefitModal(true);
    setButtonAddCheck(false);
  };

  const addHandlerTable = () => {
    setTableForm({
      benefitArea: "",
      benefitType: "",
      metric: "",
      uom: "",
      verifier: {
        email: "",
      },
      comments: "",
      buttonStatus: false,
      id: uniqueId,
      mode: "create",
      verifierStatus: false,
    });
    setButtonAddCheck(false);
    setBenefitModal(true);
  };

  const viewHandlerInfo = (data: any) => {
    setTableForm({
      benefitArea: data.benefitArea,
      benefitType: data.benefitType,
      metric: data.metric,
      uom: data.uom,
      verifier: data.verifier,
      comments: data.comments,
      id: data.id,
      buttonStatus: true,
      mode: "view",
      verifierStatus: false,
    });
    const editData = tableData.map((item: any) => {
      if (item.id === data.id) {
        return { ...item, buttonStatus: false };
      }
      return item;
    });
    setTableData(editData);
    setBenefitModal(true);
    setButtonAddCheck(true);
  };

  const tableDeleteHandler = (data: any) => {
    const deleteData = tableData.filter((item: any) => item.id !== data.id);
    setTableData(deleteData);
  };

  const verifierStatus = (data: any) => {
    setTableForm({
      benefitArea: data.benefitArea,
      benefitType: data.benefitType,
      metric: data.metric,
      uom: data.uom,
      verifier: data.verifier,
      comments: data.comments,
      id: data.id,
      buttonStatus: false,
      mode: "edit",
      verifierStatus: true,
    });
    const editData = tableData.map((item: any) => {
      if (item.id === data.id) {
        return { ...item, verifierStatus: true };
      }
      return item;
    });
    setTableData(editData);
    enqueueSnackbar(`Data Verified successfully!`, {
      variant: "success",
    });
  };

  const tangibleBenefits = [
    {
      title: "Benefit Area",
      dataIndex: "BenefitArea",
      key: "BenefitArea",
      width: 80,
      render: (_: any, data: any, index: number) => {
        return (
          <div
            style={{
              width: "120px !important",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span>{data.benefitArea}</span>
          </div>
        );
      },
    },
    {
      title: "Benefit Type",
      dataIndex: "BenefitType",
      key: "BenefitType",
      width: 80,
      render: (_: any, data: any, index: number) => {
        return (
          <div
            style={{
              width: "120px !important",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span>{data.benefitType}</span>
          </div>
        );
      },
    },
    // {
    //   title: "Metric",
    //   dataIndex: "Metric",
    //   key: "Metric",
    //   width: 80,
    //   render: (_: any, data: any, index: number) => {
    //     return (
    //       <div>
    //         {data.metric === "" ? (
    //           <>
    //             <InputNumber
    //               min={minValue}
    //               max={maxValue}
    //               value={tableForm.metric}
    //               defaultValue={defaultValue}
    //               onChange={(e: any) => {
    //                 handlerOptionsDataCheck("metric", e);
    //               }}
    //               style={{ width: "70px", height: "30px" }}
    //             />
    //           </>
    //         ) : (
    //           <>
    //             {buttonHide && data.id === editId ? (
    //               <>
    //                 <InputNumber
    //                   min={minValue}
    //                   max={maxValue}
    //                   value={tableForm.metric}
    //                   defaultValue={defaultValue}
    //                   onChange={(e: any) => {
    //                     handlerOptionsDataCheck("metric", e);
    //                   }}
    //                   style={{ width: "70px", height: "30px" }}
    //                   disabled={data.buttonStatus}
    //                 />
    //               </>
    //             ) : (
    //               <>
    //                 <Input value={data.metric} disabled />
    //               </>
    //             )}
    //           </>
    //         )}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "UOM",
    //   dataIndex: "UOM",
    //   key: "UOM",
    //   width: 80,
    //   render: (_: any, data: any, index: number) => {
    //     return (
    //       <div>
    //         {data.uom === "" ? (
    //           <>
    //             {" "}
    //             <TableSelect
    //               placeholder="Select Change Items"
    //               value={tableForm.uom}
    //               allowClear
    //               style={{ width: "100px" }}
    //               onChange={(e: any) => {
    //                 handlerOptionsDataCheck("uom", e);
    //               }}
    //             >
    //               {uomList &&
    //                 uomList.map((item: any) => {
    //                   return (
    //                     <Option value={item.name} key={item.key}>
    //                       {item.name}
    //                     </Option>
    //                   );
    //                 })}
    //             </TableSelect>
    //           </>
    //         ) : (
    //           <>
    //             {buttonHide && data.id === editId ? (
    //               <TableSelect
    //                 placeholder="Select Change Items"
    //                 value={tableForm.uom}
    //                 allowClear
    //                 style={{ width: "100px" }}
    //                 onChange={(e: any) => {
    //                   handlerOptionsDataCheck("uom", e);
    //                 }}
    //                 disabled={data.buttonStatus}
    //               >
    //                 {uomList &&
    //                   uomList.map((item: any) => {
    //                     return (
    //                       <Option value={item.name} key={item.key}>
    //                         {item.name}
    //                       </Option>
    //                     );
    //                   })}
    //               </TableSelect>
    //             ) : (
    //               <Input value={data.uom} disabled />
    //             )}
    //           </>
    //         )}
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Verifier",
      dataIndex: "Verifier",
      key: "Verifier",
      width: 80,
      render: (_: any, data: any, index: number) => {
        return (
          <div>
            <span>{data.verifier?.map((item: any) => item.username)}</span>
          </div>
        );
      },
    },
    // {
    //   title: "Comments",
    //   dataIndex: "Comments",
    //   key: "Comments",
    //   width: 80,
    //   render: (_: any, data: any, index: number) => {
    //     return (
    //       <div style={{ width: "80px" }}>
    //         {data.comments === "" ? (
    //           <>
    //             <Input
    //               placeholder="Type Comment"
    //               value={tableForm.comments}
    //               onChange={(e) => {
    //                 handlerChangeData("comments", e);
    //               }}
    //             />
    //           </>
    //         ) : (
    //           <>
    //             {buttonHide && data.id === editId ? (
    //               <Input
    //                 placeholder="Type BenefitType"
    //                 value={tableForm.comments}
    //                 onChange={(e) => {
    //                   handlerChangeData("comments", e);
    //                 }}
    //                 disabled={data.buttonStatus}
    //               />
    //             ) : (
    //               <Input value={data.comments} disabled />
    //             )}
    //           </>
    //         )}
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Action",
      dataIndex: "Action",
      key: "Action",
      width: 80,
      render: (_: any, data: any, index: number) => {
        return (
          <div style={{ display: "flex", gap: "20px", width: "40px" }}>
            <MdOutlineInfo
              onClick={() => {
                viewHandlerInfo(data);
              }}
            />
            {data.verifier &&
            data.verifier?.username === userDetail.username &&
            data.verifier &&
            data.verifier?.email === userDetail.email ? (
              <>
                <Tooltip title="Accept">
                  <MdCheckCircleOutline
                    style={{ color: "green" }}
                    onClick={() => {
                      verifierStatus(data);
                    }}
                  />
                </Tooltip>
              </>
            ) : (
              <>
                <IconButton
                  disabled={data.verifierStatus}
                  style={{ padding: "0px" }}
                >
                  <MdEdit
                    style={{ fontSize: "20px" }}
                    onClick={() => {
                      tableEditHandler(data);
                    }}
                  />
                </IconButton>
                <Popconfirm
                  placement="top"
                  title={"Are you sure to delete Data"}
                  onConfirm={() => tableDeleteHandler(data)}
                  okText="Yes"
                  cancelText="No"
                  disabled={data.verifierStatus}
                >
                  <MdDelete style={{ fontSize: "20px" }} />
                </Popconfirm>
              </>
            )}
            {data.verifierStatus && (
              <Tooltip title="Verified">
                <MdVerifiedUser style={{ color: "blue" }} />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table stickyHeader className={classes.table}>
          <TableHead>
            <TableRow>
              {props.header.map((item: any) => (
                <TableCell key={item}>
                  <Typography
                    variant="body2"
                    className={classes.tableHeaderColor}
                  >
                    {item}
                  </Typography>
                </TableCell>
              ))}
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.data?.map((val: any, i: number) => {
              return (
                <TableRow key={i}>
                  {props.fields.map((item: any) => (
                    <TableCell
                      className={
                        isAction
                          ? classes.tableCell
                          : classes.tableCellWithoutAction
                      }
                      key={item}
                    >
                      {isEditing && editIndex === i ? (
                        item === "uom" ? (
                          <Select
                            onChange={(e: any) => handleEditChange(e, i)}
                            name={item}
                            defaultValue={val[item]}
                            disabled={
                              props.disabled || props.disabledForDeletedModal
                            }
                          >
                            {uomList?.map((item: any) => (
                              <MenuItem key={item.id} value={item?.name}>
                                {item?.name}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : item === "metric" ? (
                          <InputBase
                            className={classes.addField}
                            type="number"
                            placeholder={`Type ${item}`}
                            disabled={
                              props.disabled || props.disabledForDeletedModal
                            }
                            name={item}
                            defaultValue={val[item]}
                            onChange={(e: any) => handleEditChange(e, i)}
                            required
                          />
                        ) : (
                          <InputBase
                            className={classes.editField}
                            multiline
                            name={item}
                            onChange={(e: any) => handleEditChange(e, i)}
                            defaultValue={val[item]}
                          />
                        )
                      ) : (
                        val[item]
                      )}
                    </TableCell>
                  ))}
                  {isAction && (
                    <TableCell className={classes.actionButtonTableCell}>
                      <IconButton
                        disabled={
                          props.disabled || props.disabledForDeletedModal
                        }
                        onClick={() => {
                          setIsEditing(!isEditing);
                          setEditIndex(i);
                        }}
                        style={{ fontSize: "16px" }}
                      >
                        {isEditing && editIndex === i ? (
                          <CheckBox style={{ fontSize: "18px" }} />
                        ) : (
                          <MdEdit style={{ fontSize: "18px" }} />
                        )}
                      </IconButton>
                      <IconButton
                        disabled={
                          props.disabled || props.disabledForDeletedModal
                        }
                        onClick={() => {
                          handleDelete(i);
                        }}
                        style={{ fontSize: "16px" }}
                      >
                        <MdDelete style={{ fontSize: "18px" }} />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {props.addFields && (
              <>
                {props.fields.map((item: any) => (
                  <TableCell
                    className={
                      isAction
                        ? classes.tableCell
                        : classes.tableCellWithoutAction
                    }
                    key={item}
                  >
                    {item === "benefitArea" ? (
                      <InputBase
                        className={classes.addField}
                        placeholder={`Type ${item}`}
                        disabled={
                          props.disabled || props.disabledForDeletedModal
                        }
                        multiline
                        name={item}
                        value={addValue[item]}
                        onChange={handleAddChange}
                        required
                      />
                    ) : item === "metric" ? (
                      <InputBase
                        className={classes.addField}
                        type="number"
                        placeholder={`Type ${item}`}
                        disabled={
                          props.disabled || props.disabledForDeletedModal
                        }
                        name={item}
                        value={addValue[item]}
                        onChange={handleAddChange}
                        required
                      />
                    ) : item === "verifier" ? (
                      <InputBase
                        className={classes.addField}
                        placeholder={`Type ${item}`}
                        disabled={
                          props.disabled || props.disabledForDeletedModal
                        }
                        multiline
                        name={item}
                        value={addValue[item]}
                        onChange={handleAddChange}
                        required
                      />
                    ) : item === "comment" ? (
                      <InputBase
                        className={classes.addField}
                        placeholder={`Type ${item}`}
                        disabled={
                          props.disabled || props.disabledForDeletedModal
                        }
                        multiline
                        name={item}
                        value={addValue[item]}
                        onChange={handleAddChange}
                        required
                      />
                    ) : (
                      <Select
                        onChange={handleAddChange}
                        name={item}
                        disabled={
                          props.disabled || props.disabledForDeletedModal
                        }
                        value={addValue[item]}
                      >
                        {uomList?.map((item: any) => {
                          return (
                            <MenuItem key={item.id} value={item?.name}>
                              {item?.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    )}
                  </TableCell>
                ))}
                <TableCell className={classes.tableCell}>
                  <Chip
                    label={props.label}
                    disabled={props.disabled || props.disabledForDeletedModal}
                    onClick={addBenefits}
                    className={classes.addFieldButton}
                  />
                </TableCell>
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer> */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
        }}
      >
        <strong>Tangible Benefits</strong>
        <Button
          onClick={() => {
            addHandlerTable();
          }}
          type="primary"
        >
          Add
        </Button>
      </div>
      <div className={classes.tableContainer}>
        <BenefitsTable
          className={classes.documentTable}
          rowClassName={() => "editable-row"}
          bordered
          columns={tangibleBenefits}
          style={{ width: "auto", overflow: "scroll" }}
          dataSource={tableData}
          pagination={false}
        />
        <Modal
          title="Tangible Benefits"
          open={benefitModal}
          onCancel={() => setBenefitModal(false)}
          footer={[
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                TableDataAddHandler(tableForm.id);
              }}
              disabled={buttonAddCheck}
            >
              {tableForm.mode === "create" ? "Submit" : "Update"}
            </Button>,
          ]}
          width="850px"
        >
          <div style={{ display: "grid", gap: "25px" }}>
            <div className={classes.firDivContainer}>
              <div className={classes.secondDivContainer}>
                <strong>Benefits Area</strong>
                <Input
                  placeholder="Type benefitArea"
                  value={tableForm.benefitArea}
                  onChange={(e) => {
                    handlerChangeData("benefitArea", e);
                  }}
                  style={{ width: "100%" }}
                  disabled={tableForm.buttonStatus}
                />
              </div>
              <div className={classes.secondDivContainer}>
                <strong>Benefit Type</strong>
                <Input
                  placeholder="Type benefitType"
                  value={tableForm.benefitType}
                  onChange={(e) => {
                    handlerChangeData("benefitType", e);
                  }}
                  style={{ width: "100%" }}
                  disabled={tableForm.buttonStatus}
                />
              </div>
            </div>
            <div className={classes.firDivContainer}>
              <div className={classes.secondDivContainer}>
                <strong>Metric</strong>
                <InputNumber
                  min={minValue}
                  max={maxValue}
                  value={tableForm.metric}
                  defaultValue={defaultValue}
                  onChange={(e: any) => {
                    handlerOptionsDataCheck("metric", e);
                  }}
                  style={{ width: "170px", height: "30px" }}
                  disabled={tableForm.buttonStatus}
                />
              </div>
              <div className={classes.secondDivContainer}>
                <strong>UOM</strong>
                <TableSelect
                  placeholder="Select Change Items"
                  value={tableForm.uom}
                  allowClear
                  style={{ width: "250px" }}
                  onChange={(e: any) => {
                    handlerOptionsDataCheck("uom", e);
                  }}
                  disabled={tableForm.buttonStatus}
                >
                  {uomList &&
                    uomList.map((item: any) => {
                      return (
                        <Option value={item.name} key={item.key}>
                          {item.name}
                        </Option>
                      );
                    })}
                </TableSelect>
              </div>
              <div className={classes.secondDivContainer}>
                <strong>Select Verifier</strong>
                <TableSelect
                  showSearch
                  placeholder="Select Verifier"
                  value={tableForm?.verifier?.email}
                  allowClear
                  style={{ width: "250px" }}
                  onChange={(e, value) => {
                    selectReviewReviewHandler("verifier", value);
                  }}
                  onSearch={(value: any) => {
                    handleTextChange(value);
                  }}
                  disabled={tableForm.buttonStatus}
                >
                  {suggestions &&
                    suggestions.map((item: any) => {
                      return (
                        <Option value={JSON.stringify(item)}>
                          {item.email}
                        </Option>
                      );
                    })}
                </TableSelect>
              </div>
              {/* <div className={classes.secondDivContainer}>
                <strong>Select Verifier</strong>
                <Autocomplete
                  multiple={false}
                  options={suggestions}
                  getOptionLabel={(option: any) => {
                    return option["email"];
                  }}
                  getOptionSelected={(option, value) => option.id === value.id}
                  limitTags={1}
                  size="small"
                  style={{ width: "300px" }}
                  onChange={(e, value) => {
                    selectReviewReviewHandler("verifier", value);
                  }}
                  // value={tableForm?.verifier?.map((gmail: any) =>
                  //   suggestions?.find((option: any) => option?.gmail === gmail)
                  // )}
                  // defaultValue={tableForm?.verifier?.map((gmail: any) =>
                  //   suggestions?.find((option: any) => option?.gmail === gmail)
                  // )}
                  disabled={tableForm.buttonStatus}
                  filterSelectedOptions
                  renderOption={(option) => {
                    return (
                      <>
                        <div>
                          <MenuItem key={option.id}>
                            <ListItemAvatar>
                              <Avatar>
                                <Avatar src={`${API_LINK}/${option.avatar}`} />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={option.value}
                              secondary={option.email}
                            />
                          </MenuItem>
                        </div>
                      </>
                    );
                  }}
                  renderInput={(params) => {
                    return (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder={"verifier"}
                        onChange={handleTextChange}
                        size="small"
                        //disabled={showData ? false : true}
                        InputLabelProps={{ shrink: false }}
                      />
                    );
                  }}
                />
              </div> */}
            </div>
            <div className={classes.firDivContainer}>
              <strong style={{ width: "150px" }}>Comments</strong>
              <TextArea
                placeholder="Type Comment"
                value={tableForm.comments}
                onChange={(e) => {
                  handlerChangeData("comments", e);
                }}
                style={{ width: "100%" }}
                disabled={tableForm.buttonStatus}
              />
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}

export default TangibleTable;
