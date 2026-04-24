import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Image, TextInput, Alert
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const BASE_URL = "http://192.168.101.60:3000/api";

export default function MiCatalogo() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError(null);

      const usuarioRaw = await AsyncStorage.getItem("usuario");
      if (!usuarioRaw) throw new Error("Sesión no encontrada.");
      const usuario = JSON.parse(usuarioRaw);
      if (!usuario?.id_usuario) throw new Error("ID de usuario no válido.");

      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/productos/vendedor/${usuario.id_usuario}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(res.data);
    } catch (err) {
      setError(err.response?.data?.mensaje || err.message || "Error al cargar el catálogo.");
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = async (id_producto) => {
    Alert.alert(
      "Eliminar pieza",
      "¿Estás seguro de que deseas eliminar esta pieza?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(`${BASE_URL}/productos/${id_producto}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              cargarProductos();
            } catch (err) {
              Alert.alert("Error", "No se pudo eliminar la pieza.");
            }
          },
        },
      ]
    );
  };

  const filtrados = productos.filter((p) =>
    p.color?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.tipo_producto?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.peso?.toString().includes(filtro)
  );

  const getBadgeStyle = (estado) => {
    switch (estado) {
      case "vendido": return { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" };
      case "reservado": return { bg: "#fffbeb", text: "#92400e", border: "#fde68a" };
      default: return { bg: "#ecfdf5", text: "#065f46", border: "#d1fae5" };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={20} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Mi Catálogo</Text>
            <Text style={styles.headerTag}>
              {productos.length} PIEZA{productos.length !== 1 ? "S" : ""} • GLAZE
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/publicar")}
          >
            <Feather name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* BUSCADOR */}
        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por color, tipo, peso..."
            placeholderTextColor="#94a3b8"
            value={filtro}
            onChangeText={setFiltro}
          />
          {filtro.length > 0 && (
            <TouchableOpacity onPress={() => setFiltro("")}>
              <Feather name="x" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARGANDO */}
        {cargando && (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#0a3d2e" />
            <Text style={styles.emptyText}>Cargando piezas...</Text>
          </View>
        )}

        {/* ERROR */}
        {!cargando && error && (
          <View style={styles.emptyContainer}>
            <Feather name="alert-circle" size={32} color="#ef4444" />
            <Text style={[styles.emptyText, { color: "#ef4444", marginTop: 12 }]}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={cargarProductos}>
              <Text style={styles.retryText}>REINTENTAR</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* VACÍO */}
        {!cargando && !error && filtrados.length === 0 && (
          <View style={styles.emptyContainer}>
            <Feather name="package" size={32} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              {filtro ? "Sin resultados para tu búsqueda." : "Aún no has publicado ninguna pieza."}
            </Text>
            {!filtro && (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => router.push("/publicar")}
              >
                <Text style={styles.retryText}>PUBLICAR PRIMERA PIEZA</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* LISTA */}
        {!cargando && !error && filtrados.map((p, index) => {
          const badge = getBadgeStyle(p.estado);
          const vendido = p.estado === "vendido";

          return (
            <View style={[styles.card, vendido && styles.cardVendido]} key={`${p.id_producto}-${index}`}>

              {/* IMAGEN */}
              {p.imagen ? (
                <Image
                  source={{ uri: `http://192.168.101.60:3000/uploads/${p.imagen}` }}
                  style={[styles.imagen, vendido && styles.imagenVendida]}
                />
              ) : (
                <View style={styles.imagenPlaceholder}>
                  <Feather name="image" size={28} color="#cbd5e1" />
                </View>
              )}

              <View style={styles.cardContent}>

                {/* REFERENCIA + BADGE */}
                <View style={styles.topRow}>
                  <View>
                    <Text style={styles.labelMin}>REFERENCIA</Text>
                    <Text style={styles.refText}>
                      GZ-{String(p.id_producto).padStart(4, "0")}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>
                      {(p.estado || "disponible").toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* TIPO + COLOR */}
                <View style={styles.detailRow}>
                  <View style={styles.detailGroup}>
                    <Text style={styles.labelMin}>TIPO</Text>
                    <Text style={styles.detailText}>{p.tipo_producto}</Text>
                  </View>
                  <View style={styles.detailGroup}>
                    <Text style={styles.labelMin}>COLOR</Text>
                    <Text style={styles.detailText}>{p.color || "—"}</Text>
                  </View>
                  <View style={styles.detailGroup}>
                    <Text style={styles.labelMin}>PESO</Text>
                    <Text style={styles.detailText}>{p.peso} ct</Text>
                  </View>
                </View>

                {/* VALOR */}
                <View style={styles.valorRow}>
                  <Text style={styles.labelMin}>VALOR</Text>
                  <Text style={styles.valorText}>
                    ${Number(p.valor).toLocaleString("es-CO")} USD
                  </Text>
                </View>

                {/* ACCIONES */}
                <View style={styles.accionesRow}>
                  <TouchableOpacity
                    style={styles.btnEditar}
                    onPress={() => router.push(`/editar-producto/${p.id_producto}`)}
                  >
                    <Feather name="edit-2" size={14} color="#1f6f54" />
                    <Text style={styles.btnEditarText}>EDITAR</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnEliminar}
                    onPress={() => eliminarProducto(p.id_producto)}
                  >
                    <Feather name="trash-2" size={14} color="#ef4444" />
                    <Text style={styles.btnEliminarText}>ELIMINAR</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfdfd" },

  // HEADER
  header: {
    backgroundColor: "#0a3d2e",
    paddingHorizontal: 25,
    paddingBottom: 20,
    paddingTop: 20,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backBtn: {
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    padding: 8, borderRadius: 2, marginRight: 14,
  },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "300", letterSpacing: 1 },
  headerTag: { color: "rgba(255,255,255,0.4)", fontSize: 9, marginTop: 3, letterSpacing: 2, fontWeight: "700" },
  addBtn: {
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    padding: 8, borderRadius: 2,
  },

  // BUSCADOR
  searchWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2, paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  searchInput: { flex: 1, color: "white", fontSize: 14 },

  scrollContent: { paddingHorizontal: 25, paddingTop: 25 },

  // CARD
  card: {
    backgroundColor: "white", borderRadius: 2,
    marginBottom: 16, elevation: 4,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10,
    overflow: "hidden",
  },
  cardVendido: { opacity: 0.7 },
  imagen: { width: "100%", height: 180 },
  imagenVendida: { opacity: 0.5 },
  imagenPlaceholder: {
    width: "100%", height: 180,
    backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center",
  },
  cardContent: { padding: 18 },

  topRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 14,
  },
  labelMin: { fontSize: 9, fontWeight: "800", color: "#94a3b8", letterSpacing: 1.5, marginBottom: 4 },
  refText: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  badge: {
    paddingVertical: 5, paddingHorizontal: 10,
    borderRadius: 2, borderWidth: 1,
  },
  badgeText: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },

  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  detailGroup: {},
  detailText: { fontSize: 13, fontWeight: "600", color: "#334155" },

  valorRow: { marginBottom: 18 },
  valorText: { fontSize: 22, fontWeight: "300", color: "#0a3d2e", letterSpacing: 0.5 },

  accionesRow: { flexDirection: "row", gap: 10 },
  btnEditar: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12,
    borderWidth: 1, borderColor: "#1f6f54", borderRadius: 2,
  },
  btnEditarText: { color: "#1f6f54", fontWeight: "700", fontSize: 11, letterSpacing: 1 },
  btnEliminar: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12,
    borderWidth: 1, borderColor: "#fecaca", borderRadius: 2,
  },
  btnEliminarText: { color: "#ef4444", fontWeight: "700", fontSize: 11, letterSpacing: 1 },

  // EMPTY / ERROR
  emptyContainer: {
    alignItems: "center", justifyContent: "center",
    marginTop: 60, padding: 40,
    backgroundColor: "white", borderRadius: 2,
    borderStyle: "dashed", borderWidth: 1, borderColor: "#e2e8f0",
  },
  emptyText: { color: "#94a3b8", fontSize: 14, textAlign: "center", marginTop: 12 },
  retryBtn: {
    marginTop: 20, backgroundColor: "#0a3d2e",
    paddingVertical: 12, paddingHorizontal: 24,
  },
  retryText: { color: "white", fontWeight: "700", fontSize: 11, letterSpacing: 1.5 },
});