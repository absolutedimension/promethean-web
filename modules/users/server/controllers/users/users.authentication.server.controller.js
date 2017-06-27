'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User');
  var async = require('async');
  var MachineDetail = mongoose.model('MachineDetail');

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

/**
 * Signup
 */
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // Init Variables
  var user = new User(req.body);
  var message = null;

  // Add missing user fields
  user.provider = 'local';
 // user.roles.push('admin');
  user.displayName = user.firstName + ' ' + user.lastName;
  user.username = user.email;

  // Then save the user
  user.save(function (err) {
    if (err) {
       console.log("Error in Signup :"+ errorHandler.getErrorMessage(err));
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });    
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;
      res.jsonp(user);
      // req.login(user, function (err) {
      //   if (err) {
      //     res.status(400).send(err);
      //   } else {
      //     res.json(user);
      //   }
      // });
    }
  });
};
exports.adminsignup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // Init Variables
  var user = new User(req.body);
  var message = null;

  // Add missing user fields
  user.provider = 'local';
  user.roles.push('admin');
  user.displayName = user.firstName + ' ' + user.lastName;
  user.username = user.email;

  // Then save the user
  user.save(function (err) {
    if (err) {
       console.log("Error in Signup :"+ errorHandler.getErrorMessage(err));
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });    
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;
      //res.jsonp(user);
      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  });
};

exports.signupUser = function(req , res , next){ 
  //var userEmails = req.body;
  var newUsers = req.body.newUsers;
  var userEmails = req.body.userEmails;
  var companyDetailUser = req.body.companyDetailUser;
  var message = null;
  console.log("incoming Object for sign up :"+newUsers.length,userEmails.length,JSON.stringify(companyDetailUser) );
  //Add missing user fields
  // newUser.provider = 'local';
  // newUser.displayName = newUser.firstName + ' ' + newUser.lastName;
  // newUser.username = newUser.email;

  var companyDetail = new MachineDetail();
  companyDetail.companyName = companyDetailUser.companyName;
  companyDetail.machineName = companyDetailUser.machineName;
  companyDetail.location = companyDetailUser.location;
  companyDetail.machineId = companyDetailUser.machineId;
  companyDetail.unitId = companyDetailUser.unitId;
  console.log("Machine detail :"+JSON.stringify(companyDetail));
  //saveNewUser(user,res);
  companyDetail.save(function(err){
      if (err) {
       console.log("Error in Company Detail :"+ errorHandler.getErrorMessage(err));
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });    
    }
    if(userEmails.length !== 0){
       updateExistingUsers(userEmails,companyDetail,res);
     }

  });
 //res.jsonp(user);
}

function saveNewUsers(newUsers,companyDetail,userEmails,res){
  console.log("New user before save :"+JSON.stringify(newUsers[0]));
  async.eachSeries(newUsers, function(person, asyncdone) {
    var newUser = new User(person);
    newUser.save(asyncdone);
      }, function(err,user) {
        if (err) {
          console.log("New User Save :"+ errorHandler.getErrorMessage(err));
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });    
        }
       console.log("New Users Created "+user)
        if(userEmails.length !== 0){
          updateNewUsers(userEmails,companyDetail,res);
        }
    });
}

function updateExistingUsers(userExistingEmails,companyDetail,res){
   // Then save the user
  console.log("Company Detail Before Updating Emails"+userExistingEmails[0],userExistingEmails[1]); 
  // User.update({'email':userExistingEmails[0]},{$set:{machineAllocated:companyDetail}},function(err,response){
  //     if (err) {
  //         console.log("Error in Updating Users :"+ errorHandler.getErrorMessage(err));
  //         return res.status(400).send({
  //           message: errorHandler.getErrorMessage(err)
  //       });    
  //     } 
  //     res.jsonp(response);
  // });



  User.update({username:{$in:userExistingEmails}},{$push:{machineAllocated:companyDetail}},{multi:true}).exec(function(err,response){
        if (err) {
          console.log("Error in Updating Users :"+ errorHandler.getErrorMessage(err));
            return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });    
      } 
      res.jsonp(response);
  });
  
}

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/authentication/signin');
};

/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
  return function (req, res, next) {
    // Set redirection path on session.
    // Do not redirect to a signin or signup page
    if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
      req.session.redirect_to = req.query.redirect_to;
    }
    // Authenticate
    passport.authenticate(strategy, scope)(req, res, next);
  };
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
  return function (req, res, next) {
    // Pop redirect URL from session
    var sessionRedirectURL = req.session.redirect_to;
    delete req.session.redirect_to;

    passport.authenticate(strategy, function (err, user, redirectURL) {
      if (err) {
        return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      }
      if (!user) {
        return res.redirect('/authentication/signin');
      }
      req.login(user, function (err) {
        if (err) {
          return res.redirect('/authentication/signin');
        }

        return res.redirect(redirectURL || sessionRedirectURL || '/');
      });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  if (!req.user) {
    // Define a search query fields
    var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    User.findOne(searchQuery, function (err, user) {
      if (err) {
        return done(err);
      } else {
        if (!user) {
          var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

          User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
            user = new User({
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              email: providerUserProfile.email,
              profileImageURL: providerUserProfile.profileImageURL,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData
            });

            // And save the user
            user.save(function (err) {
              return done(err, user);
            });
          });
        } else {
          return done(err, user);
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function (err) {
        return done(err, user, '/settings/accounts');
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
  var user = req.user;
  var provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'User is not authenticated'
    });
  } else if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err);
        } else {
          return res.json(user);
        }
      });
    }
  });
};

exports.addMachineExistingUsers = function(req,res,next){
    var existingUserArray = req.body;
    var machineObject = existingUserArray.machineAllocated;
    var exitingUser = existingUserArray.exitingUser;

    User.updateMany({_id:{$in:exitingUser}},{$addToSet:{machineAllocated:machineObject}}).exec(function(err,user){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!user) {
        return next(new Error('Failed to Update Machines in Users '));
      } 
      res.jsonp(user);
   });;
}

