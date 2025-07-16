import { Typography, Grid } from "@material-ui/core";
import NotificationCard from "../../components/NotificationCard";
import { MdHighlightOff } from 'react-icons/md';
import Button from "@material-ui/core/Button";
import { useRecoilValue } from "recoil";
import { mobileView } from "../../recoil/atom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { notificationData } from "../../recoil/atom";
import { useRecoilState } from "recoil";
import { useStyles } from "./styles";
import {
  clearNotifications,
  getAllNotifications,
} from "../../apis/notificationsApi";

type props = {};

const NotificationPage = ({}: props) => {
  const classes = useStyles();
  const mobView = useRecoilValue(mobileView);
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!mobView) {
      navigate("/dashboard");
    }
  }, [mobView]);

  return (
    <>
      <Typography className={classes.header}>Notification</Typography>
      {notifications?.today?.length === 0 &&
      notifications?.yesterday?.length === 0 &&
      notifications?.older?.length === 0 ? (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          style={{ height: "100vh" }}
          className={classes.noNotificationsText}
        >
          <em>No notifications to display here!</em>
        </Grid>
      ) : (
        <>
          <div>
            <div className={classes.hideScroll}>
              <div className={classes.notificationWrapper}>
                <div>
                  {notifications?.today?.length > 0 && (
                    <strong className={classes.sectionHeader}>Today</strong>
                  )}
                </div>
                {notifications?.today?.map((item: any, index: number) => (
                  <NotificationCard
                    id={item.id}
                    text={item.text}
                    status={item.read}
                    date={item.date.split("T")[0]}
                    type={item.style}
                    content={item.content}
                    typeOfNoti={item.type}
                    key={index}
                  />
                ))}
                <div>
                  {notifications?.yesterday?.length > 0 && (
                    <>
                      <br />
                      <strong className={classes.sectionHeader}>
                        Yesterday
                      </strong>
                    </>
                  )}
                </div>
                {notifications?.yesterday?.map((item: any, index: number) => (
                  <NotificationCard
                    id={item.id}
                    text={item.text}
                    status={item.read}
                    date={item.date.split("T")[0]}
                    type={item.style}
                    content={item.content}
                    typeOfNoti={item.type}
                    key={index}
                  />
                ))}
                <div>
                  {notifications?.older?.length > 0 && (
                    <>
                      <br />
                      <strong className={classes.sectionHeader}>Older</strong>
                    </>
                  )}
                </div>
                {notifications?.older?.map((item: any, index: number) => (
                  <NotificationCard
                    id={item.id}
                    text={item.text}
                    status={item.read}
                    date={item.date.split("T")[0]}
                    type={item.style}
                    content={item.content}
                    typeOfNoti={item.type}
                    key={index}
                  />
                ))}
              </div>
            </div>
          </div>
          <Grid container justifyContent="center">
            <Button
              className={classes.cancelButton}
              startIcon={<MdHighlightOff />}
              onClick={clearAllNotifications}
              disableRipple={true}
            >
              Clear
            </Button>
          </Grid>
        </>
      )}
    </>
  );
};

export default NotificationPage;
