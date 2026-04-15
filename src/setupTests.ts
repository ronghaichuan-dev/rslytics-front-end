import '@testing-library/jest-dom';

// Polyfill window.matchMedia for antd components (Row, Col, etc.)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Polyfill window.getComputedStyle for antd
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
  if (pseudoElt) {
    return {} as CSSStyleDeclaration;
  }
  return originalGetComputedStyle(elt);
};
