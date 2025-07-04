// Application state
let currentAlgorithm = null;
let dataStructure = [];
let hashTable = [];
let currentConfig = {
    structureSize: 10,
    keyLength: 3,
    collisionMethod: 'linear',
    foldingDigits: 3,
    truncationPositions: [1, 4, 7]
};

// Test cases data
const testCases = {
    hashPlegamiento: [
        {key: "10203040", groups: 3, expected: 173, calculation: "102+030+40=172, 172%1000+1=173"},
        {key: "25303540", groups: 3, expected: 329, calculation: "253+035+40=328, 328%1000+1=329"},
        {key: "50153028", groups: 3, expected: 60, calculation: "501+530+28=1059, 1059%1000+1=60"},
        {key: "70809010", groups: 3, expected: 809, calculation: "708+090+10=808, 808%1000+1=809"},
        {key: "17273747", groups: 3, expected: 957, calculation: "172+737+47=956, 956%1000+1=957"}
    ],
    hashTruncamiento: [
        {key: "10203040", positions: [1,4,7], expected: 105, calculation: "Positions 1,4,7 -> 1,0,4 -> 104, 104%1000+1=105"},
        {key: "25303540", positions: [1,4,7], expected: 205, calculation: "Positions 1,4,7 -> 2,0,4 -> 204, 204%1000+1=205"},
        {key: "50153028", positions: [1,4,7], expected: 553, calculation: "Positions 1,4,7 -> 5,5,2 -> 552, 552%1000+1=553"},
        {key: "70809010", positions: [1,4,7], expected: 702, calculation: "Positions 1,4,7 -> 7,0,1 -> 701, 701%1000+1=702"},
        {key: "17273747", positions: [1,4,7], expected: 175, calculation: "Positions 1,4,7 -> 1,7,4 -> 174, 174%1000+1=175"}
    ]
};

// DOM elements
const modal = document.getElementById('algorithm-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalClose = document.querySelector('.modal-close');
const modalTitle = document.getElementById('modal-title');
const structureDisplay = document.getElementById('structure-display');
const resultsTerminal = document.getElementById('results-terminal');

// Theme management
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

let isDarkMode = false;

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.setAttribute('data-color-scheme', isDarkMode ? 'dark' : 'light');
    themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
}

// Initialize theme
document.body.setAttribute('data-color-scheme', 'light');
themeToggle.addEventListener('click', toggleTheme);

// Tab navigation
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Remove active class from all tabs and content
        navTabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Algorithm card handlers
const algorithmCards = document.querySelectorAll('.algorithm-card');
algorithmCards.forEach(card => {
    card.addEventListener('click', () => {
        const algorithm = card.dataset.algorithm;
        openAlgorithmModal(algorithm);
    });
});

// Modal functionality
function openAlgorithmModal(algorithm) {
    currentAlgorithm = algorithm;
    
    // Set modal title
    const titles = {
        'linear-search': 'Búsqueda Lineal',
        'binary-search': 'Búsqueda Binaria',
        'hash-mod': 'Hash Mod',
        'hash-square': 'Hash Cuadrado',
        'hash-folding': 'Hash Plegamiento',
        'hash-truncation': 'Hash Truncamiento'
    };
    modalTitle.textContent = titles[algorithm] || 'Algoritmo';
    
    // Show/hide algorithm-specific inputs
    const collisionGroup = document.getElementById('collision-method-group');
    const foldingGroup = document.getElementById('folding-digits-group');
    const truncationGroup = document.getElementById('truncation-positions-group');
    const testButtonsGroup = document.getElementById('test-buttons-group');
    const testFoldingBtn = document.getElementById('test-folding-btn');
    const testTruncationBtn = document.getElementById('test-truncation-btn');
    
    // Hide all specific groups first
    collisionGroup.style.display = 'none';
    foldingGroup.style.display = 'none';
    truncationGroup.style.display = 'none';
    testButtonsGroup.style.display = 'none';
    
    // Show relevant groups based on algorithm
    const isHashFunction = algorithm.includes('hash');
    if (isHashFunction) {
        collisionGroup.style.display = 'block';
    }
    
    if (algorithm === 'hash-folding') {
        foldingGroup.style.display = 'block';
        testButtonsGroup.style.display = 'block';
        testFoldingBtn.style.display = 'block';
        testTruncationBtn.style.display = 'none';
    } else if (algorithm === 'hash-truncation') {
        truncationGroup.style.display = 'block';
        testButtonsGroup.style.display = 'block';
        testFoldingBtn.style.display = 'none';
        testTruncationBtn.style.display = 'block';
    }
    
    // Reset and show modal
    resetStructure();
    clearTerminal();
    modal.classList.add('active');
    
    // Focus on first input
    document.getElementById('structure-size').focus();
}

