# Login

Handles login / logout for a project that uses
- `express` server
- `pug` templating
- `mongoose` database
- `connect-flash` flash messages
- `bootstrap twitter` css

1. Install :

       npm install --save ./local_modules/login

2. Set the environment variables :
    * For Github auth : `GITHUB_KEY`, `GITHUB_SECRET`, `APP_URL`

3. Require the module :

       var login = require('login');
       login(app, mongoose);

4. Rendering :

    - Sets the template variable `user`  
        Check `views/header.pug` for an example of header
    - The views extend `views/layout.pug` placed in the root folder
    - You can use your own views by creating them in the root folder :
        - `auth/signin` : login
        - `auth/signup` : create an account
        - `auth/settings` : change the password (if local auth)
