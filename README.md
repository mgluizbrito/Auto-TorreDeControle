# Envio de Notificações de Transferências

Este projeto automatiza o envio de mensagens pelo WhatsApp com informações de uma planilha do Google Sheets. A aplicação lê dados de transferências da planilha **"Mapa de transferências"** e, em seguida, utiliza a API do WhatsApp para enviar as notificações.

-----

## 🚀 Tecnologias

  * **Node.js**: Ambiente de execução JavaScript.
  * **TypeScript**: Superconjunto do JavaScript que adiciona tipagem estática, garantindo um código mais robusto e fácil de manter.
  * **Google Sheets API**: Coleta os dados da planilha.
  * **`whatsapp-web.js`**: Biblioteca para controle da sessão do WhatsApp Web, permitindo o envio das mensagens.

-----

## 📋 Pré-requisitos

Para rodar este projeto, certifique-se de ter o __Node.js 22.18.0 ou superior__ instalado.

```bash
# Verifique a versão
❯ node -v
v22.18.0

```

-----

## 🛠️ Configuração

### 1\. Clonar o Repositório

```bash
git clone <URL_DO_SEU_REPOSITÓRIO>
cd <nome-do-seu-repositorio>
```

### 2\. Instalar Dependências

```bash
npm install
```

### 3\. Configurar a Google Sheets API

1.  Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2.  Crie um novo projeto ou selecione um existente.
3.  Vá para **"APIs e Serviços" \> "Biblioteca"** e habilite a **"Google Sheets API"**.
4.  Crie as credenciais. No menu **"Credenciais"**, clique em **"Criar Credenciais"** e escolha **"Chave da API"**.
5.  Salve a chave da API em um arquivo `.env` na raiz do projeto, com o nome `GOOGLE_SHEETS_API_KEY`.
6.  Copie o ID da sua planilha "Mapa de transferências" da URL (`https://docs.google.com/spreadsheets/d/`**`<ID_DA_PLANILHA>`**`/edit`) e adicione-o ao arquivo `.env` como `SPREADSHEET_ID`.

### 4\. Configurar as Variáveis de Ambiente

Clone o arquivo `.env.example` para `.env` na raiz do projeto com as seguintes variáveis:

```env
GOOGLE_SHEETS_API_KEY=sua_chave_de_api
SPREADSHEET_ID=o_id_da_sua_planilha
```

> **Atenção:** Nunca adicione o arquivo `.env` ao controle de versão\! O arquivo `.gitignore` já deve estar configurado para ignorá-lo.

-----

## 🚀 Como Executar o Projeto

1.  **Compilar o código:**
    Converte o código TypeScript para JavaScript.

    ```bash
    npm run build
    ```

2.  **Executar o script:**
    Inicia a aplicação. Um código QR será gerado no seu terminal. Use seu celular para escanear e conectar-se ao WhatsApp.

    ```bash
    npm start
    ```

> **Dica:** Para agilizar o desenvolvimento, use `npm run dev` para compilar e executar o projeto automaticamente.

-----

## 📝 Estrutura do Projeto

  * `src/`: Pasta com todo o código-fonte em TypeScript.
      * `api/`: Módulo para a comunicação com a Google Sheets API.
      * `whatsapp/`: Módulo para o controle do `whatsapp-web.js`.
      * `utils/`: Funções utilitárias (formatação de mensagens, etc.).
      * `index.ts`: Ponto de entrada da aplicação.
  * `dist/`: Pasta onde o código JavaScript compilado será salvo.
  * `tsconfig.json`: Configurações do compilador TypeScript.
  * `package.json`: Gerenciador de pacotes, dependências e scripts.

-----

## 🤖 Regras de Negócio

  * O script **lerá os dados da planilha** "Mapa de transferências".
  * Ele buscará as informações necessárias, como nome do destinatário, valor da transferência, e telefone.
  * Será feita uma validação básica para garantir que todos os dados essenciais estejam preenchidos.
  * A aplicação **se conectará à sua conta do WhatsApp** via QR Code.
  * Para cada linha da planilha, o script enviará uma mensagem formatada com os detalhes da transferência.

-----

## 🤝 Contribuições

Este projeto está pronto para ser aprimorado\! Contribuições são bem-vindas. Se você deseja adicionar novas funcionalidades, como:

  * **Validação de Telefone:** Verificação se o número de telefone é válido.
  * **Log de Erros:** Um sistema mais robusto para registrar o status de cada envio.
  * **Envio Programado:** Agendar o envio de mensagens em horários específicos.

Sinta-se à vontade para criar uma *branch* e abrir um *pull request*.