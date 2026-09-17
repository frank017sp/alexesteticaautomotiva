# Alex Lava Rápido - Estética Automotiva

Crie um web app mobile-first de agendamento online para um Lava-Rápido Premium, projetado especificamente para ser utilizado na bio do Instagram. O design deve ser moderno, clean e de alta conversão, utilizando uma estética de tema escuro (dark mode) sofisticada baseada na identidade visual da logo 'ALEX LAVA-CAR ESTÉTICA AUTOMOTIVA'.

Configuração Visual e Tema:

- Fundo: Painéis de alumínio texturizado com ranhuras sutis e algumas gotas de água esparsas.

- Esquema de Cores: Base em azul-marinho profundo e cinza grafite, com acentos em laranja queima e cromo. Molduras e botões principais em laranja queima.

- Texturas: Usar efeitos metálicos sutis e detalhes de gotas de água.

Estrutura da UI e Conteúdo (Passo a Passo):

1. Cabeçalho:

- Logotipo: Inserir o logotipo completo 'ALEX LAVA-CAR ESTÉTICA AUTOMOTIVA' (conforme image_0.png) centralizado no topo.

- Título: Centralizado abaixo do logo, o texto: "Agende sua lavagem em menos de 2 minutos."

- Botão Principal: Um botão cromado e arrojado com um ícone de relógio sutil e o texto "Agendar Horário".

2. Painel de Seleção de Serviços:

- Criar uma grade de 2x2 com quatro cards de serviço.

- Estilo dos Cards: Fundo azul escuro com molduras em laranja queima.

- Conteúdo do Card (Ícone, Nome, Preço):

    - Card 1: Ícone de carro limpo, "Lavagem Convencional", "R$ 70".

    - Card 2: Ícone de polimento/carro, "Lavagem Detalhada", "R$ 130".

    - Card 3: Ícone de assento/upholstery, "Higienização de Estofados", "*A partir de R$ 300*".

    - Card 4: Ícone de scooter, "Scooter Elétrica (Lavagem a Seco)", "R$ 40".

- Nota de Rodapé dos Cards: Abaixo dos cards (com asterisco): "*O valor final depende do nível de sujidade e será avaliado presencialmente."

3. Painel de Agendamento (Formulário e Calendário):

- Um painel principal com fundo de alumínio texturizado.

- Stepper (Barra de progresso): No topo, uma linha com 4 círculos numerados de 1 a 4, em laranja queima, indicando o passo atual.

- Campos de Entrada (Formulário): Campos para "Nome", "WhatsApp", "Modelo do Veículo" e "Placa". Fundo escuro, bordas finas cromadas.

- Calendário: Um mini-calendário de mês. Usar um exemplo genérico (ex: "Junio 2023"). Dias da semana abreviados. Dias selecionados/destacados em laranja. Dias indisponíveis acinzentados.

- Grade de Horários: Uma seção para "Horários" (corrigindo para "Timos") com uma grade de slots de tempo (ex: 09:00, 11:00...). Horários disponíveis em azul claro/branco, horários ocupados/selecionados em laranja queima.

4. Rodapé de Confirmação (Painel separado com moldura laranja):

- Resumo: O texto: "Resumo de confirmação:" e, abaixo, o preço estimado "A partir de R$ 70".

- Botão WhatsApp: Um botão grande e verde brilhante com o ícone oficial do WhatsApp e o texto: "Confirmar via WhatsApp".

Instruções Adicionais de UI/UX:

- 100% responsivo e otimizado para navegadores internos do Instagram (iOS e Android).

- Sem menus complexos ou páginas estáticas desnecessárias. Foco total na conversão do agendamento.

- Usar uma fonte sans-serif limpa e moderna.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://alexesteticaautomotiva.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2b93cb29-2bbc-4e97-8d6a-27daf8d96533).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
