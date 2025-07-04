/* app.js - Simulador de Algoritmos CCII */

/***************************************************
 * UTILIDADES GENERALES                           *
 ***************************************************/
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function timestamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return `[${date} ${time}]`;
}

function logToTerminal(terminalEl, message, status = 'info') {
  if (!terminalEl) return;
  const symbols = { info: 'ℹ', success: '✓', error: '✗', warn: '⚠' };
  terminalEl.textContent += `${timestamp()} ${symbols[status] || ''} ${message}\n`;
  terminalEl.scrollTop = terminalEl.scrollHeight;
}

/***************************************************
 * GESTIÓN DE TABS Y TEMA                          *
 ***************************************************/
(function initTabs() {
  const tabBtns = $$('.tab-btn');
  const tabContents = $$('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      // Activa botón
      tabBtns.forEach(b => b.classList.toggle('active', b === btn));
      // Activa contenido
      tabContents.forEach(c => c.classList.toggle('active', c.id === target));
    });
  });
})();

(function initThemeToggle() {
  const toggleBtn = $('#theme-toggle');
  let current = 'light';
  
  // Add smooth transition
  document.documentElement.style.transition = 'color 0.3s ease, background-color 0.3s ease';
  
  const applyTheme = () => {
    document.documentElement.setAttribute('data-color-scheme', current);
    const themeIcon = $('.theme-icon', toggleBtn);
    if (themeIcon) {
      themeIcon.textContent = current === 'light' ? '🌙' : '☀️';
    }
  };
  
  applyTheme();
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      current = current === 'light' ? 'dark' : 'light';
      applyTheme();
    });
  }
})();

/***************************************************
 * GESTIÓN DE MODALES                              *
 ***************************************************/
(function initModals() {
  const algorithmBtns = $$('.algorithm-btn');
  const modalHuffman = $('#modal-arboles-huffman');
  const modalExternas = $('#modal-externas');
  const modalEstructuras = $('#modal-estructuras-dinamicas');
  const modalIndices = $('#modal-indices');
  const modalGeneric = $('#modal-generic');

  const openModal = modal => {
    if (modal) modal.classList.add('active');
  };
  const closeModal = modal => {
    if (modal) modal.classList.remove('active');
  };

  // Cierra con click en overlay
  $$('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal);
    });
    const closeBtn = $('.modal__close', modal);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }
  });

  algorithmBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const algo = btn.dataset.algorithm;
      const title = btn.querySelector('h3')?.textContent || 'Algoritmo';
      
      if (algo === 'arboles-huffman') {
        openModal(modalHuffman);
      } else if (algo.startsWith('ext-')) {
        // Algoritmos de búsquedas externas
        const titleEl = $('#externas-modal-title');
        if (titleEl) titleEl.textContent = title;
        initExternalSearchModal(algo);
        openModal(modalExternas);
      } else if (algo.startsWith('expansion-')) {
        // Algoritmos de estructuras dinámicas
        const titleEl = $('#estructuras-modal-title');
        if (titleEl) titleEl.textContent = title;
        initDynamicStructuresModal(algo);
        openModal(modalEstructuras);
      } else if (algo.startsWith('indice-') || algo.startsWith('multinivel-')) {
        // Algoritmos de índices
        const titleEl = $('#indices-modal-title');
        if (titleEl) titleEl.textContent = title;
        initIndicesModal(algo);
        openModal(modalIndices);
      } else {
        const titleEl = $('#modal-title');
        const inputsEl = $('#algorithm-inputs');
        const displayEl = $('#algorithm-display');
        const terminalEl = $('#algorithm-terminal');
        
        if (titleEl) titleEl.textContent = title;
        if (inputsEl) inputsEl.innerHTML = `<p>Próximamente disponible…</p>`;
        if (displayEl) displayEl.innerHTML = '';
        if (terminalEl) terminalEl.innerHTML = '';
        openModal(modalGeneric);
      }
    });
  });
})();

/***************************************************
 * HUFFMAN TREE IMPLEMENTATION                     *
 ***************************************************/
class HuffmanNode {
  constructor(char, freq, order) {
    this.char = char; // undefined para nodo interno
    this.freq = freq;
    this.order = order; // usado para desempatar
    this.left = null;
    this.right = null;
    // Coordenadas para SVG
    this.x = 0;
    this.y = 0;
    this.id = `n${HuffmanNode._idCnt++}`;
  }
}
HuffmanNode._idCnt = 0;

