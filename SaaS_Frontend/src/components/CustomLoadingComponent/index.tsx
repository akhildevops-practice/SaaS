import { CircularProgress } from "@material-ui/core";

type Props = {
  text: string
};

function CustomLoadingComponent({text}: Props) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20%",
        }}
      >
        <CircularProgress />
      </div>
      <h6 style={{ display: "flex", justifyContent: "center" }}>
        {text}
      </h6>
    </>
  );
}

export default CustomLoadingComponent;
