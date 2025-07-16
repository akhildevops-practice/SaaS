import { useState } from "react";
import { DatePicker, Tabs } from "antd";
import useStyles from "./styles";
import UserWithCountTab from "components/UserStats/UsersWithCountTab";
import TransactionsTab from "components/UserStats/TransactionsTab";
import InformationTable from "pages/InformationTable";
import checkRoles from "utils/checkRoles";
const { RangePicker } = DatePicker;
const UserStats = () => {
  //key for tabs
  const [activeKey, setActiveKey] = useState<any>("3");

  const classes = useStyles();
  const isMCOE = checkRoles("ORG-ADMIN");

  const onTabChange = (key: any) => {
    setActiveKey(key);
  };

  const tabs = [
    {
      label: "Module Adoption Reports",
      key: "3",
      children: <InformationTable />,
    },

    ...(isMCOE
      ? [
          {
            label: "View Consolidated Stats",
            key: "1",
            children: <UserWithCountTab activeKey={activeKey} />,
          },
          {
            label: "View All Transactions",
            key: "2",
            children: <TransactionsTab activeKey={activeKey} />,
          },
        ]
      : []),
  ];

  return (
    <div style={{ marginTop: "30px" }}>
      <div
        className={classes.tabsWrapper}
        style={{ marginBottom: "10px", width: "100%", padding: "0px 16px" }}
      >
        <Tabs
          onChange={onTabChange}
          type="card"
          items={tabs}
          activeKey={activeKey}
          animated={{ inkBar: true, tabPane: true }}
        />
      </div>
    </div>
  );
};
export default UserStats;
