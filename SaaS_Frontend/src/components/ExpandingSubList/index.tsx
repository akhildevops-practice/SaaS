import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { makeStyles } from "@material-ui/core/styles";
import { useNavigate } from "react-router-dom";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";
import { navActiveSubCheck } from "../../utils/navActiveCheck";

type Props = {
  data: any;
  title: string;
  icon: any;
  childIcons: any;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: "absolute",
    marginTop: 55,
    width: "100%",
    right: 0,
    display: "flex",
    justifyContent: "center",
    // backgroundColor: "#F7F7FF",
  },
}));

/**
 * This components displays the expanding Navigation i.e. the Sub Navigation links for Desktop View
 *
 */

function ExpandingSubList({ data, title, icon, childIcons }: Props) {
  const classes = useStyles();
  const url = navActiveSubCheck();
  const urlNew = url === "nc" ? "ncsummary" : url === "obs" ? "ncsummary" : url;
  const val = data.findIndex(
    (item: any, i: number) => item.replace(/\s+/g, "").toLowerCase() === urlNew
  );
  const [value, setValue] = React.useState(val === -1 ? 0 : val);
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs value={value} onChange={handleChange} indicatorColor="primary">
        {data.map((val: any, i: number) => (
          <Tab
            key={i}
            label={capitalizeFirstLetter(val)}
            data-testid="expanding-sub-list-tab"
            onClick={() => {
              navigate(
                `${title.replace(/\s+/g, "").toLowerCase()}/${val
                  .replace(/\s+/g, "")
                  .toLowerCase()}`
              );
            }}
          />
        ))}
      </Tabs>
    </div>
  );
}

export default ExpandingSubList;
