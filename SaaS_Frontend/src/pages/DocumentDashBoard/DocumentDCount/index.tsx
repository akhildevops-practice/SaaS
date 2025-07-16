import { Divider, Paper, useMediaQuery } from "@material-ui/core";
import React from "react";
// import styles from "./style"
import useStyles from "./style";
type props = {
  setActiveTab?: any;
  activeTab?: any;
  getDataForNoDocs?: any;
  noOfDocs?: any;
  noOfMyDept?: any;
  noOfNewDocs?: any;
  noOfNewMyDept?: any;
  noOfRevisedDocs?: any;
  noOfRevisedMyDept?: any;
  dueRevision?: any;
  dueRevisionMyDept?: any;
  inWorkFlowCountMyLoc?: any;
  inWorkFlowCountMyDept?: any;
  type?: any;
  totalTypeData?: any;
  revisedCurrentYear?: any;
  yearDataPublished?: any;
  revisedOverDue?: any;
  inWorkFlowData?: any;
  totalDocsMyLoc?: any;
  totalDocsMyDept?: any;
  totalDocs?: any;
};

const DocumentDcount = ({
  activeTab,
  setActiveTab,
  getDataForNoDocs,
  noOfDocs,
  noOfMyDept,
  noOfNewDocs,
  noOfNewMyDept,
  noOfRevisedDocs,
  noOfRevisedMyDept,
  dueRevision,
  dueRevisionMyDept,
  inWorkFlowCountMyLoc,
  inWorkFlowCountMyDept,
  type,
  totalTypeData,
  revisedCurrentYear,
  yearDataPublished,
  revisedOverDue,
  inWorkFlowData,
  totalDocsMyLoc,
  totalDocsMyDept,
  totalDocs,
}: props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const handleTabClick = (index: any) => {
    setActiveTab(index);
  };

  const classes = useStyles(matches, smallScreen)();

  return (
    <>
      <div className={classes.parentDiv}>
        <div className={classes.papermaincontain}>
          {type === "activeuser" ? (
            <>
              <p className={classes.headingText}>Total Published Till Date</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 0 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(0)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 0 ? { color: "white" } : {}}
                  >
                    {noOfMyDept}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 0 ? { color: "white" } : {}}
                  >
                    My Dept
                  </p>
                </div>

                <Divider
                  orientation="vertical"
                  flexItem
                  className={classes.divider}
                />
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 1 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(1)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 1 ? { color: "white" } : {}}
                  >
                    {noOfDocs}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 1 ? { color: "white" } : {}}
                  >
                    My Unit
                  </p>
                </div>
              </Paper>
            </>
          ) : (
            <>
              <p className={classes.headingText}>Total Published Till Date</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 0 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(0)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 0 ? { color: "white" } : {}}
                  >
                    {totalTypeData}
                  </p>
                </div>
              </Paper>
            </>
          )}
        </div>

        <div className={classes.papermaincontain}>
          {type === "activeuser" ? (
            <>
              <p className={classes.headingText}>Published (current year)</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 2 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(2)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 2 ? { color: "white" } : {}}
                  >
                    {noOfNewMyDept}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 2 ? { color: "white" } : {}}
                  >
                    My Dept
                  </p>
                </div>

                <Divider
                  orientation="vertical"
                  flexItem
                  className={classes.divider}
                />
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 3 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(3)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 3 ? { color: "white" } : {}}
                  >
                    {noOfNewDocs}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 3 ? { color: "white" } : {}}
                  >
                    My Unit
                  </p>
                </div>
              </Paper>
            </>
          ) : (
            <>
              {" "}
              <p className={classes.headingText}>Published(current year)</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 2 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(2)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 2 ? { color: "white" } : {}}
                  >
                    {yearDataPublished}
                  </p>
                </div>
              </Paper>
            </>
          )}
        </div>

        <div className={classes.papermaincontain}>
          {type === "activeuser" ? (
            <>
              <p className={classes.headingText}>Amend (Current Year)</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 4 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(4)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 4 ? { color: "white" } : {}}
                  >
                    {noOfRevisedMyDept}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 4 ? { color: "white" } : {}}
                  >
                    My Dept
                  </p>
                </div>

                <Divider
                  orientation="vertical"
                  flexItem
                  className={classes.divider}
                />
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 5 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(5)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 5 ? { color: "white" } : {}}
                  >
                    {noOfRevisedDocs}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 5 ? { color: "white" } : {}}
                  >
                    My Unit
                  </p>
                </div>
              </Paper>
            </>
          ) : (
            <>
              {" "}
              <p className={classes.headingText}>Revised (current year)</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 4 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(4)}
                >
                  <p className={classes.headingname}></p>
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 4 ? { color: "white" } : {}}
                  >
                    {revisedCurrentYear}
                  </p>
                </div>
              </Paper>
            </>
          )}
        </div>

        <div className={classes.papermaincontain}>
          {type === "activeuser" ? (
            <>
              <p className={classes.headingText}>{`Amend Due <60 Days`}</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 6 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(6)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 6 ? { color: "white" } : {}}
                  >
                    {dueRevisionMyDept}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 6 ? { color: "white" } : {}}
                  >
                    My Dept
                  </p>
                </div>

                <Divider
                  orientation="vertical"
                  flexItem
                  className={classes.divider}
                />
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 7 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(7)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 7 ? { color: "white" } : {}}
                  >
                    {dueRevision}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 7 ? { color: "white" } : {}}
                  >
                    My Unit
                  </p>
                </div>
              </Paper>
            </>
          ) : (
            <>
              <p className={classes.headingText}>Due for Amendment</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 6 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(6)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 6 ? { color: "white" } : {}}
                  >
                    {revisedOverDue}
                  </p>
                </div>
              </Paper>
            </>
          )}
        </div>

        <div className={classes.papermaincontain}>
          {type === "activeuser" ? (
            <>
              <p className={classes.headingText}> In Workflow</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 8 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(8)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 8 ? { color: "white" } : {}}
                  >
                    {inWorkFlowCountMyDept}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 8 ? { color: "white" } : {}}
                  >
                    My Dept
                  </p>
                </div>

                <Divider
                  orientation="vertical"
                  flexItem
                  className={classes.divider}
                />
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 9 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(9)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 9 ? { color: "white" } : {}}
                  >
                    {inWorkFlowCountMyLoc}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 9 ? { color: "white" } : {}}
                  >
                    My Unit
                  </p>
                </div>
              </Paper>
            </>
          ) : (
            <>
              <p className={classes.headingText}> In Workflow</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 8 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(8)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 8 ? { color: "white" } : {}}
                  >
                    {inWorkFlowData}
                  </p>
                </div>
              </Paper>
            </>
          )}
        </div>

        <div className={classes.papermaincontain}>
          {type === "activeuser" ? (
            <>
              <p className={classes.headingText}> All Documents</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 15 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(15)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 15 ? { color: "white" } : {}}
                  >
                    {totalDocsMyDept}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 15 ? { color: "white" } : {}}
                  >
                    My Dept
                  </p>
                </div>

                <Divider
                  orientation="vertical"
                  flexItem
                  className={classes.divider}
                />
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 16 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(16)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 16 ? { color: "white" } : {}}
                  >
                    {totalDocsMyLoc}
                  </p>
                  <p
                    className={classes.headingname}
                    style={activeTab === 16 ? { color: "white" } : {}}
                  >
                    My Unit
                  </p>
                </div>
              </Paper>
            </>
          ) : (
            <>
              <p className={classes.headingText}> All Documents</p>
              <Paper elevation={0} className={classes.paper}>
                <div
                  className={`${classes.papercontainers} ${
                    activeTab === 17 ? classes.active : ""
                  }`}
                  onClick={() => handleTabClick(17)}
                >
                  <p
                    className={classes.headingnumber}
                    style={activeTab === 17 ? { color: "white" } : {}}
                  >
                    {totalDocs}
                  </p>
                </div>
              </Paper>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DocumentDcount;