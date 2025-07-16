import {
  Grid,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import useStyles from "./styles";
import CustomModal from "../newComponents/CustomModal";
import axios from "../../apis/axios.global";

type Props = {
  auditPlanData: any;
  setAuditPlanData: React.Dispatch<React.SetStateAction<any>>;
  isModalOpen?: boolean;
  setIsModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit?: boolean;
};

/**
 * This the whole UI structure of the Audit Scope Form
 *
 * @param {boolean} isEdit This is to check if the form is in EDIT mode
 * @returns Audit Scope Form
 */

function AuditPlanForm2({
  auditPlanData,
  setAuditPlanData,
  isModalOpen = false,
  setIsModalOpen = () => {},
  isEdit = false,
}: Props) {
  const [scopes, setScopes] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [tempScope, setTempScope] = useState<string>("");

  const classes = useStyles();

  useEffect(() => {
    getScopes();
    getRoles();
  }, []);

  // get scopes by location
  const getScopes = async () => {
    await axios(`/api/auditPlan/getEntityByLocation`)
      .then((res) => {
        console.log("scopes", res.data);
        setScopes(res.data);
      })
      .catch((err) => console.error(err));
  };

  console.log("auditPlanData", auditPlanData);
  // get roles
  const getRoles = async () => {
    await axios(`/api/auditPlan/getRoles`) // roles API here
      .then((res) => {
        setRoles(res.data);
      })
      .catch((err) => console.error(err));
  };

  const handleChange = (e: any) => {
    if (
      !isEdit &&
      e.target.name === "scope" &&
      auditPlanData.AuditPlanEntitywise.length > 0
    ) {
      setTempScope(e.target.value);
      setIsModalOpen(true);
      return;
    }
    setAuditPlanData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  console.log("auditplandData2", auditPlanData, auditPlanData?.auditor);
  return (
    <>
      {!isEdit && (
        <CustomModal
          open={isModalOpen}
          setOpen={setIsModalOpen}
          heading="Existing plan will be deleted"
          text={
            "An audit plan for the scope already exists. If scope is modified, the existing plan will be deleted."
          }
          //  "${
          //   auditPlanData.scope ? JSON.parse(auditPlanData.scope).name : ""
          // }"
          buttons={[
            {
              name: "Continue",
              color: "primary",
              func: () => {
                setAuditPlanData((prev: any) => ({
                  ...prev,
                  scope: tempScope,
                  AuditPlanEntitywise: [],
                }));
              },
            },
          ]}
        />
      )}
      <form
        data-testid="audit-scope-form"
        autoComplete="off"
        className={classes.form}
      >
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Grid item sm={12} md={4}>
            <Grid
              container
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Grid item sm={12} md={6} className={classes.formTextPadding}>
                <strong>Created By</strong>
              </Grid>
              <Grid item sm={12} md={6}>
                <strong style={{ color: "b5b5b5" }}>
                  {auditPlanData.createdBy}
                </strong>
              </Grid>

              <Grid item sm={12} md={6} className={classes.formTextPadding}>
                <strong>Last Modified</strong>
              </Grid>
              <Grid item sm={12} md={6}>
                <strong style={{ color: "b5b5b5" }}>
                  {auditPlanData.lastModified}
                </strong>
              </Grid>
            </Grid>
          </Grid>

          <Grid item sm={12} md={4}>
            <Grid
              container
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Grid item sm={12} md={6} className={classes.formTextPadding}>
                <strong>Created On</strong>
              </Grid>
              <Grid item sm={12} md={6}>
                <strong style={{ color: "b5b5b5" }}>
                  {auditPlanData.createdOn}
                </strong>
              </Grid>

              <Grid item sm={12} md={6} className={classes.formTextPadding}>
                <strong>Audit Responsibility</strong>
              </Grid>
              <Grid item sm={12} md={6}>
                <strong style={{ color: "b5b5b5" }}>
                  {auditPlanData.role}
                </strong>
              </Grid>
            </Grid>
          </Grid>

          <Grid item sm={12} md={4}>
            <Grid
              container
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Grid item sm={12} md={6} className={classes.formTextPadding}>
                <strong>Audit For</strong>
              </Grid>
              <Grid item sm={12} md={6}>
                <strong style={{ color: "b5b5b5" }}>
                  {auditPlanData.scope.name}
                </strong>
              </Grid>

              <Grid item sm={12} md={6} className={classes.formTextPadding}>
                <strong>Plan Type</strong>
              </Grid>
              <Grid item sm={12} md={6}>
                <strong style={{ color: "b5b5b5" }}>
                  {auditPlanData.planType}
                </strong>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default AuditPlanForm2;
