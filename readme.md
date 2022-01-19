# version

A simple semantic versioning tool — a lightweight replacement for `npm version`.

- Creates and manages a file called `VERSION` (storing the current version)
- Shells out to `git` to create commits and tags for version bumps

— the rest is up to you.

## Installation

```
$ deno install -n version -r -A https://deno.land/x/version/index.ts
```

Note: If you don't use `-A`, `--allow-read` and `--allow-write` are needed for
managing the `VERSION` file and `--allow-run` for Git actions.

## Usage

```
# Create a `VERSION` file (defaults to 1.0.0 if not specified)
$ version init
$ version init 0.1.0

# Increment a version
$ version patch
$ version minor
$ version major

# Explicitly set a specific version
$ version set 1.2.3

# Print out the current version if it exists
$ version get # 1.2.3

# Print out the future version, without making any changes
$ version get minor # 1.3.0
```

If you prefer not to install the CLI locally, just substitute
`$ version [whatever]` with:

```
$ deno run -A https://deno.land/x/version/index.ts [whatever]
```

## License

MIT
