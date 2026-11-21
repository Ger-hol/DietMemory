-- DietMemory v9.6: usunięcie II Śniadania z układu dnia.
-- Zachowujemy kolumnę drugie_sniadanie_procent dla zgodności, lecz ustawiamy ją na 0.
-- Automatycznie zmieniamy wyłącznie stary domyślny podział 25/10/35/10/20 na 30/0/40/10/20.
update public.cele
set sniadanie_procent = 30,
    drugie_sniadanie_procent = 0,
    obiad_procent = 40,
    podwieczorek_procent = 10,
    kolacja_procent = 20
where sniadanie_procent = 25
  and drugie_sniadanie_procent = 10
  and obiad_procent = 35
  and podwieczorek_procent = 10
  and kolacja_procent = 20;

-- Dla innych istniejących ustawień tylko zerujemy II Śniadanie; użytkownik może następnie ręcznie ustawić łącznie 100% w Celach.
update public.cele
set drugie_sniadanie_procent = 0
where drugie_sniadanie_procent <> 0;
