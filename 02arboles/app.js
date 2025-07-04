// ================================================================
// Algoritmos de Ciencias de la Computación II – Versión Corregida
// Implementación EXACTA de Árboles por Residuos Múltiples según especificación
// ================================================================

// ---------------------------
// Estado global de la aplicación
// ---------------------------
let currentAlgorithm = null;
let dataStructure = [];
let hashTable = [];
let currentTree = null;
let treeNodesList = [];
let nodeIdCounter = 0;

const currentConfig = {
    structureSize: 10,
    keyLength: 3,
    collisionMethod: 'linear',
    foldingDigits: 3,
    truncationPositions: [1, 4, 7],
    modulo: 7,
    bitsPerBranch: 2,
    maxLinks: 4
};

// Casos de prueba para funciones hash
const testCases = {
    hashPlegamiento: [
        {key: "10203040", groups: 3, expected: 173, calculation: "102+030+40=172, (172%1000)+1=173"},
        {key: "25303540", groups: 3, expected: 329, calculation: "253+035+40=328, (328%1000)+1=329"},
        {key: "50153028", groups: 3, expected: 60, calculation: "501+530+28=1059, (1059%1000)+1=60"},
        {key: "70809010", groups: 3, expected: 809, calculation: "708+090+10=808, (808%1000)+1=809"},
        {key: "17273747", groups: 3, expected: 957, calculation: "172+737+47=956, (956%1000)+1=957"}
    ],
    hashTruncamiento: [
        {key: "10203040", positions: [1,4,7], expected: 105, calculation: "Posiciones 1,4,7 -> 1,0,4 -> 104, (104%1000)+1=105"},
        {key: "25303540", positions: [1,4,7], expected: 205, calculation: "Posiciones 1,4,7 -> 2,0,4 -> 204, (204%1000)+1=205"},
        {key: "50153028", positions: [1,4,7], expected: 553, calculation: "Posiciones 1,4,7 -> 5,5,2 -> 552, (552%1000)+1=553"},
        {key: "70809010", positions: [1,4,7], expected: 702, calculation: "Posiciones 1,4,7 -> 7,0,1 -> 701, (701%1000)+1=702"},
        {key: "17273747", positions: [1,4,7], expected: 175, calculation: "Posiciones 1,4,7 -> 1,7,4 -> 174, (174%1000)+1=175"}
    ]
};

// ---------------------------
// Referencias a elementos DOM
// ---------------------------
const modal = document.getElementById('algorithm-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalClose = document.querySelector('.modal-close');
const modalTitle = document.getElementById('modal-title');
const structureDisplay = document.getElementById('structure-display');
const resultsTerminal = document.getElementById('results-terminal');
const treeCanvas = document.getElementById('tree-canvas');

// Theme
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
let isDarkMode = false;

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.setAttribute('data-color-scheme', isDarkMode ? 'dark' : 'light');
    themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
}

document.body.setAttribute('data-color-scheme', 'light');
themeToggle.addEventListener('click', toggleTheme);

// ---------------------------
// Navegación por pestañas
// ---------------------------
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        navTabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// ---------------------------
// Selección de algoritmo
// ---------------------------
const algorithmCards = document.querySelectorAll('.algorithm-card');
algorithmCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            e.preventDefault();
        }
        const algorithm = card.dataset.algorithm;
        openAlgorithmModal(algorithm);
    });
    
    const button = card.querySelector('button');
    if (button) {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const algorithm = card.dataset.algorithm;
            openAlgorithmModal(algorithm);
        });
    }
});

// ---------------------------
// Apertura de modal
// ---------------------------
function openAlgorithmModal(algorithm) {
    currentAlgorithm = algorithm;
    resetStructure();
    clearTerminal();
    setupUIForAlgorithm();
    modal.classList.add('active');
    focusFirstField();
}

