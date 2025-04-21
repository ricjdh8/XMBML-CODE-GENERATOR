const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Helper para escapar HTML ---
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

// --- Funções de Geração XMBML (modificadas para gerar HTML com spans) ---

function gerarXMBML(dados) {
  const { tipo, viewId, items } = dados;
  let htmlOutput = ''; // Agora geramos HTML

  // Cabeçalho XMBML
  htmlOutput += `<span class="xml-tag">&lt;XMBML</span> <span class="xml-attr-name">version</span>=<span class="xml-attr-value">"1.0"</span><span class="xml-tag">&gt;</span>\n`;

  if ((tipo === 'menu1' || tipo === 'ambos') && items && items.length > 0) {
    htmlOutput += gerarMenu1(viewId, items);
  }

  if ((tipo === 'menu2' || tipo === 'ambos') && items && items.length > 0) {
    htmlOutput += gerarMenu2(viewId, items);
  }

  // Fecha o XMBML
  htmlOutput += `<span class="xml-tag">&lt;/XMBML&gt;</span>`;

  return htmlOutput;
}

function gerarMenu1(viewId, items) {
  let htmlOutput = '';
  const indent1 = '    '; // 4 spaces
  const indent2 = '        '; // 8 spaces
  const indent3 = '            '; // 12 spaces

  // Início da View
  htmlOutput += `${indent1}<span class="xml-tag">&lt;View</span> <span class="xml-attr-name">id</span>=<span class="xml-attr-value">"${escapeHtml(viewId)}_items"</span><span class="xml-tag">&gt;</span>\n`;
  htmlOutput += `${indent2}<span class="xml-tag">&lt;Attributes&gt;</span>\n`;

  // Gera as tabelas para cada item
  items.forEach(item => {
    if (!item || !item.indice) return; // Skip invalid items
    htmlOutput += `${indent3}<span class="xml-tag">&lt;Table</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"psnstuff_us_item_${escapeHtml(item.indice)}"</span><span class="xml-tag">&gt;</span>\n`;
    htmlOutput += `${indent3}    <span class="xml-tag">&lt;Pair</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"icon"</span><span class="xml-tag">&gt;</span><span class="xml-tag">&lt;String&gt;</span><span class="xml-string">${escapeHtml(item.caminhoImagem)}</span><span class="xml-tag">&lt;/String&gt;</span><span class="xml-tag">&lt;/Pair&gt;</span>\n`;
    htmlOutput += `${indent3}    <span class="xml-tag">&lt;Pair</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"title"</span><span class="xml-tag">&gt;</span><span class="xml-tag">&lt;String&gt;</span><span class="xml-string">${escapeHtml(item.nomeJogo)}</span><span class="xml-tag">&lt;/String&gt;</span><span class="xml-tag">&lt;/Pair&gt;</span>\n`;
    htmlOutput += `${indent3}    <span class="xml-tag">&lt;Pair</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"info"</span><span class="xml-tag">&gt;</span><span class="xml-tag">&lt;String&gt;</span><span class="xml-string">${escapeHtml(item.descricao)}</span><span class="xml-tag">&lt;/String&gt;</span><span class="xml-tag">&lt;/Pair&gt;</span>\n`;
    htmlOutput += `${indent3}    <span class="xml-tag">&lt;Pair</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"ingame"</span><span class="xml-tag">&gt;</span><span class="xml-tag">&lt;String&gt;</span><span class="xml-string">disable</span><span class="xml-tag">&lt;/String&gt;</span><span class="xml-tag">&lt;/Pair&gt;</span>\n`;
    htmlOutput += `${indent3}<span class="xml-tag">&lt;/Table&gt;</span>\n`;
  });

  htmlOutput += `${indent2}<span class="xml-tag">&lt;/Attributes&gt;</span>\n`;
  htmlOutput += `${indent2}<span class="xml-tag">&lt;Items&gt;</span>\n`;

  // Gera as queries para cada item
  items.forEach(item => {
    if (!item || !item.indice) return; // Skip invalid items
    htmlOutput += `${indent3}<span class="xml-tag">&lt;Query</span> <span class="xml-attr-name">class</span>=<span class="xml-attr-value">"type:x-xmb/folder-pixmap"</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"psnstuff_us_item_${escapeHtml(item.indice)}"</span> <span class="xml-attr-name">attr</span>=<span class="xml-attr-value">"psnstuff_us_item_${escapeHtml(item.indice)}"</span> <span class="xml-attr-name">src</span>=<span class="xml-attr-value">"#psnstuff_us_item_${escapeHtml(item.indice)}_link"</span><span class="xml-tag">/&gt;</span>\n`;
  });

  htmlOutput += `${indent2}<span class="xml-tag">&lt;/Items&gt;</span>\n`;
  htmlOutput += `${indent1}<span class="xml-tag">&lt;/View&gt;</span>\n`;

  return htmlOutput;
}

