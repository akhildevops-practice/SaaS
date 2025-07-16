import { Button, Tabs } from "antd";
import type { TabsProps } from "antd";

import { useNavigate } from "react-router-dom";
import styles from "./styles";
import Settings from "../Settings";
import RCA from "../RCA";
import DefectSettings from "../DefectSettings";
import { FaBug, FaCogs, FaListUl } from "react-icons/fa";

const SettingsMainPage = () => {
  const classes = styles();
  const navigate = useNavigate();

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span  className={classes.TabCaontainer}>
          <FaCogs style={{fontSize:"22px" }} />
          Origin
        </span>
      ),
      children: <Settings />,
    },
    {
      key: "2",
      label: (
        <span  className={classes.TabCaontainer}>
          <FaBug  style={{fontSize:"18px" }} />
          RCA
        </span>
      ),
      children: <RCA />,
    },
    {
      key: "3",
      label: (
        <span  className={classes.TabCaontainer}>
          <FaListUl  style={{fontSize:"18px" }} />
          Defect Types
        </span>
      ),
      children: <DefectSettings />,
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

export default SettingsMainPage;