function closeModal() {
    modal.classList.remove('active');
    currentAlgorithm = null;
    resetStructure();
    clearTerminal();
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

// ---------------------------
// Inputs y botones comunes
// ---------------------------
const structureSizeInput = document.getElementById('structure-size');
const keyLengthInput = document.getElementById('key-length');
const collisionMethodSelect = document.getElementById('collision-method');
const foldingDigitsInput = document.getElementById('folding-digits');
const truncationPositionsInput = document.getElementById('truncation-positions');
const messageInput = document.getElementById('message-input');
const moduloInput = document.getElementById('modulo-input');
const bitsPerBranchInput = document.getElementById('bits-per-branch');
const calculateLinksBtn = document.getElementById('calculate-links-btn');
const linksResult = document.getElementById('links-result');
const initializeBtn = document.getElementById('initialize-structure');

const keyInput = document.getElementById('key-input');
const insertBtn = document.getElementById('insert-btn');
const deleteBtn = document.getElementById('delete-btn');
const searchBtn = document.getElementById('search-btn');
const sortBtn = document.getElementById('sort-btn');
const resetBtn = document.getElementById('reset-btn');

const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

const testFoldingBtn = document.getElementById('test-folding-btn');
const testTruncationBtn = document.getElementById('test-truncation-btn');
const testButtonsGroup = document.getElementById('test-buttons-group');

// ---------------------------
// Configurar UI según algoritmo
// ---------------------------
function setupUIForAlgorithm() {
    const titles = {
        'linear-search': 'Búsqueda Lineal',
        'binary-search': 'Búsqueda Binaria',
        'hash-mod': 'Hash Mod',
        'hash-square': 'Hash Cuadrado',
        'hash-folding': 'Hash Plegamiento',
        'hash-truncation': 'Hash Truncamiento',
        'tree-digital': 'Árboles Digitales',
        'tree-residue-particular': 'Árboles por Residuos Particular',
        'tree-residue-multiple': 'Árboles por Residuos Múltiples',
        'tree-huffman': 'Árboles de Huffman'
    };
    modalTitle.textContent = titles[currentAlgorithm] || 'Algoritmo';

    // Grupos de inputs
    const collisionGroup = document.getElementById('collision-method-group');
    const foldingGroup = document.getElementById('folding-digits-group');
    const truncationGroup = document.getElementById('truncation-positions-group');
    const messageGroup = document.getElementById('message-input-group');
    const moduloGroup = document.getElementById('modulo-input-group');
    const bitsPerBranchGroup = document.getElementById('bits-per-branch-group');
    const calculateLinksGroup = document.getElementById('calculate-links-group');
    const keyLengthGroup = document.getElementById('key-length-group');
    const structureSizeGroup = document.getElementById('structure-size-group');
    const keyLabel = document.getElementById('key-input-label');

    // Ocultar todos primero
    [collisionGroup, foldingGroup, truncationGroup, testButtonsGroup, messageGroup, 
     moduloGroup, bitsPerBranchGroup, calculateLinksGroup].forEach(group => {
        if (group) group.style.display = 'none';
    });

    // Reset controls
    keyInput.value = "";
    keyInput.disabled = false;
    [sortBtn, insertBtn, deleteBtn, searchBtn].forEach(btn => btn.disabled = false);

    // Configurar según algoritmo
    if (currentAlgorithm.startsWith('hash')) {
        collisionGroup.style.display = 'block';
        if (currentAlgorithm === 'hash-folding') {
            foldingGroup.style.display = 'block';
            testButtonsGroup.style.display = 'block';
            testFoldingBtn.style.display = 'block';
            testTruncationBtn.style.display = 'none';
        } else if (currentAlgorithm === 'hash-truncation') {
            truncationGroup.style.display = 'block';
            testButtonsGroup.style.display = 'block';
            testFoldingBtn.style.display = 'none';
            testTruncationBtn.style.display = 'block';
        }
    } else if (currentAlgorithm.startsWith('tree')) {
        structureSizeGroup.style.display = 'none';
        keyLengthGroup.style.display = 'none';
        messageGroup.style.display = 'block';
        keyLabel.textContent = 'Clave individual (una letra)';
        
        if (currentAlgorithm === 'tree-huffman') {
            [keyInput, insertBtn, deleteBtn, searchBtn, sortBtn].forEach(el => el.disabled = true);
        }
        
        if (currentAlgorithm === 'tree-residue-particular') {
            moduloGroup.style.display = 'block';
        }
        
        if (currentAlgorithm === 'tree-residue-multiple') {
            bitsPerBranchGroup.style.display = 'block';
            calculateLinksGroup.style.display = 'block';
        }
    }

    // Mostrar canvas solo para árboles
    treeCanvas.style.display = currentAlgorithm.startsWith('tree') ? 'block' : 'none';

    // Reset visualización
    structureDisplay.innerHTML = '';
    if (currentAlgorithm.startsWith('tree')) {
        structureDisplay.appendChild(treeCanvas);
        setupTreeCanvas();
    }
}

function focusFirstField() {
    if (currentAlgorithm.startsWith('tree')) {
        messageInput.focus();
    } else {
        structureSizeInput.focus();
    }
}

// ---------------------------
// Clases de Árbol - IMPLEMENTACIÓN ESPECÍFICA RESIDUOS MÚLTIPLES
// ---------------------------
class MultiTreeNode {
    constructor(data = null) {
        this.id = ++nodeIdCounter;
        this.data = data;
        this.children = [];
        this.x = 0;
        this.y = 0;
    }
    
    getChild(index) {
        return this.children[index] || null;
    }
    
    setChild(index, node) {
        while (this.children.length <= index) {
            this.children.push(null);
        }
        this.children[index] = node;
    }
}

// FUNCIÓN CRÍTICA: Obtener últimos 5 bits del ASCII
function getLast5Bits(char) {
    const ascii = char.charCodeAt(0);
    const binary = ascii.toString(2).padStart(8, '0');
    return binary.slice(-5); // Últimos 5 bits
}

// FUNCIÓN PRINCIPAL: Segmentar bits según M bits por rama
function segmentBits(bits5, M) {
    const segments = [];
    for (let i = 0; i < bits5.length; i += M) {
        const segment = bits5.slice(i, i + M);
        if (segment.length === M) {
            segments.push(segment);
        } else if (segment.length > 0) {
            // Rellenar con ceros a la derecha si es necesario
            segments.push(segment.padEnd(M, '0'));
        }
    }
    return segments;
}

// INSERCIÓN ESPECÍFICA para Árboles por Residuos Múltiples
function residueMultipleInsertWithSteps(char) {
    const ascii = char.charCodeAt(0);
    const binary = ascii.toString(2).padStart(8, '0');
    const bits5 = getLast5Bits(char);
    const M = currentConfig.bitsPerBranch;
    const segments = segmentBits(bits5, M);
    
    let steps = `Letra '${char}' → ASCII=${ascii}, bits5=${bits5}\n`;
    
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const rama = parseInt(segment, 2);
        steps += `Segmento '${segment}' → rama ${rama}\n`;
    }
    
    // Si no hay raíz, crear nodo raíz vacío
    if (!currentTree) {
        currentTree = new MultiTreeNode(null);
        steps += `Creando nodo raíz vacío\n`;
    }
    
    let current = currentTree;
    let segmentIndex = 0;
    
    while (segmentIndex < segments.length) {
        const segment = segments[segmentIndex];
        const rama = parseInt(segment, 2);
        steps += `  Segmento '${segment}' → rama ${rama}\n`;
        
        const child = current.getChild(rama);
        
        if (child === null) {
            // Espacio libre, insertar aquí
            current.setChild(rama, new MultiTreeNode(char));
            steps += `    Espacio libre → insertar aquí sin crear nodo extra.\n`;
            steps += `    Letra '${char}' insertada en rama ${rama}\n`;
            break;
        } else if (child.data !== null) {
            // Colisión detectada
            steps += `    Colisión con '${child.data}' → descender y continuar.\n`;
            // Convertir nodo con datos en nodo intermedio
            const existingChar = child.data;
            child.data = null;
            
            // Reposicionar el carácter existente
            const existingBits5 = getLast5Bits(existingChar);
            const existingSegments = segmentBits(existingBits5, M);
            insertCharAtLevel(child, existingChar, existingSegments, segmentIndex + 1);
            
            // Continuar con el carácter actual
            current = child;
            segmentIndex++;
        } else {
            // Nodo intermedio, descender
            steps += `    Nodo intermedio, descender.\n`;
            current = child;
            segmentIndex++;
        }
    }
    
    // Si llegamos aquí y aún tenemos segmentos, insertar
    if (segmentIndex >= segments.length && current.data === null) {
        current.data = char;
        steps += `  Bits agotados, insertar '${char}' en nodo actual.\n`;
    }
    
    logToTerminal('info', steps);
}

