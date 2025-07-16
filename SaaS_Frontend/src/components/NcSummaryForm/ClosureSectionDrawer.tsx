


//antd
import {
  Col,
  Form,
  Row,
  Radio,
} from "antd";
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
}));

type Props = {
  closureData?: any;
  setClosureData?: any;
  correctiveActionDate?: any;
  disabled?: any;
  refForListOfFindingsForm16?: any;
  refForListOfFindingsForm17?: any;
  refForListOfFindingsForm18?: any;
};
const ClosureSectionDrawer = ({
  closureData,
  setClosureData,
  correctiveActionDate,
  disabled,
  refForListOfFindingsForm16,
  refForListOfFindingsForm17,
  refForListOfFindingsForm18,
}: Props) => {
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles();

  const [auditeeForm] = Form.useForm();

  const closureChangeHandler = (event: any) => {
    setClosureData({
      ...closureData,
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
          <Form.Item label="Closure Remarks:">
            <div ref={refForListOfFindingsForm16}>
              <TextArea
                name="closureRemarks"
                disabled={disabled}
                onChange={closureChangeHandler}
                value={closureData?.closureRemarks}
                rows={3}
              ></TextArea>
            </div>
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Date of Closure:">
            <TextField
              type="date"
              // disabled={
              //   closureOwnerRule
              //     ? id !== undefined ||
              //       ncStatus !== "VERIFIED" ||
              //       (closureOwner === "MCOE" && !isOrgAdmin) ||
              //       (closureOwner === "IMSC" && !isMR)
              //     : false
              // }
              disabled={disabled}
              name="closureDate"
              className={classes.dateInput}
              size="small"
              value={closureData?.closureDate}
              inputProps={{
                style: {
                  fontSize: "14px", // Set the desired font size here
                },

                max: moment(new Date()).format("YYYY-MM-DD"),
              }}
              onChange={closureChangeHandler}
              ref={refForListOfFindingsForm17}
              style={{ width: "90%" }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item label="Follow up Audit Required:">
            <div ref={refForListOfFindingsForm18}>
              <Radio.Group
                name="auditRequired"
                value={closureData?.auditRequired}
                disabled={disabled}
                onChange={closureChangeHandler}
              >
                <Radio value="Yes" disabled={disabled}>
                  Yes
                </Radio>
                <Radio value="No" disabled={disabled}>
                  No
                </Radio>
              </Radio.Group>
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default ClosureSectionDrawer;
