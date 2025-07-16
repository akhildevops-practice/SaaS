import React, { useState } from "react";
import { TextField, Button, Grid, Box } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";

const options = [
  "equipment",
  "people",
  "locations",
  "dates",
  "references",
  "hira",
  "aspect",
  "systems",
  "clauses",
];

type Props = {
  searchText: any;
  topK: any;
  setIsFilterApplied: any;
  setFilters: any;
  setFilterModalOpen: any;
};

const DynamicForm = ({
  searchText,
  topK,
  setIsFilterApplied,
  setFilters,
  setFilterModalOpen,
}: Props) => {
  const [fields, setFields] = useState<any>([
    { selectedOption: null, text: "" },
  ]);

  const handleAddFields = () => {
    setFields([...fields, { selectedOption: null, text: "" }]);
  };

  const handleInputChange = (index: any, event: any) => {
    const values = [...fields];
    values[index][event.target.name] = event.target.value;
    setFields(values);
  };

  const handleOptionChange = (index: any, value: any) => {
    const values = [...fields];
    values[index].selectedOption = value;
    setFields(values);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log("Fields:", fields);

    const formattedOutput = fields.reduce((acc: any, field: any) => {
      if (field.selectedOption && field.text) {
        acc[field.selectedOption] = field.text;
      }
      return acc;
    }, {});

    // console.log('Formatted output:', [formattedOutput]);
    // const response = await axios.post(
    //     `${process.env.REACT_APP_PY_URL}/pyapi/search`,
    //     body
    //   );
    if (fields?.length) {
      setIsFilterApplied(true);
      setFilters(formattedOutput);
      setFilterModalOpen(false);
    } else {
      setIsFilterApplied(false);
      setFilters([]);
      setFilterModalOpen(false);
    }
  };

  const handleDeleteField = (index: any) => {
    const values = [...fields];
    values.splice(index, 1);
    setFields(values);
  };

  const handleReset = () => {
    setFields([{ selectedOption: null, text: "" }]);
  };

  const getAvailableOptions = (index: any) => {
    const selectedOptions = fields.map((field: any) => field.selectedOption);
    return options.filter(
      (option) =>
        !selectedOptions.includes(option) ||
        selectedOptions.indexOf(option) === index
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field: any, index: any) => (
        <Grid container spacing={2} key={index} alignItems="center">
          <Grid item xs={4}>
            <Autocomplete
              options={getAvailableOptions(index)}
              getOptionLabel={(option) => option}
              value={field.selectedOption}
              onChange={(event, newValue) =>
                handleOptionChange(index, newValue)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Entity"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Text"
              variant="outlined"
              name="text"
              value={field.text}
              onChange={(event) => handleInputChange(index, event)}
            />
          </Grid>
          <Grid item xs={2}>
            {index !== 0 && (
              <Box display="flex" alignItems="center">
                <Box
                  display="inline"
                  style={{
                    padding: "6px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "4px",
                    marginRight: "8px",
                  }}
                >
                  OR
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddFields}
                >
                  +
                </Button>
              </Box>
            )}
            {index === 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddFields}
              >
                +
              </Button>
            )}
          </Grid>
          <Grid item xs={2}>
            {index !== 0 && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDeleteField(index)}
              >
                -
              </Button>
            )}
          </Grid>
        </Grid>
      ))}
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        style={{ marginTop: "20px" }}
      >
        Submit
      </Button>
      <Button
        variant="contained"
        color="default"
        style={{ marginTop: "20px", marginLeft: "10px" }}
        onClick={handleReset}
      >
        Reset
      </Button>
    </form>
  );
};

export default DynamicForm;
