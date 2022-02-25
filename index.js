const axios = require('axios');
const setCookie = require('set-cookie-parser');
const FormData = require('form-data');
const fs = require('fs');

let url = '';
let user = '';
let password = '';

let authCookies = '';
let installNonce = '';

exports.login = async function (login) {
  url = login.url;
  user = login.user;
  password = login.password;

  authCookies = await getAuthCookies(url, user, password);
  installNonce = await getInstallNonce(url, authCookies);

  return installNonce.length > 0;
};

exports.install = async function (pluginFile, options = {}) {
  const activateUrl = await uploadPlugin(pluginFile, authCookies, installNonce);

  if (options.activate === false) {
    return true;
  }

  return await activatePlugin(activateUrl, authCookies);
};

async function getAuthCookies(url, user, password) {
  const loginParams = new URLSearchParams();
  loginParams.append('log', user);
  loginParams.append('pwd', password);
  loginParams.append('wp-submit', 'login');
  loginParams.append('redirect_to', `${url}/wp-admin/`);
  loginParams.append('testcookie', 1)

  const loginResponse = await axios.post(`${url}/wp-login.php`, loginParams, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
  });

  const cookies = setCookie.parse(loginResponse.headers['set-cookie']);
  let authCookies = "";
  cookies.forEach(cookie => {
    authCookies += `${cookie.name}=${cookie.value};`;
  });

  return authCookies;
}

async function getInstallNonce(url, authCookies) {
  const pluginInstallResponse = await axios.get(`${url}/wp-admin/plugin-install.php`, {
    headers: {
      Cookie: authCookies
    }
  });

  let html = pluginInstallResponse.data;
  const nonceStart = html.search('name="_wpnonce" value="');
  html = html.substring(nonceStart + ('name="_wpnonce" value="').length);

  return html.substring(0, html.search('"'));
}

async function uploadPlugin(pluginFile, authCookies, nonce) {
  const form = new FormData();
  form.append('pluginzip', pluginFile);
  form.append('_wpnonce', nonce);
  form.append('install-plugin-submit', 'install');

  const uploadResponse = await axios.post(`${url}/wp-admin/update.php?action=upload-plugin`, form, {
    headers: {
      Cookie: authCookies,
      ...form.getHeaders(),
    },
  });

  if (uploadResponse.request.res.responseUrl !== `${url}/wp-admin/update.php?action=upload-plugin`) {
    return false;
  }

  let html = uploadResponse.data;
  const activateUrlStart = html.search('action=activate');
  html = html.substring(activateUrlStart);
  html = html.substring(0, html.search('"'));
  html = html.replace(/&amp;/g, '&');

  return `${url}/wp-admin/plugins.php?${html}`;
}

async function activatePlugin(activateUrl, authCookies) {
  const uploadResponse = await axios.get(activateUrl, {
    headers: {
      Cookie: authCookies,
    },
  });

  return uploadResponse.status === 200;
}
