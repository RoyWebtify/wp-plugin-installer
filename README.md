# wp-plugin-installer
Experimental package for installing WordPress plug-ins with Node.js

## Installing
Using npm:
```
$ npm install --save wp-plugin-installer
```

## Example
### Loading
```javascript
const installer = require('wp-plugin-installer');
```

### Logging in
Before you can install plug-ins you have to authenticate with the website. This is done using the async `login` function:
```javascript
await installer.login({
  url: 'https://wordpress.local',
  user: 'username/email',
  password: 'password',
});
```

### Installing plug-ins
After authenticating you can install plug-ins with the async `install` function:
```javascript
const pluginFile = fs.createReadStream('./plugin.zip');
await installer.install(pluginFile);
```
The plug-in will be installed on the website and will be activated automatically. To change this behaviour you can use the `activate` option:
```javascript
const pluginFile = fs.createReadStream('./plugin.zip');
await installer.install(pluginFile, {
  activate: false,
});
```
