import { serverUrl } from "../../configClientDev";
import convertBase64 from "./convertBase64";

export default async function getImageFromDb(picId) {
  let result = null;
  await fetch(`${serverUrl}/image/get/${picId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": true,
    },
  })
    .then((response) => {
      if (response.status === 200) return response.json();
      throw new Error(response.status);
    })
    .then((res) => {
      result = convertBase64(res.data);
    })
    .catch((err) => {
      console.log(err);
    });

  return result;
}
