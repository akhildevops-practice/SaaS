import { Button } from "@material-ui/core";
import React from "react";
import useStyles from "./styles";

type Props = {
  handleClick?: any;
  text: string;
  disabled?: boolean;
  style?: any;
};

/**
 * This Custom Button Component
 *
 * @param handleClick To handle the button click event
 * @param text The text to display inside the button
 * @param disabled To handle the button disabled states
 *
 * @returns A button with custom styling
 */

function CustomButton({ handleClick, text, disabled = false, style }: Props) {
  const classes = useStyles();
  return (
    <Button
      className={classes.buttonColor}
      disabled={disabled}
      data-testid="custom-button"
      style={style}
      onClick={() => {
        handleClick();
      }}
    >
      {text}
    </Button>
  );
}

export default CustomButton;
