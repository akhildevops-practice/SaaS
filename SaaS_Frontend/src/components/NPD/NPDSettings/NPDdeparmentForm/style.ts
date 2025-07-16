import { makeStyles } from "@material-ui/core/styles";

const useStyles: any = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  descriptionLabelStyle: {
    "& .ant-descriptions-item-label": {
      color: "#003566 !important",
      fontWeight: "bold",
      letterSpacing: "0.8px",

      // Add any other styles you want to apply to the label inside Descriptions.Item
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the label inside Form.Item
    },
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
  },
  formItem: {
    marginBottom: 0,
  },
}));

export default useStyles;
