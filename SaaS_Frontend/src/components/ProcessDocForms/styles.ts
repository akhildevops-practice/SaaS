import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  accordionContent: {
    border: "1px solid #D3D3D3",
    borderRadius: "5px",
    margin: 10,
  },
  accordionHeader: {
    backgroundColor: "#F5F5F5",
  }
}));

export default useStyles;