import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  TableRow,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  Tooltip,
  TableHead,
  Grid,
  Typography,
} from "@material-ui/core";
import { Select as AntSelect, Pagination, PaginationProps } from "antd";
import useStyles from "./styles";
import axios from "apis/axios.global";
import { roles } from "utils/enums";
import { useRecoilValue } from "recoil";
import { orgFormData } from "recoil/atom";
import checkRoles from "utils/checkRoles";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { Divider } from "antd";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import { useSnackbar } from "notistack";
import ConfirmDialog from "components/ConfirmDialog";
import getAppUrl from "utils/getAppUrl";
import moment from "moment";
import { useNavigate } from "react-router-dom";
const { Option } = AntSelect;

type Props = {
  activeTab: any;
  setActiveTab: any;
  setCategoryId: any;
  setIsHiraConfigExist: any;
  setHiraConfigData: any;
};

const RiskCategoriesListTab = ({
  activeTab,
  setActiveTab,
  setCategoryId,
  setIsHiraConfigExist,
  setHiraConfigData,
}: Props) => {
  const [riskTypes, setRiskTypes] = useState<any>([]);
  const [riskTypesCount, setRiskTypesCount] = useState<any>(0);
  const orgData = useRecoilValue(orgFormData);
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const classes = useStyles();
  const isMR = checkRoles(roles.MR);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [selectedRiskTypeIdForDelete, setSelectedRiskTypeIdForDelete] =
    useState<any>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate()
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  useEffect(() => {
    getAllRiskCategories();
  }, []);

  // useEffect(() => {
  //   console.log("checkrisk riskTypes", riskTypes);
  // }, [riskTypes]);

  const getAllRiskCategories = async (
    page: number = 1,
    pageSize: number = 10
  ) => {
    try {
      const response = await axios.get(
        `api/riskconfig/getriskcategories/${userDetails?.organizationId}?page=${page}&pageSize=${pageSize}`
      );
      // page=${page}&pageSize=${pageSize}
      // console.log("checkrisk response", response);
      if (response?.data && !!response?.data?.data?.length) {
        setRiskTypes(
          response?.data?.data?.map((item: any) => ({
            ...item,
            id: item?._id,
            isEdit: false,
            locationId: item?.locationId,
          }))
        );
        setRiskTypesCount(response.data?.totalRecords);
      } else {
        // enqueueSnackbar("No Hazard Types Found", {
        //   variant: "error",
        // });
        setRiskTypes([]);
        setRiskTypesCount(0);
      }
    } catch (error) {
      // console.log("Error in Fetching Hazard Types", error);
      enqueueSnackbar("Error in Hazard Types", {
        variant: "error",
      });
      setRiskTypes([]);
      setRiskTypesCount(0);
    }
  };

  const handleChangePage = (pageNumber: any, pageSize: any = rowsPerPage) => {
    // console.log("checkrisk pageSize", pageSize);
    setPage(pageNumber);
    setRowsPerPage(pageSize);

    getAllRiskCategories(pageNumber, pageSize);
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setSelectedRiskTypeIdForDelete(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateCategory = async () => {
    setIsHiraConfigExist(false);
    setCategoryId(null);
    // setHiraConfigData({
    //   id: "",
    //   riskCategory: "",
    //   riskType: [{ name: "" }],
    //   condition: [{ name: "" }],
    //   hiraMatrixHeader: [],
    //   hiraMatrixData: [],
    //   riskLevelData: [],
    //   orgId: "",
    // });
    navigate("/risk/riskconfiguration/form")
  };

  const handleDeleteHazard = async () => {
    if (selectedRiskTypeIdForDelete.isNewEntry) {
      // Handle deletion of a new entry that has not been saved to the backend
      const updatedHazardTypes = riskTypes.filter(
        (type: any) => type?.id !== selectedRiskTypeIdForDelete?.id
      );
      setRiskTypes(updatedHazardTypes);
      setRiskTypesCount((prevValue: any) => prevValue - 1);
      handleClose();
    } else {
      // Handle deletion of an existing hazard that has been saved to the backend
      try {
        const response = await axios.delete(
          `/api/riskconfig/deleteconfigbyid/${selectedRiskTypeIdForDelete.id}`
        );
        if (response.status === 200 || response.status === 201) {
          const updatedHazardTypes = riskTypes.filter(
            (type: any) => type?.id !== selectedRiskTypeIdForDelete?.id
          );
          setRiskTypes(updatedHazardTypes);
          setRiskTypesCount((prevValue: any) => prevValue - 1);
          handleClose();
        } else {
          enqueueSnackbar("Error in Deleting Hazard Type", {
            variant: "error",
          });
          handleClose();
          return;
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleEdit = async (riskCategoryId: number) => {
    setCategoryId(riskCategoryId);
    setIsHiraConfigExist(true);
    navigate("/risk/riskconfiguration/form",{
      state : {
        edit : true,
        id : riskCategoryId
      }
    })
  };

  return (
    <>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDeleteHazard}
      />

      <div className={classes.root}>
        <Grid container spacing={2} alignItems="center" justify="flex-end">
          <Grid item>
            {isMR || isMCOE ? (
              <Tooltip title="Add New Category">
                <Button
                  className={classes.buttonColor}
                  variant="contained"
                  color="primary" // You can use a color from the theme
                  //   startIcon={<AddIcon />} // Replace with an appropriate icon
                  onClick={handleCreateCategory}
                  disabled={!isMCOE}
                  style={{
                    // backgroundColor: `${
                    //   selectedLocation?.id === "All" ? "#e9e9e9" : "#003059"
                    // }`, // Adjust backgroundColor for proper alignment
                    // color: `${
                    //   selectedLocation?.id === "All" ? "black" : "white"
                    // }`,
                    marginLeft: "10px",
                  }} // Adjust marginLeft for proper alignment
                >
                  Create
                </Button>
              </Tooltip>
            ) : null}
          </Grid>
        </Grid>

        <div
        // className={classes.paper}
        >
          {riskTypesCount ? (
            <TableContainer>
              <Table className={classes.table}>
                <TableHead className={classes.tableHeader}>
                  <TableRow>
                    <TableCell style={{ width: "35%", paddingLeft: "30px" }}>
                      Category Name
                    </TableCell>
                    <TableCell style={{ width: "20%", paddingLeft: "30px" }}>
                      Created By
                    </TableCell>
                    <TableCell style={{ width: "20%", paddingLeft: "30px" }}>
                      Created At
                    </TableCell>
                    {!!isMCOE && (
                      <TableCell style={{ width: "10%" }}>Actions</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {riskTypes.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell style={{ width: "35%" }}>
                        <Typography>{item.riskCategory}</Typography>
                      </TableCell>
                      <TableCell style={{ width: "20%" }}>
                        <Typography>
                          {item?.createdByUserDetails?.firstname +
                            " " +
                            item?.createdByUserDetails?.lastname}
                        </Typography>
                      </TableCell>
                      <TableCell style={{ width: "20%" }}>
                        <Typography>
                          {moment(item?.createdAt).format("DD/MM/YYYY HH:mm")}
                        </Typography>
                      </TableCell>
                      {isMCOE && (
                        <TableCell style={{ width: "10%" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <IconButton
                              style={{
                                padding: 0,
                              }}
                              onClick={() => handleEdit(item.id)}
                              disabled={
                                // !checkIfIsMRAndBelongsToSameLocation(item) &&
                                !isMCOE
                              }
                            >
                              <CustomEditICon width={18} height={18} />
                            </IconButton>
                            <Divider
                              type="vertical"
                              className={classes.NavDivider}
                            />
                            <IconButton
                              style={{ padding: 0 }}
                              onClick={() => handleOpen(item)}
                              disabled={
                                // !checkIfIsMRAndBelongsToSameLocation(item) &&
                                !isMCOE
                              }
                            >
                              <CustomDeleteICon width={18} height={18} />
                            </IconButton>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
                Let’s begin by adding a Risk Category
              </Typography>
            </>
          )}
        </div>
      </div>
      <div className={classes.pagination}>
        <Pagination
          size="small"
          current={page}
          pageSize={rowsPerPage}
          total={riskTypesCount}
          showTotal={showTotal}
          showSizeChanger
          showQuickJumper
          onChange={(page, pageSize) => {
            handleChangePage(page, pageSize);
          }}
        />
      </div>
    </>
  );
};

export default RiskCategoriesListTab;
