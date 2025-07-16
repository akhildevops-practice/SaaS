import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import useStyles from "./styles";
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
  activity?: any;
  setActivity?: any;
  riskImpact?: any;
  setRiskImpact?: any;
};
function MyEditor({
  activity = "",
  setActivity,
  riskImpact = "",
  setRiskImpact,
}: Props) {
  const [intitalData, setInititalData] = useState<any>();
  const classes = useStyles();

  useEffect(() => {
    if (activity) {
      setInititalData(activity);
    } else if (riskImpact) {
      setInititalData(riskImpact);
    }
  }, [activity, riskImpact]);

  const handleChange = (event: any, editor: any) => {
    const data = editor.getData();
    setInititalData(data);
    if (setActivity) {
      setActivity(data);
    } else if (setRiskImpact) {
      setRiskImpact(data);
    }
  };
  return (
    <div className={classes.ckBox}>
      <CKEditor
        editor={ClassicEditor as any}
        config={editorConfig}
        data={intitalData}
        onChange={handleChange}
      />
    </div>
  );
}

export default MyEditor;
