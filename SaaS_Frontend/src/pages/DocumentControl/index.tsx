import { useState, useCallback, useEffect, useRef } from "react";
import DocumentTable from "components/Document/DocumentTable";
import CustomTabs from "components/Document/DocumentTabs";
import {
  fetchAllDocuments,
  fetchMyDocuments,
  fetchFavoriteDocuments,
  fetchDistributedDocuments,
  fetchInWorkflowDocuments,
} from "pages/DocumentControl/apis";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import { createAllDocColumns } from "./constants/allDocColumns";
import { createInWorkflowDocColumns } from "./constants/inWorkflowDocColumns";
import { createMyDocCOlumns } from "./constants/myDocColumns";
import { createCommonDocColumns } from "./constants/commonColumns";
import getAppUrl from "utils/getAppUrl";
import useStyles from "./style";
import {
  IconButton,
  InputAdornment,
  OutlinedInput,
  TextField,
  useMediaQuery,
} from "@material-ui/core";
import DocumentTabs from "components/Document/DocumentTabs";
import { Button, message, Select, Typography, Dropdown, Menu } from "antd";
import { IoSettingsOutline } from "react-icons/io5";
import {
  AiOutlineFilter,
  AiFillFilter,
  AiOutlineSearch,
  AiOutlineSend,
} from "react-icons/ai";
import { RiSidebarUnfoldLine, RiSidebarFoldLine } from "react-icons/ri";

import { useNavigate } from "react-router-dom";
import DocumentEditModal from "components/Document/DocumentTable/DocumentEditModal";
import DocumentViewDrawer from "components/Document/DocumentTable/DocumentViewDrawer";
import DocumentSideNav from "components/Document/DocumentSideNav";
import { createSubColumns } from "./constants/subColumns";
import checkRoles from "utils/checkRoles";
import { AiOutlineFileAdd } from "react-icons/ai";
import { LuFileText, LuCirclePlus } from "react-icons/lu";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import { GiStarShuriken } from "react-icons/gi";
import DocumentCreationWizard from "components/Document/DocumentCreateModal";
import DocumentChatModal from "components/Document/DocumentTable/DocumentChatModal";
import {
  AiOutlineInbox,
  AiOutlineGoogle,
  AiOutlineWindows,
} from "react-icons/ai";
import useDrivePicker from "react-google-drive-picker";
import toFormData from "utils/toFormData";
import { showLoader, hideLoader } from "components/GlobalLoader/loaderState"; // Import loader control functions
import setDataFromGoogle from "components/Document/DocumentTable/DocumentDrawer/DocInfoTab/GoogleLoginComponent";
import BulkUploadDocumentModal from "components/Document/BulkUploadDocumentModal";
import BulkUploadImageModal from "components/Document/BulkUploadImageModal";
import SignatureComponent from "components/ReusableComponents/SignatureComponent";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";
import { Autocomplete } from "@material-ui/lab";
const tabOptions = [
  { key: "all-docs", label: "All Documents" },
  { key: "my-docs", label: "My Documents" },
  { key: "favorites", label: "Favorites" },
  { key: "distributed", label: "Distributed" },
  { key: "inWorkflow", label: "In Workflow" },
];

const { Title } = Typography;
const { Option } = Select;

