const fs = require('fs');

function updateMessageFile(path, emergencyShort, careOptionsHeading) {
  let content = fs.readFileSync(path, 'utf8');
  const json = JSON.parse(content);
  if (!json.tools) {
    json.tools = {};
  }
  if (!json.tools.emergencyShort) {
    json.tools.emergencyShort = emergencyShort;
  }
  if (!json.tools.careOptionsHeading) {
    json.tools.careOptionsHeading = careOptionsHeading;
  }
  fs.writeFileSync(path, JSON.stringify(json, null, 2) + '\n', 'utf8');
}

updateMessageFile('src/messages/en.json', 'Call 911 if you have a life-threatening emergency.', 'Care Options');
updateMessageFile('src/messages/es.json', 'Llama al 911 si tienes una emergencia que ponga en peligro tu vida.', 'Opciones de Atención');
