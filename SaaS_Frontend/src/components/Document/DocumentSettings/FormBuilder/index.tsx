import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Checkbox,
  Select,
  Button,
  Modal,
  Row,
  Col,
  Typography,
  Collapse,
  message,
  Spin,
  Space,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  NumberOutlined,
  DownSquareOutlined,
  CheckSquareOutlined,
  CheckOutlined,
  CloseOutlined,
  LeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { Panel } = Collapse;

// Field config
const fieldTypes = [
  {
    id: "Text",
    label: "Text Field",
    icon: <EditOutlined />,
    component: Input,
  },
  {
    id: "Number",
    label: "Number Field",
    icon: <NumberOutlined />,
    component: InputNumber,
  },
  {
    id: "Date",
    label: "Date Field",
    icon: <CalendarOutlined />,
    component: DatePicker,
  },
  {
    id: "Checkbox",
    label: "Checkbox Field",
    icon: <CheckSquareOutlined />,
    component: Checkbox,
  },
  {
    id: "Select",
    label: "Select Field",
    icon: <DownSquareOutlined />,
    component: Select,
  },
];

const DraggableField = ({ field }: any) => {
  return (
    <div
      style={{
        margin: "8px",
        padding: "8px",
        border: "1px solid #999",
        borderRadius: 4,
        cursor: "move",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#fff",
      }}
    >
      {field.icon} {field.label}
    </div>
  );
};

