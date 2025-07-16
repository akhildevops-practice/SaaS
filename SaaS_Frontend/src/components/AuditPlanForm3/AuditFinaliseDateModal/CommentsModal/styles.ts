import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  modal: {
    "& .ant-modal-header": {
      textAlign: "center",
    },
  },
}));

export default useStyles;