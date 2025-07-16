import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  Grid,
  Divider,
} from "@material-ui/core";
import { ReactComponent as DeleteIcon } from "../../assets/documentControl/Delete.svg";
import { ReactComponent as EditIcon } from "../../assets/icons/EditLineIcon.svg";
import { ReactComponent as AddIcon } from "../../assets/icons/SquareAddIcon.svg";
import useStyles from "./styles";
// import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { FaCheckCircle } from "react-icons/fa";
// import AddIcon from "@material-ui/icons/Add";
import axios from "../../apis/axios.global";
import { useRecoilValue } from "recoil";
import { orgFormData } from "../../recoil/atom";

import type { RadioChangeEvent } from "antd";
import { Radio, Space, Tabs } from "antd";

// System-configuration component imports

import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";

import useSystemStyles from "./styles";
import tabsStyles from "./styles";
import { useRecoilState } from "recoil";
// import { orgFormData } from "../../recoil/atom";
import DynamicFormFields from "../DynamicFormFields";
import { color } from "highcharts";
type Props = {
  isEdit: any;
};

interface BusinessType {
  id: number;
  name: string;
  businesses: Business[];
  organizationId: string;
  createdBy: string;
  //used to change icons
  isSubmitted: boolean;
  isEdit: boolean;
  //used for icon functionality(post/put)
  isFirstSubmit: boolean;
}
interface Business {
  id: number;
  name: string;
  organizationId?: string;
  isSubmitted?: boolean;
  isEdit?: boolean;
  createdBy?: string;
  isFirstSubmit?: boolean;
}

interface FunctionsType {
  id: number;
  name: string;
  organizationId: string;
  createdBy: string;
  //used to change icons
  isSubmitted: boolean;
  isEdit: boolean;
  //used for icon functionality(post/put)
  isFirstSubmit: boolean;
}

