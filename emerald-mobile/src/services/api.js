import axios from "axios";

export default axios.create({
 baseURL: "http://192.168.101.60:3000/api"
});