import {
  Drawer,
  Form,
  Col,
  Input,
  Select,
  Row,
  Button,
} from "antd";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  ListItemAvatar,
  Checkbox,
  Avatar,
  TextareaAutosize,
  IconButton,
  Popover,
  CircularProgress,
} from "@material-ui/core";
import { MdDragHandle } from 'react-icons/md';
import { MdArrowDropDown } from 'react-icons/md';
import { useEffect, useState } from "react";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
type Props = {
  events: any;
  isVisible: any;
  onClose: any;
  onDragStart: any;

  auditTypes: any;
  systems: any;
  locationNames: any;
  setAuditTypes: any;
  setSystems: any;

  scheduleFormData: any;
  setScheduleFormData: any;

  entityListing: any;
  setEntityListing: any;

  auditorsList: any;
  setAuditorsList: any;

  auditeeList: any;
  setAuditeeList: any;

  templateListing: any;
  setTemplateListing: any;

  draggableEntities: any;
  setDraggableEntities: any;

  commentText: any;
  setCommentText: any;

  auditPlanDetails: any;

  formDataLoaderForAuditPlan: any;
  setFormDataLoaderForAuditPlan: any;

  initialDataFromSchedule?: any;
  setInitialDataFromSchedule?: any;
  selectedSystemNew?: any;
  selectedLocationNew?: any;
  selectedAuditTypeNew?: any;
  dataFromAuditScheduleLoaded?: any;
};

