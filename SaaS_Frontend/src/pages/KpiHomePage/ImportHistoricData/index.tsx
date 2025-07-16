import { useState } from "react";
import {
  Grid,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { Form, Modal, Upload, UploadProps } from "antd";
import { useLocation } from "react-router-dom";
import checkRoles from "utils/checkRoles";
import { useSnackbar } from "notistack";
import { roles } from "utils/enums";
import { API_LINK } from "config";
import axios from "apis/axios.global";
import { MdInbox } from 'react-icons/md';
import { MdPublish } from 'react-icons/md';
const useStyles = makeStyles((theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  customModal: {
    "& .ant-modal-close": {
      color: "rgb(0, 48, 89);",
      fontSize: "20px",
    },
    "& .ant-modal-close:hover": {
      color: "rgb(0, 48, 89);",
    },
  },
  iconButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  downloadIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "32px",
    height: "40px",
    marginRight: "30px",
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  tableContainerScrollable: {
    marginBottom: "20px",
    maxHeight: "calc(76vh - 20vh)",
    overflowY: "auto",
    // overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px",
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
    antTableCell: {
      padding: "4px!important", // Adjust the padding to reduce row height
    },
  },
  tableContainer: {
    maxHeight: "calc(76vh - 20vh)",
    overflowX: "hidden",
    overflowY: "auto",

    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },

    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
    },
    "& span.ant-tag": {
      display: "flex",
      width: "60px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
    },
    "& .ant-table-wrapper .ant-table-thead > tr > th": {
      position: "sticky",
      top: 0,
      zIndex: 2,
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody > tr > td": {
      borderBottom: "1px solid #f0f0f0",
      padding: "6px !important",
    },
    "& .ant-table-body": {
      maxHeight: "200px",
      overflowY: "auto",
      overflowX: "hidden",
      "&::-webkit-scrollbar": {
        width: "5px !important",
        height: "10px !important",
        backgroundColor: "white",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "5px !important",
        backgroundColor: "grey",
      },
    },
    "& tr.ant-table-row": {
      cursor: "pointer",
      transition: "all 0.1s linear",
      "&:hover": {
        backgroundColor: "white !important",
        boxShadow: "0 1px 0px #0003",
        transform: "scale(1.01)",
        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },
  },
}));
const ImportHistoricData = () => {
  const classes = useStyles();
  const location = useLocation();
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const isMr = checkRoles(roles.MR);

  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  const { enqueueSnackbar } = useSnackbar();
  const [fileList, setFileList] = useState<any>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [importModel, setImportModel] = useState<any>({
    open: false,
  });

  const importKpis = async () => {
    try {
      const XLSX = require("xlsx");
      const formData = new FormData();
      formData.append("file", fileList[0].originFileObj);
      console.log("import kpi called", formData);
      const response = await axios.post(
        `${API_LINK}/api/kpi-report/importReport`,
        formData
      );
      console.log("response", response);
      if (response.data.success) {
        const headers = Object.keys(response.data.invalidKpis[0]);
        const invalidSheet = XLSX.utils.aoa_to_sheet(
          response.data.invalidKpis,
          { header: headers }
        );
        const invalidWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          invalidWorkbook,
          invalidSheet,
          "Invalid Kpis"
        );
        const excelBinaryString = XLSX.write(invalidWorkbook, {
          bookType: "xlsx",
          type: "binary",
        });
        const blob = new Blob([s2ab(excelBinaryString)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, "InvalidKpis.xlsx");
        enqueueSnackbar(`Some Kpis Failed Please Check InvalidKpis`, {
          variant: "warning",
        });
      }
      if (response.data.wrongFormat) {
        exportKpis(true);
      } else {
        enqueueSnackbar(`Kpis Imported Successfully`, {
          variant: "success",
        });
      }

      //   getKpiData(page, rowsPerPage);
    } catch (error) {
      console.log("error in uploading attachments", error);
    }
  };
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
  const exportKpis = async (bool: boolean) => {
    const response: any = await getAllKpisForExport();
    const requiredData: any[] = [];

    for (const element of response) {
      requiredData.push({
        kpiName: element.kpiName,
        kpiType: element.kpiType,
        kpiTargetType: element.kpiTargetType,
        kpiDescription: element.kpiDescription,
        locationId: element.location.join(", "),
        sourceId: element.source,
        uom: element.uom,
        apiEndPoint: element.apiEndPoint,
        // : element.role.props.data
        //   .map((dataRole: { role: any }) => dataRole.role)
        //   .join(", "),
        // Location: element.location.locationName
        //   ? element.location.locationName
        //   : "N/A",
        // Entity: element.entity,
      });
    }
    const sheet = XLSX.utils.json_to_sheet(requiredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Kpis");
    const excelBinaryString = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });
    const blob = new Blob([s2ab(excelBinaryString)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    if (tableData.length === 0 || bool) {
      saveAs(blob, "Kpis.xlsx");
      if (bool) {
        enqueueSnackbar(`Wrong Template Please View KpiTemplate`, {
          variant: "error",
        });
      }
    } else {
      enqueueSnackbar(`Export KPIs Successful`, {
        variant: "success",
      });
      saveAs(blob, "KPIs.xlsx");
    }
  };
  const getAllKpisForExport = async () => {
    const result = await axios.get(`/api/kpi-definition/getAllKpisForExport`);
    // console.log("result", result);
    return result.data;
  };
  const getImportTemplate = () => {
    const headers = [
      "Location",
      "Department",
      "Category",
      "KpiName",
      "Apr-23 Target",
      "Apr-23 Actual",
      "May-23 Target",
      "May-23 Actual",
      "Jun-23 Target",
      "Jun-23 Actual",
      "Jul-23 Target",
      "Jul-23 Actual",
      "Aug-23 Target",
      "Aug-23 Actual",
      "Sep-23 Target",
      "Sep-23 Actual",
      "Oct-23 Target",
      "Oct-23 Actual",
      "Nov-23 Target",
      "Nov-23 Actual",
      "Dec-23 Target",
      "Dec-23 Actual",
      "Jan-24 Target",
      "Jan-24 Actual",
    ];

    // Sample data
    const data = [
      [
        "a1",
        "e1",
        "Customer Centricity",
        "CPP MIS",
        30,
        30,
        31,
        31,
        30,
        30,
        31,
        31,
        31,
        31,
        30,
        30,
        31,
        31,
        30,
        30,
        31,
        31,
      ],
      [
        "a1",
        "e1",
        "Customer Centricity",
        "CBM Compliance",
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
      ],
      [
        "a1",
        "e1",
        "Cost",
        "Services",
        "",
        "",
        "",
        "",
        "",
        "",
        7.9,
        3.73,
        5,
        3,
        3.9,
        3.54,
        4.8,
        3.45,
        "",
        "",
        4.3,
        3.57,
      ],
    ];

    // Convert data to a worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KPIs");

    // Generate Excel file
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    // Save the file
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    saveAs(blob, "KPIHistoricData_Template.xlsx");
  };

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }
  return (
    <>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item style={{ paddingTop: "15px" }}>
          <Typography color="primary" variant="h6">
            KPI Historic Data
          </Typography>
        </Grid>
        {(isOrgAdmin || isMr) && (
          <Tooltip title="Import Historic Data">
            <MdPublish
              onClick={() => setImportModel({ open: true })}
              style={{
                // position: "relative",
                // top: "-50px",
                // right: "10px",
                fontSize: "35px",
                color: "#0E497A",
                // paddingTop: "15px",
              }}
            />
          </Tooltip>
        )}
        {importModel.open && (
          <Modal
            title="Import Kpi Data"
            open={importModel.open}
            onCancel={() => setImportModel({ open: false })}
            onOk={() => {
              importKpis();
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
            </Form.Item>
            <a
              href="#"
              onClick={getImportTemplate}
              style={{
                display: " block" /* Make the link block level */,
                marginTop: "100px",
                // paddingTop: "50px",
              }}
            >
              SampleTemplate
            </a>
          </Modal>
        )}
      </Grid>
    </>
  );
};
export default ImportHistoricData;
