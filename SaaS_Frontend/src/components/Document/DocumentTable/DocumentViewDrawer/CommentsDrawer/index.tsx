import { useState } from "react";
import {
  Box,
  Paper,
  TextareaAutosize,
  IconButton,
  Typography,
  Avatar,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { MdSend } from "react-icons/md";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { Drawer } from "antd";
import { API_LINK } from "config";

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
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
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
  commentDrawer: any;
  setCommentDrawer: any;
  toggleCommentsDrawer: any;
  formData: any;
  commentData: any;
  commentsLoader: any;
  handleCommentSubmit: any;
  matches?: any;
};

const CommentsDrawer = ({
  commentDrawer,
  toggleCommentsDrawer,
  commentData,
  commentsLoader,
  handleCommentSubmit,
  matches,
}: Props) => {
  const classes = useStyles();
  const [value, setValue] = useState<string>("");

  const handleAddComment = () => {
    handleCommentSubmit(value);
    setValue("");
  };

  const handleTextFieldKeyDown = (event: any) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Drawer
      title={"Add/View Comments"}
      open={commentDrawer.open}
      closable={true}
      onClose={toggleCommentsDrawer}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      className={classes.drawer}
      width={matches ? "30%" : "90%"}
    >
      <div className={classes.root}>
        <Box flexGrow={1} overflow="auto">
          {commentsLoader && (
            <Typography variant="body2" align="center">
              Loading comments...
            </Typography>
          )}
          {!commentsLoader && commentData?.length === 0 && (
            <Typography variant="h6" align="center">
              Be the first to add a comment.
            </Typography>
          )}
          {!commentsLoader &&
            commentData?.map((comment: any, index: number) => (
              <div key={index} className={classes.comment}>
                <Avatar
                  className={classes.avatar}
                  alt={
                    comment.userDetails?.firstname +
                      " " +
                      comment.userDetails?.lastname || ""
                  }
                  src={`${API_LINK}/${comment?.userDetails?.avatar || ""}`}
                />
                <Paper className={classes.commentText} variant="outlined">
                  <div>
                    <strong>
                      {comment.userDetails?.firstname}{" "}
                      {comment.userDetails?.lastname}
                    </strong>
                  </div>
                  <div>{comment.commentText}</div>
                </Paper>
              </div>
            ))}
        </Box>

        <div
          className={classes.inputBox}
          style={{ padding: matches ? "" : "0px 0px 0px 10px" }}
        >
          <TextareaAutosize
            className={classes.input}
            minRows={4}
            placeholder="Add a comment"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleTextFieldKeyDown}
          />
          <IconButton onClick={handleAddComment} style={{ color: "blue" }}>
            <MdSend />
          </IconButton>
        </div>
      </div>
    </Drawer>
  );
};

export default CommentsDrawer;