(function initHuffman() {
  // Elementos DOM
  const messageInput = $('#huffman-message');
  const buildBtn = $('#huffman-build');
  const keyInput = $('#huffman-key');
  const insertBtn = $('#huffman-insert');
  const searchBtn = $('#huffman-search');
  const deleteBtn = $('#huffman-delete');
  const resetBtn = $('#huffman-reset');
  const terminal = $('#huffman-terminal');
  const svg = $('#huffman-canvas');
  const zoomLevelSpan = $('#zoom-level');
  const zoomResetBtn = $('#zoom-reset');
  const exportBtn = $('#huffman-export');
  const importBtn = $('#huffman-import-btn');
  const importInput = $('#huffman-import');

  let state = {
    message: '',
    root: null,
    scale: 1,
    translateX: 0,
    translateY: 0,
    draggingNode: null,
    panStart: null
  };

  /************* ALGORITMO PRINCIPAL **************/
  function buildTreeFromMessage(msg) {
    if (!msg) return null;
    const freqMap = new Map();
    const orderMap = new Map();
    let orderCounter = 0;
    for (const ch of msg) {
      freqMap.set(ch, (freqMap.get(ch) || 0) + 1);
      if (!orderMap.has(ch)) orderMap.set(ch, orderCounter++);
    }

    // Crear nodos hoja
    let queue = [];
    for (const [ch, freq] of freqMap.entries()) {
      queue.push(new HuffmanNode(ch, freq, orderMap.get(ch)));
    }

    queue.sort(compareNodes);

    // Mostrar tabla inicial en terminal
    if (terminal) {
      terminal.innerHTML = '';
      logToTerminal(terminal, 'Tabla inicial: Ki  fi  Pi', 'info');
      const total = msg.length;
      queue.forEach(n => {
        logToTerminal(
          terminal,
          `${n.char}    ${n.freq}    ${(n.freq / total).toFixed(3)}`,
          'info'
        );
      });
    }

    // Proceso iterativo
    while (queue.length > 1) {
      const n1 = queue.shift();
      const n2 = queue.shift();
      const parent = new HuffmanNode(undefined, n1.freq + n2.freq, Math.min(n1.order, n2.order));
      parent.left = n1;
      parent.right = n2;
      if (terminal) {
        logToTerminal(terminal, `Se fusionan ${formatNode(n1)} + ${formatNode(n2)} = ${parent.freq}`, 'success');
      }
      queue.push(parent);
      queue.sort(compareNodes);
    }

    return queue[0];

    function formatNode(n) {
      return `${n.char ? n.char : 'N'}(${n.freq.toFixed(1)})`;
    }

    function compareNodes(a, b) {
      if (a.freq === b.freq) return a.order - b.order;
      return a.freq - b.freq;
    }
  }

  /************* LAYOUT DEL ÁRBOL **************/
  function computePositions(root) {
    // Obtiene profundidad máxima y posición X mediante recorrido inorden
    let maxDepth = 0;
    let xCounter = 0;
    const xGap = 60;
    const yGap = 80;

    (function inOrder(node, depth) {
      if (!node) return;
      maxDepth = Math.max(maxDepth, depth);
      inOrder(node.left, depth + 1);
      node.x = xCounter++ * xGap;
      node.y = depth * yGap;
      inOrder(node.right, depth + 1);
    })(root, 0);

    // Centrar árbol en canvas
    const width = (xCounter - 1) * xGap;
    const height = (maxDepth + 1) * yGap;
    return { width, height };
  }

  /************* RENDERIZADO SVG **************/
  function renderTree(root) {
    if (!svg) return;
    
    svg.innerHTML = '';
    if (!root) return;

    const { width, height } = computePositions(root);

    // Crear grupo principal para permitir transformaciones
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', 'tree-group');
    svg.appendChild(g);

    // Recorrido para dibujar enlaces primero
    (function drawLinks(node) {
      if (!node) return;
      if (node.left) {
        createLink(node, node.left, '0');
        drawLinks(node.left);
      }
      if (node.right) {
        createLink(node, node.right, '1');
        drawLinks(node.right);
      }
    })(root);

    // Recorrido para dibujar nodos
    drawNodes(root);

    // Ajustar viewBox
    const margin = 60;
    svg.setAttribute('viewBox', `${-margin} ${-margin} ${width + margin * 2} ${height + margin * 2}`);
    updateTransform();

    function drawNodes(node) {
      if (!node) return;
      // Node group
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('class', 'tree-node-group');
      nodeGroup.setAttribute('data-id', node.id);
      g.appendChild(nodeGroup);

      // Shape circle or ellipse
      const shape = document.createElementNS('http://www.w3.org/2000/svg', node.char ? 'circle' : 'ellipse');
      if (node.char) {
        shape.setAttribute('r', 18);
      } else {
        shape.setAttribute('rx', 24);
        shape.setAttribute('ry', 18);
      }
      shape.classList.add('tree-node');
      shape.classList.add(node.char ? 'leaf' : 'internal');
      if (node === root) shape.classList.add('root');
      shape.setAttribute('cx', node.x);
      shape.setAttribute('cy', node.y);
      nodeGroup.appendChild(shape);

      // Label char o frecuencia
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', node.x);
      label.setAttribute('y', node.y + 4);
      label.setAttribute('class', 'tree-label');
      label.textContent = node.char || node.freq;
      nodeGroup.appendChild(label);

      // Probabilidad encima
      const probText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      probText.setAttribute('x', node.x);
      probText.setAttribute('y', node.y - 22);
      probText.setAttribute('class', 'tree-prob');
      probText.textContent = (node.freq / state.message.length).toFixed(2);
      nodeGroup.appendChild(probText);

      drawNodes(node.left);
      drawNodes(node.right);
    }

    function createLink(parent, child, bit) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', parent.x);
      line.setAttribute('y1', parent.y);
      line.setAttribute('x2', child.x);
      line.setAttribute('y2', child.y);
      line.setAttribute('class', 'tree-link');
      g.appendChild(line);

      // Edge label en punto medio
      const midX = (parent.x + child.x) / 2;
      const midY = (parent.y + child.y) / 2;
      const edgeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      edgeLabel.setAttribute('x', midX);
      edgeLabel.setAttribute('y', midY - 4);
      edgeLabel.setAttribute('class', 'tree-edge-label');
      edgeLabel.textContent = bit;
      g.appendChild(edgeLabel);
    }
  }

  /************* ZOOM & PAN **************/
  function updateTransform() {
    const g = $('#tree-group');
    if (!g) return;
    g.setAttribute('transform', `translate(${state.translateX} ${state.translateY}) scale(${state.scale})`);
    if (zoomLevelSpan) {
      zoomLevelSpan.textContent = `${state.scale.toFixed(1)}x`;
    }
  }

  if (svg) {
    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = -e.deltaY / 500; // scroll up = zoom in
      state.scale = Math.min(3, Math.max(0.5, state.scale + delta));
      updateTransform();
    });

    svg.addEventListener('mousedown', e => {
      if (e.button !== 0) return; // sólo pan con botón izquierdo
      state.panStart = { x: e.clientX, y: e.clientY, sx: state.translateX, sy: state.translateY };
    });
    
    svg.addEventListener('mousemove', e => {
      if (state.panStart) {
        const dx = (e.clientX - state.panStart.x);
        const dy = (e.clientY - state.panStart.y);
        state.translateX = state.panStart.sx + dx;
        state.translateY = state.panStart.sy + dy;
        updateTransform();
      }
    });
    
    svg.addEventListener('mouseup', () => (state.panStart = null));
    svg.addEventListener('mouseleave', () => (state.panStart = null));
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => {
      state.scale = 1;
      state.translateX = 0;
      state.translateY = 0;
      updateTransform();
    });
  }

  /************* OPERACIONES **************/
  function rebuild(currentMsg) {
    state.message = currentMsg;
    state.root = buildTreeFromMessage(currentMsg);
    renderTree(state.root);
  }

  if (buildBtn) {
    buildBtn.addEventListener('click', () => {
      const msg = messageInput?.value.trim().toUpperCase() || '';
      if (!msg) {
        logToTerminal(terminal, 'El mensaje está vacío', 'error');
        return;
      }
      rebuild(msg);
      logToTerminal(terminal, 'Árbol construido correctamente', 'success');
    });
  }

  if (insertBtn) {
    insertBtn.addEventListener('click', () => {
      const ch = keyInput?.value.trim().toUpperCase() || '';
      if (!ch) return;
      state.message += ch;
      rebuild(state.message);
      logToTerminal(terminal, `Insertado '${ch}'`, 'success');
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const ch = keyInput?.value.trim().toUpperCase() || '';
      if (!ch) return;
      const regex = new RegExp(ch, 'g');
      const newMsg = state.message.replace(regex, '');
      if (newMsg === state.message) {
        logToTerminal(terminal, `Carácter '${ch}' no encontrado`, 'warn');
        return;
      }
      rebuild(newMsg);
      logToTerminal(terminal, `Eliminado '${ch}'`, 'success');
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const ch = keyInput?.value.trim().toUpperCase() || '';
      if (!ch) return;
      // Buscar hoja
      const targetNode = findNode(state.root, n => n.char === ch);
      if (targetNode) {
        highlightNode(targetNode);
        logToTerminal(terminal, `Encontrado '${ch}' con frecuencia ${targetNode.freq}`, 'success');
      } else {
        logToTerminal(terminal, `Carácter '${ch}' no encontrado`, 'error');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.message = '';
      state.root = null;
      if (svg) svg.innerHTML = '';
      if (terminal) terminal.innerHTML = '';
      if (messageInput) messageInput.value = '';
      if (keyInput) keyInput.value = '';
      logToTerminal(terminal, 'Estado reseteado', 'info');
    });
  }

  function findNode(node, predicate) {
    if (!node) return null;
    if (predicate(node)) return node;
    return findNode(node.left, predicate) || findNode(node.right, predicate);
  }

  function highlightNode(target) {
    // Volver a dibujar con node marcado
    (function traverse(node) {
      if (!node) return;
      if (node === target) node._highlight = true;
      else node._highlight = false;
      traverse(node.left);
      traverse(node.right);
    })(state.root);

    // Render
    renderTree(state.root);
  }

  /************* CSV I/O **************/
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (!state.message) {
        logToTerminal(terminal, 'Nada que exportar', 'warn');
        return;
      }
      const csvLines = [];
      csvLines.push('#CONSOLA');
      csvLines.push(terminal?.textContent.trim().replace(/\n/g, '\\n') || '');
      csvLines.push('#ARBOL');
      csvLines.push(state.message);
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'huffman.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      logToTerminal(terminal, 'Exportado a CSV', 'success');
    });
  }

  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());

    importInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const content = ev.target.result;
        const sections = content.split(/#CONSOLA|#ARBOL/).map(s => s.trim()).filter(Boolean);
        if (sections.length < 2) {
          logToTerminal(terminal, 'Formato CSV inválido', 'error');
          return;
        }
        if (terminal) terminal.textContent = sections[0].replace(/\\n/g, '\n') + '\n';
        const msg = sections[1].replace(/[^A-Za-z]/g, '').toUpperCase();
        if (messageInput) messageInput.value = msg;
        rebuild(msg);
        logToTerminal(terminal, 'Importación completada', 'success');
      };
      reader.readAsText(file);
    });
  }
})();

/***************************************************
 * ESTRUCTURAS DINÁMICAS IMPLEMENTATION           *
 ***************************************************/

// Estado global para estructuras dinámicas
let estructurasState = {
  algorithm: '',
  buckets: 0,
  totalRecords: 0,
  doMax: 0,
  doReduction: 0,
  bucketCapacity: 3,
  currentKeys: [],
  expansionCount: 0,
  hashTable: null
};

function initDynamicStructuresModal(algorithm) {
  estructurasState.algorithm = algorithm;
  estructurasState.currentKeys = [];
  estructurasState.expansionCount = 0;
  
  const configDiv = $('#estructuras-config');
  const controlsDiv = $('#estructuras-controls');
  
  // Configurar interfaz según algoritmo
  if (algorithm === 'expansion-total') {
    setupTotalExpansion(configDiv, controlsDiv);
  } else if (algorithm === 'expansion-parcial') {
    setupPartialExpansion(configDiv, controlsDiv);
  }
}

function setupTotalExpansion(configDiv, controlsDiv) {
  if (!configDiv || !controlsDiv) return;
  
  configDiv.innerHTML = `
    <h3>Configuración - Expansión Total</h3>
    <div class="form-group">
      <label class="form-label">Cubetas iniciales (N):</label>
      <input type="number" class="form-control" id="est-buckets" min="1" value="8">
    </div>
    <div class="form-group">
      <label class="form-label">Registros totales (R):</label>
      <input type="number" class="form-control" id="est-records" min="1" value="100">
    </div>
    <div class="form-group">
      <label class="form-label">DO Max (%):</label>
      <input type="number" class="form-control" id="est-do-max" min="1" max="100" value="80">
    </div>
    <div class="form-group">
      <label class="form-label">DO Reducción (%):</label>
      <input type="number" class="form-control" id="est-do-reduction" min="1" max="100" value="30">
    </div>
    <div class="info-display" id="est-formula">
      <strong>Fórmula:</strong> T = 2^i * N<br>
      <em>Duplica el número de cubetas en cada expansión</em>
    </div>
    <button class="btn btn--primary" id="est-init">Inicializar</button>
  `;

  controlsDiv.innerHTML = `
    <h3>Controles</h3>
    <div class="form-group">
      <label class="form-label">Clave k:</label>
      <input type="text" class="form-control" id="est-key" placeholder="Ej: ABC">
    </div>
    <div class="control-buttons">
      <button class="btn btn--secondary" id="est-insert">Insertar</button>
      <button class="btn btn--outline" id="est-delete">Eliminar</button>
      <button class="btn btn--outline" id="est-reset">Resetear</button>
    </div>
  `;

  setupDynamicEvents();
}

