# Simulador de Algoritmos - Ciencias de la Computación II

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 📋 Descripción

El **Simulador de Algoritmos de Ciencias de la Computación II** es una aplicación web interactiva diseñada para facilitar el aprendizaje y visualización de algoritmos fundamentales en estructuras de datos. Desarrollado como herramienta educativa, permite a estudiantes y profesores explorar conceptos complejos mediante simulaciones prácticas en tiempo real.

## ✨ Características Principales

- 🎯 **Interfaz Intuitiva**: Navegación por pestañas con diseño responsivo
- 🔍 **Visualizaciones Interactivas**: Canvas SVG con zoom, pan y drag-and-drop
- 📊 **Terminal Integrado**: Logging detallado de todas las operaciones
- 💾 **Persistencia de Datos**: Importación/Exportación en formato CSV
- 🎨 **Tema Claro Optimizado**: Diseño limpio y profesional
- ⚡ **Sin Dependencias Externas**: Funciona completamente offline

## 🚀 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Visualización**: SVG, Canvas HTML5
- **Estilos**: CSS Grid, Flexbox, CSS Variables
- **Persistencia**: LocalStorage, CSV Import/Export
- **Arquitectura**: Modular MVC adaptado para JavaScript

## 📁 Estructura del Proyecto

```
simulador-algoritmos-cc2/
├── index.html              # Archivo principal de la aplicación
├── style.css              # Estilos globales y componentes
├── app.js                 # Lógica principal y algoritmos
├── README.md              # Documentación del proyecto
├── Manual-Tecnico.md      # Manual técnico detallado
└── Manual-Usuario.md      # Guía de usuario completa
```

## 🛠️ Instalación y Uso

### Prerrequisitos
- Navegador web moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript habilitado

### Instalación
1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/usuario/simulador-algoritmos-cc2.git
   cd simulador-algoritmos-cc2
   ```

2. **Abrir la aplicación**
   - Abrir `index.html` en su navegador web preferido
   - No requiere servidor web ni instalación adicional

### Uso Rápido
1. Seleccione una pestaña del módulo deseado
2. Haga clic en el algoritmo a simular
3. Configure los parámetros en la ventana modal
4. Inicialice la estructura y comience a experimentar

## 📚 Módulos Implementados

### 🔍 Búsquedas Internas
Algoritmos de búsqueda con indexación desde 1 y prevención de duplicados:

- **Búsqueda Lineal**: Recorrido secuencial O(n)
- **Búsqueda Binaria**: División del espacio O(log n)
- **Hash Mod**: Función hash básica `(clave % tamaño) + 1`
- **Hash Cuadrado**: Método de cuadrado medio
- **Hash Plegamiento**: Suma de grupos de dígitos
- **Hash Truncamiento**: Extracción de posiciones específicas

#### Métodos de Resolución de Colisiones
- Sondeo Lineal con comportamiento circular
- Sondeo Cuadrático con incrementos (1², 2², 3²...)
- Estructuras Anidadas con columnas completas
- Estructuras Enlazadas con nodos selectivos

### 🌳 Árboles
Algoritmos de árboles con canvas interactivo y operaciones completas:

- **Árboles Digitales**: Últimos 5 bits del código ASCII
- **Árboles por Residuos Particular**: Módulo fijo definido por usuario
- **Árboles por Residuos Múltiples**: M bits por rama con 2^M enlaces
- **Árboles de Huffman**: Codificación por frecuencias con proceso completo

#### Características del Canvas
- **Zoom**: Rueda del ratón (0.5x a 3.0x)
- **Pan**: Click izquierdo + arrastrar
- **Drag-and-Drop**: Click derecho para reubicar nodos
- **Colores**: Azul (0/izquierda), Rojo (1/derecha), Verde (inserción)

### 📦 Búsquedas Externas
Algoritmos adaptados para manejo por bloques con fórmula √(n):

- **Cálculo de Bloques**: `√(n)` redondeado hacia abajo
- **Búsqueda Lineal por Bloques**: Entre y dentro de bloques
- **Búsqueda Binaria por Bloques**: Búsqueda binaria aplicada a bloques
- **Funciones Hash por Bloques**: Todas las funciones hash adaptadas

### ⚡ Estructuras Dinámicas
Hashing dinámico con monitoreo automático de densidad:

- **Expansión Total**: `T = 2^i * N` (duplicación de cubetas)
- **Expansión Parcial**: `T = 1.5^i * N` (incremento del 50%)
- **Monitoreo de Densidad**: Cálculo automático y expansión/contracción
- **Visualización**: Cubetas con estados coloreados

### 📇 Índices
Simulación de estructuras de índices con cálculos matemáticos:

- **Índice Primario**: Un registro por bloque de datos
- **Índice Secundario**: Un registro por registro de datos
- **Multinivel Primario**: Múltiples niveles basados en estructura primaria
- **Multinivel Secundario**: Múltiples niveles basados en estructura secundaria

#### Fórmulas Implementadas
```
brf = ⌊B/r⌋     (registros por bloque)
b = ⌈r/brf⌉     (bloques de datos)
bfri = ⌊B/Ri⌋   (entradas de índice por bloque)
```

### 🔗 Grafos
Operaciones de teoría de grafos con dos escenarios principales:

#### Operaciones de Conjuntos (G₁ y G₂')
- **Unión**: `G₁ ∪ G₂'`
- **Intersección**: `G₁ ∩ G₂'`
- **Suma Anillo**: `G₁ ⊕ G₂'`

