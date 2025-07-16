import {
  CircularProgress,
  Tooltip,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { Button, Drawer, Modal, Space, Tabs } from "antd";
import useStyles from "./style";

import { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { referencesData } from "recoil/atom";
import DocDetailsTab from "components/Document/CommonDrawerComponents/DocDetailsTab";
import WorkFlowTab from "components/Document/CommonDrawerComponents/WorkflowTab";
import TabsWrapper from "../TabsWrapper";

import AuditTrailDrawer from "components/Document/CommonDrawerComponents/AuditTrailDrawer";
import { processDocFormData, drawerData } from "recoil/atom";
import { useRecoilState } from "recoil";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import getAppUrl from "utils/getAppUrl";
import toFormData from "utils/toFormData";
import { MdOutlineExpandMore } from "react-icons/md";
import DetailsDrawer from "components/Document/CommonDrawerComponents/DetailsDrawer";

import CloseIconImageSvg from "assets/documentControl/Close.svg";

import AuditTrailImageSvg from "assets/documentControl/AuditTrail.svg";
import DocInfoIconImageSvg from "assets/documentControl/Info.svg";
import ExpandIconImageSvg from "assets/documentControl/expand1.svg";

import "./new.css";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import getSessionStorage from "utils/getSessionStorage";
import TextArea from "antd/es/input/TextArea";

const DocStateIdentifier: any = {
  "Send for Edit": "SEND_FOR_EDIT",
  "Review Complete": "IN_APPROVAL",
  Approve: "PUBLISHED",
  Publish: "PUBLISHED",
  "Send for Review": "IN_REVIEW",
  "Save as Draft": "DRAFT",
  Amend: "AMMEND",
  "Send for Approval": "IN_APPROVAL",
  Save: "Save",
};

type Props = {
  drawer?: any;
  setDrawer?: any;
  reloadList?: any;
  // reloadGraphs?: any;
};

const InboxDocumentDrawer = ({
  drawer,
  setDrawer,
  reloadList,
}: // reloadGraphs,
Props) => {
  const [activeTabKey, setActiveTabKey] = useState<any>(1);
  const [detailsDrawer, setDetailsDrawer] = useState<any>(false);
  const [auditTrailDrawer, setAuditTrailDrawer] = useState<any>({
    open: false,
    data: {},
  });

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const realmName = getAppUrl();
  const navigate = useNavigate();
  const location = useLocation();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  // const { socket } = useContext<any>(SocketContext);

  const [formData, setFormData] = useRecoilState(processDocFormData);
  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [docForm, setDocForm] = useState<any>();
  const [workFlowForm, setWorkFlowForm] = useState<any>();
  const [uploadFileError, setUploadFileError] = useState<any>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<any>([]);
  const [disableFormFields, setDisableFormFields] = useState<any>(false);
  const [selectedReviewerFormData, setSelectedReviewerFormData] = useState<any>(
    []
  );
  const [commnetValue, setCommentValue] = useState("");

  const [selectedApproverFormData, setSelectedApproverFormData] = useState<any>(
    []
  );
  const [favorite, setFavorite] = useState<boolean>(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");

  const [refsData] = useRecoilState(referencesData);

  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const [editTrue, setEditTrue] = useState(true);
  const [aceoffixEdit, setAceoffixEdit] = useState(false);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const [openModalForComment, setopenModalForComment] = useState(false);

  const onMenuClick = (e: any) => {
    handleSubmitForm(e);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDocFormCreated = (form: any) => {
    setDocForm(form);
  };
  const handleWorkFlowFormCreated = (form: any) => {
    setWorkFlowForm(form);
  };

  const isItemInDisableBtnFor = (disableBtnFor: any, item: any) => {
    return disableBtnFor.includes(item);
  };

  useEffect(() => {
    if (!location.pathname.includes("fullformview")) {
      // console.log("in current location, setting items");

      setDrawerDataState({
        ...drawerDataState,
        items: items,
      });
    }
  }, [items]);

  useEffect(() => {
    if (drawer?.mode === "edit") {
      setDrawerDataState({
        ...drawerDataState,
        id: drawer?.data?.id,
        formMode: "edit",
      });

      !drawer?.toggle && getDocData();
    } else if (drawer?.mode === "create") {
      // console.log("checkdoc drawer opened in create mode", drawer);
      const defaultButtonOptions = ["Save as Draft", "Send for Review"];

      setItems([...defaultButtonOptions]);
      setDrawerDataState({
        ...drawerDataState,
        items: [...defaultButtonOptions],
        id: null,
        formMode: "create",
      });
      !drawer?.toggle && getData();
    }
  }, [drawer?.open]);

  useEffect(() => {
    setDisableFormFields(
      isUserInApprovers(loggedInUser, selectedApproverFormData)
    );
  }, [loggedInUser, selectedApproverFormData]);

  const handleSubmitForm = async (option: string, submit = false) => {
    // console.log("option selected for handleSubmitForm--->", option);
    // console.log("in handlesubmit form-->", formData);
    // console.log("refs data on submit --->", refsData);

    try {
      let form;
      const { locationName } = formData;
      let formattedReferences: any = [];

      if (refsData && refsData.length > 0) {
        formattedReferences = refsData.map((ref: any) => ({
          refId: ref.refId,
          organizationId: orgId,
          type: ref.type,
          name: ref.name,
          comments: ref.comments,
          createdBy: userDetails.firstName + " " + userDetails.lastName,
          updatedBy: null,
          link: ref.link,
        }));
      }

      if (aceoffixEdit) {
        form = toFormData({
          ...formData,
          documentState: DocStateIdentifier[option],
          realmName: realmName,
          refsData: formattedReferences,
          system: [
            {
              id: "64d47b4ea5a0d9846d69fd8c",
            },
          ],
          aceoffixUrl:
            process.env.REACT_APP_API_URL +
            `/Temp/editTemp/${formData.documentLinkNew.split("/").pop()}`,
          //aceoffixUrl : `https://aceoffix.prodlelabs.com/Temp/editTemp/${formData.documentLinkNew.split("/").pop()}`
        });
      } else {
        form = toFormData({
          ...formData,
          documentState: DocStateIdentifier[option],
          realmName: realmName,
          refsData: formattedReferences,
          system: [
            {
              id: "64d47b4ea5a0d9846d69fd8c",
            },
          ],
        });
      }

      await docForm.validateFields();

      setUploadFileError(false);
      // console.log(selectedReviewerFormData, selectedApproverFormData);
      const IsApproverSelected = location.pathname.includes("fullformview")
        ? formData.approvers
        : selectedApproverFormData;

      const IsReviewerSelected = location.pathname.includes("fullformview")
        ? formData.reviewers
        : selectedReviewerFormData;

      // console.log("isapproverSelected", IsApproverSelected);
      // console.log("isRevewerSelected", IsReviewerSelected);
      // console.log(
      //   "selectedAppprover, selectedRever",
      //   selectedApproverFormData,
      //   selectedReviewerFormData
      // );

      if (
        (!formData.approvers ||
          !formData.approvers.length ||
          !formData.reviewers ||
          !formData.reviewers.length) &&
        (DocStateIdentifier[option] === "IN_REVIEW" ||
          DocStateIdentifier[option] === "IN_APPROVAL")
      ) {
        // console.log(
        //   "checkdoc no reviewre and approvers found and option is not draft"
        // );
        if (formData.reviewers.length === 0) {
          enqueueSnackbar(`Please Select Reviewers`, {
            variant: "warning",
          });
        }

        if (formData.approvers.length === 0) {
          enqueueSnackbar(`Please Select Approvers`, {
            variant: "warning",
          });
        }

        return;
      }

      if (drawer?.mode === "create" || drawerDataState?.formMode === "create") {
        try {
          if (
            formData.file === "" &&
            DocStateIdentifier[option] === "IN_REVIEW"
          ) {
            enqueueSnackbar(`Please Attach The File`, {
              variant: "warning",
            });
            return;
          }
          let res;
          if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
            res = await axios.post(
              `api/documents/objectStore?realm=${realmName}&locationName=${locationName}`,
              form
            );
          } else {
            res = await axios.post(
              `api/documents?realm=${realmName}&locationName=${locationName}`,
              form
            );
          }
          if (res.status === 200 || res.status === 201) {
            if (DocStateIdentifier[option] === "DRAFT") {
              // socket?.emit("documentCreated", {
              //   data: res.data,
              //   currentUser: `${loggedInUser.id}`,
              // });
            }
            if (drawer) {
              handleCloseModal();
              // reloadGraphs();
            }
            if (location.pathname.includes("fullformview")) {
              navigate("/processdocuments/processdocument");
            }
            enqueueSnackbar(`Document ${option} Successfully`, {
              variant: "success",
            });
          }
        } catch (err: any) {
          if (err.response.status === 409) {
            enqueueSnackbar(`Document Name Already Exists`, {
              variant: "error",
            });
          } else {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
          }
          setIsLoading(false);
        }
      } else if (
        drawer?.mode === "edit" ||
        drawerDataState?.formMode === "edit"
      ) {
        if (!formData?.reasonOfCreation) {
          enqueueSnackbar(`Enter Reason of Creation/Amendment`, {
            variant: "warning",
          });
          return;
        }
        if (DocStateIdentifier[option] === "IN_REVIEW") {
          const switchOverData = formData.documentLink
            ? false
            : formData.file
            ? false
            : true;
          if (
            formData.reviewers.length === 0 ||
            formData.approvers.length === 0 ||
            switchOverData
          ) {
            enqueueSnackbar(`Please Attach The File`, {
              variant: "warning",
            });
            return;
          }
        }

        if (
          formData.file === "" &&
          DocStateIdentifier[option] === "AMMEND" &&
          !submit
        ) {
          enqueueSnackbar(`Please Attach The File`, {
            variant: "warning",
          });
          return;
        }
        console.log("editTrue", editTrue);
        if (DocStateIdentifier[option] === "SEND_FOR_EDIT" && !submit) {
          setopenModalForComment(true);
          // enqueueSnackbar(`Please Attach The File`, {
          //   variant: "warning",
          // });
          return;
        }
        const docId = location.pathname.includes("fullformview")
          ? formData?.id
          : drawer?.data.id;
        // console.log("inside edit", docId);
        try {
          const res = await axios.patch(
            `api/documents/${docId}?realm=${realmName}&locationName=${locationName}`,
            form
          );

          if (res.status === 200 || res.status === 201) {
            setIsLoading(false);
            enqueueSnackbar(`Document ${option} Successfully`, {
              variant: "success",
            });
            // socket?.emit("documentUpdated", {
            //   data: res.data,
            //   currentUser: `${loggedInUser.id}`,
            // });
            if (drawer) {
              handleCloseModal();
              // reloadGraphs();
            }
            // if (!!location.pathname.includes("fullformview")) {
            navigate("/processdocuments/processdocument");
            // }
          }
        } catch (err: any) {
          // console.log("error in catch of patch request-->", err);

          setIsLoading(false);
          enqueueSnackbar(`Request Failed ${err.response.status}`, {
            variant: "error",
          });
        }
      } else {
        //drawer opened unexpectedly
        return;
      }
    } catch (error: any) {
      // console.log("error in submitting form", error);
      if (
        error?.errorFields?.some((field: any) => field.name[0] === "uploader")
      ) {
        setUploadFileError(true); // Set error state if validation failed for uploader
      }
    }
  };
  const getData = async () => {
    console.log("checkdoc getData gets called", drawer);

    try {
      const res = await axios.get(
        "/api/doctype/documents/getDoctypeCreatorDetails"
      );
      console.log("res in getdata", res.data.doctypes?.[0]?.distributionList);
      setFormData({
        ...formData,
        documentName: "",
        reasonOfCreation: "",
        description: "",
        tags: [],
        systems: [],
        doctypeName: undefined,
        reviewers: undefined,
        approvers: undefined,
        file: "",
        locationName: res.data.userLocation.locationName,
        entityName: res.data.userDepartment.entityName,
        locationId: res.data.userLocation.id,
        entityId: res.data.userDepartment.id,
        docTypes: res.data.doctypes,
        distributionList: undefined,
        readAccess: undefined,
      });
    } catch (err) {
      enqueueSnackbar(`You are not a Creator in any Document Type`, {
        variant: "error",
      });
      handleCloseModal();
    }
  };

  function isUserInApprovers(loggedInUser: any, approvers: any) {
    return approvers?.some(
      (approver: any) => approver.email === loggedInUser.email
    );
  }
  console.log("drawer.data?.id", drawer);
  const getDocData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `api/documents/getSingleDocument/${drawer?.data?.id}`
      );
      const buttonOptionsResponse = await axios.get(
        `/api/documents/checkUserPermissions/${drawer?.data?.id}`
      );
      const filteredOptions = buttonOptionsResponse?.data?.filter(
        (option: string) => {
          return (
            process.env.REACT_APP_IS_ACEOFFIX === "true" ||
            option !== "Inline Edit"
          );
        }
      );
      const disableBtnFor = ["In Review", "In Approval"];
      const newItems = filteredOptions.map((option: any, index: any) => {
        const disabled =
          isItemInDisableBtnFor(disableBtnFor, option) ||
          isUserInApprovers(loggedInUser, formData?.approvers);
        return { key: (index + 1).toString(), label: option, disabled };
      });
      const tempNewItems = newItems.map((item: any) => item.label);
      setItems([...tempNewItems]);

      setFormData({
        ...formData,
        ...res.data,
        systems: res.data.system,
        doctypeName: res.data.docType,
        docsClassification: res.data.doctype.document_classification,
        locationName: res.data.creatorLocation.locationName,
        entityName: res.data.creatorEntity.entityName,
        locationId: res.data.creatorLocation.id,
        entityId: res.data.creatorEntity.id,
        docTypes: [res.data.doctype],
        readAccess: res.data.readAccess,
        referenceDocuments: res.data.ReferenceDocuments,
        status: res?.data?.documentState,
        sectionName: res?.data?.sectionName,
        readAccessUsers: res.data.readAccessUsers,
        issueNumber: res.data.issueNumber,
        reviewers: res?.data?.reviewers || [],
        approvers: res?.data?.approvers || [],
      });
      setSelectedReviewerFormData([
        ...(res?.data?.reviewers?.map((item: any) => ({
          ...item,
          label: item.email,
          value: item.id,
        })) || []),
      ]);
      setSelectedApproverFormData([
        ...(res?.data?.approvers?.map((item: any) => ({
          ...item,
          label: item.email,
          value: item.id,
        })) || []),
      ]);

      setIsLoading(false);
    } catch (err) {
      console.log("err inside 1", err);
      enqueueSnackbar(`Could not get Data, Check your internet connection`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const handleCommentSubmit = async (value: string) => {
    if (value) {
      try {
        const res = await axios.post("/api/documents/createComment", {
          documentId: location.pathname.includes("fullformview")
            ? formData?.id
            : drawer?.data.id,
          commentText: value,
        });

        enqueueSnackbar(`Comment Added Successfully`, { variant: "success" });
        setEditTrue(false);
        setopenModalForComment(false);
        await handleSubmitForm("Send for Edit", true);
      } catch (err: any) {
        enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
          variant: "success",
        });
      }
    } else {
      enqueueSnackbar(`Enter a comment`, { variant: "warning" });
    }
  };
  const handleCloseModal = () => {
    setDrawer({
      ...drawer,
      open: !drawer.open,
      data: {},
    });
  };

  const toggleAuditTrailDrawer = (data: any = {}) => {
    setAuditTrailDrawer({
      ...auditTrailDrawer,
      open: !auditTrailDrawer.open,
      data: { ...data },
    });
  };

  const toggleDetailsDrawer = (data: any = {}) => {
    setDetailsDrawer({
      ...detailsDrawer,
      open: !detailsDrawer.open,
      data: { ...data },
    });
  };

  const onTabsChange = (key: string) => {
    setActiveTabKey(key);
  };

  const tabs = [
    {
      label: "Doc Info",
      key: 1,
      children: (
        <DocDetailsTab
          drawer={drawer}
          setDrawer={setDrawer}
          handleDocFormCreated={handleDocFormCreated}
          uploadFileError={uploadFileError}
          setUploadFileError={setUploadFileError}
          disableFormFields={disableFormFields}
          isEdit={drawer?.mode === "create" ? false : true}
        />
      ),
    },
    {
      label: "Workflow",
      key: 2,
      children: (
        <WorkFlowTab
          drawer={drawer}
          setDrawer={setDrawer}
          handleDocFormCreated={handleDocFormCreated}
          workFlowForm={workFlowForm}
          setWorkFlowForm={setWorkFlowForm}
          handleWorkFlowFormCreated={handleWorkFlowFormCreated}
          disableFormFields={disableFormFields}
          selectedReviewerFormData={selectedReviewerFormData}
          setSelectedReviewerFormData={setSelectedReviewerFormData}
          selectedApproverFormData={selectedApproverFormData}
          setSelectedApproverFormData={setSelectedApproverFormData}
          isEdit={drawer?.mode === "create" ? false : true}
        />
      ),
    },
    {
      label: "References",
      key: 3,
      children: <CommonReferencesTab drawer={drawer} />,
    },
  ];

  const inlineEdit = async () => {};

  return (
    <div>
      {location.pathname.includes("fullformview") ? (
        <TabsWrapper
          drawer={drawer}
          setDrawer={setDrawer}
          activeTabKey={activeTabKey}
          onTabsChange={onTabsChange}
          handleDocFormCreated={handleDocFormCreated}
          uploadFileError={uploadFileError}
          setUploadFileError={setUploadFileError}
          disableFormFields={disableFormFields}
          workFlowForm={workFlowForm}
          setWorkFlowForm={setWorkFlowForm}
          handleWorkFlowFormCreated={handleWorkFlowFormCreated}
          // isWorkflowValid={isWorkflowValid}
          // setIsWorkflowValid={setIsWorkflowValid}
          selectedReviewerFormData={selectedReviewerFormData}
          setSelectedReviewerFormData={setSelectedReviewerFormData}
          selectedApproverFormData={selectedApproverFormData}
          setSelectedApproverFormData={setSelectedApproverFormData}
          handleSubmit={handleSubmitForm}
          items={items}
          onMenuClick={onMenuClick}
          isUserInApprovers={isUserInApprovers}
        />
      ) : (
        <div className={classes.drawer}>
          <Drawer
            title={drawer.mode === "create" ? "Add Document" : "Edit Document"}
            placement="right"
            open={drawer.open}
            closeIcon={
              <img
                src={CloseIconImageSvg}
                alt="close-drawer"
                style={{ width: "36px", height: "38px", cursor: "pointer" }}
              />
            }
            onClose={handleCloseModal}
            className={classes.drawer}
            maskClosable={false}
            width={"45%"}
            style={{ transform: "none !important" }}
            extra={
              <div style={{ display: "flex" }}>
                <Tooltip title="View Audit Trail">
                  <img
                    src={AuditTrailImageSvg}
                    alt="audit-trail"
                    onClick={toggleAuditTrailDrawer}
                    className={classes.auditTrailIcon}
                  />
                </Tooltip>
                <Tooltip title="View Doc Details">
                  <img
                    src={DocInfoIconImageSvg}
                    alt="doc-info"
                    onClick={toggleDetailsDrawer}
                    className={classes.docInfoIcon}
                  />
                </Tooltip>
                <Tooltip title="Expand Form">
                  <img
                    src={ExpandIconImageSvg}
                    alt="expand=form"
                    onClick={() => navigate(`/Inbox/fullformview`)}
                    className={classes.expandIcon}
                  />
                </Tooltip>
                <Space>
                  <Button
                    onClick={handleClick}
                    style={{ display: "flex", alignItems: "center" }}
                    disabled={items?.length === 0}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      {selectedItem || "Actions"}
                    </span>
                    <MdOutlineExpandMore
                      style={{
                        fill: `${items?.length === 0 ? "gray" : "#0e497a"}`,
                      }}
                    />
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    {items &&
                      items.length > 0 &&
                      items?.map((item: any, index: any) => (
                        <MenuItem
                          key={index + 1}
                          onClick={() => {
                            if (item === "Inline Edit") {
                              inlineEdit();
                            } else {
                              onMenuClick(item);
                            }
                          }}
                          disabled={
                            item === "In Approval" || item === "In Review"
                          }
                        >
                          {item}
                        </MenuItem>
                      ))}
                  </Menu>
                </Space>
              </div>
            }
          >
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </div>
            ) : (
              <>
                <div className={classes.tabsWrapper}>
                  <Tabs
                    defaultActiveKey="1"
                    onChange={(key) => {
                      onTabsChange(key);
                    }}
                    activeKey={activeTabKey}
                    type="card"
                    items={tabs as any}
                    animated={{ inkBar: true, tabPane: true }}
                  />
                </div>
                <div>
                  {!!detailsDrawer && (
                    <DetailsDrawer
                      detailsDrawer={detailsDrawer}
                      setDetailsDrawer={setDetailsDrawer}
                      formData={formData}
                      toggleDetailsDrawer={toggleDetailsDrawer}
                    />
                  )}
                </div>
                <div>
                  {!!auditTrailDrawer.open && (
                    <AuditTrailDrawer
                      auditTrailDrawer={auditTrailDrawer}
                      setAuditTrailDrawer={setAuditTrailDrawer}
                      toggleAuditTrailDrawer={toggleAuditTrailDrawer}
                    />
                  )}
                </div>
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
                          Enter Reason for Send for Edit ?
                        </div>
                        <div style={{ paddingTop: "10px" }}>
                          <TextArea
                            rows={4}
                            onChange={(e) => {
                              setCommentValue(e.target.value);
                            }}
                            value={commnetValue}
                          ></TextArea>
                        </div>
                      </>
                    }
                    // icon={<ErrorIcon />}
                    open={openModalForComment}
                    onOk={() => {}}
                    onCancel={() => {
                      // setOpenModal(false);
                      setopenModalForComment(false);
                    }}
                    footer={[
                      <Button
                        key="submit"
                        type="primary"
                        style={{ backgroundColor: "#003059" }}
                        onClick={() => {
                          setopenModalForComment(false);
                        }}
                      >
                        Cancel
                      </Button>,
                      <Button
                        key="submit"
                        type="primary"
                        style={{ backgroundColor: "#003059" }}
                        onClick={() => {
                          handleCommentSubmit(commnetValue);
                          setEditTrue(false);
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
              </>
            )}
          </Drawer>
        </div>
      )}
    </div>
  );
};

export default InboxDocumentDrawer;
