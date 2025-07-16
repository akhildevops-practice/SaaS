import axios from "apis/axios.global";
import { useEffect, useState } from "react";
import { Table, DatePicker, Pagination, Button } from "antd";
import {
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";
import moment from "moment";
import useStyles from "pages/UserStats/styles";
import { useSnackbar } from "notistack";
const { RangePicker } = DatePicker;

type Props = {
  activeKey: string;
};

function arrayToQueryString(key: any, array: any) {
  // console.log("checkdashboard arrayToQueryString", key, array);

  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}

const TransactionsTab = ({ activeKey }: Props) => {
  const { enqueueSnackbar } = useSnackbar();

  const [tableData, setTableData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStats, setTotalStats] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [selectedDate, setSelectedDate] = useState<any>({
    start: null,
    end: null,
  });
  const classes = useStyles();
  useEffect(() => {
    if (activeKey === "2") {
      getLocationFilterList();
    }
  }, [activeKey]);

  useEffect(() => {
    if (activeKey === "2") {
      getStats(selectedDate?.start, selectedDate?.end, selectedLocation);
    }
  }, [page, rowsPerPage, activeKey]);

  useEffect(() => {
    console.log("checks tableData", tableData);
  }, [tableData]);
  const getStats = async (
    startDate: string = "",
    endDate: string = "",
    locationArray: any = []
  ) => {
    try {
      // console.log(
      //   "checkdashboard startDate endDate rowsperpage page total",
      //   startDate,
      //   endDate,
      //   rowsPerPage,
      //   page,
      //   totalStats
      // );

      let queryStringParts = [];
      const paginationQuery = `?page=${page}&limit=${rowsPerPage}`;
      queryStringParts.push(paginationQuery);
      let dateQuery = "",
        locationQuery;
      if (startDate && endDate) {
        dateQuery += `&start=${startDate}&end=${endDate}`;
        queryStringParts.push(dateQuery);
      }
      if (locationArray.length > 0) {
        locationQuery = arrayToQueryString("location", locationArray);
        queryStringParts.push(locationQuery);
      }
      queryStringParts = queryStringParts.filter((part) => part.length > 0);
      // console.log("checkdashboard queryStringParts", queryStringParts);

      const finalqueryString = queryStringParts.join("&");

      const response = await axios.get(
        `/api/stats/getAllTransactions${finalqueryString}`
      );
      console.log("checkdashboard response", response);
      
      // if (response?.status === 200) {
      //   if (response?.data?.stats?.length) {
      //     const formattedData = response?.data?.stats.map((item: any) => ({
      //       _id: item._id,
      //       userId: item.userId,
      //       createdAt: item.createdAt,
      //       updatedAt: item.updatedAt,
      //       user: {
      //         email: item?.user?.email,
      //         id: item?.user?.id,
      //         firstname: item?.user?.firstname,
      //         lastname: item?.user?.lastname,
      //         avatar: item?.user?.avatar,
      //         username: item?.user?.username,
      //       },
      //       location: item?.user?.location,
      //     }));
      //     setTableData(formattedData);
      //     setTotalStats(response?.data?.total);
      //   } else {
      //     setTableData([]);
      //     setRowsPerPage(10);
      //     setPage(1);
      //     setTotalStats(0);
      //   }
      // } else {
      //   setTableData([]);
      //   setRowsPerPage(10);
      //   setPage(1);
      //   setTotalStats(0);
      //   enqueueSnackbar("Error in Fetching Data", {
      //     variant: "warning",
      //   });
      // }
    } catch (error) {
      setTableData([]);
      setRowsPerPage(10);
      setPage(1);
      setTotalStats(0);
      console.error(error);
    }
  };
  const getLocationFilterList = async () => {
    const response = await axios.get(`/api/location/getAllLocationList`);
    setLocationOptions(response.data);
  };
  const handleDateChange = (dates: any) => {
    if (dates) {
      const [start, end] = dates;
      setSelectedDate({
        start: start.format("YYYY-MM-DD"),
        end: end.format("YYYY-MM-DD"),
      });

      getStats(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
    } else {
      setSelectedDate({
        start: null,
        end: null,
      });
      getStats();
    }
  };

  const handleFilterApply = () => {
    setRowsPerPage(10);
    setPage(1);
    setTotalStats(0);
    // console.log(
    //   "checkdashboard selectedLocation in filter apply",
    //   selectedLocation
    // );

    getStats(selectedDate.start, selectedDate.end, selectedLocation);
  };

  const handleResetFilters = () => {
    setSelectedLocation([]);
    setRowsPerPage(10);
    setPage(1);
    setTotalStats(0);
    getStats(selectedDate.start, selectedDate.end, []);
  };

  const columns = [
    {
      title: "Unit",
      dataIndex: ["location", "locationName"],
      key: "locationName",
      render: (_: any, record: any) => {
        return record?.location?.locationName; // Return the locationName
      },
      filterIcon: (filtered: any) =>
        selectedLocation?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        // Create a set to store unique names
        const uniqueNames = new Set();

        // Iterate through allAuditPlanDetails and add unique names to the set
        tableData?.forEach((item: any) => {
          const name = {
            id: item?.location?.id,
            locationName: item?.location?.locationName,
          };

          uniqueNames.add(name);
        });

        // Convert the set back to an array for rendering
        const uniqueNamesArray = Array.from(uniqueNames);
        const seen = new Set();

        // Create an array to store the unique items
        const uniqueData: any[] = [];

        // Loop through the data array, check for duplicates, and exclude empty objects
        uniqueNamesArray.forEach((item: any) => {
          if (Object.keys(item).length > 0) {
            if (item.id !== undefined) {
              // Check if the object is not empty
              const itemString = JSON.stringify(item); // Convert the object to a string for comparison
              if (!seen.has(itemString)) {
                seen.add(itemString);
                uniqueData.push(item);
              }
            }
          }
        });
        return (
          <div style={{ padding: 8, overflowY: "auto", height: "150px" }}>
            {locationOptions.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      const selectedValues = [...selectedLocation, value];
                      console.log("Targetvalue", value);
                      if (e.target.checked) {
                        setSelectedLocation([...selectedLocation, value]);
                      } else {
                        setSelectedLocation(
                          selectedLocation.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedLocation.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />

                  {item.locationName}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedLocation.length === 0}
                onClick={() => {
                  handleFilterApply();
                  confirm();
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedLocation([]);
                  handleResetFilters();
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
      width: 350,
    },
    {
      title: "LoggedIn At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: any) => moment(text).format("DD/MM/YYYY HH:mm"),
    },
  ];

  const handleChangePage = (page: number, pageSize: number) => {
    setPage(page);
    setRowsPerPage(pageSize);
  };

  const showTotal = (total: number) => `Total ${total} items`;

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <RangePicker onChange={handleDateChange} />
      </div>
      <div className={classes.tableContainer}>
        <Table
          dataSource={tableData}
          columns={columns}
          rowKey="_id"
          pagination={false}
        />
      </div>
      <div className={classes.pagination}>
        <Pagination
          size="small"
          current={page}
          pageSize={rowsPerPage}
          total={totalStats}
          showTotal={showTotal}
          showSizeChanger
          showQuickJumper
          onChange={handleChangePage}
        />
      </div>
    </div>
  );
};
export default TransactionsTab;
