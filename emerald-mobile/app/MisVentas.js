import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ⚠️ VERIFICA TU IP AQUÍ
const BASE_URL = "http://192.168.101.60:3000/api";

const COLORS = {
  dark: "#0a3d2e",      // Verde Glaze
  accent: "#1f6f54",    // Verde Esmeralda
  gold: "#b8a355",      // Dorado
  silver: "#94a3b8",    // Gris
  bg: "#F8F9FA",        // Fondo
  white: "#ffffff",
  border: "#E2E8F0",
  success: "#166534",
  successBg: "#f0fdf4"
};

export default function MisVentas() {
  const router = useRouter();
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    console.log("--- [MisVentas] Montado ---");
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    console.log("--- [MisVentas] Iniciando petición ---");
    try {
      setCargando(true);
      
      const token = await AsyncStorage.getItem("token");
      const userRaw = await AsyncStorage.getItem("usuario");
      
      if (!userRaw) {
        console.warn("--- [MisVentas] No se encontró usuario en Storage ---");
        setCargando(false);
        return;
      }

      const usuario = JSON.parse(userRaw);
      // Probamos todas las variantes posibles de ID
      const idUsuario = usuario.id_usuario || usuario.id || usuario.id_vendedor;
      
      console.log("--- [MisVentas] Consultando para ID:", idUsuario);

      const res = await axios.get(
        `${BASE_URL}/ventas/vendedor/${idUsuario}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("--- [MisVentas] Respuesta recibida:", res.data);
      setVentas(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      console.error("--- [MisVentas] Error detallado:", {
        mensaje: err.message,
        data: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setCargando(false);
      console.log("--- [MisVentas] Carga finalizada ---");
    }
  };

  const filtradas = ventas.filter((v) =>
    (v.nombre_producto || "").toLowerCase().includes(filtro.toLowerCase()) ||
    String(v.id_venta).includes(filtro)
  );

  const totalIngresos = ventas.reduce(
    (acc, v) => acc + Number(v.valor_compra || 0),
    0
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.labelCaps}>REFERENCIA DE OPERACIÓN</Text>
            <Text style={styles.refText}>GZ-V{String(item.id_venta).padStart(4, "0")}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>EXITOSA</Text>
          </View>
        </View>

        <View style={styles.middleRow}>
          <Feather name="package" size={14} color={COLORS.gold} />
          <Text style={styles.productName} numberOfLines={1}>
            {item.nombre_producto || `ACTIVO #${item.id_producto}`}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.labelCaps}>FECHA</Text>
            <Text style={styles.dateValue}>
              {new Date(item.fecha_compra).toLocaleDateString("es-CO", { 
                day: '2-digit', month: 'short', year: 'numeric' 
              }).toUpperCase()}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.labelCaps, { textAlign: 'right' }]}>INGRESO NETO</Text>
            <Text style={styles.priceValue}>
              ${Number(item.valor_compra).toLocaleString("es-CO")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={COLORS.accent} />
        <Text style={styles.loadingText}>SINCRONIZANDO BÓVEDA...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>MIS VENTAS</Text>
          <Text style={styles.headerSubtitle}>GLAZE LUXURY REAL ESTATE & GEMS</Text>
        </View>
        <Image 
          source={require("../assets/images/LOGOS/Isotipo/Glaze-blanco.png")} 
          style={styles.logoHeader} resizeMode="contain" 
        />
      </View>

      <View style={styles.mainContent}>
        <View style={styles.statsBoard}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TRANSACCIONES</Text>
            <Text style={styles.statNumber}>{ventas.length}</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TOTAL NETO</Text>
            <Text style={[styles.statNumber, { color: COLORS.gold }]}>
              ${totalIngresos.toLocaleString("es-CO")}
            </Text>
          </View>
        </View>

        <View style={styles.searchWrapper}>
          <Feather name="search" size={18} color={COLORS.silver} />
          <TextInput
            placeholder="Buscar referencia o producto..."
            placeholderTextColor={COLORS.silver}
            value={filtro}
            onChangeText={setFiltro}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.id_venta.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="database" size={40} color={COLORS.border} />
              <Text style={styles.emptyText}>No hay registros de ventas para este usuario.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 15, fontSize: 10, letterSpacing: 2, color: COLORS.silver, fontWeight: "700" },
  header: { backgroundColor: COLORS.dark, paddingHorizontal: 20, paddingBottom: 35, paddingTop: 15, flexDirection: "row", alignItems: "center" },
  headerInfo: { flex: 1, marginLeft: 10 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700", letterSpacing: 1 },
  headerSubtitle: { color: COLORS.gold, fontSize: 8, fontWeight: "600", letterSpacing: 1.2, marginTop: 2 },
  logoHeader: { width: 32, height: 32 },
  mainContent: { flex: 1, paddingHorizontal: 20 },
  statsBoard: { flexDirection: "row", backgroundColor: COLORS.white, marginTop: -25, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: COLORS.border, elevation: 5, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15 },
  statBox: { flex: 1, alignItems: "center" },
  verticalDivider: { width: 1, backgroundColor: COLORS.border, height: "80%", alignSelf: "center" },
  statLabel: { fontSize: 8, color: COLORS.silver, fontWeight: "800", letterSpacing: 1, marginBottom: 5 },
  statNumber: { fontSize: 18, color: COLORS.dark, fontWeight: "700" },
  searchWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, paddingHorizontal: 15, height: 50, borderRadius: 10, marginVertical: 20, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: COLORS.dark },
  card: { backgroundColor: COLORS.white, borderRadius: 10, marginBottom: 16, flexDirection: "row", overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  accentBar: { width: 4, backgroundColor: COLORS.gold },
  cardContent: { flex: 1, padding: 18 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  labelCaps: { fontSize: 8, color: COLORS.silver, fontWeight: "800", letterSpacing: 0.8, marginBottom: 4 },
  refText: { fontSize: 15, fontWeight: "700", color: COLORS.dark },
  statusBadge: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.successBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22c55e", marginRight: 6 },
  statusText: { fontSize: 9, fontWeight: "800", color: COLORS.success },
  middleRow: { flexDirection: "row", alignItems: "center", marginTop: 15 },
  productName: { marginLeft: 10, fontSize: 13, color: COLORS.dark, fontWeight: "600", flex: 1 },
  divider: { height: 1, backgroundColor: COLORS.bg, marginVertical: 15 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateValue: { fontSize: 12, fontWeight: "700", color: COLORS.dark },
  priceValue: { fontSize: 18, fontWeight: "800", color: COLORS.accent },
  emptyState: { alignItems: "center", marginTop: 60, opacity: 0.5 },
  emptyText: { color: COLORS.silver, fontSize: 13, marginTop: 15, textAlign: 'center' },
});