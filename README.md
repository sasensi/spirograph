# Spirograph

[![Build Status](https://travis-ci.com/sasensi/spirograph.svg?branch=master)](https://travis-ci.com/sasensi/spirograph)

Simple spirograph project made in [TypeScript](https://www.typescriptlang.org/) with [Angular](https://angular.io/) and [PaperJS](http://paperjs.org/).  
Demo is available [here](https://sasensi.github.io/spirograph/).

## Develop
```
npm run start
```

## Build
```
npm run build
```

## Deploy to Github pages
```
npm run build:ghp
cd dist
git clone https://github.com/sasensi/spirograph.git
cd spirograph
git checkout --orphan gh-pages
git rm -rf .
cd ../
mv spirograph/.git .git
rm -rf spirograph
git add -A .
git commit -m "Deploy to Github page"
git push --force origin gh-pages
```
