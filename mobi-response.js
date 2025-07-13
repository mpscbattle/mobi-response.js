let current = 0,
  selectedAnswers = [],
  quizLocked = [],
  correctCount = 0;

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

// Footer Stats elements
const solvedCountElement = document.getElementById("solvedCount");
const totalQuestionsCountElement = document.getElementById("totalQuestionsCount");
const totalMarksCountElement = document.getElementById("totalMarksCount");


const questionElements = document.querySelectorAll(".question-data");
const questions = [];

questionElements.forEach((qEl) => {
  const q = qEl.querySelector(".q").innerText;
  const opts = Array.from(qEl.querySelectorAll(".opt")).map(el => el.innerText);
  const correctIndex = parseInt(qEl.getAttribute("data-answer"));
  // Get explanation if exists
  const explanationEl = qEl.querySelector(".explanation");
  const explanation = explanationEl ? explanationEl.innerHTML : ''; // Get innerHTML for rich text if any
  questions.push({ question: q, options: opts, answer: correctIndex, explanation: explanation });
});

document.getElementById("questionBank").style.display = "none";

// Initialize selectedAnswers and quizLocked arrays
selectedAnswers = new Array(questions.length).fill(undefined);
quizLocked = new Array(questions.length).fill(false);

function showQuestion(index) {
  const q = questions[index];
  let html = `<div class='question'>${q.question}</div><div class='options'>`;
  q.options.forEach((opt, i) => {
    let cls = "option";
    if (selectedAnswers[index] === i && !quizLocked[index]) {
      cls += " selected";
    }
    html += `<div class='${cls}' onclick='selectAnswer(${index}, ${i})'>${opt}</div>`;
  });
  html += `</div>`;
  quizDiv.innerHTML = html;

  if (questionNumberElement) {
    questionNumberElement.textContent = `${index + 1}/${questions.length}`;
  }

  updateFooterStats(); // Update footer stats whenever a question is shown
}

function selectAnswer(qIndex, aIndex) {
  if (quizLocked[qIndex]) return;
  selectedAnswers[qIndex] = aIndex;
  showQuestion(current); // Re-render current question to show selection
  updateFooterStats(); // Update footer stats after an answer is selected
}

function updateTimer() {
  let min = Math.floor(timer / 60);
  let sec = timer % 60;
  timerDiv.textContent = `🕛 ${min}:${sec < 10 ? '0' + sec : sec}`;
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

  quizLocked = questions.map(() => true); // Lock all questions after submission
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

    let html = `<div class='analysis-question-box'>`; // Use the new class for individual box
    html += `<p><strong>${i + 1}/${questions.length}</strong> ${q.question}</p>`; // Question number and text

    q.options.forEach((opt, j) => {
      let cls = "option";
      if (j === q.answer) cls += " correct";
      else if (j === userAnswer) cls += " wrong";
      html += `<div class='${cls}'>${opt}</div>`;
    });

    html += `<div class='feedback ${feedbackClass}'>${feedback}</div>`;
    html += `<div style='margin-top:5px;'>👉 Correct Answer : <b>${q.options[q.answer]}</b></div>`;

    // Add explanation if available
    if (q.explanation) {
        html += `<div class='explanation-text' style='margin-top: 10px; padding: 10px; border: 1px dashed #ccc; border-radius: 5px; background-color: #f0f8ff;'>`
        html += `<strong>Explanation:</strong><br>${q.explanation}`;
        html += `</div>`;
    }

    html += `</div>`; // Close .analysis-question-box

    // *** हॉरिजॉन्टल लाइन यहाँ नहीं जोड़ी जाएगी ***
    // if (i < questions.length - 1) {
    //     html += `<hr class="analysis-separator">`;
    // }

    container.innerHTML += html;
  });
}

function updateFooterStats() {
    const totalQuestions = questions.length;
    const attemptedQuestions = selectedAnswers.filter(v => v !== undefined).length;
    const solvedQuestions = selectedAnswers.filter((v, i) => v !== undefined).length; // Same as attempted for now
    const totalMarks = questions.length; // Assuming 1 mark per question

    // Update the DOM elements
    solvedCountElement.querySelector('span').textContent = solvedQuestions;
    totalQuestionsCountElement.querySelector('span').textContent = totalQuestions;
    totalMarksCountElement.querySelector('span').textContent = totalMarks; // Display total possible marks
}


// Event Listeners
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
  }
  showQuestion(current); // Show the first question immediately after starting the test
  updateFooterStats(); // Initialize footer stats on start
};

// Initial setup
// Hide navigation and submit buttons until test starts
prevBtn.style.display = 'none';
nextBtn.style.display = 'none';
submitBtn.style.display = 'none';
resetBtn.style.display = 'none'; // Keep reset button hidden until results or user needs to try again
onlineTestBtn.style.display = 'none'; // Hide this as it's for visual only, not interactive in this flow

// Function to show/hide navigation and submit buttons based on test state
function updateQuizControlsVisibility() {
    if (timerStarted) {
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'block'; // Block to make it full width if no next/prev
        resetBtn.style.display = 'none'; // Only show after results
        onlineTestBtn.style.display = 'block'; // Show if test is active
        quizDiv.style.display = 'block'; // Ensure quiz content is visible
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        onlineTestBtn.style.display = 'none'; // Still hidden before test start
        quizDiv.innerHTML = ''; // Clear quiz content initially
    }
}

// Call initially
updateQuizControlsVisibility();
updateFooterStats(); // Initial update for footer stats (will show 0/0/0)

// Modify the logic to ensure quiz content is displayed only after clicking startBtn
// The showQuestion(current) call is now inside startBtn.onclick.
// Initially, quizDiv should be empty or show a placeholder.
// The quiz-box should show the start button.
