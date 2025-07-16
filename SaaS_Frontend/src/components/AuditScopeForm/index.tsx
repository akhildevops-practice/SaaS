import {
  Grid,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from "@material-ui/core";
import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { useStyles } from "./styles";
import { debounce } from "lodash";
import axios from "../../apis/axios.global";
import { useRecoilState } from "recoil";
import getAppUrl from "../../utils/getAppUrl";
import { auditFormData } from "../../recoil/atom";
import DynamicFormSearchField from "../../components/DynamicFormSearchField";
import { getEntitiesByUserLocation } from "../../apis/entityApi";
import { getAllAuditees, getAuditById } from "../../apis/auditApi";
import { getAllClauses } from "../../apis/clauseApi";
import { useLocation, useParams } from "react-router";
import { getAllDocuments } from "../../apis/documentsApi";
import AutoCompleteNew from "../AutoCompleteNew";

/**
 * @types Props
 * @description used for defining types of props for the AuditScopeForm component
 */
type Props = {
  isEdit?: any;
  initVal?: any;
  rerender?: any;
  handleDiscard?: any;
  handleSubmit?: any;
  isLoading?: any;
  systemTypes?: any;
  disabled?: any;
};

function AuditScopForm({
  initVal,
  isEdit = false,
  handleDiscard,
  handleSubmit,
  isLoading,
  rerender,
  systemTypes,
  disabled = false,
}: Props) {
  const [values, setValues] = useState(initVal);
  const [clauses, setClauses] = useState<any>([]);
  const [documents, setDocuments] = useState<any>([]);
  const [entitySuggestion, setEntitySuggestion] = useState<any>([]);
  const [auditeeSuggestion, setAuditeeSuggestion] = useState<any>([]);
  const [loading, setLoading] = useState<any>();
  const [entHead, setEntHead] = useState<any>();
  const [suggestion, setSuggestion] = useState();
  const [formData, setFormData] = useRecoilState<any>(auditFormData);
  const classes = useStyles();
  const realmName = getAppUrl();
  const paramId: any = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const location: any = useLocation();

  let typeAheadValue: string;
  let typeAheadType: string;

  /**
   * @method handleChange
   * @param e {any}
   * @returns nothing
   */
  const handleChange = (e: any) => {
    setFormData((prev: any) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
        auditees: [],
      };
    });
    getAuditees(e.target.value);
  };

  const handleChangeFirst = (id: any) => {
    getAuditees(id);
  };
  /**
   * @method getData
   * @param value {string}
   * @param type {string}
   * @returns nothing
   */
  const getData = async (value: string, type: string) => {};

  /**
   * @method debouncedSearch
   * @description Function to perform a delayed network call
   * @returns nothing
   */
  const debouncedSearch = debounce(() => {
    getData(typeAheadValue, typeAheadType);
  }, 400);

  /**
   * @method getSuggestionList
   * @param value {any}
   * @param type {string}
   * @returns nothing
   */
  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };

  /**
   * @method getLocations
   * @description Function to fetch all locations
   * @returns nothing
   */
  const getLocations = async () => {
    const res = await axios.get(`api/location/getLocationsForOrg/${realmName}`);
    setSuggestion(res.data);
  };

  /**
   * @method getEntity
   * @description Function to fetch the entity related to that particular user
   * @returns nothing
   */
  const getEntity = () => {
    getEntitiesByUserLocation().then((response: any) => {
      setEntitySuggestion(response?.data);
    });
  };

  /**
   * @method findEntityHead - Function to find the entity head
   * @param payload {any}
   * @returns object with entity head
   */
  const findEntityHead = (payload: any[]) => {
    const entityHead = payload.filter((item: any) => {
      return item.assignedRole.some((elem: any) => {
        return elem.role.roleName == "ENTITY-HEAD";
      });
    });
    return entityHead[0];
  };

  /**
   * @method getAuditees
   * @description Function to get all auditees
   * @returns nothing
   */
  const getAuditees = (id: string) => {
    getAllAuditees(id).then((response: any) => {
      setEntHead(findEntityHead(response?.data));
      setAuditeeSuggestion(response?.data);
    });
  };

  async function fetchAuditees(id: string) {
    const response: any = await getAllAuditees(id);
    const auditees = response?.data;
    setAuditeeSuggestion(auditees);
  }

  /**
   * @method fetchAllClauses
   * @description Function to fetch all clauses belonging to a particular location
   * @returns nothing
   */
  const fetchAllClauses = () => {
    console.log("systemdetailsinauditscope", location?.state?.systemDetails);
    const data = formData.system;

    getAllClauses(`${data}`).then((response: any) => {
      console.log("responseingetallclauses", response.data);
      setClauses(response?.data);
    });
  };

  /**
   * @method fetchClausesForEdit
   * @description Function to fetch all clauses with particular id
   * @param id {string}
   * @returns nothing
   */
  const fetchClausesForEdit = (id: string) => {
    getAllClauses(id).then((response: any) => {
      setClauses(response?.data?.clauses);
    });
  };

  /**
   * @method fetchAllDocuments
   * @description Function to fetch all documents
   * @returns nothing
   */
  const fetchAllDocuments = () => {
    getAllDocuments(realmName).then((response: any) => {
      setDocuments(response?.data);
      setLoading(false);
    });
  };

  /**
   *  @method setClausesAndDocuments
   * @description Function to set clauses and documents
   * @returns nothing
   * @param formData {formData}
   */
  const setClausesAndDocuments = (formData: any) => {
    const parsedClause = formData.auditedClauses.map((clause: any) => {
      return {
        item: clause,
      };
    });
    const parsedDocuments = formData.auditedDocuments.map((doc: any) => {
      return {
        item: doc,
      };
    });
    setFormData((prev: any) => {
      return {
        ...prev,
        auditedClauses:
          parsedClause.length === 0 ? [{ item: {} }] : parsedClause,
        auditedDocuments:
          parsedDocuments.length === 0 ? [{ item: {} }] : parsedDocuments,
      };
    });
  };

  /**
   * @method getAuditData
   * @description Function to get audit data from the database with particular id
   * @returns nothing
   * @param id {string}
   */
  const getAuditData = (id: string) => {
    getAuditById(id).then((res: any) => {
      setClausesAndDocuments(res?.respond);
      fetchClausesForEdit(res?.respond?.system);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    setLoading(true);
    getLocations();
    getEntity();
    fetchAllClauses();
    fetchAllDocuments();
    formData.auditedEntity && getAuditees(formData.auditedEntity);
    paramId.id && getAuditData(paramId.id);
    const entityId = formData.auditedEntity;
    paramId.id && fetchAuditees(entityId);
  }, []);

  React.useEffect(() => {
    if (entHead !== undefined) {
      setFormData((prev: any) => {
        return { ...prev, auditees: [...prev.auditees, entHead] };
      });
    }
  }, [entHead]);

  return (
    <>
      {loading ? (
        <Box
          marginY="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <form
          data-testid="org-admin-form"
          autoComplete="off"
          className={classes.form}
        >
          <Grid container>
            <Grid item sm={12} md={6}>
              <Grid container>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Audited Dept/Vertical*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <Select
                    style={{ height: "40px" }}
                    // disabled={disabled}
                    required
                    fullWidth
                    variant="outlined"
                    name="auditedEntity"
                    value={formData.auditedEntity}
                    onChange={handleChange}
                  >
                    {entitySuggestion.map((item: any, i: number) => (
                      <MenuItem key={item} value={item.id}>
                        {item.entityName}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Auditees*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <AutoCompleteNew
                    suggestionList={auditeeSuggestion ? auditeeSuggestion : []}
                    showAvatar={true}
                    name="Auditees"
                    keyName="auditees"
                    labelKey="firstname"
                    secondaryLabel="lastname"
                    // disabled={disabled}
                    formData={formData}
                    setFormData={setFormData}
                    getSuggestionList={() => console.log("get auditees")}
                    defaultValue={[]}
                  />
                </Grid>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Audited Clauses*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <DynamicFormSearchField
                    data={formData}
                    // disabled={disabled}
                    setData={setFormData}
                    name="auditedClauses"
                    keyName="item"
                    suggestions={clauses}
                    suggestionLabel="name"
                    hideTooltip={false}
                  />
                </Grid>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Audited Documents*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <DynamicFormSearchField
                    data={formData}
                    // disabled={disabled}
                    setData={setFormData}
                    name="auditedDocuments"
                    keyName="item"
                    suggestions={documents}
                    suggestionLabel="documentName"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      )}
    </>
  );
}

export default AuditScopForm;
