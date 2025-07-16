import {
  Grid,
  TextField,
} from "@material-ui/core";
import React from "react";
import useStyles from "./styles";
import { debounce } from "lodash";
import axios from "../../../apis/axios.global";
import getAppUrl from "../../../utils/getAppUrl";
import AutoCompleteNew from "../../AutoCompleteNew";

type Props = {
  formData: any;
  setFormData: any;
  disableFormFields: any;
};

let typeAheadValue: string;
let typeAheadType: string;

function WorkflowForm({ formData, setFormData, disableFormFields }: Props) {
  const [suggestions, setSuggestions] = React.useState([]);
  const classes = useStyles();
  const realmName = getAppUrl();

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getData = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `api/user/doctype/filterusers/${realmName}/${"all"}?email=${value}`
      );
      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const debouncedSearch = debounce(() => {
    getData(typeAheadValue, typeAheadType);
  }, 400);

  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };

  return (
    <form
      data-testid="technical-config-form"
      autoComplete="off"
      className={classes.form}
    >
      <Grid container>
        <Grid item sm={12} md={6}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Read List</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Login URL'
                name="readList"
                value={formData.readAccess}
                disabled
                inputProps={{
                  "data-testid": "login-url",
                }}
                variant="outlined"
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Reviewer List</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <AutoCompleteNew
                suggestionList={suggestions ? suggestions : []}
                name="Start typing for users.."
                keyName="reviewers"
                formData={formData}
                setFormData={setFormData}
                showAvatar={true}
                getSuggestionList={getSuggestionList}
                defaultValue={
                  formData.reviewers.length ? formData.reviewers : []
                }
                disabled={disableFormFields}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item sm={12} md={5}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Additional Readers</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <AutoCompleteNew
                suggestionList={suggestions ? suggestions : []}
                name="Start typing for users.."
                keyName="additionalReaders"
                formData={formData}
                showAvatar={true}
                setFormData={setFormData}
                getSuggestionList={getSuggestionList}
                defaultValue={
                  formData.additionalReaders.length
                    ? formData.additionalReaders
                    : []
                }
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Approver List</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <AutoCompleteNew
                suggestionList={suggestions ? suggestions : []}
                name="Start typing for users.."
                keyName="approvers"
                showAvatar={true}
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={getSuggestionList}
                defaultValue={
                  formData.approvers.length ? formData.approvers : []
                }
                disabled={disableFormFields}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}

export default WorkflowForm;
