document.addEventListener("DOMContentLoaded", loaded, false);

const idbRequest = window.indexedDB.open("note24database", 2);
var note24database = IDBDatabase;

function loaded() {
    var logArea = document.getElementById("logArea");
    
    
    idbRequest.onerror = (event) => {
        logArea.innerHTML += "\nindexedDB open ERROR";
    };
    idbRequest.onsuccess = (event) => {
        logArea.innerHTML += "\nindexedDB open SUCCESS";
        //console.log(event.target.result)
        note24database = event.target.result;
        
        if (note24database != null){
            note24database.onerror = (event) => {
                logArea.innerHTML += "\nDatabase error: ${event.target.errorCode}";
            }
        }

        getAllNotes(note24database);
    
    };
    idbRequest.onupgradeneeded = (event) => {
        logArea.innerHTML += "\nDatabase will be upgraded";
    
        const bufferDB = event.target.result;
      
        // Create an objectStore for this database
        const objectStore = bufferDB.createObjectStore("notes", { autoIncrement: true });
        
        objectStore.createIndex("title", "title", { unique: false });
        objectStore.createIndex("content", "content", { unique: false });
        objectStore.createIndex("dateCreated", "dateCreated", { unique: false });
        objectStore.createIndex("dateLastModified", "dateLastModified", { unique: false });
    
        objectStore.transaction.oncomplete = (event) => {
            logArea.innerHTML += "\nCreate objectStore SUCCESS";
        };
    };
}

function addNoteToDatabase() {
    var noteTitle = document.getElementById("noteTitle").value;
    var noteContent = "";
    var noteDateCreated = "";
    var noteDateLastModified = noteDateCreated;

    const transaction = note24database.transaction(["notes"], "readwrite");

    transaction.oncomplete = (event) => {
        logArea.innerHTML += "\nAdd note transaction SUCCESS";
    };
    
    transaction.onerror = (event) => {
        logArea.innerHTML += "\nAdd note transaction FAILED";
    };
    
    const objectStore = transaction.objectStore("notes");
    var note = { title: noteTitle, content: "Note content", dateCreated: "created date", dateLastModified: "last modified date"};

    const request = objectStore.add(note);
    request.onsuccess = (event) => {
        logArea.innerHTML += "\nNote add SUCCESS | key: " + event.target.result;

        getAllNotes(note24database);
    };
}

function removeNoteFromDatabes(keyToRemove) {
    const request = db
        .transaction(["notes"], "readwrite")
        .objectStore("notes")
        .delete(keyToRemove);
        request.onsuccess = (event) => {
            logArea.innerHTML += "\nRemove note SUCCESS";
        };
}

function getAllNotes(db) {

    //List all notes
    var notesList = document.getElementById("notesList");
    notesList.innerHTML = "";
    
    request = db
        .transaction(["notes"])
        .objectStore("notes")
        .openCursor();

    request.onerror = function(event) {
        console.err("error fetching data");
    };
    notes = [];
    request.onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            let key = cursor.primaryKey;
            let value = cursor.value;
            value.dBkey = key;
            notes.push(value)
            cursor.continue();
        }
        else {
            //After cursor done
            updateUInotesList(notes);
            logArea.innerHTML += "\nNote list SUCCESS";
        }
    };


    /*
    note24database.transaction("notes").objectStore("notes").getAll().onsuccess = (event) => {
        updateNotesList(event.target.result);
        logArea.innerHTML += "\nNote list SUCCESS";
    }
    */
}
function updateUInotesList(notes) {
    console.log(notes);
    notes.forEach((note) => {
        notesList.innerHTML += "<div>"+ "id: " + note.dBkey + " " + "Title: " + note.title + "</div>";
    });
}