import React, { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";

import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  Divider,
  TextField,
  IconButton,
} from "@material-ui/core";

import useStyles from "./styles";
import ConfirmDialog from "components/ConfirmDialog";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import Table from "antd/es/table";
import axios from "apis/axios.global";
import { CgAdd, CgClose } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { defectTypeData, orgFormData } from "recoil/atom";

import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";

import { useSnackbar } from "notistack";
import {
  Col,
  Form,
  Input,
  Modal,
  Pagination,
  PaginationProps,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
} from "antd";

import getAppUrl from "utils/getAppUrl";

import checkRoles from "utils/checkRoles";

const defaultFormData = {
  defectType: "",
  createdBy: "",
  organizationId: "",
};
const DefectSettings: React.FC = () => {
  const isMR = checkRoles("MR");
  const [modalVisible, setModalVisible] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedData, setSelectedData] = useState<any>(null);
  const classes = useStyles();
  const [defects, setDefects] = useState<string[]>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [data, setData] = useState<any>([]);
  const [formData, setFormData] = useRecoilState(defectTypeData);
  const [addfocusArea, setFocusArea] = useState<string>();
  const [open, setOpen] = useState(false);
  const [deleteProf, setdeleteProf] = useState<any>();

  const [locationOptions, setLocationOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const isMCOE = checkRoles("ORG-ADMIN") && userDetails?.location?.id;
  const [selectedLocation, setSelectedLocation] = useState<any>({
    id: userDetails?.locationId,
    locationName: userDetails?.location?.locationName,
  });
  const orgData = useRecoilValue(orgFormData);
  const realmName = getAppUrl();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [count, setCount] = useState<number>(0);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;
  useEffect(() => {
    getLocationOptions();
    getProductOptions();
    getData();
  }, []);
  useEffect(() => {
    getData();
  }, [page, limit]);

  useEffect(() => {
    getProductOptions();
  }, [selectedLocation]);
  useEffect(() => {
    if (selectedData) {
      setFormData({
        defectType: selectedData?.defectType,
        productId: selectedData?.productId,
        locationId: selectedData?.locationId,
        createdBy: selectedData?.createdBy,
      });
    } else {
      setFormData({
        defectType: [],
        productId: "",
        locationId: userDetails?.location?.id,
      });
    }
  }, [selectedData]);
  const handlePagination = (page: any, pageSize: any) => {
    setPage(page);
    setLimit(pageSize);
    // const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&entityId=${deptId}&page=${page}&limit=${limit}`;
    getData();
  };
  const showTotal: PaginationProps["showTotal"] = (total: any) =>
    `Total ${total} items`;

  const getData = async () => {
    setIsLoading(true);
    try {
      let res = await axios.get(
        `/api/cara/getCaraDefects?page=${page}&limit=${limit}&organizationId=${userDetails?.organizationId}`
      );
      if (res?.data) {
        setCount(res?.data?.count);

        setData(res?.data?.data);

        setIsLoading(false);
      } else {
        setFormData([defaultFormData]);
        setIsLoading(false);
      }
    } catch (err) {
      // enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };
  const getLocationOptions = async () => {
    try {
      const res = await axios.get(
        `/api/mrm/getLocationsForOrg/${userDetails?.organization?.realmName}`
      );

      if (res?.data) {
        const formattedOptions = res?.data?.map((location: any) => ({
          value: location.id, // 👈 Use location ID as value
          label: location.locationName, // 👈 Use location name as label
        }));

        setLocationOptions(formattedOptions);
      }
    } catch (err) {
      // console.error("Error fetching locations:", err);
    }
  };

  const getProductOptions = async () => {
    try {
      // console.log("selecte", selectedLocation);
      const locid = selectedLocation
        ? selectedLocation?.id
        : userDetails?.location?.id;

      const res = await axios.get(`/api/cara/getProductsForLocation/${locid}`);

      if (res?.data) {
        const formattedOptions = res.data.map((product: any) => ({
          value: product.id,
          label: product.entityName,
        }));

        setProductOptions(formattedOptions);
      }
    } catch (err) {
      // console.error("Error fetching products:", err);
    }
  };

  const handleLinkClick = (record: any) => {
    const selected = data.find(
      (item: any) => item.productId === record?.productId
    );
    // console.log("selected in handlelinkclick", selected);
    setSelectedData(selected);
    setDefects(selected?.defectType);

    setModalVisible(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Product",
      key: "product",
      width: 150,
      render: (record: any) => (
        <div
          style={{ textDecorationLine: "underline", cursor: "pointer" }}
          className={classes.clickableField}
          onClick={() => handleLinkClick(record)}
        >
          {record?.productId?.label}
        </div>
      ),
    },
    {
      title: "Unit",
      key: "locationDetails",
      width: 150,
      render: (record: any) => (
        <div>{record?.locationDetails?.locationName}</div>
      ),
    },
    {
      title: "Defect Types",
      key: "defectType",
      width: 150,
      render: (record: any) => (
        <div>
          {Array.isArray(record?.defectType)
            ? record.defectType.join(", ")
            : record?.defectType}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: any, record: any) => {
        const canEditOrDelete =
          isMCOE ||
          (isMR &&
            (userDetails?.additionalUnits?.length > 0
              ? userDetails?.additionalUnits?.includes(record?.locationId)
              : record?.locationId === userDetails.location?.id));

        return canEditOrDelete ? (
          <IconButton
            onClick={() => handleOpen(record)}
            style={{ padding: "10px" }}
          >
            <CustomDeleteICon width={20} height={20} />
          </IconButton>
        ) : null;
      },
    },
  ];

  const handleOpen = (val: any) => {
    setOpen(true);
    // console.log("setting delete orof", val);
    setdeleteProf(val);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleAddDefect = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDefects([...defects, ""]);
  };
  const validateDefects = () => {
    const trimmedDefects = defects.map((defect) => defect.trim());

    const hasEmpty = trimmedDefects.some((defect) => !defect);
    if (hasEmpty) {
      enqueueSnackbar("Please fill in all defect fields before submitting.", {
        variant: "error",
      });
      return false;
    }

    const lowerCaseDefects = trimmedDefects.map((d) => d.toLowerCase());
    const uniqueDefects = new Set(lowerCaseDefects);

    if (uniqueDefects.size !== trimmedDefects.length) {
      enqueueSnackbar("Duplicate defect types are not allowed.", {
        variant: "error",
      });
      return false;
    }

    return true;
  };

  // Function to handle removing a text field
  const handleRemoveDefect = (index: number) => {
    setDefects(defects.filter((_, i) => i !== index));
  };

  // Function to update a defect's value
  const handleDefectChange = (index: number, value: string) => {
    if (!value.trim()) {
      // Show an error or warning
      enqueueSnackbar("Defect cannot be empty", { variant: "warning" });
      return;
    }

    const updatedDefects = [...defects];
    updatedDefects[index] = value;
    setDefects(updatedDefects);
  };

  const handleDelete = async () => {
    try {
      // console.log("deleteprof", deleteProf);
      await axios.delete(`/api/cara/deleteCaraDefect/${deleteProf._id}`);
      enqueueSnackbar(`Deleted Defects successfully`, { variant: "success" });
      getData();
      handleClose();
    } catch (error) {
      // Error handling
      // console.log("Error deleting Defects for product", error);
    }
  };

  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  const handleMouseEnter = (record: any) => {
    setHoveredRow(record.id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  const handleModalCancel = () => {
    setSelectedData(null);
    setModalVisible(false);
    setDefects([]);
    getData();
  };

  // console.log("selectedData", selectedData);
  const handleSubmit = async () => {
    if (!validateDefects()) return;
    if (!!selectedData) {
      // Update existing audit type
      // console.log("updating", selectedData);
      try {
        if (formData?.productId && formData?.locationId) {
          if (defects?.length > 0) {
            const response = await axios.put(
              `/api/cara/updateCaraDefect/${selectedData?._id}`,
              {
                updatedBy: userDetails.id,
                locationId: formData?.locationId,
                productId: formData?.productId,
                defectType: defects,
                organizationId: organizationId,
              }
            );
            setSelectedData(null);
            setDefects([]);
            setModalVisible(false);
            getData();
            if (response?.data?.status === 409) {
              alert("Defects exists for the same product and unit");
              setModalVisible(true);
            } else if (response.status === 200 || response.status === 201) {
              enqueueSnackbar("Defects updated successfully", {
                variant: "success",
              });
            }
          } else {
            enqueueSnackbar("Please enter atleast one defect type", {
              variant: "error",
            });
          }
        } else {
          enqueueSnackbar("Please enter mandatory fields", {
            variant: "error",
          });
        }
      } catch (err) {
        console.log("Error updating defects", err);
      }
    } else {
      try {
        if (formData?.productId && formData?.locationId) {
          if (defects?.length > 0) {
            const response = await axios.post(`/api/cara/createCaraDefect`, {
              createdBy: userDetails.id,
              locationId: formData?.locationId,
              productId: formData?.productId,
              defectType: defects,
              organizationId: organizationId,
            });
            setFormData(defaultFormData);
            // setSelectedData(null);
            setModalVisible(false);
            getData();
            setDefects([]);
            // console.log("response", response);
            if (response?.data?.status === 409) {
              alert("Defects exists for the same product and unit");
              setModalVisible(true);
            } else if (response.status === 200 || response.status === 201) {
              enqueueSnackbar("Defects added successfully", {
                variant: "success",
              });
            }
          } else {
            enqueueSnackbar("Please add atleast one defect type", {
              variant: "error",
            });
          }
        } else {
          enqueueSnackbar("Please enter mandatory fields", {
            variant: "error",
          });
        }
      } catch (err) {
        // console.log("response", response);
        // console.log("Error creating Defect types", err);
      }
    }
  };
  // console.log("locationOptions", locationOptions, productOptions);
  return (
    <>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />
      <Modal
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={false}
        width={700}
      >
        <div>
          <Typography variant="h6">
            {selectedData
              ? "Edit Defect Types of Product"
              : "Add Defect Types for product"}
          </Typography>
          <Divider />
          <Form layout="horizontal" style={{ marginTop: "20px" }}>
            {/* Unit Selection */}
            <Form.Item
              label="Unit*"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              style={{ color: "#0e0a42", fontWeight: "bold" }}
            >
              <Select
                showSearch
                placeholder="Select Unit"
                optionFilterProp="children"
                filterOption={(input, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: "100%", maxWidth: "300px" }}
                size="large"
                value={formData?.locationId}
                options={locationOptions || []}
                onChange={(e, value) => {
                  setFormData({ ...formData, locationId: value?.value });
                  setSelectedLocation({
                    id: value.value,
                    locationName: value.label,
                  });
                }}
              />
            </Form.Item>

            {/* Product Selection */}
            <Form.Item
              label="Product*"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              style={{ color: "#0e0a42", fontWeight: "bold" }}
            >
              <Select
                showSearch
                placeholder="Select Product"
                optionFilterProp="children"
                filterOption={(input, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: "100%", maxWidth: "300px" }}
                size="large"
                value={formData?.productId}
                options={productOptions || []}
                onChange={(e, value) =>
                  setFormData({ ...formData, productId: value })
                }
              />
            </Form.Item>
            <Form.Item
              label="Defect Types*"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              style={{ color: "#0e0a42", fontWeight: "bold" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {(defects?.length === 0 ? [""] : defects).map(
                  (defect, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        width: "100%",
                        maxWidth: "300px",
                      }}
                    >
                      <Input
                        value={defect}
                        onChange={(e) =>
                          handleDefectChange(index, e.target.value)
                        }
                        placeholder="Enter defect type"
                        style={{ flex: 1 }}
                      />
                      {defects.length > 1 && (
                        <CgClose
                          onClick={() => handleRemoveDefect(index)}
                          style={{
                            fontSize: "16px",
                            color: "#003059",
                            cursor: "pointer",
                            paddingLeft: "4px",
                          }}
                        />
                      )}
                    </div>
                  )
                )}

                {/* Add new defect button */}
                <Button
                  variant="outlined"
                  onClick={handleAddDefect}
                  style={{
                    color: "#003059",
                    backgroundColor: "white",
                    borderColor: "#003059",
                    borderWidth: "1px",
                    padding: "6px 4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    borderRadius: "8px",
                  }}
                >
                  Add
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                    }}
                  >
                    <CgAdd style={{ fontSize: "16px", color: "#003059" }} />
                  </div>
                </Button>
              </Space>
            </Form.Item>

            <Divider />
            <Row justify="center" gutter={12} style={{ marginTop: 16 }}>
              <Col>
                <Button
                  onClick={handleModalCancel}
                  style={{ borderColor: "#ccc" }}
                >
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button
                  style={{ backgroundColor: "#0e0a42", color: "white" }}
                  onClick={() => handleSubmit()}
                >
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>

          {/* )} */}
        </div>
      </Modal>
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "end",
            paddingBottom: "10px",
            paddingTop: "10px",
            alignItems: "center",
          }}
        >
          <Button
            onClick={() => {
              setModalVisible(true);
              setFormData({ deviationType: "", description: "" });
            }}
            style={{ backgroundColor: "#0E497A", color: "#ffffff" }}
          >
            Add
          </Button>
        </div>

        {/* <Button
          style={{
            border: "2px solid black",
            position: "absolute",
            top: "70px",
            right: "100px",
          }}
          onClick={() => {
            navigate("/cara/settings/KPI");
          }}
        >
          KPI
        </Button> */}

        {data && Array.isArray(data) && data.length !== 0 ? (
          <div
            data-testid="custom-table"
            // className={classes.tableContainerScrollable}
          >
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              rowKey={"id"}
              // bordered
              className={classes.tableContainer}
              // rowClassName={rowClassName}
              onRow={(record) => ({
                onMouseEnter: () => handleMouseEnter(record),
                onMouseLeave: handleMouseLeave,
              })}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <Pagination
                size="small"
                current={page}
                pageSize={limit}
                total={count}
                showTotal={showTotal}
                showSizeChanger
                showQuickJumper
                onChange={(page, pageSize) => {
                  handlePagination(page, pageSize);
                }}
              />
            </div>
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
              Let’s begin by adding a Defects for product
            </Typography>
          </>
        )}
      </>

      {isLoading && (
        <Box
          marginY="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress />
        </Box>
      )}
    </>
  );
};

export default DefectSettings;
