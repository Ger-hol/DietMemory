const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const ekranLogowania = document.getElementById("ekran-logowania");
const aplikacjaDietMemory = document.getElementById("aplikacja-dietmemory");

const formularzLogowania = document.getElementById("formularz-logowania");
const emailLogowania = document.getElementById("login-email");
const hasloLogowania = document.getElementById("login-haslo");
const komunikatLogowania = document.getElementById("login-komunikat");

const zalogowanyEmail = document.getElementById("zalogowany-email");
const przyciskWyloguj = document.getElementById("przycisk-wyloguj");

async function pokazStanLogowania() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {

        ekranLogowania.classList.add("hide");
        aplikacjaDietMemory.classList.remove("hide");

        zalogowanyEmail.textContent =
            session.user.email || "Zalogowany użytkownik";

    } else {

        ekranLogowania.classList.remove("hide");
        aplikacjaDietMemory.classList.add("hide");

    }
}

formularzLogowania.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        komunikatLogowania.textContent =
            "Logowanie...";

        const email =
            emailLogowania.value.trim();

        const haslo =
            hasloLogowania.value;

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: haslo
            });

        if (error) {

            komunikatLogowania.textContent =
                "Nie udało się zalogować: " +
                error.message;

            return;
        }

        komunikatLogowania.textContent = "";

        hasloLogowania.value = "";

        await pokazStanLogowania();
    }
);

przyciskWyloguj.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        await pokazStanLogowania();
    }
);

supabaseClient.auth.onAuthStateChange(
    function () {
        pokazStanLogowania();
    }
);

pokazStanLogowania();