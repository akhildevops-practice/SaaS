import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Box,
  Typography,
  IconButton,
} from "@material-ui/core";
import ConnectedAppForm from "../../components/ConnectedAppForm";
import { MdCheckCircle } from 'react-icons/md';
import { MdCancel } from 'react-icons/md';
import ModalWrapper from "../../components/newComponents/ModalWrapper";
import { ReactComponent as AddIcon } from "../../assets/documentControl/square-Add.svg";
import { useStyles } from "./styles";
import checkRole from "../../utils/checkRoles";
import { roles } from "../../utils/enums";
import axios from "../../apis/axios.global";
import getAppUrl from "../../utils/getAppUrl";
import EmptyTableImg from "../../assets/EmptyTableImg.svg";

function ConnectedApps() {
  const [connectedApps, setConnectedApps] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState({
    id: "",
    appName: "",
    status: false,
    grantType: "",
  });
  const [locationOptions, setLocationOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const allOption = { value: "All", label: "All" };
  const classes = useStyles();
  const realmName = getAppUrl();
  const isOrgAdmin = checkRole(roles.ORGADMIN);

  useEffect(() => {
    getAllConnectedApps();
    getLocationOptions();
  }, []);

  const truncate = (str: string, n: number) => {
    return str?.length > n ? str.slice(0, n - 1) + "..." : str;
  };

  const dateToString = (date: Date) => {
    return `${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  const getLocationOptions = async () => {
    await axios(`/api/location/getLocationsForOrg/${realmName}`)
      .then((res) => {
        setLocationOptions(
          res.data.map((obj: any) => ({
            value: obj.id,
            label: obj.locationName,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getAllConnectedApps = async () => {
    await axios(`/api/connected-apps/getallconnectedapps`)
      .then((res) => {
        setConnectedApps(
          res.data.map((obj: any) => ({
            id: obj.id,
            appName: obj.sourceName,
            status: obj?.Status,
            baseUrl: obj?.baseURL,
            redirectUrl: obj?.redirectURL,
            grantType: obj?.grantType,
            username: obj?.user,
            password: obj?.password,
            clientId: obj?.clientId,
            clientSecret: obj?.clientSecret,
            locations: obj?.locationId,
            description: obj?.description,
            lastModifiedTime: obj?.createdModifiedAt ? new Date(obj.createdModifiedAt) : "",
            lastModifiedUser: obj?.createdModifiedBy,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <ModalWrapper
        open={modalOpen}
        setOpen={setModalOpen}
        maxWidth={1000}
        title={
          selectedApp.id ? (
            <>
              {selectedApp.appName}
              {selectedApp.status ? (
                <MdCheckCircle
                  style={{
                    color: "#282",
                    position: "absolute",
                    marginLeft: 10,
                  }}
                />
              ) : (
                <MdCancel
                  style={{
                    color: "#c11",
                    position: "absolute",
                    marginLeft: 10,
                  }}
                />
              )}
            </>
          ) : (
            <>New App</>
          )
        }
      >
        <ConnectedAppForm
          selectedApp={selectedApp}
          handleClose={() => {
            setModalOpen(false);
            getAllConnectedApps();
          }}
          locationOptions={locationOptions}
        />
      </ModalWrapper>

      <Box display="flex" alignItems="center" justifyContent="flex-end">
        <Tooltip title="New App">
          <IconButton
            onClick={() => {
              setSelectedApp({
                id: "",
                appName: "",
                status: false,
                grantType: "",
              });
              setModalOpen(true);
            }}
            disabled={!isOrgAdmin}
          >
            <AddIcon style={{ width: "25px", height: "25px" }} />
          </IconButton>
        </Tooltip>
      </Box>

      <div style={{ height: 20 }}></div>
      {connectedApps.length ? (
        <TableContainer style={{ overflow: "visible" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  className={classes.colHead}
                  align="center"
                  width={100}
                  style={{ borderRadius: "7px 0 0 0" }}
                >
                  Status
                </TableCell>
                <TableCell className={classes.colHead} align="left" width={175}>
                  Connected App
                </TableCell>
                <TableCell className={classes.colHead} align="left" width={200}>
                  Base URL
                </TableCell>
                <TableCell className={classes.colHead} align="left" width={175}>
                  Client ID
                </TableCell>
                <TableCell className={classes.colHead} align="left" width={300}>
                  Description
                </TableCell>
                <TableCell
                  className={classes.colHead}
                  align="left"
                  width={150}
                  style={{ borderRadius: "0 7px 0 0" }}
                >
                  Last modified
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {connectedApps.map((app) => (
                <TableRow
                  key={app.id}
                  className={classes.dataRow}
                  onClick={() => {
                    setSelectedApp({
                      id: app.id,
                      appName: app.appName,
                      status: app.status,
                      grantType: app.grantType,
                    });
                    setModalOpen(true);
                  }}
                >
                  <TableCell
                    className={classes.cell}
                    component="th"
                    scope="row"
                    style={{ paddingLeft: "10px" }}
                    align="center"
                  >
                    {app.status ? (
                      <Tooltip title="Connected">
                        <MdCheckCircle
                          style={{
                            color: "#282",
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Connection failed">
                        <MdCancel
                          style={{
                            color: "#c11",
                          }}
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell className={classes.cell} align="left">
                    {app.appName}
                  </TableCell>
                  <TableCell className={classes.cell} align="left">
                    {truncate(app.baseUrl, 27)}
                  </TableCell>
                  <TableCell className={classes.cell} align="left">
                    {truncate(app.clientId, 15)}
                  </TableCell>
                  <TableCell className={classes.cell} align="left">
                    {truncate(app.description, 30)}
                  </TableCell>
                  <TableCell className={classes.cell} align="left">
                    <p style={{ margin: 0, padding: 0 }}>
                      {app?.lastModifiedUser ? app.lastModifiedUser : ""}
                    </p>
                    <p style={{ margin: 0, padding: 0, fontSize: "0.8rem" }}>
                      {app?.lastModifiedTime
                        ? dateToString(app.lastModifiedTime)
                        : ""}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <>
          <div className={classes.imgContainer}>
            <img src={EmptyTableImg} alt="No Data" width="300px" />
          </div>
          <Typography align="center" className={classes.emptyDataText}>
            Let’s begin by adding a connected app
          </Typography>
        </>
      )}
    </>
  );
}

export default ConnectedApps;
