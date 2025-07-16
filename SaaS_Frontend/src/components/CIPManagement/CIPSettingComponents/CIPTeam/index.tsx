import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Paper,
  TableRow,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  InputBase,
} from "@material-ui/core";
import useStyles from "./style";
import { MdCheckCircle } from "react-icons/md";
import axios from "apis/axios.global";
import checkRoles from "utils/checkRoles";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { Divider, message, Pagination, PaginationProps } from "antd";
import { useSnackbar } from "notistack";
import ConfirmDialog from "components/ConfirmDialog";
import formatQuery from "utils/formatQuery";

interface CIPTeams {
  _id: number;
  //teamNo: string;
  teamName: string;
  location: string;
  locationName: string;
  isSubmitted: boolean;
  isEdit: boolean;
  isFirstSubmit: boolean;
}

const CIPTeams: React.FC = () => {
  const [cipTeams, setCIPTeams] = useState<CIPTeams[]>([]);
  const classes = useStyles();
  const isMR = checkRoles("MR");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<any>();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>(0);

  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  useEffect(() => {
    const url = formatQuery(
      `/api/cip/getAllCIPTeams`,
      {
        page: page,
        limit: rowsPerPage,
      },
      ["page", "limit"]
    );
    getAllCIPS(url);
  }, []);

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteCategory(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddCIP = async () => {
    const newCIP: CIPTeams = {
      _id: cipTeams.length + 1,
      //teamNo: "",
      teamName: "",
      location: "",
      locationName: "",
      isSubmitted: true,
      isEdit: false,
      isFirstSubmit: true,
    };
    setCIPTeams([newCIP, ...cipTeams]);
  };

  const handlecipTypeSubmit = async (
    cipTeamName: string
    //cipTeamNumber: string
  ) => {
    try {
      if (!cipTeamName.trim()) {
        enqueueSnackbar("Enter all the details", { variant: "error" });
        return;
      }
      const CIPType = {
        teamName: cipTeamName.trim(),
        //teamNo: cipTeamNumber.trim(),
      };
      const response = await axios.post(`/api/cip/createCIPTeam`, CIPType);
      setPage(1);
      setRowsPerPage(10);
      setCIPTeams(response?.data?.response?.data);
      setCount(response?.data?.response?.total);
      enqueueSnackbar(response?.data?.message, {
        variant: "success",
      });
    } catch (error: any) {
      if (!error.response) {
        message.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        message.error(data.message);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const getAllCIPS = async (url: any) => {
    try {
      const response = await axios.get(url);
      const CipResponse = response.data.data;
      setCount(response?.data?.total);
      setCIPTeams(CipResponse);
    } catch (error: any) {
      message.error(error);
    }
  };

  const handleEditCIPType = async (
    id: any,
    cipTeamName: string
    //cipTeamNumber: string
  ) => {
    try {
      if (!cipTeamName.trim()) {
        enqueueSnackbar("Enter all the details", { variant: "error" });
        return;
      }
      const CIPType = {
        teamName: cipTeamName.trim(),
        //teamNo: cipTeamNumber.trim(),
      };
      const response = await axios.put(`/api/cip/updateCIPTeam/${id}`, CIPType);
      setPage(1);
      setRowsPerPage(10);
      setCIPTeams(response?.data?.response?.data);
      setCount(response?.data?.response?.total);
      enqueueSnackbar(response?.data?.message, {
        variant: "success",
      });
    } catch (error: any) {
      if (!error.response) {
        message.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        message.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const handleDeleteCIPType = async () => {
    try {
      const response = await axios.delete(
        `/api/cip/deleteCIPTeam/${deleteCategory._id}`
      );
      setPage(1);
      setRowsPerPage(10);
      setCIPTeams(response?.data?.response?.data);
      setCount(response?.data?.response?.total);
      enqueueSnackbar(response?.data?.message, {
        variant: "success",
      });
      handleClose();
    } catch (error: any) {
      if (!error.response) {
        message.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        message.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };
  // const handlecipTeamNumberChange = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   cipTypeId: number
  // ) => {
  //   const updatedcipTypes = cipTeams.map((type) => {
  //     if (type._id === cipTypeId) {
  //       return {
  //         ...type,
  //         teamNo: event.target.value,
  //       };
  //     }
  //     return type;
  //   });
  //   setCIPTeams(updatedcipTypes);
  // };

  const handlecipTeamNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    cipTypeId: any
  ) => {
    const updatedcipTypes = cipTeams.map((type) => {
      if (type._id === cipTypeId) {
        return {
          ...type,
          teamName: event.target.value,
        };
      }
      return type;
    });
    setCIPTeams(updatedcipTypes);
  };

  const handleChangeCIPIcon = async (cipTypeId: number) => {
    const updatedcipTypes = cipTeams.map((type) => {
      if (type._id === cipTypeId) {
        return {
          ...type,
          isEdit: false,
          isSubmitted: true,
        };
      }
      return type;
    });
    setCIPTeams(updatedcipTypes);
  };

  const handleChangePageNew = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
    const url = formatQuery(
      `/api/cip/getAllCIPTeams`,
      {
        page: page,
        limit: pageSize,
      },
      ["page", "limit"]
    );
    getAllCIPS(url);
  };

  return (
    <>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDeleteCIPType}
      />

      <div className={classes.root}>
        {
          <div className={classes.labelContainer}>
            <div className={classes.tableLabel}>
              {(isMR || isOrgAdmin) && (
                <Button
                  className={classes.buttonColor}
                  variant="contained"
                  style={{ backgroundColor: "#003059", color: "white" }}
                  // startIcon={<AddIcon />}
                  onClick={handleAddCIP}
                  disabled={cipTeams.some(
                    (type) =>
                      (type.isEdit && type.isSubmitted) || type.isSubmitted
                  )}
                >
                  Create
                </Button>
              )}
            </div>
          </div>
        }

        <Paper className={classes.paper}>
          <TableContainer>
            <Table className={classes.table}>
              <TableHead className={classes.tableHeader}>
                <TableRow>
                  {/* <TableCell style={{ width: "30%", paddingLeft: "30px" }}>
                    Team Number
                  </TableCell> */}
                  <TableCell style={{ width: "30%", paddingLeft: "30px" }}>
                    Team Name
                  </TableCell>
                  <TableCell style={{ width: "30%", paddingLeft: "30px" }}>
                    Unit
                  </TableCell>
                  <TableCell style={{ width: "10%" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cipTeams.map((type) => (
                  <TableRow key={type._id}>
                    {/* <TableCell>
                      <InputBase
                        placeholder="Team Number"
                        id="standard-basic"
                        fullWidth
                        style={{
                          width: "50%",
                          paddingTop: "4px",
                          paddingBottom: "4px",
                          paddingLeft: "10px",
                          borderRadius: "30px",
                          backgroundColor: "white",
                          color: "black",
                        }}
                        inputProps={{ "aria-label": "naked" }}
                        value={type.teamNo}
                        disabled={
                          !type.isSubmitted || (type.isSubmitted && type.isEdit)
                        }
                        onChange={(e: any) =>
                          handlecipTeamNumberChange(e, type._id)
                        }
                      />
                    </TableCell> */}
                    <TableCell>
                      <InputBase
                        placeholder="Team Name"
                        id="standard-basic"
                        fullWidth
                        style={{
                          width: "50%",
                          paddingTop: "4px",
                          paddingBottom: "4px",
                          paddingLeft: "10px",
                          borderRadius: "30px",
                          backgroundColor: "white",
                          color: "black",
                        }}
                        inputProps={{ "aria-label": "naked" }}
                        value={type.teamName}
                        disabled={
                          !type.isSubmitted || (type.isSubmitted && type.isEdit)
                        }
                        onChange={(e: any) =>
                          handlecipTeamNameChange(e, type._id)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <InputBase
                        id="standard-basic"
                        fullWidth
                        style={{
                          width: "50%",
                          paddingTop: "4px",
                          paddingBottom: "4px",
                          paddingLeft: "10px",
                          borderRadius: "30px",
                          backgroundColor: "white",
                          color: "black",
                        }}
                        inputProps={{ "aria-label": "naked" }}
                        value={type.locationName}
                        disabled={true}
                      />
                    </TableCell>

                    <TableCell>
                      {(isMR || isOrgAdmin) && (
                        <>
                          <>
                            {!type.isSubmitted ||
                            (type.isSubmitted && type.isEdit) ? (
                              <IconButton
                                style={{ padding: 0 }}
                                onClick={() => handleChangeCIPIcon(type._id)}
                              >
                                <CustomEditICon width={18} height={18} />
                              </IconButton>
                            ) : (
                              <IconButton
                                style={{ padding: 0 }}
                                onClick={() =>
                                  !type.isFirstSubmit
                                    ? handleEditCIPType(
                                        type._id,
                                        type.teamName
                                        //type.teamNo
                                      )
                                    : handlecipTypeSubmit(
                                        type.teamName
                                        //type.teamNo
                                      )
                                }
                              >
                                <MdCheckCircle width={18} height={18} />
                              </IconButton>
                            )}
                          </>
                          <Divider
                            type="vertical"
                            className={classes.NavDivider}
                          />
                        </>
                      )}
                      {isOrgAdmin && (
                        <>
                          <IconButton
                            style={{ padding: 0 }}
                            disabled={cipTeams.some(
                              (type) =>
                                (type.isEdit && type.isSubmitted) ||
                                type.isSubmitted
                            )}
                            onClick={() => {
                              handleOpen(type);
                            }}
                          >
                            <CustomDeleteICon width={18} height={18} />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
        </Paper>
      </div>
    </>
  );
};

export default CIPTeams;
