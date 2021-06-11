# Nodelint

WIP do not used it 

Nodelint is composed of 3 main workspace:
- **CLI** which is like it's name say, our cli
- **CORE** which contains all of our major running functions
- **POLICIES** which contains all policies which can be used inside nodelint

# Install

Run 
```
npm i -g
``` 
at the root of the project.

After that, you'll be able to use the nodelint cli with 
```
nodelint --flags
```

# Workspace

If you want to run specif command inside specific repo, you just need to use the flag **-w** 

for example adding dependency to cli would be

```
npm i lodash -w cli
```