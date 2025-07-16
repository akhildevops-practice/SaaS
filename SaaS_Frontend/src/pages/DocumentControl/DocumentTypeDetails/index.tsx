import { useEffect, useState } from "react";
import DocumentTypeData from "./DocumentTypeData";
import { IconButton, makeStyles, Theme, Tooltip } from "@material-ui/core";
import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";
import ModuleNavigation from "components/Navigation/ModuleNavigation";
import { Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import checkActionsAllowed from "utils/checkActionsAllowed";
import MultiUserDisplay from "components/MultiUserDisplay";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import DocumentDrawer from "components/Document/DocumentTable/DocumentDrawer";
import { useSetRecoilState } from "recoil";
import { processDocFormData } from "recoil/atom";
import { processDocForm } from "schemas/processDocForm";

import checkRoles from "utils/checkRoles";
import DocumentJobSummaryTab from "components/Document/DocumentJobSummaryTab";
import DocumentWorkflow from "components/Document/DocumentWorkflow";
import FormsTable from "components/Document/DocumentSettings/FormsTable";
import { useLocation } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) => ({
  docNavIconStyle: {
    width: "21px",
    height: "22px",
    // fill : "white",
    // paddingRight: "6px",
    cursor: "pointer",
  },
  actionButtonStyle: {
    minWidth: 10,
    padding: "4px",
    color: "black",
  },
  docNavDivider: {
    height: "1.4em",
    background: "gainsboro",
  },
  tableContainer: {
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    // overflowY: "hidden",
    // overflowX: "hidden !important",
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
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
    docNavDivider: {
      height: "1.4em",
      background: "gainsboro",
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
      borderBottom: "1px solid #f0f0f0",
      padding: "4px 8px !important",
    },
    "& .ant-table-wrapper .ant-table-container": {
      maxHeight: ({
        isGraphSectionVisible,
      }: {
        isGraphSectionVisible: boolean;
      }) => (isGraphSectionVisible ? "25vh" : "65vh"), // Adjust the max-height value as needed
      // [theme.breakpoints.up("lg")]: {
      //   maxHeight: ({
      //     isGraphSectionVisible,
      //   }: {
      //     isGraphSectionVisible: boolean;
      //   }) => (isGraphSectionVisible ? "33vh" : "65vh"), // Adjust the max-height value as needed for large screens
      // },
      // [theme.breakpoints.up("xl")]: {
      //   maxHeight: ({
      //     isGraphSectionVisible,
      //   }: {
      //     isGraphSectionVisible: boolean;
      //   }) => (isGraphSectionVisible ? "45vh" : "70vh"), // Adjust the max-height value as needed for extra large screens
      // },
      overflowY: "auto",
      overflowX: "hidden",
    },
    actionButtonStyle: {
      minWidth: 10,
      padding: "4px",
      color: "black",
    },
    "& .ant-table-body": {
      maxHeight: "150px", // Adjust the max-height value as needed
      overflowY: "auto",
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
      // borderRadius: 5,
      cursor: "pointer",
      transition: "all 0.1s linear",

      "&:hover": {
        backgroundColor: "white !important",
        boxShadow: "0 1px 5px 0px #0003",
        transform: "scale(1.01)",

        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },
  },
  docNavText: {
    fontSize: "16px",
    letterSpacing: "0.3px",
    lineHeight: "24px",
    textTransform: "capitalize",
    marginLeft: "5px",
  },
  documentTable: {
    // overflowX: "auto",
    // "&::-webkit-scrollbar": {
    //   width: "5px",
    //   height: "10px", // Adjust the height value as needed
    //   backgroundColor: "white",
    // },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
}));

const DocumentTypeDetails = () => {
  const [tabFilter, setTabFilter] = useState<string>("docType");
  const [currentModuleName, setCurrentModuleName] = useState("Unit Management");
  const [acitveTab, setActiveTab] = useState<any>("1");
  const classes = useStyles({ isGraphSectionVisible: false });
  const realmName = getAppUrl();
  const iconColor = "#380036";
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMr = checkRoles("MR");
  const location = useLocation();

  function DocumentTableData() {
    const [data, setData] = useState<any>([]);
    const [drawer, setDrawer] = useState<any>({
      mode: "create",
      open: false,
      clearFields: true,
      toggle: false,
      data: {},
    });
    const setFormData = useSetRecoilState(processDocFormData);

    useEffect(() => {
      setNewData();
    }, []);

    const handleEditProcessDoc = (data: any) => {
      setFormData(processDocForm);
      setDrawer({
        ...drawer,
        mode: "edit",
        clearFields: false,
        toggle: false,
        data: data,
        open: !drawer.open,
      });
      // navigate(`/processdocuments/processdocument/newprocessdocument/${data.id}`);
    };
    function formatDate(inputDate: any) {
      if (inputDate != null) {
        const date = new Date(inputDate);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return "";
    }

    const setNewData = async () => {
      const result = await axios.get(`/api/dashboard/retireDocument`);
      const arr: any[] = [];
      result.data.data.map((item: any, key: any) => {
        arr.push({
          id: item.id,
          docNumber: item.documentNumbering,
          docName: (
            <a
              href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${item.id}?versionId=${item.version}`}
              target="_blank"
              rel="noreferrer"
              // className={classes.clickableField}
            >
              {item.documentName}
            </a>
          ),
          documentName: item.documentName,
          issueNumber: item.issueNumber,
          system: item.system,
          docType: item.documentType,
          docTypeId: item.documentTypeId,
          version: item.version,
          isVersion: item.isVersion,
          Creator: item.isCreator,
          sectionName: item.sectionName,
          type: item?.type || [],
          docStatus:
            item.status === "IN_REVIEW"
              ? "For Review"
              : item.status === "REVIEW_COMPLETE"
              ? "Review Complete"
              : item.status === "IN_APPROVAL"
              ? "For Approval"
              : item.status === "AMMEND"
              ? "Amend"
              : item.status === "DRAFT"
              ? "Draft"
              : item.status === "PUBLISHED"
              ? "Published"
              : item.status === "APPROVED"
              ? "Approved"
              : item.status === "SEND_FOR_EDIT"
              ? "Send For Edit"
              : item.status === "RETIRE_INREVIEW"
              ? "Retire - In Review"
              : item.status === "RETIRE_INAPPROVE"
              ? "Retire - In Approval"
              : item.status === "RETIRE"
              ? "Retire"
              : "Obsolete",
          department: item.department,
          approvedDate: formatDate(item.approvedDate),
          location: item.location,
          pendingWith: item?.pendingWith,
          action: item.access,
          writeAction: item.isCreator,
          deleteAccess: item.deleteAccess,
          editAcess: item.editAcess,
          readAccess: item.readAccess,
          documentVersions: item?.documentVersions,
          versionDocument: item?.versionDocument,
          isAction: checkActionsAllowed(
            item?.access,
            ["View Document"],
            true
          ).concat(
            checkActionsAllowed(item?.isCreator, ["Edit", "Delete"], true)
          ),
        });
      });
      setData(arr);
    };

    const subColumns: ColumnsType<any> = [
      {
        title: "Document Number",
        dataIndex: "documentNumbering",
        key: "documentNumbering",
        width: 180,
        render: (_: any, record: any) => record.documentNumbering || "",
      },
      {
        title: "Title",
        dataIndex: "documentName",
        key: "documentName",
        width: 150,
        // sorter: (a, b) => a.documentName - b.documentName,
        render: (_: any, record: any) =>
          record.access ? (
            <div
              style={{
                textDecorationLine: "underline",
                cursor: "pointer",
                width: 250,
              }}
            >
              <div
                // className={classes.clickableField}
                onClick={() => {}}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {record.documentName}
              </div>

              {/* <a            href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${record.id}`}            target="_blank"            rel="noreferrer"            className={classes.clickableField}          >            old {record.documentName}          </a> */}
            </div>
          ) : (
            <Tooltip title={record.documentName}>
              <>{record.documentName}</>
            </Tooltip>
          ),

        // if (record.action) {
        //   <div
        //     style={{
        //       textDecorationLine: "underline",
        //       cursor: "pointer",
        //     }}
        //   >
        //     <div
        //       className={classes.clickableField}
        //       onClick={() => toggleDocViewDrawer(record)}
        //     >
        //       {record.documentName}
        //     </div>
        //     <a
        //       href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${record.id}`}
        //       target="_blank"
        //       rel="noreferrer"
        //       className={classes.clickableField}
        //     >
        //       {record.documentName}
        //     </a>
        //   </div>;
        // } else {
        //   <div
        //     style={{
        //       textDecorationLine: "underline",
        //       cursor: "pointer",
        //     }}
        //   >
        //     <div
        //       className={classes.clickableField}
        //       // onClick={() => toggleDocViewDrawer(record)}
        //     >
        //       {record.documentName}
        //     </div>
        //     {/* <a
        //       href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${record.id}`}
        //       target="_blank"
        //       rel="noreferrer"
        //       className={classes.clickableField}
        //     >
        //       {record.documentName}
        //     </a> */}
        //   </div>;
        // }
      },
      {
        title: "Document Type",
        dataIndex: "documentType",
        width: 150,
        render: (_: any, record: any) => (
          <div
            style={{
              width: 150,
            }}
          >
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {record.documentType}
            </div>
          </div>
        ),
        // filterIcon: (filtered: any) => (
        //   <FilterListIcon
        //     style={{
        //       fill: isFilterType ? iconColor : "grey",
        //       width: "0.89em",
        //       height: "0.89em",
        //     }}
        //   />
        // ),

        // filterDropdown: ({ confirm, clearFilters }: any) => {
        //   // Create a set to store unique names
        //   const uniqueNames = new Set();

        //   // Iterate through allAuditPlanDetails and add unique names to the set
        //   data?.forEach((item: any) => {
        //     const name = item.docType;
        //     uniqueNames.add(name);
        //   });

        //   // Convert the set back to an array for rendering
        //   const uniqueNamesArray = Array.from(uniqueNames);

        //   return (
        //     <div style={{ padding: 8 }}>
        //       {uniqueNamesArray.map((name: any) => (
        //         <div key={name}>
        //           {console.log(
        //             "checked",
        //             selectedDocType.includes(name),
        //             selectedDocType,
        //             name
        //           )}
        //           <label style={{ display: "flex", alignItems: "center" }}>
        //             <input
        //               type="checkbox"
        //               onChange={(e) => {
        //                 const value = e.target.value;
        //                 console.log("Targetvalue", value, name);
        //                 if (e.target.checked) {
        //                   setselectedDocType([...selectedDocType, value]);
        //                 } else {
        //                   setselectedDocType(
        //                     selectedDocType.filter((key: any) => key !== value)
        //                   );
        //                 }
        //               }}
        //               value={name}
        //               checked={selectedDocType.includes(name)} // Check if the checkbox should be checked
        //               style={{
        //                 width: "16px",
        //                 height: "16px",
        //                 marginRight: "5px",
        //               }}
        //             />
        //             {name}
        //           </label>
        //         </div>
        //       ))}
        //       <div style={{ marginTop: 8 }}>
        //         <Button
        //           type="primary"
        //           disabled={selectedDocType.length === 0}
        //           onClick={() => {
        //             console.log("keys", selectedDocType);
        //             let url = formatDashboardQuery(`/api/dashboard/`, {
        //               ...searchValues,
        //               documentTypes: selectedDocType,
        //               page: page,
        //               limit: rowsPerPage,
        //             });
        //             fetchDocuments(url);
        //             setfilterType(true);
        //           }}
        //           style={{
        //             marginRight: 8,
        //             backgroundColor: "#E8F3F9",
        //             color: "black",
        //           }}
        //         >
        //           Apply
        //         </Button>
        //         <Button
        //           onClick={() => {
        //             setselectedDocType([]);
        //             fetchDocuments();
        //             setfilterType(false);
        //             confirm();
        //           }}
        //         >
        //           Reset
        //         </Button>
        //       </div>
        //     </div>
        //   );
        // },
      },

      {
        title: "Issue - Version",
        dataIndex: "version",
        key: "version",
        width: 150,
        render: (_: any, record: any) => (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            {record.issueNumber} - {record.version}
          </div>
        ),
        // sorter: (a, b) => a.version - b.version,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (_: any, record: any) => {
          if (record.status === "APPROVED") {
            return (
              <Tag
                style={{ backgroundColor: "#7cbf3f" }}
                key={record.status}
                // className={classes.statusTag}
              >
                {record.status}
              </Tag>
            );
          } else if (record.status === "IN_REVIEW") {
            return (
              <Tag
                style={{ backgroundColor: "#F2BB00" }}
                key={record.status}
                // className={classes.statusTag}
              >
                In Review
              </Tag>
            );
          } else if (record.status === "REVIEW_COMPLETE") {
            return (
              <Tag
                style={{ backgroundColor: "#F2BB00" }}
                key={record.status}
                // className={classes.statusTag}
              >
                {record.status}
              </Tag>
            );
          } else if (record.status === "IN_APPROVAL") {
            return (
              <Tag
                style={{ backgroundColor: "#FB8500" }}
                key={record.status}
                // className={classes.statusTag}
              >
                {/* {record.docStatus} */}
                In Approval
              </Tag>
            );
          } else if (record.status === "AMMEND") {
            return (
              <Tag
                style={{ backgroundColor: "#D62DB1" }}
                color="yellow"
                key={record.status}
              >
                {record.status}
              </Tag>
            );
          } else if (record.status === "PUBLISED") {
            return (
              <Tag
                style={{ backgroundColor: "#7CBF3F" }}
                key={record.status}
                // className={classes.statusTag}
              >
                Published
              </Tag>
            );
          } else if (record.status === "DRAFT") {
            return (
              <Tag
                style={{ backgroundColor: "#0075A4" }}
                key={record.status}
                // className={classes.statusTag}
              >
                {record.status}
              </Tag>
            );
          } else if (record.status === "SEND_FOR_EDIT") {
            return (
              <Tag
                style={{ backgroundColor: "#0075A4" }}
                key={record.status}
                // className={classes.statusTag}
              >
                {record.status}
              </Tag>
            );
          } else if (record.status === "Retire - In Review") {
            return (
              <Tag
                color="#0075A4"
                key={record.status}
                // className={classes.statusTag}
              >
                {record?.status}
              </Tag>
            );
          } else if (record.docStatus === "Retire - In Approval") {
            return (
              <Tag color="#FB8500" key={record.docStatus}>
                {record.docStatus}
              </Tag>
            );
          } else if (record.status === "OBSOLETE") {
            return (
              <Tag
                color="#003566"
                key={record.status}
                // className={classes.statusTag}
              >
                OBSOLETE
              </Tag>
            );
          } else return record.status;
        },
      },
      {
        title: "Published Date",
        dataIndex: "approvedDate",
        key: "approvedDate",
        render: (_: any, record: any) => formatDate(record?.approvedDate) || "",
        // sorter: (a, b) => a.department - b.department,
      },

      {
        title: "Action",
        // fixed: "right",
        dataIndex: "isAction",
        key: "isAction",
        width: 100,
        render: (_: any, record: any) =>
          !record.isVersion && (
            <>
              {record.editAcess ? (
                // <Tooltip title="Click to Amend">
                <IconButton
                  className={classes.actionButtonStyle}
                  data-testid="action-item"
                  onClick={() => handleEditProcessDoc(record)}
                  style={{ color: iconColor }}
                >
                  <CustomEditIcon width={18} height={18} />
                </IconButton>
              ) : (
                // </Tooltip>
                ""
              )}
            </>
          ),
      },
    ];
    const columns: ColumnsType<any> = [
      {
        title: "Doc Number",
        dataIndex: "docNumber",
        key: "docNumber",
        width: 150,
        // render: (_: any, record: any, index) => {
        //   if (index === 0) {
        //     return (
        //       <Tooltip title={record.docNumber}>
        //         <div
        //           style={{
        //             width: 100,
        //           }}
        //         >
        //           <div
        //             style={{
        //               whiteSpace: "nowrap",
        //               overflow: "hidden",
        //               textOverflow: "ellipsis",
        //             }}
        //             ref={refElementForAllDocument2}
        //           >
        //             {record.docNumber}
        //           </div>
        //         </div>
        //       </Tooltip>
        //     );
        //   }
        //   return (
        //     <Tooltip title={record.docNumber}>
        //       <div
        //         style={{
        //           width: 100,
        //         }}
        //       >
        //         <div
        //           style={{
        //             whiteSpace: "nowrap",
        //             overflow: "hidden",
        //             textOverflow: "ellipsis",
        //           }}
        //         >
        //           {record.docNumber}
        //         </div>
        //       </div>
        //     </Tooltip>
        //   );
        // },
      },
      {
        title: "Title",
        dataIndex: "documentName",
        key: "documentName",
        width: 100,
        // render: (_: any, record: any, index) => {
        //   if (index === 0) {
        //     return record.action ? (
        //       <Tooltip title={record.documentName}>
        //         <div
        //           style={{
        //             textDecorationLine: "underline",
        //             cursor: "pointer",
        //             width: 130,
        //           }}
        //         >
        //           <div
        //             className={classes.clickableField}
        //             onClick={() => toggleDocViewDrawer(record)}
        //             style={{
        //               whiteSpace: "normal", // Adjusted to wrap text
        //               overflow: "hidden",
        //               textOverflow: "ellipsis",
        //             }}
        //             ref={refElementForAllDocument3}
        //           >
        //             {record.documentName}
        //           </div>
        //         </div>
        //       </Tooltip>
        //     ) : (
        //       <Tooltip title={record.documentName}>
        //         <>{record.documentName}</>
        //       </Tooltip>
        //     );
        //   }
        //   return record.action ? (
        //     <Tooltip title={record.documentName}>
        //       <div
        //         style={{
        //           textDecorationLine: "underline",
        //           cursor: "pointer",
        //           width: 130,
        //         }}
        //       >
        //         <div
        //           className={classes.clickableField}
        //           onClick={() => toggleDocViewDrawer(record)}
        //           style={{
        //             whiteSpace: "normal", // Adjusted to wrap text
        //             overflow: "hidden",
        //             textOverflow: "ellipsis",
        //           }}
        //         >
        //           {record.documentName}
        //         </div>
        //       </div>
        //     </Tooltip>
        //   ) : (
        //     <Tooltip title={record.documentName}>
        //       <>{record.documentName}</>
        //     </Tooltip>
        //   );
        // },
      },
      {
        title: "Type",
        dataIndex: "docType",
        width: 100,
        // render: (_: any, record: any) => (
        //   <div
        //     style={{
        //       width: 100,
        //     }}
        //   >
        //     <div
        //       style={{
        //         whiteSpace: "nowrap",
        //         overflow: "hidden",
        //         textOverflow: "ellipsis",
        //       }}
        //     >
        //       {record.docType}
        //     </div>
        //   </div>
        // ),
        // filterIcon: (filtered: any) =>
        //   isFilterType ? (
        //     <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        //   ) : (
        //     <FilterOutlined style={{ fontSize: "16px" }} />
        //   ),
        // filterDropdown: ({ confirm, clearFilters }: any) => {
        //   return (
        //     <div style={{ padding: 8 }}>
        //       {filterList?.doctype?.map((name: any) => (
        //         <div key={name}>
        //           <label style={{ display: "flex", alignItems: "center" }}>
        //             <input
        //               type="checkbox"
        //               onChange={(e) => {
        //                 const value = e.target.value;
        //                 if (e.target.checked) {
        //                   setselectedDocType([...selectedDocType, value]);
        //                 } else {
        //                   setselectedDocType(
        //                     selectedDocType.filter((key: any) => key !== value)
        //                   );
        //                 }
        //               }}
        //               value={name}
        //               checked={selectedDocType.includes(name)} // Check if the checkbox should be checked
        //               style={{
        //                 width: "16px",
        //                 height: "16px",
        //                 marginRight: "5px",
        //               }}
        //             />
        //             {name}
        //           </label>
        //         </div>
        //       ))}
        //       <div style={{ marginTop: 8 }}>
        //         <Button
        //           type="primary"
        //           disabled={selectedDocType.length === 0}
        //           onClick={() => {
        //             setfilterType(true);
        //             handleChangePageNew(1, 10);
        //           }}
        //           style={{
        //             marginRight: 8,
        //             backgroundColor: "#E8F3F9",
        //             color: "black",
        //           }}
        //         >
        //           Apply
        //         </Button>
        //         <Button
        //           onClick={() => {
        //             setselectedDocType([]);
        //             setfilterType(false);
        //             confirm();
        //           }}
        //         >
        //           Reset
        //         </Button>
        //       </div>
        //     </div>
        //   );
        // },
      },
      {
        title: "System",
        dataIndex: "system",
        width: 50,
        render: (_, record) => {
          return <MultiUserDisplay data={record.system} name="name" />;
        },
        // filterIcon: (filtered: any) =>
        //   isFilterSystem ? (
        //     <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        //   ) : (
        //     <FilterOutlined style={{ fontSize: "16px" }} />
        //   ),
        // filterDropdown: ({ confirm, clearFilters }) => {
        //   return (
        //     <div
        //       style={{
        //         padding: 8,
        //       }}
        //     >
        //       {filterList?.system?.map((item: any) => (
        //         <div key={item.id}>
        //           <label style={{ display: "flex", alignItems: "center" }}>
        //             <input
        //               type="checkbox"
        //               onChange={(e) => {
        //                 const value = e.target.value;
        //                 if (e.target.checked) {
        //                   setselectedSystem([...selectedSystem, value]);
        //                 } else {
        //                   setselectedSystem(
        //                     selectedSystem.filter((key: any) => key !== value)
        //                   );
        //                 }
        //               }}
        //               value={item.id}
        //               checked={selectedSystem.includes(item.id)} // Check if the checkbox should be checked
        //               style={{
        //                 width: "16px",
        //                 height: "16px",
        //                 marginRight: "5px",
        //               }}
        //             />
        //             {item.name}
        //           </label>
        //         </div>
        //       ))}
        //       <div style={{ marginTop: 8 }}>
        //         <Button
        //           type="primary"
        //           disabled={selectedSystem.length === 0}
        //           onClick={() => {
        //             setfilterSystem(true);
        //             handleChangePageNew(1, 10);
        //           }}
        //           style={{
        //             marginRight: 8,
        //             backgroundColor: "#E8F3F9",
        //             color: "black",
        //           }}
        //         >
        //           Apply
        //         </Button>
        //         <Button
        //           onClick={() => {
        //             setselectedSystem([]);
        //             // fetchDocuments();
        //             setfilterSystem(false);
        //             confirm();
        //           }}
        //         >
        //           Reset
        //         </Button>
        //       </div>
        //     </div>
        //   );
        // },
      },
      {
        title: "Issue - Version",
        dataIndex: "version",
        key: "version",
        width: 150,
        render: (_: any, record: any) => (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            {record.issueNumber} - {record.version}
          </div>
        ),
        // sorter: (a, b) => a.version - b.version,
      },
      {
        title: "Status",
        dataIndex: "docStatus",
        key: "docStatus",
        width: 130,
      },
      {
        title: "Published Date",
        dataIndex: "approvedDate",
        key: "approvedDate",
        width: 200,
        render: (_: any, record: any) => record?.approvedDate || "",
        // sorter: (a, b) => a.department - b.department,
      },
      // {tabFilter==="inWorkflow"&&{}}
      {
        title: "Dept/Vertical",
        dataIndex: "department",
        key: "department",
        width: 100,
        // render: (_: any, record: any) => (
        //   <div
        //     style={{
        //       width: 100,
        //     }}
        //   >
        //     <div
        //       style={{
        //         whiteSpace: "nowrap",
        //         overflow: "hidden",
        //         textOverflow: "ellipsis",
        //       }}
        //     >
        //       {record.department}
        //     </div>
        //   </div>
        // ),
        // filterIcon: (filtered: any) =>
        //   isFilterMyDept ? (
        //     <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        //   ) : (
        //     <FilterOutlined style={{ fontSize: "16px" }} />
        //   ),
        // filterDropdown: ({ confirm, clearFilters }) => {
        //   return (
        //     <div
        //       style={{
        //         padding: 8,
        //         maxHeight: 200, // Set the maximum height of the container
        //         overflowY: "auto", // Enable vertical scrolling
        //       }}
        //     >
        //       {filterList?.entity?.map((item: any) => (
        //         <div key={item.id}>
        //           <label style={{ display: "flex", alignItems: "center" }}>
        //             <input
        //               type="checkbox"
        //               onChange={(e) => {
        //                 const value = e.target.value;
        //                 if (e.target.checked) {
        //                   setselectedMyDept([...selectedMyDept, value]);
        //                 } else {
        //                   setselectedMyDept(
        //                     selectedMyDept.filter((key: any) => key !== value)
        //                   );
        //                 }
        //               }}
        //               value={item.id}
        //               checked={selectedMyDept.includes(item.id)}
        //               style={{
        //                 width: "16px",
        //                 height: "16px",
        //                 marginRight: "5px",
        //               }}
        //             />
        //             {item.name}
        //           </label>
        //         </div>
        //       ))}
        //       <div style={{ marginTop: 8 }}>
        //         <Button
        //           type="primary"
        //           disabled={selectedMyDept.length === 0}
        //           onClick={() => {
        //             setfilterMyDept(!isFilterMyDept);
        //             handleChangePageNew(1, 10);
        //           }}
        //           style={{
        //             marginRight: 8,
        //             backgroundColor: "#E8F3F9",
        //             color: "black",
        //           }}
        //         >
        //           Apply
        //         </Button>
        //         <Button
        //           onClick={() => {
        //             setselectedMyDept([]);
        //             // fetchDocuments();
        //             setfilterMyDept(!isFilterMyDept);
        //             confirm();
        //           }}
        //         >
        //           Reset
        //         </Button>
        //       </div>
        //     </div>
        //   );
        // },
        // sorter: (a, b) => a.department - b.department,
      },
      {
        title: "Corp Func/Unit",
        dataIndex: "location",
        key: "location",
        width: 150,
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
              {record.location}
            </div>
          </div>
        ),
        // sorter: (a, b) => a.location - b.location,
      },
      {
        title: "Section",
        dataIndex: "sectionName",
        key: "sectionName",
        width: 100,
        // filterIcon: (filtered: any) =>
        //   isFilterMySection ? (
        //     <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        //   ) : (
        //     <FilterOutlined style={{ fontSize: "16px" }} />
        //   ),
        // filterDropdown: ({ confirm, clearFilters }) => {
        //   return (
        //     <div
        //       style={{
        //         padding: 8,
        //       }}
        //     >
        //       {filterList?.section?.map((item: any) => (
        //         <div key={item}>
        //           <label style={{ display: "flex", alignItems: "center" }}>
        //             <input
        //               type="checkbox"
        //               onChange={(e) => {
        //                 const value = e.target.value;
        //                 if (e.target.checked) {
        //                   setSelectedMySection([...selectedMySection, value]);
        //                 } else {
        //                   setSelectedMySection(
        //                     selectedMySection.filter((key: any) => key !== value)
        //                   );
        //                 }
        //               }}
        //               value={item.id}
        //               checked={selectedMySection.includes(item.id)} // Check if the checkbox should be checked
        //               style={{
        //                 width: "16px",
        //                 height: "16px",
        //                 marginRight: "5px",
        //               }}
        //             />
        //             {item.name}
        //           </label>
        //         </div>
        //       ))}
        //       <div style={{ marginTop: 8 }}>
        //         <Button
        //           type="primary"
        //           disabled={selectedMySection.length === 0}
        //           onClick={() => {
        //             setFilerMySection(true);
        //             handleChangePageNew(1, 10);
        //           }}
        //           style={{
        //             marginRight: 8,
        //             backgroundColor: "#E8F3F9",
        //             color: "black",
        //           }}
        //         >
        //           Apply
        //         </Button>
        //         <Button
        //           onClick={() => {
        //             setSelectedMySection([]);
        //             // fetchDocuments();
        //             setFilerMySection(false);
        //             confirm();
        //           }}
        //         >
        //           Reset
        //         </Button>
        //       </div>
        //     </div>
        //   );
        // },
      },

      {
        title: "Action",
        // fixed: "right",
        dataIndex: "isAction",
        key: "isAction",
        width: 180,
        render: (_: any, record: any, index) => {
          // {console.log("record",record)}
          if (index === 0) {
            return (
              !record.isVersion && (
                <>
                  {record.editAcess ? (
                    // <Tooltip title="Click to Amend">
                    <IconButton
                      className={classes.actionButtonStyle}
                      data-testid="action-item"
                      onClick={() => handleEditProcessDoc(record)}
                      style={{ color: iconColor }}
                    >
                      <div>
                        <CustomEditIcon width={18} height={18} />
                      </div>
                    </IconButton>
                  ) : (
                    // </Tooltip>
                    ""
                  )}
                </>
              )
            );
          }
          return (
            !record.isVersion && (
              <>
                {record.editAcess ? (
                  // <Tooltip title="Click to Amend">
                  <IconButton
                    className={classes.actionButtonStyle}
                    data-testid="action-item"
                    onClick={() => {
                      handleEditProcessDoc(record);
                    }}
                    style={{ color: iconColor }}
                  >
                    <div>
                      <CustomEditIcon width={18} height={18} />
                    </div>
                  </IconButton>
                ) : (
                  // </Tooltip>
                  ""
                )}
              </>
            )
          );
        },
      },
    ];

    return (
      <>
        <div data-testid="custom-table" className={classes.tableContainer}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            size="middle"
            rowKey={"id"}
            expandable={{
              expandedRowRender: (record) => {
                return (
                  <Table
                    // className={classes.subTableContainer}
                    style={{
                      width: 1200,
                      paddingBottom: "20px",
                      paddingTop: "20px",
                    }}
                    columns={subColumns}
                    bordered
                    dataSource={record?.versionDocument}
                    pagination={false}
                  />
                );
              },
              rowExpandable: (record) => {
                // Check if versionDocument exists and has more than 0 elements
                return record?.versionDocument?.length > 0;
              },
              // expandIcon: expandIcon,
            }}
            className={classes.documentTable}
          />
        </div>
        <div>
          {!!drawer.open && (
            <DocumentDrawer
              drawer={drawer}
              setDrawer={setDrawer}
              handleFetchDocuments={setNewData}
            />
          )}
        </div>
      </>
    );
  }

  useEffect(() => {
      if(location?.state?.redirectToTab){
      setActiveTab(location?.state?.redirectToTab);
    }
  }, [location]);

  const tabs = [
    {
      key: "1",
      name: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <AllDocIcon
            style={{
              fill: acitveTab === "1" ? "white" : "",
              marginRight: "10px",
            }}
            className={classes.docNavIconStyle}
          />{" "}
          Document Type
        </div>
      ),
      children: <DocumentTypeData />,
      moduleHeader: "Document Type",
    },
    {
      key: "2",
      name: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <AllDocIcon
            style={{
              fill: acitveTab === "2" ? "white" : "",
              marginRight: "10px",
            }}
            className={classes.docNavIconStyle}
          />{" "}
          Retired Documents
        </div>
      ),
      children: <DocumentTableData />,
      moduleHeader: "Document Type",
    },
    {
      key: "3",
      name: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <AllDocIcon
            style={{
              fill: acitveTab === "3" ? "white" : "",
              marginRight: "10px",
            }}
            className={classes.docNavIconStyle}
          />{" "}
          Job Summary
        </div>
      ),
      children: <DocumentJobSummaryTab />,
      moduleHeader: "Document Type",
    },
    {
      key: "4",
      name: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <AllDocIcon
            style={{
              fill: acitveTab === "4" ? "white" : "",
              marginRight: "10px",
            }}
            className={classes.docNavIconStyle}
          />{" "}
          Workflow
        </div>
      ),
      children: <DocumentWorkflow />,
      moduleHeader: "Document Type",
    },
    {
      key: "5",
      name: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <AllDocIcon
            style={{
              fill: acitveTab === "5" ? "white" : "",
              marginRight: "10px",
            }}
            className={classes.docNavIconStyle}
          />{" "}
          Forms Library
        </div>
      ),
      children: <FormsTable />,
      moduleHeader: "Document Type",
    },
  ];

  const subTabs = [
    {
      key: "1",
      name: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <AllDocIcon
            style={{
              fill: acitveTab === "1" ? "white" : "",
              marginRight: "10px",
            }}
            className={classes.docNavIconStyle}
          />{" "}
          Document Type
        </div>
      ),
      children: <DocumentTypeData />,
      moduleHeader: "Document Type",
    },
  ];
  return (
    <>
      <div>
        <ModuleNavigation
          tabs={isOrgAdmin ? tabs : isMr ? tabs : subTabs}
          activeTab={acitveTab}
          setActiveTab={setActiveTab}
          currentModuleName={currentModuleName}
          setCurrentModuleName={setCurrentModuleName}
          createHandler={false}
          mainModuleName={"Document"}
        />
        {/* <ModuleHeader moduleName={"Audit Settings"} createHandler={createHandler} /> */}
      </div>
    </>
  );
};

export default DocumentTypeDetails;
