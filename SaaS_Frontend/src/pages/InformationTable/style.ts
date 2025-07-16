import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  datePicker: {
    "& .ant-picker-input input::placeholder": {
      color: "black", // Change this to your desired placeholder color
    },
    "& .ant-picker-suffix": {
      color: "black", // Change this to your desired icon color
    },
    border: "1px solid black",
  },

  Select: {
    border: "1px solid black",
    borderRadius: "5px",
    "& .ant-select-selection-placeholder": {
      color: "black !important",
    },
    "& .ant-select-arrow": {
      color: "black !important",
    },
  },

  headerSet1: {
    backgroundColor: "#D9EAD3",
  },
  headerSetForDocs: {
    backgroundColor: "#C9DAF8",
  },
  headerSetForHira: {
    backgroundColor: "#F9CB9C",
  },
  headerSetForAspct: {
    backgroundColor: "#D9D2E9",
  },
  headerSetForKpi: {
    backgroundColor: "#E6B8AF",
  },
  headerSetForAudit: {
    backgroundColor: "#d1828f",
  },
  headerSetForCip: {
    backgroundColor: "#8dba90",
  },
  headerSetForCapa: {
    backgroundColor: "#ba8d8d",
  },
  headerSetForMrm: {
    backgroundColor: "#8d98ba",
  },
  cell: {
    borderBottom: "1px solid grey",
  },
  headerSetFixed1: {
    maxWidth: "30px",
    minWidth: "30px",
    backgroundColor: "#D9EAD3",
    position: "sticky",
    left: 0,
    zIndex: 1,
  },
  headerSetFixed2: {
    maxWidth: "150px",
    minWidth: "150px",
    backgroundColor: "#D9EAD3",
    position: "sticky",
    left: 30,
    zIndex: 1,
  },
  headerSetFixed3: {
    maxWidth: "100px",
    minWidth: "100px",
    backgroundColor: "#D9EAD3",
    position: "sticky",
    left: 180,
    zIndex: 1,
  },
  headerSetFixed4: {
    maxWidth: "100px",
    minWidth: "100px",
    backgroundColor: "#D9EAD3",
    position: "sticky",
    left: 280,
    zIndex: 1,
  },
  headerSetFixed5: {
    maxWidth: "50px",
    minWidth: "50px",
    backgroundColor: "#D9EAD3",
    position: "sticky",
    left: 380,
    zIndex: 1,
  },
  td: {
    borderBottom: "1px solid #cccccc",
  },
}));

export default useStyles;
