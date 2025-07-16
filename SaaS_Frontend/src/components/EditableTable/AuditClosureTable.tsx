import { useState, useEffect, useRef } from "react";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { MdInfo } from "react-icons/md";
import Typography from "@material-ui/core/Typography";
import { Typography as antdTypography, Card, Checkbox } from "antd";
import { MdEdit, MdDelete, MdCheckBox } from "react-icons/md";
import { Table as AntdTable } from "antd";

import {
  InputBase,
  IconButton,
  Select,
  MenuItem,
  Box,
  Tooltip,
  useMediaQuery,
  Grid,
  CardContent,
} from "@material-ui/core";
import { auditCreationForm, auditFormData } from "../../recoil/atom";
import { useRecoilState } from "recoil";
import { cloneDeep, clone } from "lodash";
import { useStyles } from "./styles";
import { useParams } from "react-router-dom";
import { addAttachment, getAuditById } from "../../apis/auditApi";
import { useLocation } from "react-router";
import EmptyIcon from "../../assets/EmptyTableImg.svg";
import checkRole from "../../utils/checkRoles";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import { getAllClauses } from "apis/clauseApi";
import { Button, Descriptions, Modal, Space, Upload, UploadFile } from "antd";

import { FiUpload } from "react-icons/fi";
import { AiOutlineDelete, AiOutlinePaperClip } from "react-icons/ai";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import getAppUrl from "utils/getAppUrl";
import ReferencesResultPage from "pages/ReferencesResultPage";
import DocumentViewerAudit from "../../pages/AuditorProfile/DocumentViewer";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { MdOutlineWarning } from "react-icons/md";
import EditSvgIcon from "../../assets/icons/Edit.svg";
import DeleteSvgIcon from "../../assets/icons/Delete.svg";

type Props = {
  disabled: boolean;
  refForReportForm22?: any;
  refForReportForm23?: any;
  refForReportForm24?: any;
  auditTypes?: any;
};

/**
 * This is a table component which has a feature for editing and deleting rows inside the table itself
 *
 */
