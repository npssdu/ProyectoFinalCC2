# Manual Técnico

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Módulos y Algoritmos](#módulos-y-algoritmos)
6. [Patrones de Diseño](#patrones-de-diseño)
7. [Instalación y Despliegue](#instalación-y-despliegue)
8. [Guía de Desarrollo](#guía-de-desarrollo)
9. [Pruebas y Casos de Uso](#pruebas-y-casos-de-uso)
10. [Mantenimiento y Extensión](#mantenimiento-y-extensión)

---

## Introducción
El **Simulador de Algoritmos de Ciencias de la Computación II** es una aplicación web desarrollada para la enseñanza y visualización interactiva de algoritmos clásicos de búsqueda, funciones hash, estructuras de árboles, búsquedas externas por bloques, hashing dinámico, sistemas de índices y operaciones de teoría de grafos.

---

## Arquitectura General
```
┌──────────────────────────────────────────┐
│                 Front-End               │
│  (HTML5 · CSS3 · JavaScript ES6⁺)        │
├──────────────────────────────────────────┤
│   Módulos de Algoritmos (Modular MVC)    │
├──────────────────────────────────────────┤
│  Visualización SVG · Canvas Interactivo  │
└──────────────────────────────────────────┘
```

* **Patrón MVC interno:** cada algoritmo posee Modelo (lógica), Vista (SVG/DOM) y Controlador (eventos).
* **Estado global:** gestionado por la clase `AppState`.
* **Logging:** componente `Terminal` in-app con niveles ✓ ✗ ⚠ ℹ.

---

## Tecnologías Utilizadas
| Capa | Librería / Estándar | Uso |
|------|---------------------|-----|
| UI   | HTML5 / CSS3 Grid & Flexbox | Maquetación y estilos responsive |
| Lógica | JavaScript ES6⁺ (sin frameworks) | Algoritmos y manipulación DOM |
| Visualización | SVG nativo / Canvas | Árboles, grafos y canvas interactivo |
| Persistencia | LocalStorage + CSV | Guardar/recuperar configuraciones |
| Build | Vanilla (no bundler) | Puede alojarse como página estática |

---

## Estructura del Proyecto
```
📁 simulador-algoritmos-cc2/
├─ index.html          # archivo raíz
├─ style.css           # estilos globales (tema claro)
├─ app.js              # lógica principal y módulos
└─ assets/             # (opcional) imágenes o descargas
```

---

## Módulos y Algoritmos
### 1. Búsquedas Internas
- **Lineal:** O(n) – recorrido secuencial.
- **Binaria:** O(log n) – requiere ordenamiento previo.
- **Hash Mod / Square / Folding / Truncation**
  - **Colisiones:** sondeo lineal, sondeo cuadrático, estructuras anidadas, estructuras enlazadas.

### 2. Árboles
- **Digitales:** últimos 5 bits (0=izq, 1=der).
- **Residuos Particular:** módulo fijo.
- **Residuos Múltiples:** segmentos de m bits → 2^m ramas.
- **Huffman:** construcción por frecuencias, generación de códigos.

### 3. Búsquedas Externas
- Estructura por bloques: √(n) bloques, ⌊n/√(n)⌋ elementos/bloque.
- Algoritmos adaptados + Hash por bloques.

### 4. Estructuras Dinámicas
- **Expansión Total:** T = 2^i·N.
- **Expansión Parcial:** T = 1.5^i·N.
- Umbrales DO max / DO reducción.

### 5. Índices
- Primario, Secundario, Multinivel Primario/Secundario.
- Fórmulas: `brf`, `bfri`, niveles, accesos.

### 6. Grafos
- Conjuntos: Unión, Intersección, Suma Anillo.
- Productos: Cartesiano, Tensorial, Composición.

---

## Patrones de Diseño
* **Modularidad estricta:** cada algoritmo vive en su propio namespace.
* **Factory de Modales:** `ModalContentGenerator` construye la UI dinámicamente.
* **Observer-Like:** controladores se suscriben a eventos DOM.

---

## Instalación y Despliegue
1. Clonar el repositorio o descargar ZIP.
2. Abrir `index.html` en cualquier navegador moderno.
3. (Opcional) Servir con un servidor estático: `npx serve .`.

No se requieren dependencias externas ni backend.

---

## Guía de Desarrollo
* **Añadir Algoritmo Nuevo**
  1. Crear clase en `app.js` (modelo y lógica).
  2. Añadir tarjeta en la pestaña correspondiente (`index.html`).
  3. Generar plantilla en `ModalContentGenerator`.
  4. Registrar manejadores en `AlgorithmHandlers`.

* **Estilos**: Todas las variables CSS están centralizadas en `:root`.

---

## Pruebas y Casos de Uso
* **Hash Plegamiento:** ver tabla de claves de prueba (resultado esperado en terminal).
* **Árbol Huffman con “JULIO”** muestra 4 fusiones y árbol final.
* **Estructura Dinámica:** insertar hasta superar 75 % para gatillar expansión.

---

## Mantenimiento y Extensión
* **Refactorizar**: mantener separación MVC.
* **Accesibilidad**: garantizar contraste de colores.
* **Escalabilidad**: UI auto-ajustable vía Grid y Flex.
* **Tema Oscuro**: agregar CSS variables y selector.

---

© 2025 — Simulador CC2 v1.0
