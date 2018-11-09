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
            <th><code>-n</code>/<code>--namespace</code></th>
            <td>
                Namespace before path names, such as <code>"Gls"</code>.
            </td>
        </tr>
        <tr>
            <th><code>-p</code>/<code>--project</code></th>
            <td>
                Path to a <code>gls.json</code> project file to indicate to create project root-level exports and metadata files.
                Will default to a <code>gls.json</code> file detected in the current directory if one exists and <code>-p</code>/<code>--project</code> is not provided as <code>false</code>.
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
3. `Preprocessing`
4. `Conversions`
5. `Postprocessing`

#### `Cli`

Parses raw string arguments using `commander`.
If the args are valid, it calls to the `Main` method.

System dependencies such as the [`IFileSystem`](./src/files.ts) and globber may be dependency-injected to override the defaults.

See [`cli.ts`](./src/cli/cli.ts).

#### `Main`

Validates GLS settings, sets up the conversion's `Preprocess`, `Runner`, and `Postprocess`, then runs them in that order.
There are two real behaviors here not covered by the `Cli`:

* Globbing file paths passed as glob args and reading them the file system.
* Validating the provided language is known by GLS.

See [`main.ts`](./src/main.ts).

#### `Preprocessing`

If any files are passed in with native language extensions, namely `.ts` for TypeScript, they are converted here using that langauge's converter to their `.gls` equivalent.

For example, if a `.ts` file is provided, it will attempt to convert it using [TS-GLS](https://github.com/general-language-syntax/ts-gls) and return the generated `.gls` file path.
If a `.gls` file path is provided, it will do nothing and pass that path through.

Any language-specific files that are used as metadata files for that language, such as `src/index.js` for JavaScript, will be removed from the files list.

See [`preprocessFiles.ts`](./src/preprocessing/preprocessFiles.ts).

#### `Conversions`

Converts each `.gls` file to the output language(s).

`convertFiles` uses an async queue to throttle the number of files that are attempted to be converted via `convertFile` at once, as some conversions may need asynchronous operations.
Creates a `GlsConverter` per output language and has each file run through them.

See [`convertFiles.ts`](./src/conversions/convertFiles.ts) and [`convertFile.ts`](./src/conversions/convertFile).

#### `Postprocess`

Runs tasks on the converted `.gls` files as a project group after they've been successfully created.

If a `.gls.json` is not provided or detected, this does nothing.
Otherwise, it creates a root metadata file(s) as specified by each output language.
These are typically one or both of:

* Metadata file describing the output project.
* Exports file exporting publicaly exportable objects for languages that need them.

See [`postprocess.ts`](./src/postprocessing/postprocess.ts).
