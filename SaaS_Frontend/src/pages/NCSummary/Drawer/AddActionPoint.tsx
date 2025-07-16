import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core";
import axios from "../../../apis/axios.global";
import { Form, Input, Row, Col } from "antd";
import { Autocomplete } from "@material-ui/lab";
import {
  Avatar,
  ListItemAvatar,
  ListItemText,
  TextField,
  MenuItem,
} from "@material-ui/core";
import moment from "moment";
import { API_LINK } from "../../../config";
import { debounce } from "lodash";
import getAppUrl from "../../../utils/getAppUrl";

const { TextArea } = Input;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& .MuiAccordionDetails-root": {
      display: "block",
    },
  },
  scroll: {
    minWidth: "100%",
    // maxHeight: "100%",
    maxHeight: "calc(90vh - 12vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px", // Adjust the height value as needed
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
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

let typeAheadValue: string;
let typeAheadType: string;

type Props = {
  openActionPointDrawer: any;
  setOpenActionPointDrawer: any;
  setAgendaData: any;
  agendaData: any;
  addNew: boolean;
  setFormData: any;
  formData: any;
  dataId: any;
};

const AddActionPoint = ({
  openActionPointDrawer,
  setOpenActionPointDrawer,
  setAgendaData,
  agendaData,
  addNew,
  formData,
  setFormData,
  dataId,
}: Props) => {
  const modalData = openActionPointDrawer?.data;
  const edit = openActionPointDrawer?.edit;
  const [firstForm] = Form.useForm();
  const [suggestions, setSuggestions] = useState([]);
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);

  const realmName = getAppUrl();

  useEffect(() => {
    if (edit) {
      if (formData && formData.assignee) {
        const assigneeData = formData.assignee.map((assigneeItem: any) => ({
          id: assigneeItem.id,
          email: assigneeItem.email,
        }));

        firstForm.setFieldsValue({
          ncId: formData?.ncId,
          ncNumber: formData?.ncNumber,
          ncDate: formData?.ncDate,
          entity: formData?.entity,
          auditDateTime: formData?.auditDateTime,
          createdDate: moment(formData?.createdDate).format("DD/MM/YYYY"),
          createdBy: formData?.createdBy,
          assignee: assigneeData,
          title: formData?.title,
          comments: formData?.comments,
          description: formData?.description,
          status: formData?.status,
        });
      }
    } else {
      firstForm.setFieldsValue({
        ncNumber: formData?.ncNumber,
        ncDate: formData?.ncDate,
        entity: formData?.entity,
        auditDateTime: formData?.auditDateTime,
        createdDate: moment().format("DD/MM/YYYY"),
        createdBy: userInfo?.username,
        // status: "Open",
      });
    }
  }, [formData]);

  const classes = useStyles();

  const handleTextChange = (e: any) => {
    getSuggestionList(e.target.value, "normal");
  };

  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };

  const debouncedSearch = debounce(() => {
    getData(typeAheadValue, typeAheadType);
  }, 400);

  const getData = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `api/user/doctype/filterusers/${realmName}/${"allusers"}?email=${value}`
      );
      setSuggestions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeAssignee = (value: any) => {
    const updatedFormData = { ...formData, assignee: value };
    setFormData(updatedFormData);
    firstForm.setFieldsValue(updatedFormData);
  };

  const handleChange = (e: any) => {
    const updatedFormData = { ...formData, [e.target.name]: e.target.value };
    firstForm.setFieldsValue(updatedFormData);
    setFormData(updatedFormData);
  };
console.log("fromDatra",formData)
  return (
    <div className={classes.scroll}>
      {Object.keys(formData).length > 0 ? (
        <Form
          form={firstForm}
          layout="vertical"
          onValuesChange={(changedValues, allValues) => setFormData(allValues)}
          rootClassName={classes.labelStyle}
        >
          <Row gutter={[16, 16]}>
            <Col
              span={24}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                // alignItems: "center",
                paddingRight: "20px",
                marginBottom: "30px",
              }}
            >
              <span
                style={{ fontSize: "14px", color: "#003566", fontWeight: 700 }}
              >
                Status:
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "#B8B8B8",
                  fontWeight: 400,
                }}
              >
                &nbsp;{edit ? formData.status : "Open"}
              </span>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="NC Number: " name="ncNumber">
                <Input size="large" disabled={true} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="NC Date: " name="ncDate">
                <Input name="ncDate" size="large" disabled={true} />
              </Form.Item>
            </Col>
          </Row>
          {/* <Row gutter={[16, 16]}>
          <Col span={12}>
              <Form.Item label="Auditee: " name="auditee">
                <Input size="large" disabled={true} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="NC Title: " name="ncTitle">
                <Input size="large" disabled={true} />
              </Form.Item>
            </Col>
          </Row> */}

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Created By: " name="createdBy">
                <Input size="large" disabled={true} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Created Date: " name="createdDate">
                <Input size="large" disabled={true} />
              </Form.Item>

              {/* <Form.Item label="Created Date" name="createdDate">
                <Input
                  name="createdDate"
                  size="large"
                  value={moment(formData?.createdDate).format("DD/MM/YYYY")}
                  disabled
                />
              </Form.Item> */}
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label="Department: " name="entity">
                <Input size="large" disabled={true} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Title"
                name="title"
                tooltip="This is a required field"
                rules={[{ required: true, message: "Please Enter Title!" }]}
              >
                <Input
                  name="title"
                  placeholder="Please Enter Action Title"
                  size="large"
                  onChange={(e: any) => handleChange(e)}
                  value={formData?.title}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Assignee"
                tooltip="This is a required field"
                rules={[{ required: true, message: "Please Enter Assignee!" }]}
              >
                {suggestions && (
                  <Autocomplete
                    key={`assignee`}
                    multiple={true}
                    options={suggestions}
                    onChange={(e, value) => {
                      handleChangeAssignee(value);
                    }}
                    // style={{width : '300px'}}
                    getOptionLabel={(option: any) => {
                      return option["email"];
                    }}
                    getOptionSelected={(option, value) =>
                      option.id === value.id
                    }
                    limitTags={2}
                    size="small"
                    value={formData?.assignee}
                    // defaultValue={data?.owner}
                    filterSelectedOptions
                    renderOption={(option) => {
                      return (
                        <>
                          <div>
                            <MenuItem key={option.id}>
                              <ListItemAvatar>
                                <Avatar>
                                  <Avatar
                                    src={`${API_LINK}/${option.avatar}`}
                                  />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={option.value}
                                secondary={option.email}
                              />
                            </MenuItem>
                          </div>
                        </>
                      );
                    }}
                    renderInput={(params) => {
                      return (
                        <TextField
                          {...params}
                          variant="outlined"
                          // label={'Owners'}
                          placeholder={"Please Enter Assignee Name"}
                          onChange={handleTextChange}
                          size="small"
                        />
                      );
                    }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label="Description" name="description">
                <TextArea
                  name="description"
                  autoSize={{ minRows: 4 }}
                  onChange={(e: any) => handleChange(e)}
                  value={formData?.description}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label="Comments" name="comments">
                <TextArea
                  name="comments"
                  autoSize={{ minRows: 4 }}
                  onChange={(e: any) => handleChange(e)}
                  value={formData?.comments}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default AddActionPoint;
