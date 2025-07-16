import React, { useEffect, useState } from "react";
import { Form, Input, Row, Col, Select, Upload } from "antd";
import getAppUrl from "../../utils/getAppUrl";
import axios from "../../apis/axios.global";
import { useSnackbar } from "notistack";
import MyEditor from "./Editor";
import {
  makeStyles,
  TextField,
  IconButton,
  Typography,
} from "@material-ui/core";
import { API_LINK } from "../../config";
import type { UploadProps } from "antd";
import { MdInbox } from 'react-icons/md';
import moment from "moment";
import { useParams } from "react-router-dom";
import CrossIcon from "../../assets/icons/BluecrossIcon.svg";
import checkRoles from "../../utils/checkRoles";

const { Option } = Select;
const { Dragger } = Upload;

type Props = {
  formData?: any;
  setFormData?: any;
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& .MuiAccordionDetails-root": {
      display: "block",
    },
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "160px",
    whiteSpace: "nowrap",
    cursor: "pointer",
    "&:hover": {
      cursor: "pointer", // Change cursor to pointer on hover
    },
  },
}));

const periodArray = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const AgendaDetailPage = ({ formData, setFormData }: Props) => {
  const [firstForm] = Form.useForm();

  const previousData = { ...formData };
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const showData = isOrgAdmin || isMR;

  const [dataSource, setDataSource] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>(
    previousData?.unit || ""
  );
  const [units, setUnits] = useState<any[]>(previousData?.units || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [systemData, setSystemData] = useState<any[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<any[]>(
    previousData?.system || []
  );
  const [allPeriods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<any[]>([]);
  const [selectedDataAfterPeriod, setSelectedDataAfterPeriod] = useState<any[]>(
    []
  );
  const [uploadFileError, setUploadFileError] = useState<any>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [dateTime, setDateTime] = useState<any>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<string>("");

  const classes = useStyles();

  const orgId = sessionStorage.getItem("orgId");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const params = useParams();

  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    orgdata();
    if (params && params.id && params.id.length) {
      getMRMValues();
    }
  }, []);
  useEffect(() => {
    console.log("selected period value", selectedPeriod);
    handleChangePeriod(selectedPeriod);
    console.log("period change called");
  }, [selectedPeriod]);

  const orgdata = async () => {
    const response = await axios.get(`/api/organization/${realmName}`);
    console.log("response from org", response);
    if (response.status === 200 || response.status === 201) {
      setSettings(response?.data?.fiscalYearQuarters);
    }
  };

  const getMRMValues = async () => {
    const res = await axios(`/api/mrm/getMrmMeetingDetails/${params?.id}`);
    if (res.status === 200 || res.status === 201) {
      const data = res.data && res.data[0];
      setFormData({
        ...formData,
        organizer: data?.userName,
        unit: data?.value?.unitId,
        system: data?.value?.systemId,
        meetingTitle: data?.value?.meetingName,
        period: data?.value?.period,
        meetingDescription: data?.value?.description,
        dataValue: data?.value?.keyAgendaId,
        attendees: data?.value?.attendees,
        allData: data,
        date: data?.value?.meetingdate,
        _id: data?.value?._id,
        meetingMOM: data?.value?.notes,
      });

      getUnits();
      firstForm.setFieldsValue({
        organizer: userInfo?.userName,
        unit: data?.value?.unitId || null,
        system: data?.value?.systemId || [],
        meetingTitle: data?.value?.meetingName || null,
        period: data?.value?.period || null,
        meetingDesc: data?.value?.description,
      });

      if (data?.value?.meetingdate) {
        const date = moment(data?.value?.meetingdate);
        const dateComponent = date.format("YYYY-MM-DD");
        const timeComponent = date.format("HH:mm");
        setDateTime(`${dateComponent}T${timeComponent}`);
        firstForm.setFieldsValue({ date: `${dateComponent}T${timeComponent}` });
        // firstForm.setFieldsValue({ date: moment(data?.value?.meetingdate), });
      }
      if (data?.value?.files && data?.value?.files.length) {
        firstForm.setFieldsValue({ documentLink: data?.value?.files });
        setFileList([...data?.value?.files]);
        setFormData({ ...formData, file: data?.value?.files });
      }
      setFormData({ ...formData, organizer: userInfo?.userName || "" });
      if (data?.value?.unitId) {
        getApplicationSystems(data?.value?.unitId);
      }
      if (data?.value?.systemId && data?.value?.systemId.length) {
        getKeyAgendaValues(data?.value?.systemId);
      }
    }
  };

  useEffect(() => {
    getUnits();
    firstForm.setFieldsValue({
      organizer: userInfo?.userName,
      unit: previousData?.unit || null,
      system: previousData?.system || [],
      meetingTitle: previousData?.meetingTitle || null,
      period: previousData?.period || null,
      meetingDesc: previousData?.meetingDescription || "",
    });
    if (previousData?.files && previousData?.files.length) {
      firstForm.setFieldsValue({ documentLink: previousData?.files });
      setFileList([...previousData?.files]);
      setFormData({ ...formData, file: previousData?.files });
    }

    if (previousData?.date) {
      const date = moment(previousData?.date);
      const dateComponent = date.format("YYYY-MM-DD");
      const timeComponent = date.format("HH:mm");
      setDateTime(`${dateComponent}T${timeComponent}`);
      firstForm.setFieldsValue({ date: `${dateComponent}T${timeComponent}` });
    }
    setFormData({ ...formData, organizer: userInfo?.userName || "" });
    if (previousData?.unit) {
      getApplicationSystems(previousData?.unit);
    }
    if (previousData?.system && previousData?.system.length) {
      getKeyAgendaValues(previousData?.system);
    }
  }, []);

  const getUnits = async () => {
    setLoading(true);
    await axios(`/api/location/getLocationsForOrg/${realmName}`)
      .then((res) => {
        setUnits(res?.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  const getApplicationSystems = async (locationId: any) => {
    const encodedSystems = encodeURIComponent(JSON.stringify(locationId));
    const { data } = await axios.get(
      `api/systems/displaySystemsForGivenLocation/${encodedSystems}`
    );
    setSystemData([...data]);
  };

  const handleChangeSystem = (value: string[]) => {
    setSelectedSystem(value);
    // getKeyAgendaValues(value);
  };

  const getKeyAgendaValues = async (data: any) => {
    try {
      setLoading(true);
      //get api
      if (data && data.length && selectedUnit) {
        const payload = {
          orgId: orgId,
          unitId: [selectedUnit],
          applicationSystemID: [...data],
        };
        const res = await axios.get("api/keyagenda/getSchedulePeriodUnit", {
          params: payload,
        });
        console.log("res in getscheduleperiounit", res);
        if (res.status === 200 || res.status === 201) {
          const data = res.data;
          const allPeriods = res?.data?.period;

          if (settings === "Jan - Dec" && allPeriods.length) {
            allPeriods.sort(function (a: any, b: any) {
              return periodArray.indexOf(a) - periodArray.indexOf(b);
            });
          }

          setPeriods(allPeriods || []);
          setDataSource(data?.data);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      enqueueSnackbar(`!`, {
        variant: "error",
      });
    }
  };

  const handleChange = (value: string) => {
    setSelectedUnit(value);
    getApplicationSystems(value);
  };

  const handleKeyAgenda = () => {
    getKeyAgendaValues(selectedSystem);
  };

  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: false,
    beforeUpload: () => {
      return false;
    },
    onRemove: (file) => {
      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== file.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          files: fileList,
        }));
      }
    },
  };

  const addSelectedFile = async (
    file: any,
    addedFile: any,
    addedFileList: any
  ) => {
    setUploadLoading(true);
    const formDataFile = new FormData();
    formDataFile.append("file", file);
    const res = await axios.post(
      `${API_LINK}/api/mrm/attachment/action-point`,
      formDataFile
    );
    if (res.status === 200 || res.status === 201) {
      let previousFiles: any = addedFileList;
      previousFiles =
        previousFiles.length &&
        previousFiles.map((item: any) =>
          item.uid === file.uid
            ? { ...item, url: res.data.path, name: res.data.name }
            : { ...item }
        );
      setFileList(previousFiles);
      setFormData({ ...formData, file: previousFiles });
      firstForm.setFieldsValue({ documentLink: previousFiles });
      setUploadLoading(false);
    }
  };

  const clearFile = async (data: any) => {
    try {
      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== data.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: updatedFileList,
      }));
    } catch (error) {
      return error;
    }
  };

  const handleChangePeriod = (data: any) => {
    setSelectedPeriod(data);

    let newDataSource: any[] = [...dataSource];

    newDataSource = newDataSource.filter((item: any) =>
      item?.period.includes(data)
    );

    setFormData({
      ...formData,
      keyadendaDataValues: newDataSource,
      period: data,
    });

    setSelectedDataAfterPeriod(newDataSource);
  };

  const handleChangeDateTime = (event: any) => {
    setFormData({ ...formData, date: event.target.value || null });
    setDateTime(event.target.value || null);
  };

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const handleLinkClick = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.url
        : await viewObjectStorageDoc(item?.url);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };

  return (
    <Form
      form={firstForm}
      layout="vertical"
      onValuesChange={(changedValues, allValues) =>
        setFormData({ ...formData, allValues, changedValues })
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            label="Select Unit: "
            name="unit"
            // tooltip="This is a required field"
            rules={[{ required: true, message: "Please Select Unit!" }]}
          >
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select unit"
              onChange={handleChange}
              disabled={showData ? false : true}
            >
              {units.length &&
                units.map((data) => {
                  return (
                    <Option value={data?.id} key={data?.id}>
                      {data?.locationName}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          {systemData && systemData.length > 0 && (
            <Form.Item
              label="Select System: "
              name="system"
              // tooltip="This is a required field"
              rules={[{ required: true, message: "Please Select System!" }]}
            >
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Please select system"
                onChange={handleChangeSystem}
                disabled={showData ? false : true}
                onBlur={handleKeyAgenda}
              >
                {systemData?.map((data) => {
                  return (
                    <Option value={data?.id} key={data?.id}>
                      {data?.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          )}
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Form.Item
            label="Meeting Title"
            name="meetingTitle"
            // tooltip="This is a required field"
            rules={[
              { required: true, message: "Please Select Meeting Title!" },
            ]}
          >
            <Input
              placeholder="Enter Meeting name"
              disabled={showData ? false : true}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Meeting Date: "
            name="date"
            // tooltip="This is a required field"
            rules={[{ required: true, message: "Please Select Date!" }]}
          >
            {/* <DatePicker onChange={onChangeDate} /> */}
            <TextField
              fullWidth
              disabled={showData ? false : true}
              type="datetime-local"
              name="time"
              value={dateTime}
              defaultValue={dateTime}
              variant="outlined"
              onChange={(e) => handleChangeDateTime(e)}
              size="small"
              required
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            label="Period"
            name="period"
            // tooltip="This is a required field"
            rules={[{ required: false, message: "Please Select period!" }]}
          >
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select period"
              onChange={handleChangePeriod}
              disabled={showData ? false : true}
            >
              {allPeriods.length &&
                allPeriods.map((data) => {
                  return (
                    <Option value={data} key={data}>
                      {data}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Organizer" name="organizer">
            <Input
              value={userInfo?.userName || ""}
              disabled={true}
              placeholder={userInfo?.userName || ""}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item label="Meeting Description/Notes" name="meetingDesc">
            <MyEditor
              formData={formData}
              setFormData={setFormData}
              title="description"
              readStatus={undefined}
              readMode={undefined}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item
            name="documentLink"
            label={fileList.length ? "Change Uploaded File" : "Attach File: "}
            help={uploadFileError ? "Please upload a file!" : ""}
            validateStatus={uploadFileError ? "error" : ""}
          >
            <Dragger
              accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
              name="documentLink"
              {...uploadFileprops}
              className={classes.uploadSection}
              showUploadList={false}
              fileList={formData.files}
              disabled={showData ? false : true}
            >
              <p className="ant-upload-drag-icon">
                <MdInbox />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
            </Dragger>
          </Form.Item>

          {uploadLoading ? (
            <div>Please wait while document gets uploaded </div>
          ) : (
            formData?.files &&
            formData?.files?.length > 0 &&
            formData?.files?.map((item: any) => (
              <div
                style={{
                  display: "flex",
                  marginLeft: "10px",
                  alignItems: "center",
                }}
              >
                <Typography
                  className={classes.filename}
                  onClick={() => handleLinkClick(item)}
                >
                  {item?.name}
                </Typography>

                <IconButton onClick={() => clearFile(item)}>
                  <img src={CrossIcon} alt="" />
                </IconButton>
              </div>
            ))
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default AgendaDetailPage;
