import { useState } from "react";
import { Paper, useMediaQuery } from "@material-ui/core";
import TopCipsChart from "./TopCipsChart";
import { AiOutlineArrowsAlt } from "react-icons/ai";
import { Modal, Tag } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import CipStatusChart from "./CipStatusChart";
import CipAllLocationGraph from "./CipAllLocationChart";
import AllLocationTable from "./AllLocationTable";
import CipAllDepartmentChart from "./CipAllDepartmentChart";
import styles from "./style";

type props = {
  showModalCharts?: any;
  setSelectedCipStatus?: any;
  setSelectedCostCipId?: any;
  getCipCostTableData?: any;
  showModalChartss?: any;
  chartData?: any;
  chartDataForAlllocation?: any;
  allOption?: any;
  setSelectedCostCipIdForAllLocation?: any;
  cipAllDepartmentData?: any;
  setSelectedCipIdForAllDepartment?: any;
  allDepartment?: any;
  tags?: any;
};

const CipCharts = ({
  showModalCharts,
  setSelectedCipStatus,
  setSelectedCostCipId,
  getCipCostTableData,
  showModalChartss,
  chartData,
  chartDataForAlllocation,
  allOption,
  setSelectedCostCipIdForAllLocation,
  cipAllDepartmentData,
  setSelectedCipIdForAllDepartment,
  allDepartment,
  tags,
}: props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const classes = styles(smallScreen, matches)();
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);

  const handleClickCipStatus = (e: any, index: any) => {
    const indexToMatch = index[0]?.index;

    const matchedObject = chartData.statusWiseData[indexToMatch];

    const matchedStatus = matchedObject?.status;
    setSelectedCipStatus(matchedStatus);
    showModalCharts();
  };

  const handleClickCipCost = (e: any, index: any) => {
    const indexToMatch = index[0]?.index;

    const matchedObject = chartData.highCostWiseData[indexToMatch];

    const matchedId = matchedObject?.id;

    setSelectedCostCipId([matchedId]);
    showModalChartss();
  };

  const [isModalOpenForTopCips, setIsModalOpenForTopCips] = useState(false);

  const showModalForTopCips = () => {
    setIsModalOpenForTopCips(true);
  };

  const handleOkForTopCips = () => {
    setIsModalOpenForTopCips(false);
  };

  const handleCancelForTopCips = () => {
    setIsModalOpenForTopCips(false);
  };

  // Top 10 CIP  graph modal

  const [isModalOpenForCipStatus, setIsModalOpenForCipStatus] = useState(false);

  const showModalForCipStatus = () => {
    setIsModalOpenForCipStatus(true);
  };

  const handleOkForCipStatus = () => {
    setIsModalOpenForCipStatus(false);
  };

  const handleCancelForCipStatus = () => {
    setIsModalOpenForCipStatus(false);
  };

  return (
    <>
      {allOption === "All" ||
      allDepartment === "All" ||
      allDepartment === undefined ? null : (
        <div className={classes.filterMainContainer}>
          <div className={classes.textContainer}>
            <Paper elevation={0} className={classes.paper}>
              <p className={classes.count}>{chartData?.myDeptCount}</p>
              <p className={classes.text}>My Dept </p>
            </Paper>
          </div>
          <div className={classes.textContainer}>
            <Paper elevation={0} className={classes.paper}>
              <p className={classes.count}>{chartData?.myLocCount}</p>
              <p className={classes.text}>My Unit</p>
            </Paper>
          </div>
        </div>
      )}
      {allOption === "All" ? null : (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: matches ? "0px 16px 10px 16px" : "5px",
            flexDirection: matches ? "row-reverse" : "column",
            // backgroundColor: "#F8F9F9",
          }}
        >
          <Paper
            elevation={0}
            style={{
              marginTop: "15px",
              padding: matches ? "15px" : "3px",
              display: "flex",
              border: "1px solid #d7cdc1",
              borderRadius: "5px",
              width: matches ? "49%" : "100%",
              height: "380px",
              boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ width: matches ? "680px" : "100%", height: "350px" }}>
              {" "}
              {/* {matches ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {tags?.length ? (
                    <>
                      {tags?.map((tag: any, index: any) => (
                        <Tag color={tag.color} key={index}>
                          {tag.tagName}
                        </Tag>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              ) : null} */}
              <TopCipsChart
                chartData={chartData}
                handleClickCipCost={handleClickCipCost}
              />
            </div>

            {matches ? (
              <AiOutlineArrowsAlt
                onClick={showModalForTopCips}
                style={{ marginRight: "5px" }}
              />
            ) : null}
          </Paper>

          <Paper
            elevation={0}
            style={{
              marginTop: "15px",
              padding: matches ? "15px" : "3px",
              display: "flex",
              border: "1px solid #d7cdc1",
              borderRadius: "5px",
              width: matches ? "49%" : "100%",
              height: "380px",
              boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ width: matches ? "680px" : "100%", height: "350px" }}>
              {" "}
              {/* {matches ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {tags?.length ? (
                    <>
                      {tags?.map((tag: any, index: any) => (
                        <Tag color={tag.color} key={index}>
                          {tag.tagName}
                        </Tag>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              ) : null} */}
              <CipStatusChart
                chartData={chartData}
                handleClickCipStatus={handleClickCipStatus}
                setSelectedCostCipId={setSelectedCostCipId}
              />
            </div>
            {matches ? (
              <AiOutlineArrowsAlt
                onClick={showModalForCipStatus}
                style={{ marginRight: "5px" }}
              />
            ) : null}
          </Paper>
        </div>
      )}

      {(allDepartment === "All" || allDepartment === undefined) &&
      allOption !== "All" ? (
        <div style={{ padding: "16px" }}>
          <Paper
            elevation={0}
            style={{
              padding: matches ? "15px" : "3px",
              display: "flex",
              border: "1px solid #d7cdc1",
              borderRadius: "5px",
              width: matches ? "100%" : "100%",
              height: "480px",
              boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ width: matches ? "98%" : "100%", height: "450px" }}>
              {" "}
              {/* {matches ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {tags?.length ? (
                    <>
                      {tags?.map((tag: any, index: any) => (
                        <Tag color={tag.color} key={index}>
                          {tag.tagName}
                        </Tag>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              ) : null} */}
              <CipAllDepartmentChart
                showModalCharts={showModalCharts}
                setSelectedCipIdForAllDepartment={
                  setSelectedCipIdForAllDepartment
                }
                cipAllDepartmentData={cipAllDepartmentData}
                setSelectedCipStatus={setSelectedCipStatus}
              />
            </div>
          </Paper>
        </div>
      ) : null}

      {allOption === "All" ? (
        <Paper
          elevation={0}
          style={{
            margin: "16px",
            padding: matches ? "15px" : "3px",
            display: "flex",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: "98%",
            height: "480px",
            boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ width: "100%", height: "450px" }}>
            {" "}
            {/* {matches ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                {tags?.length ? (
                  <>
                    {tags?.map((tag: any, index: any) => (
                      <Tag color={tag.color} key={index}>
                        {tag.tagName}
                      </Tag>
                    ))}
                  </>
                ) : (
                  <></>
                )}
              </div>
            ) : null} */}
            <CipAllLocationGraph
              chartDataForAlllocation={chartDataForAlllocation}
              setSelectedCostCipId={setSelectedCostCipId}
              showModalCharts={showModalCharts}
              setSelectedCostCipIdForAllLocation={
                setSelectedCostCipIdForAllLocation
              }
              setSelectedCipStatus={setSelectedCipStatus}
            />
          </div>
        </Paper>
      ) : null}

      {allOption === "All" ||
      allDepartment === "All" ||
      allDepartment === undefined ? (
        <div style={{ width: "100%", padding: matches ? "15px" : "5px" }}>
          {" "}
          <AllLocationTable
            chartDataForAlllocation={chartDataForAlllocation}
            cipAllDepartmentData={cipAllDepartmentData}
            allOption={allOption}
            showModalCharts={showModalCharts}
            setSelectedCipIdForAllDepartment={setSelectedCipIdForAllDepartment}
          />
        </div>
      ) : null}

      {/* //-------------Modals------------------- */}

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForTopCips}
        onOk={handleOkForTopCips}
        onCancel={handleCancelForTopCips}
        width="90vw"
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
        <div style={{ width: "85vw", height: "60vh", marginBottom: "30px" }}>
          {" "}
          <div style={{ display: "flex", justifyContent: "center" }}>
            {tags?.length ? (
              <>
                {tags?.map((tag: any, index: any) => (
                  <Tag color={tag.color} key={index}>
                    {tag.tagName}
                  </Tag>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
          <TopCipsChart
            chartData={chartData}
            handleClickCipCost={handleClickCipCost}
          />
        </div>
      </Modal>

      <Modal
        // title="Filter By Unit"
        open={isModalOpenForCipStatus}
        onOk={handleOkForCipStatus}
        onCancel={handleCancelForCipStatus}
        width="90vw"
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
        <div style={{ width: "85vw", height: "60vh" }}>
          {" "}
          <div style={{ display: "flex", justifyContent: "center" }}>
            {tags?.length ? (
              <>
                {tags?.map((tag: any, index: any) => (
                  <Tag color={tag.color} key={index}>
                    {tag.tagName}
                  </Tag>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
          <CipStatusChart
            chartData={chartData}
            handleClickCipStatus={handleClickCipStatus}
          />
        </div>
      </Modal>
    </>
  );
};

export default CipCharts;
