import { useState, useEffect } from "react";
import CustomTable from "../../components/CustomTable";
import {
  CircularProgress,
  Typography,
  Box,
  Fab,
  Tooltip,
} from "@material-ui/core";
import { MdEdit } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import { MdAdd } from 'react-icons/md';
import { MdFilterList } from 'react-icons/md';
import useStyles from "./styles";
import { useNavigate } from "react-router-dom";
import axios from "../../apis/axios.global";
import EmptyTableImg from "../../assets/EmptyTableImg.svg";
import NoAccess from "../../assets/NoAccess.svg";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useSnackbar } from "notistack";
import { useSetRecoilState } from "recoil";
import { orgFormData } from "../../recoil/atom";
import { orgForm } from "../../schemas/orgForm";
import FilterDrawer from "../../components/FilterDrawer";
import SearchBar from "../../components/SearchBar";
import formatQuery from "../../utils/formatQuery";
import MultiUserDisplay from "../../components/MultiUserDisplay";
import checkRoles from "../../utils/checkRoles";
import SimplePaginationController from "../../components/SimplePaginationController";
import getAppUrl from "../../utils/getAppUrl";
import { Button, Col, Form, Input, Row, Tabs, UploadProps } from "antd";
import TabPane from "antd/es/tabs/TabPane";
import Dragger from "antd/es/upload/Dragger";
import { MdInbox } from 'react-icons/md';

type Props = {};

const headers = [
  "Organization Name",
  "Organization Admin",
  "Created Date",
  "Org ID/Tenant ID",
  "Instance URL",
];

const fields = [
  "organizationName",
  "orgAdmin",
  "createdAt",
  "id",
  "instanceUrl",
];

/**
 * The settings page displays all the organizations
 *
 */

