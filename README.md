# VeChain App-Hub - Submit Form

[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://apps.vechain.org/)

App-Hub is a platform that makes your VeChain App easily discovered worldwide. Once the pull request has been merged, your app will be shown in the App-Hub.

## Requirements :
1. The app must run in Mainnet
2. Support [Connex](https://connex.vecha.in/#/)
3. Logo is required 
4. The id must be unique 
5. Clear description 
6. Comply with directory & contents rules

## Getting Ready for Submission
### Fork App-Hub
Forking a repository allows you to create your app details and send a pull request for the maintainers to review and merge into app-hub.
### Generate Your App Information
1. Create a directory in [apps](https://github.com/vechain/app-hub/tree/master/apps) and named the directory with unique **id**.

> To create a unique id, you append the name of the application to the reversed domain,E.g., `com.example.your-app-name`.

```
├── apps
│   └── com.example.your-app-name
│       ├── logo.png
│       └── manifest.json
```

2. Import your app logo into the directory and named it `logo`.(image must be `png` format and `512x512` pixel size)

3. Generate a mainifest.json file includes app details.

```
    {
        "name": "your app name",
        "href": "https://link-to-your-app",
        "desc": "This is an awesome app",
        "tags": []
    }
```
    
### Making a Pull Request / Submit Your App
After [Create a pull request](https://help.github.com/en/articles/creating-a-pull-request), your pull request will be reviewed by maintainers. Once the review is completed, your app will be merged into the base branch.

