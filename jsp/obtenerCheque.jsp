<%@ page import="java.sql.*" %>
<%@ page contentType="application/json; charset=UTF-8" %>
<%
    // 1. Obtener el número de cheque enviado desde el formulario
    String numeroCheque = request.getParameter("numeroCheque");

    // Crear un StringBuilder para construir el JSON
    StringBuilder jsonResponse = new StringBuilder();
    
    Connection conn = null;
    PreparedStatement ps = null;
    ResultSet rs = null;

    // Validar que se recibió el número de cheque
    if (numeroCheque == null || numeroCheque.trim().isEmpty()) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // 400 Bad Request
        jsonResponse.append("{\"encontrado\":false, \"mensaje\":\"Mostrar los cheques mas recientes.\"}");

        out.print(jsonResponse.toString());
        return;
    }

    try {
        // 2. Cargar driver y establecer conexión
        Class.forName("com.mysql.cj.jdbc.Driver");
        String url = "jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        conn = DriverManager.getConnection(url, usuario, contrasena);

        // 3. Usar PreparedStatement para seguridad
        // Se une con la tabla de proveedores para obtener el nombre.
        String sql = "SELECT c.NumeroCheque, c.FechaEmision, p.nombre AS NombreProveedor, c.Monto " +
                     "FROM cheques c " +
                     "JOIN proveedores p ON c.Proveedor = p.codigo " +
                     "WHERE c.NumeroCheque = ?";
        ps = conn.prepareStatement(sql);
        ps.setString(1, numeroCheque); // Asignar el valor al '?'

        // 4. Ejecutar la consulta
        rs = ps.executeQuery();

        // 5. Procesar el resultado
        if (rs.next()) {
            // Si se encontró el cheque, construir el JSON con los datos
            String fecha = rs.getString("FechaEmision");
            String proveedor = rs.getString("NombreProveedor");
            double monto = rs.getDouble("Monto");

            //agregamos al json
            jsonResponse.append("{");
            jsonResponse.append("\"encontrado\":true,");
            jsonResponse.append("\"numeroCheque\":\"").append(numeroCheque).append("\",");
            jsonResponse.append("\"fecha\":\"").append(fecha).append("\",");
            jsonResponse.append("\"proveedor\":\"").append(proveedor).append("\",");
            jsonResponse.append("\"monto\":").append(monto);
            jsonResponse.append("}");
        } else {
            // Si no se encontró, indicarlo en el JSON
            jsonResponse.append("{\"encontrado\":false, \"mensaje\":\"Cheque no encontrado.\"}");
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

    // 7. Imprimir el resultado JSON final
    out.print(jsonResponse.toString());
%>