/**
 * Utilidades de debugging para el sistema de QR
 */

export const debugQRGeneration = (mesas, tableQRs) => {
  console.group('🔍 DEBUG: Generación de QR');

  // Verificar datos de entrada
  console.log('1. Mesas recibidas:');
  mesas.forEach((mesa, index) => {
    console.log(`   Mesa ${index + 1}:`, {
      id: mesa.id,
      numero: mesa.numero,
      numero_mesa: mesa.numero_mesa,
      capacidad: mesa.capacidad
    });
  });

  // Verificar QRs generados
  console.log('\n2. QRs generados:');
  tableQRs.forEach((qr, index) => {
    console.log(`   QR ${index + 1}:`, {
      mesa_id: qr.mesa_id,
      mesa_numero: qr.mesa_numero,
      url: qr.paymentUrl
    });
  });

  // Verificar URLs únicas
  const urls = tableQRs.map(qr => qr.paymentUrl);
  const urlsUnicas = [...new Set(urls)];

  console.log('\n3. Análisis de URLs:');
  console.log(`   Total de QRs: ${urls.length}`);
  console.log(`   URLs únicas: ${urlsUnicas.length}`);

  if (urls.length !== urlsUnicas.length) {
    console.error('\n❌ PROBLEMA DETECTADO: URLs duplicadas!');

    // Encontrar y mostrar duplicados
    const urlCount = {};
    urls.forEach(url => {
      urlCount[url] = (urlCount[url] || 0) + 1;
    });

    Object.entries(urlCount)
      .filter(([url, count]) => count > 1)
      .forEach(([url, count]) => {
        console.error(`   URL duplicada ${count} veces: ${url}`);
      });

    // Mostrar qué mesas tienen URLs duplicadas
    const duplicateUrls = Object.keys(urlCount).filter(url => urlCount[url] > 1);
    duplicateUrls.forEach(url => {
      const mesasConUrl = tableQRs
        .filter(qr => qr.paymentUrl === url)
        .map(qr => `Mesa ${qr.mesa_numero}`);
      console.error(`   Mesas con URL duplicada: ${mesasConUrl.join(', ')}`);
    });
  } else {
    console.log('✅ Todas las URLs son únicas - Sistema funcionando correctamente');
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