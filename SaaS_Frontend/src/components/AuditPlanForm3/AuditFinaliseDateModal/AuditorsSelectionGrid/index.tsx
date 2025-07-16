import { useState, useEffect } from "react";
import {
  Paper,
  TableRow,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  Tooltip,
  MenuItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TextField,
  IconButton,
  TableHead,
  Button,
  TextareaAutosize,
} from "@material-ui/core/";
import type { PaginationProps } from "antd";
import {
  Table as AntdTable,
  Button as AntdButton,
  Checkbox,
  Select,
  Modal,
  Pagination,
} from "antd";
import { Autocomplete } from "@material-ui/lab";
import { MdDelete } from 'react-icons/md';
import { MdAdd, MdCheckCircleOutline, MdCheckCircle, MdOutlineCancel, MdCancel } from 'react-icons/md';
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import { useStyles } from "./styles";
import getSessionStorage from "utils/getSessionStorage";
import { MdStarOutline } from 'react-icons/md';
import { MdStar } from 'react-icons/md';
import { useSnackbar } from "notistack";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { MdRefresh } from 'react-icons/md';

type Props = {
  auditorsRows: any;
  setAuditorsRows: any;
  auditPlanData?: any;
  setUserAcceptFlag?: any;
  disableFieldsForOtherUsers?: any;
  teamLeadId?: any;
  setTeamLeadId?: any;
  planDetails?: any;
  auditPlanUnitWiseId?: any;
  plannedBy?: any;
  handleSubmitModal?: any;
  refForAuditPlanModelFA5?: any;
  refForAuditPlanModelFA6?: any;
  refForAuditPlanModelFA7?: any;
};

