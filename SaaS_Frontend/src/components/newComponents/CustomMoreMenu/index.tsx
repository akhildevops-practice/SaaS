import { useState } from "react";
import { IconButton, Menu, MenuItem, Typography } from "@material-ui/core";
import { MdMoreVert } from 'react-icons/md';

type Props = {
  options: {
    label: string;
    handleClick: () => void;
    icon?: JSX.Element;
    ref? : any;
  }[];
  anchorOrigin?: {
    vertical: number | "center" | "top" | "bottom";
    horizontal: number | "center" | "left" | "right";
  };
  transformOrigin?: {
    vertical: number | "center" | "top" | "bottom";
    horizontal: number | "center" | "left" | "right";
  };
  disabled?: boolean;
};

function CustomMoreMenu({
  options,
  anchorOrigin,
  transformOrigin,
  disabled = false,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick} disabled={disabled}>
        <MdMoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        {options.map((option) => (
          <MenuItem
            key={option.label}
            onClick={() => {
              option.handleClick();
              handleClose();
            }}
            ref={option?.ref || null}
          >
            {option.icon}
            <Typography
              component="p"
              style={{ marginLeft: option.icon ? 13 : 0, fontSize: "0.9rem" }}
            >
              {option.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default CustomMoreMenu;
