import axios from "axios";
import { getGPG45ProfileAPI } from "./config";

export async function postGPG45ProfileJSON(data: any): Promise<any> {
  const result = await axios.post(getGPG45ProfileAPI(), data);
  return result.data;
}
