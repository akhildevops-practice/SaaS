import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  ckBox: {
    "& .ck-editor__editable_inline": {
      minHeight: "119px !important",
      maxHeight: "200px !important",
      overflowY: "auto !important",
      minWidth: "544px !important",
      borderRadius: "3px !important",
      "&::-webkit-scrollbar": {
        width: "10px",
        // padding: "5px",
        backgroundColor: "white",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "lightblue",
      },
    },
  },
}));

export default useStyles;
