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

        // 3. Usar PreparedStatement para seguridad
        // Se une la tabla de anulados con cheques y proveedores para obtener TODOS los datos.
        String sql = "SELECT ca.NumeroCheque, ca.FechaAnulacion, p.nombre AS NombreProveedor, ca.Monto " +
                     "FROM cheques_anulados ca " +
                     "JOIN cheques c ON ca.NumeroCheque = c.NumeroCheque " +
                     "JOIN proveedores p ON c.Proveedor = p.codigo " +
                     "ORDER BY ca.FechaAnulacion DESC"; // Ordenamos por fecha de anulación
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

            // Construir el objeto JSON para cada cheque anulado
            String numeroChequeAnulado = rs.getString("NumeroCheque");
            String fecha = rs.getString("FechaAnulacion");
            String proveedor = rs.getString("NombreProveedor");
            double monto = rs.getDouble("MontoAnular");

            jsonResponse.append("{");
            jsonResponse.append("\"numeroCheque\":\"").append(numeroChequeAnulado).append("\",");
            jsonResponse.append("\"fecha\":\"").append(fecha).append("\",");
            jsonResponse.append("\"proveedor\":\"").append(proveedor).append("\",");
            jsonResponse.append("\"monto\":").append(monto);
            jsonResponse.append("}");
        }
        
    } catch (Exception e) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // Establece el código de estado HTTP 500
        jsonResponse.setLength(0); // Limpiar cualquier contenido previo
        jsonResponse.append("{\"encontrado\":false, \"mensaje\":\"Error en el servidor: ").append(e.getMessage().replace("\"", "'")).append("\"}");
        e.printStackTrace(); // Imprime el error en la consola del servidor
    } finally {
        // 6. Cerrar todos los recursos en el orden inverso a su apertura
        if (rs != null) try { rs.close(); } catch (SQLException e) {}
        if (ps != null) try { ps.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }

    // Cerrar el arreglo JSON
    jsonResponse.append("]");

    // 7. Imprimir el resultado JSON final
    out.print(jsonResponse.toString());
%>