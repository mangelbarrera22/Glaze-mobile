import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl ?? "https://glaze-backend-production-ad01.up.railway.app";

export default API_BASE_URL;