// Función auxiliar para insertar un carácter en un nivel específico
function insertCharAtLevel(node, char, segments, startLevel) {
    let current = node;
    
    for (let i = startLevel; i < segments.length; i++) {
        const segment = segments[i];
        const rama = parseInt(segment, 2);
        
        if (current.getChild(rama) === null) {
            current.setChild(rama, new MultiTreeNode(char));
            return;
        } else {
            if (current.getChild(rama).data === null) {
                current = current.getChild(rama);
            } else {
                // Otra colisión, crear nodo intermedio
                const existingChar = current.getChild(rama).data;
                current.getChild(rama).data = null;
                const existingBits5 = getLast5Bits(existingChar);
                const existingSegments = segmentBits(existingBits5, currentConfig.bitsPerBranch);
                insertCharAtLevel(current.getChild(rama), existingChar, existingSegments, i + 1);
                current = current.getChild(rama);
            }
        }
    }
    
    // Si llegamos aquí, insertar el carácter
    if (current.data === null) {
        current.data = char;
    }
}

// BÚSQUEDA ESPECÍFICA para Árboles por Residuos Múltiples
function residueMultipleSearchWithSteps(char) {
    const ascii = char.charCodeAt(0);
    const bits5 = getLast5Bits(char);
    const M = currentConfig.bitsPerBranch;
    const segments = segmentBits(bits5, M);
    
    let steps = `Buscando: ${char} (ASCII ${ascii}) → bits5=${bits5}\n`;
    
    if (!currentTree) {
        steps += 'Árbol vacío, elemento no encontrado';
        logToTerminal('error', steps);
        return null;
    }
    
    let current = currentTree;
    
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const rama = parseInt(segment, 2);
        steps += `Segmento '${segment}' → rama ${rama}`;
        
        const child = current.getChild(rama);
        if (child === null) {
            steps += ' → No existe nodo, elemento no encontrado';
            logToTerminal('error', steps);
            return null;
        }
        
        if (child.data === char) {
            steps += ` → Encontrado '${char}'`;
            logToTerminal('success', steps);
            return child;
        }
        
        steps += ' → Continuar\n';
        current = child;
    }
    
    // Verificar si el nodo final contiene el carácter
    if (current.data === char) {
        steps += `Elemento '${char}' encontrado`;
        logToTerminal('success', steps);
        return current;
    } else {
        steps += `Posición encontrada pero contiene '${current.data}', no '${char}'`;
        logToTerminal('error', steps);
        return null;
    }
}

// Clase TreeNode para otros tipos de árboles
class TreeNode {
    constructor(data = null) {
        this.id = ++nodeIdCounter;
        this.data = data;
        this.left = null;
        this.right = null;
        this.x = 0;
        this.y = 0;
    }
}

function bstInsert(root, node, compareFn) {
    if (!root) return node;
    if (compareFn(node.key || node.data, root.key || root.data) < 0) {
        root.left = bstInsert(root.left, node, compareFn);
    } else {
        root.right = bstInsert(root.right, node, compareFn);
    }
    return root;
}

