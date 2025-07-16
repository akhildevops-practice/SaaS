import React, { useEffect, useRef, useState } from "react";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import CustomButton from "../CustomButton";
import useStyles from "./styles";
import {
  FormControl,
  Select,
  TextField,
  MenuItem,
  FormHelperText,
  IconButton,
  Typography,
} from "@material-ui/core";
import { useRecoilState } from "recoil";
import { MdCheck } from "react-icons/md";
import { documentTypeFormData } from "../../recoil/atom";
import AutoComplete from "../AutoComplete";
import axios from "../../apis/axios.global";
import getAppUrl from "../../utils/getAppUrl";
import { debounce } from "lodash";
import checkRoles from "../../utils/checkRoles";
import { isValidDocType } from "../../apis/documentsApi";
import _ from "lodash";
import { getUserInfo } from "../../apis/socketApi";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import getUserId from "utils/getUserId";
import { isValid } from "utils/validateInput";
import { MdChevronLeft } from "react-icons/md";
import { docTypeForm } from "schemas/docTypeForm";

type Props = {
  handleSubmit?: any;
  handleDiscard?: any;
  isEdit?: any;
  locId?: any;
  locInformation?: any;
  tableData?: any;
  deletedId?: boolean;
  deletedDocTypeData?: any;
  readMode?: any;
  setReadMode?: any;
};
interface ISystems {
  name: string;
}

interface Distrubution {
  id: string;
  name: string;
}
interface ReadAccess {
  id: string;
  name: string;
}
const DocNum = ["Serial", "Manual"];
const readAccess = [
  // "Organization",
  // "Creator's Location",
  // "Creator's Entity",
  // "Restricted Access",

  "All Users",
  "All in Units(S)",
  "All in Department(S)",
  "Selected Users",
];
const distributeAccess = [
  "None",
  "All Users",
  "All in Units(S)",
  "All in Department(S)",
  "Selected Users",
  "Respective Department",
  "Respective Unit",
];

const whoCanCreateOption = [
  "All Users",
  "Selected Users",
  "None",
  // "PIC",
  // "Head",
  "All in Units(S)",
  "All in Department(S)",
];
let prefix = ["YY", "MM", "LocationId", "DepartmentId"];
let suffix = ["YY", "MM", "LocationId", "DepartmentId"];

let typeAheadValue: string;
let typeAheadType: string;

