import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Image, Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const BASE_URL = "http://192.168.101.60:3000/api";
const COLORS = { 
  dark: "#0a3d2e", 
  accent: "#1f6f54", 
  light: "#94a3b8", 
  bg: "#fcfdfd",
  border: "#f1f5f9" 
};

export default function HistorialPedidos() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      setError(null);
      const usuarioRaw = await AsyncStorage.getItem("usuario");
      if (!usuarioRaw) throw new Error("Sesión no encontrada.");

      const usuario = JSON.parse(usuarioRaw);
      const res = await axios.get(`${BASE_URL}/historial/${usuario.id_usuario}`);
      setPedidos(res.data);
    } catch (err) {
      setError(err.message || "Error al cargar el historial.");
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric", month: "short", day: "numeric",
    }).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER INSTITUCIONAL */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>Adquisiciones</Text>
          <View style={styles.accentLine} />
          <Text style={styles.brandSubtitle}>HISTORIAL DE INVERSIONES</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
          <Feather name="chevron-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {cargando ? (
          <ActivityIndicator size="large" color={COLORS.dark} style={{ marginTop: 100 }} />
        ) : error ? (
          <View style={styles.statusContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : pedidos.length === 0 ? (
          <View style={styles.statusContainer}>
            <Feather name="shield" size={40} color={COLORS.light} />
            <Text style={styles.emptyText}>No se registran piezas en su bóveda privada.</Text>
          </View>
        ) : (
          pedidos.map((p, index) => (
            <View style={styles.cardGlaze} key={`${p.id_venta}-${index}`}>
              {/* Marca de agua sutil lateral */}
              <View style={styles.sideAccent} />
              
              <View style={styles.cardPadding}>
                {/* CABECERA DE TARJETA */}
                <View style={styles.topRow}>
                  <View>
                    <Text style={styles.labelMin}>REFERENCIA DE VENTA</Text>
                    <Text style={styles.referenciaText}>GLZ-{String(p.id_venta).padStart(5, "0")}</Text>
                  </View>
                  <View style={styles.badgeLuxury}>
                    <Text style={styles.badgeText}>CONFIRMADA</Text>
                  </View>
                </View>

                {/* INFO PIEZA */}
                <View style={styles.productoRow}>
                  {p.imagen && (
                    <Image 
                      source={{ uri: `http://192.168.101.60:3000/uploads/${p.imagen}` }} 
                      style={styles.miniature}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.labelMin}>PIEZA ADQUIRIDA</Text>
                    <Text style={styles.nombreGema}>{(p.nombre_producto || "Gema Exclusiva").toUpperCase()}</Text>
                    <Text style={styles.specText}>{p.color || 'Especial'} • {p.peso || 'N/A'} CT</Text>
                  </View>
                </View>

                {/* DETALLES DE INVERSIÓN */}
                <View style={styles.detailsRow}>
                  <View>
                    <Text style={styles.labelMin}>FECHA DE SALIDA</Text>
                    <Text style={styles.infoText}>{formatearFecha(p.fecha_compra)}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.labelMin}>VALOR DE ADQUISICIÓN</Text>
                    <Text style={styles.totalText}>
                      ${p.valor_compra != null ? Number(p.valor_compra).toLocaleString("es-CO") : "—"}
                    </Text>
                  </View>
                </View>

                {/* BOTÓN ACCIÓN */}
                <TouchableOpacity style={styles.btnAction}>
                  <Feather name="file-text" size={14} color="white" />
                  <Text style={styles.btnActionText}>DESCARGAR CERTIFICADO DIGITAL</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 25 },
  
  // Header Institucional
  header: { 
    paddingHorizontal: 25, 
    paddingTop: 20, 
    paddingBottom: 25, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  brandTitle: { fontSize: 26, fontWeight: '300', color: COLORS.dark, letterSpacing: 1 },
  accentLine: { width: 30, height: 2, backgroundColor: COLORS.accent, marginVertical: 6 },
  brandSubtitle: { fontSize: 8, color: COLORS.light, letterSpacing: 2, fontWeight: '800' },
  backCircle: { padding: 8, borderRadius: 100, backgroundColor: '#f8fafc' },

  // Cards Estilo Glaze
  cardGlaze: {
    backgroundColor: "white",
    marginBottom: 25,
    borderRadius: 4,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  sideAccent: { width: 4, backgroundColor: COLORS.dark },
  cardPadding: { flex: 1, padding: 20 },

  topRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  labelMin: { fontSize: 7, fontWeight: "800", color: COLORS.light, letterSpacing: 1.5, marginBottom: 4 },
  referenciaText: { fontSize: 16, fontWeight: "300", color: COLORS.dark, letterSpacing: 1 },
  
  badgeLuxury: { backgroundColor: COLORS.dark, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 2 },
  badgeText: { color: "white", fontSize: 8, fontWeight: "700", letterSpacing: 1 },

  productoRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  miniature: { width: 50, height: 50, borderRadius: 4, marginRight: 15, backgroundColor: '#f9fafb' },
  nombreGema: { fontSize: 14, fontWeight: "600", color: COLORS.dark, letterSpacing: 1, marginBottom: 2 },
  specText: { fontSize: 11, color: COLORS.light },

  detailsRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-end",
    marginBottom: 20 
  },
  infoText: { fontSize: 12, fontWeight: "600", color: COLORS.dark },
  totalText: { fontSize: 20, fontWeight: "300", color: COLORS.dark },

  btnAction: { 
    backgroundColor: COLORS.dark, 
    height: 45, 
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: 'center', 
    gap: 10, 
    borderRadius: 2 
  },
  btnActionText: { color: "white", fontWeight: "700", letterSpacing: 1, fontSize: 9 },

  // Estados
  statusContainer: { alignItems: "center", marginTop: 100, paddingHorizontal: 40 },
  emptyText: { marginTop: 15, color: COLORS.light, fontSize: 12, letterSpacing: 1, textAlign: 'center' },
  errorText: { color: "#e11d48", fontSize: 12, textAlign: 'center' }
});