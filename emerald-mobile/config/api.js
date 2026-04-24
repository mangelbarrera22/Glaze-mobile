import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl ?? "http://192.168.101.60:3000";

export default API_BASE_URL;