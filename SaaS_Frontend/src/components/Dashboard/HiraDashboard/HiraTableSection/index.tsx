import { Tooltip } from "@material-ui/core";
import useStyles from "./style";
import { Space, Table, Tag, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import HiraHistoryDrawerForAllView from "components/Risk/Hira/HiraRegister/HiraHistoryDrawerForAllView";
import HiraWorkflowCommentsDrawer from "components/Risk/Hira/HiraRegisterReview/HiraWorkflowCommentsDrawer";
import { useNavigate } from "react-router-dom";
type Props = {
  allHiraTableData: any;
  handleChangePageNewForAll?: any;
  paginationForAll?: any;
  showTotalForAll?: any;
  allHiraTableDataLoading?: any;
};

const HiraTableSection = ({
  allHiraTableData,
  handleChangePageNewForAll,
  paginationForAll,
  showTotalForAll,
  allHiraTableDataLoading = false,
}: Props) => {
  const classes = useStyles();
  const [
    consolidatedWorkflowHistoryDrawer,
    setConsolidatedWorkflowHistoryDrawer,
  ] = useState<any>({
    open: false,
    data: null,
  });
  const navigate = useNavigate();

  const [hiraWorkflowCommentsDrawer, setHiraWorkflowCommentsDrawer] =
    useState<any>({
      open: false,
      data: null,
    });

  const renderStatusTag = (status: any = "") => {
    console.log("checkdashboardnew status in renderStatusTag", status);

    if (status === "DRAFT") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EEDC82">
            DRAFT
          </Tag>
        </Space>
      );
    } else if (status === "IN_REVIEW") {
      return (
        <Space size={[0, 8]} wrap>
          {" "}
          <Tag className={classes.homePageTagStyle} color="#FFAC1C">
            IN REVIEW
          </Tag>
        </Space>
      );
    } else if (status === "IN_APPROVAL") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#7CB9E8">
            IN APPROVAL
          </Tag>
        </Space>
      );
    } else if (status === "APPROVED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#00AB66">
            APPROVED
          </Tag>
        </Space>
      );
    } else if (status === "REJECTED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EE4B2B">
            REJECTED
          </Tag>
        </Space>
      );
    } else {
      return <></>;
    }
  };

  const handleOpenHiraView = (record: any) => {
    const url = `/risk/riskregister/HIRA/${record?._id}`;
    window.open(url, "_blank");
  };

  const allHiraTableColumns: ColumnsType<any> = [
    {
      title: "Hira No.",
      dataIndex: "prefixSuffix",
      // width: 400,
      key: "prefixSuffix",
      render: (text: any, record: any) =>
        record?.prefixSuffix || "N/A",
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      // width: 200,
      render: (text: any, record: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 30) {
          displayText = text.substring(0, 30) + "...";
          isTruncated = true;
        }
        return isTruncated ? (
          <Tooltip title={text}>
            <div
              style={{
                verticalAlign: "top", // Align text to the top
                display: "flex",
                alignItems: "center",
                textDecorationLine: "underline",
                cursor: "pointer",
                // display: "block", // Make the content behave like a block element
              }}
              onClick={() => handleOpenHiraView(record)}
            >
              <span style={{ textTransform: "capitalize" }}>{displayText}</span>
            </div>
          </Tooltip>
        ) : (
          <div
            style={{
              verticalAlign: "top", // Align text to the top
              display: "flex",
              alignItems: "center",
              textDecorationLine: "underline",
              cursor: "pointer",
              // display: "block", // Make the content behave like a block element
            }}
            onClick={() => handleOpenHiraView(record)}
          >
            <span style={{ textTransform: "capitalize" }}>{displayText}</span>
          </div>
        );
      },
    },
    {
      title: "Routine/Non Routine",
      dataIndex: "riskTypeDetails",
      key: "riskTypeDetails",
      // width: 300,
      // editable: true,
      render: (_: any, record: any) => (
        <div
          style={{
            verticalAlign: "top", // Align text to the top
            // display: "block", // Make the content behave like a block element
          }}
        >
          {record?.riskTypeDetails?.name || "N/A"}
        </div>
      ),
    },
    {
      title: "Condition",
      dataIndex: "conditionDetails",
      key: "conditionDetails",
      // width: 300,
      // editable: true,
      render: (_: any, record: any) => (
        <div
          style={{
            verticalAlign: "top", // Align text to the top
            // display: "block", // Make the content behave like a block element
          }}
        >
          {record?.conditionDetails?.name || "N/A"}
        </div>
      ),
    },
    {
      title: "Dept/Vertical",
      dataIndex: "entityDetails",
      // width: 400,
      key: "entityDetails",
      render: (text: any, record: any) =>
        record?.entityDetails ? record?.entityDetails?.entityName : "",
    },
    {
      title: "Area",
      dataIndex: "area",
      // width: 400,
      key: "area",
      render: (text: any, record: any) =>
        record?.areaDetails
          ? record?.areaDetails?.name
          : record?.area
          ? record?.area
          : "",
    },
    {
      title: "Section",
      dataIndex: "section",
      // width: 400,
      key: "section",
      render: (text: any, record: any) =>
        record?.sectionDetails
          ? record?.sectionDetails?.name
          : record?.section
          ? record?.section
          : "",
    },
    {
      title: "Version",
      dataIndex: "currentVersion",
      key: "currentVersion",
      align: "center",
      render: (text: any, record: any) =>
        record?.currentVersion ? record?.currentVersion : 0,
    },
    {
      title: "Status",
      dataIndex: "workflowStatus",
      key: "workflowStatus",
      render: (text: any, record: any) => renderStatusTag(text),
    },
    {
      title: "Pending With",
      dataIndex: "pendingWith",
      // width: 400,
      key: "pendingWith",
    },
    {
      title: "Approved On",
      dataIndex: "approvedDate",
      // width: 400,
      key: "approvedDate",
    },
    {
      title: "Creator",
      dataIndex: "createdByDetails",
      key: "createdByDetails",
      render: (text: any, record: any) => (
        <div style={{ textTransform: "capitalize" }}>
          {record?.createdBy
            ? record?.createdByDetails?.firstname +
              " " +
              record?.createdByDetails?.lastname
            : "N/A"}
        </div>
      ),
    },
    {
      title: "Reviewers",
      dataIndex: "reviewersDetails",
      key: "reviewersDetails",
      render: (text: any, record: any) => (
        <div style={{ textTransform: "capitalize" }}>
          {record?.reviewersDetails
            ?.map((item: any) => item?.firstname + " " + item?.lastname)
            .join(", ") || ""}
        </div>
      ),
    },
    {
      title: "Approvers",
      dataIndex: "approversDetails",
      key: "approversDetails",
      render: (text: any, record: any) => (
        <div style={{ textTransform: "capitalize" }}>
          {record?.approversDetails
            ?.map((item: any) => item?.firstname + " " + item?.lastname)
            .join(", ") || ""}
        </div>
      ),
    },
  ];

  const handleConsolidatedCloseWorkflowHistoryDrawer = () => {
    setConsolidatedWorkflowHistoryDrawer({
      ...consolidatedWorkflowHistoryDrawer,
      open: !consolidatedWorkflowHistoryDrawer.open,
      data: null,
    });
  };

  const toggleCommentsDrawer = () => {
    setHiraWorkflowCommentsDrawer({
      ...hiraWorkflowCommentsDrawer,
      open: !hiraWorkflowCommentsDrawer.open,
      data: null,
    });
  };

  return (
    <>
      <div
        className={classes.allHiraTableContainer}
        id="table1"

        // style={{  height: "300px" }}
      >
        <Table
          columns={allHiraTableColumns}
          dataSource={allHiraTableData}
          rowKey={"id"}
          loading={allHiraTableDataLoading}
          // className={classes.riskTable}
          pagination={false}
          rowClassName={(record, index) => {
            const totalRows = allHiraTableData?.length;
            let middleIndex;

            // Determine the middle index
            if (totalRows % 2 === 0) {
              // If even, choose the lower middle (subtract 1 to convert to 0-based index)
              middleIndex = totalRows / 2 - 1;
            } else {
              // If odd, calculate middle index normally
              middleIndex = Math.floor(totalRows / 2);
            }

            // Apply the classname 'new-row' to the middle row
            return index === middleIndex ? "new-row" : "";
          }}
        />
      </div>
      <div className={classes.pagination}>
        <Pagination
          size="small"
          current={paginationForAll?.current}
          pageSize={paginationForAll?.pageSize}
          total={paginationForAll?.total}
          showTotal={showTotalForAll}
          showSizeChanger
          showQuickJumper
          onChange={(page, pageSize) => {
            handleChangePageNewForAll(page, pageSize);
          }}
        />
      </div>
      {consolidatedWorkflowHistoryDrawer?.open && (
        <HiraHistoryDrawerForAllView
          consolidatedWorkflowHistoryDrawer={consolidatedWorkflowHistoryDrawer}
          handleConsolidatedCloseWorkflowHistoryDrawer={
            handleConsolidatedCloseWorkflowHistoryDrawer
          }
        />
      )}
      {!!hiraWorkflowCommentsDrawer.open && (
        <HiraWorkflowCommentsDrawer
          commentDrawer={hiraWorkflowCommentsDrawer}
          setCommentDrawer={setHiraWorkflowCommentsDrawer}
          toggleCommentsDrawer={toggleCommentsDrawer}
        />
      )}
    </>
  );
};

export default HiraTableSection;
