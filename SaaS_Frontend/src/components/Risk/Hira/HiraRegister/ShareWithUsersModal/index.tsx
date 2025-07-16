//react, react router
import { useState } from "react";

//antd
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  Avatar,
  Tag,
  Modal,
  Select,
  Spin,
} from "antd";

//material-ui
import { MdPerson } from 'react-icons/md';

//utils
import axios from "apis/axios.global";
import { API_LINK } from "config";
import getAppUrl from "utils/getAppUrl";

//styles
import useStyles from "./style";

//thirdparty libs
import { debounce } from "lodash";
import { useSnackbar } from "notistack";

//antd constants
const { TextArea } = Input;
const { Option } = Select;

type Props = {
  reviewModal: any;
  setReviewModal: any;
};

const ShareWithUsersModal = ({ reviewModal, setReviewModal }: Props) => {
  const [searchQuery, setsearchQuery] = useState<string>("");

  const [options, setOptions] = useState<any>([]);
  const [fetching, setFetching] = useState<any>(false);
  const classes = useStyles();
  const realmName = getAppUrl();
  const [form] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  // useEffect(() => {
  //   fetchUserList();
  // }, []);

  const fetchUserList = async (value = "") => {
    try {
      setFetching(true);
      const res = await axios.get(`api/riskregister/getuserlist?search=${value}`);

      if (!!res.data && res.data.length > 0) {
        const userOptions = res.data.map((user: any) => ({
          value: user.id,
          label: user.email,
          email: user.email,
          avatar: user.avatar ? `${API_LINK}/${user.avatar}` : "",
          fullname: user.firstname + " " + user.lastname,
        }));
        // setOptions(userOptions);
        setFetching(false);
        return userOptions;
      } else {
        setFetching(false);
        setOptions([]);
      }
    } catch (error) {
      setFetching(false);
      console.log(error);
    }
  };

  const debouncedFetchUsers = debounce(async (value: any) => {
    const newOptions = await fetchUserList(value);
    console.log("newOptions", newOptions);

    setOptions(newOptions);
  }, 500);

  const handleSearchChange = async (value: any) => {
    console.log("value", value);

    setsearchQuery(value);
    // const newOptions = await fetchUserList(value);

    debouncedFetchUsers(value);

    // setOptions(newOptions);
  };

  const handleSelect = (value: any, option: any) => {
    console.log("value", value);
    console.log("option", option);
  };

  const handleSubmitForm = async (values: any) => {
    try {
      const data = {
        reviewers: values.reviewers,
        comment: values.comment,
      };
      console.log(data, reviewModal?.data?.id);

      const res = await axios.patch(
        `/api/riskregister/updatereviewers/${reviewModal?.data?.id}`,
        data
      );
      console.log("res", res);
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar("Email Sent Successfully", {
          variant: "success",
        });
      }
      handleCloseModal();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseModal = () => {
    setReviewModal({
      ...reviewModal,
      open: !reviewModal.open,
    });
  };

  return (
    <Modal
      title="Share with Users"
      centered
      open={reviewModal.open}
      onCancel={handleCloseModal}
      footer={null}
      width={500}
      className={classes.modal}
    >
      <Form
        form={form}
        layout="vertical"
        className={classes.formBox}
        onFinish={handleSubmitForm}
        // style={{marginTop : "15px"}}
      >
        <div style={{ padding: "5px" }}>
          <Row
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              paddingLeft: "20px",
              // paddingRight: "10px",
            }}
          >
            <Col>
              <Form.Item
                label="Select Users: "
                name="reviewers"
                required
                rules={[
                  {
                    required: true,
                    message: "Please Select Users",
                  },
                ]}
                // tooltip={{ title: 'Tooltip with customize icon', icon: <InfoIcon /> }}
              >
                <Select
                  showSearch
                  mode="multiple"
                  placeholder="Search and Select Users"
                  notFoundContent={
                    fetching ? <Spin size="small" /> : "No results found"
                  }
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onSearch={handleSearchChange}
                  onSelect={handleSelect}
                  style={{ width: "400px" }}
                  // options={options}
                  size="large"
                  optionLabelProp="label"
                  tagRender={(props) => {
                    const option = options.find(
                      (opt: any) => opt.value === props.value
                    );
                    return (
                      <Tag
                        closable={props.closable}
                        onClose={props.onClose}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        {option && option.avatar && (
                          <Avatar
                            src={option.avatar}
                            size="small"
                            icon={<MdPerson />}
                            style={{ marginRight: 8 }}
                          />
                        )}
                        {props.label}
                      </Tag>
                    );
                  }}
                >
                  {options?.map((option: any) => (
                    <Option
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={option.avatar}
                          size="large"
                          icon={<MdPerson />}
                          style={{ alignContent: "center" }}
                        />
                        <span style={{ marginLeft: "8px" }}>
                          {option.label}
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label="Comment: "
                name="comment"
                required
                // tooltip={{ title: 'Tooltip with customize icon', icon: <InfoIcon /> }}
              >
                <TextArea
                  rows={3}
                  style={{ width: "400px" }}
                  placeholder="Enter Comment"
                  size="large"
                  // value={value}
                  // onChange={handleInput}
                  // onChange={(e) => setValue(e.target.value)}
                  // onKeyDown={handleKeyDown}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row
            style={{
              // padding: "10px 10px",
              justifyContent: "end",
            }}
          >
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Send
              </Button>
            </Form.Item>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default ShareWithUsersModal;
