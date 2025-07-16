import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#fff',
    width: '100%',
    height: theme.typography.pxToRem(40),
    borderRadius: theme.typography.pxToRem(5),
    paddingTop: theme.typography.pxToRem(2),
    marginBottom: theme.typography.pxToRem(8),
    "& input::placeholder": {
      fontSize: "13px"
    },
 
  },
  input: {
    paddingTop: 6,
    paddingLeft: 10
  },
  iconButton: {
    paddingRight: 10
  },
}));

export default useStyles;