//react, reactouter
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
//material-ui
import {
    Box,
    Paper,
    TextareaAutosize,
    IconButton,
    Typography,
    Avatar,
    makeStyles,
    Theme,
  } from "@material-ui/core";
import { MdSend } from 'react-icons/md';

//antd
import { Drawer } from "antd";

//utils
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
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
  commentDrawer?: any;
  setCommentDrawer?: any;
  toggleCommentsDrawer?: any;
  fetchRisks?: any;

  comments?: any;
  setComments?: any;
  commentText?: any;
  setCommentText?: any;
  handleCommentSubmit?: any;
};

const CommentsDrawer = ({
  commentDrawer,
  setCommentDrawer,
  toggleCommentsDrawer,
  fetchRisks,
  comments,
  setComments,
  commentText,
  setCommentText,
  handleCommentSubmit,
}: Props) => {
  const classes = useStyles();
  const params = useParams<any>();
  const userDetails = getSessionStorage();
//   const avatarUrl = userDetails.avatar
//     ? `${API_LINK}/${userDetails.avatar}`
//     : "";
  //   const [commentText, setCommentText] = useState("");
  //   const [comments, setComments] = useState<any>([]);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const url = params.riskcategory === "HIRA" ? "/api/riskregister" : "/api/aspect-impact";
  useEffect(() => {
    if (!!commentDrawer?.mode && commentDrawer.mode === "edit") {
      fetchAllCommentsByRiskId();
    }
  }, [commentDrawer]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [comments]);

  const handleTextFieldKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleCommentSubmit(commentText);
    }
  };
  const fetchAllCommentsByRiskId = async () => {
    try {
      const res = await axios.get(
        `${url}/getallcomments/${commentDrawer?.data?.riskId}`
      );
      if (res.data?.length > 0) {
        const formattedComments = res.data.map((comment: any) => ({
          id: comment.id,
          name: comment.firstname + " " + comment.lastname,
          comment: comment.comment,
          avatarUrl: comment.avatar ? `${API_LINK}/${comment.avatar}` : "",
        }));
        setComments(formattedComments);
      }

      // console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <Drawer
      title={"Add/View Comments"}
      open={commentDrawer.open}
      closable={true}
      onClose={toggleCommentsDrawer}
      // height={250}
      className={classes.drawer}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      // style={{ overflow: "hidden" }}
      width="30%"
      // getContainer={false} // Append this drawer to the first drawer
    >
      <div className={classes.root}>
        <Box flexGrow={1} maxHeight={200} overflow="auto">
          {!!comments && comments.length === 0 && (
            <Typography variant="h6" align="center">
              Be the first to add a comment.
            </Typography>
          )}
          {!!comments &&
            comments.map((comment: any, index: any) => (
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
          <IconButton
            onClick={() => handleCommentSubmit(commentText)}
            style={{ color: "blue" }}
          >
            <MdSend />
          </IconButton>
        </div>
      </div>
    </Drawer>
  );
};

export default CommentsDrawer;
