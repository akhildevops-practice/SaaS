import { useEffect, useState } from "react";
import { Input, Button, Layout, Avatar, Form, Select } from "antd";
import moment from "moment";
import useStyles from "./styles";
import { AiOutlineSend, AiOutlineUser, AiOutlineLoading } from "react-icons/ai";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import { Paper } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
const { Content } = Layout;
const ChatComponent = () => {
  const classes = useStyles();
  const userDetails = getSessionStorage();
  const { enqueueSnackbar } = useSnackbar();
  const [filterForm] = Form.useForm();

  const [messages, setMessages] = useState<any>([]);
  const [inputMessage, setInputMessage] = useState<any>("");
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // State to manage loading state of the send button

  useEffect(() => {
    getAllLocations();
    setSelectedLocation(userDetails?.location?.id);
    setSelectedEntity(userDetails?.entity?.id);
  }, []);

  useEffect(() => {
    if (!!selectedLocation && selectedLocation !== "All") {
      getAllDepartmentsByLocation(selectedLocation);
    }
  }, [selectedLocation]);

  // useEffect(() => {
  //   console.log("checkchat selectedEntity", selectedEntity);
  // }, [selectedEntity]);

  const getAllDepartmentsByLocation = async (locationId: any = "") => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllDepartmentsByLocation/${locationId}`
      );

      if (res.status === 200 || res.status === 201) {
        console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setDepartmentOptions([
            {
              value: "All",
              label: "All",
            },
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.entityName,
            })),
          ]);
        } else {
          setDepartmentOptions([]);
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
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const getAllLocations = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setLocationOptions([
            {
              value: "All",
              label: "All",
            },
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            })),
          ]);
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
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const navigateToHira = (job: any) => {
    const urlObject = {
      highlightText: job?.highlightText,
      // hiraId : job?.hiraId,
    };
    const serializedState = encodeURIComponent(JSON.stringify(urlObject));
    const hiraUrl = `/risk/riskregister/HIRA/${job?.hiraId}?state=${serializedState}`;
    window.open(hiraUrl, "_blank");
  };

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      const newMessage = {
        text: inputMessage,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);

      const body: any = {
        query: inputMessage,
        orgId: userDetails?.organizationId,
      };

      // Conditionally add locationId and entityId if they are valid
      if (
        selectedLocation &&
        selectedLocation !== "All" &&
        selectedLocation !== ""
      ) {
        const selectedOption = locationOptions.find(
          (option: any) => option.value === selectedLocation
        );
        const selectedLocationName = selectedOption
          ? selectedOption.label
          : null;
        body.location = selectedLocationName;
      }
      if (selectedEntity && selectedEntity !== "All" && selectedEntity !== "") {
        const selectedOption = departmentOptions.find(
          (option: any) => option.value === selectedEntity
        );
        const selectedEntityName = selectedOption ? selectedOption.label : null;
        body.entity = selectedEntityName;
      }

      setLoading(true);
      try {
        setInputMessage("");
        const res = await axios.post(
          `${process.env.REACT_APP_PY_URL}/pyapi/chatListOfFinding`,
          body
        );
        if (res.data?.data?.answer) {
          const botMessage = {
            text: res.data.data.answer,
            highlightText: res.data.data.highlight_text,
            sources: res.data.data.sources,
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prevMessages: any) => [...prevMessages, botMessage]);
        } else {
          const noAnswerMessage = {
            text: "Sorry, I couldn't find any relevant information.",
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prevMessages: any) => [
            ...prevMessages,
            noAnswerMessage,
          ]);
        }
      } catch (error) {
        // console.error("Error:", error);
        const errorMessage = {
          text: "An error occurred while processing your request. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prevMessages: any) => [...prevMessages, errorMessage]);
      }
      setLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage();
  };

  const handleInputChange = (e: any) => {
    setInputMessage(e.target.value);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleLocationChange = (value: any) => {
    setSelectedLocation(value);
    if (value === "All") {
      setSelectedEntity("All");
      filterForm.setFieldsValue({ entityId: "All" });
    } else {
      setSelectedEntity("");
      filterForm.setFieldsValue({ entityId: undefined });
    }
  };

  const handleDepartmentChange = (value: any) => {
    setSelectedEntity(value);
  };

  return (
    <Layout className={classes.chatLayout}>
      <Form
        layout={"inline"}
        form={filterForm}
        // style={{ marginTop: "10px" }}
        style={{ padding: "10px", borderBottom: "1px solid #d9d9d9" }}
        rootClassName={classes.labelStyle}
        initialValues={{
          locationId: userDetails?.location?.id,
          entityId: userDetails?.entity?.id,
        }}
      >
        <Form.Item
          label="Unit"
          // label="Filter By Unit"
          name="locationId"
          style={{ minWidth: "190px", maxWidth: "450px" }}
          // className={classes.formItem}
        >
          <Select
            showSearch
            // placeholder="Filter By Unit"
            placeholder="Select Unit"
            optionFilterProp="children"
            filterOption={(input: any, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: "100%" }}
            value={selectedLocation}
            // options={locationOptions || []}
            onChange={(value) => handleLocationChange(value)}
            listHeight={200}
            dropdownRender={(menu) => (
              <Paper style={{ padding: "1px" }}>{menu}</Paper>
            )}
            // className={classes.ellipsisSelect}
          >
            {locationOptions.map((option: any) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Dept/Vertical"
          // label="Filter By Area/Department"
          name="entityId"
          style={{ minWidth: "200px", maxWidth: "450px" }}
          // className={classes.formItem}
        >
          <Select
            showSearch
            allowClear
            // placeholder="Filter By Area/Deparment"
            placeholder="Select Area/Deparment"
            optionFilterProp="children"
            filterOption={(input: any, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: "100%" }}
            value={selectedEntity || undefined}
            options={departmentOptions || []}
            onChange={(value) => handleDepartmentChange(value)}
            listHeight={200}
            // className={classes.ellipsisSelect}
          />
        </Form.Item>
      </Form>
      <div style={{ height: "280px", maxHeight: "300px", overflowY: "auto" }}>
        <Content className={classes.chatContent}>
          {messages.map((item: any, index: any) => (
            <div
              key={index}
              className={
                item.sender === "user"
                  ? classes.userMessage
                  : classes.botMessage
              }
            >
              <Avatar
                className={classes.avatar}
                icon={
                  item.sender === "user" ? <AiOutlineUser /> : <AiOutlineUser />
                }
                size="large"
              />
              <div className={classes.messageContentContainer}>
                {/* Render the answer */}
                <div className={classes.messageContent}>{item.text}</div>

                {/* Render sources as job titles */}
                {/* {item.sources && item.sources.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <strong>Job Titles:</strong>
                    <ul>
                      {item.sources.map((source: any, idx: any) => (
                        <li key={idx}>
                          <Link
                            to={`/risk/riskregister/HIRA/${
                              source.hiraId
                            }?highlightText=${encodeURIComponent(
                              item?.highlightText
                            )}`}
                            target="_blank"
                            style={{
                              textDecoration: "underline",
                              color: "blue",
                            }}
                          >
                            {source.jobTitle}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )} */}

                <div className={classes.timestamp}>
                  {moment(item.timestamp).format("LT")}
                </div>
              </div>
            </div>
          ))}
        </Content>
      </div>
      <div className={classes.inputContainer}>
        <Input
          className={classes.inputField}
          placeholder="Enter your message..."
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <Button
          className={classes.sendButton}
          type="primary"
          onClick={sendMessage}
          icon={loading ? <AiOutlineLoading /> : <AiOutlineSend />}
          loading={loading}
        >
          Send
        </Button>
      </div>
    </Layout>
  );
};

export default ChatComponent;
