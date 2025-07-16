import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Paper,
  Typography,
  Grid,
  TextField,
  Box,
  CircularProgress,
  Tooltip,
  Fab,
} from "@material-ui/core";
import Popper, { PopperPlacementType } from "@material-ui/core/Popper";
import { ClickAwayListener } from "@material-ui/core";
import Fade from "@material-ui/core/Fade";
import Rating from "../Rating";
import { useSnackbar } from "notistack";
import AuditClosureTable from "../EditableTable/AuditClosureTable";
import { useParams } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import { MdInbox } from "react-icons/md";
import { useStyles } from "./styles";
import {
  auditRating,
  checkRatePermissions,
  fetchAuditRating,
  getAuditById,
} from "../../apis/auditApi";
import getUserId from "../../utils/getUserId";
import { useRecoilState, useRecoilValue } from "recoil";
import { auditCreationForm, auditFormData } from "recoil/atom";
import CommentsEditor from "./CommentsEditor";
import {
  Col,
  Form,
  Input,
  Row,
  UploadProps,
  Upload,
  Button as AntdButton,
} from "antd";
import { MdDelete } from "react-icons/md";
import axios from "apis/axios.global";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import checkRole from "utils/checkRoles";
import { API_LINK } from "config";
import { Tour, TourProps } from "antd";
import getSessionStorage from "utils/getSessionStorage";
const { Dragger } = Upload;

interface ratingForm {
  rating: number;
  comment: string;
}

type Props = {
  disabled: boolean;
  refForReportForm28?: any;
  auditTypes?: any;
};

