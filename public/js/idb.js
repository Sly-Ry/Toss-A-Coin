// Variable to store the connected database object once connection is complete 
let db;

// Variable to act as an event listener for the database. 
const request = indexedDB.open('toss-a-coin', 1);

// Database version manipulator
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// Stores object once the connection to the database is finalized. 
request.onsuccess = function(event) {
    db = event.target.result;

    // Runs memoryConnect function if app is on.
    if (navigator.onLine) {
        memoryConnect();
    }
};

// Logs if error with database interaction.
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// Offline budget submission
function memoryLog(memory) {
    // Temporary connection to database
    const transaction = db.transaction(['new_budget'], 'readwrite');
    // Object store access
    const budgetObjectStore = transaction.objectstore('new_budget');

    budgetObjectStore.add(memory);
};

function memoryConnect() {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectstore('new_budget');

    // Variable set to get all records from store.
    const rememberAll = budgetObjectStore.getAll();

    rememberAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/budget', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_budget');

                // Clears all objects in store.
                budgetObjectStore.clear();

                alert('All saved budgets has been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        };
    };
};

// Connection listener
window.addEventListener('online', memoryConnect)