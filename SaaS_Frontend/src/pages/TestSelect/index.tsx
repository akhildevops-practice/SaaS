import { useState } from "react";
import { Modal } from "antd";
// import CustomMultiSelect from "components/ReusableComponents/CustomMultiSelect";

import { API_LINK } from "config";
import axios from "apis/axios.global";
import { debounce } from "lodash";
// import CustomMultiSelect from "components/ReusableComponents/CustomMultiSelect";

const TestSelect = () => {
  const [open, setOpen] = useState(true);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  const fetchUserList = async (value = "") => {
    try {
      setFetching(true);
      const res = await axios.get(
        `/api/riskregister/getuserlist?search=${value}`
      );
      const userOptions = res.data.map((user: any) => ({
        value: user.id,
        label: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        entityName: user.entity?.entityName,
        avatar: user.avatar ? `${API_LINK}/${user.avatar}` : "",
      }));

      setUserOptions(userOptions);
      setFetching(false);
    } catch (error) {
      console.error(error);
      setFetching(false);
    }
  };

  const debouncedFetchUsers = debounce((value) => {
    fetchUserList(value);
  }, 400);

  const handleSearchChange = (value: string) => {
    debouncedFetchUsers(value);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  return (
    <Modal
      title="Send For Review"
      centered
      open={open}
      onCancel={handleCloseModal}
      footer={null}
      width={600}
    >
      {/* <CustomMultiSelect
        label="Select Users:"
        placeholder="Search and Select Users"
        options={userOptions}
        selectedValues={selectedValues}
        onChange={setSelectedValues}
        onSearch={handleSearchChange}
        fetching={fetching}
        maxTagCount={4}
      /> */}
    </Modal>
  );
};

export default TestSelect;
