import React from "react";
import useStyles from "./style";

type props = {
  leaderBoardData?: any;
};

const LeaderBoard = ({ leaderBoardData }: props) => {
  const classes = useStyles();

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0px 16px",
      }}
    >
      <div className={classes.mainContainer}>
        <p className={classes.text}>Published</p>
        <p className={classes.number}>
          {leaderBoardData?.totalPublishedDocuments || 0}
        </p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>Published This Year</p>
        <p className={classes.number}>
          {leaderBoardData?.publishedThisYear || 0}
        </p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>In Workflow</p>
        <p className={classes.number}>{leaderBoardData?.inWorkflow || 0}</p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>Amended This Year</p>
        <p className={classes.number}>
          {leaderBoardData?.revisedCurrentYearByDept
            ? leaderBoardData?.revisedCurrentYearByDept
            : leaderBoardData?.revisedCurrentYear || 0}
        </p>
      </div>

      <div className={classes.mainContainer}>
        <p className={classes.text}>{"Amend > 60 days"}</p>
        <p className={classes.number}>
          {leaderBoardData?.revisedOverDueDept
            ? leaderBoardData?.revisedOverDueDept
            : leaderBoardData?.revisedOverDue || 0}
        </p>
      </div>
    </div>
  );
};

export default LeaderBoard;
