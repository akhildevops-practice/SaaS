import React, { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { IconButton } from "@material-ui/core";
import AttachIcon from "../../assets/icons/AttachIcon.svg";
import CrossIcon from "../../assets/icons/BluecrossIcon.svg";
import useStyles from "./styles";
import { buttonStatus, getNcDetail, submitObservation } from "../../apis/ncSummaryApi";
import { useRecoilState } from "recoil";
import { auditeeSectionData, observationData } from "../../recoil/atom";
import AutoComplete from "../AutoComplete";
import { addAttachment, checkIsAuditor, checkRatePermissions, deleteAttachment } from "../../apis/auditApi";
import { API_LINK } from "../../config";
import CustomButtonGroup from "../../components/CustomButtonGroup";
import { useSnackbar } from "notistack";
import moment from "moment";
import getUserId from "../../utils/getUserId";
import checkRole from "../../utils/checkRoles";
import getAppUrl from "utils/getAppUrl";

export default function NcObservationForm() {
  const classes = useStyles();
  const { id }: any = useParams();
  const [formData, setFormData] = useRecoilState(observationData);
  const [auditeeData, setAuditeeData] = useRecoilState(auditeeSectionData);
  const [roleState, setRoleStatus] = React.useState(false);
  const [ncStatus, setNcStatus] = React.useState("");
  const [closedStatus, setClosedStatus] = React.useState<any>(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const userId = getUserId();
  const disabled = true;
  const isMR = checkRole("MR")
  const [isAuditee, setIsAuditee] = React.useState(false);
  const [isAuditor, setIsAuditor] = React.useState(false);
  const [auditDate, setAuditDate] = React.useState();
  const mrOption = ["Submit", "Save As Draft"]
  const auditorOption = ["Submit", "Save As Draft"]
  const auditeeOption = ["Submit", "Save As Draft"]
  const location: any = useLocation();
  const realmName = getAppUrl()
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);

    /**
   * @method checkIsAuditee
   * @description Function to check if the user is an auditee
   * @param id {string}
   * @param role {string}
   * @returns nothing
   */
     const checkAuditee = (id: string, role: string) => {
      checkRatePermissions(id, {
        userId: userId,
      }).then((response: any) => {
        setIsAuditee(response?.data);
      })
    }
  
    /**
     * @method checkAuditor
     * @description Function to check if the user is an auditor
     * @param id {string}
     * @param role {string}
     * @returns nothing
     */
    const checkAuditor = (id: string, role: string) => {
      checkIsAuditor(id, {
        userId: userId,
      }).then((response: any) => {
        setIsAuditor(response?.data);
      })
    }

  /**
   * @method fetchData
   * @description Function to fetch NC/Observation data
   * @returns nothing
   */
  const fetchData = () => {
    getNcDetail(id).then((response: any) => {
      setClosedStatus(response?.data?.status === "CLOSED" ? true: false)
      setAuditDate(response?.data?.audit?.date)
      setFormData((prev: any) => {
        return {
          ...prev,
          auditName: response?.data?.audit?.auditName,
          auditNumber: response?.data?.audit?.auditNumber,
          date: moment(response?.data?.audit?.date).format(
            "DD/MM/YYYY, h:mm a"
          ),
          auditType: response?.data?.audit?.auditType?.name,
          auditees: response?.data?.audit?.auditees,
          auditors: response?.data?.audit?.auditors,
          observationDate: response.data.date
            ? moment(response?.data?.date).format("DD/MM/YYYY")
            : "",
          isDraft: response?.data?.audit?.isDraft,
          auditedEntity: response?.data?.audit?.auditedEntity?.entityName,
          location: response?.data?.audit?.location?.locationName,
          observationNumber: response?.data?.id ?? "",
          observationDetails: response?.data?.comment ?? "",
          documentProof: response?.data?.document ? (
            <a
              href={`${API_LINK}${response?.data?.document}` as string}
              target="_blank"
              rel="noopener noreferrer"
            >
              {response?.data?.document?.split("/")[2]}
            </a>
          ) : "No image found",

        };
      });

      setAuditeeData((prev: any) => {
        return {
          ...prev,
          date: moment(response?.data?.correctiveAction?.date).format("YYYY-MM-DD"),
          comment: response?.data?.correctiveAction?.comment,
          proofDocument: response?.data?.correctiveAction?.proofDocument,
          documentName: response?.data?.correctiveAction?.documentName,
          imageName: response?.data?.correctiveAction?.documentName,
          imageLink: response?.data?.correctiveAction?.proofDocument,
          isDraft: response?.data?.correctiveAction?.isDraft ?? true,
        };
      });

      checkAuditee(response?.data?.audit?._id, response?.data?.currentlyUnder);
      checkAuditor(response?.data?.audit?._id, response?.data?.currentlyUnder);

      setNcStatus(response?.data?.status);
    });
  };

  useEffect(() => {
    id && fetchData();
    id && getButtonStatus(id, userId);
  }, []);

  /**
   * @method handleAuditeeChange
   * @description Function to handle field data changes in the auditee form
   * @param e any
   * @returns nothing
   */
  const handleAuditeeChange = (e: any) => {
    setAuditeeData({
      ...auditeeData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * @method handleImageUpload
   * @description Function to handle file upload. Converts the image to form data before inserting it into the recoil state object.
   * @param e {any}
   * @param sectionIndex {any}
   * @param questionIndex {any}
   */
  const handleImageUpload = (e: any) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    const copyData = JSON.parse(JSON.stringify(auditeeData));

    addAttachment( formData,
      realmName,
      loggedInUser?.location?.locationName).then((response: any) => {
      setAuditeeData((prev: any) => {
        copyData.proofDocument = response?.data?.path;
        copyData.documentName = response?.data?.name;
        copyData.imageLink = response?.data?.path;
        copyData.imageName = response?.data?.name;
        return copyData;
      });
    });
  };

  /**
   * @method clearFile
   * @description Function to clear a file
   * @returns nothing
   */
  const clearFile = () => {
    const copyData = JSON.parse(JSON.stringify(auditeeData));
    deleteAttachment({
      path: auditeeData?.imageLink,
    }).then((response: any) => {
      if (response?.data?.status === 200) {
        setAuditeeData((prev: any) => {
          copyData.imageLink = "";
          copyData.imageName = "";
          return copyData;
        });
      }
    });
  };

  /**
   * @method getButtonStatus
   * @description Function to get button status for enabling or disabling submit button 
   * @param id {string}
   * @param userId {any}
   */
  const getButtonStatus = (id: string, userId: any) => {
    const type='OBS'
    buttonStatus(id, userId,type).then((response: any) => {
      setRoleStatus(response?.data);
    })
  }

  /**
   * @method handleSubmit
   * @description Function to perform a network call when the submit/draft option is clicked in the button group
   * @param option string
   * @returns nothing
   */
  const handleSubmit = (option: string) => {
    if (option === "Submit") {
      const copyData = JSON.parse(JSON.stringify(auditeeData));
      copyData.isDraft = false
      copyData.userId = userId;
      submitObservation(id, copyData).then((response: any) => {
        navigate("/audit/ncsummary");
        enqueueSnackbar("You successfully reviewed the observation!", {
          variant: "success",
        });
      });
    }
    if (option === "Save As Draft") {
      const draftData = JSON.parse(JSON.stringify(auditeeData));
      draftData.isDraft = true;
      draftData.userId = userId;
      submitObservation(id, draftData).then((response: any) => {
        navigate("/audit/ncsummary");
        enqueueSnackbar("You successfully saved the observation as draft!", {
          variant: "success",
        });
      });
    }
  };

  return (
    <div>
      <div className={classes.button__group}>
        <Button
          startIcon={<MdKeyboardArrowLeft />}
          component={Link}
          to={location?.state?.redirectLink ? location?.state?.redirectLink : "/audit/ncsummary"}
          className={classes.back__button}
        >
          Back
        </Button>
        <CustomButtonGroup
          options={isAuditor ? auditorOption : isAuditee ? auditeeOption : isMR ? mrOption : []}
          handleSubmit={handleSubmit}
          disableBtnFor={ncStatus === "CLOSED"  ? ["Submit", "Save As Draft"] : !roleState ?["Submit", "Save As Draft"] : []  }
        />
      </div>

      {/* Observation Form */}
      <section className={classes.form__section}>
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          style={{ paddingBottom: "2rem" }}
        >
          <strong>Observation Form</strong>
          
        </Typography>

        <Grid container spacing={2}>
          {/* Audit Name */}
          <Grid item container md={6} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>Audit Name*</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                disabled={disabled}
                name="auditName"
                value={formData?.auditName}
                variant="outlined"
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={1}></Grid>

          {/*  Audit Date & Time* */}
          <Grid item container xs={12} sm={12} md={5} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>
                Audit Date & Time*
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                disabled={disabled}
                name="date"
                value={formData?.date}
                variant="outlined"
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          {/* Audit Type* */}
          <Grid item container xs={12} sm={12} md={6} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>Audit Type*</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                disabled={disabled}
                name="auditType"
                value={formData?.auditType}
                variant="outlined"
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={1}></Grid>

          {/* Audit No.* */}
          <Grid item container xs={12} sm={12} md={5} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>Audit No.*</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                disabled={disabled}
                name="auditNumber"
                value={formData?.auditNumber}
                variant="outlined"
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          {/* Auditee(s)* */}
          <Grid item container xs={12} sm={12} md={6} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>Auditee(s)*</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <AutoComplete
                suggestionList={[
                  {
                    firstname: "Mridul",
                  },
                  {
                    firstname: "Jintu",
                  },
                  {
                    firstname: "Mintu",
                  },
                ]}
                name="Auditee"
                keyName="auditees"
                disabled={disabled}
                labelKey="email"
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={() => console.log("get suggestions")}
                defaultValue={formData.auditees}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={1}></Grid>

          {/* Auditor(s)* */}
          <Grid item container xs={12} sm={12} md={5} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>Auditor(s)*</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <AutoComplete
                suggestionList={[
                  {
                    firstname: "Mridul",
                  },
                  {
                    firstname: "Jintu",
                  },
                  {
                    firstname: "Mintu",
                  },
                ]}
                name="Auditor"
                keyName="auditors"
                disabled={disabled}
                labelKey="email"
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={() => console.log("suggestion")}
                defaultValue={formData.auditors}
              />
            </Grid>
          </Grid>

          {/* Entity* */}
          <Grid item container xs={12} sm={12} md={6} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>Entity*</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                disabled={disabled}
                name="auditedEntity"
                value={formData?.auditedEntity}
                variant="outlined"
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={1}></Grid>

          {/* Location* */}
          <Grid item container xs={12} sm={12} md={5} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>Location*</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                disabled={disabled}
                name=""
                value={formData?.location}
                variant="outlined"
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          {/* Observation Date* */}
          <Grid item container xs={12} sm={12} md={6} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>
                Observation Date*
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                disabled={disabled}
                name=""
                value={formData?.observationDate}
                variant="outlined"
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={1}></Grid>

          {/* Observation Number* */}
          <Grid item container xs={12} sm={12} md={5} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>
                Observation Number*
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                disabled={disabled}
                name=""
                value={formData?.observationNumber}
                variant="outlined"
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
          {/* Document/Proof* */}
          <Grid item container xs={12} sm={12} md={6} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>
                Document / Proof*
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8} style={{ margin: "auto" }}>
              {formData?.documentProof !== "" ? (
                <Typography className={classes.docProof}>
                  {formData.documentProof}
                </Typography>
              ) : (
                <Typography color="textSecondary" variant="caption">
                  No Document/Proof found!
                </Typography>
              )}
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={1}></Grid>

          {/* Observation Details* */}
          <Grid item container xs={12} sm={12} md={5} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>
                Observation Details*
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                disabled={disabled}
                name=""
                value={formData?.observationDetails}
                variant="outlined"
                fullWidth
                size="small"
                multiline
                minRows={4}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={1}></Grid>
        </Grid>
      </section>

      {/* Auditee Section */}
      <section className={classes.form__section}>
        <Typography
          variant="body2"
          align="center"
          gutterBottom
          style={{ paddingBottom: "2rem" }}
        >
          Auditee Section
        </Typography>

        <Grid container spacing={2}>
          {/* Document Proof* */}
          <Grid item container xs={12} sm={12} md={6} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>Document Proof*</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <div className={classes.button__container}>
                <label htmlFor="contained-button-file">
                  <input
                    accept="image/*"
                    disabled={!auditeeData?.isDraft}
                    id="contained-button-file"
                    multiple
                    onChange={(e: any) => {
                      handleImageUpload(e);
                      e.target.value = "";
                    }}
                    type="file"
                    hidden
                  />
                  <Button
                    disabled={!auditeeData?.isDraft || closedStatus}
                    variant="contained"
                    size="small"
                    component="span"
                    className={classes.attachButton}
                    startIcon={<img src={AttachIcon} alt="" />}
                    disableElevation
                  >
                    Attach
                  </Button>
                </label>
                {auditeeData.proofDocument && (
                  <>
                    <Typography className={classes.filename}>
                      <a
                        href={`${API_LINK}${auditeeData?.proofDocument}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {auditeeData?.documentName}
                      </a>
                    </Typography>

                    <IconButton onClick={clearFile}>
                      <img src={CrossIcon} alt="" />
                    </IconButton>
                  </>
                )}
              </div>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={1}></Grid>

          {/* Date of CA* */}
          <Grid item container xs={12} sm={12} md={5} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>Date of CA*</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                name="date"
                type="date"
                value={auditeeData?.date}
                variant="outlined"
                disabled={closedStatus}
                onChange={handleAuditeeChange}
                fullWidth
                size="small"
                inputProps={{
                  min: moment(auditDate).format("YYYY-MM-DD")
                }}
              />
            </Grid>
          </Grid>


          {/* Comments/Action taken* */}
          <Grid item container xs={12} sm={12} md={6} spacing={1}>
            <Grid item xs={12} sm={12} md={4}>
              <Typography className={classes.label}>
                Comments/Action taken*
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                disabled={!auditeeData?.isDraft || closedStatus}
                name="comment"
                value={auditeeData?.comment}
                onChange={handleAuditeeChange}
                variant="outlined"
                fullWidth
                size="small"
                multiline
                minRows={4}
              />
            </Grid>
          </Grid>
          
          <Grid item xs={12} sm={12} md={1}></Grid>
        </Grid>
      </section>
    </div>
  );
}
