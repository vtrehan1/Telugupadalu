(function ($) {

    /* Checks all Telugu words and English synonyms to find the appropriate Telugu word */
    function searchForWord(userEntry, language) {
        fetch(`http://localhost:3000/search/${userEntry}?language=${language}`)
            .then(response => response.json())
            .then(result => console.log(result))
            .catch(err => console.error(err));
    }

    /* Calls searchForWord when search button clicked or enter key pressed */
    function registerEventHandlers() {

        $('input.search').keyup(function(e) {


            if (e.keyCode === 13 & validateInputField()) {
                const userEntry = $('input.search').val();
                $('input.search').val(''); 
                searchForWord(userEntry.toLowerCase(), getLanguage(userEntry));
            }
            e.preventDefault();

        });

        $('button.search').click(function(e) {

            if (validateInputField()) {
                const userEntry = $('input.search').val();
                $('input.search').val('');    
                searchForWord(userEntry.toLowerCase(), getLanguage(userEntry));         
            }
            e.preventDefault();

        });
    }

    /* Helper function for registerEventHandlers */
    /* Returns the language of the string parameter (either Telugu or English) */
    function getLanguage(userEntry) {
        return isTeluguLetter(userEntry.charCodeAt(0)) ? 'TELUGU' : 'ENGLISH';
    }

    /* Shows warning if nothing is entered into the input field */
    /* Removes input field warning otherwise */
    /* Helper function for registerEventHandlers() */
    function validateInputField() {

        const userEntry = $('input.search').val();

        if (userEntry === '' || hasLanguageIssue(userEntry)) {
            $('input.search').addClass('is-link');
            $('p.search-warning').show();
            return false;
        }

        if (!hasLanguageIssue(userEntry)) {
            $('input.search').removeClass('is-link');
            $('p.search-warning').hide();
            return true;
        }
    }

    /* Helper function for validateInputField() */
    /* Checks if all characters are English or all are Telugu */
    function hasLanguageIssue(userEntry) {

        let firstChar = userEntry.charCodeAt(0);

        /* Returns true if all characters NOT Telugu given first character is Telugu */
        if (isTeluguLetter(firstChar)) {
            return Array.from(userEntry).some(character => {
                !isTeluguLetter(character);
            });
        } 

        /* Returns true if all characters NOT English given first character is English */
        else if (isEnglishLetter(firstChar)) {
            return Array.from(userEntry).some(character => {
                !isEnglishLetter(character);
            });
        } 

        /* If first character not Telugu or English, userEntry has language issues */
        else {
            return true;
        }
    }

    /* Helper function for hasLanguageIssue() */
    /* Checks if a character is Telugu or not */
    function isTeluguLetter(character) {
        return character >= 3072 && character <= 3199;
    }

    /* Helper function for hasLanguageIssue() */
    /* Checks if a character is English or not */
    function isEnglishLetter(character) {
        return (character >= 65 && character <= 90) || (character >= 97 && character <= 122);
    }


    /* Initialize all of the event listener functions */
    (function initialize() {

        $(document).ready(function() {
            
            registerEventHandlers();

        });

    })();

})(jQuery);