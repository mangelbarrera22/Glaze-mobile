import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Image, TextInput, TouchableOpacity,
  FlatList, SafeAreaView, Alert, StatusBar, ActivityIndicator, Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import API_BASE_URL from "../config/api"; 
const { width } = Dimensions.get("window");

const COLORS = { dark: "#0a3d2e", accent: "#1f6f54", light: "#94a3b8", bg: "#fcfdfd" };

export default function Favoritos() {
  const router = useRouter();
  const [favoritos, setFavoritos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarFavoritos();
  }, []);

const cargarFavoritos = async () => {
    try {
      setLoading(true);
      const usuarioData = await AsyncStorage.getItem("usuario");
      const token = await AsyncStorage.getItem("token"); // 1. Recuperar token

      if (!usuarioData) {
        setLoading(false);
        return;
      }
      
      const usuario = JSON.parse(usuarioData);

      // 2. Enviar el token en los headers de la petición
      const res = await axios.get(`${API_BASE_URL}/api/favoritos/${usuario.id_usuario}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setFavoritos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error cargando favoritos:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarFavorito = async (id_favorito, id_producto) => {
    try {
      const usuarioData = await AsyncStorage.getItem("usuario");
      const token = await AsyncStorage.getItem("token");
      const usuario = JSON.parse(usuarioData);

      // 3. Incluir el token y ajustar los parámetros si la ruta requiere id_usuario
      await axios.delete(`${API_BASE_URL}/api/favoritos/${usuario.id_usuario}/${id_producto}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Actualización optimista de la lista
      setFavoritos(prev => prev.filter(item => item.id_producto !== id_producto));
    } catch (error) {
      console.error("Error al eliminar:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo actualizar su selección.");
    }
  };

  // Filtrado por tipo de gema o color
  const filtrados = favoritos.filter(p =>
    (p.tipo_producto || "").toLowerCase().includes(filtro.toLowerCase()) ||
    (p.color || "").toLowerCase().includes(filtro.toLowerCase())
  );

  const renderItem = ({ item: p }) => {
    const noDisponible = p.estado === "vendido";

    return (
      <View style={[styles.cardGlaze, noDisponible && styles.cardDisabled]}>
        <View style={styles.imageWrapper}>
          <Image 
            source={require("../assets/images/LOGOS/Isotipo/Glaze-verde.png")} 
            style={styles.cardWatermark} 
          />
          
          <View style={styles.topRowCard}>
            <View style={styles.badgeLuxury}>
              <Text style={styles.badgeText}>PIEZA EXCLUSIVA</Text>
            </View>
            
            {/* BOTÓN DE CORAZÓN: Envía el id_favorito para la DB y id_producto para el estado */}
            <TouchableOpacity 
              style={styles.heartBtn} 
              onPress={() => eliminarFavorito(p.id_favorito, p.id_producto)}
            >
              <FontAwesome name="heart" size={18} color="#e11d48" />
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: `${API_BASE_URL}/uploads/${p.imagen}` }}
            style={styles.gemImage}
            resizeMode="contain"
          />
          
          {noDisponible && (
            <View style={styles.soldOverlay}>
              <Text style={styles.soldText}>ADQUIRIDA</Text>
            </View>
          )}
        </View>

        <View style={styles.infoGlaze}>
          <Text style={styles.vendedorTag}>{(p.vendedor || "Colección Glaze").toUpperCase()}</Text>
          <Text style={styles.nombreGema}>{(p.tipo_producto || "Gema").toUpperCase()}</Text>
          
          <View style={styles.specRow}>
            <Text style={styles.specText}>{p.color} • {p.peso} CT</Text>
            <Text style={styles.priceValue}>${Number(p.valor).toLocaleString()}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.btnAction, noDisponible && styles.btnInactive]} 
            onPress={() => router.push(`/producto/${p.id_producto}`)}
          >
            <Text style={styles.btnActionText}>
              {noDisponible ? "PIEZA NO DISPONIBLE" : "DETALLES DE INVERSIÓN"}
            </Text>
            {!noDisponible && <Feather name="arrow-right" size={14} color="white" />}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>Favoritos</Text>
          <View style={styles.accentLine} />
          <Text style={styles.brandSubtitle}>MI SELECCIÓN PRIVADA</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
          <Feather name="chevron-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchSection}>
        <Feather name="search" size={16} color={COLORS.light} />
        <TextInput 
          placeholder="Buscar por color o tipo..." 
          placeholderTextColor="#cbd5e1" 
          style={styles.input} 
          value={filtro} 
          onChangeText={setFiltro} 
        />
      </View>

      {/* LISTADO */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.dark} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.id_favorito.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="archive" size={40} color="#e2e8f0" />
              <Text style={styles.emptyText}>Tu selección está vacía.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#ffffff" },
  header: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandTitle: { fontSize: 26, fontWeight: '300', color: COLORS.dark, letterSpacing: 1 },
  accentLine: { width: 30, height: 2, backgroundColor: COLORS.accent, marginVertical: 6 },
  brandSubtitle: { fontSize: 8, color: COLORS.light, letterSpacing: 2, fontWeight: '800' },
  backCircle: { padding: 8, borderRadius: 100, backgroundColor: '#f8fafc' },
  
  searchSection: { marginHorizontal: 25, marginVertical: 20, paddingHorizontal: 15, height: 50, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fbfcfc', borderRadius: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  input: { flex: 1, marginLeft: 10, fontSize: 13, color: COLORS.dark },
  
  listContainer: { paddingHorizontal: 25, paddingBottom: 40 },
  cardGlaze: { backgroundColor: "white", marginBottom: 35, borderRadius: 4, elevation: 1 },
  cardDisabled: { opacity: 0.7 },
  
  imageWrapper: { height: 230, backgroundColor: "#fcfcfc", justifyContent: "center", alignItems: "center", borderRadius: 4 },
  cardWatermark: { position: 'absolute', width: 140, height: 140, opacity: 0.03 },
  gemImage: { width: 160, height: 160 },
  
  topRowCard: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 10, zIndex: 10 },
  badgeLuxury: { backgroundColor: COLORS.dark, paddingVertical: 8, paddingHorizontal: 12 },
  badgeText: { color: "white", fontSize: 7, fontWeight: "800", letterSpacing: 1.5 },
  heartBtn: { backgroundColor: '#fff', padding: 8, borderRadius: 100, elevation: 3, marginTop: 10 },
  
  infoGlaze: { paddingVertical: 20 },
  vendedorTag: { fontSize: 8, fontWeight: "800", color: COLORS.light, letterSpacing: 1.5, marginBottom: 5 },
  nombreGema: { fontSize: 18, fontWeight: "300", color: COLORS.dark, letterSpacing: 3, marginBottom: 15 },
  
  specRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  specText: { fontSize: 13, color: "#64748b" },
  priceValue: { color: COLORS.dark, fontSize: 20, fontWeight: "400" },
  
  btnAction: { backgroundColor: COLORS.dark, height: 50, flexDirection: 'row', alignItems: "center", justifyContent: 'center', gap: 10, borderRadius: 2 },
  btnInactive: { backgroundColor: "#f1f5f9" },
  btnActionText: { color: "white", fontWeight: "600", letterSpacing: 1, fontSize: 10 },
  
  soldOverlay: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.9)', padding: 12, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  soldText: { color: COLORS.dark, fontWeight: '900', fontSize: 10, letterSpacing: 2 },
  
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, color: COLORS.light, fontSize: 12, letterSpacing: 1 }
});