const DocumentControl = () => {
  const userDetails = getSessionStorage();
  const realmName = getAppUrl();
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles(matches)();
  const navigate = useNavigate();
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  const isMr = checkRoles("MR");

  const [activeTab, setActiveTab] = useState<string>("all-docs");
  const [tableData, setTableData] = useState<any[]>([]);
  const [isTableDataLoading, setIsTableDataLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState<any>("");
  const [filterOptions, setFilterOptions] = useState<any>({
    docType: [],
    system: [],
    status: [],
    locationId: [],
    entityId: [],
    // section: [],
  });

  const [selectedFilters, setSelectedFilters] = useState<any>({
    docType: [], // → Type filter
    system: [], // → System filter
    locationId: [], // → Unit filter
    entityId: [], // → Department filter
    status: [],
    section: [],
    myRole: [],
  });

  const [showFilters, setShowFilters] = useState<any>(false);
  // const [collapsed, setCollapsed] = useState<any>(false);
  const [collapseLevel, setCollapseLevel] = useState(0); // 0: full, 1: icons only, 2: hidden

  const [searchValues, setSearchValues] = useState<any>({
    docType: "",
    system: "",
    status: "",
    location: "",
    department: "",
    section: "",
  });
  const [activeModules, setActiveModules] = useState<any>([]);

  const [editModal, setEditModal] = useState<any>({
    open: false,
    id: null,
  });
  const [docViewDrawer, setDocViewDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [createModelOpen, setCreateModelOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState<any>(false);

  const [bulkUploadModel, setBulkUploadModel] = useState<any>({
    open: false,
  });
  const [bulkUploadConfirmModel, setBulkUploadConfirmModel] = useState<any>({
    open: false,
  });

  const [bulkUploadModelImage, setBulkUploadModelImage] = useState<any>({
    open: false,
  });
  const [bulkUploadConfirmModelImage, setBulkUploadConfirmModelImage] =
    useState<any>({
      open: false,
    });

  const [signModalOpen, setSignModalOpen] = useState<Boolean>(false);
  const digiSignCommentRef = useRef("");
  const [digiSignComment, setDigiSignComment] = useState<any>("");
  const [signatureHandler, setSignatureHandler] = useState<() => void>(
    () => () => {}
  );

  const [unitId, setUnitId] = useState<string>(userDetails?.location?.id);
  const [deptId, setDeptId] = useState<string>(userDetails?.entity?.id);
  const [selectedDept, setSelectedDept] = useState<any>({});

  //Document Create Modal
  const handleCreateModalClose = () => setCreateModelOpen(false);

  //Ai Chat Modal
  const handleCloseChatModal = () => {
    setChatModalOpen(false);
  };

  const handleCloseBulkUploadModal = () => {
    setBulkUploadModel({ open: false });
  };

  const handleOpenBulkConfirmModal = () => {
    setBulkUploadConfirmModel({ open: true });
  };

  const addAllOption = (
    options: any[],
    labelKey: string = "name",
    idKey: string = "id"
  ) => {
    return [{ [labelKey]: "All", [idKey]: "All" }, ...options];
  };

  const fetchFilterOptions = async () => {
    try {
      const userId = userDetails?.id;
      const userEntityId = userDetails?.entity?.id;
      const userLocationId = userDetails?.location?.id;
      const view = activeTab;
      const res = await axios.get(
        `/api/documents/getFilterOptions/${userDetails?.organizationId}`,
        {
          params: {
            view,
            userId,
            userEntityId,
            userLocationId,
            userEntityName: userDetails?.entity?.entityName,
            userLocationName: userDetails?.location?.locationName,
          },
        }
      );
      if (res?.status === 200) {
        setFilterOptions({
          docType: addAllOption(res.data.docTypes, "documentTypeName", "_id"),
          system: addAllOption(res.data.systems, "name", "_id"),
          locationId: addAllOption(res.data.locations, "locationName", "id"),
          entityId: addAllOption(res.data.entities, "entityName", "id"),
          status: res.data.statuses.map((s: any) => ({ id: s, name: s })),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInitialDepartment = async (id: string) => {
    try {
      if (id === "All") {
        setSelectedDept({ ...{ id: "All", name: "All" }, type: "All" });
      } else {
        const res = await axios.get(`/api/entity/getSelectedEntity/${id}`);
        const entity = res.data;

        setSelectedDept({
          id: entity.id,
          name: entity.entityName,
          type: entity?.entityType?.name,
        });
      }
    } catch (error) {
      console.error("Failed to fetch initial department:", error);
    }
  };
  // console.log("filteroptions", filterOptions);
  useEffect(() => {
    // if (!userDetails || filterOptions.docType.length === 0) return;

    const isMyDocsTab = activeTab === "my-docs";

    setSelectedFilters({
      docType: ["All"],
      system: ["All"],
      // locationId:
      //   isMyDocsTab && userDetails.location?.id
      //     ? [userDetails.location.id]
      //     : ["All"],
      // entityId:
      //   isMyDocsTab && userDetails.entity?.id
      //     ? [userDetails.entity.id]
      //     : ["All"],
      locationId:
        activeTab === "my-docs" ? ["All"] : [userDetails?.location?.id],
      entityId: activeTab === "my-docs" ? ["All"] : [userDetails?.entity?.id],
      status: [],
      section: [],
      myRole: [],
    });
    if (activeTab === "my-docs") {
      setUnitId("All");
      setDeptId("All");
      fetchInitialDepartment("All");
    } else {
      setUnitId(userDetails?.location?.id);
      setDeptId(userDetails?.entity?.id);
      fetchInitialDepartment(userDetails.entityId);
    }
    fetchFilterOptions();
  }, [activeTab]);

  useEffect(() => {
    // fetchFilterOptions();
    getActiveModules();
  }, []);

  useEffect(() => {
    if (userDetails?.entityId) {
      fetchInitialDepartment(userDetails.entityId);
    }
  }, [userDetails?.entityId]);

  useEffect(() => {
    if (deptId) {
      handleFilterChange("entityId", [deptId]);
    }
  }, [deptId]);

  const fetchTableData = useCallback(
    async (filtersOverride?: any, searchParam?: string) => {
      const filters = filtersOverride || selectedFilters;
      setLoading(true);
      setIsTableDataLoading(true);
      try {
        const payload: any = {
          page,
          limit: pageSize,
          organizationId: sessionStorage.getItem("orgId"),
          filterArr: Object.keys(filters).flatMap((key) => {
            const effectiveKey = key === "status" ? "documentState" : key;

            return filters[key]?.length > 0 && !filters[key].includes("All")
              ? [{ filterField: effectiveKey, fieldArr: filters[key] }]
              : [];
          }),
        };
        // console.log("searchParam", searchParam);
        // first choice: the explicit override
        const term = searchParam ?? "";
        if (term.trim().length > 0) {
          payload.search = term.trim();
        }

        let response;
        switch (activeTab) {
          case "all-docs":
            response = await fetchAllDocuments(payload, userDetails);
            break;
          case "my-docs":
            response = await fetchMyDocuments(payload, userDetails);
            break;
          case "favorites":
            response = await fetchFavoriteDocuments(payload, userDetails);
            break;
          case "distributed":
            response = await fetchDistributedDocuments(payload, userDetails);
            break;
          case "inWorkflow":
            response = await fetchInWorkflowDocuments(payload, userDetails);
            break;
          default:
            break;
        }

        if (response?.data) {
          setTableData(response.data);
          setTotalCount(response.total || 0);
        } else {
          setTableData([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error(err);
        setTableData([]);
        setTotalCount(0);
      } finally {
        setIsTableDataLoading(false);
        setLoading(false);
      }
    },
    [activeTab, page, pageSize, selectedFilters]
  );

  useEffect(() => {
    setPage(1);
    setPageSize(10);
  }, [activeTab]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTableData();
    }, 200); // 200ms debounce
    return () => clearTimeout(timeout);
  }, [activeTab, page, pageSize, selectedFilters]);

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    // console.log("handlePageChange", newPage, newPageSize);

    const shouldChangePageSize = newPageSize && newPageSize !== pageSize;

    setPage(newPage);
    if (shouldChangePageSize) {
      setPageSize(newPageSize);
    }

    // Always call API immediately
    fetchTableData();
  };

  const confirmFilter = (customFilters?: any) => {
    setPage(1);
    fetchTableData(customFilters || selectedFilters); // Pass latest filters
  };

  const resetFilter = () => {
    setSelectedFilters({
      docType: [],
      system: [],
      status: [],
      locationId: [],
      entityId: [],
      section: [],
    });
    setSearchValues({
      docType: "",
      system: "",
      status: "",
      locationId: "",
      entityId: "",
      section: "",
    });
    fetchTableData();
  };

  const getActiveModules = async () => {
    await axios(`/api/organization/getAllActiveModules/${realmName}`)
      .then((res) => {
        setActiveModules(res.data.activeModules);
      })
      .catch((err) => console.error(err));
  };

  const handleSettingsClick = () => {
    navigate("/processdocuments/documenttype");
  };

  const handleEditDoc = (record: any) => {
    // console.log("Edit Document:", record);

    setEditModal({
      open: true,
      id: record?._id,
    });
  };

  const handleEditModalClose = () => {
    setEditModal({
      open: false,
      id: null,
    });
  };

  const toggleDocViewDrawer = (record: any = {}) => {
    // console.log("Toggle Doc View Drawer:", record);

    setDocViewDrawer({
      open: !docViewDrawer.open,
      data: {
        ...record,
      },
    });
  };

  useEffect(() => {
    // console.log("docviewdrawer in doc control", docViewDrawer);
  }, [docViewDrawer]);

  const reloadTableDataAfterSubmit = () => {
    if (activeTab === "my-docs") {
      fetchTableData();
    } else {
      setActiveTab("my-docs");
    }
  };

  const validateForm = (action: any, record?: any) => {
    const errors: string[] = [];

    // Basic validations for all actions

    // Additional validations for non-draft actions
    if (action !== "draft") {
      if (!record?.documentLink) {
        errors.push("File attachment is required");
      }

      if (record?.workflowDetails === "default") {
        if (!record?.reviewers?.length) {
          errors.push("At least one reviewer is required");
        }
        if (!record?.approvers?.length) {
          errors.push("At least one approver is required");
        }
      }
    }

    return errors;
  };

  const handleDocumentAction = async (
    url: string,
    documentState?: string,
    record?: any
  ) => {
    try {
      const validationErrors = validateForm(documentState, record);
      if (validationErrors.length > 0) {
        message.error(
          <span>
            {validationErrors.map((err, idx) => (
              <span key={idx}>
                {err}
                <br />
              </span>
            ))}
          </span>
        );

        return;
      }
      setIsTableDataLoading(true);
      const formDataPayload = new FormData();
      if (documentState) formDataPayload.append("documentState", documentState);

      formDataPayload.append("realmName", realmName);
      formDataPayload.append(
        "locationName",
        userDetails?.location?.locationName
      );
      formDataPayload.append("updatedBy", userDetails?.id);
      formDataPayload.append("organizationId", userDetails?.organizationId);
      formDataPayload.append("digiSignComment", digiSignCommentRef.current);
      await axios.patch(url, formDataPayload);
      setDigiSignComment(null);
      setIsTableDataLoading(false);
      reloadTableDataAfterSubmit();
      message.success("Action completed successfully!");
      // handleModalClose();
    } catch (error) {
      setIsTableDataLoading(false);
      console.error("Update failed", error);
      message.error("Failed to update document.");
    } finally {
      setIsTableDataLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId?: string) => {
    try {
      setIsTableDataLoading(true);
      await axios.patch(`/api/documents/${documentId}`);
      setIsTableDataLoading(false);
      reloadTableDataAfterSubmit();
      message.success("Document Deleted Successfully!");
      // handleModalClose();
    } catch (error) {
      setIsTableDataLoading(false);
      console.error("Failed to delete document", error);
      message.error("Failed to delete document.");
    } finally {
      setIsTableDataLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string[]) => {
    setSelectedFilters((prev: any) => {
      const updated = {
        ...prev,
        [key]: value,
      };

      if (key === "locationId") {
        updated.entityId = [];
      }

      return updated;
    });

    // Always show loading when filter changes
    setIsTableDataLoading(true);

    // Add a 1-second debounce before API call
    setTimeout(() => {
      setPage(1);
    }, 300);
  };

  const handleLocationChange = (event: any, values: any) => {
    if (values && values?.id) {
      setUnitId(values?.id);
      setSelectedDept(null);
    }
    if (values?.id === "All") {
      setDeptId(values?.id);
      setSelectedDept({ ...{ id: "All", name: "All" }, type: "All" });
    }
    handleFilterChange("locationId", [values?.id]);
  };

  const getSelectedLocation = () => {
    const item = filterOptions.locationId.find((opt: any) => {
      if (opt.id === unitId) return opt;
    });
    console.log("item", item);

    return item || {};
  };

  const subColumns = createSubColumns({
    toggleDocViewDrawer,
    classes,
    handleEditProcessDoc: (record: any) => handleEditDoc(record),
    handleDocumentAction,
    handleDeleteDocument,
  });

  const handleDigiSignAndSubmit = async (
    url: any,
    status: any,
    record: any
  ) => {
    try {
      setSignatureHandler(
        () => () => handleDocumentAction(url, status, record)
      );
      setSignModalOpen(true);
    } catch (error) {}
  };

  const commonProps = {
    filterOptions,
    selectedFilters,
    setSelectedFilters,
    searchValues,
    setSearchValues,
    confirmFilter,
    resetFilter,
    toggleDocViewDrawer: (record: any) => toggleDocViewDrawer(record),
    handleEditProcessDoc: (record: any) => handleEditDoc(record),
    handleOpen: () => {},
    fetchDocuments: fetchTableData,
    matches: true,
    classes: {},
    iconColor: "#000",
    tabFilter: activeTab,
    handleDocumentAction: handleDocumentAction,
    handleDeleteDocument: handleDeleteDocument,
    handleDigiSignAndSubmit: handleDigiSignAndSubmit,
  };

  const columns =
    activeTab === "inWorkflow"
      ? createMyDocCOlumns(commonProps)
      : activeTab === "my-docs"
      ? createMyDocCOlumns(commonProps)
      : activeTab === "all-docs"
      ? createAllDocColumns(commonProps)
      : createMyDocCOlumns(commonProps);

  const createMenu = (
    <Menu>
      <Menu.Item
        key="quickUpload"
        icon={<AiOutlineFileAdd style={{ color: "#1890ff" }} />}
        onClick={() => setBulkUploadModel({ open: true })}
      >
        <div>
          <div className="font-medium">Upload Documents</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            Bulk Upload Documents
          </div>
        </div>
      </Menu.Item>
      <Menu.Item
        key="createDoc"
        icon={<LuFileText style={{ color: "#1890ff" }} />}
        onClick={() => setCreateModelOpen(true)}
      >
        <div>
          <div className="font-medium">Single Create</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            Step-by-step creation
          </div>
        </div>
      </Menu.Item>
      <Menu.Item
        key="aiUpload"
        icon={<HiOutlineRocketLaunch style={{ color: "#1890ff" }} />}
        onClick={() => setBulkUploadModelImage({ open: true })}
      >
        <div>
          <div className="font-medium">Upload Images</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            Bulk Upload Images
          </div>
        </div>
      </Menu.Item>
    </Menu>
  );

  const renderFilterBar = () => {
    return (
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "12px 24px",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Filter Item Wrapper */}
        {[
          {
            label: "Doc Type",
            key: "docTypeId",
            options: filterOptions.docType,
          },
          { label: "System", key: "system", options: filterOptions.system },
          // {
          //   label: "Department",
          //   key: "entityId",
          //   options: filterOptions.entityId,
          // },
          // {
          //   label: "Unit",
          //   key: "locationId",
          //   options: filterOptions.locationId,
          // },
        ].map((item) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: item?.key === "entityId" ? "285px" : "290px",
            }}
          >
            <label
              style={{
                fontWeight: 500,
                fontSize: "14px",
                color: "#374151",
                width:
                  item?.key === "entityId"
                    ? "92px"
                    : item?.key === "locationId"
                    ? "45px"
                    : "75px",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}:
            </label>
            <Select
              mode="multiple"
              allowClear
              showSearch
              style={{ flex: 1 }}
              placeholder={`Select ${item.label.toLowerCase()}`}
              value={selectedFilters[item.key]}
              onChange={(value) => handleFilterChange(item.key, value)}
              optionFilterProp="children"
            >
              {item.options.map((opt: any) => {
                // console.log("item", item);
                const label =
                  item.label === "Doc Type"
                    ? opt.documentTypeName
                    : item.label === "System"
                    ? opt.name
                    : item.label === "Unit"
                    ? opt.locationName
                    : item.label === "Department"
                    ? opt.entityName
                    : opt.name || opt.id;

                const value = opt.id || opt._id || label;

                return (
                  <Option key={value} value={value}>
                    {label}
                  </Option>
                );
              })}
            </Select>
          </div>
        ))}
        {/* Unit / Corp Func */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "290px",
          }}
        >
          <label
            style={{
              fontWeight: 500,
              fontSize: "14px",
              color: "#374151",
              width: "75px",
              whiteSpace: "nowrap",
            }}
          >
            Unit:
          </label>
          <Autocomplete
            disablePortal
            id="location-select"
            options={filterOptions.locationId}
            onChange={handleLocationChange}
            value={getSelectedLocation()}
            getOptionLabel={(option) => option.locationName || ""}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Select unit"
                variant="outlined"
              />
            )}
            fullWidth
          />
          {/* <Select
            showSearch
            placeholder="Select unit"
            optionFilterProp="children"
            onChange={(value, option) => handleLocationChange(value, option)}
            value={getSelectedLocation()?.locationId || undefined}
            style={{ width: "100%" }}
            size="middle" // Use "small" if you want smaller input
          >
            {filterOptions.locationId.map((option: any) => (
              <Option key={option.locationId} value={option.locationId}>
                {option.locationName}
              </Option>
            ))}
          </Select> */}
        </div>
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
              setSelectedDept({ ...dept, type }), setDeptId(dept?.id);
            }}
            onClear={() => setSelectedDept(null)}
          />
        </div>
      </div>
    );
  };

  const renderComponents = () => (
    <>
      <DocumentTable
        data={tableData}
        columns={columns}
        subColumns={subColumns}
        page={page}
        pageSize={pageSize}
        total={totalCount}
        loading={loading}
        onPageChange={handlePageChange}
        selectedFilters={selectedFilters}
        searchValues={searchValues}
        setSearchValues={setSearchValues}
        toggleDocViewDrawer={toggleDocViewDrawer}
        fetchDocuments={fetchTableData}
        tabFilter={activeTab}
        isTableDataLoading={isTableDataLoading}
        setIsTableDataLoading={setIsTableDataLoading}
        activeModules={activeModules}
      />
      {!!editModal?.open && (
        <DocumentEditModal
          editModal={editModal}
          handleModalClose={handleEditModalClose}
          reloadTableDataAfterSubmit={reloadTableDataAfterSubmit}
        />
      )}
      {!!docViewDrawer.open && (
        <DocumentViewDrawer
          docViewDrawer={docViewDrawer}
          setDocViewDrawer={setDocViewDrawer}
          toggleDocViewDrawer={toggleDocViewDrawer}
          handleFetchDocuments={fetchTableData}
          activeModules={activeModules}
        />
      )}
      {!!createModelOpen && (
        <DocumentCreationWizard
          open={createModelOpen}
          onClose={handleCreateModalClose}
          reloadTableDataAfterSubmit={reloadTableDataAfterSubmit}
          setIsTableDataLoading={setIsTableDataLoading}
        />
      )}
      {!!chatModalOpen && (
        <DocumentChatModal
          chatModalOpen={chatModalOpen}
          handleCloseChatModal={handleCloseChatModal}
        />
      )}
      <BulkUploadDocumentModal
        bulkUploadModel={bulkUploadModel}
        bulkUploadConfirmModel={bulkUploadConfirmModel}
        setBulkUploadConfirmModel={setBulkUploadConfirmModel}
        setBulkUploadModel={setBulkUploadModel}
      />
      <BulkUploadImageModal
        bulkUploadModelImage={bulkUploadModelImage}
        bulkUploadConfirmModelImage={bulkUploadConfirmModelImage}
        setBulkUploadModelImage={setBulkUploadModelImage}
        setBulkUploadConfirmModelImage={setBulkUploadConfirmModelImage}
      />
    </>
  );

  const onclose = () => {
    setSignModalOpen(false);
  };

  const setComment = (val: string) => {
    digiSignCommentRef.current = val;
    setDigiSignComment(val);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchTableData();
  };

  return (
    <div
      className={classes.root}
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative", // <- Important
      }}
    >
      {/* Sidebar */}
      <DocumentSideNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapseLevel={collapseLevel}
        isSettingsAccess={isMCOE || isMr}
        onSettingsClick={handleSettingsClick}
      />

      {/* Collapse Button placed inline between sidebar and main content */}
      <div
        style={{
          position: "absolute", // <- Makes it float above content
          top: 4,
          left: collapseLevel === 2 ? 0 : collapseLevel === 1 ? 60 : 88,
          zIndex: 10,
          // backgroundColor: "#fff",
          // border: "1px solid #ccc",
          // borderRadius: "50%",
          width: 55,
          height: 55,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // boxShadow: "0 0 4px rgba(0,0,0,0.1)",
          cursor: "pointer",
          transition: "left 0.3s ease",
        }}
        onClick={() => setCollapseLevel((prev) => (prev + 1) % 3)}
      >
        {collapseLevel === 2 ? (
          <RiSidebarUnfoldLine size={24} />
        ) : (
          <RiSidebarFoldLine size={24} />
        )}
      </div>

      {/* Main Content */}

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "0px 16px",
        }}
      >
        <div className={classes.headerContainer}>
          <div
            className={classes.titleRow}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              marginTop: "16px",
              marginLeft: "3%",
              marginRight: "3%",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <Title
              level={3}
              style={{
                fontWeight: 600,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {tabOptions.find((tab) => tab.key === activeTab)?.label || ""}
              {activeTab === "all-docs" && (
                <span style={{ fontSize: "14px", color: "#6b7280" }}>
                  (Published)
                </span>
              )}
            </Title>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {activeModules?.includes("AI_FEATURES") && (
                <Button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    padding: "5px 20px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                  }}
                  onClick={() => setChatModalOpen(true)}
                >
                  <GiStarShuriken
                    style={{ fontSize: "22px", color: "#ff6600" }}
                  />
                  AI Chat
                </Button>
              )}

              <Dropdown
                overlay={createMenu}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Button
                  icon={<LuCirclePlus size={16} style={{ marginRight: 4 }} />}
                  style={{
                    backgroundColor: "rgb(0, 48, 89)",
                    color: "#fff",
                    padding: "6px 16px",
                    borderRadius: "6px",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Create
                </Button>
              </Dropdown>
            </div>
          </div>

          {/* <div className={classes.searchRow}>
            <div className={classes.searchBox}>
              <AiOutlineSearch
                size={18}
                color="#6b7280"
                className={classes.searchIcon}
              />
              <input
                type="text"
                placeholder="Search Document"
                value={searchText}
                onChange={(e) => {
                  console.log("e.target.value", e.target.value);
                  console.log("searchText in onchange", searchText);
                  setSearchText(e.target.value)
                }}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") handleSearch(searchText);
                }}
                className={classes.searchInput}
              />
              <AiOutlineSend
                size={18}
                color="#6b7280"
                onClick={() => handleSearch(searchText)}
                className={classes.sendIcon}
              />
            </div> */}

          <div className={classes.searchRow}>
            <OutlinedInput
              className={classes.searchBox}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  fetchTableData(undefined, e.currentTarget.value);
              }}
              style={{ height: "41px" }}
              startAdornment={
                <InputAdornment position="start">
                  <AiOutlineSearch size={18} />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() =>
                      fetchTableData(undefined, /* latest text */ searchText)
                    }
                  >
                    <AiOutlineSend size={18} />
                  </IconButton>
                </InputAdornment>
              }
              classes={{
                input: classes.searchInput,
              }}
            />

            <div
              className={classes.filterButton}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <AiFillFilter size={18} />
              ) : (
                <AiOutlineFilter size={18} />
              )}
              {showFilters ? "Hide Filters" : "Show Filters"}
            </div>
          </div>
        </div>

        {showFilters && renderFilterBar()}
        {renderComponents()}
      </div>
      <SignatureComponent
        userData={userDetails}
        action={null}
        onClose={onclose}
        open={signModalOpen}
        handleMarkDone={signatureHandler}
        comment={digiSignComment}
        setComment={setComment}
      ></SignatureComponent>
    </div>
  );
};

export default DocumentControl;
