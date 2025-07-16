import { Modal } from "antd";
import useStyles1 from "./style";
import { makeStyles } from "@material-ui/core/styles";
import { TextareaAutosize, Typography } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import { MdSend } from 'react-icons/md';
import { useState, useRef, useEffect } from "react";
import axios from "../../../../../apis/axios.global";
import { API_LINK } from "../../../../../config";

const useStyles = makeStyles((theme) => ({
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
  commentsModal: any;
  setCommentsModal: any;
  fetchObjectives: any;
};

const CommentsModal = ({
  commentsModal,
  setCommentsModal,
  fetchObjectives,
}: Props) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any>([]);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const avatarUrl = userInfo.avatar ? `${API_LINK}/${userInfo.avatar}` : "";

  const classes1 = useStyles1();
  const classes = useStyles();

  useEffect(() => {
    fetchAllCommentsByObjectiveId();
    //  if (commentsEndRef.current) {
    //     commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    //   }
  }, [commentsModal]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [comments]);

  const fetchAllCommentsByObjectiveId = async () => {
    try {
      const res = await axios.get(
        `/api/objective/getObjectMasterById/${commentsModal?.data?.ObjectiveId}`
      );
      if (res.data.reviewComments?.length > 0) {
        const formattedComments = res.data.reviewComments.map(
          (comment: any) => ({
            id: comment.userId,
            name: comment.user,
            comment: comment.reviewComments,
            date: comment.date,
            avatarUrl: comment.avatar ? `${API_LINK}/${comment.avatar}` : "",
          })
        );
        setComments(formattedComments);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseModal = () => {
    setCommentsModal({
      ...commentsModal,
      open: !commentsModal.open,
    });
  };

  const handleTextFieldKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleAddComment();
    }
  };

  const handleAddComment = () => {
    if (!commentText) return; // if comment text is empty, do nothing
    const newComment = {
      name: userInfo.firstName + " " + userInfo.lastName,
      comment: commentText,
      ReviewComments: commentText,
      ReviewedBy: userInfo.id,
      ObjectiveId: commentsModal?.data?.ObjectiveId,
    };
    postComment(newComment);
    // add the new comment to the comments array
    setComments((prevComments: any) => [
      ...prevComments,
      { ...newComment, avatarUrl: avatarUrl },
    ]);
    setCommentText(""); // clear the input field
  };

  const postComment = async (newComment: any) => {
    try {
      const res = await axios.post(
        "/api/objective/createReviewComments",
        newComment
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      title="Add/View Comments"
      centered
      open={commentsModal.open}
      onCancel={handleCloseModal}
      footer={null}
      width={800}
      className={classes1.modal}
    >
      <div className={classes.root}>
        <Box flexGrow={1} maxHeight={200} overflow="auto">
          {comments.length === 0 && (
            <Typography variant="h6" align="center">
              Be the first to add a comment.
            </Typography>
          )}
          {comments.map((comment: any, index: any) => (
            <div key={index} className={classes.comment}>
              <Avatar
                className={classes.avatar}
                alt={comment.name}
                src={comment.avatarUrl}
              />
              <Paper className={classes.commentText} variant="outlined">
                <div>
                  <strong>{comment.name}</strong>
                </div>
                <div>{comment.comment}</div>
              </Paper>
            </div>
          ))}

          <div ref={commentsEndRef} />
        </Box>

        <div className={classes.inputBox}>
          <TextareaAutosize
            className={classes.input}
            // variant="outlined"
            minRows={4}
            placeholder="Add a comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleTextFieldKeyDown}
          />
          <IconButton onClick={handleAddComment} style={{ color: "blue" }}>
            <MdSend />
          </IconButton>
        </div>
      </div>
    </Modal>
  );
};

export default CommentsModal;
