import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useStyles from "./styles";
import { Box } from "@material-ui/core";
import { AiOutlineMenuFold } from "react-icons/ai";
import CreateHandlerIndex from "../CreateHandler/Index";
import axios from "apis/axios.global";
import { MdAssessment } from "react-icons/md";
import { MdOutlineSupervisorAccount } from "react-icons/md";
import { MdOutlineMyLocation } from "react-icons/md";
import { MdOutlineReportProblem } from "react-icons/md";
import { MdSettings } from "react-icons/md";
import { MdDashboard } from "react-icons/md";
import { RiSidebarUnfoldLine, RiSidebarFoldLine } from "react-icons/ri";

import checkRoles from "utils/checkRoles";
import NPDMainIndex from "../Index";
import GanttIndex from "../SVARGantt";
import MinutesOfMeeting from "../MinitesOfMeeting";
import ActionPlan from "../ActionPlan/Index";
import RiskIndex from "../Risk/Index";
import NPDSideNav from "../NPDSideNav";

const NavbarIndex = ({ collapseLevel, setCollapseLevel, title }: any) => {
  const classes = useStyles();
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [values, setValues] = useState(0);
  const [modalVisible, setModalVisible] = useState(0);

  const location = useLocation();

  const [pa, setPa] = useState<any>([]);

  useEffect(() => {
    if (location?.state?.back === 1) {
      setValues(1);
    }
    if (location?.state?.back === 2) {
      setValues(2);
    }
  }, [location]);

  useEffect(() => {
    getProjectAdmins();
  }, []);
  const getProjectAdmins = async () => {
    const result = await axios.get(`/api/configuration`);
    // console.log("result?.data in reg npd nav bar", result.data);
    if (result?.data[0]?.pmUserData) {
      setPa(result?.data[0]?.pmUserData);
    }
  };

  return (
    <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
      <Box>
        <div className={classes.buttonsMainContainer}>
          <div className={classes.buttonsSubContainer}>
            {/* 
            <button
              className={
                values === 0
                  ? classes.buttonContainerActive
                  : classes.buttonContainer
              }
              onClick={() => {
                setValues(0);
                // navigate("/NPDNavbar");
              }}
              style={{ width: "120px", cursor: "pointer" }}
            >
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "25px",
                    height: "35px",
                    borderRight:
                      values === 0 ? "1px solid #fff" : "1px solid black",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <AiOutlineMenuFold style={{ fontSize: "18px" }} />
                </div>
                <span style={{ fontSize: "16px" }}>All NPD</span>
              </div>
            </button>
            <button
              className={
                values === 1
                  ? classes.buttonContainerActive
                  : classes.buttonContainer
              }
              onClick={() => {
                setValues(1);
                // navigate("/GanttIndex");
              }}
              style={{ width: "160px", cursor: "pointer" }}
            >
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "25px",
                    height: "35px",
                    borderRight:
                      values === 1 ? "1px solid #fff" : "1px solid black",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdAssessment style={{ fontSize: "18px" }} />
                </div>
                <span style={{ fontSize: "16px" }}>Gantt Chart</span>
              </div>
            </button>
            <button
              className={
                values === 2
                  ? classes.buttonContainerActive
                  : classes.buttonContainer
              }
              onClick={() => {
                setValues(2);
                // navigate("/MinutesOfMeeting");
              }}
              style={{ width: "120px" }}
            >
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "25px",
                    height: "35px",
                    borderRight:
                      values === 2 ? "1px solid #fff" : "1px solid black",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdOutlineSupervisorAccount style={{ fontSize: "18px" }} />
                </div>
                <span style={{ fontSize: "16px" }}>MoM</span>
              </div>
            </button>
            <button
              className={
                values === 3
                  ? classes.buttonContainerActive
                  : classes.buttonContainer
              }
              onClick={() => {
                setValues(3);
                // navigate("/ActionPlan");
              }}
              style={{ width: "160px" }}
            >
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "25px",
                    height: "35px",
                    borderRight:
                      values === 3 ? "1px solid #fff" : "1px solid black",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdOutlineMyLocation style={{ fontSize: "18px" }} />
                </div>
                <span style={{ fontSize: "16px" }}>Action Items</span>
              </div>
            </button>
            <button
              className={
                values === 4
                  ? classes.buttonContainerActive
                  : classes.buttonContainer
              }
              onClick={() => {
                setValues(4);
                // navigate("/Risk");
              }}
              style={{ width: "120px" }}
            >
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "25px",
                    height: "35px",
                    borderRight:
                      values === 4 ? "1px solid #fff" : "1px solid black",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdOutlineReportProblem style={{ fontSize: "18px" }} />
                </div>
                <span style={{ fontSize: "16px" }}>Risk</span>
              </div>
            </button>
            {pa?.some((item: any) => item.id === userDetail.id) && (
              <button
                className={
                  values === 5
                    ? classes.buttonContainerActive
                    : classes.buttonContainer
                }
                onClick={() => {
                  setValues(5);
                  navigate("/NPDSettingsHomePage");
                }}
                style={{ width: "130px" }}
              >
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <div
                    style={{
                      width: "25px",
                      height: "35px",
                      display: "flex",
                      alignItems: "center",
                      borderRight:
                        values === 5 ? "1px solid #fff" : "1px solid black",
                    }}
                  >
                    <MdSettings style={{ fontSize: "18px" }} />
                  </div>
                  <span style={{ fontSize: "16px" }}>Settings</span>
                </div>
              </button>
            )}
            <button
              className={
                values === 6
                  ? classes.buttonContainerActive
                  : classes.buttonContainer
              }
              onClick={() => {
                setValues(6);
                navigate("/NPDDashBoard");
              }}
              style={{ width: "140px" }}
            >
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "25px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    borderRight:
                      values === 6 ? "1px solid #fff" : "1px solid black",
                  }}
                >
                  <MdDashboard style={{ fontSize: "18px" }} />
                </div>
                <span style={{ fontSize: "16px" }}>DashBoard</span>
              </div>
            </button>
            */}
            {/* Collapse Button placed inline between sidebar and main content */}
            <div
              style={{
                // position: "absolute",
                // top: 0,
                // left: collapseLevel === 2 ? 0 : collapseLevel === 1 ? 60 : 88,
                zIndex: 10,
                // backgroundColor: "#fff",
                // border: "1px solid #ccc",
                // borderRadius: "50%",
                // width: 55,
                // height: 55,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // boxShadow: "0 0 4px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "left 0.3s ease",
              }}
              onClick={() => setCollapseLevel((prev: any) => (prev + 1) % 3)}
            >
              {collapseLevel === 2 ? (
                <RiSidebarUnfoldLine size={24} />
              ) : (
                <RiSidebarFoldLine size={24} />
              )}
            </div>
            <strong style={{fontSize:"20px"}}>{title}</strong>
          </div>
          <div>
            <CreateHandlerIndex
              setModalVisible={setModalVisible}
              modalVisible={modalVisible}
              pa={pa}
            />
          </div>
        </div>
      </Box>
    </div>
  );
};

export default NavbarIndex;
