//react

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
  currentYear: any;
};

const CIPDetailsTopDrawer = ({
  detailsDrawer,
  setDetailsDrawer,
  formData,
  toggleDetailsDrawer,
  currentYear,
}: Props) => {
  const classes = useStyles();

  function formatDate(inputDate: any) {
    if (inputDate != null) {
      const date = new Date(inputDate);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    }
    return "";
  }

  return (
    <Drawer
      title={"CIP Details"}
      placement="top"
      open={detailsDrawer.open}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      closable={true}
      maskClosable={false}
      onClose={toggleDetailsDrawer}
      height={200}
      className={classes.docDetailsDrawer}
      style={{ overflow: "hidden" }}
      // width="100%"
      getContainer={false} // Append this drawer to the first drawer
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <b>Year:</b> {formData.year ? formData.year : currentYear}
        </Col>
        <Col span={12}>
          <b>Location:</b> {!!formData && formData?.location?.name}
        </Col>
        <Col span={12}>
          <b>Created By:</b> {!!formData && formData?.createdBy?.name}
        </Col>
        <Col span={12}>
          <b>Created At:</b> {!!formData && formatDate(formData?.createdAt)}
        </Col>
        <Col span={12}>
          <b>Last Modified:</b> {!!formData && formatDate(formData?.updatedAt)}
        </Col>
      </Row>
      {/* <Row gutter={[16, 16]} style={{ color: "gray" }}>
        <Col span={12}>
          <b>Issue :</b> {formData?.issueNumber || "001"}
        </Col>
        <Col span={12}>
          <b>Version :</b> {formData?.currentVersion || "A"}
        </Col>
      </Row> */}
      {/* <Row gutter={[16, 16]}>
        <Col span={24}>
          <b>Document Level :</b> {!!formData && formData?.docsClassification}
        </Col>
      </Row> */}
    </Drawer>
  );
};

export default CIPDetailsTopDrawer;
