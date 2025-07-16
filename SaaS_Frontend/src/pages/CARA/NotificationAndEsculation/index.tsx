import { useEffect, useState } from "react";
import { Table, Select, Input, Button } from "antd";
import { AiOutlinePlusCircle, AiOutlineDelete } from "react-icons/ai";
import styles from "./styles";
import axios from "apis/axios.global";
const { Option } = Select;

const NotificationAndEscalation = () => {
  const classes = styles();
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  useEffect(() => {
    getAllUsers();
  }, []);

  const [allUsers, setAllUsers] = useState<any[]>([]);

  const getAllUsers = async () => {
    const result = await axios.get(
      `/api/riskregister/users/${userDetail?.organizationId}`
    );
    setAllUsers(result.data);
    console.log("getAllUsers", result);
  };

  const [data1, setData1] = useState([
    { key: 1, type: "", days: "", owner: "", cc: [] },
  ]);
  const [data2, setData2] = useState([
    { key: 1, type: "", days: "", owner: "", cc: [] },
  ]);
  const [data3, setData3] = useState([
    { key: 1, type: "", days: "", owner: "", cc: [] },
  ]);

  const handleAddRow = (setData: any, data: any) => {
    setData([
      ...data,
      { key: Date.now(), type: "", days: "", owner: "", cc: [] },
    ]);
  };

  const handleAddRow2 = (setData2: any, data2: any) => {
    setData2([
      ...data2,
      { key: Date.now(), type: "", days: "", owner: "", cc: [] },
    ]);
  };

  const handleAddRow3 = (setData3: any, data3: any) => {
    setData3([
      ...data3,
      { key: Date.now(), type: "", days: "", owner: "", cc: [] },
    ]);
  };

  const handleDeleteRow = (setData: any, data: any, key: any) => {
    setData(data.filter((row: any) => row.key !== key));
  };

  const handleDeleteRow2 = (setData2: any, data2: any, key: any) => {
    setData2(data2.filter((row: any) => row.key !== key));
  };

  const handleDeleteRow3 = (setData3: any, data3: any, key: any) => {
    setData3(data3.filter((row: any) => row.key !== key));
  };

  const handleChange = (
    setData: any,
    data: any,
    value: any,
    key: any,
    column: any
  ) => {
    const newData = data.map((item: any) => {
      if (item.key === key) {
        if (column === "owner" && value !== "Named User") {
          return { ...item, [column]: value, users: [] }; // Reset Users if Owner is not 'Global User'
        }
        return { ...item, [column]: value };
      }
      return item;
    });

    setData(newData);
  };

  const handleChange2 = (
    setData: any,
    data: any,
    value: any,
    key: any,
    column: any
  ) => {
    const newData = data2.map((item: any) => {
      if (item.key === key) {
        if (column === "owner" && value !== "Named User") {
          return { ...item, [column]: value, users: [] }; // Reset Users if Owner is not 'Global User'
        }
        return { ...item, [column]: value };
      }
      return item;
    });

    setData2(newData);
  };

  // const handleChange2 = (
  //   setData2: any,
  //   data2: any,
  //   value: any,
  //   key: any,
  //   column: any
  // ) => {
  //   setData2(
  //     data2.map((row: any) =>
  //       row.key === key ? { ...row, [column]: value } : row
  //     )
  //   );
  // };

  const handleChange3 = (
    setData: any,
    data: any,
    value: any,
    key: any,
    column: any
  ) => {
    const newData = data3.map((item: any) => {
      if (item.key === key) {
        if (column === "owner" && value !== "Named User") {
          return { ...item, [column]: value, users: [] }; // Reset Users if Owner is not 'Global User'
        }
        return { ...item, [column]: value };
      }
      return item;
    });

    setData3(newData);
  };

  // const handleChange3 = (
  //   setData2: any,
  //   data2: any,
  //   value: any,
  //   key: any,
  //   column: any
  // ) => {
  //   setData3(
  //     data3.map((row: any) =>
  //       row.key === key ? { ...row, [column]: value } : row
  //     )
  //   );
  // };

  const columns1 = [
    {
      title: "Type",
      dataIndex: "type",
      width: 300,
      render: (value: any, record: any) => (
        <Select
          value={value}
          onChange={(val) =>
            handleChange(setData1, data1, val, record.key, "type")
          }
          style={{ width: "100%" }}
          placeholder="Select Type"
        >
          <Option value="Reminder">Reminder</Option>
          <Option value="Escalation">Escalation</Option>
        </Select>
      ),
    },
    {
      title: "Days",
      dataIndex: "days",
      width: 200,
      render: (value: any, record: any) => (
        <Input
          type="number"
          value={value}
          onChange={(e) =>
            handleChange(setData1, data1, e.target.value, record.key, "days")
          }
        />
      ),
    },
    {
      title: "Owner",
      dataIndex: "owner",
      width: 300,
      render: (value: any, record: any) => (
        <Select
          value={value}
          onChange={(val) =>
            handleChange(setData1, data1, val, record.key, "owner")
          }
          style={{ width: "100%" }}
        >
          <Option value="Entity Head">Entity Head</Option>
          <Option value="Named User">Named User</Option>
          <Option value="CAPA Owner">CAPA Owner</Option>
        </Select>
      ),
    },
    {
      title: "Users",
      dataIndex: "users",
      width: 300,
      render: (value: any, record: any) => {
        const isGlobalUser = record.owner === "Named User"; // Check if owner is 'Global User'
        return (
          <Select
            mode="multiple"
            value={value}
            onChange={(val) =>
              handleChange(setData1, data1, val, record.key, "users")
            }
            style={{ width: "100%" }}
            disabled={!isGlobalUser} // Disable if owner is not "Global User"
            placeholder={"Select Users"}
          >
            {allUsers.map((item: any) => (
              <Option key={item.id} value={item.id}>
                {item?.username}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "CC",
      dataIndex: "cc",
      width: 400,
      render: (value: any, record: any) => (
        <Select
          mode="multiple"
          value={value}
          onChange={(val) =>
            handleChange(setData1, data1, val, record.key, "cc")
          }
          style={{ width: "100%" }}
        >
          {allUsers.map((item: any) => (
            <Option key={item.id} value={item.id}>
              {item?.username}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          onClick={() => handleDeleteRow(setData1, data1, record.key)}
        >
          <AiOutlineDelete />
        </Button>
      ),
    },
  ];

  const columns2 = [
    {
      title: "Type",
      dataIndex: "type",
      width: 300,
      render: (value: any, record: any) => (
        <Select
          value={value}
          onChange={(val) =>
            handleChange2(setData2, data2, val, record.key, "type")
          }
          style={{ width: "100%" }}
        >
          <Option value="Reminder">Reminder</Option>
          <Option value="Escalation">Escalation</Option>
        </Select>
      ),
    },
    {
      title: "Days",
      dataIndex: "days",
      width: 200,
      render: (value: any, record: any) => (
        <Input
          type="number"
          value={value}
          onChange={(e) =>
            handleChange2(setData2, data2, e.target.value, record.key, "days")
          }
        />
      ),
    },
    {
      title: "Owner",
      dataIndex: "owner",
      width: 300,
      render: (value: any, record: any) => (
        <Select
          value={value}
          onChange={(val) =>
            handleChange2(setData2, data2, val, record.key, "owner")
          }
          style={{ width: "100%" }}
        >
          <Option value="Entity Head">Entity Head</Option>
          <Option value="Named User">Named User</Option>
          <Option value="CAPA Owner">CAPA Owner</Option>
        </Select>
      ),
    },
    {
      title: "Users",
      dataIndex: "users",
      width: 300,
      render: (value: any, record: any) => {
        const isGlobalUser = record.owner === "Named User"; // Check if owner is 'Global User'
        return (
          <Select
            mode="multiple"
            value={value}
            onChange={(val) =>
              handleChange2(setData2, data2, val, record.key, "users")
            }
            style={{ width: "100%" }}
            disabled={!isGlobalUser} // Disable if owner is not "Global User"
            placeholder={"Select Users"}
          >
            {allUsers.map((item: any) => (
              <Option key={item.id} value={item.id}>
                {item?.username}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "CC",
      dataIndex: "cc",
      width: 400,
      render: (value: any, record: any) => (
        <Select
          mode="multiple"
          value={value}
          onChange={(val) =>
            handleChange2(setData2, data2, val, record.key, "cc")
          }
          style={{ width: "100%" }}
        >
          {allUsers.map((item: any) => (
            <Option key={item.id} value={item.id}>
              {item?.username}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          onClick={() => handleDeleteRow2(setData2, data2, record.key)}
        >
          <AiOutlineDelete />
        </Button>
      ),
    },
  ];

  const columns3 = [
    {
      title: "Type",
      dataIndex: "type",
      width: 300,
      render: (value: any, record: any) => (
        <Select
          value={value}
          onChange={(val) =>
            handleChange3(setData3, data3, val, record.key, "type")
          }
          style={{ width: "100%" }}
        >
          <Option value="Reminder">Reminder</Option>
          <Option value="Escalation">Escalation</Option>
        </Select>
      ),
    },
    {
      title: "Days",
      dataIndex: "days",
      width: 200,
      render: (value: any, record: any) => (
        <Input
          type="number"
          value={value}
          onChange={(e) =>
            handleChange3(setData3, data3, e.target.value, record.key, "days")
          }
        />
      ),
    },
    {
      title: "Owner",
      dataIndex: "owner",
      width: 300,
      render: (value: any, record: any) => (
        <Select
          value={value}
          onChange={(val) =>
            handleChange3(setData3, data3, val, record.key, "owner")
          }
          style={{ width: "100%" }}
        >
          <Option value="Entity Head">Entity Head</Option>
          <Option value="Named User">Named User</Option>
          <Option value="CAPA Owner">CAPA Owner</Option>
        </Select>
      ),
    },
    {
      title: "Users",
      dataIndex: "users",
      width: 300,
      render: (value: any, record: any) => {
        const isGlobalUser = record.owner === "Named User"; // Check if owner is 'Global User'
        return (
          <Select
            mode="multiple"
            value={value}
            onChange={(val) =>
              handleChange3(setData3, data3, val, record.key, "users")
            }
            style={{ width: "100%" }}
            disabled={!isGlobalUser} // Disable if owner is not "Global User"
            placeholder={"Select Users"}
          >
            {" "}
            {allUsers.map((item: any) => (
              <Option key={item.id} value={item.id}>
                {item?.username}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "CC",
      dataIndex: "cc",
      width: 400,
      render: (value: any, record: any) => (
        <Select
          mode="multiple"
          value={value}
          onChange={(val) =>
            handleChange3(setData3, data3, val, record.key, "cc")
          }
          style={{ width: "100%" }}
        >
          {allUsers.map((item: any) => (
            <Option key={item.id} value={item.id}>
              {item?.username}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          onClick={() => handleDeleteRow3(setData3, data3, record.key)}
        >
          <AiOutlineDelete />
        </Button>
      ),
    },
  ];

  return (
    <div style={{ margin: "0px 20px 20px 20px" }}>
      <h3> Awaiting Response </h3>
      <Button
        onClick={() => handleAddRow(setData1, data1)}
        icon={<AiOutlinePlusCircle />}
        style={{ backgroundColor: "#003059", color: "white" }}
      >
        Add Row
      </Button>
      <div className={classes.tableContainer}>
        <Table
          columns={columns1}
          dataSource={data1}
          pagination={false}
          style={{ marginTop: 10 }}
          className={classes.documentTable}
        />
      </div>

      <h3 style={{ marginTop: "50px" }}>Analysis </h3>
      <Button
        onClick={() => handleAddRow(setData2, data2)}
        icon={<AiOutlinePlusCircle />}
        style={{ backgroundColor: "#003059", color: "white" }}
      >
        Add Row
      </Button>
      <div className={classes.tableContainer}>
        <Table
          columns={columns2}
          dataSource={data2}
          pagination={false}
          style={{ marginTop: 10 }}
          className={classes.documentTable}
        />
      </div>

      <h3 style={{ marginTop: "50px" }}>Outcome Approval </h3>
      <Button
        onClick={() => handleAddRow(setData3, data3)}
        icon={<AiOutlinePlusCircle />}
        style={{ backgroundColor: "#003059", color: "white" }}
      >
        Add Row
      </Button>
      <div className={classes.tableContainer}>
        <Table
          columns={columns3}
          dataSource={data3}
          pagination={false}
          style={{ marginTop: 10 }}
          className={classes.documentTable}
        />
      </div>
    </div>
  );
};

export default NotificationAndEscalation;
