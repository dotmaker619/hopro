<template>
  <div class="signup">
    <div class="content">
      <div class="brand">
        <a href="https://sensehawk.com/" target="_blank">
          <img class="image is-48x48 margin-auto" src="@/assets/logos/sensehawk-logo-small.svg" alt />
        </a>
      </div>
      <h2 class="is-semiBold-14-600-17 has-text-centered">
        Sign Up
        <span v-if="isOrgSignUpForm" class="is-size-4">for {{ this.form.organization.name }}</span>
      </h2>
      <!-- Form -->
      <div id="form-login" class="padding-20">
        <div class="control pb-10">
          <label class="is-medium-14-500-17 mb-5">Email</label>
          <input name="email" :disabled="isOrgSignUpForm" v-model="form.email" required type="email" class="input is-large mt-10" />
        </div>
        <div class="control pb-10">
          <label class="is-medium-14-500-17 mb-5">First name *</label>
          <input name="first_name" v-model="form.first_name" required class="input is-large mt-10" />
        </div>
        <div class="control pb-10">
          <label class="is-medium-14-500-17 mb-5">Last name *</label>
          <input name="last_name" v-model="form.last_name" required class="input is-large mt-10" />
        </div>
        <div class="control pb-10">
          <label class="is-medium-14-500-17 mb-5">Phone number</label>
          <input name="phone_number" v-model="form.phone_number" required type="tel" class="input is-large mt-10" />
          <!-- v-validate="{ required: true, regex: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/ }" -->
        </div>

        <div class="form-element form-submit mt-25">
          <button v-if="!saving" class="login sh-button button is-medium-16-500-19 is-fullwidth" @click="post_details()">Sign Up</button>
          <button v-if="saving" class="login button is-primary is-medium-16-500-19 is-fullwidth">
            Sign Up
            <i class="fas fa-circle-notch fa-spin"></i>
          </button>
          <router-link class="button is-fullwidth is-medium-16-500-19 mt-10" tag="button" :to="{ name: 'auth' }">Log In</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { authService } from "@/desktop/shared/services/";

  export default {
    data() {
      return {
        saving: false,
        signupService: null,
        isOrgSignUpForm: false,
        form: {
          first_name: null,
          last_name: null,
          email: null,
          username: null,
          organization: null,
          phone_number: null,
        },
      };
    },
    created() {
      if (this.$route.query.token && this.$route.query.userId) {
        this.get_details();
      } else {
        if (window.$cookies.get("access_token")) {
          this.$router.push({ name: "home" });
        } else {
          this.$router.push({ name: "auth" });
        }
      }
    },
    methods: {
      async get_details() {
        try {
          let details = await authService.get_enrollment_details({
            token: this.$route.query.token,
            userId: this.$route.query.userId,
          });

          this.isOrgSignUpForm = true;
          this.form = details;
        } catch (err) {
          // redirect it to login with notification
          console.log(err);
          this.$toast.show("User already exists with this email id", "", this.$store.state.izitoast_options.appSuccess);
          this.$router.push({ name: "auth" });
        }
      },
      async post_details() {
        try {
          let data = { ...this.form };
          // delete data.email;
          // console.log(data);
          let details = await authService.update_enrollment_details({
            token: this.$route.query.token,
            userId: this.$route.query.userId,
            body: data,
          });

          this.$toast.show("You're enrolled. Please check your email", "Success", this.$store.state.izitoast_options.appSuccess);
          this.$router.push({ name: "auth" });
        } catch (err) {
          // handle it with
          console.log(err);
        }
        // redirect it to login with notification "Pls check email."
      },
    },
  };
</script>

<style lang="scss" scoped>
  .signup {
    height: 100vh;

    .brand {
      padding: 3rem 9rem;
      position: relative;
      border-bottom: 1px solid #ddd;
      z-index: 10;

      transition: padding-bottom 0.4s;
    }
  }
  .content {
    width: 35rem;
    margin: 8rem auto;
    background-color: #fff;
    border-color: #ddd #ddd #d8d8d8;
    box-shadow: 0 2px 0 hsla(0, 0%, 68.6%, 0.12);
  }
</style>