function bstSearch(root, key, compareFn) {
    if (!root) return null;
    if (compareFn(key, root.key || root.data) === 0) return root;
    if (compareFn(key, root.key || root.data) < 0) return bstSearch(root.left, key, compareFn);
    return bstSearch(root.right, key, compareFn);
}

function bstDelete(root, key, compareFn) {
    if (!root) return null;
    if (compareFn(key, root.key || root.data) < 0) {
        root.left = bstDelete(root.left, key, compareFn);
    } else if (compareFn(key, root.key || root.data) > 0) {
        root.right = bstDelete(root.right, key, compareFn);
    } else {
        if (!root.left) return root.right;
        if (!root.right) return root.left;
        let successor = root.right;
        while (successor.left) successor = successor.left;
        root.key = successor.key;
        root.data = successor.data;
        root.right = bstDelete(root.right, successor.key || successor.data, compareFn);
    }
    return root;
}

// ---------------------------
// Event Listener para calcular enlaces
// ---------------------------
if (calculateLinksBtn) {
    calculateLinksBtn.addEventListener('click', () => {
        const M = parseInt(bitsPerBranchInput.value);
        if (isNaN(M) || M < 1 || M > 5) {
            logToTerminal('error', 'M debe estar entre 1 y 5');
            linksResult.textContent = '';
            return;
        }
        
        const enlaces = Math.pow(2, M);
        currentConfig.bitsPerBranch = M;
        currentConfig.maxLinks = enlaces;
        
        linksResult.textContent = `Enlaces: ${enlaces}`;
        logToTerminal('info', `Configuración: M=${M}, Enlaces=2^${M}=${enlaces}`);
    });
}

// ---------------------------
// Inicialización
// ---------------------------
initializeBtn.addEventListener('click', () => {
    if (currentAlgorithm.startsWith('tree')) {
        initializeTree();
    } else {
        initializeLinearHashStructures();
    }
});

function initializeLinearHashStructures() {
    const size = parseInt(structureSizeInput.value);
    const keyLength = parseInt(keyLengthInput.value);
    
    if (size < 1) {
        logToTerminal('error', 'El tamaño debe ser >= 1');
        return;
    }
    if (keyLength < 1) {
        logToTerminal('error', 'La longitud de la clave debe ser >= 1');
        return;
    }
    
    currentConfig.structureSize = size;
    currentConfig.keyLength = keyLength;
    currentConfig.collisionMethod = collisionMethodSelect.value;
    
    if (currentAlgorithm === 'hash-folding') {
        const digits = parseInt(foldingDigitsInput.value);
        if (digits < 1) {
            logToTerminal('error', 'Grupos inválidos');
            return;
        }
        currentConfig.foldingDigits = digits;
    }
    
    if (currentAlgorithm === 'hash-truncation') {
        const positions = truncationPositionsInput.value.trim();
        if (!positions) {
            logToTerminal('error', 'Posiciones requeridas');
            return;
        }
        try {
            currentConfig.truncationPositions = positions.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p > 0);
        } catch (e) {
            logToTerminal('error', 'Formato de posiciones inválido');
            return;
        }
    }

    if (currentAlgorithm.includes('hash')) {
        initializeHashTable();
    } else {
        initializeArray();
    }
    
    renderStructure();
    logToTerminal('success', `Estructura inicializada: tamaño ${size}, longitud clave ${keyLength}`);
}

function initializeTree() {
    currentTree = null;
    treeNodesList = [];
    nodeIdCounter = 0;
    clearSVG();

    const message = messageInput.value.trim();
    if (!message) {
        logToTerminal('error', 'Debe ingresar un mensaje');
        return;
    }

    logToTerminal('info', `Inicializando árbol con mensaje: "${message}"`);

    if (currentAlgorithm === 'tree-huffman') {
        buildHuffmanTree(message);
    } else if (currentAlgorithm === 'tree-digital') {
        // IMPLEMENTACIÓN CORREGIDA: Procesar cada carácter con la lógica exacta
        logToTerminal('info', '=== Construyendo Árbol Digital ===');
        for (const ch of message) {
            digitalInsertWithSteps(ch);
            layoutAndRenderTree(ch, 'insert');
        }
        logToTerminal('success', '=== Árbol Digital completado ===');
    } else if (currentAlgorithm === 'tree-residue-particular') {
        const mod = parseInt(moduloInput.value);
        if (isNaN(mod) || mod < 2) {
            logToTerminal('error', 'Módulo debe ser >= 2');
            return;
        }
        currentConfig.modulo = mod;
        logToTerminal('info', `Módulo: ${mod}`);
        for (const ch of message) {
            residueParticularInsert(ch);
        }
    } else if (currentAlgorithm === 'tree-residue-multiple') {
        // IMPLEMENTACIÓN ESPECÍFICA de Árboles por Residuos Múltiples
        if (currentConfig.maxLinks === undefined) {
            logToTerminal('error', 'Debe calcular los enlaces primero (botón "Calcular enlaces")');
            return;
        }
        
        logToTerminal('info', `=== Construyendo Árbol por Residuos Múltiples ===`);
        logToTerminal('info', `M=${currentConfig.bitsPerBranch}, Enlaces=${currentConfig.maxLinks}`);
        
        for (const ch of message) {
            residueMultipleInsertWithSteps(ch);
            layoutAndRenderTree(ch, 'insert');
        }
        logToTerminal('success', '=== Árbol por Residuos Múltiples completado ===');
    }

    if (currentAlgorithm !== 'tree-digital' && currentAlgorithm !== 'tree-residue-multiple') {
        layoutAndRenderTree();
    }
    logToTerminal('success', 'Árbol generado correctamente');
}

