import { useMediaQuery } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Col, Drawer, Row } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    "& .ant-drawer-right>.ant-drawer-content-wrapper": {
      transform: "translateX(-4px) !important",
      width: "400px !important",
    },
    "& .ant-drawer-body": {
      padding: "24px !important",
    },
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      padding: "10px 7px",
      borderBottom: "none",
      "& .ant-btn-default": {
        backgroundColor: "#e8f3f9",
        borderColor: "#0e497a",
        "& svg": {
          color: "#0e497a",
        },
      },
    },
  },
}));

type Props = {
  infoDrawer: any;
  setInfoDrawer: any;
  toggleInfoDrawer: any;
  formData: any;
};

const InfoTopDrawer = ({
  infoDrawer,
  setInfoDrawer,
  toggleInfoDrawer,
  formData,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles();

  const formatDate = (inputDate: any) => {
    if (!inputDate) return "N/A";
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getSystemNames = () =>
    formData?.docTypeDetails?.applicable_systems?.length
      ? formData.docTypeDetails.applicable_systems
          .map((sys: any) => sys?.name)
          .join(", ")
      : "N/A";

  return (
    <Drawer
      title="Details"
      placement="top"
      open={infoDrawer.open}
      closable
      onClose={toggleInfoDrawer}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      height={matches ? 380 : 500}
      className={classes.drawer}
      getContainer={false}
    >
      <Row gutter={16} style={{ fontSize: 13, paddingLeft: "12px" }}>
        {/* Left Column */}
        <Col span={12}>
          {[
            { label: "Document Name", value: formData?.documentName || "N/A" },
            {
              label: "Document Number",
              value: formData?.documentNumbering || "N/A",
            },
            { label: "Issue", value: formData?.issueNumber || "001" },
            { label: "Version", value: formData?.currentVersion || "A" },
            {
              label: "Unit",
              value: formData?.locationDetails?.[0]?.locationName || "N/A",
            },
          ].map((item, idx) => (
            <Row
              key={idx}
              style={{
                borderBottom: "1px solid #eee",
                padding: "8px 0",
              }}
            >
              <Col span={8} style={{ fontWeight: 600 }}>
                {item.label}:
              </Col>
              <Col span={16}>{item.value}</Col>
            </Row>
          ))}
        </Col>

        {/* Right Column */}
        <Col span={12}>
          {[
            {
              label: "Entity",
              value: formData?.entityDetails?.[0]?.entityName || "N/A",
            },
            {
              label: "Document Type",
              value: formData?.docTypeDetails?.documentTypeName || "N/A",
            },
            { label: "Systems", value: getSystemNames() || "N/A" },
            {
              label: "Published Date",
              value: formatDate(formData?.approvedDate) || "N/A",
            },
            {
              label: "Descriptions",
              value: formData?.reasonOfCreation?.trim() || "N/A",
            },
          ].map((item, idx) => (
            <Row
              key={idx}
              style={{
                borderBottom: "1px solid #eee",
                padding: "8px 0",
              }}
            >
              <Col span={8} style={{ fontWeight: 600 }}>
                {item.label}:
              </Col>
              <Col span={16}>{item.value}</Col>
            </Row>
          ))}
        </Col>
      </Row>
    </Drawer>
  );
};

export default InfoTopDrawer;
