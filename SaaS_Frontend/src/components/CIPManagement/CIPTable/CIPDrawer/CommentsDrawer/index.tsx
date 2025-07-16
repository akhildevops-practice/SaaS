//react
import { useState } from "react";

//material-ui
import {
  Box,
  Paper,
  TextareaAutosize,
  IconButton,
  Typography,
  Avatar,
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { MdSend } from 'react-icons/md';
import CloseIconImageSvg from "assets/documentControl/Close.svg";
//antd
import { Drawer } from "antd";

//utils
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
};

const CommentsDrawer = ({
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
  const matches = useMediaQuery("(min-width:786px)");

  return (
    <Drawer
      title={"Add/View Comments"}
      open={commentDrawer.open}
      closable={true}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      onClose={toggleCommentsDrawer}
      className={classes.drawer}
      width={matches ? "30%" : " 80%"}
      maskClosable={false}
    >
      <div className={classes.root}>
        <Box flexGrow={1} overflow="auto">
          {!!commentData && commentData.length === 0 && (
            <Typography variant="h6" align="center">
              Be the first to add a comment.
            </Typography>
          )}
          {!!commentData &&
            commentData.map((comment: any, index: any) => (
              <div key={index} className={classes.comment}>
                <Avatar
                  className={classes.avatar}
                  alt={comment.commentBy}
                  src={`${API_LINK}/${comment?.user?.avatar}`}
                />
                <Paper className={classes.commentText} variant="outlined">
                  <div>
                    <strong>{comment.commentBy}</strong>
                  </div>
                  <div>{comment.commentText}</div>
                </Paper>
              </div>
            ))}
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
    </Drawer>
  );
};

export default CommentsDrawer;
