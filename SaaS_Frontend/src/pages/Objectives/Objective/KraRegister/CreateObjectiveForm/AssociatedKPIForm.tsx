import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Table,
  Pagination,
  Modal,
  Checkbox,
  Col,
  Row,
  Space,
  Tooltip,
} from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import axios from "../../../../../apis/axios.global";
import {
  Box,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputBase,
  makeStyles,
  TextField,
  Typography,
  Button,
  useMediaQuery,
} from "@material-ui/core";
import getAppUrl from "utils/getAppUrl";
import { MdRemoveCircleOutline } from "react-icons/md";
import {
  MdClose,
  MdOutlineClose,
  MdOutlineEdit,
  MdCheckCircleOutline,
} from "react-icons/md";
import SearchIcon from "assets/SearchIcon.svg";
import { AiOutlineAim, AiOutlineArrowsAlt } from "react-icons/ai";
import { MdOutlineContentCopy } from "react-icons/md";
import React from "react";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useSnackbar } from "notistack";
import checkRoles from "utils/checkRoles";

type Props = {
  formData?: any;
  setFormData?: any;
  scopeType?: any;
  setScopeType?: any;
  formType?: any;
  currentYear?: any;
  read?: any;
};

const useStyles = makeStyles((theme) => ({
  rangeInputBase: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #000",
    borderRadius: "4px",
    // paddingLeft: "30px",
    height: "40px",
    fontSize: "0.9rem",
    textAlign: "center",
    "& .MuiInputBase-root": {
      textAlign: "center",
    },
    "& .MuiInputBase-input": {
      textAlign: "center",
    },
  },
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  customCheckbox: {
    // Ensure the border is bolder
    "& .ant-checkbox-inner": {
      border: "2px solid black", // Thicker border
      backgroundColor: "transparent", // Ensure background is transparent
    },
    "&:hover .ant-checkbox-inner": {
      border: "2px solid black", // Maintain the thicker border on hover
      backgroundColor: "transparent", // Prevent background color change on hover
    },
    "& .ant-checkbox-input:focus + .ant-checkbox-inner": {
      borderColor: "black", // Maintain border color on focus as well
    },
  },
  inputBase: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #000",
    borderRadius: "4px",
    // paddingLeft: "30px",
    height: "40px",
    fontSize: "0.9rem",
    textAlign: "center",
    "& .MuiInputBase-root": {
      textAlign: "center",
    },
    "& .MuiInputBase-input": {
      textAlign: "center",
    },
  },
  iconButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  downloadIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "32px",
    height: "40px",
    marginRight: "30px",
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  tableContainerScrollable: {
    marginBottom: "20px",
    maxHeight: "500px",
    overflowY: "auto",
    overflowX: "hidden",
    paddingTop: "30px",
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      padding: "5px",
      color: "#00224E",
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      padding: "8px 10px !important",
      // fontFamily: "Poppins !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      borderBottom: "1px solid #f0f0f0",
      padding: "8px 10px !important",
    },
    "&::-webkit-scrollbar": {
      width: "5px",
      height: "10px", // Adjust the height value as needed
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
}));