function Settings({}: Props) {
  const classes = useStyles();
  const [data, setData] = useState<any>();
  const [open, setOpen] = useState(false);
  const [deleteOrg, setDeleteOrg] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [rerender, setRerender] = useState(false);
  const setOrgData = useSetRecoilState(orgFormData);
  const [searchValue, setSearchValue] = useState<any>({});
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [count, setCount] = useState<number>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeOrgTab, setActiveOrgTab] = useState("1");
  const [activeGSTab, setActiveGSTab] = useState("1");
  const [objectStoreForm] = Form.useForm();
  const [googleForm] = Form.useForm();
  const [objectStoreData, setObjectStoreData] = useState<any>();
  const [googleData, setGoogleData] = useState<any>();
  const [fileList, setFileList] = useState<any>([]);
  const orgData = {
    id: "master",
  };

  const navigate = useNavigate();

  const isAdmin = checkRoles("admin");
  const isOrgAdmin = checkRoles("ORG-ADMIN");

  const handleClick = () => {
    setOrgData(orgForm);
    navigate(`/settings/neworganization`);
  };

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchValue({
      ...searchValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleDiscard = () => {
    const url = formatQuery(`/api/organization`, { page: 1, limit: 5 }, [
      "page",
      "limit",
    ]);
    getData(url);
    setPage(1);
    setSearchValue({
      orgName: "",
      orgAdmin: "",
    });
  };

  const handleApply = () => {
    const url = formatQuery(
      `/api/organization`,
      { ...searchValue, page: 1, limit: 5 },
      ["orgName", "orgAdmin", "page", "limit"]
    );
    getData(url);
  };

  const getData = async (url: any) => {
    setLoading(true);
    try {
      const res = await axios.get(url);
      if (res?.data?.data) {
        setCount(res.data.dataCount);
        const val = res?.data?.data.map((item: any) => ({
          organizationName: item.organizationName,
          orgAdmin: <MultiUserDisplay data={item?.user} name="email" />,
          createdAt: item.createdAt
            ? new Date(item.createdAt).toDateString()
            : "N/A",
          id: item.id,
          instanceUrl: item.instanceUrl,
          realmName: item.realmName,
        }));
        setData(val);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleEditOrg = (data: any) => {
    navigate(`/settings/neworganization/${data.realmName}`);
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteOrg(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    handleClose();
    setLoading(true);
    try {
      const res = await axios.delete(
        `api/organization/deleteorg/${deleteOrg.id}`
      );
      enqueueSnackbar(`Operation Successfull`, { variant: "success" });
      setLoading(false);
      setRerender(!rerender);
    } catch (err) {
      enqueueSnackbar(`Error ${err}`, {
        variant: "error",
      });
      setLoading(false);
    }
  };

  const handleChangePage = (page: any) => {
    setPage(page);
    const url = formatQuery(
      `/api/organization`,
      { ...searchValue, page: page, limit: 5 },
      ["orgName", "orgAdmin", "page", "limit"]
    );
    getData(url);
  };

  useEffect(() => {
    setOrgData(orgForm);
    setPage(1);
    const url = formatQuery(`/api/organization`, { page: 1, limit: 5 }, [
      "page",
      "limit",
    ]);
    if (!isOrgAdmin) getData(url);
    if (isOrgAdmin) {
      const realmName = getAppUrl();
      navigate(`/settings/neworganization/${realmName}`);
    }
  }, [rerender]);

  const handleObjectStoreDataChange = (e: any) => {
    try {
      setObjectStoreData({
        ...objectStoreData,
        [e.target.name]: e.target.value,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleDataChange = (e: any) => {
    try {
      setGoogleData({
        ...googleData,
        [e.target.name]: e.target.value,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getObjectStoreData = async () => {
    try {
      const result = await axios.get(
        `api/objectStore/getObjectStoreByOrgId/master`
      );
      if (result.data) {
        const objStrData = {
          _id: result?.data?._id,
          userId: atob(result?.data?.userId),
          tenancyId: atob(result?.data?.tenancyId),
          fingerprint: atob(result?.data?.fingerprint),
          region: atob(result?.data?.region),
          namespace: atob(result?.data?.namespace),
          bucketName: atob(result?.data?.bucketName),
          privateKeyExist: result?.data?.privateKey,
        };
        setObjectStoreData(objStrData);
      } else {
        setObjectStoreData([]);
      }
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const getGoogleData = async () => {
    try {
      const result = await axios.get(`api/google/getGoogleByOrgId/master`);
      if (result.data) {
        const gooData = {
          _id: result?.data?._id,
          clientId: atob(result?.data?.clientId),
          clientSecret: atob(result?.data?.clientSecret),
        }
        setGoogleData(gooData);
      } else {
        setGoogleData([]);
      }
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const submitGoogleData = async () => {
    try {
      const finalData = {
        organizationId: "master",
        clientId: btoa(googleData.clientId),
        clientSecret: btoa(googleData.clientSecret),
      }
      const result = await axios.post(`api/google/createGoogle`, finalData);
      const gooData = {
        _id: result?.data?.response?._id,
        clientId: atob(result.data.response?.clientId),
        clientSecret: atob(result.data.response?.clientSecret),
      }
      setGoogleData(gooData);
      enqueueSnackbar(result.data.responseMessage, {
        variant: "success",
      });
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const submitObjectStoreData = async () => {
    try {
      const formData = new FormData();
      formData.append("organizationId", "master");
      if (fileList.length !== 0) {
        formData.append("file", fileList[0].originFileObj);
        setFileList([]);
      }
      Object.keys(objectStoreData).forEach((key) => {
        formData.append(key, btoa(objectStoreData[key]));
      });
      const result = await axios.post(
        `api/objectStore/createObjectStore`,
        formData
      );
      const objStrData = {
        _id: result.data.response?._id,
        userId: atob(result.data.response?.userId),
        tenancyId: atob(result.data.response?.tenancyId),
        fingerprint: atob(result.data.response?.fingerprint),
        region: atob(result.data.response?.region),
        namespace: atob(result.data.response?.namespace),
        bucketName: atob(result.data.response?.bucketName),
        privateKeyExist: result.data.response?.privateKey,
      };
      setObjectStoreData(objStrData);
      enqueueSnackbar(result.data.responseMessage, {
        variant: "success",
      });
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const updateGoogleData = async () => {
    try {
      const finalData = {
        clientId: btoa(googleData.clientId),
        clientSecret: btoa(googleData.clientSecret),
      }
      const result = await axios.patch(
        `api/google/updateGoogle/${googleData._id}`,
        finalData
      );
      const gooData = {
        _id: result?.data?.response?._id,
        clientId: atob(result.data.response?.clientId),
        clientSecret: atob(result.data.response?.clientSecret),
      }
      setGoogleData(gooData);
      enqueueSnackbar(result.data.responseMessage, {
        variant: "success",
      });
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const updateObjectStoreData = async () => {
    try {
      const formData = new FormData();
      if (fileList.length !== 0) {
        formData.append("file", fileList[0].originFileObj);
        setFileList([]);
      }
      const { _id, ...rest } = objectStoreData;
      Object.keys(rest).forEach((key) => {
        formData.append(key, btoa(rest[key]));
      });
      const result = await axios.patch(
        `api/objectStore/updateObjectStore/${_id}`,
        formData
      );
      const objStrData = {
        _id: result.data.response?._id,
        userId: atob(result.data.response?.userId),
        tenancyId: atob(result.data.response?.tenancyId),
        fingerprint: atob(result.data.response?.fingerprint),
        region: atob(result.data.response?.region),
        namespace: atob(result.data.response?.namespace),
        bucketName: atob(result.data.response?.bucketName),
        privateKeyExist: result.data.response?.privateKey,
      };
      setObjectStoreData(objStrData);
      enqueueSnackbar(result.data.responseMessage, {
        variant: "success",
      });
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  useEffect(() => {
    if (activeOrgTab === "2") {
      getObjectStoreData();
      setActiveGSTab("1");
    }
  }, [activeOrgTab]);

  useEffect(() => {
    if (activeGSTab === "2") {
      getGoogleData();
    }
  }, [activeGSTab]);

  useEffect(() => {
    if (objectStoreData) {
      objectStoreForm.setFieldsValue({
        userId: objectStoreData.userId,
        tenancyId: objectStoreData.tenancyId,
        fingerprint: objectStoreData.fingerprint,
        region: objectStoreData.region,
        namespace: objectStoreData.namespace,
        bucketName: objectStoreData.bucketName,
      });
    }
  }, [objectStoreData]);

  useEffect(() => {
    if (googleData) {
      googleForm.setFieldsValue({
        clientId: googleData.clientId,
        clientSecret: googleData.clientSecret,
      });
    }
  }, [googleData]);

  const uploadProps: UploadProps = {
    multiple: false,
    beforeUpload: () => false,
    fileList,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFileList(fileList);
      }
    },
    onRemove: (file) => {
      setFileList((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      );
    },
  };

  return (
    <div className={classes.root}>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />
      <FilterDrawer
        open={filterOpen}
        setOpen={setFilterOpen}
        resultText={count ? `Showing ${count} Result(s)` : `No Results Found`}
        handleApply={handleApply}
        handleDiscard={handleDiscard}
      >
        <SearchBar
          placeholder="By Organization Name"
          name="orgName"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By Organization Admin"
          name="orgAdmin"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
      </FilterDrawer>
      {isAdmin ? (
        <>
          <Tabs activeKey={activeOrgTab} onChange={setActiveOrgTab}>
            <TabPane tab="Realms" key="1">
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" color="primary">
                  Organization Management
                </Typography>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Box className={classes.filterButtonContainer}>
                    <Tooltip title="Filter">
                      <Fab
                        size="medium"
                        className={classes.fabButton}
                        onClick={() => setFilterOpen(true)}
                      >
                        <MdFilterList />
                      </Fab>
                    </Tooltip>
                  </Box>
                  <Tooltip title="Add Organization">
                    <Fab
                      size="medium"
                      className={classes.fabButton}
                      onClick={handleClick}
                    >
                      <MdAdd />
                    </Fab>
                  </Tooltip>
                </Box>
              </Box>

              {loading ? (
                <div className={classes.loader}>
                  <CircularProgress />
                </div>
              ) : data && data?.length !== 0 ? (
                <div
                  data-testid="custom-table"
                  className={classes.tableContainer}
                >
                  <CustomTable
                    header={headers}
                    fields={fields}
                    data={data}
                    isAction={true}
                    actions={[
                      {
                        label: "Edit",
                        icon: <MdEdit fontSize="small" />,
                        handler: handleEditOrg,
                      },
                      {
                        label: "Delete",
                        icon: <MdDelete fontSize="small" />,
                        handler: handleOpen,
                      },
                    ]}
                  />
                  <SimplePaginationController
                    count={count}
                    page={page}
                    rowsPerPage={5}
                    handleChangePage={handleChangePage}
                  />
                </div>
              ) : (
                <>
                  <div className={classes.emptyTableImg}>
                    <img
                      src={EmptyTableImg}
                      alt="No Data"
                      height="400px"
                      width="300px"
                    />
                  </div>
                  <Typography align="center" className={classes.emptyDataText}>
                    Let’s begin by adding an organization
                  </Typography>
                </>
              )}
            </TabPane>
            <TabPane tab="Global Settings" key="2">
              <Tabs activeKey={activeGSTab} onChange={setActiveGSTab}>
                <TabPane tab="Object Store" key="1">
                  <Form
                    form={objectStoreForm}
                    layout="vertical"
                    onFinish={() => {
                      if (objectStoreData?._id) {
                        updateObjectStoreData();
                      } else {
                        submitObjectStoreData();
                      }
                    }}
                  >
                    <Row gutter={16}>
                      {/* Left Column */}
                      <Col span={12}>
                        <Form.Item
                          label="User ID"
                          name="userId"
                          rules={[
                            {
                              required: true,
                              message: "Please Enter User ID",
                            },
                          ]}
                        >
                          <Input
                            name="userId"
                            value={objectStoreData?.userId || ""}
                            onChange={handleObjectStoreDataChange}
                          />
                        </Form.Item>
                        <Form.Item
                          label="Tenancy ID"
                          name="tenancyId"
                          rules={[
                            {
                              required: true,
                              message: "Please Enter Tenancy ID",
                            },
                          ]}
                        >
                          <Input
                            name="tenancyId"
                            value={objectStoreData?.tenancyId || ""}
                            onChange={handleObjectStoreDataChange}
                          />
                        </Form.Item>
                        <Form.Item
                          label="Fingerprint"
                          name="fingerprint"
                          rules={[
                            {
                              required: true,
                              message: "Please Enter Fingerprint",
                            },
                          ]}
                        >
                          <Input
                            name="fingerprint"
                            value={objectStoreData?.fingerprint || ""}
                            onChange={handleObjectStoreDataChange}
                          />
                        </Form.Item>
                        <Form.Item
                          label="Region"
                          name="region"
                          rules={[
                            {
                              required: true,
                              message: "Please Enter Region",
                            },
                          ]}
                        >
                          <Input
                            name="region"
                            value={objectStoreData?.region || ""}
                            onChange={handleObjectStoreDataChange}
                          />
                        </Form.Item>
                      </Col>

                      {/* Right Column */}
                      <Col span={12}>
                        <Form.Item
                          label="Namespace"
                          name="namespace"
                          rules={[
                            {
                              required: true,
                              message: "Please Enter Namespace",
                            },
                          ]}
                        >
                          <Input
                            name="namespace"
                            value={objectStoreData?.namespace || ""}
                            onChange={handleObjectStoreDataChange}
                          />
                        </Form.Item>
                        <Form.Item
                          label="Bucket Name"
                          name="bucketName"
                          rules={[
                            {
                              required: true,
                              message: "Please Enter Bucket Name",
                            },
                          ]}
                        >
                          <Input
                            name="bucketName"
                            value={objectStoreData?.bucketName || ""}
                            onChange={handleObjectStoreDataChange}
                          />
                        </Form.Item>
                        <Form.Item
                          label={
                            objectStoreData?.privateKeyExist
                              ? "Private Key (Exists)"
                              : "Private Key (Do not Exist)"
                          }
                          name="privateKey"
                        >
                          <Dragger
                            accept=".pem"
                            name="privateKey"
                            {...uploadProps}
                          >
                            <p className="ant-upload-drag-icon">
                              <MdInbox />
                            </p>
                            <p className="ant-upload-text">
                              Click or drag file to this area to upload
                            </p>
                          </Dragger>
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Submit Button */}
                    <Row justify="center">
                      <Col>
                        <Form.Item>
                          <Button type="primary" htmlType="submit">
                            {objectStoreData?._id ? "Update" : "Submit"}
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </TabPane>
                <TabPane tab="Google" key="2">
                  <Form
                    form={googleForm}
                    layout="vertical"
                    onFinish={() => {
                      if (googleData?._id) {
                        updateGoogleData();
                      } else {
                        submitGoogleData();
                      }
                    }}
                  >
                    <Row gutter={16}>
                      {/* Left Column */}
                      <Col span={12}>
                        <Form.Item
                          label="Client ID"
                          name="clientId"
                          rules={[
                            {
                              required: true,
                              message: "Please Enter Client ID",
                            },
                          ]}
                        >
                          <Input
                            name="clientId"
                            value={googleData?.clientId || ""}
                            onChange={handleGoogleDataChange}
                          />
                        </Form.Item>
                      </Col>

                      {/* Right Column */}
                      <Col span={12}>
                        <Form.Item
                          label="Client Secret"
                          name="clientSecret"
                          rules={[
                            {
                              required: true,
                              message: "Please Enter Client Secret",
                            },
                          ]}
                        >
                          <Input
                            name="clientSecret"
                            value={googleData?.clientSecret || ""}
                            onChange={handleGoogleDataChange}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Submit Button */}
                    <Row justify="center">
                      <Col>
                        <Form.Item>
                          <Button type="primary" htmlType="submit">
                            {googleData?._id ? "Update" : "Submit"}
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </TabPane>
                {/* <TabPane tab="License" key="3">
                  <License isEdit={false} formValues={orgData}></License>
                </TabPane> */}
              </Tabs>
            </TabPane>
          </Tabs>
        </>
      ) : (
        <>
          <div className={classes.emptyTableImg}>
            <img src={NoAccess} alt="No Data" height="400px" width="300px" />
          </div>
          <Typography align="center" className={classes.emptyDataText}>
            You are not authorized to view this page
          </Typography>
        </>
      )}
    </div>
  );
}

export default Settings;
