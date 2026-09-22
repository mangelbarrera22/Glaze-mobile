import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar 
} from "react-native";

import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import API_BASE_URL from "../config/api";

export default function Dashboard() {
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState(""); // 🔥 CAMBIO
  const [stats, setStats] = useState({
    totalCompras: 0,
    gastoTotal: 0
  });

  const [loadingStats, setLoadingStats] = useState(true);

  // ==========================
  // 🧩 FUNCIÓN CAPITALIZAR
  // ==========================
  const capitalizar = (texto) => {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  // ==========================
  // 👤 CARGAR USUARIO
  // ==========================
  const cargarUsuario = async () => {
    try {
      const data = await AsyncStorage.getItem("usuario");

      if (!data) {
        router.replace("/");
        return;
      }

      const user = JSON.parse(data);

      // 🔥 EXTRAER NOMBRE Y APELLIDO CAPITALIZADOS
      const nombre = capitalizar(user.primer_nombre || "");
      const apellido = capitalizar(user.primer_apellido || "");

      setNombreCompleto(`${nombre} ${apellido}`);

    } catch (error) {
      console.log("Error usuario:", error);
    }
  };

  // ==========================
  // 📊 CARGAR ESTADÍSTICAS
  // ==========================
  const cargarEstadisticas = async () => {
    try {
      setLoadingStats(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/dashboard/estadisticas`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Error backend:", data);
        return;
      }

      setStats({
        totalCompras: data.totalCompras || 0,
        gastoTotal: data.gastoTotal || 0
      });

    } catch (error) {
      console.log("Error stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // ==========================
  // 🔄 REFRESH AUTOMÁTICO
  // ==========================
  useFocusEffect(
    useCallback(() => {
      cargarUsuario();
      cargarEstadisticas();
    }, [])
  );

  // ==========================
  // 🔓 LOGOUT
  // ==========================
  const cerrarSesion = async () => {
    await AsyncStorage.removeItem("usuario");
    await AsyncStorage.removeItem("token");
    router.replace("/");
  };

  // ==========================
  // 🧩 COMPONENTE MENÚ
  // ==========================
  const MenuOption = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity 
      style={styles.menuCard} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Feather name={icon} size={20} color="#1f6f54" />
      </View>

      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>

      <Feather name="chevron-right" size={16} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.bienvenida}>Bienvenido,</Text>
            <Text style={styles.usuarioName}>
              {nombreCompleto || "Usuario"} {/* 🔥 CAMBIO */}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.miniLogout} 
            onPress={cerrarSesion}
          >
            <Feather name="log-out" size={18} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.panelTag}>
          MIEMBRO EXCLUSIVO • GLAZE
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >

        {/* 📊 STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>COMPRAS</Text>

            <Text style={styles.statNumber}>
              {loadingStats ? "..." : stats.totalCompras}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>GASTO TOTAL</Text>

            <Text style={styles.statNumber}>
              {loadingStats 
                ? "..." 
                : `$${Number(stats.gastoTotal).toLocaleString()}`
              }
            </Text>
          </View>
        </View>

        {/* 🛒 CATÁLOGO */}
        <Text style={styles.sectionTitle}>
          Catálogo y Compras
        </Text>

        <MenuOption 
          icon="shopping-bag" 
          title="Comprar Esmeraldas" 
          subtitle="Explora piezas exclusivas"
          onPress={() => router.push("/catalogo")}
        />

        <MenuOption 
          icon="star" 
          title="Favoritos" 
          subtitle="Lista de deseos personalizada"
          onPress={() => router.push("/favoritos")}
        />

        <MenuOption 
          icon="clock" 
          title="Historial de Compras" 
          subtitle="Gestión de pedidos"
          onPress={() => router.push("/HistorialPedidos")}
        />
        <MenuOption 
          icon="message-circle" 
          title="Mensajes" 
          subtitle="Comunícate con vendedores"
          onPress={() => router.push("/conversaciones")}
        />

        {/* 👤 CUENTA */}
        <Text style={styles.sectionTitle}>
          Mi Cuenta
        </Text>

        <MenuOption 
          icon="user" 
          title="Editar Perfil" 
          onPress={() => router.push("/perfil")} 
        />

        <MenuOption 
          icon="shield" 
          title="Seguridad y Soporte" 
          onPress={() => router.push("/soporte")} 
        />

        <MenuOption 
          icon="help-circle" 
          title="Preguntas Frecuentes" 
          onPress={() => router.push("/faq")} 
        />

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================
// 🎨 ESTILOS (SIN CAMBIOS)
// ==========================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfdfd" },

  header: {
    backgroundColor: "#0a3d2e",
    paddingHorizontal: 25,
    paddingBottom: 40,
    paddingTop: 20
  },

  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },

  bienvenida: { 
    color: "rgba(255,255,255,0.6)", 
    fontSize: 13 
  },

  usuarioName: { 
    color: "white", 
    fontSize: 28 
  },

  panelTag: { 
    color: "rgba(255,255,255,0.4)", 
    fontSize: 10, 
    marginTop: 8 
  },

  miniLogout: { 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)', 
    padding: 10 
  },

  scrollContent: { 
    paddingHorizontal: 25, 
    paddingTop: 25 
  },

  statsRow: { 
    flexDirection: 'row', 
    gap: 15, 
    marginBottom: 30 
  },

  statBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#1f6f54'
  },

  statNumber: { 
    fontSize: 22, 
    color: '#0a3d2e', 
    marginTop: 5 
  },

  statLabel: { 
    fontSize: 9, 
    color: '#94a3b8' 
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 15,
    marginTop: 10
  },

  menuCard: {
    backgroundColor: "white",
    paddingVertical: 18,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },

  iconContainer: { marginRight: 15 },

  menuTextContainer: { flex: 1 },

  menuTitle: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#1e293b" 
  },

  menuSubtitle: { 
    fontSize: 11, 
    color: "#94a3b8" 
  },

  footerSpacer: { height: 60 }
});