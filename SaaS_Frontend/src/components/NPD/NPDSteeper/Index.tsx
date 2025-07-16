import Button from "@material-ui/core/Button";
import React, { useEffect, useState } from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import useStyles from "./styles";
import { useLocation, useNavigate } from "react-router-dom";
import { MdArrowBackIos } from "react-icons/md";
import { MdArrowForwardIos } from "react-icons/md";
import HeaderIndex from "./HeaderInfo/Index";
import DepartmentIndex from "./DepartmentInfo/Index";
import { useRecoilState } from "recoil";
import { npdFormData } from "recoil/atom";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import { useParams } from "react-router-dom";
// import AttachmentIndex from "./AttachmentInfo/Index";

const NPDSteeperIndex = () => {
  const steps = ["NPD Details", "Stake Holders"];
  const [activeStep, setActiveStep] = React.useState(0);
  const [formData, setFormData] = useRecoilState(npdFormData);
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const classes: any = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [read, setRead] = useState(false);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  useEffect(() => {
    const savedState = localStorage.getItem("readState");
    // console.log("savedState", savedState);
    if (savedState) {
      setRead(JSON.parse(savedState));
    } else {
      setRead(false);
    }
  }, []);
  useEffect(() => {
    if (id !== undefined && id !== "undefined") {
      handleFetchData(id);
    } else {
      setFormData({
        projectType: "",
        projectName: "",
        customer: [],
        supplier: [],
        sopDate: "",
        sopQuantity: "",
        escNumber: "",
        escRank: "",
        justification: "",
        meetingDate: "",
        partDetails: [
          {
            model: "",
            partName: "",
            densoPartNo: "",
            customer: "",
            date: "",
            orderNo: "",
            qty: "",
            remarks: "",
            productType: "",
          },
        ],
        departmentData: [
          {
            id: "66cc61a60d82c135b28021996",
            category: userDetail.organization?.realmName,
            stakeHolderName: userDetail.organization?.realmName,
            stakeHolderId:
              "66cc61a60d82c135b7c" + userDetail.organization?.realmName,
            departments: [
              {
                id: "cls9wubp10000ro7k567p4nm1",
                department: "",
                pic: [],
                npdConfigId: "",
              },
            ],
            isSelected: false,
          },
        ],
        attachFiles: [{ key: Date.now(), name: "", files: [] }],
        createdBy: "",
        updatedBy: "",
        isDraft: true,
        status: "",
      });
    }
  }, [id]);

  const [duplicateStatus, setDuplicateStatus] = useState<any>();

  const checkingDuplicateNames = async (item: any) => {
    const result = await axios.post(`/api/npd/duplicateProjectName`, {
      name: item,
    });
    return result.data;
  };

  const validateTitle = (data: any) => {
    const specialCharRegex = /^[^a-zA-Z0-9\s].*|.*[^a-zA-Z0-9\s]$/;

    if (specialCharRegex.test(data)) {
      return true; // Invalid due to special characters at the start or end
    }
  };

  // console.log("formData===>", formData);

  const handleNext = async () => {
    if (activeStep === 0) {
      setActiveStep(activeStep + 1);
    } else if (activeStep === 1) {
      if (id !== undefined && id !== "undefined") {
        if (formData.status === "Registered") {
          if (
            formData?.projectType === "" ||
            formData?.projectType === undefined ||
            formData?.projectType === null
          ) {
            enqueueSnackbar("Please Select Project Type", {
              variant: "error",
            });
          } else if (
            formData?.projectName === "" ||
            formData?.projectName === null ||
            formData?.projectName === undefined ||
            (await validateTitle(formData?.projectName))
          ) {
            enqueueSnackbar("Please Check Project Name", {
              variant: "error",
            });
          } else if (
            formData?.customer?.length === 0 ||
            formData?.customer === undefined ||
            formData?.customer === null
          ) {
            enqueueSnackbar("Please Select Customers", {
              variant: "error",
            });
          } else if (
            formData?.sopDate === "" ||
            formData?.sopDate === undefined ||
            formData?.sopDate === null
          ) {
            enqueueSnackbar("Please Select SOP Date", {
              variant: "error",
            });
          } else if (
            formData?.sopQuantity === "" ||
            formData?.sopQuantity === undefined ||
            formData?.sopQuantity === null
          ) {
            enqueueSnackbar("Please Select SOP Quantity", {
              variant: "error",
            });
          } else if (
            formData?.escNumber === "" ||
            formData?.escNumber === undefined ||
            formData?.escNumber === null
          ) {
            enqueueSnackbar("Please Select ESC Number", {
              variant: "error",
            });
          } else if (
            formData?.escRank === "" ||
            formData?.escRank === undefined ||
            formData?.escRank === null
          ) {
            enqueueSnackbar("Please Select ESC Rank", {
              variant: "error",
            });
          } else if (
            formData?.justification === "" ||
            formData?.justification === undefined ||
            formData?.justification === null
          ) {
            enqueueSnackbar("Please Enter Justification", {
              variant: "error",
            });
          } else if (
            formData?.meetingDate === "" ||
            formData?.meetingDate === undefined ||
            formData?.meetingDate === null
          ) {
            enqueueSnackbar("Please Select Meeting Date", {
              variant: "error",
            });
          } else if (
            formData?.partDetails[formData?.partDetails?.length - 1]?.model ===
              "" ||
            formData?.partDetails[formData?.partDetails?.length - 1]
              ?.partName === "" ||
            formData?.partDetails[formData?.partDetails?.length - 1]
              ?.densoPartNo === "" ||
            formData?.partDetails[formData?.partDetails?.length - 1]
              ?.customer === "" ||
            formData?.partDetails[formData?.partDetails?.length - 1]
              ?.productType === ""
          ) {
            enqueueSnackbar("Please Enter Parts Details", {
              variant: "error",
            });
          } else if (
            !formData?.departmentData?.[formData?.departmentData?.length - 1]
              ?.departments?.[
              formData?.departmentData?.[formData?.departmentData?.length - 1]
                ?.departments?.length - 1
            ]?.department ||
            formData?.departmentData?.[formData?.departmentData?.length - 1]
              ?.departments?.[
              formData?.departmentData?.[formData?.departmentData?.length - 1]
                ?.departments?.length - 1
            ]?.pic?.length === 0
          ) {
            enqueueSnackbar("Please Select Stake Holder Details", {
              variant: "error",
            });
          } else {
            const result = await axios.put(`/api/npd/${id}`, {
              ...formData,
              isDraft: false,
              status: formData?.status,
            });
            if (result.status === 201 || result.status === 200) {
              enqueueSnackbar("Created Succesfully", {
                variant: "success",
              });
              navigate("/NPD");
              const mailRes = await axios.post(
                `/api/npd/sendMailOnRegister/${id}`
              );
              if (mailRes.status === 201 || mailRes?.status === 200) {
                enqueueSnackbar("Mail sent successfully", {
                  variant: "success",
                });
              }
            }
          }
        } else if (formData.status === "Draft") {
          if (
            formData?.projectType === "" ||
            formData?.projectType === undefined ||
            formData?.projectType === null
          ) {
            enqueueSnackbar("Please Select Project Type", {
              variant: "error",
            });
          } else if (
            formData?.projectName === "" ||
            formData?.projectName === undefined ||
            (await validateTitle(
              formData?.projectName || formData?.projectName === null
            ))
          ) {
            enqueueSnackbar("Please Check Project Name", {
              variant: "error",
            });
          } else if (
            formData?.customer?.length === 0 ||
            formData?.customer === undefined ||
            formData?.customer === null
          ) {
            enqueueSnackbar("Please Select Customers", {
              variant: "error",
            });
          } else if (
            formData?.sopDate === "" ||
            formData?.sopDate === undefined ||
            formData?.sopDate === null
          ) {
            enqueueSnackbar("Please Select SOP Date", {
              variant: "error",
            });
          } else if (
            formData?.sopQuantity === "" ||
            formData?.sopQuantity === undefined ||
            formData?.sopQuantity === null
          ) {
            enqueueSnackbar("Please Select SOP Quantity", {
              variant: "error",
            });
          } else if (
            formData?.escNumber === "" ||
            formData?.escNumber === undefined ||
            formData?.escNumber === null
          ) {
            enqueueSnackbar("Please Select ESC Number", {
              variant: "error",
            });
          } else if (
            formData?.escRank === "" ||
            formData?.escRank === undefined ||
            formData?.escRank === null
          ) {
            enqueueSnackbar("Please Select ESC Rank", {
              variant: "error",
            });
          } else if (
            formData?.justification === "" ||
            formData?.justification === undefined ||
            formData?.justification === null
          ) {
            enqueueSnackbar("Please Enter Justification", {
              variant: "error",
            });
          } else if (
            formData?.meetingDate === "" ||
            formData?.meetingDate === undefined ||
            formData?.meetingDate === null
          ) {
            enqueueSnackbar("Please Select Meeting Date", {
              variant: "error",
            });
          } else if (
            formData?.partDetails[formData?.partDetails?.length - 1]?.model ===
              "" ||
            formData?.partDetails[formData?.partDetails?.length - 1]
              ?.partName === "" ||
            formData?.partDetails[formData?.partDetails?.length - 1]
              ?.densoPartNo === "" ||
            formData?.partDetails[formData?.partDetails?.length - 1]
              ?.customer === "" ||
            formData?.partDetails[formData?.partDetails?.length - 1]
              ?.productType === ""
          ) {
            enqueueSnackbar("Please Enter Parts Details", {
              variant: "error",
            });
          } else if (
            !formData?.departmentData?.[formData?.departmentData?.length - 1]
              ?.departments?.[
              formData?.departmentData?.[formData?.departmentData?.length - 1]
                ?.departments?.length - 1
            ]?.department ||
            formData?.departmentData?.[formData?.departmentData?.length - 1]
              ?.departments?.[
              formData?.departmentData?.[formData?.departmentData?.length - 1]
                ?.departments?.length - 1
            ]?.pic?.length === 0
          ) {
            enqueueSnackbar("Please Select Stake Holder Details", {
              variant: "error",
            });
          } else {
            const result = await axios.put(`/api/npd/${id}`, {
              ...formData,
              departmentData: formData?.departmentData,
              isDraft: false,
              status: "Registered",
            });
            if (result.status === 201 || result.status === 200) {
              enqueueSnackbar("Created Succesfully", {
                variant: "success",
              });
              navigate("/NPD");
              const mailRes = await axios.post(
                `/api/npd/sendMailOnRegister/${id}`
              );
              if (mailRes.status === 201 || mailRes?.status === 200) {
                enqueueSnackbar("Mail sent successfully", {
                  variant: "success",
                });
              }
            }
          }
        }
      } else {
        if (
          formData?.projectType === "" ||
          formData?.projectType === undefined ||
          formData?.projectType === null
        ) {
          enqueueSnackbar("Please Select Project Type", {
            variant: "error",
          });
        } else if (
          formData?.projectName === "" ||
          formData?.projectName === undefined ||
          formData?.projectName === null
        ) {
          enqueueSnackbar("Please Check Project Name", {
            variant: "error",
          });
        } else if (await checkingDuplicateNames(formData?.projectName)) {
          enqueueSnackbar("Project Already Exit", {
            variant: "error",
          });
        } else if (
          formData?.customer?.length === 0 ||
          formData?.customer === undefined ||
          formData?.customer === null
        ) {
          enqueueSnackbar("Please Select Customers", {
            variant: "error",
          });
        } else if (
          formData?.sopDate === "" ||
          formData?.sopDate === undefined ||
          formData?.sopDate === null
        ) {
          enqueueSnackbar("Please Select SOP Date", {
            variant: "error",
          });
        } else if (
          formData?.sopQuantity === "" ||
          formData?.sopQuantity === undefined ||
          formData?.sopQuantity === null
        ) {
          enqueueSnackbar("Please Select SOP Quantity", {
            variant: "error",
          });
        } else if (
          formData?.escNumber === "" ||
          formData?.escNumber === undefined ||
          formData?.escNumber === null
        ) {
          enqueueSnackbar("Please Select ESC Number", {
            variant: "error",
          });
        } else if (
          formData?.escRank === "" ||
          formData?.escRank === undefined ||
          formData?.escRank === null
        ) {
          enqueueSnackbar("Please Select ESC Rank", {
            variant: "error",
          });
        } else if (
          formData?.justification === "" ||
          formData?.justification === undefined ||
          formData?.justification === null
        ) {
          enqueueSnackbar("Please Enter Justification", {
            variant: "error",
          });
        } else if (
          formData?.meetingDate === "" ||
          formData?.meetingDate === undefined ||
          formData?.meetingDate === null
        ) {
          enqueueSnackbar("Please Select Meeting Date", {
            variant: "error",
          });
        } else if (
          formData?.partDetails[formData?.partDetails?.length - 1]?.model ===
            "" ||
          formData?.partDetails[formData?.partDetails?.length - 1]?.partName ===
            "" ||
          formData?.partDetails[formData?.partDetails?.length - 1]
            ?.densoPartNo === "" ||
          formData?.partDetails[formData?.partDetails?.length - 1]?.customer ===
            "" ||
          formData?.partDetails[formData?.partDetails?.length - 1]
            ?.productType === ""
        ) {
          enqueueSnackbar("Please Enter Parts Details", {
            variant: "error",
          });
        } else if (
          !formData?.departmentData?.[formData?.departmentData?.length - 1]
            ?.departments?.[
            formData?.departmentData?.[formData?.departmentData?.length - 1]
              ?.departments?.length - 1
          ]?.department ||
          formData?.departmentData?.[formData?.departmentData?.length - 1]
            ?.departments?.[
            formData?.departmentData?.[formData?.departmentData?.length - 1]
              ?.departments?.length - 1
          ]?.pic?.length === 0
        ) {
          enqueueSnackbar("Please Select Stake Holder Details", {
            variant: "error",
          });
        } else {
          const result = await axios.post(`/api/npd`, {
            ...formData,
            isDraft: false,
            status: "Registered",
          });
          if (result.status === 201 || result.status === 200) {
            enqueueSnackbar("Created Succesfully", {
              variant: "success",
            });
            navigate("/NPD");
            const mailRes = await axios.post(
              `/api/npd/sendMailOnRegister/${id}`
            );
            if (mailRes.status === 201 || mailRes?.status === 200) {
              enqueueSnackbar("Mail sent successfully", {
                variant: "success",
              });
            }
          }
        }
      }
    }
  };

  // console.log("read in stepper", read);
  const handleDraftSubmit = async () => {
    if (id !== undefined && id !== "undefined") {
      if (formData?.projectType === "" || formData?.projectType === undefined) {
        enqueueSnackbar("Please Select Project Type", {
          variant: "error",
        });
      } else if (
        formData?.projectName === "" ||
        formData?.projectName === undefined ||
        (await validateTitle(formData?.projectName))
      ) {
        enqueueSnackbar("Please Enter Project Name", {
          variant: "error",
        });
      } else {
        const result = await axios.put(`/api/npd/${id}`, {
          ...formData,
          status: "Draft",
        });
        if (result.status === 201 || result.status === 200) {
          enqueueSnackbar("Created Successfully", {
            variant: "success",
          });
          navigate("/NPD");
          const mailRes = await axios.post(`/api/npd/sendMailOnRegister/${id}`);
          if (mailRes.status === 201 || mailRes?.status === 200) {
            enqueueSnackbar("Mail sent successfully", {
              variant: "success",
            });
          }
        }
      }
    } else {
      if (formData?.projectType === "" || formData?.projectType === undefined) {
        enqueueSnackbar("Please Select Project Type", {
          variant: "error",
        });
      } else if (
        formData?.projectName === "" ||
        formData?.projectName === undefined
      ) {
        enqueueSnackbar("Please Enter Project Name", {
          variant: "error",
        });
      } else if (await checkingDuplicateNames(formData?.projectName)) {
        enqueueSnackbar("Project Name Already Exist", {
          variant: "error",
        });
      } else {
        const result = await axios.post(`/api/npd`, {
          ...formData,
          status: "Draft",
        });
        if (result.status === 201 || result.status === 200) {
          enqueueSnackbar("Created Succesfully", {
            variant: "success",
          });
          navigate("/NPD");
          const mailRes = await axios.post(`/api/npd/sendMailOnRegister/${id}`);
          if (mailRes.status === 201 || mailRes?.status === 200) {
            enqueueSnackbar("Mail sent successfully", {
              variant: "success",
            });
          }
        }
      }
    }
  };

  const handleFetchData = async (id: any) => {
    try {
      const result = await axios.get(`api/npd/${id}`);
      setFormData(result.data);
    } catch {}
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const getStepContent = (stepIndex: number) => {
    if (activeStep === 0) {
      return (
        <div>
          <HeaderIndex read={read} />
        </div>
      );
    }
    if (activeStep === 1) {
      return (
        <div>
          <DepartmentIndex read={read} />
        </div>
      );
    }
    // if (activeStep === 2) {
    //   return <div>{/* <AttachmentIndex /> */}</div>;
    // }
  };

  return (
    <div>
      <div style={{ paddingTop: "10px" }}>
        <div className={classes.formButtonsContainer}>
          {activeStep === 0 ? (
            <Button
              onClick={() => {
                navigate("/NPD");
              }}
            >
              <MdArrowBackIos style={{ fontSize: "14px" }} /> Back
            </Button>
          ) : (
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              className={classes.backButton}
            >
              <MdArrowBackIos style={{ fontSize: "14px" }} />
              Previous
            </Button>
          )}
          {/* onClick={handleStepChange(index)} */}
          <div className={classes.root}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              style={{ padding: "10px" }}
            >
              {steps.map((label, index: any) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          {formData.isDraft && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleDraftSubmit}
              className={classes.draftButton}
              disabled={read}
              // disabled={
              //   activeStep === steps.length ||
              //   (activeStep === steps.length - 1 && readModeButton === true)
              //     ? true
              //     : false
              // }
            >
              {"Save As Draft"}
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            className={classes.nextButton}
            disabled={
              activeStep === steps.length ||
              (activeStep === steps.length - 1 && read === true)
                ? true
                : false
            }
          >
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
            <MdArrowForwardIos style={{ fontSize: "14px" }} />
          </Button>
        </div>
        <div
          style={{ paddingTop: "10px", height: "800px", overflow: "scroll" }}
        >
          {getStepContent(steps.length)}
        </div>
      </div>
    </div>
  );
};

export default NPDSteeperIndex;
