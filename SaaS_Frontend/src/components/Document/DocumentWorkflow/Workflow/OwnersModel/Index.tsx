import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Select,
  MenuItem,
  IconButton,
  Box,
  Typography,
  Input,
  Checkbox,
  TextField,
  Divider,
} from "@material-ui/core";
import { MdDelete } from "react-icons/md";
import axios from "apis/axios.global";
import { Autocomplete } from "@material-ui/lab";

const ownerTypes = [
  "Named Users",
  "PIC Of",
  "Head Of",
  "Manager Of",
  "User Of",
  "Global Role Of",
  //"From Workflow",
];

const OwnersTable = ({
  allUsers,
  allEntityTypes,
  allGlobalRoles,
  ownerSettings,
  setOwnerSettings,
  handleOwnerSettings,
}: any) => {
  const [departmentOptions, setDepartmentOptions] = useState<any>({});

  useEffect(() => {
    ownerSettings.forEach((group: any[], orIndex: number) => {
      group.forEach((owner: any, andIndex: number) => {
        const entityTypeId = owner.selectedEntityType;
        const key = `${orIndex}-${andIndex}`;

        if (
          entityTypeId &&
          ["PIC Of", "Head Of", "Manager Of", "User Of"].includes(owner.type) &&
          !departmentOptions[key]
        ) {
          getDepartments(entityTypeId, orIndex, andIndex);
        }
      });
    });
  }, [ownerSettings]);

  const getDepartments = async (
    entityTypeId: string,
    orIndex: number,
    andIndex: number
  ) => {
    try {
      const res = await axios.get(
        `/api/entity/getEntitysForEntityType/${entityTypeId}`
      );

      const options = (res.data || []).map((item: any) => ({
        id: item.id,
        name: item.entityName,
      }));
      options.unshift({
        id: "From Creator's Organization",
        name: "From Creator's Organization",
      });

      setDepartmentOptions((prev: any) => ({
        ...prev,
        [`${orIndex}-${andIndex}`]: options,
      }));
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setDepartmentOptions((prev: any) => ({
        ...prev,
        [`${orIndex}-${andIndex}`]: [],
      }));
    }
  };

  const handleChange = (
    orIndex: number,
    andIndex: number,
    field: string,
    value: any
  ) => {
    const updated = [...ownerSettings];
    const owner = { ...updated[orIndex][andIndex], [field]: value };

    if (field === "type") {
      delete owner.selectedUsers;
      delete owner.selectedDepartment;
      delete owner.selectedField;
      delete owner.selectedEntityType;
      delete owner.selectedGlobalRole;
      delete owner.selectedGlobalRole;
      owner.ifUserSelect = false;

      if (value === "Named Users") {
        owner.selectedUsers = [];
      } else if (value === "From Workflow") {
        owner.selectedField = "";
      } else if (value === "Global Role Of") {
        owner.selectedGlobalRole = "";
      } else {
        owner.selectedEntityType = "";
        owner.selectedDepartment = "";
      }
    }

    updated[orIndex][andIndex] = owner;
    setOwnerSettings(updated);
  };

  const handleEntityTypeSelect = async (
    orIndex: number,
    andIndex: number,
    entityTypeId: string
  ) => {
    handleChange(orIndex, andIndex, "selectedEntityType", entityTypeId);
    handleChange(orIndex, andIndex, "selectedDepartment", "");
    await getDepartments(entityTypeId, orIndex, andIndex);
  };

  const handleAddAnd = (orIndex: number) => {
    const updatedSettings = [...ownerSettings];
    updatedSettings[orIndex].push({
      type: "Named Users",
      selectedUsers: [],
      ifUserSelect: false,
    });
    setOwnerSettings(updatedSettings);
  };

  const handleAddOr = () => {
    setOwnerSettings([
      ...ownerSettings,
      [{ type: "Named Users", selectedUsers: [], ifUserSelect: false }],
    ]);
  };

  const handleRemove = (orIndex: number, andIndex: number) => {
    const updatedSettings = [...ownerSettings];
    updatedSettings[orIndex].splice(andIndex, 1);
    if (updatedSettings[orIndex].length === 0) {
      updatedSettings.splice(orIndex, 1);
    }
    setOwnerSettings(updatedSettings);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="70vh" // adjust as needed
    >
      <Box flex={1} overflow="auto" pr={1}>
        {ownerSettings.map((group: any[], orIndex: number) => (
          <Box key={orIndex} mb={4}>
            {orIndex > 0 && <Typography variant="subtitle1">OR</Typography>}

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={170}>
                    <strong>Owner Type</strong>
                  </TableCell>
                  <TableCell width={700}>
                    <strong>Value</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>User Chooses</strong>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableRow>
                <TableCell colSpan={4}>
                  <hr />
                </TableCell>
              </TableRow>
              <TableBody>
                {group.map((owner: any, andIndex: number) => {
                  const key = `${orIndex}-${andIndex}`;
                  const departments = departmentOptions[key] || [];

                  return (
                    <TableRow key={andIndex}>
                      <TableCell>
                        <Autocomplete
                          fullWidth
                          disableClearable
                          options={ownerTypes}
                          value={owner.type || null}
                          onChange={(event, newValue) =>
                            handleChange(orIndex, andIndex, "type", newValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Type"
                              variant="outlined"
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell>
                        {owner.type === "Named Users" && (
                          <Autocomplete
                            multiple
                            fullWidth
                            options={allUsers}
                            getOptionLabel={(option) => option.label}
                            value={allUsers.filter((user: any) =>
                              (owner.selectedUsers || []).includes(user.value)
                            )}
                            onChange={(event, newValue) => {
                              handleChange(
                                orIndex,
                                andIndex,
                                "selectedUsers",
                                newValue.map((user) => user.value)
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Users"
                                variant="outlined"
                              />
                            )}
                          />
                        )}

                        {[
                          "PIC Of",
                          "Head Of",
                          "Manager Of",
                          "User Of",
                        ].includes(owner.type) && (
                          <Box display="flex">
                            <Autocomplete
                              disableClearable
                              style={{ paddingRight: "20px" }}
                              fullWidth
                              options={allEntityTypes}
                              getOptionLabel={(option) => option.label || ""}
                              value={
                                allEntityTypes.find(
                                  (ent: any) =>
                                    ent.value === owner.selectedEntityType
                                ) || null
                              }
                              onChange={(event, newValue) =>
                                handleEntityTypeSelect(
                                  orIndex,
                                  andIndex,
                                  newValue?.value || ""
                                )
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Entity Type"
                                  variant="outlined"
                                  placeholder="Select Entity Type"
                                />
                              )}
                            />

                            <Autocomplete
                              disableClearable
                              fullWidth
                              options={departments}
                              getOptionLabel={(option) => option.name || ""}
                              value={
                                departments.find(
                                  (dept: any) =>
                                    dept.id === owner.selectedDepartment
                                ) || null
                              }
                              onChange={(event, newValue) =>
                                handleChange(
                                  orIndex,
                                  andIndex,
                                  "selectedDepartment",
                                  newValue?.id || ""
                                )
                              }
                              disabled={!departments.length}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Department"
                                  variant="outlined"
                                  placeholder="Select Department"
                                />
                              )}
                            />
                          </Box>
                        )}

                        {owner.type === "From Workflow" && (
                          <Input
                            fullWidth
                            value={owner.selectedField || ""}
                            onChange={(e) =>
                              handleChange(
                                orIndex,
                                andIndex,
                                "selectedField",
                                e.target.value
                              )
                            }
                          />
                        )}

                        {owner.type === "Global Role Of" && (
                          <Autocomplete
                            disableClearable
                            fullWidth
                            options={allGlobalRoles}
                            getOptionLabel={(option) => option.label || ""}
                            value={
                              allGlobalRoles.find(
                                (role: any) =>
                                  role.value === owner.selectedGlobalRole
                              ) || null
                            }
                            onChange={(event, newValue) =>
                              handleChange(
                                orIndex,
                                andIndex,
                                "selectedGlobalRole",
                                newValue?.value || ""
                              )
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Global Role"
                                variant="outlined"
                                placeholder="Select Global Role"
                              />
                            )}
                          />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Checkbox
                          checked={owner.ifUserSelect || false}
                          disabled={owner.type === 'User Of' || owner.type === 'Global Role Of'}
                          onClick={(e: any) =>
                            handleChange(
                              orIndex,
                              andIndex,
                              "ifUserSelect",
                              e.target.checked
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleRemove(orIndex, andIndex)}
                        >
                          <MdDelete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Box mt={1}>
              <Button size="small" onClick={() => handleAddAnd(orIndex)}>
                + Add AND Condition
              </Button>
            </Box>
          </Box>
        ))}
      </Box>

      <Box mt={2}>
        <hr />
        <Button variant="contained" color="primary" onClick={handleAddOr}>
          + Add OR Group
        </Button>
      </Box>

      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOwnerSettings}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default OwnersTable;
