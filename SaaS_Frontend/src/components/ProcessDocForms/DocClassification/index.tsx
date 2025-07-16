import {
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import { Autocomplete } from "@material-ui/lab";

type Props = {
  formData?: any;
  setFormData?: any;
  view?: boolean;
  edit: any;
};
// interface ISystems {
//   applicable_systems: string;
// }
function DocClassification({
  formData,
  setFormData,
  view = false,
  edit,
}: Props) {
  const classes = useStyles();
  const [docsValue, setDocsValue] = useState({
    docsClassification: "",
    doctypeId: "",
  });
  const [systems, setSystems] = React.useState([]);
  const [docId, setDocId] = useState("");

  const handleChange = async (e: any) => {
    setFormData &&
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    if (e.target.name === "doctypeName") {
      formData?.docTypes.map((value: any) => {
        if (value.documentTypeName === e.target.value) {
          console.log("testted", value);
          setSystems(value.applicable_systems);
        }
      });
    }

    if (e.target.name === "systems") {
    }
  };
  useEffect(() => {
    const GetSystems = async () => {
      try {
        setFormData && setFormData({ ...formData, systems: "", docsClassification: "" });
        setSystems([]);
        formData?.docTypes?.map((value: any) => {
          if (value.documentTypeName === formData.doctypeName) {
            console.log("testted", value);
            setSystems(value.applicable_systems);
          }
        });
      } catch (err) {
        console.log("Error:", err);
      }
    };
    GetSystems();
  }, [formData.doctypeName]);

  // console.log("formData", formData);
  useEffect(() => {
    // console.log("systems is updated");
    formData?.docTypes?.map((value1: any) => {
      if (value1.documentTypeName === formData.doctypeName) {
        for (const appSystems of value1.applicable_systems) {
          if (appSystems.id === formData.systems) {
            setFormData({
              ...formData,
              docsClassification: value1.document_classification,
              doctypeId: value1.id,
            });
          }
        }
      }
    });
  }, [formData.systems]);

  if (view) {
    return (
      <Grid container>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Location Name</strong>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData.locationName}
            variant="outlined"
            disabled
            size="small"
          />
        </Grid>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Document Type* </strong>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData.docType}
            variant="outlined"
            disabled
            size="small"
          />
        </Grid>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Entity</strong>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData.entityName}
            variant="outlined"
            disabled
            size="small"
          />
        </Grid>
        <Grid item xs={12} className={classes.formTextPadding}>
          <strong>Document Tags*</strong>
        </Grid>
        <Grid item xs={12}>
          <Grid item sm={12} className={classes.formBox}>
            <Autocomplete
              disabled
              multiple
              options={[]}
              defaultValue={formData.tags ? formData.tags : []}
              freeSolo
              size="small"
              renderTags={(
                value: any[],
                getTagProps: (arg0: { index: any }) => JSX.IntrinsicAttributes
              ) =>
                value.map((option: any, index: any) => {
                  return (
                    <Chip
                      key={index}
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  );
                })
              }
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Document Tags"
                  placeholder="Add a tag by pressing enter after typing"
                />
              )}
            />
          </Grid>
        </Grid>
      </Grid>
    );
  }

  return (
    <>
      <form autoComplete="off" className={classes.form}>
        <Grid container>
          <Grid item sm={12} md={6}>
            <Grid container>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Location Name</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  // label='First Name'
                  name="locationName"
                  value={formData.locationName}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  required
                  inputProps={{
                    "data-testid": "first-name",
                  }}
                  disabled
                />
              </Grid>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Document Type</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                {edit ? (
                  <TextField
                    value={formData.doctypeName}
                    disabled
                    size="small"
                    variant="outlined"
                    fullWidth
                  />
                ) : (
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <InputLabel>DocType</InputLabel>
                    <Select
                      label="Document Type"
                      value={formData.doctypeName}
                      onChange={handleChange}
                      name="doctypeName"
                      required
                    >
                      {formData?.docTypes?.map((item: any) => {
                        return (
                          <MenuItem value={item.documentTypeName}>
                            {item.documentTypeName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Systems</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                >
                  <InputLabel>System</InputLabel>
                  <Select
                    label="System"
                    required
                    data-testid="document-numbering"
                    name="systems"
                    value={formData.systems ? formData.systems : ""}
                    onChange={handleChange}
                  >
                    {systems.map((item: any, i: number) => {
                      return (
                        <MenuItem
                          key={i}
                          data-testid={`numbering-${i}`}
                          value={item.id}
                          onClick={() => console.log("menu item is clicked")}
                        >
                          {item.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={1}></Grid>
          <Grid item sm={12} md={5}>
            <Grid container>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Entity</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  // label='Last Name'
                  name="entityName"
                  value={formData.entityName}
                  variant="outlined"
                  onChange={handleChange}
                  inputProps={{
                    "data-testid": "last-name",
                  }}
                  size="small"
                  required
                  disabled
                />
              </Grid>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Document Tags*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <Autocomplete
                  multiple
                  options={[]}
                  defaultValue={formData.tags ? formData.tags : []}
                  freeSolo
                  size="small"
                  onChange={(e, value: any) =>
                    setFormData({ ...formData, tags: value })
                  }
                  renderTags={(
                    value: any[],
                    getTagProps: (arg0: {
                      index: any;
                    }) => JSX.IntrinsicAttributes
                  ) =>
                    value.map((option: any, index: any) => {
                      return (
                        <Chip
                          key={index}
                          size="small"
                          color="primary"
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                        />
                      );
                    })
                  }
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Document Tags"
                      placeholder="Add a tag by pressing enter after typing"
                    />
                  )}
                />
              </Grid>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Document Classification</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  // label='First Name'
                  name="docsClassification"
                  value={
                    formData.docsClassification
                      ? formData.docsClassification
                      : ""
                  }
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  required
                  inputProps={{
                    "data-testid": "first-name",
                  }}
                  disabled
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default DocClassification;
