import { useState } from "react";
import axios from "../../../../../apis/axios.global";
import { API_LINK } from "../../../../../config";
import { MdPerson } from 'react-icons/md';
import { Button, Form, Input, Row, Col, Avatar } from "antd";
import { Modal, Select, Spin } from "antd";
import { debounce } from "lodash";
import useStyles from "./style";
import { useSnackbar } from "notistack";
const { TextArea } = Input;
const { Option } = Select;
type Props = {
  reviewModal: any;
  setReviewModal: any;
};

const ReviewModal = ({ reviewModal, setReviewModal }: Props) => {
  const [searchQuery, setsearchQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<any>([]);
  const [selectedUsers, setSelectedUsers] = useState<any>();

  const [options, setOptions] = useState<any>([]);
  const [fetching, setFetching] = useState<any>(false);
  const classes = useStyles();
  const [form] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();

  const fetchUserList = async (value = "") => {
    try {
      setFetching(true);
      const res = await axios.get(`/api/objective/getAllUser`);

      if (!!res.data.allUsers && res.data.allUsers?.length > 0) {
        const userOptions = res.data.allUsers?.map((user: any) => ({
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

    setOptions(newOptions);
  }, 500);

  const handleSearchChange = async (value: any) => {
    setsearchQuery(value);
    // const newOptions = await fetchUserList(value);

    debouncedFetchUsers(value);

    // setOptions(newOptions);
  };

  const handleSelect = (value: any, option: any) => {};

  const handleSubmitForm = async (values: any) => {
    try {
      const data = {
        ReviewList: values.ReviewList,
        ReviewComments: values.ReviewComments,
      };

      const res = await axios.put(
        `/api/objective/update/${reviewModal?.data?._id}`,
        data
      );
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
      title="Send For Review"
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
      >
        <div style={{ padding: "5px" }}>
          <Row
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              paddingLeft: "20px",
            }}
          >
            <Col>
              <Form.Item
                label="Select Reviewers: "
                name="ReviewList"
                required
                rules={[
                  {
                    required: true,
                    message: "Please select Reviewers",
                  },
                ]}
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
              <Form.Item label="Comment: " name="ReviewComments" required>
                <TextArea
                  rows={3}
                  style={{ width: "400px" }}
                  placeholder="Enter Comment"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row
            style={{
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

export default ReviewModal;
