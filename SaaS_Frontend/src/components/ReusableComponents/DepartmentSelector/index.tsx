import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Popover,
  Input,
  Select,
  Space,
  Typography,
  Divider,
  Tag,
} from "antd";
import { FiSearch, FiX, FiChevronDown } from "react-icons/fi";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import getSessionStorage from "utils/getSessionStorage";

const { Text } = Typography;
const { Option, OptGroup } = Select;

type EntityType = {
  id: string;
  name: string;
};

type Department = {
  id: string;
  name: string;
};

type DepartmentSelectorProps = {
  //   entityTypes: EntityType[];
  //   departmentsByType: Record<string, Department[]>;
  locationId?: any;
  selectedDepartment: {
    id: string;
    name: string;
    type: string;
    entityTypeId?: string;
    entityName: string;
  } | null;
  onSelect: (dept: Department, type: string) => void;
  onClear: () => void;
  disabled?: boolean;
};

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  locationId,
  selectedDepartment,
  onSelect,
  onClear,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const orgName = getAppUrl();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [entityTypes, setEntityTypes] = useState<any>([]);
  const userDetails = getSessionStorage();
  const [departmentsByType, setDepartmentsByType] = useState<any>({});
  const [parent, setParent] = useState<any>();
  const resolvedTypeName = useMemo(() => {
    if (!selectedDepartment || !entityTypes?.length) return null;
    return (
      selectedDepartment.type ||
      entityTypes.find((et: any) => et.id === selectedDepartment.entityTypeId)
        ?.name ||
      ""
    );
  }, [selectedDepartment, entityTypes]);

  useEffect(() => {
    getEntityTypes();
    if (!!locationId) {
      getEntitiesForEntityType();
    }
  }, []);
  useEffect(() => {
    getEntitiesForEntityType();
  }, [locationId]);

  useEffect(() => {
    if (selectedDepartment && entityTypes.length > 0) {
      const typeName =
        entityTypes.find(
          (et: any) => et.id === selectedDepartment?.entityTypeId
        )?.name || "";

      setParent({
        id: selectedDepartment.id,
        name: selectedDepartment.entityName,
        type: typeName,
      });
    }
  }, [selectedDepartment, entityTypes]);

  const getEntityTypes = async () => {
    try {
      const entityTypesRes = await axios.get(
        `api/entity/getEntityTypes/byOrg/${orgName}`
      );
      setEntityTypes(entityTypesRes.data);

      //   // Fetch parent only after entityTypes are available
      //   if (!!parentId) {
      //     fetchParentEntity(parentId, entityTypesRes.data);
      //   }
    } catch (error) {
      // console.error("Failed to fetch entity types", error);
    }
  };
  // console.log("entitytypes", entityTypes);
  const getEntitiesForEntityType = async () => {
    try {
      const entityTypesRes = await axios.get(
        `api/entity/getEntitiesForEntityType/${userDetails?.organizationId}?locationId=${locationId}`
      );
      // console.log("entities", entityTypesRes);
      setDepartmentsByType(entityTypesRes.data);
    } catch (error) {
      setDepartmentsByType({});
    }
  };

  const handleSelect = (dept: Department, typeId: string) => {
    const type = entityTypes.find((t: any) => t.id === typeId);
    onSelect(dept, type?.name || "All");
    setOpen(false);
  };

  const filtered = (typeName: string) => {
    const list = departmentsByType[typeName] || [];
    // console.log;
    return list.filter((d: any) =>
      d.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  // console.log("locatonId in master", locationId);
  const content = (
    <div style={{ width: 450 }}>
      <Divider style={{ margin: "8px 0" }} />

      <Text strong>Entity Type:</Text>
      <div
        style={{ margin: "8px 0", display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {entityTypes.map((type: any) => (
          <Tag
            key={type.id}
            color={selectedType === type.id ? "blue" : "default"}
            onClick={() => {
              if (disabled) return;
              setSelectedType(selectedType === type.id ? null : type.id);
            }}
            style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          >
            {type.name}
          </Tag>
        ))}
        {selectedType && (
          <Tag
            onClick={() => {
              if (disabled) return;
              setSelectedType(null);
            }}
            style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          >
            Show All
          </Tag>
        )}
      </div>

      <Divider style={{ margin: "8px 0" }} />

      <Select
        style={{ width: "100%" }}
        size="middle"
        placeholder="Select entity"
        disabled={disabled}
        onSelect={(val: any, option: any) => {
          if (disabled) return;
          if (val === "All") {
            handleSelect({ id: "All", name: "All" }, "All");
          } else {
            const { dept, typeId } = option as any;
            handleSelect(dept, typeId);
          }
        }}
        showSearch
        filterOption={(input, option) => {
          const label = option?.label ?? option?.children;
          return (
            typeof label === "string" &&
            label.toLowerCase().includes(input.toLowerCase())
          );
        }}
        notFoundContent="No departments found"
        value={selectedDepartment?.id}
        dropdownStyle={{ zIndex: 1400 }}
      >
        <Option value="All" label="All" onClick={() => !disabled && onClear()}>
          All
        </Option>

        {(selectedType
          ? entityTypes.filter((et: any) => et.id === selectedType)
          : entityTypes
        ).map((et: any) => {
          const departments = filtered(et.name);
          if (!departments.length) return null;

          return (
            <OptGroup key={et.id} label={et.name}>
              {departments.map((dept: any) => (
                <Option
                  key={dept.id}
                  value={dept.id}
                  label={dept.name}
                  dept={dept}
                  typeId={et.id}
                >
                  {dept.name}
                </Option>
              ))}
            </OptGroup>
          );
        })}
      </Select>
    </div>
  );

  // console.log("selected department", selectedDepartment);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* <Text strong style={{ fontSize: 13 }}>
        Department:
      </Text> */}

      <div style={{ position: "relative" }}>
        {/* <label
          style={{
            fontSize: 12,
            color: "#888",
            position: "absolute",
            top: -8,
            left: 4,
            background: "#fff",
            padding: "0 4px",
            zIndex: 1,
          }}
        >
          Entity
        </label> */}

        <Popover
          open={!disabled ? open : false}
          onOpenChange={(next) => !disabled && setOpen(next)}
          content={content}
          trigger="click"
          placement="bottomLeft"
          overlayStyle={{ width: 500 }}
          getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
          destroyTooltipOnHide
        >
          <div style={{ position: "relative" }}>
            <Button
              block
              size="middle"
              onClick={() => !disabled && setOpen(true)}
              disabled={disabled}
              style={{
                textAlign: "left",
                height: 40,
                paddingRight: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: disabled ? "#000" : undefined,
                opacity: disabled ? 1 : undefined,
                ...(disabled && {
                  backgroundColor: "#fff",
                  color: "#000",
                  opacity: 1,
                }),
              }}
            >
              {selectedDepartment ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Tag>{resolvedTypeName}</Tag>
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {selectedDepartment.name || selectedDepartment.entityName}
                  </span>
                  <FiX
                    onClick={(e) => {
                      if (disabled) return;
                      e.stopPropagation();
                      onClear();
                    }}
                    style={{
                      cursor: disabled ? "not-allowed" : "pointer",
                      color: "#999",
                      fontSize: 14,
                      marginLeft: 4,
                      padding: 2,
                      borderRadius: 4,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!disabled)
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }}
                    onMouseLeave={(e) => {
                      if (!disabled)
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  />
                </div>
              ) : (
                <span style={{ color: "#999" }}>Select Entity</span>
              )}
            </Button>
            <FiChevronDown
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#aaa",
              }}
            />
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default DepartmentSelector;
