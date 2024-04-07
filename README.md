# Farpatch UI

## Getting Started

Install the required packages:

```bash
npm install
```

## Usage

This repository installs things within the `node_modules` directory. To run commands, prefix them with `npx`. For example, to run the Typescript compiler, run `npx tsc`. Or to run Webpack, run `npx webpack`.

You will likely be using `npm run build` to build software, and `npm run start` to start interactive development.

## Proxying to a target

To proxy requests to /fp/ and /ws/ to a real target, set `PROXY_TARGET` to the IP address of the target. For example:

```bash
PROXY_TARGET=10.0.237.163 npm run start
```
