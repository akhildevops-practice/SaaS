import React, { useEffect, useState } from "react";
import { Col, Form, Radio, Row } from "antd";
import { cipFormData } from "recoil/atom";

import { makeStyles, useMediaQuery } from "@material-ui/core";
import useStylesdata from "./style";

//trable
import { Select as TableSelect } from "antd";
import getAppUrl from "utils/getAppUrl";
import TextArea from "antd/es/input/TextArea";
import { MdCheckCircleOutline } from 'react-icons/md';
import { MdVerifiedUser } from 'react-icons/md';

import { MdEdit, MdDelete, MdOutlineInfo } from 'react-icons/md';
import { debounce } from "lodash";
import {
  IconButton,
  Tooltip,
} from "@material-ui/core";
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

type Props = {
  drawer?: any;
  setDrawer?: any;
  handleCipFormCreated?: any;
  benefits?: any;
  setBenefits?: any;
  uploadFileError?: any;
  setUploadFileError?: any;
  disableFormFields?: any;
  disableDocType?: any;
  template?: any;
  setTemplate?: any;
  isEdit?: any;
  activeTabKey?: any;
  setRefreshChild: any;

  refForcipForm9?: any;
  refForcipForm10?: any;
  refForcipForm11?: any;
  refForcipForm12?: any;
  refForcipForm13?: any;
  refForcipForm14?: any;
  refForcipForm15?: any;
  refForcipForm16?: any;
  refForcipForm17?: any;
};

//table declarations
let typeAheadValue: string;
let typeAheadType: string;
const { Option } = TableSelect;

