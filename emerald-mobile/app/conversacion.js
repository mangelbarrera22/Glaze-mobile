import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import API_BASE_URL from "../config/api";

export default function Conversacion() {
  const { id_conversacion, nombre_contacto } = useLocalSearchParams();
  const router = useRouter();
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    inicializar();
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (usuario) cargarMensajes(false);
    }, 3000);
    return () => clearInterval(intervalo);
  }, [usuario]);

  const inicializar = async () => {
    const data = await AsyncStorage.getItem("usuario");
    if (!data) return router.back();
    const u = JSON.parse(data);
    setUsuario(u);
    await cargarMensajes(true, u);
  };

  const cargarMensajes = async (mostrarLoading = false, u = usuario) => {
    try {
      if (mostrarLoading) setLoading(true);
      const token = await AsyncStorage.getItem("token");
const res = await axios.get(`${API_BASE_URL}/api/mensajes/${id_conversacion}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensajes(res.data);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.log("❌ Error cargando mensajes:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async () => {
    if (!texto.trim() || enviando) return;
    try {
      setEnviando(true);
      const token = await AsyncStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/mensajes`, {
        id_conversacion,
        contenido_mensaje: texto.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTexto("");
      await cargarMensajes(false);
    } catch (error) {
      console.log("❌ Error enviando mensaje:", error.response?.data || error.message);
    } finally {
      setEnviando(false);
    }
  };

  const renderMensaje = ({ item }) => {
    const esMio = item.emisor_id === usuario?.id_usuario;
    return (
      <View style={[styles.bubbleWrapper, esMio ? styles.wrapperDerecha : styles.wrapperIzquierda]}>
        {!esMio && (
          <Text style={styles.nombreEmisor}>{item.nombre_emisor}</Text>
        )}
        <View style={[styles.bubble, esMio ? styles.bubbleMio : styles.bubbleOtro]}>
          <Text style={[styles.bubbleTexto, esMio && styles.bubbleTextoBlanco]}>
            {item.contenido_mensaje}
          </Text>
        </View>
        <Text style={styles.hora}>
          {new Date(item.fecha_hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="small" color="#0a3d2e" />
        <Text style={styles.loadingText}>CARGANDO CONVERSACIÓN...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#0a3d2e" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerNombre}>{nombre_contacto?.toUpperCase() || "CONVERSACIÓN"}</Text>
          <Text style={styles.headerSub}>GLAZE PRIVATE MESSAGING</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(item) => item.id_mensaje.toString()}
          renderItem={renderMensaje}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="message-square" size={32} color="#cbd5e1" />
              <Text style={styles.emptyText}>INICIA LA CONVERSACIÓN</Text>
            </View>
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={texto}
            onChangeText={setTexto}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#94a3b8"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !texto.trim() && styles.sendBtnDisabled]}
            onPress={enviarMensaje}
            disabled={!texto.trim() || enviando}
          >
            {enviando
              ? <ActivityIndicator size="small" color="white" />
              : <Feather name="send" size={18} color="white" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 10, letterSpacing: 2, color: "#0a3d2e" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9"
  },
  backBtn: { padding: 5, marginRight: 10 },
  headerInfo: {},
  headerNombre: { fontSize: 13, fontWeight: "700", color: "#0a3d2e", letterSpacing: 2 },
  headerSub: { fontSize: 8, color: "#94a3b8", letterSpacing: 1, marginTop: 2 },
  listContent: { padding: 20, paddingBottom: 10 },
  bubbleWrapper: { marginBottom: 16, maxWidth: "75%" },
  wrapperDerecha: { alignSelf: "flex-end", alignItems: "flex-end" },
  wrapperIzquierda: { alignSelf: "flex-start", alignItems: "flex-start" },
  nombreEmisor: { fontSize: 9, color: "#94a3b8", letterSpacing: 1, marginBottom: 4 },
  bubble: { borderRadius: 2, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMio: { backgroundColor: "#0a3d2e" },
  bubbleOtro: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#f1f5f9" },
  bubbleTexto: { fontSize: 14, color: "#1e293b", lineHeight: 20 },
  bubbleTextoBlanco: { color: "#fff" },
  hora: { fontSize: 9, color: "#cbd5e1", marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80 },
  emptyText: { fontSize: 10, letterSpacing: 2, color: "#cbd5e1", marginTop: 10 },
  inputRow: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: "#f1f5f9",
    backgroundColor: "#fff"
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: "#f1f5f9",
    borderRadius: 2, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: "#1e293b", maxHeight: 100, marginRight: 10
  },
  sendBtn: {
    width: 44, height: 44, backgroundColor: "#0a3d2e",
    justifyContent: "center", alignItems: "center", borderRadius: 2
  },
  sendBtnDisabled: { backgroundColor: "#cbd5e1" }
});