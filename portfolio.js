let words = document.querySelectorAll(".word");
words.forEach((word) => {
    let letters = word.textContent.split("");
    word.textContent="";
    letters.forEach((letter)=>{
        let span = document.createElement("span");
        span.textContent = letter;
        span.className = "letter";
        word.append(span);
    });
});

let currentWordIndex =0;
let maxWordIndex = words.length -1;
words[currentWordIndex].style.opacity="1";

let changeText = ()=>{
    let currentWord =words[currentWordIndex];
    let nextWord = currentWordIndex === maxWordIndex ? words[0] : words[currentWordIndex + 1];

    Array.from(currentWord.children).forEach((letter,i)=>{
        setTimeout(()=>{
            letter.className = "letter out";
        },i*80);
    });
    nextWord.style.opacity = "1";
    Array.from(nextWord.children).forEach((letter,i)=>{
        letter.className = "letter behind";
        setTimeout(()=>{
            letter.className ="letter in";
        },340 + i * 80);
    });
    currentWordIndex = currentWordIndex===maxWordIndex ? 0 : currentWordIndex+1;
};
changeText();
setInterval(changeText,3000)

// Smooth reveal for team cards
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.team-card');

  cards.forEach(c => c.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '60px 0px', threshold: 0.1 });

  cards.forEach(card => io.observe(card));
});

// Project JS
