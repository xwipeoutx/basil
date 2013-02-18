@echo off
rmdir /S /Q package
mkdir package
mkdir package\lib
mkdir package\adapters
copy basil.js package
copy basil-browser-runner.js package
copy basil-browser-runner.css package
copy tests\base-test.html package
copy tests\lib\* package\lib
copy adapters\sinon-adapter.js package\adapters