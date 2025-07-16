import React, { useEffect, useState } from "react";
import styles from "./styles";
import { Col, Form, Input, Row, Tabs } from "antd";
import TabPane from "antd/es/tabs/TabPane";
import TextArea from "antd/es/input/TextArea";

type props = {
  setIsNotFormData?: any;
  isNotFormData?: any;
  formData?: any;
  setformdata?: any;
  readMode?: any;
};
const IsNot = ({
  setIsNotFormData,
  isNotFormData,
  formData,
  readMode,
  setformdata,
}: props) => {
  const classes = styles();

  // console.log("formData5555", formData);

  const handleInputChange = (
    category: string,
    question: string,
    value: string
  ) => {
    setIsNotFormData((prev: any) => {
      const updatedCategory = prev[category].filter(
        (item: any) => item.question !== question
      );
      return {
        ...prev,
        [category]: [...updatedCategory, { question, answer: value }],
      };
    });
  };

  return (
    <div style={{ width: "100%" }}>
      <div className={classes.IsNotContainer}>
        <div className={classes.textContainer}>
          <p className={classes.IsNotText}>Is-Is Not</p>
          {/* <p className={classes.text}>
            {" "}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa
            mi.
          </p> */}
        </div>
      </div>
      <div className={classes.tabContainer}>
        <Tabs
          defaultActiveKey="1"
          className={classes.tabsWrapper}
          // tabPosition="left"
        >
          <TabPane tab="Who" key="1" className={classes.tabPane}>
            <div className={classes.parentdiv}>
              {/* <p
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  letterSpacing: ".8px",
                  lineHeight: 0.61,
                }}
              >
                Who
              </p> */}
              <div className={classes.is_isNot}>
                <p className={classes.p}>Is</p>
                <p className={classes.p}>Is Not</p>
              </div>
              <Form layout="vertical" className={classes.formContainer}>
                <Row gutter={24} style={{}}>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="Who is affected by the problem"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.who?.find(
                            (item: any) =>
                              item.question === "Who is affected by the problem"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "who",
                            "Who is affected by the problem",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="Who is not affected by the problem?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.who?.find(
                            (item: any) =>
                              item.question ===
                              "Who is not affected by the problem?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "who",
                            "Who is not affected by the problem?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="Who first observed the problem"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.who?.find(
                            (item: any) =>
                              item.question === "Who first observed the problem"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "who",
                            "Who first observed the problem",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="Who did not find the problem?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.who?.find(
                            (item: any) =>
                              item.question === "Who did not find the problem?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "who",
                            "Who did not find the problem?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  {/* First Column */}
                  <Col span={12}>
                    <Form.Item
                      label="To whom the problem was reported"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.who?.find(
                            (item: any) =>
                              item.question ===
                              "To whom the problem was reported"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "who",
                            "To whom the problem was reported",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </TabPane>
          <TabPane tab="What" key="2" className={classes.tabPane}>
            <div className={classes.parentdiv}>
              {/* <p
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  letterSpacing: ".8px",
                  lineHeight: 0.61,
                }}
              >
                What
              </p> */}
              <div className={classes.is_isNot}>
                <p>Is</p>
                <p>Is Not</p>
              </div>

              <Form layout="vertical" className={classes.formContainer}>
                <Row gutter={24}>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="What type of problem is it?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.what?.find(
                            (item: any) =>
                              item.question === "What type of problem is it?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "what",
                            "What type of problem is it?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="What does not have the problem?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.what?.find(
                            (item: any) =>
                              item.question ===
                              "What does not have the problem?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "what",
                            "What does not have the problem?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="What has the problem? (part id, lot etc)"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.what?.find(
                            (item: any) =>
                              item.question ===
                              "What has the problem? (part id, lot etc)"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "what",
                            "What has the problem? (part id, lot etc)",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="What could be happening but is not?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.what?.find(
                            (item: any) =>
                              item.question ===
                              "What could be happening but is not?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "what",
                            "What could be happening but is not?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="What is happening with the process containment?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.what?.find(
                            (item: any) =>
                              item.question ===
                              "What is happening with the process containment?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "what",
                            "What is happening with the process containment?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="What could be the problem but is not?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.what?.find(
                            (item: any) =>
                              item.question ===
                              "What could be the problem but is not?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "what",
                            "What could be the problem but is not?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="Do we have physical evidence of the problem?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.what?.find(
                            (item: any) =>
                              item.question ===
                              "Do we have physical evidence of the problem?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "what",
                            "Do we have physical evidence of the problem?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </TabPane>
          <TabPane tab="Why" key="3" className={classes.tabPane}>
            <div className={classes.parentdiv}>
              {/* <p
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  letterSpacing: ".8px",
                  lineHeight: 0.61,
                }}
              >
                Why
              </p> */}
              <div className={classes.is_isNot}>
                <p>Is</p>
                <p>Is Not</p>
              </div>
              <Form layout="vertical" className={classes.formContainer}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="Why is this a problem (degraded performance)?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.why?.find(
                            (item: any) =>
                              item.question ===
                              "Why is this a problem (degraded performance)?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "why",
                            "Why is this a problem (degraded performance)?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="Why is it not a problem?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.why?.find(
                            (item: any) =>
                              item.question === "Why is it not a problem?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "why",
                            "Why is it not a problem?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="Is the process stable?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.why?.find(
                            (item: any) =>
                              item.question === "Is the process stable?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "why",
                            "Is the process stable?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </TabPane>
          <TabPane tab="Where" key="4" className={classes.tabPane}>
            <div className={classes.parentdiv}>
              {/* <p
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  letterSpacing: ".8px",
                  lineHeight: 0.61,
                }}
              >
                Where
              </p> */}
              <div className={classes.is_isNot}>
                <p>Is</p>
                <p>Is Not</p>
              </div>
              <Form layout="vertical" className={classes.formContainer}>
                <Row gutter={24}>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="Where was the problem observed?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.where?.find(
                            (item: any) =>
                              item.question ===
                              "Where was the problem observed?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "where",
                            "Where was the problem observed?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="Where could the problem be located but is not?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.where?.find(
                            (item: any) =>
                              item.question ===
                              "Where could the problem be located but is not?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "where",
                            "Where could the problem be located but is not?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="Where does the problem occur?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.where?.find(
                            (item: any) =>
                              item.question === "Where does the problem occur?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "where",
                            "Where does the problem occur?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Where else could the problem be located but is not?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.where?.find(
                            (item: any) =>
                              item.question ===
                              "Where else could the problem be located but is not?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "where",
                            "Where else could the problem be located but is not?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </TabPane>
          <TabPane tab="When" key="5" className={classes.tabPane}>
            <div className={classes.parentdiv}>
              {/* <p
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  letterSpacing: ".8px",
                  lineHeight: 0.61,
                }}
              >
                When
              </p> */}
              <div className={classes.is_isNot}>
                <p>Is</p>
                <p>Is Not</p>
              </div>
              <Form layout="vertical" className={classes.formContainer}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="When was the problem first noticed?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.when?.find(
                            (item: any) =>
                              item.question ===
                              "When was the problem first noticed?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "when",
                            "When was the problem first noticed?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="When could the problem have been noticed but was not?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.when?.find(
                            (item: any) =>
                              item.question ===
                              "When could the problem have been noticed but was not?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "when",
                            "When could the problem have been noticed but was not?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="When has it been noticed since?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.when?.find(
                            (item: any) =>
                              item.question ===
                              "When has it been noticed since?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "when",
                            "When has it been noticed since?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </TabPane>
          <TabPane tab="How Much" key="6" className={classes.tabPane}>
            <div className={classes.parentdiv}>
              {/* <p
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  letterSpacing: ".8px",
                  lineHeight: 0.61,
                }}
              >
                How Much
              </p> */}
              <div className={classes.is_isNot}>
                <p>Is</p>
                <p>Is Not</p>
              </div>
              <Form layout="vertical" className={classes.formContainer}>
                <Row gutter={24}>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="Quantity of problem"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.howMuch?.find(
                            (item: any) =>
                              item.question === "Quantity of problem"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "howMuch",
                            "Quantity of problem",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="How many could have the problem but don't?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.howMuch?.find(
                            (item: any) =>
                              item.question ===
                              "How many could have the problem but don't?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "howMuch",
                            "How many could have the problem but don't?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="How much is the problem costing in money, people & time?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.howMuch?.find(
                            (item: any) =>
                              item.question ===
                              "How much is the problem costing in money, people & time?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "howMuch",
                            "How much is the problem costing in money, people & time?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="How big could the problem be but is not?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.howMuch?.find(
                            (item: any) =>
                              item.question ===
                              "How big could the problem be but is not?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "howMuch",
                            "How big could the problem be but is not?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </TabPane>
          <TabPane tab="How Many" key="7" className={classes.tabPane}>
            <div className={classes.parentdiv}>
              {/* <p
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  letterSpacing: ".8px",
                  lineHeight: 0.61,
                }}
              >
                How Many
              </p> */}
              <div className={classes.is_isNot}>
                <p>Is</p>
                <p>Is Not</p>
              </div>
              <Form layout="vertical" className={classes.formContainer}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="What is the trend? (continuous / random / cyclical)?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.howMany?.find(
                            (item: any) =>
                              item.question ===
                              "What is the trend? (continuous / random / cyclical)?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "howMany",
                            "What is the trend? (continuous / random / cyclical)?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      label="What could the trend be but is not?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.howMany?.find(
                            (item: any) =>
                              item.question ===
                              "What could the trend be but is not?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "howMany",
                            "What could the trend be but is not?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="Has the problem occurred previously?"
                      className={classes.form}
                    >
                      <TextArea
                        autoSize={{ minRows: 1 }}
                        className={classes.input}
                        value={
                          isNotFormData?.howMany?.find(
                            (item: any) =>
                              item.question ===
                              "Has the problem occurred previously?"
                          )?.answer || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "howMany",
                            "Has the problem occurred previously?",
                            e.target.value
                          )
                        }
                        disabled={
                          readMode ||
                          formData?.status === "Open" ||
                          formData?.status === "Outcome_In_Progress" ||
                          formData?.status === "Draft" ||
                          formData?.status === "Closed" ||
                          formData?.status === "Rejected" ||
                          formData?.status === ""
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default IsNot;
