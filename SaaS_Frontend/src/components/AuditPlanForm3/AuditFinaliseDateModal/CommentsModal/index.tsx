import { Modal } from "antd";
import useStyles1 from "./styles";
import { makeStyles } from "@material-ui/core/styles";
import { TextareaAutosize, Typography, Box } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import { MdSend } from 'react-icons/md';
import { useRef, useEffect } from "react";
import axios from "apis/axios.global";
import { API_LINK } from "config";
import getSessionStorage from "utils/getSessionStorage";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(1),
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
}));

type Props = {
  commentsModal?: any;
  toggleCommentsModal?: any;

  commentText?: any;
  setCommentText?: any;
  comments?: any;
  setComments?: any;
  auditPlanUnitWiseId? : any
};

const CommentsModal = ({
  commentsModal,
  toggleCommentsModal,
  commentText,
  setCommentText,
  comments,
  setComments,
  auditPlanUnitWiseId = null,
}: Props) => {
  //   const [commentText, setCommentText] = useState("");
  //   const [comments, setComments] = useState<any>([]);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const userDetails = getSessionStorage();
  const avatarUrl = userDetails.avatar
    ? `${API_LINK}/${userDetails.avatar}`
    : "";
  // console.log(userInfo);

  const classes1 = useStyles1();
  const classes = useStyles();

  useEffect(() => {
    getAllCommentsByAuditPlanUnitWiseId();
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [commentsModal]);

  useEffect(()=>{
    console.log("checkaudit0 comments in comments modal", comments);
    
  },[comments])

  const getAllCommentsByAuditPlanUnitWiseId = async () => {
    try {
      if(!auditPlanUnitWiseId) return;
      const res = await axios.get(
        `/api/auditPlan/comments/${auditPlanUnitWiseId}`
      );
      if (res.data?.length > 0) {
        const formattedComments = res.data.map((comment: any) => ({
          // id: comment.i,
          createdBy: comment?.createdBy,
          commentString: comment?.commentString,
          avatarUrl: comment?.avatar ? `${API_LINK}/${comment.avatar}` : "",
        }));
        setComments(formattedComments);
      }

      // console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTextFieldKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleAddComment();
    }
  };

  const handleAddComment = () => {
    if (!commentText) return; // if comment text is empty, do nothing
    const newComment = {
      createdBy: userDetails.firstName + " " + userDetails.lastName,
      commentString: commentText,
      avatar : userDetails?.avatar || null,
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
      if(!auditPlanUnitWiseId) return;
      const res = await axios.post(
        `/api/auditPlan/addcomment/${auditPlanUnitWiseId}`,
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
      onCancel={toggleCommentsModal}
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
                alt={comment.createdBy}
                src={comment.avatarUrl}
              />
              <Paper className={classes.commentText} variant="outlined">
                <div>
                  <strong>{comment.createdBy}</strong>
                </div>
                <div className={classes.commentBody}>
                  {comment.commentString}
                </div>
              </Paper>
            </div>
          ))}
        </Box>
        <div className={classes.inputBox}>
          <TextareaAutosize
            className={classes.input}
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
