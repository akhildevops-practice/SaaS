import CapaDashBoard from "pages/CapaDashBoard";
import CipDashboard from "pages/CipDashboard";
import React from "react";

const CapaAndCipDashBoard = () => {
  return (
    <div>
      <CapaDashBoard />
      <hr style={{ marginTop: "20px" }} />
      <CipDashboard />
    </div>
  );
};

export default CapaAndCipDashBoard;
