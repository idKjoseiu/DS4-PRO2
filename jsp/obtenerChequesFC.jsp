<%@ page import="java.sql.*" %>
<%@ page contentType="application/json; charset=UTF-8" %>
<%
    // Crear un StringBuilder para construir el JSON
    StringBuilder jsonResponse = new StringBuilder();

    Connection conn = null;
    PreparedStatement ps = null;
    ResultSet rs = null;
    
    // Se va a devolver un arreglo de objetos JSON
    jsonResponse.append("[");

    try {
        // 2. Cargar driver y establecer conexión
        Class.forName("com.mysql.cj.jdbc.Driver");
        String url = "jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        conn = DriverManager.getConnection(url, usuario, contrasena);

        // 3. Consulta para obtener todos los cheques fuera de circulación
        // Se une con la tabla de proveedores para obtener el nombre.
        String sql = "SELECT cfc.NumeroCheque, cfc.FechaFueraCirculacion, p.nombre AS NombreProveedor, cfc.Monto " +
                     "FROM cheques_fueracirculacion cfc " +
                     "JOIN proveedores p ON cfc.Proveedor = p.codigo " +
                     "ORDER BY cfc.FechaFueraCirculacion DESC"; // Ordenamos por fecha
        ps = conn.prepareStatement(sql);

        // 4. Ejecutar la consulta
        rs = ps.executeQuery();

        // 5. Procesar el resultado
        boolean first = true;
        while (rs.next()) {
            if (!first) {
                jsonResponse.append(","); // Añadir coma antes de cada objeto, excepto el primero
            }
            first = false;

            // Construir el objeto JSON para cada cheque
            String numeroCheque = rs.getString("NumeroCheque");
            String fecha = rs.getString("FechaFueraCirculacion");
            String proveedor = rs.getString("NombreProveedor");
            double monto = rs.getDouble("Monto");

            jsonResponse.append("{");
            jsonResponse.append("\"numeroCheque\":\"").append(numeroCheque).append("\",");
            jsonResponse.append("\"fecha\":\"").append(fecha).append("\",");
            jsonResponse.append("\"proveedor\":\"").append(proveedor).append("\",");
            jsonResponse.append("\"monto\":").append(monto);
            jsonResponse.append("}");
        }
        
    } catch (Exception e) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        jsonResponse.setLength(0);
        jsonResponse.append("{\"error\":true, \"mensaje\":\"Error en el servidor: ").append(e.getMessage().replace("\"", "'")).append("\"}");
        e.printStackTrace();
    } finally {
        if (rs != null) try { rs.close(); } catch (SQLException e) {}
        if (ps != null) try { ps.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }

    // Cerrar el arreglo JSON
    jsonResponse.append("]");

    // 7. Imprimir el resultado JSON final
    out.print(jsonResponse.toString());
%>