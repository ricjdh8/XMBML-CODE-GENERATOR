# Gerador de XMBML para PS3

Este é um aplicativo web desenvolvido em Node.js e Express que permite gerar snippets de código XMBML para XMB do PlayStation 3

## Funcionalidades

- Gerar snippets de código XMBML para XMB do PS3
- Preview em tempo real
- Highlight de Sintaxe

## Requisitos

- Node.js
- npm
  
## Instalação

1. Clone este repositório
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

Open Source
