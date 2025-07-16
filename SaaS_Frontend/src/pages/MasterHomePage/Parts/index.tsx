import { useState, useEffect } from "react";
import CustomTable from "components/CustomTable";
import useStyles from "./styles";
import {
  CircularProgress,
  Typography,
  Tooltip,
  Box,
} from "@material-ui/core";
import { useNavigate, useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { partsFormData } from "recoil/atom";
import axios from "apis/axios.global";
import ConfirmDialog from "components/ConfirmDialog";
import { useSnackbar } from "notistack";
import formatQuery from "utils/formatQuery";
import getAppUrl from "utils/getAppUrl";
import FilterDrawer from "components/FilterDrawer";
import SearchBar from "components/SearchBar";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import NoAccess from "assets/NoAccess.svg";
import SimplePaginationController from "components/SimplePaginationController";
import checkRoles from "utils/checkRoles";
import { partsForm } from "schemas/partsForm";
import Edit from "assets/documentControl/Edit.svg";
import Delete from "assets/documentControl/Delete.svg";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import { MdSearch } from 'react-icons/md';
import { API_LINK } from "config";
import { Modal, Upload, Form } from "antd";
import type { UploadProps } from "antd";
import { MdInbox } from 'react-icons/md';
import { MdPublish } from 'react-icons/md';
import { saveAs } from "file-saver";

type Props = {
  filterOpen?: boolean;
  setFilterOpen?: any;
};

const fields = ["partNo", "partName", "entity", "models", "description"];
const headers = [
  "PART NO.",
  "PART NAME",
  "MANUFACTURING ENTITY",
  "MODEL",
  "DESCRIPTION",
  // "Unit Admin",
];

function Parts({ filterOpen, setFilterOpen }: Props) {
  const [data, setData] = useState<any>();
  const [filteredData, setFilteredData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setLocData = useSetRecoilState(partsFormData);
  const [open, setOpen] = useState(false);
  const [deleteLoc, setDeleteLoc] = useState<any>();
  const [rerender, setRerender] = useState(false);
  const [searchValue, setSearchValue] = useState<any>("");
  const [count, setCount] = useState<number>();
  const [page, setPage] = useState(1);
  const [entitySearch, setEntitySearch] = useState<any>("");
  const [entities, setEntities] = useState<any>([]);
  const [selectedEntities, setSelectedEntities] = useState<any>([]);

  const [showAdd, setShowAdd] = useState<any>(true);
  const [searchParam, setSearchParam] = useState<any>("");

  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const orgName = getAppUrl();
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isOrgAdmin = true;
  const isAdmin = checkRoles("admin");
  const isEntityHead = checkRoles("ENTITY-HEAD");
  const isAuditor = checkRoles("AUDITOR");
  const isMR = checkRoles("MR");
  const isGeneralUser = false;
  const location = useLocation();
  const [importPartsModel, setImportPartsModel] = useState<any>({
    open: false,
  });
  const [fileList, setFileList] = useState<any>([]);

  const getData = async (url: any) => {
    setIsLoading(true);
    try {
      const res = await axios.get(url);
      if (res?.data?.data) {
        setCount(res.data.length);
        const val = res?.data?.data?.map((item: any) => {
          let modelsStr = item.models.map((modelItem: any) => {
            return modelItem.modelName;
          });
          modelsStr = modelsStr.join(",");
          return {
            partName: item.partName,
            partNo: item.partNo,
            id: item.id,
            entity: item.entity.entityName,
            description: item.description,
            models: modelsStr,
            entityId: item.entityId,
          };
        });
        setData(val);
        setFilteredData(val);
        setIsLoading(false);
      } else {
        setData([]);
        setFilteredData([]);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleEditLoc = (data: any) => {
    navigate(`/master/parts/newpart/${data.id}`, { state: true });
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteLoc(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    handleClose();
    setIsLoading(true);
    try {
      const res = await axios.delete(`api/parts/${deleteLoc.id}`);
      enqueueSnackbar(`Operation Successful`, { variant: "success" });
      setIsLoading(false);
      setRerender(!rerender);
    } catch (err) {
      enqueueSnackbar(`Error ${err}`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    setLocData(partsForm);
    navigate("/master/parts/newpart");
  };
  const handleApply = () => {
    const url = formatQuery(
      `/api/parts`,
      { page: page, limit: 10, search: searchValue },
      ["page", "limit", "search"],
      false
    );

    if (
      isOrgAdmin ||
      isAdmin ||
      isLocAdmin ||
      isMR ||
      isEntityHead ||
      isAuditor ||
      isGeneralUser
    ) {
      getData(url);
    }
  };

  const handleChangePage = (page: any) => {
    setPage(page);
    const url = formatQuery(
      "/api/parts",
      { page: page, limit: 10, search: searchValue },
      ["page", "limit", "search"],
      false
    );
    getData(url);
  };
  const handleSearchChange = (e: any) => {
    setSearchValue(e.target.value);
  };
  const handleDiscard = () => {
    setSearchValue("");
  };
  const getEntities = async () => {
    setIsLoading(true);
    try {
      const url = formatQuery(
        `/api/entity/all/${orgName}`,
        { page: 1, limit: 100 },
        [
          "entityName",
          "locationName",
          "businessType",
          "entityType",
          "page",
          "limit",
        ]
      );
      const res = await axios.get(url!);
      if (res?.data?.data) {
        const values = res?.data?.data.map((item: any) => ({
          entityType: item.entityType ? item.entityType.name : "-",
          entityName: item?.entityName ?? "-",
          id: item?.id ?? "-",
        }));
        setEntities(values);
        setIsLoading(false);
      }
    } catch (err) {
      enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const url = formatQuery(
      `/api/parts`,
      { page: 1, limit: 10 },
      ["page", "limit"],
      false
    );

    if (
      isOrgAdmin ||
      isAdmin ||
      isLocAdmin ||
      isMR ||
      isEntityHead ||
      isAuditor ||
      isGeneralUser
    ) {
      getData(url);
      getEntities();
    }
  }, [rerender]);
  useEffect(() => {
    if (location.pathname.includes("/module-settings")) {
      setShowAdd(false);
    }
    console.log(location);
  }, [location]);

  useEffect(() => {
    const url = formatQuery(
      `/api/parts`,
      { page: page, limit: 10, search: searchValue },
      ["page", "limit", "search"],
      false
    );
    console.log(selectedEntities, "Entities.......");
    const newData = data?.filter((el: any) => {
      console.log(el);
      if (selectedEntities.includes(el.entityId)) {
        return el;
      }
    });
    if (selectedEntities && selectedEntities.length === 0) {
      getData(url);
    } else {
      setFilteredData(newData);
    }
  }, [selectedEntities]);

  const importParts = async () => {
    try {
      const XLSX = require("xlsx");
      const formData = new FormData();
      formData.append("file", fileList[0].originFileObj);
      const response = await axios.post(
        `${API_LINK}/api/parts/importParts`,
        formData
      );
      console.log(response);
      if (response.data.success) {
        const headers = Object.keys(response.data.failedParts[0]);
        const failedPartsSheet = XLSX.utils.aoa_to_sheet(
          response.data.failedParts,
          { header: headers }
        );
        const failedPartsWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          failedPartsWorkbook,
          failedPartsSheet,
          "Failed Parts"
        );
        const excelBinaryString = XLSX.write(failedPartsWorkbook, {
          bookType: "xlsx",
          type: "binary",
        });
        const blob = new Blob([s2ab(excelBinaryString)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, "FailedParts.xlsx");
      }
      const url = formatQuery(`/api/parts`, { page: 1, limit: 10 }, [
        "page",
        "limit",
      ]);
      getData(url);
    } catch (error) {
      console.log("error in uploading attachments", error);
    }
  };

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const uploadProps: UploadProps = {
    multiple: false, // Set to true to allow multiple file uploads
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFileList(fileList); // Set the entire file list instead of a single file
      }
    },
    onRemove: (file) => {
      // if (!!existingFiles && existingFiles.length > 0) {
      //   setExistingFiles((prevState: any) =>
      //     prevState.filter((f: any) => f.uid !== file.uid)
      //   ); // Update the existingFiles state to remove the specific fil
      // }
      setFileList((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      ); // Remove the specific file from the list
    },
    // fileList: formData?.file && formData.file.uid ? [formData.file] : [],
  };

  return (
    <>
      <FilterDrawer
        open={filterOpen!}
        setOpen={setFilterOpen!}
        resultText={count ? `Showing ${count} Result(s)` : `No Results Found`}
        handleApply={handleApply}
        handleDiscard={handleDiscard}
      >
        <SearchBar
          placeholder="By Part Name"
          name="locName"
          handleChange={(e: any) => handleSearchChange(e)}
          values={searchValue}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By part No."
          name="locationType"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By Model"
          name="locAdmin"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
      </FilterDrawer>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />

      {isOrgAdmin ||
      isAdmin ||
      isLocAdmin ||
      isMR ||
      isEntityHead ||
      isAuditor ||
      isGeneralUser ? (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            style={{ padding: "10px" }}
          >
            <Typography color="primary" variant="h6">
              Parts Management
            </Typography>
            {isOrgAdmin && (
              <Tooltip title="Import Parts">
                <MdPublish
                  onClick={() => setImportPartsModel({ open: true })}
                  style={{
                    position: "relative",
                    top: "1px",
                    right: "-355px",
                    fontSize: "27px",
                    color: "#0E497A",
                  }}
                />
              </Tooltip>
            )}
            {importPartsModel.open && (
              <Modal
                title="Import Parts"
                open={importPartsModel.open}
                onCancel={() => setImportPartsModel({ open: false })}
                onOk={() => {
                  importParts();
                  setImportPartsModel({ open: false });
                }}
              >
                <Form.Item name="attachments" label={"Attach File: "}>
                  <Upload
                    name="attachments"
                    {...uploadProps}
                    fileList={fileList}
                  >
                    <p className="ant-upload-drag-icon">
                      <MdInbox />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                  </Upload>
                </Form.Item>
              </Modal>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: "20px",
                padding: "5px",
              }}
            >
              <Input
                placeholder="MdSearch"
                disableUnderline={true} // Remove the underline
                onChange={(e: any) => handleSearchChange(e)}
                value={searchValue}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") {
                    handleApply();
                  }
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <MdSearch style={{ color: "#aaa" }} />
                  </InputAdornment>
                }
                style={{ height: "20px" }}
              />
            </div>
          </Box>

          {isLoading ? (
            <div className={classes.loader}>
              <CircularProgress />
            </div>
          ) : data ? (
            <>
              <div
                data-testid="custom-table"
                className={classes.tableContainer}
              >
                <CustomTable
                  header={headers}
                  fields={fields}
                  data={filteredData}
                  isAction={true}
                  entities={entities}
                  setEntitySearch={setEntitySearch}
                  selectedEntities={selectedEntities}
                  setSelectedEntities={setSelectedEntities}
                  actions={[
                    {
                      label: "Edit",
                      icon: (
                        <img
                          src={Edit}
                          style={{
                            width: "20px",
                          }}
                        />
                      ),
                      handler: handleEditLoc,
                    },
                    {
                      label: "Delete",
                      icon: (
                        <img
                          src={Delete}
                          style={{
                            width: "20px",
                          }}
                        />
                      ),
                      handler: handleOpen,
                    },
                  ]}
                />
                <SimplePaginationController
                  count={count}
                  page={page}
                  rowsPerPage={10}
                  handleChangePage={handleChangePage}
                />
              </div>
            </>
          ) : (
            <>
              <div className={classes.imgContainer}>
                <img
                  src={EmptyTableImg}
                  alt="No Data"
                  height="400px"
                  width="300px"
                />
              </div>
              <Typography align="center" className={classes.emptyDataText}>
                Let’s begin by adding a location
              </Typography>
            </>
          )}
        </>
      ) : (
        <>
          <div className={classes.imgContainer}>
            <img src={NoAccess} alt="No Access" height="400px" width="300px" />
          </div>
          <Typography align="center" className={classes.emptyDataText}>
            You are not authorized to view this page
          </Typography>
        </>
      )}
    </>
  );
}

export default Parts;
