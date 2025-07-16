import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Modal,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Select } from "antd";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import { MdEdit } from 'react-icons/md';

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(3),
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
  },
  formContainer: {
    width: "60%",
    padding: theme.spacing(3),
    backgroundColor: "#fff",
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[3],
  },
  formControl: {
    marginBottom: theme.spacing(2),
    width: "100%",
  },
  subSection: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: theme.shadows[2],
    borderRadius: theme.spacing(1),
    backgroundColor: "#f9f9f9",
  },
  formRow: {
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  compactTextField: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submitButton: {
    marginBottom: theme.spacing(2),
    float: "right",
  },
  modalContent: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    backgroundColor: "white",
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[5],
    padding: theme.spacing(3),
  },
  modalTextField: {
    marginBottom: theme.spacing(2),
    width: "100%",
  },
}));

const { Option } = Select;

const openAIModels = [
  { value: "gpt-4-turbo", label: "gpt-4-turbo" },
  { value: "gpt-4o", label: "gpt-4o" },
  { value: "gpt-4o-mini", label: "gpt-4o-mini" },
  {value : "gpt-4-turbo-preview" , label : "gpt-4-turbo-preview"},
  {value : "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", label : "Llama 3.1 8B Instruct Turbo"},
  {value : "mistralai/Mixtral-8x7B-Instruct-v0.1", label : "Mixtral-8x7B Instruct (46.7B)"},
  {value : "mistralai/Mixtral-8x22B-Instruct-v0.1", label : "Mixtral-8x22B Instruct (141B)"},
  {value : "google/gemma-2-27b-it", label : "Google Gemma 2 27B"},
//   {value : "", label : ""},

];

const anthropicModels = [
  { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
  { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
  { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
];

type FormSectionProps = {
  featureName: any;
  model: any;
  prompt: any;
  client: any;
  onChange: any;
};

const FormSection = ({
  featureName,
  model,
  prompt,
  client,
  onChange,
}: FormSectionProps) => {
  const classes = useStyles();

  const handleModelChange = (value: string) => {
    onChange(featureName, "model", value);
  };

  const handlePromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onChange(featureName, "prompt", event.target.value);
  };

  const handleClientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(featureName, "client", event.target.value);
    // Clear the model field when the client changes
    onChange(featureName, "model", undefined);
  };

  const getFeatureName = (feature: string) => {
    if(feature === "DrawingMetadata") return "Drawing Metadata";
    else if(feature === "DrawingSummary") return "Drawing Summary";
    else return feature;
  }

  // Select models based on the selected client
  const modelOptions = client === "OpenAI" ? openAIModels : anthropicModels;

  return (
    <div className={classes.subSection}>
      <Typography variant="subtitle1" gutterBottom>
        {getFeatureName(featureName)} Configuration
      </Typography>
      <div className={classes.formRow}>
        <RadioGroup
          row
          value={client}
          onChange={handleClientChange}
          className={classes.formControl}
        >
          <FormControlLabel value="OpenAI" control={<Radio />} label="OpenAI" />
          <FormControlLabel
            value="Anthropic"
            control={<Radio />}
            label="Anthropic"
          />
        </RadioGroup>
        <Select
          className={classes.formControl}
          placeholder="Select Model"
          value={model}
          onChange={handleModelChange}
          style={{ width: "380px" }}
          disabled={featureName === "DrawingMetadata" || featureName === "DrawingSummary"}
        >
          {modelOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>
      <TextareaAutosize
        className={classes.compactTextField}
        minRows={3}
        placeholder="Enter your prompt"
        value={prompt}
        onChange={handlePromptChange}
      />
    </div>
  );
};

type Props = {
  formValues?: any;
  setFormValues?: any;
  apiKeys?: any;
  setApiKeys?: any;
};

const AIConfigComponent = ({
  formValues,
  setFormValues,
  apiKeys,
  setApiKeys,
}: Props) => {
  const classes = useStyles();
  //   const [formValues, setFormValues] = useState<any>({
  //     Summary: { model: undefined, prompt: "", client: "OpenAI" },
  //     MCQ: { model: undefined, prompt: "", client: "OpenAI" },
  //     Chat: { model: undefined, prompt: "", client: "OpenAI" },
  //     Template: { model: undefined, prompt: "", client: "OpenAI" },
  //   });

  const [open, setOpen] = useState(false);
  //   const [apiKeys, setApiKeys] = useState({
  //     OpenAI: "",
  //     Together: "",
  //     Anthropic: "",
  //   });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeys({
      ...apiKeys,
      [event.target.name]: event.target.value,
    });
  };

  const handleChange = (feature: string, field: string, value: string) => {
    setFormValues((prev: any) => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    const allData = {
      apiKeys: apiKeys,
      formValues: formValues,
    };

    console.log("All Data:", allData);
    // Here you can handle the submission, like sending it to an API
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.formContainer}>
        <Typography variant="h5" gutterBottom>
          AI Configuration
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleOpen}
          className={classes.submitButton}
          endIcon={<MdEdit />}
        >
          Secret Keys
        </Button>
        <Modal open={open} onClose={handleClose}>
          <div className={classes.modalContent}>
            <Typography variant="h6" gutterBottom>
              API Keys
            </Typography>
            <TextField
              label="OpenAI API Key"
              name="OpenAI"
              value={apiKeys.OpenAI}
              onChange={handleApiKeyChange}
              className={classes.modalTextField}
              variant="outlined"
            />
            <TextField
              label="Together API Key"
              name="Together"
              value={apiKeys.Together}
              onChange={handleApiKeyChange}
              className={classes.modalTextField}
              variant="outlined"
            />
            <TextField
              label="Anthropic API Key"
              name="Anthropic"
              value={apiKeys.Anthropic}
              onChange={handleApiKeyChange}
              className={classes.modalTextField}
              variant="outlined"
            />
            {/* <Button variant="contained" color="primary" onClick={handleClose}>
              Save
            </Button> */}
          </div>
        </Modal>
        <Box>
          {Object.keys(formValues).map((key) => (
            <FormSection
              key={key}
              featureName={key}
              model={formValues[key].model}
              prompt={formValues[key].prompt}
              client={formValues[key].client}
              onChange={handleChange}
            />
          ))}
        </Box>
        {/* <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          className={classes.submitButton}
        >
          Submit
        </Button> */}
      </Paper>
    </div>
  );
};

export default AIConfigComponent;
