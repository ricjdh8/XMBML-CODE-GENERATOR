document.addEventListener('DOMContentLoaded', function() {
    // --- Elementos DOM --- 
    const editorContainer = document.getElementById('xmbmlEditor');
    const editorItemsContainer = document.getElementById('editorItemsContainer');
    const addEditorItemBtn = document.getElementById('addEditorItem');
    const previewResultado = document.getElementById('previewResultado');
    const copyPreviewButton = document.getElementById('copyPreviewButton');
    const generationTypeSelect = document.getElementById('generationType');
    const mainViewIdElement = document.getElementById('mainViewId');
    const finalSubmitButton = document.querySelector('button[form="dummyForm"]'); // Botão de gerar final
    const dummyForm = document.getElementById('dummyForm');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    // Templates
    const editorItemTemplate = document.getElementById('editorItemTemplate');
    const editorLinkTemplate = document.getElementById('editorLinkTemplate');

    // --- Estado e Configuração ---
    let previewTimer = null;
    let globalItemCounter = 0;
    const THEME_KEY = 'xmbmlGeneratorTheme';

    // --- Inicialização ---
    initTheme(); // Aplica o tema salvo ou padrão
    addEditorItem(); // Adiciona um item inicial
    atualizarPreview(); // Gera preview inicial

    // --- Event Listeners Globais ---

    // Atualiza preview em edições (com debounce)
    editorContainer.addEventListener('input', function(e) {
        if (e.target.classList.contains('editable')) {
            if (previewTimer) clearTimeout(previewTimer);
            previewTimer = setTimeout(atualizarPreview, 500);
        }
    });

    // Atualiza preview na mudança do tipo de geração
    generationTypeSelect.addEventListener('change', atualizarPreview);

    // Botão de trocar tema
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Delegação de eventos para adicionar/remover blocos
    editorContainer.addEventListener('click', function(e) {
        // Adicionar Item Principal
        if (e.target.closest('#addEditorItem')) {
            addEditorItem();
        }
        // Remover Item Principal
        const removeItemBtn = e.target.closest('.remove-editor-item');
        if (removeItemBtn) {
            const itemBlock = removeItemBtn.closest('.xmbml-item-block');
             if (editorItemsContainer.children.length > 1) {
                 itemBlock.remove();
                 renumerarItensPrincipais();
                 atualizarPreview();
             } else {
                 alert('É necessário pelo menos um item principal.');
             }
        }
        // Adicionar Link
        const addLinkBtn = e.target.closest('.add-editor-link');
        if (addLinkBtn) {
            const linksContainer = addLinkBtn.previousElementSibling; // O div .editor-links-container
             adicionarEditorLink(linksContainer);
             atualizarPreview();
        }
        // Remover Link
        const removeLinkBtn = e.target.closest('.remove-editor-link');
        if (removeLinkBtn) {
            const linkBlock = removeLinkBtn.closest('.xmbml-link-block');
            const linksContainer = linkBlock.parentElement;
            linkBlock.remove();
            renumerarLinks(linksContainer);
            atualizarPreview();
        }
    });
    
    // Copiar preview (agora copia o texto simples, não o HTML)
    copyPreviewButton.addEventListener('click', () => copiarCodigo(previewResultado, copyPreviewButton, true));

    // Gerar XMBML Final (submissão do formulário dummy)
    dummyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        gerarXMBMLFinal();
    });

    // --- Funções de Tema ---
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
        setTheme(savedTheme);
    }

    function setTheme(theme) {
        document.body.dataset.theme = theme;
        localStorage.setItem(THEME_KEY, theme);

        if (theme === 'dark') {
            themeToggleBtn.innerHTML = '<i class="bi bi-brightness-high-fill"></i> Tema Claro';
        } else {
            themeToggleBtn.innerHTML = '<i class="bi bi-moon-stars-fill"></i> Tema Escuro';
        }
    }

    function toggleTheme() {
        const currentTheme = document.body.dataset.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }

    // --- Funções Principais (CRUD Editor) ---

    function addEditorItem() {
        globalItemCounter++;
        const itemNode = document.importNode(editorItemTemplate.content, true);
        const itemBlock = itemNode.querySelector('.xmbml-item-block');
        const collapseTargetId = `itemCollapse_${globalItemCounter}`;
        const header = itemNode.querySelector('.card-header');
        const collapseDiv = itemNode.querySelector('.collapse');

        header.dataset.bsTarget = `#${collapseTargetId}`;
        collapseDiv.id = collapseTargetId;
        itemNode.querySelector('.item-identifier').textContent = `#${globalItemCounter}`;
        itemNode.querySelector('.item-index').textContent = `ITEM_${globalItemCounter}`;
        itemNode.querySelector('.item-icon').textContent = `dev_hdd0/path/to/icon_${globalItemCounter}.png`;
        itemNode.querySelector('.item-title').textContent = `Nome do Jogo ${globalItemCounter}`;
        itemNode.querySelector('.item-info').textContent = `BLUSXXXX${globalItemCounter} - PKG - 1.0 GB`;

        const linksContainer = itemNode.querySelector('.editor-links-container');
        adicionarEditorLink(linksContainer, globalItemCounter);

        editorItemsContainer.appendChild(itemNode);
        renumerarItensPrincipais();
        setTimeout(atualizarPreview, 100);
    }

    function adicionarEditorLink(linksContainer, itemIndex = null) {
        const linkCount = linksContainer.querySelectorAll('.xmbml-link-block').length + 1;
        const linkNode = document.importNode(editorLinkTemplate.content, true);
        const linkBlock = linkNode.querySelector('.xmbml-link-block');
        
        if (itemIndex === null) {
             const itemBlock = linksContainer.closest('.xmbml-item-block');
             itemIndex = itemBlock.querySelector('.item-identifier').textContent.replace('#', '');
        }

        const collapseTargetId = `linkCollapse_${itemIndex}_${linkCount}`;
        const header = linkNode.querySelector('.card-header');
        const collapseDiv = linkNode.querySelector('.collapse');

        header.dataset.bsTarget = `#${collapseTargetId}`;
        collapseDiv.id = collapseTargetId;
        linkNode.querySelector('.link-identifier').textContent = `#${linkCount}`;
        linkNode.querySelector('.link-title').textContent = `Baixar Jogo (Parte ${linkCount})`;
        linkNode.querySelector('.link-desc').textContent = `Descrição do Download ${linkCount}`;
        linkNode.querySelector('.link-url').textContent = `http://example.com/link${itemIndex}-${linkCount}.pkg`;

        linksContainer.appendChild(linkNode);
        renumerarLinks(linksContainer);
    }

    function renumerarItensPrincipais() {
        const items = editorItemsContainer.querySelectorAll('.xmbml-item-block');
        items.forEach((item, index) => {
            // Atualiza o identificador visual se necessário (ex: #1, #2)
            // O índice real (ITEM_X) é editável e não deve ser renumerado automaticamente aqui
            // item.querySelector('.item-identifier').textContent = `#${index + 1}`;
        });
    }

    function renumerarLinks(linksContainer) {
        const links = linksContainer.querySelectorAll('.xmbml-link-block');
        links.forEach((link, index) => {
            link.querySelector('.link-identifier').textContent = `#${index + 1}`;
            // Atualizar IDs do collapse para evitar conflitos
             const itemIndex = linksContainer.closest('.xmbml-item-block').querySelector('.item-identifier').textContent.replace('#', '');
             const newCollapseId = `linkCollapse_${itemIndex}_${index + 1}`;
             link.querySelector('.card-header').dataset.bsTarget = `#${newCollapseId}`;
             link.querySelector('.collapse').id = newCollapseId;
        });
    }

    // --- Funções de Geração e Coleta --- 

    function coletarDadosEditor() {
        const viewId = mainViewIdElement.textContent.trim() || 'NOME_DA_VIEW';
        const tipoMenu = generationTypeSelect.value;

        const items = [];
        const itemElements = editorItemsContainer.querySelectorAll('.xmbml-item-block');

        itemElements.forEach(itemEl => {
            const indice = itemEl.querySelector('.item-index').textContent.trim() || 'INDICE';
            const caminhoImagem = itemEl.querySelector('.item-icon').textContent.trim() || 'CAMINHO_IMAGEM';
            const nomeJogo = itemEl.querySelector('.item-title').textContent.trim() || 'NOME_JOGO';
            const descricao = itemEl.querySelector('.item-info').textContent.trim() || 'DESCRICAO';

            const links = [];
            const linkElements = itemEl.querySelectorAll('.xmbml-link-block');

            linkElements.forEach(linkEl => {
                links.push({
                    titulo: linkEl.querySelector('.link-title').textContent.trim() || 'TITULO_LINK',
                    descricao: linkEl.querySelector('.link-desc').textContent.trim() || 'DESCRICAO_LINK',
                    url: linkEl.querySelector('.link-url').textContent.trim() || 'URL_LINK'
                });
            });

            items.push({
                indice,
                caminhoImagem,
                nomeJogo,
                descricao,
                links
            });
        });

        return {
            tipo: tipoMenu,
            viewId,
            items
        };
    }

    function atualizarPreview() {
        const formData = coletarDadosEditor();

        fetch('/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            // Usa innerHTML pois o backend agora envia HTML formatado
            previewResultado.innerHTML = data.codigo; 
            
             // Flash effect (agora na borda via CSS)
             const previewCardBody = previewResultado.closest('.preview-wrapper');
             if(previewCardBody) {
                previewCardBody.classList.add('flash-update');
                setTimeout(() => previewCardBody.classList.remove('flash-update'), 600); // Duração da animação CSS
             }
        })
        .catch(error => console.error('Erro no preview:', error));
    }
    
    function gerarXMBMLFinal() {
         const formData = coletarDadosEditor();
         const resultadoCard = document.getElementById('resultadoCard');
         const codigoResultado = document.getElementById('codigoResultado');
         const copyButton = document.getElementById('copyButton');
         
         if (resultadoCard && codigoResultado) {
             fetch('/gerar', { // Usando a rota /gerar original
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(formData)
             })
             .then(response => response.json())
             .then(data => {
                 // Usa innerHTML para o resultado final também
                 codigoResultado.innerHTML = data.codigo; 
                 resultadoCard.style.display = 'block';
                 resultadoCard.scrollIntoView({ behavior: 'smooth' });
                 
                 // Configurar botão de cópia para o resultado final (copia texto simples)
                 if (copyButton) {
                     copyButton.onclick = () => copiarCodigo(codigoResultado, copyButton, true);
                 }
             })
             .catch(error => {
                 console.error('Erro ao gerar XMBML final:', error);
                 alert('Erro ao gerar o código final.');
             });
         } else {
             console.log("Código Final:");
             // Para exibir no console o HTML formatado:
             fetch('/gerar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
                .then(res => res.json()).then(data => console.log(data.codigo));
             alert("Código XMBML final gerado (veja console)!");
         }
    }

    // --- Funções Utilitárias ---

    function copiarCodigo(elementoConteudo, botao, copiarTextoSimples = false) {
        // Se copiarTextoSimples for true, pega o textContent, senão pega o innerHTML (ou textContent se preferir)
        const codigo = copiarTextoSimples ? elementoConteudo.textContent : elementoConteudo.innerHTML;
        
        navigator.clipboard.writeText(codigo)
            .then(() => {
                const textoOriginal = botao.textContent; // Guarda o texto original ('Copiar')
                botao.innerHTML = '<i class="bi bi-check-lg"></i> Copiado!';
                botao.classList.add('btn-success');
                botao.classList.remove('btn-outline-primary');
                setTimeout(() => {
                    // Restaura o ícone e texto originais
                    const iconHtml = '<i class="bi bi-clipboard"></i>'; 
                    botao.innerHTML = `${iconHtml} Copiar`; 
                    botao.classList.remove('btn-success');
                    botao.classList.add('btn-outline-primary');
                }, 2000);
            })
            .catch(err => {
                console.error('Erro ao copiar:', err);
                alert('Falha ao copiar. Use Ctrl+C.');
            });
    }
}); 