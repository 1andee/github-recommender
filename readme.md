# Github Recommender
Based on code written for my [Github Avatar Downloader](https://github.com/1andee/github-avatar-downloader) project.

## Challenge
Build a command-line HTTP client that, when given a target repo, recommends 5 repos (based on the most starred repos by the contributors to the target repo).

## Known Limitations
- Starred repos are examined for the top 30 contributors of a given project (based on # of commits).
- Recommendations are based on the 100 most-recently starred repos for each contributor.

## Usage
1. Fork and clone this repository.
2. Run `npm install` to install the required dependencies.
3. Create .env file with your GitHub credentials & token based on .env.example
4. Execute the program from the command line in the following manner:  
   ```node recommend.js <account> <reponame>```

   Any valid repo-owner & repo combination can be used, for example:  
   ```node recommend.js lighthouse-labs laser_shark```  
   ```node recommend.js wearehive project-guidelines```

## Dependencies
- dotenv
- request

## User Stories
As a GitHub user, I want to explore the tools, libraries, and repos that the contributors of a given project find interesting.
