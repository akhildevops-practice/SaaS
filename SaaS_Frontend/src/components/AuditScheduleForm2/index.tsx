import {
  Grid,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import useStyles from "./styles";
import CustomModal from "../newComponents/CustomModal";
import axios from "../../apis/axios.global";

type Props = {
  auditScheduleData: any;
  setAuditScheduleData: React.Dispatch<React.SetStateAction<any>>;
  isModalOpen?: boolean;
  setIsModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit?: boolean;
};

/**
 * This the whole UI structure of the Audit Scope Form
 *
 * @param {boolean} isEdit This is to check if the form is in EDIT mode
 * @returns Audit Scope Form
 */

function AuditScheduleForm2({
  auditScheduleData,
  setAuditScheduleData,
  isModalOpen = false,
  setIsModalOpen = () => {},
  isEdit = false,
}: Props) {
  const [scopes, setScopes] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [tempScope, setTempScope] = useState<string>("");

  const classes = useStyles();

  const convertDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return yyyy + "-" + mm + "-" + dd;
  };

  useEffect(() => {
    getScopes();
    getRoles();
  }, []);

  // useEffect(()=>{
  //   console.log("checkaudit auditScheduleData in plan form 2",auditScheduleData);
    
  // },[auditScheduleData])

  // get scopes by location
  const getScopes = async () => {
    await axios(`/api/auditPlan/getEntityByLocation`)
      .then((res) => {
        setScopes(res.data);
      })
      .catch((err) => console.error(err));
  };

  // get roles
  const getRoles = async () => {
    await axios(`/api/auditPlan/getRoles`) // roles API here
      .then((res) => {
        setRoles(res.data);
      })
      .catch((err) => console.error(err));
  };

  // get templates

  const handleChange = (e: any) => {
    if (
      !isEdit &&
      e.target.name === "scope" &&
      auditScheduleData.AuditScheduleEntitywise.length > 0
    ) {
      setTempScope(e.target.value);
      setIsModalOpen(true);
      return;
    }
    if (e.target.name === "minDate" || e.target.name === "maxDate") {
      setAuditScheduleData((prev: any) => ({
        ...prev,
        [e.target.name]: e.target.valueAsDate,
      }));
      return;
    }
    setAuditScheduleData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      {!isEdit && (
        <CustomModal
          open={isModalOpen}
          setOpen={setIsModalOpen}
          heading="Existing schedule will be deleted"
          text={""}
          // text={`An audit schedule for the scope "${
          //   auditScheduleData.scope
          //     ? JSON.parse(auditScheduleData.scope).name
          //     : ""
          // }" already exists. If scope is modified, the existing schedule will be deleted.`}
          buttons={[
            {
              name: "Continue",
              color: "primary",
              func: () => {
                setAuditScheduleData((prev: any) => ({
                  ...prev,
                  scope: tempScope,
                  AuditScheduleEntitywise: [],
                }));
              },
            },
          ]}
        />
      )}
      <form
        data-testid="audit-scope-form"
        autoComplete="off"
        className={classes.form}
      >
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Grid item sm={12} md={6}>
            <Grid
              container
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Grid item sm={12} md={6} className={classes.formTextPadding}>
                <strong>Created By:</strong>
              </Grid>
              <Grid item sm={12} md={6}>
                <strong style={{ color: "b5b5b5" }}>
                  {auditScheduleData.createdBy}
                </strong>
                {/* <TextField
                  fullWidth
                  label=""
                  name="createdBy"
                  value={auditScheduleData.createdBy}
                  variant="outlined"
                  onChange={handleChange}
                  inputProps={{
                    "data-testid": "created-by",
                  }}
                  size="small"
                  InputProps={{
                    style: { borderRadius: "8px" },
                  }}
                  disabled
                /> */}
              </Grid>
              <Grid item sm={12} md={6} className={classes.formTextPadding}>
                <strong>Audit role:</strong>
              </Grid>
              <Grid item sm={12} md={6}>
                <strong style={{ color: "b5b5b5" }}>
                  {auditScheduleData.role}
                </strong>
              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={12} md={6}>
            <Grid
              container
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Grid item sm={12} md={6} className={classes.formTextPadding}>
                <strong>Created On:</strong>
              </Grid>
              <Grid item sm={12} md={6}>
                <strong style={{ color: "b5b5b5" }}>
                  {auditScheduleData.createdOn}
                </strong>
                {/* <TextField
                  fullWidth
                  name="createdOn"
                  value={auditScheduleData.createdOn}
                  variant="outlined"
                  onChange={handleChange}
                  inputProps={{
                    "data-testid": "created-on",
                  }}
                  size="small"
                  InputProps={{
                    style: { borderRadius: "8px" },
                  }}
                  disabled
                /> */}
              </Grid>

              <Grid item sm={12} md={6} className={classes.formTextPadding}>
                <strong>Audit For:</strong>
              </Grid>
              <Grid item sm={12} md={6}>
                <strong style={{ color: "b5b5b5" }}>
                  {auditScheduleData.scope.name}
                </strong>
              </Grid>
            </Grid>
          </Grid>
          {/* <Grid item sm={12} md={5}>
            <Grid container>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Audit Responsibility</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                >
                  <Select
                    name="role"
                    displayEmpty
                    value={auditScheduleData.role}
                    onChange={handleChange}
                    data-testid="role"
                    required
                  >
                    {roles.map((obj) => (
                      <MenuItem key={obj.id} value={obj.id}>
                        {obj.roleName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item sm={12} md={6}>
            <Grid container>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Audit Period</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <strong>From</strong>
                <input
                  name="minDate"
                  value={
                    auditScheduleData.minDate
                      ? convertDate(auditScheduleData.minDate)
                      : ""
                  }
                  onChange={handleChange}
                  type="date"
                  max={
                    auditScheduleData.maxDate
                      ? convertDate(auditScheduleData.maxDate)
                      : ""
                  }
                  className={classes.dateInput}
                />
                <strong>To</strong>
                <input
                  name="maxDate"
                  value={
                    auditScheduleData.maxDate
                      ? convertDate(auditScheduleData.maxDate)
                      : ""
                  }
                  onChange={handleChange}
                  type="date"
                  min={
                    auditScheduleData.minDate
                      ? convertDate(auditScheduleData.minDate)
                      : ""
                  }
                  className={classes.dateInput}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item sm={12} md={5}>
            <Grid container>
              {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Select Audit Checklist</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                >
                  <Autocomplete
                    options={templates}
                    getOptionLabel={(op) => op.label}
                    value={
                      templates.filter(
                        (op) => op.value === auditScheduleData.template
                      )[0]
                        ? templates.filter(
                            (op) => op.value === auditScheduleData.template
                          )[0]
                        : null
                    }
                    onChange={(e, newValue) => {
                      setAuditScheduleData((prev: any) => ({
                        ...prev,
                        template: newValue ? newValue.value : null,
                      }));
                    }}
                    renderInput={(params) => {
                      return (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Checklist"
                          size="small"
                          required
                        />
                      );
                    }}
                  />
                </FormControl>
              </Grid> */}
          {/* </Grid>
          </Grid>  */}
        </Grid>
      </form>
    </>
  );
}

export default AuditScheduleForm2;
