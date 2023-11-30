let express = require("express");
let app = express();
let bodyParser = require("body-parser");
let fs = require("fs");

app.use(bodyParser.urlencoded({ extended: true }));
// Detta används för att serva statiska filer
app.use(express.static("public"));

// Läs befintlig data från users.json om filen finns
let users = [];
try {
  let data = fs.readFileSync("users.json", "utf8");
  if (data) {
    users = JSON.parse(data);
  }
} catch (err) {
  console.error("Fel vid läsning av filen:", err);
}
app.get("/", (req, res) => {
    let output = "";
    if (users && users.length > 0) {
      for (let i = users.length - 1; i >= 0; i--) {
        // Datum och tidstämpel
        let formattedTime = new Date(users[i].Time).toLocaleString('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });   
        output +=  `
          <div>
          <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>From:</strong> ${users[i].Name}</p>
            <p><strong>Email:</strong> ${users[i].Email || ""}</p>
            <p><strong>Homepage:</strong> ${users[i].Homepage || ""}</p>
            <p><strong>Telephone:</strong> ${users[i].Tel || ""}</p>
            <p><strong>Comment:</strong> ${users[i].Comment}</p>
            <hr> <!-- Lägg till ett horisontellt streck mellan varje användare -->
          </div>
        `;
      }
    }


  let html = fs.readFileSync(__dirname + "/index.html").toString();
  html = html.replace("GÄSTER", output);
  res.send(html);
});

// Route för att hantera POST-förfrågningar från formuläret
app.post("/submit", (req, res) => {
    let { Name, Email, From, Tel, Comment, Homepage } = req.body;
    let currentTime = new Date().toISOString();
    users.push({ Name, Email, Time: currentTime, From, Tel, Comment, Homepage });

  // Skriv användarinformationen till users.json-filen
  fs.writeFile("users.json", JSON.stringify(users), (err) => {
    if (err) {
      console.error("Fel vid skrivning till filen:", err);
      return res.status(500).send("Serverfel");
    }
    res.redirect("/");
  });
});

// Route för att visa alla användare
app.get("/users", (req, res) => {
  res.json(users);
});

// Starta servern på port 3000
let PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
