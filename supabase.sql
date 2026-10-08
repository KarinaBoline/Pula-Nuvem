-- Banco de dados da Pula Nuvem Festas
-- Como usar: no Supabase, abra "SQL Editor", clique em "New query",
-- cole TODO este arquivo, troque EMAIL_DA_DONA pelo seu e-mail de login
-- (aparece 1 vez, na linha marcada) e clique em "Run".

create table if not exists public.reservas (
  id                  text primary key,
  data                date not null,
  horario             text,
  cliente             text not null,
  telefone            text not null,
  endereco            text,
  cidade              text,
  aniversariante      text default '',
  itens               text[] not null,
  valor_brinquedos    numeric not null default 0,
  frete               numeric not null default 0,
  frete_combinar      boolean not null default false,
  total               numeric not null default 0,
  pagamentos          jsonb not null default '[]'::jsonb,
  status              text not null default 'reservado' check (status in ('reservado','realizado','cancelado')),
  pagamento_informado boolean not null default false,
  origem              text not null default 'gestao' check (origem in ('site','gestao')),
  obs                 text default '',
  criado_em           timestamptz not null default now()
);

create index if not exists reservas_data_idx on public.reservas (data);

alter table public.reservas enable row level security;

-- A dona (logada com o e-mail abaixo) vê e altera tudo
drop policy if exists "dona_tudo" on public.reservas;
create policy "dona_tudo" on public.reservas
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'EMAIL_DA_DONA')          -- <== TROQUE AQUI
  with check ((auth.jwt() ->> 'email') = 'EMAIL_DA_DONA');    -- <== E AQUI

-- O cliente do site só consegue CRIAR uma reserva nova, sem pagamentos
drop policy if exists "site_cria" on public.reservas;
create policy "site_cria" on public.reservas
  for insert to anon
  with check (origem = 'site' and status = 'reservado' and pagamentos = '[]'::jsonb and pagamento_informado = false);

-- Disponibilidade para o site, sem expor dados dos clientes
create or replace function public.ocupacao(de date, ate date)
returns table (data date, itens text[])
language sql security definer set search_path = public as $$
  select r.data, r.itens from public.reservas r
  where r.status <> 'cancelado' and r.data between de and ate
$$;
grant execute on function public.ocupacao(date, date) to anon, authenticated;

-- O cliente avisa que fez o Pix (só marca um aviso, não altera valores)
create or replace function public.informar_pagamento(reserva_id text)
returns void
language sql security definer set search_path = public as $$
  update public.reservas set pagamento_informado = true
  where id = reserva_id and origem = 'site'
$$;
grant execute on function public.informar_pagamento(text) to anon;

-- Impede alugar o mesmo brinquedo duas vezes na mesma data
create or replace function public.checa_conflito()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'cancelado' and exists (
    select 1 from public.reservas r
    where r.data = new.data and r.id <> new.id and r.status <> 'cancelado' and r.itens && new.itens
  ) then
    raise exception 'BRINQUEDO_OCUPADO';
  end if;
  return new;
end $$;

drop trigger if exists reservas_conflito on public.reservas;
create trigger reservas_conflito
  before insert or update on public.reservas
  for each row execute function public.checa_conflito();
