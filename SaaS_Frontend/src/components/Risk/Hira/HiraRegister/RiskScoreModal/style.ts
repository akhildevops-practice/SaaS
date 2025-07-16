import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  matrixContainer: {
    overflowX: "auto",
    marginTop: 16,
    paddingBottom: 8,
  },
  minWidthWrapper: {
    minWidth: 700,
  },
  headerCell: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    marginRight: 4,
    fontWeight: 500,
    fontSize: "14px",
  },
  verticalHeaderWrapper: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  verticalLabel: {
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    textAlign: "center",
    fontWeight: 500,
    fontSize: "1rem",
    cursor: "pointer",
  },
  labelColumn: {
    display: "flex",
    flexDirection: "column",
    width: 150,
    marginRight: 4,
  },
  matrixGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 2,
    marginBottom: 4,
  },
  matrixCell: {
    padding: 8,
    color: "#fff",
    cursor: "pointer",
    height: 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  labelCell: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    textAlign: "center",
    height: 76,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
    fontSize: 12,
    position: "relative",
    "&:hover .edit-icon": {
      opacity: 1,
    },
  },

  dialogLevel: {
    height: 32,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
  },

  tableHeader: {
    fontSize: "1rem",
    fontWeight: "bold",
    margin: "8px",
  },
});

export default useStyles;