function setupPartialExpansion(configDiv, controlsDiv) {
  if (!configDiv || !controlsDiv) return;
  
  configDiv.innerHTML = `
    <h3>Configuración - Expansión Parcial</h3>
    <div class="form-group">
      <label class="form-label">Cubetas iniciales (N):</label>
      <input type="number" class="form-control" id="est-buckets" min="1" value="8">
    </div>
    <div class="form-group">
      <label class="form-label">Registros totales (R):</label>
      <input type="number" class="form-control" id="est-records" min="1" value="100">
    </div>
    <div class="form-group">
      <label class="form-label">DO Max (%):</label>
      <input type="number" class="form-control" id="est-do-max" min="1" max="100" value="80">
    </div>
    <div class="form-group">
      <label class="form-label">DO Reducción (%):</label>
      <input type="number" class="form-control" id="est-do-reduction" min="1" max="100" value="30">
    </div>
    <div class="info-display" id="est-formula">
      <strong>Fórmula:</strong> T = 1.5^i * N<br>
      <em>Incremento del 50% en cada expansión</em>
    </div>
    <button class="btn btn--primary" id="est-init">Inicializar</button>
  `;

  controlsDiv.innerHTML = `
    <h3>Controles</h3>
    <div class="form-group">
      <label class="form-label">Clave k:</label>
      <input type="text" class="form-control" id="est-key" placeholder="Ej: ABC">
    </div>
    <div class="control-buttons">
      <button class="btn btn--secondary" id="est-insert">Insertar</button>
      <button class="btn btn--outline" id="est-delete">Eliminar</button>
      <button class="btn btn--outline" id="est-reset">Resetear</button>
    </div>
  `;

  setupDynamicEvents();
}

function setupDynamicEvents() {
  const terminal = $('#estructuras-terminal');
  
  // Inicializar estructura
  const initBtn = $('#est-init');
  if (initBtn) {
    initBtn.addEventListener('click', () => {
      const buckets = parseInt($('#est-buckets')?.value || '8');
      const records = parseInt($('#est-records')?.value || '100');
      const doMax = parseInt($('#est-do-max')?.value || '80');
      const doReduction = parseInt($('#est-do-reduction')?.value || '30');
      
      if (buckets < 1 || records < 1 || doMax < 1 || doReduction < 1) {
        logToTerminal(terminal, 'Valores inválidos en la configuración', 'error');
        return;
      }
      
      estructurasState.buckets = buckets;
      estructurasState.totalRecords = records;
      estructurasState.doMax = doMax;
      estructurasState.doReduction = doReduction;
      estructurasState.currentKeys = [];
      estructurasState.expansionCount = 0;
      
      // Inicializar hash table
      estructurasState.hashTable = Array.from({ length: buckets }, () => []);
      
      renderBuckets();
      updateDensityInfo();
      
      logToTerminal(terminal, `Estructura inicializada: ${buckets} cubetas, DO Max: ${doMax}%, DO Reducción: ${doReduction}%`, 'success');
      logToTerminal(terminal, `Capacidad por cubeta: ${estructurasState.bucketCapacity}`, 'info');
      logToTerminal(terminal, `Fórmula: ${estructurasState.algorithm === 'expansion-total' ? 'T = 2^i * N' : 'T = 1.5^i * N'}`, 'info');
    });
  }
  
  // Insertar clave
  const insertBtn = $('#est-insert');
  if (insertBtn) {
    insertBtn.addEventListener('click', () => {
      const key = $('#est-key')?.value.trim().toUpperCase() || '';
      if (!key) {
        logToTerminal(terminal, 'Clave vacía', 'error');
        return;
      }
      
      if (estructurasState.currentKeys.includes(key)) {
        logToTerminal(terminal, `La clave '${key}' ya existe`, 'error');
        return;
      }
      
      insertKey(key);
      const keyInput = $('#est-key');
      if (keyInput) keyInput.value = '';
    });
  }
  
  // Eliminar clave
  const deleteBtn = $('#est-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const key = $('#est-key')?.value.trim().toUpperCase() || '';
      if (!key) {
        logToTerminal(terminal, 'Clave vacía', 'error');
        return;
      }
      
      deleteKey(key);
      const keyInput = $('#est-key');
      if (keyInput) keyInput.value = '';
    });
  }
  
  // Resetear
  const resetBtn = $('#est-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      estructurasState.hashTable = null;
      estructurasState.currentKeys = [];
      estructurasState.expansionCount = 0;
      const bucketsEl = $('#estructuras-buckets');
      const infoEl = $('#estructuras-info');
      if (bucketsEl) bucketsEl.innerHTML = '';
      if (infoEl) infoEl.innerHTML = '';
      if (terminal) terminal.innerHTML = '';
      logToTerminal(terminal, 'Estructura reseteada', 'info');
    });
  }
  
  // I/O Events
  const exportBtn = $('#estructuras-export');
  const importBtn = $('#estructuras-import-btn');
  const importInput = $('#estructuras-import');
  
  if (exportBtn) exportBtn.addEventListener('click', () => exportDynamicData());
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', importDynamicData);
  }
}

function insertKey(key) {
  const terminal = $('#estructuras-terminal');
  
  if (!estructurasState.hashTable) {
    logToTerminal(terminal, 'Estructura no inicializada', 'error');
    return;
  }
  
  // Calcular hash
  const hash = calculateHashValue(key);
  const bucketIndex = hash % estructurasState.hashTable.length;
  
  logToTerminal(terminal, `Insertando '${key}': hash=${hash}, cubeta=${bucketIndex + 1}`, 'info');
  
  // Insertar en la cubeta
  estructurasState.hashTable[bucketIndex].push(key);
  estructurasState.currentKeys.push(key);
  
  // Verificar si necesita expansión
  const currentDO = calculateDensityOccupation();
  logToTerminal(terminal, `Densidad de ocupación actual: ${currentDO.toFixed(2)}%`, 'info');
  
  if (currentDO > estructurasState.doMax) {
    logToTerminal(terminal, `DO excede límite (${estructurasState.doMax}%). Iniciando expansión...`, 'warn');
    performExpansion();
  }
  
  renderBuckets();
  updateDensityInfo();
  logToTerminal(terminal, `Clave '${key}' insertada exitosamente`, 'success');
}

function deleteKey(key) {
  const terminal = $('#estructuras-terminal');
  
  if (!estructurasState.hashTable) {
    logToTerminal(terminal, 'Estructura no inicializada', 'error');
    return;
  }
  
  // Buscar y eliminar la clave
  let found = false;
  for (let i = 0; i < estructurasState.hashTable.length; i++) {
    const index = estructurasState.hashTable[i].indexOf(key);
    if (index !== -1) {
      estructurasState.hashTable[i].splice(index, 1);
      estructurasState.currentKeys = estructurasState.currentKeys.filter(k => k !== key);
      found = true;
      logToTerminal(terminal, `Clave '${key}' eliminada de la cubeta ${i + 1}`, 'success');
      break;
    }
  }
  
  if (!found) {
    logToTerminal(terminal, `Clave '${key}' no encontrada`, 'error');
    return;
  }
  
  // Verificar si necesita contracción
  const currentDO = calculateDensityOccupation();
  logToTerminal(terminal, `Densidad de ocupación actual: ${currentDO.toFixed(2)}%`, 'info');
  
  if (currentDO < estructurasState.doReduction && estructurasState.hashTable.length > estructurasState.buckets) {
    logToTerminal(terminal, `DO menor al umbral (${estructurasState.doReduction}%). Considerando contracción...`, 'warn');
    performContraction();
  }
  
  renderBuckets();
  updateDensityInfo();
}

function performExpansion() {
  const terminal = $('#estructuras-terminal');
  estructurasState.expansionCount++;
  
  let newSize;
  if (estructurasState.algorithm === 'expansion-total') {
    // T = 2^i * N
    newSize = Math.pow(2, estructurasState.expansionCount) * estructurasState.buckets;
  } else {
    // T = 1.5^i * N  
    newSize = Math.floor(Math.pow(1.5, estructurasState.expansionCount) * estructurasState.buckets);
  }
  
  logToTerminal(terminal, `Expansión ${estructurasState.expansionCount}: ${estructurasState.hashTable.length} → ${newSize} cubetas`, 'warn');
  
  // Guardar claves actuales
  const allKeys = [...estructurasState.currentKeys];
  
  // Crear nueva tabla hash
  estructurasState.hashTable = Array.from({ length: newSize }, () => []);
  estructurasState.currentKeys = [];
  
  // Redistribuir todas las claves
  logToTerminal(terminal, 'Redistribuyendo elementos...', 'info');
  allKeys.forEach(key => {
    const hash = calculateHashValue(key);
    const bucketIndex = hash % estructurasState.hashTable.length;
    estructurasState.hashTable[bucketIndex].push(key);
    estructurasState.currentKeys.push(key);
  });
  
  logToTerminal(terminal, `Expansión completada. Nueva DO: ${calculateDensityOccupation().toFixed(2)}%`, 'success');
}

