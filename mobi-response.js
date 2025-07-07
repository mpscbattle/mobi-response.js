let current = 0, selectedAnswers = [], quizLocked = [], correctCount = 0;
  let timer = 120;
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
  const startBtn = document.getElementById("startBtn");

  function showQuestion(index) {
    const q = questions[index];
    let html = `<div class='question'>Q${index + 1}: ${q.question}</div><div class='options'>`;
    q.options.forEach((opt, i) => {
      let cls = "option";
      if (selectedAnswers[index] === i && !quizLocked[index]) cls += " selected";
      html += `<div class='${cls}' onclick='selectAnswer(${index}, ${i})'>${opt}</div>`;
    });
    html += `</div>`;
    quizDiv.innerHTML = html;
  }

  function selectAnswer(qIndex, aIndex) {
    if (quizLocked[qIndex]) return;
    selectedAnswers[qIndex] = aIndex;
    showQuestion(current);
  }

  function updateTimer() {
    let min = Math.floor(timer / 60);
    let sec = timer % 60;
    timerDiv.textContent = `Time Left: ${min}:${sec < 10 ? '0' + sec : sec}`;
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
        <div><b>Q${i + 1}:</b> ${q.question}</div>`;
      q.options.forEach((opt, j) => {
        let cls = "option";
        if (j === q.answer) cls += " correct";
        else if (j === userAnswer) cls += " wrong";
        html += `<div class='${cls}'>${opt}</div>`;
      });
      html += `<div class='feedback ${feedbackClass}'>${feedback}</div>`;
      html += `<div style='margin-top:5px;'>👉 Correct Answer : <b>${q.options[q.answer]}</b></div>`;
      html += `</div>`;
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
      startBtn.style.display = 'none';
    }
  };

  showQuestion(current);
