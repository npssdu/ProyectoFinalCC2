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
  const applyTheme = () => {
    document.documentElement.setAttribute('data-color-scheme', current);
    $('.theme-icon', toggleBtn).textContent = current === 'light' ? '🌙' : '☀️';
  };
  applyTheme();
  toggleBtn.addEventListener('click', () => {
    current = current === 'light' ? 'dark' : 'light';
    applyTheme();
  });
})();

/***************************************************
 * GESTIÓN DE MODALES                              *
 ***************************************************/
(function initModals() {
  const algorithmBtns = $$('.algorithm-btn');
  const modalHuffman = $('#modal-arboles-huffman');
  const modalExternas = $('#modal-externas');
  const modalGeneric = $('#modal-generic');

  const openModal = modal => modal.classList.add('active');
  const closeModal = modal => modal.classList.remove('active');

  // Cierra con click en overlay
  $$('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal);
    });
    $('.modal__close', modal).addEventListener('click', () => closeModal(modal));
  });

  algorithmBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const algo = btn.dataset.algorithm;
      if (algo === 'arboles-huffman') {
        openModal(modalHuffman);
      } else if (algo.startsWith('ext-')) {
        // Algoritmos de búsquedas externas
        const title = btn.querySelector('h3').textContent;
        $('#externas-modal-title').textContent = title;
        initExternalSearchModal(algo);
        openModal(modalExternas);
      } else {
        $('#modal-title').textContent = btn.querySelector('h3').textContent;
        $('#algorithm-inputs').innerHTML = `<p>Próximamente disponible…</p>`;
        $('#algorithm-display').innerHTML = '';
        $('#algorithm-terminal').innerHTML = '';
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

  const COLORS = {
    leaf: '#27ae60',
    internal: '#3498db',
    root: '#e67e22',
    highlighted: '#9b59b6'
  };

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

    // Proceso iterativo
    while (queue.length > 1) {
      const n1 = queue.shift();
      const n2 = queue.shift();
      const parent = new HuffmanNode(undefined, n1.freq + n2.freq, Math.min(n1.order, n2.order));
      parent.left = n1;
      parent.right = n2;
      logToTerminal(terminal, `Se fusionan ${formatNode(n1)} + ${formatNode(n2)} = ${parent.freq}`, 'success');
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

      // Eventos de drag
      nodeGroup.addEventListener('contextmenu', e => e.preventDefault());
      nodeGroup.addEventListener('mousedown', e => {
        if (e.button === 2) {
          state.draggingNode = node;
          e.stopPropagation();
        }
      });
      svg.addEventListener('mousemove', e => {
        if (state.draggingNode) {
          // Convertir coord de pantalla a SVG
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
          state.draggingNode.x = svgPt.x;
          state.draggingNode.y = svgPt.y;
          renderTree(state.root); // Redibujar
        }
      });
      svg.addEventListener('mouseup', () => {
        state.draggingNode = null;
      });

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
    zoomLevelSpan.textContent = `${state.scale.toFixed(1)}x`;
  }

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
  zoomResetBtn.addEventListener('click', () => {
    state.scale = 1;
    state.translateX = 0;
    state.translateY = 0;
    updateTransform();
  });

  /************* OPERACIONES **************/
  function rebuild(currentMsg) {
    state.message = currentMsg;
    state.root = buildTreeFromMessage(currentMsg);
    renderTree(state.root);
  }

  buildBtn.addEventListener('click', () => {
    const msg = messageInput.value.trim().toUpperCase();
    if (!msg) {
      logToTerminal(terminal, 'El mensaje está vacío', 'error');
      return;
    }
    rebuild(msg);
    logToTerminal(terminal, 'Árbol construido correctamente', 'success');
  });

  insertBtn.addEventListener('click', () => {
    const ch = keyInput.value.trim().toUpperCase();
    if (!ch) return;
    state.message += ch;
    rebuild(state.message);
    logToTerminal(terminal, `Insertado '${ch}'`, 'success');
  });

  deleteBtn.addEventListener('click', () => {
    const ch = keyInput.value.trim().toUpperCase();
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

  searchBtn.addEventListener('click', () => {
    const ch = keyInput.value.trim().toUpperCase();
    if (!ch) return;
    // Buscar hoja
    const targetNode = findNode(state.root, n => n.char === ch);
    if (targetNode) {
      // Resaltar
      highlightNode(targetNode);
      logToTerminal(terminal, `Encontrado '${ch}' con frecuencia ${targetNode.freq}`, 'success');
    } else {
      logToTerminal(terminal, `Carácter '${ch}' no encontrado`, 'error');
    }
  });

  resetBtn.addEventListener('click', () => {
    state.message = '';
    state.root = null;
    svg.innerHTML = '';
    terminal.innerHTML = '';
    messageInput.value = '';
    keyInput.value = '';
    logToTerminal(terminal, 'Estado reseteado', 'info');
  });

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
  exportBtn.addEventListener('click', () => {
    if (!state.message) {
      logToTerminal(terminal, 'Nada que exportar', 'warn');
      return;
    }
    const csvLines = [];
    csvLines.push('#CONSOLA');
    csvLines.push(terminal.textContent.trim().replace(/\n/g, '\\n'));
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
      terminal.textContent = sections[0].replace(/\\n/g, '\n') + '\n';
      const msg = sections[1].replace(/[^A-Za-z]/g, '').toUpperCase();
      messageInput.value = msg;
      rebuild(msg);
      logToTerminal(terminal, 'Importación completada', 'success');
    };
    reader.readAsText(file);
  });
})();

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
  
  // Configurar interfaz según algoritmo
  switch(algorithm) {
    case 'ext-lineal':
      setupLinearSearch(configDiv, controlsDiv);
      break;
    case 'ext-binaria':
      setupBinarySearch(configDiv, controlsDiv);
      break;
    case 'ext-hash-mod':
      setupHashMod(configDiv, controlsDiv);
      break;
    case 'ext-hash-cuadrado':
      setupHashSquare(configDiv, controlsDiv);
      break;
    case 'ext-hash-plegamiento':
      setupHashFolding(configDiv, controlsDiv);
      break;
    case 'ext-hash-truncamiento':
      setupHashTruncation(configDiv, controlsDiv);
      break;
  }
}

