import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from "@material-ui/core";
//antd
import { Button, Divider, Table, Tag, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AiOutlineMinusCircle,
  AiOutlinePlusCircle,
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";
import type { PaginationProps } from "antd";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import { MdTouchApp } from "react-icons/md";

//material-ui
import {
  Box,
  Tooltip,
  CircularProgress,
  IconButton,
  TextField,
} from "@material-ui/core";
import { MdForum } from "react-icons/md";

//utils
import checkRole from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";

//assets
import ReloadIcon from "assets/icons/Reload.svg";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";

//components
import DocumentDrawer from "components/Document/DocumentTable/DocumentDrawer";
import DocumentViewDrawer from "components/Document/DocumentTable/DocumentViewDrawer";

//reusable components
import ConfirmDialog from "components/ConfirmDialog";
//thirdparty library
import { useSnackbar } from "notistack";

//styles
import useStyles from "./styles";
import { GiStarShuriken } from "react-icons/gi";
import { createSubColumns } from "pages/DocumentControl/constants/subColumns";

const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;
type Props = {
  // toggleDrawer: any;
  // drawer: any;
  // setDrawer: any;
  filter: any;
  setFilter: any;
  filterOpen: any;
  setFilterOpen: any;
  isGraphSectionVisible: any;
  tabFilter: any;
  fetchDocuments?: any;
  fetchChartData?: any;
  isTableDataLoading?: any;
  setIsTableDataLoading?: any;
  searchValues?: any;
  setSearch?: any;
  data?: any;
  setData?: any;
  filterList?: any;
  count?: any;
  setCount?: any;

  page?: any;
  setPage?: any;
  rowsPerPage?: any;
  dataLength?: any;
  setDataLength?: any;
  setRowsPerPage?: any;
  filterHandler?: any;
  activeModules?: any;
  setChatModalOpen?: any;
  setOpenTourForAllDocuments?: any;
};

interface DocumentTableProps {
  data: any[];
  columns: ColumnsType<any>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize?: number) => void;
  selectedFilters: any;
  searchValues: any;
  setSearchValues: (val: any) => void;
  toggleDocViewDrawer: (record: any) => void;
  fetchDocuments: () => void;
  tabFilter: string;
  isTableDataLoading?: any;
  setIsTableDataLoading?: any;
  activeModules?: any;
  subColumns?: any;
}

