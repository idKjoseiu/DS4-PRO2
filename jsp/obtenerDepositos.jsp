<%@ page language="java" contentType="application/json; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*, java.util.*" %>
<%
    Connection conn = null;
    PreparedStatement pstmt = null;
    ResultSet rs = null;
    StringBuilder jsonResponse = new StringBuilder();

    try {
        // --- CONEXIÓN A LA BASE DE DATOS ---
        // Reemplaza con tus propios detalles de conexión
        String url = "jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, usuario, contrasena);

        // --- CONSULTA SQL ---
        // Selecciona los depósitos, ordenados por fecha descendente para mostrar los más recientes primero
        String sql = "SELECT TipoDeposito, FechaDeposito, Monto FROM depositos ORDER BY FechaDeposito DESC";
        pstmt = conn.prepareStatement(sql);
        rs = pstmt.executeQuery();

        // --- PROCESAMIENTO DE RESULTADOS ---
        jsonResponse.append("[");
        boolean primerRegistro = true;
        while (rs.next()) {
            if (!primerRegistro) {
                jsonResponse.append(",");
            }
            primerRegistro = false;

            jsonResponse.append("{");
            jsonResponse.append("\"tipo\":\"").append(rs.getString("TipoDeposito")).append("\",");
            jsonResponse.append("\"fecha\":\"").append(rs.getString("FechaDeposito")).append("\",");
            jsonResponse.append("\"monto\":").append(rs.getDouble("Monto"));
            jsonResponse.append("}");
        }
        jsonResponse.append("]");

        // --- ENVIAR RESPUESTA JSON ---
        out.print(jsonResponse.toString());

    } catch (Exception e) {
        // --- MANEJO DE ERRORES ---
        // Enviar un código de error HTTP y un mensaje
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        out.print("Error al conectar o consultar la base de datos: " + e.getMessage());
        e.printStackTrace(); // Imprime el stack trace en la consola del servidor para depuración

    } finally {
        // --- CIERRE DE RECURSOS ---
        try { if (rs != null) rs.close(); } catch (SQLException e) { e.printStackTrace(); }
        try { if (pstmt != null) pstmt.close(); } catch (SQLException e) { e.printStackTrace(); }
        try { if (conn != null) conn.close(); } catch (SQLException e) { e.printStackTrace(); }
    }
%>