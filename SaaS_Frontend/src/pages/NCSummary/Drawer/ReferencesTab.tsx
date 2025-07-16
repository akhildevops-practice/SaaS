//antd
import {
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
} from "antd";
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from "@material-ui/core";
import { MdDelete } from 'react-icons/md';
import { MdSearch } from 'react-icons/md';
import { API_LINK } from "../../../config";
import axios from "../../../apis/axios.global";
import { useEffect, useState } from "react";
import useStyles from "../Modal/commonDrawerStyles";

type Props = {
  formData?: any;
  setFormData?: any;
  referencesNew?: any;
  setReferencesNew?: any;
};

const ReferencesTab = ({
  formData,
  setFormData,
  referencesNew,
  setReferencesNew,
}: Props) => {
  const [refType, setRefType] = useState<any>();
  const [references, setReferences] = useState<any>([]);
  const [options, setOptions] = useState<any>([]);
  const [searchQuery, setsearchQuery] = useState<string>("");
  const [addUrlModalOpen, setAddUrlModalOpen] = useState<boolean>(false);
  const [addUrlForm] = Form.useForm();
  const orgId = sessionStorage.getItem("orgId");
  const classes = useStyles();

  useEffect(() => {
    if (refType === "Add URL") {
      setAddUrlModalOpen(true);
    }
  }, [refType]);

  useEffect(() => {
    console.log("references in referencesTab=>", referencesNew);
    // setReferences(referencesNew)
    !!setFormData &&
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        references: referencesNew,
      }));
  }, [referencesNew]);

  const fetchResultsDocuments = async (value: any) => {
    try {
      const res = await axios.get(
        `${API_LINK}/api/riskconfig/document?search=${value}`
      );
      const documents = res.data;
      if (documents.length > 0) {
        const docOptions = documents.map((doc: any) => ({
          value: doc.documentName,
          label: doc.documentName,
          id: doc.id,
          url: doc.documentLink,
        }));
        setOptions(docOptions);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  const debounce = (func: any, wait: any) => {
    let timeout: any;
    return (...args: any) => {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const fetchResultsNC = async (value: any) => {
    try {
      const res = await axios.get(
        `${API_LINK}/api/audits/nc/search?text=${value}&pagination=${false}&organization=${orgId}&skip=0&limit=0`
      );
      const ncs = res.data.nc;
      console.log("ncs", ncs);

      if (ncs.length > 0) {
        const ncOptions = ncs.map((nc: any) => ({
          value: nc.id,
          label: nc.id,
        }));
        setOptions(ncOptions);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  const debouncedFetchResultsNC = debounce(
    (value: any) => fetchResultsNC(value),
    500
  );

  const debouncedFetchResultsDoc = debounce(
    (value: any) => fetchResultsDocuments(value),
    500
  );

  const handleSearchChange = (value: any) => {
    if (refType === "NC") {
      setsearchQuery(value);
      if (value.length >= 3) {
        debouncedFetchResultsNC(value);
      }
    } else if (refType === "Document") {
      setsearchQuery(value);
      if (value.length >= 3) {
        debouncedFetchResultsDoc(value);
      }
    }
  };
  const validateSearch = (_: any, value: any) => {
    if (value && value.length > 0 && value.length < 3) {
      return Promise.reject(
        `At least type three characters to search ${refType}`
      );
    }
    return Promise.resolve();
  };

  const handleSelect = (value: any, option: any) => {
    if (refType === "NC") {
      const newReference = {
        id: option.value,
        refType,
        url: option.value,
        name: option.label,
        label: option.label,
        value: option.value,
      };
      setReferencesNew((prevReferences: any) => {
        const isDuplicate = prevReferences.some(
          (reference: any) => reference.id === newReference.id
        );
        if (!isDuplicate) {
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            references: [...(prevFormData.references || []), newReference],
          }));
          return [...prevReferences, newReference];
        }
        return prevReferences;
      });
    } else if (refType === "Document") {
      const newReference = {
        id: option.id, // assuming the option.value is the id
        refType,
        url: option.url,
        name: option.label,
        label: option.label,
        value: option.value,
      };
      setReferencesNew((prevReferences: any) => {
        const isDuplicate = prevReferences.some(
          (reference: any) => reference.id === newReference.id
        );
        if (!isDuplicate) {
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            references: [...(prevFormData.references || []), newReference],
          }));
          return [...prevReferences, newReference];
        }
        return prevReferences;
      });
    }
  };

  const handleRemoveOption = (option: any) => {
    setReferencesNew((prevOptions: any) => {
      const newOptions = prevOptions.filter(
        (prevOption: any) => prevOption.label !== option
      );

      // Also update formData.references
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        references: newOptions,
      }));

      return newOptions;
    });
  };
  const addUrl = (values: any) => {
    const urlObject = {
      refType: "url",
      url: values.value,
      name: values.label,
      label: values.label,
      value: values.value,
    };
    setReferencesNew((prevReferences: any) => {
      const isDuplicate = prevReferences.some(
        (reference: any) =>
          reference.url === urlObject.url && reference.refType === "url"
      );
      if (!isDuplicate) {
        // Also update formData.references
        // setFormData((prevFormData: any) => ({
        //   ...prevFormData,
        //   references: [...(prevFormData.references || []), urlObject],
        // }));
        return [...prevReferences, urlObject];
      }
      return prevReferences;
    });

    setAddUrlModalOpen(false);
    addUrlForm.resetFields();
    // mitigationForm.resetFields(["refType", "search"]);
    setRefType("");
  };
  return (
    <>
      <Form layout="vertical" className={classes.formBox}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item label="Reference Type: " name="refType">
              <Select
                aria-label="Select Reference Type"
                placeholder="Select Reference"
                onChange={(value: any) => setRefType(value)}
                options={[
                  { value: "NC", label: "NC" },
                  { value: "Document", label: "Document" },
                  { value: "Add URL", label: "Add URL" },
                ]}
                size="large"
              />
            </Form.Item>
          </Col>
          {(refType === "NC" || refType === "Document") && (
            <Col span={12}>
              <Form.Item
                name="search"
                label={"Search " + refType}
                rules={[
                  {
                    validator: validateSearch,
                  },
                ]}
              >
                <AutoComplete
                  size="large"
                  options={options}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onSelect={handleSelect}
                >
                  <Input
                    size="large"
                    prefix={<MdSearch />}
                    placeholder={"Search "}
                  />
                </AutoComplete>
              </Form.Item>
            </Col>
          )}
        </Row>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "20px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Grid item xs={12} md={6}>
            <div className={classes.root}>
              <div className={classes.demo}>
                <List className={classes.scrollableList}>
                  {!!referencesNew && referencesNew.length > 0 ? (
                    referencesNew.map((item: any) => (
                      <>
                        <ListItem key={item.value}>
                          <ListItemText
                            primary={
                              <a
                                href={item.value}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {item.label}
                              </a>
                            }
                            secondary={null}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleRemoveOption(item.label)}
                            >
                              <MdDelete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider light />
                      </>
                    ))
                  ) : (
                    <ListItem style={{ color: "#808080" }}>
                      <ListItemText
                        primary="No References Selected"
                        secondary={null}
                      />
                    </ListItem>
                  )}
                </List>
              </div>
            </div>
          </Grid>
        </div>
      </Form>

      <Modal
        title={<p style={{ textAlign: "center" }}>Add URL</p>}
        centered
        open={addUrlModalOpen}
        footer={null}
        onOk={() => setAddUrlModalOpen(false)}
        onCancel={() => setAddUrlModalOpen(false)}
        width="475px"
      >
        <Form form={addUrlForm} layout="vertical" onFinish={addUrl}>
          <Row
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              // paddingLeft: "10px",
              // paddingRight: "10px",
            }}
          >
            <Col>
              <Form.Item
                label="Title"
                name="label"
                rules={[{ required: true, message: "Please input the title!" }]}
              >
                <Input placeholder="Enter Title" size="middle" />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label="URL"
                name="value"
                rules={[{ required: true, message: "Please input the URL!" }]}
              >
                <Input placeholder="Enter URL" size="middle" />
              </Form.Item>
            </Col>
          </Row>
          <Row
            style={{
              padding: "10px 10px",
              justifyContent: "end",
            }}
          >
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ReferencesTab;
