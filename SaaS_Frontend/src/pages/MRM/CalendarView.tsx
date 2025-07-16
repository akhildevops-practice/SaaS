import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import { mobileView } from "../../recoil/atom";
import { useRecoilValue } from "recoil";
import axios from "../../apis/axios.global";
import "./calenderstyle.css";
import ScheduleDrawer from "./Drawer/ScheduleDrawer";
import { useLocation } from "react-router-dom";

function CalendarView() {
  const mobileViewState = useRecoilValue(mobileView);

  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [expandDataValues, setExpandDataValues] = useState<any>({});
  const [mode, setMode] = useState<any>("Create");
  const [openScheduleDrawer, setOpenScheduleDrawer] = useState<boolean>(false);

  const calendar = useRef<InstanceType<typeof FullCalendar>>(null);
  const orgId = sessionStorage.getItem("orgId");

  const locationState = useLocation();

  useEffect(() => {
    getAllMRM();
  }, []);

  useEffect(() => {
    if (locationState.state && locationState.state?.drawerOpen) {
      // Open the drawer
      handleDrawer();
      setExpandDataValues(locationState.state?.dataValues);
    }
  }, [locationState]);

  const getAllMRM = async () => {
    try {
      const newPayload = {
        orgId: orgId,
        locationId: "All",
      };

      const res = await axios.get("/api/mrm/getScheduleDetails", {
        params: newPayload,
      });
      if (res.status === 200 || res.status === 201) {
        const data = res.data || [];
        const newData: any = [];
        data?.map((item: any) => {
          newData.push({
            id: item?.value?._id,
            title: item?.value?.meetingName ?? "-",
            start: item?.value?.meetingdate ? item?.value?.meetingdate : "-",
            allDay: false,
            className: "audit-entry",
            textColor: "#000000",
            allData: item,
            // url: `/audit/auditreport/newaudit/${item._id}`,
          });
        });
        setCalendarData([...newData]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleScheduleDrawerClose = () => {
    setOpenScheduleDrawer(false);

    getAllMRM();
  };
  const handleDrawer = (data?: any) => {
    if (data) {
      const newData = {
        unit: data?.value?.unitId,
        system: data?.value?.systemId,
        meetingTitle: data?.value?.meetingName,
        date: data?.value?.meetingdate,
        period: data?.value?.period,
        organizer: data?.userName,
        meetingDescription: data?.value?.description,
        dataValue: data?.value?.keyAgendaId,
        attendees: data?.value?.attendees,
        meetingMOM: data?.value?.notes,
        _id: data?.value?._id,
      };
      setExpandDataValues(newData);
    }
    setOpenScheduleDrawer(!openScheduleDrawer);
    if (openScheduleDrawer) {
      getAllMRM();
    }
  };

  return (
    <>
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin]}
        initialView="timeGridWeek"
        dayMaxEvents={true}
        eventMaxStack={mobileViewState ? 0 : 5}
        select={() => console.log("event clicked ")}
        eventClick={(value: any) => {
          handleDrawer(value?.event?.extendedProps?.allData || {});
        }}
        height="100vh"
        headerToolbar={{
          left: "prev next today",
          center: "title",
          right: "timeGridDay timeGridWeek dayGridMonth",
        }}
        nowIndicator={false}
        events={calendarData}
        displayEventTime={false}
        titleFormat={{ year: "numeric", month: "long", day: "numeric" }}
        dayHeaderFormat={{
          weekday: "short",
          month: "numeric",
          day: "numeric",
          omitCommas: true,
        }}
        slotDuration="00:30:00"
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          omitZeroMinute: false,
          meridiem: false,
          hour12: true,
        }}
        ref={calendar}
      />
      {openScheduleDrawer && (
        <ScheduleDrawer
          openScheduleDrawer={openScheduleDrawer}
          setOpenScheduleDrawer={setOpenScheduleDrawer}
          expandDataValues={expandDataValues}
          handleDrawer={handleDrawer}
          mode={mode}
          mrm={false}
          scheduleData={undefined}
          unitSystemData={undefined}
          mrmEditOptions={undefined}
          status={undefined}
          setStatusMode={undefined}
        />
      )}
    </>
  );
}

export default CalendarView;
