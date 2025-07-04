// Application data
const appData = {
  grafos: {
    escenarios: {
      conjuntos: {
        nombre: "Operaciones de Conjuntos",
        grafo1: {label: "G₁", vertices_placeholder: "a,b,c", aristas_placeholder: "a-b,b-c"},
        grafo2: {label: "G₂'", vertices_placeholder: "a,c,d", aristas_placeholder: "a-d,c-d"},
        operaciones_habilitadas: ["union", "interseccion", "suma_anillo"],
        ejemplo: {
          g1_vertices: "a,b,c",
          g1_aristas: "a-b,b-c",
          g2_vertices: "a,c,d", 
          g2_aristas: "a-d,c-d"
        }
      },
      producto: {
        nombre: "Operaciones de Producto",
        grafo1: {label: "G₁", vertices_placeholder: "a,b", aristas_placeholder: "a-b"},
        grafo2: {label: "G₂", vertices_placeholder: "x,y", aristas_placeholder: "x-y"},
        operaciones_habilitadas: ["producto_cartesiano", "producto_tensorial", "composicion"],
        ejemplo: {
          g1_vertices: "a,b",
          g1_aristas: "a-b",
          g2_vertices: "x,y",
          g2_aristas: "x-y"
        }
      }
    },
    operaciones: {
      union: {nombre: "Unión", descripcion: "G₁ ∪ G₂'", tipo: "conjuntos"},
      interseccion: {nombre: "Intersección", descripcion: "G₁ ∩ G₂'", tipo: "conjuntos"},
      suma_anillo: {nombre: "Suma Anillo", descripcion: "G₁ ⊕ G₂'", tipo: "conjuntos"},
      producto_cartesiano: {nombre: "Producto Cartesiano", descripcion: "G₁ × G₂", tipo: "producto"},
      producto_tensorial: {nombre: "Producto Tensorial", descripcion: "G₁ ⊗ G₂", tipo: "producto"},
      composicion: {nombre: "Composición", descripcion: "G₁ ∘ G₂", tipo: "producto"}
    }
  }
};

// Theme management without persistence
class ThemeManager {
  constructor() {
    this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.currentTheme = this.prefersDark ? 'dark' : 'light';
    this.setTheme(this.currentTheme);
    this.updateThemeIcon();
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-color-scheme', theme);
    this.currentTheme = theme;
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    this.updateThemeIcon();
  }

  updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
    }
  }
}

// Tab navigation
class TabManager {
  constructor() {
    this.activeTab = 'busquedas-internas';
    this.init();
  }

  init() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
  }

  switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.nav-tab').forEach(button => {
      button.classList.remove('active');
    });

    // Show selected tab content
    const selectedContent = document.getElementById(tabName);
    if (selectedContent) {
      selectedContent.classList.add('active');
    }

    // Add active class to selected tab button
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedButton) {
      selectedButton.classList.add('active');
    }

    this.activeTab = tabName;
  }
}

// Graph utility functions
class GraphUtils {
  static parseVertices(input) {
    if (!input || typeof input !== 'string') return [];
    return input.split(',').map(v => v.trim()).filter(v => v.length > 0);
  }

  static parseAristas(input) {
    if (!input || typeof input !== 'string') return [];
    return input.split(',').map(a => {
      const parts = a.trim().split('-');
      return parts.length === 2 ? [parts[0].trim(), parts[1].trim()] : null;
    }).filter(a => a !== null);
  }

  static validateGraph(vertices, aristas) {
    const vertexSet = new Set(vertices);
    for (const [v1, v2] of aristas) {
      if (!vertexSet.has(v1) || !vertexSet.has(v2)) {
        return false;
      }
    }
    return true;
  }

  static formatVertices(vertices) {
    return vertices.length > 0 ? `{${vertices.join(', ')}}` : '∅';
  }

  static formatAristas(aristas) {
    return aristas.length > 0 ? `{${aristas.map(a => `${a[0]}-${a[1]}`).join(', ')}}` : '∅';
  }
}

// Graph operations
class GraphOperations {
  static union(g1, g2) {
    const vertices = [...new Set([...g1.vertices, ...g2.vertices])];
    const aristasSet = new Set();

    [...g1.aristas, ...g2.aristas].forEach(arista => {
      const key1 = `${arista[0]}-${arista[1]}`;
      const key2 = `${arista[1]}-${arista[0]}`;
      if (!aristasSet.has(key1) && !aristasSet.has(key2)) {
        aristasSet.add(key1);
      }
    });

    const aristas = Array.from(aristasSet).map(key => key.split('-'));
    return { vertices, aristas };
  }

