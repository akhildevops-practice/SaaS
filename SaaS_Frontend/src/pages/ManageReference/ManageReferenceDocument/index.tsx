import { Button, Col, Form, Input, Row, UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";

import { MdInbox } from 'react-icons/md';
import { useEffect, useState } from "react";
import {
  Avatar,
  TextField,
  Theme,
  makeStyles,
  IconButton,
} from "@material-ui/core";
import { Typography } from "antd";
import Autocomplete from "@material-ui/lab/Autocomplete";
import checkRoles from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import { API_LINK } from "config";
import { useSnackbar } from "notistack";
import toFormData from "utils/toFormData";
import { MdAttachFile } from 'react-icons/md';
import saveAs from "file-saver";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
    },
  },
  item: {
    marginBottom: "15px",
    color: "#003566",
    fontWeight: 600,
    fontSize: "13px",
    letterSpacing: ".8px",
    transition: "text-decoration 0.3s", // Add transition effect for smooth animation
    "&:hover": {
      textDecoration: "underline", // Add underline on hover
    },
  },
  scroolBar: {
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#b3ccff",
    },
  },
  locSearchBox: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
  },
  searchBoxText: {
    fontSize: theme.typography.pxToRem(13),
  },
}));

interface Location {
  title: string;
  // Add other properties if present in your location objects
}

interface Location {
  id: string;
  locationName: string;
  // Add other properties here
}

type Props = {
  refDrawer: any;
  setRefDrawer: React.Dispatch<React.SetStateAction<any>>;
  getData: any;
};


