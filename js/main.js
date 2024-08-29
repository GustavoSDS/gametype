import { getRandomParagraph } from "./data.js";

const $TIME = document.getElementById("time");
const $PARAGRAPH = document.getElementById("paragraph");
const $INPUT = document.getElementById("input");
const $TYPEWRITER = document.getElementById("typewriter");
const $RESULTS = document.getElementById("results");
const $WPM = $RESULTS.querySelector("#wpm");
const $ACCURACY = $RESULTS.querySelector("#accuracy");
const $WORDS_CORRECT = $RESULTS.querySelector("#words-correct");
const $RESET = $RESULTS.querySelector("#reset");
const $START = document.getElementById("start");
const $INFO = document.querySelector(".info");


// variables globales
const INITIAL_TIME = 60;
let currentTime = INITIAL_TIME;

initTypeWriter();
initEvents();

function initEvents() {
    $START.addEventListener("click", startGame);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            startGame();
        }
    });

    $INPUT.addEventListener("keydown", onKeyDown);
    $INPUT.addEventListener('keyup', onKeyUp);
}

function initTypeWriter() {
    $TIME.innerText = currentTime;
    const paragraph = getRandomParagraph();
    let paragraphElement = paragraph.split(" ").map((word) => {
        const letters = word.split("");

        return `<g-word>
            ${letters.map((letter) => {
            return `<g-letter>${letter}</g-letter>`;
        }).join("")}
        </g-word>`;
    }).join("");
    $PARAGRAPH.innerHTML = paragraphElement;
    const $FIRST_WORD = $PARAGRAPH.querySelector("g-word");
    $FIRST_WORD.classList.add("active");
    $FIRST_WORD.querySelector("g-letter").classList.add("active");
}

function startGame() {
    $INPUT.focus();
    $START.style.display = "none";
    $INFO.style.display = "none";

    const interval = setInterval(() => {
        currentTime--;
        $TIME.innerText = currentTime;
        if (currentTime === 0) {
            $INPUT.disabled = true;
            currentTime = INITIAL_TIME;
            clearInterval(interval);
            gameOver();
        }
    }, 1000);
}

function gameOver() {
    $TYPEWRITER.style.display = "none";
    $RESULTS.style.display = "flex";

    const $CORRECT_LETTERS = $PARAGRAPH.querySelectorAll("g-letter.correct").length;
    const CORRECT_WORDS = $PARAGRAPH.querySelectorAll("g-word.correct").length;

    const totalLetters = $PARAGRAPH.querySelectorAll("g-letter").length;
    const accuracy = Math.round(($CORRECT_LETTERS / totalLetters) * 100);
    const wpm = Math.round($CORRECT_LETTERS / 5);

    $WPM.innerText = wpm + " letters per minute";
    $ACCURACY.innerText = accuracy + "%";
    $WORDS_CORRECT.innerText = CORRECT_WORDS;

    $RESET.addEventListener("click", () => {
        location.reload();
    });
}

function onKeyUp() {
    if ($INPUT.value === " ") {
        return;
    }
    const $CURRENT_WORD = $PARAGRAPH.querySelector("g-word.active");
    const $CURRENT_LETTER = $CURRENT_WORD.querySelector("g-letter.active");
    const currentWord = $CURRENT_WORD.innerText.trim();

    $INPUT.maxLength = currentWord.length;

    const $ALL_LETTERS = $CURRENT_WORD.querySelectorAll("g-letter");
    $ALL_LETTERS.forEach(($LETTER) => $LETTER.classList.remove("correct", "incorrect"));

    $INPUT.value.split("").forEach((char, index) => {
        const $LETTER = $ALL_LETTERS[index];
        const letterCheck = currentWord[index];
        console.log(letterCheck);

        const isCorrect = char === letterCheck;
        $LETTER.classList.toggle("correct", isCorrect);
        $LETTER.classList.toggle("incorrect", !isCorrect);
        const $WORD = $LETTER.closest("g-word");
        $WORD.classList.toggle("incorrect", !isCorrect);

    });

    $CURRENT_LETTER.classList.remove("active", "is-last");
    const inputLength = $INPUT.value.length;
    const $nextLetter = $ALL_LETTERS[inputLength];

    if ($nextLetter) {
        $nextLetter.classList.add("active");
    } else {
        $CURRENT_LETTER.classList.add("active", "is-last");

        // TODO: check if the paragraph is completed (gameover)
    }

}

function onKeyDown(event) {
    const $CURRENT_WORD = $PARAGRAPH.querySelector("g-word.active");
    const $CURRENT_LETTER = $CURRENT_WORD.querySelector("g-letter.active");

    if (event.key === " ") {
        event.preventDefault();

        const $NEXT_WORD = $CURRENT_WORD.nextElementSibling;
        const $NEXT_LETTER = $NEXT_WORD.querySelector("g-letter");

        $CURRENT_LETTER.classList.remove("active", "incorrect");
        $CURRENT_WORD.classList.remove("active");

        $NEXT_LETTER.classList.add("active");
        $NEXT_WORD.classList.add("active");

        $INPUT.value = "";

        const hasMissedLetters = $CURRENT_WORD.querySelectorAll("g-letter:not(.correct)").length > 0;

        const className = hasMissedLetters ? "incorrect" : "correct";
        $CURRENT_WORD.classList.add(className);

        return;
    } else if (event.key === "Backspace") {
        event.preventDefault();

        const $PREV_WORD = $CURRENT_WORD.previousElementSibling;
        const $PREV_LETTER = $PREV_WORD.querySelector("g-letter");

        if (!$PREV_LETTER && !$PREV_WORD) {
            event.preventDefault();
            return;
        }

        if ($PREV_WORD.classList.contains("correct")) {
            return;
        } else {
            event.preventDefault();
            $CURRENT_LETTER.classList.remove("active", "incorrect");
            $CURRENT_WORD.classList.remove("active");

            $PREV_LETTER.classList.add("active");
            $PREV_WORD.classList.add("active");

            $INPUT.value = "";
        }
    }
}