  static intersection(g1, g2) {
    const vertices = g1.vertices.filter(v => g2.vertices.includes(v));
    const vertexSet = new Set(vertices);

    const aristas = g1.aristas.filter(arista => {
      const [v1, v2] = arista;
      const matchInG2 = g2.aristas.some(a => (a[0] === v1 && a[1] === v2) || (a[0] === v2 && a[1] === v1));
      return vertexSet.has(v1) && vertexSet.has(v2) && matchInG2;
    });

    return { vertices, aristas };
  }

  static ringSum(g1, g2) {
    const vertices = [...new Set([...g1.vertices, ...g2.vertices])];

    const g1Set = new Set(g1.aristas.map(a => `${a[0]}-${a[1]}`));
    const g2Set = new Set(g2.aristas.map(a => `${a[0]}-${a[1]}`));

    const aristas = [];
    g1.aristas.forEach(a => {
      const key1 = `${a[0]}-${a[1]}`;
      const key2 = `${a[1]}-${a[0]}`;
      if (!g2Set.has(key1) && !g2Set.has(key2)) {
        aristas.push(a);
      }
    });

    g2.aristas.forEach(a => {
      const key1 = `${a[0]}-${a[1]}`;
      const key2 = `${a[1]}-${a[0]}`;
      if (!g1Set.has(key1) && !g1Set.has(key2)) {
        aristas.push(a);
      }
    });

    return { vertices, aristas };
  }

  static cartesianProduct(g1, g2) {
    const vertices = [];
    g1.vertices.forEach(v1 => {
      g2.vertices.forEach(v2 => {
        vertices.push(`(${v1},${v2})`);
      });
    });

    const aristas = [];

    // First component equal, edges from g2
    g1.vertices.forEach(v1 => {
      g2.aristas.forEach(([u2, v2]) => {
        aristas.push([`(${v1},${u2})`, `(${v1},${v2})`]);
      });
    });

    // Second component equal, edges from g1
    g2.vertices.forEach(v2 => {
      g1.aristas.forEach(([u1, v1]) => {
        aristas.push([`(${u1},${v2})`, `(${v1},${v2})`]);
      });
    });

    return { vertices, aristas };
  }

  static tensorProduct(g1, g2) {
    const vertices = [];
    g1.vertices.forEach(v1 => {
      g2.vertices.forEach(v2 => {
        vertices.push(`(${v1},${v2})`);
      });
    });

    const aristas = [];
    g1.aristas.forEach(([u1, v1]) => {
      g2.aristas.forEach(([u2, v2]) => {
        aristas.push([`(${u1},${u2})`, `(${v1},${v2})`]);
      });
    });

    return { vertices, aristas };
  }

  static composition(g1, g2) {
    // In-depth composition may be heavy; we approximate with cartesian product vertices and edges from either product graphs or two-step paths
    const vertices = [];
    g1.vertices.forEach(v1 => {
      g2.vertices.forEach(v2 => {
        vertices.push(`(${v1},${v2})`);
      });
    });

    const aristas = [];
    // Case 1: share second component; two-path in g1
    g1.vertices.forEach(u1 => {
      g1.vertices.forEach(v1 => {
        if (u1 !== v1) {
          const hasTwoPath = g1.aristas.some(([a, b]) => (a === u1 && b !== v1 && g1.aristas.some(([c, d]) => c === b && d === v1)) ||
                                                         (b === u1 && a !== v1 && g1.aristas.some(([c, d]) => c === a && d === v1)));
          if (hasTwoPath) {
            g2.vertices.forEach(x => {
              aristas.push([`(${u1},${x})`, `(${v1},${x})`]);
            });
          }
        }
      });
    });

    // Case 2: share first component; two-path in g2
    g2.vertices.forEach(u2 => {
      g2.vertices.forEach(v2 => {
        if (u2 !== v2) {
          const hasTwoPath = g2.aristas.some(([a, b]) => (a === u2 && b !== v2 && g2.aristas.some(([c, d]) => c === b && d === v2)) ||
                                                         (b === u2 && a !== v2 && g2.aristas.some(([c, d]) => c === a && d === v2)));
          if (hasTwoPath) {
            g1.vertices.forEach(x => {
              aristas.push([`(${x},${u2})`, `(${x},${v2})`]);
            });
          }
        }
      });
    });

    return { vertices, aristas };
  }
}

// Graphs application controller
class GraphsApp {
  constructor() {
    this.currentScenario = 'conjuntos';
    this.init();
  }

  init() {
    this.setupListeners();
    this.updateScenario();
  }

