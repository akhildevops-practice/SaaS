import { useEffect, useRef, useState } from "react";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { useStyles } from "./styles";
import getAppUrl from "utils/getAppUrl";
import "./styles.css";
import {
  Checkbox,
  Paper,
  Typography,
  TableRow,
  TableHead,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  FormControl,
  Tooltip,
  useMediaQuery,
} from "@material-ui/core/";
import CustomMoreMenu from "../newComponents/CustomMoreMenu";
import axios from "apis/axios.global";
import { DatePicker } from "antd";
import { MdAdd } from "react-icons/md";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import moment from "moment";
import dayjs from "dayjs";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import { MdStar } from "react-icons/md";
import { ReactComponent as DeleteIcon } from "../../assets/documentControl/Delete.svg";
import { MdInsertInvitation } from "react-icons/md";
import AuditFinaliseDateModal from "./AuditFinaliseDateModal";
import { MdVisibility } from "react-icons/md";
import { MdExpandMore } from "react-icons/md";
import getSessionStorage from "utils/getSessionStorage";
import { MdGroup } from "react-icons/md";
import Popover from "@material-ui/core/Popover";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { MdOutlineIndeterminateCheckBox } from "react-icons/md";
import { MdOutlineAddBox } from "react-icons/md";
import type { TourProps } from "antd";
type Props = {
  handleSubmit: any;
  auditPlanData: any;
  setAuditPlanData: React.Dispatch<React.SetStateAction<any>>;
  isEdit?: boolean;
  getAuditPlanDetailsById?: any;
  removedList?: any;
  setRemovedList?: any;
  disabledForDeletedModal?: boolean;
  isReadOnly?: boolean;
  finalisedAuditorTourOpen?: boolean;
  setFinalisedAuditorTourOpen: any;
};

interface IEntity {
  id: string;
  name: string;
  entityId?: string;
  months: boolean[];
}

interface AuditPlanHeadProps {
  headCells: string[];
}

/**
 *
 * @param {boolean} isEdit This is to check if the form is in EDIT mode
 * This the whole UI structure of the Audit Plan Form
 */

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: "#E8F3F9",
      color: "#black",
      textAlign: "center",
      padding: "15px",
    },
    body: {
      fontSize: 14,
      // border: "10px solid black",
    },
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      boxShadow: "0px 4px 4px -2px rgba(0, 0, 0, 0.5)",
      borderBottom: "1px solid #F5F5F5",
    },
  })
)(TableRow);

