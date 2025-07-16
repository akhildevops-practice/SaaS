import { useState, useEffect, useMemo } from "react";
import {
  Popover,
  Typography,
  Button,
  Box,
  Grid,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import { useStyles } from "./styles";
import { useNavigate } from "react-router-dom";
import Audit from "../../assets/candyBox/Audit.png";
import Document from "../../assets/candyBox/documents.png";
import KPI from "../../assets/candyBox/KPI.png";
import Objective from "../../assets/candyBox/Objective.png";
import Risk from "../../assets/candyBox/Risk.png";
import MRM from "../../assets/candyBox/Risk.png";
import getAppUrl from "../../utils/getAppUrl";
import axios from "../../apis/axios.global";
import { modules } from "../../utils/enums";

import { ReactComponent as AppsIcon } from "../../assets/documentControl/Apps.svg";


function Candybox() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const classes = useStyles();
  const realmName = getAppUrl();
  const navigate = useNavigate();

  useEffect(() => {
    getActiveModules();
  }, []);

  const getActiveModules = async () => {
    await axios(`/api/organization/getAllActiveModules/${realmName}`)
      .then((res) => setActiveModules([...res.data.activeModules, "MRM"]))
      .catch((err) => console.error(err));
  };

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const candyBoxButtons = useMemo(() => {
    const temp: any[] = [];

    if (activeModules.includes(modules.AUDIT))
      temp.push({
        id: 1,
        image: Audit,
        title: "Audit",
        url: "/audit",
      });

    if (activeModules.includes(modules.DOCUMENTS))
      temp.push({
        id: 2,
        image: Document,
        title: "Document",
        url: "/processdocuments",
      });
    if (activeModules.includes(modules.KPI))
      temp.push({
        id: 3,
        image: KPI,
        title: "KPI",
        url: "/kpi",
      });
    if (activeModules.includes(modules.OBJECTIVES))
      temp.push({
        id: 4,
        image: Objective,
        title: "Objective",
        url: "/objective",
      });
    if (activeModules.includes(modules.RISK))
      temp.push({
        id: 5,
        image: Risk,
        title: "Risk",
        url: "/risk",
      });
    if (activeModules.includes(modules.MRM))
      temp.push({
        id: 6,
        image: MRM,
        title: "MRM",
        url: "/mrm",
      });

    return temp;
  }, [activeModules]);

  return (
    <div style={{ marginRight: "150px", paddingRight: "20px" }}>
      <Tooltip title="Apps">
        <IconButton color="inherit" onClick={handleClick}>
          <AppsIcon width="21.88px" height="20px" />
          <span className={classes.leftSideText}>Apps</span>
          {/* <img src={Menu} alt="candybox" height="16px" width="16px" /> */}
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          style: {
            backgroundColor: "white",
            borderRadius: 12,
            zIndex: 99,
            overflow: "visible",
          },
        }}
      >
        <Box className={classes.candyBoxContainer}>
          <Box className={classes.arrow} />
          <Grid container justifyContent="flex-start" alignItems="center">
            {candyBoxButtons.map((i) => {
              return (
                <Grid item style={{ margin: "5px 0" }} xs={4} key={i.id}>
                  <Button
                    className={classes.candyBoxButton}
                    variant="text"
                    size="small"
                    onClick={() => {
                      navigate(i.url);
                      handleClose();
                    }}
                  >
                    <img src={i.image} alt={i.title} width={47} />
                    <Typography className={classes.candyLabel} component="p">
                      <strong>{i.title}</strong>
                    </Typography>
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Popover>
    </div>
  );
}

export default Candybox;
