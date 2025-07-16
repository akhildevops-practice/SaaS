import { useEffect, useRef, useState } from "react";
import {
  MdAddCircle,
  MdCheckBox,
  MdExpandMore,
  MdOutlineCheckCircle,
} from "react-icons/md";
import {
  Select,
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Col,
  Row,
  Popconfirm,
  Tooltip as AntdTooltip,
  Tabs,
  Descriptions,
} from "antd";
import EditImgIcon from "assets/documentControl/Edit.svg";
import axios from "apis/axios.global";
import { Gantt, Willow, WillowDark } from "wx-react-gantt";
import "wx-react-gantt/dist/gantt.css";
import "./styles.css";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { getAllNPDListDrop } from "apis/npdApi";

import dayjs from "dayjs";
import TabPane from "antd/es/tabs/TabPane";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import useStyles from "../GanttChart/styles";
import TextArea from "antd/es/input/TextArea";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import { useSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router-dom";

import checkRoles from "utils/checkRoles";
// import TemplateComponent from "./taskTemplate";
interface FormData {
  text: string;
  type: string;
  progress: number;
  duration: number;
  parentName: string;
  progressUpdate: [];
  dptId: string;
  status: string;
  picId: [];
  evidence: [];
  start: any;
  end: any;
  baseStart: any;
  baseEnd: any;
  id: any;
  _id: any;
  remarks: any;
}
const { RangePicker } = DatePicker;

const GanttIndex = () => {
  const { Option } = Select;
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const classes = useStyles();
  const apiRef = useRef<any>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [npdOptions, setNpdOptions] = useState<any[]>([]);
  const [selectedNpd, setSelectedNpd] = useState<any>();
  const [tasks, setTasks] = useState<any>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [parentTask, setParentTask] = useState<any>(null); // State to hold parent task
  const [form] = Form.useForm<FormData>();
  const [duration, setDuration] = useState<number>(0);
  const [load, setLoad] = useState<Boolean>(false);
  const [pa, setPa] = useState<any>([]);
  const [deptUsers, setdeptUsers] = useState<any>([]);
  const [progressUpdate, setProgressUpdate] = useState<any>([]);
  const uniqueId = generateUniqueId(22);
  const navigate = useNavigate();
  const [readMode, setReadMode] = useState<boolean>();
  const [editButtonStatusProgress, setEditButtonStatusProgress] =
    useState(false);
  const [editProgressEditId, setEditProgressEditId] = useState("");
  const id = useParams();
  const [scrollToTaskId, setScrollToTaskId] = useState<string | null>(null);
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetail?.location?.id;
  const [ganttReady, setGanttReady] = useState(false);
  useEffect(() => {
    dropDownValueNpdList();
    getUsersOfOrg();
    getProjectAdmins();
    if (!!id) {
      setSelectedNpd({ value: id?.id });
    }
  }, []);

  useEffect(() => {
    if (selectedNpd) {
      getData();
    }
  }, [selectedNpd, load]);
  // console.log("current task", apiRef.current, selectedNpd);

  useEffect(() => {
    if (apiRef.current && selectedNpd) {
      // console.log("inside here", apiRef.current);
      const api = apiRef.current;
      api.intercept("show-editor", (data: any) => {
        return false;
      });
      api.intercept("add-task", (data: any) => {
        // console.log("inside here add task", data);
        openAddTaskModal(data);
      });

      apiRef.current.on("add-task", (ev: any) => {
        // console.log("inside here2", ev);
        openAddTaskModal(ev);
      });
      // if (apiRef.current) {
      api.on("update-task", (event: any) => {
        // console.log("event:", event);
        // console.log("start date", event.task.start);
        handleStartEndDateChange(event);
      });
      // }
      api.on("move-task", (ev: any) => {
        // console.log("moved task", ev);
        handleMoveTask(ev);
      });
      api.on("select-task", (ev: any) => {
        // console.log("Task selected:", ev);

        openEditor(ev);
      });
    }
  }, [apiRef.current]);

  const handleMoveTask = async (task: any) => {
    // console.log("inside move", task);
    try {
      if (task?.inProgress === false) {
        const res = await axios.patch(
          `/api/npd/moveTaskForSvar/${task.id}?parent=${task.target}`
        );
        if (res?.status === 200) {
          setLoad(true);
        }
      }
    } catch (error) {}
  };
  const handleStartEndDateChange = async (task: any) => {
    // console.log("inside date", task);
    try {
      const res = await axios.patch(
        `/api/npd/updateDatesForTask/${task.id}?start=${task?.task?.start}&end=${task?.task?.end}`
      );
      if (res?.status === 200) {
        enqueueSnackbar("Dates updated successfully", { variant: "success" });
        // setLoad(true);
      }
    } catch (error) {}
  };

  const dropDownValueNpdList = () => {
    getAllNPDListDrop()?.then((response: any) => {
      setNpdOptions(response?.data);
    });
  };

  const getData = async (highlightTaskId?: string) => {
    try {
      const res = await axios.get(
        `/api/npd/getNPDbyIdForSvar/${selectedNpd?.value}`
      );
      if (res.data) {
        const baseStartDate = new Date();
        const updatedTasks = res.data.map((task: any, index: number) => {
          // Use new Date() for reliable comparison without time component
          let startDate = task.baseStart
            ? new Date(task.baseStart)
            : new Date(baseStartDate);
          let endDate = task.baseEnd
            ? new Date(task.baseEnd)
            : new Date(startDate);

          // If start is not provided, calculate startDate based on the index
          if (!task.baseStart) {
            startDate.setDate(startDate.getDate() + index * 1); // Calculate start date
          }

          // If end is not provided, calculate endDate based on startDate
          if (!task.baseEnd) {
            endDate.setDate(startDate.getDate() + 1); // Set end date 5 days after start date
          }

          if (endDate < startDate) {
            endDate = new Date(startDate); // Ensure endDate is at least the same as startDate
            endDate.setDate(startDate.getDate() + 1); // Set end date 5 days after start date
          }

          // Calculate duration in days
          const duration = task.duration
            ? task.duration
            : Math.ceil(
                (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
              ); // Duration in days
          let statusIcon = "";
          switch (task.status) {
            case "Delayed":
              statusIcon = "🔴";
              break;
            case "In Progress":
              statusIcon = "🟡";
              break;
            case "Completed":
              statusIcon = "🟢";
              break;
            default:
              statusIcon = "⚪";
          }

          return {
            ...task,
            // start: startDate,
            // end: endDate,
            baseStart: startDate,
            baseEnd: endDate,
            // start: dayjs().format("YYYY-MM-DD"),
            // end: dayjs().add(1, "day").format("YYYY-MM-DD"),
            duration: duration,
            base_start: startDate,
            base_end: endDate,

            column_start: dayjs(startDate).format("DD-MM-YYYY"),
            column_end: dayjs(endDate).format("DD-MM-YYYY"),
            column_astart: task?.start
              ? dayjs(task?.start).format("DD-MM-YYYY")
              : "",
            column_aend: task?.end ? dayjs(task?.end).format("DD-MM-YYYY") : "",
            statusDisplay: `${statusIcon} ${
              task.status ? task.status : "Yet to Start"
            }`,
          };
        });

        setTasks(updatedTasks);
        // setGanttReady(false);
        if (highlightTaskId) {
          setScrollToTaskId(highlightTaskId);
        }
      }
    } catch (error) {
      // console.error("Error fetching NPD data:", error);
    }
  };
  const getProjectAdmins = async () => {
    const result = await axios.get(`/api/configuration`);
    // console.log("result", result);
    // console.log("result?.data in reg npd nav bar", result.data);
    if (result?.data[0]?.pmUserData) {
      setPa(result?.data[0]?.pmUserData);
    }
  };
  const handleProgressDateChange = (date: dayjs.Dayjs | null) => {
    // console.log("here");
    form.setFieldsValue({
      end: date,
    });
  };
  const handleProgressStartDateChange = (date: dayjs.Dayjs | null) => {
    form.setFieldsValue({
      start: date,
    });
  };
  // Function to open the modal for adding a task
  const openAddTaskModal = (ev: any) => {
    // Capture the parent task from the event
    // console.log("ev", ev);
    form.resetFields();
    setParentTask(ev.target); // Assuming the parent task is available in the event object
    setCurrentTask(null); // Ensure that the modal is empty for a new task
    setIsModalVisible(true);
  };
  // console.log("tasks", tasks);
  const handleDelete = async () => {
    try {
      // console.log("currentTask", currentTask);
      if (currentTask?.id) {
        const res = await axios.delete(
          `/api/npd/deleteTaskForSvar/${currentTask?.id}`
        );
        if (res.status == 200) {
          closeEditor();
          form.resetFields();
          setLoad(true);
        }
      }
    } catch (error) {}
  };
  // console.log("formdata", currentTask);
  // Open modal for editing task
  const openEditor = async (task: any) => {
    try {
      const res = await axios.get(`/api/npd/getTaskForSvar/${task?.id}`);
      if (res.data) {
        if (
          res?.data?.picId?.includes(userDetail.id) ||
          isMCOE ||
          pa.some((item: any) => item.id === userDetail.id)
        ) {
          setReadMode(false);
        } else {
          setReadMode(true);
        }
        form.setFieldsValue({
          baseStart: res?.data?.baseStart ? dayjs(res?.data?.baseStart) : null,
          baseEnd: res?.data?.baseEnd ? dayjs(res?.data?.baseEnd) : null,
          status: res?.data?.status,
        });
        setCurrentTask(res.data);

        setIsModalVisible(true);
      }
    } catch (error) {}
  };
  // console.log("readMode", readMode);
  const addMoreProgressData = () => {
    let dataProgress = {
      id: uniqueId,
      updatedDate: "",
      taskProgress: "",
      status: "",
      progressComment: "",
      addButtonStatus: false,
      addHandlerButtonStatus: false,
    };

    setProgressUpdate([dataProgress, ...progressUpdate]);
  };
  const addValuesProgressTable = (ele: any, name: any, value: any) => {
    // if (name === "taskProgress") {
    //   form.setFieldsValue({ progress: value });
    // }
    // if (name === "updatedDate") {
    //   form.setFieldsValue({ end: value });
    // }
    if (name === "status") {
      form.setFieldsValue({ status: value });
    }

    const update = progressUpdate?.map((item: any) => {
      if (item.id === ele.id) {
        return {
          ...item,
          [name]: value,
        };
      }
      return item;
    });
    setProgressUpdate(update);
  };
  // console.log("progress update", progressUpdate);
  const updateProgressValues = (ele: any) => {
    if (ele.progressComment === "") {
      enqueueSnackbar(`Please Enter Progress Version`, {
        variant: "error",
      });
    } else if (ele.updatedDate === "") {
      enqueueSnackbar(`Please  Select Updation Date`, {
        variant: "error",
      });
    } else if (ele.taskProgress === "") {
      enqueueSnackbar(`Please Enter Task Progress`, {
        variant: "error",
      });
    }
    //  else if (ele.status === "") {
    //   enqueueSnackbar(`Please Enter Task Status`, {
    //     variant: "error",
    //   });
    // }
    else {
      const update = progressUpdate?.map((item: any) => {
        if (item.id === ele.id) {
          return {
            ...item,
            buttonStatus: true,
            addHandlerButtonStatus: true,
          };
        }
        return item;
      });
      setProgressUpdate(update);
    }
  };

  const updateEditProgressValue = (ele: any) => {
    setEditButtonStatusProgress(true);
    setEditProgressEditId(ele.id);
    const update = progressUpdate?.map((item: any) => {
      if (item.id === ele.id) {
        return {
          ...item,
          buttonStatus: false,
        };
      }
      return item;
    });
    setProgressUpdate(update);
  };
  const updateEditUpdateProgressValue = (ele: any) => {
    setEditButtonStatusProgress(false);
    setEditProgressEditId("");
    if (ele.progressComment === "") {
      enqueueSnackbar(`Please Enter Progress Version`, {
        variant: "error",
      });
    } else if (ele.updatedDate === "") {
      enqueueSnackbar(`Please  Select Updation Date`, {
        variant: "error",
      });
    } else if (ele.taskProgress === "") {
      enqueueSnackbar(`Please Enter Task Progress`, {
        variant: "error",
      });
    } else if (ele.status === "") {
      enqueueSnackbar(`Please Enter Task Status`, {
        variant: "error",
      });
    } else {
      const update = progressUpdate?.map((item: any) => {
        if (item.id === ele.id) {
          return {
            ...item,
            buttonStatus: true,
          };
        }
        return item;
      });
      setProgressUpdate(update);
    }
  };

  const closeEditor = () => {
    setIsModalVisible(false);
    setCurrentTask(null); // Clear the current task
    setParentTask(null); // Clear the parent task
    setReadMode(undefined);
  };

  const handleFormSubmit = async (values: any) => {
    // console.log("sumit called");
    if (!!currentTask) {
      const actualStart = progressUpdate.length
        ? new Date(
            Math.min(
              ...progressUpdate.map((entry: any) =>
                new Date(entry.updatedDate).getTime()
              )
            )
          )
        : null;
      if (
        form.getFieldValue("status") === "Completed" &&
        (form.getFieldValue("end") === undefined ||
          form.getFieldValue("end") === null)
      ) {
        enqueueSnackbar("Please select end date if the task is completed", {
          variant: "error",
        });
        return;
      }
      const taskDetails = {
        ...currentTask,
        text: values.text,
        type: values.type,
        parent: currentTask.parent,
        start: actualStart,
        end: form.getFieldValue("end"),
        baseStart: form.getFieldValue("baseStart"),
        baseEnd: form.getFieldValue("baseEnd"),
        status: form.getFieldValue("status"),
        duration: values.duration,
        progress: values.progress || 0,
        npdId: selectedNpd?.value,
        picId: values.picId,
        evidence: values.evidence,
        dptId: form.getFieldValue("dptId"),
        progressData: progressUpdate,
      };

      const response = await axios.put(
        `/api/npd/updateTaskForSvar/${currentTask._id}`,
        { taskDetails }
      );
      // setScrollToTaskId(currentTask);
      if (response?.data?.status === 500 || response?.data?.status === 500) {
        enqueueSnackbar(
          response?.data?.message ||
            "Please ensure overall progress is equal tp 100% before submitting.",
          {
            variant: "error",
          }
        );
        return;
      } else if (response.status === 200) {
        getData(currentTask?._id);

        form.resetFields();
        setProgressUpdate([]);
      }
    } else {
      const taskDetails = {
        text: values.text,
        type: form.getFieldValue("type"),
        parent: parentTask, // Use the parent task if available
        start: form.getFieldValue("start"),
        end: form.getFieldValue("end"),
        baseStart: form.getFieldValue("baseStart"),
        baseEnd: form.getFieldValue("baseEnd"),
        duration: values.duration,
        progress: values.progress || 0,
        npdId: selectedNpd?.value,
        picId: values.picId,
        evidence: values.evidence,
        progressData: progressUpdate,
        dptId: form.getFieldValue("dptId"),
        status: form.getFieldValue("status"),
      };

      const response = await axios.post(
        `/api/npd/addTaskForSvar/${selectedNpd?.value}`,
        { taskDetails }
      );

      if (response.status === 200 || response?.status == 201) {
        // setLoad(true);
        setProgressUpdate([]);
        form.resetFields();
      }
    }

    closeEditor();
  };
  // console.log("type of progresupdate", typeof progressUpdate);

  useEffect(() => {
    if (!!currentTask) {
      form.setFieldsValue({
        text: currentTask.text,
        type: currentTask.type,
        progress: currentTask.progress,
        duration: currentTask.duration,
        picId: currentTask.picId,
        dptId: currentTask.dptId,
        evidence: currentTask.evidence,
        id: currentTask.id,
        _id: currentTask._id,
        parentName: currentTask.parentName,
        start: currentTask.start ? dayjs(currentTask.start) : null,
        end: currentTask.end ? dayjs(currentTask.end) : null,
      });
      setDuration(currentTask?.duration);
      setProgressUpdate(
        currentTask?.progressData ? currentTask?.progressData : []
      );
    }
  }, [currentTask, form]);

  const getUsersOfOrg = async () => {
    try {
      const res = await axios.get(`/api/kpi-report/getAll`);
      if (res?.data) {
        setdeptUsers(res?.data);
      }
    } catch (error) {
      // console.log("err", error);
      setdeptUsers([]);
    }
  };
  const filterDeptOption = (input: any, option: any) => {
    return option.children.toLowerCase().includes(input.toLowerCase());
  };

  // const handleDateChange = (values:any) => {
  //   // const defaultRequestValues = date?.map((dateString: any) =>
  //   //   moment(dateString, "DD-MM-YYYY")
  //   // );
  //   if (!values || !Array.isArray(values)) {
  //     // Handle the case where values is not defined or not an array
  //     enqueueSnackbar("select a valid date range", { variant: "error" });
  //     return;
  //   }
  //   console.log("values",values)
  //   const [start, end] = values; // Destructure values to get the start and end moments
  //   const startDate = moment(start);
  //    const endDate = moment(end);
  //    form.setFieldsValue({ start: startDate, end: endDate });
  //   // const startDate = form.getFieldValue("start");
  //   // const endDate = form.getFieldValue("end");
  //   // const startDate = defaultRequestValues[0];
  //   // const endDate = defaultRequestValues[1];
  //   if (startDate && endDate) {
  //     const computedDuration = calculateDuration(startDate, endDate);
  //     setDuration(computedDuration);
  //     form.setFieldsValue({ duration: computedDuration });
  //   }
  // };

  const handleDateChange = (values: any) => {
    if (!values || !Array.isArray(values) || values.length !== 2) {
      enqueueSnackbar("Select a valid date range", { variant: "error" });
      return;
    }
    // console.log("values", values);

    const [start, end] = values;

    if (!dayjs(start).isValid() || !dayjs(end).isValid()) {
      enqueueSnackbar("Invalid date format", { variant: "error" });
      return;
    }

    if (dayjs(start).isAfter(end)) {
      enqueueSnackbar("Start date cannot be after end date", {
        variant: "error",
      });
      return;
    }

    form.setFieldsValue({ baseStart: dayjs(start), baseEnd: dayjs(end) });
    const computedDuration = calculateDuration(start, end); // Assuming it works with Day.js
    setDuration(computedDuration);
    form.setFieldsValue({ duration: computedDuration });
  };

  const calculateDuration = (startDate: any, endDate: any): number => {
    const start = dayjs(startDate)?.startOf("day");
    const end = dayjs(endDate)?.endOf("day");
    return end?.diff(start, "day");
  };

  const filterOption: any = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const columns = [
    {
      id: "text",
      header: "Task name",
      //flexgrow: 2,
      // width: 309,
      style: { color: "blue", fontWeight: "bold", paddingLeft: "10px" },
    },
    {
      id: "picUsernames",
      header: "PIC",
      style: { color: "blue", fontWeight: "bold", paddingLeft: "10px" },
    },
    {
      id: "column_start",
      header: "Planned Start",
      flexGrow: 1,
      style: { color: "blue", fontWeight: "bold", paddingLeft: "10px" },
      // template: (date: any) => {
      //   return date ? date?.toLocaleDateString() : "";
      // },
    },
    {
      id: "column_end",
      header: "Planned End",
      flexGrow: 1,
      style: { color: "blue", fontWeight: "bold", paddingLeft: "10px" },
      // template: (date: any) => {
      //   return date ? date?.toLocaleDateString() : "";
      // },
    },
    {
      id: "statusDisplay",
      header: "Status",
      flexGrow: 1,
      style: { color: "blue", fontWeight: "bold", paddingLeft: "10px" },
    },

    {
      id: "column_astart",
      header: "Actual Start",
      flexGrow: 1,
      style: { color: "blue", fontWeight: "bold", paddingLeft: "10px" },
    },
    {
      id: "column_aend",
      header: "Actual End",
      flexGrow: 1,
      style: { color: "blue", fontWeight: "bold", paddingLeft: "10px" },
    },

    {
      id: "action",
      header: "",
      width: 50,
      align: "center",
      style: { backgroundColor: "#ffeb3b" },
    },
  ];
  const taskTypes = [
    { id: "task", label: "NPD" },
    { id: "progress", label: "Activity" },
    { id: "milestone", label: "Milestone" },
    { id: "summary", label: "Department" },
    { id: "urgent", label: "Sub-Activity" },
    { id: "category", label: "Category" },
  ];

  const splitterSettings = {
    position: "70%",
  };
  // console.log("currentTask", id);

  return (
    <div>
      <div style={{ marginTop: "20px" }}>
        {/* Container for Select and Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Dropdown with fixed width */}
          <div style={{ flexShrink: 0 }}>
            {" "}
            {/* Prevent shrinking */}
            <label style={{ marginBottom: "8px", display: "block" }}>
              Select NPD
            </label>
            <Select
              placeholder="Select NPD"
              value={selectedNpd}
              style={{ width: "400px", color: "black" }}
              size="middle"
              showSearch
              optionFilterProp="children"
              filterOption={filterOption}
              onChange={(e: any, value: any) => setSelectedNpd(value)}
              options={npdOptions}
            />
          </div>
          <div>
            <Box display="flex" alignItems="center">
              <Box width={16} height={16} bgcolor="#00bcd4" mr={1} />
              <Typography variant="body2" style={{ paddingRight: "5px" }}>
                Actual
              </Typography>

              <Box
                width={16}
                height={16}
                bgcolor="#3983eb"
                mr={1}
                padding={"5px"}
              />
              <Typography variant="body2">Planned</Typography>
            </Box>
          </div>
          {!!id.id && (
            <Button
              type="default"
              onClick={() => {
                navigate("/NPD");
              }}
              style={{
                marginLeft: "20px",
                backgroundColor: "#003059",
                color: "white",
              }}
            >
              Exit
            </Button>
          )}
        </div>
      </div>
      <div className="demo" style={{ padding: "20px" }}>
        <Box height="1000px" >
          <WillowDark>
            <Gantt
              init={(api: any) => {
                apiRef.current = api;
                // setGanttReady(true);
              }}
              // cellHeight={45}
              ref={apiRef}
              tasks={tasks}
              columns={columns}
              taskTypes={taskTypes}
              baselines={true}
              // taskTemplate={TemplateComponent}
              // splitterSettings={splitterSettings}
              // activeTask={currentTask?.id}
              // expandAll={true}
            />
          </WillowDark>
        </Box>
      </div>
      <Modal
        title={currentTask ? "Edit Task" : "Add Task"}
        width={900}
        visible={isModalVisible}
        onCancel={closeEditor}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            text: currentTask?.text,
            type: currentTask?.type,
            progress: currentTask?.progress,
            duration: currentTask?.duration,
            id: currentTask?.id,
            picId: currentTask?.picId,
            dptId: currentTask?.dptId,
            parentName: currentTask?.parentName,
            status: currentTask?.status,
            start: currentTask?.start,
            end: currentTask?.end,
            baseStart: currentTask?.baseStart
              ? dayjs(currentTask.baseStart)
              : null,
            baseEnd: currentTask?.baseEnd ? dayjs(currentTask.baseEnd) : null,
          }}
          onFinish={handleFormSubmit}
        >
          <Tabs defaultActiveKey="1">
            {/* Basic Info Tab */}
            <TabPane tab="Basic Info" key="1">
              <Form.Item
                label="Task Name"
                name="text"
                rules={[{ required: true, message: "Please enter task name" }]}
              >
                <Input disabled={readMode} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Task Type"
                    name="type"
                    rules={[
                      { required: true, message: "Please select task type" },
                    ]}
                  >
                    <Select
                      placeholder="Select Task Type"
                      value={form.getFieldValue("type")}
                      disabled={readMode}
                      onChange={(value: string) =>
                        form.setFieldsValue({ type: value })
                      }
                    >
                      {taskTypes?.map((taskType) => (
                        <Select.Option key={taskType.id} value={taskType.id}>
                          {taskType.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Parent Name" name="parentName">
                    <Input value={form.getFieldValue("parentName")} disabled />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    // name="start"
                    label={
                      <>
                        Start Date <span style={{ margin: "0 63px" }}>-</span>
                        End Date
                      </>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please select start date and end date!",
                      },
                    ]}
                  >
                    <RangePicker
                      style={{ width: "100%" }}
                      disabled={readMode}
                      value={[
                        form.getFieldValue("baseStart"),
                        form.getFieldValue("baseEnd"),
                      ]}
                      format="DD-MM-YYYY"
                      onChange={handleDateChange}
                    />
                    {/* <DatePicker
                      format="YYYY-MM-DD"
                      value={form.getFieldValue("start")}
                      onChange={handleDateChange}
                    /> */}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Select Users"
                    name="picId"
                    rules={[
                      {
                        required: true,
                        message: "Please select at least one user",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      disabled={readMode}
                      placeholder="Select Users"
                      value={form.getFieldValue("picId")}
                      onChange={(value) =>
                        form.setFieldsValue({ picId: value })
                      }
                      showSearch
                      filterOption={filterDeptOption}
                      style={{ width: "100%" }}
                    >
                      {deptUsers?.map((user: any) => (
                        <Option key={user.id} value={user.id}>
                          {user.username}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                {/* <Col span={8}>
                  <Form.Item
                    name="end"
                    label="End Date"
                    rules={[
                      { required: true, message: "Please select end date!" },
                    ]}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      value={currentTask?.end ? dayjs(currentTask.end) : null}
                      onChange={handleDateChange}
                    />
                  </Form.Item>
                </Col> */}

                <Col span={12}>
                  <Form.Item
                    name="duration"
                    label="Duration (Days)"
                    rules={[
                      { required: true, message: "Please enter duration" },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      value={form.getFieldValue("duration")}
                      disabled
                    />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Status/Progress Tab */}
            <TabPane tab="Status/Progress" key="2">
              {/* <Form.Item label="Progress" name="progress">
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={currentTask?.progress || 0}
                  onChange={(value) => form.setFieldsValue({ progress: value })}
                />
              </Form.Item> */}
              <div>
                <div style={{ paddingTop: "10px" }}>
                  <div
                    style={{
                      padding: "10px 10px",
                      backgroundColor: "#F7F7FF",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{ backgroundColor: "#fff", borderRadius: "0px" }}
                      className={classes.descriptionLabelStyle}
                    >
                      <Form layout="vertical">
                        <Descriptions
                          bordered
                          size="small"
                          style={{ width: "100%" }}
                          column={{
                            xxl: 2, // or any other number of columns you want for xxl screens
                            xl: 2, // or any other number of columns you want for xl screens
                            lg: 2, // or any other number of columns you want for lg screens
                            md: 1, // or any other number of columns you want for md screens
                            sm: 2, // or any other number of columns you want for sm screens
                            xs: 2, // or any other number of columns you want for xs screens
                          }}
                        >
                          <Descriptions.Item
                            label={
                              <>
                                <strong style={{ color: "red" }}>*</strong>{" "}
                                Status :{" "}
                              </>
                            }
                          >
                            <Form.Item
                              // name="status"
                              rules={[
                                {
                                  required: true,
                                  // message: "Type",
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                placeholder="Select Status"
                                style={{ width: "100%", color: "black" }}
                                // size="large"
                                value={form.getFieldValue("status")}
                                onChange={(e: any) => {
                                  // console.log("e", e);
                                  form.setFieldsValue({ status: e });
                                  // if (e === "Completed") {
                                  //   form.setFieldsValue({ end: dayjs() });
                                  // }
                                  // addDataHandler("status", e);
                                }}
                                options={[
                                  {
                                    value: "In Progress",
                                    label: "In Progress",
                                  },
                                  // { value: "On Hold", label: "On Hold" },
                                  { value: "Completed", label: "Completed" },
                                ]}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <>
                                <strong style={{ color: "red" }}>*</strong>{" "}
                                Percentage of Progress :{" "}
                              </>
                            }
                          >
                            <Form.Item
                              // name="progress"
                              rules={[
                                {
                                  required: true,
                                  // message: "Type",
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <Input
                                value={form.getFieldValue("progress")}
                                type="Number"
                                onChange={(e: any) => {
                                  // addDataHandler("progress", e.target.value);
                                }}
                                disabled
                                // disabled={
                                //   titleModel === "Add"
                                //     ? false
                                //     : selectedData?.taskData?.progressData
                                //         ?.length === 0 &&
                                //       (selectedData?.taskData?.picId?.includes(
                                //         userDetail?.id
                                //       ) ||
                                //         selectedData?.taskData?.pm?.includes(
                                //           userDetail?.id
                                //         ))
                                //     ? false
                                //     : true
                                // }
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <>
                                <strong style={{ color: "red" }}>*</strong>{" "}
                                Actual StartDate :{" "}
                              </>
                            }
                          >
                            <Form.Item
                              // name="start"
                              rules={[
                                {
                                  required: true,
                                  message: "start",
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <DatePicker
                                format="YYYY-MM-DD"
                                value={
                                  form.getFieldValue("start")
                                    ? dayjs(form.getFieldValue("start"))
                                    : form.getFieldValue("baseStart")
                                    ? dayjs(form.getFieldValue("baseStart"))
                                    : null
                                }
                                onChange={handleProgressStartDateChange}
                                disabled={readMode}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <>
                                <strong style={{ color: "red" }}>*</strong>
                                {/* {
                              formData?.progress === 100
                                ? "Actual EndDate"
                                : "Date of Updation :"
                            }{" "} */}
                                Actual EndDate
                              </>
                            }
                          >
                            <Form.Item
                              name="end"
                              rules={[
                                {
                                  required: true,
                                  message: "actualEndDate",
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <DatePicker
                                format="YYYY-MM-DD"
                                value={form.getFieldValue("end")}
                                onChange={handleProgressDateChange}
                                disabled={readMode}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                        </Descriptions>
                      </Form>
                    </div>

                    <div style={{ marginTop: "10px" }}>
                      <Accordion>
                        <AccordionSummary
                          expandIcon={
                            <MdExpandMore style={{ padding: "3px" }} />
                          }
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                          // className={classes.summaryRoot}
                          style={{ margin: "0px", height: "10px" }}
                        >
                          Progress Updation History
                        </AccordionSummary>
                        <AccordionDetails>
                          <div
                            style={{
                              backgroundColor: "#fff",
                              borderRadius: "0px",
                              width: "100%",
                            }}
                            className={classes.tableContainer}
                          >
                            <TableContainer
                              component={Paper}
                              variant="outlined"
                            >
                              <Table>
                                <TableHead
                                  style={{
                                    backgroundColor: "#E8F3F9",
                                    color: "#00224E",
                                    // width: "500px",
                                    // height: "50px",
                                  }}
                                >
                                  <TableRow>
                                    {/* <TableCell
                                style={{
                                  color: "#00224E",
                                  fontWeight: "bold",
                                  padding: "5px",
                                  fontSize: "13px",
                                  width: "40px",
                                }}
                              >
                                P V
                              </TableCell> */}
                                    <TableCell
                                      style={{
                                        color: "#00224E",
                                        fontWeight: "bold",
                                        padding: "5px",
                                        fontSize: "13px",
                                        width: "600px",
                                      }}
                                    >
                                      Status Update
                                    </TableCell>
                                    <TableCell
                                      style={{
                                        color: "#00224E",
                                        fontWeight: "bold",
                                        padding: "5px",
                                        fontSize: "13px",
                                        width: "180px",
                                      }}
                                    >
                                      Updation Date
                                    </TableCell>
                                    <TableCell
                                      style={{
                                        color: "#00224E",
                                        fontWeight: "bold",
                                        padding: "5px",
                                        fontSize: "13px",
                                        width: "100px",
                                      }}
                                    >
                                      Overall Progress
                                    </TableCell>

                                    <TableCell
                                      style={{
                                        color: "#00224E",
                                        fontWeight: "bold",
                                        padding: "5px",
                                        fontSize: "13px",
                                        width: "100px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      Action
                                      {Array.isArray(progressUpdate) &&
                                      progressUpdate.length === 0 &&
                                      progressUpdate?.length === 0 ? (
                                        <Button
                                          style={{
                                            backgroundColor: "#00224E",
                                            color: "#fff",
                                            height: "20px",
                                          }}
                                          disabled={readMode}
                                          onClick={() => {
                                            addMoreProgressData();
                                          }}
                                        >
                                          Add
                                        </Button>
                                      ) : (
                                        ""
                                      )}
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {progressUpdate?.map(
                                    (ele: any, index: any) => {
                                      return (
                                        <TableRow>
                                          {/* <TableCell style={{padding:"5px"}}>
                                      <Input value={ele.progressVersion}  onChange={(e)=>{
                                        addValuesProgressTable(ele, 'progressVersion' , e.target.value)
                                      }} style={{ width: "100%", color: "black" }} disabled={ele.buttonStatus} />
                                    </TableCell> */}
                                          <TableCell style={{ padding: "5px" }}>
                                            <TextArea
                                              rows={1}
                                              placeholder="Enter Comments"
                                              value={ele.progressComment}
                                              maxLength={5000}
                                              style={{
                                                width: "100%",
                                                color: "black",
                                              }}
                                              onChange={(e: any) => {
                                                addValuesProgressTable(
                                                  ele,
                                                  "progressComment",
                                                  e.target.value
                                                );
                                              }}
                                              disabled={ele.buttonStatus}
                                            />
                                          </TableCell>
                                          <TableCell style={{ padding: "5px" }}>
                                            <DatePicker
                                              format="YYYY-MM-DD"
                                              value={
                                                ele.updatedDate
                                                  ? dayjs(ele.updatedDate)
                                                  : null
                                              }
                                              onChange={(e: any) => {
                                                // console.log("e", e);
                                                addValuesProgressTable(
                                                  ele,
                                                  "updatedDate",
                                                  e
                                                );
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell style={{ padding: "5px" }}>
                                            <Input
                                              value={ele.taskProgress}
                                              onChange={(e) => {
                                                let value = parseInt(
                                                  e.target.value,
                                                  10
                                                );

                                                // Ensure it's a number and within range
                                                if (isNaN(value)) value = 0;
                                                if (value > 100) value = 100;
                                                if (value < 0) value = 0;

                                                addValuesProgressTable(
                                                  ele,
                                                  "taskProgress",
                                                  value
                                                );
                                              }}
                                              type="number"
                                              min={0}
                                              max={100}
                                              step={1}
                                              style={{
                                                width: "100%",
                                                color: "black",
                                              }}
                                              disabled={ele.buttonStatus}
                                            />
                                          </TableCell>
                                          <TableCell style={{ padding: "5px" }}>
                                            <Row
                                              style={{
                                                display: "flex",
                                                gap: "15px",
                                              }}
                                            >
                                              {/* <Select
                                                placeholder="Select Status"
                                                style={{
                                                  width: "150px",
                                                  color: "black",
                                                }}
                                                // size="small"
                                                value={ele.status}
                                                onChange={(e) => {
                                                  addValuesProgressTable(
                                                    ele,
                                                    "status",
                                                    e
                                                  );
                                                }}
                                                options={
                                                  ele?.taskProgress === "100"
                                                    ? [
                                                        {
                                                          value: "In Progress",
                                                          label: "In Progress",
                                                        },
                                                        {
                                                          value: "Completed",
                                                          label: "Completed",
                                                        },
                                                      ]
                                                    : [
                                                        {
                                                          value: "In Progress",
                                                          label: "In Progress",
                                                        },
                                                      ]
                                                }
                                                disabled={ele.buttonStatus}
                                              /> */}
                                              <Row>
                                                {ele.addHandlerButtonStatus ===
                                                false ? (
                                                  <IconButton
                                                    style={{
                                                      padding: "0px",
                                                      margin: "0px",
                                                    }}
                                                    onClick={() => {
                                                      updateProgressValues(ele);
                                                    }}
                                                  >
                                                    <MdOutlineCheckCircle
                                                      style={{
                                                        color: "#00224E",
                                                        fontSize: "20px",
                                                      }}
                                                    />
                                                  </IconButton>
                                                ) : (
                                                  <Row
                                                    style={{
                                                      display: "flex",
                                                      gap: "10px",
                                                      alignItems: "center",
                                                    }}
                                                  >
                                                    {index === 0 ? (
                                                      <>
                                                        {editButtonStatusProgress ===
                                                          true &&
                                                        editProgressEditId ===
                                                          ele.id ? (
                                                          <>
                                                            <IconButton
                                                              style={{
                                                                padding: "0px",
                                                              }}
                                                              onClick={() => {
                                                                updateEditUpdateProgressValue(
                                                                  ele
                                                                );
                                                              }}
                                                            >
                                                              <MdCheckBox
                                                                style={{
                                                                  color:
                                                                    "#0E497A",
                                                                  fontSize:
                                                                    "20px",
                                                                }}
                                                              />
                                                            </IconButton>
                                                          </>
                                                        ) : (
                                                          <>
                                                            <div
                                                              onClick={() => {
                                                                updateEditProgressValue(
                                                                  ele
                                                                );
                                                              }}
                                                              style={{
                                                                cursor:
                                                                  "pointer",
                                                              }}
                                                            >
                                                              <img
                                                                src={
                                                                  EditImgIcon
                                                                }
                                                                style={{
                                                                  width: "20px",
                                                                  height:
                                                                    "20px",
                                                                }}
                                                              />
                                                            </div>
                                                          </>
                                                        )}
                                                      </>
                                                    ) : (
                                                      ""
                                                    )}
                                                    {index === 0 &&
                                                    ele.taskProgress < 100 ? (
                                                      <IconButton
                                                        style={{
                                                          padding: "0px",
                                                          margin: "0px",
                                                        }}
                                                        onClick={() => {
                                                          addMoreProgressData();
                                                        }}
                                                      >
                                                        <AntdTooltip title="Add More Row">
                                                          <MdAddCircle
                                                            style={{
                                                              color: "#0E497A",
                                                              fontSize: "20px",
                                                            }}
                                                          />
                                                        </AntdTooltip>
                                                      </IconButton>
                                                    ) : (
                                                      <></>
                                                    )}
                                                  </Row>
                                                )}
                                              </Row>
                                            </Row>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    }
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </div>
                        </AccordionDetails>
                      </Accordion>
                    </div>
                  </div>
                </div>
              </div>
            </TabPane>

            {/* Evidences Tab */}
            {/* <TabPane tab="Evidences" key="3">
              <Form.Item label="Evidences" name="evidences">
                <Input.TextArea
                  rows={4}
                  placeholder="Add evidence details here"
                />
              </Form.Item>
            </TabPane> */}

            {/* Remarks Tab */}
            {/* <TabPane tab="Remarks" key="4">
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea rows={4} placeholder="Add remarks here" />
              </Form.Item>
            </TabPane> */}
          </Tabs>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="primary" htmlType="submit">
              {currentTask ? "Update Task" : "Add Task"}
            </Button>

            {currentTask && !readMode && (
              <Popconfirm
                placement="bottom"
                title={"Are you sure to delete Task?"}
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <AntdTooltip title="Delete Task">
                  <CustomDeleteICon
                    style={{
                      fontSize: "20px",
                      marginLeft: "10px",
                      height: "30px",
                      marginTop: "5px",
                    }}
                  />
                </AntdTooltip>
              </Popconfirm>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default GanttIndex;
