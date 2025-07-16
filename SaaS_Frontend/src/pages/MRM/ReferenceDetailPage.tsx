import React from "react";
import { Button, Layout, Space, Tabs } from "antd";
import { ReactComponent as ShrinkIcon } from "../../assets/icons/shrink-new.svg";
import { useNavigate } from "react-router-dom";
import { Theme, Tooltip, makeStyles } from "@material-ui/core";
import ExpandedDocumentForm from "pages/MRM/Components/ExpandedDocumentForm";
// import WorkFlowTab from "../../components/Document/ProcessDocument/Drawer/WorkflowTab";
// import checkRoles from "../../utils/checkRoles";

import TempWorkFlowTab from "pages/MRM/Components/ExpandedDocumentForm/TempWorkFlowTab";
const { Content, Header } = Layout;
const useStyles = makeStyles((theme: Theme) => ({
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#ADD8E6 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "skyblue !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
}));
const ReferenceDetailPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const tabs = [
    {
      label: "Doc Info",
      key: 1,
      children: <ExpandedDocumentForm />,
    },
    {
      label: "Workflow",
      key: 2,
      children: <TempWorkFlowTab />,
    },
    {
      label: "References",
      key: 3,
      children: <>placeholder references </>,
    },
  ];
  const goBack = () => {
    navigate("/mrm/mrm", {
      state: { drawerOpen: true },
    });
  };
  return (
    <Layout style={{ background: "aliceblue" }}>
      <Header style={{ backgroundColor: "#fff", padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <Tooltip title="Shrink Form">
              <Button
                // type="primary"
                onClick={goBack}
                // style={{ marginRight: "16px" }}
              >
                <ShrinkIcon
                  style={{
                    width: "1em",
                    height: "1em",
                    fill: "black",
                    verticalAlign: "middle",
                    overflow: "hidden",
                  }}
                />
                {/* <MdArrowBack /> */}
              </Button>
            </Tooltip>
          </div>
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
            // onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              //  onClick={handleSubmit}
              type="primary"
            >
              Submit
            </Button>
          </Space>
        </div>
      </Header>
      <Content style={{ margin: "24px 16px 0" }}>
        <div
          style={{
            padding: 24,
            minHeight: 280,
            backgroundColor: "#fff",
          }}
        >
          <div className={classes.tabsWrapper}>
            <Tabs
              type="card"
              items={tabs as any}
              animated={{ inkBar: true, tabPane: true }}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ReferenceDetailPage;