function AuditClosureTable({
  disabled,
  auditTypes,
  refForReportForm22,
  refForReportForm23,
  refForReportForm24,
}: Props) {
  const { Text } = antdTypography;

  const classes = useStyles();
  const [data, setData] = useState<any>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<any>({});
  const [editIndex, setEditIndex] = useState<any>(null);
  const [index, setIndex] = useState<any>();
  const [value, setValue] = useState<any>();
  const [isEvidenceModal, setIsEvidenceModal] = useState<boolean>(false);
  const [clauses, setClauses] = useState([{}]);
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);
  const [formData, setFormData] = useRecoilState<any>(auditFormData);
  const { id } = useParams();
  const location: any = useLocation();
  const isAuditor = checkRole("AUDITOR");
  const isLocAdmin = checkRole("LOCATION-ADMIN");
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const isMr = checkRole("MR");
  const [optionData, setOptionData] = useState([]);
  const [entityData, setEntityData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [allClauses, setAllClause] = useState<any>([]);
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [fileLinkCi, setFileLinkCi] = useState<any>();
  const [certifiOpen, setCertifiOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [auditTypeData, setAuditTypeData] = useState<any>();
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [impactType, setImpactType] = useState([]);
  const inputRef = useRef<any>(null);
  const matches = useMediaQuery("(min-width:786px)");

  // const [impactOptions, setImpactOptions] = useState([]);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const realmName = getAppUrl();

  const { enqueueSnackbar } = useSnackbar();
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };
  useEffect(() => {
    getLogo();
    getOptionData();
    fetchAllClauses();
    getentityData();
    getAllImpact();
    const findData = auditTypes?.find(
      (item: any) => item?.id === formData?.auditType
    );
    setAuditTypeData(findData);
    location?.state?.moveToLast && getAuditData(id!);
    const clausesHeaderData = parseClauses(formData?.auditedClauses);
    setClauses(clausesHeaderData);
  }, []);

  useEffect(() => {
    const value = getTableData(template);
    setData(value);
  }, [template]);

  /**
   * @description headers array which describes the names of the table headers and the functions which are associated with it. Options can be
   * changed based on the features required in that particular field
   */
  const getAllImpact = async () => {
    const response = await axios.get(`/api/audit-settings/getAllImpact`);
    setImpactType(
      response.data.map((item: any) => ({
        id: item?._id,
        impactType: item.impactType,
        lable: item?.impactType,
        value: item?.impactType,
        impact: item.impact || [],
      }))
    );
  };

  const fetchAllClauses = () => {
    const data = formData.system;
    const selectedClauses = formData?.auditedClauses?.map(
      (value: any) => value?.item?.id
    );

    if (selectedClauses?.includes("All")) {
      getAllClauses(`${data}`).then((response: any) => {
        // Check if response.data is an array before mapping
        const mappedData: any = response.data.map((item: any) => ({
          // id: item.id,
          // clauseName: item.name,
          // clauseNumber: item.number,
          label: item?.name,
          value: item?.name,
          id: item?.id,
          clauseName: item?.name,
          name: item?.name,
          number: item?.number,
          clauseNumber: item?.number,
        }));

        setAllClause(mappedData);
      });
    } else {
      const parsedClause = formData.auditedClauses.map((clause: any) => {
        return {
          label: clause.item?.name,
          value: clause.item?.name,
          id: clause.item?.id,
          clauseName: clause.item?.name,
          name: clause.item?.name,
          number: clause.item?.number,
          clauseNumber: clause.item?.number,
        };
      });
      setAllClause(parsedClause);
    }
  };

  const getOptionData = async () => {
    try {
      const res = await axios.get(
        `/api/audit-settings/getAuditReportOptionData/${formData.auditType}`
      );

      const data = res.data.map((value: any) => {
        return {
          label: value.findingType,
          value: value.findingType,
          selectClause: value.selectClause,
          findingTypeId: value.findingTypeId, // Assuming this is unique
        };
      });

      setOptionData(data);
    } catch (error) {}
  };

  const getentityData = async () => {
    try {
      setEntityData([]);
      const findData = auditTypes.find(
        (item: any) => item.id === formData?.auditType
      );

      const res = await axios.get(
        `/api/audit-settings/getDepartmentForAudit?scope=${findData?.scope.id}&location=${formData?.location}`
      );

      const data = res.data
        .map((value: any) => ({
          label: value?.value, // Fixed typo from "lable" to "label"
          value: value?.value,
          id: value?.id,
        }))
        .filter(
          (obj: any, index: any, self: any) =>
            index === self.findIndex((item: any) => item?.id === obj?.id)
        );

      setEntityData(data);
    } catch (error) {}
  };

  const getUserData = async (entityId: any) => {
    const res = await axios.get(
      `/api/audit-settings/getuserFromDept/${entityId}`
    );
    const data = res.data.map((value: any) => {
      return {
        label: value.lable,
        value: value.value,
        id: value.id, // Assuming this is unique
      };
    });
    setUserData(data || []);
  };

  const header1 = [
    // {
    //   name: "questionNumber",
    //   label: "Question No.",
    //   options: {
    //     editable: false,
    //   },
    // },
    {
      name: "title",
      label: "Checkpoint",
      options: {
        editable: true,
      },
    },
    {
      name: "type",
      label: "Findings",
      options: {
        editable: true,
        select: true,
        selectOptions:
          // [
          // { label: "NC", value: "NC" },
          // { label: "Observation", value: "Observation" },
          // { label: "OFI", value: "OFI" },
          optionData,
        // ],
      },
    },
    {
      name: "comment",
      label: "Findings Details",
      options: {
        editable: true,
      },
    },
    {
      name: "clause",
      label: "Requirement No",
      checkSelected: true,
      options: {
        editable: true,
        select: true,
        selectOptions: allClauses,
      },
    },

    // {
    //   name: "severity",
    //   label: "Severity",
    //   options: {
    //     editable: true,
    //     select: true,
    //     selectOptions: [
    //       { label: "Major", value: "Major" },
    //       { label: "Minor", value: "Minor" },
    //     ],
    //   },
    // },
    // {
    //   name: "reference",
    //   label: "Reference",
    //   options: {
    //     editable: true,
    //   },
    // },

    // {
    //   name: "entity",
    //   label: "Department",
    //   options: {
    //     editable: auditTypeData?.multipleEntityAudit===true?true:false,
    //     select: auditTypeData?.multipleEntityAudit && true,
    //     selectOptions: entityData,
    //   },
    // },
    // {
    //   name: "responsiblePerson",
    //   label: "Responsible Person",
    //   options: {
    //     editable: auditTypeData?.multipleEntityAudit===true?true:false,
    //     select: auditTypeData?.multipleEntityAudit && true,
    //     selectOptions: userData,
    //   },
    // },
  ];

  const header2 = [
    // {
    //   name: "questionNumber",
    //   label: "Question No.",
    //   options: {
    //     editable: false,
    //   },
    // },
    {
      name: "title",
      label: "Checkpoint",
      options: {
        editable: true,
      },
    },
    {
      name: "type",
      label: "Findings",
      options: {
        editable: true,
        select: true,
        selectOptions:
          // [
          // { label: "NC", value: "NC" },
          // { label: "Observation", value: "Observation" },
          // { label: "OFI", value: "OFI" },
          optionData,
        // ],
      },
    },
    {
      name: "comment",
      label: "Findings Details",
      options: {
        editable: true,
      },
    },
    {
      name: "clause",
      label: "Requirement No",
      checkSelected: true,
      options: {
        editable: true,
        select: true,
        selectOptions: allClauses,
      },
    },

    // {
    //   name: "impactType",
    //   lable: "impactType",
    //   options: {
    //     editable: true,
    //     selectOptions: impactType,
    //   },
    // },

    // {
    //   name: "severity",
    //   label: "Severity",
    //   options: {
    //     editable: true,
    //     select: true,
    //     selectOptions: [
    //       { label: "Major", value: "Major" },
    //       { label: "Minor", value: "Minor" },
    //     ],
    //   },
    // },
    // {
    //   name: "reference",
    //   label: "Reference",
    //   options: {
    //     editable: true,
    //   },
    // },

    {
      name: "entity",
      label: "Department",
      options: {
        editable: auditTypeData?.multipleEntityAudit === true ? true : false,
        select: auditTypeData?.multipleEntityAudit && true,
        selectOptions: entityData,
      },
    },
    {
      name: "responsiblePerson",
      label: "Responsible Person",
      options: {
        editable: auditTypeData?.multipleEntityAudit === true ? true : false,
        select: auditTypeData?.multipleEntityAudit && true,
        selectOptions: userData,
      },
    },
  ];

  const headers =
    auditTypeData?.multipleEntityAudit === true ? header2 : header1;
  /**
   * @description This function is used to get the data from the recoil state and parse it to the table
   * @param array - The data array which is to be parsed to the table
   * @returns array   {modified array of objects}
   * @memberof AuditClosureTable
   */
  function getTableData(sections: any) {
    const arr: any = [];
    sections?.forEach((section: any, index: number) => {
      for (let s = 0; s < section?.sections?.length; s++) {
        for (let i = 0; i < section?.sections[s]?.fieldset.length; i++) {
          const nc = section?.sections[s]?.fieldset[i].nc;
          if (
            nc !== null &&
            nc !== undefined &&
            nc !== "undefined" &&
            nc?.type !== ""
          ) {
            if (Object?.keys(nc)?.length > 0) {
              arr.push({
                checklistNumber: `${index}`,
                title: section?.sections[s]?.fieldset[i]?.title ?? "-",
                questionNumber: `${index.toString()}.${s}.${i.toString()}`,
                comment: nc?.comment,
                clause:
                  (nc?.clause?.clauseName || nc?.clause?.[0]?.clauseName) ??
                  "-",
                entity: nc?.entity?.entityName || "",
                responsiblePerson: nc?.responsiblePerson?.name || "",
                entityDetails: nc?.entity,
                severity: nc?.severity ?? "-",
                impactType: nc?.impactType ?? "",
                impactOptions: nc?.impactOptions ?? [],
                impact: nc?.impact ?? [],
                highPriority: nc?.highPriority ?? false,
                type: nc?.type,
                evidence: nc?.evidence || [],
                reference: nc?.reference || [],
                statusClause: nc?.statusClause,
              });
            }
          }
        }
      }
    });
    return arr;
  }

  /**
   * @method handleEditChange
   * @description Function to handle editing inside the clauses table
   * @param e {any}
   * @param i {number}
   * @returns nothing
   */
  // const handleEditChange = (e: any, field: string, i: number) => {
  //   console.log(
  //     "inside auditClosureTable handleEditChange",
  //     [...data],
  //     template
  //   );
  //   setEditValue({ ...editValue, [field]: e.target.value });
  //   const newData: any = [...data];
  //   newData[i][field] = e.target.value;
  //   setData(newData);
  // };

  /**
   * @method submitHandler - This function is used to submit the edited data to the recoil state
   * @param i {number} - index number
   * @param qId {number}  - question number
   * @returns nothing
   * @memberof AuditClosureTable
   */
  const submitHandler = (index: number, qId: string) => {
    const [checklistId, sectionId, questionId] = qId.split(".");
    if (isEditing) {
      const copyOfState: any = cloneDeep(template);
      const oldNC: any =
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"];
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"] = {
        ...oldNC,
        ...editValue,
      };
      setTemplate(copyOfState);
      getTableData(template.sections);
      setVisible(!visible);
    }

    if (editValue.title) {
      const copyOfState: any = cloneDeep(template);
      const oldNC: any = (copyOfState[checklistId].sections[
        parseInt(sectionId)
      ].fieldset[parseInt(questionId)].title = editValue.title);

      setTemplate(copyOfState);
      getTableData(template.sections);
    }

    if (!isEditing) setVisible(true);

    setIsEditing((prev) => !prev);
    setEditIndex(index);
    setEditValue({});
  };

  const openEvidenceModal = () => {
    setIsEvidenceModal(true);
  };
  /**
   * @method selectHandler
   * @description This function is used to handle the select option inside the table
   * @param e {any} - event
   * @param field {string} - field name
   * @param qId {string} - question number
   * @returns nothing
   * @memberof AuditClosureTable
   */
  const selectHandler = (e: any, field: string, qId: string, qName: string) => {
    let data: any = e.target.value as string;

    if (field === "comment") {
      const [checklistId, sectionId, questionId] = qId.split(".");
      const copyOfState: any = cloneDeep(template);
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].comment = e.target.value;
      setTemplate(copyOfState);
      setEditValue({ ...editValue, [field]: e.target.value });
    }

    if (field === "title") {
      const [checklistId, sectionId, questionId] = qId.split(".");
      const copyOfState: any = cloneDeep(template);
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ].title = e.target.value;
    }

    if (field === "type") {
      const setStatus: any = optionData.filter(
        (value: any) => value.value === e.target.value
      );
      const status = setStatus[0].selectClause;
      if (setStatus.length > 0) {
        const [checklistId, sectionId, questionId] = qId.split(".");

        const copyOfState: any = cloneDeep(template);
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].statusClause = setStatus[0].selectClause;
        if (status === false) {
          copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
            parseInt(questionId)
          ]["nc"].clause = "";
        }
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].type = e.target.value;
        setTemplate(copyOfState);
      } else {
        const [checklistId, sectionId, questionId] = qId.split(".");
        const copyOfState: any = cloneDeep(template);
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].type = e.target.value;
        setTemplate(copyOfState);
      }
    } else {
      if (field === "clause") {
        const cluased = formData.auditedClauses.map(
          (value: any) => value?.item?.id
        );
        if (!cluased.includes("All")) {
          const clauseObject = formData?.auditedClauses?.find(
            (clause: any) => clause.item.name === data
          );

          const newClauseObject = {
            id: clauseObject?.item?.id,
            clauseNumber: clauseObject?.item?.number,
            clauseName: clauseObject?.item?.name,
          };

          data = clone(newClauseObject);
        } else {
          const clauseObject = allClauses?.find(
            (clause: any) => clause.clauseName === data
          );

          const newClauseObject = {
            id: clauseObject?.id,
            clauseNumber: clauseObject?.number,
            clauseName: clauseObject?.name,
          };
          data = clone(newClauseObject);
        }
      }

      if (field === "entity") {
        const entityFindData: any = entityData.find(
          (item: any) => item.value == e.target.value
        );

        // if (!cluased.includes("All")) {
        //   const clauseObject = formData?.auditedClauses?.find(
        //     (clause: any) => clause.item.name === data
        //   );

        //   const newClauseObject = {
        //     id: clauseObject?.item?.id,
        //     clauseNumber: clauseObject?.item?.number,
        //     clauseName: clauseObject?.item?.name,
        //   };

        //   data = clone(newClauseObject);
        // } else {
        //   const clauseObject = allClauses?.find(
        //     (clause: any) => clause.clauseName === data
        //   );
        const [checklistId, sectionId, questionId] = qId.split(".");
        const copyOfState: any = cloneDeep(template);
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ].responsiblePerson = {};
        setUserData([]);
        const entityObject = {
          id: entityFindData?.id,
          entityName: entityFindData?.value,
          name: entityFindData?.value,
        };
        getUserData(entityFindData?.id);
        data = clone(entityObject);
        // }
      }

      if (field === "responsiblePerson") {
        const entityFindData: any = userData.find(
          (item: any) => item.value == e.target.value
        );

        const userObject = {
          id: entityFindData?.id,
          userEmail: entityFindData?.value,
          name: entityFindData?.value,
        };
        data = clone(userObject);
      }
      if (field === "impactType") {
        const impactTypeData: any = impactType.find(
          (item: any) => item.value == e.target.value
        );

        const userObject = {
          id: impactTypeData?.id,
          userEmail: impactTypeData?.value,
          name: impactTypeData?.value,
          impact: impactTypeData?.impact,
        };
        data = clone(userObject);
      }

      const [checklistId, sectionId, questionId] = qId.split(".");
      const copyOfState: any = cloneDeep(template);
      // if (parseInt(checklistId) > 0) {
      if (field === "title") {
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ].title = data;
        setTemplate(copyOfState);
      } else {
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"][field] = data;
        setTemplate(copyOfState);
      }
      // } else {
      //   enqueueSnackbar("Additional Fields cannot be added", {
      //     variant: "warning",
      //   });
      // }
    }
  };

  const handleRemoveReferenceNew = (file: any, index: any) => {
    const [checklistId, sectionId, questionId] = index.split(".");
    const copyOfState: any = JSON.parse(JSON.stringify(template));
    const data =
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].reference;

    const filteredData = data?.filter((value: any) => value._id !== file._id);
    copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
      parseInt(questionId)
    ]["nc"].reference = filteredData;
    setTemplate(copyOfState);
    setSelectedData([]);
  };
  /**
   * @method handleDelete
   * @description Function to delete a clause using handleDelete
   * @param i {number}
   */
  const handleDelete = (qId: string) => {
    const [checklistId, sectionId, questionId] = qId.split(".");

    const copyOfState: any = cloneDeep(template);
    copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
      parseInt(questionId)
    ]["nc"] = {};

    setTemplate(copyOfState);
    const value = getTableData(template.sections);
    setData(value);
  };

  /**
   * @method parseClauses
   * @description This function is used to parse the clauses to the select options
   * @param clauses {any} - clauses
   * @returns array - array of objects
   * @memberof AuditClosureTable
   */
  const parseClauses = (clauses: any[]) => {
    return clauses?.map((item: any) => {
      return {
        label: item?.item?.name,
        value: item?.item?.name,
      };
    });
  };
  /**
   * @method setClausesAndDocuments
   * @description Function to insert clauses and documents suggestion list
   * @param formData {any}
   * @returns nothing
   */
  const setClausesAndDocuments = (formData: any) => {
    const parsedClause = formData.auditedClauses.map((clause: any) => {
      return {
        item: clause,
      };
    });
    const parsedDocuments = formData.auditedDocuments.map((doc: any) => {
      return {
        item: doc,
      };
    });

    setFormData((prev: any) => {
      return {
        ...prev,
        auditedClauses: parsedClause,
        auditedDocuments: parsedDocuments,
      };
    });

    setClauses(parseClauses(parsedClause));
  };

  /**
   * @method getAuditData
   * @description Function to fetch audit data when an audit is opened in edit mode
   * @param id {string}
   * @returns nothing
   */
  const getAuditData = (id: string) => {
    getAuditById(id).then((res: any) => {
      setClausesAndDocuments(res?.respond);
    });
  };

  const newEvidence = {
    text: "",
    attachment: [],
    refernce: [],
  };

  const addEvidence = (index: any) => {
    const [checklistId, sectionId, questionId] = index.split(".");
    const copyOfState: any = cloneDeep(template);
    const data =
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence;

    if (data === undefined) {
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence = [newEvidence];
      setTemplate(copyOfState);
    } else {
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence = [...data, newEvidence];
      setTemplate(copyOfState);
    }
  };

  const handleManageEvidence = (
    index: any,
    indexOfEvidence: any,
    name: any,
    value: any
  ) => {
    const [checklistId, sectionId, questionId] = index.split(".");
    const copyOfState: any = cloneDeep(template);

    // copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
    //   parseInt(questionId)
    // ]["nc"].evidence[indexOfEvidence];

    if (name === "text") {
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence[indexOfEvidence].text = value.target.value;

      setTemplate(copyOfState);
    }
  };

  const handleChange =
    (index: any, indexOfEvidence: any, qno: number) =>
    (info: UploadChangeParam<UploadFile<any>>) => {
      // Handle the change event here
      const [checklistId, sectionId, questionId] = index.split(".");
      const copyOfState: any = JSON.parse(JSON.stringify(template));
      const data =
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].evidence[indexOfEvidence].attachment;
      if (data !== undefined) {
        const formData = new FormData();
        const fileToAdd =
          (info.file as UploadFile<any>).originFileObj || (info.file as RcFile);
        formData.append("file", fileToAdd);
        addAttachment(
          formData,
          realmName,
          loggedInUser.location.locationName
        ).then((response: any) => {
          const attachmentData = [
            {
              uid: generateUniqueId(10),
              name: response?.data.name,
              url: response?.data.path,
              status: "done",
            },
          ];
          const data =
            copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
              parseInt(questionId)
            ]["nc"].evidence[indexOfEvidence].attachment;
          // = attachmentData;
          const finalData = [...data, ...attachmentData];

          // copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          //   parseInt(questionId)
          // ]["nc"].attachment = finalData;
          setTemplate((prev: any) => {
            copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
              parseInt(questionId)
            ]["nc"].evidence[indexOfEvidence].attachment = finalData;
            return copyOfState;
          });
        });
      } else {
        const formData = new FormData();
        const fileToAdd =
          (info.file as UploadFile<any>).originFileObj || (info.file as RcFile);
        formData.append("file", fileToAdd);

        addAttachment(
          formData,
          realmName,
          loggedInUser.location.locationName
        ).then((response: any) => {
          const attachmentData = [
            {
              uid: generateUniqueId(10),
              name: response?.data.name,
              url: response?.data.path,
              status: "done",
            },
          ];
          copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
            parseInt(questionId)
          ]["nc"].evidence[indexOfEvidence].attachment = attachmentData;
          setTemplate(copyOfState);
        });
      }
    };
  const handleRefernce = (indexMain: any, selectedData: any) => {
    const [checklistId, sectionId, questionId] = indexMain.split(".");
    const copyOfState: any = JSON.parse(JSON.stringify(template));
    const data =
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].reference;

    if (data !== undefined) {
      // copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
      //   parseInt(questionId)
      // ]["nc"].attachment = finalData;
      const refernceData =
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].reference;

      const finalData = [...refernceData, ...selectedData];
      setTemplate((prev: any) => {
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].reference = finalData;
        return copyOfState;
      });
    } else {
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].reference = selectedData;
      setTemplate(copyOfState);
    }
    setSelectedData([]);
    setIsModalVisible(false);
  };

  const handleOk = () => {
    handleRefernce(currentQuestionNumber, selectedData);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const redirectToGlobalSearch = () => {
    setIsModalVisible(true);
  };

  const handlerCloseCertifiModal = () => {
    setCertifiOpen(false);
  };

  const handleRemoveAttachment: any = (
    file: any,
    indexOfEvidence: any,
    index: any
  ) => {
    const [checklistId, sectionId, questionId] = index.split(".");
    const copyOfState: any = JSON.parse(JSON.stringify(template));
    const data =
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence[indexOfEvidence].attachment;

    const filteredData = data?.filter((value: any) => value.uid !== file.uid);
    copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
      parseInt(questionId)
    ]["nc"].evidence[indexOfEvidence].attachment = filteredData;
    setTemplate(copyOfState);
  };

  const handleModuleData = (data: any) => {
    let url;

    if (data.hasOwnProperty("documentNumbering")) {
      // http://test.localhost:3000/processdocuments/viewdoc/clt6ojklr0000ura4b1qu0t33?versionId=B === doc
      url = `/processdocuments/viewdoc/${data.id}?versionId=${data?.version}`;
      // navigate(
      //   `/processdocuments/viewdoc/${data?.id}?versionId=${data?.version}&version=true`
      // );
      window.open(url, "_blank");
    } else if (data.hasOwnProperty("severity")) {
      url = `/audit/nc/${data?.id}`;
      window.open(url, "_blank");
    } else if (data.hasOwnProperty("type") && data.type === "HIRA") {
      const encodedJobTitle = encodeURIComponent(data?.jobTitle);
      url = `/risk/riskregister/HIRA/${encodedJobTitle}`;
      window.open(url, "_blank");
    }
  };

  const nameConstruct = (data: any) => {
    if (data?.hasOwnProperty("documentNumbering")) {
      return data?.documentNumbering;
    } else if (data?.hasOwnProperty("type")) {
      return data?.name;
    } else if (data?.jobTitle) {
      return data?.jobTitle;
    }
  };

  const handleRemoveReference = (
    file: any,
    indexOfEvidence: any,
    index: any
  ) => {
    const [checklistId, sectionId, questionId] = index.split(".");
    const copyOfState: any = JSON.parse(JSON.stringify(template));
    const data =
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence[indexOfEvidence].reference;

    const filteredData = data?.filter((value: any) => value._id !== file._id);
    copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
      parseInt(questionId)
    ]["nc"].evidence[indexOfEvidence].reference = filteredData;
    setTemplate(copyOfState);
    setSelectedData([]);
  };

  const columns = [
    {
      title: "Evidence",
      dataIndex: "text",
      key: "text",
      width: 500, // Set a fixed width for the Evidence column
      render: (text: string, record: any, index: number) =>
        isEditing ? (
          <InputBase
            multiline
            name="evidence"
            onChange={(e) =>
              handleManageEvidence(value?.questionNumber, index, "text", e)
            }
            value={text}
            style={{
              width: "100%",
              borderBottom: "1px solid rgb(18, 3, 3)",
              padding: "4px 8px",
              outline: "none",
            }}
          />
        ) : (
          <Text>{text}</Text>
        ),
    },
    {
      title: "Attachment",
      key: "attachment",
      render: (_: any, record: any, index: number) => (
        <Space direction="vertical">
          {record.attachment?.map((file: any) => (
            <div key={file.uid} className="attachment-item">
              <AiOutlinePaperClip />
              <Text
                onClick={() => {
                  setFileLinkCi(file);
                  setCertifiOpen(true);
                }}
                style={{
                  fontSize: "11px",
                  cursor: "pointer",
                  color: "#1890ff",
                }}
              >
                {file?.name?.length > 20
                  ? `${file?.name.substring(0, 20)}...`
                  : file?.name}
              </Text>
              {isEditing && (
                <Button
                  type="text"
                  size="small"
                  icon={<AiOutlineDelete />}
                  onClick={() =>
                    handleRemoveAttachment(file, index, value?.questionNumber)
                  }
                  disabled={disabled}
                />
              )}
            </div>
          ))}
          {isEditing && (
            <Upload
              action={""}
              accept=".jpeg,.png,.jpg,.JPEG,.PNG,.JPG"
              onChange={handleChange(value?.questionNumber, index, value)}
              showUploadList={false}
            >
              <Button icon={<FiUpload />} disabled={disabled}>
                Upload
              </Button>
            </Upload>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      {matches ? (
        <>
          {data.length > 0 ? (
            <TableContainer
              component={Paper}
              elevation={0}
              variant="outlined"
              ref={refForReportForm22}
            >
              <Table stickyHeader className={classes.table}>
                <TableHead>
                  <TableRow>
                    {headers?.map((item: any) => (
                      <TableCell key={item}>
                        <Typography
                          variant="body2"
                          className={classes.tableHeaderColor}
                        >
                          {item?.label}
                        </Typography>
                      </TableCell>
                    ))}
                    {/* <TableCell>High Priority</TableCell> */}
                    {impactType.length > 0 && (
                      <>
                        {/* <TableCell>Impact Type</TableCell> */}

                        <TableCell>
                          <Typography
                            variant="body2"
                            className={classes.tableHeaderColor}
                          >
                            Impact{" "}
                          </Typography>
                        </TableCell>
                      </>
                    )}
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody
                  style={{
                    color: "#003566",
                    backgroundColor: "white",
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                >
                  {data?.map((val: any, i: number) => {
                    return (
                      <TableRow key={i}>
                        {headers?.map((item: any) =>
                          item.name === "reference" ? (
                            <TableCell className={classes.tableCell} key={item}>
                              {isEditing && editIndex === i ? (
                                <>
                                  <Button
                                    icon={<FiUpload />}
                                    disabled={disabled}
                                    style={{
                                      marginTop: "10px",
                                      marginLeft: "15px",
                                    }}
                                    onClick={() => {
                                      setSelectedData([]);
                                      redirectToGlobalSearch();
                                      setCurrentQuestionNumber(
                                        val?.questionNumber
                                      );
                                    }}
                                  >
                                    Upload Reference
                                  </Button>
                                  <div>
                                    <Space direction="vertical">
                                      {val[item.name]?.map((file: any) => (
                                        <div
                                          key={file._id}
                                          className="ant-upload-list-item-container"
                                        >
                                          <div className="ant-upload-list-item ant-upload-list-item-done">
                                            <Space>
                                              <AiOutlinePaperClip />
                                              <Tooltip title={file}>
                                                <Typography
                                                  className="ant-upload-list-item-name"
                                                  onClick={() => {
                                                    handleModuleData(file);
                                                  }}
                                                  style={{
                                                    fontSize: "11px",
                                                    cursor: "pointer",
                                                    color: "blue",
                                                  }}
                                                >
                                                  {nameConstruct(file).length >
                                                  20
                                                    ? `${nameConstruct(
                                                        file
                                                      ).substring(0, 20)}...`
                                                    : nameConstruct(file)}
                                                </Typography>
                                              </Tooltip>
                                              <Button
                                                title="Remove file"
                                                type="text"
                                                value={file.uid}
                                                size="small"
                                                disabled={disabled}
                                                onClick={() => {
                                                  handleRemoveReferenceNew(
                                                    file,
                                                    val?.questionNumber
                                                  );
                                                }}
                                                icon={<AiOutlineDelete />}
                                              />
                                            </Space>
                                          </div>
                                        </div>
                                      ))}
                                    </Space>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <Space direction="vertical">
                                    {val[item.name]?.map((file: any) => (
                                      <div
                                        key={file._id}
                                        className="ant-upload-list-item-container"
                                      >
                                        <div className="ant-upload-list-item ant-upload-list-item-done">
                                          <Space>
                                            <AiOutlinePaperClip />
                                            <Tooltip title={file}>
                                              <Typography
                                                className="ant-upload-list-item-name"
                                                onClick={() => {
                                                  handleModuleData(file);
                                                }}
                                                style={{
                                                  fontSize: "11px", // Adjust the font size as needed
                                                  cursor: "pointer",
                                                  color: "blue",
                                                }}
                                              >
                                                {nameConstruct(file).length > 20
                                                  ? `${nameConstruct(
                                                      file
                                                    ).substring(0, 20)}...`
                                                  : nameConstruct(file)}
                                              </Typography>
                                            </Tooltip>
                                            <Button
                                              title="Remove file"
                                              type="text"
                                              value={file.uid}
                                              size="small"
                                              disabled={disabled}
                                              onClick={() => {
                                                handleRemoveReferenceNew(
                                                  file,
                                                  val?.questionNumber
                                                );
                                              }}
                                              icon={<AiOutlineDelete />}
                                            />
                                          </Space>
                                        </div>
                                      </div>
                                    ))}
                                  </Space>
                                </div>
                              )}
                            </TableCell>
                          ) : item.name !== "evidence" ? (
                            <TableCell className={classes.tableCell} key={item}>
                              {item?.options.editable &&
                              (val.statusClause === true &&
                              item.name === "clause"
                                ? true
                                : item.name !== "clause"
                                ? true
                                : false) &&
                              isEditing &&
                              editIndex === i ? (
                                item?.options?.select ? (
                                  <>
                                    <Select
                                      fullWidth
                                      onChange={(e: any) => {
                                        return selectHandler(
                                          e,
                                          item?.name,
                                          val?.questionNumber,
                                          val?.questionName
                                        );
                                      }}
                                      value={val[item.name]}
                                      style={{ fontSize: "12px" }}
                                    >
                                      {item?.options?.selectOptions.map(
                                        (
                                          option: { label: string; value: any },
                                          index: number
                                        ) => {
                                          return (
                                            <MenuItem
                                              key={index}
                                              value={option?.value}
                                            >
                                              {option?.label}
                                            </MenuItem>
                                          );
                                        }
                                      )}
                                    </Select>
                                  </>
                                ) : (
                                  <InputBase
                                    className={classes.editField}
                                    multiline
                                    name={item.name}
                                    onChange={(e: any) => {
                                      // handleEditChange(e, item.name, i)
                                      return selectHandler(
                                        e,
                                        item?.name,
                                        val?.questionNumber,
                                        val?.title
                                      );
                                    }}
                                    value={val[item.name]}
                                  />
                                )
                              ) : val[item?.name]?.length > 50 ? (
                                <Tooltip title={val[item?.name]}>
                                  <p
                                    style={{
                                      // color: "#003566",
                                      fontFamily:
                                        "poppinsregular, sans-serif !important",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {val[item?.name].substring(0, 50) + "..."}
                                  </p>
                                </Tooltip>
                              ) : (
                                <p
                                  style={{
                                    // color: "#003566",
                                    fontFamily:
                                      "poppinsregular, sans-serif !important",
                                    fontSize: "14px",
                                  }}
                                >
                                  {val[item?.name]}
                                </p>
                              )}
                            </TableCell>
                          ) : (
                            <TableCell></TableCell>
                          )
                        )}
                        {/* <TableCell className={classes.tableCell}>
                      <Checkbox checked={val.highPriority} />
                    </TableCell> */}
                        {impactType.length > 0 && (
                          <>
                            {/* <TableCell className={classes.tableCell}>
                          {val?.impactType?.name}
                        </TableCell> */}
                            <TableCell className={classes.tableCell}>
                              <p
                                style={{
                                  // color: "#003566",
                                  fontFamily:
                                    "poppinsregular, sans-serif !important",
                                  fontSize: "14px",
                                }}
                              >
                                {val?.impact
                                  ?.map((item: any) => item)
                                  .join(" , ")}
                              </p>
                            </TableCell>
                          </>
                        )}
                        <TableCell className={classes.actionButtonTableCell}>
                          {
                            val.highPriority && (
                              //  <IconButton
                              //     style={{ padding: "4px", minWidth: "unset" }} // Reduced padding
                              //     onClick={() => {
                              //       setIndex(i);
                              //       setValue(val);
                              //       openEvidenceModal();
                              //     }}
                              //     disabled={disabled}
                              //   >
                              <MdOutlineWarning style={{ color: "red" }} />
                            )

                            // </IconButton>
                          }

                          <IconButton
                            disabled={disabled}
                            onClick={() => {
                              submitHandler(i, val?.questionNumber);
                              setIndex(i);
                              setValue(val);
                            }}
                            ref={refForReportForm23}
                            style={{ padding: "4px", minWidth: "unset" }}
                          >
                            {isEditing && editIndex === i ? (
                              <MdCheckBox />
                            ) : (
                              <MdEdit style={{ fontSize: "18px" }} />
                            )}
                          </IconButton>

                          <IconButton
                            disabled={disabled}
                            onClick={() => handleDelete(val.questionNumber)}
                            style={{
                              padding: "4px",
                              minWidth: "unset",
                              fontSize: "16px",
                            }}
                          >
                            <MdDelete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              pt={2}
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
            >
              <img src={EmptyIcon} alt="empty table" />
              <Typography variant="body2" color="textSecondary">
                Let’s begin by adding NC/Observation Summary
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <>
          <Grid container spacing={2}>
            {data.map((val: any, index: any) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid #ccc",
                  }}
                  bodyStyle={{ padding: 0, borderRadius: "0 0 8px 8px" }}
                >
                  {/* Card Header */}
                  <Box
                    style={{
                      backgroundColor: "#a3c2e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    <Typography
                      style={{
                        color: "#000",
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      {val.title}{" "}
                      {val.highPriority && (
                        <MdInfo style={{ color: "red", fontSize: "20px" }} />
                      )}
                    </Typography>
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <IconButton
                        style={{ padding: "0px", margin: "0px" }}
                        disabled={disabled}
                        onClick={() => {
                          submitHandler(index, val?.questionNumber);
                          setIndex(index);
                          setValue(val);
                        }}
                      >
                        <img
                          src={EditSvgIcon}
                          alt="edit"
                          style={{ width: "20px", height: "20px" }}
                        />
                      </IconButton>
                      <IconButton
                        style={{ padding: "0px", margin: "0px" }}
                        disabled={disabled}
                        onClick={() => handleDelete(val.questionNumber)}
                      >
                        <img
                          src={DeleteSvgIcon}
                          alt="edit"
                          style={{ width: "20px", height: "20px" }}
                        />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Card Content */}
                  <CardContent style={{ padding: "8px" }}>
                    <Grid container spacing={1}>
                      {headers.map((item, i) => (
                        <Grid
                          item
                          xs={12}
                          key={i}
                          style={{ display: "flex", gap: "6px" }}
                        >
                          <Typography
                            style={{ fontWeight: "bold", fontSize: "14px" }}
                          >
                            {item.label}:
                          </Typography>
                          <Typography style={{ fontSize: "14px" }}>
                            {val[item.name] || "N/A"}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Modal
        title={
          <div className={classes.header}>
            {logo && (
              <img
                src={logo}
                height={"50px"}
                width={"70px"}
                style={{ marginRight: "15px" }}
              />
            )}
            <span>Search Results</span>
          </div>
        }
        width={800}
        style={{ top: 100, right: 250 }}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Submit
          </Button>,
        ]}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        bodyStyle={{ overflow: "hidden" }}
      >
        <div>
          {/* <div style={{ position: "absolute", top: 10, left: 10 }}>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search"
            />
          </div> */}

          <ReferencesResultPage
            searchValue={""}
            selected={selectedData}
            setSelected={setSelectedData}
            isModalVisible={isModalVisible}
          />
        </div>
      </Modal>
      <Modal
        title={fileLinkCi?.name || "No Name"}
        open={certifiOpen}
        onCancel={handlerCloseCertifiModal}
        footer={null}
        width="400px"
      >
        <div>
          <DocumentViewerAudit fileLink={fileLinkCi?.url} status={false} />
        </div>
      </Modal>
      <Modal
        title="Details"
        visible={visible}
        onCancel={() => {
          setVisible(false);
          setIsEditing((prev) => !prev);
          setEditIndex(index);
          setEditValue({});
        }}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        width={1050}
      >
        {data?.map((val: any, i: any) =>
          editIndex === i ? (
            <>
              <Descriptions
                bordered
                column={matches ? 2 : 1}
                key={i}
                style={{
                  minWidth: matches ? "800px" : "auto",
                  maxWidth: matches ? "900px" : "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                <Descriptions.Item
                  label="Checkpoint"
                  labelStyle={{
                    color: "#003566",
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                  contentStyle={{
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                >
                  {/* {val.title} */}
                  {isEditing && editIndex === i ? (
                    <InputBase
                      className={classes.editField}
                      multiline
                      name={val.title}
                      onChange={(e: any) => {
                        // handleEditChange(e, item.name, i)
                        return selectHandler(
                          e,
                          "title",
                          val?.questionNumber,
                          val?.title
                        );
                      }}
                      value={val?.title}
                    />
                  ) : (
                    val.title
                  )}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Findings"
                  labelStyle={{
                    color: "#003566",
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                  contentStyle={{
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                >
                  {isEditing && editIndex === i ? (
                    <Select
                      onChange={(e) =>
                        selectHandler(
                          e,
                          "type",
                          val?.questionNumber,
                          val?.questionName
                        )
                      }
                      value={val.type}
                      style={{ width: "100%" }}
                    >
                      {optionData?.map((option: any, index: any) => (
                        <MenuItem key={index} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    val.type
                  )}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Findings Details"
                  span={2}
                  labelStyle={{
                    color: "#003566",
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                  contentStyle={{
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                >
                  {isEditing && editIndex === i ? (
                    <InputBase
                      className={classes.editField}
                      multiline
                      name={val.comment}
                      onChange={(e: any) => {
                        // handleEditChange(e, item.name, i)
                        return selectHandler(
                          e,
                          "comment",
                          val?.questionNumber,
                          val?.title
                        );
                      }}
                      value={val?.comment}
                    />
                  ) : (
                    val.title
                  )}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Requirement No"
                  labelStyle={{
                    color: "#003566",
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                  contentStyle={{
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                >
                  {isEditing && editIndex === i ? (
                    <Select
                      onChange={(e) =>
                        selectHandler(
                          e,
                          "clause",
                          val?.questionNumber,
                          val?.title
                        )
                      }
                      value={val.clause}
                      style={{ width: "100%" }}
                    >
                      {allClauses?.map((option: any, index: any) => (
                        <MenuItem key={index} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    val.clause
                  )}
                </Descriptions.Item>
                {/* <Descriptions.Item label="Reference">
                {isEditing && editIndex === i ? (
                  <>
                    <Button
                      icon={<FiUpload />}
                      onClick={() => {
                        redirectToGlobalSearch();
                        setCurrentQuestionNumber(val?.questionNumber);
                      }}
                    >
                      Upload Reference
                    </Button>
                    <Space direction="vertical">
                      {val.reference?.map((file: any) => (
                        <Space key={file._id}>
                          <AiOutlinePaperClip />
                          <antdTypography.Text
                            style={{ cursor: "pointer", color: "blue" }}
                            onClick={() => handleModuleData(file)}
                          >
                            {file.name.length > 20
                              ? `${file.name.substring(0, 20)}...`
                              : file.name}
                          </antdTypography.Text>
                          <Button
                            type="text"
                            icon={<AiOutlineDelete />}
                            onClick={() =>
                              handleRemoveReferenceNew(
                                file,
                                val?.questionNumber
                              )
                            }
                          />
                        </Space>
                      ))}
                    </Space>
                  </>
                ) : (
                  <Space direction="vertical">
                    {val.reference?.map((file: any) => (
                      <Space key={file._id}>
                        <AiOutlinePaperClip />
                        <antdTypography.Text
                          style={{ cursor: "pointer", color: "blue" }}
                          onClick={() => handleModuleData(file)}
                        >
                          {file.name.length > 20
                            ? `${file.name.substring(0, 20)}...`
                            : file.name}
                        </antdTypography.Text>
                      </Space>
                    ))}
                  </Space>
                )}
              </Descriptions.Item> */}
                <Descriptions.Item
                  label="High Priority"
                  labelStyle={{
                    color: "#003566",
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                  contentStyle={{
                    fontFamily: "poppinsregular, sans-serif !important",
                    fontSize: "14px",
                  }}
                >
                  {/* <Switch
                  checked={val.highPriority}
                  onChange={(checked) => {
                    const event = {
                      target: {
                        name: "highPriority", // Custom name
                        value: checked, // Checked state as value
                      },
                    };
                    selectHandler(
                      event,
                      "highPriority",
                      val?.questionNumber,
                      val?.questionName
                    );

                    // toggleFeature(event.target.value, val?.questionNumber); // Example usage
                  }}
                /> */}
                  <Checkbox
                    checked={val.highPriority}
                    onChange={(e) => {
                      const event = {
                        target: {
                          name: "highPriority",
                          value: e.target.checked, // Checked state as value
                        },
                      };
                      selectHandler(
                        event,
                        "highPriority",
                        val?.questionNumber,
                        val?.questionName
                      );
                    }}
                  />
                </Descriptions.Item>
                {impactType.length > 0 && (
                  <>
                    <Descriptions.Item
                      label="Impact Type"
                      labelStyle={{
                        color: "#003566",
                        fontFamily: "poppinsregular, sans-serif !important",
                        fontSize: "14px",
                      }}
                      contentStyle={{
                        fontFamily: "poppinsregular, sans-serif !important",
                        fontSize: "14px",
                      }}
                    >
                      <Select
                        onChange={(e) =>
                          selectHandler(
                            e,
                            "impactType",
                            val?.questionNumber,
                            val?.questionName
                          )
                        }
                        value={val?.impactType?.name}
                        style={{ width: "100%" }}
                      >
                        {impactType?.map((option: any, index: any) => (
                          <MenuItem key={index} value={option.value}>
                            {option.lable}
                          </MenuItem>
                        ))}
                      </Select>
                    </Descriptions.Item>
                    <Descriptions.Item
                      label="Impact"
                      labelStyle={{
                        color: "#003566",
                        fontFamily: "poppinsregular, sans-serif !important",
                        fontSize: "14px",
                      }}
                      contentStyle={{
                        fontFamily: "poppinsregular, sans-serif !important",
                        fontSize: "14px",
                      }}
                    >
                      <Select
                        onChange={(e) =>
                          selectHandler(
                            e,
                            "impact",
                            val?.questionNumber,
                            val?.questionName
                          )
                        }
                        multiple
                        value={val?.impact || []}
                        style={{ width: "100%" }}
                      >
                        {val?.impactType?.impact?.map(
                          (option: any, index: any) => (
                            <MenuItem key={index} value={option}>
                              {option}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </Descriptions.Item>
                  </>
                )}
                {auditTypeData?.multipleEntityAudit === true && (
                  <>
                    <Descriptions.Item
                      label="Department"
                      labelStyle={{
                        color: "#003566",
                        fontFamily: "poppinsregular, sans-serif !important",
                        fontSize: "14px",
                      }}
                      contentStyle={{
                        fontFamily: "poppinsregular, sans-serif !important",
                        fontSize: "14px",
                      }}
                    >
                      <Select
                        onChange={(e) =>
                          selectHandler(
                            e,
                            "entity",
                            val?.questionNumber,
                            val?.questionName
                          )
                        }
                        value={val.entity}
                        style={{ width: "100%" }}
                      >
                        {entityData?.map((option: any, index: any) => (
                          <MenuItem key={index} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </Descriptions.Item>
                    <Descriptions.Item
                      label="Responsible Person"
                      labelStyle={{
                        color: "#003566",
                        fontFamily: "poppinsregular, sans-serif !important",
                        fontSize: "14px",
                      }}
                      contentStyle={{
                        fontFamily: "poppinsregular, sans-serif !important",
                        fontSize: "14px",
                      }}
                    >
                      <Select
                        onChange={(e) =>
                          selectHandler(
                            e,
                            "responsiblePerson",
                            val?.questionNumber,
                            val?.questionName
                          )
                        }
                        value={val.responsiblePerson}
                        style={{ width: "100%" }}
                      >
                        {userData?.map((option: any, index: any) => (
                          <MenuItem key={index} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </Descriptions.Item>
                  </>
                )}
                {matches ? (
                  <Descriptions.Item
                    label="Evidence"
                    span={2}
                    labelStyle={{
                      color: "#003566",
                      fontFamily: "poppinsregular, sans-serif !important",
                      fontSize: "14px",
                    }}
                    contentStyle={{
                      fontFamily: "poppinsregular, sans-serif !important",
                      fontSize: "14px",
                    }}
                  >
                    {isEditing && editIndex === i && (
                      <Button
                        type="primary"
                        style={{ marginBottom: "16px" }}
                        onClick={() => addEvidence(val?.questionNumber)}
                      >
                        Add Evidence
                      </Button>
                    )}
                    <AntdTable
                      dataSource={val?.evidence || []}
                      className={classes.newTableContainer}
                      columns={columns}
                      pagination={false}
                      rowKey={(_, index) => `evidence-${index}`}
                      bordered
                    />
                  </Descriptions.Item>
                ) : (
                  ""
                )}
                {matches ? (
                  <Descriptions.Item
                    style={{ textAlign: "right" }}
                    labelStyle={{
                      color: "#003566",
                      fontFamily: "poppinsregular, sans-serif !important",
                      fontSize: "14px",
                    }}
                    contentStyle={{
                      fontFamily: "poppinsregular, sans-serif !important",
                      fontSize: "14px",
                    }}
                  >
                    <Button
                      type="primary"
                      onClick={() => submitHandler(i, val?.questionNumber)}
                      // style={{color:'#124c78',backgroundColor:'#feffff'}}
                    >
                      Save
                    </Button>
                  </Descriptions.Item>
                ) : (
                  ""
                )}
              </Descriptions>
              {matches ? (
                ""
              ) : (
                <>
                  {isEditing && editIndex === i && (
                    <Button
                      type="primary"
                      style={{ marginBottom: "16px" }}
                      onClick={() => addEvidence(val?.questionNumber)}
                    >
                      Add Evidence
                    </Button>
                  )}
                  <AntdTable
                    dataSource={val?.evidence || []}
                    className={classes.newTableContainer}
                    columns={columns}
                    pagination={false}
                    rowKey={(_, index) => `evidence-${index}`}
                    bordered
                  />
                </>
              )}
              {matches ? (
                ""
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="primary"
                    onClick={() => submitHandler(i, val?.questionNumber)}
                    // style={{color:'#124c78',backgroundColor:'#feffff'}}
                  >
                    Save
                  </Button>
                </div>
              )}
            </>
          ) : null
        )}
      </Modal>
    </>
  );
}

export default AuditClosureTable;
