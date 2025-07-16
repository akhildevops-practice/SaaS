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
  Tooltip,
  TableHead,
  InputBase,
  useMediaQuery,
} from "@material-ui/core";
import useStyles from "./styles";
import { MdCheckCircle } from 'react-icons/md';
import axios from "apis/axios.global";
import { roles } from "utils/enums";
import { useRecoilValue } from "recoil";
import { orgFormData } from "recoil/atom";
import checkRoles from "utils/checkRoles";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import {
  Divider,
  Form,
  Modal,
  Select,
  Switch,
  Upload,
  UploadProps,
} from "antd";
import { MdPublish } from 'react-icons/md';
import { API_LINK } from "config";
import { MdInbox } from 'react-icons/md';
import { useSnackbar } from "notistack";
import { MdGetApp } from 'react-icons/md';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ConfirmDialog from "components/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import {
  isValid,
  validateMasterNames,
} from "utils/validateInput";

interface BusinessType {
  id: number;
  name: string;
  businesses: Business[];
  organizationId: string;
  createdBy: string;
  //used to change icons
  isSubmitted: boolean;
  isEdit: boolean;
  //used for icon functionality(post/put)
  isFirstSubmit: boolean;
}
interface Business {
  id: number;
  name: string;
  organizationId?: string;
  isSubmitted?: boolean;
  isEdit?: boolean;
}

interface FunctionsType {
  id: any;
  name: string;
  organizationId: string;
  createdBy: string;
  //used to change icons
  isSubmitted: boolean;
  isEdit: boolean;
  type: boolean;
  //used for icon functionality(post/put)
  isFirstSubmit: boolean;
  functionId: string;
  functionHead: [];
  functionSpoc: [];
}

