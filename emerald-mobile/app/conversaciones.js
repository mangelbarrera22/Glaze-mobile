import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import API_BASE_URL from "../config/api";

const COLORS = {
  dark: "#0a3d2e",
  accent: "#1f6f54",
  light: "#94a3b8",
  bg: "#fcfdfd",
  border: "#f1f5f9"
};

export default function Conversaciones() {

  const router = useRouter();

  const [loading,setLoading]=useState(true);
  const [conversaciones,setConversaciones]=useState([]);

  useEffect(() => {
    cargarConversaciones();

    const intervalo = setInterval(() => {
        cargarConversaciones();
    }, 2000);

    return () => clearInterval(intervalo);
}, []);

useFocusEffect(
    useCallback(() => {
        cargarConversaciones();
    }, [])
);

  const cargarConversaciones = async()=>{

      try{

          const token=await AsyncStorage.getItem("token");

          const res=await axios.get(
              `${API_BASE_URL}/api/conversaciones`,
              {
                  headers:{
                      Authorization:`Bearer ${token}`
                  }
              }
          );

          setConversaciones(res.data);

      }catch(error){

          console.log(error.response?.data||error.message);

      }finally{

          setLoading(false);

      }

  };

  const renderItem=({item})=>(

      <TouchableOpacity
      style={styles.card}
      onPress={()=>router.push({
          pathname:"/conversacion",
          params:{
              id_conversacion:item.id_conversacion,
              nombre_contacto:item.nombre_contacto
          }
      })}
      >

          <View style={styles.avatar}>

              <Image
              source={require("../assets/images/LOGOS/Isotipo/Glaze-verde.png")}
              style={styles.avatarLogo}
              />

          </View>

          <View style={styles.info}>

              <View style={styles.row}>

                  <Text
                  numberOfLines={1}
                  style={styles.nombre}
                  >
                      {item.nombre_contacto}
                  </Text>

                  <Text style={styles.fecha}>
                      {item.ultima_fecha
                        ? new Date(item.ultima_fecha).toLocaleDateString()
                        : ""}
                  </Text>

              </View>

              <View style={styles.row}>

    <Text
        numberOfLines={1}
        style={styles.ultimo}
    >
        {item.ultimo_mensaje || "Pulsa para iniciar la conversación"}
    </Text>

    <View style={styles.rightSection}>

        <Feather
            name="message-circle"
            size={18}
            color={COLORS.accent}
        />

        <Feather
            name="chevron-right"
            size={16}
            color="#94a3b8"
            style={{ marginLeft: 12 }}
        />

    </View>

</View>

          </View>

      </TouchableOpacity>

  );

  return(

      <SafeAreaView style={styles.wrapper}>

          <StatusBar barStyle="dark-content"/>

          <View style={styles.header}>

              <View style={{flex:1}}>

                  <Text style={styles.brandTitle}>
                      GLAZE
                  </Text>

                  <Text style={styles.brandSubtitle}>
                      CONVERSACIONES
                  </Text>

              </View>

              <Image
              source={require("../assets/images/LOGOS/Isotipo/Glaze-verde.png")}
              style={styles.logo}
              />

              <TouchableOpacity
              style={styles.backCircle}
              onPress={()=>router.back()}
              >
                  <Feather
                  name="chevron-left"
                  size={24}
                  color={COLORS.dark}
                  />
              </TouchableOpacity>

          </View>

          {

              loading?

              <ActivityIndicator
              size="large"
              color={COLORS.dark}
              style={{marginTop:80}}
              />

              :

              <FlatList

              data={conversaciones}

              keyExtractor={(item)=>item.id_conversacion.toString()}

              renderItem={renderItem}

              contentContainerStyle={styles.list}

              ListEmptyComponent={()=>

                  <View style={styles.empty}>

                      <Feather
                      name="message-circle"
                      size={45}
                      color={COLORS.light}
                      />

                      <Text style={styles.emptyText}>
                          No tienes conversaciones.
                      </Text>

                  </View>

              }

              />

          }

      </SafeAreaView>

  );

}

const styles=StyleSheet.create({

wrapper:{
    flex:1,
    backgroundColor:"#fff"
},

header:{
    paddingHorizontal:25,
    paddingVertical:25,
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:COLORS.bg
},

brandTitle:{
    fontSize:24,
    fontWeight:"300",
    letterSpacing:4,
    color:COLORS.dark
},

brandSubtitle:{
    marginTop:4,
    fontSize:9,
    color:COLORS.light,
    letterSpacing:2,
    fontWeight:"700"
},

logo:{
    width:40,
    height:40,
    opacity:.8,
    marginRight:15
},

backCircle:{
    padding:8,
    borderRadius:100,
    backgroundColor:"#f1f5f9"
},

list:{
    padding:25
},

card:{
    flexDirection:"row",
    alignItems:"center",
    paddingVertical:18,
    borderBottomWidth:1,
    borderBottomColor:COLORS.border
},

avatar:{
    width:58,
    height:58,
    borderRadius:29,
    backgroundColor:"#f7fafc",
    justifyContent:"center",
    alignItems:"center",
    marginRight:15
},

avatarLogo:{
    width:30,
    height:30,
    opacity:.7
},

info:{
    flex:1
},

row:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
},

nombre:{
    flex:1,
    color:COLORS.dark,
    fontSize:15,
    fontWeight:"600"
},

fecha:{
    fontSize:10,
    color:COLORS.light
},

ultimo:{
    flex:1,
    marginTop:6,
    color:"#64748b",
    fontSize:12
},
rightSection:{
    flexDirection:"row",
    alignItems:"center",
    marginLeft:10
},
empty:{
    alignItems:"center",
    marginTop:120
},

emptyText:{
    marginTop:15,
    color:COLORS.light,
    letterSpacing:1
}

});