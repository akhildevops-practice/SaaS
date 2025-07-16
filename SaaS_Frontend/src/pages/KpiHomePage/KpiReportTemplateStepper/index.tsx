import { useState, useEffect, useMemo } from "react";
import FormStepper from "components/FormStepper";
import BackButton from "components/BackButton";
import KpiReportTemplateForm1 from "components/KpiReportTemplate/Form1";
import KpiReportTemplateForm3 from "components/KpiReportTemplate/Form3";
import {
  IKpiReportTemplateCategorySchema,
  kpiReportTemplateSchema,
} from "schemas/kpiReportTemplateSchema";
import { useSnackbar } from "notistack";
import { Box, CircularProgress, Switch, Typography } from "@material-ui/core";
import axios from "apis/axios.global";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getUserInfo } from "apis/socketApi";
import { dateToLongDateFormat } from "utils/dateFormat";

type Props = {};

const steps = ["Report Header", "Report Designs"];

const readerLevelOptions = {
  ALL_ORG: "ORGANIZATION",
  LOC_LEV: "LOCATION",
  ENT_LEV: "DEPARTMENT",
  USR_LEV: "USERS",
};

function KpiReportTemplateStepper({}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [templateValues, setTemplateValues] = useState(kpiReportTemplateSchema);
  const [categoriesCopy, setCategoriesCopy] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({});

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

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id ? true : false;
  const locationstate = useLocation();
  const [readMode, setReadMode] = useState<boolean>(false);

  useEffect(() => {
    console.log("isEdit", isEdit);
    getLocationOptions().then(() => {
      if (isEdit)
        getReportTemplateById().then(() => getCategoriesForTemplateById());
    });
    getUserOptions();
    getInfo();
  }, []);
  useEffect(() => {
    if (locationstate?.state?.from) {
      setReadMode(true);
    }
  }, [locationstate]);

  useEffect(() => {
    if (templateValues.location) {
      getSourceOptions();
      getEntityOptions();
      getBusinessUnitOptions();
    }
  }, [templateValues.location]);

  useEffect(() => {
    if (templateValues.readersLevel) {
      if (templateValues.readersLevel === readerLevelOptions.ALL_ORG) {
        setReportReaderOptions([{ value: "All users", label: "All users" }]);
        setTemplateValues((prev: any) => ({
          ...prev,
          reportReaders: ["All users"],
        }));
      } else if (templateValues.readersLevel === readerLevelOptions.LOC_LEV)
        setReportReaderOptions(locationOptions);
      else if (templateValues.readersLevel === readerLevelOptions.ENT_LEV)
        setReportReaderOptions(entityOptions);
      else if (templateValues.readersLevel === readerLevelOptions.USR_LEV)
        setReportReaderOptions(userOptions);
    }
  }, [templateValues.readersLevel]);

  const getLocationOptions = async () => {
    await axios("/api/kpi-definition/getAllLocations")
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          value: obj.id,
          label: obj.locationName,
        }));
        setLocationOptions(ops);
        if (templateValues.readersLevel === readerLevelOptions.LOC_LEV)
          setReportReaderOptions(locationOptions);
      })
      .catch((err) => console.error(err));
  };

  const getSourceOptions = async () => {
    await axios(
      `/api/kpi-definition/getSource?location=${JSON.stringify([
        templateValues.location,
      ])}`
    )
      .then((res) => {
        setSourceOptions(
          res.data.map((obj: any) => ({ value: obj.id, label: obj.sourceName }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getUserOptions = async () => {
    await axios(`/api/kpi-report/getAllUsers`)
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          value: obj.id,
          label: obj.username,
        }));
        setUserOptions(ops);
        if (templateValues.readersLevel === readerLevelOptions.USR_LEV)
          setReportReaderOptions(ops);
      })
      .catch((err) => console.error(err));
  };

  const getEntityOptions = async () => {
    await axios(
      `/api/entity/${userInfo.organizationId}/${templateValues.location}`
    )
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          value: obj.id,
          label: obj.entityName,
        }));
        setEntityOptions(ops);
        if (templateValues.readersLevel === readerLevelOptions.ENT_LEV)
          setReportReaderOptions(ops);
      })
      .catch((err) => console.error(err));
  };

  const getBusinessUnitOptions = async () => {
    await axios(`/api/entity/getBusinessTypeForLoc/${templateValues.location}`)
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
      setTemplateValues((prev) => ({ ...prev, updatedBy: res.data.username }));
    });
  };

  const getReportTemplateById = async () => {
    await axios(`/api/kpi-report/getSelectedKpiReportTemplate/${id}`)
      .then((res) => {
        setTemplateValues({
          location: res.data.result.location,
          active: res.data.result.active,
          kpiReportTemplateName: res.data.result.kpiReportTemplateName,
          reportFrequency: res.data.result.reportFrequency,
          schedule: res.data.result.schedule,
          readersLevel: res.data.result.readersLevel,
          reportEditors: res.data.result.reportEditors,
          sources: res.data.result.sourceId,
          reportReaders: res.data.result.readers,
          emailRecipients: res.data.result.emailShareList,
          businessUnitFieldName: res.data.result.businessUnitFilter,
          entityFieldName: res.data.result.entityFilter,
          updatedAt: dateToLongDateFormat(new Date(res.data.result.updatedAt)),
          updatedBy: res.data.creatorUserName,
          categories: [],
        });
      })
      .catch((err) => console.error(err));
  };
  const getCategoriesForTemplateById = async () => {
    try {
      const res = await axios(`/api/kpi-report/getAllCategory/${id}`);
      console.log("result from categories", res.data);
      const categoriesArray = res.data.map((obj: any) => {
        console.log("Category Object:", obj);
        const category = {
          catId: obj._id,
          catName: obj.kpiReportCategoryName,
          kraId: obj.kraId,
          columnsArray: [],
          catData: obj.kpiInfo?.map((kpiObj: any) => {
            console.log("KPI Object:", kpiObj);
            return {
              kpi: { label: kpiObj.kpiName, value: kpiObj.kpiId },
              kpiName: kpiObj.kpiName,
              kpiId: kpiObj.kpiId,
              kpiTargetType: kpiObj.kpiTargetType,
              description: kpiObj.kpiDescription,
              uom: kpiObj.kpiUOM,
              value: "",
              comments: "",
              kpiTarget: kpiObj.kpiTarget,
              minimumTarget: kpiObj.minimumTarget,
              weightage: "",
              variance: "",
              score: "",
              monthlyAvg: "",
              annualAvg: "",
              mtd: "",
              ytd: "",
              ratio: "",
            };
          }),
        };
        return category;
      });
      console.log("categoryarray", categoriesArray);
      setTemplateValues((prev) => ({
        ...prev,
        categories: categoriesArray,
      }));
      setCategoriesCopy(categoriesArray);
    } catch (err) {
      console.error(err);
    }
  };
  console.log("categories copy", categoriesCopy);
  // const getCategoriesForTemplateById = async () => {
  //   await axios(`/api/kpi-report/getAllCategory/${id}`)
  //     .then((res) => {
  //       console.log("result from categories", res.data);
  //       const categoriesArray = res.data.map((obj: any) => ({

  //         catId: obj._id,
  //         catName: obj.kpiReportCategoryName,
  //         kraId: obj.kraId,
  //         columnsArray: [],
  //         catData: obj.kpiInfo?.map((kpiObj: any) => ({
  //           // console.log("kpiobje",kpiObj)
  //           kpi: { label: kpiObj.kpiName, value: kpiObj.kpiId },
  //           kpiName: kpiObj.kpiName,
  //           kpiTargetType: kpiObj.kpiTargetType,
  //           description: kpiObj.kpiDescription,
  //           uom: kpiObj.kpiUOM,
  //           value: "",
  //           comments: "",
  //           kpiTarget: kpiObj.kpiTarget,
  //           minimumTarget: kpiObj.minimumTarget,
  //           weightage: "",
  //           variance: "",
  //           score: "",
  //           monthlyAvg: "",
  //           annualAvg: "",
  //           mtd: "",
  //           ytd: "",
  //           ratio: "",
  //         })),
  //       }));
  //       console.log("categoryarray", categoriesArray);
  //       setTemplateValues((prev) => ({
  //         ...prev,
  //         categories: categoriesArray,
  //       }));

  //       setCategoriesCopy(categoriesArray);
  //     })
  //     .catch((err) => console.error(err));
  // };

  console.log("templatevalues", templateValues);
  const validateReportHeader = (): boolean => {
    return !!(
      templateValues.location &&
      templateValues.sources.length &&
      templateValues.kpiReportTemplateName &&
      templateValues.reportFrequency &&
      templateValues.readersLevel.length &&
      templateValues.reportReaders.length &&
      templateValues.emailRecipients.length &&
      templateValues.reportEditors.length
    );
  };

  const validateDesigns = (): boolean => {
    if (!templateValues.categories.length) return false;

    for (let i = 0; i < templateValues.categories.length; i++) {
      const cat = templateValues.categories[i];

      if (!(cat.catName && cat.catData.length > 1)) return false;
    }
    return true;
  };

  const switchEnabled = useMemo(() => {
    if (validateReportHeader() && validateDesigns()) {
      setTemplateValues((prev) => ({ ...prev, active: true }));
      return true;
    }
    setTemplateValues((prev) => ({ ...prev, active: false }));
    return false;
  }, [
    templateValues.location,
    templateValues.sources,
    templateValues.kpiReportTemplateName,
    templateValues.reportFrequency,
    templateValues.schedule,
    templateValues.readersLevel,
    templateValues.reportReaders,
    templateValues.emailRecipients,
    templateValues.reportEditors,
    templateValues.categories,
  ]);

  const handleNext = () => {
    if (activeStep === 0) {
      if (templateValues.location && templateValues.kpiReportTemplateName)
        setActiveStep(1);
      else
        enqueueSnackbar(`Please enter location and report name`, {
          variant: "error",
        });
    } else if (activeStep === 1) {
      setActiveStep(2);
    } else {
      enqueueSnackbar(`Please fill all required fields`, {
        variant: "error",
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleBackButton = () => {
    // Navigate to the desired screen
    navigate("/kpi", { state: { redirectToTab: "KPI Report Templates" } });
  };
  // post single category
  const postCategory = async (cat: any, templateId: string) => {
    console.log("cat", cat);
    const catObj = {
      kpiReportCategoryName: cat.catName,
      kraId: cat.kraId,
      kpiReportTemplateId: templateId,
      columnsArray: [
        "kpiId",
        "kpiTargetType",
        "kpiTarget",
        "minimumTarget",
        "weightage",
        "kpiValue",
        "kpiComments",
      ],
      kpiInfo: cat.catData
        .filter(
          (kpiObj: IKpiReportTemplateCategorySchema) => kpiObj.kpi.value !== ""
        )
        .map((kpiObj: IKpiReportTemplateCategorySchema) => ({
          kpiId: kpiObj.kpi.value,
          kpiTargetType: kpiObj.kpiTargetType,
          kpiTarget: kpiObj.kpiTarget,
          minimumTarget: kpiObj.minimumTarget,
          weightage: kpiObj?.weightage,
        })),
    };
    await axios
      .post(`/api/kpi-report/createKpiReportCategory`, catObj)
      .catch((err) => {
        console.error(err);
        enqueueSnackbar(`Could not create category`, {
          variant: "error",
        });
      });
  };

  // put single category
  const putCategory = async (cat: any) => {
    const catObj = {
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
      kpiInfo: cat.catData
        .filter(
          (kpiObj: IKpiReportTemplateCategorySchema) => kpiObj.kpi.value !== ""
        )
        .map((kpiObj: IKpiReportTemplateCategorySchema) => ({
          kpiId: kpiObj.kpi.value,
          kpiName: kpiObj.kpi.label,
          kpiTargetType: kpiObj.kpiTargetType,
          kpiDescription: kpiObj.description,
          kpiUOM: kpiObj.uom,
          kpiTarget: kpiObj.kpiTarget,
          minimumTarget: kpiObj.minimumTarget,
          weightage: kpiObj.weightage,
        })),
    };

    await axios
      .put(`/api/kpi-report/updateCategoryById/${cat.catId}`, catObj)
      .catch((err) => {
        console.error(err);
        enqueueSnackbar(`Could not update category`, {
          variant: "error",
        });
      });
  };

  // delete single category
  const deleteCategory = async (categoryId: string) => {
    await axios
      .delete(`/api/kpi-report/deleteCategoryById/${categoryId}`)
      .catch((err) => {
        console.error(err);
        enqueueSnackbar(`Could not delete category`, {
          variant: "error",
        });
      });
  };

  const validateCategories = (): boolean => {
    for (let i = 0; i < templateValues.categories.length; i++) {
      if (!templateValues.categories[i].catName) {
        enqueueSnackbar("Please enter names for all categories", {
          variant: "error",
        });
        return false;
      }
    }
    return true;
  };

  // post API here
  const handleCreate = async () => {
    if (validateCategories()) {
      setIsLoading(true);
      const temp = {
        kpiReportTemplateName: templateValues.kpiReportTemplateName,
        location: templateValues.location,
        active: templateValues.active,
        sourceId: templateValues.sources,
        organization: userInfo.organizationId,
        businessUnitFilter: templateValues.businessUnitFieldName,
        entityFilter: templateValues.entityFieldName,
        scheudule: templateValues.schedule,
        reportFrequency: templateValues.reportFrequency,
        readersLevel: templateValues.readersLevel,
        readers: templateValues.reportReaders,
        reportEditors: templateValues.reportEditors,
        emailShareList: templateValues.emailRecipients,
      };
      await axios
        .post(`/api/kpi-report/createKpiReportTemplate`, temp)
        .then((res) => {
          templateValues.categories.forEach(async (cat) => {
            postCategory(cat, res.data._id);
          });
          setIsLoading(false);
          enqueueSnackbar(`Successfully created`, {
            variant: "success",
          });
          navigate("/kpi", {
            state: { redirectToTab: "KPI Report Templates" },
          });
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
          enqueueSnackbar(`Could not create template`, {
            variant: "error",
          });
        });
    }
  };

  // put API here
  const handleUpdate = async () => {
    if (validateCategories()) {
      console.log("template values during update", templateValues);
      setIsLoading(true);
      const temp = {
        kpiReportTemplateName: templateValues.kpiReportTemplateName,
        location: templateValues.location,
        active: templateValues.active,
        sourceId: templateValues.sources,
        organization: userInfo.organizationId,
        businessUnitFilter: templateValues.businessUnitFieldName,
        entityFilter: templateValues.entityFieldName,
        reportFrequency: templateValues.reportFrequency,
        schedule: templateValues.schedule,
        readersLevel: templateValues.readersLevel,
        readers: templateValues.reportReaders,
        reportEditors: templateValues.reportEditors,
        emailShareList: templateValues.emailRecipients,
      };
      await axios
        .put(`/api/kpi-report/updateSelectedKpiReportTemplate/${id}`, temp)
        .then(() => {
          templateValues.categories.forEach(async (finalCat) => {
            if (
              categoriesCopy.filter(
                (copyCat) => copyCat.catId === finalCat.catId
              ).length
            ) {
              await putCategory(finalCat);
            } else {
              await postCategory(finalCat, id!);
            }
          });

          categoriesCopy.forEach(async (copyCat) => {
            if (
              !templateValues.categories.filter(
                (finalCat) => finalCat.catId === copyCat.catId
              ).length
            )
              await deleteCategory(copyCat.catId);
          });

          setIsLoading(false);
          enqueueSnackbar(`Successfully updated`, {
            variant: "success",
          });
          navigate("/kpi", {
            state: { redirectToTab: "KPI Report Templates" },
          });
        })
        .catch((err: any) => {
          console.error(err);
          setIsLoading(false);
          enqueueSnackbar(`Could not update template`, {
            variant: "error",
          });
        });
    }
  };

  const forms = [
    {
      form: (
        <KpiReportTemplateForm1
          templateValues={templateValues}
          setTemplateValues={setTemplateValues}
          locationOptions={locationOptions}
          sourceOptions={sourceOptions}
          userOptions={userOptions}
          reportReaderOptions={reportReaderOptions}
          readerLevelOptions={readerLevelOptions}
          entityOptions={entityOptions}
          readMode={readMode}
        />
      ),
    },
    // {
    //   form: (
    //     <KpiReportTemplateForm2
    //       templateValues={templateValues}
    //       setTemplateValues={setTemplateValues}
    //       businessUnitOptions={businessUnitOptions}
    //       entityOptions={entityOptions}
    //     />
    //   ),
    // },
    {
      form: (
        <KpiReportTemplateForm3
          templateValues={templateValues}
          setTemplateValues={setTemplateValues}
          isEdit={isEdit}
          readMode={readMode}
        />
      ),
    },
  ];

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
            <Typography component="p" style={{ width: "60%" }}>
              Modified By <strong>{templateValues.updatedBy}</strong> on{" "}
              <strong>{templateValues.updatedAt}</strong>
            </Typography>

            <Box display="flex" alignItems="center" justifyContent="center">
              <Switch
                name="active"
                color="primary"
                checked={templateValues.active}
                onChange={() =>
                  setTemplateValues((prev: any) => ({
                    ...prev,
                    active: !prev.active,
                  }))
                }
                disabled={!switchEnabled}
              />
              <Typography component="span">Active</Typography>
            </Box>
          </Box>
          <FormStepper
            steps={steps}
            forms={forms}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            handleNext={handleNext}
            handleBack={handleBack}
            handleFinalSubmit={isEdit ? handleUpdate : handleCreate}
            backBtn={
              <BackButton
                parentPageLink="/kpi/settings"
                redirectToTab="KPI Report Templates"
              />
            }
          />
        </>
      )}
    </>
  );
}

export default KpiReportTemplateStepper;
