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


console.log('\n\nWelcome to the GitHub Recommender! Commencing lookup in 3...2...1...\n');

getRepoContributors = (owner, repo, callback) => {

  // Creates URL for HTTP GET Request using requestor's username and API token
  // and desired repository account / repo name to pull thumbnails from:
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

// Iterates through JSON data, passing avatar URL and user ID into downloadImageByURL():
getRepoContributors(githubAccount, githubRepo, ((error, response) => {
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

  if (error) {
    throw error;
    return;
  };

  let contributors = [];

  response.forEach((response) => {
    contributors.push(response.login);
  });

  console.log(`Sourcing starred repos for the following contributors:
              \n===========
              \n${contributors.join(', ')}
              \n===========`);

  lookupStarredRepos(contributors, ((error, response) => {
    returnSort(response);
  }));

}));

lookupStarredRepos = (users, callback) => {

  var placeholderObj = {};

  users.forEach((e) => {
    let starredUrl = `https://${GITHUB_USER}:${GITHUB_TOKEN}@api.github.com/users/${e}/starred`;

    var options = {
      'url': starredUrl,
      'method': 'GET',
      'headers': {
        'User-Agent': 'GitHub Recommendations - LHL Student Project'
      }
    };

    request(options, ((error, response, body) => {

      if (error) {
        console.log(error);
      };
      // Parses JSON body
      var starredItem = JSON.parse(body);

      if (starredItem.length > 0) {
        starredItem.forEach((e) => {
          let name = e.full_name;
          if (placeholderObj[name] == undefined) {
            placeholderObj[name] = 1;
          } else {
            placeholderObj[name]++;
          };
        });
      };
      callback(null, placeholderObj);
    }));
  });
};

returnSort = (object) => {

  if (Object.getOwnPropertyNames(object).length == 0) {
    return;
  };

  var sortable = [];
  for (var x in object) {
    sortable.push([x, object[x]]);
  };

  sortable.sort(function(a, b) {
    return b[1] - a[1];
  });

  var sliced_array = sortable.slice(0, 5);

  for (i in sliced_array) {
    console.log(`[ ${sliced_array[i][1]} stars ] ${sliced_array[i][0]}`);
  };
  console.log('===========')

};
