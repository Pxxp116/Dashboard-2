/**
 * Utilidades de debugging para el sistema de QR
 */

export const debugQRGeneration = (mesas, tableQRs) => {
  console.group('🔍 DEBUG: Generación de QR - Análisis Completo');

  // ANÁLISIS PROFUNDO: Estructura real de datos
  console.log('📊 ANÁLISIS DE ESTRUCTURA DE DATOS:');
  console.log('═══════════════════════════════════════════');

  // Verificar datos de entrada con análisis detallado
  console.log('1. 📋 MESAS RECIBIDAS - Estructura detallada:');
  mesas.forEach((mesa, index) => {
    console.log(`   🏷️ Mesa ${index + 1} - Análisis completo:`, {
      estructura_completa: mesa,
      campos_disponibles: Object.keys(mesa),
      tipos_de_datos: Object.entries(mesa).reduce((acc, [key, value]) => {
        acc[key] = {
          tipo: typeof value,
          valor: value,
          es_null: value === null,
          es_undefined: value === undefined,
          es_vacio: value === '' || value === 0
        };
        return acc;
      }, {}),
      // Campos críticos para QR
      id: mesa.id,
      numero_mesa: mesa.numero_mesa,
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      zona: mesa.zona,
      activa: mesa.activa,
      // Validaciones
      tiene_id_valido: !!mesa.id && mesa.id !== null && mesa.id !== undefined,
      tiene_numero_mesa_valido: !!mesa.numero_mesa && mesa.numero_mesa !== null && mesa.numero_mesa !== undefined
    });
  });

  // Verificar QRs generados con análisis exhaustivo
  console.log('\n2. 🎯 QRs GENERADOS - Análisis exhaustivo:');
  tableQRs.forEach((qr, index) => {
    console.log(`   🔗 QR ${index + 1} - Análisis completo:`, {
      estructura_completa_qr: qr,
      campos_disponibles: Object.keys(qr),
      // Campos críticos
      mesa_id: qr.mesa_id,
      mesa_numero: qr.mesa_numero,
      paymentUrl: qr.paymentUrl,
      publicUrl: qr.publicUrl,
      name: qr.name,
      description: qr.description,
      enhanced: qr.enhanced,
      restaurant_context: qr.restaurant_context,
      restaurant_metadata: qr.restaurant_metadata,
      // Validaciones críticas
      tiene_mesa_id: !!qr.mesa_id,
      tiene_url_pago: !!qr.paymentUrl,
      url_contiene_mesa_id: qr.paymentUrl ? qr.paymentUrl.includes(qr.mesa_id) : false,
      formato_url_correcto: qr.paymentUrl ? /\/mesa\/[^\/]+\/pago$/.test(qr.paymentUrl) : false
    });
  });

  // Análisis exhaustivo de URLs
  const urls = tableQRs.map(qr => qr.paymentUrl);
  const urlsUnicas = [...new Set(urls)];

  console.log('\n3. 🔗 ANÁLISIS EXHAUSTIVO DE URLs:');
  console.log('═══════════════════════════════════════════');

  // Estadísticas generales
  console.log(`📊 Estadísticas generales:`, {
    total_qrs: urls.length,
    urls_unicas: urlsUnicas.length,
    hay_duplicados: urls.length !== urlsUnicas.length,
    porcentaje_unicidad: ((urlsUnicas.length / urls.length) * 100).toFixed(2) + '%'
  });

  // Lista completa de URLs generadas
  console.log(`📋 URLs generadas (lista completa):`, urls);

  // Análisis de patrones de URL
  const patronesUrl = urls.map(url => {
    const match = url.match(/\/mesa\/([^\/]+)\/pago$/);
    return {
      url_completa: url,
      mesa_id_extraido: match ? match[1] : 'NO_MATCH',
      patron_valido: !!match,
      dominio: url.split('/mesa/')[0]
    };
  });

  console.log(`🔍 Análisis de patrones de URL:`, patronesUrl);

  if (urls.length !== urlsUnicas.length) {
    console.error('\n❌ PROBLEMA CRÍTICO DETECTADO: URLs duplicadas!');
    console.error('═══════════════════════════════════════════════════');

    // Análisis detallado de duplicados
    const urlCount = {};
    urls.forEach((url, index) => {
      if (!urlCount[url]) urlCount[url] = [];
      urlCount[url].push({
        index,
        qr: tableQRs[index],
        mesa_info: {
          mesa_id: tableQRs[index].mesa_id,
          mesa_numero: tableQRs[index].mesa_numero,
          nombre: tableQRs[index].name
        }
      });
    });

    const urlsDuplicadas = Object.entries(urlCount)
      .filter(([url, ocurrencias]) => ocurrencias.length > 1);

    console.error(`🚨 URLS DUPLICADAS ENCONTRADAS (${urlsDuplicadas.length}):`, urlsDuplicadas);

    urlsDuplicadas.forEach(([url, ocurrencias]) => {
      console.error(`   🔴 URL: ${url}`);
      console.error(`   📋 Mesas afectadas (${ocurrencias.length}):`,
        ocurrencias.map(o => `Mesa ${o.mesa_info.mesa_numero} (ID: ${o.mesa_info.mesa_id})`));
      console.error(`   ⚠️ Esto significa que estas mesas tendrán el mismo QR!`);
    });

    // Análisis de causas potenciales
    console.error(`\n🔍 ANÁLISIS DE CAUSAS POTENCIALES:`);
    const mesaIds = tableQRs.map(qr => qr.mesa_id);
    const mesaIdsUnicos = [...new Set(mesaIds)];

    if (mesaIds.length !== mesaIdsUnicos.length) {
      console.error(`   💥 CAUSA RAÍZ: mesa_ids duplicados en QRs generados!`);
      console.error(`   📊 Mesa IDs: ${mesaIds}`);
      console.error(`   📊 Mesa IDs únicos: ${mesaIdsUnicos}`);
    } else {
      console.error(`   🤔 Mesa IDs son únicos, el problema está en la generación de URLs`);
    }

  } else {
    console.log('✅ PERFECTO: Todas las URLs son únicas - Sistema funcionando correctamente');
    console.log(`✅ ${urls.length} QRs generados con URLs completamente únicas`);
  }

  console.groupEnd();

  return urls.length === urlsUnicas.length;
};

