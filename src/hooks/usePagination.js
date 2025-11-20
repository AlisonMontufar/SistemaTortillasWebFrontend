// src/hooks/usePagination.js
import { useState, useMemo } from "react";

export function usePagination(data = [], itemsPerPage = 10, searchTerm = "") {
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrado por searchTerm - CORREGIDO para buscar en múltiples campos
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    const searchLower = searchTerm.toLowerCase();
    return data.filter((item) => {
      // Buscar en nombreSucursal, correoElectronico y nombreEncargado
      return (
        (item.nombreSucursal && item.nombreSucursal.toLowerCase().includes(searchLower)) ||
        (item.correoElectronico && item.correoElectronico.toLowerCase().includes(searchLower)) ||
        (item.nombreEncargado && item.nombreEncargado.toLowerCase().includes(searchLower)) ||
        (item.id && item.id.toString().includes(searchTerm)) // También buscar por ID
      );
    });
  }, [data, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  // Si el searchTerm o los datos cambian, resetear a página 1 para evitar "página vacía"
  useMemo(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, data.length]);

  return {
    currentPage,
    totalPages,
    paginatedData,
    handlePageChange,
    setCurrentPage,
  };
}