const AuditClosureForm = ({
  disabled,
  refForReportForm28,
  auditTypes,
}: Props) => {
  const [ratingValues, setRatingValues] = React.useState<ratingForm>({
    rating: 0,
    comment: "",
  });
  const [canRate, setCanRate] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const userDetails: any = getSessionStorage();
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<PopperPlacementType>();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const classes = useStyles();
  const userId: any = getUserId();
  const [isFetching, setIsFetching] = React.useState(true);
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);
  const [formData, setFormData] = useRecoilState<any>(auditFormData);
  const [fileList, setFileList] = useState<any>([]);
  const [richComment, setRichComment] = useState<any>("");
  const [generatingComment, setGeneratingComment] = useState(false);
  const [numDots, setNumDots] = useState(2);
  const summaryData = useRecoilValue(auditCreationForm);

  const isMr = checkRole("MR");
  useEffect(() => {
    setFormData({ ...formData, comment: richComment });
  }, [richComment]);

  useEffect(() => {
    // console.log("check comment and files-->", template);
    if (formData?.comment) {
      setRichComment(formData?.comment);
    }
  }, [formData]);

  // useEffect(() => {
  //   console.log("check formData in closure form", formData);
  // }, [formData]);

  const handleDeleteFile = async (url: string) => {
    try {
      // Filter out the deleted URL from formData.urls
      const updatedUrls = formData.urls.filter((item: any) => item.uid !== url);

      setFormData((prevFormData: any) => ({
        ...prevFormData,
        urls: updatedUrls,
      }));
    } catch (error) {}
  };

  const uploadProps: UploadProps = {
    multiple: true,
    beforeUpload: () => false,
    fileList: formData?.files || [],
    onRemove: (file) => {
      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== file.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        urls: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          urls: fileList,
        }));
      }
    },
  };

  /**
   * @method closePopper
   * @description Function to close popper
   * @returns nothing
   */
  const closePopper = () => {
    setOpen(false);
  };

  /**
   * @method ratingFormSubmit
   * @description Function to submit the rating along with the comments
   * @param event {React.FormEvent}
   * @returns nothing
   */
  const ratingFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await auditRating(
      `${id}`,
      userId,
      ratingValues.rating,
      ratingValues.comment
    );
    closePopper();
    enqueueSnackbar("Rating submitted successfully", {
      variant: "success",
    });
  };

  /**
   * @method finalSubmit
   * @description Function to submit form data of multistepper form
   * @returns nothing
   * @memberof AuditCreationForm
   */
  // const finalSubmit = async () => {
  //   const validateAuditname = await isValid(formData?.auditName);

  //   if (validateAuditname.isValid === false) {
  //     enqueueSnackbar(`Audit Report Name ${validateAuditname?.errorMessage}`, {
  //       variant: "error",
  //     });
  //     return;
  //   }
  //   handleClose();
  //   let uploadAttachementResponse, newFormData;
  //   const checklistCopy = await getObtainedSectionScore();
  //   if (location?.state?.read || idParam.hasOwnProperty("readonly")) {
  //     navigate("/audit", {
  //       state: { redirectToTab: "AUDIT REPORT" },
  //     });
  //     return;
  //   }
  //   if (!!formData?.urls && formData?.urls.length > 0) {
  //     uploadAttachementResponse = await uploadAuditReportAttachments(
  //       formData?.urls
  //     );
  //   }
  //   // if (formData?.auditees?.length === 0) {
  //   //   enqueueSnackbar("Select Auditees", {
  //   //     variant: "error",
  //   //   });
  //   //   return;
  //   // }

  //   if (formData?.auditors?.length === 0) {
  //     enqueueSnackbar("Select Auditors", {
  //       variant: "error",
  //     });
  //     return;
  //   }
  //   if (uploadAttachementResponse?.length > 0) {
  //     newFormData = {
  //       ...formData,
  //       sections: checklistCopy,
  //       urls: uploadAttachementResponse,
  //     };
  //   } else {
  //     newFormData = { ...formData, sections: checklistCopy };
  //   }

  //   if (idParam?.id === undefined || idParam?.id === "undefined") {
  //     const result = await axios.get(
  //       `/api/audits/ValidateAuditIsUnique?locationId=${formData.location}&auditName=${formData.auditName}`
  //     );
  //     if (result.data !== true) {
  //       enqueueSnackbar("Audit Name Already Exist", {
  //         variant: "error",
  //       });
  //       return;
  //     }
  //   }
  //   const { createdAt, updatedAt, createdBy, publishedDate, title, ...rest } =
  //     newFormData;
  //   var date = moment();
  //   var dateComponent = date.format("YYYY-MM-DD");
  //   var timeComponent = date.format("HH:mm");
  //   if (rest.date === "")
  //     rest.date = rest.date = `${dateComponent}T${timeComponent}`;
  //   rest.isDraft = false;
  //   rest.auditYear = auditYear;
  //   validationSchema
  //     .validate(rest)
  //     .then(async () => {
  //       let res: any;

  //       if (idParam.id) {
  //         if (location?.state?.moveToLast === true) {
  //           navigate("/audit", {
  //             state: {
  //               redirectToTab: "AUDIT REPORT",
  //             },
  //           });
  //         } else {
  //           res = await editAudit(idParam.id, rest).then(
  //             async (response: any) => {
  //               enqueueSnackbar("Audit Submitted Successfully", {
  //                 variant: "success",
  //               });
  //               try {
  //                 const result = await axios.post(
  //                   `api/audits/sendMailWithPdfReport/${idParam.id}`
  //                 );
  //                 if (result.status === 201) {
  //                   enqueueSnackbar("Mail Sent Successfully", {
  //                     variant: "success",
  //                   });
  //                 }
  //               } catch (error) {
  //                 // console.log("error", error);
  //               }

  //               setFormData(rest);
  //               navigate("/audit", {
  //                 state: {
  //                   redirectToTab: "AUDIT REPORT",
  //                 },
  //               });
  //             }
  //           );
  //         }
  //       } else {
  //         try {
  //           const response = await axios.get(
  //             `/api/serial-number/generateSerialNumber?moduleType=Audit Report&location=${formData?.location}&createdBy=${userInfo?.id}&organizationId=${organizationId}`
  //           );

  //           const generatedValue = response.data;
  //           // Get the current month and year
  //           const currentDate = new Date();
  //           const currentMonth = (currentDate.getMonth() + 1)
  //             .toString()
  //             .padStart(2, "0");
  //           const currentYear = currentDate.getFullYear().toString().slice(-2);
  //           const LocationId = userInfo?.location?.locationId;
  //           const EntityId = userInfo?.entity?.entityId;
  //           // Replace all instances of "MM" with currentMonth

  //           res = await addAuditReportData({
  //             ...rest,
  //           });
  //           if (res.message === "Conflict") {
  //             enqueueSnackbar("Audit Name already exist", {
  //               variant: "error",
  //             });
  //             return;
  //           } else {
  //             try {
  //               const result = await axios.post(
  //                 `api/audits/sendMailWithPdfReport/${res?.respond?._id}`
  //               );
  //               if (result.status === 201) {
  //                 enqueueSnackbar("Mail Sent Successfully", {
  //                   variant: "success",
  //                 });
  //               } else {
  //                 enqueueSnackbar("Provide valid email address", {
  //                   variant: "error",
  //                 });
  //               }
  //             } catch (error) {}
  //             enqueueSnackbar("Audit Submitted Successfully", {
  //               variant: "success",
  //             });
  //           }

  //           setFormData(rest);
  //           navigate("/audit", {
  //             state: {
  //               redirectToTab: "AUDIT REPORT",
  //             },
  //           });
  //         } catch (error) {
  //           setIsLoading(false);

  //           enqueueSnackbar(`Error Occurred while creating audit plan`, {
  //             variant: "error",
  //           });
  //         }
  //       }
  //     })
  //     .catch((error: any) => {
  //       enqueueSnackbar(error.message, { variant: "error" });
  //     });
  // };

  /**
   * @method ratingHandler
   * @description Function to handle rating component changes
   * @param event {React.ChangeEvent<{value: unknown}>}
   * @returns nothing
   */
  const ratingHandler = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRatingValues({ ...ratingValues, rating: event.target.value as number });
  };

  /**
   * @method ratingCommentHandler
   * @description Function to handle comment field changes
   * @param event {React.ChangeEvent<{value: unknown}>}
   */
  const ratingCommentHandler = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setRatingValues({ ...ratingValues, comment: event.target.value as string });
  };

  /**
   * @method handleClick
   * @description Function to open rating popper
   * @param newPlacement {PopperPlacementType}
   * @param event {React.MouseEvent<HTMLButtonElement>}
   * @returns nothing
   */

  const handleClick =
    (newPlacement: PopperPlacementType) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen((prev) => placement !== newPlacement || !prev);
      setPlacement(newPlacement);
    };

  const addNewNcObject = () => {
    const newNcObject = {
      nc: {
        type: "-",
        comment: "",
        findingTypeId: "",
        added: true,
        clause: [],
        attachment: [],
        statusClause: true,
      },
      _id: generateUniqueId(24),
      id: generateUniqueId(10),
      title: "",
      inputType: "text",
      questionScore: 0,
      required: true,
      allowImageUpload: true,
      value: "",
      hint: "",
      slider: false,
      open: false,
      image: "image url",
      imageName: "",
      // createdAt: "2023-08-08T00:00:00.000Z",
      // updatedAt: "2023-08-08T00:00:00.000Z",
      __v: 0,
    };
    setTemplate((prev: any) => {
      const copyData = JSON?.parse(JSON?.stringify(prev));
      if (copyData?.length > 0) {
        copyData[copyData.length - 1]?.sections[0]?.fieldset?.push(newNcObject);
        return copyData;
      } else {
        enqueueSnackbar("Add atleast 1 questions to add additional questions", {
          variant: "warning",
        });
        return copyData;
      }
    });
  };

  /**
   * @method checkRatingPermission
   * @description Function to check whether current user has rating permission or not
   * @returns nothing
   */
  const checkRatingPermission = () => {
    id &&
      checkRatePermissions(id!, {
        userId: userId,
      }).then((response: any) => {
        setCanRate(response?.data);
      });
  };

  /**
   * @method fetchRating
   * @param audId
   * @description Function to fetch rating for the current user and set rating values
   * @returns nothing
   */
  const fetchRating = async (audId: string) => {
    setIsFetching(true);
    const res = await fetchAuditRating(id!, audId);
    setRatingValues({
      rating: res?.rating,
      comment: res?.comment,
    });
    setIsFetching(false);
  };

  async function getAuditId() {
    const res = await getAuditById(id!);
    res.success && fetchRating(res?.respond?.auditors[0]?.id);
  }

  React.useEffect(() => {
    checkRatingPermission();
    getAuditId();
  }, []);

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const handleLinkClick = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.url
        : await viewObjectStorageDoc(item?.url);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };

  const refForReportForm21 = useRef(null);
  const refForReportForm22 = useRef(null);
  const refForReportForm23 = useRef(null);
  const refForReportForm24 = useRef(null);
  const refForReportForm25 = useRef(null);
  const refForReportForm26 = useRef(null);
  const refForReportForm27 = useRef(null);
  // const refForReportForm28 = useRef(null);

  const [openTourForReportFormS1, setOpenTourForReportFormS1] =
    useState<boolean>(false);

  const stepsForReportFormS1: TourProps["steps"] = [
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm21.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm22.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm23.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm24.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm25.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm26.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm27.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm28.current,
    },
  ];

  const nameConstruct = (data: any) => {
    if (data?.hasOwnProperty("documentNumbering")) {
      return data?.documentNumbering;
    } else if (data?.hasOwnProperty("type")) {
      return data?.name;
    } else if (data?.jobTitle) {
      return data?.jobTitle;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNumDots((prevNumDots) => (prevNumDots === 4 ? 2 : prevNumDots + 1));
    }, 500);

    if (!generatingComment) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [generatingComment]);

  const getAIAuditReportSummary = async () => {
    setGeneratingComment(true);
    let fillTemplate = "";
    const tableHtmlFormat = `<table>
    <tr>
      <th>%NUMBER%</th>
      <th colspan="5">Findings : %TITLE%</th>
    </tr>
    <tr>
      <th width="4%">Sr.No</th>
      <th width="48%">Findings Details</th>
      <th width="24%">Clause Number</th>
      <th width="24%">Reference</th>
    </tr>
    %CONTENT%
   </table>`;
    const uniqueFindingsObject: Record<string, any[]> = {};
    let count = 0;

    summaryData?.forEach((section: any) => {
      section?.sections?.forEach((sections: any) => {
        sections?.fieldset?.forEach((field: any) => {
          const fieldType = field?.nc?.type;
          if (fieldType) {
            if (!uniqueFindingsObject[fieldType]) {
              uniqueFindingsObject[fieldType] = [];
            }
            uniqueFindingsObject[fieldType].push(field.nc);
          }
        });
      });
    });

    Object.entries(uniqueFindingsObject).forEach(([type, fields]) => {
      fillTemplate =
        fillTemplate +
        tableHtmlFormat
          .replace("%NUMBER%", (++count).toString())
          .replace("%TITLE%", type)
          .replace(
            "%CONTENT%",
            fields && fields.length
              ? fields
                  .map((nc: any, index: any) => {
                    const ncRef = nc.reference
                      ?.map((ref: any) => nameConstruct(ref))
                      .join(", ");
                    const ncHtml = `
                    <tr key={index}>
                      <td>${index + 1})</td>
                      <td>${nc.comment ? nc.comment : "N/A"}</td>
                      <td>${nc?.clause ? nc?.clause?.clauseName : ""}</td>
                      <td>${ncRef ? ncRef : ""}</td>
                    </tr>
                    <tr key={index}>
                      <th colspan="1"></th>
                      <th colspan="3" style="text-align: left;">
                        Evidence
                      </th>
                    </tr>
                    `;
                    let imageHtml = "";
                    const evidenceHtml = nc.evidence
                      ?.map((item: any) => {
                        const attFileName: any[] = [];
                        if (item.attachment && item.attachment.length > 0) {
                          if (
                            process.env.REACT_APP_IS_OBJECT_STORAGE === "true"
                          ) {
                            imageHtml = item.attachment
                              ?.map((attachment: any) => {
                                attFileName.push(attachment.name);
                                if (
                                  attachment.obsUrl
                                    .toLowerCase()
                                    .endsWith(".png") ||
                                  attachment.obsUrl
                                    .toLowerCase()
                                    .endsWith(".jpg") ||
                                  attachment.obsUrl
                                    .toLowerCase()
                                    .endsWith(".jpeg")
                                ) {
                                  return `<img src="${attachment.obsUrl}" alt="Description of the image" width="356" height="200" style="margin-right: 40px; margin-bottom: 5px;">`;
                                }
                              })
                              .join("");
                          } else {
                            imageHtml = item.attachment
                              ?.map((attachment: any) => {
                                attFileName.push(attachment.name);
                                if (
                                  attachment.url
                                    .toLowerCase()
                                    .endsWith(".png") ||
                                  attachment.url
                                    .toLowerCase()
                                    .endsWith(".jpg") ||
                                  attachment.url.toLowerCase().endsWith(".jpeg")
                                ) {
                                  return `<img src="${attachment.url}" alt="Description of the image" width="356" height="200" style="margin-right: 40px;">`;
                                }
                              })
                              .join("");
                          }
                          return `
                        <tr key={index}>
                          <td colspan="1"></td>
                          <td colspan="3" style="text-align: left;">
                            ${item.text}<br><br>
                            <strong>Attached Files:</strong> ${attFileName.join(
                              ",  "
                            )}<br>
                            ${imageHtml}
                          </td>
                        </tr>
                      `;
                        } else {
                          return `
                        <tr key={index}>
                          <td colspan="1"></td>
                          <td colspan="3" style="text-align: left;">
                            ${item.text}
                          </td>
                        </tr>
                      `;
                        }
                      })
                      .join("");
                    return ncHtml + (evidenceHtml ? evidenceHtml : "");
                  })
                  .join("")
              : `
                  <tr style="background-color: #ffa07a; text-align: center;" >
                    <td colspan="4" style="margin: auto;"> No Data Found  </td>
                  </tr>
                  `
          );
    });

    // Template for checklist title only
    const checklistHtmlFormat = `
      <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse; table-layout: fixed; border: 1px solid black;">
        <thead>
          <tr style="background-color: #e9ecef;">
            <th colspan="3" style="font-size: 24px; font-weight: bold; text-align: left; border: 1px solid black; padding: 10px;">%CHECKLIST_TITLE%</th>
          </tr>
        </thead>
      </table>`;

    // Template for sections with table header inside
    const sectionHtmlFormat = `
      <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse; table-layout: fixed; border: 1px solid black;">
        <thead>
          <tr>
            <th colspan="3" class="section-title" style="font-size: 18px; font-weight: bold; padding: 10px; text-align: left; background-color: #f7f7f7;">%SECTION_TITLE%</th>
          </tr>
          <tr style="background-color: #e9ecef;">
            <th style="width: 60%; padding: 10px; border: 1px solid black; text-align: left;">Question</th>
            <th style="width: 30%; padding: 10px; border: 1px solid black; text-align: left;">Answer</th>
            <th style="width: 10%; padding: 10px; border: 1px solid black; text-align: center;">Score</th>
          </tr>
        </thead>
        <tbody>
          %FIELDSET_CONTENT%
        </tbody>
      </table>`;

    // Template for fieldsets (no header here, as header is included in the section)
    const fieldsetHtmlFormat = `
      <tr>
        <td style="width: 60%; padding: 10px; border: 1px solid black; word-wrap: break-word; overflow-wrap: break-word; text-align: left;">%QUESTION%</td>
        <td style="width: 30%; padding: 10px; border: 1px solid black; word-wrap: break-word; overflow-wrap: break-word; text-align: left;">%ANSWER%</td>
        <td style="width: 10%; padding: 10px; border: 1px solid black; word-wrap: break-word; overflow-wrap: break-word; text-align: center;">%SCORE%</td>
      </tr>`;

    // Track unique checklists
    const uniqueChecklists = new Set();

    // Generate HTML
    const checklistReportHtml = formData.sections
      .map((checklist: any) => {
        // Skip duplicate checklists
        if (uniqueChecklists.has(checklist.title)) {
          return "";
        }
        uniqueChecklists.add(checklist.title);

        // Generate content for sections
        const sectionsContent = checklist.sections
          .map((section: any) => {
            const fieldsetContent = section.fieldset
              .map((field: any) =>
                fieldsetHtmlFormat
                  .replace("%QUESTION%", field.title)
                  .replace(
                    "%ANSWER%",
                    field.inputType === "checkbox"
                      ? field.options
                          .filter((item: any) => item.checked === true)
                          .map((item: any) => item.name)
                          .join(", ")
                      : field.value
                  )
                  .replace("%SCORE%", field.questionScore)
              )
              .join("");

            return sectionHtmlFormat
              .replace(
                "%SECTION_TITLE%",
                `${
                  section.title
                } &nbsp; ( Section Score: ${section.fieldset.reduce(
                  (sectionTotal: number, fieldset: any) =>
                    sectionTotal + (fieldset.questionScore || 0),
                  0
                )} / ${section.fieldset.reduce(
                  (sectionMaxTotal: number, fieldset: any) => {
                    let maxScore = 0;
                    if (fieldset.inputType === "checkbox") {
                      maxScore = Math.max(
                        fieldset.options[0]?.value || 0,
                        fieldset.options[1]?.value || 0
                      );
                    } else if (fieldset.inputType === "radio") {
                      maxScore = Math.max(
                        fieldset.options[0]?.value || 0,
                        fieldset.options[1]?.value || 0,
                        fieldset.options[2]?.value || 0
                      );
                    } else if (fieldset.inputType === "numeric") {
                      maxScore = Math.max(
                        fieldset.score[0]?.score || 0,
                        fieldset.score[1]?.score || 0
                      );
                    }
                    return sectionMaxTotal + maxScore;
                  },
                  0
                )})`
              )
              .replace("%FIELDSET_CONTENT%", fieldsetContent);
          })
          .join("");

        // Combine checklist title and section content
        return (
          checklistHtmlFormat.replace("%CHECKLIST_TITLE%", checklist.title) +
          sectionsContent
        );
      })
      .join("");

    const attachmentUrls = summaryData
      ?.flatMap((section: any) => section.sections)
      .flatMap((subSection: any) => subSection.fieldset)
      .flatMap((fieldset: any) => fieldset.nc?.evidence || [])
      .flatMap((evidence: any) => evidence.attachment || [])
      .map((attachment: any) => attachment.url);

    axios
      .post(`${process.env.REACT_APP_PY_URL}/pyapi/getAIAuditReportSummary`, {
        query: {
          auditReportSummaryHtml: fillTemplate,
          //auditChecklistHtml: checklistReportHtml,
          attachmentUrls: attachmentUrls.map((url: any) =>
            url.replace(process.env.REACT_APP_API_URL, "../uploads")
          ),
        },
      })
      .then((response) => {
        setGeneratingComment(false);
        setFormData((prevData: any) => ({
          ...prevData,
          comment: response.data,
        }));
      });
  };

  return (
    <>
      <div className={classes.scroll}>
        <Paper elevation={0} className={classes.root}>
          <Typography align="center" className={classes.title}>
            Audit Summary
          </Typography>
          {/* <div
            // style={{ position: "fixed", top: "77px", right: "120px" }}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "end",
              position: "relative",
              top: "-30px",
              right:"13px",
            }}
          >
            <MdTouchApp
              style={{ cursor: "pointer" }}
              onClick={() => {
                setOpenTourForReportFormS1(true);
              }}
            />
          </div> */}
          <Grid container justify="flex-end">
            <Grid item>
              {template ? (
                <Tooltip title="New Issues">
                  <Fab
                    size="medium"
                    onClick={addNewNcObject}
                    // disabled={!template}
                    disabled={disabled}
                    ref={refForReportForm21}
                  >
                    <MdAdd />
                  </Fab>
                </Tooltip>
              ) : (
                <Tooltip title="Please select CheckList">
                  <Fab
                    size="medium"
                    onClick={addNewNcObject}
                    // disabled={!template}
                    disabled={disabled}
                  >
                    <MdAdd />
                  </Fab>
                </Tooltip>
              )}
            </Grid>
          </Grid>
          <div className={classes.tableSection}>
            <div className={classes.table}>
              <AuditClosureTable
                disabled={disabled}
                auditTypes={auditTypes}
                refForReportForm22={refForReportForm22}
                refForReportForm23={refForReportForm23}
                refForReportForm24={refForReportForm24}
              />
              {isMr && id && (
                <div className={classes.ratingButtonWrapper}>
                  <ClickAwayListener onClickAway={closePopper}>
                    <div>
                      <Popper
                        open={open}
                        anchorEl={anchorEl}
                        placement={placement}
                        transition
                      >
                        {({ TransitionProps }) => (
                          <Fade {...TransitionProps} timeout={0}>
                            <Paper className={classes.popperContainer}>
                              {isFetching ? (
                                <Box
                                  width={350}
                                  height={150}
                                  display="flex"
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <CircularProgress />
                                </Box>
                              ) : (
                                <form onSubmit={ratingFormSubmit}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12} md={4}>
                                      <Typography variant="body2">
                                        Rate Auditor
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={8}>
                                      <Rating
                                        name="rate-auditors"
                                        value={ratingValues.rating}
                                        onChange={ratingHandler}
                                        readOnly={false}
                                        size="medium"
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4}>
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        height="100%"
                                      >
                                        <Typography variant="body2">
                                          Review Auditor
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={8}>
                                      <TextField
                                        type="text"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        multiline
                                        value={ratingValues.comment}
                                        onChange={ratingCommentHandler}
                                      />
                                    </Grid>
                                    <Button
                                      className={classes.submitButton}
                                      size="small"
                                      type="submit"
                                    >
                                      Submit
                                    </Button>
                                  </Grid>
                                </form>
                              )}
                            </Paper>
                          </Fade>
                        )}
                      </Popper>
                      {/* <Button
                        data-testid="form-stepper-back-button"
                        onClick={handleClick("bottom")}
                        className={classes.ratingButton}
                        size="small"
                      >
                        Rate Auditor
                      </Button> */}
                    </div>
                  </ClickAwayListener>
                </div>
              )}
            </div>
          </div>
          {/* <Row
            gutter={[16, 16]}
            style={{ marginLeft: "12px", marginRight: "12px" }}
          >
            <Col span={24}>
              <div ref={refForReportForm25}>
                <Typography variant="body2" style={{ margin: "2px" }}>
                  Good Practices :{" "}
                </Typography>
                <TextArea
                  rows={1}
                  autoSize={{ minRows: 1, maxRows: 6 }}
                  placeholder="Good Practices"
                  size="large"
                  name="goodpractices"
                  style={{ fontSize: "14px" }}
                  onChange={(e: any) => {
                    setFormData({
                      ...formData,
                      ["goodPractices"]: e.target.value,
                    });
                  }}
                  value={formData?.goodPractices}
                />
              </div>
            </Col>
          </Row> */}
          <Row
            gutter={[16, 16]}
            style={{ marginLeft: "12px", marginRight: "12px" }}
          >
            <Col span={24}>
              <div ref={refForReportForm26}>
                <Typography
                  variant="body2"
                  style={{
                    color: "#003566",
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                >
                  Audit Report Comments :{" "}
                  {userDetails?.organization?.activeModules.includes(
                    "AI_FEATURES"
                  ) && (
                    <AntdButton
                      type="primary"
                      onClick={getAIAuditReportSummary}
                      disabled={generatingComment}
                    >
                      Generate AI Comment
                    </AntdButton>
                  )}
                  {generatingComment && (
                    <strong style={{ paddingLeft: "10px" }}>
                      Generating Comment Please Wait
                      {Array(numDots).fill(".").join("")}
                    </strong>
                  )}
                </Typography>

                <CommentsEditor
                  comment={richComment}
                  setComment={setRichComment}
                  disabled={disabled}
                />
              </div>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ margin: "12px" }}>
            <Col span={24}>
              <div ref={refForReportForm27}>
                <Typography
                  variant="body2"
                  style={{
                    color: "#003566",
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                >
                  Attach Files:
                </Typography>
                <Form.Item name="uploader" style={{ display: "none" }}>
                  <Input />
                </Form.Item>
                <Dragger name="files" {...uploadProps} disabled={disabled}>
                  <div style={{ textAlign: "center" }}>
                    <MdInbox style={{ fontSize: "36px" }} />
                    <p className="ant-upload-text">
                      Click or drag files here to upload
                    </p>
                  </div>
                </Dragger>
                {!!formData?.urls && !!formData?.urls?.length && (
                  <div>
                    <Typography
                      variant="body2"
                      style={{ marginTop: "16px", marginBottom: "8px" }}
                    >
                      Uploaded Files:
                    </Typography>
                    {formData?.urls?.map((item: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <Typography
                          className={classes.filename}
                          onClick={() => handleLinkClick(item)}
                        >
                          {/* File {index + 1} */}
                          {item.name}
                        </Typography>
                        <div
                          style={{ cursor: "pointer", marginRight: "8px" }}
                          onClick={() => handleDeleteFile(item.uid)}
                        >
                          <MdDelete style={{ fontSize: "18px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
          </Row>
          {/* <div className={classes.fixedContainer}>
      <Button className={classes.button}>Complete Report</Button>
    </div> */}
        </Paper>
      </div>

      <Tour
        open={openTourForReportFormS1}
        onClose={() => setOpenTourForReportFormS1(false)}
        steps={stepsForReportFormS1}
      />
    </>
  );
};

export default AuditClosureForm;
