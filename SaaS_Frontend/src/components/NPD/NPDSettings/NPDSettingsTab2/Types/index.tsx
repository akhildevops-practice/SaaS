import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Space,
  Tooltip,
  Modal,
  Table,
  Select,
} from "antd";
import {
  AiOutlinePlusCircle,
  AiOutlineInfoCircle,
  AiOutlineDelete,
  AiOutlineFileAdd,
  AiOutlineEyeInvisible,
  AiOutlineEye,
  AiOutlineMinusCircle,
  AiOutlineTrademarkCircle
} from "react-icons/ai";
import { IoMdStarOutline } from "react-icons/io";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Collapse,
} from "@material-ui/core";
import { MdExpandMore } from 'react-icons/md';
import styles from "./style";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import { MdChangeHistory } from 'react-icons/md';

const getRandomColor = (usedColors: any) => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  do {
    color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
  } while (usedColors.includes(color));
  return color;
};

type Props = {
  projectTypes?: any;
  setProjectTypes?: any;
  productTypes?: any;
  setProductTypes?: any;
  rankType?: any;
  setRankTypes?: any;
  milestoneTypes?: any;
  setMilestoneTypes?: any;
  configurationData?: any;
};

const Types = ({
  projectTypes,
  setProjectTypes,
  productTypes,
  setProductTypes,
  rankType,
  setRankTypes,
  milestoneTypes,
  setMilestoneTypes,
  configurationData,
}: Props) => {
  console.log("projectTypes", projectTypes);
  console.log("productTypes", productTypes);
  console.log("rankType", rankType);
  const classes = styles();
  const [fields, setFields] = useState([
    {
      key: 0,
      project: projectTypes || [""],
      product: productTypes || [""],
      rank: rankType || [""],
      milestone: milestoneTypes
        ? milestoneTypes.map((m: any) => ({
            value: m,
            color: getRandomColor([]),
          }))
        : [{ value: "", color: getRandomColor([]) }],
      descriptions: [""],
    },
  ]);
  const uniqueId = generateUniqueId(22);
  const [formData, setFormData] = useState({
    projects: [{ id: uniqueId, type: "", product: [], status: false, }],
    rank: [{ id: uniqueId, rank: "", description:"" }],
    milestone: [{ id: uniqueId, type: "", iconType:"" }],
  });

  const toggleRow = (item: any) => {
    const update = formData?.projects?.map((ele: any) => {
      if (ele.id === item.id) {
        return {
          ...ele,
          status: !item.status,
        };
      }
      return ele;
    });
    setFormData({
      ...formData,
      projects: update,
    });
  };

  const addProductType = (item:any, condition:any) => {
    const update = formData?.projects?.map((ele: any) => {
      if (ele.id === item.id) {
        if(condition === true){
          const payload = {
            id: uniqueId,
            type: "",
          };
          return {
            ...ele,
            product: [...ele?.product, payload],
            status :true,
          };
        }else{
          const payload = {
            id: uniqueId,
            type: "",
          };
          return {
            ...ele,
            product: [...ele?.product, payload],
          };
        }

      }
      return ele;
    });
    setFormData({
      ...formData,
      projects: update,
    });
  };

  const deleteProductType = (item: any, data: any) => {
    const update = formData?.projects?.map((ele: any) => {
      if (ele.id === item.id) {
        const updateValues = ele?.product?.filter(
          (itd: any) => itd.id !== data?.id
        );
        return {
          ...ele,
          product: updateValues,
        };
      }
      return ele;
    });
    setFormData({
      ...formData,
      projects: update,
    });
  };

  const addProjectType = () => {
    const payload = {
      id: uniqueId,
      type: "",
      product: [],
      status:false,
    };
    setFormData({
      ...formData,
      projects: [...formData?.projects, payload],
    });
  };

  const deleteProjectType = (item: any) => {
    const updateData = formData?.projects?.filter(
      (ele: any) => ele.id !== item.id
    );
    setFormData({
      ...formData,
      projects: updateData,
    });
  };

  const addValuesProductType = (item: any, data: any, value: any) => {
    const update = formData?.projects?.map((ele: any) => {
      if (ele.id === item.id) {
        const updateValue = ele.product?.map((itd: any) => {
          if (itd.id === data.id) {
            return {
              ...itd,
              type: value,
            };
          }
          return itd;
        });
        return {
          ...ele,
          product: updateValue,
        };
      }
      return ele;
    });
    setFormData({
      ...formData,
      projects: update,
    });
  };

  const addValuesProjectType = (item: any, value: any) => {
    const update = formData?.projects?.map((ele: any) => {
      if (ele.id === item.id) {
        return {
          ...ele,
          type: value,
        };
      }
      return ele;
    });
    setFormData({
      ...formData,
      projects: update,
    });
  };

  const addValuesRank = (item: any, type:any, value: any) =>{
    const update = formData?.rank?.map((ele: any) => {
      if (ele.id === item.id) {
        return {
          ...ele,
          [type]: value,
        };
      }
      return ele;
    });
    setFormData({
      ...formData,
      rank: update,
    });
  }

  const addRankType = () => {
    const payload = {
      id: uniqueId,
      rank: "",
      description:""
    };
    setFormData({
      ...formData,
      rank: [...formData?.rank, payload],
    });
  };

  const deleteRankType = (item: any) => {
    const updateData = formData?.rank?.filter(
      (ele: any) => ele.id !== item.id
    );
    setFormData({
      ...formData,
      rank: updateData,
    });
  };

  const addValuesMilestone = (item: any, type:any, value: any) =>{
    const update = formData?.milestone?.map((ele: any) => {
      if (ele.id === item.id) {
        return {
          ...ele,
          [type]: value,
        };
      }
      return ele;
    });
    setFormData({
      ...formData,
      milestone: update,
    });
  }

  const addRankMilestone = () => {
    const payload = {
      id: uniqueId,
      type: "",
      iconType:"",
    };
    setFormData({
      ...formData,
      milestone: [...formData?.milestone, payload],
    });
  };

  const deleteRankMilestone = (item: any) => {
    const updateData = formData?.milestone?.filter(
      (ele: any) => ele.id !== item.id
    );
    setFormData({
      ...formData,
      milestone: updateData,
    });
  };


  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFieldKey, setCurrentFieldKey] = useState<any>(null);
  const [rankDescriptions, setRankDescriptions] = useState<any[]>([]);

  useEffect(() => {
    if (configurationData && configurationData.length > 0) {
      const config = configurationData[0];
      // setProjectTypes(config.projectTypes || [""]);
      // setProductTypes(config.productTypes || [""]);
      // setRankTypes(config.rankType || [""]);
      // setMilestoneTypes(config.milestoneTypes || [""]);
      // setFields([
      //   {
      //     key: 0,
      //     project:
      //       config.projectTypes && config.projectTypes.length > 0
      //         ? config.projectTypes
      //         : [""],
      //     product:
      //       config.productTypes && config.productTypes.length > 0
      //         ? config.productTypes
      //         : [""],
      //     rank:
      //       config.rankType && config.rankType.length > 0
      //         ? config.rankType
      //         : [""],
      //     milestone:
      //       config.milestoneTypes && config.milestoneTypes.length > 0
      //         ? config.milestoneTypes.map((m: any) => ({
      //             value: m,
      //             color: getRandomColor([]),
      //           }))
      //         : [{ value: "", color: getRandomColor([]) }],
      //     descriptions:
      //       config.rankType && config.rankType.length > 0 ? [""] : [],
      //   },
      // ]);
      setFormData({
        ...formData,
        projects: config.projectTypes,
        rank: config.rankType,
      })
    } else {
     setFormData({
      ...formData,
      projects: [{ id: uniqueId, type: "", product: [], status: false, }],
      rank: [{ id: uniqueId, rank: "", description:"" }],
     })
      // setFields([
      //   {
      //     key: 0,
      //     project: [""],
      //     product: [""],
      //     rank: [""],
      //     milestone: [{ value: "", color: getRandomColor([]) }],
      //     descriptions: [],
      //   },
      // ]);
    }
  }, [configurationData]);

  useEffect(() =>{
    setProjectTypes(formData?.projects);
    setRankTypes(formData?.rank);
  },[formData])

  const addField = (key: any, field: any) => {
    setFields(
      fields.map((f: any) =>
        f.key === key
          ? {
              ...f,
              [field]:
                field === "milestone"
                  ? [
                      ...f[field],
                      {
                        value: "",
                        color: getRandomColor(
                          f[field].map((milestone: any) => milestone.color)
                        ),
                      },
                    ]
                  : [...f[field], ""],
              descriptions:
                field === "rank" ? [...f.descriptions, ""] : f.descriptions,
            }
          : f
      )
    );
  };

  const deleteField = (field: string, index: number) => {
    setFields((prevFields) => {
      // Create a deep copy of the previous state
      const newFields = prevFields.map((f) => ({ ...f }));

      // Find the specific field to update and remove the item at the index
      newFields.forEach((f: any) => {
        if (f[field]) {
          f[field].splice(index, 1);
        }

        // If dealing with 'rank' or 'milestone', also update descriptions
        if (field === "rank" || field === "milestone") {
          f.descriptions.splice(index, 1);
        }
      });

      return newFields;
    });
  };

  const handleChange = (key: any, field: any, index: any, value: any) => {
    const updatedFields = fields.map((f: any) =>
      f.key === key
        ? {
            ...f,
            [field]: f[field].map((item: any, i: any) =>
              i === index
                ? field === "milestone"
                  ? { ...item, value }
                  : value
                : item
            ),
          }
        : f
    );
    setFields(updatedFields);
    if (field === "project")
      setProjectTypes(updatedFields.find((f) => f.key === key)?.project || []);
    if (field === "product")
      setProductTypes(updatedFields.find((f) => f.key === key)?.product || []);
    if (field === "rank")
      setRankTypes(updatedFields.find((f) => f.key === key)?.rank || []);
    if (field === "milestone")
      setMilestoneTypes(
        updatedFields
          .find((f) => f.key === key)
          ?.milestone.map((m: any) => m.value) || []
      );
  };

  const showModal = () => {
    // if (field) {
    //   setCurrentFieldKey(fieldKey);
    //   setRankDescriptions(
    //     field.rank.map((rank: any, index: any) => ({
    //       key: index,
    //       rank,
    //       description: field.descriptions[index] || "",
    //     }))
    //   );
      setIsModalVisible(true);
    // }
  };

  const handleDescriptionChange = (key: number, description: string) => {
    setRankDescriptions(
      rankDescriptions.map((item) =>
        item.key === key ? { ...item, description } : item
      )
    );
  };

  const handleOk = () => {
    if (currentFieldKey !== null) {
      setFields(
        fields.map((f) =>
          f.key === currentFieldKey
            ? {
                ...f,
                descriptions: rankDescriptions.map((item) => item.description),
              }
            : f
        )
      );
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string, record: any) => (
        <Input
          value={text}
          onChange={(e) => addValuesRank(record, 'description', e.target.value)}
          placeholder="Enter description"
        />
      ),
    },
  ];

  const suppliersOption:any = [
    {
      value: 'star',
      label: (
        <span>
          <IoMdStarOutline />
        </span>
      ),
    },
    {
      value: 'trademark',
      label: (
        <span>
          <AiOutlineTrademarkCircle />
        </span>
      ),
    },
    {
      value: 'triangle',
      label: (
        <span>
          <MdChangeHistory />
        </span>
      ),
    },
  ];

  console.log("formData",formData?.milestone)
  return (
    <>
      <Form layout="vertical" style={{ width: "95%", paddingLeft: "40px" }}>
        {/* {fields.map((field) => (
          <React.Fragment key={field.key}> */}
            <Accordion
              style={{ marginTop: "20px", padding: "0px 10px" }}
              className={classes.mainContainer}
            >
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography className={classes.heading}>
                  Project Types
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.container}>
                {formData?.projects?.map((ele: any) => {
                  return (
                    <div style={{marginLeft:"50px"}}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <Tooltip
                          title={ele?.status ? "Hide Product" : "Show Product"}
                          color="purple"
                        >
                          <Button
                            type="dashed"
                            icon={
                              ele.status ? (
                                <AiOutlineEyeInvisible />
                              ) : (
                                <AiOutlineEye />
                              )
                            }
                            onClick={() => toggleRow(ele)}
                            style={{ marginBottom: "10px" }}
                          />
                        </Tooltip>
                        <Input
                          value={ele?.type}
                          onChange={(e) =>
                            addValuesProjectType(ele, e.target.value)
                          }
                          placeholder="Enter Project"
                          style={{ marginBottom: "10px" ,  width: "350px" }}
                        />
                        <Tooltip title="Add Project" color="purple">
                          <Button
                            type="dashed"
                            icon={<AiOutlineFileAdd />}
                            onClick={() => addProjectType()}
                            style={{ marginBottom: "10px" }}
                          ></Button>
                        </Tooltip>
                        {ele?.product?.length === 0 ? (
                          <Tooltip title="Add Product" color="purple">
                            <Button
                              type="dashed"
                              icon={<AiOutlinePlusCircle />}
                              onClick={() => addProductType(ele, true)}
                              style={{ marginBottom: "10px" }}
                            ></Button>
                          </Tooltip>
                        ) : (
                          ""
                        )}
                        <Tooltip title="Delete Project" color="magenta">
                          <Button
                            type="dashed"
                            icon={<AiOutlineMinusCircle />}
                            onClick={() => deleteProjectType(ele)}
                            style={{ marginBottom: "10px" }}
                          />
                        </Tooltip>
                      </div>
                      <Collapse in={ele.status} timeout="auto" unmountOnExit>
                        {ele?.product?.map((sub: any, subIndex: any) => (
                            <div
                              key={sub?.id}
                              style={{
                                display: "flex",
                                gap: "10px",
                                paddingLeft: "43px",
                                marginBottom: "10px",
                                alignItems: "center",
                                // marginLeft: "50px",
                              }}
                            >
                              <Input
                                value={sub?.type}
                                onChange={(e) =>
                                  addValuesProductType(ele, sub, e.target.value)
                                }
                                placeholder="Enter Product"
                                style={{ width: "300px" }}
                              />
                              <Button
                                icon={<AiOutlineDelete />}
                                onClick={() => deleteProductType(ele, sub)}
                              />
                              {subIndex === 0 ? (
                                <Tooltip title="Add Product" color="purple">
                                  <Button
                                    type="dashed"
                                    icon={<AiOutlinePlusCircle />}
                                    onClick={() => addProductType(ele, false)}
                                    // style={{ marginBottom: "10px" }}
                                  ></Button>
                                </Tooltip>
                              ) : (
                                ""
                              )}
                            </div>
                          ))}
                      </Collapse>
                    </div>
                  );
                })}
                {/* <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontSize: "14px" }}>
                          Project{" "}
                          <Tooltip title="Project Information">
                            <AiOutlineInfoCircle />
                          </Tooltip>
                        </span>
                      }
                    >
                      {field.project.map((_: any, index: any) => (
                        <Space
                          key={index}
                          style={{ display: "flex", marginBottom: 8 }}
                        >
                          <Input
                            value={field.project[index]}
                            onChange={(e) =>
                              handleChange(
                                field.key,
                                "project",
                                index,
                                e.target.value
                              )
                            }
                            style={{ width: "25vw" }}
                          />
                          {field.project.length > 1 && (
                            <Button
                              icon={<AiOutlineDelete />}
                              onClick={() => deleteField("project", index)}
                            />
                          )}
                          {index === 0 ?(
                            <Tooltip title={"Add More Project Types"}>
                            <Button
                            type="dashed"
                            icon={<AiOutlinePlusCircle />}
                            onClick={() => addField(field.key, "project")}
                          />
                          </Tooltip>
                          ) :""}
                        </Space>
                      ))}
                    </Form.Item>
                  </Col>
                </Row> */}
              </AccordionDetails>
            </Accordion>

            {/* <Accordion
              style={{ marginTop: "20px", padding: "0px 10px" }}
              className={classes.mainContainer}
            >
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography className={classes.heading}>
                  Product Types
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.container}>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontSize: "14px" }}>
                          Product{" "}
                          <Tooltip title="Product Information">
                            <AiOutlineInfoCircle />
                          </Tooltip>
                        </span>
                      }
                    >
                      {field.product.map((_: any, index: any) => (
                        <Space
                          key={index}
                          style={{ display: "flex", marginBottom: 8 }}
                        >
                          <Input
                            value={field.product[index]}
                            onChange={(e) =>
                              handleChange(
                                field.key,
                                "product",
                                index,
                                e.target.value
                              )
                            }
                            style={{ width: "25vw" }}
                          />
                          <Button
                            type="dashed"
                            icon={<AiOutlinePlusCircle />}
                            onClick={() => addField(field.key, "product")}
                          />
                          {field.product.length > 1 && (
                            <Button
                              icon={<AiOutlineDelete />}
                              onClick={() => deleteField("product", index)}
                            />
                          )}
                        </Space>
                      ))}
                    </Form.Item>
                  </Col>
                </Row>
              </AccordionDetails>
            </Accordion> */}

            <Accordion
              style={{ marginTop: "20px", padding: "0px 10px" }}
              className={classes.mainContainer}
            >
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography className={classes.heading}>ESC Rank</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.container}>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontSize: "14px" }}>
                          ESC Rank{" "}
                          <Tooltip title="Rank Information">
                            <AiOutlineInfoCircle
                              onClick={() => showModal()}
                            />
                          </Tooltip>
                        </span>
                      }
                    >
                      {formData?.rank?.map((ele: any, index: any) => (
                        <Space
                          key={index}
                          style={{ display: "flex", marginBottom: 8 }}
                        >
                          <Input
                            value={ele?.rank}
                            onChange={(e) =>
                              addValuesRank(
                                ele,
                                'rank',
                                e.target.value
                              )
                            }
                            style={{ width: "25vw" }}
                          />
                          {formData?.rank?.length > 1 && (
                            <Button
                              icon={<AiOutlineDelete />}
                              onClick={() => deleteRankType(ele)}
                            />
                          )}
                          {index === 0 ? 
                            <Button
                            type="dashed"
                            icon={<AiOutlinePlusCircle />}
                            onClick={() => addRankType()}
                            />
                           :""}
                        </Space>
                      ))}
                    </Form.Item>
                  </Col>
                </Row>
              </AccordionDetails>
            </Accordion>

            <Accordion
              style={{ marginTop: "20px", padding: "0px 10px" }}
              className={classes.mainContainer}
            >
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography className={classes.heading}>
                  Milestone Settings
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.container}>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontSize: "14px" }}>
                          Milestone Category{" "}
                          <Tooltip title="Milestone Information">
                            <AiOutlineInfoCircle />
                          </Tooltip>
                        </span>
                      }
                    >
                      {formData?.milestone?.map((ele: any, index: any) => (
                        <Space
                          key={index}
                          style={{
                            display: "flex",
                            marginBottom: 8,
                            alignItems: "center",
                          }}
                        >
                          <Input
                            value={ele.type}
                            onChange={(e) =>
                              addValuesMilestone(
                                ele,
                                "type",
                                e.target.value
                              )
                            }
                            style={{ width: "25vw" }}
                          />

                <Select
                value={ele.iconType}
                style={{ width: "60px" ,color:"black"}}
                suffixIcon={null}
                className={classes.iconSelect}
                onChange={(e: any) => {
                  addValuesMilestone(
                    ele,
                    "iconType",
                    e
                  )
                }}
                placeholder="Icon"
                optionFilterProp="children"
                options={suppliersOption}
              />
                          {formData?.milestone?.length > 1 && (
                            <Button
                              icon={<AiOutlineDelete />}
                              onClick={() => deleteRankMilestone(ele)}
                            />
                          )}
                           {index === 0 ?    
                          <Button
                            type="dashed"
                            icon={<AiOutlinePlusCircle />}
                            onClick={() => addRankMilestone()}
                          />
                          :""}
                        </Space>
                      ))}
                    </Form.Item>
                  </Col>
                </Row>
              </AccordionDetails>
            </Accordion>

          {/* </React.Fragment>
        ))} */}
      </Form>

      <Modal
        title="Rank Descriptions"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Table
          dataSource={formData?.rank}
          columns={columns}
          pagination={false}
          rowKey="key"
        />
      </Modal>
    </>
  );
};

export default Types;
