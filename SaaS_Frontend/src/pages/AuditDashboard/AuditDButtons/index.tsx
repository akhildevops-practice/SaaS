import { Divider, makeStyles, useMediaQuery } from "@material-ui/core";
import { Grid, Paper, Typography, Box } from "@material-ui/core";
import styles from "./styles";
import {
  MdCalendarToday,
  MdAccessTime,
  MdCheckBox,
  MdFolder,
  MdGavel,
  MdVerifiedUser,
  MdDescription,
  MdListAlt,
  MdPeople,
} from "react-icons/md";
import useStyles from "./styles";

type props = {
  allChartData?: any;
};
const useStylesCard = makeStyles((theme) => ({
  card: {
    padding: "8px 0px",
    borderRadius: "6px",
    boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
    // minHeight: 140,
    wight: "447px",
    hight: "151px",
  },
  count: {
    fontSize: 32,
    fontWeight: 700,
    margin: theme.spacing(1, 0),
  },
  iconText: {
    display: "flex",
    alignItems: "center",
    marginRight: theme.spacing(2),
  },
  icon: {
    marginRight: 4,
    fontSize: "20px",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    marginTop: theme.spacing(1),
  },
  completed: { color: "#16a349", fontWeight: "bold" },
  inProgress: { color: "#e39955", fontWeight: "bold" },
  scheduled: { color: "#2463eb", fontWeight: "bold" },
  main_container: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 16px 10px 16px",
    width: "100%",
    marginLeft: "0px",
  },
  title: {
    fontSize: "15px",
    fontFamily: "poppinsregular, sans-serif !important",
    fontWeight: "bold",
  },
  cardItem: {
    maxWidth: "441px",
  },
}));

const AuditDButtons = ({ allChartData }: props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const mediumScreen = useMediaQuery("(min-width:700px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = styles(mediumScreen)();
  const classesCard = useStylesCard();

  const StatCard = ({ title, count, stats }: any) => {
    return (
      <Paper className={classesCard.card}>
        <Typography
          variant="subtitle1"
          align="center"
          className={classesCard.title}
        >
          {title}
        </Typography>
        <Typography className={classesCard.count} align="center">
          {count}
        </Typography>
        <Box className={classesCard.row} justifyContent="center">
          {stats.map(
            ({ icon: Icon, label, value, className }: any, idx: any) => (
              <Box key={idx} className={classesCard.iconText}>
                <Icon className={`${classesCard.icon} ${className}`} />
                <Typography variant="body2">
                  <span style={{ color: "#000" }}>{label}:</span>{" "}
                  <span className={className}>{value}</span>
                </Typography>
              </Box>
            )
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <>
      <Grid container className={classesCard.main_container}>
        <Grid item xs={6} md={4} className={classesCard.cardItem}>
          <StatCard
            title="Audits Conducted"
            count={allChartData?.auditConducted?.auditPlan}
            stats={[
              {
                icon: MdCalendarToday,
                label: "AdHoc",
                value: allChartData?.auditConducted?.adHoc,
                className: classesCard.scheduled,
              },
              {
                icon: MdAccessTime,
                label: "Audit Report",
                value: allChartData?.auditConducted?.auditReport,
                className: classesCard.inProgress,
              },
              {
                icon: MdCheckBox,
                label: "Audit Schedule",
                value: allChartData?.auditConducted?.auditSchedule,
                className: classesCard.completed,
              },
            ]}
          />
        </Grid>
        <Grid item xs={6} md={4} className={classesCard.cardItem}>
          <StatCard
            title="Findings Raised"
            count={allChartData?.findingsConducted?.count?.totalfindings}
            stats={[
              {
                icon: MdFolder,
                label: "Open",
                value: allChartData?.findingsConducted?.count?.open,
                className: classesCard.scheduled,
              },
              {
                icon: MdGavel,
                label: "Closed",
                value: allChartData?.findingsConducted?.count?.closed,
                className: classesCard.inProgress,
              },
              {
                icon: MdVerifiedUser,
                label: "Verified",
                value: allChartData?.findingsConducted?.count?.verfied,
                className: classesCard.completed,
              },
            ]}
          />
        </Grid>
        <Grid item xs={6} md={4} className={classesCard.cardItem}>
          <StatCard
            title="Audited Systems"
            count={allChartData?.auditorData?.auditors}
            stats={[
              {
                icon: MdDescription,
                label: "Documents",
                value: allChartData?.auditCoverage?.auditedDocuments,
                className: classesCard.scheduled,
              },
              {
                icon: MdListAlt,
                label: "System",
                value: allChartData?.auditCoverage?.system,
                className: classesCard.inProgress,
              },
              {
                icon: MdPeople,
                label: "Auditor Used",
                value: allChartData?.auditorData?.auditorUsed,
                className: classesCard.completed,
              },
            ]}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default AuditDButtons;
