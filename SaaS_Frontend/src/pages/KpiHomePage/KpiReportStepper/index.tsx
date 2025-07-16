import { useState, useEffect, useMemo } from "react";
import KpiReportForm1 from "components/KpiReport/Form1";
import KpiReportForm3 from "components/KpiReport/Form3";
import { useSnackbar } from "notistack";
import { Box, Button, CircularProgress, Typography } from "@material-ui/core";
import axios from "apis/axios.global";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUserInfo } from "apis/socketApi";
import { dateToLongDateFormat } from "utils/dateFormat";
import { kpiReportSchema } from "schemas/kpiReportSchema";
import useStyles from "./styles";
import getAppUrl from "utils/getAppUrl";
import getYearFormat from "utils/getYearFormat";
const steps = ["Report Header", "Report Designs"];

const readerLevelOptions = {
  ALL_ORG: "ORGANIZATION",
  LOC_LEV: "LOCATION",
  ENT_LEV: "DEPARTMENT",
  USR_LEV: "USERS",
};

function KpiReportStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [reportValues, setReportValues] = useState(kpiReportSchema);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({});
  const [reportStatus, setReportStatus] = useState("DRAFT");
  const [templateId, setTemplateId] = useState<string>("");
  //const [kpiValue, setKpiValue] = useState([]);
  const [kpiValue, setKpiValue] = useState<
    { kpiId: string; kpivalue: string }[]
  >([]);
  const [locationOptions, setLocationOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [sourceOptions, setSourceOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [userOptions, setUserOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [entityOptions, setEntityOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [reportReaderOptions, setReportReaderOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [businessUnitOptions, setBusinessUnitOptions] = useState<
    { value: string; label: string }[]
  >([]);
  // const [reportFrequencyOptions,setReportFrequencyOptions]=useState<value:string;label:string}>([];)
  const [kpiOptions, setKpiOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [date, setDate] = useState(new Date());

  useEffect(() => {
    getyear();
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // console.log("currentDate", date);

  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const classes = useStyles();
  const [currentYear, setCurrentYear] = useState<any>();
  const [read, setRead] = useState<boolean>(false);
  const locationstate = useLocation();
  const [selectedOption, setSelectedOption] = useState<string>("");

  const openFrom = useMemo(() => {
    if (pathname.includes("generatereportfromtemplate")) return "template";
    else return "report";
  }, [pathname]);

  useEffect(() => {
    // getKpiValues();
    getyear();
    getLocationOptions().then(() => {
      if (openFrom === "template")
        getTemplateInfoById().then(() => getCategoriesForTemplateById());
    });
    getUserOptions();
    getInfo();
  }, []);
  useEffect(() => {
    if (locationstate.state?.from) {
      setRead(true);
    }
  }, [locationstate.state]);

  useEffect(() => {
    if (reportValues.location) {
      getSourceOptions();
      getEntityOptions();
      getBusinessUnitOptions();
      getKpiBySources();
      getyear();
    }
  }, [reportValues.location]);

  useEffect(() => {
    // getKpiValues();
    if (openFrom === "report") getSelectedReportInstance();
  }, [kpiOptions]);

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  useEffect(() => {
    if (reportValues.readersLevel === readerLevelOptions.ALL_ORG)
      setReportReaderOptions([{ value: "All users", label: "All users" }]);
    if (reportValues.readersLevel === readerLevelOptions.LOC_LEV)
      setReportReaderOptions(locationOptions);
    if (reportValues.readersLevel === readerLevelOptions.USR_LEV)
      setReportReaderOptions(userOptions);
    if (reportValues.readersLevel === readerLevelOptions.ENT_LEV)
      setReportReaderOptions(entityOptions);
  }, [reportValues.readersLevel]);

  const getLocationOptions = async () => {
    await axios("/api/kpi-definition/getAllLocations")
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          value: obj.id,
          label: obj.locationName,
        }));
        setLocationOptions(ops);
      })
      .catch((err) => console.error(err));
  };

  const getSourceOptions = async () => {
    await axios(
      `/api/kpi-definition/getSource?location=${JSON.stringify([
        reportValues.location,
      ])}`
    )
      .then((res) => {
        setSourceOptions(
          res.data.map((obj: any) => ({ value: obj.id, label: obj.sourceName }))
        );
      })
      .catch((err) => console.error(err));
  };
  // console.log("currentyear", currentYear);
  const getUserOptions = async () => {
    await axios(`/api/kpi-report/getAllUsers`)
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          value: obj.id,
          label: obj.username,
        }));
        setUserOptions(ops);
      })
      .catch((err) => console.error(err));
  };

  const getEntityOptions = async () => {
    await axios(
      `/api/location/getDeptForLocation/${realmName}/${reportValues.location}`
    )
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          value: obj.id,
          label: obj.entityName,
        }));
        setEntityOptions(ops);
      })
      .catch((err) => console.error(err));
  };

  const getBusinessUnitOptions = async () => {
    await axios(`/api/entity/getBusinessTypeForLoc/${reportValues.location}`)
      .then((res) =>
        setBusinessUnitOptions(
          res.data.map((obj: any) => ({ value: obj.id, label: obj.name }))
        )
      )
      .catch((err) => console.error(err));
  };

  const getInfo = async () => {
    await getUserInfo().then((res: any) => {
      setUserInfo(res.data);
      setReportValues((prev) => ({ ...prev, updatedBy: res.data.username }));
    });
  };

  const getTemplateInfoById = async () => {
    await axios(`/api/kpi-report/getSelectedKpiReportTemplate/${id}`)
      .then(async (res) => {
        const today = new Date();
        getyear();
        setReportValues({
          location: res.data.result.location,
          entity: res.data.result.entity,
          active: res.data.result.active,
          semiAnnual: res.data.result?.semiAnnaul,
          // kpiReportInstanceName: `${
          //   res.data.result.kpiReportTemplateName
          // }${today.getHours()}${today.getMinutes()}${today.getDate()}${
          //   today.getMonth() + 1
          // }${today.getFullYear()}`,
          kpiReportInstanceName: await generateReportInstanceName(
            res.data.result.kpiReportTemplateName,
            res.data.entity,

            res.data.location,
            res.data.result.reportFrequency,
            new Date(), // Today's date

            currentYear
          ),
          schedule: res.data.result.schedule,
          runDate: res.data.result.runDate,
          reportFrequency: res.data.result.reportFrequency,
          readersLevel: res.data.result.readersLevel,
          reportEditors: res.data.result.reportEditors,
          sources: res.data.result.sourceId,
          reportReaders: res.data.result.readers,
          emailRecipients: res.data.result.emailShareList,
          businessUnitFieldName: res.data.result.businessUnitFilter,
          entityFieldName: res.data.result.entityFilter,
          updatedAt: dateToLongDateFormat(new Date(res.data.result.updatedAt)),
          updatedBy: res.data.creatorUserName,
          year: currentYear,
          yearFor: currentYear,
          categories: [],
        });
      })
      .catch((err) => console.error(err));
  };
  async function generateReportInstanceName(
    templateName: any,
    entityName: any,
    locationName: any,
    reportFrequency: any,
    today: any,
    currentyear: any
  ) {
    getyear();
    let instanceName = `${templateName}_${entityName}_${locationName}` + " ";
    // console.log("report frequency", reportFrequency);
    // Determine date format based on report frequency
    switch (reportFrequency) {
      case "DAILY":
        instanceName += `for ${formatDate(
          today,
          "ddMMyyyy"
        )}_${today.getFullYear()}`;
        break;
      case "MONTHLY":
        const monthName = today.toLocaleString("default", { month: "long" });
        instanceName += ` for ${monthName}_${today.getFullYear()} `;
        break;
      case "QUARTERLY":
        const quarter = await getQuarter(today);
        instanceName += `for Q${quarter}_${today.getFullYear()}`;
        break;
      case "YEARLY":
        instanceName += `for ${today.getFullYear()}`;
        break;
      default:
        break;
    }

    return instanceName;
  }
  function formatDate(date: any, format: any) {
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString(undefined, options).replace(/ /g, "");
  }

  async function getQuarter(date: any) {
    try {
      const result = await axios.get(
        "/api/kpi-report/computefiscalyearquarters"
      );
      if (result && result.status === 200) {
        const quarters = result.data;
        const currentDate = new Date(); // This gets the current date and time
        const currentDay = currentDate.getDate(); // Get the day of the month
        const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
        const currentYear = currentDate.getFullYear(); // Get the year

        // Ensure leading zeros for single-digit days and months
        const dayString =
          currentDay < 10 ? "0" + currentDay : currentDay.toString();
        const monthString =
          currentMonth < 10 ? "0" + currentMonth : currentMonth.toString();

        const repdate: any = `${dayString}/${monthString}/${currentYear}`;
        // console.log("repdate", repdate);
        let period;

        for (let i = 0; i < quarters.length; i++) {
          const qStartDate = quarters[i].startDate;
          const qEndDate = quarters[i].endDate;

          const d1 = qStartDate.split("/");
          const d2 = qEndDate.split("/");
          const c = repdate.split("/");

          const from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]).getTime(); // Convert to timestamp
          const to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]).getTime(); // Convert to timestamp
          const check = new Date(c[2], parseInt(c[1]) - 1, c[0]).getTime(); // Convert to timestamp

          if (check >= from && check <= to) {
            period = quarters[i].quarterNumber;

            break; // Exit the loop once the quarter is found
          }
        }
        return period;
      } else {
        console.error("Failed to fetch quarters data");
        return null; // or handle the error appropriately
      }
    } catch (error) {
      console.error("Error fetching quarters data:", error);
      return null; // or handle the error appropriately
    }
  }

  const getKpiValues = async () => {
    await axios(`/api/kpi-report/getAllErpKpisofTemplate/${id}`).then((res) => {
      // console.log("output from axios", res.data);
      setKpiValue(res.data);
    });
  };
  // console.log("kpivalue", kpiValue);

  const getCategoriesForTemplateById = async () => {
    // const valuesOfKpi = await axios(
    //   `/api/kpi-report/getAllErpKpisofTemplate/${id}`
    // );
    // setKpiValue(valuesOfKpi.data);

    await axios(`/api/kpi-report/getAllCategory/${id}`)
      .then((res) => {
        const categoriesArray = res.data.map((obj: any) => ({
          catId: obj._id,
          catName: obj.kpiReportCategoryName,
          columnsArray: [
            "kpiId",
            "kpiTarget",
            "minimumTarget",
            "weightage",
            "kpiValue",
            "kpiComments",
          ],
          catData: obj.kpiInfo.map((kpiObj: any) => ({
            kpi: { label: kpiObj.kpiName, value: kpiObj.kpiId },
            kpiTargetType: kpiObj.kpiTargetType,
            description: kpiObj.kpiDescription,
            uom: kpiObj.kpiUOM,
            kpiValue: kpiObj.kpiValue,

            //  kpiValue.map((obj: any) => {
            //     if (kpiObj.kpiId == obj.kpiId) return {kpiValue:obj.kpivalue};
            //   }),
            // kpiValue?.find((value: any) => value.kpiId === kpiObj.kpiId)
            //   ?.kpivalue ?? null,

            kpiComments: "",
            kpiTarget: kpiObj.kpiTarget,
            minimumTarget: kpiObj.minimumTarget,
            weightage: kpiObj.weightage,
            kpiVariance: "",
            kpiScore: "",
            monthlyAvg: "",
            annualAvg: "",
            mtd: "",
            ytd: "",
            ratio: "",
          })),
        }));
        //   catData: obj.kpiInfo.map((kpiObj: any) => {
        //     console.log("insidecatdata", kpiObj.kpiId);
        //     const kpiValueObj = valuesOfKpi.data.find(
        //       (value: any) => value.kpiId === kpiObj.kpiId
        //     );
        //     console.log("kpivalueobj", kpiValueObj);

        //     return {
        //       kpi: { label: kpiObj.kpiName, value: kpiObj.kpiId },
        //       kpiTargetType: kpiObj.kpiTargetType,
        //       description: kpiObj.kpiDescription,
        //       uom: kpiObj.kpiUOM,
        //       kpiValue: kpiValueObj ? kpiValueObj.kpivalue : null,
        //       kpiComments: "",
        //       kpiTarget: kpiObj.kpiTarget,
        //       minimumTarget: kpiObj.minimumTarget,
        //       weightage: kpiObj.weightage,
        //       kpiVariance: "",
        //       kpiScore: "",
        //       monthlyAvg: "",
        //       annualAvg: "",
        //       mtd: "",
        //       ytd: "",
        //       ratio: "",
        //     };
        //   }),
        // }));

        setReportValues((prev) => ({
          ...prev,
          categories: categoriesArray,
        }));
        // console.log("kpicategoryvalue", categoriesArray);
      })
      .catch((err: any) => console.error(err));
  };

  const getKpiBySources = async () => {
    await axios(
      `/api/kpi-report/getKpiBySourceArray?id=${JSON.stringify(
        reportValues.sources
      )}`
    )
      .then((res) => {
        setKpiOptions(
          res.data.map((obj: any) => ({ value: obj.id, label: obj.kpiName }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getSelectedReportInstance = async () => {
    await axios(`/api/kpi-report/getSelectedReportInstance/${id}`)
      .then((res: any) => {
        setReportStatus(res.data.result.reportStatus);
        setTemplateId(res.data.result.kpiReportTemplateId);
        setReportValues({
          location: res.data.tempData.result.location,
          entity: res.data.tempData.result.entity,
          sources: res.data.tempData.result.sourceId,
          semiAnnual: res.data.result?.semiAnnual
            ? res.data.result?.semiAnnual
            : "",
          runDate: res.data.result.runDate,
          active: res.data.tempData.result.active,
          kpiReportInstanceName: res.data.result.kpiReportInstanceName,
          reportFrequency: res.data.tempData.result.reportFrequency,
          schedule: res.data.tempData.result.schedule,
          year: res.data.result.year,
          yearFor: res.data.result.yearFor,

          updatedBy: res.data.result.reportRunBy,
          updatedAt: dateToLongDateFormat(new Date(res.data.result.updatedAt)),
          readersLevel: res.data.tempData.result.readersLevel,
          reportReaders: res.data.tempData.result.readers,
          emailRecipients: res.data.tempData.result.emailShareList,
          reportEditors: res.data.tempData.result.reportEditors,
          businessUnitFieldName: res.data.tempData.result.businessUnitFilter,
          entityFieldName: res.data.tempData.result.entityFilter,
          categories: res.data.result.catInfo.map((obj: any) => {
            return {
              catId: obj.kpiReportCategoryId,
              catName: obj.kpiReportCategoryName,
              columnsArray: obj.columnsArray,
              catData: obj.kpiInfo.map((kpiObj: any) => {
                return {
                  ...kpiObj,
                  kpi: kpiOptions?.filter(
                    (o: { value: any }) => o?.value === kpiObj?.kpiId
                  )[0],
                  kpiTargetType: kpiObj.kpiTargetType,
                };
              }),
            };
          }),
        });
      })
      .catch((err) => console.error(err));
  };

  const forms = [
    {
      form: (
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
    // {
    //   form: (
    //     <KpiReportForm2
    //       reportValues={reportValues}
    //       businessUnitOptions={businessUnitOptions}
    //       entityOptions={entityOptions}
    //     />
    //   ),
    // },
    // {
    //   form: (
    //     <KpiReportForm3
    //       reportValues={reportValues}
    //       setReportValues={setReportValues}
    //       reportStatus={reportStatus}
    //     />
    //   ),
    // },
  ];

  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      setActiveStep(2);
    } else {
      enqueueSnackbar(`Please fill all required fields`, {
        variant: "error",
      });
    }
  };

  const handleBack = () => {
    // setActiveStep((prevActiveStep: number) => prevActiveStep - 1);
    // setActiveTab("3")
    navigate("/kpi", { state: { redirectToTab: "KPI Entry" } });
  };

  const handleWriteToKpiDetailTable = async (instanceId: string) => {
    await axios
      .post(`/api/kpi-report/writeToKpiDetailTable/${instanceId}`, {})
      .catch((err) => console.error(err));
  };
  const handleSendMail = async (instanceId: string) => {
    await axios
      .get(`/api/kpi-report/sendReportMail/${instanceId}`, {})
      .catch((err) => console.error(err));
  };

  const handleCreate = async (status: string) => {
    setIsLoading(true);
    const temp = {
      kpiReportInstanceName: reportValues.kpiReportInstanceName,
      kpiReportTemplateId: id,
      reportStatus: status,
      organization: userInfo.organizationId,
      runDate: date,
      year: currentYear,
      catInfo: reportValues.categories.map(
        (cat: { catId: any; catName: any; catData: any[] }) => ({
          kpiReportCategoryId: cat.catId,
          kpiReportCategoryName: cat.catName,
          columnsArray: [
            "kpiId",
            "kpiTargetType",
            "kpiTarget",
            "minimumTarget",
            "weightage",
            "kpiValue",
            "kpiComments",
          ],
          kpiInfo: cat.catData.map(
            (kpiObj: { kpi: { value: any }; kpiTargetType: string }) => ({
              ...kpiObj,
              kpiId: kpiObj.kpi.value,
              kpiTargetType: kpiObj.kpiTargetType,
            })
          ),
        })
      ),
    };

    await axios
      .post(`/api/kpi-report/createReportInstance`, temp)
      .then((res) => {
        if (status === "SUBMIT") {
          handleWriteToKpiDetailTable(res.data._id);
          handleSendMail(res.data._id);
        }
        setIsLoading(false);
        enqueueSnackbar(`Successfully created`, {
          variant: "success",
        });
        navigate("/kpi", { state: { redirectToTab: "KPI Entry" } });
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        enqueueSnackbar(`Could not create report`, {
          variant: "error",
        });
      });
  };

  const handleUpdate = async (status: string) => {
    setIsLoading(true);
    const temp = {
      kpiReportInstanceName: reportValues.kpiReportInstanceName,
      kpiReportTemplateId: templateId,
      reportStatus: status,
      organization: userInfo.organizationId,
      year: currentYear,
      catInfo: reportValues.categories.map(
        (cat: { catId: any; catName: any; catData: any[] }) => ({
          kpiReportCategoryId: cat.catId,
          kpiReportCategoryName: cat.catName,
          columnsArray: [
            "kpiId",
            "kpiTargetType",
            "kpiTarget",
            "minimumTarget",
            "weightage",
            "kpiValue",
            "kpiComments",
          ],
          kpiInfo: cat.catData.map(
            (kpiObj: { kpi: { value: any }; kpiTargetType: string }) => ({
              ...kpiObj,
              kpiId: kpiObj.kpi.value,
              kpiTargetType: kpiObj.kpiTargetType,
            })
          ),
        })
      ),
    };

    await axios
      .put(`/api/kpi-report/updateReportInstance/${id}`, temp)
      .then((res) => {
        if (status === "SUBMIT") {
          handleWriteToKpiDetailTable(id!);
          handleSendMail(id!);
        }

        setIsLoading(false);
        enqueueSnackbar(`Successfully updated`, {
          variant: "success",
        });
        navigate("/kpi", { state: { redirectToTab: "KPI Entry" } });
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        enqueueSnackbar(`Could not update report`, {
          variant: "error",
        });
      });
  };

  const handleDelete = async () => {
    await axios
      .delete(`/api/kpi-report/deleteSelectedReportInstance/${id}`)
      .then(() => {
        setIsLoading(false);
        enqueueSnackbar(`Successfully deleted`, {
          variant: "success",
        });
        navigate("/kpi", { state: { redirectToTab: "KPI Entry" } });
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        enqueueSnackbar(`Could not delete report`, {
          variant: "error",
        });
      });
  };

  return (
    <>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10%",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Button
              variant="contained"
              disableElevation
              className={classes.draftButton}
              onClick={handleBack}
              // disabled={openFrom === "template"}
            >
              Back
            </Button>
            <Typography component="p" className={classes.modifiedText}>
              Modified on <strong>{reportValues.updatedAt}</strong>
            </Typography>

            <Box>
              <Button
                variant="contained"
                disableElevation
                className={classes.deleteButton}
                onClick={handleDelete}
                disabled={openFrom === "template"}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                disableElevation
                className={classes.draftButton}
                onClick={
                  openFrom === "report"
                    ? () => handleUpdate("DRAFT")
                    : () => handleCreate("DRAFT")
                }
              >
                Draft
              </Button>
              <Button
                variant="contained"
                disableElevation
                className={classes.draftButton}
                onClick={
                  openFrom === "report"
                    ? () => handleUpdate("SUBMIT")
                    : () => handleCreate("SUBMIT")
                }
              >
                Submit
              </Button>
            </Box>
          </Box>
          {/* <FormStepper
            steps={steps}
            forms={forms}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            handleNext={handleNext}
            handleBack={handleBack}
            handleFinalSubmit={
              openFrom === "report"
                ? () => handleUpdate("SUBMIT")
                : () => handleCreate("SUBMIT")
            }
            backBtn={
              <BackButton parentPageLink="/kpi" redirectToTab="Reports" />
            }
          /> */}
          <KpiReportForm3
            reportValues={reportValues}
            setReportValues={setReportValues}
            reportStatus={reportStatus}
            locationOptions={locationOptions}
            sourceOptions={sourceOptions}
            userOptions={userOptions}
            reportReaderOptions={reportReaderOptions}
            readerLevelOptions={readerLevelOptions}
            entityOptions={entityOptions}
            currentYear={currentYear}
            read={read}
          />
        </>
      )}
    </>
  );
}

export default KpiReportStepper;
