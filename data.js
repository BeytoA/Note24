const idbRequest = window.indexedDB.open("note24database", 3);
var note24database = IDBDatabase;
var logArea = document.getElementById("logArea");
var scrollToBottom = false;

function loaded() {
    logArea.innerHTML += "";

    idbRequest.onerror = function (event) {
        logArea.innerHTML += "Database ERROR\n" + event.target.error;
    }
    idbRequest.onsuccess = function (event) {
        logArea.innerHTML += "Database SUCCESS\n";

        note24database = event.target.result;
        
        if (note24database != null){
            note24database.onerror = function (event) {
                logArea.innerHTML += "Database: Error " + event.target.error + "\n";
            }
        }

        getAllNotes(note24database);
    }
    idbRequest.onupgradeneeded = function (event) {
        logArea.innerHTML += "Database will be upgraded\n";

        const existingObjectStores = event.target.transaction.objectStore("notes");
        const bufferDB = event.target.result;
        var objectStore;
        if (!bufferDB.objectStoreNames.contains("notes"))
        {
            //Notes does not exist
            objectStore = bufferDB.createObjectStore("notes", { autoIncrement: true });
            objectStore.createIndex("title", "title", { unique: false });
            objectStore.createIndex("content", "content", { unique: false });
            objectStore.createIndex("dateCreated", "dateCreated", { unique: false });
            objectStore.createIndex("dateLastModified", "dateLastModified", { unique: false });
        }
        else if (existingObjectStores.indexNames)
        {
            var indexToAddArray = [ "title", "content", "dateCreated", "dateLastModified" ];
            var indexExistingArray = existingObjectStores.indexNames;

            indexToAddArray.forEach(function(indexes) {
                if (indexExistingArray.contains(indexes))
                {
                    logArea.innerHTML += "Index create attempt: " + indexes + " already exists\n";
                }
                else
                {
                    objectStore.createIndex(indexes, indexes, { unique: false });
                    logArea.innerHTML += "Index create attempt: " + indexes + " created\n";
                }
            });
            //Delete all notes
            //bufferDB.deleteObjectStore("notes");

            //TODO: Keep all notes and only upgrade
        }

        //objectStore.onsuccess = function (e) {
        //    logArea.innerHTML += "Create objectStore SUCCESS\n";
        //};
        //objectStore.onerror = function (e) {
        //    logArea.innerHTML += "Create objectStore ERROR\n";
        //};
    
        logArea.innerHTML += "Database UPGRADED\n";
    }
}

function updateUInotesList(notes) {
    logArea.innerHTML += "Updating UI: Note list\n";
    
    if (notes.length > 0)
    {
        notes.forEach(function(note) {
            let dateSplit = note.dateCreated.split(" ")[0].split("-");
            
            const noteitem = document.getElementById("noteitem");
            let itemDivInner = noteitem.innerHTML;
            itemDivInner = itemDivInner
            .replace(/\${dBkey}/g, note.dBkey)
            .replace(/\${title}/, note.title)
            .replace(/\${content}/, "(no content)")
            .replace(/\${dateCreated}/, dateSplit[0] + "-" + dateSplit[1]);
            let itemDiv = document.createElement("div");
            itemDiv.innerHTML = itemDivInner;
            itemDiv.classList.add("noteItem");
            notesList.appendChild(itemDiv);
        });
        if (scrollToBottom) { notesList.scrollTop = notesList.scrollHeight; scrollToBottom = false; }
    }
    else { notesList.innerHTML += "<div>There are no notes yet, press 'Add Note' to make one</div>"; }
}

