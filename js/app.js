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



/* API Section :)
–––––––––––––––––––––––––––––––––––––––––––––––––– */
let SEARCH_QUERY = `chicken breast,split peas,mangos,olive oil,butter,green beans,corn on the cob`; /* for initial test and QA. */
// let SEARCH_QUERY = ``;
const SPOON_BASE_URL = `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/`;
const INGREDIENT_SEARCH_STRING = `findByIngredients?fillIngredients=false&ingredients=${SEARCH_QUERY}&limitLicense=true&number=10&ranking=1`;
const GET_RECIPE_STRING = `${recipe-id}/information?includeNutrition=true`;
const GET_SUMMARY_RESULTS = `${recipe-id}/summary`;

/* callApi takes a base url, query string, and 
 * callback upon successful api request, will 
 * perform callback. upon error, will run apiError
 * function to log errors to the console. Will call
 * setHeader before the api request for auth etc
 –––––––––––––––––––––––––––––––––––––––––––––––––– */
function callApi(baseUrl, query, callback) { // Generalized for portability. On Success run callback function. 
    $.ajax({
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
  xhr.setRequestHeader('X-Mashape-Key', 'sBZW8aQPkjmshiV8iEbeWh3Uzr9Mp1GaEhujsnpCQGWpcewGEG');
}

// Basic Error Handling
function apiError(jqXHR, textStatus, errorThrown) {
    alert('An error occurred... Look at the console (F12 or Ctrl+Shift+I, Console tab) for more information!');
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
function apiTest(data){
    console.log(data);
}

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
        let jsIngredients = $(this).serializeArray(); // Array of values
        let ingredientString = ""; // empty string

        for (let k = 0; k<jsIngredients.length; k++) {
            if (jsIngredients[k].value) { // if non-empty
            ingredientString +=  `${jsIngredients[k].value},`; // concat on to the string
            }
        }
        ingredientString = ingredientString.slice(0,ingredientString.length-1); // remove that comma
        console.log(ingredientString); // return!
    })

}

/* Dynamically add form fields as needed max 10.
–––––––––––––––––––––––––––––––––––––––––––––––––– */
function increaseFormFields (i){
    if (i<=10) { // limit to 10 items or less. i is 1-indexed here.
        console.log(`Increasing Fields`);
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

/* Toss "Similar recipes ..." from the end of summary
–––––––––––––––––––––––––––––––––––––––––––––––––– */
function getRidOfSimilar (myStr) {
    let myStr = myStr;
    let newStr = myStr.substring(0, (myStr.indexOf("Similar")-1));
    newStr += "</p>";
    return newStr;
}

/* Jinkies! - just checking that the script runs.
–––––––––––––––––––––––––––––––––––––––––––––––––– */
function jinkies(){
    increaseFormFields(3); // We start with 2 by default, so when the app starts, we pre-set 3 into the function.
    onFormSubmit(); 
    console.log('Jinkies!');
};
$(jinkies);