<%@ page import="java.sql.*" %>
<%@ page contentType="application/json; charset=UTF-8" %>
<%
    // 1. Obtener el número de cheque enviado desde el formulario
    String numeroCheque = request.getParameter("numeroCheque");

    // Crear un StringBuilder para construir el JSON
    StringBuilder datosCheques = new StringBuilder();
    
    Connection conn = null;
    PreparedStatement ps = null;
    ResultSet rs = null;

    // Validar que se recibió el número de cheque
    String sql;
    boolean buscarPorNumero = numeroCheque != null && !numeroCheque.isEmpty();

    try {
        // 2. Cargar driver y establecer conexión
        Class.forName("com.mysql.cj.jdbc.Driver");
        String url = "jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        conn = DriverManager.getConnection(url, usuario, contrasena);

        // 3. 
        // Se une con la tabla de proveedores para obtener el nombre.
        if (buscarPorNumero) {
            sql = "SELECT c.NumeroCheque, c.FechaEmision, p.nombre AS NombreProveedor, c.Monto " +
                     "FROM cheques c " +
                     "JOIN proveedores p ON c.Proveedor = p.codigo " +
                     "WHERE c.NumeroCheque = ?";
            ps = conn.prepareStatement(sql);
            ps.setString(1, numeroCheque);
        }else {
            sql = "SELECT c.NumeroCheque, c.FechaEmision, p.nombre AS NombreProveedor, c.Monto " +
                     "FROM cheques c " +
                     "JOIN proveedores p ON c.Proveedor = p.codigo ";
            ps = conn.prepareStatement(sql);
        }
         

        // 4. Ejecutar la consulta
        rs = ps.executeQuery();

        // 5. Procesar el resultado
        if (buscarPorNumero){
            if (rs.next()) {
                // Si se encontró el cheque, construir el JSON con los datos
                String fecha = rs.getString("FechaEmision");
                String proveedor = rs.getString("NombreProveedor");
                double monto = rs.getDouble("Monto");

                //agregamos al json
                datosCheques.append("{");
                datosCheques.append("\"encontrado\":true,");
                datosCheques.append("\"numeroCheque\":\"").append(numeroCheque).append("\",");
                datosCheques.append("\"fecha\":\"").append(fecha).append("\",");
                datosCheques.append("\"proveedor\":\"").append(proveedor).append("\",");
                datosCheques.append("\"monto\":").append(monto);
                datosCheques.append("}");
            } else {
                // Si no se encontró, indicarlo en el JSON
                datosCheques.append("{\"encontrado\":false, \"mensaje\":\"Cheque no encontrado.\"}");
            }
        } else {
            //lista de cheques
            datosCheques.append("{\"encontrado\":true, \"resultados\":[");
            boolean primerRegistro = true;
            while (rs.next()) {
                if (!primerRegistro) {
                    datosCheques.append(",");
                }
                primerRegistro = false;
                datosCheques.append("{");
                datosCheques.append("\"numeroCheque\":\"").append(rs.getString("NumeroCheque")).append("\",");
                datosCheques.append("\"fecha\":\"").append(rs.getString("FechaEmision")).append("\",");
                datosCheques.append("\"proveedor\":\"").append(rs.getString("NombreProveedor")).append("\",");
                datosCheques.append("\"monto\":").append(rs.getDouble("Monto"));
                datosCheques.append("}");
            }
            datosCheques.append("]}");
            if(primerRegistro){
                datosCheques.setLength(0); // Limpiar cualquier contenido previo
                datosCheques.append("{\"encontrado\":false, \"mensaje\":\"No se encontraron cheques emitidos recientes.\"}");
            }
        }
        
    } catch (Exception e) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // Establece el código de estado HTTP 500
        datosCheques.setLength(0); // Limpiar cualquier contenido previo
        datosCheques.append("{\"encontrado\":false, \"mensaje\":\"Error en el servidor: ").append(e.getMessage().replace("\"", "'")).append("\"}");
        e.printStackTrace(); // Imprime el error en la consola del servidor
    } finally {
        // 6. Cerrar todos los recursos en el orden inverso a su apertura
        if (rs != null) try { rs.close(); } catch (SQLException e) {}
        if (ps != null) try { ps.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }

    // 7. Imprimir el resultado JSON final
    out.print(datosCheques.toString());
%>