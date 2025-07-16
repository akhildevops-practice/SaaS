import { makeStyles } from "@material-ui/core";
import { Col, Drawer, Modal, Row } from "antd";
import { useEffect } from "react";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
const useStyles = makeStyles((theme) => ({
  docDetailsDrawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
  },
}));

type Props = {
  detailsDrawer: any;
  setDetailsDrawer: any;
  formData: any;
  toggleDetailsDrawer: any;
};

const CaraDetailsDrawer = ({
  detailsDrawer,
  setDetailsDrawer,
  formData,
  toggleDetailsDrawer,
}: Props) => {
  const classes = useStyles();
  // console.log("formdata in caradetails", formData);
  return (
    <Modal
      title={"CAPA Details"}
      // placement="top"
      open={detailsDrawer.open}
      closable={true}
      onCancel={toggleDetailsDrawer}
      // height={150}
      centered
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      footer={false}
      maskClosable={false}
      // className={classes.docDetailsDrawer}
      // style={{ overflow: "hidden" }}
      width={500}
      getContainer={false}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <b>Unit:</b> {!!formData && formData?.locationDetails?.locationName}
        </Col>
        <Col span={12}>
          <b>Registered By:</b> {!!formData && formData?.registeredBy?.username}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <b>CAPA Owner :</b>{" "}
          {formData?.caraOwner?.name ? formData?.caraOwner?.name : ""}
        </Col>
        {formData.status === "Rejected" && (
          <Col span={12}>
            <b>Reason for Rejection :</b> {formData?.comments}
          </Col>
        )}
      </Row>
    </Modal>
  );
};

export default CaraDetailsDrawer;