#### Operaciones de Producto (G₁ y G₂)
- **Producto Cartesiano**: `G₁ × G₂`
- **Producto Tensorial**: `G₁ ⊗ G₂`
- **Composición**: `G₁ ∘ G₂`

## 🧪 Casos de Prueba Integrados

### Hash Plegamiento (grupos de 3 cifras)
| Clave | Cálculo | Resultado |
|-------|---------|-----------|
| 10203040 | 102+030+40 = 172 | 173 |
| 25303540 | 253+035+40 = 328 | 329 |
| 50153028 | 501+530+28 = 1059 | 60 |

### Hash Truncamiento (posiciones 1,4,7)
| Clave | Extracción | Resultado |
|-------|------------|-----------|
| 10203040 | 1,0,4 → 104 | 105 |
| 25303540 | 2,0,4 → 204 | 205 |
| 50153028 | 5,5,2 → 552 | 553 |

### Huffman - Ejemplo "JULIO"
```
Proceso de Fusión:
J(1) + U(1) = 2
L(1) + I(1) = 2
O(1) + JU(2) = 3
LI(2) + OJU(3) = 5
```

## 💡 Ejemplos de Uso

### Búsqueda Lineal
```javascript
// Configuración
Tamaño: 10
Longitud de clave: 2

// Operaciones
Insertar: "25" → Índice 1
Buscar: "25" → Encontrado en índice 1
Eliminar: "25" → Eliminado del índice 1
```

### Árboles Digitales
```javascript
// Mensaje: "PRUEBA"
P (ASCII 80) → 10000 → Raíz
R (ASCII 82) → 10010 → Derecha de P
U (ASCII 85) → 10101 → Izquierda de R
E (ASCII 69) → 00101 → Izquierda de P
// ...
```

### Hash Plegamiento
```javascript
// Configuración
Clave: "10203040"
Grupos de: 3 cifras

// Proceso
102 + 030 + 40 = 172
(172 % tamaño) + 1 = resultado
```

## 🎯 Características Educativas

### Terminal Integrado
- **Logging en tiempo real** de todas las operaciones
- **Símbolos de estado**: ✓ (éxito), ✗ (error), ⚠ (advertencia), ℹ (información)
- **Timestamps** detallados para seguimiento
- **Cálculos paso a paso** para comprensión completa

### Validaciones Automáticas
- **Prevención de duplicados** en todas las estructuras
- **Validación de formato** y rangos de entrada
- **Mensajes informativos** para errores y advertencias
- **Confirmaciones de seguridad** para operaciones destructivas

### Persistencia de Datos
- **Exportación CSV** de configuraciones y datos
- **Importación CSV** para restaurar estados
- **Formato compatible** con Excel y hojas de cálculo
- **Validación de integridad** durante importación

## 🔧 Configuración Avanzada

### Personalización de Algoritmos
- **Hash Plegamiento**: Configurable número de cifras por grupo
- **Hash Truncamiento**: Posiciones específicas de dígitos
- **Residuos Múltiples**: M bits por rama (1-5)
- **Estructuras Dinámicas**: Umbrales de densidad personalizables

### Optimizaciones
- **Lazy Loading**: Carga bajo demanda de componentes
- **Event Debouncing**: Optimización de eventos de usuario
- **Memory Management**: Limpieza automática de referencias
- **Responsive Design**: Adaptación a múltiples dispositivos

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- 💻 **Desktop**: Experiencia completa
- 📱 **Móvil**: Funcionalidad adaptada con controles táctiles
- 📱 **Tablet**: Interfaz optimizada para pantallas medianas

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- **JavaScript ES6+** con sintaxis moderna
- **CSS**: Uso de variables CSS y metodología BEM
- **HTML5**: Semántica correcta y accesibilidad
- **Comentarios**: Documentación clara en código

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Equipo de Desarrollo** - *Trabajo inicial* - [Simulador Algoritmos CC2]

## 🙏 Agradecimientos

- Inspirado en algoritmos clásicos de Ciencias de la Computación
- Comunidad educativa por feedback y sugerencias
- Recursos de MDN Web Docs y W3C para estándares web

## 📞 Soporte

¿Tienes preguntas o necesitas ayuda?

- 📧 **Email**: soporte@simulador-cc2.edu
- 📖 **Documentación**: Ver Manual de Usuario y Manual Técnico
- 🐛 **Issues**: Reportar problemas en GitHub Issues
- 💬 **Discusiones**: Únete a GitHub Discussions

---

⭐ **¡Si este proyecto te ha sido útil, por favor dale una estrella!** ⭐

---

*Desarrollado con ❤️ para la educación en Ciencias de la Computación*
