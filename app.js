console.log("DietMemory Produkty v1.1");

const ekranStart = document.getElementById("ekran-start");
const ekranProdukty = document.getElementById("ekran-produkty");

const przyciskProdukty = document.getElementById("przycisk-produkty");
const przyciskPowrot = document.getElementById("przycisk-powrot");

const formularz = document.getElementById("formularz-produktu");

const poleNazwa = document.getElementById("nazwa");
const poleProducent = document.getElementById("producent");
const poleEAN = document.getElementById("ean");
const poleOpakowanie = document.getElementById("opakowanie");
const poleKcal = document.getElementById("kcal");
const poleBialko = document.getElementById("bialko");
const poleTluszcz = document.getElementById("tluszcz");
const poleWeglowodany = document.getElementById("weglowodany");

const podpowiedzi = document.getElementById("podpowiedzi");
const komunikat = document.getElementById("komunikat");
const komunikatEAN = document.getElementById("komunikat-ean");

const poleSzukaj = document.getElementById("szukaj");
const listaProduktow = document.getElementById("lista-produktow");
const liczbaProduktow = document.getElementById("liczba-produktow");
const brakProduktow = document.getElementById("brak-produktow");

let produkty = [];

const daneZapisane = localStorage.getItem("dietmemory_produkty");

if (daneZapisane) {
    try {
        produkty = JSON.parse(daneZapisane);
    } catch {
        produkty = [];
    }
}

