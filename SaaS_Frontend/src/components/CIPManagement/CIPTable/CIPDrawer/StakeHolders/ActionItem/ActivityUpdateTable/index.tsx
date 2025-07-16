import { useState } from "react";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import { useStyles } from "./styles";
import { MdEdit, MdDelete, MdCheckBox } from 'react-icons/md';
import { InputBase, IconButton, Chip, TextField } from "@material-ui/core";
import _ from "lodash";
import { useSnackbar } from "notistack";

/**
 * This is a table component which has a feature for editing rows inside the table itself
 *
 */
function ActivityUpdateTable(props: any) {
  const classes = useStyles();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [addValue, setAddValue] = useState<any>({
    comments: "",
    date: "",
  });
  const [editIndex, setEditIndex] = useState<any>(null);
  const { isAction = [], actions = [] } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [uomList, setUOMList] = useState<any>([]);
  const today = new Date().toISOString().split("T")[0];

  // We need to keep and update the state of the cell normally

  /**
   * @method hydrateActions
   * @description Function to list helper actions inside the last table column
   * @param actions
   * @param value
   * @param isAction
   * @returns
   */
  const hydrateActions = (actions: any, value: any, isAction: any) => {
    if (isAction?.length > 0) {
      const newAction = actions.filter((val: any) => {
        const filtered = isAction.findIndex((item: any) => {
          return item === val?.label;
        });
        return filtered === -1 ? true : false;
      });
      return newAction.map((item: any) => ({
        ...item, //label, icon of the action
        handler: () => item.handler(value), //handler of the action (edit/delete)
      }));
    }
    return actions.map((item: any) => ({
      ...item,
      handler: () => item.handler(value),
    }));
  };

  /**
   * @method handleEditChange
   * @description Function to handle editing inside the actionItem table
   * @param e {any}
   * @param i {number}
   * @returns nothing
   */
  const handleEditChange = async (e: any, i: number) => {
    const actionItemData = JSON.parse(JSON.stringify(props.data));
    const noDup = JSON.parse(JSON.stringify(props.data));
    props.setData((prev: any) => {
      actionItemData.splice(i, 1, {
        ...actionItemData[i],
        [e.target.name]: e.target.value,
      });
      const noDuplicates = _.uniqBy(actionItemData, "comments");
      if (actionItemData.length !== noDuplicates.length) {
        enqueueSnackbar("You cannot have a duplicate actionItem number!", {
          variant: "error",
        });
        return noDup;
      }
      return actionItemData;
    });
  };

  /**
   * @method deleteactionItem
   * @description Function to delete actionItem of a system
   * @param id {string}
   * @returns deleted actionItem
   */
  const handleDelete = async (id: any) => {
    const actionItemData = JSON.parse(JSON.stringify(props.data));
    props.setData((prev: any) => {
      actionItemData.splice(id, 1);
      return actionItemData;
    });
  };

  /**
   * @method handleAddChange
   * @description Function to handle changes in the input fields which are associated with adding an entry to the table
   * @param e {any}
   * @returns nothing
   */
  const handleAddChange = (e: any) => {
    setAddValue({
      ...addValue,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * @method addactionItem
   * @description Function to add a actionItem
   * @returns nothing
   */
  const addActivityUpdate = () => {
    // Checking for empty values in the newly created actionItem object
    if (!addValue.date.trim() || !addValue.comments.trim()) {
      enqueueSnackbar("You must enter all fields!");
      return;
    }

    const actionItemData = JSON.parse(JSON.stringify(props.data));
    actionItemData.push(addValue);
    // Creating a duplicate check tag
    const noDuplicates = _.uniqBy(actionItemData, "comments");
    if (actionItemData.length !== noDuplicates.length) {
      enqueueSnackbar("You cannot have a duplicate activity comments!", {
        variant: "error",
      });
      return;
    }

    // Inserting a new actionItem entry
    props.setData((prev: any) => {
      return noDuplicates;
    });

    // Reset add value
    setAddValue({
      comments: "",
      date: "",
    });
  };

  function validateInput(value: any, fieldType: any) {
    // Define regex patterns
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/u;
    const disallowedChars = /[<>]/u;

    // Rule: No starting with special character (non-letter and non-number)
    const startsWithSpecialChar = /^[^\p{L}\p{N}]/u.test(value);

    // Rule: No two consecutive special characters
    const consecutiveSpecialChars =
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/u.test(value);

    // Rule: Disallow < and >
    const containsDisallowedChars = disallowedChars.test(value);

    // Check rules based on field type
    if (fieldType === "text" || fieldType === "dropdown") {
      if (startsWithSpecialChar) {
        return "The input should not start with a special character or space.";
      }

      if (consecutiveSpecialChars) {
        return "No two consecutive special characters are allowed.";
      }

      if (containsDisallowedChars) {
        return "The characters < and > are not allowed.";
      }

      return true; // Passes validation for text or dropdown fields
    } else if (fieldType === "number") {
      // Rule: Only numbers are allowed
      if (!/^\d+$/u.test(value)) {
        return "Only numeric values are allowed.";
      }

      return true; // Passes validation for number fields
    }

    return "Invalid field type."; // In case an unsupported field type is passed
  }

  const validateField = (fieldType: any) => ({
    validator(_: any, value: any) {
      const result = validateInput(value, fieldType);
      if (result === true) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(result));
    },
  });

  return (
    <>
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table stickyHeader className={classes.table}>
          <TableHead>
            <TableRow>
              {props.header.map((item: any) => (
                <TableCell key={item}>
                  <Typography
                    variant="body2"
                    className={classes.tableHeaderColor}
                  >
                    {item}
                  </Typography>
                </TableCell>
              ))}
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.data?.map((val: any, i: number) => {
              return (
                <TableRow key={i}>
                  {props.fields.map((item: any) => (
                    <TableCell
                      style={{ width: "100% !important" }}
                      className={
                        isAction
                          ? classes.tableCell
                          : classes.tableCellWithoutAction
                      }
                      key={item}
                    >
                      {isEditing && editIndex === i ? (
                        // <InputBase
                        //   className={classes.editField}
                        //   multiline
                        //   name={item}
                        //   onChange={(e: any) => handleEditChange(e, i)}
                        //   defaultValue={val[item]}
                        // />
                        item === "comments" ? (
                          <InputBase
                            type="text"
                            placeholder={`Type ${item}`}
                            disabled={
                              props.disabled ||
                              props.disabledForDeletedModal ||
                              props.buttonAction
                            }
                            multiline
                            name={item}
                            defaultValue={val[item]}
                            onChange={(e: any) => {
                              const isValid = validateInput(
                                e.target.value,
                                "text"
                              );
                              if (isValid === true) {
                                handleEditChange(e, i);
                              } else {
                                enqueueSnackbar(isValid, {
                                  variant: "error",
                                });
                              }
                            }}
                          />
                        ) : (
                          <TextField
                            // className={classes.addField}
                            type="date"
                            placeholder={`Type ${item}`}
                            disabled={
                              props.disabled ||
                              props.disabledForDeletedModal ||
                              props.buttonAction
                            }
                            name={item}
                            defaultValue={val[item]}
                            onChange={(e: any) => handleEditChange(e, i)}
                            inputProps={{
                              max: today,
                            }}
                          />
                        )
                      ) : (
                        val[item]
                      )}
                    </TableCell>
                  ))}
                  {isAction && (
                    <TableCell className={classes.actionButtonTableCell}>
                      <IconButton
                        disabled={
                          props.disabled || props.disabledForDeletedModal
                        }
                        onClick={() => {
                          setIsEditing(!isEditing);
                          setEditIndex(i);
                        }}
                        style={{ fontSize: "16px" }}
                      >
                        {isEditing && editIndex === i ? (
                          <MdCheckBox style={{ fontSize: "18px" }} />
                        ) : (
                          <MdEdit style={{ fontSize: "18px" }} />
                        )}
                      </IconButton>
                      <IconButton
                        disabled={
                          props.disabled || props.disabledForDeletedModal
                        }
                        onClick={() => {
                          handleDelete(props.isEdit ? val._id : i);
                        }}
                        style={{ fontSize: "16px" }}
                      >
                        <MdDelete style={{ fontSize: "18px" }} />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {props.addFields && (
              <>
                {props.fields.map((item: any) => (
                  <TableCell
                    style={{ width: "100% !important" }}
                    className={
                      isAction
                        ? classes.tableCell
                        : classes.tableCellWithoutAction
                    }
                    key={item}
                  >
                    {item === "comments" ? (
                      <InputBase
                        type="text"
                        placeholder={`Type ${item}`}
                        disabled={
                          props.disabled ||
                          props.disabledForDeletedModal ||
                          props.buttonAction
                        }
                        multiline
                        name={item}
                        value={addValue[item]}
                        onChange={(e: any) => {
                          const isValid = validateInput(e.target.value, "text");
                          if (isValid === true) {
                            handleAddChange(e);
                          } else {
                            enqueueSnackbar(isValid, {
                              variant: "error",
                            });
                          }
                        }}
                      />
                    ) : (
                      <TextField
                        // className={classes.addField}
                        type="date"
                        placeholder={`Type ${item}`}
                        disabled={
                          props.disabled ||
                          props.disabledForDeletedModal ||
                          props.buttonAction
                        }
                        name={item}
                        value={addValue[item]}
                        onChange={(e: any) => handleAddChange(e)}
                        inputProps={{
                          max: today,
                        }}
                      />
                    )}
                  </TableCell>
                ))}
                <TableCell className={classes.tableCell}>
                  <Chip
                    label={props.label}
                    disabled={
                      props.disabled ||
                      props.disabledForDeletedModal ||
                      props.buttonAction
                    }
                    onClick={addActivityUpdate}
                    className={classes.addFieldButton}
                  />
                </TableCell>
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default ActivityUpdateTable;
