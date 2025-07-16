import { Tabs, Drawer, Space, Button, Modal } from "antd";
import { useEffect, useState } from "react";
import useStyles from "../Modal/commonDrawerStyles";
import { useMediaQuery } from "@material-ui/core";
import axios from "../../../apis/axios.global";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Row,
  Col,
  Select,
  Upload,
} from "antd";


//notistack
import { useSnackbar } from "notistack";
import moment from "moment";
import { API_LINK } from "../../../config";
import getAppUrl from "../../../utils/getAppUrl";
import ReferencesTab from "./ReferencesTab";
import AddActionPoint from "./AddActionPoint";
import { getNcDetail } from "apis/ncSummaryApi";
import checkRoles from "utils/checkRoles";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
const isEntityHead = checkRoles("ENTITY-HEAD");
// const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

let typeAheadValue: string;
let typeAheadType: string;

type Props = {
  openActionPointDrawer: any;
  setOpenActionPointDrawer: any;
  getActionPointData: any;
  dataid: any;
};

const ActionPoint = ({
  openActionPointDrawer,
  setOpenActionPointDrawer,
  getActionPointData,
  dataid,
}: Props) => {
  const modalData = openActionPointDrawer?.data;
  const edit = openActionPointDrawer.edit;
  const [agendaData, setAgendaData] = useState<any>({
    agenda: "",
    decisionPoints: "",
    owner: [],
  });
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  useEffect(() => {
    if (edit) {
      getActionPointById(dataid);
    } else {
      getNcDetailById(dataid);
    }
  }, []);

  const [status, setStatus] = useState<boolean>(false);
  const [addNew, setAddNew] = useState<boolean>(false);
  const [commentModelOpen, setCommentModelOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({});
  const [referencesNew, setReferencesNew] = useState<any>([]);
  const [commentForm] = Form.useForm();
  const [editedComments, setEditedComments] = useState<any>("");
  const realmName = getAppUrl();

  const navigate = useNavigate();

  const orgId = sessionStorage.getItem("orgId");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const handleDrawer = () => {
    setOpenActionPointDrawer({
      open: false,
      edit: false,
      data: {},
    });
  };

  const onStatusChange = (checked: boolean) => {
    setStatus(checked);
  };

  console.log("formData", formData);
  const handleSubmitSave = async () => {
    if (edit) {
      const res = await axios.put(
        `/api/audits/updateNcActionPointById/${dataid}`,
        formData
      );
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(`Data Saved successfully!`, {
          variant: "success",
        });
        setOpenActionPointDrawer({
          open: false,
          edit: false,
          data: {},
        });
        getActionPointData();
      }
    } else {
      if (formData?.title) {
        const newPayload = {
          ...formData,
          ncId: dataid,
          organizationId: orgId,
          status: "In Progress",
          assignee: formData?.assignee,
          createdBy: userInfo?.username,
          createdDate: moment().format("DD/MM/YYYY"),
          entityHead: formData?.entityHead,
        };
        console.log("Payload", newPayload, userInfo?.username);
        setFormData({ ...formData });
        const res = await axios.post("/api/audits/ncActionPoint", newPayload);

        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(`Data Added successfully!`, {
            variant: "success",
          });
          setOpenActionPointDrawer({
            open: false,
            edit: false,
            data: {},
          });
          getActionPointData();
        }
      } else
        enqueueSnackbar(`Enter Title`, {
          variant: "error",
        });
    }
  };

  const getNcDetailById = (id: string) => {
    getNcDetail(id)
      .then((res: any) => {
        console.log("inside response",res.data)
        parseData(res?.data);
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  const getActionPointById = async (id: string) => {
    const res = await axios.get(`/api/audits/getncActionPoint/${id}`);
    console.log("actionItem", res.data);
    setFormData(res.data);
  };

  /**
   * @method parseData
   * @description Function to parse data for displaying inside the form
   * @param data any
   * @returns nothing
   */
  const parseData = (data: any) => {
    const formattedData = {
      auditName: data?.audit?.auditName,
      auditDateTime: moment(data?.audit?.createdAt).format("DD/MM/YYYY LT"),
      auditType: data?.audit?.auditType?.name,
      auditNumber: data?.audit?.auditNumber,
      auditee: data?.audit?.auditees,
      auditor: data?.audit?.auditors,
      entity: data?.audit?.auditedEntity?.entityName,
      entityHead: data?.entityHead[0]?.id,
      // entityhead: data?.audit?.auditedEntity?.users?.id,
      location: data?.audit?.auditedEntity?.location.locationName,
      ncDate: moment(data?.createdAt).format("DD/MM/YYYY"),
      ncNumber: data?.id,
      clauseAffected: `${data?.clause[0]?.clauseName}, ${data?.clause[0]?.clauseNumber}`,
      ncDetails: data?.comment,
      documentProof: data?.document ? (
        <a
          href={`${API_LINK}${data?.document}` as string}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data?.document?.split("/")[2]}
        </a>
      ) : "No image found",
      mrComments:
        data?.ncComments.length > 0
          ? data.ncComments.map((comment: any) => {
              return {
                commentText: comment?.comment,
                date: moment(comment?.createdAt).format("DD/MM/YYYY LT"),
                postedOn: moment(comment?.createdAt).format("DD/MM/YYYY LT"),
                commentBy:
                  comment?.user.firstname + " " + comment?.user.lastname,
                border: false,
                emptyBackground: true,
              };
            })
          : [
              {
                commentText: "No comments were found!",
                date: "",
                postedOn: "",
                commentBy: "",
                border: false,
                emptyBackground: true,
              },
            ],
      closureDate: data?.closureDate
        ? moment(data?.closureDate).format("DD/MM/YYYY")
        : "",
      reviewDate:
        data.reviewDate && data.reviewDate !== ""
          ? moment(data.reviewDate).format("YYYY-MM-DD")
          : "",
      caDate:
        data.caDate && data.caDate !== ""
          ? moment(data.caDate).format("DD/MM/YYYY")
          : "",
      workflowHistory: data?.workflowHistory.map((workflow: any) => {
        return {
          date: moment(workflow.createdAt).format("DD/MM/YYYY"),
          by: workflow?.user?.firstname + " " + workflow?.user?.lastname,
          action: workflow?.action,
          id: workflow?._id,
        };
      }),
    };
    setFormData(formattedData as any);
  };

  console.log("formDataFormattedData", formData);
  const tabs = [
    {
      label: "Action Info",
      key: 1,
      children: (
        <AddActionPoint
          formData={formData}
          setFormData={setFormData}
          dataId={dataid}
          agendaData={agendaData}
          setAgendaData={setAgendaData}
          openActionPointDrawer={openActionPointDrawer}
          setOpenActionPointDrawer={setOpenActionPointDrawer}
          addNew={true}
        />
      ),
    },
    {
      label: "References",
      key: 2,
      children: (
        <ReferencesTab
          referencesNew={referencesNew}
          setReferencesNew={setReferencesNew}
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
  ];

  const handleStatusChange = async () => {
    const res = await axios.put(
      `/api/audits/updateNcActionPointById/${dataid}`,
      { ...formData, status: "Closed" }
    );
    if (res.status === 200 || res.status === 201) {
      enqueueSnackbar(`Data Saved successfully!`, {
        variant: "success",
      });
      setOpenActionPointDrawer({
        open: false,
        edit: false,
        data: {},
      });
      getActionPointData();
    }
  };

  useEffect(() => {
    if (formData.status === "In Progress") {
      commentForm.setFieldsValue({
        comments: formData.comments,
      });
    }
  }, [commentModelOpen]);

  const handleCloseActionPoint = () => {
    setCommentModelOpen(true);
    Modal.confirm({
      title: "Close Action Point",
      content: (
        <Form
          form={commentForm}
          layout="vertical"
          onValuesChange={(changedValues, allValues) => setFormData(allValues)}
          // rootClassName={classes.labelStyle}
        >
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
      ),
      okText: "Submit",
      onOk: () => handleCloseCommentsSubmit(),
    });
  };

  const handleChange = (e: any) => {
    const updatedFormData = { ...formData, comments: e.target.value };
    setFormData(updatedFormData);
    commentForm.setFieldsValue(updatedFormData);
  };

  const handleCloseCommentsSubmit = async () => {
    try {
      // Get the latest form data from the commentForm instance
      const updatedFormData = commentForm.getFieldsValue();

      // Modify the status and other fields as needed
      updatedFormData.status = "In Approval";

      const res = await axios.put(
        `/api/audits/updateNcActionPointById/${dataid}`,
        updatedFormData
      );

      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(`Data Saved successfully!`, {
          variant: "success",
        });

        setOpenActionPointDrawer({
          open: false,
          edit: false,
          data: {},
        });

        getActionPointData();
      }
    } catch (error) {
      enqueueSnackbar(`Failed to Save changes!`, {
        variant: "error",
      });
    }
  };

  return (
    <Drawer
      title={[
        <span
          key="title"
          style={isSmallScreen ? { fontSize: "13px" } : { fontSize: "16px" }}
        >
          {"Action Item"}
        </span>,
      ]}
      placement="right"
      open={openActionPointDrawer?.open}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      closable={true}
      onClose={handleDrawer}
      className={classes.drawer}
      width={isSmallScreen ? "85%" : "45%"}
      extra={
        <div className={classes.header}>
          <Space>
            {formData?.entityHead === userInfo?.id &&
              formData?.status === "In Approval" &&
              edit && (
                <Button type="primary" onClick={handleStatusChange}>
                  Approve
                </Button>
              )}
            {!isEntityHead && formData?.status === "In Progress" && edit && (
              <Button type="primary" onClick={handleCloseActionPoint}>
                Close
              </Button>
            )}

            {!isEntityHead && formData?.status !== "In Approval" && (
              <Button type="primary" onClick={handleSubmitSave}>
                {edit ? "Save" : "Submit"}
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <div className={classes.tabsWrapper}>
        <Tabs
          type="card"
          items={tabs as any}
          animated={{ inkBar: true, tabPane: true }}
          // tabBarStyle={{backgroundColor : "green"}}
        />
      </div>
    </Drawer>
  );
};

export default ActionPoint;
