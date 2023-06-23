var express = require('express');

// Import the IBM Watson library to make it easy to make requests to the NLU service
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');

// Need the auth library as well to authenticate with NLU
const { IamAuthenticator } = require('ibm-watson/auth');

var router = express.Router();

// Instantiate NLU object
// This uses the apikey from IBM Cloud which is available in the "Service Credentials" section of the NLU service
// We are also using the Service URL from NLU which is also available in IBM Cloud under "Service Credentials"
const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2022-04-07',
    authenticator: new IamAuthenticator({
      // Retrieves the apikey from an environment variable called "nlu_apikey"
      apikey: process.env.nlu_apikey,
    }),
    // Retrieves the NLU service endpoint from an environment variable called "nlu_url"
    serviceUrl: process.env.nlu_url,
  });

/* GET Send text analysis request to NLU */
// Returns object:
// location: string
// concepts: string[]
// entities: string[]
router.get('/', async function(req, res, next) {

    // Get the query parameter named "text"
    var text = req.query.text;

    // Prepare the options for the NLU text analysis request
    // text: the text we want to analyze
    // features: What features from NLU we want to include
    // In this case we only care about analyzing entities, keywords, and concepts
    // A limit of 3 is set for each feature so that a maximum of 3 results per feature is returned
    // More info on what can be added can be found in the API reference: https://cloud.ibm.com/apidocs/natural-language-understanding?code=node#features-examples
    const analyzeParams = {
        'text': text,
        'features': {
            'entities': {
                'limit': 3
            },
            'keywords': {
                'limit': 3
            },
            'concepts': {
                'limit': 3
            }
        }
    }

    // Make the request to analyze text using the NLU object created earlier by calling the analyze method and passing the analyzeParams options we created above.
    naturalLanguageUnderstanding.analyze(analyzeParams)
    .then(analysisResults => {

        console.log(analysisResults)

        var location;
        var entities = [];
        var concepts = [];

        // Loop through the returned entities to find the entity with the type of "Location"
        // All other entities are added to generic entity array, however, if we are interested in further entity types, we can make a Swtich/Case statement here instead to filter those out based on entity type.
        // More information on entity types can be found here: https://cloud.ibm.com/docs/natural-language-understanding?topic=natural-language-understanding-entity-types-version-2
        analysisResults.result.entities.forEach(entity => {
            if (entity.type == "Location") {
                location = entity.text;
                console.log("Found location: "+location);
            } else
                entities.push(entity.text);
                console.log("Found entity: "+entity.text);
        });

        // Loop thorugh the returned concepts to add them to concepts array. 
        // We can add logic here to filter out entries that are also returned in the entities section.
        // For example, text containing "Salesforce" will return a concept of "salesforce.com" and an entity of "Salesforce"
        analysisResults.result.concepts.forEach(concept => {
            concepts.push(concept.text);
            console.log("Concept found: "+ concept.text);
        });

        if(!location)
            location = "none"

        var result = {
            "location": location,
            "concepts": concepts,
            "entities": entities
        }

        return result;
    })
    .then(response => {
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
    })
    .catch(err => {
        console.log('error:', err);
    });

    
});

module.exports = router;
