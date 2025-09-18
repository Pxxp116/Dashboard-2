import { useState, useCallback, useEffect } from 'react';
import { orderService } from '../services/api/orderService';

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar pedidos
  const cargarPedidos = useCallback(async (fecha = null, estado = null) => {
    setLoading(true);
    setError(null);

    try {
      const data = await orderService.obtenerPedidos(fecha, estado);
      setPedidos(data.pedidos || []);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
      setError('Error al cargar los pedidos');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar estado de un pedido
  const actualizarEstadoPedido = useCallback(async (pedidoId, nuevoEstado) => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await orderService.actualizarEstadoPedido(pedidoId, nuevoEstado);

      if (resultado.exito) {
        // Actualizar el estado local inmediatamente
        setPedidos(prevPedidos =>
          prevPedidos.map(pedido =>
            pedido.id === pedidoId
              ? { ...pedido, estado: nuevoEstado }
              : pedido
          )
        );
        return true;
      } else {
        setError(resultado.mensaje || 'Error al actualizar el estado');
        return false;
      }
    } catch (err) {
      console.error('Error actualizando estado del pedido:', err);
      setError('Error al actualizar el estado del pedido');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un pedido específico
  const obtenerPedido = useCallback(async (idUnicoPedido) => {
    setLoading(true);
    setError(null);

    try {
      const data = await orderService.obtenerPedido(idUnicoPedido);
      return data.pedido;
    } catch (err) {
      console.error('Error obteniendo pedido:', err);
      setError('Error al obtener el pedido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo pedido (para uso futuro si se necesita desde el dashboard)
  const crearPedido = useCallback(async (datosPedido) => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await orderService.crearPedido(datosPedido);

      if (resultado.exito) {
        // Agregar el nuevo pedido al inicio de la lista
        setPedidos(prevPedidos => [resultado.pedido, ...prevPedidos]);
        return resultado;
      } else {
        setError(resultado.mensaje || 'Error al crear el pedido');
        return null;
      }
    } catch (err) {
      console.error('Error creando pedido:', err);
      setError('Error al crear el pedido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancelar pedido
  const cancelarPedido = useCallback(async (pedidoId, motivo = 'Cancelado desde dashboard') => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await orderService.cancelarPedido(pedidoId, motivo);

      if (resultado.exito) {
        // Actualizar el estado local
        setPedidos(prevPedidos =>
          prevPedidos.map(pedido =>
            pedido.id === pedidoId
              ? { ...pedido, estado: 'cancelado', motivo_cancelacion: motivo }
              : pedido
          )
        );
        return true;
      } else {
        setError(resultado.mensaje || 'Error al cancelar el pedido');
        return false;
      }
    } catch (err) {
      console.error('Error cancelando pedido:', err);
      setError('Error al cancelar el pedido');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas de pedidos
  const obtenerEstadisticas = useCallback(() => {
    return {
      total: pedidos.length,
      pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
      enPreparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
      entregados: pedidos.filter(p => p.estado === 'entregado').length,
      cancelados: pedidos.filter(p => p.estado === 'cancelado').length,
      ingresosTotales: pedidos
        .filter(p => p.estado !== 'cancelado')
        .reduce((acc, p) => acc + parseFloat(p.total || 0), 0)
    };
  }, [pedidos]);

  // Auto-refresh cada 30 segundos cuando hay pedidos pendientes o en preparación
  useEffect(() => {
    const hayPedidosActivos = pedidos.some(p =>
      p.estado === 'pendiente' || p.estado === 'en_preparacion'
    );

    if (hayPedidosActivos) {
      const interval = setInterval(() => {
        cargarPedidos();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [pedidos, cargarPedidos]);

  return {
    pedidos,
    loading,
    error,
    cargarPedidos,
    actualizarEstadoPedido,
    obtenerPedido,
    crearPedido,
    cancelarPedido,
    obtenerEstadisticas
  };
};