const FormBuilder = () => {
  const navigate = useNavigate();
  const userDetails = getSessionStorage();
  const [formFields, setFormFields] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customWidth, setCustomWidth] = useState(300);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [documentForm] = Form.useForm();
  const [formTitle, setFormTitle] = useState("Form Title");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("Form Title");
  const [isLoading, setIsLoading] = useState(false);
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const params = useParams();
  const location = useLocation();
  const { id } = params;
  const isReadOnly = location?.state?.isReadOnly === true;

  useEffect(() => {
    if (id) {
      getFormById(id);
    }
  }, [id]);

  // Mock data for selects
  const mockSystems = [
    { id: 1, name: "System 1" },
    { id: 2, name: "System 2" },
  ];

  const mockSections = [
    { id: 1, name: "Section 1" },
    { id: 2, name: "Section 2" },
  ];

  const mockEntity = [
    { id: 1, entityName: "Entity 1" },
    { id: 2, entityName: "Entity 2" },
  ];

  const getFormById = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/documentforms/${id}`);
      const formData = response.data;

      // Set form title
      setFormTitle(formData.formTitle);

      // Process and set form fields
      if (formData.fields && Array.isArray(formData.fields)) {
        const processedFields = formData.fields
          .map((field: any) => {
            // Find the matching field type from our fieldTypes array
            const fieldType = fieldTypes.find((f) => f.id === field.fieldType);

            if (fieldType) {
              return {
                ...fieldType,
                label: field.label,
                width: field.width || 300,
                uniqueId: field.uniqueId,
                properties: field.properties || {},
              };
            }
            return null;
          })
          .filter(Boolean); // Remove any null values

        setFormFields(processedFields);
      }

      message.success("Form loaded successfully");
    } catch (error) {
      message.error("Failed to load form");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (isReadOnly) return; // Disable drag and drop in read-only mode

    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === "palette" &&
      destination.droppableId === "canvas"
    ) {
      const fieldType = fieldTypes.find((f) => f.id === draggableId);
      if (fieldType) {
        setSelectedField(fieldType);
        setCustomLabel(fieldType.label);
        setCustomWidth(300);
        setIsModalVisible(true);
      }
      return;
    }

    if (
      source.droppableId === "canvas" &&
      destination.droppableId === "canvas"
    ) {
      const newFields = Array.from(formFields);
      const [removed] = newFields.splice(source.index, 1);
      newFields.splice(destination.index, 0, removed);
      setFormFields(newFields);
    }
  };

  const handleModalOk = () => {
    if (selectedField) {
      if (selectedField.uniqueId) {
        // Editing existing field
        setFormFields(
          formFields.map((field) =>
            field.uniqueId === selectedField.uniqueId
              ? {
                  ...field,
                  label: customLabel,
                  width: customWidth,
                  properties: {
                    ...field.properties,
                    ...(field.id === "Select" && { options: customOptions }),
                  },
                }
              : field
          )
        );
      } else {
        // Adding new field
        const uniqueId = `${selectedField.id}-${Date.now()}`;
        setFormFields([
          ...formFields,
          {
            ...selectedField,
            label: customLabel,
            width: customWidth,
            uniqueId,
            properties: {
              required: false,
              ...(selectedField.id === "Select" && { options: customOptions }),
            },
          },
        ]);
      }
    }
    setIsModalVisible(false);
    setSelectedField(null);
    setCustomLabel("");
    setCustomWidth(300);
    setCustomOptions([]);
    setNewOption("");
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedField(null);
    setCustomOptions([]);
    setNewOption("");
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setTempTitle(formTitle);
  };

  const handleTitleSave = () => {
    setFormTitle(tempTitle);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(formTitle);
    setIsEditingTitle(false);
  };

  const handleAddOption = () => {
    if (newOption && !customOptions.includes(newOption)) {
      setCustomOptions([...customOptions, newOption]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setCustomOptions(
      customOptions.filter((option) => option !== optionToRemove)
    );
  };

  const handleEditField = (field: any) => {
    setSelectedField(field);
    setCustomLabel(field.label);
    setCustomWidth(field.width || 300);
    setCustomOptions(field.properties?.options || []);
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const dynamicFieldsData = formFields.map((field) => ({
      fieldType: field.id,
      label: field.label,
      width: field.width || 300,
      uniqueId: field.uniqueId,
      properties: {
        required: false,
        ...(field.id === "Select" && {
          options: ["Option1", "Option2"],
        }),
      },
    }));

    const formConfig = {
      formTitle,
      fields: dynamicFieldsData,
      organizationId: userDetails?.organizationId,
    };

    console.log("Submitting Form Configuration:", formConfig);

    try {
      let response;
      if (id && !isReadOnly) {
        // Update existing form
        response = await axios.patch(`/api/documentforms/${id}`, formConfig);
        message.success({
          content: "Form configuration updated successfully!",
          key: "saving",
          duration: 2,
        });
      } else {
        // Create new form
        response = await axios.post("/api/documentforms", formConfig);
        message.success({
          content: "Form configuration saved successfully!",
          key: "saving",
          duration: 2,
        });
      }

      navigate("/processdocuments/documenttype", {
        state: {
          redirectToTab: "4",
        },
      });
    } catch (error) {
      console.error("Error saving form configuration:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      message.error({
        content: `Failed to ${
          id ? "update" : "save"
        } form configuration: ${errorMessage}`,
        key: "saving",
        duration: 4,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <Button
          onClick={() =>
            navigate("/processdocuments/documenttype", {
              state: {
                redirectToTab: "4",
              },
            })
          }
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <LeftOutlined />
          Back
        </Button>
        {!isReadOnly && (
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgb(0, 48, 89)",
            }}
          >
            Submit
          </Button>
        )}
      </div>

      {/* Title Section */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {isEditingTitle && !isReadOnly ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                width: "auto",
                minWidth: "200px",
              }}
              autoFocus
            />
            <Button
              type="text"
              icon={<CheckOutlined />}
              onClick={handleTitleSave}
              style={{ color: "#52c41a" }}
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={handleTitleCancel}
              style={{ color: "#ff4d4f" }}
            />
          </div>
        ) : (
          <>
            <Title level={2} style={{ margin: 0 }}>
              {formTitle}
            </Title>
            {!isReadOnly && (
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={handleTitleEdit}
                style={{ marginLeft: "8px" }}
              />
            )}
          </>
        )}
      </div>

      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
            width: "100%",
          }}
        >
          <Spin size="large" tip="Saving.." />
        </div>
      ) : (
        <>
          {/* Default Form */}
          <Collapse defaultActiveKey={["1"]} style={{ marginBottom: "32px" }}>
            <Panel header="Default Form" key="1">
              <Form
                form={documentForm}
                layout="vertical"
                initialValues={{
                  documentName: "",
                  doctypeName: undefined,
                  section: undefined,
                  reasonOfCreation: "",
                  description: "",
                  systems: [],
                  entityId: undefined,
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Form.Item
                      label="Title: "
                      name="documentName"
                      rules={[
                        {
                          required: true,
                          message: "Please Enter Document Name!",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter Document Name"
                        size="large"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item
                      label="Document Type: "
                      name="doctypeName"
                      rules={[
                        {
                          required: true,
                          message: "Please select a document type!",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select Doc Type"
                        size="large"
                        disabled
                        options={[]}
                      ></Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="System: "
                      name="systems"
                      rules={[
                        {
                          required: true,
                          message: "Please select a system",
                        },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Select Systems"
                        size="large"
                        disabled
                        options={[]}
                      ></Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item
                      label="Dept/Vertical: "
                      name="entityId"
                      rules={[
                        {
                          required: true,
                          message: "Please select a Entity!",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select Entity"
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        disabled
                        options={[]}
                      ></Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Section: " name="section">
                      <Select
                        placeholder="Select Section"
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        disabled
                        options={[]}
                      ></Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Form.Item
                      label="Reason for Creation/Amendment*: "
                      name="reasonOfCreation"
                    >
                      <TextArea
                        rows={1}
                        placeholder="Enter Reason"
                        size="large"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Form.Item
                      label="Previous amendment reason: "
                      name="description"
                    >
                      <TextArea
                        rows={1}
                        placeholder="Enter Document Description"
                        size="large"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Panel>
          </Collapse>

          <div style={{ marginTop: "32px" }}>
            <h3>Additional Fields</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              {/* Palette - Hide in read-only mode */}
              {!isReadOnly && (
                <Droppable droppableId="palette" direction="horizontal">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        display: "flex",
                        gap: 12,
                        marginBottom: 20,
                        padding: "8px",
                        background: "#f0f0f0",
                        borderRadius: 4,
                      }}
                    >
                      {fieldTypes.map((field, index) => (
                        <Draggable
                          key={field.id}
                          draggableId={field.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <DraggableField field={field} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}

              {/* Form Canvas */}
              <Droppable droppableId="canvas">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: "300px",
                      padding: "16px",
                      background: "#e6f7ff",
                      border: "1px dashed #1890ff",
                      borderRadius: 4,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      alignContent: "flex-start",
                      alignItems: "flex-start",
                      opacity: isReadOnly ? 0.8 : 1,
                      cursor: isReadOnly ? "default" : "move",
                    }}
                  >
                    {formFields.length === 0 ? (
                      <p>
                        {isReadOnly ? "No fields in this form" : "Drop here"}
                      </p>
                    ) : (
                      <Form layout="vertical" style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            width: "100%",
                          }}
                        >
                          {formFields.map((field, index) => (
                            <Draggable
                              key={field.uniqueId}
                              draggableId={field.uniqueId}
                              index={index}
                              isDragDisabled={isReadOnly}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    width: field.width
                                      ? `${field.width}px`
                                      : "calc(33.33% - 8px)",
                                    position: "relative",
                                  }}
                                >
                                  <Form.Item
                                    label={field.label}
                                    style={{
                                      marginBottom: 0,
                                      width: "100%",
                                      position: "relative",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div style={{ flex: 1 }}>
                                        {field.id === "Checkbox" ? (
                                          <field.component>
                                            {field.label}
                                          </field.component>
                                        ) : field.id === "Select" ? (
                                          <field.component
                                            placeholder="Select an option"
                                            style={{ width: "100%" }}
                                          >
                                            {field.properties?.options?.map(
                                              (option: string) => (
                                                <Select.Option
                                                  key={option}
                                                  value={option}
                                                >
                                                  {option}
                                                </Select.Option>
                                              )
                                            )}
                                          </field.component>
                                        ) : (
                                          <field.component
                                            style={{
                                              width: "100%",
                                            }}
                                          />
                                        )}
                                      </div>
                                      {!isReadOnly && (
                                        <div
                                          style={{
                                            marginLeft: "8px",
                                            display: "flex",
                                            gap: "4px",
                                          }}
                                        >
                                          <EditOutlined
                                            onClick={() =>
                                              handleEditField(field)
                                            }
                                            style={{
                                              cursor: "pointer",
                                            }}
                                          />
                                          <DeleteOutlined
                                            onClick={() =>
                                              setFormFields(
                                                formFields.filter(
                                                  (_, i) => i !== index
                                                )
                                              )
                                            }
                                            style={{
                                              cursor: "pointer",
                                              color: "red",
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </Form.Item>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>
                      </Form>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Label Modal - Only show in edit mode */}
          {!isReadOnly && (
            <Modal
              title="Set Field Properties"
              open={isModalVisible}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
            >
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>Label:</div>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Enter field label"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>Width (px):</div>
                <InputNumber
                  value={customWidth}
                  onChange={(value) => setCustomWidth(value || 300)}
                  min={100}
                  max={1400}
                  style={{ width: "100%" }}
                />
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  Recommended: 100-1400px
                </div>
              </div>
              {selectedField?.id === "Select" && (
                <div>
                  <div style={{ marginBottom: 8 }}>Options:</div>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Input
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Enter option"
                        onPressEnter={handleAddOption}
                      />
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddOption}
                        disabled={!newOption}
                      >
                        Add
                      </Button>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {customOptions.map((option) => (
                        <Tag
                          key={option}
                          closable
                          onClose={() => handleRemoveOption(option)}
                          style={{ margin: 4 }}
                        >
                          {option}
                        </Tag>
                      ))}
                    </div>
                  </Space>
                </div>
              )}
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default FormBuilder;
