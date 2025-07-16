//react
import { useEffect, useState } from "react";

//antd
import { Col, Drawer, Row } from "antd";

//material-ui
import { makeStyles } from "@material-ui/core";
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

const DocDetailsTopDrawer = ({
  detailsDrawer,
  setDetailsDrawer,
  formData,
  toggleDetailsDrawer,
}: Props) => {
  const classes = useStyles();
  useEffect(() => {}, []);
  const [token, setToken] = useState("");

  const handleLoginSuccess = (response: any) => {
    console.log("Login Success:", response);
    setToken(response.accessToken);
  };

  const handleLoginFailure = (response: any) => {
    console.log("Login Failed:", response);
  };
  return (
    <Drawer
      title={"Document Details"}
      placement="top"
      open={detailsDrawer.open}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      closable={true}
      onClose={toggleDetailsDrawer}
      height={300}
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
          <b>Entity:</b> {!!formData && formData?.entityName}
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
      {/* <Row>
        <Col>
          <div>
            <h2>Upload Document from Google Drive</h2>
            <GoogleLoginComponent
              onSuccess={handleLoginSuccess}
              onFailure={handleLoginFailure}
            />
            {token && <p>Access Token: {token}</p>}
          </div>
        </Col>
      </Row> */}
    </Drawer>
  );
};

export default DocDetailsTopDrawer;
