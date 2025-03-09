import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "dbms-gate-tracker.firebaseapp.com",
    projectId: "dbms-gate-tracker",
    storageBucket: "dbms-gate-tracker.appspot.com",
    messagingSenderId: "134278378621",
    appId: "1:134278378621:web:48f0343be16cd10da82d14",
    measurementId: "G-GLC41YX74B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const studyTable = document.getElementById('studyTable').getElementsByTagName('tbody')[0];
const progressBar = document.querySelector('.progress-bar');
const progressText = document.querySelector('.progress-text');

// Function to Fetch Topics from Firestore
async function fetchTopics() {
    const topicsCollection = collection(db, "topics");
    const querySnapshot = await getDocs(topicsCollection);

    let topicsData = [];
    querySnapshot.forEach((doc) => {
        let topic = doc.data();
        topic.id = doc.id; // Store Firestore ID
        topicsData.push(topic);
    });

    // Define the desired order
    const topicOrder = [
        "ER Model",
        "Relational Database Model",
        "Conversion of ER model to Relational",
        "Normalisation",
        "Relational Algebra",
        "SQL",
        "Transaction management and",
        "File structures",
        "Practice Questions"
    ];

    // Sort data based on predefined order
    topicsData.sort((a, b) => {
        return topicOrder.indexOf(a.name) - topicOrder.indexOf(b.name);
    });

    populateTable(topicsData);
}


// Function to Populate Table
function populateTable(data) {
    studyTable.innerHTML = ''; // Clear table
    let totalWatched = 0;
    let totalVideos = 0;

    data.forEach((item) => {
        totalVideos += item.totalVideos;
        totalWatched += item.watched;

        let row = studyTable.insertRow();

        let topicCell = row.insertCell(0);
        let totalVideosCell = row.insertCell(1);
        let completedCell = row.insertCell(2);
        let perDayVideoWatchCell = row.insertCell(3);
        let notesCell = row.insertCell(4);

        topicCell.textContent = item.name;
        totalVideosCell.textContent = item.totalVideos;

        // Completed Checkbox
        let completedCheckbox = document.createElement('input');
        completedCheckbox.type = 'checkbox';
        completedCheckbox.checked = item.completed;
        completedCheckbox.disabled = true;
        completedCell.appendChild(completedCheckbox);

        // Video Watched Input
        let perDayVideoWatchInput = document.createElement('input');
        perDayVideoWatchInput.type = 'number';
        perDayVideoWatchInput.min = 0;
        perDayVideoWatchInput.value = item.watched;
        perDayVideoWatchInput.addEventListener('change', async function () {
            let watched = parseInt(this.value) || 0;
            if (watched > item.totalVideos) {
                watched = item.totalVideos;
                this.value = watched;
            }
            item.watched = watched;
            item.lastWatchedDate = new Date().toLocaleDateString();
            item.completed = watched === item.totalVideos;
            completedCheckbox.checked = item.completed;

            await updateDoc(doc(db, "topics", item.id), {
                watched: item.watched,
                lastWatchedDate: item.lastWatchedDate,
                completed: item.completed
            });

            updateProgress(data);
        });

        perDayVideoWatchCell.appendChild(perDayVideoWatchInput);

        // Notes Section
        let notesInput = document.createElement('textarea');
        notesInput.value = item.notes || "";
        notesInput.addEventListener('change', async function () {
            item.notes = this.value;
            await updateDoc(doc(db, "topics", item.id), { notes: item.notes });
        });

        notesCell.appendChild(notesInput);
    });

    updateProgress(data);
}

// Function to Update Progress
function updateProgress(data) {
    let totalWatched = data.reduce((sum, item) => sum + item.watched, 0);
    let totalVideos = data.reduce((sum, item) => sum + item.totalVideos, 0);
    let overallProgress = (totalWatched / totalVideos) * 100;

    progressBar.style.width = `${overallProgress}%`;
    progressText.textContent = `${overallProgress.toFixed(1)}%`;
}

// Fetch Data on Page Load
document.addEventListener('DOMContentLoaded', fetchTopics);
