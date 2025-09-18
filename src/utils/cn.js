/**
 * @fileoverview Utilidad para combinar classNames de forma condicional
 * Alternativa ligera a la librería clsx para combinar clases CSS
 */

/**
 * Combina classNames de forma condicional
 * @param {...any} classes - Las clases a combinar
 * @returns {string} String con las clases combinadas
 *
 * @example
 * cn('base-class', condition && 'conditional-class', 'another-class')
 * cn('btn', variant === 'primary' && 'btn-primary', disabled && 'opacity-50')
 */
export function cn(...classes) {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();
}

export default cn;