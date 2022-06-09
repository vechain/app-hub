# VeChain App-Hub - Submit Form

[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://apps.vechain.org/)

First off, thanks for making the awesome app on VeChain and taking the time to contribute 💪

The following is a set of guidelines for contributing to **AppHub**. These
are just guidelines, not rules. Use your best judgment and feel free to propose changes to this document in a pull request.

## Rules
1. The app must run on Mainnet
2. Support [Connex](https://connex.vecha.in/#/)
3. Logo is required 
4. The id must be unique 
5. Short and simple descriptions 
6. Comply with directory & contents rules
7. One application per submission

## Adding your app
To add your application , it required you to create your app details and make a pull request for the maintainers to review your app and merge into AppHub.

Recommended workflow:
- Fork the AppHub
- Create a new branch
- Create your app details and upload to the proper directory
- Make the pull request

Ref: 
- [Fork a repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
- [Clone a repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo#cloning-your-forked-repository)
- [Creating a new branch](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-and-deleting-branches-within-your-repository#creating-a-branch)
- [Create a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
- [Tutorial: How to make your first pull request on Github by *Thanoshan MV*](https://www.freecodecamp.org/news/how-to-make-your-first-pull-request-on-github-3/)
### Create a directory
Once the AppHub is forked, create a new directory in the `apps` directory with unique id and include a `manifest.json` file and `logo.png` file. To create a unique id, you can append the name of the application to the reversed domain such as  `com.example.your-app-name`.  Your app directory structure should be look like this

```
├── apps
│   └── com.example.your-app-name
│       ├── logo.png
│       └── manifest.json
```

### Create a JSON File & Rules
Create a `manifest.json` file includes app details.

```
//manifest.json
{
    "name": "your app name",
    "href": "https://link-to-your-app",
    "desc": "This is an awesome app",
    "category": "utilities"
    "tags": ["tools","development"],
    "repo": "https://github.com/example/projectName",
    "contracts": [
        "0x1234567890123456789012345678901234567890",
        "0x0987654321098765432109876543210987654321"
    ]
}
```

- `name` is **required**.
- `href` is **required**, and must be a fully-qualified URL.
- `desc` is **required**.
- `category` is **required**, and must be one of the provided category.
- `tags` is **required**, should be ***an array*** if provided.
- `repo` is *optional*, and must be a fully-qualified URL.
- `contracts` is *optional*, should be ***an array*** and ***lower cases*** if provided
- No fields should be left blank.

### Categories
`category` is required and must be one of the following values:

- collectibles
- defi
- games
- marketplaces
- utilities

### Import the Logo & Rules
Import your app logo into the directory and named it `logo`.

- Must be a `.png`
- Must be `512px by 512px`
- Must **not** be a copy of another company's or application's logo

### Submission Guidelines
- **The pull request should have a clean git history.**
- Don't use another company's trademarks (icon, logo or name) without supplying evidence of prior permission
- Create a directory under `/apps/` and contains the *manifest.json* and the *logo.png*
- Keep description short and simple, but descriptive.
- Check your spelling and grammar.
- URL must have schemes of ***http*** or ***https***.
- Logo must ***512px by 512px*** and ***.png*** file format

> If the maintainers/reviewer notice anything that we'd like changed, we'll ask you to edit your PR before we merge it. 

## Last but not least
When users interact with your application, the function names and parameters are encoded as hex values in clause data field which is not very human-readable. You can submit the ABIs on [b32](https://github.com/vechain/b32) to help the user understand more about the interaction details.
