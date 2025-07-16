import React from "react";
type Props = {
  data: any;
};
const TemplateComponent = ({ data }: Props) => {
  return (
    <>
      {console.log("data", data)}
      {data.status === "Delayed" ? (
        <span
          style={{
            color: "red",
            fontWeight: "bold",
            position: "relative",
            zIndex: 2,
          }}
        >
          Delayed: {data.text}
        </span>
      ) : (
        <span style={{ marginLeft: "40px" }}>{data.text}</span>
      )}
    </>
  );
};

export default TemplateComponent;
