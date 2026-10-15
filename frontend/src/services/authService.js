const USER_POOL_ID =
  import.meta.env.VITE_COGNITO_USER_POOL_ID;

const CLIENT_ID =
  import.meta.env.VITE_COGNITO_CLIENT_ID;


/* ======================================================
   CONFIG CHECK
====================================================== */

function checkCognitoConfig() {
  if (!USER_POOL_ID || !CLIENT_ID) {
    throw new Error(
      "Cognito configuration is missing."
    );
  }
}


/* ======================================================
   CREATE COGNITO USER
====================================================== */

async function createCognitoUser(username) {
  checkCognitoConfig();

  const {
    CognitoUser,
    CognitoUserPool,
  } = await import(
    "amazon-cognito-identity-js"
  );

  const userPool = new CognitoUserPool({
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
  });

  return new CognitoUser({
    Username: username,
    Pool: userPool,
  });
}


/* ======================================================
   LOGIN
====================================================== */

export async function loginUser(
  username,
  password
) {
  checkCognitoConfig();

  const {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
  } = await import(
    "amazon-cognito-identity-js"
  );

  const userPool = new CognitoUserPool({
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
  });

  const authenticationDetails =
    new AuthenticationDetails({
      Username: username,
      Password: password,
    });

  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  return new Promise(
    (resolve, reject) => {
      cognitoUser.authenticateUser(
        authenticationDetails,
        {
          onSuccess(session) {
            const accessToken =
              session
                .getAccessToken()
                .getJwtToken();

            const idToken =
              session
                .getIdToken()
                .getJwtToken();

            const refreshToken =
              session
                .getRefreshToken()
                .getToken();

            sessionStorage.setItem(
              "helpin_access_token",
              accessToken
            );

            sessionStorage.setItem(
              "helpin_id_token",
              idToken
            );

            sessionStorage.setItem(
              "helpin_refresh_token",
              refreshToken
            );

            sessionStorage.setItem(
              "helpin_username",
              username
            );

            resolve({
              username,
              accessToken,
              idToken,
            });
          },

          onFailure(error) {
            reject(error);
          },

          newPasswordRequired(
            userAttributes
          ) {
            resolve({
              challenge:
                "NEW_PASSWORD_REQUIRED",
              userAttributes,
              cognitoUser,
            });
          },
        }
      );
    }
  );
}


/* ======================================================
   REQUEST PASSWORD RESET CODE
====================================================== */

export async function requestPasswordReset(
  username
) {
  if (!username?.trim()) {
    throw new Error(
      "Username is required."
    );
  }

  const cognitoUser =
    await createCognitoUser(
      username.trim()
    );

  return new Promise(
    (resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess(data) {
          resolve(data || {});
        },

        onFailure(error) {
          reject(error);
        },

        inputVerificationCode(data) {
          resolve(data || {});
        },
      });
    }
  );
}


/* ======================================================
   CONFIRM PASSWORD RESET
====================================================== */

export async function confirmPasswordReset(
  username,
  verificationCode,
  newPassword
) {
  if (!username?.trim()) {
    throw new Error(
      "Username is required."
    );
  }

  if (!verificationCode?.trim()) {
    throw new Error(
      "Verification code is required."
    );
  }

  if (!newPassword) {
    throw new Error(
      "New password is required."
    );
  }

  const cognitoUser =
    await createCognitoUser(
      username.trim()
    );

  return new Promise(
    (resolve, reject) => {
      cognitoUser.confirmPassword(
        verificationCode.trim(),
        newPassword,
        {
          onSuccess() {
            resolve({
              success: true,
            });
          },

          onFailure(error) {
            reject(error);
          },
        }
      );
    }
  );
}


/* ======================================================
   LOGIN STATUS
====================================================== */

export function isLoggedIn() {
  return Boolean(
    sessionStorage.getItem(
      "helpin_access_token"
    )
  );
}


/* ======================================================
   ACCESS TOKEN
====================================================== */

export function getAccessToken() {
  return (
    sessionStorage.getItem(
      "helpin_access_token"
    ) || ""
  );
}


/* ======================================================
   ID TOKEN
====================================================== */

export function getIdToken() {
  return (
    sessionStorage.getItem(
      "helpin_id_token"
    ) || ""
  );
}


/* ======================================================
   USERNAME
====================================================== */

export function getLoggedInUsername() {
  return (
    sessionStorage.getItem(
      "helpin_username"
    ) || ""
  );
}


/* ======================================================
   LOGOUT
====================================================== */

export async function logoutUser() {
  try {
    checkCognitoConfig();

    const {
      CognitoUserPool,
    } = await import(
      "amazon-cognito-identity-js"
    );

    const userPool =
      new CognitoUserPool({
        UserPoolId: USER_POOL_ID,
        ClientId: CLIENT_ID,
      });

    const currentUser =
      userPool.getCurrentUser();

    if (currentUser) {
      currentUser.signOut();
    }
  } catch (error) {
    console.error(
      "COGNITO LOGOUT ERROR:",
      error
    );
  } finally {
    sessionStorage.removeItem(
      "helpin_access_token"
    );

    sessionStorage.removeItem(
      "helpin_id_token"
    );

    sessionStorage.removeItem(
      "helpin_refresh_token"
    );

    sessionStorage.removeItem(
      "helpin_username"
    );
  }
}