function gerarMenu2(viewId, items) {
  let htmlOutput = '';
  const indent1 = '    '; // 4 spaces
  const indent2 = '        '; // 8 spaces
  const indent3 = '            '; // 12 spaces

  // Para cada item, gera uma View de links
  items.forEach(item => {
    if (!item || !item.indice || !item.links || item.links.length === 0) return; // Skip invalid items or items without links

    htmlOutput += `${indent1}<span class="xml-tag">&lt;View</span> <span class="xml-attr-name">id</span>=<span class="xml-attr-value">"psnstuff_us_item_${escapeHtml(item.indice)}_link"</span><span class="xml-tag">&gt;</span>\n`;
    htmlOutput += `${indent2}<span class="xml-tag">&lt;Attributes&gt;</span>\n`;

    // Gera tabelas para cada link do item
    item.links.forEach((link, i) => {
        if (!link) return; // Skip invalid links
        const suffix = i > 0 ? `_${i}` : '';
        const tableKey = `psnstuff_us_item_${escapeHtml(item.indice)}${suffix}`;

        htmlOutput += `${indent3}<span class="xml-tag">&lt;Table</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"${tableKey}"</span><span class="xml-tag">&gt;</span>\n`;
        htmlOutput += `${indent3}    <span class="xml-tag">&lt;Pair</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"icon"</span><span class="xml-tag">&gt;</span><span class="xml-tag">&lt;String&gt;</span><span class="xml-string">${escapeHtml(item.caminhoImagem)}</span><span class="xml-tag">&lt;/String&gt;</span><span class="xml-tag">&lt;/Pair&gt;</span>\n`;
        htmlOutput += `${indent3}    <span class="xml-tag">&lt;Pair</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"title"</span><span class="xml-tag">&gt;</span><span class="xml-tag">&lt;String&gt;</span><span class="xml-string">${escapeHtml(link.titulo)}</span><span class="xml-tag">&lt;/String&gt;</span><span class="xml-tag">&lt;/Pair&gt;</span>\n`;
        htmlOutput += `${indent3}    <span class="xml-tag">&lt;Pair</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"info"</span><span class="xml-tag">&gt;</span><span class="xml-tag">&lt;String&gt;</span><span class="xml-string">${escapeHtml(link.descricao)}</span><span class="xml-tag">&lt;/String&gt;</span><span class="xml-tag">&lt;/Pair&gt;</span>\n`;
        htmlOutput += `${indent3}    <span class="xml-tag">&lt;Pair</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"module_name"</span><span class="xml-tag">&gt;</span><span class="xml-tag">&lt;String&gt;</span><span class="xml-string">webrender_plugin</span><span class="xml-tag">&lt;/String&gt;</span><span class="xml-tag">&lt;/Pair&gt;</span>\n`;
        htmlOutput += `${indent3}    <span class="xml-tag">&lt;Pair</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"module_action"</span><span class="xml-tag">&gt;</span><span class="xml-tag">&lt;String&gt;</span><span class="xml-string">${escapeHtml(link.url)}</span><span class="xml-tag">&lt;/String&gt;</span><span class="xml-tag">&lt;/Pair&gt;</span>\n`;
        htmlOutput += `${indent3}<span class="xml-tag">&lt;/Table&gt;</span>\n`;
    });

    htmlOutput += `${indent2}<span class="xml-tag">&lt;/Attributes&gt;</span>\n`;
    htmlOutput += `${indent2}<span class="xml-tag">&lt;Items&gt;</span>\n`;

    // Gera items para cada link do item
    item.links.forEach((link, i) => {
        if (!link) return; // Skip invalid links
        const suffix = i > 0 ? `_${i}` : '';
        const itemKey = `psnstuff_us_item_${escapeHtml(item.indice)}${suffix}`;
        htmlOutput += `${indent3}<span class="xml-tag">&lt;Item</span> <span class="xml-attr-name">class</span>=<span class="xml-attr-value">"type:x-xmb/module-action"</span> <span class="xml-attr-name">key</span>=<span class="xml-attr-value">"${itemKey}"</span> <span class="xml-attr-name">attr</span>=<span class="xml-attr-value">"${itemKey}"</span><span class="xml-tag">/&gt;</span>\n`;
    });

    htmlOutput += `${indent2}<span class="xml-tag">&lt;/Items&gt;</span>\n`;
    htmlOutput += `${indent1}<span class="xml-tag">&lt;/View&gt;</span>\n`;
  });

  return htmlOutput;
}


// --- Rotas --- 
app.get('/', (req, res) => {
  res.render('index');
});

// Rota para preview em tempo real
app.post('/preview', (req, res) => {
  const formData = req.body;
  const resultadoHtml = gerarXMBML(formData);
  res.json({ codigo: resultadoHtml }); // Envia HTML
});

// Rota para gerar o código XMBML final (também envia HTML formatado)
app.post('/gerar', (req, res) => {
  const formData = req.body;
  const resultadoHtml = gerarXMBML(formData);
  res.json({ codigo: resultadoHtml }); // Envia HTML
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 