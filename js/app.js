'use strict';

/*
 * Chefist app.js
 * © 2018 - RC Maples
 *
 * -----------------------------------------------
 *
 * API Base URL:
 * https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/
 *
 * API Endpoints:
 *
 * Initial Search:
 * findByIngredients? - Params:
 *                  fillIngredients=false   -- Add information about the used and missing ingredients in each recipe.
 *                  &ingredients=chicken,rice noodles,egg -- A comma-separated list of ingredients that the recipes should contain.
 *                  &limitLicense=true -- Whether to only show recipes with an attribution license.
 *                  &number=10 -- The maximal number of recipes to return (default = 5).
 *                  &ranking=1 -- Whether to maximize used ingredients (1) or minimize missing ingredients (2) first.
 * (https://market.mashape.com/spoonacular/recipe-food-nutrition#search-recipes-by-ingredients)
 *
 *
 * Display Summary:
 * ${recipe-id}/summary
 * (https://market.mashape.com/spoonacular/recipe-food-nutrition#summarize-recipe)
 *
 *
 * Display Recipe:
 * ${recipe-id}/information? - Params:
 *                  includeNutrition=true -- Include nutrition data to the recipe information. Nutrition data is per serving.
 *                                           If you want the nutrition data for the entire recipe, just multiply by the number of servings.
 * https://market.mashape.com/spoonacular/recipe-food-nutrition#get-recipe-information
 *
 * -----------------------------------------------
 *
 * Application Logic:
 *
 * First, we will grab the input data from the form
 * and store it in a string variable.
 *
 * With the String Variable in hand, we need to pass
 * it to the findByIngredients endpoint.
 *
 * With the data we get back from the first API call,
 * we then need to pass each recipe ID returned into
 * the summary endpoint 1x1.
 *
 * Once we have the summary of each recipe, we need
 * jQuery to create a summary card item and display
 * it. We'll be using Desandro's Masonry to display
 * the results.
 * https://masonry.desandro.com/ (MIT License)
 *
 * The results will have infinite scroll load using
 * Metafizzy's Infinite Scroll
 * https://infinite-scroll.com/ (GNU GPL 3)
 *
 * User should be able to return to search form from
 * search results to start over.
 *
 * When the user clicks on a summary card, we will
 * call the information end point with the recipe's
 * ID number from the summary card. This API call
 * will likely take a bit of time to run.
 *
 * User should be able to return to Search Results
 * from their selected recipe.
 –––––––––––––––––––––––––––––––––––––––––––––––––– */



/* API Section
–––––––––––––––––––––––––––––––––––––––––––––––––– */

// TODO: remove recipeId from global scope; will use for testing and to prevent js errorls on line 81/82 for now.
// TODO: CLEAN UP GLOBAL VARS IF NOT NEEDED!
let recipeId = ""; //
const SPOON_BASE_URL = `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/`;
const GET_RECIPE_STRING = `${recipeId}/information?includeNutrition=true`;


/* callApi takes a base url, query string, and
 * callback upon successful api request, will
 * perform callback. upon error, will run apiError
 * function to log errors to the console. Will call
 * setHeader before the api request for auth etc
 –––––––––––––––––––––––––––––––––––––––––––––––––– */
function callApi(baseUrl, query, callback) { // Generalized for portability. On Success run callback function.
    console.log(`api was called with ${query}`);
    return $.ajax({
        url: `${baseUrl}${query}`,
        type: 'GET',
        dataType: 'json',
        success: callback,
        error: apiError,
        beforeSend: setHeader
    });
}

// For sending headers on the API Request
function setHeader(xhr) {
  //xhr.setRequestHeader('X-Mashape-Key', 'sBZW8aQPkjmshiV8iEbeWh3Uzr9Mp1GaEhujsnpCQGWpcewGEG');  //about to go over quota, using other key below.
//   xhr.setRequestHeader('X-Mashape-Key', 'yB6rBrVNkAmshmK9hd1NgffQUVvZp1JQkYbjsnn8OTIJU5rVgv'); // More quotas...
  xhr.setRequestHeader('X-Mashape-Key', 'P5HNiYA1rwmshLxvgqpnK55DCX5Wp1mSLTZjsnrG21Zd27gPoU');
}

// Basic Error Handling
function apiError(jqXHR, textStatus, errorThrown) {
    //alert('An error occurred... Look at the console (F12 or Ctrl+Shift+I, Console tab) for more information!');
    console.log(`/--------------------`);
    console.log('jqXHR:');
    console.log(jqXHR);
    console.log('textStatus:');
    console.log(textStatus);
    console.log('errorThrown:');
    console.log(errorThrown);
    console.log(`/--------------------`);
}