export const validateMesaData = (mesas) => {
  console.group('🔍 VALIDACIÓN ESTRICTA DE DATOS DE MESAS');

  const issues = [];
  const warnings = [];
  const ids = [];

  mesas.forEach((mesa, index) => {
    // VALIDACIÓN CRÍTICA: Verificar ID obligatorio
    if (!mesa.id) {
      issues.push(`CRÍTICO: Mesa en posición ${index} sin ID de base de datos (numero_mesa: ${mesa.numero_mesa || 'N/A'})`);
    } else {
      // Verificar tipo de ID
      if (typeof mesa.id !== 'number' && typeof mesa.id !== 'string') {
        issues.push(`CRÍTICO: Mesa ${mesa.id} tiene ID con tipo inválido: ${typeof mesa.id}`);
      }

      // Verificar duplicados de ID
      if (ids.includes(mesa.id)) {
        issues.push(`CRÍTICO: ID duplicado detectado: ${mesa.id}`);
      }
      ids.push(mesa.id);
    }

    // Verificar numero_mesa
    if (!mesa.numero_mesa) {
      warnings.push(`Mesa ID ${mesa.id || index} sin numero_mesa`);
    }

    // Verificar datos básicos
    if (!mesa.capacidad || mesa.capacidad <= 0) {
      warnings.push(`Mesa ${mesa.id || index} sin capacidad válida`);
    }

    // Verificar estado activo
    if (mesa.activa === false) {
      warnings.push(`Mesa ${mesa.id || index} está marcada como inactiva`);
    }
  });

  // Reportar resultados
  console.log(`📊 RESUMEN DE VALIDACIÓN:`);
  console.log(`   Total mesas analizadas: ${mesas.length}`);
  console.log(`   IDs únicos encontrados: ${[...new Set(ids)].length}`);
  console.log(`   Problemas críticos: ${issues.length}`);
  console.log(`   Advertencias: ${warnings.length}`);

  if (issues.length > 0) {
    console.error('❌ PROBLEMAS CRÍTICOS ENCONTRADOS:');
    issues.forEach(issue => console.error(`   🚨 ${issue}`));
  }

  if (warnings.length > 0) {
    console.warn('⚠️ ADVERTENCIAS:');
    warnings.forEach(warning => console.warn(`   ⚠️ ${warning}`));
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ TODAS LAS MESAS TIENEN DATOS VÁLIDOS');
  }

  console.groupEnd();

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    totalMesas: mesas.length,
    uniqueIds: [...new Set(ids)].length
  };
};

