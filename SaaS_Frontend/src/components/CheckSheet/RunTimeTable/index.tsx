import React, { useEffect, useState } from "react";
import { Button, DatePicker, Select, Table, Tooltip } from "antd";
import axios from "apis/axios.global";
import { useNavigate } from "react-router-dom";
import useStyle from "./style";
import YearComponent from "components/Yearcomponent";
import getYearFormat from "utils/getYearFormat";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { MdOutlineDeleteForever, MdPostAdd } from "react-icons/md";
import EditIcon from "../../../assets/icons/Edit.svg";
import { IconButton } from "@material-ui/core";

const { RangePicker } = DatePicker;
const RunTimeTable = () => {
  const classes = useStyle();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [tableList, setTableList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<any>();
  const [templateList, setTemplateList] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<any>([]);
  const [selectedIds, setSelectedIds] = useState<any>("");

  useEffect(() => {
    getyear();
    getTemplates();
  }, []);

  const getTemplates = async () => {
    try {
      const res = await axios.get(
        "api/auditchecksheet/getAuditChecksheetTemplates"
      );
      const data = res.data?.map((ele: any) => ({
        label: ele?.title,
        value: ele?._id,
      }));
      setTemplateList(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  useEffect(() => {
    // if (currentYear !== undefined) {
    //   getListOfTables();
    // }
    // if (selectedId) {
    //   getListOfTables();
    // }
    // if (selectedDate) {
    //   getListOfTables();
    // }
    getListOfTables();
  }, [currentYear, selectedIds, selectedDate]);

  const resetButton = () => {
    setSelectedIds("");
    setSelectedDate([]);
    getListOfTables();
  };

  const getListOfTables = async () => {
    try {
      const res = await axios.get(
        `/api/auditchecksheet/getAuditChecksheets?year=${currentYear}&ids=${selectedIds}&dates=${selectedDate}`
      );
      setTableList(res.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleTemplateChange = async (e: any, value: any, type: any) => {
    if (type === "select") {
      setSelectedIds(e);
    } else {
      setSelectedDate(value);
    }
  };
  // const onSearch = (value: string) => {
  //   console.log("search:", value);
  // };

  const filterOption: any = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleViewClick = (id: string, mode: any) => {
    setSelectedId(id);
    navigate(`/runTimeChecksheets/${id}`, {
      state: {
        mode: mode,
      },
    });
  };

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  const copyTemplateData = async (data: any) => {
    try {
      const text = data?.title;
      const baseText = text.split(" - ")[0]; // Extracts "CH04"
      const newText = baseText + " - " + dayjs().format("DD/MM/YYYY HH:mm:ss");
      const valuesData = data?.tableContentValues?.map((ele: any) => {
        return {
          ...ele,
          cells: ele?.cells.map((cell: any) => ({
            ...cell,
            value:
              cell.columnType === "value" || cell.columnType === "remarks"
                ? ""
                : cell.value,
          })),
        };
      });
      const finalFormData = {
        title: newText,
        auditChecksheetTemplateId: data?.auditChecksheetTemplateId,
        formHeaderContents: data?.formHeaderContents,
        tableHeader: data?.tableHeader,
        tableContentValues: valuesData,
        formHeaderTitle: data?.formHeaderTitle,
        tableHeaderTitle: data?.tableHeaderTitle,
        formLayout: data?.formLayout,
      };
      const response = await axios.post(
        `/api/auditchecksheet/createAuditChecksheet`,
        finalFormData
      );
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(`Created successfully!`, {
          variant: "success",
        });
        navigate(`/runTimeChecksheets/${response?.data?._id}`, {
          state: {
            mode: false,
          },
        });
      }
    } catch (err) {
      // console.log("err", err);
    }
  };

  const handleDelete = (id: string) => {};

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (_: any, record: any) => (
        <Tooltip title={record.title}>
          <div
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
              width: 200,
            }}
          >
            <div
              onClick={() => {
                handleViewClick(record._id, true);
              }}
            >
              {record.title}
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(), // Show only the date
    },
    {
      title: "Actions",
      dataIndex: "_id",
      key: "actions",
      render: (_id: string, record: any) => (
        <div style={{ display: "flex", gap: "12px" }}>
          <IconButton
            style={{ padding: "0px", margin: "0px" }}
            onClick={() => {
              handleViewClick(record._id, false);
            }}
          >
            <img
              src={EditIcon}
              alt="icon"
              style={{ width: "17px", height: "17px" }}
            />
          </IconButton>

          <Tooltip title="Delete">
            <MdOutlineDeleteForever
              style={{ padding: "0px", margin: "0px", fontSize: "18px" }}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>

          <Tooltip title="Make a Copy">
            <MdPostAdd
              style={{ padding: "0px", margin: "0px", fontSize: "18px" }}
              onClick={() => {
                copyTemplateData(record);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          padding: "0px 10px 10px 10px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div>
            <Select
              // mode="multiple"
              style={{ width: 250 }}
              value={selectedIds}
              onChange={(e: any, value: any) => {
                setSelectedIds(e);
              }}
              placeholder="Select CheckSheet"
              showSearch
              optionFilterProp="children"
              //  onSearch={onSearch}
              filterOption={filterOption}
              options={templateList}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
            />
          </div>
          <div>
            <RangePicker
              style={{ width: "100%" }}
              format="DD-MM-YYYY"
              // value={selectedDate}
              onChange={(e: any, dateStrings: any) => {
                setSelectedDate(dateStrings);
              }}
            />
          </div>
          <div>
            <YearComponent
              currentYear={currentYear}
              setCurrentYear={setCurrentYear}
            />
          </div>
          <div>
            <Button
              style={{ backgroundColor: "#003059", color: "white" }}
              onClick={() => {
                resetButton();
              }}
            >
              Reset
            </Button>
          </div>
        </div>
        <Button
          onClick={() => {
            navigate(`/runTimeChecksheets`);
          }}
          style={{ backgroundColor: "#003059", color: "white" }}
        >
          Create
        </Button>
      </div>
      <div className={classes.tableContainer}>
        <Table
          dataSource={tableList}
          columns={columns}
          rowKey="_id"
          pagination={false}
          scroll={{ y: 480 }}
        />
      </div>
    </div>
  );
};

export default RunTimeTable;
