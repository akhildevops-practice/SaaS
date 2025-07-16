import { useEffect, useState } from "react";
import {Modal,Select as AntdSelect, Table } from "antd";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import {
  CircularProgress,
  makeStyles,
  Tooltip,
  IconButton,
} from "@material-ui/core";
import axios from "apis/axios.global";
import { MdCheckCircle } from 'react-icons/md';
import { MdCancel } from 'react-icons/md';
import getAppUrl from "utils/getAppUrl";
import getSessionStorage from "utils/getSessionStorage";
import { MdHourglassEmpty } from 'react-icons/md';
import { Form } from "antd";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { useSnackbar } from "notistack";
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from "react-icons/ai";
import moment from "moment";
import { useNavigate } from "react-router-dom";
const useStyles = makeStyles((theme) => ({
  subTableContainer: {
    "& .ant-table-container": {
      backgroundColor: "white !important",
      // overflowX: "auto",

      // overflow: 'hidden',
      overflowY: "auto",

      "& span.ant-table-column-sorter-inner": {
        color: "#380036",
        backgroundColor: "white !important",
      },
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      // backgroundColor: 'black !important',
    },
    "& .ant-table-cell": {
      // backgroundColor : '#f7f7ff'
    },
    "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
      {
        backgroundColor: "black",
      },

    "& tr.ant-table-row": {
      borderRadius: 5,
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
    "& .ant-table-tbody >tr >td": {
      borderBottom: `1px solid black`,
      // Customize the border-bottom color here
      backgroundColor: "white !important",
    },
    "& .ant-table-expanded-row ant-table-expanded-row-level-1 > ant-table-cell":
      {
        paddding: "0px !important",
      },
    // "& .ant-table-row.ant-table-row-level-1": {
    //   backgroundColor: "rgba(169,169,169, 0.1)",
    // },
    // "& .ant-table-thead .ant-table-cell": {
    //   backgroundColor: "rgb(239, 239, 239) !important",
    //   color: "black",
    // },
  },
  tableContainer: {
    "& .ant-table-container": {
      overflowX: "hidden",
      overflowY: "hidden",
      [theme.breakpoints.down("xs")]: {
        "& .ant-table-container": {
          overflowX: "hidden", // Ensure scrolling is available on small screens
          // Add any additional styles needed for small screens
        },
      },
      "& span.ant-table-column-sorter-inner": {
        color: "#380036",
        // color: ({ iconColor }) => iconColor,
      },
      // "&::-webkit-scrollbar": {
      //   width: "5px",
      //   height: "10px", // Adjust the height value as needed
      //   backgroundColor: "white",
      // },
      // "&::-webkit-scrollbar-thumb": {
      //   borderRadius: "10px",
      //   backgroundColor: "grey",
      // },
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      // position: "sticky", // Add these two properties
      // top: 0, // Add these two properties
      // zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      // padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      // lineHeight: "24px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      position: "sticky",
      top: 0,
      zIndex: 2,
      padding: "6px 8px !important",
      lineHeight: "24px",
    },

    // ... other existing styles ...

    [theme.breakpoints.down("xs")]: {
      "& .ant-table-thead > tr > th": {
        fontSize: "12px", // Smaller font size for headers on small screens
        // Adjust other styles as needed for responsive design
      },
    },
    "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
      {
        // backgroundColor: ({ tableColor }) => tableColor,
        backgroundColor: "#e9e9e9",
      },

    // "& tr.ant-table-row": {
    //   borderRadius: 5,
    //   cursor: "pointer",
    //   transition: "all 0.1s linear",

    //   "&:hover": {
    //     backgroundColor: "white !important",
    //     boxShadow: "0 1px 5px 0px #0003",
    //     transform: "scale(1.01)",

    //     "& td.ant-table-cell": {
    //       backgroundColor: "white !important",
    //     },
    //   },
    // },
    "& .ant-table-tbody >tr >td": {
      borderBottom: "black",
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
    },
    "& .ant-table-row.ant-table-row-level-1": {
      backgroundColor: "rgba(169,169,169, 0.1)",
    },
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },

    [theme.breakpoints.down("xs")]: {
      "& .ant-table-row:first-child": {
        width: "100%",
      },
    },
  },
  infoDrawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
  },
  modalContent: {
    "& .ant-modal-body": {
      height: "80vh",
      overflowY: "scroll",
    },
    "& .ant-form-item .ant-form-item-label >label": {
      color: "#003566",
      fontSize: "medium",
      fontWeight: "bold",
      letterSpacing: "0.5px",
    },
  },
  infoContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    margin: "10px 0",
    marginRight: "10px",
  },
  infoRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    // borderBottom: "1px solid #e0e0e0",
  },
  infoLabel: {
    fontWeight: "bold",
    fontSize: "1rem",
  },
}));