// Nueva función para validar QRs post-generación
export const validateQRPostGeneration = (qrs) => {
  console.group('🔍 VALIDACIÓN POST-GENERACIÓN DE QRs');

  const validationResults = {
    totalQRs: qrs.length,
    uniqueUrls: 0,
    uniqueMesaIds: 0,
    validUrlFormats: 0,
    urlMesaIdMatches: 0,
    issues: [],
    warnings: []
  };

  // 1. Validar URLs únicas
  const urls = qrs.map(qr => qr.paymentUrl);
  const uniqueUrls = [...new Set(urls)];
  validationResults.uniqueUrls = uniqueUrls.length;

  if (urls.length !== uniqueUrls.length) {
    validationResults.issues.push('URLs duplicadas detectadas');

    // Encontrar duplicados específicos
    const urlCount = {};
    urls.forEach((url, index) => {
      if (!urlCount[url]) urlCount[url] = [];
      urlCount[url].push({ index, mesa_id: qrs[index].mesa_id, mesa_numero: qrs[index].mesa_numero });
    });

    const duplicates = Object.entries(urlCount).filter(([url, instances]) => instances.length > 1);
    console.error('🚨 URLs DUPLICADAS:', duplicates);
  }

  // 2. Validar Mesa IDs únicos
  const mesaIds = qrs.map(qr => qr.mesa_id);
  const uniqueMesaIds = [...new Set(mesaIds)];
  validationResults.uniqueMesaIds = uniqueMesaIds.length;

  if (mesaIds.length !== uniqueMesaIds.length) {
    validationResults.issues.push('Mesa IDs duplicados en QRs');
  }

  // 3. Validar formato de URLs
  const urlPattern = /\/mesa\/[^\/]+\/pago$/;
  const validFormats = urls.filter(url => urlPattern.test(url));
  validationResults.validUrlFormats = validFormats.length;

  if (validFormats.length !== urls.length) {
    validationResults.issues.push('URLs con formato inválido encontradas');
  }

  // 4. Validar correspondencia mesa_id en URL
  const urlMatches = qrs.filter(qr => qr.paymentUrl.includes(qr.mesa_id));
  validationResults.urlMesaIdMatches = urlMatches.length;

  if (urlMatches.length !== qrs.length) {
    validationResults.issues.push('URLs que no contienen el mesa_id correspondiente');
  }

  // Reportar resultados
  console.log('📊 RESULTADOS DE VALIDACIÓN POST-GENERACIÓN:');
  console.log(`   Total QRs: ${validationResults.totalQRs}`);
  console.log(`   URLs únicas: ${validationResults.uniqueUrls}/${validationResults.totalQRs}`);
  console.log(`   Mesa IDs únicos: ${validationResults.uniqueMesaIds}/${validationResults.totalQRs}`);
  console.log(`   Formatos URL válidos: ${validationResults.validUrlFormats}/${validationResults.totalQRs}`);
  console.log(`   Correspondencia mesa_id-URL: ${validationResults.urlMesaIdMatches}/${validationResults.totalQRs}`);

  const allValid = validationResults.issues.length === 0;
  if (allValid) {
    console.log('✅ TODOS LOS QRs SON VÁLIDOS Y ÚNICOS');
  } else {
    console.error('❌ PROBLEMAS DETECTADOS EN QRs:', validationResults.issues);
  }

  console.groupEnd();

  return {
    valid: allValid,
    results: validationResults
  };
};

// Nueva función para diagnóstico rápido en consola del navegador
export const quickQRDiagnostic = () => {
  console.group('⚡ DIAGNÓSTICO RÁPIDO DE QRs');

  try {
    // Buscar elementos QR en el DOM
    const qrElements = document.querySelectorAll('[data-qr-url], [data-payment-url], .qr-card, .table-qr-card');
    console.log(`🔍 Elementos QR encontrados en DOM: ${qrElements.length}`);

    // Extraer URLs de los atributos data
    const urls = [];
    qrElements.forEach((element, index) => {
      const url = element.dataset.qrUrl || element.dataset.paymentUrl ||
                  element.querySelector('[data-qr-url]')?.dataset.qrUrl;

      if (url) {
        urls.push(url);
        console.log(`   QR ${index + 1}: ${url}`);
      }
    });

    // Análisis de unicidad
    const uniqueUrls = [...new Set(urls)];
    const isUnique = urls.length === uniqueUrls.length;

    console.log(`📊 ANÁLISIS DE UNICIDAD:`);
    console.log(`   URLs totales: ${urls.length}`);
    console.log(`   URLs únicas: ${uniqueUrls.length}`);
    console.log(`   Estado: ${isUnique ? '✅ ÚNICAS' : '❌ DUPLICADAS'}`);

    if (!isUnique) {
      console.error('🚨 URLs DUPLICADAS DETECTADAS EN EL DOM');
      const urlCount = {};
      urls.forEach(url => {
        urlCount[url] = (urlCount[url] || 0) + 1;
      });

      Object.entries(urlCount)
        .filter(([url, count]) => count > 1)
        .forEach(([url, count]) => {
          console.error(`   🔴 ${url} (${count} veces)`);
        });
    }

    return {
      totalQRs: urls.length,
      uniqueQRs: uniqueUrls.length,
      isUnique,
      urls
    };

  } catch (error) {
    console.error('❌ Error en diagnóstico rápido:', error);
    return { error: error.message };
  } finally {
    console.groupEnd();
  }
};