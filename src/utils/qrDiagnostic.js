/**
 * Script de diagnóstico completo para verificar la estructura real de datos
 * y el funcionamiento del sistema de QR
 */

export const runCompleteQRDiagnostic = async () => {
  console.group('🔬 DIAGNÓSTICO COMPLETO DEL SISTEMA QR');
  console.log('═══════════════════════════════════════════════════════════');

  const results = {
    database_structure: null,
    api_connectivity: null,
    qr_generation: null,
    url_validation: null,
    restaurant_data: null,
    issues: [],
    recommendations: []
  };

  try {
    // 1. VERIFICAR CONECTIVIDAD CON APIs
    console.log('\n1️⃣ VERIFICANDO CONECTIVIDAD CON APIs...');
    console.log('─────────────────────────────────────────────');

    const apiTests = {
      mesas: null,
      menu: null,
      restaurante: null
    };

    try {
      const mesasResponse = await fetch('/api/mesas');
      apiTests.mesas = {
        status: mesasResponse.status,
        ok: mesasResponse.ok,
        data: mesasResponse.ok ? await mesasResponse.json() : null
      };
      console.log(`✅ /api/mesas: ${mesasResponse.status}`, apiTests.mesas.data?.length || 0, 'mesas');
    } catch (error) {
      apiTests.mesas = { error: error.message };
      console.error(`❌ /api/mesas: ${error.message}`);
      results.issues.push('API de mesas no accesible');
    }

    try {
      const menuResponse = await fetch('/api/ver-menu');
      apiTests.menu = {
        status: menuResponse.status,
        ok: menuResponse.ok,
        data: menuResponse.ok ? await menuResponse.json() : null
      };
      console.log(`✅ /api/ver-menu: ${menuResponse.status}`, apiTests.menu.data?.categorias?.length || 0, 'categorías');
    } catch (error) {
      apiTests.menu = { error: error.message };
      console.error(`❌ /api/ver-menu: ${error.message}`);
      results.issues.push('API de menú no accesible');
    }

    try {
      const restauranteResponse = await fetch('/api/admin/restaurante');
      apiTests.restaurante = {
        status: restauranteResponse.status,
        ok: restauranteResponse.ok,
        data: restauranteResponse.ok ? await restauranteResponse.json() : null
      };
      console.log(`✅ /api/admin/restaurante: ${restauranteResponse.status}`, apiTests.restaurante.data?.nombre || 'Sin nombre');
    } catch (error) {
      apiTests.restaurante = { error: error.message };
      console.error(`❌ /api/admin/restaurante: ${error.message}`);
      results.issues.push('API de restaurante no accesible');
    }

    results.api_connectivity = apiTests;

    // 2. ANALIZAR ESTRUCTURA REAL DE DATOS DE MESAS
    if (apiTests.mesas?.data) {
      console.log('\n2️⃣ ANALIZANDO ESTRUCTURA REAL DE DATOS DE MESAS...');
      console.log('─────────────────────────────────────────────────────────');

      const mesas = apiTests.mesas.data;
      const sampleMesa = mesas[0];

      console.log(`📊 Total de mesas en BD: ${mesas.length}`);
      console.log(`🔍 Estructura de mesa ejemplo:`, sampleMesa);
      console.log(`📋 Campos disponibles:`, Object.keys(sampleMesa));

      // Análisis de campos críticos
      const fieldAnalysis = {
        id_field: sampleMesa.hasOwnProperty('id'),
        numero_mesa_field: sampleMesa.hasOwnProperty('numero_mesa'),
        numero_field: sampleMesa.hasOwnProperty('numero'),
        capacidad_field: sampleMesa.hasOwnProperty('capacidad'),
        zona_field: sampleMesa.hasOwnProperty('zona'),
        activa_field: sampleMesa.hasOwnProperty('activa')
      };

      console.log(`🏷️ Análisis de campos críticos:`, fieldAnalysis);

      // Verificar identificadores únicos
      const ids = mesas.map(mesa => mesa.id).filter(id => id !== null && id !== undefined);
      const numerosMesa = mesas.map(mesa => mesa.numero_mesa).filter(num => num !== null && num !== undefined);
      const numeros = mesas.map(mesa => mesa.numero).filter(num => num !== null && num !== undefined);

      console.log(`🔢 IDs únicos: ${[...new Set(ids)].length}/${ids.length}`);
      console.log(`🔢 Números de mesa únicos: ${[...new Set(numerosMesa)].length}/${numerosMesa.length}`);
      console.log(`🔢 Números únicos: ${[...new Set(numeros)].length}/${numeros.length}`);

      if (ids.length !== [...new Set(ids)].length) {
        results.issues.push('IDs de mesa duplicados detectados');
      }

      results.database_structure = {
        total_mesas: mesas.length,
        sample_structure: sampleMesa,
        field_analysis: fieldAnalysis,
        unique_ids: ids.length === [...new Set(ids)].length,
        unique_numeros_mesa: numerosMesa.length === [...new Set(numerosMesa)].length
      };
    }

    // 3. SIMULAR GENERACIÓN DE QR Y VERIFICAR URLs
    if (apiTests.mesas?.data) {
      console.log('\n3️⃣ SIMULANDO GENERACIÓN DE QR...');
      console.log('─────────────────────────────────────');

      const mesas = apiTests.mesas.data;
      const simulatedQRs = [];

      mesas.forEach((mesa, index) => {
        // Simular la lógica de generación de ID
        const mesaId = mesa.id || `mesa_${mesa.numero_mesa || mesa.numero || 'unknown'}`;
        const mesaNumero = mesa.numero_mesa || mesa.numero || mesaId;

        const paymentUrl = `${window.location.origin}/mesa/${mesaId}/pago`;

        simulatedQRs.push({
          mesa_original: mesa,
          mesa_id: mesaId,
          mesa_numero: mesaNumero,
          payment_url: paymentUrl,
          url_pattern_valid: /\/mesa\/[^\/]+\/pago$/.test(paymentUrl)
        });

        console.log(`🎯 Mesa ${index + 1}: ID=${mesaId}, Número=${mesaNumero}, URL=${paymentUrl}`);
      });

      // Verificar unicidad de URLs
      const urls = simulatedQRs.map(qr => qr.payment_url);
      const urlsUnicas = [...new Set(urls)];

      console.log(`\n📊 RESULTADO DE SIMULACIÓN:`);
      console.log(`   Total URLs generadas: ${urls.length}`);
      console.log(`   URLs únicas: ${urlsUnicas.length}`);
      console.log(`   ¿Todas únicas?: ${urls.length === urlsUnicas.length ? '✅ SÍ' : '❌ NO'}`);

      if (urls.length !== urlsUnicas.length) {
        console.error(`❌ PROBLEMA: URLs duplicadas detectadas!`);
        results.issues.push('URLs de QR duplicadas generadas');

        // Análisis de duplicados
        const urlCount = {};
        urls.forEach((url, index) => {
          if (!urlCount[url]) urlCount[url] = [];
          urlCount[url].push(index);
        });

        Object.entries(urlCount)
          .filter(([url, indices]) => indices.length > 1)
          .forEach(([url, indices]) => {
            console.error(`   🔴 URL duplicada: ${url}`);
            console.error(`   📋 Mesas afectadas: ${indices.map(i => simulatedQRs[i].mesa_numero).join(', ')}`);
          });
      }

      results.qr_generation = {
        total_generated: simulatedQRs.length,
        unique_urls: urlsUnicas.length,
        all_unique: urls.length === urlsUnicas.length,
        sample_qrs: simulatedQRs.slice(0, 3)
      };
    }

    // 4. VERIFICAR ACCESO A URLs DE PAGO
    if (results.qr_generation?.sample_qrs) {
      console.log('\n4️⃣ VERIFICANDO ACCESO A URLs DE PAGO...');
      console.log('──────────────────────────────────────────');

      const urlTests = [];

      for (const qr of results.qr_generation.sample_qrs) {
        try {
          const response = await fetch(qr.payment_url);
          urlTests.push({
            url: qr.payment_url,
            status: response.status,
            accessible: response.ok,
            mesa_id: qr.mesa_id
          });
          console.log(`${response.ok ? '✅' : '❌'} ${qr.payment_url}: ${response.status}`);
        } catch (error) {
          urlTests.push({
            url: qr.payment_url,
            error: error.message,
            accessible: false,
            mesa_id: qr.mesa_id
          });
          console.error(`❌ ${qr.payment_url}: ${error.message}`);
        }
      }

      results.url_validation = urlTests;
    }

    // 5. GENERAR RECOMENDACIONES
    console.log('\n5️⃣ GENERANDO RECOMENDACIONES...');
    console.log('──────────────────────────────────────');

    if (results.issues.length === 0) {
      console.log('✅ ¡Sistema funcionando correctamente!');
      results.recommendations.push('Sistema QR operativo - continuar con monitoreo regular');
    } else {
      console.log('⚠️ Problemas detectados - se requiere acción:');
      results.issues.forEach(issue => console.log(`   - ${issue}`));

      // Recomendaciones específicas
      if (results.issues.includes('URLs de QR duplicadas generadas')) {
        results.recommendations.push('Revisar lógica de generación de IDs únicos en tableQRGenerator.js');
        results.recommendations.push('Implementar validación estricta de unicidad antes de generar QRs');
      }

      if (results.issues.includes('IDs de mesa duplicados detectados')) {
        results.recommendations.push('Limpiar base de datos - eliminar mesas duplicadas');
        results.recommendations.push('Implementar constraint UNIQUE en campo ID de mesas');
      }

      if (results.issues.some(issue => issue.includes('API'))) {
        results.recommendations.push('Verificar conectividad con backend');
        results.recommendations.push('Revisar configuración de URLs de API');
      }
    }

    results.recommendations.forEach(rec => console.log(`💡 ${rec}`));

  } catch (error) {
    console.error('❌ Error durante diagnóstico:', error);
    results.issues.push(`Error general: ${error.message}`);
  }

  console.log('\n📋 RESUMEN DEL DIAGNÓSTICO:');
  console.log('═══════════════════════════════════════');
  console.log(`✅ APIs accesibles: ${Object.values(results.api_connectivity || {}).filter(api => api?.ok).length}/3`);
  console.log(`📊 Estructura de BD: ${results.database_structure ? '✅ Analizada' : '❌ No disponible'}`);
  console.log(`🎯 Generación QR: ${results.qr_generation?.all_unique ? '✅ URLs únicas' : '❌ URLs duplicadas'}`);
  console.log(`🔗 Validación URLs: ${results.url_validation ? '✅ Verificada' : '❌ No verificada'}`);
  console.log(`⚠️ Problemas: ${results.issues.length}`);
  console.log(`💡 Recomendaciones: ${results.recommendations.length}`);

  console.groupEnd();

  return results;
};