// ---------------------------
// Inserción en árboles
// ---------------------------
function digitalInsertWithSteps(char) {
    const ascii = char.charCodeAt(0);
    const binary = ascii.toString(2).padStart(8, '0');
    const lsb5 = getLast5Bits(char);
    
    let steps = `Letra: ${char} (ASCII ${ascii}) → binario: ${binary}\n`;
    steps += `Últimos 5 bits: ${lsb5}\n\n`;
    
    // Si no hay raíz, crear la primera con esta letra
    if (!currentTree) {
        currentTree = new TreeNode(char);
        steps += `Árbol vacío, raíz = '${char}'`;
        logToTerminal('info', steps);
        return;
    }
    
    let current = currentTree;
    let bitIndex = 0;
    
    // Recorrer bit por bit de IZQUIERDA a DERECHA
    for (let i = 0; i < lsb5.length; i++) {
        const bit = lsb5[i];
        bitIndex = i + 1;
        
        if (bit === '0') {
            // Ir a la izquierda (azul)
            if (!current.left) {
                // Insertar nuevo nodo aquí
                current.left = new TreeNode(char);
                steps += `Bit ${bitIndex}='${bit}': insertado a la izquierda`;
                logToTerminal('info', steps);
                return;
            } else {
                // Bajar por la izquierda
                steps += `Bit ${bitIndex}='${bit}': baja por izquierda (${current.left.data})\n`;
                current = current.left;
            }
        } else {
            // Ir a la derecha (rojo)
            if (!current.right) {
                // Insertar nuevo nodo aquí
                current.right = new TreeNode(char);
                steps += `Bit ${bitIndex}='${bit}': insertado a la derecha`;
                logToTerminal('info', steps);
                return;
            } else {
                // Bajar por la derecha
                steps += `Bit ${bitIndex}='${bit}': baja por derecha (${current.right.data})\n`;
                current = current.right;
            }
        }
    }
    
    // Si llegamos aquí, reemplazar el nodo actual
    const oldData = current.data;
    current.data = char;
    steps += `Bits agotados, reemplaza '${oldData}' con '${char}'`;
    logToTerminal('info', steps);
}

function residueParticularInsert(ch) {
    const ascii = ch.charCodeAt(0);
    const index = ascii % currentConfig.modulo;
    
    logToTerminal('info', `${ch} → ASCII: ${ascii} → ${ascii} % ${currentConfig.modulo} = ${index}`);
    
    const compare = (a, b) => a - b;
    currentTree = bstInsert(currentTree, new TreeNode(index, {char: ch}), compare);
}

function buildHuffmanTree(text) {
    // Calcular frecuencias
    const freqMap = {};
    for (const ch of text) {
        freqMap[ch] = (freqMap[ch] || 0) + 1;
    }
    
    logToTerminal('info', `Frecuencias: ${JSON.stringify(freqMap)}`);
    
    // Crear nodos iniciales
    let nodes = Object.entries(freqMap).map(([ch, freq]) => {
        const node = new TreeNode(null);
        node.char = ch;
        node.freq = freq;
        return node;
    });
    
    // Construir árbol de Huffman
    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq);
        const left = nodes.shift();
        const right = nodes.shift();
        const parent = new TreeNode(null);
        parent.freq = left.freq + right.freq;
        parent.left = left;
        parent.right = right;
        nodes.push(parent);
    }
    
    currentTree = nodes[0];
}

// ---------------------------
// Controles manuales
// ---------------------------
insertBtn.addEventListener('click', () => {
    const keyVal = keyInput.value.trim();
    if (!keyVal) {
        logToTerminal('error', 'Ingrese una clave');
        return;
    }
    
    if (!currentAlgorithm.startsWith('tree')) {
        return insertKey();
    }
    
    const ch = keyVal[0];
    
    if (currentAlgorithm === 'tree-digital') {
        digitalInsertWithSteps(ch);
        layoutAndRenderTree(ch, 'insert');
    } else if (currentAlgorithm === 'tree-residue-particular') {
        residueParticularInsert(ch);
        layoutAndRenderTree(ch, 'insert');
    } else if (currentAlgorithm === 'tree-residue-multiple') {
        if (currentConfig.maxLinks === undefined) {
            logToTerminal('error', 'Debe calcular los enlaces primero');
            return;
        }
        residueMultipleInsertWithSteps(ch);
        layoutAndRenderTree(ch, 'insert');
    }
    
    keyInput.value = '';
});

searchBtn.addEventListener('click', () => {
    const keyVal = keyInput.value.trim();
    if (!keyVal) {
        logToTerminal('error', 'Ingrese una clave');
        return;
    }
    
    if (!currentAlgorithm.startsWith('tree')) {
        return searchKey();
    }
    
    const ch = keyVal[0];
    
    if (currentAlgorithm === 'tree-residue-multiple') {
        if (currentConfig.maxLinks === undefined) {
            logToTerminal('error', 'Debe calcular los enlaces primero');
            return;
        }
        const found = residueMultipleSearchWithSteps(ch);
        if (found) {
            layoutAndRenderTree(ch, 'search', found.id);
        }
    } else {
        // Lógica para otros tipos de árboles...
        logToTerminal('info', `Búsqueda para ${currentAlgorithm} no implementada`);
    }
    
    keyInput.value = '';
});