function AuditPlanHead({ headCells }: AuditPlanHeadProps) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((label, index) => {
          return (
            <StyledTableCell
              key={index}
              style={index === 0 ? { fontSize: "1rem", textAlign: "left" } : {}}
            >
              {label}
            </StyledTableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}

function AuditPlanForm3({
  handleSubmit,
  auditPlanData,
  setAuditPlanData,
  isEdit = false,
  getAuditPlanDetailsById,
  removedList,
  setRemovedList,
  disabledForDeletedModal,
  isReadOnly = false,
  finalisedAuditorTourOpen = false,
  setFinalisedAuditorTourOpen,
}: Props) {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles(matches)();

  const smallScreen = useMediaQuery("(min-width:456px)");
  const userDetails = getSessionStorage();
  const navigate = useNavigate();
  const realmName = getAppUrl();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [settings, setSettings] = useState();
  const [user, setUsers] = useState<[]>([]);
  const [locationList, setLocationList] = useState<any[]>([]);

  const { RangePicker } = DatePicker;
  const isMR = checkRoles(roles.MR);
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  // const [auditorList, setAuditorList] = useState<any[]>([]);
  const [LeadList, setLeadList] = useState<any[]>([]);
  const [currentDate, setcurrentDate] = useState("");
  const [removed, setRemoved] = useState<boolean>(false);
  const [auditFinaliseDateModal, setAuditFinaliseDateModal] = useState({
    open: false,
    data: {},
    mode: isEdit ? "edit" : "create",
  });
  const [userAcceptFlag, setUserAcceptFlag] = useState<any>([]);

  const [formData, setFormData] = useState<any>({
    unitHead: [
      {
        name: "",
      },
    ],
    auditors: [
      {
        name: "",
      },
    ],
  });
  const [finalisedDateObject, setFinalisedDateObject] = useState<any>();

  const [currentRowId, setCurrentRowId] = useState<any>("");

  const [finalisedDateRange, setFinalisedDateRange] = useState<any>({
    fromDate: null,
    toDate: null,
  });
  const { enqueueSnackbar } = useSnackbar();
  const [auditPlanUnitWise, setAuditPlanUnitWise] = useState<any>([]);

  const [allAuditPlanUnitWise, setAllAuditPlanUnitWise] = useState<any>([]);

  const [unitHead, setUnitHead] = useState({
    name: { id: "", username: "", email: "", avatar: "" },
    location: "",
    role: "Head",
    accepted: "WAITING",
  });

  const [imscoordinator, setImsCoordinator] = useState({
    name: { id: "", username: "", email: "", avatar: "" },
    location: "",
    role: "IMSC",
    accepted: "WAITING",
  });

  const [otherUsers, setOtherUsers] = useState([]);

  const [usersSelectionGridRows, setUsersSelectionGridRows] = useState<any>([
    unitHead,
    imscoordinator,
    ...otherUsers,
  ]);
  const [auditorsRows, setAuditorsRows] = useState<any>([
    {
      name: { id: "", username: "", email: "", avatar: "" },
      location: "",
      role: "AUDITOR",
      accepted: "WAITING",
    },
  ]);

  const [commentText, setCommentText] = useState<any>("");
  const [comments, setComments] = useState<any>([]);
  const [restoreId, setRestoreId] = useState<any>("");
  const [planDetails, setPlanDetails] = useState<any>({
    auditPlanId: "",
    unitId: "",
  });

  const [people, setPeople] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openPopover = Boolean(anchorEl);
  const [anchorElDate, setAnchorElDate] = useState(null);
  const { paramId } = useParams();
  // const openDatePopover = Boolean(anchorElDate);
  const [openPopovers, setOpenPopovers] = useState(
    Array(allAuditPlanUnitWise.length).fill(false)
  );
  const [dataLoading, setDataLoading] = useState<any>(false);
  const [teamLeadId, setTeamLeadId] = useState<any>(null);
  const [selectedAuditPeriod, setSelectedAuditPeriod] = useState<any>("");

  const location = useLocation();
  const [currentStepForTour, setCurrentStepForTour] = useState<any>(0);

  const ref1 = useRef<any>(null);
  const ref2 = useRef<any>(null);

  const stepsForTour: TourProps["steps"] = [
    {
      title: "Click Here",
      description: "Please Click to Finalise Dates",
      target: () => (ref1.current ? ref1.current : null),
      onNext: () => {
        // setIsNewJobClicked(true); // Assuming this is needed to display the next button
        setCurrentStepForTour(currentStepForTour + 1); // Move to the next step
      },
      // nextButtonProps: {
      //   style: { display: isJobSelectedOnTour ? "inline" : "none" },
      // },
      onPrev: () => {
        setCurrentStepForTour(currentStepForTour - 1); // Move to the previous step
      },
    },
  ];

  // useEffect(() => {
  //   console.log("checkaudit audit PlanData in plan form 3", auditPlanData);
  // }, [auditPlanData]);

  // useEffect(() => {
  //   console.log("checkaudit audit finalise dates ", finalisedDateObject);
  // }, [finalisedDateObject]);

  // useEffect(() => {
  //   console.log("checkaudit audit userAcceptFlag", userAcceptFlag);
  // }, [userAcceptFlag]);

  const headCells = [
    " ",
    " ",
    // auditPlanData.auditorCheck && "Auditors",
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
    " ",
  ].filter(Boolean);

  const headcells2 = [
    " ",
    " ",
    // auditPlanData.auditorCheck && "Auditors",
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
    " ",
  ].filter(Boolean);

  const headcells3 = [
    " ",
    " ",
    // auditPlanData.auditorCheck && "Auditors",
    "Planned Dates",
    " ",
    "Finalised Dates",
    isEdit && auditPlanData.auditorCheck && "Action",
    // finalisedAuditorTourOpen && auditPlanData?.auditorCheck && "Finalised Dates"
  ].filter(Boolean);

  useEffect(() => {
    orgdata();
    getUsers();
    getLocationOptions();
  }, []);

  // useEffect(() => {
  //   console.log("checkaudit people->", people);
  // }, [people]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const auditplanunitwiseId = queryParams.get("auditplanunitwiseId");
    // console.log("checkaudit auditplanunitwiseId", auditplanunitwiseId);
    if (auditplanunitwiseId) {
      fetchAuditPlanUnitWiseByIdForModal(auditplanunitwiseId);
    }

    // console.log("checkauditnew open modal-- location state", location?.state);

    if (location?.state?.fromAuditPlanView) {
      setAuditPlanData(location?.state?.auditPlanData);
      openAuditFinaliseDateModalInCreateModeFromNavigation(location?.state);
    }
  }, [location]);

  // useEffect(() => {
  //   console.log("checkaudit1 openpopovers", openPopovers);
  // }, [openPopovers]);

  useEffect(() => {
    if (auditPlanData?.auditPlanId) {
      getAllFinalizedDatesForAuditPlan();
    }
  }, [auditPlanData]);

  // useEffect(()=>{
  //   console.log("checkauditnew useraccept flag useeeffect", userAcceptFlag);

  // },[userAcceptFlag])

  useEffect(() => {
    const date = moment();
    const dateComponent = date.format("YYYY-MM-DD");
    const timeComponent = date.format("HH:mm");
    setcurrentDate(`${dateComponent}T${timeComponent}`);
    const getLead = async () => {
      const encodedSystems = encodeURIComponent(
        JSON.stringify(auditPlanData.systemName)
      );
      await axios(`/api/auditPlan/getAllAuditors/${encodedSystems}`)
        .then((res) => {
          setLeadList(
            res.data.map((obj: any) => ({
              id: obj.id,
              username: obj.username,
              email: obj.email,
              avatar: obj.avatar,
              location: obj.location.locationName,
              leadAuditor: obj.leadAuditor,
            }))
          );
        })
        .catch((err) => console.error(err));
    };
    getLead();
  }, [auditPlanData.systemName]);

  useEffect(() => {
    if (removed) {
      const data = auditPlanData?.AuditPlanEntitywise?.filter(
        (obj: any) => obj.deleted
      ).map((obj: any) => ({
        id: obj.id,
        entityId: obj.entityId,
        name: obj.name,
        deleted: obj.deleted,
      }));
      setRemovedList(data);
      setRemoved(false);
    }
  }, [removed]);

  const orgdata = async () => {
    const realm = getAppUrl();
    const response = await axios.get(`/api/organization/${realm}`);
    setSettings(response.data.fiscalYearQuarters);
  };
  const handleCheck = (rowIndex: number, colIndex: number) => {
    setAuditPlanData((prev: any) => ({
      ...prev,
      AuditPlanEntitywise: prev.AuditPlanEntitywise.map(
        (obj: any, i: number) => {
          if (i === rowIndex) {
            return {
              ...obj,
              months: obj.months.map((bool: boolean, j: number) => {
                if (j === colIndex) return !bool;
                return bool;
              }),
            };
          }
          return obj;
        }
      ),
    }));
  };
  // Function to determine the start month of the fiscal year based on settings
  // const getStartMonth = (settings: string) => {
  //   if (settings === "Jan - Dec") {
  //     return 0; // January
  //   } else if (settings === "April - Mar") {
  //     return 3; // April
  //   }
  //   // Default to January if settings are not recognized
  //   return 0;
  // };

  // const handleCheck = async (
  //   rowIndex: number,
  //   colIndex: number,
  //   settings: any
  // ) => {
  //   const currentDate = new Date();
  //   const currentMonth = currentDate.getMonth();
  //   const currentYear = currentDate.getFullYear();
  //   const startMonth = getStartMonth(settings);
  //   const orgId = sessionStorage.getItem("orgId");
  //   // Determine the fiscal year for the current month
  //   const fiscalYear =
  //     currentMonth >= startMonth ? currentYear : currentYear - 1;
  //   console.log("currentauditplanyear", auditPlanData?.year);
  //   // Allow checking only if it's the correct time according to the fiscal year
  //   if (!isReadOnly) {
  //     if (settings === "Jan - Dec" && colIndex >= currentMonth) {
  //       // For "Jan - Dec" format, allow checking from the current month onwards
  //       setAuditPlanData((prev: any) => ({
  //         ...prev,
  //         AuditPlanEntitywise: prev.AuditPlanEntitywise.map(
  //           (obj: any, i: number) => {
  //             if (i === rowIndex) {
  //               return {
  //                 ...obj,
  //                 months: obj.months.map((selected: boolean, j: number) =>
  //                   j === colIndex ? !selected : selected
  //                 ),
  //               };
  //             }
  //             return obj;
  //           }
  //         ),
  //       }));
  //     } else if (settings === "April - Mar") {
  //       if (
  //         fiscalYear === currentYear &&
  //         colIndex >= startMonth &&
  //         (colIndex <= currentMonth || // Allow editing for months up to the current month
  //           (colIndex === currentMonth && currentMonth >= startMonth)) // Allow editing for the current month if it's in the current fiscal year
  //       ) {
  //         // For the current fiscal year and months from the start month to the current month
  //         setAuditPlanData((prev: any) => ({
  //           ...prev,
  //           AuditPlanEntitywise: prev.AuditPlanEntitywise.map(
  //             (obj: any, i: number) => {
  //               if (i === rowIndex) {
  //                 return {
  //                   ...obj,
  //                   months: obj.months.map((selected: boolean, j: number) =>
  //                     j === colIndex ? !selected : selected
  //                   ),
  //                 };
  //               }
  //               return obj;
  //             }
  //           ),
  //         }));
  //       } else if (
  //         currentYear === fiscalYear &&
  //         colIndex >= startMonth &&
  //         colIndex > currentMonth
  //       ) {
  //         // For the current fiscal year and months after the current month, allow checking from the start month onwards
  //         setAuditPlanData((prev: any) => ({
  //           ...prev,
  //           AuditPlanEntitywise: prev.AuditPlanEntitywise.map(
  //             (obj: any, i: number) => {
  //               if (i === rowIndex) {
  //                 return {
  //                   ...obj,
  //                   months: obj.months.map((selected: boolean, j: number) =>
  //                     j === colIndex ? !selected : selected
  //                   ),
  //                 };
  //               }
  //               return obj;
  //             }
  //           ),
  //         }));
  //       }
  //     }
  //   }
  // };
  const getStartMonth = (settings: string, year: number): number => {
    if (settings === "Jan - Dec") {
      return 0; // January is the 0th month
    } else if (settings === "April - Mar") {
      return 3; // April is the 3rd month
    } else {
      return 0; // Default to January
    }
  };

  // const handleCheck = async (
  //   rowIndex: number,
  //   colIndex: number,
  //   settings: any
  // ) => {
  //   const currentDate = new Date();
  //   const currentMonth = currentDate.getMonth();
  //   const currentYear = currentDate.getFullYear(); // Derive current year
  //   let startMonth: number;
  //   const auditYear = auditPlanData?.year;
  //   // Determine start month based on settings and auditPlanYear
  //   const auditPlanYearInt = parseInt(auditYear);
  //   startMonth = getStartMonth(settings, auditPlanYearInt);

  //   let fiscalYear;
  //   let fiscalYearStart, fiscalYearEnd;
  //   const [startYear, endYear] = auditYear.split("-");
  //   fiscalYearStart = parseInt(startYear);
  //   fiscalYearEnd = parseInt(endYear);

  //   if (settings === "April - Mar") {
  //     if (currentMonth < 3) {
  //       fiscalYear = fiscalYearStart - 1;
  //     } else {
  //       fiscalYear = fiscalYearStart;
  //     }
  //   } else {
  //     fiscalYear = fiscalYearStart;
  //   }
  //   // Determine if all months should be open for editing
  //   const allowAllMonths = currentYear >= fiscalYearEnd + 1;
  //   console.log(
  //     "fiscalyear fiscalyearformat",
  //     fiscalYearEnd,
  //     fiscalYearStart,
  //     allowAllMonths
  //   );

  //   // Allow checking only if it's the correct time according to the fiscal year
  //   if (!isReadOnly) {
  //     if (
  //       settings === "Jan - Dec" &&
  //       (allowAllMonths || colIndex >= currentMonth)
  //     ) {
  //       // For "Jan - Dec" format, allow checking from the current month onwards
  //       setAuditPlanData((prev: any) => ({
  //         ...prev,
  //         AuditPlanEntitywise: prev.AuditPlanEntitywise.map(
  //           (obj: any, i: number) => {
  //             if (i === rowIndex) {
  //               return {
  //                 ...obj,
  //                 months: obj.months.map((selected: boolean, j: number) =>
  //                   j === colIndex ? !selected : selected
  //                 ),
  //               };
  //             }
  //             return obj;
  //           }
  //         ),
  //       }));
  //     } else if (settings === "April - Mar") {
  //       if (
  //         (fiscalYear === currentYear && colIndex >= startMonth) ||
  //         allowAllMonths
  //       ) {
  //         // For the current fiscal year or if all months are open for editing
  //         setAuditPlanData((prev: any) => ({
  //           ...prev,
  //           AuditPlanEntitywise: prev.AuditPlanEntitywise.map(
  //             (obj: any, i: number) => {
  //               if (i === rowIndex) {
  //                 return {
  //                   ...obj,
  //                   months: obj.months.map((selected: boolean, j: number) =>
  //                     j === colIndex ? !selected : selected
  //                   ),
  //                 };
  //               }
  //               return obj;
  //             }
  //           ),
  //         }));
  //       }
  //     }
  //   }
  // };

  const handleRemove = (id: string) => {
    axios
      .patch(`/api/auditPlan/removeAuditPlanEntityWiseById/${id}`)
      .then(() => {
        getAuditPlanDetailsById(paramId);
      })
      .catch((error) => {
        console.log("Error", error);
      });
  };

  const handleRestore = (id: string) => {
    axios
      .patch(`/api/auditPlan/restoreAuditPlanEntityWiseById/${id}`)
      .then(() => {
        setRestoreId("");
        getAuditPlanDetailsById(paramId);
      })
      .catch((error) => {
        console.log("Error", error);
      });
  };

  const getAllFinalizedDatesForAuditPlan = async () => {
    try {
      setDataLoading(true);
      // console.log("checkaudit auditPlainId", auditPlanData?.auditPlanId);

      const res = await axios.get(
        `/api/auditPlan/getAllAuditPlanFinalizedDatesById/${auditPlanData?.auditPlanId}`
      );
      // console.log("checkaudit getalluit wise called", res.data);

      if (res.status === 200 || res.status === 201) {
        setDataLoading(false);
        setAllAuditPlanUnitWise(res.data);
        // enqueueSnackbar("Fetched All Finalised Dates Successfully!", {
        //   variant: "success",
        //   autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        // });
      } else {
        setDataLoading(false);
        enqueueSnackbar("Error in Fetching All Finalised Dates!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in getting audit unit wise", res);
      }
    } catch (error) {
      setDataLoading(false);
      enqueueSnackbar("Error in Fetching All Finalised Dates!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in getting audit unit wise");
    }
  };

  const handleDateRange = (
    values: any,
    rowIndex: number,
    id: any,
    entityId: any
  ) => {
    const [start, end] = values; // Destructure values to get the start and end moments

    const startDate = moment(start).format("YYYY-MM-DD");
    const endDate = moment(end).format("YYYY-MM-DD");
    const date = {
      id: id,
      startDate: startDate,
      endDate: endDate,
    };
    setAuditPlanData((prev: any) => {
      return {
        ...prev,
        AuditPlanEntitywise: prev.AuditPlanEntitywise.map(
          (obj: any, i: number) => {
            if (obj.entityId === entityId) {
              // Check if obj.months has an object with the same id
              const monthIndex = obj.months.findIndex((dateObj: any) => {
                return dateObj.id === id;
              });
              if (monthIndex !== -1) {
                const updatedMonths = obj.months.map((dateObj: any) => {
                  if (dateObj.id === id) {
                    return { ...dateObj, startDate, endDate };
                  }
                  return dateObj;
                });
                // console.log("updatedMonthsss", updatedMonths);
                return {
                  ...obj,
                  months: updatedMonths,
                };
              } else {
                return {
                  ...obj,
                  months: [...obj.months, date], // Append the new date object to the months array
                };
              }
              // }
            }
            return obj;
          }
        ),
      };
    });
  };

  const handleChangeLists = (
    event: any,
    newValue: any[],
    list: string,
    name: any
  ) => {
    setAuditPlanData((prev: any) => ({
      ...prev,
      AuditPlanEntitywise: prev.AuditPlanEntitywise.map((o: IEntity) => {
        if (o.name === name)
          return {
            ...o,
            [list]: newValue?.map((val) => {
              if (typeof val === "string") return val;
              return val?.id;
            }),
          };
        else return o;
      }),
    }));
  };

  const getUsers = async () => {
    await axios(`/api/kpi-report/getAllUsers`)
      .then((res) => {
        setUsers(
          res.data.map((obj: any) => ({ id: obj.id, name: obj.username }))
        );
      })
      .catch((err) => console.error(err));
  };

  const repeatMonthy = (obj: IEntity) => {
    setAuditPlanData((prev: any) => ({
      ...prev,
      AuditPlanEntitywise: prev.AuditPlanEntitywise.map((o: any) => {
        if (o.entityId === obj.entityId)
          return { ...o, months: new Array(12).fill(true) };
        return o;
      }),
    }));
  };
  // const repeatMonthly = (obj: IEntity) => {
  //   const currentMonth = new Date().getMonth();
  //   setAuditPlanData((prev: any) => ({
  //     ...prev,
  //     AuditPlanEntitywise: prev.AuditPlanEntitywise.map((o: any) => {
  //       if (o.entityId === obj.entityId) {
  //         const months = new Array(12).fill(false); // Initialize all months to false
  //         // Set months from the current month to true
  //         for (let i = currentMonth; i < months.length; i++) {
  //           months[i] = true;
  //         }
  //         return { ...o, months };
  //       }
  //       return o;
  //     }),
  //   }));
  // };

  const clearMonthly = (obj: IEntity) => {
    setAuditPlanData((prev: any) => ({
      ...prev,
      AuditPlanEntitywise: prev.AuditPlanEntitywise.map((o: any) => {
        if (o.entityId === obj.entityId)
          return { ...o, months: new Array(12).fill(false) };
        return o;
      }),
    }));
  };

  const duplicateMonths = (m: boolean[]) => {
    setAuditPlanData((prev: any) => ({
      ...prev,
      AuditPlanEntitywise: prev.AuditPlanEntitywise.map((o: any) => ({
        ...o,
        months: m,
      })),
    }));
  };

  const removeAllMonths = () => {
    setAuditPlanData((prev: any) => ({
      ...prev,
      AuditPlanEntitywise: prev.AuditPlanEntitywise.map((o: any) => ({
        ...o,
        months: new Array(12).fill(false),
      })),
    }));
  };
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  //get all locations
  const getLocationOptions = async () => {
    await axios("/api/kpi-definition/getAllLocations")
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          id: obj.id,
          locationName: obj.locationName,
          locationNo: obj.locationId,
        }));
        setLocationList(ops);
      })
      .catch((err) => console.error(err));
  };

  const [dateRanges, setDateRanges] = useState<any>({});

  const handleAddIconClick = (
    locationName: any,
    rowIndex: any,
    id: any,
    entityId: any
  ) => {
    setDateRanges((prevDateRanges: any) => ({
      ...prevDateRanges,
      [locationName]: [
        ...(prevDateRanges[locationName] || []),
        {
          key: id,
          picker: (
            <div
              key={id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RangePicker
                format={"DD-MM-YYYY"}
                onChange={(values, value) => {
                  handleDateRange(value, rowIndex, id, entityId);
                }}
              />
              <DeleteIcon
                width={20}
                height={20}
                onClick={() => handleDeletePicker(locationName, id)}
                style={{ marginLeft: "8px" }}
              />
            </div>
          ),
        },
      ],
    }));
  };

  const handleDeletePicker = (locationName: string, id: string) => {
    setDateRanges((prevDateRanges: any) => {
      const updatedLocationRanges = (prevDateRanges[locationName] || []).filter(
        (item: any) => item.key !== id
      );

      return {
        ...prevDateRanges,
        [locationName]: updatedLocationRanges,
      };
    });
  };

  const toggleAuditFinaliseDateModal = (data: any = {}) => {
    if (data?.id) {
      setCurrentRowId(data?.id);
    }
    setAuditFinaliseDateModal({
      ...auditFinaliseDateModal,
      open: !auditFinaliseDateModal.open,
      data: {
        ...data,
      },
    });
  };

  //currently in use from audit plan view audit period modal , action column , plus button
  const openAuditFinaliseDateModalInCreateModeFromNavigation = (obj: any) => {
    // console.log(
    //   "checkauditnew obj in openAuditFinaliseDateModalInCreateModeFromNavigation",
    //   obj
    //   // settings
    // );
    // console.log("checkauditnew settings in create mode", settings);

    // const correctUnitId =
    //   auditPlanData?.scope?.name === "Unit"
    //     ? obj?.entityId
    //     : auditPlanData?.locationId;

    // obj.id --> auditPlanEnitywise id
    setPlanDetails({
      auditPlanId: obj?.auditPlanId,
      unitId: obj?.unitId,
      unitName: obj?.unitName,
      entityId: obj?.entityId || null,
      rowMonths: obj?.rowMonths || [],
      format: obj?.format || "",
    });
    setCurrentRowId(obj?.rowId);
    setFinalisedDateRange({ fromDate: null, toDate: null });
    setUnitHead({
      name: { id: "", username: "", email: "", avatar: "" },
      location: "",
      role: "Head",
      accepted: "WAITING",
    });
    setImsCoordinator({
      name: { id: "", username: "", email: "", avatar: "" },
      location: "",
      role: "IMSC",
      accepted: "WAITING",
    });
    setOtherUsers([]);
    setAuditorsRows([
      {
        name: { id: "", username: "", email: "", avatar: "" },
        location: "",
        role: "AUDITOR",
        accepted: "WAITING",
      },
    ]);
    setAuditFinaliseDateModal({
      ...auditFinaliseDateModal,
      open: !auditFinaliseDateModal.open,
      mode: "create",
    });
  };

  const openAuditFinaliseDateModalInCreateMode = (obj: any) => {
    const correctUnitId =
      auditPlanData?.scope?.name === "Unit"
        ? // ||
          // auditPlanData?.scope?.name === "Corporate Function"
          obj?.entityId
        : auditPlanData?.locationId;

    // obj.id --> auditPlanEnitywise id
    setPlanDetails({
      auditPlanId: auditPlanData?.auditPlanId,
      unitId: correctUnitId,
      unitName: obj?.name,
      entityId: obj?.entityId || null,
      rowMonths: obj?.months || [],
      format: settings || "",
    });
    setCurrentRowId(obj?.id);
    setFinalisedDateRange({ fromDate: null, toDate: null });
    setUnitHead({
      name: { id: "", username: "", email: "", avatar: "" },
      location: "",
      role: "Head",
      accepted: "WAITING",
    });
    setImsCoordinator({
      name: { id: "", username: "", email: "", avatar: "" },
      location: "",
      role: "IMSC",
      accepted: "WAITING",
    });
    setOtherUsers([]);
    setAuditorsRows([
      {
        name: { id: "", username: "", email: "", avatar: "" },
        location: "",
        role: "AUDITOR",
        accepted: "WAITING",
      },
    ]);
    setAuditFinaliseDateModal({
      ...auditFinaliseDateModal,
      open: !auditFinaliseDateModal.open,
      mode: "create",
    });
  };

  const openAuditFinaliseDateModalInEditMode = (
    auditUnitWiseObj: any,
    index: any = null,
    obj: any = {}
  ) => {
    setAnchorElDate(null);
    setOpenPopovers(Array(allAuditPlanUnitWise?.length).fill(false));
    setPlanDetails({
      auditPlanId: auditUnitWiseObj?.auditPlanId,
      unitId: auditUnitWiseObj?.unitId,
      unitName: obj?.name || "",
      rowMonths: obj?.months || [],
      format: settings || "",
    });

    const data = {
      ...auditUnitWiseObj,
    };
    setFinalisedDateObject(data);
    setAuditFinaliseDateModal({
      ...auditFinaliseDateModal,
      open: !auditFinaliseDateModal.open,
      mode: "edit",
    });
  };

  const haveAllUsersAccepted = (data: any) => {
    const { unitHead, imsCoordinator, auditors, otherUsers } = data;

    if (
      unitHead.accepted !== "ACCEPTED" ||
      imsCoordinator.accepted !== "ACCEPTED"
    ) {
      return false;
    }

    for (const auditor of auditors) {
      if (auditor.accepted !== "ACCEPTED") {
        return false;
      }
    }

    for (const user of otherUsers) {
      if (user.accepted !== "ACCEPTED") {
        return false;
      }
    }

    return true;
  };

  const closeCreateAuditFinaliseModal = (
    isDraft: any = false,
    isFinalise: any = false,
    isInform: any = false,
    justUpdateAcceptedFlag: any = false
  ) => {
    console.log(
      "checkaudit10 in closeCreateAuditFinaliseModal",
      isDraft,
      isFinalise,
      isInform,
      justUpdateAcceptedFlag
    );

    const unitHead = usersSelectionGridRows.find(
      (user: any) => user.role === "Head"
    );
    // .map((item: any) => ({ id: item.name.id, accepted: item.accepted }));
    const imsCoordinator = usersSelectionGridRows.find(
      (user: any) => user.role === "IMSC"
    );

    let otherUsersArray = [];
    if (usersSelectionGridRows?.length > 2) {
      //add all the users in otherUsersArray whose index in usersSelections is greateer than 1
      otherUsersArray = usersSelectionGridRows.slice(2).map((user: any) => ({
        id: user.name.id,
        accepted: user.accepted,
      }));
    }
    // console.log("checkaudit otherUsersArray ==>", otherUsersArray);

    // .map((item: any) => ({ id: item.name.id, accepted: item.accepted }));
    const auditors = auditorsRows
      .filter((user: any) => user.name && user.name.id)
      .map((user: any) => ({
        id: user.name.id,
        accepted: user.accepted,
      }));

    // Update finalisedDates state
    const updatedFinalisedDates: any = {
      fromDate: finalisedDateRange.fromDate,
      toDate: finalisedDateRange.toDate,
      unitHead: unitHead
        ? { id: unitHead.name.id, accepted: unitHead.accepted }
        : {},
      imsCoordinator: imsCoordinator
        ? { id: imsCoordinator.name.id, accepted: imsCoordinator.accepted }
        : {},
      auditors: auditors,
      organizationId: sessionStorage.getItem("orgId"),
      auditPlanEntitywiseId:
        auditFinaliseDateModal?.mode === "create"
          ? currentRowId
          : finalisedDateObject.auditPlanEntitywiseId,

      comments: comments,
      plannedBy: userDetails?.id,
      unitId: planDetails?.unitId,
      auditPlanId: planDetails?.auditPlanId,
      otherUsers: otherUsersArray,
      teamLeadId: teamLeadId,
      auditPeriod: selectedAuditPeriod,
    };

    // if (otherUsersArray?.length) {
    //   updatedFinalisedDates = {
    //     ...updatedFinalisedDates,
    //     otherUsers: otherUsersArray,
    //   };
    // }

    const mailUsers = [];
    auditorsRows?.map((user: any) => {
      // if (user.accepted === "WAITING") {
      mailUsers.push({
        email: user?.name?.email,
        username: user?.name?.username,
      });
      // }
    });
    // if (unitHead.accepted === "WAITING") {
    mailUsers?.push({
      email: unitHead?.name?.email,
      username: unitHead?.name?.username,
    });
    // }
    // if (imscoordinator.accepted === "WAITING") {
    mailUsers?.push({
      email: imscoordinator?.name?.email,
      username: imscoordinator?.name?.username,
    });
    // }
    if (!!otherUsers && otherUsers.length > 0) {
      otherUsers?.map((user: any) => {
        // if (user.accepted === "WAITING") {
        mailUsers.push({
          email: user?.name?.email,
          username: user?.name?.username,
        });
        // }
      });
    }

    // console.log("checkaudit1 mailusers", mailUsers);
    // console.log("checkaudit1 auditorsRows", auditorsRows);
    // console.log("checkaudit1 unitHead ", unitHead);
    // console.log("checkaudit1 imscoordinator ", imscoordinator);
    // console.log("checkaudit1 ");
    console.log("checkauditfinal close create modal", updatedFinalisedDates);

    if (justUpdateAcceptedFlag) {
      handleUpdateJustAccepetedFlag(
        updatedFinalisedDates,
        finalisedDateObject?._id,
        mailUsers
      );
    }
    if (!!isDraft && !justUpdateAcceptedFlag) {
      console.log(
        "checkaudit10 inside isDraft====>",
        isDraft,
        isFinalise,
        isInform,
        justUpdateAcceptedFlag
      );

      //save as draft
      if (auditFinaliseDateModal.mode === "create") {
        handleSaveAsDraft(
          updatedFinalisedDates,
          "",
          isInform,
          mailUsers,
          isFinalise
        );
      } else {
        handleSaveAsDraft(
          updatedFinalisedDates,
          finalisedDateObject?._id,
          isInform,
          mailUsers,
          isFinalise
        );
      }
    } else {
      //submit and infor , send mails
      if (!justUpdateAcceptedFlag) {
        if (auditFinaliseDateModal.mode === "create") {
          handleCreateAuditUnitWise(
            updatedFinalisedDates,
            mailUsers,
            isFinalise,
            isInform
          );
        } else {
          handleUpdateAuditUnitWise(
            updatedFinalisedDates,
            finalisedDateObject?._id,
            mailUsers,
            isFinalise,
            isInform,
            isDraft
          );
        }
      }
    }

    // setFinalisedDates([updatedFinalisedDates]);
  };

  const handleCreateAuditUnitWise = async (
    data: any,
    mailUsers: any,
    isFinalise: any = false,
    isInform: any = false
  ) => {
    if (isFinalise) {
      if (
        // !data?.unitHead?.id ||
        !data?.imsCoordinator?.id ||
        !data?.auditors.length
      ) {
        enqueueSnackbar(
          `Atleast One UnitHead, IMSC and Auditor is Required to Finalise the Date!`,
          {
            variant: "warning",
          }
        );
        return;
      }
    }

    try {
      let finalData = {
        ...data,
      };
      if (isFinalise) {
        finalData = {
          ...data,
          isDraft: false,
        };
      } else {
        finalData = {
          ...data,
          isDraft: true,
        };
      }
      const res = await axios.post(
        "/api/auditPlan/addUnitWiseAuditPlan",
        finalData
      );

      if (res.status === 200 || res.status === 201) {
        setAuditFinaliseDateModal({
          ...auditFinaliseDateModal,
          open: !auditFinaliseDateModal.open,
          mode: "create",
        });
        getAllFinalizedDatesForAuditPlan();
        enqueueSnackbar("Sucessfully Created Finalised Date!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        if (isInform && mailUsers?.length) {
          sendMail(mailUsers, {
            auditPlanId: auditPlanData?.auditPlanId,
            auditplanunitwiseId: res.data?._id,
            auditPlanUnitWiseData: res.data,
            isFinalise: isFinalise,
          });
        }
      } else {
        // console.log("checkaudit error in creating audit plan unit wise", res);
        enqueueSnackbar("Error in Creating Finalised Date!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
      }
    } catch (error) {
      enqueueSnackbar("Error in Creating Finalised Date!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };

  const handleSaveAsDraft = async (
    data: any,
    id = "",
    isInform: any = false,
    mailUsers: any = [],
    isFinalise: any = false
  ) => {
    try {
      if (id) {
        //update the existing finalised unitwiseaudit plan, mails wont be send
        const { plannedBy, ...newData } = data;
        const res = await axios.patch(
          `/api/auditPlan/updateAuditPlanUnitwise/${id}`,
          { ...newData, isDraft: true }
        );
        if (res.status === 200 || res.status === 201) {
          // console.log("checkaudit audit plan updated successfully", res);
          setAuditFinaliseDateModal({
            ...auditFinaliseDateModal,
            open: !auditFinaliseDateModal.open,
            mode: "edit",
          });
          getAllFinalizedDatesForAuditPlan();
          enqueueSnackbar("Successully Updated Finalised Date!", {
            variant: "success",
            autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
          });
          if (!!isInform && mailUsers?.length) {
            if (userAcceptFlag?.length) {
              sendConfirmationMail(mailUsers, {
                auditPlanId: auditPlanData?.auditPlanId,
                auditplanunitwiseId: id,
              });
            } else if (!!isInform && mailUsers?.length) {
              sendMailAfterUpdate(mailUsers, {
                auditPlanId: auditPlanData?.auditPlanId,
                auditplanunitwiseId: res.data?._id,
                auditPlanUnitWiseData: res?.data,
              });
            }
          }
        }
      } else {
        //create the finalied plan in draft mode, mails wont be send
        const res = await axios.post("/api/auditPlan/addUnitWiseAuditPlan", {
          ...data,
          isDraft: true,
        });

        if (res.status === 200 || res.status === 201) {
          setAuditFinaliseDateModal({
            ...auditFinaliseDateModal,
            open: !auditFinaliseDateModal.open,
            mode: "create",
          });
          getAllFinalizedDatesForAuditPlan();
          if (isInform && mailUsers?.length) {
            if (userAcceptFlag?.length) {
              sendConfirmationMail(mailUsers, {
                auditPlanId: auditPlanData?.auditPlanId,
                auditplanunitwiseId: id,
              });
            } else if (!!isInform && mailUsers?.length) {
              sendMail(mailUsers, {
                auditPlanId: auditPlanData?.auditPlanId,
                auditplanunitwiseId: res.data?._id,
                auditPlanUnitWiseData: res?.data,
                isFinalise: isFinalise,
              });
            }
          }
          enqueueSnackbar("Sucessfully Created Finalised Date!", {
            variant: "success",
            autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
          });
        } else {
          // console.log("checkaudit error in creating audit plan unit wise", res);
          enqueueSnackbar("Error in Creating Finalised Date!", {
            variant: "error",
            autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
          });
        }
      }
    } catch (error) {
      console.log(
        "error in handleSave as draft for adding finalised date",
        error
      );
    }
  };

  const handleUpdateJustAccepetedFlag = async (
    data: any,
    id: any,
    mailUsers: any
  ) => {
    try {
      // console.log("checkauditnew in handleUpdateJustAccepetedFlag", id);
      const { plannedBy, fromDate, toDate, ...newData } = data;
      let finalData = {
        ...newData,
      };

      // console.log("checkauditnew userAccepte Flag --->", userAcceptFlag);

      // if (!!userAcceptFlag?.length) {
      // console.log("checkauditnew useAcceptegflag", userAcceptFlag);

      if (haveAllUsersAccepted(data)) {
        finalData = {
          ...finalData,
          isDraft: false,
        };
      }
      // }

      const res = await axios.patch(
        `/api/auditPlan/updateAuditPlanUnitwise/${id}`,
        finalData
      );
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit audit plan updated successfully", res);
        setAuditFinaliseDateModal({
          ...auditFinaliseDateModal,
          open: !auditFinaliseDateModal.open,
          mode: "edit",
        });
        getAllFinalizedDatesForAuditPlan();
        enqueueSnackbar("Successully Updated Finalised Date!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        navigate("/audit");
        if (userAcceptFlag?.length) {
          sendConfirmationMail(mailUsers, {
            auditPlanId: auditPlanData?.auditPlanId,
            auditplanunitwiseId: id,
          });
        }
      } else {
        enqueueSnackbar("Error in Updating Finalised Date!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in creating audit plan unit wise", res);
      }
    } catch (error) {
      enqueueSnackbar("Error in Updating Finalised Date!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };

  const handleUpdateAuditUnitWise = async (
    data: any,
    id: any,
    mailUsers: any,
    isFinalise: any = false,
    isInform: any = false,
    isDraft: any = false
  ) => {
    console.log(
      "checkaudit10 in handleUpdateAuditUnitWise isFinalise isInform isDraft",
      isFinalise,
      isInform,
      isDraft
    );
    if (isFinalise) {
      if (
        // !data?.unitHead?.id ||
        !data?.imsCoordinator?.id ||
        !data?.auditors.length
      ) {
        enqueueSnackbar(
          `Atleast One UnitHead, IMSC and Auditor is Required to Finalise the Date!`,
          {
            variant: "warning",
          }
        );
        return;
      }
    }
    try {
      // console.log("checkaudit in handleUpdateAuditUnitWise", data);
      const { plannedBy, ...newData } = data;
      let finalData = {
        ...newData,
      };
      if (isFinalise) {
        finalData = {
          ...finalData,
          isDraft: false,
        };
      } else {
        finalData = {
          ...finalData,
          isDraft: isDraft,
        };
      }
      const res = await axios.patch(
        `/api/auditPlan/updateAuditPlanUnitwise/${id}`,
        finalData
      );
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit audit plan updated successfully", res);
        setAuditFinaliseDateModal({
          ...auditFinaliseDateModal,
          open: !auditFinaliseDateModal.open,
          mode: "edit",
        });
        getAllFinalizedDatesForAuditPlan();
        enqueueSnackbar("Successully Updated Finalised Date!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        if (userAcceptFlag?.length) {
          sendConfirmationMail(mailUsers, {
            auditPlanId: auditPlanData?.auditPlanId,
            auditplanunitwiseId: id,
          });
        } else if (!!isInform && mailUsers?.length) {
          sendMailAfterUpdate(mailUsers, {
            auditPlanId: auditPlanData?.auditPlanId,
            auditplanunitwiseId: res.data?._id,
            auditPlanUnitWiseData: res?.data,
            isFinalise: isFinalise,
          });
        }
      } else {
        enqueueSnackbar("Error in Updating Finalised Date!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in creating audit plan unit wise", res);
      }
    } catch (error) {
      enqueueSnackbar("Error in Updating Finalised Date!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };

  const fetchAuditPlanUnitWiseByIdForAuditors = async (event: any, id: any) => {
    // console.log("checkaudit event", event);
    setAnchorElDate(null);
    setOpenPopovers(Array(allAuditPlanUnitWise?.length).fill(false));
    try {
      const res = await axios.get(
        `/api/auditplan/getAuditPlanUnitwiseById/${id}`
      );
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit fetchAuditPlanUnitWiseById-->", res.data);
        setPeople(res.data.auditors);
        setAnchorEl(event.target);
        setAnchorElDate(event.target);
      } else {
        // console.log(
        //   "checkaudit status not 200 fetchAuditPlanUnitWiseById-->",
        //   res.data
        // );
      }
    } catch (error) {
      // console.log("checkaudit error in fetchAuditPlanUnitWiseById-->", error);
    }
  };

  const sendMail = async (data: any, queryData: any) => {
    try {
      // console.log("checkaudit in sendMail data", data);
      let url;
      if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
        url = `${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      } else {
        url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      }
      const body = {
        mailUsers: [...data],
        url: url,
        auditPlanUnitWiseData: queryData?.auditPlanUnitWiseData,
        isFinalise: queryData?.isFinalise,
      };
      const res = await axios.post(
        `/api/auditPlan/sendMailForAcceptance`,
        body
      );
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit Mail Has Been Sent Succesffully");
        enqueueSnackbar("Mail Has Been Sent Successfully!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
      } else {
        enqueueSnackbar("Error in Sending Mail!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in creating audit plan unit wise", res);
      }
    } catch (error) {
      enqueueSnackbar("Error in Sending Mail!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };

  const sendMailAfterUpdate = async (data: any, queryData: any) => {
    try {
      // console.log("checkaudit in sendMail data", data);
      let url;
      if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
        url = `${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      } else {
        url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      }
      const body = {
        mailUsers: [...data],
        url: url,
        auditPlanUnitWiseData: queryData?.auditPlanUnitWiseData,
        isFinalise: queryData?.isFinalise,
      };
      const res = await axios.post(`/api/auditPlan/sendMailAfterUpdate`, body);
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit Mail Has Been Sent Succesffully");
        enqueueSnackbar("Mail Has Been Sent Successfully!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
      } else {
        enqueueSnackbar("Error in Sending Mail!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in creating audit plan unit wise", res);
      }
    } catch (error) {
      enqueueSnackbar("Error in Sending Mail!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };

  const sendConfirmationMail = async (data: any, queryData: any) => {
    try {
      // console.log("checkaudit in sendMail data", data);
      let url;
      if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
        url = `${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      } else {
        url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      }
      const body = {
        mailUsers: [...data],
        user: userAcceptFlag[0],
        url: url,
      };
      const res = await axios.post(`/api/auditPlan/sendConfirmationMail`, body);
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit Mail Has Been Sent Succesffully");
        enqueueSnackbar("Mail Has Been Sent Successfully!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
      } else {
        enqueueSnackbar("Error in Sending Mail!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in creating audit plan unit wise", res);
      }
    } catch (error) {
      enqueueSnackbar("Error in Sending Mail!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };

  const fetchAuditPlanUnitWiseByIdForModal = async (id: any) => {
    try {
      const res = await axios.get(
        `/api/auditplan/getAuditPlanUnitwiseById/${id}`
      );
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit fetchAuditPlanUnitWiseById-->", res.data);
        const data = {
          _id: res.data._id,
          fromDate: res.data.fromDate,
          toDate: res.data.toDate,
          auditPlanEntityWiseId: res.data.auditPlanEntitywiseId,
          auditPlanId: res.data.auditPlanId,
          unitId: res.data.unitId,
        };

        openAuditFinaliseDateModalInEditMode(data);
      } else {
        // console.log(
        //   "checkaudit status not 200 fetchAuditPlanUnitWiseById-->",
        //   res.data
        // );
      }
    } catch (error) {
      // console.log("checkaudit error in fetchAuditPlanUnitWiseById-->", error);
    }
  };

  const handlePopoverToggle = (rowIndex: any) => {
    setOpenPopovers((prevOpenPopovers) => {
      const newOpenPopovers = [...prevOpenPopovers];
      newOpenPopovers[rowIndex] = !newOpenPopovers[rowIndex];
      return newOpenPopovers;
    });
  };

  return (
    <div className={classes.root}>
      <div
        className={classes.topText}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div className={classes.labelContainer}>
          <Typography component="span" className={classes.label}>
            Audit Year:
            <Typography component="span" className={classes.auditYear}>
              {auditPlanData.year}
            </Typography>
          </Typography>
        </div>

        <div className={classes.labelContainer}>
          <button
            disabled={isReadOnly}
            onClick={removeAllMonths}
            style={{
              backgroundColor: "white",
              padding: "5px 15px",
              borderRadius: "6px",
            }}
          >
            Clear All Rows
          </button>
        </div>
        {removedList.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "300px",
            }}
          >
            <div
              style={{
                width: "90%",
                padding: "5px",
              }}
            >
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <Select
                  name="unit"
                  // displayEmpty
                  placeholder="Restore Deleted Units"
                  value={restoreId}
                  onChange={(e: any) => {
                    setRestoreId(e.target.value);
                  }}
                  data-testid="unit"
                  disabled={isReadOnly || disabledForDeletedModal}
                  style={{ fontSize: "14px", minWidth: "100%" }}
                >
                  {removedList.map((item: any) => (
                    <MenuItem
                      key={!isEdit ? item.entityId : item.id}
                      value={!isEdit ? item.entityId : item.id}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div>
              {restoreId !== "" && (
                <Tooltip title="Restore">
                  <IconButton
                    disabled={isReadOnly}
                    onClick={() => {
                      if (!isEdit) {
                        setAuditPlanData((prev: any) => ({
                          ...prev,
                          AuditPlanEntitywise:
                            auditPlanData.AuditPlanEntitywise.map(
                              (item: {
                                entityId: string;
                                name: string;
                                deleted: boolean;
                              }) =>
                                restoreId === item.entityId
                                  ? {
                                      ...item,
                                      deleted: false,
                                    }
                                  : { ...item }
                            ),
                        }));
                        setRemoved(true);
                      } else {
                        handleRestore(restoreId);
                      }
                    }}
                  >
                    <MdOutlineAddBox />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
        )}
      </div>

      <Paper className={classes.paper}>
        <TableContainer className={classes.container}>
          <Table
            className={classes.table}
            size="small"
            stickyHeader
            aria-label="sticky table"
          >
            <AuditPlanHead
              headCells={
                auditPlanData.planType === "Date Range" &&
                auditPlanData.scope.name === "Unit"
                  ? headcells3
                  : auditPlanData.planType === "Date Range" &&
                    auditPlanData.scope.name !== "Unit"
                  ? headcells3
                  : settings === "Jan - Dec"
                  ? headCells
                  : headcells2
              }
            />
            <TableBody>
              {auditPlanData.planType === "Date Range"
                ? auditPlanData.AuditPlanEntitywise.map(
                    (obj: any, rowIndex: number) => {
                      const matchingUnitWise = allAuditPlanUnitWise.find(
                        (unit: any) => unit.unitId === obj.entityId
                      );
                      const EntityName = obj.name;
                      const id = generateUniqueId(10);
                      const locationDateRanges = dateRanges[EntityName] || [];
                      if (!obj.deleted) {
                        return (
                          <StyledTableRow key={rowIndex}>
                            <TableCell padding="checkbox">
                              <Tooltip title="Remove row unit">
                                <IconButton
                                  disabled={
                                    isReadOnly || disabledForDeletedModal
                                  }
                                  onClick={() => {
                                    if (!isEdit) {
                                      setAuditPlanData((prev: any) => ({
                                        ...prev,
                                        AuditPlanEntitywise:
                                          auditPlanData.AuditPlanEntitywise.map(
                                            (item: {
                                              entityId: string;
                                              name: string;
                                              deleted: boolean;
                                            }) =>
                                              obj.entityId === item.entityId
                                                ? {
                                                    ...item,
                                                    deleted: true,
                                                  }
                                                : { ...item }
                                          ),
                                      }));
                                      setRemoved(true);
                                    } else {
                                      handleRemove(obj.id);
                                    }
                                  }}
                                >
                                  <MdOutlineIndeterminateCheckBox />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="left">
                              <p style={{ textTransform: "capitalize" }}>
                                {EntityName}
                              </p>
                            </TableCell>

                            <TableCell align="center">
                              {isEdit ? (
                                <>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    {obj.months.map(
                                      (dates: any, colIndex: number) => (
                                        <TableCell
                                          align="center"
                                          key={colIndex}
                                        >
                                          {(isMR || isOrgAdmin) && (
                                            <RangePicker
                                              disabled={isReadOnly}
                                              format={"DD-MM-YYYY"}
                                              key={dates.id}
                                              value={[
                                                dayjs(dates?.startDate),
                                                dayjs(dates?.endDate),
                                              ]}
                                              onChange={(values) => {
                                                handleDateRange(
                                                  [
                                                    dates?.startDate,
                                                    dates?.endDate,
                                                  ],
                                                  rowIndex,
                                                  dates.id,
                                                  obj.entityId
                                                );
                                              }}
                                            />
                                          )}
                                        </TableCell>
                                      )
                                    )}
                                  </div>
                                  {locationDateRanges.map(
                                    (dateRange: any, index: any) => (
                                      <div key={index}>{dateRange.picker}</div>
                                    )
                                  )}
                                </>
                              ) : (
                                <>
                                  {locationDateRanges.map(
                                    (dateRange: any, index: any) => (
                                      <div key={index}>{dateRange.picker}</div>
                                    )
                                  )}
                                </>
                              )}
                            </TableCell>
                            <TableCell>
                              <MdAdd
                                style={{
                                  backgroundColor: "#F5F5F5",
                                  borderRadius: "5px",
                                }}
                                onClick={() => {
                                  if (!isReadOnly) {
                                    handleAddIconClick(
                                      EntityName,
                                      rowIndex,
                                      id,
                                      obj.entityId
                                    );
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {dataLoading ? (
                                <div className="loader">
                                  <CircularProgress />
                                </div>
                              ) : (
                                matchingUnitWise &&
                                matchingUnitWise.auditplanunitwiseId.map(
                                  (entry: any, index: any) => (
                                    <>
                                      <div
                                        key={index}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          marginBottom: "10px",
                                        }}
                                      >
                                        <RangePicker
                                          format="DD-MM-YYYY"
                                          value={[
                                            dayjs(entry?.fromDate),
                                            dayjs(entry?.toDate),
                                          ]}
                                          disabled
                                          className={classes.rangePickerStyle}
                                        />
                                        <IconButton
                                          // disabled={isReadOnly}
                                          style={{
                                            backgroundColor: "#F5F5F5",
                                            borderRadius: "5px",
                                            padding: 5,
                                            marginRight: "5px",
                                            marginLeft: "10px",
                                          }}
                                          onClick={() =>
                                            openAuditFinaliseDateModalInEditMode(
                                              entry,
                                              index,
                                              obj
                                            )
                                          }
                                        >
                                          <MdVisibility />
                                        </IconButton>
                                        {/* Adding PeopleIcon here */}
                                        <IconButton
                                          style={{
                                            backgroundColor: "#F5F5F5",
                                            borderRadius: "5px",
                                            padding: 5,
                                            marginLeft: "5px",
                                          }}
                                          onClick={(event: any) =>
                                            fetchAuditPlanUnitWiseByIdForAuditors(
                                              event,
                                              entry._id
                                            )
                                          }
                                        >
                                          <MdGroup />
                                        </IconButton>
                                      </div>
                                      <Popover
                                        open={openPopover}
                                        anchorEl={anchorEl}
                                        onClose={() => setAnchorEl(null)}
                                        anchorOrigin={{
                                          vertical: "bottom",
                                          horizontal: "center",
                                        }}
                                        transformOrigin={{
                                          vertical: "top",
                                          horizontal: "center",
                                        }}
                                      >
                                        <div style={{ padding: "20px" }}>
                                          {!!people &&
                                            people.length > 0 &&
                                            people
                                              .map(
                                                (person: any) =>
                                                  `${person.firstname} ${person.lastname}`
                                              )
                                              .join(", ")}
                                        </div>
                                      </Popover>
                                    </>
                                  )
                                )
                              )}
                            </TableCell>
                            {(isEdit || finalisedAuditorTourOpen) &&
                              auditPlanData.auditorCheck && (
                                <TableCell align="center">
                                  <IconButton
                                    style={{
                                      backgroundColor: "#F5F5F5",
                                      borderRadius: "5px",
                                      padding: 5,
                                    }}
                                    disabled={isMR || isOrgAdmin ? false : true}
                                    onClick={() =>
                                      openAuditFinaliseDateModalInCreateMode(
                                        obj
                                      )
                                    }
                                  >
                                    <MdInsertInvitation />
                                  </IconButton>
                                </TableCell>
                              )}
                          </StyledTableRow>
                        );
                      }
                    }
                  )
                : auditPlanData.AuditPlanEntitywise.map(
                    (obj: any, rowIndex: number) => {
                      const matchingUnitWise = allAuditPlanUnitWise.find(
                        (unit: any) => unit.unitId === obj.entityId
                      );
                      if (!obj.deleted) {
                        return (
                          <StyledTableRow key={rowIndex}>
                            <TableCell padding="checkbox">
                              <Tooltip title="Remove row unit">
                                <IconButton
                                  disabled={
                                    isReadOnly || disabledForDeletedModal
                                  }
                                  onClick={() => {
                                    if (!isEdit) {
                                      setAuditPlanData((prev: any) => ({
                                        ...prev,
                                        AuditPlanEntitywise:
                                          auditPlanData.AuditPlanEntitywise.map(
                                            (item: {
                                              entityId: string;
                                              name: string;
                                              deleted: boolean;
                                            }) =>
                                              obj.entityId === item.entityId
                                                ? {
                                                    ...item,
                                                    deleted: true,
                                                  }
                                                : { ...item }
                                          ),
                                      }));
                                      setRemoved(true);
                                    } else {
                                      console.log("edit data", obj);
                                      setAuditPlanData((prev: any) => ({
                                        ...prev,
                                        AuditPlanEntitywise:
                                          auditPlanData.AuditPlanEntitywise.filter(
                                            (item: {
                                              entityId: string;
                                              name: string;
                                              deleted: boolean;
                                            }) => obj.entityId !== item.entityId
                                          ),
                                      }));
                                      handleRemove(obj.id);
                                    }
                                  }}
                                >
                                  <MdOutlineIndeterminateCheckBox />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="left">
                              <p style={{ textTransform: "capitalize" }}>
                                {obj.name}
                                {isEdit &&
                                  matchingUnitWise?.auditplanunitwiseId
                                    ?.length > 0 && (
                                    <>
                                      <IconButton
                                        // disabled={isReadOnly}
                                        style={{
                                          backgroundColor: "#F5F5F5",
                                          borderRadius: "5px",
                                          padding: 5,
                                          marginRight: "5px",
                                          marginLeft: "10px",
                                        }}
                                        onClick={(event: any) => {
                                          setAnchorElDate(event?.target);
                                          handlePopoverToggle(rowIndex);
                                        }}
                                      >
                                        <MdExpandMore />
                                      </IconButton>
                                      {matchingUnitWise && (
                                        <>
                                          <Popover
                                            open={openPopovers[rowIndex]}
                                            anchorEl={anchorElDate}
                                            onClose={() => {
                                              setAnchorElDate(null);
                                              handlePopoverToggle(rowIndex);
                                            }}
                                            anchorOrigin={{
                                              vertical: "bottom",
                                              horizontal: "center",
                                            }}
                                            transformOrigin={{
                                              vertical: "top",
                                              horizontal: "center",
                                            }}
                                          >
                                            {dataLoading ? (
                                              <div className="loader">
                                                <CircularProgress />
                                              </div>
                                            ) : (
                                              matchingUnitWise &&
                                              matchingUnitWise.auditplanunitwiseId.map(
                                                (entry: any, index: any) => (
                                                  <>
                                                    <div
                                                      key={index}
                                                      style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        marginBottom: "10px",
                                                      }}
                                                    >
                                                      <RangePicker
                                                        format="DD-MM-YYYY"
                                                        value={[
                                                          dayjs(
                                                            entry?.fromDate
                                                          ),
                                                          dayjs(entry?.toDate),
                                                        ]}
                                                        disabled
                                                        className={
                                                          classes.rangePickerStyle
                                                        }
                                                      />
                                                      <IconButton
                                                        style={{
                                                          backgroundColor:
                                                            "#F5F5F5",
                                                          borderRadius: "5px",
                                                          padding: 5,
                                                          marginRight: "5px",
                                                          marginLeft: "10px",
                                                        }}
                                                        onClick={() =>
                                                          openAuditFinaliseDateModalInEditMode(
                                                            entry,
                                                            index,
                                                            obj
                                                          )
                                                        }
                                                      >
                                                        <MdVisibility />
                                                      </IconButton>
                                                      <IconButton
                                                        style={{
                                                          backgroundColor:
                                                            "#F5F5F5",
                                                          borderRadius: "5px",
                                                          padding: 5,
                                                          marginLeft: "5px",
                                                        }}
                                                        onClick={(event: any) =>
                                                          fetchAuditPlanUnitWiseByIdForAuditors(
                                                            event,
                                                            entry._id
                                                          )
                                                        }
                                                      >
                                                        <MdGroup />
                                                      </IconButton>
                                                    </div>
                                                  </>
                                                )
                                              )
                                            )}
                                          </Popover>
                                          <Popover
                                            open={openPopover}
                                            anchorEl={anchorEl}
                                            onClose={() => setAnchorEl(null)}
                                            anchorOrigin={{
                                              vertical: "top",
                                              horizontal: "center",
                                            }}
                                            transformOrigin={{
                                              vertical: "top",
                                              horizontal: "center",
                                            }}
                                          >
                                            <div style={{ padding: "20px" }}>
                                              {!!people &&
                                                people.length > 0 &&
                                                people.map((person: any) => (
                                                  <div
                                                    key={person.id}
                                                    style={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      textTransform:
                                                        "capitalize",
                                                    }}
                                                  >
                                                    {person.firstname}{" "}
                                                    {person.lastname}
                                                    {teamLeadId ===
                                                      person.id && (
                                                      <MdStar
                                                        color="primary"
                                                        style={{
                                                          marginLeft: "4px",
                                                        }}
                                                      />
                                                    )}
                                                    {people.indexOf(person) !==
                                                    people.length - 1
                                                      ? ", "
                                                      : ""}
                                                  </div>
                                                ))}
                                            </div>
                                          </Popover>
                                        </>
                                      )}
                                    </>
                                  )}
                              </p>
                            </TableCell>

                            {obj.months.map((bool: any, colIndex: number) => (
                              <TableCell align="center" key={colIndex}>
                                <Checkbox
                                  disabled={isReadOnly}
                                  checked={bool}
                                  onClick={() => {
                                    // handleCheck(rowIndex, colIndex, settings);
                                    handleCheck(rowIndex, colIndex);
                                  }}
                                  style={{
                                    color: bool ? "lightgray" : "#808080",
                                  }}
                                />
                              </TableCell>
                            ))}
                            <TableCell>
                              {!isReadOnly && (
                                <CustomMoreMenu
                                  options={[
                                    {
                                      label: "Repeat monthly",
                                      handleClick: () => repeatMonthy(obj),
                                    },
                                    {
                                      label: "Duplicate across rows",
                                      handleClick: () =>
                                        duplicateMonths(obj.months),
                                    },
                                    {
                                      label: "Clear Row",
                                      handleClick: () => clearMonthly(obj),
                                    },
                                    ...((isEdit || finalisedAuditorTourOpen) &&
                                    auditPlanData.auditorCheck
                                      ? [
                                          {
                                            label: "Finalize Audit Period",
                                            // ref: ref1,
                                            handleClick: () =>
                                              openAuditFinaliseDateModalInCreateMode(
                                                obj
                                              ),
                                          },
                                        ]
                                      : []),
                                  ]}
                                  anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                  }}
                                  transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                  }}
                                />
                              )}
                            </TableCell>
                            {/* {(isEdit || finalisedAuditorTourOpen) &&
                              auditPlanData.auditorCheck && (
                                <TableCell align="center">
                                  <IconButton
                                    style={{
                                      backgroundColor: "#F5F5F5",
                                      borderRadius: "5px",
                                      padding: 5,
                                    }}
                                    disabled={isMR || isOrgAdmin ? false : true}
                                    ref={ref1}
                                    onClick={() =>
                                      openAuditFinaliseDateModalInCreateMode(
                                        obj
                                      )
                                    }
                                  >
                                    <MdInsertInvitation />
                                  </IconButton>
                                </TableCell>
                              )} */}
                          </StyledTableRow>
                        );
                      }
                    }
                  )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={auditPlanData.AuditPlanEntitywise.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        /> */}
      </Paper>
      {/* <SimplePaginationController
        count={auditPlanData.AuditPlanEntitywise.length}
        page={page}
        rowsPerPage={10}
        handleChangePage={handleChangePage}
      /> */}
      {!!auditFinaliseDateModal.open && (
        <div>
          <AuditFinaliseDateModal
            auditFinaliseDateModal={auditFinaliseDateModal}
            toggleFinaliseDateModal={toggleAuditFinaliseDateModal}
            auditPlanData={auditPlanData}
            formData={formData}
            setFormData={setFormData}
            currentRowId={currentRowId}
            // onFinaliseDateUpdate={handleFinalisedDateUpdate}
            finalisedDateObject={finalisedDateObject}
            setFinalisedDateObject={setFinalisedDateObject}
            finalisedDateRange={finalisedDateRange}
            setFinalisedDateRange={setFinalisedDateRange}
            closeCreateAuditFinaliseModal={closeCreateAuditFinaliseModal}
            usersSelectionGridRows={usersSelectionGridRows}
            setUsersSelectionGridRows={setUsersSelectionGridRows}
            auditorsRows={auditorsRows}
            setAuditorsRows={setAuditorsRows}
            unitHead={unitHead}
            setUnitHead={setUnitHead}
            imscoordinator={imscoordinator}
            setImsCoordinator={setImsCoordinator}
            otherUsers={otherUsers}
            setOtherUsers={setOtherUsers}
            comments={comments}
            setComments={setComments}
            commentText={commentText}
            setCommentText={setCommentText}
            sendMail={sendMail}
            auditPlanId={auditPlanData?.auditPlanId || ""}
            planDetails={planDetails}
            setUserAcceptFlag={setUserAcceptFlag}
            teamLeadId={teamLeadId}
            setTeamLeadId={setTeamLeadId}
            selectedAuditPeriod={selectedAuditPeriod}
            setSelectedAuditPeriod={setSelectedAuditPeriod}
          />
        </div>
      )}
      {/* {!!finalisedAuditorTourOpen && (
        <Tour
          open={finalisedAuditorTourOpen}
          onClose={() => setFinalisedAuditorTourOpen(false)}
          steps={stepsForTour}
          current={currentStepForTour}
          indicatorsRender={(current, total) => (
            <span>
              {current + 1} / {total}
            </span>
          )}
        />
      )} */}
    </div>
  );
}

export default AuditPlanForm3;