// Función para ejecutar diagnóstico específico de una mesa
export const diagnosticSingleTable = async (mesaId) => {
  console.group(`🔍 Diagnóstico específico - Mesa ${mesaId}`);

  try {
    // Verificar datos de la mesa
    const mesaResponse = await fetch(`/api/mesa/${mesaId}/info`);
    const mesaData = mesaResponse.ok ? await mesaResponse.json() : null;

    console.log(`📋 Datos de mesa:`, mesaData);

    // Verificar URL de pago
    const paymentUrl = `/mesa/${mesaId}/pago`;
    console.log(`🔗 URL de pago: ${window.location.origin}${paymentUrl}`);

    // Verificar cuenta de mesa
    try {
      const cuentaResponse = await fetch(`/api/mesa/${mesaId}/cuenta`);
      const cuentaData = cuentaResponse.ok ? await cuentaResponse.json() : null;
      console.log(`💳 Cuenta de mesa:`, cuentaData);
    } catch (error) {
      console.warn(`⚠️ No se pudo obtener cuenta: ${error.message}`);
    }

  } catch (error) {
    console.error(`❌ Error en diagnóstico: ${error.message}`);
  }

  console.groupEnd();
};

// Función de diagnóstico rápido para uso en consola
export const quickDiagnostic = () => {
  console.log('🚀 Ejecutando diagnóstico rápido...');

  // Verificar localStorage
  const restaurantData = localStorage.getItem('restaurant_data');
  const menuData = localStorage.getItem('menu_data');

  console.log('💾 Cache localStorage:');
  console.log(`   - Datos restaurante: ${restaurantData ? '✅' : '❌'}`);
  console.log(`   - Datos menú: ${menuData ? '✅' : '❌'}`);

  // Verificar QRs en DOM
  const qrElements = document.querySelectorAll('[data-qr-url]');
  const urls = Array.from(qrElements).map(el => el.dataset.qrUrl);
  const urlsUnicas = [...new Set(urls)];

  console.log('🎯 QRs en DOM:');
  console.log(`   - Total: ${urls.length}`);
  console.log(`   - Únicos: ${urlsUnicas.length}`);
  console.log(`   - Estado: ${urls.length === urlsUnicas.length ? '✅ OK' : '❌ DUPLICADOS'}`);

  return {
    localStorage_ok: !!restaurantData && !!menuData,
    qrs_unique: urls.length === urlsUnicas.length,
    total_qrs: urls.length
  };
};