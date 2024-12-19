let rubrics = {};

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

    // Question 1
    const q1Value = document.getElementById("q1").value || "";
    const q1Points = longAnswer(q1Value, rubrics.q1 || []);
    accumulatedPoints += q1Points;
    totalPoints += Math.max(...(rubrics.q1 || []).map(r => r[0]));
    questionResults.innerHTML += generateRubricHTML(1, rubrics.q1 || [], q1Points);

    // Question 2
    const q2Value = document.getElementById("q2").value || "";
    const q2Points = longAnswer(q2Value, rubrics.q2 || []);
    accumulatedPoints += q2Points;
    totalPoints += Math.max(...(rubrics.q2 || []).map(r => r[0]));
    questionResults.innerHTML += generateRubricHTML(2, rubrics.q2 || [], q2Points);

    // Question 3 (Multiple Choice)
    const q3Value = document.querySelector('input[name="q3"]:checked');
    const q3Points = multipleChoice(q3Value, rubrics.q3 || []);
    accumulatedPoints += q3Points;
    totalPoints += Math.max(...(rubrics.q3 || []).map(r => r[0]));
    questionResults.innerHTML += generateRubricHTML(3, rubrics.q3 || [], q3Points);

    // Update Total Score
    document.getElementById("points").innerText = accumulatedPoints;
    document.getElementById("totalPoints").innerText = totalPoints;

    document.getElementById("results").style.display = "block";
}