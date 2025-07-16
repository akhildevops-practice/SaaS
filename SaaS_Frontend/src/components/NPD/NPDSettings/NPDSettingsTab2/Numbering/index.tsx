import React, { useEffect, useState } from "react";
import { Table, Select, Input, Button, Space, Row, Col } from "antd";
import {
  AiOutlineCloseCircle,
  AiOutlinePlusCircle,
  AiOutlineDelete,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { MdOutlineCheckCircle } from 'react-icons/md';
import styles from "./styles";

import { Tooltip } from "antd";
const { Option } = Select;

interface TableRow {
  numberingType: string;
  pre: string;
  suf: string;
}

type Props = {
  numberingData: {
    numberingType: string;
    pre: string;
    suf: string;
  };
  setNumberingData: React.Dispatch<
    React.SetStateAction<{
      numberingType: string;
      pre: string;
      suf: string;
    }>
  >;
  configurationData?: any;
};

const Numbering = ({
  numberingData,
  setNumberingData,
  configurationData,
}: Props) => {
  const classes = styles();
  const [customPrefix, setCustomPrefix] = useState<string>("");
  const [customSuffix, setCustomSuffix] = useState<string>("");
  const [showPrefixInput, setShowPrefixInput] = useState<boolean>(false);
  const [showSuffixInput, setShowSuffixInput] = useState<boolean>(false);
  const [prefixOptions, setPrefixOptions] = useState<string[]>([
    "YY",
    "MM",
    "UNIT",
    "DEPT",
  ]);
  const [suffixOptions, setSuffixOptions] = useState<string[]>([
    "YY",
    "MM",
    "UNIT",
    "DEPT",
  ]);

  useEffect(() => {
    if (configurationData && configurationData[0]?.numbering?.length > 0) {
      const apiData = configurationData[0].numbering[0];
      setNumberingData({
        numberingType: apiData?.numberingType,
        pre: apiData?.pre,
        suf: apiData?.suf,
      });
    }
  }, [configurationData]);

  const handleSave = () => {
    console.log("Saved row:", numberingData);
  };

  const handlePrefixSave = () => {
    if (customPrefix) {
      setPrefixOptions([...prefixOptions, customPrefix]);
      setNumberingData({ ...numberingData, pre: customPrefix });
      setCustomPrefix("");
      setShowPrefixInput(false);
    }
  };

  const handleSuffixSave = () => {
    if (customSuffix) {
      setSuffixOptions([...suffixOptions, customSuffix]);
      setNumberingData({ ...numberingData, suf: customSuffix });
      setCustomSuffix("");
      setShowSuffixInput(false);
    }
  };

  const handleDelete = () => {
    setNumberingData({ numberingType: "Serial", pre: "YY", suf: "YY" });
  };

  const columns = [
    {
      title: "Numbering Type",
      dataIndex: "numberingType",
      key: "numberingType",
      render: () => (
        <Select
          style={{ width: "93%" }}
          value={numberingData.numberingType}
          onChange={(value) =>
            setNumberingData({ ...numberingData, numberingType: value })
          }
        >
          <Option value="Serial">Serial</Option>
          <Option value="Manual">Manual</Option>
        </Select>
      ),
    },
    {
      title: "Prefix",
      dataIndex: "pre",
      key: "pre",
      render: () => (
        <div style={{ position: "relative" }}>
          <Select
            style={{ width: "80%" }}
            value={numberingData.pre}
            onChange={(value) =>
              setNumberingData({ ...numberingData, pre: value })
            }
          >
            {prefixOptions.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
          {showPrefixInput ? (
            <Tooltip title="Cancel">
              <Button
                icon={<AiOutlineCloseCircle />}
                onClick={() => setShowPrefixInput(!showPrefixInput)}
                style={{ marginLeft: 8 }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Add Custom Prifix">
              <Button
                icon={<AiOutlinePlusCircle />}
                onClick={() => setShowPrefixInput(!showPrefixInput)}
                style={{ marginLeft: 8 }}
              />
            </Tooltip>
          )}

          {showPrefixInput && (
            <div
              style={{
                marginTop: 8,
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                zIndex: 1,
              }}
            >
              <Row gutter={8}>
                <Col span={16}>
                  <Input
                    style={{ width: "100%" }}
                    placeholder="Custom Prefix"
                    value={customPrefix}
                    onChange={(e) => setCustomPrefix(e.target.value)}
                  />
                </Col>
                <Col span={8}>
                  <Button
                    type="primary"
                    icon={<AiOutlineCheckCircle />}
                    onClick={handlePrefixSave}
                    style={{ width: "30px" }}
                  ></Button>
                </Col>
              </Row>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Suffix",
      dataIndex: "suf",
      key: "suf",
      render: () => (
        <div style={{ position: "relative" }}>
          <Select
            style={{ width: "80%" }}
            value={numberingData.suf}
            onChange={(value) =>
              setNumberingData({ ...numberingData, suf: value })
            }
          >
            {suffixOptions.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
          {showSuffixInput ? (
            <Tooltip title="Cancel">
              <Button
                icon={<AiOutlineCloseCircle />}
                onClick={() => setShowSuffixInput(!showSuffixInput)}
                style={{ marginLeft: 8 }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Add Custom Suffix">
              <Button
                icon={<AiOutlinePlusCircle />}
                onClick={() => setShowSuffixInput(!showSuffixInput)}
                style={{ marginLeft: 8 }}
              />
            </Tooltip>
          )}

          {showSuffixInput && (
            <div
              style={{
                marginTop: 8,
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                zIndex: 1,
              }}
            >
              <Row gutter={8}>
                <Col span={16}>
                  <Input
                    placeholder="Custom Suffix"
                    value={customSuffix}
                    onChange={(e) => setCustomSuffix(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col span={8}>
                  <Button
                    type="primary"
                    icon={<AiOutlineCheckCircle />}
                    onClick={handleSuffixSave}
                    style={{ width: "30px" }}
                  ></Button>
                </Col>
              </Row>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space style={{ display: "flex", justifyContent: "center" }}>
          <Button icon={<MdOutlineCheckCircle />} onClick={handleSave}></Button>
          <Button
            type="dashed"
            icon={<AiOutlineDelete />}
            onClick={handleDelete}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }} className={classes.tableContainer}>
      <Table
        columns={columns}
        dataSource={[numberingData]}
        pagination={false}
        style={{ width: "100%" }}
        className={classes.documentTable}
      />
    </div>
  );
};

export default Numbering;
