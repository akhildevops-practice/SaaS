import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  displaySection:{
    paddingTop: theme.typography.pxToRem(20)
  },
  loader:{
    display: 'flex',
    justifyContent: 'center',
  }
}));

export default useStyles;