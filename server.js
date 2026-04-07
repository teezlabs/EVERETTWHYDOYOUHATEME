const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { count: 0, lastClicked: null };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.use(express.static(__dirname));

app.get('/api/count', (req, res) => {
  res.json(loadData());
});

app.post('/api/click', (req, res) => {
  const data = loadData();
  data.count += 1;
  data.lastClicked = new Date().toISOString();
  saveData(data);
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
