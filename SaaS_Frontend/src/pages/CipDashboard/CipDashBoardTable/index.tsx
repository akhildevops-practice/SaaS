import { Button, Table } from "antd";
import styles from "./style";
import axios from "apis/axios.global";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { cipFormData } from "recoil/atom";
import CIPDrawer from "components/CIPManagement/CIPTable/CIPDrawer";
import { AiOutlineFileExcel } from "react-icons/ai";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";

type props = {
  selectedCipStatus?: any;
  selectedCostCipId?: any;
  cipTableDataForAllLocation?: any;
  allOption?: any;
  handleCancelCharts?: any;
};

const CipDashboardTable = ({
  selectedCipStatus,
  selectedCostCipId,
  cipTableDataForAllLocation,
  allOption,
  handleCancelCharts,
}: props) => {
  const classes = styles();
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [cipTableData, setCipTableData] = useState<any[]>([]);
  const setFormData = useSetRecoilState(cipFormData);
  const [isGraphSectionVisible, setIsGraphSectionVisible] = useState(false);
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });
  useEffect(() => {
    if (selectedCipStatus !== "") {
      getCipStatusTableData();
    }
  }, [selectedCipStatus]);

  useEffect(() => {
    setCipTableData(cipTableDataForAllLocation);
  }, [cipTableDataForAllLocation]);

  const getCipStatusTableData = async () => {
    const response = await axios.get(
      `/api/cip/chartData?location[]=${userInfo?.location?.id}&statusWise=${selectedCipStatus}&page=1&limit=10`
    );
    setCipTableData(response?.data?.tableData);
  };

  const toggleGraphSection = () => {
    setIsGraphSectionVisible(!isGraphSectionVisible);
  };

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

  const columns = [
    {
      title: "	CIP Title",
      dataIndex: "title",
      key: "title",
      render: (_: any, record: any) => (
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
          >
            {record.title}
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Methodology",
      dataIndex: "methodology",
      key: "methodology",
    },
    {
      title: "Unit/Corp Func",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
    },
    {
      title: "Reviewer",
      dataIndex: "reviewer",
      key: "reviewer",
    },
    {
      title: "Approver",
      dataIndex: "approver",
      key: "approver",
    },

    {
      title: "Target Date",
      dataIndex: "targetDate",
      key: "targetDate",
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  const dataSource = cipTableData?.map((item: any) => ({
    ...item,
    title: item?.title,
    category: item?.cipCategoryId
      ?.map((category: any) => category.name)
      .join(", "),
    methodology: item?.cipTypeId,
    unit: item?.location?.name,
    creator: item?.createdBy?.name,
    reviewer: item?.reviewers.map((rev: any) => rev.reviewerName).join(", "),
    approver: item?.approvers.map((app: any) => app.approverName).join(", "),
    targetDate: item?.plannedEndDate
      ? new Date(item.plannedEndDate).toISOString().split("T")[0]
      : "",
    status: item?.status,
    id: item?._id,
  }));

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      cipTableData.map((item) => ({
        "CIP Title": item.title,
        Category: item?.cipCategoryId?.map((cat: any) => cat.name).join(", "),
        methodology: Array.isArray(item?.cipTypeId)
          ? item.cipTypeId.join(", ")
          : item.cipTypeId,
        "Unit/Corp Func": item?.location?.name,
        Creator: item?.createdBy?.name,
        Reviewer: item?.reviewers
          ?.map((rev: any) => rev.reviewerName)
          .join(", "),
        Approver: item?.approvers
          ?.map((app: any) => app.approverName)
          .join(", "),
        "Target Date": item?.plannedEndDate
          ? new Date(item.plannedEndDate).toISOString().split("T")[0]
          : "",
        Status: item?.status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");

    // Generate binary string
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    // Convert binary string to Blob
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
        <SecondaryButton
          type="primary"
          onClick={exportToExcel}
          buttonText="Download Excel"
          icon={<AiOutlineFileExcel />}
        />
      </div>
      <div className={classes.tableContainer} style={{ marginTop: "30px" }}>
        <Table
          dataSource={dataSource}
          columns={columns}
          className={classes.documentTable}
        />
      </div>
      {!!drawer.open && (
        <CIPDrawer
          drawer={drawer}
          setDrawer={setDrawer}
          isGraphSectionVisible={isGraphSectionVisible}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
        />
      )}
    </>
  );
};

export default CipDashboardTable;
