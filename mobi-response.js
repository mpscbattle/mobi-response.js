let current = 0, selectedAnswers = [], quizLocked = [], correctCount = 0;
let timer = 1200; // Increased timer to 20 minutes (20 * 60 seconds)
let timerStarted = false;
let timerInterval;

const quizDiv = document.getElementById("quiz");
const timerDiv = document.getElementById("timer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const reportCard = document.getElementById("reportCard");
const analysisCard = document.getElementById("analysisCard");
const viewAnalysisBtn = document.getElementById("viewAnalysisBtn");
const startBtn = document.getElementById("startBtn"); // This is the Start Test button in the middle
const onlineTestBtn = document.getElementById("onlineTestBtn"); // This is the Online Test Series button on top right
const questionNumberElement = document.getElementById("questionNumber"); // Get the question number display element

const questionElements = document.querySelectorAll(".question-data");
const questions = [];

questionElements.forEach((qEl) => {
  const q = qEl.querySelector(".q").innerText;
  const opts = Array.from(qEl.querySelectorAll(".opt")).map(el => el.innerText);
  const correctIndex = parseInt(qEl.getAttribute("data-answer"));
  questions.push({ question: q, options: opts, answer: correctIndex });
});
document.getElementById("questionBank").style.display = "none";

function showQuestion(index) {
  const q = questions[index];
  let html = `<div class='question'>${q.question}</div><div class='options'>`; // Removed Q${index + 1}: from here

  q.options.forEach((opt, i) => {
    let cls = "option";
    if (selectedAnswers[index] === i && !quizLocked[index]) {
      cls += " selected";
    }
    html += `<div class='${cls}' onclick='selectAnswer(${index}, ${i})'>${opt}</div>`;
  });
  html += `</div>`;
  quizDiv.innerHTML = html;

  // Update question number text explicitly in the circular red button
  if (questionNumberElement) {
    questionNumberElement.textContent = `${index + 1}/${questions.length}`;
  }
}

function selectAnswer(qIndex, aIndex) {
  if (quizLocked[qIndex]) return;
  selectedAnswers[qIndex] = aIndex;
  showQuestion(current);
}

function updateTimer() {
  let min = Math.floor(timer / 60);
  let sec = timer % 60;
  timerDiv.textContent = `🕛 ${min}:${sec < 10 ? '0' + sec : sec}`; // Changed "Time Left: " to "🕛 "
  timer--;
  if (timer < 0) {
    clearInterval(timerInterval);
    submitResults();
  }
}

function submitResults() {
  clearInterval(timerInterval);
  quizDiv.innerHTML = "";
  reportCard.style.display = 'block';

  let attempted = selectedAnswers.filter(v => v !== undefined).length;
  correctCount = selectedAnswers.filter((v, i) => v === questions[i].answer).length;

  document.getElementById("total").textContent = questions.length;
  document.getElementById("attempted").textContent = attempted;
  document.getElementById("correct").textContent = correctCount;
  document.getElementById("wrong").textContent = attempted - correctCount;
  document.getElementById("score").textContent = correctCount;
  document.getElementById("totalScore").textContent = questions.length;

  const percent = ((correctCount / questions.length) * 100).toFixed(2);
  document.getElementById("percentage").textContent = percent;
  const msg = percent >= 80 ? "Excellent Work" : percent >= 50 ? "Good Job" : "Keep Practicing";
  document.getElementById("resultMessage").textContent = msg;

  quizLocked = questions.map(() => true);
}

function showAnalysis() {
  analysisCard.style.display = 'block';
  reportCard.style.display = 'none';
  const container = document.getElementById("analysisContent");
  container.innerHTML = "";
  questions.forEach((q, i) => {
    const userAnswer = selectedAnswers[i];
    let feedback = "You did not attempt this question ";
    let feedbackClass = "not-attempted-feedback";

    if (userAnswer !== undefined) {
      const isCorrect = userAnswer === q.answer;
      feedback = isCorrect ? "Your answer is correct " : "Your answer is wrong ";
      feedbackClass = isCorrect ? "correct-feedback" : "wrong-feedback";
    }

    let html = `<div class='analysis-box'>
  <div class="question-number">${i + 1}/${questions.length}</div> <div><b>${q.question}</b></div>`; // Removed Q${i + 1}: from here
    q.options.forEach((opt, j) => {
      let cls = "option";
      if (j === q.answer) cls += " correct";
      else if (j === userAnswer) cls += " wrong";
      html += `<div class='${cls}'>${opt}</div>`;
    });
    html += `<div class='feedback ${feedbackClass}'>${feedback}</div>`;
    
    container.innerHTML += html;
  });
}

prevBtn.onclick = () => { if (current > 0) { current--; showQuestion(current); } };
nextBtn.onclick = () => { if (current < questions.length - 1) { current++; showQuestion(current); } };
submitBtn.onclick = submitResults;
viewAnalysisBtn.onclick = showAnalysis;
resetBtn.onclick = () => location.reload();
startBtn.onclick = () => {
  if (!timerStarted) {
    timerInterval = setInterval(updateTimer, 1000);
    timerStarted = true;
    startBtn.style.display = 'none'; // Hide Start Test button after it's clicked
    // onlineTestBtn does not change visibility here, it remains visible
  }
};

showQuestion(current);
