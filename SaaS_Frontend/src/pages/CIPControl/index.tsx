//react
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
//material-ui
import { Box, useMediaQuery } from "@material-ui/core";
import { MdOutlineSettings } from "react-icons/md";
//antd
//utils
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
//styles
import useStyles from "./style";
//assets
import { ReactComponent as CIPIcon } from "assets/appsIcon/cip.svg";
import { ReactComponent as SelectedTabArrow } from "assets/icons/SelectedTabArrow.svg";
//components
import ModuleHeader from "components/Navigation/ModuleHeader";
import checkRoles from "utils/checkRoles";
import CIPTable from "components/CIPManagement/CIPTable";
import { useSnackbar } from "notistack";
import getYearFormat from "utils/getYearFormat";
import { Tour, TourProps } from "antd";
import { Button as AntButton } from "antd"; // Correct import
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import { FaUserGroup } from "react-icons/fa6";
const CIPControl = () => {
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const orgId = sessionStorage.getItem("orgId");
  const matches = useMediaQuery("(min-width:822px)");
  const classes = useStyles(matches)();
  const navigate = useNavigate();
  const realmName = getAppUrl();
  const [value, setValue] = useState(0);
  const [isGraphSectionVisible, setIsGraphSectionVisible] = useState(false);
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });
  const [actionItemDrawer, setActionItemDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });
  const [filter, setFilter] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [tabFilter, setTabFilter] = useState<string>("allCIPs");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [count, setCount] = useState<number>(0);
  const [dataLength, setDataLength] = useState<any>(0);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState<any>(1);
  const [filterList, setFilterList] = useState<any>([]);
  const [isTableDataLoading, setIsTableDataLoading] = useState<any>(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValues, setSearch] = useState<any>({ searchQuery: "" });
  const { enqueueSnackbar } = useSnackbar();
  const [isHovered, setIsHovered] = useState(false);
  const [currentYear, setCurrentYear] = useState<any>();
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  useEffect(() => {
    getyear();
    //fetchCIPS();
  }, []);

  // const fetchCIPS = async (url: any = "") => {
  //   function formatDate(inputDate: any) {
  //     if (inputDate != null) {
  //       const date = new Date(inputDate);
  //       const day = date.getDate().toString().padStart(2, "0");
  //       const month = (date.getMonth() + 1).toString().padStart(2, "0");
  //       const year = date.getFullYear();
  //       return `${day}/${month}/${year}`;
  //     }
  //     return "";
  //   }

  //   try {
  //     setIsTableDataLoading(true);
  //     const today = new Date();
  //     const currentYear = today.getFullYear();
  //     const result = await axios.get(
  //       `/api/cip/getAll/${currentYear}/${"UserLocation"}?page=${1}&limit=${10}&search=${""}`
  //     );

  //     const actionItems = await axios.get(
  //       `/api/actionitems/getActionItemForSource?source=CIP&orgId=${orgId}&page=${page}&limit=${rowsPerPage}&unitId=${userInfo.locationId}&currentYear=${currentYear}`
  //     );

  //     if (actionItems?.data?.result && actionItems?.data?.result.length > 0) {
  //       let actionData: any[] = [];
  //       actionItems?.data?.result?.map((item: any) => {
  //         actionData.push({
  //           id: item._id,
  //           title: item.title,
  //           description: item.description,
  //           status: item.status,
  //           owner: item.owner,
  //           startDate: item.startDate,
  //           endDate: item.endDate,
  //           source: item.source,
  //           year: item.year,
  //           additionalInfo: item.additionalInfo,
  //           locationId: item.locationId,
  //           //deleted: item.deleted,
  //           referenceId: item.referenceId,
  //           organizationId: item.organizationId,
  //           createdAt: item.createdAt,
  //           updatedAt: item.updatedAt,
  //         });
  //       });
  //       // setActionItemData(actionData);
  //     }

  //     const sortedResult = result?.data?.data.sort((a: any, b: any) =>
  //       a.title.localeCompare(b.title)
  //     );
  //     if (result?.data?.data && result?.data?.data.length > 0) {
  //       setCount(result.data.count);
  //       setDataLength(result.data.data_length);
  //       let arr: any[] = [];
  //       sortedResult.map((item: any, key: any) => {
  //         arr.push({
  //           id: item._id,
  //           title: item.title,
  //           targetDate: formatDate(item.targetDate),
  //           cipCategoryId: item.cipCategoryId,
  //           cipTypeId: item.cipTypeId,
  //           justification: item.justification,
  //           cost: item.cost,
  //           tangibleBenefits: item.tangibleBenefits,
  //           status: item.status,
  //           attachment: item.attachment,
  //           year: item.year,
  //           locationId: item.locationId,
  //           entity: item.entity,
  //           location: item?.location,
  //           createdBy: item.createdBy,
  //           reviewers: item.reviewers,
  //           approvers: item.approvers,
  //           reference: item.reference,
  //           cancellation: item.cancellation,
  //           organizationId: item.organizationId,
  //           editAccess: item.editAccess,
  //         });
  //       });
  //       setData(arr);
  //       setIsTableDataLoading(false);
  //     } else {
  //       setData([]);
  //       setCount(result.data.count);
  //       setDataLength(result.data.data.data_length);
  //       setIsTableDataLoading(false);
  //     }
  //   } catch (err) {
  //     enqueueSnackbar("Error while fetching CIPs", { variant: "error" });
  //     setIsTableDataLoading(false);
  //   }
  // };

  const fetchActionItems = async () => {
    const actionItemsRes = await axios.get(
      `/api/actionitems/getActionItemForSource?source=CIP&orgId=${orgId}&page=${1}&limit=${10}&unitId=${
        userInfo.locationId
      }&currentYear=${currentYear}`
    );
  };

  // New state variable
  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };
  const toggleGraphSection = () => {
    // New function to toggle graph section
    setIsGraphSectionVisible(!isGraphSectionVisible);
  };

  const toggleDrawer = (record: any = {}) => {
    setDrawer({
      ...drawer,
      clearFields: record ? false : true,
      toggle: record ? false : true,
      open: !drawer.open,
      data: {
        ...record,
      },
    });
  };

  const createHandler = () => {
    setDrawer({
      ...drawer,
      mode: "create",
      clearFields: true,
      toggle: false,
      open: !drawer.open,
      data: {},
    });
  };

  const configHandler = () => {
    navigate("/cipsettings");
  };

  // help tour

  const refForcip1 = useRef(null);
  const refForcip2 = useRef(null);
  const refForcip3 = useRef(null);
  const refForcip4 = useRef(null);
  const refForcip5 = useRef(null);
  const refForcip6 = useRef(null);
  const refForcip7 = useRef(null);
  const refForcip8 = useRef(null);
  const refForcip9 = useRef(null);

  const [openTourForCip, setOpenTourForCip] = useState<boolean>(false);

  const stepsForCip: TourProps["steps"] = [
    {
      title: "Location",
      description: "",

      target: () => refForcip1.current,
    },
    {
      title: "year",
      description: " ",
      target: () => refForcip2.current,
    },

    {
      title: "Hyper Link",
      description: "",
      target: () => refForcip3.current,
    },

    // ...(isOrgAdmin || isMr
    //   ? [
    {
      title: "Edit",
      description: " ",
      target: () => refForcip4.current,
    },
    //   ]
    // : []),
    ...(isOrgAdmin
      ? [
          {
            title: "Delete",
            description: "",
            target: () => refForcip5.current,
          },
        ]
      : []),
    {
      title: "Status",
      description: "",

      target: () => refForcip6.current,
    },
  ];

  //mobile view part

  const [myCip, setMyCip] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className={classes.root} style={{ overflow: "hidden" }}>
      <Box
        sx={{ width: "100%", bgcolor: "background.paper", marginTop: "10px" }}
      >
        <div className={classes.tabWrapper}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px",
              justifyContent: "space-between",
            }}
          >
            {/* <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 10px 4px 10px",
                cursor: "pointer",
                borderRadius: "5px",
                position: "relative", // this is needed for the pseudo-element arrow
                backgroundColor: tabFilter === "allCIPs" ? "#3576BA" : "", // conditional background color
              }}
              onClick={() => {
                setTabFilter("allCIPs");
              }}
            >
              <CIPIcon
                className={classes.docNavIconStyle}
                fill={tabFilter === "allCIPs" ? "white" : "black"}
              />
              <span
                className={`${classes.docNavText}`}
                style={{
                  color: tabFilter === "allCIPs" ? "white" : "black",
                  fontWeight: tabFilter === "allCIPs" ? "100" : "600", // conditional background color
                }}
              >
                CIP Management
              </span>
              {tabFilter === "allCIPs" && (
                <SelectedTabArrow
                  style={{
                    position: "absolute",
                    bottom: -13, // Adjusting the position to account for the arrow size
                    left: "53%",
                    transform: "translateX(-50%)",
                    width: 13,
                    height: 11,
                  }}
                />
              )}
            </div> */}

            {matches ? (
              <>
                {" "}
                {/* {(isOrgAdmin || isMR) && (
                  <div
                    onClick={configHandler}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px 10px 4px 10px",
                      cursor: "pointer",
                      borderRadius: "5px",
                      position: "relative",
                    }}
                  >
                    <MdOutlineSettings />
                    <span
                      className={`${classes.docNavText}`}
                      style={{
                        color: "black",
                        fontWeight: "600", // conditional background color
                      }}
                    >
                      Settings
                    </span>
                  </div>
                )} */}
                {/* )} */}
                <div style={{
                  marginLeft: "94%"
                }}>
                  <ModuleHeader
                    moduleName="CIP Control"
                    createHandler={createHandler}
                    configHandler={configHandler}
                  />
                </div>
              </>
            ) : (
              ""
            )}

            {matches ? (
              ""
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FilterIcon
                  style={{ width: "24px", height: "24px" }}
                  onClick={showModal}
                />

                <AntButton
                  onClick={() => {
                    setMyCip(!myCip);
                  }}
                  style={{
                    padding: "5px 2px",
                    backgroundColor: myCip ? "rgb(53, 118, 186)" : "#f5f5f5",
                    color: myCip ? "white" : "#444",
                    border: "1px solid #ccc",
                  }}
                  icon={<FaUserGroup />}
                ></AntButton>
              </div>
            )}
          </div>
        </div>
      </Box>

      <CIPTable
        drawer={drawer}
        setDrawer={setDrawer}
        toggleDrawer={toggleDrawer}
        filter={filter}
        setFilter={setFilter}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        isGraphSectionVisible={isGraphSectionVisible}
        tabFilter={tabFilter}
        //fetchCIPS={fetchCIPS}
        isTableDataLoading={isTableDataLoading}
        setIsTableDataLoading={setIsTableDataLoading}
        data={data}
        setData={setData}
        dataLength={dataLength}
        setDataLength={setDataLength}
        filterList={filterList}
        page={page}
        setPage={setPage}
        count={count}
        setCount={setCount}
        rowsPerPage={rowsPerPage}
        searchValues={searchValues}
        setSearch={setSearch}
        actionItemDrawer={actionItemDrawer}
        setActionItemDrawer={setActionItemDrawer}
        setMyCip={setMyCip}
        myCip={myCip}
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        // refForcip1={refForcip1}
        // refForcip2={refForcip2}
        // refForcip3={refForcip3}
        // refForcip4={refForcip4}
        // refForcip5={refForcip5}
        // refForcip6={refForcip6}
        // refForcip7={refForcip7}
        // refForcip8={refForcip8}
        // refForcip9={refForcip9}
      />
      {/* <div style={{ position: "fixed", top: "83px", right: "120px" }}>
        <Tooltip title="Help Tours!" color="blue">
          <TouchAppIcon
            style={{ cursor: "pointer" }}
            onClick={() => {
              setOpenTourForCip(true);
            }}
          />
        </Tooltip>
      </div> */}

      <Tour
        open={openTourForCip}
        onClose={() => setOpenTourForCip(false)}
        steps={stepsForCip}
      />
    </div>
  );
};

export default CIPControl;