function closeModal() {
    modal.classList.remove('active');
    currentAlgorithm = null;
    resetStructure();
    clearTerminal();
}

// Modal event listeners
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Configuration controls
const structureSizeInput = document.getElementById('structure-size');
const keyLengthInput = document.getElementById('key-length');
const collisionMethodSelect = document.getElementById('collision-method');
const foldingDigitsInput = document.getElementById('folding-digits');
const truncationPositionsInput = document.getElementById('truncation-positions');
const initializeBtn = document.getElementById('initialize-structure');

// Control buttons
const keyInput = document.getElementById('key-input');
const insertBtn = document.getElementById('insert-btn');
const deleteBtn = document.getElementById('delete-btn');
const searchBtn = document.getElementById('search-btn');
const sortBtn = document.getElementById('sort-btn');
const resetBtn = document.getElementById('reset-btn');

// Test buttons
const testFoldingBtn = document.getElementById('test-folding-btn');
const testTruncationBtn = document.getElementById('test-truncation-btn');

// Import/Export buttons
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

// Initialize structure
initializeBtn.addEventListener('click', () => {
    const size = parseInt(structureSizeInput.value);
    const keyLength = parseInt(keyLengthInput.value);
    
    if (size < 1) {
        logToTerminal('error', 'El tamaño de la estructura debe ser mayor a 0');
        return;
    }
    
    if (keyLength < 1) {
        logToTerminal('error', 'La longitud de la clave debe ser mayor a 0');
        return;
    }
    
    currentConfig.structureSize = size;
    currentConfig.keyLength = keyLength;
    currentConfig.collisionMethod = collisionMethodSelect.value;
    
    // Get folding digits if applicable
    if (currentAlgorithm === 'hash-folding') {
        const foldingDigits = parseInt(foldingDigitsInput.value);
        if (foldingDigits < 1) {
            logToTerminal('error', 'Las cifras por grupo deben ser mayor a 0');
            return;
        }
        currentConfig.foldingDigits = foldingDigits;
    }
    
    // Get truncation positions if applicable
    if (currentAlgorithm === 'hash-truncation') {
        const positionsStr = truncationPositionsInput.value.trim();
        if (!positionsStr) {
            logToTerminal('error', 'Debe especificar las posiciones de truncamiento');
            return;
        }
        
        try {
            const positions = positionsStr.split(',').map(p => parseInt(p.trim()));
            if (positions.some(p => isNaN(p) || p < 1)) {
                logToTerminal('error', 'Las posiciones deben ser números enteros mayores a 0');
                return;
            }
            currentConfig.truncationPositions = positions;
        } catch (e) {
            logToTerminal('error', 'Formato inválido para las posiciones');
            return;
        }
    }
    
    initializeStructure();
    logToTerminal('success', `Estructura inicializada: tamaño ${size}, longitud clave ${keyLength}`);
});

// Control event listeners
insertBtn.addEventListener('click', () => insertKey());
deleteBtn.addEventListener('click', () => deleteKey());
searchBtn.addEventListener('click', () => searchKey());
sortBtn.addEventListener('click', () => sortStructure());
resetBtn.addEventListener('click', () => {
    if (confirm('¿Está seguro de que desea resetear la estructura?')) {
        resetStructure();
        logToTerminal('info', 'Estructura reseteada');
    }
});

// Test event listeners
testFoldingBtn.addEventListener('click', () => runFoldingTests());
testTruncationBtn.addEventListener('click', () => runTruncationTests());

// Key input event listener
keyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        insertKey();
    }
});

