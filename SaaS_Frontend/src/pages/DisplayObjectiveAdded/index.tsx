import { Paper, Typography } from "@material-ui/core";
import React, { useState } from "react";
import useStyles from "./styles";
import { MdEdit } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import CustomTable from "../../components/CustomTable";

import EmptyTableImg from "../../assets/EmptyTableImg.svg";
import formatQuery from "../../utils/formatQuery";

type Props = {
  addedObjective?: any;
  title: string;
  handleDelete: (data: any) => void;
  setEdit: (val: any) => void;
  parent: string;
  tableHeaders?: string[];
  tableFields?: string[];
  tableData?: any;
  isAdmin?: boolean;
};

const headers = ["Year", "Organization Goals ", "Created By", "Created Date"];
const fields = ["Year", "ObjectiveCategory", "ModifiedBy", "createdAt"];

/**
 * This component displays added users in a tabular form.
 */

function DisplayObjectiveAdded({
  addedObjective,
  title,
  handleDelete,
  setEdit,
  parent,
  tableHeaders,
  tableFields,
  tableData,
  isAdmin = true,
}: Props) {
  const classes = useStyles();
  const [count, setCount] = useState<number>();
  const [page, setPage] = useState(1);

  const handleEdit = (data: any) => {
    setEdit(data);
  };

  const handleChangePage = (page: any) => {
    setPage(page);
    const url = formatQuery(
      "/api/objective/AllObjectives",
      [
        { name: "page", value: page },
        { name: "limit", value: 10 },
      ],
      true
    );
  };
  return (
    <>
      {(addedObjective?.length || tableData?.length) !== 0 &&
      (addedObjective?.length || tableData) ? (
        <Paper elevation={0} className={classes.root}>
          <div className={classes.tableSection}>
            <div className={classes.table}>
              <CustomTable
                header={tableHeaders ? tableHeaders : headers}
                fields={tableFields ? tableFields : fields}
                data={tableData ? tableData : addedObjective}
                isAction={true}
                actions={[
                  {
                    label: "Edit",
                    icon: <MdEdit fontSize="small" />,
                    handler: handleEdit,
                  },
                  {
                    label: "Delete",
                    icon: <MdDelete fontSize="small" />,
                    handler: handleDelete,
                  },
                ]}
              />
              {/* <SimplePaginationController
                count={count}
                page={page}
                rowsPerPage={10}
                handleChangePage={handleChangePage}
              /> */}
            </div>
          </div>
        </Paper>
      ) : (
        <Typography align="center">
          {
            <>
              <div className={classes.imgContainer}>
                <img src={EmptyTableImg} alt="No Data" width="300px" />
              </div>
              <Typography align="center" className={classes.emptyDataText}>
                Let’s begin by adding an objective
              </Typography>
            </>
          }
        </Typography>
      )}
    </>
  );
}

export default DisplayObjectiveAdded;
