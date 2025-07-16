import axios from "apis/axios.global";

const getYearFormat = async (currentYear: any) => {
  try {
    const orgId = sessionStorage.getItem("orgId");
    const result: any = await axios.get(
      `/api/organization/getFiscalYear/${orgId}?searchyear=${currentYear}`
    );
    return result.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};
export default getYearFormat;