const AuditorsSelectionGrid = ({
  auditorsRows,
  setAuditorsRows,
  auditPlanData,
  setUserAcceptFlag,
  disableFieldsForOtherUsers = false,
  teamLeadId = null,
  setTeamLeadId,
  planDetails,
  auditPlanUnitWiseId,
  plannedBy,
  handleSubmitModal,
  refForAuditPlanModelFA5,
  refForAuditPlanModelFA6,
  refForAuditPlanModelFA7,
}: Props) => {
  const classes = useStyles();
  const userDetails = getSessionStorage();
  const { enqueueSnackbar } = useSnackbar();
  const realmName = getAppUrl();
  const [auditorsSuggestions, setAuditorsSuggestions] = useState<any[]>([]);
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  // State for the new filters
  const [useSearchFilters, setUseSearchFilters] = useState<boolean>(false);
  const [selectedSystems, setSelectedSystems] = useState<any>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<any>([]);
  const [selectedProficiencies, setSelectedProficiencies] = useState<any>([]);

  const [proficiencyOptions, setProficiencyOptions] = useState<any>([]);
  const [systemOptions, setSystemOptions] = useState<any>([]);
  const [functionOptions, setFunctionOptions] = useState<any>([]);

  const [auditorsResultModal, setAuditorsResultModal] = useState<any>({
    open: false,
  });
  const [
    selectedAuditorsBasedOnSearchResult,
    setSelectedAuditorsBasedOnSearchResult,
  ] = useState<any>([]);

  const [auditorsListBasedOnSearchResult, setAuditorsListBasedOnSearchResult] =
    useState<any>([]);

  const [rejectReasonModalOpen, setRejectReasonModalOpen] =
    useState<any>(false);

  const [reasonText, setReasonText] = useState<any>("");

  const [currentRowIndexForReject, setCurrentRowIndexForReject] =
    useState<any>(null);

  const [acceptInviteModalOpen, setAcceptInviteModalOpen] =
    useState<boolean>(false);
  const [currentRowIndexForAccept, setCurrentRowIndexForAccept] =
    useState<any>(null);

  // const [currentPage, setCurrentPage] = useState<any>(1);
  // const [pageSize, setPageSize] = useState<any>(10);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    getSuggestions();
    getAllFunctionOptions();
    getAllProficiencyOptions();
    getAllSystemOptions();
    // getAuditorsBasedOnSearchFilters();
  }, []);

  useEffect(() => {
    console.log("checkaudit11 auditorsRows", auditorsRows);
    // console.log("checkaudit auditPlanData", auditPlanData);
  }, [auditorsRows]);

  useEffect(() => {
    console.log(
      "checkaudit auditPlanData in audit selection grid-->",
      auditPlanData
    );
  }, [auditPlanData]);

  ///api/auditPlan/getAuditorsBasedOnSearchFilters

  useEffect(() => {
    if (useSearchFilters) {
      console.log(
        "checkaudit11 selectedAuditorsBasedOnSearchResult",
        selectedAuditorsBasedOnSearchResult
      );
      if (selectedAuditorsBasedOnSearchResult?.length) {
        console.log("checkaudit11 inside if");

        setAuditorsRows([...selectedAuditorsBasedOnSearchResult]);
      } else {
        console.log("checkaudit11 inside else");

        setAuditorsRows([]);
      }
    }
    // console.log("checkaudit auditPlanData", auditPlanData);
  }, [selectedAuditorsBasedOnSearchResult?.length]);

  // useEffect(() => {
  //   console.log("checkaudit useEffect[] selectedSystems", selectedSystems);
  //   console.log("checkaudit useEffect[] selectedFunctions", selectedFunctions);
  //   console.log(
  //     "checkaudit useEffect[] selectedProficiencies",
  //     selectedProficiencies
  //   );
  // }, [selectedSystems, selectedFunctions, selectedProficiencies]);

  //api function to get all auditors based on search filters
  const getAuditorsBasedOnSearchFilters = async (
    currentPage: any = 1,
    pageSize: any = 10
  ) => {
    try {
      // console.log(
      //   "checkaudit payload query in getAuditorsBasedOnSearchFilters auditType, locationId, ",
      //   auditPlanData?.auditType,
      //   auditPlanData?.unitId
      // );
      //if scope is Department, then just take entityId from planDetails
      let query: any = {
        auditTypeId: auditPlanData?.auditType,
        locationId: auditPlanData?.unitId,
        orgId: userDetails?.organizationId,
        systemIds: encodeURIComponent(JSON.stringify(selectedSystems)),
        functionIds: encodeURIComponent(JSON.stringify(selectedFunctions)),
        proficiencyIds: encodeURIComponent(
          JSON.stringify(selectedProficiencies)
        ),
      };
      let queryString = "";
      queryString = `?auditTypeId=${query.auditTypeId}&locationId=${query.locationId}&orgId=${query.orgId}&systemIds=${query.systemIds}&functionIds=${query.functionIds}&proficiencyIds=${query.proficiencyIds}&page=${currentPage}&pageSize=${pageSize}`;
      if (
        !!planDetails?.entityId &&
        auditPlanData?.scope?.name === "Department"
      ) {
        query = {
          ...query,
          entityId: planDetails?.entityId,
        };
        queryString = queryString + `&entityId=${planDetails?.entityId}`;
      }
      // console.log(`checkaudit query`, query);

      const res = await axios.get(
        `/api/auditPlan/getAuditorsBasedOnSearchFilters${queryString}`
      );
      // console.log("checkaudit res getAuditorsBasedOnSearchFilters", res);
      if (res?.status === 200) {
        if (res?.data?.data.length) {
          setAuditorsListBasedOnSearchResult(res?.data?.data);
          // setSelectedAuditorsBasedOnSearchResult(
          //   res?.data?.map((item: any) => ({
          //     name: { id: item?.id, ...item },
          //     location: item?.locationId,
          //     role: "AUDITOR",
          //     accepted: "WAITING",
          //   }))
          // );
          setPagination((prev) => ({ ...prev, total: res.data.total }));
        } else {
          setAuditorsListBasedOnSearchResult([]);
          setPagination((prev) => ({ ...prev, total: 0 }));

          // setSelectedAuditorsBasedOnSearchResult([]);
        }
      } else {
        // setSelectedAuditorsBasedOnSearchResult([]);
        setAuditorsListBasedOnSearchResult([]);
        setPagination((prev) => ({ ...prev, total: 0 }));

        enqueueSnackbar(
          `Error While Fetching Auditors Based On Search Filters`,
          {
            variant: "error",
            autoHideDuration: 2500,
          }
        );
      }
    } catch (error) {
      console.log("checkaudit error in getAuditorsBasedOnSearchFilters", error);
      enqueueSnackbar(`Error While Fetching Auditors Based On Search Filters`, {
        variant: "error",
        autoHideDuration: 2500,
      });
    }
  };

  //api function to get all functional proficiency by orgid
  const getAllProficiencyOptions = async () => {
    try {
      const res = await axios?.get(`/api/audit-settings/getAllProficiency`);
      if (res?.status === 200) {
        if (res?.data?.data?.length) {
          setProficiencyOptions(
            res?.data?.data.map((item: any) => {
              return {
                proficiency: item?.proficiency,
                id: item?.id,
                label: item?.proficiency,
                value: item?.proficiency,
              };
            })
          );
        } else {
          setProficiencyOptions([]);
          enqueueSnackbar(
            `No Function Found for this Organization, Please Add in Masters`,
            {
              variant: "warning",
              autoHideDuration: 2500,
            }
          );
        }
      }
      // setIsLoading(false);
    } catch (err) {
      enqueueSnackbar(`Error While Loading Proficiency Options`, {
        variant: "error",
      });
      // setIsLoading(false);
    }
  };

  //api function to get all functions by orgId
  const getAllFunctionOptions = async () => {
    // setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/business/getAllFunctionsByOrgId/${userDetails?.organizationId}`
      );

      if (res.status === 200) {
        if (res?.data?.length) {
          setFunctionOptions(
            res?.data?.map((item: any) => ({
              ...item,
              label: item?.name,
              value: item?.id,
            }))
          );
        } else {
          setFunctionOptions([]);
          enqueueSnackbar(
            `No Function Found for this Organization, Please Add in Masters`,
            {
              variant: "warning",
              autoHideDuration: 2500,
            }
          );
        }
      }
      // setIsLoading(false);
    } catch (err) {
      enqueueSnackbar(`Error while loading Function Options!`, {
        variant: "error",
        autoHideDuration: 2500,
      });
      // setIsLoading(false);
    }
  };

  //api function to get all system by orgId
  const getAllSystemOptions = async () => {
    try {
      const res = await axios.get(`/api/audit-settings/getSystemOptions`);
      if (res.status === 200) {
        if (res?.data?.length) {
          setSystemOptions(
            res?.data?.map((item: any) => ({
              ...item,
              label: item?.name,
              value: item?.id,
            }))
          );
        } else {
          setSystemOptions([]);
          enqueueSnackbar(
            `No Systems Found for this Organization, Please Add in Masters`,
            {
              variant: "warning",
              autoHideDuration: 2500,
            }
          );
        }
      }
    } catch (err) {}
  };

  const handleSetTeamLead = (id: string) => {
    setTeamLeadId(id);
  };

  const getSuggestions = async () => {
    try {

      console.log("auditPlanData new",auditPlanData)
      const systemsQueryString = auditPlanData?.systemName
        .map((systemId: any) => {
          if (typeof systemId === "object" && systemId !== null) {
            return `system[]=${systemId._id}`;
          } else {
            return `system[]=${systemId}`;
          }
        })
        .join("&");
      // });

      const res = await axios.get(
        `/api/auditSchedule/getAuditors?auditType=${auditPlanData?.auditType}&location=${auditPlanData?.unitId}&${systemsQueryString}`
      );

      setAuditorsSuggestions(res.data);
    } catch (error) {
      console.log("error in fetching suggestions", error);
    }
  };

  const handleAddRow = () => {
    setAuditorsRows((prevRows: any) => [
      ...prevRows,
      {
        name: { id: "", username: "", email: "", avatar: "" },
        location: "",
        role: "AUDITOR",
        accepted: "WAITING",
      },
    ]);
  };

  const handleDeleteRow = (index: number) => {
    setAuditorsRows((prevRows: any) =>
      prevRows.filter((_: any, i: any) => i !== index)
    );
  };

  const handleAccept = (index: number) => {
    const updatedRows = [...auditorsRows];
    updatedRows[index].accepted = "ACCEPTED";
    setAuditorsRows(updatedRows);
    setUserAcceptFlag((prev: any) => [...prev, updatedRows[index]]);
  };

  const postComment = async (newComment: any) => {
    console.log(
      "checkaudit0 newComment and rowIndex in postComment",
      newComment,
      currentRowIndexForReject
    );

    try {
      if (!auditPlanUnitWiseId) return;
      const res = await axios.post(
        `/api/auditPlan/addcomment/${auditPlanUnitWiseId}`,
        newComment
      );
      if (res?.status === 201 || res?.status === 200) {
        setReasonText(""); // clear the input field
        console.log("checkaudit0 data befor update--->", auditorsRows);

        const updatedRows = [...auditorsRows];
        updatedRows[currentRowIndexForReject].accepted = "REJECTED";
        console.log("checkaudit0 updatedRows ----<", updatedRows);

        setAuditorsRows(updatedRows);
        setUserAcceptFlag((prev: any) => [
          ...prev,
          updatedRows[currentRowIndexForReject],
        ]);
        setRejectReasonModalOpen(false);
        handleSubmitModal(false, false, false, true);
        enqueueSnackbar(`Date Rejected Successfully !`, {
          variant: "success",
          autoHideDuration: 3000,
        });
      } else {
        enqueueSnackbar(`Error in Adding Reason`, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
      // console.log(res);
    } catch (error) {
      enqueueSnackbar(`Error in Adding Reason`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      console.log(error);
    }
  };

  const handleReject = () => {
    if (!reasonText) return; // if comment text is empty, do nothing
    const newComment = {
      createdBy: userDetails.firstName + " " + userDetails.lastName,
      commentString: "Reason For Reject: " + reasonText,
      avatar: userDetails?.avatar || null,
    };
    postComment(newComment);
  };

  const handleTextFieldKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleReject();
    }
  };

  const handleRejectClick = (rowIndex: any) => {
    console.log("checkaudit0 rowIndex in handleRejectClick-->", rowIndex);
    setCurrentRowIndexForReject(rowIndex);
    setRejectReasonModalOpen(true);
  };

  const getFilteredSuggestions = () => {
    const selectedUserIds = auditorsRows?.map((row: any) => row?.name?.id);
    if (auditorsSuggestions?.length) {
      return auditorsSuggestions.filter(
        (user: any) => !selectedUserIds.includes(user?.id)
      );
    } else return [];
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "firstname",
      key: "firstname",
      // width : 400,
      render: (text: any, record: any) => (
        <div style={{ display: "flex", whiteSpace: "nowrap" }}>
          {record?.firstname
            ? record?.firstname + " " + record?.lastname
            : "N/A"}
        </div>
      ),
    },
    // {
    //   title: "Email",
    //   dataIndex: "email",
    //   key: "email",
    // },
    {
      title: "Unit",
      dataIndex: "location",
      key: "locationName",
      render: (text: any, record: any) =>
        record?.location ? record?.location?.locationName : "N/A",
    },
    {
      title: "Department",
      dataIndex: "location",
      key: "locationName",
      render: (text: any, record: any) =>
        record?.entity ? record?.entity?.entityName : "N/A",
    },
    {
      title: "System Expertise",
      dataIndex: "systemExpertise",
      key: "systemExpertise",
      render: (text: any, record: any) =>
        record?.systemExpertise?.length
          ? record?.systemExpertise?.map((item: any) => item?.name).join(", ")
          : "N/A",
    },
    {
      title: "Lead In",
      dataIndex: "inLead",
      key: "inLead",
      render: (text: any, record: any) =>
        record?.inLead?.length ? record?.inLead?.join(" ") : "N/A",
    },
    {
      title: "Functional Proficiencies",
      dataIndex: "functionproficiencies",
      key: "functionproficiencies",
      render: (text: any, record: any) =>
        record?.functionproficiencies?.length
          ? record?.functionproficiencies?.join(", ")
          : "N/A",
    },
    {
      title: "Proficiencies",
      dataIndex: "proficiencies",
      key: "proficiencies",
      render: (text: any, record: any) =>
        record?.proficiencies?.length
          ? record?.proficiencies?.join(", ")
          : "N/A",
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      console.log("checkaudit selectedRows ===-->", selectedRows);
      //make the selected row format so to display in finalised modal auditors table

      setSelectedAuditorsBasedOnSearchResult(
        selectedRows?.map((item: any) => ({
          name: { id: item?.id, ...item },
          location: item?.location?.locationName,
          role: "AUDITOR",
          accepted: "WAITING",
        }))
      );
    },
  };

  const handleResetStatus = (index: any) => {
    const updatedRows = [...auditorsRows];
    updatedRows[index].accepted = "WAITING";
    setAuditorsRows(updatedRows);
  };

  const handleChangePageNew = (page: number, pageSize: number) => {
    // console.log("checkrisk page", page, pageSize);
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    getAuditorsBasedOnSearchFilters(page, pageSize);
  };

  const handleAcceptClick = (rowIndex: any) => {
    setCurrentRowIndexForAccept(rowIndex);
    setAcceptInviteModalOpen(true);
  };

  const handleAcceptInvite = () => {
    const updatedRows = [...auditorsRows];
    updatedRows[currentRowIndexForAccept].accepted = "ACCEPTED";
    setAuditorsRows(updatedRows);
    setUserAcceptFlag((prev: any) => [
      ...prev,
      updatedRows[currentRowIndexForAccept],
    ]);
    setAcceptInviteModalOpen(false);
    handleSubmitModal(false, false, false, true);
  };

  return (
    <div className={classes.root}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <div ref={refForAuditPlanModelFA5}>
          <Checkbox onChange={(e) => setUseSearchFilters(e.target.checked)}>
            Use Search Filters
          </Checkbox>
        </div>

        {useSearchFilters && (
          <>
            <div>
              <div>System: </div>
              <Select
                mode="multiple"
                allowClear
                style={{ width: "200px" }}
                placeholder="Select System"
                onChange={(value) => setSelectedSystems(value)}
                options={systemOptions}
              />
            </div>
            <div>
              <div>Function: </div>
              <Select
                mode="multiple"
                allowClear
                style={{ width: "200px" }}
                placeholder="Select Function"
                onChange={(value) => setSelectedFunctions(value)}
                options={functionOptions}
              />
            </div>
            <div>
              <div>Proficiency: </div>
              <Select
                mode="multiple"
                allowClear
                style={{ width: "200px" }}
                placeholder="Select Proficiency"
                onChange={(value) => setSelectedProficiencies(value)}
                options={proficiencyOptions}
              />
            </div>
            <AntdButton
              type="primary"
              onClick={() => {
                /* Add your search logic here */
                getAuditorsBasedOnSearchFilters(
                  pagination?.current || 1,
                  pagination?.pageSize || 10
                );
                setAuditorsResultModal({ open: true });
              }}
            >
              Search
            </AntdButton>
          </>
        )}
      </div>
      <div className={classes.labelContainer}>
        <div className={classes.tableLabel}>Auditors</div>
        <Button
          className={classes.buttonColor}
          variant="contained"
          startIcon={<MdAdd />}
          onClick={handleAddRow}
          disabled={disableFieldsForOtherUsers}
          ref={refForAuditPlanModelFA6}
        >
          Add
        </Button>
      </div>
      <Paper className={classes.paper}>
        <TableContainer>
          <Table className={classes.table}>
            <TableHead className={classes.tableHeader}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Team Lead</TableCell> {/* Add this */}
                <TableCell>Role</TableCell>
                <TableCell>Accepted/Rejected</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditorsRows.map((row: any, rowIndex: any) => (
                <TableRow key={rowIndex}>
                  <TableCell
                    style={{
                      width: "250px",
                    }}
                  >
                    <Autocomplete
                      options={
                        useSearchFilters
                          ? getFilteredSuggestions()
                          : getFilteredSuggestions()
                      }
                      getOptionLabel={(option) => {
                        // console.log("checkaudit1 option in auditor autocomplete", option);

                        return option?.firstname + " " + option?.lastname || "";
                      }}
                      renderOption={(option) => (
                        <MenuItem key={option?.id}>
                          <ListItemAvatar>
                            <Avatar src={option?.avatar} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              option?.firstname + " " + option?.lastname || ""
                            }
                            secondary={option?.email}
                          />
                        </MenuItem>
                      )}
                      onChange={(event, newValue) => {
                        const updatedRows = [...auditorsRows];
                        updatedRows[rowIndex].name = newValue || {
                          id: "",
                          username: "",
                          email: "",
                          avatar: "",
                        };
                        updatedRows[rowIndex].location =
                          newValue?.location?.locationName || "";
                        setAuditorsRows(updatedRows);
                        updatedRows[rowIndex].role = "AUDITOR";
                      }}
                      value={row.name.id ? row.name : null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Name"
                        />
                      )}
                      disabled={disableFieldsForOtherUsers}
                    />
                  </TableCell>
                  <TableCell
                    style={{
                      width: "150px",
                    }}
                  >
                    {row.location}
                  </TableCell>
                  <TableCell className={classes.smallColumn}>
                    <IconButton
                      onClick={() => handleSetTeamLead(row.name.id)}
                      disabled={disableFieldsForOtherUsers}
                    >
                      <div ref={refForAuditPlanModelFA7}>
                        {teamLeadId === row?.name?.id ? (
                          <MdStar color="primary" />
                        ) : (
                          <MdStarOutline />
                        )}
                      </div>
                    </IconButton>
                  </TableCell>
                  <TableCell className={classes.smallColumn}>
                    {row.role}
                  </TableCell>
                  <TableCell className={classes.smallColumn}>
                    {row.accepted === "WAITING" ? (
                      <>
                        <Tooltip title="Accept" color="blue">
                          <IconButton
                            color="primary"
                            onClick={() => handleAcceptClick(rowIndex)}
                            disabled={userDetails.id !== row.name.id} // <-- Add this condition
                          >
                            <MdCheckCircleOutline />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject" color="blue">
                          <IconButton
                            color="primary"
                            onClick={() => handleRejectClick(rowIndex)}
                            disabled={userDetails.id !== row.name.id} // <-- Add this condition
                          >
                            <MdOutlineCancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {row.accepted === "ACCEPTED" ? (
                          <IconButton
                            color="primary"
                            // onClick={}
                            disabled={true} // <-- Add this condition
                          >
                            <MdCheckCircle color="primary" />
                          </IconButton>
                        ) : (
                          <IconButton
                            color="primary"
                            // onClick={}
                            disabled={true} // <-- Add this condition
                          >
                            <MdCancel color="primary" />
                          </IconButton>
                        )}
                        {userDetails?.id === plannedBy && (
                          <Tooltip title="Reset" color="blue">
                            <IconButton
                              color="primary"
                              onClick={() => handleResetStatus(rowIndex)}
                              disabled={disableFieldsForOtherUsers}
                              className={classes.iconButton} // Add this custom class
                            >
                              <MdRefresh />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className={classes.actionColumn}>
                    {/* {rowIndex !== 0 && ( */}
                    <IconButton
                      onClick={() => handleDeleteRow(rowIndex)}
                      color="primary"
                      disabled={disableFieldsForOtherUsers}
                    >
                      <MdDelete />
                    </IconButton>
                    {/* )} */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Modal
          title="Confirm Acceptance?"
          centered
          open={acceptInviteModalOpen}
          onCancel={() => {
            setAcceptInviteModalOpen(false);
          }}
          width={800}
          footer={[
            <AntdButton
              key="cancel"
              onClick={() => {
                setAcceptInviteModalOpen(false);
              }}
            >
              No
            </AntdButton>,
            <AntdButton
              key="ok"
              type="default"
              onClick={() => {
                handleAcceptInvite();
                // setAcceptInviteModalOpen(false);
              }}
            >
              Yes
            </AntdButton>,
          ]}
          maskClosable={false}
        >
          Are You Sure to Accept the Invite for this Finalised Date ?
        </Modal>
        <Modal
          title="Enter Reason For Reject"
          centered
          open={rejectReasonModalOpen}
          onCancel={() => setRejectReasonModalOpen(false)}
          onOk={() => setRejectReasonModalOpen(false)}
          width={"55%"}
          footer={null}
          maskClosable={false}
          // className={classes.modalContent}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{
                width: "36px",
                height: "38px",
                cursor: "pointer",
              }}
            />
          }
        >
          <div className={classes.inputBox}>
            <TextareaAutosize
              className={classes.input}
              minRows={4}
              placeholder="Add a comment"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              onKeyDown={(e: any) => handleTextFieldKeyDown(e)}
            />
            <AntdButton type="primary" onClick={() => handleReject()}>
              Reject
            </AntdButton>
          </div>
        </Modal>
        <Modal
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Auditor Filter Results
            </div>
          }
          centered
          open={auditorsResultModal.open}
          onCancel={() => setAuditorsResultModal({ open: false })}
          onOk={() => setAuditorsResultModal({ open: false })}
          width={"55%"}
          footer={null}
          maskClosable={false}
          // className={classes.modalContent}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{ width: "36px", height: "38px", cursor: "pointer" }}
            />
          }
        >
          <div className={classes.auditorsResultTableContainer}>
            <AntdTable
              rowSelection={{
                type: "checkbox",
                ...rowSelection,
              }}
              columns={columns}
              dataSource={auditorsListBasedOnSearchResult}
              pagination={false}
              size="middle"
              rowKey={"id"}
            />
          </div>
          <div className={classes.pagination}>
            <Pagination
              size="small"
              current={pagination?.current}
              pageSize={pagination?.pageSize}
              total={pagination?.total}
              showTotal={showTotal}
              showSizeChanger
              showQuickJumper
              onChange={(page, pageSize) => {
                handleChangePageNew(page, pageSize);
              }}
            />
          </div>
        </Modal>
      </Paper>
    </div>
  );
};

export default AuditorsSelectionGrid;
