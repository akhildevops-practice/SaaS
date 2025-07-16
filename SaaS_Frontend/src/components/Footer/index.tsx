import { Typography, Grid } from "@material-ui/core";
import useStyles from "./styles";
import { useRecoilValue } from "recoil";
import { mobileView } from "../../recoil/atom";
import { Link } from "react-router-dom";

type Props = {};

/**
 *
 * This is the Footer of the whole application, it sticks to the bottom of the screen
 */

function Footer({}: Props) {
  const classes = useStyles();
  const view = useRecoilValue(mobileView);
  return (
    <div className={classes.root}>
      <Grid container className={view ? classes.mobileView : undefined}>
        <Grid item sm={12} md={6}>
          <Typography className={classes.text1}>
            All Rights Reserved : ProcessRidge
          </Typography>
        </Grid>
        <Grid item sm={12} md={6} style={{ maxWidth: "42%" }}>
          <Typography className={view ? classes.text2Mobile : classes.text2}>
            <Link
              style={{ textDecoration: "none", color: "#000", marginRight: 5 }}
              to="/"
            >
              About ProcessRidge
            </Link>
            <Link
              style={{
                textDecoration: "none",
                color: "#000",
                marginRight: 5,
                marginLeft: 5,
              }}
              to="/"
            >
              Help Topics
            </Link>{" "}
            |{" "}
            <Link
              style={{
                textDecoration: "none",
                color: "#000",
                marginLeft: 5,
                marginRight: 8,
              }}
              to="/"
            >
              Raise a Ticket
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
}

export default Footer;
