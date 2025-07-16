import { createContext, useContext, useCallback, useMemo } from "react";
import { makeStyles } from "@material-ui/styles";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import MenuItem from "@material-ui/core/MenuItem";
import { MdChevronRight } from 'react-icons/md';
import { MdAdd } from 'react-icons/md';
import { Fab, Tooltip } from "@material-ui/core";
import {
  usePopupState,
  bindHover,
  bindFocus,
  bindMenu,
  bindTrigger,
} from "material-ui-popup-state/hooks";
import useStyles from "./styles";

const useCascadingMenuStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
  width: {
    minWidth: "150px",
  },
}));

const CascadingContext = createContext({
  parentPopupState: null,
  rootPopupState: null,
});

function CascadingMenuItem({ onClick, ...props }: any) {
  const classes = useStyles();
  const { rootPopupState }: any = useContext(CascadingContext);
  if (!rootPopupState) throw new Error("must be used inside a CascadingMenu");
  const handleClick = useCallback(
    (event:any) => {
      rootPopupState.close(event);
      if (onClick) onClick(event);
    },
    [rootPopupState, onClick]
  );

  return <MenuItem {...props} onClick={handleClick} className={classes.menu} />;
}

/**
 * @method CascadingSubmenu
 * @description Function to display secondary menu items
 * @param title
 * @param popupId
 * @param props
 * @returns
 */
function CascadingSubmenu({ title, popupId, ...props }: any) {
  const classes = useCascadingMenuStyles();
  const { parentPopupState } = useContext(CascadingContext);
  const popupState = usePopupState({
    popupId,
    variant: "popover",
    parentPopupState,
  });
  return (
    <>
      <MenuItem
        {...bindHover(popupState)}
        {...bindFocus(popupState)}
        className={classes.width}
      >
        <span className={classes.title}>{title}</span>
        <MdChevronRight />
      </MenuItem>
      <CascadingMenu
        {...props}
        classes={{ ...props.classes }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        popupState={popupState}
      />
    </>
  );
}

function CascadingMenu({ popupState, ...props }: any) {
  const { rootPopupState } = useContext(CascadingContext);
  const context = useMemo(
    () => ({
      rootPopupState: rootPopupState || popupState,
      parentPopupState: popupState,
    }),
    [rootPopupState, popupState]
  );

  return (
    <CascadingContext.Provider value={context}>
      <HoverMenu {...props} {...bindMenu(popupState)} />
    </CascadingContext.Provider>
  );
}

function RecursiveList({ items, onClick }: any) {
  return (
    <>
      {items.map((item: any) =>
        item.submenu ? (
          <CascadingSubmenu popupId={item.title} title={item.title}>
            <RecursiveList items={item.submenu} onClick={onClick} />
          </CascadingSubmenu>
        ) : (
          <CascadingMenuItem
            onClick={() => onClick?.(item.title, item.id, item.subId)}
          >
            {item.title}
          </CascadingMenuItem>
        )
      )}
    </>
  );
}

const HoverMenus = ({ data, title, onClick, disabled }: any) => {
  const classes = useStyles();
  const popupState = usePopupState({
    popupId: "demoMenu",
    variant: "popover",
  });

  return (
    <>
      <Tooltip title={title}>
        <Fab
          size="medium"
          disabled={!data?.length || disabled}
          className={classes.fabButton}
          {...bindHover(popupState)}
          {...bindTrigger(popupState)}
        >
          <MdAdd />
        </Fab>
      </Tooltip>
      <CascadingMenu
        popupState={popupState}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <RecursiveList
          items={data}
          onClick={onClick}
          style={{ width: "100px" }}
        />
      </CascadingMenu>
    </>
  );
};

export default HoverMenus;
