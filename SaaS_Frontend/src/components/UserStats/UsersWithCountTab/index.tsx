import axios from "apis/axios.global";
import { useEffect, useState } from "react";
import { Table, DatePicker, Pagination } from "antd";
import moment from "moment";
import useStyles from "pages/UserStats/styles";
const { RangePicker } = DatePicker;

type Props = {
  activeKey: string;
};

const UserWithCountTab = ({ activeKey }: Props) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStats, setTotalStats] = useState(0);
  const classes = useStyles();
  useEffect(() => {
    getStats();
  }, [page, rowsPerPage, activeKey]);

  useEffect(() => {
    console.log("checks tableData", tableData);
  }, [tableData]);
  const getStats = async () => {
    try {
      const query = `?page=${page}&limit=${rowsPerPage}`;

      const response = await axios.get(`/api/stats/getAllEntries${query}`);

      console.log("checks response", response);

      setTableData(response.data.stats);
      setTotalStats(response.data.total);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
      width : 350,
    },
    {
      title: "Logged In",
      dataIndex: "count",
      key: "count",
      render: (text: any) => <span>{text} time(s)</span>,
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
    <>
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
    </>
  );
};
export default UserWithCountTab;
