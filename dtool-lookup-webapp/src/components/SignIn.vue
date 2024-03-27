<template>
  <div class="center-wrapper">
    <div
      class="container"
      :class="{ 'right-panel-active': rightPanelActive }"
      id="container"
    >
      <!-- Sign In Form -->
      <div class="form-container sign-in-container">
        <form @submit.stop.prevent="getToken">
          <!-- Logo Image -->
          <img
            :src="logoSrc"
            alt="Logo"
            style="max-width: 100px; display: block; margin: 0 auto 20px"
          />

          <h1 v-html="firstContainerTitle"></h1>

          <input
            v-model="username"
            type="username"
            placeholder="UserName"
            required
            :disabled="signInLoading"
          />
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            required
            :disabled="signInLoading"
          />
          <div v-if="signInFailed" class="alert alert-danger" role="alert">
            Invalid username or password
          </div>
          <button
            :disabled="signInLoading"
            class="btn btn-lg btn-primary btn-block"
          >
            Sign In
          </button>

          <div class="d-flex justify-content-center" v-if="signInLoading">
            <div class="spinner-border text-primary">
              <span class="sr-only">Authenticating...</span>
            </div>
          </div>
        </form>
      </div>

      <!-- second and third Container -->
      <div class="overlay-container">
        <div class="overlay">
          <div class="overlay-panel second-container">
            <h1 v-html="secondContainerTitle"></h1>

            <p v-html="secondContainerMessage"></p>
            <button class="ghost" @click="activateRightPanel">More Info</button>
          </div>

          <div class="overlay-panel third-container">
            <h1 v-html="thirdContainerHeading"></h1>

            <p v-html="thirdContainerMessage"></p>

            <button class="ghost" @click="deactivateRightPanel">
              Return to Sign In
            </button>
          </div>
        </div>
      </div>

      <!-- Fourth Container -->
      <div class="form-container fourth-container">
        <form action="#">
          <img
            :src="logoSrc"
            alt="Logo"
            style="max-width: 100px; display: block; margin: 0 auto 20px"
          />

          <h1 v-html="fourthContainerHeading"></h1>

          <p v-html="fourthContainerIntro"></p>
          <ul style="list-style-type: none; padding: 0">
            <li
              v-for="(resource, index) in fourthContainerResources"
              :key="index"
            >
              <a :href="resource.url" target="_blank">{{ resource.text }}</a>
            </li>
          </ul>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SignIn",
  data: function () {
    return {
      username: null,
      password: null,
      signInFailed: false,
      signInInfo: null,
      signInLoading: false,
      signInErrored: false,
      rightPanelActive: false,
      tokenGeneratorURL:
        process.env.VUE_APP_DTOOL_LOOKUP_SERVER_TOKEN_GENERATOR_URL,

      logoSrc: process.env.VUE_APP_LANDING_PAGE_ICON_PATH || "/icons/128x128/dtool_logo.png",

      firstContainerTitle:
        process.env.VUE_APP_FIRST_CONTAINER_TITLE || "Sign In",
      secondContainerTitle:
        process.env.VUE_APP_SECOND_CONTAINER_TITLE || "Welcome to Dtool",
      secondContainerMessage:
        process.env.VUE_APP_SECOND_CONTAINER_MESSAGE ||
        "Make your data more resilient, portable and easy to work with by packaging files & metadata into self-contained datasets.",
      thirdContainerHeading:
        process.env.VUE_APP_THIRD_CONTAINER_HEADING || "Access Your Account",
      thirdContainerMessage:
        process.env.VUE_APP_THIRD_CONTAINER_MESSAGE ||
        "To log in, use the default credentials: Username - <strong>testuser</strong>, Password - <strong>test_password</strong>.",
      fourthContainerHeading:
        process.env.VUE_APP_FOURTH_CONTAINER_HEADING ||
        "Supporting Documentation",
      fourthContainerIntro:
        process.env.VUE_APP_FOURTH_CONTAINER_INTRO ||
        "Please refer to the following resources for more information:",
      fourthContainerResources: process.env.VUE_APP_FOURTH_CONTAINER_RESOURCES
        ? JSON.parse(process.env.VUE_APP_FOURTH_CONTAINER_RESOURCES)
        : [
            {
              text: "dtool-lookup-webapp repository",
              url: "https://github.com/livMatS/dtool-lookup-webapp",
            },
            {
              text: "dserver REST API documentation",
              url: "https://demo.dtool.dev/lookup/doc/swagger",
            },
            {
              text: "dtool documentation",
              url: "https://dtool.readthedocs.io/",
            },
          ],
    };
  },
  computed: {
    loginCredentials: function () {
      return { username: this.username, password: this.password };
    },
  },
  methods: {
    signIn: function (token) {
      this.$emit("sign-in", token);
    },
    getToken: function () {
      console.log(process.env);
      this.signInLoading = true;
      this.$http
        .post(this.tokenGeneratorURL, this.loginCredentials, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          this.signInInfo = response.data;
          if ("token" in this.signInInfo) {
            this.signIn(this.signInInfo.token);
          } else {
            this.signInFailed = true;
          }
        })
        .catch((error) => {
          console.log(error);
          this.signInErrored = true;
        })
        .finally(() => (this.signInLoading = false));
    },
    activateRightPanel() {
      this.rightPanelActive = true;
    },
    deactivateRightPanel() {
      this.rightPanelActive = false;
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Montserrat:400,800");

* {
  box-sizing: border-box;
}

.center-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Full height of the viewport */
  background: #f6f5f7;
}

