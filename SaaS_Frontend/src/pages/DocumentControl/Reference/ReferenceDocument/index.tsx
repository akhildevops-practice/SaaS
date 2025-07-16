import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Pagination,
  PaginationProps,
  Table,
  Tag,
} from "antd";
import useStyles from "./styles";
import axios from "apis/axios.global";
import { API_LINK } from "config";
import getAppUrl from "utils/getAppUrl";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { useSnackbar } from "notistack";
import ConfirmDialog from "components/ConfirmDialog";
import DocumentViewer from "components/Document/DocumentTable/DocumentViewDrawer/DocumentViewer";
import { Box } from "@material-ui/core";
import SearchBar from "components/SearchBar";
import checkRole from "utils/checkRoles";
import CloseIconImageSvg from "assets/documentControl/Close.svg";

type Props = {
  handleEdit: (data: any) => void;
  getData: any;
  datas: any;
  setDatas: any;
};

const ReferenceDocument = ({ handleEdit, getData, datas, setDatas }: Props) => {
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const [open, setOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedTopicName, setSelectedTopicName] = useState("");
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  const allOption = [{ id: "All", locationName: "All" }];
  const [locationNames, setLocationNames] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>([
    { id: "All", locationName: "All" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState<Location[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [opens, setOpens] = useState(false);
  const [selectedRef, setSelectedRef] = useState<any>(null);
  const [searchValue, setSearchValue] = useState<any>({
    searchQuery: userDetails?.location?.locationName,
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>();
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const classes = useStyles();

  // Handle click on topic
  const showDrawer = () => {
    setOpen(true);
  };

  // Handle modal close
  const onClose = () => {
    setOpen(false);
    //getData();
  };
  useEffect(() => {
    getData();
    setCount(datas.count);
  }, []);

  useEffect(() => {
    getAllDocuments(page, rowsPerPage);
    handleChangePageNew(1, 10);
  }, [searchValue]);

  const getAllDocuments = async (page: any, pageSize: any) => {
    const result = await axios.get(
      `/api/referenceDocuments/getAllReferenceDocuments?page=${page}&limit=${pageSize}&search=${searchValue?.searchQuery}`
    );
    const val = result?.data?.data?.map((item: any) => {
      const createdAtDate = new Date(item.createdAt);
      const formattedCreatedAt = createdAtDate.toISOString().split("T")[0];

      return {
        ...item,
        id: item._id,
        topic: item.topic,
        creator: item.creator,
        organizationId: item.organizationId,
        createdAt: formattedCreatedAt,
      };
    });
    const finalData = {
      data: val,
      count: result.data?.count,
      allLocations: result.data?.allLocations,
    };
    setDatas(finalData);
    setCount(result?.data?.count);
    setPage(page);
  };

  const handleDelete = async () => {
    // console.log("data111", selectedRef);
    const result = await axios.delete(
      API_LINK + `/api/referenceDocuments/${selectedRef.id}`
    );
    if (result.status === 200 || result.status === 201) {
      enqueueSnackbar(`Data Deleted successfully!`, {
        variant: "success",
      });
      handleClose();
    }
    getData();
  };

  const columns = [
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      width:400,
      render: (text: any, record: any) => (
        <a
          onClick={() => {
            showDrawer();
            setSelectedTopic(record.documentLink);
            setSelectedTopicName(record?.topic)
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
      width:220,
      render: (_: any, record: any) => {
        return <div> {record?.creator?.creatorName}</div>;
      },
    },
    {
      title: "Unit",
      dataIndex: "location",
      key: "location",
      width:220,
      render: (_: any, record: any) => {
        return (
          <div>
            {" "}
            {record?.location
              ?.map((location: any) => location?.locationName)
              .join(", ")}
          </div>
        );
      },
      onFilter: (value: any, record: any) => {
        return record.location.name === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        const uniqueNamesArray = datas.allLocations;

        if (uniqueNamesArray)
          return (
            <div style={{ padding: 8 }}>
              {uniqueNamesArray.map((name: any) => (
                <div key={name}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedKeys([...selectedKeys, value]);
                        } else {
                          setSelectedKeys(
                            selectedKeys.filter((key: any) => key !== value)
                          );
                        }
                      }}
                      value={name}
                      checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                    />
                    {name}
                  </label>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  onClick={() => {
                    setSearchValue({ searchQuery: selectedKeys });
                  }}
                  style={{ marginRight: 8 }}
                >
                  Filter
                </Button>
              </div>
            </div>
          );
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width:150,

      render: (_: any, record: any) => {
        return <div> {record?.createdAt}</div>;
      },
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, data: any, index: number) => {
        return (
          <>
            <div style={{ display: "flex", gap: "20px", fontSize: "15px" }}>
              <div style={{ cursor: "pointer" }}>
                {data.editAccess ? (
                  <CustomEditIcon
                    width={18}
                    height={18}
                    onClick={() => handleEdit(data)}
                  />
                ) : (
                  ""
                )}
              </div>
              <div style={{ cursor: "pointer" }}>
                {isOrgAdmin && (
                  <CustomDeleteICon
                    width={18}
                    height={18}
                    onClick={() => {
                      console.log("refff", _, data);
                      setOpens(true);
                      setSelectedRef(data);
                    }}
                    style={{ fontSize: "15px" }}
                  />
                )}
              </div>
            </div>
          </>
        );
      },
    },
  ];
  useEffect(() => {
    getLocationNames();
  }, []);

  const realmName = getAppUrl();

  const getLocationNames = async () => {
    setIsLoading(true);
    try {
      setIsLoading(true);
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );
      console.log("res", res);
      setLocationName(res.data[0].locationName);
      setLocationNames(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpens(false);
  };

  const handleSearchChange = (e: any) => {
    // console.log("change callws");

    e.preventDefault();
    setSearchValue({
      ...searchValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleApply = () => {
    // console.log("handleApply called");

    if (searchValue.searchQuery) {
      //fetchDocuments();
    }
  };

  const handleClickDiscard = () => {
    const url = `api/dashboard?searchQuery=${searchValue.searchQuery}&page=${page}&limit=${rowsPerPage}`;
    setSearchValue({
      ...searchValue,
      searchQuery: "",
    });
    //fetchDocuments(url);
  };

  const handleChangePageNew = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
    getAllDocuments(page, pageSize);
  };
console.log("selectedTopic",selectedTopic)
  return (
    <>
      <Box
        style={{
          width: "100%",
          backgroundColor: "#E8F3F9",
          height: "54 px",
        }}
      >
        <SearchBar
          placeholder="Search Document"
          name="searchQuery"
          values={searchValue}
          handleChange={handleSearchChange}
          handleApply={handleApply}
          endAdornment={true}
          handleClickDiscard={handleClickDiscard}
        />
      </Box>
      <ConfirmDialog
        open={opens}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />

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
      <div className={classes.tableContainer}>
        <Table
          // style={{ marginTop: "45px" }}
          columns={columns}
          dataSource={datas.data}
          rowKey="_id"
          className={classes.tableContainer}
          pagination={false}
        />

        <Drawer
          title="View Document"
          onClose={onClose}
          open={open}
          width={"45%"}
          className={classes.drawer}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{
                width: "36px",
                height: "38px",
                cursor: "pointer",
              }}
            />
          }
        >
          <div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
             <p style={{ whiteSpace: "pre-line" }}>
              {selectedTopicName}
            </p>
        
            <div>
              <Tag
                style={{
                  backgroundColor: "#7CBF3F",
                  height: "30px",
                  alignContent: "center",
                }}
                color={"white"}
                key={""}
                // className={classes?.statusTag}
              >
                {"Reference Document"}
              </Tag>
            </div>
          </div>
            
            <DocumentViewer fileLink={selectedTopic} />
          </div>
        </Drawer>
      </div>
    </>
  );
};

export default ReferenceDocument;
