import { Layout, Tabs } from "antd";

// import HelpTopicsTab from "./HelpTopicsTab";
import ManageHelpTab from "./ManageHelpTab";
import useStyles from "./style";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import axios from "apis/axios.global";
import { API_LINK } from "config";
import checkRoles from "utils/checkRoles";

const Help = () => {
  const classes = useStyles();
  const [activeTabKey, setActiveTabKey] = useState<any>("1");
  const [selectedTopics, setSelectedTopics] = useState<any>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<any>("");
  const isOrgAdmin = checkRoles("ORG-ADMIN");

  useEffect(() => {
    if (selectedModuleId) {
      getAllTopics(selectedModuleId);
    }
  }, [activeTabKey]);

  const getAllTopics = async (moduleId: any = "") => {
    try {
      if (!moduleId) return;
      const response = await axios.get(
        API_LINK + `/api/moduleHelp/getTopicsByModuleId/${moduleId}`
      );
      const topicData = response.data;
      setSelectedTopics(topicData);
    } catch (error) {
      console.error("ERROR ",error)
    }
    
  };
  let tabs: any[] = [];
  if(isOrgAdmin){
    tabs = [
      // {
      //   label: "Help Topics",
      //   key: "1",
      //   children: (
      //     <HelpTopicsTab
      //       getAllTopics={getAllTopics}
      //       selectedTopics={selectedTopics}
      //       setSelectedTopics={setSelectedTopics}
      //       setSelectedModuleId={setSelectedModuleId}
      //       selectedModuleId={selectedModuleId}
      //     />
      //   ),
      // },
      {
        label: "Manage Help",
        key: "2",
        children: <ManageHelpTab />,
      },
    ];
  }else {
    tabs = [
      // {
      //   label: "Help Topics",
      //   key: "1",
      //   children: (
      //     <HelpTopicsTab
      //       getAllTopics={getAllTopics}
      //       selectedTopics={selectedTopics}
      //       setSelectedTopics={setSelectedTopics}
      //       setSelectedModuleId={setSelectedModuleId}
      //       selectedModuleId={selectedModuleId}
      //     />
      //   ),
      // },
    ]
  }
  return (
    <>
      <Layout style={{ background: "aliceblue" }}>
        <Content className={classes.fullformtabs}>
          <div
            style={{
              padding: 24,
              minHeight: 280,
              backgroundColor: "#fff",
            }}
          >
            <div className={classes.tabsWrapper}>
              <Tabs
                defaultActiveKey={activeTabKey}
                onChange={(key: string) => setActiveTabKey(key)}
                type="card"
                items={tabs as any}
                animated={{ inkBar: true, tabPane: true }}
              />
            </div>
          </div>
        </Content>
      </Layout>
    </>
  );
};

export default Help;
