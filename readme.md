# version

A simple semantic versioning tool — a lightweight replacement for `npm version`.

- Creates and manages a file called `VERSION` (storing the current version)
- Shells out to `git` to create commits and tags for version bumps

— the rest is up to you.

## Usage

```
# Create a `VERSION` file
$ deno run -A https://deno.land/x/version/index.ts init

# Increment a version
$ deno run -A https://deno.land/x/version/index.ts patch
$ deno run -A https://deno.land/x/version/index.ts minor
$ deno run -A https://deno.land/x/version/index.ts major

# Explicitly set a specific version
$ deno run -A https://deno.land/x/version/index.ts set 1.2.3
```

Note: If you don't use `-A`, `--allow-read` and `--allow-write` are needed for
managing the `VERSION` file and `--allow-run` for Git actions.

## License

MIT
