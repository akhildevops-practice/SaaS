import { useState, useEffect } from "react";
import { Modal } from "antd";
import axios from "axios";
import moment from "moment";
// const url = "http://localhost:8888/.netlify/functions";
// const url = "https://calendar-weekly.netlify.app/.netlify/functions"
// const new_url = "http://localhost:3002/api/events"

type Props = {
  showEventsModal: boolean;
  setShowEventsModal: (showEventsModal: boolean) => void;
};
const new_url = "https://weekly-calendar.onrender.com/api/events";
const UpcomingEventsModal = ({
  showEventsModal,
  setShowEventsModal,
}: Props) => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetchEvents();
  }, []);
  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        // `${url}/getUpcomingEvents`
        `${new_url}/getUpcomingEvents`
      );
      console.log("upcomin events response-->", response.data);
      setEvents(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      title={"Upcoming Events"}
      centered
      open={showEventsModal}
      okButtonProps={{ style: { display: "none" } }}
      cancelButtonProps={{ style: { display: "none" } }}
      onCancel={() => setShowEventsModal(!showEventsModal)}
      style={{
        minHeight: "min-content",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "350px",
          minHeight: "max-content",
          overflowY: "scroll",
        }}
      >
        {!!events.length &&
          events.map((e: any) => (
            <div
              key={e.id}
              style={{
                backgroundColor: `${e.color}`,
                boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)",
                marginTop: "15px",
                padding: "10px",
                width: "80%",
                borderRadius: "5px",
                // opacity: "0.8",
              }}
            >
              {/* {console.log(moment(e.startAt, "YYYY/MM/DD HH:mm"))} */}
              <b>
                {moment(e.startAt).format("MMM DD HH:mm")} - {e.summary}
              </b>
            </div>
          ))}
      </div>
    </Modal>
  );
};

export default UpcomingEventsModal;
