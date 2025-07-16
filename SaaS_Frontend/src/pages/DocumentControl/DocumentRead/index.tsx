import { CircularProgress, Grid, Theme, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewDocMobile from "containers/ViewDocMobile";
import ViewDocNormal from "containers/ViewDocNormal";
import DocumentViewer from "components/Document/DocumentTable/DocumentViewDrawer/DocumentViewer";
import { useRecoilState, useRecoilValue } from "recoil";
import { drawerData, mobileView } from "recoil/atom";
import ProcessDocFormWrapper from "containers/ProcessDocFormWrapper";
import axios from "apis/axios.global";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  referenceDocumentsTableHeader,
  workflowHistoryTableHeader,
  versionHistoryTableHeader,
  versionHistoryTableFields,
  workflowHistoryTableFields,
  referenceDocumentsTableFields,
  attachmentHistoryTableHeader,
  attachmentHistoryTableFields,
} from "./constants";
import { Modal } from "antd";
import getAppUrl from "utils/getAppUrl";
// import getUserId from "utils/getUserId";
import { useMediaQuery } from "@material-ui/core";
import DocumentDrawer from "components/Document/DocumentTable/DocumentDrawer";

const DocStateIdentifier: any = {
  "Send for Edit": "SEND_FOR_EDIT",
  "Review Complete": "IN_APPROVAL",
  Approve: "PUBLISHED",
  Publish: "PUBLISHED",
  "Send for Review": "IN_REVIEW",
  "Save as Draft": "DRAFT",
  Amend: "AMMEND",
  "Send for Approval": "IN_APPROVAL",
};

type Props = {
  id?: string;
  setId?: React.Dispatch<React.SetStateAction<string>>;
  reloadList?: any;
  name?: string;
  // docState? :string
  modal2Open: any;
  setModal2Open: any;
};

const useStyles = makeStyles((theme: Theme) => ({
  labelContainer: {
    display: "flex",
    alignItems: "center",
    marginRight: "16px",
  },
  labelStyle: {
    // paddingRight: "60px",
    width: "100px",
    whiteSpace: "normal",
    color: "gray",
  },

  rowStyle: {
    padding: "3px",
  },
  colWrapper: {
    display: "flex",
    alignItems: "center",
  },
  iconWrapper: {
    padding: "2px",
    fill: "gray",
    width: "0.85em",
    height: "0.85em",
  },
  iconStyle: {
    padding: "2px",
    fill: "gray",
    width: "1em",
    height: "1em",
  },
  tabsWrapper: {
    "& .ant-tabs .ant-tabs-tab": {
      // padding: "14px 9px",
      backgroundColor: "#F3F6F8",
      color: "#0E497A",
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "0.8px",
    },
    "& .ant-tabs-tab-active": {
      // padding: "14px 9px",
      backgroundColor: "#006EAD !important",
      color: "#fff !important",
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "0.8px",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: 600,
      fontSize: "14px",
      letterSpacing: "0.8px",
    },
    "& .ant-tabs .ant-tabs-tab+.ant-tabs-tab": {
      margin: "0 0 0 25px",
    },
  },
  alternateRowColor1: {
    backgroundColor: "#ffffff", // change as per your need
  },
  alternateRowColor2: {
    backgroundColor: "#f7f7f7", // change as per your need
  },
  tableWrapper: {
    // width: "30%",
    // "& .ant-table-wrapper": {
    //   width: "30%",
    // },
    paddingLeft: "10px",
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      padding: "8px 16px",
      fontWeight: 600,
      fontSize: "13px",
      background: "#E8F3F9",
    },
    "& .ant-table-body": {
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
  },
}));

