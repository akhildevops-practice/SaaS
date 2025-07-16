import { useState } from "react";
import { Button, Table } from "antd";
import styles from "./style";
import { useSetRecoilState } from "recoil";
import { cipFormData } from "recoil/atom";
import CIPDrawer from "components/CIPManagement/CIPTable/CIPDrawer";
import { AiOutlineFileExcel } from "react-icons/ai";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type props = {
  selectedCostCipId?: any;
  cipCostTableData?: any;
};

const CipCostChartTable = ({ selectedCostCipId, cipCostTableData }: props) => {
  const classes = styles();

  const setFormData = useSetRecoilState(cipFormData);

  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });

  const [isGraphSectionVisible, setIsGraphSectionVisible] = useState(false);
  const toggleGraphSection = () => {
    // New function to toggle graph section
    setIsGraphSectionVisible(!isGraphSectionVisible);
  };
  const [readOnly, setReadOnly] = useState<boolean>(false);

  const handleEditCIP = (data: any) => {
    setFormData(cipFormData);
    setDrawer({
      ...drawer,
      mode: "edit",
      clearFields: false,
      toggle: false,
      data: data,
      open: !drawer.open,
    });
  };

  const columnsForCost = [
    {
      title: "	CIP Title",
      dataIndex: "title",
      key: "title",
      width: 350,
      render: (_: any, record: any) => (
        // record.action ? (
        // <Tooltip title={record.title}>
        <div
          style={{
            textDecorationLine: "underline",
            cursor: "pointer",
            width: 130,
          }}
        >
          <div
            className={classes.clickableField}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onClick={() => {
              setReadOnly(true);
              handleEditCIP(record);
            }}
            // ref={refForcip3}
          >
            {record.title}
          </div>
        </div>
        // </Tooltip>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      // render: (cipCategoryId: any) =>
      //   cipCategoryId?.map((category: any) => category?.name).join(", "),
    },
    {
      title: "Methodology",
      dataIndex: "methodology",
      key: "methodology",
      // render: (item: any) => item?.cipTypeId,
    },
    {
      title: "Unit/Corp Func",
      dataIndex: "unit",
      key: "unit",
      // render: (item: any) => item?.location?.name,
    },
    {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
      // render: (item: any) => item?.createdBy?.name,
    },
    {
      title: "Reviewer",
      dataIndex: "reviewer",
      key: "reviewer",
      // render: (reviewers: any) =>
      //   reviewers?.map((rev: any) => rev?.reviewerName).join(", "),
    },
    {
      title: "Approver",
      dataIndex: "approver",
      key: "approver",
      // render: (approvers: any) =>
      //   approvers?.map((app: any) => app?.approverName).join(", "),
    },

    {
      title: "Target Date",
      dataIndex: "targetDate",
      key: "targetDate",
      // render: (item: any) =>
      //   item?.plannedEndDate
      //     ? new Date(item?.data?.plannedEndDate).toISOString().split("T")[0]
      //     : "",
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // render: (item: any) => item?.status,
    },
  ];

  const dataSourceForCost = [
    {
      title: cipCostTableData?.data?.title,
      category: cipCostTableData?.data?.cipCategoryId
        ?.map((category: any) => category?.name)
        .join(", "),
      methodology: cipCostTableData?.data?.cipTypeId?.join(", "),
      unit: cipCostTableData?.data?.location?.name,
      creator: cipCostTableData?.data?.createdBy?.name,
      reviewer: cipCostTableData?.data?.reviewers
        ?.map((rev: any) => rev?.reviewerName)
        .join(", "),
      approver: cipCostTableData?.data?.approvers
        ?.map((app: any) => app?.approverName)
        .join(", "),
      targetDate: cipCostTableData?.data?.plannedEndDate
        ? new Date(cipCostTableData?.data?.plannedEndDate)
            .toISOString()
            .split("T")[0]
        : "",
      status: cipCostTableData?.data?.status,
      id: cipCostTableData?.data?._id,
    },
  ];

  const exportToExcel = () => {
    if (!cipCostTableData?.data || typeof cipCostTableData.data !== "object") {
      console.error(
        "cipCostTableData.data is not a valid object",
        cipCostTableData?.data
      );
      return;
    }

    const item = cipCostTableData.data; // Directly access the object

    const worksheet = XLSX.utils.json_to_sheet([
      {
        "CIP Title": item.title || "",
        Category: Array.isArray(item?.cipCategoryId)
          ? item.cipCategoryId.map((cat: any) => cat.name).join(", ")
          : "",
        methodology: Array.isArray(item?.cipTypeId)
          ? item.cipTypeId.join(", ")
          : item.cipTypeId || "",
        "Unit/Corp Func": item?.location?.name || "",
        Creator: item?.createdBy?.name || "",
        Reviewer: Array.isArray(item?.reviewers)
          ? item.reviewers.map((rev: any) => rev.reviewerName).join(", ")
          : "",
        Approver: Array.isArray(item?.approvers)
          ? item.approvers.map((app: any) => app.approverName).join(", ")
          : "",
        "Target Date": item?.plannedEndDate
          ? new Date(item.plannedEndDate).toISOString().split("T")[0]
          : "",
        Status: item?.status || "",
      },
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    };

    const data = new Blob([s2ab(excelBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "CIP_Table.xlsx");
  };

  return (
    <>
      <div
        style={{ display: "flex", justifyContent: "end", marginRight: "20px" }}
      >
        <Button
          type="primary"
          onClick={exportToExcel}
          icon={<AiOutlineFileExcel />}
        >
          Download Excel
        </Button>
      </div>
      <div className={classes.tableContainer} style={{ marginTop: "30px" }}>
        <Table
          dataSource={dataSourceForCost}
          columns={columnsForCost}
          className={classes.documentTable}
        />
      </div>
      {!!drawer.open && (
        <CIPDrawer
          drawer={drawer}
          setDrawer={setDrawer}
          // handleFetchCips={getAllCip}
          isGraphSectionVisible={isGraphSectionVisible}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
        />
      )}
    </>
  );
};

export default CipCostChartTable;
