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
    let arrState = 0;
    for (let i=0; i<2; i++) { //TODO: Set back to i<data.length)
        console.log(`inner arrState = ${arrState}`);
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
                summaryCardsArr[i]["summary"] = `${response.summary.slice(0,608)}`; // TODO: remove slice;

                $.ajax({
                    url: `${SPOON_BASE_URL}${data[i].id}/information?includeNutrition=true`,
                    type: 'GET',
                    dataType: 'json',
                    success: function (response) {
                        arrState++;
                        summaryCardsArr[i]["calories"] = Math.round(response.nutrition.nutrients["0"].amount);
                        summaryCardsArr[i]["cookTime"] = response.readyInMinutes;
                        console.log(`arrState = ${arrState}`);

                        if (arrState == data.length){
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

        // populate time in minutes / caloris

    }

}

/* Summary Cards Results Rendered as LIs.
-------------------------------------------------- */
function displaySummaryResults(arr){
    for (let i=0; i<arr.length; i++){
        $(".js-summary-card").append(`
            <li class="summary-card" id="${arr[1].id}">
                <img src="https://spoonacular.com/recipeImages/${arr[i].id}-556x370.jpg" alt="${arr[i].title}">
                <div class="summary-card-content">
                    <h3>${arr[i].title}</h3>
                    <ul class="summary-card-specs">
                        <li>
                            <img class="specs" alt="Cook Time" src="${cookTimeImg}">
                            <p>${arr[i].cookTime}</p>
                        </li>
                        <li>
                            <img class="specs" alt="Number of Calories" src="${calorieImg}">
                            <p>${arr[i].calories} calories per serving</p>
                        </li>
                    </ul>
                    ${arr[1].summary}
                </div>
            </li>
        `);
    }
}



/* Toss "Similar recipes ..." from the end of summary
–––––––––––––––––––––––––––––––––––––––––––––––––– */
// function getRidOfSimilar (myStr) {
//     //let myStr = myStr;
//     //console.log(myStr);
//     let newStr = myStr.substring(0, (myStr.indexOf("Similar")-1));
//     newStr += "</p>";
//     //console.log(newStr);
//     return(newStr);
// }

/* Summary Card Event Watcher
-------------------------------------------------- */

function watchSummary(){
    console.log('watching');
    $("li").click(function(event){
        event.PreventDefault;
        event.stopPropagation;
        alert("HI");
        // makeRecipeCard(event.id)
    });
}

/* End Summary Cards
–––––––––––––––––––––––––––––––––––––––––––––––––– */

/* Make the Recipe Card
-------------------------------------------------- */

makeRecipeCard(idNum){

    //call ajax might be able to use callApi here.
    $.ajax({
        url: `${SPOON_BASE_URL}${didNum}/information?includeNutrition=true`,
        type: 'GET',
        dataType: 'json',
        success:
        error: apiError,
        beforeSend: setHeader
    });

    /*place static peices into html via jquery
        image / alt
        title
    */

    $('.js-recipe-card').append(`
    <img src="https://spoonacular.com/recipeImages/${data.id}-556x370.jpg" alt="${data.title}">
    <div class="recipe-card-content">
        <h3>${data.title}</h3>
        <table class="js-ingredients-table">
            <caption>Ingredients:</caption>
            <tbody class="js-ingredients-list">` // <-- remove that back tick

    // loop through ingredients array and fill list
    // may be stand alone function
    // extendedIngredients[i].image
    // extendedIngredients[i].amount
    // extendedIngredients[i].unit
    // extendedIngredients[i].name
    //----------------
            // $('.js-ingredients-list').append(
            // <tr>
            //   <td class="js-ingredient-image"><img alt="" class="u-max-full-width" src="https://spoonacular.com/cdn/ingredients_100x100/${extendedIngredients[i].image}"></td>
            //   <td class="js-ingredient-serving">${extendedIngredients[i].amount} ${extendedIngredients[i].unit}</td>
            //   <td class="js-ingredient-name">${extendedIngredients[i].name}</td>
            // </tr>
            // `); remove the tick mark on 347
            `</tbody>
        </table>
        <p class="js-instructions">Instructions:</p>`
        // append instructions after the .js-instructions p element
        // $('.js-instructions').after(`
        //     ${data.instructions}
        // `);
        `<span class="js-credit-text">Image &copy; <a href="${data.sourceUrl}">${data.creditText}</a></span>
    </div>
    `)


}


/* Jinkies! - just checking that the script runs.
–––––––––––––––––––––––––––––––––––––––––––––––––– */
function jinkies(){
    watchSummary();
    $('.js-summary-card').empty(); // make sure there aren't any results before search!
    increaseFormFields(3); // We start with 2 by default, so when the app starts, we pre-set 3 into the function.
    onFormSubmit();
    console.log('Jinkies!');
};
$(jinkies);



/* storing svg in a string for readability above. */

const cookTimeImg = `data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6I2YxODcwMTt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPkFydGJvYXJkIDE8L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTE1MC42LDI2NS44N2MtNTAuNDcsMC05MS40NS00MS4zMS05MS40NS05MS40NFMxMDAuNDYsODMsMTUwLjYsODNzOTEuMTIsNDEuNjEsOTEuMTIsOTEuNDMtNDAuNjQsOTEuNDUtOTEuMTIsOTEuNDVaTTIzOC40NCw4NS45MmwtMS0xLDEyLjEyLTE3QTExLjQxLDExLjQxLDAsMCwwLDI0Nyw1Mi40OUwyMzEuODksNDJhMTEuNDEsMTEuNDEsMCwwLDAtMTUuNCwyLjYyTDIwNC4zNiw2MS42N2MtOS44My00LjkyLTIxLTguMi0zMS43OS0xMC40OVYzOC4wN2ExMi41OSwxMi41OSwwLDAsMCwxMi43OC0xMi43OFYxNS43OEExMi41OSwxMi41OSwwLDAsMCwxNzIuNTcsM0gxMjcuMzNhMTIuNTksMTIuNTksMCwwLDAtMTIuNzgsMTIuNzh2OS44M2ExMi41OSwxMi41OSwwLDAsMCwxMi43OCwxMi43OEgxMjhWNTEuNUExMjAuODIsMTIwLjgyLDAsMCwwLDYyLjEsODYuMjUsMTIzLjgsMTIzLjgsMCwwLDAsMjUuNzEsMTc0LjFjMCwzMi43NywxMy4xMSw2NC45LDM2LjM5LDg3Ljg0YTEyMy43NywxMjMuNzcsMCwwLDAsODcuODQsMzYuMzljMzIuNzgsMCw2NC45MS0xMy4xMSw4Ny44NS0zNi4zOWExMjMuNzcsMTIzLjc3LDAsMCwwLDM2LjM5LTg3Ljg0YzAtMzIuNzgtMTIuMTQtNjQuNTctMzUuNzMtODguMThaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTYxLjA4LDE1NC4xYy0yMS4zLTEzLjExLTcxLjQ2LTM4LjM1LTczLjc1LTM5cy00LjkxLDAtNy4yLDIuMjljLTEuNjQsMi4yOS0yLjMsNC45Mi0uNjYsNy4yMWEuNjQuNjQsMCwwLDAsLjY2LjY1YzMuOTMsNS45LDM3LjM1LDQ1LjU1LDUzLjQzLDYyLjYxbDMuMjcsMy4yOGM5LjUsNy41NCwyMy42LDUuOSwzMS40Ny0zLjI4LDcuNTUtOS41LDUuOTEtMjMuNi0zLjI3LTMxLjQ3YTE2LDE2LDAsMCwwLTMuOTUtMi4yOVoiLz48L3N2Zz4=`;

const calorieImg = `data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6bm9uZTtzdHJva2U6IzNkMzQ4YjtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6Ny4wNXB4O30uY2xzLTJ7ZmlsbDojM2QzNDhiO308L3N0eWxlPjwvZGVmcz48dGl0bGU+TnV0cml0aW9uPC90aXRsZT48cmVjdCBjbGFzcz0iY2xzLTEiIHg9IjM3LjIxIiB5PSI3IiB3aWR0aD0iMjI1LjU4IiBoZWlnaHQ9IjI4NSIgcng9IjQxLjYiIHJ5PSI0MS42Ii8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNTguODUsODcuMjVoMTg0djYuMzJoLTE4NFoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik01OC44NSwxMjIuNTdoMTg0djYuMzJoLTE4NFoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik01OC44NSwxOTMuMmgxODR2Ni4zMWgtMTg0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTU4Ljg1LDIyOC41MWgxODR2Ni4zMmgtMTg0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTU4Ljg1LDI2My44MmgxODR2Ni4zMmgtMTg0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTU4Ljg1LDEwMC42M0g5Mi41MnYxNS43OUg1OC44NVoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0yMjYsMTAwLjE3aDE2Ljg1VjExNkgyMjZaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjIwLjE5LDE3MC43OWgyMi42M3YxNS43OUgyMjAuMTlaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjI5LjI0LDIwNi4xMWgxMy41OVYyMjEuOUgyMjkuMjRaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjEzLjE1LDY0Ljg3aDI5LjY2VjgwLjY1SDIxMy4xNVoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik01OC44NSwxMzUuODRoNDcuNzR2MTUuNzlINTguODVaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjI5LjI0LDI0MS40M2gxMy41OXYxNS43OEgyMjkuMjRaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjI5LjI0LDEzNS40OGgxMy41OXYxNS43OUgyMjkuMjRaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNTguODUsMTcxLjA2aDM4LjJ2MTUuNzlINTguODVaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNTguODUsMjA2LjI2aDYwLjMxdjE1Ljc5SDU4Ljg1WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTU4Ljg1LDI0MS40OEg5NC41M3YxNS43OUg1OC44NVoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik01OC44NSwxNTcuODhoMTg0djYuMzJoLTE4NFoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik05Ny4yMiwzMS4wNWMtNy42NywwLTEwLDIuNDgtMTIuNDQsMi40OFM4MCwzMS4wNSw3Mi4zNCwzMS4wNXMtMTMuNDgsOC0xMy40OCwxNi44Niw4LjcxLDI5LjU4LDE4LjI1LDI5LjU4YzUsMCw2LjIyLTEuMjQsNy42Ny0xLjI0czIuNjksMS4yNCw3LjY3LDEuMjRjOS41NCwwLDE4LjI0LTIwLjc0LDE4LjI0LTI5LjU4UzEwNC44OSwzMS4wNSw5Ny4yMiwzMS4wNVoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik04NC43OSwzMS4yMWEzLjE0LDMuMTQsMCwwLDEtMy4xMy0yLjg4QzgxLjM2LDI1LDgyLjYsMTgsODkuMzEsMTUuNTVhMy4xNiwzLjE2LDAsMCwxLDIuMTgsNS45NEM4Ny41NywyMi45Myw4OCwyNy43Niw4OCwyNy44YTMuMTYsMy4xNiwwLDAsMS0yLjg4LDMuNDEsMi42MSwyLjYxLDAsMCwwLS4yOCwwWiIvPjwvc3ZnPg==`;

