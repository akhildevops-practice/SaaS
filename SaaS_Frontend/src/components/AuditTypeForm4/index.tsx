import React, { useState, useEffect } from "react";
import useStyles from "./styles";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { Button, Checkbox, Input, Pagination } from "antd";
import {
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Table,
  TableCell,
} from "@material-ui/core";
import { IconButton } from "@material-ui/core";
import { useSnackbar } from "notistack";
import {
  deleteAuditFindings,
  updateAuditFindings,
} from "apis/auditFindingsApi";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import checkRoles from "utils/checkRoles";
import { MdCheckCircle, MdCheckBox } from 'react-icons/md';
import type { PaginationProps } from "antd";

const AuditTypeForm3 = (props: any) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [textValue, setTextValue] = useState("");
  const [textValueId, setTextValueId] = useState("");
  const [commentsValue, setCommentsValue] = useState("");
  const [dropValue, setDropValue] = useState("None");
  const [editButton, setEditButton] = useState(false);
  const [isCheckboxStatus, setIsCheckboxStatus] = useState(true);
  const [textValueEdit, setTextValueEdit] = useState<any | null>();
  const [textValueIdEdit, setTextValueIdEdit] = useState<any | null>();
  const [commentValueEdit, setCommentValueEdit] = useState<any | null>();
  const [dropValueEdit, setDropValueEdit] = useState<any | null>();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditIndex, setIsEditIndex] = useState<any | null>();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const [pageType, setPageType] = useState<any>(1);
  const [rowsPerPageType, setRowsPerPageType] = useState(10);
  const [countType, setCountType] = useState<number>(0);
  const [addButton, setAddButton] = useState(false);

  const startIndex = (pageType - 1) * rowsPerPageType;
  const endIndex = startIndex + rowsPerPageType;
  const currentData = props?.data?.slice(startIndex, endIndex);

  /**
   * @method CheckBox Functionalities
   * @description Function to add a clause
   * @returns nothing
   */

  const handleCheckboxChange = (rowIndex: any, checkboxIndex: any) => {
    const updatedRowData = [...props.fields];
    props.fields[rowIndex].checkboxes[checkboxIndex] =
      !props.fields[rowIndex].checkboxes[checkboxIndex];
    props.setRow(updatedRowData);
  };

  const handleCheckboxEdit = (rowIndex: any, checkboxIndex: any, id: any) => {
    const upDateValues = props.data.map((item: any) => {
      if (item.id === id) {
        return {
          ...item,
          checkboxes: item.checkboxes.map((value: any, index: any) =>
            index === rowIndex ? !value : value
          ),
        };
      }
      return item;
    });
    props.setData(upDateValues);
  };

  const showTotalType: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const handlePaginationType = (page: any, pageSize: any) => {
    setPageType(page);
    setRowsPerPageType(pageSize);
  };

  /**
   * @method Update RowData
   * @description Function to add a clause
   * @returns nothing
   */

  const handleUpdateValues = (row: any, rowIndex: any) => {
    const updateArray = props?.data?.map((item: any) => {
      if (item.id === isEditIndex) {
        return {
          ...item,
          headings: textValueEdit,
          headingsId: textValueIdEdit,
          comments: commentValueEdit,
          dropdown: dropValueEdit,
          button: true,
        };
      }
      return item;
    });
    props.setData(updateArray);
    setEditButton(false);
    setIsCheckboxStatus(true);
    setIsEditing(false);
    const DataUpdateValues = props.data.filter(
      (item: any, index: any) => item.id === row.id
    );

    const HeadersDataValues = [
      "selectClause",
      "accept",
      "reject",
      "autoAccept",
      "correctiveAction",
      "auditorVerification",
    ];

    const CheckBoxData = DataUpdateValues.map(
      (row: any) => row.checkboxes
    ).flat();
    const trueIndices = CheckBoxData.reduce(
      (acc: any, val: any, index: any) => {
        if (val === true) {
          acc.push(index);
        }
        return acc;
      },
      []
    );

    const trueValues = trueIndices.map(
      (index: any) => HeadersDataValues[index]
    );

    const falseIndices = CheckBoxData.reduce(
      (acc: any, val: any, index: any) => {
        if (val === false) {
          acc.push(index);
        }
        return acc;
      },
      []
    );

    const falseValues = falseIndices.map(
      (index: any) => HeadersDataValues[index]
    );

    interface SelectedValues {
      [key: string]: boolean;
    }
    interface unselectedValues {
      [key: string]: boolean;
    }
    const selectedValues: SelectedValues = {};
    const unSelectedValues: unselectedValues = {};

    HeadersDataValues.forEach((header: any) => {
      if (trueValues.includes(header)) {
        selectedValues[header.replace(/\s+/g, "")] = true;
      }
    });

    HeadersDataValues.forEach((header: any) => {
      if (falseValues.includes(header)) {
        unSelectedValues[header.replace(/\s+/g, "")] = false;
      }
    });
    const FormValuesFinal = {
      findingType: textValueEdit,
      findingTypeId: textValueIdEdit,
      comments: commentValueEdit,
      closureBy: dropValueEdit,
      organizationId: props.orgId,
      ...selectedValues,
      ...unSelectedValues,
    };
    const updateFindValues = props.values.map((item: any) => {
      if (item.id === isEditIndex) {
        return {
          ...item,
          findingType: textValueEdit,
          findingTypeId: textValueIdEdit,
          comments: commentValueEdit,
          closureBy: dropValueEdit,
          organizationId: props.orgId,
          ...selectedValues,
          ...unSelectedValues,
        };
      }
      return item;
    });
    props.setValues(updateFindValues);
    updateAuditFindings(row.id, FormValuesFinal).then((response: any) => {
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(`Data Updated successfully!`, {
          variant: "success",
        });
      }
    });
  };

  const handleValuesEdit = (rowIndex: any) => {
    if (!isReadMode) {
      const filterData = props?.data?.filter(
        (item: any) => item.id === rowIndex
      );
      const updateArray = props?.data?.map((item: any) => {
        if (item.id === rowIndex) {
          return {
            ...item,
            button: item.id !== rowIndex,
          };
        }
        return item;
      });
      props.setData(updateArray);
      const dataObj = filterData.map((item: any) => {
        const data = {
          headings: item.headings,
          headingsId: item.headingsId,
          comments: item.comments,
          dropdown: item.dropdown,
        };
        return data;
      });
      setTextValueEdit(dataObj[0]?.headings);
      setTextValueIdEdit(dataObj[0]?.headingsId);
      setCommentValueEdit(dataObj[0]?.comments);
      setDropValueEdit(dataObj[0]?.dropdown);
      setIsEditIndex(rowIndex);
      setIsCheckboxStatus(false);
      setEditButton(true);
      setIsEditing(!isEditing);
    }
  };

  /**
   * @method DropDown Values Edit
   * @description Function to add a clause
   * @returns nothing
   */

  // const handleDropdownEdit = (rowIndex: any, event: any) => {
  //   props.data[rowIndex].dropdown = event.target.value;
  //   setDropValueEdit(props.data[rowIndex].dropdown);
  // };

  /**
   * @method DeleteData
   * @description Function to add a clause
   * @returns nothing
   */
  const handleDeleteRows = (rowIndex: any, row: any) => {
    if (!isReadMode) {
      const DataRemove = props.data.filter(
        (item: any, index: any) => item.id !== rowIndex
      );
      props.setData(DataRemove);
      const DataRemoveValues = props.values.filter(
        (item: any, index: any) => item.id !== rowIndex
      );
      props.setValues(DataRemoveValues);
      deleteAuditFindings(row.id).then((response) => {
        if (response?.status === 200 || response?.status === 201) {
          enqueueSnackbar(`Deleted Audit Finding Successfully!`, {
            variant: "success",
          });
          return;
        }
      });
    }
  };

  const uniqueId = generateUniqueId(22);
  /**
   * @method addClause
   * @description Function to add a clause
   * @returns nothing
   */
  const addClause = () => {
    // Checking for empty values in the newly created clause object
    const FormData = [
      {
        headings: textValue,
        headingsId: textValueId,
        comments: commentsValue,
        checkboxes: props.fields.map((row: any) => row.checkboxes).flat(),
        dropdown: dropValue,
        id: uniqueId,
        button: true,
      },
    ];

    const HeadersDataValues = [
      "selectClause",
      "accept",
      "reject",
      "autoAccept",
      "correctiveAction",
      "auditorVerification",
    ];

    const CheckBoxData = props.fields.map((row: any) => row.checkboxes).flat();
    const trueIndices = CheckBoxData.reduce(
      (acc: any, val: any, index: any) => {
        if (val === true) {
          acc.push(index);
        }
        return acc;
      },
      []
    );

    const trueValues = trueIndices.map(
      (index: any) => HeadersDataValues[index]
    );

    const falseIndices = CheckBoxData.reduce(
      (acc: any, val: any, index: any) => {
        if (val === false) {
          acc.push(index);
        }
        return acc;
      },
      []
    );

    const falseValues = falseIndices.map(
      (index: any) => HeadersDataValues[index]
    );

    interface SelectedValues {
      [key: string]: boolean;
    }
    interface unselectedValues {
      [key: string]: boolean;
    }
    const selectedValues: SelectedValues = {};
    const unSelectedValues: unselectedValues = {};

    HeadersDataValues.forEach((header: any) => {
      if (trueValues.includes(header)) {
        selectedValues[header.replace(/\s+/g, "")] = true;
      }
    });

    HeadersDataValues.forEach((header: any) => {
      if (falseValues.includes(header)) {
        unSelectedValues[header.replace(/\s+/g, "")] = false;
      }
    });
    const FormValuesFinal = [
      {
        findingType: textValue,
        findingTypeId: textValueId,
        comments: commentsValue,
        closureBy: dropValue,
        id: uniqueId,
        organizationId: props.orgId,
        ...selectedValues,
        ...unSelectedValues,
      },
    ];

    if (FormData[0].headings === "") {
      enqueueSnackbar("You must provide a Finding name!", {
        variant: "warning",
      });
      return;
    }

    if (FormData[0].headingsId === "") {
      enqueueSnackbar("You must provide a Finding ID!", {
        variant: "warning",
      });
      return;
    }

    // const indexOfTrue = FormData[0].checkboxes.indexOf(true);
    // if (indexOfTrue === -1) {
    //   enqueueSnackbar("You must Select a Action Type!");
    //   return;
    // }

    props.setData([...props.data, ...FormData]);
    props.setValues([...props.values, ...FormValuesFinal]);

    setAddButton(false);
    setDropValue("None");
    props.setRow([
      {
        headings: "",
        headingsId: "",
        checkboxes: [false, false, false, false, false, false],
        dropdown: "None",
      },
    ]);
    setTextValue("");
    setTextValueId("");
    setCommentsValue("");
  };

  //----------read mode ---------------
  const [isReadMode, setIsReadMode] = useState(false);

  useEffect(() => {
    const url = window.location.href;
    const isReadModeUrl = url.includes(
      "audit/auditsettings/auditTypeForm/readMode"
    );
    setIsReadMode(isReadModeUrl);
  }, []);

  return (
    <>
      {isOrgAdmin && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            style={{ backgroundColor: "#003566", color: "#ffff" }}
            onClick={() => {
              setAddButton(true);
            }}
            disabled={isReadMode}
          >
            Add
          </Button>
        </div>
      )}
      <div className={classes.mainContainerDiv}>
        <TableContainer component={Paper}>
          <Table aria-label="customized table">
            <TableHead style={{ backgroundColor: "#E8F3F9", height: "35px" }}>
              <TableRow>
                {props.header &&
                  props.header.map((item: any) => (
                    <TableCell key={item} style={{ paddingLeft: "10px" }}>
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
              {props.fields.map((row: any, rowIndex: any) => {
                if (addButton && pageType === 1) {
                  return (
                    <TableRow key={rowIndex}>
                      <TableCell key={rowIndex} className={classes.inputButton}>
                        <Input
                          value={textValue}
                          placeholder="Enter Findings"
                          className={classes.labelStyle}
                          onChange={(e: any) => {
                            setTextValue(e.target.value);
                          }}
                        />
                      </TableCell>
                      <TableCell key={rowIndex} className={classes.inputButton}>
                        <Input
                          value={textValueId}
                          placeholder="Enter Findings ID"
                          onChange={(e: any) => {
                            setTextValueId(e.target.value);
                          }}
                          className={classes.labelStyle}
                          maxLength={4}
                        />
                      </TableCell>
                      <TableCell key={rowIndex} className={classes.inputButton}>
                        <Input
                          value={commentsValue}
                          placeholder="Enter Comments"
                          className={classes.labelStyle}
                          onChange={(e: any) => {
                            setCommentsValue(e.target.value);
                          }}
                        />
                      </TableCell>
                      {row.checkboxes.map(
                        (isChecked: any, checkboxIndex: any) => (
                          <TableCell key={checkboxIndex}>
                            <Checkbox
                              checked={isChecked}
                              onChange={() =>
                                handleCheckboxChange(rowIndex, checkboxIndex)
                              }
                              style={{
                                color: isChecked ? "lightgray" : "#E5E8E8",
                                marginLeft: "auto",
                                marginRight: "auto",
                              }}
                            />
                          </TableCell>
                        )
                      )}
                      <TableCell>
                        <FormControl
                          fullWidth
                          variant="outlined"
                          // margin="normal"
                          size="small"
                        >
                          <InputLabel
                            htmlFor="VerificationOwner"
                            className={classes.testLabel}
                          >
                            Select One
                          </InputLabel>
                          <Select
                            label=" Select One"
                            name="VerificationOwner"
                            value={dropValue}
                            style={{
                              height: "30px",
                              fontSize: "13px",
                              width: "auto",
                            }}
                            onChange={(e: any) => setDropValue(e.target.value)}
                          >
                            <MenuItem value="None" className={classes.menuFont}>
                              None
                            </MenuItem>
                            <MenuItem value="MCOE" className={classes.menuFont}>
                              MCOE
                            </MenuItem>
                            <MenuItem value="IMSC" className={classes.menuFont}>
                              IMSC
                            </MenuItem>
                            <MenuItem
                              value="functionSpoc"
                              className={classes.menuFont}
                            >
                              Function Spoc
                            </MenuItem>
                            <MenuItem
                              value="DeptHead"
                              className={classes.menuFont}
                            >
                              DeptHead
                            </MenuItem>
                            <MenuItem
                              value="Auditor"
                              className={classes.menuFont}
                            >
                              Auditor
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {isOrgAdmin && (
                          <MdCheckCircle
                            onClick={addClause}
                            style={{
                              color: "#1677ff",
                              fontSize: "20px",
                              cursor: "pointer",
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }
                return null;
              })}
              {currentData &&
                currentData.map((row: any, rowIndex: any) => (
                  <TableRow key={row.id}>
                    <TableCell key={row.id}>
                      {editButton && isEditIndex === row.id ? (
                        <Input
                          placeholder="Enter Findings"
                          value={textValueEdit}
                          disabled={row.button}
                          className={classes.labelStyle}
                          onChange={(e: any) => {
                            setTextValueEdit(e.target.value);
                          }}
                        />
                      ) : (
                        <Input
                          value={row.headings}
                          disabled
                          style={{ color: "black" }}
                        />
                      )}
                    </TableCell>
                    <TableCell key={row.id}>
                      {editButton && isEditIndex === row.id ? (
                        <Input
                          placeholder="Enter Findings ID"
                          value={textValueIdEdit}
                          disabled={row.button}
                          className={classes.labelStyle}
                          onChange={(e: any) => {
                            setTextValueIdEdit(e.target.value);
                          }}
                          maxLength={4}
                        />
                      ) : (
                        <Input
                          value={row.headingsId}
                          disabled
                          style={{ color: "black" }}
                        />
                      )}
                    </TableCell>
                    <TableCell key={row.id}>
                      {editButton && isEditIndex === row.id ? (
                        <Input
                          placeholder="Enter Comments"
                          value={commentValueEdit}
                          disabled={row.button}
                          className={classes.labelStyle}
                          onChange={(e: any) => {
                            setCommentValueEdit(e.target.value);
                          }}
                        />
                      ) : (
                        <Input
                          value={row.comments}
                          disabled
                          style={{ color: "black" }}
                        />
                      )}
                    </TableCell>
                    {row.checkboxes.map(
                      (isChecked: any, checkboxIndex: any) => (
                        <TableCell key={checkboxIndex}>
                          <Checkbox
                            checked={isChecked}
                            disabled={row.button}
                            onChange={() =>
                              handleCheckboxEdit(
                                checkboxIndex,
                                rowIndex,
                                row.id
                              )
                            }
                            className={classes.checkbox}
                          />
                        </TableCell>
                      )
                    )}
                    <TableCell>
                      {isEditing && isEditIndex === row.id ? (
                        <FormControl
                          fullWidth
                          variant="outlined"
                          // margin="normal"
                          size="small"
                        >
                          <InputLabel
                            htmlFor="VerificationOwner"
                            className={classes.testLabel}
                          >
                            Select One
                          </InputLabel>
                          <Select
                            label=" Select One"
                            name="VerificationOwner"
                            value={dropValueEdit}
                            className={classes.select}
                            disabled={row.button}
                            style={{
                              height: "30px",
                              fontSize: "13px",
                              width: "auto",
                            }}
                            onChange={(e) => setDropValueEdit(e.target.value)}
                          >
                            <MenuItem value="None" className={classes.menuFont}>
                              None
                            </MenuItem>
                            <MenuItem value="MCOE" className={classes.menuFont}>
                              MCOE
                            </MenuItem>
                            <MenuItem value="IMSC" className={classes.menuFont}>
                              IMSC
                            </MenuItem>
                            <MenuItem
                              value="functionSpoc"
                              className={classes.menuFont}
                            >
                              Function Spoc
                            </MenuItem>
                            <MenuItem
                              value="DeptHead"
                              className={classes.menuFont}
                            >
                              DeptHead
                            </MenuItem>
                            <MenuItem
                              value="Auditor"
                              className={classes.menuFont}
                            >
                              Auditor
                            </MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <FormControl
                          fullWidth
                          variant="outlined"
                          // margin="normal"
                          size="small"
                        >
                          <InputLabel
                            htmlFor="VerificationOwner"
                            className={classes.testLabel}
                          >
                            Select One
                          </InputLabel>
                          <Select
                            label=" Select One"
                            name="VerificationOwner"
                            value={row.dropdown}
                            disabled={row.button}
                            className={classes.select}
                            style={{
                              height: "30px",
                              fontSize: "13px",
                              width: "auto",
                            }}
                            // onChange={(e) => handleDropdownEdit(rowIndex, e)}
                          >
                            <MenuItem value="None" className={classes.menuFont}>
                              None
                            </MenuItem>
                            <MenuItem value="MCOE" className={classes.menuFont}>
                              MCOE
                            </MenuItem>
                            <MenuItem value="IMSC" className={classes.menuFont}>
                              IMSC
                            </MenuItem>
                            <MenuItem
                              value="functionSpoc"
                              className={classes.menuFont}
                            >
                              Function Spoc
                            </MenuItem>
                            <MenuItem
                              value="DeptHead"
                              className={classes.menuFont}
                            >
                              DeptHead
                            </MenuItem>
                            <MenuItem
                              value="Auditor"
                              className={classes.menuFont}
                            >
                              Auditor
                            </MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                    <div className={classes.actionButtonTableCell}>
                      {isOrgAdmin && (
                        <>
                          <IconButton
                            style={{
                              fontSize: "16px",
                            }}
                          >
                            {isEditing && isEditIndex === row.id ? (
                              <MdCheckBox
                                style={{
                                  fontSize: "21px",
                                  color: "green",
                                }}
                                onClick={() => {
                                  handleUpdateValues(row, row.id);
                                }}
                              />
                            ) : (
                              <CustomEditIcon
                                style={{ fontSize: "18px", height: "18px" }}
                                onClick={() => {
                                  handleValuesEdit(row.id);
                                }}
                              />
                            )}
                          </IconButton>
                          <IconButton style={{ fontSize: "16px" }}>
                            <CustomDeleteICon
                              style={{ fontSize: "18px", height: "18px" }}
                              onClick={() => {
                                handleDeleteRows(row.id, row);
                              }}
                            />
                          </IconButton>
                        </>
                      )}
                    </div>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div className={classes.pagination}>
          <Pagination
            size="small"
            current={pageType}
            pageSize={rowsPerPageType}
            total={props.data.length}
            showTotal={showTotalType}
            showSizeChanger
            showQuickJumper
            onChange={(page, pageSize) => {
              handlePaginationType(page, pageSize);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default AuditTypeForm3;
