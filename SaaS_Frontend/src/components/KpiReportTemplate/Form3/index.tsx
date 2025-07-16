import { useEffect, useState } from "react";
import {
  Box,
  Fab,
  Grid,
  TextField,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import KpiReportTemplateDesignContainer from "../DesignContainer";
import { makeStyles } from "@material-ui/core/styles";
import { MdAdd } from 'react-icons/md';
import {
  IKpiReportTemplateSchema,
} from "../../../schemas/kpiReportTemplateSchema";
import { MdDelete } from 'react-icons/md';
import { generateUniqueId } from "../../../utils/uniqueIdGenerator";
import axios from "../../../apis/axios.global";
import { Autocomplete } from "@material-ui/lab";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
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
}));

type Props = {
  templateValues: IKpiReportTemplateSchema;
  setTemplateValues: React.Dispatch<
    React.SetStateAction<IKpiReportTemplateSchema>
  >;
  isEdit: boolean;
  readMode: boolean;
};

function KpiReportTemplateForm3({
  templateValues,
  setTemplateValues,
  isEdit,
  readMode,
}: Props) {
  const [kpiOptions, setKpiOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [krakpiOptions, setkraKpiOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [kraKpiData, setkraKpiData] = useState<any>([]);

  const [kraData, setKraData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const classes = useStyles();
  const [selectedKraId, setSelectedKraId] = useState("");
  const [selectedKPI, setSelectedKPI] = useState<any>({});
  const { enqueueSnackbar } = useSnackbar();

  const cols = [
    {
      header: "KPI *",
      accessorKey: "kpi",
      size: 200,
    },
    {
      header: "TargetType",
      accessorKey: "kpiTargetType",
      size: 200,
    },
    {
      header: "Description",
      accessorKey: "description",
      size: 200,
    },
    {
      header: "UoM",
      accessorKey: "uom",
      size: 200,
    },
    // {
    //   header: "Value",
    //   accessorKey: "value",
    //   size: 0,
    // },
    // {
    //   header: "Comments",
    //   accessorKey: "comments",
    //   size: 0,
    // },
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
      header: "Target *",
      accessorKey: "kpiTarget",
      size: 200,
    },
    // {
    //   header: "Variance",
    //   accessorKey: "variance",
    // },
    // {
    //   header: "Score",
    //   accessorKey: "score",
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

  useEffect(() => {
    setIsMounted(true);
    getKpiBySources();
    getAllKra();
  }, []);

  // useEffect(() => {
  //   console.log("template values", templateValues);
  // }, [templateValues]);
  useEffect(() => {
    if (selectedKraId) {
      getKpiByObjectiveCategoryKRA();
    }
    getKpiBySources();
  }, [selectedKraId]);

  const getAllKra = async () => {
    try {
      const res = await axios.get("/api/objective/AllObjectives");
      if (res.status === 200 || res.status === 201) {
        if (res.data?.result.length > 0) {
          setKraData(
            res.data?.result?.map((kraObj: any) => ({
              id: kraObj._id,
              kraName: kraObj.ObjectiveCategory,
            }))
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getKpiById = async () => {
    try {
      const res = await axios.get("/api/objective/AllObjectives");
      if (res.status === 200 || res.status === 201) {
        if (res.data.length > 0) {
          setKraData(
            res.data.map((kraObj: any) => ({
              id: kraObj._id,
              kraName: kraObj.ObjectiveCategory,
            }))
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getKpiBySources = async () => {
    await axios(
      `/api/kpi-report/getKpiBySourceArray?id=${JSON.stringify(
        templateValues.sources
      )}`
    )
      .then((res) => {
        setKpiData(res.data);
        setKpiOptions(
          res.data.map((obj: any) => ({ value: obj.id, label: obj.kpiName }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getKpiByObjectiveCategoryKRA = async () => {
    await axios(`api/objective/getAllKpisforObjective/${selectedKraId}`)
      .then((res) => {
        // console.log("Result from krs", res.data);
        setkraKpiData(res.data);
        if (res.data) {
          setkraKpiOptions(
            res.data.map((obj: any) => ({ value: obj._id, label: obj.kpiName }))
          );
        }
      })
      .catch((err) => console.error(err));
  };
  // console.log("template values", templateValues);
  const kraIdMap = kraData.reduce((map: any, { kraName, id }: any) => {
    map[kraName] = id;
    return map;
  }, {});

  const addCategory = () => {
    setkraKpiOptions([]);
    setTemplateValues((prev: any) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          catId: generateUniqueId(10),
          catName: "",
          kraId: "",
          catData: [
            // {
            //   kpi: { value: "", label: "" },
            //   kpiTargetType: "",
            //   description: "",
            //   uom: "",
            //   value: "",
            //   comments: "",
            //   kpiTarget: "",
            //   minimumTarget: "",
            //   weightage: "",
            //   variance: "",
            //   score: "",
            //   monthlyAvg: "",
            //   annualAvg: "",
            //   mtd: "",
            //   ytd: "",
            //   ratio: "",
            // },
            // add more empty objects as needed
          ],
        },
      ],
    }));
    setSelectedKPI(null);
  };
  const addKPIForCategory = (catid: any) => {
    getKpiByObjectiveCategoryKRA();
    if (krakpiOptions.length > 0) {
      for (const kpi of krakpiOptions) {
        setSelectedKPI((prevState: any) => ({
          ...prevState,
          [catid]: kpi.value,
        }));
      }
    }
  };
  const removeCategory = (id: string) => {
    // console.log("id in remove", id);
    setTemplateValues((prev: any) => ({
      ...prev,
      categories: prev.categories.filter((cat: any) => !(id === cat.catId)),
    }));
    setSelectedKraId("");
    setkraKpiOptions([]);
  };
  // console.log("selected kpi value", selectedKPI);

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        style={{ overflowX: "scroll", overflowY: "auto", maxHeight: "200px" }}
      >
        <Box>
          {/* <Typography variant="h6">Add Categories</Typography> */}
          <Typography component="p">
            {templateValues?.categories?.length} added
          </Typography>
        </Box>
        {templateValues?.categories.length === 0 && (
          <Tooltip title="Add category">
            <Fab
              size="medium"
              className={classes.fabButton}
              onClick={addCategory}
            >
              <MdAdd />
            </Fab>
            {/* <Button
              onClick={addCategory}
              style={{ backgroundColor: "#0E497A", color: "#ffffff" }}
            >
              Add
            </Button> */}
          </Tooltip>
        )}
      </Box>
      <div className={classes.tableContainerScrollable}>
        {templateValues.categories?.map((cat: any) => (
          <Paper
            key={cat.catId}
            elevation={0}
            className={classes.categoryContainer}
          >
            <Grid container spacing={2} style={{ overflowY: "auto" }}>
              <Grid item xs={7} sm={4} style={{ maxWidth: "500px" }}>
                <Autocomplete
                  freeSolo
                  id="free-solo-2-demo"
                  disableClearable
                  options={
                    kraData.length > 0
                      ? kraData.map((item: any) => item.kraName)
                      : []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Category"
                      variant="outlined"
                      style={{ paddingBottom: "20px" }}
                      InputProps={{ ...params.InputProps, type: "search" }}
                      disabled={readMode}
                    />
                  )}
                  inputValue={cat.catName}
                  onInputChange={(_: any, value: any) => {
                    if (isMounted) {
                      setTemplateValues((prev: any) => ({
                        ...prev,
                        categories: prev.categories.map((obj: any) => {
                          if (obj.catId === cat.catId) {
                            return { ...obj, catName: value, kraId: "" };
                          }
                          return obj;
                        }),
                      }));
                    }
                  }}
                  onChange={(_: any, value: any) => {
                    // console.log("onChange fired");

                    const kraId = kraIdMap[value];
                    // console.log("kraId", kraId);
                    const isKraIdAssigned = templateValues.categories.some(
                      (obj: any) =>
                        obj.kraId === kraId && obj.catId !== cat.catId
                    );
                    if (isKraIdAssigned) {
                      // console.log("already selected");
                      enqueueSnackbar(
                        `Category has already been selected in the same template`,
                        { variant: "error" }
                      );
                    } else {
                      setTemplateValues((prev: any) => ({
                        ...prev,
                        categories: prev.categories.map((obj: any) => {
                          if (obj.catId === cat.catId) {
                            return { ...obj, catName: value, kraId: kraId };
                          }
                          return obj;
                        }),
                      }));
                      setSelectedKraId(kraId);
                      // if (selectedKraId) {
                      //   addKPIForCategory(cat.catId);
                      // } // Update selected kraId state variable
                    }
                  }}
                />
              </Grid>
              <Grid item xs={7} sm={4} style={{ maxWidth: "500px" }}>
                <Autocomplete
                  freeSolo
                  options={kpiOptions}
                  getOptionLabel={(option) => option.label}
                  disabled={readMode}
                  onChange={(event, selectedOption: any) => {
                    // Check if selectedOption is not null (i.e., a KPI was selected)
                    if (selectedOption) {
                      // Set selectedKpi with the ID of the selected KPI for the current category
                      const updatedSelectedKPI = {
                        ...selectedKPI,
                        [cat.catId]: selectedOption.value,
                      };
                      setSelectedKPI(updatedSelectedKPI);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Kpi"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: <>{params.InputProps.endAdornment}</>,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} style={{ textAlign: "right" }}>
                {templateValues?.categories?.length > 0 && (
                  <Tooltip title="Add category">
                    <Fab
                      size="medium"
                      className={classes.fabButton}
                      onClick={addCategory}
                      disabled={readMode}
                    >
                      <MdAdd />
                    </Fab>
                  </Tooltip>
                )}
                <Tooltip title="Delete category">
                  <IconButton
                    disabled={readMode}
                    onClick={() => removeCategory(cat.catId)}
                  >
                    <MdDelete color="error" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid
                item
                xs={12}
                style={{ overflowX: "scroll", overflowY: "auto" }}
              >
                <KpiReportTemplateDesignContainer
                  templateValues={templateValues}
                  setTemplateValues={setTemplateValues}
                  catId={cat.catId}
                  cols={cols}
                  kpiOptions={kpiOptions}
                  kpiData={kpiData}
                  krakpiOptions={krakpiOptions}
                  krakpiData={kraKpiData}
                  // selectedKpi={selectedKPI}
                  selectedKpi={
                    selectedKPI && cat?.catId ? selectedKPI[cat.catId] : null
                  }
                  setSelectedKPI={(kpi: any) =>
                    setSelectedKPI({ ...selectedKPI, [cat.catId]: kpi })
                  } // Update selected KPI for this category
                  selectedKraId={selectedKraId}
                  isEdit={isEdit}
                  readMode={readMode}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </div>
    </>
  );
}

export default KpiReportTemplateForm3;
