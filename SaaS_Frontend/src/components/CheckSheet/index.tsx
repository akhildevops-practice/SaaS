import { Tabs, Typography } from "antd";
import type { TabsProps } from "antd";
import DesignTimeTable from "./DesignTimeTable";
import RunTimeTable from "./RunTimeTable";
import styles from "./style";
import ChecksheetDashboard from "./ChecksheetDashboard";
import { FaEdit } from "react-icons/fa";
import { AiOutlineDashboard, AiOutlineFileText } from "react-icons/ai";
import { useState } from "react";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import SideNavbar from "./SideNavbar";
import ChecksheetReportView from "./ChecksheetReportView";
const CheckSheet = () => {
  const classes = styles();
  const [activeTab, setActiveTab] = useState("Reports");
  const [collapseLevel, setCollapseLevel] = useState(0);
  const { Title } = Typography;

  return (
    <>
      <div
        // className={classes.root}
        style={{
          display: "flex",
          width: "100%",
          height: "90vh",
          overflow: "hidden",
          position: "relative", // <- Important
        }}
      >
        <SideNavbar
          collapseLevel={collapseLevel}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        {/* Collapse Button placed inline between sidebar and main content */}
        <div
          style={{
            position: "absolute", // <- Makes it float above content
            top: 4,
            left: collapseLevel === 2 ? 0 : collapseLevel === 1 ? 60 : 88,
            zIndex: 10,
            // backgroundColor: "#fff",
            // border: "1px solid #ccc",
            // borderRadius: "50%",
            width: 55,
            height: 55,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // boxShadow: "0 0 4px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "left 0.3s ease",
          }}
          onClick={() => setCollapseLevel((prev) => (prev + 1) % 3)}
        >
          {collapseLevel === 2 ? (
            <RiSidebarUnfoldLine size={24} />
          ) : (
            <RiSidebarFoldLine size={24} />
          )}
        </div>

        {/* //---------main components----------------- */}
        <div
          style={{
            flex: 1,
            marginLeft: "10px",
            overflow: "auto",
          }}
        >
          <div
            style={{
              marginBottom: activeTab === "Forms Library" ? "0px" : "20px",
            }}
          >
            <Title
              level={3}
              style={{ fontWeight: 600, margin: "16px 0px 0px 40px" }}
            >
              {activeTab}
            </Title>
          </div>
          <div>
            {activeTab === "Forms Library" ? (
              <div>
                <DesignTimeTable />{" "}
              </div>
            ) : null}
            {activeTab === "Reports" ? (
              <div>
                <RunTimeTable />{" "}
              </div>
            ) : null}
            {activeTab === "Dashboards" ? (
              <div>
                <ChecksheetDashboard />{" "}
              </div>
            ) : null}
            {activeTab === "View" ? (
              <div>
                <ChecksheetReportView />{" "}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckSheet;
