import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: '#FFFFFF',
    minHeight:'100%',
    width: '100%'
  },
  formTextPadding: {
    padding: theme.typography.pxToRem(14),
    fontSize: theme.typography.pxToRem(13)
  },
  formBox: {
    width: '100%',
    paddingBottom: theme.typography.pxToRem(25),
  },
  discardBtn: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    marginRight: theme.typography.pxToRem(20)
  },
  buttonSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.typography.pxToRem(60),
  },
  formControl: {
    minWidth: '100%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  previewFont:{
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    textDecoration: 'none', 
    fontWeight: 600,
    marginLeft: theme.typography.pxToRem(20)
  }
}));

export default useStyles;