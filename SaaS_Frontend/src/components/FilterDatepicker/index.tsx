import { Grid, Typography } from "@material-ui/core";
import { useStyles } from "./styles";

type Props = {
  dateFields: Function;
  searchValues: any;
};

const FilterDatepicker = ({ dateFields, searchValues }: Props) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} style={{ padding: "0px 5px 0px 5px" }}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" className={classes.dateSpaceText}>
          From
        </Typography>
        <input
          className={classes.dateInput}
          data-testid="start-date"
          type="date"
          name="documentStartDate"
          placeholder="date"
          onChange={(e: any) => dateFields(e)}
          value={searchValues.documentStartDate}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" className={classes.dateSpaceText}>
          To
        </Typography>
        <input
          className={classes.dateInput}
          data-testid="end-date"
          type="date"
          name="documentEndDate"
          placeholder="date"
          onChange={(e: any) => dateFields(e)}
          value={searchValues.documentEndDate}
        />
      </Grid>
    </Grid>
  );
};

export default FilterDatepicker;
