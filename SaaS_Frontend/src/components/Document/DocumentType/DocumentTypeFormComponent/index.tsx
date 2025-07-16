// 📝 Keeping all imports, types, useEffect, functions etc. same
// ✅ Replacing MUI form with AntD layout only

import React from "react";
import useStyles from "./styles";
import {
  FormControl,
  Select as MUISelect,
  MenuItem,
  InputLabel,
} from "@material-ui/core";
import _ from "lodash";

// AntD
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Checkbox,
} from "antd";
import { MdCheck } from "react-icons/md";

const { Option } = Select;

const prefixDefaults = ["YY", "MM", "LocationId", "DepartmentId"];
const suffixDefaults = ["YY", "MM", "LocationId", "DepartmentId"];
const DocNum = ["Serial", "Manual"];
const readAccessOptionsList = [
  "All Users",
  "All in Units(S)",
  "All in Entites",
  "Selected Users",
];
const distributeAccessOptionsList = [
  "None",
  "All Users",
  "All in Units(S)",
  "All in Entities",
  "Selected Users",
  "Respective Entity",
  "Respective Unit",
];

interface Props {
  form: any;
  formData: any;
  locationOption: any[];
  userOptions: any[];
  entityOption: any[];
  systems: { name: string }[];
  prefixOptions: string[];
  suffixOptions: string[];
  showCustomPrefix: boolean;
  customPrefix: string;
  showCustomSuffix: boolean;
  customSuffix: string;
  handlePrefixChange: (value: string[]) => void;
  handleSuffixChange: (value: string[]) => void;
  handleAddCustomPrefix: () => void;
  handleEditCustomPrefix: () => void;
  setCustomPrefix: (value: string) => void;
  handleAddCustomSuffix: () => void;
  handleEditCustomSuffix: () => void;
  setCustomSuffix: (value: string) => void;
  onValuesChange: (changedValues: any, allValues: any) => void;
  handleSubmit?: any;
  handleDiscard?: any;
  isEdit?: any;
  readMode?: any;
  prefixSample: string;
  suffixSample: string;
  docsClassificationValid?: boolean;
  checkDocType: (value: string) => void;
}

