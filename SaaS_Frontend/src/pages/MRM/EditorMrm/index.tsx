import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import useStyles from "./styles";
import checkRoles from "../../../utils/checkRoles";
import { useEffect, useState } from "react";
const editorConfig = {
  toolbar: {
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
  },
};

type Props = {
  formData?: any;
  setFormData?: any;
  title: string;
};
function MyEditorMrm({ formData, setFormData, title }: Props) {
  const [intitalData, setInititalData] = useState<any>(formData?.minutesofMeeting);
  const classes = useStyles();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const showData = isOrgAdmin || isMR;
  useEffect(() => {
    if (title === "description") {
      if (formData?.minutesofMeeting) {
        setInititalData(formData?.minutesofMeeting);
      }
    }

    // if (title === "mom") {
    //   if (formData?.meetingMOM) {
    //     setInititalData(formData?.meetingMOM);
    //   }
    // }
  }, [formData?.minutesofMeeting, formData?.meetingMOM, title]);

  console.log("formData?.minutesofMeeting",formData?.minutesofMeeting)
  const handleChange = (event: any, editor: any) => {
    const data = editor.getData();
    setInititalData(data);
    setFormData({ ...formData, minutesofMeeting: data });
  };

  return (
    <div className={classes.ckBox}>
      <CKEditor
        editor={ClassicEditor as any}
        config={editorConfig}
        data={intitalData}
        onChange={handleChange}
        key={title}
        //disabled={showData ? false : true}
      />
    </div>
  );
}

export default MyEditorMrm;
