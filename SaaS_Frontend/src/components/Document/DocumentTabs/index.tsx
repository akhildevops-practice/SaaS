import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import { IoSettingsSharp } from "react-icons/io5";
import { Dropdown, Menu, Button } from "antd";
import { AiOutlineFileAdd } from "react-icons/ai";
import { LuFileText, LuCirclePlus } from "react-icons/lu";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import { GiStarShuriken } from "react-icons/gi";
import DocumentCreationWizard from "components/Document/DocumentCreateModal";
type TabOption = {
  key: string;
  label: string;
};

type TabsBarProps = {
  options: TabOption[];
  activeKey: string;
  onChange: (key: string) => void;
  onSettingsClick: () => void;
  activeModules?: any[];
  reloadTableDataAfterSubmit?: () => void;
  setIsTableDataLoading?: (loading: boolean) => void;
  isSettingsAccess?: boolean;
};

const useStyles = makeStyles(() => ({
  tabsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    rowGap: "10px",
    marginTop: "20px",
  },
  tabWrapper: {
    display: "flex",
    borderRadius: "10px",
    backgroundColor: "#f2f2f2",
    padding: "6px",
    gap: "10px",
    width: "fit-content",
    flexWrap: "wrap",
  },
  tab: {
    padding: "10px 24px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "16px",
    color: "#444",
    borderRadius: "8px",
    transition: "all 0.3s ease-in-out",
  },
  activeTab: {
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexShrink: 0,
    marginRight: "10px",
  },
}));

const DocumentTabs: React.FC<TabsBarProps> = ({
  options,
  activeKey,
  onChange,
  onSettingsClick,
  activeModules = [],
  reloadTableDataAfterSubmit,
  setIsTableDataLoading,
  isSettingsAccess,
}) => {
  const classes = useStyles();
  const [createModelOpen, setCreateModelOpen] = useState<any>(false);

  const handleCreateModalClose = () => {
    setCreateModelOpen(false);
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="quickUpload"
        icon={<AiOutlineFileAdd style={{ color: "#1890ff" }} />}
        onClick={() => console.log("Quick Upload clicked")}
      >
        <div>
          <div className="font-medium">Quick Upload</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            Upload document directly
          </div>
        </div>
      </Menu.Item>
      <Menu.Item
        key="createDoc"
        icon={<LuFileText style={{ color: "#1890ff" }} />}
        onClick={() => setCreateModelOpen(true)}
      >
        <div>
          <div className="font-medium">Create Document</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            Step-by-step creation
          </div>
        </div>
      </Menu.Item>
      <Menu.Item
        key="aiUpload"
        icon={<HiOutlineRocketLaunch style={{ color: "#1890ff" }} />}
        onClick={() => console.log("AI Upload clicked")}
      >
        <div>
          <div className="font-medium">AI Upload</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            Auto-tag with AI
          </div>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={classes.tabsContainer}>
      <div className={classes.tabWrapper}>
        {options.map((tab) => (
          <div
            key={tab.key}
            className={`${classes.tab} ${
              activeKey === tab.key ? classes.activeTab : ""
            }`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className={classes.buttonGroup}>
        {activeModules?.includes("AI_FEATURES") && (
          <Button
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              fontWeight: "bold",
              borderRadius: "20px",
              padding: "5px 20px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            }}
            // onClick={() => setChatModalOpen(true)}
          >
            <GiStarShuriken style={{ fontSize: "22px", color: "#ff6600" }} />
            AI Chat
          </Button>
        )}
        {isSettingsAccess && (
          <Button
            icon={<IoSettingsSharp size={18} style={{ marginRight: 4 }} />}
            style={{
              backgroundColor: "rgb(0, 48, 89)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
            }}
            onClick={onSettingsClick}
          >
            Settings
          </Button>
        )}

        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
          <Button
            icon={<LuCirclePlus size={16} style={{ marginRight: 4 }} />}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              padding: "6px 16px",
              borderRadius: "6px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
            }}
          >
            Quick Create
          </Button>
        </Dropdown>
      </div>
      <DocumentCreationWizard
        open={createModelOpen}
        onClose={handleCreateModalClose}
        reloadTableDataAfterSubmit={reloadTableDataAfterSubmit}
        setIsTableDataLoading={setIsTableDataLoading}
      />
    </div>
  );
};

export default DocumentTabs;
