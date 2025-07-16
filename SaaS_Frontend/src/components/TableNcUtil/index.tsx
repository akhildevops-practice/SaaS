import React, { useEffect, useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import { Tooltip, Typography } from "@material-ui/core";
import { ReactComponent as EditIcon } from "../../assets/documentControl/Edit.svg";

import { useNavigate } from "react-router";
import checkRole from "../../utils/checkRoles";
import CloseIconImageSvg from "assets/documentControl/Close.svg";

import { Modal, Table, Tag } from "antd";
import { ncSummaryObservationType, ncSummarySchema } from "schemas/ncSummary";
import { Link } from "react-router-dom";
import useStyles from "./styles";
import MultiUserDisplay from "components/MultiUserDisplay";
import { newRoles } from "utils/enums";
import axios from "apis/axios.global";
import { MdOutlineWarning } from 'react-icons/md';
// import { userInfo } from "os";

interface Props {
  count: number;
  isDraft: boolean;
  id: number;
  auditorName?: [];
  auditTypeId?: any;
  auditLocation?: any;
}

/**
 * @method TableNcUtil
 * @description Functional component to generate the closure count as well as the draft icon
 * @param count {number}
 * @param isDraft {boolean}
 * @returns
 */
export default function TableNcUtil({
  count,
  isDraft,
  id,
  auditorName,
  auditTypeId,
  auditLocation,
}: Props) {
  const navigate = useNavigate();
  const classes = useStyles();
  const isAuditor = checkRole("AUDITOR");
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const isMR = checkRole("MR");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ncObsData, setNcObsData] = useState<ncSummarySchema[]>();
  const [type, setType] = useState("");
  const [capaData, setCapaData] = useState<any>([]);
  const [isAccess, setIsAccess] = useState<boolean>(false);

  useEffect(() => {
    const auditors = auditorName?.map((item: any) => {
      return item.username;
    });
    if (
      isOrgAdmin ||
      (auditors?.includes(userInfo?.userName) && isAuditor) ||
      (isMR && auditLocation?.locationName === userInfo?.location?.locationName)
    ) {
      setIsAccess(true);
    }
  }, []);

  const getData = async () => {
    const data: any = await axios.get(
      `api/audits/getNcDataByAuditId?id=${id}&auditTypeId=${auditTypeId}`
    );
    setType(data?.data?.type);
    if (data?.data?.type === "cara") {
      setCapaData(data?.data?.nc);
    } else {
      const parsedData = dataParser(data?.data?.nc);
      setNcObsData(parsedData);
    }
  };
  useEffect(() => {
    if (isModalVisible === true) {
      getData();
    }
  }, [isModalVisible]);

  const ncObsColumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (ncObsId: any, record: any, index: any) => {
        if (index === 0) {
          return (
            <>
              <Link
                to={record.ncObsId.props.to}
                className="makeStyles-link-216"
                target="_blank"
              >
                {record.type}
              </Link>
            </>
          );
        }
        return (
          <>
            <Link
              to={record.ncObsId.props.to}
              className="makeStyles-link-216"
              target="_blank"
            >
              {record.type}
            </Link>
          </>
        );
      },
    },
    {
      title: "Findings",
      dataIndex: "ncObsId",
      key: "ncObsId",
      // render: (ncObsId: any) => (
      //   <Link to={ncObsId.props.to} className="makeStyles-link-216">
      //     {ncObsId.props.children}
      //   </Link>
      // ),
    },

    {
      title: "Department",
      dataIndex: "entity",
      key: "entity",
    },
    {
      title: "Audit Name",
      dataIndex: "auditName",
      key: "auditName",
    },
    {
      title: "System",
      dataIndex: "systemName",
      key: "systemName",
      render: (system: any) => <MultiUserDisplay data={system} name="name" />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        if (record.status === "OPEN") {
          return (
            <Tag
              style={{ backgroundColor: "#c9e4de", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "ACCEPTED") {
          return (
            <Tag
              style={{ backgroundColor: "#c6def1", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "REJECTED") {
          return (
            <Tag
              style={{ backgroundColor: "#edcad1", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "VERIFIED") {
          return (
            <Tag
              style={{ backgroundColor: "#dbcdf0", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "CLOSED") {
          return (
            <Tag
              style={{ backgroundColor: "#f2c6de", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "AUDITORREVIEW") {
          return (
            <Tag
              // color="#b1d1ef"
              style={{ backgroundColor: "#b1d1ef", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "IN_PROGRESS") {
          return (
            <Tag
              // color="#b1d1ef"
              style={{ backgroundColor: "#96EFFF", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else return record.status;
      },
    },
    {
      title: "Pending With",
      dataIndex: "currentlyUnder",
      key: "currentlyUnder",
      render: (name: any) => newRoles[name],
    },
    {
      title: "Auditor",
      dataIndex: "auditor",
      key: "auditor",
      render: (auditor: any) => <MultiUserDisplay data={auditor} name="name" />,
    },
    {
      title: "Auditee",
      dataIndex: "auditees",
      key: "auditees",
      render: (auditees: any) => (
        <MultiUserDisplay data={auditees} name="name" />
      ),
    },
  ];
  const getStatusColor = (status: any) => {
    switch (status) {
      case "Open":
        return "#b3d9ff";
      case "Accepted":
        return "#ccffe6";
      case "Rejected":
        return "#ffe6e6";
      case "Analysis_In_Progress":
        return "#ffffcc";
      case "Outcome_In_Progress":
        return "#ffffb3";
      case "Draft":
        return "#e6f2ff";

      case "Closed":
        return "#ccccff";
      default:
        return "";
    }
  };
  const columns: any = [
    {
      title: "Problem Statement",
      dataIndex: "title",
      width: 200,
      render: (_: any, data: any, index: number) => (
        <>
          <div
            style={{
              textDecoration: "underline",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            {data?.highPriority && (
              <MdOutlineWarning style={{ marginRight: 5 ,color:'red'}} />
            )}
            <span>{data?.title}</span>
          </div>
        </>
      ),
    },

    {
      title: "Type",
      dataIndex: "typeData",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.typeData}
          </div>
        </div>
      ),
    },

    {
      title: "Origin",
      dataIndex: "origin",
      width: 80,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.origin?.deviationType}
          </div>
        </div>
      ),
    },

    {
      title: "Unit",
      dataIndex: "locationId",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.locationDetails?.locationName}
          </div>
        </div>
      ),
    },
    {
      title: "Registered By",
      dataIndex: "registeredBy",
      width: 100,
      render: (_: any, data: any, index: number) => (
        <>
          <div>
            {data?.registeredBy?.firstname && data?.registeredBy.lastname
              ? data?.registeredBy?.firstname +
                " " +
                data?.registeredBy?.lastname
              : null}
          </div>
        </>
      ),
    },

    // {
    //   title: "CAPA Owner",
    //   dataIndex: "caraOwner",
    //   width: 100,
    //   render: (_: any, record: any) => (
    //     <div
    //       style={{
    //         width: 100,
    //       }}
    //     >
    //       <div
    //       // style={{
    //       //   whiteSpace: "nowrap",
    //       //   overflow: "hidden",
    //       //   textOverflow: "ellipsis",
    //       // }}
    //       >
    //         {record?.caraOwner?.firstname
    //           ? record?.caraOwner?.firstname + " " + record.caraOwner.lastname
    //           : null}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Resp Entity",
      dataIndex: "entityId",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.entityId?.entityName}
          </div>
        </div>
      ),
    },

    {
      title: "Created Date",
      dataIndex: "createdAt",
      width: 100,
      render: (text: any, data: any, index: number) => {
        // console.log("data.createdAt", data?.createdAt);

        if (data?.createdAt) {
          const createdAtDate = new Date(data?.createdAt); // Ensure it's a Date object

          // Format the date to dd-mm-yyyy
          const day = String(createdAtDate.getDate()).padStart(2, "0");
          const month = String(createdAtDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so we add 1
          const year = createdAtDate.getFullYear();

          const formattedDate = `${day}-${month}-${year}`;

          return <span>{formattedDate}</span>;
        }
      },
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
            {data?.status === "Open" && (
              <p>
                {/* {data?.deptHead
                  ?.map((head: any) => head?.firstname + " " + head?.lastname)
                  .join(", ")} */}
                {data.caraCoordinator?.username}
              </p>
            )}

            {data?.status === "Accepted" &&
              (data?.rootCauseAnalysis ? (
                // data?.deptHead?.length > 0 && (
                <p>
                  {/* {data?.deptHead
                      .map(
                        (head: any) => head?.firstname + " " + head?.lastname
                      )
                      .join(", ")} */}
                  {data.caraCoordinator?.username}
                </p>
              ) : (
                // )
                <p>
                  {data?.caraOwner?.firstname + " " + data?.caraOwner?.lastname}
                </p>
              ))}
            {data?.status === "Analysis_In_Progress" &&
              (data?.rootCauseAnalysis ? (
                // data?.deptHead?.length > 0 && (
                //   <p>
                //     {data?.deptHead
                //       .map(
                //         (head: any) => head?.firstname + " " + head?.lastname
                //       )
                //       .join(", ")}
                //   </p>
                // )
                <p>{data.caraCoordinator?.username}</p>
              ) : (
                <p>
                  {data?.caraOwner?.firstname + " " + data?.caraOwner?.lastname}
                </p>
              ))}

            {data?.status === "Outcome_In_Progress" &&
              (data?.actualCorrectiveAction ? (
                data?.caraCoordinator ? (
                  <p>{data?.caraCoordinator?.username}</p>
                ) : (
                  data?.deptHead?.length > 0 && (
                    <p>
                      {data?.deptHead
                        .map(
                          (head: any) => head?.firstname + " " + head?.lastname
                        )
                        .join(", ")}
                    </p>
                  )
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
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   width: 40,
    //   render: (_: any, data: any, index: number) => (
    //     <>
    //       <Tag
    //         style={{
    //           backgroundColor: getStatusColor(data.status),
    //           color: "black",
    //           width: "150px",
    //           textAlign: "center",
    //         }}
    //       >
    //         {data?.status}
    //       </Tag>
    //     </>
    //   ),
    // },
  ];
  const toggleLink = (
    type: ncSummaryObservationType,
    linkId: string,
    id: string
  ) => {
    // if (type === "NC") {
    return (
      <Link to={`/audit/nc/${linkId}`} className={classes.link} target="_blank">
        {id}
      </Link>
    );
    // }
    // return (
    //   <Link to={`/audit/obs/${linkId}`} className={classes.link}>
    //     {id}
    //   </Link>
    // );
  };

  const dataParser: any = (data: any) => {
    return data?.map((nc: any) => {
      const isUserAuditee = nc.auditees.some(
        (auditee: any) => auditee.id === userInfo?.id
      );
      const isUserInAuditedEntity = nc?.auditedEntityNew?.users?.some(
        (user: any) => user?.id === userInfo?.id
      );

      const auditors = nc?.auditors?.map((auditor: any) => ({
        name: auditor.firstname + " " + auditor.lastname,
      }));

      const auditees = nc?.auditees?.map((auditee: any) => ({
        name: auditee.firstname + " " + auditee.lastname,
      }));
      return {
        ncObsId: toggleLink(nc.type, nc._id, nc.id),
        id: nc._id,
        comment: nc.comment ?? "-",
        type: nc.type,
        entity: nc?.auditedEntityNew?.entityName,
        auditName: nc?.audit?.auditName || "",
        severity:
          nc.severity === "Major" ? (
            <>
              Major&nbsp;<span className={classes.red__exclamation}>!</span>
            </>
          ) : (
            nc.severity
          ),
        systemName: nc?.system,
        auditor: auditors,
        auditees: auditees,
        status: nc.status,
        access: nc.access,
        auditFindings: nc.auditFindings,
        isUserInAuditedEntity,
        isUserAuditee,
        currentlyUnder: nc?.currentlyUnder || "",
      };
    });
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={0}
        m={0}
      >
        <Tooltip title={isAccess ? "Open NC closure form" : `${count}NCs`}>
          <Typography
            variant="body2"
            color="primary"
            style={{ cursor: "pointer", paddingRight: "10px" }}
          >
            <u
              data-testid="click"
              onClick={() => {
                isDraft && isAccess
                  ? // isAccess &&
                    navigate(`/audit/auditreport/newaudit/${id}`, {
                      state: {
                        edit: true,
                        id: id,
                        moveToLast: true,
                        read: true,
                      },
                    })
                  : setIsModalVisible(true);
              }}
            >
              +{count}
            </u>
          </Typography>
        </Tooltip>

        {isDraft && isAccess && (
          <Tooltip
            title={
              isAccess ? "Open draft audit" : "You don't have access priviledge"
            }
          >
            <IconButton
              size="small"
              data-testid="auditorClick"
              onClick={() =>
                isAccess &&
                navigate(`/audit/auditreport/newaudit/${id}`, {
                  state: { edit: true, id: id, read: false },
                })
              }
            >
              {/* <img src={EditIcon} alt="Pencil Icon" /> */}
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Modal
        title={type === "cara" ? "CAPA" : "List of Findings"}
        visible={isModalVisible}
        onOk={() => {
          setIsModalVisible(false);
        }}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        width={2000} // Customize the width as needed
      >
        <Table
          dataSource={type === "cara" ? capaData : ncObsData}
          columns={type === "cara" ? columns : ncObsColumns}
          className={classes.newTableContainer}
        />
      </Modal>
    </>
  );
}
