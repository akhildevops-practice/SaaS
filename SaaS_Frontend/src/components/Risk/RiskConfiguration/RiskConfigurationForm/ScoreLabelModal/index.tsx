import { Box, Typography } from "@material-ui/core";
import { Input, Modal } from "antd";
import PrimaryButton from "components/ReusableComponents/PrimaryButton";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";

type Props = {
  visible?: any;
  title?: any;
  value?: any;
  description?: any;
  onChangeValue?: any;
  onChangeDescription?: any;
  onCancel?: any;
  onAdd?: any;
};

// Reusable modal for score + label based fields in risk configuration form
const ScoreLabelModal = ({
  visible,
  title,
  value,
  description,
  onChangeValue,
  onChangeDescription,
  onCancel,
  onAdd,
}: Props) => (
  <Modal open={visible} onCancel={onCancel} footer={null} centered width={480}>
    <Box textAlign="center" mb={3}>
      <Typography variant="h6" style={{ fontWeight: 600 }}>
        Add New {title}
      </Typography>
    </Box>
    <Box mb={2}>
      <Typography
        variant="subtitle1"
        style={{ fontWeight: 500, marginBottom: 6 }}
      >
        {title} Value
      </Typography>
      <Input
        type="number"
        size="large"
        style={{ borderRadius: 6 }}
        value={value}
        onChange={onChangeValue}
        placeholder={`Enter ${title.toLowerCase()}`}
      />
    </Box>
    <Box mb={2}>
      <Typography
        variant="subtitle1"
        style={{ fontWeight: 500, marginBottom: 6 }}
      >
        Description (Optional)
      </Typography>
      <Input.TextArea
        rows={4}
        style={{ borderRadius: 6 }}
        value={description}
        onChange={onChangeDescription}
        placeholder="Enter description"
      />
    </Box>
    <Box display="flex" justifyContent="flex-end" gridGap={8} mt={3}>
      <SecondaryButton onClick={onCancel} />
      <PrimaryButton onClick={onAdd} buttonText={`Add ${title}`} />
    </Box>
  </Modal>
);

export default ScoreLabelModal;
