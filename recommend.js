require('dotenv').config();
var https = require('https');
var request = require('request');
var fs = require('fs');

// User's GitHub username and API token required:
var GITHUB_USER = process.env.GITHUB_USER;
var GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Error handling for .env params
if (!process.env.GITHUB_USER ||
  !process.env.GITHUB_TOKEN ) {
    console.log("=============================================================")
    console.log("Error: Your GitHub username & token are required in .env file");
    console.log("=============================================================")
    return;
  };

  // Takes the user-supplied account and repo from Command Line to generate request:
  var userInput = process.argv.slice(2);
  var githubAccount = userInput[0];
  var githubRepo = userInput[1];
  var i = 0;

  // Error handling for user-supplied account/repo params
  if (userInput.length !== 2) {
    console.log('============================================================')
    console.log('Error: Please provide a valid GitHub account and Repository.');
    console.log('       The required inputs are: <owner> <repo>');
    console.log('============================================================')
    return;
  };

  console.log(`\n==================================
    \nWelcome to the GitHub Recommender!
    `);

    getRepoContributors = (owner, repo, callback) => {

      // Creates URL for HTTP GET Request using requestor's username and API token
      // and desired repository account / repo name to pull contributors from:
      var requestURL = 'https://'+ GITHUB_USER + ':' + GITHUB_TOKEN + '@api.github.com/repos/' + owner + '/' + repo + '/contributors';

      // Assigns the URL and User-Agent for GET request:
      var options = {
        'url': requestURL,
        'method': 'GET',
        'headers': {
          'User-Agent': 'GitHub Contributor Lookup - LHL Student Project'
        }
      };

      request(options, ((error, response, body) => {
        if (error) {
          console.log(error);
        };
        // Parses JSON body and assigns to 'users' variable:
        var users = JSON.parse(body);

        // Passes JSON data as response into getRepoContributors():
        callback(null, users);
      }));
    };

    // Iterates through JSON data, passing user ID into lookupStarredRepos():
    getRepoContributors(githubAccount, githubRepo, ((error, response) => {
      if (error) {
        throw error;
        return;
      };

      if (response.message === 'Not Found') {
        console.log('==================================================')
        console.log('Error: That account/repository couldn\'t be found.');
        console.log('       Please try again.');
        console.log('==================================================')
        return;
      };

      if (response.message === 'Bad credentials') {
        console.log('========================================================')
        console.log('Error: Your GitHub API token wasn\'t recognized.');
        console.log('       Change the token in your .env file and try again.');
        console.log('========================================================')
        return;
      };

      let contributors = [];

      response.forEach((response) => {
        contributors.push(response.login);
      });

      console.log(`\nSourcing starred repos for the following contributors:
        \n${contributors.join(', ')}
        \n(Total ${contributors.length})
        \n==================================
        `);

        // Call lookupStarredRepos() function with list of contributors
        // Passes list of starred repos to returnSort() once all are retrieved
        lookupStarredRepos(contributors, ((error, response) => {
          if (error) {
            throw error;
          };

          // Checks whether # of lookups matches # of contributors
          if (response.round === contributors.length) {
            console.log(`Finished!\n`)
            console.log(`Here's what we found that might be of interest:\n`)

            // Passes response.data (placeholderObj) to returnSort()
            // for sorting by popularity and output to console
            returnSort(response.data);
          };

        }));

      }));

      // Takes array of contributors and makes API call to retrieve starred repos for each
      lookupStarredRepos = (users, callback) => {

        // Track number of times the callback is made
        var placeholderObj = { round: 0, data: {} };
        let i = 0;

        // Iterate through every contributor
        users.forEach((e) => {

          // Creates URL for HTTP GET Request using requestor's username and API token
          let starredUrl = `https://${GITHUB_USER}:${GITHUB_TOKEN}@api.github.com/users/${e}/starred?per_page=100`;

          var options = {
            'url': starredUrl,
            'method': 'GET',
            'headers': {
              'User-Agent': 'GitHub Recommendations - LHL Student Project'
            }
          };

          // Executes GET request,
          request(options, ((error, response, body) => {

            // Track number of requests made
            i++;
            placeholderObj.round = i;

            if (error) {
              throw error;
            };

            // Parses JSON body
            var starredItem = JSON.parse(body);

            // Makes sure the contributor actually has starred repos
            if (starredItem.length > 0) {

              // Iterate through each starred repo, storing the full_name
              // and total # of instances in placeholderObj.data
              starredItem.forEach((e) => {
                let name = e.full_name;
                let placeholder = placeholderObj.data;

                // Track instances of each starred item
                if (placeholder[name] == undefined) {
                  placeholder[name] = 1;
                } else {
                  placeholder[name]++;
                };
              });
            };

            console.log("Working.....\n")

            // Returns placeholderObj as callback response
            callback(null, placeholderObj);
          }));
        });
      };

      // Sort all starred items by popularity
      returnSort = (object) => {

        var sortable = [];
        for (var x in object) {
          sortable.push([x, object[x]]);
        };

        sortable.sort(function(a, b) {
          return b[1] - a[1];
        });

        // Return only the top 5 repos
        var sliced_array = sortable.slice(0, 5);

        // Log the top 5 starred repos to console
        for (i in sliced_array) {
          console.log(`[ ${sliced_array[i][1]} stars ] ${sliced_array[i][0]}`);
        };

        console.log(`
          \n
          Task completed. Have a nice day!
          \n
          `);

      };
