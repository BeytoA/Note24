function backToNoteListClicked(e) {
    //alert("Clicked");
    e.preventDefault();
    window.location.href = window.location.pathname.split("views")[0] + "index.html";
}

/*function loadThis() {
        //Get noteId from the URL
        var allQueryParameters = document.location.search;
        var noteId = allQueryParameters.split("noteId=")[1].toString();

        //Check if there are multiple parameters in the URL
        if (noteId.indexOf("&") > -1)
        {
            noteId = noteId.split("&")[0];
        }

        //Fill note page
        var noteIds = [ noteId ]
        getNoteArray(noteIds, fillNotePage2);
}

function fillNotePage2(noteData) {
    var noteTitleInput = document.getElementById("noteTitle");
    noteTitleInput.value = noteData[0].title;

    var noteContent = document.getElementById("noteContent");
    noteContent.innerHTML = noteData[0].content;
}*/
