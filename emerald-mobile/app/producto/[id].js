import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  SafeAreaView, Dimensions, ActivityIndicator, Alert, StatusBar
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import API_BASE_URL from "../../config/api"; // ← AGREGADO

const { width } = Dimensions.get("window");

export default function ProductoDetalle() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [producto, setProducto] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    cargarProducto();
  }, [id]);

  const cargarProducto = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/productos/${id}`);
      setProducto(res.data);
    } catch (error) {
      console.log("❌ Error cargando producto:", error);
    }
  };

  const comprarProducto = async (productoId) => {
    console.log("🟢 BOTÓN DE COMPRA PRESIONADO");
    try {
      setLoadingAction(true);
      const usuarioData = await AsyncStorage.getItem("usuario");
      if (!usuarioData) {
        Alert.alert("Aviso", "Inicie sesión para continuar con la adquisición.");
        setLoadingAction(false);
        return;
      }
      const usuario = JSON.parse(usuarioData);
      const datosCompra = {
        id_producto: productoId,
        id_comprador: usuario.id_usuario,
        id_vendedor: producto.id_vendedor || 1,
        valor_compra: producto.valor || "0.00"
      };
      console.log("📤 Enviando compra al servidor:", datosCompra);
      const res = await axios.post(`${API_BASE_URL}/api/comprar`, datosCompra);
      if (res.data) {
        console.log("✅ Respuesta compra:", res.data);
        Alert.alert("Éxito", "La pieza ha sido adquirida correctamente.");
        await cargarProducto();
      }
    } catch (error) {
      console.log("❌ ERROR EN COMPRA:", error.response?.data || error.message);
      const msg = error.response?.data?.error || "No se pudo procesar la compra.";
      Alert.alert("Error", msg);
    } finally {
      setLoadingAction(false);
    }
  };

  const agregarFavorito = async (productoId) => {
    console.log("⭐ BOTÓN FAVORITOS PRESIONADO");
    try {
      const usuarioData = await AsyncStorage.getItem("usuario");
      if (!usuarioData) {
        Alert.alert("Aviso", "Inicie sesión para guardar en favoritos.");
        return;
      }
      const usuario = JSON.parse(usuarioData);
      const datosFavorito = {
        id_usuario: usuario.id_usuario,
        id_producto: productoId
      };
      console.log("📤 Enviando a favoritos:", datosFavorito);
      const res = await axios.post(`${API_BASE_URL}/api/favoritos`, datosFavorito);
      if (res.data) {
        console.log("✅ Respuesta favoritos:", res.data);
        Alert.alert("Guardado", "Añadido a su selección personal de Glaze.");
      }
    } catch (error) {
      console.log("❌ ERROR EN FAVORITOS:", error.response?.data || error.message);
      const msg = error.response?.data?.error || "No se pudo guardar el favorito.";
      Alert.alert("Favoritos", msg);
    }
  };

  const iniciarChat = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem("usuario");
      if (!usuarioData) {
        Alert.alert("Aviso", "Inicie sesión para contactar al vendedor.");
        return;
      }
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/conversaciones`, {
        id_vendedor: producto.id_vendedor
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push({
        pathname: "/conversacion",
        params: {
          id_conversacion: res.data.id_conversacion,
          nombre_contacto: producto.vendedor || "Vendedor"
        }
      });
    } catch (error) {
      console.log("❌ Error iniciando chat:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo iniciar la conversación.");
    }
  };

  if (!producto) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="small" color="#0a3d2e" />
        <Text style={styles.loadingText}>CARGANDO PIEZA...</Text>
      </View>
    );
  }

  const noDisponible = producto.estado === "vendido";

  return (
    <SafeAreaView style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color="#0a3d2e" />
          </TouchableOpacity>
          <Image
            source={{ uri: `${API_BASE_URL.replace("/api", "")}/uploads/${producto.imagen}` }}
            style={styles.mainImage}
            resizeMode="contain"
          />
          <Image
            source={require("C://Users/Migue/OneDrive/Desktop/EMERALD_TRADE/emerald-mobile/assets/images/LOGOS/Isotipo/Glaze-verde.png")}
            style={styles.watermarkLogo}
          />
        </View>

        <View style={styles.detailsContent}>
          <View style={styles.topRow}>
            <Text style={styles.skuText}>REF. VZ-{producto.id_producto}00</Text>
            <View style={[styles.statusBadge, noDisponible && styles.statusSold]}>
              <Text style={styles.statusText}>{(producto.estado || "DISPONIBLE").toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.mainTitle}>{(producto.tipo_producto || "PIEZA").toUpperCase()}</Text>
          <Text style={styles.subTitle}>COLECCIÓN: {(producto.vendedor || "GLAZE").toUpperCase()}</Text>
          <View style={styles.divider} />
          <View style={styles.technicalGrid}>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>COLOR</Text>
              <Text style={styles.techValue}>{producto.color || "N/A"}</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>CARATS</Text>
              <Text style={styles.techValue}>{producto.peso || "0"} ct</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceHeading}>VALORACIÓN</Text>
            <Text style={styles.priceValue}>
              ${Number(producto.valor || 0).toLocaleString()} <Text style={styles.usd}>USD</Text>
            </Text>
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={() => agregarFavorito(producto.id_producto)}
        >
          <Feather name="star" size={20} color="#0a3d2e" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryAction, (noDisponible || loadingAction) && styles.actionDisabled]}
          onPress={() => comprarProducto(producto.id_producto)}
          disabled={noDisponible || loadingAction}
        >
          {loadingAction ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.primaryActionText}>
              {noDisponible ? "PIEZA VENDIDA" : "ADQUIRIR AHORA"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAction} onPress={iniciarChat}>
          <Feather name="message-square" size={20} color="#0a3d2e" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: "#fff" },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 10, letterSpacing: 2, color: '#0a3d2e' },
  imageContainer: { height: 380, backgroundColor: '#fcfcfc', justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', top: 20, left: 20, zIndex: 10, padding: 10 },
  mainImage: { width: width * 0.8, height: 280 },
  watermarkLogo: { position: 'absolute', bottom: 20, right: 20, width: 30, height: 30, opacity: 0.1 },
  detailsContent: { paddingHorizontal: 30, marginTop: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skuText: { fontSize: 10, color: '#94a3b8', letterSpacing: 1 },
  statusBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4 },
  statusSold: { backgroundColor: '#fef2f2' },
  statusText: { fontSize: 9, fontWeight: '700', color: '#10b981' },
  mainTitle: { fontSize: 22, fontWeight: '300', color: '#0a3d2e', letterSpacing: 4, marginTop: 10 },
  subTitle: { fontSize: 10, color: '#64748b', marginTop: 5 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 20 },
  technicalGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  techItem: { width: '45%' },
  techLabel: { fontSize: 8, color: '#94a3b8', fontWeight: '800' },
  techValue: { fontSize: 15, color: '#1e293b' },
  priceContainer: { marginTop: 20, padding: 20, backgroundColor: '#fbfcfc' },
  priceHeading: { fontSize: 9, color: '#94a3b8' },
  priceValue: { fontSize: 28, color: '#0a3d2e', marginTop: 5 },
  usd: { fontSize: 12, color: '#94a3b8' },
  stickyFooter: {
    position: 'absolute', bottom: 0, width: '100%',
    flexDirection: 'row', padding: 20, paddingBottom: 35,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9',
    justifyContent: 'space-between', alignItems: 'center'
  },
  primaryAction: {
    flex: 1, marginHorizontal: 10, backgroundColor: '#1f6f54',
    height: 50, justifyContent: 'center', alignItems: 'center'
  },
  actionDisabled: { backgroundColor: '#cbd5e1' },
  primaryActionText: { color: 'white', fontWeight: '600', letterSpacing: 1, fontSize: 12 },
  secondaryAction: { width: 45, height: 45, borderRadius: 25, borderWidth: 1, borderColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }
});