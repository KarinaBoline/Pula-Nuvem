# Pula Nuvem Festas

Site de aluguel de brinquedos para festas infantis: catálogo, disponibilidade por data, carrinho com frete, formulário da festa e pagamento por Pix ou cartão.

## Status

Modo demonstração: as reservas ainda não são salvas em banco de dados. O próximo passo é conectar o Supabase.

## Configuração

No começo do script em `index.html`, no bloco `CONFIG`:

- `pixChave`: sua chave Pix
- `pixNome`: nome da empresa como aparece no banco
- `linkCartao`: link de pagamento do Mercado Pago, PagSeguro ou InfinitePay

## Gestão

A tela de gestão fica em `gestao.html` (ou no site com `#painel` no final do endereço). Ela tem:

- **Operação**: lista de reservas com cliente, telefone, endereço, brinquedos, total, valor pago e pendente; registro de pagamentos, edição, cancelamento.
- **Calendário**: dias livres, parcialmente alugados e lotados, com as festas de cada dia.
- **Executivo**: faturamento, recebido, a receber, ticket médio e ocupação por mês e por ano, gráfico mensal, ranking de brinquedos e cidades.

## Banco de dados (Supabase)

O site e a gestão usam o mesmo banco de dados. As reservas feitas pelos clientes aparecem na gestão, e o que a gestão cadastra ou cancela muda a disponibilidade no site.

1. Crie um projeto grátis em supabase.com.
2. Em **SQL Editor → New query**, cole o arquivo `supabase.sql`, troque `EMAIL_DA_DONA` pelo seu e-mail e clique em **Run**.
3. Em **Authentication → Users → Add user**, crie o seu usuário com o mesmo e-mail e uma senha.
4. Em **Authentication → Sign In / Providers**, desligue **Allow new users to sign up**.
5. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public** e cole em `config.js`.

Enquanto `config.js` estiver vazio, o site funciona em modo demonstração e a gestão guarda os dados só no navegador.

## Publicar no GitHub Pages

1. Envie `index.html` e este `README.md` para o repositório.
2. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. Em um ou dois minutos o site fica no ar em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