  setupListeners() {
    document.querySelectorAll('input[name="scenario"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.currentScenario = e.target.value;
        this.updateScenario();
        this.clearResults();
      });
    });

    document.getElementById('calculate-btn').addEventListener('click', () => this.calculateResults());
  }

  updateScenario() {
    const scenario = appData.grafos.escenarios[this.currentScenario];
    document.getElementById('graph1-title').textContent = `Grafo ${scenario.grafo1.label}`;
    document.getElementById('graph2-title').textContent = `Grafo ${scenario.grafo2.label}`;

    document.getElementById('g2-vertices-label').textContent = `Vértices ${scenario.grafo2.label}`;
    document.getElementById('g2-aristas-label').textContent = `Aristas ${scenario.grafo2.label}`;

    document.getElementById('g1-vertices').placeholder = scenario.grafo1.vertices_placeholder;
    document.getElementById('g1-aristas').placeholder = scenario.grafo1.aristas_placeholder;
    document.getElementById('g2-vertices').placeholder = scenario.grafo2.vertices_placeholder;
    document.getElementById('g2-aristas').placeholder = scenario.grafo2.aristas_placeholder;

    this.updateResultCards();
  }

  updateResultCards() {
    const enabled = new Set(appData.grafos.escenarios[this.currentScenario].operaciones_habilitadas);
    document.querySelectorAll('.result-card').forEach(card => {
      card.classList.add('disabled');
    });
    enabled.forEach(op => {
      const card = document.getElementById(`result-${op.replace('_', '-')}`);
      if (card) card.classList.remove('disabled');
    });
  }

  clearResults() {
    document.querySelectorAll('.result-card span').forEach(span => {
      span.textContent = '-';
    });
    document.getElementById('error-section').classList.add('hidden');
  }

  showError(msg) {
    document.getElementById('error-message').textContent = msg;
    document.getElementById('error-section').classList.remove('hidden');
  }

  calculateResults() {
    const g1Vertices = GraphUtils.parseVertices(document.getElementById('g1-vertices').value);
    const g1Aristas = GraphUtils.parseAristas(document.getElementById('g1-aristas').value);
    const g2Vertices = GraphUtils.parseVertices(document.getElementById('g2-vertices').value);
    const g2Aristas = GraphUtils.parseAristas(document.getElementById('g2-aristas').value);

    if (g1Vertices.length === 0 || g2Vertices.length === 0) {
      this.showError('Debe ingresar vértices para ambos grafos');
      return;
    }
    if (!GraphUtils.validateGraph(g1Vertices, g1Aristas)) {
      this.showError('Las aristas de G₁ contienen vértices no definidos');
      return;
    }
    if (!GraphUtils.validateGraph(g2Vertices, g2Aristas)) {
      this.showError('Las aristas de G₂ contienen vértices no definidos');
      return;
    }

    document.getElementById('error-section').classList.add('hidden');

    const g1 = { vertices: g1Vertices, aristas: g1Aristas };
    const g2 = { vertices: g2Vertices, aristas: g2Aristas };

    const enabledOps = appData.grafos.escenarios[this.currentScenario].operaciones_habilitadas;

    if (enabledOps.includes('union')) {
      const res = GraphOperations.union(g1, g2);
      document.getElementById('union-vertices').textContent = GraphUtils.formatVertices(res.vertices);
      document.getElementById('union-aristas').textContent = GraphUtils.formatAristas(res.aristas);
    }
    if (enabledOps.includes('interseccion')) {
      const res = GraphOperations.intersection(g1, g2);
      document.getElementById('interseccion-vertices').textContent = GraphUtils.formatVertices(res.vertices);
      document.getElementById('interseccion-aristas').textContent = GraphUtils.formatAristas(res.aristas);
    }
    if (enabledOps.includes('suma_anillo')) {
      const res = GraphOperations.ringSum(g1, g2);
      document.getElementById('suma-anillo-vertices').textContent = GraphUtils.formatVertices(res.vertices);
      document.getElementById('suma-anillo-aristas').textContent = GraphUtils.formatAristas(res.aristas);
    }
    if (enabledOps.includes('producto_cartesiano')) {
      const res = GraphOperations.cartesianProduct(g1, g2);
      document.getElementById('producto-cartesiano-vertices').textContent = GraphUtils.formatVertices(res.vertices);
      document.getElementById('producto-cartesiano-aristas').textContent = GraphUtils.formatAristas(res.aristas);
    }
    if (enabledOps.includes('producto_tensorial')) {
      const res = GraphOperations.tensorProduct(g1, g2);
      document.getElementById('producto-tensorial-vertices').textContent = GraphUtils.formatVertices(res.vertices);
      document.getElementById('producto-tensorial-aristas').textContent = GraphUtils.formatAristas(res.aristas);
    }
    if (enabledOps.includes('composicion')) {
      const res = GraphOperations.composition(g1, g2);
      document.getElementById('composicion-vertices').textContent = GraphUtils.formatVertices(res.vertices);
      document.getElementById('composicion-aristas').textContent = GraphUtils.formatAristas(res.aristas);
    }
  }
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  const themeManager = new ThemeManager();
  const tabManager = new TabManager();
  const graphsApp = new GraphsApp();

  document.getElementById('theme-toggle').addEventListener('click', () => themeManager.toggleTheme());

  console.log('Simulador iniciado');
});