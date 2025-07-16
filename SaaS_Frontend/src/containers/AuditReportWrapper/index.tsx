import { Typography } from "@material-ui/core";
import { useEffect } from "react";
import CustomButtonGroup from "../../components/CustomButtonGroup";
import Dropdown from "../../components/Dropdown";
import { mobileView } from "../../recoil/atom";
import { useRecoilValue } from "recoil";
import { useStyles } from "./styles";
import checkRoles from "../../utils/checkRoles";
import { roles } from "../../utils/enums";

type Props = {
  parentPageLink: string;
  children: any;
  handleSubmit?: any;
  handleDiscard?: any;
  backBtn?: any;
  splitButton?: boolean;
  options?: any;
  onSubmit?: any;
  disableOption?: any;
  disableFormFunction?: boolean;
  customButtonStyle?: any;
  dropdownOptions?: any;
  handleMenuItemClick?: any;
  location?: any;
  auditYear?: any;
};

function AuditReportWrapper({
  children,
  parentPageLink,
  handleSubmit,
  handleDiscard,
  backBtn = true,
  splitButton = false,
  options,
  onSubmit,
  disableOption,
  disableFormFunction = false,
  customButtonStyle,
  dropdownOptions,
  handleMenuItemClick,
  location,
  auditYear,
}: Props) {
  const classes = useStyles();
  const view = useRecoilValue(mobileView);
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const isEntityHead = checkRoles("ENTITY-HEAD");
  const isAuditor = checkRoles(roles.AUDITOR);

  useEffect(() => {}, [dropdownOptions]);

  return (
    <div>
      <div className={classes.header}>
        <Typography variant="h6" color="primary" style={{ width: "61%" }}>
          Audit Year : {auditYear} | Location : {location}
        </Typography>
        {!disableFormFunction && (
          <div>
            {splitButton ? (
              <div className={classes.buttonGroup}>
                <CustomButtonGroup
                  options={options}
                  handleSubmit={onSubmit}
                  disableBtnFor={disableOption ? disableOption : []}
                  style={customButtonStyle}
                />
              </div>
            ) : (
              <Dropdown
                disabled={
                  isLocAdmin ||
                  isOrgAdmin ||
                  isEntityHead ||
                  (isMR && !isAuditor)
                }
                data={dropdownOptions}
                onClick={handleMenuItemClick}
                title="New Audit"
              />
            )}
          </div>
        )}
      </div>
      <div
        className={
          view ? classes.formContainerMobileView : classes.formContainer
        }
      >
        {children}
      </div>
    </div>
  );
}

export default AuditReportWrapper;
