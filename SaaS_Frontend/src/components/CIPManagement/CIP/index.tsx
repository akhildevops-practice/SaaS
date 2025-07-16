import { Typography } from "antd";
import { useState } from "react";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import CIPSideNav from "components/CIPManagement/CIPSideNav";
import CIPControl from "pages/CIPControl";
import CIPSettings from "pages/CIPControl/CIPSettings";
import checkRoles from "utils/checkRoles";

const CIP = () => {
  const [activeTab, setActiveTab] = useState("Cip Management");
  const [collapseLevel, setCollapseLevel] = useState(0);
  const { Title } = Typography;
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const isSettingsAccess = isOrgAdmin || isMR;

  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "90vh",
          overflow: "hidden",
          position: "relative", // <- Important
        }}
      >
        <CIPSideNav
          collapseLevel={collapseLevel}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSettingsAccess={isSettingsAccess}
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
            // marginLeft: "10px",
            overflow: "auto",
            padding: "0px 16px",
          }}
        >
          <div
            style={{
              marginBottom: activeTab === "Cip Management" ? "0px" : "20px",
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
            {activeTab === "Cip Management" ? (
              <div>
                <CIPControl />{" "}
              </div>
            ) : null}
            {activeTab === "Settings" ? (
              <div>
                <CIPSettings />{" "}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default CIP;
