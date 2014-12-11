/**
 * Created by hubspot on 11/16/14.
 */
var auctionApp = angular.module('auctionApp', []);

auctionApp.controller('ItemCardsCtrl', function ($scope) {

    $.ajax({
        url: "https://api.parse.com/1/classes/Item",
        type: "GET",
        beforeSend: function(xhr){
            xhr.setRequestHeader('X-Parse-Application-Id', '<your app id>');
            xhr.setRequestHeader('X-Parse-REST-API-Key', '<your REST API key, NOT YOUR CLIENT KEY>');
        },
        success: function(result) {
            $scope.$apply(function(){
                $scope.items = result.results;
                var totalRaised = 0;
                var totalStartPrice = 0;
                var numBids = 0;
                var topBidCount = "";
                var topBidCountCur = 0;
                var topBidAmt = "";
                var topBidAmtCur = 0;
                var highestGrossing = "";
                var highestGrossingCur = 0;

                var noBidCount = 0;

                $scope.items.forEach(function(item) {
                    var gross = 0;
                    item.currentPrice.forEach(function(bidprice) {
                        totalRaised = totalRaised + bidprice;
                        gross = gross + bidprice;
                    });

                    if (item.currentPrice.length == 0) {
                        noBidCount = noBidCount + 1;
                    }

                    numBids = numBids + item.numberOfBids;

                    if (item.numberOfBids > topBidCountCur) {
                        topBidCount = item.numberOfBids + " bids - " + item.name + " by " + item.donorname;
                        topBidCountCur = item.numberOfBids;
                    }

                    if (item.currentPrice[0] > topBidAmtCur) {
                        topBidAmt = "$" + item.currentPrice[0] + ": " + item.name + " by " + item.donorname;
                        topBidAmtCur = item.currentPrice[0];
                    }

                    if (gross > highestGrossingCur) {
                        highestGrossingCur = gross;
                        highestGrossing = "$" + gross + ": " + item.name + " by " + item.donorname;
                    }

                    item.gross = gross;

                    item.bidObjs = [];
                    for (var i = 0; i < item.currentWinners.length; i++) {
                        item.bidObjs.push({"who": item.currentWinners[i], "amt": item.currentPrice[i]});
                    }
                });

                $scope.totalRaised = totalRaised;
                $scope.bidCount = numBids;
                $scope.mostPopularBidCount = topBidCount;

                $scope.mostPopularPrice = topBidAmt;

                $scope.highestGrossing = highestGrossing;
                $scope.itemCount = $scope.items.length;
                $scope.noBidCount = noBidCount;
            });

        }
    });

    $scope.buildCSV = function() {
        var headers = ["item name", "donor name", "winner1", "bid1", "winner2", "bid2", "winner3", "bid3", "winner4", "bid4",
            "winner5", "bid5", "winner6", "bid6", "winner7", "bid7", "winner8", "bid8"];
        var data = [];

        $.each($scope.items, function(idx, item) {
            var name = item.name;
            var donor = item.donorname;

            var winnerName = "";
            var highestBids = "";

            if (item.qty > 1) {
                $.each(getBidsForItem(item.objectId), function(idx, bid) {
                    if (bid && idx < item.qty) {
                        winnerName += bid.name + " [" + bid.email + "] " + ((idx == item.qty - 1) ? "" : " & ");
                        highestBids += bid.amt + ((idx == item.qty - 1) ? "" : " & ");
                    }
                });
            }
            else {
                var bid = getBidsForItem(item.objectId)[0];
                if (bid) {
                    winnerName = bid.name + "[" + bid.email + "]";

                    if (bid.amt)
                        highestBids = bid.amt;
                }
            }

            data.push([name, donor, winnerName, highestBids]);
        });



        var csvContent = "data:text/csv;charset=utf-8,";
        csvContent += headers.join(",") + "\n";
        data.forEach(function(infoArray, index){
            dataString = infoArray.join(",");
            csvContent += dataString + "\n";
        });

        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    };

});

auctionApp.filter('orderObjectBy', function(){
    return function(input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for(var objectKey in input) {
            array.push(input[objectKey]);
        }

        array.sort(function(a, b){
            a = parseInt(a[attribute]);
            b = parseInt(b[attribute]);
            return b - a;
        });
        return array;
    }
});

auctionApp.filter('noFractionCurrency',
    [ '$filter', '$locale',
        function(filter, locale) {
            var currencyFilter = filter('currency');
            var formats = locale.NUMBER_FORMATS;
            return function(amount, currencySymbol) {
                var value = currencyFilter(amount, currencySymbol);
                var sep = value.indexOf(formats.DECIMAL_SEP);
                if(amount >= 0) {
                    return value.substring(0, sep);
                }
                return value.substring(0, sep) + ')';
            };
        } ]);