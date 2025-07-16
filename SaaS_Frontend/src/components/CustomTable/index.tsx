import React from "react";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import ActionButton from "../../components/ActionButton";
import useStyles from "./styles";

/**
 * This is a Custom Table Component that Displays data in a tabular form as well as incorporates the Action buttons
 *
 */
function CustomTable(props: any) {
  const classes = useStyles();
  const { isAction = [], actions = [] } = props;

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

  return (
    <>
      <TableContainer component={Paper} elevation={0}>
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
              {isAction && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.data?.map((val: any, i: number) => {
              return (
                <TableRow key={i} className={classes.tableRow}>
                  {props.fields.map((item: any) => (
                    <TableCell
                      className={
                        isAction
                          ? classes.tableCell
                          : classes.tableCellWithoutAction
                      }
                      key={item}
                    >
                      {val[item]}
                    </TableCell>
                  ))}
                  {isAction && (
                    <TableCell className={classes.tableCell}>
                      <ActionButton
                        actions={hydrateActions(actions, val, val?.isAction)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default CustomTable;
