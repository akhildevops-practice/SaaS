import { useEffect, useState, useRef } from "react";
import { Select, Table, Tag, Spin, Modal } from "antd";
import { debounce } from "lodash";
import useStyles from "./style";
import axios from "../../../apis/axios.global";
import getAppUrl from "../../../utils/getAppUrl";
import { API_LINK } from "../../../config";
import { MdError } from "react-icons/md";
const { confirm } = Modal;
const { Option } = Select;
const initialNames = [
  "John Doe Robert Johnson Robert Johnson Robe rt Johnson Robert Johnson",
  "John Doe Robert Johnson Robert Johnson ",
  "Jane Smith",
  "Robert Johnson",
  "Michael Williams",
  "William Brown",
  "David Jones",
  "Richard Miller",
  "Charles Davis",
  "Joseph Martinez",
  "Thomas Garcia",
  "Sarah Johnson",
  "Emily Anderson",
  "Christopher Wilson",
  "Jennifer Thompson",
  "Daniel Moore",
  "Jessica White",
  "Matthew Taylor",
  "Olivia Martinez",
  "Andrew Clark",
  "Sophia Davis",
  "Jacob Anderson",
  "Ava Robinson",
  "James Garcia",
  "Isabella Martin",
  "Benjamin Lewis",
  "Mia Thomas",
  "Logan Hernandez",
  "Abigail Jackson",
  "Ethan Young",
  "Charlotte Harris",
].sort();
const RolesTable = () => {
  const [locations, setLocations] = useState<any>([]);
  const [randomNames, setRandomNames] = useState<any>(initialNames);
  const [options, setOptions] = useState<any>([]);
  const [fetching, setFetching] = useState<any>(false);
  const [searchQuery, setsearchQuery] = useState<any>(undefined);
  const [showDropdown, setShowDropdown] = useState<any>(true);
  const [showPopConfirm, setShowPopConfirm] = useState<boolean>(false);
  const selectRef = useRef<any>(null);
  const orgName = getAppUrl();
  const classes = useStyles();

  useEffect(() => {
    // Update tableData when randomNames change
    setTableData((prevTableData: any) =>
      prevTableData.map((item: any) => ({
        ...item,
        unitAdmins: randomNames,
      }))
    );
  }, [randomNames]);

  const fetchUserList = async (value = "") => {
    console.log("vaue in fetchuser list", value);

    try {
      setFetching(true);
      const encodedValue = encodeURIComponent(value);
      const res = await axios.get(
        `api/riskregister/getuserlist?search=${encodedValue}`
      );

      if (!!res.data && res.data.length > 0) {
        const userOptions = res.data.map((user: any) => ({
          value: user.id,
          label: user.email,
          email: user.email,
          avatar: user.avatar ? `${API_LINK}/${user.avatar}` : "",
          fullname: user.firstname + " " + user.lastname,
        }));
        setFetching(false);
        return userOptions;
      } else {
        setFetching(false);
        setsearchQuery(undefined);
        setOptions([]);
      }
    } catch (error) {
      setFetching(false);
      console.log(error);
    }
  };

  const debouncedFetchUsers = debounce(async (value: any) => {
    const newOptions = await fetchUserList(value);
    console.log("newOptions", newOptions);

    setOptions(!!newOptions && newOptions);
  }, 500);

  const handleSearchChange = async (value: any) => {
    // console.log("value in handlesearchchagne=>", value);
    // setShowDropdown(true);
    setsearchQuery(value);
    debouncedFetchUsers(value);
  };

  const handleSelect = (value: any, option: any) => {
    // console.log("value", value);
    // console.log("option", option);

    // Append selected user to randomNames
    setRandomNames((prevRandomNames: any) => [
      ...prevRandomNames,
      option.label,
    ]);

    // Clear the select field
    setOptions([]);
    setsearchQuery(undefined);
  };

  const handleIconClick = (e: any) => {
    e.stopPropagation();
    // setShowPopConfirm(false);
  };

  const showDeleteConfirm = (e: any) => {
    e.stopPropagation();
    confirm({
      title: "Are you sure delete this task?",
      icon: <MdError />,
      content: "Some descriptions",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        console.log("OK");
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleClose = (e: any) => {
    e.preventDefault();
    setShowPopConfirm(true);
  };

  const columns = [
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      // width: 100,
    },
    {
      title: "Unit Admins",
      dataIndex: "unitAdmins",
      key: "unitAdmins",
      // width: 100,
      render: (text: any, record: any, index: any) => (
        <div className={classes.scrollableDiv}>
          {record.unitAdmins.map((item: any, index: any) => (
            <div key={index}>
              <Tag
                closable
                // onClick={(e: any) => handleIconClick(e)}
                // onClose={(e) => showDeleteConfirm(e)}
                onClose={(e) => handleClose(e)}
              >
                {item}
              </Tag>
            </div>
          ))}
          <Select
            // id={Math.random().toString()}
            showSearch
            ref={selectRef}
            // autoFocus={true}
            onBlur={() => setsearchQuery(undefined)}
            // onMouseLeave={() => {
            //   setsearchQuery(undefined);
            //   setOptions([]);
            //   console.log("mouse left");
            // }}
            placeholder="Search and Add User"
            notFoundContent={
              fetching ? <Spin size="small" /> : "No results found"
            }
            filterOption={(input: any, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            // onMouseLeave={() => setShowDropdown(false)}
            onSearch={handleSearchChange}
            onSelect={handleSelect}
            size="middle"
            optionLabelProp="label"
            style={{ width: "197px" }}
            value={searchQuery}
          >
            {!!options &&
              !!options.length &&
              // !!showDropdown &&
              options?.map((option: any) => (
                <Option
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  children={<>{option.label}</>}
                />
              ))}
          </Select>
        </div>
      ),
    },
    {
      title: "IMS Coordinators",
      dataIndex: "imsc",
      key: "imsc",
      // width: 100,
      render: (text: any, record: any) => (
        <div className={classes.scrollableDiv}>
          {record.unitAdmins.map((item: any, index: any) => (
            <div key={index}>
              <Tag
                closable
                onClick={(e: any) => handleIconClick(e)}
                onClose={showDeleteConfirm}
              >
                {item}
              </Tag>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Reviewers",
      dataIndex: "reviewers",
      key: "reviewers",
      // width: 100,
      render: (text: any, record: any) => (
        <div className={classes.scrollableDiv}>
          {record.unitAdmins.map((item: any, index: any) => (
            <div key={index}>
              <Tag
                closable
                //  onClose={() => handleTagClose(record.key, item)}
              >
                {item}
              </Tag>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Approvers",
      dataIndex: "approvers",
      key: "approvers",
      // width: 100,
      render: (text: any, record: any) => (
        <div className={classes.scrollableDiv}>
          {record.unitAdmins.map((item: any, index: any) => (
            <div key={index}>
              <Tag
                closable
                //  onClose={() => handleTagClose(record.key, item)}
              >
                {item}
              </Tag>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Auditors",
      dataIndex: "auditors",
      key: "auditors",
      // width: 100,
      render: (text: any, record: any) => (
        <div className={classes.scrollableDiv}>
          {record.unitAdmins.map((item: any, index: any) => (
            <div key={index}>
              <Tag
                closable
                //  onClose={() => handleTagClose(record.key, item)}
              >
                {item}
              </Tag>
            </div>
          ))}
        </div>
      ),
      // render: (text: any, record: any) => (
      //   <div className={classes.scrollableDiv}>
      //     <Popover placement="bottom" content={newUserForm} trigger="click">
      //       <Tag style={{ display: "inline-flex", alignItems: "center" }}>
      //         <AddIcon style={{ width: "0.89em", height: "0.89em" }} /> Add User
      //       </Tag>
      //     </Popover>
      //   </div>
      // ),
    },
  ];
  const [tableData, setTableData] = useState<any>([
    {
      key: "1",
      unit: "Aditya",
      unitAdmins: randomNames,
    },
    {
      key: "2",
      unit: "Taloja",
      unitAdmins: randomNames,
    },
    {
      key: "3",
      unit: "Hirakud",
      unitAdmins: randomNames,
    },
    {
      key: "4",
      unit: "Mahan",
      unitAdmins: randomNames,
    },
    {
      key: "5",
      unit: "Renukoot",
      unitAdmins: randomNames,
    },
    {
      key: "6",
      unit: "Belagavi",
      unitAdmins: randomNames,
    },
  ]);

  return (
    <>
      <div className={classes.tableContainer}>
        <Table
          // style={{ width: "80%" }}
          columns={columns}
          dataSource={tableData}
        />
        <Modal
          title={
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px",
              }}
            >
              <MdError />{" "}
              <span style={{ padding: "2px" }}>
                Are you sure to delete this user?
              </span>
            </div>
          }
          // icon={<MdError />}
          open={showPopConfirm}
          onOk={() => setShowPopConfirm(false)}
          onCancel={() => setShowPopConfirm(false)}
          okText="Yes"
          okType="danger"
          cancelText="No"
        />
        {/* <p>Some descriptions</p>
        </Modal> */}
      </div>
    </>
  );
};

export default RolesTable;

/**
 * 
 * 
 *       // render: (text: any, record: any) => (
      //   <div className={classes.listWrapper}>
      //     <List>
      //       {record.unitAdmins.map((item: any, index: any) => (
      //         <ListItem key={index} style={{ padding: "0px" }} disableGutters>
      //           <ListItemText
      //             primary={
      //               <div style={{ textAlign: "center" }}>
      //                 <Tag
      //                   closable
      //                   // onClose={() => handleTagClose(record.key, item)}
      //                 >
      //                   {item}
      //                 </Tag>
      //               </div>
      //             }
      //           />
      //         </ListItem>
      //       ))}
      //     </List>
      //   </div>
      // ), useEffect(() => {
    getLocations();
  }, []);

  useEffect(() => {
    addLocationToTable();
  }, [locations]);

  const getLocations = async () => {
    const res = await axios.get(`/api/location/${orgName}`);
    console.log(res);

    setLocations(
      res.data.data?.map((item: any) => ({
        label: item.locationName,
        value: item.id,
      }))
    );
  };

  const addLocationToTable = () => {
    console.log("locations", locations);

    const updatedTableData = tableData.map((item: any, index: number) => {
      if (!!locations && locations[index]) {
        return {
          ...item,
          unit: locations[index].label,
        };
      }
      return item;
    });
    console.log(updatedTableData);

    setTableData(updatedTableData);
  };
 */
