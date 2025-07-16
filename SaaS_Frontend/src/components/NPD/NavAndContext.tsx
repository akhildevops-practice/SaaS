import React, { useState } from "react";
import checkRoles from "utils/checkRoles";
import { useNavigate } from "react-router-dom";
import NPDMainIndex from "./Index";
import MinutesOfMeeting from "./MinitesOfMeeting";
import ActionPlan from "./ActionPlan/Index";
import RiskIndex from "./Risk/Index";
import NavbarIndex from "./NavbarHeader/Index";
import NPDSideNav from "./NPDSideNav";
import GanttIndex from "./SVARGantt";

const NPDAndContent = () => {
  const [collapseLevel, setCollapseLevel] = useState(0);
  const isMr = checkRoles("MR");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all-npd");
  const isMCOE = checkRoles("ORG-ADMIN");

  const handleSettingsClick: any = () => {
    navigate("/NPDSettingsHomePage");
  };

  return (
    <div style={{ display: "flex", gap: "10px", paddingLeft:'-20px' }}>
      {/* Sidebar */}
      <NPDSideNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapseLevel={collapseLevel}
        isSettingsAccess={isMCOE || isMr}
        onSettingsClick={handleSettingsClick}
      />

      <div style={{ width: "100%" }}>
        <NavbarIndex
          collapseLevel={collapseLevel}
          setCollapseLevel={setCollapseLevel}
          title={
            activeTab === "all-npd"
              ? "All NPD"
              : activeTab === "gantt-chart"
              ? "Gantt chart"
              : activeTab === "mom"
              ? "MoM"
              : activeTab === "action-items"
              ? "Action Plans"
              : activeTab === "risk"
              ? "Risk"
              : ""
          }
        />
        <div>
          {activeTab === "all-npd" ? (
            <NPDMainIndex  />
          ) : activeTab === "gantt-chart" ? (
            <GanttIndex />
          ) : activeTab === "mom" ? (
            <MinutesOfMeeting />
          ) : activeTab === "action-items" ? (
            <ActionPlan />
          ) : activeTab === "risk" ? (
            <RiskIndex />
          ) : activeTab === "settings" ? (
            ""
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default NPDAndContent;
