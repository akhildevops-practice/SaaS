import React from "react";
import useStyles from "./style";

type props = {
  leaderBoardData?: any;
};

const LeaderBoard = ({ leaderBoardData }: props) => {
  const classes = useStyles();

  const getStatusCount = (statusKey: string) => {
    return (
      leaderBoardData?.statusCount?.find(
        (item: any) => item.status === statusKey
      )?.count || 0
    );
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <div className={classes.mainContainer}>
        <p className={classes.text}>Open</p>
        <p className={classes.number}>{getStatusCount("Open")}</p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>Accepted</p>
        <p className={classes.number}>{getStatusCount("Accepted")}</p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>In Outcome</p>
        <p className={classes.number}>
          {getStatusCount("Outcome_In_Progress")}
        </p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>Rejected</p>
        <p className={classes.number}>{getStatusCount("Rejected")}</p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>Closed</p>
        <p className={classes.number}>{getStatusCount("Closed")}</p>
      </div>
    </div>
  );
};

export default LeaderBoard;
