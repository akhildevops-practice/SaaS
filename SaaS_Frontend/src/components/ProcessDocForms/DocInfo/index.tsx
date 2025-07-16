import {
  FormControl,
  Grid,
  InputLabel,
  Select,
  TextField,
  MenuItem,
  Button,
  Typography,
} from "@material-ui/core";
import React from "react";
import useStyles from "./styles";
import AttachIcon from "../../../assets/icons/AttachIcon.svg";

type Props = {
  formData?: any;
  setFormData?: any;
  view?: boolean;
  disableFormFields?: any;
};

function DocInfo({
  formData,
  setFormData,
  view = false,
  disableFormFields = false,
}: Props) {
  const classes = useStyles();
  const [fileName, setFileName] = React.useState("");

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: any) => {
    setFormData({ ...formData, file: e.target.files[0] });
    setFileName(e.target.files[0].name);
  };
  console.log("formdata", formData);
  if (view) {
    return (
      <Grid container>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Document Name*</strong>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData.documentName}
            variant="outlined"
            disabled={true}
            size="small"
          />
        </Grid>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Document Type*</strong>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData?.docType}
            variant="outlined"
            disabled={true}
            size="small"
          />
        </Grid>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Reason for Creation/Amendment*</strong>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData.reasonOfCreation}
            variant="outlined"
            disabled={true}
            size="small"
          />
        </Grid>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Document Number*</strong>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData.documentNumbering}
            variant="outlined"
            disabled={true}
            size="small"
          />
        </Grid>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Version</strong>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData.currentVersion}
            variant="outlined"
            disabled={true}
            size="small"
          />
        </Grid>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Issue Number</strong>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData.issueNumber}
            variant="outlined"
            disabled={true}
            size="small"
          />
        </Grid>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Location</strong>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData?.locationDetails[0]?.locationName}
            variant="outlined"
            disabled={true}
            size="small"
          />
        </Grid>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Entity</strong>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData?.entityDetails[0]?.entityName}
            variant="outlined"
            disabled={true}
            size="small"
          />
        </Grid>
      </Grid>
    );
  }
  function downloadFile() {
    // Check if formData.documentLink exists
    if (formData.documentLink) {
      window.location.href = formData.documentLink;
    }
  }

  return (
    <form autoComplete="off" className={classes.form}>
      <Grid container>
        <Grid item sm={12} md={6}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Document Name*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Login URL'
                name="documentName"
                value={formData.documentName}
                inputProps={{
                  "data-testid": "login-url",
                }}
                variant="outlined"
                onChange={handleChange}
                size="small"
                disabled={disableFormFields}
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Reason for Creation/Amendment*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Login URL'
                name="reasonOfCreation"
                value={formData.reasonOfCreation}
                inputProps={{
                  "data-testid": "login-url",
                }}
                variant="outlined"
                onChange={handleChange}
                size="small"
                disabled={disableFormFields}
                multiline
              />
            </Grid>
            {(view || !disableFormFields) && (
              <>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Attach Document*</strong>
                  {formData.documentLink && (
                    <a
                      href={formData.documentLink ? formData.documentLink : "/"}
                      className={classes.previewFont}
                      target="_blank"
                      rel="noreferrer"
                      download={formData.documentLink}
                    >
                      Download
                    </a>
                  )}
                </Grid>
                <Grid item sm={12} md={6} className={classes.formBox}>
                  <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    startIcon={<img src={AttachIcon} alt="Attach" />}
                  >
                    {fileName || formData.documentLink
                      ? "Change Uploaded File"
                      : "Upload File"}
                    <input
                      data-testid="file-upload"
                      type="file"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                </Grid>
                <Grid item sm={12} md={4}></Grid>
                <Grid item sm={12} md={8}>
                  {fileName && (
                    <Typography variant="caption">{fileName}</Typography>
                  )}
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item sm={12} md={5}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Document Numbering*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Login URL'
                name="documentNumbering"
                value={formData.documentNumbering}
                inputProps={{
                  "data-testid": "login-url",
                }}
                variant="outlined"
                onChange={handleChange}
                size="small"
                disabled={
                  formData.doctype
                    ? formData.doctype.documentNumbering === "Serial"
                    : disableFormFields ||
                      formData.documentNumbering === "Serial"
                }
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Version*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <InputLabel>Version</InputLabel>
                <Select
                  label="Version"
                  value={formData.currentVersion}
                  onChange={handleChange}
                  name="currentVersion"
                  disabled={!(formData.currentVersion === "")}
                  required
                >
                  {[...new Array(25)]
                    .reduce(
                      (acc, val, index) => {
                        return [...acc, acc[index] + 1];
                      },
                      [65]
                    )
                    .map((item: number) => (
                      <MenuItem value={String.fromCharCode(item)}>
                        {String.fromCharCode(item)}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Document Description</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Login URL'
                name="description"
                value={formData.description}
                inputProps={{
                  "data-testid": "login-url",
                }}
                variant="outlined"
                onChange={handleChange}
                size="small"
                disabled={disableFormFields}
                multiline
                minRows={4}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}

export default DocInfo;