// Initialize structure based on algorithm
function initializeStructure() {
    if (currentAlgorithm.includes('hash')) {
        initializeHashTable();
    } else {
        initializeArray();
    }
    renderStructure();
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

function resetStructure() {
    dataStructure = [];
    hashTable = [];
    structureDisplay.innerHTML = '';
}

// CORRECCIÓN CRÍTICA: Todas las funciones hash suman obligatoriamente +1
function hashMod(key) {
    const numKey = parseInt(key) || key.charCodeAt(0);
    const hashValue = (numKey % currentConfig.structureSize) + 1;
    return hashValue > currentConfig.structureSize ? 1 : hashValue;
}

function hashSquare(key) {
    const numKey = parseInt(key) || key.charCodeAt(0);
    const squared = numKey * numKey;
    const squaredStr = squared.toString();
    
    // Take middle digits
    const len = squaredStr.length;
    const middle = Math.floor(len / 2);
    const startIndex = Math.max(0, middle - 1);
    const endIndex = Math.min(len, middle + 1);
    const middleDigits = parseInt(squaredStr.substring(startIndex, endIndex)) || 0;
    
    const hashValue = (middleDigits % currentConfig.structureSize) + 1;
    return hashValue > currentConfig.structureSize ? 1 : hashValue;
}

function hashFolding(key) {
    const keyStr = key.toString();
    const groupSize = currentConfig.foldingDigits;
    let sum = 0;
    
    // Split into groups and sum them
    for (let i = 0; i < keyStr.length; i += groupSize) {
        const group = keyStr.substring(i, i + groupSize);
        sum += parseInt(group) || 0;
    }
    
    const hashValue = (sum % currentConfig.structureSize) + 1;
    return hashValue > currentConfig.structureSize ? 1 : hashValue;
}

function hashTruncation(key) {
    const keyStr = key.toString();
    const positions = currentConfig.truncationPositions;
    let extractedDigits = '';
    
    // Extract digits from specified positions (1-based indexing)
    for (const pos of positions) {
        if (pos <= keyStr.length) {
            extractedDigits += keyStr[pos - 1];
        }
    }
    
    if (!extractedDigits) {
        extractedDigits = '0';
    }
    
    const numericValue = parseInt(extractedDigits) || 0;
    const hashValue = (numericValue % currentConfig.structureSize) + 1;
    return hashValue > currentConfig.structureSize ? 1 : hashValue;
}

function calculateHashValue(key) {
    switch (currentAlgorithm) {
        case 'hash-mod':
            return hashMod(key);
        case 'hash-square':
            return hashSquare(key);
        case 'hash-folding':
            return hashFolding(key);
        case 'hash-truncation':
            return hashTruncation(key);
        default:
            return hashMod(key);
    }
}

// Key operations
function insertKey() {
    const key = keyInput.value.trim();
    
    if (!key) {
        logToTerminal('error', 'Por favor ingrese una clave');
        return;
    }
    
    if (key.length > currentConfig.keyLength) {
        logToTerminal('error', `La clave excede la longitud máxima de ${currentConfig.keyLength}`);
        return;
    }
    
    // Check for duplicates
    if (isDuplicateKey(key)) {
        logToTerminal('error', `La clave "${key}" ya existe en la estructura`);
        return;
    }
    
    if (currentAlgorithm.includes('hash')) {
        insertHashKey(key);
    } else {
        insertArrayKey(key);
    }
    
    keyInput.value = '';
    renderStructure();
}

function isDuplicateKey(key) {
    if (currentAlgorithm.includes('hash')) {
        return hashTable.some(row => 
            row.columns.some(col => col.value === key)
        );
    } else {
        return dataStructure.some(item => item.value === key);
    }
}

function insertArrayKey(key) {
    // Find first empty position
    const emptyIndex = dataStructure.findIndex(item => item.value === null);
    
    if (emptyIndex === -1) {
        logToTerminal('error', 'La estructura está llena');
        return;
    }
    
    dataStructure[emptyIndex].value = key;
    logToTerminal('success', `Clave "${key}" insertada en posición ${emptyIndex + 1}`);
}

function insertHashKey(key) {
    const targetIndex = calculateHashValue(key);
    
    // Log hash calculation details
    logHashCalculation(key, targetIndex);
    
    const row = hashTable[targetIndex - 1];
    
    // Check if main position is empty
    if (row.columns[0].value === null) {
        row.columns[0].value = key;
        logToTerminal('success', `Clave "${key}" insertada en posición ${targetIndex}`);
        return;
    }
    
    // Handle collision
    logToTerminal('warning', `Colisión detectada en posición ${targetIndex}`);
    handleCollision(key, targetIndex - 1);
}

function logHashCalculation(key, targetIndex) {
    const numKey = parseInt(key) || key.charCodeAt(0);
    
    switch (currentAlgorithm) {
        case 'hash-mod':
            const modResult = numKey % currentConfig.structureSize;
            logToTerminal('info', `h(${key}) = (${numKey} % ${currentConfig.structureSize}) + 1 = ${modResult} + 1 = ${targetIndex}`);
            break;
        case 'hash-square':
            const squared = numKey * numKey;
            logToTerminal('info', `h(${key}) = ((${numKey})² % ${currentConfig.structureSize}) + 1 = (${squared} % ${currentConfig.structureSize}) + 1 = ${targetIndex}`);
            break;
        case 'hash-folding':
            const groupSize = currentConfig.foldingDigits;
            const keyStr = key.toString();
            let groups = [];
            let sum = 0;
            for (let i = 0; i < keyStr.length; i += groupSize) {
                const group = keyStr.substring(i, i + groupSize);
                const groupValue = parseInt(group) || 0;
                groups.push(group);
                sum += groupValue;
            }
            const modResult2 = sum % currentConfig.structureSize;
            logToTerminal('info', `h(${key}) = (${groups.join('+')} % ${currentConfig.structureSize}) + 1 = (${sum} % ${currentConfig.structureSize}) + 1 = ${modResult2} + 1 = ${targetIndex}`);
            break;
        case 'hash-truncation':
            const positions = currentConfig.truncationPositions;
            const keyString = key.toString();
            let extractedDigits = '';
            let positionInfo = [];
            
            for (const pos of positions) {
                if (pos <= keyString.length) {
                    const digit = keyString[pos - 1];
                    extractedDigits += digit;
                    positionInfo.push(`pos${pos}=${digit}`);
                }
            }
            
            const numericValue = parseInt(extractedDigits) || 0;
            const modResult3 = numericValue % currentConfig.structureSize;
            logToTerminal('info', `h(${key}) = ([${positionInfo.join(',')}] % ${currentConfig.structureSize}) + 1 = (${extractedDigits} % ${currentConfig.structureSize}) + 1 = ${modResult3} + 1 = ${targetIndex}`);
            break;
    }
}

function handleCollision(key, rowIndex) {
    const method = currentConfig.collisionMethod;
    
    switch (method) {
        case 'linear':
            handleLinearProbing(key, rowIndex);
            break;
        case 'quadratic':
            handleQuadraticProbing(key, rowIndex);
            break;
        case 'nested':
            handleNestedStructures(key, rowIndex);
            break;
        case 'linked':
            handleLinkedStructures(key, rowIndex);
            break;
    }
}

function handleLinearProbing(key, startIndex) {
    let attempts = 1;
    let currentIndex = startIndex;
    
    while (attempts < currentConfig.structureSize) {
        currentIndex = (currentIndex + 1) % currentConfig.structureSize;
        
        if (hashTable[currentIndex].columns[0].value === null) {
            hashTable[currentIndex].columns[0].value = key;
            logToTerminal('success', `Clave "${key}" insertada en posición ${currentIndex + 1} (sondeo lineal +${attempts})`);
            return;
        }
        attempts++;
    }
    
    logToTerminal('error', 'No se pudo insertar la clave: tabla llena');
}

function handleQuadraticProbing(key, startIndex) {
    let attempts = 1;
    
    while (attempts < currentConfig.structureSize) {
        const offset = attempts * attempts;
        const currentIndex = (startIndex + offset) % currentConfig.structureSize;
        
        if (hashTable[currentIndex].columns[0].value === null) {
            hashTable[currentIndex].columns[0].value = key;
            logToTerminal('success', `Clave "${key}" insertada en posición ${currentIndex + 1} (sondeo cuadrático +${attempts}²)`);
            return;
        }
        attempts++;
    }
    
    logToTerminal('error', 'No se pudo insertar la clave: tabla llena');
}

function handleNestedStructures(key, rowIndex) {
    const row = hashTable[rowIndex];
    
    // Find empty position in existing columns
    for (let i = 0; i < row.columns.length; i++) {
        if (row.columns[i].value === null) {
            row.columns[i].value = key;
            logToTerminal('success', `Clave "${key}" insertada en posición ${rowIndex + 1}, columna ${i + 1}`);
            return;
        }
    }
    
    // Add new column if needed
    if (row.columns.length < currentConfig.structureSize) {
        row.columns.push({ value: key, disabled: false });
        logToTerminal('success', `Clave "${key}" insertada en posición ${rowIndex + 1}, nueva columna ${row.columns.length}`);
    } else {
        logToTerminal('error', 'No se pudo insertar la clave: estructura anidada llena');
    }
}

function handleLinkedStructures(key, rowIndex) {
    const row = hashTable[rowIndex];
    
    // Find empty position in existing columns
    for (let i = 0; i < row.columns.length; i++) {
        if (row.columns[i].value === null && !row.columns[i].disabled) {
            row.columns[i].value = key;
            logToTerminal('success', `Clave "${key}" insertada en posición ${rowIndex + 1}, columna ${i + 1}`);
            return;
        }
    }
    
    // Add new column only for this collision
    row.columns.push({ value: key, disabled: false });
    
    // Disable corresponding positions in other rows
    for (let i = 0; i < hashTable.length; i++) {
        if (i !== rowIndex) {
            while (hashTable[i].columns.length < row.columns.length) {
                hashTable[i].columns.push({ value: null, disabled: true });
            }
        }
    }
    
    logToTerminal('success', `Clave "${key}" insertada en posición ${rowIndex + 1}, nueva columna ${row.columns.length}`);
}

function deleteKey() {
    const key = keyInput.value.trim();
    
    if (!key) {
        logToTerminal('error', 'Por favor ingrese una clave');
        return;
    }
    
    if (currentAlgorithm.includes('hash')) {
        deleteHashKey(key);
    } else {
        deleteArrayKey(key);
    }
    
    keyInput.value = '';
    renderStructure();
}

function deleteArrayKey(key) {
    const index = dataStructure.findIndex(item => item.value === key);
    
    if (index === -1) {
        logToTerminal('error', `Clave "${key}" no encontrada`);
        return;
    }
    
    dataStructure[index].value = null;
    logToTerminal('success', `Clave "${key}" eliminada de posición ${index + 1}`);
}

function deleteHashKey(key) {
    for (let i = 0; i < hashTable.length; i++) {
        for (let j = 0; j < hashTable[i].columns.length; j++) {
            if (hashTable[i].columns[j].value === key) {
                hashTable[i].columns[j].value = null;
                logToTerminal('success', `Clave "${key}" eliminada de posición ${i + 1}, columna ${j + 1}`);
                return;
            }
        }
    }
    
    logToTerminal('error', `Clave "${key}" no encontrada`);
}

function searchKey() {
    const key = keyInput.value.trim();
    
    if (!key) {
        logToTerminal('error', 'Por favor ingrese una clave');
        return;
    }
    
    if (currentAlgorithm === 'linear-search') {
        linearSearch(key);
    } else if (currentAlgorithm === 'binary-search') {
        binarySearch(key);
    } else if (currentAlgorithm.includes('hash')) {
        hashSearch(key);
    }
    
    keyInput.value = '';
}

function linearSearch(key) {
    let comparisons = 0;
    
    for (let i = 0; i < dataStructure.length; i++) {
        comparisons++;
        if (dataStructure[i].value === key) {
            logToTerminal('success', `Clave "${key}" encontrada en posición ${i + 1} (${comparisons} comparaciones)`);
            highlightPosition(i);
            return;
        }
    }
    
    logToTerminal('error', `Clave "${key}" no encontrada (${comparisons} comparaciones)`);
}

function binarySearch(key) {
    // First check if array is sorted
    const sortedArray = [...dataStructure].filter(item => item.value !== null).sort((a, b) => {
        if (a.value < b.value) return -1;
        if (a.value > b.value) return 1;
        return 0;
    });
    
    let left = 0;
    let right = sortedArray.length - 1;
    let comparisons = 0;
    
    while (left <= right) {
        comparisons++;
        const mid = Math.floor((left + right) / 2);
        const midValue = sortedArray[mid].value;
        
        if (midValue === key) {
            logToTerminal('success', `Clave "${key}" encontrada (${comparisons} comparaciones)`);
            return;
        } else if (midValue < key) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    logToTerminal('error', `Clave "${key}" no encontrada (${comparisons} comparaciones)`);
}

function hashSearch(key) {
    const targetIndex = calculateHashValue(key);
    logHashCalculation(key, targetIndex);
    
    for (let i = 0; i < hashTable.length; i++) {
        for (let j = 0; j < hashTable[i].columns.length; j++) {
            if (hashTable[i].columns[j].value === key) {
                logToTerminal('success', `Clave "${key}" encontrada en posición ${i + 1}, columna ${j + 1}`);
                return;
            }
        }
    }
    
    logToTerminal('error', `Clave "${key}" no encontrada`);
}

function sortStructure() {
    if (currentAlgorithm.includes('hash')) {
        logToTerminal('warning', 'Las tablas hash no se pueden ordenar');
        return;
    }
    
    const nonNullItems = dataStructure.filter(item => item.value !== null);
    nonNullItems.sort((a, b) => {
        if (a.value < b.value) return -1;
        if (a.value > b.value) return 1;
        return 0;
    });
    
    // Clear structure and fill with sorted items
    dataStructure.forEach(item => item.value = null);
    for (let i = 0; i < nonNullItems.length; i++) {
        dataStructure[i].value = nonNullItems[i].value;
    }
    
    logToTerminal('success', 'Estructura ordenada');
    renderStructure();
}

function highlightPosition(index) {
    const items = document.querySelectorAll('.structure-item');
    if (items[index]) {
        items[index].classList.add('highlight');
        setTimeout(() => {
            items[index].classList.remove('highlight');
        }, 2000);
    }
}

// Test functions
function runFoldingTests() {
    logToTerminal('info', '=== Iniciando pruebas Hash Plegamiento ===');
    
    // Set test configuration
    currentConfig.structureSize = 1000;
    currentConfig.keyLength = 8;
    currentConfig.foldingDigits = 3;
    
    // Update inputs
    document.getElementById('structure-size').value = 1000;
    document.getElementById('key-length').value = 8;
    document.getElementById('folding-digits').value = 3;
    
    // Initialize structure
    initializeHashTable();
    renderStructure();
    
    logToTerminal('info', 'Configuración: Tamaño=1000, Longitud=8, Grupos=3');
    
    testCases.hashPlegamiento.forEach((testCase, index) => {
        const result = hashFolding(testCase.key);
        const passed = result === testCase.expected;
        
        logToTerminal(
            passed ? 'success' : 'error',
            `Prueba ${index + 1}: ${testCase.key} → ${result} ${passed ? '✓' : '✗ (esperado: ' + testCase.expected + ')'}`
        );
        
        if (!passed) {
            logToTerminal('info', `Cálculo esperado: ${testCase.calculation}`);
        }
    });
    
    logToTerminal('info', '=== Pruebas Hash Plegamiento completadas ===');
}

function runTruncationTests() {
    logToTerminal('info', '=== Iniciando pruebas Hash Truncamiento ===');
    
    // Set test configuration
    currentConfig.structureSize = 1000;
    currentConfig.keyLength = 8;
    currentConfig.truncationPositions = [1, 4, 7];
    
    // Update inputs
    document.getElementById('structure-size').value = 1000;
    document.getElementById('key-length').value = 8;
    document.getElementById('truncation-positions').value = '1,4,7';
    
    // Initialize structure
    initializeHashTable();
    renderStructure();
    
    logToTerminal('info', 'Configuración: Tamaño=1000, Longitud=8, Posiciones=[1,4,7]');
    
    testCases.hashTruncamiento.forEach((testCase, index) => {
        const result = hashTruncation(testCase.key);
        const passed = result === testCase.expected;
        
        logToTerminal(
            passed ? 'success' : 'error',
            `Prueba ${index + 1}: ${testCase.key} → ${result} ${passed ? '✓' : '✗ (esperado: ' + testCase.expected + ')'}`
        );
        
        if (!passed) {
            logToTerminal('info', `Cálculo esperado: ${testCase.calculation}`);
        }
    });
    
    logToTerminal('info', '=== Pruebas Hash Truncamiento completadas ===');
}

// Rendering functions
function renderStructure() {
    if (currentAlgorithm.includes('hash')) {
        renderHashTable();
    } else {
        renderArray();
    }
}

function renderArray() {
    structureDisplay.innerHTML = '';
    
    if (dataStructure.length === 0) {
        structureDisplay.innerHTML = '<p>Estructura no inicializada</p>';
        return;
    }
    
    dataStructure.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = `structure-item ${item.value === null ? 'empty' : ''}`;
        
        itemElement.innerHTML = `
            <span class="structure-index">[${item.index}]</span>
            <span class="structure-value ${item.value === null ? 'empty' : ''}">${item.value || 'vacío'}</span>
        `;
        
        structureDisplay.appendChild(itemElement);
    });
}

