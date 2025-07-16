import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Select,
  Button,
  Modal,
  Spin,
  Table,
  Pagination,
  PaginationProps,
} from "antd";
import axios from "../../../../../apis/axios.global";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import {
  IconButton,
  makeStyles,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import checkRoles from "utils/checkRoles";
import { useSnackbar } from "notistack";
import { getEntityByLocationId } from "apis/entityApi";
import SearchBar from "components/SearchBar";
import { MdOutlineCheckCircle } from "react-icons/md";

import { MdCheckCircle } from "react-icons/md";
import { validateTitle } from "utils/validateInput";

type Props = {
  addModalOpen?: any;
  setAddModalOpen?: any;
  fetchObjectives?: any;
  ObjectiveId?: any;
  formType?: string;
  formData?: any;
  setFormData?: any;
  activityNew?: any;
  setActivityNew?: any;
  setIdentityDateNew?: any;
  referencesNew?: any;
  setReferencesNew?: any;
  handleObjectiveFormCreated?: any;
  details?: any;
  setDetails?: any;
  currentYear?: any;
  scopeType?: any;
  setScopeType?: any;
  handleCloseModal?: any;
  read?: any;
};

const useStyles = makeStyles((theme) => ({
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the <label> element
    },
  },
  tableContainer: {
    // Table Header Styles
    // "& .ant-table-thead > tr > th": {
    //   backgroundColor: "#E8F3F9", // Set the table header background color to yellow
    // },
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      padding: "4px 12px",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    // Table Body Styles
    "& .ant-table-tbody > tr > td": {
      // border: "0.5px solid #E6E8EA", // Add a border around each table body cell
      padding: "2px 12px", // Adjust the padding as needed
      height: "50px", // Set the height of the table cells
    },
    // "& tr.ant-table-row:nth-child(odd)": {
    //   backgroundColor: "#F5F5F5", // Odd row color
    // },
    // "& tr.ant-table-row:nth-child(even)": {
    //   backgroundColor: "#FFFFFF", // Even row color
    // },
  },
}));

