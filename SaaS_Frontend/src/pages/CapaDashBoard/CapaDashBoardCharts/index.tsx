import { useState } from "react";
import styles from "./style";
import { Grid, Paper, Typography, useMediaQuery } from "@material-ui/core";
import { Modal, Tag } from "antd";
import { Col, Form, Row, Select } from "antd";
import type { SelectProps } from "antd";
import CapaOriginWiseChart from "./CapaOriginWiseChart";
import { AiOutlineArrowsAlt } from "react-icons/ai";
import CapaByOriginAndStatusChart from "./CapaByOriginAndStatusChart";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import CapaTable from "./CapaTable";
import CapaByDepartmentCountGraph from "./CapaByDepartmentCountGraph";
import CapaAllLocationGraph from "./CapaAllLocationGraph";
import CapaforAllDepatmentFilterChart from "./CAPAforAllDepatmnetFilterChart";
import BySourceChart from "./BySourceChart";
import ResponsibleEntityChart from "./ResponsibleEntityChart";
import CapaTrendChart from "./CapaTrendChart";
import CapaDefectTypeChart from "./CapaDefectTypeChart";
import CapaByCauseType from "./CapaByCauseType";
import CapaByOwnerChart from "./CapaByOwnerChart";
import CapaByProductChart from "./CapaByProductChart";

type props = {
  capaChartData?: any;
  setSelectedCapaIds?: any;
  showModalCharts?: any;
  newChartData?: any;
  matchedDepartmentName?: any;
  matchedLocationName?: any;
  alllocationData?: any;
  alllocationTableData?: any;
  allOption?: any;
  allDepartmentOption?: any;
  tags?: any;
  trendChartData?: any;
  sourceChartData?: any;
  causeChartData?: any;
  defectTypeChartData?: any;
  ownerChartData?: any;
  productTypeChartData?: any;
  basicOrAdvance?: any;
};

