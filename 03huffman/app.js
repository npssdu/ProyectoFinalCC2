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
  // Map de algoritmo a modal
  const algorithmBtns = $$('.algorithm-btn');
  const modalHuffman = $('#modal-arboles-huffman');
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
