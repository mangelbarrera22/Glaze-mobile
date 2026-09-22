import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, SafeAreaView, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator, Image, Switch
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import API_BASE_URL from "../../config/api";

const COLORS = {
  dark: "#0a3d2e",      
  accent: "#1f6f54",    
  silver: "#94a3b8",    
  bg: "#F8F9FA",        
  border: "#E2E8F0",    
  white: "#ffffff",
  gold: "#b8a355",      
};

export default function EditarProducto() {
  const router = useRouter();
  const { id_producto } = useLocalSearchParams();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  const [imagenNueva, setImagenNueva] = useState(null);
  const [certificadoNuevo, setCertificadoNuevo] = useState(null);

  const [form, setForm] = useState({
    tipo_producto: "", 
    color: "",
    peso: "",
    tratamiento: "",
    valor: "",
    stock: "",
    imagen: null,       // Aquí guardaremos la URL actual de Cloudinary
    certificado: null,  // Aquí guardaremos la URL actual del certificado
    tiene_esmeralda: false,
    oro: false,
    oro_rosado: false,
    plata: false,
  });

  useEffect(() => {
    cargarProducto();
  }, []);

  const cargarProducto = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/productos/${id_producto}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const p = res.data;
      setForm({
        tipo_producto: p.tipo_producto,
        color: p.color || "",
        peso: p.peso?.toString() || "",
        tratamiento: p.tratamiento || "",
        valor: p.valor?.toString() || "",
        stock: p.stock?.toString() || "",
        imagen: p.imagen || null,
        certificado: p.certificado || null,
        tiene_esmeralda: !!p.tiene_esmeralda,
        oro: !!p.oro,
        oro_rosado: !!p.oro_rosado,
        plata: !!p.plata,
      });
    } catch (err) {
      console.error("Error cargando producto:", err);
      Alert.alert("Error", "No se pudo cargar el activo.");
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const pickFile = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      if (type === 'imagen') setImagenNueva(result.assets[0]);
      else setCertificadoNuevo(result.assets[0]);
    }
  };

  // ☁️ Función inteligente para subir directo a Cloudinary (Web y Móvil)
  const subirArchivoCloudinary = async (fileInput) => {
    const data = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(fileInput);
      const blob = await response.blob();
      data.append("file", blob, "upload.jpg");
    } else {
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

  const guardarCambios = async () => {
    try {
      setGuardando(true);
      const token = await AsyncStorage.getItem("token");

      let imagenUrl = form.imagen; // Mantiene la url actual por defecto
      let certificadoUrl = form.certificado; // Mantiene el certificado actual por defecto

      // 1. Si el usuario seleccionó una NUEVA imagen, súbela a Cloudinary primero
      if (imagenNueva) {
        console.log("☁️ Subiendo nueva imagen a Cloudinary...");
        imagenUrl = await subirArchivoCloudinary(imagenNueva.uri);
      }

      // 2. Si el usuario seleccionó un NUEVO certificado, súbelo a Cloudinary
      if (certificadoNuevo) {
        console.log("📄 Subiendo nuevo certificado a Cloudinary...");
        certificadoUrl = await subirArchivoCloudinary(certificadoNuevo.uri);
      }

      // 3. Crear el JSON limpio con las URLs y datos actualizados
      const payload = {
        color: form.color,
        peso: form.peso,
        tratamiento: form.tratamiento,
        valor: form.valor,
        stock: form.stock,
        imagen: imagenUrl,
        certificado: certificadoUrl,
      };

      if (form.tipo_producto === "joya") {
        payload.tiene_esmeralda = form.tiene_esmeralda ? "1" : "0";
        payload.oro = form.oro ? "1" : "0";
        payload.oro_rosado = form.oro_rosado ? "1" : "0";
        payload.plata = form.plata ? "1" : "0";
      }

      console.log(`🚀 Actualizando producto ID ${id_producto} con JSON limpio...`);

      // 4. Enviar petición PUT con JSON a tu backend
      await axios.put(`${API_BASE_URL}/api/productos/${id_producto}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Alert.alert("Glaze Luxury", "Activo sincronizado con éxito.", [
        { text: "FINALIZAR", onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error("Error al actualizar:", err.response?.data || err.message);
      Alert.alert("Error", "Fallo en la sincronización.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.accent} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={26} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>EDITAR {form.tipo_producto?.toUpperCase()}</Text>
            <Text style={styles.headerTag}>CERTIFIED ASSET • GLAZE LUXURY</Text>
          </View>
          <Image
            source={require("../../assets/images/LOGOS/Isotipo/Glaze-blanco.png")}
            style={styles.logoHeader}
            resizeMode="contain"
          />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>DATOS TÉCNICOS</Text>
            {[
              { name: "color", label: "COLOR", icon: "droplet" },
              { name: "peso", label: "PESO / QUILATES", icon: "box", numeric: true },
              { name: "tratamiento", label: "TRATAMIENTO", icon: "activity" },
              { name: "valor", label: "VALOR (USD)", icon: "dollar-sign", numeric: true },
              { name: "stock", label: "STOCK", icon: "layers", numeric: true },
            ].map(({ name, label, icon, numeric }) => (
              <View style={styles.inputGroup} key={name}>
                <Text style={styles.fieldTitle}>{label}</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    keyboardType={numeric ? "numeric" : "default"}
                    onChangeText={(text) => handleChange(name, text)}
                    value={form[name]}
                  />
                  <Feather name={icon} size={14} color={COLORS.accent} />
                </View>
              </View>
            ))}
          </View>

          {/* FOTOGRAFÍA PRINCIPAL */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>REGISTRO FOTOGRÁFICO</Text>
            <Image
              source={
                imagenNueva 
                  ? { uri: imagenNueva.uri } 
                  : form.imagen 
                    ? { uri: form.imagen } 
                    : require("../../assets/images/esmeralda.png")
              }
              style={styles.preview}
            />
            <TouchableOpacity style={styles.fileButton} onPress={() => pickFile('imagen')}>
              <Feather name="camera" size={18} color={COLORS.accent} />
              <Text style={styles.fileButtonText}>CAMBIAR FOTO</Text>
            </TouchableOpacity>
          </View>

          {/* CERTIFICADO DE LABORATORIO */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>CERTIFICACIÓN DE AUTENTICIDAD</Text>
            <View style={[styles.preview, { height: 120, justifyContent: 'center', backgroundColor: '#f0f0f0' }]}>
                { (certificadoNuevo || form.certificado) ? (
                    <Image
                        source={
                          certificadoNuevo 
                            ? { uri: certificadoNuevo.uri } 
                            : { uri: form.certificado }
                        }
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                    />
                ) : (
                    <Feather name="file-text" size={30} color={COLORS.silver} style={{ alignSelf: 'center' }} />
                )}
            </View>
            <TouchableOpacity style={styles.fileButton} onPress={() => pickFile('certificado')}>
              <Feather name="shield" size={18} color={COLORS.accent} />
              <Text style={styles.fileButtonText}>ACTUALIZAR CERTIFICADO</Text>
            </TouchableOpacity>
          </View>

          {/* COMPOSICIÓN (JOYAS) */}
          {form.tipo_producto === "joya" && (
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>COMPOSICIÓN</Text>
              {[{ name: "tiene_esmeralda", label: "Gema Preciosa" }, { name: "oro", label: "Oro 18k" }, { name: "oro_rosado", label: "Oro Rosado" }, { name: "plata", label: "Plata 950" }].map(({ name, label }) => (
                <View style={styles.checkRow} key={name}>
                  <Text style={styles.checkLabel}>{label}</Text>
                  <Switch value={form[name]} onValueChange={(val) => handleChange(name, val)} trackColor={{ true: COLORS.accent }} />
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={[styles.boton, guardando && { opacity: 0.6 }]} onPress={guardarCambios} disabled={guardando}>
            {guardando ? <ActivityIndicator color="white" /> : <Text style={styles.botonText}>GUARDAR CAMBIOS</Text>}
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: COLORS.dark, padding: 25, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: COLORS.gold },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600", letterSpacing: 1 },
  headerTag: { color: COLORS.gold, fontSize: 9, letterSpacing: 1 },
  logoHeader: { width: 80, height: 40 },
  scrollContent: { padding: 20 },
  card: { backgroundColor: "white", padding: 20, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  sectionLabel: { fontSize: 10, color: COLORS.accent, fontWeight: "800", marginBottom: 15, letterSpacing: 1 },
  inputGroup: { marginBottom: 15 },
  fieldTitle: { fontSize: 9, color: COLORS.silver, fontWeight: "700", marginBottom: 5 },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 5 },
  input: { flex: 1, fontSize: 14, color: COLORS.dark },
  preview: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  fileButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 6, borderWidth: 1, borderColor: COLORS.accent, borderStyle: 'dashed' },
  fileButtonText: { color: COLORS.accent, fontSize: 11, fontWeight: "700", marginLeft: 8 },
  checkRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  checkLabel: { fontSize: 13, color: COLORS.dark },
  boton: { backgroundColor: COLORS.accent, padding: 18, borderRadius: 10, alignItems: "center" },
  botonText: { color: "white", fontWeight: "800", letterSpacing: 1 },
});