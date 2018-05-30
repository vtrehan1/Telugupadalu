(function ($) {

    /* These track the appropriate user entries*/
    entries = {
        teluguWord: '',
        teluguSentence: '',
        englishTranslation: '',
    }

    /* Appends the character clicked to the appropriate tracker */
    function append(buttonSelector, inputSelector, entryType) {

        $(buttonSelector).each(function () {

            $(this).click(function (e) {
                entries[entryType] += $(this).text();
                $(inputSelector).val(entries[entryType]);
                e.preventDefault();
            });

        });
    }

    /* Validates the input the user types into the appropriate input field */
    function validateField(inputSelector, warningSelector, entryType, validationFunction) {

        $(inputSelector).keyup(function (e) {

            e.preventDefault();
            entries[entryType] = this.value;

            const validKeyPressed = isKeyPressedValid(e);
            if (!validKeyPressed) {
                return;
            }

            if (e.keyCode === 8 || e.keyCode === 46) {
                // Remove the last character of entryType if backspace or delete keys pressed
                entries[entryType] = entries[entryType].substring(0, entries[entryType].length - 1);
            }

            checkEachCharacter(warningSelector, this, validationFunction);
        });
    }

    /* Helper function for validateField(). Checks if the key pressed is valid */
    function isKeyPressedValid(e) {
        return (e.keyCode == 8 || e.keyCode == 46) ||  // backspace and delete keys
               (e.keyCode > 47 && e.keyCode < 58) ||  // number keys
               (e.keyCode == 32) ||                   // spacebar & return key(s)
               (e.keyCode > 64 && e.keyCode < 91) ||  // letter keys
               (e.keyCode > 95 && e.keyCode < 112) ||  // numpad keys
               (e.keyCode > 180);                        // ;=,-./ etc...`
    }

    /* 
        Helper function for validateField(). 
        Checks if all characters in entryType are valid according to validationFunction 
    */
    function checkEachCharacter(warningSelector, input, validationFunction) {
        const isNotValid = Array.from(input.value).some(character => {
            return !validationFunction(character.charCodeAt(0));
        });

        // Hides the warning if characters are all valid
        if (!isNotValid) {
            $(warningSelector).hide();
            $(input).removeClass('is-danger');
        } 
        
        // Shows the warning if any of the characters are invalid
        else {
            $(warningSelector).show();
            $(input).addClass('is-danger');
        }

        editSubmitButtonWarning();
    }

    /* Removes last character from appropriate entryType if appropriate Delete button clicked */
    function removeLastChar(deleteSelector, inputSelector, warningSelector, entryType, validationFunction) {

        $(deleteSelector).click(function (e) {
            entries[entryType] = entries[entryType].substring(0, entries[entryType].length - 1);
            $(inputSelector).val(entries[entryType]);
            checkEachCharacter(warningSelector, $(inputSelector)[0], validationFunction);
            e.preventDefault();
        });
    }

    /* Validation function for Telugu-related input fields */
    function validateTelugu(asciiValue) {
        const isTeluguLetter = (asciiValue >= 3072 && asciiValue <= 3199);
        const isNumber = (asciiValue > 47 && asciiValue < 58);
        const isPunctuation = isCharacterPunctuation(asciiValue);
        return isTeluguLetter || isNumber || isPunctuation;
    }

    /* Validation function for English-related input field */
    function validateEnglish(asciiValue) {
        const isUpperCase = (asciiValue >= 65 && asciiValue <= 90);
        const isLowerCase = (asciiValue >= 97 && asciiValue <= 122);
        const isNumber = (asciiValue > 47 && asciiValue < 58);
        const isPunctuation = isCharacterPunctuation(asciiValue);
        return isUpperCase || isLowerCase || isNumber || isPunctuation;
    }

    /* Helper function for validation functions. Checks if given ASCII value gives punctuation */
    function isCharacterPunctuation(asciiValue) {
        let isPunctuation = false;
        switch (asciiValue) {
            // Space
            case 32:
                isPunctuation = true;
                break;
            // Exclamation mark
            case 33:
                isPunctuation = true;
                break;
            // Quotation mark
            case 34:
                isPunctuation = true;
                break;
            // Apostrophe mark
            case 39:
                isPunctuation = true;
                break;
            // Open parentheses
            case 40:
                isPunctuation = true;
                break;
            // Close parentheses
            case 41:
                isPunctuation = true;
                break;
            // Comma
            case 44:
                isPunctuation = true;
                break;
            // Hyphen
            case 45:
                isPunctuation = true;
                break;
            // Period
            case 46:
                isPunctuation = true;
                break;
            // Forward slash
            case 47:
                isPunctuation = true;
                break;
            // Colon
            case 58:
                isPunctuation = true;
                break;
            // Semicolon
            case 59:
                isPunctuation = true;
                break;
            // Question markk
            case 63:
                isPunctuation = true;
                break;
            default:
                isPunctuation = false;
                break;
        }
        return isPunctuation;
    }

    /* Helper function to remove warning from submit button if all other warnings are gone */
    function editSubmitButtonWarning() {

        const hasWordWarning = $('p.word-warning').is(':visible');
        const hasSentenceWarning = $('p.sentence-warning').is(':visible');
        const hasTranslationWarning = $('p.translation-warning').is(':visible');

        const hasNoSynonyms = $('input.english-synonym').val().split(',').length === 0;
        const hasNoSentence = $('input.sentence').val() === '';
        const hasNoWord = $('input.word').val() === '';
        const hasNoTranslation = $('input.translation').val() === '';

        const shouldShowWarning = hasWordWarning
            || hasSentenceWarning
            || hasTranslationWarning
            || hasNoSynonyms
            || hasNoSentence
            || hasNoWord
            || hasNoTranslation;

        if (shouldShowWarning) {
            $('p.submit-warning').show();
            return true;
        } else {
            $('p.submit-warning').hide();
            return false;
        }
    }

    /* Validates form and makes POST request to server w/ object in JSON format */
    function validateForm() {

        $('button.submit').click(function() {

            if (editSubmitButtonWarning()) {
                return;
            }

            let formData = {};

            formData.synonymArray = $('input.english-synonym').val().split(',');
            formData.linkArray = $('input.media').val().split(',');
            formData.teluguWord = $('input.word').val();
            formData.teluguSentence = $('input.sentence').val();
            formData.englishTranslation = $('input.translation').val();

            // POST data to backend
            fetch('http://localhost:3000/addNewWord', {
				body: JSON.stringify(formData),
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				mode: 'cors',
			}).then(response => {

                location.reload();
            });  

        });
    }

    /* Initialize all of the event listener functions */
    (function initialize() {

        $(document).ready(function() {
            append('div.button.word', 'input.word', 'teluguWord');
            append('div.button.sentence', 'input.sentence', 'teluguSentence');

            validateField('input.word', 'p.word-warning', 'teluguWord', validateTelugu);
            validateField('input.sentence', 'p.sentence-warning', 'teluguSentence', validateTelugu);
            validateField('input.translation', 'p.translation-warning', 'englishTranslation', validateEnglish);

            removeLastChar('#word-delete', 'input.word', 'p.word-warning', 'teluguWord', validateTelugu);
            removeLastChar('#sentence-delete', 'input.sentence', 'p.sentence-warning', 'teluguSentence', validateTelugu);
            removeLastChar('#translation-delete', 'input.translation', 'p.translation-warning', 'englishTranslation', validateEnglish);

            validateForm();
        });

    })();

})(jQuery);