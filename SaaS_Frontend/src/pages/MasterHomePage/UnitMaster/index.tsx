import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Typography,
  IconButton,
  Grid,
  Tooltip,
  useMediaQuery,
} from "@material-ui/core";
import useStyles from "./styles";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import { API_LINK } from "config";
import { saveAs } from "file-saver";
import { MdInbox } from 'react-icons/md';
import ConfirmDialog from "components/ConfirmDialog";
import Table, { ColumnsType } from "antd/es/table";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { MdPublish } from 'react-icons/md';
import * as XLSX from "xlsx";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import {
  Divider,
  Form,
  Modal,
  Pagination,
  PaginationProps,
  Upload,
  UploadProps,
} from "antd";
type Props = {};

function UnitMaster({}: Props) {
  const matches = useMediaQuery("(min-width:822px)");
  const [data, setData] = useState<{ unitType: string; units: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [deleteUnit, setDeleteUnit] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState<number>(5);
  const [skip, setSkip] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const showTotal: PaginationProps["showTotal"] = (total: any) =>
    `Total ${total} items`;

  const cols = [
    {
      header: "Unit Type",
      accessorKey: "unitType",
    },
    {
      header: "Units",
      accessorKey: "units",
    },
  ];

  const headersData = ["Units", "Unit"];
  const fieldsData = ["unitType", "units"];
  const iconColor = "#380036";
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();
  const [isGraphSectionVisible, setIsGraphSectionVisible] = useState(false);
  const classes = useStyles({
    isGraphSectionVisible: isGraphSectionVisible,
  });
  const isLocAdmin = checkRoles(roles.LOCATIONADMIN);
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const isAdmin = checkRoles(roles.admin);
  const isEntityHead = checkRoles(roles.ENTITYHEAD);
  const isMR = checkRoles(roles.MR);
  const [importModel, setImportModel] = useState<any>({
    open: false,
  });

  const [fileList, setFileList] = useState<any>([]);
  useEffect(() => {
    getData();
  }, [page, rowsPerPage]);

  const changePage = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
    // getUOMListing(rowsPerPage * (page - 1), rowsPerPage);
    // setPage(page);
  };

  const getUOMListing = (skip: number, count: number) => {
    // getAllSystems(skip, count)
    //   .then((response: any) => {
    //     let data = parseData(response?.data?.systems);
    //     setCount(response?.data?.count);
    //     setTableData(data);
    //   })
    //   .catch((error: any) => {
    //     enqueueSnackbar("Something went wrong!", {
    //       variant: "error",
    //     });
    //   })
    //   .finally(() => {
    //     setIsLoading(false);
    //   });
  };
  const importUnits = async () => {
    // try {
    const XLSX = require("xlsx");
    const formData = new FormData();
    formData.append("file", fileList[0].originFileObj);

    const response = await axios.post(
      `${API_LINK}/api/kpi-definition/importUom`,
      formData
    );
    console.log("response", response);
    if (response.data.invalidUnits) {
      const headers = Object.keys(response.data.invalidUnits[0]);
      const invalidSheet = XLSX.utils.aoa_to_sheet(response.data.invalidUnits, {
        header: headers,
      });
      const invalidWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        invalidWorkbook,
        invalidSheet,
        "Invalid Units"
      );
      const excelBinaryString = XLSX.write(invalidWorkbook, {
        bookType: "xlsx",
        type: "binary",
      });
      const now = new Date();

      const formattedDate = now.toISOString().split("T")[0];

      const blob = new Blob([s2ab(excelBinaryString)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      saveAs(blob, `InvalidUnits_${formattedDate}.xlsx`);
      enqueueSnackbar(`Some Units Failed Please Check InvalidUnists`, {
        variant: "warning",
      });
    } else {
      enqueueSnackbar(`Units Imported Successfully`, {
        variant: "success",
      });
    }
    getData();
    // getKpiData(page, rowsPerPage);
    // } catch (error) {
    //   console.log("error in uploading attachments", error);
    // }
  };
  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }
  const uploadProps: UploadProps = {
    multiple: false, // Set to true to allow multiple file uploads
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFileList(fileList); // Set the entire file list instead of a single file
      }
    },
    onRemove: (file: any) => {
      // if (!!existingFiles && existingFiles.length > 0) {
      //   setExistingFiles((prevState: any) =>
      //     prevState.filter((f: any) => f.uid !== file.uid)
      //   ); // Update the existingFiles state to remove the specific fil
      // }
      setFileList((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      ); // Remove the specific file from the list
    },
    // fileList: formData?.file && formData.file.uid ? [formData.file] : [],
  };
  const columns: ColumnsType<any> = [
    {
      title: "Unit Type",
      dataIndex: "unitType",
      key: "unitType",
      // sorter: (a, b) => a.department - b.department,
    },
    {
      title: "Unit",
      dataIndex: "units",
      key: "units",
      // sorter: (a, b) => a.location - b.location,
    },

    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: any, record: any) =>
        isOrgAdmin && (
          <>
            <IconButton
              onClick={() => {
                handleEdit(record);
              }}
              className={classes.actionButtonStyle}
              data-testid="action-item"
            >
              <CustomEditIcon width={18} height={18} />
            </IconButton>
            <Divider type="vertical" className={classes.NavDivider} />
            <IconButton
              onClick={() => {
                handleOpen(record);
              }}
              className={classes.actionButtonStyle}
              data-testid="action-item"
            >
              <CustomDeleteICon width={18} height={18} />
            </IconButton>
          </>
        ),
    },
  ];

  const getData = async () => {
    setIsLoading(true);
    await axios(
      `/api/kpi-definition/getAllUom?page=${page}&limit=${rowsPerPage}`
    )
      .then((res) => {
        setData(
          res.data.result.map((obj: any) => ({
            id: obj.id,
            unitType: obj.unitType,
            units: obj.unitOfMeasurement.join(", "),
          }))
        );
        setCount(res.data?.totalCount);
      })
      .catch((err) => console.error(err));
    setIsLoading(false);
  };

  const handleEdit = (data: any) => {
    navigate(`/master/uom/newunit/${data.id}`, { state: true });
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteUnit(val);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    await axios
      .delete(`/api/kpi-definition/deleteUom/${deleteUnit.id}`)
      .then((res) => {
        enqueueSnackbar(`Unit deleted`, { variant: "success" });
        getData();
      })
      .catch((err) => {
        enqueueSnackbar(`An error occured`, { variant: "error" });
        console.error(err);
      });
    handleClose();
  };
  const getImportTemplate = () => {
    const headers = ["unittype", "uom"];

    // Sample data
    const data = [
      ["Number", "No in tens,hundreds"],
      ["Speed", "km/hr,miles/hr"],
    ];

    // Convert data to a worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Units");

    // Generate Excel file
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    // Save the file
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    saveAs(blob, "Unit_UomImportTemplate.xlsx");
  };
  const rowClassName = (record: any, index: number) => {
    return index % 2 === 0
      ? classes.alternateRowColor1
      : classes.alternateRowColor2;
  };

  // console.log("rowsperpage", rowsPerPage, page);
  return (
    // <div className={classes.root}>
    <>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />
      {importModel.open && (
        <Modal
          title="Import UoM"
          open={importModel.open}
          onCancel={() => setImportModel({ open: false })}
          onOk={() => {
            importUnits();
            setImportModel({ open: false });
          }}
        >
          <Form.Item name="file" label={"Attach File: "}>
            <Upload
              name="file"
              {...uploadProps}
              className={classes.uploadSection}
              fileList={fileList}
            >
              <p className="ant-upload-drag-icon">
                <MdInbox />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
            </Upload>
            <a href="#" onClick={getImportTemplate}>
              SampleTemplate
            </a>
          </Form.Item>
        </Modal>
      )}
      <Grid
        container
        // alignItems="center"
        justifyContent="flex-end"
        style={{ width: "100%" }}
      >
        <Grid item>
          {isOrgAdmin && matches && (
            <Tooltip title="Import UoM">
              <MdPublish
                onClick={() => setImportModel({ open: true })}
                style={{
                  position: "relative",
                  marginRight: "50px",

                  fontSize: "50px",
                  color: "#0E497A",
                  // paddingTop: "15px",
                }}
              />
            </Tooltip>
          )}
        </Grid>
      </Grid>
      {isLoading ? (
        <div className={classes.loader}>
          <CircularProgress />
        </div>
      ) : data && data?.length !== 0 ? (
        <>
          <>
            <div
              data-testid="custom-table"
              className={classes.tableContainer}
              style={{ marginTop: "15px" }}
            >
              <Table
                dataSource={data}
                pagination={{ position: [] }}
                columns={columns}
                size="middle"
                rowKey={"id"}
                className={classes.locationTable}
              />
              <div className={classes.pagination}>
                <Pagination
                  size="small"
                  current={page}
                  pageSize={rowsPerPage}
                  total={count}
                  showTotal={showTotal}
                  showSizeChanger
                  showQuickJumper
                  onChange={(page: any, pageSize: any) => {
                    changePage(page, pageSize);
                  }}
                />
              </div>
            </div>
          </>
        </>
      ) : (
        <>
          <div className={classes.imgContainer}>
            <img
              src={EmptyTableImg}
              alt="No Data"
              height="400px"
              width="300px"
            />
          </div>
          <Typography align="center" className={classes.emptyDataText}>
            Let’s begin by adding a unit
          </Typography>
        </>
      )}
    </>
    // {/* </div> */}
  );
}

export default UnitMaster;
