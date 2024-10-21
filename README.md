# 🌓 New World Night Time & War Timer

Este projeto foi criado para ajudar os jogadores de **New World** a acompanharem os horários de **Night Time** (tempo noturno no jogo) e as **Guerras** do servidor **Alkaid**. A página é responsiva, com suporte a modo escuro/claro, e inclui notificações para eventos importantes como o início do Night Time.

## 📋 Funcionalidades

### ⏰ Night Time Countdown
- Exibe o próximo horário de Night Time no jogo.
- Atualiza automaticamente quando o próximo ciclo começa.
- Exibe um histórico dos Night Times já ocorridos.

### ⚔️ War Timer
- Lista as guerras agendadas para o servidor Alkaid, com informações como:
  - Guilda Atacante e Guilda Defensora.
  - Mapa da guerra.
  - Horário da guerra.
  - Contagem regressiva para a guerra, mostrando quanto tempo falta para o início.
- Diferencia visualmente o atacante (com ícone de espada) e o defensor (com ícone de escudo).

### 🔔 Notificações
- Opção para ativar notificações de Night Time com alertas que podem ser ajustados para até 10 minutos antes do evento.

### 🌗 Modo Claro/Escuro
- O site possui um botão para alternar entre os modos claro e escuro.
- A preferência de tema é salva no navegador do usuário, para que ele veja o modo escolhido na próxima vez que acessar.

## 🚀 Tecnologias Utilizadas

- **HTML/CSS/JavaScript**: Para a estrutura, estilização e funcionamento dinâmico do site.
- **Fetch API**: Para carregar dinamicamente as guerras a partir de um arquivo `wars.json`.
- **LocalStorage**: Para armazenar as preferências de modo claro/escuro do usuário.
- **Notificações do navegador**: Para alertar sobre o início do Night Time, se ativado.

## 🔧 Como usar

1. **Acesse a página**: O site está hospedado no GitHub Pages, então basta acessar [o link fornecido](https://maayk.github.io/nw-info/).
   
2. **Modo escuro/claro**: Utilize o botão "Ativar Modo Escuro" para alternar entre as opções de tema. O modo escolhido será salvo no seu navegador.

3. **Notificações de Night Time**: Ative as notificações escolhendo com quantos minutos de antecedência você quer ser avisado (0, 5 ou 10 minutos). 

4. **Acompanhamento de guerras**: A seção de guerras atualiza automaticamente, mostrando as informações mais recentes. Não é necessário atualizar a página para ver novas guerras.

## 🛠️ Como atualizar as guerras

Se você precisar atualizar as guerras:
1. Abra o arquivo `wars.json` e edite as guerras do dia, informando a guilda atacante, a guilda defensora, o horário da guerra e o mapa onde acontecerá.
2. Salve o arquivo e o site irá atualizar automaticamente as informações para os usuários.

## 🌐 Contribuições

Contribuições são bem-vindas! Se tiver alguma sugestão ou encontrar um problema, sinta-se à vontade para abrir uma _issue_ ou fazer um _pull request_.
