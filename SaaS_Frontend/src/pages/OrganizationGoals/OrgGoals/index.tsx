import React, { useState } from "react";
import useStyles from "./styles";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  orgFormData,
  orgAdminCount,
  objectiveData,
} from "../../../recoil/atom";
import axios from "../../../apis/axios.global";
import { useSnackbar } from "notistack";
import { MdEdit } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import CustomTable from "../../../components/CustomTable";
import EmptyTableImg from "../../../assets/EmptyTableImg.svg";

import CloseIconImageSvg from "assets/documentControl/Close.svg";
import {
  Button,
  CircularProgress,
  Grid,
  Modal,
  Tooltip,
  Typography,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@material-ui/core";
import checkActionsAllowed from "../../../utils/checkActionsAllowed";
import OrgObjectiveForm from "../OrgObjectiveForm";
import { sortBy } from "lodash";
import checkRoles from "../../../utils/checkRoles";
import { roles } from "../../../utils/enums";
import { useNavigate } from "react-router-dom";
import { objectiveGoalsForm } from "../../../schemas/objectiveGoalsForm";
import getYearFormat from "utils/getYearFormat";
import { Pagination, PaginationProps } from "antd";
import { isValid } from "utils/validateInput";

// import MaterialTable from "material-table";

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const t = new Date();
const dd = String(t.getDate()).padStart(2, "0");
const mm = String(t.getMonth() + 1).padStart(2, "0");
const yyyy = t.getFullYear();
const today: string = dd + "/" + mm + "/" + yyyy;
type Props = {
  tableHeaders?: string[];
  tableFields?: string[];
  tableData?: any;
  isAdmin?: boolean;
};

const initVal: any = {
  Year: "",
  ObjectiveCategory: "",
  ModifiedBy: "User",
  createdAt: today,
  Description: "",
  updatedAt: "",
};

const headers = [
  "Objective Category ",
  "Created At",
  "Modified At",
  "Modified By",
];
const fields = ["ObjectiveCategory", "createdAt", "updatedAt", "ModifiedBy"];

/**
 * This component wraps the OrgAdmin form and the Display Added Component.
 * All operations required in the orgAdmin creation, edit and delete are present in this component
 */

function ObjectiveGoals({
  tableHeaders,
  tableFields,
  tableData,
  isAdmin = true,
}: Props) {
  const classes = useStyles();
  const orgData = useRecoilValue(orgFormData);
  const [orgAdminData, setOrgAdminData] = React.useState<any>();
  const [rerender, setRerender] = React.useState(false);
  // const [isEdit, setIsEdit] = React.useState(false);
  const [initData, setInitData] = React.useState(initVal);
  const setOrgAdminCount = useSetRecoilState(orgAdminCount);
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const navigate = useNavigate();
  const [formData, setFormData] = useRecoilState(objectiveData);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [nEdit, setNEdit] = useState(false);
  const [edit, setEdit] = useState(false);
  const [currentYear, setCurrentYear] = useState<any>();
  const [page, setPage] = useState<any>(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>(0);

  const handleEditObj = (values: any) => {
    setEdit(true);
    setFormData(values);
    setFormDialogOpen(true);
    setNEdit(true);
  };

  const handleClickFormDialogOpen = () => {
    setEdit(false);
    setFormData(objectiveGoalsForm);
    setFormDialogOpen(true);
    setNEdit(false);
  };

  const getYear = async () => {
    try {
      const currentYear = await getYearFormat(new Date().getFullYear());
      if (!formData.Year) {
        setFormData({
          ...formData,
          Year: currentYear,
        });
      }
      setCurrentYear(currentYear);
    } catch (error) {
      console.error("Error getting or formatting the year:", error);
    }
  };

  function rand() {
    return Math.round(Math.random() * 20) - 10;
  }
  const showTotalType: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const handlePaginationType = async (page: any, pageSize: any) => {
    const userInfo = await axios.get("/api/user/getUserInfo");
    setPage(page);
    setRowsPerPage(pageSize);
    // getKeyAgendaValues(selectedLocation, currentYear);
  };
  function getModalStyle() {
    const top = 50 + rand();
    const left = 50 + rand();

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const handleClick = () => {
    setFormData(objectiveGoalsForm);
    navigate("/objective/newobjective/");
  };

  /**
   * @method handleDiscard
   * @description Function to remove any field data and reset it to a default initial state
   * @returns nothing
   */
  // const handleDiscard = () => {
  //   setEdit(false);
  //   setInitData(initVal);
  //   setRerender(!rerender);
  // };

  const handleDiscard = () => {
    setFormData({
      Year: currentYear,
      ObjectiveCategory: "",
      ModifiedBy: "User",
      createdAt: today,
      updatedAt: "",
      Description: "",
      _id: "",
    });
  };

  /**
   * @method handleObjectiveDelete
   * @description Function to delete a user
   * @param data {any}
   * @returns nothing
   */
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    // handleObjectiveDelete(data);
    setOpen(false);
  };

  const body = (
    <div style={modalStyle} className={classes.paper}>
      <p id="simple-modal-description">
        Please note corresponding objectives created against this category will
        not be deleted!!
      </p>
      <Button onClick={() => handleClose()}>OK</Button>
    </div>
  );

  const handleObjectiveDelete = async (data: any) => {
    setOpen(true);
    setIsLoading(true);
    try {
      const res = await axios.delete(`api/objective/deleteObjective/${data.id}`);
      setRerender(!rerender);
      setIsLoading(false);
      enqueueSnackbar(`objective Deleted`, {
        variant: "success",
      });
    } catch (err) {
      console.log(err);

      setIsLoading(false);
    }
  };

  /**
   * @method handleSubmit
   * @description Function to submit all the data
   * @param values {any}
   * @returns nothing
   */
  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    const finalData = {
      ...values,
      Year: currentYear,
      // realm: orgData.realmName,
      // userRole: "ORG-ADMIN",
    };
    // console.log("finaldata", finalData);
    if (edit) {
      try {
        const { id, Description, ObjectiveCategory } = finalData;
        const isValidTitle = isValid(ObjectiveCategory);
        if (!isValidTitle.isValid) {
          enqueueSnackbar(
            `Please enter a valid category name ${isValidTitle.errorMessage}`,
            { variant: "error" }
          );
          setFormDialogOpen(false);
          setRerender(!rerender);
          return;
        }
        if (ObjectiveCategory !== "" || ObjectiveCategory !== undefined) {
          const res = await axios.put(
            `/api/objective/updateObjective/${values.id}`,
            {
              finalData,
            }
          );
          console.log("Res", res);
          setIsLoading(false);
          setInitData(initVal);
          setEdit(false);
          setRerender(!rerender);
          enqueueSnackbar(
            `${finalData?.ObjectiveCategory} successfully Saved`,
            {
              variant: "success",
            }
          );
          setFormDialogOpen(false);
        }
        // setRerender(!rerender);
      } catch (err: any) {
        console.log("err", err);
        // enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
        //   variant: "error",
        // });
        enqueueSnackbar(`Objective category cannot be empty`, {
          variant: "error",
        });
        setFormDialogOpen(false);
        setRerender(!rerender);
      }
    } else {
      const isValidTitle = isValid(finalData?.ObjectiveCategory);
      if (!isValidTitle.isValid) {
        enqueueSnackbar(
          `Please enter a valid category name ${isValidTitle.errorMessage}`,
          { variant: "error" }
        );
        setFormDialogOpen(false);
        setRerender(!rerender);
        return;
      }
      try {
        const res = await axios.post(
          "/api/objective/createOrgObjective",
          finalData
        );
        setIsLoading(false);
        handleDiscard();
        enqueueSnackbar(`${finalData.ObjectiveCategory} successfully created`, {
          variant: "success",
        });
        setFormDialogOpen(false);
        setRerender(!rerender);
      } catch (err: any) {
        setIsLoading(false);
        if (err.response.status === 409) {
          enqueueSnackbar(`Objective Already Exists`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
            variant: "error",
          });
        }
      }
    }
  };
  // ];
  const convertDate = (date: string) => {
    const d = new Date(date);

    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  /**
   * @method getData
   * @description Function to fetch data related to organization admin
   * @param url {string}
   * @returns nothing
   */
  const getData = async (url: string) => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${url}AllObjectives?page=${page}&limit=${rowsPerPage}`
      );
      console.log("res.data.result", res.data.result);
      if (res.data?.result) {
        const val = sortBy(res.data?.result, ["Year"]).map((item: any) => ({
          Year: item.Year.replace(/CY /g, " "),
          ObjectiveCategory: item.ObjectiveCategory,
          ModifiedBy: item.ModifiedBy?.username,
          createdAt: convertDate(item.createdAt),
          updatedAt: convertDate(item.updatedAt),
          Description: item.Description,
          id: item._id,
          // kc_id: item.kcId,
          isAction: checkActionsAllowed(item._id, ["Delete"]),
        }));
        setOrgAdminData(val);
        setOrgAdminCount(val.length);
        setCount(res.data?.count);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };
  console.log("org admin data", orgAdminData);
  React.useEffect(() => {
    getYear();
  }, []);

  React.useEffect(() => {
    getData("/api/objective/");
  }, [rerender, page, rowsPerPage]);

  return (
    <>
      <div>
        {!isLoading ? (
          <>
            {isOrgAdmin && (
              <Grid
                item
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <Tooltip title="New Objective Category">
                  <Button
                    size="medium"
                    className={classes.buttonStyle}
                    onClick={handleClickFormDialogOpen}
                    disabled={!isOrgAdmin}
                  >
                    Create
                  </Button>
                </Tooltip>
              </Grid>
            )}

            <Dialog
              // fullWidth={true}
              maxWidth="lg"
              open={formDialogOpen}
              onClose={() => setFormDialogOpen(false)}
              PaperProps={{
                style: { width: "calc(100% +20px)", overflowX: "hidden" }, // Increase width by 30px
              }}
            >
              <DialogTitle>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={() => setFormDialogOpen(false)}
                  aria-label="close"
                  style={{ position: "absolute", right: 6, top: 8 }}
                >
                  <img
                    src={CloseIconImageSvg}
                    alt="Close"
                    style={{ width: 24, height: 24 }}
                  />
                </IconButton>
              </DialogTitle>
              <DialogContent style={{ padding: 0 }}>
                <OrgObjectiveForm
                  initVal={initData}
                  isEdit={nEdit}
                  handleDiscard={handleDiscard}
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
                  rerender={rerender}
                  currentYear={currentYear}
                />
              </DialogContent>
            </Dialog>

            <>
              {(orgAdminData?.length || tableData?.length) !== 0 &&
              (orgAdminData?.length || tableData) ? (
                <Paper elevation={0} className={classes.root}>
                  <div className={classes.tableSection}>
                    <div className={classes.table}>
                      <CustomTable
                        header={tableHeaders ? tableHeaders : headers}
                        fields={tableFields ? tableFields : fields}
                        data={tableData ? tableData : orgAdminData}
                        actions={
                          isOrgAdmin
                            ? [
                                {
                                  label: "Edit",
                                  icon: <MdEdit fontSize="small" />,
                                  handler: handleEditObj,
                                },
                                {
                                  label: "Delete",
                                  icon: <MdDelete fontSize="small" />,
                                  handler: handleObjectiveDelete,
                                },
                              ]
                            : []
                        }
                      />
                    </div>
                  </div>
                </Paper>
              ) : (
                <Typography align="center">
                  {
                    <>
                      <div className={classes.imgContainer}>
                        <img src={EmptyTableImg} alt="No Data" width="300px" />
                      </div>
                      <Typography
                        align="center"
                        className={classes.emptyDataText}
                      >
                        Let’s begin by adding an objective
                      </Typography>
                    </>
                  }
                </Typography>
              )}
              <div className={classes.pagination}>
                <Pagination
                  size="small"
                  current={page}
                  pageSize={rowsPerPage}
                  total={count}
                  showTotal={showTotalType}
                  showSizeChanger
                  showQuickJumper
                  onChange={(page, pageSize) => {
                    handlePaginationType(page, pageSize);
                  }}
                />
              </div>
            </>
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
            >
              {body}
            </Modal>
          </>
        ) : (
          <div className={classes.loader}>
            <CircularProgress />
          </div>
        )}
      </div>
    </>
  );
}

export default ObjectiveGoals;