function BusinessAndFunctions({ isEdit }: Props) {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [functionTypes, setFunctionTypes] = useState<FunctionsType[]>([]);
  const orgData = useRecoilValue(orgFormData);
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const classes = useStyles();
  const [business, setBusiness] = useState<Business[]>([]);

  const [tabPosition, setTabPosition] = useState<any>("left");

  // Assign "orgId" from sessionStorage if it exists
  // Otherwise it assigns the value of orgData.organizationId or orgData.id if either exists
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  useEffect(() => {
    getAllBusinessTypes();
    getBusinesses();
    getAllFunctions();
    if (businessTypes.length === 0) {
      handleAddBusinessType();
    }
    if (business.length === 0) {
      handleAddBusiness();
    }
  }, []);

  //  Create empty businessTypes, business and functions fields
  const handleAddBusinessType = async () => {
    // Create a new business type object
    const newBusinessType: BusinessType = {
      id: businessTypes.length + 1,
      name: "",
      businesses: [],
      organizationId: "",
      createdBy: "",
      isSubmitted: true,
      isEdit: false,
      isFirstSubmit: true,
    };

    setBusinessTypes([...businessTypes, newBusinessType]);
  };
  const handleAddBusiness = async () => {
    // Create a new business type object
    const newBusiness: Business = {
      id: business.length + 1,
      name: "",
      organizationId: "",
      createdBy: "",
      isSubmitted: true,
      isEdit: false,
      isFirstSubmit: true,
      // isSubmit: true,
    };

    setBusiness([...business, newBusiness]);
  };

  // const handleAddBusiness = () => {
  //   const updatedBusinessTypes = Business.map((type) => {
  //     //  if (type.id === businessTypeId) {
  //     const newBusiness: Business = {
  //       id: type.businesses.length + 1,
  //       name: "",
  //       isSubmitted: true,
  //       isEdit: false,
  //     };
  //     return {
  //       ...type,
  //       businesses: [...type.businesses, newBusiness],
  //     };
  //     // }
  //     return type;
  //   });

  //   setBusinessTypes(updatedBusinessTypes);
  // };

  const handleAddFunction = async () => {
    // Create a new Function type object
    const newFunction: FunctionsType = {
      id: functionTypes.length + 1,
      name: "",
      organizationId: "",
      createdBy: "",
      isSubmitted: true,
      isEdit: false,
      isFirstSubmit: true,
    };
    setFunctionTypes([...functionTypes, newFunction]);
  };

  // Create all businessTypes, business and functions

  // const handleBusinessSubmit = async (
  //   businessTypeId: number,
  //   businessId: number,
  //   businessName: string
  // ) => {
  //   let businessValue = {
  //     name: businessName,
  //     createdBy: userDetails.userName,
  //     organizationId: organizationId,
  //   };
  //   try {
  //     const response = await axios.post(
  //       `/api/business/createBusinessForBusinessType`,
  //       businessValue
  //     );
  //     const returnedId = response.data.id;
  //     const updatedBusinessTypes = businessTypes.map((type) => {
  //       // if (type.id === businessTypeId) {
  //       const updatedBusinesses = type.businesses.map((business) => {
  //         if (business.id === businessId) {
  //           return {
  //             ...business,
  //             isSubmitted: false,
  //             isEdit: true,
  //           };
  //         }
  //         return business;
  //       });
  //       return {
  //         ...type,
  //         businesses: updatedBusinesses,
  //       };
  //       // }
  //       return type;
  //     });

  //     setBusinessTypes(updatedBusinessTypes);
  //   } catch (error) {
  //     console.log("Error submitting business:", error);
  //   }
  // };

  const handleBusinessTypeSubmit = async (businessTypeName: string) => {
    let businessType = {
      name: businessTypeName,
      createdBy: userDetails.userName,
      organizationId: organizationId,
    };

    try {
      const response = await axios.post(
        `/api/business/createBusinessType`,
        businessType
      );
      const id = response.data.businesstypeid;
      const updatedBusinessTypes = businessTypes.map((type) => {
        if (type.name === businessTypeName) {
          const newBusiness: Business = {
            id: id,
            name: "",
            organizationId: organizationId,
            isSubmitted: true,
            isEdit: false,
          };
          return {
            ...type,
            id: id,
            isSubmitted: false,
            isEdit: true,
            isFirstSubmit: false,
            businesses: [...type.businesses, newBusiness],
          };
        }
        return type;
      });

      setBusinessTypes(updatedBusinessTypes);
    } catch (error) {
      // console.error("Error:", error);
    }
  };

  const handleBusinessSubmit = async (businessName: string) => {
    let data = {
      name: businessName,
      createdBy: userDetails.userName,
      organizationId: organizationId,
    };
    try {
      const response = await axios.post(
        `/api/business/createBusinessForBusinessType`,
        data
      );
      // console.log("response", business, response.data);
      const id = response.data.businessid;
      const updatedBusiness = business.map((type) => {
        if (type.name === businessName) {
          return {
            ...type,
            id: id,
            isSubmitted: false,
            isEdit: true,
            isFirstSubmit: false,
          };
        }
        return type;
      });

      setBusiness(updatedBusiness);
    } catch (error) {
      // console.error("Error:", error);
    }
  };
  const handleFunctionTypeSubmit = async (functionTypeName: string) => {
    // Provide a default value of an empty object if null
    let functiontype = {
      name: functionTypeName,
      createdBy: userDetails.userName,
      organizationId: organizationId,
    };
    try {
      const response = await axios.post(
        `/api/business/createFunction`,
        functiontype
      );
      const returnedId = response.data.funid;
      // Use the returnedId as needed
      const updatedFunctionTypes = functionTypes.map((type) => {
        if (type.name === functionTypeName) {
          return {
            ...type,
            isSubmitted: false,
            isEdit: true,
            isFirstSubmit: false,
          };
        }
        return type;
      });

      setFunctionTypes(updatedFunctionTypes);
      getAllFunctions();
    } catch (error) {
      // Handle any error that occurred during the request
      // console.error("Error:", error);
    }
  };

  //  Read all businessTypes, business and functions
  const getAllBusinessTypes = async () => {
    try {
      const response = await axios.get(
        `/api/business/getAllBusinessTypes/${organizationId}`
      );
      const businessTypes = response.data;
      // Fetch businesses for each business type
      const businessTypePromises = businessTypes.map(
        async (type: BusinessType) => {
          // const businesses = await getBusinesses(type.id); // Call getBusinesses with type.id
          // type.businesses = businesses;
          return type; // async function returns the updated business type
        }
      );
      // The array of async functions generated is passed to Promise.all() to wait for all the promises to resolve
      const updatedBusinessTypes = await Promise.all(businessTypePromises);
      setBusinessTypes(updatedBusinessTypes);
    } catch (error) {
      // console.error("Error:", error);
    }
  };

  const getAllFunctions = async () => {
    try {
      const response = await axios.get(
        `/api/business/getAllFunctionsByOrgId/${organizationId}`
      );
      const functionsResult = response.data;
      setFunctionTypes(functionsResult);
    } catch (error) {
      // console.error("Error:", error);
    }
  };

  const getBusinesses = async () => {
    try {
      const response = await axios.get(
        `/api/business/getAllBusinesssByOrgId/${organizationId}`
      );
      // console.log("responseBusiness", response.data);
      const data = response.data
        // .filter((business: any) => business.businessTypeId === businessTypeId)
        .map((business: any) => ({
          id: business.id,
          name: business.name,
          isSubmit: false,
          isEdit: true,
        }));
      setBusiness(data);
    } catch (error) {
      // console.error("Error:", error);
      return [];
    }
  };

  // update businessTypes, business and functions

  const handleEditBusinessType = async (
    businessTypeId: number,
    businessTypeName: string
  ) => {
    try {
      const response = await axios.put(
        `/api/business/updateBusinessType/${businessTypeId}`,
        {
          name: businessTypeName,
        }
      );

      const updatedBusinessTypes = businessTypes.map((type) => {
        if (type.id === businessTypeId) {
          return {
            ...type,
            name: businessTypeName,
            isEdit: true,
            isSubmitted: false,
            isFirstSubmit: false,
          };
        }
        return type;
      });

      setBusinessTypes(updatedBusinessTypes);
    } catch (error) {
      // console.error("Error:", error);
    }
  };

  const handleEditBusiness = async (
    businessId: number,
    businessName: string
  ) => {
    // console.log("busid", businessId);
    let singleBusiness = {
      name: businessName,
      updatedBy: userDetails.userName,
    };
    try {
      const response = await axios.put(
        `api/business/updateBusiness/${businessId}`,
        singleBusiness
      );

      const updatedBusiness = business.map((type) => {
        if (type.id === businessId) {
          return {
            ...type,
            name: businessName,
            isEdit: true,
            isSubmitted: false,
            isFirstSubmit: false,
          };
        }
        return type;
      });

      setBusiness(updatedBusiness);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // const handleEditBusiness = async (
  //   businessTypeId: number,
  //   businessId: number,
  //   businessName: string
  // ) => {
  //   let singleBusiness = {
  //     name: businessName,
  //     createdBy: userDetails.userName,
  //   };
  //   try {
  //     const response = await axios.put(
  //       `/api/business/updateBusiness/${businessId}`,
  //       singleBusiness
  //     );
  //     const updatedBusinessTypes = businessTypes.map((type) => {
  //       if (type.id === businessTypeId) {
  //         const updatedBusinesses = type.businesses.map((business) => {
  //           if (business.id === businessId) {
  //             return {
  //               ...business,
  //               isEdit: false,
  //               isSubmitted: true,
  //             };
  //           }
  //           return business;
  //         });
  //         return {
  //           ...type,
  //           businesses: updatedBusinesses,
  //         };
  //       }
  //       return type;
  //     });

  //     setBusinessTypes(updatedBusinessTypes);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleEditFunctionType = async (
    functionTypeId: number,
    functionTypeName: string
  ) => {
    try {
      const response = await axios.put(
        `/api/business/updateFunctionById/${functionTypeId}`,
        {
          name: functionTypeName,
        }
      );

      const updatedFunctionTypes = functionTypes.map((type) => {
        if (type.id === functionTypeId) {
          return {
            ...type,
            name: functionTypeName,
            isEdit: true,
            isSubmitted: false,
            isFirstSubmit: false,
          };
        }
        return type;
      });

      setFunctionTypes(updatedFunctionTypes);
    } catch (error) {
      // console.error("Error:", error);
    }
  };

  //  Delete businessTypes, business and functions
  const handleDeleteBusinessType = async (businessTypeId: number) => {
    try {
      await axios.delete(
        `/api/business/deleteBusinessTypeById/${businessTypeId}`
      );
      const updatedBusinessTypes = businessTypes.filter(
        (type) => type.id !== businessTypeId
      );
      setBusinessTypes(updatedBusinessTypes);
    } catch (error) {
      // console.error("Error:", error);
    }
  };

  // const handleDeleteBusiness = async (
  //   businessTypeId: number,
  //   businessId: number
  // ) => {
  //   try {
  //     const response = await axios.delete(
  //       `/api/business/deleteBusinessById/${businessId}`
  //     );
  //     const updatedBusinessTypes = businessTypes.map((type) => {
  //       if (type.id === businessTypeId) {
  //         const updatedBusinesses = type.businesses.filter(
  //           (business) => business.id !== businessId
  //         );
  //         return {
  //           ...type,
  //           businesses: updatedBusinesses,
  //         };
  //       }
  //       return type;
  //     });

  //     setBusinessTypes(updatedBusinessTypes);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleDeleteBusiness = async (businessId: number) => {
    try {
      await axios.delete(`/api/business/deleteBusinessById/${businessId}`);
      const updatedBusiness = business.filter((type) => type.id !== businessId);
      setBusiness(updatedBusiness);
    } catch (error) {
      // console.error("Error:", error);
    }
  };

  const handleDeleteFunctionType = async (functionTypeId: number) => {
    try {
      await axios.delete(`/api/business/deleteFunctionById/${functionTypeId}`);

      const updatedFunctionTypes = functionTypes.filter(
        (type) => type.id !== functionTypeId
      );
      setFunctionTypes(updatedFunctionTypes);
      getAllFunctions();
    } catch (error) {
      // console.error("Error:", error);
    }
  };

  // handle text onChange and sets the e.targe.value
  const handleBusinessTypeNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    businessTypeId: number
  ) => {
    const updatedBusinessTypes = businessTypes.map((type) => {
      if (type.id === businessTypeId) {
        return {
          ...type,
          name: event.target.value,
        };
      }
      return type;
    });

    setBusinessTypes(updatedBusinessTypes);
  };

  const handleBusinessNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    businessId: number
  ) => {
    const updatedBusiness = business.map((type) => {
      if (type.id === businessId) {
        return {
          ...type,
          name: event.target.value,
        };
      }
      return type;
    });

    setBusiness(updatedBusiness);
  };

  // const handleBusinessNameChange = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   businessTypeId: number,
  //   businessId: number
  // ) => {
  //   const updatedBusinessTypes = businessTypes.map((type) => {
  //     if (type.id === businessTypeId) {
  //       const updatedBusinesses = type.businesses.map((business) => {
  //         if (business.id === businessId) {
  //           return {
  //             ...business,
  //             name: event.target.value,
  //           };
  //         }
  //         return business;
  //       });
  //       return {
  //         ...type,
  //         businesses: updatedBusinesses,
  //       };
  //     }
  //     return type;
  //   });

  //   setBusinessTypes(updatedBusinessTypes);
  // };

  const handleFunctionTypeNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    functionTypeId: number
  ) => {
    const updatedFunctionTypes = functionTypes.map((type) => {
      if (type.id === functionTypeId) {
        return {
          ...type,
          name: event.target.value,
        };
      }
      return type;
    });

    setFunctionTypes(updatedFunctionTypes);
  };

  // change field status either allow to edit or allow to put the field value
  const handleChangeIcon = async (businessId: number) => {
    const updatedBusiness = business.map((type) => {
      if (type.id === businessId) {
        return {
          ...type,
          isEdit: false,
          isSubmitted: true,
          isFirstSubmit: false,
        };
      }
      return type;
    });

    setBusiness(updatedBusiness);
  };

  const handleChangeTypeIcon = async (businessTypeId: number) => {
    const updatedBusinessTypes = businessTypes.map((type) => {
      if (type.id === businessTypeId) {
        return {
          ...type,
          isEdit: false,
          isSubmitted: true,
          isFirstSubmit: false,
        };
      }
      return type;
    });

    setBusinessTypes(updatedBusinessTypes);
  };

  const handleChangeFunctionIcon = async (functionTypeId: number) => {
    const updatedFunctionTypes = functionTypes.map((type) => {
      if (type.id === functionTypeId) {
        return {
          ...type,
          isEdit: false,
          isSubmitted: true,
        };
      }
      return type;
    });

    setFunctionTypes(updatedFunctionTypes);
  };

  // Initialize with a default business type
  if (businessTypes.length === 0) {
    handleAddBusinessType();
  }

  const [activeTab, setActiveTab] = useState("1");

  const handleTabChange = (key: any) => {
    setActiveTab(key);
  };

  // System-cofiguration component functions

  const [formData, setFormData] = useRecoilState(orgFormData);
  const classesSystem = useSystemStyles();
  const classestab = tabsStyles();
  const handleChange = (e: any) => {
    //
    const itemKey = e.currentTarget.getAttribute("data-key");
    // console.log(itemKey);
    const item = financialYear.find((val) => val.id === Number(itemKey));
    // console.log("item", item);
    if (e.target.name === "fiscalYearQuarters") {
      setFormData({
        ...formData,
        fiscalYearQuarters: e.target.value,
      });
    }
    if (e.target.name === "auditYear") {
      setFormData({
        ...formData,
        auditYear: e.target.value,
        fiscalYearFormat: item?.label,
      });
    }

    if (e.target.name === "fiscalYearFormat") {
      setFormData({
        ...formData,
        fiscalYearFormat: e.target.value,
      });
    }
  };
  // console.log("formData>>>>>>>", formData);
  // console.log("for:::::", formData.fiscalYearQuarters);
  const currentYear = new Date().getFullYear();

  // const financialYear = [

  //   { id: 0, label: "YYYY", value: currentYear.toString() },
  //   {
  //     id: 1,
  //     label: "YY-YY+1",
  //     value: `${currentYear.toString().slice(-2)}-${(currentYear + 1)
  //       .toString()
  //       .slice(-2)}`,
  //   },
  //   {
  //     id: 2,
  //     label: "YYYY-YY+1",
  //     value: `${currentYear.toString()}-${(currentYear + 1)
  //       .toString()
  //       .slice(-2)}`,
  //   },
  //   {
  //     id: 3,
  //     label: "YY+1",
  //     value: `${(currentYear + 1).toString().slice(-2)}`,
  //   },
  // ];
  interface FinancialYear {
    id: number;
    label: string;
    value: string;
  }

  let financialYear: FinancialYear[] = [];

  if (formData.fiscalYearQuarters === "Jan - Dec") {
    financialYear.push({
      id: 0,
      label: "YYYY",
      value: currentYear.toString(),
    });
  } else {
    financialYear.push(
      {
        id: 0,
        label: "YY-YY+1",
        value: `${currentYear.toString().slice(-2)}-${(currentYear + 1)
          .toString()
          .slice(-2)}`,
      },
      {
        id: 1,
        label: "YYYY-YY+1",
        value: `${currentYear.toString()}-${(currentYear + 1)
          .toString()
          .slice(-2)}`,
      },
      {
        id: 2,
        label: "YY+1",
        value: `${(currentYear + 1).toString().slice(-2)}`,
      }
    );
  }

  const [options, setOptions] = useState<any>([]);
  const { TabPane } = Tabs;

  //label

  const [inputValue, setInputValue] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const handleIconClick = () => {
    setIsEditMode(!isEditMode);
  };

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  return (
    <>
      <div
        className={classestab.tabsWrapper}
        //  style={{display:"flex"}}
      >
        <Tabs
          tabPosition="left"
          defaultActiveKey="1"
          type="card"
          style={{ marginTop: "20px" }}
        >
          <TabPane tab="Busines Type" key="1">
            <form autoComplete="off" className={classes.form}>
              <Grid container style={{ padding: 0 }}>
                <div style={{ display: "flex", gap: "150px" }}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Business Types</strong>
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      variant="contained"
                      onClick={handleAddBusinessType}
                      style={{
                        color: "#0E497A",
                        backgroundColor: "#ffffff",
                        // padding: "18px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "medium",
                        // marginTop: "20px",
                        width: "200px",
                      }}
                      startIcon={<AddIcon />}
                    >
                      Add Business Type
                    </Button>
                  </Grid>
                </div>
              </Grid>

              <div>
                {businessTypes.map((type, typeIndex) => (
                  <div
                    key={type.id}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      paddingTop: "20px",
                    }}
                  >
                    <Grid item sm={12} md={4} alignItems="center">
                      <Grid
                        item
                        md={12}
                        className={classes.formBox}
                        style={{ display: "flex" }}
                      >
                        <TextField
                          placeholder="Business Type"
                          variant="outlined"
                          value={type.name}
                          // size="small"
                          style={{ width: "80%" }}
                          // fullWidth
                          disabled={
                            !type.isSubmitted ||
                            (type.isSubmitted && type.isEdit)
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleBusinessTypeNameChange(e, type.id)
                          }
                          InputProps={{
                            style: {
                              fontSize: "14px",
                              height: "50px",
                              color: "black",
                            },
                            endAdornment: (
                              <>
                                {!type.isSubmitted ||
                                (type.isSubmitted && type.isEdit) ? (
                                  <IconButton
                                    onClick={() => {
                                      handleChangeTypeIcon(type.id);
                                    }}
                                  >
                                    <EditIcon width={24} height={24} />
                                  </IconButton>
                                ) : (
                                  <IconButton
                                    onClick={() =>
                                      !type.isFirstSubmit
                                        ? handleEditBusinessType(
                                            type.id,
                                            type.name
                                          )
                                        : handleBusinessTypeSubmit(type.name)
                                    }
                                  >
                                    <FaCheckCircle width={24} height={24} />
                                  </IconButton>
                                )}
                              </>
                            ),
                          }}
                          inputProps={{
                            maxLength: 25,
                            style: { fontSize: "14px", height: "50px" },
                            "data-testid": "organization-name",
                          }}
                        />
                        <IconButton
                          onClick={() => handleDeleteBusinessType(type.id)}
                        >
                          <DeleteIcon width={24} height={24} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </div>
                ))}
              </div>
              <Grid
                container
                spacing={2}
                alignItems="center"
                justifyContent="flex-start"
              >
                {/* <Grid item xs={2}></Grid> */}
              </Grid>
            </form>
          </TabPane>
          <TabPane tab="Business" key="2">
            <form autoComplete="off" className={classes.form}>
              <Grid container style={{ padding: 0 }}>
                <div style={{ display: "flex", gap: "250px" }}>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>Business</strong>
                  </Grid>

                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      onClick={handleAddBusiness}
                      style={{
                        color: "#0E497A",
                        backgroundColor: "#ffffff",
                        // padding: "18px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "medium",
                        // marginTop: "20px",
                        width: "150px",
                      }}
                      startIcon={<AddIcon />}
                    >
                      Add Business
                    </Button>
                  </Grid>
                </div>
              </Grid>

              <div>
                {business.map((type, typeIndex) => (
                  <div
                    key={type.id}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      paddingTop: "20px",
                    }}
                  >
                    <Grid item sm={12} md={4} alignItems="center">
                      <Grid
                        item
                        md={12}
                        className={classes.formBox}
                        style={{ display: "flex" }}
                      >
                        <TextField
                          placeholder="Business"
                          variant="outlined"
                          value={type.name}
                          // size="small"
                          style={{ width: "80%" }}
                          // fullWidth
                          disabled={
                            !type.isSubmitted ||
                            (type.isSubmitted && type.isEdit)
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleBusinessNameChange(e, type.id)
                          }
                          InputProps={{
                            style: {
                              fontSize: "14px",
                              height: "50px",
                              color: "black",
                            },
                            endAdornment: (
                              <>
                                {!type.isSubmitted ||
                                (type.isSubmitted && type.isEdit) ? (
                                  <IconButton
                                    onClick={() => {
                                      handleChangeIcon(type.id);
                                    }}
                                  >
                                    <EditIcon width={24} height={24} />
                                  </IconButton>
                                ) : (
                                  <IconButton
                                    onClick={() =>
                                      !type.isFirstSubmit
                                        ? handleEditBusiness(type.id, type.name)
                                        : handleBusinessSubmit(type.name)
                                    }
                                  >
                                    <FaCheckCircle width={24} height={24} />
                                  </IconButton>
                                )}
                              </>
                            ),
                          }}
                          inputProps={{
                            maxLength: 25,
                            style: { fontSize: "14px", height: "50px" },
                            "data-testid": "organization-name",
                          }}
                        />
                        <IconButton
                          onClick={() => handleDeleteBusiness(type.id)}
                        >
                          <DeleteIcon width={24} height={24} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </div>
                ))}
              </div>
            </form>
          </TabPane>

          <TabPane tab="Fiscal Year" key="3">
            <div style={{ margin: "10px 0px 0px 30px" }}>
              <div>
                <Grid
                  item
                  sm={12}
                  md={12}
                  className={classesSystem.formTextPadding}
                >
                  <strong>Fiscal Year Period</strong>
                </Grid>
                <Grid item sm={6} md={12} className={classesSystem.formBox}>
                  <FormControl
                    variant="outlined"
                    className={classesSystem.formSelect}
                  >
                    <Select
                      // label="Fiscal Year Period"
                      value={formData.fiscalYearQuarters}
                      onChange={handleChange}
                      name="fiscalYearQuarters"
                      data-testid="fiscal-year-quarters-parent"
                      required
                      style={{
                        height: "50px",
                        width: "400px",
                        marginRight: "-12px",
                      }}
                    >
                      <MenuItem
                        data-testid="fiscal-year-quarters-child"
                        value="Jan - Dec"
                      >
                        Jan - Dec
                      </MenuItem>
                      <MenuItem value="April - Mar">April - Mar</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: "10px",
                  }}
                >
                  <div>
                    <Grid
                      item
                      sm={12}
                      md={12}
                      className={classesSystem.formTextPadding}
                    >
                      <strong>Fiscal Year Format</strong>
                    </Grid>
                  </div>

                  <div style={{ paddingTop: "10px" }}>
                    {formData.auditYear ? `(${formData.auditYear})` : ""}
                  </div>
                </div>

                <Grid item sm={6} md={12} className={classesSystem.formBox}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100% ",
                    }}
                  >
                    <FormControl
                      variant="outlined"
                      className={classesSystem.formSelect}
                    >
                      {/* <InputLabel>Fiscal Year Format</InputLabel> */}
                      <Select
                        // label="Fiscal Year Format"
                        value={formData.auditYear}
                        onChange={(event: any) => {
                          handleChange(event);
                          // setYear(event.target.value);
                        }}
                        name="auditYear"
                        data-testid="auditing-year-parent"
                        required
                        style={{ height: "50px", width: "400px" }}
                      >
                        {financialYear.map((item: any) => (
                          <MenuItem
                            data-key={item.id}
                            key={item.id}
                            data-testid="auditing-year-child"
                            value={item.value}
                          >
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {/* <div style={{ marginLeft: "20px", marginTop: "5px" }}>
                      {formData.auditYear ? `(${formData.auditYear})` : ""}
                    </div> */}
                  </div>
                </Grid>
              </div>
            </div>
          </TabPane>
          <TabPane tab="System Type" key="4">
            <div style={{ margin: "20px 0px 0px 30px" }}>
              <Grid
                item
                sm={12}
                md={12}
                className={classesSystem.formTextPadding}
              >
                <strong>System Type</strong>
              </Grid>
              <Grid item xs={12} md={5}>
                <DynamicFormFields
                  data={formData}
                  setData={setFormData}
                  name="systemType"
                  keyName="name"
                  colorPalette={true}
                ></DynamicFormFields>
              </Grid>
            </div>
          </TabPane>
          <TabPane tab="Entity Type" key="5">
            <div style={{ margin: "0px 0px 0px 30px" }}>
              <Grid
                item
                sm={12}
                md={12}
                className={classesSystem.formTextPadding}
              >
                <strong>Label</strong>
              </Grid>
              <Grid item xs={12} md={5}>
                <div>
                  <TextField
                    placeholder="Label"
                    variant="outlined"
                    value={inputValue}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                    style={{ width: "310px", height: "50px", color: "black" }}
                    InputProps={{
                      style: {
                        color: "black",
                      },
                      endAdornment: (
                        <>
                          {isEditMode ? (
                            <FaCheckCircle
                              onClick={handleIconClick}
                              style={{
                                cursor: "pointer",
                                marginLeft: "5px",
                                color: "gray",
                              }}
                            />
                          ) : (
                            <EditIcon
                              style={{
                                cursor: "pointer",
                                marginLeft: "5px",
                                color: "gray",
                              }}
                              onClick={handleIconClick}
                            />
                          )}
                        </>
                      ),
                    }}
                  ></TextField>
                </div>
              </Grid>
            </div>

            <div style={{ margin: "20px 0px 0px 30px" }}>
              <Grid
                item
                sm={12}
                md={12}
                className={classesSystem.formTextPadding}
              >
                <strong>Entity Type</strong>
              </Grid>
              <Grid item xs={6} style={{ textAlign: "right" }}>
                <strong>Default</strong>
                
              </Grid>
              <Grid item xs={12} md={5}>
                <DynamicFormFields
                  data={formData}
                  setData={setFormData}
                  name="entityType"
                  keyName="name"
                  fixedValue=""
                  isEdit={isEdit}
                  check={true}
                />
              </Grid>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </>
  );
}

export default BusinessAndFunctions;