const FunctionsSetting: React.FC = () => {
  const matches = useMediaQuery("(min-width:822px)");
  const [functionTypes, setFunctionTypes] = useState<FunctionsType[]>([]);
  const [allUser, setAllUser] = useState([]);
  const orgData = useRecoilValue(orgFormData);
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const classes = useStyles();
  const isMR = checkRoles(roles.MR);
  const [data, setData] = useState({
    functioName: "",
    functionId: "",
    functionHead: [],
    functionSpoc: [],
  });
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const accessRight = isOrgAdmin ? true : false;
  const [importFunctionModel, setImportFunctionModel] = useState<any>({
    open: false,
  });
  const [fileList, setFileList] = useState<any>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [deleteLoc, setDeleteLoc] = useState<any>();
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
    allUsers();
    getAllFunctions();
  }, []);

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteLoc(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const allUsers = async () => {
    try {
      const response = await axios.get(`api/business/getAllUser`);
      const data = response?.data?.map((value: any) => {
        return { value: value.id, label: value.email, avatar: value.avatar };
      });
      setAllUser(data);
    } catch (err) {
      console.log("err", err);
    }
  };

  const exportFunctions = async () => {
    let requiredData: any[] = [];
    if (functionTypes.length === 0) {
      requiredData = [
        { FunctionName: "Function1" },
        { FunctionName: "Function2" },
        {
          FunctionName:
            "Required (IGNORE THIS ROW WHEN CREATING FUNCTION IMPORT)",
        },
      ];
    } else {
      for (const element of functionTypes) {
        requiredData.push({ FunctionName: element.name });
      }
    }
    const sheet = XLSX.utils.json_to_sheet(requiredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Functions");
    const excelBinaryString = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });
    const blob = new Blob([s2ab(excelBinaryString)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    if (functionTypes.length === 0) saveAs(blob, "FunctionsTemplate.xlsx");
    else {
      saveAs(blob, "Functions.xlsx");
    }
  };

  const importFunctions = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileList[0].originFileObj);
      formData.append("createdBy", userDetails.userName);
      formData.append("organizationId", organizationId);
      const response = await axios.post(
        `${API_LINK}/api/business/importFunction`,
        formData
      );
      if (response.data) {
        const requiredData = [
          { FunctionName: "Function1" },
          { FunctionName: "Function2" },
          {
            FunctionName:
              "Required (IGNORE THIS ROW WHEN CREATING FUNCTION IMPORT)",
          },
        ];
        const sheet = XLSX.utils.json_to_sheet(requiredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, "Functions");
        const excelBinaryString = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "binary",
        });
        const blob = new Blob([s2ab(excelBinaryString)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, "FunctionsTemplate.xlsx");
        enqueueSnackbar(`Wrong Template Please View FunctionsTemplate`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar(`Functions Successfully Imported`, {
          variant: "success",
        });
      }
      getAllFunctions();
    } catch (error) {
      console.log("error in uploading attachments", error);
    }
  };

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const uploadProps: UploadProps = {
    multiple: false, // Set to true to allow multiple file uploads
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFileList(fileList); // Set the entire file list instead of a single file
      }
    },
    onRemove: (file) => {
      // if (!!existingFiles && existingFiles.length > 0) {
      //   setExistingFiles((prevState: any) =>
      //     prevState.filter((f: any) => f.uid !== file.uid)
      //   ); // Update the existingFiles state to remove the specific fil
      // }
      setFileList((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      ); // Remove the specific file from the list
    },
    // fileList: formData?.file && formData.file.uid ? [formData.file] : [],
  };

  const handleAddFunction = async () => {
    // Create a new Function type object
    const newFunction: FunctionsType = {
      id: generateUniqueId(10),
      name: "",
      organizationId: "",
      createdBy: "",
      isSubmitted: true,
      isEdit: false,
      isFirstSubmit: true,
      type: false,
      functionId: "",
      functionHead: [],
      functionSpoc: [],
    };
    setFunctionTypes([newFunction, ...functionTypes]);
  };

  // const isFunctionNameUnique = (name: any) => {

  //   return !functionTypes.some((type) => type.name === name);
  // };

  const isFunctionNameUnique = (name: any) => {
    return !functionTypes.some((type) => {
      console.log(
        "uniqueName",
        functionTypes,
        name,
        typeof type.id !== "number" && type.name === name
      );
      // Check if type.id is a number and type.name matches the given name
      return typeof type.id !== "number" && type.name === name;
    });
  };

  const handleFunctionTypeSubmit = async (id: any) => {
    // Provide a default value of an empty object if null

    const dataToSubmit = functionTypes.filter((value) => value.id === id);
    // if (isUnique !== true) {
    //   enqueueSnackbar("Function already exists!", {
    //     variant: "error",
    //   });
    //   return;
    // }

    const validateFunctinName = await isValid(dataToSubmit[0]?.name);
    const validatefunctionId = await isValid(dataToSubmit[0]?.functionId);

    if (validateFunctinName.isValid === false) {
      enqueueSnackbar(`Function Name${validateFunctinName?.errorMessage}`, {
        variant: "error",
      });
      return;
    }

    if (validatefunctionId.isValid === false) {
      enqueueSnackbar(`Function Id ${validatefunctionId?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
    if (dataToSubmit[0]?.name === "" || dataToSubmit[0]?.functionId === "") {
      enqueueSnackbar("Please Fill Function Name and FunctionId", {
        variant: "error",
      });
      return;
    }

    const functiontype = {
      name: dataToSubmit[0]?.name.trim(),
      createdBy: userDetails.userName,
      organizationId: organizationId,
      functionId: dataToSubmit[0]?.functionId.trim(),
      functionHead: dataToSubmit[0]?.functionHead,
      functionSpoc: dataToSubmit[0]?.functionSpoc,
      type: dataToSubmit[0]?.type,
    };
    try {
      const response = await axios.post(
        `/api/business/createFunction`,
        functiontype
      );
      //console.log("response in post function", response);
      if (response?.data?.status === 409) {
        const response = await axios.get(`api/globalsearch/getRecycleBinList`);
        const data = response?.data;
        const entityDocuments = data.find(
          (item: any) => item.type === "Functions"
        );

        // If there are entity documents
        if (entityDocuments) {
          // Check if the name already exists
          const existingEntity = entityDocuments.documents.find(
            (doc: any) => doc.name === functiontype?.name
          );

          // Return true if the name exists, otherwise false
          if (existingEntity) {
            enqueueSnackbar(
              `Function with the same name already exists, please check in Recycle bin and Restore if required`,
              {
                variant: "error",
              }
            );
            // navigate("/master", { state: { redirectToTab: "Recycle Bin" } });
          } else {
            // console.log("inside else");
            enqueueSnackbar(
              `Function with the same name already exists,
              Please choose other name`,
              {
                variant: "error",
              }
            );
          }
        }
      }
      const returnedId = response.data.funid;
      // Use the returnedId as needed
      const updatedFunctionTypes = functionTypes.map((type) => {
        if (type.name === dataToSubmit[0]?.name) {
          return {
            ...type,
            functionId: dataToSubmit[0]?.name,
            functionHead: dataToSubmit[0]?.functionHead,
            functionSpoc: dataToSubmit[0]?.functionSpoc,
            type: dataToSubmit[0]?.type,
            isSubmitted: false,
            isEdit: true,
            isFirstSubmit: false,
          };
        }
        return type;
      });
      const sortedFunctions = updatedFunctionTypes
        .slice()
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setFunctionTypes(updatedFunctionTypes);
      getAllFunctions();
    } catch (error: any) {
      // Handle any error that occurred during the request
      if (error.response.status === 409) {
        // const response = await axios.get(
        //   `api/globalsearch/getRecycleBinList`
        // );
        // const data = response?.data;
        // console.log("data", data);
        // navigate("/master", { state: { redirectToTab: "Recycle Bin" } });
      } else {
        enqueueSnackbar(`Request Failed, Code: ${error.response.status}`, {
          variant: "error",
        });
      }
    }
  };

  const getAllFunctions = async () => {
    try {
      const response = await axios.get(
        `/api/business/getAllFunctionsByOrgId/${organizationId}`
      );
      const functionsResult = response.data;
      const sortedFunctions = functionsResult
        .slice()
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setFunctionTypes(sortedFunctions);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEditFunctionType = async (
    functionTypeId: number,
    functionTypeName: string
  ) => {
    const dataToSubmit = functionTypes.filter(
      (value) => value.id === functionTypeId
    );
    // if (isUnique !== true) {
    //   enqueueSnackbar("Function already exists!", {
    //     variant: "error",
    //   });
    //   return;
    // }
    const validateFunctinName = await isValid(dataToSubmit[0]?.name);
    const validatefunctionId = await isValid(dataToSubmit[0]?.functionId);

    if (validateFunctinName.isValid === false) {
      enqueueSnackbar(`Function Name ${validateFunctinName?.errorMessage}`, {
        variant: "error",
      });
      return;
    }

    if (validatefunctionId.isValid === false) {
      enqueueSnackbar(`Function Id ${validatefunctionId?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
    if (dataToSubmit[0]?.name === "" || dataToSubmit[0]?.functionId === "") {
      enqueueSnackbar("Please Fill Function Name and FunctionId", {
        variant: "error",
      });
      return;
    }

    const functiontype = {
      name: dataToSubmit[0]?.name.trim(),
      createdBy: userDetails.userName,
      organizationId: organizationId,
      functionId: dataToSubmit[0]?.functionId.trim(),
      functionHead: dataToSubmit[0]?.functionHead,
      functionSpoc: dataToSubmit[0]?.functionSpoc,
      type: dataToSubmit[0]?.type,
    };
    try {
      const response = await axios.put(
        `/api/business/updateFunctionById/${functionTypeId}`,
        functiontype
      );

      const updatedFunctionTypes = functionTypes.map((type) => {
        if (type.id === functionTypeId) {
          return {
            ...type,
            name: functionTypeName,
            isEdit: true,
            isSubmitted: false,
            isFirstSubmit: false,
          };
        }
        return type;
      });
      const sortedFunctions = updatedFunctionTypes
        .slice()
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setFunctionTypes(sortedFunctions);
      getAllFunctions();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteFunctionType = async () => {
    try {
      await axios.delete(`/api/business/deleteFunctionById/${deleteLoc.id}`);

      const updatedFunctionTypes = functionTypes.filter(
        (type) => type.id !== deleteLoc?.id
      );
      const sortedFunctions = updatedFunctionTypes
        .slice()
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setFunctionTypes(sortedFunctions);
      getAllFunctions();
      handleClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (name: any, value: any) => {};

  const handleFunctionTypeNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    functionTypeId: number
  ) => {
    const updatedFunctionTypes = functionTypes.map((type) => {
      if (type.id === functionTypeId) {
        return {
          ...type,
          name: event.target.value,
        };
      }
      return type;
    });
    setFunctionTypes(updatedFunctionTypes);
    // const sortedFunctions = updatedFunctionTypes
    //   .slice()
    //   .sort((a: any, b: any) => a.name.localeCompare(b.name));
    // setFunctionTypes(sortedFunctions);
  };

  const updateFunctionTypeById = (id: string, name: string, value: any) => {
    if (name === "name" || name === "functionId") {
      validateMasterNames(null, value, (error?: string) => {
        if (error) {
          enqueueSnackbar(`${error}`, { variant: "error" });
          return;
        } else {
          setFunctionTypes((prevFunctionTypes) => {
            return prevFunctionTypes.map((funcType) => {
              if (funcType.id === id) {
                return { ...funcType, [name]: value };
              }
              return funcType;
            });
          });
        }
      });
    } else {
      setFunctionTypes((prevFunctionTypes) => {
        return prevFunctionTypes.map((funcType) => {
          if (funcType.id === id) {
            return { ...funcType, [name]: value };
          }
          return funcType;
        });
      });
    }
  };

  const handleChangeFunctionIcon = async (functionTypeId: number) => {
    const updatedFunctionTypes = functionTypes.map((type) => {
      if (type.id === functionTypeId) {
        return {
          ...type,
          isEdit: false,
          isSubmitted: true,
        };
      }
      return type;
    });
    const sortedFunctions = updatedFunctionTypes
      .slice()
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
    setFunctionTypes(sortedFunctions);
  };
  return (
    <>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDeleteFunctionType}
      />

      <div className={classes.root}>
        {accessRight && (
          <div className={classes.labelContainer}>
            <div className={classes.tableLabel}>
              {isOrgAdmin && matches && (
                <Tooltip title="Export Functions">
                  <MdGetApp
                    onClick={exportFunctions}
                    style={{
                      position: "relative",
                      top: "5px",
                      right: "15px",
                      fontSize: "30px",
                      color: "#0E497A",
                    }}
                  />
                </Tooltip>
              )}
              {isOrgAdmin && matches && (
                <Tooltip title="Import Functions">
                  <MdPublish
                    onClick={() => setImportFunctionModel({ open: true })}
                    style={{
                      position: "relative",
                      top: "3px",
                      right: "10px",
                      fontSize: "30px",
                      color: "#0E497A",
                    }}
                  />
                </Tooltip>
              )}
              {importFunctionModel.open && (
                <Modal
                  title="Import Functions"
                  open={importFunctionModel.open}
                  onCancel={() => setImportFunctionModel({ open: false })}
                  onOk={() => {
                    importFunctions();
                    setImportFunctionModel({ open: false });
                  }}
                >
                  <Form.Item name="attachments" label={"Attach File: "}>
                    <Upload
                      name="attachments"
                      {...uploadProps}
                      className={classes.buttonColor}
                      fileList={fileList}
                    >
                      <p className="ant-upload-drag-icon">
                        <MdInbox />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag file to this area to upload
                      </p>
                    </Upload>
                  </Form.Item>
                </Modal>
              )}
              {isOrgAdmin && matches && (
                <Button
                  className={classes.buttonColor}
                  variant="contained"
                  style={{ backgroundColor: "#003059", color: "white" }}
                  // startIcon={<AddIcon />}
                  onClick={handleAddFunction}
                  disabled={functionTypes.some(
                    (type) => type.isEdit && type.isSubmitted
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
                  <TableCell style={{ width: "20%", paddingLeft: "30px" }}>
                    Function
                  </TableCell>

                  <TableCell style={{ width: "20%", paddingLeft: "30px" }}>
                    Function Id
                  </TableCell>

                  <TableCell style={{ width: "10%", paddingLeft: "20px" }}>
                    Is Corporate Function
                  </TableCell>

                  <TableCell style={{ width: "20%", paddingLeft: "30px" }}>
                    Function Head
                  </TableCell>

                  <TableCell style={{ width: "20%", paddingLeft: "30px" }}>
                    Function SPOC
                  </TableCell>

                  <TableCell style={{ width: "50%" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {functionTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <InputBase
                        placeholder="Function"
                        id="standard-basic"
                        // variant="outlined"
                        fullWidth
                        style={{
                          width: "123%",
                          paddingTop: "4px",
                          paddingBottom: "4px",
                          paddingLeft: "10px",
                          borderRadius: "30px",
                          backgroundColor: "white",
                          color: "black",
                        }}
                        inputProps={{ "aria-label": "naked", maxLength: 100 }}
                        value={type.name}
                        disabled={
                          !type.isSubmitted || (type.isSubmitted && type.isEdit)
                        }
                        onChange={(e: any) =>
                          updateFunctionTypeById(
                            type.id,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <InputBase
                        placeholder="Function"
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
                        inputProps={{
                          "aria-label": "naked",
                          maxLength: 4, // Set maximum character limit to 4
                        }}
                        value={type.functionId}
                        disabled={
                          !type.isSubmitted || (type.isSubmitted && type.isEdit)
                        }
                        onChange={(e: any) =>
                          updateFunctionTypeById(
                            type.id,
                            "functionId",
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <Switch
                        checked={type?.type || false}
                        disabled={
                          !type.isSubmitted || (type.isSubmitted && type.isEdit)
                        }
                        onChange={() =>
                          updateFunctionTypeById(type.id, "type", !type.type)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        mode="multiple"
                        size={"middle"}
                        placeholder="Please select"
                        // defaultValue={["example1"]}
                        disabled={
                          !type.isSubmitted || (type.isSubmitted && type.isEdit)
                        }
                        onChange={(value: any, test: any) => {
                          updateFunctionTypeById(
                            type.id,
                            "functionHead",
                            value
                          );
                        }}
                        value={type.functionHead || []}
                        style={{ width: "100%" }}
                        maxTagCount={"responsive"}
                        filterOption={(input, option) => {
                          return (
                            option.label
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0 ||
                            option.value
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          );
                        }}
                        options={allUser}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        mode="multiple"
                        size={"middle"}
                        placeholder="Please select"
                        disabled={
                          !type.isSubmitted || (type.isSubmitted && type.isEdit)
                        }
                        // defaultValue={["example1"]}
                        onChange={(value: any, test: any) => {
                          updateFunctionTypeById(
                            type.id,
                            "functionSpoc",
                            value
                          );
                        }}
                        value={type.functionSpoc || []}
                        style={{ width: "100%" }}
                        // maxTagCount={"responsive"}

                        options={allUser}
                        filterOption={(input, option) => {
                          return (
                            option.label
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0 ||
                            option.value
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          );
                        }}
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
                                onClick={() =>
                                  handleChangeFunctionIcon(type.id)
                                }
                                disabled={!accessRight}
                              >
                                <CustomEditICon width={18} height={18} />
                              </IconButton>
                            ) : (
                              <IconButton
                                style={{ padding: 0 }}
                                onClick={() =>
                                  !type.isFirstSubmit
                                    ? handleEditFunctionType(type.id, type.name)
                                    : handleFunctionTypeSubmit(type.id)
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
        </Paper>
      </div>
    </>
  );
};

export default FunctionsSetting;
