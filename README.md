# `gls-cli`

[![Build Status](https://travis-ci.org/general-language-syntax/gls-cli.svg?)](https://travis-ci.org/general-language-syntax/gls-cli)
[![NPM version](https://badge.fury.io/js/gls-cli.svg)](http://badge.fury.io/js/gls-cli)

Node CLI for [General Language Syntax (GLS)](https://github.com/general-language-syntax/GLS).

## Usage

```cmd
npm install general-language-syntax gls-cli ts-gls typescript gls-cli --global

gls --help
```

Pass any number of filenames and/or globs _(matched with [glob](http://npmjs.com/package/glob))_ to the CLI to convert those files to an output `-l`/`--language`.

Input files to convert from GLS to the output language must have a `.gls` extension.

`.ts` files may also be given with `-t`/`--tsconfig` to compile to `.gls` files before output language conversion.

<table>
    <thead>
        <th>Option</th>
        <th>Purpose</th>
    </thead>
    <tbody>
        <tr>
            <th><code>-e</code>/<code>--exclude</code></th>
            <td>Glob(s) of file(s) to exclude from conversion.</td>
        </tr>
        <tr>
            <th><code>-l</code>/<code>--language</code></th>
            <td>
                Output language to convert to.
                </br >
                <em><strong>(Required)</strong></em>
            </td>
        </tr>
        <tr>
            <th><code>-t</code>/<code>--tsconfig</code></th>
            <td>
                TypeScript project configuration file.
                <em>(Required if <code>.ts</code> file(s) given)</em>
            </td>
        </tr>
        <tr>
            <th><code>-v</code>/<code>--version</code></th>
            <td>Prints the GLS, GLS-CLI, and TS-GLS versions.</td>
        </tr>
    </tbody>
</table>

### Example Usage

To convert `file.gls` to `file.py`:

```cmd
gls --language Python file.gls
```

To convert `*.ts` to `*.gls`, then to `*.java`:

```cmd
gls --language Java --tsconfig ./tsconfig *.ts
```

_Requires Node >=8_

## Development

To build from scratch, install Node.js and run the following commands:

```
npm install
npm install general-language-syntax ts-gls typescript --no-save
npm run verify
```

Check `package.json` for the full list of commands.
To set up source file compiling in watch mode, use `tsc -p . -w`.