function performContraction() {
  const terminal = $('#estructuras-terminal');
  
  // Calcular nuevo tamaño (reducir según el método)
  let newSize;
  if (estructurasState.algorithm === 'expansion-total') {
    newSize = Math.max(estructurasState.buckets, Math.floor(estructurasState.hashTable.length / 2));
  } else {
    newSize = Math.max(estructurasState.buckets, Math.floor(estructurasState.hashTable.length / 1.5));
  }
  
  logToTerminal(terminal, `Contracción: ${estructurasState.hashTable.length} → ${newSize} cubetas`, 'warn');
  
  // Guardar claves actuales
  const allKeys = [...estructurasState.currentKeys];
  
  // Crear nueva tabla hash
  estructurasState.hashTable = Array.from({ length: newSize }, () => []);
  estructurasState.currentKeys = [];
  
  // Redistribuir todas las claves
  logToTerminal(terminal, 'Redistribuyendo elementos...', 'info');
  allKeys.forEach(key => {
    const hash = calculateHashValue(key);
    const bucketIndex = hash % estructurasState.hashTable.length;
    estructurasState.hashTable[bucketIndex].push(key);
    estructurasState.currentKeys.push(key);
  });
  
  logToTerminal(terminal, `Contracción completada. Nueva DO: ${calculateDensityOccupation().toFixed(2)}%`, 'success');
}

function calculateHashValue(key) {
  // Función hash simple: suma de códigos ASCII
  return key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function calculateDensityOccupation() {
  const totalKeys = estructurasState.currentKeys.length;
  const totalCapacity = estructurasState.hashTable.length * estructurasState.bucketCapacity;
  return (totalKeys / totalCapacity) * 100;
}

function renderBuckets() {
  const container = $('#estructuras-buckets');
  
  if (!container) return;
  
  if (!estructurasState.hashTable) {
    container.innerHTML = '<p>No hay estructura inicializada</p>';
    return;
  }
  
  container.innerHTML = '';
  
  estructurasState.hashTable.forEach((bucket, index) => {
    const bucketEl = document.createElement('div');
    bucketEl.className = 'bucket';
    bucketEl.setAttribute('data-bucket', index);
    
    // Determinar estado de la cubeta
    if (bucket.length >= estructurasState.bucketCapacity) {
      bucketEl.classList.add('requires-expansion');
    } else if (bucket.length > 0) {
      bucketEl.classList.add('normal');
    }
    
    const header = document.createElement('div');
    header.className = 'bucket-header';
    header.textContent = `Cubeta ${index + 1}`;
    
    const content = document.createElement('div');
    content.className = 'bucket-content';
    
    if (bucket.length === 0) {
      const emptyKey = document.createElement('div');
      emptyKey.className = 'bucket-key empty';
      emptyKey.textContent = 'Vacía';
      content.appendChild(emptyKey);
    } else {
      bucket.forEach(key => {
        const keyEl = document.createElement('div');
        keyEl.className = 'bucket-key';
        keyEl.textContent = key;
        content.appendChild(keyEl);
      });
      
      // Agregar espacios vacíos si la cubeta no está llena
      const remaining = estructurasState.bucketCapacity - bucket.length;
      for (let i = 0; i < remaining; i++) {
        const emptyKey = document.createElement('div');
        emptyKey.className = 'bucket-key empty';
        emptyKey.textContent = '---';
        content.appendChild(emptyKey);
      }
    }
    
    bucketEl.appendChild(header);
    bucketEl.appendChild(content);
    container.appendChild(bucketEl);
  });
}

function updateDensityInfo() {
  const infoEl = $('#estructuras-info');
  
  if (!infoEl) return;
  
  if (!estructurasState.hashTable) {
    infoEl.innerHTML = '';
    return;
  }
  
  const totalKeys = estructurasState.currentKeys.length;
  const totalBuckets = estructurasState.hashTable.length;
  const currentDO = calculateDensityOccupation();
  
  infoEl.innerHTML = `
    <strong>D.O.: ${currentDO.toFixed(2)}% | Total claves: ${totalKeys} | Cubetas: ${totalBuckets}</strong><br>
    <em>Expansiones realizadas: ${estructurasState.expansionCount}</em>
  `;
}

function exportDynamicData() {
  const terminal = $('#estructuras-terminal');
  
  if (!estructurasState.hashTable) {
    logToTerminal(terminal, 'No hay datos para exportar', 'warn');
    return;
  }
  
  const csvLines = [];
  csvLines.push('#CONFIGURACION');
  csvLines.push(`Algoritmo: ${estructurasState.algorithm}`);
  csvLines.push(`Cubetas iniciales: ${estructurasState.buckets}`);
  csvLines.push(`Registros totales: ${estructurasState.totalRecords}`);
  csvLines.push(`DO Max: ${estructurasState.doMax}%`);
  csvLines.push(`DO Reduccion: ${estructurasState.doReduction}%`);
  csvLines.push(`Expansiones: ${estructurasState.expansionCount}`);
  csvLines.push('#ESTADO_CUBETAS');
  estructurasState.hashTable.forEach((bucket, index) => {
    csvLines.push(`Cubeta ${index + 1}: ${bucket.join(',') || 'VACIA'}`);
  });
  csvLines.push('#TERMINAL');
  csvLines.push(terminal?.textContent.trim().replace(/\n/g, '\\n') || '');
  
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'estructuras_dinamicas.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  logToTerminal(terminal, 'Datos exportados a CSV', 'success');
}

function importDynamicData(event) {
  const terminal = $('#estructuras-terminal');
  const file = event.target.files[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      const lines = content.split('\n');
      
      let section = '';
      const buckets = [];
      
      lines.forEach(line => {
        if (line.startsWith('#')) {
          section = line;
          return;
        }
        
        if (section === '#CONFIGURACION') {
          if (line.includes('Algoritmo:')) {
            estructurasState.algorithm = line.split(':')[1].trim();
          } else if (line.includes('Cubetas iniciales:')) {
            estructurasState.buckets = parseInt(line.split(':')[1]);
          } else if (line.includes('DO Max:')) {
            estructurasState.doMax = parseInt(line.split(':')[1]);
          } else if (line.includes('DO Reduccion:')) {
            estructurasState.doReduction = parseInt(line.split(':')[1]);
          } else if (line.includes('Expansiones:')) {
            estructurasState.expansionCount = parseInt(line.split(':')[1]);
          }
        } else if (section === '#ESTADO_CUBETAS') {
          if (line.includes('Cubeta')) {
            const keys = line.split(':')[1].trim();
            if (keys === 'VACIA') {
              buckets.push([]);
            } else {
              buckets.push(keys.split(',').map(k => k.trim()));
            }
          }
        } else if (section === '#TERMINAL') {
          if (terminal) terminal.textContent = line.replace(/\\n/g, '\n');
        }
      });
      
      estructurasState.hashTable = buckets;
      estructurasState.currentKeys = [];
      buckets.forEach(bucket => {
        estructurasState.currentKeys.push(...bucket);
      });
      
      // Actualizar interfaz
      const bucketsInput = $('#est-buckets');
      const doMaxInput = $('#est-do-max');
      const doReductionInput = $('#est-do-reduction');
      
      if (bucketsInput) bucketsInput.value = estructurasState.buckets;
      if (doMaxInput) doMaxInput.value = estructurasState.doMax;
      if (doReductionInput) doReductionInput.value = estructurasState.doReduction;
      
      renderBuckets();
      updateDensityInfo();
      
      logToTerminal(terminal, 'Datos importados correctamente', 'success');
      
    } catch (error) {
      logToTerminal(terminal, 'Error al importar datos: formato inválido', 'error');
    }
  };
  
  reader.readAsText(file);
}

/***************************************************
 * BÚSQUEDAS EXTERNAS IMPLEMENTATION              *
 ***************************************************/

// Estado global para búsquedas externas
let externasState = {
  algorithm: '',
  totalElements: 0,
  keyLength: 0,
  numBlocks: 0,
  elementsPerBlock: 0,
  blocks: [],
  keys: new Set(),
  additionalParams: {}
};

function calculateBlocks(n) {
  const blocks = Math.floor(Math.sqrt(n));
  const elementsPerBlock = Math.floor(n / blocks);
  return { blocks, elementsPerBlock };
}

function initExternalSearchModal(algorithm) {
  externasState.algorithm = algorithm;
  externasState.totalElements = 0;
  externasState.keys = new Set();
  externasState.blocks = [];
  
  const configDiv = $('#externas-config');
  const controlsDiv = $('#externas-controls');
  
  if (!configDiv || !controlsDiv) return;
  
  // Configurar interfaz según algoritmo
  switch(algorithm) {
    case 'ext-lineal':
      setupExternalAlgorithm(configDiv, controlsDiv, 'Búsqueda Lineal por Bloques');
      break;
    case 'ext-binaria':
      setupExternalAlgorithm(configDiv, controlsDiv, 'Búsqueda Binaria por Bloques');
      break;
    case 'ext-hash-mod':
      setupExternalAlgorithm(configDiv, controlsDiv, 'Hash Mod por Bloques');
      break;
    case 'ext-hash-cuadrado':
      setupExternalAlgorithm(configDiv, controlsDiv, 'Hash Cuadrado por Bloques');
      break;
    case 'ext-hash-plegamiento':
      setupExternalAlgorithm(configDiv, controlsDiv, 'Hash Plegamiento por Bloques', true);
      break;
    case 'ext-hash-truncamiento':
      setupExternalAlgorithm(configDiv, controlsDiv, 'Hash Truncamiento por Bloques', false, true);
      break;
  }
}

