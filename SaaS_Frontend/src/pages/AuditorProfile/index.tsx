import React, { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Modal,
  Typography,
  TextField,
  IconButton,
  Chip,
  Input,
  Divider,
} from "@material-ui/core";
import { Button as AntdButton } from "antd";
import useStyles from "./style";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyTableImg from "../../assets/EmptyTableImg.svg";
import Table from "antd/es/table";
import MultiUserDisplay from "../../components/MultiUserDisplay";
import { MdDelete } from 'react-icons/md';
import { Autocomplete } from "@material-ui/lab";
import { MdInbox } from 'react-icons/md';
import {
  Dropdown,
  Form,
  MenuProps,
  Pagination,
  PaginationProps,
  Upload,
  type UploadProps,
} from "antd";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  auditCreationForm,
  auditorProfileData,
  orgFormData,
} from "../../recoil/atom";
import axios from "../../apis/axios.global";
import AutoComplete from "../../components/AutoComplete";
import { debounce } from "lodash";
import { ReactComponent as CustomDeleteICon } from "../../assets/documentControl/Delete.svg";
import { API_LINK } from "config";
import { UploadChangeParam, UploadFile } from "antd/es/upload";
import DynamicFormSearchField from "components/DynamicFormSearchField";
import { getAllAuditTypes } from "apis/auditApi";
import checkRole from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";
import getAppUrl from "utils/getAppUrl";
import { useSnackbar } from "notistack";
import {
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";
import {
  formatModernQuery,
} from "utils/formatDashboardQuery";
import SearchBar from "components/SearchBar";
import DocumentViewerAudit from "./DocumentViewer/index";
import { Modal as AntdModal } from "antd";
import { MdExpandMore } from 'react-icons/md';
import { MdAttachFile } from 'react-icons/md';

const AuditorProfile: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const { Dragger } = Upload;
  const [formData, setFormData] = useRecoilState(auditorProfileData);
  const [proficiencyData, setProficiencyData] = useState<any>();
  const [locationOption, setLocationOption] = React.useState([]);
  const [selectedCertificate, setSelectedCertificate] = React.useState([]);
  const [user, setUser] = useState([]);
  const [urls, setUrls] = useState([]);
  const [system, setSystem] = React.useState([]);
  const [location, setLocation] = React.useState([]);
  const [audittypes, setAuditTypes] = useState<any>([]);
  const orgData = useRecoilValue(orgFormData);
  const [functionData, setFunctionData] = React.useState<any>();
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);
  const [isFilterType, setfilterType] = useState<boolean>(false);
  const [isSystemType, setSystemType] = useState<boolean>(false);
  const [isDeptType, setDeptType] = useState<boolean>(false);
  const [filterList, setFilterList] = useState<any>([]);
  const [systemList, setSystemList] = useState<any>([]);
  const [DeptList, setDeptList] = useState<any>([]);
  const [selectedType, setselectedType] = useState<any>([]);
  const [selectedDptType, setSelectedDptType] = useState<any>([]);
  const [selectedSystem, setSelectedSystem] = useState<any>([]);
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const isMR = checkRole("MR");
  const userInfo = getSessionStorage();
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>();
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const [searchQuery, setsearchQuery] = useState<any>({
    searchQuery: "",
  });
  const [deleteProfile, setdeleteProfile] = useState<any>();
  const [certifiOpen, setCertifiOpen] = useState(false);
  const [fileLinkCi, setFileLinkCi] = useState<any>();

  const handlerOpenCertifiModal = async (item: any) => {
    if (item) {
      setCertifiOpen(true);
      setFileLinkCi(item);
    }
  };

  const handlerCloseCertifiModal = () => {
    setCertifiOpen(false);
  };

  const defaultFormData = {
    id: "",
    auditorName: "",
    unit: "",
    systemExpertise: [],
    inLead: [],
    proficiencies: [],
    functionproficiencies: [],
    auditType: [{ item: {} }],
    certifications: [],
    organizationId: "",
  };
  // const [isSystemExpertise, setIsSystemExpertise] = useState<boolean>(false);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  useEffect(() => {
    const url = formatModernQuery(
      `/api/audit-settings/getAllAuditorProfiles`,
      {
        selectedUnit: userInfo.location.id,
      },
      false,
      searchQuery.searchQuery,
      page,
      rowsPerPage
    );
    getData(url);
    fetchAllProficiency();
    getFunctions();
    getauditTypes();
    fetchFilterList();
    fetchSystem();
    setselectedType([userInfo.location.id]);
  }, []);

  useEffect(() => {
    // if (filterList.length > 0) {
    fetchDepartmentList();
    // }
  }, [selectedType]);

  useEffect(() => {
    if (selectedType?.length > 0) {
      applyFilter(true);
      setfilterType(true);
    }
  }, [selectedType]);

  const fetchFilterList = async () => {
    try {
      const response = await axios.get(
        `/api/audit-settings/fetchLocationForAuditProfile`
      );
      setFilterList(response.data);
    } catch (error) {}
  };

  const fetchDepartmentList = async () => {
    try {
      const unitQueryString = selectedType
        ?.map((unitId: any) => `unit[]=${unitId}`)
        .join("&");
      const response = await axios.get(
        `/api/audit-settings/fetchDepartmentForAuditProfile?${unitQueryString}`
      );
      console.log("dept data", response.data);
      setDeptList(response.data);
    } catch (error) {}
  };

  const fetchSystem = async () => {
    try {
      // http://localhost:5000/api/audit-settings/getSystemOptions
      const response = await axios.get(`/api/audit-settings/getSystemOptions`);
      setSystemList(response.data);
    } catch (err) {}
  };
  const setParsedAuditType = (data: any) => {
    const hasItemField = (auditType: any) => "item" in auditType;

    const parsedAuditType = data.auditType.map((type: any) => {
      if (type !== undefined && type !== "") {
        if (!hasItemField(type)) {
          return {
            item: type,
          };
        }
        return type; // Already parsed, leave it as is
      }
    });

    setSelectedData((prev: any) => {
      return {
        ...prev,
        auditType: parsedAuditType,
      };
    });
  };

  const getData = async (url: any) => {
    setIsLoading(true);
    try {
      // page: page,
      // limit: rowsPerPage,
      const res = await axios.get(url);
      if (res?.data?.length > 0) {
        setCount(res.data.length);
        const val = res?.data?.data?.map((item: any) => {
          // setParsedAuditType(res.data);

          return {
            organizationId: item.organizationId,
            id: item.id,
            auditorName: item.auditorName,
            unit: item?.auditorName?.locationName || "",
            locationId: item?.auditorName?.locationid || "",
            systemExpertise: item.systemExpertise,
            proficiencies: item.proficiencies,
            functionproficiencies: item.functionproficiencies,
            certifications: item.certifications,
            auditType: item.auditType,
            access: item.access,
            // item?.auditType?.length === 0 ? [{ item: {} }] :
            inLead: item.inLead,
          };
        });

        setFormData(val);
        setIsLoading(false);
      } else {
        setFormData(defaultFormData);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      // enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const handleChangePageNew = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
    const url = formatModernQuery(
      `/api/audit-settings/getAllAuditorProfiles`,
      {
        selectedUnit: selectedType,
        selectedSystem,
      },
      false,
      searchQuery.searchQuery,
      page,
      rowsPerPage
    );
    getData(url);
  };

  let typeAheadValue: string;
  let typeAheadType: string;

  const getSuggestionListUser = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchUser();
  };

  const getSuggestionListLocation = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchLocation();
  };

  const getSuggestionListSystem = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchSystem();
  };

  const debouncedSearchUser = debounce(() => {
    getUser(typeAheadValue, typeAheadType);
  }, 50);

  const debouncedSearchLocation = debounce(() => {
    getLocation(typeAheadValue, typeAheadType);
  }, 50);

  const debouncedSearchSystem = debounce(() => {
    getSystem(typeAheadValue, typeAheadType);
  }, 50);

  const handleLinkClick = async (id: string) => {
    // const selected = formData.find(
    //   (item: any) => item.auditorName.username === text
    // );
    // try {
    if (id) {
      const res = await axios
        .get(`/api/audit-settings/getAuditorProfileById/${id}`)
        .then((res: any) => {
          setParsedAuditType(res?.data);
          const val = {
            organizationId: res?.data?.organizationId,
            id: res?.data?.id,
            auditorName: res?.data?.auditorName,
            unit: res?.data?.unit,
            systemExpertise: res?.data?.systemExpertise,
            proficiencies: res?.data?.proficiencies,
            functionproficiencies: res?.data?.functionproficiencies,
            certifications: res?.data?.certifications,
            auditType: res?.data?.auditType,
            // : res?.data?.auditType,
            inLead: res?.data?.inLead,
          };
          return val;
        })
        .then((response: any) => {
          setSelectedData((prev: any) => {
            return { ...response, ...prev };
          });
          setSelectedCertificate(response.certifications || []);
        });

      setModalVisible(true);
      setIsLoading(false);
    }
    // } catch (err) {
    //   console.error(err);
    //   // enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
    //   setIsLoading(false);
    // }
  };

  const fetchAllProficiency = async () => {
    try {
      const res = await axios.get(`/api/audit-settings/getAllProficiency`);
      const val = res?.data.data.map((item: any) => {
        return {
          proficiency: item.proficiency,
          id: item.id,
        };
      });

      setProficiencyData(val);
      setIsLoading(false);
    } catch (err) {
      enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const handleClickDiscard = async () => {
    setPage(1);
    setRowsPerPage(10);

    const newUrl = formatModernQuery(
      `/api/audit-settings/getAllAuditorProfiles`,
      {
        // page: page,
        // limit: rowsPerPage,
        selectedUnit: selectedType || "",
      },
      false,
      "",
      1,
      10
    );
    getData(newUrl);
  };
  const dptData: any = [];

  const columns: ColumnsType<any> = [
    {
      title: "Name",
      dataIndex: "auditorName",
      key: "auditorName",
      width: 200,
      // render: (text) => <a onClick={() => handleLinkClick(text)}>{text}</a>,
      render: (_, record) =>
        // const username = record.auditorName.username;

        // dptData.push({
        //   id: record?.auditorName?.entityId,
        //   name: record?.auditorName?.entityName,
        // });
        // return (
        record.access ? (
          <div
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
            }}
          >
            <div
              onClick={() => {
                handleLinkClick(record.id);
              }}
            >
              {record.auditorName.username}
            </div>
          </div>
        ) : (
          <div>
            <div>{record.auditorName.username}</div>
          </div>
        ),

      // );
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      width: 200,
      filterIcon: (filtered: any) =>
        isFilterType ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "scroll", height: "300px", }}>
            {filterList?.map((name: any) => (
              <div key={name.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedType([...selectedType, value]);
                      } else {
                        setselectedType(
                          selectedType.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name.id}
                    checked={selectedType.includes(name?.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {name.locationName}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <AntdButton
                type="primary"
                disabled={selectedType.length === 0}
                onClick={() => {
                  setfilterType(true);
                  // handlePagination(1, 10);
                  applyFilter(true);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </AntdButton>
              <AntdButton
                onClick={() => {
                  setselectedType([]);
                  setfilterType(false);
                  applyFilter(false);
                }}
              >
                Reset
              </AntdButton>
            </div>
          </div>
        );
      },
      // // render: (text) => <a onClick={() => handleLinkClick(text)}>{text}</a>,
      // render: (_, record) => {
      //   const locationName = record.unit?.locationName;
      //   return <span>{locationName}</span>;
      // },
    },
    {
      title: "Department",
      dataIndex: "Department",
      key: "Department",
      width: 200,
      render: (_, record) => {
        return <span>{record?.auditorName?.entityName}</span>;
      },
      filterIcon: (filtered: any) =>
        isDeptType ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters, record }: any) => {
        return (
          <div style={{ padding: 8,overflowY: "scroll", height: "300px", }}>
            {DeptList?.length > 0
              ? DeptList?.map((name: any) => (
                  <div key={name?.name}>
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setSelectedDptType([...selectedDptType, value]);
                          } else {
                            setSelectedDptType(
                              selectedDptType.filter(
                                (key: any) => key !== value
                              )
                            );
                          }
                        }}
                        value={name?.id}
                        checked={selectedDptType.includes(name?.id)} // Check if the checkbox should be checked
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "5px",
                        }}
                      />
                      {name?.name}
                    </label>
                  </div>
                ))
              : ""}
            <div style={{ marginTop: 8 }}>
              <AntdButton
                type="primary"
                disabled={selectedDptType.length === 0}
                onClick={() => {
                  setDeptType(true);
                  // handlePagination(1, 10);
                  applyFilter(true);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </AntdButton>
              <AntdButton
                onClick={() => {
                  setSelectedDptType([]);
                  setDeptType(false);
                  applyFilter(true);
                }}
              >
                Reset
              </AntdButton>
            </div>
          </div>
        );
      },
      // // render: (text) => <a onClick={() => handleLinkClick(text)}>{text}</a>,
      // render: (_, record) => {
      //   const locationName = record.unit?.locationName;
      //   return <span>{locationName}</span>;
      // },
    },
    {
      title: "System",
      dataIndex: "systemExpertise",
      width: 600,
      key: "systemExpertise",
      render: (_, record) => {
        return <MultiUserDisplay data={record.systemExpertise} name="name" />;
      },
      filterIcon: (filtered: any) =>
        isSystemType ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8,overflowY: "scroll"}}>
            {systemList?.map((name: any) => (
              <div key={name.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedSystem([...selectedSystem, value]);
                      } else {
                        setSelectedSystem(
                          selectedSystem.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name.id}
                    checked={selectedSystem.includes(name.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {name.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <AntdButton
                type="primary"
                disabled={selectedSystem.length === 0}
                onClick={() => {
                  setSystemType(true);
                  // handlePagination(1, 10);
                  applyFilter(true);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </AntdButton>
              <AntdButton
                onClick={() => {
                  setSelectedSystem([]);
                  setSystemType(false);
                  applyFilter(false);
                }}
              >
                Reset
              </AntdButton>
            </div>
          </div>
        );
      },
    },
    {
      title: "Function Proficiency",
      dataIndex: "functionproficiencies",
      width: 600,
      key: "functionproficiencies",
      render: (_, record) => {
        const formattedAreas = record?.functionproficiencies?.map(
          (system: string) => ({
            name: system,
          })
        );
        return <MultiUserDisplay data={formattedAreas} name="name" />;
      },
    },
    {
      title: "Proficiency",
      dataIndex: "proficiencies",
      width: 600,
      key: "proficiencies",
      render: (_, record) => {
        const formattedAreas = record?.proficiencies?.map((system: string) => ({
          name: system,
        }));
        return <MultiUserDisplay data={formattedAreas} name="name" />;
      },
    },
    {
      title: "Certification",
      dataIndex: "certifications",
      key: "certifications",
      width: 300,
      render: (_, record) => {
        const items: MenuProps["items"] = [];
        record?.certifications?.map((item: any, index: any) => {
          items.push({
            key: item.name,
            label: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
                onClick={() => {
                  handlerOpenCertifiModal(item);
                }}
              >
                {item.name}
              </div>
            ),
            icon: <MdAttachFile style={{ fontSize: "18px" }} />,
          });
        });
        return (
          <>
            <Dropdown
              menu={{ items }}
              overlayClassName={classes.DropDwonScroll}
            >
              <a onClick={(e) => e.preventDefault()}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "auto",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                    justifyContent: "space-between",
                    height: "30px",
                    backgroundColor: "#F4F6F9",
                    borderRadius: "5px",
                    color: "black",
                  }}
                >
                  <span
                    style={{
                      width: "150px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {record?.certifications[0]?.name || "No File"}
                  </span>{" "}
                  <MdExpandMore style={{ color: "#B2BABB" }} />
                </div>
              </a>
            </Dropdown>
          </>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) =>
        (isOrgAdmin ||
          (isMR &&
            (userInfo?.location?.locationName === record.unit ||
              userInfo?.additionalUnits?.includes(record?.locationId)))) && (
          <IconButton
            onClick={() => {
              handleOpen(record);
            }}
            style={{ padding: "10px" }}
          >
            <CustomDeleteICon width={20} height={20} />
          </IconButton>
        ),
    },
  ];

  const applyFilter = async (condition: any) => {
    setPage(1);
    setRowsPerPage(10);
    if (condition === false) {
      await setselectedType([]);
    }

    const newUrl = formatModernQuery(
      `/api/audit-settings/getAllAuditorProfiles`,
      {
        // page: page,
        // limit: rowsPerPage,
        selectedSystem: condition ? selectedSystem : "",
        selectedUnit: condition ? selectedType : "",
        selectedDpt: condition ? selectedDptType : "",
      },
      false,
      searchQuery.searchQuery,
      1,
      10
    );
    getData(newUrl);
  };

  const getFunctions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/business/getAllFunctionsByOrgId/${organizationId}`
      );

      if (res?.data) {
        setFunctionData(res.data);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `/api/audit-settings/deleteAuditorProfileById/${deleteProfile.id}`
      );
      const url = formatModernQuery(
        `/api/audit-settings/getAllAuditorProfiles`,
        {
          selectedUnit: selectedType,
        },
        false,
        searchQuery.searchQuery,
        page,
        rowsPerPage
      );
      getData(url);
      handleClose();
    } catch (error) {
      // Error handling
      console.log("Error deleting audit Focus", error);
    }
  };

  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  const handleMouseEnter = (record: any) => {
    setHoveredRow(record.id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  const handleModalCancel = () => {
    setSelectedData(null);
    setModalVisible(false);
    setTemplate([]);
    const url = formatModernQuery(
      `/api/audit-settings/getAllAuditorProfiles`,
      {
        // page: page,
        // limit: rowsPerPage,
        selectedUnit: selectedType,
      },
      false,
      searchQuery.searchQuery,
      page,
      rowsPerPage
    );
    getData(url);
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setdeleteProfile(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const uploadCertificateAttachmentsOld = async (files: any) => {
    try {
      const locationName = isOrgAdmin ? "" : userInfo?.location?.locationName;

      const newFormData = new FormData();
      files.forEach((file: any) => {
        newFormData.append("files", file.originFileObj, file.name);
      });

      const response = await axios.post(
        `/api/audits/addAttachMentForAudit?realm=${realmName}&locationName=${locationName}`,
        newFormData
      );

      setUrls(response?.data);
      setFormData({
        ...formData,
        certifications: response?.data,
      });
      if (response?.status === 200 || response?.status === 201) {
        return {
          isFileUploaded: true,
          urls: response?.data,
        };
      } else {
        return {
          isFileUploaded: false,
          urls: [],
        };
      }
    } catch (error) {}
  };

  const uploadCertificateAttachments = async (files: any) => {
    const locationName = isOrgAdmin ? "" : userInfo?.location?.locationName;
    const formDataFiles = new FormData();
    const oldData = [];
    const newData = [];

    for (const file of files) {
      if (file?.url) {
        oldData.push(file);
      } else {
        newData.push(file);
      }
    }
    newData.forEach((file: any) => {
      const fileToAdd = file.originFileObj || file;
      // console.log("fileToAdd content:", fileToAdd);
      formDataFiles.append("files", fileToAdd);
    });

    const id = "Audit-Profile";
    let res: any;
    let comdinedData;
    if (newData.length > 0) {
      res = await axios.post(
        `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${locationName}`,
        formDataFiles,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            id: id,
          },
        }
      );
    }
    if (res?.data?.length > 0) {
      comdinedData = res?.data;
    }

    if (oldData.length > 0) {
      comdinedData = oldData;
    }

    if (oldData?.length > 0 && res?.data?.length > 0) {
      comdinedData = [...res.data, ...oldData];
    }

    return comdinedData;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const uploadAttachement =
      selectedCertificate?.length > 0
        ? await uploadCertificateAttachments(selectedCertificate)
        : [];
    // if (!!template?.files && template?.files?.length > 0) {
    //   uploadAttachement = await uploadCertificateAttachments(template?.files);
    // }

    if (selectedData) {
      // Update existing audit type
      const transformedArray = selectedData?.auditType?.map(
        (item: any) => item.item
      );
      try {
        if (
          selectedData?.auditorName === "" ||
          selectedData?.systemExpertise?.length === 0 ||
          // selectedData?.functionproficiencies?.length === 0 ||
          selectedData?.auditType[0]?.item?.name === ""
        ) {
          enqueueSnackbar("Please Enter Required field", {
            variant: "warning",
          });
          return;
        }
        const res = await axios.put(
          `/api/audit-settings/updateAuditorProfileById/${selectedData.id}`,
          {
            id: selectedData.id,
            auditorName: selectedData.auditorName,
            unit: selectedData?.auditorName?.locationName,
            systemExpertise: selectedData.systemExpertise,
            proficiencies: selectedData.proficiencies,
            functionproficiencies: selectedData.functionproficiencies,
            inLead: selectedData.inLead,
            certifications: uploadAttachement,
            auditType: transformedArray,
            organizationId: organizationId,
          }
        );

        setSelectedData(null);
        setModalVisible(false);

        setTemplate([]);
        const url = formatModernQuery(
          `/api/audit-settings/getAllAuditorProfiles`,
          {
            selectedUnit: selectedType,
          },
          false,
          searchQuery.searchQuery,
          page,
          rowsPerPage
        );
        getData(url);
      } catch (err) {
        console.log("Error updating audit type", err);
      }
    } else {
      // Create new audit type
      if (
        formData?.auditorName &&
        formData?.systemExpertise?.length > 0 &&
        // formData?.functionproficiencies?.length > 0 &&
        formData?.auditType[0]?.item?.name
      ) {
        try {
          const res = await axios.post(
            `/api/audit-settings/newauditorProfile`,
            {
              auditorName: formData.auditorName,
              unit: formData?.auditorName?.locationName,
              systemExpertise: formData.systemExpertise,
              proficiencies: formData.proficiencies,
              functionproficiencies: formData.functionproficiencies,
              inLead: formData.inLead,
              certifications: uploadAttachement,
              auditType: formData.auditType,
              // formData?.auditType?.length === 0
              //   ? [{ item: {} }]
              //   :
              organizationId: organizationId,
            }
          );

          setFormData({
            auditorName: "",
            unit: "",
            systemExpertise: [],
            proficiencies: [],
            functionproficiencies: [],
            inLead: [],
            certifications: [],
            auditType: [],
            organizationId: "",
          });
          setModalVisible(false);
          setTemplate([]);
          const url = formatModernQuery(
            `/api/audit-settings/getAllAuditorProfiles`,
            {
              selectedUnit: selectedType,
            },
            false,
            searchQuery.searchQuery,
            page,
            rowsPerPage
          );
          getData(url);
        } catch (err) {
          console.log("Error creating audit type", err);
        }
      } else {
        enqueueSnackbar("Please Enter Required field", { variant: "warning" });
      }
    }
  };

  const handleSearchChangeNew = (e: any) => {
    e.preventDefault();
    setsearchQuery({
      searchQuery: e.target.value,
    });
  };
  const [fields, setFields] = useState([{ value: "" }]);

  // const handleChange = (index: any, event: any) => {
  //   const updatedFields = [...fields];
  //   updatedFields[index].value = event.target.value;
  //   setFields(updatedFields);
  // };

  const handleAddField = () => {
    const updatedFields = [...fields];
    updatedFields.push({ value: "" });
    setFields(updatedFields);
  };

  const handleRemoveField = (index: any) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };

  const [file, setFile] = useState(null);

  const handleDrop = (event: any) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  const getUser = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `/api/audit-settings/getAuditorsBasedOnFilters/${value}`
      );
      const ops = res.data.map((obj: any) => ({
        id: obj.id,
        username: obj.username,
        locationName: obj?.location?.locationName || "",
        locationid: obj?.location?.id,
        entityId: obj?.entityId || "",
        entityName: obj?.entity?.entityName || "",
      }));
      setUser(ops);
    } catch (err) {
      console.log(err);
    }
  };

  const getLocation = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `/api/documents/filerValue?searchLocation=${value}&searchBusinessType=&searchEntity=&searchSystems=&searchDoctype=&searchUser=`
      );

      const ops = res.data.locations.map((obj: any) => ({
        id: obj.id,
        locationName: obj.locationName,
      }));
      setLocation(ops);
    } catch (err) {
      console.log(err);
    }
  };

  const parseauditypes = (data: any) => {
    const auditTypes: any = [];
    data?.map((item: any) => {
      auditTypes.push({
        auditType: item.auditType,
        id: item.id,
      });
    });

    return auditTypes;
  };

  const getauditTypes = () => {
    getAllAuditTypes()
      .then((response: any) => {
        setAuditTypes(parseauditypes(response?.data));
      })
      .catch((error: any) => console.log("error response - ", error));
  };

  const getSystem = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `/api/documents/filerValue?searchLocation=&searchBusinessType=&searchEntity=&searchSystems=${value}&searchDoctype=&searchUser=`
      );
      const ops = res.data.allSystems.map((obj: any) => ({
        id: obj._id,
        name: obj.name,
      }));
      setSystem(ops);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e: any, value: any[], fieldName: string) => {
    if (selectedData) {
      setSelectedData((prevData: any) => ({
        ...prevData,
        [fieldName]: value,
      }));
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        [fieldName]: value,
      }));
    }
  };

  const handleLink = (
    info: UploadChangeParam<UploadFile<any>>,
    fieldName: string
  ) => {
    // You can access the uploaded files via info.fileList
    // You may want to update your state accordingly
    setFormData((prevData: any) => ({
      ...prevData,
      [fieldName]: info.fileList, // Assuming you want to store the fileList
    }));
  };
  // const handleImageUpload = (e: any) => {
  //   let formData = new FormData();
  //   formData.append("file", e.target.files[0]);
  //   let copyData = JSON.parse(JSON.stringify(auditeeData));

  //   addAttachment(formData).then((response: any) => {
  //     setAuditeeData((prev: any) => {
  //       copyData.proofDocument = response?.data?.path;
  //       copyData.documentName = response?.data?.name;
  //       copyData.imageLink = response?.data?.path;
  //       copyData.imageName = response?.data?.name;
  //       return copyData;
  //     });
  //   });
  // };

  const clearFile = () => {
    // let copyData = JSON.parse(JSON.stringify(auditeeData));
    // deleteAttachment({
    //   path: auditeeData?.imageLink,
    // }).then((response: any) => {
    //   if (response?.data?.status === 200) {
    //     setAuditeeData((prev: any) => {
    //       copyData.proofDocument = "";
    //       copyData.documentName = "";
    //       copyData.imageLink = "";
    //       copyData.imageName = "";
    //       return copyData;
    //     });
    //   }
    // });
  };

  const uploadProps: UploadProps = {
    multiple: true,
    beforeUpload: () => false,
    fileList: template?.files || [],
    onRemove: (file) => {
      const updatedFileList = selectedCertificate.filter(
        (item: any) => item.uid !== file.uid
      );
      setSelectedCertificate(updatedFileList);
    },
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        // setTemplate((prevTemplate: any) => ({
        //   ...prevTemplate,
        //   files: fileList,
        // }));
        setSelectedCertificate(fileList as any);
      }
    },
  };
  const handleTableSearch = async () => {
    setPage(1);
    setRowsPerPage(10);

    const newUrl = formatModernQuery(
      `/api/audit-settings/getAllAuditorProfiles`,
      {
        // page: page,
        // limit: rowsPerPage,
        selectedUnit: selectedType || "",
      },
      false,
      searchQuery.searchQuery,
      1,
      10
    );
    getData(newUrl);
  };
  const handleDeleteFile = async (url: string) => {
    // console.log("check response in deleting file", response);
    // if (response.status === 200 || response.status === 201) {
    const updatedUrls = selectedCertificate.filter(
      (item: any) => item.uid !== url
    );
    setSelectedCertificate(updatedUrls);
    // }
  };

  const disableCondition = () => {
    if (isOrgAdmin) {
      return false;
    }
    if (isMR) {
      if (selectedData?.unit !== undefined) {
        if (
          userInfo?.location?.id === selectedData?.auditorName?.locationid ||
          userInfo?.additionalUnits?.includes(
            selectedData?.auditorName?.locationid
          )
        ) {
          return false;
        }
      } else if (selectedData?.unit === undefined) {
        return false;
      }
      return true;
    }
  };

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const handleLinkClicks = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.url
        : await viewObjectStorageDoc(item?.url);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };
  return (
    <>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />
      <Modal
        open={modalVisible}
        onClose={handleModalCancel}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          height="500px !important"
          overflow="auto" // Enable vertical scrolling
          width="1400px !important"
          mx="auto"
          my={4}
          p={3}
          style={{ backgroundColor: "#ffffff" }}
        >
          <div>
            <Typography variant="h6">
              {selectedData?.name ? selectedData.name : "Add Auditor Profile"}
            </Typography>
            <Divider />
            <form onSubmit={handleSubmit}>
              {/* <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "poppinsregular",
                    }}
                  > */}
              <Grid container style={{ paddingTop: "30px" }}>
                <Grid container item sm={12} md={5}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Auditor Name*</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <AutoComplete
                      suggestionList={user}
                      name={"Auditor Name"}
                      keyName={"auditorName"}
                      formData={selectedData ? selectedData : formData}
                      setFormData={selectedData ? setSelectedData : setFormData}
                      getSuggestionList={getSuggestionListUser}
                      labelKey="username"
                      multiple={false}
                      disabled={disableCondition()}
                      defaultValue={
                        // formData?.auditorName
                        selectedData?.auditorName || formData.auditorName || ""
                      }
                    />
                  </Grid>
                </Grid>
                <Grid container item sm={12} md={1} />
                <Grid container item sm={12} md={5}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Unit</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <TextField
                      fullWidth
                      name="unit"
                      value={
                        selectedData?.auditorName?.locationName ||
                        formData?.auditorName?.locationName ||
                        ""
                      }
                      variant="outlined"
                      size="small"
                      disabled={true}
                      InputLabelProps={{ shrink: false }}
                      inputProps={{
                        "data-testid": "unit",
                      }}
                      InputProps={{
                        style: { borderRadius: "8px" },
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container item sm={12} md={5}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>System*</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <AutoComplete
                      suggestionList={system}
                      name={"System Name"}
                      keyName={"systemExpertise"}
                      formData={selectedData ? selectedData : formData}
                      setFormData={selectedData ? setSelectedData : setFormData}
                      getSuggestionList={getSuggestionListSystem}
                      labelKey={"name"}
                      multiple={true}
                      disabled={disableCondition()}
                      defaultValue={
                        selectedData?.systemExpertise ||
                        formData.systemExpertise ||
                        []
                      }
                    />
                  </Grid>
                </Grid>
                <Grid container item sm={12} md={1} />
                <Grid container item sm={12} md={5}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Proficiencies</strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <Autocomplete
                      multiple
                      disabled={disableCondition()}
                      options={proficiencyData?.map(
                        (option: any) => option.proficiency
                      )}
                      defaultValue={
                        selectedData?.proficiencies ||
                        formData?.proficiencies ||
                        []
                      }
                      onChange={(e, value) =>
                        handleChange(e, value, "proficiencies")
                      }
                      classes={{ paper: classes.autocomplete }}
                      size="small"
                      value={formData?.proficiencies}
                      freeSolo
                      renderTags={(value: string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                          <Chip
                            variant="outlined"
                            size="small"
                            style={{
                              backgroundColor: "#E0E0E0",
                              fontSize: "11px",
                              border: "transparent",
                            }}
                            label={option}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          // label="Proficiency"
                          style={{ fontSize: "11px" }}
                          // placeholder="proficiency"
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid container item sm={12} md={12}>
                  <Grid container item sm={12} md={5}>
                    <Grid
                      item
                      sm={12}
                      md={4}
                      className={classes.formTextPadding}
                    >
                      <strong>Lead Auditor In</strong>
                    </Grid>
                    <Grid item sm={12} md={8} className={classes.formBox}>
                      <Autocomplete
                        multiple
                        options={
                          selectedData
                            ? selectedData?.systemExpertise?.map(
                                (option: any) => option.name
                              )
                            : formData
                            ? formData?.systemExpertise?.map(
                                (option: any) => option.name
                              )
                            : []
                        }
                        defaultValue={
                          selectedData?.inLead || formData?.inLead || []
                        }
                        onChange={(e, value) =>
                          handleChange(e, value, "inLead")
                        }
                        disabled={disableCondition()}
                        classes={{ paper: classes.autocomplete }}
                        size="small"
                        value={formData?.inLead}
                        freeSolo
                        renderTags={(value: string[], getTagProps) =>
                          value.map((option: string, index: number) => (
                            <Chip
                              variant="outlined"
                              size="small"
                              style={{
                                backgroundColor: "#E0E0E0",
                                fontSize: "11px",
                                border: "transparent",
                              }}
                              label={option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            // label="In Lead"
                            style={{ fontSize: "14px" }}
                            // placeholder="proficiency"
                            size="small"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  <Grid container item sm={12} md={1} />
                  <Grid container item sm={12} md={5}>
                    <Grid
                      item
                      sm={12}
                      md={4}
                      className={classes.formTextPadding}
                    >
                      <strong>Functional Proficiencies*</strong>
                    </Grid>
                    <Grid item sm={12} md={8} className={classes.formBox}>
                      <Autocomplete
                        multiple
                        disabled={disableCondition()}
                        options={functionData?.map(
                          (option: any) => option.name
                        )}
                        defaultValue={
                          selectedData?.functionproficiencies ||
                          formData?.functionproficiencies ||
                          []
                        }
                        onChange={(e, value) =>
                          handleChange(e, value, "functionproficiencies")
                        }
                        classes={{ paper: classes.autocomplete }}
                        size="small"
                        value={formData?.functionproficiencies}
                        freeSolo
                        renderTags={(value: string[], getTagProps) =>
                          value.map((option: string, index: number) => (
                            <Chip
                              variant="outlined"
                              size="small"
                              style={{
                                backgroundColor: "#E0E0E0",
                                fontSize: "11px",
                                border: "transparent",
                              }}
                              label={option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            // label="Proficiency"
                            style={{ fontSize: "11px" }}
                            // placeholder="proficiency"
                            size="small"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  <Grid container item sm={12} md={5}>
                    <Grid
                      item
                      sm={12}
                      md={4}
                      className={classes.formTextPadding}
                    >
                      <strong>Certificate</strong>
                    </Grid>
                    <Grid item sm={12} md={8} className={classes.formBox}>
                      <Form.Item name="uploader" style={{ display: "none" }}>
                        <Input disabled={disableCondition()} />
                      </Form.Item>
                      <Dragger
                        name="files"
                        {...uploadProps}
                        disabled={disableCondition()}
                        showUploadList={false}
                        fileList={selectedCertificate}
                        multiple
                      >
                        <div style={{ textAlign: "center" }}>
                          <MdInbox style={{ fontSize: "36px" }} />
                          <p className="ant-upload-text">
                            Click or drag files here to upload
                          </p>
                        </div>
                      </Dragger>
                    </Grid>
                    <Grid item sm={12} md={4}></Grid>
                    <Grid item sm={12} md={8} className={classes.formBox}>
                      {!!selectedCertificate &&
                        !!selectedCertificate?.length && (
                          <div>
                            <Typography
                              variant="body2"
                              style={{
                                marginTop: "16px",
                                marginBottom: "8px",
                              }}
                            >
                              Uploaded Files:
                            </Typography>

                            {selectedCertificate?.map(
                              (item: any, index: number) => (
                                <div
                                  key={index}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <Typography
                                    className={classes.filename}
                                    onClick={() => handleLinkClicks(item)}
                                  >
                                    {/* File {index + 1} */}
                                    {item.name}
                                  </Typography>
                                  <div
                                    style={{
                                      cursor: "pointer",
                                      marginRight: "8px",
                                    }}
                                    onClick={() => handleDeleteFile(item.uid)}
                                  >
                                    <MdDelete style={{ fontSize: "18px" }} />
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </Grid>
                  </Grid>
                  <Grid container item sm={12} md={1} />
                  <Grid container item sm={12} md={5}>
                    <Grid
                      item
                      sm={12}
                      md={4}
                      className={classes.formTextPadding}
                    >
                      <strong>Allowed Audit Types*</strong>
                    </Grid>
                    <Grid item sm={12} md={8} className={classes.formBox}>
                      <DynamicFormSearchField
                        data={selectedData ? selectedData : formData}
                        disabled={disableCondition()}
                        setData={selectedData ? setSelectedData : setFormData}
                        name="auditType"
                        keyName="item"
                        suggestions={audittypes || []}
                        suggestionLabel="auditType"
                        hideTooltip={false}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid
                  container
                  item
                  sm={12}
                  md={12}
                  style={{ display: "flex", justifyContent: "end" }}
                >
                  <Grid item style={{ paddingRight: "10px" }}>
                    <Button
                      // style={{
                      //   borderColor: "#0E497A",
                      // }}
                      onClick={handleModalCancel}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      style={{
                        backgroundColor: "#0E497A",
                        color: "#ffffff",
                      }}
                      type="submit"
                    >
                      Submit
                    </Button>
                  </Grid>
                </Grid>
                {/* <Box width="100%" display="flex" justifyContent="center" pt={2}>
                  <Button
                    className={classes.buttonColor}
                    variant="outlined"
                    onClick={handleModalCancel}
                  >
                    Cancel
                  </Button>

                  <CustomButton
                    text="Submit"
                    handleClick={handleSubmit}
                  ></CustomButton>
                </Box> */}
              </Grid>
            </form>
          </div>
        </Box>
      </Modal>
      <AntdModal
        title={fileLinkCi?.name}
        open={certifiOpen}
        onCancel={handlerCloseCertifiModal}
        footer={null}
        width="400px"
      >
        <div>
          <DocumentViewerAudit fileLink={fileLinkCi?.url} status={false} />
        </div>
      </AntdModal>
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingBottom: "10px",
          }}
        >
          <SearchBar
            placeholder="Search"
            name="searchQuery"
            values={searchQuery}
            handleChange={handleSearchChangeNew}
            handleApply={handleTableSearch}
            endAdornment={true}
            handleClickDiscard={() => {
              setsearchQuery({
                searchQuery: "",
              });
              handleClickDiscard();
            }}
          />
          {(isOrgAdmin || isMR) && (
            <Button
              onClick={() => {
                setFormData(defaultFormData);
                setModalVisible(true);
                setUser([]);
              }}
              style={{
                backgroundColor: "#0E497A",
                color: "#ffffff",
                marginLeft: "20px",
              }}
            >
              Add
            </Button>
          )}
        </div>
        {formData && Array.isArray(formData) && formData.length !== 0 ? (
          <div data-testid="custom-table" className={classes.tableContainer}>
            <Table
              columns={columns}
              dataSource={formData}
              pagination={false}
              size="middle"
              rowKey={"id"}
              // bordered
              className={classes.documentTable}
              // rowClassName={rowClassName}
              onRow={(record) => ({
                onMouseEnter: () => handleMouseEnter(record),
                onMouseLeave: handleMouseLeave,
              })}
            />
            <div className={classes.pagination}>
              <Pagination
                size="small"
                current={page}
                pageSize={rowsPerPage}
                total={count}
                showTotal={showTotal}
                showSizeChanger
                showQuickJumper
                onChange={(page, pageSize) => {
                  handleChangePageNew(page, pageSize);
                }}
              />
            </div>
          </div>
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
              Let’s begin by adding an Audit Type
            </Typography>
          </>
        )}
      </>

      {isLoading && (
        <Box
          marginY="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress />
        </Box>
      )}
    </>
  );
};

export default AuditorProfile;
