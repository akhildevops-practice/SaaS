import { useState, useEffect } from "react";
import { Avatar, Typography, Popover, Grid, Box } from "@material-ui/core";
import useStyles from "./styles";
import axios from "../../../apis/axios.global";
import { API_LINK } from "../../../config";
import getToken from "../../../utils/getToken";
import parseToken from "../../../utils/parseToken";

type Props = {
  userId: string;
  children: JSX.Element;
};

function UserInfoCard({ userId, children }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [userInfo, setUserInfo] = useState<any>();

  let initials;

  const classes = useStyles();

  useEffect(() => {
    const name = parseToken(getToken()).name;

    initials = getInitials(name);

    getUser();
  }, []);

  const getInitials = (name: string) => {
    const initials = name
      ?.split(" ")
      ?.map((name) => name[0])
      ?.slice(0, 2)
      ?.join("");
    return initials;
  };

  const getUser = async () => {
    await axios(`/api/user/getUser/byId/${userId}`)
      .then((res) => setUserInfo(res.data))
      .catch((err) => console.error(err));
  };

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Typography
        component="p"
        className={classes.hoverText}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {children}
      </Typography>
      <Popover
        elevation={7}
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePopoverClose}
      >
        <Grid container alignItems="center" justifyContent="flex-start">
          <Grid
            item
            xs={12}
            style={{ borderBottom: "1px solid #999", paddingBottom: 11 }}
          >
            <Grid container>
              <Grid item xs={3}>
                <Box className={classes.imgContainer}>
                  <Avatar
                    src={`${API_LINK}/${userInfo?.avatar}`}
                    className={classes.avatar}
                  >
                    {initials}
                  </Avatar>
                </Box>
              </Grid>
              <Grid item xs={9}>
                <Typography component="p">{userInfo?.username}</Typography>
                <Typography component="p" style={{ fontSize: "0.85rem" }}>
                  {userInfo?.email}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Typography component="p" className={classes.bottomInfo}>
              {userInfo?.assignedRole?.map((role: any) => role.role).join(", ")}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography component="p" className={classes.bottomInfo}>
              {userInfo?.location?.locationName}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography component="p" className={classes.bottomInfo}>
              {userInfo?.entity?.entityName}
            </Typography>
          </Grid>
        </Grid>
      </Popover>
    </>
  );
}

export default UserInfoCard;
