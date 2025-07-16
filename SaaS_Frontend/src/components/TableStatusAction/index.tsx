import React from "react";
import Typography from "@material-ui/core/Typography";
import { MdMoreVert } from 'react-icons/md';
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Popover from "@material-ui/core/Popover";
import {
  usePopupState,
  bindTrigger,
  bindPopover,
} from "material-ui-popup-state/hooks";
import useStyles from "./style";

interface Props {
  status: string;
  enableDelete?: boolean;
  handleEdit?: any;
  handleDelete?: any;
  handleActionPoint?: any;
  handleAcceptNc?: any;
  handleUpdateCorrectiveAction?: any;
  handleverify?: any;
  updateNc?: any;
  type?: string;
  showType?:any;
  access?:any;
}

/**
 * @method TableStatusAction
 * @description Function to display the popover option listing in the sort table which contains the edit and delete button
 * @returns a react functional component
 */
export default function TableStatusAction({
  status,
  enableDelete = true,
  handleEdit,
  handleDelete,
  handleAcceptNc,
  handleActionPoint,
  handleUpdateCorrectiveAction,
  handleverify,
  showType,
  updateNc,
  access,

  type,
}: Props) {
  const classes = useStyles();
  const popupState = usePopupState({
    variant: "popover",
    popupId: "demoPopover",
  });
  return (
    <div className={classes.root}>
      <Typography variant="body2" className={classes.tableCell}>
        {status}
      </Typography>
      <IconButton aria-label="more" {...bindTrigger(popupState)} size="small">
        <MdMoreVert />
      </IconButton>

      <Popover
        {...bindPopover(popupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div className={classes.popover}>
          {handleEdit && (
            <Button
              className={classes.popover__button}
              {...bindTrigger(popupState)}
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
          {updateNc && showType && access&& (
            <Button
              className={classes.popover__button}
              {...bindTrigger(popupState)}
              onClick={updateNc}
            >
              {`Update ${type}`}
            </Button>
          )}
          {handleActionPoint &&
            <Button
              className={classes.popover__button}
              {...bindTrigger(popupState)}
              onClick={handleActionPoint}
            >
              Create Action Plan
            </Button>
          }
          {/* {handleAcceptNc && (
            <Button
              className={classes.popover__button}
              {...bindTrigger(popupState)}
              onClick={handleAcceptNc}
            >
              Accept NC
            </Button>
          )}
          {handleUpdateCorrectiveAction && (
            <Button
              className={classes.popover__button}
              {...bindTrigger(popupState)}
              onClick={handleUpdateCorrectiveAction}
            >
              Update Corrective Action
            </Button>
          )}
          {handleverify && (
            <Button
              className={classes.popover__button}
              {...bindTrigger(popupState)}
              onClick={handleverify}
            >
              Verify
            </Button>
          )} */}

          {handleDelete && (
            <Button
              className={classes.popover__button}
              {...bindTrigger(popupState)}
              onClick={handleDelete}
              disabled={!enableDelete}
            >
              Delete
            </Button>
          )}
        </div>
      </Popover>
    </div>
  );
}
