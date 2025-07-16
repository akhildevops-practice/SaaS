import React, { useEffect, useState } from "react";
import { Table, Input, Checkbox, Select, DatePicker, Button } from "antd";
import styles from "./style";
import dayjs from "dayjs";
import { FaCheckCircle } from "react-icons/fa";
import { RiEdit2Line } from "react-icons/ri";
import { constants } from "http2";

import { useParams } from "react-router-dom";
import axios from "apis/axios.global";

import { useSnackbar } from "notistack";
import TextArea from "antd/es/input/TextArea";
import { useRecoilState } from "recoil";
import { referencesData } from "recoil/atom";

const { Option } = Select;

interface RCAData {
  id: string;
  cause: string;
  applicable: boolean;
  data?: {
    _id: string;
    title: string;
    status: boolean;
    owner: string[];
    locationId: string;
    targetDate: string;
    activityDate: string;
    deleted: boolean;
    referenceId: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
  };
}

type props = {
  formdata?: any;
  setformdata?: any;
  readMode?: any;
};

const CorrectiveAction = ({ formdata, setformdata, readMode }: props) => {
  const classes = styles();
  const { id } = useParams();
  const [refsData] = useRecoilState(referencesData);
  const { enqueueSnackbar } = useSnackbar();
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [data, setData] = useState<any[]>([]);
  const [userOptions, setUserOptions] = useState([]);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [tableRowList, setTableList] = useState([]);
  // console.log("tableRowList", tableRowList);
  // console.log("data", data);
  // console.log("userOptions", userOptions);

  // Fetch RCA data when component mounts
  useEffect(() => {
    getTableData();
  }, []);

  // console.log("id", id);

  useEffect(() => {
    getUserOptions();
    getRCAdatasss();
  }, []);

  const getUserOptions = async () => {
    await axios(`/api/kpi-report/getAll`)
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          id: obj.id,
          name: obj.username,
          avatar: obj.avatar,
          email: obj.email,
          username: obj.username,
          value: obj.id,
          label: obj.email,
          fullname: obj.firstname + " " + obj.lastname,
        }));
        setUserOptions(ops);
      })
      .catch((err) => console.error(err));
  };

  const getRCAdatasss = async () => {
    const result = await axios.get(`api/cara/getCompleteOutcomeForCapa/${id}`);
    // console.log("getRCAdatasssget", result.data);
  };

  // Handle field updates
  const handleChange = (key: any, field: any, value: any) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.key === key ? { ...row, [field]: value } : row
      )
    );
  };

  const [outcome, setOutcome] = useState<any[]>([]);

  // console.log("outcome", outcome);

  const [outcomeApicall, setOutcomeApicall] = useState(false);

  useEffect(() => {
    if (outcomeApicall === true) {
      callOutcomeApi();
    }
  }, [outcomeApicall]);

  const getTableData = async () => {
    try {
      let formattedData: any[] = [];
      // console.log("formattedData", formattedData);
      // Try fetching the complete outcome data
      try {
        const result = await axios.get(
          `api/cara/getCompleteOutcomeForCapa/${id}`
        );

        if (result.status === 200 || result.status === 201) {
          const transformedData = result?.data?.map((item: any) => ({
            id: item.data ? item?.data?._id : item.id,
            cause: item?.cause,
            applicable: item?.applicable,
            correctiveAction: item.correctiveAction,
            remarks: item.remarks,
            actionItemCreated: item?.actionItemCreated,
          }));
          setOutcome(transformedData);

          formattedData = result?.data?.map((item: any) => ({
            key: item?.id,
            rca: item?.cause,
            title: item.data ? item?.data?.title : item.correctiveAction,
            applicable: item?.applicable ?? false,
            owner: item?.data?.owner?.[0] || null,
            targetDate: item?.data?.targetDate || null,
            status: item.data ? (item?.data?.status ? "Open" : "Closed") : "",
            activityDate: item?.data?.activityDate || null,
            id: item.data ? item?.data?._id : item.id,
            remarks: item?.remarks || "",
            isEditing: false,
            applicableDisabled: item.data ? true : false,
            actionItemCreated: item?.actionItemCreated,
          }));
        }
      } catch (error) {
        // console.error("Error fetching complete outcome data:", error);
      }

      // Fetch RCA data
      const resultforRCA = await axios.get(`api/cara/getCausesForCapa/${id}`);

      // Extract existing RCA causes from the formatted data
      const existingCauses = new Set(formattedData.map((item) => item.rca));

      // Add new objects only if cause is not present in existing data
      const newRCAs = resultforRCA.data
        .filter((item: any) => !existingCauses.has(item.cause))
        .map((item: any) => ({
          key: item.id, // Use unique ID from API response
          rca: item.cause,
          title: "",
          applicable: false,
          owner: null,
          targetDate: null,
          status: "Open",
          activityDate: null,
          id: "",
          remarks: "",
          isEditing: false,
          applicableDisabled: false,
          actionItemCreated: false,
        }));

      // If `formattedData` is empty (API failed), use only RCA data
      setData(
        formattedData.length > 0 ? [...formattedData, ...newRCAs] : [...newRCAs]
      );

      // console.log(
      //   "Final Data State:",
      //   formattedData.length > 0 ? [...formattedData, ...newRCAs] : [...newRCAs]
      // );
    } catch (error) {
      // console.error("Error in getTableData:", error);
    }
  };

  const handleSave = (record: any) => {
    // console.log("Saving row:", record);

    const status = record.status === "Closed" ? false : true;

    const actionItemPayload = {
      title: record.title,
      owner: [record.owner],
      targetDate: record.targetDate,
      referenceId: id,
      locationId: userInfo.locationId,
      organizationId: userInfo.organizationId,
      id: record.key,
      status: status,
      activityDate: record.activityDate,
      remarks: record.remarks,
      applicable: record.applicable,
      cause: record.rca,
      source: "CAPA",
    };

    // console.log("actionItemPayload", actionItemPayload);

    if (record.id === "") {
      submitRowData(actionItemPayload, record);
    } else {
      submitEditedData(record.id, actionItemPayload, record);
    }

    // Implement save logic here
  };

  const submitRowData = async (payload: any, record: any) => {
    // Define friendly field names and custom messages
    const fieldValidation: { [key: string]: string } = {
      title: "Please enter Corrective Action value",
      owner: "Please select Responsible Person",
      targetDate: "Please select Target Date",
    };

    // Determine which fields to check based on `applicable`
    const requiredFields = record.applicable
      ? ["title", "owner", "targetDate"]
      : ["title"];

    // Helper function to validate each field
    const isFieldInvalid = (field: string) => {
      const value = payload[field];
      // Treat null, undefined, empty string, or empty array as invalid
      return (
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.every((v) => v == null)) || // handles [null], [], etc.
        (typeof value === "string" && value.trim() === "")
      );
    };

    // Find the first missing field
    const firstInvalidField = requiredFields.find(isFieldInvalid);

    if (firstInvalidField) {
      enqueueSnackbar(fieldValidation[firstInvalidField], { variant: "error" });
      return;
    }

    if (record.applicable) {
      // Proceed with API call only if 'applicable' is true
      try {
        const result = await axios.post(
          "/api/actionitems/createActionItem",
          payload
        );
        // console.log("Api is called >>>>>>>>>>>>>>>>>>>>");
        if (result.status === 200 || result.status === 201) {
          // getTableData();
          const outcomedata = {
            id: result.data._id,
            cause: record.rca,
            applicable: payload.status,
            correctiveAction: payload.title,
            remarks: payload.remarks,
          };

          setOutcome((prevOutcome) => {
            const existingIndex = prevOutcome.findIndex(
              (item: any) => item.id === outcomedata.id
            );

            if (existingIndex !== -1) {
              const updatedOutcome = [...prevOutcome];
              updatedOutcome[existingIndex] = outcomedata;
              return updatedOutcome;
            } else {
              return [...prevOutcome, outcomedata];
            }
          });
          setOutcomeApicall(true);
          enqueueSnackbar("Data Saved", { variant: "success" });
          setEditingKey(null);
        }
      } catch (error) {
        enqueueSnackbar("Failed to save data. Please try again.", {
          variant: "error",
        });
      }
    } else {
      // Handle non-applicable records without API call
      // getTableData();
      const outcomedata = {
        id: record.key, // Use record.key as id
        cause: record.rca,
        applicable: false,
        correctiveAction: payload.title,
        remarks: payload.remarks,
        key: record.key,
      };

      setOutcome((prevOutcome) => {
        const existingIndex = prevOutcome.findIndex(
          (item: any) =>
            item.cause.trim().toLowerCase() ===
            outcomedata.cause.trim().toLowerCase()
        );

        const updatedOutcome =
          existingIndex !== -1
            ? [
                ...prevOutcome.slice(0, existingIndex),
                outcomedata,
                ...prevOutcome.slice(existingIndex + 1),
              ]
            : [...prevOutcome, outcomedata];

        callOutcomeApiwithArg(updatedOutcome);

        return updatedOutcome;
      });
      // setOutcomeApicall(true);
      enqueueSnackbar("Data Saved", { variant: "success" });
      setEditingKey(null);
    }
  };

  const submitEditedData = async (editId: any, payload: any, record: any) => {
    // console.log("record777", record);
    // Define friendly field names and custom messages
    const fieldValidation: { [key: string]: string } = {
      title: "Please enter Corrective Action value",
      owner: "Please select Responsible Person",
      targetDate: "Please select Target Date",
    };

    // Determine which fields to check based on `applicable`
    const requiredFields = record.applicable
      ? ["title", "owner", "targetDate"]
      : ["title"];

    // Helper function to validate each field
    const isFieldInvalid = (field: string) => {
      const value = payload[field];
      // Treat null, undefined, empty string, or empty array as invalid
      return (
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.every((v) => v == null)) || // handles [null], [], etc.
        (typeof value === "string" && value.trim() === "")
      );
    };

    // Find the first missing field
    const firstInvalidField = requiredFields.find(isFieldInvalid);

    if (firstInvalidField) {
      enqueueSnackbar(fieldValidation[firstInvalidField], { variant: "error" });
      return;
    }

    // console.log("record", record);
    // console.log("payload", payload);
    if (record.actionItemCreated === true) {
      const result = await axios.patch(
        `/api/actionitems/updateActionItem/${editId}`,
        payload
      );
      if (result.status === 200 || result.status === 201) {
        enqueueSnackbar("Submitted Edited Data", {
          variant: "success",
        });
        setEditingKey(null);
      }
    } else {
      // console.log("inside ekse");
      if (record?.applicable) {
        // console.log("inside if");
        // Proceed with API call only if 'applicable' is true
        try {
          const result = await axios.post(
            "/api/actionitems/createActionItem",
            payload
          );
          // console.log("Api is called >>>>>>>>>>>>>>>>>>>>");
          if (result.status === 200 || result.status === 201) {
            const outcomedata = {
              id: result.data._id,
              cause: record.rca,
              applicable: true,
              correctiveAction: payload.title,
              remarks: payload.remarks,
              key: record.key,
            };
            setTimeout(() => {
              setOutcome((prevOutcome) => {
                const existingIndex = prevOutcome.findIndex(
                  (item: any) =>
                    item.cause.trim().toLowerCase() ===
                    outcomedata.cause.trim().toLowerCase()
                );

                const updatedOutcome =
                  existingIndex !== -1
                    ? [
                        ...prevOutcome.slice(0, existingIndex),
                        outcomedata,
                        ...prevOutcome.slice(existingIndex + 1),
                      ]
                    : [...prevOutcome, outcomedata];

                callOutcomeApiwithArg(updatedOutcome);

                return updatedOutcome;
              });
            }, 200);
            // setOutcomeApicall(true);
            enqueueSnackbar("Data Saved", { variant: "success" });
            setEditingKey(null);
          }
        } catch (error) {
          enqueueSnackbar("Failed to save data. Please try again.", {
            variant: "error",
          });
        }
      } else {
        // Handle non-applicable records without API call
        // getTableData();

        const outcomedata = {
          id: record?.id,
          cause: record.rca,
          applicable: false,
          correctiveAction: payload.title,
          remarks: payload.remarks,
          key: record.key,
        };
        setOutcome((prevOutcome) => {
          const existingIndex = prevOutcome.findIndex(
            (item: any) =>
              item.cause.trim().toLowerCase() ===
              outcomedata.cause.trim().toLowerCase()
          );

          const updatedOutcome =
            existingIndex !== -1
              ? [
                  ...prevOutcome.slice(0, existingIndex),
                  outcomedata,
                  ...prevOutcome.slice(existingIndex + 1),
                ]
              : [...prevOutcome, outcomedata];

          callOutcomeApiwithArg(updatedOutcome);

          return updatedOutcome;
        });
        setOutcomeApicall(true);
        enqueueSnackbar("Data Saved", { variant: "success" });
        setEditingKey(null);
      }
    }
  };

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const isRowEditing = (record: any) => record.key === editingKey;

  const handleEdit = (key: string) => {
    setEditingKey(key);
  };

  const callOutcomeApi = async () => {
    try {
      let payload = {
        outcome: outcome,
      };
      let formattedReferences: any = [];
      const result = await axios.patch(
        `/api/cara/updateCaraForOutcome/${id}`,
        payload
      );

      if (refsData && refsData.length > 0) {
        formattedReferences = refsData.map((ref: any) => ({
          refId: ref.refId,
          organizationId: userDetail?.organizationId,
          type: ref.type,
          name: ref.name,
          comments: ref.comments,
          createdBy: userDetail.firstName + " " + userDetail.lastName,
          updatedBy: null,
          link: ref.link,
          refTo: id,
        }));
      }
      // console.log("formattedRef", formattedReferences);
      const refs = await axios.put("/api/refs/bulk-update", {
        refs: formattedReferences,
        id: id,
      });

      if (result.status === 200 || result.status === 201) {
        // setOutcomeApicall(false);
        getTableData();
      }
    } catch (error) {}
  };
  const callOutcomeApiwithArg = async (outcomeupdated: any) => {
    let payload = {
      outcome: outcomeupdated,
    };
    const result = await axios.patch(
      `/api/cara/updateCaraForOutcome/${id}`,
      payload
    );

    if (result.status === 200 || result.status === 201) {
      // setOutcomeApicall(false);
      getTableData();
    }
  };

  const columns = [
    {
      title: "Identified RCA from Why-Why",
      dataIndex: "rca",
      key: "rca",
    },
    {
      title: "Corrective Action",
      dataIndex: "title",
      key: "title",
      render: (_: any, record: any) => (
        <TextArea
          autoSize={{ minRows: 1 }}
          value={record.title}
          onChange={(e) => handleChange(record.key, "title", e.target.value)}
          disabled={!isRowEditing(record)}
          style={{ color: "black" }}
          className={classes.textArea}
        />
      ),
    },
    {
      title: "Corrective Action Applicable?",
      dataIndex: "applicable",
      key: "applicable",
      render: (_: any, record: any) => (
        <Checkbox
          checked={record.applicable}
          onChange={(e) =>
            handleChange(record.key, "applicable", e.target.checked)
          }
          disabled={!isRowEditing(record) || record.applicableDisabled}
          className={classes.checkbox}
        />
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      render: (_: any, record: any) => (
        <TextArea
          autoSize={{ minRows: 1 }}
          value={record.remarks}
          onChange={(e) => handleChange(record.key, "remarks", e.target.value)}
          disabled={!isRowEditing(record)}
          style={{ color: "black" }}
          className={classes.textArea}
        />
      ),
    },
    {
      title: "Responsible Person",
      dataIndex: "owner",
      key: "owner",
      width: 250,
      render: (_: any, record: any) => (
        <Select
          showSearch
          value={record.owner?.id}
          onChange={(value) => {
            const selectedUser = userOptions.find(
              (user: any) => user.id === value
            );
            handleChange(record.key, "owner", selectedUser);
          }}
          className={classes.selectField}
          disabled={!record.applicable || !isRowEditing(record)}
          filterOption={(input: any, option: any) =>
            (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
          }
        >
          {userOptions.map((dept: any) => (
            <Option key={dept.id} value={dept.id}>
              {dept.username}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Target Date",
      dataIndex: "targetDate",
      key: "targetDate",
      render: (_: any, record: any) => (
        <DatePicker
          value={
            record.targetDate ? dayjs(record.targetDate, "YYYY-MM-DD") : null
          }
          onChange={(date) =>
            handleChange(
              record.key,
              "targetDate",
              date ? date.format("YYYY-MM-DD") : null
            )
          }
          disabled={!record.applicable || !isRowEditing(record)}
          format="DD-MM-YYYY"
          className={classes.datePicker}
          style={{ minWidth: "130px" }}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actual Completion Date",
      dataIndex: "activityDate",
      key: "activityDate",
      render: (_: any, record: any) => (
        <DatePicker
          value={
            record.activityDate
              ? dayjs(record.activityDate, "YYYY-MM-DD")
              : null
          }
          onChange={(date) =>
            handleChange(
              record.key,
              "activityDate",
              date ? date.format("YYYY-MM-DD") : null
            )
          }
          disabled={!record.applicable || !isRowEditing(record)}
          format="DD-MM-YYYY"
          className={classes.datePicker}
          style={{ minWidth: "130px" }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) =>
        isRowEditing(record) ? (
          <Button
            icon={
              <FaCheckCircle style={{ color: "#00cc00", fontSize: "20px" }} />
            }
            onClick={() => handleSave(record)}
          ></Button>
        ) : (
          <Button
            icon={
              <RiEdit2Line style={{ color: "#595959", fontSize: "20px" }} />
            }
            onClick={() => handleEdit(record.key)}
            disabled={
              readMode ||
              formdata?.status === "Open" ||
              formdata?.status === "Analysis_In_Progress" ||
              formdata?.status === "Draft" ||
              formdata?.status === "Closed" ||
              formdata?.status === "Accepted" ||
              formdata?.status === "Rejected" ||
              formdata?.status === ""
            }
          ></Button>
        ),
    },
  ];

  return (
    <>
      <div className={classes.IsNotContainer}>
        <div className={classes.textContainer}>
          <p className={classes.IsNotText}>Corrective Action</p>
          {/* <p className={classes.text}>
            {" "}
            Perform Why-Why for the Causes Selected
          </p> */}
        </div>
      </div>
      <div className={classes.tableContainer} style={{ marginTop: "20px" }}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
          className={classes.documentTable}
        />
      </div>
    </>
  );
};

export default CorrectiveAction;
