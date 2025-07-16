import { Tooltip, Typography } from "@material-ui/core";
import React from "react";
import useStyles from "./styles";

type Props = {
  data: any;
  name: string;
  secondaryData?: boolean;
  secondaryDataName?: any;
};

/**
 * This component displays multiple users in specific UI
 *
 */

function MultiUserDisplay({
  data,
  name,
  secondaryData = false,
  secondaryDataName = null,
}: Props) {
  const classes = useStyles();
  const [dataList, setDataList] = React.useState<any>([]);
  //console.log("username in comp", data);
  React.useEffect(() => {
    if (
      data?.every(
        (item: any) =>
          typeof item === "object" && item !== null && !Array.isArray(item)
      )
    ) {
      const val = data?.map((item: any) => [item[name]]);
      setDataList(val);
    } else {
      setDataList(data);
    }

    if (secondaryData) {
      const val = data?.map((item: any) => [
        `${item[name]}(${item.assignedRole.map((item: any) => {
          return item.role;
        })} )`,
      ]);
      setDataList(val);
    }
  }, [data]);

  const moreData = dataList?.slice(1).join('<br>');
  if (secondaryData) {
    <div style={{ display: "flex" }}>
      {dataList ? (
        <>
          <Typography className={classes.text}>
            {dataList.length ? dataList[0] : "N/A"}
          </Typography>
          {Boolean(moreData.length) && (
            <Tooltip title={moreData}>
              <div className={classes.chipStyle}>{`+${data?.length - 1}`}</div>
            </Tooltip>
          )}
        </>
      ) : (
        <>N/A</>
      )}
    </div>;
  }

  return (
    <div style={{ display: "flex" }}>
      {dataList ? (
        <>
          <Typography className={classes.text}>
            {dataList.length ? dataList[0] : "N/A"}
          </Typography>
          {Boolean(moreData.length) && (
            <Tooltip title={<div dangerouslySetInnerHTML={{ __html: moreData }} />} arrow interactive>
              <div className={classes.chipStyle}>{`+${data?.length - 1}`}</div>
            </Tooltip>
          )}
        </>
      ) : (
        <>N/A</>
      )}
    </div>
  );
}

export default MultiUserDisplay;
