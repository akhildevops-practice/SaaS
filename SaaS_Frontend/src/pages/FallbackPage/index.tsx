import NoAccess from "../../assets/NoAccess.svg";
import { Typography } from "@material-ui/core";
const FallBackPage = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img src={NoAccess} alt="No Data" height="400px" width="300px" />
      </div>
      <Typography
        align="center"
        style={{
          fontSize: 14,
          color: "#0E0A42",
        }}
      >
        This Module Is Under Construction
      </Typography>
    </>
  );
};

export default FallBackPage;
