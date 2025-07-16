import SingleFormWrapper from "containers/SingleFormWrapper";
import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import { Button, Divider, Tabs } from "antd";
import CircularProgress from "@material-ui/core/CircularProgress";
import AuditTypeForm1 from "components/AuditTypeForm1";
import AuditTypeForm4 from "components/AuditTypeForm4";
import AuditTypeRulesForm from "components/AuditTypeRulesForm";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import {
  findingsData,
  auditTypesFormData,
  orgFormData,
  findingsValuesData,
} from "../../recoil/atom";
import axios from "apis/axios.global";
import { useNavigate, useParams } from "react-router-dom";
import { auditTypeData } from "schemas/auditTypeData";
import { useSnackbar } from "notistack";
import checkRole from "utils/checkRoles";
import { getAllAuditFindings, saveAuditFindings } from "apis/auditFindingsApi";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import { isValid } from "utils/validateInput";
type Props = {
  data?: any;
  values?: any;
};
const AuditTypeFormStepper = ({ data, values }: Props) => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [entity, setEntity] = React.useState([]);
  const [scopes, setScopes] = useState<any[]>([]);
  const [formData, setFormData] = useRecoilState(auditTypesFormData);
  const [findings, setFindings] = useRecoilState(findingsData);
  const [findingsValues, setFindingsValues] =
    useRecoilState(findingsValuesData);
  const resetFindings = useResetRecoilState(findingsData);
  const [selectedData, setSelectedData] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const uniqueId = generateUniqueId(22);
  const [addRowData, setAddRowData] = useState([
    {
      headings: " ",
      headingsId: " ",
      comments: " ",
      checkboxes: [false, false, false, false, false, false],
      dropdown: "None",
      id: "",
      button: true,
    },
  ]);

  // const handlerAddFindingsActions = () =>{
  //   const payload ={
  //     headings: " ",
  //     comments:" ",
  //     checkboxes: [false, false, false, false, false, false],
  //     dropdown: "None",
  //     id: uniqueId,
  //     button: false,
  //     addButton :true,
  //   }
  //   setFindings([payload, ...findings]);
  //  }

  const dummyHeadersData = [
    "Findings",
    "FindingsID",
    "Finding Definition",
    "Select Clause",
    "Accept",
    "Reject",
    "AutoAccept",
    "Auditee Corrective Action",
    "Auditor Verification",
    "Closure by Owner",
    "Actions",
  ];
  const orgData = useRecoilValue(orgFormData);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  const { id } = useParams();
  const isEdit = id ? true : false;

  useEffect(() => {
    if (isEdit) {
      getAuditTypeDetailsById();
    }
    getScopes();
    getEntity();
    getFindingsData();
  }, []);

  useEffect(() => {
    getFindingsData();
  }, [rowsPerPage, page]);

  const getFindingsData = () => {
    getAllAuditFindings(page, rowsPerPage).then((response: any) => {
      const ResponseDataCheckBox = response.data.map((obj: any) =>
        Object.keys(obj)
          .filter((key: any) => typeof obj[key] === "boolean")
          .reduce((acc: any, key: any) => {
            acc[key] = obj[key];
            return acc;
          }, {})
      );

      const DataValuesHeaders = ResponseDataCheckBox.map((item: any) => {
        const data = {
          SelectClause: item.selectClause,
          Accept: item.accept,
          Reject: item.reject,
          AutoAccept: item.auditorVerification,
          AuditeeCorrectiveAction: item.correctiveAction,
          AuditorVerification: item.auditorVerification,
        };
        return data;
      });

      const attributeValues: boolean[][] = DataValuesHeaders.map((item: any) =>
        Object.values(item)
      );

      const FinalDataMapped = {
        headings: response.data.map((item: any) => {
          return {
            findings: item.findingType,
            findingsId: item.findingTypeId,
            comments: item.comments,
          };
        }),
        _id: response.data.map((item: any) => item._id),
        checkboxes: attributeValues,
        dropdown: response.data.map((item: any) => item.closureBy),
        auditTypeId: response.data.map((item: any) => item.auditTypeId),
      };

      const DataByHead = FinalDataMapped.headings.map((item: any, index: any) => {
        return {
          id: FinalDataMapped._id[index],
          headings: item.findings,
          headingsId: item.findingsId,
          comments: item.comments,
          checkboxes: FinalDataMapped.checkboxes[index],
          dropdown: FinalDataMapped.dropdown[index],
          auditTypeId: FinalDataMapped.auditTypeId[index],
          button: true,
        };
      });

      const DataByFinalValuesId = DataByHead.filter(
        (item: any) => item.auditTypeId === id
      );

      if (DataByFinalValuesId) {
        setFindings(DataByFinalValuesId);
      } else {
        setFindings([
          {
            headings: " ",
            headingsId: " ",
            checkboxes: [false, false, false, false, false, false],
            dropdown: "None",
          },
        ]);
      }
    });
  };
  const getAuditTypeDetailsById = async () => {
    await axios(`/api/audit-settings/getAuditTypeById/${id}`)
      .then((res) => {
        setFormData({
          id: res.data.id,
          auditType: res.data.auditType,
          auditTypeId: res.data.auditTypeId,
          Description: res.data.Description,
          multipleEntityAudit: res?.data?.multipleEntityAudit || false,
          auditorCheck: res.data.auditorCheck,
          allowConsecutive: res.data.allowConsecutive,
          auditorsFromSameUnit: res.data.auditorsFromSameUnit,
          auditorsFromSameDept: res.data.auditorsFromSameDept,
          inductionApproval: res.data.inductionApproval,
          scope: res.data.scope,
          system: res?.data.system || [],
          responsibility: res.data.responsibility,
          planType: res.data.planType,
          organizationId: organizationId,
          AutoAcceptNC: res.data.AutoAcceptNC,
          ClosureRemindertoDeptHead: res.data.ClosureRemindertoDeptHead,
          ClosureRemindertoMCOE: res.data.ClosureRemindertoMCOE,
          VerificationOwner: res?.data?.VerificationOwner,
          AuditeeReminder: res.data.AuditeeReminder,
          EscalationtoDepartmentHead: res.data.EscalationtoDepartmentHead,
          EscalationtoMCOE: res.data.EscalationtoMCOE,
          whoCanPlan: res.data.whoCanPlan,
          whoCanSchedule: res.data.whoCanSchedule,
          planningUnit: res.data.planningUnit,
          planningEntity: res.data.planningEntity,
          schedulingEntity: res.data.schedulingEntity,
          schedulingUnit: res.data.schedulingUnit,
          useFunctionsForPlanning: res?.data?.useFunctionsForPlanning,
          maxSections: res?.data?.maxSections,
          auditTimeFrame: res?.data?.auditTimeFrame,
          noOfSopQuestions: res?.data?.noOfSopQuestions,
          noOfFindingsQuestions: res?.data?.noOfFindingsQuestions,
          noOfOperationQuestions: res?.data?.noOfOperationQuestions,
          noOfHiraQuestions: res?.data?.noOfHiraQuestions,
          noOfAspImpQuestions: res?.data?.noOfAspImpQuestions,
          resolutionWorkFlow: res?.data?.resolutionWorkFlow,
        });
      })
      .catch((err) => console.error(err));
  };

  const handleTabChange = (key: any) => {
    setActiveTab(key);
  };

  const handlePrevious = () => {
    const currentTabKey = parseInt(activeTab);
    const previousTabKey = (currentTabKey - 1).toString();
    setActiveTab(previousTabKey);
  };

  const handleNext = () => {
    const currentTabKey = parseInt(activeTab);
    const nextTabKey = (currentTabKey + 1).toString();
    setActiveTab(nextTabKey);
  };

  // get scopes by location
  const getEntity = async () => {
    await axios(`/api/entity/`)
      .then((res) => {
        setEntity(res.data);
      })
      .catch((err) => console.error(err));
  };

  // get scopes by location
  const getScopes = async () => {
    await axios(`/api/auditPlan/getEntityByLocation`)
      .then((res) => {
        const unit = { id: "Unit", name: "Unit" };
        // const corpFunc = { id: "corpFunction", name: "Corporate Function" };
        setScopes([...res.data, unit, 
          // corpFunc
        ]);
      })
      .catch((err) => console.error(err));
  };

  const handleChange = (
    e: React.ChangeEvent<{ name?: string | undefined; value: any }>
  ) => {
    const { name, value } = e.target;
    if (name === "whoCanPlan") {
      setFormData((prevData: any) => ({
        ...prevData,
        planningEntity: {},
        planningUnit: [],
      }));
    } else if (name === "whoCanSchedule") {
      setFormData((prevData: any) => ({
        ...prevData,
        schedulingEntity: {},
        schedulingUnit: [],
      }));
    }
    if (selectedData) {
      setSelectedData((prevData: any) => ({
        ...prevData,
        [name as string]: value as string,
      }));
    } else if (
      name === "maxSections" ||
      name === "auditTimeFrame" ||
      name === "noOfSopQuestions" ||
      name === "noOfFindingsQuestions" ||
      name === "noOfOperationQuestions" ||
      name === "noOfHiraQuestions" ||
      name === "noOfAspImpQuestions"
    ) {
      setFormData((prevData: any) => ({
        ...prevData,
        [name as string]: value === "" ? value : Number(value),
      }));
    } else {
      // Add mode: Update formData directly
      setFormData((prevData: any) => ({
        ...prevData,
        [name as string]: value as string,
      }));
    }
  };

  const handleSubmit = async () => {
    const validateAuditType = await isValid(formData.auditType);

    if (validateAuditType.isValid === false) {
      enqueueSnackbar(`Audit Type ${validateAuditType?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
    if (!formData?.resolutionWorkFlow || formData?.resolutionWorkFlow === "") {
      enqueueSnackbar(
        `Resolution WorkFlow should not be empty, please select option`,
        {
          variant: "error",
        }
      );
      return;
    }

    if (isEdit) {
      // Update existing audit type
      if (isOrgAdmin) {
        if (!formData.auditType) {
          enqueueSnackbar(`Audit Type should not be empty`, {
            variant: "error",
          });
          return;
        }

        if (!formData.auditTypeId) {
          enqueueSnackbar(`Audit Type ID should not be empty`, {
            variant: "error",
          });
          return;
        }

        if (!formData.scope) {
          enqueueSnackbar(`Scope should not be empty`, {
            variant: "error",
          });
          return;
        }

        try {
          setIsLoading(true);

          await axios.put(
            `/api/audit-settings/updateAuditTypeById/${formData.id}`,
            {
              id: formData.id,
              auditType: formData.auditType,
              auditTypeId: formData.auditTypeId,
              Description: formData.Description,
              auditorCheck: formData.auditorCheck,
              allowConsecutive: formData.allowConsecutive,
              auditorsFromSameUnit: formData.auditorsFromSameUnit,
              auditorsFromSameDept: formData.auditorsFromSameDept,
              inductionApproval: formData.inductionApproval,
              scope: formData.scope,
              multipleEntityAudit: formData?.multipleEntityAudit,
              responsibility: formData.responsibility,
              planType: "Month",
              system: formData.system,
              organizationId: organizationId,
              AutoAcceptNC: formData.AutoAcceptNC,
              useFunctionsForPlanning: formData.useFunctionsForPlanning,
              ClosureRemindertoDeptHead: formData.ClosureRemindertoDeptHead,
              ClosureRemindertoMCOE: formData.ClosureRemindertoMCOE,
              //  VerificationOwner: formData?.VerificationOwner,
              AuditeeReminder: formData.AuditeeReminder,
              EscalationtoDepartmentHead: formData.EscalationtoDepartmentHead,
              EscalationtoMCOE: formData.EscalationtoMCOE,
              whoCanPlan: formData.whoCanPlan,
              whoCanSchedule: formData.whoCanSchedule,
              planningUnit: formData.planningUnit,
              planningEntity: formData.planningEntity,
              schedulingEntity: formData.schedulingEntity,
              schedulingUnit: formData.schedulingUnit,
              maxSections: formData.maxSections,
              auditTimeFrame: formData.auditTimeFrame,
              noOfSopQuestions: formData.noOfSopQuestions,
              noOfFindingsQuestions: formData.noOfFindingsQuestions,
              noOfOperationQuestions: formData.noOfOperationQuestions,
              noOfHiraQuestions: formData.noOfHiraQuestions,
              noOfAspImpQuestions: formData.noOfAspImpQuestions,
              resolutionWorkFlow: formData?.resolutionWorkFlow,
            }
          );
          setIsLoading(false);
          enqueueSnackbar(`Saved Successfully`, {
            variant: "success",
          });
          setFormData(auditTypeData);
          navigate("/auditsettings");
        } catch (err) {
          setIsLoading(false);
          enqueueSnackbar(`Error Occured while editing audit type`, {
            variant: "error",
          });
        }
      } else {
        setIsLoading(false);
        enqueueSnackbar(`Only MCOE Admin Can Edit`, {
          variant: "error",
        });
        navigate("/auditsettings");
      }
    } else {
      // Create new audit type
      const isUnique = await axios.get(
        `/api/audit-settings/isValidAuditSettingName/${formData.auditType}`
      );
      const response = await axios.get(`api/globalsearch/getRecycleBinList`);
      const data = response?.data;
      const entityDocuments = data.find(
        (item: any) => item.type === "auditsettings"
      );
      if (entityDocuments) {
        // Check if the name already exists
        const existingEntity = entityDocuments.documents.find(
          (doc: any) => doc.auditType === formData?.auditType
        );

        // Return true if the name exists, otherwise false
        if (existingEntity) {
          enqueueSnackbar(
            `AuditType with the same name already exists, please check in Recycle bin and Restore if required`,
            {
              variant: "error",
              // anchorOrigin: {
              //   vertical: "top",
              //   horizontal: "right",
              // },
            }
          );
          setIsLoading(false);
          //navigate("/auditsettings");
          return;
        }
      }

      if (
        isUnique.data &&
        formData.scope &&
        isOrgAdmin &&
        formData?.whoCanPlan &&
        formData?.whoCanSchedule &&
        formData?.auditTypeId &&
        formData?.resolutionWorkFlow
      ) {
        try {
          setIsLoading(true);

          await axios
            .post(`/api/audit-settings/newauditType`, {
              auditType: formData.auditType,
              auditTypeId: formData.auditTypeId,
              Description: formData.Description,
              auditorCheck: formData.auditorCheck,
              allowConsecutive: formData.allowConsecutive,
              auditorsFromSameUnit: formData.auditorsFromSameUnit,
              auditorsFromSameDept: formData.auditorsFromSameDept,
              inductionApproval: formData.inductionApproval,
              scope: formData.scope,
              multipleEntityAudit: formData?.multipleEntityAudit,
              responsibility: formData.responsibility,
              planType: "Month",
              system: formData?.system,
              organizationId: organizationId,
              AutoAcceptNC: formData.AutoAcceptNC,
              ClosureRemindertoDeptHead: formData.ClosureRemindertoDeptHead,
              ClosureRemindertoMCOE: formData.ClosureRemindertoMCOE,
              // VerificationOwner: formData.VerificationOwner,
              AuditeeReminder: formData.AuditeeReminder,
              EscalationtoDepartmentHead: formData.EscalationtoDepartmentHead,
              EscalationtoMCOE: formData.EscalationtoMCOE,
              whoCanPlan: formData.whoCanPlan,
              whoCanSchedule: formData.whoCanSchedule,
              planningUnit: formData.planningUnit,
              planningEntity: formData.planningEntity,
              schedulingEntity: formData.schedulingEntity,
              schedulingUnit: formData.schedulingUnit,
              useFunctionsForPlanning: formData.useFunctionsForPlanning,
              maxSections: formData.maxSections,
              auditTimeFrame: formData.auditTimeFrame,
              noOfSopQuestions: formData.noOfSopQuestions,
              noOfFindingsQuestions: formData.noOfFindingsQuestions,
              noOfOperationQuestions: formData.noOfOperationQuestions,
              noOfHiraQuestions: formData.noOfHiraQuestions,
              noOfAspImpQuestions: formData.noOfAspImpQuestions,
              resolutionWorkFlow: formData?.resolutionWorkFlow,
            })
            .then((response: any) => {
              const FinalValuesFindings = findingsValues?.map((obj: any) => ({
                ...obj,
                auditTypeId: response.data._id,
              }));
              saveAuditFindings(FinalValuesFindings).then((response: any) => {
                resetFindings();
                setFindingsValues([]);
              });
            });
          setIsLoading(false);
          enqueueSnackbar(`successfully created`, {
            variant: "success",
          });
          setFormData(auditTypeData);
          navigate("/auditsettings");
        } catch (err) {
          setIsLoading(false);
          enqueueSnackbar(`Error Occured while creating audit type`, {
            variant: "error",
          });
        }
      } else {
        setIsLoading(false);
        // if (!formData.VerificationOwner) {
        //   enqueueSnackbar(`Select Closure Owner`, {
        //     variant: "error",
        //   });
        // }
        if (isOrgAdmin) {
          if (!formData.scope) {
            enqueueSnackbar(`Select Audit Scope`, {
              variant: "error",
            });
          }
          if (
            !formData?.whoCanPlan ||
            !formData?.whoCanSchedule ||
            !formData?.auditTypeId
          ) {
            enqueueSnackbar(`Enter All * Mandatory Field`, {
              variant: "error",
            });
          }

          if (!isUnique.data) {
            enqueueSnackbar(`Entered Audit Type already exist!`, {
              variant: "error",
            });
          }
        } else {
          enqueueSnackbar(`Only MCOE can create Audit Type`, {
            variant: "error",
          });
        }
      }
    }
    if (id) {
      const FinalValuesFindings = findingsValues?.map((obj: any) => ({
        ...obj,
        auditTypeId: id,
      }));
      saveAuditFindings(FinalValuesFindings).then((response: any) => {
        resetFindings();
        setFindingsValues([]);
      });
    }
  };

  const tabs = [
    {
      label: "Audit Info",
      key: 1,
      children: (
        <AuditTypeForm1
          scopes={scopes}
          handleChange={handleChange}
          formData={formData}
          setFormData={setFormData}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          tabKey={activeTab}
        />
      ),
    },
    {
      label: "Finding Types",
      key: 2,
      children: (
        <AuditTypeForm4
          header={dummyHeadersData}
          fields={addRowData}
          setRow={setAddRowData}
          data={findings}
          setData={setFindings}
          values={findingsValues}
          setValues={setFindingsValues}
          orgId={organizationId}
          addFields={true}
          setRowsPerPage={setRowsPerPage}
          rowsPerPage={rowsPerPage}
          page={page}
          setPage={setPage}
        />
      ),
    },
    {
      label: "AI Rules",
      key: 3,
      children: (
        <AuditTypeRulesForm handleChange={handleChange} formData={formData} />
      ),
    },
    // {
    //   label: "Automation",
    //   key: 3,
    //   children: (
    //     <AuditTypeForm2
    //       handleChange={handleChange}
    //       formData={formData}
    //       selectedData={selectedData}
    //     />
    //   ),
    // },
    // {
    //   label: "Action Item",
    //   key: 4,
    //   children: (
    //     <AuditTypeForm3
    //       handleChange={handleChange}
    //       formData={formData}
    //       selectedData={selectedData}
    //     />
    //   ),
    // },
  ];

  const [isReadMode, setIsReadMode] = useState(false);

  useEffect(() => {
    const url = window.location.href;
    const isReadModeUrl = url.includes(
      "audit/auditsettings/auditTypeForm/readMode"
    );
    setIsReadMode(isReadModeUrl);
  }, []);

  return (
    <>
      <div className={classes.root}>
        <SingleFormWrapper
          parentPageLink="/auditsettings"
          backBtn={false}
          disableFormFunction={true}
          label={isEdit ? "Edit Audit Type" : "Create Audit Type"}
        >
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
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "20px",
                }}
                className={classes.tabsWrapper}
              >
                <Tabs
                  activeKey={activeTab}
                  type="card"
                  onChange={handleTabChange} // This will handle the tab changes
                  animated={{ inkBar: true, tabPane: true }}
                  style={{ marginLeft: "10px" }}
                >
                  {tabs.map((tab) => (
                    <Tabs.TabPane key={tab.key} tab={tab.label}>
                      {tab.children}
                    </Tabs.TabPane>
                  ))}
                </Tabs>

                <Divider style={{ marginTop: "20px" }} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <Button
                    size="middle"
                    disabled={activeTab === "1"}
                    onClick={handlePrevious}
                    className={classes.previousButton}
                  >
                    Previous
                  </Button>
                  {activeTab === "3" ? (
                    <Button
                      size="middle"
                      type="primary"
                      onClick={handleSubmit}
                      className={classes.colorFilledButton}
                      disabled={isReadMode}
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button
                      size="middle"
                      disabled={activeTab === tabs.length.toString()}
                      onClick={handleNext}
                      className={classes.colorFilledButton}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
          {/* </div> */}
        </SingleFormWrapper>
      </div>
    </>
  );
};

export default AuditTypeFormStepper;
