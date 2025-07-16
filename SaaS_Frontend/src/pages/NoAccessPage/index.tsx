import { Typography } from "@material-ui/core";
import NoAccess from "assets/NoAccess.svg"; // Make sure this path is correct based on your file structure

const NoAccessPage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <img
        src={NoAccess}
        alt="No Data"
        height="400px"
        width="300px"
        style={{ marginBottom: "20px" }}
      />
      <Typography
        align="center"
        style={{
          fontSize: 14,
          color: "#0E0A42",
        }}
      >
        You are not authorized to view this page
      </Typography>
    </div>
  );
};

export default NoAccessPage;
