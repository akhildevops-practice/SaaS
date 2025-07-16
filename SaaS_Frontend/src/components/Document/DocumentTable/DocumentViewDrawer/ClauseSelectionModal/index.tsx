import React, { useState } from "react";
import { Button, Modal, Table } from "antd";
import { MdSettings } from 'react-icons/md';
import axios from "apis/axios.global";
import PromptsConfigModal from "./PromptsConfigModal";
import { useSnackbar } from "notistack";
type Props = {
  selectedRows?: any;
  setSelectedRows?: any;
  clauseSelectionModal?: any;
  setClauseSelectionModal?: any;
  clauseTableData?: any;
  identifyClauses?: any;
};

const ClauseSelectionModal = ({
  selectedRows = [],
  setSelectedRows,
  clauseSelectionModal = false,
  setClauseSelectionModal,
  clauseTableData = [],
  identifyClauses,
}: Props) => {
  //   const [selectedRows, setSelectedRows] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [formValues, setFormValues] = useState({
    claude_model_prompt: "",
    identify_added_clauses: "",
    identify_modified_clauses: "",
    identify_removed_clauses: "",
    json_added_clauses: "",
    json_modified_clauses: "",
    json_removed_clauses: "",
  });
  const sampleClauses = [
    {
      number: "A.1",
      name: "A.1 Provision 3, Effective Date/Completion of Services, is updated with the following addition",
      description:
        "The Term may be extended up to Select # of years years(s), (“Extended Term”) at the sole option of the State, subject to the parties prior written Agreement on applicable fees for each extended Term, up to but not beyond Select end date under the same terms and conditions, subject to approval of the Governor and Executive Council.",
    },
    {
      number: "A.2",
      name: "A.2 Provision 5, Contract Price/Price Limitation/ Payment, is updated with the following addition:    ",
      description:
        "The State’s liability under this Agreement shall be limited to monetary damages not to exceed the contract price pursuant to Paragraph 5.2.  The Contractor agrees that it has an adequate remedy at law for any breach of this Agreement by the State and hereby waives any right to specific performance or other equitable remedies against the State. Subject to applicable laws and regulations, in no event shall the State be liable for any consequential, special, indirect, incidental, punitive, or exemplary damages.  Notwithstanding the foregoing, nothing herein contained shall be deemed to constitute a waiver of the sovereign immunity of the State, which immunity is hereby reserved to the State.",
    },
    {
      number: "1",
      name: "Air Sampling",
      description:
        "Viable Impact Air samplers utilize impaction technology to collect and monitor for airborne microorganisms (such as bacteria, fungi, and yeast). During the sampling process, air is drawn into an air sampling instrument and makes a sharp bend under the sampling head; particles above a specific size that can't follow the momentum of the airstream strike onto sterile media such as Tryptic Soy Agar or Sabouraud Dextrose, - this is how your sample is collected. The media plate is then removed from the air sampling instrument and incubated to promote the growth of viable particulates. If growth occurs, microorganisms are counted, and results are reported as the number of colony forming units (CFU) per air volume sampled.",
    },
  ];

  const columns = [
    {
      title: "Number",
      dataIndex: "number",
      key: "number",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (_: any, record: any) => (
        <div
          style={{
            width: "100%",
            height: "120px",
            overflowY: "auto",
            border: "1px solid black",
          }}
        >
          {record?.description}
        </div>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRows(selectedRows);
    },
  };

  const handleButtonClick = () => {
    console.log("checkdoc1 rows", selectedRows);
  };

  // Function to handle form value changes
  const handleConfigFormChange = (e: any, field: any) => {
    setFormValues({ ...formValues, [field]: e.target.value });
  };

  // Function to handle form submission
  const handleConfigFormSubmit = () => {
    console.log("checkclause Form Values:", formValues);
    updatePrompts();
  };

  const handleSettingsClick = () => {
    setIsModalVisible(true);
    getPrompts();
  };

  const getPrompts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_PY_URL}/pyapi/get-prompts`
      );
      console.log("checkclause response", response);
      setFormValues(response.data);
    } catch (error) {}
  };

  const updatePrompts = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/update-prompts`,
        {
          ...formValues,
        }
      );
      if (response.status === 200 || response.status === 201) {
        setIsModalVisible(false);
        enqueueSnackbar(`Prompts Updated Successfully`, { variant: "success" });
      }
    } catch (error) {}
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          Clause Library:{" "}
          <Button
            type="text"
            style={{ marginRight: "40px", width: "40px" }}
            onClick={handleSettingsClick}
          >
            <MdSettings />
          </Button>
        </div>
      }
      open={true}
      footer={null}
      onCancel={() => setClauseSelectionModal(false)}
      width={700}
    >
      <div style={{ width: "100%", height: "60vh", overflowY: "auto" }}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={clauseTableData}
          rowKey="_id"
          pagination={false}
        />
      </div>
      <Button type="primary" onClick={identifyClauses}>
        Compare
      </Button>
      {!!isModalVisible && (
        <PromptsConfigModal
          formValues={formValues}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          handleConfigFormChange={handleConfigFormChange}
          handleConfigFormSubmit={handleConfigFormSubmit}
        />
      )}
    </Modal>
  );
};

export default ClauseSelectionModal;
