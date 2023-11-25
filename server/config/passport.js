'use strict'
const passport = require('passport');
const saml = require('passport-saml').Strategy;
const fs = require('fs');
const studentRepository = require('../repositories/StudentRepository');
const teacherRepository = require('../repositories/TeacherRepository');
const coSupervisorRepository = require('../repositories/CoSupervisorRepository');

const samlConfig = {
    entryPoint: "https://trial-4857036.okta.com/app/trial-4857036_seiigroup14_1/exk9if2411VvR5eOK697/sso/saml", // URL del punto di ingresso dell'IDP
    logoutUrl: "https://trial-4857036.okta.com/app/trial-4857036_seiigroup14_1/exk9if2411VvR5eOK697/slo/saml",
    logoutCallbackUrl: "http://localhost:3001/logout/callback",
    issuer: 'http://localhost:3001', // Nome del tuo SP
    callbackUrl: "/login/callback",
    protocol: 'http://',
    cert: fs.readFileSync('./IDP.pem', 'utf-8'),
    privateKey: fs.readFileSync('./SP_private.pem', 'utf-8'),
    signatureAlgorithm: 'sha256',
    options:{ failureRedirect: '/login', failureFlash: true }
};
const samlStrategy = new saml(samlConfig, (profile, done) => {
    let user, role;
    if(profile.nameID.includes('studenti') || profile.nameID.includes('studenti')){
        user = studentRepository.getStudentAndCDSByEmail(profile.nameID);
        role = "student";
    }
    else if(profile.nameID.includes('professori') || profile.nameID.includes('professori')){
        user = teacherRepository.findByEmail(profile.nameID);
        role = "teacher";
    }
    else if(profile.nameID.includes('supervisor') || profile.nameID.includes('supervisor')){
        user = coSupervisorRepository.findByEmail(profile.nameID);
        role = "supervisor";
    }
    if(role==='student')
        user = { id:user.id, name:user.name, surname:user.surname, role:role, nameID:profile.nameID, cds:user.cds }
    else
        user = { id:user.id, name:user.name, surname:user.surname, role:role, nameID:profile.nameID }
    console.log(profile)
    console.log(user)
    return done(null, user);
});
passport.use("samlStrategy", samlStrategy);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.logoutSaml = function(req, res) {
    if (req.user == null) {
        return res.redirect('/');
    }
    req.user.nameID = 'gianni.altobelli@studenti.polito.it'
    return samlStrategy.logout(req, function(err, uri) {
        return res.redirect(uri);
    });
};

passport.logoutSamlCallback = function(req, res){
    req.logout(()=> { res.end(); });
    res.redirect('http://localhost:5173/');
}

exports.metadata = ()=>{
    samlStrategy.generateServiceProviderMetadata('null',
        fs.readFileSync("./SP_cert.pem", "utf8")
    )
}

exports.passport = passport;