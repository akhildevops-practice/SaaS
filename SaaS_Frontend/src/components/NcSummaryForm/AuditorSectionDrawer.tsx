


//antd
import { Col, Form, Row } from "antd";
import { TextField, makeStyles, useMediaQuery } from "@material-ui/core";
import moment from "moment";
import TextArea from "antd/es/input/TextArea";

const useStyles = makeStyles((theme: any) => ({
  root: {
    width: "100%",
    "& .MuiAccordionDetails-root": {
      display: "block",
    },
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the <label> element
    },
  },
  dateInput: {
    border: "1px solid #bbb",
    paddingLeft: "10px",
    paddingRight: "10px",
    borderRadius: "5px",
    "& .MuiInput-underline:before": {
      borderBottom: "none", // Remove the bottom border
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the hover border
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none", // Remove the focus border
    },
  },
}));

type Props = {
  auditorData?: any;
  setAuditorData?: any;
  disabled: any;
  auditeeData: any;
  refForListOfFindingsForm13?: any;
  refForListOfFindingsForm14?: any;
};

const AuditorSectionDrawer = ({
  auditorData,
  setAuditorData,
  disabled,
  auditeeData,
  refForListOfFindingsForm13,
  refForListOfFindingsForm14,
}: Props) => {
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles();

  const [auditeeForm] = Form.useForm();
  const auditorChangeHandler = (event: any) => {
    setAuditorData({
      ...auditorData,
      [event.target.name]: event.target.value,
    });
  };
  return (
    <Form
      form={auditeeForm}
      layout="vertical"
      rootClassName={classes.labelStyle}
    >
      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Verification Date:">
            <TextField
              type="date"
              disabled={disabled}
              name="verficationDate"
              className={classes.dateInput}
              size="small"
              value={auditorData?.verficationDate}
              inputProps={{
                style: {
                  fontSize: "14px", // Set the desired font size here
                },
                min: moment(auditeeData?.actualTargetDate).format("YYYY-MM-DD"),
                max: moment(new Date()).format("YYYY-MM-DD"),
              }}
              onChange={auditorChangeHandler}
              ref={refForListOfFindingsForm13}
              style={{ width: "90%" }}
            />
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Verification/Effectiveness Review Comment:">
            <div ref={refForListOfFindingsForm14}>
              <TextArea
                value={auditorData?.verficationAction}
                disabled={disabled}
                name="verficationAction"
                onChange={auditorChangeHandler}
                rows={3}
              ></TextArea>
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default AuditorSectionDrawer;
