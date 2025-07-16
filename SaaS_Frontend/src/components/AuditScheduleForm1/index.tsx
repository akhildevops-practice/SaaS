import {
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import axios from "../../apis/axios.global";
import checkRoles from "utils/checkRoles";
import { Autocomplete } from "@material-ui/lab";
import getAppUrl from "utils/getAppUrl";
import { useNavigate, useParams } from "react-router-dom";
import getSessionStorage from "utils/getSessionStorage";
import { useRecoilState } from "recoil";
import { auditScheduleFormType } from "recoil/atom";
type Props = {
  auditScheduleData: any;
  setLocationNo: any;
  setAuditScheduleData: React.Dispatch<React.SetStateAction<any>>;
  isEdit?: any;

  systemTypes?: any;
  setSystemTypes?: any;
  systems?: any;
  setSystems?: any;
  locationNames?: any;
  setLocationNames?: any;
  templates?: any;
  setTemplates?: any;
  auditTypes?: any;
  setAuditTypes?: any;
  functionList?: any;
  isScheduleInDraft?: boolean;
  disableAuditorsAndChecklistField?: any;
  disableEditScheduleForOtherUnit?: any;
  teamLeadId?: any;
  refForForAuditScheduleForm1?: any;
  refForForAuditScheduleForm2?: any;
  refForForAuditScheduleForm3?: any;
  refForForAuditScheduleForm4?: any;
  refForForAuditScheduleForm5?: any;
  refForForAuditScheduleForm6?: any;
};

/**
 * This the whole UI structure of the Audit Schedule Information Form
 *
 * @param {boolean} isEdit This is to check if the form is in EDIT mode
 * @returns Audit Schedule Information Form
 */

function AuditScheduleForm1({
  auditScheduleData,
  setAuditScheduleData,
  setLocationNo,
  isEdit = false,
  functionList,
  systemTypes = [],
  systems = [],
  locationNames = [],
  templates = [],
  auditTypes = [],
  isScheduleInDraft = false,
  disableAuditorsAndChecklistField = false,
  disableEditScheduleForOtherUnit = false,
  teamLeadId = null,
  refForForAuditScheduleForm1,
  refForForAuditScheduleForm2,
  refForForAuditScheduleForm3,
  refForForAuditScheduleForm4,
  refForForAuditScheduleForm5,
  refForForAuditScheduleForm6,
}: Props) {
  const classes = useStyles();
  const userDetails = getSessionStorage();
  // const [systemTypes, setSystemTypes] = useState<any[]>([]);
  const [systemName,setSystemname] = useState([])
  // const [systems, setSystems] = useState<any[]>([]);
  // const [locationNames, setLocationNames] = useState<any>([]);
  // const [templates, setTemplates] = useState<any[]>([]);
  // const [auditTypes, setAuditTypes] = useState<any[]>([]);

  console.log("auditTypes",auditTypes)

  console.log("template options in auditscheduleform 1", templates);
  

  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const realmName = getAppUrl();
  const navigate = useNavigate();
  const { from, id } = useParams();

  const [scheduleFormType, setScheduleFormType] = useRecoilState(
    auditScheduleFormType
  );
  // useEffect(() => {
  //   getSystemTypes();
  //   getLocation();
  //   getLocationNames();
  //   getAuditYear();
  //   getSystems();
  //   getTemplates();
  //   getAuditType();
  // }, []);

  // useEffect(() => {
  //   console.log("updated systems");
  //   getSystems();
  // }, [auditScheduleData.location]);

  // useEffect(() => {
  //   console.log("checkaudit templates", templates);
  // },[templates]);

  // useEffect(() => {
  //   console.log("checkaudit auditScheduleData", auditScheduleData);
  // }, [auditScheduleData]);
  useEffect(() => {
    if (
      !isEdit &&
      auditScheduleData.auditType !== undefined &&
      auditScheduleData.auditType !== "undefined"
    ) {
      const useFunctionsForPlanningData = auditTypes.filter(
        (value: any) => value.id === auditScheduleData.auditType
      );

      setAuditScheduleData({
        ...auditScheduleData,
        useFunctionsForPlanning:
          useFunctionsForPlanningData[0]?.useFunctionsForPlanning || false,
      });
    }
  }, [auditScheduleData.auditType]);

  const handleChangeNew = (event: any, values: any) => {
    setAuditScheduleData((prev: any) => ({
      ...prev,
      location: values,
    }));
    setLocationNo(values?.locationId);
  };

  const handleChange = (e: any) => {
    if (e.target.name === "auditType") {
      const findData = auditTypes?.find((value:any)=>value?.id ===e.target.value)
      console.log("findData",findData)
      // const useFunctionsForPlanningCondition =
      setAuditScheduleData((prev: any) => ({
        ...prev,
        [e.target.name]: e.target.value,
        systemName:findData?.system||[]
      }));
      getScopeAndrole(e.target.value);
    }
    // console.log("checkaudit inside handleChange", auditScheduleData);

    setAuditScheduleData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const getScopeAndrole = async (id: any) => {
    await axios(`api/audit-settings/getAuditTypeById/${id}`) // location by user ID API here
      .then((res) => {
        const parsedScope = JSON.parse(res.data.scope);

        setAuditScheduleData((prev: any) => ({
          ...prev,
          scope: parsedScope,
          role: res.data.responsibility,
        }));

        // setScope(res.data.name);
        // setrole(res.data.responsibility);
      })
      .catch((err) => console.error(err));
  };
  const handleChangeforfunction = (e: any) => {
    setAuditScheduleData({
      ...auditScheduleData,
      selectedFunction: e.target.value,
    });
  };

  const handlePreviewTemplate = (templateId: any) => () => {
    navigate(`/audit/auditchecklist/create`, {
      state : {
        edit : false,
        id : templateId,
        preview : true
      }
    });
  }

  return (
    // <div className={classes.root}>
    <form
      data-testid="audit-system-form"
      autoComplete="off"
      className={classes.form}
    >
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        {/* Left Column (Audit Schedule Name, Audit Type, Location) */}
        <Grid item sm={12} md={6}>
          <Grid
            container
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>
                <span className={classes.label}>Audit Schedule Title</span>
                <span className={classes.asterisk}>*</span>{" "}
              </strong>
            </Grid>
            <Grid
              item
              sm={12}
              md={8}
              className={classes.formBox}
              // style={{ paddingRight: "3%" }}
            >
              <div ref={refForForAuditScheduleForm1}>
                <TextField
                  fullWidth
                  name="auditScheduleName"
                  value={auditScheduleData.auditScheduleName}
                  variant="outlined"
                  // placeholder="Please Enter Audit Schedule Name"
                  onChange={handleChange}
                  size="small"
                  required
                  InputLabelProps={{ shrink: false }}
                  inputProps={{
                    // maxLength: 25,
                    "data-testid": "auditScheduleName",
                  }}
                  disabled={isEdit && !isScheduleInDraft}
                  className={classes.textField}
                  // InputProps={{
                  //   style: { fontSize: "14px" },
                  // }}
                />
              </div>
            </Grid>

            <Grid item sm={2} md={4} className={classes.formTextPadding}>
              <strong>
                <span className={classes.label}>Audit Type</span>
                <span className={classes.asterisk}>*</span>{" "}
              </strong>
            </Grid>
            {isEdit && auditScheduleData.auditPlanId !== "No Plan" ? (
              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                >
                  <div ref={refForForAuditScheduleForm3}>
                    <TextField
                      fullWidth
                      name="auditName"
                      value={auditScheduleData.auditTypeName}
                      // placeholder="Please Enter Audit Name"
                      variant="outlined"
                      size="small"
                      required
                      disabled={true}
                      InputLabelProps={{ shrink: false }}
                      inputProps={{
                        "data-testid": "auditName",
                      }}
                      InputProps={{
                        style: { fontSize: "14px" },
                      }}
                      className={classes.textField}
                    />
                  </div>
                </FormControl>
              </Grid>
            ) : (
              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                >
                  {/* <div > */}
                  <Select
                    ref={refForForAuditScheduleForm3}
                    name="auditType"
                    displayEmpty
                    value={auditScheduleData.auditType}
                    onChange={handleChange}
                    data-testid="auditType"
                    required
                    disabled={
                      scheduleFormType === "adhoc-create" ? false : true
                    }
                    // style={{ fontSize: "14px" }}
                  >
                    {auditTypes.map((obj: any) => (
                      <MenuItem key={obj.id} value={obj.id}>
                        {obj.auditType}
                      </MenuItem>
                    ))}
                  </Select>
                  {/* </div> */}
                </FormControl>
              </Grid>
            )}

            {/* <Grid item sm={2} md={4} className={classes.formTextPadding}>
              <strong>Select Audit Checklist</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <div ref={refForForAuditScheduleForm5}>
                  <Autocomplete
                    multiple
                    id="select-audit-checklist"
                    options={templates}
                    getOptionLabel={(op) => op.label}
                    value={
                      auditScheduleData?.auditTemplates?.map(
                        (templateId: any) =>
                          templates.find((t: any) => t.value === templateId) ||
                          {}
                      ) || []
                    }
                    onChange={(e, newValues) => {
                      setAuditScheduleData((prev: any) => ({
                        ...prev,
                        auditTemplates: newValues?.map((nv) => nv.value),
                      }));
                    }}
                    disabled={
                      (isEdit && !isScheduleInDraft) ||
                      disableAuditorsAndChecklistField ||
                      (isEdit &&
                        (isScheduleInDraft || auditScheduleData?.isDraft) &&
                        teamLeadId !== userDetails?.id)
                    }
                    renderTags={(selectedOptions, getTagProps) =>
                      selectedOptions.map((option, index) => (
                        <div
                          key={option.value}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            margin: "2px",
                            padding: "4px 8px",
                            background: "#f0f0f0",
                            borderRadius: "4px",
                          }}
                          {...getTagProps({ index })}
                        >
                          <span>{option.label}</span>
                          <Button 
                            type="text"
                            icon={<MdOpenInNew />}
                            onClick={handlePreviewTemplate(option.value)}
                          />
                          {/* <a
                            href={`/audit-template/${option.value}`} // Replace with your dynamic URL logic
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: "8px", color: "#007bff" }}
                          >
                           <MdOpenInNew  style={{width : "25px", height: "25px"}}/>
                          </a> */}
            {/*</div>
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        required
                      />
                    )}
                  />
                </div>
              </FormControl>
            </Grid> */}

            <Grid
              item
              xs={12}
              md={6}
              className={classes.formTextPadding}
              style={{
                display: "flex",
                marginTop: "20px",
              }}
            >
              <Grid item sm={12} md={4}>
                <Typography component="span" className={classes.label}>
                  {" "}
                  <strong>Associated Audit Plan</strong>
                </Typography>
              </Grid>
              <strong
                style={{
                  paddingTop: "5px",
                  paddingRight: "20px",
                  marginLeft: "-15px",
                  fontSize: "20px",
                }}
              >
                :
              </strong>
              <a
                style={{
                  color: "black",
                  textDecoration: "underline",
                  paddingTop: "10px",
                }}
                onClick={() => {
                  const url = `/audit/auditplan/auditplanform/readonly/${auditScheduleData.auditNumber}`;
                  window.open(url, "_blank");
                }}
                ref={refForForAuditScheduleForm6}
              >
                {auditScheduleData.auditName}
              </a>
            </Grid>
            {auditScheduleData.useFunctionsForPlanning ? (
              <>
                <Grid item sm={2} md={4} className={classes.formTextPadding}>
                  <strong>
                    <span className={classes.label}>Function</span>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <Select
                      value={auditScheduleData?.selectedFunction || []}
                      onChange={handleChangeforfunction}
                      name="function"
                      multiple
                      required
                      displayEmpty
                      data-testid="function"
                      disabled={isEdit && !isScheduleInDraft}
                    >
                      {functionList?.map((item: any) => {
                        return (
                          <MenuItem key={item.id} value={item?.id}>
                            {item?.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            ) : (
              ""
            )}
          </Grid>
        </Grid>
        {/* Right Column (System, Audit Checklist, Associated Audit Plan) */}
        <Grid item sm={12} md={6}>
          <Grid
            container
            style={{
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
            }}
          >
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Location</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <div ref={refForForAuditScheduleForm2}>
                <Autocomplete
                  id="location-autocomplete"
                  options={locationNames}
                  getOptionLabel={(option: any) => option.locationName || ""}
                  getOptionSelected={(option, value) => option.id === value.id}
                  disabled={!isOrgAdmin || (isEdit && !isScheduleInDraft)}
                  value={auditScheduleData.location}
                  onChange={handleChangeNew}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </div>
            </Grid>

            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>
                <span className={classes.label}>System Name</span>
                <span className={classes.asterisk}>*</span>{" "}
              </strong>
            </Grid>
            <Grid item xs={12} md={8} className={classes.formBox}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                {/* <div ref={refForForAuditScheduleForm4}> */}
                <Select
                  ref={refForForAuditScheduleForm4}
                  name="systemName"
                  displayEmpty
                  value={auditScheduleData.systemName}
                  multiple={true}
                  onChange={handleChange}
                  data-testid="system-name"
                  required
                  disabled={true}
                  className={classes.disabledSelect}
                >
                  <MenuItem value="" disabled>
                    <em>Please enter the value</em>
                  </MenuItem>
                  {systems.map((obj: any) => (
                    <MenuItem key={obj.id} value={obj.id}>
                      {obj.name}
                    </MenuItem>
                  ))}
                </Select>
                {/* </div> */}
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              md={8}
              className={classes.formTextPadding}
              style={{
                display: "flex",
                marginTop: "90px",
              }}
            ></Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
    // </div>
  );
}

export default AuditScheduleForm1;
