<%@ page import ="java.sql.*"%>
<%
    String url ="jdbc:mysql://localhost:3306/contable";
    String usuario ="root";
    String contraseña ="";

    Class.forName("com.mysql.cj.jdbc.Driver");
    Connection con = DriverManager.getConnection(url,usuario,contraseña);
%>
