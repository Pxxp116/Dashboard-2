/**
 * @fileoverview Servicio para obtener datos reales del restaurante
 * Conecta con el backend para obtener menú, información y cuentas por mesa
 */

/**
 * Configuración de la API
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Clase de servicio para datos del restaurante
 */
class RestaurantDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Obtiene el menú completo del restaurante
   * @returns {Promise<Object>} Menú del restaurante
   */
  async getRestaurantMenu() {
    const cacheKey = 'restaurant_menu';

    try {
      // Verificar cache
      if (this.hasValidCache(cacheKey)) {
        console.log('📋 Usando menú desde cache');
        return this.cache.get(cacheKey).data;
      }

      console.log('📋 Cargando menú del restaurante desde API...');
      const response = await fetch(`${API_BASE_URL}/ver-menu`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const menuData = await response.json();

      if (!menuData.exito) {
        throw new Error('Menu no encontrado en la respuesta');
      }

      // Normalizar datos del menú
      const normalizedMenu = {
        categorias: menuData.menu?.categorias || [],
        restaurante: menuData.restaurante || {},
        metadata: {
          total_categorias: menuData.menu?.categorias?.length || 0,
          total_platos: menuData.menu?.categorias?.reduce((total, cat) =>
            total + (cat.platos?.length || 0), 0) || 0,
          last_updated: new Date().toISOString()
        }
      };

      // Guardar en cache
      this.setCache(cacheKey, normalizedMenu);

      console.log(`✅ Menú cargado: ${normalizedMenu.metadata.total_categorias} categorías, ${normalizedMenu.metadata.total_platos} platos`);

      return normalizedMenu;

    } catch (error) {
      console.error('❌ Error cargando menú del restaurante:', error);

      // Fallback a datos demo si hay error
      console.log('⚠️ Usando datos demo como fallback');
      return this.getDemoMenuData();
    }
  }

  /**
   * Obtiene información del restaurante
   * @returns {Promise<Object>} Información del restaurante
   */
  async getRestaurantInfo() {
    const cacheKey = 'restaurant_info';

    try {
      // Verificar cache
      if (this.hasValidCache(cacheKey)) {
        console.log('🏪 Usando info del restaurante desde cache');
        return this.cache.get(cacheKey).data;
      }

      console.log('🏪 Cargando info del restaurante desde API...');
      const response = await fetch(`${API_BASE_URL}/admin/restaurante`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const infoData = await response.json();

      if (!infoData.exito) {
        throw new Error('Información del restaurante no encontrada');
      }

      // Normalizar información del restaurante
      const restaurantInfo = {
        nombre: infoData.datos?.nombre || 'GastroBot Restaurant',
        tipo_cocina: infoData.datos?.tipo_cocina || 'Cocina Internacional',
        direccion: infoData.datos?.direccion || '',
        telefono: infoData.datos?.telefono || '',
        email: infoData.datos?.email || '',
        web: infoData.datos?.web || '',
        descripcion: infoData.datos?.descripcion || '',
        redes_sociales: {
          facebook: infoData.datos?.facebook || '',
          instagram: infoData.datos?.instagram || '',
          twitter: infoData.datos?.twitter || ''
        },
        metadata: {
          last_updated: new Date().toISOString()
        }
      };

      // Guardar en cache
      this.setCache(cacheKey, restaurantInfo);

      console.log(`✅ Info del restaurante cargada: ${restaurantInfo.nombre}`);

      return restaurantInfo;

    } catch (error) {
      console.error('❌ Error cargando info del restaurante:', error);

      // Fallback a datos demo
      return this.getDemoRestaurantInfo();
    }
  }

  /**
   * Obtiene la cuenta de una mesa específica
   * @param {string|number} mesaId - ID de la mesa
   * @returns {Promise<Object>} Cuenta de la mesa
   */
  async getTableAccount(mesaId) {
    try {
      console.log(`🧾 Cargando cuenta de Mesa ${mesaId}...`);

      const response = await fetch(`${API_BASE_URL}/mesa/${mesaId}/cuenta`);

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`📝 No hay cuenta configurada para Mesa ${mesaId}, creando cuenta vacía`);
          return this.createEmptyTableAccount(mesaId);
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const accountData = await response.json();

      if (!accountData.exito) {
        throw new Error('Cuenta de mesa no encontrada');
      }

      console.log(`✅ Cuenta de Mesa ${mesaId} cargada: ${accountData.cuenta?.items?.length || 0} items`);

      return this.normalizeTableAccount(accountData.cuenta);

    } catch (error) {
      console.error(`❌ Error cargando cuenta de Mesa ${mesaId}:`, error);

      // Crear cuenta vacía como fallback
      console.log(`⚠️ Creando cuenta vacía para Mesa ${mesaId}`);
      return this.createEmptyTableAccount(mesaId);
    }
  }

  /**
   * Crea o actualiza la cuenta de una mesa
   * @param {string|number} mesaId - ID de la mesa
   * @param {Object} accountData - Datos de la cuenta
   * @returns {Promise<Object>} Cuenta actualizada
   */
  async updateTableAccount(mesaId, accountData) {
    try {
      console.log(`💾 Actualizando cuenta de Mesa ${mesaId}...`);

      const response = await fetch(`${API_BASE_URL}/mesa/${mesaId}/cuenta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountData)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      console.log(`✅ Cuenta de Mesa ${mesaId} actualizada`);

      return this.normalizeTableAccount(result.cuenta);

    } catch (error) {
      console.error(`❌ Error actualizando cuenta de Mesa ${mesaId}:`, error);

      // Devolver datos actualizados localmente como fallback
      return this.normalizeTableAccount(accountData);
    }
  }

  /**
   * Obtiene datos completos para una mesa (info + menú + cuenta)
   * @param {string|number} mesaId - ID de la mesa
   * @returns {Promise<Object>} Datos completos de la mesa
   */
  async getCompleteTableData(mesaId) {
    try {
      console.log(`🔄 Cargando datos completos para Mesa ${mesaId}...`);

      // Cargar todos los datos en paralelo
      const [restaurantInfo, menu, tableAccount] = await Promise.all([
        this.getRestaurantInfo(),
        this.getRestaurantMenu(),
        this.getTableAccount(mesaId)
      ]);

      const completeData = {
        mesa: {
          id: mesaId,
          numero: mesaId,
          restaurante: restaurantInfo.nombre
        },
        restaurante: restaurantInfo,
        menu,
        cuenta: tableAccount,
        metadata: {
          loaded_at: new Date().toISOString(),
          source: 'api'
        }
      };

      console.log(`✅ Datos completos de Mesa ${mesaId} cargados exitosamente`);

      return completeData;

    } catch (error) {
      console.error(`❌ Error cargando datos completos de Mesa ${mesaId}:`, error);

      // Fallback a datos demo
      console.log(`⚠️ Usando datos demo para Mesa ${mesaId}`);
      return this.getDemoTableData(mesaId);
    }
  }

  /**
   * Normaliza los datos de cuenta de mesa
   * @param {Object} rawAccount - Datos raw de la cuenta
   * @returns {Object} Cuenta normalizada
   */
  normalizeTableAccount(rawAccount) {
    return {
      items: rawAccount?.items || [],
      total: rawAccount?.total || 0,
      subtotal: rawAccount?.subtotal || 0,
      tax: rawAccount?.tax || 0,
      discount: rawAccount?.discount || 0,
      status: rawAccount?.status || 'active',
      participants: rawAccount?.participants || [],
      split_mode: rawAccount?.split_mode || null,
      created_at: rawAccount?.created_at || new Date().toISOString(),
      updated_at: rawAccount?.updated_at || new Date().toISOString()
    };
  }

  /**
   * Crea una cuenta vacía para una mesa
   * @param {string|number} mesaId - ID de la mesa
   * @returns {Object} Cuenta vacía
   */
  createEmptyTableAccount(mesaId) {
    return {
      mesa_id: mesaId,
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      discount: 0,
      status: 'empty',
      participants: [],
      split_mode: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        source: 'generated_empty',
        needs_configuration: true
      }
    };
  }

  /**
   * Verifica si hay datos válidos en cache
   * @param {string} key - Clave del cache
   * @returns {boolean} True si el cache es válido
   */
  hasValidCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const isExpired = (Date.now() - cached.timestamp) > this.cacheTTL;
    return !isExpired;
  }

  /**
   * Guarda datos en cache
   * @param {string} key - Clave del cache
   * @param {*} data - Datos a guardar
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Limpia el cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache limpiado');
  }

  /**
   * Datos demo de menú como fallback
   * @returns {Object} Menú demo
   */
  getDemoMenuData() {
    return {
      categorias: [
        {
          id: 1,
          nombre: 'Entrantes',
          platos: [
            { id: 1, nombre: 'Jamón Ibérico', precio: 22.60, descripcion: 'Jamón ibérico de bellota', disponible: true },
            { id: 2, nombre: 'Gazpacho', precio: 8.90, descripcion: 'Gazpacho andaluz tradicional', disponible: true },
            { id: 3, nombre: 'Pan con Tomate', precio: 5.50, descripcion: 'Pan tostado con tomate y aceite', disponible: true }
          ]
        },
        {
          id: 2,
          nombre: 'Principales',
          platos: [
            { id: 4, nombre: 'Paella Valenciana', precio: 24.50, descripcion: 'Paella tradicional valenciana', disponible: true },
            { id: 5, nombre: 'Cordero Asado', precio: 28.90, descripcion: 'Cordero asado con hierbas', disponible: true }
          ]
        },
        {
          id: 3,
          nombre: 'Bebidas',
          platos: [
            { id: 6, nombre: 'Sangría 1L', precio: 18.00, descripcion: 'Sangría de la casa', disponible: true },
            { id: 7, nombre: 'Agua con Gas', precio: 3.50, descripcion: 'Agua mineral con gas', disponible: true }
          ]
        },
        {
          id: 4,
          nombre: 'Postres',
          platos: [
            { id: 8, nombre: 'Crema Catalana', precio: 6.50, descripcion: 'Crema catalana tradicional', disponible: true }
          ]
        }
      ],
      restaurante: {
        nombre: 'GastroBot Restaurant',
        tipo_cocina: 'Cocina Mediterránea'
      },
      metadata: {
        total_categorias: 4,
        total_platos: 8,
        source: 'demo',
        last_updated: new Date().toISOString()
      }
    };
  }

  /**
   * Información demo del restaurante como fallback
   * @returns {Object} Info demo del restaurante
   */
  getDemoRestaurantInfo() {
    return {
      nombre: 'GastroBot Restaurant',
      tipo_cocina: 'Cocina Mediterránea',
      direccion: 'Calle Demo 123, Madrid',
      telefono: '+34 912 345 678',
      email: 'info@gastrobot.com',
      web: 'https://gastrobot.com',
      descripcion: 'Restaurante demo para el sistema GastroBot',
      redes_sociales: {
        facebook: '',
        instagram: '',
        twitter: ''
      },
      metadata: {
        source: 'demo',
        last_updated: new Date().toISOString()
      }
    };
  }

  /**
   * Datos demo completos de mesa como fallback
   * @param {string|number} mesaId - ID de la mesa
   * @returns {Object} Datos demo completos
   */
  getDemoTableData(mesaId) {
    const menu = this.getDemoMenuData();
    const restaurantInfo = this.getDemoRestaurantInfo();

    return {
      mesa: {
        id: mesaId,
        numero: mesaId,
        restaurante: restaurantInfo.nombre
      },
      restaurante: restaurantInfo,
      menu,
      cuenta: {
        mesa_id: mesaId,
        items: [
          { id: 1, nombre: 'Paella Valenciana', precio: 24.50, cantidad: 1, categoria: 'Principales' },
          { id: 2, nombre: 'Gazpacho', precio: 8.90, cantidad: 2, categoria: 'Entrantes' },
          { id: 3, nombre: 'Sangría 1L', precio: 18.00, cantidad: 1, categoria: 'Bebidas' }
        ],
        total: 60.30,
        subtotal: 60.30,
        tax: 0,
        discount: 0,
        status: 'active',
        participants: [],
        split_mode: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      metadata: {
        loaded_at: new Date().toISOString(),
        source: 'demo'
      }
    };
  }
}

// Crear instancia singleton
const restaurantDataService = new RestaurantDataService();

export default restaurantDataService;