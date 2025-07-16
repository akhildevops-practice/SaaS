import MuiRating from "@material-ui/lab/Rating";
import { MdStarBorder } from 'react-icons/md';
import { MdStar } from 'react-icons/md';
import useStyles from "./styles";

interface Props {
  value: number;
  name: string;
  readOnly?: boolean;
  size?: "small" | "medium" | "large";
  onChange?: any;
}

/**
 * @method Rating
 * @description Functional component which generates a rating field
 * @returns a react functional component
 */
export default function Rating({
  value,
  name,
  readOnly = true,
  size = "small",
  onChange,
}: Props) {
  const classes = useStyles();

  return (
    <MuiRating
      name={name}
      value={value}
      onChange={onChange}
      size={size}
      readOnly={readOnly}
      emptyIcon={<MdStarBorder fontSize="inherit" />}
      icon={<MdStar className={classes.rating} fontSize="inherit" />}
    />
  );
}
