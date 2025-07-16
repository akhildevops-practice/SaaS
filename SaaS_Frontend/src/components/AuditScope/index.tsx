import { useEffect, useState } from "react";
import { Tabs, Input } from "antd";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  TextField,
  useMediaQuery,
} from "@material-ui/core";
import useStyles from "./style";
import { getAllClauses } from "apis/clauseApi";
import { getAllDocumentsByEntity } from "apis/documentsApi";
import { useSetRecoilState } from "recoil";
import { formStepperError } from "recoil/atom";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import { Typography as MuiTypography } from "@material-ui/core";
import { MdExpandMore } from "react-icons/md";

const { TabPane } = Tabs;
const { TextArea } = Input;
type Props = {
  disabledFromProp?: any;
  formData?: any;
  setFormData?: any;
};

const AuditScopeComponent = ({
  disabledFromProp,
  setFormData,
  formData,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const [auditedClauses, setAuditedClauses] = useState<any>([{ item: {} }]);
  const [newClause, setNewClause] = useState("");
  const classes: any = useStyles();
  const [clauses, setClauses] = useState<any>([]);
  const [documents, setDocuments] = useState<any>([]);
  const setStepperError = useSetRecoilState<boolean>(formStepperError);
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
  });
  const [expanded, setExpanded] = useState<any>(false);
  const handleChange = (panel: any) => (event: any, isExpanded: any) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    if (formData?.system) {
      fetchAllClauses();
    }
  }, [formData?.system]);

  useEffect(() => {
    if (formData?.auditedEntity) {
      fetchAllDocuments();
    }
  }, [formData?.auditedEntity]);

  useEffect(() => {
    if (formData?.auditedClauses[0]?.item?.hasOwnProperty("id")) {
      if (formData?.auditedClauses[0]?.item?.id === undefined) {
        setStepperError(true);
      } else {
        setStepperError(false);
      }
    } else if (formData?.auditedClauses[0]?.hasOwnProperty("id")) {
      setStepperError(false);
    } else {
      setStepperError(true);
    }
  }, [formData?.auditedClauses]);

  const fetchAllClauses = () => {
    const data = formData?.system;

    getAllClauses(`${data}`).then((response: any) => {
      // Check if response.data is an array before mapping
      if (Array.isArray(response?.data)) {
        const mappedData: any = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          number: item.number,
        }));

        const finalData = [...mappedData];
        setClauses(finalData);
      }
    });
  };

  const fetchAllDocuments = () => {
    getAllDocumentsByEntity(formData?.auditedEntity).then((response: any) => {
      setDocuments(response?.data);
    });
  };

  const handleAddClause = () => {
    if (newClause.trim()) {
      setAuditedClauses([...auditedClauses, newClause]);
      setNewClause("");
    }
  };

  const handleAuditScopeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(matches){
      setFormData({
        ...formData,
        auditScope: e.target.value,
      });
    }else{
      setFormData?.({
        ...formData,
        auditScope: e.target.value,
      });
    }
    
  };

  useEffect(() => {
    if (formData?.clause_refs && formData?.clause_refs.length > 0) {
      const auditedClauses = formData?.clause_refs?.map((value: any) => ({
        item: {
          id: value._id,
          name: value.name,
          number: value.number,
        },
      }));
      setFormData({
        ...formData,
        auditedClauses: auditedClauses,
      });
    }
  }, [formData?.clause_refs]);

  return (
    <>
      {matches ? (
        <>
          <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <div style={{ marginBottom: "20px" }}>
              <strong className={classes.formTextPadding}>Audit Scope</strong>
              <TextArea
                rows={4}
                placeholder="Enter audit scope here..."
                style={{
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  marginTop: "10px",
                }}
                disabled={false}
                onChange={(e:any)=>{handleAuditScopeChange(e)}}
                value={formData?.auditScope}
              />
            </div>
            {/* <Grid container spacing={2}>
          <Grid item xs={12} md={6} className={classes.formTextPadding}>
            <strong>Systems</strong>
            <DynamicFormSearchField
              data={formData}
              setData={setFormData}
              name="systemDtls"
              keyName="item"
              suggestions={formData?.systemList || []}
              suggestionLabel="name"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <strong>Clauses</strong>
            <DynamicFormSearchField
              data={formData}
              disabled={disabledFromProp}
              setData={setFormData}
              name="auditedClauses"
              keyName="item"
              suggestions={clauses || []}
              suggestionLabel="name"
              hideTooltip={false}
            />
          </Grid>
        </Grid> */}
          </div>
          <Tabs defaultActiveKey="1" tabPosition={"left"}>
            <TabPane tab="Clauses" key="1">
              <CommonReferencesTab
                clauseSearch={true}
                drawer={drawer}
                onlyClauseRef={true}
                clause_refs={formData?.clause_refs}
                auditScheduleData={formData}
                setAuditScheduleData={setFormData}
                systems={formData?.system}
              />
            </TabPane>
            <TabPane tab="Documents" key="2">
              <CommonReferencesTab
                drawer={drawer}
                onlySopRef={true}
                sop_refs={formData?.sop_refs}
                auditScheduleData={formData}
                setAuditScheduleData={setFormData}
              />
            </TabPane>
            {/* <TabPane tab="HIRA" key="3">
              <CommonReferencesTab
                drawer={drawer}
                onlyHiraRef={true}
                hira_refs={formData?.hira_refs}
                auditScheduleData={formData}
                setAuditScheduleData={setFormData}
              />
            </TabPane> */}
            <TabPane tab="CAPA" key="4">
              <CommonReferencesTab
                drawer={drawer}
                onlyCapaRef={true}
                capa_refs={formData?.capa_refs}
                auditScheduleData={formData}
                setAuditScheduleData={setFormData}
              />
            </TabPane>
          </Tabs>
        </>
      ) : (
        <>
          <Box className={classes.container}>
            <MuiTypography
              variant="subtitle1"
              component="h2"
              gutterBottom
              style={{ paddingLeft: "8px" }}
            >
              Audit Scope
            </MuiTypography>
            <TextField
              className={classes.textField}
              multiline
              rows={3}
              variant="outlined"
              placeholder="Enter Audit Scope"
              disabled={false}
              onChange={(e:any)=>{handleAuditScopeChange(e)}}
              value={formData?.auditScope}
            />
            <div style={{ display: "grid", gap: "6px" }}>
              <Accordion
                expanded={expanded === "panel1"}
                onChange={handleChange("panel1")}
                style={{ borderBottom: "1px solid bottom" }}
              >
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <MuiTypography className={classes.textType}>
                    1. Clauses
                  </MuiTypography>
                </AccordionSummary>
                <AccordionDetails>
                  <CommonReferencesTab
                    clauseSearch={true}
                    drawer={drawer}
                    onlyClauseRef={true}
                    clause_refs={formData?.clause_refs}
                    auditScheduleData={formData}
                    setAuditScheduleData={setFormData}
                    systems={formData?.system}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion
                expanded={expanded === "panel2"}
                onChange={handleChange("panel2")}
                style={{ borderBottom: "1px solid bottom" }}
              >
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <MuiTypography className={classes.textType}>
                    2. Documents
                  </MuiTypography>
                </AccordionSummary>
                <AccordionDetails>
                  <CommonReferencesTab
                    drawer={drawer}
                    onlySopRef={true}
                    sop_refs={formData?.sop_refs}
                    auditScheduleData={formData}
                    setAuditScheduleData={setFormData}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion
                expanded={expanded === "panel3"}
                onChange={handleChange("panel3")}
                style={{ borderBottom: "1px solid bottom" }}
              >
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <MuiTypography className={classes.textType}>
                    3. HIRA
                  </MuiTypography>
                </AccordionSummary>
                <AccordionDetails>
                  <CommonReferencesTab
                    drawer={drawer}
                    onlyHiraRef={true}
                    hira_refs={formData?.hira_refs}
                    auditScheduleData={formData}
                    setAuditScheduleData={setFormData}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion
                expanded={expanded === "panel4"}
                onChange={handleChange("panel4")}
                style={{ borderBottom: "1px solid bottom" }}
              >
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <MuiTypography className={classes.textType}>
                    4. CAPA
                  </MuiTypography>
                </AccordionSummary>
                <AccordionDetails>
                  <CommonReferencesTab
                    drawer={drawer}
                    onlyCapaRef={true}
                    capa_refs={formData?.capa_refs}
                    auditScheduleData={formData}
                    setAuditScheduleData={setFormData}
                  />
                </AccordionDetails>
              </Accordion>
            </div>
          </Box>
        </>
      )}
    </>
  );
};

export default AuditScopeComponent;
