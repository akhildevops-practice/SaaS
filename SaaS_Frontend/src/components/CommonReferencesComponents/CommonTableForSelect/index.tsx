import { Form, Input, Popconfirm, Table, Tooltip } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import { MdDelete } from 'react-icons/md';
import useStyles from "./styles";
import type { FormInstance } from "antd/es/form";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

type Props = {
  selectedData: any;
  setSelectedData: any;
};

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: any;
  handleSave: (record: any) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<any>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef?.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    // console.log("inside is the editable if");

    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
          // placeholder="Enter Your Comments Here..."
          style={{ border: "2px solid #e8f3f9" }}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const CommonTableForSelect = ({ selectedData, setSelectedData }: Props) => {
  const classes = useStyles();

  const handleDelete = (refId: any) => {
    const newData = selectedData.filter((item: any) => item.refId !== refId);
    setSelectedData(newData);
  };

  const handleSave = (row: any) => {
    const newData = [...selectedData];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });

    // console.log("check newData", newData);
    setSelectedData(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const referencesColumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (_: any, record: any) => record.type,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => {
        if (!!record?.link && record?.link !== "") {
          return (
            <a
              href={record?.link}
              target="_blank"
              style={{ color: "black", textDecoration: "underline" }} rel="noreferrer"
            >
              {record?.name}
            </a>
          );
        } else {
          return record?.name;
        }
      },
    },
    {
      title: "Comments",
      dataIndex: "comments",
      key: "comments",
      editable: true,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) =>
        selectedData.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record?.refId)}
          >
            <Tooltip title="Delete">
              <MdDelete style={{ fill: "#003566" }} />
            </Tooltip>
          </Popconfirm>
        ) : null,
    },
  ];

  const columns = referencesColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });

  return (
    <div data-testid="custom-table" className={classes.tableContainer}>
      <Table
        columns={columns as any}
        dataSource={selectedData}
        pagination={false}
        rowKey="id"
        components={components}
        rowClassName={() => "editable-row"}
      />
    </div>
  );
};

export default CommonTableForSelect;
