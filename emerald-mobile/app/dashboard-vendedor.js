import React, { useEffect, useState, useCallback } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, SafeAreaView, StatusBar, ActivityIndicator 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import API_BASE_URL from "../config/api"; // Asegúrate de tener tu IP configurada aquí

// PALETA INSTITUCIONAL GLAZE
const COLORS = {
  dark: "#0a3d2e",    // Esmeralda Glaze
  accent: "#1f6f54",  
  silver: "#94a3b8",  
  bg: "#fcfdfd",      
  border: "#f1f5f9",  
  white: "#ffffff",
  gold: "#b8a355"
};
const capitalizar = (texto = "") => {
  return texto
    .toLowerCase()
    .split(" ")
    .map(
      palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)
    )
    .join(" ");
};

export default function DashboardVendedor() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [stats, setStats] = useState({ totalVentas: 0, piezasActivas: 0 });
  const [loading, setLoading] = useState(true);

  // ==========================
  // 👤 CARGAR DATOS REALES
  // ==========================
  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener sesión local
      const storedUser = await AsyncStorage.getItem("usuario");
      const token = await AsyncStorage.getItem("token");

      if (!storedUser || !token) {
        router.replace("/");
        const capitalizar = (texto = "") => {
  return texto
    .toLowerCase()
    .split(" ")
    .map(
      palabra =>
        palabra.charAt(0).toUpperCase() + palabra.slice(1)
    )
    .join(" ");
};
        return;
      }
      setUsuario(JSON.parse(storedUser));

      // 2. Petición al Backend (Usando el controlador que creamos)
      const res = await fetch(`${API_BASE_URL}/api/vendedores/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setStats({
          totalVentas: data.totalVentas || 0,
          piezasActivas: data.piezasActivas || 0
        });
      } else {
        console.log("Error en respuesta:", data.msg);
      }

    } catch (error) {
      console.log("Error de conexión Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cerrarSesion = async () => {
    await AsyncStorage.multiRemove(["usuario", "token"]);
    router.replace("/");
  };

  // ==========================
  // 🧩 COMPONENTE MENÚ TÉCNICO
  // ==========================
  const MenuOption = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity 
      style={styles.menuCard} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Feather name={icon} size={18} color={COLORS.accent} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title.toUpperCase()}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Feather name="chevron-right" size={16} color={COLORS.silver} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER INSTITUCIONAL */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
           <Text style={styles.usuarioName}>
  {usuario
    ? `${capitalizar(usuario.primer_nombre)} ${capitalizar(usuario.primer_apellido)}`
    : "Especialista"}
</Text> 
          <View>
            <Text style={styles.bienvenida}>Socio Estratégico,</Text>
          </View>
          
          <TouchableOpacity style={styles.miniLogout} onPress={cerrarSesion}>
              
            <Feather name="log-out" size={18} color="white" />
          </TouchableOpacity>
         
        </View>
        <Text style={styles.panelTag}>VENDEDOR AUTORIZADO • EMERALD TRADE</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* 📊 MÉTRICAS DE NEGOCIO */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>INVENTARIO ACTIVO</Text>
            <Text style={styles.statNumber}>
              {loading ? "..." : `${stats.piezasActivas} PCS`}
            </Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: COLORS.gold }]}>
            <Text style={styles.statLabel}>VENTAS TOTALES</Text>
            <Text style={[styles.statNumber, { color: COLORS.gold }]}>
              {loading ? "..." : `$${Number(stats.totalVentas).toLocaleString()}`}
            </Text>
          </View>
        </View>

        {/* 💎 GESTIÓN DE ACTIVOS */}
        <Text style={styles.sectionTitle}>Gestión de Esmeraldas</Text>
        
        <MenuOption 
          icon="plus-square" 
          title="Registrar Nueva Gema" 
          subtitle="Añadir activos a la bóveda"
          onPress={() => router.push("/publicar")}
        />
        <MenuOption 
          icon="layers" 
          title="Inventario Glaze" 
          subtitle="Administrar piezas publicadas"
          onPress={() => router.push("MiCatalogo")}
        />
        <MenuOption 
          icon="dollar-sign" 
          title="Liquidaciones" 
          subtitle="Historial de ventas y pagos"
          onPress={() => router.push("MisVentas")}
        />

        {/* ⚙️ CONFIGURACIÓN */}
        <Text style={styles.sectionTitle}>Seguridad y Cuenta</Text>
        
        <MenuOption 
          icon="user" 
          title="Perfil Profesional" 
          onPress={() => router.push("/perfil")} 
        />
        <MenuOption 
          icon="life-buoy" 
          title="Soporte Técnico" 
          onPress={() => router.push("/soporte")} 
        />

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ... (Mismos estilos que ya tenías, están impecables)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.dark,
    paddingHorizontal: 25,
    paddingBottom: 35,
    paddingTop: 20,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bienvenida: { color: "rgba(255,255,255,0.5)", fontSize: 12, letterSpacing: 1 },
  usuarioName: { color: "white", fontSize: 26, fontWeight: "300" },
  panelTag: { color: COLORS.gold, fontSize: 9, marginTop: 10, letterSpacing: 2, fontWeight: "700" },
  miniLogout: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 2 },
  scrollContent: { paddingHorizontal: 25, paddingTop: 25 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 18,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  statLabel: { fontSize: 8, color: COLORS.silver, fontWeight: "800", letterSpacing: 1 },
  statNumber: { fontSize: 18, color: COLORS.dark, marginTop: 5, fontWeight: "700" },
  sectionTitle: { fontSize: 10, fontWeight: "800", color: COLORS.silver, marginBottom: 15, marginTop: 10, letterSpacing: 1.5, textTransform: "uppercase" },
  menuCard: { backgroundColor: "white", paddingVertical: 20, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: 2 },
  iconContainer: { width: 40, height: 40, backgroundColor: "#f8faf9", borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 15 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 12, fontWeight: "700", color: COLORS.dark, letterSpacing: 0.5 },
  menuSubtitle: { fontSize: 11, color: COLORS.silver, marginTop: 2 },
  footerSpacer: { height: 40 }
});