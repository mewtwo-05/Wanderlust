document.querySelector("form").addEventListener("submit", function (event) {  //selects the submit event from the form
    const query = document.querySelector("input[name='query']").value.trim(); //selects the <input> field whose name attribute is "query"
                                                                              //.value gets the value .trim() Removes the spaces.
    if (!query) {                                                             //condition to check whether query is empty string.
        event.preventDefault();                                               //stop to form from submitting empty string.
        alert("Please enter a search term!");
    }
});
