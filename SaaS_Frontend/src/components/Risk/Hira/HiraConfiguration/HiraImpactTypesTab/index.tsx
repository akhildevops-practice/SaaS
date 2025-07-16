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
  TextField,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Select as AntSelect, Pagination, PaginationProps } from "antd";
import { TextareaAutosize } from "@material-ui/core";
import useStyles from "./styles";
import { MdCheckCircle } from 'react-icons/md';
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
import { isValid } from "utils/validateInput";
const { Option } = AntSelect;
const HiraImpactTypesTab = () => {
  const [impactTypes, setImpactTypes] = useState<any>([]);
  const [impactTypeCount, setImpactTypeCount] = useState<any>(0);
  const orgData = useRecoilValue(orgFormData);
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const classes = useStyles();
  const isMR = checkRoles(roles.MR);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [selectedImpactedTypeIdForDelete, setSelectedImpactedTypeIdForDelete] =
    useState<any>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  // Assign "orgId" from sessionStorage if it exists
  // Otherwise it assigns the value of orgData.organizationId or orgData.id if either exists
  //   const organizationId = sessionStorage.getItem("orgId");

  useEffect(() => {
    getAllLocations();
  }, []);

  useEffect(() => {
    if (locationOptions && !!locationOptions?.length) {
      if (isMR) {
        setSelectedLocation({
          id: userDetails?.location?.id,
          locationName: userDetails?.location?.locationName,
        });
      }
    }
  }, [locationOptions]);

  useEffect(() => {
    // console.log("checkrisk selectedlocation", selectedLocation);
    if (selectedLocation?.id) {
      getAllImpactTypesByLocationId();
    }
  }, [selectedLocation]);

  // useEffect(() => {
  //   console.log("checkrisk impactTypes", impactTypes);
  // }, [impactTypes]);

  const getAllLocations = async () => {
    try {
      const response = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );
      if (response?.data && !!response?.data?.length) {
        setLocationOptions([
          ...response.data,
          {
            id: "All",
            locationName: "All",
          },
        ]);
        setSelectedLocation({
          id: "All",
          locationName: "All",
        });
      } else {
        enqueueSnackbar("No Units Found", {
          variant: "error",
        });
        setLocationOptions([]);
      }
    } catch (error) {
      // console.log("Error in Fetching Locations", error);
      enqueueSnackbar("Error in Fetching Units", {
        variant: "error",
      });
      setLocationOptions([]);
    }
  };

  const getAllImpactTypesByLocationId = async (
    page: number = 1,
    pageSize: number = 10
  ) => {
    try {
      const response = await axios.get(
        `api/riskconfig/getHiraTypes?locationId=${selectedLocation?.id}&type=impact&orgId=${userDetails?.organizationId}&master=true&pagination=true&page=${page}&pageSize=${pageSize}`
      );
      // console.log(
      //   "checkrisk in getAllImpactTypesByLocationId response",
      //   response
      // );

      if (response?.data && !!response?.data?.data?.length) {
        const sortedHazardTypes = response?.data?.data
          .slice()
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setImpactTypes(
          sortedHazardTypes.map((item: any) => ({
            ...item,
            id: item?._id,
            isEdit: false,
            locationId: item?.locationId,
          }))
        );
        setImpactTypeCount(response.data?.count);
      } else {
        // enqueueSnackbar("No Impact Types Found", {
        //   variant: "error",
        // });
        setImpactTypes([]);
        setImpactTypeCount(0);
      }
    } catch (error) {
      // console.log("Error in Fetching Hazard Types", error);
      enqueueSnackbar("Error in Hazard Types", {
        variant: "error",
      });
      setImpactTypes([]);
      setImpactTypeCount(0);
    }
  };

  const handleChangePage = (pageNumber: any, pageSize: any = rowsPerPage) => {
    // console.log("checkrisk pageSize", pageSize);
    setPage(pageNumber);
    setRowsPerPage(pageSize);

    getAllImpactTypesByLocationId(pageNumber, pageSize);
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setSelectedImpactedTypeIdForDelete(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleEditState = (hazardId: any) => {
    const updatedHazards = impactTypes.map((item: any) => {
      if (item.id === hazardId) {
        return { ...item, isEdit: true }; // Set isEdit to true for the clicked row
      }
      return { ...item, isEdit: false }; // Set isEdit to false for all other rows
    });
    setImpactTypes(updatedHazards);
  };

  const handleAddImpact = async () => {
    if (!selectedLocation || !selectedLocation?.id) {
      enqueueSnackbar("Please Select Unit", {
        variant: "warning",
        autoHideDuration: 2500,
      });
      return;
    }
    // Create a new Function type object
    const newHazard: any = {
      id: impactTypes.length + 1,
      name: "",
      description: "",
      organizationId: userDetails?.organizationId,
      locationId: selectedLocation?.id,
      createdBy: userDetails?.id,
      isEdit: true,
      isNewEntry: true,
    };
    setImpactTypes([newHazard, ...impactTypes]);
    setImpactTypeCount((prevValue: any) => prevValue + 1);
  };

  const isImpactNameUnique = (name: any) => {
    return !impactTypes.some((type: any) => {
      // console.log(
      //   "uniqueName",
      //   impactTypes,
      //   name,
      //   typeof type.id !== "number" && type.name === name
      // );
      // Check if type.id is a number and type.name matches the given name
      return typeof type.id !== "number" && type.name === name;
    });
  };

  //   const getAllFunctions = async () => {
  //     try {
  //       const response = await axios.get(
  //         `/api/business/getAllFunctionsByOrgId/${organizationId}`
  //       );
  //       const functionsResult = response.data;
  //       const sortedFunctions = functionsResult
  //         .slice()
  //         .sort((a: any, b: any) => a.name.localeCompare(b.name));
  //       console.log("sortedFunctions", sortedFunctions);
  //       setFunctionTypes(sortedFunctions);
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //   };

  const handlePutImpact = async (hazardId: any, item: any) => {
    // console.log("checkrisk in handlePutImpact hazardId", hazardId);
    if (!item.name) {
      enqueueSnackbar("Please Enter Name To Save", {
        variant: "warning",
        autoHideDuration: 2500,
      });
      return;
    }
    try {
      if(item?.name) {
        const validateName = isValid(item?.name);
        if(!validateName?.isValid) {
          enqueueSnackbar(`Please Enter Valid Name ${validateName?.errorMessage}`, {
            variant: "warning",
          });
          return;
        }
      }
      if(item?.description) {
        const validateDescription = isValid(item?.description);
        if(!validateDescription?.isValid) {
          enqueueSnackbar(`Please Enter Valid Description ${validateDescription?.errorMessage}`, {
            variant: "warning",
          });
          return;
      }
      }
      const response = await axios.patch(
        `api/riskconfig/updateImpactType/${hazardId}`,
        {
          name: item.name,
          description: item.description,
          updatedBy: userDetails?.id,
        }
      );
      if (response.status === 200 || response.status === 201) {
        const updatedHazards = impactTypes.map((item: any) => {
          if (item.id === hazardId) {
            return {
              ...item,
              name: item.name,
              isEdit: false,
              isNewEntry: false,
            };
          }
          return item;
        });
        const sortedHazards = updatedHazards
          .slice()
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setImpactTypes(sortedHazards);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteHazard = async () => {
    if (selectedImpactedTypeIdForDelete?.isNewEntry) {
      const updatedHazardTypes = impactTypes.filter(
        (type: any) => type?.id !== selectedImpactedTypeIdForDelete?.id
      );
      setImpactTypes(updatedHazardTypes);
      setImpactTypeCount((prevValue: any) => prevValue - 1);
      handleClose();
    } else {
      try {
        const response = await axios.delete(
          `/api/riskconfig/deleteImpactType/${selectedImpactedTypeIdForDelete?.id}`
        );
        if (response.status === 200 || response.status === 201) {
          const updatedHazardTypes = impactTypes.filter(
            (type: any) => type.id !== selectedImpactedTypeIdForDelete?.id
          );
          const sortedHazardTypes = updatedHazardTypes
            .slice()
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
          setImpactTypes(sortedHazardTypes);
          setImpactTypeCount((prevValue: any) => prevValue - 1);
          getAllImpactTypesByLocationId();
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
  const handleHazardNameChange = (event: any, hazardId: string) => {
    // console.log(
    //   "checkrisk in handleHazardNameChange event",
    //   event?.target?.value
    // );
    // console.log("checkrisk in handleHazardNameChange hazardId", hazardId);

    const updatedHazardTypes = impactTypes.map((type: any) => {
      if (type.id === hazardId) {
        return {
          ...type,
          name: event.target.value,
        };
      }
      return type;
    });
    setImpactTypes([...updatedHazardTypes]);
  };

  const handlePostImpact = async (item: any) => {
    if (!item.name) {
      enqueueSnackbar("Please Enter Name To Save", {
        variant: "warning",
        autoHideDuration: 2500,
      });
      return;
    }
    // Provide a default value of an empty object if null
    // console.log("checkrisk hazardName", hazardName);
    const isUnique = isImpactNameUnique(item?.name);
    // console.log("checkrisk is hazard name unique isUniqeu", isUnique);\
    if (!isUnique) {
      enqueueSnackbar("Hazard Type with Same Name Already Exists!", {
        variant: "error",
      });
      return;
    }

    const hazard = {
      name: item?.name,
      description: item.description,
      createdBy: userDetails.id,
      organizationId: userDetails?.organizationId,
      locationId: selectedLocation?.id,
      type: "impact",
    };

    // console.log("checkrisk hazardTypesToBePosted", hazard);

    try {
      if(hazard?.name) {
        const validateName = isValid(hazard?.name);
        if(!validateName?.isValid) {
          enqueueSnackbar(`Please Enter Valid Name ${validateName?.errorMessage}`, {
            variant: "warning",
          });
          return;
        }
      }
      if(hazard?.description) {
        const validateDescription = isValid(hazard?.description);
        if(!validateDescription?.isValid) {
          enqueueSnackbar(`Please Enter Valid Description ${validateDescription?.errorMessage}`, {
            variant: "warning",
          });
          return;
      }
      }
      const response = await axios.post(
        `/api/riskconfig/createImpactType`,
        hazard
      );
      if (response.status === 200 || response.status === 201) {
        const returnedId = response.data._id;
        // Use the returnedId as needed
        const updatedHazards = impactTypes.map((type: any) => {
          if (type.name === item?.name) {
            return {
              ...type,
              isEdit: true,
              isNewEntry: false,
            };
          }
          return type;
        });
        const updatedHazardTypes = updatedHazards
          .slice()
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setImpactTypes(updatedHazardTypes);
        getAllImpactTypesByLocationId();
      }
    } catch (error) {
      // Handle any error that occurred during the request
      console.error("Error:", error);
    }
  };

  const checkIfIsMRAndBelongsToSameLocation = (row: any) => {
    const location = row?.isNewEntry
      ? selectedLocation?.locationName
      : row?.locationName;

    return isMR && location === userDetails?.location?.locationName;
  };

  const handleDescriptionChange = (event: any, hazardId: string) => {
    // console.log(
    //   "checkrisk in handleHazardNameChange event",
    //   event?.target?.value
    // );
    // console.log("checkrisk in handleHazardNameChange hazardId", hazardId);

    const updatedImpactTypes = impactTypes.map((type: any) => {
      if (type.id === hazardId) {
        return {
          ...type,
          description: event.target.value,
        };
      }
      return type;
    });
    setImpactTypes([...updatedImpactTypes]);
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
            <Autocomplete
              style={{ width: "225px", padding: "10px" }}
              options={locationOptions}
              getOptionLabel={(option) => option.locationName}
              renderOption={(option) => (
                <React.Fragment>{option.locationName}</React.Fragment>
              )}
              onChange={(event: any, newValue: any) => {
                // console.log("checkrisk newValue", newValue);

                setSelectedLocation(newValue);
              }}
              disabled={isMR}
              value={selectedLocation}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Select Unit"
                  //   required
                />
              )}
            />
          </Grid>

          <Grid item>
            {isMR || isMCOE ? (
              <Tooltip title="Add New Impact Type">
                <Button
                  className={classes.buttonColor}
                  variant="contained"
                  color="primary" // You can use a color from the theme
                  //   startIcon={<AddIcon />} // Replace with an appropriate icon
                  onClick={handleAddImpact}
                  // disabled={selectedLocation?.id === "All"}
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
          {impactTypeCount ? (
            <TableContainer>
              <Table className={classes.table}>
                <TableHead className={classes.tableHeader}>
                  <TableRow>
                    <TableCell style={{ width: "20%", paddingLeft: "30px" }}>
                      Control Type
                    </TableCell>
                    <TableCell style={{ width: "20%", paddingLeft: "30px" }}>
                      Description
                    </TableCell>
                    <TableCell style={{ width: "20%", paddingLeft: "30px" }}>
                      Unit
                    </TableCell>
                    <TableCell style={{ width: "50%" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {impactTypes.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell style={{ width: "40%" }}>
                        {item.isEdit ? (
                          <TextareaAutosize
                            aria-label="Impact name"
                            minRows={3}
                            style={{ width: "100%" }} // Adjust styling as needed
                            value={item.name}
                            placeholder="Enter Impact Name"
                            onChange={(e: any) =>
                              handleHazardNameChange(e, item.id)
                            }
                          />
                        ) : (
                          <Typography>{item.name}</Typography>
                        )}
                      </TableCell>
                      <TableCell style={{ width: "40%" }}>
                        {item.isEdit ? (
                          <TextareaAutosize
                            aria-label="description "
                            minRows={3}
                            style={{ width: "100%" }} // Adjust styling as needed
                            value={item.description}
                            placeholder="Enter Description"
                            onChange={(e: any) =>
                              handleDescriptionChange(e, item.id)
                            }
                          />
                        ) : (
                          <Typography>{item.description}</Typography>
                        )}
                      </TableCell>
                      <TableCell style={{ width: "15%" }}>
                        <Typography>
                          {item?.isNewEntry
                            ? selectedLocation?.locationName
                            : item?.locationName}
                        </Typography>
                      </TableCell>

                      <TableCell style={{ width: "10%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          {item.isEdit ? (
                            <IconButton
                              style={{ padding: 0 }}
                              onClick={() =>
                                !item.isNewEntry
                                  ? handlePutImpact(item.id, item)
                                  : handlePostImpact(item)
                              }
                            >
                              <MdCheckCircle width={18} height={18} />
                            </IconButton>
                          ) : (
                            <IconButton
                              style={{ padding: 0 }}
                              onClick={() => toggleEditState(item.id)}
                              disabled={
                                !checkIfIsMRAndBelongsToSameLocation(item) &&
                                !isMCOE
                              }
                            >
                              <CustomEditICon width={18} height={18} />
                            </IconButton>
                          )}
                          <Divider
                            type="vertical"
                            className={classes.NavDivider}
                          />
                          <IconButton
                            style={{ padding: 0 }}
                            onClick={() => handleOpen(item)}
                            disabled={
                              !checkIfIsMRAndBelongsToSameLocation(item) &&
                              !isMCOE
                            }
                          >
                            <CustomDeleteICon width={18} height={18} />
                          </IconButton>
                        </div>
                      </TableCell>
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
                Let’s begin by adding a Impact Type
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
          total={impactTypeCount}
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

export default HiraImpactTypesTab;