function normalizuj(tekst) {
    return String(tekst || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function pobierzLiczbe(pole) {
    const wartosc = pole.value.trim();

    if (wartosc === "") {
        return 0;
    }

    const liczba = Number(wartosc);

    if (Number.isNaN(liczba)) {
        return 0;
    }

    return liczba;
}

function formatujLiczbe(wartosc) {
    return Number(wartosc || 0).toLocaleString("pl-PL", {
        maximumFractionDigits: 1
    });
}

function zapiszBaze() {
    localStorage.setItem(
        "dietmemory_produkty",
        JSON.stringify(produkty)
    );
}

function pokazStart() {
    ekranProdukty.classList.add("ukryty");
    ekranStart.classList.remove("ukryty");
}

function pokazProdukty() {
    ekranStart.classList.add("ukryty");
    ekranProdukty.classList.remove("ukryty");

    wyswietlProdukty();

    setTimeout(function () {
        poleNazwa.focus();
    }, 50);
}

function znajdzPodobneProdukty(tekst) {
    const zapytanie = normalizuj(tekst);

    if (zapytanie.length < 2) {
        return [];
    }

    return produkty.filter(function (produkt) {
        const nazwa = normalizuj(produkt.nazwa);
        const producent = normalizuj(produkt.producent);

        return (
            nazwa.includes(zapytanie) ||
            producent.includes(zapytanie)
        );
    });
}

function pokazPodpowiedzi() {
    const wyniki = znajdzPodobneProdukty(
        poleNazwa.value
    );

    podpowiedzi.innerHTML = "";

    if (wyniki.length === 0) {
        podpowiedzi.classList.add("ukryty");
        return;
    }

    wyniki.slice(0, 8).forEach(function (produkt) {
        const pozycja = document.createElement("div");
        pozycja.className = "podpowiedz";

        const nazwa = document.createElement("div");
        nazwa.className = "podpowiedz-nazwa";
        nazwa.textContent = produkt.nazwa;

        const info = document.createElement("div");
        info.className = "podpowiedz-info";

        let opis = produkt.producent || "Brak producenta";

        if (produkt.opakowanie > 0) {
            opis += " | " + formatujLiczbe(produkt.opakowanie) + " g";
        }

        if (produkt.ean) {
            opis += " | EAN " + produkt.ean;
        }

        info.textContent = opis;

        pozycja.appendChild(nazwa);
        pozycja.appendChild(info);

        pozycja.addEventListener("click", function () {
            pokazIstniejacyProdukt(produkt);
        });

        podpowiedzi.appendChild(pozycja);
    });

    podpowiedzi.classList.remove("ukryty");
}

function pokazIstniejacyProdukt(produkt) {
    poleNazwa.value = produkt.nazwa || "";
    poleProducent.value = produkt.producent || "";
    poleEAN.value = produkt.ean || "";

    if (produkt.opakowanie > 0) {
        poleOpakowanie.value = produkt.opakowanie;
    } else {
        poleOpakowanie.value = "";
    }

    if (produkt.kcal > 0) {
        poleKcal.value = produkt.kcal;
    } else {
        poleKcal.value = "";
    }

    if (produkt.bialko > 0) {
        poleBialko.value = produkt.bialko;
    } else {
        poleBialko.value = "";
    }

    if (produkt.tluszcz > 0) {
        poleTluszcz.value = produkt.tluszcz;
    } else {
        poleTluszcz.value = "";
    }

    if (produkt.weglowodany > 0) {
        poleWeglowodany.value = produkt.weglowodany;
    } else {
        poleWeglowodany.value = "";
    }

    podpowiedzi.classList.add("ukryty");

    komunikat.textContent =
        "Ten produkt jest już zapisany w bazie.";
}

function sprawdzEAN() {
    const ean = poleEAN.value.trim();

    komunikatEAN.textContent = "";

    if (ean === "") {
        return;
    }

    const produkt = produkty.find(function (element) {
        return element.ean === ean;
    });

    if (produkt) {
        komunikatEAN.textContent =
            "EAN już istnieje: " + produkt.nazwa;
    }
}

function dodajProdukt(event) {
    event.preventDefault();

    komunikat.textContent = "";

    const nazwa = poleNazwa.value.trim();
    const producent = poleProducent.value.trim();
    const ean = poleEAN.value.trim();

    if (nazwa === "") {
        komunikat.textContent =
            "Podaj nazwę produktu.";

        poleNazwa.focus();

        return;
    }

    if (ean !== "") {
        const znalezionyEAN = produkty.find(function (produkt) {
            return produkt.ean === ean;
        });

        if (znalezionyEAN) {
            komunikat.textContent =
                "Nie zapisano. Ten EAN należy już do produktu: " +
                znalezionyEAN.nazwa;

            return;
        }
    }

    const takiSamProdukt = produkty.find(function (produkt) {
        return (
            normalizuj(produkt.nazwa) === normalizuj(nazwa) &&
            normalizuj(produkt.producent) === normalizuj(producent)
        );
    });

    if (takiSamProdukt) {
        const dodacMimoTo = confirm(
            "Podobny produkt już istnieje:\n\n" +
            takiSamProdukt.nazwa +
            "\n" +
            (takiSamProdukt.producent || "Brak producenta") +
            "\n\nCzy mimo to dodać nowy rekord?"
        );

        if (!dodacMimoTo) {
            komunikat.textContent =
                "Produkt nie został dodany.";

            return;
        }
    }

    const nowyProdukt = {
        id: Date.now(),
        nazwa: nazwa,
        producent: producent,
        ean: ean,
        opakowanie: pobierzLiczbe(poleOpakowanie),
        kcal: pobierzLiczbe(poleKcal),
        bialko: pobierzLiczbe(poleBialko),
        tluszcz: pobierzLiczbe(poleTluszcz),
        weglowodany: pobierzLiczbe(poleWeglowodany)
    };

    produkty.push(nowyProdukt);

    zapiszBaze();

    formularz.reset();

    podpowiedzi.classList.add("ukryty");
    komunikatEAN.textContent = "";

    komunikat.textContent =
        "Zapisano produkt: " + nowyProdukt.nazwa;

    poleSzukaj.value = "";

    wyswietlProdukty();

    poleNazwa.focus();
}

function filtrowaneProdukty() {
    const szukaj = normalizuj(poleSzukaj.value);

    if (szukaj === "") {
        return produkty;
    }

    return produkty.filter(function (produkt) {
        const tekst = normalizuj(
            produkt.nazwa +
            " " +
            produkt.producent +
            " " +
            produkt.ean
        );

        return tekst.includes(szukaj);
    });
}

function dodajKomorke(wiersz, tekst) {
    const komorka = document.createElement("td");

    komorka.textContent = tekst;

    wiersz.appendChild(komorka);
}

function wyswietlProdukty() {
    listaProduktow.innerHTML = "";

    const widoczne = filtrowaneProdukty();

    if (produkty.length === 1) {
        liczbaProduktow.textContent = "1 produkt";
    } else {
        liczbaProduktow.textContent =
            produkty.length + " produktów";
    }

    if (widoczne.length === 0) {
        brakProduktow.classList.remove("ukryty");

        if (produkty.length === 0) {
            brakProduktow.textContent =
                "Nie dodano jeszcze produktów.";
        } else {
            brakProduktow.textContent =
                "Nie znaleziono pasujących produktów.";
        }

        return;
    }

    brakProduktow.classList.add("ukryty");

    widoczne.forEach(function (produkt) {
        const wiersz = document.createElement("tr");

        dodajKomorke(
            wiersz,
            produkt.nazwa
        );

        dodajKomorke(
            wiersz,
            produkt.producent || "-"
        );

        dodajKomorke(
            wiersz,
            produkt.ean || "-"
        );

        if (produkt.opakowanie > 0) {
            dodajKomorke(
                wiersz,
                formatujLiczbe(produkt.opakowanie) + " g"
            );
        } else {
            dodajKomorke(wiersz, "-");
        }

        dodajKomorke(
            wiersz,
            formatujLiczbe(produkt.kcal)
        );

        dodajKomorke(
            wiersz,
            formatujLiczbe(produkt.bialko) + " g"
        );

        dodajKomorke(
            wiersz,
            formatujLiczbe(produkt.tluszcz) + " g"
        );

        dodajKomorke(
            wiersz,
            formatujLiczbe(produkt.weglowodany) + " g"
        );

        const akcja = document.createElement("td");

        const przyciskUsun = document.createElement("button");

        przyciskUsun.type = "button";
        przyciskUsun.className = "przycisk-usun";
        przyciskUsun.textContent = "Usuń";

        przyciskUsun.addEventListener("click", function () {
            usunProdukt(produkt.id);
        });

        akcja.appendChild(przyciskUsun);

        wiersz.appendChild(akcja);

        listaProduktow.appendChild(wiersz);
    });
}

function usunProdukt(id) {
    const produkt = produkty.find(function (element) {
        return element.id === id;
    });

    if (!produkt) {
        return;
    }

    const potwierdzenie = confirm(
        "Czy usunąć produkt:\n\n" +
        produkt.nazwa +
        "?"
    );

    if (!potwierdzenie) {
        return;
    }

    produkty = produkty.filter(function (element) {
        return element.id !== id;
    });

    zapiszBaze();

    wyswietlProdukty();

    komunikat.textContent =
        "Produkt został usunięty.";
}

przyciskProdukty.addEventListener(
    "click",
    pokazProdukty
);

przyciskPowrot.addEventListener(
    "click",
    pokazStart
);

formularz.addEventListener(
    "submit",
    dodajProdukt
);

poleNazwa.addEventListener(
    "input",
    pokazPodpowiedzi
);

poleEAN.addEventListener(
    "input",
    sprawdzEAN
);

poleSzukaj.addEventListener(
    "input",
    wyswietlProdukty
);

document.addEventListener("click", function (event) {
    const klikNazwa = poleNazwa.contains(event.target);
    const klikPodpowiedzi = podpowiedzi.contains(event.target);

    if (!klikNazwa && !klikPodpowiedzi) {
        podpowiedzi.classList.add("ukryty");
    }
});

wyswietlProdukty();

pokazStart();
if ("serviceWorker" in navigator) {

    window.addEventListener("load", function () {

        navigator.serviceWorker
            .register("./service-worker.js")
            .then(function (rejestracja) {

                console.log(
                    "Service Worker działa:",
                    rejestracja.scope
                );

            })
            .catch(function (blad) {

                console.error(
                    "Błąd Service Workera:",
                    blad
                );

            });

    });

}