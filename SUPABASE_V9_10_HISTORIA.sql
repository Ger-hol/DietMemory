begin;
alter table public.ceny_zakupow add column if not exists sklep text not null default '';
alter table public.ceny_zakupow add column if not exists zakup_id uuid;
create table if not exists public.historia_cen (
 id uuid primary key,
 produkt_id bigint references public.produkty(id) on delete set null,
 nazwa_produktu text not null,
 producent text,
 sklep text not null check(length(trim(sklep))>0),
 gramy_opakowania double precision not null check(gramy_opakowania>0),
 cena_opakowania double precision not null check(cena_opakowania>0),
 cena_kg double precision not null check(cena_kg>0),
 data_zakupu timestamptz not null default now()
);
create index if not exists historia_cen_produkt_data on public.historia_cen(produkt_id,data_zakupu desc);
alter table public.historia_cen enable row level security;
revoke all on public.historia_cen from anon,authenticated;
grant select on public.historia_cen to authenticated;
drop policy if exists historia_cen_odczyt on public.historia_cen;
create policy historia_cen_odczyt on public.historia_cen for select to authenticated using(true);
create or replace function public.dm_prepare_purchase() returns trigger
language plpgsql set search_path='' as $$
begin
 new.sklep := trim(coalesce(new.sklep,''));
 if new.status='KUPIONE' then
  if new.gramy_opakowania is null or new.gramy_opakowania<=0 or new.cena_opakowania is null or new.cena_opakowania<=0 or new.sklep='' then
   raise exception 'Wpisz sklep, dodatnia gramature i cene przed oznaczeniem KUPIONE';
  end if;
  if new.gramy_opakowania::text in ('NaN','Infinity','-Infinity') or new.cena_opakowania::text in ('NaN','Infinity','-Infinity') then
   raise exception 'Nieprawidlowe dane liczbowe';
  end if;
  new.cena_kg:=new.cena_opakowania/new.gramy_opakowania*1000;
  if TG_OP='INSERT' then new.zakup_id:=gen_random_uuid();
  elsif old.status is distinct from 'KUPIONE' or old.zakup_id is null then new.zakup_id:=gen_random_uuid();
  else new.zakup_id:=old.zakup_id;
  end if;
 end if;
 return new;
end; $$;
create or replace function public.dm_record_purchase() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.status='KUPIONE' then
  insert into public.historia_cen(id,produkt_id,nazwa_produktu,producent,sklep,gramy_opakowania,cena_opakowania,cena_kg)
  select new.zakup_id,p.id,p.nazwa,p.producent,new.sklep,new.gramy_opakowania,new.cena_opakowania,new.cena_kg
  from public.produkty p where p.id=new.produkt_id
  on conflict(id) do update set sklep=excluded.sklep,gramy_opakowania=excluded.gramy_opakowania,cena_opakowania=excluded.cena_opakowania,cena_kg=excluded.cena_kg;
 end if;
 return new;
end; $$;
revoke all on function public.dm_prepare_purchase() from public,anon,authenticated;
revoke all on function public.dm_record_purchase() from public,anon,authenticated;
drop trigger if exists dm_purchase_prepare on public.ceny_zakupow;
create trigger dm_purchase_prepare before insert or update on public.ceny_zakupow for each row execute function public.dm_prepare_purchase();
drop trigger if exists dm_purchase_history on public.ceny_zakupow;
create trigger dm_purchase_history after insert or update on public.ceny_zakupow for each row execute function public.dm_record_purchase();
commit;
