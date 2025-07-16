import { useState } from "react";
import {
  Grid,
  TextField,
  Paper,
} from "@material-ui/core";
import { Collapse } from "antd";
import KpiReportDesignContainer from "../DesignContainer";
import { IKpiReportSchema } from "../../../schemas/kpiReportSchema";
import { makeStyles } from "@material-ui/core/styles";
import KpiReportForm1 from "../Form1";

const useStyles = makeStyles((theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },

  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  categoryContainer: {
    margin: "10px 0",
    padding: 10,

    overflowX: "scroll",
    overflowY: "auto",
    // maxHeight: "200px",
  },
  tableContainerScrollable: {
    marginBottom: "20px", // Adjust the value as needed
    maxHeight: "calc(76vh - 20vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px", // Adjust the height value as needed
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
}));
// reportValues={reportValues}
// locationOptions={locationOptions}
// sourceOptions={sourceOptions}
// userOptions={userOptions}
// reportReaderOptions={reportReaderOptions}
// readerLevelOptions={readerLevelOptions}
// entityOptions={entityOptions}

type Props = {
  reportValues: IKpiReportSchema;
  setReportValues: React.Dispatch<React.SetStateAction<IKpiReportSchema>>;
  reportStatus: string;
  locationOptions: any;
  sourceOptions: any;
  userOptions: any;
  reportReaderOptions: any;
  readerLevelOptions: any;
  entityOptions: any;
  currentYear: any;
  read: any;
};

function KpiReportForm3({
  reportValues,
  setReportValues,
  reportStatus,
  locationOptions,
  sourceOptions,
  userOptions,
  reportReaderOptions,
  readerLevelOptions,
  entityOptions,
  currentYear,
  read,
}: Props) {
  const classes = useStyles();
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const cols = [
    {
      header: "KPI",
      accessorKey: "kpi",
      size: 250,
    },
    {
      header: "Value *",
      accessorKey: "kpiValue",
      size: 200,
    },
    {
      header: "Comments",
      accessorKey: "kpiComments",
      size: 200,
    },
    {
      header: "TargetType",
      accessorKey: "kpiTargetType",
    },
    {
      header: "Description",
      accessorKey: "description",
      size: 300,
    },
    {
      header: "UoM",
      accessorKey: "uom",
      size: 200,
    },
    // {
    //   header: "Weightage",
    //   accessorKey: "weightage",
    //   size: 150,
    // },
    {
      header: "Minimum Target",
      accessorKey: "minimumTarget",
      size: 200,
    },
    {
      header: "Target",
      accessorKey: "kpiTarget",
      size: 200,
    },
    // {
    //   header: "Variance",
    //   accessorKey: "kpiVariance",
    // },
    // {
    //   header: "Score",
    //   accessorKey: "kpiScore",
    // },
    // {
    //   header: "Monthly Avg",
    //   accessorKey: "monthlyAvg",
    // },
    // {
    //   header: "Annual Avg",
    //   accessorKey: "annualAvg",
    // },
    // {
    //   header: "MtD",
    //   accessorKey: "mtd",
    // },
    // {
    //   header: "YtD",
    //   accessorKey: "ytd",
    // },
    // {
    //   header: "Ratio",
    //   accessorKey: "ratio",
    // },
  ];
  console.log("report values", reportValues);
  const text = `
  Report Information
`;
  interface CollapseItem {
    key: string;
    label: string;
    children: React.ReactNode;
  }
  const items: CollapseItem[] = [
    {
      key: "1",
      label: "Click to view Report Details",
      children: (
        <KpiReportForm1
          reportValues={reportValues}
          locationOptions={locationOptions}
          sourceOptions={sourceOptions}
          userOptions={userOptions}
          reportReaderOptions={reportReaderOptions}
          readerLevelOptions={readerLevelOptions}
          entityOptions={entityOptions}
          currentYear={currentYear}
          read={read}
        />
      ),
    },
  ];
  const collapsePanels = items.map((item) => (
    <Collapse.Panel key={item.key} header={item.label}>
      {item.children}
    </Collapse.Panel>
  ));
  const handleCollapseChange = (keys: string | string[]) => {
    // Check if 'keys' is a string or an array of strings
    if (typeof keys === "string") {
      setActiveKey([keys]);
    } else {
      setActiveKey(keys);
    }
  };

  return (
    <>
      <Collapse
        ghost
        activeKey={activeKey}
        onChange={handleCollapseChange}
        accordion
      >
        {collapsePanels}
      </Collapse>
      ;
      <div className={classes.tableContainerScrollable}>
        {reportValues?.categories.map((cat: any) => (
          <Paper
            key={cat.catId}
            elevation={0}
            className={classes.categoryContainer}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="catName"
                  label="Category Name"
                  value={cat.catName}
                  required
                  disabled
                />
              </Grid>

              <Grid item xs={12} style={{ overflowX: "scroll" }}>
                <KpiReportDesignContainer
                  reportValues={reportValues}
                  setReportValues={setReportValues}
                  catId={cat.catId}
                  cols={cols}
                  reportStatus={reportStatus}
                  read={read}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </div>
    </>
  );
}

export default KpiReportForm3;
