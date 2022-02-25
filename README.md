# wp-plugin-installer
Experimental package for installing WordPress plug-ins with Node.js

## Example
### Logging in
Before you can install plug-ins you have to authenticate with the website. This is done using the async `login` function as such:
```
await installer.login({
  url: 'https://wordpress.local',
  user: 'username/email',
  password: 'password',
});
```

### Installing plug-ins
After authenticating you can install plug-ins with the async `install` function as such:
```
const pluginFile = fs.createReadStream('./plugin.zip');
await installer.install(pluginFile);
```
