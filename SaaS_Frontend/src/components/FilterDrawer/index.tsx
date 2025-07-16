import Drawer from "@material-ui/core/Drawer";
import { Button, IconButton, Typography } from "@material-ui/core";
import { MdArrowBackIos } from 'react-icons/md';
import useStyles from "./styles";

type Props = {
  children?: any;
  resultText: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleApply: any;
  handleDiscard: any;
};

/**
 * This the drawer that displays the filters.
 * The position of the Filter button is set as per the viewport
 */

function FilterDrawer({
  children,
  resultText,
  open,
  setOpen,
  handleApply,
  handleDiscard,
}: Props) {
  const classes = useStyles();

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleDrawerClose}>
      <div className={classes.list} role="presentation">
        <div className={classes.navTopArea}>
          <IconButton
            onClick={handleDrawerClose}
            data-testid="close-drawer-button"
          >
            <MdArrowBackIos color="secondary" fontSize="small" />
          </IconButton>
          <div className={classes.title}>
            <Typography variant="h6">Filter</Typography>
          </div>
        </div>
        <div className={classes.content}>
          {children}
          <div className={classes.resultTextStyle}>{resultText}</div>
          <div className={classes.btnSection}>
            <Button
              className={classes.discardBtn}
              data-testid="discard-button"
              onClick={() => {
                handleDiscard();
                handleDrawerClose();
              }}
            >
              Discard
            </Button>
            <Button
              className={classes.applyBtn}
              data-testid="apply-button"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default FilterDrawer;
