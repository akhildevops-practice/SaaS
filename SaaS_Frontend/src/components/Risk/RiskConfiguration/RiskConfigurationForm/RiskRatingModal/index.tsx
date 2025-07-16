import { Box, Typography } from "@material-ui/core";
import { Input, Modal } from "antd";
import PrimaryButton from "components/ReusableComponents/PrimaryButton";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";

type Props = {
  visible: any;
  value: any;
  onChange: any;
  onCancel: any;
  onAdd: any;
};

const RiskRatingModal = ({
  visible,
  value,
  onChange,
  onCancel,
  onAdd,
}: Props) => (
  <Modal open={visible} onCancel={onCancel} footer={null} centered width={480}>
    <Box textAlign="center" mb={3}>
      <Typography variant="h6" style={{ fontWeight: 600 }}>
        Add New Risk Level
      </Typography>
    </Box>
    <Box display="flex" gridGap={8} mb={2}>
      <Box flex={1}>
        <Typography variant="subtitle1" gutterBottom>
          Min Value
        </Typography>
        <Input
          type="number"
          value={value?.min}
          onChange={(e) => onChange("min", e.target.value)}
          placeholder="e.g. 1"
          style={{ borderRadius: 6 }}
        />
      </Box>
      <Box flex={1}>
        <Typography variant="subtitle1" gutterBottom>
          Max Value
        </Typography>
        <Input
          type="number"
          value={value?.max}
          onChange={(e) => onChange("max", e.target.value)}
          placeholder="e.g. 4"
          style={{ borderRadius: 6 }}
        />
      </Box>
    </Box>
    <Box mb={2}>
      <Typography variant="subtitle1" gutterBottom>
        Rating Description
      </Typography>
      <Input
        value={value?.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder="e.g. 1 – Very Low"
        style={{ borderRadius: 6 }}
      />
    </Box>
    <Box display="flex" justifyContent="flex-end" gridGap={8} mt={3}>
      <SecondaryButton onClick={onCancel} />
      <PrimaryButton onClick={onAdd} buttonText="Add Risk Level" />
    </Box>
  </Modal>
);

export default RiskRatingModal;