deleteBtn.addEventListener('click', () => {
    const keyVal = keyInput.value.trim();
    if (!keyVal) {
        logToTerminal('error', 'Ingrese una clave');
        return;
    }
    
    if (!currentAlgorithm.startsWith('tree')) {
        return deleteKey();
    }
    
    logToTerminal('warning', 'Eliminación en árboles requiere reestructuración');
    keyInput.value = '';
});

resetBtn.addEventListener('click', () => {
    if (confirm('¿Está seguro de que desea resetear la estructura?')) {
        resetStructure();
        clearSVG();
        clearTerminal();
        logToTerminal('info', 'Estructura reseteada');
    }
});

// ---------------------------
// Canvas SVG y renderizado - INTERACTIVIDAD COMPLETA
// ---------------------------
let svgRootGroup = null;
let viewTransform = {scale: 1, x: 0, y: 0};

function setupTreeCanvas() {
    treeCanvas.setAttribute('width', '100%');
    treeCanvas.setAttribute('height', '400');
    treeCanvas.setAttribute('viewBox', '0 0 800 400');
    clearSVG();
}

function clearSVG() {
    while (treeCanvas.firstChild) {
        treeCanvas.removeChild(treeCanvas.firstChild);
    }
    
    svgRootGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    treeCanvas.appendChild(svgRootGroup);
    
    setupZoomControls();
    setupEventListeners();
}

function layoutAndRenderTree(highlightKey = null, action = null, highlightId = null) {
    if (!currentTree) return;
    
    treeNodesList = [];
    
    if (currentAlgorithm === 'tree-residue-multiple') {
        assignMultiTreePositions(currentTree, 0, {x: 0});
    } else {
        assignPositions(currentTree, 0, {x: 0});
    }
    
    // Calcular espaciado
    const spacingX = 70;
    const spacingY = 80;
    let minX = 0, maxX = 0;
    
    for (const node of treeNodesList) {
        node.x *= spacingX;
        node.y *= spacingY;
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
    }
    
    // Centrar árbol
    const centerOffset = 400 - (maxX + minX) / 2;
    for (const node of treeNodesList) {
        node.x += centerOffset;
        node.y += 50; // margen superior
    }
    
    // Limpiar y redibujar
    while (svgRootGroup.firstChild) {
        svgRootGroup.removeChild(svgRootGroup.firstChild);
    }
    
    // Dibujar enlaces primero
    for (const node of treeNodesList) {
        if (currentAlgorithm === 'tree-residue-multiple') {
            drawMultiTreeLinks(node);
        } else {
            if (node.left) drawLink(node, node.left, 'left');
            if (node.right) drawLink(node, node.right, 'right');
        }
    }
    
    // Dibujar nodos
    for (const node of treeNodesList) {
        drawNode(node, highlightId === node.id ? action : null);
    }
}

function assignMultiTreePositions(node, depth, counter) {
    if (!node) return;
    
    // Primero procesar todos los hijos
    for (const child of node.children) {
        if (child) {
            assignMultiTreePositions(child, depth + 1, counter);
        }
    }
    
    // Luego asignar posición al nodo actual
    node.x = counter.x++;
    node.y = depth;
    treeNodesList.push(node);
}

function assignPositions(node, depth, counter) {
    if (!node) return;
    
    assignPositions(node.left, depth + 1, counter);
    node.x = counter.x++;
    node.y = depth;
    treeNodesList.push(node);
    assignPositions(node.right, depth + 1, counter);
}

function drawMultiTreeLinks(parent) {
    for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i];
        if (child) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', parent.x);
            line.setAttribute('y1', parent.y);
            line.setAttribute('x2', child.x);
            line.setAttribute('y2', child.y);
            line.classList.add('tree-link');
            line.dataset.parentId = parent.id;
            line.dataset.childId = child.id;
            line.dataset.branchIndex = i;
            
            // Agregar etiqueta con el valor binario del índice
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const midX = (parent.x + child.x) / 2;
            const midY = (parent.y + child.y) / 2;
            label.setAttribute('x', midX);
            label.setAttribute('y', midY - 5);
            label.textContent = i.toString(2).padStart(currentConfig.bitsPerBranch, '0');
            label.classList.add('tree-link-label');
            label.style.fontSize = '10px';
            label.style.fill = 'var(--color-text-secondary)';
            label.style.textAnchor = 'middle';
            
            svgRootGroup.appendChild(line);
            svgRootGroup.appendChild(label);
        }
    }
}

function drawLink(parent, child, direction) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', parent.x);
    line.setAttribute('y1', parent.y);
    line.setAttribute('x2', child.x);
    line.setAttribute('y2', child.y);
    line.classList.add('tree-link', direction);
    line.dataset.parentId = parent.id;
    line.dataset.childId = child.id;
    svgRootGroup.appendChild(line);
}