const DrggableScheduleDrawer = ({
  events,
  isVisible,
  onClose,
  onDragStart,
  selectedSystemNew,
  selectedLocationNew,
  selectedAuditTypeNew,
  auditTypes,
  systems,
  locationNames,
  setAuditTypes,
  setSystems,

  scheduleFormData = null,
  setScheduleFormData,
  entityListing = [],
  setEntityListing,

  auditorsList = [],
  setAuditorsList,

  auditeeList = [],
  setAuditeeList,

  templateListing = [],
  setTemplateListing,

  draggableEntities = [],
  setDraggableEntities,

  commentText = "",
  setCommentText,

  auditPlanDetails = null,

  formDataLoaderForAuditPlan = false,
  setFormDataLoaderForAuditPlan,

  initialDataFromSchedule = null,
  setInitialDataFromSchedule,

  dataFromAuditScheduleLoaded = false,
}: Props) => {
  const [initialFormData, setInitialFormData] = useState<any>({});
  const [scheduleForm] = Form.useForm();
  const [checkedAuditors, setCheckedAuditors] = useState<any>([]);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedSystem, setSelectedSystem] = useState<any>(null);
  const [selectedAuditType, setSelectedAuditType] = useState<any>(null);

  console.log(
    "initialFormData new",
    selectedAuditTypeNew,
    scheduleForm.getFieldsValue()
  );
  useEffect(() => {
    if (selectedLocationNew !== undefined) {
      scheduleForm.setFieldsValue({
        location: selectedLocationNew?.name,
      });
    }

    if (selectedAuditTypeNew !== undefined) {
      scheduleForm.setFieldsValue({
        auditType: selectedAuditTypeNew?.id,
      });
    }
    if (selectedSystemNew !== undefined && selectedSystemNew.length > 0) {
      scheduleForm.setFieldsValue({
        systemName: selectedSystemNew,
      });
    }
  }, []);
  useEffect(() => {
    // console.log(
    //   "checkaudit inside useEffect auditTypes systems locationNames",
    //   auditTypes,
    //   systems,
    //   locationNames
    // );

    let updatedFormData = { ...initialFormData };
    if (auditTypes?.length > 0) {
      const auditTypeOptions = auditTypes.map((auditType: any) => ({
        label: auditType.auditType,
        value: auditType.id,
      }));
      updatedFormData = { ...updatedFormData, auditTypeOptions };
    }

    if (locationNames?.length > 0) {
      const locationOptions = locationNames.map((location: any) => ({
        label: location.locationName,
        value: location.locationName,
      }));
      updatedFormData = { ...updatedFormData, locationOptions };
    }

    if (systems?.length > 0) {
      const systemOptions = systems.map((system: any) => ({
        label: system.name,
        value: system.id,
      }));
      updatedFormData = { ...updatedFormData, systemOptions };
    }

    setInitialFormData(updatedFormData);
  }, [auditTypes, systems, locationNames]);

  useEffect(() => {
    if (!!initialDataFromSchedule && !!initialDataFromSchedule?.createdOn) {
      // console.log(
      //   "checkaudit inside useEffect initialDataFromSchedule",
      //   initialDataFromSchedule
      // );

      const selectedType = auditTypes?.find(
        (auditType: any) => auditType.id === initialDataFromSchedule?.auditType
      );
      setScheduleFormData((prev: any) => ({
        ...prev,
        auditScheduleName: initialDataFromSchedule?.auditScheduleName,
        location: initialDataFromSchedule?.location?.locationName,
        auditType: selectedType?.id,
        systemName: initialDataFromSchedule?.systemName?.map(
          (system: any) => system
        ),
        checklist: initialDataFromSchedule?.template,
        comments: "",
      }));
      scheduleForm.setFieldsValue({
        auditScheduleName: initialDataFromSchedule?.auditScheduleName,
        location: initialDataFromSchedule?.location?.locationName,
        auditType: selectedType?.id,
        systemName: initialDataFromSchedule?.systemName?.map(
          (system: any) => system
        ),
        checklist: initialDataFromSchedule?.template,
      });

      setEntityListing(
        initialDataFromSchedule.AuditScheduleEntitywise.map((obj: any) => ({
          id: obj.entityId,

          entityName: obj.name,
        }))
      );
      setDraggableEntities(
        initialDataFromSchedule.AuditScheduleEntitywise.map((obj: any) => ({
          id: obj.entityId,
          entityId: obj.entityId,
          entityName: obj.name,
          time: obj.time,
          auditors: obj.auditor,
          auditees: obj.auditee,
          monthNames: obj?.monthNames,
          combinedDate: obj?.combinedDate,
          comments: obj.comments,
          areas: obj.areas,
          auditTemplate: obj.auditTemplateId,
        }))
      );
    }
  }, [dataFromAuditScheduleLoaded]);

  useEffect(() => {
    if (auditPlanDetails) {
      // console.log(
      //   "checkaudit inside useEffect[auditPlanDetails]",
      //   auditPlanDetails
      // );
      const auditTypeOptions = auditTypes?.map((auditType: any) => ({
        label: auditType.auditType,
        value: auditType.id,
      }));
      const selectedType = auditTypeOptions?.find(
        (option: any) => option.value === auditPlanDetails?.auditType
      );
      scheduleForm.setFieldsValue({
        location: auditPlanDetails?.location?.locationName,
        auditType: selectedType?.value,
        systemName: auditPlanDetails?.system?.map((system: any) => system.id),
      });
      setScheduleFormData((prev: any) => ({
        ...prev,
        location: auditPlanDetails?.location?.locationName,
        auditType: selectedType?.value,
        systemName: auditPlanDetails?.system?.map((system: any) => system.id),
      }));
    }
  }, [auditPlanDetails]);

  useEffect(() => {}, [initialFormData]);

  useEffect(() => {
    if (scheduleFormData && !!auditPlanDetails) {
      setFormDataLoaderForAuditPlan(false);
    }
  }, [scheduleFormData]);

  // useEffect(() => {
  //   console.log(
  //     "checkaudit inside useEffect formDataLoaderForAuditPlan",
  //     formDataLoaderForAuditPlan
  //   );
  // }, [formDataLoaderForAuditPlan]);

  // useEffect(() => {
  //   console.log("checkaudit inside useEffect entityListing", entityListing);
  // }, [entityListing]);

  // useEffect(() => {
  //   console.log("checkaudit inside useEffect initalFormData", initialFormData);
  // }, [initialFormData]);

  // useEffect(() => {
  //   console.log("checkaudit inside useEffect auditorsList", auditorsList);
  // }, [auditorsList]);

  useEffect(() => {
    // console.log("checkaudit inside useEffect checkedAuditors", checkedAuditors);
    setScheduleFormData((prev: any) => ({
      ...prev,
      auditors: checkedAuditors,
    }));
  }, [checkedAuditors]);

  const handlePopoverOpen = (event: any, entityName: any) => {
    setPopoverAnchorEl(event.currentTarget);
    setSelectedEntity(entityName);
  };

  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
    setSelectedEntity("");
  };

  const open = Boolean(popoverAnchorEl);

  const handleAuditorToggle = (value: any) => {
    const currentIndex = checkedAuditors.indexOf(value);
    const newChecked = [...checkedAuditors];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setCheckedAuditors(newChecked);
  };

  const handleSelectAllAuditors = () => {
    const allAuditorIds = auditorsList.map((auditor: any) => auditor.id);
    // console.log("checkaudit allAuditorIds", allAuditorIds);

    setCheckedAuditors(allAuditorIds);
  };

  const handleClearAuditors = () => {
    setCheckedAuditors([]);
  };

  const isDraggable = (entityName: any) => {
    // Check if the auditee list for the entity is not empty and auditors are defined
    return (
      !!auditeeList[entityName] &&
      auditeeList[entityName].length > 0 &&
      !!scheduleFormData?.auditors &&
      scheduleFormData?.auditors.length > 0
    );
  };

  const renderAuditeeList = (entityName: any) => {
    if (auditeeList[entityName]?.length > 0) {
      const auditeeNames = auditeeList[entityName]
        ?.map((auditee: any) => `${auditee.firstname} ${auditee.lastname}`)
        .join(", ");
      return (
        <Typography style={{ padding: 8 }}>
          Auditee(s): {auditeeNames}
        </Typography>
      );
    } else {
      return (
        <Typography style={{ padding: 8 }}>
          No Entity Heads Found! Please Add to Schedule Audit for this
          Department
        </Typography>
      );
    }
  };

  const handleEntityDragStart = (entity: any, e: any) => {
    if (isDraggable(entity.entityName)) {
      e.dataTransfer.setData("text", JSON.stringify(entity));
      onDragStart(entity);
    }
  };

  return (
    <>
      <Drawer
        title="Schedule an Audit"
        placement="right"
        onClose={onClose}
        open={isVisible}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        width={"30%"}
        maskClosable={false}
      >
        <>
          {formDataLoaderForAuditPlan ? (
            <CircularProgress />
          ) : (
            <>
              <Form
                form={scheduleForm}
                layout="vertical"
                onValuesChange={(changedValues, allValues) => {
                  setScheduleFormData(allValues);
                }}

                // initialValues={{
                //   documentName: formData?.documentName,
                //   doctypeName: formData?.doctypeName,
                //   systems: formData?.systems || undefined,
                //   reasonOfCreation: formData?.reasonOfCreation,
                //   description: formData?.description,
                //   tags: formData?.tags,
                // }}
                // rootClassName={classes.labelStyle}
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Form.Item
                      label="Schedule Title: "
                      name="auditScheduleName"
                      //   rules={[
                      //     {
                      //       required: true,
                      //       message: "Please Enter Document Name!",
                      //     },
                      //   ]}
                    >
                      <Input
                        name="auditScheduleName"
                        placeholder="Enter Schedule Title"
                        size="large"
                        // onChange={(e: any) => handleInputChange(e)}
                        // value={formData?.documentName}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item
                      label="Unit Name: "
                      name="location"
                      //   rules={[
                      //     {
                      //       required: true,
                      //       message: "Please select a document type!",
                      //     },
                      //   ]}
                    >
                      <Select
                        placeholder="Select Unit"
                        options={initialFormData?.locationOptions || null}
                        // onChange={handleDocTypeChange}
                        size="large"
                        defaultValue={selectedLocation || undefined}
                        value={selectedLocation || undefined}
                      >
                        {/* {formData?.docTypes?.map((option: any) => (
                  <Option
                    key={option.documentTypeName}
                    value={option.documentTypeName}
                    label={option.documentTypeName}
                  >
                    {option.documentTypeName}
                  </Option>
                ))} */}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="System: "
                      name="systemName"
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please select a system!",
                      //   },
                      // ]}
                    >
                      <Select
                        placeholder="Select System"
                        options={initialFormData?.systemOptions || null}
                        // onChange={handleSystemsChange}
                        mode="multiple"
                        size="large"
                        value={selectedSystem}
                      >
                        {/* {!!systems &&
                  !!systems.length &&
                  systems?.map((option: any, index: number) => (
                    <Option key={index} value={option.id} label={option.name}>
                      {option.name}
                    </Option>
                  ))} */}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item
                      label="Audit Type: "
                      name="auditType"
                      //   rules={[
                      //     {
                      //       required: true,
                      //       message: "Please select a document type!",
                      //     },
                      //   ]}
                    >
                      <Select
                        placeholder="Select Audit Type"
                        options={initialFormData?.auditTypeOptions || null}
                        // onChange={handleDocTypeChange}
                        size="large"
                        value={selectedAuditType}
                      ></Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Default Checklist: "
                      name="checklist"
                      //   rules={[
                      //     {
                      //       required: true,
                      //       message: "Please select a document type!",
                      //     },
                      //   ]}
                    >
                      <Select
                        placeholder="Select Checklist"
                        options={templateListing || null}
                        // onChange={handleDocTypeChange}
                        size="large"
                        value={undefined}
                      ></Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Form.Item label="Comments: " name="comments">
                      <TextareaAutosize
                        style={{ width: "100%" }}
                        minRows={4}
                        placeholder="Enter Comments"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
              {entityListing.length > 0 && (
                <div style={{ display: "flex", marginTop: "20px" }}>
                  <div
                    style={{
                      width: "50%",
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Departments
                    </Typography>
                    <List>
                      {draggableEntities.map((entity: any) => (
                        <ListItem
                          key={entity.id}
                          draggable={isDraggable(entity.entityName)} // Set draggable based on condition
                          onDragStart={(e) => handleEntityDragStart(entity, e)}
                          style={{
                            cursor: isDraggable(entity.entityName)
                              ? "grab"
                              : "not-allowed",
                          }} // Change cursor style based on condition
                        >
                          <ListItemIcon>
                            <MdDragHandle />
                          </ListItemIcon>
                          <ListItemText primary={entity.entityName} />

                          <IconButton
                            onClick={(e) =>
                              handlePopoverOpen(e, entity.entityName)
                            }
                          >
                            <MdArrowDropDown />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  </div>
                  <div
                    style={{
                      width: "50%",
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Auditors
                    </Typography>
                    <div style={{ marginBottom: "10px" }}>
                      <Button
                        size="small"
                        onClick={handleSelectAllAuditors}
                        style={{ marginRight: "10px" }}
                      >
                        Select All
                      </Button>
                      <Button size="small" onClick={handleClearAuditors}>
                        Clear
                      </Button>
                    </div>
                    <List>
                      {auditorsList.length > 0 &&
                        auditorsList.map((auditor: any) => (
                          <ListItem key={auditor.id} button>
                            <ListItemAvatar>
                              <Avatar
                                alt={auditor.username}
                                src={auditor.avatar || null} // Replace with default avatar path if needed
                              />
                            </ListItemAvatar>
                            <ListItemText primary={auditor.username} />
                            <Checkbox
                              edge="end"
                              onChange={() => handleAuditorToggle(auditor.id)}
                              checked={
                                checkedAuditors.indexOf(auditor.id) !== -1
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  </div>
                </div>
              )}
              {!!selectedEntity && !!popoverAnchorEl && (
                <Popover
                  open={open}
                  anchorEl={popoverAnchorEl}
                  onClose={handlePopoverClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                >
                  {renderAuditeeList(selectedEntity)}
                </Popover>
              )}
            </>
          )}
        </>
      </Drawer>
    </>
  );
};

export default DrggableScheduleDrawer;
