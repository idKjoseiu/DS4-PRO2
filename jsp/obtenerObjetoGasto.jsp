<%@ page import="java.sql.*" %>
<%@ page contentType="application/json; charset=UTF-8" %>
<%
    Connection conn = null;
    Statement st = null;
    ResultSet rs = null;
    
    // Usaremos un StringBuilder para construir el string JSON 
    StringBuilder jsonObjetoGasto = new StringBuilder();
    jsonObjetoGasto.append("["); //inica con un corchete

    try{
        // 1 .Driver
        Class.forName("com.mysql.cj.jdbc.Driver");

        // 2 Establecer la conexión
        String url = "jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        conn = DriverManager.getConnection(url, usuario, contrasena);

        // 3 Consulta sql y ejecucion
        st = conn.createStatement();
        String sql = "SELECT codigo, detalle, objeto FROM objeto_gasto ORDER BY objeto ASC";
        rs = st.executeQuery(sql);

        boolean esPrimero = true;

        // 4 Procesar los resultados y construir el JSON
        while(rs.next()) {
            if(!esPrimero) {
                jsonObjetoGasto.append(",");//coma antes de cada objeto
            }

            // seleccionamos el codigo, detalle y objeto
            String codigo = rs.getString("codigo");
            String detalle = rs.getString("detalle");
            String objeto = rs.getString("objeto");

            //agregamos el json
            jsonObjetoGasto.append("{");
            jsonObjetoGasto.append("\"codigo\":\"").append(codigo).append("\"");
            jsonObjetoGasto.append(",\"detalle\":\"").append(detalle).append("\"");
            jsonObjetoGasto.append(",\"objeto\":\"").append(objeto).append("\"");
            jsonObjetoGasto.append("}");

            esPrimero = false;
        }


        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // Establece el código de estado HTTP 500
            e.printStackTrace(); // Imprime el error en la consola del servidor (Tomcat)
            
            // Limpiamos cualquier JSON parcial y creamos un mensaje de error
            jsonObjetoGasto.setLength(0); 
            jsonObjetoGasto.append("{\"error\":\"Ocurrió un error al consultar los proveedores: ").append(e.getMessage().replace("\"", "'")).append("\"}");

        } finally {
            if(rs != null) try { rs.close(); } catch (SQLException e) {}
            if(st != null) try { st.close(); } catch (SQLException e) {}
            if(conn != null) try { conn.close(); } catch (SQLException e) {}
        }

        jsonObjetoGasto.append("]"); // El JSON termina con un corchete

        // 6. Imprimir el resultado JSON
        out.print(jsonObjetoGasto.toString());
        

%>