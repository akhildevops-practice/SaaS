import { makeStyles, useMediaQuery } from "@material-ui/core";
import { Col, Drawer, Row } from "antd";
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
    // "& .ant-drawer-content": {
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
    // },
  },
}));

type Props = {
  detailsDrawer: any;
  setDetailsDrawer: any;
  formData: any;
  toggleDetailsDrawer: any;
};

const DetailsDrawer = ({
  detailsDrawer,
  setDetailsDrawer,
  formData,
  toggleDetailsDrawer,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles();
  useEffect(() => {
    console.log("in details drawer--->", formData);
  }, []);
  return (
    <Drawer
      title={"Document Details"}
      placement="top"
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      maskClosable={false}
      open={detailsDrawer.open}
      closable={true}
      onClose={toggleDetailsDrawer}
      height={matches ? 150 : 300}
      className={classes.docDetailsDrawer}
      style={{ overflow: "hidden" }}
      // width="100%"
      getContainer={false} // Append this drawer to the first drawer
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <b>Location:</b> {!!formData && formData?.locationName}
        </Col>
        <Col span={12}>
          <b>Department:</b> {!!formData && formData?.entityName}
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ color: "gray" }}>
        <Col span={12}>
          <b>Issue :</b> {formData?.issueNumber || "001"}
        </Col>
        <Col span={12}>
          <b>Version :</b> {formData?.currentVersion || "A"}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <b>Document Level :</b> {!!formData && formData?.docsClassification}
        </Col>
      </Row>
    </Drawer>
  );
};

export default DetailsDrawer;
