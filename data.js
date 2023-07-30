const idbRequest = window.indexedDB.open("note24database", 2);
var note24database = IDBDatabase;

function loaded() {
    console.log("loaded fired");
    var logArea = document.getElementById("logArea");
    logArea.innerHTML += "";
    
    
    idbRequest.onerror = (event) => {
        logArea.innerHTML += "indexedDB open ERROR\n";
    };
    idbRequest.onsuccess = (event) => {
        logArea.innerHTML += "indexedDB open SUCCESS\n";
        //console.log(event.target.result)
        note24database = event.target.result;
        
        if (note24database != null){
            note24database.onerror = (event) => {
                logArea.innerHTML += "Database error: ${event.target.errorCode}\n";
            }
        }

        getAllNotes(note24database);
    
    };
    idbRequest.onupgradeneeded = (event) => {
        logArea.innerHTML += "Database will be upgraded\n";
    
        const bufferDB = event.target.result;
      
        // Create an objectStore for this database
        const objectStore = bufferDB.createObjectStore("notes", { autoIncrement: true });
        
        objectStore.createIndex("title", "title", { unique: false });
        objectStore.createIndex("content", "content", { unique: false });
        objectStore.createIndex("dateCreated", "dateCreated", { unique: false });
        objectStore.createIndex("dateLastModified", "dateLastModified", { unique: false });
    
        objectStore.transaction.oncomplete = (event) => {
            logArea.innerHTML += "Create objectStore SUCCESS\n";
        };
    };
}
//document.addEventListener("DOMContentLoaded", loaded, false);
loaded();


function addNoteToDatabase() {
    var todayDate = new Date();
    var noteTitle = document.getElementById("noteTitle");
    if (noteTitle.value.length < 1) { alert("Type a note title, please"); return; }

    const transaction = note24database.transaction(["notes"], "readwrite");

    transaction.oncomplete = (event) => {
        logArea.innerHTML += "Add note transaction SUCCESS\n";
    };
    
    transaction.onerror = (event) => {
        logArea.innerHTML += "Add note transaction FAILED\n";
    };
    
    const objectStore = transaction.objectStore("notes");
    var note = { 
        title: noteTitle.value,
        content: "Note content",
        dateCreated: todayDate.getDate() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getFullYear() + " " + ("0" + (todayDate.getHours())).toString().slice(-2) + ":" + ("0" + (todayDate.getMinutes() + 1)).toString().slice(-2) + ":" + ("0" + (todayDate.getSeconds() + 1)).toString().slice(-2),
        dateLastModified: ""
    };
    note.dateLastModified = note.dateCreated;

    const request = objectStore.add(note);
    request.onsuccess = (event) => {
        logArea.innerHTML += "Note add SUCCESS | key: " + event.target.result + "\n";
        noteTitle.value = "";

        getAllNotes(note24database);
    };
}

function removeNoteFromDatabes(keyToRemove) {
    const request = note24database
        .transaction(["notes"], "readwrite")
        .objectStore("notes")
        .delete(keyToRemove);
        request.onsuccess = (event) => {
            logArea.innerHTML += "Remove note SUCCESS\n";
        };
    getAllNotes(note24database);
}

var notesList = document.createElement("div");
function getAllNotes(db) {

    //List all notes
    notesList = document.getElementById("notesList");
    notesList.innerHTML = "";
    
    request = db
        .transaction(["notes"])
        .objectStore("notes")
        .openCursor();

    request.onerror = function(event) {
        logArea.innerHTML += "Note list FAILED\n";
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
            logArea.innerHTML += "Note list SUCCESS\n";
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
    logArea.innerHTML += "Updating note list\n";
    
    if (notes.length > 0)
    {
        notes.forEach((note) => {
            logArea.innerHTML += "Adding item\n";
            const noteitem = document.getElementById("noteitem");
            let itemDivInner = noteitem.innerHTML;
            itemDivInner = itemDivInner
            .replace(/\${dBkey}/g, note.dBkey)
            .replace(/\${title}/, note.title)
            .replace(/\${dateCreated}/, note.dateCreated);
            let itemDiv = document.createElement("div")
            itemDiv.innerHTML = itemDivInner;
            notesList.appendChild(itemDiv);
        });
    }
    else { notesList.innerHTML += "<div>There are no notes yet, press 'Add Note' to make one</div>"; }
}