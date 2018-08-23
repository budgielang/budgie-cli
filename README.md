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
To set up source file compiling in watch mode, use `tsc -w`.

### Tests

Run `tsc -p test` to build tests, or `tsc -p test -w` to rebuild the files in watch mode.
Run `npm run test:run` to run tests. 

### Internals

When the CLI is called, the following code paths are used in order:

1. `Cli`
2. `Main`
3. `Runner`
4. `FileCoordinator`

#### `Cli`

Parses raw string arguments using `commander`.
If the args are valid, it calls to the `Main` method.

System dependencies such as the [`IFileSystem`](./src/files.ts) and globber may be dependency-injected to override the defaults.

See [`cli.ts`](./src/cli/cli.ts).

#### `Main`

Validates GLS settings, sets up a conversion `Runner`, and runs it.
There are two real behaviors here not covered by the `Cli`:

* Globbing file paths passed as glob args and reading them the file system.
* Validating the provided language is known by GLS.

See [`main.ts`](./src/main.ts).

#### `Runner`

Launches a `Coordinator`-managed conversion for each file, then reports the conversion results.

Uses an async queue to throttle the number of files that are attempted to be converted at once, as some conversions may need asynchronous operations.

See [`runner.ts`](./src/runner/runner.ts) and [`runnerFactory.ts`](./src/runner/runnerFactory.ts`).

#### `FileCoordinator`

The driving class behind taking in files and outputting converted `.gls` files.
Given a file passed to its `convertFile`, it will attempt to convert that file to a `.gls` file by:

1. Preprocessing the file if the file extension requires it
2. Converting the file using its `IConverter`

For example, if a `.ts` file is provided, it will attempt to convert it using [TS-GLS[(https://github.com/general-language-syntax/ts-gls) and return the generated `.gls` file path.
If a `.gls` file path is provided, it will do nothing and pass that path through.

See [`fileCoordinator.ts`](./src/fileCoordinator.ts) and [`fileCoordinatorFactory.ts`](./src/coordinatorFactory).

