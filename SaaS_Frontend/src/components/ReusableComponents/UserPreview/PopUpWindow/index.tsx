import { MdClose } from 'react-icons/md';
import { Button } from "antd";
import AddDocumentForm from "components/AddDocumentForm";
import DocumentDrawer from "components/Document/DocumentTable/DocumentDrawer";
import UnitForm from "components/MasterAddOrEditForm/UnitForm";
import AuditPlanFormStepper from "pages/AuditPlanFormStepper";
import NewDepartment from "pages/MasterFormWrappers/NewDepartment";
import NewLocation from "pages/MasterFormWrappers/NewLocation";
import NewSystem from "pages/MasterFormWrappers/NewSystem";
import NewUser from "pages/MasterFormWrappers/NewUser";
import FunctionsSetting from "pages/MasterHomePage/FunctionsSetting";
import { useStyles } from "./styles";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import axios from "apis/axios.global";

type Props = {
  record: any;
  isPopUpOpen?: any;
  setIsPopUpOpen?: any;
  docTypeData?: any;
};

const PopUpWindow = ({
  record,
  isPopUpOpen,
  setIsPopUpOpen,
  docTypeData,
}: Props) => {
  const classes = useStyles();
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [kpiData, setKpiData] = useState<any>();

  console.log("record in pop up", record);
  useEffect(() => {
    if (record?.type === "kpis") {
      getKpiData();
    }
  }, []);
  const getKpiData = async () => {
    const result = await axios.get(
      `/api/kpi-definition/getSelectedKpibyId/${record?.id}`
    );
    if (result.data) {
      setKpiData(result?.data);
      setIsKpiModalOpen(true);
    }
  };
  return (
    <div
      className={classes.root}
      style={{
        overflowY: record.type === "Documents" || "Doctype" ? "auto" : "hidden",
      }}
    >
      <div className={classes.headerStyles}>
        {record.type}
        <Button
          onClick={() => setIsPopUpOpen(false)}
          className={classes.closeButton}
        >
          <MdClose fontSize="small" style={{ color: "white" }} />
        </Button>
      </div>
      {record.type === "auditplans" && (
        <AuditPlanFormStepper deletedId={record.id} />
      )}
      {record.type === "Location" && <NewLocation deletedId={record.id} />}
      {record.type === "User" && <NewUser deletedId={record.id} />}
      {record.type === "systems" && <NewSystem deletedId={record.id} />}
      {record.type === "Documents" && <DocumentDrawer deletedId={record.id} />}
      {record.type === "Entity" && <NewDepartment deletedId={record.id} />}
      {record.type === "Functions" && <FunctionsSetting />}
      {record.type === "kpis" && (
        <Dialog open={isKpiModalOpen} onClose={() => setIsKpiModalOpen(false)}>
          <DialogTitle>KPI Details</DialogTitle>
          <DialogContent>
            {/* Assuming `record.kpis` contains the relevant KPI data */}
            <div>
              <p>
                <strong>Name:</strong> {kpiData?.kpiName}
              </p>
              <p>
                <strong>Type:</strong> {kpiData?.kpiTargetType}
              </p>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsKpiModalOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {record.type === "unitType" && (
        <UnitForm
          unitForm={{
            id: record.id,
            unitType: record?.unitType,
            units: record?.unitOfMeasurement,
          }}
          setUnitForm={function (value: any): void {
            throw new Error("Function not implemented.");
          }}
        />
      )}

      {record.type === "Doctype" && (
        <AddDocumentForm
          deletedId={record.id}
          deletedDocTypeData={docTypeData}
        />
      )}
    </div>
  );
};

export default PopUpWindow;
