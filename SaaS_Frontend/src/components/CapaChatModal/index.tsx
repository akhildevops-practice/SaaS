import { makeStyles } from "@material-ui/core";
//antd
import { Modal } from "antd";
import { ReactComponent as CloseIcon } from "assets/documentControl/Close.svg";
import CapaChatComponent from "components/CapaChatComponent";
import CommonChatComponent from "components/ChatSupport/CommonChatComponent";

const useStyles1 = makeStyles({
  app: {
    textAlign: "center",
    marginTop: 20,
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    minHeight: "430px",
    maxHeight: "510px",
    overflowY: "auto",
  },
  botModal: {
    "& .ant-modal-content": {
      padding: "10px !important",
    },
    "& .ant-modal-close": {
      top: "2px !important",
      insetInlineEnd: "8px !important",
    },
    "& .ant-modal-body": {
      padding: "10px !important",
    },
  },
});

type Props = {
  chatModalOpen: any;
  toggleChatModal: any;
};
const CapaChatModal = ({ chatModalOpen, toggleChatModal }: Props) => {
  const classes1 = useStyles1();
  return (
    <Modal
      open={chatModalOpen}
      onCancel={toggleChatModal}
      destroyOnClose
      key="modal4"
      footer={null} // No footer
      closeIcon={<CloseIcon style={{ width: "32px", height: "32px" }} />}
      className={classes1.botModal}
      centered
      width="75%"
      style={{
        width: "75%", // Fixed width of the modal
      }}
      title={
        <div
          style={{
            textAlign: "center",
            fontSize: "16px",
            borderBottom: "1px solid rgba(0, 34, 78, 0.45)",
            paddingBottom: 15,
          }}
        >
          Capa Chat
        </div>
      }
    >
      <div className={classes1.app}>
        <CommonChatComponent
          chatApiUrl="chat_capa"
          transformResponse={(res: any) => ({
            text: res?.data?.data?.answer,
            highlightText: res?.data?.data?.highlight_text,
            sources: res?.data?.data?.sources,
            sender: "bot",
            timestamp: new Date(),
          })}
        />
      </div>
    </Modal>
  );
};

export default CapaChatModal;
