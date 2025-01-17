import axios from "axios";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

if (process.env.VUE_APP_GUEST_USER_TOKEN) {
  axios.defaults.headers.common[
    "Authorization"
  ] = `Token ${process.env.VUE_APP_GUEST_USER_TOKEN}`;
}

if (process.env.VUE_APP_USERNAME) {
  axios.defaults.headers.common["Authorization"] =
    "Basic " +
    btoa(process.env.VUE_APP_USERNAME + ":" + process.env.VUE_APP_PASSWORD);
}

const HTTP = axios.create({
  baseURL: process.env.VUE_APP_API_URL || `/api/v3/`
});

const IMG_REQUEST = axios.create({
  baseURL: process.env.VUE_APP_DOCUMENT_IMAGES_URL || ``,
  responseType: "blob"
});

export default {
  axios,
  HTTP,
  IMG_REQUEST
};
