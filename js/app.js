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
 * it.
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

let recipeId = "";
const SPOON_BASE_URL = `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/`;
const GET_RECIPE_STRING = `${recipeId}/information?includeNutrition=true`;


/* callApi takes a base url, query string, and
 * callback upon successful api request, will
 * perform callback. upon error, will run apiError
 * function to log errors to the console. Will call
 * setHeader before the api request for auth etc
 –––––––––––––––––––––––––––––––––––––––––––––––––– */
function callApi(baseUrl, query, callback) { // Generalized for portability. On Success run callback function.
    // console.log(`the API was called with ${query}`);
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
  xhr.setRequestHeader('X-Mashape-Key', 'Sanitized');
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
    // console.log('onFormSubmit ran...');
    summaryCardsArr.length = 0;
    $('.js-summary').empty();
    $('.js-summary').append(`<legend class="clip">Search Results</legend>`);
    $('#js-search-form').submit(function(event){
        event.preventDefault();
        event.stopPropagation();

        $('.instructions').addClass('clip');
        let jsIngredients = $(this).serializeArray(); // Array of values
        let ingredientString = ""; // empty string
        //console.log(jsIngredients);

        for (let k = 0; k<jsIngredients.length; k++) { // This for loop could probably be done with a map reduce...
            if (jsIngredients[k].value) { // if non-empty
            ingredientString +=  `${jsIngredients[k].value},`; // concat on to the string, adds a comma after each word, also adds a trailing comma at the end.
            }
        }
        ingredientString = ingredientString.slice(0,ingredientString.length-1); // remove the trailing comma
        // console.log(ingredientString); // return!
        let INGREDIENT_SEARCH_STRING = `findByIngredients?fillIngredients=false&ingredients=${ingredientString}&limitLicense=true&number=12&ranking=1`;
        // console.log('onFormSubmit is calling the api...with a makeSummaryCard Callback');

        callApi(SPOON_BASE_URL, INGREDIENT_SEARCH_STRING, makeSummaryCard); // global ingredient_search_string is defined above and uses global search_query
        $('#js-search-form').addClass('clip');
    })
}

/* Dynamically add form fields as needed max 10.
–––––––––––––––––––––––––––––––––––––––––––––––––– */

function increaseFormFields() {
 //console.log('increaseFormFields is running...');

    $('.js-input-text:nth-last-of-type(2)').on('change', function(event){
        event.stopPropagation();
        event.preventDefault();
        let numFields = Number($('.js-input-text').filter(":last").attr('id').slice(11,));
        let j = numFields+1;
        if (numFields<10) {
            $('.js-input-text').last().after(
                `<label for="ingredient-${j}" class="visuallyhidden">ingredient ${j}</label>
                 <input type="text" placeholder="ingredient ${j}" id="ingredient-${j}" class="js-input-text" name="ingredient-${j}">`
            );
            // console.log('increaseFormFields is calling increaseFormFields...');
            increaseFormFields();
        } else {
            alert("Max 10 items!")
        }
    })

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
    // Catch empty results.
   // console.log(data);
    if (data.length == 0) { // is no results
        // display modal and restart button.

        $('main').append(`<div class="error ten columns offset-by-one column" aria-live="assertive"><p>No need to cry over spilt milk, but we couldn't find any recipes that matched your search. Maybe check your spelling and try again. Just click the restart button below.</p></div>`)
        $('#js-restart-button').removeClass('clip').addClass('top');

        //restart listener
        $('#js-restart-button').on('click', function(event){
            event.stopPropagation();
            event.preventDefault();
            $('.js-input-text').find("input[type=text], textarea").val("");
            $('.js-recipe-card').empty();
            $('.js-summary').empty();
            $('.js-summary').append(`<legend class="clip">Search Results</legend>`);
            summaryCardsArr.length = 0;
            $('.js-summary-card').addClass('clip');
            $('.js-summary-card').attr("aria-hidden", "true");
            $('#js-search-form').removeClass('clip');
            $('#js-restart-button').addClass('clip').removeClass('top');
            $('.error').remove();
        });
    }

    // console.log(`makeSummaryCard is running...`);
    let arrLength = 0;

    for (let i=0; i<data.length; i++) {
        // populate ID, Title, and Image
        summaryCardsArr.push({
            "id": data[i].id,
            "title": `${data[i].title}`,
            "image": `https://spoonacular.com/recipeImages/${data[i].id}-556x370.jpg`,
        });
        // populate Summary
        // console.log(`makeSummaryCard is making the 1st api call for the ${i}-th time.`);
        $.ajax({
            url: `${SPOON_BASE_URL}${data[i].id}/summary`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                // console.log(`makeSummaryCard was successful making the 1st api call for the ${i}-th time.`);
                summaryCardsArr[i]["summary"] = getRidOfSimilar(response.summary);
                // console.log(`makeSummaryCard is making the 2nd api call for the ${i}-th time.`);
                $.ajax({
                    url: `${SPOON_BASE_URL}${data[i].id}/information?includeNutrition=true`,
                    type: 'GET',
                    dataType: 'json',
                    success: function (response) {
                        // console.log(`makeSummaryCard was successful making the 2nd api call for the ${i}-th time.`);
                        arrLength++;
                        summaryCardsArr[i]["calories"] = Math.round(response.nutrition.nutrients["0"].amount);
                        summaryCardsArr[i]["cookTime"] = response.readyInMinutes;
                        if (arrLength == data.length){
                            // console.log('makeSummaryCard is calling displaySummaryResults now...');
                            displaySummaryResults(summaryCardsArr); // Pass the Array off to let jQuery build the html for them.};
                            }
                        },
                    error: apiError,
                    beforeSend: setHeader
                });
             },
            error: apiError,
            beforeSend: setHeader
        });
    }
}

