import { Button, Modal, Tabs } from "antd";
import type { TabsProps } from "antd";
import styles from "./style";
import IsNot from "./IsNot";
import FishBoneAnalysis from "./FishBoneAnalysis";
import RootAnalysis from "./RootAnalysis";
import { useEffect, useState } from "react";
import axios from "apis/axios.global";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";



type props = {
  formData?: any;
  setformdata?: any;
  readMode?: any;
  read?: any;
};
const AnalysisAdvanceMainPage = ({
  formData,
  readMode,
  setformdata,
  read,
}: props) => {
  const classes = styles();
  const { id } = useParams();
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const { enqueueSnackbar } = useSnackbar();
  const [editMode, setEditmode] = useState(false);
  const [causeWiseData, setCauseWiseData] = useState<Record<string, string[]>>(
    {}
  );
  const [activeTab, setActiveTab] = useState("1");
  const [isNotFormData, setIsNotFormData] = useState<any>({
    who: [],
    what: [],
    why: [],
    where: [],
    when: [],
    howMuch: [],
    howMany: [],
  });

  const categories = [
    "Man",
    "Environment",
    "Machine",
    "Method",
    "Material",
    "Measurement",
  ];

  const [finshbonedata, setFinshboneData] = useState(
    categories.reduce((acc, category) => {
      acc[category.toLowerCase()] = [{ textArea: "", checked: false }];
      return acc;
    }, {} as Record<string, { textArea: string; checked: boolean }[]>)
  );

  const [rootAnalysisdataSource, setRootAnalysisDataSource] = useState<
    Record<string, string[]>
  >({
    why1: [],
    why2: [],
    why3: [],
    why4: [],
    why5: [],
  });

 

  useEffect(() => {
    if (
      activeTab === "3" &&
      rootAnalysisdataSource.why2.length === 0 &&
      rootAnalysisdataSource.why3.length === 0 &&
      rootAnalysisdataSource.why4.length === 0 &&
      rootAnalysisdataSource.why5.length === 0 &&
      !read
    ) {
      submitData();
    }
  }, [activeTab]);

  useEffect(() => {
    getAnalysisData();
  }, [id]);


  useEffect(() => {

    const filteredData = Object.keys(rootAnalysisdataSource)
      .filter((key) => key.startsWith("why"))
      .reduce((acc, key) => {
        acc[key] = rootAnalysisdataSource[key];
        return acc;
      }, {} as Record<string, string[]>);

    const maxCauses = Math.max(
      ...Object.values(filteredData).map((causes) => causes.length)
    );

    if (maxCauses === -Infinity || maxCauses === 0) {
      setCauseWiseData({});
      return;
    }

    const newCauseWiseData: Record<string, string[]> = {};

    for (let i = 0; i < maxCauses; i++) {
      newCauseWiseData[`Cause (${i + 1})`] = Object.keys(filteredData).map(
        (whyKey) => filteredData[whyKey][i] || "" // If no value, set as empty string
      );
    }

    setCauseWiseData(newCauseWiseData);
  }, [rootAnalysisdataSource]);

  const getAnalysisData = async () => {
    const result = await axios.get(`/api/cara/getAnalysisForCapa/${id}`);
    if (result.status === 200 || result.status === 201) {
      if (result.data?.isIsNot) {
        setIsNotFormData(result.data.isIsNot);
      }

      if (result.data?.fishBone) {
        const updatedFishBone = categories.reduce((acc, category) => {
          const key = category.toLowerCase();
          acc[key] = result.data.fishBone[key] || [
            { textArea: "", checked: false },
          ];
          return acc;
        }, {} as Record<string, { textArea: string; checked: boolean }[]>);

        setFinshboneData(updatedFishBone);
      }

      if (result.data?.rootCause) {
        setRootAnalysisDataSource(result.data.rootCause);
      }
    }
    if (result.data === "") {
      setEditmode(false);
    } else {
      setEditmode(true);
    }
  };

  const submitData = () => {
    const payload = {
      capaId: id,
      organizationId: userInfo.organizationId,
      createdBy: userInfo.id,
      isIsNot: isNotFormData,
      fishBone: finshbonedata,
      rootCause: rootAnalysisdataSource,
      causes: causeWiseData,
    };

    if (editMode === true) {
      submitAnalysisEditedData(payload);
    } else {
      submitAnalysisData(payload);
    }
  };

  const submitAnalysisData = async (payload: any) => {
    const result = await axios.post("/api/cara/createAnalysis", payload);
    if (result.status === 200 || result.status === 201) {
      getAnalysisData();
      enqueueSnackbar("Data Saved", {
        variant: "success",
      });
    }
  };

  const submitAnalysisEditedData = async (payload: any) => {
    const result = await axios.patch(`/api/cara/updateAnalysis/${id}`, payload);

    if (result.status === 200 || result.status === 201) {
      getAnalysisData();
      enqueueSnackbar("Data Saved", {
        variant: "success",
      });
    }
  };

  const { confirm } = Modal;

  const handleTabChange = (key: string) => {
    if(read){
      setActiveTab(key);
    }else{
      if (key === "3" && activeTab !== "3") {
        confirm({
          title: "",
          content:
            "Any changes made will be lost if Save button is not clicked . Do you want to proceed?.",
          onOk() {
            setActiveTab(key);
          },
          onCancel() {},
        });
      } else {
        setActiveTab(key);
      }
    }
   
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Is-Is Not Analysis",
      children: (
        <IsNot
          setIsNotFormData={setIsNotFormData}
          isNotFormData={isNotFormData}
          formData={formData}
          setformdata={setformdata}
          readMode={readMode}
        />
      ),
    },
    {
      key: "2",
      label: "Fish-Bone Analysis",
      children: (
        <FishBoneAnalysis
          setFinshboneData={setFinshboneData}
          finshbonedata={finshbonedata}
          categories={categories}
          formData={formData}
          setformdata={setformdata}
          readMode={readMode}
          submitData={submitData}
          setActiveTab={setActiveTab}
          read={read}
        />
      ),
    },
    {
      key: "3",
      label: "Root Cause",
      children: (
        <RootAnalysis
          rootAnalysisdataSource={rootAnalysisdataSource}
          setRootAnalysisDataSource={setRootAnalysisDataSource}
          setCauseWiseData={setCauseWiseData}
          formData={formData}
          setformdata={setformdata}
          readMode={readMode}
        />
      ),
    },
  ];

  return (
    <div className={classes.mainPageContainer}>
      <div className={classes.tabContainer}>
        <Tabs
          activeKey={activeTab}
          defaultActiveKey="1"
          type="card"
          items={items}
          className={classes.tabsWrapper}
          tabBarStyle={{ display: "flex", justifyContent: "center" }}
          onTabClick={handleTabChange}
        />
      </div>
     
      {!read && (
  <Button
    style={{
      backgroundColor: "#003059",
      fontSize: "14px",
      width: "90px",
      textAlign: "center",
      color: "white",
      position: "absolute",
      top: "77px",
      right: "66px",
      zIndex: 1100,
    }}
    onClick={submitData}
    disabled={readMode}
  >
    Save
  </Button>
)}



    </div>
  );
};

export default AnalysisAdvanceMainPage;
