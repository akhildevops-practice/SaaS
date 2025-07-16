import { makeStyles, Theme } from "@material-ui/core/styles";
// export interface StyleProps {
//   detailsDrawer: string;
// }

const useStyles = makeStyles((theme: Theme) => ({
    actionHeader: {
      "& .ant-btn-default": {
        backgroundColor: "#e8f3f9",
        borderColor: "#0e497a",
        "& svg": {
          color: "#0e497a",
        },
      },
    },
    tabsWrapper: {
      "& .ant-tabs-tab": {
        backgroundColor: "#e3e8f9 !important",
        color: "black !important",
      },
      "& .ant-tabs-tab-btn": {
        letterSpacing: "0.6px",
      },
      "& .ant-tabs-tab-active": {
        backgroundColor: "#003566 !important",
      },
      "& .ant-tabs-tab-active div": {
        color: "white !important",
        fontWeight: "500",
      },
    },
    fullformtabs: {
      margin: "24px 16px 0",
      [theme.breakpoints.up("lg")]: {
        height: "70vh", // Adjust the max-height value as needed for large screens
        // overflowY: "auto",
      },
      [theme.breakpoints.up("xl")]: {
        height: "80vh",
        overflowY: "auto",
      },
    },
  }));

export default useStyles;