const BenifitAnalysis = ({
  drawer,
  template,
  benefits,
  setBenefits,
  setDrawer,
  setTemplate,
  handleCipFormCreated,
  uploadFileError,
  setUploadFileError,
  disableFormFields,
  disableDocType,
  isEdit,
  activeTabKey,
  setRefreshChild,
  refForcipForm11,
  refForcipForm9,
  refForcipForm10,
  refForcipForm12,
  refForcipForm13,
  refForcipForm14,
  refForcipForm15,
  refForcipForm16,
  refForcipForm17,
}: Props) => {
  const [formData, setFormData] = useRecoilState(cipFormData);

  //table states
  const matches = useMediaQuery("(min-width:786px)");
  const [tableForm, setTableForm] = useRecoilState(cipTableFormSchemaState);
  const [tableData, setTableData] = useRecoilState(cipTableDataState);
  const [buttonAddCheck, setButtonAddCheck] = useState(false);
  const ResetFormData = useResetRecoilState(cipTableFormSchemaState);
  const realmName = getAppUrl();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [benefitModal, setBenefitModal] = useState(false);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  console.log("USER DETAILS ", userDetail);
  const [modalCommentState, setModalCommentState] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [buttonHide, setButtonHide] = useState(false);
  const [editId, setEditId] = useState<any>();
  const [symbol, setSymbol] = useState("₹");

  const uniqueId = generateUniqueId(22);
  const [uomList, setUOMList] = useState<any>([]);

  const modalOpenHandler = (data: any) => {
    setModalCommentState(true);
    setTableForm({
      benefitArea: data?.benefitArea,
      benefitType: data?.benefitType,
      metric: data?.metric,
      uom: data?.uom,
      verifier: data?.verifier,
      comments: data?.comments,
      id: data?.id,
      buttonStatus: false,
      mode: "edit",
      verifierStatus: false,
    });
  };

  const modalCloseHandler = () => {
    setModalCommentState(false);
  };

  const handlerUpdateData = async () => {
    const dataUpdate = tableData.map((item: any) => {
      if (item.id === tableForm.id) {
        return {
          ...item,
          comments: tableForm?.comments,
          verifierStatus: true,
        };
      }
      return item;
    });
    setTableData(dataUpdate);
    setModalCommentState(false);
    setFormData({
      ...formData,
      tangibleBenefits: dataUpdate,
    });
    const dataPayload = {
      ...formData,
      tangibleBenefits: dataUpdate,
    };
    const res = await axios.put(`api/cip/${formData.id}`, {
      ...formData,
      tangibleBenefits: dataUpdate,
    });
    if (res.status === 200 || res.status === 201) {
      setRefreshChild(true);
      enqueueSnackbar(`Data Verified successfully!`, {
        variant: "success",
      });
    }
  };

  const useStyles = makeStyles((theme) => ({
    labelStyle: {
      "& .ant-input-lg": {
        border: "1px solid #dadada",
      },
      "& .ant-form-item .ant-form-item-label > label": {
        color: "#003566",
        fontWeight: "bold",
        letterSpacing: "0.8px",
      },
      "& .ant-input-disabled, & .ant-select-disabled, & .ant-select-disabled .ant-select-selector, & .ant-input-prefix":
        {
          color: "black !important",
        },
    },
    disabledInput: {
      "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
        backgroundColor: "white",
        color: "black",

        // border: "none",
      },
    },

    disabledSelect: {
      "& .ant-select-disabled .ant-select-selector": {
        backgroundColor: "white",
        background: "white !important",
        color: "black",

        // border: "none",
      },
      "& .ant-select-disabled .ant-select-selection-item": {
        color: "black",
        backgroundColor: "white",
      },
      "& .ant-select-disabled .ant-select-arrow": {
        display: "none",
      },
      // "&.ant-select-selector": {
      //   backgroundColor: "white",
      // },
    },

    disabledMultiSelect: {
      "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
        backgroundColor: "white !important",
        // border: "none",
      },
      "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
        color: "black",
        background: "white !important",

        // border: "none",
      },
      "& .ant-select-disabled .ant-select-arrow": {
        display: "none",
      },
    },
  }));

  const classes = useStyles();
  const classform = useStylesdata();

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // table functions

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
  useEffect(() => {
    getUnitOptions();
  }, []);

  // useEffect(() => {
  //   setFormData({
  //     ...formData,
  //     tangibleBenefits: tableData,
  //   });
  // }, []);

  useEffect(() => {
    if (formData?.tangibleBenefits?.length !== 0) {
      setTableData(formData?.tangibleBenefits);
    }
  }, []);

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
    const isValid = validateInput(e.target.value, "text");
    if (isValid === true) {
      setTableForm({
        ...tableForm,
        [name]: e.target.value,
      });
    }
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
      setFormData({
        ...formData,
        tangibleBenefits: tableData,
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
            <span>{data?.benefitArea}</span>
          </div>
        );
      },
    },
    {
      title: "Benefit Type",
      dataIndex: "BenefitType",
      key: "BenefitType",
      width: 60,
      render: (_: any, data: any, index: number) => {
        return (
          <div
            style={{
              width: "80px",
            }}
          >
            {data?.benefitType}
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
            <span>{data?.verifier?.email}</span>
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
          <div style={{ display: "flex", gap: "10px", width: "40px" }}>
            <MdOutlineInfo
              onClick={() => {
                viewHandlerInfo(data);
              }}
            />
            {data?.verifier &&
            data?.verifier?.username === userDetail?.username &&
            data?.verifier &&
            data?.verifier?.email === userDetail?.email &&
            data?.verifierStatus === false &&
            formData.status === "InVerification" ? (
              <>
                <Tooltip title="Accept">
                  <MdCheckCircleOutline
                    style={{ color: "green" }}
                    onClick={() => {
                      modalOpenHandler(data);
                    }}
                  />
                </Tooltip>
              </>
            ) : (
              <>
                <IconButton
                  disabled={data?.verifierStatus}
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
                  disabled={data?.verifierStatus}
                >
                  <MdDelete style={{ fontSize: "20px" }} />
                </Popconfirm>
                {data?.verifierStatus && (
                  <Tooltip title="Verified">
                    <MdVerifiedUser
                      style={{ color: "blue", fontSize: "20px" }}
                    />
                  </Tooltip>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  function validateInput(value: any, fieldType: any) {
    // Define regex patterns
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/u;
    const disallowedChars = /[<>]/u;

    // Rule: No starting with special character (non-letter and non-number)
    const startsWithSpecialChar = /^[^\p{L}\p{N}]/u.test(value);

    // Rule: No two consecutive special characters
    const consecutiveSpecialChars =
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/u.test(value);

    // Rule: Disallow < and >
    const containsDisallowedChars = disallowedChars.test(value);

    // Check rules based on field type
    if (fieldType === "text" || fieldType === "dropdown") {
      if (startsWithSpecialChar) {
        return "The input should not start with a special character or space.";
      }

      if (consecutiveSpecialChars) {
        return "No two consecutive special characters are allowed.";
      }

      if (containsDisallowedChars) {
        return "The characters < and > are not allowed.";
      }

      return true; // Passes validation for text or dropdown fields
    } else if (fieldType === "number") {
      // Rule: Only numbers are allowed
      if (!/^\d+$/u.test(value)) {
        return "Only numeric values are allowed.";
      }

      return true; // Passes validation for number fields
    }

    return "Invalid field type."; // In case an unsupported field type is passed
  }

  const validateField = (fieldType: any) => ({
    validator(_: any, value: any) {
      const result = validateInput(value, fieldType);
      if (result === true) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(result));
    },
  });

  return (
    <>
      <Form
        layout="vertical"
        initialValues={{
          reviewers: formData?.reviewers,
          approvers: formData?.approvers,
          justification: formData?.justification,
          cost: formData?.cost,
        }}
        rootClassName={classes.labelStyle}
        disabled={disableFormFields}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Justification & Intangible Benefits: "
              name="justification"
              rules={[
                {
                  required: false,
                  message: "Please Enter justification and Benefits!",
                },
                {
                  validator: validateField("text").validator,
                },
              ]}
            >
              {/* <div ref={refForcipForm9}> */}
              <TextArea
                rows={1}
                autoSize={{ minRows: 4, maxRows: 6 }}
                placeholder="Enter justification and Benefits"
                size="large"
                name="justification"
                onChange={(e: any) => handleInputChange(e)}
                value={formData?.justification}
                disabled={disableFormFields}
                style={{
                  backgroundColor: disableFormFields ? "white" : "",
                }}
              />
              {/* </div> */}
            </Form.Item>
          </Col>
        </Row>
        <div
          style={{ display: "grid", gap: "10px" }}
          //  ref={refForcipForm10}
        >
          <div style={{ display: "flex", gap: "15px" }}>
            <span
              style={{
                color: "#003566",
                fontWeight: "bold",
                letterSpacing: "0.8px",
                width: "100px",
              }}
            >
              Project Cost{" "}
            </span>
            <Radio.Group
              onChange={(e: any) => {
                setSymbol(e.target.value);
              }}
              value={symbol}
              style={{ width: matches ? "300px" : "100px" }}
            >
              <Radio value={"₹"}>Rupees</Radio>
              {/* <Radio value={"€"}>Euro</Radio>
              <Radio value={"$"}>Dollar </Radio> */}
            </Radio.Group>
          </div>
          <div>
            <Input
              style={{
                width: matches ? "300px" : "90%",
                backgroundColor: disableFormFields ? "white" : "",
              }}
              name="cost"
              type="number"
              placeholder="Enter Project Cost"
              size="large"
              onChange={(e: any) => {
                const selectedValue = e.target.value;
                if (Number(selectedValue) >= 0) {
                  handleInputChange(e);
                }
              }}
              value={formData?.cost}
              prefix={symbol}
              disabled={disableFormFields}
              min={0}

              // className={classes.disabledInput }
            />
          </div>
        </div>
        {/* <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              // label="Project Cost "
              name="cost"
              rules={[
                {
                  required: false,
                  message: "Please Enter Cost!",
                },
              ]}
            ></Form.Item>
          </Col>
        </Row> */}
      </Form>

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
          disabled={disableFormFields}
          ref={refForcipForm11}
        >
          Add
        </Button>
      </div>
      <div className={classform.tableContainer}>
        <BenefitsTable
          className={classform.documentTable}
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
              ref={refForcipForm17}
            >
              {tableForm.mode === "create" ? "Submit" : "Update"}
            </Button>,
          ]}
          width="850px"
        >
          <div style={{ display: "grid", gap: "25px" }}>
            <div className={classform.firDivContainer}>
              <div className={classform.secondDivContainer}>
                <strong>Benefit Area</strong>
                <div
                //  ref={refForcipForm12}
                >
                  <Form>
                    <Form.Item
                      name={"benefitArea"}
                      rules={[
                        {
                          validator: validateField("text").validator,
                        },
                      ]}
                    >
                      <Input
                        name="benefitArea"
                        placeholder="Type benefitArea"
                        value={tableForm.benefitArea}
                        onChange={(e) => handlerChangeData("benefitArea", e)}
                        style={{ width: "100%" }}
                        disabled={tableForm.buttonStatus}
                      />
                    </Form.Item>
                  </Form>
                </div>
              </div>
              <div className={classform.secondDivContainer}>
                <strong>Benefit Type</strong>
                {/* <Input
                  placeholder="Type benefitType"
                  value={tableForm.benefitType}
                  onChange={(e) => {
                    handlerChangeData("benefitType", e);
                  }}
                  style={{ width: "100%" }}
                  disabled={tableForm.buttonStatus}
                /> */}
                <div
                // ref={refForcipForm13}
                >
                  <Form>
                    <Form.Item>
                      <TableSelect
                        placeholder="Select benefitType"
                        value={tableForm.benefitType}
                        style={{ width: "100%" }}
                        onChange={(e: any) => {
                          handlerOptionsDataCheck("benefitType", e);
                        }}
                        options={[
                          { value: "Recurring", label: "Recurring" },
                          { value: "One Time", label: "One Time" },
                        ]}
                        disabled={tableForm.buttonStatus}
                      />
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </div>
            <div className={classform.firDivContainer}>
              <div className={classform.secondDivContainer}>
                <strong>Metric</strong>
                <div
                // ref={refForcipForm14}
                >
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
              </div>
              <div className={classform.secondDivContainer}>
                <strong>UOM</strong>
                <div
                //  ref={refForcipForm15}
                >
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
              </div>
              <div className={classform.secondDivContainer}>
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
              {/* <div className={classform.secondDivContainer}>
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
                  value={tableForm?.verifier}
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
            {tableForm.comments && (
              <div className={classform.firDivContainer}>
                <strong style={{ width: "150px" }}>Comments</strong>
                <TextArea
                  rows={1}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  placeholder="Type Comment"
                  value={tableForm.comments}
                  size="large"
                  name="comments"
                  onChange={(e) => {
                    handlerChangeData("comments", e);
                  }}
                  disabled={tableForm.buttonStatus}
                />
              </div>
            )}
          </div>
        </Modal>
        <div>
          <Modal
            title={
              <>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2px",
                  }}
                >
                  Enter Verification Comment ?
                </div>
                <div style={{ paddingTop: "10px" }}>
                  <TextArea
                    rows={1}
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    placeholder="Type Comment"
                    value={tableForm.comments}
                    size="large"
                    name="comments"
                    onChange={(e) => {
                      handlerChangeData("comments", e);
                    }}
                  />
                </div>
              </>
            }
            // icon={<ErrorIcon />}
            open={modalCommentState}
            onOk={() => {}}
            onCancel={() => {
              modalCloseHandler();
            }}
            footer={[
              <Button
                key="submit"
                type="primary"
                style={{ backgroundColor: "#003059" }}
                onClick={() => {
                  modalCloseHandler();
                  //handleSubmitForm(formData?.status);
                }}
              >
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                style={{ backgroundColor: "#003059" }}
                onClick={() => {
                  handlerUpdateData();
                }}
              >
                Submit
              </Button>,
            ]}
            // okText="Yes"
            okType="danger"
            // cancelText="No"
          />
        </div>
      </div>
    </>
  );
};

export default BenifitAnalysis;
