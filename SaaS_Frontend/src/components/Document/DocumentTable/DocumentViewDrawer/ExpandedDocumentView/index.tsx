import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { mobileView } from "recoil/atom";

//antd

//material-ui
import { CircularProgress, Grid, Theme, makeStyles } from "@material-ui/core";

//utils
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import getAppUrl from "utils/getAppUrl";

//components
import CommentsTab from "components/Document/DocumentTable/DocumentViewDrawer/ExpandedDocumentView/CommentsTab";
import VersionHistoryTab from "components/Document/DocumentTable/DocumentViewDrawer/ExpandedDocumentView/VersionHistoryTab";
import WorkflowHistoryTab from "components/Document/DocumentTable/DocumentViewDrawer/ExpandedDocumentView/WorkflowHistoryTab";
import DocumentInfoTab from "components/Document/DocumentTable/DocumentViewDrawer/ExpandedDocumentView/DocumentInfoTab";
import DocumentViewer from "components/Document/DocumentTable/DocumentViewDrawer/DocumentViewer";
import ProcessDocFormWrapper from "containers/ProcessDocFormWrapper";
import AttachmentHistoryTab from "./AttachmentHistoryTab";
import RefernceTab from "./RefernceTab";
import WorkFlowTeamTab from "./WorkFlowTeamTab";
import { REDIRECT_URL } from "config";
import DocumentDrawer from "../../DocumentDrawer";

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
      padding: "12px 9px",
      backgroundColor: "#F3F6F8",
      color: "#0E497A",
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "0.8px",
    },
    "& .ant-tabs-tab-active": {
      padding: "12px 9px",
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

  tabHeader: {
    display: "flex",
    flexWrap: "wrap",
  },
  tab: {
    padding: "8px 8px",
    backgroundColor: "#F3F6F8",
    color: "#0E497A",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.8px",
    cursor: "pointer",
    flex: "1 1 25%", // 25% for the first four tabs
    textAlign: "center",
    border: "1px solid #E0E0E0",
    boxSizing: "border-box",
    borderRadius: "5%",
    "&:hover": {
      backgroundColor: "#E0E0E0",
    },
  },
  tabActive: {
    backgroundColor: "#006EAD !important",
    color: "#fff !important",
  },
  tabContent: {
    marginTop: "20px",
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

type Props = {
  id?: string;
  setId?: React.Dispatch<React.SetStateAction<string>>;
  reloadList?: any;
  name?: string;
};

function ExpandedDocumentView({ id = "", name, reloadList }: Props) {
  const mobView = useRecoilValue(mobileView);
  const [formData, setFormData] = React.useState<any>();
  const [options, setOptions] = React.useState<any>();
  const [favorite, setFavorite] = React.useState<boolean>(false);
  const [rerender, setRerender] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [commentsLoader, setCommentsLoader] = React.useState(false);
  const [comments, setComments] = React.useState<any>([]);
  const [renderedFrom, setRenderedFrom] = useState<string>("");
  const [reloadId, setReloadId] = useState<boolean>(false);
  const [openModalForComment, setopenModalForComment] = useState(false);

  const realm = getAppUrl();
  const params = useParams();
  const paramArg: string = params.id!;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const realmName = getAppUrl();
  // const { socket } = React.useContext<any>(SocketContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const version = queryParams.get("version") ? true : false;
  const versionId = queryParams.get("versionId");
  const [docId, setDocId] = useState<string>(id ? id : paramArg);
  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const classes = useStyles();
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [peopleDrawer, setPeopleDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [tabIndex, setTabIndex] = useState(1);
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });

  const [activeTabC, setActiveTabC] = useState<any>("1");
  const [close, setClose] = useState(false);
  const togglePeopleDrawer = (data: any = {}) => {
    setPeopleDrawer({
      ...peopleDrawer,
      open: !peopleDrawer.open,
      data: { ...data },
    });
  };

  // const [reloadId, setReloadId] = useState<boolean>(false);

  console.log("new to hello world in main", close);

  // Know where the request is from, if its /inbox or /processdocuemnts
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
    }
  }, [location, id, params]);

  React.useEffect(() => {
    if (!version) {
      getUserOptions();
    }
    getDocData();
    getComments();
    getFavorite();
  }, [docId, close]);

  const handleCommentSubmit = async (value: string) => {
    setCommentsLoader(true);
    if (value) {
      try {
        const res = await axios.post("/api/documents/createComment", {
          documentId: docId,
          commentText: value,
        });
        setCommentsLoader(false);
        enqueueSnackbar(`Comment Added Successfully`, { variant: "success" });
        getComments();
      } catch (err: any) {
        enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
          variant: "success",
        });
        setCommentsLoader(false);
      }
    } else {
      enqueueSnackbar(`Enter a comment`, { variant: "warning" });
    }
  };

  const getComments = async () => {
    setCommentsLoader(true);
    try {
      const res: any = version
        ? await axios.get(
            `/api/documents/getCommentsForDocument/${docId}?version=true`
          )
        : await axios.get(`/api/documents/getCommentsForDocument/${docId}`);
      console.log("COmments:", res.data);
      setComments(res.data);
      setCommentsLoader(false);
    } catch (err) {
      enqueueSnackbar(
        `Could not get Comments, Check your internet connection`,
        { variant: "error" }
      );
      setCommentsLoader(false);
    }
  };

  const openVersionDoc = (id: any) => {
    navigate(
      `/processdocuments/processdocument/viewprocessdocument/${id}?version=true`
    );
  };

  const handleModuleData = (data: any) => {
    let url;

    if (data.type === "Document") {
      url = `${
        process.env.REACT_APP_SERVER_MODE === "true"
          ? `https://${REDIRECT_URL}`
          : `http://${realmName}.${REDIRECT_URL}`
      }/processdocuments/viewdoc/${data?.refId}`;
      // http://test.localhost:3000/processdocuments/viewdoc/clt6ojklr0000ura4b1qu0t33?versionId=B === doc
      // url = `http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/viewdoc/${data.refId}`;
      // navigate(
      //   `/processdocuments/viewdoc/${data?.id}?versionId=${data?.version}&version=true`
      // );
      // window.open(url, "_blank");
    } else if (data.type === "NC") {
      url = `http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/audit/nc/${data?.refId}`;
      // window.open(url, "_blank");
    } else if (data.type === "HIRA") {
      const encodedJobTitle = encodeURIComponent(data?.jobTitle);
      url = `http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/${encodedJobTitle}`;
      // window.open(url, "_blank");
    }
    return url;
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
      setFormData({
        ...res.data,
        locationName: res.data.creatorLocation.locationName,
        entityName: res.data.creatorEntity.entityName,
        docType: res.data.doctype.documentTypeName,
        cuurentVersion: res.data.currentVersion,
        issueNumber: res.data.issueNumber,
        downloadAccess:res?.data?.downloadAccess,
        status: res?.data?.documentState,
        systemNames: res?.data?.doctype.applicable_systems.filter((item: any) =>
          res?.data?.system.includes(item.id)
        ),

        attachmentHistory: res.data?.attachmentHistory?.map((item: any) => ({
          updatedBy: item.updatedBy,
          attachment: item.attachment,
          updatedAt: item.updatedAt,
        })),

        DocumentWorkFlowHistory: res.data.DocumentWorkFlowHistory.map(
          (item: any) => ({
            ...item,
            actionName:
              item.actionName === "IN_REVIEW"
                ? "For Review"
                : item.actionName === "IN_APPROVAL"
                ? "For Approval"
                : item.actionName === "AMMEND"
                ? "Amend"
                : item.actionName === "DRAFT"
                ? "Draft"
                : item.actionName === "APPROVED"
                ? "Approved"
                : item.actionName === "PUBLISHED"
                ? "Published"
                : item.actionName === "REVIEW_COMPLETE"
                ? "Review Complete"
                : item.actionName === "RETIRE_INREVIEW"
                ? "Retire In Review"
                : item.actionName === "RETIRE_INAPPROVE"
                ? "Retire In Approve"
                : item.actionName === "RETIRE"
                ? "Retire"
                : "N/A",
            createdAt: new Date(item.createdAt).toDateString(),
          })
        ),
        DocumentVersions: res.data.DocumentVersions.map((item: any) => ({
          ...item,
          issueNumber: item?.issueNumber,
          versionName: item?.versionName,
          approvedDate: new Date(item?.updatedAt).toDateString(),
          versionLink: (
            <div
              onClick={() => {
                openVersionDoc(item.id);
              }}
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              Link
            </div>
          ),
        })),
        ReferenceDocuments: res.data.ReferenceDocuments.map((item: any) => {
          const url = handleModuleData(item);
          // console.log("url new", url);
          return {
            ...item,
            documentLink: (
              <a href={`${url}`} target="_blank" rel="noreferrer">
                Link
              </a>
            ),
          };
        }),
      });
      setIsLoading(false);
    } catch (err) {
      enqueueSnackbar(`Could not get Data, Check your internet connection`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };
  const getFavorite = async () => {
    // let userId = getUserId();
    const userId = userDetails?.id;
    await axios(`/api/favorites/checkFavorite/${userId}/${docId}`)
      .then((res: any) => setFavorite(res.data))
      .catch((err: any) => console.error(err));
  };

  const getUserOptions = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/documents/checkUserPermissions/${docId}`);
      setOptions(res.data);
      setIsLoading(false);
    } catch (err) {
      console.log("inside checkuserpermissions error-->", err);

      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    // let userId = getUserId();
    const userId = userDetails?.id;

    await axios
      .put(`/api/favorites/updateFavorite/${userId}`, {
        targetObjectId: docId,
      })
      .then((res: any) => {
        getFavorite();
      })
      .catch((err: any) => console.error(err));
  };

  const handleSubmit = async (option: string, submit = false) => {
    // let userId = getUserId();
    const userId = userDetails?.id;
    if (DocStateIdentifier[option] === "SEND_FOR_EDIT" && !submit) {
      setopenModalForComment(true);
      // enqueueSnackbar(`Please Attach The File`, {
      //   variant: "warning",
      // });
      return;
    }
    if (
      (DocStateIdentifier[option] === "IN_REVIEW" &&
        formData.reviewers.length === 0) ||
      !formData?.documentLinkNew
    ) {
      enqueueSnackbar("please edit this document and fill reqired field");
      return;
    }
    try {
      setIsLoading(true);
      const res = await axios.post(
        `/api/documents/setStatus/${docId}?status=${DocStateIdentifier[option]}`
      );
      // socket?.emit("documentUpdated", {
      //   data: { id: docId },
      //   currentUser: `${userId}`,
      // });

      //Reload Inbox list if request is from path /inbox else navigate to /processdocument
      if (renderedFrom === "inbox") {
        reloadList(true);
      } else {
        navigate("/processdocuments/processdocument");
      }

      setIsLoading(false);
      enqueueSnackbar(`${option} Successful`, { variant: "success" });
    } catch (err: any) {
      enqueueSnackbar(`Request Failed ${err.response.status}`, {
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

  const tabs = [
    {
      label: "Comments",
      key: 1,
      children: (
        <CommentsTab
          commentDrawer={commentDrawer}
          setCommentDrawer={setCommentDrawer}
          toggleCommentsDrawer={toggleCommentsDrawer}
          formData={formData}
          handleCommentSubmit={handleCommentSubmit}
          commentData={comments}
          commentsLoader={commentsLoader}
        />
      ),
    },
    {
      label: "Versions",
      key: 2,
      children: <VersionHistoryTab formData={formData} />,
    },
    {
      label: "Workflow History",
      key: 3,
      children: <WorkflowHistoryTab formData={formData} />,
    },
    {
      label: "Files History",
      key: 4,
      children: <AttachmentHistoryTab formData={formData} />,
    },
    {
      label: "Document Info",
      key: 5,
      children: <DocumentInfoTab formData={formData} />,
    },
    {
      label: "Workflow Team",
      key: 6,
      children: (
        <WorkFlowTeamTab
          peopleDrawer={peopleDrawer}
          setPeopleDrawer={setPeopleDrawer}
          togglePeopleDrawer={togglePeopleDrawer}
          formData={!!formData && formData}
        />
      ),
    },
    {
      label: "Reference Document",
      key: 7,
      children: <RefernceTab formData={formData} />,
    },
  ];

  const handleTabClick = (tabKey: any) => {
    setActiveTabC(tabKey);
  };

  const renderTabContent = () => {
    const tab = tabs.find((t) => t.key === activeTabC);
    return tab ? tab.children : null;
  };
  // Add an event listener to handle arrow key presses
  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (event.key === "ArrowLeft") {
        // Move to the previous tab (decrement the tabIndex)
        setTabIndex((prevTabIndex) =>
          prevTabIndex > 0 ? prevTabIndex - 1 : prevTabIndex
        );
      } else if (event.key === "ArrowRight") {
        // Move to the next tab (increment the tabIndex)
        setTabIndex((prevTabIndex) =>
          prevTabIndex < tabs.length - 1 ? prevTabIndex + 1 : prevTabIndex
        );
      }
    };

    // Attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [tabs]); // Add tabs as a dependency
  const activeTab = tabs[tabIndex];

  return (
    <>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {formData && (
            <Grid container style={{ marginTop: "8px" }}>
              <Grid item xs={12} md={7} style={{ zIndex: 0 }}>
                <ProcessDocFormWrapper
                  parentPageLink="/processdocuments/processdocument"
                  handleSubmit={handleSubmit}
                  options={options}
                  disableBtnFor={["In Review", "In Approval", "Amend"]}
                  favorite={favorite}
                  handleFavorite={handleFavorite}
                  name={name}
                  handleEditDocument={handleEditDocument}
                  openModalForComment={openModalForComment}
                  setopenModalForComment={setopenModalForComment}
                  handleCommentSubmit={handleCommentSubmit}
                  docState={formData?.documentState}
                  formData={formData}
                >
                  <DocumentViewer fileLink={formData?.documentLink} />
                </ProcessDocFormWrapper>
              </Grid>

              <Grid item xs={12} md={5} spacing={1}>
                <div className={classes.tabsWrapper}>
                  <div className={classes.tabHeader}>
                    {tabs.map((tab) => (
                      <div
                        className={`${classes.tab} ${
                          activeTabC === tab.key ? classes.tabActive : ""
                        }`}
                        onClick={() => handleTabClick(tab.key)}
                        key={tab.key}
                      >
                        {tab.label}
                      </div>
                    ))}
                  </div>
                  <div className={classes.tabContent}>{renderTabContent()}</div>
                </div>
              </Grid>
            </Grid>
          )}
          <div>
            {!!drawer.open && (
              // <InboxDocumentDrawer
              //   drawer={drawer}
              //   setDrawer={setDrawer}
              //   reloadList={reloadList}
              // />
              <DocumentDrawer
                drawer={drawer}
                setDrawer={setDrawer}
                handleFetchDocuments={reloadList}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}

export default ExpandedDocumentView;
