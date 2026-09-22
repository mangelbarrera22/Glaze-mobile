import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// PALETA PROFESIONAL GLAZE
const COLORS = {
  dark: "#0a3d2e",    // Verde Esmeralda
  accent: "#1f6f54",  
  silver: "#94a3b8",  
  bg: "#fcfdfd",      
  border: "#f1f5f9",  
  white: "#ffffff",
  error: "#ef4444",   // Rojo suave para errores
  success: "#10b981"  // Verde para éxito
};

export default function Soporte() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  
  // Estado para el formulario
  const [form, setForm] = useState({
    asunto: "",
    mensaje: ""
  });

  // Estado para el mensaje de respuesta debajo del botón
  const [statusMsg, setStatusMsg] = useState({ text: "", color: "transparent" });

  // Recuperar el ID del usuario y el Token al cargar
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const usuarioRaw = await AsyncStorage.getItem("usuario");
        const tokenRaw = await AsyncStorage.getItem("token");

        if (usuarioRaw) {
          const user = JSON.parse(usuarioRaw);
          setUserId(user.id_usuario);
        }

        if (tokenRaw) {
          setToken(tokenRaw);
        }
      } catch (e) {
        console.error("Error sesión:", e);
      }
    };
    cargarSesion();
  }, []);

  const enviarConsulta = async () => {
    // 1. Validaciones básicas
    if (!form.asunto.trim() || !form.mensaje.trim()) {
      setStatusMsg({ text: "✕ POR FAVOR, LLENE TODOS LOS CAMPOS", color: COLORS.error });
      return;
    }

    if (!userId) {
      setStatusMsg({ text: "✕ ERROR: USUARIO NO IDENTIFICADO", color: COLORS.error });
      return;
    }

    try {
      setLoading(true);
      setStatusMsg({ text: "", color: "transparent" }); // Limpiar mensaje previo

      const payload = {
        id_usuario: userId,
        asunto: form.asunto.trim(),
        mensaje: form.mensaje.trim()
      };

      // Configuración con Token Bearer
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      // 2. Petición al servidor
      const response = await axios.post("http://glaze-backend-production-ad01.up.railway.app/api/soporte", payload, config);

      if (response.status === 201 || response.status === 200) {
        // 3. Éxito: Mostrar mensaje y limpiar formulario
        setStatusMsg({ text: "✓ SOLICITUD ENVIADA CORRECTAMENTE", color: COLORS.success });
        setForm({ asunto: "", mensaje: "" });

        // Limpiar el mensaje de éxito después de 6 segundos
        setTimeout(() => setStatusMsg({ text: "", color: "transparent" }), 6000);
      }

    } catch (error) {
      console.log("Error:", error.response?.data || error.message);
      const msg = error.response?.data?.error || "FALLO DE CONEXIÓN CON EL SERVIDOR";
      setStatusMsg({ text: `✕ ${msg.toUpperCase()}`, color: COLORS.error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      
      {/* NAVEGACIÓN */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>BÓVEDA DE ASISTENCIA</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.headerSection}>
            <Text style={styles.brandTitle}>Soporte</Text>
            <View style={styles.accentLine} />
            <Text style={styles.brandSubtitle}>ATENCIÓN ESPECIALIZADA PARA SOCIOS</Text>
          </View>

          {/* TARJETA DE FORMULARIO */}
          <View style={styles.glazeCard}>
            <View style={styles.sideIndicator} />
            <View style={styles.cardPadding}>
              <Text style={styles.sectionLabel}>REGISTRAR NUEVA CONSULTA</Text>

              <View style={styles.inputBox}>
                <Text style={styles.fieldLabel}>ASUNTO DE LA SOLICITUD</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Inconsistencia en datos..."
                  placeholderTextColor={COLORS.silver}
                  value={form.asunto}
                  onChangeText={(t) => setForm({...form, asunto: t})}
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.fieldLabel}>DETALLE DEL REQUERIMIENTO</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Describa su inquietud de forma clara..."
                  placeholderTextColor={COLORS.silver}
                  multiline
                  numberOfLines={6}
                  value={form.mensaje}
                  onChangeText={(t) => setForm({...form, mensaje: t})}
                />
              </View>

              <TouchableOpacity 
                style={[styles.btnMain, loading && { opacity: 0.7 }]} 
                onPress={enviarConsulta}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnMainText}>ENVIAR MENSAJE</Text>
                )}
              </TouchableOpacity>

              {/* FEEDBACK DE ESTADO (TEXTO DEBAJO DEL BOTÓN) */}
              {statusMsg.text ? (
                <Text style={[styles.statusFeedback, { color: statusMsg.color }]}>
                  {statusMsg.text}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Su solicitud será atendida en un plazo no mayor a 24 horas por nuestro equipo técnico.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: COLORS.bg },
  container: { paddingHorizontal: 25 },
  navHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20 
  },
  navTitle: { 
    fontSize: 9, 
    letterSpacing: 3, 
    fontWeight: '800', 
    color: COLORS.dark 
  },
  headerSection: { marginBottom: 35, marginTop: 15 },
  brandTitle: { fontSize: 34, fontWeight: '300', color: COLORS.dark },
  accentLine: { 
    width: 40, 
    height: 2, 
    backgroundColor: COLORS.accent, 
    marginVertical: 12 
  },
  brandSubtitle: { 
    fontSize: 8, 
    color: COLORS.silver, 
    letterSpacing: 1.5, 
    fontWeight: '700' 
  },
  glazeCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: 4, 
    flexDirection: 'row', 
    borderWidth: 1, 
    borderColor: COLORS.border,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  sideIndicator: { width: 4, backgroundColor: COLORS.dark },
  cardPadding: { flex: 1, padding: 22 },
  sectionLabel: { 
    fontSize: 9, 
    fontWeight: "800", 
    color: COLORS.dark, 
    letterSpacing: 1.2, 
    marginBottom: 25 
  },
  inputBox: { marginBottom: 20 },
  fieldLabel: { 
    fontSize: 7, 
    fontWeight: "800", 
    color: COLORS.silver, 
    marginBottom: 6,
    letterSpacing: 1
  },
  input: { 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border, 
    paddingVertical: 10, 
    fontSize: 14, 
    color: COLORS.dark 
  },
  textarea: {
    height: 120,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    marginTop: 5,
    textAlignVertical: 'top'
  },
  btnMain: { 
    backgroundColor: COLORS.dark, 
    height: 55, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 15,
    borderRadius: 2
  },
  btnMainText: { 
    color: "white", 
    fontSize: 10, 
    fontWeight: "700", 
    letterSpacing: 2 
  },
  statusFeedback: {
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 20,
    letterSpacing: 0.5
  },
  footerContainer: { marginTop: 30, alignItems: 'center' },
  footerText: { 
    textAlign: 'center', 
    color: COLORS.silver, 
    fontSize: 11, 
    lineHeight: 18,
    paddingHorizontal: 20
  }
});