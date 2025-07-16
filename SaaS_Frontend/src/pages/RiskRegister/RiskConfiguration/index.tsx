//react
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

//material-ui
import {
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { MdDelete } from 'react-icons/md';
import { MdEdit } from 'react-icons/md';

//notistack
import { useSnackbar } from "notistack";

//styles
import useStyles from "./styles";
import "./tableStyles.css";

//assets
import EmptyTableImg from "assets/EmptyTableImg.svg";

//utils
import axios from "apis/axios.global";
import checkRoles from "utils/checkRoles";

//components
import CustomTable from "components/CustomTable";
import ModuleNavigation from "components/Navigation/ModuleNavigation";

const RiskConfiguration = () => {
  const params = useParams();
  const orgId = sessionStorage.getItem("orgId");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const navigate = useNavigate();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const headers = ["Risk Category", "Condition/Priority", "Risk Type"];
  const fields = ["riskCategory", "condition", "riskType"];
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const showHyperLink = !isOrgAdmin && !isMR;
  const [activeTab, setActiveTab] = useState("1");
  useEffect(() => {
    getRiskConifigs();
  }, []);

  const getRiskConifigs = async () => {
    setLoading(true);
    try {
      // const res = await axios.get("/api/riskconfig");
      const res = await axios.get(`/api/riskconfig/getconfigbycategory/${orgId}/${params.riskcategory}`)
      
      console.log("check res data in risk config page", res);
      if(res.status === 200 || res.status === 201) {
        if(res.data) {
          let data = [{...res.data}]
           data =   data.map((item: any) => {
            return {
              riskCategory: showHyperLink ? (<Link style={{color : "black"}} to={`/risk/riskconfiguration/stepper/${item._id}`}>{item.riskCategory}</Link>) : item.riskCategory,
              condition: (
                <>
                  {item.condition.map((e: any) => {
                    return (
                      <>
                        <div>{e.name} </div> <br />
                      </>
                    );
                  })}
                </>
              ),
  
              riskType: (
                <>
                  {item.riskType.map((e: any) => {
                    return (
                      <>
                        <div>{e.name} </div> <br />
                      </>
                    );
                  })}
                </>
              ),
              id: item._id,
            };
          })
          setData(data);
        } else {
          setData([]);
        } 
      }else {
        enqueueSnackbar("Error in fetching Risk Configuration", {
          variant: "error",
        });
        setData([]);
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const handleEdit = (data: any) => {

    navigate(`/risk/riskconfiguration/stepper/${params.riskcategory}/${data.id}`);
  };

  const handleDelete = async (data: any) => {
    try {
      const res = await axios.delete(`/api/riskconfig/${data.id}`);
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar("Risk Configuration deleted successfully", {
          variant: "success",
        });
        getRiskConifigs();
      } else {
        enqueueSnackbar("Error in deleting Risk Configuration", {
          variant: "error",
        });
      }
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const createHandler = () => {
    if(isOrgAdmin || isMR) {
      navigate(`/risk/riskconfiguration/stepper/${params.riskcategory}`);
      return;
    } else {
      enqueueSnackbar("Only MR or Org Admin can create Risk Configuration", {
        variant: "warning",
      })
    }
  }

  const configHandler = () => {
    navigate("/risk/riskregister");
  }

  return (
    <>
     <ModuleNavigation
        tabs={[]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentModuleName={
          params.riskcategory === "AspImp"
            ? `Aspect Impact Register`
            : `${params.riskcategory} Register`
        }
        createHandler={createHandler}
        configHandler={configHandler}
        filterHandler={false}
        mainModuleName={"Risk Settings"}
      />
      {/* <ModuleHeader
        moduleName="Risk Configuration"
        showSideNav={true}
        createHandler={createHandler}
        filterHandler={() => {}}
        configHandler={configHandler}
      /> */}

      {loading ? (
        <div className={classes.loader}>
          <CircularProgress />
        </div>
      ) : !!data && data?.length !== 0 ? (
        <div className={classes.tableContainer}>
          <CustomTable
            header={headers}
            fields={fields}
            data={data}
            isAction={isOrgAdmin || isMR}
            actions={[
              {
                label: "Edit",
                icon: <MdEdit fontSize="small" />,
                handler: handleEdit,
              },
              {
                label: "Delete",
                icon: <MdDelete fontSize="small" />,
                handler: handleDelete,
              },
            ]}
          />
        </div>
      ) : (
        <>
          <div className={classes.imgContainer}>
            <img
              src={EmptyTableImg}
              alt="No Data"
              height="400px"
              width="300px"
            />
          </div>
          <Typography align="center" className={classes.emptyDataText}>
            Let’s begin by adding a risk configuration
          </Typography>
        </>
      )}
    </>
  );
};

export default RiskConfiguration;
