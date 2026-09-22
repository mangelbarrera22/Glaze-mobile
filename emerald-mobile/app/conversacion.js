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

      if (!token) return;

      const res = await axios.get(
        `${API_BASE_URL}/api/mensajes/${id_conversacion}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMensajes(res.data);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

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
        <Text style={[styles.hora, esMio ? styles.horaDerecha : styles.horaIzquierda]}>
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={26} color="#0a3d2e" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerNombre}>{nombre_contacto || "Conversación"}</Text>
          <Text style={styles.headerSub}>GLAZE PRIVATE MESSAGING</Text>
        </View>
        <View style={{ width: 36 }} /> {/* Espaciador para centrar el título */}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
              <Feather name="message-square" size={36} color="#cbd5e1" />
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
              : <Feather name="send" size={18} color="white" style={{ marginLeft: 2 }} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f4f4f8" // Fondo suave como en la imagen de referencia
  },
  loadingCenter: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f4f4f8"
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 10, 
    letterSpacing: 2, 
    color: "#0a3d2e",
    fontWeight: "600"
  },
  
  /* --- HEADER --- */
  header: {
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15, 
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1, 
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2
  },
  backBtn: { 
    padding: 5,
  },
  headerInfo: { 
    alignItems: "center",
    flex: 1,
  },
  headerNombre: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#1e293b", 
    letterSpacing: 0.5 
  },
  headerSub: { 
    fontSize: 9, 
    color: "#64748b", 
    letterSpacing: 1.5, 
    marginTop: 2,
    fontWeight: "600"
  },

  /* --- ZONA DE CHAT --- */
  listContent: { 
    padding: 16, 
    paddingBottom: 20 
  },
  bubbleWrapper: { 
    marginBottom: 16, 
    maxWidth: "78%" 
  },
  wrapperDerecha: { 
    alignSelf: "flex-end", 
    alignItems: "flex-end" 
  },
  wrapperIzquierda: { 
    alignSelf: "flex-start", 
    alignItems: "flex-start" 
  },
  nombreEmisor: { 
    fontSize: 11, 
    color: "#64748b", 
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: "500"
  },
  bubble: { 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderRadius: 20, // Bordes muy suaves
  },
  bubbleMio: { 
    backgroundColor: "#0a3d2e", 
    borderBottomRightRadius: 4, // Crea el efecto de "colita" del chat a la derecha
  },
  bubbleOtro: { 
    backgroundColor: "#ffffff", 
    borderBottomLeftRadius: 4, // Crea el efecto de "colita" a la izquierda
    borderWidth: 1, 
    borderColor: "#e2e8f0",
    shadowColor: "#000", // Sombra muy sutil para dar volumen
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  bubbleTexto: { 
    fontSize: 15, 
    color: "#1e293b", 
    lineHeight: 22 
  },
  bubbleTextoBlanco: { 
    color: "#ffffff" 
  },
  hora: { 
    fontSize: 10, 
    color: "#94a3b8", 
    marginTop: 6,
    fontWeight: "500"
  },
  horaDerecha: {
    marginRight: 4
  },
  horaIzquierda: {
    marginLeft: 4
  },

  /* --- ESTADOS VACÍOS --- */
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingTop: 100 
  },
  emptyText: { 
    fontSize: 11, 
    letterSpacing: 2, 
    color: "#94a3b8", 
    marginTop: 12,
    fontWeight: "600"
  },

  /* --- BARRA DE ENTRADA --- */
  inputRow: {
    flexDirection: "row", 
    alignItems: "flex-end",
    paddingHorizontal: 16, 
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1, 
    borderTopColor: "#e2e8f0",
  },
  input: {
    flex: 1, 
    backgroundColor: "#f1f5f9", // Estilo píldora gris claro
    borderRadius: 24, 
    paddingHorizontal: 18, 
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15, 
    color: "#1e293b", 
    maxHeight: 120, 
    marginRight: 12
  },
  sendBtn: {
    width: 44, 
    height: 44, 
    backgroundColor: "#0a3d2e",
    justifyContent: "center", 
    alignItems: "center", 
    borderRadius: 22, // Botón completamente redondo
    shadowColor: "#0a3d2e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  sendBtnDisabled: { 
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0,
    elevation: 0
  }
});