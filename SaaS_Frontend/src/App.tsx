//react
import { useEffect, useMemo, useState, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import type { RouteObject } from "react-router";
//styles
import { ThemeProvider } from "@material-ui/core/styles";
import { theme } from "./theme";
import BasicLayout from "./layout/BasicLayout";
import { Typography } from "@material-ui/core";
//auth
import kcAuth from "./kcAuth";
import { RecoilRoot, useSetRecoilState } from "recoil";
import { ReactKeycloakProvider } from "@react-keycloak/web";
//utils
import CustomLoadingComponent from "./components/CustomLoadingComponent";
import NoAccess from "./assets/NoAccess.svg";
import { SnackbarProvider } from "notistack";
import setToken from "./utils/setToken";
import axios from "./apis/axios.global";
//routes
import {
  auditRoutes,
  dashboardRoutes,
  documentRoutes,
  objectiveRoutes,
  kpiRoutes,
  masterRoutes,
  otherRoutes,
  settingRoutes,
  riskRoutes,
  reportRoutes,
  mrmRoutes,
  cipRoutes,
} from "./routes";
import getAppUrl from "./utils/getAppUrl";
import { modules } from "./utils/enums";
import { activeModulesAtom } from "recoil/atom";
import getSessionStorage from "utils/getSessionStorage";
import caraRoutes from "routes/caraRoutes";
import PersistentLoader from "components/GlobalLoader/PersistentLoader";
import ProtectedRoute from "components/Navigation/ProtectedRoute";
import npdRoutes from "routes/npdRoutes";
function App() {
  const [isLoading, setLoading] = useState(true); //should be later set to true
  const [userStatus, setUserStatus] = useState<any>();
  const [activeModules, setActiveModules] = useState<string[]>([]);
  // const justLoggedInRef = useRef(true);

  const realmName = getAppUrl();
  const setActiveModulesRecoil = useSetRecoilState(activeModulesAtom);

  useEffect(() => {
    getActiveModules();
  }, []);

  const routes = useMemo(() => {
    let temp = [
      ...otherRoutes,
      ...settingRoutes,
      ...masterRoutes,
      ...dashboardRoutes,
      ...reportRoutes,
      ...caraRoutes,
    ];

    if (activeModules.includes(modules.AUDIT)) temp = [...temp, ...auditRoutes];
    if (activeModules.includes(modules.DOCUMENTS))
      temp = [...temp, ...documentRoutes];
    if (activeModules.includes(modules.KPI)) temp = [...temp, ...kpiRoutes];
    if (activeModules.includes(modules.OBJECTIVES))
      temp = [...temp, ...objectiveRoutes];
    if (activeModules.includes(modules.RISK)) temp = [...temp, ...riskRoutes];
    if (activeModules.includes(modules.MRM)) temp = [...temp, ...mrmRoutes];
    if (activeModules.includes(modules.CAPA)) temp = [...temp, ...caraRoutes];
    if (activeModules.includes(modules.CIP)) temp = [...temp, ...cipRoutes];
    if (activeModules.includes(modules.NPD)) temp = [...temp, ...npdRoutes];

    return temp;
  }, [activeModules]);

  const getActiveModules = async () => {
    if (realmName !== "master") {
      await axios(`/api/organization/getAllActiveModules/${realmName}`)
        .then((res) => {
          setActiveModules(res.data.activeModules);
          setActiveModulesRecoil(res.data.setActiveModules);
        })
        .catch((err) => console.error(err));
    }
  };

  const createEntryInStats = async (body: any) => {
    try {
      const res = await axios.post(`/api/stats/createEntryInStats`, body);
      // console.log(res);
    } catch (error) {
      // console.log(error);
    }
  };

  /**
   * @method getToken
   * @description Function to fetch a KC Token and store it in session storage
   * @param tokens {any}
   * @returns nothing
   */
  const getToken = async (tokens: any) => {
    if (!tokens?.token) {
      kcAuth.login();
    } else {
      setToken(tokens.token);
      const userInfoData = await fetchUserInfo();
      const userDetails = {
        id: userInfoData.id || "",
        firstName: userInfoData.firstname || "",
        lastName: userInfoData.lastname || "",
        fullName: userInfoData.firstname + " " + userInfoData.lastname || "",
        email: userInfoData.email || "",
        userName: userInfoData.username || "",
        avatar: userInfoData.avatar || "",
        ...userInfoData,
      };
      sessionStorage.setItem("orgId", userInfoData.organizationId);
      sessionStorage.setItem("userDetails", JSON.stringify(userDetails));

      checkUserStatus().then(() => {
        setLoading(false);
      });
    }
  };

  const fetchUserInfo = async () => {
    const cachedUserData = JSON.parse(
      sessionStorage.getItem("userDetails") as any
    );
    if (!!cachedUserData) return cachedUserData;
    else {
      const userInfo = await axios.get("/api/user/getUserInfo");
      const data = userInfo?.data;
      return data;
    }
  };

  /**
   * @method handleLogout
   * @description Function to perform a logout operation through KC Auth
   * @returns nothing
   */
  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("justLoggedIn");
    kcAuth.logout();
  };

  const checkUserStatus = async () => {
    // let { data }: any = await axios.get(`api/user/check/getUserInfo`);
    //
    const userDetails = getSessionStorage();
    setUserStatus(userDetails.status);
  };

  return (
    <ReactKeycloakProvider
      authClient={kcAuth}
      onTokens={getToken}
      onEvent={async (event, error) => {
        if (event === "onAuthSuccess") {
          if (!localStorage.getItem("justLoggedIn")) {
            const userDetails = await fetchUserInfo();

            await createEntryInStats({
              userId: userDetails?.id,
              locationId: userDetails?.location?.id,
              entityId: userDetails?.entity?.id,
            });
            localStorage.setItem("justLoggedIn", "1"); // Set the flag to indicate that the user has just logged in
          }
        }
      }}
      LoadingComponent={
        <CustomLoadingComponent text={"Redirecting, Please wait.."} />
      }
    >
      {!isLoading && userStatus ? (
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
              <Router>
                <BasicLayout
                  handleLogout={handleLogout}
                  activeModules={activeModules}
                >
                  <PersistentLoader />
                  <Routes>
                    {routes.map((route: any, index: number) => {
                      return (
                        // <Route
                        //   key={index}
                        //   path={route.path}
                        //   element={route.element}
                        // />

                        <Route
                          key={index}
                          path={route.path}
                          element={
                            <ProtectedRoute isProtected={route?.protected}>
                              {route.element}
                            </ProtectedRoute>
                          }
                        />
                      );
                    })}
                    <Route
                      path="/*"
                      element={
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <img
                              src={NoAccess}
                              alt="No Data"
                              height="400px"
                              width="300px"
                            />
                          </div>
                          <Typography
                            align="center"
                            style={{
                              fontSize: 14,
                              color: "#0E0A42",
                            }}
                          >
                            You are not authorized to view this page
                          </Typography>
                        </>
                      }
                    />
                  </Routes>
                </BasicLayout>
              </Router>
            </SnackbarProvider>
          </ThemeProvider>
        </RecoilRoot>
      ) : !isLoading ? (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img src={NoAccess} alt="No Data" height="400px" width="300px" />
          </div>
          <Typography
            align="center"
            style={{
              fontSize: 14,
              color: "#0E0A42",
            }}
          >
            You are not authorized to view this page
          </Typography>
        </>
      ) : (
        <></>
      )}
    </ReactKeycloakProvider>
  );
}

export default App;