function DocumentTable({
  data,
  columns,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  selectedFilters,
  searchValues,
  setSearchValues,
  toggleDocViewDrawer,
  fetchDocuments,
  tabFilter,
  isTableDataLoading,
  setIsTableDataLoading,
  activeModules,
  subColumns,
}: DocumentTableProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<any>();

  const [entity, setEntity] = React.useState([]);
  const [location, setLocation] = React.useState<any>([]);
  const [user, setUser] = React.useState([]);
  const [system, setSystem] = React.useState([]);
  const [document, setDocument] = React.useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const [expandedRows, setExpandedRows] = useState<any>([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  const iconColor = "#380036";
  const [docViewDrawer, setDocViewDrawer] = useState({
    open: false,
    data: {},
  });

  const [isHovered, setIsHovered] = useState(false);

  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles({
    matches: matches,
  });

  const userDetailsforFilter = JSON.parse(
    sessionStorage.getItem("userDetails") || "{}"
  );

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteDoc(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    handleClose();
    setIsLoading(true);
    try {
      const res = await axios.delete(`api/documents/${deleteDoc}`);
      enqueueSnackbar(`Operation Successful`, { variant: "success" });
      setIsLoading(false);
      // setRerender(!rerender);
      fetchDocuments();
    } catch (err) {
      enqueueSnackbar(`Error ${err}`, {
        variant: "error",
      });
      setIsLoading(false);
    }
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

  const handleMouseEnter = (record: any) => {
    setHoveredRow(record.id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  const expandIcon = ({ expanded, onExpand, record }: any) => {
    const icon = expanded ? <AiOutlineMinusCircle /> : <AiOutlinePlusCircle />;
    if (record?.documentVersions?.length > 0) {
      return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
    }
    return null;
  };

  const handleMouseEnterFilter = () => {
    setIsHovered(true);
  };

  const handleMouseLeaveFilter = () => {
    setIsHovered(false);
  };

  const renderLoader = () => (
    <Box
      marginY="auto"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="40vh"
    >
      <CircularProgress />
    </Box>
  );

  const renderMobileCards = () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        width: "100%",
        overflowY: "scroll",
        marginBottom: "40px",
      }}
    >
      {data?.map((record: any) => (
        <div
          key={record.id}
          style={{
            border: "1px solid black",
            borderRadius: "5px",
            padding: "5px",
            margin: "10px",
            width: smallScreen ? "45%" : "100%",
          }}
        >
          <p
            onClick={() => toggleDocViewDrawer(record)}
            style={{
              padding: "3px 10px",
              backgroundColor: "#9FBFDF",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            {record?.documentName}
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            Doc Number : <span>{record?.docNumber}</span>
          </p>
          <p>Type : {record.docType}</p>
          <p
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            Issue - Version :
            <span
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              {record.issueNumber} - {record.version}
            </span>
          </p>

          {(tabFilter === "myDoc" ||
            tabFilter === "myFavDocs" ||
            tabFilter === "inWorkflow") && <p>Status : {record.docStatus}</p>}

          {(tabFilter === "allDoc" || tabFilter === "distributedDoc") && (
            <p>Published Date: {record?.approvedDate || ""}</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderPagination = () => (
    <div className={classes.pagination}>
      <Pagination
        size="small"
        current={page}
        pageSize={pageSize}
        total={total}
        showTotal={showTotal}
        showSizeChanger
        showQuickJumper
        onChange={(page, pageSize) => onPageChange(page, pageSize)}
      />
    </div>
  );
  // console.log("data in table", data);
  const renderDesktopTableUI = () => (
    <>
      <div data-testid="custom-table" className={classes.tableContainer}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          size="middle"
          rowKey={(record) => record._id} // or 'id' if _id not present
          loading={isTableDataLoading}
          expandedRowKeys={expandedRows}
          onExpandedRowsChange={(expandedKeys) => {
            // Enforce only one expanded row at a time (single expand)
            const latestExpanded = expandedKeys[expandedKeys.length - 1];
            setExpandedRows(latestExpanded ? [latestExpanded] : []);
          }}
          expandable={{
            expandedRowRender: (record: any) =>
              tabFilter === "my-docs" &&
              record?.documentVersions?.length > 0 ? (
                <Table
                  className={classes.subTableContainer}
                  style={{
                    width: 1200,
                    paddingBottom: "20px",
                    paddingTop: "20px",
                  }}
                  columns={subColumns}
                  bordered
                  dataSource={record?.documentVersions}
                  pagination={false}
                  rowKey={(r) => r._id} // Ensure this too
                />
              ) : null,
            expandIcon: expandIcon,
            rowExpandable: (record: any) =>
              tabFilter === "my-docs" && record?.documentVersions?.length > 0,
          }}
          className={classes.documentTable}
          onRow={(record) => ({
            onMouseEnter: () => handleMouseEnter(record),
            onMouseLeave: handleMouseLeave,
          })}
        />
      </div>
    </>
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={open}
      handleClose={handleClose}
      handleDelete={handleDelete}
    />
  );

  const renderMainContent = () => (
    <>
      <Box
        style={{
          width: "100%",
          backgroundColor: "#E8F3F9",
          height: "54 px",
        }}
      />
      {!matches && renderMobileCards()}
      {renderPagination()}
      {matches && renderDesktopTableUI()}
      {renderConfirmDialog()}
    </>
  );

  // return <div>{isTableDataLoading ? renderLoader() : renderMainContent()}</div>;
  return <div>{renderMainContent()}</div>;
}

export default DocumentTable;
