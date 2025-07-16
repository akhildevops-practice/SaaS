import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import useStyles from "./styles";
import { useEffect, useState } from "react";
const editorConfig: any = {
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
  heading: {
    options: [
      { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
      { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
      { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
      { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
    ],
  },
  styles: {
    inline: [
      { element: "p", styles: { "margin-bottom": "1rem", "line-height": "1.6" } },
      { element: "ul, ol", styles: { "padding-left": "1.5rem" } },
      { element: "h1, h2, h3", styles: { "margin": "1.5rem 0" } },
    ],
  },
};

type Props = {
  comment?: any;
  setComment?: any;
  disabled?: any;
  
};
function CommentsEditor({ comment = "", setComment, disabled, }: Props) {
  const [intitalData, setInititalData] = useState<any>();
  const classes = useStyles();

  useEffect(() => {
    // console.log("check comment in editor", comment);
    if (comment) {
      setInititalData(comment);
      setComment(comment);
    }
  }, [comment]);

  const handleChange = (event: any, editor: any) => {
    const data = editor.getData();
    setInititalData(data);
    if (setComment) {
      setComment(data);
    }
  };
  return (
    <div className={classes.ckBox} >
      <CKEditor
        editor={ClassicEditor as any}
        config={editorConfig}
        data={intitalData}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}

export default CommentsEditor;
