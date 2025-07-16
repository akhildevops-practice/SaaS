import {
  CircularProgress,
  Paper,
  Typography,
  Grid,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
import { useEffect, useState } from "react";

const useStyles = makeStyles(() => ({
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
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
  number: {
    fontSize: "1.875rem",
    fontWeight: 700,
    color: "#2563EB",
  },
}));

type Props = {
  hiraCountObject: any;
  isLoadingHiraCount: any;
  activeTab?: any;
  setActiveTab?: any;
};

const HiraCountSectionForFilters = ({
  hiraCountObject,
  isLoadingHiraCount,
  activeTab = 0,
  setActiveTab,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const classes = useStyles();

  const sections = [
    {
      title: "Total HIRA",
      count: hiraCountObject?.totalHiraTillDate,
    },
    { title: "InWorkflow HIRA", count: hiraCountObject?.inWorkflowHira },

    { title: "Total HIRA Steps", count: hiraCountObject?.totalSteps },

    {
      title: "Significant Steps",
      count: hiraCountObject?.totalSignificantSteps,
    },
  ];

  const getSubtitle = (title: string) => {
    if (title === "Total HIRA") return "Till Date";
    if (title === "Total HIRA Steps") return "Till Date";
    return "";
  };

  return isLoadingHiraCount ? (
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
      {sections.map((section, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <Paper className={classes.card}>
            <Typography className={classes.title}>
              {section.title}
              {getSubtitle(section.title) && (
                <span className={classes.subtitle}>
                  {getSubtitle(section.title)}
                </span>
              )}
            </Typography>
            <div className={classes.number}>{section.count}</div>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default HiraCountSectionForFilters;
