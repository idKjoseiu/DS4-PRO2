<%@ page import="java.sql.*"%>
<%@ page import="java.math.BigDecimal" %>
<% 
    
    Connection con = null;
    PreparedStatement ps = null;
    ResultSet rs = null;

    try{
        // conexion con la base de datos
        String url ="jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        Class.forName("com.mysql.cj.jdbc.Driver");
        con = DriverManager.getConnection(url, usuario, contrasena);

        // --- Generar el siguiente número de cheque en el servidor ---
        int siguienteNumeroCheque = 100; // Valor por defecto si no hay cheques
        String sqlMaxCheque = "SELECT MAX(NumeroCheque) FROM cheques";
        ps = con.prepareStatement(sqlMaxCheque);
        rs = ps.executeQuery();
        if (rs.next()) {
            siguienteNumeroCheque = rs.getInt(1) + 25;
        }
        // Es importante cerrar el PreparedStatement y ResultSet antes de reutilizar la variable 'ps'
        if (rs != null) rs.close();
        if (ps != null) ps.close();

        //Datos del formulario de Cheques.html
        String fechaEmision = request.getParameter("fechaEmision");
        String proveedor = request.getParameter("proveedor");
        String ObjetoGasto = request.getParameter("objetoDeGasto");
        String detalles = request.getParameter("detalles");
        String monto = request.getParameter("monto");
        
        // validar que los campos obligatorios no estén vacíos
        if(fechaEmision == null || fechaEmision.trim().isEmpty() ||
            proveedor == null || proveedor.trim().isEmpty() ||
            ObjetoGasto == null || ObjetoGasto.trim().isEmpty() ||
            detalles == null || detalles.trim().isEmpty() ||
            monto == null || monto.trim().isEmpty()){
            out.print("Todos los campos son obligatorios");
            return;
        }

        //insercion en la base de datos
        String sql = "INSERT INTO cheques (NumeroCheque, FechaEmision, Proveedor, ObjetoDeGasto, Detalles, Monto) VALUES (?, ?, ?, ?, ?, ?)";
        ps = con.prepareStatement(sql);

        ps.setInt(1, siguienteNumeroCheque);
        ps.setString(2, fechaEmision);
        ps.setString(3, proveedor);
        ps.setString(4, ObjetoGasto);
        ps.setString(5, detalles);
        ps.setString(6, monto);

        int filasAfectadas = ps.executeUpdate();

        if(filasAfectadas > 0){
            out.print("OK");
        } else {
            out.print("No se pudo registrar el cheque.");
        }

    } catch (Exception e) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        out.print("Error en el servidor: " + e.getMessage());
        e.printStackTrace();
    } finally {
        //cerrar recursos
        if (rs != null) try { rs.close(); } catch (SQLException e) { e.printStackTrace(); }
        if (ps != null) try { ps.close(); } catch (SQLException e) { e.printStackTrace(); }
        if (con != null) try { con.close(); } catch (SQLException e) { e.printStackTrace(); }
    }
    
%>