function AddDocumentForm({
  // handleSubmit,
  // handleDiscard,
  locId,
  isEdit = false,
  tableData,
  locInformation,
  deletedId,
  deletedDocTypeData,
  readMode,
  setReadMode,
}: Props) {
  const classes = useStyles();
  const [formData, setFormData] = useRecoilState(documentTypeFormData);
  const [suggestions, setSuggestions] = React.useState([]);
  const [systems, setSystems] = React.useState<ISystems[]>([]);
  const [locationOption, setLocationOption] = React.useState([]);

  const [distributionOption, setDistributionOptions] = useState<Distrubution[]>(
    []
  );

  const { enqueueSnackbar } = useSnackbar();

  const [readAccessOption, setReadAccessOptions] = useState<ReadAccess[]>([]);
  const [locationNames, setLocationNames] = useState<object[]>([]);
  const [userOptions, setUserOptions] = useState([]);
  const [entityOption, setEntityOption] = useState([]);
  const [entityOption2, setEntityOption2] = useState([]);
  const [edit, setEdit] = useState(false);
  const [distValue, setDistValue] = useState(false);
  const [readValue, setReadValue] = useState(false);
  const [options, setOptions] = useState(prefix);
  const [optionsUffix, setOptionSuffix] = useState(suffix);
  const [customPrefix, setCustomPrefix] = useState("");
  const [locationUser, setLocationUser] = useState([]);
  const [customsuffix, setCustomSuffix] = useState("");
  const [customMenuAdded, setCustomMenuAdded] = useState(false);
  const [customMenuSuffix, setCustomMenuSuffix] = useState(false);
  const [showCustomPrefix, setShowCustomPrefix] = useState(false);
  const [showCustomSuffix, setShowCustomSuffix] = useState(false);
  const [prefixSample, setPrefixSample] = useState<any>();
  const [suffixSample, setSuffixSample] = useState<any>();
  const [docsClassificationValid, setdocsClassificationValid] = useState(false);
  const [userLocation, setUserLocation] = useState([]);
  const isInitialRender = useRef(true);
  const readRender = useRef(true);
  const realmName = getAppUrl();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const allOption = { id: "All", locationName: "All" };
  const { id } = useParams();
  const navigate = useNavigate();

  const listData = ["None", "Respective Department", "Respective Unit"];

  useEffect(() => {
    if (id) {
      setEdit(true);
      getDoctypeData(id);
    } else {
      setEdit(false);
    }
  }, []);
  useEffect(() => {}, [formData]);
  const getLocationNames = async () => {
    try {
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );

      setLocationNames(res.data);
    } catch (error) {}
  };

  const getDoctypeData = async (id: any) => {
    try {
      const res = await axios.get(`api/doctype/getByDoctypeId/${id}`);
      setFormData({
        id: res?.data?.id,
        documentTypeName: res?.data?.documentTypeName,
        reviewFrequency: res?.data?.reviewFrequency
          ? res?.data?.reviewFrequency
          : "-",
        revisionRemind: res?.data?.revisionRemind
          ? res?.data?.revisionRemind
          : "-",
        // readAccess: res?.data?.readAccess.type,
        readAccess: res?.data?.readAccess,
        readAccessUsers: res?.data?.readAccessUsers,
        creators: res?.data?.creators,
        reviewers: res?.data?.reviewers,
        approvers: res?.data?.approvers,
        documentNumbering: res?.data?.documentNumbering,
        users: res?.data?.users,
        prefix: res?.data?.prefix.split("-"),
        suffix: res?.data?.suffix.split("-"),
        applicable_systems: res?.data?.applicable_systems,
        distributionList: res?.data?.distributionList,
        distributionUsers: res?.data?.distributionUsers,
        newdistribution: res?.data?.distributionUsers,
        whoCanCreate: res?.data?.whoCanCreate,
        whoCanCreateUsers: res?.data?.whoCanCreateUsers,
        whoCanDownload: res?.data?.whoCanDownload,
        whoCanDownloadUsers: res?.data?.whoCanDownloadUsers,
        document_classification: res?.data?.document_classification,
        currentVersion: res?.data?.currentVersion,
        locationId: res?.data?.locationId,
      });
    } catch (err) {
      enqueueSnackbar("Unable to Fetch Data, Something Went Wrong", {
        variant: "error",
      });
    }
  };

  const handleDiscard = () => {
    setFormData(docTypeForm);
  };
  const getData = async (value: string, type: string) => {
    if (type === "RA" && isOrgAdmin) {
      try {
        const res = await axios.get(
          `api/user/doctype/filterusers/${realmName}/${locId}?email=${value}`
        );
        setSuggestions(res.data);
      } catch (err) {}
    } else if (type === "RA" && !isOrgAdmin) {
      try {
        const res = await axios.get(
          `api/user/doctype/filterusers/${realmName}/${"all"}?email=${value}`
        );
        setSuggestions(res.data);
      } catch (err) {}
    } else {
      try {
        const res = await axios.get(
          `api/user/doctype/filterusers/${realmName}/${"allusers"}?email=${value}`
        );
        setSuggestions(res.data);
      } catch (err) {}
    }
  };

  useEffect(() => {
    getLocationNames();
    // modify data which is coming from recycle bin to display in its modal
    if (deletedId) {
      const modifiedData = {
        ...deletedDocTypeData,
        prefix: deletedDocTypeData?.prefix?.split("-"),
        suffix: deletedDocTypeData?.suffix.split("-"),
      };
    } else if (!isOrgAdmin) {
      getUserInfo().then((value: any) => {
        setFormData({
          ...formData,
          locationId: [
            {
              id: `${value.data.location.id}`,
              locationName: `${value.data.location.locationName}`,
            },
          ],
        });
      });
    }

    const valueDoesNot = formData.prefix.filter(
      (value: any) => !value.includes(prefix)
    );
    const valueDoesNotSuffix = formData.suffix.filter(
      (value: any) => !value.includes(suffix)
    );
    getLocationOptions();
    getUserOptions();
    getDepartmentOptions();
    const uniqueOptions = [...new Set([...options, ...valueDoesNotSuffix])];
    const uniqueOptionsWithoutSuffix = [
      ...new Set([...options, ...valueDoesNot]),
    ];

    // Set the options
    setOptionSuffix(uniqueOptions);
    setOptions(uniqueOptionsWithoutSuffix);
    // setOptionSuffix([...options, ...valueDoesNotSuffix]);
    // setOptions([...options, ...valueDoesNot]);
  }, []);

  const handleSubmit = async () => {
    let { users, ...finalValues } = formData;
    let userId = getUserId();

    // let document_classification = await isValidDocType(
    //   formData.document_classification
    // ).then((response: any) => {
    //   //console.log("response", response.data);
    //   return response.data;
    // });

    //let finalResult = edit ? true : document_classification;
    const validatedocumentTypeName = await isValid(formData.documentTypeName);

    if (validatedocumentTypeName.isValid === false) {
      enqueueSnackbar(
        `Document Type Name ${validatedocumentTypeName?.errorMessage}`,
        {
          variant: "error",
        }
      );
      return;
    }

    if (formData.reviewFrequency === "") {
      enqueueSnackbar(`Update Revision Frequency`, {
        variant: "warning",
      });
      return;
    }

    if (formData?.applicable_systems?.length === 0) {
      enqueueSnackbar(`Update System`, {
        variant: "warning",
      });
      return;
    }

    if (formData.revisionRemind === "") {
      enqueueSnackbar(`Update Revision Remind`, {
        variant: "warning",
      });
      return;
    }

    if (
      formData.documentTypeName &&
      formData.documentNumbering &&
      (formData.readAccess !== "None"
        ? formData.readAccessUsers.length > 0
          ? true
          : false
        : true) &&
      // formData.creators &&
      //   formData.distributionList !== "None" ||
      // formData.distributionList !== "Respective Department" ||
      // formData.distributionList !== "Respective Unit"
      (!listData.includes(formData.distributionList)
        ? formData.distributionUsers.length > 0
          ? true
          : false
        : true) &&
      // (formData.distributionList !== "Respective Department"
      //   ? formData.distributionUsers.length > 0
      //     ? true
      //     : false
      //   : true) &&
      // (formData.distributionList !== "Respective Unit"
      //   ? formData.distributionUsers.length > 0
      //     ? true
      //     : false
      //   : true) &&
      //finalResult &&
      (formData.documentNumbering === "Serial"
        ? formData.prefix.length || formData.suffix.length
        : true)
    ) {
      // setFormDialogOpen(false);
      // setIsLoading(true);

      if (edit) {
        try {
          if (formData.readAccess === "Restricted Access") {
            let res = await axios.patch(`api/doctype/${formData.id}`, {
              ...formData,
              creators: formData.creators,
              locationIdOfDoctype: formData.locationId,
              reviewFrequency: parseInt(formData.reviewFrequency),
              revisionRemind: parseInt(formData.revisionRemind),
              readAccess: { type: formData.readAccess, usersWithAccess: users },
            });
            // socket?.emit("documentTypeUpdated", {
            //   data: res.data,
            //   currentUser: `${userId}`,
            // });
            enqueueSnackbar(`Operation Successful`, { variant: "success" });
          } else {
            let res = await axios.patch(`api/doctype/${formData.id}`, {
              ...formData,
              document_classification: formData?.document_classification
                ? formData.document_classification
                : null,
              creators: formData.creators,
              locationIdOfDoctype: formData.locationId,
              distributionList: formData.distributionList,
              distributionUsers: formData.distributionUsers,
              reviewFrequency: parseInt(formData.reviewFrequency),
              revisionRemind: parseInt(formData.revisionRemind),
              readAccess: { type: formData.readAccess },
              readAccessUsers: formData.readAccessUsers,
            });
            // socket?.emit("documentTypeUpdated", {
            //   data: res.data,
            //   currentUser: `${userId}`,
            // });
            enqueueSnackbar(`Doc Type Saved`, { variant: "success" });
          }
          navigate("/processdocuments/documenttype");
          // setRerender(!rerender);
          // setIsLoading(false);
        } catch (err) {}
      } else {
        try {
          if (formData.readAccess === "Restricted Access") {
            let { users, ...finalValues } = formData;
            let res = await axios.post("api/doctype", {
              ...formData,
              document_classification: formData?.document_classification
                ? formData.document_classification
                : null,
              creators: formData.creators,
              reviewFrequency: parseInt(formData.reviewFrequency),
              revisionRemind: parseInt(formData.revisionRemind),
              readAccess: {
                type: formData.readAccess,
                // usersWithAccess: formData.readAccessUsers,
              },
              readAccessUsers: formData.readAccessUsers,
              locationIdOfDoctype: formData.locationId,
            });

            // socket?.emit("documentTypeCreated", {
            //   data: res.data,
            //   currentUser: `${userId}`,
            // });
          } else {
            let res = await axios.post("api/doctype", {
              ...formData,
              document_classification: formData?.document_classification
                ? formData.document_classification
                : null,
              creators: formData.creators,
              reviewFrequency: parseInt(formData.reviewFrequency),
              revisionRemind: parseInt(formData.revisionRemind),
              readAccess: { type: formData.readAccess },
              readAccessUsers: formData.readAccessUsers,
              locationIdOfDoctype: formData.locationId,
            });
            formData?.locationId?.map((value: any) => {});

            // socket?.emit("documentTypeCreated", {
            //   data: res.data,
            //   currentUser: userId,
            // });
          }
          enqueueSnackbar(`Doc Type Created`, { variant: "success" });
          // setRerender(!rerender);
          // setIsLoading(false);
        } catch (err: any) {
          if (err.response.status === 409) {
            enqueueSnackbar(`Document Classification Already Exists`, {
              variant: "error",
            });
          } else {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
          }
          // setIsLoading(false);
        }
        navigate("/processdocuments/documenttype");
      }
    } else {
      enqueueSnackbar(
        `Please fill all the required fields Or Check Document Classification`,
        {
          variant: "warning",
        }
      );
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "document_classification") {
      checkDocType(e.target.value);
    }
  };
  const debouncedSearch = debounce(() => {
    getData(typeAheadValue, typeAheadType);
  }, 400);

  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };

  const handleAddCustomPrefix = () => {
    if (customPrefix !== "" && !customMenuAdded) {
      setOptions((prevOptions) => [...prevOptions, customPrefix]);
      setFormData({ ...formData, prefix: [...formData.prefix, customPrefix] });
      setShowCustomPrefix(false);
      setCustomMenuAdded(true);
      setCustomPrefix("");
    }
  };

  const handleAddCustomSuffix = () => {
    if (customsuffix !== "" && !customMenuSuffix) {
      setOptionSuffix((prevOptions) => [...prevOptions, customsuffix]);
      setFormData({ ...formData, suffix: [...formData.suffix, customsuffix] });
      setShowCustomSuffix(false);
      setCustomMenuSuffix(true);
      setCustomSuffix("");
    }
  };

  const handleEditCustomPrefix = () => {
    setShowCustomPrefix(true);
    setCustomMenuAdded(false);
  };

  const handleEditCustomSuffix = () => {
    setShowCustomSuffix(true);
    setCustomMenuSuffix(false);
  };

  useEffect(() => {
    const prefixSample = formData?.prefix?.map((item: any) => {
      if (item === "YY") {
        return new Date().getFullYear() % 100;
      } else if (item === "MM") {
        return new Date().getMonth() + 1;
      } else if (item === "LocationId") {
        return "DAH";
      } else if (item === "DepartmentId") {
        return "SML";
      } else {
        return item; // Preserve any other values in the array
      }
    });
    const prefix = `${prefixSample.join("-")}`;
    setPrefixSample(prefix);
  }, [formData.prefix]);

  useEffect(() => {
    const suffixSample = formData?.suffix?.map((item: any) => {
      if (item === "YY") {
        return new Date().getFullYear() % 100;
      } else if (item === "MM") {
        return new Date().getMonth() + 1;
      } else if (item === "LocationId") {
        return "DAH";
      } else if (item === "DepartmentId") {
        return "SML";
      } else {
        return item; // Preserve any other values in the array
      }
    });
    const suffix = `${suffixSample.join("-")}`;
    setSuffixSample(suffix);
  }, [formData.suffix]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (formData.distributionList === "All Users") {
      setDistributionOptions([{ id: "All Users", name: "All Users" }]);
      setFormData({
        ...formData,
        distributionUsers: [{ id: "All Users", name: "All Users" }],
      });
      setDistValue(true);
    }
    // sddfdsfdfgdfg
    else if (formData.whoCanCreate === "All Users") {
      // setDistributionOptions([{ id: "All Users", name: "All Users" }]);
      setFormData({
        ...formData,
        whoCanCreateUsers: [{ id: "All Users", name: "All Users" }],
      });
      setDistValue(true);
    } else if (formData.distributionList === "All in Units(S)") {
      setFormData({
        ...formData,
        distributionUsers: [],
      });
      setDistValue(false);
      setDistributionOptions(locationOption);
    } else if (formData.distributionList === "Selected Users") {
      setFormData({
        ...formData,
        distributionUsers: [],
      });
      setDistValue(false);
      setDistributionOptions(userOptions);
    } else {
      setFormData({
        ...formData,
        distributionUsers: [],
      });
      setDistValue(false);

      setDistributionOptions(entityOption);
    }
  }, [
    formData.distributionList,
    // formData.readAccess,
    // formData.readAccessUsers,
  ]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // sddfdsfdfgdfg
    if (formData.whoCanCreate === "All Users") {
      // setDistributionOptions([{ id: "All Users", name: "All Users" }]);
      setFormData({
        ...formData,
        whoCanCreateUsers: [{ id: "All Users", name: "All Users" }],
      });
      setDistValue(true);
    } else if (formData.whoCanCreate === "PIC") {
      setFormData({
        ...formData,
        whoCanCreateUsers: [],
      });
      setDistValue(false);
      setDistributionOptions(entityOption);
    } else if (formData.whoCanCreate === "Head") {
      setFormData({
        ...formData,
        whoCanCreateUsers: [],
      });
      setDistValue(false);
      setDistributionOptions(entityOption);
    } else if (formData.whoCanCreate === "Selected Users") {
      setFormData({
        ...formData,
        whoCanCreateUsers: [],
      });
      setDistValue(false);
      setDistributionOptions(userOptions);
    } else {
      setFormData({
        ...formData,
        whoCanCreateUsers: [],
      });
      setDistValue(false);

      setDistributionOptions(entityOption);
    }
  }, [
    formData.whoCanCreate,
    // formData.readAccess,
    // formData.readAccessUsers,
  ]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // sddfdsfdfgdfg
    if (formData.whoCanDownload === "All Users") {
      // setDistributionOptions([{ id: "All Users", name: "All Users" }]);
      setFormData({
        ...formData,
        whoCanDownloadUsers: [{ id: "All Users", name: "All Users" }],
      });
      setDistValue(true);
    } else if (formData.whoCanDownload === "PIC") {
      setFormData({
        ...formData,
        whoCanDownloadUsers: [],
      });
      setDistValue(false);
      setDistributionOptions(entityOption);
    } else if (formData.whoCanDownload === "Head") {
      setFormData({
        ...formData,
        whoCanDownloadUsers: [],
      });
      setDistValue(false);
      setDistributionOptions(entityOption);
    } else if (formData.whoCanDownload === "Selected Users") {
      setFormData({
        ...formData,
        whoCanDownloadUsers: [],
      });
      setDistValue(false);
      setDistributionOptions(userOptions);
    } else {
      setFormData({
        ...formData,
        whoCanDownloadUsers: [],
      });
      setDistValue(false);

      setDistributionOptions(entityOption);
    }
  }, [
    formData.whoCanDownload,
    // formData.readAccess,
    // formData.readAccessUsers,
  ]);

  useEffect(() => {
    const locationData = formData?.locationId?.map((item: any) => item?.id);

    if (
      formData?.whoCanDownload === "All in Department(S)" &&
      !locationData?.includes("All")
    ) {
      const filterData = entityOption2?.filter((item: any) => {
        locationData?.includes(item?.locationId);
      });
      setEntityOption2(filterData || []);
    }
  }, [formData?.whoCanDownload]);

  useEffect(() => {
    if (readRender.current) {
      readRender.current = false;
      return;
    }
    if (formData.readAccess === "All Users") {
      setReadAccessOptions([{ id: "All Users", name: "All Users" }]);
      setFormData({
        ...formData,
        readAccessUsers: [{ id: "All Users", name: "All Users" }],
      });
      setReadValue(true);
    } else if (formData.readAccess === "All in Units(S)") {
      setFormData({
        ...formData,
        readAccessUsers: [],
      });
      setReadValue(false);
      setReadAccessOptions(locationOption);
    } else if (formData.readAccess === "Selected Users") {
      setFormData({
        ...formData,
        readAccessUsers: [],
      });
      setReadValue(false);
      setReadAccessOptions(userOptions);
    } else {
      setFormData({
        ...formData,
        readAccessUsers: [],
      });
      setReadValue(false);
      setReadAccessOptions(entityOption);
    }
  }, [formData.readAccess]);
  useEffect(() => {
    const GetSystems = async () => {
      try {
        const locationId = [];
        if (isOrgAdmin) {
          if (formData?.locationId?.find((value: any) => value.id === "All")) {
            locationId.push("All");
          } else {
            const allLoc = formData?.locationId?.map((value: any) => value.id);
            locationId.push(...allLoc);
          }
        }
        const encodedSystems = encodeURIComponent(JSON.stringify(locationId));

        const { data } = await axios.get(
          `api/systems/displaySystems/${encodedSystems}`
        );
        const products = data;
        setSystems(products);
      } catch {
        // console.log("error");
      }
    };
    GetSystems();
  }, [formData.locationId]);

  useEffect(() => {
    getUserLocation();
  }, [formData.locationId]);

  const getLocationOptions = async () => {
    await axios("/api/kpi-definition/getAllLocations")
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          id: obj.id,
          name: obj.locationName,
        }));
        setLocationOption(ops);
      })
      .catch((err) => console.error(err));
  };

  const getUserOptions = async () => {
    await axios(`/api/kpi-report/getAllUsers`)
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          id: obj.id,
          name: obj.username,
        }));
        setUserOptions(ops);
      })
      .catch((err) => console.error(err));
  };
  const getUserLocation = async () => {
    const queryLocation = formData?.locationId
      ?.map((item: any) => `location=${item?.id}`)
      .join("&");
    await axios(`/api/documents/getUserLocation?${queryLocation}`)
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          id: obj.id,
          name: obj.username,
        }));
        setUserLocation(ops);
      })
      .catch((err) => console.error(err));
  };

  const getDepartmentOptions = async () => {
    await axios(`/api/entity`)
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          id: obj.id,
          name: obj.entityName,
          locationId: obj?.locationId,
        }));
        setEntityOption(ops);
        setEntityOption2(ops);
      })
      .catch((err) => console.error(err));
  };
  const checkDocType = _.debounce((text: string) => {
    isValidDocType(text).then((response: any) => {
      setdocsClassificationValid(response.data);
    });
  }, 600);
  // console.log("formData", formData, entityOption);
  return (
    <div>
      {" "}
      <div className={classes.header} style={{ padding: "20px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
          }}
        >
          <Button onClick={() => navigate("/processdocuments/documenttype")}>
            <MdChevronLeft fontSize="small" />
            Back
          </Button>
          <Typography style={{ padding: "2px 0 0 20px", fontWeight: 500 }}>
            Document Type Form
          </Typography>
        </div>
      </div>
      <Box py={2} className={classes.root}>
        <form>
          <Grid container>
            {/* Document Type */}

            <Grid container item sm={12} md={6}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Applicable Units*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <AutoComplete
                  suggestionList={
                    locationNames ? [allOption, ...locationNames] : []
                  }
                  name=""
                  keyName="locationId"
                  formData={formData}
                  setFormData={setFormData}
                  labelKey="locationName"
                  // byId={true}
                  getSuggestionList={getSuggestionList}
                  disabled={!isOrgAdmin || readMode === true}
                  defaultValue={
                    formData?.locationId?.length ? formData.locationId : []
                  }
                  type="RA"
                />
              </Grid>
            </Grid>
            <Grid container item sm={12} md={6}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Document Type*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  name="documentTypeName"
                  value={formData.documentTypeName}
                  variant="outlined"
                  size="small"
                  onChange={handleChange}
                  required
                  disabled={readMode === true}
                  style={{ color: "black" }}
                />
              </Grid>
            </Grid>

            {/* Review Frequency */}
            <Grid container item sm={12} md={6}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Revision Frequency*</strong>
              </Grid>
              <Grid container item sm={12} md={8} className={classes.formBox}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    name="reviewFrequency"
                    variant="outlined"
                    size="small"
                    type="number"
                    value={formData.reviewFrequency}
                    onChange={handleChange}
                    required
                    disabled={readMode === true}
                    style={{ color: "black" }}
                    InputProps={{
                      style: {
                        color: "black",
                      },
                      readOnly: readMode === true,
                    }}
                    InputLabelProps={{
                      style: {
                        color: "black",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4} className={classes.formTextPadding}>
                  In Months
                </Grid>
              </Grid>
            </Grid>
            <Grid container item sm={12} md={6}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Revision Pre- Notification*</strong>
              </Grid>
              <Grid container item sm={12} md={8} className={classes.formBox}>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <TextField
                    fullWidth
                    name="revisionRemind"
                    value={formData.revisionRemind}
                    variant="outlined"
                    size="small"
                    type="number"
                    onChange={handleChange}
                    defaultValue={30}
                    placeholder={"30"}
                    required
                    disabled={readMode === true}
                    InputProps={{
                      style: {
                        color: "black",
                      },
                      readOnly: readMode === true,
                    }}
                    InputLabelProps={{
                      style: {
                        color: "black",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4} className={classes.formTextPadding}>
                  In Days
                </Grid>
              </Grid>
            </Grid>
            {/* Document Numbering */}
            <Grid container item sm={12} md={6}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Document Numbering*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  {/* <InputLabel>Document Numbering</InputLabel> */}
                  <Select
                    required
                    data-testid="document-numbering"
                    name="documentNumbering"
                    value={formData.documentNumbering}
                    onChange={handleChange}
                    onClick={() => console.log("select option is clicked")}
                    onMouseDown={() => console.log("mouse down")}
                    disabled={readMode === true}
                  >
                    {DocNum.map((item: any, i: number) => {
                      return (
                        <MenuItem
                          key={i}
                          data-testid={`numbering-${i}`}
                          value={item}
                          onClick={() => console.log("menu item is clicked")}
                        >
                          {item}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/*  Prefix / Sufix*/}
            {formData.documentNumbering === "Serial" && (
              <Grid container item sm={12} md={6}>
                {/* Prefix */}
                <Grid container item sm={12} md={6}>
                  <Grid item sm={12} md={3} className={classes.formTextPadding}>
                    <strong>Prefix</strong>
                  </Grid>
                  <Grid item sm={12} md={9}>
                    <FormControl
                      className={classes.formControl}
                      variant="outlined"
                      size="small"
                      fullWidth
                      error={formData.prefix.length === 0}
                    >
                      <Select
                        required
                        name="prefix"
                        data-testid="prefix-select"
                        multiple
                        renderValue={(val) => {
                          return (val as string[]).join("-");
                        }}
                        value={formData.prefix}
                        onChange={handleChange}
                        // onClose={handleAddCustomPrefix}
                        // onOpen={handleEditCustomPrefix}
                      >
                        {options.map((item: any, i: number) => (
                          <MenuItem key={i} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                      {!showCustomPrefix && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={handleEditCustomPrefix}
                        >
                          Add Custom Prefix
                        </Button>
                      )}
                      {showCustomPrefix && (
                        <TextField
                          placeholder="Enter custom prefix"
                          value={customPrefix}
                          onChange={(e) => setCustomPrefix(e.target.value)}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                aria-label="Save"
                                onClick={handleAddCustomPrefix}
                              >
                                {/* <CheckIcon /> */}
                              </IconButton>
                            ),
                          }}
                        />
                      )}
                      {/* {customMenuAdded && (
                      <FormHelperText>
                        Custom Prefix Added: {customPrefix}
                      </FormHelperText>
                    )} */}
                      {/* <FormHelperText>
                      {prefixSample?.length > 0
                        ? prefixSample
                        : "Please fill this for Serial Numbering"}
                    </FormHelperText> */}
                    </FormControl>
                  </Grid>
                </Grid>

                {/* suffix */}
                <Grid container item sm={12} md={6}>
                  <Grid item sm={12} md={3} className={classes.formTextPadding}>
                    <strong>Suffix</strong>
                  </Grid>
                  <Grid item sm={12} md={9}>
                    <FormControl
                      className={classes.formControl}
                      variant="outlined"
                      size="small"
                      fullWidth
                      error={formData.suffix.length === 0}
                    >
                      {/* <InputLabel>Suffix</InputLabel> */}
                      <Select
                        required
                        name="suffix"
                        data-testid="suffix-select"
                        multiple
                        renderValue={(val) => {
                          return (val as string[])?.join("-");
                        }}
                        value={formData.suffix}
                        onChange={handleChange}
                        // onClose={handleAddCustomPrefix}
                        // onOpen={handleEditCustomPrefix}
                      >
                        {optionsUffix.map((item: any, i: number) => (
                          <MenuItem key={i} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                      {!showCustomSuffix && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={handleEditCustomSuffix}
                        >
                          Add Custom Suffix
                        </Button>
                      )}
                      {showCustomSuffix && (
                        <TextField
                          placeholder="Enter custom suffix"
                          value={customsuffix}
                          onChange={(e) => setCustomSuffix(e.target.value)}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                aria-label="Save"
                                onClick={handleAddCustomSuffix}
                              >
                                {/* <CheckIcon /> */}
                              </IconButton>
                            ),
                          }}
                        />
                      )}
                      {/* {customMenuAdded && (
                      <FormHelperText>
                        Custom Suffix Added: {customPrefix}
                      </FormHelperText>
                    )} */}
                      {/* <FormHelperText>
                      {suffixSample?.length > 0
                        ? suffixSample
                        : "Please fill this for Serial Numbering"}
                    </FormHelperText> */}
                    </FormControl>
                  </Grid>
                </Grid>

                <FormHelperText
                  style={{
                    fontSize: "13px",
                    color: "#0E0A42",
                    fontWeight: "bold",
                    display: "flex",
                    // marginLeft: "40%",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: "1%",
                  }}
                  className={classes.formBox}
                >
                  {suffixSample?.length > 0 || prefixSample?.length > 0 ? (
                    <span>
                      Format Sample{" "}
                      <span
                        style={{
                          color: "grey",
                          fontWeight: "normal",
                          fontSize: "12px",
                        }}
                      >
                        {" "}
                        {`(${prefixSample}-${suffixSample})`}
                      </span>
                    </span>
                  ) : (
                    "Please fill Fields for Serial Numbering"
                  )}
                </FormHelperText>
              </Grid>
            )}

            <Grid container item sm={12} md={6}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Applicable Systems*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <AutoComplete
                  suggestionList={systems ? systems : []}
                  name=""
                  keyName="applicable_systems"
                  formData={formData}
                  setFormData={setFormData}
                  labelKey="name"
                  getSuggestionList={getSuggestionList}
                  defaultValue={
                    formData?.applicable_systems?.length
                      ? formData.applicable_systems
                      : []
                  }
                  type="RA"
                  disabled={readMode === true}
                />
              </Grid>
            </Grid>

            {/* <Grid container item sm={12} md={6}>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Document Level</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              {isEdit ? (
                <TextField
                  value={formData.document_classification}
                  disabled
                  size="small"
                  variant="outlined"
                  fullWidth
                />
              ) : (
                <TextField
                  fullWidth
                  name="document_classification"
                  value={formData.document_classification}
                  variant="outlined"
                  size="small"
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {docsClassificationValid ? (
                          <Tooltip title="Document Classification name is unique">
                            <MdCheckCircle
                              style={{ color: "green", cursor: "pointer" }}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Document Classification is not unique">
                            <MdCancel
                              style={{ color: "red", cursor: "pointer" }}
                            />
                          </Tooltip>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Grid>
          </Grid> */}

            {/* Read Access */}
            <Grid container item sm={12} md={6}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Read Access*</strong>
              </Grid>

              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  {/* <InputLabel>Read Access</InputLabel> */}
                  <Select
                    required
                    name="readAccess"
                    value={formData.readAccess}
                    onChange={handleChange}
                    disabled={readMode === true}
                  >
                    {readAccess.map((item: any, i: number) => {
                      return (
                        <MenuItem key={i} value={item}>
                          {item}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            {/* {formData.readAccess === "Restricted Access" && (
            <Grid container item sm={12} md={6}>
              <Grid item xs={12} md={4} className={classes.formTextPadding}>
                <strong>Users*</strong>
              </Grid>
              <Grid item xs={12} md={8} className={classes.formBox}>
                <AutoComplete
                  suggestionList={suggestions ? suggestions : []}
                  name=""
                  keyName="users"
                  formData={formData}
                  setFormData={setFormData}
                  getSuggestionList={getSuggestionList}
                  defaultValue={formData?.users?.length ? formData.users : []}
                  type="RA"
                />
              </Grid>
            </Grid>
          )} */}
            {formData.readAccess !== "None" && (
              <Grid container item sm={12} md={6}>
                <Grid item xs={12} md={4} className={classes.formTextPadding}>
                  <strong>Read Access Users*</strong>
                </Grid>
                <Grid item xs={12} md={8} className={classes.formBox}>
                  {formData.readAccess === "All in Units(S)" && (
                    <AutoComplete
                      suggestionList={locationOption ? locationOption : []}
                      name=""
                      keyName="readAccessUsers"
                      formData={formData}
                      disabled={false}
                      labelKey="name"
                      setFormData={setFormData}
                      multiple={true}
                      getSuggestionList={getSuggestionList}
                      defaultValue={
                        formData?.readAccessUsers?.length
                          ? formData.readAccessUsers
                          : []
                      }
                      type="RA"
                    />
                  )}
                  {formData.readAccess === "Selected Users" && (
                    <AutoComplete
                      suggestionList={userOptions ? userOptions : []}
                      name=""
                      keyName="readAccessUsers"
                      formData={formData}
                      disabled={false}
                      labelKey="name"
                      setFormData={setFormData}
                      multiple={true}
                      getSuggestionList={getSuggestionList}
                      defaultValue={
                        formData?.readAccessUsers?.length
                          ? formData.readAccessUsers
                          : []
                      }
                      type="RA"
                    />
                  )}
                  {formData.readAccess === "All in Department(S)" && (
                    <AutoComplete
                      suggestionList={entityOption ? entityOption : []}
                      name=""
                      keyName="readAccessUsers"
                      formData={formData}
                      disabled={false}
                      labelKey="name"
                      setFormData={setFormData}
                      multiple={true}
                      getSuggestionList={getSuggestionList}
                      defaultValue={
                        formData?.readAccessUsers?.length
                          ? formData.readAccessUsers
                          : []
                      }
                      type="RA"
                    />
                  )}
                  {formData.readAccess === "All Users" && (
                    <AutoComplete
                      suggestionList={[{ id: "All Users", name: "All Users" }]}
                      name=""
                      keyName="readAccessUsers"
                      formData={formData}
                      disabled={true}
                      labelKey="name"
                      setFormData={setFormData}
                      multiple={true}
                      getSuggestionList={getSuggestionList}
                      defaultValue={
                        formData?.readAccessUsers?.length
                          ? formData.readAccessUsers
                          : []
                      }
                      type="RA"
                    />
                  )}
                </Grid>
              </Grid>
            )}
            <Grid container item sm={12} md={6}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Distribution List*</strong>
              </Grid>

              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  {/* <InputLabel>Distribution List</InputLabel> */}
                  <Select
                    required
                    name="distributionList"
                    value={formData.distributionList}
                    onChange={handleChange}
                    disabled={readMode === true}
                  >
                    {distributeAccess.map((item: any, i: number) => {
                      return (
                        <MenuItem key={i} value={item}>
                          {item}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {formData.distributionList !== "None" &&
              formData.distributionList !== "Respective Department" &&
              formData.distributionList !== "Respective Unit" && (
                <Grid container item sm={12} md={6}>
                  <Grid item xs={12} md={4} className={classes.formTextPadding}>
                    <strong>Distribution Users*</strong>
                  </Grid>
                  <Grid item xs={12} md={8} className={classes.formBox}>
                    {formData.distributionList === "All in Units(S)" && (
                      <AutoComplete
                        suggestionList={locationOption ? locationOption : []}
                        name=""
                        keyName="distributionUsers"
                        formData={formData}
                        disabled={readMode === true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.distributionUsers?.length
                            ? formData.distributionUsers
                            : []
                        }
                        type="RA"
                      />
                    )}
                    {formData.distributionList === "Selected Users" && (
                      <AutoComplete
                        suggestionList={userOptions ? userOptions : []}
                        name=""
                        keyName="distributionUsers"
                        formData={formData}
                        disabled={readMode === true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.distributionUsers?.length
                            ? formData.distributionUsers
                            : []
                        }
                        type="RA"
                      />
                    )}
                    {formData.distributionList === "All in Department(S)" && (
                      <AutoComplete
                        suggestionList={entityOption ? entityOption : []}
                        name=""
                        keyName="distributionUsers"
                        formData={formData}
                        disabled={readMode === true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.distributionUsers?.length
                            ? formData.distributionUsers
                            : []
                        }
                        type="RA"
                      />
                    )}
                    {formData.distributionList === "All Users" && (
                      <AutoComplete
                        suggestionList={[
                          { id: "All Users", name: "All Users" },
                        ]}
                        name=""
                        keyName="distributionUsers"
                        formData={formData}
                        disabled={readMode === true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.distributionUsers?.length
                            ? formData.distributionUsers
                            : []
                        }
                        type="RA"
                      />
                    )}
                  </Grid>
                </Grid>
              )}

            {/* <Grid container item sm={12} md={6}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Who Can create*</strong>
              </Grid>

              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                 
                  <Select
                    required
                    name="whoCanCreate"
                    value={formData.whoCanCreate}
                    onChange={handleChange}
                    disabled={readMode === true}
                  >
                    {whoCanCreateOption.map((item: any, i: number) => {
                      return (
                        <MenuItem key={i} value={item}>
                          {item}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid> */}

            {/* {formData.whoCanCreate !== "None" &&
              formData?.whoCanCreate !== "" &&
              formData.whoCanCreate !== "Respective Department" &&
              formData.whoCanCreate !== "Respective Unit" && (
                <Grid container item sm={12} md={6}>
                  <Grid item xs={12} md={4} className={classes.formTextPadding}>
                    <strong>Who Can Create Users*</strong>
                  </Grid>
                  <Grid item xs={12} md={8} className={classes.formBox}>
                    {formData.whoCanCreate === "Selected Users" && (
                      <AutoComplete
                        suggestionList={userLocation ? userLocation : []}
                        name=""
                        keyName="whoCanCreateUsers"
                        formData={formData}
                        disabled={readMode === true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.whoCanCreateUsers?.length
                            ? formData.whoCanCreateUsers
                            : []
                        }
                        type="RA"
                      />
                    )}
                    {formData.whoCanCreate === "PIC" && (
                      <AutoComplete
                        suggestionList={entityOption ? entityOption : []}
                        name=""
                        keyName="whoCanCreateUsers"
                        formData={formData}
                        disabled={readMode === true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.whoCanCreateUsers?.length
                            ? formData.whoCanCreateUsers
                            : []
                        }
                        type="RA"
                      />
                    )}
                    {formData.whoCanCreate === "All Users" && (
                      <AutoComplete
                        suggestionList={[
                          { id: "All Users", name: "All Users" },
                        ]}
                        name=""
                        keyName="whoCanCreateUsers"
                        formData={formData}
                        disabled={true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.whoCanCreateUsers?.length
                            ? formData.whoCanCreateUsers
                            : []
                        }
                        type="RA"
                      />
                    )}
                  </Grid>
                </Grid>
              )} */}

            <Grid container item sm={12} md={6}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Who Can Download*</strong>
              </Grid>

              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  <Select
                    required
                    name="whoCanDownload"
                    value={formData.whoCanDownload}
                    onChange={handleChange}
                    disabled={readMode === true}
                  >
                    {whoCanCreateOption.map((item: any, i: number) => {
                      return (
                        <MenuItem key={i} value={item}>
                          {item}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {formData.whoCanDownload !== "None" &&
              formData.whoCanDownload !== "" &&
              formData.whoCanDownload !== "Respective Department" &&
              formData.whoCanDownload !== "Respective Unit" && (
                <Grid container item sm={12} md={6}>
                  <Grid item xs={12} md={4} className={classes.formTextPadding}>
                    <strong>Download Users*</strong>
                  </Grid>
                  <Grid item xs={12} md={8} className={classes.formBox}>
                    {formData.whoCanDownload === "Selected Users" && (
                      <AutoComplete
                        suggestionList={userOptions ? userOptions : []}
                        name=""
                        keyName="whoCanDownloadUsers"
                        formData={formData}
                        disabled={readMode === true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.whoCanDownloadUsers?.length
                            ? formData.whoCanDownloadUsers
                            : []
                        }
                        type="RA"
                      />
                    )}
                    {formData.whoCanDownload === "PIC" && (
                      <AutoComplete
                        suggestionList={entityOption ? entityOption : []}
                        name=""
                        keyName="whoCanDownloadUsers"
                        formData={formData}
                        disabled={readMode === true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.whoCanDownloadUsers?.length
                            ? formData.whoCanDownloadUsers
                            : []
                        }
                        type="RA"
                      />
                    )}

                    {formData.whoCanDownload === "All in Department(S)" && (
                      <AutoComplete
                        suggestionList={entityOption2 ? entityOption2 : []}
                        name=""
                        keyName="whoCanDownloadUsers"
                        formData={formData}
                        disabled={readMode === true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.whoCanDownloadUsers?.length
                            ? formData.whoCanDownloadUsers
                            : []
                        }
                        type="RA"
                      />
                    )}

                    {formData.whoCanDownload === "All in Units(S)" && (
                      <AutoComplete
                        suggestionList={locationOption ? locationOption : []}
                        name=""
                        keyName="whoCanDownloadUsers"
                        formData={formData}
                        disabled={readMode === true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.whoCanDownloadUsers?.length
                            ? formData.whoCanDownloadUsers
                            : []
                        }
                        type="RA"
                      />
                    )}
                    {formData.whoCanDownload === "All Users" && (
                      <AutoComplete
                        suggestionList={[
                          { id: "All Users", name: "All Users" },
                        ]}
                        name=""
                        keyName="whoCanDownloadUsers"
                        formData={formData}
                        disabled={true}
                        labelKey="name"
                        setFormData={setFormData}
                        multiple={true}
                        getSuggestionList={getSuggestionList}
                        defaultValue={
                          formData?.whoCanDownloadUsers?.length
                            ? formData.whoCanDownloadUsers
                            : []
                        }
                        type="RA"
                      />
                    )}
                  </Grid>
                </Grid>
              )}
            <Grid container item sm={12} md={6}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Version*</strong>
              </Grid>

              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  {/* <InputLabel>Version</InputLabel> */}
                  <Select
                    value={formData.currentVersion}
                    onChange={handleChange}
                    name="currentVersion"
                    disabled={readMode === true}
                    required
                  >
                    {[...new Array(25)]
                      .reduce(
                        (acc, val, index) => {
                          return [...acc, acc[index] + 1];
                        },
                        [65]
                      )
                      .map((item: number) => (
                        <MenuItem value={String.fromCharCode(item)}>
                          {String.fromCharCode(item)}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          {/* <Grid container spacing={2} className={classes.formBottomSection}>
          <Grid item xs={12} md={4} className={classes.formTextPadding}>
            <strong>Creators*</strong>
            <Box mt={2}>
              <AutoCompleteNew
                suggestionList={suggestions ? suggestions : []}
                name="Creators"
                keyName="creators"
                showAvatar={true}
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={getSuggestionList}
                defaultValue={formData.creators ? formData.creators : null}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4} className={classes.formTextPadding}>
            <strong>Reviewers*</strong>
            <Box mt={2}>
              <AutoCompleteNew
                suggestionList={suggestions ? suggestions : []}
                name="Reviewers"
                keyName="reviewers"
                showAvatar={true}
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={getSuggestionList}
                defaultValue={
                  formData.reviewers.length ? formData.reviewers : []
                }
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4} className={classes.formTextPadding}>
            <strong>Approvers*</strong>
            <Box mt={2}>
              <AutoCompleteNew
                suggestionList={suggestions ? suggestions : []}
                name="Approvers"
                keyName="approvers"
                showAvatar={true}
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={getSuggestionList}
                defaultValue={
                  formData.approvers.length ? formData.approvers : []
                }
              />
            </Box>
          </Grid>
        </Grid> */}

          <Box width="100%" display="flex" justifyContent="flex-end" pt={2}>
            <Button
              className={classes.buttonColor}
              variant="outlined"
              onClick={() => {
                handleDiscard();
                // setReadMode(false);
              }}
            >
              Discard
            </Button>

            <CustomButton
              text="Submit"
              handleClick={handleSubmit}
              disabled={readMode === true}
              style={{ marginLeft: "8px" }} // or use `sx` if MUI v5+
            />
          </Box>
        </form>
      </Box>
    </div>
  );
}

export default AddDocumentForm;
