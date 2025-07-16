import { Button, Table, Tooltip } from "antd";
import { useState } from "react";
import styles from "./style";
import CaraDrawer from "components/CaraDrawer";
import { useLocation } from "react-router-dom";
import { MdOutlineWarning } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AiOutlineFileExcel } from "react-icons/ai";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
type props = {
  capaModelTableData?: any;
};

const CapaDashBoardTable = ({ capaModelTableData }: props) => {
  const classes = styles();

  const [editData, setEditData] = useState<any>({});
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [readMode, setReadMode] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    data: {},
    open: false,
  });
  const location = useLocation();
  const [acitveTab, setActiveTab] = useState<any>("1");
  const [expandDataValues, setExpandDataValues] = useState<any>(
    location.state?.dataValues ?? {}
  );
  const [isUpload, setUpload] = useState<boolean>(false);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      capaModelTableData?.map((item: any) => ({
        "Problem Statement": item.title,
        Origin: item.origin?.deviationType,
        "Unit/Corp Func": item.locationDetails?.locationName,
        "Registered By": item.registeredBy?.username,
        "CAPA Owner": item.caraOwner?.name,
        "Responsible Entity": item.entityId?.entityName,
        "Target Date": item.targetDate
          ? new Date(item.targetDate).toLocaleDateString("en-GB")
          : "NA",
        "Pending With":
          item.status === "Open" && item.deptHead?.length > 0
            ? item.deptHead
                ?.map((head: any) => head?.firstname + " " + head?.lastname)
                .join(", ")
            : item.status === "Accepted" ||
              item.status === "Analysis_In_Progress"
            ? item.rootCauseAnalysis
              ? item.deptHead
                  ?.map((head: any) => head?.firstname + " " + head?.lastname)
                  .join(", ")
              : item.caraOwner?.firstname + " " + item.caraOwner?.lastname
            : item.status === "Outcome_In_Progress"
            ? item.actualCorrectiveAction
              ? item.deptHead
                  ?.map((head: any) => head?.firstname + " " + head?.lastname)
                  .join(", ")
              : item.caraOwner?.firstname + " " + item.caraOwner?.lastname
            : item.status === "Rejected"
            ? item.registeredBy?.firstname + " " + item.registeredBy?.lastname
            : "NA",
        Status: item.status,
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

    saveAs(data, "CapaDashboard.xlsx");
  };

  // ------------------Table-data----------------------
  const columns = [
    {
      title: "Problem Statement",
      dataIndex: "problemStatement",
      key: "problemStatement",
      render: (_: any, data: any, index: number) => (
        <>
          <div
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => {
              console.log("data in undeline22", data);
              setIsEdit(true);
              setEditData(data);
              setDrawer({
                mode: "edit",
                data: { ...data, id: data?._id },
                open: true,
              });

              setReadMode(true);
            }}
          >
            {data?.problemStatement}
          </div>
        </>
      ),
      //   width: 350,
    },
    {
      title: "Origin",
      dataIndex: "origin",
      key: "origin",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Registered By",
      dataIndex: "registered",
      key: "registered",
    },
    {
      title: "CAPA Owner",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "Responsible Entity",
      dataIndex: "entity",
      key: "entity",
    },
    {
      title: "Target Date",
      dataIndex: "targetDate",
      width: 100,
      render: (text: any, data: any, index: number) => {
        if (data?.targetDate) {
          const currentDate = new Date();
          const targetDate = new Date(data.targetDate);

          // Compare dates and if target date is less than current date, indicate only "Delayed" in red
          if (targetDate < currentDate) {
            const formattedTargetDate = targetDate.toLocaleDateString("en-GB"); // Adjust the locale accordingly
            return (
              <span>
                {formattedTargetDate}
                <Tooltip title="Target Date has exceeded the current date">
                  <MdOutlineWarning
                    style={{ color: "red", marginLeft: "5px" }}
                  />
                </Tooltip>
              </span>
            );
          } else {
            // Format target date as "dd/mm/yyyy"
            const formattedTargetDate = targetDate.toLocaleDateString("en-GB"); // Adjust the locale accordingly
            return <span>{formattedTargetDate}</span>;
          }
        } else {
          return "NA";
        }
      },
    },
    {
      title: "Pending With",
      dataIndex: "pendingWith",
      width: 100,
      render: (_: any, data: any, index: number) => (
        <>
          <div>
            {data?.status === "Open" && data?.deptHead?.length > 0 && (
              <p>
                {data?.deptHead
                  ?.map((head: any) => head?.firstname + " " + head?.lastname)
                  .join(", ")}
              </p>
            )}

            {data?.status === "Accepted" &&
              (data?.rootCauseAnalysis ? (
                data?.deptHead?.length > 0 && (
                  <p>
                    {data?.deptHead
                      .map(
                        (head: any) => head?.firstname + " " + head?.lastname
                      )
                      .join(", ")}
                  </p>
                )
              ) : (
                <p>
                  {data?.caraOwner?.firstname + " " + data?.caraOwner?.lastname}
                </p>
              ))}
            {data?.status === "Analysis_In_Progress" &&
              (data?.rootCauseAnalysis ? (
                data?.deptHead?.length > 0 && (
                  <p>
                    {data?.deptHead
                      .map(
                        (head: any) => head?.firstname + " " + head?.lastname
                      )
                      .join(", ")}
                  </p>
                )
              ) : (
                <p>
                  {data?.caraOwner?.firstname + " " + data?.caraOwner?.lastname}
                </p>
              ))}

            {data?.status === "Outcome_In_Progress" &&
              (data?.actualCorrectiveAction ? (
                data?.deptHead?.length > 0 && (
                  <p>
                    {data?.deptHead
                      .map(
                        (head: any) => head?.firstname + " " + head?.lastname
                      )
                      .join(", ")}
                  </p>
                )
              ) : (
                <p>
                  {data?.caraOwner?.firstname + " " + data?.caraOwner?.lastname}
                </p>
              ))}
            {data?.status === "Rejected" && (
              <p>
                {data?.registeredBy?.firstname +
                  " " +
                  data?.registeredBy?.lastname}
              </p>
            )}
          </div>
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];
  //console.log("capaModelTableData", capaModelTableData);
  const dataSource = capaModelTableData?.map((item: any) => ({
    ...item,
    problemStatement: item.title,
    origin: item.origin?.deviationType,
    unit: item.locationDetails?.locationName,
    registered: item.registeredBy?.username,
    owner: item.caraOwner?.name,
    entity: item.entityId?.entityName,
    // targetDate:
    status: item.status,
  }));

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          marginRight: "20px",
          marginBottom: "10px",
        }}
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
      <CaraDrawer
        handleDrawer={() =>
          setDrawer({ mode: "create", data: {}, open: false })
        }
        activeTab={"1"}
        setActiveTab={setActiveTab}
        drawerType={"create"}
        drawer={drawer}
        setDrawer={setDrawer}
        expandDataValues={expandDataValues}
        mrm={true}
        isEdit={isEdit}
        editData={editData}
        setIsEdit={setIsEdit}
        readMode={readMode}
        isUpload={isUpload}
        setUpload={setUpload}
        // getData={getData}
      />
    </>
  );
};

export default CapaDashBoardTable;
