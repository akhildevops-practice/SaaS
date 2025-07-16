import React, { useEffect, useRef, useState } from "react";
import { templateForm, auditCreationForm } from "../../recoil/atom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { InputHandlerType } from "../../utils/enums";
import { auditFormData } from "../../recoil/atom";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import InfoIcon from "../../assets/icons/Info.svg";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import AttachIcon from "../../assets/icons/AttachIcon.svg";
import ComponentGenerator from "../ComponentGenerator";
import { MdAdd } from "react-icons/md";
import IconButton from "@material-ui/core/IconButton";
import NcCard from "../NcCard";
import { MdClear } from "react-icons/md";
import { MdExpandMore } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { MdRemove } from "react-icons/md";
import {
  TextField,
  Fab,
  MenuItem,
  FormControl,
  Select,
  Divider,
  Modal,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@material-ui/core";
import FormFieldController from "../../components/FormFieldController";
import { Autocomplete } from "@material-ui/lab";
import { MdArrowUpward } from "react-icons/md";
import { formStepperError } from "../../recoil/atom";
import {
  addAttachment,
  deleteAttachment,
  getAuditTemplate,
} from "../../apis/auditApi";
import { API_LINK } from "../../config";
import { useParams } from "react-router-dom";
import useStyles from "./style";
import checkRole from "../../utils/checkRoles";
import axios from "apis/axios.global";
import { formatDashboardQuery } from "utils/formatDashboardQuery";
import getAppUrl from "utils/getAppUrl";
import { Tour, TourProps, Modal as AntModal, message, Row, Input } from "antd";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import printJS from "print-js";
import { FaRegFilePdf } from "react-icons/fa";
import AliceCarousel from "react-alice-carousel";
import { MdChevronRight } from "react-icons/md";
import { MdChevronLeft } from "react-icons/md";
import "./Slide.css";
import Webcam from "react-webcam";
import { MdFlipCameraAndroid } from "react-icons/md";
import { MdPhotoLibrary } from "react-icons/md";
import { MdInsertDriveFile } from "react-icons/md";
import { MdChatBubbleOutline } from "react-icons/md";
import { FaFileAlt, FaFileImage } from "react-icons/fa";
import { MdCloudUpload } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import { useSnackbar } from "notistack";

type Props = {
  disabled?: boolean;
};

/**
 * @description Used for defining operator types which makes calculation easier
 */
const operatorType: any = {
  gt: ">",
  lt: "<",
  eq: "==",
  abs: "abs",
};

/**
 * @method evaluateScore
 * @param operator {any}
 * @param value {any}
 * @param operatorValue {any}
 * @param operatorScore {any}
 * @returns the calculated score
 */
const evaluateScore = (
  operator: any,
  value: any,
  operatorValue: any,
  operatorScore: any
) => {
  let result;
  switch (operator) {
    case "gt":
      if (value > operatorValue) result = operatorScore;
      else result = 0;
      break;
    case "lt":
      if (value < operatorValue) result = operatorScore;
      else result = 0;
      break;
    case "eq":
      if (value == operatorValue) result = operatorScore;
      else result = 0;
      break;
    default:
      result = 0;
  }
  return result;
};

const Checklist = ({ disabled }: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);
  const [displayCard, setDisplayCard] = React.useState(false);
  const [currentQuestionIndex, setcurrentQuestionIndex] = React.useState<any>();
  const [currentSectionIndex, setcurrentSectionIndex] = React.useState<any>();
  const [currentCheckListId, setcurrentCheckListId] = React.useState<any>();
  const [totalQuestions, setTotalQuestions] = React.useState(0);
  const [comments, SetComments] = React.useState("");
  const [sectionsIndex, setsectionIndex] = React.useState<any>();
  const [questionsIndex, setQuestionIndex] = React.useState(0);
  const [defaultValue, setDefaultValue] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [showModal, setShowModal] = React.useState(false);
  const idParam = useParams();
  const templateData = useRecoilState(templateForm);
  const [formData, setFormData] = useRecoilState<any>(auditFormData);
  const [suggestion, setSuggestion] = React.useState([]);
  const [icon, setIcon] = React.useState(false);
  const [totalScore, setTotalScore] = React.useState<number | undefined>(
    template?.totalScore
  );
  const setStepperError = useSetRecoilState<boolean>(formStepperError);
  const [value, setValue] = React.useState<any>();
  const [visible, setVisible] = React.useState(false);
  const classes: any = useStyles();
  const isAuditor = checkRole("AUDITOR");
  const isLocAdmin = checkRole("LOCATION-ADMIN");
  const [hoveredUserId, setHoveredUserId] = useState(false);
  const realmName = getAppUrl();
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const responsive = {
    0: { items: 2 },
    600: { items: 2 },
    1024: { items: 4 },
    1440: { items: 6 }, // Adjust for larger screens
  };
  const carouselRef = useRef<any>(null);
  const [selectedCheckList, setSelectedCheckList] = React.useState<any>(
    formData?.selectedTemplates && formData?.selectedTemplates[0]?._id
  );
  const [impactType, setImpactType] = useState([]);

  const webcamRef = useRef<Webcam>(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [alignValue, setAlignValue] = useState<any>("Checklist");
  const [alignId, setAlignId] = useState<any>(0);
  const [alignButtonIndex, setAlignButtonIndex] = useState<any>(0);
  const [commentStatus, setCommentStatus] = useState(false);
  const [indexNumbers, setIndexNumbers] = useState<any>({
    indexTemp: null,
    index: null,
    indexItem: null,
  });
  const [msgValueIndex, setMsgValueIndex] = useState<any>(null);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };
  useEffect(() => {
    getAllImpact();
  }, []);

  useEffect(() => {
    if (webcamRef.current) {
      const interval = setInterval(() => {
        if (webcamRef.current?.video?.readyState === 4) {
          setIsWebcamReady(true); // Mark as ready when the camera is fully loaded
          clearInterval(interval);
        }
      }, 500);
    }
  }, [isModalOpen]);

  const getAllImpact = async () => {
    const response = await axios.get(`/api/audit-settings/getAllImpact`);
    setImpactType(
      response.data.map((item: any) => ({
        id: item?._id,
        impactType: item.impactType,
        lable: item?.impactType,
        name: item?.impactType,
        value: item?.impactType,
        impact: item.impact || [],
      }))
    );
  };
  const openModal = async () => {
    setIsModalOpen(true);
    setIsWebcamReady(false); // Reset webcam state
    await startCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
      });

      if (webcamRef.current && webcamRef.current.video?.srcObject) {
        webcamRef.current.video.srcObject = stream;
      }
    } catch (error) {
      alert("Camera access denied or unavailable.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (webcamRef.current && webcamRef.current.video?.srcObject) {
      const stream = webcamRef.current.video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const capture = () => {
    if (!isWebcamReady) {
      alert("Camera not ready yet. Please wait...");
      return;
    }
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      saveImage(image, `captured-image-${Date.now()}.jpg`);
      // closeModal();
    }
  };

  const saveImage = async (dataUrl: any, fileName: any) => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `captured-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // useEffect(()=>{
  //   console.log("check formData in checklist page", formData);

  // },[formData])

  /**
   * @method handleImageUpload
   * @description Function to handle file upload. Converts the image to form data before inserting it into the recoil state object.
   * @param e {any}
   * @param sectionIndex {any}
   * @param questionIndex {any}
   */

  // const validationCheck = () => {
  //   if (template?.questionCount) {
  //     setStepperError(false);
  //   } else {
  //     setStepperError(true);
  //   }
  // };

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const handleLinkClick = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.image
        : await viewObjectStorageDoc(item?.image);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };

  const handleImageUpload = (
    e: any,
    indextemp: any,
    sectionIndex: any,
    questionIndex: any
  ) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    const copyData = JSON.parse(JSON.stringify(template));

    const data =
      copyData[indextemp].sections[sectionIndex].fieldset[questionIndex]["nc"]
        ?.evidence;

    if (data === undefined) {
      addAttachment(
        formData,
        realmName,
        loggedInUser.location.locationName
      ).then((response: any) => {
        const attachmentData = {
          text: "",
          attachment: [
            {
              uid: generateUniqueId(10),
              name: response?.data.name,
              url: response?.data.path,
              status: "done",
            },
          ],
          refernce: [],
        };
        setTemplate((prev: any) => {
          copyData[indextemp].sections[sectionIndex].fieldset[questionIndex][
            "nc"
          ].evidence = [attachmentData];

          return copyData;
        });
      });
    } else {
      addAttachment(
        formData,
        realmName,
        loggedInUser.location.locationName
      ).then((response: any) => {
        const oldData =
          copyData[indextemp]?.sections[sectionIndex]?.fieldset[questionIndex][
            "nc"
          ].evidence?.[0]?.attachment;
        const attachmentData: any = [
          {
            text: "",
            attachment: [
              {
                uid: generateUniqueId(10),
                name: response?.data.name,
                url: response?.data.path,
                status: "done",
              },
            ],
          },
        ];
        setTemplate((prev: any) => {
          copyData[indextemp].sections[sectionIndex].fieldset[questionIndex][
            "nc"
          ].evidence[0] = attachmentData;

          return copyData;
        });
      });
    }
    if (matches === false) {
      closeModal();
    }
  };
  /**
   * @method fetchSuggestionsList
   * @description Function to fetch suggestions list
   * @param searchText {string}
   * @returns suggestions {array}
   */
  // const fetchSuggestionsList = () => {
  //   getAllSuggestions(formData.location).then((res: any) => {
  //     setSuggestion(res?.data);
  //   });
  // };
  /**
   * @method handleChange
   * @description Function to handle form input changes in the checklist
   * @param e {any}
   * @returns nothing
   */
  const handleChange = (
    e: any,
    value: any,
    indextemp: any,
    sectionIndex: any,
    questionIndex: any
  ) => {
    if (e?.target?.name === "radio") {
      const checklistData = JSON.parse(JSON.stringify(template));
      if (e.target.value === "yes") {
        setTemplate((prev: any) => {
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].value =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[0].name;
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].questionScore =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[0].value;
          // return { ...prev, ...checklistData };
          return checklistData;
        });
      }
      if (e.target.value === "no") {
        setTemplate((prev: any) => {
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].value =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[1].name;
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].questionScore =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[1].value;
          // return { ...prev, ...checklistData };
          return checklistData;
        });
      }
      if (e.target.value === "na") {
        setTemplate((prev: any) => {
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].value =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[2].name;
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].questionScore =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[2].value;
          // return { ...prev, ...checklistData };
          return checklistData;
        });
      }
    } else if (e?.target?.name === "yes") {
      const checklistData = JSON.parse(JSON.stringify(template));
      setTemplate((prev: any) => {
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].options.splice(1, 1, {
          ...checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[1],
          checked: false,
        });
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].options.splice(0, 1, {
          ...checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[0],
          checked:
            !checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[0].checked,
        });

        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].questionScore = parseInt(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[0].value
        );
        // return { ...prev, ...checklistData };
        return checklistData;
      });
    } else if (e?.target?.name === "no") {
      const checklistData = JSON.parse(JSON.stringify(template));
      setTemplate((prev: any) => {
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].options.splice(0, 1, {
          ...checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[0],
          checked: false,
        });
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].options.splice(1, 1, {
          ...checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[1],
          checked:
            !checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[1].checked,
        });

        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].questionScore = parseInt(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[1].value
        );

        // return { ...prev, ...checklistData };
        return checklistData;
      });
    } else if (e?.target?.name === "text") {
      const checklistData = JSON.parse(JSON.stringify(template));
      setTemplate((prev: any) => {
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].value = e.target.value;
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].nc.comment = defaultValue ? e.target.value : "";
        return checklistData;
      });
    } else if (value === "buttonIndex" && e?.target?.name === undefined) {
      setTemplate((prev: any) => {
        return prev.map((item: any, tempIndex: number) => {
          if (tempIndex === indextemp) {
            return {
              ...item,
              sections: item.sections.map((section: any, secIndex: number) => {
                if (secIndex === sectionIndex) {
                  return {
                    ...section,
                    fieldset: section.fieldset.map(
                      (field: any, qIndex: number) => {
                        if (qIndex === questionIndex) {
                          return {
                            ...field,
                            buttonIndex: e,
                          };
                        }
                        return field;
                      }
                    ),
                  };
                }
                return section;
              }),
            };
          }
          return item;
        });
      });
    } else if (e?.target?.name === undefined && value) {
      const checklistData = JSON.parse(JSON.stringify(template));
      let numericTotalScore = 0;
      const name0 =
        checklistData[indextemp].sections[sectionIndex].fieldset[questionIndex]
          .score[0].name;
      if (name0 === "abs") {
        numericTotalScore = value;
      } else {
        const optionOne = evaluateScore(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].name,
          value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].score
        );
        const optionTwo = evaluateScore(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].name,
          value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].score
        );

        numericTotalScore = optionOne + optionTwo;
      }

      setTemplate((prev: any) => {
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].value = value;
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].questionScore = numericTotalScore;
        // return { ...prev, ...checklistData };
        return checklistData;
      });
    } else if (e?.target?.name === "numericText") {
      const checklistData = JSON.parse(JSON.stringify(template));
      let numericTotalScore = 0;
      const name0 =
        checklistData[indextemp].sections[sectionIndex].fieldset[questionIndex]
          .score[0].name;
      if (name0 === "abs") {
        const absMin =
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].value;
        const absMax =
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].value;
        if (e.target.value >= absMin && e.target.value <= absMax) {
          numericTotalScore = parseInt(e.target.value);
        } else {
          numericTotalScore = 0;
        }
      } else {
        const optionOne = evaluateScore(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].name,
          e.target.value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].score
        );
        const optionTwo = evaluateScore(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].name,
          e.target.value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].score
        );

        numericTotalScore = optionOne + optionTwo;
      }

      setTemplate((prev: any) => {
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].value = e.target.value as number;
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].questionScore = numericTotalScore;
        // return { ...prev, ...checklistData };
        return checklistData;
      });
    } else if (e?.target?.name === "comment") {
      // const checklistData = JSON.parse(JSON.stringify(template));
      // setTemplate((prev: any) => {
      //   checklistData[indextemp].sections[sectionIndex].fieldset[
      //     questionIndex
      //   ].value = e.target.value;
      //   checklistData[indextemp].sections[sectionIndex].fieldset[
      //     questionIndex
      //   ].nc.comment = defaultValue ? e.target.value : "";
      //   return checklistData;
      // });
      setTemplate((prev: any) => {
        return prev.map((item: any, tempIndex: number) => {
          if (tempIndex === indextemp) {
            return {
              ...item,
              sections: item.sections.map((section: any, secIndex: number) => {
                if (secIndex === sectionIndex) {
                  return {
                    ...section,
                    fieldset: section.fieldset.map(
                      (field: any, qIndex: number) => {
                        if (qIndex === questionIndex) {
                          return {
                            ...field,
                            comment: e.target.value,
                            nc: {
                              ...field.nc,
                              comment: defaultValue ? e.target.value : "",
                            },
                          };
                        }
                        return field;
                      }
                    ),
                  };
                }
                return section;
              }),
            };
          }
          return item;
        });
      });
    }
  };

  //?copyData.sections[index].fieldset[itemIndex].value
  const handleChangeNew = (
    event: any,
    value: any,
    itemIndex: any,
    index: any
  ) => {
    if (event === "mainComments") {
      setTemplate((prev: any) => {
        const copyData = JSON.parse(JSON.stringify(template));
        copyData.sections[index].fieldset[itemIndex].nc.mainComments = value;

        return { ...prev, ...copyData };
      });
      setShowModal(false);
    } else if (event.target.value === "zero") {
      setTemplate((prev: any) => {
        const copyData = JSON.parse(JSON.stringify(template));

        copyData.sections[index].fieldset[itemIndex].nc = {
          ...copyData.sections[index].fieldset[itemIndex].nc,
          type: "NC",
          clause: "",
          severity: "",
        };
        setIcon(false);
        setDisplayCard(true);
        return { ...prev, ...copyData };
      });
    } else if (event.target.value === "one") {
      setTemplate((prev: any) => {
        const copyData = JSON.parse(JSON.stringify(template));
        copyData.sections[index].fieldset[itemIndex].nc = {
          ...copyData.sections[index].fieldset[itemIndex].nc,
          type: "NC",
          clause: "",
          severity: "",
          // Comment:copyData.sections[index].fieldset[itemIndex].inputType==='text'?copyData.sections[index].fieldset[itemIndex].value:""
        };
        setIcon(false);
        setDisplayCard(true);
        return { ...prev, ...copyData };
      });
    } else if (event.target.value === "two") {
      setTemplate((prev: any) => {
        const copyData = JSON.parse(JSON.stringify(template));
        copyData.sections[index].fieldset[itemIndex].nc = {
          ...copyData.sections[index].fieldset[itemIndex].nc,
          type: "Observation",
          clause: "",
          severity: "",
        };
        setDisplayCard(true);
        setIcon(false);
        return { ...prev, ...copyData };
      });
    } else if (event.target.value === "three") {
      setTemplate((prev: any) => {
        const copyData = JSON.parse(JSON.stringify(template));
        copyData.sections[index].fieldset[itemIndex].nc = {
          ...copyData.sections[index].fieldset[itemIndex].nc,
          type: "",
          clause: "",
          severity: "",
        };
        setIcon(true);
        setDisplayCard(false);
        return { ...prev, ...copyData };
      });
    }

    setValue(event === "mainComments" ? "" : event.taget.value);

    setcurrentQuestionIndex(itemIndex);
    setcurrentSectionIndex(index);
  };

  /**
   * @method calculateTotalScore
   * @description Function to calculate total score
   * @returns nothing
   */
  // const calculateTotalScore = () => {
  //   let total = 0;
  //   template?.sections?.map((item: any) => {
  //     let sum = _.sumBy(item.fieldset, (obj: any) => {
  //       return obj.questionScore;
  //     });
  //     total = total + sum;
  //   });
  //   setTotalScore(total);
  // };

  const getAllSuggestions = async () => {
    const res = await axios.get(
      `api/audit-template/getAllAuditTemplatesByLocation/${formData?.location}`
    );
    setSuggestion(res.data);
  };

  useEffect(() => {
    getAllSuggestions();
    // fetchSuggestionsList();
    if (formData?.auditTemplate) {
      fetchAuditTemplateById(formData?.auditTemplate);
    }

    if (formData.selectedTemplates.length > 0) {
      getList(formData.selectedTemplates);
    }
    if (idParam.id) {
      setStepperError(false);
    }
  }, []);

  // useEffect(() => {
  //   validationCheck();
  // }, [template]);

  // useEffect(() => {
  //   setTemplate([
  //     {
  //       ...template,
  //       totalScore: totalScore,
  //     },
  //   ]);
  // }, [totalScore]);

  // useEffect(() => {
  //   calculateTotalScore();
  // }, [template]);

  /**
   * @method clearFile
   * @description Function to clear a file
   * @param sectionIndex {any}
   * @param questionIndex {any}
   * @returns nothing
   */
  const clearFile = (indextemp: any, sectionIndex: any, questionIndex: any) => {
    try {
      const copyData = JSON.parse(JSON.stringify(template));
      deleteAttachment({
        path: copyData[indextemp]?.sections[sectionIndex]?.fieldset[
          questionIndex
        ]?.image,
      })?.then((response: any) => {
        if (response?.data?.status === 200) {
          setTemplate((prev: any) => {
            copyData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].imageName = "";
            copyData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].image = "";
            return copyData;
          });
        }
      });
    } catch {
      message.error("error occured");
    }
  };

  /**
   * @method fetchAuditTemplateById
   * @description Function to fetch audit template by its id
   * @param id {string}
   * @returns nothing
   */
  const fetchAuditTemplateById = async (ids: string) => {
    let data: any;
    setIcon(false);
    // setTemplate([]);
    setDisplayCard(false);
    const url = formatDashboardQuery(
      `/api/audit-template/getmultipleTemplates`,
      { id: ids }
    );
    const response = await axios.get(url);

    const selectedChecklistIds = template?.map((item: any) => item.id);

    const finalTemplate = [];
    for (let value of response?.data) {
      if (selectedChecklistIds.includes(value.id)) {
        let pushData = template.filter((item: any) => item.id === value.id);
        pushData = pushData?.map((ele: any) => ({
          ...ele,
          sections: ele?.sections?.map((section: any) => ({
            ...section,
            fieldset: section?.fieldset?.map((item: any, index: number) => ({
              ...item,
              buttonIndex: 0,
            })),
          })),
        }));
        finalTemplate.push(...pushData);
      } else {
        value = Array?.isArray(value)
          ? value?.map((ele: any) => ({
              ...ele,
              sections: ele?.sections?.map((section: any) => ({
                ...section,
                fieldset: section?.fieldset?.map((item: any) => ({
                  ...item,
                  buttonIndex: 0,
                })),
              })),
            }))
          : value && typeof value === "object"
          ? {
              ...value,
              sections: value?.sections?.map((section: any) => ({
                ...section,
                fieldset: section?.fieldset?.map((item: any) => ({
                  ...item,
                  buttonIndex: 0,
                })),
              })),
            }
          : value;
        finalTemplate.push(value);
      }
    }
    setTemplate(finalTemplate);

    // getAuditCreationTemplateById(ids).then((response: any) => {
    //   // console.log("check in fetchAuditTemplateById", response?.data);

    //   setTemplate({ ...template, ...response?.data });
    // });
  };

  const data = (id: string) => {
    getAuditTemplate(id).then((res: any) => {
      setDefaultValue(res?.data?.status);
    });
  };
  /**
   * @method scrollToTop
   * @description Function for scrolling to top of the page
   * @returns nothing
   */
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /**
   * @method toggleVisible
   * @description Function to toggle the visibility of the scroll to top button
   * @returns nothing
   */
  const toggleVisible = () => {
    const scrolled = document?.documentElement?.scrollTop;
    if (scrolled > 300) {
      setVisible(true);
    } else if (scrolled <= 300) {
      setVisible(false);
    }
  };
  window.addEventListener("scroll", toggleVisible);

  const getList = (value: any) => {
    const ids = value.map((item: any) => item._id);
    fetchAuditTemplateById(ids);
    data(value._id);
  };

  const refForReportForm13 = useRef(null);
  const refForReportForm14 = useRef(null);
  const refForReportForm15 = useRef(null);
  const refForReportForm16 = useRef(null);
  const refForReportForm17 = useRef(null);
  const refForReportForm18 = useRef(null);
  const refForReportForm19 = useRef(null);
  const refForReportForm20 = useRef(null);

  const [openTourForReportFormCL1, setOpenTourForReportFormCL1] =
    useState<boolean>(false);

  const stepsForReportFormCL1: TourProps["steps"] = [
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm13.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm14.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm15.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm16.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm17.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm18.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm19.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm20.current,
    },
  ];

  const pdfReport = () => {
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
    const finalHtml = formData?.sections
      ?.map((checklist: any) => {
        // Skip duplicate checklists
        if (uniqueChecklists.has(checklist?.title)) {
          return "";
        }
        uniqueChecklists.add(checklist?.title);

        // Generate content for sections
        const sectionsContent = checklist?.sections
          .map((section: any) => {
            const fieldsetContent = section?.fieldset
              .map((field: any) =>
                fieldsetHtmlFormat
                  .replace("%QUESTION%", field?.title)
                  .replace(
                    "%ANSWER%",
                    field?.inputType === "checkbox"
                      ? field?.options
                          .filter((item: any) => item?.checked === true)
                          .map((item: any) => item.name)
                          .join(", ")
                      : field?.value
                  )
                  .replace("%SCORE%", field?.questionScore)
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
    if (!!finalHtml) {
      printJS({
        type: "raw-html",
        printable: finalHtml,
      });
    } else {
      enqueueSnackbar("None Of the CheckList selected", { variant: "error" });
    }
  };

  const items: any = formData?.selectedTemplates?.map(
    (item: any, index: any) => (
      <div
        key={index}
        style={{
          gap: "10px",
          padding: "3px",
          border: "1px solid grey",
          borderRadius: "3px",
          minWidth: "auto", // Ensure each item has enough width
          textAlign: "center",
          marginLeft: "4px",
          backgroundColor: selectedCheckList === item?._id ? "#6E7DAB" : "#fff",
          color: selectedCheckList === item?._id ? "#fff" : "#000",
        }}
        onClick={() => {
          setSelectedCheckList(item._id);
        }}
      >
        {item.title}
      </div>
    )
  );
  const deleteFilesNc = (
    indextemp: number,
    sectionIndex: number,
    questionIndex: number,
    fileUid: string
  ) => {
    setTemplate((prev: any) => {
      const checklistData = JSON.parse(JSON.stringify(prev)); // Deep copy of state

      // Navigate to the correct fieldset item
      const fieldsetItem =
        checklistData[indextemp].sections[sectionIndex].fieldset[questionIndex];

      if (fieldsetItem?.nc?.evidence?.[0]?.attachment) {
        // Filter out the attachment with the matching `uid`
        fieldsetItem.nc.evidence[0].attachment =
          fieldsetItem.nc.evidence[0].attachment.filter(
            (attachment: any) => attachment.uid !== fileUid
          );
      }

      return checklistData; // Return the updated state
    });
  };

  return (
    <>
      {/* <div
              // style={{ position: "fixed", top: "77px", right: "120px" }}
              style={{width:"97%",display:"flex",justifyContent:"end" }}
              >
                <MdTouchApp
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setOpenTourForReportFormCL1(true);
                  }}
                />
              </div> */}
      <div className={classes.root}>
        <div
          className={classes.checklistHeader}
          style={{
            padding: matches ? "clamp(1rem, 70px, 2rem)" : "20px",
            marginBottom: matches ? "16px" : "0px",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6}>
              <FormFieldController label="Use Checklist">
                <Box width="100%">
                  {/* <Autocomplete
                  // disabled={formData.auditTemplate ? false : disabled}
                  fullWidth
                  id="combo-box-demo"
                  options={suggestion}
                  size="small"
                  onChange={(e: any, value: any) => {
                    fetchAuditTemplateById(value._id);
                    data(value._id);
                  }}
                  getOptionLabel={(option: any) => option?.title}
                  renderInput={(params: any) => (
                    
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <MdSearch
                              style={{ fontSize: 18, paddingLeft: 5 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      placeholder="Search template"
                      variant="outlined"
                      size="small"
                    />
                  )}
                /> */}
                  <div ref={refForReportForm13}>
                    <Autocomplete
                      disabled={disabled}
                      fullWidth
                      id="combo-box-demo"
                      multiple={true}
                      value={formData.selectedTemplates}
                      options={suggestion}
                      size="small"
                      onChange={(e, value) => {
                        setFormData({
                          ...formData,
                          selectedTemplates: value,
                        });
                        getList(value);
                        // data(value._id);
                      }}
                      filterSelectedOptions
                      getOptionSelected={(option, value) => {
                        return option._id === value._id;
                      }}
                      getOptionLabel={(option) => {
                        return option?.title;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Checklist"
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                            classes: { disabled: classes.disabledInput },
                          }}
                          // style={{ color: "black" }}
                          // placeholder="options"
                        />
                      )}
                    />
                  </div>
                </Box>
                {matches ? (
                  <Tooltip title={"Checklist PDF Report"}>
                    <IconButton
                      onClick={pdfReport}
                      style={{ padding: "10px", color: "red" }}
                    >
                      <FaRegFilePdf width={20} height={20} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  ""
                )}
              </FormFieldController>
            </Grid>

            {/* <Grid item xs={12} sm={12} md={6} className={classes.headerInfo}>
            <div className={classes.questions}>
              <Typography variant="body2">
                Total number of questions : {template?.questionCount}
              </Typography>
            </div>
            <div className={classes.score}>
              <Typography variant="body2">
                Score {template?.totalScore ?? 0}
              </Typography>
            </div>
          </Grid> */}
          </Grid>
        </div>
        <div>
          {matches ? (
            ""
          ) : (
            <div
              className="custom-carousel"
              style={{
                position: "relative",
                // margin: matches ? "10px 50px" : "10px 10px",
                // display: "flex",
                // alignItems: "center",
              }}
            >
              <AliceCarousel
                mouseTracking
                items={items}
                responsive={responsive}
                controlsStrategy="alternate"
                autoPlay={false}
                infinite={false}
                disableButtonsControls={true} // Disable default buttons
                ref={carouselRef} // Reference to the carousel instance
                renderDotsItem={() => null} // Disable default dots
              />
              {formData?.selectedTemplates?.length > 0 ? (
                <>
                  <IconButton
                    style={{
                      position: "absolute",
                      top: "0px",
                      left: 0,
                      padding: "0px",
                      margin: "0px",
                      // transform: "translateY(-50%)",
                    }}
                    onClick={() => carouselRef.current.slidePrev()}
                  >
                    <MdChevronLeft />
                  </IconButton>
                  <IconButton
                    style={{
                      position: "absolute",
                      top: "0px",
                      right: 0,
                      padding: "0px",
                      margin: "0px",
                      // transform: "translateY(-50%)",
                    }}
                    onClick={() => carouselRef.current.slideNext()}
                  >
                    <MdChevronRight />
                  </IconButton>
                </>
              ) : (
                <></>
              )}
            </div>
          )}
        </div>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box
            display="flex"
            flexDirection="column"
            gridGap={10}
            width="100%"
            // maxWidth={900}
          >
            {/* {Object.keys(template).length === 1 ? ( */}
            {formData?.selectedTemplates <= 0 ? (
              <Typography
                variant="body2"
                align="center"
                style={{
                  color: "gray",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ height: 20 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Please select a template to display the checklist
              </Typography>
            ) : (
              template
                ?.filter(
                  (item: any) => matches || item?.id === selectedCheckList
                )
                ?.map((itemTemp: any, indextemp: any) => (
                  <Accordion
                    style={{
                      width: "100% !important",
                      backgroundColor: "#f8f9f9",
                    }}
                  >
                    <AccordionSummary expandIcon={<MdExpandMore />}>
                      {matches ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                          ref={refForReportForm14}
                        >
                          <div style={{ justifyContent: "flex-start" }}>
                            <Typography
                              style={{
                                fontWeight: 700,
                                fontSize: matches ? "16px" : "12px",
                              }}
                            >
                              {itemTemp.title}
                            </Typography>
                          </div>
                          <div
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <div
                              style={{
                                justifyContent: "flex-end",
                                paddingRight: "50px",
                              }}
                            >
                              <Typography
                                style={{
                                  fontWeight: 700,
                                  fontSize: matches ? "16px" : "12px",
                                  marginLeft: matches ? "0px" : "30px",
                                }}
                              >
                                Total number of questions{" "}
                                {itemTemp.questionCount}
                              </Typography>
                            </div>
                            <div
                              style={{ justifyContent: "flex-end" }}
                              onMouseEnter={() => {
                                setHoveredUserId(true);
                              }}
                              onMouseLeave={() => {
                                setHoveredUserId(false);
                              }}
                            >
                              <Typography
                                style={{
                                  fontWeight: 700,
                                  fontSize: matches ? "16px" : "12px",
                                }}
                              >
                                Score{" "}
                                {itemTemp.sections.reduce(
                                  (acc: any, section: { fieldset: any[] }) => {
                                    const sectionScore =
                                      section.fieldset.reduce(
                                        (
                                          sectionTotal: any,
                                          fieldset: { questionScore: any }
                                        ) => {
                                          return (
                                            sectionTotal +
                                            fieldset.questionScore
                                          );
                                        },
                                        0
                                      );
                                    return acc + sectionScore;
                                  },
                                  0
                                )}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            // display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                          ref={refForReportForm14}
                        >
                          {/* <div style={{ justifyContent: "flex-start" }}>
                            <Typography
                              style={{
                                fontWeight: 700,
                                fontSize: matches ? "16px" : "12px",
                              }}
                            >
                              {itemTemp.title}
                            </Typography>
                          </div> */}
                          <div className={classes.divContainer}>
                            {/* Left Section - Total Questions */}
                            <Box className={classes.textBox}>
                              <Typography className={classes.boldText}>
                                Total number of<br></br> questions
                              </Typography>
                              <Typography className={classes.numberText}>
                                {itemTemp.questionCount}
                              </Typography>
                            </Box>

                            {/* Right Section - Score */}
                            <Box className={classes.textBox}>
                              <Typography className={classes.boldText}>
                                Score
                              </Typography>
                              <Box
                                className={classes.scoreCircle}
                                onMouseEnter={() => {
                                  setHoveredUserId(true);
                                }}
                                onMouseLeave={() => {
                                  setHoveredUserId(false);
                                }}
                              >
                                <Typography className={classes.scoreText}>
                                  {" "}
                                  {itemTemp.sections.reduce(
                                    (
                                      acc: any,
                                      section: { fieldset: any[] }
                                    ) => {
                                      const sectionScore =
                                        section.fieldset.reduce(
                                          (
                                            sectionTotal: any,
                                            fieldset: { questionScore: any }
                                          ) => {
                                            return (
                                              sectionTotal +
                                              fieldset.questionScore
                                            );
                                          },
                                          0
                                        );
                                      return acc + sectionScore;
                                    },
                                    0
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          </div>
                        </div>
                      )}
                    </AccordionSummary>
                    <div
                      style={{
                        display: matches ? "flex" : "black",
                        flexDirection: matches ? "row" : "column",
                      }}
                    >
                      <div style={{ flex: matches ? 7 : 0 }}>
                        <AccordionDetails
                          style={{
                            width: "90% !important",
                          }}
                          className={matches ? "" : classes.mobileScreen}
                        >
                          {/* ===============================
                         When we make changes in the checklist mapping below, we need to update the code accordingly;
                         otherwise, they won't be visible. Mobile responsiveness is now set correctly
                         ================================ */}

                          {matches ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "90%",
                              }}
                            >
                              {itemTemp?.sections?.map(
                                (item: any, index: number) => (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      width: "90%",
                                    }}
                                  >
                                    <div className={classes.sectionHeader}>
                                      <Typography className={classes.text}>
                                        {index + 1}.
                                      </Typography>

                                      <Typography className={classes.text}>
                                        <strong>{item?.title}</strong>
                                      </Typography>
                                    </div>

                                    {item?.fieldset?.map(
                                      (item: any, itemIndex: number) => (
                                        <>
                                          <div>
                                            <div
                                              className={
                                                classes.questionContainer
                                              }
                                              ref={refForReportForm15}
                                            >
                                              <div
                                                className={
                                                  classes.questionHeader
                                                }
                                              >
                                                <Typography
                                                  className={classes.text}
                                                >
                                                  {index + 1}.{itemIndex + 1}
                                                </Typography>
                                                <Typography
                                                  className={classes.text}
                                                >
                                                  {item?.title}
                                                </Typography>
                                                <Tooltip
                                                  title={item?.hint}
                                                  enterTouchDelay={0}
                                                >
                                                  <img
                                                    src={InfoIcon}
                                                    alt="info"
                                                  />
                                                </Tooltip>
                                                {template[itemTemp]?.sections[
                                                  index
                                                ]?.fieldset[itemIndex].nc
                                                  .type === "NC" ? (
                                                  <span
                                                    className={classes.ncTag}
                                                  >
                                                    NC
                                                  </span>
                                                ) : template[itemTemp]
                                                    ?.sections[index]?.fieldset[
                                                    itemIndex
                                                  ].nc.type ===
                                                  "Observation" ? (
                                                  <span
                                                    className={classes.obsTag}
                                                  >
                                                    Obs
                                                  </span>
                                                ) : template[itemTemp]
                                                    ?.sections[index]?.fieldset[
                                                    itemIndex
                                                  ].nc.type === "OFI" ? (
                                                  <span
                                                    className={classes.ofiTag}
                                                  >
                                                    OFI
                                                  </span>
                                                ) : (
                                                  ``
                                                )}
                                              </div>
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent: "flex-start",
                                                }}
                                              >
                                                {defaultValue ? (
                                                  <Grid container>
                                                    <Grid
                                                      item
                                                      sm={8}
                                                      md={2}
                                                      className={
                                                        classes.formTextPadding
                                                      }
                                                    >
                                                      <strong>
                                                        Ranked Response
                                                      </strong>
                                                    </Grid>
                                                    <FormControl>
                                                      <Select
                                                        style={{
                                                          padding: "3px",
                                                        }}
                                                        type="any"
                                                        labelId="demo-simple-select-label"
                                                        id="demo-simple-select"
                                                        value={value}
                                                        name="checkOne"
                                                        label="Ranked Response"
                                                        onChange={(e) => {
                                                          return handleChangeNew(
                                                            e,
                                                            value,
                                                            itemIndex,
                                                            index
                                                          );
                                                        }}
                                                      >
                                                        <MenuItem value="zero">
                                                          0
                                                        </MenuItem>
                                                        <MenuItem value="one">
                                                          1
                                                        </MenuItem>
                                                        <MenuItem value="two">
                                                          2
                                                        </MenuItem>
                                                        <MenuItem value="three">
                                                          3
                                                        </MenuItem>
                                                      </Select>
                                                    </FormControl>
                                                  </Grid>
                                                ) : (
                                                  ""
                                                )}
                                              </div>
                                              <div>
                                                <Modal
                                                  open={showModal}
                                                  aria-labelledby="simple-modal-title"
                                                  aria-describedby="simple-modal-description"
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <Box
                                                    maxWidth="500vw"
                                                    mx="auto"
                                                    my={4}
                                                    p={3}
                                                    style={{
                                                      backgroundColor:
                                                        "#ffffff",
                                                    }}
                                                  >
                                                    <div>
                                                      <Typography variant="h6">
                                                        Add Comments
                                                      </Typography>
                                                      <Divider />

                                                      <form>
                                                        <Grid
                                                          container
                                                          style={{
                                                            paddingTop: "30px",
                                                          }}
                                                        >
                                                          <Grid
                                                            item
                                                            sm={12}
                                                            md={12}
                                                          >
                                                            <Grid
                                                              item
                                                              sm={2}
                                                              md={2}
                                                              className={
                                                                classes.formTextPadding
                                                              }
                                                            >
                                                              <strong>
                                                                Comments*
                                                              </strong>
                                                            </Grid>
                                                            <Grid
                                                              item
                                                              sm={12}
                                                              md={8}
                                                              className={
                                                                classes.formBox
                                                              }
                                                            >
                                                              <TextField
                                                                fullWidth
                                                                variant="outlined"
                                                                label="Comments"
                                                                value={
                                                                  template[
                                                                    itemTemp
                                                                  ]?.sections[
                                                                    sectionsIndex
                                                                  ]?.fieldset[
                                                                    questionsIndex
                                                                  ]?.nc
                                                                    ?.mainComments ||
                                                                  comments
                                                                }
                                                                multiline
                                                                rows={4}
                                                                onChange={(
                                                                  e
                                                                ) => {
                                                                  // console.log("value of comments",e.target.value)
                                                                  // template?.sections[sectionsIndex]?.fieldset[questionsIndex]?.nc?.mainComments||comments
                                                                  SetComments(
                                                                    e.target
                                                                      .value
                                                                  );
                                                                }}
                                                                name="mainComments"
                                                                // Add value and onChange handlers here
                                                              />
                                                            </Grid>
                                                          </Grid>
                                                        </Grid>

                                                        <Box
                                                          width="100%"
                                                          display="flex"
                                                          justifyContent="center"
                                                          pt={2}
                                                        >
                                                          <Button
                                                            className={
                                                              classes.buttonColor
                                                            }
                                                            variant="outlined"
                                                            onClick={() => {
                                                              setShowModal(
                                                                false
                                                              );
                                                            }}
                                                          >
                                                            Cancel
                                                          </Button>

                                                          <Button
                                                            variant="contained"
                                                            color="primary"
                                                            value="mainComments"
                                                            onClick={(e) => {
                                                              return handleChangeNew(
                                                                "mainComments",
                                                                comments,
                                                                itemIndex,
                                                                index
                                                              );
                                                              // Handle submit logic here
                                                            }}
                                                          >
                                                            Submit
                                                          </Button>
                                                        </Box>
                                                      </form>
                                                    </div>
                                                  </Box>
                                                </Modal>
                                              </div>

                                              {/* <MdChat
                              onClick={() => {
                                setsectionIndex(item);
                                setQuestionIndex(itemIndex);
                                setShowModal(!showModal);
                                // setsectionIndex(item)
                                // setQuestionIndex(itemIndex)
                              }}
                            /> */}

                                              <Grid container spacing={3}>
                                                <Grid
                                                  item
                                                  xs={12}
                                                  sm={12}
                                                  md={8}
                                                >
                                                  <ComponentGenerator
                                                    // disabled={formData.auditTemplate ? false : disabled}
                                                    disabled={disabled}
                                                    type={item.inputType}
                                                    handler={(
                                                      e: any,
                                                      value: any
                                                    ) =>
                                                      handleChange(
                                                        e,
                                                        value,
                                                        indextemp,
                                                        index,
                                                        itemIndex
                                                      )
                                                    }
                                                    inputHandlerType={
                                                      item.inputType ===
                                                        "numeric" && item.slider
                                                        ? InputHandlerType.SLIDER
                                                        : InputHandlerType.TEXT
                                                    }
                                                    numericData={
                                                      item.inputType ===
                                                        "numeric" && item.slider
                                                        ? item.score
                                                        : ""
                                                    }
                                                    radioData={
                                                      item.inputType ===
                                                        "radio" ||
                                                      item.inputType ===
                                                        "checkbox"
                                                        ? item.options
                                                        : ""
                                                    }
                                                    textValue={item.value}
                                                    min={
                                                      item.inputType ===
                                                        "numeric" &&
                                                      item.score[0].name ===
                                                        "abs"
                                                        ? item.score[0].value
                                                        : 0
                                                    }
                                                    max={
                                                      item.inputType ===
                                                        "numeric" &&
                                                      item.score[1].name ===
                                                        "abs"
                                                        ? item.score[1].value
                                                        : 10
                                                    }
                                                  />
                                                </Grid>

                                                <Grid item xs={6} sm={6} md={4}>
                                                  <div
                                                    className={
                                                      classes.attachBtnContainer
                                                    }
                                                  >
                                                    {/* <label htmlFor="contained-button-file"> */}
                                                    <Button
                                                      variant="contained"
                                                      component="label"
                                                      disabled={
                                                        !item.allowImageUpload
                                                      }
                                                      className={
                                                        classes.attachButton
                                                      }
                                                      size="large"
                                                      startIcon={
                                                        <img
                                                          src={AttachIcon}
                                                          alt=""
                                                        />
                                                      }
                                                      disableElevation
                                                    >
                                                      <input
                                                        accept="image/*"
                                                        // id="contained-button-file"
                                                        onChange={(e: any) => {
                                                          handleImageUpload(
                                                            e,
                                                            indextemp,
                                                            index,
                                                            itemIndex
                                                          );
                                                          e.target.value = "";
                                                        }}
                                                        multiple
                                                        type="file"
                                                        disabled={
                                                          !item.allowImageUpload
                                                        }
                                                        hidden
                                                      />
                                                      Attach
                                                    </Button>

                                                    {item.imageName && (
                                                      <Box
                                                        display="flex"
                                                        alignItems="center"
                                                      >
                                                        <Tooltip
                                                          title={item.imageName}
                                                          arrow
                                                        >
                                                          <Typography
                                                            variant="body2"
                                                            className={
                                                              classes.fileName
                                                            }
                                                            onClick={() =>
                                                              handleLinkClick(
                                                                item
                                                              )
                                                            }
                                                          >
                                                            {item.imageName}
                                                          </Typography>
                                                        </Tooltip>
                                                        <IconButton
                                                          disabled={
                                                            formData.auditTemplate
                                                              ? false
                                                              : disabled
                                                          }
                                                          onClick={() =>
                                                            clearFile(
                                                              indextemp,
                                                              index,
                                                              itemIndex
                                                            )
                                                          }
                                                          className={
                                                            classes.clearBtn
                                                          }
                                                        >
                                                          <MdClear />
                                                        </IconButton>
                                                      </Box>
                                                    )}
                                                  </div>
                                                </Grid>

                                                <Grid
                                                  item
                                                  xs={6}
                                                  className={
                                                    classes.addBtnMobileContainer
                                                  }
                                                >
                                                  <IconButton
                                                    disabled={
                                                      formData.auditTemplate
                                                        ? false
                                                        : disabled
                                                    }
                                                    className={
                                                      classes.attachButton
                                                    }
                                                    onClick={() => {
                                                      if (
                                                        displayCard &&
                                                        currentQuestionIndex ===
                                                          itemIndex &&
                                                        currentSectionIndex ===
                                                          index &&
                                                        currentCheckListId ===
                                                          itemTemp.id
                                                      ) {
                                                        setDisplayCard(false);
                                                      } else {
                                                        setDisplayCard(true);
                                                        setcurrentQuestionIndex(
                                                          itemIndex
                                                        );
                                                        setcurrentSectionIndex(
                                                          index
                                                        );
                                                        setcurrentCheckListId(
                                                          itemTemp.id
                                                        );
                                                      }
                                                    }}
                                                  >
                                                    <div>
                                                      {displayCard &&
                                                      currentQuestionIndex ===
                                                        itemIndex &&
                                                      currentSectionIndex ===
                                                        index &&
                                                      currentCheckListId ===
                                                        itemTemp.id ? (
                                                        <MdRemove />
                                                      ) : (
                                                        <MdAdd />
                                                      )}
                                                    </div>
                                                  </IconButton>
                                                </Grid>
                                              </Grid>

                                              <IconButton
                                                ref={refForReportForm16}
                                                disabled={
                                                  formData.auditTemplate
                                                    ? false
                                                    : disabled
                                                }
                                                className={
                                                  classes.attachButtonRight
                                                }
                                                onClick={() => {
                                                  if (
                                                    displayCard &&
                                                    currentQuestionIndex ===
                                                      itemIndex &&
                                                    currentSectionIndex ===
                                                      index &&
                                                    currentCheckListId ===
                                                      itemTemp.id
                                                  ) {
                                                    setDisplayCard(false);
                                                  } else {
                                                    setDisplayCard(true);
                                                    setcurrentQuestionIndex(
                                                      itemIndex
                                                    );
                                                    setcurrentSectionIndex(
                                                      index
                                                    );
                                                    setcurrentCheckListId(
                                                      itemTemp.id
                                                    );
                                                  }
                                                }}
                                              >
                                                {displayCard &&
                                                currentQuestionIndex ===
                                                  itemIndex &&
                                                currentSectionIndex === index &&
                                                currentCheckListId ===
                                                  itemTemp.id ? (
                                                  <MdRemove />
                                                ) : (
                                                  <MdAdd />
                                                )}
                                              </IconButton>
                                            </div>

                                            {displayCard &&
                                              currentQuestionIndex ===
                                                itemIndex &&
                                              currentSectionIndex === index &&
                                              currentCheckListId ===
                                                itemTemp.id && (
                                                <NcCard
                                                  key={index}
                                                  sectionIndex={index}
                                                  impactType={impactType}
                                                  questionIndex={itemIndex}
                                                  status={defaultValue}
                                                  checkListIndex={indextemp}
                                                  auditTypeId={
                                                    formData.auditType
                                                  }
                                                  closeCard={() =>
                                                    setDisplayCard(false)
                                                  }
                                                  refForReportForm17={
                                                    refForReportForm17
                                                  }
                                                  refForReportForm18={
                                                    refForReportForm18
                                                  }
                                                  refForReportForm19={
                                                    refForReportForm19
                                                  }
                                                  refForReportForm20={
                                                    refForReportForm20
                                                  }
                                                />
                                              )}
                                          </div>
                                        </>
                                      )
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  // alignItems: "center",
                                  justifyContent: "center",
                                  width: "100%",
                                  gap: "4px",
                                }}
                              >
                                {itemTemp?.sections?.map(
                                  (item: any, index: number) => (
                                    <Accordion
                                      style={{
                                        width: "100% !important",
                                      }}
                                    >
                                      <AccordionSummary
                                        expandIcon={<MdExpandMore />}
                                        style={{
                                          borderBottom: "1px dashed grey",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            gap: "2px",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Typography className={classes.text}>
                                            {index + 1}.
                                          </Typography>
                                          <Typography className={classes.text}>
                                            <strong>{item?.title}</strong>
                                          </Typography>
                                        </div>
                                      </AccordionSummary>
                                      <AccordionDetails
                                        style={{
                                          width: "100% !important",
                                          padding: matches
                                            ? "8px 8px 8px"
                                            : "8px 8px 8px !important",
                                        }}
                                        className={classes.mobileScreen}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            width: "100%",
                                            gap: "10px",
                                          }}
                                        >
                                          {item?.fieldset?.map(
                                            (item: any, itemIndex: number) => (
                                              <div
                                                style={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  gap: "10px",
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    border: "1px solid grey",
                                                    padding: "3px",
                                                    borderRadius: "3px",
                                                  }}
                                                >
                                                  <Row
                                                    style={{
                                                      display: "flex",
                                                      justifyContent:
                                                        "space-between",
                                                      padding: "3px",
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        display: "flex",
                                                        gap: "3px",
                                                        width: "93%",
                                                      }}
                                                    >
                                                      <span>
                                                        {index + 1}.
                                                        {itemIndex + 1}
                                                      </span>
                                                      {item?.title}
                                                    </div>
                                                    <div
                                                      style={{
                                                        // width: "5px",
                                                        paddingTop: "4px",
                                                        width: "07%",
                                                      }}
                                                    >
                                                      <Tooltip
                                                        title={item?.hint}
                                                        enterTouchDelay={0}
                                                      >
                                                        <img
                                                          src={InfoIcon}
                                                          alt="info"
                                                          style={{
                                                            width: "16px",
                                                            height: "16px",
                                                          }}
                                                        />
                                                      </Tooltip>
                                                      {template[itemTemp]
                                                        ?.sections[index]
                                                        ?.fieldset[itemIndex].nc
                                                        .type === "NC" ? (
                                                        <span
                                                          className={
                                                            classes.ncTag
                                                          }
                                                        >
                                                          NC
                                                        </span>
                                                      ) : template[itemTemp]
                                                          ?.sections[index]
                                                          ?.fieldset[itemIndex]
                                                          .nc.type ===
                                                        "Observation" ? (
                                                        <span
                                                          className={
                                                            classes.obsTag
                                                          }
                                                        >
                                                          Obs
                                                        </span>
                                                      ) : template[itemTemp]
                                                          ?.sections[index]
                                                          ?.fieldset[itemIndex]
                                                          .nc.type === "OFI" ? (
                                                        <span
                                                          className={
                                                            classes.ofiTag
                                                          }
                                                        >
                                                          OFI
                                                        </span>
                                                      ) : (
                                                        ``
                                                      )}
                                                    </div>
                                                  </Row>
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      backgroundColor:
                                                        "#effefd",
                                                      borderRadius: "3px",
                                                      alignItems: "center",
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        width: "30%",
                                                        backgroundColor:
                                                          item?.buttonIndex ===
                                                          0
                                                            ? "rgb(53, 118, 186)"
                                                            : "",
                                                        color:
                                                          item?.buttonIndex ===
                                                          0
                                                            ? "#fff"
                                                            : "black",
                                                        padding: "5px",
                                                        fontSize: "12px",
                                                      }}
                                                      onClick={() => {
                                                        setAlignValue(
                                                          "Checklist"
                                                        );
                                                        setAlignId(itemIndex);
                                                        setAlignButtonIndex(0);
                                                        handleChange(
                                                          0,
                                                          "buttonIndex",
                                                          indextemp,
                                                          index,
                                                          itemIndex
                                                        );
                                                      }}
                                                    >
                                                      Checklist
                                                    </div>
                                                    <div
                                                      style={{
                                                        width: "30%",
                                                        textAlign: "center",
                                                        backgroundColor:
                                                          item?.buttonIndex ===
                                                          1
                                                            ? "rgb(53, 118, 186)"
                                                            : "",
                                                        color:
                                                          item?.buttonIndex ===
                                                          1
                                                            ? "#fff"
                                                            : "black",
                                                        padding: "5px",
                                                        fontSize: "12px",
                                                      }}
                                                      onClick={() => {
                                                        setAlignValue("Issues");
                                                        setAlignId(itemIndex);
                                                        setAlignButtonIndex(1);
                                                        handleChange(
                                                          1,
                                                          "buttonIndex",
                                                          indextemp,
                                                          index,
                                                          itemIndex
                                                        );
                                                      }}
                                                    >
                                                      Issues
                                                    </div>
                                                    <div
                                                      style={{
                                                        width: "40%",
                                                        backgroundColor:
                                                          item?.buttonIndex ===
                                                          2
                                                            ? "rgb(53, 118, 186)"
                                                            : "",
                                                        color:
                                                          item?.buttonIndex ===
                                                          2
                                                            ? "#fff"
                                                            : "black",
                                                        padding: "5px",
                                                        fontSize: "12px",
                                                      }}
                                                      onClick={() => {
                                                        setAlignValue(
                                                          "Attachments"
                                                        );
                                                        setAlignId(itemIndex);
                                                        setAlignButtonIndex(1);
                                                        handleChange(
                                                          2,
                                                          "buttonIndex",
                                                          indextemp,
                                                          index,
                                                          itemIndex
                                                        );
                                                      }}
                                                    >
                                                      Attachments
                                                    </div>
                                                  </div>
                                                  {alignValue ===
                                                    "Checklist" && (
                                                    <div>
                                                      <div
                                                        style={{
                                                          padding: "5px",
                                                        }}
                                                      >
                                                        {" "}
                                                        <div>
                                                          <ComponentGenerator
                                                            // disabled={formData.auditTemplate ? false : disabled}
                                                            disabled={disabled}
                                                            type={
                                                              item.inputType
                                                            }
                                                            handler={(
                                                              e: any,
                                                              value: any
                                                            ) =>
                                                              handleChange(
                                                                e,
                                                                value,
                                                                indextemp,
                                                                index,
                                                                itemIndex
                                                              )
                                                            }
                                                            inputHandlerType={
                                                              item.inputType ===
                                                                "numeric" &&
                                                              item.slider
                                                                ? InputHandlerType.SLIDER
                                                                : InputHandlerType.TEXT
                                                            }
                                                            numericData={
                                                              item.inputType ===
                                                                "numeric" &&
                                                              item.slider
                                                                ? item.score
                                                                : ""
                                                            }
                                                            radioData={
                                                              item.inputType ===
                                                                "radio" ||
                                                              item.inputType ===
                                                                "checkbox"
                                                                ? item.options
                                                                : ""
                                                            }
                                                            textValue={
                                                              item.value
                                                            }
                                                            min={
                                                              item.inputType ===
                                                                "numeric" &&
                                                              item.score[0]
                                                                .name === "abs"
                                                                ? item.score[0]
                                                                    .value
                                                                : 0
                                                            }
                                                            max={
                                                              item.inputType ===
                                                                "numeric" &&
                                                              item.score[1]
                                                                .name === "abs"
                                                                ? item.score[1]
                                                                    .value
                                                                : 10
                                                            }
                                                          />
                                                        </div>
                                                      </div>
                                                      {/* <AntModal
                                                        title={"Add Comments"}
                                                        open={commentStatus}
                                                        onCancel={() => {
                                                          setCommentStatus(
                                                            false
                                                          );
                                                        }}
                                                        closeIcon={
                                                          <MdClose
                                                            style={{
                                                              color: "#fff",
                                                              backgroundColor:
                                                                "#0E497A",
                                                              borderRadius:
                                                                "3px",
                                                            }}
                                                          />
                                                        }
                                                        footer={false}
                                                        mask={false}
                                                        // style={{ top: "50%", left: 80, margin: 0 }}
                                                        width="832px"
                                                      >
                                                        <div>
                                                          <Input
                                                            placeholder="Enter Comment"
                                                            name="comment"
                                                            value={msgValue || item?.comment}
                                                            onChange={(e) => {
                                                              handleChange(
                                                                e,
                                                                "comment",
                                                                indexNumbers?.indexTemp,
                                                                indexNumbers?.index,
                                                                indexNumbers?.indexItem
                                                              );
                                                            }}
                                                          />
                                                        </div>
                                                      </AntModal> */}
                                                    </div>
                                                  )}

                                                  <div
                                                    style={
                                                      {
                                                        // paddingTop: "10px",
                                                      }
                                                    }
                                                  >
                                                    {alignValue ===
                                                      "Issues" && (
                                                      <div
                                                        style={{
                                                          paddingTop: "10px",
                                                          // display:"grid",
                                                          // justifyContent:"center"
                                                        }}
                                                      >
                                                        <div
                                                          style={{
                                                            display: "flex",
                                                            gap: "3px",
                                                            flexDirection:
                                                              "row",
                                                            justifyContent:
                                                              "center",
                                                          }}
                                                        >
                                                          <Button
                                                            variant="contained"
                                                            disabled={
                                                              formData.auditTemplate
                                                                ? false
                                                                : disabled
                                                            }
                                                            onClick={() => {
                                                              if (
                                                                displayCard &&
                                                                currentQuestionIndex ===
                                                                  itemIndex &&
                                                                currentSectionIndex ===
                                                                  index &&
                                                                currentCheckListId ===
                                                                  itemTemp.id
                                                              ) {
                                                                setDisplayCard(
                                                                  false
                                                                );
                                                              } else {
                                                                setDisplayCard(
                                                                  true
                                                                );
                                                                setcurrentQuestionIndex(
                                                                  itemIndex
                                                                );
                                                                setcurrentSectionIndex(
                                                                  index
                                                                );
                                                                setcurrentCheckListId(
                                                                  itemTemp.id
                                                                );
                                                              }
                                                            }}
                                                            className={
                                                              classes.uploadButton
                                                            }
                                                            startIcon={
                                                              displayCard &&
                                                              currentQuestionIndex ===
                                                                itemIndex &&
                                                              currentSectionIndex ===
                                                                index &&
                                                              currentCheckListId ===
                                                                itemTemp.id ? (
                                                                <FaMinus
                                                                  style={{
                                                                    fontSize:
                                                                      "18px",
                                                                  }}
                                                                />
                                                              ) : (
                                                                <FaPlus
                                                                  size={20}
                                                                />
                                                              )
                                                            }
                                                          >
                                                            Add Non-Conformance
                                                          </Button>
                                                        </div>
                                                        {displayCard &&
                                                          currentQuestionIndex ===
                                                            itemIndex &&
                                                          currentSectionIndex ===
                                                            index &&
                                                          currentCheckListId ===
                                                            itemTemp.id && (
                                                            <NcCard
                                                              key={index}
                                                              sectionIndex={
                                                                index
                                                              }
                                                              questionIndex={
                                                                itemIndex
                                                              }
                                                              impactType={
                                                                impactType
                                                              }
                                                              status={
                                                                defaultValue
                                                              }
                                                              checkListIndex={
                                                                indextemp
                                                              }
                                                              auditTypeId={
                                                                formData.auditType
                                                              }
                                                              closeCard={() =>
                                                                setDisplayCard(
                                                                  false
                                                                )
                                                              }
                                                              refForReportForm17={
                                                                refForReportForm17
                                                              }
                                                              refForReportForm18={
                                                                refForReportForm18
                                                              }
                                                              refForReportForm19={
                                                                refForReportForm19
                                                              }
                                                              refForReportForm20={
                                                                refForReportForm20
                                                              }
                                                            />
                                                          )}
                                                        <div
                                                          style={{
                                                            paddingTop: "10px",
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              padding: "10px",
                                                              border:
                                                                "1px solid grey",
                                                            }}
                                                          >
                                                            <div
                                                              style={{
                                                                display: "flex",
                                                                justifyContent:
                                                                  "space-between",
                                                                alignItems:
                                                                  "center",
                                                              }}
                                                            >
                                                              <strong>
                                                                {
                                                                  item?.nc
                                                                    ?.statusComments
                                                                }
                                                              </strong>
                                                              <div>
                                                                {item?.nc
                                                                  ?.highPriority && (
                                                                  <div
                                                                    style={{
                                                                      padding:
                                                                        "3px",
                                                                      // width:
                                                                      //   "50px",
                                                                      borderRadius:
                                                                        "30px",
                                                                      backgroundColor:
                                                                        "red",
                                                                      color:
                                                                        "#fff ",
                                                                      fontSize:
                                                                        "11px",
                                                                    }}
                                                                  >
                                                                    High
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </div>
                                                            <div>
                                                              <span>
                                                                {item?.nc?.type}
                                                              </span>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div>
                                                    {alignValue ===
                                                      "Attachments" && (
                                                      <div
                                                        style={{
                                                          paddingTop: "10px",
                                                        }}
                                                      >
                                                        <div
                                                          style={{
                                                            display: "flex",
                                                            gap: "3px",
                                                            flexDirection:
                                                              "row",
                                                            justifyContent:
                                                              "center",
                                                          }}
                                                        >
                                                          <Button
                                                            component="span"
                                                            variant="contained"
                                                            disabled={
                                                              formData.auditTemplate
                                                                ? false
                                                                : disabled
                                                            }
                                                            className={
                                                              classes.uploadButton
                                                            }
                                                            onClick={() => {
                                                              openModal();
                                                              setIndexNumbers({
                                                                indexTemp:
                                                                  indextemp,
                                                                index: index,
                                                                indexItem:
                                                                  itemIndex,
                                                              });
                                                            }}
                                                            startIcon={
                                                              <MdCloudUpload />
                                                            }
                                                          >
                                                            Upload File
                                                          </Button>

                                                          <AntModal
                                                            title={false}
                                                            open={isModalOpen}
                                                            closable={false}
                                                            footer={[
                                                              <div
                                                                style={{
                                                                  display:
                                                                    "flex",
                                                                  justifyContent:
                                                                    "space-around",
                                                                }}
                                                              >
                                                                <Button
                                                                  key="cancel"
                                                                  onClick={
                                                                    closeModal
                                                                  }
                                                                >
                                                                  Cancel
                                                                </Button>
                                                                ,
                                                                <Button
                                                                  key="flip"
                                                                  onClick={
                                                                    toggleCamera
                                                                  }
                                                                  startIcon={
                                                                    <MdFlipCameraAndroid />
                                                                  }
                                                                />
                                                                ,
                                                                <Button
                                                                  variant="contained"
                                                                  component="label"
                                                                  // disabled={
                                                                  //   !item.allowImageUpload
                                                                  // }
                                                                  // className={
                                                                  //   classes.attachButton
                                                                  // }
                                                                  // size="large"
                                                                  startIcon={
                                                                    <MdPhotoLibrary
                                                                      style={{
                                                                        color:
                                                                          "red",
                                                                      }}
                                                                    />
                                                                  }
                                                                  disableElevation
                                                                >
                                                                  <input
                                                                    accept="image/*"
                                                                    id="contained-button-file"
                                                                    onChange={(
                                                                      e: any
                                                                    ) => {
                                                                      handleImageUpload(
                                                                        e,
                                                                        indexNumbers?.indexTemp,
                                                                        indexNumbers?.index,
                                                                        indexNumbers?.indexItem
                                                                      );
                                                                      e.target.value =
                                                                        "";
                                                                    }}
                                                                    multiple
                                                                    type="file"
                                                                    hidden
                                                                  />
                                                                </Button>
                                                                ,
                                                                <Button
                                                                  key="capture"
                                                                  onClick={
                                                                    capture
                                                                  }
                                                                  disabled={
                                                                    !isWebcamReady
                                                                  }
                                                                >
                                                                  {isWebcamReady
                                                                    ? "Capture"
                                                                    : "Loading..."}
                                                                </Button>
                                                                ,
                                                              </div>,
                                                            ]}
                                                            width="100%"
                                                            style={{
                                                              height: "100%",
                                                            }}
                                                            centered
                                                          >
                                                            <Webcam
                                                              ref={webcamRef}
                                                              audio={false}
                                                              screenshotFormat="image/jpeg"
                                                              videoConstraints={{
                                                                facingMode:
                                                                  facingMode,
                                                              }}
                                                              style={{
                                                                width: "300px",
                                                                height: "500px",
                                                                maxWidth:
                                                                  "100%",
                                                                objectFit:
                                                                  "cover",
                                                                border:
                                                                  "2px solid #6E7DAB",
                                                                background:
                                                                  "black",
                                                              }}
                                                              playsInline
                                                            />
                                                          </AntModal>

                                                          {item.imageName && (
                                                            <Box
                                                              display="flex"
                                                              alignItems="center"
                                                            >
                                                              <Tooltip
                                                                title={
                                                                  item.imageName
                                                                }
                                                                arrow
                                                              >
                                                                <Typography
                                                                  variant="body2"
                                                                  className={
                                                                    classes.fileName
                                                                  }
                                                                  onClick={() =>
                                                                    handleLinkClick(
                                                                      item
                                                                    )
                                                                  }
                                                                >
                                                                  {
                                                                    item.imageName
                                                                  }
                                                                </Typography>
                                                              </Tooltip>
                                                              <IconButton
                                                                disabled={
                                                                  formData.auditTemplate
                                                                    ? false
                                                                    : disabled
                                                                }
                                                                onClick={() =>
                                                                  clearFile(
                                                                    indextemp,
                                                                    index,
                                                                    itemIndex
                                                                  )
                                                                }
                                                                className={
                                                                  classes.clearBtn
                                                                }
                                                              >
                                                                <MdClear />
                                                              </IconButton>
                                                            </Box>
                                                          )}
                                                        </div>
                                                        <List
                                                          className={
                                                            classes.fileList
                                                          }
                                                        >
                                                          {item?.nc?.evidence?.[0]?.attachment.map(
                                                            (
                                                              file: any,
                                                              index: any
                                                            ) => (
                                                              <ListItem
                                                                key={index}
                                                                className={
                                                                  classes.fileItem
                                                                }
                                                              >
                                                                <div
                                                                  className={
                                                                    classes.fileInfo
                                                                  }
                                                                >
                                                                  <ListItemAvatar>
                                                                    <Avatar
                                                                      className={
                                                                        classes.fileIcon
                                                                      }
                                                                    >
                                                                      {file.type ===
                                                                      "image" ? (
                                                                        <FaFileImage
                                                                          size={
                                                                            20
                                                                          }
                                                                        />
                                                                      ) : (
                                                                        <FaFileAlt
                                                                          size={
                                                                            20
                                                                          }
                                                                        />
                                                                      )}
                                                                    </Avatar>
                                                                  </ListItemAvatar>
                                                                  <ListItemText
                                                                    primary={
                                                                      file?.name
                                                                    }
                                                                    // secondary={
                                                                    //   <Typography variant="body2" color="textSecondary">
                                                                    //     {file.size}
                                                                    //   </Typography>
                                                                    // }
                                                                    className={
                                                                      classes.fileDetails
                                                                    }
                                                                  />
                                                                </div>
                                                                <IconButton
                                                                  edge="end"
                                                                  onClick={() => {
                                                                    deleteFilesNc(
                                                                      indextemp,
                                                                      index,
                                                                      itemIndex,
                                                                      file?.uid
                                                                    );
                                                                  }}
                                                                >
                                                                  <MdClose
                                                                    style={{
                                                                      color:
                                                                        "red",
                                                                    }}
                                                                  />
                                                                </IconButton>
                                                              </ListItem>
                                                            )
                                                          )}
                                                        </List>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                                {alignValue === "Checklist" && (
                                                  <div
                                                    style={{
                                                      display: "flow",
                                                      justifyContent: "center",
                                                      border: "1px solid grey",
                                                      borderRadius: "3px",
                                                      width: "100%",
                                                      // paddingTop:"10px"
                                                    }}
                                                  >
                                                    <Button
                                                      disabled={
                                                        formData.auditTemplate
                                                          ? false
                                                          : disabled
                                                      }
                                                      onClick={() => {
                                                        if (
                                                          commentStatus &&
                                                          msgValueIndex ===
                                                            itemIndex
                                                        ) {
                                                          setCommentStatus(
                                                            false
                                                          );
                                                          setMsgValueIndex(
                                                            null
                                                          );
                                                        } else {
                                                          setCommentStatus(
                                                            true
                                                          );
                                                          setMsgValueIndex(
                                                            itemIndex
                                                          );
                                                        }
                                                      }}
                                                      style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                          "center",
                                                        // color: "#6E7DAB",
                                                        textTransform: "none", // Keeps text as written (not uppercase)
                                                        fontWeight: "bold",
                                                        gap: "10px",
                                                        width: "100%", // Ensures button takes full width of its container
                                                      }}
                                                    >
                                                      <Box
                                                        style={{
                                                          display: "flex",
                                                          alignItems: "center",
                                                          justifyContent:
                                                            "center",
                                                          gap: "10px",
                                                        }}
                                                      >
                                                        <MdChatBubbleOutline
                                                          style={{
                                                            color: "#6E7DAB",
                                                          }}
                                                        />
                                                        <span>
                                                          Add Comments
                                                        </span>
                                                      </Box>
                                                    </Button>
                                                  </div>
                                                )}
                                                {commentStatus &&
                                                  itemIndex ===
                                                    msgValueIndex && (
                                                    <TextField
                                                      className={
                                                        classes.textField
                                                      }
                                                      multiline
                                                      rows={2}
                                                      rowsMax={6}
                                                      variant="outlined"
                                                      placeholder="Enter Comment"
                                                      name="comment"
                                                      disabled={false}
                                                      onChange={(e: any) => {
                                                        handleChange(
                                                          e,
                                                          "comment",
                                                          indextemp,
                                                          index,
                                                          itemIndex
                                                        );
                                                      }}
                                                      value={item?.comment}
                                                    />
                                                  )}
                                              </div>
                                            )
                                          )}{" "}
                                        </div>
                                      </AccordionDetails>
                                    </Accordion>
                                  )
                                )}
                              </div>
                            </>
                          )}
                        </AccordionDetails>
                      </div>
                      <div style={{ flex: matches ? 3 : 0 }}>
                        {hoveredUserId && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                            }}
                          >
                            {itemTemp.sections.map(
                              (
                                section: { title: string; fieldset: any },
                                index: number
                              ) => (
                                <div
                                  key={index}
                                  style={{ paddingRight: "30px" }}
                                >
                                  <div>
                                    {section.title} :{" "}
                                    {section.fieldset.reduce(
                                      (sectionTotal: any, fieldset: any) => {
                                        return (
                                          sectionTotal + fieldset.questionScore
                                        );
                                      },
                                      0
                                    )}{" "}
                                    /{" "}
                                    {section.fieldset.reduce(
                                      (sectionTotal: any, fieldset: any) => {
                                        let maxScore = 0;
                                        if (fieldset.inputType === "checkbox") {
                                          maxScore = Math.max(
                                            fieldset.options[0]?.value || 0,
                                            fieldset.options[1]?.value || 0
                                          );
                                        } else if (
                                          fieldset.inputType === "radio"
                                        ) {
                                          maxScore = Math.max(
                                            fieldset.options[0]?.value || 0,
                                            fieldset.options[1]?.value || 0,
                                            fieldset.options[2]?.value || 0
                                          );
                                        } else if (
                                          fieldset.inputType === "numeric"
                                        ) {
                                          maxScore = Math.max(
                                            fieldset.score[0]?.score || 0,
                                            fieldset.score[1]?.score || 0
                                          );
                                        } else {
                                          maxScore = 0;
                                        }
                                        return sectionTotal + maxScore;
                                      },
                                      0
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Accordion>
                ))
            )}
          </Box>
        </Box>
        {visible && (
          <Tooltip title="Scroll To Top">
            <Fab
              size="medium"
              data-testid="fabMobile"
              onClick={scrollToTop}
              className={classes.fabBtn}
            >
              <MdArrowUpward />
            </Fab>
          </Tooltip>
        )}
      </div>

      <Tour
        open={openTourForReportFormCL1}
        onClose={() => setOpenTourForReportFormCL1(false)}
        steps={stepsForReportFormCL1}
      />
    </>
  );
};

export default Checklist;
