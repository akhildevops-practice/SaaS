import React, { useState } from "react";
import { IconButton, Paper, Typography, makeStyles } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
// import PersonIcon from "@material-ui/icons/Person";
// import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import {
  MdLabel,
  MdPerson,
  MdCalendarToday,
  MdDelete,
  MdEdit,
  MdListAlt,
  MdOutlineAddBox,
  MdAssessment,
  MdOutlineEventAvailable,
  MdOutlinePictureAsPdf,
} from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import {
  Button,
  Col,
  DatePicker,
  Modal,
  Popover,
  Row,
  Select,
  Tooltip,
} from "antd";
import { getAuditForPdf } from "apis/auditApi";
import formatDateTime from "utils/formatDateTime";
import printJS from "print-js";
import { LuCalendar, LuTag } from "react-icons/lu";
import { BsPerson } from "react-icons/bs";
import { IoMdInformationCircleOutline } from "react-icons/io";

// ...imports remain unchanged

const useStyles = makeStyles(() => ({
  boardContainer: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "18px",
    width: "100%",
    whiteSpace: "nowrap",
  },
  headingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  column: {
    width: "32%",
    backgroundColor: "#fafafa",
    flexShrink: 0,
  },
  columnHeader: {
    height: "50px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px 12px 34px",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
    // backgroundColor: "red",
  },
  label: {
    fontFamily: "Poppins",
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: 1,
    textAlign: "left",
  },
  Heading: {
    fontFamily: "Roboto",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: 1.5,
    color: "#09090b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "180px",
  },
  infoRightCustom: {
    display: "flex",
    alignItems: "center",
    gap: "0px",
    // marginLeft: "12px",
  },
  infoIconButtonCustom: {
    // padding: "4px",
    color: "#1f2937",
    "& svg": {
      fontSize: "16px",
    },
  },
  taskContainer: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
    margin: "12px 15px",
    padding: "15px",
  },
  header: {
    color: "#fff",
    fontWeight: 600,
    fontSize: "14px",
    borderRadius: "6px",
    padding: "5px 10px",
    marginBottom: "8px",
  },
  infoRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: "8px",
  },
  iconAndText: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  icon: {
    fontSize: "14px",
    color: "#4b5563",
    fontWeight: 500,
  },
  icon2: {
    fontSize: "14px",
    color: "white",
    fontWeight: 500,
  },
  labelText: {
    fontSize: "14px",
    color: "#4b5563",
    fontWeight: 500,
    width: "50%",
  },
  labelText2: {
    fontSize: "14px",
    color: "white",
    fontWeight: 500,
    // width: "50%",
  },
  valueTextContainer: {
    width: "50%",
    display: "flex",
    justifyContent: "end",
    flexDirection: "row",
  },
  valueText: {
    width: "fit-content",
    display: "flex",
    justifyContent: "start",
    fontSize: "14px",
    color: "#09090b",
    textAlign: "left",
  },
  valueText2: {
    width: "fit-content",
    display: "flex",
    justifyContent: "start",
    fontSize: "14px",
    color: "white",
    textAlign: "left",
  },
  spanText: {
    fontFamily: "Poppins",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: 1,
    color: "#000",
  },
  backgroundNumber: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "4px 11px",
    borderRadius: "9999px",
    backgroundColor: "#fff",
  },
}));

const columnColors: any = {
  Planned: {
    headerBg: "rgba(3, 105, 161, 0.15)",
    labelColor: "#0369a1",
  },
  Scheduled: {
    headerBg: "rgba(217, 119, 6, 0.15)",
    labelColor: "#92400e",
  },
  Completed: {
    headerBg: "#16a34a26",
    labelColor: "#166534",
  },
};

