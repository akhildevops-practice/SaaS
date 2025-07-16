import React, { useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { AiOutlineMinusCircle } from "react-icons/ai"
const useStyles = makeStyles<Theme>((theme: Theme) => ({
  tableContainer: {
    width: "100%",
    borderCollapse: "collapse",
    "& table": {
      width: "100%",
      borderCollapse: "collapse",
    },
    "& th, & td": {
      padding: "12px 16px",
      textAlign: "left",
      border: "1px solid #ddd",
    },
    "& th": {
      backgroundColor: "#E8F3F9",
      color: "#00224E",
      fontWeight: 600,
    },
    // "& tr:hover": {
    //   backgroundColor: "#f5f5f5",
    // },
  },
  expandIcon: {
    cursor: "pointer",
    marginRight: "10px",
  },
  subTableContainer: {
    marginLeft: "20px",
    "& table": {
      width: "95%",
    },
    "& th, & td": {
      padding: "10px 12px",
    },
  },
}));

type Props = {
  consolidatedCountTableData: any;
};

const HiraConsolidatedCountTableChart = ({
  consolidatedCountTableData = [],
}: Props) => {
  const classes = useStyles();
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);

  const toggleExpandLocation = (locationId: string) => {
    setExpandedLocation((prev) => (prev === locationId ? null : locationId));
    setExpandedEntity(null); // Close all expanded entities when location is toggled
  };

  const toggleExpandEntity = (entityId: string) => {
    setExpandedEntity((prev) => (prev === entityId ? null : entityId));
  };

  return (
    <div className={classes.tableContainer}>
      <Typography
        align="center"
        gutterBottom
        style={{ fontSize: "16px", color: "black" }}
      >
        HIRA Consolidated Count
      </Typography>
      <table>
        <thead>
          <tr>
            <th>Corp Func/Unit</th>
          </tr>
        </thead>
        <tbody>
          {consolidatedCountTableData?.map((location: any) => (
            <React.Fragment key={location?._id}>
              <tr>
                <td>
                  <span
                    className={classes.expandIcon}
                    onClick={() => toggleExpandLocation(location?._id)}
                  >
                    {expandedLocation === location?._id ? (
                      <AiOutlineMinusCircle />
                    ) : (
                      <AiOutlinePlusCircle />
                    )}
                  </span>
                  {location?.locationName}
                </td>
              </tr>
              {expandedLocation === location?._id && (
                <tr>
                  <td>
                    <div className={classes.subTableContainer}>
                      <table>
                        <thead>
                          <tr>
                            <th>Dept/Vertical</th>
                            <th>Draft</th>
                            <th>InWorkflow</th>
                            <th>Approved</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {location?.entityGroupedCount?.map((entity: any) => (
                            <React.Fragment key={entity?.entityId}>
                              <tr>
                                <td>
                                  
                                  {entity.entityName}
                                </td>
                                <td>{entity.DRAFT}</td>
                                <td>{entity.inWorkflow}</td>
                                <td>{entity.APPROVED}</td>
                                <td>{entity.total}</td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HiraConsolidatedCountTableChart;
