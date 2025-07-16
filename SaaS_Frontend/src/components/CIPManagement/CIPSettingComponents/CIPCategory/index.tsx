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
import { MdCheckCircle } from 'react-icons/md';
import axios from "apis/axios.global";
import { roles } from "utils/enums";
import { useRecoilValue } from "recoil";
import { orgFormData } from "recoil/atom";
import checkRoles from "utils/checkRoles";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { Divider, Pagination, PaginationProps } from "antd";
import { useSnackbar } from "notistack";
import ConfirmDialog from "components/ConfirmDialog";
import formatQuery from "utils/formatQuery";
import { isValid } from "utils/validateInput";


interface CIPType {
  _id: number;
  categoryName: string;
  organizationId: string;
  createdBy: string;
  //used to change icons
  isSubmitted: boolean;
  isEdit: boolean;
  //used for icon functionality(post/put)
  isFirstSubmit: boolean;
}

const CIPCategory: React.FC = () => {
  const [cipTypes, setCIPTypes] = useState<CIPType[]>([]);
  const orgData = useRecoilValue(orgFormData);
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const classes = useStyles();
  const isMR = checkRoles(roles.MR);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const accessRight = isOrgAdmin ? true : false;
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<any>();
  const [createEnabled, setCreateEnabled] = useState<boolean>(false);
  // Assign "orgId" from sessionStorage if it exists
  // Otherwise it assigns the value of orgData.organizationId or orgData.id if either exists
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>(0);

  const showTotal: PaginationProps["showTotal"] = (total) => `Total ${total} items`;

  useEffect(() => {
    const url = formatQuery(
      `/api/cip/getAllCIPCategory`,
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
    // Create a new CIP type object
    const newCIP: CIPType = {
      _id: cipTypes.length + 1,
      categoryName: "",
      organizationId: "",
      createdBy: "",
      isSubmitted: true,
      isEdit: false,
      isFirstSubmit: true,
    };
    setCIPTypes([newCIP, ...cipTypes]);
    setCreateEnabled(true);
  };

  // const isCipNameUnique = (name: any) => {

  //   return !cipTypes.some((type) => type.name === name);
  // };

  const isCipNameUnique = (name: any) => {
    return !cipTypes.some((type) => {
      return typeof type._id !== "number" && type.categoryName.toLowerCase() === name.toLowerCase();
    });
  };

  const handlecipTypeSubmit = async (cipTypeName: string) => {

    const isValidDeviation = isValid(cipTypeName);
    if (!isValidDeviation.isValid) {
      enqueueSnackbar(
        `CIP Category ${isValidDeviation.errorMessage}`,
        { variant: "error" }
      );
      return;
    }
    const isUnique = isCipNameUnique(cipTypeName);
    if (isUnique !== true) {
      enqueueSnackbar("CIP Category already exists!", { variant: "error" });
      return;
    }

    const CIPType = {
      categoryName: cipTypeName,
      createdBy: userDetails.userName,
      organizationId: organizationId,
    };
    try {
      const response = await axios.post(`/api/cip/createCIPCategory`, CIPType);
      const returnedId = response.data.funid;
      // Use the returnedId as needed
      const updatedcipTypes = cipTypes.map((type) => {
        if (type.categoryName === cipTypeName) {
          return {
            ...type,
            isSubmitted: false,
            isEdit: true,
            isFirstSubmit: false,
          };
        }
        return type;
      });
      // const sortedCIPs = updatedcipTypes
      //   .slice()
      //   .sort((a: any, b: any) => a.categoryName.localeCompare(b.categoryName));
      setCIPTypes(updatedcipTypes);
      const url = formatQuery(
        `/api/cip/getAllCIPCategory`,
        {
          page: page,
          limit: rowsPerPage,
        },
        ["page", "limit"]
      );
      getAllCIPS(url);
    } catch (error) {
      // Handle any error that occurred during the request
      enqueueSnackbar("Could not submit CIP Category", { variant: "error" });
    }
  };

  const getAllCIPS = async (url : any) => {
    try {
      const response = await axios.get(url);
      console.log("RESPOSNE ",response)
      const CipResponse = response.data.data;
      const sortedCIPs = CipResponse.slice().sort((a: any, b: any) =>
        a.categoryName.localeCompare(b.categoryName)
      );
      setCount(response?.data?.total);
      setCIPTypes(sortedCIPs);
    } catch (error) {
      enqueueSnackbar("Could not get CIPs", { variant: "error" });
    }
  };

  const handleEditCIPType = async (cipTypeId: number, cipTypeName: string) => {
    try {

      const isValidDeviation = isValid(cipTypeName);
      if (!isValidDeviation.isValid) {
        enqueueSnackbar(
          `CIP Category ${isValidDeviation.errorMessage}`,
          { variant: "error" }
        );
        return;
      }
      const count = cipTypes.filter((item : any) => 
        item.categoryName.toLowerCase() === cipTypeName.toLowerCase()
      ).length
      if(count > 1){
        enqueueSnackbar("CIP Category already exists!", { variant: "error" });
        return
      }
      const response = await axios.put(
        `/api/cip/updateCIPCategory/${cipTypeId}`,
        {
          categoryName: cipTypeName,
        }
      );

      const updatedcipTypes = cipTypes.map((type) => {
        if (type._id === cipTypeId) {
          return {
            ...type,
            categoryName: cipTypeName,
            isEdit: true,
            isSubmitted: false,
            isFirstSubmit: false,
          };
        }
        return type;
      });
      const sortedCIPs = updatedcipTypes
        .slice()
        .sort((a: any, b: any) => a.categoryName.localeCompare(b.categoryName));
      setCIPTypes(sortedCIPs);
    } catch (error) {
      enqueueSnackbar("Error updating CIP category", { variant: "error" });
    }
  };

  const handleDeleteCIPType = async () => {
    try {
      await axios.delete(`/api/cip/deleteCIPCategory/${deleteCategory._id}`);

      const updatedcipTypes = cipTypes.filter(
        (type) => type._id !== deleteCategory?._id
      );
      const sortedCIPs = updatedcipTypes
        .slice()
        .sort((a: any, b: any) => a.categoryName.localeCompare(b.categoryName));
      setCIPTypes(sortedCIPs);
      const url = formatQuery(
        `/api/cip/getAllCIPCategory`,
        {
          page: page,
          limit: rowsPerPage,
        },
        ["page", "limit"]
      );
      getAllCIPS(url);
      handleClose();
    } catch (error) {
      enqueueSnackbar("Error deleting CIP Category", { variant: "error" });
    }
  };
  const handlecipTypeNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    cipTypeId: number
  ) => {
    const updatedcipTypes = cipTypes.map((type) => {
      if (type._id === cipTypeId) {
        return {
          ...type,
          categoryName: event.target.value,
        };
      }
      return type;
    });
    setCIPTypes(updatedcipTypes);
    // const sortedCIPs = updatedcipTypes
    //   .slice()
    //   .sort((a: any, b: any) => a.name.localeCompare(b.name));
    // setCIPTypes(sortedCIPs);
  };

  const handleChangeCIPIcon = async (cipTypeId: number) => {
    const updatedcipTypes = cipTypes.map((type) => {
      if (type._id === cipTypeId) {
        return {
          ...type,
          isEdit: false,
          isSubmitted: true,
        };
      }
      return type;
    });
    const sortedCIPs = updatedcipTypes
      .slice()
      .sort((a: any, b: any) => a.categoryName.localeCompare(b.categoryName));
    setCIPTypes(sortedCIPs);
  };

  const handleChangePageNew = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
    const url = formatQuery(
      `/api/cip/getAllCIPCategory`,
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
        {accessRight && (
          <div className={classes.labelContainer}>
            <div className={classes.tableLabel}>
              {(isMR || isOrgAdmin) && (
                <Button
                  className={classes.buttonColor}
                  variant="contained"
                  style={{ backgroundColor: "#003059", color: "white" }}
                  // startIcon={<AddIcon />}
                  onClick={handleAddCIP}
                  disabled={cipTypes.some(
                    (type) =>
                      (type.isEdit && type.isSubmitted) || type.isSubmitted
                  )}
                >
                  Create
                </Button>
              )}
            </div>
          </div>
        )}

        <Paper className={classes.paper}>
          <TableContainer>
            <Table className={classes.table}>
              <TableHead className={classes.tableHeader}>
                <TableRow>
                  <TableCell style={{ width: "40%", paddingLeft: "30px" }}>
                    CIP Category
                  </TableCell>
                  <TableCell style={{ width: "50%" }}>
                    Actions
                    </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cipTypes.map((type) => (
                  <TableRow key={type._id}>
                    <TableCell>
                      <InputBase
                        placeholder="Category"
                        id="standard-basic"
                        // variant="outlined"
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
                        value={type.categoryName}
                        disabled={
                          !type.isSubmitted || (type.isSubmitted && type.isEdit)
                        }
                        onChange={(e: any) =>
                          handlecipTypeNameChange(e, type._id)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      {accessRight && (
                        <>
                          <>
                            {!type.isSubmitted ||
                            (type.isSubmitted && type.isEdit) ? (
                              <IconButton
                                style={{ padding: 0 }}
                                onClick={() => handleChangeCIPIcon(type._id)}
                                disabled={!accessRight}
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
                                        type.categoryName
                                      )
                                    : handlecipTypeSubmit(type.categoryName)
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
                          <IconButton
                            style={{ padding: 0 }}
                            disabled={cipTypes.some(
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

export default CIPCategory;
