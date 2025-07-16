import React from "react";
import DocClassification from "./DocClassification";
import DocInfo from "./DocInfo";
import WorkflowForm from "./WorkflowForm";
import useStyles from "./styles";
import CustomAccordion from "../CustomAccordion";
import {useRecoilState} from "recoil";
import {processDocFormData} from "../../recoil/atom";
import ReferenceDocs from "./ReferenceDocs";

type Props = {
  edit: any;
};

function ProcessDocForms({edit}: Props) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState<string | false>('panel1');
  const [formData, setFormData] = useRecoilState(processDocFormData);

  const disableFormFields = !(
    formData.documentState === "DRAFT" ||
    formData.documentState === "AMMEND" ||
    formData.documentState === "PUBLISHED" ||
    formData.documentState === ""
  );

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div>
      <CustomAccordion name="Document Classification" panel='panel1' expanded={expanded} handleChange={handleChange}>
        <DocClassification formData={formData} setFormData={setFormData} edit={edit} />
      </CustomAccordion>
      <CustomAccordion name="Document Information" panel='panel2' expanded={expanded} handleChange={handleChange}>
        <DocInfo formData={formData} setFormData={setFormData} disableFormFields={disableFormFields}/>
      </CustomAccordion>
      <CustomAccordion name="Reference Documents" panel='panel3' expanded={expanded} handleChange={handleChange}>
        <ReferenceDocs formData={formData} setFormData={setFormData} disableFormFields={disableFormFields}/>
      </CustomAccordion>
      <CustomAccordion name="Workflow & Distribution" panel='panel4' expanded={expanded} handleChange={handleChange}>
        <WorkflowForm formData={formData} setFormData={setFormData} disableFormFields={disableFormFields}/>
      </CustomAccordion>
    </div>
  );
}

export default ProcessDocForms;
