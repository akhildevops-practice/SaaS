import {
  CircularProgress,
  useMediaQuery,
  Paper,
  Typography,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";

const useStyles = makeStyles(() => ({
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)", // Increased shadow
    padding: "24px",
    textAlign: "center",
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#4B5563",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "0.75rem",
    color: "#9CA3AF",
    marginLeft: "6px",
  },
  numberBlue: {
    fontSize: "1.875rem",
    fontWeight: 700,
    color: "#2563EB",
  },
  numberGreen: {
    fontSize: "1.875rem",
    fontWeight: 700,
    color: "#16A34A",
  },
  label: {
    fontSize: "0.75rem",
    color: "#6B7280",
  },
}));

type Props = {
  hiraCountObject: any;
  isLoadingHiraCount: any;
  activeTab?: any;
  setActiveTab?: any;
};

const HiraCountSection = ({
  hiraCountObject,
  isLoadingHiraCount,
  activeTab = 0,
  setActiveTab,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const classes = useStyles();
  const userDetails = getSessionStorage();

  const handleTabClick = (index: any) => {
    setActiveTab(index);
  };

  const renderCard = (
    title: string,
    subtitle: string,
    deptCount: any,
    unitCount: any
  ) => (
    <Grid item xs={12} sm={6} lg={3}>
      <Paper className={classes.card}>
        <Typography className={classes.title}>
          {title}
          {subtitle && <span className={classes.subtitle}>{subtitle}</span>}
        </Typography>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div>
            <div className={classes.numberBlue}>{deptCount}</div>
            <div className={classes.label}>My Dept</div>
          </div>
          <div>
            <div className={classes.numberGreen}>{unitCount}</div>
            <div className={classes.label}>My Unit</div>
          </div>
        </div>
      </Paper>
    </Grid>
  );

  return (
    <>
      {isLoadingHiraCount ? (
        <CircularProgress />
      ) : (
        <Grid
          container
          spacing={2}
          style={{
            marginTop: "10px",
            padding: "0 4px", // Reduced padding to compensate for Grid spacing
            width: "calc(100% - 16px)", // Compensate for Grid spacing
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {renderCard(
            "Total HIRA",
            "Till Date",
            hiraCountObject?.totalCurrentYearEntityWise,
            hiraCountObject?.totalCurrentYearLocationWise
          )}
          {renderCard(
            "InWorkflow HIRA",
            "",
            hiraCountObject?.inWorkflowEntityWise,
            hiraCountObject?.inWorkflowLocationWise
          )}

          {renderCard(
            "Total HIRA Steps",
            "Till Date",
            hiraCountObject?.totalStepsEntityWise,
            hiraCountObject?.totalStepsLocationWise
          )}

          {renderCard(
            "Significant Steps",
            "",
            hiraCountObject?.totalSignificantStepsEntityWise,
            hiraCountObject?.totalSignificantStepsLocationWise
          )}
        </Grid>
      )}
    </>
  );
};

export default HiraCountSection;
