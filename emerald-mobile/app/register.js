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
import API_BASE_URL from "../config/api";
import { Feather } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [usuarioDisponible, setUsuarioDisponible] = useState(null);
const [verificandoUsuario, setVerificandoUsuario] = useState(false);
  const [error, setError] = useState(false);

  const [form, setForm] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    correo: "",
    celular: "",
    tipo_usuario: "comprador",
    password: "",
    confirmarPassword: ""
  });

  const handleChange = (name, value) => {

  setForm({
    ...form,
    [name]: value
  });

  if (name === "usuario") {

    clearTimeout(global.usuarioTimer);

    global.usuarioTimer = setTimeout(() => {
      verificarUsuario(value);
    }, 500);

  }

};
  const verificarUsuario = async (usuario) => {

  if (!usuario.trim()) {
    setUsuarioDisponible(null);
    return;
  }

  try {
    setVerificandoUsuario(true);

    const res = await fetch(
      `${API_BASE_URL}/api/auth/verificar-usuario/${usuario}`
    );

    const data = await res.json();

    setUsuarioDisponible(data.disponible);

  } catch (e) {
    setUsuarioDisponible(null);
  } finally {
    setVerificandoUsuario(false);
  }

};
  const handleRegister = async () => {
    if (form.password !== form.confirmarPassword) {
      setError(true);
      setMensaje("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setMensaje("");
    setError(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al registrar");
      setMensaje(`${data.mensaje} | Usuario: ${data.usuario}`);
    } catch (err) {
      setError(true);
      setMensaje(err.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* HEADER CON LOGO GLAZE */}
          <View style={styles.header}>
            <Image 
              source={require("../assets/images/LOGOS/Imagotipo/Glaze-blanco.png")} 
              style={styles.logoGlaze}
              resizeMode="contain"
            />
            <Text style={styles.brandSubtitle}>CREAR CUENTA EXCLUSIVA</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Registro de Miembro</Text>

            {/* FILA: NOMBRES */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>1ER NOMBRE</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    placeholder="Ej. Juan" 
                    placeholderTextColor="#cbd5e1"
                    style={styles.input} 
                    onChangeText={(v) => handleChange("primer_nombre", v)} 
                  />
                </View>
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>2DO NOMBRE</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    placeholder="Ej. Pablo" 
                    placeholderTextColor="#cbd5e1"
                    style={styles.input} 
                    onChangeText={(v) => handleChange("segundo_nombre", v)} 
                  />
                </View>
              </View>
            </View>

            {/* FILA: APELLIDOS */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>1ER APELLIDO</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    placeholder="Ej. Perez" 
                    placeholderTextColor="#cbd5e1"
                    style={styles.input} 
                    onChangeText={(v) => handleChange("primer_apellido", v)} 
                  />
                </View>
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>2DO APELLIDO</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    placeholder="Ej. Rodriguez" 
                    placeholderTextColor="#cbd5e1"
                    style={styles.input} 
                    onChangeText={(v) => handleChange("segundo_apellido", v)} 
                  />
                </View>
              </View>
            </View>
            <View style={styles.inputContainer}>
  <Text style={styles.inputLabel}>NOMBRE DE USUARIO</Text>

  <View style={styles.inputWrapper}>
    <Feather name="user" size={16} color="#94a3b8" />

    <TextInput
      placeholder="Ej. miguelbarrera"
      placeholderTextColor="#cbd5e1"
      autoCapitalize="none"
      style={styles.input}
      value={form.usuario}
      onChangeText={(v) => handleChange("usuario", v)}
    />
  </View>

  {verificandoUsuario && (
    <Text style={{ color:"#64748b", marginTop:5, fontSize:11 }}>
      Verificando...
    </Text>
  )}

  {!verificandoUsuario && usuarioDisponible === true && (
    <Text style={{ color:"#16a34a", marginTop:5, fontSize:11 }}>
      ✓ Nombre de usuario disponible
    </Text>
  )}

  {!verificandoUsuario && usuarioDisponible === false && (
    <Text style={{ color:"#dc2626", marginTop:5, fontSize:11 }}>
      ✕ Ese nombre de usuario ya existe
    </Text>
  )}

</View>

             {/* CORREO */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>CORREO ELECTRÓNICO</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={16} color="#94a3b8" />
                <TextInput 
                  placeholder="email@ejemplo.com" 
                  placeholderTextColor="#cbd5e1"
                  style={styles.input} 
                  keyboardType="email-address" 
                  autoCapitalize="none"
                  onChangeText={(v) => handleChange("correo", v)} 
                />
              </View>
            </View>

            {/* CELULAR Y TIPO */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1.2, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>CELULAR</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="phone" size={16} color="#94a3b8" />
                  <TextInput 
                    placeholder="300..." 
                    placeholderTextColor="#cbd5e1"
                    style={styles.input} 
                    keyboardType="phone-pad" 
                    onChangeText={(v) => handleChange("celular", v)} 
                  />
                </View>
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>PERFIL</Text>
                <View style={[styles.inputWrapper, { paddingBottom: 0 }]}>
                  <Picker
                    selectedValue={form.tipo_usuario}
                    style={{ flex: 1, height: 40, marginLeft: -10 }}
                    onValueChange={(itemValue) => handleChange("tipo_usuario", itemValue)}
                  >
                    <Picker.Item label="Comprador" value="comprador" />
                    <Picker.Item label="Vendedor" value="vendedor" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* CONTRASEÑAS */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>CONTRASEÑA</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={16} color="#94a3b8" />
                <TextInput 
                  placeholder="••••••••" 
                  secureTextEntry 
                  placeholderTextColor="#cbd5e1"
                  style={styles.input} 
                  onChangeText={(v) => handleChange("password", v)} 
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>CONFIRMAR CONTRASEÑA</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={16} color="#94a3b8" />
                <TextInput 
                  placeholder="••••••••" 
                  secureTextEntry 
                  placeholderTextColor="#cbd5e1"
                  style={styles.input} 
                  onChangeText={(v) => handleChange("confirmarPassword", v)} 
                />
              </View>
            </View>

            {mensaje ? (
              <View style={[styles.statusBox, error ? styles.errorBox : styles.successBox]}>
                <Text style={error ? styles.errorText : styles.successText}>{mensaje}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={[
                styles.botonPrincipal, 
                (loading || usuarioDisponible === false) && styles.botonDisabled]} 
              onPress={handleRegister} 
              disabled={loading || usuarioDisponible === false }
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.botonText}>REGISTRARSE</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/")} style={styles.footerLink}>
              <Text style={styles.footerText}>¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#0a3d2e" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 25 },
  header: { alignItems: "center", marginBottom: 30 },
  logoGlaze: { width: 180, height: 60, marginBottom: 5 },
  brandSubtitle: { fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  card: { 
    backgroundColor: "white", 
    borderRadius: 2, 
    paddingHorizontal: 25, 
    paddingVertical: 35, 
    shadowColor: "#000", 
    shadowOpacity: 0.2, 
    shadowRadius: 15, 
    elevation: 10 
  },
  cardTitle: { fontSize: 18, color: "#0a3d2e", textAlign: "center", marginBottom: 25, fontWeight: "600", letterSpacing: 1 },
  row: { flexDirection: "row" },
  inputContainer: { marginBottom: 18 },
  inputLabel: { fontSize: 9, fontWeight: "bold", color: "#94a3b8", letterSpacing: 1, marginBottom: 5 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 6,
    gap: 8
  },
  input: { flex: 1, fontSize: 14, color: "#1e293b", padding: 0 },
  statusBox: { padding: 10, marginVertical: 10, borderLeftWidth: 4 },
  errorBox: { backgroundColor: "#fff1f2", borderLeftColor: "#e11d48" },
  successBox: { backgroundColor: "#f0fdf4", borderLeftColor: "#166534" },
  errorText: { color: "#e11d48", fontSize: 11, fontWeight: "500" },
  successText: { color: "#166534", fontSize: 11, fontWeight: "500" },
  botonPrincipal: { backgroundColor: "#1f6f54", paddingVertical: 16, marginTop: 10, alignItems: "center" },
  botonDisabled: { opacity: 0.7 },
  botonText: { color: "white", fontWeight: "bold", letterSpacing: 2, fontSize: 13 },
  footerLink: { marginTop: 25, alignItems: "center" },
  footerText: { color: "#64748b", fontSize: 13 },
  linkBold: { color: "#1f6f54", fontWeight: "700" }
});