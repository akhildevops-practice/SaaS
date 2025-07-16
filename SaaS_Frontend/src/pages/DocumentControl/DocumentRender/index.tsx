import DocumentCreationWizard from "components/Document/DocumentCreateModal";
import { useNavigate } from "react-router-dom";

const CreateModalPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back when Dialog closes
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <DocumentCreationWizard open={true} onClose={handleClose} />
    </div>
  );
};

export default CreateModalPage;
