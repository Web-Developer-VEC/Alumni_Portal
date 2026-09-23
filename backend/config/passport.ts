import "dotenv/config.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "dummy_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_google_client_secret",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      console.log("Google ID:", profile.id);
      console.log("Name:", profile.displayName);
      console.log("Email:", profile.emails?.[0]?.value);
      console.log("Photo:", profile.photos?.[0]?.value);

      // No database/model here
      return done(null, profile);
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

export default passport;