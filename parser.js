var app = angular.module('parserApp', []);

app.controller('parserCtrl', ['$scope', '$http', function($scope, $http) {

    $scope.drinks = "";
    var list='{\n"drinkList":\n[';
    var num = 1;
    var count = 1;
    const MAX = 29/*4758*/;

    for (num; num <= MAX; num++) {
        $http.get('http://www.cocktaildb.com/recipe_detail?id=' + num)
            .then(function(response) {
                response = response.data;

                // let's pare down the text we have to deal with each god damn time. 
                // find the beginning and end of the chunk we want, then substring that biz
                var start = response.indexOf('<div id="well">');
                var stop = response.indexOf('<div id="scalingFeatures">');

                response = response.substring(start, stop);

                var temp  = '{\n"name": "';
                // add the name property
                temp += getName(response) + '",\n'; // and the ending quotes, comma, and \n

                // add the ingredients - getIngredients() returns the string including the [] brackets
                temp += '"ingredients": ' + getIngredients(response) + ',\n';

                // add the recipe - getRecipe() returns the string including the [] brackets
                temp += '"recipe": ' + getRecipe(response);

                // if it's the last entry, don't add a comma at the end of the drink object
                temp += (count === MAX) ? '\n}\n' : '\n},\n';

                $scope.drinks += temp;
                //console.log("count = " + count);
                if (count === MAX) {
                    $scope.drinks = list + $scope.drinks + ']\n}';
                }
                count++;
            });
    }

    //list += ']}';// closes array and final bracket of json file

    //$scope.drinks = list;


    function getName(txt) {
        ind = txt.indexOf('h2');
        //console.log("starting index = " + ind);
        end = txt.indexOf('h2', ind + 1);
        return txt.substring(ind + 3, end - 2);
    }

    function getRecipe(txt) {
        var str = '[\n', end, temp, startIndex = 0;

        // look for ingredient names in a loop
        var index = txt.indexOf('<div class="recipe', startIndex);
        while (index >= 0) {
            // find the closing anchor for the ingredient link
            end = txt.indexOf('</div>', index);

            temp = removeHTML( txt.substring(index, end) );

            // add the between text (i.e. ingredient name) to the string
            str += '"' + temp + '"';

            // change the starting index to be after the closing anchor, so the loop progresses
            startIndex = end;
            index = txt.indexOf('<div class="recipe', startIndex);

            // if no more matches are found, don't add a comma
            str += (index < 0) ? '\n' : ',\n';
        }
        // cap off the array string
        str += ']';
        return str;
    }

    function getIngredients(txt) {
        var str = '[\n', end, sub='';

        var ingStart = txt.indexOf('<div class="recipeMeasure">'), recipeStart = txt.indexOf('<div class="recipeDirection">');
        // find whichever tag appears first in the doc, then make that our starting point
        var startIndex = (recipeStart < ingStart) ? recipeStart : ingStart;

        // look for ingredient names in a loop
        var index = txt.indexOf('<a href="ingr_detail?', startIndex);
        while (index >= 0) {
            // find the closing anchor for the ingredient link
            end = txt.indexOf('</a>', index);

            // then modify index, so it's the index of the closing bracket of the first anchor
            index = txt.indexOf('>', index);

            // add the between text (i.e. ingredient name) to the string
            str += '"' + txt.substring(index + 1, end) + '"';

            // change the starting index to be after the closing anchor, so the loop progresses
            startIndex = end;
            index = txt.indexOf('<a href="ingr_detail?', startIndex);

            // if no more matches are found, don't add a comma
            str += (index < 0) ? '\n' : ',\n';
        }
        // cap off the array string
        str += ']';
        return str;
    }

    function getIndicesOf(searchStr, str, caseSensitive) {
        var startIndex = 0, searchStrLen = searchStr.length;
        var index, indices = [];
        if (!caseSensitive) {
            str = str.toLowerCase();
            searchStr = searchStr.toLowerCase();
        }
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        return indices;
    }
    function removeHTML (txt) {
        var startIndex = 0, closeTag;
        var openTag = txt.indexOf('<');
        while (openTag >= 0) {
            closeTag = txt.indexOf('>', openTag);
            //console.log("open tag = " + openTag + " and close = " + closeTag);
            // merge the beginning - beginning of the tag and the character after the tag to the end
            txt = txt.substring(0, openTag) + txt.substring(closeTag + 1);
            //console.log("text = " + txt);

            openTag = txt.indexOf('<');
        }
        return txt;
    }
    function splitIngredients(txt) {
        var closeTag, openTag = txt.indexOf('('), array = [], i = 0;
        while (openTag >= 0) {
            closeTag = txt.indexOf(')', openTag);

            if (txt.substring(0,openTag).match( /[a-z]/i )) {
                array [i] = txt.substring(0,openTag - 1);
                i++;
            }
            // merge the beginning of txt w/ a period then the end
            txt = /*txt.substring(0, openTag) + */ txt.substring(closeTag + 1);

            openTag = txt.indexOf('(');
        }
        return array;
    }
}]);