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
# Create a `VERSION` file
$ version init

# Increment a version
$ version patch
$ version minor
$ version major

# Explicitly set a specific version
$ version set 1.2.3

# Print out the current version if it exists
$ version get
```

## License

MIT
