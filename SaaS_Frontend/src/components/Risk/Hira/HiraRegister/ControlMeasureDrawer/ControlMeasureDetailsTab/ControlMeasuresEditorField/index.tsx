//react, reactrouter
import { useEffect, useState } from "react";

//styles
import useStyles from "./styles";

//thirdparty libs
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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
  comments?: any;
  setComments?: any;
};
function ControlMeasuresEditorField({ comments = "", setComments }: Props) {
  const [intitalData, setInititalData] = useState<string>("");
  const classes = useStyles();

  useEffect(() => {
    setInititalData(comments);
  }, [comments]);

  const handleChange = (event: any, editor: any) => {
    const data = editor.getData();
    setInititalData(data);
    setComments(data);
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

export default ControlMeasuresEditorField;
