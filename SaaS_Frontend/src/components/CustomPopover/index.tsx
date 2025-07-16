import React from "react";
import { ClickAwayListener } from "@material-ui/core";
import Popper, { PopperPlacementType } from "@material-ui/core/Popper";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Fade from "@material-ui/core/Fade";
import Paper from "@material-ui/core/Paper";
import { MdHighlightOff } from 'react-icons/md';
import NotificationCard from "../NotificationCard";
import { useStyles } from "./styles";
import { notificationData } from "../../recoil/atom";
import { useRecoilState } from "recoil";
import {
  clearNotifications,
  getAllNotifications,
} from "../../apis/notificationsApi";

type props = {
  children: any;
  notificationList?: any;
};

/**
 *
 * @description Custom react function component to generate a popover
 * @types children {any}
 * @returns a react node
 */
//Pass notification list array as props
const CustomPopover = ({ children }: props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<PopperPlacementType>();
  const [status, setStatus] = React.useState<any>();
  const classes = useStyles();
  const [notifications, setNotifications] =
    useRecoilState<any>(notificationData);

  /**
   * @method fetchNotifications
   * @description Function to fetch notifications
   * @returns return a notification list
   */
  const fetchNotifications = () => {
    getAllNotifications()
      .then((response: any) => {
        setNotifications(response?.data);
      })
      .catch((error: any) => console.log({ error }));
  };

  /**
   * @method handleClick
   * @description Function to handle popper button click to open or close the popover screen
   * @param newPlacement {PopperPlacementType}
   * @param event {React.MouseEvent<HTMLButtonElement>}
   * @returns
   */
  const handleClick =
    (newPlacement: PopperPlacementType) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen((prev) => placement !== newPlacement || !prev);
      setPlacement(newPlacement);
    };

  /**
   * @method handleClick
   * @description Function to clear all notifications
   * @returns nothing
   */
  const clearAllNotifications = () => {
    clearNotifications()
      .then(() => {
        fetchNotifications();
      })
      .catch((error: any) => console.log({ error }));
  };

  const closePopper = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={closePopper}>
      <div className={classes.root}>
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement={placement}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={0}>
              <Paper className={classes.paper}>
                {!notifications && (
                  <div className={classes.hideScroll}>
                    <div className={classes.notificationWrapper}>
                      <div className={classes.labelMargin}>
                        <Grid
                          container
                          justifyContent="center"
                          alignItems="center"
                          style={{ height: "100%", textAlign: "center" }}
                          // className={classes.noNotificationsText}
                        >
                          <em>
                            Oops....something went wrong!
                            <br />
                            <br />
                            We are unable to fetch active notifications for
                            listing them here.
                          </em>
                        </Grid>
                      </div>
                    </div>
                  </div>
                )}
                {notifications?.today?.length === 0 &&
                notifications?.yesterday?.length === 0 &&
                notifications?.older?.length === 0 ? (
                  <div className={classes.hideScroll}>
                    <div className={classes.notificationWrapper}>
                      <div className={classes.labelMargin}>
                        <Grid
                          container
                          justifyContent="center"
                          alignItems="center"
                          style={{ height: "100%" }}
                        >
                          <em>No notifications to display here!</em>
                        </Grid>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={classes.hideScroll}>
                      <div className={classes.notificationWrapper}>
                        <div className={classes.labelMargin}>
                          {notifications?.today?.length > 0 && (
                            <strong>Today</strong>
                          )}
                        </div>
                        {notifications?.today?.map(
                          (item: any, index: number) => (
                            <div>
                              <NotificationCard
                                id={item.id}
                                text={item.text}
                                date={item.date.split("T")[0]}
                                type={item.style}
                                status={item.read}
                                key={index}
                                content={item.content}
                                typeOfNoti={item.type}
                              />
                            </div>
                          )
                        )}
                        <div className={classes.labelMargin}>
                          {notifications?.yesterday?.length > 0 && (
                            <>
                              <br />
                              <strong>Yesterday</strong>
                            </>
                          )}
                        </div>
                        {notifications?.yesterday?.map(
                          (item: any, index: number) => (
                            <div>
                              <NotificationCard
                                id={item.id}
                                text={item.text}
                                date={item.date.split("T")[0]}
                                type={item.style}
                                status={item.read}
                                key={index}
                                content={item.content}
                                typeOfNoti={item.type}
                              />
                            </div>
                          )
                        )}
                        <div className={classes.labelMargin}>
                          {notifications?.older?.length > 0 && (
                            <>
                              <br />
                              <strong>Older</strong>
                            </>
                          )}
                        </div>
                        {notifications?.older?.map(
                          (item: any, index: number) => (
                            <div>
                              <NotificationCard
                                id={item.id}
                                text={item.text}
                                date={item.date.split("T")[0]}
                                type={item.style}
                                status={item.read}
                                key={index}
                                content={item.content}
                                typeOfNoti={item.type}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <Button
                      className={classes.cancelButton}
                      startIcon={<MdHighlightOff />}
                      onClick={clearAllNotifications}
                      disableRipple={true}
                    >
                      Clear
                    </Button>
                  </>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
        <Grid container justifyContent="center">
          <Grid item>
            <IconButton
              disableRipple={true}
              className={open ? classes.buttonContainer : ""}
              onClick={handleClick("bottom")}
            >
              {children}
            </IconButton>
          </Grid>
        </Grid>
      </div>
    </ClickAwayListener>
  );
};

export default CustomPopover;
