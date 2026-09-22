import React, { useState } from "react";
import {
  View, Text, TextInput, Alert, Image, TouchableOpacity,
  StyleSheet, ScrollView, SafeAreaView, ActivityIndicator,
  StatusBar, Switch, Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import API_BASE_URL from "../config/api";

const COLORS = {
  dark: "#0a3d2e",      // Esmeralda Profundo
  accent: "#1f6f54",    // Esmeralda Glaze
  silver: "#94a3b8",    // Gris sofisticado
  bg: "#F8F9FA",        // Blanco hueso/galería
  border: "#E2E8F0",    // Borde sutil
  white: "#ffffff",
  gold: "#b8a355",      // Dorado Glaze
  error: "#991b1b",
  success: "#065f46"
};

export default function PublicarProducto() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    tipo_producto: "esmeralda",
    color: "",
    peso: "",
    tratamiento: "",
    valor: "",
    stock: "1",
    imagen: null,
    certificado: null,
    tiene_esmeralda: false,
    oro: false,
    oro_rosado: false,
    plata: false,
  });

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setForm((prev) => ({ ...prev, imagen: result.assets[0] }));
    }
  };

  const pickCertificado = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
    });
    if (!result.canceled) {
      setForm((prev) => ({ ...prev, certificado: result.assets[0] }));
    }
  };

  // ☁️ Función limpia y directa con Axios hacia Cloudinary
  const subirArchivoCloudinary = async (fileInput) => {
    const data = new FormData();

    // Si viene desde la web, fileInput puede ser un objeto o string, adaptemos el archivo:
    if (Platform.OS === 'web') {
      // En la web, si el ImagePicker te da una uri de tipo blob o file, la convertimos:
      const response = await fetch(fileInput);
      const blob = await response.blob();
      data.append("file", blob, "upload.jpg");
    } else {
      // En celular nativo (Android / iOS)
      const filename = fileInput.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      data.append("file", {
        uri: fileInput,
        name: filename,
        type,
      });
    }
    
    data.append("upload_preset", "glaze_unsigned"); 
    data.append("cloud_name", "kadud08u");          

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/kadud08u/image/upload",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data.secure_url; 
    } catch (error) {
      console.error("DETALLE EXACTO DE CLOUDINARY:", error.response?.data || error.message);
      throw new Error("No se pudo subir la imagen a la nube.");
    }
  };

  const handleSubmit = async () => {
    setStatusMsg({ text: "", type: "" });
    if (!form.color || !form.peso || !form.valor || !form.imagen) {
      setStatusMsg({ text: "Los campos marcados son obligatorios.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      // 1. Subir imagen principal pasando estrictamente .uri
      console.log("☁️ Subiendo imagen a Cloudinary...");
      const imagenUrl = await subirArchivoCloudinary(form.imagen.uri);

      let certificadoUrl = null;
      if (form.certificado) {
        console.log("📄 Subiendo certificado a Cloudinary...");
        certificadoUrl = await subirArchivoCloudinary(form.certificado.uri);
      }

      // 2. Crear el JSON limpio con las URLs en texto plano
      const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      const payload = {
        fecha_ingreso: fechaActual,
        tipo_producto: form.tipo_producto,
        color: form.color,
        peso: form.peso,
        tratamiento: form.tratamiento,
        valor: form.valor,
        stock: form.stock,
        imagen: imagenUrl,
        certificado: certificadoUrl,
        tiene_esmeralda: form.tiene_esmeralda ? "1" : "0",
        oro: form.oro ? "1" : "0",
        oro_rosado: form.oro_rosado ? "1" : "0",
        plata: form.plata ? "1" : "0",
      };

      console.log("🚀 Enviando JSON al backend en Railway:", `${API_BASE_URL}/api/productos`);

      // 3. Enviar los datos por POST en formato JSON a tu backend
      const response = await axios.post(`${API_BASE_URL}/api/productos`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.ok || response.status === 201) {
        setStatusMsg({ text: "Activo registrado en el inventario Glaze.", type: "success" });
        setTimeout(() => resetForm(), 2000);
      }
    } catch (error) {
      console.error("Error al registrar activo:", error.response?.data || error.message);
      setStatusMsg({ text: "Error en la conexión o subida.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      tipo_producto: "esmeralda", color: "", peso: "", tratamiento: "",
      valor: "", stock: "1", imagen: null, certificado: null,
      tiene_esmeralda: false, oro: false, oro_rosado: false, plata: false,
    });
    setStatusMsg({ text: "", type: "" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Feather name="chevron-left" size={28} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>NUEVO ACTIVO</Text>
              <Text style={styles.headerTag}>CURADURÍA GLAZE</Text>
            </View>
          </View>
          
          <Image 
            source={require("../assets/images/LOGOS/Isotipo/Glaze-blanco.png")}
            style={styles.logoHeader}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Selector de Categoría Estilo "Luxury Tab" */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>NATURALEZA DEL ACTIVO</Text>
          <View style={styles.tabRow}>
            <TouchableOpacity 
              style={[styles.tab, form.tipo_producto === "esmeralda" && styles.tabActive]}
              onPress={() => handleChange("tipo_producto", "esmeralda")}
            >
              <Text style={[styles.tabText, form.tipo_producto === "esmeralda" && styles.tabTextActive]}>GEMA SUELTA</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, form.tipo_producto === "joya" && styles.tabActive]}
              onPress={() => handleChange("tipo_producto", "joya")}
            >
              <Text style={[styles.tabText, form.tipo_producto === "joya" && styles.tabTextActive]}>JOYERÍA PIEZA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Campos de especificación */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>ESPECIFICACIONES TÉCNICAS</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.fieldTitle}>COLOR / TONALIDAD</Text>
            <View style={styles.inputBox}>
              <TextInput style={styles.input} placeholder="Ej: Deep Green" placeholderTextColor={COLORS.silver} onChangeText={(v) => handleChange("color", v)} value={form.color} />
              <Feather name="droplet" size={14} color={COLORS.accent} />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.fieldTitle}>PESO (QUILATES)</Text>
            <View style={styles.inputBox}>
              <TextInput style={styles.input} placeholder="0.00 ct" placeholderTextColor={COLORS.silver} keyboardType="numeric" onChangeText={(v) => handleChange("peso", v)} value={form.peso} />
              <Feather name="box" size={14} color={COLORS.accent} />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.fieldTitle}>TRATAMIENTO</Text>
            <View style={styles.inputBox}>
              <TextInput style={styles.input} placeholder="Insignificante / Menor / Aceite" placeholderTextColor={COLORS.silver} onChangeText={(v) => handleChange("tratamiento", v)} value={form.tratamiento} />
              <Feather name="activity" size={14} color={COLORS.accent} />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.fieldTitle}>VALOR COMERCIAL (USD)</Text>
            <View style={styles.inputBox}>
              <TextInput style={styles.input} placeholder="$ 0,00" placeholderTextColor={COLORS.silver} keyboardType="numeric" onChangeText={(v) => handleChange("valor", v)} value={form.valor} />
              <Feather name="dollar-sign" size={14} color={COLORS.accent} />
            </View>
          </View>
        </View>

        {form.tipo_producto === "joya" && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>DETALLES DE COMPOSICIÓN</Text>
            {[
              { label: "Esmeralda Certificada", name: "tiene_esmeralda" },
              { label: "Oro de 18 Kilates", name: "oro" },
              { label: "Plata de Ley 950", name: "plata" },
            ].map((item) => (
              <View key={item.name} style={styles.switchRow}>
                <Text style={styles.switchLabel}>{item.label}</Text>
                <Switch 
                  value={form[item.name]} 
                  onValueChange={(v) => handleChange(item.name, v)} 
                  trackColor={{ false: "#D1D5DB", true: COLORS.accent }}
                  thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                />
              </View>
            ))}
          </View>
        )}

        {/* Multimedia con estilo editorial */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>DOCUMENTACIÓN VISUAL</Text>
          
          <TouchableOpacity style={styles.fileBtn} onPress={pickImage}>
            <Feather name="camera" size={20} color={COLORS.accent} />
            <Text style={styles.fileBtnText}>{form.imagen ? "IMAGEN CARGADA" : "ADJUNTAR FOTOGRAFÍA"}</Text>
          </TouchableOpacity>
          
          {form.imagen && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: form.imagen.uri }} style={styles.previewImage} />
              <View style={styles.previewBadge}><Text style={styles.badgeText}>PREVIEW</Text></View>
            </View>
          )}

          <TouchableOpacity style={[styles.fileBtn, {marginTop: 15}]} onPress={pickCertificado}>
            <Feather name="shield" size={20} color={COLORS.accent} />
            <Text style={styles.fileBtnText}>{form.certificado ? "CERTIFICADO LISTO" : "CERTIFICACIÓN GIA / CDTEC"}</Text>
          </TouchableOpacity>
        </View>

        {statusMsg.text !== "" && (
          <View style={[styles.statusBanner, statusMsg.type === "error" ? styles.bgError : styles.bgSuccess]}>
            <Feather name={statusMsg.type === "error" ? "alert-circle" : "check"} size={16} color="white" />
            <Text style={styles.statusText}>{statusMsg.text.toUpperCase()}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.boton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.botonText}>REGISTRAR EN INVENTARIO</Text>}
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { 
    backgroundColor: COLORS.dark, 
    paddingHorizontal: 24, 
    paddingBottom: 25, 
    paddingTop: Platform.OS === 'ios' ? 10 : 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { marginRight: 12, marginLeft: -8 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600", letterSpacing: 2 },
  headerTag: { color: COLORS.gold, fontSize: 10, letterSpacing: 3, fontWeight: "700", marginTop: 2 },
  logoHeader: {
    width: 100,
    height: 50,
  },
  scrollContent: { padding: 20 },
  sectionContainer: { marginBottom: 20 },
  sectionLabel: { 
    fontSize: 10, 
    color: COLORS.accent, 
    fontWeight: "800", 
    letterSpacing: 2, 
    marginBottom: 15,
    paddingLeft: 2
  },
  card: { 
    backgroundColor: COLORS.white, 
    padding: 24, 
    borderRadius: 8, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  tabRow: { flexDirection: "row", gap: 8 },
  tab: { 
    flex: 1, 
    padding: 14, 
    borderRadius: 6,
    borderWidth: 1, 
    borderColor: COLORS.border, 
    alignItems: "center",
    backgroundColor: COLORS.white
  },
  tabActive: { backgroundColor: COLORS.dark, borderColor: COLORS.dark },
  tabText: { fontSize: 11, fontWeight: "700", color: COLORS.silver, letterSpacing: 1 },
  tabTextActive: { color: COLORS.white },
  inputContainer: { marginBottom: 18 },
  fieldTitle: { fontSize: 9, fontWeight: "700", color: COLORS.silver, marginBottom: 8, letterSpacing: 1 },
  inputBox: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: "#FAFAFA"
  },
  input: { flex: 1, fontSize: 14, color: COLORS.dark, fontWeight: "500" },
  switchRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  switchLabel: { fontSize: 14, color: COLORS.dark, fontWeight: "500" },
  fileBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 18, 
    borderRadius: 6,
    borderWidth: 1, 
    borderColor: COLORS.accent, 
    borderStyle: "dashed", 
    gap: 12,
    backgroundColor: "#F0F9F6"
  },
  fileBtnText: { color: COLORS.accent, fontWeight: "800", fontSize: 11, letterSpacing: 1 },
  previewContainer: { marginTop: 15, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  previewImage: { width: "100%", height: 250 },
  previewBadge: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
    backgroundColor: COLORS.dark, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 4 
  },
  badgeText: { color: 'white', fontSize: 8, fontWeight: 'bold', letterSpacing: 1 },
  statusBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 14, 
    borderRadius: 6, 
    marginBottom: 20, 
    gap: 8 
  },
  bgError: { backgroundColor: COLORS.error },
  bgSuccess: { backgroundColor: COLORS.success },
  statusText: { color: "white", textAlign: "center", fontWeight: "800", fontSize: 10, letterSpacing: 1 },
  boton: { 
    backgroundColor: COLORS.accent, 
    padding: 20, 
    alignItems: "center", 
    borderRadius: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  botonText: { color: "white", fontWeight: "800", letterSpacing: 3, fontSize: 12 }
});