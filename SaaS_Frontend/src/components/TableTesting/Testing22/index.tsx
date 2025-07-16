import React, { useState } from "react";
import { Table } from "antd";

const Testing22 = () => {
  const [data, setData] = useState([
    { key: "1", col1: "", col2: "Middle Cell", col3: "" },
    { key: "2", col1: "", col2: "Middle Cell", col3: "" },
    { key: "3", col1: "", col2: "Middle Cell", col3: "" },
  ]);

  const list1 = [
    { id: 1, name: "Item 1-1" },
    { id: 2, name: "Item 1-2" },
  ];
  const list2 = [
    { id: 3, name: "Item 3-1" },
    { id: 4, name: "Item 3-2" },
  ];

  const handleDragStart = (e: any, item: any, listType: any) => {
    e.dataTransfer.setData("item", JSON.stringify(item));
    e.dataTransfer.setData("listType", listType);
  };

  const handleDrop = (e: any, record: any, columnIndex: any) => {
    const item = JSON.parse(e.dataTransfer.getData("item"));
    const listType = e.dataTransfer.getData("listType");

    if (
      (columnIndex === "col1" && listType === "list1") ||
      (columnIndex === "col3" && listType === "list2")
    ) {
      setData((prevData) =>
        prevData.map((row) =>
          row.key === record.key ? { ...row, [columnIndex]: item.name } : row
        )
      );
    }
  };

  const columns = [
    {
      title: "Column 1",
      dataIndex: "col1",
      key: "col1",
      render: (text: any, record: any) => (
        <div
          onDrop={(e) => handleDrop(e, record, "col1")}
          onDragOver={(e) => e.preventDefault()}
          style={{ backgroundColor: "lightgray", minHeight: "50px" }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Column 2",
      dataIndex: "col2",
      key: "col2",
      render: (text: any, record: any) => (
        <div style={{ backgroundColor: "white", minHeight: "50px" }}>
          {text}
        </div>
      ),
    },
    {
      title: "Column 3",
      dataIndex: "col3",
      key: "col3",
      render: (text: any, record: any) => (
        <div
          onDrop={(e) => handleDrop(e, record, "col3")}
          onDragOver={(e) => e.preventDefault()}
          style={{ backgroundColor: "lightgray", minHeight: "50px" }}
        >
          {text}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2>Header design</h2>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          rowKey="key"
        />
        <div>
          <h3>List 1</h3>
          {list1.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item, "list1")}
              style={{
                margin: "8px",
                padding: "8px",
                backgroundColor: "lightblue",
                cursor: "pointer",
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
        <div>
          <h3>List 2</h3>
          {list2.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item, "list2")}
              style={{
                margin: "8px",
                padding: "8px",
                backgroundColor: "lightgreen",
                cursor: "pointer",
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testing22;
