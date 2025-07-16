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
  Select, MenuItem, FormControl, InputLabel
} from "@material-ui/core";
import useStyles from "./styles";
import { MdCheckCircle } from 'react-icons/md';
import { roles } from "utils/enums";
import { useRecoilValue } from "recoil";
import { orgFormData } from "recoil/atom";
import checkRoles from "utils/checkRoles";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { Divider } from "antd";
import { useSnackbar } from "notistack";
import ConfirmDialog from "components/ConfirmDialog";


const HiraTypesTab = () => {
  const [hazards, setHazards] = useState<any>([]);
  const orgData = useRecoilValue(orgFormData);
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const classes = useStyles();
  const isMR = checkRoles(roles.MR);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const accessRight = isOrgAdmin ? true : false;
  const [importFunctionModel, setImportFunctionModel] = useState<any>({
    open: false,
  });
  const [fileList, setFileList] = useState<any>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [deleteLoc, setDeleteLoc] = useState<any>();

  const [unit, setSelectedUnit] = useState<any>('');
  const [formType, setSelectedFormType] = useState<any>('');


  // Assign "orgId" from sessionStorage if it exists
  // Otherwise it assigns the value of orgData.organizationId or orgData.id if either exists
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  useEffect(() => {
    // getAllFunctions();
  }, []);

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteLoc(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUnitSelect = (event:any) => {
    setSelectedUnit(event.target.value);
  };

  const handleFormTypeSelect = (event:any) => {
    setSelectedFormType(event.target.value);
  };



  const handleAddHazard = async () => {
    // Create a new Function type object
    const newHazard: any = {
      id: hazards.length + 1,
      name: "",
      organizationId: "",
      createdBy: "",
      isEdit: false,
      isNewEntry: true,
    };
    setHazards([newHazard, ...hazards]);
  };


  const isHazardNameUnique = (name: any) => {
    return !hazards.some((item:any) => {
    //   console.log(
    //     "uniqueName",
    //     hazards,
    //     name,
    //     typeof item.id !== "number" && item.name === name
    //   );
      // Check if type.id is a number and type.name matches the given name
      return typeof item.id !== "number" && item.name === name;
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

  const handlePutHazard = async (
    hazardId: number,
    hazardName: string
  ) => {
    // try {
    //   const response = await axios.put(
    //     `/api/business/updateFunctionById/${hazardId}`,
    //     {
    //       name: hazardName,
    //     }
    //   );

    //   const updatedHazards = hazards.map((item:any) => {
    //     if (item.id === hazardId) {
    //       return {
    //         ...item,
    //         name: hazardName,
    //         isEdit: true,
    //         // isSubmitted: false,
    //         isNewEntry: false,
    //       };
    //     }
    //     return item;
    //   });
    //   const sortedHazards = updatedHazards
    //     .slice()
    //     .sort((a: any, b: any) => a.name.localeCompare(b.name));
    //   setHazards(sortedHazards);
    // } catch (error) {
    //   console.error("Error:", error);
    // }
  };

  const handleDeleteHazard = async () => {
    // try {
    //   await axios.delete(`/api/business/deleteFunctionById/${deleteLoc.id}`);

    //   const updatedFunctionTypes = functionTypes.filter(
    //     (type) => type.id !== deleteLoc?.id
    //   );
    //   const sortedFunctions = updatedFunctionTypes
    //     .slice()
    //     .sort((a: any, b: any) => a.name.localeCompare(b.name));
    //   setFunctionTypes(sortedFunctions);
    //   getAllFunctions();
    //   handleClose();
    // } catch (error) {
    //   console.error("Error:", error);
    // }
  };
  const handleHazardNameChange = (
    event: any,
    hazardId: string
  ) => {
    // const updatedFunctionTypes = functionTypes.map((type) => {
    //   if (type.id === functionTypeId) {
    //     return {
    //       ...type,
    //       name: event.target.value,
    //     };
    //   }
    //   return type;
    // });
    // setFunctionTypes(updatedFunctionTypes);
  };

  const handleEditClick = async (hazardId: number) => {
    const updatedHazards = hazards.map((item :any) => {
      if (item.id === hazardId) {
        return {
          ...item,
          isEdit: false,
        //   isSubmitted: true,
        };
      }
      return item;
    });
    const sortedHazards = updatedHazards
      .slice()
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
    setHazards(sortedHazards);
  };

  const handlePostHazard = async (hazardName: string) => {
    // Provide a default value of an empty object if null
    // console.log("checkrisk hazardName", hazardName);
    const isUnique = isHazardNameUnique(hazardName);

    console.log("unique", isUnique !== true);
    if (isUnique !== true) {
      enqueueSnackbar("Function already exists!", {
        variant: "error",
      });
      return;
    }

    const hazard = {
      name: hazardName,
      createdBy: userDetails.userName,
      organizationId: organizationId,
    };
    // try {
    //   const response = await axios.post(
    //     `/api/business/createFunction`,
    //     functiontype
    //   );
    //   const returnedId = response.data.funid;
    //   // Use the returnedId as needed
    //   const updatedFunctionTypes = functionTypes.map((type) => {
    //     if (type.name === functionTypeName) {
    //       return {
    //         ...type,
    //         isSubmitted: false,
    //         isEdit: true,
    //         isFirstSubmit: false,
    //       };
    //     }
    //     return type;
    //   });
    //   const sortedFunctions = updatedFunctionTypes
    //     .slice()
    //     .sort((a: any, b: any) => a.name.localeCompare(b.name));
    //   setFunctionTypes(updatedFunctionTypes);
    //   getAllFunctions();
    // } catch (error) {
    //   // Handle any error that occurred during the request
    //   console.error("Error:", error);
    // }
  };

  return (
    <>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDeleteHazard}
      />

      <div className={classes.root}>
        <div className={classes.labelContainer}>
          <div className={classes.tableLabel}>
               {/* First select */}
            <FormControl variant="outlined" className={classes.selectFormControl}>
              <InputLabel id="demo-simple-select-outlined-label">Select Unit</InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={unit}
                onChange={handleUnitSelect}
                label="Select Unit"
                defaultValue={"option1"}
              >
                <MenuItem value={"option1"}>Option 1</MenuItem>
                <MenuItem value={"option2"}>Option 2</MenuItem>
              </Select>
            </FormControl>

            {/* Second select */}
            <FormControl variant="outlined" className={classes.selectFormControl}>
              <InputLabel id="demo-simple-select-outlined-label-2">Select Type</InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label-2"
                id="demo-simple-select-outlined-2"
                value={formType}
                onChange={handleFormTypeSelect}
                label="Select Type"
                
                defaultValue={"Hazard"}
              >
                <MenuItem value={"Hazard"}>Hazard</MenuItem>
                <MenuItem value={"Impact"}>Impact</MenuItem>
              </Select>
            </FormControl>
            {(isMR || isOrgAdmin) && (
              <Button
                className={classes.buttonColor}
                variant="contained"
                style={{ backgroundColor: "#003059", color: "white" }}
                // startIcon={<AddIcon />}
                onClick={handleAddHazard}
                // disabled={hazards.some(
                //   (type) => type.isEdit && type.isSubmitted
                // )}
              >
                Create
              </Button>
            )}
          </div>
        </div>

        <Paper className={classes.paper}>
          <TableContainer>
            <Table className={classes.table}>
              <TableHead className={classes.tableHeader}>
                <TableRow>
                  <TableCell style={{ width: "20%", paddingLeft: "30px" }}>
                    Hazards
                  </TableCell>
                  <TableCell style={{ width: "50%" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hazards.map((item : any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <InputBase
                        placeholder="Hazard Name"
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
                        value={item.name}
                        onChange={(e: any) =>
                          handleHazardNameChange(e, item.id)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <>
                        <>
                          {item.isEdit ? (
                            <IconButton
                              style={{ padding: 0 }}
                              onClick={() => handleEditClick(item.id)}
                            //   disabled={!accessRight}
                            >
                              <CustomEditICon width={18} height={18} />
                            </IconButton>
                          ) : (
                            <IconButton
                              style={{ padding: 0 }}
                              onClick={() =>
                                !item.isNewEntry
                                  ? handlePutHazard(item.id, item.name)
                                  : handlePostHazard(item.name)
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
                          onClick={() => {
                            handleOpen(item);
                          }}
                        >
                          <CustomDeleteICon width={18} height={18} />
                        </IconButton>
                      </>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    </>
  );
};

export default HiraTypesTab;