function drawNode(node, animation) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    group.dataset.nodeId = node.id;
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', 20);
    circle.classList.add('tree-node');
    
    // Color específico para nodos vacíos vs nodos con datos
    if (node.data === null) {
        circle.style.fill = 'var(--color-info)';
        circle.style.stroke = 'var(--color-info)';
    }
    
    if (animation === 'insert') {
        circle.classList.add('inserted', 'node-insert');
    } else if (animation === 'search') {
        circle.classList.add('searched', 'node-search');
    }
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const displayText = node.char || (node.data !== null ? node.data.toString() : '');
    text.textContent = displayText;
    text.classList.add('tree-node-text');
    
    // Para Huffman mostrar frecuencia
    if (currentAlgorithm === 'tree-huffman' && node.freq) {
        const freqText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        freqText.textContent = node.freq.toString();
        freqText.setAttribute('y', '16');
        freqText.classList.add('tree-frequency');
        group.appendChild(freqText);
    }
    
    group.appendChild(circle);
    group.appendChild(text);
    svgRootGroup.appendChild(group);
    
    // Eventos de arrastre
    setupNodeDrag(group, node);
}

// ---------------------------
// Interactividad: Pan, Zoom, Drag
// ---------------------------
let isPanning = false;
let panStart = {x: 0, y: 0};
let viewStart = {x: 0, y: 0};

function setupEventListeners() {
    treeCanvas.addEventListener('wheel', onWheelZoom, {passive: false});
    treeCanvas.addEventListener('mousedown', onMouseDownPan);
}

function onMouseDownPan(e) {
    if (e.button !== 0) return; // solo botón izquierdo
    
    isPanning = true;
    panStart = {x: e.clientX, y: e.clientY};
    viewStart = {x: viewTransform.x, y: viewTransform.y};
    
    window.addEventListener('mousemove', onMouseMovePan);
    window.addEventListener('mouseup', onMouseUpPan);
}

function onMouseMovePan(e) {
    if (!isPanning) return;
    
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    
    viewTransform.x = viewStart.x + dx;
    viewTransform.y = viewStart.y + dy;
    
    applyTransform();
}

function onMouseUpPan() {
    isPanning = false;
    window.removeEventListener('mousemove', onMouseMovePan);
    window.removeEventListener('mouseup', onMouseUpPan);
}

function onWheelZoom(e) {
    e.preventDefault();
    
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    let newScale = viewTransform.scale + delta;
    newScale = Math.min(3, Math.max(0.5, newScale));
    
    const rect = treeCanvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    viewTransform.x = offsetX - (offsetX - viewTransform.x) / viewTransform.scale * newScale;
    viewTransform.y = offsetY - (offsetY - viewTransform.y) / viewTransform.scale * newScale;
    viewTransform.scale = newScale;
    
    applyTransform();
}

function applyTransform() {
    svgRootGroup.setAttribute('transform', 
        `translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`
    );
}

function setupZoomControls() {
    const controls = document.createElement('div');
    controls.classList.add('zoom-controls');
    
    const btnIn = document.createElement('button');
    btnIn.textContent = '+';
    btnIn.classList.add('zoom-btn');
    btnIn.addEventListener('click', () => {
        viewTransform.scale = Math.min(3, viewTransform.scale + 0.1);
        applyTransform();
    });
    
    const btnOut = document.createElement('button');
    btnOut.textContent = '-';
    btnOut.classList.add('zoom-btn');
    btnOut.addEventListener('click', () => {
        viewTransform.scale = Math.max(0.5, viewTransform.scale - 0.1);
        applyTransform();
    });
    
    controls.appendChild(btnIn);
    controls.appendChild(btnOut);
    structureDisplay.appendChild(controls);
}

// Drag & Drop de nodos - IMPLEMENTACIÓN ESPECÍFICA CON CLICK DERECHO
let dragNodeGroup = null;
let dragNodeData = null;
let dragStartPos = {x: 0, y: 0};

function setupNodeDrag(group, nodeData) {
    group.addEventListener('contextmenu', e => e.preventDefault());
    group.addEventListener('mousedown', e => {
        if (e.button !== 2) return; // solo botón derecho
        startDragNode(e, group, nodeData);
    });
}

function startDragNode(e, group, nodeData) {
    dragNodeGroup = group;
    dragNodeData = nodeData;
    dragStartPos = {x: e.clientX, y: e.clientY};
    
    group.classList.add('dragging');
    
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', endDrag);
}

function dragMove(e) {
    if (!dragNodeGroup) return;
    
    const dx = (e.clientX - dragStartPos.x) / viewTransform.scale;
    const dy = (e.clientY - dragStartPos.y) / viewTransform.scale;
    
    dragNodeData.x += dx;
    dragNodeData.y += dy;
    
    dragStartPos = {x: e.clientX, y: e.clientY};
    
    dragNodeGroup.setAttribute('transform', `translate(${dragNodeData.x}, ${dragNodeData.y})`);
    
    // Actualizar líneas conectadas
    updateConnectedLines(dragNodeData);
}

function updateConnectedLines(nodeData) {
    const lines = svgRootGroup.querySelectorAll('line');
    lines.forEach(line => {
        const parentId = line.dataset.parentId;
        const childId = line.dataset.childId;
        
        if (parentId == nodeData.id) {
            line.setAttribute('x1', nodeData.x);
            line.setAttribute('y1', nodeData.y);
        }
        if (childId == nodeData.id) {
            line.setAttribute('x2', nodeData.x);
            line.setAttribute('y2', nodeData.y);
        }
    });
}