/* Summary Cards Results Rendered as buttons in a form.
-------------------------------------------------- */
function displaySummaryResults(arr){
    // console.log(`displaySummaryResults ran...`);
    $('.js-summary-card').removeClass('clip');
    $('.js-summary-card').attr("aria-hidden", "false");
    $('#js-restart-button').removeClass('clip');
    for (let i=0; i<arr.length; i++){
        $(".js-summary").append(`
            <button class="summary-card" id="${arr[i].id}">
                <img src="https://spoonacular.com/recipeImages/${arr[i].id}-556x370.jpg" alt="${arr[i].title}">
                <div class="summary-card-content">
                    <h3>${arr[i].title}</h3>
                    <ul class="summary-card-specs">
                        <li>
                            <img class="specs" alt="Cook Time" src="${cookTimeImg}">
                            <p>${arr[i].cookTime} minutes</p>
                        </li>
                        <li>
                            <img class="specs" alt="Number of Calories" src="${calorieImg}">
                            <p>${arr[i].calories} calories per serving</p>
                        </li>
                    </ul>
                    ${arr[i].summary}
                </div>
            </button>
        `);
    }
    $(".js-summary-card").append(`</div>`);
    // console.log(`displaySummaryResults called watchSummary...`);
    watchSummary();

}



/* Toss "Similar recipes ..." from the end of summary
–––––––––––––––––––––––––––––––––––––––––––––––––– */
function getRidOfSimilar (myStr) {
    let regx = new RegExp(/\.(\s\w+)?((\s\w+)+[!,.;:']?(\s\w+)+?:?)?\s\<a/, 'g');
    let match = regx.exec(myStr);
    if (match) {
        let newStr = myStr.substring(0,(match.index+1));
        newStr = `<p>${newStr.trim()}</p>`;
        return(newStr);
    } else { return myStr;}

}



/* Summary Card Event Watcher
-------------------------------------------------- */

function watchSummary(){
    $('.js-recipe-card').empty();
    // console.log(`watchSummary ran..`);
    $('#js-restart-button').on('click', function(event){
        event.stopPropagation();
        event.preventDefault();
        $('#js-search-form').find("input[type=text], textarea").val("");
        $('.js-recipe-card').empty();
        $('.js-summary').empty();
        $('.js-summary').append(`<legend class="clip">Search Results</legend>`);
        summaryCardsArr.length = 0;
        $('.js-summary-card').addClass('clip');
        $('.js-summary-card').attr("aria-hidden", "true");
        $('#js-search-form').removeClass('clip');
        $('#js-restart-button').addClass('clip');
        let listSize = $('#js-search-form input[type="text"]').length;
        while (listSize > 2) {
            $('#js-search-form input[type="text"]:last').remove();
            listSize--;
        }
        // console.log(`watchSummary called onFormSubmit`);

    });
    $('.js-summary-card').on('click', 'button', function(event){
        // console.log(`Summary watcher saw the ${this.id} button get clicked.`);
        event.stopPropagation();
        event.preventDefault();
        // console.log(`watchSummary called makeRecipeCard...`)
        makeRecipeCard(this.id);
        $('.js-summary-card').addClass('clip');
        $('.js-summary-card').attr("aria-hidden", "true");
        $('#js-restart-button').addClass('clip');
    });
}

/* End Summary Cards
–––––––––––––––––––––––––––––––––––––––––––––––––– */

/* Make the Recipe Card
-------------------------------------------------- */

function makeRecipeCard(idNum){
    // console.log(`makeRecipeCard ran...`);
    $('.js-recipe-card').empty();
    // console.log(`making api call to make recipe card for: ${idNum}`);
    $.ajax({
        url: `${SPOON_BASE_URL}${idNum}/information?includeNutrition=true`,
        type: 'GET',
        dataType: 'json',
        success: data => {
            $('.js-recipe-card').empty();
            // console.log(`recipe card api call was successful...`);
            // begin filling in recipe card
            $('.js-recipe-card').removeClass('clip')
                .append(`<img src="https://spoonacular.com/recipeImages/${data.id}-556x370.jpg" alt="${data.title}">
                <div class="recipe-card-content">
                    <h3>${data.title}</h3>
                    <table class="js-ingredients-table">
                        <caption>Ingredients:</caption>
                        <tbody class="js-ingredients-list">`);

                //loop through ingredients array
                for (let i=0; i<data.extendedIngredients.length; i++){
                    // abbreviate the units of measurement
                    let abbrvUnit;
                    switch (data.extendedIngredients[i].unit){
                        case 'ounces':
                            abbrvUnit = 'oz';
                            break;
                        case 'cups':
                            abbrvUnit = 'C';
                            break;
                        case 'pound':
                            abbrvUnit = 'lb';
                            break;
                        case 'pounds':
                            abbrvUnit = 'lbs';
                            break;
                        case 'teaspoon':
                            abbrvUnit = 'tsp';
                            break;
                        case 'teaspoons':
                            abbrvUnit = 'tsp';
                            break;
                        case 'tablespoon':
                            abbrvUnit = 'Tbsp';
                            break;
                        case 'fluid ounce':
                            abbrvUnit = 'fl oz';
                            break;
                        case 'ounce':
                            abbrvUnit = 'oz';
                            break;
                        case 'cup':
                            abbrvUnit = 'C';
                            break;
                        case 'pint':
                            abbrvUnit = 'pt';
                            break;
                        case 'quart':
                            abbrvUnit = 'qt';
                            break;
                        case 'gallon':
                            abbrvUnit = 'gal';
                            break;
                        case 'milliliter':
                            abbrvUnit = 'ml';
                            break;
                        case 'liter':
                            abbrvUnit = 'L';
                            break;
                        case 'package':
                            abbrvUnit = 'Pkg'
                            break;
                        case 'tablespoons':
                            abbrvUnit = 'Tbsp'
                            break;
                        case 'servings':
                            abbrvUnit = 'Srvg'
                            break;
                        default:
                            abbrvUnit = data.extendedIngredients[i].unit;
                    }
                    //make table of ingredients
                    $('tbody')
                        .append(`<tr>
                                <td class="js-ingredient-image"><img class="u-max-full-width" alt="${data.extendedIngredients[i].name}"  src="https://spoonacular.com/cdn/ingredients_100x100/${data.extendedIngredients[i].image}"></td>
                                <td class="js-ingredient-serving">${data.extendedIngredients[i].amount} ${abbrvUnit}</td>
                                <td class="js-ingredient-name">${data.extendedIngredients[i].name}</td>
                            </tr>`);
                }
                //close the table
                $('tbody')
                    .append(`</tbody>
                        </table>`);
                //render the instructions
                $('table')
                    .after(`<p class="js-instructions">Instructions:</p>
                            <p>${data.instructions}</p>
                            <span class="js-fabs">
                                <button id="js-prev-button" class="fab fab-action-button fab-action-button__prev" title="Back to Results">Back to Results</button>
                                <button id="js-wine-button" class="fab fab-action-button fab-action-button__wine" title="Wine Reccomendations">Wine Reccomendations</button>
                            </span>
                            <span class="js-credit-text" aria-hidden="true">Image &copy; <a href="${data.sourceUrl}">${data.creditText}</a></span>
                        </div>`);
            // console.log(`makeRecipCard is calling recipeCardListener...`);
            recipeCardListener(data);
        },
        error: apiError,
        beforeSend: setHeader
    });
}

function recipeCardListener(data){
    // console.log(`recipeCardListener is running...`)
    //console.log(data);
    $('#js-prev-button').on('click', function(event){
        event.stopPropagation();
        event.preventDefault();
        $('.js-recipe-card').addClass('clip');
        $('.js-summary-card').removeClass('clip');
        $('.js-summary-card').attr("aria-hidden", "false");
        $('#js-restart-button').removeClass('clip');
        $('.js-recipe-card').empty();
    });

    $('#js-wine-button').on('click', function(event){
        event.stopPropagation();
        event.preventDefault();
        if (data.winePairing.pairingText == "" || data.winePairing.pairingText == undefined || data.winePairing.pairingText == null){
            $('.js-wine-modal')
            .html(`<p>No wines suggested.</p><a href="#close-modal" tabIndex="0" rel="modal:close">Close</a>`)
            .modal({escapeClose: false, clickClose: false});
        } else {
        $('.js-wine-modal')
            .html(`<p>${data.winePairing.pairingText}</p><a href="#close-modal" tabIndex="0" rel="modal:close">Close</a>`)
            .modal({escapeClose: false, clickClose: false});
        }
    });
}



/* Jinkies! - just checking that the script runs.
–––––––––––––––––––––––––––––––––––––––––––––––––– */
function jinkies(){
    console.log(`Jinkies!`)
    $('.loader').hide();
    $(document).ajaxStart(function(){
        $('.loader').show();
    });
    $(document).ajaxStop(function(){
        $('.loader').hide();
    });
    $('.js-summary').empty();
    $('.js-summary').append(`<legend class="clip">Search Results</legend>`);// make sure there aren't any results before search!

    // console.log('Jinkies called increaseFormFields...');
    increaseFormFields(); // We start with 2 by default, so when the app starts, we pre-set 3 into the function.
    // console.log('Jinkies called onFormSubmit...');
    onFormSubmit();



};
$(jinkies);



/* storing svg in a string for readability above. */

const cookTimeImg = `data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6I2YxODcwMTt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPkFydGJvYXJkIDE8L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTE1MC42LDI2NS44N2MtNTAuNDcsMC05MS40NS00MS4zMS05MS40NS05MS40NFMxMDAuNDYsODMsMTUwLjYsODNzOTEuMTIsNDEuNjEsOTEuMTIsOTEuNDMtNDAuNjQsOTEuNDUtOTEuMTIsOTEuNDVaTTIzOC40NCw4NS45MmwtMS0xLDEyLjEyLTE3QTExLjQxLDExLjQxLDAsMCwwLDI0Nyw1Mi40OUwyMzEuODksNDJhMTEuNDEsMTEuNDEsMCwwLDAtMTUuNCwyLjYyTDIwNC4zNiw2MS42N2MtOS44My00LjkyLTIxLTguMi0zMS43OS0xMC40OVYzOC4wN2ExMi41OSwxMi41OSwwLDAsMCwxMi43OC0xMi43OFYxNS43OEExMi41OSwxMi41OSwwLDAsMCwxNzIuNTcsM0gxMjcuMzNhMTIuNTksMTIuNTksMCwwLDAtMTIuNzgsMTIuNzh2OS44M2ExMi41OSwxMi41OSwwLDAsMCwxMi43OCwxMi43OEgxMjhWNTEuNUExMjAuODIsMTIwLjgyLDAsMCwwLDYyLjEsODYuMjUsMTIzLjgsMTIzLjgsMCwwLDAsMjUuNzEsMTc0LjFjMCwzMi43NywxMy4xMSw2NC45LDM2LjM5LDg3Ljg0YTEyMy43NywxMjMuNzcsMCwwLDAsODcuODQsMzYuMzljMzIuNzgsMCw2NC45MS0xMy4xMSw4Ny44NS0zNi4zOWExMjMuNzcsMTIzLjc3LDAsMCwwLDM2LjM5LTg3Ljg0YzAtMzIuNzgtMTIuMTQtNjQuNTctMzUuNzMtODguMThaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTYxLjA4LDE1NC4xYy0yMS4zLTEzLjExLTcxLjQ2LTM4LjM1LTczLjc1LTM5cy00LjkxLDAtNy4yLDIuMjljLTEuNjQsMi4yOS0yLjMsNC45Mi0uNjYsNy4yMWEuNjQuNjQsMCwwLDAsLjY2LjY1YzMuOTMsNS45LDM3LjM1LDQ1LjU1LDUzLjQzLDYyLjYxbDMuMjcsMy4yOGM5LjUsNy41NCwyMy42LDUuOSwzMS40Ny0zLjI4LDcuNTUtOS41LDUuOTEtMjMuNi0zLjI3LTMxLjQ3YTE2LDE2LDAsMCwwLTMuOTUtMi4yOVoiLz48L3N2Zz4=`;

const calorieImg = `data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6bm9uZTtzdHJva2U6IzNkMzQ4YjtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6Ny4wNXB4O30uY2xzLTJ7ZmlsbDojM2QzNDhiO308L3N0eWxlPjwvZGVmcz48dGl0bGU+TnV0cml0aW9uPC90aXRsZT48cmVjdCBjbGFzcz0iY2xzLTEiIHg9IjM3LjIxIiB5PSI3IiB3aWR0aD0iMjI1LjU4IiBoZWlnaHQ9IjI4NSIgcng9IjQxLjYiIHJ5PSI0MS42Ii8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNTguODUsODcuMjVoMTg0djYuMzJoLTE4NFoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik01OC44NSwxMjIuNTdoMTg0djYuMzJoLTE4NFoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik01OC44NSwxOTMuMmgxODR2Ni4zMWgtMTg0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTU4Ljg1LDIyOC41MWgxODR2Ni4zMmgtMTg0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTU4Ljg1LDI2My44MmgxODR2Ni4zMmgtMTg0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTU4Ljg1LDEwMC42M0g5Mi41MnYxNS43OUg1OC44NVoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0yMjYsMTAwLjE3aDE2Ljg1VjExNkgyMjZaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjIwLjE5LDE3MC43OWgyMi42M3YxNS43OUgyMjAuMTlaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjI5LjI0LDIwNi4xMWgxMy41OVYyMjEuOUgyMjkuMjRaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjEzLjE1LDY0Ljg3aDI5LjY2VjgwLjY1SDIxMy4xNVoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik01OC44NSwxMzUuODRoNDcuNzR2MTUuNzlINTguODVaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjI5LjI0LDI0MS40M2gxMy41OXYxNS43OEgyMjkuMjRaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjI5LjI0LDEzNS40OGgxMy41OXYxNS43OUgyMjkuMjRaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNTguODUsMTcxLjA2aDM4LjJ2MTUuNzlINTguODVaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNTguODUsMjA2LjI2aDYwLjMxdjE1Ljc5SDU4Ljg1WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTU4Ljg1LDI0MS40OEg5NC41M3YxNS43OUg1OC44NVoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik01OC44NSwxNTcuODhoMTg0djYuMzJoLTE4NFoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik05Ny4yMiwzMS4wNWMtNy42NywwLTEwLDIuNDgtMTIuNDQsMi40OFM4MCwzMS4wNSw3Mi4zNCwzMS4wNXMtMTMuNDgsOC0xMy40OCwxNi44Niw4LjcxLDI5LjU4LDE4LjI1LDI5LjU4YzUsMCw2LjIyLTEuMjQsNy42Ny0xLjI0czIuNjksMS4yNCw3LjY3LDEuMjRjOS41NCwwLDE4LjI0LTIwLjc0LDE4LjI0LTI5LjU4UzEwNC44OSwzMS4wNSw5Ny4yMiwzMS4wNVoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik04NC43OSwzMS4yMWEzLjE0LDMuMTQsMCwwLDEtMy4xMy0yLjg4QzgxLjM2LDI1LDgyLjYsMTgsODkuMzEsMTUuNTVhMy4xNiwzLjE2LDAsMCwxLDIuMTgsNS45NEM4Ny41NywyMi45Myw4OCwyNy43Niw4OCwyNy44YTMuMTYsMy4xNiwwLDAsMS0yLjg4LDMuNDEsMi42MSwyLjYxLDAsMCwwLS4yOCwwWiIvPjwvc3ZnPg==`;

