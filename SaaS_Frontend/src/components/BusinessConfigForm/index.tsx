import {
  Grid,
  FormControl,
  MenuItem,
  Select,
} from "@material-ui/core";
import { useState } from "react";
import useStyles from "./styles";
import { useRecoilState } from "recoil";
import { orgFormData } from "../../recoil/atom";
import DynamicFormFields from "../DynamicFormFields";

type Props = {
  isEdit: any;
};

/**
 * The whole UI structure of the Business Configuration Form
 *
 * @param deleteField This function is for deleting the textfields
 * @returns The business config form
 */

function BusinessConfigForm({ isEdit }: Props) {
  const [formData, setFormData] = useRecoilState(orgFormData);
  const classes = useStyles();
  const handleChange = (e: any) => {
    //
    const itemKey = e.currentTarget.getAttribute("data-key");
    console.log(itemKey);
    const item = financialYear.find((val) => val.id === Number(itemKey));
    console.log("item", item);
    if (e.target.name === "fiscalYearQuarters") {
      setFormData({
        ...formData,
        fiscalYearQuarters: e.target.value,
      });
    }
    if (e.target.name === "auditYear") {
      setFormData({
        ...formData,
        auditYear: e.target.value,
        fiscalYearFormat: item?.label,
      });
    }

    if (e.target.name === "fiscalYearFormat") {
      setFormData({
        ...formData,
        fiscalYearFormat: e.target.value,
      });
    }
  };
  const currentYear = new Date().getFullYear();
  const financialYear = [
    { id: 0, label: "YYYY", value: currentYear.toString() },
    {
      id: 1,
      label: "YY-YY+1",
      value: `${currentYear.toString().slice(-2)}-${(currentYear + 1)
        .toString()
        .slice(-2)}`,
    },
    {
      id: 2,
      label: "YYYY-YY+1",
      value: `${currentYear.toString()}-${(currentYear + 1)
        .toString()
        .slice(-2)}`,
    },
    {
      id: 3,
      label: "YY+1",
      value: `${(currentYear + 1).toString().slice(-2)}`,
    },
  ];

  const [options, setOptions] = useState<any>([]);

  return (
    <form autoComplete="off" className={classes.form}>
      <Grid container>
        <Grid item xs={5} style={{ marginLeft: "15%" }}>
          {/* <Grid container> */}
          <div>
            <Grid item sm={12} md={12} className={classes.formTextPadding}>
              <strong>Fiscal Year Period</strong>
            </Grid>
            <Grid item sm={6} md={12} className={classes.formBox}>
              <FormControl variant="outlined" className={classes.formSelect}>
                {/* <InputLabel>Fiscal Year Period</InputLabel> */}
                <Select
                  // label="Fiscal Year Period"
                  value={formData.fiscalYearQuarters}
                  onChange={handleChange}
                  name="fiscalYearQuarters"
                  data-testid="fiscal-year-quarters-parent"
                  required
                  style={{ height: "50px", marginRight: "-12px" }}
                >
                  <MenuItem
                    data-testid="fiscal-year-quarters-child"
                    value="Jan - Dec"
                  >
                    Jan - Dec
                  </MenuItem>
                  <MenuItem value="April - Mar">April - Mar</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item sm={12} md={12} className={classes.formTextPadding}>
              <strong>System Type</strong>
            </Grid>
            <Grid item xs={6} md={10}>
              <DynamicFormFields
                data={formData}
                setData={setFormData}
                name="systemType"
                keyName="name"
                colorPalette={true}
              />
            </Grid>
          </div>
        </Grid>
        <Grid item xs={5}>
          <div>
            <Grid item sm={12} md={12} className={classes.formTextPadding}>
              <strong>Fiscal Year Format</strong>
            </Grid>
            <Grid item sm={6} md={12} className={classes.formBox}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100% ",
                }}
              >
                <FormControl variant="outlined" className={classes.formSelect}>
                  {/* <InputLabel>Fiscal Year Format</InputLabel> */}
                  <Select
                    // label="Fiscal Year Format"
                    value={formData.auditYear}
                    onChange={(event: any) => {
                      handleChange(event);
                      // setYear(event.target.value);
                    }}
                    name="auditYear"
                    data-testid="auditing-year-parent"
                    required
                    style={{ height: "50px", marginRight: "-12px" }}
                  >
                    {financialYear.map((item: any) => (
                      <MenuItem
                        data-key={item.id}
                        key={item.id}
                        data-testid="auditing-year-child"
                        value={item.value}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <div style={{ marginLeft: "20px", marginTop: "5px" }}>
                  {formData.auditYear ? `(${formData.auditYear})` : ""}
                </div>
              </div>
            </Grid>

            <Grid item sm={12} md={12} className={classes.formTextPadding}>
              <strong>Entity Type</strong>
            </Grid>
            <Grid item xs={6} md={10}>
              <DynamicFormFields
                data={formData}
                setData={setFormData}
                name="entityType"
                keyName="name"
                fixedValue="Department"
                isEdit={isEdit}
                check={true}
              />
            </Grid>

            {/* <Grid item sm={12} md={12} className={classes.formTextPadding}>
              <strong>Sections</strong>
            </Grid>
            <Grid item xs={6} md={12}>
              <DynamicFormFields
                data={formData}
                setData={setFormData}
                name="section"
                keyName="name"
              />
            </Grid> */}
          </div>
        </Grid>
      </Grid>
      {/* </Grid> */}
    </form>
  );
}

export default BusinessConfigForm;
