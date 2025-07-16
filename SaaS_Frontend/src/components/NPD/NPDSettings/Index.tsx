import React from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import useStyles from "./style";
const NPDSettingsIndex = () => {
  const classes = useStyles();

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </div>
  );
};

export default NPDSettingsIndex;
