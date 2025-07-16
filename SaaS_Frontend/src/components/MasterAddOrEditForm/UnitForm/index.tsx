import { Grid, TextField, Chip } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import useStyles from "./styles";
import { validateMasterNames } from "utils/validateInput";
import { useSnackbar } from "notistack";

type Props = {
  unitForm: {
    id: string;
    unitType: string;
    units: string[];
  };
  setUnitForm: React.Dispatch<React.SetStateAction<any>>;
};

function UnitForm({ unitForm, setUnitForm }: Props) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const capitalise = (str: string) => {
    if (str.length > 0) return str[0].toUpperCase() + str.substring(1);
    return str;
  };

  const handleChange = (e: any) => {
    // console.log("e", e.target.name);
    if (e.target.name === "unitType") {
      validateMasterNames(null, e.target.value, (error?: string) => {
        if (error) {
          enqueueSnackbar(`${error}`, { variant: "error" });
          return;
        } else {
          setUnitForm((prev: any) => ({
            ...prev,
            [e.target.name]: e.target.value,
          }));
        }
      });
    }

    setUnitForm((prev: any) => ({
      ...prev,
      unitType: capitalise(prev.unitType),
    }));
  };
  console.log("record from recyclebin", unitForm);
  return (
    <form
      data-testid="technical-config-form"
      autoComplete="off"
      className={classes.form}
    >
      <Grid container>
        <Grid item xs={4} md={2} className={classes.formTextPadding}>
          <strong>Unit Type *</strong>
        </Grid>
        <Grid item xs={8} md={4} className={classes.formBox}>
          <TextField
            fullWidth
            name="unitType"
            value={unitForm.unitType}
            variant="outlined"
            onChange={handleChange}
            size="small"
            required
          />
        </Grid>

        <Grid item xs={4} md={2} className={classes.formTextPadding}>
          <strong>Units *</strong>
        </Grid>
        <Grid item xs={8} md={4} className={classes.formBox}>
          <Autocomplete
            multiple
            options={[]}
            value={unitForm.units}
            defaultValue={unitForm.units ?? []}
            freeSolo
            size="small"
            onChange={(e, value: any) =>
              setUnitForm({ ...unitForm, units: value })
            }
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
                placeholder="Add a unit by pressing enter"
              />
            )}
          />
        </Grid>
      </Grid>
    </form>
  );
}

export default UnitForm;
