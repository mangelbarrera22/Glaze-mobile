import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator,
  SafeAreaView 
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config/api";
import { Feather } from "@expo/vector-icons";

export default function Login() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const iniciarSesion = async () => {
    if (!usuario || !password) {
      setMensaje("Por favor rellena todos los campos");
      return;
    }
    setLoading(true);
    setMensaje("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.mensaje || "Credenciales incorrectas");
        return;
      }

      const { token, usuario: userData } = data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("usuario", JSON.stringify(userData));

      if (userData.tipo_usuario === "vendedor") {
        router.replace("/dashboard-vendedor");
      } else {
        router.replace("/dashboard");
      }
    } catch (error) {
      setMensaje("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* HEADER CON LOGO GLAZE */}
          <View style={styles.header}>
            <Image 
              source={require("../assets/images/LOGOS/Imagotipo/Glaze-verde.png")}
              style={styles.logoGlaze}
              resizeMode="contain"
            />
            <Text style={styles.brandSubtitle}>ESMERALDAS DE COLECCIÓN</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Acceso Exclusivo</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>NOMBRE DE USUARIO</Text>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={18} color="#94a3b8" />
                <TextInput
                  placeholder="ej. usuario.usuario"
                  placeholderTextColor="#cbd5e1"
                  style={styles.input}
                  value={usuario}
                  onChangeText={setUsuario}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>CONTRASEÑA</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#94a3b8" />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#cbd5e1"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#1f6f54" />
                </TouchableOpacity>
              </View>
            </View>

            {mensaje ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{mensaje}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={[styles.botonPrincipal, loading && styles.botonDisabled]} 
              onPress={iniciarSesion}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.botonText}>INICIAR SESIÓN</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/register")} style={styles.registerLink}>
              <Text style={styles.footerText}>
                ¿No es miembro? <Text style={styles.linkBold}>Solicitar Registro</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0a3d2e",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 35,
  },
  logoGlaze: {
    width: 330,
    height: 150,
    marginTop: 10,
  },
  brandSubtitle: {
    fontSize: 10,
    letterSpacing: 4,
    color: "rgba(255,255,255,0.6)",
    marginTop: -5,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 2, 
    padding: 35,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: "#0a3d2e",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 1,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#1e293b",
  },
  botonPrincipal: {
    backgroundColor: "#1f6f54",
    paddingVertical: 18,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#1f6f54",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  botonDisabled: {
    opacity: 0.7,
  },
  botonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 2,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "#fff1f2",
    padding: 12,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#e11d48",
  },
  errorText: {
    color: "#e11d48",
    fontSize: 12,
  },
  registerLink: {
    marginTop: 30,
    alignItems: "center",
  },
  footerText: {
    color: "#64748b",
    fontSize: 13,
  },
  linkBold: {
    color: "#1f6f54",
    fontWeight: "700",
  }
});