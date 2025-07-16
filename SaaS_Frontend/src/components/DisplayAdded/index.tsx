import { Paper, Typography } from "@material-ui/core";
import React from "react";
import useStyles from "./styles";
import { MdEdit } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import CustomTable from "../../components/CustomTable";

type Props = {
  addedUsers?: any;
  title: string;
  handleDelete: (data: any) => void;
  setEdit: (val: any) => void;
  parent: string;
  tableHeaders?: string[];
  tableFields?: string[];
  tableData?: any;
  isAdmin?: boolean;
};

const headers = ["First Name", "Last Name", "Username", "Email Address"];
const fields = ["firstName", "lastName", "username", "email"];

/**
 * This component displays added users in a tabular form.
 */

function DisplayAdded({
  addedUsers,
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

  const handleEdit = (data: any) => {
    setEdit(data);
  };

  return (
    <>
      {(addedUsers?.length || tableData?.length) !== 0 &&
      (addedUsers?.length || tableData) ? (
        <Paper elevation={0} className={classes.root}>
          <Typography align="center" className={classes.title}>
            {title}
          </Typography>
          <div className={classes.tableSection}>
            <div className={classes.table}>
              <CustomTable
                header={tableHeaders ? tableHeaders : headers}
                fields={tableFields ? tableFields : fields}
                data={tableData ? tableData : addedUsers}
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
            </div>
          </div>
        </Paper>
      ) : (
        <Typography align="center">
          {isAdmin ? `No ${parent} Admin Added` : `No ${parent} Added`}
        </Typography>
      )}
    </>
  );
}

export default DisplayAdded;
