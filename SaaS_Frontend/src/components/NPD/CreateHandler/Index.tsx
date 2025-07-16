import React, { useState } from "react";
import useStyles from "./Styles";
import { useNavigate } from "react-router-dom";
import getSessionStorage from "utils/getSessionStorage";

type Props = { setModalVisible?: any; modalVisible?: any; pa?: any };

const CreateHandlerIndex = ({ setModalVisible, modalVisible, pa }: Props) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [data, setData] = useState<any>("");
  const userDetail = getSessionStorage();

  const handlerOpenModal = () => {
    localStorage.setItem("readState", JSON.stringify(false));
    navigate("/NPDSteeper", {
      state: {
        id: "",
        mode: "Create",
      },
    });
  };
  // console.log("pa", pa);

  return (
    <div className={classes.main_container}>
      {/* <div
        className={classes.createButton}
        onClick={() => {
          navigate("/NPDMinitesOfMeeting");
        }}
      >
        Create MoM
      </div>
      <Tooltip title="Schedule MOM">
        <div
          onClick={() => navigate("/MinitesOfMeeting")}
          style={{
            width: "23px",
            height: "23px",
            cursor: "pointer",
          }}
        >
          <MdOutlineCalendarToday
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </Tooltip> */}
      {/* <div
        className={classes.createButton}
        onClick={() => {
          handlerOpenModal();
        }}
      >
        Register NPD
      </div> */}
      {pa.some((item: any) => item.id === userDetail.id) && (
        <div
          className={classes.createButton}
          onClick={() => {
            handlerOpenModal();
          }}
        >
          Register NPD
        </div>
      )}
    </div>
  );
};

export default CreateHandlerIndex;
