import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    disabledInput: {
        color: "black !important",
        backgroundColor: "white !important",
      },
      disabledChip: {
        backgroundColor: "white !important",
        color: "black !important",
      },
      popupIndicator: {
        color: "black !important",
      },
}));

export default useStyles;