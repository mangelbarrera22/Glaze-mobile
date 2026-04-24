import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, StatusBar
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import API_BASE_URL from "../config/api";

export default function Mensajes() {
  const router = useRouter();
  const [conversaciones, setConversaciones] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargarConversaciones();
    }, [])
  );

  const cargarConversaciones = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem("usuario");
      const token = await AsyncStorage.getItem("token");
      if (!data) return;
      const u = JSON.parse(data);
      setUsuario(u);

      const res = await axios.get(`${API_BASE_URL}/conversaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversaciones(res.data);
    } catch (error) {
      console.log("❌ Error cargando conversaciones:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const abrirConversacion = (conv) => {
    const esMiId = usuario?.id_usuario;
    const nombre_contacto = conv.id_comprador === esMiId
      ? conv.nombre_vendedor
      : conv.nombre_comprador;

    router.push({
      pathname: "/conversacion",
      params: { id_conversacion: conv.id_conversacion, nombre_contacto }
    });
  };

  const renderConversacion = ({ item }) => {
    const esMiId = usuario?.id_usuario;
    const nombre_contacto = item.id_comprador === esMiId
      ? item.nombre_vendedor
      : item.nombre_comprador;

    const iniciales = nombre_contacto
      ?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
      <TouchableOpacity style={styles.convRow} onPress={() => abrirConversacion(item)}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{iniciales}</Text>
        </View>
        <View style={styles.convInfo}>
          <Text style={styles.convNombre}>{nombre_contacto?.toUpperCase()}</Text>
          <Text style={styles.convUltimo} numberOfLines={1}>
            {item.ultimo_mensaje || "Sin mensajes aún"}
          </Text>
        </View>
        {item.fecha_ultimo_mensaje && (
          <Text style={styles.convHora}>
            {new Date(item.fecha_ultimo_mensaje).toLocaleDateString()}
          </Text>
        )}
        <Feather name="chevron-right" size={16} color="#cbd5e1" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>MENSAJES</Text>
        <Text style={styles.headerSub}>GLAZE PRIVATE MESSAGING</Text>
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="small" color="#0a3d2e" />
          <Text style={styles.loadingText}>CARGANDO...</Text>
        </View>
      ) : (
        <FlatList
          data={conversaciones}
          keyExtractor={(item) => item.id_conversacion.toString()}
          renderItem={renderConversacion}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="message-square" size={32} color="#cbd5e1" />
              <Text style={styles.emptyText}>NO TIENES CONVERSACIONES AÚN</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 10, letterSpacing: 2, color: "#0a3d2e" },
  header: {
    paddingHorizontal: 30, paddingVertical: 20,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9"
  },
  headerTitle: { fontSize: 18, fontWeight: "300", color: "#0a3d2e", letterSpacing: 4 },
  headerSub: { fontSize: 9, color: "#94a3b8", letterSpacing: 1, marginTop: 4 },
  listContent: { paddingVertical: 10 },
  convRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "#f8fafc"
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#ecfdf5", justifyContent: "center",
    alignItems: "center", marginRight: 14
  },
  avatarText: { fontSize: 13, fontWeight: "700", color: "#0a3d2e" },
  convInfo: { flex: 1 },
  convNombre: { fontSize: 11, fontWeight: "700", color: "#1e293b", letterSpacing: 1 },
  convUltimo: { fontSize: 12, color: "#94a3b8", marginTop: 3 },
  convHora: { fontSize: 9, color: "#cbd5e1", marginRight: 8 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80 },
  emptyText: { fontSize: 10, letterSpacing: 2, color: "#cbd5e1", marginTop: 10 }
});