const expandIcon = ({ expanded, onExpand, record }: any) => {
  const icon = expanded ? <AiOutlineMinusCircle /> : <AiOutlinePlusCircle />;
  // console.log("record", record);
  if (record?.auditPlans?.length > 0) {
    return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
  }
  return null;
};

const monthOrder: any = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

const sortMonthNames = (monthNames: any) => {
  return monthNames.sort((a: any, b: any) => monthOrder[a] - monthOrder[b]);
};

const getUniqueMonthNames = (auditPlanEntityWise: any) => {
  const monthNamesSet = new Set();
  auditPlanEntityWise.forEach((entity: any) => {
    entity.monthNames.forEach((monthName: any) => {
      monthNamesSet.add(monthName);
    });
  });
  return Array.from(monthNamesSet);
};

type Props = {
  auditPeriodModal?: any;
  setAuditPeriodModal?: any;
};

const AuditPeriodModal = ({ auditPeriodModal, setAuditPeriodModal }: Props) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const realmName = getAppUrl();
  const isMR = checkRoles(roles.MR);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userDetails = getSessionStorage();

  const [selectedAuditPeriod, setSelectedAuditPeriod] = useState<any>(undefined);
  const [auditPeriodOptions, setAuditPeriodOptions] = useState<any>([]);
  const [auditPeriodTableData, setAuditPeriodTableData] = useState<any>([]);
  const [auditPlanEntityWise, setAuditPlanEntityWise] = useState<any>([]);
  const [auditPlanData, setAuditPlanData] = useState<any>(null);
  //settings string to store fiscalYearQuarters
  const [settings, setSettings] = useState<any>("");

  useEffect(() => {
    console.log(
      "checkauditnew auditPEridodMoal in useEffect[auditPeriodModal]===>",
      auditPeriodModal
    );
    getAuditPlanDetailsById();
    getFiscalYearQuarter();
  }, [auditPeriodModal]);

  useEffect(() => {
    console.log(
      "checkauditnew inside auditPeriodTableData modal useffect[auditPeriodTableData]",
      auditPeriodTableData
    );
  }, [auditPeriodTableData]);

  const getFiscalYearQuarter = async () => {
    const realm = getAppUrl();
    const response = await axios.get(`/api/organization/${realm}`);
    setSettings(response.data.fiscalYearQuarters);
  };

  const getAuditPlanDetailsById = async () => {
    try {
      const auditPlanId = auditPeriodModal?.data?.id;
      const res = await axios.get(
        `/api/auditPlan/getAuditPlanSingle/${auditPlanId}`
      );
      const allMonthNames = getUniqueMonthNames(res?.data?.auditPlanEntityWise);
   

      const sortedMonthNames = sortMonthNames(allMonthNames);

      setAuditPeriodOptions(
        sortedMonthNames?.map((item: any) => ({ label: item, value: item }))
      );
      setAuditPlanData({
        auditName: res.data.auditName,
        year: res.data.auditYear,
        status: res.data.status,
        isDraft: res.data.isDraft,
        location: {
          id: res.data.locationId,
          locationName: res.data.location,
        },
        checkOn: false,
        locationId: res.data.locationId,
        createdBy: res.data.createdBy,
        auditTypeName: res.data.auditTypeName,
        // createdOn: convertDate(res.data.createdAt),
        auditType: res.data.auditType,
        planType: res.data.planType,
        // lastModified: convertDate(res.data.updatedAt),
        systemType: res.data.systemTypeId,
        systemName:
          res.data.locationId === ""
            ? res.data.systemMaster
            : res.data.systemMaster.map((value: any) => value._id),
        prefixSuffix: res.data.prefixSuffix,
        scope: {
          id: res.data.entityTypeId,
          name: res.data.entityType,
        },
        // scope: res.data,
        // role: res.data,
        auditPlanId: res.data.id,
        role: res.data.roleId,
        auditorCheck: res.data.auditorCheck,
        comments: res.data.comments,
        AuditPlanEntitywise: res.data.auditPlanEntityWise.map((obj: any) => ({
          id: obj.id,
          entityId: obj.entityId,
          name: obj.entityName,
          months: obj.auditSchedule,
          auditors: obj.auditors,
          auditPlanId: obj.auditPlanId,
          deleted: obj.deleted,
        })),
      });
      setAuditPlanEntityWise(res?.data?.auditPlanEntityWise); // Store the auditPlanEntityWise data in the state
    } catch (error) {}
  };

  const handleEditFinalizedDate = (record: any) => {
    navigate(
      `/audit/auditplan/auditplanform/${auditPeriodModal?.data?.id}?auditplanunitwiseId=${record?._id}`
    );
  };

  const getAllFinalisedDatesByMonthName = async (monthName: any) => {
    try {
      const res = await axios.get(
        `/api/auditPlan/getAllFinalizedDatesByMonthName?month=${monthName}&orgId=${userDetails?.organizationId}&auditPlanId=${auditPeriodModal?.data?.id}`
      );
      console.log("checkauditnew res getAllFInalisedDatesByMonthName-->", res);
      if (res.status === 200) {
        if (res.data?.length) {
          setIsLoading(false);
          // Combine data from both APIs
          const combinedData = auditPlanEntityWise
            .filter(
              (entity: any) =>
                entity.monthNames.includes(monthName) && !entity.deleted
            )
            .map((entity: any) => {
              const existingData = res?.data?.find(
                (data: any) => data.id === entity.entityId
              );
              return {
                unitDetails: {
                  id: entity.entityId,
                  locationName: entity.entityName,
                },
                id: entity.entityId,
                auditPlans: existingData ? existingData.auditPlans : [],
              };
            });

          setAuditPeriodTableData(combinedData);
          // setAuditPeriodTableData(res.data);
        } else {
          const allUnitsData = auditPlanEntityWise
            .filter(
              (entity: any) =>
                entity.monthNames.includes(monthName) && !entity.deleted
            )
            .map((item: any) => ({
              unitDetails: {
                id: item.entityId,
                locationName: item.entityName,
              },
              id: item.entityId,
              auditPlans: [],
            }));
          setAuditPeriodTableData(allUnitsData);
          // setAuditPeriodTableData([]);
          setIsLoading(false);
        }
      }
    } catch (error) {
      setIsLoading(false);

      console.log("error errror in getAllFinalisedDatesByMonthName--->", error);
    }
  };

  const handleAuditPeriodChange = (value: any) => {
    setIsLoading(true);

    setSelectedAuditPeriod(value);
    getAllFinalisedDatesByMonthName(value);
  };

  const handleOpenAuditFinaliseModalCreateMode = (record: any) => {
    // console.log(
    //   "checkauditnew findauditplanentitywisedata auditplanentitywise-->",
    //   auditPlanEntityWise
    // );

    // console.log("checkauditnew auditPlanData ---->", auditPlanData);

    const findAuditPlanEntityWiseData = auditPlanEntityWise.find(
      (item: any) => record.unitDetails?.id === item.entityId
    );
    // console.log(
    //   "checkauditnew findauditplanentitywissedat",
    //   findAuditPlanEntityWiseData
    // );

    const data = {
      rowId: findAuditPlanEntityWiseData?.id,
      auditPlanId: auditPeriodModal?.data?.id,
      unitId: findAuditPlanEntityWiseData?.entityId,
      rowMonths: findAuditPlanEntityWiseData?.auditSchedule,
      unitName: record?.unitDetails?.locationName,
      format: settings,
    };
    navigate(`/audit/auditplan/auditplanform/${auditPeriodModal?.data?.id}`, {
      state: { ...data, fromAuditPlanView: true, auditPlanData: auditPlanData },
    });
  };

  const columns: any = [
    {
      title: "Unit Name",
      dataIndex: "unitDetails",
      key: "unitName",
      render: (text: any, record: any) => record?.unitDetails?.locationName,
    },
    {
      title: "Action",
      align: "right",
      fixed: "right",
      render: (text: any, record: any) => (
        <>
          {auditPeriodModal?.data?.editAccess && (
            <Tooltip title={"Create Finalized Date"}>
              <IconButton
                onClick={() => {
                  handleOpenAuditFinaliseModalCreateMode(record);
                }}
                style={{ padding: "10px" }}
              >
                <AiOutlinePlusCircle width={20} height={20} />
              </IconButton>
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  const nestedColumns = [
    {
      title: "Finalized Date",
      key: "dateRange",
      render: (text: any, record: any) =>
        `${moment(record.fromDate).format("DD-MM-YYYY")} - ${moment(
          record.toDate
        ).format("DD-MM-YYYY")}`,
    },
    {
      title: "Status",
      dataIndex: "isDraft",
      key: "status",
      render: (text: any, record: any) =>
        record?.isDraft ? "Draft" : "Finalized",
    },
    {
      title: "Name / Role / Location",
      key: "details",
      render: (text: any, record: any) => {
        // Combine all users into a single array with an additional property to indicate their role
        const userDetails = [
          ...record.auditors.map((user: any) => ({ ...user, role: "AUDITOR" })),
          ...(record.unitHead
            ? [{ ...record.unitHead, role: "Head" }]
            : []),
          ...(record.imsCoordinator
            ? [{ ...record.imsCoordinator, role: "IMSC" }]
            : []),
          ...record.otherUsers.map((user: any) => ({ ...user, role: "User" })),
        ];

        return userDetails.map((user: any, index: any) => {
          const status = user?.accepted;
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ textTransform: "capitalize" }}>
                {user?.firstname + " " + user?.lastname + ""}
              </span>{" "}
              / {user?.role} / {user?.location?.locationName} -{" "}
              {status === "ACCEPTED" ? (
                <MdCheckCircle />
              ) : status === "REJECTED" ? (
                <MdCancel />
              ) : (
                <MdHourglassEmpty />
              )}
            </div>
          );
        });
      },
    },
    {
      title: "Action",
      render: (text: any, record: any) => (
        <>
          {/* {auditPeriodModal?.data?.editAccess && ( */}
            <Tooltip title={"Edit Finalized Date"}>
              <IconButton
                onClick={() => {
                  handleEditFinalizedDate(record);
                }}
                style={{ padding: "10px" }}
              >
                <CustomEditICon width={20} height={20} />
              </IconButton>
            </Tooltip>
          {/* )} */}
        </>
      ),
    },
  ];

  return (
    <div>
      <Modal
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          ></div>
        }
        centered
        open={auditPeriodModal.open}
        onCancel={() =>
          setAuditPeriodModal({
            ...auditPeriodModal,
            data: null,
            open: false,
          })
        }
        // onOk={toggleFinaliseDateModal}
        width={"85%"}
        footer={null}
        // maskClosable={false}
        className={classes.modalContent}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10%",
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <>
            <Form.Item
              label="Audit Period"
              style={{
                color: "#003566",
                fontSize: "0.875rem",
                flex: 1, // This makes sure the Form.Item takes the remaining available space
                marginRight: "10px", // Adds some spacing between the RangePicker and the button
              }}
            >
              <AntdSelect
                allowClear
                style={{ width: "200px" }}
                placeholder="Select Audit Period"
                value={selectedAuditPeriod}
                onChange={(value) => handleAuditPeriodChange(value)}
                options={auditPeriodOptions}
              />
            </Form.Item>

            <div className={classes.tableContainer}>
              <Table
                columns={columns}
                dataSource={auditPeriodTableData}
                pagination={false}
                rowKey="id"
                expandable={{
                  expandedRowRender: (record: any) => {
                    return (
                      <Table
                        className={classes.subTableContainer}
                        style={{
                          //   width: 1200,
                          paddingBottom: "20px",
                          //   paddingTop: "20px",
                        }}
                        columns={nestedColumns}
                        bordered
                        dataSource={record?.auditPlans}
                        pagination={false}
                      />
                    );
                  },
                  expandIcon,
                }}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AuditPeriodModal;

/**
   <Form.Item
                    label="Audit Period"
                    style={{
                      color: "#003566",
                      fontSize: "0.875rem",
                      flex: 1, // This makes sure the Form.Item takes the remaining available space
                      marginRight: "10px", // Adds some spacing between the RangePicker and the button
                    }}
                  >
                    <AntdSelect
                      allowClear
                      style={{ width: "200px" }}
                      placeholder="Select Audit Period"
                      value={selectedAuditPeriod}
                      onChange={(value) => setSelectedAuditPeriod(value)}
                      options={auditPeriodOptions}
                    />
                  </Form.Item>
 */