body {
  margin: 0; /* Ensure there's no default margin */
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  min-height: 100vh; /* Minimum height to take full viewport height */
  background: #f6f5f7;
  font-family: "Montserrat", sans-serif;
}

h1 {
  font-weight: bold;
  margin: 0;
}

h2 {
  text-align: center;
}

p {
  font-size: 18px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
}

span {
  font-size: 12px;
}

a {
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;
}

button {
  border-radius: 20px;
  border: 1px solid #95319b;
  background-color: #95319b;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
}

button:hover,
button:active,
button:focus {
  background-color: #8b319b; /* Background color for hover and active states */
  border-color: #8b319b; /* Border color for hover and active states */
}

button:active {
  transform: scale(0.95); /* Slight scale down to give a pressed effect */
}

button:focus {
  outline: none;
}

button.ghost {
  background-color: transparent;
  border-color: #ffffff;
}

form {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
}

input {
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
}

.container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 90vw;
  max-width: 800px;
  min-height: 530px;
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
}

.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}

.container.right-panel-active .sign-in-container {
  transform: translateX(100%);
}

.fourth-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}

.container.right-panel-active .fourth-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: show 0.6s;
}

@keyframes show {
  0%,
  49.99% {
    opacity: 0;
    z-index: 1;
  }

  50%,
  100% {
    opacity: 1;
    z-index: 5;
  }
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
}

.container.right-panel-active .overlay-container {
  transform: translateX(-100%);
}

.overlay {
  background: #cc1e67;
  background: -webkit-linear-gradient(
    135deg,
    #8b319b 0%,
    #95319b 50%,
    #b44acb 75%,
    #cc70e6 100%
  );
  background: linear-gradient(
    135deg,
    #8b319b 0%,
    #95319b 50%,
    #b44acb 75%,
    #cc70e6 100%
  );

  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay-panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.third-container {
  transform: translateX(-20%);
}

.container.right-panel-active .third-container {
  transform: translateX(0);
}

.second-container {
  right: 0;
  transform: translateX(0);
}

.container.right-panel-active .second-container {
  transform: translateX(20%);
}


@media (max-width: 668px) {
  .overlay-container,
  .fourth-container {
    display: none;
  }

  /* Ensure the sign-in container takes full available space */
  .sign-in-container {
    width: 100%;
    max-width: 100%;
    margin: 0 auto; /* Center the sign-in container */
  }
}

</style>
