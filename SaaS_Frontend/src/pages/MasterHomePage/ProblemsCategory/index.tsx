import { useState, useEffect } from "react";

import useStyles from "./styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { MdCheckCircleOutline } from 'react-icons/md';

import {
  CircularProgress,
  Typography,
  Box,
  TextField,
  IconButton,
} from "@material-ui/core";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { problemsFormData } from "recoil/atom";
import axios from "apis/axios.global";
import ConfirmDialog from "components/ConfirmDialog";
import { useSnackbar } from "notistack";
import formatQuery from "utils/formatQuery";
import getAppUrl from "utils/getAppUrl";
import FilterDrawer from "components/FilterDrawer";
import SearchBar from "components/SearchBar";
import EmptyTableImg from "assets/documentControl/EmptyTableImg.svg";
import NoAccess from "assets/documentControl/NoAccess.svg";
// import SimplePaginationController from "components/ReusableComponents/SimplePaginationController";
import SimplePaginationController from "components/SimplePaginationController";
import checkRoles from "utils/checkRoles";
import Edit from "assets/documentControl/Edit.svg";
import Delete from "assets/documentControl/Delete.svg";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import { MdSearch } from 'react-icons/md';

type Props = {
  addFlag?: any;
  setAddFlag?: any;
  filterOpen?: boolean;
  setFilterOpen?: any;
};

const fields = ["problem"];
const headers = ["PROBLEM  CATEGORY", "ACTIONS"];

