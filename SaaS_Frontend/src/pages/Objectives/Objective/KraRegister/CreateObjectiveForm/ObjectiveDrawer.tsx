import { Tabs, Drawer, Space, Button } from "antd";
import { useEffect, useState } from "react";
import useStyles from "./commonDrawerStyles";
import {
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  useMediaQuery,
} from "@material-ui/core";
import axios from "../../../../../apis/axios.global";
import { useSnackbar } from "notistack";
import CreateObjectiveForm from ".";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import { referencesData } from "recoil/atom";
import { useRecoilState } from "recoil";
import getSessionStorage from "utils/getSessionStorage";
import { API_LINK } from "config";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import AssociatedKPIForm from "./AssociatedKPIForm";
import { isValid } from "utils/validateInput";
type Props = {
  addModalOpen?: any;
  drawer?: any;
  setDrawer?: any;
  setAddModalOpen?: any;
  fetchObjectives?: any;
  ObjectiveId?: any;
  formType?: string;
  tableData?: any;
  setTableData?: any;
  url?: any;
  currentYear?: any;
  read?: any;
};
const ObjectiveDrawer = ({
  addModalOpen,
  drawer,
  setDrawer,
  setAddModalOpen,
  fetchObjectives,
  ObjectiveId,
  formType,
  tableData,
  setTableData,
  url,
  currentYear,
  read,
}: Props) => {
  const [formData, setFormData] = useState<any>();
  const [activityNew, setActivityNew] = useState("");
  const [referencesNew, setReferencesNew] = useState<any>([]);
  const [objectiveForm, setObjectiveForm] = useState<any>();
  const userInfo = getSessionStorage();
  const [details, setDetails] = useState<any>();
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const [refsData] = useRecoilState(referencesData);
  const orgId = sessionStorage.getItem("orgId");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [scopeType, setScopeType] = useState<any>();
  const [items, setItems] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [imgUrl, setImgUrl] = useState<any>();
  const [selectedItem, setSelectedItem] = useState("");
  useEffect(() => {
    const defaultButtonOptions = ["Save As Draft", "Submit"];
    const newItems = defaultButtonOptions?.map((item: any, index: any) => ({
      key: (index + 1).toString(),
      label: item,
    }));
    setItems([...defaultButtonOptions]);
  }, []);
  // console.log("formdata", formData);
  useEffect(() => {
    fetchImgUrl();
  }, [formType, formData]);
  const fetchImgUrl = async () => {
    const userid =
      formType === "create" ? userInfo.avatar : formData?.createdBy?.avatar;
    try {
      if (process.env.REACT_APP_IS_OBJECT_STORAGE === "false") {
        // Use the direct URL when object storage is disabled

        setImgUrl(`${process.env.REACT_APP_API_URL}/${userid}`);
      } else {
        // Fetch the URL from object storage when enabled
        const url = await viewObjectStorageDoc(userid);
        setImgUrl(url);
      }
    } catch (error) {
      // console.error("Error fetching image URL:", error);
      // Handle error as needed (e.g., set a default URL or show an error message)
      setImgUrl(""); // Or set a fallback URL
    }
  };
  const isValidDescription = (
    value: string | undefined | null
  ): { isValid: boolean; errorMessage?: string } => {
    // Check for empty or invalid input
    if (!value || typeof value !== "string") {
      return {
        isValid: false,
        errorMessage: "Input is required and must be a string.",
      };
    }

    const sanitizedValue = value.trim();

    // Check if the trimmed value is empty
    if (sanitizedValue.length === 0) {
      return {
        isValid: false,
        errorMessage: "Input cannot be empty after trimming.",
      };
    }

    // Define regex pattern for allowed characters
    const TITLE_REGEX =
      /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*=()\-/\.,\?&%!#@€£+;:`'"\~]+$/;

    // Check for disallowed characters including curly braces
    // const DISALLOWED_CHARS = /[<>{}]/;

    // Special characters to check for consecutive occurrences
    const SPECIAL_CHARACTERS =
      /[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s:;=+}{]/;

    // Check for more than two consecutive special characters or spaces
    const MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS = new RegExp(
      `(${SPECIAL_CHARACTERS.source})\\1{2,}`
    );

    const consecutiveSpecialChars =
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/u.test(value);
    // Check if the original value starts with a special character or space
    const STARTS_WITH_SPECIAL_CHAR_OR_SPACE = new RegExp(
      `^(${SPECIAL_CHARACTERS.source})`
    );

    // if (DISALLOWED_CHARS.test(sanitizedValue)) {
    //   return { isValid: false, errorMessage: "Invalid characters found." };
    // }

    if (consecutiveSpecialChars) {
      return {
        isValid: false,
        errorMessage:
          "Invalid text. No more than two special characters are allowed.",
      };
    }
    // Check leading spaces directly against the original value
    if (value[0] === " ") {
      return {
        isValid: false,
        errorMessage: "Input cannot start with a space.",
      };
    }

    // Check for leading special characters (not just spaces)
    if (STARTS_WITH_SPECIAL_CHAR_OR_SPACE.test(sanitizedValue)) {
      return {
        isValid: false,
        errorMessage: "Input cannot start with a special character.",
      };
    }

    if (MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS.test(sanitizedValue)) {
      return {
        isValid: false,
        errorMessage: "Too many consecutive special characters or spaces.",
      };
    }

    if (!TITLE_REGEX.test(sanitizedValue)) {
      return {
        isValid: false,
        errorMessage: "Input contains invalid characters.",
      };
    }

    return { isValid: true }; // If all checks pass
  };
  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };
  // console.log("items", items);
  const handleObjectiveFormCreated = (form: any) => {
    setObjectiveForm(form);
  };

  const handleCloseModal = () => {
    const updatedData = tableData?.map((item: any) => ({
      ...item,
      highlight: false,
    }));
    setTableData(updatedData);
    setAddModalOpen(false);
    setDrawer({ ...drawer, open: !drawer.open });
  };
  // console.log("read in obj drawer", read);
  const tabs = [
    {
      label: "Objective Details",
      key: 1,
      children: (
        <CreateObjectiveForm
          addModalOpen={addModalOpen}
          setAddModalOpen={setAddModalOpen}
          fetchObjectives={fetchObjectives}
          ObjectiveId={ObjectiveId}
          formType={formType}
          formData={formData}
          setFormData={setFormData}
          activityNew={activityNew}
          referencesNew={referencesNew}
          setReferencesNew={setReferencesNew}
          handleObjectiveFormCreated={handleObjectiveFormCreated}
          details={details}
          setDetails={setDetails}
          currentYear={currentYear}
          scopeType={scopeType}
          setScopeType={setScopeType}
          handleCloseModal={handleCloseModal}
          read={read}
        />
      ),
    },
    {
      label: "Associate KPIs & Target",
      key: 2,
      children: (
        <AssociatedKPIForm
          formData={formData}
          setFormData={setFormData}
          scopeType={scopeType}
          setScopeType={setScopeType}
          formType={formType}
          currentYear={currentYear}
          read={read}
        />
      ),
    },
    {
      label: "References",
      key: 3,
      children: <CommonReferencesTab drawer={drawer} />,
    },
  ];
  // console.log("tableData", tableData);
  const clearStates = () => {
    setAddModalOpen(false);
    setDrawer({ ...drawer, open: !drawer.open });
    setActivityNew("");
  };
  // const isValid = (
  //   value: string | undefined | null,
  //   regex: RegExp
  // ): boolean => {
  //   if (value && typeof value === "string") {
  //     const sanitizedValue = value.trim();
  //     return sanitizedValue.length > 0 && regex.test(sanitizedValue);
  //   }
  //   return false;
  // };
  // console.log("formdata.associatedKpis", formData?.associatedKpis);
  const handleSubmit = async (option: any) => {
    // console.log("handle submit called", formData);
    // const filteredReferences = references.map((reference: any) => {
    //   if (reference.id) {
    //     return {
    //       url: reference.url,
    //       refType: reference.refType,
    //       name: reference.name,
    //       id: reference.id,
    //     };
    //   }

    //   return {
    //     url: reference.url,
    //     refType: reference.refType,
    //     name: reference.name,
    //   };
    // });
    // console.log("scoptyoe in od submit", formData.systemTypes);

    const isValidDate = (date: any) => {
      return !isNaN(Date.parse(date));
    };
    const objectiveData = {
      _id: formData?._id || "",
      ObjectiveName: formData?.ObjectiveName || "",
      ObjectiveId: formData?.ObjectiveId || "",
      Description: formData?.Description || "",
      ModifiedDate: new Date() || "",
      ObjectivePeriod: formData.ObjectivePeriod
        ? formData.ObjectivePeriod
        : currentYear,
      ParentObjective: formData.ParentObjective || "",
      ReviewComments: formData.ReviewComments || "",
      ObjectiveStatus: option,
      Owner: formData.Owner || userDetail.id,
      Goals: formData.Goals,
      MilestonePeriod: formData.MilestonePeriod || "",
      Scope: formData.Scope || "",
      ScopeDetails: details,
      ScopeType: scopeType,
      locationId: formData.locationId
        ? formData.locationId
        : userInfo?.location?.id,
      resources: formData.resources,
      evaluationProcess: formData.evaluationProcess,
      systemTypes: formData.systemTypes,
      createdBy: formData.createdBy ? formData?.createdBy : userDetail,
      associatedKpis: formData.associatedKpis,
    };
    //  const isValid = (value: any) => value && value.trim().length > 0;
    if (formType === "edit" && ObjectiveId) {
      // putObjective(objectiveData);
      const isValidTitle = isValid(objectiveData.ObjectiveName);
      if (!isValidTitle.isValid) {
        enqueueSnackbar(
          `Please enter a valid title ${isValidTitle.errorMessage}`,
          { variant: "error" }
        );
        return;
      }
      if (objectiveData?.Description) {
        const isValidTitle = isValid(objectiveData.Description);
        if (!isValidTitle.isValid) {
          enqueueSnackbar(
            `Please enter a valid description ${isValidTitle.errorMessage}`,
            { variant: "error" }
          );
          return;
        }
      }
      if (objectiveData?.resources) {
        const isValidTitle = isValid(objectiveData?.resources);
        if (!isValidTitle.isValid) {
          enqueueSnackbar(
            `Please enter a valid resources ${isValidTitle.errorMessage}`,
            { variant: "error" }
          );
          return;
        }
      }
      if (objectiveData?.evaluationProcess) {
        const isValidTitle = isValid(objectiveData?.evaluationProcess);
        if (!isValidTitle.isValid) {
          enqueueSnackbar(
            `Please enter a valid evaluation process ${isValidTitle.errorMessage}`,
            { variant: "error" }
          );
          return;
        }
      }
      if (
        objectiveData.Owner &&
        objectiveData?.Goals?.length > 0 &&
        objectiveData?.Scope &&
        objectiveData?.ScopeType &&
        objectiveData?.ObjectiveName !== ""
      ) {
        putObjective(objectiveData);
      } else {
        enqueueSnackbar("Please fill all (*)required fields", {
          variant: "error",
        });
      }
    } else if (formType === "create") {
      const isValidTitle = isValid(objectiveData.ObjectiveName);
      if (!isValidTitle.isValid) {
        enqueueSnackbar(
          `Please enter a valid title ${isValidTitle.errorMessage}`,
          { variant: "error" }
        );
        return;
      }
      if (objectiveData?.Description) {
        const isValidTitle = isValid(objectiveData.Description);
        if (!isValidTitle.isValid) {
          enqueueSnackbar(
            `Please enter a valid description ${isValidTitle.errorMessage}`,
            { variant: "error" }
          );
          return;
        }
      }
      if (objectiveData?.resources) {
        const isValidTitle = isValid(objectiveData?.resources);
        if (!isValidTitle.isValid) {
          enqueueSnackbar(
            `Please enter a valid resources ${isValidTitle.errorMessage}`,
            { variant: "error" }
          );
          return;
        }
      }
      if (objectiveData?.evaluationProcess) {
        const isValidTitle = isValid(objectiveData?.evaluationProcess);
        if (!isValidTitle.isValid) {
          enqueueSnackbar(
            `Please enter a valid evaluation process ${isValidTitle.errorMessage}`,
            { variant: "error" }
          );
          return;
        }
      }
      if (
        objectiveData.Owner &&
        objectiveData?.Goals?.length > 0 &&
        objectiveData?.Scope &&
        objectiveData?.ScopeType &&
        isValid(objectiveData?.ObjectiveName)
      ) {
        postObjective(objectiveData);
      } else {
        enqueueSnackbar("Please fill all(*) required fields", {
          variant: "error",
        });
      }
    }
  };
  const updateKpisConcurrently = async (kpis: any, objectiveId: any) => {
    const promises = kpis.map(async (kpi: any) => {
      try {
        const kpidata = await axios.get(
          `/api/kpi-definition/getSelectedKpibyId/${kpi.kpiId}`
        );
        const updatedObjectiveId = Array.isArray(kpidata.data.objectiveId)
          ? [...kpidata.data.objectiveId]
          : [];

        if (!updatedObjectiveId.includes(objectiveId)) {
          updatedObjectiveId.push(objectiveId);
        }

        const response = await axios.put(
          `/api/kpi-definition/updateKpi/${kpi.kpiId}`,
          {
            ...kpidata.data,
            objectiveId: updatedObjectiveId,
          }
        );

        // console.log(
        //   `Successfully updated KPI with ID ${kpi.kpiId}:`,
        //   response.data
        // );
      } catch (error: any) {
        console.error(`Error updating KPI with ID ${kpi.kpiId}:`, error);
        throw error; // Ensure that the error propagates correctly
      }
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.log("Error updating KPIs:", error);
    }
  };

  const postObjective = async (objectiveData: any) => {
    try {
      const response = await axios.post(
        "/api/objective/createObjectMaster",
        objectiveData
      );
      // console.log("response.data", response.data);

      if (response.status === 200 || response.status === 201) {
        let formattedReferences: any = [];

        if (refsData && refsData?.length > 0) {
          formattedReferences = refsData.map((ref: any) => ({
            refId: ref.refId,
            organizationId: orgId,
            type: ref.type,
            name: ref.name,
            comments: ref.comments,
            createdBy: userInfo.firstName + " " + userInfo.lastName,
            updatedBy: null,
            link: ref.link,
            refTo: response.data._id,
          }));
        }
        const refs = await axios.post(
          "/api/refs/bulk-insert",
          formattedReferences
        );
        clearStates();
        if (response.data?.associatedKpis?.length > 0) {
          // console.log("inside if");
          // await updateKpisConcurrently(
          //   response.data.associatedKpis,
          //   response.data._id
          // );

          for (let kpi of formData?.associatedKpis) {
            try {
              const kpidata = await axios.get(
                `/api/kpi-definition/getSelectedKpibyId/${kpi?.key}`
              );
              let updatedObjectiveId: any = [];

              // Check if objectiveId field exists and is an array
              if (
                kpidata.data.objectiveId &&
                Array.isArray(kpidata.data.objectiveId)
              ) {
                updatedObjectiveId = [...kpidata?.data?.objectiveId]; // Copy existing array elements
              }

              // Check if res.data._id is not already in updatedObjectiveId
              if (!updatedObjectiveId.includes(response.data?._id)) {
                updatedObjectiveId.push(response?.data?._id); // Append res.data._id
              }

              const update = await axios.put(
                `/api/kpi-definition/updateKpi/${kpi?.key}`,
                {
                  ...kpidata.data,
                  objectiveId: updatedObjectiveId,
                }
              );
            } catch (error) {
              console.log("kpi not found");
            }
          }
        }
        fetchObjectives(url);
        enqueueSnackbar("Objective Created Successfully", {
          variant: "success",
        });
      } else if (response.status === 409) {
        enqueueSnackbar(
          "Objective with similar details exists for the selected scope",
          { variant: "error" }
        );
      }
    } catch (error: any) {
      // console.log("error", error);
      if (error.response.status === 409) {
        enqueueSnackbar(
          "Objective with similar details exists for the selected scope",
          { variant: "error" }
        );
      }
    }
  };

  const putObjective = async (objectiveData: any) => {
    try {
      const res = await axios.put(
        `/api/objective/update/${ObjectiveId}`,
        objectiveData
      );
      // console.log("res.data in update", res.data);
      if (formData?.associatedKpis?.length > 0) {
        // await updateKpisConcurrently(
        //   formData?.associatedKpis,
        //   res.data._id
        // );
        for (let kpi of formData?.associatedKpis) {
          try {
            const kpidata = await axios.get(
              `/api/kpi-definition/getSelectedKpibyId/${kpi?.key}`
            );
            let updatedObjectiveId: any = [];
            // console.log("kpidata", kpidata);
            // Check if objectiveId field exists and is an array
            if (
              kpidata.data.objectiveId &&
              Array.isArray(kpidata.data.objectiveId)
            ) {
              updatedObjectiveId = [...kpidata.data.objectiveId]; // Copy existing array elements
            }

            // Check if res.data._id is not already in updatedObjectiveId
            if (!updatedObjectiveId.includes(res.data.result._id)) {
              updatedObjectiveId.push(res.data.result?._id); // Append res.data._id
            }
            // console.log("objective id", updatedObjectiveId);
            const update = await axios.put(
              `/api/kpi-definition/updateKpi/${kpi?.key}`,
              {
                ...kpidata.data,
                objectiveId: updatedObjectiveId,
              }
            );
          } catch (error) {
            console.log("kpi not found");
          }
        }
      }
      let formattedReferences: any = [];

      if (refsData && refsData?.length > 0) {
        formattedReferences = refsData.map((ref: any) => ({
          refId: ref.refId,
          organizationId: orgId,
          type: ref.type,
          name: ref.name,
          comments: ref.comments,
          createdBy: userInfo.firstName + " " + userInfo.lastName,
          updatedBy: null,
          link: ref.link,
          refTo: res.data?.result?._id,
        }));
      }

      const refs = await axios.post(
        "/api/refs/bulk-insert",
        formattedReferences
      );
      enqueueSnackbar("Objective updated Successfully", {
        variant: "success",
      });
      clearStates();

      fetchObjectives(url);
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const onMenuClick = (e: any) => {
    handleSubmit(e);
  };
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  let avatarUrl;
  if (formType === "create") {
    avatarUrl = userDetail.avatar ? `${API_LINK}/${userDetail.avatar}` : "";
  }

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Objectives");
  // console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  return (
    <>
      <Drawer
        title={[
          <span key="title">
            {smallScreen
              ? formType === "create"
                ? "Add Objective"
                : "Edit Objective"
              : ""}
          </span>,
        ]}
        placement="right"
        // open={addModalOpen}
        open={drawer.open}
        closable={true}
        onClose={handleCloseModal}
        className={classes.drawer}
        width={matches ? "60%" : "90%"}
        maskClosable={false}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        extra={
          <>
            <Space>
              <Button onClick={handleCloseModal}>Cancel</Button>
              {/* <Button
                onClick={handleSubmit}
                style={{ background: "#003566", color: "white" }}
              >
                Submit
              </Button> */}
              <Button
                onClick={handleClick}
                style={{ display: "flex", alignItems: "center" }}
                disabled={items?.length === 0 || (formType === "edit" && !read)}
              >
                <span style={{ fontWeight: "bold" }}>
                  {selectedItem || "Actions"}
                </span>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {items &&
                  items?.map((item: any, index: any) => (
                    <MenuItem key={index + 1} onClick={() => onMenuClick(item)}>
                      {item}
                    </MenuItem>
                  ))}
              </Menu>
            </Space>
          </>
        }
      >
        <div className={classes.tabsWrapper} style={{ position: "relative" }}>
          {smallScreen ? (
            <Tabs
              type="card"
              items={tabs as any}
              animated={{ inkBar: true, tabPane: true }}
            />
          ) : (
            <div style={{ marginTop: "15px", width: "100%" }}>
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
                  <MenuItem value={"Objectives"}>
                    <div
                      style={{
                        backgroundColor:
                          selectedValue === "Objectives" ? "#3576BA" : "white",
                        textAlign: "center",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        color:
                          selectedValue === "Objectives" ? "white" : "black",
                      }}
                    >
                      {" "}
                      Objective Details
                    </div>
                  </MenuItem>
                  <MenuItem value={"Associate"}>
                    {" "}
                    <div
                      style={{
                        backgroundColor:
                          selectedValue === "Associate" ? "#3576BA" : "white",
                        textAlign: "center",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        color:
                          selectedValue === "Associate" ? "white" : "black",
                      }}
                    >
                      Associate KPIs & Target
                    </div>
                  </MenuItem>
                  <MenuItem value={"References"}>
                    {" "}
                    <div
                      style={{
                        backgroundColor:
                          selectedValue === "References" ? "#3576BA" : "white",
                        textAlign: "center",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        color:
                          selectedValue === "References" ? "white" : "black",
                      }}
                    >
                      References
                    </div>
                  </MenuItem>
                </Select>
              </FormControl>
            </div>
          )}
          {smallScreen ? (
            ""
          ) : (
            <div>
              {selectedValue === "Objectives" ? (
                <div>
                  <CreateObjectiveForm
                    addModalOpen={addModalOpen}
                    setAddModalOpen={setAddModalOpen}
                    fetchObjectives={fetchObjectives}
                    ObjectiveId={ObjectiveId}
                    formType={formType}
                    formData={formData}
                    setFormData={setFormData}
                    activityNew={activityNew}
                    referencesNew={referencesNew}
                    setReferencesNew={setReferencesNew}
                    handleObjectiveFormCreated={handleObjectiveFormCreated}
                    details={details}
                    setDetails={setDetails}
                    currentYear={currentYear}
                    scopeType={scopeType}
                    setScopeType={setScopeType}
                    handleCloseModal={handleCloseModal}
                    read={read}
                  />
                </div>
              ) : (
                ""
              )}

              {selectedValue === "Associate" ? (
                <div>
                  <AssociatedKPIForm
                    formData={formData}
                    setFormData={setFormData}
                    scopeType={scopeType}
                    setScopeType={setScopeType}
                    formType={formType}
                    currentYear={currentYear}
                    read={read}
                  />
                </div>
              ) : (
                ""
              )}

              {selectedValue === "References" ? (
                <div style={{ marginTop: "15px" }}>
                  <CommonReferencesTab drawer={drawer} />
                </div>
              ) : (
                ""
              )}
            </div>
          )}

          {smallScreen ? (
            <div style={{ position: "absolute", top: "2px", right: "10px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "40px",
                  width: "150px",
                  gap: "8px",
                }}
              >
                <div style={{ marginTop: "4px" }}>
                  <img
                    src={avatarUrl}
                    //alt="hello"
                    width="35px"
                    height="35px"
                    style={{ borderRadius: "20px" }}
                  />
                </div>
              </div>
              {formType === "create" && (
                <div style={{ fontSize: "12px" }}>
                  <p
                    style={{
                      margin: "0",
                      paddingRight: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    Created By:{userInfo.username}
                  </p>
                  <p style={{ margin: "0", fontWeight: "bold" }}>
                    Objective Year:{formData?.ObjectivePeriod}
                  </p>
                </div>
              )}
              {formType === "edit" && (
                <div style={{ fontSize: "12px" }}>
                  <p
                    style={{
                      margin: "0",
                      paddingRight: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    Created By:{formData?.createdBy?.username}
                  </p>
                  <p style={{ margin: "0", fontWeight: "bold" }}>
                    Objective Year:{formData?.ObjectivePeriod}
                  </p>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
        </div>

        {/* <div style={{ position: "absolute", top: "2px", right: "10px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              height: "40px",
              width: "150px",
              gap: "8px",
            }}
          >
            <div style={{ marginTop: "4px" }}>
              <img
                src={avatarUrl}
                alt="hello"
                width="35px"
                height="35px"
                style={{ borderRadius: "20px" }}
              />
            </div>
            <div style={{ fontSize: "12px" }}>
              <p style={{ margin: "0" }}>{userInfo.username}</p>
              <p style={{ margin: "0" }}> Meeting Owner</p>
            </div>
          </div>
        </div> */}
      </Drawer>
    </>
  );
};

export default ObjectiveDrawer;
