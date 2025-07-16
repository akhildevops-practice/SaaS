import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import useStyles from "./styles";
import checkRoles from "../../../utils/checkRoles";
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
  readStatus: any;
  readMode: any;
};
function MyEditor({
  formData,
  setFormData,
  title,
  readStatus,
  readMode,
}: Props) {
  const [intitalData, setInititalData] = useState<any>("");
  const classes = useStyles();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const showData = isOrgAdmin || isMR;
  useEffect(() => {
    if (title === "description") {
      if (formData?.meetingDescription) {
        setInititalData(formData?.meetingDescription);
      }
    }
    if (title === "descriptionMrm") {
      if (formData?.minutesofMeeting) {
        setInititalData(formData?.minutesofMeeting);
      }
    }
    if (title === "minutesofMeeting") {
      if (formData?.minutesofMeeting) {
        setInititalData(formData?.minutesofMeeting);
      }
    }

    if (formData?.minutesofMeeting === "") {
      setInititalData("");
    }

    if (title === "mom") {
      if (formData?.meetingMOM) {
        setInititalData(formData?.meetingMOM);
      }
    }
  }, [
    formData?.meetingDescription,
    formData?.meetingMOM,
    formData?.minutesofMeeting,
    title,
  ]);

  const handleChange = (event: any, editor: any) => {
    const data = editor.getData();
    setInititalData(data);
    if (title === "mom") {
      setFormData({ ...formData, meetingMOM: data });
    } else if (title === "descriptionMrm") {
      setFormData({ ...formData, minutesofMeeting: data });
    } else {
      setFormData({ ...formData, meetingDescription: data });
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
        disabled={readStatus || readMode}
      />
    </div>
  );
}

export default MyEditor;
