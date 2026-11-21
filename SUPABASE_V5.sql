alter table public.posilki add column if not exists kategorie text[] not null default '{}';
update public.posilki set kategorie=array[kategoria] where (kategorie is null or cardinality(kategorie)=0) and kategoria is not null;
