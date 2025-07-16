import { Drawer, Card, Button, Typography, Progress, Modal, Table } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CaraFormStepper from "..";
import { useEffect, useState } from "react";
import axios from "apis/axios.global";

const { Title, Paragraph, Text } = Typography;
type Props = {
  visible?: any;
  onClose?: any;
  similarCapas?: any;
};
const SimilarCapasDrawer = ({ visible, onClose, similarCapas }: Props) => {
  const [selectedCapa, setSelectedCapa] = useState(null);
  const [tableData, setTableData] = useState<any>();
  const [analysisLevel, setAnalysisLevel] = useState<boolean>(true);
  useEffect(() => {
    getCaraById();
  }, [selectedCapa]);
  const handleViewDetails = async (capa: any) => {
    setSelectedCapa(capa?.metadata?.capaId);
  };
  // console.log("selectec capa", selectedCapa);
  const getCaraById = async () => {
    try {
      // console.log("getcarbyid", editData._id);
      const result = await axios.get(`/api/cara/getCaraById/${selectedCapa}}`);

      if (result?.data) {
        result?.data?.analysisLevel === "Advanced"
          ? setAnalysisLevel(true)
          : setAnalysisLevel(false);
        setTableData(result?.data);
      }
    } catch (error) {
      // enqueueSnackbar("Error fetching record for cara", { variant: "error" });
    }
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0, color: "#003059" }}>
          AI Suggested CAPAs
        </Title>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 40 }}
      bodyStyle={{ padding: "24px" }}
    >
      <div style={{ display: "flex", gap: "24px", height: "70vh" }}>
        {/* Left Column - CAPA Cards */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "12px",
            borderRight: "1px solid #eee",
          }}
        >
          {similarCapas?.length > 0 ? (
            similarCapas.map((capa: any, idx: any) => (
              <Card
                key={idx}
                style={{
                  border: "1px solid #d9d9d9",
                  marginBottom: "12px",
                }}
                hoverable
              >
                <div>
                  <Title level={5} style={{ color: "#003059", margin: 0 }}>
                    {capa.metadata?.title || "Untitled CAPA"}
                  </Title>
                  <Text type="secondary" style={{ fontSize: "10px" }}>
                    {capa.metadata?.serialNumber} {capa.metadata?.correctedDate}
                  </Text>
                  <Paragraph style={{ margin: "8px 0" }}>
                    {capa.metadata?.description || "No description available."}
                  </Paragraph>
                  <Progress
                    percent={capa.normalized_score}
                    showInfo
                    strokeColor="#3399ff"
                    status="normal"
                    size="small"
                  />
                  <div style={{ marginTop: "12px" }}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleViewDetails(capa)}
                      style={{
                        backgroundColor: "#F0F0F0",
                        color: "#003059",
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Paragraph>No similar CAPAs found.</Paragraph>
          )}
        </div>

        {/* Right Column - CAPA Detail Viewer */}
        <div style={{ flex: 1, overflowY: "auto", paddingLeft: "12px" }}>
          {selectedCapa ? (
            <div>
              <Table></Table>
            </div>
          ) : (
            <Paragraph type="secondary">
              Select a CAPA to view its details
            </Paragraph>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SimilarCapasDrawer;
