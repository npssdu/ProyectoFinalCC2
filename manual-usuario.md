# Manual de Usuario

## 1. Introducción

¡Bienvenido al **Simulador de Algoritmos de Ciencias de la Computación II**! Esta herramienta web le permite experimentar de forma visual con algoritmos clásicos de búsqueda, hashing, estructuras de árboles, sistemas de índices y grafos.

---

## 2. Requisitos del Sistema
| Requisito | Mínimo |
|-----------|--------|
| Navegador | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| Resolución | 1024 × 768 (recomendado ≥ 1920 × 1080) |
| JavaScript | Habilitado |
| Conexión | No necesaria tras cargar `index.html` |

---

## 3. La Interfaz en un Vistazo
```
┌──────────────────────────────────────────────┐
│ Header: Título & Tema Claro                  │
├──────────────────────────────────────────────┤
│ Pestañas: Internas · Árboles · Externas ...  │
├──────────────────────────────────────────────┤
│ Panel de Algoritmos (tarjetas)               │
└──────────────────────────────────────────────┘
```
1. **Header**: muestra el título y el tema activo (solo tema claro).
2. **Barra de pestañas**: navegue entre módulos.
3. **Tarjetas**: cada tarjeta abre un simulador en una ventana emergente.

---

## 4. Flujos Básicos por Módulo

### 4.1 Búsquedas Internas
1. Haga clic en la pestaña **Búsquedas Internas**.
2. Elija un algoritmo (p. ej. *Búsqueda Lineal*) → “Abrir Simulador”.
3. En la modal:
   1. Complete *Tamaño de la estructura* y *Longitud de la clave*.
   2. Presione **Inicializar Estructura**.
   3. Use los botones *Insertar*, *Buscar*, *Eliminar* y *Ordenar*.
4. Observe la estructura vertical (índices desde 1) y la consola de eventos.

### 4.2 Árboles
1. Seleccione **Árboles** → tarjeta *Árboles Digitales*.
2. Ingrese un mensaje (ej. “PRUEBA”) y pulse **Construir Árbol**.
3. Explore el canvas:
   * Rueda 🖱️ = Zoom.
   * Click izq + arrastrar = Mover vista.
   * Click der + arrastrar = Reubicar nodo.
4. Inserte/busque/elimine letras con los botones laterales.

### 4.3 Búsquedas Externas
1. Abra la tarjeta *Búsqueda Lineal (Bloques)*.
2. Defina *n* (≥ 4) y longitud de clave.
3. **Inicializar Estructura** → la app calcula √(n) bloques.
4. Inserte claves y observe su ubicación en bloques.

### 4.4 Estructuras Dinámicas
1. Tarjeta *Expansión Total*.
2. Ingrese cubetas (N), registros (R), DO máx y de reducción.
3. **Inicializar** → aparece la rejilla de cubetas.
4. Inserte claves hasta superar el % máx → la app duplica cubetas.

### 4.5 Índices
1. Tarjeta *Índice Primario*.
2. Ajuste registros, tamaños y **Calcular Estructura**.
3. Revise fórmulas paso a paso.
4. Ingrese un registro y **Simular Búsqueda** para ver accesos.

### 4.6 Grafos
1. Pestaña **Grafos**.
2. Elija *Operaciones de Conjuntos* o *Producto*.
3. Ingrese vértices `a,b,c` y aristas `a-b,b-c`.
4. **Actualizar y Calcular** → se muestran los resultados de cada operación.

---

## 5. Controles del Canvas (Árboles)
| Acción | Mouse |
|--------|-------|
| Zoom | Rueda |
| Pan | Click izq + arrastrar |
| Reubicar Nodo | Click der + arrastrar |

---

## 6. Importar / Exportar CSV
* **Guardar CSV**: descarga la configuración y estado actual.
* **Importar CSV**: restaura un estado guardado.

> Consejo: use esta función para preparar demostraciones y compartir ejemplos con estudiantes.

---

## 7. Leyenda de Colores
| Color | Significado |
|-------|-------------|
| 🟩 Verde | Inserción exitosa / nodo hoja |
| 🟦 Azul claro | Resultado de búsqueda |
| 🟥 Rojo | Colisión o error |
| 🟧 Naranja | Bloque / cubeta activa |

---

## 8. Resolución de Problemas
| Mensaje / Situación | Solución |
|---------------------|-----------|
| “Estructura no inicializada” | Complete la configuración y pulse *Inicializar*. |
| Clave duplicada | Use un valor diferente; las claves deben ser únicas. |
| Canvas no responde | Refresque la página o verifique compatibilidad del navegador. |

---

## 9. Preguntas Frecuentes (FAQ)
**P: Cuántos elementos puedo simular?**  
R: Hasta 10 000 en búsquedas internas; mayores valores pueden afectar rendimiento.

**P: Se puede cambiar a tema oscuro?**  
R: Esta versión sólo incluye tema claro. Extienda `style.css` para personalizar.

---

## 10. Créditos y Licencia
Desarrollado por el equipo CC2 · 2025.  
Licencia MIT.
