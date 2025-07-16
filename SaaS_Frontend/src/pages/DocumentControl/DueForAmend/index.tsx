import { useEffect, useState } from "react";
import {
  PaginationProps,
  Table,
} from "antd";
import useStyles from "./styles";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import { useSnackbar } from "notistack";
import checkRole from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";

//components

const iconColor = "#380036";
type Props = {
  handleEdit: (data: any) => void;
  getData: any;
  datas: any;
  setDatas: any;
  tabFilter: any;
};

const DueForAmend = ({
  handleEdit,
  getData,
  datas,
  setDatas,
  tabFilter,
}: Props) => {
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const [open, setOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const allOption = [{ id: "All", locationName: "All" }];
  const [locationNames, setLocationNames] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>([
    { id: "All", locationName: "All" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState<Location[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [opens, setOpens] = useState(false);
  const [selectedRef, setSelectedRef] = useState<any>(null);
  const [searchValue, setSearchValue] = useState<any>({
    searchQuery: "",
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [docViewDrawer, setDocViewDrawer] = useState<any>({
    open: false,
  });
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });
  const [count, setCount] = useState<number>();
  const userDetails = getSessionStorage();
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const classes = useStyles();

  const toggleDocViewDrawer = (record: any = {}) => {
    setDocViewDrawer({
      ...drawer,
      open: !docViewDrawer.open,
      data: {
        ...record?.document,
      },
    });
  }

    const handleEditProcessDoc = (data: any) => {
      setDrawer({
        ...drawer,
        mode: "edit",
        clearFields: false,
        toggle: false,
        data: data,
        open: !drawer.open,
      });
      // navigate(`/processdocuments/processdocument/newprocessdocument/${data.id}`);
    };

    // Handle click on topic
    const showDrawer = () => {
      setOpen(true);
    };

    // Handle modal close
    const onClose = () => {
      setOpen(false);
      //getData();
    };
    useEffect(() => {
      console.log("docs inside useeffect dueforammend ");

      if (tabFilter === "ammendDoc") {
        getData();
        setCount(datas.count);
      }
    }, [tabFilter]);

    useEffect(() => {
      console.log("CHECKCAPA datas", datas);
    }, [datas]);



    // console.log("SELECTED TOPIC ",selectedTopic)
    const columns = [
      {
        title: "Document Name",
        dataIndex: "name",
        key: "name",
        render: (text: any, record: any) => (
          <a
            onClick={() => {
              toggleDocViewDrawer(record?.document);
              // setSelectedTopic(record.documentLink);
            }}
          >
            {record?.document?.documentName}
          </a>
        ),
      },
      // {
      //   title: "Type",
      //   dataIndex: "type",
      //   key: "type",
      //   render: (_: any, record: any) => {
      //     return <div> {record?.document?.type}</div>;
      //   },
      // },
      {
        title: "Reason For Creation",
        dataIndex: "reason",
        key: "reason",
        render: (_: any, record: any) => {
          return <div> {record?.comments}</div>;
        },
      },
      {
        title: "Unit",
        dataIndex: "location",
        key: "location",
        render: (_: any, record: any) => {
          return (
            <div>
                {record?.document?.location?.locationName}
            </div>
          );
        },
      },
      {
        title: "Department",
        dataIndex: "entity",
        key: "entity",
        render: (_: any, record: any) => {
          return (
            <div>
                {record?.document?.entity?.entityName}
            </div>
          );
        },
      },
      {
        title: "Created Date",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (_: any, record: any) => {
          return <div> {record?.createdAt}</div>;
        },
      },
      // {
      //   title: "Actions",
      //   dataIndex: "actions",
      //   key: "actions",
      //   render: (_: any, record: any, index: any) => {
      //     return (
      //       !record?.document?.isVersion && (
      //         <div style={{ display: "flex" }}>
      //           {console.log("docs inside if ", record)}
      //           {record?.document?.editAcess ? (
      //             // <Tooltip title="Click to Amend">
      //             <IconButton
      //               className={classes.actionButtonStyle}
      //               data-testid="action-item"
      //               onClick={() => handleEditProcessDoc(record?.document)}
      //               style={{ color: iconColor }}
      //             >
      //               <div>
      //                 <CustomEditIcon width={18} height={18} />
      //               </div>
      //             </IconButton>
      //           ) : (
      //             // </Tooltip>
      //             ""
      //           )}
      //           <Divider type="vertical" className={classes.docNavDivider} />
      //           {record?.document?.deleteAccess ? (
      //             <IconButton
      //               className={classes.actionButtonStyle}
      //               data-testid="action-item"
      //               // onClick={() => handleOpen(record.id)}
      //               style={{ color: iconColor }}
      //             >
      //               <CustomDeleteICon width={18} height={18} />
      //             </IconButton>
      //           ) : (
      //             ""
      //           )}
      //         </div>
      //       )
      //     );
      //   },
      // },
    ];
    useEffect(() => {
      getLocationNames();
    }, []);

    const realmName = getAppUrl();

    const getLocationNames = async () => {
      setIsLoading(true);
      try {
        setIsLoading(true);
        const res = await axios.get(
          `api/location/getLocationsForOrg/${realmName}`
        );
        console.log("res", res);
        setLocationName(res.data[0].locationName);
        setLocationNames(res.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    return (
      <>
        <div className={classes.tableContainer}>
          {datas?.length && (
            <Table
              columns={columns}
              dataSource={datas}
              rowKey="_id"
              className={classes.tableContainer}
              pagination={false}
            />
          )}

          {/* <div>
            {!!drawer.open && (
              <DocumentDrawer
                drawer={drawer}
                setDrawer={setDrawer}
                handleFetchDocuments={() => {}}
              />
            )}
          </div>
          <div>
            {!!docViewDrawer.open && (
              <DocumentViewDrawer
                docViewDrawer={docViewDrawer}
                setDocViewDrawer={setDocViewDrawer}
                toggleDocViewDrawer={toggleDocViewDrawer}
                handleFetchDocuments={() => {}}
              />
            )}
          </div> */}
        </div>
      </>
    );
  };

export default DueForAmend;
