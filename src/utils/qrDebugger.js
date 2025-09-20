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
  console.group('🔍 Validación de datos de mesas');

  const issues = [];
  const ids = [];

  mesas.forEach((mesa, index) => {
    // Verificar ID
    if (!mesa.id && !mesa.numero_mesa && !mesa.numero) {
      issues.push(`Mesa en posición ${index} sin identificador`);
    }

    const mesaId = mesa.id || mesa.numero_mesa || mesa.numero;

    // Verificar duplicados
    if (ids.includes(mesaId)) {
      issues.push(`ID duplicado: ${mesaId}`);
    }
    ids.push(mesaId);

    // Verificar datos básicos
    if (!mesa.capacidad || mesa.capacidad <= 0) {
      issues.push(`Mesa ${mesaId} sin capacidad válida`);
    }
  });

  if (issues.length > 0) {
    console.error('❌ Problemas encontrados:');
    issues.forEach(issue => console.error(`   - ${issue}`));
  } else {
    console.log('✅ Todas las mesas tienen datos válidos');
  }

  console.groupEnd();

  return issues.length === 0;
};