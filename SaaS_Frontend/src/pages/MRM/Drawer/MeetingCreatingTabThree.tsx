import React, { useEffect, useState } from "react";
import { Button, Table } from "antd";
import { makeStyles } from "@material-ui/core";
import { getPendingActionPointsForMeeting } from "apis/mrmmeetingsApi";
import moment from "moment";

import { useSnackbar } from "notistack";
type Props = {
  data: any;
  valueById: any;
  ownerSourceFilter: any;
  option: string;
  open: any;
};
const useStyles = makeStyles((theme) => ({
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(14),
    color: "#003566",
  },
  asterisk: {
    color: "red",
    verticalAlign: "end",
  },
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
    },
  },
  label: {
    verticalAlign: "middle",
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  tableContainer: {
    marginTop: "1%",
    maxHeight: "calc(60vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "scroll",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      // color: ({ iconColor }) => iconColor,
    },
    "& span.ant-tag": {
      display: "flex",
      width: "89px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      borderBottom: "black",
      padding: "4px 8px !important",
    },
    // '& .ant-table-wrapper .ant-table-container': {
    //     maxHeight: '420px', // Adjust the max-height value as needed
    //     overflowY: 'auto',
    //     overflowX: 'hidden',
    // },
    "& .ant-table-body": {
      // maxHeight: '150px', // Adjust the max-height value as needed
      // overflowY: 'auto',
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& tr.ant-table-row": {
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
  },
}));

function MeetingCreatingTabThree({
  data,
  valueById,
  ownerSourceFilter,
  option,
  open,
}: Props) {
  const classes = useStyles();
  const [pendingData, setPendingData] = useState<any[]>();
  const { enqueueSnackbar } = useSnackbar();
  const [userId, setUserId] = useState<any>();
  const [name, setName] = useState<any>();
  //console.log("data in tab 3", data);
  useEffect(() => {
    if (option === "Edit") {
      setUserId(data?.meetingSchedule?.meetingType);
      //pendingActionPoints();
    } else {
      setUserId(data?.allData?.meetingType?._id);
      //pendingActionPoints();
    }
  }, [option]);
  useEffect(() => {
    if (userId) pendingActionPoints();
  }, [userId, open]);

  const pendingActionPoints = () => {
    try {
      getPendingActionPointsForMeeting(userId).then((response: any) => {
        // console.log("response in pendingactions", response?.data);
        if (response?.data) {
          setPendingData(response?.data?.open);
          setName(response?.data?.meetingtypename);
        }

        // console.log("id=====>", response?.data);}
      });
    } catch (error: any) {
      // enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const tableRowData = [
    {
      title: "Action Point",
      dataIndex: "Action Point",
      // width: 50,
      render: (_: any, data: any, index: number) => {
        return (
          <>
            <span>{data?.title}</span>
          </>
        );
      },
    },
    {
      title: "Agenda",
      dataIndex: "Agenda",
      // width: 50,
      render: (_: any, data: any, index: number) => {
        return (
          <>
            <span>{data?.additionalInfo?.agenda}</span>
          </>
        );
      },
    },
    {
      title: "Owner",
      dataIndex: "Owner",
      // width: 50,
      render: (_: any, data: any, index: number) => {
        return (
          <>
            {data?.owner?.map((owner: any, index: any) => (
              <React.Fragment key={owner.id}>
                <span>{owner.username}</span>
                {index < data.owner.length - 1 && <span>, </span>}
              </React.Fragment>
            ))}
          </>
        );
      },
    },
    {
      title: "Due Date",
      dataIndex: "Due Date",
      // width: 50,
      render: (_: any, data: any, index: number) => {
        return (
          <>
            <span>{moment(data?.targetDate).format("DD-MM-YYYY")}</span>
          </>
        );
      },
    },
    {
      title: "Meeting Type",
      dataIndex: "Meeting Type",
      // width: 200,
      render: (_: any, data: any, index: number) => {
        return (
          <>
            <span>{name}</span>
          </>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "Status",
      // width: 20,
      render: (_: any, data: any, index: number) => {
        return (
          <>
            <Button
              style={{ backgroundColor: "rgb(212, 230, 241)", height: "30px" }}
            >
              {data?.status ? "Open" : "Close"}
            </Button>
          </>
        );
      },
    },
  ];
  return (
    <div className={classes.tableContainer} style={{ paddingTop: "30px" }}>
      <Table
        className={classes.documentTable}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={pendingData}
        columns={tableRowData}
        pagination={false}
      />
    </div>
  );
}

MeetingCreatingTabThree.propTypes = {};

export default MeetingCreatingTabThree;
