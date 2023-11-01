# version

A simple semantic versioning tool — a lightweight replacement for `npm version`.

- Creates and manages a file called `VERSION` or `VERSION.ts` (storing the
  current version)
- Shells out to `git` to create commits and tags for version bumps

— the rest is up to you.

## Installation

```
$ deno install -n version -r -A https://deno.land/x/version/index.ts
```

Note: If you don't use `-A`, `--allow-read` and `--allow-write` are needed for
managing the `VERSION` or `VERSION.ts` file and `--allow-run` for Git actions.

## Usage

```
# Create a `VERSION` file (defaults to 1.0.0 if not specified)
$ version init
$ version init 0.1.0

# Create a `VERSION.ts` file (defaults to 1.0.0 if not specified)
$ version init --ts
$ version init 0.1.0 --ts

# Increment a version
$ version patch
$ version minor
$ version major

# Explicitly set a specific version
$ version set 1.2.3

# Print out the current version if it exists
$ version get
```

If you prefer not to install the CLI locally, just substitute
`$ version [whatever]` with:

```
$ deno run -A https://deno.land/x/version/index.ts [whatever]
```

## Version file as code (`VERSION.ts`)

Reading the version in code is commonly used to aid debugging in logs. Reading
the standard `VERSION` file is possible using `Deno.readTextFile()`, but this
doesn't work if permissions are constrained or if using `deno compile`. This
utility allows for reading and writing to a `VERSION.ts` to accomodate for these
use cases better.

If initializing a new project, use `version init --ts`, optionally with a
version number before like `version init 0.1.0 --ts`.

If you already have a `VERSION` file and want to start using `VERSION.ts`,
rename the file to `VERSION.ts` and change the contents like follows:

```ts
export const VERSION = "1.0.0"; // Assuming the `VERSION` file contained `1.0.0`
```

The CLI will automatically use the `VERSION.ts` file if it exists.

## License

MIT
