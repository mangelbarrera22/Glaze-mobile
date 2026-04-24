import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import api from "../../src/services/api";
import { Alert } from "react-native";

export default function Login() {

 const [usuario,setUsuario] = useState("");
 const [password,setPassword] = useState("");

 const login = async () => {

 try{

  const res = await api.post("/login",{
   usuario,
   password
  });

  Alert.alert(
   "Login correcto",
   "Bienvenido a Esmeraldas Premium"
  );

 }catch (error: any) {

 if(error.response){

  Alert.alert(
   "Error",
   error.response.data.mensaje || "Usuario o contraseña incorrectos"
  );

 }else{

  Alert.alert(
   "Error de conexión",
   "No se pudo conectar con el servidor"
  );

 }

}

};

 return(

  <View style={styles.container}>

   <Text style={styles.title}>Esmeraldas Premium</Text>

   <TextInput
    placeholder="Usuario"
    style={styles.input}
    onChangeText={setUsuario}
   />

   <TextInput
    placeholder="Contraseña"
    secureTextEntry
    style={styles.input}
    onChangeText={setPassword}
   />

   <TouchableOpacity style={styles.button} onPress={login}>
    <Text style={styles.buttonText}>INGRESAR</Text>
   </TouchableOpacity>

  </View>

 );

}

const styles = StyleSheet.create({

 container:{
  flex:1,
  justifyContent:"center",
  alignItems:"center",
  padding:20,
  backgroundColor:"#ffffff"
 },

 title:{
  fontSize:24,
  marginBottom:30
 },

 input:{
  width:"100%",
  borderWidth:1,
  padding:12,
  marginBottom:10,
  borderRadius:8
 },

 button:{
  width:"100%",
  backgroundColor:"#1f6f54",
  padding:14,
  borderRadius:8,
  alignItems:"center"
 },

 buttonText:{
  color:"#fff",
  fontWeight:"bold"
 }

});