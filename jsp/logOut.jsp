<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    session.invalidate(); // Destruye la sesión
    response.setStatus(200); // Devuelve OK
%>
