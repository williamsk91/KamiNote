# KamiNote

KamiNote is the frontend codebase for Kaminote project.

# Stack

- Language - [Typescript](https://www.typescriptlang.org/)
- Framework - React ([CRA](https://create-react-app.dev/))
- GraphQL - [Apollo](https://www.apollographql.com/docs/react/api/react-apollo/)
- Styling - [styled-components](https://styled-components.com/)
- Editor - [Prosemirror](https://prosemirror.net/)

# Getting started

The following will set you up for development.

## Installation

First, install dependencies

```
yarn
```

## Start development

This will launch the website in [http://localhost:3000/](http://localhost:3000/)

```
yarn start
```

## Component library

Component library, including documentation is set up using [Storybook](https://storybook.js.org/)

```
yarn storybook
```

## GraphQL typings

GraphQL typing should not be done manually, instead be generated using [codegen](https://graphql-code-generator.com/)

```
yarn codegen
```

Note: Ink (backend codebase) has to also be up (see `codegen.yml`)

# Editor

The editor is made using [Prosemirror](https://prosemirror.net/) and currently supports many custom nodes and marks accessible through [Markdown](https://www.markdownguide.org/basic-syntax/) syntax.

````
# Heading 1
## Heading 2
### Heading 3

--- Divider
``` Code Block
> Blockquote

[] Checklist
- Bullet List
1. Number List (or, any number + ".")

*bold* bold
_italic_ italic
--strike-- strike
`code` code
[link](url) link

{c:color} color
{h:color} highlight
note: color can be one of the following red, orange, yellow, green, blue, purple, pink

````

# Deployment

Master branch is automatically deployed using Github action. It is deployed to [AWS S3](https://aws.amazon.com/s3/) bucket and distributed using [AWS Cloudfront](https://aws.amazon.com/cloudfront/) under [https://app.kaminote.io/](https://app.kaminote.io/).

See `.github/workflows/cicd.yml` for more information.
