import { Button, Tabs } from "antd";
import type { TabsProps } from "antd";
import Settings from "../Settings";
import NotificationAndEsculation from "../NotificationAndEsculation";
import styles from "./styles";
import { useNavigate } from "react-router-dom";
import WorkFlow from "../WorkFlow";

const SettingsTab = () => {
  const classes = styles();
  const navigate = useNavigate();

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Origin",
      children: <Settings />,
    },
    { key: "3", label: "WorkFlow", children: <WorkFlow /> },
    {
      key: "2",
      label: "Notification",
      children: <NotificationAndEsculation />,
    },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div className={classes.tabContainer} style={{ width: "100%" }}>
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          className={classes.tabsWrapper}
        />
      </div>
      <Button
        onClick={() => {
          navigate("/cara");
        }}
        style={{
          backgroundColor: "#0E497A",
          color: "#ffffff",
          position: "relative",
          top: 20,
          right: 30,
        }}
      >
        Back
      </Button>
    </div>
  );
};

export default SettingsTab;
