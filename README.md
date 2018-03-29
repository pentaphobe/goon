# goon - helps collect your (technical) debts

Goon is a wrapper around [eslint][eslint-home] which helps measure and track some aspects of technical debt in projects

It provides the ability to specify custom weights for eslint rules, and collate the totals into reportable values which (ideally) more accurately reflect the debt and effort accumulation in a project.



**NB: *Highly* WIP and has been developed merely as a helper on a client project**

> _goon n._
>
> 1. A hired thug, often in debt collection
>
> 2. A deliberately foolish person
>
> 3. A bag of - usually very cheap - wine


## Installation

just the standard:

`yarn add github:pentaphobe/goon`

or `npm install github:pentaphobe/goon`

You can probably install this globally using `yarn global add github:pentaphobe/goon` but I've not tried


## Usage

The package adds a command to your project's `node_modules/.bin/` directory which you can run with

`yarn goon` or `npm run goon`

```
Usage: goon [options] [<files or paths> ...]

Options:

  -v,--verbose             verbose error output
  -f,--full                show full statistics per file
  --show-unweighted-rules  lists all rules which lack a weighting
  -n,--no-report           don't write to the history report log
  -w,--watch               stay active and recalculate debt on file changes
  -h, --help               output usage information
```


## Current Features

- [x] works on my machine
- [x] stores report history as JSONL
- [x] watch mode for updating metrics when files change
  - (was needed for large projects where full analysis is prohibitively slow)
- [x] basic tabular cli reporter

## Roadmap

- [ ] better developer setup experience
- [ ] HTML reporter
- [ ] refactor to better expose custom filters, reporters, etc...
- [ ] some additional custom eslint rules
  - [ ] disallow `className` prop _unless_ styled-components is in use
  - [ ] max _flattened_ JSX complexity (as opposed to depth)
  - [ ] max _non-component_ HTML complexity/depth in JSX
  - [ ] max complexity/length of templated code in JSX