function AuditPlanAll({
  boardDatas,
  userDetails,
  monthName,
  getAllData,
  createAuditScheduleForAll,
  createSchedule,
  editScheduleDataForAll,
}: any) {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setselectedId] = useState(null);
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };
  const [progress, setProgress] = useState(10);
  const [progressModel, setProgressModel] = useState(false);
  const formatDate = (date: any) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `/api/auditSchedule/deleteAuditScheduleById/${selectedId}`
      );
      enqueueSnackbar("Successfully deleted audit schedule entity data.", {
        variant: "success",
      });
      setIsDeleteModalOpen(false);
      setselectedId(null);
      getAllData();
    } catch {
      enqueueSnackbar("Something went wrong.", { variant: "error" });
    }
  };

  const deleteAuditPlanData = async (item: any) => {
    try {
      await axios.patch(`/api/auditPlan/updateDataofDropDown/false`, {
        index: monthName,
        auditPlanentityId: item?.entityId,
        auditPlanId: item?.auditPlanId,
      });
      getAllData();
    } catch {}
  };
  const reportHtmlFormatG = `
  <div>
  <style>
    * {
  font-family: "poppinsregular", sans-serif !important;
    }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
        }
    
        td,
        th {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
        }
        
  </style>

  <table>
    <tr>
    <td style="width : 100px;">
    ${
      logo
        ? `<img src="${logo}" alt="Hindalco Logo" width="100px" height="100px" />`
        : ""
    }
</td>
      <td colspan="3" style="text-align : center; margin : auto; font-size : 22px; font-weight : 600; letter-spacing : 0.6px">
        HINDALCO INDUSTRIES LIMITED<br /> 
        INTERNAL AUDIT REPORT
      
      </td>
    </tr>
    <tr>
      <td colspan="2">
       
        <b> AUDITOR(s): </b> 
         %AUDITORS%
       
      </td>
      <td colspan="2">
    
        <b> AUDITTEE: </b>   %AUDITEE% 
      </td>
    </tr>
    <tr>
      <td colspan="4">
    
        <b> Corp. Function/SBU/ Unit/Department Audited: </b>   %LOCATION/ENTITY% 
      </td>
    </tr>
    <tr>
      <td colspan="3">
     
        <b> Audit Name : </b>  %AUDITNAME%
      </td>

      <td colspan="1">
      
        <b> Audit No. : </b>   %AUDITNUMBER% 
      </td>
    </tr>

    <tr>
      <td colspan="2">
     
        <b> Audit Date : </b>  %DATE%
      </td>

      <td colspan="2">
     
      <b> Status : </b> %STATUS%
      </td>

      
    </tr>
  </table>`;

  const tableHtmlFormat = `<table>
    <tr>
      <th>%NUMBER%</th>
      <th colspan="5">%TITLE%</th>
    </tr>
    <tr>
      <th width="4%">Sr.No</th>
      <th width="48%">Findings Details</th>
      <th width="24%">Clause Number</th>
      <th width="24%">Reference</th>
    </tr>
    %CONTENT%
   </table>`;

  const endHtmlFormat = `<table>
    <tr>
      <td> <b>Audit Report Comments</b></td>
    </tr>
    <tr>
      <td colspan="4">
        %COMMENT%
      </td>
    </tr>
  </table>
  </div>`;
  const nameConstruct = (data: any) => {
    if (data?.hasOwnProperty("documentNumbering")) {
      return data?.documentNumbering;
    } else if (data?.hasOwnProperty("type")) {
      return data?.name;
    } else if (data?.jobTitle) {
      return data?.jobTitle;
    }
  };

  const getAuditData = async (id: string) => {
    const htmlData = await getAuditForPdf(id).then(async (response: any) => {
      const formattedDateTime = formatDateTime(response.data.date).split(
        "T"
      )[0];
      const uniqueFindingsObject: Record<string, any[]> = {};
      let count = 0;

      response?.data?.sections?.forEach((section: any) => {
        section?.sections.forEach((sections: any) => {
          sections?.fieldset.forEach((field: any) => {
            const fieldType = field?.nc?.type;
            if (fieldType) {
              if (!uniqueFindingsObject[fieldType]) {
                uniqueFindingsObject[fieldType] = [];
              }
              uniqueFindingsObject[fieldType].push(field.nc);
            }
          });
        });
      });

      const pdfData = {
        auditType: response.data.auditType,
        system: response.data.system,
        auditors: response.data.auditors,
        location: response.data.location.locationName,
        auditNumber: response.data.auditNumber,
        auditYear: response.data.auditYear,
        auditName: response.data.auditName,
        date: formattedDateTime,
        auditedEntity: response?.data?.auditedEntity?.entityName,
        auditees: response?.data?.auditees,
        findings: uniqueFindingsObject,
        comment: response?.data?.comment || "",
        draft: response?.data?.isDraft,
      };

      let fillTemplate = reportHtmlFormatG
        .replace(
          "%AUDITORS%",
          pdfData?.auditors
            ?.map((item: any) => item.firstname + " " + item.lastname)
            .join(", ") ?? "-"
        )
        .replace(
          "%AUDITEE%",
          pdfData?.auditees
            ?.map((item: any) => item.firstname + " " + item.lastname)
            .join(", ") ?? "-"
        )
        .replace(
          "%LOCATION/ENTITY%",
          pdfData?.location + " / " + pdfData?.auditedEntity
        )
        .replace("%STATUS%", pdfData?.draft === true ? "Draft" : "Published")
        .replace("%AUDITNUMBER%", pdfData?.auditNumber)
        .replace(
          "%DATE%",
          pdfData?.date.split("-")[2] +
            "-" +
            pdfData?.date.split("-")[1] +
            "-" +
            pdfData?.date.split("-")[0]
        )
        .replace("%AUDITNAME%", pdfData?.auditName);

      Object.entries(pdfData.findings).forEach(([type, fields]) => {
        fillTemplate =
          fillTemplate +
          tableHtmlFormat
            .replace("%NUMBER%", (++count).toString())
            .replace("%TITLE%", type)
            .replace(
              "%CONTENT%",
              fields && fields.length
                ? fields
                    .map((nc: any, index: any) => {
                      const ncRef = nc.reference
                        ?.map((ref: any) => nameConstruct(ref))
                        .join(", ");
                      const ncHtml = `
                          <tr key={index}>
                            <td>${index + 1})</td>
                            <td>${nc.comment ? nc.comment : "N/A"}</td>
                            <td>${nc?.clause ? nc?.clause?.clauseName : ""}</td>
                            <td>${ncRef ? ncRef : ""}</td>
                          </tr>
                          <tr key={index}>
                            <th colspan="1"></th>
                            <th colspan="3" style="text-align: left;">
                              Evidence
                            </th>
                          </tr>
                          `;
                      let imageHtml = "";
                      const evidenceHtml = nc.evidence
                        ?.map((item: any) => {
                          const attFileName: any[] = [];
                          if (item.attachment && item.attachment.length > 0) {
                            if (
                              process.env.REACT_APP_IS_OBJECT_STORAGE === "true"
                            ) {
                              imageHtml = item.attachment
                                ?.map((attachment: any) => {
                                  attFileName.push(attachment.name);
                                  if (
                                    attachment.obsUrl
                                      .toLowerCase()
                                      .endsWith(".png") ||
                                    attachment.obsUrl
                                      .toLowerCase()
                                      .endsWith(".jpg")
                                  ) {
                                    return `<img src="${attachment.obsUrl}" alt="Description of the image" width="356" height="200" style="margin-right: 40px; margin-bottom: 5px;">`;
                                  }
                                })
                                .join("");
                            } else {
                              imageHtml = item.attachment
                                ?.map((attachment: any) => {
                                  attFileName.push(attachment.name);
                                  if (
                                    attachment.url
                                      .toLowerCase()
                                      .endsWith(".png") ||
                                    attachment.url
                                      .toLowerCase()
                                      .endsWith(".jpg")
                                  ) {
                                    return `<img src="${attachment.url}" alt="Description of the image" width="356" height="200" style="margin-right: 40px;">`;
                                  }
                                })
                                .join("");
                            }
                            return `
                              <tr key={index}>
                                <td colspan="1"></td>
                                <td colspan="3" style="text-align: left;">
                                  ${item.text}<br><br>
                                  <strong>Attached Files:</strong> ${attFileName.join(
                                    ",  "
                                  )}<br>
                                  ${imageHtml}
                                </td>
                              </tr>
                            `;
                          } else {
                            return `
                              <tr key={index}>
                                <td colspan="1"></td>
                                <td colspan="3" style="text-align: left;">
                                  ${item.text}
                                </td>
                              </tr>
                            `;
                          }
                        })
                        .join("");
                      return ncHtml + (evidenceHtml ? evidenceHtml : "");
                    })
                    .join("")
                : `
                        <tr style="background-color: #ffa07a; text-align: center;" >
                          <td colspan="4" style="margin: auto;"> No Data Found  </td>
                        </tr>
                        `
            );
      });

      fillTemplate =
        fillTemplate +
        endHtmlFormat.replace("%COMMENT%", pdfData?.comment ?? "-");

      return fillTemplate;
    });
    return htmlData;
  };

  const handleGetAllAuditReports = async (val: any) => {
    setProgress(10);
    setProgressModel(true);
    let consolidated = "";
    const getAllAuditReports = await axios.get(
      `/api/audits/getAllAuditReports/${val.id}`
    );
    const allIds = getAllAuditReports.data.map(
      (item: { _id: any }) => item._id
    );
    for (let i = 0; i < allIds.length; i++) {
      const tempalte = await getAuditData(allIds[i]);
      consolidated += tempalte;
      if (i < allIds.length - 1) {
        consolidated += '<div style="page-break-before: always;"></div>';
      }
    }
    if (consolidated.trim() !== "") {
      printJS({
        type: "raw-html",
        printable: consolidated,
      });
    } else {
      enqueueSnackbar(`No Audit Report for this Audit Schedule`, {
        variant: "error",
      });
    }
    setProgress(100);
  };

  return (
    <>
      <div className={classes.boardContainer}>
        {boardDatas?.map((value: any) => {
          const colors = columnColors[value?.label] || {};
          return (
            <Paper elevation={0} className={classes.column} key={value?.label}>
              <div
                className={classes.columnHeader}
                style={{ backgroundColor: colors.headerBg }}
              >
                <Typography
                  className={classes.label}
                  style={{ color: colors.labelColor }}
                >
                  {value.label}
                </Typography>
                <div className={classes.backgroundNumber}>
                  <span className={classes.spanText}>
                    {String(value?.data?.length ?? 0).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {value?.data?.map((item: any) => (
                <div key={item.id} className={classes.taskContainer}>
                  <div className={classes.headingRow}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className={classes.Heading}>{item?.name}</span>
                      {value.label !== "Planned" && (
                        <Popover
                          // title="Schedule Info"
                          overlayInnerStyle={{
                            width: 300,
                            backgroundColor: "#000000c0",
                            color: "white",
                          }}
                          content={
                            <>
                              <div className={classes.infoRow}>
                                <div className={classes.iconAndText}>
                                  {" "}
                                  <MdPerson className={classes.icon2} />
                                  <span className={classes.labelText2}>
                                    Auditor :
                                  </span>
                                </div>

                                <span className={classes.valueText2}>
                                  {item?.auditScheduleData?.[0]?.auditor
                                    ?.map(
                                      (v: any) =>
                                        `${v?.firstname} ${v?.lastname}`
                                    )
                                    .join(" , ") || "N/A"}
                                </span>
                              </div>
                              <div className={classes.infoRow}>
                                <div className={classes.iconAndText}>
                                  {" "}
                                  <MdPerson className={classes.icon2} />
                                  <span className={classes.labelText2}>
                                    Auditee :
                                  </span>
                                </div>

                                <span className={classes.valueText2}>
                                  {item?.auditScheduleData?.[0]?.auditee
                                    ?.map(
                                      (v: any) =>
                                        `${v?.firstname} ${v?.lastname}`
                                    )
                                    .join(" , ") || "N/A"}
                                </span>
                              </div>
                              <div className={classes.infoRow}>
                                <div className={classes.iconAndText}>
                                  {" "}
                                  <MdCalendarToday className={classes.icon2} />
                                  <span className={classes.labelText2}>
                                    Scheduled :
                                  </span>
                                </div>

                                <span className={classes.valueText2}>
                                  {formatDate(
                                    item?.auditScheduleData?.[0]?.time
                                  )}
                                </span>
                              </div>
                            </>
                          }
                          trigger="click"
                        >
                          <IoMdInformationCircleOutline
                            style={{
                              marginLeft: 8,
                              color: "#000000d9",
                              cursor: "pointer",
                              fontSize: "16px",
                            }}
                          />
                        </Popover>
                      )}
                    </div>

                    <div className={classes.infoRightCustom}>
                      {value.label === "Planned" &&
                        item.scheduleAccess &&
                        !item?.isScheduleCreated && (
                          <IconButton
                            size="small"
                            className={classes.infoIconButtonCustom}
                            onClick={() =>
                              createAuditScheduleForAll({
                                ...item,
                                id: item?.entityId,
                                monthName,
                              })
                            }
                          >
                            <MdListAlt />
                          </IconButton>
                        )}
                      {value.label === "Scheduled" &&
                        !item?.isAuditReportCreated &&
                        createSchedule && (
                          <IconButton
                            size="small"
                            className={classes.infoIconButtonCustom}
                            onClick={() =>
                              editScheduleDataForAll({
                                ...item,
                                id: item?.entityId,
                                monthName,
                              })
                            }
                          >
                            <MdEdit />
                          </IconButton>
                        )}
                      {value.label === "Scheduled" &&
                        item?.auditScheduleData?.[0]
                          ?.isUserAbleToCreateReport &&
                        item?.isScheduleCreated &&
                        !item?.isAuditReportCreated && (
                          <IconButton
                            size="small"
                            className={classes.infoIconButtonCustom}
                            onClick={() =>
                              navigate("/audit/auditreport/newaudit", {
                                state: {
                                  auditScheduleId: item.scheduleId,
                                  entityName: item.name,
                                  disableFields: true,
                                  auditScheduleName: "",
                                },
                              })
                            }
                          >
                            <MdOutlineAddBox />
                          </IconButton>
                        )}
                      {item.hasOwnProperty("scheduleId") &&
                        item.scheduleId !== "" &&
                        item.isScheduleCreated && (
                          <div
                            style={{
                              fontSize: "12px",
                              margin: "0px 0px",
                              display: "flex",
                            }}
                          >
                            <Tooltip
                              title={`Click to View Audit Schedule Report PDF`}
                            >
                              <Button
                                style={{
                                  border: "2px",
                                  borderRadius: "20%",
                                  padding: "0px 0px",
                                  margin: "0px 4px 0px 0px",
                                  color: "#000000d9",
                                }}
                                onClick={() => {
                                  handleGetAllAuditReports({
                                    id: item?.scheduleId,
                                  });
                                }}
                              >
                                {" "}
                                <MdOutlinePictureAsPdf
                                  style={{ fontSize: "20px" }}
                                />
                              </Button>
                            </Tooltip>

                            <Tooltip title={`Click to View Audit Schedule`}>
                              <Button
                                style={{
                                  border: "2px",
                                  borderRadius: "20%",
                                  padding: "0px 0px",
                                  margin: "0px 4px 0px 0px",
                                  color: "#000000d9",
                                }}
                                onClick={() => {
                                  if (item.isScheduleCreated) {
                                    window.open(
                                      `/audit/auditschedule/auditscheduleform/schedule/${item?.scheduleId}`,
                                      "_blank"
                                    );
                                  }
                                }}
                              >
                                {" "}
                                <MdOutlineEventAvailable
                                  style={{ fontSize: "20px" }}
                                />
                              </Button>
                            </Tooltip>

                            {item.isAuditReportCreated && (
                              <Tooltip title={`Click to View Audit Report`}>
                                <Button
                                  style={{
                                    border: "2px",
                                    borderRadius: "20%",
                                    padding: "0px 0px",
                                    margin: "0px 4px 0px 0px",
                                    color: "#000000d9",
                                  }}
                                  onClick={() => {
                                    if (item.isAuditReportCreated) {
                                      window.open(
                                        `/audit/auditreport/newaudit/${item?.auditorReportId}`,
                                        "_blank"
                                      );
                                    }
                                  }}
                                >
                                  {" "}
                                  <MdAssessment style={{ fontSize: "20px" }} />
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        )}
                      {value.label !== "Completed" && (
                        <IconButton
                          size="small"
                          className={classes.infoIconButtonCustom}
                          style={{ color: "#f74c4cd9" }}
                          onClick={() => {
                            if (value.label === "Planned") {
                              deleteAuditPlanData(item);
                            } else {
                              setIsDeleteModalOpen(true);
                              setselectedId(
                                item?.auditUnitReport?.[0]
                                  ?.auditScheduleEntityData?._id
                              );
                            }
                          }}
                        >
                          <RiDeleteBin6Line />
                        </IconButton>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className={classes.infoRow}>
                      <div className={classes.iconAndText}>
                        <LuTag className={classes.icon} />
                        <span className={classes.labelText}>Type:</span>
                      </div>
                      <div className={classes.valueTextContainer}>
                        <span className={classes.valueText}>
                          {item?.auditTypeName || ""}
                        </span>
                      </div>
                    </div>
                    <div className={classes.infoRow}>
                      <div className={classes.iconAndText}>
                        {" "}
                        <BsPerson className={classes.icon} />
                        <span className={classes.labelText}>Created by:</span>
                      </div>
                      <div className={classes.valueTextContainer}>
                        <span className={classes.valueText}>
                          {item?.createdBy || "vs"}
                        </span>
                      </div>
                    </div>
                    <div className={classes.infoRow}>
                      <div className={classes.iconAndText}>
                        {" "}
                        <LuCalendar className={classes.icon} />
                        <span className={classes.labelText}>Created on:</span>
                      </div>
                      <div className={classes.valueTextContainer}>
                        {" "}
                        <span className={classes.valueText}>
                          {formatDate(item?.createdAt || "2025-04-24")}
                        </span>
                      </div>
                    </div>

                    {/* {/* {value.label !== "Planned" && (
                      <>
                        <div className={classes.infoRow}>
                          <div className={classes.iconAndText}>
                            {" "}
                            <MdPerson className={classes.icon} />
                            <span className={classes.labelText}>Auditor :</span>
                          </div>

                          <span className={classes.valueText}>
                            {item?.auditScheduleData?.[0]?.auditor
                              ?.map(
                                (v: any) => `${v?.firstname} ${v?.lastname}`
                              )
                              .join(" , ") || "N/A"}
                          </span>
                        </div>
                        <div className={classes.infoRow}>
                          <div className={classes.iconAndText}>
                            {" "}
                            <MdPerson className={classes.icon} />
                            <span className={classes.labelText}>Auditee :</span>
                          </div>

                          <span className={classes.valueText}>
                            {item?.auditScheduleData?.[0]?.auditee
                              ?.map(
                                (v: any) => `${v?.firstname} ${v?.lastname}`
                              )
                              .join(" , ") || "N/A"}
                          </span>
                        </div>
                        <div className={classes.infoRow}>
                          <div className={classes.iconAndText}>
                            {" "}
                            <MdCalendarToday className={classes.icon} />
                            <span className={classes.labelText}>
                              Scheduled :
                            </span>
                          </div>

                          <span className={classes.valueText}>
                            {formatDate(item?.auditScheduleData?.[0]?.time)}
                          </span>
                        </div>
                      </>
                    )} */}
                  </div>
                </div>
              ))}
            </Paper>
          );
        })}
      </div>

      <Modal
        title="Confirm Deletion"
        open={isDeleteModalOpen}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this audit schedule?</p>
      </Modal>
    </>
  );
}

export default AuditPlanAll;
