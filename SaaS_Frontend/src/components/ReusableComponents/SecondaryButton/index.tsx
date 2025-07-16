import React from "react";
import { Button, ButtonProps } from "antd";

type Props = {
  buttonText?: string;
  style?: React.CSSProperties;
} & ButtonProps;

const SecondaryButton = ({
  buttonText = "Cancel",
  icon,
  style,
  ...rest
}: Props) => {
  const defaultStyles: any = {
    // width: 77,
    // height: 34,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: "4px 16px",
    borderRadius: 6,
    boxShadow: "0 2px 0 0 rgba(0, 0, 0, 0.02)",
    border: "2px solid #003059",
    backgroundColor: "#fff",
    color: "#003059",
  };

  return (
    <Button icon={icon} style={{ ...defaultStyles, ...style }} {...rest}>
      {buttonText}
    </Button>
  );
};

export default SecondaryButton;
