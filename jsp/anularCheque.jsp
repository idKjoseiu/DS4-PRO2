<%@ page contentType="text/plain; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.sql.*" %>

<%
    // Configuración de la conexión a la base de datos
    String url = "jdbc:mysql://localhost:3306/contable"; 
    String usuario = "root"; 
    String contrasena = ""; 
    

    // Obtener los parámetros del request
    String numeroChequeStr = request.getParameter("numeroCheque");
    String fechaAnulacion = request.getParameter("fechaAnulacion");
    String motivoAnulacion = request.getParameter("motivoAnulacion");
    String montoAnularStr = request.getParameter("montoAnular");

    Connection con = null;
    PreparedStatement ps = null; 
    PreparedStatement psInsert = null;
    PreparedStatement psDelete = null;
    ResultSet rs = null;

    try {
        // Validaciones básicas
        if (numeroChequeStr == null || numeroChequeStr.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Error: El número de cheque es obligatorio.");
            return;
        }
        if (fechaAnulacion == null || fechaAnulacion.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Error: La fecha de anulación es obligatoria.");
            return;
        }

        // Cargar el driver y establecer la conexión
        Class.forName("com.mysql.cj.jdbc.Driver");
        con = DriverManager.getConnection(url, usuario, contrasena);

        // Iniciar transacción
        con.setAutoCommit(false);

        // 1. Verificar si el cheque ya fue anulado previamente
        String checkSql = "SELECT NumeroCheque FROM cheques_anulados WHERE NumeroCheque = ?";
        ps = con.prepareStatement(checkSql);
        ps.setString(1, numeroChequeStr);
        rs = ps.executeQuery();
        if (rs.next()) {
            con.rollback(); 
            response.setStatus(HttpServletResponse.SC_CONFLICT); // 409 Conflict
            out.print("El cheque N° " + numeroChequeStr + " ya fue anulado previamente.");
            return;
        }
        rs.close();
        ps.close();

        // 2. Obtener los datos que faltan del original
        String selectSql = "SELECT FechaEmision, Proveedor, ObjetoDeGasto, Detalles FROM cheques WHERE NumeroCheque = ?";
        ps = con.prepareStatement(selectSql);
        ps.setString(1, numeroChequeStr);
        rs = ps.executeQuery();

        Date fechaEmision;
        String proveedor;
        String objetoDeGasto = "";
        String detalle = "";

        if (rs.next()) {
            fechaEmision = rs.getDate("FechaEmision");
            proveedor = rs.getString("Proveedor");
            objetoDeGasto = rs.getString("ObjetoDeGasto");
            detalle = rs.getString("Detalles");
        } else {
            con.rollback();
            response.setStatus(HttpServletResponse.SC_NOT_FOUND); // 404 Not Found
            out.print("No se encontró el cheque original con el número " + numeroChequeStr);
            return;
        }
        rs.close();
        ps.close();

        // 3. Insertar en la tabla de cheques_anulados
        String insertSql = "INSERT INTO cheques_anulados (NumeroCheque, FechaEmision, Proveedor, ObjetoDeGasto, Detalle, Monto, FechaAnulacion, MotivoAnulacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        psInsert = con.prepareStatement(insertSql);
        psInsert.setDouble(1, Double.parseDouble(numeroChequeStr)); // NumeroCheque
        psInsert.setDate(2, fechaEmision); // FechaEmision (de la BD)
        psInsert.setString(3, proveedor);
        psInsert.setString(4, objetoDeGasto);
        psInsert.setString(5, detalle); // El detalle original del cheque
        psInsert.setDouble(6, Double.parseDouble(montoAnularStr));
        psInsert.setString(7, fechaAnulacion);
        psInsert.setString(8, motivoAnulacion); // El motivo de la anulación
        int filasInsert = psInsert.executeUpdate();
        psInsert.close();

        if (filasInsert > 0) {
            
            con.commit(); // <-- Confirmar transacción
            out.print("OK"); // <-- Enviar respuesta exitosa al cliente

        } else {
            con.rollback();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("No se encontró el cheque N° " + numeroChequeStr + " para actualizar.");
        }

    } catch (Exception e) {
        if (con != null) try { con.rollback(); } catch (SQLException ex) { }
        if (response.getStatus() == 200) { 
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        // Imprimir el mensaje de error solo si no se ha enviado ya una respuesta específica
        if (out.isAutoFlush()) { // Comprueba si ya se ha escrito algo en el buffer
             out.print(e.getMessage());
        }
    } finally {
        // Cerrar recursos
        if (rs != null) try { rs.close(); } catch (SQLException e) {}
        if (ps != null) try { ps.close(); } catch (SQLException e) {}
        if (psInsert != null) try { psInsert.close(); } catch (SQLException e) {}
        if (con != null) try { con.close(); } catch (SQLException e) {}
    }
%>