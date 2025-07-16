import React from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import { MdExpandMore } from 'react-icons/md';
import { Typography } from "@material-ui/core";
import useStyles from "./styles";

type Props = {
  name: string;
  children: any;
  panel?: string;
  expanded?: any;
  handleChange?: any;
  changeHandler?: any;
  style?: any;
  border?: boolean;
  adornment?: any;
  emptyBackground?: boolean;
  postedOn?: string;
};

function CustomAccordion({
  name,
  children,
  panel,
  expanded,
  handleChange,
  changeHandler = true,
  border = true,
  adornment,
  emptyBackground = false,
  postedOn,
}: Props) {
  const classes = useStyles();

  if (!changeHandler) {
    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<MdExpandMore style={{ color: "#ffffff" }} />}
          aria-controls={panel}
          id={panel}
          className={classes.accordionIndependent}
        >
          <Typography className={classes.headingIndependent}>{name}</Typography>
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
      </Accordion>
    );
  }

  return (
    <Accordion
      data-testid="accordion-component"
      expanded={expanded === panel}
      onChange={handleChange(panel)}
      style={
        {
          // border: emptyBackground ? "1px solid rgba(104, 104, 104, 0.1)" : "none",
        }
      }
    >
      <AccordionSummary
        expandIcon={<MdExpandMore />}
        className={
          emptyBackground ? classes.emptyBGHeader : classes.accordionHeader
        }
      >
        {adornment && <div style={{ marginRight: 20 }}>{adornment}</div>}
        <Typography className={classes.heading}>{name}</Typography>
      </AccordionSummary>
      <AccordionDetails
        className={
          border
            ? classes.accordionContent
            : classes.accordionContent__noBackground
        }
      >
        {children}
        {postedOn && postedOn.length > 0 && (
          <p className={classes.posted}>Posted on {postedOn}</p>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default CustomAccordion;
