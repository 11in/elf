In the course of using Elfin, you may find some development tasks feel like they could be automated.
Elf is here to...helf you.

If you find yourself needing a particular tool in the CLI, feel free to [submit a PR](https://github.com/11in/elf/pulls) or [open a feature request issue](https://github.com/11in/elf/issues/new).

[[toc]]

## Installation

While you can install this locally, by far the most useful install location is "global".

```shell
$ npm i -g @11in/elf
```

## Usage

Once elf is installed globally, you can run it like this:

```shell
$ elf
```

:::note
Most features of Elf require you to be "inside" of an Elfin project.
It will attempt to find the root of the project, so you can call it from anywhere inside the project, but from other locations it will just recurse up the file tree attempting to find an `elf.config.js`.
:::

## Documentation

For more in-depth documentation, please visit [the website](https://elfin.netlify.app/docs/elf/).
