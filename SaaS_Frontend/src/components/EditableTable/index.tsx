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
import { MdEdit, MdDelete, MdCheckBox } from "react-icons/md";
import { InputBase, IconButton, Chip } from "@material-ui/core";
import _ from "lodash";
import { useSnackbar } from "notistack";
import axios from "apis/axios.global";
import { API_LINK } from "config";
import { findClause, postClauses, updateClause } from "apis/systemApi";
import { isValid } from "utils/validateInput";

/**
 * This is a table component which has a feature for editing rows inside the table itself
 *
 */
function EditableTable(props: any) {
  const classes = useStyles();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<any>({});
  const [addValue, setAddValue] = useState<any>({
    number: "",
    name: "",
    description: "",
  });
  const [editIndex, setEditIndex] = useState<any>(null);
  const { isAction = [], actions = [] } = props;
  const { enqueueSnackbar } = useSnackbar();

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
      let newAction = actions.filter((val: any) => {
        let filtered = isAction.findIndex((item: any) => {
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
   * @description Function to handle editing inside the clauses table
   * @param e {any}
   * @param i {number}
   * @returns nothing
   */
  const handleEditChange = async (e: any, i: number) => {
    let clauseData = JSON.parse(JSON.stringify(props.data));
    let noDup = JSON.parse(JSON.stringify(props.data));
    props.setData((prev: any) => {
      clauseData.splice(i, 1, {
        ...clauseData[i],
        [e.target.name]: e.target.value,
      });
      let noDuplicates = _.uniqBy(clauseData, "number");
      if (clauseData.length !== noDuplicates.length) {
        enqueueSnackbar("You cannot have a duplicate clause number!", {
          variant: "error",
        });
        return noDup;
      }
      return clauseData;
    });

    if (props.isEdit) {
      let result;
      try {
        result = await axios.patch(
          `${API_LINK}/api/systems/clauses/${props.systemId}`,
          clauseData[i]
        );

        return result;
      } catch (error) {
        return error;
      }
    }
  };

  // /**
  //  * @method handleDelete
  //  * @description Function to delete a clause using handleDelete
  //  * @param i {number}
  //  */
  // const handleDelete = (i: number) => {
  //   let clauseData = JSON.parse(JSON.stringify(props.data));
  //   props.setData((prev: any) => {
  //     clauseData.splice(i, 1);
  //     return clauseData;
  //   });
  // };

  /**
   * @method deleteClauses
   * @description Function to delete clauses of a system
   * @param id {string}
   * @returns deleted clauses
   */
  const handleDelete = async (id: any) => {
    if (props.isEdit) {
      let result;
      try {
        result = await axios.delete(`${API_LINK}/api/systems/clauses/${id}`);
        findClause(props.systemId).then((response: any) => {
          props.setData(response.data);
        });
        // return result;
      } catch (error) {
        return error;
      }
    } else {
      let clauseData = JSON.parse(JSON.stringify(props.data));
      props.setData((prev: any) => {
        clauseData.splice(id, 1);
        return clauseData;
      });
    }
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
   * @method addClause
   * @description Function to add a clause
   * @returns nothing
   */
  const addClause = async () => {
    // Checking for empty values in the newly created clause object
    if (!addValue.number.trim() || !addValue.name.trim()) {
      enqueueSnackbar("You must provide a clause number and name!");
      return;
    }

    const validateClauseNumber = await isValid(addValue.number.trim());
    const validateClauseName = await isValid(addValue.name.trim());

    if (validateClauseNumber.isValid === false) {
      enqueueSnackbar(`Clause Number ${validateClauseNumber?.errorMessage}`, {
        variant: "error",
      });
      return;
    }

    if (validateClauseName.isValid === false) {
      enqueueSnackbar(`Clause Name ${validateClauseName?.errorMessage}`, {
        variant: "error",
      });
      return;
    }

    const clauseData = JSON.parse(JSON.stringify(props.data));
    clauseData.push(addValue);

    // Creating a duplicate check tag
    let noDuplicates = _.uniqBy(clauseData, "number");
    if (clauseData.length !== noDuplicates.length) {
      enqueueSnackbar("You cannot have a duplicate clause number!", {
        variant: "error",
      });
      return;
    }

    if (props.isEdit) {
      postClauses({
        ...addValue,
        name: addValue.name.trim(),
        number: addValue.number.trim(),
        systemId: props.systemId,
        organizationId: props.orgId,
      }).then(async (response: any) => {
        try {
          await axios.post(
            `${process.env.REACT_APP_PY_URL}/pyapi/clauseDtlsToVB`,
            response.data
          );
        } catch (error) {}
        props.setData((prev: any) => {
          return noDuplicates;
        });
      });
    } else {
      // Inserting a new clause entry
      props.setData((prev: any) => {
        return noDuplicates;
      });
    }

    // Reset add value
    setAddValue({
      number: "",
      name: "",
      description: "",
    });
  };

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
                      className={
                        isAction
                          ? classes.tableCell
                          : classes.tableCellWithoutAction
                      }
                      key={item}
                    >
                      {isEditing && editIndex === i ? (
                        <InputBase
                          className={classes.editField}
                          multiline
                          name={item}
                          onChange={(e: any) => handleEditChange(e, i)}
                          defaultValue={val[item]}
                        />
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
                        onClick={async () => {
                          if (!isEditing) {
                            setIsEditing(!isEditing);
                            setEditIndex(i);
                          }
                          const name = props.data[i].name.trim();
                          const number = props.data[i].number.trim();
                          const validateClauseName = await isValid(name);
                          const validateClauseNumber = await isValid(number);
                          if (validateClauseName.isValid === false) {
                            enqueueSnackbar(
                              `Clause Name ${validateClauseName?.errorMessage}`,
                              {
                                variant: "error",
                              }
                            );
                            return;
                          } else if (validateClauseNumber.isValid === false) {
                            enqueueSnackbar(
                              `Clause Number ${validateClauseNumber?.errorMessage}`,
                              {
                                variant: "error",
                              }
                            );
                            return;
                          } else {
                            updateClause(props.data[i]._id, {
                              number: number,
                              name: name,
                              description: props.data[i].description,
                            }).then(async (res: any) => {
                              try {
                                await axios.post(
                                  `${process.env.REACT_APP_PY_URL}/pyapi/clauseDtlsToVB`,
                                  res.data
                                );
                              } catch (error) {}
                            });
                          }
                          if (isEditing) {
                            setIsEditing(!isEditing);
                            setEditIndex(i);
                          }
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
                    className={
                      isAction
                        ? classes.tableCell
                        : classes.tableCellWithoutAction
                    }
                    key={item}
                  >
                    {" "}
                    <InputBase
                      className={classes.addField}
                      placeholder={`Type ${item}`}
                      disabled={props.disabled || props.disabledForDeletedModal}
                      multiline
                      name={item}
                      value={addValue[item]}
                      onChange={handleAddChange}
                      required
                    />
                  </TableCell>
                ))}
                <TableCell className={classes.tableCell}>
                  <Chip
                    label={props.label}
                    disabled={props.disabled || props.disabledForDeletedModal}
                    onClick={addClause}
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

export default EditableTable;