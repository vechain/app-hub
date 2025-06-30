# VeChain App-Hub - Submit Form

[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://apps.vechain.org/)

First off, thanks for making the awesome app on VeChain and taking the time to contribute 💪

The following is a set of guidelines for contributing to **AppHub**. These
are just guidelines, not rules. Use your best judgment and feel free to propose changes to this document in a pull request.

## Rules

1. The app must run on Mainnet
2. Logo is required
3. The id must be unique
4. Short and simple descriptions
5. Comply with directory & contents rules
6. One application per submission

## Adding your app

To add your application, you need to create your app details and make a pull request for the maintainers to review your app and merge into AppHub.

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
- [Tutorial: How to make your first pull request on Github by _Thanoshan MV_](https://www.freecodecamp.org/news/how-to-make-your-first-pull-request-on-github-3/)

### Create a directory

Once the AppHub is forked, create a new directory in the `apps` directory with unique id and include a `manifest.json` file and `logo.png` file. To create a unique id, you can append the name of the application to the reversed domain such as `com.example.your-app-name`. Your app directory structure should be look like this

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
    "category": "utilities",
    "tags": ["tools","development"],
    "repo": "https://github.com/example/projectName",
    "contracts": [
        "0x1234567890123456789012345678901234567890",
        "0x0987654321098765432109876543210987654321"
    ],
    "isVeWorldSupported": false,
    "veBetterDaoId": "0x821a9ae30590c7c11e0ebc03b27902e8cae0f320ad27b0f5bde9f100eebcb5a7"
}
```

- `name` is **required**.
- `href` is **required**, and must be a fully-qualified URL.
- `desc` is **required**.
- `category` is **required**, and must be one of the provided category.
- `tags` is **required**, should be **_an array_** if provided.
- `isVeWorldSupported` is **required**, set this to true if your dApp supports the VeWorld browser extension, enabling its use within the VeWorld mobile wallet. Your dApp will then be listed in the dApp section of the VeWorld mobile discovery.
- `repo` is _optional_, and must be a fully-qualified URL.
- `contracts` is _optional_, should be **_an array_** and **_lower cases_** if provided
- `veBetterDaoId` is _optional_, it represents the ID of the VeBetterDAO DApp.
- No fields should be left blank.

### Categories

`category` is required and must be one of the following values:

- collectibles
- defi
- games
- marketplaces
- utilities

### VeBetterDAO ID

The `veBetterDaoId` is the `keccak356` hash of the name of the app. You can generate it with the following TypeScript snippet using `@vechain/sdk-core`

```typescript
import { Keccak256, Txt } from '@vechain/sdk-core'

const APP_NAME = '<your-app-name>'

const bytes = Txt.of(APP_NAME).bytes
const hash = Keccak256.of(bytes)

console.log(hash.toString())
```

or using Solidity

```solidity
function hashAppName(string memory appName) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(appName));
}
```


### Import the Logo & Rules

Import your app logo into the directory and name it `logo`.

> A logo is a symbol made up of text and images that identifies an application.

- Must be a `.png`
- Must be `512px by 512px`
- Must **not** be a copy of another company's or application's logo
- Must **not** contain any marketing information (including but not limited to social media links/sale date)

### Submission Guidelines

- **The pull request should have a clean git history.**
- Don't use another company's trademarks (icon, logo or name) without supplying evidence of prior permission
- Create a directory under `/apps/` and contains the _manifest.json_ and the _logo.png_
- Keep description short and simple, but descriptive.
- Check your spelling and grammar.
- URL must have schemes of **_http_** or **_https_**.
- Logo complies with the logo rules

> If the maintainers/reviewer notice anything that we'd like changed, we'll ask you to edit your PR before we merge it.

## Last but not least

When users interact with your application, the function names and parameters are encoded as hex values in clause data field which is not very human-readable. You can submit the ABIs on [b32](https://github.com/vechain/b32) to help the user understand more about the interaction details.
