import React, { useEffect, useState } from "react";
import { Button, Modal, Select } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import axios from "apis/axios.global";
import { API_LINK } from "config";
type Props = {
  visible: any;
  onCancel: any;
  userOptions: any;
  selectedRow: any;
  setSelectedRow: any;
};
const AddParticipantsModal = ({
  visible,
  onCancel,
  userOptions,
  selectedRow,
  setSelectedRow,
}: Props) => {
  const [selectedParticipants, setSelectedParticipants] = useState(
    (!!selectedRow && selectedRow?.participants) || []
  );
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  // const [userOptions, setUserOptions] = useState<any>([]);

  useEffect(() => {
    // getUserOptions();
    if (!!selectedRow && selectedRow?.participants?.length > 0) {
      setSelectedParticipants(selectedRow?.participants);
    } else {
      getAgendaOwners();
    }
  }, [visible]);

  const getAgendaOwners = async () => {
    try {
      const result = await axios.get(
        `${API_LINK}/api/mrm/getAllAgendOwnersIdByMeetingType/${selectedRow?._id}`
      );

      const getUserById = (id: string) => {
        return userOptions?.find((user: any) => user.id === id);
      };

      if (result?.data) {
        // Combine the fetched IDs and selectedRow owners
        const combinedIds = [
          ...result?.data,
          ...selectedRow?.owner.map((owner: any) => owner.id),
        ];

        // Remove duplicate IDs
        const uniqueIds = [...new Set(combinedIds)];

        // Map the unique IDs to user objects
        const participants = uniqueIds.map((id: string) => getUserById(id));

        setSelectedParticipants(participants);
      } else {
        // Handle case when result.data is empty or not available
        const uniqueOwners = selectedRow?.owner?.map((owner: any) => owner.id);
        const uniqueIds = [...new Set(uniqueOwners)];

        // Map the unique IDs to user objects
        const participants = uniqueIds.map((id: any) => getUserById(id));

        setSelectedParticipants(participants);
      }
    } catch (error) {
      console.error("Error fetching agenda owners:", error);
      setSelectedParticipants([]);
    }
  };

  console.log("selectedPArticipatns", selectedParticipants);
  // const getUserOptions = async () => {
  //   try {
  //     if (selectedRow?.location?.length > 0) {
  //       let res;
  //       // console.log("addkeyagenda", addKeyAgenda, buttonStatus);
  //       const ids: String[] =
  //         selectedRow.location?.length > 0
  //           ? selectedRow.location
  //           : userDetail?.location?.id;
  //       // console.log("ids", ids);
  //       res = await axios.get(
  //         `/api/mrm/getUsersForLocations?orgId=${userDetail.organizationId}&location=${ids}`
  //       );

  //       // console.log("Response from users", res);

  //       const users = res.data;

  //       if (users && users.length > 0) {
  //         const ops = users.map((obj: any) => ({
  //           id: obj.id,
  //           name: obj.username,
  //           avatar: obj.avatar,
  //           email: obj.email,
  //           username: obj?.username,
  //           value: obj.id,
  //           label: obj.email,
  //           fullname: `${obj.firstname} ${obj.lastname}`,
  //         }));
  //         setUserOptions(ops);
  //       } else {
  //         setUserOptions([]);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error fetching user options:", err);
  //     // Optionally handle the error (e.g., set an error state, show a message, etc.)
  //   }
  // };
  const handleSave = async () => {
    const payload = {
      ...selectedRow,
      participants: selectedParticipants,
    };
    const res = await axios.patch(
      `/api/keyagenda/${selectedRow?._id}`,
      payload
    );
    setSelectedParticipants([]);
    setSelectedRow(null);
    // onSave(selectedParticipants); // Pass the selected participants to the parent component
    onCancel(); // Close the modal
  };
  const handleClose = () => {
    setSelectedParticipants([]);
    setSelectedRow(null);
    onCancel();
  };
  // console.log("selectedPArticpants", selectedParticipants);
  return (
    <Modal
      title="Add Participants"
      visible={visible}
      onCancel={handleClose}
      width={800}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      footer={[
        <Button key="save" type="primary" onClick={handleSave}>
          Add
        </Button>,
      ]}
    >
      <Select
        showSearch
        mode="multiple"
        placeholder="Select Participants"
        options={userOptions || []}
        value={selectedParticipants || selectedRow?.participants || []}
        onChange={(newSelectedParticipants) => {
          const selectedUsers = newSelectedParticipants
            ?.map((userId: any) =>
              userOptions.find((user: any) => user.value === userId)
            )
            .filter(Boolean);
          setSelectedParticipants(selectedUsers);
        }}
        style={{ width: "100%", paddingTop: "30px" }}
        allowClear
        filterOption={(input: any, option: any) =>
          option.label?.toLowerCase().includes(input.toLowerCase())
        }
        dropdownStyle={{ maxHeight: 200 }}
      ></Select>
    </Modal>
  );
};
export default AddParticipantsModal;
