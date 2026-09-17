# Alex Lava-Car — atualização visual

- Barra superior branca, abertura escura com vídeo e apenas dois benefícios.
- Fundo branco nos serviços, Instagram, localização e rodapé; fundo claro no agendamento.
- Cards menores, fotos diversificadas e rolagem horizontal.
- Destaques do serviço selecionado e etapas reduzidos; calendário e verificação de horários preservados.
- Sete serviços, novos preços e marcação SEO incluídos no front.

## Publicação e segurança
1. Execute `npm run build` no ambiente com dependências instaladas e teste um agendamento real em ambiente de teste, painel admin e versão mobile antes de publicar no Lovable. Aqui foram feitas validações estáticas, não um build completo.
2. Aplique a migração `supabase/migrations/20260917193000_update_services_and_prices.sql` no banco Supabase vinculado ao Lovable e confira os preços no painel. O commit no GitHub não garante que a migração rodou.
3. Configure os valores de `.env.example` nas variáveis de ambiente do Lovable. A service role deve ser exclusiva do servidor.
4. O `.env` anteriormente versionado foi removido da árvore atual, mas segue acessível em commits antigos. Revise e rotacione qualquer credencial sensível exposta.
5. Telefone, mapa e horários foram preservados do projeto anterior e devem ser confirmados com a empresa.
