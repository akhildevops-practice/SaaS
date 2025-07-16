import { useEffect, useState } from "react";
import useStyles from "./styles";
import { Grid, TextField } from "@material-ui/core";
import checkRoles from "utils/checkRoles";

type Props = {
  handleChange: any;
  formData: any;
};

const AuditTypeRulesForm = ({ handleChange, formData }: Props) => {
  const classes = useStyles();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const [isReadMode, setIsReadMode] = useState(false);

  useEffect(() => {
    const url = window.location.href;
    const isReadModeUrl = url.includes(
      "audit/auditsettings/auditTypeForm/readMode"
    );
    setIsReadMode(isReadModeUrl);
  }, []);

  return (
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
        <Grid container item sm={12} md={6} style={{ marginTop: "-20px" }}>
          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.label}>Maximum Sections :</span>
            </strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <TextField
              label="Enter No Of Sections"
              name="maxSections"
              disabled={!isOrgAdmin || isReadMode ? true : false}
              value={formData?.maxSections}
              onChange={(e) => {
                const value = e.target.value;
                if (Number(value) >= 0) {
                  handleChange(e);
                }
              }}
              fullWidth
              size="small"
              variant="outlined"
              className={classes.textField}
              type="number"
            />
          </Grid>

          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.label}>No Of SOP Questions :</span>
            </strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <TextField
              label="Enter No Of SOP Questions"
              name="noOfSopQuestions"
              disabled={!isOrgAdmin || isReadMode ? true : false}
              value={formData.noOfSopQuestions}
              onChange={(e) => {
                const value = e.target.value;
                if (Number(value) >= 0) {
                  handleChange(e);
                }
              }}
              fullWidth
              size="small"
              variant="outlined"
              className={classes.textField}
              type="number"
            />
          </Grid>

          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.label}>No Of Operation Questions :</span>
            </strong>
          </Grid>

          <Grid item sm={12} md={8} className={classes.formBox}>
            <TextField
              label="Enter No Of Operation Questions"
              name="noOfOperationQuestions"
              disabled={!isOrgAdmin || isReadMode ? true : false}
              value={formData.noOfOperationQuestions}
              onChange={(e) => {
                const value = e.target.value;
                if (Number(value) >= 0) {
                  handleChange(e);
                }
              }}
              fullWidth
              size="small"
              variant="outlined"
              className={classes.textField}
              type="number"
            />
          </Grid>
          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.label}>
                No Of Aspect Impact Questions :
              </span>
            </strong>
          </Grid>

          <Grid item sm={12} md={8} className={classes.formBox}>
            <TextField
              label="Enter No Of Aspect Impact Questions"
              name="noOfAspImpQuestions"
              disabled={!isOrgAdmin || isReadMode ? true : false}
              value={formData.noOfAspImpQuestions}
              onChange={(e) => {
                const value = e.target.value;
                if (Number(value) >= 0) {
                  handleChange(e);
                }
              }}
              fullWidth
              size="small"
              variant="outlined"
              className={classes.textField}
              type="number"
            />
          </Grid>
        </Grid>

        <Grid container item sm={12} md={6} style={{ marginTop: "-70px" }}>
          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.label}>Time Frame (Hrs) :</span>
            </strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <TextField
              label="Enter Time Frame In Hours"
              name="auditTimeFrame"
              disabled={!isOrgAdmin || isReadMode ? true : false}
              value={formData.auditTimeFrame}
              onChange={(e) => {
                const value = e.target.value;
                if (Number(value) >= 0) {
                  handleChange(e);
                }
              }}
              fullWidth
              size="small"
              variant="outlined"
              className={classes.textField}
              type="number"
            />
          </Grid>
          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.label}>No Of Findings Questions :</span>
            </strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <TextField
              label="Enter No Of Findings Questions"
              name="noOfFindingsQuestions"
              disabled={!isOrgAdmin || isReadMode ? true : false}
              value={formData.noOfFindingsQuestions}
              onChange={(e) => {
                const value = e.target.value;
                if (Number(value) >= 0) {
                  handleChange(e);
                }
              }}
              fullWidth
              size="small"
              variant="outlined"
              className={classes.textField}
              type="number"
            />
          </Grid>

          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>No Of HIRA Questions :</strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <TextField
              label="Enter No Of HIRA Questions"
              name="noOfHiraQuestions"
              disabled={!isOrgAdmin || isReadMode ? true : false}
              value={formData.noOfHiraQuestions}
              onChange={(e) => {
                const value = e.target.value;
                if (Number(value) >= 0) {
                  handleChange(e);
                }
              }}
              fullWidth
              size="small"
              variant="outlined"
              className={classes.textField}
              type="number"
            />
          </Grid>

          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong
              style={{
                fontSize: "25px",
              }}
            >
              Total Questions :{"   "}
              {Number(formData.noOfSopQuestions||0) +
                Number(formData.noOfFindingsQuestions||0) +
                Number(formData.noOfOperationQuestions||0) +
                Number(formData.noOfHiraQuestions||0) +
                Number(formData.noOfAspImpQuestions||0)}
            </strong>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

export default AuditTypeRulesForm;