const ManageReferenceDocument: React.FC<Props> = ({ refDrawer, setRefDrawer, getData }) => {
  const classes = useStyles();
  const [fileList, setFileList] = useState<any>([]);
  const userDetails = getSessionStorage();
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const realmName = getAppUrl();
  const initials = { id: userInfo.id, name: userInfo.fullName };
  const initial = userInfo.fullName.charAt(0);
  const allOption = [{ id: "All", locationName: "All" }];
  const [helpData, setHelpData] = useState<any>(null);
  const [firstForm] = Form.useForm();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const [locationNames, setLocationNames] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>([
    { id: "All", locationName: "All" },
  ]);
  const [locationName, setLocationName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [creatorData, setCreatorData] = useState<any>("");
  const [createdDate, setCreatedDate] = useState<any>();
  const [documentLinkNew, setDocumentLinkNew] = useState<any>("");

  const uploadProps: UploadProps = {
    multiple: false,
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      const latestFileList = fileList.slice(-1);
      setFileList(latestFileList);
      setHelpData({ ...helpData, file: fileList[0].originFileObj })
    },
    onRemove: (file) => {
      setFileList([]);
    },
    fileList: fileList,
  };

  useEffect(() => {
    getLocationNames();
    setFileList([])
  }, []);

  const getLocationNames = async () => {
    setIsLoading(true);
    try {
      setIsLoading(true);
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );
      setLocationName(res.data[0].locationName);
      setLocationNames(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleChange = (event: any, values: any) => {

    if (values.find((option: any) => option.id === "All")) {
      setSelectedLocation(allOption);
    } else {
      setSelectedLocation(values.filter((option: any) => option.id !== "All"));
    }

    const updatedData = { ...helpData, location: values };
    setHelpData(updatedData);
  };

  const handleFinish = async () => {
    if (helpData.file) {
      let payload = {
        ...helpData,
        creatorId: userInfo.id,
        creatorName: userInfo.fullName,
        location: selectedLocation
      }

      delete payload.attachments

      if (!isMCOE) {
        payload = {
          ...payload,
          location: [{
            id: userInfo.location.id,
            locationId: userInfo.location.locationId,
            locationName: userInfo.location.locationName
          }],
          documentLink: ""
        }
      }

      const form = toFormData({ ...payload })

      let locationName;
      if (payload.location.length > 1) {
        locationName = 'Multi'
      } else {
        locationName = payload.location[0].locationName
      }

      if (refDrawer.mode === "create") {
        const result = await axios.post(
          API_LINK + `/api/referenceDocuments?realmName=${realmName}/${locationName}`,
          form
        );
        if (result.status === 200 || result.status === 201) {
          enqueueSnackbar(`Data Added successfully!`, {
            variant: "success",
          });
        }
      }

      if (refDrawer.mode === "edit") {
        const updatedata = await axios.put(
          API_LINK + `/api/referenceDocuments/${refDrawer.id}?realmName=${realmName}/${locationName}`,
          form
        )

        if (updatedata.status === 200 || updatedata.status === 201) {
          getData();
          enqueueSnackbar(`Data Updated successfully!`, {
            variant: "success",
          });
        }
      }
      setRefDrawer({
        ...refDrawer, open: false
      })
      getData();
      setFileList([])
    } else {
      enqueueSnackbar(`Please Attach File`, {
        variant: "warning",
      });
    }
  }

  useEffect(() => {
    if (refDrawer.mode === "edit") {
      getRefById()
    }
    else if (refDrawer.mode === "create") {
      firstForm.setFieldsValue({
        _id: "",
        creator: {},
        topic: "",
        createdAt: "",
        documentLink: ""
      });
      setSelectedLocation([
        { id: "All", locationName: "All" },
      ])
    }
  }, [refDrawer.open])

  const getRefById = async () => {
    try {
      const result = await axios.get(
        API_LINK + `/api/referenceDocuments/getReferenceDocumentById/${refDrawer.id}`
      );
      const creator = result.data.creator.creatorName;
      const date = result.data.createdAt;
      const newdate = new Date(date);
      const year = newdate.getFullYear();
      const month = newdate.getMonth() + 1; // Month is zero-indexed, so add 1
      const day = newdate.getDate();

      // Format the date as yyyy-mm-dd
      const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
      const editData = result.data;

      firstForm.setFieldsValue({
        _id: editData?._id,
        creator: editData?.creator.creatorName,
        topic: editData?.topic,
        createdAt: editData?.createdAt,
        location: editData?.location,
        documentLink: editData?.documentLink
      });
      setSelectedLocation(editData?.location)
      setCreatorData(creator);
      setCreatedDate(formattedDate);
      setDocumentLinkNew(editData?.documentLink)
    }
    catch (error) {
      console.log("error", error);
    }
  }

  const downloadDocument = async (documentLink: any) => {
    const documentName = documentLink.split('-').pop()
    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      const response = await axios.post(
        `${API_LINK}/api/documents/documentOBJ`,
        { documentLink }
      );
      const buffer = response.data;
      const uint8Array = new Uint8Array(buffer.data);
      const blob = new Blob([uint8Array], { type: "application/octet-stream" });
      saveAs(blob, documentName + "." + documentLink.split(".").pop());
    } else {
      const url =
        `${process.env.REACT_APP_API_URL}/proxy/pdf?url=` +
        encodeURIComponent(helpData.documentLink);
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          saveAs(
            blob,
            documentName +
            "." +
            helpData.documentLink.split(".").pop()
          );
        })
        .catch((error) => console.error("Error fetching document:", error));
    }
  };

  return (
    <>
      {refDrawer.mode === "create" ? (
        <div>
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "40px",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                height: "40px",
                width: "130px",
                gap: "8px",
              }}
            >
              <div style={{ marginTop: "4px" }}>
                <Avatar
                  src={`${API_LINK}/${
                    refDrawer?.mode === "create"
                      ? userInfo.avatar
                      : helpData?.createdBy?.avatar
                  }`}
                  alt="profile"
                >
                  {initial}
                </Avatar>
              </div>
              <div style={{ fontSize: "14px" }}>{initials.name}</div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "40px",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                height: "40px",
                width: "130px",
                gap: "8px",
              }}
            >
              <div style={{ marginTop: "4px" }}>
                <Avatar
                  src={`${API_LINK}/${
                    refDrawer?.mode === "create"
                      ? userInfo.avatar
                      : helpData?.createdBy?.avatar
                  }`}
                  alt="profile"
                >
                  {creatorData}
                </Avatar>
              </div>
              <div style={{ fontSize: "14px" }}>{creatorData}</div>
            </div>
          </div>
        </div>
      )}
      <div>
        <Form
          form={firstForm}
          layout="vertical"
          rootClassName={classes.labelStyle}
          onValuesChange={(changedValues, allValues) => {
            setHelpData({ ...helpData, ...changedValues });
          }}
          onFinish={handleFinish}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Topic "
                name="topic"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Topic Name!",
                  },
                ]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label="Applicable Unit" name="location">
                {isOrgAdmin ? (
                  <div className={classes.locSearchBox}>
                    <Autocomplete
                      multiple
                      id="location-autocomplete"
                      options={[...allOption, ...locationNames]}
                      getOptionLabel={(option) => option.locationName || ""}
                      getOptionSelected={(option, value) =>
                        option.id === value.id
                      }
                      value={selectedLocation}
                      onChange={handleChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          label="Location"
                          fullWidth
                        />
                      )}
                    />
                  </div>
                ) : (
                  <Typography
                    color="primary"
                    className={classes.searchBoxText}
                    style={{
                      border: "1px solid #DADADA",
                      borderRadius: "8px",
                      height: "40px",
                      paddingLeft: "15px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {locationName}
                  </Typography>
                )}
              </Form.Item>
            </Col>
          </Row>
          {refDrawer.mode === "edit" ? (
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item label="Created Date" name="date">
                  <Typography
                    style={{
                      border: "1px solid #DADADA",
                      borderRadius: "8px",
                      height: "40px",
                      paddingLeft: "15px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {createdDate}
                  </Typography>
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <div> </div>
          )}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="uploader" style={{ display: "none" }}>
                <Input />
              </Form.Item>
              <Form.Item
                name="documentLink"
                label={"Attach File: "}
                // rules={[
                //   {
                //     required: true,
                //     message: "Please Attach File!",
                //   },
                // ]}
              >
                <Dragger
                  name="documentLink"
                  {...uploadProps}
                  fileList={fileList}
                >
                  <p className="ant-upload-drag-icon">
                    <MdInbox />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                </Dragger>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    backgroundColor: "#f0f0f0",
                    padding: "5px",
                    borderRadius: "5px",
                    marginTop: "5px",
                    height: "15px",
                  }}
                >
                  {refDrawer.mode === "edit" && (
                    <>
                      <MdAttachFile
                        style={{
                          fontSize: "20px",
                          color: "black",
                        }}
                      ></MdAttachFile>
                      <IconButton
                        style={{
                          fontSize: "15px",
                          color: "black",
                        }}
                        onClick={() => {
                          downloadDocument(documentLinkNew);
                        }}
                      >
                        {process.env.REACT_APP_IS_OBJECT_STORAGE === "true"
                          ? documentLinkNew.split("-").pop()
                          : documentLinkNew.split("/").pop()}
                      </IconButton>
                    </>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="submit">
            <Button type="primary" htmlType="submit">
              {refDrawer.mode === "edit" ? <>Update</> : <>Submit</>}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default ManageReferenceDocument;
