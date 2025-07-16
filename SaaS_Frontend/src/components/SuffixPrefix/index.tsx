import React, { useEffect, useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Button,
  IconButton,
  Grid,
  Tooltip,
} from "@material-ui/core";
import { useStyles } from "./styles";
import { MdCheck } from 'react-icons/md';
import axios from "../../apis/axios.global";
import { useSnackbar } from "notistack";
import { useRecoilValue } from "recoil";
import { orgFormData } from "../../recoil/atom";
import { ReactComponent as AddIcon } from "../../assets/icons/SquareAddIcon.svg";
import { ReactComponent as CheckCircleIcon } from "../../assets/icons/checkIcon.svg";

const initialData = [
  // {
  //   id: 1,
  //   moduleType: "Audit Schedule",
  //   organizationId: "",
  //   suffix: [],
  //   prefix: [],
  // },
  // {
  //   id: 2,
  //   moduleType: "Audit Plan",
  //   organizationId: "",
  //   suffix: [],
  //   prefix: [],
  // },
  {
    id: 3,
    moduleType: "Audit Report",
    organizationId: "",
    suffix: [],
    prefix: [],
  },
  // {
  //   id: 4,
  //   moduleType: "Audit Findings",
  //   organizationId: "",
  //   suffix: [],
  //   prefix: [],
  // },
  // {
  //   id: 4,
  //   moduleType: "Non Conformance",
  //   organizationId: "",
  //   suffix: [],
  //   prefix: [],
  // },
  // {
  //   id: 5,
  //   moduleType: "MRM",
  //   organizationId: "",
  //   suffix: [],
  //   prefix: [],
  // },
  // {
  //   id: 6,
  //   moduleType: "OC",
  //   organizationId: "",
  //   suffix: [],
  //   prefix: [],
  // },
  {
    id: 7,
    moduleType: "CAPA",
    organizationId: "",
    suffix: [],
    prefix: [],
  },
  {
    id: 8,
    moduleType: "HIRA",
    organizationId: "",
    suffix: [],
    prefix: [],
  },

  {
    id: 9,
    moduleType: "AI",
    organizationId: "",
    suffix: [],
    prefix: [],
  },
  // {
  //   id: 10,
  //   moduleType: "CIP",
  //   organizationId: "",
  //   suffix: [],
  //   prefix: [],
  // },
];

const prefix = ["YY", "MM", "LocationId", "DepartmentId"];
const suffix = ["YY", "MM", "LocationId", "DepartmentId"];

