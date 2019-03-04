# VeChain App Hub - Submit Form

[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/vechain)

Repository for submitting Awesome VeChain Apps.  

## Process

1. Fork this repo.
2. Create a folder in repo root directory.
3. Name the folder with the `BundleID` of your App.
4. Add `logo.png` as app icon in `png` format.
5. Create `manifest.json` for your app.

    e.g.

     ```json
    {
        "name": "your app name",
        "href": "https://link-to-your-app",
        "desc": "This is an awesome app",
        "tags": []
    }
    ```
6. Create a pull request.
7. Done. Waiting for merge. 

### Explanation

| | |
|-|-|
| *BundleID* | identifier of your app, two dot separated bundle name, only number letters and '-' allowed|
| *name* | app name |
| *href* | link to app |
| *desc* | app description |
| *tags* | tags for app, like topics or keywords |
