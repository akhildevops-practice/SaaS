import React, { useEffect, useState, useRef } from "react";
import {
  Input,
  Button,
  Layout,
  Avatar,
  Form,
  Select,
  Typography,
  Drawer,
} from "antd";
import moment from "moment";
import useStyles from "./styles";
import { AiOutlineSend, AiOutlineLoading, AiOutlineUser } from "react-icons/ai";
import { GiStarShuriken } from "react-icons/gi";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import { Paper } from "@material-ui/core";
import { useSnackbar } from "notistack";
import getAppUrl from "utils/getAppUrl";
import TextArea from "antd/es/input/TextArea";
import { useRecoilState } from "recoil";
import { avatarUrl } from "recoil/atom";
import { FaHtml5, FaLongArrowAltRight, FaWindowClose } from "react-icons/fa";
const { Content } = Layout;
const realmName = getAppUrl();

type Props = {
  chatApiUrl?: string;
  transformResponse?: any;
  categoryFilterForRisk?: any;
};

const CommonChatComponent = ({
  chatApiUrl = "",
  transformResponse,
  categoryFilterForRisk = false,
}: Props) => {
  const classes = useStyles();
  const userDetails = getSessionStorage();
  const { enqueueSnackbar } = useSnackbar();
  const [filterForm] = Form.useForm();
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [messages, setMessages] = useState<any>([]);
  const [inputMessage, setInputMessage] = useState<any>("");
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryOptions, setCategoryOptions] = useState<any>([]);

  const [sources, setSource] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false); // State to manage loading state of the send button
  const realmName = getAppUrl();
  const [imgUrl, setImgUrl] = useRecoilState<any>(avatarUrl);

  const messagesEndRef = useRef<any>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    getAllLocations();
    categoryFilterForRisk && getCategoryOptions();
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

  const getCategoryOptions = async () => {
    try {
      const res = await axios.get(
        `/api/riskconfig/getallcategorynames/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        // console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setCategoryOptions([
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item._id,
              label: item.riskCategory,
            })),
            { label: "All", value: "All" },
          ]);
          setSelectedCategory("All");
        } else {
          setCategoryOptions([]);
          enqueueSnackbar("No Categories Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getallcategorynames", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      const newMessage = {
        text: inputMessage,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");

      const body: any = {
        query: inputMessage,
        orgId: userDetails?.organizationId,
        realmName,
      };

      if (selectedLocation && selectedLocation !== "All") {
        const loc = locationOptions.find(
          (opt: any) => opt.value === selectedLocation
        );
        body.locationName = loc?.label;
      }
      if (selectedEntity && selectedEntity !== "All") {
        const ent = departmentOptions.find(
          (opt: any) => opt.value === selectedEntity
        );
        body.entityName = ent?.label;
      }

      if(categoryFilterForRisk && selectedCategory) {
        body.categoryId = selectedCategory;
      }

      setLoading(true);
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_PY_URL}/pyapi/${chatApiUrl}`,
          body
        );
        const botMessage = transformResponse(res);
        console.log("api respinse", res?.data);
        if (res.data?.sources) {
          setSource(
            res.data.sources.map((src: any) => ({
              documentName: src.documentName,
              chunkIndex: src.chunkIndex || 0,
              docId: src.docId || "",
              documentLink: src.documentLink || "",
              entityName: src.entityName || "Unknown",
              locationName: src.locationName || "Unknown",
              organizationId: src.organizationId || "",
              text: src.chunkText,
            }))
          );
        } else if (res?.data?.data?.sources) {
          setSource(
            res.data.data?.sources.map((src: any) => ({
              documentName: src.ProblemStatement || "Unknown",
              chunkIndex: 0,
              docId: src.capaId || "",
              documentLink: `/cara/caraForm/${src?.capaId}`,
              entityName: src.entity || "Unknown",
              locationName: src.location || "Unknown",
              organizationId: src?.organizationId || "",
              text:
                "Document:" +
                  "" +
                  src.ProblemStatement +
                  "" +
                  " Department:" +
                  "" +
                  src.entity +
                  "" +
                  " Unit:" +
                  "" +
                  src.location || "",
            }))
          );
        }
        setMessages((prev: any) => [...prev, botMessage]);
      } catch (error) {
        setMessages((prev: any) => [
          ...prev,
          {
            text: "Something went wrong.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
      setLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage();
  };

  // const handleSend = () => {
  //   if (inputMessage.trim()) {
  //     const newMessage = {
  //       text: inputMessage,
  //       sender: "user",
  //       timestamp: new Date(),
  //     };
  //     setMessages([...messages, newMessage]);
  //     setInputMessage("");
  //   }
  // };

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

  const [drawerVisible, setDrawerVisible] = useState(false);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const [sourceVisible, setSourceVisible] = useState(false);

  const openSourcePanel = () => setSourceVisible(true);
  const closeSourcePanel = () => setSourceVisible(false);

  type Source = {
    chunkIndex: number;
    docId: string;
    documentLink: string;
    documentName: string;
    entityName: string;
    locationName: string;
    organizationId: string;
    text: string;
  };

  const [expandedIndexes, setExpandedIndexes] = useState<any>({});

  const toggleExpanded = (index: any) => {
    setExpandedIndexes((prev: any) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getPreviewText = (text: any, isExpanded: any) => {
    const words = text.trim().split(/\s+/);
    const previewLimit = 30;

    if (isExpanded || words.length <= previewLimit) {
      return text;
    }

    return words.slice(0, previewLimit).join(" ") + "...";
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Source div */}
      {sourceVisible && (
        <div
          style={{
            width: "30%",
            padding: "2px",
            border: "1px solid #a6a6a6",
            transition: "0.3s",
            overflowY: "auto",
            borderRadius: "5px",
            backgroundColor: "#e8f3f9",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #bfbfbf",
              padding: "3px 20px",
            }}
          >
            <h3 style={{ margin: "0px 0px" }}>Sources</h3>
            <FaWindowClose
              onClick={closeSourcePanel}
              style={{ fontSize: "22px", cursor: "pointer" }}
            />
          </div>
          <div
            style={{ height: "360px", overflowY: "auto", padding: "0px 20px" }}
            className={classes.scrollContainer}
          >
            {sources.map((source: any, index: any) => {
              const isExpanded = expandedIndexes[index] || false;

              return (
                <div
                  key={index}
                  style={{ marginTop: "16px", textAlign: "left" }}
                >
                  <p
                    style={{
                      marginBottom: "4px",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    {source.documentName}
                  </p>
                  <p
                    style={{
                      fontWeight: "normal",
                      margin: 0,
                      backgroundColor: "white",
                      padding: "8px",
                      borderRadius: "5px",
                      fontSize: "11px",
                    }}
                  >
                    {getPreviewText(source.text, isExpanded)}
                    {source.text.trim().split(/\s+/).length > 30 && (
                      <span
                        onClick={() => toggleExpanded(index)}
                        style={{
                          color: "#00367C",
                          cursor: "pointer",
                          marginLeft: "5px",
                          fontWeight: "bold",
                          fontSize: "11px",
                        }}
                      >
                        {isExpanded ? "Read less" : "Read more"}
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Layout
        className={classes.chatLayout}
        style={{
          width: sourceVisible ? "70%" : "100%",
          transition: "0.3s",
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            height: "280px",
            maxHeight: "300px",
            overflowY: "auto",
            backgroundColor: "white",
          }}
        >
          <Content className={classes.chatContent}>
            {messages.length > 0 ? null : (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    width: "30%",
                    margin: "0px 0px",
                  }}
                >
                  Ask Questions, Search Through Documents, And More!
                </p>
              </div>
            )}
            {messages.map((item: any, index: any) => (
              <>
                <div
                  key={index}
                  className={
                    item.sender === "user"
                      ? classes.userMessage
                      : classes.botMessage
                  }
                >
                  {item.sender === "user" ? (
                    <Avatar
                      className={classes.avatar}
                      src={imgUrl}
                      size="large"
                    />
                  ) : (
                    <GiStarShuriken
                      style={{ fontSize: "24px", color: "#ff6600" }}
                    />
                  )}

                  <div
                    className={
                      item.sender === "user"
                        ? classes.messageContentContainer
                        : classes.messageContentContainer2
                    }
                  >
                    <div
                      className={classes.messageContent}
                      dangerouslySetInnerHTML={{ __html: item.text }}
                      style={{
                        color: item?.sender === "user" ? "white" : "black",
                        textAlign: "left",
                        lineHeight: "1.3",
                        whiteSpace: "pre-line",
                      }}
                    />

                    <div className={classes.timestamp}>
                      {moment(item.timestamp).format("LT")}
                    </div>
                  </div>
                </div>
                {item.sender === "user" ? null : (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "flex-start",
                      paddingLeft: "33px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        cursor: "pointer",
                      }}
                      // onClick={openDrawer}
                      onClick={openSourcePanel}
                    >
                      View Sources <FaLongArrowAltRight />
                    </p>
                  </div>
                )}
              </>
            ))}
            <div ref={messagesEndRef} />
          </Content>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "50px",
            marginTop: "15px",
            backgroundColor: "white",
          }}
        >
          <Typography style={{ fontSize: "13px", fontWeight: "bold" }}>
            Select Scope :
          </Typography>
          <Form
            layout={"inline"}
            form={filterForm}
            // style={{ marginTop: "10px" }}
            style={{ padding: "0px 10px" }}
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
              style={{ minWidth: "190px", maxWidth: "500px" }}
              // className={classes.formItem}
            >
              <Select
                showSearch
                // placeholder="Filter By Unit"
                placeholder="Select Unit"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
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
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: "100%" }}
                value={selectedEntity || undefined}
                options={departmentOptions || []}
                onChange={(value) => handleDepartmentChange(value)}
                listHeight={200}
                // className={classes.ellipsisSelect}
              />
            </Form.Item>
            {categoryFilterForRisk && (
              <Form.Item
                label="Category"
                name="category"
                style={{ minWidth: "200px", maxWidth: "450px" }}
              >
                <Select
                  placeholder="Select Category"
                  allowClear
                  style={{ width: "100%" }}
                  options={categoryOptions}
                  size="large"
                  listHeight={200}
                  value={selectedCategory} // Bind selected value
                  onChange={(value) => {
                    console.log("Selected Category:", value);
                    setSelectedCategory(value);
                  }}
                />
              </Form.Item>
            )}
          </Form>
        </div>

        <div className={classes.inputContainer}>
          <TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            className={classes.inputField}
            placeholder="Enter your message..."
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            style={{ width: sourceVisible ? "90%" : "80%" }}
          />
          <Button
            className={classes.sendButton}
            type="primary"
            onClick={sendMessage}
            icon={
              loading ? (
                <AiOutlineLoading className={classes.searchIcon} />
              ) : (
                <AiOutlineSend className={classes.searchIcon} />
              )
            }
            loading={loading}
          ></Button>
        </div>
      </Layout>
      {/* <Drawer
        title="Sources"
        placement="left"
        closable={true}
        onClose={closeDrawer}
        open={drawerVisible}
        getContainer={false} // Renders inside parent (Modal in this case)
        style={{
          position: "absolute",
          width: "100%", // 30% of the modal
        }}
        bodyStyle={{
          padding: 16,
        }}
      >

        <p>Source 1: ...</p>
        <p>Source 2: ...</p>
  
      </Drawer> */}
    </div>
  );
};

export default CommonChatComponent;
