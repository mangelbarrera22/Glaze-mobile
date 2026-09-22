import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import API_BASE_URL from "../config/api";
import { Feather } from "@expo/vector-icons";

export default function PagoResultado() {
  const router = useRouter();
  const { estado, monto, referencia, producto, imagen } = useLocalSearchParams();

  const aprobado = estado === "APROBADO";

  return (
    <View style={styles.container}>

      {/* ICONO */}
      <View style={styles.iconContainer}>
        <Feather 
          name={aprobado ? "check-circle" : "x-circle"} 
          size={70} 
          color={aprobado ? "#16a34a" : "#dc2626"} 
        />
      </View>

      {/* TITULO */}
      <Text style={styles.title}>
        {aprobado ? "PAGO EXITOSO" : "PAGO FALLIDO"}
      </Text>

      {/* IMAGEN PRODUCTO */}
      <Image
        source={{ uri: `${API_BASE_URL}/uploads/${imagen}` }}
        style={styles.image}
      />

      {/* INFO */}
      <Text style={styles.producto}>{producto}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Estado</Text>
        <Text style={[styles.value, aprobado && styles.ok]}>
          {estado}
        </Text>

        <Text style={styles.label}>Monto</Text>
        <Text style={styles.value}>
          ${Number(monto).toLocaleString()} COP
        </Text>

        <Text style={styles.label}>Referencia</Text>
        <Text style={styles.value}>{referencia}</Text>
      </View>

      {/* BOTÓN */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push("/")}
      >
        <Text style={styles.buttonText}>VOLVER AL INICIO</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: "#fff" },

  iconContainer: {
    alignItems: "center",
    marginTop: 40
  },

  title: {
    textAlign: "center",
    fontSize: 18,
    letterSpacing: 3,
    marginTop: 10,
    color: "#0a3d2e"
  },

  image: {
    width: "100%",
    height: 200,
    marginVertical: 20
  },

  producto: {
    fontSize: 20,
    color: "#0a3d2e",
    textAlign: "center"
  },

  card: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#f8fafc"
  },

  label: {
    fontSize: 10,
    color: "#94a3b8"
  },

  value: {
    fontSize: 16,
    marginBottom: 10
  },

  ok: {
    color: "#16a34a"
  },

  button: {
    marginTop: 30,
    backgroundColor: "#1f6f54",
    padding: 15,
    alignItems: "center"
  },

  buttonText: {
    color: "white",
    letterSpacing: 1
  }
});