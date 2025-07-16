import React from "react";

import { Button, makeStyles } from "@material-ui/core";
// import IconButton from "@material-ui/core/IconButton";
import { ReactComponent as DeleteIcon } from "../../assets/documentControl/Delete.svg";
import { ReactComponent as EditIcon } from "../../assets/documentControl/Edit.svg";

type Props = {
  actions: string[];
};

const useStyles = makeStyles((theme) => ({
  actionButtons: {
    color: theme.palette.primary.main,
  },
  listItemText: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.main,
  },
}));

const iconSize = 24;
/**
 * This component controls the action buttons.
 *
 * @param actions
 * @returns Action Buttons
 */

export default function ActionButton({ actions = [] }: Props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const classes = useStyles();

  /**
   * @method handleClick
   * @description Function to set the anchor point for displaying the actions popover menu
   * @param event {any}
   * @returns nothing
   */
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * @method handleClose
   * @description Function to remove the anchor point in order to hide the popover menu
   * @returns nothing
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * @method handleAction
   * @description Function to handle popover menu item clicks
   * @param handler {any}
   * @returns nothing
   */
  const handleAction = (handler: any) => () => {
    handleClose();
    handler();
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      {/* <Tooltip title="Actions">
        <IconButton
          data-testid="action-popper"
          onClick={handleClick}
          disabled={actions.length <= 0}
        >
          <MdMoreVert />
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      > */}
      <>
        {actions.map((item: any, i: number) => (
          // <ListItem
          //   button
          //   key={i}
          //   style={{ minWidth: 250 }}
          //   data-testid="action-item"
          //   onClick={handleAction(item.handler)}
          // >
          //   <ListItemIcon className={classes.actionButtons}>
          //     {item.icon}
          //   </ListItemIcon>
          //   <ListItemText
          //     primary={item.label}
          //     classes={{ primary: classes.listItemText }}
          //   />
          // </ListItem>
          <Button
            key={i}
            style={{ minWidth: 20 }}
            data-testid="action-item"
            onClick={handleAction(item.handler)}
          >
            {item.label === "Delete" ? (
              <DeleteIcon width={iconSize} height={iconSize} />
            ) : (
              <EditIcon width={iconSize} height={iconSize} />
            )}
          </Button>
        ))}
      </>
      {/* </Popover> */}
    </div>
  );
}
