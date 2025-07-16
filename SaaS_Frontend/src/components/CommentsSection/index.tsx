import React from "react";
import CustomAccordion from "../CustomAccordion";
import { MdAccountCircle } from 'react-icons/md';
import {
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
} from "@material-ui/core";
import CommentSubmit from "../../assets/icons/CommentSubmit.svg";

type Props = {
  handleCommentSubmit?: any;
  data?: any;
  commentsLoader?: any;
  version?: any;
  disableAddComment?: boolean;
};

function CommentsSection({
  handleCommentSubmit,
  data,
  commentsLoader,
  version,
  disableAddComment = false,
}: Props) {
  const [expanded, setExpanded] = React.useState<string | false>("panel1");
  const [value, setValue] = React.useState("");

  const handleAccordionChange =
    (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleSubmit = () => {
    handleCommentSubmit(value);
    setValue("");
  };

  const handleChange = (e: any) => {
    setValue(e.target.value);
  };

  return (
    <>
      {commentsLoader ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginLeft: "50%",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <Grid container>
          {data.map((item: any, i: any) => {
            return (
              <Grid key={i} item xs={12} style={{ padding: 6 }}>
                <CustomAccordion
                  adornment={<MdAccountCircle />}
                  name={item.commentBy}
                  panel={`panel${i + 1}`}
                  expanded={expanded}
                  handleChange={handleAccordionChange}
                  border={item.border}
                  emptyBackground={item.emptyBackground}
                  postedOn={item.postedOn}
                >
                  {item.commentText}
                </CustomAccordion>
              </Grid>
            );
          })}
          {!version && !disableAddComment && (
            <Grid
              item
              container
              xs={12}
              sm={12}
              md={12}
              spacing={1}
              style={{ marginTop: 10, padding: 6, fontSize: "14px" }}
            >
              <Grid
                item
                xs={10}
                sm={10}
                md={10}
                // className={classes.formTextPadding}
              >
                <span>Add Comments:</span>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  data-testId="add-comment"
                  // label="Add a comment"
                  variant="outlined"
                  size="small"
                  value={value}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={handleSubmit}
                          data-testId="icon-button"
                        >
                          <img src={CommentSubmit} alt="submit" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          )}
        </Grid>
      )}
    </>
  );
}

export default React.memo(CommentsSection);
