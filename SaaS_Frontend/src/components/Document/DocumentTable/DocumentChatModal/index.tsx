import { makeStyles } from "@material-ui/core";
//antd
import { Modal } from "antd";
import { ReactComponent as CloseIcon } from "assets/documentControl/Close.svg";
import CommonChatComponent from "components/ChatSupport/CommonChatComponent";

const useStyles1 = makeStyles({
  app: {
    textAlign: "center",
    marginTop: 20,
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    // height: "420px", // Fixed height of the modal content area
    minHeight: "430px",
    maxHeight: "510px",
    overflowY: "auto",
  },
  questionBlock: {
    margin: "20px auto",
    // padding: 20,
    border: "1px solid #ccc",
    borderRadius: 8,
    maxWidth: 600,
  },
  formControl: {
    marginBottom: 15,
  },
  botModal: {},
});

type Props = {
  chatModalOpen: any;
  handleCloseChatModal: any;
};
const DocumentChatModal = ({ chatModalOpen, handleCloseChatModal }: Props) => {
  const classes1 = useStyles1();
  return (
    <Modal
      open={chatModalOpen}
      onCancel={handleCloseChatModal}
      destroyOnClose
      key="modal4"
      footer={null} // No footer
      closeIcon={
        <CloseIcon
          style={{
            width: "32px",
            height: "32px",
            // margin: "10px 0px",
          }}
        />
      }
      title={
        <div
          style={{
            textAlign: "center",
            width: "100%",
            fontSize: "16px",
            borderBottom: "1px solid rgba(0, 34, 78, 0.45)",
            paddingBottom: "15px",
          }}
        >
          Document Chat
        </div>
      }
      className={classes1.botModal}
      centered // Ensures the modal is centered
      style={{
        width: "75%", // Fixed width of the modal
      }}
      width={"75%"} // Fixed width of the modal
      // bodyStyle={{
      //   padding: "10px", // Adds padding inside the modal content area
      // }}
    >
      <div className={classes1.app}>
        <CommonChatComponent
          chatApiUrl="chat"
          transformResponse={(res: any) => ({
            text: res.data?.generatedResponse,
            sender: "bot",
            timestamp: new Date(),
          })}
        />
      </div>
    </Modal>
  );
};

export default DocumentChatModal;
