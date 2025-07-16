import {
  useMediaQuery,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@material-ui/core";
import { MdOutlineExpandMore } from "react-icons/md";
import getAppUrl from "utils/getAppUrl";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import {
  Button,
  Drawer,
  Input,
  Modal,
  Radio,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useRef, useState } from "react";
import useStyles from "./style";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import AuditeeSectionDrawer from "./AuditeeSectionDrawer";
import AuditorSectionDrawer from "./AuditorSectionDrawer";
import ClosureSectionDrawer from "./ClosureSectionDrawer";
import ListOfFindingsDrawer from "./ListOfFindingsDrawer";
import {
  acceptNc,
  buttonStatus,
  closeNc,
  conversionNc,
  getNcDetail,
  rejectNc,
  finalRejectNc,
} from "apis/ncSummaryApi";
import moment from "moment";
import { API_LINK } from "config";
import React from "react";
import { checkIsAuditor, checkRatePermissions } from "apis/auditApi";
import getUserId from "utils/getUserId";
import { useRecoilState } from "recoil";
import { auditCreationForm, auditeeSectionData, ncsForm } from "recoil/atom";
import { useSnackbar } from "notistack";
import checkRole from "utils/checkRoles";
import { useNavigate } from "react-router-dom";
import WorkFlowHistory from "./WorkFlowHistory";
import { Tour, TourProps } from "antd";

type Props = {
  openDrawer?: any;
  setOpenDrawer?: any;
  id?: any;
  isInbox?: boolean;
  setReload?: any;
};

const NcSummaryDrawer = ({
  openDrawer,
  setOpenDrawer,
  id,
  isInbox,
  setReload,
}: Props) => {
  const [activeTabKey, setActiveTabKey] = useState<any>(1);
  const classes = useStyles();
  const [closureOwnerRule, setClosureOwnerRule] = React.useState(true);
  const [closureOwner, setClosureOwner] = useState<any>("");
  const [loading, setLoading] = React.useState(true);
  const userId = getUserId();
  const [isAuditee, setIsAuditee] = React.useState(false);
  const [isAuditor, setIsAuditor] = React.useState(false);
  const [formData, setFormData] = useRecoilState(ncsForm);
  const [ncStatus, setNcStatus] = React.useState<string>("");
  const [closureData, setClosureData] = React.useState({
    closureRemarks: "",
    closureDate: "",
    auditRequired: "No",
  });
  const [auditorData, setAuditorData] = React.useState({
    date: "",
    comment: "",
    verficationDate: "",
    verficationAction: "",
  });
  const [auditeeData, setAuditeeData] = useRecoilState(auditeeSectionData);
  const [date, setDate] = React.useState();
  const [auditDate, setAuditDate] = React.useState<any>();
  const [anchorEl, setAnchorEl] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [acceptModal, setAcceptModal] = useState(false);
  const [correctiveActionDate, setCorrectiveActionDate] = React.useState<any>();
  const [closedStatus, setClosedStatus] = React.useState<any>(false);
  const [hasAuditeeAccepted, setHasAuditeeAccepted] =
    React.useState<boolean>(false);
  const [hasAuditeeRejected, setHasAuditeeRejected] =
    React.useState<boolean>(false);
  const [hasAuditorAccepted, setHasAuditorAccepted] =
    React.useState<boolean>(false);
  const [hasAuditorVerified, setHasAuditorVerified] =
    React.useState<boolean>(false);
  const [roleStatus, setRoleStatus] = React.useState<boolean>(false);
  const [buttonOptions, setButtonOptions] = React.useState<any>([]);
  const [modalComment, setModalComment] = React.useState(false);
  const [rejectModal, setRejectModal] = React.useState(false);
  const [finalRejectModal, setFinalRejectModal] = React.useState(false);
  const [findingTypes, setFindingTypes] = React.useState([]);
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const [selectedOption, setSelectedOption] = useState("");

  const isOrgAdmin = checkRole("ORG-ADMIN");
  const userInfo = getSessionStorage();
  const realmName = getAppUrl();
  const [Docurls, setDocUrls] = useState<any>([]);
  const [modalShow, setModalShow] = React.useState(false);
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);
  const isMR = checkRole("MR");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  const [workFlowDrawer, setWorkFlowDrawer] = useState<any>({
    open: false,
    data: {},
  });

  React.useEffect(() => {
    getNcDetailById(isInbox ? id?._id : id?.id);
    getButtonStatus(isInbox ? id?._id : id?.id, userId);
  }, [openDrawer]);

  const onTabsChange = (key: string) => {
    setActiveTabKey(key);
  };

  const getButtonStatus = async (id: string, userId: any) => {
    if (userId === null) {
      const userInfo = await axios.get("/api/user/getUserInfo");
      buttonStatus(id, userInfo?.data?.id, formData.type).then(
        (response: any) => {
          setRoleStatus(response?.data?.status);
          setButtonOptions(response?.data?.options);
          if (response?.data?.options?.includes("Close NC")) {
            setClosureOwnerRule(false);
          }
        }
      );
    } else {
      buttonStatus(id, userId, formData.type).then((response: any) => {
        setRoleStatus(response?.data?.status);
        setButtonOptions(response?.data?.options);
        if (response?.data?.options?.includes("Close NC")) {
          setClosureOwnerRule(false);
        }
      });
    }
  };
  console.log("from inbox id data", id);

  const uploadAuditReportAttachments = async (files: any) => {
    const locationName = isOrgAdmin ? "" : userInfo?.location?.locationName;
    let formDataFiles = new FormData();
    let oldData = [];
    let newData = [];

    for (let file of files) {
      if (file?.url) {
        oldData.push(file);
      } else {
        newData.push(file);
      }
    }
    newData.forEach((file: any) => {
      const fileToAdd = file.originFileObj || file;
      // console.log("fileToAdd content:", fileToAdd);
      formDataFiles.append("files", fileToAdd);
    });

    const id = "Audit";
    let res: any;
    let comdinedData;
    try {
      if (newData.length > 0) {
        res = await axios.post(
          `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${locationName}`,
          formDataFiles,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              id: id,
            },
          }
        );
      }
      if (res?.data?.length > 0) {
        comdinedData = res?.data;
      }

      if (oldData.length > 0) {
        comdinedData = oldData;
      }

      if (oldData?.length > 0 && res?.data?.length > 0) {
        comdinedData = [...res.data, ...oldData];
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Custom alert message for 404 error
        alert(
          "Your Organization has exceeded the licensed attachments - Please reach ProcessRidge to activate additional licenses. Record will be saved without attachment"
        );
      } else {
        console.error("Error uploading data:", error);
        alert("An error occurred while uploading files. Please try again.");
      }
      return null;
    }
    return comdinedData;
  };
  // console.log("id in drawer", openDrawer);
  const fectchFindingTypes = async () => {
    const result = await axios.get(
      `/api/audit-settings/getFindingsForAuditTypeAndFilterType/${
        formData.auditTypeId
      }/${encodeURIComponent(formData.type)}`
    );
    setFindingTypes(result.data);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleSubmit = async (option: string, status = false) => {
    let copyData = JSON.parse(JSON.stringify(auditeeData));
    let auditorCopyData = JSON.parse(JSON.stringify(auditorData));
    let closureCopyData = JSON.parse(JSON.stringify(closureData));
    auditorCopyData.userId = userId;
    let targetDate;
    let auditDate;
    let data;
    switch (option) {
      case "ACCEPT":
        copyData.statusDetail = true;
        copyData.userId = userId;
        targetDate = moment(copyData.targetDate).format("YYYY-MM-DD");
        auditDate = moment(date).format("YYYY-MM-DD");
        data = { ...copyData, ...formData };
        // if (!copyData.correction) {
        //   enqueueSnackbar(`Correction field should not empty`, {
        //     variant: "error",
        //   });
        //   return;
        // }

        isAuditee &&
          acceptNc(isInbox ? id._id : id?.id, copyData, false)
            .then((response: any) => {
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        break;

        copyData.statusDetail = true;
        copyData.userId = userId;
        targetDate = moment(copyData.targetDate).format("YYYY-MM-DD");
        auditDate = moment(date).format("YYYY-MM-DD");
        data = { ...copyData, ...formData };
        // if (!copyData.correction) {
        //   enqueueSnackbar(`Correction field should not empty`, {
        //     variant: "error",
        //   });
        //   return;
        // }

        isAuditee &&
          acceptNc(isInbox ? id._id : id?.id, copyData, false)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              //   setTemplate([]);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // }
              // navigate("/audit", {
              //   state: { redirectToTab: "List of Findings" },
              // });
              if (!!isInbox) {
                setReload(true);
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        break;

      case "Submit to Auditor":
        copyData.isDraft = false;
        copyData.userId = userId;

        let uploadAttachement =
          auditeeData?.proofDocument?.length > 0
            ? await uploadAuditReportAttachments(auditeeData?.proofDocument)
            : [];

        // if (!!template?.files && template?.files?.length > 0) {
        //   uploadAttachement = await uploadAuditReportAttachments(
        //     template?.files
        //   );
        // }
        // if (!!uploadAttachement?.isFileUploaded) {
        setFormData({
          ...formData,
          ...template,
          proofDocument: uploadAttachement,
        });

        copyData.proofDocument = uploadAttachement;
        if (!copyData.correction) {
          enqueueSnackbar(`Correction field should not empty`, {
            variant: "error",
          });
          return;
        }

        if (!auditeeData.actualCorrection) {
          enqueueSnackbar(`Actual Correction field should not empty`, {
            variant: "error",
          });
          return;
        }

        if (!auditeeData?.targetDate) {
          enqueueSnackbar(`Planned Date Of Correction field should not empty`, {
            variant: "error",
          });
          return;
        }

        if (!auditeeData?.actualTargetDate) {
          enqueueSnackbar(`Actual Date Of Correction field should not empty`, {
            variant: "error",
          });
          return;
        }

        if (!auditeeData?.whyAnalysis) {
          enqueueSnackbar(`Root Cause Analysis field should not empty`, {
            variant: "error",
          });
          return;
        }

        if (formData.corrective) {
          if (!moment(targetDate).isSameOrAfter(auditDate)) {
            enqueueSnackbar(
              `Actual Date Of Correction should be greater than ${formData.auditDateTime}`,
              {
                variant: "error",
              }
            );
            return;
          }
        }
        if (auditeeData?.proofDocument?.length === 0 && !status) {
          setModalShow(true);
          return;
        }

        // if (isAuditee && (!auditeeData.comment || !auditeeData.date)) {
        //   enqueueSnackbar("You need to fill up the required details.", {
        //     variant: "error",
        //   });
        //   return;
        // }

        // } else {
        //   setFormData({ ...formData, ...template });
        // }
        if (isAuditee) {
          acceptNc(isInbox ? id._id : id?.id, copyData, false)
            .then((response: any) => {
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
              setModalShow(false);
              if (!!isInbox) {
                setReload(true);
              }
              setOpenDrawer({ open: false, refresh: true });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        } else {
          acceptNc(isInbox ? id._id : id?.id, copyData, false)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // }
              // else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        }

        // isAuditor &&
        //   acceptNc(id!, auditorCopyData)
        //     .then((response: any) => {
        //       navigate("/audit", { state: { redirectToTab: "List of Findings" } });
        //       enqueueSnackbar("Successfully accepted NC", {
        //         variant: "success",
        //       });
        //     })
        //     .catch((error: any) => {
        //       enqueueSnackbar("Something went wrong!", {
        //         variant: "error",
        //       });
        //     });

        break;

        copyData.isDraft = false;
        copyData.userId = userId;
        if (!copyData.correction) {
          enqueueSnackbar(`Correction field should not empty`, {
            variant: "error",
          });
          return;
        }
        if (!copyData.whyAnalysis) {
          enqueueSnackbar(`Why1 Analysis Should Not Be Empty`, {
            variant: "error",
          });
          return;
        }
        if (isAuditee && (!auditeeData.comment || !auditeeData.date)) {
          enqueueSnackbar("You need to fill up the required details.", {
            variant: "error",
          });
          return;
        }
        isAuditee &&
          acceptNc(isInbox ? id._id : id?.id, copyData, false)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              //   setTemplate([]);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // } else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        // isAuditor &&
        //   acceptNc(id!, auditorCopyData)
        //     .then((response: any) => {
        //       navigate("/audit", { state: { redirectToTab: "List of Findings" } });
        //       enqueueSnackbar("Successfully accepted NC", {
        //         variant: "success",
        //       });
        //     })
        //     .catch((error: any) => {
        //       enqueueSnackbar("Something went wrong!", {
        //         variant: "error",
        //       });
        //     });
        // isMR &&
        //   acceptNc(id!, copyData)
        //     .then((response: any) => {
        //       navigate("/audit", { state: { redirectToTab: "List of Findings" } });
        //       enqueueSnackbar("Successfully accepted NC", {
        //         variant: "success",
        //       });
        //     })
        //     .catch((error: any) => {
        //       enqueueSnackbar("Something went wrong!", {
        //         variant: "error",
        //       });
        //     });
        break;
      case "Accept & Close":
        copyData.isDraft = false;
        copyData.userId = userId;
        data = { ...copyData, ...closureData };
        isMR &&
          acceptNc(isInbox ? id?._id : id?.id, data, false)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // } else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        isOrgAdmin &&
          acceptNc(isInbox ? id._id : id, data, false)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // } else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        break;
      case "Accept":
        copyData.isDraft = false;
        copyData.userId = userId;
        copyData.statusDetail = true;
        copyData.rejectComment = formData.rejectComment;
        setAcceptModal(true);
        if (!status) {
          setAcceptModal(true);
          return;
        }

        acceptNc(isInbox ? id?._id : id?.id, copyData, false)
          .then((response: any) => {
            // if (setUpdateModelVisible) {
            //   setUpdateModelVisible(false);
            // }
            // if (setRerender) {
            //   setRerender(true);
            // }
            // if (isInbox === true) {
            //   navigate("/Inbox");
            // } else {
            //   navigate("/audit", {
            //     state: { redirectToTab: "List of Findings" },
            //   });
            // }
            enqueueSnackbar("Successfully accepted NC", {
              variant: "success",
            });
            setOpenDrawer({ open: false, refresh: true });
          })
          .catch((error: any) => {
            enqueueSnackbar("Something went wrong!", {
              variant: "error",
            });
          });

        break;

      case "Verify":
        copyData.isDraft = false;
        copyData.userId = userId;
        if (
          isAuditor &&
          (auditorData.verficationAction === "" ||
            auditorData.verficationDate === "")
        ) {
          enqueueSnackbar("You need to fill up the required details.", {
            variant: "error",
          });
          return;
        }
        if (isAuditor) {
          acceptNc(isInbox ? id?._id : id?.id, auditorCopyData, false)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // } else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully Verified NC", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        } else {
          acceptNc(isInbox ? id._id : id?.id, copyData, false)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // } else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        }

        break;

      case "Send Back to Auditee":
        auditorCopyData.isDraft = true;
        auditorCopyData.userId = userId;
        auditorCopyData.sendBackComment = formData.sendBackComment;
        auditorCopyData.rejectComment = formData?.rejectComment;
        if (!status) {
          console.log(" next twist");
          setModalComment(true);
          return;
        }
        if (isAuditor) {
          acceptNc(isInbox ? id._id : id.id, auditorCopyData, false)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // } else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully Verified NC", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        } else {
          acceptNc(isInbox ? id._id : id.id, copyData, false)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // } else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        }

        break;
      case "Reject NC":
        if (!status) {
          setRejectModal(true);
          return;
        }
        copyData.userId = userId;
        copyData.rejectComment = formData.rejectComment;
        rejectNc(isInbox ? id._id : id.id, copyData)
          .then((response: any) => {
            // if (setUpdateModelVisible) {
            //   setUpdateModelVisible(false);
            // }
            // if (setRerender) {
            //   setRerender(true);
            // }
            // if (isInbox === true) {
            //   navigate("/Inbox");
            // } else {
            //   navigate("/audit", {
            //     state: { redirectToTab: "List of Findings" },
            //   });
            // }
            enqueueSnackbar("Successfully rejected NC", {
              variant: "success",
            });
            setOpenDrawer({ open: false, refresh: true });
            if (!!isInbox) {
              setReload(true);
            }
          })
          .catch((error: any) => console.log("error - ", error));

        // isMR && handleDialogOpen();
        break;
      case "Reject":
        copyData.userId = userId;
        isAuditee &&
          rejectNc(isInbox ? id._id : id.id, copyData)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // } else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully rejected NC", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              console.log("error - ", error);
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        isAuditor &&
          rejectNc(isInbox ? id._id : id?.id, copyData)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // } else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully rejected NC", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              console.log("error - ", error);
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        // isMR && handleDialogOpen();
        break;

      case "REJECT":
        if (!status) {
          setFinalRejectModal(true);
          return;
        }
        copyData.userId = userId;
        finalRejectNc(isInbox ? id._id : id.id, copyData)
          .then((response: any) => {
            // if (setUpdateModelVisible) {
            //   setUpdateModelVisible(false);
            // }
            // if (setRerender) {
            //   setRerender(true);
            // }
            // if (isInbox === true) {
            //   navigate("/Inbox");
            // } else {
            //   navigate("/audit", {
            //     state: { redirectToTab: "List of Findings" },
            //   });
            // }
            enqueueSnackbar("Successfully rejected NC", {
              variant: "success",
            });
            setOpenDrawer({ open: false, refresh: true });
            if (!!isInbox) {
              setReload(true);
            }
          })
          .catch((error: any) => {
            console.log("error - ", error);
            enqueueSnackbar("Something went wrong!", {
              variant: "error",
            });
          });

        // isMR && handleDialogOpen();
        break;
      case "Change Audit Type":
        fectchFindingTypes();
        handleDialogOpen();
        break;
      case "Close NC":
        // (isMR || isOrgAdmin) &&
        if (!closureData?.closureRemarks) {
          enqueueSnackbar(`Closure Remarks should not empty`, {
            variant: "error",
          });
          return;
        }

        if (!closureData?.closureDate) {
          enqueueSnackbar(`Closure Date should not empty`, {
            variant: "error",
          });
          return;
        }
        closeNc(isInbox ? id._id : id?.id, {
          userId: userId,
          ...auditorData,
          ...closureData,
          ...auditeeData,
        })
          .then((response: any) => {
            // if (setUpdateModelVisible) {
            //   setUpdateModelVisible(false);
            // }
            // if (setRerender) {
            //   setRerender(true);
            // }
            // if (isInbox === true) {
            //   navigate("/Inbox");
            // } else {
            //   navigate("/audit", {
            //     state: { redirectToTab: "List of Findings" },
            //   });
            // }
            enqueueSnackbar("Successfully closed Findings", {
              variant: "success",
            });
            setOpenDrawer({ open: false, refresh: true });
            if (!!isInbox) {
              setReload(true);
            }
          })
          .catch((error: any) => {
            console.log("error - ", error);
            enqueueSnackbar("Something went wrong!", {
              variant: "error",
            });
          });
        break;

      case "Save":
        let copyAuditeeData = JSON.parse(JSON.stringify(auditeeData));
        copyAuditeeData.isDraft = false;
        copyAuditeeData.userId = userId;
        let copyAuditorData = JSON.parse(JSON.stringify(auditorData));
        copyAuditorData.isDraft = false;
        copyAuditorData.userId = userId;
        if (isAuditee) {
          acceptNc(isInbox ? id._id : id?.id, copyAuditeeData, true)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // } else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully saved ", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
              if (!!isInbox) {
                setReload(true);
              }
            })
            .catch((error: any) => {
              console.log("error - ", error);
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        } else if (isAuditor) {
          acceptNc(isInbox ? id._id : id?.id, copyAuditorData, true)
            .then((response: any) => {
              // if (setUpdateModelVisible) {
              //   setUpdateModelVisible(false);
              // }
              // if (setRerender) {
              //   setRerender(true);
              // }
              // if (isInbox === true) {
              //   navigate("/Inbox");
              // } else {
              //   navigate("/audit", {
              //     state: { redirectToTab: "List of Findings" },
              //   });
              // }
              enqueueSnackbar("Successfully saved as draft", {
                variant: "success",
              });
              setOpenDrawer({ open: false, refresh: true });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        }

        break;

      default:
        console.log("No options found!");
        break;
    }
  };

  const convertToObservation = () => {
    let copyData = JSON.parse(JSON.stringify(auditeeData));
    copyData.userId = userId;
    copyData.type = selectedOption;
    // copyData.rejectComment.rejectComment=formData.rejectComment
    copyData.rejectComment = formData.rejectComment;

    conversionNc(id?.id, copyData)
      .then((response: any) => {
        // navigate("/audit", { state: { redirectToTab: "List of Findings" } });

        enqueueSnackbar("Successfully converted", {
          variant: "success",
        });
        setOpenDrawer({ open: false, refresh: true });
      })
      .catch((error: any) => {
        console.log("error -", { error });
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };
  const parseData = (data: any) => {
    setAuditDate(data?.audit?.createdAt);
    setCorrectiveActionDate(data?.correctiveAction?.date);
    setClosedStatus(data?.status === "CLOSED" ? true : false);
    setHasAuditeeAccepted(data?.auditeeAccepted);
    setHasAuditeeRejected(data?.auditeeRejected);
    setHasAuditorAccepted(data?.auditorAccepted);

    setDate(data?.audit?.createdAt);
    const formattedData = {
      auditName: data?.audit?.auditName,
      auditDateTime: moment(data?.audit?.createdAt).format("DD/MM/YYYY LT"),
      auditType: data?.audit?.auditType?.auditType,
      auditTypeId: data?.audit?.auditType?._id,
      auditNumber: data?.audit?.auditNumber,
      auditee: data?.audit?.auditees,
      auditor: data?.audit?.auditors,
      entity: data?.audit?.auditedEntity?.entityName,
      location: data?.audit?.auditedEntity?.location.locationName,
      findingData: data.findings,
      ncDate: moment(data?.createdAt).format("DD/MM/YYYY"),
      ncNumber: data?.id,
      type: data.type,
      auditorSection: data.findings.auditorVerification,
      closureBy: data.findings.closureBy,
      closureSection: data.findings.closure,
      corrective: data.findings.correctiveAction,
      clauseAffected:
        data?.clause.length > 0 && data?.clause[0]?.clauseName
          ? `${data?.clause[0]?.clauseName}, ${data?.clause[0]?.clauseNumber}`
          : "",
      ncDetails: data?.comment,
      currentlyUnder: data?.currentlyUnder,
      documentProof: data?.document ? (
        <a
          href={`${API_LINK}${data?.document}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data?.document?.split("/")[2]}
        </a>
      ) : "No image found",
      mrComments:
        data?.ncComments.length > 0
          ? data.ncComments.map((comment: any) => {
              return {
                commentText: comment?.comment,
                date: moment(comment?.createdAt).format("DD/MM/YYYY LT"),
                postedOn: moment(comment?.createdAt).format("DD/MM/YYYY LT"),
                commentBy:
                  comment?.user.firstname + " " + comment?.user.lastname,
                border: false,
                emptyBackground: true,
              };
            })
          : [
              {
                commentText: "No comments were found!",
                date: "",
                postedOn: "",
                commentBy: "",
                border: false,
                emptyBackground: true,
              },
            ],
      closureDate: data?.closureDate
        ? moment(data?.closureDate).format("DD/MM/YYYY")
        : "",
      reviewDate:
        data.reviewDate && data.reviewDate !== ""
          ? moment(data.reviewDate).format("YYYY-MM-DD")
          : "",
      caDate:
        data.caDate && data.caDate !== ""
          ? moment(data.caDate).format("DD/MM/YYYY")
          : "",
      workflowHistory: data?.workflowHistory.map((workflow: any) => {
        return {
          date: moment(workflow.createdAt).format("DD/MM/YYYY"),
          by: workflow?.user?.firstname + " " + workflow?.user?.lastname,
          action: workflow?.action,
          id: workflow?._id,
          comment: workflow?.comment || "",
        };
      }),
    };

    setAuditeeData((prev: any) => {
      return {
        ...prev,
        date: data?.correctiveAction?.date
          ? moment(data?.correctiveAction?.date).format("YYYY-MM-DD")
          : "",
        targetDate: data?.correctiveAction?.targetDate
          ? moment(data?.correctiveAction?.targetDate).format("YYYY-MM-DD")
          : "",
        documentName: data?.correctiveAction?.documentName,
        proofDocument: data?.correctiveAction?.proofDocument,
        actualDate: data?.correctiveAction?.actualDate
          ? moment(data?.correctiveAction?.actualDate).format("YYYY-MM-DD")
          : "",
        actualTargetDate: data?.correctiveAction?.actualTargetDate
          ? moment(data?.correctiveAction?.actualTargetDate).format(
              "YYYY-MM-DD"
            )
          : "",
        actualCorrection: data?.correctiveAction?.actualCorrection,
        actualComment: data?.correctiveAction?.actualComment,
        imageName: data?.correctiveAction?.imageName,
        imageLink: data?.correctiveAction?.imageLink,
        comment: data?.correctiveAction?.comment,
        isDraft: data?.correctiveAction?.isDraft ?? true,
        correction: data?.correctiveAction?.correction,
        whyAnalysis: data?.correctiveAction?.whyAnalysis
          ? data?.correctiveAction?.whyAnalysis
          : "",
      };
    });

    setAuditorData({
      ...auditorData,
      date: data?.auditorReview?.date
        ? moment(data?.auditorReview?.date).format("YYYY-MM-DD")
        : "",
      comment: data?.auditorReview?.comment,
      verficationAction: data?.auditorReview?.verficationAction,
      verficationDate: data?.auditorReview?.verficationDate
        ? moment(data?.auditorReview?.verficationDate).format("YYYY-MM-DD")
        : "",
    });

    setClosureData({
      ...closureData,
      closureRemarks: data?.closureRemarks,
      auditRequired: data.auditRequired || "No",
      closureDate: data?.closureDate
        ? moment(data?.closureDate).format("DD/MM/YYYY")
        : "",
    });

    checkAuditee(data?.audit?._id, data?.currentlyUnder);
    checkAuditor(data?.audit?._id, data?.currentlyUnder);
    setNcStatus(data?.status);
    setFormData(formattedData as any);
  };

  const checkAuditor = (id: string, role: string) => {
    checkIsAuditor(id, {
      userId: userId,
    }).then((response: any) => {
      setIsAuditor(response?.data);
    });
  };
  const checkAuditee = (id: string, role: string) => {
    checkRatePermissions(id, {
      userId: userId,
    }).then((response: any) => {
      setIsAuditee(response?.data);
    });
  };
  const getNcDetailById = (id: string) => {
    getNcDetail(id)
      .then((res: any) => {
        parseData(res?.data);
        setClosureOwner(res?.data.audit?.auditType?.VerificationOwner);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error.message);
        setLoading(false);
      });
  };
  const handleModal = () => {
    setOpenDrawer({ open: false, data: {}, editMode: false });
    // window.location.reload();
  };

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const auditeeSectionDisabled = closureOwnerRule
    ? hasAuditeeAccepted ||
      // hasAuditeeRejected ||
      (!isAuditee && !auditeeData.isDraft) ||
      // isMR ||
      closedStatus
    : false;

  const auditorSectionDisabled =
    ncStatus !== "VERIFIED"
      ? hasAuditorAccepted || !isAuditor || closedStatus
      : buttonOptions?.length > 0
      ? false
      : true;

  const closureSectionDisabled = closureOwnerRule
    ? id?.id !== undefined ||
      ncStatus !== "VERIFIED" ||
      (closureOwner === "MCOE" && !isOrgAdmin) ||
      (closureOwner === "IMSC" && !isMR)
    : false;

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const refForListOfFindingsForm1 = useRef(null);
  const refForListOfFindingsForm2 = useRef(null);
  const refForListOfFindingsForm3 = useRef(null);
  const refForListOfFindingsForm4 = useRef(null);
  const refForListOfFindingsForm5 = useRef(null);
  const refForListOfFindingsForm6 = useRef(null);
  const refForListOfFindingsForm7 = useRef(null);
  const refForListOfFindingsForm8 = useRef(null);
  const refForListOfFindingsForm9 = useRef(null);
  const refForListOfFindingsForm10 = useRef(null);
  const refForListOfFindingsForm11 = useRef(null);
  const refForListOfFindingsForm12 = useRef(null);
  const refForListOfFindingsForm13 = useRef(null);
  const refForListOfFindingsForm14 = useRef(null);
  const refForListOfFindingsForm15 = useRef(null);
  const refForListOfFindingsForm16 = useRef(null);
  const refForListOfFindingsForm17 = useRef(null);
  const refForListOfFindingsForm18 = useRef(null);

  const tabs = [
    {
      label: "Finding Details",
      key: 1,
      children: <ListOfFindingsDrawer ncDisplayData={formData} />,
    },
    {
      label: <div ref={refForListOfFindingsForm1}> Auditee Section</div>,
      key: 2,
      children: (
        <AuditeeSectionDrawer
          setAuditeeData={setAuditeeData}
          template={template}
          setTemplate={setTemplate}
          auditeeData={auditeeData}
          disabled={auditeeSectionDisabled}
          auditDate={auditDate}
          refForListOfFindingsForm2={refForListOfFindingsForm2}
          refForListOfFindingsForm3={refForListOfFindingsForm3}
          refForListOfFindingsForm4={refForListOfFindingsForm4}
          refForListOfFindingsForm5={refForListOfFindingsForm5}
          refForListOfFindingsForm6={refForListOfFindingsForm6}
          refForListOfFindingsForm7={refForListOfFindingsForm7}
          refForListOfFindingsForm8={refForListOfFindingsForm8}
          refForListOfFindingsForm9={refForListOfFindingsForm9}
          refForListOfFindingsForm10={refForListOfFindingsForm10}
          refForListOfFindingsForm11={refForListOfFindingsForm11}
        />
      ),
    },
    {
      label: <div ref={refForListOfFindingsForm12}>Auditor Section</div>,
      key: 3,
      children: (
        <AuditorSectionDrawer
          auditorData={auditorData}
          setAuditorData={setAuditorData}
          disabled={auditorSectionDisabled}
          auditeeData={auditeeData}
          refForListOfFindingsForm13={refForListOfFindingsForm13}
          refForListOfFindingsForm14={refForListOfFindingsForm14}
        />
      ),
    },
    {
      label: <div ref={refForListOfFindingsForm15}> Closure</div>,
      key: 4,
      children: (
        <ClosureSectionDrawer
          closureData={closureData}
          setClosureData={setClosureData}
          correctiveActionDate={correctiveActionDate}
          disabled={closureSectionDisabled}
          refForListOfFindingsForm16={refForListOfFindingsForm16}
          refForListOfFindingsForm17={refForListOfFindingsForm17}
          refForListOfFindingsForm18={refForListOfFindingsForm18}
        />
      ),
    },
  ];
  const cancelNc = () => {
    closeNc(id, { userId: userId })
      .then((response: any) => {
        navigate("/audit", { state: { redirectToTab: "List of Findings" } });
        enqueueSnackbar("Successfully cancelled NC", {
          variant: "success",
        });
      })
      .catch((error: any) => {
        console.log("error -", { error });
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };
  console.log("id to test", id);

  const [openTourForListOfFindingsForm1, setOpenTourForListOfFindingsForm1] =
    useState<boolean>(false);

  const stepsForListOfFindingsForm1: TourProps["steps"] = [
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm1.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm2.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm3.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm4.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm5.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm6.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm7.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm8.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm9.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm10.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm11.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm12.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm13.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm14.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm15.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm16.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm17.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForListOfFindingsForm18.current,
    },
  ];

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Finding");
  console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  return (
    <>
      <div className={classes.drawer}>
        <Drawer
          title={
            <div style={{ fontSize: smallScreen ? "16px" : "13px" }}>
              {id?.type || ""}
            </div>
          }
          placement="right"
          open={openDrawer.open}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{ width: "36px", height: "38px", cursor: "pointer" }}
            />
          }
          // closable={false}
          onClose={handleModal}
          maskClosable={false}
          className={classes.drawer}
          // width={}
          // width={isSmallScreen ? "85%" : "45%"}
          width={matches ? "53%" : "90%"}
          style={{ transform: "none !important" }}
          extra={
            <div
              style={{
                display: "flex",
                flexDirection: smallScreen ? "row" : "column",
                alignItems: "center",
                gap: smallScreen ? "0px" : "5px",
              }}
            >
              <Space>
                {/* <Tooltip title="View History">
                  <HistoryIcon
                    // className={classes.historyIcon}
                    // onClick={toggleHistoryDrawer}
                    style={{
                      display: "flex", // Adding flex display to the container to enable horizontal layout
                      alignItems: "center",
                      paddingLeft: "0.5rem", // Align items vertically in the center
                      
                      color: "#003566",
                      // fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  />
                </Tooltip> */}

                {/* <div>
                  <TouchAppIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setOpenTourForListOfFindingsForm1(true);
                    }}
                  />
                </div> */}

                <Button
                  onClick={() => {
                    setWorkFlowDrawer({ open: true });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: matches ? "4px 12px 4px 12px" : "0px 10px ",
                    justifyContent: "center",
                  }}
                >
                  View WorkFlow History
                </Button>
              </Space>
              <div>
                <Space>
                  <Typography>
                    <div
                      style={{
                        display: "flex", // Adding flex display to the container to enable horizontal layout
                        alignItems: "center",
                        paddingLeft: smallScreen ? "0.5rem" : "0rem", // Align items vertically in the center

                        color: "#003566",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      {/* Status: &nbsp; */}
                      <Tag
                        style={{
                          backgroundColor:
                            ncStatus === "OPEN"
                              ? "#ffba00"
                              : ncStatus === "CLOSED"
                              ? "#D62DB1"
                              : ncStatus === "AUDITORREVIEW"
                              ? "#003566"
                              : ncStatus === "ACCEPTED"
                              ? "#7cbf3f"
                              : ncStatus === "REJECTED"
                              ? "#c75c71"
                              : ncStatus === "VERIFIED"
                              ? "#77DD77"
                              : "#7cbf3f", // Default color if none of the conditions match
                          color: "white",
                          fontWeight: "normal",
                          width: "89px",
                          padding: "5px 0px",
                          alignItems: "center",
                          borderRadius: "10px",
                          textAlign: "center",
                          justifyContent: "center",
                        }}
                      >
                        {ncStatus}
                      </Tag>
                    </div>
                  </Typography>
                </Space>
                <Space>
                  <Button
                    onClick={handleClick}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: matches ? "4px 12px 4px 12px" : "0px 3px ",
                    }}
                    disabled={buttonOptions?.length === 0}
                  >
                    <span>{"Actions"}</span>
                    <MdOutlineExpandMore
                      style={{
                        fill: `${
                          buttonOptions?.length === 0 ? "gray" : "#0e497a"
                        }`,
                      }}
                    />
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    {buttonOptions &&
                      buttonOptions.length > 0 &&
                      buttonOptions?.map((item: any, index: any) => (
                        <MenuItem
                          key={index + 1}
                          value={item}
                          onClick={(e: any) => {
                            handleSubmit(item);
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
            </div>
          }
        >
          {/* <img src={AuditTrailImageSvg} alt="mysvf" width={50} height={50} /> */}
          {/* {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : ( */}
          <>
            <div className={classes.tabsWrapper}>
              {matches ? (
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
              ) : (
                <div style={{ marginTop: "15px", padding: "0px 10px" }}>
                  <FormControl
                    variant="outlined"
                    size="small"
                    fullWidth
                    //  className={classes.formControl}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <InputLabel>Menu List</InputLabel>
                    <Select
                      label="Menu List"
                      value={selectedValue}
                      onChange={handleDataChange}
                    >
                      <MenuItem value={"Finding"}>
                        <div
                          style={{
                            backgroundColor:
                              selectedValue === "Finding" ? "#3576BA" : "white",
                            textAlign: "center",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            color:
                              selectedValue === "Finding" ? "white" : "black",
                          }}
                        >
                          {" "}
                          Finding Details
                        </div>
                      </MenuItem>
                      <MenuItem value={"Auditee"}>
                        {" "}
                        <div
                          style={{
                            backgroundColor:
                              selectedValue === "Auditee" ? "#3576BA" : "white",
                            textAlign: "center",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            color:
                              selectedValue === "Auditee" ? "white" : "black",
                          }}
                        >
                          Auditee Section
                        </div>
                      </MenuItem>
                      <MenuItem value={"Auditor"}>
                        <div
                          style={{
                            backgroundColor:
                              selectedValue === "Auditor" ? "#3576BA" : "white",
                            textAlign: "center",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            color:
                              selectedValue === "Auditor" ? "white" : "black",
                          }}
                        >
                          Auditor Section
                        </div>
                      </MenuItem>
                      <MenuItem value={"Closure"}>
                        <div
                          style={{
                            backgroundColor:
                              selectedValue === "Closure" ? "#3576BA" : "white",
                            textAlign: "center",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            color:
                              selectedValue === "Closure" ? "white" : "black",
                          }}
                        >
                          Closure
                        </div>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
              )}
              {matches ? (
                ""
              ) : (
                <div style={{ marginTop: "15px" }}>
                  {selectedValue === "Finding" ? (
                    <div>
                      <ListOfFindingsDrawer ncDisplayData={formData} />
                    </div>
                  ) : (
                    ""
                  )}
                  {selectedValue === "Auditee" ? (
                    <div>
                      {" "}
                      <AuditeeSectionDrawer
                        setAuditeeData={setAuditeeData}
                        template={template}
                        setTemplate={setTemplate}
                        auditeeData={auditeeData}
                        disabled={auditeeSectionDisabled}
                        auditDate={auditDate}
                        refForListOfFindingsForm2={refForListOfFindingsForm2}
                        refForListOfFindingsForm3={refForListOfFindingsForm3}
                        refForListOfFindingsForm4={refForListOfFindingsForm4}
                        refForListOfFindingsForm5={refForListOfFindingsForm5}
                        refForListOfFindingsForm6={refForListOfFindingsForm6}
                        refForListOfFindingsForm7={refForListOfFindingsForm7}
                        refForListOfFindingsForm8={refForListOfFindingsForm8}
                        refForListOfFindingsForm9={refForListOfFindingsForm9}
                        refForListOfFindingsForm10={refForListOfFindingsForm10}
                        refForListOfFindingsForm11={refForListOfFindingsForm11}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  {selectedValue === "Auditor" ? (
                    <div>
                      {" "}
                      <AuditorSectionDrawer
                        auditorData={auditorData}
                        setAuditorData={setAuditorData}
                        disabled={auditorSectionDisabled}
                        auditeeData={auditeeData}
                        refForListOfFindingsForm13={refForListOfFindingsForm13}
                        refForListOfFindingsForm14={refForListOfFindingsForm14}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  {selectedValue === "Closure" ? (
                    <div>
                      {" "}
                      <ClosureSectionDrawer
                        closureData={closureData}
                        setClosureData={setClosureData}
                        correctiveActionDate={correctiveActionDate}
                        disabled={closureSectionDisabled}
                        refForListOfFindingsForm16={refForListOfFindingsForm16}
                        refForListOfFindingsForm17={refForListOfFindingsForm17}
                        refForListOfFindingsForm18={refForListOfFindingsForm18}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              )}
            </div>

            <div>
              {!!workFlowDrawer.open && (
                <WorkFlowHistory
                  workFlowDrawer={workFlowDrawer}
                  setWorkFlowDrawer={setWorkFlowDrawer}
                  formData={formData.workflowHistory}
                />
              )}
            </div>
            {/* <div>
            {!!auditTrailDrawer.open && (
              <AuditTrailDrawer
                auditTrailDrawer={auditTrailDrawer}
                setAuditTrailDrawer={setAuditTrailDrawer}
                toggleAuditTrailDrawer={toggleAuditTrailDrawer}
              />
            )}
          </div> */}
            <div>
              {/* {!!peopleDrawer.open && (
              <DocWorkflowTopDrawer
                peopleDrawer={peopleDrawer}
                setPeopleDrawer={setPeopleDrawer}
                togglePeopleDrawer={togglePeopleDrawer}
                formData={!!formData && formData}
              />
            )} */}
            </div>
          </>
          {/* )} */}
        </Drawer>
      </div>
      <div>
        <Modal
          title={
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px",
              }}
            >
              Do you want to submit without evidence attachment?
            </div>
          }
          // icon={<ErrorIcon />}
          open={modalShow}
          onOk={() => handleSubmit("Submit to Auditor", true)}
          onCancel={() => {
            setModalShow(false);
          }}
          // okText="Yes"
          okType="danger"
          // cancelText="No"
        />
      </div>
      <div>
        <Modal
          visible={dialogOpen}
          onCancel={() => {
            if (selectedOption === "no") {
              cancelNc();
            } else {
              // Handle other logic for 'No' option
            }
            handleDialogClose();
          }}
          onOk={() => {
            if (selectedOption !== "") {
              convertToObservation();
              handleDialogClose();
            } else {
              // Handle other logic for 'Yes' optionenqueueSnackbar
              enqueueSnackbar(`Select Type to Convert`, {
                variant: "error",
              });
            }
          }}
          okButtonProps={{ disabled: findingTypes?.length > 1 ? false : true }}
        >
          {findingTypes?.length > 1 ? (
            <>
              <p>Would you like to create an Other Finding?</p>
              <Radio.Group
                onChange={(e) => {
                  setSelectedOption(e.target.value);
                }}
                value={selectedOption}
              >
                {findingTypes.map((value: any) => (
                  <Radio key={value.findingType} value={value.findingType}>
                    {value.findingType}
                  </Radio>
                ))}
              </Radio.Group>
              <p>Enter reason for Change of Finding Type</p>
              <Input.TextArea
                autoFocus
                placeholder="Comment"
                value={formData.rejectComment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rejectComment: e.target.value,
                  })
                }
                autoSize={{ minRows: 4, maxRows: 6 }}
              />
            </>
          ) : (
            <p>There Are No Other Finding Types To Change For This Audit </p>
          )}
        </Modal>
      </div>
      <div>
        <Modal
          visible={modalComment}
          onCancel={() => {
            setModalComment(false);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setModalComment(false);
              }}
            >
              No
            </Button>,
            formData.rejectComment && (
              <Button
                key="confirm"
                type="primary"
                onClick={() => {
                  handleSubmit("Send Back to Auditee", true);
                  setModalComment(false);
                }}
              >
                Yes
              </Button>
            ),
          ]}
        >
          <p>Enter Reason to Send Back To Auditee</p>
          <Input.TextArea
            autoFocus
            placeholder="Comment"
            value={formData.rejectComment}
            onChange={(e) =>
              setFormData({
                ...formData,
                rejectComment: e.target.value,
              })
            }
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </Modal>
      </div>

      <div>
        <Modal
          visible={rejectModal}
          onCancel={() => {
            setRejectModal(false);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setRejectModal(false);
              }}
            >
              No
            </Button>,
            <Button
              key="confirm"
              type="primary"
              onClick={() => {
                handleSubmit("Reject NC", true);
                setRejectModal(false);
              }}
            >
              Yes
            </Button>,
          ]}
        >
          <p>Enter Reason to Reject</p>
          <Input.TextArea
            autoFocus
            placeholder="Comment"
            value={formData.rejectComment}
            onChange={(e) =>
              setFormData({
                ...formData,
                rejectComment: e.target.value,
              })
            }
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </Modal>
      </div>

      <div>
        <Modal
          visible={finalRejectModal}
          onCancel={() => {
            setFinalRejectModal(false);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setFinalRejectModal(false);
              }}
            >
              No
            </Button>,
            <Button
              key="confirm"
              type="primary"
              onClick={() => {
                handleSubmit("REJECT", true);
                setFinalRejectModal(false);
              }}
            >
              Yes
            </Button>,
          ]}
        >
          <p>Enter Reason to Reject</p>
          <Input.TextArea
            autoFocus
            placeholder="Comment"
            value={formData.rejectComment}
            onChange={(e) =>
              setFormData({
                ...formData,
                rejectComment: e.target.value,
              })
            }
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </Modal>
      </div>
      {/* ------- accept modal */}
      <div>
        <Modal
          visible={acceptModal}
          onCancel={() => {
            setAcceptModal(false);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setAcceptModal(false);
              }}
            >
              No
            </Button>,
            <Button
              key="confirm"
              type="primary"
              onClick={() => {
                handleSubmit("Accept", true);
                setAcceptModal(false);
              }}
            >
              Yes
            </Button>,
          ]}
        >
          <p>Enter Reason to Accept</p>
          <Input.TextArea
            autoFocus
            placeholder="Comment"
            value={formData.rejectComment}
            onChange={(e) =>
              setFormData({
                ...formData,
                rejectComment: e.target.value,
              })
            }
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </Modal>
      </div>

      <Tour
        open={openTourForListOfFindingsForm1}
        onClose={() => setOpenTourForListOfFindingsForm1(false)}
        steps={stepsForListOfFindingsForm1}
      />
    </>
  );
};

export default NcSummaryDrawer;