const CreateObjectiveForm = ({
  addModalOpen,
  setAddModalOpen,
  fetchObjectives,
  ObjectiveId,
  formType,
  formData,
  setFormData,
  activityNew,
  setActivityNew,
  setIdentityDateNew,
  referencesNew,
  setReferencesNew,
  handleObjectiveFormCreated,
  details,
  setDetails,
  currentYear,
  scopeType,
  setScopeType,
  handleCloseModal,
  read,
}: Props) => {
  const smallScreen = useMediaQuery("(min-width:450px)");
  const [firstForm] = Form.useForm();
  const [objNameList, setObjNameList] = useState<any[]>([]);
  const [milestoneList, setMileStoneList] = useState<any>();
  const [user, setUser] = useState<any[]>([]);
  const [OwnersList, setOwnerList] = useState<any[]>([]);
  const [systemTypes, setSystemTypes] = useState<any[]>([]);

  const [systemType, setSystemType] = useState<any>([]);
  const [year, setYear] = useState<any[]>([]);
  const [scopeList, setScopeList] = useState<any>();
  const [options, setOptions] = useState<any>();
  const [typeOptions, setTypeOptions] = useState<any>([
    // {
    //   value: "Department",
    //   label: "Department",
    // },
    // {
    //   value: "Unit",
    //   label: "Unit",
    // },
  ]);
  const [readAcces, setReadAccess] = useState<boolean>(false);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [Owner, setOwner] = useState<any>(userDetail.id);

  const classes = useStyles();
  const [goals, setGoals] = useState<any[]>([]);

  const { TextArea } = Input;
  const { enqueueSnackbar } = useSnackbar();
  const isMR = checkRoles("MR") && !!userDetail?.location?.id;
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetail?.location?.id;
  const handleObjectiveSelect = (objective: any) => {
    if (selectedModalObjective?.value === objective._id) {
      // Deselect if already selected
      setSelectedModalObjective({ value: "", label: "" });
      setFormData((prevData: any) => ({
        ...prevData,
        ParentObjective: null,
      }));
    } else {
      // Select the objective
      setSelectedModalObjective({
        value: objective._id,
        label: objective.ObjectiveName,
      });
      setFormData((prevData: any) => ({
        ...prevData,
        ParentObjective: objective._id,
      }));
    }
  };

  useEffect(() => {
    if (!!ObjectiveId && formType === "edit") {
      fetchObjectiveById();
      // getObjectiveNamesAndMileStonePeriod();
    }
    checkUserPermissions();
  }, [addModalOpen, formType]);

  useEffect(() => {
    getUserById(formData?.Owner, scopeType);
  }, [formData?.Owner, scopeType]);
  // console.log("formdata", formData?.Owner);
  useEffect(() => {
    // console.log("firstForm", handleObjectiveFormCreated);

    if (handleObjectiveFormCreated) {
      handleObjectiveFormCreated(firstForm);
      getSystemTypes();
      getAllUser();
      getObjectiveYear();
      // getObjectiveNamesAndMileStonePeriod();
      getAllGoals();
    }
  }, []);
  const getSystemTypes = async () => {
    try {
      // await axios
      //   .get(`/api/organization/systemtype/${realmName}`)
      //   .then((res: any) => {
      //     console.log("res.data", res.data);
      //     setSystemTypes(
      //       res?.data.map((obj: any) => ({
      //         value: obj.id,
      //         label: obj.name,
      //       }))
      //     );
      //   });
      const encodedLoc = encodeURIComponent(JSON.stringify("All"));

      const response = await axios.get(
        `/api/systems/displayAllSystemsForOrg/${encodedLoc}`
        // `/api/systems/displayAllSystemsForOrg/All`
      );
      setSystemTypes(
        response?.data.map((obj: any) => ({
          value: obj.id,
          label: obj.name,
        }))
      );
      // console.log("systemtypes in get", systemTypes);
    } catch (error) {
      return error;
    }
  };
  // const validateTitle = (
  //   rule: any,
  //   value: string,
  //   callback: (error?: string) => void
  // ) => {
  //   // Define regex pattern for allowed characters
  //   // const normalizedValue = value.trim().replace(/\s+/g, " ");
  //   const TITLE_REGEX =
  //     /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,\?&%!#@€£`'"\~]+$/; // Allows letters, numbers, and specific symbols, but does not include < and >

  //   // Check for disallowed characters
  //   const DISALLOWED_CHARS = /[<>]/;

  //   // Check for more than two consecutive special characters
  //   const MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS =
  //     /[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\,\s]{3,}/;

  //   // Check if the title starts with a special character
  //   const STARTS_WITH_SPECIAL_CHAR =
  //     /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]/;

  //   if (!value || value.trim().length === 0) {
  //     callback("Text value is required.");
  //   } else if (DISALLOWED_CHARS.test(value)) {
  //     callback("Invalid text. Disallowed characters are < and >.");
  //   } else if (MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS.test(value)) {
  //     callback(
  //       "Invalid text. No more than two consecutive special characters are allowed."
  //     );
  //   } else if (STARTS_WITH_SPECIAL_CHAR.test(value)) {
  //     callback("Invalid text. Text should not start with a special character.");
  //   } else if (!TITLE_REGEX.test(value)) {
  //     callback(
  //       "Invalid text. Allowed characters include letters, numbers, commas, slashes, hyphens, dots, and currency symbols."
  //     );
  //   } else {
  //     callback();
  //   }
  // };
  // console.log("options", options);
  const checkUserPermissions = async () => {
    // console.log("checkuserpermissions called");

    // console.log("isMCOE", isMCOE);
    const access = await axios.get(`api/kpi-definition/checkUser`);
    if (isMR || isMCOE) {
      setTypeOptions([
        {
          value: "Department",
          label: "Department",
        },
        {
          value: "Unit",
          label: "Unit",
        },
      ]);
    } else if (access.data?.dh.length > 0) {
      setTypeOptions([
        {
          value: "Department",
          label: "Department",
        },
      ]);
    } else if (userDetail?.userType === "globalRoles") {
      setTypeOptions([
        {
          value: "Department",
          label: "Department",
        },
        {
          value: "Unit",
          label: "Unit",
        },
      ]);
    } else {
      setTypeOptions([
        {
          value: "Department",
          label: "Department",
        },
      ]);
    }
    // if (!(access.data?.dh.length > 0) || !isMR || !isMCOE) {
    //   enqueueSnackbar("you are not allowed to create an Objective", {
    //     variant: "error",
    //   });
    //   // setAddModalOpen("false");
    //   handleCloseModal();
    //   navigate("/kpi");
    // }
  };
  const showModalTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const getObjectiveNamesAndMileStonePeriod = async () => {
    await axios
      .get(`/api/objective/getAllObjectMasterWithOutPagination`)
      .then((res) => {
        setObjNameList(
          res.data.data.map((obj: any) => ({
            value: obj._id,
            label: obj.ObjectiveName,
          }))
        );
        setMileStoneList(
          res.data.data.map((obj: any) => ({
            value: obj._id,
            label: obj.MilestonePeriod,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getAllUser = async () => {
    await axios(
      `/api/objective/getAllUserForLocation/${userDetail.location?.id}`
    )
      .then((res) => {
        setUser(res.data.allUsers);
        setOwnerList(
          res.data.allUsers.map((obj: any) => ({
            value: obj.id,
            label: obj.username,
            // email: obj.email,
            // avatar: obj.avatar,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getObjectiveYear = async () => {
    await axios(`api/objective/getYearFromOrganization`)
      .then((res) => {
        setYear(
          res.data.map((obj: any) => ({
            value: obj.Year,
            label: obj.Year,
          }))
        );
      })
      .catch((err) => console.error(err));
  };
  const getUserById = async (id: string, scopeType: string) => {
    try {
      const response = await axios.get(
        `/api/user/getUserInfoforScope/${id ? id : userDetail.id}`
      );
      const userData = response.data;
      console.log("scopetype in getuserbyid", userData);
      const options: any = [];

      // Push default location and entity values if they exist in userData
      if (userDetail?.userType !== "globalRoles") {
        if (
          userData &&
          userData.user &&
          userData.user?.location &&
          userData.user?.entity &&
          scopeType === "Unit"
        ) {
          addToOptionsIfNotExists(
            options,
            userData.user.location?.id,
            userData.user.location?.locationName,
            "location"
          );
          if (userData.otherLocations?.length > 0) {
            userData.otherLocations.forEach((loc: any) => {
              addToOptionsIfNotExists(
                options,
                loc?.id,
                loc?.locationName,
                "location"
              );
            });
          }
        } else if (scopeType === "Department") {
          addToOptionsIfNotExists(
            options,
            userData.user.entity.id,
            userData.user.entity.entityName,
            "entity"
          );
          userData.otherEntities.forEach((entity: any) => {
            addToOptionsIfNotExists(
              options,
              entity.id,
              entity.entityName,
              "entity"
            );
          });
        }
      } else {
        if (userData && userData.user && scopeType === "Unit") {
          if (userData.otherLocations?.length > 0) {
            userData.otherLocations.forEach((loc: any) => {
              addToOptionsIfNotExists(
                options,
                loc?.id,
                loc?.locationName,
                "location"
              );
            });
          }
        } else if (scopeType === "Department") {
          userData.otherEntities.forEach((entity: any) => {
            addToOptionsIfNotExists(
              options,
              entity.id,
              entity.entityName,
              "entity"
            );
          });
        }
      }
      setScopeList(userData);
      setOptions(options);
      console.log("scopelist in objectives", options);
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleScopeChange = (value: any, option: any) => {
    setDetails({ id: value, name: option.label });
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      Scope: value,
    }));
    // Determine scopeType based on the type property of the selected option
    // if (option.type === "location") {
    //   setScopeType("location");
    // } else if (option.type === "entity") {
    //   setScopeType("entity");
    // } else {
    //   setScopeType("entity");
    // }
  };
  const columns = [
    {
      title: "Objective Title",
      dataIndex: "ObjectiveName",
      key: "ObjectiveName",
    },
    {
      title: "Objective Type",
      dataIndex: "ScopeType",
      key: "ScopeType",
    },
    {
      title: "Categories",
      dataIndex: "associatedKpis",
      key: "associatedKpis",
      render: (kpis: any) =>
        kpis?.map((kpi: any) => kpi?.catInfo?.ObjectiveCategory).join(", "),
    },
    {
      title: "Owner",
      dataIndex: "OwnerName",
      key: "OwnerName",
    },
    {
      title: "Action",
      key: "action",
      render: (text: any, record: any) => (
        <IconButton
          color={
            selectedModalObjective?.value === record._id ? "primary" : "default"
          }
          onClick={() => {
            handleObjectiveSelect(record);
            handleModalClose();
          }}
        >
          {selectedModalObjective?.value === record._id ? (
            <MdCheckCircle />
          ) : (
            <MdOutlineCheckCircle />
          )}
        </IconButton>
      ),
    },
  ];

  // const getUserById = async (id: string) => {
  //   try {
  //     const response = await axios.get(`/api/user/getUserInfoforScope/${id}`);
  //     const userData = response.data;

  //     let options: any = [];

  //     // Push default location and entity values if they exist in userData
  //     if (
  //       userData &&
  //       userData.user &&
  //       userData.user.location &&
  //       userData.user.entity
  //     ) {
  //       addToOptionsIfNotExists(
  //         options,
  //         userData.user.location.id,
  //         userData.user.location.locationName,
  //         "location"
  //       );
  //       addToOptionsIfNotExists(
  //         options,
  //         userData.user.entity.id,
  //         userData.user.entity.entityName,
  //         "entity"
  //       );
  //     }

  //     console.log("options in before first if", options);

  //     // Append other entities if available
  //     if (
  //       userData &&
  //       userData.otherEntities &&
  //       userData.otherEntities.length > 0
  //     ) {
  //       userData.otherEntities.forEach((entity: any) => {
  //         addToOptionsIfNotExists(
  //           options,
  //           entity.id,
  //           entity.entityName,
  //           "entity"
  //         );
  //       });
  //     }

  //     setScopeList(userData);
  //     setOptions(options);
  //     console.log("scopelist in objectives", userData);
  //   } catch (error) {
  //     console.log("error", error);
  //   }
  // };

  const addToOptionsIfNotExists = (
    options: any,
    value: any,
    label: any,
    type: any
  ) => {
    // Check if an option with the same value already exists in options array
    if (!options.some((option: any) => option.value === value)) {
      options.push({
        value: value,
        label: label,
        type: type,
      });
    }
  };
  const handleOwnerChange = async (value: any) => {
    setOwner(value);
    const userInfo = await axios.get(`/api/user/getUser/byId/${value}`);
    console.log("userInfo", userInfo);
    if (userInfo.data) {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        locationId: userInfo?.data?.locationId,
        Owner: value,
        Scope: "",
      }));
      setOptions(null);
    }
  };

  const getAllGoals = async () => {
    await axios(`/api/objective/AllObjectives`)
      .then((res) => {
        setGoals(
          res?.data?.result?.map((obj: any) => ({
            value: obj._id,
            label: obj.ObjectiveCategory,
            // email: obj.email,
            // avatar: obj.avatar,
          }))
        );
      })
      .catch((err) => console.error(err));
  };
  const validateDescription = (
    rule: any,
    value: string,
    callback: (error?: string) => void
  ) => {
    if (!value || typeof value !== "string") {
      callback("Text value is required and must be a string.");
      return;
    }
    // Define regex pattern for allowed characters
    const TITLE_REGEX =
      /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,\?&%!#@€£`'"\~]+$/; // Allows letters, numbers, and specific symbols, but does not include < and >

    // Check for disallowed characters
    // const DISALLOWED_CHARS = /[<>{}]/;

    // Check for more than two consecutive special characters
    const MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS =
      /[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s:;=}{]{3,}/;

    const consecutiveSpecialChars =
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/u.test(value);
    // Check if the title starts with a special character
    const STARTS_WITH_SPECIAL_CHAR =
      /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]/;

    if (!value || value.trim().length === 0) {
      callback("Text value is required.");
    }
    // else if (DISALLOWED_CHARS.test(value)) {
    //   callback("Invalid text. Disallowed characters are < and >.");
    // }
    else if (consecutiveSpecialChars) {
      callback(
        "Invalid text. No more than two special characters are allowed."
      );
    } else if (MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS.test(value)) {
      callback(
        "Invalid text. No more than two consecutive special characters are allowed."
      );
    } else if (STARTS_WITH_SPECIAL_CHAR.test(value)) {
      callback("Invalid text. Text should not start with a special character.");
    } else if (!TITLE_REGEX.test(value)) {
      callback(
        "Invalid text. Allowed characters include letters, numbers, commas, slashes, hyphens, dots, and currency symbols."
      );
    } else {
      callback();
    }
  };
  const fetchObjectiveById = async () => {
    try {
      const res = await axios.get(
        `/api/objective/getObjectMasterById/${ObjectiveId}`
      );
      // getObjectiveNamesAndMileStonePeriod();
      const Objective = {
        _id: res.data.result._id,
        ObjectiveName: res.data.result.ObjectiveName,
        ObjectivePeriod: res.data.result.ObjectivePeriod,
        ParentObjective: res.data.result.ParentObjective,
        MilestonePeriod: res.data.result.MilestonePeriod,
        Owner: res.data.result.Owner,
        OwnerName: res.data.OwnerName,
        ObjectiveId: res.data.result.ObjectiveId,
        Description: res.data.result.Description,
        resources: res.data.result.resources,
        evaluationProcess: res.data.result.evaluationProcess,
        systemTypes: res.data.result.systemTypes,
        createdBy: res.data.result.createdBy,
        associatedKpis: res.data.result.associatedKpis,
        ScopeType: res.data.result.ScopeType,
      };
      // setActivityNew(res.data.activity);
      // console.log("objective", Objective);

      firstForm.setFieldsValue({
        ObjectiveName: res.data.result.ObjectiveName,
        ParentObjective: res.data.result.ParentObjective,
        locationId: res.data.result.locationId,
        ObjectivePeriod: res.data.result.ObjectivePeriod,
        MilestonePeriod: res.data.result.MilestonePeriod,
        Owner: res.data.result.Owner,
        OwnerName: res.data.OwnerName,
        ObjectiveId: res.data.result.ObjectiveId,
        // ObjectiveCategory:res.data.result.ObjectiveCategory,
        Description: res.data.result.Description,
        Scope: res.data.result.Scope,
        Goals: res.data.result.Goals,
        resources: res.data.result.resources,
        evaluationProcess: res.data.result.evaluationProcess,
        systemTypes: res.data.result.systemTypes,
        createdBy: res.data.result.createdBy,
        associatedKpis: res.data.result.associatedKpis,
        ScopeType: res.data.result.ScopeType,
        _id: res.data.result._id,
      });
      setReadAccess(res.data?.EditerAccess);
      setScopeType(res.data.result.ScopeType);

      const selectedParentObjective: any = res.data.result.ParentObjective;

      // console.log(
      //   "selectedPArentObjective",
      //   objectives,
      //   selectedParentObjective
      // );
      if (selectedParentObjective) {
        setSelectedModalObjective({
          value: selectedParentObjective._id,
          label: selectedParentObjective.ObjectiveName,
        });
      }
      setFormData({
        ...formData,
        ObjectiveName: res.data.result.ObjectiveName,
        ParentObjective: res.data.result.ParentObjective,
        MilestonePeriod: res.data.result.MilestonePeriod,
        Owner: res.data.result.Owner,
        OwnerName: res.data.OwnerName,
        ObjectiveId: res.data.result.ObjectiveId,
        Description: res.data.result.Description,
        resources: res.data.result.resources,
        evaluationProcess: res.data.result.evaluationProcess,
        Scope: res.data.result.Scope,
        Goals: res.data.result.Goals,
        systemTypes: res.data.result.systemTypes,
        ObjectivePeriod: currentYear,
        createdBy: res.data.result.createdBy,
        associatedKpis: res.data.result.associatedKpis,
        ScopeType: res.data.result.ScopeType,
        locationId: res.data.result.locationId,
        _id: res.data.result._id,
      });

      // if (!!referencesNew && !!referencesNew.length) {
      //   setReferencesNew(
      //     res.data.reference?.map((item: any) => ({
      //       ...item,
      //       label: item.name,
      //       value: item.url,
      //     }))
      //   );
      // }
    } catch (error) {
      console.log("error", error);
    }
  };
  const generateYearOptions = () => {
    const current = new Date().getFullYear();
    const previousYear = current - 1;
    const nextYear = current + 1;

    switch (userDetail?.organization?.fiscalYearFormat) {
      case "YYYY":
        return [`${previousYear}`, `${current}`, `${nextYear}`];
      case "YYYY-YY+1":
        return [`${previousYear}`, `${current}`, `${(nextYear % 100) + 1}`];
      case "YY-YY+1":
        return [
          `${previousYear % 100}-${(previousYear + 1) % 100}`,
          `${current % 100}-${(current + 1) % 100}`,
          `${nextYear % 100}-${(nextYear + 1) % 100}`,
        ]; // Add previous year in this format too
      // Add cases for other formats as needed
      default:
        // Default to YYYY format with previous, current, and next year
        return [`${previousYear}`, `${current}`, `${nextYear}`];
    }
  };

  const yearOptions = generateYearOptions().map((value) => ({
    value,
    label: value,
  }));
  // console.log("read in create", readAcces, formType);
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchModalText(e.target.value);
  };
  //usestates for parent objective modal
  const [locations, setLocations] = useState([]);
  const [entities, setEntities] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(
    userDetail?.locationId
  );
  const [selectedEntity, setSelectedEntity] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [parentObjNameList, setParentObjNameList] = useState([]);
  const [modalPage, setModalPage] = useState(1);
  const [modalRowsPerPage, setModalRowsPerPage] = useState(10);
  const [modalCount, setModalCount] = useState<number>();
  const [searchModalText, setSearchModalText] = useState<any>("");
  const [selectedModalObjective, setSelectedModalObjective] = useState({
    value: "",
    label: "",
  });
  useEffect(() => {
    if (!!modalVisible === true) {
      fetchLocations();
      if (selectedLocation) {
        fetchEntities();
      }
      if (selectedEntity && selectedLocation) {
        fetchObjectives();
      }
    }
  }, [modalVisible, selectedLocation, selectedEntity]);
  const handleModalDiscard = () => {
    setSearchModalText("");
    handleFilterChange();
  };
  const fetchLocations = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userDetail?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && !!res.data.data.length) {
          setLocations(
            res?.data?.data?.map((item: any) => ({
              ...item,
              id: item.id,
              name: item.locationName,
            }))
          );
        } else {
          setLocations([]);
          enqueueSnackbar("No Locations Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartments", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };
  const fetchEntities = async () => {
    try {
      // console.log("location", selectedLocation);
      const data = await getEntityByLocationId(selectedLocation);
      // console.log(data, "entities");
      if (data?.data) {
        setEntities(
          data.data?.map((item: any) => ({
            ...item,
            name: item.entityName,
            id: item.id,
          }))
        );
      }
    } catch (error) {}
  };
  const handleChangeModalList = async (event: any, values: any) => {
    setModalPage(1);
    setModalRowsPerPage(10);
    setSelectedLocation(values);
  };
  const handleLocationChange = async (event: any) => {
    console.log("eveny", event);
    setSelectedLocation(event);
    setSelectedEntity(null);
  };
  const handleModalPageChange = (page: any, pageSize: any) => {
    setModalPage(page);
    setModalRowsPerPage(pageSize);
  };
  const handleFilterChange = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `api/objective/getObjectivesForSelect?page=${modalPage}&limit=${modalRowsPerPage}&locationId=${selectedLocation}&entityId=${
          selectedEntity ? selectedEntity : ""
        }&year=${currentYear}&searchText=${
          searchModalText ? searchModalText : ""
        }`
      );
      // console.log("objectives", response.data);
      if (response.data?.data) {
        setObjectives(response.data.data);
        setModalCount(response?.data?.length);
      } else {
        setObjectives([]);
      }
    } catch (error) {
      setObjectives([]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedLocation(null);
    setSelectedEntity(null);
  };
  return (
    <>
      <Form
        form={firstForm}
        layout="vertical"
        initialValues={{ ObjectivePeriod: currentYear }}
        onValuesChange={(changedValues) => {
          // Merge the changed values with the existing form data
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            ...changedValues,
          }));
        }}
        rootClassName={classes.labelStyle}
      >
        <div style={{ padding: "5px" }}>
          <Row>
            <Col span={24}>
              <Form.Item
                label="Objective Title: "
                name="ObjectiveName"
                rules={[{ validator: validateTitle, required: true }]}
              >
                <Input
                  placeholder="Enter Objective Title"
                  size="large"
                  disabled={formType === "edit" && !read}
                  onChange={(e: any) => {
                    const { value } = e.target;
                    setFormData((prevData: any) => ({
                      ...prevData,
                      ObjectiveName: value,
                    }));
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={smallScreen ? 12 : 24}>
              <Form.Item
                label="Year: "
                required
                tooltip="This is a required field"
                name="ObjectivePeriod"
              >
                <Select
                  placeholder="Select year"
                  size="large"
                  defaultValue={currentYear}
                  disabled={formType === "edit" && !read}
                  onChange={(value: any, option: any) => {
                    // console.log("value on select", value, typeof value);
                    setFormData((prevData: any) => ({
                      ...prevData,
                      ObjectivePeriod: value,
                    }));
                  }}
                  options={yearOptions}
                />
              </Form.Item>
            </Col>
            <Col span={smallScreen ? 12 : 24}>
              <Form.Item
                label="System: "
                // required
                // tooltip="This is a required field"
                name="systemTypes"
              >
                <Select
                  showSearch
                  placeholder="Select System"
                  options={systemTypes}
                  mode="multiple"
                  optionFilterProp="children"
                  disabled={formType === "edit" && !read}
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(value: any, option: any) => {
                    // console.log("value on select", value);
                    setFormData((prevData: any) => ({
                      ...prevData,
                      systemTypes: value,
                    }));
                    setSystemType(value);
                  }}
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Objective Category: "
                required
                tooltip="This is a required field"
                name="Goals"
              >
                <Select
                  showSearch
                  placeholder="Select Category"
                  options={goals}
                  size="large"
                  mode="multiple"
                  optionFilterProp="children"
                  allowClear
                  disabled={formType === "edit" && !read}
                  onChange={(value: any, option: any) => {
                    // console.log("value on select", value);
                    setFormData((prevData: any) => ({
                      ...prevData,
                      Goals: value,
                    }));
                  }}
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={smallScreen ? 12 : 24}>
              <Form.Item
                label="Owner: "
                required
                tooltip="This is a required field"
                name="Owner"
              >
                <Select
                  showSearch
                  placeholder="Select Owner"
                  options={OwnersList}
                  optionFilterProp="children"
                  defaultValue={Owner}
                  disabled={formType === "edit" && !read}
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  // onSelect={(value: any, option: any) => {
                  //   setOwner(value);
                  // }}
                  onChange={handleOwnerChange}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={smallScreen ? 12 : 24}>
              <Form.Item
                label="Objective Type: "
                required
                tooltip="This is a required field"
                name="ScopeType"
              >
                <Select
                  onSelect={(value: any, option: any) => {
                    setScopeType(value);
                    setFormData((prevData: any) => ({
                      ...prevData,
                      ScopeType: value,
                      Scope: "",
                      associatedKpis: [],
                    }));
                  }}
                  placeholder="Select Type"
                  size="large"
                  disabled={formType === "edit" && !read}
                  options={typeOptions}
                />
              </Form.Item>
            </Col>
            <Col span={smallScreen ? 12 : 24}>
              <Form.Item
                label="Objective Scope: "
                required
                tooltip="This is a required field"
                // name="Scope"
              >
                <Select
                  onSelect={handleScopeChange}
                  // defaultValue={options ? options[0]?.value : ""}
                  placeholder="Select Scope"
                  size="large"
                  options={options}
                  value={formData?.Scope}
                  disabled={formType === "edit" && !read}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={smallScreen ? 12 : 24}>
              {/* <Form.Item label="Parent Objective: " name="ParentObjective">
                <Select
                  showSearch
                  placeholder="Select Objective"
                  options={objNameList}
                  size="large"
                  optionFilterProp="children"
                  // disabled={true}
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  value={selectedModalObjective}
                  // allowClear
                  // onChange={(value: any, option: any) => {
                  //   // console.log("value on select", value);
                  //   setFormData((prevData: any) => ({
                  //     ...prevData,
                  //     ParentObjective: value,
                  //   }));
                  // }}
                  // onChange={ setFormData({ ...formData, parentObjective: value })}
                />
              </Form.Item>
              <Button type="primary" onClick={() => setModalVisible(true)}>
                Select Objective
              </Button> */}
              <Form.Item label="Parent Objective: ">
                <Input
                  value={selectedModalObjective.label} // Display the selected objective's name
                  readOnly // Make it read-only if no direct edits are needed
                  addonAfter={
                    <Button
                      type="primary"
                      style={{ backgroundColor: "#003566" }}
                      onClick={() => setModalVisible(true)} // Open modal for selection
                    >
                      Select
                    </Button>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          {/* <Row gutter={16}> */}
          {/* <Col span={12}>
            <Form.Item label="Parent Objective: " name="ParentObjective">
              <Select
                showSearch
                placeholder="Select Objective"
                options={objNameList}
                size="large"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                allowClear
              />
            </Form.Item>
          </Col> */}
          {/* <Col span={12}>
            <Form.Item label="MileStone Period: " name="MilestonePeriod">
              <Input placeholder="Enter a period" size="large" />
            </Form.Item>
          </Col> */}
          {/* </Row> */}
          <Row>
            <Col span={24}>
              <Form.Item
                label="Description: "
                name="Description"
                rules={[{ validator: validateTitle }]}
              >
                <TextArea
                  rows={2}
                  placeholder="Enter Objective Description"
                  disabled={formType === "edit" && !read}
                  size="large"
                  // onChange={(e: any) => {
                  //   // console.log("value on select", value);
                  //   setFormData((prevData: any) => ({
                  //     ...prevData,
                  //     Description: e,
                  //   }));
                  // }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label="Resources Required: "
                name="resources"
                rules={[{ validator: validateTitle }]}
              >
                <TextArea
                  rows={2}
                  disabled={formType === "edit" && !read}
                  placeholder="Enter Resources Required "
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label="Evaluation Process: "
                name="evaluationProcess"
                rules={[{ validator: validateTitle }]}
              >
                <TextArea
                  rows={2}
                  disabled={formType === "edit" && !read}
                  placeholder="Enter Evaluation Process"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
      <Modal
        title="Select Objective"
        visible={modalVisible}
        onCancel={handleModalClose}
        width={1200}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        {loading && <Spin />}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            style={{ fontSize: "0.875rem" }}
          >
            Unit
          </Typography>
          <Select
            placeholder="Select Location"
            onChange={handleLocationChange}
            allowClear
            style={{ width: "80%", marginBottom: 16 }}
            showSearch
            value={selectedLocation}
            filterOption={
              (input: any, option: any) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 // Filter logic based on the input
            }
          >
            {locations.map((loc: any) => (
              <Select.Option key={loc.id} value={loc.id}>
                {loc.name}
              </Select.Option>
            ))}
          </Select>
          <Typography
            variant="subtitle1"
            gutterBottom
            style={{ fontSize: "0.875rem" }}
          >
            Dept/Vertical
          </Typography>
          <Select
            placeholder="Select Entity"
            allowClear
            onChange={setSelectedEntity}
            style={{ width: "80%", marginBottom: 16 }}
            value={selectedEntity}
            showSearch
            filterOption={
              (input: any, option: any) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 // Filter logic based on the input
            }
          >
            {entities.map((ent: any) => (
              <Select.Option key={ent.id} value={ent.id}>
                {ent.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            style={{ marginBottom: "16px" }}
            onClick={handleFilterChange}
          >
            Apply Filters
          </Button>
        </div>
        <div>
          <SearchBar
            placeholder="Search Objectives"
            name="searchModalText"
            values={searchModalText}
            handleChange={handleSearchChange}
            handleApply={handleFilterChange}
            endAdornment={true}
            handleClickDiscard={() => {
              handleModalDiscard();
            }}
          />
        </div>
        <div className={classes.tableContainer}>
          <Table
            dataSource={objectives}
            columns={columns}
            rowKey="_id"
            style={{ marginTop: 16 }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "10px",
          }}
        >
          <Pagination
            size="small"
            current={modalPage}
            pageSize={modalRowsPerPage}
            total={modalCount}
            showTotal={showModalTotal}
            showSizeChanger
            showQuickJumper
            onChange={(page, pageSize) => {
              handleModalPageChange(page, pageSize);
            }}
          />
          {/* <Tooltip title="Click to Expand/Shrink">
                <ArrowsAltOutlined
                  style={{
                    fontSize: "24px",
                    cursor: "pointer",
                    paddingLeft: "10px",
                  }}
                  onClick={handleExpandModal}
                />
              </Tooltip> */}
        </div>
      </Modal>
    </>
  );
};

export default CreateObjectiveForm;
