import { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import SearchBar from "../../components/SearchBar";
import {
  deleteTemplate,
  getAllTemplates,
  searchTemplate,
} from "../../apis/auditApi";
import EmptyTableImg from "../../assets/EmptyTableImg.svg";
import useStyles from "./styles";
import { useSnackbar } from "notistack";
import {
  CircularProgress,
  Tooltip,
  Box,
  Button,
  IconButton,
} from "@material-ui/core";
import { Button as AntdButton } from "antd";
import { MdEdit } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import { useNavigate } from "react-router-dom";
import checkRoles from "../../utils/checkRoles";
import { Link } from "react-router-dom";
import getAppUrl from "../../utils/getAppUrl";
import { getAllTemplateAuthors } from "../../apis/userApi";
import MultiUserDisplay from "components/MultiUserDisplay";
import ConfirmDialog from "components/ConfirmDialog";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import { Pagination, PaginationProps, Table } from "antd";
import {
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";
import axios from "apis/axios.global";
export default function Template() {
  const [count, setCount] = useState<number>(10);
  const [skip, setSkip] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [searchValue, setSearchValue] = useState<any>({});
  const [searchText, setSearchText] = useState("");
  const [userListing, setUserListing] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSystemType, setSystemType] = useState<boolean>(false);
  const [systemList, setSystemList] = useState<any>([]);
  const [selectedSystem, setSelectedSystem] = useState<any>([]);

  const [deleteTemplates, setdeleteTemplates] = useState<any>();
  const [searchQuery, setsearchQuery] = useState<any>({
    searchQuery: "",
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const isAdmin = checkRoles("admin");
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const navigate = useNavigate();
  const realmName = getAppUrl();

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  /**
   * @method handleSearchChange
   * @description Function to handle search field value changes inside the filter drawer container
   * @param e {any}
   * @returns nothing
   */
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setsearchQuery({ searchQuery: e.target.value });
    setSearchText(e.target.value);
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setdeleteTemplates(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  /**
   * @method handleDiscard
   * @description Function to remove all the filter text present in the fields
   * @returns nothing
   */

  const handleSearch = (e: any) => {
    e.preventDefault();
    setsearchQuery({
      ...searchQuery,
      [e.target.name]: e.target.value,
    });
  };

  const locOptions = async () => {
    const res = await axios(`/api/audit-template/getAllLocationsForTemplate`);
    setSystemList(res?.data);
  };
  const handleDiscard = () => {
    setIsLoading(true);
    setSearchValue({
      templateName: "",
      createdBy: "",
    });
    setsearchQuery({
      searchQuery: "",
    });
    searchTemplate("", "", skip, rowsPerPage)
      .then((res) => {
        const data = parseData(res?.data.template);
        setCount(res?.data.count);
        setTableData(data);
      })
      .catch((err) =>
        enqueueSnackbar(err.message, {
          variant: "error",
        })
      )
      .finally(() => setIsLoading(false));
  };

  /**
   * @method handleApply
   * @description Function to perform a network call for filtering the table data
   * @returns nothing
   */

  useEffect(() => {
    handleChangePageNew(1, 10);
  }, [isSystemType]);
  const handleApply = () => {
    setSkip(1);
    setRowsPerPage(10);
    getAllTemplates(1, 10, searchText, selectedSystem)
      .then((response: any) => {
        const data = parseData(response.data.template);
        setCount(response.data.count);
        setTableData(data);
      })
      .catch((error: any) => {
        enqueueSnackbar("Something went wrong!", {
          variant: "error",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  /**
   * @method changePage
   * @description Function to change the page on the pagination controller
   * @param pageNumber {number}
   * @returns nothing
   */

  const data: any = {
    isAction: true,
    actions: [
      {
        label: "Edit",
        icon: <MdEdit fontSize="small" />,
        handler: () => {},
      },
      {
        label: "Delete",
        icon: <MdDelete fontSize="small" />,
        handler: () => {},
      },
    ],
  };

  /**
   * @method getAllUsers
   * @description Function to get all users
   * @returns nothing
   */
  const getAllUsers = () => {
    getAllTemplateAuthors(realmName)
      .then((response: any) => {
        setUserListing(parseUserListing(response?.data));
      })
      .catch((error: any) => {});
  };

  const headersData = [
    "Checklist Name",
    "Status",
    "Published Date",
    "Created By",
    "Applicable Units",
  ];
  const fieldsData = [
    "title",
    "state",
    "published",
    "createdBy",
    "locationName",
  ];
  const cols = [
    {
      title: "Checklist Name",
      dataIndex: "title",
    },
    {
      title: "Status",
      dataIndex: "state",
    },
    {
      title: "Published Date",
      dataIndex: "published",
    },

    {
      title: "Created By",
      dataIndex: "createdBy",
    },
    {
      title: "Applicable Units",
      dataIndex: "locationName",

      filterIcon: (filtered: any) =>
        selectedSystem?.length>0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8 }}>
            {systemList?.map((name: any) => (
              <div key={name.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedSystem([...selectedSystem, value]);
                      } else {
                        setSelectedSystem(
                          selectedSystem.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name.id}
                    checked={selectedSystem.includes(name.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {name.locationName}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <AntdButton
                type="primary"
                disabled={selectedSystem.length === 0}
                onClick={() => {
                  setSystemType(!isSystemType);
                  // handleChangePageNew(1,10)
                  // handlePagination(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </AntdButton>
              <AntdButton
                onClick={async () => {
                  setSelectedSystem([]);
                  setSystemType(false);
                  // handleChangePageNew(1,10)
                }}
              >
                Reset
              </AntdButton>
            </div>
          </div>
        );
      },
    },

    {
      title: "Action",
      key: "action",
      width: 200,
      render: (_: any, record: any) => (
        <>
          {record.isEdit && (
            <IconButton
              onClick={() => {
                handleEditTemplate(record);
              }}
              style={{ padding: "10px" }}
            >
              <CustomEditICon width={20} height={20} />
            </IconButton>
          )}

          {record.isEdit && (
            <IconButton
              onClick={() => {
                handleOpen(record);
              }}
              style={{ padding: "10px" }}
            >
              <CustomDeleteICon width={20} height={20} />
            </IconButton>
          )}
        </>
      ),
    },
  ];
  /**
   * @method parseData
   * @description Function to parse all the table data which was fetched from the server
   * @param data {any}
   * @returns a segregated json object containing the table data
   */
  const parseData = (data: any) => {
    return data.map((item: any) => {
      return {
        id: item._id,
        title: (
          <Tooltip title="click to see preview" placement="right">
            <Link
              to="/audit/auditchecklist/create"
              state={{
                edit: isOrgAdmin || isMR || isLocAdmin,
                id: item._id,
                preview: true,
              }}
              style={{ color: "black" }}
            >
              {item.title ?? "-"}
            </Link>
          </Tooltip>
        ),
        state: item.isDraft ? "Draft" : "Published",
        published:
          !item.publishedDate ? "-" : item.publishedDate,
        createdBy: item.createdBy ?? "-",
        locationName: (
          <MultiUserDisplay data={item?.locationName} name="locationName" />
        ),
        isEdit: item.isEdit,
      };
    });
  };

  /**
   * @method getTemplates
   * @description Function to handle the network call for fetching the table data
   * @param skip {number}
   * @param count {number}
   */
  const getTemplates = (skip: number, count: number) => {
    getAllTemplates(skip, count, searchText, selectedSystem)
      .then((response: any) => {
        const data = parseData(response.data.template);
        setCount(response.data.count);
        setTableData(data);
      })
      .catch((error: any) => {
        enqueueSnackbar(`${error}`, {
          variant: "error",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  /**
   * @method handleEditTemplate
   * @description Function to perform edit action when the edit button is clicked on a table row
   * @param data {any}
   * @returns nothing
   */
  const handleEditTemplate = (data: any) => {
    navigate("/audit/auditchecklist/create", {
      state: {
        edit: true,
        id: data.id,
      },
    });
  };

  /**
   * @method handleDeleteTemplate
   * @description Function to perform delete action when delete button is clicked on a table row
   * @param data {any}
   * @returns nothing
   */
  const handleDeleteTemplate = () => {
    deleteTemplate(deleteTemplates.id)
      .then((response: any) => {
        enqueueSnackbar("Successfully deleted template", {
          variant: "success",
        });
        setSkip(1);
        getTemplates(skip, rowsPerPage);
        handleClose();
      })
      .catch((error: any) => console.log("error - ", error));
  };

  /**
   * @method parseUserListing
   * @description Function to parse user listing
   * @param data any
   * @returns the parsed user listing for typeahead search selection
   */
  const parseUserListing = (data: any) => {
    return data.map((item: any) => {
      return {
        name: `${item?.firstname} ${item?.lastname}`,
        value: item?.id,
      };
    });
  };

  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(true);
      getTemplates(skip, rowsPerPage);
      getAllUsers();
    }
    locOptions();
  }, []);

  const handleChangePageNew = (pagelimit: any, pagesize: any) => {
    setSkip(pagelimit);
    setRowsPerPage(pagesize);
    setIsLoading(true);
    getTemplates(pagelimit, pagesize);
  };

  const handleClickDiscard = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchText("");
    setsearchQuery({ searchQuery: "" });
    getAllTemplates(1, 10, "", selectedSystem)
      .then((response: any) => {
        const data = parseData(response.data.template);
        setCount(response.data.count);
        setTableData(data);
      })
      .catch((error: any) => {
        enqueueSnackbar("Something went wrong!", {
          variant: "error",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDeleteTemplate}
      />
      {/* <FilterDrawer
        open={filterOpen}
        setOpen={setFilterOpen}
        resultText={count ? `Showing ${count} Result(s)` : `No Results Found`}
        handleApply={handleApply}
        handleDiscard={handleDiscard}
      >
        <SearchBar
          placeholder="By Checklist Name"
          name="templateName"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <Autocomplete
          style={{
            background: "white",
            borderRadius: "6px",
            outline: "none",
          }}
          disabled={false}
          fullWidth
          id="combo-box-demo"
          options={userListing}
          size="small"
          onChange={(e: any, value: any) => {
            setSearchValue({
              ...searchValue,
              createdBy: value?.value,
            });
            // getAllSubSystemTypes(value?.value);
          }}
          getOptionLabel={(option: any) => option?.name}
          renderInput={(params: any) => (
            <TextField
              {...params}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ fontSize: 18, paddingLeft: 5 }} />
                  </InputAdornment>
                ),
              }}
              placeholder="By Creator"
              variant="outlined"
              size="small"
            />
          )}
        />
        <div style={{ height: "10px" }} />
      </FilterDrawer> */}

      {/* <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" color="primary">
          Audit Checklist
        </Typography>

        <Box display="flex" alignItems="center" justifyContent="flex-end">
          <Box className={classes.filterButtonContainer}>
            <Tooltip title="Filter">
              <Fab
                size="medium"
                className={classes.fabButton}
                onClick={() => setFilterOpen(true)}
              >
                <FilterListIcon />
              </Fab>
            </Tooltip>
          </Box>
          <Tooltip title="Add Template">
            <Fab
              size="medium"
              className={classes.fabButton}
              disabled={!(isOrgAdmin || isMR || isLocAdmin)}
              onClick={() => navigate("/audit/auditchecklist/create")}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Box> */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingBottom: "10px",
        }}
      >
        {/* <SearchBar
          placeholder="By Checklist Name"
          name="searchQuery"
          handleChange={handleSearchChange}
          values={searchText}
          handleApply={handleApply}
          endAdornment={true}
          handleClickDiscard={handleClickDiscard}
        /> */}
        <SearchBar
          placeholder="By Checklist Name"
          name="searchQuery"
          values={searchQuery}
          handleChange={handleSearchChange}
          handleApply={handleApply}
          endAdornment={true}
          handleClickDiscard={handleClickDiscard}
        />
        {(isOrgAdmin || isMR) && (
          <Button
            onClick={() => {
              // setModalVisible(true);
              // getEntity();
              navigate("/audit/auditchecklist/create");
            }}
            style={{
              backgroundColor: "#0E497A",
              color: "#ffffff",
              marginLeft: "20px",
            }}
          >
            Add
          </Button>
        )}
      </div>

      {/* <Box className={classes.searchContainer}>
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          <SearchBar
            placeholder="Search"
            name="searchQuery"
            values={searchQuery}
            handleChange={handleSearch}
            handleApply={handleTableSearch}
            endAdornment={true}
            handleClickDiscard={handleDiscard}
          />
        </Box>
      </Box> */}
      {isLoading ? (
        <Box
          marginY="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress />
        </Box>
      ) : tableData?.length > 0 ? (
        <Box className={classes.root}>
          {/* <CustomTable
            header={headersData}
            fields={fieldsData}
            data={tableData}
            isAction={data.isAction}
            actions={
              isOrgAdmin || isMR || isLocAdmin
                ? [
                    {
                      label: "Edit",
                      icon: <MdEdit fontSize="small" />,
                      handler: handleEditTemplate,
                    },
                    {
                      label: "Delete",
                      icon: <MdDelete fontSize="small" />,
                      handler: handleOpen,
                    },
                  ]
                : []
            }
          /> */}
          <Table
            className={classes.newTableContainer}
            // rowClassName={() => "editable-row"}
            dataSource={tableData}
            columns={cols}
            pagination={false}
            rowKey={(record: any) => record?.ncObsId?.props?.children}

            // scroll={{ x: 700, }}
          />
          <div className={classes.pagination}>
            <Pagination
              size="small"
              current={skip}
              pageSize={rowsPerPage}
              total={count}
              showTotal={showTotal}
              showSizeChanger
              showQuickJumper
              onChange={(page, pageSize) => {
                handleChangePageNew(page, pageSize);
              }}
            />
          </div>
          {/* <SimplePaginationController
            count={count}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={changePage}
          /> */}
        </Box>
      ) : (
        <>
          <div className={classes.emptyTableImg}>
            <img
              src={EmptyTableImg}
              alt="No Data Found"
              height="400px"
              width="300px"
            />
          </div>
          <Typography align="center" className={classes.emptyDataText}>
            Let’s begin by adding a Template
          </Typography>
        </>
      )}
    </>
  );
}
