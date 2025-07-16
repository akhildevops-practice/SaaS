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
  data: any;
  readMode:any;
};
function MyUpdateEditorMrm({ formData, setFormData, title, data,readMode }: Props) {
  const [intitalData, setInititalData] = useState<any>();
  const classes = useStyles();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const showData = isOrgAdmin || isMR;
  useEffect(() => {
    setInititalData(data?.minutesofMeeting);
  }, [formData?.meetingDescription, formData?.meetingMOM, title, data]);

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
        disabled={readMode}
      />
    </div>
  );
}

export default MyUpdateEditorMrm;
