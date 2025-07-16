import {
  FormControl,
  Grid,
  InputLabel,
  Select,
  TextField,
  MenuItem,
  Button,
} from "@material-ui/core";
import { debounce } from "lodash";
import React from "react";
import axios from "../../../apis/axios.global";
import getAppUrl from "../../../utils/getAppUrl";
import AutoComplete from "../../AutoComplete";
import CustomButton from "../../CustomButton";
import ViewDoc from "../../../assets/icons/ViewDoc.svg";
import useStyles from "./styles";
import CustomTable from "../../CustomTable";
import { MdDelete } from 'react-icons/md';
import { MdInsertDriveFile } from 'react-icons/md';
import { TYPE, tableHeaders, tableFields } from "./constants";
import { useSnackbar } from "notistack";
import { REDIRECT_URL } from "../../../config";

type Props = {
  formData?: any;
  setFormData?: any;
  disableFormFields: any;
};

let typeAheadValue: string;

function ReferenceDocs({ formData, setFormData, disableFormFields }: Props) {
  const classes = useStyles();
  const [suggestions, setSuggestions] = React.useState([]);
  const [data, setData] = React.useState<any>({
    type: "",
  });
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e: any) => {
    data.referenceDocuments = {
      ...data.referenceDocuments,
      type: e.target.value,
    };
    setFormData(formData);
    setData({ ...data, type: e.target.value });
  };

  const handleDocView = (data: any) => {
    window.open(
      `http://${realmName}.${REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${data.id}`,
      "_blank"
    );
  };

  const handleDelete = (data: any) => {
    const newFormData = formData.referenceDocuments.filter(
      (item: any) => item.id !== data.id
    );
    setFormData({
      ...formData,
      referenceDocuments: newFormData,
    });
  };

  const getData = async (value: any) => {
    try {
      const res = await axios.get(
        `api/documents/getDocumentsByName/${realmName}?documentName=${value}`
      );
      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const debouncedSearch = debounce(() => {
    getData(typeAheadValue);
  }, 400);

  const getSuggestionList = (value: any) => {
    typeAheadValue = value;
    debouncedSearch();
  };

  return (
    <Grid container>
      <Grid item xs={12} className={classes.form}>
        <form data-testid="org-admin-form" autoComplete="off">
          <Grid container>
            <Grid item sm={12} md={6}>
              <Grid container>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Document Name</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <AutoComplete
                    suggestionList={suggestions ? suggestions : []}
                    name="Reference Document"
                    keyName="referenceDocuments"
                    labelKey="documentName"
                    multiple={false}
                    formData={data}
                    setFormData={setData}
                    getSuggestionList={getSuggestionList}
                    defaultValue={[]}
                    disabled={disableFormFields}
                  />
                </Grid>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Target Link</strong>
                </Grid>
                {data?.referenceDocuments?.documentLink ? (
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <a
                      href={`http://${realmName}.${REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${data?.referenceDocuments?.id}`}
                      className={classes.previewFont}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={ViewDoc}
                        alt="Document"
                        style={{ marginRight: 10 }}
                      />
                      View Document
                    </a>
                  </Grid>
                ) : (
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    <div className={classes.previewFont2}>
                      {"Please select a Document first"}
                    </div>
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item xs={12} md={1}></Grid>
            <Grid item sm={12} md={5}>
              <Grid container>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Type</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                    disabled={!data.referenceDocuments}
                  >
                    <InputLabel>Type</InputLabel>
                    <Select
                      label="Type"
                      onChange={handleChange}
                      name="type"
                      value={data.type}
                      required
                    >
                      {TYPE.map((item: any, i: number) => {
                        return (
                          <MenuItem key={i} value={item}>
                            {item}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Version*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <TextField
                    fullWidth
                    name="currentVersion"
                    value={
                      data?.referenceDocuments?.currentVersion
                        ? data?.referenceDocuments?.currentVersion
                        : ""
                    }
                    variant="outlined"
                    placeholder="Select a Document first"
                    onChange={handleChange}
                    size="small"
                    required
                    disabled
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <div className={classes.buttonSection}>
            <Button
              className={classes.discardBtn}
              onClick={() => {
                setData({});
              }}
            >
              Discard
            </Button>
            <CustomButton
              text="Submit"
              handleClick={() => {
                if (data?.type === "") {
                  enqueueSnackbar(`Please select a type`, {
                    variant: "warning",
                  });
                } else {
                  setFormData({
                    ...formData,
                    referenceDocuments: [
                      ...formData.referenceDocuments,
                      data.referenceDocuments,
                    ],
                  });
                  setData({});
                }
              }}
            />
          </div>
        </form>
      </Grid>
      {formData?.referenceDocuments?.length ? (
        <Grid item xs={12} className={classes.form}>
          <CustomTable
            header={tableHeaders}
            data={formData.referenceDocuments}
            fields={tableFields}
            isAction={!disableFormFields}
            actions={[
              {
                label: "View Document",
                icon: <MdInsertDriveFile fontSize="small" />,
                handler: handleDocView,
              },
              {
                label: "Delete",
                icon: <MdDelete fontSize="small" />,
                handler: handleDelete,
              },
            ]}
          />
        </Grid>
      ) : null}
    </Grid>
  );
}

export default ReferenceDocs;