function setupExternalAlgorithm(configDiv, controlsDiv, title, showFolding = false, showPositions = false) {
  let extraFields = '';
  
  if (showFolding) {
    extraFields = `
      <div class="form-group">
        <label class="form-label">Cifras menos significativas por grupo:</label>
        <input type="number" class="form-control" id="ext-fold-digits" min="1" value="2">
      </div>
    `;
  }
  
  if (showPositions) {
    extraFields = `
      <div class="form-group">
        <label class="form-label">Posiciones de dígitos (separadas por comas):</label>
        <input type="text" class="form-control" id="ext-positions" placeholder="Ej: 1,3,5" value="1,2">
      </div>
    `;
  }
  
  configDiv.innerHTML = `
    <h3>Configuración - ${title}</h3>
    <div class="form-group">
      <label class="form-label">Número total de elementos (n):</label>
      <input type="number" class="form-control" id="ext-total-elements" min="1" value="16">
    </div>
    <div class="form-group">
      <label class="form-label">Longitud de clave:</label>
      <input type="number" class="form-control" id="ext-key-length" min="1" value="3">
    </div>
    ${extraFields}
    <div class="info-display" id="ext-info"></div>
    <button class="btn btn--primary" id="ext-init">Inicializar Estructura</button>
  `;

  controlsDiv.innerHTML = `
    <h3>Controles</h3>
    <div class="form-group">
      <label class="form-label">Clave individual:</label>
      <input type="text" class="form-control" id="ext-key" placeholder="Ej: ABC">
    </div>
    <div class="control-buttons">
      <button class="btn btn--secondary" id="ext-insert">Insertar</button>
      <button class="btn btn--outline" id="ext-search">Buscar</button>
      <button class="btn btn--outline" id="ext-delete">Eliminar</button>
      <button class="btn btn--outline" id="ext-reset">Resetear</button>
    </div>
  `;

  setupExternalEvents();
}

function setupExternalEvents() {
  const terminal = $('#externas-terminal');
  
  // Inicializar estructura
  const initBtn = $('#ext-init');
  if (initBtn) {
    initBtn.addEventListener('click', () => {
      const n = parseInt($('#ext-total-elements')?.value || '16');
      const keyLength = parseInt($('#ext-key-length')?.value || '3');
      
      if (n < 1 || keyLength < 1) {
        logToTerminal(terminal, 'Valores inválidos', 'error');
        return;
      }
      
      // Obtener parámetros adicionales según algoritmo
      if (externasState.algorithm === 'ext-hash-plegamiento') {
        externasState.additionalParams.foldDigits = parseInt($('#ext-fold-digits')?.value || '2');
      } else if (externasState.algorithm === 'ext-hash-truncamiento') {
        const positionsStr = $('#ext-positions')?.value || '1,2';
        const positions = positionsStr.split(',').map(p => parseInt(p.trim())).filter(p => p > 0);
        externasState.additionalParams.positions = positions;
      }
      
      const { blocks, elementsPerBlock } = calculateBlocks(n);
      
      externasState.totalElements = n;
      externasState.keyLength = keyLength;
      externasState.numBlocks = blocks;
      externasState.elementsPerBlock = elementsPerBlock;
      externasState.blocks = Array.from({ length: blocks }, (_, i) => ({
        id: i + 1,
        elements: []
      }));
      externasState.keys = new Set();
      
      // Mostrar información
      const infoEl = $('#ext-info');
      if (infoEl) {
        infoEl.innerHTML = `
          <strong>Cálculo de bloques:</strong><br>
          Bloques: √(${n}) = ${blocks}<br>
          Elementos por bloque: ${elementsPerBlock}
        `;
      }
      
      renderExternalBlocks();
      logToTerminal(terminal, `Estructura inicializada: ${blocks} bloques, ${elementsPerBlock} elementos por bloque`, 'success');
    });
  }
  
  // Insertar elemento
  const insertBtn = $('#ext-insert');
  if (insertBtn) {
    insertBtn.addEventListener('click', () => {
      const key = $('#ext-key')?.value.trim().toUpperCase() || '';
      if (!key) {
        logToTerminal(terminal, 'Clave vacía', 'error');
        return;
      }
      
      if (key.length !== externasState.keyLength) {
        logToTerminal(terminal, `La clave debe tener ${externasState.keyLength} caracteres`, 'error');
        return;
      }
      
      if (externasState.keys.has(key)) {
        logToTerminal(terminal, `La clave '${key}' ya existe`, 'error');
        return;
      }
      
      insertExternalElement(key);
      const keyInput = $('#ext-key');
      if (keyInput) keyInput.value = '';
    });
  }
  
  // Buscar elemento
  const searchBtn = $('#ext-search');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const key = $('#ext-key')?.value.trim().toUpperCase() || '';
      if (!key) {
        logToTerminal(terminal, 'Clave vacía', 'error');
        return;
      }
      
      searchExternalElement(key);
    });
  }
  
  // Eliminar elemento
  const deleteBtn = $('#ext-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const key = $('#ext-key')?.value.trim().toUpperCase() || '';
      if (!key) {
        logToTerminal(terminal, 'Clave vacía', 'error');
        return;
      }
      
      deleteExternalElement(key);
      const keyInput = $('#ext-key');
      if (keyInput) keyInput.value = '';
    });
  }
  
  // Resetear
  const resetBtn = $('#ext-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      externasState.blocks = [];
      externasState.keys = new Set();
      const displayEl = $('#externas-display');
      const infoEl = $('#ext-info');
      if (displayEl) displayEl.innerHTML = '';
      if (infoEl) infoEl.innerHTML = '';
      if (terminal) terminal.innerHTML = '';
      logToTerminal(terminal, 'Estructura reseteada', 'info');
    });
  }
  
  // I/O Events
  const exportBtn = $('#externas-export');
  const importBtn = $('#externas-import-btn');
  const importInput = $('#externas-import');
  
  if (exportBtn) exportBtn.addEventListener('click', () => exportExternalData());
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', importExternalData);
  }
}

function insertExternalElement(key) {
  const terminal = $('#externas-terminal');
  const targetBlock = calculateTargetBlock(key);
  
  if (targetBlock === -1) {
    logToTerminal(terminal, 'Error al calcular bloque destino', 'error');
    return;
  }
  
  const block = externasState.blocks[targetBlock - 1];
  
  if (block.elements.length >= externasState.elementsPerBlock) {
    logToTerminal(terminal, `Bloque ${targetBlock} está lleno`, 'warn');
    return;
  }
  
  block.elements.push(key);
  externasState.keys.add(key);
  
  // Ordenar elementos si es búsqueda binaria
  if (externasState.algorithm === 'ext-binaria') {
    block.elements.sort();
  }
  
  renderExternalBlocks();
  logToTerminal(terminal, `Clave '${key}' insertada en bloque ${targetBlock}`, 'success');
}

function searchExternalElement(key) {
  if (externasState.algorithm === 'ext-lineal') {
    searchLinear(key);
  } else if (externasState.algorithm === 'ext-binaria') {
    searchBinary(key);
  } else {
    searchHash(key);
  }
}

function searchLinear(key) {
  const terminal = $('#externas-terminal');
  logToTerminal(terminal, `Búsqueda lineal de '${key}'`, 'info');
  
  // Buscar bloque por bloque
  for (let i = 0; i < externasState.blocks.length; i++) {
    const block = externasState.blocks[i];
    highlightExternalBlock(i + 1, 'searching');
    
    logToTerminal(terminal, `Buscando en bloque ${i + 1}...`, 'info');
    
    // Buscar dentro del bloque
    for (let j = 0; j < block.elements.length; j++) {
      highlightExternalElement(i + 1, j, 'searching');
      
      if (block.elements[j] === key) {
        highlightExternalElement(i + 1, j, 'found');
        highlightExternalBlock(i + 1, 'found');
        logToTerminal(terminal, `Elemento '${key}' encontrado en bloque ${i + 1}, posición ${j + 1}`, 'success');
        return;
      }
    }
    
    // Limpiar highlight del bloque
    setTimeout(() => clearExternalHighlights(), 500);
  }
  
  logToTerminal(terminal, `Elemento '${key}' no encontrado`, 'error');
}

function searchBinary(key) {
  const terminal = $('#externas-terminal');
  logToTerminal(terminal, `Búsqueda binaria de '${key}'`, 'info');
  
  // Primero buscar el bloque usando búsqueda binaria
  let left = 0;
  let right = externasState.blocks.length - 1;
  let targetBlock = -1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const block = externasState.blocks[mid];
    
    highlightExternalBlock(mid + 1, 'searching');
    logToTerminal(terminal, `Evaluando bloque ${mid + 1}...`, 'info');
    
    if (block.elements.length === 0) {
      right = mid - 1;
      continue;
    }
    
    const firstElement = block.elements[0];
    const lastElement = block.elements[block.elements.length - 1];
    
    if (key >= firstElement && key <= lastElement) {
      targetBlock = mid;
      break;
    } else if (key < firstElement) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  
  if (targetBlock === -1) {
    logToTerminal(terminal, `Elemento '${key}' no encontrado`, 'error');
    return;
  }
  
  // Buscar dentro del bloque seleccionado
  const block = externasState.blocks[targetBlock];
  highlightExternalBlock(targetBlock + 1, 'searching');
  
  let blockLeft = 0;
  let blockRight = block.elements.length - 1;
  
  while (blockLeft <= blockRight) {
    const mid = Math.floor((blockLeft + blockRight) / 2);
    
    highlightExternalElement(targetBlock + 1, mid, 'searching');
    
    if (block.elements[mid] === key) {
      highlightExternalElement(targetBlock + 1, mid, 'found');
      highlightExternalBlock(targetBlock + 1, 'found');
      logToTerminal(terminal, `Elemento '${key}' encontrado en bloque ${targetBlock + 1}, posición ${mid + 1}`, 'success');
      return;
    } else if (block.elements[mid] < key) {
      blockLeft = mid + 1;
    } else {
      blockRight = mid - 1;
    }
  }
  
  logToTerminal(terminal, `Elemento '${key}' no encontrado`, 'error');
}

