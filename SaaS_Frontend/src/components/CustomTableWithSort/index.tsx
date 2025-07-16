import React from "react";
import Paper from "@material-ui/core/Paper";
import MuiTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import useStyles from "./styles";
import { Tooltip } from "@material-ui/core";
import { MdOutlinePictureAsPdf } from 'react-icons/md';
import { MdAssessment } from 'react-icons/md';

/**
 * This is a Custom Table Component with sorting functionality that Displays data in a tabular form as well as incorporates the Action buttons
 *
 */

type Directions = "asc" | "desc";

type DirectionState = {
  [key: string]: Directions;
};

type Props = {
  data: any[];
  headers: any[];
  fields: any[];
  sortFunction?: (arg1: string, arg2: string) => void;
  isAuditReport? : any,
  handleClickPdfOpen? : any,
  isAuditChecklistReport? : any,
  handleAuditChecklistOpen? : any,
};

export default function CustomTableWithSort({
  headers,
  data,
  fields,
  sortFunction,
  isAuditReport=false,
  handleClickPdfOpen,
  isAuditChecklistReport = false,
  handleAuditChecklistOpen,
}: Props) {
  const [directionState, setDirectionState] = React.useState<DirectionState>(
    {}
  );
  const [hoveredRow, setHoveredRow] = React.useState<any>(null);

  const classes = useStyles();

  /**
   * @method handleSort
   * @description Function to sort table entries when the sort icon is clicked
   * @param field {string}
   * @returns nothing
   */
  const handleSort = (field: string) => {
    setDirectionState({
      ...directionState,
      [field]: directionState[field] === "asc" ? "desc" : "asc",
    });
    sortFunction?.(field, directionState[field]);
  };

  React.useEffect(() => {
    const directions: any = {};
    headers.map((item: any) => {
      const { sortable, field } = item;
      if (sortable) directions[field] = "asc";
    });
    setDirectionState(directions);
  }, []);

  return (
    <>
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <MuiTable stickyHeader className={classes.table}>
          <TableHead>
            <TableRow>
              {headers.map((header: any) => (
                <TableCell key={header.field}>
                  {header.sortable ? (
                    <>
                      <Tooltip title="sort table entries">
                        <TableSortLabel
                          active
                          direction={directionState[header.field]}
                          onClick={() => handleSort(header.field)}
                        >
                          <Typography
                            variant="body2"
                            className={classes.tableHeaderColor}
                            component="span"
                          >
                            {header.title}
                          </Typography>
                        </TableSortLabel>
                      </Tooltip>
                    </>
                  ) : (
                    <Typography
                      variant="body2"
                      className={classes.tableHeaderColor}
                    >
                      {header.title}
                    </Typography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data?.map((val: any, i: number) => {
              return (
                <TableRow
                  key={i}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {fields.map((item: any, index: number) => (
                    <TableCell className={classes.tableCell} key={item}>
                      <div style = {{ display : 'flex', flexDirection : 'row'}}>
                      {/* Display Open section when row is hovered and it's the auditName column */}
                      { isAuditReport && index === 0 ? (
                        <div
                          style={{
                            paddingRight: "10px",
                            color: "#636363",
                            
                          }}
                          onClick={() => handleClickPdfOpen(val)}
                        >
                          <MdOutlinePictureAsPdf  style={{ color: "rgba(0, 0, 0, 0.6)", width : '20px' , height : '18px', cursor : 'pointer' }}/>
                        </div>
                      ) : null}
                      { isAuditChecklistReport && index === 0 ? (
                        <div
                          style={{
                            paddingRight: "10px",
                            color: "#636363",
                            
                          }}
                          onClick={() => handleAuditChecklistOpen(val)}
                        >
                        <MdAssessment  style={{ color: "rgba(0, 0, 0, 0.6)", width : '20px' , height : '18px', cursor : 'pointer' }}/>
                      </div>
                      ) : null} 
                      {val[item]}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </>
  );
}
