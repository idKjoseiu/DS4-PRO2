<%@ page import="java.sql.*" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.HashMap" %>
<%@ page contentType="application/json; charset=UTF-8" %>
<%
    // 1. OBTENER PARÁMETROS
    String mes = request.getParameter("mes");
    String anio = request.getParameter("anio");

    // Validaciones básicas
    if (mes == null || anio == null || mes.isEmpty() || anio.isEmpty()) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        out.print("{\"error\":\"Mes y año son requeridos.\"}");
        return;
    }

    Connection conn = null;
    PreparedStatement pstmt = null;
    ResultSet rs = null;

    // Mapa para almacenar los resultados
    Map<String, Double> resultados = new HashMap<>();
    
    // Valores por defecto
    resultados.put("saldoLibro", 0.0); // Este valor usualmente viene del saldo final del mes anterior.
    resultados.put("deposito", 0.0);
    resultados.put("chequesAnulados", 0.0);
    resultados.put("chequesGirados", 0.0);
    resultados.put("depositoTransito", 0.0);
    resultados.put("chequesCirculacion", 0.0);

    try {
        // 2. CONECTAR A LA BASE DE DATOS
        Class.forName("com.mysql.cj.jdbc.Driver");
        String url = "jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        conn = DriverManager.getConnection(url, usuario, contrasena);

        // 3. EJECUTAR 

        // --- Consulta para Saldo Libro del mes anterior ---
        // Se necesita calcular el mes y año anterior al seleccionado.
        int mesActual = Integer.parseInt(mes);
        int anioActual = Integer.parseInt(anio);

        int mesAnterior;
        int anioAnterior;

        if (mesActual == 1) { // Si el mes es Enero
            mesAnterior = 12; // El mes anterior es Diciembre
            anioAnterior = anioActual - 1; // del año anterior
        } else {
            mesAnterior = mesActual - 1;
            anioAnterior = anioActual;
        }
        //saldo en libro del mes anterior
        String sqlSaldoLibro = "SELECT (SaldoLibro) FROM conciliacion WHERE MONTH(FechaConciliacion) = ? AND YEAR(FechaConciliacion) = ?";
        pstmt = conn.prepareStatement(sqlSaldoLibro);
        pstmt.setInt(1, mesAnterior);
        pstmt.setInt(2, anioAnterior);
        rs = pstmt.executeQuery();
        if (rs.next()) {
            resultados.put("saldoLibro", rs.getDouble(1));
        }
        rs.close();
        pstmt.close();



        // --- Consulta para Depósitos del mes ---
        // Suma todos los depósitos realizados en el mes y año seleccionados.
        String sqlDepositos = "SELECT COALESCE(SUM(Monto), 0) FROM depositos WHERE MONTH(FechaDeposito) = ? AND YEAR(FechaDeposito) = ?";
        pstmt = conn.prepareStatement(sqlDepositos);
        pstmt.setString(1, mes);
        pstmt.setString(2, anio);
        rs = pstmt.executeQuery();
        if (rs.next()) {
            resultados.put("deposito", rs.getDouble(1));
        }
        rs.close();
        pstmt.close();

        // --- Consulta para Cheques Anulados en el mes ---
        // Suma los montos de cheques que fueron anulados dentro del mes y año seleccionados.
        String sqlAnulados = "SELECT COALESCE(SUM(Monto), 0) FROM cheques_anulados WHERE MONTH(FechaAnulacion) = ? AND YEAR(FechaAnulacion) = ?";
        pstmt = conn.prepareStatement(sqlAnulados);
        pstmt.setString(1, mes);
        pstmt.setString(2, anio);
        rs = pstmt.executeQuery();
        if (rs.next()) {
            resultados.put("chequesAnulados", rs.getDouble(1));
        }
        rs.close();
        pstmt.close();

        // --- Consulta para Cheques Girados (emitidos) en el mes ---
        // Suma todos los cheques emitidos en el mes y año.
        String sqlGirados = "SELECT COALESCE(SUM(monto), 0) FROM cheques WHERE MONTH(FechaEmision) = ? AND YEAR(FechaEmision) = ?";
        pstmt = conn.prepareStatement(sqlGirados);
        pstmt.setString(1, mes);
        pstmt.setString(2, anio);
        rs = pstmt.executeQuery();
        if (rs.next()) {
            resultados.put("chequesGirados", rs.getDouble(1));
        }
        rs.close();
        pstmt.close();

        /*depositos en trnasito----------
        String sqlDepositoTransito = "SELECT COALESCE(SUM(Monto), 0) FROM depositos";
        pstmt = conn.prepareStatement(sqlDepositoTransito);
        rs = pstmt.executeQuery();
        if (rs.next()) {
            resultados.put("depositoTransito", rs.getDouble(1));
        }
        rs.close();
        pstmt.close();*/
        resultados.put("depositoTransito", 0.0);


        // --- Consulta para Cheques en Circulación ---
        // Suma el monto de todos los cheques en la tabla 'cheques'.
        String sqlCirculacion = "SELECT COALESCE(SUM(monto), 0) FROM cheques";
        pstmt = conn.prepareStatement(sqlCirculacion);
        rs = pstmt.executeQuery();
        if (rs.next()) {
            resultados.put("chequesCirculacion", rs.getDouble(1));
        }
        

    } catch (Exception e) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        out.print("{\"error\":\"Error en la base de datos: " + e.getMessage().replace("\"", "'") + "\"}");
        return;
    } finally {
        if (rs != null) try { rs.close(); } catch (SQLException e) {}
        if (pstmt != null) try { pstmt.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }

    // 4 y 5. CONSTRUIR JSON MANUALMENTE Y ENVIAR
    StringBuilder jsonBuilder = new StringBuilder();
    jsonBuilder.append("{");

    boolean primero = true;
    for (Map.Entry<String, Double> entry : resultados.entrySet()) {
        if (!primero) {
            jsonBuilder.append(",");
        }
        jsonBuilder.append("\"").append(entry.getKey()).append("\":");
        jsonBuilder.append(entry.getValue());
        primero = false;
    }

    jsonBuilder.append("}");

    out.print(jsonBuilder.toString());
%>