const CapaDashBoardCharts = ({
  capaChartData,
  setSelectedCapaIds,
  showModalCharts,
  newChartData,
  matchedDepartmentName,
  matchedLocationName,
  alllocationData,
  alllocationTableData,
  allOption,
  allDepartmentOption,
  tags,
  trendChartData,
  sourceChartData,
  causeChartData,
  defectTypeChartData,
  ownerChartData,
  productTypeChartData,
  basicOrAdvance,
}: props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const classes = styles(smallScreen, matches)();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenForSourceGraph, setIsModalOpenForSourceGraph] =
    useState(false);
  const [
    isModalOpenForResponsibleEntityGraph,
    setIsModalOpenForResponsibleEntityGraph,
  ] = useState(false);
  const [isModalOpenForDefectTypeGraph, setIsModalOpenForDefectTypeGraph] =
    useState(false);
  const [isModalOpenForCauseTypeGraph, setIsModalOpenForCauseTypeGraph] =
    useState(false);
  const [isModalOpenForOwnerGraph, setIsModalOpenForOwnerGraph] =
    useState(false);
  const [isModalOpenForProductGraph, setIsModalOpenForProductGraph] =
    useState(false);

  const [allDepartmentGraph, setAllDepartmenttGraph] = useState(false);

  const [singleDepartmentGraph, setSingleDepartmentGraph] = useState(false);

  const [allLocationGraph, setAllLocationGraph] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
    // handleFilterClick();
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const options: SelectProps["options"] = [];

  for (let i = 10; i < 36; i++) {
    options.push({
      label: i.toString(36) + i,
      value: i.toString(36) + i,
    });
  }

  const handleChange = (value: string[]) => {};

  // Source Graph  modal

  const showModalForSourceGraph = () => {
    setIsModalOpenForSourceGraph(true);
  };

  const handleOkForSourceGraph = () => {
    setIsModalOpenForSourceGraph(false);
  };

  const handleCancelForSourceGraph = () => {
    setIsModalOpenForSourceGraph(false);
  };

  // Responsible Entity graph modal

  const showModalForResponsibleEntityGraph = () => {
    setIsModalOpenForResponsibleEntityGraph(true);
  };

  const handleOkForResponsibleEntityGraph = () => {
    setIsModalOpenForResponsibleEntityGraph(false);
  };

  const handleCancelForResponsibleEntityGraph = () => {
    setIsModalOpenForResponsibleEntityGraph(false);
  };

  // Defect Type graph modal

  const showModalForDefectTypeGraph = () => {
    setIsModalOpenForDefectTypeGraph(true);
  };

  const handleOkForDefectTypeGraph = () => {
    setIsModalOpenForDefectTypeGraph(false);
  };

  const handleCancelForDefectTypeGraph = () => {
    setIsModalOpenForDefectTypeGraph(false);
  };

  // Cause Type graph modal

  const showModalForCauseTypeGraph = () => {
    setIsModalOpenForCauseTypeGraph(true);
  };

  const handleOkForCauseTypeGraph = () => {
    setIsModalOpenForDefectTypeGraph(false);
  };

  const handleCancelForCauseTypeGraph = () => {
    setIsModalOpenForCauseTypeGraph(false);
  };

  // Owner Type graph modal

  const showModalForOwnerGraph = () => {
    setIsModalOpenForOwnerGraph(true);
  };

  const handleOkForOwnerGraph = () => {
    setIsModalOpenForOwnerGraph(false);
  };

  const handleCancelForOwnerGraph = () => {
    setIsModalOpenForOwnerGraph(false);
  };

  // Product Type graph modal

  const showModalForProductGraph = () => {
    setIsModalOpenForProductGraph(true);
  };

  const handleOkForProductGraph = () => {
    setIsModalOpenForProductGraph(false);
  };

  const handleCancelForProductGraph = () => {
    setIsModalOpenForProductGraph(false);
  };

  // All Department Type graph modal

  const showModalForAllDepartmentGraph = () => {
    setAllDepartmenttGraph(true);
  };

  const handleOkForAllDepartmentGraph = () => {
    setAllDepartmenttGraph(false);
  };

  const handleCancelForAllDepartmentGraph = () => {
    setAllDepartmenttGraph(false);
  };

  //Single Department  Type graph modal

  const showModalForSingleDepartmentGraph = () => {
    setSingleDepartmentGraph(true);
  };

  const handleOkForSingleDepartmentGraph = () => {
    setSingleDepartmentGraph(false);
  };

  const handleCancelForSingleDepartmentGraph = () => {
    setSingleDepartmentGraph(false);
  };

  // All Location  Type graph modal

  const showModalForAllLocationGraph = () => {
    setAllLocationGraph(true);
  };

  const handleOkForAllLocationGraph = () => {
    setAllLocationGraph(false);
  };

  const handleCancelForAllLocationGraph = () => {
    setAllLocationGraph(false);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          padding: "10px 16px",
        }}
      >
        <Paper
          elevation={0}
          style={{
            marginTop: "0px",
            padding: matches ? "15px" : "3px",
            display: "flex",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: matches ? "49%" : "100%",
            height: "380px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ width: matches ? "100%" : "96%", height: "350px" }}>
            <BySourceChart
              sourceChartData={sourceChartData}
              setSelectedCapaIds={setSelectedCapaIds}
              showModalCharts={showModalCharts}
            />
          </div>

          {matches ? (
            <AiOutlineArrowsAlt
              onClick={showModalForSourceGraph}
              style={{ cursor: "pointer" }}
            />
          ) : null}
        </Paper>

        <Paper
          elevation={0}
          style={{
            marginTop: "0px",
            padding: matches ? "15px" : "3px",
            display: "flex",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: matches ? "49%" : "100%",
            height: "380px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ width: matches ? "98%" : "96%", height: "350px" }}>
            <CapaByOwnerChart
              ownerChartData={ownerChartData}
              showModalCharts={showModalCharts}
              setSelectedCapaIds={setSelectedCapaIds}
            />
          </div>

          {matches ? (
            <AiOutlineArrowsAlt
              onClick={showModalForOwnerGraph}
              style={{ cursor: "pointer" }}
            />
          ) : null}
        </Paper>

        <Paper
          elevation={0}
          style={{
            marginTop: "30px",
            padding: matches ? "15px" : "3px",
            display: "flex",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: "100%",
            height: "380px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ width: "100%", height: "350px" }}>
            <CapaTrendChart
              trendChartData={trendChartData}
              setSelectedCapaIds={setSelectedCapaIds}
              showModalCharts={showModalCharts}
            />
          </div>
        </Paper>

        {allOption === "All" ? null : (
          <div
            style={{ width: basicOrAdvance === "Advanced" ? "49%" : "100%" }}
          >
            {allDepartmentOption === "All" ||
            allDepartmentOption === undefined ? (
              <Paper
                elevation={0}
                style={{
                  marginTop: "30px",
                  padding: matches ? "15px" : "3px",
                  display: "flex",
                  border: "1px solid #d7cdc1",
                  borderRadius: "5px",
                  width: "100%",
                  height: "380px",
                  boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
                }}
              >
                <div
                  style={{ width: matches ? "100%" : "96%", height: "350px" }}
                >
                  <CapaforAllDepatmentFilterChart
                    setSelectedCapaIds={setSelectedCapaIds}
                    showModalCharts={showModalCharts}
                    newChartData={newChartData}
                  />
                </div>
                {matches ? (
                  <AiOutlineArrowsAlt
                    onClick={showModalForAllDepartmentGraph}
                    style={{ cursor: "pointer" }}
                  />
                ) : null}
              </Paper>
            ) : (
              <Paper
                elevation={0}
                style={{
                  marginTop: "30px",
                  padding: matches ? "15px" : "3px",
                  display: "flex",
                  border: "1px solid #d7cdc1",
                  borderRadius: "5px",
                  width: "100%",
                  height: "380px",
                  boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
                }}
              >
                <div
                  style={{ width: matches ? "100%" : "96%", height: "350px" }}
                >
                  <CapaByDepartmentCountGraph
                    setSelectedCapaIds={setSelectedCapaIds}
                    showModalCharts={showModalCharts}
                    newChartData={newChartData}
                  />
                </div>
                {matches ? (
                  <AiOutlineArrowsAlt
                    onClick={showModalForSingleDepartmentGraph}
                    style={{ cursor: "pointer" }}
                  />
                ) : null}
              </Paper>
            )}
          </div>
        )}

        {allOption === "All" ? (
          <Paper
            elevation={0}
            style={{
              marginTop: "30px",
              padding: matches ? "15px" : "3px",
              display: "flex",
              border: "1px solid #d7cdc1",
              borderRadius: "5px",
              width: basicOrAdvance === "Advanced" ? "49%" : "100%",
              height: "380px",
              boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ width: matches ? "100%" : "96%", height: "350px" }}>
              <CapaAllLocationGraph
                setSelectedCapaIds={setSelectedCapaIds}
                showModalCharts={showModalCharts}
                alllocationData={alllocationData}
              />
            </div>
            {matches ? (
              <AiOutlineArrowsAlt
                onClick={showModalForAllLocationGraph}
                style={{ cursor: "pointer" }}
              />
            ) : null}
          </Paper>
        ) : null}

        {basicOrAdvance === "Advanced" ? (
          <Paper
            elevation={0}
            style={{
              marginTop: "30px",
              padding: matches ? "15px" : "3px",
              display: "flex",
              border: "1px solid #d7cdc1",
              borderRadius: "5px",
              width: matches ? "49%" : "100%",
              height: "380px",
              boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ width: matches ? "98%" : "96%", height: "350px" }}>
              <CapaByCauseType
                causeChartData={causeChartData}
                showModalCharts={showModalCharts}
                setSelectedCapaIds={setSelectedCapaIds}
              />
            </div>

            {matches ? (
              <AiOutlineArrowsAlt
                onClick={showModalForCauseTypeGraph}
                style={{ cursor: "pointer" }}
              />
            ) : null}
          </Paper>
        ) : null}

        {basicOrAdvance === "Advanced" ? (
          <Paper
            elevation={0}
            style={{
              marginTop: "30px",
              padding: matches ? "15px" : "3px",
              display: "flex",
              border: "1px solid #d7cdc1",
              borderRadius: "5px",
              width: matches ? "49%" : "100%",
              height: "380px",
              boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ width: matches ? "98%" : "96%", height: "350px" }}>
              <CapaDefectTypeChart
                defectTypeChartData={defectTypeChartData}
                showModalCharts={showModalCharts}
                setSelectedCapaIds={setSelectedCapaIds}
              />
            </div>

            {matches ? (
              <AiOutlineArrowsAlt
                onClick={showModalForDefectTypeGraph}
                style={{ cursor: "pointer" }}
              />
            ) : null}
          </Paper>
        ) : null}

        {basicOrAdvance === "Advanced" ? (
          <Paper
            elevation={0}
            style={{
              marginTop: "30px",
              padding: matches ? "15px" : "3px",
              display: "flex",
              border: "1px solid #d7cdc1",
              borderRadius: "5px",
              width: matches ? "49%" : "100%",
              height: "380px",
              boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ width: matches ? "98%" : "96%", height: "350px" }}>
              <CapaByProductChart
                productTypeChartData={productTypeChartData}
                showModalCharts={showModalCharts}
                setSelectedCapaIds={setSelectedCapaIds}
              />
            </div>

            {matches ? (
              <AiOutlineArrowsAlt
                onClick={showModalForProductGraph}
                style={{ cursor: "pointer" }}
              />
            ) : null}
          </Paper>
        ) : null}
      </div>

      <div style={{ margin: "30px 16px" }}>
        <CapaTable
          newChartData={newChartData}
          alllocationData={alllocationTableData}
          allOption={allOption}
          setSelectedCapaIds={setSelectedCapaIds}
          showModalCharts={showModalCharts}
        />
      </div>

      <Modal
        title="Filter By Unit"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Ok"
      >
        <Form
          //   form={form}
          name="auditDFilters"
        >
          <Row>
            <Col span={24}>
              <Form.Item name="Unit">
                <Select
                  // mode="multiple"
                  allowClear
                  placeholder="Unit"
                  onChange={handleChange}
                  options={options}
                >
                  {/* {locations.map((locationName: any) => (
                    <Select.Option key={locationName} value={locationName}>
                      {locationName}
                    </Select.Option>
                  ))} */}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* // Model for charts */}

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForResponsibleEntityGraph}
        onOk={handleOkForResponsibleEntityGraph}
        onCancel={handleCancelForResponsibleEntityGraph}
        width="55vw"
        style={{ display: "flex", justifyContent: "center" }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
        footer={null}
      >
        <div style={{ width: "55vw", height: "60vh" }}>
          <ResponsibleEntityChart />
        </div>
      </Modal>

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForSourceGraph}
        onOk={handleOkForSourceGraph}
        onCancel={handleCancelForSourceGraph}
        width="60vw"
        style={{ display: "flex", justifyContent: "center" }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
        footer={null}
      >
        <div style={{ width: "55vw", height: "60vh" }}>
          <BySourceChart sourceChartData={sourceChartData} />
        </div>
      </Modal>

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForDefectTypeGraph}
        onOk={handleOkForDefectTypeGraph}
        onCancel={handleCancelForDefectTypeGraph}
        width="55vw"
        style={{ display: "flex", justifyContent: "center" }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
        footer={null}
      >
        <div style={{ width: "55vw", height: "60vh" }}>
          <CapaDefectTypeChart defectTypeChartData={defectTypeChartData} />
        </div>
      </Modal>

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForCauseTypeGraph}
        onOk={handleOkForCauseTypeGraph}
        onCancel={handleCancelForCauseTypeGraph}
        width="55vw"
        style={{ display: "flex", justifyContent: "center" }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
        footer={null}
      >
        <div style={{ width: "55vw", height: "60vh" }}>
          <CapaByCauseType causeChartData={causeChartData} />
        </div>
      </Modal>

      {/* //-------------------- */}

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForOwnerGraph}
        onOk={handleOkForOwnerGraph}
        onCancel={handleCancelForOwnerGraph}
        width="55vw"
        style={{ display: "flex", justifyContent: "center" }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
        footer={null}
      >
        <div style={{ width: "55vw", height: "60vh" }}>
          <CapaByOwnerChart ownerChartData={ownerChartData} />
        </div>
      </Modal>

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForProductGraph}
        onOk={handleOkForProductGraph}
        onCancel={handleCancelForProductGraph}
        width="55vw"
        style={{ display: "flex", justifyContent: "center" }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
        footer={null}
      >
        <div style={{ width: "55vw", height: "60vh" }}>
          <CapaByProductChart productTypeChartData={productTypeChartData} />
        </div>
      </Modal>

      {/* --------- lll == */}

      <Modal
        // title="Filter By Unit"
        open={allDepartmentGraph}
        onOk={handleOkForAllDepartmentGraph}
        onCancel={handleCancelForAllDepartmentGraph}
        width="55vw"
        style={{ display: "flex", justifyContent: "center" }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
        footer={null}
      >
        <div style={{ width: "55vw", height: "60vh" }}>
          <CapaforAllDepatmentFilterChart
            setSelectedCapaIds={setSelectedCapaIds}
            showModalCharts={showModalCharts}
            newChartData={newChartData}
          />
        </div>
      </Modal>

      <Modal
        // title="Filter By Unit"
        open={singleDepartmentGraph}
        onOk={handleOkForSingleDepartmentGraph}
        onCancel={handleCancelForSingleDepartmentGraph}
        width="55vw"
        style={{ display: "flex", justifyContent: "center" }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
        footer={null}
      >
        <div style={{ width: "55vw", height: "60vh" }}>
          <CapaByDepartmentCountGraph
            setSelectedCapaIds={setSelectedCapaIds}
            showModalCharts={showModalCharts}
            newChartData={newChartData}
          />
        </div>
      </Modal>

      <Modal
        // title="Filter By Unit"
        open={allLocationGraph}
        onOk={handleOkForAllLocationGraph}
        onCancel={handleCancelForAllLocationGraph}
        width="55vw"
        style={{ display: "flex", justifyContent: "center" }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
        footer={null}
      >
        <div style={{ width: "55vw", height: "60vh" }}>
          <CapaAllLocationGraph
            setSelectedCapaIds={setSelectedCapaIds}
            showModalCharts={showModalCharts}
            alllocationData={alllocationData}
          />
        </div>
      </Modal>
    </>
  );
};

export default CapaDashBoardCharts;
