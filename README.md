BidHub Web Administration
===================
Small little web app to see the current status, item winners, and some neat stats for a BidHub auction. BidHub is HubSpot's open-source silent auction app - for an overview of the project, [check out our blog post about it](http://dev.hubspot.com/blog/building-an-auction-app-in-a-weekend)!

This will be entirely useless to you if you haven't set up Parse and followed the instructions in the [BidHub Cloud Code repository](https://github.com/HubSpot/BidHub-CloudCode).

![Screenshot](http://i.imgur.com/0hPpRLBl.png)

## Setup
Assuming you've already set up Parse, get your application ID and REST API key (not your client key) from Parse > Settings > Keys. Then, just `git clone` this repository and edit *controllers.js*, replacing `<your app id>` and `<your REST API key>` with the appropriate values. 

Open index.html in Chrome and you're good to go! Put this on any web server for easy access.
