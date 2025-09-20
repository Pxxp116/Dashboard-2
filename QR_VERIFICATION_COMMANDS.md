# QR Code Verification Commands

## Commands to run in the browser console after implementing the fix:

### 1. Verify QR URLs are unique
```javascript
// Run this in the browser console to check QR URLs
const verificarQRs = () => {
  const qrs = document.querySelectorAll('[data-qr-url]');
  const urls = Array.from(qrs).map(el => el.dataset.qrUrl);
  console.log('URLs encontradas:', urls);
  console.log('URLs únicas:', [...new Set(urls)]);
  return urls.length === [...new Set(urls)].length ? '✅ OK' : '❌ DUPLICADOS';
};
verificarQRs();
```

### 2. Test QR generation manually
```javascript
// Test the QR generation functions directly
import { generateTableQR, validateTableQRs } from './src/utils/tableQRGenerator.js';
import { debugQRGeneration } from './src/utils/qrDebugger.js';

// Example test mesas
const testMesas = [
  { id: 1, numero: 1, capacidad: 4 },
  { id: 2, numero: 2, capacidad: 6 },
  { id: 3, numero: 3, capacidad: 2 }
];

// Generate QRs
const qrs = testMesas.map(mesa => generateTableQR(mesa));

// Debug and validate
debugQRGeneration(testMesas, qrs);
console.log('Validation result:', validateTableQRs(qrs));
```

### 3. Check console logs during QR generation
When you click "Generar QRs para todas las mesas", watch the console for these logs:
- `🚀 Iniciando generación de QRs para todas las mesas`
- `🎯 Generando QR para Mesa X (ID: Y)`
- `   URL generada: https://gastrobot.com/mesa/X/pago`
- `✅ Todas las URLs son únicas - Sistema funcionando correctamente`

### 4. Expected URL format
Each mesa should have a unique URL like:
- Mesa 1: `https://gastrobot.com/mesa/1/pago`
- Mesa 2: `https://gastrobot.com/mesa/2/pago`
- Mesa 3: `https://gastrobot.com/mesa/3/pago`

## Troubleshooting

If you see:
- `❌ ADVERTENCIA: Se detectaron URLs duplicadas en los QR`
- `❌ ERROR CRÍTICO: IDs duplicados detectados`

Then check your mesa data structure for missing or duplicate IDs.

## Testing Steps

1. Clear browser cache (Ctrl+Shift+Delete)
2. Open browser console (F12)
3. Navigate to Dashboard → QR section
4. Click "Generar QRs para todas las mesas"
5. Watch console output for validation messages
6. Test scan 2-3 different QRs to verify they lead to different payment pages