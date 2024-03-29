'use strict';
const nodemailer = require('nodemailer');
// require('dotenv').config({path: '../docker.env'})
const transporter = nodemailer.createTransport({
    //host: process.env.INUSE === 'docker' ? '192.168.10.2' : '127.0.0.1',
    //port: process.env.INUSE === 'docker' ? '25' : '1025',
    host: '192.168.10.2',
    port: '25',
    auth: {
        user: 'project.1',
        pass: 'secret.1'
    }
});

exports.sendEmail = (from, to, subject, text) => {
    if (!from)
        throw new Error("from is missing");
    if (!to)
        throw new Error("to is missing");
    const mailOptions = { from, to, subject, text };
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(new Error(error.message));
                return;
            }
            resolve(info);
        });
    });
}

// Esporta funzioni Private solo per i test
if (process.env.NODE_ENV === 'test') {
    module.exports.transporter = transporter;
}