var notesList = document.createElement("div");
function getAllNotes(db) {

    //List all notes
    notesList = document.getElementById("notesList");
    notesList.innerHTML = "";
    
    var request = db
        .transaction(["notes"])
        .objectStore("notes")
        .openCursor();

    request.onerror = function(event) {
        logArea.innerHTML += "Note list FAILED\n";
    };
    var notes = [];
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

    // Temporary solution for newly added notes
    logArea.scrollTop = logArea.scrollHeight;

    // TODO: Add function if nothing to show in updateUInoteslist();

    /*
    note24database.transaction("notes").objectStore("notes").getAll().onsuccess = (event) => {
        updateNotesList(event.target.result);
        logArea.innerHTML += "\nNote list SUCCESS";
    }
    */
}

function getNoteArray(noteIdArray, fn) {
    logArea.innerHTML += "Getting a single note ATTEMPT\n";
    var responseArray = [];

    //TODO: Prevent executing onsuccess multiple times
    noteIdArray.forEach( function (noteId) {
        note24database
            .transaction(["notes"], "readwrite")
            .objectStore("notes")
            .openCursor(parseInt(noteId)).onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor){
                    logArea.innerHTML += "Getting a single note SUCCESS\n";
                    logArea.scrollTop = logArea.scrollHeight;
                    responseArray.push(cursor.value);
                    cursor.continue();
                }
                else { fn(responseArray); }
            };
    });
}

function showCheckboxes(preSelect) {
    //Pre select the checkbox when available
    if (preSelect != null)
    {
        var toCheck = preSelect.parentElement.children[2].children[0];
        if (toCheck.classList.contains("hidden"))
        {
            toCheck.checked = true;
        }
        else { return; }
    }

    //Get all notes on the screen
    var notes = document.getElementById("notesList").children;
    
    for(i = 0; i < notes.length; i++) {

        //Make space for checkboxes by moving note data to right
        var titleWrapper = notes[i].children[2];

        if (!titleWrapper.children[1].classList.contains("moveRight")){
            titleWrapper.children[0].classList.remove("hidden"); //Checkbox
            titleWrapper.children[1].classList.add("moveRight"); //Note Title
            titleWrapper.children[2].classList.add("moveRight"); //Note Content

            notes[i].children[1].classList.remove("selectionEnabled"); 

            document.getElementById("checkDeleteButton").classList.remove("hidden");
            document.getElementById("checkClipboardButton").classList.remove("hidden");
            if (preSelect == null)
            {
                document.getElementById("checkDeleteButton").classList.add("disabled");
                document.getElementById("checkClipboardButton").classList.add("disabled");
            }
        }
        else {
            titleWrapper.children[0].classList.add("hidden");
            titleWrapper.children[1].classList.remove("moveRight");
            titleWrapper.children[2].classList.remove("moveRight");

            notes[i].children[1].classList.add("selectionEnabled");

            //Disable all checkboxes
            titleWrapper.children[0].checked = false;

            document.getElementById("checkDeleteButton").classList.add("hidden");
            document.getElementById("checkClipboardButton").classList.add("hidden");
        }
    }
    //TODO: Add code to preselect a checkbox
}

function checkBoxClicked(chk) {
    // Check if function is called from clicking on a note
    if (chk != null)
    {
        chk.checked = !chk.checked;
    }
    document.getElementById("checkDeleteButton").classList.remove("disabled");
    document.getElementById("checkClipboardButton").classList.remove("disabled");
    
    //Function to hide checkboxes again when no notes are selected
    var notes = document.getElementById("notesList").children;
    var aNoteisChecked = false;
    for (i = 0; i < notes.length; i++)
    {
        if (notes[i].children[2].children[0].checked) { aNoteisChecked = true; }
    }
    if (!aNoteisChecked) { showCheckboxes(null); }
}

function showNote(note) {
    alert(note[0].title);
}

function clickedOnNote(toOpen) {
    var noteitem = toOpen.parentElement;
    //Find note main div
    if (!noteitem.classList.contains("noteItem")) { noteitem = noteitem.parentElement; }
    
    //Checkbox toggle if checking allowed
    var notes = document.getElementById("notesList").children;
    if (!notes[0].children[2].children[0].classList.contains("hidden"))
    {
        var noteCheckbox = noteitem.children[2].children[0];
        checkBoxClicked(noteCheckbox);
        return;
    }
    var noteId = [ noteitem.children[0].value ];

    getNoteArray(noteId, showNote);
}

