const nodemailer = require('nodemailer');
const csv = require('csvtojson');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const csvFilePath = 'entreprisesBx.csv';
let recipients;
let slicedRecipients = [];
let text;

fs.readFile('lettreMotiv.txt', 'utf8', function (err, data) {
  if (err) throw err;
  text = data.toString();
});

csv()
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    recipients = jsonObj.map((o) => o.Emails);
  });

setTimeout(() => {
  // Couper le tableau recipients tous les 300 mails
  let size = 100; // La taille de chaque sous-tableau
  for (let i = 0; i < recipients.length; i += size) {
    // Créer un nouveau tableau à partir de la partie du tableau recipients allant de l'indice i à l'indice i + size - 1
    let slice = recipients.slice(i, i + size);
    // Ajouter le sous-tableau au tableau slicedRecipients
    slicedRecipients.push(slice);
  }

  slicedRecipients.forEach((mails) => {
    // configure le transporteur de messagerie
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.myMail,
        pass: process.env.myPassword,
      },
    });

    // configure le message
    let mailOptions = {
      from: process.env.myMail,
      bcc: mails, // liste des destinataires en copie cachée
      subject: 'Candidature spontanée', // objet
      text: text, // contenu du mail
      // pièces jointes:
      attachments: [
        {
          path: 'cv.pdf',
        },
        // {
        //   path: 'ex.pdf',
        // },
      ],
    };

    // envoi le message
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email envoyé: ' + info.response);
      }
    });
  });
}, 1000);
