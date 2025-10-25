<%@ page import="java.sql.*" %>
<%@ page contentType="application/json; charset=UTF-8" %>
<%
    Connection conn = null;
    PreparedStatement ps = null;
    ResultSet rs = null;
    
    // Usaremos un StringBuilder para construir el string JSON eficientemente.
    StringBuilder jsonProveedores = new StringBuilder();
    jsonProveedores.append("["); // empieza con un corchete

    try {
        //1 Cargar driver
        Class.forName("com.mysql.cj.jdbc.Driver");

        //2  Establecer la conexión
        String url = "jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        conn = DriverManager.getConnection(url, usuario, contrasena);

        // 3. Crear y ejecutar la consulta SQL
        String sql = "SELECT * FROM proveedores ORDER BY Nombre ASC";
        ps = conn.prepareStatement(sql);
        rs = ps.executeQuery();

        boolean esPrimero = true;

        // 4. Procesar los resultados y construir el JSON
        while (rs.next()) {
            if (!esPrimero) {
                jsonProveedores.append(","); // Añadir coma antes de cada objeto, excepto el primero
            }

            // seleccionamos el nombre
            String nombre = rs.getString("nombre").replace("\"", "\\\"");
            String codigo = rs.getString("codigo").replace("\"", "\\\"");
            String RUC = rs.getString("RUC");
            String direccion = rs.getString("direccion");
            

            // lo agregamos el json
            jsonProveedores.append("{");
            jsonProveedores.append("\"nombre\":\"").append(nombre).append("\"");
            jsonProveedores.append(",\"codigo\":\"").append(codigo).append("\"");
            jsonProveedores.append("}");

            esPrimero = false;
        }

    } catch (Exception e) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // Establece el código de estado HTTP 500
        e.printStackTrace(); // Imprime el error en la consola del servidor (Tomcat)
        
        // Limpiamos cualquier JSON parcial y creamos un mensaje de error
        jsonProveedores.setLength(0); 
        jsonProveedores.append("{\"error\":\"Ocurrió un error al consultar los proveedores: ").append(e.getMessage().replace("\"", "'")).append("\"}");

    } finally {
        // 5. Cerrar recursos
        if (rs != null) try { rs.close(); } catch (SQLException e) {}
        if (ps != null) try { ps.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }

    jsonProveedores.append("]"); // El JSON termina con un corchete

    // 6. Imprimir el resultado JSON
    out.print(jsonProveedores.toString());
%>