function searchHash(key) {
  const terminal = $('#externas-terminal');
  const targetBlock = calculateTargetBlock(key);
  
  if (targetBlock === -1) {
    logToTerminal(terminal, 'Error al calcular bloque destino', 'error');
    return;
  }
  
  logToTerminal(terminal, `Búsqueda hash de '${key}' en bloque ${targetBlock}`, 'info');
  
  const block = externasState.blocks[targetBlock - 1];
  highlightExternalBlock(targetBlock, 'searching');
  
  // Buscar dentro del bloque
  for (let i = 0; i < block.elements.length; i++) {
    highlightExternalElement(targetBlock, i, 'searching');
    
    if (block.elements[i] === key) {
      highlightExternalElement(targetBlock, i, 'found');
      highlightExternalBlock(targetBlock, 'found');
      logToTerminal(terminal, `Elemento '${key}' encontrado en bloque ${targetBlock}, posición ${i + 1}`, 'success');
      return;
    }
  }
  
  logToTerminal(terminal, `Elemento '${key}' no encontrado`, 'error');
}

function deleteExternalElement(key) {
  const terminal = $('#externas-terminal');
  
  for (let i = 0; i < externasState.blocks.length; i++) {
    const block = externasState.blocks[i];
    const index = block.elements.indexOf(key);
    
    if (index !== -1) {
      block.elements.splice(index, 1);
      externasState.keys.delete(key);
      renderExternalBlocks();
      logToTerminal(terminal, `Elemento '${key}' eliminado del bloque ${i + 1}`, 'success');
      return;
    }
  }
  
  logToTerminal(terminal, `Elemento '${key}' no encontrado`, 'error');
}

function calculateTargetBlock(key) {
  const terminal = $('#externas-terminal');
  let hashValue = 0;
  
  switch (externasState.algorithm) {
    case 'ext-hash-mod':
      hashValue = calculateHashMod(key);
      break;
    case 'ext-hash-cuadrado':
      hashValue = calculateHashSquare(key);
      break;
    case 'ext-hash-plegamiento':
      hashValue = calculateHashFolding(key);
      break;
    case 'ext-hash-truncamiento':
      hashValue = calculateHashTruncation(key);
      break;
    default:
      return 1; // Para búsquedas lineales/binarias, siempre empezar desde bloque 1
  }
  
  const blockIndex = Math.ceil(hashValue / externasState.elementsPerBlock);
  const targetBlock = Math.min(blockIndex, externasState.numBlocks);
  
  logToTerminal(terminal, `Hash calculado: ${hashValue}, bloque destino: ${targetBlock}`, 'info');
  
  return targetBlock;
}

function calculateHashMod(key) {
  const numericKey = keyToNumber(key);
  return (numericKey % externasState.totalElements) + 1;
}

function calculateHashSquare(key) {
  const numericKey = keyToNumber(key);
  const squared = numericKey * numericKey;
  const squaredStr = squared.toString();
  const midIndex = Math.floor(squaredStr.length / 2);
  const midDigits = squaredStr.substring(midIndex - 1, midIndex + 1) || squaredStr;
  const extractedValue = parseInt(midDigits) || 1;
  return (extractedValue % externasState.totalElements) + 1;
}

function calculateHashFolding(key) {
  const numericKey = keyToNumber(key);
  const keyStr = numericKey.toString();
  const groupSize = externasState.additionalParams.foldDigits || 2;
  
  let sum = 0;
  for (let i = 0; i < keyStr.length; i += groupSize) {
    const group = keyStr.substring(i, i + groupSize);
    sum += parseInt(group) || 0;
  }
  
  return (sum % externasState.totalElements) + 1;
}

function calculateHashTruncation(key) {
  const numericKey = keyToNumber(key);
  const keyStr = numericKey.toString();
  const positions = externasState.additionalParams.positions || [1, 2];
  
  let extracted = '';
  positions.forEach(pos => {
    if (pos <= keyStr.length) {
      extracted += keyStr[pos - 1];
    }
  });
  
  const extractedValue = parseInt(extracted) || 1;
  return (extractedValue % externasState.totalElements) + 1;
}

function keyToNumber(key) {
  return key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function renderExternalBlocks() {
  const display = $('#externas-display');
  
  if (!display) return;
  
  if (externasState.blocks.length === 0) {
    display.innerHTML = '<p>No hay bloques inicializados</p>';
    return;
  }
  
  const container = document.createElement('div');
  container.className = 'blocks-container';
  
  externasState.blocks.forEach((block, index) => {
    const blockEl = document.createElement('div');
    blockEl.className = 'block';
    blockEl.setAttribute('data-block', index + 1);
    
    const header = document.createElement('div');
    header.className = 'block-header';
    header.textContent = `Bloque ${index + 1}`;
    
    const content = document.createElement('div');
    content.className = 'block-content';
    
    if (block.elements.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'block-item empty';
      emptyItem.textContent = 'Vacío';
      content.appendChild(emptyItem);
    } else {
      block.elements.forEach((element, elemIndex) => {
        const item = document.createElement('div');
        item.className = 'block-item';
        item.setAttribute('data-element', elemIndex);
        item.textContent = element;
        content.appendChild(item);
      });
    }
    
    blockEl.appendChild(header);
    blockEl.appendChild(content);
    container.appendChild(blockEl);
  });
  
  display.innerHTML = '';
  display.appendChild(container);
}

function highlightExternalBlock(blockId, type) {
  clearExternalHighlights();
  const block = $(`.block[data-block="${blockId}"]`);
  if (block) {
    block.classList.add(type);
  }
}

function highlightExternalElement(blockId, elementIndex, type) {
  const block = $(`.block[data-block="${blockId}"]`);
  if (block) {
    const element = block.querySelector(`.block-item[data-element="${elementIndex}"]`);
    if (element) {
      element.classList.add(type);
    }
  }
}

function clearExternalHighlights() {
  $$('.block').forEach(block => {
    block.classList.remove('searching', 'found');
  });
  $$('.block-item').forEach(item => {
    item.classList.remove('searching', 'found');
  });
}

function exportExternalData() {
  const terminal = $('#externas-terminal');
  
  if (externasState.blocks.length === 0) {
    logToTerminal(terminal, 'No hay datos para exportar', 'warn');
    return;
  }
  
  const data = {
    algorithm: externasState.algorithm,
    totalElements: externasState.totalElements,
    keyLength: externasState.keyLength,
    numBlocks: externasState.numBlocks,
    elementsPerBlock: externasState.elementsPerBlock,
    blocks: externasState.blocks,
    additionalParams: externasState.additionalParams,
    terminal: terminal?.textContent || ''
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'busquedas_externas.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  logToTerminal(terminal, 'Datos exportados correctamente', 'success');
}

function importExternalData(event) {
  const terminal = $('#externas-terminal');
  const file = event.target.files[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      externasState.algorithm = data.algorithm;
      externasState.totalElements = data.totalElements;
      externasState.keyLength = data.keyLength;
      externasState.numBlocks = data.numBlocks;
      externasState.elementsPerBlock = data.elementsPerBlock;
      externasState.blocks = data.blocks;
      externasState.additionalParams = data.additionalParams || {};
      
      // Reconstruir set de claves
      externasState.keys = new Set();
      externasState.blocks.forEach(block => {
        block.elements.forEach(element => {
          externasState.keys.add(element);
        });
      });
      
      // Actualizar interfaz
      const totalEl = $('#ext-total-elements');
      const lengthEl = $('#ext-key-length');
      const infoEl = $('#ext-info');
      
      if (totalEl) totalEl.value = data.totalElements;
      if (lengthEl) lengthEl.value = data.keyLength;
      if (infoEl) {
        infoEl.innerHTML = `
          <strong>Cálculo de bloques:</strong><br>
          Bloques: ${data.numBlocks}<br>
          Elementos por bloque: ${data.elementsPerBlock}
        `;
      }
      
      renderExternalBlocks();
      
      if (data.terminal && terminal) {
        terminal.textContent = data.terminal;
      }
      
      logToTerminal(terminal, 'Datos importados correctamente', 'success');
      
    } catch (error) {
      logToTerminal(terminal, 'Error al importar datos: formato inválido', 'error');
    }
  };
  
  reader.readAsText(file);
}

/***************************************************
 * ÍNDICES IMPLEMENTATION                          *
 ***************************************************/

// Estado global para índices
let indicesState = {
  algorithm: '',
  registros: 0,
  longitudRegistro: 0,
  entradaIndice: 0,
  tamañoBloque: 0,
  structure: null,
  calculations: {},
  searchCount: 0
};

function initIndicesModal(algorithm) {
  indicesState.algorithm = algorithm;
  indicesState.searchCount = 0;
  
  // Actualizar contador
  const counterEl = $('#indices-contador-accesos');
  if (counterEl) counterEl.textContent = '0';
  
  // Limpiar visualizaciones
  const displayEl = $('#indices-display');
  const calculosEl = $('#indices-calculos-display');
  const terminalEl = $('#indices-terminal');
  
  if (displayEl) displayEl.innerHTML = '';
  if (calculosEl) calculosEl.innerHTML = '';
  if (terminalEl) terminalEl.innerHTML = '';
  
  logToTerminal(terminalEl, `Iniciando simulación de ${algorithm.replace('-', ' ')}`, 'info');
  
  setupIndicesEvents();
}

function setupIndicesEvents() {
  const terminal = $('#indices-terminal');
  
  // Calcular estructura
  const calcularBtn = $('#indices-calcular');
  if (calcularBtn) {
    calcularBtn.addEventListener('click', () => {
      const registros = parseInt($('#indices-registros')?.value || '500000');
      const longitudRegistro = parseInt($('#indices-longitud-registro')?.value || '120');
      const entradaIndice = parseInt($('#indices-entrada-indice')?.value || '15');
      const tamañoBloque = parseInt($('#indices-tamaño-bloque')?.value || '4096');
      
      if (registros < 1 || longitudRegistro < 1 || entradaIndice < 1 || tamañoBloque < 1) {
        logToTerminal(terminal, 'Valores inválidos en la configuración', 'error');
        return;
      }
      
      indicesState.registros = registros;
      indicesState.longitudRegistro = longitudRegistro;
      indicesState.entradaIndice = entradaIndice;
      indicesState.tamañoBloque = tamañoBloque;
      
      calculateIndexStructure();
      renderIndexStructure();
      displayCalculations();
      
      logToTerminal(terminal, 'Estructura de índice calculada correctamente', 'success');
    });
  }
  
  // Simular búsqueda
  const simularBtn = $('#indices-simular');
  if (simularBtn) {
    simularBtn.addEventListener('click', () => {
      const registroBuscar = parseInt($('#indices-buscar-registro')?.value || '0');
      
      if (!registroBuscar || registroBuscar < 1 || registroBuscar > indicesState.registros) {
        logToTerminal(terminal, `Registro debe estar entre 1 y ${indicesState.registros}`, 'error');
        return;
      }
      
      simulateSearch(registroBuscar);
    });
  }
  
  // Resetear
  const resetBtn = $('#indices-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      indicesState.structure = null;
      indicesState.calculations = {};
      indicesState.searchCount = 0;
      
      const counterEl = $('#indices-contador-accesos');
      const displayEl = $('#indices-display');
      const calculosEl = $('#indices-calculos-display');
      
      if (counterEl) counterEl.textContent = '0';
      if (displayEl) displayEl.innerHTML = '';
      if (calculosEl) calculosEl.innerHTML = '';
      if (terminal) terminal.innerHTML = '';
      
      logToTerminal(terminal, 'Estructura reseteada', 'info');
    });
  }
  
  // I/O Events
  const exportBtn = $('#indices-export');
  const importBtn = $('#indices-import-btn');
  const importInput = $('#indices-import');
  
  if (exportBtn) exportBtn.addEventListener('click', () => exportIndicesData());
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', importIndicesData);
  }
}

