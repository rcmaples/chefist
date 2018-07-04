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



/*
–––––––––––––––––––––––––––––––––––––––––––––––––– */



/*
–––––––––––––––––––––––––––––––––––––––––––––––––– */



/*
–––––––––––––––––––––––––––––––––––––––––––––––––– */



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
    console.log('Jinkies!');
};
$(jinkies);