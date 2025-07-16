import { useState, useEffect, useRef } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import AuditPlanForm1 from "../../components/AuditPlanForm1";
import AuditPlanForm2 from "../../components/AuditPlanForm2";
import AuditPlanForm3 from "../../components/AuditPlanForm3";
import { auditPlanSchema } from "../../schemas/auditPlanSchema";
import axios from "../../apis/axios.global";
import { useSnackbar } from "notistack";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import { Button, Divider, Modal, Popover } from "antd";
import useStyles from "./styles";
import SingleFormWrapper from "containers/SingleFormWrapper";
import { useRecoilValue } from "recoil";
import { orgFormData } from "recoil/atom";
import { MdOutlineInfo } from 'react-icons/md';
import moment from "moment";
import getSessionStorage from "utils/getSessionStorage";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { IconButton } from "@material-ui/core";
import { Tour, TourProps } from "antd";
import { MdTouchApp } from 'react-icons/md';
// import { useRef } from "react";

type Props = {
  deletedId?: any;
  // data?: any,
  // setData?:any,
};

const steps = [
  "Audit System and Scope",
  //  "Audit Scope",
  "Audit Plan",
];

/**
 *
 * The new audit plan page is required to create a new audit plan and edit it.
 */

function AuditPlanFormStepper({
  deletedId,
}: // , data, setData
Props) {
  const [auditPlanData, setAuditPlanData] = useState(auditPlanSchema);
  const location = useLocation();
  const [locationName, setLocationName] = useState("");
  const [locationNo, setLocationNo] = useState("");
  const [scope, setScope] = useState("");
  const [role, setrole] = useState("");
  const [orgID, setOrgID] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [value, setValue] = useState<any>("");
  const isMR = checkRoles(roles.MR);
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { id, view } = useParams();

  const isEdit = id ? true : false;
  const viewMode = view !== undefined ? true : false;
  const orgData = useRecoilValue(orgFormData);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;
  const classes = useStyles();
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const userDetails = getSessionStorage();
  const [activeTab, setActiveTab] = useState("1");
  const [allSystems, setAllSystems] = useState<any>([]);
  const [removedList, setRemovedList] = useState<any>([]);
  const [isReadOnly, setIsReadOnly] = useState<any>(false);

  const [finalisedAuditorTourOpen, setFinalisedAuditorTourOpen] =
    useState<any>(false);

  const handleTabChange = (key: any) => {
    setActiveTab(key);
  };

  const handlePrevious = () => {
    const currentTabKey = parseInt(activeTab);
    const previousTabKey = (currentTabKey - 1).toString();
    setActiveTab(previousTabKey);
  };

  const handleNext = () => {
    const currentTabKey = parseInt(activeTab);
    const nextTabKey = (currentTabKey + 1).toString();
    setActiveTab(nextTabKey);
  };

  // useEffect(() => {
  //   console.log(
  //     "checkaudit useeffect[finalisedAuditorTourOpen] in audit plan form stepper ",
  //     finalisedAuditorTourOpen
  //   );
  // }, [finalisedAuditorTourOpen]);

  // useEffect(()=>{
  //   console.log("checkaudit auditplandata in form stepper", auditPlanData);

  // },[auditPlanData])

  useEffect(() => {
    if (isEdit && (deletedId || id)) {
      getAuditPlanDetailsById();
    }
  }, []);

  useEffect(() => {
    if (location?.pathname.includes("readonly")) {
      setIsReadOnly(true);
    }
    if (viewMode === true) {
      setIsReadOnly(true);
    }
  }, [location]);

  const convertDate = (date: string) => {
    const d = new Date(date);

    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const getAuditPlanDetailsById = async () => {
    const auditPlanId = id ? id : deletedId;
    if (!auditPlanId) return;
    await axios(`/api/auditPlan/getAuditPlanSingle/${auditPlanId}`)
      .then((res: any) => {

        setScope(res.data.entityType);
        const data = res.data.auditPlanEntityWise
          .filter((obj: any) => obj.deleted)
          .map((obj: any) => ({
            id: obj.id,
            entityId: obj.entityId,
            name: obj.entityName,
            months: obj.auditSchedule,
            deleted: obj.deleted,
          }));
        setRemovedList(data);
        setAuditPlanData({
          auditName: res.data.auditName,
          year: res.data.auditYear,
          status: res.data.status,
          isDraft: res.data.isDraft,
          location: {
            id: res.data.locationId,
            locationName: res.data.location,
          },
          checkOn: false,
          locationId: res.data.locationId,
          createdBy: res.data.createdBy,
          auditTypeName: res.data.auditTypeName,
          createdOn: convertDate(res.data.createdAt),
          auditType: res.data.auditType,
          planType: res.data.planType,
          lastModified: convertDate(res.data.updatedAt),
          systemType: res.data.systemTypeId,
          systemName:
            res.data.locationId === ""
              ? res.data.systemMaster
              : res.data.systemMaster.map((value: any) => value._id),
          prefixSuffix: res.data.prefixSuffix,
          scope: {
            id: res.data.entityTypeId,
            name: res.data.entityType,
          },
          // scope: res.data,
          // role: res.data,
          auditPlanId: res.data.id,
          role: res.data.roleId,
          useFunctionsForPlanning: res?.data?.useFunctionsForPlanning,
          auditorCheck: res.data.auditorCheck,
          comments: res.data.comments,
          AuditPlanEntitywise: res.data.auditPlanEntityWise.map((obj: any) => ({
            id: obj.id,
            entityId: obj.entityId,
            name: obj.entityName,
            months: obj.auditSchedule,
            auditors: obj.auditors,
            auditPlanId: obj.auditPlanId,
            deleted: obj.deleted,
          })),
        });
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    console.log("hello world test",auditPlanData.location,auditPlanData.scope,auditPlanData.checkOn)
    if (
      !isEdit &&
      // auditPlanData.location &&
      auditPlanData.scope &&
      auditPlanData.checkOn === false
    ) {
     
      initialiseEntities();
    }
  }, [auditPlanData.location, auditPlanData.scope]);

  // const validateAuditPlanForm1 = () => {
  //   return (
  //     auditPlanData.year && auditPlanData.systemType && auditPlanData.systemName
  //   );
  // };
  // const validateAuditPlanForm2 = () => {
  //   return auditPlanData.scope && auditPlanData.role;
  // };
  // const validateAuditPlanForm3 = () => {
  //   return true;
  // };

  const currentDate = moment();

  // get Entities by location and entity type

  const initialiseEntities = async () => {
    auditPlanData.useFunctionsForPlanning === true
      ? await axios(`/api/auditPlan/getFunction/${auditPlanData.scope.id}`)
          .then((res) => {
            setAuditPlanData((prev) => ({
              ...prev,
              AuditPlanEntitywise: res.data.map(
                (obj:any) => ({
                  entityId: obj.id,
                  name: obj.name,
                  months:
                    auditPlanData.planType === "Month"
                      ? new Array(12).fill(false)
                      : new Array().fill(currentDate),
                  auditors: [],
                })
              ),
            }));
          })
          .catch((err) => console.error(err))
      : auditPlanData.scope.name === "Unit"||auditPlanData.scope.name === "Corporate Function"
      ? await axios(`/api/auditPlan/getLocationForAuditPlan/${auditPlanData.scope.name === "Unit"?"Unit":"Function"}`)
          .then((res) => {
            setAuditPlanData((prev) => ({
              ...prev,
              AuditPlanEntitywise: res.data.map(
                (obj: { id: string; locationName: string }) => ({
                  entityId: obj.id,
                  name: obj.locationName,
                  months:
                    auditPlanData.planType === "Month"
                      ? new Array(12).fill(false)
                      : new Array().fill(currentDate),
                  auditors: [],
                })
              ),
            }));
          })
          .catch((err) => console.error(err))
      : await axios(
          `/api/auditPlan/getEntity/${
            isEdit
              ? auditPlanData.locationId
              : isOrgAdmin
              ? auditPlanData.location
              : auditPlanData.location.id
          }/${auditPlanData.scope.id}`
        )
          .then((res) => {
            setAuditPlanData((prev) => ({
              ...prev,
              AuditPlanEntitywise: res.data.map(
                (obj: { id: string; entityName: string }) => ({
                  entityId: obj.id,
                  name: obj.entityName,
                  months:
                    auditPlanData.planType === "Month"
                      ? new Array(12).fill(false)
                      : [],
                  auditors: [],
                })
              ),
            }));
          })
          .catch((err) => console.error(err));
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // post API here
  // const handleCreate = async () => {
  //   {
  //     isOrgAdmin
  //       ? setValue(auditPlanData?.location)
  //       : setValue(auditPlanData?.location?.id);
  //   }
  //   console.log("Value", value);
  //   if (value) {
  //     axios
  //       .get(
  //         `/api/serial-number/generateSerialNumber?moduleType=Audit Plan&location=${
  //           isOrgAdmin ? auditPlanData.location : auditPlanData.location.id
  //         }&createdBy=${userInfo?.id}`
  //       )
  //       .then((response) => {
  //         const value = response.data;

  //         // Get the current month and year
  //         const currentDate = new Date();
  //         const currentMonth = (currentDate.getMonth() + 1)
  //           .toString()
  //           .padStart(2, "0"); // Adding 1 because month is zero-indexed
  //         const currentYear = currentDate.getFullYear().toString().slice(-2);

  //         // Replace placeholders with actual values
  //         const transformedValue = value
  //           .replace("MM", currentMonth)
  //           .replace("YY", currentYear); // Replace '10' with the actual department ID
  //         setPrefixSuffix(transformedValue);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching data:", error);
  //       });
  //   }
  //   console.log("locationssss", value, prefixSuffix);
  //   setIsLoading(true);
  //   try {
  //     const temp = {
  //       auditYear: auditPlanData.year,
  //       status: auditPlanData.status,
  //       publishedOnDate: new Date(),
  //       auditType: auditPlanData.auditType,
  //       systemTypeId: auditPlanData.systemType,
  //       entityTypeId: auditPlanData.scope.id,
  //       comments: auditPlanData.comments,
  //       location: isOrgAdmin
  //         ? auditPlanData.location
  //         : auditPlanData.location.id,
  //       systemMasterId: auditPlanData.systemName,
  //       role: auditPlanData.role,
  //       scope: auditPlanData.scope,
  //       roleId: auditPlanData.role,
  //       AuditPlanEntitywise: auditPlanData.AuditPlanEntitywise.map((obj) => ({
  //         entityId: obj.entityId,
  //         months: obj.months,
  //       })),
  //       prefixSuffix: prefixSuffix,
  //     };
  //     await axios.post(`/api/auditPlan/createAuditPlan`, temp);
  //     setIsLoading(false);
  //     enqueueSnackbar(`successfully created`, {
  //       variant: "success",
  //     });
  //     navigate("/audit");
  //   } catch (err) {
  //     setIsLoading(false);
  //     enqueueSnackbar(`Error Occured while creating audit plan`, {
  //       variant: "error",
  //     });
  //   }
  // };

  const handleCreate = async (status = true) => {
    if (!auditPlanData.auditType) {
      enqueueSnackbar(`Please Select Audit Type`, {
        variant: "error",
      });
      return;
    }

    if (!auditPlanData.auditType) {
      enqueueSnackbar(`Please Select Audit Type`, {
        variant: "error",
      });
      return;
    }

    if (auditPlanData?.systemName?.length === 0) {
      enqueueSnackbar(`Please Select Systems Name`, {
        variant: "error",
      });
      return;
    }
    if (auditPlanData.auditName === "") {
      enqueueSnackbar(`Audit Name Should Not be Empty`, {
        variant: "error",
      });
      return;
    }
    if (status === false) {
      const test = [];
  
      for (const value of auditPlanData?.AuditPlanEntitywise) {
    
        if (value.months.includes(true) === true) {
          test.push(true);
        }
      }

      if (test?.length === 0) {
        enqueueSnackbar(`Select Month`, {
          variant: "error",
        });
        return;
      }
    }

    try {
      const response = await axios.get(
        `/api/serial-number/generateSerialNumber?moduleType=Audit Plan&location=${
          isOrgAdmin ? auditPlanData.location : auditPlanData.location.id
        }&createdBy=${userInfo?.id}&organizationId=${organizationId}`
      );

      const generatedValue = response.data;
      // Get the current month and year
      const currentDate = new Date();
      const currentMonth = (currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      const currentYear = currentDate.getFullYear().toString().slice(-2);
      const LocationId = userInfo?.location?.locationId;
      const systems = auditPlanData?.systemName?.map((item: any) => {
        if (item.hasOwnProperty("id")) {
          return item.id;
        } else {
          return item._id;
        }
      });
      const EntityId = userInfo?.entity?.entityId;
      // Replace all instances of "MM" with currentMonth
      const transformedValue = generatedValue
        .split("MM")
        .join(currentMonth)
        .split("YY")
        .join(currentYear)
        .split("LocationId")
        .join(isOrgAdmin ? locationNo : LocationId)
        .split("DepartmentId")
        .join(isOrgAdmin ? "MCOE Department" : EntityId);

      setIsLoading(true);
  
      const temp = {
        auditName: isEdit
          ? `${auditPlanData.auditName} copy`
          : auditPlanData.auditName,
        auditYear: auditPlanData.year,
        status: auditPlanData.status,
        isDraft: status,
        publishedOnDate: new Date(),
        auditType: auditPlanData.auditType,
        systemTypeId: auditPlanData.systemType,
        entityTypeId: auditPlanData.scope.id,
        comments: auditPlanData.comments,
        // location: isOrgAdmin
        //   ? auditPlanData.location
        //   : auditPlanData.location.id,
        location:
          typeof auditPlanData.location === "object" &&
          auditPlanData.location !== null &&
          auditPlanData.location !== undefined
            ? auditPlanData.location.id
            : auditPlanData.location,
        systemMasterId:
          auditPlanData.scope.name === "Unit"
            ? systems
            : auditPlanData.systemName,
        role: auditPlanData.role,
        scope: auditPlanData.scope,
        roleId: auditPlanData.role,
        auditorCheck: auditPlanData.auditorCheck,
        AuditPlanEntitywise: auditPlanData.AuditPlanEntitywise.map((obj) => ({
          entityId: obj.entityId,
          months: obj.months,
          auditors: obj.auditors,
          deleted: obj.deleted,
          // deleted :true,
        })),
        prefixSuffix: transformedValue, // Use the transformedValue here
      };

      const res = await axios.post(`/api/auditPlan/createAuditPlan`, temp);
      setIsLoading(false);
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(`successfully created`, {
          variant: "success",
        });

        // if (!auditPlanData.auditorCheck) {
        navigate("/audit");
        // } else {
        // setFinalisedAuditorTourOpen(true);
        // }
      }
    } catch (error: any) {
      // if (error.indexOf(errorCode) !== -1) {
      //   setIsLoading(false);
      //   enqueueSnackbar(`Audit Name already Exist`, {
      //     variant: "error",
      //   });
      // } else {
      setIsLoading(false);
      enqueueSnackbar(`Audit Name already Exist`, {
        variant: "error",
      });
      // }
    }
    // }

    // ... (other code)
  };

  // put API here
  const handleUpdate = async (status = true) => {
    if (!auditPlanData.auditType) {
      enqueueSnackbar(`Please Select Audit Type`, {
        variant: "error",
      });
      return;
    }
    if (auditPlanData.systemName.length === 0) {
      enqueueSnackbar(`Please Select Audit Type`, {
        variant: "error",
      });
      return;
    }
    if (auditPlanData.auditTypeName === "") {
      enqueueSnackbar(`Audit Name Should Not be Empty`, {
        variant: "error",
      });
      return;
    }
    if (auditPlanData.auditName === "") {
      enqueueSnackbar(`Audit Name Should Not be Empty`, {
        variant: "error",
      });
      return;
    }
    if (status === false) {
      const test = [];
   
      for (const value of auditPlanData?.AuditPlanEntitywise) {
    
        if (value.months.includes(true) === true) {
          test.push(true);
        }
      }

      if (test?.length === 0) {
        enqueueSnackbar(`Select Month`, {
          variant: "error",
        });
        return;
      }
    }
    try {
      setIsLoading(true);

      const systems = auditPlanData?.systemName?.map(
        (item: any) => item.id || item._id
      );
      const temp = {
        auditName: auditPlanData.auditName,
        auditYear: auditPlanData.year,
        status: auditPlanData.status,
        publishedOnDate: auditPlanData.createdOn,
        systemTypeId: auditPlanData.systemType,
        entityTypeId: auditPlanData.scope.id,
        comments: auditPlanData.comments,
        auditType: auditPlanData.auditType,
        isDraft: status,
        location: isOrgAdmin
          ? auditPlanData.locationId
          : auditPlanData.location.id,
        systemMasterId:
          auditPlanData?.location?.id === "" || auditPlanData?.locationId === ""
            ? systems
            : auditPlanData.systemName,
        scope: auditPlanData.scope,
        auditorCheck: auditPlanData.auditorCheck,
        // auditors: auditPlanData.auditors,
        role: auditPlanData.role,
        roleId: auditPlanData.role,
        AuditPlanEntitywise: auditPlanData.AuditPlanEntitywise.map((obj) => ({
          id: obj.id,
          entityId: obj.entityId,
          months: obj.months,
          auditors: obj.auditors,
        })),
      };
      const res = await axios.put(`/api/auditPlan/updateAuditPlan/${id}`, temp);
      if (status !== true) {
        if (res.status === 201 || res.status === 200) {
          try {
            const mail = await axios.post(
              `/api/auditPlan/sendMailForHead/${id}`
            );
          } catch (error) {}
        }
      }

      setIsLoading(false);
      enqueueSnackbar(`successfully created`, {
        variant: "success",
      });
      navigate("/audit");
    } catch (err) {
      setIsLoading(false);
      enqueueSnackbar(`Error Occured while creating audit plan`, {
        variant: "error",
      });
    }
  };

  // const tabs = [
  //   {
  //     label: "Audit System",
  //     key: 1,
  //     children: (
  //       <AuditPlanForm1
  //         initialiseEntities={initialiseEntities}
  //         auditPlanData={auditPlanData}
  //         setAuditPlanData={setAuditPlanData}
  //         locationName={locationName}
  //         setLocationName={setLocationName}
  //         setLocationNo={setLocationNo}
  //         scope={scope}
  //         setScope={setScope}
  //         role={role}
  //         setrole={setrole}
  //         isOrgAdmin={isOrgAdmin}
  //         isModalOpen={isModalOpen}
  //         setIsModalOpen={setIsModalOpen}
  //         isEdit={isEdit}
  //       />
  //     ),
  //   },
  //   {
  //     label: "Audit Plan",
  //     key: 2,
  //     children: (
  //       <AuditPlanForm3
  //         handleSubmit={isEdit ? handleUpdate : handleCreate}
  //         // handleNe={handleNext}
  //         auditPlanData={auditPlanData}
  //         setAuditPlanData={setAuditPlanData}
  //         isEdit={isEdit}
  //       />
  //     ),
  //   },
  //   {
  //     label: "Information",
  //     key: 3,
  //     children: (
  //       <AuditPlanForm2
  //         auditPlanData={auditPlanData}
  //         setAuditPlanData={setAuditPlanData}
  //         isModalOpen={isModalOpen}
  //         setIsModalOpen={setIsModalOpen}
  //         isEdit={isEdit}
  //       />
  //     ),
  //   },
  // ];

  const operations = <label>{auditPlanData?.prefixSuffix}</label>;

  // const OperationsSlot: Record<PositionType, React.ReactNode> = {
  //   left: <Button className="tabs-extra-demo-button">Left Extra Action</Button>,
  //   right: <Button>Right Extra Action</Button>,
  // };

  // type PositionType = "left" | "right";

  // const [position, setPosition] = useState<PositionType[]>(["left", "right"]);

  // const slot = useMemo(() => {
  //   if (position.length === 0) return null;

  //   return position.reduce(
  //     (acc, direction) => ({ ...acc, [direction]: OperationsSlot[direction] }),
  //     {}
  //   );
  // }, [position]);

  const [isPopoverOpen, setPopoverOpen] = useState<boolean>(false);

  const handlePopoverOpenChange = (open: any) => {
    setPopoverOpen(open);
  };

  const closePopover = (open: any) => {
    setPopoverOpen(false);
  };
  console.log("text in", auditPlanData.isDraft, isEdit);

  // help tour guide

  const [openTourForAuditPlanForm1, setOpenTourForAuditPlanForm1] =
    useState<boolean>(false);

  const refForForAuditPlanForm1 = useRef(null);
  const refForForAuditPlanForm2 = useRef(null);
  const refForForAuditPlanForm3 = useRef(null);
  const refForForAuditPlanForm4 = useRef(null);
  const refForForAuditPlanForm5 = useRef(null);
  const refForForAuditPlanForm6 = useRef(null);
  const refForForAuditPlanForm7 = useRef(null);
  const refForForAuditPlanForm8 = useRef(null);
  const refForForAuditPlanForm9 = useRef(null);
  const refForForAuditPlanForm10 = useRef(null);

  const stepsForAuditPlanForm1: TourProps["steps"] = [
    {
      title: "Audit Type",
      description: "All the created MRM plan for your unit can be viewed here",

      target: () =>
        refForForAuditPlanForm1.current
          ? refForForAuditPlanForm1.current
          : null,
    },

    {
      title: "Audit Name",
      description:
        "By default, your unit’s MRM Plan displayed for general user and MCOE can select any unit to view MRM plan",
      target: () => refForForAuditPlanForm2.current,
    },
    {
      title: "Location",
      description:
        "Select the systems to view the list of MRM plans associated with the selected system",
      target: () => refForForAuditPlanForm3.current,
    },
    {
      title: "System Name",
      description:
        "By default , this view will show the MRM plans created in the current year . Click on this link < to see prior year plans. Use > to move back to the current year",

      target: () =>
        refForForAuditPlanForm4.current
          ? refForForAuditPlanForm4.current
          : null,
    },
    {
      title: "Grid",
      description:
        "Select Months for which audit is to be planned by using the checkbox.",
      target: () => refForForAuditPlanForm5.current,
    },
    {
      title: "icon",
      description:
        "- Remove entries from the plan . Re-add them when required by selecting from the dropdown and selecting + ",
      target: () => refForForAuditPlanForm6.current? refForForAuditPlanForm6.current : null,
      
    },
    {
      title: "Kebab Menu",
      description:
        "Use the (Kebab Menu Image) to select /repeat selection for all months.Duplicate the current row selection to all other rows . Clear Rows to clear selections and reselect choices. Where Audit Types require coordination of dates prior to a planned month,  Finalize Auditor Option is displayed  in the menu. Use the option to select auditors, inform unit coordinators and have the stakeholders accept the dates for audit",

      target: () =>
        refForForAuditPlanForm7.current
          ? refForForAuditPlanForm7.current
          : null,
    },
    {
      title: "Duplicate",
      description:
        "Select a prior audit plan to duplicate . This would eliminate the need to enter information from scratch . All of the selected entities and months from the selected audit plan are copied below in the grid ",
      target: () => refForForAuditPlanForm8.current,
    },
    {
      title: "Draft",
      description:
        " Click on Draft to save unfinished entries ",
      target: () => refForForAuditPlanForm9.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForForAuditPlanForm10.current,
    },
  ];

  return (
    <>
      <div>
        <Popover
          content={
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 30px 0 20px",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontWeight: "5rem" }}>Information</h3>
                </div>
                <div>
                  <IconButton
                    onClick={closePopover}
                    style={{ margin: 0, padding: 0 }}
                  >
                    <img
                      src={CloseIconImageSvg}
                      alt="close-drawer"
                      style={{
                        width: "36px",
                        height: "38px",
                        cursor: "pointer",
                      }}
                    />
                  </IconButton>
                </div>
              </div>
              <Divider
                style={{ margin: "0 0 10px 0", border: "1px Solid #aaaaaa" }}
              />
              <AuditPlanForm2
                auditPlanData={auditPlanData}
                setAuditPlanData={setAuditPlanData}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                isEdit={isEdit}
              />
            </div>
          }
          title=""
          open={isPopoverOpen} // Use 'open' instead of 'visible'
          onOpenChange={handlePopoverOpenChange} // Use 'onOpenChange'
          trigger="click"
          overlayStyle={{
            width: "80%",
            padding: "3%",
          }}
          // arrow={{ pointAtCenter: true }}
          style={{ maxWidth: "100% !important" }}
        ></Popover>
      </div>
      <div className={classes.root}>
        <SingleFormWrapper
          parentPageLink="/audit"
          backBtn={false}
          disableFormFunction={true}
          label={
            <div style={{ width:"83vw",   display: "flex", justifyContent: "space-between" }}>
              <div>
                Audit Plan {auditPlanData?.prefixSuffix} for{" "}
                {auditPlanData.year}
                <MdOutlineInfo
                  style={{ marginLeft: "8px", paddingTop: "5px" }}
                  onClick={() => setPopoverOpen(!isPopoverOpen)}
                />
              </div>

              <div
              // style={{ position: "fixed", top: "77px", right: "120px" }}
              >
                <MdTouchApp
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setOpenTourForAuditPlanForm1(true);
                  }}
                />
              </div>
            </div>
          }
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10%",
              }}
            >
              <CircularProgress />
            </div>
          ) : (
            <>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "20px",
                }}
                // className={classes.tabsWrapper}
              >
                {/* <Tabs
                  activeKey={activeTab}
                  type="card"
                  onChange={handleTabChange} // This will handle the tab changes
                  animated={{ inkBar: true, tabPane: true }}
                  style={{ marginLeft: "10px" }}
                  tabBarExtraContent={operations}
                >
                  {tabs.map((tab) => (
                    <Tabs.TabPane key={tab.key} tab={tab.label}>
                      {tab.children}
                    </Tabs.TabPane>
                  ))}
                </Tabs>

                <Divider style={{ marginTop: "20px" }} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <Button
                    size="middle"
                    disabled={activeTab === "1"}
                    onClick={handlePrevious}
                    className={classes.previousButton}
                  >
                    Previous
                  </Button>
                  {activeTab === "2" ? (
                    <Button
                      size="middle"
                      type="primary"
                      onClick={isEdit ? handleUpdate : handleCreate}
                      className={classes.colorFilledButton}
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button
                      size="middle"
                      disabled={activeTab === tabs.length.toString()}
                      onClick={handleNext}
                      className={classes.colorFilledButton}
                    >
                      Next
                    </Button>
                  )}
                </div> */}

                <AuditPlanForm1
                  initialiseEntities={initialiseEntities}
                  auditPlanData={auditPlanData}
                  setAuditPlanData={setAuditPlanData}
                  locationName={locationName}
                  setLocationName={setLocationName}
                  setLocationNo={setLocationNo}
                  scope={scope}
                  setScope={setScope}
                  role={role}
                  setrole={setrole}
                  isOrgAdmin={isOrgAdmin}
                  isModalOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                  isEdit={isEdit}
                  disabledForDeletedModal={deletedId ? true : false}
                  isReadOnly={isReadOnly}
                  refForForAuditPlanForm1={refForForAuditPlanForm1}
                  refForForAuditPlanForm2={refForForAuditPlanForm2}
                  refForForAuditPlanForm3={refForForAuditPlanForm3}
                  refForForAuditPlanForm4={refForForAuditPlanForm4}
                />
                <Divider
                  style={{
                    margin: 0,
                    padding: 0,
                    border: "1px solid #F7F6F6",
                  }}
                />
                <AuditPlanForm3
                  handleSubmit={isEdit ? handleUpdate : handleCreate}
                  // handleNe={handleNext}
                  auditPlanData={auditPlanData}
                  removedList={removedList}
                  setRemovedList={setRemovedList}
                  setAuditPlanData={setAuditPlanData}
                  getAuditPlanDetailsById={getAuditPlanDetailsById}
                  isEdit={isEdit}
                  disabledForDeletedModal={deletedId ? true : false}
                  isReadOnly={isReadOnly}
                  finalisedAuditorTourOpen={finalisedAuditorTourOpen}
                  setFinalisedAuditorTourOpen={setFinalisedAuditorTourOpen}
                  // refForForAuditPlanForm5={refForForAuditPlanForm5}
                  // refForForAuditPlanForm6={refForForAuditPlanForm6}
                  // refForForAuditPlanForm7={refForForAuditPlanForm7}
                />
                <Divider style={{ marginTop: "20px" }} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between", // Adjusted justifyContent
                  }}
                
                >
                  {isEdit ? (
                    <Button
                      size="middle"
                      type="primary"
                      style={{ marginRight: "10px" }}
                      onClick={() => {
                        setOpenModal(true);
                      }}
                      className={classes.colorFilledButton}
                      disabled={
                        isReadOnly ? true : isMR || isOrgAdmin ? false : true
                      }
                      ref={refForForAuditPlanForm8}
                    >
                      Duplicate This Audit Plan
                    </Button>
                  ) : (
                    <div style={{ marginRight: "10px" }}></div>
                  )}
                  <div>
                    {auditPlanData.isDraft && (
                      <Button
                        size="middle"
                        type="primary"
                        style={{ marginRight: "10px" }}
                        onClick={() => {
                          isEdit ? handleUpdate(true) : handleCreate(true);
                        }}
                        className={classes.colorFilledButton}
                        disabled={
                          isReadOnly ? true : isMR || isOrgAdmin ? false : true
                        }
                        ref={refForForAuditPlanForm9}
                      >
                        Save As Draft
                      </Button>
                    )}
                    <Button
                      size="middle"
                      type="primary"
                      onClick={() => {
                        isEdit ? handleUpdate(false) : handleCreate(false);
                      }}
                      className={classes.colorFilledButton}
                      disabled={
                        viewMode === true ? true : isReadOnly ? true : false
                      }
                      ref={refForForAuditPlanForm10}
                    >
                      Submit and Inform
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* </div> */}
        </SingleFormWrapper>
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
              This will create a new copy of existing plan. Do you want to
              continue ?
            </div>
          }
          // icon={<ErrorIcon />}
          open={openModal}
          onOk={() => {
            handleCreate(true);
          }}
          onCancel={() => {
            setOpenModal(false);
          }}
          // okText="Yes"
          okType="danger"
          // cancelText="No"
        />
      </div>

      <Tour
        open={openTourForAuditPlanForm1}
        onClose={() => setOpenTourForAuditPlanForm1(false)}
        steps={stepsForAuditPlanForm1}
      />
    </>
  );
}

export default AuditPlanFormStepper;
