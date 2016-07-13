const name = 'mixedCompany';

app = angular.module(name, []);

app.filter('possibleDrinks', () => {
    return PossibleDrinks;
});

app.filter('ingredientSearch', () => {
    return IngredientSearch;
});

app.controller('mixedController', ['$http', function($http) {
       vm = this;
       vm.search = "";
       vm.availableLiquors = [];
       vm.liquorList = [];
       vm.drinks = [];
       
       // get the list of drinks, then iterate through their ingredients list
       $http.get('listOfDrinks.json').then(function(response) {
           for (var i = 0; i < response.data.drinkList.length; i++) {
               for (var j = 0; j < response.data.drinkList[i].ingredients.length; j++) {
                   // if the ingredient doesn't yet exist in liquorList, push it
                   if (vm.liquorList.indexOf(response.data.drinkList[i].ingredients[j]) < 0) {
                        vm.liquorList.push(response.data.drinkList[i].ingredients[j]);
                   }
               }
           }
           vm.drinks = response.data.drinkList;
           for (i = 0; i < vm.liquorList.length; i++) {
               vm.liquorList[i] = {
                   'name': vm.liquorList[i],
                   'selected': false
               };
           }
       });

    // vm OPERATES WITH ONLY THE NAMES
    // OTHERWISE IT WILL HAVE COMPARISON ISSUES IF OBJECT PROPERTIES ARE DIFFERENT
    vm.addLiquor = function(liquor) { 
        var index = vm.availableLiquors.indexOf(liquor.name);
        if (index < 0) {
            vm.availableLiquors.push(liquor.name);
            liquor.selected = true;
        } else {
            vm.availableLiquors.splice(index, 1);
            liquor.selected = false;
        }
    }

    vm.showRecipe = function(drink) {
        if (!drink) {
            console.log("Error - No drink selected");
            return false;
        }

        drink.recipeVisible = (drink.recipeVisible) ? false : true;
    }
}]);

// now a function for the Filter 
function PossibleDrinks(drinks, available) {
    if (!drinks) {
        return false;
    }

    var possibilities = [], canMake = true;
    //console.log("Available liquors in filter = " + available);

    for (var i = 0; i < drinks.length; i++) {
        // default to "yes" we're able to make the drink
        canMake = true;
        drinks[i].missing = "";
        // if all the ingredients of the drink are selected
        //console.log("drink" + i + "'s ingredients = " + drinks[i].ingredients);
        
        for (var j = 0; j < drinks[i].ingredients.length; j++) {
            if (available.indexOf(drinks[i].ingredients[j]) < 0) {
                //console.log("Can't make a " + drinks[i].name);
                if (drinks[i].missing) {
                    canMake = false;
                    break;
                }
                drinks[i].missing = drinks[i].ingredients[j];
            }
        }
        // if we didn't break out of the loop, that means we can make the drink
        // so add it to the drink list
        if (canMake) {
            possibilities.push(drinks[i]);
        }
    }
    return possibilities;
}

// a function for the ingredientSearch filter
function IngredientSearch(ingredients, search) {
    if (!ingredients) {
        return false;
    }

    var possibilities = [];

    for (var i = 0; i < ingredients.length; i++) {
        if (typeof ingredients[i] === "object") {
            // if the search term is found in the liquor or in its "name" property if it's been turned into an object
            if (ingredients[i].name.indexOf(search) >= 0) {
                possibilities.push(ingredients[i]);
            }
        }
        if (typeof ingredients[i] === "string") {
            if (ingredients[i].indexOf(search) >= 0) {
                possibilities.push(ingredients[i]);
            }
        }
    }
    return possibilities;
}