function ProblemsCategory({
  addFlag,
  setAddFlag,
  filterOpen,
  setFilterOpen,
}: Props) {
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setLocData = useSetRecoilState(problemsFormData);
  const [open, setOpen] = useState(false);
  const [deleteLoc, setDeleteLoc] = useState<any>();
  const [rerender, setRerender] = useState(false);
  const [searchValue, setSearchValue] = useState<any>("");
  const [count, setCount] = useState<number>();
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState<any>(true);
  const [editRowId, setEditRowId] = useState<any>(null);
  const [formData, setFormData] = useRecoilState(problemsFormData);
  const [deletId, setDeleteId] = useState<any>(null);
  const [val, setVal] = useState<any>(null);

  const classes: any = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const orgName = getAppUrl();
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isOrgAdmin = true;
  const isAdmin = checkRoles("admin");
  const isEntityHead = checkRoles("ENTITY-HEAD");
  const isAuditor = checkRoles("AUDITOR");
  const isMR = checkRoles("MR");
  const isGeneralUser = false;
  const location = useLocation();
  const getData = async (url: any) => {
    setIsLoading(true);
    try {
      const res = await axios.get(url);
      console.log(res, "response");

      if (res?.data?.data) {
        setCount(res.data.length);
        const val = res?.data?.data?.map((item: any) => {
          return {
            id: item.id,
            problem: item.problem,
            createdAt: item.createdAt,
          };
        });
        setData(val);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleEditLoc = (rowId: any, item: any) => {
    console.log("row id", rowId);
    setEditRowId(rowId);
    setFormData({
      ...item,
    });
  };
  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (edit: boolean = false) => {
    if (formData.problem) {
      setIsLoading(true);
      if (edit) {
        try {
          const res = await axios.put(`/api/problem/${formData.id}`, {
            problem: formData.problem,
          });
          setFormData({
            problem: formData.problem,
            id: res.data.id,
            createdAt: res.data.createdAt,
          });
          setIsLoading(false);
          enqueueSnackbar(`Problem Saved Succesfully`, {
            variant: "success",
          });
          setAddFlag(false);
          navigate("/master", { state: { redirectToTab: "PROBLEM CATEGORY" } });
        } catch (err: any) {
          setAddFlag(false);
          enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
            variant: "error",
          });
          setIsLoading(false);
        }
      } else {
        try {
          const res = await axios.post(`/api/problem`, {
            problem: formData.problem,
          });
          setFormData({
            problem: formData.problem,
            id: res.data.id,
            createdAt: res.data.createdAt,
          });
          setIsLoading(false);
          enqueueSnackbar(`Problem Created Succesfully`, {
            variant: "success",
          });
          setAddFlag(false);
          setEditRowId(null);
          const url = formatQuery(`/api/problem`, { page: page, limit: 10 }, [
            "page",
            "limit",
          ]);
          getData(url);
          navigate("/master", { state: { redirectToTab: "PROBLEM CATEGORY" } });
        } catch (err: any) {
          if (err.response.status === 409) {
            enqueueSnackbar(`Problem Already Exists`, {
              variant: "error",
            });
          } else {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
          }
          setAddFlag(false);
          setIsLoading(false);
        }
      }
    } else {
      enqueueSnackbar(`Please Fill the Problem `, {
        variant: "warning",
      });
    }

    setFormData({});
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteLoc(val);
  };

  const handleClose = () => {
    setOpen(false);
    setDeleteId(null);
  };

  const handleDelete = async (id: string, value: any) => {
    handleClose();
    setIsLoading(true);
    console.log(id);

    try {
      if (value.problem.length <= 0) {
        const newData = data.filter((element: any) => {
          if (element.id !== id) {
            return element;
          }
        });
        setData(newData);
        setEditRowId(null);
        setIsLoading(false);
        setEditRowId(null);
        setAddFlag(false);
        return;
      }
      const res = await axios.delete(`api/problem/${id}`);
      enqueueSnackbar(`Operation Successful`, { variant: "success" });
      setIsLoading(false);
      setRerender(!rerender);
    } catch (err) {
      enqueueSnackbar(`Error ${err}`, {
        variant: "error",
      });
      setIsLoading(false);
    }
    setFormData({});
    setDeleteId(null);
  };

  const handleClick = () => {
    const newRow = { id: 0, problem: "" };
    setData((prevData: any) => [newRow, ...prevData]);
    setEditRowId(0);
  };

  const handleChangePage = (page: any) => {
    setPage(page);
    const url = formatQuery(`/api/problem`, { page: page, limit: 10 }, [
      "page",
      "limit",
    ]);
    getData(url);
  };
  const handleSearchChange = (e: any) => {
    setSearchValue(e.target.value);
  };
  const handleApply = () => {
    const url = formatQuery(
      `/api/problem`,
      { page: 1, limit: 10, search: searchValue },
      ["page", "limit", "search"],
      false
    );

    if (
      isOrgAdmin ||
      isAdmin ||
      isLocAdmin ||
      isMR ||
      isEntityHead ||
      isAuditor ||
      isGeneralUser
    ) {
      getData(url);
    }
  };

  useEffect(() => {
    const url = formatQuery(
      `/api/problem`,
      { page: 1, limit: 10 },
      ["page", "limit"],
      false
    );

    if (
      isOrgAdmin ||
      isAdmin ||
      isLocAdmin ||
      isMR ||
      isEntityHead ||
      isAuditor ||
      isGeneralUser
    ) {
      getData(url);
    }
  }, [rerender]);
  useEffect(() => {
    console.log(addFlag);
    if (addFlag) {
      handleClick();
    }
  }, [addFlag]);
  useEffect(() => {
    if (location.pathname.includes("/module-settings")) {
      setShowAdd(false);
    }
    console.log(location);
  }, [location]);

  return (
    <>
      <FilterDrawer
        open={filterOpen!}
        setOpen={setFilterOpen!}
        resultText={count ? `Showing ${count} Result(s)` : `No Results Found`}
        handleApply={handleApply}
        handleDiscard={() => {
          setSearchValue("");
        }}
      >
        <SearchBar
          placeholder="By Problem "
          name="problem"
          handleChange={(e: any) => handleSearchChange(e)}
          values={searchValue}
          handleApply={handleApply}
        />
      </FilterDrawer>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={() => {
          handleDelete(deletId, val);
        }}
      />

      {isOrgAdmin ||
      isAdmin ||
      isLocAdmin ||
      isMR ||
      isEntityHead ||
      isAuditor ||
      isGeneralUser ? (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            style={{ padding: "10px" }}
          >
            <Typography color="primary" variant="h6">
              Problem Management
            </Typography>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: "20px",
                padding: "5px",
              }}
            >
              <Input
                placeholder="MdSearch"
                disableUnderline={true} // Remove the underline
                onChange={(e) => handleSearchChange(e)}
                value={searchValue}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApply();
                  }
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <MdSearch style={{ color: "#aaa" }} />
                  </InputAdornment>
                }
                style={{ height: "20px" }}
              />
            </div>
          </Box>

          {isLoading ? (
            <div className={classes.loader}>
              <CircularProgress />
            </div>
          ) : data && data?.length !== 0 ? (
            <>
              <div
                data-testid="custom-table"
                className={classes.tableContainer}
              >
                <TableContainer
                  component={Paper}
                  elevation={0}
                  variant="outlined"
                >
                  <Table stickyHeader className={classes.table}>
                    <TableHead style={{ backgroundColor: "#293079" }}>
                      <TableRow>
                        {headers.map((item: any) => (
                          <TableCell key={item}>
                            <Typography
                              variant="body2"
                              className={classes.tableHeaderColor}
                            >
                              {item}
                            </Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data?.map((val: any, i: number) => {
                        return (
                          <TableRow key={val.id}>
                            <TableCell
                              className={classes.tableCell}
                              key={val.id}
                            >
                              {editRowId === val.id ? (
                                <TextField
                                  value={formData.problem}
                                  onChange={handleChange}
                                  fullWidth
                                  name="problem"
                                />
                              ) : (
                                <div>{val["problem"]}</div>
                              )}
                            </TableCell>

                            <TableCell
                              className={classes.tableCell}
                              key={val.id}
                            >
                              {editRowId === val.id ? (
                                <IconButton
                                  onClick={() => {
                                    if (editRowId == 0) {
                                      handleSubmit(false);

                                      return;
                                    }
                                    handleSubmit(true);
                                  }}
                                >
                                  <MdCheckCircleOutline />
                                </IconButton>
                              ) : (
                                <IconButton
                                  onClick={() => handleEditLoc(val.id, val)}
                                >
                                  <img
                                    src={Edit}
                                    style={{
                                      width: "20px",
                                    }}
                                  />
                                </IconButton>
                              )}

                              <IconButton
                                onClick={() => {
                                  setDeleteId(val.id);
                                  setVal(val);
                                  setOpen(true);
                                }}
                              >
                                <img
                                  src={Delete}
                                  style={{
                                    width: "20px",
                                  }}
                                />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <SimplePaginationController
                  count={count}
                  page={page}
                  rowsPerPage={10}
                  handleChangePage={handleChangePage}
                />
              </div>
            </>
          ) : (
            <>
              <div className={classes.imgContainer}>
                <img
                  src={EmptyTableImg}
                  alt="No Data"
                  height="400px"
                  width="300px"
                />
              </div>
              <Typography align="center" className={classes.emptyDataText}>
                Let’s begin by adding a location
              </Typography>
            </>
          )}
        </>
      ) : (
        <>
          <div className={classes.imgContainer}>
            <img src={NoAccess} alt="No Access" height="400px" width="300px" />
          </div>
          <Typography align="center" className={classes.emptyDataText}>
            You are not authorized to view this page
          </Typography>
        </>
      )}
    </>
  );
}

export default ProblemsCategory;
