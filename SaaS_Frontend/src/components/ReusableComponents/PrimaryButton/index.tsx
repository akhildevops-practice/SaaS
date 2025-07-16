import React from "react";
import { Button, ButtonProps } from "antd";

type Props = {
  onClick?: () => void;
  buttonText?: string;
  icon?: React.ReactNode;
  type?: "primary" | "default";
  size?: "small" | "middle" | "large";
  style?: React.CSSProperties;
} & ButtonProps;

const PrimaryButton = ({
  onClick,
  buttonText = "Save Configuration",
  icon,
  type = "primary",
  style,
  ...rest
}: Props) => {
  const defaultPrimaryStyles: any = {
    backgroundColor: "rgb(0, 48, 89)",
    borderColor: "rgb(29, 30, 31)",
  };

  return (
    <Button
      type={type}
      icon={icon}
      onClick={onClick}
      style={{ ...defaultPrimaryStyles, ...style }}
      {...rest}
    >
      {buttonText}
    </Button>
  );
};

export default PrimaryButton;
