import {
  MdLocalOffer,
  MdLocationOn,
  MdDescription,
  MdHelpOutline,
  MdFileCopy,
  MdReport,
  MdConfirmationNumber,
  MdNotes,
  MdBusiness,
} from "react-icons/md";
import { Col, Row } from "antd";

import useStyles from "./style";

const DocumentInfoTab = ({ formData }: { formData: any }) => {
  const classes = useStyles();
  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <div className={classes.labelContainer}>
            <MdDescription className={classes.iconStyle} />
            <b className={classes.labelStyle}>Document Name :</b>
          </div>
        </Col>
        <Col span={12}>
          <span>{(!!formData && formData?.documentName) || "N/A"}</span>
        </Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <MdHelpOutline className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Reason For Creation/Ammendment:</b>
        </Col>
        <Col span={10}>
          <span>{(!!formData && formData?.reasonOfCreation) || "N/A"}</span>
        </Col>
      </Row>
      <Row
        gutter={[24, 24]}
        className={classes.rowStyle}
      >
        <Col span={12} className={classes.colWrapper}>
          <MdReport className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Issue :</b>
        </Col>
        <Col span={12}>{formData?.issueNumber || "001"}</Col>
      </Row>
      <Row
        gutter={[24, 24]}
        className={classes.rowStyle}
      >
        <Col span={12} className={classes.colWrapper}>
          <MdConfirmationNumber className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Version :</b>
        </Col>
        <Col span={12}>{formData?.currentVersion || "A"}</Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <MdLocationOn className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Unit :</b>
        </Col>
        <Col span={12}>{(!!formData && formData?.locationName) || "N/A"}</Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <MdBusiness className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Department :</b>
        </Col>
        <Col span={12}>{(!!formData && formData?.entityName) || "N/A"}</Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <MdFileCopy className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Document Type :</b>
        </Col>
        <Col span={12}>{(!!formData && formData?.docType) || "N/A"}</Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <MdLocalOffer className={classes.iconStyle} />
          <b className={classes.labelStyle}>Document Tags :</b>
        </Col>
        <Col span={12}>
          {(!!formData &&
            formData?.tags.length > 0 &&
            formData?.tags?.map((tag: any, index: any) => (
              <>
                {" "}
                {tag} {index < formData?.tags.length - 1 && ","}
              </>
            ))) ||
            "N/A"}
        </Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <MdNotes className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Description :</b>
        </Col>
        <Col span={12}>{(!!formData && formData?.description) || "N/A"}</Col>
      </Row>
    </div>
  );
};

export default DocumentInfoTab;
