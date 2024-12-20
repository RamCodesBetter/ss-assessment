let rubrics = {};

const questions = [
    { id: "q1", type: "longAnswer" },
    { id: "q2", type: "longAnswer" },
    { id: "q3", type: "multipleChoice" },
    { id: "q4", type: "longAnswer"},
    { id: "q5", type: "longAnswer"},
    { id: "q6", type: "longAnswer"}
];

// Fetch rubrics from JSON file
fetch("rubrics.json")
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log("Rubrics loaded:", data); // Debugging: Confirm JSON content
        rubrics = data;
    })
    .catch(error => console.error("Error loading rubrics:", error));

// Function to dynamically generate rubric HTML
function generateRubricHTML(question, rubricArray, selectedPoints) {
    let html = `<h3>Question ${question}:</h3>`;
    html += `<table>
                <thead>
                    <tr>
                        <th>Points</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>`;

    rubricArray.forEach(([points, description]) => {
        const highlightClass = points === selectedPoints ? 'highlight' : ''; // Apply highlight class
        html += `<tr class="${highlightClass}">
                    <td>${points}</td>
                    <td>${description}</td>
                 </tr>`;
    });

    html += `</tbody></table>`;
    return html;
}

// Function to calculate points for long-answer questions
function longAnswer(answerText, rubricArray) {
    const answerLength = answerText.trim().length;

    // Debug: Log answer length and rubric array
    console.log("Answer Length:", answerLength, "Rubric Array:", rubricArray);

    // Sort rubrics by descending threshold to check highest first
    const sortedRubrics = rubricArray.sort((a, b) => (b[2] || 0) - (a[2] || 0));

    for (let [points, description, threshold] of sortedRubrics) {
        if (threshold === undefined || answerLength >= threshold) {
            console.log(`Matched Threshold: ${threshold}, Points: ${points}`); // Debugging
            return points; // Return points for the matched threshold
        }
    }
    return 0; // Default to 0 points
}

// Function to calculate points for multiple-choice questions
function multipleChoice(selectedOption, rubricArray) {
    if (!selectedOption) return 0;
    for (let [points] of rubricArray) {
        if (parseInt(selectedOption.value) === points) return points;
    }
    return 0;
}

// Main submission handler
function submitAssessment() {
    let totalPoints = 0;
    let accumulatedPoints = 0;
    const questionResults = document.getElementById("questionResults");
    questionResults.innerHTML = ""; // Clear previous results

    // Debug: Confirm rubrics are available
    console.log("Current Rubrics:", rubrics);

    // Process each question dynamically
    questions.forEach((question, index) => {
        const questionNumber = index + 1;
        let points = 0;

        if (question.type === "longAnswer") {
            const value = document.getElementById(question.id).value || "";
            points = longAnswer(value, rubrics[question.id] || []);
        } else if (question.type === "multipleChoice") {
            // Automatically determine the selector based on the question ID
            const value = document.querySelector(`input[name="${question.id}"]:checked`);
            points = multipleChoice(value, rubrics[question.id] || []);
        }

        accumulatedPoints += points;
        totalPoints += Math.max(...(rubrics[question.id] || []).map(r => r[0]));
        questionResults.innerHTML += generateRubricHTML(questionNumber, rubrics[question.id] || [], points);
    });

    // Update Total Score
    document.getElementById("points").innerText = accumulatedPoints;
    document.getElementById("totalPoints").innerText = totalPoints;

    document.getElementById("results").style.display = "block";
}