<%@ page import ="java.sql.*"%>
<%

    Connection conn = null;
    PreparedStatement ps = null;
    ResultSet rs = null;

    try{
        // conexion con la base de datos
        String url ="jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, usuario, contrasena);

        //Datos del formularion deposito
        String tipoDepo = request.getParameter("tipoDeposito");
        String fechaDepo = request.getParameter("fechaDeposito");
        String montoDepo = request.getParameter("montoDeposito");
        
        // validar que los campos obligatorios no estén vacíos
        if(tipoDepo == null || tipoDepo.trim().isEmpty() ||
            fechaDepo == null || fechaDepo.trim().isEmpty() ||
            montoDepo == null || montoDepo.trim().isEmpty()){
            out.print("Todos los campos son obligatorios");
            return;
        }

        //insercion en la base de datos
        String sql = "INSERT INTO depositos (TipoDeposito, FechaDeposito, Monto) VALUES (?, ?, ?)";
        ps = conn.prepareStatement(sql);

        ps.setString(1, tipoDepo);
        ps.setString(2, fechaDepo);
        ps.setString(3, montoDepo);

        int filasAfectadas = ps.executeUpdate();

        if(filasAfectadas > 0){
            out.print("OK");
        } else {
            out.print("No se pudo registrar el deposito.");
        }

    } catch (Exception e) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        out.print("Error en el servidor: " + e.getMessage());
        e.printStackTrace();
    } finally {
        //cerrar recursos
        if (rs != null) try { rs.close(); } catch (SQLException e) { e.printStackTrace(); }
        if (ps != null) try { ps.close(); } catch (SQLException e) { e.printStackTrace(); }
        if (conn != null) try { conn.close(); } catch (SQLException e) { e.printStackTrace(); }
    }
%>