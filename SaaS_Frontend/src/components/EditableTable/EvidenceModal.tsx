import React from "react";
import { Button, Modal, Upload, Typography, Space, Table } from "antd";
import { InputBase } from "@material-ui/core";
import { FiUpload } from "react-icons/fi";
import { AiOutlinePaperClip, AiOutlineDelete } from "react-icons/ai";
import { useRecoilState } from "recoil";
import { auditCreationForm } from "recoil/atom";
import { cloneDeep } from "lodash";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import useStyles from "./modalStyle";



const { Text } = Typography;

type Props = {
  isVisible: boolean;
  onClose: () => void;
  val: any;
  handleChange: any;
  handleRemoveAttachment: any;
  isEditing: boolean;
  editIndex: number;
  i: number;
  setFileLinkCi: any;
  setCertifiOpen: any;
  data: any;
  addEvidence: any;
  disabled: boolean;
};


const EvidenceModal = ({
  isVisible,
  onClose,
  val,
  handleChange,
  handleRemoveAttachment,
  isEditing,
  editIndex,
  data,
  i,
  setFileLinkCi,
  setCertifiOpen,
  addEvidence,
  disabled,
}: Props) => {
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);
  const classes = useStyles();


  const handleManageEvidence = (
    index: string,
    indexOfEvidence: number,
    name: string,
    value: any
  ) => {
    const [checklistId, sectionId, questionId] = index.split(".");
    const copyOfState: any = cloneDeep(template);

    if (name === "text") {
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence[indexOfEvidence].text = value.target.value;

      setTemplate(copyOfState);
    }
  };
  const columns = [
    {
      title: "Evidence",
      dataIndex: "text",
      key: "text",
      width: 500, // Set a fixed width for the Evidence column
      render: (text: string, record: any, index: number) =>
        isEditing  ? (
          <InputBase
            multiline
            name="evidence"
            onChange={(e) =>
              handleManageEvidence(val?.questionNumber, index, "text", e)
            }
            value={text}
            style={{
              width: "100%",
              border: "1px solidrgb(18, 3, 3)", // Add a border to make it look like an input field
              borderRadius: "4px", // Optional: Add border radius for better appearance
              padding: "4px 8px", // Optional: Add padding for better appearance
            }}
          />
        ) : (
          <Text>{text}</Text>
        ),
    },
    {
      title: "Attachment",
      key: "attachment",
      render: (_: any, record: any, index: number) => (
        <Space direction="vertical">
          {record.attachment?.map((file: any) => (
            <div key={file.uid} className="attachment-item">
              <AiOutlinePaperClip />
              <Text
                onClick={() => {
                  setFileLinkCi(file);
                  setCertifiOpen(true);
                }}
                style={{
                  fontSize: "11px",
                  cursor: "pointer",
                  color: "#1890ff",
                }}
              >
                {file?.name?.length > 20
                  ? `${file?.name.substring(0, 20)}...`
                  : file?.name}
              </Text>
              {isEditing  && (
                <Button
                  type="text"
                  size="small"
                  icon={<AiOutlineDelete />}
                  onClick={() =>
                    handleRemoveAttachment(file, index, val?.questionNumber)
                  }
                  disabled={disabled}
                />
              )}
            </div>
          ))}
          {isEditing && (
            <Upload
              action={""}
              accept=".jpeg,.png,.jpg,.JPEG,.PNG,.JPG"
              onChange={handleChange(val?.questionNumber, index, val)}
              showUploadList={false}
            >
              <Button icon={<FiUpload />} disabled={disabled}>
                Upload
              </Button>
            </Upload>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title="Evidence Upload"
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={900}
      bodyStyle={{ padding: "24px" }}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
    >
      {isEditing && editIndex === i && (
        <Button
          type="primary"
          style={{ marginBottom: "16px" }}
          onClick={() => addEvidence(val?.questionNumber)}
        >
          Add Evidence
        </Button>
      )}
    <div className={classes.clauseTableContainer}>
      <Table
        dataSource={data[i]?.evidence || []}
        columns={columns}
        pagination={false}
        rowKey={(_, index) => `evidence-${index}`}
        bordered
      />
      </div>
    </Modal>
  );
};

export default EvidenceModal;
