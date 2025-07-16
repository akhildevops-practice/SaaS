import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Collapse,
  Row,
  Col,
  List,
  Avatar,
  Upload,
} from "antd";
import axios from "apis/axios.global";
import { API_LINK } from "config";
import useStyles from "./styles";
import { useSnackbar } from "notistack";
import { FiUpload } from "react-icons/fi";

import getAppUrl from "utils/getAppUrl";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import getSessionStorage from "utils/getSessionStorage";

import EditableChildTable from "./EditableChildTable";

const { Option } = Select;
const { Panel } = Collapse;
type Props = {
  modalVisible?: any;
  setModalVisible?: any;
  modalId?: any;
  isEdit?: any;
  modalData?: any;
  setIsEdit?: any;
};
const BoMPage = ({
  modalVisible,
  setModalVisible,
  modalId,
  isEdit,
  modalData,
  setIsEdit,
}: Props) => {
  const [form] = Form.useForm();
  const [entitytypes, setEntityTypes] = useState([]);
  const [entities, setEntities] = useState<any>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<any>(null);
  const [selectedChildEntityType, setSelectedChildEntityType] =
    useState<any>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>();
  const [selectedEntities, setSelectedEntities] = useState<any>([]);
  const [entityData, setEntityData] = useState<any>({});
  const [picture, setPicture] = useState<any>();
  const classes = useStyles({});
  const { enqueueSnackbar } = useSnackbar();
  const [searchText, setSearchText] = useState<any>(null);

  const [newEntityLocation, setNewEntityLocation] = useState<any>("");
  const realmName = getAppUrl();
  const [locations, setLocations] = useState<any>([]);
  const userDetails = getSessionStorage();
  const [dataSource, setDataSource] = useState(selectedEntities);
  const [selectedLocation, setSelectedLocation] = useState<any>({
    id: userDetails?.location?.id,
    locationName: userDetails?.location?.locationName,
  });
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);
  useEffect(() => {
    if (selectedEntity) getEntityInfo();
  }, [selectedEntity]);
  useEffect(() => {
    getEntityTypesWithEntities();
    getLocationOptions();
  }, [modalVisible]);
  useEffect(() => {
    if (isEdit && !!modalData) {
      // console.log("inside else", modalData);
      getChildEntityTypeswithEntites();
      form.setFieldsValue({
        entityTypeId: modalData?.entity?.entityTypeId,
        entityName: modalData?.entity?.entityName,
        description: modalData?.bom?.description,
        picture: modalData?.entity?.picture,
        newEntityLocation: modalData?.entity?.locationId,
        locationId: modalData?.entity?.locationId,
        owners: modalData?.entity?.users,
        parentBoM: modalData?.entity?.parentEntityId?.entityName,
      });
      setSelectedEntity(modalData?.entity);
      setSelectedChildEntityType(modalData?.bom?.entityTypeId);
      setSelectedEntities(modalData?.bom?.childId);
    }
  }, [isEdit, modalData]);
  useEffect(() => {
    getAllUser();
  }, [selectedLocation]);
  console.log("selectedEntity", selectedLocation);

  const getLocationOptions = async () => {
    await axios(`/api/location/getLocationsForOrg/${realmName}`)
      .then((res) => {
        setLocations(res?.data);
        setLocationOptions(
          res?.data?.map((item: any) => ({
            ...item,
            value: item.id,
            label: item.locationName,
          }))
        );
      })
      .catch((err) => console.error(err));
  };
  const getAllUser = async () => {
    await axios(`/api/objective/getAllUserForLocation/${selectedLocation.id}`)
      .then((res) => {
        setUsers(
          res.data.allUsers.map((obj: any) => ({
            id: obj.id,
            value: obj.id,
            label: obj.username,
            // email: obj.email,
            // avatar: obj.avatar,
          }))
        );
      })
      .catch((err) => console.error(err));
  };
  // This will store the base64 image or file
  const handleChange = (info: any) => {
    if (info.file.status === "done") {
      enqueueSnackbar(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      enqueueSnackbar(`${info.file.name} file upload failed.`);
    }
  };

  const filterEntities = (entities: any, searchTerm: any) => {
    if (!searchTerm) return entities;
    return entities.filter((item: any) =>
      item.entityName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const customRequest = async ({ file, onSuccess, onError }: any) => {
    // Handle file upload logic here. In this case, we can convert the file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPicture({
        data: base64, // Save base64 string
        name: file.name,
        type: file.type,
      });
      onSuccess && onSuccess();
    };
    reader.onerror = onError;
    reader.readAsDataURL(file);
  };

  const getEntityTypesWithEntities = async () => {
    const result = await axios.get(
      `${API_LINK}/api/bom/getEntityTypesWithEntities`
    );
    // console.log("result,data", result.data);
    if (result.data) {
      setEntityTypes(result.data);
      const allEntities = result.data?.reduce(
        (accumulatedEntities: any, entityType: any) => {
          return [...accumulatedEntities, ...entityType.entities];
        },
        []
      );
      // console.log("allentitesfromreg", allEntities);
      setEntities(allEntities);
    } else {
      setEntityTypes([]);
      setEntities([]);
    }
  };
  const getChildEntityTypeswithEntites = async () => {
    try {
      const result = await axios.get(
        `${API_LINK}/api/bom/getAllEntityTypeswithEntitiesForBom/${modalData?.bom?._id}`
      );
      // console.log("result", result?.data);
      if (result.data) {
        setEntityTypes(result?.data);
        const allEntities = result.data?.reduce(
          (accumulatedEntities: any, entityType: any) => {
            return [...accumulatedEntities, ...entityType.entities];
          },
          []
        );
        // console.log("allEntities", allEntities);
        setEntities(allEntities);
      } else {
        setEntityTypes([]);
        setEntities([]);
      }
    } catch (error) {}
  };

  const getEntityInfo = async () => {
    console.log("selected entity", selectedEntity);
    const result = await axios.get(
      `${API_LINK}/api/bom/getBoMEntity/${
        selectedEntity._id ? selectedEntity._id : selectedEntity?.id
      }`
    );
    if (result?.data) {
      // console.log("entityInfo", result.data);
      setEntityData(result?.data?.result);
      const ownersIds = result?.data?.result?.users || [];
      // console.log("onerids", ownersIds);
      const owners = ownersIds
        .map((id: any) => users.find((user: any) => user.id === id.id))
        .filter(Boolean);
      // console.log("owners", owners);
      form.setFieldsValue({
        entityTypeId: result?.data?.result?.entityTypeId,
        entityName: result?.data?.result?.entityName,
        description: result?.data?.result?.description,
        picture: result?.data?.result?.picture,
        newEntityLocation: result?.data?.result?.locationId,
        locationId: result?.data?.result?.locationId,
        owners: ownersIds,
        parentBoM: result?.data?.result?.parentEntityId?.entityName,
        childId: result?.data?.result?.familyInfo,
      });
      setPicture(result?.data?.result?.picture);

      setSelectedEntities(result?.data?.result?.familyInfo);
    }
  };

  const handleOpenForm = () => {
    setModalVisible(true); // Show the modal
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSearchText({});
    setSelectedEntity(null);
    setSelectedEntities([]);
    setSelectedChildEntityType(null);
    form.setFieldsValue({
      entityTypeId: "",
      category: "",
      entityName: "",
      description: "",
      picture: "",
      childId: "",
    });
    setDataSource([]);
    setEntityTypes([]);
  };
  // console.log("isEdit,modalId", isEdit, modalId);

  // const handleSubmit = async (values: any) => {

  //   const data: any = {
  //     entityId: selectedEntity?.id ? selectedEntity?.id : values?.entityName,
  //     entityTypeId: values.entityTypeId,
  //     createdBy: userDetails.id,
  //     description: values.description,
  //     parentId: entityData?.parentEntityId
  //       ? entityData?.parentEntityId?.id
  //       : values.parentId,

  //     picture: values.picture,
  //     childId: selectedEntities,
  //     familyId: selectedEntity?.familyId,
  //     organizationId: userDetails?.organizationId,
  //   };
  //   if (!!modalId && isEdit === true) {

  //     const result = await axios.put(`/api/bom/updateBoM/${modalId}`, {
  //       data,
  //     });
  //     if (result.status === 201 || result.status === 200) {
  //       setModalVisible(false);
  //       enqueueSnackbar("BoM updated successfully", { variant: "success" });
  //     }
  //   } else {
  //     const result = await axios.post(`/api/bom/createBoM`, { data });
  //     if (result.status === 201 || result.status === 200) {
  //       setModalVisible(false);
  //       enqueueSnackbar("BoM created successfully", { variant: "success" });
  //     }
  //   }
  // };
  const handleSubmit = async (values: any) => {
    // console.log("values", values);
    console.log("selected entities", selectedEntity);
    const data: any = {
      entityName: selectedEntity.entityName,
      locationId: selectedLocation.id,
      owners: values?.owners,
      entityId: selectedEntity?._id ? selectedEntity?._id : values?.entityName,
      entityTypeId: values.entityTypeId,
      createdBy: userDetails.id,
      description: values.description,
      parentId: entityData?.parentEntityId
        ? entityData?.parentEntityId?.id
        : values.parentId,
      picture: values.picture,
      childId: selectedEntities,
      familyId: selectedEntity?.familyId[0],
      organizationId: userDetails?.organizationId,
    };

    const updatedEntitiesPromises = selectedEntities?.map(
      async (entity: any) => {
        const currentEntity = await axios.get(
          `/api/bom/getBoMEntityWithoutDetails/${entity?._id}`
        );
        console.log("entity", currentEntity);
        const currentFamilyIds = currentEntity.data.familyId || []; // Assuming familyId is an array
        const newFamilyIds = selectedEntity?.familyId || []; // Also assuming this is an array

        // Combine and filter out duplicates
        const updatedFamilyIds = Array.from(
          new Set([...currentFamilyIds, ...newFamilyIds])
        );

        // Prepare the updated entity, keeping other fields the same
        const updatedEntity = {
          ...currentEntity.data,
          users: normalizeUsers(currentEntity.data?.users),
          location: currentEntity.data.locationId,
          entityTypeId: currentEntity.data.entityTypeId,
          familyId: updatedFamilyIds,
        };

        // Update entity in the database
        await axios.put(
          `/api/bom/updateBomEntity/${entity._id}`,
          updatedEntity
        );
      }
    );

    // Wait for all updates to complete
    await Promise.all(updatedEntitiesPromises);

    // Handle the main submit logic (create or update BoM)
    if (!!modalId && isEdit === true) {
      const result = await axios.put(`/api/bom/updateBoM/${modalId}`, { data });
      if (result.status === 201 || result.status === 200) {
        setModalVisible(false);
        enqueueSnackbar("BoM updated successfully", { variant: "success" });
      }
    } else {
      const result = await axios.post(`/api/bom/createBoM`, { data });
      if (result.status === 201 || result.status === 200) {
        setModalVisible(false);
        enqueueSnackbar("BoM created successfully", { variant: "success" });
      }
    }
  };

  const handleEntityTypeChange = (value: any) => {
    const selectedType: any = entitytypes.find(
      (type: any) => type.id === value
    );
    setSelectedChildEntityType(selectedType);
    setSelectedEntities(selectedType?.entities || []);
  };
  const normalizeUsers = (users: any) => {
    // If users is an array of strings, convert to an array of objects with 'id' field
    if (Array.isArray(users) && typeof users[0] === "string") {
      return users.map((userId: string) => ({ id: userId }));
    }

    // If users is already an array of objects, ensure they have 'id' field
    if (Array.isArray(users) && typeof users[0] === "object") {
      return users.map((user: any) => ({
        id: user.id || user.value || user.userId || user, // Ensure it has 'id' field
      }));
    }

    // If users is not an array, return empty array (or handle as needed)
    return [];
  };
  const handleSaveEntity = async (record: any) => {
    console.log("selectedchildentityType", selectedChildEntityType);
    console.log("selectedEntity", selectedEntity);
    console.log("selected entity in handlesave", record);
    const existingEntityIndex = dataSource.findIndex(
      (entity: any) => entity.entityId === record.entityId
    );
    console.log("exsitingentity", existingEntityIndex);
    const newEntity = {
      organizationId: userDetails?.organizationId,
      entityId: record?.entityId,
      entityName: record?.entityName,
      location: record?.location,
      entityTypeId: selectedChildEntityType,
      // parentEntityId: selectedEntityType,
      familyId: selectedEntity.familyId,
      users: normalizeUsers(record?.users),
    };
    console.log("newEntity", newEntity);
    try {
      let res;

      if (existingEntityIndex !== -1) {
        // If the entity exists, update it
        res = await axios.put(`/api/bom/updateBoMEntity/${record?._id}`, {
          entityId: record?.entityId,
          entityName: record?.entityName,
          locationId: record?.locationId,
          entityTypeId: record?.entityTypeId,
          parentEntityId: selectedEntityType,
          familyId: selectedEntity?.familyId,
          users: normalizeUsers(record?.users),
          organizationId: userDetails?.organizationId,
        });
        if (res.status === 200) {
          // Update local state
          const updatedDataSource = [...dataSource];
          updatedDataSource[existingEntityIndex] = {
            ...updatedDataSource[existingEntityIndex],
            ...res.data,
          };
          setDataSource(updatedDataSource);
          setSelectedEntities(updatedDataSource);
        }
      } else {
        res = await axios.post(`/api/bom/createBoMEntity`, newEntity);
        if (res.status === 201 || res.status === 200) {
          setDataSource([...dataSource, res.data]);
          setSelectedEntities([...dataSource, res.data]);
        }
      }

      const currentValues = form.getFieldsValue();
      const updatedChildIds = [
        ...(currentValues.childId || []),
        res?.data?.id, // Add new entity ID if applicable
      ];

      // Update the form's field value for `childId`
      form.setFieldsValue({
        childId: updatedChildIds,
      });
    } catch (error) {
      console.error("Error saving entity:", error);
      enqueueSnackbar(
        "There was an error saving the entity. Please try again.",
        { variant: "error" }
      );
    }
  };

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 128) + 127;
    const g = Math.floor(Math.random() * 128) + 127;
    const b = Math.floor(Math.random() * 128) + 127;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const handleSearchChange = (entityTypeId: any, e: any) => {
    const newSearchTerms = { ...searchText, [entityTypeId]: e.target.value };
    setSearchText(newSearchTerms);
  };

  // console.log("selected Entity Type change", selectedEntityType);
  const handleSubmitDetails = async () => {
    const values = form.getFieldsValue([
      "entityTypeId",
      "category",
      "entityName",
      "description",
      "picture",
      "locationId",
      "owners",
    ]);

    console.log("Submitting details:", values);

    const result = await axios.post(`/api/bom/createBoMEntity`, {
      entityName: values?.entityName,
      entityId: values?.entityName,
      entityTypeId: selectedEntityType,
      users: values.owners,

      // createdBy: userDetails.id,
      description: values.description,
      parentEntityId: entityData?.parentEntityId
        ? entityData?.parentEntityId?.id
        : values.parentId,

      picture: values.picture,
      location: selectedLocation?.id,
      organizationId: userDetails?.organizationId,
    });
    if (result?.data) {
      enqueueSnackbar(`${values.entityName} added successfully`, {
        variant: "success",
      });
      setSelectedEntity(result?.data);
      getEntityTypesWithEntities();
    }
  };

  return (
    <Modal
      title="BoM"
      visible={modalVisible}
      onCancel={handleCancel}
      footer={null}
      width={1200}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      style={{ maxHeight: "1200px", overflowY: "auto" }}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row gutter={24}>
          <Col span={7}>
            <Collapse defaultActiveKey={["1"]}>
              {entitytypes?.map((entityType: any) => {
                const randomColor = generateRandomColor();
                const searchTerm = searchText ? searchText[entityType?.id] : "";
                return (
                  <Panel
                    header={
                      <div
                        style={{
                          backgroundColor: randomColor,
                          padding: "10px",
                          borderRadius: "8px",
                        }}
                      >
                        {entityType.name} - {entityType?.entities?.length}
                      </div>
                    }
                    key={entityType.id}
                    style={{ marginBottom: "10px" }}
                  >
                    <Input.Search
                      placeholder="Search Entities..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(entityType.id, e)}
                      style={{ marginBottom: "10px", width: "250px" }}
                    />

                    <List
                      size="small"
                      bordered
                      dataSource={filterEntities(
                        entityType?.entities,
                        searchTerm
                      )}
                      renderItem={(item: any) => (
                        <List.Item
                          onClick={() => {
                            setSelectedEntity(item);
                            setSelectedEntityType(item?.entityTypeId);
                            setNewEntityLocation(item?.location?.id);
                            setIsEdit(false);
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <div style={{ marginRight: "16px" }}>
                              {item.picture ? (
                                <Avatar
                                  size="small"
                                  src={item.picture.data}
                                  style={{ marginRight: "10px" }}
                                />
                              ) : (
                                <Avatar size="small">
                                  {item.entityName[0]}
                                </Avatar>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>{item?.entityName}</div>
                          </div>
                        </List.Item>
                      )}
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    />
                  </Panel>
                );
              })}
            </Collapse>
          </Col>

          <Col span={17}>
            <Row>
              <Col span={24}>
                <div>
                  {isEdit && (
                    <span style={{ fontWeight: "bold" }}>
                      BoM of {modalData?.entity?.entityName}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </div>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Type:"
                  name="entityTypeId"
                  className={classes.formItem}
                >
                  <Select
                    placeholder="Select a type"
                    showSearch
                    optionFilterProp="children"
                    onChange={(value) => {
                      const selectedType = entitytypes.find(
                        (type: any) => type.id === value
                      );
                      // handleTypeChange(selectedType);
                      setSelectedEntityType(selectedType);
                    }}
                    value={selectedEntityType?.id}
                  >
                    {entitytypes?.map((entityType: any) => (
                      <Option key={entityType?.id} value={entityType?.id}>
                        {entityType.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Category"
                  name="category"
                  className={classes.formItem}
                >
                  <Select>
                    <Option value="option1">Internal</Option>
                    <Option value="option2">External</Option>
                    <Option value="option3">Product</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Product Title"
                  name="entityName"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the product title!",
                    },
                  ]}
                  className={classes.formItem}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[
                    { required: true, message: "Please enter a description!" },
                  ]}
                  className={classes.formItem}
                >
                  <Input.TextArea />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Picture"
                  name="picture"
                  className={classes.formItem}
                >
                  <Upload
                    customRequest={customRequest}
                    showUploadList={false}
                    onChange={handleChange}
                    listType="picture-card"
                    className={classes.uploadWrapper}
                  >
                    {picture ? (
                      <Avatar size={40} src={picture?.data} />
                    ) : (
                      <div
                        className={classes.uploadText}
                        style={{ textAlign: "center" }}
                      >
                        <FiUpload className={classes.uploadIcon} />
                        <div>Upload</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Location"
                  name="locationId"
                  rules={[
                    { required: true, message: "Please select location!" },
                  ]}
                  className={classes.formItem}
                >
                  <Select
                    showSearch
                    // placeholder="Filter By Unit"
                    placeholder="Select Unit"
                    optionFilterProp="children"
                    //defaultValue={selectedLocation.id}
                    filterOption={(input: any, option: any) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    // style={{ width: "100%" }}
                    size="large"
                    value={selectedLocation}
                    options={locationOptions || []}
                    onChange={(e: any, value: any) => {
                      setSelectedLocation({
                        id: value?.id,
                        locationName: value?.locationName,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Select Owners"
                  name="owners"
                  rules={[{ required: true, message: "Please select users!" }]}
                  className={classes.formItem}
                >
                  <Select
                    showSearch
                    placeholder="Select Owner"
                    options={users}
                    optionFilterProp="children"
                    mode="multiple"
                    allowClear
                    filterOption={(input: any, option: any) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(selectedValues: any) => {
                      // Map the selected values (which are typically just IDs) to the full objects
                      const selectedOwners = users.filter((user: any) =>
                        selectedValues.includes(user.value)
                      );

                      // Set the owners field as an array of objects
                      form.setFieldsValue({
                        owners: selectedOwners, // This will be an array of objects
                      });

                      console.log("Selected owners:", selectedOwners); // Logging the array of objects
                    }}
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                {!isEdit && !selectedEntity && (
                  <Button onClick={handleSubmitDetails}>Submit </Button>
                )}{" "}
              </Col>
            </Row>

            <hr style={{ marginBottom: "10px", fontWeight: "bold" }} />

            <div className={classes.scrollableSection}>
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    label="Parent BoM"
                    name="parentBoM"
                    className={classes.formItem}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>

                <Col span={5}>
                  <Form.Item
                    label="Child BoM"
                    required
                    className={classes.formItem}
                  >
                    <Select
                      placeholder="Select Entity Type"
                      onChange={handleEntityTypeChange}
                      value={selectedChildEntityType?.id}
                      showSearch
                      optionFilterProp="children"
                    >
                      {entitytypes?.map((entityType: any) => (
                        <Option key={entityType.id} value={entityType.id}>
                          {entityType.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* Display Selected Entities and Add New Entity */}
                <Row>
                  <Form.Item
                    label="Selected Entities"
                    required
                    className={classes.formItem}
                  >
                    {selectedChildEntityType && (
                      <div style={{ marginTop: "16px" }}>
                        <EditableChildTable
                          selectedEntities={selectedEntities}
                          setSelectedEntities={setSelectedEntities}
                          locations={locations}
                          handleSaveEntity={handleSaveEntity}
                          dataSource={dataSource}
                          setDataSource={setDataSource}
                        />
                      </div>
                    )}
                  </Form.Item>
                </Row>
              </Row>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
export default BoMPage;