function setupLinearSearch(configDiv, controlsDiv) {
  configDiv.innerHTML = `
    <h3>Configuración - Búsqueda Lineal por Bloques</h3>
    <div class="form-group">
      <label class="form-label">Número total de elementos (n):</label>
      <input type="number" class="form-control" id="ext-total-elements" min="1" value="16">
    </div>
    <div class="form-group">
      <label class="form-label">Longitud de clave:</label>
      <input type="number" class="form-control" id="ext-key-length" min="1" value="3">
    </div>
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

  setupCommonEvents();
}

function setupBinarySearch(configDiv, controlsDiv) {
  configDiv.innerHTML = `
    <h3>Configuración - Búsqueda Binaria por Bloques</h3>
    <div class="form-group">
      <label class="form-label">Número total de elementos (n):</label>
      <input type="number" class="form-control" id="ext-total-elements" min="1" value="16">
    </div>
    <div class="form-group">
      <label class="form-label">Longitud de clave:</label>
      <input type="number" class="form-control" id="ext-key-length" min="1" value="3">
    </div>
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

  setupCommonEvents();
}

function setupHashMod(configDiv, controlsDiv) {
  configDiv.innerHTML = `
    <h3>Configuración - Hash Mod por Bloques</h3>
    <div class="form-group">
      <label class="form-label">Número total de elementos (n):</label>
      <input type="number" class="form-control" id="ext-total-elements" min="1" value="16">
    </div>
    <div class="form-group">
      <label class="form-label">Longitud de clave:</label>
      <input type="number" class="form-control" id="ext-key-length" min="1" value="3">
    </div>
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

  setupCommonEvents();
}

function setupHashSquare(configDiv, controlsDiv) {
  configDiv.innerHTML = `
    <h3>Configuración - Hash Cuadrado por Bloques</h3>
    <div class="form-group">
      <label class="form-label">Número total de elementos (n):</label>
      <input type="number" class="form-control" id="ext-total-elements" min="1" value="16">
    </div>
    <div class="form-group">
      <label class="form-label">Longitud de clave:</label>
      <input type="number" class="form-control" id="ext-key-length" min="1" value="3">
    </div>
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

  setupCommonEvents();
}

