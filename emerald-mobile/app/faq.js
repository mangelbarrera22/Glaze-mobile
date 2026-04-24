import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, 
  ScrollView, SafeAreaView, StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

const COLORS = {
  dark: "#0a3d2e",    
  accent: "#1f6f54",  
  silver: "#94a3b8",  
  bg: "#fcfdfd",      
  border: "#f1f5f9",  
  white: "#ffffff",
  text: "#334155"
};

export default function FAQ() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(null);

  useEffect(() => {
    const verificarSesion = async () => {
      const usuario = await AsyncStorage.getItem("usuario");
      if (!usuario) router.replace("/login");
    };
    verificarSesion();
  }, []);

  const categorias = [
    {
      titulo: "ADQUISICIÓN Y PAGOS",
      preguntas: [
        {
          id: 1,
          pregunta: "¿Cuáles son los métodos de pago aceptados?",
          respuesta: "Aceptamos transferencias bancarias de alta prioridad, tarjetas de crédito premium y pagos liquidados a través de nuestra pasarela de seguridad encriptada para garantizar la protección de su capital."
        },
        {
          id: 2,
          pregunta: "¿Es posible reservar una pieza?",
          respuesta: "Dada la exclusividad de nuestras gemas, las reservas están limitadas a un periodo de 24 horas bajo solicitud formal dirigida a un asesor de cuenta."
        }
      ]
    },
    {
      titulo: "AUTENTICIDAD Y ORIGEN",
      preguntas: [
        {
          id: 3,
          pregunta: "¿De dónde provienen las esmeraldas Glaze?",
          respuesta: "Nuestra colección proviene principalmente de las minas de Muzo, Chivor y Coscuez, reconocidas mundialmente por producir las esmeraldas de mayor pureza y color 'Gota de Aceite'."
        },
        {
          id: 4,
          pregunta: "¿Qué laboratorios certifican sus gemas?",
          respuesta: "Trabajamos exclusivamente con laboratorios de prestigio internacional como el GIA (Gemological Institute of America), CDTEC y GRS, entregando el certificado físico original con cada compra."
        }
      ]
    },
    {
      titulo: "LOGÍSTICA Y ENVÍOS",
      preguntas: [
        {
          id: 5,
          pregunta: "¿Cómo se gestiona el envío de una gema?",
          respuesta: "Utilizamos servicios de transporte de valores blindados y asegurados al 100% del valor de la pieza. El empaque es discreto y cuenta con sellos de inviolabilidad termodinámicos."
        },
        {
          id: 6,
          pregunta: "¿Realizan envíos internacionales?",
          respuesta: "Sí, coordinamos entregas globales gestionando todos los trámites aduaneros y de exportación de piedras preciosas para que su pieza llegue sin contratiempos a su destino."
        }
      ]
    },
    {
      titulo: "SERVICIOS POSVENTA",
      preguntas: [
        {
          id: 7,
          pregunta: "¿Ofrecen servicios de montura o joyería?",
          respuesta: "Contamos con una red de maestros joyeros artesanos que pueden diseñar una montura a medida en oro de 18k o platino para la gema adquirida."
        },
        {
          id: 8,
          pregunta: "¿Cuál es la política de devoluciones?",
          respuesta: "Al tratarse de bienes de inversión únicos, las devoluciones se evalúan bajo estrictos protocolos de peritaje gemológico en un plazo máximo de 48 horas tras la recepción."
        }
      ]
    }
  ];

  const toggle = (id) => {
    setAbierto(abierto === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>CENTRO DE CONSULTAS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.headerSection}>
          <Text style={styles.brandTitle}>Preguntas</Text>
          <View style={styles.accentLine} />
          <Text style={styles.brandSubtitle}>ATENCIÓN Y SOPORTE PARA EL SOCIO GLAZE</Text>
        </View>

        {categorias.map((cat, catIdx) => (
          <View key={catIdx} style={styles.categoryBox}>
            <Text style={styles.categoryTitle}>{cat.titulo}</Text>
            
            {cat.preguntas.map((item) => (
              <View key={item.id} style={styles.accordionItem}>
                <TouchableOpacity
                  style={styles.questionRow}
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.6}
                >
                  <Text style={[
                    styles.pregunta, 
                    abierto === item.id && { color: COLORS.accent }
                  ]}>
                    {item.pregunta}
                  </Text>
                  <Feather 
                    name={abierto === item.id ? "minus" : "plus"} 
                    size={14} 
                    color={COLORS.silver} 
                  />
                </TouchableOpacity>

                {abierto === item.id && (
                  <View style={styles.answerContent}>
                    <Text style={styles.respuesta}>{item.respuesta}</Text>
                  </View>
                )}
                <View style={styles.divider} />
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footerContact}>
          <Text style={styles.footerText}>¿Requiere atención personalizada?</Text>
          <TouchableOpacity 
            style={styles.contactBtn}
            onPress={() => router.push("/soporte")}
          >
            <Text style={styles.contactBtnText}>CONTACTAR UN ASESOR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: COLORS.bg },
  container: { paddingHorizontal: 25 },
  navHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20 
  },
  navTitle: { 
    fontSize: 9, 
    letterSpacing: 2, 
    fontWeight: '800', 
    color: COLORS.dark 
  },
  headerSection: { marginBottom: 30, marginTop: 10 },
  brandTitle: { fontSize: 36, fontWeight: '300', color: COLORS.dark },
  accentLine: { 
    width: 35, 
    height: 2, 
    backgroundColor: COLORS.accent, 
    marginVertical: 12 
  },
  brandSubtitle: { 
    fontSize: 8, 
    color: COLORS.silver, 
    letterSpacing: 1, 
    fontWeight: '700' 
  },
  categoryBox: { marginBottom: 25 },
  categoryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.silver,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 10
  },
  accordionItem: { marginBottom: 2 },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  pregunta: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 0.9,
    lineHeight: 18
  },
  answerContent: { paddingBottom: 15 },
  respuesta: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 21,
    fontWeight: '400'
  },
  divider: { height: 1, backgroundColor: COLORS.border },
  footerContact: {
    marginTop: 30,
    padding: 25,
    backgroundColor: COLORS.white,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: COLORS.dark,
    marginBottom: 15,
    fontWeight: '500'
  },
  contactBtn: {
    backgroundColor: COLORS.dark,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 2
  },
  contactBtnText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  }
});