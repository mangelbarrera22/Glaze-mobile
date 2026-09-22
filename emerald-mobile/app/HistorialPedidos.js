import React, { useEffect, useState } from "react";
import { 
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";
import API_BASE_URL from "../config/api"; 
const { width } = Dimensions.get("window");

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

      // 1. Obtener usuario y token almacenados
      const usuarioRaw = await AsyncStorage.getItem("usuario");
      const token = await AsyncStorage.getItem("token");

      if (!usuarioRaw) throw new Error("Sesión no encontrada.");

      const usuario = JSON.parse(usuarioRaw);

      // 2. Enviar el token Bearer en los headers de Axios
      const res = await axios.get(
        `${API_BASE_URL}/api/historial/${usuario.id_usuario}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPedidos(res.data);
    } catch (err) {
      console.error("Error al cargar historial:", err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || "Error al cargar el historial.");
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
 const imprimirCertificado = async (p) => {
  try {
    console.log("🖨️ Generando certificado:", p.id_venta);

    const imagenProducto = p.imagen
      ? `${API_BASE_URL}/uploads/${p.imagen}`
      : null;

    const certificado = p.certificado
      ? `${API_BASE_URL}/uploads/${p.certificado}`
      : null;

    const referencia = `GLZ-${String(p.id_venta).padStart(5, "0")}`;

    const valor = p.valor_compra != null
      ? Number(p.valor_compra).toLocaleString("es-CO")
      : "—";

    const fecha = formatearFecha(p.fecha_compra);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">

        <title>Certificado ${referencia}</title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: Arial, Helvetica, sans-serif;
            color: #0a3d2e;
          }

          .page {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 45px;
          }

          .header {
            text-align: center;
            border-bottom: 2px solid #1f6f54;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }

          .logo {
            font-size: 34px;
            font-weight: 300;
            letter-spacing: 7px;
          }

          .subtitle {
            font-size: 10px;
            letter-spacing: 3px;
            color: #94a3b8;
            margin-top: 8px;
          }

          .reference {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
          }

          .reference-label {
            font-size: 8px;
            color: #94a3b8;
            letter-spacing: 2px;
          }

          .reference-value {
            font-size: 17px;
            color: #0a3d2e;
            letter-spacing: 2px;
          }

          .status {
            background: #0a3d2e;
            color: white;
            display: inline-block;
            padding: 7px 12px;
            font-size: 8px;
            letter-spacing: 2px;
          }

          .product {
            display: flex;
            align-items: center;
            border: 1px solid #f1f5f9;
            padding: 25px;
            margin-top: 25px;
          }

          .product-image {
            width: 180px;
            height: 180px;
            object-fit: contain;
            margin-right: 35px;
          }

          .product-info {
            flex: 1;
          }

          .label {
            font-size: 8px;
            color: #94a3b8;
            letter-spacing: 2px;
            margin-bottom: 5px;
          }

          .value {
            font-size: 16px;
            color: #0a3d2e;
            margin-bottom: 18px;
          }

          .details {
            border-top: 1px solid #f1f5f9;
            border-bottom: 1px solid #f1f5f9;
            padding: 20px 0;
            margin-top: 25px;
          }

          .row {
            display: flex;
            justify-content: space-between;
          }

          .total {
            font-size: 24px;
            color: #0a3d2e;
          }

          .certificate {
            margin-top: 30px;
            text-align: center;
          }

          .certificate-title {
            font-size: 11px;
            letter-spacing: 3px;
            margin-bottom: 15px;
          }

          .certificate-image {
            max-width: 100%;
            max-height: 500px;
            object-fit: contain;
          }

          .footer {
            margin-top: 45px;
            padding-top: 15px;
            border-top: 1px solid #f1f5f9;
            text-align: center;
            color: #94a3b8;
            font-size: 8px;
            letter-spacing: 1px;
          }

          @media print {

            @page {
              size: A4;
              margin: 0;
            }

            body {
              width: 210mm;
              min-height: 297mm;
            }

            .page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
            }

          }

        </style>
      </head>

      <body>

        <div class="page">

          <div class="header">

            <div class="logo">
              GLAZE
            </div>

            <div class="subtitle">
              CERTIFICADO DIGITAL DE ADQUISICIÓN
            </div>

          </div>


          <div class="reference">

            <div>
              <div class="reference-label">
                REFERENCIA DE VENTA
              </div>

              <div class="reference-value">
                ${referencia}
              </div>
            </div>

            <span class="status">
              COMPRA CONFIRMADA
            </span>

          </div>


          <div class="product">

            ${
              imagenProducto
                ? `
                  <img
                    class="product-image"
                    src="${imagenProducto}"
                  />
                `
                : ""
            }


            <div class="product-info">

              <div class="label">
                PIEZA ADQUIRIDA
              </div>

              <div class="value">
                ${(p.nombre_producto || "Gema Exclusiva").toUpperCase()}
              </div>


              <div class="label">
                COLOR
              </div>

              <div class="value">
                ${p.color || "Especial"}
              </div>


              <div class="label">
                PESO
              </div>

              <div class="value">
                ${p.peso || "N/A"} CT
              </div>

            </div>

          </div>


          <div class="details">

            <div class="row">

              <div>

                <div class="label">
                  FECHA DE ADQUISICIÓN
                </div>

                <div>
                  ${fecha}
                </div>

              </div>


              <div style="text-align:right">

                <div class="label">
                  VALOR DE ADQUISICIÓN
                </div>

                <div class="total">
                  $${valor}
                </div>

              </div>

            </div>

          </div>


          ${
            certificado
              ? `
                <div class="certificate">

                  <div class="certificate-title">
                    CERTIFICADO DE AUTENTICIDAD
                  </div>

                  <img
                    class="certificate-image"
                    src="${certificado}"
                  />

                </div>
              `
              : ""
          }


          <div class="footer">
            GLAZE · REGISTRO DIGITAL DE ADQUISICIONES
          </div>

        </div>

      </body>
      </html>
    `;


    // ==========================================
    // 🌐 WEB
    // ==========================================

    if (Platform.OS === "web") {

      console.log("🌐 Generando impresión individual WEB");

      const ventana = window.open(
        "",
        "_blank",
        "width=900,height=1000"
      );

      if (!ventana) {
        Alert.alert(
          "Ventana bloqueada",
          "Permite las ventanas emergentes para imprimir el certificado."
        );
        return;
      }

      ventana.document.open();
      ventana.document.write(html);
      ventana.document.close();

      // Esperar a que carguen las imágenes
      setTimeout(() => {

        ventana.focus();

        ventana.print();

      }, 800);

      return;
    }


    // ==========================================
    // 📱 ANDROID / IOS
    // ==========================================

    const resultado = await Print.printToFileAsync({
      html: html,
      base64: false
    });

    console.log("✅ PDF generado:", resultado);

    if (resultado?.uri) {

      if (await Sharing.isAvailableAsync()) {

        await Sharing.shareAsync(resultado.uri, {
          mimeType: "application/pdf",
          dialogTitle: `Certificado ${referencia}`,
          UTI: "com.adobe.pdf"
        });

      } else {

        Alert.alert(
          "PDF generado",
          "El certificado fue generado correctamente."
        );

      }

    } else {

      Alert.alert(
        "Error",
        "No se pudo generar el archivo PDF."
      );

    }

  } catch (error) {

    console.log(
      "❌ ERROR GENERANDO CERTIFICADO:",
      error
    );

    Alert.alert(
      "Error",
      "No fue posible generar el certificado."
    );

  }
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
                      source={{ uri: `${API_BASE_URL}/uploads/${p.imagen}` }} 
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
                <TouchableOpacity
  style={styles.btnAction}
  onPress={() => imprimirCertificado(p)}
>
  <Feather name="printer" size={14} color="white" />

  <Text style={styles.btnActionText}>
    IMPRIMIR CERTIFICADO DIGITAL
  </Text>
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