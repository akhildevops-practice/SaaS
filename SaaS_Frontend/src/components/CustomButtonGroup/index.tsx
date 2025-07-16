import React, { useEffect } from "react";
import { MdArrowDropDown } from 'react-icons/md';
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import { Button, ButtonGroup, Paper } from "@material-ui/core";
import useStyles from "./styles";

type Props = {
  options: any;
  handleSubmit: any;
  disableBtnFor: string[];
  style?: any;
  disable?: boolean;
};

function CustomButtonGroup({
  options: menuOptions = [],
  handleSubmit,
  disableBtnFor,
  style,
  disable,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const classes = useStyles();

  useEffect(() => {
    console.log("menUotadjsf", options);
  }, []);

  const [defaultOption, ...options] = menuOptions;
  const handleClick = () => {
    console.log("outer button clicked", menuOptions[0]);

    handleSubmit(menuOptions[0]);
  };

  /**
   * @method handleMenuItemClick
   * @description Function which is invoked when a particular menu item is clicked
   * @param event {any}
   * @param index {number}
   * @returns nothing
   */
  const handleMenuItemClick = (event: any, index: number) => {
    console.log("menu item clicked", options[index]);

    handleSubmit(options[index]);
  };

  /**
   * @method handleToggle
   * @description Function to open custom button groupr popper menu
   * @returns nothing
   */
  const handleToggle = () => {
    console.log("toggled");

    setOpen((prevOpen) => !prevOpen);
  };

  /**
   * @method handleClose
   * @description Function to close the popper menu
   * @returns nothing
   */
  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const containsDisableValue = disable
    ? true
    : menuOptions.every((element: any) => {
        return disableBtnFor.indexOf(element) !== -1;
      });

  console.log("in old view, contadf", containsDisableValue);

  return (
    <>
      {menuOptions.length > 0 && (
        <>
          <ButtonGroup
            variant="contained"
            ref={anchorRef}
            className={classes.btnGrp}
            disabled={containsDisableValue}
            style={style}
          >
            <Button onClick={handleClick} className={classes.btn}>
              {defaultOption}
            </Button>
            {options.length > 0 && (
              <Button
                className={classes.btnGrpColors}
                size="small"
                onClick={handleToggle}
                data-testid="button-group-dropdown"
              >
                <MdArrowDropDown />
              </Button>
            )}
          </ButtonGroup>
          {options.length > 0 && (
            <Popper
              open={open}
              anchorEl={anchorRef.current}
              transition
              style={{ zIndex: 9999 }}
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === "bottom" ? "center top" : "center bottom",
                  }}
                >
                  <Paper style={{ width: 190 }}>
                    <ClickAwayListener onClickAway={handleClose}>
                      <MenuList>
                        {options.map((option: any, index: any) => (
                          <MenuItem
                            key={index}
                            disabled={disableBtnFor.includes(option)}
                            onClick={(event) =>
                              handleMenuItemClick(event, index)
                            }
                          >
                            {option}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          )}
        </>
      )}
    </>
  );
}

export default CustomButtonGroup;
