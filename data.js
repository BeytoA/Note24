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
document.addEventListener("DOMContentLoaded", loaded, false);

function addNoteToDatabase() {
    var noteTitle = document.getElementById("noteTitle").value;
    if (noteTitle.length < 1) { alert("Type a note title, please"); return; }

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
    const request = note24database
        .transaction(["notes"], "readwrite")
        .objectStore("notes")
        .delete(keyToRemove);
        request.onsuccess = (event) => {
            logArea.innerHTML += "\nRemove note SUCCESS";
        };
    getAllNotes(note24database);
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
        logArea.innerHTML += "\nNote list FAILED";
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
    logArea.innerHTML += "\nUpdating note list";
    
    if (notes.length > 0)
    {
        
        notes.forEach((note) => {
            const itemToAdd = document.querySelector("#noteitem").content.cloneNode(true);
            let itemDiv = itemToAdd.querySelectorAll("div");
            itemDiv[0].innerHTML = itemDiv[0].innerHTML
            .replaceAll("${dBkey}", note.dBkey)
            .replaceAll("${title}", note.title);
            notesList.appendChild(itemToAdd);
        });
    }
    else { notesList.innerHTML += "<div>There are no notes yet, press 'Add Note' to make one</div>"; }
}