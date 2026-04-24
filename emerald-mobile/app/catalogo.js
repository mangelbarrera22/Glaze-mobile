import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, SafeAreaView, ActivityIndicator, StatusBar } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const BASE_URL = "http://192.168.101.60:3000";
const COLORS = { dark: "#0a3d2e", accent: "#1f6f54", light: "#94a3b8", bg: "#fcfdfd" };

export default function Catalogo() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/productos`);
      setProductos(res.data);
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };

  // Buscador funcional sobre tu diseño
  const filtrados = productos.filter(p => 
    [p.color, p.tipo_producto].some(el => el?.toLowerCase().includes(search.toLowerCase()))
  );

  const renderItem = ({ item: p }) => (
    <View style={styles.cardGlaze}>
      <View style={styles.imageWrapper}>
        <Image source={require("../assets/images/LOGOS/Isotipo/Glaze-verde.png")} style={styles.cardWatermark} />
        <View style={styles.badgeLuxury}><Text style={styles.badgeText}>CERTIFICADO</Text></View>
        <Image source={{ uri: `${BASE_URL}/uploads/${p.imagen}` }} style={styles.gemImage} resizeMode="contain" />
      </View>

      <View style={styles.infoGlaze}>
        <View style={styles.specRow}>
          <Text style={styles.specTag}>{p.color?.toUpperCase()}</Text>
          <Text style={styles.specDivider}>|</Text>
          <Text style={styles.specTag}>{p.peso} CT</Text>
        </View>
        <Text style={styles.priceLabel}>VALORACIÓN ESTIMADA</Text>
        <Text style={styles.priceValue}>${Number(p.valor).toLocaleString()}</Text>
        <TouchableOpacity style={styles.btnAction} onPress={() => router.push(`/producto/${p.id_producto}`)}>
          <Text style={styles.btnActionText}>ADQUIRIR PIEZA</Text>
          <Feather name="arrow-right" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.brandTitle}>GLAZE</Text>
          <Text style={styles.brandSubtitle}>CATÁLOGO DE INVERSIÓN</Text>
        </View>
        <Image source={require("../assets/images/LOGOS/Isotipo/Glaze-verde.png")} style={styles.headerLogo} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
          <Feather name="chevron-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <Feather name="search" size={16} color={COLORS.light} />
        <TextInput 
          placeholder="Filtrar características..." placeholderTextColor="#cbd5e1" 
          style={styles.input} value={search} onChangeText={setSearch} 
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.dark} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filtrados} keyExtractor={(item) => item.id_producto.toString()}
          renderItem={renderItem} contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 25, paddingVertical: 30, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg },
  headerContent: { flex: 1 },
  brandTitle: { fontSize: 24, fontWeight: '300', color: COLORS.dark, letterSpacing: 4 },
  brandSubtitle: { fontSize: 9, color: COLORS.light, letterSpacing: 2, marginTop: 5, fontWeight: '700' },
  headerLogo: { width: 40, height: 40, opacity: 0.8, marginRight: 15 },
  backCircle: { padding: 8, borderRadius: 100, backgroundColor: '#f1f5f9' },
  searchSection: { marginHorizontal: 25, paddingHorizontal: 15, height: 45, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 20 },
  input: { flex: 1, marginLeft: 10, fontSize: 13, color: '#1e293b' },
  listContainer: { paddingHorizontal: 25, paddingBottom: 40 },
  cardGlaze: { backgroundColor: "white", marginBottom: 35, borderWidth: 1, borderColor: "#f1f5f9", elevation: 2 },
  imageWrapper: { height: 220, backgroundColor: "#fbfcfc", justifyContent: "center", alignItems: "center", overflow: 'hidden' },
  cardWatermark: { position: 'absolute', width: 150, height: 150, opacity: 0.05, transform: [{ rotate: '-15deg' }] },
  gemImage: { width: 160, height: 160 },
  badgeLuxury: { position: "absolute", top: 15, right: 0, backgroundColor: COLORS.dark, paddingVertical: 4, paddingHorizontal: 12 },
  badgeText: { color: "white", fontSize: 8, fontWeight: "700", letterSpacing: 1.5 },
  infoGlaze: { padding: 20 },
  specRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  specTag: { fontSize: 11, fontWeight: '600', color: '#64748b', letterSpacing: 1 },
  specDivider: { marginHorizontal: 10, color: '#e2e8f0' },
  priceLabel: { fontSize: 9, color: COLORS.light, letterSpacing: 1.5, fontWeight: '700' },
  priceValue: { color: COLORS.dark, fontSize: 26, fontWeight: "300", marginTop: 5, marginBottom: 20 },
  btnAction: { backgroundColor: COLORS.accent, height: 50, flexDirection: 'row', alignItems: "center", justifyContent: 'center', gap: 10 },
  btnActionText: { color: "white", fontWeight: "600", letterSpacing: 2, fontSize: 12 },
});