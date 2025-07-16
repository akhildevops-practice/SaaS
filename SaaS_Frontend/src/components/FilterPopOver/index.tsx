import {
  Button,
  IconButton,
  Popover,
} from "@material-ui/core";
import useStyles from "./styles";
import CloseIconImageSvg from "../../assets/documentControl/Close.svg";

type Props = {
  children?: any;
  resultText: string;
  anchorEl?: null | HTMLElement;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleApply: any;
  handleDiscard: any;
  searchValues: any;
  matches?: any;
  // refElementForAllDocument5?:any;
};

/**
 * This the popOver that displays the filters.
 * The position of the Filter button is set as per the viewport
 */

function FilterPopOver({
  children,
  resultText,
  anchorEl,
  open,
  setOpen,
  handleApply,
  handleDiscard,
  searchValues,
  matches,
}: // refElementForAllDocument5
Props) {
  const classes = useStyles({ matches: matches });

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const handleMouseEnter = () => {
    //setIsHovered(true);
  };

  const handleMouseLeave = () => {
    //setIsHovered(false);
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleDrawerClose}
        anchorOrigin={{
          vertical: 350,
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        PaperProps={{ className: classes.paperStyle }}
      >
        <div
        // onMouseEnter={handleMouseEnter}
        // onMouseLeave={handleMouseLeave}
        // ref={ refElementForAllDocument5}
        >
          <div role="presentation">
            <div className={classes.navTopArea}>
              <IconButton
                onClick={handleDrawerClose}
                data-testid="close-drawer-button"
              >
                {/* <FilterCloseIcon className={classes.arrowbtn} fontSize="small" /> */}
                <img
                  src={CloseIconImageSvg}
                  alt="close-drawer"
                  style={{ width: "36px", height: "38px", cursor: "pointer" }}
                />
              </IconButton>
              <div className={classes.topFilterCount}>
                <div className={classes.title}>
                  <div>Filter By</div>
                </div>
                {/* <div className={classes.resultTextStyle}>{resultText}</div> */}
              </div>
            </div>
            <div className={classes.content}>
              {children}
              <div className={classes.btnSection}>
                {/* <Tooltip title={"Reload"}>
              <IconButton
                data-testid="reset-button"
                onClick={() => {
                  handleDiscard();
                }}
              >
                <img src={ReloadIcon} alt="reload" width={18} />
              </IconButton>
            </Tooltip> */}
                {/* <Button
              className={classes.filterBtn}
              data-testid="discard-button"
              onClick={() => {
                handleDiscard();
                handleDrawerClose();
              }}
            >
              Discard
            </Button> */}

                <Button
                  className={classes.filterBtn}
                  data-testid="apply-button"
                  onClick={handleApply}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Popover>
      {/* {isHovered && (
        <div>
         
          Applied Filters:
          <ul>
            <li>Location: {searchValues.location?.locationName || "None"}</li>
            <li>System Name: {searchValues.system?.name || "None"}</li>
           
          </ul>
        </div>
      )} */}
    </>
  );
}

export default FilterPopOver;
