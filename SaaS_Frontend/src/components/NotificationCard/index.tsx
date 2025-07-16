import { Grid, Typography } from "@material-ui/core";
import { useState } from "react";
import { useStyles } from "./styles";
import { useNavigate } from "react-router-dom";
import {
  changeNotificationStatus,
  getAllNotifications,
} from "../../apis/notificationsApi";
import { notificationData } from "../../recoil/atom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { tab } from "../../recoil/atom";
import CircularProgress from "@material-ui/core/CircularProgress";

type props = {
  id: any;
  type: any;
  text: string;
  date?: string;
  status?: boolean;
  content?: any;
  typeOfNoti?: any
};

/**
 * @description Functional component to generate a notification card (Based on the following types - warning, success and primary)
 * @param type {any}
 * @returns
 */
const NotificationCard = ({ id, type, text, date, status, content, typeOfNoti }: props) => {
  const classes: any = useStyles();
  const [isLoading, setIsLoading] = useState<any>(false);
  const [notifications, setNotfications] =
    useRecoilState<any>(notificationData);
  const setActiveTab = useSetRecoilState<any>(tab);
  const navigate = useNavigate();

  /**
   * @method fetchNotifications
   * @description Function to fetch all notifications
   */
  const fetchNotifications = () => {
    setIsLoading(true);
    getAllNotifications()
      .then((response: any) => {
        setNotfications(response?.data);
        setIsLoading(false);
      })
      .catch((error: any) => console.log({ error }));
  };

  /**
   * @method changeActionStatus
   * @description Function to change the notification read/unread state
   * @returns nothing
   */
  const changeActionStatus = (id: string, type: string, content:any) => {
    setIsLoading(true);
    changeNotificationStatus(id)
      .then(() => {
        fetchNotifications();
        if (type === "document") {
          navigate(
            `/processdocuments/processdocument/viewprocessdocument/${content}`
          );
          setActiveTab("processdocuments");
        } else if (type === "document_type") {
          return;
        }
        setIsLoading(false);
      })
      .catch((error: any) => {
        setIsLoading(false);
        console.log({ error });
      });
  };

  return (
    <>
      <Grid
        onClick={() => !isLoading && changeActionStatus(id, typeOfNoti, content)}
        direction="column"
        className={classes[!status ? `active${type}` : type]}
      >
        {isLoading ? (
          <CircularProgress
            size={40}
            thickness={1.7}
            className={classes[`loader${type}`]}
          />
        ) : (
          <>
            <Grid item>
              <Typography className={classes.text}>{text}</Typography>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default NotificationCard;
