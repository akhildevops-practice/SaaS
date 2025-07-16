//react, react-router, recoil
import React, { useState, useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { drawerData, cipFormData } from "recoil/atom";
import { useLocation, useNavigate } from "react-router-dom";

//antd
import { Divider, Table, Tag, Pagination, Button, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PaginationProps } from "antd";
import { FaUserGroup } from "react-icons/fa6";
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from "react-icons/ai";

//material-ui
import {
  Box,
  Tooltip,
  CircularProgress,
  Typography,
  IconButton,
  FormControl,
  TextField,
  Grid,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";

//utils
import checkRole from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";

//assets
import EmptyTableImg from "assets/EmptyTableImg.svg";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { MdExpandMore } from "react-icons/md";
import HindalcoLogoSvg from "assets/logo/HindalcoLogoSvg.svg";

//reusable components
import SearchBar from "components/SearchBar/CipSearchBar";
import ConfirmDialog from "components/ConfirmDialog";
import MultiUserDisplay from "components/MultiUserDisplay";

//thirdparty library
import { useSnackbar } from "notistack";
import { debounce } from "lodash";
import printJS from "print-js";

//styles
import useStyles from "./styles";
import CIPDrawer from "./CIPDrawer";
import YearComponent from "components/Yearcomponent";
import getYearFormat from "utils/getYearFormat";
import { Autocomplete } from "@material-ui/lab";
import { MdAddCircleOutline } from "react-icons/md";
import ActionItemDrawer from "./ActionItemDrawer";
import { MdOutlinePictureAsPdf } from "react-icons/md";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";

const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;
type Props = {
  toggleDrawer: any;
  drawer: any;
  setDrawer: any;
  filter: any;
  setFilter: any;
  filterOpen: any;
  setFilterOpen: any;
  isGraphSectionVisible: any;
  tabFilter: any;
  fetchCIPS?: any;
  fetchChartData?: any;
  isTableDataLoading?: any;
  setIsTableDataLoading?: any;
  searchValues?: any;
  setSearch?: any;
  data?: any;
  setData?: any;
  filterList?: any;
  count?: any;
  setCount?: any;
  actionItemDrawer?: any;
  setActionItemDrawer?: any;
  page?: any;
  setPage?: any;
  rowsPerPage?: any;
  dataLength?: any;
  setDataLength?: any;
  myCip?: any;
  setMyCip?: any;
  isModalOpen?: any;
  setIsModalOpen?: any;
  // refForcip1?: any;
  // refForcip2?: any;
  // refForcip3?: any;
  // refForcip4?: any;
  // refForcip5?: any;
  // refForcip6?: any;
  // refForcip7?: any;
  // refForcip8?: any;
  // refForcip9?: any;
};

function CIPTable({
  drawer,
  setDrawer,
  actionItemDrawer,
  setActionItemDrawer,
  filter,
  isGraphSectionVisible,
  tabFilter,
  fetchChartData,
  searchValues,
  setSearch,
  fetchCIPS,
  isTableDataLoading,
  data,
  myCip,
  setMyCip,
  isModalOpen,
  setIsModalOpen,
}: // refForcip1,
// refForcip2,
// refForcip3,
// refForcip4,
// refForcip5,
// refForcip6,
// refForcip7,
Props) {
  const setFormData = useSetRecoilState(cipFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteCIP, setDeleteCIP] = useState<any>();
  const [user, setUser] = React.useState([]);

  const { enqueueSnackbar } = useSnackbar();
  const realmName = getAppUrl();
  const isOrgAdmin = checkRole("ORG-ADMIN");

  const [hoveredRow, setHoveredRow] = useState(null);
  const [currentYear, setCurrentYear] = useState<any>();
  const iconColor = "#380036";
  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);

  const locationState = useLocation();
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [locationNames, setLocationNames] = useState<Location[]>([]);
  const userDetails = getSessionStorage();
  const allOption = { id: "All", locationName: "All" };
  const [selectedLocation, setSelectedLocation] = useState<any>({
    id: userDetails?.location?.id ? userDetails?.location?.id : "All",
    locationName: userDetails?.location?.locationName
      ? userDetails?.location?.locationName
      : "All",
  });
  const allDeptOption = { id: "All", entityName: "All" };
  const [cipData, setCipData] = useState<any>(data);
  // console.log("cipData", cipData);
  // const [myCip, setMyCip] = useState(true);
  const [searchQuery, setSearchQuery] = useState<any>({
    searchQuery: "",
  });

  const [deptOptions, setDeptOptions] = useState<any[]>([]);
  const [page, setPage] = useState<any>(1);
  const [count, setCount] = useState<number>(0);
  // const [templateData, setTemplateData] = useRecoilState(cipActionItemData);
  // const [isEdit, setIsEdit] = useState<boolean>(false);
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles({
    isGraphSectionVisible: isGraphSectionVisible,
    matches,
  });
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const orgId = sessionStorage.getItem("orgId");
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [actionItemData, setActionItemData] = useState<any>([]);
  const [selectedData, setSelectedData] = useState<any>();
  const [allCategories, setAllCategories] = useState<any>();
  const [allTypes, setAllTypes] = useState<any>();
  const [allStatus, setAllStatus] = useState<any>();
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [unitId, setUnitId] = useState<string>(loggedInUser?.location?.id);
  const [deptId, setDeptId] = useState<string>(loggedInUser?.entity?.id);
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };

  const convertDateYMDToDMY = (dateString: any) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };
  const [selectedDept, setSelectedDept] = useState<any>({});

  const cipPdfReportTemplate = `
  <div>
  <style>
    * {
      font-family: "poppinsregular", sans-serif !important;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 20px;
    }
    td, th {
      border: 1px solid black;
      padding: 8px;
      text-align: left;
    }    
  </style>
    <table>
      <tr>
        <td colspan="1" style="text-align: center;">
          ${
            logo
              ? `<img src="${logo}" alt="Hindalco Logo" width="100px" height="100px" />`
              : ""
          }
        </td>
        <td colspan="3" style="text-align: center;">
          <h1>Continual Improvement Programme</h1></br>
          <h2>%DEPARTMENT%</h2>
        </td>
      </tr>
    </table>
    <div style="text-align: right;">
      <span style="font-weight: bold;">CIP Status: %STATUS%</span>
      <br>
      <span style="font-weight: bold;">Report Generated On: ${new Date().toLocaleDateString(
        "en-GB"
      )}</span>
      <br>
      <br>
    </div>
    <table>
      <tr>
        <th colspan="1" style="width : 10%">CIP Title</th>
        <td>%CIPTITLE%</td>
        <th colspan="1" style="width : 10%">Initiated By</th>
        <td>%CREATOR%</td>
      </tr>
      <tr>
        <th colspan="1" style="width : 10%">Planned Start Date</th>
        <td>%PLANNEDSTARTDATE%</td>
        <th colspan="1" style="width : 10%">Planned End Date</th>
        <td>%PLANNEDENDDATE%</td>
      </tr>
      <tr>
        <th colspan="1" style="width : 10%">CIP Category</th>
        <td>%CIPCATEGORY%</td>
        <th colspan="1" style="width : 10%">GRT Teams</th>
        <td>%CIPTEAMS%</td>
      </tr>
      <tr>
        <th colspan="1" style="width : 10%">CIP Methodology</th>
        <td>%CIPMETHODOLOGY%</td>
        <th colspan="1" style="width : 10%">CIP Origin</th>
        <td>%CIPORIGIN%</td>
      </tr>
      <tr>
        <th colspan="4">Stake Holders</th>
      </tr>
      <tr>
        <th colspan="1" style="width : 10%">Project Leader(s)/Reviewer(s)</th>
        <td>%REVIEWERS%</td>
        <th colspan="1" style="width : 10%">Project Champion(s)/Approver(s)</th>
        <td>%APPROVERS%</td>
      </tr>
      <tr>
        <th colspan="1" style="width : 10%">Project Members</th>
        <td>%PROJECTMEMBERS%</td>
        <th colspan="1" style="width : 10%">Other Project Members</th>
        <td>%OTHERPROJECTMEMBERS%</td>
      </tr>
      <tr>
        <th colspan="4">Benefit Analysis</th>
      </tr>
      <tr>
        <th colspan="1" style="width : 10%">Justification and Benefit Analysis</th>
        <td colspan="3">%JUSTIFICATION%</td>
      </tr>
      <tr>
        <th colspan="1" style="width : 10%">Project Cost(Rs)</th>
        <td colspan="3">%COST%</td>
      </tr>
    </table>
    <h3>Action Items</h3>
    <table>
      <tr>
        <th>Action Item</th>
        <th>Owner</th>
        <th>Start Date</th>
        <th>Taget Date</th>
        <th>Status</th>
      </tr>
      %CONTENT%
    </table>
  </div>`;

  const handleClickPdfOpen = (val: any) => {
    const actionItemTableData = val.actionItem
      .map((item: any) => {
        return `
      <tr>
        <td>${item.title}</td>
        <td>${item.owner.fullName}</td>
        <td>${convertDateYMDToDMY(item.startDate)}</td>
        <td>${convertDateYMDToDMY(item.endDate)}</td>
        <td>${item.status ? "Open" : "Close"}</td>
      </tr>
      `;
      })
      .join("");

    const fillTemplate = cipPdfReportTemplate
      .replace("%DEPARTMENT%", val.entity.entityName)
      .replace("%STATUS%", val.status)
      .replace("%CIPTITLE%", val.title)
      .replace("%CREATOR%", val.createdBy.name)
      .replace("%PLANNEDSTARTDATE%", val.plannedStartDate)
      .replace("%PLANNEDENDDATE%", val.plannedEndDate)
      .replace(
        "%CIPCATEGORY%",
        val.cipCategoryId.map((item: any) => item.name).join(", ")
      )
      .replace(
        "%CIPTEAMS%",
        val.cipTeamId.map((item: any) => item.name).join(", ")
      )
      .replace("%CIPMETHODOLOGY%", val.cipTypeId.join(", "))
      .replace("%CIPORIGIN%", val.cipOrigin.join(", "))
      .replace(
        "%REVIEWERS%",
        val.reviewers.map((item: any) => item.reviewerName).join(", ")
      )
      .replace(
        "%APPROVERS%",
        val.approvers.map((item: any) => item.approverName).join(", ")
      )
      .replace(
        "%PROJECTMEMBERS%",
        val.projectMembers.map((item: any) => item.reviewerName).join(", ")
      )
      .replace("%OTHERPROJECTMEMBERS%", val.otherMembers)
      .replace("%JUSTIFICATION%", val.justification)
      .replace("%COST%", val.cost)
      .replace("%CONTENT%", actionItemTableData);
    printJS({
      type: "raw-html",
      printable: fillTemplate,
    });
  };

  useEffect(() => {
    if (!currentYear) {
      getYear();
    }

    getLocationNames();
    getLogo();
  }, []);

  useEffect(() => {
    if (drawer.status === true) {
      getAllCip();
      // console.log("hello data actions");
      window.location.reload();
    }
  }, [drawer.status]);

  useEffect(() => {
    setCipData(data);
    setSelectedLocation({
      id: userDetails?.location?.id,
      locationName: userDetails?.location?.locationName,
    });
  }, [data]);

  useEffect(() => {
    if (selectedLocation) {
      getAllCip();
      getDepartmentOptions();
    }
  }, [selectedLocation, deptId]);

  useEffect(() => {
    //getAllCip();
    handlePagination(1, 10);
  }, [searchQuery]);

  useEffect(() => {
    if (loggedInUser?.entityId) {
      fetchInitialDepartment(loggedInUser.entityId);
    }
  }, [loggedInUser?.entityId]);

  // useEffect(() => {
  //   if (!isOrgAdmin) {
  //     setSelectedLocation({
  //       id: userDetails?.location?.id,
  //       locationName: userDetails?.location?.locationName,
  //     });
  //   }
  // }, [locationNames]);

  useEffect(() => {
    if (locationState.state && locationState.state.drawerOpenEditMode) {
      // Open the drawer
      setDrawer({
        ...drawer,
        open: !drawer.open,
        mode: "edit",
        toggle: true,
        clearFields: false,
        data: { ...drawer?.data, id: drawerDataState?.id },
      });
    } else if (locationState.state && locationState.state.drawerOpenAddMode) {
      setDrawer({
        ...drawer,
        open: !drawer.open,
        clearFields: false,
        toggle: true,
        mode: "create",
        data: { ...drawer?.data, id: null },
      });
    }
  }, [locationState]);

  const getYear = async () => {
    let getCurrentYear;
    if (!currentYear) {
      getCurrentYear = await getYearFormat(new Date().getFullYear());
    }
    setCurrentYear(getCurrentYear);
  };

  useEffect(() => {
    if (currentYear) {
      getAllCip();
    }
  }, [currentYear]);

  const getLocationNames = async () => {
    setIsLoading(true);
    try {
      setIsLoading(true);
      // console.log("api called");
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );
      // console.log("res?.data", res.data);
      setLocationNames(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };
  const getDeptSelectedItem = () => {
    const item = [allDeptOption, ...deptOptions].find((opt: any) => {
      if (opt.id === deptId) return opt;
    });
    return item || {};
  };
  //console.log("drawer from inbox", drawer);
  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteCIP(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    handleClose();
    setIsLoading(true);
    try {
      const res = await axios.delete(`/api/cip/${deleteCIP}`);
      enqueueSnackbar(`Deleted Successfully`, { variant: "success" });
      setIsLoading(false);
      getAllCip();
    } catch (err) {
      enqueueSnackbar(`Error ${err}`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchQuery({
      ...searchValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleTableSearch = async () => {
    setPage(1);
    setRowsPerPage(10);
    getAllCip();
  };

  const handleClickDiscard = () => {
    setSearchQuery({ searchQuery: "" });
    setIsLoading(true);
  };

  const handleEditCIP = (data: any) => {
    setFormData(cipFormData);
    setDrawer({
      ...drawer,
      mode: "edit",
      clearFields: false,
      toggle: false,
      data: data,
      open: !drawer.open,
    });
  };
  const getDepartmentOptions = async () => {
    try {
      if (selectedLocation.id) {
        // console.log("unitId", unitId);
        const result = await axios(
          `/api/cara/getEntitiesForLocation/${selectedLocation?.id}`
        );

        setDeptOptions(result?.data);
      }
    } catch (error) {
      enqueueSnackbar("Error fetching entities", { variant: "error" });
    }
  };
  const handleEditActionItem = (data: any) => {
    setFormData(cipFormData);
    setActionItemDrawer({
      ...drawer,
      mode: "edit",
      clearFields: false,
      toggle: false,
      data: { ...data },
      tableSub: actionItemData,
      open: !setActionItemDrawer.open,
      rowData: selectedData,
    });
  };
  const handleDepartment = (event: any, values: any) => {
    //console.log("selected department", values);
    if (values && values?.id) {
      setDeptId(values?.id);
    }
    // const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&page=${page}&limit=10`;
    // getData(url);
  };
  const handlePagination = async (
    pagein: any,
    pageSizein: any = rowsPerPage
  ) => {
    setPage(pagein);
    setRowsPerPage(pageSizein);

    let result: any;
    let actionItems: any;
    if (currentYear && selectedLocation) {
      //console.log("currentYEAR INSIDE ",currentYear)
      result = await axios.get(
        `/api/cip/getAll/${currentYear}/${selectedLocation?.id}?page=${pagein}&limit=${pageSizein}&search=${searchQuery?.searchQuery}&myCip=${myCip}&entityId=${deptId}`
      );

      actionItems = await axios.get(
        `/api/actionitems/getActionItemForSource?source=CIP&orgId=${orgId}&page=${page}&limit=${rowsPerPage}&unitId=&currentYear=${currentYear}`
      );
    } else {
      return;
    }

    const sortedResult = result?.data?.data.sort((a: any, b: any) =>
      a.title.localeCompare(b.title)
    );

    if (actionItems?.data?.result && actionItems?.data?.result.length > 0) {
      const actionData: any[] = [];
      actionItems?.data?.result?.map((item: any) => {
        actionData.push({
          id: item._id,
          title: item.title,
          description: item.description,
          status: item.status,
          owner: item.owner,
          startDate: item.startDate,
          endDate: item.endDate,
          source: item.source,
          year: item.year,
          additionalInfo: item.additionalInfo,
          locationId: item.locationId,
          //deleted: item.deleted,
          referenceId: item.referenceId,
          organizationId: item.organizationId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      });
      setActionItemData(actionData);
    }

    const arr: any[] = [];
    if (result?.data?.data && result?.data?.data.length > 0) {
      sortedResult.map((item: any, key: any) => {
        arr.push({
          id: item._id,
          title: item.title,
          targetDate: formatDate(item.targetDate),
          cipCategoryId: item.cipCategoryId,
          cipTeamId: item.cipTeamId,
          cipTypeId: item.cipTypeId,
          cipOrigin: item.cipOrigin,
          justification: item.justification,
          cost: item.cost,
          tangibleBenefits: item.tangibleBenefits,
          status: item.status,
          attachment: item.attachment,
          year: item.year,
          locationId: item.locationId,
          location: item?.location,
          entity: item?.entity,
          createdBy: item.createdBy,
          reviewers: item.reviewers,
          approvers: item.approvers,
          refsData: item.refsData,
          cancellation: item.cancellation,
          organizationId: item.organizationId,
          editAccess: item.editAccess,
          plannedStartDate: formatDate(item.plannedStartDate),
          plannedEndDate: formatDate(item.plannedEndDate),
          actionItem: item?.actionItem,
          projectMembers: item?.projectMembers,
          otherMembers: item?.otherMembers,
        });
      });
    }
    setCipData(arr);
    setAllCategories(result.data.allCategories);
    setAllTypes(result.data.allTypes);
    setAllStatus(result.data.allStatus);
    setCount(result.data.count);
  };

  const handleActionItem = (data: any) => {
    setFormData(cipFormData);
    setActionItemDrawer({
      ...actionItemDrawer,
      mode: "create",
      clearFields: false,
      toggle: false,
      data: data,
      open: !actionItemDrawer.open,
    });
  };

  const columns: ColumnsType<any> = [
    {
      title: "CIP Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (_: any, record: any) => (
        // record.action ? (
        <Tooltip title={record.title}>
          <div
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
              width: 130,
            }}
          >
            <div
              className={classes.clickableField}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() => {
                setReadOnly(true);
                handleEditCIP(record);
              }}
              // ref={refForcip3}
            >
              {record.title}
            </div>
          </div>
        </Tooltip>
      ),
      // ) : (
      //   <Tooltip title={record.title}>
      //     <>{record.title}</>
      //   </Tooltip>
      // ),
    },
    {
      title: "Category",
      dataIndex: "cipCategoryId",
      key: "cipCategoryId",
      render: (_: any, record: any) => {
        return <MultiUserDisplay data={record?.cipCategoryId} name="name" />;
      },
      onFilter: (value: any, record: any) => {
        return record?.cipCategoryId?.name === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        return (
          <div style={{ padding: 8 }}>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {allCategories.map((name: any) => (
                <div key={name}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedKeys([...selectedKeys, value]);
                        } else {
                          setSelectedKeys(
                            selectedKeys.filter((key: any) => key !== value)
                          );
                        }
                      }}
                      value={name}
                      checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                    />
                    {name}
                  </label>
                </div>
              ))}
              <div
                style={{
                  marginTop: 8,
                  position: "sticky",
                  bottom: 0,
                  background: "white",
                }}
              >
                <Button
                  type="primary"
                  onClick={() => {
                    setSearchQuery({ searchQuery: selectedKeys });
                    // setFilteredValues(selectedKeys);
                  }}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#E8F3F9",
                    color: "black",
                  }}
                >
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setSelectedKeys([]);
                    setSearchQuery({ searchQuery: "" });
                    confirm();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Methodology",
      dataIndex: "cipTypeId",
      key: "cipTypeId",
      render: (_: any, record: any) => {
        return <MultiUserDisplay data={record?.cipTypeId} name="name" />;
      },
      onFilter: (value: any, record: any) => {
        return record.cipTypeId === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        return (
          <div style={{ padding: 8 }}>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {allTypes.map((name: any) => (
                <div key={name}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedKeys([...selectedKeys, value]);
                        } else {
                          setSelectedKeys(
                            selectedKeys.filter((key: any) => key !== value)
                          );
                        }
                      }}
                      value={name}
                      checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                    />
                    {name}
                  </label>
                </div>
              ))}
              <div
                style={{
                  marginTop: 8,
                  position: "sticky",
                  bottom: 0,
                  background: "white",
                }}
              >
                <Button
                  type="primary"
                  onClick={() => {
                    setSearchQuery({ searchQuery: selectedKeys });
                    // setFilteredValues(selectedKeys);
                  }}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#E8F3F9",
                    color: "black",
                  }}
                >
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setSelectedKeys([]);
                    setSearchQuery({ searchQuery: "" });
                    confirm();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Unit/Corp Func",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (_: any, record: any) => record?.location?.name || "",
      onFilter: (value: any, record: any) => {
        return record.location.name === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        // Create a set to store unique names
        const uniqueNames = new Set();

        // Iterate through allAuditPlanDetails and add unique names to the set
        cipData?.forEach((item: any) => {
          const name = item?.location?.name;
          uniqueNames.add(name);
        });

        // Convert the set back to an array for rendering
        const uniqueNamesArray = Array.from(uniqueNames);

        return (
          <div style={{ padding: 8 }}>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {uniqueNamesArray.map((name: any) => (
                <div key={name}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedKeys([...selectedKeys, value]);
                        } else {
                          setSelectedKeys(
                            selectedKeys.filter((key: any) => key !== value)
                          );
                        }
                      }}
                      value={name}
                      checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                    />
                    {name}
                  </label>
                </div>
              ))}
              <div
                style={{
                  marginTop: 8,
                  position: "sticky",
                  bottom: 0,
                  background: "white",
                }}
              >
                <Button
                  type="primary"
                  onClick={() => {
                    setSearchQuery({ searchQuery: selectedKeys });
                    // setFilteredValues(selectedKeys);
                  }}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#E8F3F9",
                    color: "black",
                  }}
                >
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setSelectedKeys([]);
                    setSearchQuery({ searchQuery: "" });
                    confirm();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Dept/Vertical",
      dataIndex: "entity",
      key: "entity",
      width: 150,
      render: (_: any, record: any) => record?.entity?.entityName || "",
      onFilter: (value: any, record: any) => {
        return record.entity.entityName === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        // Create a set to store unique names
        const uniqueNames = new Set();

        // Iterate through allAuditPlanDetails and add unique names to the set
        cipData?.forEach((item: any) => {
          const name = item?.entity?.entityName;
          uniqueNames.add(name);
        });

        // Convert the set back to an array for rendering
        const uniqueNamesArray = Array.from(uniqueNames);

        return (
          <div style={{ padding: 8 }}>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {uniqueNamesArray.map((name: any) => (
                <div key={name}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedKeys([...selectedKeys, value]);
                        } else {
                          setSelectedKeys(
                            selectedKeys.filter((key: any) => key !== value)
                          );
                        }
                      }}
                      value={name}
                      checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                    />
                    {name}
                  </label>
                </div>
              ))}
              <div
                style={{
                  marginTop: 8,
                  position: "sticky",
                  bottom: 0,
                  background: "white",
                }}
              >
                <Button
                  type="primary"
                  onClick={() => {
                    setSearchQuery({ searchQuery: selectedKeys });
                    // setFilteredValues(selectedKeys);
                  }}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#E8F3F9",
                    color: "black",
                  }}
                >
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setSelectedKeys([]);
                    setSearchQuery({ searchQuery: "" });
                    confirm();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Creator",
      dataIndex: "createdBy",
      width: 150,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.createdBy?.name}
          </div>
        </div>
      ),
    },
    {
      title: "Reviewer",
      dataIndex: "reviewers",
      width: 150,
      render: (_, record) => {
        return (
          <MultiUserDisplay data={record?.reviewers} name="reviewerName" />
        );
      },
    },
    {
      title: "Approver",
      dataIndex: "approvers",
      width: 150,
      render: (_, record) => {
        return (
          <MultiUserDisplay data={record?.approvers} name="approverName" />
        );
      },
    },

    {
      title: "Target Date",
      dataIndex: "targetDate",
      key: "targetDate",
      width: 150,
      render: (_: any, record: any) => record?.plannedEndDate || "",
      // sorter: (a, b) => a.department - b.department,
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (_: any, record: any) => {
        if (record?.status === "Approved") {
          return (
            <Tag
              style={{ backgroundColor: "#7cbf3f" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record?.status === "Cancel") {
          return (
            <Tag
              style={{ backgroundColor: "#FF0000" }}
              key={record.status}
              className={classes.statusTag}
            >
              Cancelled
            </Tag>
          );
        } else if (record?.status === "InReview") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
              title={record.reviewers
                .filter((item: any) => item.reviewStatus === "open")
                .map((item: any) => item.reviewerName)
                .join(", ")}
            >
              In Review
            </Tag>
          );
        } else if (record?.status === "Review Complete") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record?.status === "InApproval") {
          return (
            <Tag
              style={{ backgroundColor: "#FB8500" }}
              key={record.status}
              className={classes.statusTag}
              title={record.approvers
                .filter((item: any) => item.approveStatus === "open")
                .map((item: any) => item.approverName)
                .join(", ")}
            >
              {/* {record.status} */}
              In Approval
            </Tag>
          );
        } else if (record?.status === "Approved") {
          return (
            <Tag
              style={{ backgroundColor: "#7CBF3F" }}
              key={record.status}
              className={classes.statusTag}
            >
              Approved
            </Tag>
          );
        } else if (record?.status === "Complete") {
          return (
            <Tag
              style={{ backgroundColor: "#218716" }}
              key={record.status}
              className={classes.statusTag}
            >
              Completed
            </Tag>
          );
        } else if (record?.status === "Draft") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.status}
              className={classes.statusTag}
            >
              Draft
            </Tag>
          );
        } else if (record?.status === "Edit") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Edit
            </Tag>
          );
        } else if (record?.status === "InProgress") {
          return (
            <Tag
              style={{ backgroundColor: "#7DCEA0" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Progress
            </Tag>
          );
        } else if (record?.status === "InVerification") {
          return (
            <Tag
              style={{ backgroundColor: "#007579" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Verification
            </Tag>
          );
        } else if (record?.status === "Dropped") {
          return (
            <Tag
              style={{ backgroundColor: "#FF0000" }}
              key={record.status}
              className={classes.statusTag}
            >
              Dropped
            </Tag>
          );
        } else if (record?.status === "Closed") {
          return (
            <Tag
              style={{ backgroundColor: "#FF0000" }}
              key={record.status}
              className={classes.statusTag}
            >
              Closed
            </Tag>
          );
        } else return record?.status;
      },
      onFilter: (value: any, record: any) => {
        return record.status === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        return (
          <div style={{ padding: 8 }}>
            {allStatus.map((name: any) => (
              <div key={name}>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedKeys([...selectedKeys, value]);
                      } else {
                        setSelectedKeys(
                          selectedKeys.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name}
                    checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                  />
                  {name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                onClick={() => {
                  setSearchQuery({ searchQuery: selectedKeys });
                  // setFilteredValues(selectedKeys);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedKeys([]);
                  setSearchQuery({ searchQuery: "" });
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "isAction",
      key: "isAction",
      width: 180,
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {record.referenceId ? null : (
            <>
              {record.editAccess && (
                <>
                  <Tooltip title="Edit">
                    <IconButton
                      className={classes.actionButtonStyle}
                      data-testid="action-item"
                      onClick={() => {
                        handleEditCIP(record);
                      }}
                      style={{ color: iconColor }}
                      // ref={refForcip4}
                    >
                      <CustomEditIcon width={18} height={18} />
                    </IconButton>
                  </Tooltip>
                  <Divider type="vertical" className={classes.NavDivider} />
                </>
              )}

              {isOrgAdmin && (
                <>
                  <Tooltip title="Delete">
                    <IconButton
                      className={classes.actionButtonStyle}
                      data-testid="action-item"
                      onClick={() => {
                        handleOpen(record.id);
                      }}
                      style={{ color: iconColor }}
                      // ref={refForcip5}
                    >
                      <CustomDeleteICon width={18} height={18} />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              <Divider type="vertical" className={classes.NavDivider} />
              {record?.status === "Approved" ||
              "InReview" ||
              "Review Complete" ||
              "InApproval" ||
              "InProgress" ? (
                <>
                  {record?.createdBy?.name === userInfo?.fullName ? (
                    <Tooltip title="Add Action Items">
                      <IconButton
                        className={classes.actionButtonStyle}
                        data-testid="action-item"
                        onClick={() => {
                          handleActionItem(record);
                        }}
                        style={{
                          color:
                            record?.status === "Closed" ||
                            record?.status === "Cancel" ||
                            record?.status === "Dropped" ||
                            record?.status === "Complete" ||
                            record?.status === "InVerification"
                              ? "#F8F9F9"
                              : iconColor,
                        }}
                        disabled={
                          record?.status === "Closed" ||
                          record?.status === "Cancel" ||
                          record?.status === "Dropped" ||
                          record?.status === "Complete" ||
                          record?.status === "InVerification"
                            ? true
                            : false
                        }
                        // ref={refForcip6}
                      >
                        <MdAddCircleOutline
                          style={{ marginRight: "4px", fontSize: "22px" }}
                        />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Add Action Items">
                      <IconButton
                        className={classes.actionButtonStyle}
                        data-testid="action-item"
                        // onClick={() => {
                        //   handleActionItem(record);
                        // }}
                        style={{
                          color:
                            record?.status === "Closed" ||
                            record?.status === "Cancel" ||
                            record?.status === "Drop CIP" ||
                            record?.status === "Complete" ||
                            record?.status === "InVerification"
                              ? "#F8F9F9"
                              : iconColor,
                        }}
                        disabled={
                          record?.status === "Closed" ||
                          record?.status === "Cancel" ||
                          record?.status === "Drop CIP" ||
                          record?.status === "Complete" ||
                          record?.status === "InVerification"
                            ? true
                            : false
                        }
                      >
                        <MdAddCircleOutline
                          style={{
                            marginRight: "4px",
                            fontSize: "22px",
                            color: "#F8F9F9",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              ) : (
                <Tooltip title="Add Action Items">
                  <IconButton
                    className={classes.actionButtonStyle}
                    data-testid="action-item"
                    // onClick={() => {
                    //   handleActionItem(record);
                    // }}
                    style={{
                      color:
                        record?.status === "Closed" ||
                        record?.status === "Cancel" ||
                        record?.status === "Drop CIP" ||
                        record?.status === "Complete" ||
                        record?.status === "InVerification"
                          ? "#F8F9F9"
                          : iconColor,
                    }}
                    disabled={
                      record?.status === "Closed" ||
                      record?.status === "Cancel" ||
                      record?.status === "Drop CIP" ||
                      record?.status === "Complete" ||
                      record?.status === "InVerification"
                        ? true
                        : false
                    }
                  >
                    <MdAddCircleOutline
                      style={{
                        marginRight: "4px",
                        fontSize: "22px",
                        color: "#F8F9F9",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              )}

              <Divider type="vertical" className={classes.NavDivider} />
              {
                <>
                  <Tooltip title="Report">
                    <IconButton
                      className={classes.actionButtonStyle}
                      data-testid="pdfReport"
                      onClick={() => {
                        handleClickPdfOpen(record);
                      }}
                      style={{ color: iconColor }}
                    >
                      <MdOutlinePictureAsPdf
                        style={{
                          color: "rgba(0, 0, 0, 0.6)",
                          width: "20px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </>
              }
            </>
          )}
        </div>
      ),
    },
  ];

  const myCipColumns: ColumnsType<any> = [
    {
      title: "CIP Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (_: any, record: any) => (
        // record.action ? (
        <Tooltip title={record.title}>
          <div
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
              width: 200,
            }}
          >
            <div
              className={classes.clickableField}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() => {
                setReadOnly(true);
                handleEditCIP(record);
              }}
            >
              {record.title}
            </div>
          </div>
        </Tooltip>
      ),
      // ) : (
      //   <Tooltip title={record.title}>
      //     <>{record.title}</>
      //   </Tooltip>
      // ),
    },
    {
      title: "Category",
      dataIndex: "cipCategoryId",
      key: "cipCategoryId",
      width: 150,
      render: (_: any, record: any) => {
        return <MultiUserDisplay data={record?.cipCategoryId} name="name" />;
      },
      onFilter: (value: any, record: any) => {
        return record?.cipCategoryId?.name === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        return (
          <div style={{ padding: 8 }}>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {allCategories.map((name: any) => (
                <div key={name}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedKeys([...selectedKeys, value]);
                        } else {
                          setSelectedKeys(
                            selectedKeys.filter((key: any) => key !== value)
                          );
                        }
                      }}
                      value={name}
                      checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                    />
                    {name}
                  </label>
                </div>
              ))}
              <div
                style={{
                  marginTop: 8,
                  position: "sticky",
                  bottom: 0,
                  background: "white",
                }}
              >
                <Button
                  type="primary"
                  onClick={() => {
                    setSearchQuery({ searchQuery: selectedKeys });
                    // setFilteredValues(selectedKeys);
                  }}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#E8F3F9",
                    color: "black",
                  }}
                >
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setSelectedKeys([]);
                    setSearchQuery({ searchQuery: "" });
                    confirm();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Methodology",
      dataIndex: "cipTypeId",
      key: "cipTypeId",
      width: 150,
      render: (_: any, record: any) => {
        return <MultiUserDisplay data={record?.cipTypeId} name="name" />;
      },
      onFilter: (value: any, record: any) => {
        return record.cipTypeId === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        return (
          <div style={{ padding: 8 }}>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {allTypes.map((name: any) => (
                <div key={name}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedKeys([...selectedKeys, value]);
                        } else {
                          setSelectedKeys(
                            selectedKeys.filter((key: any) => key !== value)
                          );
                        }
                      }}
                      value={name}
                      checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                    />
                    {name}
                  </label>
                </div>
              ))}
              <div
                style={{
                  marginTop: 8,
                  position: "sticky",
                  bottom: 0,
                  background: "white",
                }}
              >
                <Button
                  type="primary"
                  onClick={() => {
                    setSearchQuery({ searchQuery: selectedKeys });
                    // setFilteredValues(selectedKeys);
                  }}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#E8F3F9",
                    color: "black",
                  }}
                >
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setSelectedKeys([]);
                    setSearchQuery({ searchQuery: "" });
                    confirm();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Unit/Corp Func",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (_: any, record: any) => record?.location?.name || "",
      onFilter: (value: any, record: any) => {
        return record.location.name === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        // Create a set to store unique names
        const uniqueNames = new Set();

        // Iterate through allAuditPlanDetails and add unique names to the set
        cipData?.forEach((item: any) => {
          const name = item?.location?.name;
          uniqueNames.add(name);
        });

        // Convert the set back to an array for rendering
        const uniqueNamesArray = Array.from(uniqueNames);

        return (
          <div style={{ padding: 8 }}>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {uniqueNamesArray.map((name: any) => (
                <div key={name}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedKeys([...selectedKeys, value]);
                        } else {
                          setSelectedKeys(
                            selectedKeys.filter((key: any) => key !== value)
                          );
                        }
                      }}
                      value={name}
                      checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                    />
                    {name}
                  </label>
                </div>
              ))}
              <div
                style={{
                  marginTop: 8,
                  position: "sticky",
                  bottom: 0,
                  background: "white",
                }}
              >
                <Button
                  type="primary"
                  onClick={() => {
                    setSearchQuery({ searchQuery: selectedKeys });
                    // setFilteredValues(selectedKeys);
                  }}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#E8F3F9",
                    color: "black",
                  }}
                >
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setSelectedKeys([]);
                    setSearchQuery({ searchQuery: "" });
                    confirm();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Dept/Vertical",
      dataIndex: "entity",
      key: "entity",
      width: 150,
      render: (_: any, record: any) => record?.entity?.entityName || "",
      onFilter: (value: any, record: any) => {
        return record.entity.entityName === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        // Create a set to store unique names
        const uniqueNames = new Set();

        // Iterate through allAuditPlanDetails and add unique names to the set
        cipData?.forEach((item: any) => {
          const name = item?.entity?.entityName;
          uniqueNames.add(name);
        });

        // Convert the set back to an array for rendering
        const uniqueNamesArray = Array.from(uniqueNames);

        return (
          <div style={{ padding: 8 }}>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {uniqueNamesArray.map((name: any) => (
                <div key={name}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedKeys([...selectedKeys, value]);
                        } else {
                          setSelectedKeys(
                            selectedKeys.filter((key: any) => key !== value)
                          );
                        }
                      }}
                      value={name}
                      checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                    />
                    {name}
                  </label>
                </div>
              ))}
              <div
                style={{
                  marginTop: 8,
                  position: "sticky",
                  bottom: 0,
                  background: "white",
                }}
              >
                <Button
                  type="primary"
                  onClick={() => {
                    setSearchQuery({ searchQuery: selectedKeys });
                    // setFilteredValues(selectedKeys);
                  }}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#E8F3F9",
                    color: "black",
                  }}
                >
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setSelectedKeys([]);
                    setSearchQuery({ searchQuery: "" });
                    confirm();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "My Roles",
      dataIndex: "roles",
      width: 150,
      render: (_: any, record: any) => {
        const roles = [];
        if (record?.createdBy.id === userDetails.id) {
          roles.push("CREATOR");
        }
        if (
          record?.reviewers?.some(
            (item: any) => item.reviewerId === userDetails.id
          )
        ) {
          roles.push("REVIEWER");
        }
        if (
          record?.approvers?.some(
            (item: any) => item.approverId === userDetails.id
          )
        ) {
          roles.push("APPROVER");
        }
        if (
          record?.actionItem?.some(
            (item: any) => item.owner.id === userDetails.id
          )
        ) {
          roles.push("ACTION ITEM OWNER");
        }
        if (
          record?.tangibleBenefits?.some(
            (item: any) => item.verifier.id === userDetails.id
          )
        ) {
          roles.push("VERIFIER");
        }
        return <MultiUserDisplay data={roles} name="roles" />;
      },
    },
    {
      title: "Target Date",
      dataIndex: "targetDate",
      key: "targetDate",
      width: 150,
      render: (_: any, record: any) => record?.plannedEndDate || "",
      // sorter: (a, b) => a.department - b.department,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (_: any, record: any) => {
        if (record?.status === "Approved") {
          return (
            <Tag
              style={{ backgroundColor: "#7cbf3f" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record?.status === "Cancel") {
          return (
            <Tag
              style={{ backgroundColor: "#FF0000" }}
              key={record.status}
              className={classes.statusTag}
            >
              Cancelled
            </Tag>
          );
        } else if (record?.status === "InReview") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
              title={record.reviewers
                .filter((item: any) => item.reviewStatus === "open")
                .map((item: any) => item.reviewerName)
                .join(", ")}
            >
              In Review
            </Tag>
          );
        } else if (record?.status === "Review Complete") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record?.status === "InApproval") {
          return (
            <Tag
              style={{ backgroundColor: "#FB8500" }}
              key={record.status}
              className={classes.statusTag}
              title={record.approvers
                .filter((item: any) => item.approveStatus === "open")
                .map((item: any) => item.approverName)
                .join(", ")}
            >
              {/* {record.status} */}
              In Approval
            </Tag>
          );
        } else if (record?.status === "Approved") {
          return (
            <Tag
              style={{ backgroundColor: "#7CBF3F" }}
              key={record.status}
              className={classes.statusTag}
            >
              Approved
            </Tag>
          );
        } else if (record?.status === "Complete") {
          return (
            <Tag
              style={{ backgroundColor: "#218716" }}
              key={record.status}
              className={classes.statusTag}
            >
              Completed
            </Tag>
          );
        } else if (record?.status === "Draft") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.status}
              className={classes.statusTag}
            >
              Draft
            </Tag>
          );
        } else if (record?.status === "Edit") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Edit
            </Tag>
          );
        } else if (record?.status === "InProgress") {
          return (
            <Tag
              style={{ backgroundColor: "#7DCEA0" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Progress
            </Tag>
          );
        } else if (record?.status === "InVerification") {
          return (
            <Tag
              style={{ backgroundColor: "#007579" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Verification
            </Tag>
          );
        } else if (record?.status === "Dropped") {
          return (
            <Tag
              style={{ backgroundColor: "#FF0000" }}
              key={record.status}
              className={classes.statusTag}
            >
              Dropped
            </Tag>
          );
        } else if (record?.status === "Closed") {
          return (
            <Tag
              style={{ backgroundColor: "#FF0000" }}
              key={record.status}
              className={classes.statusTag}
            >
              Closed
            </Tag>
          );
        } else return record?.status;
      },
      onFilter: (value: any, record: any) => {
        return record.status === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        return (
          <div style={{ padding: 8 }}>
            {allStatus.map((name: any) => (
              <div key={name}>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedKeys([...selectedKeys, value]);
                      } else {
                        setSelectedKeys(
                          selectedKeys.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name}
                    checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                  />
                  {name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                onClick={() => {
                  setSearchQuery({ searchQuery: selectedKeys });
                  // setFilteredValues(selectedKeys);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedKeys([]);
                  setSearchQuery({ searchQuery: "" });
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "isAction",
      key: "isAction",
      width: 180,
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {record.referenceId ? null : (
            <>
              {record.editAccess && (
                <>
                  <Tooltip title="Edit">
                    <IconButton
                      className={classes.actionButtonStyle}
                      data-testid="action-item"
                      onClick={() => {
                        handleEditCIP(record);
                      }}
                      style={{ color: iconColor }}
                    >
                      <CustomEditIcon width={18} height={18} />
                    </IconButton>
                  </Tooltip>
                  <Divider type="vertical" className={classes.NavDivider} />
                </>
              )}

              {isOrgAdmin && (
                <>
                  <Tooltip title="Delete">
                    <IconButton
                      className={classes.actionButtonStyle}
                      data-testid="action-item"
                      onClick={() => {
                        handleOpen(record.id);
                      }}
                      style={{ color: iconColor }}
                    >
                      <CustomDeleteICon width={18} height={18} />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              <Divider type="vertical" className={classes.NavDivider} />
              {record?.status === "Approved" ||
              "InReview" ||
              "Review Complete" ||
              "InApproval" ||
              "InProgress" ? (
                <>
                  {record?.createdBy?.name === userInfo?.fullName ? (
                    <Tooltip title="Add Action Items">
                      <IconButton
                        className={classes.actionButtonStyle}
                        data-testid="action-item"
                        onClick={() => {
                          handleActionItem(record);
                        }}
                        style={{
                          color:
                            record?.status === "Closed" ||
                            record?.status === "Cancel" ||
                            record?.status === "Dropped" ||
                            record?.status === "Complete" ||
                            record?.status === "InVerification"
                              ? "#F8F9F9"
                              : iconColor,
                        }}
                        disabled={
                          record?.status === "Closed" ||
                          record?.status === "Cancel" ||
                          record?.status === "Dropped" ||
                          record?.status === "Complete" ||
                          record?.status === "InVerification"
                            ? true
                            : false
                        }
                      >
                        <MdAddCircleOutline
                          style={{ marginRight: "4px", fontSize: "22px" }}
                        />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Add Action Items">
                      <IconButton
                        className={classes.actionButtonStyle}
                        data-testid="action-item"
                        // onClick={() => {
                        //   handleActionItem(record);
                        // }}
                        style={{
                          color:
                            record?.status === "Closed" ||
                            record?.status === "Cancel" ||
                            record?.status === "Drop CIP" ||
                            record?.status === "Complete" ||
                            record?.status === "InVerification"
                              ? "#F8F9F9"
                              : iconColor,
                        }}
                        disabled={
                          record?.status === "Closed" ||
                          record?.status === "Cancel" ||
                          record?.status === "Drop CIP" ||
                          record?.status === "Complete" ||
                          record?.status === "InVerification"
                            ? true
                            : false
                        }
                      >
                        <MdAddCircleOutline
                          style={{
                            marginRight: "4px",
                            fontSize: "22px",
                            color: "#F8F9F9",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              ) : (
                <Tooltip title="Add Action Items">
                  <IconButton
                    className={classes.actionButtonStyle}
                    data-testid="action-item"
                    // onClick={() => {
                    //   handleActionItem(record);
                    // }}
                    style={{
                      color:
                        record?.status === "Closed" ||
                        record?.status === "Cancel" ||
                        record?.status === "Drop CIP" ||
                        record?.status === "Complete" ||
                        record?.status === "InVerification"
                          ? "#F8F9F9"
                          : iconColor,
                    }}
                    disabled={
                      record?.status === "Closed" ||
                      record?.status === "Cancel" ||
                      record?.status === "Drop CIP" ||
                      record?.status === "Complete" ||
                      record?.status === "InVerification"
                        ? true
                        : false
                    }
                  >
                    <MdAddCircleOutline
                      style={{
                        marginRight: "4px",
                        fontSize: "22px",
                        color: "#F8F9F9",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              )}

              <Divider type="vertical" className={classes.NavDivider} />
              {
                <>
                  <Tooltip title="Report">
                    <IconButton
                      className={classes.actionButtonStyle}
                      data-testid="pdfReport"
                      onClick={() => {
                        handleClickPdfOpen(record);
                      }}
                      style={{ color: iconColor }}
                    >
                      <MdOutlinePictureAsPdf
                        style={{
                          color: "rgba(0, 0, 0, 0.6)",
                          width: "20px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </>
              }
            </>
          )}
        </div>
      ),
    },
  ];

  const tableColumns = myCip ? myCipColumns : columns;

  const subRowColumns: ColumnsType<any> = [
    {
      title: "ActionItem Title",
      dataIndex: "title",
      key: "title",
      render: (_: any, record: any) => (
        // record.action ? (
        <Tooltip title={record.title}>
          <div
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
              width: 130,
            }}
          >
            <div
              className={classes.clickableField}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() => {
                handleEditActionItem(record);
              }}
            >
              {record.title}
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Target Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (_: any, record: any) => record.endDate || "",
    },
    {
      title: "Owner",
      dataIndex: "owner",
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.owner?.username}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        if (record?.status === true) {
          return (
            <Tag
              style={{ backgroundColor: "#7cbf3f" }}
              key={record.status}
              className={classes.statusTag}
            >
              Open
            </Tag>
          );
        } else {
          return (
            <Tag
              style={{ backgroundColor: "#FF0000" }}
              key={record.status}
              className={classes.statusTag}
            >
              Closed
            </Tag>
          );
        }
      },
    },
  ];
  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  function formatDate(inputDate: any) {
    if (inputDate != null) {
      const date = new Date(inputDate);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return "";
  }

  let typeAheadValue: string;
  let typeAheadType: string;

  const getSuggestionListUser = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchUser();
  };

  const debouncedSearchUser = debounce(() => {
    getUser(typeAheadValue, typeAheadType);
  }, 50);

  const getUser = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `/api/documents/filerValue?searchLocation=&searchBusinessType=&searchEntity=&searchSystems=&searchDoctype=&searchUser=${value}`
      );
      setUser(res.data.allUser);
    } catch (err) {
      enqueueSnackbar("Error while getting users", { variant: "error" });
    }
  };

  const handleMouseEnter = (record: any) => {
    setHoveredRow(record.id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  const handleFetchCips = () => {};

  const handleChangeList = async (event: any, values: any) => {
    setPage(1);
    setRowsPerPage(10);
    setSelectedLocation(values);
    if (values && values?.id) {
      setUnitId(values?.id);
      setSelectedDept(null);
    }
    if (values?.id === "All") {
      setDeptId(values?.id);
      setSelectedDept({ ...{ id: "All", name: "All" }, type: "All" });
    }
  };

  const fetchInitialDepartment = async (id: string) => {
    try {
      const res = await axios.get(`/api/entity/getSelectedEntity/${id}`);
      const entity = res.data;

      setSelectedDept({
        id: entity.id,
        name: entity.entityName,
        type: entity?.entityType?.name,
      });
    } catch (error) {
      console.error("Failed to fetch initial department:", error);
    }
  };

  useEffect(() => {
    if (!myCip) {
      setSelectedLocation({
        id: userDetails?.location?.id,
        locationName: userDetails?.location?.locationName,
      });
    }
    getAllCip();
  }, [myCip]);

  const getAllCip = async () => {
    let result: any;
    let actionItems: any;
    // console.log("deptID in search", deptId);
    if (currentYear && selectedLocation) {
      result = await axios.get(
        `/api/cip/getAll/${currentYear}/${selectedLocation?.id}?page=${page}&limit=${rowsPerPage}&entityId=${deptId}&search=${searchQuery?.searchQuery}&myCip=${myCip}`
      );

      actionItems = await axios.get(
        `/api/actionitems/getActionItemForSource?source=CIP&orgId=${orgId}&page=${page}&limit=${rowsPerPage}&unitId=&currentYear=${currentYear}&entityId=${deptId}`
      );
    } else {
      return;
    }

    const sortedResult = result?.data?.data.sort((a: any, b: any) =>
      a.title.localeCompare(b.title)
    );

    if (actionItems?.data?.result && actionItems?.data?.result?.length > 0) {
      const actionData: any[] = [];
      actionItems?.data?.result?.map((item: any) => {
        actionData.push({
          id: item._id,
          title: item.title,
          description: item.description,
          status: item.status,
          owner: item.owner,
          startDate: item.startDate,
          endDate: item.endDate,
          source: item.source,
          year: item.year,
          additionalInfo: item.additionalInfo,
          locationId: item.locationId,
          //deleted: item.deleted,
          referenceId: item.referenceId,
          organizationId: item.organizationId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      });
      setActionItemData(actionData);
    }

    const arr: any[] = [];
    if (result?.data?.data && result?.data?.data?.length > 0) {
      sortedResult.map((item: any, key: any) => {
        arr.push({
          id: item._id,
          title: item.title,
          targetDate: formatDate(item.targetDate),
          cipCategoryId: item.cipCategoryId,
          cipTeamId: item.cipTeamId,
          cipTypeId: item.cipTypeId,
          cipOrigin: item.cipOrigin,
          justification: item.justification,
          cost: item.cost,
          tangibleBenefits: item.tangibleBenefits,
          status: item.status,
          attachment: item.attachment,
          year: item.year,
          locationId: item.locationId,
          entity: item?.entity,
          location: item?.location,
          createdBy: item.createdBy,
          reviewers: item.reviewers,
          approvers: item.approvers,
          refsData: item.refsData,
          cancellation: item.cancellation,
          organizationId: item.organizationId,
          editAccess: item.editAccess,
          plannedStartDate: formatDate(item.plannedStartDate),
          plannedEndDate: formatDate(item.plannedEndDate),
          actionItem: item?.actionItem,
          projectMembers: item?.projectMembers,
          otherMembers: item?.otherMembers,
        });
      });
    }
    setCipData(arr);
    setAllCategories(result.data.allCategories);
    setAllTypes(result.data.allTypes);
    setAllStatus(result.data.allStatus);
    setCount(result.data.count);
  };

  // const cipTableData = cipData.map(({ children, ...rest }: any) => rest)

  const expandIcon = ({ expanded, onExpand, record }: any) => {
    const icon = expanded ? <AiOutlineMinusCircle /> : <AiOutlinePlusCircle />;
    const match = record.actionItem;
    if (match.length > 0) {
      return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
    }
    return null;
  };

  // mobile view filter moda.

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Approved":
        return "#7CBF3F";
      case "Cancel":
        return "#FF0000";
      case "InReview":
        return "#F2BB00";
      case "Review Complete":
        return "#F2BB00";
      case "InApproval":
        return "#FB8500";
      case "Complete":
        return "#218716";
      case "Draft":
        return "#0075A4";
      case "Edit":
        return "#0075A4";
      case "InProgress":
        return "#7DCEA0";
      case "InVerification":
        return "#007579";
      case "Dropped":
        return "#FF0000";
      case "Closed":
        return "#FF0000";
      default:
        return "white";
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          // overflow: matches ? "scroll" : "scroll",
          paddingBottom: "10px",
          // height: "120vh",
        }}
      >
        {matches ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              // justifyContent: "space-between",
              // alignItems: "center",
              // width: matches ? "30%" : "100%",
            }}
          >
            {/* <Grid item xs={12} md={12}> */}
            {matches ? (
              <div
                style={{ display: "flex", flexDirection: "row" }}
                className={classes.SearchBox}
              >
                <FormControl variant="outlined" size="small" fullWidth>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "290px",
                    }}
                    //  ref={refForcip1}
                  >
                    <label
                      style={{
                        fontWeight: 500,
                        fontSize: "14px",
                        color: "#374151",
                        width: "25px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Unit:
                    </label>
                    <Autocomplete
                      // multiple
                      id="location-autocomplete"
                      className={classes.inputRootOverride}
                      options={
                        Array.isArray(locationNames)
                          ? [allOption, ...locationNames]
                          : [allOption]
                      }
                      getOptionLabel={(option) => option.locationName || ""}
                      getOptionSelected={(option, value) =>
                        option.id === value.id
                      }
                      value={selectedLocation}
                      onChange={(event, values) => {
                        handleChangeList(event, values);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          //label="Unit/Corp Func"
                          fullWidth
                        />
                      )}
                      fullWidth
                      disabled={myCip}
                    />
                  </div>
                </FormControl>
                <div className={classes.SearchBox}>
                  <FormControl variant="outlined">
                    {/* <div
                      style={{
                        width: "250px",
                        // paddingLeft: "20px",
                      }}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={[allDeptOption, ...deptOptions]}
                        onChange={handleDepartment}
                        value={getDeptSelectedItem()}
                        getOptionLabel={(option) => option.entityName || ""}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            size="small"
                            label="Entity"
                            fullWidth
                          />
                        )}
                      />
                    </div> */}
                    <div
                      style={{
                        paddingLeft: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "290px",
                        height: "40px",
                      }}
                    >
                      <label
                        style={{
                          fontWeight: 500,
                          fontSize: "14px",
                          color: "#374151",
                          width: "92px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Entity:
                      </label>
                      <DepartmentSelector
                        locationId={unitId}
                        selectedDepartment={selectedDept}
                        onSelect={(dept, type) => {
                          setSelectedDept({ ...dept, type }),
                            setDeptId(dept?.id);
                        }}
                        onClear={() => setSelectedDept(null)}
                      />
                    </div>
                  </FormControl>
                </div>
              </div>
            ) : (
              ""
            )}
            {/* </Grid> */}
            {matches ? (
              <div
                style={{
                  paddingLeft: "20px",
                  width: "100%",
                }}
              >
                <Grid>
                  <YearComponent
                    currentYear={currentYear}
                    setCurrentYear={setCurrentYear}
                  />
                </Grid>
              </div>
            ) : (
              ""
            )}
          </div>
        ) : (
          ""
        )}

        <div style={{ display: "flex", alignItems: "center" }}>
          {matches ? (
            // <IconButton
            //   onClick={() => {
            //     setMyCip(!myCip);
            //   }}
            //   style={{ marginTop: "-5px" }}
            // >
            //   <Tooltip title={"My CIP"}>
            //     {!myCip ? (
            //       <MdOutlinePermContactCalendar
            //         style={{
            //           color: "#444",
            //           height: "31px",
            //           width: "30px",
            //         }}
            //       />
            //     ) : (
            //       <PermContactCalendar
            //         style={{
            //           color: "rgb(53, 118, 186)",
            //           height: "31px",
            //           width: "30px",
            //         }}
            //       />
            //     )}
            //   </Tooltip>
            // </IconButton>
            <Tooltip title={"My CIP"}>
              <Button
                onClick={() => {
                  setMyCip(!myCip);
                }}
                style={{
                  padding: "5px 10px",
                  backgroundColor: myCip ? "rgb(53, 118, 186)" : "#f5f5f5",
                  color: myCip ? "white" : "#444",
                  border: "1px solid #ccc",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginRight: "10px",
                }}
              >
                <FaUserGroup />
                My CIP
              </Button>
            </Tooltip>
          ) : (
            ""
          )}
          <div
            style={
              smallScreen
                ? {}
                : { width: "100%", display: "flex", justifyContent: "center" }
            }
          >
            <SearchBar
              placeholder="Search CIP"
              name="searchQuery"
              values={searchQuery}
              handleChange={handleSearchChange}
              handleApply={handleTableSearch}
              endAdornment={true}
              handleClickDiscard={() => {
                handleClickDiscard();
              }}
            />
          </div>
        </div>
      </div>

      {/* // filters for mobile view only */}

      <Modal
        title={
          <div
            style={{
              backgroundColor: "#E8F3F9",
              padding: "8px",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            }}
          >
            Filter By
          </div>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        className={classes.modal}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "30px",
              cursor: "pointer",
              padding: "0px",
              marginTop: "-12px",
            }}
          />
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            // marginTop: "20px",
            border: "1px solid rgba(19, 171, 155, 0.5)",
            borderRadius: "12px",
            padding: "20px",
            margin: "20px 20px 10px 20px",
          }}
          className={classes.SearchBox}
        >
          <div className={classes.locSearchBox}>
            <FormControl variant="outlined" size="small" fullWidth>
              <div
                style={{ paddingTop: "4px" }}
                //  ref={refForcip1}
              >
                <Autocomplete
                  // multiple
                  id="location-autocomplete"
                  className={classes.inputRootOverride}
                  options={
                    Array.isArray(locationNames)
                      ? [allOption, ...locationNames]
                      : [allOption]
                  }
                  getOptionLabel={(option) => option.locationName || ""}
                  getOptionSelected={(option, value) => option.id === value.id}
                  value={selectedLocation}
                  onChange={(event, values) => {
                    handleChangeList(event, values);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      label="Location"
                      fullWidth
                    />
                  )}
                  disabled={myCip}
                />
              </div>
            </FormControl>
          </div>
          {/* </Grid> */}
          <div
            style={{
              width: "270px",
              display: "flex",
              justifyContent: "start",
              padding: "0px",
              margin: "0px",
            }}
            //  ref={refForcip2}
          >
            <YearComponent
              currentYear={currentYear}
              setCurrentYear={setCurrentYear}
            />
          </div>
        </div>
      </Modal>

      {matches ? (
        <>
          {isTableDataLoading ? (
            <Box
              marginY="auto"
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="40vh"
            >
              <CircularProgress />
            </Box>
          ) : !!count && count > 0 ? (
            <>
              <Box
                style={{
                  width: "100%",
                  backgroundColor: "#E8F3F9",
                  height: "54 px",
                }}
                // className={classes.graphContainer}
              ></Box>
              <div className={classes.pagination}>
                <Pagination
                  size="small"
                  current={page}
                  pageSize={rowsPerPage}
                  total={count}
                  showTotal={showTotal}
                  showSizeChanger
                  showQuickJumper
                  onChange={(page: any, pageSize: any) => {
                    handlePagination(page, pageSize);
                  }}
                />
              </div>
              <div
                data-testid="custom-table"
                className={classes.tableContainer}
              >
                <Table
                  className={classes.newTableContainer}
                  // rowClassName={() => "editable-row"}
                  dataSource={cipData}
                  columns={tableColumns}
                  pagination={false}
                  expandable={{
                    expandedRowRender: (record: any) => {
                      const matchingActionPoints = record?.actionItem;
                      setSelectedData(record);
                      return (
                        <Table
                          className={classes.subTableContainer}
                          style={{ width: 900, paddingBottom: "20px" }}
                          columns={subRowColumns}
                          bordered
                          dataSource={matchingActionPoints}
                          pagination={false}
                        />
                      );
                    },
                    expandIcon,
                  }}
                  rowKey={(record: any) => record?.id}

                  // scroll={{ x: 700, }}
                />
              </div>
              <ConfirmDialog
                open={open}
                handleClose={handleClose}
                handleDelete={handleDelete}
              />
            </>
          ) : (
            <>
              <div className={classes.emptyTableImg}>
                <img
                  src={EmptyTableImg}
                  alt="No Data"
                  height="400px"
                  width="300px"
                />
              </div>
              <Typography align="center" className={classes.emptyDataText}>
                Let’s begin by adding a CIP
              </Typography>
            </>
          )}
        </>
      ) : (
        ""
      )}

      {matches ? (
        ""
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-evenly",
              paddingBottom: "100px",
              // height: "100vh",
              // overflowY: "scroll",
            }}
          >
            {cipData?.map((record: any) => (
              <div
                style={{
                  border: "1px solid black",
                  borderRadius: "5px",
                  padding: "5px",
                  margin: "10px",
                  width: smallScreen ? "45%" : "100%",
                }}
              >
                <p
                  onClick={() => {
                    setReadOnly(true);
                    handleEditCIP(record);
                  }}
                  style={{
                    padding: "3px 10px",
                    backgroundColor: getStatusColor(record?.status),
                    borderRadius: "2px",
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  {record?.title}
                </p>
                <p
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  Category :{" "}
                  <span>
                    {
                      <MultiUserDisplay
                        data={record?.cipCategoryId}
                        name="name"
                      />
                    }
                  </span>
                </p>
                <p>Unit : {record?.location?.name || ""}</p>
                <p>Status : {record?.status}</p>
                {/* <p>Creator: {record?.createdBy?.name}</p> */}
                {/* <p>
                  Reviewer :{" "}
                  {
                    <MultiUserDisplay
                      data={record?.reviewers}
                      name="reviewerName"
                    />
                  }
                </p> */}
                {/* <p>
                  Approver :{" "}
                  {
                    <MultiUserDisplay
                      data={record?.approvers}
                      name="approverName"
                    />
                  }
                </p> */}
                <p>Target Date:{record?.plannedEndDate || ""}</p>

                {record.actionItem.length > 0 ? (
                  <Accordion className={classes.headingRoot}>
                    <AccordionSummary
                      expandIcon={<MdExpandMore style={{ padding: "3px" }} />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                      className={classes.summaryRoot}
                      style={{ margin: "0px", height: "10px" }}
                    >
                      Action Items
                    </AccordionSummary>
                    <AccordionDetails
                      className={classes.headingRoot}
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      {record?.actionItem?.map((data: any) => (
                        <div>
                          <p
                            onClick={() => {
                              handleEditActionItem(data);
                            }}
                            style={{
                              textDecorationLine: "underline",
                              cursor: "pointer",
                              margin: "5px 3px",
                            }}
                          >
                            {data?.title}
                          </p>
                        </div>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  ""
                )}
              </div>
            ))}
          </div>
          <div className={classes.pagination}>
            <Pagination
              size="small"
              current={page}
              pageSize={rowsPerPage}
              total={count}
              showTotal={showTotal}
              showSizeChanger
              showQuickJumper
              onChange={(page: any, pageSize: any) => {
                handlePagination(page, pageSize);
              }}
            />
          </div>
        </>
      )}
      <div>
        {!!drawer.open && (
          <CIPDrawer
            drawer={drawer}
            setDrawer={setDrawer}
            handleFetchCips={getAllCip}
            isGraphSectionVisible={isGraphSectionVisible}
            readOnly={readOnly}
            setReadOnly={setReadOnly}
          />
        )}
        {!!actionItemDrawer.open && (
          <ActionItemDrawer
            actionItemDrawer={actionItemDrawer}
            setActionItemDrawer={setActionItemDrawer}
            handleFetchCips={getAllCip}
            isGraphSectionVisible={isGraphSectionVisible}
          />
        )}
      </div>
    </>
  );
}

export default CIPTable;