function calculateIndexStructure() {
  const { registros, longitudRegistro, entradaIndice, tamañoBloque } = indicesState;
  
  // Cálculos base
  const brf = Math.floor(tamañoBloque / longitudRegistro);
  const bloquesData = Math.ceil(registros / brf);
  const bfri = Math.floor(tamañoBloque / entradaIndice);
  
  let structure, accesos, calculations;
  
  switch (indicesState.algorithm) {
    case 'indice-primario':
      const bloquesIndicePrimario = Math.ceil(bloquesData / bfri);
      accesos = Math.ceil(Math.log2(bloquesIndicePrimario)) + 1;
      
      calculations = {
        brf,
        bloquesData,
        bfri,
        bloquesIndice: bloquesIndicePrimario,
        accesos,
        steps: [
          `brf = ⌊B/r⌋ = ⌊${tamañoBloque}/${longitudRegistro}⌋ = ${brf} registros por bloque`,
          `b = ⌈r/brf⌉ = ⌈${registros}/${brf}⌉ = ${bloquesData} BDD de registros dato`,
          `bfri = ⌊B/Ri⌋ = ⌊${tamañoBloque}/${entradaIndice}⌋ = ${bfri} registros índice por bloque`,
          `Bloques índice = ⌈${bloquesData}/${bfri}⌉ = ${bloquesIndicePrimario} BDD de registros índice`,
          `Accesos = ⌈log₂ ${bloquesIndicePrimario}⌉ + 1 = ${accesos} accesos`
        ]
      };
      
      structure = {
        type: 'primario',
        levels: [
          { name: 'Índice Primario', blocks: bloquesIndicePrimario, type: 'index' },
          { name: 'Datos', blocks: bloquesData, type: 'data' }
        ]
      };
      break;
      
    case 'indice-secundario':
      const bloquesIndiceSecundario = Math.ceil(registros / bfri);
      accesos = Math.ceil(Math.log2(bloquesIndiceSecundario)) + 1;
      
      calculations = {
        brf,
        bloquesData,
        bfri,
        bloquesIndice: bloquesIndiceSecundario,
        accesos,
        steps: [
          `brf = ⌊${tamañoBloque}/${longitudRegistro}⌋ = ${brf} registros por bloque`,
          `b = ⌈${registros}/${brf}⌉ = ${bloquesData} BDD de registros dato`,
          `bfri = ⌊${tamañoBloque}/${entradaIndice}⌋ = ${bfri} registros índice por bloque`,
          `Bloques índice = ⌈${registros}/${bfri}⌉ = ${bloquesIndiceSecundario} BDD de registros índice`,
          `Accesos = ⌈log₂ ${bloquesIndiceSecundario}⌉ + 1 = ${accesos} accesos`
        ]
      };
      
      structure = {
        type: 'secundario',
        levels: [
          { name: 'Índice Secundario', blocks: bloquesIndiceSecundario, type: 'index' },
          { name: 'Datos', blocks: bloquesData, type: 'data' }
        ]
      };
      break;
      
    case 'multinivel-primario':
      const levels = [];
      let currentBlocks = bloquesData;
      let nivel = 1;
      
      while (currentBlocks > 1) {
        const nextLevel = Math.ceil(currentBlocks / bfri);
        levels.unshift({ 
          name: `Nivel ${nivel} de Índice`, 
          blocks: nextLevel, 
          type: 'index' 
        });
        currentBlocks = nextLevel;
        nivel++;
      }
      
      levels.push({ name: 'Datos', blocks: bloquesData, type: 'data' });
      accesos = levels.length;
      
      calculations = {
        brf,
        bloquesData,
        bfri,
        niveles: levels.length - 1,
        accesos,
        steps: [
          `brf = ⌊${tamañoBloque}/${longitudRegistro}⌋ = ${brf} registros por bloque`,
          `b = ⌈${registros}/${brf}⌉ = ${bloquesData} BDD de registros dato`,
          `bfri = ⌊${tamañoBloque}/${entradaIndice}⌋ = ${bfri} registros índice por bloque`,
          ...levels.slice(0, -1).map((level, index) => 
            `Nivel ${index + 1}: ⌈${index === 0 ? bloquesData : levels[index - 1].blocks}/${bfri}⌉ = ${level.blocks} bloques`
          ),
          `Niveles = ${levels.length - 1}, Accesos = ${accesos}`
        ]
      };
      
      structure = {
        type: 'multinivel-primario',
        levels
      };
      break;
      
    case 'multinivel-secundario':
      const levelsSecundario = [];
      let currentBlocksSecundario = Math.ceil(registros / bfri);
      let nivelSecundario = 1;
      
      while (currentBlocksSecundario > 1) {
        const nextLevel = Math.ceil(currentBlocksSecundario / bfri);
        levelsSecundario.unshift({ 
          name: `Nivel ${nivelSecundario} de Índice`, 
          blocks: nextLevel, 
          type: 'index' 
        });
        currentBlocksSecundario = nextLevel;
        nivelSecundario++;
      }
      
      levelsSecundario.push({ name: 'Datos', blocks: bloquesData, type: 'data' });
      accesos = levelsSecundario.length;
      
      calculations = {
        brf,
        bloquesData,
        bfri,
        bloquesIndiceInicial: Math.ceil(registros / bfri),
        niveles: levelsSecundario.length - 1,
        accesos,
        steps: [
          `brf = ⌊${tamañoBloque}/${longitudRegistro}⌋ = ${brf} registros por bloque`,
          `b = ⌈${registros}/${brf}⌉ = ${bloquesData} BDD de registros dato`,
          `bfri = ⌊${tamañoBloque}/${entradaIndice}⌋ = ${bfri} registros índice por bloque`,
          `Nivel 1: ⌈${registros}/${bfri}⌉ = ${Math.ceil(registros / bfri)} bloques`,
          ...levelsSecundario.slice(0, -1).slice(1).map((level, index) => 
            `Nivel ${index + 2}: ⌈${levelsSecundario[index].blocks}/${bfri}⌉ = ${level.blocks} bloques`
          ),
          `Niveles = ${levelsSecundario.length - 1}, Accesos = ${accesos}`
        ]
      };
      
      structure = {
        type: 'multinivel-secundario',
        levels: levelsSecundario
      };
      break;
  }
  
  indicesState.structure = structure;
  indicesState.calculations = calculations;
}

