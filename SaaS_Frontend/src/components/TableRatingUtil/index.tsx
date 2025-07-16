import React from "react";
import { Tooltip, Typography, Box } from "@material-ui/core";
import Popover from "@material-ui/core/Popover";
import {
  usePopupState,
  bindTrigger,
  bindPopover,
} from "material-ui-popup-state/hooks";
import useStyles from "./styles";
import Rating from "../Rating";

type Props = {
  data: any;
  name: string;
  secondaryData?: boolean;
  secondaryDataName?: any;
  currentRating: number;
  overallRating: number;
  disable: boolean;
};

/**
 * @method TableRatingUtil
 * @description This component displays the rating utility in a particular table entry
 * @returns a react functional component
 */

function TableRatingUtil({
  data,
  name,
  secondaryData = false,
  secondaryDataName = null,
  currentRating,
  overallRating,
  disable = false,
}: Props) {
  const classes = useStyles();
  const [dataList, setDataList] = React.useState<any>();

  const popupState = usePopupState({
    variant: "popover",
    popupId: "demoPopover",
  });

  React.useEffect(() => {
    if (data) {
      const val = data?.map((item: any) => [item[name]]);
      setDataList(val);
    }

    if (secondaryData) {
      const val = data.map((item: any) => [
        `${item[name]}(${item.assignedRole.map((item: any) => {
          return item.role;
        })} )`,
      ]);
      setDataList(val);
    }

    window.removeEventListener("scroll", popupState.close);
    window.addEventListener("scroll", popupState.close, { passive: true });
    return () => window.removeEventListener("scroll", popupState.close);
  }, []);

  const moreData = dataList?.slice(1).toString();

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
          <button
            disabled={disable}
            className={classes.text}
            {...bindTrigger(popupState)}
          >
            {dataList.length ? dataList[0] : "N/A"}
          </button>
          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Box p={2} bgcolor="#F7F7FF">
              <Box display="flex" gridGap={10} paddingBottom={1}>
                <Typography className={classes.ratingText}>
                  This Audit:
                </Typography>
                <Rating value={currentRating} name="audit rating" />
              </Box>
              <Box display="flex">
                <Typography className={classes.ratingText}>
                  Overall Audit:
                </Typography>
                <Rating value={overallRating} name="overall rating" />
              </Box>
            </Box>
          </Popover>
          {Boolean(moreData.length) && (
            <Tooltip title={moreData}>
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

export default TableRatingUtil;
