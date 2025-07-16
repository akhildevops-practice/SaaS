type Props = {
  record?: any;
  onOpenPopUp?: any;
};

const UserPreview = ({ record, onOpenPopUp }: Props) => {
  return (
    <div
      style={{
        border: "1px solid #d4d4d4",
        borderRadius: "5px",
        padding: "10px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* <strong>Type: </strong> {record?.type}
      <br /> */}
      <button onClick={onOpenPopUp}>PREVIEW</button>
    </div>
  );
};

export default UserPreview;
