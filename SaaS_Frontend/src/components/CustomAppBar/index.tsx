import React, { useEffect, useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import LogoutIcon from "../../assets/sidebarIcons/LogoutWhite.svg";
import TopBarNavLinks from "../TopBarNavLinks";
import { useRecoilValue } from "recoil";
import { avatarUrl } from "../../recoil/atom";
import { currentOrg } from "../../recoil/atom";
import { notificationData } from "../../recoil/atom";
import { useRecoilState } from "recoil";
import Avatar from "@material-ui/core/Avatar";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import { Divider } from "@material-ui/core";
import CameraIcon from "../../assets/icons/camera.svg";
import useStyles from "./styles";
import getToken from "../../utils/getToken";
import parseToken from "../../utils/parseToken";
import locationAdmin from "../../utils/locationAdmin";
import { postAvatar } from "../../apis/appbarApi";
import setAvatar from "../../utils/setAvatar";
import { getUserInfo } from "../../apis/socketApi";
import { useSnackbar } from "notistack";
import { API_LINK } from "../../config";
import Candybox from "../Candybox";
import { useNavigate } from "react-router-dom";
import { navbarColorAtom } from "../../recoil/atom";
import axios from "apis/axios.global";
type Props = {
  open: boolean;
  setOpen: any;
  handleLogout: any;
};

/**
 * This is the App Bar with Navigation and other functionalities
 *
 * @param {boolean} open To Check if the Sub Navigation is open in the Top Bar
 * @param setOpen To handle the state change of open
 * @param handleLogout To handle the user logout
 *
 * @returns The App Bar
 */
function CustomAppBar({ open, setOpen, handleLogout }: Props) {
  const [appHeaderColor, setAppHeaderColor] = useState<any>("#11346E");
  const navbarColor = useRecoilValue(navbarColorAtom);
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] =
    useRecoilState<any>(notificationData);
  const [badgeStatus, setBadgeStatus] = useState<any>(0);
  const orgName = useRecoilValue(currentOrg);
  const [name, setName] = useState<string>("");
  const [initial, setInitial] = useState<string>("");
  const [locAdmin, setLocAdmin] = useState<string>();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [imgUrl, setImgUrl] = useRecoilState<any>(avatarUrl);
  const navigate = useNavigate();

  useEffect(() => {
    setAppHeaderColor(navbarColor);
  }, [navbarColor]);
  const classes = useStyles({
    appHeaderColor: appHeaderColor,
  });

  const shouldAddBadge = (count: number) => {
    count ? setBadgeStatus(count) : setBadgeStatus(0);
  };

  const getName = (): string => {
    return parseToken(getToken()).name;
  };

  //console.log("imgUrl", imgUrl);
  const getInitials = (name: string) => {
    const initials = name
      ?.split(" ")
      ?.map((name) => name[0])
      ?.slice(0, 2)
      ?.join("");
    return initials;
  };

  /**
   * @param event
   * @description This function is used to handle the click event of the avatar
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * @param (void)
   * @description This function is used to close the dropdown list of avatar
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * @description handles image upload
   * @param e
   */

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const handleUpload = async (e: any): Promise<void> => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await postAvatar(formData);
      if (res?.status === 201) {
        // console.log('hello world')
        getUserInfo()
          ?.then(async (response) => {
            // console.log("process.env.REACT_APP_IS_OBJECT_STORAGE",process.env.REACT_APP_IS_OBJECT_STORAGE)
            setAvatar(response?.data.avatar);
            const url =
              process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
                ? `${API_LINK}/${response?.data.avatar}`
                : await viewObjectStorageDoc(response?.data.avatar);
            setImgUrl(url);
          })
          .catch((error: any) => console.log({ error }));
      }
    } catch (error) {
      enqueueSnackbar(`Error Occured while uploading image`, {
        variant: "error",
      });
    }
  };

  const popperOpen = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    const name = getName();
    setName(name);

    const initial = getInitials(name);
    setInitial(initial);

    const locAdminName = locationAdmin();
    setLocAdmin(locAdminName);

    getAvatarImage();

    const onScroll = () => handleClose();
    window.removeEventListener("scroll", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // console.log("locadmin", locAdmin);
  const getAvatarImage = () => {
    let imageName: any;
    getUserInfo().then(async (response: any) => {
      const url =
        process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
          ? `${API_LINK}/${response?.data.avatar}`
          : await viewObjectStorageDoc(response?.data.avatar);
      setImgUrl(url);
    });
  };

  useEffect(() => {
    shouldAddBadge(notifications?.unreadCount);
  }, [notifications]);

  return (
    <AppBar position="static" className={classes.root}>
      <Toolbar>
        {/* <div className={classes.title}>
          <img src={prodleLogo} alt="Prodle" height="45" />
        </div>
        <div className={classes.orgNameTextSection}>
          {orgName && (
            <Typography className={classes.orgNameText}>{orgName}</Typography>
          )}
        </div> */}
        <div
        // style={{ flexGrow: 1 }}
        />
        <div
          style={{
            textAlign: "center",
            borderRadius: "10px",
            // border: "1px solid #BDBDBD",
            padding: "2px",
          }}
        >
          <TopBarNavLinks setOpen={setOpen} open={open} />
        </div>
        <div style={{ flexGrow: 1 }} />
        <Candybox />
        <div>
          {/* <Tooltip title="Notification">
            <IconButton
              style={{ maxWidth: 50 }}
              color="inherit"
              className={classes.divider}
            >
              <CustomPopover>
                <Badge
                  badgeContent={badgeStatus}
                  color="secondary"
                  className={classes.badge}
                >
                  <img src={NotiIcon} alt="Notifications" />
                </Badge>
              </CustomPopover>
            </IconButton>
          </Tooltip> */}
          <IconButton
            data-testid="profile-button"
            className={classes.popover_btn}
            aria-describedby={id}
            onClick={handleClick}
          >
            <Avatar src={imgUrl} className={classes.avatar}>
              {initial}
            </Avatar>
          </IconButton>
          <Popover
            id={id}
            open={popperOpen}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              style: {
                backgroundColor: "transparent",
                borderRadius: 0,
              },
            }}
          >
            <div className={classes.logout}>
              <div className={classes.logout_header}>
                <input
                  accept="image/*"
                  id="icon-button-file"
                  className={classes.logout_input}
                  type="file"
                  data-testid="file-input"
                  onChange={handleUpload}
                />
                <label htmlFor="icon-button-file">
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    className={classes.logout_upload}
                  >
                    <Avatar src={imgUrl} alt="profile">
                      {initial}
                    </Avatar>
                    <span className={classes.camera_img_container}>
                      <img
                        src={CameraIcon}
                        alt="camera"
                        className={classes.camera_icon}
                      />
                    </span>
                  </IconButton>
                </label>
                <div>
                  <Typography color="primary" variant="body2">
                    {name}
                  </Typography>
                  <Typography color="textSecondary" variant="caption">
                    {locAdmin}
                  </Typography>
                </div>
              </div>
              <Divider className={classes.logout_divider} />
              <Button
                onClick={handleLogout}
                fullWidth
                color="primary"
                variant="contained"
                className={classes.logout_button}
                startIcon={<img src={LogoutIcon} alt="logout" />}
              >
                Logout
              </Button>
            </div>
          </Popover>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default CustomAppBar;
