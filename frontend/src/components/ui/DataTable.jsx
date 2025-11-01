import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Box,
    Typography,
  } from '@mui/material';
  import { useState } from 'react';
  
  export default function DataTable({
    columns = [],
    rows = [],
    onRowClick = null,
    rowsPerPageOptions = [5, 10, 25],
    initialRowsPerPage = 10,
  }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  
    const paginatedRows = rows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  
    if (rows.length === 0) {
      return (
        <Paper sx={{ padding: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">
            No hay datos disponibles
          </Typography>
        </Paper>
      );
    }
  
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    fontWeight: 600,
                    color: '#333333',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow
                key={index}
                onClick={() => onRowClick?.(row)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': {
                    backgroundColor: '#F0F7F0',
                  },
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {column.render
                      ? column.render(row[column.id], row)
                      : row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    );
  }