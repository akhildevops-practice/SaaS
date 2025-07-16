//antd
import { Row, Table } from "antd";
import axios from "apis/axios.global";
import moment from "moment";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

//styles
import useStyles from "./style";

type Props = {
  audit: any;
};

const NCInfoTable = ({ audit }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState<any>();
  const classes = useStyles();

  useEffect(() => {
    ncDetails(audit);
  }, []);
  
  // console.log("formdata", audit);
  const ncDetails = async (ncId: any) => {
    try {
      const result = await axios.get(`api/audits/nc/${ncId}`);
      console.log("result in table", result);
      setData(result?.data);
    } catch (error) {
      enqueueSnackbar(`Error fetching findings data`, { variant: "error" });
    }
  };

  const columns = [
    {
      title: "Findings Details",
      dataIndex: "field",
      key: "field",
    },
    {
      title: "",
      dataIndex: "value",
      key: "value",
    },
  ];

  const tableData = [
    { field: "Findings", value: data?.id },
    { field: "Findings Type", value: data?.findings?.findingType },
    {
      field: "Findings Date",
      value: moment(data?.date).format("DD-MM-YYYY"),
    },
    { field: "Audit Name", value: data?.audit?.auditName },
    { field: "Audit Type", value: data?.audit?.auditType?.auditType },
    {
      field: "Audited Entity",
      value: data?.audit.auditedEntity?.entityName,
    },
    { field: "Location", value: data?.audit?.location?.locationName },
    {
      field: "Auditees",
      value: data?.audit?.auditees?.map((value: any) => value.username),
    },
    {
      field: "Auditors",
      value: data?.audit?.auditors?.map((value: any) => value.username),
    },

    // Add more rows based on your data structure
  ];
  const textA: any = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#003566", // Change to your preferred text color
    textAlign: "center",
    marginBottom: "16px", // Adjust as needed
  };

  return (
    <Row gutter={[16, 16]}>
      <div>
        <Table
          columns={columns}
          dataSource={tableData}
          tableLayout="fixed"
          className={classes.auditTrailTable}
          pagination={false}
        />
      </div>
    </Row>
  );
};

export default NCInfoTable;
