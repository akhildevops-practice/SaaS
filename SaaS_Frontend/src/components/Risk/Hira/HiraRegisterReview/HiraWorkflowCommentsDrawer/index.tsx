//react, reactouter
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

//material-ui
import {
    Paper,
    Avatar,
    makeStyles,
    Theme,
  } from "@material-ui/core";
  import CloseIconImageSvg from "assets/documentControl/Close.svg";
//antd
import { Drawer } from "antd";



const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    "& .ant-drawer-body": {
      overflowY: "hidden",
    },
    // "& .ant-drawer-content": {
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
    // },
  },
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(2),
  },
  comment: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  avatar: {
    marginRight: theme.spacing(2),
  },
  commentText: {
    flexGrow: 1,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    marginTop: "auto",
    padding: theme.spacing(2),
  },
  input: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
}));

type Props = {
  commentDrawer?: any;
  setCommentDrawer?: any;
  toggleCommentsDrawer?: any;
  fetchRisks?: any;
  commentText?: any;
  setCommentText?: any;
  handleCommentSubmit?: any;
  riskConfig?: any;
};

const HiraWorkflowCommentsDrawer = ({
  commentDrawer,
  setCommentDrawer,
  toggleCommentsDrawer,
  fetchRisks,
  // comments,
  // setComments,
  commentText,
  setCommentText,
  handleCommentSubmit,
  riskConfig,
}: Props) => {
  const classes = useStyles();
  const params = useParams<any>();
  const [comments , setComments] = useState<any>([]);

  const commentsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    console.log("checkrisk7 sin hiraWorkflowCommentsDrawer", commentDrawer);
    
    if (commentDrawer?.data ) {
        if(!!commentDrawer?.data?.comments && !!commentDrawer?.data?.comments?.length){ 
          setComments(commentDrawer?.data?.comments)
        }
    }
  }, [commentDrawer?.open]);


  return (
    <Drawer
      title={`${riskConfig?.primaryClassification} Workflow Comments History`}
      open={commentDrawer.open}
      closable={true}
      onClose={toggleCommentsDrawer}
      className={classes.drawer}
      width="30%"
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
    >
      <div className={classes.root}>
          {!!comments &&
            comments?.map((comment: any, index: any) => (
              <div key={index} className={classes.comment}>
                <Avatar
                  className={classes.avatar}
                  alt={comment?.commentBy}
                  src={comment?.avatarUrl}
                />
                <Paper className={classes.commentText} variant="outlined">
                  <div>
                    <strong>{comment?.commentBy}</strong>
                  </div>
                  <div>{comment?.commentText}</div>
                </Paper>
              </div>
            ))}

          <div ref={commentsEndRef} />
      </div>
    </Drawer>
  );
};

export default HiraWorkflowCommentsDrawer;