const AssociatedKPIForm = ({
  formData,
  setFormData,
  scopeType,
  setScopeType,
  formType,
  currentYear,
  read,
}: Props) => {
  const smallScreen = useMediaQuery("(min-width:450px)");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>();
  const [editingKey, setEditingKey] = useState("");
  const [form] = Form.useForm();
  const classes = useStyles();
  const [modalVisible, setModalVisible] = useState(false);
  const [kpis, setKpis] = useState([]);
  const [selectedKpis, setSelectedKpis] = useState<any>([]);
  const realmName = getAppUrl();
  const [forceUpdate, setForceUpdate] = useState(false);
  const [selectAll, setSelectAll] = React.useState(false);
  const [removeAll, setRemoveAll] = React.useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [modalWidth, setModalWidth] = useState(900);
  const [orginal, setOriginal] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTargetData, setModalTargetData] = useState<
    Record<string, string>
  >({});
  const { enqueueSnackbar } = useSnackbar();
  const [targetOptions, setTargetOptions] = useState<string[]>([]);
  const [modalKpiId, setModalKpiId] = useState<any>();
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<any>([]);
  const [heads, setHeads] = useState<any[]>([]);
  const isUserSelected = selectedOwnerIds.some(
    (owner: any) => owner.id === userDetail.id
  );
  const isMCOE = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [targetType, setTargetType] = useState<any>();

  const getSelectowners = async () => {
    const result = await axios.get(
      `/api/kpi-definition/getOwners?locationId=${formData?.locationId}&entityId=${formData?.Scope}`
    );
    // console.log("result", result);
    if (result.data._id) {
      setSelectedOwnerIds(result.data.owner);
    } else {
      setSelectedOwnerIds([]);
    }
  };

  const isUserHead = heads.some((head) => head.id === userDetail.id);
  // console.log("formData in associated", formData);
  // console.log(
  //   "is mr",
  //   formData?.locationId,
  //   isMR
  //     ? userDetail.location.id === formData?.locationId ||
  //         (userDetail.additionalUnits.length > 0 &&
  //           userDetail.additionalUnits.includes(formData?.locationId))
  //     : false
  // );

  const getDHForEntity = async () => {
    const head = await axios.get(
      `/api/cara/getDeptHeadForEntity/${formData?.Scope}`
    );
    // console.log("head.data", head.data);
    if (head.data.length > 0) {
      setHeads(head.data);
    } else {
      setHeads([]);
    }
  };
  const showModal = async (kpiId: any, frequency: any, type: any) => {
    // console.log("inside showmodal", kpiId, frequency, type);
    setIsModalVisible(true);
    setModalKpiId(kpiId);
    setTargetType(type);
    if (kpiId) {
      const res = await axios.get(
        `api/kpi-definition/getPeriodTargetForKpi/${kpiId}/${frequency}`
      );
      // console.log("res,data", isMCOE, isMR);
      if (res.data) {
        // console.log("inside if");
        setModalTargetData(res.data);
        handleSetTargetOption(frequency);
        // setIsSubmitDisabled(false); // Enable submit button if data is not empty
      } else {
        // console.log("inside else");
        setModalTargetData({});
        // setIsSubmitDisabled(true); // Disable submit button if data is empty
      }
    }
  };
  const shouldDisableSubmitButton = () => {
    return !isMCOE || !isMR;
  };
  const handleInputChange = (option: any, value: any) => {
    setModalTargetData((prevData: any) => ({
      ...prevData,
      [option]: value,
    }));
  };
  // State to store the copy source
  const [copySource, setCopySource] = useState("");

  // Handler for copy to all button
  const handleCopyToAll = () => {
    if (copySource) {
      if (targetType === "Range") {
        //same functionality but field name is different
        const valueToCopy = modalTargetData[copySource] || "";
        if (copySource.includes("minTarget")) {
          targetOptions.forEach((option) => {
            handleInputChange(`${option}minTarget`, valueToCopy);
            handleInputChange(`${option}`, valueToCopy);
          });
        } else {
          targetOptions.forEach((option) => {
            handleInputChange(`${option}minTarget`, valueToCopy);
            handleInputChange(`${option}`, valueToCopy);
          });
        }
      } else {
        const valueToCopy = modalTargetData[copySource] || "";
        targetOptions.forEach((option) => {
          handleInputChange(option, valueToCopy);
        });
      }
    }
  };
  const handleSetTargetOption = (frequency: any) => {
    // console.log("frequency", frequency);
    switch (frequency) {
      case "MONTHLY":
        if (userDetail.organization.fiscalYearQuarters === "April - Mar") {
          setTargetOptions([
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
            "Jan",
            "Feb",
            "Mar",
          ]);
        } else {
          setTargetOptions([
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ]);
        }

        break;
      case "QUARTERLY":
        setTargetOptions(["Q1", "Q2", "Q3", "Q4"]);
        break;
      case "HALF-YEARLY":
        setTargetOptions(["H1", "H2"]);
        break;
      default:
        setTargetOptions([]);
    }
  };
  const validateTargetData = (
    data: Record<string, string>,
    targetType: string
  ): string[] => {
    const errors: string[] = [];

    // Loop through each entry in the data
    for (const [key, value] of Object.entries(data)) {
      // Check if the targetType is "Range" and the current key is a "minTarget"
      if (targetType === "Range" && key.endsWith("minTarget")) {
        const optionName = key.replace("minTarget", ""); // Remove 'minTarget' to get the base name
        const targetValue = data[optionName]; // Get the corresponding 'target' value

        // Validate minTarget
        if (value === null || value === undefined || value.trim() === "") {
          errors.push(
            `Minimum target value for ${optionName} is missing or empty.`
          );
        } else if (typeof value === "string" && !/^\d+(\.\d+)?$/.test(value)) {
          errors.push(
            `Invalid minimum target value for ${optionName}: ${value}`
          );
        }

        // Validate target (corresponding to minTarget)
        if (
          targetValue === null ||
          targetValue === undefined ||
          targetValue.trim() === ""
        ) {
          errors.push(`Target value for ${optionName} is missing or empty.`);
        } else if (
          typeof targetValue === "string" &&
          !/^\d+(\.\d+)?$/.test(targetValue)
        ) {
          errors.push(`Invalid target value for ${optionName}: ${targetValue}`);
        }

        // Check if minTarget is less than or equal to target
        if (parseFloat(value) > parseFloat(targetValue)) {
          errors.push(
            `Minimum target for ${optionName} cannot be greater than target.`
          );
        }
      }
      // If targetType is not "Range", validate only target values
      else if (
        targetType !== "Range" &&
        (value === null || value === undefined || value.trim() === "")
      ) {
        errors.push(`Target value for ${key} is missing or empty.`);
      } else if (typeof value === "string" && !/^\d+(\.\d+)?$/.test(value)) {
        errors.push(`Invalid target value for ${key}: ${value}`);
      }
    }

    return errors;
  };
  const handleSubmit = async (kpiId: any) => {
    const validationErrors = validateTargetData(modalTargetData, targetType);

    if (validationErrors.length > 0) {
      enqueueSnackbar(`${validationErrors}`, { variant: "error" });
      return;
    } else {
      await axios.post(
        `/api/kpi-definition/updatePeriodWiseRecord/${kpiId}`,
        modalTargetData
      );
    }

    setIsModalVisible(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      if (formType === "edit") {
        let combinedKpis = [...(formData?.associatedKpis || [])];

        if (!!formData?.ParentObjective) {
          try {
            const id = formData.ParentObjective._id;
            const parentKpisResponse = await axios.get(
              `/api/kpi-definition/getKpiForParentObj?id=${id}&scopeType=${formData?.ScopeType}&scope=${formData?.Scope}`
            );

            if (parentKpisResponse?.data?.result?.length > 0) {
              combinedKpis = [
                ...combinedKpis,
                ...parentKpisResponse?.data?.result,
              ];
            }
          } catch (error) {
            console.error("Error fetching parent KPIs:", error);
          }
        }

        // 🔁 Always deduplicate and sort, regardless of ParentObjective
        const uniqueKpis = [
          ...new Map(combinedKpis?.map((kpi) => [kpi.key, kpi])).values(),
        ];

        uniqueKpis.sort((a, b) => {
          const catA = a.catInfo?.ObjectiveCategory?.toLowerCase() || "";
          const catB = b.catInfo?.ObjectiveCategory?.toLowerCase() || "";

          if (catA === catB) {
            const kpiA = a.kpiInfo?.kpiName?.toLowerCase() || "";
            const kpiB = b.kpiInfo?.kpiName?.toLowerCase() || "";
            return kpiA.localeCompare(kpiB);
          }

          return catA.localeCompare(catB);
        });

        setSelectedKpis(uniqueKpis);
        setScopeType(formData.ScopeType);
      }
    };

    fetchData();
  }, [formType]);

  // console.log("organization data", userDetail);
  useEffect(() => {
    getKpis();
    getSelectowners();
    getDHForEntity();
    if (formType !== "edit") {
      getParentObjectiveKpis();
    }
  }, [
    formData?.Goals,
    formData?.Owner,
    scopeType,
    formData?.Scope,
    searchValue,
    formData?.ParentObjective,
  ]);
  const getUnitKpis = async () => {
    try {
      const result = await axios.get(
        `api/objective/getAllDeptKpisForUnitObj/${formData?._id}`
      );
      // console.log("result.data", result.data);

      if (result?.data) {
        setSelectedKpis(result?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // console.log("selectedKpis", selectedKpis);
  const getKpis = async (page: number = 1, pageSize: number = 10) => {
    let goalsArray = formData?.Goals;
    try {
      if (!Array.isArray(goalsArray)) {
        goalsArray = [goalsArray];
      }

      const queryString = goalsArray
        ?.map((goal: any) => `id=${goal}`)
        .join("&");
      const ownerQuery = `owner=${
        formData?.Owner ? formData?.Owner : userDetail.id
      }`;
      const res = await axios.get(
        `/api/kpi-definition/getAllKpiForObjective?${queryString}&${ownerQuery}&scopeType=${scopeType}&scope=${formData?.Scope}&searchText=${searchValue}`
      );
      // console.log("result", res.data?.result);
      if (res.data.result.length > 0) {
        setData(
          res.data.result.map((item: any, index: number) => ({
            ...item,
            key: item.kpiInfo._id,
          }))
        );
        setKpis(
          res.data.result?.map((kpi: any) => ({
            ...kpi,
            key: kpi.kpiInfo._id,
            kpiId: kpi.kpiInfo._id,
            kpiName: kpi.kpiInfo.kpiName,
            kpiTarget: kpi.kpiInfo.kpiTarget,
            kpiTargetType: kpi.kpiInfo.kpiTargetType,
            frequency: kpi.kpiInfo.frequency,
          }))
        );
        // setCount(res.data.count);
      } else {
        setKpis([]);
      }
    } catch (error) {
      console.log("error");
    }
  };
  // console.log("kpis origin", kpis);
  const getParentObjectiveKpis = async () => {
    try {
      // console.log("calling");
      if (!!formData.ParentObjective && formType !== "edit") {
        const parentObj = await axios.get(
          `/api/kpi-definition/getKpiForParentObj?id=${formData?.ParentObjective}&scopeType=${scopeType}&scope=${formData?.Scope}`
        );
        // console.log("parentObj", parentObj.data?.result);
        if (parentObj.data?.result?.length > 0) {
          setSelectedKpis(
            parentObj?.data?.result?.map((kpi: any) => ({
              ...kpi,
              key: kpi.kpiInfo?._id,
            }))
          );
          setFormData({
            ...formData,
            associatedKpis: parentObj?.data?.result?.map((kpi: any) => ({
              ...kpi,
              key: kpi.kpiInfo?._id,
            })),
          });
        }
      }
    } catch (error) {}
  };
  // console.log("associatedKpis", selectedKpis);
  const handleChangePage = (pageNumber: any, pageSize: any = rowsPerPage) => {
    setPage(pageNumber);
    setRowsPerPage(pageSize);
    getKpis(pageNumber, pageSize);
  };

  const isEditing = (record: any) => record.key === editingKey;

  const edit = (record: any) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: any, isRemove: boolean = false) => {
    try {
      if (isRemove) {
        const newData = selectedKpis?.filter((item: any) => key !== item.key);
        // console.log("newDatain remove", newData);
        setSelectedKpis(newData);

        const updatedAssociatedKpis = formData?.associatedKpis?.filter(
          (kpi: any) => kpi.kpiId !== key
        );
        setFormData({ ...formData, associatedKpis: updatedAssociatedKpis });
        try {
          // remove this objectiveId from kpi
          if (!!formData?._id) {
            const kpiToUpdate: any = await axios.patch(
              `api/kpi-definition/findKpiAndUpdateForObjectiveId/${key}/${formData?._id}`
            );
            if (kpiToUpdate?.status === 200) {
              enqueueSnackbar("Kpi Removed successfully", {
                variant: "success",
              });
            }
          }
        } catch (error) {
          console.error(`Failed to update KPI ${key}`, error);
        }

        return;
      }

      // console.log("key in save", key);
      const row: any = await form.validateFields();

      const newData: any = [...data];
      const index: any = newData.findIndex((item: any) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        // console.log("index, newData", index, newData);

        setData(newData);
        // setSelectedKpis([...new Set(newData.map((item: any) => item))]);
        setEditingKey("");
        handleUpdate(newData[index]);

        // const updatedAssociatedKpis = [
        //   ...formData.associatedKpis.filter((kpi: any) => kpi.kpiId !== key),
        //   { kpiId: row.key },
        // ].filter(
        //   (kpi, index, self) =>
        //     index === self.findIndex((t) => t.kpiId === kpi.kpiId)
        // );

        // setFormData({ ...formData, associatedKpis: updatedAssociatedKpis });
      } else {
        if (!newData.some((item: any) => item.key === row.key)) {
          newData.push(row);
        }
        setData(newData);
        setSelectedKpis([...new Set(newData.map((item: any) => item))]);
        setEditingKey("");

        const updatedAssociatedKpis = [
          ...formData.associatedKpis,
          { kpiId: row.key },
        ].filter(
          (kpi, index, self) =>
            index === self.findIndex((t) => t.kpiId === kpi.kpiId)
        );

        setFormData({ ...formData, associatedKpis: updatedAssociatedKpis });
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  // console.log("kpis", kpis);
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchValue(e.target.value);
  };
  const handleClickDiscard = () => {
    setSearchValue("");
    getKpis();
  };
  const handleSelectAllKPI = (e: CheckboxChangeEvent) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      // If "Select All" is checked, set all KPIs as selected
      setSelectedKpis(
        kpis?.map((kpi: any) => ({
          ...kpi,
          key: kpi.key,
        }))
      );
    }
    // } else {
    //   // If "Select All" is unchecked, clear all selections
    //   setSelectedKpis([]);
    // }
  };
  // const handleRemoveAllKPI = (e: CheckboxChangeEvent) => {
  //   setSelectAll(!e.target.checked);
  //   setRemoveAll(e.target.checked);
  //   if (e.target.checked) {
  //     // If "Remove All" is checked, set all KPIs as deselected
  //     setSelectedKpis([]);
  //   }
  // };
  const handleRemoveAllKPI = (e: CheckboxChangeEvent) => {
    setSelectAll(!e.target.checked); // Update selectAll state
    setRemoveAll(e.target.checked); // Update removeAll state

    if (e.target.checked) {
      // If "Remove All" is checked, deselect all KPIs except those with isFromParent: true
      const updatedKpis = selectedKpis.filter((kpi: any) => kpi.isFromParent);
      setSelectedKpis(updatedKpis); // Update selectedKpis to exclude those with isFromParent: true
    } else {
      setSelectedKpis([]);
    }
  };

  const handleUpdate = async (row: any) => {
    // console.log("handling update", row);
    const temp = {
      kpiType: row.kpiInfo.kpiType,
      kpiName: row.kpiInfo.kpiName,
      kpiTargetType: row.kpiTargetType,
      unitTypeId: row.kpiInfo.unitTypeId,
      uom: row.kpiInfo.unitOfMeasure,
      kpiTarget: row.kpiTarget,
      sourceId: row.kpiInfo.source,
      apiEndPoint: row.kpiInfo.query,
      kpiDescription: row.kpiInfo.description,
      locationId: row.kpiInfo.locationId,
      owner: row.kpiInfo.owner,
      keyFields: row.kpiInfo.keyFields,
      entityId: row.kpiInfo.entityId,
      category: row.kpiInfo.categoryId,
      frequency: row.kpiInfo.frequency,
      kpiMinimumTarget: row.kpiInfo.kpiMinimumTarget,
    };

    try {
      await axios.put(`/api/kpi-definition/updateKpi/${row.key}`, temp);

      const updatedAssociatedKpis = formData?.associatedKpis?.map(
        (kpi: any) => {
          if (kpi.kpiId === row.kpiInfo._id) {
            return {
              catInfo: row.catInfo,
              kpiInfo: {
                ...row.kpiInfo,
                kpiTarget: row.kpiTarget,
                kpiTargetType: row.kpiTargetType,
              },
              kpiId: row.key,
              key: row.key,
              kpiName: temp.kpiName,
              kpiTarget: row.kpiTarget,
              kpiTargetType: row.kpiTargetType,
            };
          }
          return kpi;
        }
      );
      // console.log("updated kpis", updatedAssociatedKpis);
      setFormData({
        ...formData,
        associatedKpis: updatedAssociatedKpis,
      });

      // setForceUpdate((prev) => !prev);
      setSelectedKpis(
        updatedAssociatedKpis?.map((kpi: any) => ({
          ...kpi,
          key: kpi.key,
        }))
      );
    } catch (err: any) {
      // console.log("err", err);
      if (err.response?.data?.message?.includes("Unique constraint failed")) {
        // console.error("KPI name exists");
      } else {
        // console.error("An error occurred");
      }
    }
  };

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }: any) => {
    const inputNode =
      inputType === "number" ? <Input type="number" /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required: true, message: `Please Input ${title}!` }]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };
  const half = Math.ceil(targetOptions.length / 2);
  const firstHalf = targetOptions.slice(0, half);
  const secondHalf = targetOptions.slice(half);

  const columns = [
    {
      title: "KPI Title",
      dataIndex: "kpiName",
      render: (_: any, record: any) => {
        return (
          <span
            onClick={() => {
              let url;
              if (
                process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")
              ) {
                url = `${process.env.REACT_APP_REDIRECT_URL}/caractionitemview`;
              } else {
                url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/caraactionitemview`;
              }
              const state = {
                locationId: record.kpiInfo.locationId,
                entityId: record?.kpiInfo?.entityId,
                kpiId: record?.kpiInfo?._id,
                kpiName: record?.kpiInfo?.kpiName,
                minDate: new Date("2023-04-01"),
                maxDate: new Date(),
              };

              sessionStorage.setItem("newTabState", JSON.stringify(state));
              setTimeout(() => {
                window.open("/dashboard/objective", "_blank");
              }, 600);
            }}
            style={{
              color: "black",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {record?.kpiInfo?.kpiName}
          </span>
        );
      },
    },
    {
      title: "Objective Category",
      dataIndex: "objectiveCategory",
      render: (_: any, record: any) => (
        <span>{record?.catInfo?.ObjectiveCategory}</span>
      ),
    },
    {
      title: "UoM",
      dataIndex: "uom",
      render: (_: any, record: any) => <span>{record?.kpiInfo?.uom}</span>,
    },
    {
      title: "Target type",
      dataIndex: "kpiTargetType",
      editable: true,
      render: (_: any, record: any) => (
        <span style={{ textAlign: "center", padding: "8px" }}>
          {record?.kpiInfo?.kpiTargetType}
        </span>
      ),
    },
    {
      title: "Target",
      dataIndex: "kpiTarget",
      editable: true,
      render: (_: any, record: any) => {
        const shouldShowIcon = ["MONTHLY", "QUARTERLY", "HALF-YEARLY"].includes(
          record?.kpiInfo?.frequency
        );
        // console.log("record data", record);
        return (
          <div
            style={{
              textAlign: "center",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {shouldShowIcon &&
              (record.isFromParent ? !record.isFromParent === true : true) && (
                <AiOutlineAim
                  onClick={() => {
                    showModal(
                      record.kpiInfo?._id,
                      record.kpiInfo?.frequency,
                      record?.kpiInfo?.kpiTargetType
                    );
                  }}
                  style={{ cursor: "pointer", marginRight: "8px" }}
                />
              )}
            {record?.kpiInfo?.kpiTarget}
          </div>
        );
      },
    },

    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        const shouldShowIcon = ["MONTHLY", "QUARTERLY", "HALF-YEARLY"].includes(
          record?.kpiInfo?.frequency
        );
        const isFutureYear = userDetail.organization.auditYear < currentYear;

        return (
          read !== false && (
            <Space>
              {!shouldShowIcon && editable && (
                <>
                  <MdCheckCircleOutline
                    onClick={() => save(record.key)}
                    style={{
                      fontSize: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                  />
                  <MdOutlineClose
                    onClick={cancel}
                    style={{
                      fontSize: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                  />
                </>
              )}

              {!shouldShowIcon && (
                <>
                  {isFutureYear ? (
                    <Tooltip
                      title={`Target edit will be enabled in ${currentYear}`}
                    >
                      <span>
                        <MdOutlineEdit
                          style={{
                            fontSize: "18px",
                            height: "18px",
                            color: "rgba(0, 0, 0, 0.25)",
                          }}
                        />
                      </span>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Edit KPI">
                      <MdOutlineEdit
                        onClick={() => edit(record)}
                        style={{
                          fontSize: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  )}
                </>
              )}
            </Space>
          )
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: any) => ({
        record,
        inputType: col.dataIndex === "kpiTarget" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleManageKpiClick = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSearchValue("");
    setModalWidth(900);
    setOriginal(true);
  };

  const handleKpiSelect = (selectedKpis: any[]) => {
    setSelectedKpis(selectedKpis);
  };

  const handleModalOk = () => {
    // console.log("kpi value", selectedKpis);
    const updatedAssociatedKpis = selectedKpis?.map((kpi: any) => ({
      ...kpi,
      key: kpi?.kpiInfo?._id,
    }));
    setFormData({ ...formData, associatedKpis: updatedAssociatedKpis });
    setCount(updatedAssociatedKpis.length);
    setModalVisible(false);
  };
  const handleExpandModal = () => {
    // setModalVisible(true);
    if (orginal) {
      // console.log("inside if");
      setModalWidth(900);
    } else {
      setModalWidth(1200);
    }
    setOriginal(!orginal);
  };
  // console.log("kpis", kpis);
  const renderKpiModal = () => (
    <Modal
      title="Select KPIs"
      visible={modalVisible}
      onOk={handleModalOk}
      onCancel={handleModalClose}
      width={modalWidth}
      closeIcon={
        <>
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "36px",
              height: "38px",
              cursor: "pointer",
            }}
          />
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          getKpis();
        }}
        style={{ display: "flex", alignItems: "center" }}
      >
        <TextField
          fullWidth
          name="search"
          value={searchValue}
          placeholder="Search KPI"
          onChange={handleSearchChange}
          style={{
            flex: 1, // Take remaining space
            marginRight: "20px",
          }}
          InputProps={{
            style: {
              fontWeight: "normal",
              fontSize: "15px",
              marginBottom: "5px",
            },
            startAdornment: (
              <InputAdornment position="start" className={classes.iconButton}>
                <img src={SearchIcon} alt="search" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {searchValue && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickDiscard}>
                      <MdClose fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )}
              </>
            ),
          }}
        />
        <Tooltip title="Click to Expand/Shrink">
          <AiOutlineArrowsAlt
            style={{
              fontSize: "24px",
              cursor: "pointer",
            }}
            onClick={handleExpandModal}
          />
        </Tooltip>
      </form>

      {/* <Row>
        <Col
          span={12}
          style={{
            borderRight: "1px solid #ddd",
            padding: "0 16px",
            maxHeight: "400px",
            overflowY: "auto",
            boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
            borderRadius: "5px",
            // position: "relative",
          }}
        >
          <h4 style={{ display: "inline-block" }}>KPIs</h4>
          <div style={{ position: "absolute", top: 1, right: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAllKPI}
                  //  color="primary"
                  className={`${classes.customCheckbox} `}
                  style={{
                    marginRight: "10px",
                    fontWeight: "bold",

                    // paddingTop: "20px",
                  }}
                />
              }
              label={
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  Add All
                </span>
              }
            />
          </div>
          {kpis?.map((kpi: any) => (
            <div key={kpi.key} style={{ padding: "8px 0" }}>
              <Checkbox
                className={`${classes.customCheckbox} `}
                checked={selectedKpis?.some(
                  (selectedKpi: any) => selectedKpi.key === kpi.key
                )}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKpis([...selectedKpis, kpi]);

                    // Add entire kpi object
                  } else {
                    setSelectedKpis(
                      selectedKpis?.filter(
                        (selectedKpi: any) => selectedKpi.key !== kpi.key
                      )
                    );
                  }
                }}
              >
                <Tooltip
                  title={
                    <React.Fragment>
                      <div>
                        <strong>Frequency:</strong> {kpi.kpiInfo?.frequency}
                      </div>
                      <div>
                        <strong>Category:</strong>
                        {kpi.catInfo?.ObjectiveCategory}
                      </div>
                    </React.Fragment>
                  }
                  placement="bottom"
                  arrow
                >
                  {kpi.kpiInfo?.kpiName}
                </Tooltip>
              </Checkbox>
            </div>
          ))}
        </Col>
        <Col
          span={12}
          style={{
            borderRight: "1px solid #ddd",
            padding: "0 16px",
            maxHeight: "400px",
            overflowY: "auto",
            boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
            borderRadius: "5px",
            paddingLeft: "10px",
          }}
        >
          <h4>Selected KPIs</h4>
          <div style={{ position: "absolute", top: 1, right: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={removeAll}
                  className={`${classes.customCheckbox} `}
                  onChange={handleRemoveAllKPI}
                  // color="primary"
                  style={{
                    marginRight: "10px",
                    fontWeight: "bold",
                    // paddingTop: "20px",
                  }}
                />
              }
              label={
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  Remove All
                </span>
              }
            />
          </div>
          {selectedKpis?.map((selectedKpi: any) => (
            <div key={selectedKpi.key} style={{ padding: "8px 0" }}>
              {selectedKpi.kpiInfo?.kpiName}

              <Tooltip title="Remove Kpi from selected">
                <MdRemoveCircleOutline
                  onClick={() => save(selectedKpi.key, true)}
                  style={{
                    fontSize: "18px",
                    height: "18px",
                    color: "blue",
                    paddingLeft: "10px",
                  }}
                />
              </Tooltip>
            </div>
          ))}
        </Col>
      </Row> */}
      <Row>
        <Col
          span={12}
          style={{
            borderRight: "1px solid #ddd",
            padding: "0 16px",
            maxHeight: "400px",
            overflowY: "auto",
            boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
            borderRadius: "5px",
          }}
        >
          <h4 style={{ display: "inline-block" }}>KPIs</h4>
          <div style={{ position: "absolute", top: 1, right: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAllKPI}
                  className={`${classes.customCheckbox} `}
                  style={{
                    marginRight: "10px",
                    fontWeight: "bold",
                  }}
                />
              }
              label={
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  Add All
                </span>
              }
            />
          </div>

          {kpis?.map((kpi: any) => (
            <div
              key={kpi.key}
              style={{
                padding: "8px 0",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Checkbox
                className={`${classes.customCheckbox} `}
                checked={selectedKpis?.some(
                  (selectedKpi: any) => selectedKpi.key === kpi.key
                )}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKpis([...selectedKpis, kpi]);
                  } else {
                    setSelectedKpis(
                      selectedKpis?.filter(
                        (selectedKpi: any) => selectedKpi.key !== kpi.key
                      )
                    );
                  }
                }}
                style={{ marginRight: "10px" }}
                disabled={kpi.isFromParent}
              />
              {/* First column: KPI Name */}
              <div style={{ flex: 2 }}>
                <Tooltip
                  title={
                    <React.Fragment>
                      <div>
                        <strong>Frequency:</strong> {kpi.kpiInfo?.frequency}
                      </div>
                      <div>
                        <strong>Category:</strong>{" "}
                        {kpi.catInfo?.ObjectiveCategory}
                      </div>
                    </React.Fragment>
                  }
                  placement="bottom"
                  arrow
                >
                  <span style={{ fontWeight: "bold" }}>
                    {kpi.kpiInfo?.kpiName}
                  </span>
                </Tooltip>
              </div>
              {/* Second column: Entity Name */}
              <div style={{ flex: 1 }}>
                <strong>{kpi.entityName}</strong>
              </div>
            </div>
          ))}
        </Col>
        <Col
          span={12}
          style={{
            borderRight: "1px solid #ddd",
            padding: "0 16px",
            maxHeight: "400px",
            overflowY: "auto",
            boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
            borderRadius: "5px",
            paddingLeft: "10px",
          }}
        >
          <h4>Selected KPIs</h4>
          <div style={{ position: "absolute", top: 1, right: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={removeAll}
                  className={`${classes.customCheckbox} `}
                  onChange={handleRemoveAllKPI}
                  style={{
                    marginRight: "10px",
                    fontWeight: "bold",
                  }}
                />
              }
              label={
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  Remove All
                </span>
              }
            />
          </div>
          {/* {selectedKpis?.map((selectedKpi: any) => (
            <div key={selectedKpi.key} style={{ padding: "8px 0" }}>
              {selectedKpi.kpiInfo?.kpiName}
              <Tooltip title="Remove Kpi from selected">
                <MdRemoveCircleOutline
                  onClick={() => save(selectedKpi.key, true)}
                  
                  style={{
                    fontSize: "18px",
                    height: "18px",
                    color: "blue",
                    paddingLeft: "10px",
                  }}
                />
              </Tooltip>
            </div>
          ))} */}
          {selectedKpis?.map((selectedKpi: any) => (
            <div
              key={selectedKpi.key}
              style={{
                padding: "8px 0",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ flex: 1 }}>{selectedKpi.kpiInfo?.kpiName}</span>

              {/* Conditionally render the Remove Icon based on `isParentFrom` */}
              {!!selectedKpi.isFromParent &&
              selectedKpi.isFromParent === true ? (
                <span
                  style={{
                    color: "#ccc",
                    cursor: "not-allowed",
                    paddingLeft: "10px",
                  }}
                >
                  {/* Disabled state - Visual indication */}
                  <MdRemoveCircleOutline
                    style={{
                      fontSize: "18px",
                      height: "18px",
                      color: "#ccc", // Greyed out if disabled
                      cursor: "not-allowed", // Show the "not-allowed" cursor
                      paddingLeft: "10px",
                    }}
                  />
                </span>
              ) : (
                <Tooltip title="Remove Kpi from selected">
                  <MdRemoveCircleOutline
                    onClick={() => save(selectedKpi.key, true)} // Your onClick handler
                    style={{
                      fontSize: "18px",
                      height: "18px",
                      color: "blue", // Active state
                      paddingLeft: "10px",
                      cursor: "pointer", // Ensure the pointer cursor
                    }}
                  />
                </Tooltip>
              )}
            </div>
          ))}
        </Col>
      </Row>
    </Modal>
  );
  const isButtonDisabled =
    !(isMR
      ? userDetail.location.id === formData?.locationId ||
        (userDetail.additionalUnits?.length > 0 &&
          userDetail.additionalUnits.includes(formData?.locationId))
      : false) &&
    !isUserHead &&
    !isMCOE;
  const isCreateButtonDisabled =
    !(isMR && userDetail.location.id === formData?.locationId) &&
    !isUserHead &&
    !isMCOE &&
    !isUserSelected;
  return (
    <>
      {
        // scopeType === "Department" &&
        smallScreen && (
          <Button
            disabled={formType === "edit" && !read}
            onClick={handleManageKpiClick}
            style={{ backgroundColor: "#003059", color: "white" }}
          >
            Manage KPIs
          </Button>
        )
      }
      {renderKpiModal()}
      <div className={classes.tableContainerScrollable}>
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            columns={mergedColumns}
            style={{ overflowY: "auto", maxHeight: "700px" }}
            dataSource={selectedKpis}
            pagination={false}
          />
        </Form>
      </div>
      <div className={classes.pagination}>
        <Pagination
          size="small"
          current={page}
          pageSize={rowsPerPage}
          total={count}
          showTotal={(total) => `Total ${total} items`}
          showSizeChanger
          showQuickJumper
          onChange={(page, pageSize) => {
            handleChangePage(page, pageSize);
          }}
        />
      </div>

      <Modal
        title={`Set Targets Here`}
        open={isModalVisible}
        width={750}
        bodyStyle={{
          overflowY: "auto",
        }}
        footer={null}
        onCancel={() => {
          setIsModalVisible(false);
          setModalTargetData({});
        }}
        maskClosable={true}
        centered={true}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        <div>
          <Box
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* First Row */}
            <Box display="flex" flexWrap="wrap">
              {firstHalf?.map((option) => {
                return (
                  <Box
                    key={option}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    flex="1 1 auto"
                    maxWidth="100px"
                    style={{ margin: "0 8px 8px 0" }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{
                        width: "100%",
                        backgroundColor: "#e8f3f9",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        marginBottom: "8px",
                        height: "30px",
                      }}
                    >
                      <Typography
                        variant="body2"
                        style={{ margin: 0, lineHeight: "40px" }}
                      >
                        {option}
                      </Typography>
                    </Box>

                    {targetType === "Range" ? (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        width="100%"
                      >
                        <>
                          <InputBase
                            className={classes.rangeInputBase}
                            value={modalTargetData[`${option}minTarget`] || ""}
                            onChange={(e) =>
                              handleInputChange(
                                `${option}minTarget`,
                                e.target.value
                              )
                            }
                            onFocus={() => setCopySource(`${option}minTarget`)}
                            placeholder={`min`}
                          />
                          <InputBase
                            className={classes.rangeInputBase}
                            value={modalTargetData[`${option}`] || ""}
                            onChange={(e) =>
                              handleInputChange(`${option}`, e.target.value)
                            }
                            onFocus={() => setCopySource(`${option}`)}
                            placeholder={`max`}
                          />
                        </>
                      </Box>
                    ) : (
                      <InputBase
                        className={classes.inputBase}
                        value={modalTargetData[option] || ""}
                        onChange={(e) =>
                          handleInputChange(option, e.target.value)
                        }
                        onFocus={() => setCopySource(option)}
                        // placeholder={`Set target for ${option}`}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Second Row */}
            <Box display="flex" flexWrap="wrap">
              {secondHalf.map((option) => {
                return (
                  <Box
                    key={option}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    flex="1 1 auto"
                    maxWidth="100px"
                    style={{ margin: "0 8px 8px 0" }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{
                        width: "100%",
                        backgroundColor: "#e8f3f9",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        marginBottom: "8px",
                        height: "30px",
                      }}
                    >
                      <Typography
                        variant="body2"
                        style={{ margin: 0, lineHeight: "40px" }}
                      >
                        {option}
                      </Typography>
                    </Box>

                    {targetType === "Range" ? (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        width="100%"
                      >
                        <>
                          <InputBase
                            className={classes.rangeInputBase}
                            value={modalTargetData[`${option}minTarget`] || ""}
                            onChange={(e) =>
                              handleInputChange(
                                `${option}minTarget`,
                                e.target.value
                              )
                            }
                            onFocus={() => setCopySource(`${option}minTarget`)}
                            placeholder={`min`}
                          />
                          <InputBase
                            className={classes.rangeInputBase}
                            value={modalTargetData[`${option}`] || ""}
                            onChange={(e) =>
                              handleInputChange(`${option}`, e.target.value)
                            }
                            onFocus={() => setCopySource(`${option}`)}
                            placeholder={`max`}
                          />
                        </>
                      </Box>
                    ) : (
                      <InputBase
                        className={classes.inputBase}
                        value={modalTargetData[option] || ""}
                        onChange={(e) =>
                          handleInputChange(option, e.target.value)
                        }
                        onFocus={() => setCopySource(option)}
                        // placeholder={`Set target for ${option}`}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            <div>
              <Tooltip title="Copy to All">
                <IconButton
                  onClick={handleCopyToAll}
                  style={{ padding: "0px" }}
                  disabled={
                    !isMCOE &&
                    !(isMR
                      ? userDetail.location.id === formData?.locationId ||
                        (userDetail.additionalUnits.length > 0 &&
                          userDetail.additionalUnits.includes(
                            formData?.locationId
                          ))
                      : false)
                  }
                >
                  <MdOutlineContentCopy />
                </IconButton>
              </Tooltip>
            </div>
          </Box>

          <div style={{ textAlign: "right", paddingTop: "10px" }}>
            <Button
              color="primary"
              onClick={() => {
                handleSubmit(modalKpiId);
              }}
              variant="contained"
              disabled={isButtonDisabled}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssociatedKPIForm;