// test function to be passed as callback verify correct response
// function apiTest(data){
//     console.log(data);
// }
/* End API Section
–––––––––––––––––––––––––––––––––––––––––––––––––– */

/* Form Section
–––––––––––––––––––––––––––––––––––––––––––––––––– */

/* Watch for Form Submit
 * when the form is submitted, make an array of values
 * Traverse the Array and fill a string with non-empty values
 * Pop the comma off the end of the string
 * return the string for API call.
–––––––––––––––––––––––––––––––––––––––––––––––––– */
function onFormSubmit(){
    $('#js-search-form').submit(function(event){
        event.stopPropagation();
        event.preventDefault();
        console.log('form submitted...');
        let jsIngredients = $(this).serializeArray(); // Array of values
        let ingredientString = ""; // empty string

        for (let k = 0; k<jsIngredients.length; k++) {
            if (jsIngredients[k].value) { // if non-empty
            ingredientString +=  `${jsIngredients[k].value},`; // concat on to the string, adds a comma after each word, also adds a trailing comma at the end.
            }
        }
        ingredientString = ingredientString.slice(0,ingredientString.length-1); // remove the trailing comma
        // console.log(ingredientString); // return!
        let INGREDIENT_SEARCH_STRING = `findByIngredients?fillIngredients=false&ingredients=${ingredientString}&limitLicense=true&number=2&ranking=1`;
        callApi(SPOON_BASE_URL, INGREDIENT_SEARCH_STRING, makeSummaryCard); // global ingredient_search_string is defined above and uses global search_query
    })

}

/* Dynamically add form fields as needed max 10.
–––––––––––––––––––––––––––––––––––––––––––––––––– */
function increaseFormFields (i){
    if (i<=10) { // limit to 10 items or less. i is 1-indexed here.
        // console.log(`Increasing Fields`);
        let j = i;
        $('#js-search-form input:text:last').prev().on('change',
            function(){
                $('#js-search-form input:text:last').after(
                    `<input type="text" placeholder="Chicken Breast" id="ingredient-${j}" name="ingredient-${j}" >`
                );
                j++;
                increaseFormFields(j);
            }
        );
    }
}

/* End Form Section
–––––––––––––––––––––––––––––––––––––––––––––––––– */


/* Summary Cards
–––––––––––––––––––––––––––––––––––––––––––––––––– */

// Make an array of objects to populate cards.
const summaryCardsArr = [];

/*
Fill initial card data (id, title) from first api call on form submit
Then loop through results calling the api again for each result using GET_SUMMARY_RESULTS query; put function in summary value; return the summary.
For Image, cooktime, calories, call the api using GET_RECIPE_STRING.
*/

function makeSummaryCard(data){
    //console.log(data);
    for (let i=0; i<2; i++) { //TODO: Set back to i<data.length)

        // populate ID, Title, and Image
        summaryCardsArr.push({
            "id": data[i].id,
            "title": `${data[i].title}`,
            "image": `https://spoonacular.com/recipeImages/${data[i].id}-556x370.jpg`,
        });

        // populate Summary
        $.ajax({
            url: `${SPOON_BASE_URL}${data[i].id}/summary`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                        summaryCardsArr[i]["summary"] = `${response.summary}`
                        },
            error: apiError,
            beforeSend: setHeader
        });

        // populate time in minutes / caloris
        $.ajax({
            url: `${SPOON_BASE_URL}${data[i].id}/information?includeNutrition=true`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                summaryCardsArr[i]["calories"] = Math.round(response.nutrition.nutrients["0"].amount);
                summaryCardsArr[i]["cookTime"] = response.readyInMinutes;
                },
            error: apiError,
            beforeSend: setHeader
        });
    }
    //console.log(summaryCardsArr);
}

// function concatSummary(data) {
//     console.log(`/---------------------------`);
//     console.log(data.summary);
//     //getRidOfSimilar(data.summary);
//     //return data.summary;
// }


/* Toss "Similar recipes ..." from the end of summary
–––––––––––––––––––––––––––––––––––––––––––––––––– */
function getRidOfSimilar (myStr) {
    //let myStr = myStr;
    //console.log(myStr);
    let newStr = myStr.substring(0, (myStr.indexOf("Similar")-1));
    newStr += "</p>";
    //console.log(newStr);
    return(newStr);
}

/* End Summary Cards
–––––––––––––––––––––––––––––––––––––––––––––––––– */



/* Jinkies! - just checking that the script runs.
–––––––––––––––––––––––––––––––––––––––––––––––––– */
function jinkies(){
    increaseFormFields(3); // We start with 2 by default, so when the app starts, we pre-set 3 into the function.
    onFormSubmit();
    console.log('Jinkies!');
};
$(jinkies);