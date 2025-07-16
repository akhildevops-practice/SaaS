import React, { useEffect, useRef, useState } from "react";
import Kalend, { CalendarView } from "kalend";
import "kalend/dist/styles/index.css";
import UpcomingEventsModal from "components/ReusableCalendar/UpcomingEventsModal";
import dayjs from "dayjs";
import "./styles.css";

type Props = {
  events?: any;
  toggleCalendarModal?: any;
  calendarFor?: string;
};

const colors = [
  "hotpink", //default kalend color
  "orange", //light orange - tomato
  "dodgerblue", //dodgerblue
  "orchid", //orchid
  "lightseagreen", //sea green
  "sandybrown", //brown
  "bisque", //bisque
];

const ReusableCalendar = ({
  events = [],
  toggleCalendarModal,
  calendarFor = "",
}: Props) => {
  const [showEventsModal, setShowEventsModal] = useState<any>(false);
  const [calendarEvents, setCalendarEvents] = useState<any>([]);
  const auditScheduleCalendarRef = useRef<any>(null);
  const auditReportCalendarRef = useRef<any>(null);
  useEffect(() => {
    console.log("check events in reusable calendar useEffect[events]", events);

    const formatEvents = events.map((event: any) =>
      convertScheduleDataToEvent(event)
    );
    console.log("check formatEvents for AuditSchedule", formatEvents);

    setCalendarEvents(formatEvents);
  }, [events]);

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const convertScheduleDataToEvent = (data: any) => {
    const startAt = dayjs(data?.time).toISOString();
    const endAt = dayjs(data?.time).add(30, "minutes").toISOString();
    const color = data?.color || getRandomColor();

    return {
      ...data,
      id: data.id,
      summary: data.title,
      color: color,
      startAt: startAt,
      endAt: endAt,
    };
  };

  const converReportDataToEvent = (data: any) => {
    const startAt = dayjs(data.date).toISOString();
    const endAt = dayjs(data.date).add(30, "minutes").toISOString();
    const color = data?.color || getRandomColor();

    return {
      ...data,
      id: data.id,
      summary: data.auditName,
      color: color,
      startAt: startAt,
      endAt: endAt,
    };
  };

  const onEventClick = (data: any) => {
    console.log("check on Event Click", data);
    toggleCalendarModal(data);

    // setId(data.id);
    // setToggleModal({ open: true, type: "update" });
  };

  // Callback after drag and drop is finished
  const onEventDragFinish = (prev: any, current: any, data: any) => {
    // console.log("on drag finish prev", prev);
    // console.log("on drag finish current", current);
  };

  return (
    <>
      {calendarFor === "AuditSchedule" ? (
        <Kalend
          kalendRef={auditScheduleCalendarRef}
          // onNewEventClick={onNewEventClick}
          initialView={CalendarView.WEEK}
          disabledViews={[
            // CalendarView.DAY,
            // CalendarView.MONTH,
            CalendarView.THREE_DAYS,
            CalendarView.AGENDA,
          ]}
          onEventClick={onEventClick}
          events={calendarEvents}
          initialDate={new Date().toISOString()}
          hourHeight={50}
          disabledDragging={true}
          // draggingDisabledConditions={}
          newEventText="New Eventvsdf"
          timezone={"Asia/Kolkata"}
          onEventDragFinish={onEventDragFinish}
          // onStateChange={props.onStateChange}
          // selectedView={props.selectedView}
          showTimeLine={true}
          isDark={false}
          autoScroll={true}
        />
      ) : (
        <Kalend
          kalendRef={auditReportCalendarRef}
          // onNewEventClick={onNewEventClick}
          initialView={CalendarView.WEEK}
          disabledViews={[
            // CalendarView.DAY,
            // CalendarView.MONTH,
            CalendarView.THREE_DAYS,
            CalendarView.AGENDA,
          ]}
          onEventClick={onEventClick}
          events={calendarEvents}
          initialDate={new Date().toISOString()}
          hourHeight={50}
          disabledDragging={true}
          // draggingDisabledConditions={}
          newEventText="New Eventvsdf"
          timezone={"Asia/Kolkata"}
          onEventDragFinish={onEventDragFinish}
          // onStateChange={props.onStateChange}
          // selectedView={props.selectedView}
          showTimeLine={true}
          isDark={false}
          autoScroll={true}
        />
      )}

      {!!showEventsModal && (
        <UpcomingEventsModal
          showEventsModal={showEventsModal}
          setShowEventsModal={setShowEventsModal}
        />
      )}
    </>
  );
};
export default ReusableCalendar;
