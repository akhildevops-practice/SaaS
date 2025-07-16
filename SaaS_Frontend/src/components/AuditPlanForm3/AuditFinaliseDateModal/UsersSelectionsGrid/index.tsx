import React, { useState, useEffect } from "react";
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
import { API_LINK } from "config";
import { Autocomplete } from "@material-ui/lab";
import { MdDelete } from 'react-icons/md';
import { MdAdd } from 'react-icons/md';
import { MdCheckCircleOutline, MdCheckCircle, MdCancel, MdOutlineCancel  } from "react-icons/md";
import { Button as AntdButton } from "antd";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import { getAllAuditors } from "apis/auditApi";
import { useStyles } from "./styles";
import getSessionStorage from "utils/getSessionStorage";
import { Modal } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { useSnackbar } from "notistack";

import { MdRefresh } from 'react-icons/md';

type Props = {
  usersSelectionGridRows: any;
  setUsersSelectionGridRows: any;

  unitHead: any;
  setUnitHead: any;
  imscoordinator: any;
  setImsCoordinator: any;
  otherUsers: any;
  setOtherUsers: any;

  planDetails: any;
  setUserAcceptFlag?: any;

  disableFieldsForOtherUsers?: any;
  auditPlanUnitWiseId?: any;
  plannedBy?: any;
  handleSubmitModal? : any;
  refForAuditPlanModelFA4?:any;
};

