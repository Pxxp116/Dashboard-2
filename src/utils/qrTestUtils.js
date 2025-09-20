/**
 * Utilidades de testing para validar la solución de QRs duplicados
 * Estas funciones pueden ejecutarse en la consola del navegador para verificar que la solución funciona
 */

/**
 * Test completo de unicidad de QRs
 */
window.testQRUniqueness = function() {
  console.group('🧪 TEST COMPLETO DE UNICIDAD DE QRs');

  try {
    // 1. Buscar elementos QR en el DOM
    const qrElements = document.querySelectorAll('[data-qr-url], [data-payment-url], .qr-card, .table-qr-card');
    console.log(`🔍 Elementos QR encontrados: ${qrElements.length}`);

    if (qrElements.length === 0) {
      console.warn('⚠️ No se encontraron elementos QR en el DOM. Asegúrate de estar en la página de QR de Mesas.');
      console.groupEnd();
      return {
        success: false,
        message: 'No QRs found'
      };
    }

    // 2. Extraer URLs
    const urls = [];
    const mesaIds = [];

    qrElements.forEach((element, index) => {
      const url = element.dataset.qrUrl || element.dataset.paymentUrl ||
                  element.querySelector('[data-qr-url]')?.dataset.qrUrl ||
                  element.querySelector('[data-payment-url]')?.dataset.paymentUrl;

      if (url) {
        urls.push(url);

        // Extraer mesa ID de la URL
        const match = url.match(/\/mesa\/([^\/]+)\/pago/);
        if (match) {
          mesaIds.push(match[1]);
        }

        console.log(`   QR ${index + 1}: ${url}`);
      }
    });

    // 3. Análisis de unicidad
    const uniqueUrls = [...new Set(urls)];
    const uniqueMesaIds = [...new Set(mesaIds)];

    console.log(`\n📊 ANÁLISIS DE RESULTADOS:`);
    console.log(`   URLs totales extraídas: ${urls.length}`);
    console.log(`   URLs únicas: ${uniqueUrls.length}`);
    console.log(`   Mesa IDs extraídos: ${mesaIds.length}`);
    console.log(`   Mesa IDs únicos: ${uniqueMesaIds.length}`);

    // 4. Validación de formato
    const validFormats = urls.filter(url => /\/mesa\/[^\/]+\/pago/.test(url));
    console.log(`   URLs con formato válido: ${validFormats.length}/${urls.length}`);

    // 5. Detectar problemas
    const problems = [];
    const warnings = [];

    if (urls.length !== uniqueUrls.length) {
      problems.push('URLs duplicadas detectadas');

      // Encontrar duplicados específicos
      const urlCount = {};
      urls.forEach(url => {
        urlCount[url] = (urlCount[url] || 0) + 1;
      });

      Object.entries(urlCount)
        .filter(([url, count]) => count > 1)
        .forEach(([url, count]) => {
          console.error(`   🔴 URL duplicada: ${url} (${count} veces)`);
        });
    }

    if (mesaIds.length !== uniqueMesaIds.length) {
      problems.push('Mesa IDs duplicados detectados');
    }

    if (validFormats.length !== urls.length) {
      warnings.push(`${urls.length - validFormats.length} URLs con formato inválido`);
    }

    // 6. Resultado final
    const isSuccess = problems.length === 0;

    if (isSuccess) {
      console.log('\n✅ ÉXITO: Todos los QRs son únicos y válidos');
      console.log('✅ La solución de QRs duplicados está funcionando correctamente');
    } else {
      console.error('\n❌ PROBLEMAS DETECTADOS:');
      problems.forEach(problem => console.error(`   🚨 ${problem}`));
    }

    if (warnings.length > 0) {
      console.warn('\n⚠️ ADVERTENCIAS:');
      warnings.forEach(warning => console.warn(`   ⚠️ ${warning}`));
    }

    console.groupEnd();

    return {
      success: isSuccess,
      totalQRs: urls.length,
      uniqueQRs: uniqueUrls.length,
      problems,
      warnings,
      urls,
      mesaIds
    };

  } catch (error) {
    console.error('❌ Error durante el test:', error);
    console.groupEnd();
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test simplificado para ejecutar rápidamente
 */
window.quickQRTest = function() {
  console.log('⚡ Test rápido de QRs...');

  const qrElements = document.querySelectorAll('[data-qr-url], [data-payment-url]');
  const urls = Array.from(qrElements).map(el =>
    el.dataset.qrUrl || el.dataset.paymentUrl
  ).filter(url => url);

  const uniqueUrls = [...new Set(urls)];
  const isUnique = urls.length === uniqueUrls.length;

  console.log(`📊 ${urls.length} QRs encontrados, ${uniqueUrls.length} únicos`);
  console.log(`${isUnique ? '✅' : '❌'} Estado: ${isUnique ? 'ÚNICO' : 'DUPLICADO'}`);

  if (!isUnique) {
    alert('❌ QRs DUPLICADOS DETECTADOS - Revisa la consola para detalles');
  } else {
    alert(`✅ PERFECTO: ${urls.length} QRs únicos encontrados`);
  }

  return { unique: isUnique, total: urls.length };
};

/**
 * Simular generación de QRs para test
 */
window.simulateQRGeneration = function(mesas) {
  console.group('🧪 SIMULACIÓN DE GENERACIÓN DE QRs');

  if (!mesas || !Array.isArray(mesas)) {
    console.error('❌ Debe proporcionar array de mesas para simular');
    console.groupEnd();
    return;
  }

  console.log(`🔧 Simulando generación para ${mesas.length} mesas`);

  const simulatedQRs = [];
  const issues = [];

  mesas.forEach((mesa, index) => {
    try {
      // Simular validación estricta
      if (!mesa.id) {
        issues.push(`Mesa ${index + 1} sin ID válido`);
        return;
      }

      // Simular generación de URL
      const mesaId = mesa.id;
      const mesaNumero = mesa.numero_mesa || mesa.numero || mesaId;
      const paymentUrl = `https://gastrobot.com/mesa/${mesaId}/pago`;

      simulatedQRs.push({
        mesa_id: mesaId,
        mesa_numero: mesaNumero,
        paymentUrl,
        original_mesa: mesa
      });

      console.log(`   ✅ Mesa ${mesaNumero}: ${paymentUrl}`);

    } catch (error) {
      issues.push(`Error en mesa ${index + 1}: ${error.message}`);
    }
  });

  // Validar unicidad
  const urls = simulatedQRs.map(qr => qr.paymentUrl);
  const uniqueUrls = [...new Set(urls)];

  console.log(`\n📊 RESULTADO DE SIMULACIÓN:`);
  console.log(`   QRs simulados: ${simulatedQRs.length}`);
  console.log(`   URLs únicas: ${uniqueUrls.length}`);
  console.log(`   Problemas: ${issues.length}`);

  if (urls.length === uniqueUrls.length) {
    console.log('✅ SIMULACIÓN EXITOSA: Todas las URLs serían únicas');
  } else {
    console.error('❌ SIMULACIÓN FALLÓ: Se generarían URLs duplicadas');
  }

  if (issues.length > 0) {
    console.warn('⚠️ Problemas detectados:', issues);
  }

  console.groupEnd();

  return {
    success: urls.length === uniqueUrls.length && issues.length === 0,
    simulatedQRs,
    issues
  };
};

/**
 * Verificar integridad de datos de mesas
 */
window.validateMesasData = function(mesas) {
  if (!mesas || !Array.isArray(mesas)) {
    console.error('❌ Debe proporcionar array de mesas');
    return false;
  }

  console.group('🔍 VALIDACIÓN DE DATOS DE MESAS');

  const ids = [];
  const issues = [];
  const warnings = [];

  mesas.forEach((mesa, index) => {
    if (!mesa.id) {
      issues.push(`Mesa ${index + 1} sin ID`);
    } else {
      if (ids.includes(mesa.id)) {
        issues.push(`ID duplicado: ${mesa.id}`);
      }
      ids.push(mesa.id);
    }

    if (!mesa.numero_mesa) {
      warnings.push(`Mesa ${mesa.id || index + 1} sin numero_mesa`);
    }
  });

  console.log(`📊 ${mesas.length} mesas analizadas`);
  console.log(`🔢 ${[...new Set(ids)].length} IDs únicos`);
  console.log(`❌ ${issues.length} problemas críticos`);
  console.log(`⚠️ ${warnings.length} advertencias`);

  if (issues.length > 0) {
    console.error('🚨 PROBLEMAS CRÍTICOS:', issues);
  }

  if (warnings.length > 0) {
    console.warn('⚠️ ADVERTENCIAS:', warnings);
  }

  const isValid = issues.length === 0;
  console.log(`${isValid ? '✅' : '❌'} Estado: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);

  console.groupEnd();

  return isValid;
};

// Hacer funciones disponibles globalmente para fácil acceso en consola
console.log('🧪 Utilidades de testing de QR cargadas. Funciones disponibles:');
console.log('   - testQRUniqueness() - Test completo de unicidad');
console.log('   - quickQRTest() - Test rápido');
console.log('   - simulateQRGeneration(mesas) - Simular generación');
console.log('   - validateMesasData(mesas) - Validar datos de mesas');