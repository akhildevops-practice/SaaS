import {
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Switch,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import Dragger from "antd/es/upload/Dragger";
import ActivityUpdateTable from "components/CIPManagement/CIPTable/CIPDrawer/StakeHolders/ActionItem/ActivityUpdateTable";
import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { activityUpdateData } from "recoil/atom";

const ActionItemsForCapa = () => {
  const [open, setOpen] = useState(false);
  const HeadersData = ["Activity Comments", "Activity Date"];
  const FieldsData = ["comments", "date"];
  const [activityUpdate, setActivityUpdate] =
    useRecoilState(activityUpdateData);

  const actionData: any = {
    isAction: true,
    actions: [
      {
        label: "Edit",
        icon: "icon",
        handler: () => console.log("handler"),
      },
    ],
  };

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Action Item For Capa
      </Button>
      <Modal
        title="Add Action Item"
        centered
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width={1000}
      >
        <Form
          // form={actionItemForm}
          layout="vertical"

          // rootClassName={classes.labelStyle}
          // disabled={disableFormFields}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="ActionItem: "
                name="title"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Action Item Name!",
                  },
                ]}
              >
                <Input
                  name="title"
                  placeholder="Enter Action Item Name"
                  size="large"
                  // onChange={(e: any) => handleInputChange(e)}
                  // value={formData?.title}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Owner: "
                name="owner"
                rules={[
                  {
                    required: true,
                    message: "Please select a user!",
                  },
                ]}
              >
                <AutoComplete
                // suggestionList={user}
                // name={"Owner Name"}
                // keyName={"owner"}
                // formData={formData}
                // setFormData={setFormData}
                // getSuggestionList={getSuggestionListUser}
                // labelKey="username"
                // multiple={false}
                // defaultValue={formData?.owner}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Start Date: "
                name="startDate"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Start Date!",
                  },
                ]}
              >
                <Input
                  name="startDate"
                  type="date"
                  size="large"
                  // onChange={(e: any) => handleInputChange(e)}
                  // value={formData?.startDate}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Target Date: "
                name="endDate"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Target Date!",
                  },
                ]}
              >
                <Input
                  name="endDate"
                  type="date"
                  size="large"
                  // onChange={(e: any) => handleInputChange(e)}
                  // value={formData?.endDate}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={4}>
              <Form.Item label="Status " name="status">
                <Switch
                  // checked={formData.status}
                  style={{
                    backgroundColor: "#00356",
                  }}
                  // className={classes.switch}
                  // onChange={() =>
                  //   setFormData({
                  //     ...formData,
                  //     status: !formData.status,
                  //   })
                  // }
                />
              </Form.Item>
            </Col>
            <Col span={20}>
              <Form.Item
                label="Description "
                name="description"
                rules={[
                  {
                    required: false,
                    message: "Please Enter description!",
                  },
                ]}
              >
                <TextArea
                  rows={1}
                  autoSize={{ minRows: 1, maxRows: 6 }}
                  placeholder="Enter description"
                  size="large"
                  name="description"
                  // onChange={(e: any) => handleInputChange(e)}
                  // value={formData?.description}
                />
              </Form.Item>
            </Col>
          </Row>
          <ActivityUpdateTable
            header={HeadersData}
            fields={FieldsData}
            data={activityUpdate}
            setData={setActivityUpdate}
            isAction={actionData.isAction}
            actions={actionData.actions}
            addFields={true}
            label={"Add Item"}
          />
          <Row gutter={[16, 16]} style={{ marginBottom: "30px" }}>
            <Col span={4}></Col>
          </Row>
          <Row
            gutter={[16, 16]}
            style={{ height: "auto", marginBottom: "30px" }}
          >
            <Col span={24}>
              <Form.Item name="uploader" style={{ display: "none" }}>
                <Input />
              </Form.Item>
              <Dragger name="files">
                <div style={{ textAlign: "center" }}>
                  {/* <InboxIcon style={{ fontSize: "36px" }} /> */}
                  <p className="ant-upload-text">
                    Click or drag files here to upload
                  </p>
                </div>
              </Dragger>
              {/* <Grid item sm={12} md={4}></Grid> */}
              {/* <Grid item sm={12} md={8} className={classes.formBox}>
                      {!!formData?.additionalInfo?.attachments &&
                        !!formData?.additionalInfo?.attachments?.length && (
                          <div>
                            <Typography
                              variant="body2"
                              style={{
                                marginTop: "16px",
                                marginBottom: "8px",
                              }}
                            >
                              Uploaded Files:
                            </Typography>

                            {formData?.additionalInfo?.attachments?.map(
                              (item: any, index: number) => (
                                <div
                                  key={index}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <a
                                    key={index}
                                    href={item.documentLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: "block",
                                      color: "#1890ff",
                                      textDecoration: "none",
                                      marginRight: "8px", // This gives some space to the delete icon
                                    }}
                                  >
                                    
                                    {item.fileName}
                                  </a>
                                  <div
                                    style={{
                                      cursor: "pointer",
                                      marginRight: "8px",
                                    }}
                                    onClick={() =>
                                      handleDeleteFile(item.documentLink)
                                    }
                                  >
                                    <DeleteIcon style={{ fontSize: "18px" }} />
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </Grid> */}
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ActionItemsForCapa;