const DocumentTypeFormComponent: React.FC<Props> = ({
  form,
  formData,
  locationOption,
  userOptions,
  entityOption,
  systems,
  prefixOptions,
  suffixOptions,
  showCustomPrefix,
  customPrefix,
  showCustomSuffix,
  customSuffix,
  handlePrefixChange,
  handleSuffixChange,
  handleAddCustomPrefix,
  handleEditCustomPrefix,
  setCustomPrefix,
  handleAddCustomSuffix,
  handleEditCustomSuffix,
  setCustomSuffix,
  onValuesChange,
  handleSubmit,
  handleDiscard,
  readMode,
  prefixSample,
  suffixSample,
  docsClassificationValid,
  checkDocType,
}) => {
  const classes = useStyles();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={formData}
      disabled={readMode}
      onValuesChange={onValuesChange}
      size="large"
      style={{ paddingRight: "10px" }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Applicable Units"
            name="applicable_locations"
            rules={[{ required: true, message: "Please select units!" }]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select Units"
              optionFilterProp="children"
              filterOption={(input: any, option: any) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: "100%" }}
            ></Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Document Type Name"
            name="documentTypeName"
            rules={[
              { required: true, message: "Please enter document type name!" },
            ]}
          >
            <Input placeholder="Enter Document Type Name" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Document Classification"
            name="document_classification"
            rules={[
              { required: true, message: "Please enter classification!" },
            ]}
            validateStatus={
              formData.document_classification &&
              docsClassificationValid === false
                ? "error"
                : formData.document_classification &&
                  docsClassificationValid === true
                ? "success"
                : undefined
            }
            help={
              formData.document_classification &&
              docsClassificationValid === false
                ? "Classification might already exist"
                : undefined
            }
            hasFeedback
          >
            <Input
              placeholder="Enter Document Classification"
              onChange={(e) => checkDocType(e.target.value)}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Revision Frequency (Months)"
            name="reviewFrequency"
            rules={[{ required: true, message: "Please enter frequency!" }]}
          >
            <Input type="number" placeholder="Enter frequency" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Revision Notification (Days)"
            name="revisionRemind"
            rules={[
              { required: true, message: "Please enter notification days!" },
            ]}
          >
            <Input type="number" placeholder="e.g. 30" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            label="Document Numbering"
            name="documentNumbering"
            rules={[
              { required: true, message: "Please select numbering type!" },
            ]}
          >
            <Select placeholder="Select numbering">
              {DocNum.map((item, i) => (
                <Option key={i} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {formData.documentNumbering === "Serial" && (
          <>
            <Col span={12}>
              <Form.Item label="Prefix" name="prefix">
                <MUISelect
                  labelId="prefix-label"
                  multiple
                  value={formData.prefix || []}
                  onChange={(e: any) =>
                    handlePrefixChange(e.target.value as string[])
                  }
                  renderValue={(selected: any) =>
                    (selected as string[]).join("-")
                  }
                  style={{ width: "100%", marginTop: 8 }}
                >
                  {prefixOptions.map((item, i) => (
                    <MenuItem key={i} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </MUISelect>
              </Form.Item>

              {!showCustomPrefix ? (
                <Button
                  type="primary"
                  size="small"
                  style={{ marginTop: 8, backgroundColor: "rgb(0, 48, 89)" }}
                  onClick={handleEditCustomPrefix}
                >
                  Add Custom Prefix
                </Button>
              ) : (
                <Input
                  placeholder="Enter custom prefix"
                  value={customPrefix}
                  onChange={(e) => setCustomPrefix(e.target.value)}
                  onPressEnter={handleAddCustomPrefix}
                  suffix={
                    <MdCheck
                      style={{ cursor: "pointer" }}
                      onClick={handleAddCustomPrefix}
                    />
                  }
                  style={{ marginTop: 8 }}
                />
              )}
            </Col>

            <Col span={12}>
              <Form.Item label="Suffix" name="suffix">
                <MUISelect
                  labelId="suffix-label"
                  multiple
                  value={formData.suffix || []}
                  onChange={(e: any) =>
                    handleSuffixChange(e.target.value as string[])
                  }
                  renderValue={(selected: any) =>
                    (selected as string[]).join("-")
                  }
                  style={{ width: "100%", marginTop: 8 }}
                >
                  {suffixOptions.map((item, i) => (
                    <MenuItem key={i} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </MUISelect>
              </Form.Item>

              {!showCustomSuffix ? (
                <Button
                  type="primary"
                  size="small"
                  style={{ marginTop: 8, backgroundColor: "rgb(0, 48, 89)" }}
                  onClick={handleEditCustomSuffix}
                >
                  Add Custom Suffix
                </Button>
              ) : (
                <Input
                  placeholder="Enter custom suffix"
                  value={customSuffix}
                  onChange={(e) => setCustomSuffix(e.target.value)}
                  onPressEnter={handleAddCustomSuffix}
                  suffix={
                    <MdCheck
                      style={{ cursor: "pointer" }}
                      onClick={handleAddCustomSuffix}
                    />
                  }
                  style={{ marginTop: 8 }}
                />
              )}
            </Col>

            <Col
              span={24}
              style={{
                textAlign: "start",
                marginBottom: 16,
                paddingLeft: "calc(50% + 8px)",
              }}
            >
              <Typography.Text strong>
                Format Sample:{" "}
                <Typography.Text type="secondary">
                  ({prefixSample || "PRE"} - 001 - {suffixSample || "SUF"})
                </Typography.Text>
              </Typography.Text>
            </Col>
          </>
        )}

        <Col span={12}>
          <Form.Item
            label="Applicable Systems"
            name="applicable_systems"
            rules={[{ required: true, message: "Please select systems!" }]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select Systems"
              optionFilterProp="label"
              filterOption={(input: any, option: any) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: "100%" }}
              options={systems.map((sys) => ({
                label: sys.name,
                value: sys.name,
              }))}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Version"
            name="currentVersion"
            rules={[{ required: true, message: "Please select version!" }]}
          >
            <Select placeholder="Select Version">
              {[...Array(26)].map((_, i) => {
                const char = String.fromCharCode(65 + i);
                return (
                  <Option key={char} value={char}>
                    {char}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Read Access"
            name="docReadAccess"
            rules={[{ required: true, message: "Please select read access!" }]}
          >
            <Select placeholder="Select Access Type">
              {readAccessOptionsList.map((item, i) => (
                <Option key={i} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {formData.docReadAccess === "All Users" && (
          <Col span={12}>
            <Form.Item label="Select Allowed Users" name="docReadAccessIds">
              <Select
                mode="multiple"
                value={["All"]}
                disabled
                style={{ width: "100%" }}
              >
                <Option value="All">All</Option>
              </Select>
            </Form.Item>
          </Col>
        )}

        {formData.docReadAccess === "All in Units(S)" && (
          <Col span={12}>
            <Form.Item
              label="Select Allowed Units"
              name="docReadAccessIds"
              rules={[{ required: true, message: "Please select units!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Units"
                style={{ width: "100%" }}
                options={locationOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        {formData.docReadAccess === "All in Entites" && (
          <Col span={12}>
            <Form.Item
              label="Select Allowed Entities"
              name="docReadAccessIds"
              rules={[{ required: true, message: "Please select entities!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Entities"
                style={{ width: "100%" }}
                options={entityOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        {formData.docReadAccess === "Selected Users" && (
          <Col span={12}>
            <Form.Item
              label="Select Allowed Users"
              name="docReadAccessIds"
              rules={[{ required: true, message: "Please select users!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Users"
                style={{ width: "100%" }}
                options={userOptions}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        <Col span={12}>
          <Form.Item
            label="Distribution List"
            name="docDistributionList"
            rules={[
              { required: true, message: "Please select distribution list!" },
            ]}
          >
            <Select placeholder="Select Distribution Type">
              {distributeAccessOptionsList.map((item, i) => (
                <Option key={i} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {formData.docDistributionList === "All Users" && (
          <Col span={12}>
            <Form.Item
              label="Select Allowed Users"
              name="docDistributionListIds"
            >
              <Select
                mode="multiple"
                value={["All"]}
                disabled
                style={{ width: "100%" }}
              >
                <Option value="All">All</Option>
              </Select>
            </Form.Item>
          </Col>
        )}
        {formData.docDistributionList === "All in Units(S)" && (
          <Col span={12}>
            <Form.Item
              label="Select Allowed Units"
              name="docDistributionListIds"
              rules={[{ required: true, message: "Please select units!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Units"
                style={{ width: "100%" }}
                options={locationOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}
        {formData.docDistributionList === "All in Entities" && (
          <Col span={12}>
            <Form.Item
              label="Select Allowed Entities"
              name="docDistributionListIds"
              rules={[{ required: true, message: "Please select entities!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Entities"
                style={{ width: "100%" }}
                options={entityOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}
        {formData.docDistributionList === "Selected Users" && (
          <Col span={12}>
            <Form.Item
              label="Select Allowed Users"
              name="docDistributionListIds"
              rules={[{ required: true, message: "Please select users!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Users"
                style={{ width: "100%" }}
                options={userOptions}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}
        {formData.docDistributionList === "Respective Unit" && (
          <Col span={12}>
            <Form.Item
              label="Select Respective Unit"
              name="docDistributionListIds"
              rules={[{ required: true, message: "Please select a unit!" }]}
            >
              <Select
                placeholder="Select Unit"
                style={{ width: "100%" }}
                options={locationOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}
        {formData.docDistributionList === "Respective Entity" && (
          <Col span={12}>
            <Form.Item
              label="Select Respective Entity"
              name="docDistributionListIds"
              rules={[{ required: true, message: "Please select an entity!" }]}
            >
              <Select
                placeholder="Select Entity"
                style={{ width: "100%" }}
                options={entityOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        <Col span={12}>
          <Form.Item
            label="Create Access"
            name="createAccess"
            rules={[
              { required: true, message: "Please select create access!" },
            ]}
          >
            <Select placeholder="Who can create?">
              {["All Users", "Selected Users", "PIC", "Head"].map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {formData.createAccess === "All Users" && (
          <Col span={12}>
            <Form.Item
              label="Users with Create Access"
              name="createAccessUsers"
            >
              <Select
                value={["All"]}
                disabled
                mode="multiple"
                style={{ width: "100%" }}
              >
                <Option value="All">All</Option>
              </Select>
            </Form.Item>
          </Col>
        )}

        {formData.createAccess === "Selected Users" && (
          <Col span={12}>
            <Form.Item
              label="Select Users"
              name="createAccessUsers"
              rules={[{ required: true, message: "Please select users!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Users"
                style={{ width: "100%" }}
                options={userOptions}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        {["PIC", "Head"].includes(formData.createAccess) && (
          <>
            <Col span={12}>
              <Form.Item
                label="Select Entities"
                name="createAccessUsers"
                rules={[{ required: true, message: "Please select entities!" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select Entities"
                  style={{ width: "100%" }}
                  options={entityOption.map((ent) => ({
                    label: ent.name,
                    value: ent.id,
                  }))}
                  optionFilterProp="label"
                  filterOption={(input: any, option: any) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>
      <Col span={24}>
        <Space style={{ justifyContent: "end", width: "100%", marginTop: 24 }}>
          <Button onClick={handleDiscard}>Discard</Button>
          <Button
            type="primary"
            style={{ backgroundColor: "rgb(0, 48, 89)" }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Space>
      </Col>
    </Form>
  );
};

export default DocumentTypeFormComponent;
