import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import { MdExpandMore } from 'react-icons/md';
import { MdExpandLess } from 'react-icons/md';
import { makeStyles } from "@material-ui/core/styles";
import NavLink from "../Navlinks";
type Props = {
  data: any;
  title: string;
  icon: any;
  childIcons: any;
  handleDrawerClose: () => void;
};

const useStyles = makeStyles((theme) => ({
  subListContent: {
    backgroundColor: theme.palette.primary.main,
  },
  listItemTextSize: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.textColor.white,
  },
  icon: {
    fontSize: theme.typography.pxToRem(10),
    marginLeft: theme.typography.pxToRem(3),
    minWidth: theme.typography.pxToRem(37),
  },
}));

/**
 * This components displays the expanding Navigation i.e. the Sub Navigation links for Mobile View
 *
 */

function ExpandingSubListMobile({
  data,
  title,
  icon,
  childIcons,
  handleDrawerClose,
}: Props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  /**
   * @method handleClick
   * @description Function to show/hide or hide menu sections
   * @returns nothing
   */
  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem
        data-testid="expanding-sub-list-mobile-item"
        button
        onClick={handleClick}
        style={{ height: 48 }}
      >
        <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
        <ListItemText
          classes={{ primary: classes.listItemTextSize }}
          primary={title}
        />
        {open ? (
          <MdExpandLess color="secondary" />
        ) : (
          <MdExpandMore color="secondary" />
        )}
      </ListItem>
      <Collapse
        className={classes.subListContent}
        in={open}
        timeout="auto"
        unmountOnExit
      >
        {data.map((val: any) => (
          <NavLink
            text={val}
            icon={childIcons[val]}
            key={val}
            sub={true}
            mobile={true}
            handleDrawerClose={handleDrawerClose}
            subParent={title}
          />
        ))}
      </Collapse>
    </>
  );
}

export default ExpandingSubListMobile;
