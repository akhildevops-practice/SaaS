import { Modal } from "antd";
import AuditScheduleFormStepper from "pages/AuditScheduleFormStepper";
import CloseIconImageSvg from "assets/documentControl/Close.svg";

type Props = {
  planId?: any;
  isModalVisible?: any;
  selectTableAuditType?: any;
  selectedLocation?: any;
  setIsModalVisible?: any;
};
const AuditScheduleModal = ({
  planId,
  isModalVisible,
  selectTableAuditType,
  selectedLocation,
  setIsModalVisible,
}: Props) => {
  return (
    <Modal
      title="Audit Schedule"
      visible={isModalVisible}
      width={1500}
      footer={null}
      onCancel={() => {
        setIsModalVisible(false);
      }}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
    >
      <AuditScheduleFormStepper
        dataFrom={planId}
        dataId={"plan"}
        modalWindow={true}
        auditType={selectTableAuditType}
        locationId={selectedLocation}
        setIsModalVisible={setIsModalVisible}
      />
    </Modal>
  );
};

export default AuditScheduleModal;