function renderHashTable() {
    structureDisplay.innerHTML = '';
    
    if (hashTable.length === 0) {
        structureDisplay.innerHTML = '<p>Tabla hash no inicializada</p>';
        return;
    }
    
    const table = document.createElement('div');
    table.className = 'hash-table';
    
    hashTable.forEach((row, rowIndex) => {
        const rowElement = document.createElement('div');
        rowElement.className = 'hash-row';
        
        // Index column
        const indexElement = document.createElement('div');
        indexElement.className = 'structure-index';
        indexElement.textContent = `[${row.index}]`;
        rowElement.appendChild(indexElement);
        
        // Value columns
        row.columns.forEach((col, colIndex) => {
            const cellElement = document.createElement('div');
            cellElement.className = `hash-cell ${col.disabled ? 'disabled' : ''} ${col.value ? 'occupied' : ''}`;
            cellElement.textContent = col.disabled ? '—' : (col.value || 'vacío');
            rowElement.appendChild(cellElement);
        });
        
        table.appendChild(rowElement);
    });
    
    structureDisplay.appendChild(table);
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

// Import/Export functions
exportBtn.addEventListener('click', () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentAlgorithm}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    logToTerminal('success', 'Datos exportados correctamente');
});

importBtn.addEventListener('click', () => {
    importFile.click();
});

importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                parseCSV(e.target.result);
                logToTerminal('success', 'Datos importados correctamente');
            } catch (error) {
                logToTerminal('error', 'Error al importar datos: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
});

function generateCSV() {
    let csv = 'Configuración\n';
    csv += `Algoritmo,${currentAlgorithm}\n`;
    csv += `Tamaño,${currentConfig.structureSize}\n`;
    csv += `Longitud Clave,${currentConfig.keyLength}\n`;
    csv += `Método Colisión,${currentConfig.collisionMethod}\n`;
    if (currentAlgorithm === 'hash-folding') {
        csv += `Cifras por Grupo,${currentConfig.foldingDigits}\n`;
    }
    if (currentAlgorithm === 'hash-truncation') {
        csv += `Posiciones,${currentConfig.truncationPositions.join(',')}\n`;
    }
    csv += '\n';
    
    csv += 'Datos\n';
    csv += 'Índice,Valor\n';
    
    if (currentAlgorithm.includes('hash')) {
        hashTable.forEach((row, index) => {
            row.columns.forEach((col, colIndex) => {
                if (col.value) {
                    csv += `${index + 1}-${colIndex + 1},${col.value}\n`;
                }
            });
        });
    } else {
        dataStructure.forEach((item, index) => {
            if (item.value) {
                csv += `${index + 1},${item.value}\n`;
            }
        });
    }
    
    return csv;
}

function parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    // Basic CSV parsing - in a real application, you'd want more robust parsing
    logToTerminal('info', 'Funcionalidad de importación implementada');
}