import { Modal } from "antd";
import { makeStyles } from "@material-ui/core/styles";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import moment from 'moment';
const useStyles = makeStyles({
  modalContent: {
    padding: "5px",
    backgroundColor: "#f5f5f5", // Greyish background
  },
  infoRow: {
    marginBottom: "5px",
    padding: "5px",
  },
  label: {
    fontWeight: "bold",
    marginRight: "10px",
  },
  actionButton: {
    marginTop: "18px",
    float: "right",
    backgroundColor: "#006ead",
    color: "white",
    "&:hover": {
      backgroundColor: "#006ead !important",
    },
  },
  modalStyle: {
    "& .ant-modal-content": {
      // height: "60vh", // or any other value you prefer
      overflowY: "auto",
    },
  },
});
type Props = {
  calendarData?: any;
  calendarModalInfo?: any;
  toggleCalendarModal?: any;
};
const CalendarModal = ({
  calendarData,
  calendarModalInfo,
  toggleCalendarModal,
}: Props) => {
  const classes = useStyles();

  const isMR = checkRoles(roles.MR);
  const isAuditor = checkRoles(roles.AUDITOR);
  const isOrgAdmin = checkRoles("ORG-ADMIN");

  const newData = [{ name: 'ab' }, { name: 'bc' }]
  return (
    <Modal
      title="Meeting Info"
      centered
      open={calendarModalInfo.open}
      footer={null}
      onCancel={toggleCalendarModal}
      rootClassName={classes.modalStyle}
    >
      <>
        <div className={classes.modalContent}>
          <div className={classes.infoRow}>
            <span className={classes.label}>Title :</span>
            {calendarModalInfo?.data?.title}
          </div>
          <div className={classes.infoRow}>
            <span className={classes.label}>Organizer :</span>
            {calendarModalInfo?.data?.allData?.userName || ''}
          </div>
          <div className={classes.infoRow}>
            <span className={classes.label}>Unit :</span>
            {calendarModalInfo?.data?.allData?.unit?.locationName || ''}
          </div>
          <div className={classes.infoRow}>
            <span className={classes.label}>Meeting Date :</span>
            {calendarModalInfo?.data?.allData?.value?.meetingdate ? moment(calendarModalInfo?.data?.allData?.value?.meetingdate).format('DD-MM-YYYY') : '-'}
          </div>
          <div className={classes.infoRow}>
            <span className={classes.label}>Systems :</span>
            {calendarModalInfo?.data?.allData?.systemData && calendarModalInfo?.data?.allData?.systemData.length && calendarModalInfo?.data?.allData?.systemData.map((item: any) => item.name).join(", ")}
          </div>
        </div>
      </>
    </Modal>
  );
};
export default CalendarModal;
