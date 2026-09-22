/**
 * ==========================================================
 * Archivo: api.js
 * Proyecto: Emerald Trade / Glaze
 * Módulo: Configuración de API
 *
 * Descripción:
 * Configuración centralizada del cliente HTTP utilizado
 * para realizar peticiones hacia el backend.
 *
 * Función:
 * - Crear una instancia personalizada de Axios.
 * - Definir la URL base de la API.
 * - Establecer configuración general de solicitudes.
 *
 * ==========================================================
 */


// ======================================================
// IMPORTACIONES
// ======================================================

// Cliente HTTP para comunicación con backend
import axios from "axios";


// URL base del servidor
import API_BASE_URL from "../../config/api";




// ======================================================
// CONFIGURACIÓN DEL CLIENTE AXIOS
// ======================================================

/**
 * Instancia principal de Axios.
 *
 * Base URL:
 * Se construye utilizando la configuración global
 * del proyecto y agregando el prefijo de API.
 *
 * Timeout:
 * Tiempo máximo de espera para una petición.
 */
const api = axios.create({

  baseURL: `${API_BASE_URL}/api`,

  timeout: 10000,

});




// ======================================================
// EXPORTACIÓN
// ======================================================

/**
 * Exporta la instancia configurada para ser utilizada
 * en los diferentes servicios y componentes.
 */
export default api;