function renderIndexStructure() {
  const display = $('#indices-display');
  
  if (!display) return;
  
  if (!indicesState.structure) {
    display.innerHTML = '<p>No hay estructura calculada</p>';
    return;
  }
  
  const container = document.createElement('div');
  container.className = 'indices-structure';
  
  indicesState.structure.levels.forEach((level, levelIndex) => {
    const levelDiv = document.createElement('div');
    levelDiv.className = 'index-level';
    
    const levelTitle = document.createElement('div');
    levelTitle.className = 'index-level-title';
    levelTitle.textContent = `${level.name} (${level.blocks} bloques)`;
    levelDiv.appendChild(levelTitle);
    
    // Mostrar solo una muestra de bloques si hay muchos
    const maxBlocksToShow = 10;
    const blocksToShow = Math.min(level.blocks, maxBlocksToShow);
    
    for (let i = 0; i < blocksToShow; i++) {
      const blockEl = document.createElement('div');
      blockEl.className = `index-block ${level.type === 'data' ? 'data-block' : 'index-block-type'}`;
      blockEl.setAttribute('data-level', levelIndex);
      blockEl.setAttribute('data-block', i);
      
      const header = document.createElement('div');
      header.className = 'index-block-header';
      header.textContent = `${level.type === 'data' ? 'Datos' : 'Índice'} ${i + 1}`;
      
      const content = document.createElement('div');
      content.className = 'index-block-content';
      
      // Simular entradas
      const entriesToShow = level.type === 'data' ? 
        Math.min(3, indicesState.calculations.brf) : 
        Math.min(3, indicesState.calculations.bfri);
      
      for (let j = 0; j < entriesToShow; j++) {
        const entry = document.createElement('div');
        entry.className = `index-entry ${level.type === 'data' ? 'data' : 'pointer'}`;
        entry.setAttribute('data-entry', j);
        
        if (level.type === 'data') {
          entry.textContent = `R${i * indicesState.calculations.brf + j + 1}`;
        } else {
          entry.textContent = `→B${j + 1}`;
        }
        
        content.appendChild(entry);
      }
      
      if ((level.type === 'data' && indicesState.calculations.brf > 3) ||
          (level.type !== 'data' && indicesState.calculations.bfri > 3)) {
        const moreEntry = document.createElement('div');
        moreEntry.className = 'index-entry empty';
        moreEntry.textContent = '...';
        content.appendChild(moreEntry);
      }
      
      blockEl.appendChild(header);
      blockEl.appendChild(content);
      levelDiv.appendChild(blockEl);
    }
    
    if (level.blocks > maxBlocksToShow) {
      const moreBlock = document.createElement('div');
      moreBlock.className = 'index-block empty';
      const moreHeader = document.createElement('div');
      moreHeader.className = 'index-block-header';
      moreHeader.textContent = `... (+${level.blocks - maxBlocksToShow})`;
      const moreContent = document.createElement('div');
      moreContent.className = 'index-block-content';
      moreBlock.appendChild(moreHeader);
      moreBlock.appendChild(moreContent);
      levelDiv.appendChild(moreBlock);
    }
    
    container.appendChild(levelDiv);
  });
  
  display.innerHTML = '';
  display.appendChild(container);
}

function displayCalculations() {
  const display = $('#indices-calculos-display');
  
  if (!display) return;
  
  if (!indicesState.calculations) {
    display.innerHTML = '<p>No hay cálculos disponibles</p>';
    return;
  }
  
  const container = document.createElement('div');
  
  indicesState.calculations.steps.forEach(step => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'calculo-step';
    
    const parts = step.split(' = ');
    if (parts.length > 1) {
      const formula = document.createElement('span');
      formula.className = 'calculo-formula';
      formula.textContent = parts[0] + ' = ';
      
      const resultado = document.createElement('span');
      resultado.className = 'calculo-resultado';
      resultado.textContent = parts.slice(1).join(' = ');
      
      stepDiv.appendChild(formula);
      stepDiv.appendChild(resultado);
    } else {
      stepDiv.textContent = step;
    }
    
    container.appendChild(stepDiv);
  });
  
  display.innerHTML = '';
  display.appendChild(container);
}

async function simulateSearch(registro) {
  const terminal = $('#indices-terminal');
  indicesState.searchCount = 0;
  
  logToTerminal(terminal, `Iniciando búsqueda del registro ${registro}`, 'info');
  
  // Limpiar highlights previos
  clearIndexHighlights();
  
  if (!indicesState.structure) {
    logToTerminal(terminal, 'No hay estructura calculada', 'error');
    return;
  }
  
  // Simular acceso a cada nivel
  for (let levelIndex = 0; levelIndex < indicesState.structure.levels.length; levelIndex++) {
    const level = indicesState.structure.levels[levelIndex];
    
    indicesState.searchCount++;
    const counterEl = $('#indices-contador-accesos');
    if (counterEl) counterEl.textContent = indicesState.searchCount;
    
    // Calcular qué bloque acceder
    let blockToAccess = 0;
    if (level.type === 'data') {
      blockToAccess = Math.floor((registro - 1) / indicesState.calculations.brf);
    } else {
      // Para índices, simular navegación
      blockToAccess = Math.floor(Math.random() * Math.min(level.blocks, 10));
    }
    
    // Destacar el bloque siendo accedido
    highlightIndexBlock(levelIndex, blockToAccess, 'searching');
    
    logToTerminal(terminal, `Acceso ${indicesState.searchCount}: ${level.name}, bloque ${blockToAccess + 1}`, 'info');
    
    // Pausa para animación
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (level.type === 'data') {
      // En datos, buscar el registro específico
      const entryIndex = (registro - 1) % indicesState.calculations.brf;
      highlightIndexEntry(levelIndex, blockToAccess, entryIndex, 'found');
      logToTerminal(terminal, `Registro ${registro} encontrado en posición ${entryIndex + 1}`, 'success');
      break;
    } else {
      // En índice, marcar como encontrado y continuar
      highlightIndexBlock(levelIndex, blockToAccess, 'found');
    }
  }
  
  logToTerminal(terminal, `Búsqueda completada en ${indicesState.searchCount} accesos`, 'success');
}

function highlightIndexBlock(levelIndex, blockIndex, type) {
  const block = $(`.index-block[data-level="${levelIndex}"][data-block="${blockIndex}"]`);
  if (block) {
    block.classList.remove('searching', 'found');
    block.classList.add(type);
  }
}

function highlightIndexEntry(levelIndex, blockIndex, entryIndex, type) {
  const block = $(`.index-block[data-level="${levelIndex}"][data-block="${blockIndex}"]`);
  if (block) {
    const entry = block.querySelector(`.index-entry[data-entry="${entryIndex}"]`);
    if (entry) {
      entry.classList.remove('searching', 'found');
      entry.classList.add(type);
    }
  }
}

function clearIndexHighlights() {
  $$('.index-block').forEach(block => {
    block.classList.remove('searching', 'found');
  });
  $$('.index-entry').forEach(entry => {
    entry.classList.remove('searching', 'found');
  });
}

function exportIndicesData() {
  const terminal = $('#indices-terminal');
  
  if (!indicesState.structure) {
    logToTerminal(terminal, 'No hay datos para exportar', 'warn');
    return;
  }
  
  const data = {
    algorithm: indicesState.algorithm,
    registros: indicesState.registros,
    longitudRegistro: indicesState.longitudRegistro,
    entradaIndice: indicesState.entradaIndice,
    tamañoBloque: indicesState.tamañoBloque,
    structure: indicesState.structure,
    calculations: indicesState.calculations,
    searchCount: indicesState.searchCount,
    terminal: terminal?.textContent || ''
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'indices.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  logToTerminal(terminal, 'Datos exportados correctamente', 'success');
}

function importIndicesData(event) {
  const terminal = $('#indices-terminal');
  const file = event.target.files[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      indicesState.algorithm = data.algorithm;
      indicesState.registros = data.registros;
      indicesState.longitudRegistro = data.longitudRegistro;
      indicesState.entradaIndice = data.entradaIndice;
      indicesState.tamañoBloque = data.tamañoBloque;
      indicesState.structure = data.structure;
      indicesState.calculations = data.calculations;
      indicesState.searchCount = data.searchCount || 0;
      
      // Actualizar interfaz
      const registrosEl = $('#indices-registros');
      const longitudEl = $('#indices-longitud-registro');
      const entradaEl = $('#indices-entrada-indice');
      const tamañoEl = $('#indices-tamaño-bloque');
      const counterEl = $('#indices-contador-accesos');
      
      if (registrosEl) registrosEl.value = data.registros;
      if (longitudEl) longitudEl.value = data.longitudRegistro;
      if (entradaEl) entradaEl.value = data.entradaIndice;
      if (tamañoEl) tamañoEl.value = data.tamañoBloque;
      if (counterEl) counterEl.textContent = data.searchCount || 0;
      
      renderIndexStructure();
      displayCalculations();
      
      if (data.terminal && terminal) {
        terminal.textContent = data.terminal;
      }
      
      logToTerminal(terminal, 'Datos importados correctamente', 'success');
      
    } catch (error) {
      logToTerminal(terminal, 'Error al importar datos: formato inválido', 'error');
    }
  };
  
  reader.readAsText(file);
}