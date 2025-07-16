import { Grid } from "@material-ui/core";
import React, { useState } from "react";
import CustomAccordion from "../../components/CustomAccordion";
import CustomTable from "../../components/CustomTable";
import DocClassification from "../../components/ProcessDocForms/DocClassification";
import DocInfo from "../../components/ProcessDocForms/DocInfo";
import useStyles from "./styles";
import CommentsTab from "components/Document/DocumentTable/DocumentViewDrawer/ExpandedDocumentView/CommentsTab";
import { useMediaQuery } from "@material-ui/core";

type Props = {
  handleCommentSubmit: any;
  versionHistoryTableHeader: any;
  referenceDocumentsTableHeader: any;
  workflowHistoryTableHeader: any;
  versionHistoryTableFields: any;
  workflowHistoryTableFields: any;
  attachmentHistoryTableHeader: any;
  attachmentHistoryTableFields: any;
  referenceDocumentsTableFields: any;
  formData: any;
  commentData: any;
  commentsLoader: any;
  version?: any;
  workflowHistory?: any;
  attachmentHistory?: any;
};

function ViewDocNormal({
  handleCommentSubmit,
  versionHistoryTableHeader,
  referenceDocumentsTableHeader,
  workflowHistoryTableHeader,
  formData,
  attachmentHistoryTableHeader,
  attachmentHistoryTableFields,
  versionHistoryTableFields,
  workflowHistoryTableFields,
  referenceDocumentsTableFields,
  commentData,
  commentsLoader,
  version,
  attachmentHistory,
  workflowHistory,
}: Props) {
  const classes = useStyles();
  // const [comments, setComments] = React.useState<any>([]);
  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    data: {},
  });

  const toggleCommentsDrawer = (data: any = {}) => {
    setCommentDrawer({
      ...commentDrawer,
      open: !commentDrawer.open,
      data: { ...data },
    });
  };

  const matches = useMediaQuery("(min-width:786px)");

  return (
    <Grid item xs={12} md={8} style={{ maxWidth: "97%" }}>
      <Grid container>
        <Grid
          item
          xs={12}
          className={classes.accordionStyle}
          style={{ paddingLeft: matches ? "16px" : "0px" }}
        >
          <CustomAccordion name="Comments" changeHandler={false} panel="panel1">
            <CommentsTab
              commentDrawer={commentDrawer}
              setCommentDrawer={setCommentDrawer}
              toggleCommentsDrawer={toggleCommentsDrawer}
              formData={formData}
              handleCommentSubmit={handleCommentSubmit}
              commentData={commentData}
              commentsLoader={commentsLoader}
            />
          </CustomAccordion>
        </Grid>
        <Grid
          item
          xs={12}
          className={classes.accordionStyle}
          style={{ paddingLeft: matches ? "16px" : "0px" }}
        >
          <CustomAccordion
            name="Document Information"
            changeHandler={false}
            panel="panel1"
          >
            <DocInfo view={true} formData={formData} />
          </CustomAccordion>
        </Grid>
        {/* <Grid
          item
          xs={12}
          className={classes.accordionStyle}
          style={{ paddingLeft: matches ? "16px" : "0px" }}
        >
          <CustomAccordion
            name="Document Classification"
            changeHandler={false}
            panel="panel1"
          >
            <DocClassification view={true} edit={true} formData={formData} />
          </CustomAccordion>
        </Grid> */}
        <Grid
          item
          xs={12}
          className={classes.accordionStyle}
          style={{ paddingLeft: matches ? "16px" : "0px" }}
        >
          <CustomAccordion
            name="Version History"
            changeHandler={false}
            panel="panel1"
          >
            <CustomTable
              header={versionHistoryTableHeader}
              fields={versionHistoryTableFields}
              isAction={false}
              data={formData.DocumentVersions}
            />
          </CustomAccordion>
        </Grid>
        <Grid
          item
          xs={12}
          className={classes.accordionStyle}
          style={{ paddingLeft: matches ? "16px" : "0px" }}
        >
          <CustomAccordion
            name="Workflow History"
            changeHandler={false}
            panel="panel1"
          >
            <CustomTable
              header={workflowHistoryTableHeader}
              fields={workflowHistoryTableFields}
              isAction={false}
              data={workflowHistory?.map((item: any) => {
                // console.log("attachmenthistory", workflowHistory);
                const updatedAtDate = new Date(item.updatedAt);
                const formattedDate = updatedAtDate.toLocaleDateString("en-GB");
                // const urlParts = item?.updatedLink?.split("/");
                const updatedBy =
                  item?.userDetails?.firstname +
                  " " +
                  item?.userDetails?.lastname;

                // Get the last part of the URL, which is the document name with extension
                // const documentNameWithExtension = urlParts[urlParts.length - 1];
                return {
                  ...item,
                  actionBy: updatedBy,
                  updatedAt: formattedDate,
                  // attachment: documentNameWithExtension,
                };
              })}
            />
          </CustomAccordion>
        </Grid>
        <Grid
          item
          xs={12}
          className={classes.accordionStyle}
          style={{ paddingLeft: matches ? "16px" : "0px" }}
        >
          <CustomAccordion
            name="Attachment History"
            changeHandler={false}
            panel="panel1"
          >
            <CustomTable
              header={attachmentHistoryTableHeader}
              fields={attachmentHistoryTableFields}
              isAction={false}
              data={attachmentHistory?.map((item: any) => {
                // console.log("attachmenthistory", attachmentHistory);
                const updatedAtDate = new Date(item.updatedAt);
                const formattedDate = updatedAtDate.toLocaleDateString("en-GB");
                const urlParts = item?.updatedLink?.split("/");
                const updatedBy =
                  item?.updatedByDetails?.firstname +
                  " " +
                  item?.updatedByDetails?.lastname;

                // Get the last part of the URL, which is the document name with extension
                const documentNameWithExtension = urlParts[urlParts.length - 1];
                return {
                  ...item,
                  updatedBy: updatedBy,
                  updatedAt: formattedDate,
                  attachment: documentNameWithExtension,
                };
              })}
            />
          </CustomAccordion>
        </Grid>
        <Grid
          item
          xs={12}
          className={classes.accordionStyle}
          style={{ paddingLeft: matches ? "16px" : "0px" }}
        >
          <CustomAccordion
            name="Reference Documents"
            changeHandler={false}
            panel="panel1"
          >
            <CustomTable
              header={referenceDocumentsTableHeader}
              isAction={false}
              fields={referenceDocumentsTableFields}
              data={formData?.ReferenceDocuments}
            />
          </CustomAccordion>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ViewDocNormal;
