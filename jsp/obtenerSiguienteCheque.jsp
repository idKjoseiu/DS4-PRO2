<%@ page import="java.sql.*"%>
<%
    Connection con = null;
    PreparedStatement ps = null;
    ResultSet rs = null;

    try {
        // --- Conexión a la base de datos ---
        String url = "jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        Class.forName("com.mysql.cj.jdbc.Driver");
        con = DriverManager.getConnection(url, usuario, contrasena);

        // --- Generar el siguiente número de cheque ---
        int siguienteNumeroCheque = 100; // Valor por defecto si no hay cheques
        String sqlMaxCheque = "SELECT MAX(NumeroCheque) FROM cheques";
        ps = con.prepareStatement(sqlMaxCheque);
        rs = ps.executeQuery();
        if (rs.next()) {
            siguienteNumeroCheque = rs.getInt(1) + 1; // Se suele sumar 1, no 25, para el siguiente. Ajusta si es necesario.
        }
        out.print(siguienteNumeroCheque);

    } catch (Exception e) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        out.print("Error al obtener número de cheque: " + e.getMessage());
    } finally {
        if (rs != null) try { rs.close(); } catch (SQLException e) { /* Ignored */ }
        if (ps != null) try { ps.close(); } catch (SQLException e) { /* Ignored */ }
        if (con != null) try { con.close(); } catch (SQLException e) { /* Ignored */ }
    }
%>