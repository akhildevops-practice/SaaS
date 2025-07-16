import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import useStyles from "./styles";
import { useEffect, useState } from "react";
const editorConfig = {
  toolbar: {
    name: "ClassicEditor",
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "link",
      "bulletedList",
      "numberedList",
      "|",
      "blockquote",
    ],
    data() {
      return {
        value: null,
      };
    },
  },
};

type Props = {
  formData?: any;
  setFormData?: any;
  title: string;
  mode: any;
};
function MyEditor({ formData, setFormData, title, mode }: Props) {
  const [intitalData, setInititalData] = useState<any>("");
  const classes = useStyles();

  useEffect(() => {
    if (title === "OverallRemarks") {
      if (formData?.overallRemarks) {
        console.log(formData?.overallRemarks);
        setInititalData(formData?.overallRemarks);
      }
    }
    if (title === "Remarks") {
      if (formData?.remarks) {
        console.log(formData?.remarks);
        setInititalData(formData?.remarks);
      }
    }
    if (title === "ChangePointDetails") {
      if (formData?.changePointDetails) {
        console.log(formData?.changePointDetails);
        setInititalData(formData?.changePointDetails);
      }
    }
    if (title === "Reason") {
      if (formData?.reason) {
        console.log(formData?.reason);
        setInititalData(formData?.reason);
      }
    }
    if (title === "CalibrationRemarks") {
      if (formData?.remarks) {
        console.log(formData?.remarks);
        setInititalData(formData?.remarks);
      }
    }
    if (title === "pcrRemarks") {
      if (formData?.pcrRemarks) {
        console.log(formData?.pcrRemarks);
        setInititalData(formData?.pcrRemarks);
      }
    }
    if (title === "previousProcess") {
      if (formData?.previousProcess) {
        console.log(formData?.previousProcess);
        setInititalData(formData?.previousProcess);
      }
    }
    if (title === "newProcess") {
      if (formData?.newProcess) {
        console.log(formData?.newProcess);
        setInititalData(formData?.newProcess);
      }
    }
    if (title === "delayedItemNotes") {
      if (formData?.notes) {
        setInititalData(formData?.notes);
      }
    }
    if (formData?.notes === "") {
      setInititalData("");
    } else {
      setInititalData(formData?.notes);
    }
    if (formData?.minutesofMeeting === "") {
      setInititalData("");
    }
  }, [
    formData?.meetingDescription,
    formData?.meetingMOM,
    formData?.minutesofMeeting,
    formData?.notes,
    title,
  ]);

  console.log("formData?.notes", formData.notes);

  const handleChange = (event: any, editor: any) => {
    const data = editor.getData();
    setInititalData(data);
    if (title === "OverallRemarks") {
      setFormData({ ...formData, overallRemarks: data });
    }
    if (title === "Remarks") {
      setFormData({ ...formData, remarks: data });
    }
    if (title === "ChangePointDetails") {
      setFormData({ ...formData, changePointDetails: data });
    }
    if (title === "Reason") {
      setFormData({ ...formData, reason: data });
    }
    if (title === "CalibrationRemarks") {
      setFormData({ ...formData, remarks: data });
    }

    if (title === "pcrRemarks") {
      setFormData({ ...formData, remarks: data });
    }
    if (title === "previousProcess") {
      setFormData({ ...formData, remarks: data });
    }
    if (title === "newProcess") {
      setFormData({ ...formData, remarks: data });
    }
    if (title === "delayedItemNotes") {
      setFormData({ ...formData, notes: data });
    }
    if (title === "discussedItemNotes") {
      if (data === "") {
        setFormData({ ...formData, notes: "" }); // Reset specific formData key if empty
      } else {
        setFormData({ ...formData, notes: data }); // Otherwise update with editor data
      }
    }
  };

  return (
    <div className={classes.ckBox}>
      <CKEditor
        editor={ClassicEditor as any}
        config={editorConfig}
        data={intitalData}
        onChange={handleChange}
        key={title}
        disabled={mode}
      />
    </div>
  );
}

export default MyEditor;
