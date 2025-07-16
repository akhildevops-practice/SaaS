import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(20)
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
    paddingBottom: theme.typography.pxToRem(20)
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
    display: 'flex',
    marginTop: theme.typography.pxToRem(10),
  },
  previewFont2:{
    marginTop: theme.typography.pxToRem(14),
    fontSize: theme.typography.pxToRem(13),
    fontWeight: 600,
    color: theme.palette.primary.light,
  },
  noDocFont:{
    display: 'flex',
    justifyContent: 'center',
    color: theme.palette.primary.light,
    fontSize: theme.typography.pxToRem(13),
    fontWeight: 600,
  }
}));

export default useStyles;