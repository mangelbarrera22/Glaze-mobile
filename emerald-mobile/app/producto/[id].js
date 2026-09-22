import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  SafeAreaView, Dimensions, ActivityIndicator, Alert, StatusBar, Linking
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import API_BASE_URL from "../../config/api";

const { width } = Dimensions.get("window");

export default function ProductoDetalle() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [producto, setProducto] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [esFavorito, setEsFavorito] = useState(false);

  useEffect(() => {
    cargarProducto();
    verificarFavorito();
  }, [id]);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", async (event) => {
      console.log("🔗 REGRESO DESDE WOMPI:", event.url);

      try {
        const url = event.url;
        const parsed = Linking.parse(url);
        const referencia = parsed.queryParams?.referencia;
        const estado = parsed.queryParams?.estado;

        console.log("📦 Datos recibidos:", { referencia, estado });

        if (referencia) {
          await AsyncStorage.setItem("ultimaReferencia", referencia);
          verificarEstadoPago(referencia);
          return;
        }

        const refGuardada = await AsyncStorage.getItem("ultimaReferencia");
        if (refGuardada) {
          verificarEstadoPago(refGuardada);
        }

      } catch (error) {
        console.log("❌ Error leyendo deep link:", error);
      }
    });

    return () => subscription.remove();
  }, []);

  const cargarProducto = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/productos/${id}`);
      setProducto(res.data);
    } catch (error) {
      console.log("❌ Error cargando producto:", error);
    }
  };

  // ⭐ VERIFICAR SI EL PRODUCTO ES FAVORITO
  const verificarFavorito = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem("usuario");
      const token = await AsyncStorage.getItem("token");

      if (!usuarioData || !token) {
        setEsFavorito(false);
        return;
      }

      const usuario = JSON.parse(usuarioData);

      const res = await axios.get(
        `${API_BASE_URL}/api/favoritos/${usuario.id_usuario}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const existe = res.data.some(
        (fav) => Number(fav.id_producto) === Number(id)
      );

      setEsFavorito(existe);
    } catch (error) {
      console.log("❌ Error verificando favorito:", error.response?.data || error.message);
      setEsFavorito(false);
    }
  };

  // ➕ AGREGAR PRODUCTO A FAVORITOS
  const agregarFavorito = async (productoId) => {
    try {
      const usuarioData = await AsyncStorage.getItem("usuario");
      const token = await AsyncStorage.getItem("token");

      if (!usuarioData || !token) {
        Alert.alert("Aviso", "Inicie sesión para agregar a favoritos.");
        return;
      }

      const usuario = JSON.parse(usuarioData);

      await axios.post(
        `${API_BASE_URL}/api/favoritos`,
        {
          id_usuario: usuario.id_usuario,
          id_producto: productoId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEsFavorito(true);
      Alert.alert("Favoritos", "Producto agregado a tus favoritos.");
    } catch (error) {
      console.log("❌ Error agregando favorito:", error.response?.data || error.message);
      Alert.alert("Favoritos", error.response?.data?.error || "No se pudo agregar a favoritos.");
    }
  };

  // ➖ ELIMINAR PRODUCTO DE FAVORITOS
  const eliminarFavorito = async (productoId) => {
    try {
      const usuarioData = await AsyncStorage.getItem("usuario");
      const token = await AsyncStorage.getItem("token");

      if (!usuarioData || !token) return;

      const usuario = JSON.parse(usuarioData);

      await axios.delete(
        `${API_BASE_URL}/api/favoritos/${usuario.id_usuario}/${productoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEsFavorito(false);
      Alert.alert("Favoritos", "Producto eliminado de tus favoritos.");
    } catch (error) {
      console.log("❌ Error eliminando favorito:", error.response?.data || error.message);
      Alert.alert("Favoritos", error.response?.data?.error || "No se pudo eliminar de favoritos.");
    }
  };

  // 🔥 COMPRA CON WOMPI
  const comprarProducto = async (productoId) => {
    console.log("🟢 BOTÓN DE PAGO PRESIONADO");
    try {
      setLoadingAction(true);
      const usuarioData = await AsyncStorage.getItem("usuario");
      
      if (!usuarioData) {
        Alert.alert("Aviso", "Inicie sesión para continuar con la adquisición.");
        setLoadingAction(false);
        return;
      }
      
      const token = await AsyncStorage.getItem("token");

      const datosPago = {
        id_producto: productoId,
        id_vendedor: producto.id_vendedor || 1,
        // 🔥 Deep link propio de la app: así Wompi reabre Glaze (no el navegador)
        // después del pago. Debe coincidir con el "scheme" definido en app.json/app.config.js.
        redirect_url: Linking.createURL("pago-retorno")
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/pagos/iniciar`, 
        datosPago,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data && res.data.urlPago) {
        const { urlPago, referencia, monto } = res.data;
        
        await AsyncStorage.setItem("ultimaReferencia", referencia);
        
        const supported = await Linking.canOpenURL(urlPago);
        
        if (supported) {
          await Linking.openURL(urlPago);
          
          Alert.alert(
            "Pago en proceso",
            `Referencia: ${referencia}\nMonto: $${monto.toLocaleString()} COP\n\nCompleta el pago en Wompi y luego verifica el estado.`,
            [
              {
                text: "Verificar estado ahora",
                onPress: () => verificarEstadoPago(referencia)
              },
              {
                text: "Verificar después",
                style: "cancel"
              }
            ]
          );
        } else {
          Alert.alert("Error", "No se pudo abrir el enlace de pago de Wompi.");
        }
      }
    } catch (error) {
      console.log("❌ ERROR EN PAGO:", error.response?.data || error.message);
      const msg = error.response?.data?.error || "No se pudo iniciar el pago.";
      Alert.alert("Error", msg);
    } finally {
      setLoadingAction(false);
    }
  };

  // 🔥 VERIFICAR ESTADO DEL PAGO
  const verificarEstadoPago = async (referencia) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/pagos/estado/${referencia}`);
      const estado = res.data.estado;

      if (estado === 'APROBADO' || estado === 'RECHAZADO' || estado === 'ANULADO') {
        router.push({
          pathname: "/pago-resultado",
          params: {
            referencia: referencia,
            estado: estado,
            monto: res.data.monto || producto.valor,
            producto: producto.tipo_producto,
            imagen: producto.imagen
          }
        });
      } else if (estado === 'PENDIENTE') {
        Alert.alert(
          "Pago pendiente", 
          "El pago aún está en proceso de confirmación. Intenta verificar en unos minutos.",
          [
            {
              text: "Verificar de nuevo",
              onPress: () => verificarEstadoPago(referencia)
            },
            {
              text: "Cerrar"
            }
          ]
        );
      }
    } catch (error) {
      console.log("❌ Error verificando estado:", error);
      Alert.alert("Error", "No se pudo verificar el estado del pago. Intenta más tarde.");
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

      if (!token) {
        Alert.alert("Error", "No hay sesión activa.");
        return;
      }

      if (!producto.id_vendedor) {
        Alert.alert("Error", "Este producto no tiene vendedor.");
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/conversaciones`,
        {
          usuario2_id: Number(producto.id_vendedor)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      router.push({
        pathname: "/conversacion",
        params: {
          id_conversacion: String(res.data.id_conversacion),
          nombre_contacto: producto.nombre_vendedor || "Vendedor"
        }
      });

    } catch (error) {
      console.log("❌ Error iniciando chat:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "No se pudo iniciar la conversación.");
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
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={26} color="#0a3d2e" />
          </TouchableOpacity>
          
          {/* Imagen principal de Cloudinary */}
          <Image
            source={{ uri: producto.imagen }}
            style={styles.mainImage}
            resizeMode="contain"
          />

          <Image
            source={require("../../assets/images/LOGOS/Isotipo/Glaze-verde.png")}
            style={styles.watermarkLogo}
          />
        </View>

        <View style={styles.detailsContent}>
          <View style={styles.topRow}>
            <Text style={styles.skuText}>REF. VZ-{producto.id_producto}00</Text>
            <View style={[styles.statusBadge, noDisponible && styles.statusSold]}>
              <Text style={[styles.statusText, noDisponible && styles.statusTextSold]}>
                {(producto.estado || "DISPONIBLE").toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.mainTitle}>{(producto.tipo_producto || "PIEZA").toUpperCase()}</Text>
          <Text style={styles.subTitle}>
            VENDEDOR: {(producto.nombre_vendedor || "VENDEDOR").toUpperCase()}
          </Text>
          
          <View style={styles.divider} />
          
          <View style={styles.technicalGrid}>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>COLOR</Text>
              <Text style={styles.techValue}>{producto.color || "N/A"}</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>QUILATES</Text>
              <Text style={styles.techValue}>{producto.peso || "0"} ct</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceHeading}>VALORACIÓN</Text>
            <Text style={styles.priceValue}>
              ${Number(producto.valor || 0).toLocaleString()} <Text style={styles.usd}>COP</Text>
            </Text>
          </View>

          {producto.certificado && (
            <View style={styles.certificadoContainer}>
              <Text style={styles.priceHeading}>CERTIFICADO DE AUTENTICIDAD</Text>
              {/* Certificado directo de Cloudinary */}
              <Image
                source={{ uri: producto.certificado }}
                style={styles.certificadoImage}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
        <View style={{ height: 130 }} />
      </ScrollView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[
            styles.secondaryAction,
            esFavorito && styles.favoritoActivo,
          ]}
          onPress={async () => {
            if (esFavorito) {
              await eliminarFavorito(producto.id_producto);
            } else {
              await agregarFavorito(producto.id_producto);
            }
          }}
        >
          <Feather
            name="star"
            size={22}
            color={esFavorito ? "#f59e0b" : "#64748b"}
            fill={esFavorito ? "#f59e0b" : "none"}
          />
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
              {noDisponible ? "PIEZA VENDIDA" : "PAGAR CON WOMPI"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAction} onPress={iniciarChat}>
          <Feather name="message-square" size={22} color="#0a3d2e" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { 
    flex: 1, 
    backgroundColor: "#ffffff" 
  },
  loadingCenter: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: "#ffffff"
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 10, 
    letterSpacing: 2, 
    color: '#0a3d2e',
    fontWeight: '600'
  },
  imageContainer: { 
    height: 400, 
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 5
  },
  backButton: { 
    position: 'absolute', 
    top: 25, 
    left: 20, 
    zIndex: 10, 
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20
  },
  mainImage: { 
    width: width * 0.85, 
    height: 300 
  },
  watermarkLogo: { 
    position: 'absolute', 
    bottom: 25, 
    right: 25, 
    width: 35, 
    height: 35, 
    opacity: 0.08 
  },
  detailsContent: { 
    paddingHorizontal: 24, 
    marginTop: 20 
  },
  topRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  skuText: { 
    fontSize: 10, 
    color: '#94a3b8', 
    letterSpacing: 1.5,
    fontWeight: '600'
  },
  statusBadge: { 
    backgroundColor: '#ecfdf5', 
    paddingHorizontal: 10, 
    paddingVertical: 5,
    borderRadius: 4
  },
  statusSold: { 
    backgroundColor: '#fef2f2' 
  },
  statusText: { 
    fontSize: 9, 
    fontWeight: '700', 
    color: '#059669',
    letterSpacing: 1
  },
  statusTextSold: {
    color: '#ef4444'
  },
  mainTitle: { 
    fontSize: 24, 
    fontWeight: '300',
    color: '#0a3d2e', 
    letterSpacing: 3, 
    marginTop: 15 
  },
  subTitle: { 
    fontSize: 10, 
    color: '#64748b', 
    marginTop: 6,
    letterSpacing: 1,
    fontWeight: '500'
  },
  divider: { 
    height: 1, 
    backgroundColor: '#e2e8f0', 
    marginVertical: 24 
  },
  technicalGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  techItem: { 
    width: '45%' 
  },
  techLabel: { 
    fontSize: 9, 
    color: '#94a3b8', 
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4
  },
  techValue: { 
    fontSize: 16, 
    color: '#1e293b',
    fontWeight: '500'
  },
  priceContainer: { 
    marginTop: 30, 
    padding: 24, 
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1
  },
  priceHeading: { 
    fontSize: 9, 
    color: '#94a3b8',
    letterSpacing: 1.5,
    fontWeight: '700'
  },
  priceValue: { 
    fontSize: 32, 
    color: '#0a3d2e', 
    marginTop: 8,
    fontWeight: '400'
  },
  usd: { 
    fontSize: 14, 
    color: '#94a3b8',
    fontWeight: '400'
  },
  certificadoContainer: {
    marginTop: 20,
    padding: 24,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1
  },
  certificadoImage: {
    width: "100%",
    height: 450,
    marginTop: 20,
    borderRadius: 8
  },
  stickyFooter: {
    position: 'absolute', 
    bottom: 0, 
    width: '100%',
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingTop: 15,
    paddingBottom: 35,
    backgroundColor: '#ffffff', 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9',
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 10
  },
  primaryAction: {
    flex: 1, 
    marginHorizontal: 12, 
    backgroundColor: '#0a3d2e',
    height: 52, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 26,
    shadowColor: "#0a3d2e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4
  },
  actionDisabled: { 
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0
  },
  primaryActionText: { 
    color: '#ffffff', 
    fontWeight: '600', 
    letterSpacing: 1.5, 
    fontSize: 12 
  },
  secondaryAction: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  favoritoActivo: {
    backgroundColor: '#fffbeb',
    borderColor: '#fbbf24'
  }
});