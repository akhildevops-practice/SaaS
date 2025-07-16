import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

type Props = {
  handleChangePage: any;
  count: any;
  page: number;
  rowsPerPage: number;
  move?: string;
};

const useStyles = makeStyles((theme) => ({
  pagination: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    boxShadow: `0 -1px 0 ${theme.palette.grey[300]}`,
    backgroundColor: "inherit",
    paddingTop: 15,
    padding: theme.spacing(1),

    "& .MuiButton-root": {
      // backgroundColor: theme.palette.grey[100],
      marginLeft: theme.spacing(1),
    },
    "& .numberButton": {
      minWidth: "31px",
      height: "31px",
      fontSize: "12px",
      borderRadius: "5px",
      padding: "0",
    },
    "& .numberButton.Mui-selected": {
      backgroundColor: "#003566",
      color: "#ffffff",
    },
  },
}));

function SimplePaginationController({
  handleChangePage,
  count,
  page,
  rowsPerPage,
  move = "flex-end",
}: Props) {
  const classes = useStyles();

  const totalPages = Math.ceil(count / rowsPerPage);

  const handlePageClick = (pageNumber: number) => () => {
    handleChangePage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <Button
          key={i}
          size="small"
          onClick={handlePageClick(i)}
          disabled={i === page}
          className={`numberButton ${i === page ? "Mui-selected" : ""}`}
        >
          {i}
        </Button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className={classes.pagination}>
      <Button
        size="small"
        onClick={handlePageClick(page - 1)}
        disabled={page === 1}
      >
        Previous
      </Button>

      {renderPageNumbers()}

      <Button
        size="small"
        onClick={handlePageClick(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </Button>
    </div>
  );
}

export default SimplePaginationController;