function SuffixPrefix() {
  const classes = useStyles();
  const [formData, setFormData] = useState<any>({
    initialData: initialData, // Assign the initialData array to the initialData property
  });
  const [options, setOptions] = useState(prefix);
  const [optionsUffix, setOptionSuffix] = useState(suffix);
  const [showCustomPrefix, setShowCustomPrefix] = useState(false);
  const [showCustomSuffix, setShowCustomSuffix] = useState(false);
  const [customPrefix, setCustomPrefix] = useState("");
  const [customsuffix, setCustomSuffix] = useState("");
  const [customMenuPrefix, setCustomMenuPrefix] = useState(false);
  const [customMenuSuffix, setCustomMenuSuffix] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const orgData = useRecoilValue(orgFormData);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
      sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
      (orgData && orgData.id) ||
      undefined;
  const { enqueueSnackbar } = useSnackbar();
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  const handlePostData = (rowData: any) => {
    // Send a POST request with the row data
    axios
      .post(`/api/serial-number/createPrefixSuffix`, {
        ...rowData,
        organizationId: organizationId,
      })
      .then((response) => {
        enqueueSnackbar("Successfully Added", {
          variant: "success",
        });

        fetchAllPrefixSuffix();
        setIsEdit(true);
      })
      .catch((error) => {
        console.error("Error posting data:", error);
        // Handle error response
      });
  };

  const handleButtonClick = (id: any) => {
    const row = formData.initialData.find((row: any) => row.id === id);
    row.organizationId ? handleEditData(row) : handlePostData(row);
  };

  const handleChange = (id: any, e: any) => {
    const { name, value } = e.target;
    if (Array.isArray(formData[name])) {
      const updatedData = formData.initialData.map((row: any) =>
        row.id === id ? { ...row, [name]: Array.from(value) } : row
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        initialData: updatedData,
      }));
    } else {
      // Handle single selection
      const updatedData = formData.initialData.map((row: any) =>
        row.id === id ? { ...row, [name]: value } : row
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        initialData: updatedData,
      }));
    }
  };

  const fetchAllPrefixSuffix = () => {
    // Fetch data from the API
    axios
      .get(`/api/serial-number/getAllPrefixSuffix/${organizationId}`) // Adjust the API endpoint URL
      .then((response) => {
        const data = response.data; // Assuming the API response is an array of objects

        // Find the specific ID you want to update (e.g., assuming the ID is 'desiredId')
        const desiredId = "desiredId";
        const updatedData = data.map((item: any) => {
          if (item.id === desiredId) {
            // Extract the prefix and suffix values from the existing string
            const prefix = item.prefix.split("-")[2]; // Assuming the prefix is in the format 'YY-MM-new'
            const suffix = item.suffix.split("-")[2]; // Assuming the suffix is in the format 'LocationId-DepartmentId-good'
            const organizationId = item.organizationId;
            const id = item.id;
            return {
              ...item,
              prefix, // Update the prefix value
              suffix, // Update the suffix value
              id,
              organizationId,
            };
          }
          return item; // Keep the rest of the data unchanged for other IDs
        });

        // Update the specific properties in the form data
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          initialData: prevFormData.initialData.map((item: any) => {
            const matchingItem = updatedData.find(
              (updatedItem: any) => updatedItem.moduleType === item.moduleType
            );
            return matchingItem
              ? {
                ...item,
                id: matchingItem.id,
                organizationId: matchingItem.organizationId,
                prefix: matchingItem.prefix.split("-"),
                suffix: matchingItem.suffix.split("-"),
              }
              : item;
          }),
        }));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    fetchAllPrefixSuffix();
  }, []);

  const handleAddCustomPrefix = (rowId: any, event: any) => {
    if (customPrefix !== "" && !customMenuPrefix) {
      setOptions((prevOptions) => [...prevOptions, customPrefix]);

      const updatedData = formData.initialData.map((obj: any) => {
        if (obj.id === rowId) {
          return {
            ...obj,
            showCustomPrefix: false,
            customMenuPrefix: true,
            prefix: [...obj.prefix, customPrefix],
          };
        }
        return obj;
      });

      setFormData((prevFormData: any) => ({
        ...prevFormData,
        initialData: updatedData,
      }));

      setShowCustomPrefix(false);
      setCustomMenuPrefix(true);
      setCustomPrefix("");
    }
  };

  const handleAddCustomSuffix = (rowId: any, event: any) => {
    if (customsuffix !== "" && !customMenuSuffix) {
      setOptionSuffix((prevOptions) => [...prevOptions, customsuffix]);
      const updatedData = formData.initialData.map((obj: any) => {
        if (obj.id === rowId) {
          return {
            ...obj,
            showCustomSuffix: false,
            customMenuSuffix: true,
            suffix: [...obj.suffix, customsuffix],
          };
        }
        return obj;
      });
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        initialData: updatedData,
      }));
      setShowCustomSuffix(false);
      setCustomMenuSuffix(true);
      setCustomSuffix("");
    }
  };

  const handleEditData = (updatedData: any) => {
    // Send a Put request with the row data
    axios
      .put(`/api/serial-number/updatePrefixSuffix/${updatedData.id}`, {
        ...updatedData,
        updatedData,
      })
      .then((response) => {
        // Handle success response
        enqueueSnackbar(`${updatedData.moduleType} updated Successfully`, {
          variant: "success",
        });
        setIsEdit(false);
      })
      .catch((error) => {
        console.error("Error Editing data:", error);
        // Handle error response
      });
  };

  const handleEditCustomPrefix = (rowId: any) => {
    const updatedData = formData.initialData.map((obj: any) => {
      if (obj.id === rowId) {
        return {
          ...obj,
          showCustomPrefix: true,
          customMenuPrefix: false,
        };
      }
      return obj;
    });

    setFormData({
      ...formData,
      initialData: updatedData,
    });

    setShowCustomPrefix(true);
    setCustomMenuPrefix(false);
  };

  const handleEditCustomSuffix = (rowId: any) => {
    const updatedData = formData.initialData.map((obj: any) => {
      if (obj.id === rowId) {
        return {
          ...obj,
          showCustomSuffix: true,
          customMenuSuffix: false,
        };
      }
      return obj;
    });

    setFormData({
      ...formData,
      initialData: updatedData,
    });
    setShowCustomSuffix(true);
    setCustomMenuSuffix(false);
  };

  return (
    <>
      <TableContainer style={{ overflow: "visible", paddingTop: "20px" }}>
        <Table>
          <TableHead
            style={{ height: "50px", borderRadius: "30px", color: "black" }}
          >
            <TableRow>
              <TableCell className={classes.colHead} align="center" width={20}>
                Format
              </TableCell>
              <TableCell className={classes.colHead} align="center" width={20}>
                Numbering Type
              </TableCell>
              <TableCell className={classes.colHead} align="center" width={200}>
                Prefix
              </TableCell>
              <TableCell className={classes.colHead} align="center" width={200}>
                Suffix
              </TableCell>
              <TableCell className={classes.colHead} align="center" width={5}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.initialData.map((obj: any) => (
              <TableRow key={obj.id} className={classes.dataRow}>
                <TableCell className={classes.cell} align="center">
                  {obj.moduleType}
                </TableCell>
                <TableCell className={classes.cell} align="center">
                  Serial
                </TableCell>

                <TableCell className={classes.cell} align="center">
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                    fullWidth
                  >
                    {/* Prefix section */}
                    {/* <InputLabel>Prefix</InputLabel> */}
                    <Grid item>
                      <Select
                        required
                        name="prefix"
                        style={{
                          fontSize: "14px",
                          height: "50px",
                          minWidth: "80%",
                        }}
                        // data-testid="prefix-select"
                        multiple
                        renderValue={(val) => {
                          return (val as string[]).join("-");
                        }}
                        value={obj.prefix ? obj.prefix : []}
                        onChange={(e) => handleChange(obj.id, e)}
                      >
                        {obj.moduleType === "Audit Report" ? (
                          [...options, "AuditTypeId"].map((item: any, i: number) => (
                            <MenuItem key={i} value={item}>
                              {item}
                            </MenuItem>
                          ))
                        ) : obj.moduleType === "Audit Findings" ? (
                          [...options, "AuditTypeId", "FindingsId"].map((item: any, i: number) => (
                            <MenuItem key={i} value={item}>
                              {item}
                            </MenuItem>
                          ))
                        ) : (
                          options.map((item: any, i: number) => (
                            <MenuItem key={i} value={item}>
                              {item}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {!obj.showCustomPrefix && (
                        <Tooltip title="Add Custom Prefix">
                          <Button
                            size="small"
                            onClick={() => handleEditCustomPrefix(obj.id)}
                          >
                            <AddIcon />
                          </Button>
                        </Tooltip>
                      )}
                      {obj.showCustomPrefix && (
                        <TextField
                          key={`customPrefix-${obj.id}`}
                          placeholder="Enter custom prefix"
                          value={customPrefix}
                          onChange={(e) => setCustomPrefix(e.target.value)}
                          style={{ minWidth: "80%" }}
                          margin="normal"
                          InputProps={{
                            style: { fontSize: "14px", height: "50px" },
                            endAdornment: (
                              <Tooltip title="Add Custom Prefix">
                                <IconButton
                                  aria-label="Save"
                                  onClick={(e) =>
                                    handleAddCustomPrefix(obj.id, e.target)
                                  }
                                >
                                  <MdCheck />
                                </IconButton>
                              </Tooltip>
                            ),
                          }}
                        />
                      )}
                    </Grid>
                  </FormControl>
                </TableCell>
                <TableCell className={classes.cell} align="center">
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                    fullWidth
                  >
                    {/* Suffix section */}
                    {/* <InputLabel>Suffix</InputLabel> */}
                    <Grid item>
                      <Select
                        required
                        name="suffix"
                        data-testid="suffix-select"
                        style={{
                          fontSize: "14px",
                          height: "50px",
                          minWidth: "80%",
                        }}
                        multiple
                        renderValue={(val) => {
                          return (val as string[]).join("-");
                        }}
                        value={Array.isArray(obj.suffix) ? obj.suffix : []}
                        onChange={(e) => handleChange(obj.id, e)}
                      >
                        {obj.moduleType === "Audit Report" ? (
                          [...optionsUffix, "AuditTypeId"].map((item: any, i: number) => (
                            <MenuItem key={i} value={item}>
                              {item}
                            </MenuItem>
                          ))
                        ) : obj.moduleType === "Audit Findings" ? (
                          [...optionsUffix, "AuditTypeId", "FindingsId"].map((item: any, i: number) => (
                            <MenuItem key={i} value={item}>
                              {item}
                            </MenuItem>
                          ))
                        ) : (
                          optionsUffix.map((item: any, i: number) => (
                            <MenuItem key={i} value={item}>
                              {item}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {!obj.showCustomSuffix && (
                        <Tooltip title="Add Custom Suffix">
                          <Button
                            // variant="contained"
                            // color="primary"
                            size="small"
                            onClick={() => handleEditCustomSuffix(obj.id)}
                          >
                            <AddIcon />
                          </Button>
                        </Tooltip>
                      )}
                      {obj.showCustomSuffix && (
                        <TextField
                          key={`customSuffix-${obj.id}`}
                          placeholder="Enter custom suffix"
                          value={customsuffix}
                          style={{ minWidth: "80%" }}
                          onChange={(e) => setCustomSuffix(e.target.value)}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            endAdornment: (
                              <Tooltip title="Add Custom Suffix">
                                <IconButton
                                  aria-label="Save"
                                  onClick={(e) =>
                                    handleAddCustomSuffix(obj.id, e.target)
                                  }
                                >
                                  <MdCheck />
                                </IconButton>
                              </Tooltip>
                            ),
                          }}
                        />
                      )}
                    </Grid>
                  </FormControl>
                </TableCell>
                <TableCell className={classes.cell} align="center">
                  <Tooltip title="Submit">
                    <IconButton
                      onClick={() => handleButtonClick(obj.id)}
                      style={{ padding: "0px" }}
                    >
                      <CheckCircleIcon width={24} height={24} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default SuffixPrefix;
