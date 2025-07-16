import { Typography } from "@material-ui/core";
import { useStyles } from "./styles";

type Props = {
  dateFields: Function;
  searchValues: any;
};

const DatePicker = ({ dateFields, searchValues }: Props) => {
  const classes = useStyles();

  return (
    <div className={classes.containerField}>
      <input
        data-testid="start-date"
        type="date"
        name="documentStartDate"
        className={classes.dateField}
        placeholder="date"
        onChange={(e: any) => dateFields(e)}
        value={searchValues.documentStartDate}
      />
      <Typography variant="h6" className={classes.dateSpaceText}>
        TO
      </Typography>
      <input
        data-testid="end-date"
        type="date"
        name="documentEndDate"
        className={classes.dateField}
        placeholder="date"
        onChange={(e: any) => dateFields(e)}
        value={searchValues.documentEndDate}
      />
    </div>
  );
};

export default DatePicker;
