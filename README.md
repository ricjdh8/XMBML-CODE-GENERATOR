# Gerador de XMBML para PS3

Este é um aplicativo web desenvolvido em Node.js e Express que permite gerar snippets de código XMBML para PlayStation 3, baseado em exemplos de arquivos XML. O XMBML é utilizado para criar menus personalizados no PS3.

## Funcionalidades

- Gerar snippets de código XMBML para menus do PS3
- Criar menus com múltiplos itens e links
- Personalizar IDs, caminhos de imagens, títulos e descrições
- Opção de gerar apenas o menu principal, apenas menus de links ou ambos
- Interface responsiva e amigável
- Copiar o código gerado com um clique

## Requisitos

- Node.js 12.x ou superior
- npm (geralmente vem com o Node.js)

## Instalação

1. Clone este repositório ou baixe os arquivos
2. Navegue até a pasta do projeto pelo terminal
3. Execute o comando para instalar as dependências:

```bash
npm install
```

## Uso

1. Inicie o servidor com o comando:

```bash
npm start
```

2. Acesse o aplicativo no navegador em: http://localhost:3000

3. Preencha os campos conforme necessário:
   - ID da View Principal
   - Tipo de Menu a Gerar
   - Adicione itens com o botão "Adicionar Item"
   - Para cada item, adicione links com o botão "Adicionar Link"

4. Clique em "Gerar XMBML" para criar o snippet de código

5. O código será exibido na tela e você pode copiá-lo clicando no botão "Copiar"

## Estrutura XMBML

O XMBML utiliza uma estrutura XML específica:

- Cada menu é uma `<View>`
- Uma View contém:
  - `<Attributes>`: tabelas com pares de chave/valor
  - `<Items>`: itens que usam as tabelas definidas em Attributes

### Exemplo da estrutura:

```xml
<XMBML version="1.0">
    <View id="nome_da_view_items">
        <Attributes>
            <Table key="psnstuff_us_item_X">
                <Pair key="icon"><String>caminho/da/imagem.png</String></Pair>
                <Pair key="title"><String>Nome do Jogo</String></Pair>
                <Pair key="info"><String>Descrição do Jogo</String></Pair>
                <Pair key="ingame"><String>disable</String></Pair>
            </Table>
        </Attributes>
        <Items>
            <Query class="type:x-xmb/folder-pixmap" key="psnstuff_us_item_X" attr="psnstuff_us_item_X" src="#psnstuff_us_item_X_link"/>
        </Items>
    </View>
</XMBML>
```

## Desenvolvimento

- Frontend: HTML, CSS, JavaScript e Bootstrap 5
- Backend: Node.js com Express
- Template Engine: EJS

## Licença

Este projeto é disponibilizado sob a licença MIT. 