function setupHashFolding(configDiv, controlsDiv) {
  configDiv.innerHTML = `
    <h3>Configuración - Hash Plegamiento por Bloques</h3>
    <div class="form-group">
      <label class="form-label">Número total de elementos (n):</label>
      <input type="number" class="form-control" id="ext-total-elements" min="1" value="16">
    </div>
    <div class="form-group">
      <label class="form-label">Longitud de clave:</label>
      <input type="number" class="form-control" id="ext-key-length" min="1" value="3">
    </div>
    <div class="form-group">
      <label class="form-label">Cifras menos significativas por grupo:</label>
      <input type="number" class="form-control" id="ext-fold-digits" min="1" value="2">
    </div>
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

  setupCommonEvents();
}

function setupHashTruncation(configDiv, controlsDiv) {
  configDiv.innerHTML = `
    <h3>Configuración - Hash Truncamiento por Bloques</h3>
    <div class="form-group">
      <label class="form-label">Número total de elementos (n):</label>
      <input type="number" class="form-control" id="ext-total-elements" min="1" value="16">
    </div>
    <div class="form-group">
      <label class="form-label">Longitud de clave:</label>
      <input type="number" class="form-control" id="ext-key-length" min="1" value="3">
    </div>
    <div class="form-group">
      <label class="form-label">Posiciones de dígitos (separadas por comas):</label>
      <input type="text" class="form-control" id="ext-positions" placeholder="Ej: 1,3,5" value="1,2">
    </div>
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

  setupCommonEvents();
}