function endDrag() {
    if (dragNodeGroup) {
        dragNodeGroup.classList.remove('dragging');
    }
    
    dragNodeGroup = null;
    dragNodeData = null;
    
    window.removeEventListener('mousemove', dragMove);
    window.removeEventListener('mouseup', endDrag);
}

// ================================================================
// Resto de implementaciones (Hash, Search, etc.) - Sin cambios relevantes
// ================================================================

function resetStructure() {
    dataStructure = [];
    hashTable = [];
    currentTree = null;
    treeNodesList = [];
    structureDisplay.innerHTML = '';
}

function initializeArray() {
    dataStructure = [];
    for (let i = 1; i <= currentConfig.structureSize; i++) {
        dataStructure.push({ index: i, value: null });
    }
}

function initializeHashTable() {
    hashTable = [];
    for (let i = 1; i <= currentConfig.structureSize; i++) {
        hashTable.push({ 
            index: i, 
            value: null,
            columns: [{ value: null, disabled: false }]
        });
    }
}

// Funciones Hash - TODAS con +1 al final como especificado
function hashMod(key) {
    const numKey = parseInt(key) || key.charCodeAt(0);
    const hashValue = (numKey % currentConfig.structureSize) + 1;
    return hashValue;
}

function hashSquare(key) {
    const numKey = parseInt(key) || key.charCodeAt(0);
    const squared = numKey * numKey;
    const squaredStr = squared.toString();
    
    const len = squaredStr.length;
    const middle = Math.floor(len / 2);
    const startIndex = Math.max(0, middle - 1);
    const endIndex = Math.min(len, middle + 1);
    const middleDigits = parseInt(squaredStr.substring(startIndex, endIndex));
    
    const hashValue = (middleDigits % currentConfig.structureSize) + 1;
    return hashValue;
}

function hashFolding(key) {
    const keyStr = key.toString();
    const groupSize = currentConfig.foldingDigits;
    let sum = 0;
    
    for (let i = 0; i < keyStr.length; i += groupSize) {
        const group = keyStr.substring(i, i + groupSize);
        sum += parseInt(group) || 0;
    }
    
    const hashValue = (sum % currentConfig.structureSize) + 1;
    return hashValue;
}

function hashTruncation(key) {
    const keyStr = key.toString();
    const positions = currentConfig.truncationPositions;
    let extractedDigits = '';
    
    for (const pos of positions) {
        if (pos <= keyStr.length) {
            extractedDigits += keyStr[pos - 1];
        }
    }
    
    if (!extractedDigits) extractedDigits = '0';
    
    const numericValue = parseInt(extractedDigits);
    const hashValue = (numericValue % currentConfig.structureSize) + 1;
    return hashValue;
}

function calculateHashValue(key) {
    switch (currentAlgorithm) {
        case 'hash-mod': return hashMod(key);
        case 'hash-square': return hashSquare(key);
        case 'hash-folding': return hashFolding(key);
        case 'hash-truncation': return hashTruncation(key);
        default: return hashMod(key);
    }
}

// Operaciones de clave simplificadas para este ejemplo
function insertKey() {
    logToTerminal('info', 'Función hash insertKey no implementada en este ejemplo');
}

function deleteKey() {
    logToTerminal('info', 'Función hash deleteKey no implementada en este ejemplo');
}

function searchKey() {
    logToTerminal('info', 'Función hash searchKey no implementada en este ejemplo');
}

// Terminal functions
function logToTerminal(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `
        <span class="terminal-timestamp">${timestamp}</span>
        <span class="terminal-icon ${type}">${icons[type]}</span>
        <span>${message}</span>
    `;
    
    resultsTerminal.appendChild(line);
    resultsTerminal.scrollTop = resultsTerminal.scrollHeight;
}

function clearTerminal() {
    resultsTerminal.innerHTML = '';
}

// Rendering functions simplificadas
function renderStructure() {
    structureDisplay.innerHTML = '<p>Estructura de datos visualizada en canvas para árboles</p>';
}

// Key input event listener
keyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (currentAlgorithm.startsWith('tree')) {
            insertBtn.click();
        } else {
            insertKey();
        }
    }
});

// Event listeners para funciones de prueba
if (testFoldingBtn) {
    testFoldingBtn.addEventListener('click', () => {
        logToTerminal('info', 'Función de prueba hash plegamiento no implementada en este ejemplo');
    });
}

if (testTruncationBtn) {
    testTruncationBtn.addEventListener('click', () => {
        logToTerminal('info', 'Función de prueba hash truncamiento no implementada en este ejemplo');
    });
}

// Export/Import simplificado
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        logToTerminal('info', 'Función de exportación no implementada en este ejemplo');
    });
}

if (importBtn) {
    importBtn.addEventListener('click', () => {
        logToTerminal('info', 'Función de importación no implementada en este ejemplo');
    });
}

// Additional event listeners
if (sortBtn) {
    sortBtn.addEventListener('click', () => {
        logToTerminal('info', 'Función de ordenación no implementada en este ejemplo');
    });
}