function DocumentRead({
  id = "",
  name,
  reloadList,
  modal2Open,
  setModal2Open,
}: Props) {
  const mobView = useRecoilValue(mobileView);
  const [formData, setFormData] = React.useState<any>();
  const [options, setOptions] = React.useState<any>();

  const [rerender, setRerender] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [commentsLoader, setCommentsLoader] = React.useState(false);
  const [comments, setComments] = React.useState<any>([]);
  const [renderedFrom, setRenderedFrom] = useState<string>("");
  const [reloadId, setReloadId] = useState<boolean>(false);
  const [openModalForComment, setopenModalForComment] = useState(false);

  const matches = useMediaQuery("(min-width:786px)");

  const realm = getAppUrl();
  const params = useParams();
  const paramArg: string = params.id!;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const realmName = getAppUrl();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const queryParams = new URLSearchParams(location.search);
  const versionId = queryParams.get("versionId");
  const [workflowHistoryTableData, setWorkflowHistoryTableData] = useState<any>(
    []
  );
  const [attachmentHistoryTableData, setAttachmentHistoryTableData] = useState<
    any[]
  >([]);
  const version = queryParams.get("version") ? true : false;
  const [docId, setDocId] = useState<string>(id ? id : paramArg);
  const classes = useStyles();
  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });

  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);
  const [buttonStatus, setButtonStatus] = useState(false);

  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") as any);

  // const [reloadId, setReloadId] = useState<boolean>(false);
  // Know where the request is from, if its /inbox or /processdocuemnts
  // console.log("inside doc read", id, name);

  const handlerButtonStatus = () => {
    if (buttonStatus === true) {
      setButtonStatus(false);
    } else {
      setButtonStatus(true);
    }
  };

  useEffect(() => {
    if (location.state && location.state.drawerOpenEditMode) {
      // Open the drawer
      setDrawer({
        ...drawer,
        open: !drawer.open,
        mode: "edit",
        toggle: true,
        clearFields: false,
        data: { ...drawer?.data, id: drawerDataState?.id },
      });
    }
  }, [location]);

  useEffect(() => {
    if (location.pathname.toLowerCase().includes("/inbox")) {
      setRenderedFrom("inbox");
      setDocId(id);
    } else if (
      location.pathname
        .toLowerCase()
        .includes("/processdocuments/processdocument/viewprocessdocument")
    ) {
      setRenderedFrom("process");
      setDocId(paramArg);
    } else if (
      location.pathname.toLowerCase().includes("/processdocuments/viewdoc")
    ) {
      setRenderedFrom("process");
      setDocId(paramArg);
    }
  }, [location, id, params]);
  // console.log("docid", docId);

  const openVersionDoc = (id: any) => {
    navigate(
      `/processdocuments/processdocument/viewprocessdocument/${id}?version=true`
    );
  };

  const getDocData = async () => {
    try {
      setIsLoading(true);
      const res = version
        ? await axios.get(
            `/api/documents/getSingleDocument/${docId}?version=true&versionId=${versionId}`
          )
        : await axios.get(
            `/api/documents/getSingleDocument/${docId}?versionId=${versionId}`
          );
      const isFav = res?.data?.favoriteFor?.includes(userDetails?.id);
      setIsFavorite(isFav);
      setFormData({
        ...res.data,
        documentLinkNew: res.data?.documentLink,
        documentLink: res?.data?.documentLink,
        locationName: res.data.location?.locationName,
        status: res?.data?.documentState,
        sectionName: res?.data?.sectionName,
        documentName: res?.data?.documentName,
        description: res?.data?.description,
        downloadAccess: res?.data?.downloadAccess,

        system: res?.data?.system,
        systemNames:
          res?.data?.docTypeDetails?.applicable_systems?.map(
            (item: any) => item?.name
          ) || [],
        entityName: res.data?.entity?.entityName,
        docType: res.data.docTypeDetails?.documentTypeName,

        // attachmentHistory: res.data?.attachmentHistory?.map((item: any) => ({
        //   updatedBy: item.updatedBy,
        //   attachment: item.attachment,
        //   updatedAt: item.updatedAt,
        // })),
        // DocumentWorkFlowHistory: res.data.DocumentWorkFlowHistory.map(
        //   (item: any) => ({
        //     ...item,
        //     actionName:
        //       item.actionName === "IN_REVIEW"
        //         ? "For Review"
        //         : item.actionName === "IN_APPROVAL"
        //         ? "For Approval"
        //         : item.actionName === "AMMEND"
        //         ? "Amend"
        //         : item.actionName === "DRAFT"
        //         ? "Draft"
        //         : item.actionName === "APPROVED"
        //         ? "Approved"
        //         : item.actionName === "PUBLISHED"
        //         ? "Published"
        //         : item.actionName === "REVIEW_COMPLETE"
        //         ? "Review Complete"
        //         : item.actionName === "SEND_FOR_EDIT"
        //         ? "Send For Edit"
        //         : item.actionName === "RETIRE_INREVIEW"
        //         ? "Retire In Review"
        //         : item.actionName === "RETIRE_INAPPROVE"
        //         ? "Retire In Approve"
        //         : item.actionName === "RETIRE"
        //         ? "Retire"
        //         : "N/A",
        //     createdAt: new Date(item.createdAt).toDateString(),
        //   })
        // ),
        // DocumentVersions: res.data.DocumentVersions.map((item: any) => ({
        //   ...item,
        //   approvedDate: new Date(item?.approvedDate).toDateString(),
        //   versionLink: (
        //     <div
        //       onClick={() => {
        //         openVersionDoc(item.id);
        //       }}
        //       style={{ textDecoration: "underline", cursor: "pointer" }}
        //     >
        //       Link
        //     </div>
        //   ),
        // })),
        // ReferenceDocuments: res.data.ReferenceDocuments.map((item: any) => ({
        //   ...item,
        //   documentLink: (
        //     <a
        //       href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${item.refId}`}
        //       target="_blank"
        //       rel="noreferrer"
        //     >
        //       Link
        //     </a>
        //   ),
        // })),
        ReferenceDocuments: [],
        DocumentVersions: [],
      });

      setIsLoading(false);
    } catch (err) {
      // console.log("err inside 0", err);
      enqueueSnackbar(`Could not get Data, Check your internet connection`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };
  // console.log("formdata in doc read", formData);

  const handleEditDocument = (data: any = {}) => {
    setDrawer({
      ...drawer,
      mode: "edit",
      clearFields: false,
      toggle: false,
      data: {
        id: docId,
      },
      open: !drawer.open,
    });
  };

  const getUserOptions = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `/api/documents/checkUserPermissions/${docId}`
      );
      // console.log("res,data", res?.data);
      setOptions(res.data);
      // setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleFavorite = async (docData: any) => {
    try {
      const res = await axios.patch(
        `/api/documents/markDocumentAsFavorite/${docId}/${userDetails?.id}`
      );
      if (res.status === 200 || res.status === 201) {
        //  message.success("Document marked as favorite");
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      //  message.error("Error in marking as favorite");
    }
  };

  const handleRemoveFavorite = async (docData: any) => {
    try {
      const res = await axios.patch(
        `/api/documents/removeDocumentFromFavorites/${docId}/${userDetails?.id}`
      );
      if (res.status === 200 || res.status === 201) {
        // message.success("Document Removed From Favorites");
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      // message.error("Error in Removing from Favorites");
    }
  };

  const handleCommentSubmit = async (value: string) => {
    setCommentsLoader(true);
    if (value) {
      try {
        const res = await axios.post("/api/documents/createDocumentComment", {
          documentId: formData?._id,
          commentText: value,
          organizationId: userDetails?.organizationId,
          commentBy: userDetails?.id,
        });
        enqueueSnackbar(`Comment Added Successfully`, { variant: "success" });
        setComments(""); // Clear input on success
        getComments(); // Refresh list
      } catch (err: any) {
        enqueueSnackbar(`Request Failed, Code: ${err.response?.status}`, {
          variant: "error",
        });
      } finally {
        setCommentsLoader(false);
      }
    } else {
      enqueueSnackbar(`Enter a comment`, { variant: "warning" });
      setCommentsLoader(false);
    }
  };

  const getComments = async () => {
    setCommentsLoader(true);
    try {
      const res = await axios.get(
        `/api/documents/getDocumentComments/${docId}`
      );
      setComments(res.data); // res.data already includes userDetails
    } catch (err) {
      enqueueSnackbar(
        `Could not get Comments, Check your internet connection`,
        { variant: "error" }
      );
    } finally {
      setCommentsLoader(false);
    }
  };

  const getAttachmentHistory = async () => {
    try {
      const res = await axios.get(
        `/api/documents/getAttachmentHistory/${docId}`
      );
      // setFormData({ ...formData, attachmentHistory: res?.data });
      setAttachmentHistoryTableData(res.data);
    } catch (err) {
      enqueueSnackbar("Failed to load attachment history", {
        variant: "error",
      });
    }
  };

  const handleSubmit = async (option: string, submit = false) => {
    const user: any = sessionStorage.getItem("userDetails");

    if (DocStateIdentifier[option] === "SEND_FOR_EDIT" && !submit) {
      setopenModalForComment(true);

      return;
    } else if (DocStateIdentifier[option] === "SEND_FOR_EDIT" && submit) {
      // console.log("inside submit for send for edit");
      const formDataPayload = new FormData();

      formDataPayload.append("documentName", formData.documentName);
      formDataPayload.append("reasonOfCreation", formData.reasonOfCreation);
      formDataPayload.append("system", formData.system);
      formDataPayload.append("documentState", DocStateIdentifier[option]);
      formDataPayload.append("createdBy", formData?.createdByDetails?.id);

      formDataPayload.append("realmName", realmName);
      formDataPayload.append(
        "locationName",
        userDetails?.location?.locationName
      );
      formDataPayload.append("updatedBy", userDetails?.id);
      formDataPayload.append("organizationId", userDetails?.organizationId);

      formData.reviewers.forEach((r: string) =>
        formDataPayload.append("reviewers", r)
      );
      formData.approvers.forEach((a: string) =>
        formDataPayload.append("approvers", a)
      );
      const res = await axios.patch(
        `/api/documents/updateDocumentForSendForEdit/${docId}`,
        formDataPayload
      );
    } else if (option === "Approve") {
      const formDataPayload = new FormData();

      formDataPayload.append("documentName", formData.documentName);
      formDataPayload.append("reasonOfCreation", formData.reasonOfCreation);
      formDataPayload.append("system", formData.system);
      formDataPayload.append("documentState", "PUBLISHED");
      formDataPayload.append("createdBy", formData?.createdByDetails?.id);

      formDataPayload.append("realmName", realmName);
      formDataPayload.append(
        "locationName",
        userDetails?.location?.locationName
      );
      formDataPayload.append("updatedBy", userDetails?.id);
      formDataPayload.append("organizationId", userDetails?.organizationId);

      formData.reviewers.forEach((r: string) =>
        formDataPayload.append("reviewers", r)
      );
      formData.approvers.forEach((a: string) =>
        formDataPayload.append("approvers", a)
      );
      const res = await axios.patch(
        `/api/documents/updateDocumentForPublishedState/${docId}`,
        formDataPayload
      );

      // updateDocumentForPublishedState
    } else if (DocStateIdentifier[option] === "IN_REVIEW") {
      const formDataPayload = new FormData();

      formDataPayload.append("documentName", formData.documentName);
      formDataPayload.append("reasonOfCreation", formData.reasonOfCreation);
      formDataPayload.append("system", formData.system);
      formDataPayload.append("documentState", "IN_REVIEW");
      formDataPayload.append("createdBy", formData?.createdByDetails?.id);
      formDataPayload.append("realmName", realmName);
      formDataPayload.append(
        "locationName",
        userDetails?.location?.locationName
      );
      formDataPayload.append("updatedBy", userDetails?.id);
      formDataPayload.append("organizationId", userDetails?.organizationId);

      formData.reviewers.forEach((r: string) =>
        formDataPayload.append("reviewers", r)
      );
      formData.approvers.forEach((a: string) =>
        formDataPayload.append("approvers", a)
      );

      const res = await axios.patch(
        `/api/documents/updateDocumentForReview/${docId}`,
        formDataPayload
      );
    } else if (option === "Save") {
      const formDataPayload = new FormData();
      formDataPayload.append("documentName", formData.documentName);
      formDataPayload.append("reasonOfCreation", formData.reasonOfCreation);
      formDataPayload.append("system", formData.selectedSystem);
      // formDataPayload.append("documentState", formData);
      formDataPayload.append("createdBy", formData?.createdByDetails?.id);

      formDataPayload.append("realmName", realmName);
      formDataPayload.append(
        "locationName",
        userDetails?.location?.locationName
      );
      formDataPayload.append("updatedBy", userDetails?.id);
      formDataPayload.append("organizationId", userDetails?.organizationId);

      formData.reviewers.forEach((r: string) =>
        formDataPayload.append("reviewers", r)
      );
      formData.approvers.forEach((a: string) =>
        formDataPayload.append("approvers", a)
      );

      const res = await axios.patch(
        `/api/documents/updateDocInDraftMode/${docId}`,
        formDataPayload
      );
    } else if (option === "Review Complete") {
      const formDataPayload = new FormData();

      formDataPayload.append("documentName", formData.documentName);
      formDataPayload.append("reasonOfCreation", formData.reasonOfCreation);
      formDataPayload.append("system", formData.system);
      formDataPayload.append("documentState", "IN_APPROVAL");
      formDataPayload.append("createdBy", formData?.createdByDetails?.id);

      formDataPayload.append("realmName", realmName);
      formDataPayload.append(
        "locationName",
        userDetails?.location?.locationName
      );
      formDataPayload.append("updatedBy", userDetails?.id);
      formDataPayload.append("organizationId", userDetails?.organizationId);

      formData.reviewers.forEach((r: string) =>
        formDataPayload.append("reviewers", r)
      );
      formData.approvers.forEach((a: string) =>
        formDataPayload.append("approvers", a)
      );
      const res = await axios.patch(
        `/api/documents/updateDocumentForApproval/${docId}`,
        formDataPayload
      );
    } else if (option === "Approve") {
      const formDataPayload = new FormData();

      formDataPayload.append("documentName", formData.documentName);
      formDataPayload.append("reasonOfCreation", formData.reasonOfCreation);
      formDataPayload.append("system", formData.selectedSystem);
      formDataPayload.append("documentState", "PUBLISHED");
      formDataPayload.append("createdBy", formData?.createdByDetails?.id);
      formDataPayload.append("realmName", realmName);
      formDataPayload.append(
        "locationName",
        userDetails?.location?.locationName
      );
      formDataPayload.append("updatedBy", userDetails?.id);
      formDataPayload.append("organizationId", userDetails?.organizationId);

      formData.reviewers.forEach((r: string) =>
        formDataPayload.append("reviewers", r)
      );
      formData.approvers.forEach((a: string) =>
        formDataPayload.append("approvers", a)
      );
      const res = await axios.patch(
        `/api/documents/updateDocumentForPublishedState/${docId}`,
        formDataPayload
      );

      // updateDocumentForPublishedState
    }
    try {
      setIsLoading(true);

      //Reload Inbox list if request is from path /inbox else navigate to /processdocument
      if (renderedFrom === "inbox") {
        reloadList(true);
      } else {
        navigate("/processdocuments/processdocument");
      }
      // socket?.emit("documentUpdated", {
      //   data: { id: docId },
      //   currentUser: `${userId}`,
      // });
      // setIsLoading(false);
      enqueueSnackbar(`${option} Successful`, { variant: "success" });
    } catch (err: any) {
      setIsLoading(false);
      // console.log("errror in handle submit set status", err);

      enqueueSnackbar(`Request Failed ${err.response.status}`, {
        variant: "error",
      });
    }
  };

  React.useEffect(() => {
    !version && getUserOptions();
    getDocData();
    getComments();

    getAttachmentHistory();
    getDocWorkflowHistory();
  }, [docId]);
  const getDocWorkflowHistory = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `/api/documents/getdocworkflowhistory/${docId}`
      );
      if (res.status === 200 || res.status === 201) {
        setIsLoading(false);

        setWorkflowHistoryTableData(res?.data);
      } else {
        setIsLoading(false);
        setWorkflowHistoryTableData([]);
      }
    } catch (err) {
      setIsLoading(false);
      setWorkflowHistoryTableData([]);
      enqueueSnackbar(`Could not get Data, Check your internet connection`, {
        variant: "error",
      });
    }
  };
  const toggleCommentsDrawer = (data: any = {}) => {
    setCommentDrawer({
      ...commentDrawer,
      open: !commentDrawer.open,
      data: { ...data },
    });
  };

  return (
    <>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {formData && (
            <>
              {matches ? (
                <>
                  <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                    <ProcessDocFormWrapper
                      parentPageLink="/processdocuments/processdocument"
                      handleSubmit={handleSubmit}
                      options={options}
                      disableBtnFor={["In Review", "In Approval", "Amend"]}
                      favorite={isFavorite}
                      handleFavorite={handleFavorite}
                      handleRemoveFavorite={handleRemoveFavorite}
                      handleEditDocument={handleEditDocument}
                      name={name}
                      formData={formData}
                      openModalForComment={openModalForComment}
                      setopenModalForComment={setopenModalForComment}
                      handleCommentSubmit={handleCommentSubmit}
                      docState={formData?.documentState}
                      reloadlist={reloadList}
                    >
                      {matches ? (
                        <DocumentViewer fileLink={formData.documentLinkNew} />
                      ) : (
                        ""
                      )}
                    </ProcessDocFormWrapper>
                  </Grid>
                </>
              ) : (
                <></>
              )}
              <Grid item xs={12} sm={4} md={4}>
                {mobView ? (
                  <>
                    <ViewDocMobile
                      handleCommentSubmit={handleCommentSubmit}
                      versionHistoryTableHeader={versionHistoryTableHeader}
                      referenceDocumentsTableHeader={
                        referenceDocumentsTableHeader
                      }
                      workflowHistoryTableHeader={workflowHistoryTableHeader}
                      versionHistoryTableFields={versionHistoryTableFields}
                      workflowHistoryTableFields={workflowHistoryTableFields}
                      attachmentHistoryTableHeader={
                        attachmentHistoryTableHeader
                      }
                      attachmentHistoryTableFields={
                        attachmentHistoryTableFields
                      }
                      referenceDocumentsTableFields={
                        referenceDocumentsTableFields
                      }
                      formData={formData}
                      commentData={comments}
                      commentsLoader={commentsLoader}
                      version={version}
                    />
                  </>
                ) : (
                  <>
                    {matches ? (
                      <>
                        {" "}
                        <ViewDocNormal
                          handleCommentSubmit={handleCommentSubmit}
                          versionHistoryTableHeader={versionHistoryTableHeader}
                          referenceDocumentsTableHeader={
                            referenceDocumentsTableHeader
                          }
                          workflowHistoryTableHeader={
                            workflowHistoryTableHeader
                          }
                          versionHistoryTableFields={versionHistoryTableFields}
                          workflowHistoryTableFields={
                            workflowHistoryTableFields
                          }
                          attachmentHistoryTableHeader={
                            attachmentHistoryTableHeader
                          }
                          attachmentHistoryTableFields={
                            attachmentHistoryTableFields
                          }
                          referenceDocumentsTableFields={
                            referenceDocumentsTableFields
                          }
                          formData={formData}
                          commentData={comments}
                          commentsLoader={commentsLoader}
                          version={version}
                          workflowHistory={workflowHistoryTableData}
                          attachmentHistory={attachmentHistoryTableData}
                        />
                      </>
                    ) : (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            // paddingTop: "20px",
                          }}
                        ></div>
                        <Modal
                          title={name}
                          centered
                          open={modal2Open}
                          onOk={() => setModal2Open(false)}
                          onCancel={() => setModal2Open(false)}
                          footer={null}
                        >
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={6}
                            style={{ zIndex: 0 }}
                          >
                            <ProcessDocFormWrapper
                              parentPageLink="/processdocuments/processdocument"
                              handleSubmit={handleSubmit}
                              options={options}
                              disableBtnFor={[
                                "In Review",
                                "In Approval",
                                "Amend",
                              ]}
                              favorite={isFavorite}
                              handleFavorite={handleFavorite}
                              handleEditDocument={handleEditDocument}
                              name={name}
                              formData={formData}
                              openModalForComment={openModalForComment}
                              setopenModalForComment={setopenModalForComment}
                              handleCommentSubmit={handleCommentSubmit}
                              handlerButtonStatus={handlerButtonStatus}
                              reloadlist={reloadList}
                              // docState={docState}
                            >
                              {matches ? (
                                <DocumentViewer
                                  fileLink={formData.documentLinkNew}
                                />
                              ) : (
                                ""
                              )}
                            </ProcessDocFormWrapper>
                          </Grid>
                          <div style={{ paddingBottom: "10px" }}>
                            <DocumentViewer
                              fileLink={formData.documentLinkNew}
                            />
                          </div>
                          {buttonStatus && (
                            <div>
                              <ViewDocNormal
                                handleCommentSubmit={handleCommentSubmit}
                                versionHistoryTableHeader={
                                  versionHistoryTableHeader
                                }
                                referenceDocumentsTableHeader={
                                  referenceDocumentsTableHeader
                                }
                                workflowHistoryTableHeader={
                                  workflowHistoryTableHeader
                                }
                                versionHistoryTableFields={
                                  versionHistoryTableFields
                                }
                                workflowHistoryTableFields={
                                  workflowHistoryTableFields
                                }
                                attachmentHistoryTableHeader={
                                  attachmentHistoryTableHeader
                                }
                                attachmentHistoryTableFields={
                                  attachmentHistoryTableFields
                                }
                                referenceDocumentsTableFields={
                                  referenceDocumentsTableFields
                                }
                                formData={formData}
                                commentData={comments}
                                commentsLoader={commentsLoader}
                                version={version}
                              />
                            </div>
                          )}
                        </Modal>
                      </div>
                    )}
                  </>
                )}
              </Grid>
              <div>
                {!!drawer.open && (
                  //    <DocumentDrawer
                  //    drawer={drawer}
                  //    setDrawer={setDrawer}
                  //    handleFetchDocuments={reloadList}
                  //  />
                  <DocumentDrawer
                    drawer={drawer}
                    setDrawer={setDrawer}
                    handleFetchDocuments={reloadList}
                  />
                  // <InboxDocumentDrawer
                  //   drawer={drawer}
                  //   setDrawer={setDrawer}
                  //   reloadList={reloadList}
                  // />
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default DocumentRead;
