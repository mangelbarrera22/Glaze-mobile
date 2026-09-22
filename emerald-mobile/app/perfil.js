import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, SafeAreaView, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config/api";

// PALETA PROFESIONAL GLAZE
const COLORS = {
  dark: "#0a3d2e",    // Verde Esmeralda
  accent: "#1f6f54",  // Acento
  silver: "#94a3b8",  // Gris Plata
  bg: "#fcfdfd",      // Blanco Mármol
  border: "#f1f5f9",  // Divisor
  white: "#ffffff"
};

export default function Perfil() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const [usuario, setUsuario] = useState({
    id_usuario: null,
    nombre_completo: "",
    correo: "",
    celular: "",
    direccion: ""
  });

  const [passwordData, setPasswordData] = useState({
    password_actual: "",
    password: ""
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const usuarioRaw = await AsyncStorage.getItem("usuario");
      const token = await AsyncStorage.getItem("token");

      if (!usuarioRaw) return router.replace("/login");

      const user = JSON.parse(usuarioRaw);
      const res = await axios.get(`${API_BASE_URL}/api/usuarios/${user.id_usuario}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsuario({
        id_usuario: res.data.id_usuario,
        nombre_completo: res.data.nombre_completo || "",
        correo: res.data.correo || "",
        celular: res.data.celular || "",
        direccion: res.data.direccion || ""
      });
    } catch (error) {
      console.error("Error al cargar:", error);
      Alert.alert("Error", "No se pudo sincronizar con la Bóveda Glaze.");
    } finally {
      setCargandoDatos(false);
    }
  };

  const guardarCambios = async () => {
    if (!usuario.correo || !usuario.celular) {
      Alert.alert("Atención", "El correo y el celular son obligatorios.");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const payload = {
        correo: usuario.correo.trim(),
        celular: String(usuario.celular).trim(),
        direccion: usuario.direccion ? usuario.direccion.trim() : ""
      };

      await axios.put(
        `${API_BASE_URL}/api/usuarios/actualizar/${usuario.id_usuario}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Sincronizar AsyncStorage local con la información actualizada
      const usuarioRaw = await AsyncStorage.getItem("usuario");
      if (usuarioRaw) {
        const userObj = JSON.parse(usuarioRaw);
        const updatedUser = { ...userObj, ...payload };
        await AsyncStorage.setItem("usuario", JSON.stringify(updatedUser));
      }

      Alert.alert("ÉXITO", "Información de perfil actualizada.");
    } catch (error) {
      const msg = error.response?.data?.error || "Error en los datos enviados.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const actualizarPassword = async () => {
    if (!passwordData.password || !passwordData.password_actual) {
      Alert.alert("Glaze", "Por favor, complete ambos campos de contraseña.");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/api/usuarios/password/${usuario.id_usuario}`,
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        "Seguridad Actualizada",
        "Su contraseña ha sido cambiada exitosamente en la Bóveda Glaze."
      );

      setPasswordData({ password_actual: "", password: "" });
    } catch (error) {
      console.log("❌ Error cambio password:", error.response?.data);
      const errorMsg = error.response?.data?.error || "La contraseña actual es incorrecta o hubo un fallo en el servidor.";
      Alert.alert("Fallo en la Actualización", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (cargandoDatos) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.dark} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>BÓVEDA DE SOCIO</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

          <View style={styles.headerSection}>
            <Text style={styles.brandTitle}>Perfil</Text>
            <View style={styles.accentLine} />
            <Text style={styles.brandSubtitle}>CONFIGURACIÓN DE CUENTA PRIVADA</Text>
          </View>

          {/* CARD: INFORMACIÓN PERSONAL */}
          <View style={styles.glazeCard}>
            <View style={styles.sideIndicator} />
            <View style={styles.cardPadding}>
              <Text style={styles.sectionLabel}>DATOS DE IDENTIDAD</Text>

              <View style={styles.inputBox}>
                <Text style={styles.fieldLabel}>NOMBRE COMPLETO</Text>
                <TextInput style={[styles.input, styles.inputBlocked]} value={usuario.nombre_completo} editable={false} />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.fieldLabel}>CORREO ELECTRÓNICO</Text>
                <TextInput
                  style={styles.input}
                  value={usuario.correo}
                  onChangeText={(t) => setUsuario({ ...usuario, correo: t })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.fieldLabel}>TELÉFONO CELULAR</Text>
                <TextInput
                  style={styles.input}
                  value={usuario.celular}
                  onChangeText={(t) => setUsuario({ ...usuario, celular: t })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.fieldLabel}>DIRECCIÓN DE DOMICILIO</Text>
                <TextInput
                  style={styles.input}
                  value={usuario.direccion}
                  onChangeText={(t) => setUsuario({ ...usuario, direccion: t })}
                  placeholder="Calle, Número, Ciudad"
                  placeholderTextColor={COLORS.silver}
                />
              </View>

              <TouchableOpacity style={styles.btnMain} onPress={guardarCambios} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnMainText}>GUARDAR CAMBIOS</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* CARD: SEGURIDAD */}
          <View style={styles.glazeCard}>
            <View style={[styles.sideIndicator, { backgroundColor: COLORS.silver }]} />
            <View style={styles.cardPadding}>
              <Text style={styles.sectionLabel}>SEGURIDAD</Text>

              <View style={styles.inputBox}>
                <Text style={styles.fieldLabel}>CONTRASEÑA ACTUAL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese clave actual"
                  secureTextEntry
                  value={passwordData.password_actual}
                  onChangeText={(t) => setPasswordData({ ...passwordData, password_actual: t })}
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.fieldLabel}>NUEVA CONTRASEÑA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry
                  value={passwordData.password}
                  onChangeText={(t) => setPasswordData({ ...passwordData, password: t })}
                />
              </View>

              <TouchableOpacity
                style={[styles.btnSecondary, loading && { opacity: 0.7 }]}
                onPress={actualizarPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.dark} />
                ) : (
                  <Text style={styles.btnSecondaryText}>ACTUALIZAR LLAVE</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { paddingHorizontal: 20 },
  navHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  navTitle: { fontSize: 10, letterSpacing: 3, fontWeight: '800', color: COLORS.dark },
  headerSection: { marginBottom: 30, marginTop: 10 },
  brandTitle: { fontSize: 32, fontWeight: '300', color: COLORS.dark },
  accentLine: { width: 35, height: 2, backgroundColor: COLORS.accent, marginVertical: 12 },
  brandSubtitle: { fontSize: 8, color: COLORS.silver, letterSpacing: 1.5, fontWeight: '700' },
  glazeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 4,
    marginBottom: 25,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3
  },
  sideIndicator: { width: 4, backgroundColor: COLORS.dark },
  cardPadding: { flex: 1, padding: 22 },
  sectionLabel: { fontSize: 9, fontWeight: "800", color: COLORS.dark, letterSpacing: 1, marginBottom: 20 },
  inputBox: { marginBottom: 18 },
  fieldLabel: { fontSize: 7, fontWeight: "800", color: COLORS.silver, marginBottom: 4 },
  input: { borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 8, fontSize: 14, color: COLORS.dark },
  inputBlocked: { color: COLORS.silver, borderBottomWidth: 0, fontWeight: '600' },
  btnMain: { backgroundColor: COLORS.dark, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  btnMainText: { color: "white", fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  btnSecondary: { borderWidth: 1, borderColor: COLORS.dark, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  btnSecondaryText: { color: COLORS.dark, fontSize: 10, fontWeight: "700", letterSpacing: 2 }
});