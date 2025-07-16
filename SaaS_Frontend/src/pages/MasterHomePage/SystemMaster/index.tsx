import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tooltip,
  CircularProgress,
  IconButton,
  useMediaQuery,
} from "@material-ui/core";
import FilterDrawer from "components/FilterDrawer";
import SearchBar from "components/SearchBar";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import { useSnackbar } from "notistack";
import { MdEdit } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import useStyles from "./styles";
import MultiUserDisplay from "components/MultiUserDisplay";
import {
  getAllSystems,
  getSystemTypes,
  searchSystem,
} from "apis/systemApi";
import checkRoles from "utils/checkRoles";
import { useResetRecoilState } from "recoil";
import { systemDetailFormData, clauseData } from "recoil/atom";
import getAppUrl from "utils/getAppUrl";
import DropDownFilter from "components/DropDownFilter";
import checkActionsAllowed from "utils/checkActionsAllowed";
import ConfirmDialog from "components/ConfirmDialog";
import axios from "apis/axios.global";
import Table, { ColumnsType } from "antd/es/table";
import { Divider, Pagination, PaginationProps } from "antd";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";

export default function SystemMaster() {
  const matches = useMediaQuery("(min-width:822px)");
  const resetSystemDetailForm = useResetRecoilState(systemDetailFormData);
  const resetClauseData = useResetRecoilState(clauseData);
  const [count, setCount] = useState<number>(10);
  const [systemTypes, setSystemTypes] = useState<any>([]);
  const [skip, setSkip] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchValue, setSearchValue] = useState<any>({});
  const [tableData, setTableData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const userdetails: any = sessionStorage.getItem("userDetails");
  const userid: any = JSON.parse(userdetails).id;
  const [deleteSystem, setDeleteSystem] = useState<any>();
  const [isGraphSectionVisible, setIsGraphSectionVisible] = useState(false);
  const classes = useStyles({
    isGraphSectionVisible: isGraphSectionVisible,
  });
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isAdmin = checkRoles("admin");
  const isMR = checkRoles("MR");
  const navigate = useNavigate();
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();

  /**
   * @method parseSystemTypes
   * @description Function to print system types
   * @param data {any}
   * @returns an array of system types
   */
  const parseSystemTypes = (data: any) => {
    const systemTypes: any = [];
    data.map((item: any) => {
      systemTypes.push({
        name: item.name,
        value: item.id,
        isAction: checkActionsAllowed(item.access, ["Edit"], true),
      });
    });
    return systemTypes;
  };

  /**
   * @method fetchSystemTypes
   * @description Function to fetch system types
   * @returns nothing
   */
  const fetchSystemTypes = () => {
    try {
      getSystemTypes(getAppUrl())
        .then(async (response: any) => {
          setSystemTypes(parseSystemTypes(response?.data));
        })
        .catch((error: any) => {
          enqueueSnackbar("Something went wrong while fetching system types!", {
            variant: "error",
          });
        });
    } catch (error) {
      // Handle any errors that occur in the try block here
      console.error("An error occurred in the try block:", error);
    }
  };

  /**
   * @method handleSearchChange
   * @description Function to handle search field value changes inside the filter drawer container
   * @param e {any}
   * @returns nothing
   */
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchValue({
      ...searchValue,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * @method handleDiscard
   * @description Function to remove all the filter text present in the fields
   * @returns nothing
   */
  const handleDiscard = () => {
    setSearchValue({
      location: "",
      systemType: "",
      systemName: "",
    });
  };

  /**
   * @method handleApply
   * @description Function to perform a network call for filtering the table data
   * @returns nothing
   */
  const handleApply = () => {
    setIsLoading(true);
    if (Object.values(searchValue).every((v) => v === "")) {
      getSystemListing(skip, rowsPerPage);
      setPage(1);
      return;
    }

    searchSystem(
      searchValue?.systemType ?? "",
      searchValue?.systemName ?? "",
      searchValue?.location ?? "",
      skip,
      rowsPerPage,
      {
        realmName: realmName,
      }
    )
      .then((res: any) => {
        const data = parseData(res?.data?.systems);
        setCount(res?.data?.count);
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
   * @method changePage
   * @description Function to change the page on the pagination controller
   * @param pageNumber {number}
   * @returns nothing
   */
  const changePage = (pageNumber: number) => {
    getSystemListing(rowsPerPage * (pageNumber - 1), rowsPerPage);
    setPage(pageNumber);
  };

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

  const headersData = ["System Type", "System Name", "Applicable Locations"];
  const fieldsData = ["title", "state", "published"];

  const columns: ColumnsType<any> = [
    {
      title: "System Name",
      dataIndex: "state",
      key: "state",
    },

    {
      title: "System Type",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Applicable Locations",
      dataIndex: "published",
      key: "published",
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: any, record: any) => (
        <>
          {isOrgAdmin && (
            <IconButton
              onClick={() => {
                handleEditSystem(record);
              }}
              className={classes.actionButtonStyle}
              data-testid="action-item"
            >
              <CustomEditICon width={18} height={18} />
            </IconButton>
          )}

          <Divider type="vertical" className={classes.NavDivider} />
          {isOrgAdmin && (
            <IconButton
              onClick={() => {
                handleOpen(record);
              }}
              className={classes.actionButtonStyle}
              data-testid="action-item"
            >
              <CustomDeleteICon width={18} height={18} />
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
      {
        console.log("item - ", { item });
      }
      return {
        id: item?._id,
        title: item?.type ?? "-",
        state: (
          <Tooltip title="click to view system details" placement="right">
            <Link
              to="/master/system/create"
              state={{
                edit: isOrgAdmin || isLocAdmin || isMR,
                read: true,
                id: item?._id,
                preview: true,
              }}
              style={{ textDecoration: "none ", color: "black" }}
            >
              {item?.name ?? "-"}
            </Link>
          </Tooltip>
        ),
        isAction: checkActionsAllowed(item.access, ["Edit", "Delete"], true),
        published: (
          <MultiUserDisplay
            data={item?.applicable_locations}
            name="locationName"
          />
        ),
      };
    });
  };

  /**
   * @method getSystemListing
   * @description Function to handle the network call for fetching the table data
   * @param skip {number}
   * @param count {number}
   */
  const getSystemListing = (skip: number, count: number) => {
    getAllSystems(skip, count)
      .then((response: any) => {
        const data = parseData(response?.data?.systems);
        setCount(response?.data?.count);
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
   * @method handleEditTemplate
   * @description Function to perform edit action when the edit button is clicked on a table row
   * @param data {any}
   * @returns nothing
   */
  const handleEditSystem = (data: any) => {
    navigate("/master/system/create", {
      state: {
        edit: true,
        id: data?.id,
      },
    });
  };

  const handleOpen = (val: any) => {
    console.log("Val", val);
    setOpen(true);
    setDeleteSystem(val);
  };

  /**
   * @method handleDeleteTemplate
   * @description Function to perform delete action when delete button is clicked on a table row
   * @param data {any}
   * @returns nothing
   */
  // const handleDelete = (data: any) => {
  //   setOpen(false);

  //   deleteSystem(data?.id)
  //     .then((response: any) => {
  //       enqueueSnackbar("Successfully deleted template", {
  //         variant: "success",
  //       });
  //       setSkip(0);
  //       getSystemListing(skip, rowsPerPage);
  //     })
  //     .catch((error: any) => console.error("error - ", error));
  // };

  console.log("deleteSystem", deleteSystem);
  const handleDelete = async () => {
    setOpen(false);

    await axios
      .delete(`/api/systems/${deleteSystem.id}`)
      .then(() =>
        enqueueSnackbar(`Operation Successfull`, { variant: "success" })
      )
      .catch((err: any) => {
        enqueueSnackbar(`Could not delete record`, {
          variant: "error",
        });
        console.error(err);
      });
    // const result = await axios.post(`/api/audit-trial/createAuditTrial`, {
    //   moduleType: "SYSTEM",
    //   actionType: "DELETE",
    //   transactionId: deleteSystem.id,
    //   actionBy: userid,
    // });
    setSkip(0);
    getSystemListing(skip, rowsPerPage);
  };

  useEffect(() => {
    setIsLoading(true);
    getSystemListing(skip, count);
    fetchSystemTypes();
  }, []);

  const rowClassName = (record: any, index: number) => {
    return index % 2 === 0
      ? classes.alternateRowColor1
      : classes.alternateRowColor2;
  };

  const handleChangePageNew = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
    getSystemListing(rowsPerPage * (page - 1), rowsPerPage);
    setPage(page);
  };

  return (
    // <div className={classes.root}>
    <>
      <FilterDrawer
        open={filterOpen}
        setOpen={setFilterOpen}
        resultText={count ? `Showing ${count} Result(s)` : `No Results Found`}
        handleApply={handleApply}
        handleDiscard={handleDiscard}
      >
        <SearchBar
          placeholder="By System Name"
          name="systemName"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By Location"
          name="location"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <DropDownFilter
          handleApply={handleApply}
          values={searchValue}
          placeholder="By System Type"
          optionList={systemTypes}
          handleChange={handleSearchChange}
          defaultOption={true}
          defaultOptionPlaceholder="Select system type"
          name="systemType"
        />
      </FilterDrawer>

      <ConfirmDialog
        open={open}
        handleClose={() => setOpen(false)}
        handleDelete={handleDelete}
      />

      {/* <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        style={{ padding: "8px" }}
      >
        <Typography variant="h6" color="primary">
          System Clause Management
        </Typography>
      </Box> */}

      {isLoading ? (
        <Box
          marginY="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
          marginTop="15px"
        >
          <CircularProgress />
        </Box>
      ) : tableData?.length > 0 ? (
        // <Box pt={4}>
        //   <CustomTable
        //     header={headersData}
        //     fields={fieldsData}
        //     data={tableData}
        //     isAction={data.isAction}
        //     actions={
        //       isLocAdmin || isMR || isOrgAdmin
        //         ? [
        //             {
        //               label: "Edit",
        //               icon: <MdEdit fontSize="small" />,
        //               handler: handleEditSystem,
        //             },
        //             {
        //               label: "Delete",
        //               icon: <MdDelete fontSize="small" />,
        //               handler: handleOpen,
        //             },
        //           ]
        //         : []
        //     }
        //   />
        <>
          <div
            data-testid="custom-table"
            className={classes.tableContainer}
            style={{ marginTop: "10px" }}
          >
            <Table
              dataSource={tableData}
              pagination={false}
              columns={columns}
              size="middle"
              rowKey={"id"}
              className={classes.locationTable}
              // rowClassName={rowClassName}
            />
            {/* <SimplePaginationController
              count={count}
              page={page}
              rowsPerPage={10}
              handleChangePage={changePage}
            /> */}
            <div className={classes.pagination}>
              <Pagination
                size="small"
                current={page}
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
          </div>
        </>
      ) : (
        // </Box>
        <>
          <div className={classes.imgContainer}>
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
    // </div>
  );
}
