import ShortUniqueId from "short-unique-id";

export const generateUniqueId = (length: number): string => {
  const uid = new ShortUniqueId({ length: length });
  return uid();
};
