import {
  FormControl,
  Grid,
  Select,
  TextField,
  MenuItem,
  CircularProgress,
  debounce,
} from "@material-ui/core";
import useStyles from "./styles";
import AutoComplete from "components/AutoComplete";
import { useEffect, useState } from "react";
import axios from "apis/axios.global";
import checkRoles from "utils/checkRoles";
import { validateMasterNames } from "utils/validateInput";
import { useSnackbar } from "notistack";

type Props = {
  selectFieldData: any;
  isEdit: any;
  disableFormFields: any;
  formData: any;
  setFormData: any;
  buData: any;
  functionData: any;
  isLoading: boolean;
  selectedFieldData?: any;
  setSelectFieldData?: any;
  uploadedImage?: any;
  setUploadedImage?: any;
};

const locType = ["Internal", "Vendor", "Customer"];

function LocationForm({
  selectFieldData,
  isEdit,
  disableFormFields,
  formData,
  setFormData,
  buData,
  functionData,
  isLoading,
  selectedFieldData,
  setSelectFieldData,
  uploadedImage,
  setUploadedImage,
}: Props) {
  const classes = useStyles();
  const [userOptions, setUserOptions] = useState([]);
  const [functionOptions, setFunctionOptions] = useState([]);
  const [businessTypes, setBusinessTypes] = useState<any>([]);
  let typeAheadValue: string;
  let typeAheadType: string;
  const isMR = checkRoles("MR");
  const { enqueueSnackbar } = useSnackbar();

  const orgId = sessionStorage.getItem("orgId");

  useEffect(() => {
    // console.log("checklocation isEdit",
    // selectFieldData.businessTypes.filter(
    //   (item: any) => item.id === formData.businessTypeId
    // )?.[0]
    // );

    getAllBusinessTypes();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "locationName" || name === "locationId") {
      validateMasterNames(null, value, (error?: string) => {
        if (error) {
          enqueueSnackbar(`${error}`, { variant: "error" });
        } else {
          setFormData({
            ...formData,
            [name]: value,
          });
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const getSuggestionListUser = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchUser();
  };

  const debouncedSearchUser = debounce(() => {
    getUserOptions(typeAheadValue, typeAheadType);
  }, 50);

  const getUserOptions = async (value: any, type: string) => {
    await axios
      .get(
        `/api/documents/filerValue?searchLocation=&searchBusinessType=&searchEntity=&searchSystems=&searchDoctype=&searchUser=${value}`
      )
      .then((res) => {
        const ops = res?.data?.allUser?.map((obj: any) => ({
          id: obj.id,
          name: obj.username,
          avatar: obj.avatar,
          email: obj.email,
          username: obj.username,
        }));
        setUserOptions(ops);
      })
      .catch((err) => console.error(err));
  };

  const getSuggestionListFunction = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchFunction();
  };

  const debouncedSearchFunction = debounce(() => {
    getFunctionOptions(typeAheadValue, typeAheadType);
  }, 50);

  const getFunctionOptions = async (value: any, type: string) => {
    await axios
      .get(`/api/business/filterFunction?searchFunction=${value}`)
      .then((res) => {
        console.log("res.data", res.data.functions);
        const ops = res?.data?.functions?.map((obj: any) => ({
          id: obj.id,
          name: obj.name,
        }));
        setFunctionOptions(ops);
      })
      .catch((err) => console.error(err));
  };

  const getBusinesses = async (businessTypeId: number) => {
    try {
      const response = await axios.get(
        `/api/business/getAllBusinesssByOrgId/${orgId}`
      );
      const filteredBusinesses = response.data
        .filter((business: any) => business.businessTypeId === businessTypeId)
        .map((business: any) => ({
          id: business.id,
          name: business.name,
          isSubmit: false,
          isEdit: true,
        }));
      return filteredBusinesses;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };

  //  Read all businessTypes, business and functions
  const getAllBusinessTypes = async () => {
    try {
      const response = await axios.get(
        `/api/business/getAllBusinessTypes/${orgId}`
      );
      const businessTypes = response.data;
      // Fetch businesses for each business type
      // const businessTypePromises = businessTypes.map(async (type: any) => {
      //   const businesses = await getBusinesses(type.id); // Call getBusinesses with type.id
      //   type.businesses = businesses;
      //   return type; // async function returns the updated business type
      // });
      // // The array of async functions generated is passed to Promise.all() to wait for all the promises to resolve
      // const updatedBusinessTypes = await Promise.all(businessTypePromises);
      // setBusinessTypes(updatedBusinessTypes);
      setSelectFieldData({
        ...selectFieldData,
        businessTypes: businessTypes,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  return (
    <>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <form
          data-testid="technical-config-form"
          autoComplete="off"
          className={classes.form}
        >
          <Grid container>
            <Grid item sm={12} md={6}>
              <Grid container>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Unit Name*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <TextField
                    fullWidth
                    // label='Login URL'
                    name="locationName"
                    value={formData.locationName}
                    inputProps={{
                      "data-testid": "login-url",
                      maxLength: 100,
                    }}
                    variant="outlined"
                    onChange={handleChange}
                    size="small"
                    disabled={disableFormFields || isMR}
                  />
                </Grid>

                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Businesses*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <Select
                      value={formData?.business || []}
                      onChange={handleChange}
                      name="business"
                      data-testid="business"
                      multiple
                      disabled={disableFormFields || isMR}
                      required
                    >
                      {buData?.map((item: any) => {
                        return (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Unit Owner</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <AutoComplete
                    suggestionList={userOptions ? userOptions : []}
                    name=""
                    keyName="users"
                    labelKey="name"
                    formData={formData}
                    disabled={disableFormFields || isMR}
                    setFormData={setFormData}
                    getSuggestionList={getSuggestionListUser}
                    defaultValue={
                      formData?.users?.length ? formData?.users : []
                    }
                    type="RA"
                  />
                </Grid>

                <Grid item sm={12} md={8} className={classes.formTextPadding}>
                  <strong>Upload Location Logo:</strong>
                </Grid>

                <Grid item sm={12} md={8} className={classes.formBox}>
                  <div style={{ display: "flex" }}>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      style={{ marginLeft: "13px" }}
                    />
                    <div>
                      {uploadedImage && (
                        <img
                          src={URL.createObjectURL(uploadedImage)}
                          alt="Uploaded"
                          style={{
                            width: "60px",
                            height: "60px",
                            marginTop: "-37px",
                            marginLeft: "-30px",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={1}></Grid>
            <Grid item sm={12} md={5}>
              <Grid container>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Unit ID*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <TextField
                    fullWidth
                    name="locationId"
                    value={formData.locationId}
                    variant="outlined"
                    onChange={handleChange}
                    disabled={isMR || disableFormFields}
                    inputProps={{
                      maxLength: 3,
                    }}
                    size="small"
                  />
                </Grid>
                {/* New Grid item added */}
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Business Type</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  {/* Your new Grid content here */}
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <Select
                      key={Date.now()}
                      data-testid="business-type"
                      // onClick={() => console.log("clicked business type")}
                      value={
                        // isEdit
                        //   ? selectFieldData.businessTypes.filter(
                        //       (item: any) => item.id === formData.businessTypeId
                        //     )
                        //   :
                        formData.businessTypeId
                      }
                      onChange={handleChange}
                      disabled={disableFormFields || isMR}
                      name="businessTypeId"
                      // required
                      // disabled={
                      //   selectFieldData.businessTypes.length === 1 ||
                      //   disableFormFields ||
                      //   !isEdit
                      // }
                    >
                      {selectFieldData?.businessTypes.map((item: any) => {
                        return (
                          <MenuItem
                            key={item}
                            data-testid={`menu-${item.name}`}
                            // onClick={() => console.log("clicked menu item")}
                            value={item.id}
                          >
                            {item.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                {/* End of the new Grid item */}
                {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Functions*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}> */}
                  {/* <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <Select
                      value={formData?.functionId || []}
                      onChange={handleChange}
                      name="functionId"
                      data-testid="functionId"
                      multiple
                      disabled={disableFormFields}
                      required
                    >
                      {functionData?.map((item: any) => {
                        return (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl> */}
                  {/* <AutoComplete
                    suggestionList={functionOptions ? functionOptions : []}
                    name=""
                    keyName="functionId"
                    labelKey="name"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={disableFormFields || isMR}
                    getSuggestionList={getSuggestionListFunction}
                    defaultValue={
                      formData?.functionId?.length ? formData?.functionId : []
                    }
                    type="RA"
                  />
                </Grid> */}
              </Grid>
            </Grid>

            {/* <Grid item sm={12} md={6}>
              <Grid container></Grid>
            </Grid>
            <Grid item xs={12} md={1}></Grid>
            <Grid item sm={12} md={6}>
              <Grid container>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Description</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <TextField
                    fullWidth
                    name="description"
                    value={formData?.description}
                    variant="outlined"
                    onChange={handleChange}
                    disabled={disableFormFields}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid> */}
          </Grid>
        </form>
      )}
    </>
  );
}

{
  /* <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Unit Type*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <InputLabel>Unit Type</InputLabel>
                    <Select
                      label="Unit Type"
                      value={formData.locationType}
                      onChange={handleChange}
                      name="locationType"
                      data-testid="loc-type"
                      disabled={isEdit}
                      required
                    >
                      {locType.map((item: any, i: number) => {
                        return (
                          <MenuItem key={i} value={item}>
                            {item}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid> */
}
export default LocationForm;