function addNoteToDatabase() {
    var todayDate = new Date();
    var noteTitle = document.getElementById("noteTitle");
    if (noteTitle.value.length < 1) { alert("Type a note title, please."); return; }

    const transaction = note24database.transaction(["notes"], "readwrite");

    transaction.oncomplete = function (event) {
        logArea.innerHTML += "Add note transaction SUCCESS\n";
    };
    
    transaction.onerror = function (event) {
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
    request.onsuccess = function (event) {
        logArea.innerHTML += "Note add SUCCESS | key: " + event.target.result + "\n";
        noteTitle.value = "";

        // Temporary solution for newly added notes
        scrollToBottom = true;

        getAllNotes(note24database);
    };
}

function removeNotesFromDatabese(keysToRemove) {
    logArea.innerHTML += "Removing note(s): " + keysToRemove + "\n";
    keysToRemove.forEach(function (keys) {
        const request = note24database
            .transaction(["notes"], "readwrite")
            .objectStore("notes")
            .delete(keys);
        request.onsuccess = function (event) {
            logArea.innerHTML += "Remove note SUCCESS\n";
        };
    });
    getAllNotes(note24database);
}

function checkDeleteButtonPressed() {
    //TODO: Add code to ask for permission
    if (!document.getElementById("checkDeleteButton").classList.contains("disabled"))
    {
        var notes = document.getElementById("notesList").children;
        var notesToDelete = [];
        
        for(i = 0; i < notes.length; i++) {
            var noteCheckbox = notes[i].children[2].children[0];
            if (noteCheckbox.checked){
                //alert("will remove:" + notes[i].children[0].value);
                notesToDelete.push(parseInt(notes[i].children[0].value));
            }
        }
    
        showCheckboxes(null);
        removeNotesFromDatabese(notesToDelete);
    }
}

function copyToClipboard(toCopyArray)
{
    var toCopyClipboard = "";
    for (i = 0; i < toCopyArray.length; i++)
    {
        toCopyClipboard += toCopyArray[i].title;
        if (i < toCopyArray.length - 1) { toCopyClipboard += "\n"; }
    }
    try
    {
        if (navigator.clipboard)
        {
            logArea.innerHTML += "Note copied to clipboard (Clipboard)\n";
            navigator.clipboard.writeText(toCopyClipboard);
        }
        else
        {
            var toCopyElement = document.getElementById("toCopyClipboard");
            toCopyElement.value = toCopyClipboard;
            toCopyElement.focus();
            toCopyElement.select();
            document.execCommand("copy");
            toCopyElement.blur();
            toCopyElement.value = "";
            logArea.innerHTML += "Note copied to clipboard (execCommand)\n";
        }
    }
    catch (err)
    {
        logArea.innerHTML += "Failed to copy to clipboard: " + err;
    }
}

function checkBoxClipboardClicked() {
    //Check if button is enabled
    if (!document.getElementById("checkClipboardButton").classList.contains("disabled"))
    {
        //Get list of all notes on the screen
        notes = document.getElementById("notesList").children;
        var notesToCopy = [];
        
        //Iterate through selected notes
        for(i = 0; i < notes.length; i++) {
            var noteCheckbox = notes[i].children[2].children[0];
            
            //Create an array with selected notes
            if (noteCheckbox.checked) { notesToCopy.push(parseInt(notes[i].children[0].value)); }
        }
        if (notesToCopy.length < 1) { return; }
    
        showCheckboxes(null);
        getNoteArray(notesToCopy, copyToClipboard);
    }
}

document.addEventListener("keypress", function(event) {
    let keyCode = event.keyCode ? event.keyCode : event.which;

    if (keyCode == 13) { addNoteToDatabase(); }
});
loaded();