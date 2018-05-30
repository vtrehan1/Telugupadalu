const FuzzySet = require('fuzzyset.js');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://telugupadalu-203423.firebaseio.com/'
});

const rootRef = admin.database().ref();

// wordInfo tree stores the Telugu word and its associated information
const wordInfoRef = rootRef.child('wordsInfo');

// word tree stores just the Telugu word for more efficient search
const wordRef = rootRef.child('words');

/* 
    synonym tree maps each English synonym to its associated Telugu word
    It is used for more efficient search and data download from database
*/
const synonymRef = rootRef.child('synonyms');

function addNewWord(synonymArray, linkArray, teluguWord, teluguSentence, englishTranslation) {

    /* 
        Database entry for the word in the wordInfo tree will have the following structure:
        {
          [insert word]: {
            sample sentence (Telugu): [insert sentence],
            sample translation (English): [insert translation],
            synonyms (English): {
              unique Firebase pushID: [insert synonym],
            },
            links: {
              unique Firebase pushID: [insert link],
            }
          }
        }
    */
    wordInfoRef.child(teluguWord).set({

        'sample sentence (Telugu)': teluguSentence,
        'sample sentence translation (English)': englishTranslation

    }).then(response => {

        synonymArray.forEach(synonym => {
            wordInfoRef.child(teluguWord)
                   .child('synonyms (English)')
                   .push(synonym)
                   .catch(err => console.error(err));
        });

        linkArray.forEach(link => {
            wordInfoRef.child(teluguWord)
                   .child('links')
                   .push(link)
                   .catch(err => console.error(err));
        });

    }).catch(err => console.error(err));

    /* 
        Database entry for the word in the word tree will have the following structure:
        {
          [insert word]: true
        }
    */

    wordRef.child(teluguWord).set(true).catch(err => console.error(err));

    /* 
        Database entry for each synonym in the synonym tree will have the following structure:
        {
          [insert synonym]: {
              unique Firebase pushID: [insert associated Telugu word],
              ...
          }
        }
    */
    synonymArray.forEach(synonym => {

        synonymRef.child(synonym.toLowerCase()).push(teluguWord).catch(err => console.error(err));
    
    });
}

/* Searches for appropriate Telugu word given Telugu word or English synonym */
function searchForWord(userEntry, language) {

    const matchResults = [];

    if (language === 'TELUGU') {
        return wordRef.child(userEntry)
               .once('value')
               .then(snap => {

                    /* Return array containing only userEntry if userEntry is an exact match */
                    if (snap.exists()) {
                        matchResults.type = 'EXACT';
                        matchResults.push(userEntry);
                        return matchResults;
                    } 
                    
                    /* Return array containing closest matchResults to userEntry otherwise */
                    else {
                        matchResults.type = 'ESTIMATE';
                        return wordRef.orderByKey()
                                      .startAt(userEntry[0])
                                      .endAt(`${userEntry[0]}\uf8ff`)
                                      .once('value')
                                      .then(snap => {
  
                                            const matchSet = FuzzySet();

                                            /* Add all words in query result to the FuzzySet */
                                            snap.forEach(word => {
                                                matchSet.add(word.key);
                                            });

                                            const resultArray = matchSet.get(userEntry);

                                            if (resultArray === null) {
                                                return matchResults;
                                            }
                                        
                                            /* Adds all results to matchResults */
                                            resultArray.forEach(result => {
                                                matchResults.push(result[1]);
                                            });

                                            return matchResults;

                                      })
                                      .catch(err => console.error(err));
                    }

               })
               .catch(err => console.error(err));
    } else {
        return synonymRef.child(userEntry)
               .once('value')
               .then(snap => {
                   
                    /* Return array containing only userEntry if userEntry is an exact match */
                    if (snap.exists()) {
                        matchResults.type = 'EXACT';
                        snap.forEach(teluguWord => {
                            matchResults.push(teluguWord.val());
                        });
                        
                        return matchResults;
                    }
                    
                    /* Return array containing closest matchResults to userEntry otherwise */
                    else {
                        matchResults.type = 'ESTIMATE';
                        return synonymRef.orderByKey()
                                      .startAt(userEntry[0])
                                      .endAt(`${userEntry[0]}\uf8ff`)
                                      .once('value')
                                      .then(snap => {
  
                                            const matchSet = FuzzySet();

                                            /* Add all synonyms in query result to the FuzzySet */
                                            snap.forEach(synonym => {
                                                matchSet.add(synonym.key);
                                            });
                                        
                                            const closestSynonymArray = matchSet.get(userEntry);

                                            if (closestSynonymArray === null) {
                                                return matchResults;
                                            } 
                                            
                                            /* Adds Telugu words associated to closestSynonym to matchResults */
                                            else {
                                                const closestSynonym = closestSynonymArray[0][1];
                                                return synonymRef.child(closestSynonym)
                                                                 .once('value')
                                                                 .then(snap => {
                                                                     snap.forEach(teluguWord => {
                                                                        matchResults.push(teluguWord.val());
                                                                     });
                                                                     return matchResults;
                                                                 })
                                                                 .catch(err => console.error(err));
                                            }
                                      })
                                      .catch(err => console.error(err));
                    }

               })
               .catch(err => console.error(err));
    }
}

module.exports = {
  addNewWord, 
  searchForWord,
};