const UsersSelectionGrid = ({
  usersSelectionGridRows,
  setUsersSelectionGridRows,

  unitHead,
  setUnitHead,
  imscoordinator,
  setImsCoordinator,
  otherUsers,
  setOtherUsers,

  planDetails,
  setUserAcceptFlag,
  disableFieldsForOtherUsers = false,
  auditPlanUnitWiseId,
  plannedBy,
  handleSubmitModal,
  refForAuditPlanModelFA4,
}: Props) => {
  const classes = useStyles();
  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const [users, setUsers] = useState<any>([]);
  const realmName = getAppUrl();
  const [auditorsSuggestions, setAuditorsSuggestions] = useState<any[]>([]);
  const [unitHeadSuggestions, setUnitHeadSuggestions] = useState<any[]>([]);
  const [imscCoordinatorSuggestions, setImscCoordinatorSuggestions] = useState<
    any[]
  >([]);
  const [otherUsersSuggestions, setOtherUsersSuggestions] = useState<any[]>([]);

  const [rejectReasonModalOpen, setRejectReasonModalOpen] =
    useState<any>(false);

  const [reasonText, setReasonText] = useState<any>("");

  const [currentRowIndexForReject, setCurrentRowIndexForReject] =
    useState<any>(null);

  const [acceptInviteModalOpen, setAcceptInviteModalOpen] =
    useState<boolean>(false);
    const [currentRowIndexForAccept, setCurrentRowIndexForAccept] =
    useState<any>(null);

  const { enqueueSnackbar } = useSnackbar();
  const avatarUrl = userDetails.avatar
    ? `${API_LINK}/${userDetails.avatar}`
    : "";
  useEffect(() => {
    setUsersSelectionGridRows([unitHead, imscoordinator, ...otherUsers]);
  }, [unitHead, imscoordinator, otherUsers]);

  // useEffect(() => {
  //   console.log("checkaudit unitHead", unitHead);
  //   console.log("checkaudit imscoordinator", imscoordinator);
  //   console.log("checkaudit otherUsers", otherUsers);
  //   console.log("checkaudit usersSelectionGridRows", usersSelectionGridRows);
  // }, [unitHead, imscoordinator, otherUsers, usersSelectionGridRows]);

  console.log("unitHead",unitHead)
  useEffect(() => {
    console.log("checkaudit1 usersSelectionGridRows", usersSelectionGridRows);
    console.log("checkaudit1 unitHead", unitHead);
    console.log("checkaudit1 imscorrd", imscoordinator);
    console.log("checkaudit1 other user", otherUsers);
    console.log("checkaudit1 plandetails", planDetails);
  }, [unitHead, imscoordinator, otherUsers]);

  useEffect(() => {
    // console.log("checkaudit plandetails in user selection grid", planDetails);

    getSuggestions();
  }, []);

  const getAllUnitHeads = async () => {
    try {
      const result = await axios.get(
        `/api/location/locationadmin/${planDetails?.unitId}`
      );
      console.log("result unit heads", result);

      if (result?.data?.users?.length > 0) {
        return result?.data?.users;
      } else {
        return [];
      }
    } catch (error) {
      return error;
    }
  };

  const getAllImscCoordinators = async () => {
    try {
      const result = await axios.get(
        `/api/auditPlan/getAllMrsOfLocation/${planDetails?.unitId}`
      );
      return result;
    } catch (error) {
      return error;
    }
  };

  const getAllUsersByLocation = async () => {
    try {
      const result = await axios.get(
        `/api/auditPlan/getAllUsersOfLocation/${planDetails?.unitId}`
      );
      return result;
    } catch (error) {
      return error;
    }
  };

  const getSuggestions = async () => {
    try {
      getAllAuditors(realmName).then((response: any) => {
        console.log("get all auditors res", response.data);

        setAuditorsSuggestions(response?.data || []);
      });
      getAllUnitHeads().then((response: any) => {
        // console.log("get all unit heads res", response);

        setUnitHeadSuggestions(response || []);
      });
      getAllImscCoordinators().then((response: any) => {
        console.log("get all ims res", response.data);

        setImscCoordinatorSuggestions(response?.data || []);
      });
      getAllUsersByLocation().then((response: any) => {
        console.log("get all users res", response.data);

        setOtherUsersSuggestions(response?.data || []);
      });
    } catch (error) {
      console.log("error in fetching suggestions", error);
    }
  };

  const getFilteredSuggestions = (rowIndex: number) => {
    const selectedUserIds = usersSelectionGridRows.map(
      (row: any) => row.name.id
    );
    const suggestions =
      rowIndex === 0
        ? unitHeadSuggestions
        : rowIndex === 1
        ? imscCoordinatorSuggestions
        : otherUsersSuggestions;

    // return suggestions;
    if (suggestions?.length) {
      return suggestions.filter(
        (user: any) => !selectedUserIds.includes(user.id)
      );
    } else return [];
  };

  const handleAddRow = () => {
    const newRow = {
      name: { id: "", username: "", email: "", avatar: "" },
      location: "",
      role: "",
      accepted: "WAITING",
    };
    setOtherUsers((prevUsers: any) => [...prevUsers, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    if (index <= 1) return; // Prevent deletion of the first two rows

    setOtherUsers((prevUsers: any) =>
      prevUsers.filter((_: any, i: any) => i !== index - 2)
    );
  };

  const handleAccept = (index: number) => {
    const updatedRows = [...usersSelectionGridRows];
    updatedRows[index].accepted = "ACCEPTED";
    setUsersSelectionGridRows(updatedRows);
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
        console.log(
          "checkaudit0 data befor update--->",
          usersSelectionGridRows
        );

        const updatedRows = [...usersSelectionGridRows];
        updatedRows[currentRowIndexForReject].accepted = "REJECTED";
        console.log("checkaudit0 updatedRows ----<", updatedRows);

        setUsersSelectionGridRows(updatedRows);
        setUserAcceptFlag((prev: any) => [
          ...prev,
          updatedRows[currentRowIndexForReject],
        ]);
        setRejectReasonModalOpen(false);
        handleSubmitModal(false, false, false, true);
        enqueueSnackbar(`Date Rejected Successfully!`, {
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

  const handleResetStatus = (index: any) => {
    const updatedRows = [...usersSelectionGridRows];
    updatedRows[index].accepted = "WAITING";
    setUsersSelectionGridRows(updatedRows);
  };

  const handleAcceptClick = (rowIndex:any) => {
    setCurrentRowIndexForAccept(rowIndex)
    setAcceptInviteModalOpen(true)
  }

  const handleAcceptInvite = () => {
    const updatedRows = [...usersSelectionGridRows];
    updatedRows[currentRowIndexForAccept].accepted = "ACCEPTED";
    setUsersSelectionGridRows(updatedRows);
    setUserAcceptFlag((prev: any) => [...prev, updatedRows[currentRowIndexForAccept]]);
    setAcceptInviteModalOpen(false)
    handleSubmitModal(false, false, false, true)
  }

  return (
    <div className={classes.root}>
      <div className={classes.labelContainer}>
        <div className={classes.tableLabel}>Coordinators</div>
        <Button
          className={classes.buttonColor}
          variant="contained"
          startIcon={<MdAdd />}
          onClick={handleAddRow}
          disabled={disableFieldsForOtherUsers}
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
                <TableCell>Role</TableCell>
                <TableCell>Accepted/Rejected</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersSelectionGridRows.map((row: any, rowIndex: any) => (
                <>
                  <TableRow key={rowIndex}>
                    <TableCell
                      style={{
                        width: "250px",
                      }}
                    >
                      <Autocomplete
                        options={getFilteredSuggestions(rowIndex)}
                        getOptionLabel={(option) => {
                          return (
                            option?.firstname + " " + option?.lastname || ""
                          );
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
                          const updatedValue = newValue || {
                            id: "",
                            username: "",
                            email: "",
                            avatar: "",
                          };

                          // console.log("checkaudit1 newValue--->", newValue);

                          const updatedRows = [...usersSelectionGridRows];

                          updatedRows[rowIndex] = {
                            name: updatedValue,
                            location:
                              updatedValue?.location?.locationName || "",
                            role:
                              rowIndex === 0
                                ? "Head"
                                : rowIndex === 1
                                ? "IMSC"
                                : updatedValue?.roleId?.join(", ") || "No Role",
                            accepted: "WAITING",
                          };

                          if (rowIndex === 0) {
                            setUnitHead({
                              ...updatedRows[rowIndex],
                            });
                          } else if (rowIndex === 1) {
                            setImsCoordinator({
                              ...updatedRows[rowIndex],
                            });
                          } else {
                            const updatedOtherUsers = [...otherUsers];
                            updatedOtherUsers[rowIndex - 2] = {
                              ...updatedRows[rowIndex],
                            };
                            setOtherUsers(updatedOtherUsers);
                          }

                          setUsersSelectionGridRows(updatedRows);
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
                      {row.role}
                    </TableCell>
                    <TableCell className={classes.smallColumn}>
                      {row.accepted === "WAITING" ? (
                        <div ref={refForAuditPlanModelFA4}>
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
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          ref={refForAuditPlanModelFA4}
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
                      {rowIndex > 1 && (
                        <IconButton
                          onClick={() => handleDeleteRow(rowIndex)}
                          color="primary"
                          disabled={disableFieldsForOtherUsers}
                        >
                          <MdDelete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                </>
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
                handleAcceptInvite()
                // setAcceptInviteModalOpen(false);
              }}
            >
              Yes
            </AntdButton>,
          ]}
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
          // maskClosable={false}
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
      </Paper>
    </div>
  );
};

export default UsersSelectionGrid;
