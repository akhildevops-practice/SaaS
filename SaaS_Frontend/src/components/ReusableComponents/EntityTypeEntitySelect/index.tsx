import React, { useEffect, useState } from "react";
import { Button, Modal, Select, Input, Tag, Space } from "antd";
import { DownOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import getAppUrl from "utils/getAppUrl";
import axios from "apis/axios.global";

const { Option } = Select;
const { Search } = Input;

type EntityType = {
  id: string;
  name: string;
};

type Entity = {
  entityName: string;
  id: string;
  name: string;
};

type Props = {
  value?: { id: string; name: string; type: string } | null;
  onChange?: any;
  parentId?: any;
};

const ParentEntitySelector: React.FC<Props> = ({
  value,
  onChange,
  parentId,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const orgName = getAppUrl();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [entityTypes, setEntityTypes] = useState<any>([]);
  const [entities, setEntities] = useState<any>([]);
  const [parent, setParent] = useState<any>({});

  useEffect(() => {
    getEntityTypes();
  }, []);
  // useEffect(() => {
  //   if (parentId) {
  //     fetchParentEntity(parentId);
  //   }
  // }, [parentId]);

  const fetchParentEntity = async (parentId: any, entitytypes: any) => {
    try {
      const typeName =
        entitytypes.find((t: any) => t.id === parentId?.entityTypeId)?.name ||
        "Unknown";
      // console.log("typename", typeName);
      setParent({
        id: parentId?.id,
        name: parentId?.entityName,
        type: typeName,
      });
    } catch (err) {
      console.error("Failed to fetch parent entity", err);
    }
  };

  const handleSelectEntity = (entity: Entity) => {
    const typeName =
      entityTypes.find((t: any) => t.id === selectedType)?.name || "";
    onChange({ id: entity.id, name: entity.entityName, type: typeName });
    setParent({
      id: entity.id,
      name: entity.entityName,
      type: typeName,
    });
    setModalOpen(false);
    setSelectedType(null);
    setSearchText("");
  };

  //   const filteredEntities =
  //     selectedType && entities[selectedType]
  //       ? entities[selectedType].filter((e:any) =>
  //           e.name.toLowerCase().includes(searchText.toLowerCase())
  //         )
  //       : [];
  const getEntityTypes = async () => {
    try {
      const entityTypesRes = await axios.get(
        `api/entity/getEntityTypes/byOrg/${orgName}`
      );
      setEntityTypes(entityTypesRes.data);

      // Fetch parent only after entityTypes are available
      if (!!parentId) {
        fetchParentEntity(parentId, entityTypesRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch entity types", error);
    }
  };
  // console.log("selectedtype", selectedType);
  const getEntitiesForEntityType = async (value: any) => {
    try {
      const entityTypesRes = await axios.get(
        `api/entity/getEntitiesForEntityType/${value}`
      );
      setEntities(entityTypesRes.data);
    } catch (error) {
      setEntities([]);
    }
  };
  return (
    <>
      <Button
        block
        onClick={() => setModalOpen(true)}
        icon={null}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {parent ? (
          <span>
            <Tag>{parent?.type}</Tag> {parent?.name}
          </span>
        ) : (
          "Select parent entity"
        )}
        <DownOutlined style={{ marginLeft: 8, color: "#999" }} />
      </Button>

      <Modal
        title={!selectedType ? "Select Entity Type" : null}
        open={modalOpen}
        footer={null}
        width={500}
        centered
        destroyOnClose
        getContainer={false}
      >
        {!selectedType ? (
          <Select
            style={{ width: "100%" }}
            placeholder="Select entity type"
            onSelect={(typeId) => {
              // console.log("typedId", typeId);
              getEntitiesForEntityType(typeId);
              setSelectedType(typeId);
            }}
          >
            {entityTypes?.map((type: any) => (
              <Option key={type.id} value={type.id}>
                {type.name}
              </Option>
            ))}
          </Select>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => setSelectedType(null)}
              >
                Back to entity types
              </Button>
              <div style={{ fontWeight: 500 }}>
                Selected:{" "}
                {entityTypes.find((t: any) => t.id === selectedType)?.name}
              </div>
            </div>

            <Search
              placeholder="Search entity..."
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginBottom: 12 }}
            />

            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {entities?.map((entity: any) => (
                <div
                  key={entity.id}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    backgroundColor:
                      value?.id === entity.id ? "#f0f0f0" : undefined,
                  }}
                  onClick={() => handleSelectEntity(entity)}
                >
                  {entity.entityName}
                </div>
              ))}
              {entities.length === 0 && <div>No entity found.</div>}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default ParentEntitySelector;
