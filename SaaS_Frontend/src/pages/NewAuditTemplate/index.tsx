import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import TemplateFormWrapper from "../../containers/TemplateFormWrapper";
import TextFieldComponent from "../../components/TextfieldComponent";
import AuditSectionHeader from "../../components/AuditSectionHeader";
import Divider from "@material-ui/core/Divider";
import { templateForm, questionFocus } from "../../recoil/atom";
import { useRecoilState, useResetRecoilState } from "recoil";
import { useEffect, useState } from "react";
import CustomDragAndDrop from "../../components/CustomDragAndDrop";
import { generateUniqueId } from "../../utils/uniqueIdGenerator";
import FormFieldController from "../../components/FormFieldController";
import { Autocomplete } from "@material-ui/lab";
import { InputAdornment, TextField, Tooltip } from "@material-ui/core";
import {
  getAllSuggestions,
  getAuditTemplate,
  isTemplateNameUnique,
  saveAuditTemplate,
  updateTemplate,
  getExcelDetails,
} from "../../apis/auditApi";
import { MdCheckCircle } from 'react-icons/md';
import { MdCancel } from 'react-icons/md';
import { MdSearch } from 'react-icons/md';
import _ from "lodash";
import { useStyles } from "./styles";
import getToken from "../../utils/getToken";
import * as yup from "yup";
import parseToken from "../../utils/parseToken";
import DynamicFormComponent from "../../components/DynamicFormComponent";
import moment from "moment-timezone";
import { useSnackbar } from "notistack";
import { useLocation, useNavigate } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import checkRoles from "../../utils/checkRoles";
import getUserId from "../../utils/getUserId";
import AutoComplete from "components/AutoComplete";
import checkRole from "../../utils/checkRoles";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import { Form, Modal, Upload, UploadProps } from "antd";
import { MdInbox } from 'react-icons/md';
import { MdPublish } from 'react-icons/md';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { isValid } from "utils/validateInput";

/**
 * @method NewAuditTemplate
 * @description Function to generate a audit Checklist form component
 * @returns a react node
 */
