# Farpatch UI

Farpatch UI is a user interface for the Farpatch project, allowing users to remotely use the various serial consoles and configure Farpatch from a web browser.

## Background

The Farpatch UI is a ReactJS project that runs as a single-page web app. The resulting binary is compressed to a few hundred kilobytes. Such applications are usually considered "large" for embedded systems, however this approach offers a number of benefits:

* The filesystem is compressed with gzip
* By creating a single-page application, the client caches the entire application in one request
* Components can be reused across the entire project
* We can use off-the-shelf widgets

## Installing and Building

To begin with, install Node.js. Then, install all dependencies for this project:

```bash
npx yarn install
```

To debug this project, run:

```bash
npx yarn run dev
```

This will open a web browser with hot-reload -- as you develop in this project, the browser will reload automatically.

To deploy, run:

```bash
npx yarn run build
```

This will create output files under `dist`, which you can deploy to a Farpatch device.
