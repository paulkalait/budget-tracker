// create variable rto hold db connection
let db 
// estasblish a connection to indeDB databased called 'budget_tracker' and set it to version 1
const request = indexedDB.open('budget_tracker', 1);

// this event will emit if the database vewrsion changes
request.onupgradeneeded = function(event){
    // save a reference to the database
    const db = event.target.result;
     // create an object store (table) called 'new_list', set it to havbe an auto incrementong primary key of sorts
     db.createObjectStore('new_list', { autoIncrement: true});
};

// upon a successful upgrade
request.onsuccess = function(event){
    // when db is succesfully created with its object store (from onupgradedneeded eventabove ) or simply established a connection save reference to db in global variable
    db = event.target.result;

    // check if app is onlin,e if yes run  uploadBudget function ro send all local db data to api
    if(navigator.online){

        uploadBudget();
    }
};
request.onerror - function(event){
    // log error here
    console.log(event.target.errorCode)
}

// This function will be executed if we attemp to submit a new budget list anf theres no internet coinnecttion
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_list'], 'readwrite');

    //  access the object store for 'new_list'
    const listObjectStore = transaction.objectStore('new_list');

    // add a record to your store with add methid
    listObjectStore.add(record)
}

// function that will handle all of the data from ;new_list objectstore in ndexedDB and POST it to the server
function uploadBudget(){
    const transaction = db.transaction(['new_list'], 'readwrite')

    // access your objecvt store
    const listObjectStore = transaction.objectStore('new_list');
    
    // get all records from store and set to a variable
    const getAll = listObjectStore.getAll();

    // upon a succesful .getAll() execution, run this function
    getAll.onsuccess = function(){
        // of there was data in indexDb's store, lets send it to the api server the getall variable wil have a n array called reult from the object store
        if(getAll.result.length > 0){
            fetch('/api/transaction', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept:  'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse)
                }
                // open one more transaction
                const transaction = db.transaction(['new_list'], 'readwrite')
                // access the new_list object store
                const listObjectStore = transaction.objectStore('new_list')
                // clear all items in your store as all of the data that was there is now in the database
                listObjectStore.clear()

                alert('All transactions have been submitted')
            })
            .catch(err => {
                console.log(err)
            })
        }
    }
}

// listen for app coming back online
window.addEventListener('online', uploadBudget)