function setupCommonEvents() {
  const terminal = $('#externas-terminal');
  
  // Inicializar estructura
  $('#ext-init').addEventListener('click', () => {
    const n = parseInt($('#ext-total-elements').value);
    const keyLength = parseInt($('#ext-key-length').value);
    
    if (n < 1 || keyLength < 1) {
      logToTerminal(terminal, 'Valores inválidos', 'error');
      return;
    }
    
    // Obtener parámetros adicionales según algoritmo
    if (externasState.algorithm === 'ext-hash-plegamiento') {
      externasState.additionalParams.foldDigits = parseInt($('#ext-fold-digits').value);
    } else if (externasState.algorithm === 'ext-hash-truncamiento') {
      const positions = $('#ext-positions').value.split(',').map(p => parseInt(p.trim())).filter(p => p > 0);
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
    $('#ext-info').innerHTML = `
      <strong>Cálculo de bloques:</strong><br>
      Bloques: √(${n}) = ${blocks}<br>
      Elementos por bloque: ${elementsPerBlock}
    `;
    
    renderBlocks();
    logToTerminal(terminal, `Estructura inicializada: ${blocks} bloques, ${elementsPerBlock} elementos por bloque`, 'success');
  });
  
  // Insertar elemento
  $('#ext-insert').addEventListener('click', () => {
    const key = $('#ext-key').value.trim().toUpperCase();
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
    
    insertElement(key);
    $('#ext-key').value = '';
  });
  
  // Buscar elemento
  $('#ext-search').addEventListener('click', () => {
    const key = $('#ext-key').value.trim().toUpperCase();
    if (!key) {
      logToTerminal(terminal, 'Clave vacía', 'error');
      return;
    }
    
    searchElement(key);
  });
  
  // Eliminar elemento
  $('#ext-delete').addEventListener('click', () => {
    const key = $('#ext-key').value.trim().toUpperCase();
    if (!key) {
      logToTerminal(terminal, 'Clave vacía', 'error');
      return;
    }
    
    deleteElement(key);
    $('#ext-key').value = '';
  });
  
  // Resetear
  $('#ext-reset').addEventListener('click', () => {
    externasState.blocks = [];
    externasState.keys = new Set();
    $('#externas-display').innerHTML = '';
    $('#ext-info').innerHTML = '';
    terminal.innerHTML = '';
    logToTerminal(terminal, 'Estructura reseteada', 'info');
  });
  
  // I/O Events
  $('#externas-export').addEventListener('click', () => exportExternalData());
  $('#externas-import-btn').addEventListener('click', () => $('#externas-import').click());
  $('#externas-import').addEventListener('change', importExternalData);
}

function insertElement(key) {
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
  
  renderBlocks();
  logToTerminal(terminal, `Clave '${key}' insertada en bloque ${targetBlock}`, 'success');
}

function searchElement(key) {
  const terminal = $('#externas-terminal');
  
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
    highlightBlock(i + 1, 'searching');
    
    logToTerminal(terminal, `Buscando en bloque ${i + 1}...`, 'info');
    
    // Buscar dentro del bloque
    for (let j = 0; j < block.elements.length; j++) {
      highlightElement(i + 1, j, 'searching');
      
      if (block.elements[j] === key) {
        highlightElement(i + 1, j, 'found');
        highlightBlock(i + 1, 'found');
        logToTerminal(terminal, `Elemento '${key}' encontrado en bloque ${i + 1}, posición ${j + 1}`, 'success');
        return;
      }
    }
    
    // Limpiar highlight del bloque
    setTimeout(() => clearHighlights(), 500);
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
    
    highlightBlock(mid + 1, 'searching');
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
  highlightBlock(targetBlock + 1, 'searching');
  
  let blockLeft = 0;
  let blockRight = block.elements.length - 1;
  
  while (blockLeft <= blockRight) {
    const mid = Math.floor((blockLeft + blockRight) / 2);
    
    highlightElement(targetBlock + 1, mid, 'searching');
    
    if (block.elements[mid] === key) {
      highlightElement(targetBlock + 1, mid, 'found');
      highlightBlock(targetBlock + 1, 'found');
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
  highlightBlock(targetBlock, 'searching');
  
  // Buscar dentro del bloque
  for (let i = 0; i < block.elements.length; i++) {
    highlightElement(targetBlock, i, 'searching');
    
    if (block.elements[i] === key) {
      highlightElement(targetBlock, i, 'found');
      highlightBlock(targetBlock, 'found');
      logToTerminal(terminal, `Elemento '${key}' encontrado en bloque ${targetBlock}, posición ${i + 1}`, 'success');
      return;
    }
  }
  
  logToTerminal(terminal, `Elemento '${key}' no encontrado`, 'error');
}

function deleteElement(key) {
  const terminal = $('#externas-terminal');
  
  for (let i = 0; i < externasState.blocks.length; i++) {
    const block = externasState.blocks[i];
    const index = block.elements.indexOf(key);
    
    if (index !== -1) {
      block.elements.splice(index, 1);
      externasState.keys.delete(key);
      renderBlocks();
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

function renderBlocks() {
  const display = $('#externas-display');
  
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

function highlightBlock(blockId, type) {
  clearHighlights();
  const block = $(`.block[data-block="${blockId}"]`);
  if (block) {
    block.classList.add(type);
  }
}

function highlightElement(blockId, elementIndex, type) {
  const block = $(`.block[data-block="${blockId}"]`);
  if (block) {
    const element = block.querySelector(`.block-item[data-element="${elementIndex}"]`);
    if (element) {
      element.classList.add(type);
    }
  }
}

function clearHighlights() {
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
    terminal: terminal.textContent
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
      $('#ext-total-elements').value = data.totalElements;
      $('#ext-key-length').value = data.keyLength;
      $('#ext-info').innerHTML = `
        <strong>Cálculo de bloques:</strong><br>
        Bloques: ${data.numBlocks}<br>
        Elementos por bloque: ${data.elementsPerBlock}
      `;
      
      renderBlocks();
      
      if (data.terminal) {
        terminal.textContent = data.terminal;
      }
      
      logToTerminal(terminal, 'Datos importados correctamente', 'success');
      
    } catch (error) {
      logToTerminal(terminal, 'Error al importar datos: formato inválido', 'error');
    }
  };
  
  reader.readAsText(file);
}