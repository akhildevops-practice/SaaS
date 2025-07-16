import { useMediaQuery } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { Col, Form, Input, Row, Button, Drawer, Space } from "antd";

import { Switch } from "antd";
import { useEffect, useState } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { API_LINK } from "config";
import axios from "apis/axios.global";
import { Select as AntSelect } from "antd";

import { capaTableFormSchemaState } from "recoil/atom";
import { useSnackbar } from "notistack";
import getAppUrl from "utils/getAppUrl";

// import { AutoComplete } from "antd";

import { activityUpdateData } from "recoil/atom";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import getYearFormat from "utils/getYearFormat";
import TextArea from "antd/es/input/TextArea";

// import { debounce } from "lodash";
let typeAheadValue: string;
let typeAheadType: string;
type Props = {
  openmodal?: boolean;
  setOpen?: any;
  drawerdata?: any;
  drawer?: any;
  moduleName?: any;
  handleCloseDrawer?: any;
  read?: any;
  setDrawer?: any;
  setReadMode?: any;
  editData?: any;
  setEditData?: any;
  setIsEdit?: any;
  // actionItemDrawer?: any;edit
};
const CaraActionitemDrawer = ({
  openmodal,
  setOpen,
  drawerdata,
  drawer,
  moduleName,
  handleCloseDrawer,
  read,
  setDrawer,
  setReadMode,
  editData,
  setEditData,
  setIsEdit,
}: //actionItemDrawer,
any) => {
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const uniqueId = generateUniqueId(22);
  // const [capaTableData, setCapaTableData] = useRecoilState(capaSubTableDataState);
  const [capaTableData, setCapaTableData] = useState<any[]>([]);
  const [capaFormData, setCapaFormData] = useRecoilState(
    capaTableFormSchemaState
  );
  const [userOptions, setUserOptions] = useState([]);

  const HeadersData = ["Activity Comments", "Activity Date"];
  const FieldsData = ["comments", "date"];

  const [editId, setEditId] = useState<any>();
  const [buttonHide, setButtonHide] = useState(false);
  const [buttonAddCheck, setButtonAddCheck] = useState(false);
  // const [activityTableForm,setActivityTableForm,] = useState<any>({activeComents:"",activityDate:"",id:""});
  // const[activityTableData,setActivityTableData] = useState<any[]>([]);
  const ResetFormData = useResetRecoilState(capaTableFormSchemaState);
  const [modalCommentState, setModalCommentState] = useState(false);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [firstForm] = Form.useForm();
  const [currentYear, setCurrentYear] = useState<any>();
  const [buttonStatus, setButtonStatus] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [switchState, setSwitchState] = useState(drawerdata?.status);
  const [actionItemCapaData, setActionItemCapaData] = useState<any>({});

  const [activityUpdate, setActivityUpdate] =
    useRecoilState(activityUpdateData);
  const navigate = useNavigate();

  //functions
  useEffect(() => {
    // console.log("drawer data on open", read);
    getUserOptions();
    firstForm.setFieldsValue({
      _id: drawerdata?._id,
      title: drawerdata?.title,
      owner: drawerdata?.owner?.map((o: any) => o.id),
      targetDate: drawerdata?.targetDate,
      description: drawerdata?.description,
      status: drawerdata?.status,
      activityComments: drawerdata?.activityComments,
      activityDate: drawerdata?.activityDate,
      mode: "edit",
    });
    setCapaFormData({
      ...drawerdata,
      mode: "edit",
    });
    getCaraData();
  }, [drawer?.open]);
  // console.log("capaFormdata", capaFormData);
  const handleCloseModal = () => {
    setOpen(false);
    handleCloseDrawer();
  };

  const realmName = getAppUrl();
  const getUserOptions = async () => {
    await axios
      .get(`/api/riskregister/users/${userDetail?.organizationId}`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const ops = res?.data?.map((obj: any) => ({
            id: obj.id,
            name: obj.username,
            avatar: obj.avatar,
            email: obj.email,
            username: obj.username,
            value: obj.id,
            label: obj.email,
            fullname: obj.firstname + " " + obj.lastname,
          }));
          setUserOptions(ops);
        } else {
          setUserOptions([]);
        }
      })
      .catch((err) => console.error(err));
  };
  const getYear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  const tableDeleteHandler = async (data: any) => {
    const deleteData = capaTableData.filter(
      (item: any) => item._id !== data._id
    );
    setCapaTableData(deleteData);
    const result = await axios.delete(
      API_LINK + `/api/actionitems/deleteActionITem/${data._id}`
    );
  };
  const getCaraData = async () => {
    const result = await axios.get(
      API_LINK + `/api/cara/getCaraById/${drawerdata.referenceId}`
    );
    if (result.status === 200) {
      setActionItemCapaData(result?.data);
      setEditData(result?.data);
    }
  };

  const TableDataAddHandler = async () => {
    const payload = {
      ...capaFormData,
    };

    const result = await axios.patch(
      API_LINK + `/api/actionitems/updateActionItem/${drawerdata._id}`,
      payload
    );

    setButtonHide(false);
    handleCloseModal();

    enqueueSnackbar(`Data Updated successfully!`, {
      variant: "success",
    });
  };

  // const getAllActionItemReference = async () => {
  //   console.log("reference api====");

  //   const result = await axios.get(
  //     API_LINK +
  //       `/api/actionitems/getActionItemForReference/${drawerdata?.referenceId}`
  //   );
  //   setCapaTableData(result?.data);
  // };
  // console.log("ationitemcapadata", actionItemCapaData);

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {matches ? <div>Update Action Item</div> : ""}
        </div>
      }
      // open={modalCommentState}
      open={openmodal}
      extra={
        <>
          <Space>
            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              <span style={{ fontSize: smallScreen ? "14px" : "12px" }}>
                Status :{""}
              </span>
              <Switch
                checked={capaFormData.status}
                style={{
                  backgroundColor: capaFormData.status ? "#003566" : "",
                  width: smallScreen ? "70px" : "65px",
                }}
                disabled={buttonStatus || read}
                checkedChildren={"Open"}
                unCheckedChildren={"Close"}
                onChange={() => {
                  setCapaFormData({
                    ...capaFormData,
                    status: !capaFormData.status,
                  });
                  setSwitchState(!switchState);
                }}
              />
            </div>
            <Button
              onClick={() => {
                handleCloseModal();
                setCapaFormData({});
              }}
              style={{
                fontSize: smallScreen ? "14px" : "12px",
                padding: smallScreen ? "4px 14px" : "3px 5px",
              }}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              onClick={() => {
                TableDataAddHandler();
              }}
              disabled={read}
              style={{
                fontSize: smallScreen ? "14px" : "12px",
                padding: smallScreen ? "4px 14px" : "0px 6px",
              }}
              // disabled={capaFormData.title && capaFormData.owner}
            >
              Submit
            </Button>
          </Space>
        </>
      }
      // onOk={() => setOpen(false)}
      //onCancel={() => setOpen(false)}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      maskClosable={false}
      onClose={handleCloseModal}
      width={matches ? "50%" : "90%"}
    >
      <Form
        form={firstForm}
        layout="vertical"

        // rootClassName={classes.labelStyle}
        // disabled={disableFormFields}
      >
        <Row justify="end">
          <Col>
            <Button
              type="link"
              style={{
                background: "transparent",
                border: "none",
                color: "black",
                textDecoration: "underline",
                fontFamily: "bold",
                fontSize: "14px",
                padding: 0,
              }}
              onClick={() => {
                // navigate(`/cara`, {
                //   state: {
                //     editData: actionItemCapaData,
                //     isEdit: true,
                //     readMode: true,
                //     drawer: {
                //       mode: "edit",
                //       data: { ...actionItemCapaData, id: drawerdata?.referenceId },
                //       open: true,
                //     },
                //   },
                // });
                let url;
                if (
                  process.env.REACT_APP_REDIRECT_URL?.includes(
                    "adityabirla.com"
                  )
                ) {
                  url = `${process.env.REACT_APP_REDIRECT_URL}/caractionitemview`;
                } else {
                  url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/caraactionitemview`;
                }
                const stateData = {
                  editData: actionItemCapaData,
                  isEdit: true,
                  readMode: true,
                  drawer: {
                    mode: "edit",
                    data: {
                      ...actionItemCapaData,
                      id: drawerdata?.referenceId,
                    },
                    open: true,
                  },
                };

                sessionStorage.setItem(
                  "newTabState",
                  JSON.stringify(stateData)
                );
                setTimeout(() => {
                  window.open("/caraactionitemview", "_blank");
                }, 700); // Adjust the delay as needed
              }}
            >
              Click to view CAPA
            </Button>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="ActionItem: "
              name="title"
              rules={[
                {
                  required: true,
                  message: "Please Enter Action Item Name!",
                },
              ]}
            >
              <Input
                name="title"
                placeholder="Enter Action Item Name"
                size="large"
                onChange={(e: any) => {
                  setCapaFormData({
                    ...capaFormData,
                    ["title"]: e.target.value,
                  });
                }}
                value={capaFormData?.title}
                disabled={capaFormData.buttonStatus || read}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Owner: "
              name="owner"
              rules={[
                {
                  required: true,
                  message: "Please select a user!",
                },
              ]}
            >
              <AntSelect
                showSearch
                placeholder="Select Owner(s)"
                style={{
                  width: "100%",
                  fontSize: "12px", // Reduce font size for selected items
                }}
                mode="multiple"
                options={userOptions || []}
                onChange={(selectedAttendees: any) => {
                  const selectedUsers = selectedAttendees
                    ?.map((userId: any) =>
                      userOptions?.find((user: any) => user.value === userId)
                    )
                    .filter(Boolean);

                  setCapaFormData({
                    ...capaFormData,
                    owner: selectedUsers || [],
                  });
                }}
                size="large"
                defaultValue={capaFormData?.owner || []}
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().indexOf(input?.toLowerCase()) >=
                  0
                }
                // disabled={readStatus}
                listHeight={200}
              />
            </Form.Item>
          </Col>

          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Target Date: "
              name="targetDate"
              rules={[
                {
                  required: true,
                  message: "Please Enter Target Date!",
                },
              ]}
            >
              <Input
                name=" targetDate"
                type="date"
                size="large"
                onChange={(e: any) => {
                  setCapaFormData({
                    ...capaFormData,
                    ["targetDate"]: e.target.value,
                  });
                }}
                value={capaFormData?.endDate}
                disabled={capaFormData.buttonStatus || read}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={4}></Col>
          <Col span={24}>
            <Form.Item
              label="Description "
              name="description"
              rules={[
                {
                  required: false,
                  message: "Please Enter description!",
                },
              ]}
            >
              <TextArea
                rows={1}
                autoSize={{ minRows: 1, maxRows: 6 }}
                placeholder="Enter description"
                size="large"
                name="description"
                onChange={(e: any) => {
                  setCapaFormData({
                    ...capaFormData,
                    ["description"]: e.target.value,
                  });
                }}
                value={capaFormData?.description}
                disabled={capaFormData.buttonStatus || read}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* <ActivityUpdateTable
    header={HeadersData}
    fields={FieldsData}
    data={activityUpdate}
    setData={setActivityUpdate}
    isAction={actionData.isAction}
    actions={actionData.actions}
    addFields={true}
    label={"Add Item"}
    disabled={true}
  

  /> */}
        <Row gutter={[16, 16]} style={{ marginBottom: "30px" }}>
          <Col span={4}></Col>
        </Row>
        <Row
          gutter={[16, 16]}
          style={{ height: "auto", marginBottom: "30px" }}
        ></Row>
      </Form>
    </Drawer>
  );
};
export default CaraActionitemDrawer;
