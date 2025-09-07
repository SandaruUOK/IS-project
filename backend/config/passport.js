const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const User = require('../models/User');

// Auth0 Strategy
passport.use(new Auth0Strategy({
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:5000/api/auth/callback'
}, async (accessToken, refreshToken, extraParams, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ auth0Id: profile.id });

    if (user) {
      // Update existing user with latest profile info
      user.name = profile.displayName || user.name;
      user.email = profile.emails?.[0]?.value || user.email;
      user.picture = profile.photos?.[0]?.value || user.picture;
      user.emailVerified = profile.emails?.[0]?.verified || false;
      user.lastLogin = new Date();
      
      await user.save();
      return done(null, user);
    } else {
      // Create new user
      const newUser = new User({
        auth0Id: profile.id,
        name: profile.displayName || 'Unknown User',
        email: profile.emails?.[0]?.value || '',
        username: profile.username || profile.emails?.[0]?.value?.split('@')[0] || 'user' + Date.now(),
        picture: profile.photos?.[0]?.value || '',
        emailVerified: profile.emails?.[0]?.verified || false,
        contactNumber: profile.phone_number || '',
        country: profile.country || '',
        role: 'user',
        isActive: true,
        lastLogin: new Date()
      });

      const savedUser = await newUser.save();
      return done(null, savedUser);
    }
  } catch (error) {
    console.error('Auth0 Strategy Error:', error);
    return done(error, null);
  }
}));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;