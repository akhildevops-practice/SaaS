import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import prodleLogo from "../../assets/logo/ProcessridgeLogoWhite.svg";
import { MdMenu } from 'react-icons/md';
import useStyles from "./styles";
import Drawer from "@material-ui/core/Drawer";
import SideBarNavLinks from "../MobileTopBarNavLinks";
import { MdOutlineCancel } from 'react-icons/md';
import { Typography } from "@material-ui/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { avatarUrl } from "../../recoil/atom";
import Avatar from "@material-ui/core/Avatar";
import getToken from "../../utils/getToken";
import parseToken from "../../utils/parseToken";
import locationAdmin from "../../utils/locationAdmin";
import CameraIcon from "../../assets/icons/camera.svg";
import { getUserInfo } from "../../apis/socketApi";
import { postAvatar } from "../../apis/appbarApi";
import { useSnackbar } from "notistack";
import setAvatar from "../../utils/setAvatar";
import { API_LINK } from "../../config";
import { currentOrg } from "../../recoil/atom";

type Props = {
  open: boolean;
  handleDrawerClose: () => void;
  handleDrawerOpen: () => void;
  handleLogout: any;
};

/**
 * @param open State to determine if drawer should be open
 * @param handleDrawerOpen To handle the App Bar Drawer open in mobile view
 * @param handleDrawerClose To handle the App Bar Drawer close in mobile view
 * @param handleLogout To handle user logout
 *
 * @returns Mobile View App Bar
 */

function CustomMobileViewAppBar({
  open,
  handleDrawerClose,
  handleDrawerOpen,
  handleLogout,
}: Props) {
  const classes = useStyles();
  const orgName = useRecoilValue(currentOrg);
  const { enqueueSnackbar } = useSnackbar();

  const [name, setName] = React.useState<string>("");
  const [initial, setInitial] = React.useState<string>("");
  const [locAdmin, setLocAdmin] = React.useState<string>();
  const [imgUrl, setImgUrl] = useRecoilState<any>(avatarUrl);

  const getName = (): string => {
    return parseToken(getToken()).name;
  };

  const getAvatarImage = () => {
    let imageName: any;
    getUserInfo().then((response: any) => {
      imageName = response?.data?.avatar;
      setImgUrl(imageName);
    });
  };

  const getInitials = (name: string) => {
    const initials = name
      ?.split(" ")
      ?.map((name) => name[0])
      ?.slice(0, 2)
      ?.join("");
    return initials;
  };

  /**
   * @description handles image upload
   * @param e
   */
  const handleUpload = async (e: any): Promise<void> => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    // const locationNew = formData.getAll('locationId')
    // console.log("location",locationNew)
    try {
      const res = await postAvatar(formData);
      if (res?.status === 201) {
        getUserInfo()
          ?.then((response) => {
            setAvatar(response?.data.avatar);
            setImgUrl(response?.data.avatar);
          })
          .catch((error: any) => console.log({ error }));
      }
    } catch (error) {
      enqueueSnackbar(`Error Occured while uploading image`, {
        variant: "error",
      });
    }
  };

  React.useEffect(() => {
    const name = getName();
    setName(name);
    const initial = getInitials(name);
    setInitial(initial);
    const locAdminName = locationAdmin();
    setLocAdmin(locAdminName);

    getAvatarImage();
  }, []);

  const list = (anchor: any) => (
    <div className={classes.fullList} role="presentation">
      <div className={classes.grow}>
        <div className={classes.navTopArea}>
          <div className={classes.title}>
            <img
              src={prodleLogo}
              alt="Prodle"
              height="45"
              className={classes.logoMargin}
            />
          </div>
          <IconButton
            data-testid="drawer-close-button"
            onClick={() => {
              handleDrawerClose();
            }}
          >
            <MdOutlineCancel color="secondary" />
          </IconButton>
        </div>
        <SideBarNavLinks
          handleDrawerClose={handleDrawerClose}
          handleLogout={handleLogout}
        />
      </div>

      <div className={classes.logout}>
        <div className={classes.logout_header}>
          <input
            accept="image/*"
            id="icon-button-file"
            className={classes.logout_input}
            data-testid="file-input"
            type="file"
            onChange={handleUpload}
          />
          <label htmlFor="icon-button-file">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              className={classes.logout_upload}
            >
              <Avatar src={`${API_LINK}/${imgUrl}`} alt="profile">
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
            <Typography color="inherit" variant="body2">
              {name}
            </Typography>
            <Typography className={classes.logout_subtitle} variant="caption">
              {locAdmin}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <React.Fragment>
      <div>
        <AppBar position="static" className={classes.root}>
          <Toolbar className={classes.navTopArea}>
            <div className={classes.title}>
              <img src={prodleLogo} alt="Prodle" height="45" />
              <div className={classes.orgNameTextSection}>
                {orgName && (
                  <Typography className={classes.orgNameText}>
                    {orgName}
                  </Typography>
                )}
              </div>
            </div>
            <IconButton
              data-testid="drawer-open-button"
              onClick={() => {
                handleDrawerOpen();
              }}
            >
              <MdMenu color="secondary" />
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>
      <Drawer
        data-testid="drawer-container"
        anchor={"top"}
        open={open}
        onClose={handleDrawerClose}
      >
        {list("top")}
      </Drawer>
    </React.Fragment>
  );
}

export default CustomMobileViewAppBar;
