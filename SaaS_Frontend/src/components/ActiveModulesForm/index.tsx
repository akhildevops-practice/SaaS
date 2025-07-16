import React from "react";
import {
  Checkbox,
  FormControlLabel,
  Box,
  makeStyles,
} from "@material-ui/core";
import { modules } from "../../utils/enums";
import checkRole from "../../utils/checkRoles";
import { roles } from "../../utils/enums";
import SuffixPrefix from "../SuffixPrefix";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 20,
  },
  pos: {
    marginBottom: 8,
  },
});

type Props = {
  activeModules: string[];
  setActiveModules: React.Dispatch<React.SetStateAction<string[]>>;
};

function ActiveModulesForm({ activeModules, setActiveModules }: Props) {
  const classes = useStyles();
  const isAdmin = checkRole(roles.admin);
  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: true,
  });
  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const handleChange = (e: any) => {
    const index = activeModules.indexOf(e.target.name);

    if (index > -1)
      setActiveModules((prev) => prev.filter((mod) => mod !== e.target.name));
    else setActiveModules((prev) => [...prev, e.target.name]);
  };

  return (
    <Box style={{ padding: "20px 0 0 20px" }}>
      {/* <Typography component="h5" variant="h5" style={{ marginBottom: 23 }}>
        {isAdmin ? "Select Modules" : "Active Modules"}
      </Typography> */}
      <Box
        display="flex"
        alignItems="flex-start"
        // justifyContent="space-between"
        flexWrap="wrap"
      >
        <>
          <FormControlLabel
            style={{ margin: "0 15px 10px 0" }}
            disabled={!isAdmin}
            control={
              <Checkbox
                checked={activeModules?.includes(modules.AUDIT)}
                onChange={handleChange}
                name="Audit"
                color="primary"
              />
            }
            label={<span style={{ color: "black" }}>Audit</span>}
          />
          <FormControlLabel
            style={{ margin: "0 15px 10px 0" }}
            disabled={!isAdmin}
            control={
              <Checkbox
                checked={activeModules?.includes(modules.DOCUMENTS)}
                onChange={handleChange}
                name="ProcessDocuments"
                color="primary"
              />
            }
            label={<span style={{ color: "black" }}>Process Documents</span>}
          />
          <FormControlLabel
            style={{ margin: "0 15px 10px 0" }}
            disabled={!isAdmin}
            control={
              <Checkbox
                checked={activeModules?.includes(modules.KPI)}
                onChange={handleChange}
                name="Objectives & KPI"
                color="primary"
              />
            }
            label={<span style={{ color: "black" }}>Objectives & KPI</span>}
          />
          <FormControlLabel
            style={{ margin: "0 15px 10px 0" }}
            disabled={!isAdmin}
            control={
              <Checkbox
                checked={activeModules?.includes(modules.NPD)}
                onChange={handleChange}
                name="NPD"
                color="primary"
              />
            }
            label="NPD"
          />
          <FormControlLabel
            style={{ margin: "0 15px 10px 0" }}
            disabled={!isAdmin}
            control={
              <Checkbox
                checked={activeModules?.includes(modules.AUDITCHECKSHEETS)}
                onChange={handleChange}
                name="AuditChecksheets"
                color="primary"
              />
            }
            label="Audit Checksheets"
          />
          <FormControlLabel
            style={{ margin: "0 15px 10px 0" }}
            disabled={!isAdmin}
            control={
              <Checkbox
                checked={activeModules?.includes(modules.RISK)}
                onChange={handleChange}
                name="Risk"
                color="primary"
              />
            }
            label={<span style={{ color: "black" }}>Risk</span>}
          />
          <FormControlLabel
            style={{ marginBottom: 10 }}
            disabled={!isAdmin}
            control={
              <Checkbox
                checked={activeModules?.includes(modules.MRM)}
                onChange={handleChange}
                name="MRM"
                color="primary"
              />
            }
            label={<span style={{ color: "black" }}>MRM</span>}
          />
          <FormControlLabel
            style={{ marginBottom: 10 }}
            disabled={!isAdmin}
            control={
              <Checkbox
                checked={activeModules?.includes(modules.CAPA)}
                onChange={handleChange}
                name="CAPA"
                color="primary"
              />
            }
            label={<span style={{ color: "black" }}>CAPA</span>}
          />
          <FormControlLabel
            style={{ marginBottom: 10 }}
            disabled={!isAdmin}
            control={
              <Checkbox
                checked={activeModules?.includes(modules.CIP)}
                onChange={handleChange}
                name="CIP"
                color="primary"
              />
            }
            label={<span style={{ color: "black" }}>CIP</span>}
          />

          <FormControlLabel
            style={{ marginBottom: 10 }}
            disabled={!isAdmin}
            control={
              <Checkbox
                checked={activeModules?.includes(modules.CLAIM)}
                onChange={handleChange}
                name="CLAIM"
                color="primary"
              />
            }
            label={<span style={{ color: "black" }}>CLAIM</span>}
          />
          <FormControlLabel
            style={{ margin: "0 15px 10px 0" }}
            disabled={!isAdmin}
            control={
              <Checkbox
                checked={activeModules?.includes(modules.AI_FEATURES)}
                onChange={handleChange}
                name="AI_FEATURES"
                color="primary"
              />
            }
            label="AI Features"
          />
        </>
      </Box>
      <SuffixPrefix />
    </Box>
  );
}

export default ActiveModulesForm;
