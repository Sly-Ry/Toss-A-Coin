// Variable to store the connected database object once connection is complete 
let db;

// Variable to act as an event listener for the database. 
const request = indexedDB.open('toss-a-coin', 1);

// Database version manipulator
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
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

// Offline transaction submission
function memoryLog(memory) {
    console.log(memory);
    // Temporary connection to database
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // Object store access
    const transactionObjectStore = transaction.objectStore('new_transaction');

    transactionObjectStore.add(memory);
};

function memoryConnect() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // Variable set to get all records from store.
    const rememberAll = transactionObjectStore.getAll();

    rememberAll.onsuccess = function() {
        if(rememberAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(rememberAll.result),
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
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const transactionObjectStore = transaction.objectStore('new_transaction');

                // Clears all objects in store.
                transactionObjectStore.clear();

                alert('All saved transactions have been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        };
    };
};

// Connection listener
window.addEventListener('online', memoryConnect);