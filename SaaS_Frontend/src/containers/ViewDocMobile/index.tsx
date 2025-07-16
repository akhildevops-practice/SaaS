import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Fab from "@material-ui/core/Fab";
import useStyles from "./style";
import Grid from "@material-ui/core/Grid";
import { MdMoreVert } from 'react-icons/md';
import CommentsSection from "../../components/CommentsSection";
import CustomAccordion from "../../components/CustomAccordion";
import CustomTable from "../../components/CustomTable";
import DocClassification from "../../components/ProcessDocForms/DocClassification";
import DocInfo from "../../components/ProcessDocForms/DocInfo";

type Props = {
  handleCommentSubmit: any;
  versionHistoryTableHeader: any;
  referenceDocumentsTableHeader: any;
  workflowHistoryTableHeader: any;
  versionHistoryTableFields: any;
  attachmentHistoryTableHeader: any;
  attachmentHistoryTableFields: any;
  workflowHistoryTableFields: any;
  referenceDocumentsTableFields: any;
  formData: any;
  commentData: any;
  commentsLoader: any;
  version?: any;
};

function ViewDocMobile({
  handleCommentSubmit,
  versionHistoryTableHeader,
  referenceDocumentsTableHeader,
  workflowHistoryTableHeader,
  formData,
  versionHistoryTableFields,
  workflowHistoryTableFields,
  attachmentHistoryTableHeader,
  attachmentHistoryTableFields,
  referenceDocumentsTableFields,
  commentData,
  commentsLoader,
  version,
}: Props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  /**
   * @method handleDrawerOpen
   * @description Function to open the drawer
   * @returns nothing
   */
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  /**
   * @method handleDrawerClose
   * @description Function to close the drawer
   * @returns nothing
   */
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const content = () => (
    <div className={classes.list} role="presentation">
      <Grid container>
        <Grid item xs={12} className={classes.accordionStyle}>
          <CustomAccordion name="Comments" changeHandler={false}>
            <CommentsSection
              handleCommentSubmit={handleCommentSubmit}
              data={commentData}
              commentsLoader={commentsLoader}
              version={version}
            />
          </CustomAccordion>
        </Grid>
        <Grid item xs={12} className={classes.accordionStyle}>
          <CustomAccordion name="Version History" changeHandler={false}>
            <CustomTable
              header={versionHistoryTableHeader}
              fields={versionHistoryTableFields}
              isAction={false}
              data={formData.DocumentVersions}
            />
          </CustomAccordion>
        </Grid>
        <Grid item xs={12} className={classes.accordionStyle}>
          <CustomAccordion name="Workflow History" changeHandler={false}>
            <CustomTable
              header={workflowHistoryTableHeader}
              fields={workflowHistoryTableFields}
              isAction={false}
              data={formData.DocumentWorkFlowHistory}
            />
          </CustomAccordion>
        </Grid>
        <Grid item xs={12} className={classes.accordionStyle}>
          <CustomAccordion name="Document Information" changeHandler={false}>
            <DocInfo view={true} formData={formData} />
          </CustomAccordion>
        </Grid>
        <Grid item xs={12} className={classes.accordionStyle}>
          <CustomAccordion name="Document Classification" changeHandler={false}>
            <DocClassification view={true} formData={formData} edit={true} />
          </CustomAccordion>
        </Grid>
        <Grid item xs={12} className={classes.accordionStyle}>
          <CustomAccordion name="Reference Documents" changeHandler={false}>
            <CustomTable
              header={referenceDocumentsTableHeader}
              isAction={false}
              data={formData.ReferenceDocuments}
              fields={referenceDocumentsTableFields}
            />
          </CustomAccordion>
        </Grid>
      </Grid>
    </div>
  );

  return (
    <React.Fragment>
      <div className={classes.root}>
        <Fab
          size="medium"
          data-testid="fabMobile"
          onClick={() => {
            handleDrawerOpen();
          }}
          className={classes.fabBtn}
        >
          <MdMoreVert />
        </Fab>
      </div>
      <Drawer anchor={"right"} open={open} onClose={handleDrawerClose}>
        {content()}
      </Drawer>
    </React.Fragment>
  );
}

export default ViewDocMobile;