const NewAuditTemplate = () => {
  const classes = useStyles();
  const [template, setTemplate] = useRecoilState(templateForm);
  const [check, setCheck] = useState(false);
  const [suggestion, setSuggestion] = useState<any>([]);
  const [templateNameValidity, settemplateNameValidity] = useState(false);
  const [preview, setPreview] = useState<any>(false);
  const [focus, setFocus] = useRecoilState<boolean>(questionFocus);
  const resetFocusState = useResetRecoilState(questionFocus);
  const [addAction, setAddAction] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<any>(false);
  const resetTemplate = useResetRecoilState(templateForm);
  const location: any = useLocation();
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const orgAdmin = checkRole("ORG-ADMIN");
  const [locations, setLocations] = useState<any[]>([]);
  const allOption = { id: "All", locationName: "All" };
  const realmName = getAppUrl();
  const [importQuestionsModel, setImportQuestionsModel] = useState<any>({
    open: false,
  });
  const [fileList, setFileList] = useState<any>([]);
  /**
   * @description Validation schema for the Checklist based on which error messages are displayed
   */
  const validationSchema = yup.object().shape({
    title: yup.string().required("Checklist name required!"),
    sections: yup.array().of(
      yup.object().shape({
        title: yup
          .string()
          .required("You can't leave the section field empty!"),
        fieldset: yup.array().of(
          yup.object().shape({
            title: yup
              .string()
              .required("You can't leave the question field empty!"),
            inputType: yup
              .string()
              .required("You need to select a question type!"),
            options: yup.array().of(
              yup.object().shape({
                name: yup.string().required(),
                value: yup
                  .number()
                  .typeError("You must specify a number as score!")
                  .required("You need to add a score for yes/no/na options!"),
              })
            ),
            value: yup.string(),
            score: yup.array().when("slider", {
              is: true,
              then: yup.array().of(
                yup.object().shape({
                  name: yup
                    .string()
                    .required("You need to select a operator symbol!"),
                  value: yup
                    .number()
                    .min(0, "Operator value should be between 1-10!")
                    .max(10, "Operator value should be between 1-10!")
                    .required("You need to add a value with the operator!"),
                  score: yup.number().required("You need to add a score!"),
                })
              ),
            }),
            slider: yup.boolean(),
            open: yup.boolean(),
            required: yup.boolean(),
            hint: yup.string(),
            allowImageUpload: yup.boolean().required(),
            image: yup.string(),
          })
        ),
      })
    ),
  });

  /**
   * @method changePreviewState
   * @description Function to change the preview state
   * @returns nothing
   */
  const changePreviewState = () => {
    setPreview(!preview);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [preview]);

  useEffect(() => {
    getLocations();
    resetTemplate();
    const locState: any = location.state;
    if (locState) {
      setIsLoading(true);
      getAuditTemplate(locState.id).then((res: any) => {
        setTemplate(res.data);
        setIsLoading(false);
        locState.preview && changePreviewState();
        window.scrollTo(0, 0);
        (locState.edit || locState.preview) && settemplateNameValidity(true);
      });
    }

    const accountInfo = parseToken(getToken());
    setTemplate((prev: any) => {
      return {
        ...prev,
        createdBy: accountInfo.name,
      };
    });
    fetchSuggestionsList();
    return () => {
      resetFocusState();
    };
  }, []);

  useEffect(() => {
    console.log("checka template state useEffect", template);
    
  }, [template]);

  /**
   * @method handleSubmit
   * @description Function to handle submit
   * @returns nothing
   */
  const handleSubmit = async (option: string) => {
    const { createdAt, updatedAt, _id, ...payload }: any = template;
    payload.createdBy = getUserId();

    const validateTitle = await isValid(template.title);

    if (validateTitle.isValid === false) {
      enqueueSnackbar(`Title ${validateTitle?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
    if (option === "Preview" || option === "Close Preview") {
      changePreviewState();
      return;
    }
    if (option === "Publish") {
      payload.isDraft = false;
      const timezone = await Intl.DateTimeFormat().resolvedOptions().timeZone;
      const date = await moment().tz(timezone).format("D-M-YY");
      payload.publishedDate = `${date}`;
    }
    if (location?.state?.edit) {
      payload.userId = getUserId();
      validationSchema
        .validate(payload)
        .then(() => {
          updateTemplate(location?.state?.id, payload)
            .then((res: any) => {
              if (!res) {
                enqueueSnackbar("Something went wrong!", { variant: "error" });
              } else {
                enqueueSnackbar("Checklist successfully saved!");
                // navigate("/auditsettings/auditchecklist");
               navigate("/auditsettings", {
              state: {
                redirectToTab: "AUDIT CHECKLIST",
              },
            });
              }
            })
            .catch((error: any) => {
              console.log("error - ", { error });
            });
        })
        .catch((error: any) => {
          console.log("error response - ", { error });
          enqueueSnackbar(error.message, { variant: "error" });
        });
      return;
    } else {
      if (!templateNameValidity) {
        enqueueSnackbar("Enter a unique Checklist name!", { variant: "error" });
        return;
      }
      console.log("checka template in handlesubmit", template);
      console.log("checka payload in handlesubmit", payload);
      
      
      saveAuditTemplate(payload)
        .then((res: any) => {
          if (!res) {
            enqueueSnackbar("Something went wrong!", { variant: "error" });
          } else {
            enqueueSnackbar("Checklist successfully saved!");
            // navigate("/auditsettings/auditchecklist");
            navigate("/auditsettings", {
              state: {
                redirectToTab: "AUDIT CHECKLIST",
              },
            });
          }
        })
        .catch((error: any) => {
          console.log("error - ", { error });
        });
      // })
      // .catch((error: any) => {
      //   console.log("error response - ", { error });
      //   enqueueSnackbar(error.message, { variant: "error" });
      // });
    }
  };

  const importQuestions = async () => {
    const formData = new FormData();
    formData.append("file", fileList[0].originFileObj);
    const excelDetails = await getExcelDetails(formData);
    console.log("excelDate  ", excelDetails?.data);
    if (excelDetails?.data.success) {
      const uniqueSections = new Set();
      for (const rowData of excelDetails.data.responseData) {
        const section = rowData.section.toLowerCase();
        if (!uniqueSections.has(section)) {
          uniqueSections.add(section);
          addSectionImport(
            rowData.section,
            rowData.question,
            rowData.type,
            rowData.score,
            rowData.slider,
            rowData.hint,
            uniqueSections.size - 1
          );
        } else {
          const uniqueSectionsArray = Array.from(uniqueSections);
          const index = uniqueSectionsArray.indexOf(section);
          addQuestionImport(
            index,
            rowData.question,
            rowData.type,
            rowData.score,
            rowData.slider,
            rowData.hint
          );
        }
      }
    }
    return;
  };

  const uploadProps: UploadProps = {
    multiple: false,
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFileList(fileList);
      }
    },
    onRemove: (file) => {
      setFileList((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      );
    },
  };

  /**
   * @method checkTemplateName
   * @description Function check Checklist name validity
   * @returns boolean
   */
  const checkTemplateName = _.debounce((text: string) => {
    isTemplateNameUnique(text).then((response: any) => {
      settemplateNameValidity(response.data);
    });
  }, 600);

  /**
   * @method fetchSuggestionsList
   * @description Function to fetch suggestions list
   * @param searchText {string}
   * @returns suggestions {array}
   */
  const fetchSuggestionsList = () => {
    getAllSuggestions().then((res: any) => {
      setSuggestion(res.data);
    });
  };

  /**
   * @method fetchAuditTemplateById
   * @description Function to fetch audit Checklist by its id
   * @param id {string}
   * @returns nothing
   */
  const fetchAuditTemplateById = (id: string) => {
    setIsLoading(true);
    let data: any;
    getAuditTemplate(id).then((response: any) => {
      data = response.data;
      const { _id, ...res } = data;
      res.title = template.title ? template.title : "";
      res.isDraft = true;
      res.publishedDate = "";
      setTemplate(res);
      setIsLoading(false);
    });
  };

  /**
   * @method handleChange
   * @description Function to handle onChange events for text field
   * @param e {any}
   * @returns nothing
   */
  const handleChange = (e: any) => {
    setTemplate((prevState: any) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleChangeNew = (e: any) => {
    setTemplate((prevState: any) => ({
      ...prevState,
      [e.target.name]: !template.status,
    }));
  };
  /**
   * @method handleSectionChange
   * @description Function to handle onChange events for section field
   * @param e {any}
   * @param index {any}
   * @returns nothing
   */
  const handleSectionChange = (e: any, index: any) => {
    const sectionData = JSON.parse(JSON.stringify(template));
    setTemplate((prev: any) => {
      sectionData.sections.splice(index, 1, {
        ...sectionData.sections[index],
        [e.target.name]: e.target.value,
      });
      return { ...sectionData };
    });
  };

  /**
   * @method handleQuestionChange
   * @description Function to handle onChange for question field
   * @param e {any}
   * @param index {any}
   * @returns nothing
   */
  const handleQuestionChange = (e: any, index: any, questionIndex: any) => {
    const questionData = JSON.parse(JSON.stringify(template));
    if (e.target.name === "allowImageUpload") {
      setTemplate((prev: any) => {
        questionData.sections[index].fieldset.splice(questionIndex, 1, {
          ...questionData.sections[index].fieldset[questionIndex],
          allowImageUpload:
            !questionData.sections[index].fieldset[questionIndex]
              .allowImageUpload,
        });
        questionData.sections[index].totalScore = getTotalSectionScore(
          questionData,
          index
        );
        return { ...questionData };
      });
      return;
    } else if (e.target.name === "slider") {
      setTemplate((prev: any) => {
        questionData.sections[index].fieldset.splice(questionIndex, 1, {
          ...questionData.sections[index].fieldset[questionIndex],
          slider: !questionData.sections[index].fieldset[questionIndex].slider,
        });
        questionData.sections[index].totalScore = getTotalSectionScore(
          questionData,
          index
        );
        return { ...questionData };
      });
      return;
    } else if (e.target.value === "abs") {
      const questionDataCopy =
        questionData.sections[index].fieldset[questionIndex];
      setTemplate((prev: any) => {
        questionDataCopy.score.splice(0, 1, {
          ...questionDataCopy.score[0],
          name: e.target.value,
        });
        questionDataCopy.score.splice(1, 1, {
          ...questionDataCopy.score[0],
          name: e.target.value,
        });
        questionData.sections[index].fieldset[questionIndex] = questionDataCopy;
        questionData.sections[index].totalScore = getTotalSectionScore(
          questionData,
          index
        );
        return { ...questionData };
      });
      return;
    } else if (e.target.name === "score-0") {
      const questionDataCopy =
        questionData.sections[index].fieldset[questionIndex];
      setTemplate((prev: any) => {
        questionDataCopy.score.splice(0, 1, {
          ...questionDataCopy.score[0],
          name: e.target.value,
        });
        questionData.sections[index].fieldset[questionIndex] = questionDataCopy;
        questionData.sections[index].totalScore = getTotalSectionScore(
          questionData,
          index
        );
        return { ...questionData };
      });
      return;
    } else if (e.target.name === "score-1") {
      const questionDataCopy =
        questionData.sections[index].fieldset[questionIndex];
      setTemplate((prev: any) => {
        questionDataCopy.score.splice(1, 1, {
          ...questionDataCopy.score[1],
          name: e.target.value,
        });
        questionData.sections[index].fieldset[questionIndex] = questionDataCopy;
        questionData.sections[index].totalScore = getTotalSectionScore(
          questionData,
          index
        );
        return { ...questionData };
      });
      return;
    } else if (e.target.name === "value-0") {
      const questionDataCopy =
        questionData.sections[index].fieldset[questionIndex];
      if (questionDataCopy.score[0].name === "abs") {
        setTemplate((prev: any) => {
          questionDataCopy.score.splice(0, 1, {
            ...questionDataCopy.score[0],
            score: e.target.value,
          });
          questionDataCopy.score.splice(0, 1, {
            ...questionDataCopy.score[0],
            value: e.target.value,
          });
          questionData.sections[index].fieldset[questionIndex] =
            questionDataCopy;
          questionData.sections[index].totalScore = getTotalSectionScore(
            questionData,
            index
          );
          return { ...questionData };
        });
      } else {
        setTemplate((prev: any) => {
          questionDataCopy.score.splice(0, 1, {
            ...questionDataCopy.score[0],
            value: e.target.value,
          });
          questionData.sections[index].fieldset[questionIndex] =
            questionDataCopy;
          questionData.sections[index].totalScore = getTotalSectionScore(
            questionData,
            index
          );
          return { ...questionData };
        });
      }
      return;
    } else if (e.target.name === "value-1") {
      const questionDataCopy =
        questionData.sections[index].fieldset[questionIndex];
      if (questionDataCopy.score[1].name === "abs") {
        setTemplate((prev: any) => {
          questionDataCopy.score.splice(1, 1, {
            ...questionDataCopy.score[1],
            score: e.target.value,
          });
          questionDataCopy.score.splice(1, 1, {
            ...questionDataCopy.score[1],
            value: e.target.value,
          });
          questionData.sections[index].fieldset[questionIndex] =
            questionDataCopy;
          questionData.sections[index].totalScore = getTotalSectionScore(
            questionData,
            index
          );
          return { ...questionData };
        });
      } else {
        setTemplate((prev: any) => {
          questionDataCopy.score.splice(1, 1, {
            ...questionDataCopy.score[1],
            value: e.target.value,
          });
          questionData.sections[index].fieldset[questionIndex] =
            questionDataCopy;
          questionData.sections[index].totalScore = getTotalSectionScore(
            questionData,
            index
          );
          return { ...questionData };
        });
      }
      return;
    } else if (e.target.name === "scoreVal-0") {
      const questionDataCopy =
        questionData.sections[index].fieldset[questionIndex];
      setTemplate((prev: any) => {
        questionDataCopy.score.splice(0, 1, {
          ...questionDataCopy.score[0],
          score: e.target.value,
        });
        questionData.sections[index].fieldset[questionIndex] = questionDataCopy;
        questionData.sections[index].totalScore = getTotalSectionScore(
          questionData,
          index
        );
        return { ...questionData };
      });
      return;
    } else if (e.target.name === "scoreVal-1") {
      const questionDataCopy =
        questionData.sections[index].fieldset[questionIndex];
      setTemplate((prev: any) => {
        questionDataCopy.score.splice(1, 1, {
          ...questionDataCopy.score[1],
          score: e.target.value,
        });
        questionData.sections[index].fieldset[questionIndex] = questionDataCopy;
        questionData.sections[index].totalScore = getTotalSectionScore(
          questionData,
          index
        );
        return { ...questionData };
      });
      return;
    } else if (e.target.name === "yes") {
      const questionDataCopy =
        questionData.sections[index].fieldset[questionIndex];
      setTemplate((prev: any) => {
        questionDataCopy.options.splice(0, 1, {
          ...questionDataCopy.options[0],
          value: e.target.value,
        });
        questionData.sections[index].fieldset[questionIndex] = questionDataCopy;
        questionData.sections[index].totalScore = getTotalSectionScore(
          questionData,
          index
        );
        return { ...questionData };
      });
      return;
    } else if (e.target.name === "no") {
      const questionDataCopy =
        questionData.sections[index].fieldset[questionIndex];
      setTemplate((prev: any) => {
        questionDataCopy.options.splice(1, 1, {
          ...questionDataCopy.options[1],
          value: e.target.value,
        });
        questionData.sections[index].fieldset[questionIndex] = questionDataCopy;
        questionData.sections[index].totalScore = getTotalSectionScore(
          questionData,
          index
        );
        return { ...questionData };
      });
      return;
    } else if (e.target.name === "na") {
      const questionDataCopy =
        questionData.sections[index].fieldset[questionIndex];
      setTemplate((prev: any) => {
        questionDataCopy.options.splice(2, 1, {
          ...questionDataCopy.options[2],
          value: e.target.value,
        });
        questionData.sections[index].fieldset[questionIndex] = questionDataCopy;
        questionData.sections[index].totalScore = getTotalSectionScore(
          questionData,
          index
        );
        return { ...questionData };
      });
      return;
    }
    setTemplate((prev: any) => {
      questionData.sections[index].fieldset.splice(questionIndex, 1, {
        ...questionData.sections[index].fieldset[questionIndex],
        [e.target.name]: e.target.value,
      });
      questionData.sections[index].totalScore = getTotalSectionScore(
        questionData,
        index
      );
      return { ...questionData };
    });
  };

  const getTotalSectionScore = (questionData: any, index: any) => {
    const totalScore = questionData.sections[index]?.fieldset?.reduce(
      (sectionTotal: any, fieldset: any) => {
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
        } else {
          maxScore = 0;
        }
        return sectionTotal + maxScore;
      },
      0
    );
    return totalScore;
  };

  /**
   * @method addSection
   * @description Function to add a new section field
   * @returns nothing
   */
  const addSection = () => {
    setTemplate((prevState: any) => ({
      ...prevState,
      sections: [
        ...prevState.sections,
        {
          title: "",
          totalScore: 0,
          obtainedScore: 0,
          fieldset: [
            {
              id: generateUniqueId(10),
              title: "",
              inputType: "numeric",
              options: [
                {
                  name: "yes",
                  checked: false,
                  value: 0,
                },
                {
                  name: "no",
                  checked: false,
                  value: 0,
                },
                {
                  name: "na",
                  checked: false,
                  value: 0,
                },
              ],
              value: "",
              questionScore: 0,
              score: [
                {
                  name: "gt",
                  value: 0,
                  score: 0,
                },
                {
                  name: "lt",
                  value: 0,
                  score: 0,
                },
              ],
              slider: false,
              open: false,
              required: true,
              hint: "",
              allowImageUpload: true,
              image: "image url",
              imageName: "",
              nc: {
                type: "",
                comment: "",
                clause: "",
                severity: "",
              },
            },
          ],
        },
      ],
    }));
    setFocus(false);
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const addSectionImport = (
    sectionTitle: string,
    questionTitle: string,
    type: string,
    score: string,
    slider: boolean,
    hint: string,
    index: number
  ) => {
    console.log("SLIIIIIIIIIDER ", slider);
    const scores = getScore(score);
    const myKey1 = Object.keys(scores)[0];
    const myKey2 = Object.keys(scores)[1];
    let myValue1 = 0;
    let myValue2 = 0;
    let [symbol1, number1] = ["gt", 0];
    let [symbol2, number2] = ["lt", 0];
    if (type !== "text") {
      myValue1 = scores[myKey1];
      myValue2 = scores[myKey2];
      const extractValues = (key: any) => {
        const matches = key.match(/([^\d]+)(\d+)/);
        return matches ? matches.slice(1) : [key];
      };
      [symbol1, number1] = extractValues(myKey1);
      [symbol2, number2] = extractValues(myKey2);
    }
    if (symbol1 === ">") {
      symbol1 = "gt";
    }
    if (symbol1 === "<") {
      symbol1 = "lt";
    }
    if (symbol1 === "e") {
      symbol1 = "eq";
    }
    if (symbol2 === ">") {
      symbol2 = "gt";
    }
    if (symbol2 === "<") {
      symbol2 = "lt";
    }
    if (symbol2 === "e") {
      symbol2 = "eq";
    }
    if (index === 0) {
      setTemplate((prevState: any) => ({
        ...prevState,
        sections: [
          {
            title: sectionTitle,
            totalScore: 0,
            obtainedScore: 0,
            fieldset: [
              {
                id: generateUniqueId(10),
                title: questionTitle,
                inputType: type,
                options: [
                  {
                    name: "yes",
                    checked: false,
                    value: scores.yes ? scores.yes : 0,
                  },
                  {
                    name: "no",
                    checked: false,
                    value: scores.no ? scores.no : 0,
                  },
                  {
                    name: "na",
                    checked: false,
                    value: scores.na ? scores.na : 0,
                  },
                ],
                value: "",
                questionScore: 0,
                score: [
                  {
                    name:
                      scores.absMin || scores.absMin === 0 ? "abs" : symbol1,
                    value:
                      scores.absMin || scores.absMin === 0
                        ? scores.absMin
                        : number1,
                    score:
                      scores.absMin || scores.absMin === 0
                        ? scores.absMin
                        : myValue1,
                  },
                  {
                    name:
                      scores.absMax || scores.absMax === 0 ? "abs" : symbol2,
                    value:
                      scores.absMax || scores.absMax === 0
                        ? scores.absMax
                        : number2,
                    score:
                      scores.absMax || scores.absMax === 0
                        ? scores.absMax
                        : myValue2,
                  },
                ],
                slider: slider,
                open: false,
                required: true,
                hint: hint,
                allowImageUpload: true,
                image: "image url",
                imageName: "",
                nc: {
                  type: "",
                  comment: "",
                  clause: "",
                  severity: "",
                },
              },
            ],
          },
        ],
      }));
    } else {
      setTemplate((prevState: any) => ({
        ...prevState,
        sections: [
          ...prevState.sections,
          {
            title: sectionTitle,
            totalScore: 0,
            obtainedScore: 0,
            fieldset: [
              {
                id: generateUniqueId(10),
                title: questionTitle,
                inputType: type,
                options: [
                  {
                    name: "yes",
                    checked: false,
                    value: scores.yes ? scores.yes : 0,
                  },
                  {
                    name: "no",
                    checked: false,
                    value: scores.no ? scores.no : 0,
                  },
                  {
                    name: "na",
                    checked: false,
                    value: scores.na ? scores.na : 0,
                  },
                ],
                value: "",
                questionScore: 0,
                score: [
                  {
                    name:
                      scores.absMin || scores.absMin === 0 ? "abs" : symbol1,
                    value:
                      scores.absMin || scores.absMin === 0
                        ? scores.absMin
                        : number1,
                    score:
                      scores.absMin || scores.absMin === 0
                        ? scores.absMin
                        : myValue1,
                  },
                  {
                    name:
                      scores.absMax || scores.absMax === 0 ? "abs" : symbol2,
                    value:
                      scores.absMax || scores.absMax === 0
                        ? scores.absMax
                        : number2,
                    score:
                      scores.absMax || scores.absMax === 0
                        ? scores.absMax
                        : myValue2,
                  },
                ],
                slider: slider,
                open: false,
                required: true,
                hint: hint,
                allowImageUpload: true,
                image: "image url",
                imageName: "",
                nc: {
                  type: "",
                  comment: "",
                  clause: "",
                  severity: "",
                },
              },
            ],
          },
        ],
      }));
    }
  };

  const addQuestionImport = (
    index: any,
    questionTitle: string,
    type: string,
    score: string,
    slider: boolean,
    hint: string
  ) => {
    const scores = getScore(score);
    const myKey1 = Object.keys(scores)[0];
    const myKey2 = Object.keys(scores)[1];
    let myValue1 = 0;
    let myValue2 = 0;
    let [symbol1, number1] = ["gt", 0];
    let [symbol2, number2] = ["lt", 0];
    if (type !== "text") {
      myValue1 = scores[myKey1];
      myValue2 = scores[myKey2];
      const extractValues = (key: any) => {
        const matches = key.match(/([^\d]+)(\d+)/);
        return matches ? matches.slice(1) : [key];
      };
      [symbol1, number1] = extractValues(myKey1);
      [symbol2, number2] = extractValues(myKey2);
    }
    if (symbol1 === ">") {
      symbol1 = "gt";
    }
    if (symbol1 === "<") {
      symbol1 = "lt";
    }
    if (symbol1 === "e") {
      symbol1 = "eq";
    }
    if (symbol2 === ">") {
      symbol2 = "gt";
    }
    if (symbol2 === "<") {
      symbol2 = "lt";
    }
    if (symbol2 === "e") {
      symbol2 = "eq";
    }
    let sectionData: any;
    setTemplate((prev: any) => {
      sectionData = JSON.parse(JSON.stringify(prev));
      sectionData.sections.splice(index, 1, {
        ...sectionData.sections[index],
        fieldset: [
          ...sectionData.sections[index].fieldset,
          {
            id: generateUniqueId(10),
            title: questionTitle,
            inputType: type,
            options: [
              {
                name: "yes",
                checked: false,
                value: scores.yes ? scores.yes : 0,
              },
              {
                name: "no",
                checked: false,
                value: scores.no ? scores.no : 0,
              },
              {
                name: "na",
                checked: false,
                value: scores.na ? scores.na : 0,
              },
            ],
            value: "",
            questionScore: 0,
            score: [
              {
                name: scores.absMin || scores.absMin === 0 ? "abs" : symbol1,
                value:
                  scores.absMin || scores.absMin === 0
                    ? scores.absMin
                    : number1,
                score:
                  scores.absMin || scores.absMin === 0
                    ? scores.absMin
                    : myValue1,
              },
              {
                name: scores.absMax || scores.absMax === 0 ? "abs" : symbol2,
                value:
                  scores.absMax || scores.absMax === 0
                    ? scores.absMax
                    : number2,
                score:
                  scores.absMax || scores.absMax === 0
                    ? scores.absMax
                    : myValue2,
              },
            ],
            slider: slider,
            open: false,
            required: true,
            hint: hint,
            allowImageUpload: true,
            image: "image url",
            imageName: "",
            nc: {
              type: "",
              comment: "",
              clause: "",
              severity: "",
            },
          },
        ],
      });
      return { ...sectionData };
    });
  };

  const getScore = (score: string) => {
    const keyValuePairs = score.split(",");
    const resultObject: any = {};
    keyValuePairs.forEach((pair) => {
      const [key, value] = pair.split(":");
      resultObject[key] = parseInt(value, 10);
    });
    return resultObject;
  };

  /**
   * @method removeSection
   * @description Function to remove a section
   * @param index {any}
   */
  const removeSection = (index: any) => {
    setTemplate((prevState: any) => ({
      ...prevState,
      sections: prevState.sections.filter(
        (section: any, i: any) => i !== index
      ),
    }));
    enqueueSnackbar("A section has been deleted successfully", {
      variant: "success",
    });
  };

  /**
   * @method setSelectOption
   * @description Function to handle select option change
   * @param tag {string}
   * @param index {number}
   * @param questionIndex {number}
   * @returns nothing
   */
  const setSelectOption = (
    tag: string,
    index: number,
    questionIndex: number
  ) => {
    const questionData = JSON.parse(JSON.stringify(template));
    setTemplate((prev: any) => {
      questionData.sections[index].fieldset.splice(questionIndex, 1, {
        ...questionData.sections[index].fieldset[questionIndex],
        inputType: tag,
      });
      return { ...questionData };
    });
  };

  /**
   * @method getLocations
   * @description Function to fetch all locations
   * @returns nothing
   */
  const getLocations = async () => {
    const res = await axios.get(`api/location/getLocationsForOrg/${realmName}`);
    setLocations(res.data);
  };

  const getQuestionTemplate = () => {
    let requiredData: any[] = [];
    requiredData = [
      {
        SectionTitle: "Section1",
        QuestionTitle: "QuestionS1Q1",
        Type: "text",
        Score: "Not Required",
        Slider: "false",
        Hint: "Add Hint",
      },
      {
        SectionTitle: "Section1",
        QuestionTitle: "QuestionS1Q2",
        Type: "checkbox",
        Score: "yes:10,no:5",
        Slider: "false",
        Hint: "Add Hint",
      },
      {
        SectionTitle: "Section1",
        QuestionTitle: "QuestionS1Q3",
        Type: "radio",
        Score: "yes:10,no:0,na:5",
        Slider: "false",
        Hint: "Add Hint",
      },
      {
        SectionTitle: "Section2",
        QuestionTitle: "QuestionS2Q1",
        Type: "numeric",
        Score: ">6:10,<3:2",
        Slider: "true",
        Hint: "Add Hint",
      },
      {
        SectionTitle: "Section2",
        QuestionTitle: "QuestionS2Q2",
        Type: "numeric",
        Score: "e10:10,e0:5",
        Slider: "false",
        Hint: "Add Hint",
      },
      {
        SectionTitle: "Section3",
        QuestionTitle: "QuestionS3Q1",
        Type: "numeric",
        Score: "absMin:0,absMax:15",
        Slider: "true",
        Hint: "Add Hint",
      },
    ];
    const sheet = XLSX.utils.json_to_sheet(requiredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Questions");
    const excelBinaryString = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });
    const blob = new Blob([s2ab(excelBinaryString)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "Template.xlsx");
  };

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  return (
    <>
      <div className={classes.rootone}>
        {isLoading ? (
          <Box
            height="60vh"
            display="flex"
            justifyContent="center"
            alignItems="center"
            gridGap={10}
          >
            <CircularProgress />
            <Typography variant="h5">Loading...</Typography>
          </Box>
        ) : (
          <>
            <Box>
              <TemplateFormWrapper
                // backPath={`/auditsettings/auditchecklist`}
                parentPageLink="/auditsettings"
                backBtn={false}
                redirectToTab="AUDIT CHECKLIST"
                onSubmit={handleSubmit}
                options={
                  preview
                    ? ["Close Preview", "Save as Draft", "Publish"]
                    : ["Save as Draft", "Preview", "Publish"]
                }
                disableOption={
                  preview
                    ? !(isLocAdmin || isMR || isOrgAdmin)
                      ? ["Close Preview", "Save as Draft", "Publish"]
                      : ["Save as Draft", "Publish"]
                    : []
                }
              >
                <>
                  {isOrgAdmin && (
                    <Tooltip title="Import Questions">
                      <MdPublish
                        onClick={() => setImportQuestionsModel({ open: true })}
                        style={{
                          position: "relative",
                          left: "1110px",
                          top: "-65px",
                          fontSize: "30px",
                          color: "#0E497A",
                        }}
                      />
                    </Tooltip>
                  )}
                  {importQuestionsModel.open && (
                    <Modal
                      title="Import Questions"
                      open={importQuestionsModel.open}
                      onCancel={() => setImportQuestionsModel({ open: false })}
                      onOk={() => {
                        importQuestions();
                        setImportQuestionsModel({ open: false });
                      }}
                    >
                      <Form.Item name="attachments" label={"Attach File: "}>
                        <Upload
                          name="attachments"
                          {...uploadProps}
                          fileList={fileList}
                        >
                          <p className="ant-upload-drag-icon">
                            <MdInbox />
                          </p>
                          <p className="ant-upload-text">
                            Click or drag file to this area to upload
                          </p>
                        </Upload>
                        <a href="#" onClick={getQuestionTemplate}>
                          Template
                        </a>
                      </Form.Item>
                    </Modal>
                  )}
                  <Box className={classes.formHeader}>
                    <TextFieldComponent
                      disabled={preview}
                      label="Checklist Name*"
                      type="text"
                      name="title"
                      onChange={handleChange}
                      debouncedSearch={checkTemplateName}
                      value={template.title}
                      endIcon={
                        templateNameValidity ? (
                          <Tooltip title="Checklist name is unique">
                            <MdCheckCircle
                              style={{ color: "green", cursor: "pointer" }}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Checklist name is not unique">
                            <MdCancel
                              style={{ color: "red", cursor: "pointer" }}
                            />
                          </Tooltip>
                        )
                      }
                    />
                    <TextFieldComponent
                      label="Created By"
                      type="text"
                      name="createdBy"
                      onChange={handleChange}
                      value={template.createdBy ?? ""}
                      disabled={true}
                    />
                    <FormFieldController label="Re-use Template">
                      <Box width="100%">
                        <Autocomplete
                          disabled={preview}
                          fullWidth
                          id="combo-box-demo"
                          options={suggestion}
                          size="small"
                          onChange={(e: any, value: any) => {
                            fetchAuditTemplateById(value._id);
                          }}
                          getOptionLabel={(option) => option?.title}
                          renderInput={(params) => (
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
                        />
                      </Box>
                    </FormFieldController>

                    <TextFieldComponent
                      label="Published Date"
                      type="text"
                      name="createdAt"
                      onChange={handleChange}
                      value={template.publishedDate}
                      disabled={true}
                      placeholder="DD-MM-YY"
                    />
                    {/* <FormFieldController label="Ranked Response">
                      <Switch
                        // checked={template.status}
                        checked={template.status}
                        onChange={handleChangeNew}
                        color="primary"
                        data-testid="status-switch"
                        name="status"
                      />
                    </FormFieldController> */}

                    <Grid container>
                      <Grid item sm={12} md={3}>
                        Unit
                      </Grid>
                      <Grid item sm={12} md={9}>
                        <AutoComplete
                          suggestionList={[allOption, ...locations]}
                          name="Units"
                          keyName={"locationName"}
                          labelKey={"locationName"}
                          formData={template}
                          setFormData={setTemplate}
                          getSuggestionList={() =>
                            console.log("get suggestion list")
                          }
                          defaultValue={
                            template?.locationName?.length
                              ? template?.locationName
                              : []
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {preview ? (
                    <DynamicFormComponent />
                  ) : (
                    <>
                      {template.sections.map((item: any, index: any) => (
                        <>
                          <AuditSectionHeader
                            index={index}
                            title={item.title}
                            addSection={addSection}
                            removeSection={() =>
                              template.sections.length > 1 &&
                              removeSection(index)
                            }
                            onChange={(e: any) => handleSectionChange(e, index)}
                          />
                          <CustomDragAndDrop
                            index={index}
                            item={item}
                            setTemplate={setTemplate}
                            handleQuestionChange={handleQuestionChange}
                            changeSelect={setSelectOption}
                          />
                        </>
                      ))}
                    </>
                  )}
                </>
              </TemplateFormWrapper>
            </Box>
          </>
        )}
      </div>
    </>
  );
};

export default NewAuditTemplate;
