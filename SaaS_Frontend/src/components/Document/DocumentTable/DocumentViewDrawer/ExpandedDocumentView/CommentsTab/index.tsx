import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  Box,
  Paper,
  TextareaAutosize,
  IconButton,
  Typography,
  Avatar,
} from "@material-ui/core";
import { MdSend } from "react-icons/md";
import { useState } from "react";
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
    // "& .ant-drawer-content": {
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
    // },
  },
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%", // Ensure it takes full height
    padding: theme.spacing(1),
    "& .MuiPaper-elevation1": {
      boxShadow: "none",
    },
  },
  comment: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  avatar: {
    marginRight: theme.spacing(2),
  },
  commentText: {
    flexGrow: 1,
    // padding: theme.spacing(1),
    // backgroundColor: theme.palette.grey[100],
    // borderRadius: theme.shape.borderRadius,
  },
  commentBody: {
    color: "#8D8D8D",
    fontSize: "12px",
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
})) as any;

type Props = {
  commentDrawer: any;
  setCommentDrawer: any;
  toggleCommentsDrawer: any;
  formData: any;
  commentData: any;
  commentsLoader: any;
  handleCommentSubmit: any;
};

const CommentsTab = ({
  commentDrawer,
  setCommentDrawer,
  toggleCommentsDrawer,
  formData,
  commentData,
  commentsLoader,
  handleCommentSubmit,
}: Props) => {
  const classes = useStyles();

  const [value, setValue] = useState<any>("");

  const handleAddComment = () => {
    handleCommentSubmit(value);
    setValue("");
  };
  const handleTextFieldKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleAddComment();
    }
  };

  // console.log("commentData", commentData);
  return (
    <div className={classes.root}>
      <Box flexGrow={1} overflow="auto" style={{ marginBottom: "10px" }}>
        {!!commentData && commentData.length === 0 && (
          <Typography variant="h6" align="center">
            Be the first to add a comment.
          </Typography>
        )}
        {!!commentData &&
          commentData.map((comment: any, index: any) => (
            <div key={index} className={classes.comment}>
              <Avatar
                alt="Avatar"
                src={`${API_LINK}/${comment?.userDetails?.avatar}`}
                style={{ marginRight: "8px" }}
              />
              <Paper className={classes.commentText}>
                <div>
                  <strong>{comment.userDetails?.username}</strong>
                </div>
                <div className={classes.commentBody}>{comment.commentText}</div>
              </Paper>
            </div>
          ))}

        {/* <div ref={commentsEndRef} /> */}
      </Box>

      <div className={classes.inputBox}>
        <TextareaAutosize
          className={classes.input}
          // variant="outlined"
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
  );
};

export default CommentsTab;
